-- 0024 — Promo 코드 admin 강제 회수 RPC.
--
-- 배경 (사용자 보고 2026-05-07):
--   "admin 사용자가 메인 웹 페이지에서 admin 페이지에서 프로모션 코드를
--    삭제할 시, 그 코드를 적용한 사용자의 유료 권한 박탈 가능한지 재검토."
--
-- 현재 동작 (0011):
--   AdminPage.handleDelete 가 redemption_codes row 만 DELETE.
--   premium_grants + profiles.is_premium 은 그대로 → 권한 박탈 X.
--
-- 의도된 동작:
--   admin 이 코드 삭제 시 그 코드를 redeem 한 사용자들 권한도 박탈.
--   단 실수 방지 위해 UI 가 "N명 영향" 사전 표시 + 명시적 confirm 후 진행.
--
-- 0023 과의 관계:
--   0023 = 시간 기반 자동 회수 (코드 expires_at 후 cron 정리)
--   0024 = admin 수동 강제 회수 (코드 삭제 시 사용자 권한 박탈)
--   의미 직교, 별도 마이그.
--
-- 두 RPC:
--   1) count_redemption_code_users(p_code) — 영향 받을 사용자 수 미리 조회 (회수 X)
--   2) revoke_redemption_code(p_code, p_delete_code) — 실제 회수 + 옵션으로 코드 삭제

begin;

-- ── 1. count_redemption_code_users ─────────────────────────────────────────
--
-- UI 가 "이 코드 사용자 N명 — 박탈하시겠어요?" 다이얼로그 띄우기 전 호출.
-- 회수 동작 X — 단순 count.
--
-- 반환:
--   ok                 - 호출 성공 여부
--   reason             - ok=false 시 사유 ('unauthenticated', 'not_admin', 'invalid_code')
--   active_grant_count - revoked_at=null 인 grant 수 (= 박탈 대상)
--   total_grant_count  - 전체 grant 수 (이미 revoke 된 것 포함, 참고용)

create or replace function public.count_redemption_code_users(p_code text)
returns table (ok boolean, reason text, active_grant_count integer, total_grant_count integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  is_admin boolean;
  normalized text;
  active_count integer;
  total_count integer;
begin
  -- 권한 검증
  if me is null then
    return query select false, 'unauthenticated', 0, 0; return;
  end if;

  select role = 'admin' into is_admin from public.profiles where id = me;
  if not coalesce(is_admin, false) then
    return query select false, 'not_admin', 0, 0; return;
  end if;

  -- 입력 검증
  if p_code is null or length(trim(p_code)) = 0 then
    return query select false, 'invalid_code', 0, 0; return;
  end if;

  normalized := upper(trim(p_code));

  -- 활성 + 전체 grant 카운트 (한 쿼리)
  select
    coalesce(count(*) filter (where revoked_at is null), 0),
    coalesce(count(*), 0)
  into active_count, total_count
  from public.premium_grants
  where source = 'redemption_code' and source_ref = normalized;

  return query select true, null::text, active_count::integer, total_count::integer;
end;
$$;

revoke execute on function public.count_redemption_code_users(text) from public, anon;
grant execute on function public.count_redemption_code_users(text) to authenticated;

-- ── 2. revoke_redemption_code ──────────────────────────────────────────────
--
-- 코드의 모든 활성 grant 를 revoke + 활성 grant 더 없는 사용자는 is_premium=false.
-- 옵션으로 코드 row 자체도 DELETE.
--
-- 트랜잭션 안에서 실행 — 부분 상태 발생 X.
-- idempotent — 이미 revoke 된 코드 재호출 시 revoked_count=0 graceful 반환.
--
-- 반환:
--   ok                - 호출 성공
--   reason            - ok=false 시 사유
--   revoked_count     - 실제로 revoked 된 grant 수
--   profiles_demoted  - is_premium=false 로 회수된 사용자 수
--   code_deleted      - 코드 row 삭제 여부 (p_delete_code=true 였고 행 존재했음)
--
-- 정합성 보장:
--   - paid grant / admin_grant / comp 등 다른 source 의 활성 grant 가 있는
--     사용자는 is_premium 유지 (paid 권한 보호)
--   - expires_at > now() 인 활성 grant 가 있으면 is_premium 유지
--   - 위 둘 다 없을 때만 demote

create or replace function public.revoke_redemption_code(
  p_code text,
  p_delete_code boolean default true
)
returns table (
  ok boolean,
  reason text,
  revoked_count integer,
  profiles_demoted integer,
  code_deleted boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  is_admin boolean;
  normalized text;
  affected_user_ids uuid[];
  revoked integer := 0;
  demoted integer := 0;
  deleted boolean := false;
begin
  -- 권한 검증
  if me is null then
    return query select false, 'unauthenticated', 0, 0, false; return;
  end if;

  select role = 'admin' into is_admin from public.profiles where id = me;
  if not coalesce(is_admin, false) then
    return query select false, 'not_admin', 0, 0, false; return;
  end if;

  -- 입력 검증
  if p_code is null or length(trim(p_code)) = 0 then
    return query select false, 'invalid_code', 0, 0, false; return;
  end if;

  normalized := upper(trim(p_code));

  -- 1) 영향받을 user_ids 사전 수집 (UPDATE 후엔 못 찾음)
  --    distinct — 한 사용자가 같은 코드 여러 번 redeem 한 케이스 방지
  --    (현재 0011 RPC 가 idempotent 라 이런 케이스 없지만 방어)
  select coalesce(array_agg(distinct user_id), array[]::uuid[]) into affected_user_ids
  from public.premium_grants
  where source = 'redemption_code'
    and source_ref = normalized
    and revoked_at is null;

  -- 2) 활성 grant 모두 revoke
  update public.premium_grants
  set revoked_at = now()
  where source = 'redemption_code'
    and source_ref = normalized
    and revoked_at is null;

  get diagnostics revoked = row_count;

  -- 3) 영향받은 사용자 중 활성 grant 가 더 없으면 profile demote
  --    조건: revoked_at is null AND (expires_at is null OR expires_at > now())
  --    = "현재 유효한 grant" 가 하나도 없는 사용자만 demote
  if array_length(affected_user_ids, 1) > 0 then
    update public.profiles p
    set is_premium = false, premium_until = null
    where p.id = any(affected_user_ids)
      and p.is_premium = true
      and not exists (
        select 1 from public.premium_grants pg
        where pg.user_id = p.id
          and pg.revoked_at is null
          and (pg.expires_at is null or pg.expires_at > now())
      );

    get diagnostics demoted = row_count;
  end if;

  -- 4) 코드 row 자체 삭제 (옵션)
  if p_delete_code then
    delete from public.redemption_codes where code = normalized;
    -- found 는 직전 DML 결과 — DELETE 가 1건 이상 지웠으면 true
    if found then
      deleted := true;
    end if;
  end if;

  return query select true, null::text, revoked, demoted, deleted;
end;
$$;

revoke execute on function public.revoke_redemption_code(text, boolean) from public, anon;
grant execute on function public.revoke_redemption_code(text, boolean) to authenticated;

commit;

-- ── 검증 쿼리 (수동 실행) ───────────────────────────────────────────────
--
-- 1) admin 으로 count 미리 조회:
--    select * from count_redemption_code_users('QDP-PROMO-ABCD1234');
--    → ok=true, active_grant_count=N, total_grant_count=M
--
-- 2) 회수 + 코드 삭제:
--    select * from revoke_redemption_code('QDP-PROMO-ABCD1234', true);
--    → ok=true, revoked_count=N, profiles_demoted=K, code_deleted=true
--
-- 3) 회수만 (코드는 보존):
--    select * from revoke_redemption_code('QDP-PROMO-ABCD1234', false);
--    → ok=true, code_deleted=false
--
-- 4) admin 아닌 사용자가 호출:
--    → ok=false, reason='not_admin'
--
-- 5) 멱등 검증 (재호출):
--    select * from revoke_redemption_code('QDP-PROMO-ABCD1234', true);
--    → ok=true, revoked_count=0, profiles_demoted=0, code_deleted=false (이미 삭제됨)
--
-- 6) paid grant 있는 사용자 보호:
--    같은 user 가 paid + redemption_code 둘 다 받았으면, redemption_code 회수 후에도
--    paid 가 활성이면 is_premium 유지. profiles_demoted 카운트에 안 들어감.

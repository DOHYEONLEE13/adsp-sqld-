-- 0023 — Promo 코드 만료 시 권한 자동 회수.
--
-- 배경 (2026-05-07 사용자 보고):
--   "프로모션 코드 유효기간이 지나도 프로모션 코드를 적용한 사용자의 유료 권한 안 풀림."
--
-- 현재 동작 (0011 redeem_code RPC):
--   - redemption_codes.expires_at 은 "코드 자체 만료" — 그 시점 이후엔 새로 입력 거절
--   - 이미 redeem 된 사용자는 premium_grants.expires_at = null (영구) +
--     profiles.premium_until = null (영구) 로 들어감 → 코드 만료해도 권한 유지
--
-- 사용자 의도:
--   - "코드 만료일" = "권한 만료일" — 그 시점 이후 권한 자동 회수
--
-- 의미 재정의:
--   - redemption_codes.expires_at 가 null → 영구 권한 부여
--   - redemption_codes.expires_at 이 timestamptz → 그 시점까지만 premium
--   - 코드 만료 후엔 새 입력 거절 + 기존 grant 도 만료 (0008 cron 이 자동 회수)
--
-- 이 마이그레이션:
--   1) redeem_code RPC 갱신 — grant.expires_at + profile.premium_until 을 코드.expires_at 으로 셋팅
--   2) backfill — 이미 redeem 된 grant 중 코드가 만료됐으면 grant.expires_at 갱신 +
--      활성 grant 없는 사용자는 즉시 is_premium=false 회수
--   3) 0008 cron 이 다음 03 UTC 실행 시 자동 정리 (이미 작동 중)

begin;

-- ── 1. redeem_code RPC 갱신 ───────────────────────────────────────────────

create or replace function public.redeem_code(p_code text)
returns table (ok boolean, reason text, granted_tier text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec public.redemption_codes;
  me uuid := (select auth.uid());
  normalized text;
begin
  if me is null then
    return query select false, 'unauthenticated', null::text; return;
  end if;

  normalized := upper(trim(p_code));

  select * into rec from public.redemption_codes where code = normalized for update;

  if rec.code is null then
    return query select false, 'not_found', null::text; return;
  end if;

  if rec.expires_at is not null and rec.expires_at < now() then
    return query select false, 'expired', null::text; return;
  end if;

  -- 본인이 이미 같은 코드를 redeem 했으면 멱등 (idempotent)
  if exists (
    select 1 from public.premium_grants
    where user_id = me
      and source = 'redemption_code'
      and source_ref = rec.code
      and revoked_at is null
  ) then
    return query select true, 'already_redeemed', rec.granted_tier; return;
  end if;

  if rec.uses >= rec.max_uses then
    return query select false, 'depleted', null::text; return;
  end if;

  -- 적용
  update public.redemption_codes set uses = uses + 1 where code = rec.code;

  -- 2026-05-07 — grant.expires_at 을 코드 expires_at 그대로 mirror.
  -- null = 영구. timestamptz = 그 시점까지만 premium. 0008 cron 이 자동 회수.
  insert into public.premium_grants (user_id, source, source_ref, expires_at, note)
  values (me, 'redemption_code', rec.code,
          rec.expires_at,
          rec.note);

  -- profile.premium_until 도 동일하게 mirror.
  -- 단 이미 더 긴 premium 이 있으면 (예: 결제로 이미 30일 남음) 그건 보존 — coalesce + greatest.
  update public.profiles
     set is_premium = true,
         premium_until = case
           -- 코드가 영구 (expires_at=null) 면 무조건 영구
           when rec.expires_at is null then null
           -- 기존 premium_until 이 영구 (null) 면 그대로 영구 보존
           when premium_until is null and is_premium = true then null
           -- 기존이 코드 만료보다 늦으면 기존 보존
           when premium_until > rec.expires_at then premium_until
           -- 그 외엔 코드 만료로 갱신 (연장)
           else rec.expires_at
         end
   where id = me;

  return query select true, null::text, rec.granted_tier;
end;
$$;

revoke execute on function public.redeem_code(text) from public, anon;
grant execute on function public.redeem_code(text) to authenticated;

-- ── 2. Backfill — 이미 redeem 된 grant 중 코드가 만료됐으면 정리 ─────────

-- (a) 만료된 코드의 활성 grant 의 expires_at 을 코드 expires_at 으로 갱신.
--     0008 cron 이 다음 실행 시 자동 회수 (premium_until < now()).
update public.premium_grants pg
   set expires_at = rc.expires_at
  from public.redemption_codes rc
 where pg.source = 'redemption_code'
   and pg.source_ref = rc.code
   and pg.revoked_at is null
   and pg.expires_at is null               -- 이전 코드의 영구 grant 만 대상
   and rc.expires_at is not null;          -- 코드 만료일이 있는 케이스만

-- (b) profile.premium_until 도 갱신 — 활성 grant 의 max(expires_at) 으로.
--     활성 grant 가 모두 expires_at != null 이면 가장 늦은 만료일,
--     하나라도 null (영구) 이 있으면 null (영구) 유지.
update public.profiles p
   set premium_until = sub.next_until
  from (
    select user_id,
           case
             when bool_or(expires_at is null) then null     -- 하나라도 영구 grant 면 영구
             else max(expires_at)
           end as next_until
      from public.premium_grants
     where source = 'redemption_code'
       and revoked_at is null
     group by user_id
  ) sub
 where p.id = sub.user_id
   and p.is_premium = true;

-- (c) 이미 만료된 코드의 grant 가 즉시 회수돼야 하면 0008 cron 이 처리.
--     단 즉시 정리하고 싶으면 아래 한 줄 (선택 — 운영자 결정):
update public.profiles
   set is_premium = false, premium_until = null
 where is_premium = true
   and premium_until is not null
   and premium_until < now();

commit;

-- ── 검증 쿼리 (수동 실행) ─────────────────────────────────────────────────
--
-- 1) redeem 후 grant 만료일 확인:
--    select user_id, source_ref, expires_at, revoked_at
--      from premium_grants
--     where source = 'redemption_code'
--     order by granted_at desc;
--
-- 2) 만료된 코드 grant 가 모두 회수됐는지:
--    select p.tag, p.is_premium, p.premium_until, count(pg.*) as active_grants
--      from profiles p
--      left join premium_grants pg on pg.user_id = p.id and pg.revoked_at is null
--                                  and (pg.expires_at is null or pg.expires_at > now())
--     where p.is_premium = true
--     group by p.tag, p.is_premium, p.premium_until
--     having count(pg.*) = 0;  -- 활성 grant 없는데 is_premium=true 인 사용자 (있으면 안 됨)
--
-- 3) 0008 cron 작동 확인:
--    select * from cron.job where jobname = 'expire-premium';
--    select * from cron.job_run_details where jobid = (select jobid from cron.job where jobname = 'expire-premium')
--     order by start_time desc limit 5;

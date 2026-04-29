-- 0011 — Redemption Code + Premium Grant 시스템.
--
-- 목적: 지인·베타테스터·이벤트 당첨자에게 "평생 무료" 또는 일정 기간 premium
-- 부여를 코드 한 줄로 처리. admin 이 코드 발급 → 사용자가 #/redeem 에서 입력
-- → RPC 검증 → premium 부여.
--
-- 왜 별도 grant 테이블인가:
--   - paid (Toss) / redemption_code / admin_grant / comp 모두 같은 모델로 추적
--   - 누가 어떻게 premium 받았는지 분석 → 매출 보고에 정확함
--   - 회수 (revoke) 가 단순 — premium_grants.revoked_at 만 채우고 cron 이 정리
--
-- premium_until=null 의미: 영구 (이미 0008 cron 이 null 은 만료 처리 안 함).

begin;

-- ── 1. redemption_codes — 발급된 코드 마스터 ───────────────────────────────
create table if not exists public.redemption_codes (
  code text primary key,                      -- "QDP-FRIEND-AB12CD"
  granted_tier text not null default 'lifetime'
    check (granted_tier in ('lifetime')),     -- 향후 'monthly','3months' 확장
  max_uses integer not null default 1
    check (max_uses >= 1),
  uses integer not null default 0,
  note text,                                  -- "김철수 친구용" 메모
  created_at timestamptz not null default now(),
  expires_at timestamptz                      -- 코드 자체 만료 (옵션, null=만료없음)
);

-- ── 2. premium_grants — 모든 premium 부여 이력 통합 ───────────────────────
create table if not exists public.premium_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  source text not null
    check (source in ('paid','redemption_code','admin_grant','comp')),
  source_ref text,                            -- 코드값 / Toss orderId / admin email
  granted_at timestamptz not null default now(),
  expires_at timestamptz,                     -- null = lifetime
  revoked_at timestamptz,                     -- null = 활성
  note text
);

create index if not exists premium_grants_user_idx on public.premium_grants(user_id);
create index if not exists premium_grants_active_idx on public.premium_grants(user_id)
  where revoked_at is null;

-- ── 3. RLS ─────────────────────────────────────────────────────────────────
alter table public.redemption_codes enable row level security;
alter table public.premium_grants    enable row level security;

-- redemption_codes: admin 만 read/write. 일반 사용자는 RPC redeem_code 만 통과.
create policy redemption_codes_admin_all on public.redemption_codes
  for all
  to authenticated
  using (
    exists (select 1 from public.profiles me
            where me.id = (select auth.uid()) and me.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles me
            where me.id = (select auth.uid()) and me.role = 'admin')
  );

-- premium_grants: 본인 read 가능 ("내가 어떻게 premium 받았는지" 표시 용)
create policy premium_grants_self_read on public.premium_grants
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- admin 은 전체 read
create policy premium_grants_admin_read on public.premium_grants
  for select
  to authenticated
  using (
    exists (select 1 from public.profiles me
            where me.id = (select auth.uid()) and me.role = 'admin')
  );

-- INSERT/UPDATE/DELETE 는 RPC (SECURITY DEFINER) 만 통과.

-- ── 4. RPC: redeem_code(p_code text) — 코드 사용 ──────────────────────────
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

  insert into public.premium_grants (user_id, source, source_ref, expires_at, note)
  values (me, 'redemption_code', rec.code,
          case when rec.granted_tier = 'lifetime' then null else now() end, -- 향후 tier 확장 자리
          rec.note);

  -- 프로필 premium 활성화 — premium_until=null 이면 cron 0008 이 만료 X = 영구
  update public.profiles
     set is_premium = true,
         premium_until = null
   where id = me;

  return query select true, null::text, rec.granted_tier;
end;
$$;

revoke execute on function public.redeem_code(text) from public, anon;
grant execute on function public.redeem_code(text) to authenticated;

-- ── 5. RPC: revoke_premium_grant(p_grant_id uuid) — 관리자 회수 ───────────
create or replace function public.revoke_premium_grant(p_grant_id uuid)
returns table (ok boolean, reason text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  is_admin boolean;
  target public.premium_grants;
begin
  if me is null then return query select false, 'unauthenticated'; return; end if;
  select role = 'admin' into is_admin from public.profiles where id = me;
  if not coalesce(is_admin, false) then
    return query select false, 'not_admin'; return;
  end if;

  select * into target from public.premium_grants where id = p_grant_id for update;
  if target.id is null then
    return query select false, 'not_found'; return;
  end if;
  if target.revoked_at is not null then
    return query select true, 'already_revoked'; return;
  end if;

  update public.premium_grants set revoked_at = now() where id = p_grant_id;

  -- 활성 grant 가 더 이상 없으면 profile 의 premium 도 회수
  if not exists (
    select 1 from public.premium_grants
    where user_id = target.user_id
      and revoked_at is null
      and (expires_at is null or expires_at > now())
  ) then
    update public.profiles
       set is_premium = false, premium_until = null
     where id = target.user_id;
  end if;

  return query select true, null::text;
end;
$$;

revoke execute on function public.revoke_premium_grant(uuid) from public, anon;
grant execute on function public.revoke_premium_grant(uuid) to authenticated;

commit;

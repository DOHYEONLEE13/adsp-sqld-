-- 0015 — Admin RLS 정책 무한 재귀 결정적 수정.
--
-- ⚠️ 사고 컨텍스트 (2026-04-30):
-- 다기기 동기화가 production 에서 0% 동작 → 사용자 보고 "단 하나도 동작 안 함".
-- Supabase API 로그가 profiles / sessions / question_stats / pass_stamps /
-- friendships(with profile embed) 호출에 대해 매번 500 Internal Server Error.
--
-- 결정적 증거 (postgres 자체 에러):
--   ERROR: 42P17: infinite recursion detected in policy for relation "profiles"
--
-- 원인:
-- 0009 / 0011 / 0012 / 0013 의 모든 *_admin_read 정책이 다음 패턴:
--   USING (
--     EXISTS (SELECT 1 FROM public.profiles me
--             WHERE me.id = (select auth.uid()) AND me.role = 'admin')
--   )
-- 정책 본체가 같은 테이블 (profiles) 을 SELECT → RLS 가 다시 평가 →
-- profiles_admin_read 가 다시 SELECT → 무한 루프 → PostgreSQL 이 거부.
--
-- 영향 범위 — admin 정책이 profiles 를 참조하는 모든 테이블에 cascade:
--   profiles, sessions, question_stats, pass_stamps, premium_grants,
--   payments, refund_requests, redemption_codes
-- = 동기화에 필요한 거의 모든 테이블.
--
-- 수정:
-- SECURITY DEFINER 함수 is_current_user_admin() 가 RLS 우회로 admin 여부 조회.
-- 모든 admin_* 정책을 이 함수 호출로 교체.
-- 동작 변화는 0 — admin 권한 의미는 동일, 단지 self-referential SELECT 가
-- security definer 함수 안에 격리되므로 RLS 평가가 재귀하지 않음.
--
-- 회고: docs/postmortem-phase3-false-completion.md (다음 갱신에 본 사고 추가).

begin;

-- ── 1. SECURITY DEFINER 헬퍼 ─────────────────────────────────────────────
-- security definer + search_path '' → RLS 우회 + SQL 인젝션 방어.
-- stable → 한 트랜잭션 내에선 캐시 가능 (성능 무시 가능 수준).

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select role = 'admin'
       from public.profiles
      where id = (select auth.uid())),
    false
  );
$$;

revoke execute on function public.is_current_user_admin() from public, anon;
grant  execute on function public.is_current_user_admin() to authenticated;

-- ── 2. 모든 admin_* 정책 재생성 ─────────────────────────────────────────
-- 9 개 정책 — 0009 (3) + 0011 (2) + 0012 (3) + 0013 (1)

-- profiles (0009) — ★ 재귀의 진원지
drop policy if exists profiles_admin_read on public.profiles;
create policy profiles_admin_read on public.profiles
  for select
  to authenticated
  using (public.is_current_user_admin());

-- sessions (0009)
drop policy if exists sessions_admin_read on public.sessions;
create policy sessions_admin_read on public.sessions
  for select
  to authenticated
  using (public.is_current_user_admin());

-- question_stats (0009)
drop policy if exists question_stats_admin_read on public.question_stats;
create policy question_stats_admin_read on public.question_stats
  for select
  to authenticated
  using (public.is_current_user_admin());

-- redemption_codes (0011) — ALL 정책. using + with check 둘 다.
drop policy if exists redemption_codes_admin_all on public.redemption_codes;
create policy redemption_codes_admin_all on public.redemption_codes
  for all
  to authenticated
  using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

-- premium_grants (0011)
drop policy if exists premium_grants_admin_read on public.premium_grants;
create policy premium_grants_admin_read on public.premium_grants
  for select
  to authenticated
  using (public.is_current_user_admin());

-- payments (0012)
drop policy if exists payments_admin_read on public.payments;
create policy payments_admin_read on public.payments
  for select
  to authenticated
  using (public.is_current_user_admin());

-- refund_requests (0012) — read + update
drop policy if exists refund_requests_admin_read on public.refund_requests;
create policy refund_requests_admin_read on public.refund_requests
  for select
  to authenticated
  using (public.is_current_user_admin());

drop policy if exists refund_requests_admin_update on public.refund_requests;
create policy refund_requests_admin_update on public.refund_requests
  for update
  to authenticated
  using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

-- pass_stamps (0013)
drop policy if exists pass_stamps_admin_read on public.pass_stamps;
create policy pass_stamps_admin_read on public.pass_stamps
  for select
  to authenticated
  using (public.is_current_user_admin());

commit;

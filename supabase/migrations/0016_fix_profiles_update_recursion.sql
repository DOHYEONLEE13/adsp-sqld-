-- 0016 — profiles UPDATE 정책 무한 재귀 수정 + 컬럼 단위 권한 분리.
--
-- ⚠️ 사고 컨텍스트 (2026-04-30, 0015 후속):
-- 사용자: "이름을 수정했을 때 이름이 옳게 저장이 안됨" 보고.
-- 0015 로 admin SELECT 재귀는 풀렸지만, profiles_update_self 의 with_check 가
-- profiles 를 자기 참조하는 또다른 재귀를 일으켜 모든 UPDATE 가 거부됨.
--
-- 결정적 증거 (DB 직접 시뮬레이션):
--   UPDATE public.profiles SET display_name = 'TEST' WHERE id = auth.uid()
--   → ERROR 42P17: infinite recursion detected in policy for relation "profiles"
--
-- 원인:
-- 0002_rls.sql 의 profiles_update_self 가 보호 컬럼 (tag, total_xp, level, ...)
-- 변조 방지 목적으로 with_check 안에 self-SELECT subquery 다수 사용:
--   AND tag = (SELECT tag FROM profiles WHERE id = auth.uid())
--   AND total_xp = (SELECT total_xp FROM profiles WHERE id = auth.uid())
--   ... (7개 컬럼)
-- 이 SELECT 들이 profiles 의 RLS 를 다시 평가 → 0015 으로 read 재귀는 풀렸으나
-- with_check 평가 자체가 다시 self-SELECT → 무한 재귀.
--
-- 사용자 가시 증상:
-- 1) 이름 입력 → setDisplayName 이 localStorage 즉시 갱신 + notify (보임)
-- 2) fire-and-forget pushToSupabase({ display_name }) → 500 RLS 거부 → try/catch 가 삼킴
-- 3) 페이지 새로고침/visibilitychange → pullFromSupabase 가 서버의 옛 값 fetch
-- 4) localStorage 가 옛 값으로 덮어쓰임 → "저장이 안됨" 으로 사용자에게 보임
--
-- 수정 — 두 단계:
-- 1) RLS 정책 단순화 — with_check 에서 self-SELECT 모두 제거. 본인 row 만 보장.
-- 2) 보호 컬럼은 GRANT (column-level) 로 분리 — authenticated 는 display_name,
--    avatar_pose 만 update 가능. tag/total_xp/level/streak_days/energy_count/
--    is_premium/premium_until/role 은 server-side RPC (SECURITY DEFINER) 만.

begin;

-- ── 1. RLS 정책 단순화 ─────────────────────────────────────────────────
drop policy if exists profiles_update_self on public.profiles;

create policy profiles_update_self on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ── 2. 컬럼 단위 권한 — 보호 컬럼은 SECURITY DEFINER RPC 만 ─────────────
-- 우선 모든 update 권한 회수 후 user-mutable 컬럼만 grant.
-- SECURITY DEFINER 함수는 owner (postgres) 권한으로 실행하므로 모든 컬럼 update 가능.
revoke update on public.profiles from authenticated;
grant  update (display_name, avatar_pose) on public.profiles to authenticated;

-- 향후 새 user-mutable 컬럼이 추가되면 여기에 grant 추가.
-- (예시 — 나중에 bio/timezone 등이 생기면)
-- grant update (bio, timezone) on public.profiles to authenticated;

commit;

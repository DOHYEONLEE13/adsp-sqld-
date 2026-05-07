-- 0028 — 0016 이후 추가된 user-mutable 컬럼들에 UPDATE grant 복원.
--
-- ⚠️ 사고 (2026-05-08) — 진짜 root cause:
--   사용자 보고 "캐릭터 변경 안 됨", "XP 50 모았는데 구매 안 됨".
--   진단 결과 모든 사용자 server lesson_xp = 0, total_xp = 0, sessions = 0.
--   4 번의 race fix (waitForSession 등) 가 효과 없었음.
--
--   진짜 원인 = column-level grant 누락:
--   0016 마이그가 authenticated UPDATE 를 (display_name, avatar_pose) 만 허용.
--   그 후 추가된 user-mutable 컬럼들이 grant 누락:
--     - avatar_character (0017) → pushToSupabase({ avatar_character }) 권한 거부
--     - lesson_xp → pushProgressMetaToServer({ lesson_xp }) 권한 거부
--     - active_subject, last_daily_mission_at → 동일
--   client direct update 가 server 에서 권한 거부 → silent fail.
--   (Supabase JS 의 update 결과 error 가 사용자 측 try/catch 에 삼켜짐.)
--
-- 영향:
--   - 모든 사용자의 lesson_xp / avatar_character / active_subject 변경 갱신 안 됨
--   - server lesson_xp 0 → purchase_pose 검증 실패 → 구매 불가
--   - server avatar_character 갱신 실패 → 새로고침 시 옛 값 복귀
--
-- 보호 컬럼 (grant 추가 X — 의도된 server-RPC-only):
--   tag, total_xp, level, streak_days, energy_count, energy_updated_at,
--   is_premium, premium_until, role,
--   unlocked_characters (purchase_character RPC 만), unlocked_poses (purchase_pose RPC 만)

begin;

grant update (
  avatar_character,
  lesson_xp,
  active_subject,
  last_daily_mission_at
) on public.profiles to authenticated;

commit;

-- 검증:
--   select column_name, privilege_type from information_schema.column_privileges
--    where table_schema='public' and table_name='profiles'
--      and grantee='authenticated' and privilege_type='UPDATE'
--    order by column_name;
--   → 6 row: active_subject, avatar_character, avatar_pose, display_name,
--          last_daily_mission_at, lesson_xp

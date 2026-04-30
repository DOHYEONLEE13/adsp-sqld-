-- 0014 — profiles.lesson_xp 컬럼 추가.
--
-- 배경: 다기기 동기화 결함 수정 (2026-04-30).
--   storage.ts 의 ProgressStore.lessonXp 가 localStorage 에만 있어 다른 기기에서
--   누락. 서버에 영속화해 양방향 sync 가능하도록 컬럼 추가.
--
-- total_xp 와 별개:
--   - total_xp = 세션 종료 시 누적된 XP (sessions.completed)
--   - lesson_xp = 레슨 step 단일 정답 시마다 누적된 XP (concept-practice 인라인 풀이)
--
-- destructive 아님 (additive only · default 0). 기존 사용자 영향 0.
-- 첫 SIGNED_IN 시 클라가 max(server, local) 로 push 해 0 으로 덮어쓰기 방지.
--
-- 적용: Supabase Dashboard → SQL Editor 에 통째로.

begin;

alter table profiles
  add column if not exists lesson_xp integer not null default 0
    check (lesson_xp >= 0);

comment on column profiles.lesson_xp is
  '레슨 step 단일 풀이 정답 시 누적된 XP. total_xp(세션 종료 누적) 과 별개. ' ||
  '클라 측 storage.ts ProgressStore.lessonXp 와 양방향 sync.';

commit;

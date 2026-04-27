-- 0005 — 성능 최적화 + realtime 활성화.
-- (a) RLS 정책의 auth.uid() → (select auth.uid()) — postgres 가 row 마다 재평가 안 함
-- (b) profiles SELECT 정책 2개 → 단일 OR 정책 (multiple permissive 경고 해소)
-- (c) question_stats SELECT 정책 2개 → 단일 ALL 정책
-- (d) friendships.friend_id 인덱스 추가
-- (e) profiles + friendships 를 supabase_realtime publication 에 등록
--     → 친구가 XP·avatar 바꾸면 내 화면 즉시 갱신, 본인 energy_count 도 realtime

-- ── (a)+(b) profiles ──
drop policy if exists profiles_read_self on public.profiles;
drop policy if exists profiles_read_friends on public.profiles;

create policy profiles_read_self_or_friends on public.profiles for select
  using (
    id = (select auth.uid())
    or id in (
      select friend_id from public.friendships where user_id = (select auth.uid())
    )
  );

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and tag           = (select tag           from public.profiles where id = (select auth.uid()))
    and total_xp      = (select total_xp      from public.profiles where id = (select auth.uid()))
    and level         = (select level         from public.profiles where id = (select auth.uid()))
    and streak_days   = (select streak_days   from public.profiles where id = (select auth.uid()))
    and energy_count  = (select energy_count  from public.profiles where id = (select auth.uid()))
    and is_premium    = (select is_premium    from public.profiles where id = (select auth.uid()))
    and premium_until is not distinct from (select premium_until from public.profiles where id = (select auth.uid()))
  );

-- ── friendships ──
drop policy if exists friendships_read_self on public.friendships;
create policy friendships_read_self on public.friendships for select
  using (user_id = (select auth.uid()));

drop policy if exists friendships_insert_self on public.friendships;
create policy friendships_insert_self on public.friendships for insert
  with check (user_id = (select auth.uid()));

drop policy if exists friendships_delete_self on public.friendships;
create policy friendships_delete_self on public.friendships for delete
  using (user_id = (select auth.uid()));

-- ── sessions ──
drop policy if exists sessions_read_self on public.sessions;
create policy sessions_read_self on public.sessions for select
  using (user_id = (select auth.uid()));

drop policy if exists sessions_insert_self on public.sessions;
create policy sessions_insert_self on public.sessions for insert
  with check (user_id = (select auth.uid()));

drop policy if exists sessions_delete_self on public.sessions;
create policy sessions_delete_self on public.sessions for delete
  using (user_id = (select auth.uid()));

-- ── (c) question_stats — 단일 ALL 정책 ──
drop policy if exists qstats_read_self on public.question_stats;
drop policy if exists qstats_upsert_self on public.question_stats;
create policy qstats_all_self on public.question_stats for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ── step_unlocks ──
drop policy if exists unlocks_read_self on public.step_unlocks;
create policy unlocks_read_self on public.step_unlocks for select
  using (user_id = (select auth.uid()));

drop policy if exists unlocks_insert_self on public.step_unlocks;
create policy unlocks_insert_self on public.step_unlocks for insert
  with check (user_id = (select auth.uid()));

-- ── bookmarks ──
drop policy if exists bookmarks_all_self on public.bookmarks;
create policy bookmarks_all_self on public.bookmarks for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ── exam_dates ──
drop policy if exists exam_dates_all_self on public.exam_dates;
create policy exam_dates_all_self on public.exam_dates for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ── (d) friendships.friend_id 인덱스 ──
create index if not exists friendships_friend_idx on public.friendships(friend_id);

-- ── (e) realtime publication ──
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.friendships;

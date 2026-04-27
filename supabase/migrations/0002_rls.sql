-- 0002 — RLS 정책. 모든 테이블 본인만 접근 (+ profiles 친구 read).
--
-- 적용 후 anonymous role / authenticated role 모두 RLS 의해 차단됨 — 명시적
-- policy 통과 못하면 row 안 보임.

begin;

alter table profiles        enable row level security;
alter table friendships     enable row level security;
alter table sessions        enable row level security;
alter table question_stats  enable row level security;
alter table step_unlocks    enable row level security;
alter table bookmarks       enable row level security;
alter table exam_dates      enable row level security;

-- ── profiles ────────────────────────────────────────────────────────────

drop policy if exists profiles_read_self on profiles;
create policy profiles_read_self on profiles for select
  using (id = auth.uid());

drop policy if exists profiles_read_friends on profiles;
create policy profiles_read_friends on profiles for select
  using (id in (
    select friend_id from friendships where user_id = auth.uid()
  ));

-- 사용자가 직접 update 가능한 컬럼 = display_name, avatar_pose, active_subject,
-- last_seen_at, last_daily_mission_at. is_premium / energy_* / total_xp / level /
-- streak_days / tag 등은 서버 RPC 만 변경.
-- → check 절에서 기존 값과 같은지 강제. (auth.uid() 비교 + RPC 가 SECURITY DEFINER 이므로 RPC 는 통과)
drop policy if exists profiles_update_self on profiles;
create policy profiles_update_self on profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and tag           = (select tag           from profiles where id = auth.uid())
    and total_xp      = (select total_xp      from profiles where id = auth.uid())
    and level         = (select level         from profiles where id = auth.uid())
    and streak_days   = (select streak_days   from profiles where id = auth.uid())
    and energy_count  = (select energy_count  from profiles where id = auth.uid())
    and is_premium    = (select is_premium    from profiles where id = auth.uid())
    and premium_until is not distinct from (select premium_until from profiles where id = auth.uid())
  );

-- 직접 INSERT / DELETE 는 막음 (트리거 또는 cascade 만)

-- ── friendships ─────────────────────────────────────────────────────────

drop policy if exists friendships_read_self on friendships;
create policy friendships_read_self on friendships for select
  using (user_id = auth.uid());

-- INSERT 는 RPC `add_friend_by_tag` 만 사용하도록 권장. 하지만 명시적 client INSERT 도
-- user_id = auth.uid() 일 때만 허용 (RPC 미사용 호환).
drop policy if exists friendships_insert_self on friendships;
create policy friendships_insert_self on friendships for insert
  with check (user_id = auth.uid());

drop policy if exists friendships_delete_self on friendships;
create policy friendships_delete_self on friendships for delete
  using (user_id = auth.uid());

-- ── sessions ────────────────────────────────────────────────────────────

drop policy if exists sessions_read_self on sessions;
create policy sessions_read_self on sessions for select
  using (user_id = auth.uid());

drop policy if exists sessions_insert_self on sessions;
create policy sessions_insert_self on sessions for insert
  with check (user_id = auth.uid());

-- delete 는 reset 시에만 사용. RLS 통과 (cascade 도 가능).
drop policy if exists sessions_delete_self on sessions;
create policy sessions_delete_self on sessions for delete
  using (user_id = auth.uid());

-- ── question_stats ──────────────────────────────────────────────────────

drop policy if exists qstats_read_self on question_stats;
create policy qstats_read_self on question_stats for select
  using (user_id = auth.uid());

drop policy if exists qstats_upsert_self on question_stats;
create policy qstats_upsert_self on question_stats for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── step_unlocks ────────────────────────────────────────────────────────

drop policy if exists unlocks_read_self on step_unlocks;
create policy unlocks_read_self on step_unlocks for select
  using (user_id = auth.uid());

drop policy if exists unlocks_insert_self on step_unlocks;
create policy unlocks_insert_self on step_unlocks for insert
  with check (user_id = auth.uid());

-- ── bookmarks ───────────────────────────────────────────────────────────

drop policy if exists bookmarks_all_self on bookmarks;
create policy bookmarks_all_self on bookmarks for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── exam_dates ──────────────────────────────────────────────────────────

drop policy if exists exam_dates_all_self on exam_dates;
create policy exam_dates_all_self on exam_dates for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

commit;

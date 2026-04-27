-- 0001 — QuestDP 초기 스키마.
-- 적용 순서: 0001 → 0002 (RLS) → 0003 (RPC + 트리거).
-- 모든 테이블은 user_id = auth.uid() 기준으로 격리.
--
-- 적용 방법: Supabase MCP 또는 Dashboard → SQL Editor 에 통째로 붙여넣기.
-- 트랜잭션 안전 — 부분 실패 시 전체 롤백.

begin;

-- ── 1. profiles ──────────────────────────────────────────────────────────
-- 사용자 본체. auth.users.id 와 1:1.

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  tag text not null unique check (tag ~ '^Q-[A-Z0-9]{4}-[A-Z0-9]{4}$'),
  display_name text not null default '',
  avatar_pose text not null default 'wave'
    check (avatar_pose in ('idle','happy','sad','celebrate','sleep','wave','think','lightbulb')),

  -- 진도
  total_xp integer not null default 0 check (total_xp >= 0),
  level integer not null default 1 check (level >= 1),
  streak_days integer not null default 0 check (streak_days >= 0),
  last_played_date date,
  last_seen_at timestamptz not null default now(),

  -- 활성 과목 / 일일미션 메타
  active_subject text check (active_subject in ('adsp','sqld')),
  last_daily_mission_at timestamptz,

  -- 에너지 / 프리미엄
  energy_count integer not null default 5 check (energy_count >= 0),
  energy_updated_at timestamptz not null default now(),
  is_premium boolean not null default false,
  premium_until timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_tag_idx on profiles(tag);
create index if not exists profiles_total_xp_idx on profiles(total_xp desc);

-- ── 2. friendships ──────────────────────────────────────────────────────
-- 단방향. A 가 B 추가했다고 B 가 A 자동 추가 X.

create table if not exists friendships (
  user_id uuid not null references profiles on delete cascade,
  friend_id uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

create index if not exists friendships_user_idx on friendships(user_id);

-- ── 3. sessions ──────────────────────────────────────────────────────────
-- 게임 세션 로그. 모의고사 슬롯 진행·약점 분석·일일미션 모두 여기서 도출.

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  subject text not null check (subject in ('adsp','sqld')),
  chapter integer not null,
  chapter_title text not null,
  topic text,
  total integer not null check (total >= 0),
  correct_count integer not null check (correct_count >= 0),
  total_time_ms integer not null default 0,
  label text,
  wrong_question_ids text[] not null default array[]::text[],
  flow text check (flow in ('play','learn','test')),
  ended_at timestamptz not null default now(),
  -- 클라가 보낸 idempotency 키 — 중복 commit 방지
  client_id text
);

create index if not exists sessions_user_ended_idx on sessions(user_id, ended_at desc);
create index if not exists sessions_user_label_idx on sessions(user_id, label) where label is not null;
create unique index if not exists sessions_user_client_id_uidx on sessions(user_id, client_id) where client_id is not null;

-- ── 4. question_stats ───────────────────────────────────────────────────
-- 문항별 누적. 복습 큐·약점 점수 계산용.

create table if not exists question_stats (
  user_id uuid not null references profiles on delete cascade,
  question_id text not null,
  attempts integer not null default 0,
  correct integer not null default 0,
  wrong_streak integer not null default 0,
  last_correct boolean not null default false,
  last_seen_at timestamptz not null default now(),
  last_time_ms integer not null default 0,
  avg_time_ms double precision not null default 0,
  primary key (user_id, question_id)
);

-- ── 5. step_unlocks ─────────────────────────────────────────────────────
-- 로드맵 잠금 해제 상태. 무료 사용자 순차 진행용.

create table if not exists step_unlocks (
  user_id uuid not null references profiles on delete cascade,
  step_key text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, step_key)
);

-- ── 6. bookmarks ────────────────────────────────────────────────────────

create table if not exists bookmarks (
  user_id uuid not null references profiles on delete cascade,
  question_id text not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

-- ── 7. exam_dates ───────────────────────────────────────────────────────

create table if not exists exam_dates (
  user_id uuid not null references profiles on delete cascade,
  subject text not null check (subject in ('adsp','sqld')),
  exam_date date not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, subject)
);

-- ── 8. updated_at 자동 갱신 트리거 (profiles 만 사용) ────────────────────

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end; $$ language plpgsql;

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists bookmarks_set_updated_at on bookmarks;
create trigger bookmarks_set_updated_at
  before update on bookmarks
  for each row execute function set_updated_at();

drop trigger if exists exam_dates_set_updated_at on exam_dates;
create trigger exam_dates_set_updated_at
  before update on exam_dates
  for each row execute function set_updated_at();

commit;

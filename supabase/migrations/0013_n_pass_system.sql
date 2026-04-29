-- 0013 — N회독 (Pass) 시스템 데이터 모델 + RPC + 기존 사용자 자동 분류.
--
-- 설계 정본: docs/n-pass-design.md
-- 결정 사항:
--   - Tier 5단계: BRONZE → SILVER → GOLD → PLATINUM → MASTER
--   - 챕터 회독 완료 기준: 정답률 75%
--   - 마이그레이션: 자동 부여 + StatsPage 의 "회독 다시 시작" 옵션 (RPC reset_pass_progress)
--   - Tier 강등 X (한 번 올라가면 유지)
--
-- 테이블 변경:
--   - profiles: pass_tier (text), pass_tier_updated_at (timestamptz)
--   - question_stats: pass_number (int), pass_marks (jsonb)
--   - sessions: pass_number (int)
--   - 신규 pass_stamps (영구 획득 이력)
--
-- RPC:
--   - record_pass_completion(subject, chapter, pass) — 챕터 75% 도달 시 stamp insert
--   - recompute_pass_tier() — stamps 변동 시 tier 재계산
--   - reset_pass_progress() — 사용자가 회독 다시 시작 (XP/Level 보존)

begin;

-- ============================================================
-- 1. 스키마 확장
-- ============================================================

alter table public.profiles
  add column if not exists pass_tier text not null default 'bronze'
    check (pass_tier in ('bronze','silver','gold','platinum','master')),
  add column if not exists pass_tier_updated_at timestamptz;

alter table public.question_stats
  add column if not exists pass_number integer not null default 1
    check (pass_number >= 1),
  add column if not exists pass_marks jsonb not null default '[]'::jsonb;

alter table public.sessions
  add column if not exists pass_number integer not null default 1
    check (pass_number >= 1);

create index if not exists sessions_user_pass_idx
  on public.sessions(user_id, subject, chapter, pass_number);

-- ============================================================
-- 2. pass_stamps — 영구 획득 이력
-- ============================================================

create table if not exists public.pass_stamps (
  user_id uuid not null references public.profiles on delete cascade,
  subject text not null check (subject in ('adsp','sqld')),
  chapter integer not null check (chapter >= 1),
  pass_number integer not null check (pass_number >= 1),
  achieved_at timestamptz not null default now(),
  primary key (user_id, subject, chapter, pass_number)
);

create index if not exists pass_stamps_user_idx
  on public.pass_stamps(user_id, achieved_at desc);

-- ============================================================
-- 3. RLS
-- ============================================================

alter table public.pass_stamps enable row level security;

-- 본인 read
create policy pass_stamps_self_read on public.pass_stamps
  for select to authenticated
  using (user_id = (select auth.uid()));

-- 친구 read (친구 리더보드의 진행 점·Tier 표시)
create policy pass_stamps_friends_read on public.pass_stamps
  for select to authenticated
  using (
    user_id in (
      select friend_id from public.friendships where user_id = (select auth.uid())
    )
  );

-- admin read
create policy pass_stamps_admin_read on public.pass_stamps
  for select to authenticated
  using (
    exists (select 1 from public.profiles me
            where me.id = (select auth.uid()) and me.role = 'admin')
  );

-- INSERT/UPDATE/DELETE 는 SECURITY DEFINER RPC 만.

-- ============================================================
-- 4. helper: rank_of — tier 순위 비교 (recompute_pass_tier 가 참조하므로 먼저 정의)
-- ============================================================

create or replace function public.rank_of(t text)
returns integer
language sql immutable
set search_path = ''
as $$
  select case t
    when 'bronze' then 1
    when 'silver' then 2
    when 'gold' then 3
    when 'platinum' then 4
    when 'master' then 5
    else 0
  end;
$$;

-- ============================================================
-- 5. RPC: recompute_pass_tier — Tier 재계산
-- ============================================================
-- 입력: 본인. 호출 시점: stamp 변동 후.
-- 정책:
--   1) 두 과목 모두 3회독 stamp 보유 → MASTER
--   2) 한 과목이라도 2회독 stamp 보유 → PLATINUM
--   3) 한 과목이라도 2회독 진행 중 (해당 과목의 1회독 stamp 보유 + 2회독 sessions 존재) → GOLD
--   4) 한 과목이라도 1회독 stamp 보유 → SILVER
--   5) 그 외 → BRONZE
-- Tier 강등 X — 한 번 도달한 최상위 tier 유지.

create or replace function public.recompute_pass_tier()
returns table (ok boolean, new_tier text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  current_tier text;
  candidate_tier text;
  has_master boolean;
  has_platinum boolean;
  has_gold boolean;
  has_silver boolean;
begin
  if me is null then
    return query select false, null::text; return;
  end if;

  select pass_tier into current_tier from public.profiles where id = me;

  -- 두 과목 모두 3회독 stamp 보유?
  has_master := (
    select count(distinct subject) = 2
    from public.pass_stamps
    where user_id = me and pass_number = 3
  );
  -- 어떤 과목이든 2회독 stamp 보유?
  has_platinum := exists (
    select 1 from public.pass_stamps
    where user_id = me and pass_number = 2
  );
  -- 어떤 과목이든 1회독 stamp 보유 + 2회독 세션 존재?
  has_gold := exists (
    select 1 from public.pass_stamps st
    where st.user_id = me and st.pass_number = 1
      and exists (
        select 1 from public.sessions s
        where s.user_id = me and s.subject = st.subject and s.pass_number = 2
      )
  );
  has_silver := exists (
    select 1 from public.pass_stamps
    where user_id = me and pass_number = 1
  );

  candidate_tier := case
    when has_master then 'master'
    when has_platinum then 'platinum'
    when has_gold then 'gold'
    when has_silver then 'silver'
    else 'bronze'
  end;

  -- 강등 방지: 현재보다 높은 tier 만 적용 (search_path = '' 이라 fully qualified 호출)
  if public.rank_of(candidate_tier) > public.rank_of(coalesce(current_tier, 'bronze')) then
    update public.profiles
       set pass_tier = candidate_tier,
           pass_tier_updated_at = now()
     where id = me;
    return query select true, candidate_tier; return;
  end if;

  return query select true, current_tier;
end;
$$;

revoke execute on function public.recompute_pass_tier() from public, anon;
grant execute on function public.recompute_pass_tier() to authenticated;

-- ============================================================
-- 5. RPC: record_pass_completion — 챕터 75% 도달 시 stamp insert
-- ============================================================
-- 입력: 과목, 챕터, 회독 차수. 클라이언트가 sessions 종료 시 호출.
-- 챕터의 모든 sessions (해당 pass) 합산 정답률 ≥ 75% 면 stamp insert.
-- 멱등 (이미 stamp 있으면 no-op).
-- 새 stamp 생성 시 tier 재계산 트리거.

create or replace function public.record_pass_completion(
  p_subject text, p_chapter int, p_pass int
)
returns table (ok boolean, stamped boolean, accuracy double precision)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  total_q int;
  correct_q int;
  acc double precision;
begin
  if me is null then
    return query select false, false, null::double precision; return;
  end if;

  select coalesce(sum(total),0), coalesce(sum(correct_count),0)
    into total_q, correct_q
    from public.sessions
   where user_id = me
     and subject = p_subject
     and chapter = p_chapter
     and pass_number = p_pass;

  if total_q = 0 then
    return query select true, false, 0::double precision; return;
  end if;

  acc := correct_q::double precision / total_q::double precision;

  if acc >= 0.75 then
    insert into public.pass_stamps (user_id, subject, chapter, pass_number)
      values (me, p_subject, p_chapter, p_pass)
      on conflict do nothing;
    perform public.recompute_pass_tier();
    return query select true, true, acc; return;
  end if;

  return query select true, false, acc;
end;
$$;

revoke execute on function public.record_pass_completion(text, int, int)
  from public, anon;
grant execute on function public.record_pass_completion(text, int, int)
  to authenticated;

-- ============================================================
-- 6. RPC: reset_pass_progress — 회독 다시 시작 (XP/Level 보존)
-- ============================================================
-- StatsPage 의 "회독 다시 시작" 버튼이 호출.
-- 영향:
--   - question_stats.pass_number = 1, pass_marks = []
--   - sessions.pass_number = 1 (이력 보존, 단순 회독 차수만 리셋)
--   - pass_stamps 본인 row 삭제
--   - profiles.pass_tier = 'bronze'
-- XP / Level / Streak / Bookmarks / friendships → 보존.

create or replace function public.reset_pass_progress()
returns table (ok boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
begin
  if me is null then
    return query select false; return;
  end if;

  update public.question_stats
     set pass_number = 1, pass_marks = '[]'::jsonb
   where user_id = me;

  update public.sessions
     set pass_number = 1
   where user_id = me;

  delete from public.pass_stamps where user_id = me;

  update public.profiles
     set pass_tier = 'bronze',
         pass_tier_updated_at = now()
   where id = me;

  return query select true;
end;
$$;

revoke execute on function public.reset_pass_progress() from public, anon;
grant execute on function public.reset_pass_progress() to authenticated;

-- ============================================================
-- 7. 기존 사용자 자동 분류 (마이그레이션)
-- ============================================================
-- 정책:
--   - 모든 기존 question_stats / sessions 의 pass_number = 1 (default 가 처리)
--   - 챕터별 정답률 ≥ 75% 인 곳에 1회독 stamp 자동 부여
--   - profiles.pass_tier 일괄 재계산 (현재 데이터로는 BRONZE 또는 SILVER)

insert into public.pass_stamps (user_id, subject, chapter, pass_number)
select s.user_id, s.subject, s.chapter, 1
from (
  select user_id, subject, chapter,
         sum(correct_count)::float / nullif(sum(total), 0) as accuracy
  from public.sessions
  where pass_number = 1
  group by user_id, subject, chapter
) s
where s.accuracy >= 0.75
on conflict do nothing;

update public.profiles p
set pass_tier = 'silver',
    pass_tier_updated_at = now()
where exists (select 1 from public.pass_stamps where user_id = p.id and pass_number = 1);

commit;

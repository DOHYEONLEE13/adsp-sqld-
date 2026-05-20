-- 0029 — Backend integrity hardening.
--
-- Goals:
--   1. Payment grants must not turn weekly/monthly purchases into lifetime access.
--   2. Energy consumption must reject invalid/negative amounts.
--   3. XP must be awarded idempotently by the server, never by trusting client totals.
--   4. Lesson answers get a server RPC path that updates stats + XP + step visit atomically.
--   5. Direct client writes to progression tables are reduced.

begin;

-- ── XP award ledger ─────────────────────────────────────────────────────

create table if not exists public.xp_awards (
  user_id uuid not null references public.profiles(id) on delete cascade,
  award_key text not null,
  source text not null default 'lesson',
  xp_amount integer not null check (xp_amount > 0 and xp_amount <= 1000),
  created_at timestamptz not null default now(),
  primary key (user_id, award_key),
  check (length(award_key) between 3 and 220),
  check (length(source) between 2 and 40)
);

comment on table public.xp_awards is
  'Idempotent server-side XP ledger. A user can receive XP for a given award_key only once.';

alter table public.xp_awards enable row level security;

drop policy if exists xp_awards_read_self on public.xp_awards;
create policy xp_awards_read_self on public.xp_awards
  for select
  to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.xp_awards from public, anon, authenticated;
grant select on public.xp_awards to authenticated;

create index if not exists xp_awards_user_created_idx
  on public.xp_awards(user_id, created_at desc);

create index if not exists refund_requests_payment_id_idx
  on public.refund_requests(payment_id);

-- ── Payment grant expiry fix ────────────────────────────────────────────

create or replace function public.grant_premium_from_payment(
  p_user_id uuid,
  p_pg_payment_key text,
  p_pg_order_id text,
  p_amount_krw int,
  p_product_code text,
  p_raw jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  grant_until timestamptz;
  current_until timestamptz;
  current_is_premium boolean;
begin
  insert into public.payments (
    user_id,
    pg_provider,
    pg_payment_key,
    pg_order_id,
    amount_krw,
    product_code,
    status,
    paid_at,
    raw
  ) values (
    p_user_id,
    'toss',
    p_pg_payment_key,
    p_pg_order_id,
    p_amount_krw,
    p_product_code,
    'paid',
    now(),
    p_raw
  ) on conflict (pg_payment_key) where pg_payment_key is not null do nothing;

  if p_product_code = 'lifetime' then
    grant_until := null;
  elsif p_product_code = 'weekly' then
    grant_until := now() + interval '7 days';
  elsif p_product_code = 'monthly' then
    grant_until := now() + interval '30 days';
  else
    raise exception 'unknown product_code: %', p_product_code;
  end if;

  if not exists (
    select 1
      from public.premium_grants
     where source = 'paid'
       and source_ref = p_pg_payment_key
  ) then
    insert into public.premium_grants (
      user_id, source, source_ref, granted_at, expires_at
    ) values (
      p_user_id, 'paid', p_pg_payment_key, now(), grant_until
    );
  end if;

  select is_premium, premium_until
    into current_is_premium, current_until
    from public.profiles
   where id = p_user_id
   for update;

  update public.profiles
     set is_premium = true,
         premium_until = case
           when grant_until is null then null
           when current_is_premium is true and current_until is null then null
           when current_until is null then grant_until
           else greatest(current_until, grant_until)
         end,
         updated_at = now()
   where id = p_user_id;
end;
$$;

revoke execute on function public.grant_premium_from_payment(uuid, text, text, int, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.grant_premium_from_payment(uuid, text, text, int, text, jsonb)
  to service_role;

-- ── Energy validation ───────────────────────────────────────────────────

create or replace function public.consume_energy(amount int default 1)
returns table (ok boolean, remaining int, retry_after_sec int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec record;
  cap int := 10;
  regen_after_sec int := 1800;
  elapsed_sec bigint;
  regen_count int;
  rem_sec int;
  new_updated_at timestamptz;
begin
  if auth.uid() is null then
    return query select false, 0, 0; return;
  end if;

  if amount is null or amount < 1 or amount > cap then
    return query select false, 0, 0; return;
  end if;

  select energy_count, energy_updated_at, is_premium, role
    into rec
    from public.profiles
   where id = auth.uid()
   for update;

  if not found then
    return query select false, 0, 0; return;
  end if;

  if rec.role = 'admin' or rec.is_premium then
    return query select true, 999, 0; return;
  end if;

  elapsed_sec := greatest(0, extract(epoch from now() - rec.energy_updated_at)::bigint);
  regen_count := least(cap, rec.energy_count + (elapsed_sec / regen_after_sec)::int);

  if regen_count < amount then
    rem_sec := regen_after_sec - (elapsed_sec % regen_after_sec)::int;
    return query select false, regen_count, rem_sec; return;
  end if;

  if regen_count >= cap then
    new_updated_at := now();
  else
    new_updated_at := rec.energy_updated_at
      + make_interval(secs => (regen_count - rec.energy_count) * regen_after_sec);
  end if;

  update public.profiles
     set energy_count = regen_count - amount,
         energy_updated_at = new_updated_at
   where id = auth.uid();

  return query select true, regen_count - amount, 0;
end;
$$;

revoke execute on function public.consume_energy(int) from public, anon;
grant execute on function public.consume_energy(int) to authenticated;

-- ── XP update primitive, internal only for authenticated users ───────────

create or replace function public.bump_progress(xp_delta int, day_played date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  prev_date date;
  new_xp int;
  new_level int;
begin
  if auth.uid() is null then return; end if;
  if xp_delta is null or xp_delta <= 0 then return; end if;
  if xp_delta > 1000 then
    raise exception 'xp_delta_out_of_range';
  end if;

  select last_played_date, total_xp
    into prev_date, new_xp
    from public.profiles
   where id = auth.uid()
   for update;

  if not found then return; end if;

  new_xp := greatest(0, new_xp + xp_delta);
  new_level := greatest(1, floor((1 + sqrt(1 + 0.08 * new_xp::numeric)) / 2)::int);

  update public.profiles set
    total_xp = new_xp,
    level = new_level,
    streak_days = case
      when prev_date = day_played - 1 then streak_days + 1
      when prev_date = day_played then streak_days
      else 1
    end,
    last_played_date = day_played,
    last_seen_at = now()
  where id = auth.uid();
end;
$$;

revoke execute on function public.bump_progress(int, date) from public, anon, authenticated;

-- ── Quest/session completion with server-side idempotent XP ──────────────

create or replace function public.record_session(
  p_subject text,
  p_chapter int,
  p_chapter_title text,
  p_topic text,
  p_total int,
  p_correct_count int,
  p_total_time_ms int,
  p_label text,
  p_wrong_ids text[],
  p_flow text,
  p_xp_delta int,
  p_answer_log jsonb,
  p_client_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  new_id uuid;
  ans jsonb;
  qid text;
  is_correct boolean;
  t_ms int;
  stat_row record;
  alpha numeric := 0.3;
  safe_total int;
  safe_correct int;
  safe_time int;
  earned_xp int := 0;
  inserted_rows int := 0;
begin
  if me is null then
    raise exception 'unauthenticated';
  end if;

  safe_total := greatest(0, least(coalesce(p_total, 0), 200));
  safe_correct := greatest(0, least(coalesce(p_correct_count, 0), safe_total));
  safe_time := greatest(0, least(coalesce(p_total_time_ms, 0), 86400000));

  if p_client_id is not null then
    select id into new_id
      from public.sessions
     where user_id = me
       and client_id = p_client_id;
    if new_id is not null then
      return new_id;
    end if;
  end if;

  insert into public.sessions (
    user_id, subject, chapter, chapter_title, topic,
    total, correct_count, total_time_ms, label, wrong_question_ids, flow, client_id
  ) values (
    me, p_subject, p_chapter, p_chapter_title, p_topic,
    safe_total, safe_correct, safe_time, p_label, coalesce(p_wrong_ids, array[]::text[]), p_flow, p_client_id
  )
  returning id into new_id;

  if p_answer_log is not null and jsonb_typeof(p_answer_log) = 'array' then
    for ans in select * from jsonb_array_elements(p_answer_log) loop
      qid := nullif(left(ans->>'question_id', 160), '');
      if qid is null then continue; end if;
      is_correct := coalesce((ans->>'correct')::boolean, false);
      t_ms := greatest(0, least(coalesce((ans->>'time_ms')::int, 0), 3600000));

      select * into stat_row
        from public.question_stats
       where user_id = me
         and question_id = qid
       for update;

      if not found then
        insert into public.question_stats (
          user_id, question_id, attempts, correct, wrong_streak,
          last_correct, last_seen_at, last_time_ms, avg_time_ms
        ) values (
          me, qid, 1, case when is_correct then 1 else 0 end,
          case when is_correct then 0 else 1 end,
          is_correct, now(), t_ms, t_ms
        );
      else
        update public.question_stats set
          attempts = stat_row.attempts + 1,
          correct = stat_row.correct + case when is_correct then 1 else 0 end,
          wrong_streak = case when is_correct then 0 else stat_row.wrong_streak + 1 end,
          last_correct = is_correct,
          last_seen_at = now(),
          last_time_ms = t_ms,
          avg_time_ms = round((1 - alpha) * stat_row.avg_time_ms + alpha * t_ms)::int
        where user_id = me and question_id = qid;
      end if;

      if is_correct then
        insert into public.xp_awards (user_id, award_key, source, xp_amount)
        values (me, 'question:' || qid, 'quest', 10)
        on conflict do nothing;
        get diagnostics inserted_rows = row_count;
        earned_xp := earned_xp + (inserted_rows * 10);
      end if;
    end loop;
  end if;

  if earned_xp > 0 then
    perform public.bump_progress(earned_xp, current_date);
  end if;

  return new_id;
end;
$$;

revoke execute on function public.record_session(text, int, text, text, int, int, int, text, text[], text, int, jsonb, text)
  from public, anon, authenticated;

create or replace function public.complete_quest_session(
  p_subject text,
  p_chapter int,
  p_chapter_title text,
  p_topic text,
  p_total int,
  p_correct_count int,
  p_total_time_ms int,
  p_label text,
  p_wrong_ids text[],
  p_flow text,
  p_xp_delta int,
  p_answer_log jsonb,
  p_client_id text default null
)
returns uuid
language sql
security definer
set search_path = ''
as $$
  select public.record_session(
    p_subject, p_chapter, p_chapter_title, p_topic,
    p_total, p_correct_count, p_total_time_ms, p_label,
    p_wrong_ids, p_flow, p_xp_delta, p_answer_log, p_client_id
  );
$$;

revoke execute on function public.complete_quest_session(text, int, text, text, int, int, int, text, text[], text, int, jsonb, text)
  from public, anon;
grant execute on function public.complete_quest_session(text, int, text, text, int, int, int, text, text[], text, int, jsonb, text)
  to authenticated;

-- ── Lesson answer RPC ───────────────────────────────────────────────────

create or replace function public.submit_lesson_answer(
  p_question_id text,
  p_correct boolean,
  p_time_ms int,
  p_step_key text default null
)
returns table (xp_awarded int, lesson_xp int, already_awarded boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  qid text;
  t_ms int;
  stat_row record;
  alpha numeric := 0.3;
  inserted_rows int := 0;
  new_lesson_xp int := 0;
  answer_correct boolean := coalesce(p_correct, false);
begin
  if me is null then
    raise exception 'unauthenticated';
  end if;

  qid := nullif(left(p_question_id, 160), '');
  if qid is null then
    raise exception 'invalid_question_id';
  end if;
  t_ms := greatest(0, least(coalesce(p_time_ms, 0), 3600000));

  select * into stat_row
    from public.question_stats
   where user_id = me
     and question_id = qid
   for update;

  if not found then
    insert into public.question_stats (
      user_id, question_id, attempts, correct, wrong_streak,
      last_correct, last_seen_at, last_time_ms, avg_time_ms
    ) values (
      me, qid, 1, case when answer_correct then 1 else 0 end,
      case when answer_correct then 0 else 1 end,
      answer_correct, now(), t_ms, t_ms
    );
  else
    update public.question_stats set
      attempts = stat_row.attempts + 1,
      correct = stat_row.correct + case when answer_correct then 1 else 0 end,
      wrong_streak = case when answer_correct then 0 else stat_row.wrong_streak + 1 end,
      last_correct = answer_correct,
      last_seen_at = now(),
      last_time_ms = t_ms,
      avg_time_ms = round((1 - alpha) * stat_row.avg_time_ms + alpha * t_ms)::int
    where user_id = me and question_id = qid;
  end if;

  if answer_correct then
    insert into public.xp_awards (user_id, award_key, source, xp_amount)
    values (me, 'question:' || qid, 'lesson', 10)
    on conflict do nothing;
    get diagnostics inserted_rows = row_count;
  end if;

  if inserted_rows = 1 then
    update public.profiles
       set lesson_xp = public.profiles.lesson_xp + 10,
           last_seen_at = now(),
           updated_at = now()
     where id = me
     returning profiles.lesson_xp into new_lesson_xp;
  else
    update public.profiles
       set last_seen_at = now(),
           updated_at = now()
     where id = me
     returning profiles.lesson_xp into new_lesson_xp;
  end if;

  if p_step_key is not null and p_step_key ~ '^[a-z0-9-]+-s[0-9]{1,3}$' then
    insert into public.step_unlocks (user_id, step_key)
    values (me, p_step_key)
    on conflict do nothing;
  end if;

  return query select inserted_rows * 10, coalesce(new_lesson_xp, 0), inserted_rows = 0;
end;
$$;

revoke execute on function public.submit_lesson_answer(text, boolean, int, text)
  from public, anon;
grant execute on function public.submit_lesson_answer(text, boolean, int, text)
  to authenticated;

-- `unlock_step` is kept for internal/admin compatibility but no longer public API.
create or replace function public.unlock_step(step_key text)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.step_unlocks (user_id, step_key)
  select auth.uid(), step_key
  where auth.uid() is not null
    and step_key ~ '^[a-z0-9-]+-s[0-9]{1,3}$'
  on conflict do nothing;
$$;

revoke execute on function public.unlock_step(text) from public, anon, authenticated;

-- Direct browser writes to server-authoritative progression tables are disabled.
revoke insert, update, delete on public.question_stats from anon, authenticated;
revoke insert, update, delete on public.step_unlocks from anon, authenticated;
revoke update (lesson_xp) on public.profiles from authenticated;

-- ── Snapshot RPC for auth-ready bootstrapping ────────────────────────────

create or replace function public.get_player_snapshot()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  result jsonb;
begin
  if me is null then
    raise exception 'unauthenticated';
  end if;

  select jsonb_build_object(
    'profile',
      coalesce((
        select to_jsonb(p) || jsonb_build_object(
          'display_xp', p.total_xp + coalesce(p.lesson_xp, 0)
        )
        from (
          select id, tag, display_name, avatar_pose, avatar_character, role,
                 total_xp, lesson_xp, level, streak_days, is_premium,
                 premium_until, energy_count, energy_updated_at,
                 pass_tier, last_seen_at, created_at, updated_at
            from public.profiles
           where id = me
        ) p
      ), '{}'::jsonb),
    'question_stats',
      coalesce((
        select jsonb_agg(to_jsonb(qs) - 'user_id')
          from public.question_stats qs
         where qs.user_id = me
      ), '[]'::jsonb),
    'sessions',
      coalesce((
        select jsonb_agg(to_jsonb(s) - 'user_id' order by s.ended_at desc)
          from (
            select *
              from public.sessions
             where user_id = me
             order by ended_at desc
             limit 200
          ) s
      ), '[]'::jsonb),
    'step_unlocks',
      coalesce((
        select jsonb_agg(step_key order by step_key)
          from public.step_unlocks
         where user_id = me
      ), '[]'::jsonb),
    'pass_stamps',
      coalesce((
        select jsonb_agg(to_jsonb(ps) - 'user_id' order by ps.achieved_at desc)
          from public.pass_stamps ps
         where ps.user_id = me
      ), '[]'::jsonb)
  )
  into result;

  return result;
end;
$$;

revoke execute on function public.get_player_snapshot() from public, anon;
grant execute on function public.get_player_snapshot() to authenticated;

commit;

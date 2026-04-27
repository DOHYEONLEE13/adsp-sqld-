-- 0004 — 보안 강화. search_path 고정 + execute 권한 회수.
--
-- Supabase advisor 의 `function_search_path_mutable` + `anon_security_definer_function_executable`
-- 경고 해소. 모든 SECURITY DEFINER 함수에 search_path = '' 적용 (schema injection 방지).
-- 내부 helper (generate_unique_tag, on_auth_user_created, set_updated_at) 는
-- anon/authenticated 모두 execute 차단. 클라이언트 RPC 는 authenticated 만.

-- 모든 함수 재정의 — search_path = '' 추가.
-- 본문에서 모든 identifier 는 public.* / auth.* 풀패스로 작성.

create or replace function public.set_updated_at() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.generate_unique_tag()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  i int;
  attempt int;
begin
  for attempt in 1..10 loop
    candidate := 'Q-';
    for i in 1..4 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    candidate := candidate || '-';
    for i in 1..4 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    if not exists (select 1 from public.profiles where tag = candidate) then
      return candidate;
    end if;
  end loop;
  raise exception 'tag generation collision after 10 attempts';
end;
$$;

create or replace function public.on_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, tag) values (new.id, public.generate_unique_tag())
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.add_friend_by_tag(target_tag text)
returns table (ok boolean, reason text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_id uuid;
  me uuid := auth.uid();
  normalized text := upper(trim(target_tag));
begin
  if me is null then
    return query select false, 'unauthenticated'::text; return;
  end if;
  if normalized !~ '^Q-[A-Z0-9]{4}-[A-Z0-9]{4}$' then
    return query select false, 'invalid_format'::text; return;
  end if;

  select id into target_id from public.profiles where tag = normalized;
  if target_id is null then
    return query select false, 'not_found'::text; return;
  end if;
  if target_id = me then
    return query select false, 'self'::text; return;
  end if;
  if exists (select 1 from public.friendships where user_id = me and friend_id = target_id) then
    return query select false, 'duplicate'::text; return;
  end if;

  insert into public.friendships (user_id, friend_id) values (me, target_id);
  return query select true, null::text;
end;
$$;

create or replace function public.consume_energy(amount int default 1)
returns table (ok boolean, remaining int, retry_after_sec int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec record;
  cap int := 5;
  regen_after_sec int := 1800;
  elapsed_sec bigint;
  regen_count int;
  rem_sec int;
begin
  if auth.uid() is null then
    return query select false, 0, 0; return;
  end if;

  select energy_count, energy_updated_at, is_premium
    into rec from public.profiles where id = auth.uid() for update;

  if rec.is_premium then
    return query select true, 999, 0; return;
  end if;

  elapsed_sec := extract(epoch from now() - rec.energy_updated_at)::bigint;
  regen_count := least(cap, rec.energy_count + (elapsed_sec / regen_after_sec)::int);

  if regen_count < amount then
    rem_sec := regen_after_sec - (elapsed_sec % regen_after_sec)::int;
    return query select false, regen_count, rem_sec; return;
  end if;

  update public.profiles
     set energy_count = regen_count - amount,
         energy_updated_at = now()
   where id = auth.uid();

  return query select true, regen_count - amount, 0;
end;
$$;

create or replace function public.unlock_step(step_key text)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.step_unlocks (user_id, step_key)
  values (auth.uid(), step_key)
  on conflict do nothing;
$$;

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

  select last_played_date, total_xp into prev_date, new_xp
    from public.profiles where id = auth.uid() for update;

  new_xp := new_xp + xp_delta;
  new_level := greatest(1, 1 + floor(ln(1 + new_xp / 100.0))::int);

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
begin
  if me is null then
    raise exception 'unauthenticated';
  end if;

  if p_client_id is not null then
    select id into new_id from public.sessions where user_id = me and client_id = p_client_id;
    if new_id is not null then return new_id; end if;
  end if;

  insert into public.sessions (
    user_id, subject, chapter, chapter_title, topic,
    total, correct_count, total_time_ms, label, wrong_question_ids, flow, client_id
  ) values (
    me, p_subject, p_chapter, p_chapter_title, p_topic,
    p_total, p_correct_count, p_total_time_ms, p_label, coalesce(p_wrong_ids, array[]::text[]), p_flow, p_client_id
  )
  returning id into new_id;

  if p_answer_log is not null then
    for ans in select * from jsonb_array_elements(p_answer_log) loop
      qid := ans->>'question_id';
      is_correct := (ans->>'correct')::boolean;
      t_ms := coalesce((ans->>'time_ms')::int, 0);
      if qid is null then continue; end if;

      select * into stat_row from public.question_stats
       where user_id = me and question_id = qid for update;

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
          avg_time_ms = (1 - alpha) * stat_row.avg_time_ms + alpha * t_ms
        where user_id = me and question_id = qid;
      end if;
    end loop;
  end if;

  if p_xp_delta is not null and p_xp_delta > 0 then
    perform public.bump_progress(p_xp_delta, current_date);
  end if;

  return new_id;
end;
$$;

-- ── execute 권한 회수 ──
revoke execute on function public.generate_unique_tag()    from anon, authenticated, public;
revoke execute on function public.on_auth_user_created()    from anon, authenticated, public;
revoke execute on function public.set_updated_at()          from anon, authenticated, public;

revoke execute on function public.add_friend_by_tag(text)   from anon, public;
revoke execute on function public.consume_energy(int)       from anon, public;
revoke execute on function public.unlock_step(text)         from anon, public;
revoke execute on function public.bump_progress(int, date)  from anon, public;
revoke execute on function public.record_session(text, int, text, text, int, int, int, text, text[], text, int, jsonb, text) from anon, public;

grant execute on function public.add_friend_by_tag(text)   to authenticated;
grant execute on function public.consume_energy(int)       to authenticated;
grant execute on function public.unlock_step(text)         to authenticated;
grant execute on function public.bump_progress(int, date)  to authenticated;
grant execute on function public.record_session(text, int, text, text, int, int, int, text, text[], text, int, jsonb, text) to authenticated;

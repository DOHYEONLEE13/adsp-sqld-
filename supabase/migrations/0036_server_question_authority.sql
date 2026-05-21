-- QuestDP server-authoritative question sessions.
--
-- This migration is intentionally additive. The existing v1 RPCs are left in
-- place until the deployed frontend is verified to use the v2 flow.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table if not exists public.questions (
  id text primary key,
  subject text not null check (subject in ('adsp', 'sqld')),
  chapter integer not null check (chapter > 0),
  chapter_title text not null default '',
  topic text not null default '',
  canonical_topic text,
  subtopic text,
  pass_number integer not null default 1 check (pass_number > 0),
  difficulty integer check (difficulty between 1 and 5),
  stem text not null,
  choices jsonb not null check (jsonb_typeof(choices) = 'array'),
  answer_index integer not null check (answer_index >= 0),
  explanation jsonb,
  lifecycle text not null default 'curated',
  is_playable boolean not null default true,
  source_path text,
  updated_at timestamptz not null default now()
);

create index if not exists questions_playable_lookup_idx
  on public.questions (subject, chapter, canonical_topic, pass_number)
  where is_playable;

create index if not exists questions_subject_playable_idx
  on public.questions (subject, pass_number)
  where is_playable;

alter table public.questions enable row level security;
revoke all on table public.questions from anon, authenticated;

create table if not exists public.daily_question_quota (
  user_id uuid not null references public.profiles(id) on delete cascade,
  quota_date date not null,
  used_count integer not null default 0 check (used_count >= 0),
  limit_count integer not null default 10 check (limit_count > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, quota_date)
);

alter table public.daily_question_quota enable row level security;
revoke all on table public.daily_question_quota from anon, authenticated;

create table if not exists public.question_attempt_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_request_id text,
  subject text not null check (subject in ('adsp', 'sqld')),
  chapter integer,
  chapter_title text not null default '',
  topic text,
  flow text not null default 'play',
  label text,
  pass_number integer not null default 1,
  question_ids text[] not null,
  new_question_ids text[] not null default array[]::text[],
  quota_date date,
  quota_used integer not null default 0 check (quota_used >= 0),
  status text not null default 'started'
    check (status in ('started', 'submitted', 'expired')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '2 hours',
  submitted_at timestamptz,
  result jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, client_request_id)
);

create index if not exists question_attempt_sessions_user_status_idx
  on public.question_attempt_sessions (user_id, status, started_at desc);

create index if not exists question_attempt_sessions_user_created_idx
  on public.question_attempt_sessions (user_id, created_at desc);

alter table public.question_attempt_sessions enable row level security;
revoke all on table public.question_attempt_sessions from anon, authenticated;

create or replace function private.questdp_kst_date()
returns date
language sql
stable
set search_path = ''
as $$
  select (timezone('Asia/Seoul', now()))::date;
$$;

create or replace function private.questdp_has_unlimited_question_access(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select
        p.role = 'admin'
        or (
          p.is_premium
          and (p.premium_until is null or p.premium_until > now())
        )
      from public.profiles p
      where p.id = p_user_id
    ),
    false
  )
  or exists (
    select 1
    from public.premium_grants pg
    where pg.user_id = p_user_id
      and pg.revoked_at is null
      and (pg.expires_at is null or pg.expires_at > now())
  );
$$;

create or replace function private.questdp_public_question_payload(p_ids text[])
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', q.id,
        'subject', q.subject,
        'chapter', q.chapter,
        'chapterTitle', q.chapter_title,
        'topic', coalesce(q.canonical_topic, q.topic),
        'rawTopic', q.topic,
        'subtopic', q.subtopic,
        'pass', q.pass_number,
        'difficulty', q.difficulty,
        'type', 'multiple_choice',
        'question', q.stem,
        'choices', q.choices,
        'status', q.lifecycle
      )
      order by array_position(p_ids, q.id)
    ),
    '[]'::jsonb
  )
  from public.questions q
  where q.id = any(p_ids);
$$;

create or replace function private.questdp_apply_question_result(
  p_user_id uuid,
  p_question_id text,
  p_correct boolean,
  p_time_ms integer,
  p_source text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  stat_row record;
  alpha numeric := 0.3;
  safe_time integer := greatest(0, least(coalesce(p_time_ms, 0), 3600000));
  inserted_rows integer := 0;
begin
  if p_user_id is null or p_question_id is null then
    return 0;
  end if;

  select *
    into stat_row
    from public.question_stats
   where user_id = p_user_id
     and question_id = p_question_id
   for update;

  if not found then
    insert into public.question_stats (
      user_id, question_id, attempts, correct, wrong_streak,
      last_correct, last_seen_at, last_time_ms, avg_time_ms
    ) values (
      p_user_id, p_question_id, 1, case when p_correct then 1 else 0 end,
      case when p_correct then 0 else 1 end,
      p_correct, now(), safe_time, safe_time
    );
  else
    update public.question_stats set
      attempts = stat_row.attempts + 1,
      correct = stat_row.correct + case when p_correct then 1 else 0 end,
      wrong_streak = case when p_correct then 0 else stat_row.wrong_streak + 1 end,
      last_correct = p_correct,
      last_seen_at = now(),
      last_time_ms = safe_time,
      avg_time_ms = round((1 - alpha) * stat_row.avg_time_ms + alpha * safe_time)::int
    where user_id = p_user_id and question_id = p_question_id;
  end if;

  if p_correct then
    insert into public.xp_awards (user_id, award_key, source, xp_amount)
    values (
      p_user_id,
      'question:' || p_question_id,
      case when p_source = 'lesson' then 'lesson' else 'quest' end,
      10
    )
    on conflict do nothing;
    get diagnostics inserted_rows = row_count;
  end if;

  return inserted_rows * 10;
end;
$$;

create or replace function private.start_question_session_internal(
  p_subject text,
  p_chapter integer default null,
  p_chapter_title text default null,
  p_topic text default null,
  p_flow text default 'play',
  p_label text default null,
  p_size integer default 10,
  p_pass_number integer default 1,
  p_question_ids text[] default null,
  p_client_request_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  normalized_subject text := lower(coalesce(p_subject, ''));
  safe_size integer := greatest(1, least(coalesce(p_size, 10), 50));
  safe_pass integer := greatest(1, coalesce(p_pass_number, 1));
  token uuid;
  existing record;
  picked_ids text[] := array[]::text[];
  new_ids text[] := array[]::text[];
  quota_day date := private.questdp_kst_date();
  unlimited boolean;
  quota_remaining integer;
  quota_limit integer := 10;
  quota_used_now integer := 0;
  public_questions jsonb := '[]'::jsonb;
begin
  if me is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  end if;

  if normalized_subject not in ('adsp', 'sqld')
     and p_question_ids is not null
     and array_length(p_question_ids, 1) is not null then
    select q.subject
      into normalized_subject
      from public.questions q
     where q.id = p_question_ids[1]
       and q.is_playable
     limit 1;
  end if;

  if normalized_subject not in ('adsp', 'sqld') then
    return jsonb_build_object('ok', false, 'reason', 'invalid_subject');
  end if;

  if p_client_request_id is not null then
    select *
      into existing
      from public.question_attempt_sessions s
     where s.user_id = me
       and s.client_request_id = p_client_request_id;

    if found then
      if existing.status = 'submitted' then
        return coalesce(
          existing.result,
          jsonb_build_object('ok', true, 'sessionToken', existing.id, 'submitted', true)
        );
      end if;

      return jsonb_build_object(
        'ok', true,
        'sessionToken', existing.id,
        'questions', private.questdp_public_question_payload(existing.question_ids),
        'newQuestionCount', coalesce(array_length(existing.new_question_ids, 1), 0),
        'remainingQuota', null,
        'limitCount', quota_limit,
        'isUnlimited', private.questdp_has_unlimited_question_access(me),
        'reused', true
      );
    end if;
  end if;

  unlimited := private.questdp_has_unlimited_question_access(me);

  if not unlimited and safe_size > 10 then
    return jsonb_build_object(
      'ok', false,
      'reason', 'premium_required',
      'message', 'long_question_session_requires_premium',
      'requestedSize', safe_size,
      'limitCount', 10
    );
  end if;

  if p_question_ids is not null and array_length(p_question_ids, 1) is not null then
    select coalesce(array_agg(q.id order by array_position(p_question_ids, q.id)), array[]::text[])
      into picked_ids
      from public.questions q
     where q.id = any(p_question_ids)
       and q.is_playable
       and q.subject = normalized_subject
       and (p_chapter is null or q.chapter = p_chapter);

    if safe_size > 0 and cardinality(picked_ids) > safe_size then
      picked_ids := picked_ids[1:safe_size];
    end if;
  else
    select coalesce(array_agg(id), array[]::text[])
      into picked_ids
      from (
        select q.id
          from public.questions q
         where q.is_playable
           and q.subject = normalized_subject
           and q.pass_number = safe_pass
           and (p_chapter is null or q.chapter = p_chapter)
           and (
             p_topic is null
             or q.canonical_topic = p_topic
             or q.topic = p_topic
           )
         order by random()
         limit safe_size
      ) picked;
  end if;

  if cardinality(picked_ids) = 0 then
    return jsonb_build_object('ok', false, 'reason', 'no_questions');
  end if;

  if p_chapter is null or nullif(p_chapter_title, '') is null then
    select
      coalesce(p_chapter, q.chapter),
      coalesce(nullif(p_chapter_title, ''), q.chapter_title)
      into p_chapter, p_chapter_title
      from public.questions q
     where q.id = picked_ids[1];
  end if;

  select coalesce(array_agg(pid), array[]::text[])
    into new_ids
    from unnest(picked_ids) as pid
    left join public.question_stats qs
      on qs.user_id = me
     and qs.question_id = pid
   where qs.question_id is null;

  if not unlimited then
    insert into public.daily_question_quota (user_id, quota_date, used_count, limit_count)
    values (me, quota_day, 0, quota_limit)
    on conflict (user_id, quota_date) do nothing;

    select greatest(0, dq.limit_count - dq.used_count), dq.limit_count
      into quota_remaining, quota_limit
      from public.daily_question_quota dq
     where dq.user_id = me
       and dq.quota_date = quota_day
     for update;

    quota_used_now := coalesce(array_length(new_ids, 1), 0);

    if quota_used_now > quota_remaining then
      return jsonb_build_object(
        'ok', false,
        'reason', 'quota_exceeded',
        'remainingQuota', quota_remaining,
        'limitCount', quota_limit,
        'requestedNewCount', quota_used_now,
        'isUnlimited', false
      );
    end if;

    if quota_used_now > 0 then
      update public.daily_question_quota
         set used_count = used_count + quota_used_now,
             updated_at = now()
       where user_id = me
         and quota_date = quota_day;
      quota_remaining := quota_remaining - quota_used_now;
    end if;
  else
    quota_remaining := null;
    quota_used_now := 0;
  end if;

  insert into public.question_attempt_sessions (
    user_id, client_request_id, subject, chapter, chapter_title, topic, flow,
    label, pass_number, question_ids, new_question_ids, quota_date, quota_used
  ) values (
    me,
    p_client_request_id,
    normalized_subject,
    p_chapter,
    coalesce(p_chapter_title, ''),
    p_topic,
    coalesce(nullif(p_flow, ''), 'play'),
    p_label,
    safe_pass,
    picked_ids,
    new_ids,
    case when unlimited then null else quota_day end,
    case when unlimited then 0 else quota_used_now end
  )
  returning id into token;

  public_questions := private.questdp_public_question_payload(picked_ids);

  return jsonb_build_object(
    'ok', true,
    'sessionToken', token,
    'questions', public_questions,
    'newQuestionCount', coalesce(array_length(new_ids, 1), 0),
    'remainingQuota', quota_remaining,
    'limitCount', quota_limit,
    'isUnlimited', unlimited
  );
end;
$$;

create or replace function private.submit_question_session_internal(
  p_session_token uuid,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  sess record;
  answer_item jsonb;
  q record;
  selected_index integer;
  safe_time integer;
  is_correct boolean;
  answer_map jsonb := '{}'::jsonb;
  result_answers jsonb := '[]'::jsonb;
  wrong_ids text[] := array[]::text[];
  correct_count integer := 0;
  total_time integer := 0;
  earned_xp integer := 0;
  per_question_xp integer := 0;
  award_source text;
  new_session_id uuid;
begin
  if me is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  end if;

  select *
    into sess
    from public.question_attempt_sessions s
   where s.id = p_session_token
     and s.user_id = me
   for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'session_not_found');
  end if;

  if sess.status = 'submitted' then
    return coalesce(sess.result, jsonb_build_object('ok', true, 'sessionToken', sess.id));
  end if;

  if sess.expires_at < now() then
    update public.question_attempt_sessions
       set status = 'expired'
     where id = sess.id;
    return jsonb_build_object('ok', false, 'reason', 'session_expired');
  end if;

  if p_answers is not null and jsonb_typeof(p_answers) = 'array' then
    for answer_item in select * from jsonb_array_elements(p_answers) loop
      if nullif(answer_item->>'question_id', '') is not null then
        answer_map := answer_map || jsonb_build_object(answer_item->>'question_id', answer_item);
      end if;
    end loop;
  end if;

  award_source := case when sess.flow = 'lesson' then 'lesson' else 'quest' end;

  for q in
    select qq.*
      from unnest(sess.question_ids) with ordinality as ids(question_id, ord)
      join public.questions qq on qq.id = ids.question_id
     order by ids.ord
  loop
    answer_item := coalesce(answer_map -> q.id, '{}'::jsonb);
    selected_index := case
      when (answer_item->>'selected_index') ~ '^-?[0-9]+$'
        then (answer_item->>'selected_index')::int
      when (answer_item->>'chosen_index') ~ '^-?[0-9]+$'
        then (answer_item->>'chosen_index')::int
      else -1
    end;
    safe_time := case
      when (answer_item->>'time_ms') ~ '^[0-9]+$'
        then greatest(0, least((answer_item->>'time_ms')::int, 3600000))
      else 0
    end;
    is_correct := selected_index = q.answer_index;
    total_time := total_time + safe_time;

    if is_correct then
      correct_count := correct_count + 1;
    else
      wrong_ids := array_append(wrong_ids, q.id);
    end if;

    per_question_xp := private.questdp_apply_question_result(
      me,
      q.id,
      is_correct,
      safe_time,
      award_source
    );
    earned_xp := earned_xp + per_question_xp;

    result_answers := result_answers || jsonb_build_array(
      jsonb_build_object(
        'questionId', q.id,
        'selectedIndex', selected_index,
        'correct', is_correct,
        'correctIndex', q.answer_index,
        'timeMs', safe_time,
        'xpAwarded', per_question_xp,
        'explanation', q.explanation
      )
    );
  end loop;

  insert into public.sessions (
    user_id, subject, chapter, chapter_title, topic, total, correct_count,
    total_time_ms, label, wrong_question_ids, flow, client_id, pass_number
  ) values (
    me,
    sess.subject,
    coalesce(sess.chapter, 0),
    sess.chapter_title,
    sess.topic,
    cardinality(sess.question_ids),
    correct_count,
    total_time,
    sess.label,
    wrong_ids,
    sess.flow,
    'attempt:' || sess.id::text,
    sess.pass_number
  )
  returning id into new_session_id;

  if earned_xp > 0 then
    if award_source = 'lesson' then
      update public.profiles
         set lesson_xp = public.profiles.lesson_xp + earned_xp,
             last_seen_at = now(),
             updated_at = now()
       where id = me;
    else
      perform public.bump_progress(earned_xp, private.questdp_kst_date());
    end if;
  else
    update public.profiles
       set last_seen_at = now(),
           updated_at = now()
     where id = me;
  end if;

  sess.result := jsonb_build_object(
    'ok', true,
    'sessionToken', sess.id,
    'sessionId', new_session_id,
    'total', cardinality(sess.question_ids),
    'correctCount', correct_count,
    'wrongQuestionIds', wrong_ids,
    'totalTimeMs', total_time,
    'xpAwarded', earned_xp,
    'answers', result_answers
  );

  update public.question_attempt_sessions
     set status = 'submitted',
         submitted_at = now(),
         result = sess.result
   where id = sess.id;

  return sess.result;
end;
$$;

create or replace function public.start_question_session(
  p_subject text,
  p_chapter integer default null,
  p_chapter_title text default null,
  p_topic text default null,
  p_flow text default 'play',
  p_label text default null,
  p_size integer default 10,
  p_pass_number integer default 1,
  p_question_ids text[] default null,
  p_client_request_id text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return private.start_question_session_internal(
    p_subject,
    p_chapter,
    p_chapter_title,
    p_topic,
    p_flow,
    p_label,
    p_size,
    p_pass_number,
    p_question_ids,
    p_client_request_id
  );
end;
$$;

create or replace function public.submit_question_session(
  p_session_token uuid,
  p_answers jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return private.submit_question_session_internal(p_session_token, p_answers);
end;
$$;

create or replace function public.start_lesson_question(
  p_question_id text,
  p_subject text default null,
  p_chapter integer default null,
  p_step_key text default null,
  p_client_request_id text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return private.start_question_session_internal(
    p_subject,
    p_chapter,
    null,
    null,
    'lesson',
    p_step_key,
    1,
    1,
    array[p_question_id],
    p_client_request_id
  );
end;
$$;

create or replace function public.submit_lesson_question(
  p_session_token uuid,
  p_question_id text,
  p_selected_index integer,
  p_time_ms integer,
  p_step_key text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  result jsonb;
  first_answer jsonb;
begin
  result := private.submit_question_session_internal(
    p_session_token,
    jsonb_build_array(jsonb_build_object(
      'question_id', p_question_id,
      'selected_index', p_selected_index,
      'time_ms', p_time_ms
    ))
  );

  first_answer := result #> '{answers,0}';
  if coalesce((first_answer->>'correct')::boolean, false)
     and p_step_key is not null
     and p_step_key ~ '^[a-z0-9-]+-s[0-9]{1,3}$' then
    insert into public.step_unlocks (user_id, step_key)
    values (auth.uid(), p_step_key)
    on conflict do nothing;
  end if;

  return result;
end;
$$;

create or replace function public.submit_lesson_answer_v2(
  p_question_id text,
  p_selected_index integer,
  p_time_ms integer,
  p_step_key text default null,
  p_client_request_id text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  started jsonb;
begin
  started := public.start_lesson_question(
    p_question_id,
    null,
    null,
    p_step_key,
    coalesce(p_client_request_id, 'lesson:' || p_question_id || ':' || extract(epoch from clock_timestamp())::text)
  );

  if not coalesce((started->>'ok')::boolean, false) then
    return started;
  end if;

  return public.submit_lesson_question(
    (started->>'sessionToken')::uuid,
    p_question_id,
    p_selected_index,
    p_time_ms,
    p_step_key
  );
end;
$$;

revoke execute on function public.start_question_session(text, integer, text, text, text, text, integer, integer, text[], text) from public, anon;
revoke execute on function public.submit_question_session(uuid, jsonb) from public, anon;
revoke execute on function public.start_lesson_question(text, text, integer, text, text) from public, anon;
revoke execute on function public.submit_lesson_question(uuid, text, integer, integer, text) from public, anon;
revoke execute on function public.submit_lesson_answer_v2(text, integer, integer, text, text) from public, anon;

grant execute on function public.start_question_session(text, integer, text, text, text, text, integer, integer, text[], text) to authenticated;
grant execute on function public.submit_question_session(uuid, jsonb) to authenticated;
grant execute on function public.start_lesson_question(text, text, integer, text, text) to authenticated;
grant execute on function public.submit_lesson_question(uuid, text, integer, integer, text) to authenticated;
grant execute on function public.submit_lesson_answer_v2(text, integer, integer, text, text) to authenticated;

grant execute on function private.start_question_session_internal(text, integer, text, text, text, text, integer, integer, text[], text) to authenticated;
grant execute on function private.submit_question_session_internal(uuid, jsonb) to authenticated;
grant execute on function private.questdp_has_unlimited_question_access(uuid) to authenticated;
grant execute on function private.questdp_public_question_payload(text[]) to authenticated;
grant execute on function private.questdp_apply_question_result(uuid, text, boolean, integer, text) to authenticated;

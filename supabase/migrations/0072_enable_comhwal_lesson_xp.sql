-- 0072 - Enable COMHWAL concept checkpoints in the server-authoritative lesson XP flow.
-- COMHWAL checkpoint question id count: 306

begin;

create table if not exists public.comhwal_lesson_questions (
  question_id text primary key,
  source_path text not null default 'src/data/comhwal/concepts.ts',
  updated_at timestamptz not null default now(),
  check (question_id ~ '^comhwal-[123]-[0-9]{3}-q[0-9]{2}$')
);

comment on table public.comhwal_lesson_questions is
  'Whitelist for generated COMHWAL concept checkpoint questions. The answer index is derived from the question id by private.comhwal_expected_answer_index.';

alter table public.comhwal_lesson_questions enable row level security;
revoke all on public.comhwal_lesson_questions from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.comhwal_expected_answer_index(p_question_id text)
returns integer
language plpgsql
immutable
set search_path = ''
as $$
declare
  parts text[];
  planet_no integer;
  topic_no integer;
  topic_base integer;
  question_no integer;
begin
  parts := regexp_match(p_question_id, '^comhwal-([123])-([0-9]{3})-q([0-9]{2})$');
  if parts is null then
    return null;
  end if;
  planet_no := parts[1]::integer;
  topic_no := parts[2]::integer;
  question_no := parts[3]::integer;
  topic_base := case planet_no
    when 1 then 1
    when 2 then 60
    else 107
  end;
  return mod((topic_no - topic_base) + (question_no - 1), 4);
end;
$$;

create or replace function private.submit_comhwal_lesson_answer_internal(
  p_question_id text,
  p_selected_index integer,
  p_time_ms integer,
  p_step_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  qid text := nullif(left(p_question_id, 160), '');
  expected_index integer;
  safe_selected integer := coalesce(p_selected_index, -1);
  safe_time integer := greatest(0, least(coalesce(p_time_ms, 0), 3600000));
  is_correct boolean := false;
  awarded integer := 0;
  allowed boolean := false;
begin
  if me is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  end if;

  if qid is null then
    return jsonb_build_object('ok', false, 'reason', 'invalid_question_id');
  end if;

  select exists (
    select 1 from public.comhwal_lesson_questions q where q.question_id = qid
  ) into allowed;

  if not allowed then
    return jsonb_build_object('ok', false, 'reason', 'unknown_question');
  end if;

  expected_index := private.comhwal_expected_answer_index(qid);
  if expected_index is null then
    return jsonb_build_object('ok', false, 'reason', 'invalid_question_id');
  end if;

  is_correct := safe_selected = expected_index;
  awarded := private.questdp_apply_question_result(me, qid, is_correct, safe_time, 'lesson');

  if awarded > 0 then
    update public.profiles
       set lesson_xp = public.profiles.lesson_xp + awarded,
           last_seen_at = now(),
           updated_at = now()
     where id = me;
  else
    update public.profiles
       set last_seen_at = now(),
           updated_at = now()
     where id = me;
  end if;

  if is_correct and p_step_key is not null and p_step_key ~ '^[a-z0-9-]+-s[0-9]{1,3}$' then
    insert into public.step_unlocks (user_id, step_key)
    values (me, p_step_key)
    on conflict do nothing;
  end if;

  return jsonb_build_object(
    'ok', true,
    'questionId', qid,
    'correct', is_correct,
    'correctIndex', expected_index,
    'selectedIndex', safe_selected,
    'xpAwarded', awarded
  );
end;
$$;

create or replace function public.submit_comhwal_lesson_answer(
  p_question_id text,
  p_selected_index integer,
  p_time_ms integer,
  p_step_key text default null
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.submit_comhwal_lesson_answer_internal(
    p_question_id, p_selected_index, p_time_ms, p_step_key
  );
$$;

revoke execute on function private.comhwal_expected_answer_index(text) from public, anon, authenticated;
revoke execute on function private.submit_comhwal_lesson_answer_internal(text, integer, integer, text) from public, anon, authenticated;
revoke execute on function public.submit_comhwal_lesson_answer(text, integer, integer, text) from public, anon;
grant execute on function private.submit_comhwal_lesson_answer_internal(text, integer, integer, text) to authenticated;
grant execute on function public.submit_comhwal_lesson_answer(text, integer, integer, text) to authenticated;

insert into public.comhwal_lesson_questions (question_id)
values
  ('comhwal-1-001-q03'),
  ('comhwal-1-001-q05'),
  ('comhwal-1-001-q07'),
  ('comhwal-1-001-q09'),
  ('comhwal-1-002-q02'),
  ('comhwal-1-002-q04'),
  ('comhwal-1-003-q02'),
  ('comhwal-1-003-q04'),
  ('comhwal-1-004-q02'),
  ('comhwal-1-004-q04'),
  ('comhwal-1-005-q02'),
  ('comhwal-1-005-q04'),
  ('comhwal-1-006-q02'),
  ('comhwal-1-006-q04'),
  ('comhwal-1-007-q02'),
  ('comhwal-1-007-q04'),
  ('comhwal-1-008-q02'),
  ('comhwal-1-008-q04'),
  ('comhwal-1-009-q02'),
  ('comhwal-1-009-q04'),
  ('comhwal-1-010-q02'),
  ('comhwal-1-010-q04'),
  ('comhwal-1-011-q02'),
  ('comhwal-1-011-q04'),
  ('comhwal-1-012-q02'),
  ('comhwal-1-012-q04'),
  ('comhwal-1-013-q02'),
  ('comhwal-1-013-q04'),
  ('comhwal-1-014-q02'),
  ('comhwal-1-014-q04'),
  ('comhwal-1-015-q02'),
  ('comhwal-1-015-q04'),
  ('comhwal-1-016-q02'),
  ('comhwal-1-016-q04'),
  ('comhwal-1-017-q02'),
  ('comhwal-1-017-q04'),
  ('comhwal-1-018-q02'),
  ('comhwal-1-018-q04'),
  ('comhwal-1-019-q02'),
  ('comhwal-1-019-q04'),
  ('comhwal-1-020-q02'),
  ('comhwal-1-020-q04'),
  ('comhwal-1-021-q02'),
  ('comhwal-1-021-q04'),
  ('comhwal-1-022-q02'),
  ('comhwal-1-022-q04'),
  ('comhwal-1-023-q02'),
  ('comhwal-1-023-q04'),
  ('comhwal-1-024-q02'),
  ('comhwal-1-024-q04'),
  ('comhwal-1-025-q02'),
  ('comhwal-1-025-q04'),
  ('comhwal-1-026-q02'),
  ('comhwal-1-026-q04'),
  ('comhwal-1-027-q02'),
  ('comhwal-1-027-q04'),
  ('comhwal-1-028-q02'),
  ('comhwal-1-028-q04'),
  ('comhwal-1-029-q02'),
  ('comhwal-1-029-q04'),
  ('comhwal-1-030-q02'),
  ('comhwal-1-030-q04'),
  ('comhwal-1-031-q02'),
  ('comhwal-1-031-q04'),
  ('comhwal-1-032-q02'),
  ('comhwal-1-032-q04'),
  ('comhwal-1-033-q02'),
  ('comhwal-1-033-q04'),
  ('comhwal-1-034-q02'),
  ('comhwal-1-034-q04'),
  ('comhwal-1-035-q02'),
  ('comhwal-1-035-q04'),
  ('comhwal-1-036-q02'),
  ('comhwal-1-036-q04'),
  ('comhwal-1-037-q02'),
  ('comhwal-1-037-q04'),
  ('comhwal-1-038-q02'),
  ('comhwal-1-038-q04'),
  ('comhwal-1-039-q02'),
  ('comhwal-1-039-q04')
on conflict (question_id) do update set
  source_path = excluded.source_path,
  updated_at = now();

insert into public.comhwal_lesson_questions (question_id)
values
  ('comhwal-1-040-q02'),
  ('comhwal-1-040-q04'),
  ('comhwal-1-041-q02'),
  ('comhwal-1-041-q04'),
  ('comhwal-1-042-q02'),
  ('comhwal-1-042-q04'),
  ('comhwal-1-043-q02'),
  ('comhwal-1-043-q04'),
  ('comhwal-1-044-q02'),
  ('comhwal-1-044-q04'),
  ('comhwal-1-045-q02'),
  ('comhwal-1-045-q04'),
  ('comhwal-1-046-q02'),
  ('comhwal-1-046-q04'),
  ('comhwal-1-047-q02'),
  ('comhwal-1-047-q04'),
  ('comhwal-1-048-q02'),
  ('comhwal-1-048-q04'),
  ('comhwal-1-049-q02'),
  ('comhwal-1-049-q04'),
  ('comhwal-1-050-q02'),
  ('comhwal-1-050-q04'),
  ('comhwal-1-051-q02'),
  ('comhwal-1-051-q04'),
  ('comhwal-1-052-q02'),
  ('comhwal-1-052-q04'),
  ('comhwal-1-053-q02'),
  ('comhwal-1-053-q04'),
  ('comhwal-1-054-q02'),
  ('comhwal-1-054-q04'),
  ('comhwal-1-055-q02'),
  ('comhwal-1-055-q04'),
  ('comhwal-1-056-q02'),
  ('comhwal-1-056-q04'),
  ('comhwal-1-057-q02'),
  ('comhwal-1-057-q04'),
  ('comhwal-1-058-q02'),
  ('comhwal-1-058-q04'),
  ('comhwal-1-059-q02'),
  ('comhwal-1-059-q04'),
  ('comhwal-2-060-q02'),
  ('comhwal-2-060-q04'),
  ('comhwal-2-061-q02'),
  ('comhwal-2-061-q04'),
  ('comhwal-2-062-q02'),
  ('comhwal-2-062-q04'),
  ('comhwal-2-063-q02'),
  ('comhwal-2-063-q04'),
  ('comhwal-2-064-q02'),
  ('comhwal-2-064-q04'),
  ('comhwal-2-065-q02'),
  ('comhwal-2-065-q04'),
  ('comhwal-2-066-q02'),
  ('comhwal-2-066-q04'),
  ('comhwal-2-067-q02'),
  ('comhwal-2-067-q04'),
  ('comhwal-2-068-q02'),
  ('comhwal-2-068-q04'),
  ('comhwal-2-069-q02'),
  ('comhwal-2-069-q04'),
  ('comhwal-2-070-q02'),
  ('comhwal-2-070-q04'),
  ('comhwal-2-071-q02'),
  ('comhwal-2-071-q04'),
  ('comhwal-2-072-q02'),
  ('comhwal-2-072-q04'),
  ('comhwal-2-073-q02'),
  ('comhwal-2-073-q04'),
  ('comhwal-2-074-q02'),
  ('comhwal-2-074-q04'),
  ('comhwal-2-075-q02'),
  ('comhwal-2-075-q04'),
  ('comhwal-2-076-q02'),
  ('comhwal-2-076-q04'),
  ('comhwal-2-077-q02'),
  ('comhwal-2-077-q04'),
  ('comhwal-2-078-q02'),
  ('comhwal-2-078-q04'),
  ('comhwal-2-079-q02'),
  ('comhwal-2-079-q04')
on conflict (question_id) do update set
  source_path = excluded.source_path,
  updated_at = now();

insert into public.comhwal_lesson_questions (question_id)
values
  ('comhwal-2-080-q02'),
  ('comhwal-2-080-q04'),
  ('comhwal-2-081-q02'),
  ('comhwal-2-081-q04'),
  ('comhwal-2-082-q02'),
  ('comhwal-2-082-q04'),
  ('comhwal-2-083-q02'),
  ('comhwal-2-083-q04'),
  ('comhwal-2-084-q02'),
  ('comhwal-2-084-q04'),
  ('comhwal-2-085-q02'),
  ('comhwal-2-085-q04'),
  ('comhwal-2-086-q02'),
  ('comhwal-2-086-q04'),
  ('comhwal-2-087-q02'),
  ('comhwal-2-087-q04'),
  ('comhwal-2-088-q02'),
  ('comhwal-2-088-q04'),
  ('comhwal-2-089-q02'),
  ('comhwal-2-089-q04'),
  ('comhwal-2-090-q02'),
  ('comhwal-2-090-q04'),
  ('comhwal-2-091-q02'),
  ('comhwal-2-091-q04'),
  ('comhwal-2-092-q02'),
  ('comhwal-2-092-q04'),
  ('comhwal-2-093-q02'),
  ('comhwal-2-093-q04'),
  ('comhwal-2-094-q02'),
  ('comhwal-2-094-q04'),
  ('comhwal-2-095-q02'),
  ('comhwal-2-095-q04'),
  ('comhwal-2-096-q02'),
  ('comhwal-2-096-q04'),
  ('comhwal-2-097-q02'),
  ('comhwal-2-097-q04'),
  ('comhwal-2-098-q02'),
  ('comhwal-2-098-q04'),
  ('comhwal-2-099-q02'),
  ('comhwal-2-099-q04'),
  ('comhwal-2-100-q02'),
  ('comhwal-2-100-q04'),
  ('comhwal-2-101-q02'),
  ('comhwal-2-101-q04'),
  ('comhwal-2-102-q02'),
  ('comhwal-2-102-q04'),
  ('comhwal-2-103-q02'),
  ('comhwal-2-103-q04'),
  ('comhwal-2-104-q02'),
  ('comhwal-2-104-q04'),
  ('comhwal-2-105-q02'),
  ('comhwal-2-105-q04'),
  ('comhwal-2-106-q02'),
  ('comhwal-2-106-q04'),
  ('comhwal-3-107-q02'),
  ('comhwal-3-107-q04'),
  ('comhwal-3-108-q02'),
  ('comhwal-3-108-q04'),
  ('comhwal-3-109-q02'),
  ('comhwal-3-109-q04'),
  ('comhwal-3-110-q02'),
  ('comhwal-3-110-q04'),
  ('comhwal-3-111-q02'),
  ('comhwal-3-111-q04'),
  ('comhwal-3-112-q02'),
  ('comhwal-3-112-q04'),
  ('comhwal-3-113-q02'),
  ('comhwal-3-113-q04'),
  ('comhwal-3-114-q02'),
  ('comhwal-3-114-q04'),
  ('comhwal-3-115-q02'),
  ('comhwal-3-115-q04'),
  ('comhwal-3-116-q02'),
  ('comhwal-3-116-q04'),
  ('comhwal-3-117-q02'),
  ('comhwal-3-117-q04'),
  ('comhwal-3-118-q02'),
  ('comhwal-3-118-q04'),
  ('comhwal-3-119-q02'),
  ('comhwal-3-119-q04')
on conflict (question_id) do update set
  source_path = excluded.source_path,
  updated_at = now();

insert into public.comhwal_lesson_questions (question_id)
values
  ('comhwal-3-120-q02'),
  ('comhwal-3-120-q04'),
  ('comhwal-3-121-q02'),
  ('comhwal-3-121-q04'),
  ('comhwal-3-122-q02'),
  ('comhwal-3-122-q04'),
  ('comhwal-3-123-q02'),
  ('comhwal-3-123-q04'),
  ('comhwal-3-124-q02'),
  ('comhwal-3-124-q04'),
  ('comhwal-3-125-q02'),
  ('comhwal-3-125-q04'),
  ('comhwal-3-126-q02'),
  ('comhwal-3-126-q04'),
  ('comhwal-3-127-q02'),
  ('comhwal-3-127-q04'),
  ('comhwal-3-128-q02'),
  ('comhwal-3-128-q04'),
  ('comhwal-3-129-q02'),
  ('comhwal-3-129-q04'),
  ('comhwal-3-130-q02'),
  ('comhwal-3-130-q04'),
  ('comhwal-3-131-q02'),
  ('comhwal-3-131-q04'),
  ('comhwal-3-132-q02'),
  ('comhwal-3-132-q04'),
  ('comhwal-3-133-q02'),
  ('comhwal-3-133-q04'),
  ('comhwal-3-134-q02'),
  ('comhwal-3-134-q04'),
  ('comhwal-3-135-q02'),
  ('comhwal-3-135-q04'),
  ('comhwal-3-136-q02'),
  ('comhwal-3-136-q04'),
  ('comhwal-3-137-q02'),
  ('comhwal-3-137-q04'),
  ('comhwal-3-138-q02'),
  ('comhwal-3-138-q04'),
  ('comhwal-3-139-q02'),
  ('comhwal-3-139-q04'),
  ('comhwal-3-140-q02'),
  ('comhwal-3-140-q04'),
  ('comhwal-3-141-q02'),
  ('comhwal-3-141-q04'),
  ('comhwal-3-142-q02'),
  ('comhwal-3-142-q04'),
  ('comhwal-3-143-q02'),
  ('comhwal-3-143-q04'),
  ('comhwal-3-144-q02'),
  ('comhwal-3-144-q04'),
  ('comhwal-3-145-q02'),
  ('comhwal-3-145-q04'),
  ('comhwal-3-146-q02'),
  ('comhwal-3-146-q04'),
  ('comhwal-3-147-q02'),
  ('comhwal-3-147-q04'),
  ('comhwal-3-148-q02'),
  ('comhwal-3-148-q04'),
  ('comhwal-3-149-q02'),
  ('comhwal-3-149-q04'),
  ('comhwal-3-150-q02'),
  ('comhwal-3-150-q04'),
  ('comhwal-3-151-q02'),
  ('comhwal-3-151-q04'),
  ('comhwal-3-152-q02'),
  ('comhwal-3-152-q04')
on conflict (question_id) do update set
  source_path = excluded.source_path,
  updated_at = now();

commit;

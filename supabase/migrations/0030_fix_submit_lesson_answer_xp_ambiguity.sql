-- 0030 — Fix submit_lesson_answer output-column ambiguity.

begin;

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

commit;

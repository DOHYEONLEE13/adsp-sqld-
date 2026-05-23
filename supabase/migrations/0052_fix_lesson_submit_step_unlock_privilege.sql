-- 0052 - Fix v2 lesson submission rollback caused by step_unlocks privileges.
--
-- 0029 intentionally revoked direct browser INSERT on step_unlocks.
-- 0036 later added v2 lesson submission, but public.submit_lesson_question
-- still inserted into step_unlocks as the authenticated caller. That made
-- otherwise-valid lesson submissions fail at the final unlock step, leaving
-- question_attempt_sessions stuck as "started" and profiles.lesson_xp unchanged.

begin;

create or replace function private.questdp_unlock_step_for_user(
  p_user_id uuid,
  p_step_key text
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.step_unlocks (user_id, step_key)
  select p_user_id, p_step_key
  where p_user_id is not null
    and p_user_id = auth.uid()
    and p_step_key is not null
    and p_step_key ~ '^[a-z0-9-]+-s[0-9]{1,3}$'
  on conflict do nothing;
$$;

revoke execute on function private.questdp_unlock_step_for_user(uuid, text)
  from public, anon;
grant execute on function private.questdp_unlock_step_for_user(uuid, text)
  to authenticated;

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
    perform private.questdp_unlock_step_for_user(auth.uid(), p_step_key);
  end if;

  return result;
end;
$$;

revoke execute on function public.submit_lesson_question(uuid, text, integer, integer, text)
  from public, anon;
grant execute on function public.submit_lesson_question(uuid, text, integer, integer, text)
  to authenticated;

commit;

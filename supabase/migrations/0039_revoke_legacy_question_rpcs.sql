-- Close the v1 question submission bypass after the v2 frontend rollout.
--
-- `complete_quest_session` and `submit_lesson_answer` trusted client-side
-- correctness / session data. New clients use:
--   - start_question_session + submit_question_session
--   - start_lesson_question + submit_lesson_question
--   - submit_lesson_answer_v2 for transitional single-question panels

revoke execute on function public.complete_quest_session(
  text, integer, text, text, integer, integer, integer, text, text[], text, integer, jsonb, text
) from public, anon, authenticated;

revoke execute on function public.submit_lesson_answer(
  text, boolean, integer, text
) from public, anon, authenticated;

-- 0032 — Keep record_session internal; clients use complete_quest_session.

begin;

revoke execute on function public.record_session(
  text, int, text, text, int, int, int, text, text[], text, int, jsonb, text
) from public, anon, authenticated;

commit;

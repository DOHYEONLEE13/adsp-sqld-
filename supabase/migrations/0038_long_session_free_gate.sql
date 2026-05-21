-- Narrow the free-plan gate from "all test flow" to "long sessions".
--
-- The first v2 rollout blocked every `flow = test` session for free users.
-- That was too broad: chapter/topic 10-question checks should remain usable
-- under the daily new-question quota. The exploit path is long sessions
-- (review/mock exam batches) that award many first-correct XP entries at once.

do $$
declare
  ddl text;
begin
  select pg_get_functiondef(
    'private.start_question_session_internal(text, integer, text, text, text, text, integer, integer, text[], text)'::regprocedure
  )
    into ddl;

  ddl := replace(
    ddl,
    'if not unlimited and lower(coalesce(p_flow, '''')) = ''test'' then',
    'if not unlimited and safe_size > 10 then'
  );

  ddl := replace(
    ddl,
    '''message'', ''full_mock_exam_requires_premium''',
    '''message'', ''long_question_session_requires_premium'',
      ''requestedSize'', safe_size,
      ''limitCount'', 10'
  );

  if position('if not unlimited and safe_size > 10 then' in ddl) = 0 then
    raise exception 'Could not patch start_question_session_internal long-session gate';
  end if;

  execute ddl;
end $$;

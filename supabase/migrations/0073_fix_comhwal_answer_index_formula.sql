-- 0073 - Correct COMHWAL answer-index derivation for planet-local topic numbering.
--
-- 0072 initially derived the seed from the absolute topic id. The generated
-- COMHWAL cards reset topicIndex inside each planet:
--   computer-general: 001 -> seed base 0
--   spreadsheet-general: 060 -> seed base 0
--   database-general: 107 -> seed base 0

begin;

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

revoke execute on function private.comhwal_expected_answer_index(text)
  from public, anon, authenticated;

commit;

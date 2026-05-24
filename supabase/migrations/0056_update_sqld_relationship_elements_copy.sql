-- 0056 - Clarify SQLD relationship elements copy.
--
-- "관차선" is a mnemonic, not the concept itself. Keep the server question
-- bank aligned with the local question copy so users answer the official
-- concept ("관계의 3요소") rather than the memory hook.

update public.questions
set
  stem = '관계의 3요소에 포함되지 않는 것은?',
  explanation = '"관계의 3요소는 관계명, 차수, 선택사양입니다. “관차선”은 이 세 가지를 기억하기 위한 암기어예요. 파생속성은 속성 분류와 관련된 용어입니다."'::jsonb,
  source_path = 'src/data/questions/sqld/concept-practice.json',
  updated_at = now()
where id = 'sqld-1-1-cp-07-elements';

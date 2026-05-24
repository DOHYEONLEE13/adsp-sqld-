-- 0057 - Clarify SQLD identifier type explanation.
--
-- Keep the server question bank aligned with the local lesson copy. Identifier
-- categories should be shown with the full "식별자" suffix so beginners do not
-- have to infer that "주/보조" means "주식별자/보조식별자".

update public.questions
set
  explanation = '"식별자 분류에는 주식별자/보조식별자, 내부식별자/외부식별자, 단일식별자/복합식별자, 본질식별자/인조식별자 등이 있습니다. 삽입식별자/삭제식별자는 식별자 분류 기준이 아닙니다."'::jsonb,
  source_path = 'src/data/questions/sqld/concept-practice.json',
  updated_at = now()
where id = 'sqld-1-1-cp-08-types';

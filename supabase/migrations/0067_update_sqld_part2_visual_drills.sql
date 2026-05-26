-- 0067 - Align SQLD Part 2 visual lesson drills with local content.
--
-- No new question IDs are introduced here. These updates keep server-side
-- lesson reservation and grading in sync with the existing local quiz IDs.

update public.questions
set
  stem = 'ACID 4특성 연결로 가장 적절한 것은?',
  choices = '["원자성=전부 성공/취소, 일관성=규칙 유지, 고립성=간섭 최소화, 지속성=커밋 결과 보존","원자성=커밋 결과 보존, 일관성=전부 성공/취소, 고립성=규칙 삭제, 지속성=임시 저장","원자성=중복 허용, 일관성=정렬 순서, 고립성=컬럼 이름 변경, 지속성=JOIN 제거","원자성=NULL 처리, 일관성=테이블 통합, 고립성=PK 삭제, 지속성=WHERE 금지"]'::jsonb,
  answer_index = 0,
  explanation = '"ACID는 원자성(전부 성공/취소), 일관성(제약과 규칙 유지), 고립성(동시 실행 간섭 최소화), 지속성(커밋 결과 보존)을 뜻합니다."'::jsonb,
  lifecycle = 'self-reviewed',
  is_playable = true,
  source_path = 'src/data/questions/sqld/concept-practice.json',
  updated_at = now()
where id = 'sqld-1-2-cp-06-acid';

update public.questions
set
  stem = 'NULL 비교와 산술에 대한 설명으로 옳은 것은?',
  choices = '["NULL 값은 col = NULL로 찾고, NULL + 1은 1이 된다","NULL 값은 col IS NULL로 찾고, NULL + 1은 NULL이 된다","NULL 값은 col LIKE NULL로 찾고, NULL * 0은 0이 된다","NULL 값은 col <> NULL로 찾고, NULL과 비교하면 항상 TRUE다"]'::jsonb,
  answer_index = 1,
  explanation = '"NULL 여부는 IS NULL 또는 IS NOT NULL로 확인합니다. 산술에 NULL이 끼면 결과도 알 수 없어서 NULL이 됩니다."'::jsonb,
  lifecycle = 'self-reviewed',
  is_playable = true,
  source_path = 'src/data/questions/sqld/concept-practice.json',
  updated_at = now()
where id = 'sqld-1-2-cp-07-compare';

-- 0065 - Align SQLD anomaly intro drill with beginner lesson flow.
--
-- The first anomaly step now checks the basic cause of anomaly before the
-- learner studies insertion, deletion, and update anomalies one by one.

update public.questions
set
  stem = '이상 현상(Anomaly)이 생기기 쉬운 상황으로 가장 적절한 것은?',
  choices = '["한 표에 학생 정보와 학과 정보가 섞여 같은 학과명이 반복된다","표 이름을 시험 범위에 맞게 한글로 적는다","각 표에 필요한 정보만 나누어 저장한다","조회 화면의 글자 크기를 크게 만든다"]'::jsonb,
  answer_index = 0,
  explanation = '"이상 현상은 한 표에 여러 정보를 섞어 중복이 생길 때 발생하기 쉽습니다. 같은 학과명이 여러 행에 반복되면 데이터를 넣거나 지우거나 고칠 때 문제가 생길 수 있습니다."'::jsonb,
  lifecycle = 'self-reviewed',
  is_playable = true,
  source_path = 'src/data/questions/sqld/concept-practice.json',
  updated_at = now()
where id = 'sqld-1-2-cp-01';

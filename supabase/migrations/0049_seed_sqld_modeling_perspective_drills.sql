-- 0049 — Seed SQLD modeling perspective drill questions.
--
-- The "모델링의 3가지 관점" lesson was split into smaller mobile-friendly
-- steps:
--   1) 데이터 관점
--   2) 프로세스 관점
--   3) 상관 관점
--
-- Keep the server question bank aligned with the local LessonStep.quizId
-- values so v2 lesson play can reserve these questions by id.

insert into public.questions (
  id, subject, chapter, chapter_title, topic, canonical_topic, subtopic,
  pass_number, difficulty, stem, choices, answer_index, explanation,
  lifecycle, is_playable, source_path, updated_at
) values
  (
    'sqld-1-1-cp-01d-data',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    1,
    '수강신청 업무를 데이터 관점으로 볼 때 가장 알맞은 설명은?',
    '["신청 화면이 어떤 순서로 넘어가는지 본다","학생, 과목, 신청 기록처럼 무엇을 저장할지 본다","신청 버튼이 어떤 데이터를 읽고 새로 만드는지 본다","DBMS별 인덱스와 저장 공간을 먼저 정한다"]'::jsonb,
    1,
    '"데이터 관점은 무엇을 저장할지 보는 관점입니다. 학생, 과목, 수강신청 기록처럼 저장 대상과 속성을 찾는 것이 핵심입니다."'::jsonb,
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-1-1-cp-01d-process',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    1,
    '수강신청 업무를 프로세스 관점으로 볼 때 가장 알맞은 설명은?',
    '["무엇을 저장할지 엔터티와 속성을 찾는다","업무가 어떤 데이터를 만들고 읽고 고치는지 본다","강의 조회 → 과목 선택 → 신청 완료처럼 업무 순서를 본다","컬럼 자료형과 저장 공간을 정한다"]'::jsonb,
    2,
    '"프로세스 관점은 업무가 어떤 순서와 절차로 흐르는지 보는 관점입니다. 저장 대상은 데이터 관점, 업무와 데이터의 연결은 상관 관점에 가깝습니다."'::jsonb,
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-1-1-cp-01d-interaction',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    1,
    '수강신청 업무를 상관 관점으로 볼 때 가장 알맞은 설명은?',
    '["신청 업무가 학생 정보를 읽고 신청 기록을 새로 만드는지 본다","학생과 과목이라는 저장 대상만 나열한다","화면이 어떤 순서로 이동하는지만 정리한다","DBMS별 인덱스 이름을 정한다"]'::jsonb,
    0,
    '"상관 관점은 업무와 데이터가 만나는 지점을 봅니다. 즉 업무가 어떤 데이터를 만들고(Create), 읽고(Read), 고치고(Update), 지우는지(Delete) 확인하는 관점입니다."'::jsonb,
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  )
on conflict (id) do update set
  subject = excluded.subject,
  chapter = excluded.chapter,
  chapter_title = excluded.chapter_title,
  topic = excluded.topic,
  canonical_topic = excluded.canonical_topic,
  subtopic = excluded.subtopic,
  pass_number = excluded.pass_number,
  difficulty = excluded.difficulty,
  stem = excluded.stem,
  choices = excluded.choices,
  answer_index = excluded.answer_index,
  explanation = excluded.explanation,
  lifecycle = excluded.lifecycle,
  is_playable = excluded.is_playable,
  source_path = excluded.source_path,
  updated_at = now();

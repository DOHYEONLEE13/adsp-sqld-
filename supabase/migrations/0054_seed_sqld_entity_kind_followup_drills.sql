-- 0054 — Seed SQLD entity kind follow-up drills.
--
-- Keep server question bank aligned with the local SQLD entity classification
-- lesson. These two IDs are used as extraQuizIds after the 사건 엔터티 check.

insert into public.questions (
  id, subject, chapter, chapter_title, topic, canonical_topic, subtopic,
  pass_number, difficulty, stem, choices, answer_index, explanation,
  lifecycle, is_playable, source_path, updated_at
) values
  (
    'sqld-1-1-cp-05-kind-type',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    1,
    '“학생”처럼 실제로 존재하고 눈에 보이는 대상을 나타내는 엔터티 분류는?',
    '["사건 엔터티","유형 엔터티","기본 엔터티","개념 엔터티"]'::jsonb,
    1,
    '"학생, 책, 고객처럼 실제로 존재하고 눈에 보이거나 만질 수 있는 대상은 유형 엔터티입니다."'::jsonb,
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-1-1-cp-05-kind-concept',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    1,
    '“학과”처럼 만질 수는 없지만 기준으로 구분할 수 있는 대상을 나타내는 엔터티 분류는?',
    '["유형 엔터티","행위 엔터티","사건 엔터티","개념 엔터티"]'::jsonb,
    3,
    '"학과, 과목, 부서처럼 물리적 형태는 없지만 기준으로 구분할 수 있는 대상은 개념 엔터티입니다."'::jsonb,
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

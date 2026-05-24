-- 0058 - Seed SQLD identifier type follow-up drills.
--
-- The lesson now teaches identifier categories as full beginner-friendly pairs.
-- These drills make the three previously untested pairs explicit:
-- internal/external, single/composite, natural/surrogate.

insert into public.questions (
  id, subject, chapter, chapter_title, topic, canonical_topic, subtopic,
  pass_number, difficulty, stem, choices, answer_index, explanation,
  lifecycle, is_playable, source_path, updated_at
) values
  (
    'sqld-1-1-cp-08-types-internal-external',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    2,
    '수강내역 엔터티가 학생 엔터티의 학번을 가져와 학생을 참조한다면, 수강내역 입장에서 학번은?',
    '["내부식별자","외부식별자","보조식별자","인조식별자"]'::jsonb,
    1,
    '"외부식별자는 다른 엔터티에서 온 식별자입니다. 수강내역 안의 학번은 학생 엔터티의 식별자를 가져와 참조하므로 외부식별자에 가깝습니다."'::jsonb,
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-1-1-cp-08-types-single-composite',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    2,
    '수강내역을 학번과 과목ID를 함께 묶어 구분한다면 어떤 식별자에 가까울까?',
    '["단일식별자","복합식별자","외부식별자만","보조식별자만"]'::jsonb,
    1,
    '"복합식별자는 두 개 이상의 속성을 묶어 인스턴스를 구분하는 식별자입니다. 학번+과목ID처럼 여러 속성을 함께 쓰면 복합식별자입니다."'::jsonb,
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-1-1-cp-08-types-natural-surrogate',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    2,
    '시스템이 자동으로 만든 주문ID로 주문을 구분한다면 주문ID는 어떤 식별자에 가까울까?',
    '["본질식별자","인조식별자","외부식별자","보조식별자"]'::jsonb,
    1,
    '"인조식별자는 업무에 원래 있던 값이 아니라 시스템이 구분을 위해 만든 값입니다. 자동 생성 주문ID, 시퀀스 ID, UUID 같은 값이 대표 예시입니다."'::jsonb,
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

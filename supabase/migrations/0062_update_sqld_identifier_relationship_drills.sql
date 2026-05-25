-- 0062 - Update SQLD identifier relationship drills.
--
-- The identifier/non-identifying relationship lessons now teach the concept with
-- visual PK/FK placement examples. These upserts keep server-side question
-- reservation and grading aligned with the local concept-practice JSON.

insert into public.questions (
  id, subject, chapter, chapter_title, topic, canonical_topic, subtopic,
  pass_number, difficulty, stem, choices, answer_index, explanation,
  lifecycle, is_playable, source_path, updated_at
) values
  (
    'sqld-1-1-cp-09',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    2,
    '수강신청 엔터티의 PK가 (학번, 과목코드)이고, 학번은 학생 PK, 과목코드는 과목 PK에서 온 값이다. 이 관계 설명으로 가장 알맞은 것은?',
    '["비식별자 관계다. 부모 키가 자식 PK에 들어가지 않기 때문이다","식별자 관계다. 부모 PK가 자식 PK의 일부가 되기 때문이다","관계가 아니다. 학번과 과목코드는 속성이 될 수 없기 때문이다","항상 1:1 관계다. PK가 두 개이면 한 건만 저장되기 때문이다"]'::jsonb,
    1,
    '"식별자 관계는 부모 엔터티의 주식별자가 자식 엔터티의 주식별자 일부가 되는 관계입니다. 수강신청 PK가 학생의 학번과 과목의 과목코드를 포함하므로 식별자 관계로 볼 수 있습니다."'::jsonb,
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-1-1-cp-09-nonident',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    2,
    '주문 엔터티의 PK는 주문ID이고, 고객ID는 고객을 참조하는 FK로만 저장된다. 이 관계 설명으로 가장 알맞은 것은?',
    '["식별자 관계다. 고객ID가 주문 PK에 포함되기 때문이다","M:N 관계다. 주문ID와 고객ID가 모두 숫자이기 때문이다","비식별자 관계다. 부모 키가 자식 PK가 아니라 FK로만 존재하기 때문이다","관계가 아니다. FK는 엔터티 사이를 연결하지 않기 때문이다"]'::jsonb,
    2,
    '"비식별자 관계에서는 부모 식별자가 자식의 PK에 포함되지 않고 일반 속성 또는 FK로만 존재합니다. 주문은 주문ID로 구분되고 고객ID는 참조 값으로만 쓰이므로 비식별자 관계입니다."'::jsonb,
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-1-1-cp-09-compare',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    2,
    '식별자 관계와 비식별자 관계를 가르는 가장 중요한 기준은?',
    '["테이블 이름이 한글인지","자식 엔터티의 속성 개수가 많은지","관계명이 동사형으로 쓰였는지","부모 식별자가 자식 PK에 포함되는지"]'::jsonb,
    3,
    '"두 관계를 가르는 핵심은 부모 식별자가 자식 PK에 포함되는지입니다. 포함되면 식별자 관계, PK에 포함되지 않고 FK로만 있으면 비식별자 관계입니다."'::jsonb,
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

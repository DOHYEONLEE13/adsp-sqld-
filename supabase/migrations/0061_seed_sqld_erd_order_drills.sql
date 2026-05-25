-- 0061 - Seed SQLD ERD order drills.
--
-- ERD creation order is now taught as its own micro step with the mnemonic
-- "도배설명차선". These rows keep server-side reservation and grading aligned
-- with the local lesson JSON.

insert into public.questions (
  id, subject, chapter, chapter_title, topic, canonical_topic, subtopic,
  pass_number, difficulty, stem, choices, answer_index, explanation,
  lifecycle, is_playable, source_path, updated_at
) values
  (
    'sqld-1-1-cp-07-erd-order',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    2,
    'ERD 작성 순서로 가장 적절한 것은?',
    '["관계명 기술 → 엔터티 도출 → 관계 차수 설정 → 엔터티 배치 → 필수/선택사양 기술","엔터티 배치 → 관계명 기술 → 엔터티 도출 → 관계 설정 → 필수/선택사양 기술","엔터티 도출 → 엔터티 배치 → 관계 설정 → 관계명 기술 → 관계 차수 설정 → 필수/선택사양 기술","관계 차수 설정 → 엔터티 도출 → 관계 설정 → 필수/선택사양 기술 → 엔터티 배치"]'::jsonb,
    2,
    '"ERD는 엔터티를 먼저 도출하고 배치한 뒤, 관계를 설정하고 관계명·차수·필수/선택사양을 차례로 기술합니다. 도배설명차선으로 기억하면 순서가 잡힙니다."'::jsonb,
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-1-1-cp-07-erd-placement',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    1,
    'ERD에서 핵심 엔터티 배치로 가장 적절한 것은?',
    '["중요한 엔터티를 왼쪽 상단 쪽에 두고, 추가 엔터티를 우측이나 하단으로 확장한다","모든 엔터티를 반드시 가나다순으로만 배치한다","관계선이 많이 꼬이도록 핵심 엔터티를 가장 아래에 둔다","속성이 가장 적은 엔터티만 왼쪽 상단에 둔다"]'::jsonb,
    0,
    '"ERD 배치에서는 중요한 엔터티를 왼쪽 상단 쪽에 두고, 추가로 발생하는 엔터티를 우측·하단으로 배치하면 흐름을 읽기 쉽고 관계선이 덜 꼬입니다."'::jsonb,
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

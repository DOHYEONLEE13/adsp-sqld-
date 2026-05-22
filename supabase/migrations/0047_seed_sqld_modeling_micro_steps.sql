-- 0047 — Seed SQLD modeling micro-step questions.
--
-- The frontend SQLD lesson was split into smaller beginner-friendly steps:
--   1) 데이터 모델링 정의
--   2) 좋은 모델의 3특징
--   3) 단순화
--   4) 모델링 3관점
--
-- v2 lesson play asks the server to reserve a question by id before showing
-- the quiz. Keep the server question bank aligned with the local lesson ids.

insert into public.questions (
  id, subject, chapter, chapter_title, topic, canonical_topic, subtopic,
  pass_number, difficulty, stem, choices, answer_index, explanation,
  lifecycle, is_playable, source_path, updated_at
) values
  (
    'sqld-1-1-cp-01',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    1,
    '모델링의 설명에 대해 옳은 것을 골라봐!',
    '["현실 세계의 정보를 약속된 표기법을 활용해 데이터베이스 구조로 표현하는 과정","이미 만들어진 테이블에서 원하는 행만 검색하는 과정","SQL 문장을 빠르게 실행하기 위해 서버 성능만 조정하는 과정","사용자가 입력한 데이터를 화면에 예쁘게 보여주는 디자인 과정"]'::jsonb,
    0,
    '"데이터 모델링은 현실 세계의 정보를 약속된 표기법(예: ERD)을 활용해 데이터베이스 구조로 표현하는 과정입니다. 검색, 성능 조정, 화면 디자인과는 목적이 달라요."'::jsonb,
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-1-1-cp-01b',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    1,
    '좋은 데이터 모델의 3가지 특징이 아닌 것은?',
    '["단순화","추상화","명확화","정형화"]'::jsonb,
    3,
    '"좋은 데이터 모델의 3가지 특징은 단순화·추상화·명확화, 줄여서 단추명입니다. 정형화는 이 묶음에 들어가지 않아요."'::jsonb,
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-1-1-cp-01c',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    1,
    '데이터 모델링의 ''단순화''에 가장 가까운 설명은?',
    '["현실의 모든 세부 내용을 빠짐없이 한 표에 넣는다","처음 보는 사람도 구조를 쉽게 이해할 수 있게 정리한다","DBMS 성능을 높이기 위해 인덱스를 많이 만든다","화면에서 보기 좋도록 색과 아이콘을 추가한다"]'::jsonb,
    1,
    '"단순화는 복잡한 현실을 처음 보는 사람도 이해할 수 있게 쉽게 정리하는 특징입니다. 모든 세부사항을 다 넣는 것은 단순화가 아니고, 성능 튜닝이나 화면 꾸미기도 모델링의 단순화와는 달라요."'::jsonb,
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-1-1-cp-01d',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    1,
    '데이터 모델링의 3가지 관점에 포함되지 않는 것은?',
    '["데이터 관점","프로세스 관점","상관 관점","물리 저장 관점"]'::jsonb,
    3,
    '"모델링의 3가지 관점은 데이터 관점, 프로세스 관점, 상관 관점입니다. 물리 저장 관점은 이 묶음이 아니라 물리적 모델링이나 저장 구조 쪽에 더 가깝습니다."'::jsonb,
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

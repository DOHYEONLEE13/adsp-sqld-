-- 0048 — Seed SQLD modeling abstraction and clarification questions.
--
-- The first SQLD modeling lesson now teaches each "단추명" feature as a
-- separate beginner-friendly step:
--   1) 단순화
--   2) 추상화
--   3) 명확화
--
-- v2 lesson play reserves questions from Supabase by id, so the server
-- question bank must include the two newly split follow-up checks.

insert into public.questions (
  id, subject, chapter, chapter_title, topic, canonical_topic, subtopic,
  pass_number, difficulty, stem, choices, answer_index, explanation,
  lifecycle, is_playable, source_path, updated_at
) values
  (
    'sqld-1-1-cp-01c-abstract',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    1,
    '데이터 모델링의 ''추상화''에 가장 가까운 설명은?',
    '["SQL 실행 속도를 높이기 위해 인덱스를 추가한다","처음 보는 사람도 쉽게 읽도록 화면 색을 화려하게 만든다","현실의 모든 내용을 다 넣지 않고 현재 업무에 필요한 핵심만 남긴다","같은 이름이 두 가지 뜻으로 쓰여도 그대로 둔다"]'::jsonb,
    2,
    '"추상화는 현실의 모든 세부사항을 다 넣는 것이 아니라, 현재 DB가 다뤄야 할 핵심 정보만 남기는 특징입니다. 화면 꾸미기, 모호한 이름 유지, 성능 튜닝과는 목적이 달라요."'::jsonb,
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-1-1-cp-01c-clear',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    1,
    '데이터 모델링의 ''명확화''에 가장 가까운 설명은?',
    '["업무와 관련 없는 세부사항을 모두 제거한다","처음 보는 사람도 구조를 읽기 쉽게 큰 단위로 나눈다","DB 서버의 저장 공간을 줄이기 위해 압축한다","데이터 이름과 관계를 누가 봐도 같은 의미로 해석되게 정한다"]'::jsonb,
    3,
    '"명확화는 같은 모델을 본 사람들이 같은 의미로 이해하도록 이름과 관계를 분명하게 표현하는 특징입니다. 핵심만 남기는 것은 추상화, 구조를 쉽게 읽게 하는 것은 단순화에 가깝습니다."'::jsonb,
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

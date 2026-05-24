-- 0055 - Seed SQLD logical independence follow-up drill.
--
-- Keep the server question bank aligned with the local SQLD ANSI/SPARC
-- data-independence lesson. This ID is used as the first quiz in the
-- data-independence step, before the existing physical-independence drill.

insert into public.questions (
  id, subject, chapter, chapter_title, topic, canonical_topic, subtopic,
  pass_number, difficulty, stem, choices, answer_index, explanation,
  lifecycle, is_playable, source_path, updated_at
) values (
  'sqld-1-1-cp-03-logical-independence',
  'sqld',
  1,
  '데이터 모델링의 이해',
  '데이터 모델링의 이해',
  '데이터 모델링의 이해',
  null,
  1,
  1,
  '논리적 독립성에 가장 가까운 상황은?',
  '["인덱스나 저장 위치를 바꿔도 화면과 전체 구조가 그대로다","사용자별 화면을 여러 개 만드는 것이다","장학금 정보를 DB 전체 구조에 추가해도 기존 학생 성적 화면은 그대로다","데이터 파일을 더 빠른 저장공간으로 옮기는 것이다"]'::jsonb,
  2,
  '"논리적 독립성은 개념 스키마가 바뀌어도 외부 스키마에 주는 영향을 줄이는 성질입니다. 새로 관리할 데이터 구조가 추가되어도 기존 사용자 화면이 그대로라면 논리적 독립성에 가깝습니다."'::jsonb,
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

-- 0071 - Reword ADSP data scientist competency drill.
--
-- Digital CAMERA is only a mnemonic. The learner-facing stem should ask about
-- the actual concept: the six competencies expected of a data scientist.

insert into public.questions (
  id, subject, chapter, chapter_title, topic, canonical_topic, subtopic,
  pass_number, difficulty, stem, choices, answer_index, explanation,
  lifecycle, is_playable, source_path, updated_at
) values (
  'adsp-1-3-cp-03',
  'adsp',
  1,
  '데이터 이해',
  'DS 6역량',
  'DS 6역량',
  null,
  1,
  2,
  '다음 중 데이터 사이언티스트에게 필요한 6가지 역량으로 보기 어려운 것은?',
  jsonb_build_array(
    'Communication (전달·시각화)',
    'Math (수학·통계)',
    'Research (새 가설·기법)',
    'Management (관리·경영)'
  ),
  3,
  to_jsonb('데이터 사이언티스트에게 필요한 6가지 역량은 Communication · Analytics · Math · Engineering · Research · Art로 정리할 수 있어. Digital CAMERA는 이 6가지를 기억하기 위한 암기 도구야. Management는 이 묶음에 포함되지 않아.'::text),
  'self-reviewed',
  true,
  'src/data/questions/adsp/concept-practice.json',
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
  updated_at = excluded.updated_at;

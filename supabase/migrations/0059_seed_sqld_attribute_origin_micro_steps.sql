-- 0059 - Seed SQLD attribute origin micro steps.
--
-- Attribute origin classification is now split into beginner-friendly
-- basic/designed/derived steps. These rows keep server-side reservation and
-- grading aligned with the local lesson JSON.

insert into public.questions (
  id, subject, chapter, chapter_title, topic, canonical_topic, subtopic,
  pass_number, difficulty, stem, choices, answer_index, explanation,
  lifecycle, is_playable, source_path, updated_at
) values
  (
    'sqld-1-1-cp-06',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    1,
    '속성(Attribute)에 가장 가까운 설명은?',
    '["더 이상 나누지 않고 하나의 의미로 쓰는 데이터 항목","엔터티 사이를 연결하는 선","데이터베이스 서버 이름","SQL 명령어 묶음"]'::jsonb,
    0,
    '"속성은 엔터티를 설명하는 최소 데이터 단위입니다. 한 속성에 하나의 의미만 담는 특징을 원자성이라고 합니다."'::jsonb,
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-1-1-cp-06-origin-basic',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    1,
    '다음 중 기본 속성에 가장 가까운 것은?',
    '["주문번호처럼 시스템이 새로 만든 값","총점처럼 다른 값에서 계산한 값","이름처럼 업무에 원래 존재하는 값","엔터티 사이를 잇는 관계선"]'::jsonb,
    2,
    '"기본 속성은 업무에 원래 존재하는 속성입니다. 이름, 생년월일, 주소처럼 현실 업무에서 자연스럽게 필요한 값이 여기에 가깝습니다."'::jsonb,
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-1-1-cp-06-origin-designed',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    1,
    '다음 중 설계 속성에 가장 가까운 것은?',
    '["회원을 관리하려고 시스템이 만든 회원ID","학생의 생년월일","생년월일로 계산한 나이","학생과 과목 사이의 수강 관계"]'::jsonb,
    0,
    '"설계 속성은 업무에 원래 있던 값이 아니라 시스템 설계 과정에서 필요해서 만든 속성입니다. 회원ID, 주문번호, 일련번호가 대표 예시입니다."'::jsonb,
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-1-1-cp-06-origin',
    'sqld',
    1,
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    '데이터 모델링의 이해',
    null,
    1,
    2,
    '생년월일을 이용해 계산한 “나이”는 어떤 속성에 가까운가?',
    '["기본 속성","설계 속성","외래 속성","파생 속성"]'::jsonb,
    3,
    '"파생 속성은 다른 속성에서 계산하거나 가공해서 만든 속성입니다. 나이는 생년월일이라는 원본 값에서 계산할 수 있으므로 파생 속성에 가깝습니다."'::jsonb,
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

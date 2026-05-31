-- 0069 - Keep SQLD Part 1 focused on reading SELECT flow.
--
-- DDL/DML/DCL/TCL command-group drills belong to Part 3 "관리 구문", not
-- Part 1 "SQL 기본". This migration keeps server-side reservations aligned
-- with the local lesson flow.

insert into public.questions (
  id, subject, chapter, chapter_title, topic, canonical_topic, subtopic,
  pass_number, difficulty, stem, choices, answer_index, explanation,
  lifecycle, is_playable, source_path, updated_at
) values
  (
    'sqld-2-1-cp-01',
    'sqld',
    2,
    'SQL 기본 및 활용',
    'SQL 기본',
    'SQL 기본',
    null,
    1,
    1,
    'SQL 기본 파트에서 먼저 잡아야 할 흐름으로 가장 적절한 것은?',
    jsonb_build_array(
      '테이블 구조를 만드는 명령과 권한 명령을 먼저 전부 외운다',
      '어떤 테이블을 볼지 정하고, 조건으로 행을 고르고, 필요한 열과 정렬을 읽는다',
      'COMMIT과 ROLLBACK만 외우면 SELECT 문장은 이해하지 않아도 된다',
      'DB 화면 디자인을 먼저 정하고 SQL 문장은 나중에 생각한다'
    ),
    1,
    to_jsonb('SQL 기본 파트에서는 SELECT 문장을 읽는 흐름이 먼저입니다. FROM으로 볼 테이블을 정하고, WHERE로 행을 거르고, SELECT/GROUP BY/HAVING/ORDER BY로 결과를 만드는 순서를 잡으면 이후 SQL이 훨씬 쉬워집니다. 구조·권한·트랜잭션 명령군은 관리 구문에서 따로 다룹니다.'::text),
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
  updated_at = excluded.updated_at;

update public.questions
set
  topic = '관리 구문',
  canonical_topic = '관리 구문',
  updated_at = now()
where id in (
  'sqld-2-1-cp-01-ddl-tcard'
);

insert into public.questions (
  id, subject, chapter, chapter_title, topic, canonical_topic, subtopic,
  pass_number, difficulty, stem, choices, answer_index, explanation,
  lifecycle, is_playable, source_path, updated_at
) values (
  'sqld-sql-lab-001',
  'sqld',
  2,
  'SQL 기본 및 활용',
  '관리 구문',
  '관리 구문',
  'DML',
  1,
  1,
  '방금 배운 DML 설명으로 가장 적절한 것은?',
  jsonb_build_array(
    '테이블 안의 행 데이터를 추가·수정·삭제·병합하는 명령군이다.',
    '사용자에게 로그인 권한을 주는 화면 디자인 규칙이다.',
    'SQL 문장을 예쁘게 줄바꿈하는 작성 규칙이다.',
    '시험 결과를 자동으로 채점하는 프로그램 이름이다.'
  ),
  0,
  to_jsonb('DML은 Data Manipulation Language, 즉 데이터 조작어입니다. 테이블 안의 행 데이터를 추가하는 INSERT, 수정하는 UPDATE, 삭제하는 DELETE, 병합하는 MERGE 흐름으로 이해하면 됩니다.'::text),
  'self-reviewed',
  true,
  'src/data/questions/sqld/sql-interpretation-drills.json',
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

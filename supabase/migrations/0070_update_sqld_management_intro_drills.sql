-- 0070 - Align SQLD management intro drills with the concept order.
--
-- The first TCL/DCL checks should ask only what the learner has just learned.
-- More detailed SAVEPOINT and GRANT/ADMIN option drills remain as follow-up
-- questions after the overview is established.

insert into public.questions (
  id, subject, chapter, chapter_title, topic, canonical_topic, subtopic,
  pass_number, difficulty, stem, choices, answer_index, explanation,
  lifecycle, is_playable, source_path, updated_at
) values
  (
    'sqld-2-3-cp-03',
    'sqld',
    2,
    'SQL 기본 및 활용',
    '관리 구문',
    '관리 구문',
    null,
    1,
    1,
    'TCL(Transaction Control Language)에 대한 설명으로 가장 적절한 것은?',
    jsonb_build_array(
      'COMMIT, ROLLBACK, SAVEPOINT처럼 트랜잭션을 확정하거나 되돌리는 명령군이다.',
      'CREATE, ALTER, DROP처럼 테이블 구조를 만들고 바꾸는 명령군이다.',
      'GRANT, REVOKE처럼 사용자 권한을 주고 회수하는 명령군이다.',
      'SUBSTR, ROUND처럼 값을 계산하거나 변환하는 함수 묶음이다.'
    ),
    0,
    to_jsonb('TCL은 Transaction Control Language, 즉 트랜잭션 제어어입니다. COMMIT은 변경을 확정하고, ROLLBACK은 되돌리고, SAVEPOINT는 중간 지점을 남깁니다.'::text),
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-2-3-cp-08',
    'sqld',
    2,
    'SQL 기본 및 활용',
    '관리 구문',
    '관리 구문',
    null,
    1,
    1,
    'DCL(Data Control Language)에 대한 설명으로 가장 적절한 것은?',
    jsonb_build_array(
      'GRANT, REVOKE처럼 DB 권한을 주고 회수하는 명령군이다.',
      'COMMIT, ROLLBACK처럼 트랜잭션을 확정하거나 되돌리는 명령군이다.',
      'CREATE, ALTER처럼 테이블 구조를 정의하고 바꾸는 명령군이다.',
      'WHERE, ORDER BY처럼 조회 결과를 거르고 정렬하는 구문이다.'
    ),
    0,
    to_jsonb('DCL은 Data Control Language, 즉 데이터 제어어입니다. DB에서는 권한 관리가 핵심이고, GRANT는 권한 부여, REVOKE는 권한 회수를 뜻합니다.'::text),
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-sql-lab-035',
    'sqld',
    2,
    'SQL 기본 및 활용',
    '관리 구문',
    '관리 구문',
    '권한 부여 옵션',
    1,
    3,
    'WITH GRANT OPTION과 WITH ADMIN OPTION의 차이로 옳지 않은 것은?',
    jsonb_build_array(
      'WITH GRANT OPTION은 객체 권한을 다시 부여할 수 있게 한다.',
      'WITH ADMIN OPTION은 시스템 권한을 다시 부여할 수 있게 한다.',
      'WITH GRANT OPTION으로 전달된 권한은 회수 시 연쇄 회수될 수 있다.',
      'WITH ADMIN OPTION으로 전달된 권한도 회수 시 항상 연쇄 회수된다.'
    ),
    3,
    to_jsonb('WITH GRANT OPTION은 객체 권한에 쓰이고 연쇄 회수될 수 있습니다. WITH ADMIN OPTION은 시스템 권한에 쓰이며, 권한을 준 사용자의 권한을 회수해도 그 사용자가 다시 부여한 권한은 보통 유지됩니다.'::text),
    'guidebook-verified',
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

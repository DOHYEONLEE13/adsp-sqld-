-- 0064 - Improve early SQLD Chapter 2 drill quality.
--
-- The first SQLD SQL drills now follow the content-edit guide more closely:
-- start with role/meaning checks, then move into interpretation and trap drills.
-- These upserts keep server-side reservations and grading aligned with local JSON.

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
    '학교 DB에 새 `학생` 테이블을 만들려고 해. `CREATE TABLE`이 속한 SQL 명령군은?',
    jsonb_build_array(
      'DML — 테이블 안의 데이터를 넣고 고치는 명령군',
      'TCL — 작업을 확정하거나 되돌리는 명령군',
      'DDL — 테이블 같은 DB 구조를 만들고 바꾸는 명령군',
      'DCL — 권한을 주고 회수하는 명령군'
    ),
    2,
    to_jsonb('CREATE TABLE은 새 테이블 구조를 만드는 명령이므로 DDL입니다. DML은 INSERT/UPDATE/DELETE처럼 데이터 행을 조작하고, TCL은 COMMIT/ROLLBACK, DCL은 GRANT/REVOKE와 연결됩니다.'::text),
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-2-1-cp-01-ddl-tcard',
    'sqld',
    2,
    'SQL 기본 및 활용',
    'SQL 기본',
    'SQL 기본',
    null,
    1,
    1,
    '`TCARD(티카드)`로 외우는 DDL 대표 명령 5개로 가장 알맞은 묶음은?',
    jsonb_build_array(
      'COMMIT, CREATE, ALTER, RENAME, DELETE',
      'TRUNCATE, CREATE, ALTER, RENAME, DROP',
      'SELECT, CREATE, ALTER, REVOKE, DROP',
      'TRUNCATE, CHANGE, ADD, ROLLBACK, DELETE'
    ),
    1,
    to_jsonb('TCARD는 DDL 대표 명령 5개를 기억하기 위한 암기법입니다. T=TRUNCATE, C=CREATE, A=ALTER, R=RENAME, D=DROP입니다. TRUNCATE는 행을 비우지만 테이블 구조를 다루는 DDL로 분류되는 시험 단골 함정입니다.'::text),
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-2-1-cp-02',
    'sqld',
    2,
    'SQL 기본 및 활용',
    'SQL 기본',
    'SQL 기본',
    null,
    1,
    1,
    'SQL의 `WHERE`처럼 조건에 맞는 행만 고르는 관계대수 연산은?',
    jsonb_build_array(
      '∪ (Union)',
      'π (Projection)',
      '× (Cartesian)',
      'σ (Selection)'
    ),
    3,
    to_jsonb('σ(Selection)는 조건을 만족하는 행을 고르는 연산이라 SQL의 WHERE와 가깝습니다. π는 열 선택, ∪는 합집합, ×는 모든 가능한 조합입니다.'::text),
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-2-1-cp-03',
    'sqld',
    2,
    'SQL 기본 및 활용',
    'SQL 기본',
    'SQL 기본',
    null,
    1,
    2,
    'SQL 절들의 논리적 처리 순서로 올바른 것은?',
    jsonb_build_array(
      'SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY',
      'FROM → SELECT → WHERE → GROUP BY → HAVING → ORDER BY',
      'WHERE → FROM → HAVING → GROUP BY → SELECT → ORDER BY',
      'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY'
    ),
    3,
    to_jsonb('FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY ("프웨그하셀오"). SELECT가 5번째라 ALIAS는 ORDER BY에서만 사용 가능합니다.'::text),
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-2-1-cp-04',
    'sqld',
    2,
    'SQL 기본 및 활용',
    'SQL 기본',
    'SQL 기본',
    null,
    1,
    2,
    'ALIAS(별칭)에 대한 설명으로 가장 적절한 것은?',
    jsonb_build_array(
      'SELECT에서 만든 별칭은 WHERE에서 바로 사용할 수 있다',
      '별칭은 테이블 이름에는 붙일 수 없고 컬럼에만 붙일 수 있다',
      '별칭은 실제 테이블 구조를 영구적으로 바꾸는 명령이다',
      '별칭은 결과 컬럼이나 테이블에 임시 이름을 붙여 SQL을 읽기 쉽게 만든다'
    ),
    3,
    to_jsonb('ALIAS는 결과 컬럼이나 테이블에 임시 이름을 붙이는 기능입니다. 실제 테이블 구조를 바꾸지는 않습니다. SELECT에서 만든 별칭은 WHERE보다 늦게 생기므로 WHERE에서는 사용할 수 없고, ORDER BY에서는 사용할 수 있습니다.'::text),
    'self-reviewed',
    true,
    'src/data/questions/sqld/concept-practice.json',
    now()
  ),
  (
    'sqld-sql-lab-001',
    'sqld',
    2,
    'SQL 기본 및 활용',
    'SQL 기본',
    'SQL 기본',
    'SQL 명령군',
    1,
    1,
    '다음 명령어 묶음 중 역할 분류가 가장 자연스러운 것은?',
    jsonb_build_array(
      'COMMIT, ROLLBACK은 권한을 다루므로 DCL이다.',
      'GRANT, REVOKE는 트랜잭션 저장 여부를 다루므로 TCL이다.',
      'CREATE, ALTER, DROP은 테이블 구조를 다루므로 DDL이다.',
      'INSERT, UPDATE, DELETE는 테이블 구조를 바꾸므로 DDL이다.'
    ),
    2,
    to_jsonb('DDL은 객체 구조 정의·변경·삭제 계열입니다. COMMIT/ROLLBACK은 TCL, GRANT/REVOKE는 DCL, INSERT/UPDATE/DELETE는 DML입니다.'::text),
    'guidebook-verified',
    true,
    'src/data/questions/sqld/sql-interpretation-drills.json',
    now()
  ),
  (
    'sqld-sql-lab-002',
    'sqld',
    2,
    'SQL 기본 및 활용',
    'SQL 기본',
    'SQL 기본',
    'SELECT 논리 실행 순서',
    1,
    2,
    '다음 SQL이 실패하는 가장 직접적인 이유는?',
    jsonb_build_array(
      'SAL * 12처럼 산술식을 SELECT에 쓸 수 없기 때문이다.',
      'WHERE 절에서는 숫자 비교 연산자를 사용할 수 없기 때문이다.',
      'EMP_ID를 함께 SELECT하면 반드시 GROUP BY가 필요하기 때문이다.',
      'WHERE가 SELECT보다 먼저 실행되어 YEAR_SAL 별칭을 알 수 없기 때문이다.'
    ),
    3,
    to_jsonb('논리 처리 순서는 FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY입니다. SELECT에서 만든 별칭은 ORDER BY에서는 쓸 수 있지만 WHERE에서는 사용할 수 없습니다.'::text),
    'guidebook-verified',
    true,
    'src/data/questions/sqld/sql-interpretation-drills.json',
    now()
  ),
  (
    'sqld-sql-lab-003',
    'sqld',
    2,
    'SQL 기본 및 활용',
    'SQL 기본',
    'SQL 기본',
    '관계대수',
    1,
    1,
    '관계대수 기호와 SQL 절의 연결로 가장 적절한 것은?',
    jsonb_build_array(
      'π는 두 릴레이션의 교집합을 구하므로 INTERSECT와 같다.',
      'σ는 조건에 맞는 행을 고르는 연산이므로 WHERE와 가깝다.',
      '×는 중복을 제거하는 연산이므로 DISTINCT와 같다.',
      '∩는 모든 가능한 행 조합을 만들므로 CROSS JOIN과 같다.'
    ),
    1,
    to_jsonb('σ(Selection)는 조건을 만족하는 행 선택, π(Projection)는 열 선택입니다. ×는 Cartesian product, ∩는 교집합입니다.'::text),
    'guidebook-verified',
    true,
    'src/data/questions/sqld/sql-interpretation-drills.json',
    now()
  ),
  (
    'sqld-sql-order-001',
    'sqld',
    2,
    'SQL 기본 및 활용',
    'SQL 기본',
    'SQL 기본',
    'SELECT 기본 구조',
    1,
    1,
    '블록을 순서대로 눌러 기본 조회문을 완성하세요.',
    jsonb_build_array(
      'FROM → WHERE → SELECT → ORDER BY',
      'SELECT → WHERE → FROM → ORDER BY',
      'SELECT → FROM → WHERE → ORDER BY',
      'WHERE → SELECT → FROM → ORDER BY'
    ),
    2,
    to_jsonb('기본 조회문은 SELECT로 표시할 컬럼을 정하고 FROM에서 테이블을 지정한 뒤, WHERE로 행을 거르고 ORDER BY로 최종 정렬합니다.'::text),
    'guidebook-verified',
    true,
    'src/data/questions/sqld/sql-interactive-drills.json',
    now()
  ),
  (
    'sqld-sql-order-002',
    'sqld',
    2,
    'SQL 기본 및 활용',
    'SQL 기본',
    'SQL 기본',
    'GROUP BY와 HAVING',
    1,
    2,
    '부서별 평균 급여가 5000 이상인 부서를 찾는 SQL을 완성하세요.',
    jsonb_build_array(
      'FROM → HAVING → GROUP BY',
      'GROUP BY → FROM → HAVING',
      'FROM → GROUP BY → HAVING',
      'HAVING → FROM → GROUP BY'
    ),
    2,
    to_jsonb('테이블은 FROM에서 정하고, DEPT_ID별로 GROUP BY 한 뒤, 그룹별 AVG(SAL) 조건은 HAVING에 둡니다.'::text),
    'guidebook-verified',
    true,
    'src/data/questions/sqld/sql-interactive-drills.json',
    now()
  )
on conflict (id) do update set
  stem = excluded.stem,
  choices = excluded.choices,
  answer_index = excluded.answer_index,
  explanation = excluded.explanation,
  difficulty = excluded.difficulty,
  lifecycle = excluded.lifecycle,
  source_path = excluded.source_path,
  updated_at = now();

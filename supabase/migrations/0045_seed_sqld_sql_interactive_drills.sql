-- Seed SQLD SQL interpretation and block-ordering interactive drills.
-- Generated from src/data/questions/sqld/sql-interactive-drills.json.
-- These are QuestDP original examples reconstructed from the SQLD scope; no source text is copied.

insert into public.questions (
  id, subject, chapter, chapter_title, topic, canonical_topic, subtopic,
  pass_number, difficulty, stem, choices, answer_index, explanation,
  lifecycle, is_playable, source_path, updated_at
) values
  ('sqld-sql-read-001', 'sqld', 2, 'SQL 기본 및 활용', 'SQL 기본', 'SQL 기본', 'SELECT 논리 실행 순서', 1, 2, '다음 SQL에서 HAVING이 필요한 이유로 가장 적절한 것은?', '["AVG(SAL)은 그룹화 이후 계산되므로 그룹 조건은 HAVING에 둔다.","HAVING은 SELECT보다 먼저 실행되므로 별칭 AVG_SAL을 반드시 써야 한다.","WHERE에서는 숫자 비교를 사용할 수 없어서 HAVING만 가능하다.","GROUP BY가 있으면 모든 조건은 무조건 HAVING으로만 써야 한다."]'::jsonb, 0, '"집계 함수 결과는 GROUP BY 이후에 생깁니다. 행 단위 조건은 WHERE, 그룹 단위 조건은 HAVING으로 구분합니다."'::jsonb, 'guidebook-verified', true, 'src/data/questions/sqld/sql-interactive-drills.json', now()),
  ('sqld-sql-read-002', 'sqld', 2, 'SQL 기본 및 활용', 'SQL 활용', 'SQL 활용', '상호연관 서브쿼리', 1, 3, '다음 SQL의 의미로 가장 적절한 것은?', '["주문이 한 번이라도 존재하는 고객을 조회한다.","주문이 없는 고객만 조회한다.","CUSTOMER와 ORDERS의 모든 가능한 조합을 만든다.","고객별 주문 금액 합계가 1 이상인 고객만 조회한다."]'::jsonb, 0, '"EXISTS는 서브쿼리 결과 행 존재 여부를 봅니다. 이 SQL은 각 고객에 대해 같은 CUST_ID의 주문이 있는지 확인합니다."'::jsonb, 'guidebook-verified', true, 'src/data/questions/sqld/sql-interactive-drills.json', now()),
  ('sqld-sql-read-003', 'sqld', 2, 'SQL 기본 및 활용', 'SQL 활용', 'SQL 활용', '윈도우 함수', 1, 3, '다음 SQL이 반환하는 BONUS_RANK의 의미로 가장 적절한 것은?', '["각 부서 안에서 BONUS가 높은 순서의 순위이다.","전체 회사에서 BONUS가 낮은 순서의 순위이다.","부서별 평균 BONUS를 한 행으로 압축한 결과이다.","BONUS가 NULL인 행만 따로 모은 번호이다."]'::jsonb, 0, '"PARTITION BY DEPT_ID는 부서별로 그룹을 나누되 행 수는 유지합니다. ORDER BY BONUS DESC 기준으로 각 부서 내부 순위를 계산합니다."'::jsonb, 'guidebook-verified', true, 'src/data/questions/sqld/sql-interactive-drills.json', now()),
  ('sqld-sql-read-004', 'sqld', 2, 'SQL 기본 및 활용', '관리 구문', '관리 구문', 'DDL 자동 커밋', 1, 3, 'Oracle 기준 다음 실행 후 ROLLBACK의 효과로 가장 적절한 것은?', '["INSERT 결과는 이미 커밋되어 ROLLBACK으로 되돌아가지 않는다.","CREATE TABLE만 취소되고 INSERT는 대기 상태로 남는다.","INSERT와 CREATE TABLE이 모두 취소된다.","ROLLBACK은 DDL 뒤에서는 항상 문법 오류로 실패한다."]'::jsonb, 0, '"Oracle의 DDL은 자동 COMMIT 성격이 있어 앞선 DML까지 확정될 수 있습니다. 따라서 DDL 이후 ROLLBACK이 이전 INSERT를 되돌리지 못합니다."'::jsonb, 'guidebook-verified', true, 'src/data/questions/sqld/sql-interactive-drills.json', now()),
  ('sqld-sql-order-001', 'sqld', 2, 'SQL 기본 및 활용', 'SQL 기본', 'SQL 기본', 'SELECT 기본 구조', 1, 1, '블록을 순서대로 눌러 기본 조회문을 완성하세요.', '["SELECT → FROM → WHERE → ORDER BY","FROM → WHERE → SELECT → ORDER BY","SELECT → WHERE → FROM → ORDER BY","WHERE → SELECT → FROM → ORDER BY"]'::jsonb, 0, '"기본 조회문은 SELECT로 표시할 컬럼을 정하고 FROM에서 테이블을 지정한 뒤, WHERE로 행을 거르고 ORDER BY로 최종 정렬합니다."'::jsonb, 'guidebook-verified', true, 'src/data/questions/sqld/sql-interactive-drills.json', now()),
  ('sqld-sql-order-002', 'sqld', 2, 'SQL 기본 및 활용', 'SQL 기본', 'SQL 기본', 'GROUP BY와 HAVING', 1, 2, '부서별 평균 급여가 5000 이상인 부서를 찾는 SQL을 완성하세요.', '["FROM → GROUP BY → HAVING","FROM → HAVING → GROUP BY","GROUP BY → FROM → HAVING","HAVING → FROM → GROUP BY"]'::jsonb, 0, '"테이블은 FROM에서 정하고, DEPT_ID별로 GROUP BY 한 뒤, 그룹별 AVG(SAL) 조건은 HAVING에 둡니다."'::jsonb, 'guidebook-verified', true, 'src/data/questions/sqld/sql-interactive-drills.json', now()),
  ('sqld-sql-order-003', 'sqld', 2, 'SQL 기본 및 활용', 'SQL 활용', 'SQL 활용', 'JOIN', 1, 2, '사원과 부서를 매칭하는 INNER JOIN을 완성하세요.', '["FROM → INNER JOIN → ON","INNER JOIN → FROM → ON","FROM → ON → INNER JOIN","ON → FROM → INNER JOIN"]'::jsonb, 0, '"JOIN 구문은 FROM 기준 테이블을 둔 뒤 INNER JOIN으로 결합할 테이블을 쓰고, ON에서 두 테이블의 연결 조건을 지정합니다."'::jsonb, 'guidebook-verified', true, 'src/data/questions/sqld/sql-interactive-drills.json', now()),
  ('sqld-sql-order-004', 'sqld', 2, 'SQL 기본 및 활용', 'SQL 활용', 'SQL 활용', 'NOT EXISTS', 1, 3, '계약이 없는 고객을 찾는 NULL 안전 패턴을 완성하세요.', '["WHERE NOT EXISTS → WHERE","WHERE → WHERE NOT EXISTS","NOT IN → WHERE","WHERE EXISTS → WHERE"]'::jsonb, 0, '"바깥 WHERE에는 NOT EXISTS를 두고, 안쪽 서브쿼리 WHERE에서 고객 키 매칭 조건을 씁니다. NULL이 섞여도 NOT IN보다 안전합니다."'::jsonb, 'guidebook-verified', true, 'src/data/questions/sqld/sql-interactive-drills.json', now()),
  ('sqld-sql-order-005', 'sqld', 2, 'SQL 기본 및 활용', 'SQL 활용', 'SQL 활용', '집합 연산자', 1, 2, '두 조회 결과를 중복 제거해 합치는 SQL을 완성하세요.', '["UNION → ORDER BY","ORDER BY → UNION","UNION ALL → WHERE","INTERSECT → ORDER BY"]'::jsonb, 0, '"UNION은 중복을 제거해 두 결과를 합칩니다. 집합 연산자의 ORDER BY는 마지막 SELECT 뒤에 전체 결과 기준으로 한 번만 씁니다."'::jsonb, 'guidebook-verified', true, 'src/data/questions/sqld/sql-interactive-drills.json', now()),
  ('sqld-sql-order-006', 'sqld', 2, 'SQL 기본 및 활용', 'SQL 활용', 'SQL 활용', 'Oracle TOP N', 1, 3, 'Oracle 구버전 기준 매출 상위 3건 조회 패턴을 완성하세요.', '["FROM → ORDER BY → WHERE","FROM → WHERE → ORDER BY","WHERE → FROM → ORDER BY","ORDER BY → FROM → WHERE"]'::jsonb, 0, '"Oracle 구버전 ROWNUM은 정렬 전에 붙을 수 있습니다. 그래서 인라인뷰 안에서 ORDER BY를 먼저 수행하고 바깥 WHERE ROWNUM <= N으로 제한합니다."'::jsonb, 'guidebook-verified', true, 'src/data/questions/sqld/sql-interactive-drills.json', now()),
  ('sqld-sql-order-007', 'sqld', 2, 'SQL 기본 및 활용', '관리 구문', '관리 구문', 'MERGE', 1, 3, 'MERGE의 기본 절 순서를 완성하세요.', '["MERGE INTO → USING → ON → WHEN MATCHED THEN → WHEN NOT MATCHED THEN","USING → MERGE INTO → ON → WHEN NOT MATCHED THEN → WHEN MATCHED THEN","MERGE INTO → ON → USING → WHEN MATCHED THEN → WHEN NOT MATCHED THEN","ON → MERGE INTO → USING → WHEN MATCHED THEN → WHEN NOT MATCHED THEN"]'::jsonb, 0, '"MERGE는 대상 테이블(MERGE INTO), 소스(USING), 매칭 조건(ON)을 먼저 정한 뒤 MATCHED/NOT MATCHED 분기로 UPDATE 또는 INSERT를 수행합니다."'::jsonb, 'guidebook-verified', true, 'src/data/questions/sqld/sql-interactive-drills.json', now()),
  ('sqld-sql-order-008', 'sqld', 2, 'SQL 기본 및 활용', '관리 구문', '관리 구문', 'CREATE TABLE', 1, 2, '학생 테이블 생성 SQL의 핵심 블록을 완성하세요.', '["CREATE TABLE → PRIMARY KEY → NOT NULL","PRIMARY KEY → CREATE TABLE → NOT NULL","CREATE TABLE → NOT NULL → PRIMARY KEY","NOT NULL → CREATE TABLE → PRIMARY KEY"]'::jsonb, 0, '"Oracle 기준 CREATE TABLE로 객체를 만들고, ID에는 PRIMARY KEY, NAME에는 NOT NULL 같은 제약조건을 컬럼 정의 뒤에 붙일 수 있습니다."'::jsonb, 'guidebook-verified', true, 'src/data/questions/sqld/sql-interactive-drills.json', now())
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

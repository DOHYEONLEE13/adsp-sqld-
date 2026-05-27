import type { Lesson } from '../types';

const SQLD_2_1: Lesson = {
  id: 'sqld-2-1',
  subject: 'sqld',
  chapter: 2,
  chapterTitle: 'SQL 기본 및 활용',
  topic: 'SQL 기본',
  title: 'SQL 명령군 · SELECT · 함수 · WHERE · GROUP/HAVING · ORDER BY',
  hook: '모든 쿼리의 뼈대. 실행 순서·NULL·집계함수·LIKE·정렬까지 한 번에.',
  estimatedMinutes: 18,
  steps: [
    {
      id: 'sqld-2-1-s1',
      title: 'SQL 명령군이란',
      group: 'sqld-2-1-g1-query-basics',
      dialogue: [
        { pose: 'wave', text: '[SQL]은 DB에 부탁하는 말이야. 만들고, 넣고, 권한을 주고, 되돌리는 말들이 있어.' },
        { pose: 'think', text: '이 명령어들은 역할에 따라 [4가지 군]으로 나눠. 처음엔 역할만 잡으면 돼.' },
        { pose: 'lightbulb', text: '[DDL]은 구조, [DML]은 데이터, [DCL]은 권한, [TCL]은 트랜잭션을 다뤄.' },
        { pose: 'happy', text: '처음부터 명령어를 전부 외우기보다, 먼저 “무엇을 건드리는 명령인가?”를 보면 돼.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'SQL은 DB에 “무엇을 해줘”라고 부탁하는 언어입니다. 먼저 명령어를 역할별로 나누어 보면 헷갈림이 줄어듭니다. 구조를 만드는 명령, 데이터를 다루는 명령, 권한을 관리하는 명령, 작업을 확정하거나 되돌리는 명령으로 나눠요.',
        },
        {
          kind: 'table',
          title: 'SQL 4명령군 비교',
          headers: ['군', '용도', '대표 명령'],
          rows: [
            ['DDL', '객체(테이블·뷰·인덱스) 정의·변경', 'CREATE, ALTER, DROP, RENAME, TRUNCATE'],
            ['DML', '데이터 조회·삽입·수정·삭제', 'SELECT, INSERT, UPDATE, DELETE, MERGE'],
            ['DCL', '권한 제어', 'GRANT, REVOKE'],
            ['TCL', '트랜잭션 제어', 'COMMIT, ROLLBACK, SAVEPOINT'],
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"정·조·권·트"',
          body:
            'DDL=정의, DML=조작, DCL=권한, TCL=트랜잭션. 각 군의 한국어 첫 글자로 먼저 큰 역할을 잡습니다.',
        },
      ],
    },
    {
      id: 'sqld-2-1-s1-ddl',
      title: 'DDL',
      quizId: 'sqld-2-1-cp-01',
      group: 'sqld-2-1-g1-query-basics',
      extraQuizIds: ['sqld-2-1-cp-01-ddl-tcard'],
      dialogue: [
        { pose: 'wave', text: '먼저 [DDL]부터 볼게.' },
        { pose: 'think', text: '[DDL]은 Data Definition Language의 약자야.\n한국어로는 데이터 정의어라고 불러.' },
        { pose: 'lightbulb', text: '테이블 같은 DB [구조]를 만들고, 바꾸고, 지우는 명령군이야.' },
        { pose: 'happy', text: 'CREATE는 만들기, ALTER는 바꾸기, DROP은 구조 삭제, RENAME은 이름 변경, TRUNCATE는 행 전체 비우기야.' },
        { pose: 'happy', text: 'DDL 5개는 [TCARD(티카드)]로 외우자.\nT = TRUNCATE\nC = CREATE\nA = ALTER\nR = RENAME\nD = DROP' },
        { pose: 'think', text: '특히 [TRUNCATE]는 행을 비우지만 DDL이야. DELETE랑 헷갈리게 자주 물어봐.' },
        { pose: 'idle', text: 'CREATE TABLE은 어느 명령군일까?' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'DDL(Data Definition Language)은 데이터가 들어갈 그릇, 즉 테이블·뷰·인덱스 같은 DB 객체의 구조를 정의하고 바꾸는 명령입니다.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"TCARD(티카드)"',
          body:
            'DDL 대표 명령 5개는 TCARD로 묶어 기억합니다.\nT=TRUNCATE, C=CREATE, A=ALTER, R=RENAME, D=DROP.\n모두 테이블 같은 DB 구조를 만들거나 바꾸거나 지우는 쪽입니다.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — TRUNCATE',
          body:
            'TRUNCATE는 행을 전부 비우기 때문에 DELETE처럼 느껴질 수 있습니다. 하지만 DDL이라 자동 COMMIT되고 ROLLBACK으로 되돌릴 수 없습니다.',
        },
      ],
    },
    {
      id: 'sqld-2-1-s1-dml-dcl-tcl',
      title: 'DML·DCL·TCL',
      quizId: 'sqld-sql-lab-001',
      group: 'sqld-2-1-g1-query-basics',
      dialogue: [
        { pose: 'wave', text: '이번에는 DML, DCL, TCL을 역할별로 묶어볼게.' },
        { pose: 'think', text: '[DML]은 Data Manipulation Language의 약자야.\n테이블 안의 데이터를 조회·추가·수정·삭제하는 명령군이야.' },
        { pose: 'happy', text: 'DML 5개는 [SIDUM(시둠)]으로 외우자.\nS = SELECT\nI = INSERT\nD = DELETE\nU = UPDATE\nM = MERGE' },
        { pose: 'lightbulb', text: '[DCL]은 Data Control Language의 약자야.\n누가 DB를 볼 수 있는지 권한을 주고 회수해.' },
        { pose: 'happy', text: 'DCL은 [GR(지알)]만 기억해도 돼.\nG = GRANT: 권한을 준다\nR = REVOKE: 권한을 회수한다' },
        { pose: 'think', text: '[TCL]은 Transaction Control Language의 약자야.\n작업을 확정하거나 되돌리는 명령군이야.' },
        { pose: 'lightbulb', text: 'TCL은 [CRS(커롤세)]로 묶자.\nC = COMMIT\nR = ROLLBACK\nS = SAVEPOINT' },
        { pose: 'idle', text: 'CREATE, ALTER, DROP은 구조를 다루니까 어느 명령군일까?' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"SIDUM(시둠)"',
          body:
            'DML 대표 명령 5개는 SIDUM으로 묶어 기억합니다.\nS=SELECT, I=INSERT, D=DELETE, U=UPDATE, M=MERGE.\n테이블 안의 데이터를 조회·추가·삭제·수정·병합하는 명령입니다.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"GR / CRS"',
          body:
            'DCL은 GRANT와 REVOKE라 GR(지알)로 기억합니다.\nTCL은 COMMIT, ROLLBACK, SAVEPOINT라 CRS(커롤세)로 기억합니다.',
        },
        {
          kind: 'section',
          title: 'SELECT 는 DQL 일까 DML 일까?',
          body:
            '엄격한 분류로는 SELECT만 따로 DQL(Data Query Language)로 부르기도 합니다. SQLD에서는 SELECT를 DML에 포함해 설명하는 흐름도 자주 보입니다. 보기에 DQL이 있으면 SELECT는 DQL로 볼 수 있다는 정도까지 기억하면 됩니다.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — DROP/INSERT 분류',
          body:
            'DROP = DDL (객체 삭제). INSERT = DML. "DROP 이 DML 인가요?" 보기는 항상 [틀림].',
        },
      ],
    },
    {
      id: 'sqld-2-1-s2',
      title: '관계대수',
      quizId: 'sqld-2-1-cp-02',
      group: 'sqld-2-1-g1-query-basics',
      extraQuizIds: ['sqld-2-1-cp-02-sql-map', 'sqld-sql-lab-003'],
      dialogue: [
        { pose: 'wave', text: 'SQL 은 [관계대수(Relational Algebra)] 라는 수학에서 출발했어.' },
        { pose: 'think', text: '처음엔 어렵게 느껴지지만, 일단 [릴레이션 = 테이블]이라고 생각하면 돼.' },
        { pose: 'lightbulb', text: '관계대수는 테이블에서 [행을 고르고], [열을 고르고], [테이블끼리 합치는] 규칙이야.' },
        { pose: 'happy', text: '그래서 첫 문제는 기호 암기보다 “WHERE와 가까운 연산이 무엇인지”부터 확인할 거야.' },
        { pose: 'happy', text: 'SQL 명령은 이 관계대수 규칙을 사람이 쓰기 쉬운 문장으로 바꾼 것이라고 보면 돼.' },
        { pose: 'happy', text: '먼저 혼자 쓰이는 연산 2개만 보자. [σ]는 행을 고르고, [π]는 열을 고르는 연산이야.' },
        { pose: 'think', text: '[σ(시그마)]는 조건에 맞는 [행]만 고른다고 보면 돼. SQL에서는 WHERE와 가장 가까워.' },
        { pose: 'lightbulb', text: '[π(파이)]는 필요한 [열]만 고르는 연산이야. SQL에서는 SELECT 절의 컬럼 선택과 연결돼.' },
        { pose: 'happy', text: '두 테이블을 함께 볼 때는 합집합, 교집합, 차집합, 모든 조합 같은 연산이 나와.' },
        { pose: 'think', text: '[∪]는 합치기, [∩]는 겹치는 것만, [−]는 앞쪽에만 있는 것, [×]는 가능한 모든 쌍을 만든다고 기억하면 쉬워.' },
        { pose: 'lightbulb', text: '[⨝]는 공통 속성을 기준으로 두 테이블을 붙이는 연산이야. SQL의 JOIN을 떠올리면 돼.' },
        { pose: 'happy', text: '처음에는 [σ = WHERE], [π = SELECT 컬럼], [⨝ = JOIN], [× = CROSS JOIN]만 연결해도 충분해.' },
        { pose: 'idle', text: '이제 ‘양쪽에 모두 있는 행’처럼 겹치는 부분을 묻는 문제로 확인해보자.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '관계대수는 관계형 DB가 테이블을 다루는 기본 규칙입니다. 처음에는 기호를 전부 외우기보다 “WHERE는 행 선택, SELECT 컬럼은 열 선택, JOIN은 테이블 결합”처럼 SQL 절과 연결해서 이해하면 쉽습니다.',
        },
        {
          kind: 'table',
          title: '관계대수 7대 연산자',
          headers: ['구분', '기호', '이름', '의미', 'SQL 대응'],
          rows: [
            ['단항', 'σ', 'Selection', '조건 만족 행 선택', 'WHERE'],
            ['단항', 'π', 'Projection', '특정 열 추출', 'SELECT col1, col2'],
            ['이항', '∪', 'Union', '합집합', 'UNION'],
            ['이항', '∩', 'Intersect', '교집합', 'INTERSECT'],
            ['이항', '−', 'Difference', '차집합', 'MINUS / EXCEPT'],
            ['이항', '×', 'Cartesian', '모든 쌍 조합', 'CROSS JOIN'],
            ['조인', '⨝', 'Join', '공통 속성으로 결합', 'INNER JOIN'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '실 SQL 과의 1:1 대응',
          body:
            'SELECT col1, col2 FROM T WHERE cond → π_col1,col2 (σ_cond (T)). 즉 WHERE 가 먼저 적용된 결과에 SELECT (Projection) 적용.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"시·파·합·교·차·카·조"',
          body:
            'σ Selection / π Projection / ∪ Union / ∩ Intersect / − Difference / × Cartesian / ⨝ Join. 7개 연산자 첫 글자.',
        },
      ],
    },
    {
      id: 'sqld-2-1-s3',
      title: 'SELECT 실행 순서',
      quizId: 'sqld-2-1-cp-03',
      group: 'sqld-2-1-g1-query-basics',
      extraQuizIds: ['sqld-sql-lab-002', 'sqld-sql-order-001'],
      dialogue: [
        { pose: 'wave', text: 'SQL은 우리가 쓰는 순서와 DB가 실제로 처리하는 순서가 달라.' },
        { pose: 'think', text: '눈에는 SELECT가 먼저 보이지만, DB는 먼저 FROM에서 어떤 표를 볼지 정해.' },
        { pose: 'lightbulb', text: '처리 순서는 [FROM] → [WHERE] → [GROUP BY] → [HAVING] → [SELECT] → [ORDER BY]야.' },
        { pose: 'happy', text: '줄여서 [프·웨·그·하·셀·오]로 기억하면 흐름을 떠올리기 쉬워.' },
        { pose: 'think', text: '이 순서를 알아야 어떤 절에서 별칭이나 집계함수를 쓸 수 있는지 판단할 수 있어.' },
        { pose: 'lightbulb', text: '예: WHERE 는 SELECT 보다 [먼저] 실행되니까 WHERE 에서 [SELECT 의 별칭(ALIAS)] 사용 [할 수 없어].' },
        { pose: 'happy', text: '반대로 ORDER BY는 SELECT 뒤에 실행돼. 그래서 SELECT에서 만든 별칭을 정렬할 때 쓸 수 있어.' },
        { pose: 'think', text: 'WHERE는 행을 먼저 거르고, HAVING은 GROUP BY로 묶인 결과를 거른다고 보면 돼.' },
        { pose: 'lightbulb', text: 'WHERE 단계에서는 아직 그룹이 만들어지지 않았어. 그래서 AVG나 COUNT 같은 집계함수를 쓸 수 없어.' },
        { pose: 'happy', text: 'GROUP BY로 묶은 뒤에는 HAVING이 그 묶음에 조건을 걸어. 그래서 AVG나 COUNT 같은 집계함수를 쓸 수 있어.' },
        { pose: 'think', text: '예를 들어 ‘평균 급여가 5000 이상인 부서’처럼 묶은 뒤 계산한 조건은 HAVING에 둬야 해.' },
        { pose: 'idle', text: '이제 실행 순서를 보고 어떤 절을 써야 하는지 문제로 확인해보자.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'SQL은 사람이 읽는 순서와 DB가 실제로 처리하는 순서가 다릅니다. 이 순서를 알면 WHERE에서 별칭을 못 쓰는 이유, HAVING에서 집계함수를 쓰는 이유를 자연스럽게 이해할 수 있습니다.',
        },
        {
          kind: 'table',
          title: '논리적 처리 순서 — "FWGHSO"',
          headers: ['#', '절', '하는 일', '집계함수'],
          rows: [
            ['1', 'FROM / JOIN', '대상 테이블 결정 + 결합', '—'],
            ['2', 'WHERE', '행 단위 필터', '쓸 수 없어'],
            ['3', 'GROUP BY', '그룹화', '—'],
            ['4', 'HAVING', '그룹 단위 필터', '쓸 수 있어'],
            ['5', 'SELECT', '컬럼 선택 + 별칭 부여', '쓸 수 있어'],
            ['6', 'ORDER BY', '정렬', '쓸 수 있어'],
          ],
        },
        {
          kind: 'example',
          title: '예시 — "부서별 평균 급여 ≥ 500만 인 부서만 평균급여 내림차순"',
          body:
            "SELECT 부서, AVG(급여) AS 평균  -- (5) 보여줄 컬럼과 별칭\nFROM EMP                    -- (1) 어떤 표를 볼지 결정\nWHERE 입사년도 >= 2020      -- (2) 행 먼저 거르기\nGROUP BY 부서               -- (3) 부서별로 묶기\nHAVING AVG(급여) >= 5000000 -- (4) 묶은 결과에 조건 걸기\nORDER BY 평균 DESC;         -- (6) SELECT에서 만든 별칭으로 정렬",
        },
        {
          kind: 'keypoints',
          title: '실행 순서로부터 따라오는 규칙',
          items: [
            'WHERE는 SELECT보다 먼저라 SELECT에서 만든 별칭을 아직 모릅니다.',
            'WHERE는 GROUP BY보다 먼저라 평균·합계 같은 집계 결과를 아직 모릅니다.',
            'HAVING은 GROUP BY 뒤에 실행되므로 그룹별 평균·합계 조건을 걸 수 있습니다.',
            'ORDER BY는 SELECT 뒤에 실행되므로 별칭, 집계함수, 컬럼 번호를 쓸 수 있습니다.',
            'SELECT에 집계하지 않은 컬럼을 보여주려면 GROUP BY에도 같은 컬럼이 있어야 합니다.',
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"프웨그하셀오"',
          body:
            'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. 순서를 먼저 떠올리면 "지금 이 절에서 무엇을 알고 있을까?"를 판단하기 쉬워집니다.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — WHERE와 집계함수',
          body:
            '"부서별 평균 급여 500만 이상"은 행 하나의 조건이 아니라 부서별로 묶은 뒤의 조건입니다. 그래서 WHERE가 아니라 HAVING에 둡니다.',
        },
      ],
    },
    {
      id: 'sqld-2-1-s4',
      title: 'ALIAS와 DISTINCT',
      quizId: 'sqld-2-1-cp-04',
      group: 'sqld-2-1-g1-query-basics',
      extraQuizIds: ['sqld-sql-lab-004'],
      dialogue: [
        { pose: 'wave', text: '[ALIAS(별칭)]는 컬럼이나 테이블에 잠깐 쓰는 이름을 붙이는 기능이야.' },
        { pose: 'think', text: '결과 컬럼명을 보기 쉽게 바꾸거나, JOIN할 때 같은 이름의 컬럼을 구분할 때 필요해.' },
        { pose: 'lightbulb', text: '예를 들면 SELECT 사번 AS ID, 급여 AS 연봉 FROM 직원 emp처럼 쓸 수 있어.' },
        { pose: 'happy', text: 'SELECT 절의 AS는 생략할 수 있어. 다만 Oracle에서 테이블 별칭을 줄 때는 AS 없이 공백으로 붙인다고 기억하자.' },
        { pose: 'think', text: 'ALIAS 규칙: [숫자/특수문자/예약어 쓸 수 없어]. 공백·특수문자 포함하려면 [큰따옴표 "." 로 감싸기].' },
        { pose: 'lightbulb', text: '예: SELECT 사번 AS "사 원 번 호" FROM 직원 — 공백 포함 별칭은 큰따옴표.' },
        { pose: 'happy', text: 'WHERE, GROUP BY, HAVING은 SELECT보다 먼저 처리돼. 그래서 SELECT에서 만든 별칭을 아직 사용할 수 없어.' },
        { pose: 'think', text: 'ORDER BY는 SELECT 뒤에 처리되므로 별칭을 알아볼 수 있어.' },
        { pose: 'lightbulb', text: '[DISTINCT]는 중복 행을 제거하는 구문이야.\nSELECT DISTINCT col1, col2처럼 여러 컬럼을 쓰면 두 컬럼이 모두 같은 행만 중복으로 봐.' },
        { pose: 'happy', text: 'NULL 도 한 값으로 취급 — 모든 NULL 행은 하나로 합쳐짐.' },
        { pose: 'think', text: '문자열 연결: [Oracle ||] / [SQL Server +] / [표준 CONCAT()].' },
        { pose: 'lightbulb', text: "예: SELECT 성 || ' ' || 이름 AS 전체이름 FROM 학생 (Oracle)." },
        { pose: 'idle', text: 'ALIAS 쓸 수 없는 절은? WHERE/GROUP BY/HAVING.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'ALIAS·DISTINCT·문자열 연결은 SELECT 절의 기본 도구입니다. ALIAS는 어느 절에서 알아볼 수 있는지, DISTINCT는 NULL을 어떻게 다루는지, DBMS마다 문자열 연결 방식이 어떻게 다른지 차근차근 보면 됩니다.',
        },
        {
          kind: 'keypoints',
          title: 'ALIAS 5대 규칙',
          items: [
            'AS 생략 가능 (Oracle 의 FROM 절은 AS 못 씀)',
            '숫자·특수문자·예약어 X',
            '공백·특수문자 포함 시 "..." 큰따옴표',
            'WHERE/GROUP BY/HAVING 에서 쓸 수 없어',
            'ORDER BY 에서만 쓸 수 있어',
          ],
        },
        {
          kind: 'example',
          title: '활용 예',
          body:
            "SELECT 학번 AS ID,\n       성 || ' ' || 이름 AS 전체이름,  -- Oracle\n       급여 * 12 AS 연봉\nFROM 학생\nWHERE 학번 = 101\nORDER BY ID;  -- ALIAS 쓸 수 있어",
        },
        {
          kind: 'table',
          title: '문자열 연결 — DBMS 차이',
          headers: ['DBMS', '연산자', '예'],
          rows: [
            ['Oracle', '||', "'A' || 'B' = 'AB'"],
            ['SQL Server', '+', "'A' + 'B' = 'AB'"],
            ['표준 SQL', 'CONCAT()', "CONCAT('A','B')"],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'DISTINCT 동작',
          body:
            "SELECT DISTINCT col1, col2 — 두 컬럼이 모두 같은 행만 중복으로 봄. NULL 들은 모두 한 값으로 취급. COUNT(DISTINCT col) 에서도 NULL 은 한 번만 셈.",
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — ALIAS 위치 오류',
          body:
            'SELECT salary*12 AS 연봉 FROM emp WHERE 연봉 > 5000 — 오류가 나. WHERE 가 SELECT 보다 먼저라 ALIAS 모름. WHERE salary*12 > 5000 으로 표현식 그대로 쓰거나 인라인뷰 활용.',
        },
      ],
    },
    {
      id: 'sqld-2-1-s5',
      title: '문자 함수',
      quizId: 'sqld-2-1-cp-05',
      group: 'sqld-2-1-g2-functions',
      extraQuizIds: ['sqld-sql-lab-005'],
      dialogue: [
        { pose: 'wave', text: '문자 함수는 문자열을 자르고, 찾고, 바꾸는 도구야. SQLD에서도 자주 다뤄.' },
        { pose: 'think', text: '먼저 가장 자주 보이는 [SUBSTR]부터 보자.' },
        { pose: 'lightbulb', text: "SUBSTR('abcdefgh', 1, 3)은 1번째 위치부터 3글자를 가져와서 'abc'가 돼." },
        { pose: 'happy', text: "길이를 생략하면 시작 위치부터 끝까지 가져와. SUBSTR('abcdefgh', 7)은 'gh'야." },
        { pose: 'think', text: "시작 위치가 음수면 뒤에서부터 세어. SUBSTR('abcdefgh', -2)는 뒤에서 2번째부터라 'gh'가 돼." },
        { pose: 'lightbulb', text: '헷갈리는 부분은 길이 값이 음수일 때야. Oracle 기준으로 길이가 음수면 결과가 NULL이 돼.' },
        { pose: 'happy', text: "[INSTR]은 찾는 글자가 몇 번째 위치에서 시작하는지 알려줘. INSTR('abcdefgh', 'g')는 7이야." },
        { pose: 'think', text: 'INSTR로 위치를 찾고 SUBSTR로 잘라내는 조합도 자주 나와. 예를 들어 @ 뒤의 도메인만 뽑을 수 있어.' },
        { pose: 'lightbulb', text: '[REPLACE]는 문자열 안의 특정 글자를 다른 글자로 바꾸는 함수야.\nREPLACE("abc","b","X")는 "aXc"가 돼.' },
        { pose: 'happy', text: '[TRIM]은 문자열 양쪽의 공백이나 지정 문자를 지우는 함수야.\nLTRIM은 왼쪽만, RTRIM은 오른쪽만 지워.' },
        { pose: 'think', text: '[LENGTH]는 문자열의 길이를 세는 함수야.\n공백도 글자 하나로 세기 때문에 LENGTH("abc def")는 7이야.' },
        { pose: 'lightbulb', text: '[LOWER]와 [UPPER]는 대소문자를 바꾸는 함수야.\nLOWER는 소문자, UPPER는 대문자로 바꿔.' },
        { pose: 'happy', text: '[ASCII]는 글자의 ASCII 코드 값을 알려주는 함수야.\nASCII("A")는 65야.' },
        { pose: 'idle', text: '이제 SUBSTR의 시작 위치를 문제로 확인해보자.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '문자 함수는 문자열을 자르거나, 찾거나, 바꾸는 도구입니다. 먼저 입력 문자열이 함수 안에서 어떻게 변하는지 보고, 그다음 SUBSTR·INSTR처럼 자주 헷갈리는 규칙을 확인하면 훨씬 편합니다.',
        },
        {
          kind: 'table',
          title: '주요 문자 함수',
          headers: ['함수', '동작', '예시'],
          rows: [
            ['LOWER / UPPER', '소·대문자 변환', "LOWER('Hi')='hi'"],
            ['SUBSTR(s, p)', 'p번째부터 끝까지', "SUBSTR('abcdefgh',7)='gh'"],
            ['SUBSTR(s, p, len)', 'p번째부터 len 글자', "SUBSTR('abcdefgh',1,3)='abc'"],
            ['SUBSTR(s, -n)', '뒤에서 n번째부터 끝까지', "SUBSTR('abcdefgh',-2)='gh'"],
            ['LENGTH(s)', '길이 (공백 포함)', "LENGTH('abc def')=7"],
            ['TRIM([c] FROM s)', '양쪽 공백/문자 제거', "TRIM('!' FROM '!!Wow!!')='Wow'"],
            ['LTRIM / RTRIM', '왼쪽 / 오른쪽만 제거', '—'],
            ['REPLACE(s, a, b)', 'a → b 치환 (모두)', "REPLACE('abc','b','X')='aXc'"],
            ['INSTR(s, sub)', 'sub 시작 위치 (없으면 0)', "INSTR('abcdefgh','g')=7"],
            ['ASCII(c)', '아스키 코드', "ASCII('A')=65"],
          ],
        },
        {
          kind: 'example',
          title: 'INSTR + SUBSTR 콤보',
          body:
            "이메일 'user@example.com' 에서 도메인만 추출:\nSUBSTR(email, INSTR(email,'@')+1)\n→ 'example.com'\n\n같은 결과를 SUBSTR(s, INSTR(s,'g'), 2) 패턴으로:\nSUBSTR('abcdefgh', INSTR('abcdefgh','g'), 2)\n= SUBSTR('abcdefgh', 7, 2)\n= 'gh'",
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — SUBSTR 길이 음수',
          body:
            "Oracle에서 SUBSTR('abcdefgh', 8, -2)는 NULL입니다. 시작 위치는 뒤에서 셀 수 있지만, 잘라낼 길이는 0 이상이어야 한다고 기억하면 됩니다.",
        },
        {
          tone: 'tip',
          kind: 'callout',
          title: 'REPLACE 의 b 인자 생략',
          body:
            "REPLACE(s, a) 에서 두 번째 인자만 주면 b='' 로 간주 — a 를 모두 [삭제]. REPLACE('Hello World','World') = 'Hello '.",
        },
      ],
    },
    {
      id: 'sqld-2-1-s6',
      title: '숫자·날짜 함수',
      quizId: 'sqld-2-1-cp-06',
      group: 'sqld-2-1-g2-functions',
      extraQuizIds: ['sqld-sql-lab-006'],
      dialogue: [
        { pose: 'wave', text: '이번에는 숫자, 날짜, 변환 함수를 보자. 이름보다 ‘입력값이 어떻게 바뀌는지’를 보면 쉬워.' },
        { pose: 'think', text: '[ABS]는 음수 부호를 떼고 절댓값으로 바꿔줘. ABS(-3)은 3이야.' },
        { pose: 'lightbulb', text: '[MOD]는 나눗셈의 나머지를 구해. MOD(11, 3)은 2야.' },
        { pose: 'happy', text: '[ROUND]는 지정한 자리에서 반올림해. ROUND(15.58, 1)은 15.6이 돼.' },
        { pose: 'think', text: '자릿수가 음수면 소수점 아래가 아니라 정수 자리에서 반올림해. ROUND(15.58, -1)은 20이야.' },
        { pose: 'lightbulb', text: '[TRUNC]는 지정한 자리 아래를 버리는 함수야.\nTRUNC(15.58, 1)은 15.5, TRUNC(15.58, -1)은 10이 돼.' },
        { pose: 'happy', text: '[FLOOR]는 아래쪽 정수로 내리고, [CEIL]은 위쪽 정수로 올려.\nFLOOR(3.58)=3, CEIL(3.58)=4야.' },
        { pose: 'think', text: '[SIGN]은 숫자의 부호를 알려주는 함수야.\n양수는 1, 음수는 -1, 0은 0을 반환해.' },
        { pose: 'lightbulb', text: '[POWER]는 거듭제곱을 구하는 함수야.\nPOWER(2, 3)은 2의 3제곱이라 8이야.' },
        { pose: 'happy', text: '[날짜] 함수: [SYSDATE] (Oracle) / [GETDATE()] (SQL Server).' },
        { pose: 'think', text: '변환 함수는 데이터의 모양을 바꿀 때 써.\nTO_NUMBER는 문자→숫자, TO_CHAR는 숫자·날짜→문자, TO_DATE는 문자→날짜로 바꿔.' },
        { pose: 'lightbulb', text: "TO_CHAR(SYSDATE, 'YYYY-MM-DD') = '2026-04-27' 같이 [형식 지정]." },
        { pose: 'happy', text: 'TRUNC(SYSDATE) 는 시간을 잘라 [자정] 으로. 날짜 비교에 유용.' },
        { pose: 'idle', text: 'ROUND의 음수 자릿수를 문제로 확인해보자.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '숫자 함수의 핵심은 ROUND/TRUNC 의 음수 자릿수, FLOOR/CEIL 의 차이. 변환 함수는 형식 문자열 패턴을 외우는 게 정답률 향상의 지름길.',
        },
        {
          kind: 'table',
          title: '숫자 함수',
          headers: ['함수', '의미', '예'],
          rows: [
            ['ABS(n)', '절댓값', 'ABS(-3)=3'],
            ['MOD(a,b)', 'a÷b 나머지', 'MOD(11,3)=2'],
            ['ROUND(n,d)', 'd 자리 아래 반올림', 'ROUND(15.58,1)=15.6, ROUND(15.58,-1)=20'],
            ['TRUNC(n,d)', 'd 자리 아래 버림', 'TRUNC(15.58,1)=15.5, TRUNC(15.58,-1)=10'],
            ['FLOOR(n)', '작거나 같은 최대 정수', 'FLOOR(3.58)=3, FLOOR(-3.2)=-4'],
            ['CEIL(n)', '크거나 같은 최소 정수', 'CEIL(3.58)=4'],
            ['SIGN(n)', '+1 / 0 / -1', 'SIGN(-3)=-1'],
            ['POWER(n,k)', 'n^k', 'POWER(2,3)=8'],
          ],
        },
        {
          kind: 'table',
          title: '날짜 함수',
          headers: ['함수', '의미', '비고'],
          rows: [
            ['SYSDATE', '현재 날짜·시간', 'Oracle'],
            ['GETDATE()', '현재 날짜·시간', 'SQL Server'],
            ['TRUNC(SYSDATE)', '시간 잘라 자정', '날짜만 비교 시 유용'],
            ['SYSDATE + 1', '내일', '날짜 산술'],
            ['SYSDATE - 30', '30일 전', '—'],
          ],
        },
        {
          kind: 'table',
          title: '변환 함수 + 형식',
          headers: ['함수', '예'],
          rows: [
            ['TO_NUMBER', "TO_NUMBER('2025') = 2025"],
            ['TO_CHAR (숫자)', "TO_CHAR(1234567.89, '9,999,999.99') = '1,234,567.89'"],
            ['TO_CHAR (날짜)', "TO_CHAR(SYSDATE, 'YYYY-MM-DD') = '2026-04-27'"],
            ['TO_DATE', "TO_DATE('2025-03-05','YYYY-MM-DD')"],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — ROUND/TRUNC 음수 자릿수',
          body:
            'ROUND(123.456, -1) = 120 (10의 자리에서 반올림). TRUNC(123.456, -1) = 120 (10의 자리 아래 버림). 자릿수가 음수면 정수 부분에서 처리.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'CEIL vs ROUND vs FLOOR',
          body:
            'CEIL = "올림 (큰 정수 방향)", ROUND = "반올림 (가장 가까운 정수)", FLOOR = "내림 (작은 정수 방향)". 음수 처리 주의: FLOOR(-3.2) = -4 (더 작은 쪽).',
        },
      ],
    },
    {
      id: 'sqld-2-1-s7',
      title: '집계 함수',
      quizId: 'sqld-2-1-cp-07',
      group: 'sqld-2-1-g2-functions',
      extraQuizIds: ['sqld-sql-lab-007'],
      dialogue: [
        { pose: 'wave', text: '[집계 함수]는 여러 행을 하나의 값으로 요약하는 함수야.' },
        { pose: 'think', text: '먼저 COUNT, SUM, AVG, MIN, MAX 다섯 가지를 묶어서 기억하자.' },
        { pose: 'lightbulb', text: '집계 함수에서 가장 중요한 건 NULL 처리야. SUM, AVG, MIN, MAX, COUNT(컬럼)는 NULL 값을 계산에서 제외해.' },
        { pose: 'happy', text: '하지만 COUNT(*)는 컬럼 값이 아니라 행 자체를 세므로 NULL이 있어도 행을 포함해.' },
        { pose: 'think', text: 'COUNT(*)는 ‘행이 있나’를 보고, COUNT(컬럼)은 ‘그 컬럼에 값이 있나’를 본다고 생각하면 쉬워.' },
        { pose: 'lightbulb', text: '헷갈리는 부분은 조건을 만족하는 행이 하나도 없을 때야.' },
        { pose: 'happy', text: '행이 0개면 COUNT(*)는 0을 돌려줘. 반면 SUM이나 AVG처럼 계산할 값이 필요한 함수는 NULL이 돼.' },
        { pose: 'think', text: '그래서 NVL(COUNT(*), 9999)는 9999가 아니라 0이 돼. COUNT(*) 자체가 NULL이 아니기 때문이야.' },
        { pose: 'lightbulb', text: '반면 NVL(SUM(col), 9999) WHERE 1=2 = NVL(NULL, 9999) = [9999].' },
        { pose: 'happy', text: 'AVG도 조심해야 해. AVG(col)은 NULL인 행을 평균의 분모에서 빼고 계산해.' },
        { pose: 'think', text: 'AVG(NVL(col, 0)) 은 NULL → 0 으로 만들어 분모에 [포함]시킴 → 결과 다름.' },
        { pose: 'lightbulb', text: '집계함수는 [WHERE 절에 쓸 수 없어]. HAVING 에서만.' },
        { pose: 'idle', text: '이제 COUNT(*)와 NULL 처리 차이를 문제로 확인해보자.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '집계함수는 여러 행을 한 값으로 요약합니다. 이때 NULL을 세는지, 건너뛰는지가 자주 헷갈립니다. 특히 COUNT(*)와 COUNT(컬럼)는 이름이 비슷하지만 NULL 처리 방식이 다릅니다.',
        },
        {
          kind: 'table',
          title: '집계함수 + NULL 처리',
          headers: ['함수', 'NULL 처리', '행 0개 시'],
          rows: [
            ['COUNT(*)', 'NULL 행도 포함', '0'],
            ['COUNT(1) / COUNT(0)', 'NULL 행도 포함', '0'],
            ['COUNT(컬럼)', 'NULL 인 행 제외', '0'],
            ['COUNT(DISTINCT 컬럼)', 'NULL·중복 제외 고유 값', '0'],
            ['SUM(컬럼)', 'NULL 무시', 'NULL'],
            ['AVG(컬럼)', 'NULL 무시 (분모서 제외)', 'NULL'],
            ['MIN/MAX(컬럼)', 'NULL 무시', 'NULL'],
          ],
        },
        {
          kind: 'example',
          title: 'COUNT와 SUM이 다르게 보이는 상황',
          body:
            "-- 행 0개 (1=2 항상 거짓)\nSELECT NVL(COUNT(*), 9999) FROM TAB WHERE 1=2;\n→ 0 (COUNT(*) = 0, NULL 아님)\n\nSELECT NVL(SUM(col), 9999) FROM TAB WHERE 1=2;\n→ 9999 (SUM = NULL, NVL 적용)\n\n-- AVG NULL 처리 차이\n점수 = (90, 80, NULL, NULL, 70)\nAVG(점수) = (90+80+70)/3 = 80\nAVG(NVL(점수,0)) = (90+80+0+0+70)/5 = 48",
        },
        {
          kind: 'keypoints',
          title: '집계함수 4대 규칙',
          items: [
            'WHERE 절 쓸 수 없어 (HAVING 만)',
            'GROUP BY 와 함께 그룹별 집계',
            'GROUP BY 없이 단독 — 전체 1그룹 집계',
            'NULL 무시 (COUNT(*) 만 예외)',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — COUNT(*) vs COUNT(컬럼)',
          body:
            'COUNT(*)는 행 자체를 세므로 NULL이 있어도 행 수에 포함됩니다. COUNT(컬럼)는 그 컬럼 값이 NULL인 행을 빼고 셉니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '헷갈리는 부분 — AVG vs AVG(NVL)',
          body:
            'AVG(col) 의 분모는 NOT NULL 행 수. AVG(NVL(col, 0)) 의 분모는 전체 행 수. 의도가 다른 두 표현.',
        },
      ],
    },
    {
      id: 'sqld-2-1-s8',
      title: 'NULL 처리 함수',
      quizId: 'sqld-2-1-cp-08',
      group: 'sqld-2-1-g2-functions',
      extraQuizIds: ['sqld-sql-lab-009'],
      dialogue: [
        { pose: 'wave', text: '이번에는 NULL을 다른 값으로 바꾸거나, NULL 여부에 따라 분기하는 함수를 볼 거야.' },
        { pose: 'think', text: '첫째, [NVL]은 값이 NULL이면 대신 넣을 값을 정하는 함수야.\nNULL이 아니면 원래 값을 그대로 써.' },
        { pose: 'lightbulb', text: '예: NVL(전화번호, "미등록") — 전화번호가 NULL 인 행에 "미등록" 표시.' },
        { pose: 'happy', text: '둘째, [NVL2]는 NULL인지 아닌지에 따라 결과를 둘로 나눠.\n값이 있으면 x, NULL이면 y를 반환해.' },
        { pose: 'think', text: '예: NVL2(보너스, "있음", "없음") — 보너스 컬럼 유무에 따라 분기.' },
        { pose: 'lightbulb', text: '셋째, [NULLIF]는 두 값이 같으면 NULL을 반환해.\n다르면 첫 번째 값을 그대로 반환해.' },
        { pose: 'happy', text: '예: NULLIF(점수, 0) — 점수 0 을 NULL 로 (분모로 쓸 때 0 나누기 방지).' },
        { pose: 'think', text: '넷째, [COALESCE]는 왼쪽부터 보면서 처음으로 NULL이 아닌 값을 골라.' },
        { pose: 'lightbulb', text: '예: COALESCE(휴대폰, 집전화, 이메일)은 연락 가능한 첫 번째 수단을 고르는 느낌이야.' },
        { pose: 'happy', text: 'COALESCE 는 [표준 SQL], NVL 은 [Oracle 전용]. 호환성 높아짐 코드는 COALESCE.' },
        { pose: 'think', text: '동치 변환: NVL(c, 0) ≡ COALESCE(c, 0) ≡ CASE WHEN c IS NULL THEN 0 ELSE c END.' },
        { pose: 'lightbulb', text: 'DECODE(c, NULL, 0, c) 도 같은 의미 — DECODE 는 NULL 비교 할 수 있어.' },
        { pose: 'idle', text: 'COALESCE(NULL, NULL, "S", NULL, "QL") = ?' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'NULL 처리 함수는 4가지가 있고 각각의 동작이 미묘하게 달라 자주 나오는 패턴입니다. 같은 결과를 여러 함수로 만들 수 있어 "결과가 같은 표현 찾기" 같은 매칭이 자주 문제.',
        },
        {
          kind: 'table',
          title: 'NULL 처리 함수 4종',
          headers: ['함수', '동작', '예'],
          rows: [
            ['NVL(c, repl)', 'c IS NULL 이면 repl, 아니면 c', "NVL(NULL, 0) = 0"],
            ['NVL2(c, x, y)', 'c NOT NULL → x, c NULL → y', "NVL2(점수, '있음', '없음')"],
            ['NULLIF(a, b)', 'a = b 면 NULL, 다르면 a', "NULLIF(0, 0) = NULL"],
            ['COALESCE(a, b, c, ...)', '첫 NOT NULL 반환', "COALESCE(NULL,NULL,'S','QL') = 'S'"],
          ],
        },
        {
          kind: 'example',
          title: '동치 변환 — 같은 결과의 4가지 표현',
          body:
            "-- col 이 NULL 이면 0, 아니면 col\nNVL(col, 0)\nCOALESCE(col, 0)\nCASE WHEN col IS NULL THEN 0 ELSE col END\nDECODE(col, NULL, 0, col)\n→ 모두 동일한 결과 (DECODE 는 Oracle 의 NULL 비교 가능 특성 활용)",
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '함수 표준화',
          body:
            'COALESCE 는 표준 SQL 이라 DBMS 어디서나 동작. NVL·NVL2·DECODE 는 Oracle 전용. 코드 이식성을 원하면 COALESCE.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — Simple CASE WHEN NULL',
          body:
            "CASE col WHEN NULL THEN -1 ELSE 0 END 은 동작 X (= NULL 비교는 UNKNOWN). NULL 분기는 Searched CASE 또는 DECODE.",
        },
      ],
    },
    {
      id: 'sqld-2-1-s9',
      title: 'CASE와 DECODE',
      quizId: 'sqld-2-1-cp-09',
      group: 'sqld-2-1-g2-functions',
      extraQuizIds: ['sqld-sql-lab-010'],
      dialogue: [
        { pose: 'wave', text: '[CASE]와 [DECODE]는 SQL 안에서 조건에 따라 값을 다르게 보여주는 도구야.' },
        { pose: 'think', text: 'CASE는 크게 두 가지 형태가 있어.\n조건식을 직접 쓰는 Searched CASE와, 특정 값이 무엇인지 비교하는 Simple CASE야.' },
        { pose: 'lightbulb', text: '[Searched CASE]는 WHEN 뒤에 조건을 직접 쓰는 방식이야.\nCASE WHEN 조건1 THEN A WHEN 조건2 THEN B ELSE C END처럼 써.' },
        { pose: 'happy', text: '예: CASE WHEN 점수>=90 THEN "A" WHEN 점수>=80 THEN "B" ELSE "F" END.' },
        { pose: 'think', text: '[Simple CASE]는 한 컬럼의 값이 무엇인지 비교하는 방식이야.\nCASE 컬럼 WHEN 값1 THEN A WHEN 값2 THEN B ELSE C END처럼 써.' },
        { pose: 'lightbulb', text: '예: CASE 코드 WHEN "01" THEN "서울" WHEN "02" THEN "부산" ELSE "기타" END.' },
        { pose: 'happy', text: '[DECODE]는 Oracle 전용 조건 함수야.\nDECODE(컬럼, 값1, 반환1, 값2, 반환2, ..., 기본값) 형태로 써.' },
        { pose: 'think', text: '[Simple CASE 와 DECODE 거의 동일]. 단 한 가지 [큰 차이].' },
        { pose: 'lightbulb', text: 'DECODE 는 [NULL 비교가 할 수 있어]. DECODE(c, NULL, "널값", c) — 정상 동작.' },
        { pose: 'happy', text: '하지만 Simple CASE 는 [WHEN NULL THEN. 은 작동 X]. = NULL 비교가 항상 UNKNOWN.' },
        { pose: 'think', text: '헷갈리는 부분. "CASE col WHEN NULL THEN -1 ELSE 0 END" 결과는 항상 [0]. NULL 분기 안 됨.' },
        { pose: 'lightbulb', text: 'NULL 분기는 [Searched CASE WHEN col IS NULL THEN -1] 또는 [DECODE] 로.' },
        { pose: 'idle', text: '결과가 다른 것 찾기 — Simple CASE WHEN NULL.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'CASE 와 DECODE 는 SQL 안에서 조건 분기를 가능케 합니다. CASE 는 표준 SQL, DECODE 는 Oracle 전용. 둘 다 SELECT·WHERE·ORDER BY·HAVING 모든 절에서 쓸 수 있어.',
        },
        {
          kind: 'example',
          title: 'Searched CASE — 조건 분기',
          body:
            "SELECT 이름,\n  CASE WHEN 점수 >= 90 THEN 'A'\n       WHEN 점수 >= 80 THEN 'B'\n       WHEN 점수 >= 70 THEN 'C'\n       ELSE 'F' END AS 등급\nFROM 성적;",
        },
        {
          kind: 'example',
          title: 'Simple CASE vs DECODE',
          body:
            "-- Simple CASE (표준)\nSELECT CASE 코드\n         WHEN '01' THEN '수학'\n         WHEN '02' THEN '과학'\n         ELSE '교양'\n       END AS 과목명\nFROM 과목;\n\n-- 동치 DECODE (Oracle)\nSELECT DECODE(코드, '01', '수학', '02', '과학', '교양') AS 과목명\nFROM 과목;",
        },
        {
          kind: 'table',
          title: 'CASE vs DECODE',
          headers: ['항목', 'Simple CASE', 'DECODE'],
          rows: [
            ['표준', '표준 SQL', 'Oracle 전용'],
            ['NULL 비교', '안 됨 (= NULL → UNKNOWN)', '가능 (= NULL → TRUE)'],
            ['조건', '값 매칭만', '값 매칭만'],
            ['Searched 형태', '있음 (WHEN 조건)', '없음 (값 매칭만)'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — Simple CASE WHEN NULL',
          body:
            "'CASE col WHEN NULL THEN -1 ELSE 0 END' 은 col = NULL 비교라 항상 UNKNOWN → ELSE 적중. NULL 분기는 Searched CASE 또는 DECODE.",
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '동치 변환',
          body:
            'NVL(c, 0), COALESCE(c, 0), CASE WHEN c IS NULL THEN 0 ELSE c END, DECODE(c, NULL, 0, c)는 같은 결과를 만들 수 있습니다. 형태가 달라도 같은 뜻인지 비교해보면 됩니다.',
        },
      ],
    },
    {
      id: 'sqld-2-1-s10',
      title: 'WHERE 절',
      quizId: 'sqld-2-1-cp-10',
      group: 'sqld-2-1-g3-filter-sort',
      extraQuizIds: ['sqld-2-1-cp-10-where-flow', 'sqld-sql-lab-008', 'sqld-sql-lab-011', 'sqld-sql-lab-012'],
      dialogue: [
        { pose: 'wave', text: 'WHERE 절은 [행 단위 필터]. 조건에 맞는 튜플(행)만 통과.' },
        { pose: 'think', text: '연산자가 많아 차근차근 나눠보자.' },
        { pose: 'lightbulb', text: '[비교]: = (같다), != / <> / ^= (다르다), >, <, >=, <=.' },
        { pose: 'happy', text: '[조건 결합]: AND (모두 만족), OR (하나라도), NOT (부정).' },
        { pose: 'think', text: '[범위·집합]: BETWEEN A AND B (A 이상 B 이하), IN (a,b,c) (목록 중 하나).' },
        { pose: 'lightbulb', text: '[NULL 비교]: 반드시 [IS NULL] / [IS NOT NULL]. = NULL 은 항상 UNKNOWN.' },
        { pose: 'happy', text: '[LIKE 와일드카드]: [%] = 0개 이상 모든 문자, [_] = 정확히 1개 문자.' },
        { pose: 'think', text: '예: LIKE "김%" → 김씨 시작. LIKE "_im" → 3글자, 끝이 "im". LIKE "%@%.%" → 이메일.' },
        { pose: 'lightbulb', text: '특수 문자 자체 검색: ESCAPE 절. LIKE "%/_라면" ESCAPE "/" → "_라면" 으로 끝.' },
        { pose: 'happy', text: '[우선순위] (높음 → 낮음): 괄호 → 산술(*) → 비교 → NOT → AND → OR.' },
        { pose: 'think', text: '헷갈리는 부분. col IN (1, NULL) 에서 NULL 비교는 UNKNOWN → col=1 인 행만. NULL 행은 무시.' },
        { pose: 'lightbulb', text: '더 무서운 헷갈리는 부분. [NOT IN] 에 NULL 섞이면 [전체가 UNKNOWN] → [0행 반환].' },
        { pose: 'happy', text: '안전한 패턴: NOT EXISTS 사용 또는 WHERE col IS NOT NULL 추가.' },
        { pose: 'idle', text: 'NOT IN + NULL = ?행.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'WHERE 절은 행 단위 필터로 결과 집합을 좁힙니다. 다양한 연산자가 있고, NULL 처리·우선순위·LIKE 와일드카드가 자주 나오는. 연산자 우선순위를 모르면 의도와 다른 결과가 나옵니다.',
        },
        {
          kind: 'table',
          title: 'WHERE 연산자',
          headers: ['연산자', '의미', '예'],
          rows: [
            ['= / != / <> / ^=', '같다 / 다르다', 'WHERE 나이 != 21'],
            ['>, <, >=, <=', '대소 비교', 'WHERE 나이 >= 21'],
            ['BETWEEN A AND B', 'A 이상 B 이하 (양 끝 포함)', 'BETWEEN 21 AND 22'],
            ['IN (a,b,c)', '목록 중 하나', "IN ('A','B')"],
            ['LIKE', '와일드카드 매칭', "LIKE '%라면'"],
            ['IS NULL / IS NOT NULL', 'NULL 검사', '= NULL 은 X'],
            ['NOT', '부정', 'NOT IN(...), NOT BETWEEN ...'],
          ],
        },
        {
          kind: 'table',
          title: 'LIKE 와일드카드',
          headers: ['패턴', '매칭'],
          rows: [
            ["'%라면%'", "라면을 [포함]하는 모든 문자열"],
            ["'%라면'", "라면으로 [끝나는]"],
            ["'_im'", "3글자, [_] 가 임의의 한 글자"],
            ["'[KT]im'", "Kim 또는 Tim (SQL Server 만)"],
            ["'%/_라면' ESCAPE '/'", "/_ 로 _ 자체 매칭 — '_라면' 으로 끝"],
          ],
        },
        {
          kind: 'keypoints',
          title: '우선순위 (높음 → 낮음)',
          items: [
            '괄호 ( )',
            '산술 *, /, %, +, -',
            '비교 =, !=, <, >, >=, <=, BETWEEN, IN, LIKE, IS NULL',
            'NOT',
            'AND',
            'OR',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 1 — IN/NOT IN + NULL',
          body:
            "col IN (1, NULL) → col=1 인 행만 (NULL 무시). col NOT IN (1, NULL) → 0행 (NULL UNKNOWN 으로 모두 거름). 안전한 NOT IN 은 NULL 미포함 보장 + NOT EXISTS.",
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 2 — NOT (col=1 OR col=NULL)',
          body:
            "NOT (col=1 OR col=NULL) = NOT (col=1 OR UNKNOWN) = NOT UNKNOWN (또는 NOT TRUE) → 다소 복잡. NULL 인 행은 결과에서 빠짐.",
        },
      ],
    },
    {
      id: 'sqld-2-1-s11',
      title: 'GROUP BY · HAVING',
      quizId: 'sqld-2-1-cp-11',
      group: 'sqld-2-1-g3-filter-sort',
      extraQuizIds: ['sqld-sql-lab-013', 'sqld-sql-read-001', 'sqld-sql-order-002'],
      dialogue: [
        { pose: 'wave', text: '[GROUP BY]는 [같은 값을 가진 행을 묶어 한 줄로 요약].' },
        { pose: 'think', text: '예: 부서별 평균급여 — GROUP BY 부서 후 AVG(급여) 계산. 부서마다 한 줄.' },
        { pose: 'lightbulb', text: '[HAVING]은 묶은 뒤에 나온 결과에 조건을 거는 절이야. WHERE와 역할이 달라.' },
        { pose: 'happy', text: '[WHERE]는 묶기 전에 행을 고르고, [HAVING]은 묶은 뒤의 그룹을 골라.' },
        { pose: 'think', text: '순서로 보면 더 쉬워. FROM → WHERE → GROUP BY → HAVING 순서로 처리돼.' },
        { pose: 'lightbulb', text: 'WHERE 단계에서는 아직 평균이나 합계가 만들어지지 않았어. 그래서 집계함수를 쓸 수 없어.' },
        { pose: 'happy', text: 'GROUP BY로 묶고 나면 평균, 합계, 개수 같은 값이 생겨. 그때 HAVING으로 조건을 걸 수 있어.' },
        { pose: 'think', text: '"부서별 평균급여 500만 이상"처럼 묶은 뒤 계산한 조건은 HAVING AVG(급여) >= 5000000으로 써.' },
        { pose: 'lightbulb', text: 'WHERE AVG(급여) >= 5000000처럼 쓰면 아직 평균이 없어서 오류가 나.' },
        { pose: 'happy', text: '핵심 규칙: SELECT 의 [비집계 컬럼]은 [모두 GROUP BY 에 등장해야 함].' },
        { pose: 'think', text: '예: SELECT 부서, COUNT(*) FROM EMP — GROUP BY 부서 없이 쓰면 [오류].' },
        { pose: 'lightbulb', text: '성능 팁: WHERE 로 먼저 행을 줄인 뒤 GROUP BY 가 빠름. GROUP BY 가 비싼 작업이라.' },
        { pose: 'idle', text: 'WHERE 와 HAVING 의 차이는?' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'GROUP BY 는 "같은 값을 가진 행을 묶어 한 그룹으로 만들고, 각 그룹에 집계함수를 적용" 하는 절. HAVING 은 그 결과에 조건을 거는 그룹 단위 필터. 둘은 항상 짝으로 등장하는 개념입니다.',
        },
        {
          kind: 'example',
          title: '5절 모두 사용한 종합 예시',
          body:
            "SELECT 부서, AVG(급여) AS 평균\nFROM EMP                           -- (1) FROM\nWHERE 입사년도 >= 2020             -- (2) WHERE — 행 필터\nGROUP BY 부서                       -- (3) GROUP BY — 그룹화\nHAVING AVG(급여) >= 5000000        -- (4) HAVING — 그룹 필터\nORDER BY 평균 DESC;                -- (6) ORDER BY",
        },
        {
          kind: 'table',
          title: 'WHERE vs HAVING',
          headers: ['항목', 'WHERE', 'HAVING'],
          rows: [
            ['실행 시점', 'GROUP BY 전', 'GROUP BY 후'],
            ['필터 단위', '행', '그룹'],
            ['집계함수', '쓸 수 없어', '쓸 수 있어'],
            ['단독 사용', '가능', '가능 (전체 1그룹)'],
          ],
        },
        {
          kind: 'keypoints',
          title: '핵심 규칙',
          items: [
            'SELECT에 집계하지 않은 컬럼을 보여주려면 GROUP BY에도 같은 컬럼이 있어야 합니다.',
            '집계함수는 WHERE 에 쓸 수 없어 — HAVING 에서만',
            'WHERE 로 먼저 거른 뒤 GROUP BY 가 성능상 유리',
            'GROUP BY 없이 집계함수만 = 전체 집합 1그룹 집계',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 1 — 집계 + 일반 컬럼 혼합',
          body:
            "SELECT 부서, COUNT(*) FROM EMP — 오류가 나. 부서가 GROUP BY 에 없어 \"어느 부서?\" 결정 안 됨. SELECT 부서, COUNT(*) FROM EMP GROUP BY 부서 로 수정.",
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 2 — 집계함수 위치',
          body:
            "WHERE AVG(급여) >= 5000000 → 오류. WHERE 는 행 단위, AVG 가 그룹별이라 모순. 그룹 조건은 HAVING.",
        },
      ],
    },
    {
      id: 'sqld-2-1-s12',
      title: 'ORDER BY',
      quizId: 'sqld-2-1-cp-12',
      group: 'sqld-2-1-g3-filter-sort',
      extraQuizIds: ['sqld-sql-lab-014'],
      dialogue: [
        { pose: 'wave', text: 'ORDER BY 는 결과의 [최종 정렬]. SELECT 의 가장 마지막 절.' },
        { pose: 'think', text: '[ASC] = 오름차순 (기본·생략 할 수 있어). [DESC] = 내림차순.' },
        { pose: 'lightbulb', text: '여러 컬럼 정렬: ORDER BY 컬럼1 DESC, 컬럼2 ASC — 컬럼1 우선, 같으면 컬럼2.' },
        { pose: 'happy', text: 'ORDER BY 는 [SELECT 후 실행]이라 [ALIAS] · [컬럼 번호] · [집계함수] 모두 쓸 수 있어.' },
        { pose: 'think', text: '예: ORDER BY 평균 DESC (ALIAS), ORDER BY 2 DESC (2번째 컬럼), ORDER BY AVG(급여) DESC.' },
        { pose: 'lightbulb', text: '데이터 형에 따른 정렬 — 숫자: 작은→큰, 문자: 사전순, 날짜: 과거→미래.' },
        { pose: 'happy', text: '[NULL 정렬] 자주 헷갈리는 포인트. [Oracle] 은 NULL 을 [최댓값] 취급.' },
        { pose: 'think', text: 'Oracle ASC 시 NULL = [맨 끝(NULLS LAST)]. DESC 시 NULL = [맨 앞(NULLS FIRST)].' },
        { pose: 'lightbulb', text: '[SQL Server] 는 정반대. NULL 을 [최솟값] 취급. ASC = NULLS FIRST.' },
        { pose: 'happy', text: '제어: ORDER BY col DESC NULLS LAST 처럼 [명시] 할 수 있어 (Oracle).' },
        { pose: 'think', text: 'ORDER BY 가 빠지면 결과 순서는 [보장 X]. TOP N·LIMIT 와 결합 시 반드시 명시.' },
        { pose: 'idle', text: 'Oracle 에서 ORDER BY DESC 시 NULL 은? 맨 앞.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'ORDER BY 는 결과를 정렬하는 마지막 단계. SELECT 후 실행되어 ALIAS·집계함수·컬럼 번호 모두 쓸 수 있어. NULL 정렬이 DBMS 별로 다른 점이 자주 헷갈리는 부분.',
        },
        {
          kind: 'example',
          title: '활용 예시',
          body:
            "-- 다중 컬럼 + ALIAS\nSELECT 사번, 급여 AS 연봉, 보너스\nFROM 직원\nORDER BY 연봉 DESC, 보너스 ASC;\n\n-- 컬럼 번호 (1=사번, 2=연봉, 3=보너스)\nSELECT 사번, 급여 AS 연봉, 보너스\nFROM 직원\nORDER BY 2 DESC, 3 ASC;\n\n-- 집계함수\nSELECT 부서, AVG(급여)\nFROM EMP GROUP BY 부서\nORDER BY AVG(급여) DESC;",
        },
        {
          kind: 'table',
          title: '데이터 형에 따른 ASC 정렬',
          headers: ['형', '순서'],
          rows: [
            ['숫자', '작은 수 → 큰 수'],
            ['문자', '사전순 (ASCII/유니코드)'],
            ['날짜', '과거 → 미래'],
          ],
        },
        {
          kind: 'table',
          title: 'NULL 정렬 — DBMS 별 차이',
          headers: ['DBMS', 'ASC', 'DESC'],
          rows: [
            ['Oracle', '맨 끝 (NULLS LAST)', '맨 앞 (NULLS FIRST)'],
            ['SQL Server', '맨 앞 (NULLS FIRST)', '맨 끝 (NULLS LAST)'],
            ['Oracle 명시 가능', 'NULLS FIRST / NULLS LAST 옵션', '동일'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'ORDER BY 는 어디서나',
          body:
            'ALIAS, 컬럼 번호 (1, 2, 3...), 집계함수, 표현식 모두 쓸 수 있어. 단 컬럼 번호 사용은 가독성 ↓ 권장하지 않음.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — DESC 누락',
          body:
            '"매출 높은 순으로"처럼 큰 값부터 보여야 하는데 DESC가 없으면 기본값 ASC가 적용되어 결과가 반대로 나옵니다. 요구 문장에서 "높은 순", "최근 순" 같은 표현을 먼저 확인하세요.',
        },
      ],
    },
  ],
};

const SQLD_2_2: Lesson = {
  id: 'sqld-2-2',
  subject: 'sqld',
  chapter: 2,
  chapterTitle: 'SQL 기본 및 활용',
  topic: 'SQL 활용',
  title: 'JOIN · 서브쿼리 · 집합·그룹·윈도우 · TOP N · 계층형 · PIVOT · 정규식',
  hook: '쿼리를 짜는 진짜 무기. 자주 다루는 영역.',
  estimatedMinutes: 22,
  steps: [
    {
      id: 'sqld-2-2-s1',
      title: 'JOIN 4종',
      quizId: 'sqld-2-2-cp-01',
      group: 'sqld-2-2-g1-joins',
      extraQuizIds: ['sqld-2-2-cp-01-left-join', 'sqld-sql-lab-015', 'sqld-sql-lab-016', 'sqld-sql-order-003'],
      dialogue: [
        { pose: 'wave', text: '[JOIN]은 [여러 테이블을 한 결과로 묶는 가장 자주 쓰는 도구]. 자주 나오는 핵심 개념.' },
        { pose: 'think', text: 'JOIN 종류 [4가지]: [INNER] · [LEFT OUTER] · [RIGHT OUTER] · [FULL OUTER].' },
        { pose: 'lightbulb', text: '[INNER JOIN]은 양쪽 테이블에서 조건이 맞는 행만 결과로 보여줘.\n가장 기본적인 JOIN이야.' },
        { pose: 'happy', text: '예: 사원 ↔ 부서 INNER JOIN — 부서가 매칭되는 사원만 표시.' },
        { pose: 'think', text: '[LEFT OUTER JOIN]은 왼쪽 테이블의 행을 모두 남겨.\n오른쪽에서 매칭되는 값이 없으면 그 부분은 NULL로 채워져.' },
        { pose: 'lightbulb', text: '예: 부서 LEFT JOIN 사원 → 사원이 한 명도 없는 부서까지 결과에 포함.' },
        { pose: 'happy', text: '[RIGHT OUTER JOIN]은 LEFT OUTER JOIN의 반대야.\n오른쪽 테이블의 모든 행을 남기고, 왼쪽에서 매칭되는 값만 붙여.' },
        { pose: 'think', text: '[FULL OUTER JOIN]은 양쪽 테이블의 행을 모두 보존해.\n매칭이 없는 쪽의 컬럼은 NULL로 채워져.' },
        { pose: 'lightbulb', text: 'JOIN 단독 작성 = [INNER JOIN] 의미.' },
        { pose: 'happy', text: '실생활: "사원이 한 명도 없는 부서도 보고 싶다" → LEFT (부서 왼쪽).' },
        { pose: 'think', text: '"부서 정보 없는 사원도 보고 싶다" → LEFT (사원 왼쪽) 또는 RIGHT (부서 오른쪽).' },
        { pose: 'lightbulb', text: 'JOIN은 결과에 남는 행을 눈으로 그려보면 쉬워. INNER, LEFT, RIGHT, FULL이 각각 어디까지 남기는지 비교하자.' },
        { pose: 'idle', text: '부서 없는 사원까지 보려면? LEFT (사원 왼쪽).' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'JOIN은 둘 이상의 테이블을 연결해 한 결과 집합으로 만드는 SQL의 핵심 연산입니다. 어떤 행이 남고 어떤 행이 사라지는지를 그림처럼 떠올리면 행 수 계산도 쉬워집니다.',
        },
        {
          kind: 'table',
          title: 'JOIN 4종 비교',
          headers: ['JOIN', '결과'],
          rows: [
            ['INNER JOIN', '양쪽에 매칭되는 행만'],
            ['LEFT OUTER JOIN', '왼쪽 전부 + 매칭 (없으면 NULL)'],
            ['RIGHT OUTER JOIN', '오른쪽 전부 + 매칭'],
            ['FULL OUTER JOIN', '양쪽 전부 (매칭 없으면 NULL)'],
          ],
        },
        {
          kind: 'example',
          title: '실 예시 — 부서/사원',
          body:
            "-- 1. 부서 매칭되는 사원만\nSELECT E.이름, D.부서명\nFROM 사원 E INNER JOIN 부서 D\n  ON E.부서ID = D.부서ID;\n\n-- 2. 사원이 없는 부서까지\nSELECT D.부서명, E.이름\nFROM 부서 D LEFT JOIN 사원 E\n  ON D.부서ID = E.부서ID;\n\n-- 3. 양쪽 모두 (부서 없는 사원 + 사원 없는 부서)\nSELECT D.부서명, E.이름\nFROM 부서 D FULL OUTER JOIN 사원 E\n  ON D.부서ID = E.부서ID;",
        },
        {
          kind: 'section',
          title: '행 수 합계 문제 — 자주 나오는 패턴',
          body:
            '각 JOIN 의 행 수 관계: INNER ≤ LEFT, INNER ≤ RIGHT ≤ FULL.\n예: 두 테이블 (T1=4행, T2=4행), 매칭 키 1개 (G가 양쪽 모두), 비매칭 키들이 양쪽에 3개씩.\n• INNER = 1\n• LEFT = 1 + 3(왼쪽 비매칭) = 4\n• RIGHT = 1 + 3(오른쪽 비매칭) = 4\n• FULL = 1 + 3 + 3 = 7\n• 합 = 1 + 4 + 4 + 7 = 16',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'JOIN 만 쓰면 INNER',
          body:
            '"FROM A JOIN B ON A.k = B.k" 처럼 JOIN 만 쓰면 INNER JOIN 으로 해석. 명확성 위해 INNER 명시 권장.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — JOIN 결과가 다른 것 찾기',
          body:
            'JOIN 결과는 남는 행의 범위가 다릅니다. INNER는 양쪽에 모두 있는 행, LEFT는 왼쪽 전체, RIGHT는 오른쪽 전체, FULL OUTER는 양쪽 전체를 남기므로 보통 가장 넓은 결과가 됩니다.',
        },
      ],
    },
    {
      id: 'sqld-2-2-s2',
      title: 'JOIN 조건 표기',
      quizId: 'sqld-2-2-cp-02',
      group: 'sqld-2-2-g1-joins',
      dialogue: [
        { pose: 'wave', text: 'JOIN 의 [매칭 조건]을 명시하는 3가지 방법. 각각 특징 다름.' },
        { pose: 'think', text: '① [NATURAL JOIN]은 양쪽 테이블에서 이름이 같은 컬럼을 자동으로 찾아 조인해.\n그래서 ON이나 USING을 직접 쓰지 않아.' },
        { pose: 'lightbulb', text: '예: SELECT * FROM 사원 NATURAL JOIN 부서 — 양쪽에 [부서ID] 가 있으면 자동 매칭.' },
        { pose: 'happy', text: '② [USING(컬럼)]: 같은 이름 컬럼을 [명시적]으로 지정.' },
        { pose: 'think', text: '예: INNER JOIN 부서 USING (부서ID) — 부서ID 가 양쪽에 있어야 함.' },
        { pose: 'lightbulb', text: '③ [ON 조건]은 조인 조건을 가장 직접적으로 적는 방식이야.\n양쪽 컬럼명이 달라도 사용할 수 있어.' },
        { pose: 'happy', text: '예: ON E.dept_id = D.id — 한쪽이 dept_id, 다른 쪽이 id 여도 쓸 수 있어.' },
        { pose: 'think', text: '헷갈리는 부분. ON 절은 [표현식이 와야]. [ON (컬럼명)] 만 쓰면 [오류].' },
        { pose: 'lightbulb', text: 'NATURAL JOIN 의 단점: 같은 이름 컬럼이 [의도치 않게 매칭]될 수 있어 [위험].' },
        { pose: 'happy', text: '실무는 [ON 조건] 권장. NATURAL JOIN 은 가급적 피하기.' },
        { pose: 'think', text: 'NATURAL/USING 의 결과 컬럼은 [한 번만] 등장. 테이블 prefix [쓸 수 없어].' },
        { pose: 'lightbulb', text: '예: SELECT 부서ID FROM 사원 USING(부서ID) → 쓸 수 있어 / SELECT E.부서ID FROM. USING → 오류.' },
        { pose: 'idle', text: 'ON (DEPT_ID) 만 쓰면 어떻게? 오류.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'JOIN 의 매칭 조건을 표기하는 3가지 방법 — NATURAL, USING, ON. 각각 컬럼명 같음 여부·명시도·prefix 쓸 수 있어 여부가 다릅니다. 실무는 ON 조건이 가장 명확하고 안전.',
        },
        {
          kind: 'example',
          title: '3가지 표기 비교',
          body:
            "-- ① NATURAL JOIN — 같은 이름 컬럼 자동\nSELECT * FROM 사원 NATURAL JOIN 부서;\n  -- 양쪽에 '부서ID' 있다면 자동 매칭. 같은 이름 컬럼이 여러 개면 모두 매칭.\n\n-- ② USING — 같은 이름 컬럼 명시\nSELECT 이름, 부서명\nFROM 사원 INNER JOIN 부서 USING (부서ID);\n  -- 부서ID 가 양쪽에 있어야 함. 결과에 부서ID 한 번만 등장.\n\n-- ③ ON — 가장 명시적, 컬럼명 달라도 쓸 수 있어\nSELECT E.이름, D.부서명\nFROM 사원 E INNER JOIN 부서 D ON E.부서ID = D.dept_id;",
        },
        {
          kind: 'table',
          title: '3가지 비교',
          headers: ['표기', '컬럼명', '명시도', 'prefix 사용'],
          rows: [
            ['NATURAL', '같아야 (자동)', '낮음', '안 됨'],
            ['USING(c)', '같아야 (명시)', '중간', '안 됨 (USING 컬럼)'],
            ['ON 조건', '달라도 쓸 수 있어', '높음', '가능'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 1 — ON (컬럼명) 단독',
          body:
            "INNER JOIN B ON (DEPT_ID) — 오류가 나. ON 절은 표현식 필요. ON A.DEPT_ID = B.DEPT_ID 또는 USING (DEPT_ID) 사용.",
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 2 — NATURAL/USING 의 prefix',
          body:
            "NATURAL JOIN 또는 USING 으로 매칭된 컬럼은 '단일 컬럼' 처럼 취급. SELECT E.부서ID 같이 prefix 사용 시 오류. 그냥 부서ID 로.",
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '실무 권장 — ON',
          body:
            'NATURAL JOIN 은 의도치 않은 같은 이름 컬럼 (예: created_at) 까지 매칭되어 위험. USING 은 컬럼명 같을 때만 가능. ON 이 가장 안전.',
        },
      ],
    },
    {
      id: 'sqld-2-2-s3',
      title: 'CROSS와 SELF JOIN',
      quizId: 'sqld-2-2-cp-03',
      group: 'sqld-2-2-g1-joins',
      dialogue: [
        { pose: 'wave', text: '특수 JOIN [2종] — CROSS 와 SELF.' },
        { pose: 'think', text: '[CROSS JOIN] = [카티시안 곱(Cartesian Product)] = [모든 쌍 조합].' },
        { pose: 'lightbulb', text: 'M 행 × N 행 = M·N 행. 매칭 조건 [없음].' },
        { pose: 'happy', text: '예: 학생(5명) CROSS JOIN 과목(3개) → 15 행 (모든 학생-과목 쌍).' },
        { pose: 'think', text: 'FROM A, B (콤마) + WHERE 없음 = CROSS JOIN 과 동치.' },
        { pose: 'lightbulb', text: 'WHERE 조건 추가하면 [INNER JOIN 효과]. FROM A, B WHERE A.k = B.k → INNER JOIN 동일.' },
        { pose: 'happy', text: '단. FROM A * B 같은 표기는 [SQL 표준 X] [오류].' },
        { pose: 'think', text: '[SELF JOIN] = [같은 테이블을 두 번 참조].' },
        { pose: 'lightbulb', text: '계층형 데이터에 자주 사용. 사원-멘토, 카테고리-상위, 글-답글.' },
        { pose: 'happy', text: 'SELF JOIN에서는 같은 테이블을 두 번 불러오므로 별칭이 꼭 필요해.\n예: FROM 사원 E, 사원 M WHERE E.멘토사번 = M.사번.' },
        { pose: 'think', text: 'JOIN 표기로도: FROM 사원 E JOIN 사원 M ON E.멘토사번 = M.사번.' },
        { pose: 'lightbulb', text: 'SELF JOIN은 사원과 상사를 같은 표 안에서 연결할 때 자주 써.' },
        { pose: 'idle', text: '5행 × 3행 CROSS JOIN = ? 15.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'CROSS JOIN 은 모든 가능한 쌍을, SELF JOIN 은 같은 테이블 자기 자신을 결합. CROSS 는 의도하지 않게 발생할 수 있어 위험, SELF JOIN 은 계층형 데이터의 표준 패턴.',
        },
        {
          kind: 'example',
          title: 'CROSS JOIN — 모든 쌍',
          body:
            "-- 명시적 표기\nSELECT 학생.이름, 과목.과목명\nFROM 학생 CROSS JOIN 과목;\n-- 동치 (콤마 + WHERE 없음)\nSELECT 학생.이름, 과목.과목명\nFROM 학생, 과목;\n-- 5명 × 3개 = 15행",
        },
        {
          kind: 'example',
          title: 'SELF JOIN — 사원-멘토',
          body:
            "-- 별칭 두 개로 같은 테이블 분리\nSELECT E.이름 AS 사원, M.이름 AS 멘토\nFROM 사원 E, 사원 M\nWHERE E.멘토사번 = M.사번;\n\n-- 차상위 관리자 (관리자의 관리자)\nSELECT E.이름 AS 사원,\n       M.이름 AS 직속관리자,\n       M2.이름 AS 차상위관리자\nFROM 사원 E\n  LEFT JOIN 사원 M  ON E.MGR_ID = M.사번\n  LEFT JOIN 사원 M2 ON M.MGR_ID = M2.사번;",
        },
        {
          kind: 'table',
          title: 'CROSS vs SELF',
          headers: ['항목', 'CROSS JOIN', 'SELF JOIN'],
          rows: [
            ['대상', '서로 다른 두 테이블', '같은 테이블'],
            ['매칭 조건', '없음 (모든 쌍)', 'WHERE 또는 ON 으로 명시'],
            ['결과 행 수', 'M × N', '조건에 따라'],
            ['용도', '드뭄 (조합 생성)', '계층형 / 자기 참조'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — FROM A, B WHERE 없음',
          body:
            'FROM A, B WHERE 가 없으면 카티시안 곱이 발생해 의도치 않은 폭증. 항상 WHERE 또는 명시적 JOIN 사용. "FROM A * B" 표기는 SQL 표준 X.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '셀프 조인 팁',
          body:
            '같은 테이블을 두 번 사용하므로 반드시 별칭 (E, M 등) 으로 구분. 차상위·차차상위 관리자 등 깊이를 늘리려면 LEFT JOIN 을 여러 번 또는 CONNECT BY (Oracle).',
        },
      ],
    },
    {
      id: 'sqld-2-2-s4',
      title: '서브쿼리 반환 형태',
      quizId: 'sqld-2-2-cp-04',
      group: 'sqld-2-2-g2-subqueries',
      dialogue: [
        { pose: 'wave', text: '[서브쿼리(Subquery)]는 쿼리 안에 들어가는 또 다른 쿼리야.' },
        { pose: 'think', text: '처음에는 “결과가 어떤 모양으로 나오나?”부터 보면 쉬워.' },
        { pose: 'lightbulb', text: '서브쿼리는 반환하는 결과 모양에 따라 단일행, 다중행, 다중열, 스칼라로 나눠 볼 수 있어.' },
        { pose: 'happy', text: '① [단일행 서브쿼리]는 한 행, 한 컬럼짜리 값 하나를 반환해.\n그래서 =, >, < 같은 단일값 비교에 사용해.' },
        { pose: 'think', text: '예: WHERE 급여 > (SELECT AVG(급여) FROM EMP) — 평균 1개 값과 비교.' },
        { pose: 'lightbulb', text: '② [다중행 서브쿼리]는 여러 행을 반환해.\n그래서 IN, ANY, ALL, EXISTS 같은 연산자와 함께 써.' },
        { pose: 'happy', text: '예: WHERE 부서ID IN (SELECT 부서ID FROM 부서 WHERE 지역=서울).' },
        { pose: 'think', text: '③ [다중열 서브쿼리]는 한 행 안에서 여러 컬럼을 함께 비교해.\n(a, b) IN (...) 같은 패턴으로 볼 수 있어.' },
        { pose: 'lightbulb', text: '④ [스칼라 서브쿼리]: SELECT 절 안의 [한 행·한 컬럼] 서브쿼리. 값처럼 사용.' },
        { pose: 'lightbulb', text: '헷갈리는 부분. 단일행 서브쿼리에 = 으로 다중행 결과 받으면 [ORA-01427] 오류.' },
        { pose: 'idle', text: '여러 행을 반환하는 서브쿼리는 어떤 연산자와 함께 쓸까?' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '서브쿼리는 한 쿼리의 결과를 다른 쿼리 안에서 다시 사용하는 방식입니다. 먼저 결과가 값 하나인지, 여러 행인지, 여러 컬럼인지부터 구분하면 뒤의 위치 분류도 훨씬 쉬워집니다.',
        },
        {
          kind: 'table',
          title: '결과 모양으로 보는 서브쿼리',
          headers: ['종류', '반환 모양', '함께 쓰는 것'],
          rows: [
            ['단일행', '1행·1컬럼', '=, >, < 같은 단일값 비교'],
            ['다중행', '여러 행·1컬럼', 'IN, ANY, ALL, EXISTS'],
            ['다중열', '여러 컬럼', '(a, b) IN (...)'],
            ['스칼라', '1행·1컬럼', 'SELECT 절의 값 자리'],
          ],
        },
        {
          kind: 'example',
          title: '결과 모양 예시',
          body:
            "-- 단일행: 평균 급여 값 1개\nWHERE 급여 > (SELECT AVG(급여) FROM EMP);\n\n-- 다중행: 서울 부서ID 여러 개\nWHERE 부서ID IN (SELECT 부서ID FROM 부서 WHERE 지역='서울');\n\n-- 다중열: 부서ID와 직무를 한 쌍으로 비교\nWHERE (부서ID, 직무) IN (SELECT 부서ID, 직무 FROM 인사팀);\n\n-- 스칼라: SELECT 절에서 값 하나처럼 사용\nSELECT 이름,\n  (SELECT 부서명 FROM 부서 D WHERE D.부서ID = E.부서ID) AS 부서명\nFROM EMP E;",
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — 단일행에 다중행 결과',
          body:
            "WHERE 부서ID = (SELECT 부서ID FROM 부서 WHERE 지역='서울') 인데 서울 부서가 여러 개라면 ORA-01427 오류. = → IN 으로 변경해야.",
        },
      ],
    },
    {
      id: 'sqld-2-2-s4-place',
      title: '서브쿼리 위치',
      quizId: 'sqld-2-2-cp-04-subquery-place',
      group: 'sqld-2-2-g2-subqueries',
      dialogue: [
        { pose: 'wave', text: '이번에는 서브쿼리가 [어디에 놓이는지]를 볼게.' },
        { pose: 'think', text: '서브쿼리는 SELECT, FROM, WHERE 같은 자리마다 이름과 쓰임이 달라져.' },
        { pose: 'lightbulb', text: '[SELECT 절] 안에 있으면 값 하나처럼 쓰는 스칼라 서브쿼리가 자주 나와.' },
        { pose: 'happy', text: '[FROM 절] 안에 있으면 [인라인 뷰]야.\n쿼리 결과를 잠깐 만든 임시 테이블처럼 사용해.' },
        { pose: 'think', text: '[WHERE 절] 안에 있으면 조건 비교에 자주 쓰여.\nIN, EXISTS, ANY, ALL과 함께 나오는 경우가 많아.' },
        { pose: 'lightbulb', text: '[상호연관 서브쿼리]는 바깥 쿼리의 컬럼을 참조해.\n그래서 바깥 행마다 다시 확인하는 느낌이야.' },
        { pose: 'idle', text: 'FROM 절 안의 서브쿼리는 무엇이라고 부를까?' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '서브쿼리는 결과 모양뿐 아니라 위치로도 구분합니다. FROM 절 안에 있으면 인라인 뷰, SELECT 절에서 값처럼 쓰면 스칼라 서브쿼리, 바깥 쿼리 값을 참조하면 상호연관 서브쿼리라고 부릅니다.',
        },
        {
          kind: 'table',
          title: '위치로 보는 서브쿼리',
          headers: ['위치', '이름/역할', '느낌'],
          rows: [
            ['SELECT 절', '스칼라 서브쿼리', '컬럼 값 하나처럼 사용'],
            ['FROM 절', '인라인 뷰', '잠깐 만든 임시 테이블처럼 사용'],
            ['WHERE 절', '조건 비교', 'IN, EXISTS, ANY, ALL과 자주 사용'],
            ['바깥 컬럼 참조', '상호연관 서브쿼리', '바깥 행마다 다시 확인'],
          ],
        },
        {
          kind: 'example',
          title: '인라인 뷰와 상호연관',
          body:
            "-- 인라인 뷰: FROM 절 안에 들어간 서브쿼리\nSELECT *\nFROM (SELECT 부서ID, AVG(급여) AS 평균 FROM EMP GROUP BY 부서ID) X\nWHERE X.평균 > 5000000;\n\n-- 상호연관: 바깥 쿼리 E.부서ID를 안쪽에서 참조\nSELECT 이름 FROM EMP E\nWHERE 급여 > (SELECT AVG(급여) FROM EMP\n              WHERE 부서ID = E.부서ID);",
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '서브쿼리 vs 메인쿼리',
          body:
            '서브쿼리는 메인쿼리 컬럼을 참조 가능 (상호연관). 그러나 메인쿼리는 서브쿼리 컬럼을 직접 참조 안 됨 — 서브쿼리 결과를 받아 비교만 가능.',
        },
      ],
    },
    {
      id: 'sqld-2-2-s5',
      title: '다중행 비교',
      quizId: 'sqld-2-2-cp-05',
      group: 'sqld-2-2-g2-subqueries',
      extraQuizIds: ['sqld-sql-lab-017', 'sqld-sql-read-002', 'sqld-sql-order-004'],
      dialogue: [
        { pose: 'wave', text: '다중행 서브쿼리와 함께 쓰는 [4가지 연산자]. 의미가 미묘하게 달라.' },
        { pose: 'think', text: '[IN]은 값이 서브쿼리 결과 목록 안에 들어 있는지 확인하는 연산자야.' },
        { pose: 'lightbulb', text: '예: WHERE 부서ID IN (SELECT 부서ID FROM 부서 WHERE 지역="서울").' },
        { pose: 'happy', text: '[EXISTS]는 서브쿼리 결과가 하나라도 존재하는지 확인해.\n값을 직접 비교하기보다 “있냐 없냐”를 보는 연산자야.' },
        { pose: 'think', text: '예: WHERE EXISTS (SELECT 1 FROM 주문 WHERE 주문.회원ID = 회원.ID) — 회원이 주문이 있는지.' },
        { pose: 'lightbulb', text: '[ANY]: 서브쿼리 결과 [중 하나라도 만족]하면 TRUE.' },
        { pose: 'happy', text: '> ANY (a,b,c) = 최솟값 a 보다 크면 쓸 수 있어. 가장 느슨.' },
        { pose: 'think', text: '[ALL]은 서브쿼리 결과의 모든 값에 대해 조건을 만족해야 TRUE가 돼.' },
        { pose: 'lightbulb', text: '> ALL (a,b,c) = 최댓값 c 보다 커야 쓸 수 있어. 가장 엄격.' },
        { pose: 'happy', text: '= ANY 는 IN 과 [동일]. != ALL 은 NOT IN 과 동일.' },
        { pose: 'think', text: '[가입 안 한 회원] 찾기 — NOT EXISTS 또는 NOT IN.' },
        { pose: 'lightbulb', text: '헷갈리는 부분. NOT IN 에 NULL 이 섞이면 [전체가 UNKNOWN] → 0행.' },
        { pose: 'happy', text: '안전한 패턴: [NOT EXISTS] 사용. NULL 영향 없음.' },
        { pose: 'idle', text: ">= ANY (50, 100, 150) — 최솟값 50 이상이면 TRUE!" },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'EXISTS·IN·ANY·ALL 은 다중행 서브쿼리와 함께 쓰는 4가지 연산자. 의미가 비슷해 보이지만 차이가 있어 자주 나오는 패턴. 특히 NOT IN + NULL 의 헷갈리는 부분을 알면 실무 버그도 줄어듭니다.',
        },
        {
          kind: 'table',
          title: '4가지 연산자',
          headers: ['연산자', '의미', '예'],
          rows: [
            ['IN (서브쿼리)', '결과 집합에 포함', 'col IN (10, 20, 30)'],
            ['EXISTS (서브쿼리)', '서브쿼리 행 1개 이상이면 TRUE', 'EXISTS (SELECT 1 FROM B WHERE B.k=A.k)'],
            ['= ANY', 'IN 과 동일', 'col = ANY (10,20)'],
            ['> ANY (a,b,c)', '최솟값보다 크면 TRUE', '5 > ANY (3,7,9) = TRUE (3<5)'],
            ['> ALL (a,b,c)', '최댓값보다 커야 TRUE', '10 > ALL (3,7,9) = TRUE (10>9)'],
            ['<= ALL', '최솟값 이하면 TRUE', '—'],
            ['!= ALL', 'NOT IN 과 동일', '—'],
          ],
        },
        {
          kind: 'example',
          title: '"계약 한 번도 없는 고객" — 안전한 패턴',
          body:
            "-- 위험 (계약.회원ID 에 NULL 있으면 0행 반환)\nSELECT * FROM 회원\nWHERE 회원ID NOT IN (SELECT 회원ID FROM 계약);\n\n-- 안전 (NULL 영향 없음)\nSELECT * FROM 회원 c\nWHERE NOT EXISTS (\n  SELECT 1 FROM 계약 t WHERE t.회원ID = c.회원ID\n);\n\n-- 안전 변형 (NULL 명시 제외)\nSELECT * FROM 회원\nWHERE 회원ID NOT IN (\n  SELECT 회원ID FROM 계약 WHERE 회원ID IS NOT NULL\n);",
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — NOT IN + NULL',
          body:
            'NOT IN (서브쿼리) 결과에 NULL 이 섞이면 모든 비교가 UNKNOWN → 0행. NOT EXISTS 로 대체하거나 WHERE 컬럼 IS NOT NULL 추가.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'EXISTS vs IN 성능',
          body:
            'EXISTS 는 행 하나만 찾으면 즉시 TRUE — 큰 테이블 빠름. IN 은 전체 결과 집합을 만든 뒤 비교. 일반적으로 EXISTS 가 빠르나 옵티마이저에 따라 다름.',
        },
      ],
    },
    {
      id: 'sqld-2-2-s6',
      title: '집합 연산자',
      quizId: 'sqld-2-2-cp-06',
      group: 'sqld-2-2-g3-set-group',
      extraQuizIds: ['sqld-sql-lab-018', 'sqld-sql-order-005'],
      dialogue: [
        { pose: 'wave', text: '[집합 연산자]는 [두 쿼리 결과를 세로로 합치는] 도구.' },
        { pose: 'think', text: 'JOIN 이 [가로 결합] 이라면, 집합 연산자는 [세로 결합].' },
        { pose: 'lightbulb', text: '집합 연산자는 SELECT 결과끼리 합치거나 비교할 때 써.\n대표적으로 UNION, UNION ALL, INTERSECT, MINUS가 있어.' },
        { pose: 'happy', text: '① [UNION ALL]은 두 결과를 그대로 이어붙여.\n중복을 제거하지 않아서 가장 단순하고 빠른 편이야.' },
        { pose: 'think', text: '② [UNION]은 합집합이야.\n두 결과를 합친 뒤 중복 행을 제거해.' },
        { pose: 'lightbulb', text: '③ [INTERSECT]는 교집합이야.\n양쪽 SELECT 결과에 모두 있는 행만 남겨.' },
        { pose: 'happy', text: '④ [MINUS] (Oracle) / [EXCEPT] (SQL Server): [차집합]. 앞 결과에서 뒤 결과 빼기.' },
        { pose: 'think', text: '전제 조건: 두 쿼리의 [컬럼 개수] + [데이터 타입] [호환]되어야 동작.' },
        { pose: 'lightbulb', text: '결과 컬럼 이름은 [첫 번째 쿼리 기준]. ORDER BY 는 마지막에 한 번만.' },
        { pose: 'happy', text: 'UNION ALL은 중복을 제거하지 않아. 그래서 UNION 결과에 겹치는 부분이 한 번 더 남는다고 생각하면 쉬워.' },
        { pose: 'think', text: '성능 팁: 중복 없는 게 보장되거나 중복 제거 불필요 → UNION ALL.' },
        { pose: 'lightbulb', text: '"두 결과를 모두 합치되 중복을 제거하지 않는다"면 UNION ALL을 떠올리자.' },
        { pose: 'idle', text: '교집합은? INTERSECT. 차집합은? MINUS.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '집합 연산자는 두 SELECT 결과를 세로로 합치거나 비교하는 도구입니다. 수학의 합집합·교집합·차집합을 SQL 결과표에 적용한다고 보면 됩니다.',
        },
        {
          kind: 'table',
          title: '집합 연산자 4종',
          headers: ['연산자', '의미', '중복 처리', '비용'],
          rows: [
            ['UNION', '합집합', '중복 제거 + 정렬', '높음'],
            ['UNION ALL', '이어붙이기', '중복 그대로', '낮음 (가장 빠름)'],
            ['INTERSECT', '교집합', '중복 제거', '중간'],
            ['MINUS / EXCEPT', '차집합 (앞-뒤)', '중복 제거', '중간'],
          ],
        },
        {
          kind: 'example',
          title: '예시',
          body:
            "-- 학생1 ∪ 학생2 (중복 포함)\nSELECT 이름, 학번 FROM 학생1\nUNION ALL\nSELECT 이름, 학번 FROM 학생2;\n\n-- 100·101 모두 듣는 학생 (교집합)\nSELECT 학번 FROM 수강 WHERE 강의=100\nINTERSECT\nSELECT 학번 FROM 수강 WHERE 강의=101;\n\n-- 학생1 - 학생2 (차집합)\nSELECT * FROM 학생1\nMINUS\nSELECT * FROM 학생2;",
        },
        {
          kind: 'keypoints',
          title: '전제 조건',
          items: [
            '두 쿼리의 컬럼 개수 같음',
            '대응 컬럼의 데이터 타입 호환',
            '컬럼 이름은 첫 쿼리 기준 (다르면 ALIAS 권장)',
            'ORDER BY 는 마지막 쿼리 뒤에 한 번만',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'UNION ALL = UNION + INTERSECT',
          body:
            '두 집합의 행 수 합 = (중복 없는 합집합) + (양쪽에 등장한 중복분). UNION ALL 은 둘 다 포함, UNION 은 중복 제거 후 합집합만.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '성능에서 헷갈리는 부분',
          body:
            'UNION 은 중복 제거를 위해 정렬 비용 발생. 이미 중복이 없거나 중복 제거가 필요 없는 상황에서 UNION 쓰면 불필요 비용. UNION ALL 검토.',
        },
      ],
    },
    {
      id: 'sqld-2-2-s7',
      title: '그룹 함수',
      quizId: 'sqld-2-2-cp-07',
      group: 'sqld-2-2-g3-set-group',
      extraQuizIds: ['sqld-sql-lab-019'],
      dialogue: [
        { pose: 'wave', text: 'GROUP BY 의 [확장 형태] 3총사 — [ROLLUP], [CUBE], [GROUPING SETS].' },
        { pose: 'think', text: '소계·총계·다양한 조합을 한 쿼리로 만드는 도구.' },
        { pose: 'lightbulb', text: '① [ROLLUP(a, b)]: 컬럼 순서대로 [점진적]으로 그룹을 줄여 소계+총계.' },
        { pose: 'happy', text: 'ROLLUP(지역, 상품) → [(지역,상품), (지역), ()] 3가지 그룹.' },
        { pose: 'think', text: '예: 지역별·상품별 매출 + 지역 소계 + 전체 총계 한 번에.' },
        { pose: 'lightbulb', text: '헷갈리는 부분. ROLLUP(a,b) 와 ROLLUP(b,a) 는 [결과 다름]. 컬럼 순서 중요.' },
        { pose: 'happy', text: '② [CUBE]는 가능한 모든 조합의 소계와 총계를 만들어.\nROLLUP보다 더 많은 집계 조합을 보여줘.' },
        { pose: 'think', text: 'CUBE(지역, 상품) → [(지역,상품), (지역), (상품), ()] 4가지.' },
        { pose: 'lightbulb', text: '컬럼 순서 [무관]. 모든 조합 다 만들기 때문.' },
        { pose: 'happy', text: '③ [GROUPING SETS]는 원하는 집계 조합만 직접 지정하는 방식이야.\n필요한 소계만 골라 만들 수 있어.' },
        { pose: 'think', text: 'GROUPING SETS ((a,b), (c), ()) — 정확히 이 3가지만.' },
        { pose: 'lightbulb', text: '동치 변환: ROLLUP(a, b) ≡ GROUPING SETS ((a,b), (a), ()).' },
        { pose: 'happy', text: '[GROUPING(col)] 함수: 그 컬럼이 소계 행이면 1, 아니면 0.' },
        { pose: 'think', text: 'CASE WHEN GROUPING(col)=1 THEN "소계" ELSE col END 패턴 자주.' },
        { pose: 'idle', text: 'CUBE(a,b) 의 결과 그룹은 몇 개? 4개.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '집계 보고서를 만들 때 GROUP BY만으로는 소계와 총계를 한 번에 만들기 어렵습니다. ROLLUP, CUBE, GROUPING SETS는 여러 집계 단계를 한 쿼리에서 표현하게 해줍니다.',
        },
        {
          kind: 'table',
          title: '그룹 확장 함수 비교',
          headers: ['함수', '생성하는 그룹', '용도'],
          rows: [
            ['ROLLUP(a, b)', '(a,b), (a), ()', '소계 + 총계 (계층적)'],
            ['CUBE(a, b)', '(a,b), (a), (b), ()', '모든 조합'],
            ['GROUPING SETS ((a),(b),())', '명시한 조합만', '특정 조합만 필요할 때'],
          ],
        },
        {
          kind: 'example',
          title: 'ROLLUP 예시',
          body:
            "SELECT 지역, 상품, SUM(가격) AS 합계\nFROM 판매\nGROUP BY ROLLUP(지역, 상품);\n\n-- 결과:\n-- (서울, 사과, 1000)\n-- (서울, 배,   2000)\n-- (서울, NULL, 3000)  ← 지역 소계\n-- (부산, 사과, 1500)\n-- (부산, NULL, 1500)  ← 지역 소계\n-- (NULL, NULL, 4500) ← 총계",
        },
        {
          kind: 'example',
          title: 'GROUPING(col) 활용',
          body:
            "SELECT\n  CASE WHEN GROUPING(지역)=1 THEN '전체' ELSE 지역 END AS 지역,\n  CASE WHEN GROUPING(상품)=1 AND GROUPING(지역)=0 THEN '소계' ELSE 상품 END AS 상품,\n  SUM(가격)\nFROM 판매\nGROUP BY ROLLUP(지역, 상품);",
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'ROLLUP/CUBE/GROUPING SETS 동치',
          body:
            'ROLLUP(a,b)는 (a,b) → (a) → 전체 총계 순서로 내려갑니다. CUBE(a,b)는 (a,b), (a), (b), 전체 총계를 모두 만듭니다.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — ROLLUP 컬럼 순서',
          body:
            'ROLLUP(a, b) 와 ROLLUP(b, a) 결과 다름. 첫 컬럼 기준으로 점진적 소계가 만들어지므로 순서가 중요. CUBE 는 무관.',
        },
      ],
    },
    {
      id: 'sqld-2-2-s8',
      title: '윈도우 함수',
      quizId: 'sqld-2-2-cp-08',
      group: 'sqld-2-2-g4-window-apps',
      extraQuizIds: ['sqld-2-2-cp-08-rank-dense', 'sqld-sql-lab-020', 'sqld-sql-read-003'],
      dialogue: [
        { pose: 'wave', text: '[윈도우 함수(Window Function)]는 원래 행을 그대로 두고 옆에 계산값을 붙이는 기능이야.' },
        { pose: 'think', text: '윈도우 함수의 기본 모양은 함수() OVER (...)야.\nOVER 안에서 그룹을 나누고, 정렬 기준을 정해.' },
        { pose: 'lightbulb', text: 'PARTITION BY 가 그룹 (부서별 등), ORDER BY 가 그룹 내 순서.' },
        { pose: 'happy', text: '순위 함수 [3총사] — 자주 나오는 핵심 개념.' },
        { pose: 'think', text: '① [RANK()]: 동점 → [같은 순위] + 다음 순위 [건너뜀].' },
        { pose: 'lightbulb', text: '② [DENSE_RANK()]: 동점 → 같은 순위 + 다음 순위 [건너뛰지 않음].' },
        { pose: 'happy', text: '③ [ROW_NUMBER()]는 동점이어도 무조건 서로 다른 번호를 붙여.\n그래서 항상 고유한 순번이 생겨.' },
        { pose: 'think', text: '예시: 점수 100, 100, 90, 80 (DESC).' },
        { pose: 'lightbulb', text: 'RANK = [1, 1, 3, 4] (3번 건너뜀).' },
        { pose: 'happy', text: 'DENSE_RANK = [1, 1, 2, 3] (연속).' },
        { pose: 'think', text: 'ROW_NUMBER = [1, 2, 3, 4] (동점도 별개 번호).' },
        { pose: 'lightbulb', text: '헷갈리는 부분. 두 명 동률 후 다음 사람의 순위 — RANK=3, DENSE_RANK=2, ROW_NUMBER=3.' },
        { pose: 'happy', text: 'GROUP BY 는 행을 줄이고, 윈도우 함수는 행을 유지해. 이 차이가 핵심이야.' },
        { pose: 'idle', text: '동점 후 다음 사람 순위가 2 면? DENSE_RANK.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '윈도우 함수는 행을 줄이지 않고 각 행 옆에 순위, 누적합, 그룹 평균 같은 값을 붙입니다. “직원 목록은 그대로 두고 각 직원의 부서 평균도 같이 보고 싶다” 같은 상황에서 사용합니다.',
        },
        {
          kind: 'example',
          title: '부서별 급여 순위',
          body:
            "SELECT 이름, 부서, 급여,\n  RANK()       OVER (PARTITION BY 부서 ORDER BY 급여 DESC) AS RNK,\n  DENSE_RANK() OVER (PARTITION BY 부서 ORDER BY 급여 DESC) AS DRNK,\n  ROW_NUMBER() OVER (PARTITION BY 부서 ORDER BY 급여 DESC) AS RN\nFROM 사원;",
        },
        {
          kind: 'table',
          title: '순위 함수 비교 — 점수 (100, 100, 90, 80)',
          headers: ['값', 'RANK', 'DENSE_RANK', 'ROW_NUMBER'],
          rows: [
            ['100', '1', '1', '1'],
            ['100', '1', '1', '2'],
            ['90', '3 (2 건너뜀)', '2 (연속)', '3'],
            ['80', '4', '3', '4'],
          ],
        },
        {
          kind: 'section',
          title: '윈도우 함수 vs GROUP BY',
          body:
            'GROUP BY: 같은 값 행을 한 줄로 압축. 결과 행 수 ↓.\n윈도우 함수: 원본 행 수 유지 + 각 행 옆에 그룹 통계.\n예: "각 사원 옆에 부서 평균 급여 표시" 는 GROUP BY 만으로 안 됨능, 윈도우 함수 꼭 알아둘 부분.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"RANK 건너 / DENSE 연속 / ROW 고유"',
          body:
            'RANK = 동점 후 다음 순위 건너뜀, DENSE = 건너뛰지 않음, ROW_NUMBER = 동점 무시 고유 번호. 동률 처리가 핵심 차이.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'PARTITION BY 생략 시',
          body:
            'PARTITION BY 를 생략하면 전체 결과 1그룹으로 처리. 예: ROW_NUMBER() OVER (ORDER BY 급여 DESC) → 전체 사원 중 급여 순위.',
        },
      ],
    },
    {
      id: 'sqld-2-2-s9',
      title: '집계 윈도우 함수',
      quizId: 'sqld-2-2-cp-09',
      group: 'sqld-2-2-g4-window-apps',
      extraQuizIds: ['sqld-sql-lab-021'],
      dialogue: [
        { pose: 'wave', text: 'SUM, AVG 같은 집계함수도 [OVER]를 붙이면 행을 줄이지 않는 윈도우 함수가 돼.' },
        { pose: 'think', text: 'OVER() 가 [비어있으면] [전체 행]을 한 윈도우로.' },
        { pose: 'lightbulb', text: '예: SUM(판매액) OVER () = 모든 행의 [총합] 을 각 행 옆에 표시.' },
        { pose: 'happy', text: '[PARTITION BY]는 윈도우 함수 안에서 그룹을 나누는 기준이야.\n예를 들어 지역별로 합계를 따로 계산할 수 있어.' },
        { pose: 'think', text: '예: SUM(판매액) OVER (PARTITION BY 지역) → 지역별 합계.' },
        { pose: 'lightbulb', text: 'GROUP BY 와의 결정적 차이: 윈도우 함수는 [원본 행 수 유지].' },
        { pose: 'happy', text: '"각 직원 옆에 부서 평균 급여 표시" 같은 요구는 GROUP BY 만으로 할 수 없어.' },
        { pose: 'think', text: '[ORDER BY] 추가하면 [누적] 효과. SUM(판매액) OVER (ORDER BY 날짜) = 날짜별 누적합.' },
        { pose: 'lightbulb', text: 'PARTITION BY + ORDER BY 조합: 부서별 누적, 지역별 누적 등 자유롭게.' },
        { pose: 'happy', text: '실무 예: 매출 순위, 누적 매출, 동기 대비 성장률, 이동평균.' },
        { pose: 'think', text: 'GROUP BY 없이도 할 수 있어 — SELECT 절에 윈도우 함수만 넣으면 자동으로 모든 행에 적용.' },
        { pose: 'idle', text: 'OVER() 비어있으면? 전체 행 1그룹.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '집계 윈도우 함수는 GROUP BY 의 한계를 깨뜨립니다. "각 행 옆에 그룹 통계를 동시에 표시" 가 가능. PARTITION BY + ORDER BY 조합으로 누적/이동평균/순위 등 풍부한 분석.',
        },
        {
          kind: 'example',
          title: '집계 윈도우 종합 예시',
          body:
            "SELECT 지역, 직원, 판매액,\n  SUM(판매액) OVER ()                  AS 총합,\n  SUM(판매액) OVER (PARTITION BY 지역) AS 지역합,\n  AVG(판매액) OVER (PARTITION BY 지역) AS 지역평균,\n  SUM(판매액) OVER (ORDER BY 판매액)   AS 누적합,\n  SUM(판매액) OVER (PARTITION BY 지역 ORDER BY 날짜)\n                                      AS 지역_누적합\nFROM 판매;",
        },
        {
          kind: 'table',
          title: 'OVER() 절 구성',
          headers: ['요소', '의미'],
          rows: [
            ['OVER ()', '전체 행 1윈도우'],
            ['PARTITION BY 컬럼', '그룹 분할'],
            ['ORDER BY 컬럼', '그룹 내 정렬 + 누적 효과'],
            ['ROWS / RANGE', '윈도우 크기 명시'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'GROUP BY vs 윈도우',
          body:
            '"부서별 평균만 보고 싶다" → GROUP BY 부서 (행 수 ↓). "각 사원 옆에 부서 평균 함께" → AVG(급여) OVER (PARTITION BY 부서) (행 수 유지).',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — GROUP BY 와 혼용',
          body:
            'GROUP BY 가 있는 쿼리에 윈도우 함수를 쓰면 윈도우는 GROUP BY 결과에 적용. 두 결과 동시 표현 시 인라인뷰로 분리.',
        },
      ],
    },
    {
      id: 'sqld-2-2-s10',
      title: '행 간 참조 함수',
      quizId: 'sqld-2-2-cp-10',
      group: 'sqld-2-2-g4-window-apps',
      extraQuizIds: ['sqld-sql-lab-022', 'sqld-sql-lab-023'],
      dialogue: [
        { pose: 'wave', text: '이번에는 “이전 행”, “다음 행” 값을 가져오는 윈도우 함수를 볼 거야.' },
        { pose: 'think', text: '[LAG]는 이전 행, [LEAD]는 다음 행을 가져와. 매출을 어제와 비교할 때 자주 써.' },
        { pose: 'lightbulb', text: '[FIRST_VALUE]는 범위 안의 첫 값, [LAST_VALUE]는 범위 안의 마지막 값이야.' },
        { pose: 'happy', text: '예: 일별 매출 비교에서 어제 매출 가져오기.' },
        { pose: 'think', text: '[LEAD]는 현재 행보다 뒤에 있는 값을 가져와.\n예를 들어 다음 날 매출을 현재 행 옆에 붙일 수 있어.' },
        { pose: 'lightbulb', text: '[FIRST_VALUE]는 윈도우 범위 안에서 첫 번째 값을 가져오는 함수야.' },
        { pose: 'happy', text: '[LAST_VALUE]는 윈도우 범위 안에서 마지막 값을 가져오는 함수야.\n다만 원하는 범위를 명확히 지정해야 헷갈리지 않아.' },
        { pose: 'think', text: '범위 지정: [ROWS] (행 단위) vs [RANGE] (값 단위).' },
        { pose: 'lightbulb', text: 'BETWEEN [UNBOUNDED PRECEDING] AND [CURRENT ROW] = [누적합·누적평균].' },
        { pose: 'happy', text: 'BETWEEN [1 PRECEDING] AND [1 FOLLOWING] = [3행 이동평균].' },
        { pose: 'think', text: '[ROWS] = 행 개수 단위. [RANGE] = 값 같은 행은 묶어 처리.' },
        { pose: 'lightbulb', text: '예: 점수가 같은 행이 3개라면 ROWS 는 3행, RANGE 는 1그룹으로 처리.' },
        { pose: 'happy', text: '범위 생략 시 기본은 [RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW].' },
        { pose: 'idle', text: 'ROWS 와 RANGE 차이는? 행 vs 값.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'LAG/LEAD 는 시계열 분석의 꼭 알아둘 부분 도구 (어제·내일 값 가져오기). ROWS/RANGE 는 윈도우의 크기를 명시하는 절. 누적합·이동평균·전월대비 등에 활용.',
        },
        {
          kind: 'table',
          title: '행 간 참조 함수',
          headers: ['함수', '의미', '예시'],
          rows: [
            ['LAG(col, n, default)', 'n 행 이전 값', '어제 매출 가져오기'],
            ['LEAD(col, n, default)', 'n 행 이후 값', '내일 매출 가져오기'],
            ['FIRST_VALUE(col)', '윈도우 첫 값', '시작점 값'],
            ['LAST_VALUE(col)', '윈도우 마지막 값', '범위 명시 꼭 알아둘 부분'],
          ],
        },
        {
          kind: 'example',
          title: 'LAG/LEAD + 누적·이동평균',
          body:
            "-- 어제 매출 비교\nSELECT 날짜, 매출,\n  LAG(매출, 1) OVER (ORDER BY 날짜)  AS 어제매출,\n  매출 - LAG(매출, 1) OVER (ORDER BY 날짜) AS 증가량\nFROM 일별매출;\n\n-- 누적합 (시작 ~ 현재 행)\nSUM(매출) OVER (ORDER BY 날짜\n  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)\n\n-- 3행 이동평균\nAVG(매출) OVER (ORDER BY 날짜\n  ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING)",
        },
        {
          kind: 'table',
          title: 'ROWS vs RANGE',
          headers: ['옵션', '의미'],
          rows: [
            ['ROWS BETWEEN ...', '행 개수 단위. 같은 값이라도 한 행씩 처리'],
            ['RANGE BETWEEN ...', '정렬 키 값 단위. 같은 값은 묶어서 처리'],
            ['UNBOUNDED PRECEDING', '시작부터'],
            ['CURRENT ROW', '현재 행'],
            ['UNBOUNDED FOLLOWING', '끝까지'],
            ['n PRECEDING / n FOLLOWING', '현재 기준 n 행 앞/뒤'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '범위 생략 시 기본',
          body:
            'ORDER BY 만 있고 ROWS/RANGE 생략 시 기본은 RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. 즉 누적합으로 동작.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — LAST_VALUE',
          body:
            'LAST_VALUE 는 기본 윈도우가 시작~현재라 그냥 쓰면 항상 현재 행 값 = LAST_VALUE 가 됨. 의도한 "윈도우의 마지막 값" 을 얻으려면 ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING 명시 필요.',
        },
      ],
    },
    {
      id: 'sqld-2-2-s11',
      title: 'TOP N',
      quizId: 'sqld-2-2-cp-11',
      group: 'sqld-2-2-g4-window-apps',
      extraQuizIds: ['sqld-sql-lab-024', 'sqld-sql-order-006'],
      dialogue: [
        { pose: 'wave', text: '이번에는 [TOP N]을 볼 거야.' },
        { pose: 'think', text: '[TOP N]은 상위 N개만 보는 문법이야. 다만 DBMS마다 쓰는 방식이 달라.' },
        { pose: 'lightbulb', text: 'SQL Server: [TOP N], MySQL: [LIMIT N], Oracle 12c+: [FETCH FIRST N ROWS ONLY].' },
        { pose: 'happy', text: 'Oracle 구버전: [ROWNUM <= N] (단. 정렬 후 ROWNUM 위해 인라인뷰 필요).' },
        { pose: 'think', text: '동률 포함하려면 [WITH TIES]. 5위 동점이 3명이면 5개 → 7개 반환.' },
        { pose: 'idle', text: '"동률까지 포함" 옵션은? WITH TIES.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'TOP N은 정렬한 결과에서 상위 N개만 가져오는 패턴입니다. SQLD에서는 DBMS별 문법 차이와 Oracle 구버전 ROWNUM의 실행 순서 함정이 자주 나옵니다.',
        },
        {
          kind: 'table',
          title: 'TOP N 표현 — DBMS 별',
          headers: ['DBMS', '표현'],
          rows: [
            ['SQL Server', 'SELECT TOP 5 * FROM ... ORDER BY ...'],
            ['MySQL / PostgreSQL', 'SELECT * FROM ... ORDER BY ... LIMIT 5'],
            ['Oracle 12c+ / DB2', 'SELECT * FROM ... ORDER BY ... FETCH FIRST 5 ROWS ONLY'],
            ['Oracle 구버전', 'SELECT * FROM (SELECT * FROM ... ORDER BY ...) WHERE ROWNUM <= 5'],
            ['동률 포함', '... FETCH FIRST 5 ROWS WITH TIES (또는 SELECT TOP 5 WITH TIES)'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — Oracle ROWNUM + ORDER BY',
          body:
            "WHERE ROWNUM <= 5 ORDER BY ... 는 정렬 전 번호가 매겨져 잘못된 결과. ORDER BY 를 인라인뷰 안에서 먼저 적용 후 외부에서 ROWNUM. 또는 FETCH FIRST.",
        },
      ],
    },
    {
      id: 'sqld-2-2-s11-ratio',
      title: '비율 함수',
      group: 'sqld-2-2-g4-window-apps',
      dialogue: [
        { pose: 'wave', text: '이제 윈도우 함수 중 [비율 함수]를 볼게.' },
        { pose: 'think', text: '비율 함수는 순위만 보여주는 게 아니라, 전체에서 어느 위치인지 숫자로 보여줘.' },
        { pose: 'lightbulb', text: '[NTILE(n)]은 데이터를 n개 구간으로 나눠 번호를 붙이는 함수야.\n사분위, 십분위처럼 등급을 나눌 때 쓰기 좋아.' },
        { pose: 'happy', text: '[CUME_DIST]는 현재 행까지 누적해서 몇 퍼센트 지점인지 알려줘.' },
        { pose: 'think', text: '[PERCENT_RANK]는 현재 행의 상대적 순위를 0부터 1 사이 값으로 보여줘.' },
        { pose: 'lightbulb', text: '[RATIO_TO_REPORT]는 전체 합에서 현재 행이 차지하는 비율을 보여줘.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '비율 함수는 결과를 줄 세운 뒤 “몇 등인가”보다 더 자세히, 전체 중 어느 구간인지 또는 전체 합에서 얼마만큼 차지하는지를 보여주는 함수입니다.',
        },
        {
          kind: 'keypoints',
          title: '비율 함수 4종',
          items: [
            'NTILE(n) — 데이터를 n등분하고 그룹 번호를 붙인다',
            'CUME_DIST() — 현재 행까지의 누적 분포를 보여준다',
            'PERCENT_RANK() — 상대적 순위를 0~1 사이 값으로 보여준다',
            'RATIO_TO_REPORT() — 전체 합 대비 현재 행의 비율을 보여준다',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '처음에는 이렇게 구분',
          body:
            'NTILE은 “구간 나누기”, RATIO_TO_REPORT는 “전체 중 몇 퍼센트”, CUME_DIST와 PERCENT_RANK는 “정렬된 위치”를 보는 함수로 먼저 잡으면 됩니다.',
        },
      ],
    },
    {
      id: 'sqld-2-2-s11-hierarchy',
      title: '계층형 질의',
      quizId: 'sqld-sql-lab-025',
      group: 'sqld-2-2-g4-window-apps',
      dialogue: [
        { pose: 'wave', text: '이번에는 Oracle의 [계층형 질의]를 볼게.' },
        { pose: 'think', text: '상사-직원, 폴더-하위 폴더, 부모-자식처럼 위아래 구조를 따라갈 때 쓰는 문법이야.' },
        { pose: 'lightbulb', text: '[START WITH]는 어디에서 출발할지 정하는 절이야.\n보통 최상위 루트를 고를 때 써.' },
        { pose: 'happy', text: '[CONNECT BY PRIOR]는 부모와 자식을 어떻게 연결할지 정해.' },
        { pose: 'think', text: 'PRIOR 위치에 따라 부모에서 자식으로 내려갈지, 자식에서 부모로 올라갈지가 달라져.' },
        { pose: 'idle', text: '계층 탐색의 시작 루트를 정하는 절은 무엇일까?' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '계층형 질의는 트리 구조를 SQL로 따라가는 Oracle 문법입니다. START WITH로 시작점을 정하고, CONNECT BY PRIOR로 부모-자식 연결 규칙을 적습니다.',
        },
        {
          kind: 'example',
          title: '사원·관리자 트리',
          body:
            "-- 최상위(직속상관 IS NULL)부터 아래로 출력\nSELECT LEVEL, 사원이름, 직속상관\nFROM 사원\nSTART WITH 직속상관 IS NULL\nCONNECT BY PRIOR 사원이름 = 직속상관;\n\n-- PRIOR가 붙은 쪽을 이미 찾은 부모 행으로 보면 이해하기 쉽습니다.",
        },
        {
          kind: 'table',
          title: '계층형 질의 키워드',
          headers: ['키워드', '의미'],
          rows: [
            ['LEVEL', '현재 깊이. 최상위는 1'],
            ['START WITH', '루트 조건'],
            ['CONNECT BY PRIOR', '부모-자식 연결 규칙'],
            ['NOCYCLE', '순환 발생 시 무한 루프 방지'],
            ['ORDER SIBLINGS BY', '같은 레벨 형제끼리 정렬'],
          ],
        },
      ],
    },
    {
      id: 'sqld-2-2-s11-pivot',
      title: 'PIVOT과 UNPIVOT',
      quizId: 'sqld-sql-lab-026',
      group: 'sqld-2-2-g4-window-apps',
      dialogue: [
        { pose: 'wave', text: '마지막으로 [PIVOT]과 [UNPIVOT]을 볼게.' },
        { pose: 'think', text: '[PIVOT]은 행으로 길게 쌓인 값을 열로 펼치는 기능이야.' },
        { pose: 'lightbulb', text: '예를 들어 월별 매출 행을 1월, 2월, 3월 열로 펼쳐 보고서처럼 만들 수 있어.' },
        { pose: 'happy', text: '[UNPIVOT]은 반대야.\n넓게 펼쳐진 열들을 다시 행으로 길게 바꿔.' },
        { pose: 'think', text: 'PIVOT은 여러 행이 한 칸으로 모일 수 있어서 SUM, MAX 같은 집계 함수가 필요해.' },
        { pose: 'idle', text: '행 값을 열 방향으로 펼치는 기능은 무엇일까?' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'PIVOT은 행을 열로 펼쳐 보고서 모양을 만들고, UNPIVOT은 열을 다시 행으로 길게 바꿉니다. SQLD에서는 PIVOT이 집계 함수와 함께 쓰인다는 점을 특히 기억해야 합니다.',
        },
        {
          kind: 'table',
          title: 'PIVOT vs UNPIVOT',
          headers: ['기능', '방향', '기억 포인트'],
          rows: [
            ['PIVOT', '행 → 열', '집계 함수 필요'],
            ['UNPIVOT', '열 → 행', '넓은 표를 긴 표로 바꿈'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '처음에는 모양으로 기억',
          body:
            'PIVOT은 보고서처럼 가로로 펼치는 것, UNPIVOT은 다시 세로로 길게 쌓는 것입니다. “피벗 테이블”을 떠올리면 쉽습니다.',
        },
      ],
    },
    {
      id: 'sqld-2-2-s12',
      title: '정규표현식',
      quizId: 'sqld-2-2-cp-12',
      group: 'sqld-2-2-g5-regex',
      extraQuizIds: ['sqld-sql-lab-027'],
      dialogue: [
        { pose: 'wave', text: '[정규표현식(Regular Expression)]은 [패턴 매칭] 도구.' },
        { pose: 'think', text: '예: 이메일 검증·전화번호 검증·특정 형식 검색에 꼭 알아두면 좋아.' },
        { pose: 'lightbulb', text: '먼저 [기호] 뜻을 짧게 정리하자.' },
        { pose: 'happy', text: '[.]은 아무 문자 하나를 의미해.\na.c는 abc, aic처럼 가운데 한 글자가 있는 값을 찾을 수 있어.' },
        { pose: 'think', text: '[^]는 문자열의 시작을 뜻해.\n^010은 010으로 시작하는 값을 찾는 패턴이야.' },
        { pose: 'lightbulb', text: '[$]는 문자열의 끝을 뜻해.\ncom$은 com으로 끝나는 값을 찾는 패턴이야.' },
        { pose: 'happy', text: '[*]는 앞 문자가 0번 이상 반복된다는 뜻이야.\nho*는 h, ho, hoo 같은 값과 맞을 수 있어.' },
        { pose: 'think', text: '[+]는 앞 문자가 1번 이상 반복된다는 뜻이야.\nho+는 ho, hoo는 되지만 h 단독은 안 돼.' },
        { pose: 'lightbulb', text: '[?]는 앞 문자가 0번 또는 1번 나온다는 뜻이야.\nho?는 h 또는 ho까지만 맞아.' },
        { pose: 'happy', text: '헷갈리는 부분. [?] 와 [*] 헷갈리면 안 됨. [?] = 0 또는 1, [*] = 0 이상.' },
        { pose: 'think', text: '[[abc]]는 a, b, c 중 하나라는 뜻이야.\n[a-z]는 a부터 z까지 한 글자를 뜻해.' },
        { pose: 'lightbulb', text: '[[^abc]]는 a, b, c를 제외한 다른 문자 하나를 뜻해.' },
        { pose: 'happy', text: '[{n}]은 정확히 n번 반복, [{n,m}]은 n번부터 m번까지 반복이라는 뜻이야.' },
        { pose: 'think', text: 'Oracle 함수 [5종]: REGEXP_LIKE / REPLACE / INSTR / SUBSTR / COUNT.' },
        { pose: 'lightbulb', text: '[REGEXP_LIKE(s, p)]: 일치 여부 (TRUE/FALSE) — WHERE 절에 사용.' },
        { pose: 'happy', text: '[REGEXP_REPLACE]는 패턴에 맞는 부분을 바꾸고,\n[REGEXP_INSTR]은 패턴이 시작되는 위치를 알려줘.' },
        { pose: 'think', text: '[REGEXP_SUBSTR]은 패턴에 맞는 문자열을 뽑고,\n[REGEXP_COUNT]는 패턴이 몇 번 나오는지 세어줘.' },
        { pose: 'idle', text: '? 는 0 또는 1회. 1회 이상은 +.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '정규표현식은 SQL 안에서 복잡한 문자열 패턴을 검색·치환·추출하는 도구입니다. 기호가 어떤 반복과 범위를 뜻하는지, Oracle의 주요 함수가 어떤 역할을 하는지 나눠서 보면 됩니다. 한국어 한 음절은 한 문자 단위로 처리됩니다.',
        },
        {
          kind: 'table',
          title: '정규식 기호',
          headers: ['기호', '의미', '예시'],
          rows: [
            ['.', '임의의 한 문자', 'a.c → abc, aic'],
            ['^', '문자열 시작', '^010 → 010 시작'],
            ['$', '문자열 끝', 'com$ → com 으로 끝'],
            ['*', '앞 문자 0번 이상', 'ho* → h, ho, hoo'],
            ['+', '앞 문자 1번 이상', 'ho+ → ho, hoo (h X)'],
            ['?', '앞 문자 0 또는 1회', 'ho? → h, ho'],
            ['[abc]', 'a 또는 b 또는 c', '[a-z] → 소문자'],
            ['[^abc]', 'abc 제외', '—'],
            ['{n} / {n,m} / {n,}', 'n회 / n~m회 / n 이상', 'a{3} → aaa'],
            ['( )', '그룹', '(ab)+ → ab, abab'],
            ['|', 'OR', '^ab|cd$'],
            ['\\', '이스케이프', '\\. → 진짜 점(.)'],
          ],
        },
        {
          kind: 'table',
          title: 'Oracle 정규식 함수 5종',
          headers: ['함수', '용도', '예'],
          rows: [
            ['REGEXP_LIKE(s, p)', '일치 여부', "REGEXP_LIKE('hello123','^[a-z]+[0-9]+$') → TRUE"],
            ['REGEXP_REPLACE(s, p, r)', '치환', "REGEXP_REPLACE('010/1234','/','-')"],
            ['REGEXP_INSTR(s, p)', '시작 위치', "REGEXP_INSTR('abc123','[0-9]+') → 4"],
            ['REGEXP_SUBSTR(s, p)', '추출', "REGEXP_SUBSTR('abc123','[0-9]+') → 123"],
            ['REGEXP_COUNT(s, p)', '횟수', "REGEXP_COUNT('a1b2c3','[0-9]') → 3"],
          ],
        },
        {
          kind: 'example',
          title: '실 사례',
          body:
            "-- a 가 2~4번 반복되는 부분 추출\nREGEXP_SUBSTR('aaaaabbbb', 'a{2,4}') → 'aaaa' (greedy 매칭)\n\n-- 이메일 형식 검증\nREGEXP_LIKE(email, '^[A-Za-z0-9._]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')\n\n-- 점수가 mw 가 아니고 day 로 끝나는 요일\n^[^mw][[:lowercase:]]*[u]*day$  -- Sunday, Friday 매칭, Monday/Wednesday 제외",
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"별 0이상 / 더하기 1이상 / 물음표 0또는1"',
          body:
            '* (asterisk) = 0회 이상. + (plus) = 1회 이상. ? (question) = 0 또는 1회. 셋의 차이가 자주 헷갈리는 부분.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — ? 와 *',
          body:
            '"? = 0 회 이상" 보기는 [틀림]. ? 는 0 또는 1 회만. 0 이상은 *. 매칭 횟수의 정의를 정확히.',
        },
      ],
    },
  ],
};

const SQLD_2_3: Lesson = {
  id: 'sqld-2-3',
  subject: 'sqld',
  chapter: 2,
  chapterTitle: 'SQL 기본 및 활용',
  topic: '관리 구문',
  title: 'INSERT/UPDATE/DELETE · MERGE · TCL · DDL · 제약조건 · DCL',
  hook: '데이터를 바꾸고, 확정하고, 구조를 만들고, 권한을 주는 SQL을 차근차근 배워요.',
  estimatedMinutes: 14,
  steps: [
    {
      id: 'sqld-2-3-s1',
      title: 'DML이란',
      group: 'sqld-2-3-g1-dml',
      dialogue: [
        { pose: 'wave', text: '관리 구문에서 먼저 볼 것은 [DML]이야.' },
        { pose: 'think', text: '[DML]은 Data Manipulation Language의 약자야.\n한국어로는 데이터 조작어라고 불러.' },
        { pose: 'lightbulb', text: '말 그대로 테이블 안의 [데이터 자체]를 조회하고, 넣고, 고치고, 지우는 SQL 묶음이야.' },
        { pose: 'happy', text: '이번 흐름에서는 INSERT, UPDATE, DELETE를 하나씩 따로 볼 거야.\n먼저 전체 그림만 잡자.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'DML(Data Manipulation Language)은 테이블 안의 데이터를 직접 다루는 명령입니다. SELECT는 조회, INSERT는 새 행 추가, UPDATE는 기존 행 수정, DELETE는 행 삭제, MERGE는 있으면 수정하고 없으면 추가하는 흐름입니다.',
        },
        {
          kind: 'table',
          title: 'DML에서 먼저 볼 명령',
          headers: ['명령', '하는 일', '처음 볼 때 의미'],
          rows: [
            ['INSERT', '행 추가', '새 기록을 넣는다'],
            ['UPDATE', '행 수정', '이미 있는 값을 고친다'],
            ['DELETE', '행 삭제', '조건에 맞는 행을 지운다'],
            ['MERGE', '삽입+수정', '있으면 고치고 없으면 넣는다'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '먼저 이것만 잡기',
          body:
            'DML은 테이블 구조를 만드는 명령이 아니라, 이미 있는 테이블 안의 데이터를 움직이는 명령입니다. 테이블을 만들고 바꾸는 CREATE, ALTER, DROP은 DDL 쪽입니다.',
        },
      ],
    },
    {
      id: 'sqld-2-3-s1-insert',
      title: 'INSERT',
      quizId: 'sqld-2-3-cp-01',
      group: 'sqld-2-3-g1-dml',
      extraQuizIds: ['sqld-sql-lab-028'],
      dialogue: [
        { pose: 'wave', text: '이제 DML 중에서 [INSERT]부터 볼게.' },
        { pose: 'lightbulb', text: '[INSERT]는 테이블에 [새 행]을 추가하는 구문이야.' },
        { pose: 'happy', text: 'INSERT는 크게 두 가지 형태로 써.\n첫째, 모든 컬럼 값을 순서대로 넣는 방식.' },
        { pose: 'think', text: '예: INSERT INTO T VALUES (값1, 값2, ...)\n이때는 테이블 컬럼 순서와 값 순서를 정확히 맞춰야 해.' },
        { pose: 'happy', text: '둘째, 값을 넣을 컬럼 이름을 직접 적는 방식이야.' },
        { pose: 'think', text: '예: INSERT INTO T (col1, col3) VALUES (값1, 값3)\n필요한 컬럼만 골라 넣을 수 있어.' },
        { pose: 'lightbulb', text: '이때 적지 않은 컬럼은 보통 [NULL]이나 [DEFAULT]가 들어가.\n단, NOT NULL 컬럼을 빼먹으면 오류야.' },
        { pose: 'idle', text: 'NOT NULL 컬럼을 빼먹고 INSERT 하면 어떻게 될까?' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'INSERT는 테이블에 새 행을 추가하는 DML입니다. 모든 컬럼 값을 순서대로 넣을 수도 있고, 값을 넣을 컬럼 이름을 직접 적을 수도 있습니다.',
        },
        {
          kind: 'example',
          title: 'INSERT 두 가지 형태',
          body:
            "-- 1. 전체 컬럼 (순서 정확히 맞춰야)\nINSERT INTO 학생 VALUES (5, '길동', 23, 1);\n\n-- 2. 명시적 컬럼 (필요한 컬럼만)\nINSERT INTO 학생 (학번, 이름, 학년)\nVALUES (6, '선영', 1);",
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — 생략한 컬럼',
          body:
            '컬럼 목록을 적고 일부 컬럼을 생략하면, 그 컬럼에는 기본값이 있으면 DEFAULT, 없고 NULL 허용이면 NULL이 들어갑니다. 하지만 NOT NULL 컬럼을 생략하면 오류입니다.',
        },
      ],
    },
    {
      id: 'sqld-2-3-s1-update-delete',
      title: 'UPDATE와 DELETE',
      quizId: 'sqld-sql-lab-029',
      group: 'sqld-2-3-g1-dml',
      dialogue: [
        { pose: 'wave', text: '이번에는 [UPDATE]와 [DELETE]를 같이 볼게.' },
        { pose: 'happy', text: '[UPDATE]는 이미 있는 행의 값을 수정하는 구문이야.\nUPDATE T SET col = 값 WHERE 조건처럼 써.' },
        { pose: 'think', text: '여기서 [WHERE]는 “어떤 행만 고칠지” 정하는 부분이야.\nWHERE를 빼면 모든 행이 바뀔 수 있어.' },
        { pose: 'lightbulb', text: '[DELETE]는 행을 삭제하는 구문이야.\nDELETE FROM T WHERE 조건처럼 써.' },
        { pose: 'happy', text: 'DELETE도 WHERE가 없으면 전체 행을 지울 수 있어.\n그래서 UPDATE와 DELETE는 WHERE를 항상 먼저 확인해야 해.' },
        { pose: 'think', text: '다만 DELETE는 DML이라 트랜잭션 안에서 ROLLBACK으로 되돌릴 수 있어.' },
        { pose: 'lightbulb', text: '반대로 TRUNCATE는 전체 행을 비우지만 DDL이라 되돌릴 수 없어.\n이 차이는 뒤에서 다시 비교할 거야.' },
        { pose: 'idle', text: 'UPDATE나 DELETE에서 WHERE를 빼면 어떤 일이 생길까?' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'UPDATE는 이미 있는 행의 값을 고치고, DELETE는 행을 삭제하는 DML입니다. 둘 다 WHERE 절로 대상을 제한합니다. WHERE를 생략하면 전체 행이 대상이 될 수 있어 가장 위험한 부분입니다.',
        },
        {
          kind: 'example',
          title: 'UPDATE / DELETE',
          body:
            "-- UPDATE\nUPDATE 학생 SET 나이 = 20 WHERE 이름 = '선영';\n\n-- 모든 직원 급여 10% 인상\nUPDATE 직원 SET 급여 = 급여 * 1.1;\n\n-- 서브쿼리 활용 UPDATE\nUPDATE 직원 a\nSET 급여 = (SELECT AVG(급여) FROM 직원 b WHERE b.부서 = a.부서);\n\n-- DELETE\nDELETE FROM 학생 WHERE 학번 = 5;",
        },
        {
          kind: 'table',
          title: 'UPDATE와 DELETE 비교',
          headers: ['명령', '용도', 'WHERE 누락 시', 'ROLLBACK'],
          rows: [
            ['UPDATE', '행 수정', '전체 행 변경', '가능'],
            ['DELETE', '행 삭제', '전체 행 삭제', '가능'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — WHERE 생략',
          body:
            'UPDATE와 DELETE는 문법상 WHERE 없이도 실행될 수 있습니다. 그래서 “한 행만 바꾸려던 작업”이 전체 행 변경이나 전체 행 삭제로 이어질 수 있습니다.',
        },
      ],
    },
    {
      id: 'sqld-2-3-s2',
      title: 'MERGE',
      quizId: 'sqld-2-3-cp-02',
      group: 'sqld-2-3-g1-dml',
      extraQuizIds: ['sqld-sql-lab-030', 'sqld-sql-order-007'],
      dialogue: [
        { pose: 'wave', text: '이번에는 [MERGE]를 볼 거야.' },
        { pose: 'think', text: 'MERGE는 “있으면 고치고, 없으면 새로 넣는” 상황에서 쓰는 명령이야.' },
        { pose: 'lightbulb', text: '예를 들어 회원 정보를 매일 외부 시스템에서 받아온다고 해보자.' },
        { pose: 'happy', text: '이미 있는 회원이면 UPDATE로 최신 정보로 고치고,\n처음 보는 회원이면 INSERT로 새 행을 추가해야 해.' },
        { pose: 'think', text: '이 두 흐름을 한 번에 처리하는 SQL이 [MERGE]야.\n그래서 INSERT + UPDATE를 합친 느낌으로 보면 돼.' },
        { pose: 'happy', text: '기본 모양은\nMERGE INTO [대상]\nUSING [소스]\nON ([같은 행인지 찾는 조건]) 이야.' },
        { pose: 'think', text: '[WHEN MATCHED THEN UPDATE]는 ON 조건으로 같은 행을 찾았을 때 실행돼.' },
        { pose: 'lightbulb', text: '[WHEN NOT MATCHED THEN INSERT]는 같은 행을 찾지 못했을 때, 즉 신규 데이터일 때 실행돼.' },
        { pose: 'happy', text: '한 번의 SQL 안에서 처리되기 때문에 동기화 작업에서 자주 쓰이고, 트랜잭션 관리도 깔끔해져.' },
        { pose: 'think', text: 'ETL, 증분 동기화, 매시간 갱신 작업처럼 “기존 데이터와 새 데이터를 맞춰야 하는” 상황에서 자주 나와.' },
        { pose: 'lightbulb', text: 'Oracle에서는 WHEN MATCHED 절에서 조건에 따라 DELETE까지 처리하는 형태도 볼 수 있어.' },
        { pose: 'think', text: 'MERGE는 ON 조건으로 같은 행을 찾고, 있으면 UPDATE, 없으면 INSERT로 갈라진다고 보면 돼.' },
        { pose: 'idle', text: 'MATCHED 면? UPDATE. NOT MATCHED 면? INSERT.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'MERGE는 대상 테이블에 같은 데이터가 이미 있으면 UPDATE하고, 없으면 INSERT하는 명령입니다. “있으면 고치고, 없으면 추가한다”는 흐름이 핵심입니다. 외부 데이터와 내부 테이블을 맞추는 동기화 작업에서 자주 쓰입니다.',
        },
        {
          kind: 'example',
          title: '기본 MERGE — 학생 동기화',
          body:
            "MERGE INTO 학생 t                        -- 대상 테이블\nUSING 학생_최신 s                         -- 소스 테이블\nON (t.학번 = s.학번)                      -- 매칭 키\nWHEN MATCHED THEN                          -- 매칭 → UPDATE\n  UPDATE SET t.이름 = s.이름,\n             t.나이 = s.나이,\n             t.학년 = s.학년\nWHEN NOT MATCHED THEN                      -- 미매칭 → INSERT\n  INSERT (학번, 이름, 나이, 학년)\n  VALUES (s.학번, s.이름, s.나이, s.학년);",
        },
        {
          kind: 'table',
          title: 'MERGE 절 구성',
          headers: ['절', '역할'],
          rows: [
            ['MERGE INTO', '대상 테이블'],
            ['USING', '소스 (테이블 또는 서브쿼리)'],
            ['ON (조건)', '매칭 키'],
            ['WHEN MATCHED THEN UPDATE', '조건 만족 → 갱신'],
            ['WHEN NOT MATCHED THEN INSERT', '미매칭 → 삽입'],
            ['(Oracle) DELETE WHERE', 'UPDATE 후 조건 만족 시 삭제'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '실무 패턴 — ETL',
          body:
            '외부 시스템 → 임시 테이블 INSERT → MERGE 로 마스터 테이블 동기화. 한 트랜잭션이라 부분 실패 시 ROLLBACK 안전.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 — MATCHED 절 누락',
          body:
            'WHEN MATCHED 또는 WHEN NOT MATCHED 중 [하나만] 둬도 동작. 둘 다 빠지면 오류. ON 조건의 컬럼은 UPDATE 절에 두면 오류 (이미 키 매칭).',
        },
      ],
    },
    {
      id: 'sqld-2-3-s3',
      title: 'TCL',
      quizId: 'sqld-2-3-cp-03',
      group: 'sqld-2-3-g2-transaction',
      extraQuizIds: ['sqld-2-3-cp-03-savepoint-rollback', 'sqld-sql-lab-031'],
      dialogue: [
        { pose: 'wave', text: '이번에는 [TCL]을 볼 거야.' },
        { pose: 'think', text: 'TCL은 Transaction Control Language의 약자야.\n한국어로는 트랜잭션 제어어라고 보면 돼.' },
        { pose: 'lightbulb', text: '트랜잭션은 여러 SQL 작업을 하나의 묶음으로 보는 단위야.\n예를 들면 “돈 보내기”처럼 중간에 멈추면 안 되는 작업이지.' },
        { pose: 'happy', text: 'TCL은 그 묶음을 [확정할지], [되돌릴지], [중간 지점을 남길지] 정하는 명령이야.' },
        { pose: 'think', text: '대표 3가지는 [COMMIT]·[ROLLBACK]·[SAVEPOINT]야.' },
        { pose: 'lightbulb', text: '[COMMIT]은 지금까지의 변경사항을 영구 반영하는 명령이야.\nCOMMIT 뒤에는 보통 ROLLBACK으로 되돌릴 수 없어.' },
        { pose: 'happy', text: '[ROLLBACK]은 마지막 COMMIT 이후의 변경을 취소하고 되돌리는 명령이야.' },
        { pose: 'think', text: '[SAVEPOINT]는 트랜잭션 안에 중간 저장 지점을 찍는 명령이야.\n전체가 아니라 일부만 되돌릴 때 사용해.' },
        { pose: 'lightbulb', text: '예: SAVEPOINT SV1을 찍고 INSERT와 UPDATE를 했다면,\nROLLBACK TO SV1으로 SV1 이후 작업만 취소할 수 있어.' },
        { pose: 'happy', text: '그래서 SAVEPOINT 문제는 SQL을 위에서 아래로 따라가며 “지금 무엇이 남았는지” 보는 게 중요해.' },
        { pose: 'think', text: '헷갈리는 부분. [ROLLBACK TO SVx 후]에 [SVx 이후 만든 SAVEPOINT 들은 모두 사라짐].' },
        { pose: 'lightbulb', text: '헷갈리는 부분 2. [COMMIT 한 후엔 모든 SAVEPOINT 사라짐]. "COMMIT; ROLLBACK TO SVx;" → [오류].' },
        { pose: 'idle', text: 'COMMIT 후 ROLLBACK 할 수 있어? 할 수 없어.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'TCL(Transaction Control Language)은 트랜잭션을 제어하는 명령입니다. COMMIT은 변경을 확정하고, ROLLBACK은 변경을 취소하고, SAVEPOINT는 트랜잭션 안에 되돌아갈 수 있는 중간 지점을 만듭니다.',
        },
        {
          kind: 'table',
          title: 'TCL 3종',
          headers: ['명령', '의미', '효과'],
          rows: [
            ['COMMIT', '영구 반영', '이후 ROLLBACK 할 수 없음, 모든 SAVEPOINT 소멸'],
            ['ROLLBACK', '마지막 COMMIT 시점으로 되돌리기', '모든 변경 취소'],
            ['SAVEPOINT 이름', '부분 롤백 지점 표시', '이후 ROLLBACK TO 가능'],
            ['ROLLBACK TO SV', 'SV 시점으로 되돌리기', 'SV 이후 SAVEPOINT 도 함께 소멸'],
          ],
        },
        {
          kind: 'example',
          title: 'SAVEPOINT 시나리오 — 자주 나오는 패턴',
          body:
            "INSERT INTO T VALUES(1);\nINSERT INTO T VALUES(2);\nINSERT INTO T VALUES(3);\nSAVEPOINT SV1;          -- 시점: 1,2,3\nINSERT INTO T VALUES(4);\nINSERT INTO T VALUES(5);\nCOMMIT;                  -- 1~5 영구 반영, SV1 사라짐\nINSERT INTO T VALUES(6);\nROLLBACK TO SAVEPOINT SV1; -- 오류가 나. SV1 은 COMMIT 으로 사라짐\n\n-- 결과: 6건 (1,2,3,4,5,6) 모두 남음 (오류는 ROLLBACK TO 실행 X)",
        },
        {
          kind: 'example',
          title: '정상 SAVEPOINT 활용',
          body:
            "INSERT INTO T VALUES(1);\nINSERT INTO T VALUES(2);\nSAVEPOINT SV1;\nINSERT INTO T VALUES(3);\nSAVEPOINT SV2;\nINSERT INTO T VALUES(4);\nROLLBACK TO SV1;        -- 3, 4 취소\nCOMMIT;\n\n-- 결과: 1, 2 두 건만 남음",
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 1 — COMMIT 후 ROLLBACK',
          body:
            'COMMIT 한 트랜잭션은 ROLLBACK 으로 되돌릴 수 없음. 또한 COMMIT 시점에 모든 SAVEPOINT 가 사라지므로 이후의 ROLLBACK TO SVx 는 "SAVEPOINT not found" 오류.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 2 — ROLLBACK TO 후 SV 소멸',
          body:
            'ROLLBACK TO SV1 후 SV2 는 사라진 상태. ROLLBACK TO SV2 다시 시도 시 오류. SV1 자체는 유지되어 다시 ROLLBACK TO SV1 은 가능.',
        },
      ],
    },
    {
      id: 'sqld-2-3-s4',
      title: 'AUTOCOMMIT',
      quizId: 'sqld-2-3-cp-04',
      group: 'sqld-2-3-g2-transaction',
      extraQuizIds: ['sqld-sql-read-004'],
      dialogue: [
        { pose: 'wave', text: '이번에는 [AUTOCOMMIT]을 볼 거야.' },
        { pose: 'think', text: 'AUTOCOMMIT은 SQL을 실행할 때마다 자동으로 COMMIT할지 정하는 설정이야.' },
        { pose: 'lightbulb', text: '자동 COMMIT이 켜져 있으면 한 문장을 실행하자마자 바로 확정돼.\n꺼져 있으면 직접 COMMIT이나 ROLLBACK을 해야 해.' },
        { pose: 'happy', text: '중요한 점은 DBMS마다 기본 동작이 다르다는 거야.' },
        { pose: 'think', text: '[Oracle]은 DML의 AUTOCOMMIT이 기본적으로 OFF야.\n그래서 INSERT나 UPDATE 후 직접 COMMIT/ROLLBACK을 해야 해.' },
        { pose: 'lightbulb', text: '하지만 Oracle에서 DDL은 다르게 동작해.\nCREATE TABLE 같은 DDL은 실행되면 자동 COMMIT돼.' },
        { pose: 'happy', text: '[SQL Server]는 기본적으로 SQL 한 문장마다 자동 COMMIT되는 흐름으로 이해하면 쉬워.' },
        { pose: 'think', text: 'SQL Server에서 여러 작업을 하나로 묶고 싶다면 BEGIN TRAN으로 트랜잭션을 직접 시작해.' },
        { pose: 'lightbulb', text: '가장 헷갈리는 부분은 Oracle에서 DDL을 실행하면 직전 DML도 함께 COMMIT된다는 점이야.' },
        { pose: 'happy', text: '예: INSERT 후 CREATE TABLE을 실행하면,\n그 INSERT도 영구 반영돼서 ROLLBACK으로 되돌릴 수 없어.' },
        { pose: 'think', text: '그래서 Oracle에서 DDL은 트랜잭션을 끊어버리는 경계처럼 생각하면 돼.' },
        { pose: 'idle', text: 'Oracle DML 기본 AUTOCOMMIT? OFF.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'AUTOCOMMIT은 SQL 실행 후 자동으로 COMMIT할지 정하는 설정입니다. Oracle의 DML은 기본적으로 직접 COMMIT해야 하지만, Oracle의 DDL은 자동 COMMIT됩니다. 이 차이를 모르면 되돌릴 수 있다고 생각한 작업이 이미 영구 반영될 수 있습니다.',
        },
        {
          kind: 'table',
          title: 'AUTOCOMMIT 기본 동작',
          headers: ['DBMS', 'DML', 'DDL'],
          rows: [
            ['Oracle', '기본 OFF — 명시적 COMMIT/ROLLBACK 필요', '항상 자동 COMMIT (강제)'],
            ['SQL Server', '기본 ON — 매 SQL 자동 COMMIT', '설정에 따라'],
          ],
        },
        {
          kind: 'example',
          title: 'Oracle 트랜잭션 경계',
          body:
            "-- Oracle 에서:\nINSERT INTO T VALUES (1);    -- 트랜잭션 시작\nINSERT INTO T VALUES (2);\nCREATE TABLE T2 (...);        -- DDL → 자동 COMMIT (1, 2 도 영구 반영)\nROLLBACK;                     -- 효과 없음 — 이미 커밋됨\n\n-- 의도한 트랜잭션 처리:\nINSERT ...; INSERT ...;\nCOMMIT;  또는  ROLLBACK;       -- DDL 전에 명시적으로",
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '핵심 헷갈리는 부분 — DDL 의 자동 COMMIT 전염',
          body:
            'Oracle 의 DDL 은 그 직전·직후의 트랜잭션을 자동 COMMIT 시킴. INSERT 후 CREATE TABLE 을 실행하면 INSERT 도 함께 영구 반영. ROLLBACK 으로 되돌릴 수 없음.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'AUTOCOMMIT 모드 변경',
          body:
            'SQL Plus: SET AUTOCOMMIT ON; / OFF;. SQL Developer 도구·드라이버마다 다른 옵션 제공. 실무에선 명시적 BEGIN/COMMIT 으로 트랜잭션 관리 권장.',
        },
      ],
    },
    {
      id: 'sqld-2-3-s5',
      title: 'CREATE TABLE',
      quizId: 'sqld-2-3-cp-05',
      group: 'sqld-2-3-g3-ddl-constraints',
      extraQuizIds: ['sqld-sql-lab-034', 'sqld-sql-order-008'],
      dialogue: [
        { pose: 'wave', text: '[CREATE TABLE]은 DB 안에 새 표의 설계도를 만드는 명령이야.' },
        { pose: 'think', text: '표 이름, 컬럼 이름, 데이터 타입, 제약조건을 한 번에 정해.' },
        { pose: 'lightbulb', text: '처음에는 데이터 타입 4가지만 먼저 잡으면 돼.\nCHAR, VARCHAR2, NUMBER, DATE.' },
        { pose: 'happy', text: '[CHAR(n)]은 길이가 고정된 문자열 타입이야.\n남는 자리는 공백으로 채워져.' },
        { pose: 'think', text: '예: CHAR(10)에 "abc"를 저장하면 뒤에 공백이 붙어서 10칸을 맞춰.' },
        { pose: 'lightbulb', text: '[VARCHAR2(n)]는 길이가 변하는 문자열 타입이야.\n실제로 입력한 길이만큼 저장해.' },
        { pose: 'happy', text: '그래서 일반적인 이름, 주소, 설명 같은 텍스트는 VARCHAR2가 더 자연스러워.' },
        { pose: 'think', text: '[NUMBER]는 숫자를 저장하는 Oracle 타입이야.\n정수와 소수 모두 다룰 수 있어.' },
        { pose: 'lightbulb', text: '[DATE]는 날짜와 시간을 저장하는 타입이야.\nOracle DATE는 날짜뿐 아니라 시간도 함께 담을 수 있어.' },
        { pose: 'happy', text: '제약조건도 함께. [PRIMARY KEY], [NOT NULL], [UNIQUE], [CHECK], [FOREIGN KEY].' },
        { pose: 'think', text: '명명 규칙: [숫자로 시작 X], [예약어 X], [같은 테이블 컬럼명 중복 X].' },
        { pose: 'lightbulb', text: 'Oracle 객체명 길이는 [최대 30자]. (12c R2 부터 128자 할 수 있어)' },
        { pose: 'idle', text: '테이블명 1234_T 할 수 있어? 할 수 없어 (숫자 시작).' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'CREATE TABLE 은 가장 자주 쓰는 DDL 명령. 컬럼·데이터 타입·제약조건을 한 번에 정의. 컬럼 타입 선택은 저장 효율과 검색 성능에 영향을 미치므로 신중히.',
        },
        {
          kind: 'example',
          title: '종합 예시 — 학생 테이블',
          body:
            "CREATE TABLE 학생 (\n  학번      INT PRIMARY KEY,\n  이름      VARCHAR2(10) NOT NULL,\n  입학일    DATE,\n  주소      VARCHAR2(100) UNIQUE,\n  학과      VARCHAR2(10) NOT NULL,\n  성별      CHAR(1) NOT NULL CHECK (성별 IN ('M','F')),\n  FOREIGN KEY (학과) REFERENCES 학과리스트(학과)\n);",
        },
        {
          kind: 'table',
          title: '주요 데이터 타입',
          headers: ['타입', '의미', '특징'],
          rows: [
            ['CHAR(n)', '고정 길이 문자열', '남는 자리 공백 채움'],
            ['VARCHAR2(n)', '가변 길이 (Oracle)', '저장 효율 ↑'],
            ['VARCHAR(n)', '가변 길이 (표준)', 'SQL Server·MySQL'],
            ['NUMBER(p,s)', '숫자 (Oracle)', 'p=전체자리, s=소수자리'],
            ['INT / INTEGER', '정수', '4바이트'],
            ['FLOAT / DOUBLE', '실수', '부동소수점'],
            ['DATE', '날짜+시간', 'Oracle 은 초 단위'],
            ['TIMESTAMP', '나노초까지', '정밀 시간'],
          ],
        },
        {
          kind: 'keypoints',
          title: '제약조건 종류',
          items: [
            'PRIMARY KEY — 유일 + NOT NULL (테이블당 1개)',
            'NOT NULL — NULL 안 됨',
            'UNIQUE — 유일 (NULL 허용)',
            'CHECK — 도메인 제한 (예: 성별 IN (M,F))',
            'FOREIGN KEY — 다른 테이블 PK 참조',
            'DEFAULT — 미입력 시 기본값',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '명명 규칙',
          body:
            '(1) 숫자 시작 X (1234_T 안 됨) (2) 예약어 X (TABLE, FROM 등) (3) 같은 테이블 내 컬럼명 중복 X (4) Oracle 30자 이내 (12cR2+ 128자)',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'CHAR vs VARCHAR2',
          body:
            'CHAR 는 고정 길이라 비교가 빠름 (탐색 측면). VARCHAR2 는 저장 효율 우수. 거의 모든 일반 텍스트는 VARCHAR2. 우편번호·성별 등 항상 같은 길이만 CHAR.',
        },
      ],
    },
    {
      id: 'sqld-2-3-s6',
      title: 'ALTER · DROP · TRUNCATE',
      quizId: 'sqld-2-3-cp-06',
      group: 'sqld-2-3-g3-ddl-constraints',
      extraQuizIds: ['sqld-2-3-cp-06-ddl-delete-compare', 'sqld-sql-lab-032'],
      dialogue: [
        { pose: 'wave', text: '이번에는 테이블 구조를 바꾸거나 지우는 DDL 명령을 볼 거야.' },
        { pose: 'think', text: '[ALTER TABLE]은 이미 만들어진 테이블의 구조를 수정하는 명령이야.' },
        { pose: 'lightbulb', text: 'ALTER로 할 수 있는 대표 작업은 컬럼 추가, 컬럼 변경, 컬럼 삭제, 컬럼 이름 변경, 제약조건 추가야.' },
        { pose: 'happy', text: '[ADD]는 새 컬럼을 추가하는 구문이야.\n예: 학생 테이블에 이메일 컬럼을 새로 붙이는 느낌.' },
        { pose: 'think', text: '[MODIFY]는 기존 컬럼의 타입이나 크기를 바꾸는 구문이야.' },
        { pose: 'lightbulb', text: '다만 컬럼 크기를 줄일 때는 조심해야 해.\n이미 들어 있는 데이터가 새 크기보다 길면 줄일 수 없어.' },
        { pose: 'happy', text: '예: VARCHAR2(10)에 "1234567890"이 들어 있는데 VARCHAR2(5)로 줄이려 하면 거부돼.' },
        { pose: 'think', text: '[DROP COLUMN]은 컬럼 자체를 삭제하고,\n[RENAME COLUMN]은 컬럼 이름을 바꾸는 구문이야.' },
        { pose: 'lightbulb', text: '이제 삭제 명령 3종을 구분해보자.\nDELETE, TRUNCATE, DROP은 이름은 비슷해도 지우는 범위가 달라.' },
        { pose: 'happy', text: '[DELETE]는 행을 삭제하지만 테이블 구조는 그대로 두는 DML이야.\nWHERE를 쓸 수 있고 ROLLBACK도 가능해.' },
        { pose: 'think', text: '[TRUNCATE]는 테이블의 전체 행을 빠르게 비우는 DDL이야.\nWHERE를 쓸 수 없고 ROLLBACK도 할 수 없어.' },
        { pose: 'lightbulb', text: '[DROP TABLE]은 테이블 자체를 삭제하는 DDL이야.\n데이터뿐 아니라 구조까지 사라져.' },
        { pose: 'happy', text: '"WHERE 없는 DELETE = DROP"은 틀린 말이야.\nDELETE는 구조를 남기고, DROP은 구조까지 지워.' },
        { pose: 'think', text: '[CASCADE CONSTRAINTS]는 테이블을 지울 때 연결된 FK 제약도 함께 정리하겠다는 뜻이야.' },
        { pose: 'idle', text: '구조까지 삭제하는 건? DROP.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'ALTER는 이미 만든 테이블의 구조를 바꾸는 명령입니다. TRUNCATE는 테이블 구조는 남겨두고 행을 전부 비우는 명령이고, DROP은 테이블 자체를 삭제하는 명령입니다. DELETE까지 함께 비교하면 “행만 지우는가, 구조까지 지우는가, 되돌릴 수 있는가”가 핵심입니다.',
        },
        {
          kind: 'table',
          title: 'ALTER 명령 5가지',
          headers: ['명령', '예'],
          rows: [
            ['컬럼 추가', "ALTER TABLE 학생 ADD 학년 INT"],
            ['컬럼 변경', "ALTER TABLE 학생 MODIFY 이름 VARCHAR2(30)"],
            ['컬럼 삭제', "ALTER TABLE 학생 DROP COLUMN 주소"],
            ['컬럼 이름 변경', "ALTER TABLE 학생 RENAME COLUMN 학번 TO ID"],
            ['제약 추가', "ALTER TABLE T ADD CONSTRAINT pk_t PRIMARY KEY(id)"],
          ],
        },
        {
          kind: 'table',
          title: 'DELETE / TRUNCATE / DROP 비교',
          headers: ['명령', '분류', '구조', '데이터', 'WHERE', 'ROLLBACK'],
          rows: [
            ['DELETE', 'DML', '유지', '조건/전체', '가능', '가능'],
            ['TRUNCATE', 'DDL', '유지', '전체', '안 됨', '안 됨 (자동 COMMIT)'],
            ['DROP', 'DDL', '삭제', '삭제', '—', '안 됨 (자동 COMMIT)'],
          ],
        },
        {
          kind: 'example',
          title: 'DROP CASCADE',
          body:
            "-- 다른 테이블에서 학생 FK 참조 중\nDROP TABLE 학생;            -- 오류 (참조 무결성 위반)\nDROP TABLE 학생 CASCADE CONSTRAINTS;  -- FK 제약 함께 삭제 + 테이블 삭제\nDROP TABLE 학생 PURGE;        -- 휴지통(Recycle Bin) 거치지 않고 즉시 삭제",
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 1 — 컬럼 크기 축소',
          body:
            '기존 데이터가 새 크기를 초과하면 ALTER MODIFY 거부. NULL 만 들어있는 컬럼은 자유롭게 변경 가능. 미리 데이터 정리 후 변경.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 2 — DELETE = DROP?',
          body:
            '"WHERE 없는 DELETE 는 DROP TABLE 과 같다" 는 [틀림]. DELETE 는 구조 유지·ROLLBACK 가능, DROP 은 구조까지 삭제·ROLLBACK 할 수 없음.',
        },
      ],
    },
    {
      id: 'sqld-2-3-s7',
      title: '제약조건',
      quizId: 'sqld-2-3-cp-07',
      group: 'sqld-2-3-g3-ddl-constraints',
      extraQuizIds: ['sqld-2-3-cp-07-pk-unique-null', 'sqld-sql-lab-033'],
      dialogue: [
        { pose: 'wave', text: '제약조건은 이상한 데이터가 들어오지 못하게 막는 안전장치야.' },
        { pose: 'think', text: '[PRIMARY KEY(PK)]는 한 행을 식별하는 대표 키야.\n중복될 수 없고 NULL도 들어갈 수 없어.' },
        { pose: 'lightbulb', text: 'PK는 테이블당 하나만 만들 수 있어.\n단, (학번, 과목코드)처럼 여러 컬럼을 묶어 하나의 PK로 만들 수는 있어.' },
        { pose: 'happy', text: '[UNIQUE]는 값이 중복되지 않게 막는 제약조건이야.\nPK와 달리 테이블 안에 여러 개 만들 수 있고 NULL도 허용될 수 있어.' },
        { pose: 'think', text: '[NOT NULL]은 그 컬럼을 반드시 채우게 하는 제약조건이야.\n빈 값으로 둘 수 없다는 뜻이야.' },
        { pose: 'lightbulb', text: '[FOREIGN KEY(FK)]는 다른 테이블의 키를 참조하게 하는 제약조건이야.\n예를 들어 수강 테이블의 학번이 학생 테이블의 학번을 가리키는 식이야.' },
        { pose: 'happy', text: '[CHECK]는 값의 범위나 후보를 제한하는 제약조건이야.\n예: 성별은 M 또는 F만 허용.' },
        { pose: 'think', text: '[DEFAULT]는 값을 입력하지 않았을 때 자동으로 들어갈 기본값이야.' },
        { pose: 'lightbulb', text: '헷갈리는 부분. NOT NULL 추가 시 [기존 NULL 데이터 있으면 오류]. 미리 채운 후 추가.' },
        { pose: 'happy', text: '[CTAS]는 CREATE TABLE AS SELECT의 약자야.\nSELECT 결과로 새 테이블을 만드는 방식이야.' },
        { pose: 'think', text: 'CTAS는 기존 테이블의 구조와 데이터를 빠르게 복사할 수 있어.\n하지만 제약조건은 대부분 그대로 따라오지 않아.' },
        { pose: 'lightbulb', text: '꼭 기억할 점은 CTAS가 제약조건을 전부 복사하지 않는다는 거야.\n자동으로 따라오는 것은 주로 NOT NULL 정도로 보면 돼.' },
        { pose: 'happy', text: '[VIEW]는 실제 데이터를 따로 저장하지 않는 가상 테이블이야.\n복잡한 SELECT에 이름을 붙여 재사용하는 느낌으로 보면 돼.' },
        { pose: 'think', text: '뷰는 일부 컬럼만 보여줄 수 있어 보안에 좋고,\n복잡한 쿼리를 짧게 재사용할 수 있어.' },
        { pose: 'idle', text: 'PK 는 한 테이블에 몇 개? 1개.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '제약조건은 테이블에 잘못된 값이 들어오지 못하게 막는 규칙입니다. PK는 행을 식별하고, UNIQUE는 중복을 막고, NOT NULL은 빈 값을 막고, FK는 다른 테이블과의 연결을 지킵니다. CTAS와 VIEW는 제약조건 문제와 함께 자주 묶여 나오므로 같이 정리합니다.',
        },
        {
          kind: 'table',
          title: '제약조건 6종',
          headers: ['제약', '의미', 'NULL', '테이블당'],
          rows: [
            ['PRIMARY KEY (PK)', '유일 + NOT NULL', '안 됨', '1개'],
            ['UNIQUE (UK)', '유일', '허용', '여러 개'],
            ['NOT NULL', 'NULL 안 됨', '안 됨', '여러 개'],
            ['FOREIGN KEY (FK)', '참조 무결성', '허용 (관계 끊김)', '여러 개'],
            ['CHECK', '도메인 제한', '체크 통과면 가능', '여러 개'],
            ['DEFAULT', '기본값', '명시 시 NULL 가능', '여러 개'],
          ],
        },
        {
          kind: 'example',
          title: 'CTAS — 자동 복제 항목',
          body:
            "-- 데이터 + NOT NULL 만 복제\nCREATE TABLE EMP_BACKUP AS\nSELECT * FROM HR.EMPLOYEES;\n-- PK, FK, UNIQUE, CHECK, DEFAULT, INDEX 모두 별도 ALTER 로 추가 필요\n\n-- 구조만 복제 (데이터 X)\nCREATE TABLE EMP_BACKUP AS\nSELECT * FROM HR.EMPLOYEES WHERE 1=2;",
        },
        {
          kind: 'keypoints',
          title: '뷰(VIEW) 의 특성',
          items: [
            '실제 데이터를 저장하지 않는 가상 테이블',
            '보안성 — 일부 컬럼만 사용자에게 노출',
            '독립성 — 기반 테이블 구조 변경 영향 최소화',
            '편의성 — 복잡한 쿼리를 한 이름으로 재사용',
            '조회 속도가 본 테이블보다 빠르지는 않음 (매번 SELECT 실행)',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 1 — NOT NULL 추가',
          body:
            '기존 행에 NULL 이 있는 컬럼에 NOT NULL 제약 추가 시 오류. 먼저 UPDATE 로 NULL 을 채운 뒤 ALTER MODIFY ... NOT NULL.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 2 — CTAS 는 NOT NULL 만 복제',
          body:
            '"CTAS 가 PK·FK 등 모든 제약을 복제한다" 는 [틀림]. NOT NULL 과 컬럼 정의·데이터만 복제. 다른 제약·인덱스·트리거는 별도 추가.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '헷갈리는 부분 3 — VIEW 가 조회 속도를 빠르게?',
          body:
            '뷰는 매 실행 시 정의된 SELECT 가 실행되므로 본 테이블 조회와 비슷하거나 살짝 느릴 수도. 속도 개선은 머터리얼라이즈드 뷰(MV)·인덱스로.',
        },
      ],
    },
    {
      id: 'sqld-2-3-s8',
      title: 'DCL',
      quizId: 'sqld-2-3-cp-08',
      group: 'sqld-2-3-g4-dcl',
      extraQuizIds: ['sqld-sql-lab-035'],
      dialogue: [
        { pose: 'wave', text: '마지막으로 [DCL]을 볼 거야.' },
        { pose: 'think', text: 'DCL은 Data Control Language의 약자야.\n한국어로는 데이터 제어어라고 부르고, 주로 권한을 다뤄.' },
        { pose: 'lightbulb', text: 'DB에서는 아무나 모든 테이블을 보면 안 돼.\n누가 어떤 테이블을 조회하거나 수정할 수 있는지 정해야 해.' },
        { pose: 'happy', text: '[GRANT]는 권한을 주는 명령이고,\n[REVOKE]는 줬던 권한을 회수하는 명령이야.' },
        { pose: 'think', text: '권한은 크게 [객체 권한]과 [시스템 권한]으로 나눠.' },
        { pose: 'lightbulb', text: '[객체 권한]은 특정 테이블이나 뷰에 대한 권한이야.\n예: 학생 테이블을 SELECT할 수 있는 권한.' },
        { pose: 'happy', text: '[시스템 권한]은 DB 전체 수준의 권한이야.\n예: CREATE TABLE처럼 테이블을 만들 수 있는 권한.' },
        { pose: 'think', text: '기본 문법은 GRANT 권한 ON 객체 TO 사용자야.\n예: GRANT SELECT ON 학생 TO user1.' },
        { pose: 'lightbulb', text: '권한을 받은 사람이 다른 사람에게 다시 권한을 줄 수 있게 하는 옵션도 있어.' },
        { pose: 'happy', text: '[WITH GRANT OPTION]은 객체 권한을 다시 나눠줄 수 있게 하는 옵션이야.' },
        { pose: 'think', text: '이 경우 user1의 권한을 회수하면 user1이 user2에게 준 권한도 함께 회수돼.' },
        { pose: 'lightbulb', text: '[WITH ADMIN OPTION]은 시스템 권한을 다시 부여하거나 회수할 수 있게 하는 옵션이야.' },
        { pose: 'happy', text: '이 경우 user1의 권한을 회수해도 user1이 user2에게 준 권한은 그대로 남아.' },
        { pose: 'think', text: '핵심 차이는 회수할 때 줄줄이 같이 회수되는지야.\nGRANT OPTION은 연쇄 회수, ADMIN OPTION은 유지.' },
        { pose: 'idle', text: '시스템 권한 부여 옵션은? WITH ADMIN OPTION.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'DCL은 누가 어떤 데이터에 접근할 수 있는지 정하는 명령입니다. GRANT는 권한을 주고, REVOKE는 권한을 회수합니다. 헷갈리는 지점은 권한을 다시 나눠줄 수 있는 두 옵션의 차이입니다.',
        },
        {
          kind: 'example',
          title: '기본 권한 부여 / 회수',
          body:
            "-- 객체 권한 부여\nGRANT SELECT, INSERT ON 학생 TO user1;\n\n-- 권한 회수\nREVOKE INSERT ON 학생 FROM user1;\n\n-- 모든 권한\nGRANT ALL PRIVILEGES ON 학생 TO user1;\n\n-- ROLE 생성·부여 (권한 묶음)\nCREATE ROLE 학생_운영자;\nGRANT SELECT, INSERT, UPDATE ON 학생 TO 학생_운영자;\nGRANT 학생_운영자 TO user1;",
        },
        {
          kind: 'example',
          title: 'WITH GRANT/ADMIN OPTION',
          body:
            "-- 객체 권한 + GRANT OPTION\nGRANT SELECT ON 학생 TO user1 WITH GRANT OPTION;\n  -- user1 → user2 에게 SELECT 부여 가능\n  -- user1 권한 회수 시 user2 도 함께 회수\n\n-- 시스템 권한 + ADMIN OPTION\nGRANT CREATE TABLE TO user1 WITH ADMIN OPTION;\n  -- user1 → user2 에게 CREATE TABLE 부여 가능\n  -- user1 권한 회수해도 user2 권한은 유지",
        },
        {
          kind: 'table',
          title: '두 OPTION 차이',
          headers: ['옵션', '대상', '재부여', '연쇄 회수'],
          rows: [
            ['WITH GRANT OPTION', '객체 권한 (SELECT 등)', '가능', 'O — user1 회수 시 user2 도 회수'],
            ['WITH ADMIN OPTION', '시스템 권한 (CREATE 등)', '가능', 'X — user1 회수해도 user2 유지'],
          ],
        },
        {
          kind: 'keypoints',
          title: '주요 권한',
          items: [
            'SELECT — 조회',
            'INSERT — 삽입',
            'UPDATE — 수정',
            'DELETE — 삭제',
            'EXECUTE — 프로시저 실행',
            'ALL PRIVILEGES — 모든 권한',
            'CREATE TABLE / DROP USER — 시스템 권한',
            'DBA — 관리자 ROLE',
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"GRANT 객체 / ADMIN 시스템 / 연쇄 vs 유지"',
          body:
            'WITH GRANT OPTION = 객체 권한 + 연쇄 회수. WITH ADMIN OPTION = 시스템 권한 + 회수 무관. 두 차이를 묻는 매칭이 가장 자주 문제.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'ROLE 활용',
          body:
            '권한을 ROLE 로 묶어 사용자에게 부여하면 권한 관리가 단순. 부서별·역할별 ROLE 을 만들어 운영하는 게 표준 패턴.',
        },
      ],
    },
  ],
};

export const SQLD_CH2_LESSONS: Lesson[] = [
  SQLD_2_1,
  SQLD_2_2,
  SQLD_2_3,
];

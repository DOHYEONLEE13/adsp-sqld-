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
      title: 'SQL 4명령군 — DDL / DML / DCL / TCL',
      quizId: 'sqld-2-1-cp-01',
      dialogue: [
        { pose: 'wave', text: 'SQL 명령어들은 역할에 따라 [4가지 군]으로 분류돼! 시험 빈출!' },
        { pose: 'think', text: '① [DDL (Data Definition Language)]: 데이터의 [구조] 정의·변경.' },
        { pose: 'lightbulb', text: 'CREATE (생성), ALTER (변경), DROP (삭제), RENAME (이름 변경), TRUNCATE (행 전체 삭제)!' },
        { pose: 'happy', text: '② [DML (Data Manipulation Language)]: [데이터] 자체를 조작.' },
        { pose: 'think', text: 'SELECT (조회), INSERT (추가), UPDATE (수정), DELETE (삭제), MERGE (병합)!' },
        { pose: 'lightbulb', text: '③ [DCL (Data Control Language)]: [권한] 관리.' },
        { pose: 'happy', text: 'GRANT (권한 부여), REVOKE (권한 회수)!' },
        { pose: 'think', text: '④ [TCL (Transaction Control Language)]: [트랜잭션] 제어.' },
        { pose: 'lightbulb', text: 'COMMIT, ROLLBACK, SAVEPOINT!' },
        { pose: 'happy', text: '함정! [TRUNCATE]는 행을 삭제하지만 [DDL]이야! DDL이라 자동 COMMIT — ROLLBACK 불가!' },
        { pose: 'think', text: '"DROP 은 DML 인가?" 같은 함정 보기 자주 나와. DROP = DDL!' },
        { pose: 'lightbulb', text: '"INSERT 가 DCL?" — X. INSERT = DML!' },
        { pose: 'idle', text: '명령어와 군 매칭 — 1번 단골!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'SQL 의 명령어를 4가지 그룹으로 나누는 것은 시험 1번 단골 패턴입니다. 그룹별 키워드를 외우면 함정 보기를 쉽게 거를 수 있어요.',
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
          kind: 'section',
          title: 'SELECT 는 DQL 일까 DML 일까?',
          body:
            '엄격한 분류로는 SELECT 만 따로 DQL (Data Query Language) 로 부르기도 합니다. SQLD 시험에서는 DML 에 포함시키는 분류가 일반적이며, 보기에 DQL 이 있으면 SELECT 를 DQL 로 보기도 함.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 1 — TRUNCATE 분류',
          body:
            'TRUNCATE 는 "행 전체 삭제" 라 DML 처럼 느껴지지만 [DDL]. 자동 COMMIT, ROLLBACK 불가, UNDO 데이터 안 만들어 DELETE 보다 빠름.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 2 — DROP/INSERT 분류',
          body:
            'DROP = DDL (객체 삭제). INSERT = DML. "DROP 이 DML 인가요?" 보기는 항상 [틀림].',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"정·조·권·트"',
          body:
            'DDL=정의, DML=조작, DCL=권한, TCL=트랜잭션. 각 군의 한국어 첫 글자.',
        },
      ],
    },
    {
      id: 'sqld-2-1-s2',
      title: '관계대수 — SQL 의 수학적 뿌리',
      quizId: 'sqld-2-1-cp-02',
      dialogue: [
        { pose: 'wave', text: 'SQL 은 [관계대수(Relational Algebra)] 라는 수학에서 출발했어!' },
        { pose: 'think', text: '관계대수는 [집합 연산]을 [릴레이션(테이블)]에 적용하는 형식 이론!' },
        { pose: 'lightbulb', text: 'SQL 명령들은 결국 이 관계대수 연산을 풀어쓴 것! 시험에 기호 매칭 출제!' },
        { pose: 'happy', text: '[단항 연산자] 2개: [σ Selection] · [π Projection]!' },
        { pose: 'think', text: 'σ (시그마) = WHERE 와 같음. 조건 만족 [행]만 선택.' },
        { pose: 'lightbulb', text: 'π (파이) = SELECT 의 컬럼 지정과 같음. 특정 [열]만 추출.' },
        { pose: 'happy', text: '[이항 연산자] 4개: [∪ Union]·[∩ Intersect]·[− Difference]·[× Cartesian]!' },
        { pose: 'think', text: '∪ = 합집합, ∩ = 교집합, − = 차집합 (앞-뒤), × = 카티시안 곱 (모든 쌍)!' },
        { pose: 'lightbulb', text: '[조인 연산자] [⨝ (Bowtie)]: 공통 속성 기준으로 두 릴레이션 결합!' },
        { pose: 'happy', text: 'Cross Join 이 ×, Inner Join 이 ⨝, Selection 이 σ. 매칭 단골!' },
        { pose: 'idle', text: '"두 릴레이션의 모두 존재하는 튜플만" 은 어느 기호? ∩!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '관계대수는 1970 년 Codd 가 제안한 관계형 DB 의 수학적 기반. SQL 의 모든 연산은 결국 관계대수의 합성. 시험에는 "단항/이항/조인 연산자 매칭" 이 자주 등장합니다.',
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
      title: 'SELECT 실행 순서 — "FWGHSO" 프웨그하셀오',
      quizId: 'sqld-2-1-cp-03',
      dialogue: [
        { pose: 'wave', text: 'SQL 의 [작성 순서] 와 [실제 실행 순서] 가 달라! 가장 중요한 시험 포인트!' },
        { pose: 'think', text: '우리는 [SELECT] 부터 쓰지만 DB 엔진은 [FROM] 부터 처리!' },
        { pose: 'lightbulb', text: '실행 순서: [FROM] → [WHERE] → [GROUP BY] → [HAVING] → [SELECT] → [ORDER BY]!' },
        { pose: 'happy', text: '암기 [프·웨·그·하·셀·오 = FWGHSO]!' },
        { pose: 'think', text: '왜 이 순서가 중요? 각 절이 어디서 어떤 정보를 쓸 수 있는지가 결정돼!' },
        { pose: 'lightbulb', text: '예: WHERE 는 SELECT 보다 [먼저] 실행되니까 WHERE 에서 [SELECT 의 별칭(ALIAS)] 사용 [불가]!' },
        { pose: 'happy', text: '단! ORDER BY 는 SELECT 보다 [나중]이라 ALIAS·집계함수·컬럼 번호 모두 OK!' },
        { pose: 'think', text: 'WHERE = "[행] 단위 필터" / HAVING = "[그룹] 단위 필터" — 가장 자주 묻는 차이!' },
        { pose: 'lightbulb', text: 'WHERE 에 집계함수 [사용 불가] (실행 시점에 아직 그룹이 없음).' },
        { pose: 'happy', text: 'HAVING 에 집계함수 [사용 가능] (GROUP BY 후라 집계 결과가 있음).' },
        { pose: 'think', text: '"AVG(SAL) >= 5000 인 부서만" 은 HAVING 에! WHERE 에 쓰면 오류!' },
        { pose: 'idle', text: '실행 순서 1번 단골! 정확히 외우자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'SQL 의 작성 순서와 논리적 처리 순서는 다릅니다. 이 차이가 시험 1번 단골이며, 각 절이 다른 절의 결과를 어떻게 참조할 수 있는지를 결정합니다.',
        },
        {
          kind: 'table',
          title: '논리적 처리 순서 — "FWGHSO"',
          headers: ['#', '절', '하는 일', '집계함수'],
          rows: [
            ['1', 'FROM / JOIN', '대상 테이블 결정 + 결합', '—'],
            ['2', 'WHERE', '행 단위 필터', '사용 불가'],
            ['3', 'GROUP BY', '그룹화', '—'],
            ['4', 'HAVING', '그룹 단위 필터', '사용 가능'],
            ['5', 'SELECT', '컬럼 선택 + 별칭 부여', '사용 가능'],
            ['6', 'ORDER BY', '정렬', '사용 가능'],
          ],
        },
        {
          kind: 'example',
          title: '예시 — "부서별 평균 급여 ≥ 500만 인 부서만 평균급여 내림차순"',
          body:
            "SELECT 부서, AVG(급여) AS 평균  -- (5)\nFROM EMP                    -- (1)\nWHERE 입사년도 >= 2020      -- (2)\nGROUP BY 부서               -- (3)\nHAVING AVG(급여) >= 5000000 -- (4) 집계함수 OK\nORDER BY 평균 DESC;         -- (6) ALIAS OK",
        },
        {
          kind: 'keypoints',
          title: '실행 순서로부터 따라오는 규칙',
          items: [
            'WHERE 에 SELECT 의 ALIAS 사용 불가 (WHERE 가 먼저)',
            'WHERE 에 집계함수 사용 불가 (GROUP BY 가 나중)',
            'HAVING 은 집계함수 사용 가능 (GROUP BY 후)',
            'ORDER BY 는 ALIAS·집계함수·컬럼 번호 모두 OK',
            'SELECT 의 비집계 컬럼은 GROUP BY 에 모두 등장해야 함',
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"프웨그하셀오"',
          body:
            'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. 실행 순서를 외우면 8할은 풀린 것.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — WHERE 위치 + 집계함수',
          body:
            '"부서별 평균 급여 500만 이상" 을 WHERE AVG(SAL)>=5000 으로 쓰면 오류. 반드시 HAVING.',
        },
      ],
    },
    {
      id: 'sqld-2-1-s4',
      title: 'ALIAS · DISTINCT · 문자열 연결',
      quizId: 'sqld-2-1-cp-04',
      dialogue: [
        { pose: 'wave', text: '[ALIAS(별칭)]는 컬럼이나 테이블에 [임시 이름]을 부여하는 기능!' },
        { pose: 'think', text: '왜 필요? 결과 컬럼명을 한국어로 보고 싶거나, JOIN 시 같은 컬럼명을 구분해야 할 때!' },
        { pose: 'lightbulb', text: '문법: SELECT 사번 AS ID, 급여 AS 연봉 FROM 직원 emp.' },
        { pose: 'happy', text: '[AS] 키워드는 [생략 가능]! FROM 절의 테이블 별칭에도 가능 (단 Oracle 은 AS 사용 [불가] — 그냥 공백)!' },
        { pose: 'think', text: 'ALIAS 규칙: [숫자/특수문자/예약어 사용 불가]. 공백·특수문자 포함하려면 [큰따옴표 "..." 로 감싸기]!' },
        { pose: 'lightbulb', text: '예: SELECT 사번 AS "사 원 번 호" FROM 직원 — 공백 포함 별칭은 큰따옴표!' },
        { pose: 'happy', text: 'WHERE/GROUP BY/HAVING 에서는 SELECT 의 ALIAS [사용 불가]! 실행 순서 때문!' },
        { pose: 'think', text: 'ORDER BY 에서만 ALIAS 사용 가능 — SELECT 후에 실행되니까!' },
        { pose: 'lightbulb', text: '[DISTINCT]: 중복 행 제거. SELECT DISTINCT col1, col2 FROM T → 두 컬럼이 모두 같은 행만 중복으로 봄.' },
        { pose: 'happy', text: 'NULL 도 한 값으로 취급 — 모든 NULL 행은 하나로 합쳐짐!' },
        { pose: 'think', text: '문자열 연결: [Oracle ||] / [SQL Server +] / [표준 CONCAT()]!' },
        { pose: 'lightbulb', text: "예: SELECT 성 || ' ' || 이름 AS 전체이름 FROM 학생 (Oracle)." },
        { pose: 'idle', text: 'ALIAS 사용 불가 절은? WHERE/GROUP BY/HAVING!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'ALIAS·DISTINCT·문자열 연결은 SELECT 절의 가장 기본 도구. ALIAS 의 사용 가능 절(ORDER BY 만!) 과 DISTINCT 의 NULL 처리, Oracle vs SQL Server 의 문자열 연결 연산자 차이가 시험에 자주 등장.',
        },
        {
          kind: 'keypoints',
          title: 'ALIAS 5대 규칙',
          items: [
            'AS 생략 가능 (Oracle 의 FROM 절은 AS 못 씀)',
            '숫자·특수문자·예약어 X',
            '공백·특수문자 포함 시 "..." 큰따옴표',
            'WHERE/GROUP BY/HAVING 에서 사용 불가',
            'ORDER BY 에서만 사용 가능',
          ],
        },
        {
          kind: 'example',
          title: '활용 예',
          body:
            "SELECT 학번 AS ID,\n       성 || ' ' || 이름 AS 전체이름,  -- Oracle\n       급여 * 12 AS 연봉\nFROM 학생\nWHERE 학번 = 101\nORDER BY ID;  -- ALIAS OK",
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
          title: '함정 — ALIAS 위치 오류',
          body:
            'SELECT salary*12 AS 연봉 FROM emp WHERE 연봉 > 5000 — 오류! WHERE 가 SELECT 보다 먼저라 ALIAS 모름. WHERE salary*12 > 5000 으로 표현식 그대로 쓰거나 인라인뷰 활용.',
        },
      ],
    },
    {
      id: 'sqld-2-1-s5',
      title: '문자 함수 — SUBSTR / TRIM / REPLACE / INSTR',
      quizId: 'sqld-2-1-cp-05',
      dialogue: [
        { pose: 'wave', text: '문자 함수는 SQLD 시험·실무 모두 [필수]! 출제 비중 높음!' },
        { pose: 'think', text: '가장 자주 쓰는 [SUBSTR(s, p, len)] 부터!' },
        { pose: 'lightbulb', text: 'SUBSTR("abcdefgh", 1, 3) = "abc" — 1번째 위치부터 3글자!' },
        { pose: 'happy', text: 'SUBSTR("abcdefgh", 7) = "gh" — 7번째 위치부터 끝까지 (길이 생략 가능)!' },
        { pose: 'think', text: '시작 위치가 [음수]면 뒤에서부터! SUBSTR("abcdefgh", -2) = "gh" — 뒤에서 2번째부터!' },
        { pose: 'lightbulb', text: '함정! 길이가 [음수]면 Oracle은 [NULL] 반환! SUBSTR("abcdefgh", 8, -2) = NULL!' },
        { pose: 'happy', text: '[INSTR(s, sub)]: sub 가 [몇 번째 위치]에서 시작하는지! INSTR("abcdefgh", "g") = 7!' },
        { pose: 'think', text: 'INSTR + SUBSTR 콤보가 단골! 예: SUBSTR(s, INSTR(s,"@")+1) — @ 뒤 부분만!' },
        { pose: 'lightbulb', text: '[REPLACE(s, a, b)]: 모든 a 를 b 로 치환! REPLACE("abc","b","X") = "aXc"!' },
        { pose: 'happy', text: '[TRIM([c] FROM s)]: 양쪽 공백/지정 문자 제거! LTRIM·RTRIM 은 한쪽만!' },
        { pose: 'think', text: '[LENGTH(s)]: 문자열 [길이] (공백 포함)! LENGTH("abc def") = 7!' },
        { pose: 'lightbulb', text: '[LOWER/UPPER]: 소문자/대문자 변환!' },
        { pose: 'happy', text: '[ASCII(c)]: ASCII 코드 반환! ASCII("A") = 65!' },
        { pose: 'idle', text: 'SUBSTR("abcdefgh", -2) 결과는? gh!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '문자 함수는 출제 비중이 가장 높은 영역 중 하나. SUBSTR 의 음수 인자 동작이 함정 단골이며, INSTR 와 결합한 패턴이 자주 출제됩니다.',
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
          title: '함정 — SUBSTR 길이 음수 = NULL',
          body:
            "Oracle: SUBSTR('abcdefgh', 8, -2) = NULL. \"길이는 0 이상\" 이라는 규칙. 시험 단골 함정.",
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
      title: '숫자 / 날짜 / 변환 함수',
      quizId: 'sqld-2-1-cp-06',
      dialogue: [
        { pose: 'wave', text: '문자 함수 다음은 [숫자]·[날짜]·[변환] 함수! 짧지만 함정 많음!' },
        { pose: 'think', text: '[ABS(n)]: 절댓값. ABS(-3)=3, ABS(-10.4)=10.4!' },
        { pose: 'lightbulb', text: '[MOD(a, b)]: a 를 b 로 나눈 [나머지]. MOD(10,2)=0, MOD(11,3)=2!' },
        { pose: 'happy', text: '[ROUND(n, d)]: d 자리 아래에서 [반올림]. ROUND(15.58,1)=15.6!' },
        { pose: 'think', text: '함정! ROUND(15.58, -1) = [20]! 음수 자릿수는 [정수 자리]에서 반올림!' },
        { pose: 'lightbulb', text: '[TRUNC(n, d)]: d 자리 아래 [버림]. TRUNC(15.58,1)=15.5, TRUNC(15.58,-1)=10!' },
        { pose: 'happy', text: '[FLOOR(n)]: 내림 정수. [CEIL(n)]: 올림 정수. FLOOR(3.58)=3, CEIL(3.58)=4!' },
        { pose: 'think', text: '[SIGN(n)]: 양수 1, 음수 -1, 0 은 0. 부호 판별!' },
        { pose: 'lightbulb', text: '[POWER(n, k)]: n 의 k 제곱. POWER(2,3)=8!' },
        { pose: 'happy', text: '[날짜] 함수: [SYSDATE] (Oracle) / [GETDATE()] (SQL Server)!' },
        { pose: 'think', text: '[변환] 3종: [TO_NUMBER] (문자→숫자) / [TO_CHAR] (숫자·날짜→문자) / [TO_DATE] (문자→날짜)!' },
        { pose: 'lightbulb', text: "TO_CHAR(SYSDATE, 'YYYY-MM-DD') = '2026-04-27' 같이 [형식 지정]!" },
        { pose: 'happy', text: 'TRUNC(SYSDATE) 는 시간을 잘라 [자정] 으로! 날짜 비교에 유용!' },
        { pose: 'idle', text: 'ROUND(15.58, -1) = ?' },
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
          title: '함정 — ROUND/TRUNC 음수 자릿수',
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
      title: '집계 함수 + NULL 처리 함정',
      quizId: 'sqld-2-1-cp-07',
      dialogue: [
        { pose: 'wave', text: '[집계 함수(Aggregate Function)]는 [여러 행을 하나의 값으로 요약]!' },
        { pose: 'think', text: '5대 집계함수: COUNT·SUM·AVG·MIN·MAX!' },
        { pose: 'lightbulb', text: 'NULL 처리가 핵심! [SUM/AVG/MIN/MAX/COUNT(컬럼)] 은 NULL 행을 [무시]!' },
        { pose: 'happy', text: '단, [COUNT(*) / COUNT(1) / COUNT(0)] 는 NULL 행도 [포함]해서 셈!' },
        { pose: 'think', text: '왜? COUNT(*) 는 "행 자체" 를 세는데, COUNT(컬럼) 은 "그 컬럼 값이 NOT NULL 인 행" 만 셈!' },
        { pose: 'lightbulb', text: '함정: 행 0개일 때! WHERE 1=2 같이 절대 만족 못 하는 조건이면?' },
        { pose: 'happy', text: 'COUNT(*) = [0]! (NOT NULL!) 하지만 SUM/AVG/MIN/MAX 는 [NULL]!' },
        { pose: 'think', text: '그래서 NVL(COUNT(*), 9999) WHERE 1=2 = NVL(0, 9999) = [0]! 9999 가 아님!' },
        { pose: 'lightbulb', text: '반면 NVL(SUM(col), 9999) WHERE 1=2 = NVL(NULL, 9999) = [9999]!' },
        { pose: 'happy', text: 'AVG 도 함정! AVG(col) 은 NULL 행을 [분모에서 제외]!' },
        { pose: 'think', text: 'AVG(NVL(col, 0)) 은 NULL → 0 으로 만들어 분모에 [포함]시킴 → 결과 다름!' },
        { pose: 'lightbulb', text: '집계함수는 [WHERE 절에 사용 불가]! HAVING 에서만!' },
        { pose: 'idle', text: 'WHERE 1=2 일 때 NVL(COUNT(*), 9999) = ?' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '집계함수의 NULL 처리는 SQLD 시험에서 가장 까다로운 함정 영역. COUNT(*) 와 COUNT(컬럼) 의 NULL 처리 차이, 행 0개 시 반환값 차이가 단골.',
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
          title: '함정 시나리오',
          body:
            "-- 행 0개 (1=2 항상 거짓)\nSELECT NVL(COUNT(*), 9999) FROM TAB WHERE 1=2;\n→ 0 (COUNT(*) = 0, NULL 아님)\n\nSELECT NVL(SUM(col), 9999) FROM TAB WHERE 1=2;\n→ 9999 (SUM = NULL, NVL 적용)\n\n-- AVG NULL 처리 차이\n점수 = (90, 80, NULL, NULL, 70)\nAVG(점수) = (90+80+70)/3 = 80\nAVG(NVL(점수,0)) = (90+80+0+0+70)/5 = 48",
        },
        {
          kind: 'keypoints',
          title: '집계함수 4대 규칙',
          items: [
            'WHERE 절 사용 불가 (HAVING 만)',
            'GROUP BY 와 함께 그룹별 집계',
            'GROUP BY 없이 단독 — 전체 1그룹 집계',
            'NULL 무시 (COUNT(*) 만 예외)',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — COUNT(*) vs COUNT(컬럼)',
          body:
            'COUNT(*) = 모든 행 (NULL 포함). COUNT(컬럼) = 그 컬럼이 NOT NULL 인 행. 시험에 둘의 차이를 묻는 보기 단골.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '함정 — AVG vs AVG(NVL)',
          body:
            'AVG(col) 의 분모는 NOT NULL 행 수. AVG(NVL(col, 0)) 의 분모는 전체 행 수. 의도가 다른 두 표현.',
        },
      ],
    },
    {
      id: 'sqld-2-1-s8',
      title: 'NULL 처리 함수 4종 — NVL / NVL2 / NULLIF / COALESCE',
      quizId: 'sqld-2-1-cp-08',
      dialogue: [
        { pose: 'wave', text: 'NULL 을 [다른 값으로 치환]하는 함수 [4가지]! 한 번에 정리!' },
        { pose: 'think', text: '① [NVL(c, repl)]: c 가 [NULL 이면 repl], 아니면 c!' },
        { pose: 'lightbulb', text: '예: NVL(전화번호, "미등록") — 전화번호가 NULL 인 행에 "미등록" 표시!' },
        { pose: 'happy', text: '② [NVL2(c, x, y)]: c 가 [NOT NULL → x], [NULL → y]!' },
        { pose: 'think', text: '예: NVL2(보너스, "있음", "없음") — 보너스 컬럼 유무에 따라 분기!' },
        { pose: 'lightbulb', text: '③ [NULLIF(a, b)]: a 와 b 가 [같으면 NULL], 다르면 a!' },
        { pose: 'happy', text: '예: NULLIF(점수, 0) — 점수 0 을 NULL 로 (분모로 쓸 때 0 나누기 방지)!' },
        { pose: 'think', text: '④ [COALESCE(a, b, c, ...)]: 인자 중 [첫 번째 NOT NULL] 값 반환!' },
        { pose: 'lightbulb', text: '예: COALESCE(휴대폰, 집전화, 이메일) — 연락 가능한 첫 수단!' },
        { pose: 'happy', text: 'COALESCE 는 [표준 SQL], NVL 은 [Oracle 전용]! 호환성 ↑ 코드는 COALESCE.' },
        { pose: 'think', text: '동치 변환: NVL(c, 0) ≡ COALESCE(c, 0) ≡ CASE WHEN c IS NULL THEN 0 ELSE c END!' },
        { pose: 'lightbulb', text: 'DECODE(c, NULL, 0, c) 도 같은 의미 — DECODE 는 NULL 비교 가능!' },
        { pose: 'idle', text: 'COALESCE(NULL, NULL, "S", NULL, "QL") = ?' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'NULL 처리 함수는 4가지가 있고 각각의 동작이 미묘하게 달라 시험 단골입니다. 같은 결과를 여러 함수로 만들 수 있어 "결과가 같은 표현 찾기" 같은 매칭이 자주 출제.',
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
          title: '함정 — Simple CASE WHEN NULL',
          body:
            "CASE col WHEN NULL THEN -1 ELSE 0 END 은 동작 X (= NULL 비교는 UNKNOWN). NULL 분기는 Searched CASE 또는 DECODE.",
        },
      ],
    },
    {
      id: 'sqld-2-1-s9',
      title: 'CASE / DECODE — 조건 분기',
      quizId: 'sqld-2-1-cp-09',
      dialogue: [
        { pose: 'wave', text: '[CASE]와 [DECODE]는 SQL 의 [if-else]! 조건 분기를 SQL 안에서 처리!' },
        { pose: 'think', text: 'CASE 는 [2가지 형태]: [Searched CASE] (조건절) / [Simple CASE] (값 매칭)!' },
        { pose: 'lightbulb', text: '[Searched CASE]: CASE WHEN 조건1 THEN A WHEN 조건2 THEN B ELSE C END!' },
        { pose: 'happy', text: '예: CASE WHEN 점수>=90 THEN "A" WHEN 점수>=80 THEN "B" ELSE "F" END!' },
        { pose: 'think', text: '[Simple CASE]: CASE 컬럼 WHEN 값1 THEN A WHEN 값2 THEN B ELSE C END!' },
        { pose: 'lightbulb', text: '예: CASE 코드 WHEN "01" THEN "서울" WHEN "02" THEN "부산" ELSE "기타" END!' },
        { pose: 'happy', text: '[DECODE] 는 Oracle 전용! DECODE(컬럼, 값1, 반환1, 값2, 반환2, ..., 디폴트)!' },
        { pose: 'think', text: '[Simple CASE 와 DECODE 거의 동일]! 단 한 가지 [큰 차이]!' },
        { pose: 'lightbulb', text: 'DECODE 는 [NULL 비교가 가능]! DECODE(c, NULL, "널값", c) — 정상 동작!' },
        { pose: 'happy', text: '하지만 Simple CASE 는 [WHEN NULL THEN ... 은 작동 X]! = NULL 비교가 항상 UNKNOWN!' },
        { pose: 'think', text: '함정! "CASE col WHEN NULL THEN -1 ELSE 0 END" 결과는 항상 [0]! NULL 분기 안 됨!' },
        { pose: 'lightbulb', text: 'NULL 분기는 [Searched CASE WHEN col IS NULL THEN -1] 또는 [DECODE] 로!' },
        { pose: 'idle', text: '결과가 다른 것 찾기 — Simple CASE WHEN NULL!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'CASE 와 DECODE 는 SQL 안에서 조건 분기를 가능케 합니다. CASE 는 표준 SQL, DECODE 는 Oracle 전용. 둘 다 SELECT·WHERE·ORDER BY·HAVING 모든 절에서 사용 가능.',
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
            ['NULL 비교', '불가 (= NULL → UNKNOWN)', '가능 (= NULL → TRUE)'],
            ['조건', '값 매칭만', '값 매칭만'],
            ['Searched 형태', '있음 (WHEN 조건)', '없음 (값 매칭만)'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — Simple CASE WHEN NULL',
          body:
            "'CASE col WHEN NULL THEN -1 ELSE 0 END' 은 col = NULL 비교라 항상 UNKNOWN → ELSE 적중. NULL 분기는 Searched CASE 또는 DECODE.",
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '동치 변환',
          body:
            'NVL(c, 0) ≡ COALESCE(c, 0) ≡ CASE WHEN c IS NULL THEN 0 ELSE c END ≡ DECODE(c, NULL, 0, c). 시험에 결과 같은 표현 매칭이 단골.',
        },
      ],
    },
    {
      id: 'sqld-2-1-s10',
      title: 'WHERE 절 — 비교 / 조건 / LIKE / NULL / 우선순위',
      quizId: 'sqld-2-1-cp-10',
      dialogue: [
        { pose: 'wave', text: 'WHERE 절은 [행 단위 필터]! 조건에 맞는 튜플(행)만 통과!' },
        { pose: 'think', text: '연산자가 많아 정리 필요!' },
        { pose: 'lightbulb', text: '[비교]: = (같다), != / <> / ^= (다르다), >, <, >=, <=!' },
        { pose: 'happy', text: '[조건 결합]: AND (모두 만족), OR (하나라도), NOT (부정)!' },
        { pose: 'think', text: '[범위·집합]: BETWEEN A AND B (A 이상 B 이하), IN (a,b,c) (목록 중 하나)!' },
        { pose: 'lightbulb', text: '[NULL 비교]: 반드시 [IS NULL] / [IS NOT NULL]! = NULL 은 항상 UNKNOWN!' },
        { pose: 'happy', text: '[LIKE 와일드카드]: [%] = 0개 이상 모든 문자, [_] = 정확히 1개 문자!' },
        { pose: 'think', text: '예: LIKE "김%" → 김씨 시작. LIKE "_im" → 3글자, 끝이 "im". LIKE "%@%.%" → 이메일.' },
        { pose: 'lightbulb', text: '특수 문자 자체 검색: ESCAPE 절! LIKE "%/_라면" ESCAPE "/" → "_라면" 으로 끝.' },
        { pose: 'happy', text: '[우선순위] (높음 → 낮음): 괄호 → 산술(*) → 비교 → NOT → AND → OR!' },
        { pose: 'think', text: '함정! col IN (1, NULL) 에서 NULL 비교는 UNKNOWN → col=1 인 행만! NULL 행은 무시!' },
        { pose: 'lightbulb', text: '더 무서운 함정! [NOT IN] 에 NULL 섞이면 [전체가 UNKNOWN] → [0행 반환]!' },
        { pose: 'happy', text: '안전한 패턴: NOT EXISTS 사용 또는 WHERE col IS NOT NULL 추가!' },
        { pose: 'idle', text: 'NOT IN + NULL = ?행!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'WHERE 절은 행 단위 필터로 결과 집합을 좁힙니다. 다양한 연산자가 있고, NULL 처리·우선순위·LIKE 와일드카드가 시험 빈출. 연산자 우선순위를 모르면 의도와 다른 결과가 나옵니다.',
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
          title: '함정 1 — IN/NOT IN + NULL',
          body:
            "col IN (1, NULL) → col=1 인 행만 (NULL 무시). col NOT IN (1, NULL) → 0행 (NULL UNKNOWN 으로 모두 거름). 안전한 NOT IN 은 NULL 미포함 보장 + NOT EXISTS.",
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 2 — NOT (col=1 OR col=NULL)',
          body:
            "NOT (col=1 OR col=NULL) = NOT (col=1 OR UNKNOWN) = NOT UNKNOWN (또는 NOT TRUE) → 다소 복잡. NULL 인 행은 결과에서 빠짐.",
        },
      ],
    },
    {
      id: 'sqld-2-1-s11',
      title: 'GROUP BY · HAVING — 그룹화와 그룹 필터',
      quizId: 'sqld-2-1-cp-11',
      dialogue: [
        { pose: 'wave', text: '[GROUP BY]는 [같은 값을 가진 행을 묶어 한 줄로 요약]!' },
        { pose: 'think', text: '예: 부서별 평균급여 — GROUP BY 부서 후 AVG(급여) 계산. 부서마다 한 줄!' },
        { pose: 'lightbulb', text: '[HAVING]은 [그룹화된 결과에 대한 조건]! WHERE 와 다름!' },
        { pose: 'happy', text: '[WHERE = 행 필터] (그룹화 전), [HAVING = 그룹 필터] (그룹화 후)!' },
        { pose: 'think', text: '왜 둘이 다른가? 실행 순서 [FROM → WHERE → GROUP BY → HAVING]!' },
        { pose: 'lightbulb', text: 'WHERE 는 GROUP BY 보다 먼저라 집계함수를 [모름] → 사용 불가!' },
        { pose: 'happy', text: 'HAVING 은 GROUP BY 후라 집계함수 [사용 가능]!' },
        { pose: 'think', text: '"부서별 평균급여 500만 이상" 은 HAVING AVG(급여) >= 5000000!' },
        { pose: 'lightbulb', text: '함정! WHERE AVG(급여) >= 5000000 같이 쓰면 [오류]! 단골 함정!' },
        { pose: 'happy', text: '핵심 규칙: SELECT 의 [비집계 컬럼]은 [모두 GROUP BY 에 등장해야 함]!' },
        { pose: 'think', text: '예: SELECT 부서, COUNT(*) FROM EMP — GROUP BY 부서 없이 쓰면 [오류]!' },
        { pose: 'lightbulb', text: '성능 팁: WHERE 로 먼저 행을 줄인 뒤 GROUP BY 가 빠름! GROUP BY 가 비싼 작업이라!' },
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
            ['집계함수', '사용 불가', '사용 가능'],
            ['단독 사용', '가능', '가능 (전체 1그룹)'],
          ],
        },
        {
          kind: 'keypoints',
          title: '핵심 규칙',
          items: [
            'SELECT 의 비집계 컬럼은 GROUP BY 에 모두 등장해야 함',
            '집계함수는 WHERE 에 사용 불가 — HAVING 에서만',
            'WHERE 로 먼저 거른 뒤 GROUP BY 가 성능상 유리',
            'GROUP BY 없이 집계함수만 = 전체 집합 1그룹 집계',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 1 — 집계 + 일반 컬럼 혼합',
          body:
            "SELECT 부서, COUNT(*) FROM EMP — 오류! 부서가 GROUP BY 에 없어 \"어느 부서?\" 결정 불가. SELECT 부서, COUNT(*) FROM EMP GROUP BY 부서 로 수정.",
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 2 — 집계함수 위치',
          body:
            "WHERE AVG(급여) >= 5000000 → 오류. WHERE 는 행 단위, AVG 가 그룹별이라 모순. 그룹 조건은 HAVING.",
        },
      ],
    },
    {
      id: 'sqld-2-1-s12',
      title: 'ORDER BY — 정렬 + NULL 처리',
      quizId: 'sqld-2-1-cp-12',
      dialogue: [
        { pose: 'wave', text: 'ORDER BY 는 결과의 [최종 정렬]! SELECT 의 가장 마지막 절!' },
        { pose: 'think', text: '[ASC] = 오름차순 (기본·생략 가능). [DESC] = 내림차순!' },
        { pose: 'lightbulb', text: '여러 컬럼 정렬: ORDER BY 컬럼1 DESC, 컬럼2 ASC — 컬럼1 우선, 같으면 컬럼2!' },
        { pose: 'happy', text: 'ORDER BY 는 [SELECT 후 실행]이라 [ALIAS] · [컬럼 번호] · [집계함수] 모두 사용 가능!' },
        { pose: 'think', text: '예: ORDER BY 평균 DESC (ALIAS), ORDER BY 2 DESC (2번째 컬럼), ORDER BY AVG(급여) DESC.' },
        { pose: 'lightbulb', text: '데이터 형에 따른 정렬 — 숫자: 작은→큰, 문자: 사전순, 날짜: 과거→미래!' },
        { pose: 'happy', text: '[NULL 정렬] 단골 함정! [Oracle] 은 NULL 을 [최댓값] 취급!' },
        { pose: 'think', text: 'Oracle ASC 시 NULL = [맨 끝(NULLS LAST)]. DESC 시 NULL = [맨 앞(NULLS FIRST)].' },
        { pose: 'lightbulb', text: '[SQL Server] 는 정반대! NULL 을 [최솟값] 취급! ASC = NULLS FIRST.' },
        { pose: 'happy', text: '제어: ORDER BY col DESC NULLS LAST 처럼 [명시] 가능 (Oracle)!' },
        { pose: 'think', text: 'ORDER BY 가 빠지면 결과 순서는 [보장 X]! TOP N·LIMIT 와 결합 시 반드시 명시!' },
        { pose: 'idle', text: 'Oracle 에서 ORDER BY DESC 시 NULL 은? 맨 앞!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'ORDER BY 는 결과를 정렬하는 마지막 단계. SELECT 후 실행되어 ALIAS·집계함수·컬럼 번호 모두 사용 가능. NULL 정렬이 DBMS 별로 다른 점이 시험 단골 함정.',
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
            'ALIAS, 컬럼 번호 (1, 2, 3...), 집계함수, 표현식 모두 사용 가능. 단 컬럼 번호 사용은 가독성 ↓ 권장 X.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — DESC 누락',
          body:
            "\"매출 높은 순으로\" 같은 요구에 DESC 가 없으면 ASC 가 기본이라 결과가 반대. 시험에 'DESC 가 빠진 부분 찾기' 패턴 단골.",
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
  hook: '쿼리를 짜는 진짜 무기. 출제 비중이 가장 높은 영역.',
  estimatedMinutes: 22,
  steps: [
    {
      id: 'sqld-2-2-s1',
      title: 'JOIN 4종 — INNER / LEFT / RIGHT / FULL OUTER',
      quizId: 'sqld-2-2-cp-01',
      dialogue: [
        { pose: 'wave', text: '[JOIN]은 [여러 테이블을 한 결과로 묶는 가장 강력한 도구]! 시험 빈출 1순위!' },
        { pose: 'think', text: 'JOIN 종류 [4가지]: [INNER] · [LEFT OUTER] · [RIGHT OUTER] · [FULL OUTER]!' },
        { pose: 'lightbulb', text: '[INNER JOIN]: 양쪽 테이블에 [매칭되는 행만] 결과로! 가장 기본!' },
        { pose: 'happy', text: '예: 사원 ↔ 부서 INNER JOIN — 부서가 매칭되는 사원만 표시!' },
        { pose: 'think', text: '[LEFT OUTER JOIN]: [왼쪽] 테이블의 모든 행 + 매칭된 오른쪽! 매칭 없으면 NULL!' },
        { pose: 'lightbulb', text: '예: 부서 LEFT JOIN 사원 → 사원이 한 명도 없는 부서까지 결과에 포함!' },
        { pose: 'happy', text: '[RIGHT OUTER JOIN]: 반대! 오른쪽 모든 행 + 매칭된 왼쪽!' },
        { pose: 'think', text: '[FULL OUTER JOIN]: [양쪽 모두 보존]! LEFT ∪ RIGHT! 매칭 없는 쪽은 NULL!' },
        { pose: 'lightbulb', text: 'JOIN 단독 작성 = [INNER JOIN] 의미!' },
        { pose: 'happy', text: '실생활: "사원이 한 명도 없는 부서도 보고 싶다" → LEFT (부서 왼쪽).' },
        { pose: 'think', text: '"부서 정보 없는 사원도 보고 싶다" → LEFT (사원 왼쪽) 또는 RIGHT (부서 오른쪽).' },
        { pose: 'lightbulb', text: '시험 단골: 4종 JOIN 행 수 합 계산! INNER + LEFT + RIGHT + FULL 의 합!' },
        { pose: 'idle', text: '부서 없는 사원까지 보려면? LEFT (사원 왼쪽)!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'JOIN 은 둘 이상의 테이블을 연결해 한 결과 집합으로 만드는 SQL 의 가장 핵심 연산. 시험에는 "어느 JOIN 이 어떤 결과를 내는지" 매칭 + "행 수 계산" 이 단골.',
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
          title: '행 수 합계 문제 — 시험 단골',
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
          title: '함정 — JOIN 결과가 다른 것 찾기',
          body:
            '시험에 4가지 JOIN 결과 중 하나만 행 수가 다른 보기 등장. 일반적으로 FULL OUTER 가 가장 행 수 많음.',
        },
      ],
    },
    {
      id: 'sqld-2-2-s2',
      title: 'JOIN 조건 표기 — NATURAL / USING / ON',
      quizId: 'sqld-2-2-cp-02',
      dialogue: [
        { pose: 'wave', text: 'JOIN 의 [매칭 조건]을 명시하는 3가지 방법! 각각 특징 다름!' },
        { pose: 'think', text: '① [NATURAL JOIN]: [같은 이름 컬럼]을 [자동 매칭]! ON·USING 절 없음!' },
        { pose: 'lightbulb', text: '예: SELECT * FROM 사원 NATURAL JOIN 부서 — 양쪽에 [부서ID] 가 있으면 자동 매칭!' },
        { pose: 'happy', text: '② [USING(컬럼)]: 같은 이름 컬럼을 [명시적]으로 지정!' },
        { pose: 'think', text: '예: INNER JOIN 부서 USING (부서ID) — 부서ID 가 양쪽에 있어야 함!' },
        { pose: 'lightbulb', text: '③ [ON 조건]: 가장 [명시적]! 컬럼명이 [달라도] 사용 가능!' },
        { pose: 'happy', text: '예: ON E.dept_id = D.id — 한쪽이 dept_id, 다른 쪽이 id 여도 OK!' },
        { pose: 'think', text: '함정! ON 절은 [표현식이 와야]! [ON (컬럼명)] 만 쓰면 [오류]!' },
        { pose: 'lightbulb', text: 'NATURAL JOIN 의 단점: 같은 이름 컬럼이 [의도치 않게 매칭]될 수 있어 [위험]!' },
        { pose: 'happy', text: '실무는 [ON 조건] 권장! NATURAL JOIN 은 가급적 피하기!' },
        { pose: 'think', text: 'NATURAL/USING 의 결과 컬럼은 [한 번만] 등장! 테이블 prefix [사용 불가]!' },
        { pose: 'lightbulb', text: '예: SELECT 부서ID FROM 사원 USING(부서ID) → OK / SELECT E.부서ID FROM ... USING → 오류!' },
        { pose: 'idle', text: 'ON (DEPT_ID) 만 쓰면 어떻게? 오류!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'JOIN 의 매칭 조건을 표기하는 3가지 방법 — NATURAL, USING, ON. 각각 컬럼명 같음 여부·명시도·prefix 사용 가능 여부가 다릅니다. 실무는 ON 조건이 가장 명확하고 안전.',
        },
        {
          kind: 'example',
          title: '3가지 표기 비교',
          body:
            "-- ① NATURAL JOIN — 같은 이름 컬럼 자동\nSELECT * FROM 사원 NATURAL JOIN 부서;\n  -- 양쪽에 '부서ID' 있다면 자동 매칭. 같은 이름 컬럼이 여러 개면 모두 매칭.\n\n-- ② USING — 같은 이름 컬럼 명시\nSELECT 이름, 부서명\nFROM 사원 INNER JOIN 부서 USING (부서ID);\n  -- 부서ID 가 양쪽에 있어야 함. 결과에 부서ID 한 번만 등장.\n\n-- ③ ON — 가장 명시적, 컬럼명 달라도 OK\nSELECT E.이름, D.부서명\nFROM 사원 E INNER JOIN 부서 D ON E.부서ID = D.dept_id;",
        },
        {
          kind: 'table',
          title: '3가지 비교',
          headers: ['표기', '컬럼명', '명시도', 'prefix 사용'],
          rows: [
            ['NATURAL', '같아야 (자동)', '낮음', '불가'],
            ['USING(c)', '같아야 (명시)', '중간', '불가 (USING 컬럼)'],
            ['ON 조건', '달라도 OK', '높음', '가능'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 1 — ON (컬럼명) 단독',
          body:
            "INNER JOIN B ON (DEPT_ID) — 오류! ON 절은 표현식 필요. ON A.DEPT_ID = B.DEPT_ID 또는 USING (DEPT_ID) 사용.",
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 2 — NATURAL/USING 의 prefix',
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
      title: 'CROSS JOIN · SELF JOIN',
      quizId: 'sqld-2-2-cp-03',
      dialogue: [
        { pose: 'wave', text: '특수 JOIN [2종] — CROSS 와 SELF!' },
        { pose: 'think', text: '[CROSS JOIN] = [카티시안 곱(Cartesian Product)] = [모든 쌍 조합]!' },
        { pose: 'lightbulb', text: 'M 행 × N 행 = M·N 행! 매칭 조건 [없음]!' },
        { pose: 'happy', text: '예: 학생(5명) CROSS JOIN 과목(3개) → 15 행 (모든 학생-과목 쌍)!' },
        { pose: 'think', text: 'FROM A, B (콤마) + WHERE 없음 = CROSS JOIN 과 동치!' },
        { pose: 'lightbulb', text: 'WHERE 조건 추가하면 [INNER JOIN 효과]! FROM A, B WHERE A.k = B.k → INNER JOIN 동일!' },
        { pose: 'happy', text: '단! FROM A * B 같은 표기는 [SQL 표준 X] [오류]!' },
        { pose: 'think', text: '[SELF JOIN] = [같은 테이블을 두 번 참조]!' },
        { pose: 'lightbulb', text: '계층형 데이터에 자주 사용! 사원-멘토, 카테고리-상위, 글-답글!' },
        { pose: 'happy', text: '문법: FROM 사원 E, 사원 M WHERE E.멘토사번 = M.사번 — [별칭 두 개]로 같은 테이블 분리!' },
        { pose: 'think', text: 'JOIN 표기로도: FROM 사원 E JOIN 사원 M ON E.멘토사번 = M.사번!' },
        { pose: 'lightbulb', text: '시험: 사원 셀프조인으로 차상위 관리자 찾는 패턴 단골!' },
        { pose: 'idle', text: '5행 × 3행 CROSS JOIN = ? 15!' },
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
          title: '함정 — FROM A, B WHERE 없음',
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
      title: '서브쿼리 6종 — 위치 + 결과 형태별',
      quizId: 'sqld-2-2-cp-04',
      dialogue: [
        { pose: 'wave', text: '[서브쿼리(Subquery)]는 [쿼리 안의 또 다른 쿼리]! 강력한 도구!' },
        { pose: 'think', text: '서브쿼리는 [위치] 와 [반환 형태] 에 따라 [6가지]로 분류!' },
        { pose: 'lightbulb', text: '[반환 형태별 4종]: 단일행·다중행·다중열·스칼라!' },
        { pose: 'happy', text: '① [단일행 서브쿼리]: 한 행·한 컬럼 반환! = > < 같은 [단일값 비교]에 사용!' },
        { pose: 'think', text: '예: WHERE 급여 > (SELECT AVG(급여) FROM EMP) — 평균 1개 값과 비교!' },
        { pose: 'lightbulb', text: '② [다중행 서브쿼리]: 여러 행 반환! IN, ANY, ALL, EXISTS 와 함께!' },
        { pose: 'happy', text: '예: WHERE 부서ID IN (SELECT 부서ID FROM 부서 WHERE 지역=서울)!' },
        { pose: 'think', text: '③ [다중열 서브쿼리]: 여러 컬럼 반환! (a,b) IN ((1,2),(3,4)) 패턴!' },
        { pose: 'lightbulb', text: '④ [스칼라 서브쿼리]: SELECT 절 안의 [한 행·한 컬럼] 서브쿼리! 값처럼 사용!' },
        { pose: 'happy', text: '[위치별 2종]: 인라인뷰·상호연관!' },
        { pose: 'think', text: '⑤ [인라인 뷰(Inline View)]: FROM 절 안의 [임시 테이블]!' },
        { pose: 'lightbulb', text: '예: SELECT * FROM (SELECT 부서ID, AVG(급여) FROM EMP GROUP BY 부서ID) X WHERE ...!' },
        { pose: 'happy', text: '⑥ [상호연관(Correlated) 서브쿼리]: 바깥 쿼리 컬럼을 [참조] → 행마다 다시 실행!' },
        { pose: 'think', text: 'EXISTS 와 자주 사용. WHERE EXISTS (SELECT 1 FROM B WHERE B.k = A.k)!' },
        { pose: 'lightbulb', text: '함정! 단일행 서브쿼리에 = 으로 다중행 결과 받으면 [ORA-01427] 오류!' },
        { pose: 'idle', text: '여러 컬럼 반환은 어느 분류? 다중열!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '서브쿼리는 SQL 의 가장 강력한 표현 도구. 한 쿼리 결과를 다른 쿼리의 입력으로 사용해 복잡한 로직을 표현. 위치(SELECT/FROM/WHERE)와 반환 형태(단일/다중/스칼라)에 따라 6가지로 분류됩니다.',
        },
        {
          kind: 'table',
          title: '서브쿼리 6종',
          headers: ['종류', '위치', '반환', '비교 연산자/용도'],
          rows: [
            ['단일행 서브쿼리', 'WHERE', '1행·1컬럼', '=, >, <, >=, <=, !='],
            ['다중행 서브쿼리', 'WHERE', '여러 행·1컬럼', 'IN, ANY, ALL, EXISTS'],
            ['다중열 서브쿼리', 'WHERE', '여러 컬럼', '(a,b) IN ((1,2),(3,4))'],
            ['스칼라 서브쿼리', 'SELECT', '1행·1컬럼', '값 자리'],
            ['인라인 뷰', 'FROM', '여러 행·여러 컬럼', '임시 테이블처럼'],
            ['상호연관 서브쿼리', 'WHERE/SELECT', '바깥 행마다 다른 결과', '주로 EXISTS'],
          ],
        },
        {
          kind: 'example',
          title: '대표 예시',
          body:
            "-- 단일행\nSELECT 이름 FROM EMP\nWHERE 급여 > (SELECT AVG(급여) FROM EMP);\n\n-- 다중행\nSELECT 이름 FROM EMP\nWHERE 부서ID IN (SELECT 부서ID FROM 부서 WHERE 지역='서울');\n\n-- 다중열\nWHERE (부서ID, 직무) IN (SELECT 부서ID, 직무 FROM 인사팀);\n\n-- 스칼라\nSELECT 이름,\n  (SELECT 부서명 FROM 부서 D WHERE D.부서ID = E.부서ID) AS 부서명\nFROM EMP E;\n\n-- 인라인 뷰\nSELECT *\nFROM (SELECT 부서ID, AVG(급여) AS 평균 FROM EMP GROUP BY 부서ID) X\nWHERE X.평균 > 5000000;\n\n-- 상호연관\nSELECT 이름 FROM EMP E\nWHERE 급여 > (SELECT AVG(급여) FROM EMP\n              WHERE 부서ID = E.부서ID);  -- 행마다 부서별 평균",
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — 단일행에 다중행 결과',
          body:
            "WHERE 부서ID = (SELECT 부서ID FROM 부서 WHERE 지역='서울') 인데 서울 부서가 여러 개라면 ORA-01427 오류. = → IN 으로 변경해야.",
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '서브쿼리 vs 메인쿼리',
          body:
            '서브쿼리는 메인쿼리 컬럼을 참조 가능 (상호연관). 그러나 메인쿼리는 서브쿼리 컬럼을 직접 참조 불가 — 서브쿼리 결과를 받아 비교만 가능.',
        },
      ],
    },
    {
      id: 'sqld-2-2-s5',
      title: '다중행 비교 — EXISTS · IN · ANY · ALL',
      quizId: 'sqld-2-2-cp-05',
      dialogue: [
        { pose: 'wave', text: '다중행 서브쿼리와 함께 쓰는 [4가지 연산자]! 의미가 미묘하게 달라!' },
        { pose: 'think', text: '[IN]: 서브쿼리 결과 [집합에 포함]되는지 검사!' },
        { pose: 'lightbulb', text: '예: WHERE 부서ID IN (SELECT 부서ID FROM 부서 WHERE 지역="서울")!' },
        { pose: 'happy', text: '[EXISTS]: 서브쿼리에 행이 [하나라도 있으면 TRUE]! 값을 비교 X!' },
        { pose: 'think', text: '예: WHERE EXISTS (SELECT 1 FROM 주문 WHERE 주문.회원ID = 회원.ID) — 회원이 주문이 있는지!' },
        { pose: 'lightbulb', text: '[ANY]: 서브쿼리 결과 [중 하나라도 만족]하면 TRUE!' },
        { pose: 'happy', text: '> ANY (a,b,c) = 최솟값 a 보다 크면 OK! 가장 느슨!' },
        { pose: 'think', text: '[ALL]: 서브쿼리 결과 [모두 만족]해야 TRUE!' },
        { pose: 'lightbulb', text: '> ALL (a,b,c) = 최댓값 c 보다 커야 OK! 가장 엄격!' },
        { pose: 'happy', text: '= ANY 는 IN 과 [동일]! != ALL 은 NOT IN 과 동일!' },
        { pose: 'think', text: '[가입 안 한 회원] 찾기 — NOT EXISTS 또는 NOT IN!' },
        { pose: 'lightbulb', text: '함정! NOT IN 에 NULL 이 섞이면 [전체가 UNKNOWN] → 0행!' },
        { pose: 'happy', text: '안전한 패턴: [NOT EXISTS] 사용! NULL 영향 없음!' },
        { pose: 'idle', text: ">= ANY (50, 100, 150) — 최솟값 50 이상이면 TRUE!" },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'EXISTS·IN·ANY·ALL 은 다중행 서브쿼리와 함께 쓰는 4가지 연산자. 의미가 비슷해 보이지만 차이가 있어 시험 단골. 특히 NOT IN + NULL 의 함정을 알면 실무 버그도 줄어듭니다.',
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
          title: '함정 — NOT IN + NULL',
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
      title: '집합 연산자 4종 — UNION / UNION ALL / INTERSECT / MINUS',
      quizId: 'sqld-2-2-cp-06',
      dialogue: [
        { pose: 'wave', text: '[집합 연산자]는 [두 쿼리 결과를 세로로 합치는] 도구!' },
        { pose: 'think', text: 'JOIN 이 [가로 결합] 이라면, 집합 연산자는 [세로 결합]!' },
        { pose: 'lightbulb', text: '4가지: [UNION], [UNION ALL], [INTERSECT], [MINUS] (또는 EXCEPT)!' },
        { pose: 'happy', text: '① [UNION ALL]: [중복 그대로], 단순 이어붙이기. 가장 빠름!' },
        { pose: 'think', text: '② [UNION]: 합집합 + [중복 제거 + 정렬]! UNION ALL 보다 비쌈!' },
        { pose: 'lightbulb', text: '③ [INTERSECT]: [교집합]! 양쪽 모두 있는 행만!' },
        { pose: 'happy', text: '④ [MINUS] (Oracle) / [EXCEPT] (SQL Server): [차집합]! 앞 결과에서 뒤 결과 빼기!' },
        { pose: 'think', text: '전제 조건: 두 쿼리의 [컬럼 개수] + [데이터 타입] [호환]되어야 동작!' },
        { pose: 'lightbulb', text: '결과 컬럼 이름은 [첫 번째 쿼리 기준]! ORDER BY 는 마지막에 한 번만!' },
        { pose: 'happy', text: '동치 변환 단골: [UNION ALL] = [UNION] + [INTERSECT] (중복분이 한 번 더 등장)!' },
        { pose: 'think', text: '성능 팁: 중복 없는 게 보장되거나 중복 제거 불필요 → UNION ALL!' },
        { pose: 'lightbulb', text: '시험: "두 결과의 합집합으로 중복 제거 X" 는 UNION ALL!' },
        { pose: 'idle', text: '교집합은? INTERSECT! 차집합은? MINUS!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '집합 연산자는 두 SELECT 쿼리 결과를 세로로 합치는 도구. SQL 의 합집합·교집합·차집합. 시험에는 4가지 연산자 정의 매칭과 UNION/UNION ALL 의 차이가 단골.',
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
          title: '성능 함정',
          body:
            'UNION 은 중복 제거를 위해 정렬 비용 발생. 이미 중복이 없거나 중복 제거가 필요 없는 상황에서 UNION 쓰면 불필요 비용. UNION ALL 검토.',
        },
      ],
    },
    {
      id: 'sqld-2-2-s7',
      title: '그룹 함수 — ROLLUP · CUBE · GROUPING SETS',
      quizId: 'sqld-2-2-cp-07',
      dialogue: [
        { pose: 'wave', text: 'GROUP BY 의 [확장 형태] 3총사 — [ROLLUP], [CUBE], [GROUPING SETS]!' },
        { pose: 'think', text: '소계·총계·다양한 조합을 한 쿼리로 만드는 도구!' },
        { pose: 'lightbulb', text: '① [ROLLUP(a, b)]: 컬럼 순서대로 [점진적]으로 그룹을 줄여 소계+총계!' },
        { pose: 'happy', text: 'ROLLUP(지역, 상품) → [(지역,상품), (지역), ()] 3가지 그룹!' },
        { pose: 'think', text: '예: 지역별·상품별 매출 + 지역 소계 + 전체 총계 한 번에!' },
        { pose: 'lightbulb', text: '함정! ROLLUP(a,b) 와 ROLLUP(b,a) 는 [결과 다름]! 컬럼 순서 중요!' },
        { pose: 'happy', text: '② [CUBE(a, b)]: [모든 부분집합] 그룹 생성!' },
        { pose: 'think', text: 'CUBE(지역, 상품) → [(지역,상품), (지역), (상품), ()] 4가지!' },
        { pose: 'lightbulb', text: '컬럼 순서 [무관]! 모든 조합 다 만들기 때문!' },
        { pose: 'happy', text: '③ [GROUPING SETS]: 원하는 조합만 [명시적]으로 지정!' },
        { pose: 'think', text: 'GROUPING SETS ((a,b), (c), ()) — 정확히 이 3가지만!' },
        { pose: 'lightbulb', text: '동치 변환: ROLLUP(a, b) ≡ GROUPING SETS ((a,b), (a), ())!' },
        { pose: 'happy', text: '[GROUPING(col)] 함수: 그 컬럼이 소계 행이면 1, 아니면 0!' },
        { pose: 'think', text: 'CASE WHEN GROUPING(col)=1 THEN "소계" ELSE col END 패턴 자주!' },
        { pose: 'idle', text: 'CUBE(a,b) 의 결과 그룹은 몇 개? 4개!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '집계 보고서를 만들 때 GROUP BY 만으로는 소계·총계를 한 번에 못 냅니다. ROLLUP / CUBE / GROUPING SETS 가 이를 한 쿼리로 가능케 합니다. 시험에서 동치 변환 + 결과 행 수 매칭 단골.',
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
            'ROLLUP(a,b) ≡ GROUPING SETS ((a,b), (a), ()) / CUBE(a,b) ≡ GROUPING SETS ((a,b), (a), (b), ()). 시험에 동치 표현 매칭 출제.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — ROLLUP 컬럼 순서',
          body:
            'ROLLUP(a, b) 와 ROLLUP(b, a) 결과 다름. 첫 컬럼 기준으로 점진적 소계가 만들어지므로 순서가 중요. CUBE 는 무관.',
        },
      ],
    },
    {
      id: 'sqld-2-2-s8',
      title: '윈도우 함수 — 순위 (RANK · DENSE_RANK · ROW_NUMBER)',
      quizId: 'sqld-2-2-cp-08',
      dialogue: [
        { pose: 'wave', text: '[윈도우 함수(Window Function)]는 GROUP BY 없이 [그룹 내 위치] 같은 값을 계산!' },
        { pose: 'think', text: '문법: [함수() OVER (PARTITION BY 그룹 ORDER BY 정렬)]!' },
        { pose: 'lightbulb', text: 'PARTITION BY 가 그룹 (부서별 등), ORDER BY 가 그룹 내 순서!' },
        { pose: 'happy', text: '순위 함수 [3총사] — 시험 빈출 1순위!' },
        { pose: 'think', text: '① [RANK()]: 동점 → [같은 순위] + 다음 순위 [건너뜀]!' },
        { pose: 'lightbulb', text: '② [DENSE_RANK()]: 동점 → 같은 순위 + 다음 순위 [건너뛰지 않음]!' },
        { pose: 'happy', text: '③ [ROW_NUMBER()]: 동점 [무시] + [고유 순번]!' },
        { pose: 'think', text: '예시: 점수 100, 100, 90, 80 (DESC)!' },
        { pose: 'lightbulb', text: 'RANK = [1, 1, 3, 4] (3번 건너뜀)!' },
        { pose: 'happy', text: 'DENSE_RANK = [1, 1, 2, 3] (연속)!' },
        { pose: 'think', text: 'ROW_NUMBER = [1, 2, 3, 4] (동점도 별개 번호)!' },
        { pose: 'lightbulb', text: '시험 함정! 두 명 동률 후 다음 사람의 순위 — RANK=3, DENSE_RANK=2, ROW_NUMBER=3!' },
        { pose: 'happy', text: 'GROUP BY 와 차이: 윈도우 함수는 [원본 행 수 유지]! GROUP BY 는 행을 압축!' },
        { pose: 'idle', text: '동점 후 다음 사람 순위가 2 면? DENSE_RANK!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '윈도우 함수는 GROUP BY 와 달리 행 수를 유지하면서 그룹별 순위·누적·이동 평균 등을 계산. 분석·BI 보고서·랭킹 등에 필수. 시험에서는 RANK / DENSE_RANK / ROW_NUMBER 의 차이를 묻는 매칭이 단골.',
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
            'GROUP BY: 같은 값 행을 한 줄로 압축. 결과 행 수 ↓.\n윈도우 함수: 원본 행 수 유지 + 각 행 옆에 그룹 통계.\n예: "각 사원 옆에 부서 평균 급여 표시" 는 GROUP BY 만으로 불가능, 윈도우 함수 필수.',
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
      title: '윈도우 — 집계 + PARTITION BY + 누적합',
      quizId: 'sqld-2-2-cp-09',
      dialogue: [
        { pose: 'wave', text: '집계함수 (SUM, AVG, MIN, MAX, COUNT) 도 OVER 절과 함께 쓰면 [윈도우 함수]가 돼!' },
        { pose: 'think', text: 'OVER() 가 [비어있으면] [전체 행]을 한 윈도우로!' },
        { pose: 'lightbulb', text: '예: SUM(판매액) OVER () = 모든 행의 [총합] 을 각 행 옆에 표시!' },
        { pose: 'happy', text: '[PARTITION BY 컬럼]: 컬럼별로 그룹 나눠 그룹별 집계!' },
        { pose: 'think', text: '예: SUM(판매액) OVER (PARTITION BY 지역) → 지역별 합계!' },
        { pose: 'lightbulb', text: 'GROUP BY 와의 결정적 차이: 윈도우 함수는 [원본 행 수 유지]!' },
        { pose: 'happy', text: '"각 직원 옆에 부서 평균 급여 표시" 같은 요구는 GROUP BY 만으로 불가능!' },
        { pose: 'think', text: '[ORDER BY] 추가하면 [누적] 효과! SUM(판매액) OVER (ORDER BY 날짜) = 날짜별 누적합!' },
        { pose: 'lightbulb', text: 'PARTITION BY + ORDER BY 조합: 부서별 누적, 지역별 누적 등 자유롭게!' },
        { pose: 'happy', text: '실무 예: 매출 순위, 누적 매출, 동기 대비 성장률, 이동평균!' },
        { pose: 'think', text: 'GROUP BY 없이도 가능 — SELECT 절에 윈도우 함수만 넣으면 자동으로 모든 행에 적용!' },
        { pose: 'idle', text: 'OVER() 비어있으면? 전체 행 1그룹!' },
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
          title: '함정 — GROUP BY 와 혼용',
          body:
            'GROUP BY 가 있는 쿼리에 윈도우 함수를 쓰면 윈도우는 GROUP BY 결과에 적용. 두 결과 동시 표현 시 인라인뷰로 분리.',
        },
      ],
    },
    {
      id: 'sqld-2-2-s10',
      title: 'LAG / LEAD / FIRST_VALUE + 범위 지정 (ROWS · RANGE)',
      quizId: 'sqld-2-2-cp-10',
      dialogue: [
        { pose: 'wave', text: '윈도우 함수 응용 — [행 간 참조] + [범위 지정]!' },
        { pose: 'think', text: '[행 간 참조 함수 4종]: LAG·LEAD·FIRST_VALUE·LAST_VALUE!' },
        { pose: 'lightbulb', text: '[LAG(col, n)]: [n 행 이전] 값! n 생략 시 1 행 이전!' },
        { pose: 'happy', text: '예: 일별 매출 비교에서 어제 매출 가져오기!' },
        { pose: 'think', text: '[LEAD(col, n)]: [n 행 이후] 값! 다음 매출!' },
        { pose: 'lightbulb', text: '[FIRST_VALUE(col)]: 윈도우의 [첫 값]!' },
        { pose: 'happy', text: '[LAST_VALUE(col)]: 윈도우의 [마지막 값] — 단! [범위 명시 필요]!' },
        { pose: 'think', text: '범위 지정: [ROWS] (행 단위) vs [RANGE] (값 단위)!' },
        { pose: 'lightbulb', text: 'BETWEEN [UNBOUNDED PRECEDING] AND [CURRENT ROW] = [누적합·누적평균]!' },
        { pose: 'happy', text: 'BETWEEN [1 PRECEDING] AND [1 FOLLOWING] = [3행 이동평균]!' },
        { pose: 'think', text: '[ROWS] = 행 개수 단위. [RANGE] = 값 같은 행은 묶어 처리!' },
        { pose: 'lightbulb', text: '예: 점수가 같은 행이 3개라면 ROWS 는 3행, RANGE 는 1그룹으로 처리!' },
        { pose: 'happy', text: '범위 생략 시 기본은 [RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW]!' },
        { pose: 'idle', text: 'ROWS 와 RANGE 차이는? 행 vs 값!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'LAG/LEAD 는 시계열 분석의 필수 도구 (어제·내일 값 가져오기). ROWS/RANGE 는 윈도우의 크기를 명시하는 절. 누적합·이동평균·전월대비 등에 활용.',
        },
        {
          kind: 'table',
          title: '행 간 참조 함수',
          headers: ['함수', '의미', '예시'],
          rows: [
            ['LAG(col, n, default)', 'n 행 이전 값', '어제 매출 가져오기'],
            ['LEAD(col, n, default)', 'n 행 이후 값', '내일 매출 가져오기'],
            ['FIRST_VALUE(col)', '윈도우 첫 값', '시작점 값'],
            ['LAST_VALUE(col)', '윈도우 마지막 값', '범위 명시 필수'],
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
          title: '함정 — LAST_VALUE',
          body:
            'LAST_VALUE 는 기본 윈도우가 시작~현재라 그냥 쓰면 항상 현재 행 값 = LAST_VALUE 가 됨. 의도한 "윈도우의 마지막 값" 을 얻으려면 ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING 명시 필요.',
        },
      ],
    },
    {
      id: 'sqld-2-2-s11',
      title: 'TOP N · 비율 · 계층형 · PIVOT/UNPIVOT',
      quizId: 'sqld-2-2-cp-11',
      dialogue: [
        { pose: 'wave', text: '윈도우 함수의 [응용 4세트] — TOP N · 비율 · 계층형 · PIVOT!' },
        { pose: 'think', text: '[TOP N]: 상위 N 개 추출. DBMS 마다 표현 다름!' },
        { pose: 'lightbulb', text: 'SQL Server: [TOP N], MySQL: [LIMIT N], Oracle 12c+: [FETCH FIRST N ROWS ONLY]!' },
        { pose: 'happy', text: 'Oracle 구버전: [ROWNUM <= N] (단! 정렬 후 ROWNUM 위해 인라인뷰 필요)!' },
        { pose: 'think', text: '동률 포함하려면 [WITH TIES]! 5위 동점이 3명이면 5개 → 7개 반환!' },
        { pose: 'lightbulb', text: '[비율 함수 4종]: NTILE, CUME_DIST, PERCENT_RANK, RATIO_TO_REPORT!' },
        { pose: 'happy', text: '[NTILE(n)]: 데이터를 [n 등분]해 그룹 번호! 사분위·십분위 분석에!' },
        { pose: 'think', text: '[CUME_DIST]: 누적 백분율! 현재 행 이하의 비율!' },
        { pose: 'lightbulb', text: '[PERCENT_RANK]: 상대적 순위 (0~1)!' },
        { pose: 'happy', text: '[계층형 질의]: Oracle 의 트리 구조 탐색! [START WITH] + [CONNECT BY PRIOR]!' },
        { pose: 'think', text: 'PRIOR 위치로 [순방향/역방향] 결정!' },
        { pose: 'lightbulb', text: '[PRIOR 자식 = 부모] = 순방향 (부모 → 자식). [PRIOR 부모 = 자식] = 역방향!' },
        { pose: 'happy', text: '[PIVOT/UNPIVOT]: 행과 열 [재구성]! PIVOT 은 LONG→WIDE, UNPIVOT 은 WIDE→LONG!' },
        { pose: 'idle', text: '"동률까지 포함" 옵션은? WITH TIES!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'SQLD 시험에서 윈도우 함수의 응용 영역. TOP N 표현은 DBMS 별 차이가 함정, PIVOT/UNPIVOT 은 BI 보고서에 필수, 계층형 질의는 조직도·카테고리에 필수.',
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
          kind: 'keypoints',
          title: '비율 함수 4종',
          items: [
            'NTILE(n) — 데이터를 n 등분 후 그룹 번호 (1~n)',
            'CUME_DIST() — 누적 백분율 (현재 ≤ 비율)',
            'PERCENT_RANK() — 상대적 순위 (0~1)',
            'RATIO_TO_REPORT() — 전체 합 대비 행 비율',
          ],
        },
        {
          kind: 'example',
          title: '계층형 질의 — 사원·관리자 트리',
          body:
            "-- 최상위(직속상관 IS NULL)부터 트리 출력\nSELECT LEVEL, 사원이름, 직속상관\nFROM 사원\nSTART WITH 직속상관 IS NULL\nCONNECT BY PRIOR 사원이름 = 직속상관;\n  -- PRIOR = 부모 (이미 처리). 자식의 직속상관 = 부모의 사원이름 → 순방향\n\n-- 역방향 (특정 사원에서 위로)\nSTART WITH 사원이름 = '민희'\nCONNECT BY PRIOR 직속상관 = 사원이름;",
        },
        {
          kind: 'table',
          title: '계층형 질의 키워드',
          headers: ['키워드', '의미'],
          rows: [
            ['LEVEL', '현재 깊이 (최상위 = 1)'],
            ['START WITH', '루트 조건'],
            ['CONNECT BY PRIOR', '부모-자식 연결 정의'],
            ['NOCYCLE', '순환 발생 시 무한 루프 방지'],
            ['ORDER SIBLINGS BY', '같은 레벨 정렬'],
            ['SYS_CONNECT_BY_PATH', "루트부터 현재까지 경로 (예: '/A/B/C')"],
            ['CONNECT_BY_ROOT', '최상위 루트 값'],
            ['CONNECT_BY_ISLEAF', '말단(리프) 노드 여부'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'PIVOT vs UNPIVOT',
          body:
            'PIVOT: 행을 열로 펼침 (LONG → WIDE). 집계함수 필수. FOR 컬럼 IN (값1 AS 별명1, 값2 AS 별명2). UNPIVOT: 열을 행으로 (WIDE → LONG). 집계 X.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — Oracle ROWNUM + ORDER BY',
          body:
            "WHERE ROWNUM <= 5 ORDER BY ... 는 정렬 전 번호가 매겨져 잘못된 결과. ORDER BY 를 인라인뷰 안에서 먼저 적용 후 외부에서 ROWNUM. 또는 FETCH FIRST.",
        },
      ],
    },
    {
      id: 'sqld-2-2-s12',
      title: '정규표현식 — 기호 + Oracle 함수 5종',
      quizId: 'sqld-2-2-cp-12',
      dialogue: [
        { pose: 'wave', text: '[정규표현식(Regular Expression)]은 [패턴 매칭] 도구!' },
        { pose: 'think', text: '예: 이메일 검증·전화번호 검증·특정 형식 검색에 필수!' },
        { pose: 'lightbulb', text: '먼저 [기호] 정리 — 시험 단골!' },
        { pose: 'happy', text: '[.]: [임의의 한 문자]! a.c → abc, aic 매칭, ac 는 X!' },
        { pose: 'think', text: '[^]: 문자열 [시작]. ^010 → 010 으로 시작!' },
        { pose: 'lightbulb', text: '[$]: 문자열 [끝]. com$ → com 으로 끝!' },
        { pose: 'happy', text: '[*]: 앞 문자 [0번 이상] 반복! ho* → h, ho, hoo, ...!' },
        { pose: 'think', text: '[+]: 앞 문자 [1번 이상] 반복! ho+ → ho, hoo, ... (h 단독은 X)!' },
        { pose: 'lightbulb', text: '[?]: 앞 문자 [0 또는 1회]! ho? → h 또는 ho만!' },
        { pose: 'happy', text: '함정! [?] 와 [*] 헷갈리면 안 됨! [?] = 0 또는 1, [*] = 0 이상!' },
        { pose: 'think', text: '[[abc]]: a, b, c 중 [하나]. [a-z]: a부터 z 까지!' },
        { pose: 'lightbulb', text: '[[^abc]]: abc [제외] 모든 문자!' },
        { pose: 'happy', text: '[{n}]: n 회 반복. [{n,m}]: n~m 회. [{m,}]: m 회 이상!' },
        { pose: 'think', text: 'Oracle 함수 [5종]: REGEXP_LIKE / REPLACE / INSTR / SUBSTR / COUNT!' },
        { pose: 'lightbulb', text: '[REGEXP_LIKE(s, p)]: 일치 여부 (TRUE/FALSE) — WHERE 절에 사용!' },
        { pose: 'happy', text: '[REGEXP_REPLACE]: 일치 부분 치환! [REGEXP_INSTR]: 일치 시작 위치 (정수)!' },
        { pose: 'think', text: '[REGEXP_SUBSTR]: 일치 부분 [추출]! [REGEXP_COUNT]: 일치 [횟수]!' },
        { pose: 'idle', text: '? 는 0 또는 1회! 1회 이상은 +!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '정규표현식은 SQL 안에서 복잡한 문자열 패턴을 검색·치환·추출하는 도구. 시험에는 기호의 정확한 의미와 5가지 Oracle 함수 매칭이 단골. 한국어 한 음절은 한 문자 단위로 처리됩니다.',
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
            '* (asterisk) = 0회 이상. + (plus) = 1회 이상. ? (question) = 0 또는 1회. 셋의 차이가 시험 단골 함정.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — ? 와 *',
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
  hook: '데이터를 직접 다루는 명령어. 트랜잭션·제약조건·권한까지.',
  estimatedMinutes: 14,
  steps: [
    {
      id: 'sqld-2-3-s1',
      title: 'DML 3총사 — INSERT / UPDATE / DELETE',
      quizId: 'sqld-2-3-cp-01',
      dialogue: [
        { pose: 'wave', text: '관리 구문의 시작은 [DML]! 데이터 자체를 다루는 명령들!' },
        { pose: 'think', text: '3총사: [INSERT]·[UPDATE]·[DELETE]!' },
        { pose: 'lightbulb', text: '[INSERT]: 새 행 추가! 두 가지 형태!' },
        { pose: 'happy', text: '[전체 컬럼]: INSERT INTO T VALUES (값1, 값2, ...) — [컬럼 순서 그대로 모두 입력]!' },
        { pose: 'think', text: '[명시적 컬럼]: INSERT INTO T (col1, col3) VALUES (값1, 값3) — [선택 컬럼만 입력 가능]!' },
        { pose: 'lightbulb', text: '명시되지 않은 컬럼은 [NULL] (또는 DEFAULT)! [NOT NULL 컬럼 누락 시 오류]!' },
        { pose: 'happy', text: '[UPDATE]: 기존 행 수정! UPDATE T SET col = 값 WHERE 조건!' },
        { pose: 'think', text: '함정! [WHERE 누락 시] 모든 행이 변경! 무서운 실수!' },
        { pose: 'lightbulb', text: '[DELETE]: 행 삭제! DELETE FROM T WHERE 조건. WHERE 없으면 전체 행 삭제!' },
        { pose: 'happy', text: 'DELETE 는 [DML 이라 ROLLBACK 가능]! 반면 [TRUNCATE 는 DDL 이라 불가]!' },
        { pose: 'think', text: '실무 팁: WHERE 없는 UPDATE/DELETE 는 트랜잭션·테스트 환경에서만!' },
        { pose: 'idle', text: 'NOT NULL 컬럼 빼먹고 INSERT 하면? 오류!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'DML 은 데이터 그 자체를 추가·수정·삭제하는 명령. 트랜잭션의 일부로 동작 — 잘못 실행해도 ROLLBACK 으로 되돌릴 수 있어 DDL/DCL 보다 안전. 단 WHERE 누락은 치명적이니 주의.',
        },
        {
          kind: 'example',
          title: 'INSERT 두 가지 형태',
          body:
            "-- 1. 전체 컬럼 (순서 정확히 맞춰야)\nINSERT INTO 학생 VALUES (5, '길동', 23, 1);\n\n-- 2. 명시적 컬럼 (누락 컬럼은 NULL/DEFAULT)\nINSERT INTO 학생 (학번, 이름, 학년)\nVALUES (6, '선영', 1);  -- 나이는 NULL",
        },
        {
          kind: 'example',
          title: 'UPDATE / DELETE',
          body:
            "-- UPDATE\nUPDATE 학생 SET 나이 = 20 WHERE 이름 = '선영';\n\n-- 모든 직원 급여 10% 인상\nUPDATE 직원 SET 급여 = 급여 * 1.1;\n\n-- 서브쿼리 활용 UPDATE\nUPDATE 직원 a\nSET 급여 = (SELECT AVG(급여) FROM 직원 b WHERE b.부서 = a.부서);\n\n-- DELETE\nDELETE FROM 학생 WHERE 학번 = 5;",
        },
        {
          kind: 'table',
          title: 'DML 3종 비교',
          headers: ['명령', '용도', 'WHERE 누락 시', 'ROLLBACK'],
          rows: [
            ['INSERT', '행 추가', '—', '가능'],
            ['UPDATE', '행 수정', '전체 행 변경', '가능'],
            ['DELETE', '행 삭제', '전체 행 삭제', '가능'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — INSERT 컬럼 누락',
          body:
            'NOT NULL 인 컬럼을 명시적 컬럼 INSERT 에서 빠뜨리면 오류. CHECK 제약 위반·FK 참조 무결성 위반도 INSERT 시점에 거부됨.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'UPDATE 의 서브쿼리 NULL 함정',
          body:
            'UPDATE T SET col = (서브쿼리) 에서 서브쿼리가 NULL 을 반환하면 col 이 NULL 로 됨. WHERE 매칭 실패 시 모두 NULL 로 변경되어 의도와 다른 결과 가능.',
        },
      ],
    },
    {
      id: 'sqld-2-3-s2',
      title: 'MERGE — UPSERT (INSERT + UPDATE 통합)',
      quizId: 'sqld-2-3-cp-02',
      dialogue: [
        { pose: 'wave', text: '[MERGE]는 [INSERT 와 UPDATE 를 하나로 묶은] 강력한 명령!' },
        { pose: 'think', text: '왜 필요? 매번 "있으면 UPDATE, 없으면 INSERT" 패턴 (UPSERT) 을 자주 함!' },
        { pose: 'lightbulb', text: '예: 주간 동기화 — 새 회원이면 INSERT, 기존 회원이면 정보 UPDATE!' },
        { pose: 'happy', text: '문법: MERGE INTO [대상] USING [소스] ON ([매칭 조건])!' },
        { pose: 'think', text: '[WHEN MATCHED THEN UPDATE]: 조건 만족하는 행 → UPDATE!' },
        { pose: 'lightbulb', text: '[WHEN NOT MATCHED THEN INSERT]: 조건 불만족 (= 신규) → INSERT!' },
        { pose: 'happy', text: '한 번의 SQL 로 두 작업 처리 → [트랜잭션 안전성 ↑], [성능 ↑]!' },
        { pose: 'think', text: 'ETL (데이터 통합), 증분 동기화, 매시간 갱신 작업에 표준 패턴!' },
        { pose: 'lightbulb', text: 'WHEN MATCHED 절에 [DELETE] 도 가능 (Oracle 일부 버전)!' },
        { pose: 'happy', text: '실무 예: "사용자 마스터 테이블" 을 매일 외부 시스템에서 받아 동기화할 때 MERGE 한 줄!' },
        { pose: 'think', text: '시험 단골: MERGE 의 동작 방식 매칭, ON 조건의 역할!' },
        { pose: 'idle', text: 'MATCHED 면? UPDATE! NOT MATCHED 면? INSERT!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'MERGE 는 INSERT + UPDATE 를 한 번의 SQL 로 처리하는 명령 (UPSERT). ETL·동기화·증분 갱신 등에 표준 패턴이며, 한 트랜잭션 안에서 처리되어 성능과 일관성 양쪽에서 유리합니다.',
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
          title: '함정 — MATCHED 절 누락',
          body:
            'WHEN MATCHED 또는 WHEN NOT MATCHED 중 [하나만] 둬도 동작. 둘 다 빠지면 오류. ON 조건의 컬럼은 UPDATE 절에 두면 오류 (이미 키 매칭).',
        },
      ],
    },
    {
      id: 'sqld-2-3-s3',
      title: 'TCL — COMMIT · ROLLBACK · SAVEPOINT',
      quizId: 'sqld-2-3-cp-03',
      dialogue: [
        { pose: 'wave', text: '[TCL (Transaction Control Language)]은 [트랜잭션 제어]!' },
        { pose: 'think', text: '3종: [COMMIT]·[ROLLBACK]·[SAVEPOINT]!' },
        { pose: 'lightbulb', text: '[COMMIT]: 변경사항을 [영구 반영]! 더 이상 ROLLBACK 불가!' },
        { pose: 'happy', text: '[ROLLBACK]: 마지막 COMMIT 시점으로 [되돌리기]! 변경 취소!' },
        { pose: 'think', text: '[SAVEPOINT]: 부분 롤백을 위한 [지점 표시]!' },
        { pose: 'lightbulb', text: '예: SAVEPOINT SV1; INSERT...; SAVEPOINT SV2; UPDATE...; ROLLBACK TO SV1!' },
        { pose: 'happy', text: '결과: SV1 이후의 INSERT, UPDATE 모두 [취소]! SV1 이전 작업은 유지!' },
        { pose: 'think', text: '함정! [ROLLBACK TO SVx 후]에 [SVx 이후 만든 SAVEPOINT 들은 모두 사라짐]!' },
        { pose: 'lightbulb', text: '함정 2! [COMMIT 한 후엔 모든 SAVEPOINT 사라짐]! "COMMIT; ROLLBACK TO SVx;" → [오류]!' },
        { pose: 'happy', text: '시험 단골: SAVEPOINT 시나리오에서 최종 행 수 계산!' },
        { pose: 'think', text: '핵심: 시간 순서대로 따라가며 [현재 상태] 추적!' },
        { pose: 'idle', text: 'COMMIT 후 ROLLBACK 가능? 불가능!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'TCL 은 트랜잭션의 결과를 어떻게 처리할지 결정합니다. COMMIT 으로 영구 반영, ROLLBACK 으로 취소, SAVEPOINT 로 부분 롤백 지점 표시. 시험에는 SAVEPOINT 시나리오의 최종 결과 추적이 단골.',
        },
        {
          kind: 'table',
          title: 'TCL 3종',
          headers: ['명령', '의미', '효과'],
          rows: [
            ['COMMIT', '영구 반영', '이후 ROLLBACK 불가, 모든 SAVEPOINT 소멸'],
            ['ROLLBACK', '마지막 COMMIT 시점으로 되돌리기', '모든 변경 취소'],
            ['SAVEPOINT 이름', '부분 롤백 지점 표시', '이후 ROLLBACK TO 가능'],
            ['ROLLBACK TO SV', 'SV 시점으로 되돌리기', 'SV 이후 SAVEPOINT 도 함께 소멸'],
          ],
        },
        {
          kind: 'example',
          title: 'SAVEPOINT 시나리오 — 단골 패턴',
          body:
            "INSERT INTO T VALUES(1);\nINSERT INTO T VALUES(2);\nINSERT INTO T VALUES(3);\nSAVEPOINT SV1;          -- 시점: 1,2,3\nINSERT INTO T VALUES(4);\nINSERT INTO T VALUES(5);\nCOMMIT;                  -- 1~5 영구 반영, SV1 사라짐\nINSERT INTO T VALUES(6);\nROLLBACK TO SAVEPOINT SV1; -- 오류! SV1 은 COMMIT 으로 사라짐\n\n-- 결과: 6건 (1,2,3,4,5,6) 모두 남음 (오류는 ROLLBACK TO 실행 X)",
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
          title: '함정 1 — COMMIT 후 ROLLBACK',
          body:
            'COMMIT 한 트랜잭션은 ROLLBACK 으로 되돌릴 수 없음. 또한 COMMIT 시점에 모든 SAVEPOINT 가 사라지므로 이후의 ROLLBACK TO SVx 는 "SAVEPOINT not found" 오류.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 2 — ROLLBACK TO 후 SV 소멸',
          body:
            'ROLLBACK TO SV1 후 SV2 는 사라진 상태. ROLLBACK TO SV2 다시 시도 시 오류. SV1 자체는 유지되어 다시 ROLLBACK TO SV1 은 가능.',
        },
      ],
    },
    {
      id: 'sqld-2-3-s4',
      title: 'AUTOCOMMIT — Oracle vs SQL Server 동작 차이',
      quizId: 'sqld-2-3-cp-04',
      dialogue: [
        { pose: 'wave', text: '[AUTOCOMMIT] 은 SQL 실행 후 [자동 COMMIT 여부]!' },
        { pose: 'think', text: 'DBMS 마다 동작이 [완전히 다름]! 시험 단골 함정!' },
        { pose: 'lightbulb', text: '[Oracle]: DML 은 기본 [OFF] — 명시적 COMMIT/ROLLBACK 필요!' },
        { pose: 'happy', text: 'Oracle DDL 은 [항상 자동 COMMIT]! 무조건! 이건 설정 X!' },
        { pose: 'think', text: '[SQL Server]: 기본 [ON] — 매 SQL 이 즉시 자동 COMMIT!' },
        { pose: 'lightbulb', text: '명시적 트랜잭션 원하면 BEGIN TRAN ... COMMIT/ROLLBACK 으로 묶기!' },
        { pose: 'happy', text: '[핵심 함정]: Oracle 에서 DDL 실행 시 [직전 DML 도 함께 자동 COMMIT]!' },
        { pose: 'think', text: '예: INSERT...; CREATE TABLE...; → INSERT 도 영구 반영! ROLLBACK 불가!' },
        { pose: 'lightbulb', text: '의도치 않은 COMMIT 주의! DDL 은 [트랜잭션 경계]로 작동!' },
        { pose: 'happy', text: 'SQL Server 는 기본 ON 이라 매 명령이 단독 트랜잭션. 묶고 싶으면 BEGIN TRAN!' },
        { pose: 'think', text: '시험 함정: "DDL 후 직전 DML 을 ROLLBACK" → [불가능]!' },
        { pose: 'idle', text: 'Oracle DML 기본 AUTOCOMMIT? OFF!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'AUTOCOMMIT 은 단일 SQL 실행 후 자동으로 COMMIT 할지 여부. Oracle 과 SQL Server 의 기본값이 정반대. 이 차이를 모르면 의도치 않은 데이터 영구 반영이 일어납니다.',
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
          title: '핵심 함정 — DDL 의 자동 COMMIT 전염',
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
      title: 'CREATE TABLE + 데이터 타입 + 제약',
      quizId: 'sqld-2-3-cp-05',
      dialogue: [
        { pose: 'wave', text: '[CREATE TABLE]은 새 테이블의 [구조를 정의]!' },
        { pose: 'think', text: '컬럼명 + 데이터 타입 + 제약조건을 모두 한 번에!' },
        { pose: 'lightbulb', text: '데이터 타입 [4가지 핵심]: CHAR / VARCHAR2 / NUMBER / DATE!' },
        { pose: 'happy', text: '[CHAR(n)]: [고정 길이] 문자열! 남는 자리 [공백 채움]!' },
        { pose: 'think', text: '예: CHAR(10) 컬럼에 "abc" 저장 → "abc       " (공백 7칸 추가)!' },
        { pose: 'lightbulb', text: '[VARCHAR2(n) / VARCHAR(n)]: [가변 길이]! 실제 저장 길이만큼만!' },
        { pose: 'happy', text: '저장 효율 ↑ — 거의 모든 경우 VARCHAR2 권장! CHAR 는 고정 길이가 의미 있을 때만!' },
        { pose: 'think', text: '[NUMBER]: 숫자 (Oracle). [INT/FLOAT]: 정수/실수.' },
        { pose: 'lightbulb', text: '[DATE]: 날짜 + 시간 (Oracle 은 초 단위까지).' },
        { pose: 'happy', text: '제약조건도 함께! [PRIMARY KEY], [NOT NULL], [UNIQUE], [CHECK], [FOREIGN KEY]!' },
        { pose: 'think', text: '명명 규칙: [숫자로 시작 X], [예약어 X], [같은 테이블 컬럼명 중복 X]!' },
        { pose: 'lightbulb', text: 'Oracle 객체명 길이는 [최대 30자]! (12c R2 부터 128자 가능)' },
        { pose: 'idle', text: '테이블명 1234_T 가능? 불가능 (숫자 시작)!' },
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
            'NOT NULL — NULL 불가',
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
            '(1) 숫자 시작 X (1234_T 불가) (2) 예약어 X (TABLE, FROM 등) (3) 같은 테이블 내 컬럼명 중복 X (4) Oracle 30자 이내 (12cR2+ 128자)',
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
      title: 'ALTER · DROP · TRUNCATE — 구조 변경/삭제',
      quizId: 'sqld-2-3-cp-06',
      dialogue: [
        { pose: 'wave', text: '테이블 구조 변경 + 삭제 명령들!' },
        { pose: 'think', text: '[ALTER TABLE] — 5가지 형태! ADD / MODIFY / DROP COLUMN / RENAME / ADD CONSTRAINT!' },
        { pose: 'lightbulb', text: '[ADD]: 컬럼 추가. [MODIFY]: 컬럼 [타입·크기 변경]. [DROP COLUMN]: 컬럼 삭제!' },
        { pose: 'happy', text: '[RENAME COLUMN]: 컬럼 이름 변경. [ADD CONSTRAINT]: 제약 추가!' },
        { pose: 'think', text: '함정! 컬럼 [크기 축소]는 [기존 데이터에 영향]! NULL 만 있는 컬럼만 축소 가능!' },
        { pose: 'lightbulb', text: '예: VARCHAR2(10) 컬럼에 "1234567890" 저장됨 → VARCHAR2(5) 축소 시도 [불가]!' },
        { pose: 'happy', text: 'NUMBER 정밀도 변경도 마찬가지: 데이터가 새 크기 안 들어가면 거부!' },
        { pose: 'think', text: '[삭제 명령] 3종 — DELETE / TRUNCATE / DROP — 자주 헷갈림!' },
        { pose: 'lightbulb', text: '[DELETE]: 행 단위 삭제 (WHERE 가능). [DML]. ROLLBACK 가능!' },
        { pose: 'happy', text: '[TRUNCATE]: 전체 행 삭제 (WHERE 불가). [DDL]. ROLLBACK [불가] + 자동 COMMIT!' },
        { pose: 'think', text: '[DROP TABLE]: 테이블 [자체] 삭제 (구조까지). [DDL]. ROLLBACK 불가!' },
        { pose: 'lightbulb', text: '함정! "WHERE 없는 DELETE = DROP" 보기는 [틀림]! DELETE 는 구조 유지, DROP 은 구조도 삭제!' },
        { pose: 'happy', text: '[CASCADE CONSTRAINTS]: DROP TABLE 시 FK 제약도 함께 삭제!' },
        { pose: 'idle', text: '구조까지 삭제하는 건? DROP!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'ALTER 는 테이블 구조 변경, DROP/TRUNCATE 는 삭제. 셋의 차이를 헷갈리는 보기가 시험에 자주 나오므로 명확한 구분이 필요합니다.',
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
            ['TRUNCATE', 'DDL', '유지', '전체', '불가', '불가 (자동 COMMIT)'],
            ['DROP', 'DDL', '삭제', '삭제', '—', '불가 (자동 COMMIT)'],
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
          title: '함정 1 — 컬럼 크기 축소',
          body:
            '기존 데이터가 새 크기를 초과하면 ALTER MODIFY 거부. NULL 만 들어있는 컬럼은 자유롭게 변경 가능. 미리 데이터 정리 후 변경.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 2 — DELETE = DROP?',
          body:
            '"WHERE 없는 DELETE 는 DROP TABLE 과 같다" 는 [틀림]. DELETE 는 구조 유지·ROLLBACK 가능, DROP 은 구조까지 삭제·ROLLBACK 불가.',
        },
      ],
    },
    {
      id: 'sqld-2-3-s7',
      title: '제약조건 6종 + CTAS + VIEW',
      quizId: 'sqld-2-3-cp-07',
      dialogue: [
        { pose: 'wave', text: '제약조건 [6종]을 정확히! 시험 빈출!' },
        { pose: 'think', text: '[PRIMARY KEY (PK)]: [유일성 + NOT NULL]! 테이블당 [1개만]!' },
        { pose: 'lightbulb', text: '단, PK 는 [복합 컬럼] 으로 만들 수 있음! (학번, 과목코드) 같이!' },
        { pose: 'happy', text: '[UNIQUE (UK)]: [유일]만! NULL 허용! 한 테이블 [여러 개] 가능!' },
        { pose: 'think', text: '[NOT NULL]: NULL 불가. 단독 사용 가능!' },
        { pose: 'lightbulb', text: '[FOREIGN KEY (FK)]: 다른 테이블 PK 참조 — 참조 무결성!' },
        { pose: 'happy', text: '[CHECK]: 값 범위·집합 제한! 도메인 무결성! 예: CHECK (성별 IN ("M","F"))!' },
        { pose: 'think', text: '[DEFAULT]: 미입력 시 [기본값]! NOT NULL 과 함께 자주!' },
        { pose: 'lightbulb', text: '함정! NOT NULL 추가 시 [기존 NULL 데이터 있으면 오류]! 미리 채운 후 추가!' },
        { pose: 'happy', text: '[CTAS (CREATE TABLE AS SELECT)]: 기존 테이블 [구조+데이터 복제]!' },
        { pose: 'think', text: '단! CTAS 는 [NOT NULL 만] 자동 복제! PK·FK·UNIQUE·CHECK·DEFAULT 는 [별도 추가]!' },
        { pose: 'lightbulb', text: '[VIEW]: [가상 테이블]! 실제 데이터 저장 X — 매번 정의된 SELECT 실행!' },
        { pose: 'happy', text: '뷰 장점: [보안성](일부 컬럼만 노출) · [독립성](기반 변경 흡수) · [편의성](복잡 쿼리 단순화)!' },
        { pose: 'idle', text: 'PK 는 한 테이블에 몇 개? 1개!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '제약조건은 데이터 무결성을 보장하는 가장 기본적인 도구. 시험 단골이며, CTAS 의 NOT NULL 만 복제 특성과 VIEW 의 특성도 함께 묶여 출제되는 경우가 많습니다.',
        },
        {
          kind: 'table',
          title: '제약조건 6종',
          headers: ['제약', '의미', 'NULL', '테이블당'],
          rows: [
            ['PRIMARY KEY (PK)', '유일 + NOT NULL', '불가', '1개'],
            ['UNIQUE (UK)', '유일', '허용', '여러 개'],
            ['NOT NULL', 'NULL 불가', '불가', '여러 개'],
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
          title: '함정 1 — NOT NULL 추가',
          body:
            '기존 행에 NULL 이 있는 컬럼에 NOT NULL 제약 추가 시 오류. 먼저 UPDATE 로 NULL 을 채운 뒤 ALTER MODIFY ... NOT NULL.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 2 — CTAS 는 NOT NULL 만 복제',
          body:
            '"CTAS 가 PK·FK 등 모든 제약을 복제한다" 는 [틀림]. NOT NULL 과 컬럼 정의·데이터만 복제. 다른 제약·인덱스·트리거는 별도 추가.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 3 — VIEW 가 조회 속도를 빠르게?',
          body:
            '뷰는 매 실행 시 정의된 SELECT 가 실행되므로 본 테이블 조회와 비슷하거나 살짝 느릴 수도. 속도 개선은 머터리얼라이즈드 뷰(MV)·인덱스로.',
        },
      ],
    },
    {
      id: 'sqld-2-3-s8',
      title: 'DCL — GRANT / REVOKE + 두 OPTION 차이',
      quizId: 'sqld-2-3-cp-08',
      dialogue: [
        { pose: 'wave', text: '[DCL (Data Control Language)]은 [권한 관리]!' },
        { pose: 'think', text: '[GRANT]: 권한 [부여]! [REVOKE]: 권한 [회수]!' },
        { pose: 'lightbulb', text: '권한 종류: [객체 권한] vs [시스템 권한]!' },
        { pose: 'happy', text: '[객체 권한]: 특정 테이블·뷰·시퀀스에 대한 SELECT/INSERT/UPDATE/DELETE!' },
        { pose: 'think', text: '[시스템 권한]: DB 전반에 대한 CREATE TABLE/CREATE USER/DBA 등!' },
        { pose: 'lightbulb', text: '문법: [GRANT 권한 ON 객체 TO 사용자]!' },
        { pose: 'happy', text: '예: GRANT SELECT, INSERT ON 학생 TO user1!' },
        { pose: 'think', text: '권한 [재부여 옵션] 2종 — 시험 단골!' },
        { pose: 'lightbulb', text: '[WITH GRANT OPTION]: [객체 권한] 받은 user1 이 [다른 사용자에게 재부여 가능]!' },
        { pose: 'happy', text: 'user1 권한 회수 시 → user1 이 user2 에게 준 권한도 [연쇄 회수]!' },
        { pose: 'think', text: '[WITH ADMIN OPTION]: [시스템 권한] 받은 user1 이 다른 사용자에게 부여·회수 가능!' },
        { pose: 'lightbulb', text: 'user1 권한 회수 시 → user1 이 user2 에게 준 권한은 [그대로 유지]!' },
        { pose: 'happy', text: '핵심 차이: 회수 시 [연쇄 회수 여부]! GRANT 옵션은 연쇄, ADMIN 은 유지!' },
        { pose: 'idle', text: '시스템 권한 부여 옵션은? WITH ADMIN OPTION!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'DCL 은 누가 어떤 데이터에 접근할 수 있는지 정의. GRANT 와 REVOKE 두 명령으로 단순해 보이지만, 두 OPTION 의 차이를 묻는 문제가 시험 단골.',
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
            'WITH GRANT OPTION = 객체 권한 + 연쇄 회수. WITH ADMIN OPTION = 시스템 권한 + 회수 무관. 두 차이를 묻는 매칭이 가장 자주 출제.',
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

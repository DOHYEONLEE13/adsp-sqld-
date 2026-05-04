/**
 * glossary.ts — Tier 2 SEO 데이터 분석·SQL 용어 사전.
 *
 * 라우트: `/glossary`
 *
 * 콘텐츠 원칙:
 *   - 정의형 검색 ("DIKW 뜻", "정규화 BCNF 차이") 1면 진입을 노린 한국어 정의
 *   - 1 용어 = 1 짧은 정의(120자 이내) + 1 보충 설명(180자 이내)
 *   - 가능한 경우 lesson 페이지로 link (internal linking)
 *
 * JSON-LD: DefinedTermSet 스키마 사용. 각 항목은 DefinedTerm.
 */

export interface GlossaryTerm {
  /** 안전 슬러그 (alphabet/숫자/하이픈만). 향후 단일 용어 페이지 분리 시 사용. */
  slug: string;
  term: string;
  /** 검색 동의어 — "DIKW 피라미드" 같은 실제 검색어. */
  aliases?: string[];
  subject: 'adsp' | 'sqld' | 'common';
  category: string;
  /** 한 줄 정의 — 120자 이내. */
  short: string;
  /** 보충 설명 — 180자 이내. */
  detail: string;
  /** 관련 lesson step (있으면 internal link). */
  relatedStepId?: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  // ─── ADsP / 데이터 이해 ─────────────────────────────────
  {
    slug: 'dikw',
    term: 'DIKW 피라미드',
    aliases: ['DIKW', '데이터 정보 지식 지혜'],
    subject: 'adsp',
    category: '데이터 이해',
    short: 'Data → Information → Knowledge → Wisdom 의 4단계 가치 사슬을 표현한 모델.',
    detail:
      '원시 데이터는 가공되면 정보(맥락이 더해진 데이터)가 되고, 정보를 패턴으로 묶으면 지식이 됩니다. 지식 위에 통찰적 의사결정을 얹은 게 지혜. ADsP 1과목에서 매 회차 1~2문제 출제되는 핵심 개념입니다.',
    relatedStepId: 'adsp-1-1-s1',
  },
  {
    slug: 'seci',
    term: 'SECI 모델',
    aliases: ['SECI', '지식 변환', '노나카'],
    subject: 'adsp',
    category: '데이터 이해',
    short: '암묵지·형식지가 4단계로 변환되며 지식이 창출된다는 노나카 이쿠지로의 모델.',
    detail:
      '사회화(Socialization, 암묵→암묵), 외재화(Externalization, 암묵→형식), 종합화(Combination, 형식→형식), 내면화(Internalization, 형식→암묵)의 SECI 사이클로 조직 지식이 누적됩니다.',
  },
  {
    slug: 'oltp-olap',
    term: 'OLTP / OLAP',
    aliases: ['OLTP', 'OLAP', '온라인 트랜잭션'],
    subject: 'adsp',
    category: '데이터베이스',
    short: 'OLTP 는 트랜잭션 위주(주문·결제), OLAP 는 분석 위주(집계·드릴다운) 시스템.',
    detail:
      'OLTP 는 짧은 단일 트랜잭션 다발 처리에 최적화 — 정규화·동시성 우선. OLAP 는 다차원 분석 쿼리에 최적화 — 비정규화·집계 우선. 데이터 웨어하우스의 분석 워크로드가 대표적인 OLAP.',
  },
  {
    slug: 'data-warehouse',
    term: '데이터 웨어하우스(DW)',
    aliases: ['Data Warehouse', 'DW', '데이터웨어하우스'],
    subject: 'adsp',
    category: '데이터베이스',
    short: '주제별·통합·시계열·비휘발의 4가지 특성을 가진 분석 전용 통합 데이터 저장소.',
    detail:
      'OLTP 의 거래 데이터를 ETL 로 추출·변환·적재하여 DW 에 누적. 분석가는 OLAP 도구로 다차원 큐브를 탐색합니다. 데이터 마트(DM)는 DW 의 부서·주제별 부분 집합.',
  },
  {
    slug: 'data-lake',
    term: '데이터 레이크',
    aliases: ['Data Lake'],
    subject: 'adsp',
    category: '데이터베이스',
    short: '정형·반정형·비정형 데이터를 가공 없이 원본 형태로 저장하는 대규모 저장소.',
    detail:
      'DW 가 분석 목적에 맞게 정제된 정형 데이터 위주라면, 데이터 레이크는 "일단 다 모은다" 전략으로 비정형(영상·로그·텍스트)도 함께 보관. 활용 시점에 가공하는 ELT 와 자주 결합됩니다.',
  },
  {
    slug: 'big-data-3v',
    term: '빅데이터 3V / 5V',
    aliases: ['3V', '5V', 'Volume Variety Velocity'],
    subject: 'adsp',
    category: '빅데이터',
    short: 'Volume(양)·Variety(다양성)·Velocity(속도) 3V 에 Value·Veracity 가 더해진 5V.',
    detail:
      '단순 크기뿐 아니라 정형/반정형/비정형이 섞인 다양성, 실시간 스트림 같은 속도까지 빅데이터의 본질. 5V 의 Value(가치)·Veracity(진실성)는 활용 단계의 품질 차원.',
  },
  // ─── ADsP / 분석 기획 ─────────────────────────────────
  {
    slug: 'kdd',
    term: 'KDD',
    aliases: ['Knowledge Discovery in Databases'],
    subject: 'adsp',
    category: '분석 방법론',
    short: '데이터에서 지식을 발견하는 5단계 분석 방법론(선택→전처리→변환→마이닝→해석).',
    detail:
      '1996년 Fayyad 가 제시. 단계: 데이터 선택 → 전처리 → 변환 → 데이터 마이닝 → 해석/평가. 학술적 토대가 강해 ADsP 2과목에서 CRISP-DM 과 비교 출제되는 단골 주제.',
  },
  {
    slug: 'crisp-dm',
    term: 'CRISP-DM',
    aliases: ['Cross-Industry Standard Process for Data Mining'],
    subject: 'adsp',
    category: '분석 방법론',
    short: '비즈니스 이해→데이터 이해→준비→모델링→평가→배포의 산업표준 6단계 분석 프로세스.',
    detail:
      '1996년 IBM·SPSS·Daimler 등이 제정한 데이터 마이닝 산업 표준. 단계 사이의 반복(피드백)이 명시된 게 KDD 와의 차이점이며 실무에서 가장 널리 통용됩니다.',
  },
  {
    slug: 'analysis-types',
    term: '분석 4유형',
    aliases: ['What How 분석 유형', '최적화 솔루션 통찰 발견'],
    subject: 'adsp',
    category: '분석 기획',
    short: '분석 대상(What)·분석 방법(How)의 명확/불명확 조합으로 만든 4사분면 유형.',
    detail:
      '최적화(What·How 모두 명확) / 솔루션(What 명확, How 불명확) / 통찰(How 명확, What 불명확) / 발견(둘 다 불명확). 외울 때는 "최솔통발".',
  },
  // ─── ADsP / 통계·머신러닝 ─────────────────────────────────
  {
    slug: 'eda',
    term: 'EDA',
    aliases: ['Exploratory Data Analysis', '탐색적 데이터 분석'],
    subject: 'adsp',
    category: '통계 분석',
    short: '본격 모델링 전 데이터를 시각화·요약통계로 탐색하는 분석 단계. Tukey 가 제안.',
    detail:
      '4원칙(저항성·잔차해석·재표현·현시성)을 따라 분포·이상치·결측치·관계성을 살핍니다. 외울 때는 "저잔재현". ADsP 3과목에서 결측·이상치 처리법과 함께 출제.',
  },
  {
    slug: 'central-limit-theorem',
    term: '중심극한정리(CLT)',
    aliases: ['CLT', 'Central Limit Theorem', '중심극한'],
    subject: 'adsp',
    category: '통계 분석',
    short: '표본 크기가 충분히 크면 표본평균의 분포가 모집단 분포와 무관하게 정규분포에 근사.',
    detail:
      '일반적으로 표본 크기 n ≥ 30 이면 정규성 가정이 가능. 가설검정·신뢰구간 추정의 이론적 토대. 모집단 분포가 비정규여도 평균의 분포는 정규에 수렴한다는 게 핵심.',
  },
  {
    slug: 't-test',
    term: 't검정',
    aliases: ['t-test', 't 검정', 'Student t test'],
    subject: 'adsp',
    category: '가설검정',
    short: '두 집단의 평균 차이를 검정하는 통계 기법. 단일·독립·대응 표본의 3종류.',
    detail:
      '단일 표본 t(평균=μ₀ 검증), 독립 표본 t(두 집단 평균 비교), 대응 표본 t(같은 대상 전후 비교). 정규성·등분산성 가정이 필수이며 등분산 위배 시 Welch t 사용.',
  },
  {
    slug: 'pca',
    term: '주성분분석(PCA)',
    aliases: ['PCA', 'Principal Component Analysis'],
    subject: 'adsp',
    category: '차원 축소',
    short: '여러 변수를 분산 최대 방향으로 결합해 소수의 새 축으로 축약하는 차원축소 기법.',
    detail:
      '공분산행렬의 고유벡터가 주성분 축이 되며 고유값이 클수록 더 큰 분산을 설명. 다중공선성 해소·시각화·노이즈 제거에 활용. ADsP 3과목 단골 출제.',
  },
  {
    slug: 'overfitting',
    term: '과적합(Overfitting)',
    aliases: ['Overfitting', '과적', '오버피팅'],
    subject: 'adsp',
    category: '머신러닝',
    short: '훈련 데이터에 과도하게 맞춰 일반화 성능이 떨어지는 현상.',
    detail:
      '대처법: 교차검증, 정규화(L1/L2), 드롭아웃, 앙상블, 데이터 증강. 의사결정나무는 가지치기(pruning)가 대표 처방. 편향·분산 트레이드오프의 분산이 큰 쪽.',
  },
  {
    slug: 'ensemble',
    term: '앙상블',
    aliases: ['Ensemble', 'Bagging', 'Boosting', 'Random Forest'],
    subject: 'adsp',
    category: '머신러닝',
    short: '여러 모델의 예측을 결합해 단일 모델보다 강건한 예측을 만드는 기법.',
    detail:
      '4종: 배깅(병렬·분산↓), 부스팅(직렬·편향↓), 랜덤포레스트(배깅+특성 무작위), 스태킹(메타 학습). 외울 때는 "배부랜스".',
  },
  {
    slug: 'knn',
    term: 'K-NN',
    aliases: ['KNN', 'K-Nearest Neighbors', '최근접 이웃'],
    subject: 'adsp',
    category: '머신러닝',
    short: '가장 가까운 K 개 이웃의 다수결로 분류하는 지연 학습(lazy learning) 알고리즘.',
    detail:
      '거리 척도(유클리드·맨해튼)로 이웃을 찾으며 K 가 작으면 과적합·크면 과소적합. 정규화 필수. 학습 단계가 따로 없어 추론 시간이 길지만 구현이 단순.',
  },
  // ─── SQLD / 데이터 모델링 ─────────────────────────────────
  {
    slug: 'normalization',
    term: '정규화',
    aliases: ['Normalization', '1NF', '2NF', '3NF', 'BCNF'],
    subject: 'sqld',
    category: '데이터 모델링',
    short: '이상현상 제거를 위해 테이블을 작게 분할하는 설계 원칙. 1NF~BCNF 단계.',
    detail:
      '"도부이결"로 외움 — 1NF(도메인 원자성), 2NF(부분 함수종속 제거), 3NF(이행 함수종속 제거), BCNF(결정자가 후보키). 갱신/삽입/삭제 이상이 사라집니다.',
  },
  {
    slug: 'denormalization',
    term: '반정규화',
    aliases: ['Denormalization'],
    subject: 'sqld',
    category: '데이터 모델링',
    short: '정규화된 테이블을 일부러 합치거나 컬럼을 추가해 조회 성능을 높이는 기법.',
    detail:
      '대표 기법: 테이블 병합·컬럼 추가·이력 테이블 분리·요약 테이블. JOIN 비용 vs 갱신 이상 위험을 저울질하며 적용. 무결성을 응용 로직으로 보전해야 합니다.',
  },
  {
    slug: 'functional-dependency',
    term: '함수 종속',
    aliases: ['Functional Dependency', 'FD'],
    subject: 'sqld',
    category: '데이터 모델링',
    short: '한 속성 집합 A 의 값이 결정되면 다른 속성 집합 B 의 값이 유일하게 정해지는 관계. A→B.',
    detail:
      '완전 함수 종속(2NF), 부분 함수 종속(2NF 위배), 이행 함수 종속(3NF 위배)이 정규화 단계 판정의 기준. 후보키 결정에도 핵심 도구.',
  },
  {
    slug: 'identifier',
    term: '식별자',
    aliases: ['Primary Key', '주식별자', '대체식별자'],
    subject: 'sqld',
    category: '데이터 모델링',
    short: '엔터티의 한 인스턴스를 유일하게 구분하는 속성. 주·보조·내부·외부 식별자.',
    detail:
      '주식별자 선택 4원칙: 유일성·최소성·불변성·존재성. "유최불존"으로 외움. 대체식별자(보조)는 후보키 중 주식별자가 아닌 것.',
  },
  // ─── SQLD / SQL 기본·활용 ─────────────────────────────────
  {
    slug: 'join-types',
    term: 'JOIN 종류',
    aliases: ['INNER JOIN', 'OUTER JOIN', 'CROSS JOIN', 'SELF JOIN'],
    subject: 'sqld',
    category: 'SQL 활용',
    short: 'INNER · LEFT/RIGHT/FULL OUTER · CROSS · SELF JOIN 6종이 SQL 표준.',
    detail:
      'INNER 는 양쪽 일치만, OUTER 는 한쪽 보존, CROSS 는 카르테시안 곱, SELF 는 자기 자신 참조. Oracle 전통 표기(+) 와 ANSI 표기 둘 다 출제됩니다.',
  },
  {
    slug: 'sql-execution-order',
    term: 'SQL 실행 순서',
    aliases: ['Execution Order', 'FROM WHERE GROUP HAVING SELECT ORDER'],
    subject: 'sqld',
    category: 'SQL 기본',
    short: 'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY 의 논리적 처리 순서.',
    detail:
      '작성 순서(SELECT 먼저)와 실행 순서가 다른 게 SQL 핵심 개념. 그래서 WHERE 절에서는 SELECT 의 별칭을 못 쓰고, ORDER BY 에서는 쓸 수 있어요. "프웨그하셀오"로 외움.',
  },
  {
    slug: 'subquery',
    term: '서브쿼리',
    aliases: ['Subquery', 'Inline View', 'Scalar Subquery', 'Correlated'],
    subject: 'sqld',
    category: 'SQL 활용',
    short: 'SELECT 문 안에 포함된 또 다른 SELECT 문. 위치와 결과 행수에 따라 6종.',
    detail:
      '위치별: 스칼라(SELECT 절)·인라인뷰(FROM)·중첩(WHERE). 결과별: 단일행·다중행·다중컬럼. 상관 서브쿼리는 외부 쿼리의 컬럼을 참조해 행마다 재실행됨.',
  },
  {
    slug: 'set-operators',
    term: '집합 연산자',
    aliases: ['UNION', 'INTERSECT', 'MINUS', 'EXCEPT'],
    subject: 'sqld',
    category: 'SQL 활용',
    short: 'UNION(합집합·중복 제거)·UNION ALL(중복 유지)·INTERSECT(교집합)·MINUS/EXCEPT(차집합).',
    detail:
      '두 쿼리의 결과 집합을 결합. 컬럼 수와 데이터 타입이 일치해야 하며 첫 쿼리의 컬럼명이 결과의 컬럼명. ORDER BY 는 마지막에만 한 번.',
  },
  {
    slug: 'rollup-cube',
    term: 'ROLLUP / CUBE',
    aliases: ['ROLLUP', 'CUBE', 'GROUPING SETS'],
    subject: 'sqld',
    category: 'SQL 활용',
    short: 'GROUP BY 의 확장. ROLLUP 은 계층 소계(단방향), CUBE 는 모든 조합 소계(다차원).',
    detail:
      'ROLLUP(A,B): A·B별/A별/전체. CUBE(A,B): A·B별/A별/B별/전체. GROUPING SETS 는 원하는 조합만 명시. 출력 행수 계산이 단골 문제.',
  },
  {
    slug: 'window-functions',
    term: '윈도우 함수',
    aliases: ['Window Functions', 'OVER PARTITION BY', 'RANK', 'ROW_NUMBER'],
    subject: 'sqld',
    category: 'SQL 활용',
    short: 'GROUP BY 처럼 행을 줄이지 않고 그룹별 집계·순위·이동 비교를 계산하는 함수군.',
    detail:
      'OVER(PARTITION BY ... ORDER BY ...) 구문이 핵심. 순위(ROW_NUMBER · RANK · DENSE_RANK · NTILE), 시계열(LAG · LEAD), 집계(SUM · AVG OVER) 가 출제 단골.',
  },
  {
    slug: 'transaction',
    term: '트랜잭션',
    aliases: ['Transaction', 'COMMIT', 'ROLLBACK', 'SAVEPOINT'],
    subject: 'sqld',
    category: '관리 구문',
    short: 'ACID(원자성·일관성·고립성·지속성) 4성질을 보장하는 단일 작업 단위.',
    detail:
      'COMMIT 으로 영구 반영, ROLLBACK 으로 되돌림, SAVEPOINT 로 부분 롤백. AUTOCOMMIT 환경에서는 매 DML 직후 자동 커밋되므로 트랜잭션 단위가 사라집니다.',
  },
  {
    slug: 'null',
    term: 'NULL',
    aliases: ['NULL', 'IS NULL', 'NVL', 'COALESCE'],
    subject: 'sqld',
    category: 'SQL 기본',
    short: '"값이 없음"을 의미. 0·빈 문자열과 다른 미정의 상태. 비교 시 IS NULL 사용.',
    detail:
      'NULL 과 어떤 값을 비교해도 결과는 UNKNOWN. 산술/문자/논리 연산에 NULL 이 들어가면 결과도 NULL. NVL · COALESCE · NULLIF · ISNULL 같은 NULL 처리 함수가 SQLD 단골.',
  },
  {
    slug: 'constraint',
    term: '제약조건',
    aliases: ['Constraint', 'PRIMARY KEY', 'FOREIGN KEY', 'CHECK'],
    subject: 'sqld',
    category: '관리 구문',
    short: 'PK·FK·UNIQUE·NOT NULL·CHECK 의 5종 무결성 규칙.',
    detail:
      'PK 는 NOT NULL + UNIQUE. FK 는 부모 테이블의 PK/UNIQUE 참조. CHECK 는 값 범위 제약. ALTER TABLE 로 추가/삭제 가능하며 ON DELETE CASCADE/SET NULL 도 출제 범위.',
  },
  {
    slug: 'dcl',
    term: 'DCL',
    aliases: ['Data Control Language', 'GRANT', 'REVOKE'],
    subject: 'sqld',
    category: '관리 구문',
    short: '권한을 부여(GRANT)·회수(REVOKE)하는 SQL 명령군.',
    detail:
      'GRANT SELECT ON ... TO user / REVOKE SELECT ON ... FROM user. WITH GRANT OPTION 을 주면 받은 사용자가 다시 다른 사용자에게 권한을 위임 가능. ROLE 로 권한 묶음 관리.',
  },
];

export const GLOSSARY_CATEGORIES = [
  '데이터 이해',
  '데이터베이스',
  '빅데이터',
  '분석 방법론',
  '분석 기획',
  '통계 분석',
  '가설검정',
  '차원 축소',
  '머신러닝',
  '데이터 모델링',
  'SQL 기본',
  'SQL 활용',
  '관리 구문',
] as const;

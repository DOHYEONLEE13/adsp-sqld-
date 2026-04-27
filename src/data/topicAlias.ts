/**
 * 토픽 정규화 — 문제 은행(JSON) 의 raw `topic` 문자열을
 * `subjects.ts` 의 스키마 토픽 중 하나로 매핑합니다.
 *
 * 왜 필요한가:
 *   과거 기출 JSON 은 출제 세부 주제(예: "군집분석", "로지스틱 회귀", "상관계수")
 *   를 바로 topic 필드에 적어두었습니다. 반면 앱의 Zone/레슨 체계는
 *   SCHEMA 가 정의한 4개 대분류(예: "정형 데이터 마이닝") 기준으로 굴러갑니다.
 *   raw 토픽을 그대로 보여주면 Zone 에 수십 개 노드가 뜨고, 그 중 대부분이
 *   "레슨 준비 중" 화면으로 빠지게 됩니다. 아래 표는 그 간극을 메웁니다.
 *
 * 규칙:
 *   - raw 가 이미 스키마 토픽이면 그대로 통과
 *   - alias 테이블에 있으면 매핑된 스키마 토픽으로
 *   - 어디에도 없으면 null (= 소속 불명) — 챕터 랜덤 믹스에는 포함되지만
 *     토픽 노드/레슨 연결에는 쓰이지 않습니다
 */

import type { Subject } from '@/types/question';
import { SUBJECT_SCHEMAS } from './subjects';

type AliasTable = Record<number, Record<string, string>>;

/**
 * ADsP 알리아스 — 실제 JSON 에 등장한 세부 토픽 문자열을 전부 수집해 매핑.
 * 새 기출 JSON 을 추가해도 여기를 확장하면 자동으로 Zone 에 흡수됩니다.
 */
const ADSP_ALIAS: AliasTable = {
  1: {
    // 1-1 데이터의 이해
    'DIKW 피라미드': '데이터의 이해',
    '데이터의 유형과 특성': '데이터의 이해',
    '데이터 관련 개념 종합': '데이터의 이해',
    '데이터베이스': '데이터의 이해',
    '데이터베이스 특성': '데이터의 이해',
    'DBMS': '데이터의 이해',
    'OLTP/OLAP': '데이터의 이해',
    'SECI 모델': '데이터의 이해',
    // 1-2 데이터의 가치와 미래
    '빅데이터 개념': '데이터의 가치와 미래',
    '빅데이터 특징': '데이터의 가치와 미래',
    '빅데이터 출현 배경': '데이터의 가치와 미래',
    '빅데이터 본질적 변화': '데이터의 가치와 미래',
    '빅데이터 분석 기법': '데이터의 가치와 미래',
    '빅데이터 위기 요인': '데이터의 가치와 미래',
    '빅데이터 위기요인과 통제': '데이터의 가치와 미래',
    '빅데이터 활용': '데이터의 가치와 미래',
    '데이터 활용 사례': '데이터의 가치와 미래',
    '알고리즘 사례': '데이터의 가치와 미래',
    // 1-3 가치 창조를 위한 데이터 사이언스
    '개인정보 비식별화': '가치 창조를 위한 데이터 사이언스',
    '개인정보보호': '가치 창조를 위한 데이터 사이언스',
    '데이터 사이언티스트 역할': '가치 창조를 위한 데이터 사이언스',
  },
  2: {
    // 2-1 데이터 분석 기획의 이해
    '분석 기획 단계': '데이터 분석 기획의 이해',
    '분석 기획 유형': '데이터 분석 기획의 이해',
    '분석 기획 고려사항': '데이터 분석 기획의 이해',
    '분석 접근법': '데이터 분석 기획의 이해',
    '분석 과정': '데이터 분석 기획의 이해',
    'CRISP-DM': '데이터 분석 기획의 이해',
    '데이터 형태': '데이터 분석 기획의 이해',
    // 2-2 분석 마스터플랜
    '분석 마스터플랜': '분석 마스터플랜',
    '분석 과제 우선순위': '분석 마스터플랜',
    '과제 우선순위': '분석 마스터플랜',
    '분석 준비도': '분석 마스터플랜',
    '분석 성숙도': '분석 마스터플랜',
    '분석 수준 진단': '분석 마스터플랜',
    '데이터 거버넌스': '분석 마스터플랜',
    '분석 조직 구조': '분석 마스터플랜',
    '품질관리': '분석 마스터플랜',
    // 2-3 분석 과제 발굴
    '분석 과제 도출 유형': '분석 과제 발굴',
    '분석 과제 정의서': '분석 과제 발굴',
    '분석 과제 5요소': '분석 과제 발굴',
    '상향식·하향식 접근': '분석 과제 발굴',
    '하향식·상향식 접근': '분석 과제 발굴',
    '하향식 접근': '분석 과제 발굴',
    '탐색적 데이터 분석': '분석 과제 발굴',
  },
  3: {
    // 3-1 R 기초와 데이터 마트 (= 전처리·마트 영역)
    '결측값 처리': 'R 기초와 데이터 마트',
    '이상값 탐지': 'R 기초와 데이터 마트',
    '데이터 분할': 'R 기초와 데이터 마트',
    // 3-2 통계 분석
    '척도': '통계 분석',
    '기술통계': '통계 분석',
    '분포·기술통계': '통계 분석',
    '4분위수/IQR': '통계 분석',
    'Box Plot': '통계 분석',
    'EDA': '통계 분석',
    '탐색적 자료 분석': '통계 분석',
    '범주형 자료 분석': '통계 분석',
    '교차분석': '통계 분석',
    '기댓값 계산': '통계 분석',
    '공분산': '통계 분석',
    '상관계수': '통계 분석',
    '상관분석': '통계 분석',
    '상관관계 해석': '통계 분석',
    '주성분 분석': '통계 분석',
    '주성분 분석(PCA)': '통계 분석',
    '주성분 분석 해석': '통계 분석',
    '다차원 척도법': '통계 분석',
    '다차원 척도법(MDS)': '통계 분석',
    '시계열 분석': '통계 분석',
    '시계열 분해': '통계 분석',
    '정상 시계열': '통계 분석',
    'ARIMA': '통계 분석',
    '단순회귀': '통계 분석',
    '단순 선형회귀': '통계 분석',
    '다중 선형회귀': '통계 분석',
    '다중공선성': '통계 분석',
    '선형회귀 가정': '통계 분석',
    '변수 선택법': '통계 분석',
    '회귀 해석': '통계 분석',
    '회귀분석 해석': '통계 분석',
    '회귀 진단': '통계 분석',
    '표본추출': '통계 분석',
    '표본추출 방법': '통계 분석',
    '표본조사': '통계 분석',
    // 3-3 통계적 가설 검정
    '가설검정': '통계적 가설 검정',
    '통계적 추론': '통계적 가설 검정',
    '통계적 유의성': '통계적 가설 검정',
    '두 집단 평균 비교': '통계적 가설 검정',
    // 3-4 정형 데이터 마이닝
    '데이터 마이닝 프로세스': '정형 데이터 마이닝',
    '의사결정나무': '정형 데이터 마이닝',
    '인공신경망': '정형 데이터 마이닝',
    '활성화 함수': '정형 데이터 마이닝',
    '앙상블': '정형 데이터 마이닝',
    '로지스틱 회귀': '정형 데이터 마이닝',
    '분류 분석': '정형 데이터 마이닝',
    '분류 평가 지표': '정형 데이터 마이닝',
    '분류 성능지표': '정형 데이터 마이닝',
    'ROC 곡선': '정형 데이터 마이닝',
    '거리 측도': '정형 데이터 마이닝',
    '군집분석': '정형 데이터 마이닝',
    'K-means': '정형 데이터 마이닝',
    'SOM': '정형 데이터 마이닝',
    '계층적 군집': '정형 데이터 마이닝',
    '비지도 학습': '정형 데이터 마이닝',
    '연관분석': '정형 데이터 마이닝',
    '연관규칙': '정형 데이터 마이닝',
  },
};

/**
 * SQLD 알리아스 — 변형 기출(sqld-56.json) 의 raw subtopic 들을
 * 스키마 토픽 3개 (SQL 기본 / SQL 활용 / 관리 구문) + 모델링 2개로 매핑.
 */
const SQLD_ALIAS: AliasTable = {
  1: {
    // 1과목 — 모델링의 이해
    스키마: '데이터 모델링의 이해',
    '데이터 모델링': '데이터 모델링의 이해',
    '엔터티 분류': '데이터 모델링의 이해',
    엔터티: '데이터 모델링의 이해',
    ERD: '데이터 모델링의 이해',
    '속성 분류': '데이터 모델링의 이해',
    속성: '데이터 모델링의 이해',
    관계: '데이터 모델링의 이해',
    식별자: '데이터 모델링의 이해',
    키: '데이터 모델링의 이해',
    무결성: '데이터 모델링의 이해',
    // 1과목 — 모델과 성능
    정규화: '데이터 모델과 성능',
    '정규화/반정규화': '데이터 모델과 성능',
    반정규화: '데이터 모델과 성능',
    이상현상: '데이터 모델과 성능',
    '함수적 종속': '데이터 모델과 성능',
    트랜잭션: '데이터 모델과 성능',
    ACID: '데이터 모델과 성능',
    NULL: '데이터 모델과 성능',
    '본질식별자/인조식별자': '데이터 모델과 성능',
    '계층형 모델': '데이터 모델과 성능',
    상호배타: '데이터 모델과 성능',
  },
  2: {
    // 2-1 SQL 기본
    'SQL 명령어': 'SQL 기본',
    '명령어 분류': 'SQL 기본',
    '관계대수': 'SQL 기본',
    '실행 순서': 'SQL 기본',
    '연산자 우선순위': 'SQL 기본',
    ALIAS: 'SQL 기본',
    DISTINCT: 'SQL 기본',
    '문자열 연결': 'SQL 기본',
    '문자함수': 'SQL 기본',
    '숫자함수': 'SQL 기본',
    '날짜함수': 'SQL 기본',
    '변환함수': 'SQL 기본',
    '집계함수': 'SQL 기본',
    'COUNT/DISTINCT': 'SQL 기본',
    'COUNT/IN+NULL': 'SQL 기본',
    'NULL 분기': 'SQL 기본',
    'NULL 함수': 'SQL 기본',
    COALESCE: 'SQL 기본',
    NVL: 'SQL 기본',
    CASE: 'SQL 기본',
    DECODE: 'SQL 기본',
    'WHERE': 'SQL 기본',
    LIKE: 'SQL 기본',
    BETWEEN: 'SQL 기본',
    IN: 'SQL 기본',
    'GROUP BY': 'SQL 기본',
    HAVING: 'SQL 기본',
    'GROUP BY/ORDER BY': 'SQL 기본',
    'ORDER BY': 'SQL 기본',
    'AVG/MIN': 'SQL 기본',
    'NULL/공집합': 'SQL 기본',
    'JOIN/조건': 'SQL 기본',
    'COUNT/DISTINCT/GROUP BY': 'SQL 기본',
    // 2-2 SQL 활용
    JOIN: 'SQL 활용',
    'JOIN 종류': 'SQL 활용',
    'INNER JOIN': 'SQL 활용',
    'OUTER JOIN': 'SQL 활용',
    'NATURAL JOIN': 'SQL 활용',
    'CROSS JOIN': 'SQL 활용',
    '셀프 조인': 'SQL 활용',
    '서브쿼리': 'SQL 활용',
    '상호연관 서브쿼리': 'SQL 활용',
    EXISTS: 'SQL 활용',
    'NOT IN / NULL': 'SQL 활용',
    '집합 연산자': 'SQL 활용',
    UNION: 'SQL 활용',
    INTERSECT: 'SQL 활용',
    MINUS: 'SQL 활용',
    'ROLLUP': 'SQL 활용',
    'CUBE': 'SQL 활용',
    'GROUPING SETS': 'SQL 활용',
    'GROUPING/ROLLUP': 'SQL 활용',
    '그룹 함수': 'SQL 활용',
    '그룹 함수 - ROLLUP': 'SQL 활용',
    '그룹 함수 - GROUPING SETS': 'SQL 활용',
    '그룹 함수 - CUBE': 'SQL 활용',
    '윈도우 함수': 'SQL 활용',
    '윈도우 함수 순위': 'SQL 활용',
    'RANK/DENSE_RANK': 'SQL 활용',
    'ROW_NUMBER': 'SQL 활용',
    'PERCENT_RANK': 'SQL 활용',
    'LAG/LEAD': 'SQL 활용',
    'FIRST_VALUE/KEEP': 'SQL 활용',
    'TOP N': 'SQL 활용',
    'TOP 5': 'SQL 활용',
    'ROWNUM': 'SQL 활용',
    'FETCH FIRST': 'SQL 활용',
    'WITH TIES': 'SQL 활용',
    PIVOT: 'SQL 활용',
    UNPIVOT: 'SQL 활용',
    '계층형 질의': 'SQL 활용',
    PRIOR: 'SQL 활용',
    'CONNECT BY': 'SQL 활용',
    '정규표현식': 'SQL 활용',
    '정규식': 'SQL 활용',
    REGEXP_SUBSTR: 'SQL 활용',
    REGEXP_INSTR: 'SQL 활용',
    REGEXP_LIKE: 'SQL 활용',
    REGEXP_REPLACE: 'SQL 활용',
    '팀별 최단신 (스칼라 서브쿼리)': 'SQL 활용',
    // 2-3 관리 구문
    DML: '관리 구문',
    INSERT: '관리 구문',
    UPDATE: '관리 구문',
    DELETE: '관리 구문',
    MERGE: '관리 구문',
    DDL: '관리 구문',
    'CREATE TABLE': '관리 구문',
    ALTER: '관리 구문',
    DROP: '관리 구문',
    TRUNCATE: '관리 구문',
    제약조건: '관리 구문',
    PK: '관리 구문',
    FK: '관리 구문',
    UNIQUE: '관리 구문',
    'NOT NULL': '관리 구문',
    CHECK: '관리 구문',
    DEFAULT: '관리 구문',
    DCL: '관리 구문',
    GRANT: '관리 구문',
    REVOKE: '관리 구문',
    'WITH GRANT OPTION': '관리 구문',
    'WITH ADMIN OPTION': '관리 구문',
    TCL: '관리 구문',
    COMMIT: '관리 구문',
    ROLLBACK: '관리 구문',
    SAVEPOINT: '관리 구문',
    'TCL/SAVEPOINT': '관리 구문',
    AUTOCOMMIT: '관리 구문',
  },
};

const SUBJECT_ALIAS: Record<Subject, AliasTable> = {
  adsp: ADSP_ALIAS,
  sqld: SQLD_ALIAS,
};

/** 문제 은행의 raw 토픽 → 스키마 토픽. 실패 시 null. */
export function canonicalTopic(
  subject: Subject,
  chapter: number,
  rawTopic: string,
): string | null {
  const schema = SUBJECT_SCHEMAS[subject];
  const chapterMeta = schema.chapters.find((c) => c.chapter === chapter);
  if (!chapterMeta) return null;
  if (chapterMeta.topics.includes(rawTopic)) return rawTopic;
  const alias = SUBJECT_ALIAS[subject][chapter];
  const mapped = alias?.[rawTopic];
  if (mapped && chapterMeta.topics.includes(mapped)) return mapped;
  return null;
}

/**
 * 한 문제가 특정 스키마 토픽에 속하는지 빠르게 판정.
 * 필터에 자주 쓰여서 편의 래퍼로 제공.
 */
export function matchesCanonical(
  subject: Subject,
  chapter: number,
  rawTopic: string,
  targetCanonical: string,
): boolean {
  return canonicalTopic(subject, chapter, rawTopic) === targetCanonical;
}

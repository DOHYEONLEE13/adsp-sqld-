/**
 * reminders.ts — N회독 진입 시 노출되는 짧은 개념 리마인더 모음.
 *
 * 정책:
 *   - 1회독: 사용. 처음 학습이라 dialogue + 전체 blocks 풀로 노출.
 *   - 2회독+: dialogue/blocks 대신 짧은 reminder 카드 먼저 → "전체 보기" 토글로 풀 콘텐츠.
 *
 * 매핑 키: stepId (LessonStep.id). 미등록 step 은 dialogue 첫 turn 으로 UI 측 fallback.
 *
 * 작성 원칙:
 *   - 헤드라인: "이거 기억나?" 톤. 한 줄. 친근.
 *   - summary: 2~3 문장. 핵심만. 처음 가르치는 톤 X.
 *   - keyPoints: 3~5 불릿. 공식·암기법·핵심 단어.
 *
 * 점진 추가: 신규 챕터·step 의 reminder 는 이 파일에 push. 사용자가 못 본 step
 * 도 자연스럽게 dialogue 첫 turn 으로 fallback 되므로 부담 없이 점진 출시.
 */

import type { ConceptReminder } from './lessons';

export const REMINDERS: Record<string, ConceptReminder> = {
  // ── ADSP Ch1 Topic 1 — 데이터의 이해 ─────────────────────
  'adsp-1-1-s1': {
    headline: 'DIKW 피라미드, 기억나?',
    summary:
      '아래로 갈수록 양은 많고 가치는 낮아. 위로 갈수록 의사결정에 바로 쓰여. Data → Information → Knowledge → Wisdom.',
    keyPoints: [
      'D = 가공 안 된 raw 값 (예: 매출 1,237만원)',
      'I = 데이터에 의미·관계 부여 (예: 어제 대비 12% ↑)',
      'K = 일반화된 규칙 (예: 비 오면 매출 30% ↓)',
      'W = 상황 적용·판단 (예: 비 예보 → 우산 매대 이동)',
      '암기법: 데정지혜',
    ],
  },
  'adsp-1-1-s2': {
    headline: '데이터 분류 3종, 기억나?',
    summary:
      '스키마(틀) 의 유무로 나눠. 스키마 있음 = 구조화. 메타구조만 있음 = 반구조화. 없음 = 비구조화.',
    keyPoints: [
      '구조화: 엑셀, RDB 테이블, CSV',
      '반구조화: JSON, XML, 로그 (키-값 메타구조 + 자유 본문)',
      '비구조화: 음성, 이미지, 영상, 자유 텍스트',
      '핵심: 정형 = on-write, 비정형 = on-read 가공 필요',
    ],
  },
  'adsp-1-1-s3': {
    headline: 'SECI 모델 4단계, 기억나?',
    summary:
      '암묵·형식 지식 사이의 변환 사이클이야. 4단계가 [사 외 결 내] 순서로 도는 게 핵심.',
    keyPoints: [
      '사회화 (S): 암묵 → 암묵 (도제식 견습)',
      '외부화 (E): 암묵 → 형식 (위키·문서로 정리)',
      '결합 (C): 형식 → 형식 (여러 문서 → 새 문서)',
      '내면화 (I): 형식 → 암묵 (읽고 체득)',
      '암기법: 사외결내',
    ],
  },
  'adsp-1-1-s4': {
    headline: 'DBMS · DW · 데이터 레이크 차이, 기억나?',
    summary:
      '저장 스키마 시점과 데이터 형태가 달라. DBMS = 즉시 거래. DW = 분석용 정형. Data Lake = 원본 그대로 저장 후 사용 시점에 구조화.',
    keyPoints: [
      'DBMS (OLTP): 트랜잭션·실시간 거래',
      'DW (OLAP): 정형·통합·분석 — Schema-on-Write',
      'Data Lake: 정형·반·비정형 원본 저장 — Schema-on-Read',
      '데이터 마트: DW 의 부서·주제별 단편',
    ],
  },
  'adsp-1-1-s5': {
    headline: '기업 정보 시스템 5종, 기억나?',
    summary:
      '각자 다른 영역을 책임져. 사례로 매칭하면 빠르게 구분돼.',
    keyPoints: [
      'DBMS: 데이터 저장·관리 인프라',
      'ERP: 회계·인사·생산 등 내부 자원 통합',
      'CRM: 고객 접점·마케팅·캠페인',
      'SCM: 공급망 (자재 → 생산 → 물류)',
      'BI: 의사결정 지원 — 리포트·대시보드',
    ],
  },

  // ── ADSP Ch1 Topic 2 — 데이터의 가치와 미래 ─────────────
  'adsp-1-2-s1': {
    headline: '빅데이터 3V, 기억나?',
    summary:
      'Volume·Velocity·Variety. 5V 로 확장 시 Veracity·Value 가 추가돼. 가짜 V 인 Veracity 가 자주 함정.',
    keyPoints: [
      'Volume: 데이터의 총량 (TB·PB 단위)',
      'Velocity: 생성·전달 속도 (분당 N건)',
      'Variety: 형태 다양성 (정·반·비정형)',
      '5V 추가: Veracity (정확성), Value (가치)',
    ],
  },
  'adsp-1-2-s2': {
    headline: '데이터 가치 측정 어려움, 기억나?',
    summary:
      '데이터 가치는 분석 기법·관점·시점에 따라 달라져 단위당 가격이 안 정해져. 재사용·결합·공개 시점에 가치가 드러남.',
    keyPoints: [
      '재사용 — 같은 데이터로 여러 분석',
      '결합 — 다른 데이터와 합쳐 가치 ↑',
      '시점·관점 — 누가 언제 쓰느냐에 따라 다름',
      '단위당 시장가 X — 가치 측정 본질적으로 어려움',
    ],
  },
  'adsp-1-2-s3': {
    headline: '데이터 3법 개정 (2020-08), 기억나?',
    summary:
      '핵심은 "가명정보" 도입. 통계·연구·공익 목적엔 동의 없이 활용 가능해진 게 핵심 변화.',
    keyPoints: [
      '개인정보보호법 + 정보통신망법 + 신용정보법 = 3법',
      '신설 [가명정보] = 추가정보 결합 시 식별 가능',
      '익명정보 = 결합해도 식별 불가 (자유 활용)',
      '가명정보 활용 목적: 통계·과학적 연구·공익적 기록',
    ],
  },
  'adsp-1-2-s4': {
    headline: '가명 vs 익명 정보, 기억나?',
    summary:
      '재식별 가능성으로 갈려. 가명정보는 [추가정보 결합] 으로 식별 가능, 익명정보는 결합해도 식별 불가.',
    keyPoints: [
      '개인정보: 그 자체로 식별 가능 — 동의 필요',
      '가명정보: 결합 시 재식별 가능 — 통계·연구 목적 동의 면제',
      '익명정보: 결합해도 식별 불가 — 자유 활용',
      '핵심 변수: 재식별 가능성 (있음·조건부·없음)',
    ],
  },

  // ── ADSP Ch1 Topic 3 — 가치 창조 데이터 사이언스 ─────────
  'adsp-1-3-s1': {
    headline: '데이터 사이언스 vs 통계학, 기억나?',
    summary:
      '데이터 사이언스 = 비즈니스 문제 정의부터 의사결정자 전달까지 [총체적]. 통계학은 분석 단계의 엄밀성에 집중.',
    keyPoints: [
      '데이터 사이언스 = Holistic 접근',
      '문제 정의 → 데이터 수집 → 분석 → 시각화 → 전달',
      '통계학 = 표본 추출·가설검정 등 분석 엄밀성',
      '데이터 사이언스 ⊃ 통계학 (포함 관계)',
    ],
  },
  'adsp-1-3-s2': {
    headline: '데이터 사이언티스트 역량 (Hard·Soft), 기억나?',
    summary:
      'Hard 는 분석·툴·기술. Soft 는 통찰·소통·창의·시각화. 둘 다 필요하지만 상위 사이언티스트일수록 Soft 비중 ↑.',
    keyPoints: [
      'Hard: 통계, 머신러닝, SQL/Python/R, 분산 시스템',
      'Soft: 호기심·통찰, 스토리텔링·시각화, 다분야 협업',
      'IT·도메인·소통 3축',
      '시각화·설득력이 의사결정 영향력의 핵심',
    ],
  },
  'adsp-1-3-s3': {
    headline: '7대 역량 DIGITAL CAMERA, 기억나?',
    summary:
      'D-I-G-I-T-A-L 이 아니라 7대 역량 알파벳을 아우르는 암기 약자. C·A·M·E·R·A·I 매핑이 핵심.',
    keyPoints: [
      'C: Communication (소통)',
      'A: Art / Analytical (시각화·분석적)',
      'M: Math (수학·통계)',
      'E: Engineering (도구·시스템)',
      'R: R / 분석 언어',
      'I: Insight (호기심 기반 통찰)',
    ],
  },
};

/** stepId 로 reminder 조회. 없으면 undefined → UI 측 fallback. */
export function getReminder(stepId: string): ConceptReminder | undefined {
  return REMINDERS[stepId];
}

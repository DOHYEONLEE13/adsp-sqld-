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
  'adsp-1-1-s1-data': {
    headline: 'DIKW ① 데이터, 기억나?',
    summary: '가공 전 raw 측정값. 비교·해석·맥락이 아직 안 붙은 단계야.',
    keyPoints: [
      '단일 값만 등장 ("1,500원", "68.4kg")',
      '"그래서 뭐?" 가 아직 빠져 있음',
      '식별 키워드: 측정·관찰·기록 그 자체',
      '비교가 시작되면 다음 단계(정보)',
    ],
  },
  'adsp-1-1-s1-info': {
    headline: 'DIKW ② 정보, 기억나?',
    summary: '여러 데이터를 비교·집계해 "그래서 뭐" 가 드러난 단계. 점들을 잇는 선.',
    keyPoints: [
      '비교·집계·맥락 부여 ("이번 주 14% ↑")',
      '한 번의 비교 결과까지가 정보',
      '"다음에도 통할 룰" 로 굳어지면 다음(지식)',
      '식별: "이번엔 ~가 더 ~하다"',
    ],
  },
  'adsp-1-1-s1-knowledge': {
    headline: 'DIKW ③ 지식, 기억나?',
    summary: '정보가 모여 "다음에도 통할 룰" 로 굳은 단계. 반복 가능한 의사결정용 패턴.',
    keyPoints: [
      '일반화된 규칙·패턴 ("콜라는 B마트가 유리")',
      '여러 번의 정보 → 룰',
      '식별: "~할 때는 ~한다", "보통 ~다"',
      '본 적 없는 영역으로 확장하면 지혜',
    ],
  },
  'adsp-1-1-s1-wisdom': {
    headline: 'DIKW ④ 지혜, 기억나?',
    summary: '검증된 지식을 직접 본 적 없는 새 영역으로 확장하는 창의적 추론.',
    keyPoints: [
      '확장·미루어 추론 ("콜라가 싸니 음료 전반도")',
      '같은 영역 룰이면 지식, 새 영역 추론이면 지혜',
      '식별 키워드: 통찰·창의·확장 추론',
      '시험 단골 답: "창의적 아이디어"',
    ],
  },
  'adsp-1-1-s2': {
    headline: '데이터 분류 3축, 기억나?',
    summary:
      '같은 데이터를 [구조·형태·값] 3가지 다른 질문으로 분류해. 한 데이터에 답이 3개 동시에 붙는 게 핵심.',
    keyPoints: [
      '구조: 정형 / 반정형 / 비정형 — 정리 형태',
      '형태: 정량 / 정성 — 숫자 vs 말',
      '값: 수치 / 범주 — 산수의 의미',
      '함정: 정성적 = 비정형 X (학점 같은 정성+정형 가능)',
    ],
  },
  'adsp-1-1-s2-structure': {
    headline: '구조 — 정형/반정형/비정형, 기억나?',
    summary: '"행·열 표에 들어가나?" 질문의 답. 미리 정해진 틀이 있으면 정형, 항목 이름만 있고 모양이 자유면 반정형, 틀 자체가 없으면 비정형.',
    keyPoints: [
      '정형: 엑셀·RDB 테이블·CSV',
      '반정형: JSON·XML·HTML·로그 (키-값 메타구조)',
      '비정형: 음성·이미지·영상·자유 텍스트',
      '컴퓨터 처리 난도: 정형 < 반정형 < 비정형',
    ],
  },
  'adsp-1-1-s2-form': {
    headline: '형태 — 정량/정성, 기억나?',
    summary: '"숫자로 잴 수 있나?" 질문의 답. 측정 단위가 명확하면 정량, 말·감정·서술이면 정성.',
    keyPoints: [
      '정량: 키 175cm·매출 300만 — 평균·합계 의미',
      '정성: 인터뷰·리뷰·만족도 등급',
      '함정: 정성+정형 가능 (학점 A·B·C)',
      '판별 팁: "더하기·평균이 의미가 있나?"',
    ],
  },
  'adsp-1-1-s2-value': {
    headline: '값 — 수치/범주, 기억나?',
    summary: '"이 값에 산수가 의미 있나?" 질문의 답. 크기·차이가 의미 있으면 수치형, 라벨·카테고리면 범주형.',
    keyPoints: [
      '수치형: 이산(학생 수)·연속(키 175.3cm)',
      '범주형: 명목(혈액형)·순서(학점)',
      '함정: 1=서울, 2=부산 코드도 범주형',
      '판별: 평균이 말이 되면 수치, 안 되면 범주',
    ],
  },
  'adsp-1-1-s3': {
    headline: 'SECI 4단계, 기억나?',
    summary:
      '암묵지(몸 노하우) ↔ 형식지(글) 사이를 4단계로 순환. 공동화 → 표출화 → 연결화 → 내면화. 암기법 [공표연내].',
    keyPoints: [
      'S(공동화): 암묵 → 암묵 (어깨너머·OJT)',
      'E(표출화): 암묵 → 형식 (노하우를 매뉴얼로)',
      'C(연결화): 형식 → 형식 (여러 자료 종합)',
      'I(내면화): 형식 → 암묵 (매뉴얼 따라하다 체화)',
      '암기법: 공표연내',
    ],
  },
  'adsp-1-1-s3-S': {
    headline: 'SECI ① 공동화, 기억나?',
    summary: '암묵지 → 암묵지. 글 없이 몸·머리에서 직접 전수되는 단계. OJT·도제식이 전형.',
    keyPoints: [
      '신입이 사수 옆에서 어깨너머 학습',
      '키워드: OJT·견습·동행·암묵→암묵',
      '문서·매뉴얼이 등장하면 다른 단계',
      '공통점: 같이 있어야만 전해짐',
    ],
  },
  'adsp-1-1-s3-E': {
    headline: 'SECI ② 표출화, 기억나?',
    summary: '암묵지 → 형식지. 사람 안의 노하우를 처음으로 글·도식으로 꺼내는 단계. 4단계 중 시험 1순위.',
    keyPoints: [
      '40년 장인의 비법 → 작업 매뉴얼화',
      '키워드: "노하우를 매뉴얼로", "비법 가이드북"',
      '암묵 → 형식 방향 (반대는 내면화)',
      '조직 자산화의 결정적 단계',
    ],
  },
  'adsp-1-1-s3-C': {
    headline: 'SECI ③ 연결화, 기억나?',
    summary: '형식지 → 형식지. 이미 글로 된 자료들을 결합·재구성해 새 자료를 만드는 단계. 글 → 글 변환.',
    keyPoints: [
      '여러 부서 보고서 → 전사 백서',
      '여러 논문 → 종합 리뷰 페이퍼',
      '키워드: 종합·통합·재구성',
      '사람 머리에서 처음 꺼내면 표출화',
    ],
  },
  'adsp-1-1-s3-I': {
    headline: 'SECI ④ 내면화, 기억나?',
    summary: '형식지 → 암묵지. 매뉴얼·교본을 반복 적용하다 손에 익는 단계. 표출화의 반대 방향.',
    keyPoints: [
      '매뉴얼대로 6개월 연습 → 손에 익음',
      '키워드: 체화·숙련·매뉴얼 → 자동',
      '글 → 사람 안 (반대: 표출화)',
      'SECI 한 바퀴 마무리 — 새 암묵지 탄생',
    ],
  },
  'adsp-1-1-s4': {
    headline: 'DB 5특징 "공통저변+실시간", 기억나?',
    summary: '엑셀과 DB 를 가르는 5가지. 공용·통합·저장·변화 + 실시간 처리. 약자 [공통저변].',
    keyPoints: [
      '공용: 여러 사용자가 동시 공유',
      '통합: 중복 최소화',
      '저장: 영속 (전원 꺼져도 유지)',
      '변화: 수정 즉시 반영',
      '실시간: 빠른 응답',
    ],
  },
  'adsp-1-1-s4-dw': {
    headline: 'DW (Data Warehouse), 기억나?',
    summary: '운영 데이터를 ETL 후 주제별·시간별로 정돈한 분석 창고. OLAP·BI 가 사용. 정형 데이터 중심.',
    keyPoints: [
      'ETL = Extract → Transform → Load',
      '주제별 정돈: 매출·고객·재고 단위로 분리',
      'Schema-on-Write (저장 시 구조 결정)',
      'OLAP·BI 분석용 (읽기 위주)',
    ],
  },
  'adsp-1-1-s4-lake': {
    headline: 'Data Lake, 기억나?',
    summary: '정제 전 원시 데이터까지 다 담는 저수지. 정형·반정형·비정형 모두 raw 저장 후 사용 시점에 구조 부여.',
    keyPoints: [
      'Schema-on-Read (분석 시 구조 적용)',
      '비정형(이미지·로그·영상) 까지 보관',
      'OLTP vs OLAP: 거래 vs 분석',
      'DW = 정형 분석, Lake = raw 저장',
    ],
  },
  'adsp-1-1-s5': {
    headline: '기업 정보 시스템 5종, 기억나?',
    summary:
      '각자 다른 영역을 책임져. ERP(전사) → CRM(고객) → SCM(공급사슬) → BI(의사결정), 모두 DBMS 위에서 작동.',
    keyPoints: [
      'DBMS: 데이터 저장·관리 인프라',
      'ERP: 회계·인사·생산 등 내부 자원 통합',
      'CRM: 고객 접점·마케팅·캠페인',
      'SCM: 공급망 (자재 → 생산 → 물류)',
      'BI: 의사결정 지원 — 리포트·대시보드',
    ],
  },
  'adsp-1-1-s5-dbms': {
    headline: 'DBMS, 기억나?',
    summary: '모든 정보 시스템의 기반. 데이터베이스의 생성·조회·수정·백업을 담당하는 소프트웨어.',
    keyPoints: [
      '대표: Oracle·MySQL·PostgreSQL',
      'ERP·CRM·SCM·BI 모두 DBMS 위에서 작동',
      '특정 비즈니스 영역에 묶이지 않은 인프라',
      '키워드: "DB 관리 SW"',
    ],
  },
  'adsp-1-1-s5-erp': {
    headline: 'ERP, 기억나?',
    summary: 'Enterprise Resource Planning. 생산·판매·재무·인사를 하나의 시스템으로 통합 — 전사 자원 관리.',
    keyPoints: [
      '대표: SAP·Oracle ERP',
      '키워드: "전사 자원 통합", "내부 부서 통합"',
      '고객만이면 CRM, 공급사슬만이면 SCM',
      '회사 안쪽(internal) 통합이 핵심',
    ],
  },
  'adsp-1-1-s5-crm': {
    headline: 'CRM, 기억나?',
    summary: 'Customer Relationship Management. 고객 이력·구매·접점 데이터로 맞춤 마케팅·서비스 제공.',
    keyPoints: [
      '대표: Salesforce',
      '키워드: "고객 관리", "맞춤 마케팅", "캠페인"',
      '회사 바깥(고객 접점) 이 핵심',
      '재고·물류면 SCM, 의사결정 시각화면 BI',
    ],
  },
  'adsp-1-1-s5-scm': {
    headline: 'SCM, 기억나?',
    summary: 'Supply Chain Management. 원자재 조달 → 생산 → 유통 공급사슬 전체 통합 관리. 협력사 정보 공유 핵심.',
    keyPoints: [
      '키워드: "공급사슬 최적화", "조달·재고·물류"',
      '재고·납기·비용 동시 최적화',
      '고객 접점이면 CRM, 전사 통합이면 ERP',
      '협력사·파트너와의 데이터 공유가 차별점',
    ],
  },
  'adsp-1-1-s5-bi': {
    headline: 'BI, 기억나?',
    summary: 'Business Intelligence. 쌓인 데이터를 다차원 분석·리포트·대시보드로 가공 → 경영 의사결정 지원.',
    keyPoints: [
      '대표: Tableau·Power BI·Looker',
      '키워드: "대시보드", "리포트", "의사결정 지원"',
      '데이터 → 의사결정자 전달이 목표',
      '운영 통합 ERP, 고객 CRM 과 다른 축(분석)',
    ],
  },

  // ── ADSP Ch1 Topic 2 — 데이터의 가치와 미래 ─────────────
  'adsp-1-2-s1': {
    headline: '빅데이터 3V + 단위, 기억나?',
    summary:
      '가트너의 정의 = Volume·Variety·Velocity. 5V 로 확장 시 Value(가치)·Veracity(진실성) 추가. 단위는 KB→...→YB 단계마다 1024배.',
    keyPoints: [
      'Volume: 데이터의 절대 양 (TB·PB·EB)',
      'Variety: 형태 다양성 (정·반·비정형 혼재)',
      'Velocity: 생성·처리 속도 (실시간·스트리밍)',
      '단위: KB→MB→GB→TB→PB→EB→ZB→YB',
      '5V/7V 확장: +Value +Veracity (+Validity +Volatility)',
    ],
  },
  'adsp-1-2-s1-volume': {
    headline: '3V ① Volume, 기억나?',
    summary: '"양이 너무 많다" — PB 이상 규모로 한 대 컴퓨터로 못 다뤄 분산처리 필요해진 상태.',
    keyPoints: [
      '엑셀·단일 MySQL 한계 초과',
      '분산저장(HDFS) + 분산처리(Hadoop·Spark)',
      '키워드: PB·EB, 분산, 규모',
      '형태 다양 → Variety, 빠르다 → Velocity',
    ],
  },
  'adsp-1-2-s1-variety': {
    headline: '3V ② Variety, 기억나?',
    summary: '"형태가 제각각" — 정형+반정형+비정형이 한 시스템에 동시 입력. 단순히 양이 많은 게 아니라 형태 다양성이 핵심.',
    keyPoints: [
      '정형(DB) + 반정형(JSON·로그) + 비정형(영상)',
      '쇼핑몰: 회원DB+클릭로그+이미지+리뷰+통화',
      '키워드: 다양·혼재·여러 출처',
      '한 가지 형태만 많으면 Variety 아님',
    ],
  },
  'adsp-1-2-s1-velocity': {
    headline: '3V ③ Velocity, 기억나?',
    summary: '"쉴 새 없이 들어온다" — 배치(저녁에 모아서) 가 안 통하는 실시간·스트리밍 처리 필요.',
    keyPoints: [
      '실시간 (ms~초 단위 응답)',
      '카드 사기 탐지·자율주행·알고리즘 트레이딩',
      '도구: Kafka·Flink (스트리밍 엔진)',
      '키워드: 실시간·스트리밍·즉시',
    ],
  },
  'adsp-1-2-s2': {
    headline: '빅데이터 변화 4축, 기억나?',
    summary:
      '빅데이터로 분석 패러다임이 4축에서 뒤집혔어. 표본→전수, 질→양, 인과→상관, 이론→데이터.',
    keyPoints: [
      '규모: 표본(Sample) → 전수(Population)',
      '품질: 질(Quality) → 양(Quantity)',
      '관점: 인과(Causation) → 상관(Correlation)',
      '접근: 이론 기반 → 데이터 기반',
    ],
  },
  'adsp-1-2-s2-scale': {
    headline: '변화 ① 표본 → 전수, 기억나?',
    summary: '저장·연산 비용 하락으로 모집단 전체(전수) 를 다룰 수 있게 된 변화.',
    keyPoints: [
      '이전: 통계 표본 추출 후 추정',
      '이후: 전수 자체를 그대로 분석',
      '키워드: Sample → Population',
      '품질·관점·접근 축은 별도',
    ],
  },
  'adsp-1-2-s2-quality': {
    headline: '변화 ② 질 → 양, 기억나?',
    summary: '깔끔한 소수 데이터보다 잡음 섞여도 풍부한 다량으로 패턴을 찾는 쪽으로 무게 이동.',
    keyPoints: [
      '이전: 정성스럽게 모은 작은 깨끗한 데이터',
      '이후: 잡음 섞여도 압도적 양',
      '키워드: Quality → Quantity',
      '규모 축(표본/전수) 과 별개',
    ],
  },
  'adsp-1-2-s2-corr': {
    headline: '변화 ③ 인과 → 상관, 기억나?',
    summary: '"왜?" 의 인과를 밝히지 않고도 "함께 움직인다" 의 상관만으로 의사결정 가능해짐.',
    keyPoints: [
      '이전: 원인 → 결과 인과관계 증명',
      '이후: 동시 변화 패턴(상관) 으로 충분',
      '키워드: Causation → Correlation',
      '"원인 무관" 이 아니라 "상관만으로도 가능"',
    ],
  },
  'adsp-1-2-s2-data': {
    headline: '변화 ④ 이론 → 데이터, 기억나?',
    summary: '가설을 먼저 세우고 데이터로 검증하던 방식에서, 데이터에서 직접 패턴을 발굴하는 데이터 기반 접근으로.',
    keyPoints: [
      '이전: 이론·가설 우선 → 데이터로 검증',
      '이후: 데이터에서 직접 패턴 발굴',
      '키워드: Theory → Data-driven',
      '인과/상관 축과 혼동 주의',
    ],
  },
  'adsp-1-2-s3': {
    headline: '데이터 3법 "개정신", 기억나?',
    summary:
      '개인정보보호법 + 정보통신망법 + 신용정보법 = 3법. 2020-08 개정 핵심은 "가명정보" 도입 — 통계·연구·공익 목적엔 동의 없이 활용 가능.',
    keyPoints: [
      '개인정보: 직접 식별 — 동의 필요',
      '가명정보(신설): 추가정보 결합 시 식별',
      '익명정보: 결합해도 식별 불가',
      '암기법: 개·정·신',
    ],
  },
  'adsp-1-2-s3-pipa': {
    headline: '① 개인정보보호법, 기억나?',
    summary: '모든 개인정보 처리에 적용되는 일반법. 정보주체 동의·열람·정정·삭제 권리, 처리자 안전조치 의무 규정.',
    keyPoints: [
      '키워드: 일반법, 동의 원칙',
      '정보주체의 4대 권리(동의·열람·정정·삭제)',
      '통신서비스 → 정보통신망법',
      '신용정보 → 신용정보법',
    ],
  },
  'adsp-1-2-s3-net': {
    headline: '② 정보통신망법, 기억나?',
    summary: '웹사이트·앱·SNS 같은 정보통신서비스 제공자의 개인정보 보호 의무·이용자 보호 조치 규정.',
    keyPoints: [
      '대상: 정보통신서비스 제공자 (웹·앱·SNS)',
      '키워드: 이용자 보호·온라인 서비스',
      '일반 처리는 개인정보보호법',
      '신용정보는 신용정보법',
    ],
  },
  'adsp-1-2-s3-credit': {
    headline: '③ 신용정보법, 기억나?',
    summary: '금융거래·신용평가에 쓰이는 신용정보 처리 규제. 마이데이터(본인신용정보관리업) 의 근거 법.',
    keyPoints: [
      '대상: 금융·신용 영역 (은행·카드·금융기관)',
      '키워드: 신용평가·신용정보집중기관',
      '마이데이터의 법적 근거',
      '일반 개인정보 → 개인정보보호법',
    ],
  },
  'adsp-1-2-s4': {
    headline: '빅데이터 비유 4종 + 위기·대응, 기억나?',
    summary:
      '비유 4가지(석탄·원유·렌즈·플랫폼) + 위기 3가지(사생활·책임·오용) + 대응(동의→책임). 시험 단골 매칭 문제.',
    keyPoints: [
      '비유: 석탄(원동력)·원유(정제)·렌즈(관찰)·플랫폼(토대)',
      '위기 ① 사생활 침해 → 동의제→책임제 전환',
      '위기 ② 책임원칙 훼손 → 결과 기반 책임원칙',
      '위기 ③ 데이터 오용·과신 → 알고리즘 접근·감사',
    ],
  },

  // ── ADSP Ch1 Topic 3 — 가치 창조 데이터 사이언스 ─────────
  'adsp-1-3-s1': {
    headline: 'DS 핵심 3축 "AI 비", 기억나?',
    summary:
      '데이터 사이언스의 3꼭짓점 = Analytics(분석) + IT(정보기술) + Business(비즈니스). 첫 글자 [AI 비] 로 외움. 통계학보다 훨씬 넓은 판.',
    keyPoints: [
      'A nalytics — 통계·머신러닝·모델링',
      'I T — 도구·시스템·인프라·데이터 엔지니어링',
      'B usiness — 도메인 이해·문제 정의·의사결정 연결',
      '3꼭짓점의 교집합에서 데이터 사이언스 탄생',
    ],
  },
  'adsp-1-3-s2': {
    headline: 'Hard Skill vs Soft Skill, 기억나?',
    summary:
      'Hard = 배워서 익히는 기술 (모델·SQL·코딩). Soft = 태도·관점·소통 (통찰·스토리텔링·협력). 시험은 어느 쪽인지 매칭을 자주 묻는다.',
    keyPoints: [
      'Hard: 빅데이터 이론·기법, 분석 도구 숙련',
      'Soft: 통찰력, 시각화·커뮤니케이션, 협력',
      '핵심: "기술 vs 태도" 로 갈림',
      '상위 사이언티스트일수록 Soft 비중 ↑',
    ],
  },
  'adsp-1-3-s3': {
    headline: 'DS 6역량 "Digital CA메라", 기억나?',
    summary:
      '데이터 사이언티스트 6대 역량 = C·A·M·E·R·A. Communication·Analytics·Math·Engineering·Research·Art.',
    keyPoints: [
      'C: Communication (전달·시각화)',
      'A: Analytics (도메인 + 분석 기법)',
      'M: Math (수학·통계·확률)',
      'E: Engineering (시스템·코드·인프라)',
      'R: Research (새 가설·기법 탐구)',
      'A: Art (창의·디자인·통찰) — 함정: Management 아님',
    ],
  },
  'adsp-1-3-s3-c': {
    headline: '6역량 ① Communication, 기억나?',
    summary: '분석 결과를 비즈니스 청중에 맞게 풀어내는 전달력. 시각화·스토리텔링·발표.',
    keyPoints: [
      '키워드: 전달·스토리텔링·발표',
      '분석 결과 → 의사결정자에게 연결',
      '통계·수식이면 Math',
      '시스템·코드면 Engineering',
    ],
  },
  'adsp-1-3-s3-a': {
    headline: '6역량 ② Analytics, 기억나?',
    summary: '도메인 이해 + 분석 기법 선택 능력. 어떤 비즈니스 문제에 어떤 모델·기법이 맞는지 판단.',
    keyPoints: [
      '키워드: 도메인 + 모델 선택',
      '"이 문제엔 회귀? 분류? 군집?" 판단',
      '순수 수학·통계만이면 Math',
      '새 가설 R&D 면 Research',
    ],
  },
  'adsp-1-3-s3-m': {
    headline: '6역량 ③ Math, 기억나?',
    summary: '통계·확률·선형대수·미적분 등 분석의 수학적 기반. 모델 가정·수식 유도·검정의 토대.',
    keyPoints: [
      '키워드: 확률·통계·선형대수·미적분',
      '모델의 수학적 뼈대',
      '코드·시스템이면 Engineering',
      '발표·청중 설득이면 Communication',
    ],
  },
  'adsp-1-3-s3-e': {
    headline: '6역량 ④ Engineering, 기억나?',
    summary: '데이터 파이프라인·DB·분산 처리·코드 구현 능력. 모델을 실제 서비스로 옮기는 데 필수.',
    keyPoints: [
      '키워드: 파이프라인·DB·시스템·코드',
      '모델 → 서비스 배포(production)',
      '수식·확률이면 Math',
      '도메인 분석이면 Analytics',
    ],
  },
  'adsp-1-3-s3-r': {
    headline: '6역량 ⑤ Research, 기억나?',
    summary: '기존 모델·기법으로 풀리지 않는 문제에 대해 새 가설·접근을 탐구하는 R&D 역량.',
    keyPoints: [
      '키워드: 새 가설·기법·논문·R&D',
      '미해결 문제에 대한 탐색적 연구',
      '검증된 기법 적용은 Analytics',
      '시각화 전달은 Communication',
    ],
  },
  'adsp-1-3-s3-art': {
    headline: '6역량 ⑥ Art, 기억나?',
    summary: '데이터에서 통찰·창의적 관점·미적 디자인을 끌어내는 비기술적 역량. 시각화 미감, 새 가치 발견의 직관.',
    keyPoints: [
      '키워드: 창의·통찰·디자인 감각',
      '데이터에서 새 관점 발견',
      '단순 발표는 Communication, 새 가설 R&D 는 Research',
      '함정: Management 는 6역량에 포함 X',
    ],
  },

  // ── ADSP Ch2 Topic 1 — 분석 기획의 이해 ─────────────────
  'adsp-2-1-s1': {
    headline: '분석 4유형 What×How, 기억나?',
    summary: '"풀 것을 안다(What)" × "푸는 법을 안다(How)" 의 2×2. 4 칸 = Optimization·Solution·Insight·Discovery.',
    keyPoints: [
      'What ○ × How ○ → Optimization (튜닝)',
      'What ○ × How × → Solution (방법 탐색)',
      'What × × How ○ → Insight (대상 발견)',
      'What × × How × → Discovery (전방위 탐험)',
    ],
  },
  'adsp-2-1-s1-opt': {
    headline: '4유형 ① Optimization, 기억나?',
    summary: '둘 다 안다. 이미 잘 굴러가는 모델·프로세스의 효율을 한 단계 더 끌어올리는 일.',
    keyPoints: [
      '키워드: 파라미터 튜닝·자원 배분·효율 개선',
      '쿠팡 물류 5% 절감, 광고 ROAS 7% 개선',
      '새 모델 X — 기존 모델 미세 조정',
      '모델 자체 새로 정하면 Solution',
    ],
  },
  'adsp-2-1-s1-sol': {
    headline: '4유형 ② Solution, 기억나?',
    summary: 'What 명확 + How 미정. 풀 문제는 분명하지만 어떤 알고리즘·접근으로 풀지 미정인 상태.',
    keyPoints: [
      '키워드: 알고리즘 후보 비교·기법 선택',
      '"이탈 예측에 무슨 모델이?" 비교 단계',
      'What·How 둘 다 명확하면 Optimization',
      '대상도 모르면 Insight 또는 Discovery',
    ],
  },
  'adsp-2-1-s1-ins': {
    headline: '4유형 ③ Insight, 기억나?',
    summary: 'How 명확 + What 미정. 가진 기법으로 새로운 분석 대상·기회를 찾아나가는 단계.',
    keyPoints: [
      '키워드: 새 적용 대상 발굴·세그먼트 발견',
      '"보유 군집 기법으로 새 고객층 찾기"',
      '대상도 분명하면 Optimization/Solution',
      '둘 다 모르면 Discovery',
    ],
  },
  'adsp-2-1-s1-dis': {
    headline: '4유형 ④ Discovery, 기억나?',
    summary: 'What·How 둘 다 미정. 신사업·미지의 영역에서 데이터·문제·방법을 모두 탐험하는 R&D 적 분석.',
    keyPoints: [
      '키워드: 가설 세우기부터·전방위 탐험',
      '"신사업 진출 전 무엇을 측정할지부터"',
      '한 축만 모르면 Solution 또는 Insight',
      '가장 불확실성 큰 분석 유형',
    ],
  },
  'adsp-2-1-s2': {
    headline: 'KDD vs CRISP-DM, 기억나?',
    summary: '분석 프로세스 두 표준 — KDD 5단계(데이터부터) · CRISP-DM 6단계(업무이해부터). 큰 흐름은 같지만 출발점이 다름.',
    keyPoints: [
      'KDD: 선택→전처리→변환→마이닝→해석/평가',
      'CRISP-DM: 업무→데이터이해→준비→모델링→평가→전개',
      'KDD = 데이터에서 출발 (학술적)',
      'CRISP-DM = 업무 이해에서 출발 + 배포까지 (산업)',
    ],
  },
  'adsp-2-1-s2-kdd': {
    headline: 'KDD 5단계, 기억나?',
    summary: '1996 Fayyad 정립. 데이터 선택 → 전처리 → 변환 → 마이닝 → 해석/평가. 학술 색채, 데이터에서 출발.',
    keyPoints: [
      '5단계 (CRISP-DM 보다 1개 적음)',
      '업무 이해 단계 없음 (데이터부터)',
      '"해석/평가" 로 마무리 (배포 단계 없음)',
      '6단계+업무이해 시작이면 CRISP-DM',
    ],
  },
  'adsp-2-1-s2-crisp': {
    headline: 'CRISP-DM 6단계 "업데데이트모델평가전", 기억나?',
    summary: '산업 표준. 업무 이해 → 데이터 이해 → 데이터 준비 → 모델링 → 평가 → 전개(배포). 비즈니스에서 출발해 운영 배포까지.',
    keyPoints: [
      '6단계 (KDD 보다 1개 많음)',
      '업무 이해부터 시작 (비즈니스 우선)',
      '"전개(Deployment)" 로 운영 배포 포함',
      '암기법: 업데데이트모델평가전',
    ],
  },
  'adsp-2-1-s3': {
    headline: '하향식 4단계 "탐정해타", 기억나?',
    summary: '문제가 분명할 때 쓰는 정석. 탐색 → 정의 → 해결방안 → 타당성. 단계 순서가 시험에 그대로 나옴.',
    keyPoints: [
      '① 탐색(Exploration): 문제 후보 모으기',
      '② 정의(Definition): 측정 가능하게 변환',
      '③ 해결방안(Solution): 기법 후보 비교',
      '④ 타당성(Feasibility): 경제·기술·운영 점검',
    ],
  },
  'adsp-2-1-s3-explore': {
    headline: '하향식 ① 탐색, 기억나?',
    summary: '풀어야 할 문제 후보를 빠짐없이 모으는 단계. 내부(업·제·고·에) + 외부(STEEP) 두 렌즈 교차.',
    keyPoints: [
      '내부: 업무·제품·고객·외부 협력사',
      '외부 STEEP: 사회·기술·경제·환경·정책',
      '키워드: 후보 발굴·환경 분석',
      '후보 한 개 골라 측정 가능하게 변환 → 정의',
    ],
  },
  'adsp-2-1-s3-define': {
    headline: '하향식 ② 정의, 기억나?',
    summary: '비즈니스 문제 → 데이터로 풀 수 있는 분석 문제로 변환. 측정 단위·시간·의사결정 행동을 명시.',
    keyPoints: [
      '"매출 부진" → "이탈률 5%p 감소" 같은 변환',
      '핵심: 지표(KPI) + 시점 + 행동',
      '키워드: 비즈니스 → 분석 문제',
      '후보 발굴이면 탐색, 방법 비교면 해결방안',
    ],
  },
  'adsp-2-1-s3-solve': {
    headline: '하향식 ③ 해결방안, 기억나?',
    summary: '정의된 분석 문제에 대해 풀이 방법 후보를 나열·비교. 알고리즘·데이터 소스·인프라 후보 줄세우기.',
    keyPoints: [
      '모델: 로지스틱·랜덤포레스트·XGBoost 비교',
      '데이터·인프라 후보도 함께 비교',
      '키워드: 기법 후보·일차 비교',
      '비용 ROI·조직 수용성까지면 타당성',
    ],
  },
  'adsp-2-1-s3-feas': {
    headline: '하향식 ④ 타당성, 기억나?',
    summary: '실행 직전 3축으로 최종 점검 — 경제(돈)·기술(만들 수)·운영(조직 수용). 한 축이라도 막히면 회귀.',
    keyPoints: [
      '경제: ROI·수익 회수 기간',
      '기술: 데이터 확보·인프라 구축 가능성',
      '운영: 조직 수용성·보안·규제',
      '한 축 빨간불 → 정의/해결방안 회귀',
    ],
  },
  'adsp-2-1-s4': {
    headline: '분석 방법론 5종, 기억나?',
    summary: 'SW공학에서 넘어온 5가지. Waterfall(순차)·Prototype(시제품)·Spiral(반복+위험)·Agile(짧은 반복)·RAD(빠른 결과).',
    keyPoints: [
      'Waterfall: 요구 명확·변경 적음',
      'Prototype: 요구 불명확·시제품 검증',
      'Spiral: 대형·고위험·반복+위험 분석',
      'Agile: 요구 변화 잦음·짧은 스프린트',
      'RAD: 단기 사이클·빠른 결과',
    ],
  },
  'adsp-2-1-s4-waterfall': {
    headline: '방법론 ① Waterfall, 기억나?',
    summary: '폭포처럼 위→아래 순차. 한 단계 끝나면 되돌릴 수 없음. 요구가 처음부터 명확한 프로젝트에 적합.',
    keyPoints: [
      '키워드: 순차·되돌릴 수 없음·요구 명확',
      '예: 정부망·항공기 제어 SW',
      '변경 잦으면 Agile, 위험 큰 R&D 면 Spiral',
      '단점: 요구 변경 비용 매우 큼',
    ],
  },
  'adsp-2-1-s4-prototype': {
    headline: '방법론 ② Prototype, 기억나?',
    summary: '시제품 → 사용자 피드백 → 개선 사이클. 요구사항이 불명확할 때 적합.',
    keyPoints: [
      '키워드: 시제품·피드백·요구 발견',
      '예: 새로운 UX 컨셉 검증',
      '명확하면 Waterfall, 짧은 반복 + 변경은 Agile',
      '대형 위험 관리는 Spiral',
    ],
  },
  'adsp-2-1-s4-spiral': {
    headline: '방법론 ③ Spiral, 기억나?',
    summary: '반복 사이클 + 매 단계 위험 분석. 대형·고위험 R&D 프로젝트에 적합.',
    keyPoints: [
      '키워드: 반복 + 위험 평가·대형 R&D',
      '예: 신기술 도입·우주·국방 시스템',
      '시제품 검증만이면 Prototype',
      '짧은 스프린트면 Agile',
    ],
  },
  'adsp-2-1-s4-agile': {
    headline: '방법론 ④ Agile, 기억나?',
    summary: '2~4주 짧은 스프린트 + 변경 수용. 요구가 자주 바뀌는 환경에 적합.',
    keyPoints: [
      '키워드: 짧은 반복·변경 수용·점진 개선',
      '예: 모바일 앱·SaaS 스타트업',
      '명확·고정이면 Waterfall',
      '위험 관리·반복이면 Spiral',
    ],
  },
  'adsp-2-1-s4-rad': {
    headline: '방법론 ⑤ RAD, 기억나?',
    summary: 'Rapid Application Development. 단기 사이클로 빠른 결과 도출이 우선. Agile 과 유사하지만 더 단기·결과 중심.',
    keyPoints: [
      '키워드: 단기 사이클·빠른 결과 우선',
      'Agile 보다 더 짧고 결과 중심',
      '순차는 Waterfall, 위험은 Spiral',
      '품질·확장보단 속도·검증',
    ],
  },

  // ── ADSP Ch2 Topic 2 — 분석 마스터플랜 ─────────────────
  'adsp-2-2-s1': {
    headline: '시급-난이도 4사분면, 기억나?',
    summary: '과제 우선순위 매트릭스 = 시급성(Now/Future) × 난이도(Easy/Difficult). 4 칸별 처리 전략이 다름.',
    keyPoints: [
      'Now × Easy: 1순위·즉시 착수 (Quick Win)',
      'Now × Difficult: 2순위·자원 투입',
      'Future × Easy: 3순위·여유 시',
      'Future × Difficult: 4순위·중장기 R&D',
    ],
  },
  'adsp-2-2-s1-now-easy': {
    headline: '4사분면 ① Now × Easy, 기억나?',
    summary: '시급하고 부담도 낮은 1순위 과제. Quick Win 으로 즉시 착수.',
    keyPoints: [
      '예: 단일 부서 KPI 대시보드 1주 작업',
      '키워드: 단기 ROI·실행 부담 낮음',
      '가용 데이터 풍부·시간 투입 적음',
      '큰 투자 필요면 Now × Difficult',
    ],
  },
  'adsp-2-2-s1-now-hard': {
    headline: '4사분면 ② Now × Difficult, 기억나?',
    summary: '지금 필요하지만 큰 투자가 필요한 과제. 2순위로 자원 투입해 진행.',
    keyPoints: [
      '예: 전사 데이터 통합 플랫폼 (6개월+)',
      '키워드: 시급+대규모·장기 투자',
      '단기 Quick Win 은 Now × Easy',
      '미래·복잡이면 Future × Difficult',
    ],
  },
  'adsp-2-2-s1-fut-easy': {
    headline: '4사분면 ③ Future × Easy, 기억나?',
    summary: '당장 시급하지 않고 부담도 낮은 3순위 과제. 여유 있을 때 정리.',
    keyPoints: [
      '예: 사내 위키 메타데이터 정비',
      '키워드: 저우선·저부담',
      '시급+부담 낮음은 Now × Easy',
      '장기·복잡이면 Future × Difficult',
    ],
  },
  'adsp-2-2-s1-fut-hard': {
    headline: '4사분면 ④ Future × Difficult, 기억나?',
    summary: '장기 R&D 성격 + 큰 투자 + 즉각 효용 낮음. 4순위로 중장기 보류·R&D.',
    keyPoints: [
      '예: 10년 후 신사업 시뮬레이션 모델',
      '키워드: 장기·복잡·즉각 효용 낮음',
      '시급+큰 투자는 Now × Difficult',
      '저우선 단순 작업은 Future × Easy',
    ],
  },
  'adsp-2-2-s2': {
    headline: '분석 거버넌스 5축, 기억나?',
    summary: '분석을 전사 차원에서 굴리기 위한 5가지 축 — 시스템·조직·프로세스·인력·데이터.',
    keyPoints: [
      '시스템: 분석 인프라·플랫폼',
      '조직: CDO·분석팀 R&R',
      '프로세스: 표준 분석 워크플로',
      '인력(자원): 분석가·엔지니어·도메인',
      '데이터: 표준화·품질·메타데이터',
    ],
  },
  'adsp-2-2-s2-system': {
    headline: '거버넌스 ① 시스템, 기억나?',
    summary: '분석 활동을 떠받치는 인프라·플랫폼 축. 데이터 저장·연산 환경 제공.',
    keyPoints: [
      'DW·Data Lake·Spark·BI 도구',
      '키워드: 인프라·플랫폼·환경',
      'R&R 정의는 조직, 표준 절차는 프로세스',
    ],
  },
  'adsp-2-2-s2-org': {
    headline: '거버넌스 ② 조직, 기억나?',
    summary: '분석 인력의 R&R·보고 라인 정의 축. CDO·분석팀·스튜어드 구조.',
    keyPoints: [
      'CDO(Chief Data Officer)·데이터 스튜어드',
      '집중형·기능형·분산형 3 모델',
      '키워드: R&R·조직 구조',
      '인프라는 시스템, 워크플로는 프로세스',
    ],
  },
  'adsp-2-2-s2-process': {
    headline: '거버넌스 ③ 프로세스, 기억나?',
    summary: '분석 요청 → 수행 → 배포까지의 표준 워크플로 축. 일관된 절차 보장.',
    keyPoints: [
      '분석 요청·승인·수행·배포 단계 표준화',
      '키워드: 표준 절차·워크플로',
      '도구는 시스템, 사람 R&R 은 조직',
    ],
  },
  'adsp-2-2-s2-resource': {
    headline: '거버넌스 ④ 인력(자원), 기억나?',
    summary: '분석가·엔지니어·도메인 전문가의 양성·확보 축. 사람 자체.',
    keyPoints: [
      '교육·채용·역량 진단·경력 경로',
      '키워드: 사람 자원·역량',
      '구조면 조직, 절차면 프로세스',
    ],
  },
  'adsp-2-2-s2-data': {
    headline: '거버넌스 ⑤ 데이터, 기억나?',
    summary: '데이터 자체의 품질·표준·메타데이터 관리 축. 데이터 거버넌스의 기초.',
    keyPoints: [
      '표준화·품질 관리·메타데이터·마스터 데이터',
      '키워드: 데이터 표준·품질',
      '인프라는 시스템, 사람은 자원',
    ],
  },
  'adsp-2-2-s3': {
    headline: '분석 성숙도 4단계, 기억나?',
    summary: '도입(Introduction) → 활용(Adoption) → 확산(Diffusion) → 최적화(Optimization). 한 사람 호기심에서 전사 의사결정 주류로.',
    keyPoints: [
      '도입: 개인 차원 비공식 시도',
      '활용: 부서별 산발적 도입',
      '확산: 전사 표준 + 거버넌스',
      '최적화: 데이터 기반 의사결정 디폴트',
    ],
  },
  'adsp-2-2-s3-intro': {
    headline: '성숙도 ① 도입, 기억나?',
    summary: '분석이 막 시작되는 가장 초기 단계. 한두 직원이 호기심으로 비공식 시도.',
    keyPoints: [
      '키워드: 개인 차원·비공식',
      '"한 사람이 엑셀로 시작"',
      '부서 단위 산발이면 활용',
      '전사 표준이면 확산',
    ],
  },
  'adsp-2-2-s3-adopt': {
    headline: '성숙도 ② 활용, 기억나?',
    summary: '특정 부서가 정기 업무로 분석을 사용하지만 전사 표준은 부서별로 산발.',
    keyPoints: [
      '키워드: 부서별 산발·정기 업무',
      '"마케팅팀만 매주 분석 진행"',
      '개인 차원이면 도입',
      '전사 표준화면 확산',
    ],
  },
  'adsp-2-2-s3-diffuse': {
    headline: '성숙도 ③ 확산, 기억나?',
    summary: '전사 표준 플랫폼·거버넌스가 자리잡고 분석이 모든 부서로 퍼진 단계.',
    keyPoints: [
      '키워드: 전사 표준·거버넌스',
      '"분석팀 + 데이터 플랫폼 + R&R"',
      '부서별 산발이면 활용',
      '의사결정 주류면 최적화',
    ],
  },
  'adsp-2-2-s3-optimize': {
    headline: '성숙도 ④ 최적화, 기억나?',
    summary: '데이터 기반 의사결정이 디폴트로 자리잡고 분석 ROI 자체를 다시 최적화하는 가장 성숙한 단계.',
    keyPoints: [
      '키워드: 디폴트·내재화·ROI 재최적화',
      '"모든 의사결정에 데이터 기반"',
      '확산까진 표준화, 최적화는 일상화',
      '함정: Management 단계 X',
    ],
  },
  'adsp-2-2-s4': {
    headline: '데이터 거버넌스 3요소, 기억나?',
    summary: '원칙(Principle) · 조직(Organization) · 프로세스(Process). 거버넌스를 굴리는 3축.',
    keyPoints: [
      '원칙: 데이터 관리 정책·표준',
      '조직: CDO·스튜어드 R&R',
      '프로세스: 표준화·메타데이터·품질 운영',
      '함정: 비전·전략 ≠ 거버넌스 3요소',
    ],
  },
  'adsp-2-2-s4-principle': {
    headline: '거버넌스 3요소 ① 원칙, 기억나?',
    summary: '"기본 정책·표준" 정의. 데이터를 어떻게 다룰지 큰 룰을 만드는 단계.',
    keyPoints: [
      '키워드: 정책·표준·헌법',
      '"전사 데이터 관리 헌장 제정"',
      'R&R 지정이면 조직, 운영이면 프로세스',
    ],
  },
  'adsp-2-2-s4-org': {
    headline: '거버넌스 3요소 ② 조직, 기억나?',
    summary: '거버넌스 실행 인력·R&R 구조. CDO·데이터 스튜어드·오너의 보고 라인.',
    keyPoints: [
      'CDO·데이터 스튜어드·데이터 오너',
      '키워드: R&R·보고 라인',
      '정책 정의면 원칙, 일상 운영이면 프로세스',
    ],
  },
  'adsp-2-2-s4-process': {
    headline: '거버넌스 3요소 ③ 프로세스, 기억나?',
    summary: '일상 운영 절차 — 표준 코드 적용·메타데이터 갱신·품질 점검을 매월 수행.',
    keyPoints: [
      '키워드: 표준화·메타데이터·품질 운영',
      '"매월 데이터 품질 점검·시정"',
      '정책 헌장이면 원칙, 위원회 구성이면 조직',
      '비전·5년 전략은 거버넌스 3요소 X (함정)',
    ],
  },

  // ── ADSP Ch2 Topic 3 — 분석 과제 도출 / 가치 ────────────
  'adsp-2-3-s1': {
    headline: '분석 가치 3축, 기억나?',
    summary: '분석 프로젝트의 가치 평가는 3축 — 경제적(Economic)·기술적(Technical)·운영적(Operational).',
    keyPoints: [
      '경제적: ROI·비용·수익',
      '기술적: 구현 가능성·데이터 확보',
      '운영적: 조직 수용·정착',
      '하향식 4단계 "타당성 검토" 와 동일 축',
    ],
  },
  'adsp-2-3-s1-econ': {
    headline: '가치 3축 ① 경제적, 기억나?',
    summary: 'ROI·기대 수익·비용 회수 기간. "이 분석으로 얼마나 벌거나 절감할까?" 의 답.',
    keyPoints: [
      '키워드: ROI·수익·비용',
      '"투자 1억 → 연 3억 절감"',
      '구현 가능성은 기술적, 조직 수용은 운영적',
    ],
  },
  'adsp-2-3-s1-tech': {
    headline: '가치 3축 ② 기술적, 기억나?',
    summary: '필요 데이터를 확보할 수 있나? 우리 팀이 만들 수 있나? 인프라가 되나?',
    keyPoints: [
      '키워드: 데이터 확보·인프라·역량',
      '"필요 데이터 70%만 있음"',
      'ROI 면 경제적, 정착이면 운영적',
    ],
  },
  'adsp-2-3-s1-ops': {
    headline: '가치 3축 ③ 운영적, 기억나?',
    summary: '결과를 사용 부서가 실제 의사결정에 쓸까? 조직이 변화를 받아들일까?',
    keyPoints: [
      '키워드: 조직 수용·정착·변화 관리',
      '"보안·규제·내부 저항"',
      'ROI 면 경제적, 구현 가능성은 기술적',
    ],
  },
  'adsp-2-3-s2': {
    headline: '분석 과제 정의서, 기억나?',
    summary: '프로젝트 시작 전 작성하는 문서 — 목적·범위·데이터 원천·산출물·일정.',
    keyPoints: [
      '핵심 항목: 목적·범위·산출물·일정',
      '데이터 원천: 내부 + 외부 모두',
      '키워드: 분석 RFP·프로젝트 헌장',
      '함정: 내부 데이터만 X — 외부 포함',
    ],
  },
  'adsp-2-3-s3': {
    headline: '분석 준비도 6대 영역, 기억나?',
    summary:
      '분석 업무 / 분석 인력·조직 / 분석 기법 / 분석 데이터 / 분석 문화 / IT 인프라. 비용·예산은 포함 X (함정).',
    keyPoints: [
      '6 영역: 업무·인력/조직·기법·데이터·문화·IT',
      '준비도 ↑ + 성숙도 ↑ → 확산형',
      '준비도 ↑ + 성숙도 ↓ → 도입형',
      '함정: 비용·예산은 6 영역에 없음',
    ],
  },
};

/** stepId 로 reminder 조회. 없으면 undefined → UI 측 fallback. */
export function getReminder(stepId: string): ConceptReminder | undefined {
  return REMINDERS[stepId];
}

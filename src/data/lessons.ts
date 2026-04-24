/**
 * 개념 학습 레슨 데이터 — 스텝 단위.
 *
 * 구조 원칙: 한 개념을 배우고 그 개념에 대한 예제를 "바로" 푼다.
 *   Lesson (= 토픽 하나) 은 여러 개의 LessonStep 으로 나뉘고,
 *   각 Step 은 (concept blocks + quizId 1개) 로 구성됩니다.
 *
 *   Zone → 토픽 선택 → LessonScreen:
 *     step 1 개념 카드 → 예제 1 → step 2 개념 카드 → 예제 2 → ...
 *
 *   chapter 단위 상단 진행바가 "전체 X개 스텝 중 몇 번째" 를 보여주며,
 *   맞춘 문제 수가 실시간으로 누적됩니다.
 *
 * ⚠️ PDF 원본을 그대로 복사하지 않음. 모든 설명·비유·암기법은 본 앱을 위한
 * 오리지널 카피입니다. quizId 는 concept-practice.json 의 question.id 와
 * 1:1 매칭.
 */

import type { Subject } from '@/types/question';
import { ALL_QUESTIONS } from '@/lib/questions';
import type { MultipleChoiceQuestion } from '@/types/question';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import type { QuesPose } from '@/components/mascot/types';

// ================================================================
// Dialogue 타입 (듀오링고식 캐릭터 대화)
// ================================================================

/**
 * 한 번의 말풍선 단위. [키워드] 브래킷 안의 텍스트는 SpeechBubble 에서
 * `.dialogue-keyword` 로 하이라이트됨 (과목색 + 점선 밑줄).
 */
export interface DialogueTurn {
  text: string;
  /** 이 대사를 할 때 Ques 의 포즈. 기본 'idle'. */
  pose?: QuesPose;
}

// ================================================================
// Block 타입 (개념 카드 구성 요소)
// ================================================================

export interface IntroBlock {
  kind: 'intro';
  body: string;
}
export interface SectionBlock {
  kind: 'section';
  title: string;
  body: string;
}
export interface KeyPointsBlock {
  kind: 'keypoints';
  title?: string;
  items: string[];
}
export interface TableBlock {
  kind: 'table';
  title?: string;
  headers: string[];
  rows: string[][];
}
export interface ExampleBlock {
  kind: 'example';
  title?: string;
  body: string;
}
export interface CalloutBlock {
  kind: 'callout';
  tone: 'mnemonic' | 'tip' | 'warn';
  title: string;
  body: string;
}

export type LessonBlock =
  | IntroBlock
  | SectionBlock
  | KeyPointsBlock
  | TableBlock
  | ExampleBlock
  | CalloutBlock;

// ================================================================
// Step / Lesson
// ================================================================

export interface LessonStep {
  /** `<lessonId>-s<n>` — progress 추적/딥링크용. */
  id: string;
  /** 이 스텝이 다루는 개념 이름. "DIKW 피라미드" 같은 짧은 타이틀. */
  title: string;
  /** 개념 설명을 구성하는 블록들. */
  blocks: LessonBlock[];
  /**
   * 듀오링고식 대사 스크립트. 존재하면 LessonScreen 대신 DialogueLesson
   * 이 활성화됨. blocks 는 "📖 상세보기" 바텀시트에서 그대로 재사용.
   */
  dialogue?: DialogueTurn[];
  /** 이 개념을 막 배운 사람이 바로 풀 문제 id (concept-practice.json). */
  quizId: string;
}

export interface Lesson {
  id: string;
  subject: Subject;
  chapter: number;
  chapterTitle: string;
  /** subjects.ts 의 topic 문자열과 완전히 동일. */
  topic: string;
  title: string;
  hook: string;
  estimatedMinutes: number;
  steps: LessonStep[];
}

// ================================================================
// ADSP · 1과목 · 데이터 이해
// ================================================================

const ADSP_1_1: Lesson = {
  id: 'adsp-1-1',
  subject: 'adsp',
  chapter: 1,
  chapterTitle: '데이터 이해',
  topic: '데이터의 이해',
  title: '데이터, 정보, 지식 — 그 차이부터',
  hook: '"데이터"와 "정보"가 헷갈리는 순간, 이 레슨으로 명확하게.',
  estimatedMinutes: 8,
  steps: [
    {
      id: 'adsp-1-1-s1',
      title: 'DIKW 피라미드',
      quizId: 'adsp-1-1-cp-01',
      dialogue: [
        { pose: 'wave', text: '안녕! 나는 [조롱이]야. 오늘은 [DIKW 피라미드]부터 시작할게.' },
        { pose: 'think', text: '편의점 영수증을 떠올려봐. "[콜라 1,800원]" 이건 그냥 숫자지?' },
        { pose: 'lightbulb', text: '근데 한 달치를 모아서 "[콜라는 금요일 저녁에 제일 잘 팔린다]" 까지 읽으면 — 같은 재료가 전혀 다른 가치가 돼.' },
        { pose: 'happy', text: '이 계단을 [4단계]로 정리한 게 DIKW 피라미드야. [데] · [정] · [지] · [혜] — "데정지혜" 로 외우자!' },
        { pose: 'idle', text: '자, 바로 확인 문제 들어갈게. 한 번 풀어봐!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '편의점 영수증을 떠올려보세요. "콜라 1,800원" 자체는 그냥 숫자입니다. 하지만 한 달치를 모아 "콜라는 금요일 저녁에 제일 잘 팔린다" 까지 읽으면, 같은 재료가 전혀 다른 가치를 갖습니다. 이 계단을 4단계로 정리한 게 DIKW 피라미드입니다.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"데정지혜" 로 외우자',
          body:
            '데이터(Data) → 정보(Information) → 지식(Knowledge) → 지혜(Wisdom). 아래로 갈수록 양이 많고 가치가 낮고, 위로 갈수록 양은 줄지만 의사결정에 바로 쓰입니다.',
        },
        {
          kind: 'table',
          title: '편의점 예시로 보는 4단계',
          headers: ['단계', '정의', '예시'],
          rows: [
            ['데이터', '가공 전 객관적 사실', 'A마트 콜라 1,800원 · B마트 콜라 1,500원'],
            ['정보', '가공·의미부여된 데이터', 'B마트가 300원 더 싸다'],
            ['지식', '정보를 분류·일반화한 규칙', '콜라는 B마트에서 사는 게 유리하다'],
            ['지혜', '지식 바탕의 창의적 추론', 'B마트에서는 음료 전반이 저렴하겠다'],
          ],
        },
      ],
    },
    {
      id: 'adsp-1-1-s2',
      title: '데이터의 3가지 분류 기준',
      quizId: 'adsp-1-1-cp-02',
      dialogue: [
        { pose: 'wave', text: '데이터 분류는 [세 축]이 따로 돌아가. 섞이면 안 돼.' },
        { pose: 'think', text: '첫째, [구조] — [정형] · [반정형] · [비정형]. 테이블이면 정형, JSON 은 반정형, 영상은 비정형.' },
        { pose: 'lightbulb', text: '둘째, [형태] — [정량적] vs [정성적]. 숫자로 재면 정량, 말·감정이면 정성.' },
        { pose: 'happy', text: '셋째, [값] — [수치형] vs [범주형]. 연속·이산 숫자 vs 순서·명목 라벨.' },
        { pose: 'idle', text: '같은 데이터도 [세 축 각각]에 답이 있어야 해. 확인 문제로 가자!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '세 축으로 따로 분류하기',
          body:
            '시험이 자주 노리는 함정은 "어떤 기준으로 나누었는지" 헷갈리게 섞어 묻는 것입니다. 아래 세 축을 분리해서 기억해두면 절대 꼬이지 않습니다.',
        },
        {
          kind: 'table',
          headers: ['분류 기준', '유형', '설명'],
          rows: [
            ['구조', '정형 / 반정형 / 비정형', 'RDB 테이블 · JSON/XML · 영상·텍스트'],
            ['형태', '정량적 / 정성적', '수치로 측정 vs 언어·감정 등 서술'],
            ['값', '수치형 / 범주형', '연속·이산 숫자 vs 순서·명목 라벨'],
          ],
        },
        {
          kind: 'example',
          title: '세 기준 동시에 답하는 법',
          body:
            '고객 리뷰 텍스트 → "비정형 · 정성적 · 범주형". SNS 좋아요 수 → "정형 · 정량적 · 수치형". CCTV 영상 → "비정형 · 정성적". 같은 데이터라도 세 축 각각에 답이 있어야 합니다.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s3',
      title: '암묵지 vs 형식지 (SECI)',
      quizId: 'adsp-1-1-cp-03',
      dialogue: [
        { pose: 'wave', text: '[자전거 타는 법]을 책으로 옮겨볼 수 있을까? 힘들지.' },
        { pose: 'think', text: '그런데 누구나 연습하면 탈 수 있어. 몸이 배운 거야 — 이게 [암묵지].' },
        { pose: 'lightbulb', text: '반대로 매뉴얼·논문처럼 [글로 정리된 지식]이 [형식지]. 조직은 이 변환으로 성장해.' },
        { pose: 'happy', text: '변환은 [4단계] — [공]동화 · [표]출화 · [연]결화 · [내]면화. "[공표연내]" 로 외우자!' },
        { pose: 'idle', text: '장인의 노하우를 매뉴얼로 옮기는 건? 확인 문제에서 보자.' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '말로 못 쓰는 지식이 있다',
          body:
            '자전거 타는 법은 책으로 옮기기 어렵지만 누구나 탈 수 있습니다 — 몸이 배웠기 때문입니다. 이처럼 언어화 어려운 경험·노하우가 암묵지. 매뉴얼·논문처럼 글로 정리된 것이 형식지. 조직은 암묵지를 형식지로 변환하며 성장합니다.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: 'SECI 4단계 — "공표연내"',
          body:
            '공동화(Socialization) → 표출화(Externalization) → 연결화(Combination) → 내면화(Internalization). 암묵↔형식 변환의 4단계. 장인의 노하우를 매뉴얼로 옮기는 것이 "표출화" — 시험 단골입니다.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s4',
      title: 'DB 특징 · DW · Data Lake',
      quizId: 'adsp-1-1-cp-04',
      dialogue: [
        { pose: 'wave', text: '엑셀 파일과 [데이터베이스]는 뭐가 다를까?' },
        { pose: 'think', text: 'DB 는 [공]용 · [통]합 · [저]장 · [변]화 + [실시간] — 다섯 성질이 다 붙어야 돼.' },
        { pose: 'lightbulb', text: '[DW(Data Warehouse)]는 분석용 창고 — 운영계 데이터를 [ETL] 해서 정돈.' },
        { pose: 'happy', text: '[Data Lake]는 정제 전 원시까지 다 담는 저수지 — 정형·반정형·비정형 전부 OK.' },
        { pose: 'idle', text: 'OLTP(거래) vs OLAP(분석) 구분까지 챙기고, 문제로 가자!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: 'DB 특징 — "공통저변 + 실시간"',
          body:
            '공용(여러 사용자 공유) · 통합(중복 최소화) · 저장(영속 보관) · 변화(수정 반영) + 실시간 처리. 엑셀 파일과 데이터베이스를 구분짓는 다섯 가지 성질.',
        },
        {
          kind: 'section',
          title: 'DW vs Data Lake',
          body:
            'Data Warehouse(DW) 는 "분석용 창고". 운영 시스템(OLTP) 의 정형 데이터를 ETL(Extract-Transform-Load) 해서 ODS 에 모으고 주제별로 정돈합니다. Data Lake 는 "정제 전 원시 데이터" 까지 포함해 정형·반정형·비정형을 전부 담는 저수지.',
        },
        {
          kind: 'keypoints',
          title: 'OLTP vs OLAP',
          items: [
            'OLTP: 거래 중심. 짧고 많은 insert/update (결제·주문)',
            'OLAP: 분석 중심. 읽기 위주의 집계·다차원 조회 (월별 매출)',
            'DW 는 OLAP 을 돕기 위한 읽기 전용 분석 창고',
          ],
        },
      ],
    },
    {
      id: 'adsp-1-1-s5',
      title: '기업 정보 시스템 — DBMS·ERP·CRM·SCM·BI',
      quizId: 'adsp-1-1-cp-05',
      dialogue: [
        { pose: 'wave', text: '회사는 [부서별로 다른 데이터]를 다뤄 — 생산·판매·고객·재고.' },
        { pose: 'think', text: '조각을 따로 두면 "팀끼리 숫자가 안 맞는" 문제가 터져. 그래서 [시스템]이 필요해.' },
        { pose: 'lightbulb', text: '[ERP](전사 통합) · [CRM](고객) · [SCM](공급사슬) · [BI](의사결정). 모두 [DBMS] 위에서 돌아가.' },
        { pose: 'happy', text: '흐름으로 외우자 — "[생고공의]". 생산→고객→공급→의사결정 순환.' },
        { pose: 'idle', text: '약어 풀네임도 같이 기억. 바로 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '회사마다 부서별로 다른 데이터를 다룹니다 — 생산·판매·고객·재고·물류·재무. 이 조각들을 따로 두면 "팀끼리 숫자가 안 맞는" 상황이 생깁니다. 기업 정보 시스템은 그 조각들을 한 곳에 모아주는 장치예요.',
        },
        {
          kind: 'table',
          title: '5가지 대표 시스템',
          headers: ['약어', '풀이', '역할'],
          rows: [
            ['DBMS', 'DataBase Management System', '데이터베이스를 생성·조회·수정·백업하는 소프트웨어'],
            ['ERP', 'Enterprise Resource Planning', '생산·판매·재무·인사 등 전사 업무를 하나로 통합'],
            ['CRM', 'Customer Relationship Management', '고객 이력·성향을 관리해 맞춤 마케팅·서비스에 활용'],
            ['SCM', 'Supply Chain Management', '원자재 조달부터 생산·유통까지 공급사슬 최적화'],
            ['BI', 'Business Intelligence', '쌓인 데이터를 대시보드·리포트로 가공해 의사결정 지원'],
          ],
        },
        {
          kind: 'keypoints',
          title: 'DBMS 유형 4가지',
          items: [
            '계층형(Hierarchical): 트리 구조 — 1:N 부모·자식',
            '망형(Network): 자식이 여러 부모를 가질 수 있음',
            '관계형(Relational, RDB): 테이블·SQL — 현재 가장 널리 쓰임 (Oracle, MySQL, PostgreSQL)',
            'NoSQL(문서·KV·그래프): 대용량·비정형 대응 (MongoDB, Redis, Neo4j)',
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '흐름으로 기억 — "생고공의"',
          body:
            'ERP(생산·전사) → CRM(고객) → SCM(공급사슬) → BI(의사결정). 기업이 "안에서 만들고 → 밖에 고객에게 팔고 → 다시 공급자에게 주문하고 → 쌓인 데이터로 결정" 하는 순환을 떠올리면 5가지가 한 줄로 꿰어집니다.',
        },
      ],
    },
  ],
};

const ADSP_1_2: Lesson = {
  id: 'adsp-1-2',
  subject: 'adsp',
  chapter: 1,
  chapterTitle: '데이터 이해',
  topic: '데이터의 가치와 미래',
  title: '빅데이터는 왜 "빅" 인가',
  hook: '3V·5V… 숫자만 외우지 말고, 왜 "가치" 로 이어지는지.',
  estimatedMinutes: 8,
  steps: [
    {
      id: 'adsp-1-2-s1',
      title: '3V · 데이터 단위',
      quizId: 'adsp-1-2-cp-01',
      dialogue: [
        { pose: 'wave', text: '스마트폰 [10분]이 인류 [1만 년] 분량을 넘어선다고 해.' },
        { pose: 'think', text: '단위부터 익히자 — [K]B · [M]B · [G]B · [T]B · [P]B · [E]B · [Z]B · [Y]B. 단계마다 1024배.' },
        { pose: 'lightbulb', text: '가트너의 [3V]: [Volume](양) · [Variety](다양성) · [Velocity](속도). 세 가지가 "빅" 의 정의야.' },
        { pose: 'happy', text: '확장하면 [5V] = 3V + [Value](가치) + [Veracity](진실성). 더 가면 7V.' },
        { pose: 'idle', text: '단위랑 V 매칭, 문제로 확인!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '스마트폰 10분이 인류 1만 년 분량을 넘어선다고 합니다. 저장장치는 싸지고, 컴퓨터는 빨라지고, SNS·IoT 는 끝없이 데이터를 뿌립니다. "많이 쌓인다 → 가치를 뽑을 수 있다" 가 빅데이터 시대의 동력.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '데이터 단위 — "패지요"',
          body:
            'KB · MB · GB · TB · PB(페타) · EB(엑사) · ZB(제타) · YB(요타). 단계마다 1024배. PB 이상을 빅데이터 영역으로 봅니다.',
        },
        {
          kind: 'table',
          title: '가트너의 3V',
          headers: ['V', '의미', '예시'],
          rows: [
            ['Volume', '데이터의 양', 'PB 단위 로그'],
            ['Variety', '형태의 다양성', '정형 + 이미지 + 센서'],
            ['Velocity', '생성·처리 속도', '초당 수만 건 스트리밍'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '5V · 7V 확장',
          body:
            '3V + Value(가치) + Veracity(진실성) = 5V. + Validity(유효성) + Volatility(휘발성) = 7V. "3V + 가·진·신·휘" 로 외우세요.',
        },
      ],
    },
    {
      id: 'adsp-1-2-s2',
      title: '변화 — 표본→전수, 인과→상관',
      quizId: 'adsp-1-2-cp-02',
      dialogue: [
        { pose: 'wave', text: '빅데이터 이전엔 [작은 표본]으로 [원인]을 찾는 게 주류였어.' },
        { pose: 'think', text: '지금은 [전수] 데이터를 놓고 [상관]부터 훑는 게 가능해졌어.' },
        { pose: 'lightbulb', text: '네 축이 뒤집혔지 — [표본→전수] · [질→양] · [인과→상관] · [이론→데이터].' },
        { pose: 'happy', text: '"원인을 알 필요 없다" 가 아니라 "상관만으로도 충분히 유용한 의사결정" 이 가능해졌다는 뜻!' },
        { pose: 'idle', text: '전후 비교 명확히 하고 문제로!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '분석 패러다임이 뒤집혔다',
          body:
            '빅데이터 이전엔 "작은 표본으로 원인을 찾는" 사전 분석이 주류였습니다. 이후엔 "전수 데이터를 놓고 상관부터 훑는" 사후 분석이 가능해졌습니다.',
        },
        {
          kind: 'table',
          headers: ['축', '이전', '이후'],
          rows: [
            ['규모', '표본(Sample)', '전수(Population)'],
            ['품질', '질(Quality) 우선', '양(Quantity) 우선'],
            ['관점', '인과(Causation)', '상관(Correlation)'],
            ['접근', '이론 기반', '데이터 기반'],
          ],
        },
      ],
    },
    {
      id: 'adsp-1-2-s3',
      title: '데이터 3법 · 가명정보',
      quizId: 'adsp-1-2-cp-03',
      dialogue: [
        { pose: 'wave', text: '데이터를 쓰려면 [법]부터 알아야 해. 2020년 개정이 핵심 포인트.' },
        { pose: 'think', text: '[데이터 3법] — [개]인정보보호법 · [정]보통신망법 · [신]용정보법. "[개정신]" 으로 외워.' },
        { pose: 'lightbulb', text: '개정 전엔 "동의 받아야만 활용 가능" → 개정 후엔 [가명정보] 라는 중간 영역이 생겼어.' },
        { pose: 'happy', text: '[가명정보]는 [통계·연구·공익] 한정으로 [동의 없이] 활용 OK. [익명정보]는 아예 개인정보 대상 밖!' },
        { pose: 'idle', text: '세 카테고리 구분, 문제로 확인해보자.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '데이터 3법 — "개·정·신"',
          body:
            '개인정보보호법 · 정보통신망법 · 신용정보법. 2020년 개정으로 "가명정보" 개념이 도입되어 통계·연구·공익 목적 한정 동의 없이 활용 가능해졌습니다.',
        },
        {
          kind: 'keypoints',
          title: '3종 정보 구분',
          items: [
            '개인정보: 개인 직접 식별. 원칙적으로 동의 필요',
            '가명정보: 추가정보 없이는 식별 불가. 통계·연구·공익은 동의 없이 활용 가능',
            '익명정보: 식별 불가능. 개인정보보호법 적용 대상 아님',
          ],
        },
      ],
    },
    {
      id: 'adsp-1-2-s4',
      title: '빅데이터 비유 · 위기요인',
      quizId: 'adsp-1-2-cp-04',
      dialogue: [
        { pose: 'wave', text: '빅데이터가 뭐와 닮았다고들 할까? [4가지 비유]가 시험에 자주 나와.' },
        { pose: 'think', text: '[산업혁명 석탄·철](원동력) · [원유](정제해야 쓸모) · [렌즈](관찰·발견) · [플랫폼](토대).' },
        { pose: 'lightbulb', text: '근데 위기도 있어 — [사생활 침해] · [책임원칙 훼손] · [데이터 오용(과신)].' },
        { pose: 'happy', text: '대응은 "[동의제 → 책임제]", "결과 기반 책임", "알고리즘 [접근·감사] 허용".' },
        { pose: 'idle', text: '비유 4개와 위기-대응 짝 정리 끝, 문제!' },
      ],
      blocks: [
        {
          kind: 'table',
          title: '4가지 비유와 강조점',
          headers: ['비유', '강조점'],
          rows: [
            ['산업혁명 석탄·철', '사회를 근본적으로 바꾸는 원동력'],
            ['원유', '정제해야 쓸모 있어진다'],
            ['렌즈', '세상을 새롭게 관찰·발견하게 해준다'],
            ['플랫폼', '다른 서비스가 그 위에서 자라는 토대'],
          ],
        },
        {
          kind: 'table',
          title: '위기요인 · 대응',
          headers: ['위기', '대응'],
          rows: [
            ['사생활 침해', '동의제 → 책임제 전환'],
            ['책임원칙 훼손', '결과 기반 책임원칙 고수'],
            ['데이터 오용(과신)', '알고리즘 접근·감사 허용'],
          ],
        },
      ],
    },
  ],
};

const ADSP_1_3: Lesson = {
  id: 'adsp-1-3',
  subject: 'adsp',
  chapter: 1,
  chapterTitle: '데이터 이해',
  topic: '가치 창조를 위한 데이터 사이언스',
  title: '데이터 사이언티스트라는 직업',
  hook: '코딩·수학·비즈니스 — 세 가지를 다 해야 한다면?',
  estimatedMinutes: 6,
  steps: [
    {
      id: 'adsp-1-3-s1',
      title: '핵심 3축 — "AI 비"',
      quizId: 'adsp-1-3-cp-01',
      dialogue: [
        { pose: 'wave', text: '[데이터 사이언스]는 통계학보다 훨씬 넓은 판이야.' },
        { pose: 'think', text: '통계가 [수식]이라면 DS는 여기에 [컴퓨터공학](속도)과 [비즈니스](목적)까지 합쳐져.' },
        { pose: 'lightbulb', text: '핵심 3축 = [A]nalytics · [I]T · [B]usiness. 첫 글자 "[AI 비]" 로 외우자!' },
        { pose: 'happy', text: '세 꼭짓점의 [교집합]에서 데이터 사이언스가 태어나는 거야.' },
        { pose: 'idle', text: '이 3축, 문제로 확인해보자.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '데이터 사이언스는 "데이터에서 가치를 뽑는 종합 예술". 통계학이 엄밀한 수식 위에서 움직인다면, 데이터 사이언스는 여기에 컴퓨터공학(속도)과 비즈니스(목적) 가 합쳐진 훨씬 넓은 판입니다.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '핵심 구성요소 — "AI 비"',
          body:
            'Analytics(분석) + IT(정보기술) + Business(비즈니스 컨설팅). 세 꼭짓점의 교집합에서 데이터 사이언스가 태어납니다.',
        },
      ],
    },
    {
      id: 'adsp-1-3-s2',
      title: 'Hard Skill vs Soft Skill',
      quizId: 'adsp-1-3-cp-02',
      dialogue: [
        { pose: 'wave', text: '데이터 사이언티스트의 역량은 두 부류로 나뉘어.' },
        { pose: 'think', text: '[Hard Skill] — 배워서 익히는 기술. 머신러닝, SQL, 프로그래밍.' },
        { pose: 'lightbulb', text: '[Soft Skill] — 태도·관점·커뮤니케이션. [통찰], [스토리텔링], [협력].' },
        { pose: 'happy', text: '시험은 "어떤 역량이 어느 쪽이냐" 매칭을 자주 물어. Hard = 기술, Soft = 태도!' },
        { pose: 'idle', text: '역량 매칭 문제로 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '배워서 익히는 것 vs 태도·관점',
          body:
            'Hard 는 "배워서 익히는 기술" — 머신러닝, SQL, 프로그래밍. Soft 는 "태도·관점·커뮤니케이션" — 통찰, 스토리텔링, 협력. 시험은 어떤 역량이 어느 쪽인지 매칭을 묻습니다.',
        },
        {
          kind: 'table',
          headers: ['분류', '해당 역량'],
          rows: [
            ['Hard Skill', '빅데이터 이론·기법 숙련, 분석기술 능숙'],
            ['Soft Skill', '통찰력, 시각화·커뮤니케이션, 협력·스토리텔링'],
          ],
        },
      ],
    },
    {
      id: 'adsp-1-3-s3',
      title: '요구 역량 — "Digital CA메라"',
      quizId: 'adsp-1-3-cp-03',
      dialogue: [
        { pose: 'wave', text: '데이터 사이언티스트에게 요구되는 [6가지 역량], 외우기 킬러 있어.' },
        { pose: 'think', text: '[C]ommunication · [A]nalytics · [M]ath · [E]ngineering · [R]esearch · [A]rt.' },
        { pose: 'lightbulb', text: '첫 글자 모으면 — "[Digital CA메라]". 6가지가 [카메라 하나]로 세상을 담듯 통합되는 거야.' },
        { pose: 'happy', text: '의사결정도 진화해 — [직관 → 데이터 → 예측 → 처방]. DS는 뒤 두 단계를 가능케 해.' },
        { pose: 'idle', text: '"[Management]" 같은 항목은 포함 안 됨. 함정 주의!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"Digital CA메라" 6가지',
          body:
            'Communication · Analytics · Math · Engineering · Research · Art. 서로 다른 역량이 "카메라 하나" 로 세상을 담듯 통합돼야 한다는 의미. Management 같은 항목은 포함되지 않습니다.',
        },
        {
          kind: 'keypoints',
          title: '의사결정의 진화',
          items: [
            '직관 → 데이터 기반 → 예측 → 처방',
            '예측: "무슨 일이 일어날까"',
            '처방: "그럼 무엇을 해야 할까"',
            '데이터 사이언스는 예측·처방 단계를 가능케 하는 학문',
          ],
        },
      ],
    },
  ],
};

// ================================================================
// ADSP · 2과목 · 데이터 분석 기획
// ================================================================

const ADSP_2_1: Lesson = {
  id: 'adsp-2-1',
  subject: 'adsp',
  chapter: 2,
  chapterTitle: '데이터 분석 기획',
  topic: '데이터 분석 기획의 이해',
  title: '분석의 4가지 유형과 방법론',
  hook: '"문제를 안다 × 방법을 안다" — 2×2 칸이 분석을 결정합니다.',
  estimatedMinutes: 9,
  steps: [
    {
      id: 'adsp-2-1-s1',
      title: '분석 4유형 (What × How)',
      quizId: 'adsp-2-1-cp-01',
      dialogue: [
        { pose: 'wave', text: '분석 프로젝트가 망하는 이유 1위 — [엉뚱한 방법]을 [엉뚱한 문제]에 쓰는 거.' },
        { pose: 'think', text: '두 축으로 분류하자 — [What](풀 것이 분명?) × [How](푸는 법 아는?).' },
        { pose: 'lightbulb', text: '[○/○ = Optimization](최적화) · [○/× = Solution](방법 탐색) · [×/○ = Insight](대상 발견) · [×/× = Discovery](전방위 탐험).' },
        { pose: 'happy', text: '네 칸을 [2×2 매트릭스]로 외워두면 어떤 과제든 분류가 돼!' },
        { pose: 'idle', text: '각 유형 매칭 문제로!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '분석 프로젝트가 실패하는 가장 흔한 이유는 "엉뚱한 방법을 엉뚱한 문제에 쓰기". "풀려는 것이 분명한가(What)", "어떻게 풀지 아는가(How)" 두 축으로 분류하는 것이 첫 단추입니다.',
        },
        {
          kind: 'table',
          title: 'What × How = 4유형',
          headers: ['What 앎', 'How 앎', '유형', '설명'],
          rows: [
            ['○', '○', 'Optimization', '정답 존재, 최적화'],
            ['○', '×', 'Solution', '목표 분명, 방법 탐색'],
            ['×', '○', 'Insight', '기법은 있는데 대상 발견'],
            ['×', '×', 'Discovery', '대상·방법 모두 탐험'],
          ],
        },
      ],
    },
    {
      id: 'adsp-2-1-s2',
      title: 'KDD vs CRISP-DM',
      quizId: 'adsp-2-1-cp-02',
      dialogue: [
        { pose: 'wave', text: '분석 프로세스의 [두 표준]이 있어 — [KDD] 와 [CRISP-DM].' },
        { pose: 'think', text: 'KDD 는 [5단계] — 선택 · 전처리 · 변환 · 마이닝 · 해석/평가.' },
        { pose: 'lightbulb', text: 'CRISP-DM 은 [6단계] — "[업데데이트모델평가전]" 으로 외워!' },
        { pose: 'happy', text: '풀면 — [업]무이해 → [데]이터이해 → [데]이터준비 → [모델]링 → [평가] → [전]개.' },
        { pose: 'idle', text: '이 순서 그대로 문제에 나와. 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '두 표준 프로세스',
          body:
            '둘 다 "데이터 → 전처리 → 모델링 → 평가" 의 큰 틀은 같지만 단계 수와 이름이 다릅니다. KDD는 5단계, CRISP-DM은 6단계.',
        },
        {
          kind: 'table',
          headers: ['구분', 'KDD (5)', 'CRISP-DM (6)'],
          rows: [
            ['1', '데이터 선택', '업무 이해'],
            ['2', '데이터 전처리', '데이터 이해'],
            ['3', '데이터 변환', '데이터 준비'],
            ['4', '데이터 마이닝', '모델링'],
            ['5', '해석/평가', '평가'],
            ['6', '—', '전개'],
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: 'CRISP-DM 암기 — "업데데이트모델평가전"',
          body:
            '업무이해 · 데이터이해 · 데이터준비 · 모델링 · 평가 · 전개. 이 순서 그대로가 시험에 나옵니다.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s3',
      title: '하향식 접근 — "탐·정·해·타"',
      quizId: 'adsp-2-1-cp-03',
      dialogue: [
        { pose: 'wave', text: '[문제가 분명]할 때 쓰는 정석 — [하향식 접근].' },
        { pose: 'think', text: '4단계 순서: [탐]색 → [정]의 → [해]결방안 → [타]당성. "[탐정해타]" 로 외워!' },
        { pose: 'lightbulb', text: '문제 탐색은 두 관점 — [내부](업제고에) · [외부]([STEEP]).' },
        { pose: 'happy', text: 'STEEP = [S]ocial · [T]ech · [E]conomic · [E]nvironment · [P]olitical. 5가지 렌즈!' },
        { pose: 'idle', text: '내·외부 교차로 빠짐없이 훑자. 문제로!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '문제가 분명할 때 쓰는 정석',
          body:
            '문제 탐색 → 문제 정의 → 해결방안 탐색 → 타당성 검토. 각 단계의 이름 첫 글자 "탐·정·해·타" 를 그대로 외우면 순서가 섞이지 않습니다.',
        },
        {
          kind: 'keypoints',
          title: '문제 탐색 관점',
          items: [
            '내부: 업무 · 제품 · 고객 · 외부 ("업제고에")',
            '외부: STEEP — Social · Tech · Economic · Environment · Political',
            '두 관점을 교차해 내·외부 문제를 빠짐없이 훑는다',
          ],
        },
      ],
    },
    {
      id: 'adsp-2-1-s4',
      title: '분석 방법론 5종',
      quizId: 'adsp-2-1-cp-04',
      dialogue: [
        { pose: 'wave', text: '분석 방법론 [5종] — SW 공학에서 넘어왔어.' },
        { pose: 'think', text: '[Waterfall](순차) · [프로토타입](시제품) · [Spiral](반복+위험관리) · [Agile](짧은 반복) · [RAD](빠른 반복개발).' },
        { pose: 'lightbulb', text: '요구사항 명확 → Waterfall. 불명확 → 프로토타입. 대형 위험 → Spiral. 변경 잦음 → Agile.' },
        { pose: 'happy', text: '"어떤 상황에 어떤 방법론" 매칭이 시험 포인트야!' },
        { pose: 'idle', text: '상황-방법론 매칭, 바로 확인!' },
      ],
      blocks: [
        {
          kind: 'table',
          title: 'SW공학에서 넘어온 5가지',
          headers: ['모델', '특징', '언제'],
          rows: [
            ['계층적(Waterfall)', '순서대로, 되돌아가기 어려움', '요구사항 명확'],
            ['프로토타입', '시제품 → 피드백', '요구사항 불명확'],
            ['나선형(Spiral)', '반복 + 위험관리', '대형·위험 큰 프로젝트'],
            ['애자일(Agile)', '짧은 반복, 변경 수용', '요구 변화 잦음'],
            ['RAD/통합', '빠른 반복개발', '단기 사이클 필요'],
          ],
        },
      ],
    },
  ],
};

const ADSP_2_2: Lesson = {
  id: 'adsp-2-2',
  subject: 'adsp',
  chapter: 2,
  chapterTitle: '데이터 분석 기획',
  topic: '분석 마스터플랜',
  title: '조직을 움직이는 마스터플랜',
  hook: '좋은 아이디어도 조직 준비가 없으면 사장됩니다.',
  estimatedMinutes: 6,
  steps: [
    {
      id: 'adsp-2-2-s1',
      title: '우선순위 — 시급성 × 난이도',
      quizId: 'adsp-2-2-cp-01',
      dialogue: [
        { pose: 'wave', text: '과제 100개가 있다면? 한 번에 다 못 해. 순서가 필요해.' },
        { pose: 'think', text: '두 축 — [시급성](지금 급한가) × [난이도](얼마나 어려운가).' },
        { pose: 'lightbulb', text: '[Now × Easy = 1순위] 즉시 착수! [Now × Difficult] 은 장기 투자.' },
        { pose: 'happy', text: '[Future × Easy] 는 3순위, [Future × Difficult] 는 후순위·중장기.' },
        { pose: 'idle', text: '어느 칸이 최우선인지 체크!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '과제를 전부 한 번에 할 수는 없습니다. "지금 급한가 · 얼마나 어려운가" 두 축으로 분류하면 투자 순서가 자연스럽게 나옵니다.',
        },
        {
          kind: 'table',
          headers: ['시급성', '난이도', '권고'],
          rows: [
            ['Now', 'Easy', '1순위 즉시 착수'],
            ['Now', 'Difficult', '장기 투자'],
            ['Future', 'Easy', '3순위 언제든 가능'],
            ['Future', 'Difficult', '후순위·중장기'],
          ],
        },
      ],
    },
    {
      id: 'adsp-2-2-s2',
      title: '분석 거버넌스 — "시조프로마인드데"',
      quizId: 'adsp-2-2-cp-02',
      dialogue: [
        { pose: 'wave', text: '[분석 거버넌스]는 조직이 분석을 체계적으로 돌리기 위한 5개 축이야.' },
        { pose: 'think', text: '[시]스템 · [조]직 · [프]로세스 · [인]력 · [데]이터 — "[시조프로인데]".' },
        { pose: 'lightbulb', text: '조직 준비도는 6영역 — [IT] · [문화] · [데이터] · [기법] · [인력] · [파급효과].' },
        { pose: 'happy', text: '"[마케팅]" 같은 항목은 [5축에 없음]. 함정 주의!' },
        { pose: 'idle', text: '5축 · 6영역, 구분해서 체크!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '거버넌스 5축',
          body:
            '시스템(Infra) · 조직(Organization) · 프로세스(Process) · 인력(Resource) · 데이터(Data). 긴 이름이지만 "시·조·프로·인·데" 5글자만 기억하면 충분합니다. 마케팅은 5축에 속하지 않습니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '조직 준비도 — "IT문데기인파"',
          body:
            'IT · 문화 · 데이터 · 기법 · 인력 · 파급효과. 조직이 분석을 소화할 수 있는지를 평가하는 6영역.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s3',
      title: '성숙도 "도·활·확·최"',
      quizId: 'adsp-2-2-cp-03',
      dialogue: [
        { pose: 'wave', text: '조직의 분석 [성숙도]는 [4단계]로 봐.' },
        { pose: 'think', text: '첫 글자만 따서 "[도활확최]" — [도]입 · [활]용 · [확]산 · [최]적화.' },
        { pose: 'lightbulb', text: '[준비도(Readiness)]와 혼동 금지! 준비도는 "할 준비됐나" 별개 축이야.' },
        { pose: 'happy', text: '조직 구조도 진화 — "[집기분]" = 집중형 → 기능형 → 분산형.' },
        { pose: 'idle', text: '단계 이름·순서, 시험 단골!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: 'CMMI 4단계',
          body:
            '조직의 분석 성숙도는 4단계입니다. 이름 첫 글자만 따서 "도·활·확·최"(도입·활용·확산·최적화) 순서로 기억하세요. 준비도(Readiness) 와 혼동하지 않게 주의 — 준비도는 조직이 "분석할 준비가 됐는지" 점검하는 별개 축입니다.',
        },
        {
          kind: 'table',
          headers: ['단계', '특징'],
          rows: [
            ['도입 (Introduction)', '일부 개인 차원 시도'],
            ['활용 (Adoption)', '부서 단위 도입, 산발적'],
            ['확산 (Diffusion)', '전사적 확산, 표준화'],
            ['최적화 (Optimization)', '전사 내재화, 의사결정 주류'],
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '조직 구조 — "집·기·분"',
          body:
            '집중형(CoE) → 기능형 → 분산형. 성숙도가 올라갈수록 DSCoE 는 분산으로 퍼져 나가는 것이 일반적입니다.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s4',
      title: '데이터 거버넌스 3요소 — "원·조·프"',
      quizId: 'adsp-2-2-cp-04',
      dialogue: [
        { pose: 'wave', text: '[분석 거버넌스] ≠ [데이터 거버넌스]! 혼동이 시험 함정 1위.' },
        { pose: 'think', text: '데이터 거버넌스는 [데이터 자체]를 공용 자산으로 관리하는 규범이야.' },
        { pose: 'lightbulb', text: '[3요소] — [원]칙(Principle) · [조]직(Organization) · [프]로세스(Process). "[원조프]"!' },
        { pose: 'happy', text: '"비전·전략·계획" 같은 엉뚱한 묶음이 답으로 자주 나와. [원조프] 고정!' },
        { pose: 'idle', text: '3요소만 딱! 문제로.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '"분석 거버넌스" 가 분석 활동 전반의 교통정리라면, **데이터 거버넌스** 는 데이터 자체를 조직의 공용 자산으로 다루는 규범입니다. "누가·어떤 규칙으로 데이터를 만들고 고치고 쓰는가" 를 조직 차원에서 약속하는 틀이에요.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '3요소 — "원·조·프"',
          body:
            '원칙(Principle): 데이터 관리·활용 기본 규칙 · 조직(Organization): 책임자·담당 R&R · 프로세스(Process): 표준화·품질관리 실행 절차. "비전·전략·계획" 같은 엉뚱한 묶음을 답으로 제시하는 함정이 많습니다.',
        },
        {
          kind: 'keypoints',
          title: '주요 관리 활동',
          items: [
            '데이터 표준화: 명칭·코드·형식 통일',
            '데이터 관리체계: 메타데이터·마스터 데이터 운영',
            '데이터 저장소 관리: 아카이브·접근권한·백업',
            '데이터 품질관리: 정확성·완전성·일관성 점검',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '분석 거버넌스와 혼동 금지',
          body:
            '분석 거버넌스 5축 "시·조·프·인·데" 에 "데이터" 가 한 축으로 있지만, 데이터 거버넌스는 그 "데이터" 축을 훨씬 촘촘하게 펼친 별개 개념입니다. 시험에서 두 축을 섞어 오답 선지로 주는 일이 흔합니다.',
        },
      ],
    },
  ],
};

const ADSP_2_3: Lesson = {
  id: 'adsp-2-3',
  subject: 'adsp',
  chapter: 2,
  chapterTitle: '데이터 분석 기획',
  topic: '분석 과제 발굴',
  title: '좋은 분석 과제는 어떻게 찾는가',
  hook: '데이터에서 먼저? 문제에서 먼저? — 둘 다 필요합니다.',
  estimatedMinutes: 6,
  steps: [
    {
      id: 'adsp-2-3-s1',
      title: '타당성 3요소',
      quizId: 'adsp-2-3-cp-01',
      dialogue: [
        { pose: 'wave', text: '하향식 마지막 [타당성 검토]는 [3축]으로 분리해.' },
        { pose: 'think', text: '[경제적](비용·편익 ROI) · [기술적](데이터·알고리즘·시스템) · [운영적](조직·인력·프로세스).' },
        { pose: 'lightbulb', text: '"[사회적 타당성]" 같은 추가 항목은 [함정] — 기본 3요소 아님!' },
        { pose: 'happy', text: '경제·기술·운영 — 딱 3개만!' },
        { pose: 'idle', text: '오답 선지 주의하며 문제 가자.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '하향식 마지막 단계인 "타당성 검토" 는 ROI 한 줄로 끝나지 않습니다. 세 가지 축으로 분리해서 검토합니다.',
        },
        {
          kind: 'keypoints',
          title: '3축',
          items: [
            '경제적 타당성: 비용·편익 — ROI',
            '기술적 타당성: 데이터 · 알고리즘 · 시스템',
            '운영적 타당성: 조직 · 인력 · 프로세스 수용 가능성',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '사회적 타당성은 기본 3요소가 아니다',
          body:
            '"사회적 타당성" 같은 추가 항목은 시험에서 오답 함정으로 자주 등장합니다. 기본 3요소만 경제·기술·운영으로 정확히 외우세요.',
        },
      ],
    },
    {
      id: 'adsp-2-3-s2',
      title: '상향식 접근',
      quizId: 'adsp-2-3-cp-02',
      dialogue: [
        { pose: 'wave', text: '하향식이 "문제 먼저" 라면 [상향식]은 "[데이터 먼저]" 야.' },
        { pose: 'think', text: '대량의 로그·거래 데이터에서 [패턴·이상 징후]를 발견하는 방식.' },
        { pose: 'lightbulb', text: '주 무기는 [비지도 학습] · [EDA]. 문제를 미리 정의 안 해!' },
        { pose: 'happy', text: '대표 예 — [장바구니 분석]에서 "맥주 + 기저귀" 같은 예상 밖 조합 발견.' },
        { pose: 'idle', text: '주제 없을 때 or 혁신 찾을 때 유리. 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '데이터에서 먼저 시작한다',
          body:
            '대량의 로그·거래 데이터를 들여다보고 패턴·이상 징후에서 분석 주제를 "발견" 하는 방식. 비지도 학습·EDA 가 주 무기입니다. 문제를 미리 정의하지 않고 데이터가 말하게 하는 것.',
        },
        {
          kind: 'example',
          title: '언제 유리한가',
          body:
            '주제가 뚜렷하지 않거나 혁신적인 패턴을 찾고 싶을 때. 대표 예: 장바구니 분석에서 예상치 못한 동반 구매 조합을 발견하는 경우.',
        },
      ],
    },
    {
      id: 'adsp-2-3-s3',
      title: '디자인 씽킹 (혼합)',
      quizId: 'adsp-2-3-cp-03',
      dialogue: [
        { pose: 'wave', text: '현대 기업이 제일 선호하는 방식은 뭘까? [디자인 씽킹].' },
        { pose: 'think', text: '[하향식] ↔ [상향식]을 왕복하며 [가설 수정 반복]하는 접근이야.' },
        { pose: 'lightbulb', text: '과제도 프로젝트로 관리돼 — [PMBOK 10영역].' },
        { pose: 'happy', text: '"[이범통이의자에서]" — 이해관계자 · 범위 · 통합 · 일정 · 원가 · 품질 · 자원 · 의사소통 · 위험 · 조달.' },
        { pose: 'idle', text: '혼합 접근이 왜 강한지, 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '하향식 ↔ 상향식을 왕복',
          body:
            '하향식으로 가설을 세우고, 상향식으로 데이터를 점검하고, 다시 가설을 수정하는 반복 운동. 이 혼합 접근을 디자인 씽킹이라 부릅니다. 현대 기업들이 가장 선호하는 방식.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: 'PMBOK 10영역 — "이범통이의자에서"',
          body:
            '통합 · 이해관계자 · 범위 · 일정 · 원가 · 품질 · 자원 · 의사소통 · 위험 · 조달. 과제도 프로젝트로 관리되어야 합니다.',
        },
      ],
    },
  ],
};

// ================================================================
// ADSP · 3과목 · 데이터 분석
// ================================================================

const ADSP_3_1: Lesson = {
  id: 'adsp-3-1',
  subject: 'adsp',
  chapter: 3,
  chapterTitle: '데이터 분석',
  topic: 'R 기초와 데이터 마트',
  title: '데이터 마트와 EDA',
  hook: '분석의 80% 는 데이터를 "쓸 수 있게 만드는" 시간입니다.',
  estimatedMinutes: 9,
  steps: [
    {
      id: 'adsp-3-1-s1',
      title: '요약변수 vs 파생변수',
      quizId: 'adsp-3-1-cp-01',
      dialogue: [
        { pose: 'wave', text: '분석 시간의 [80%]는 [데이터 정리]야. 그 정리 결과물이 [데이터 마트].' },
        { pose: 'think', text: 'DW 가 전사 창고라면, [데이터 마트]는 "마케팅팀 전용 코너" — 부서·목적별 소형 저장소.' },
        { pose: 'lightbulb', text: '[요약변수] = 여러 행을 [집계] (월별 총 매출). [파생변수] = 기존 변수 [조합/변환] (BMI, 나이구간).' },
        { pose: 'happy', text: '요약은 "줄이기", 파생은 "만들기" — 이 차이만 기억!' },
        { pose: 'idle', text: '예시 매칭, 문제로.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '실무에선 모델 만드는 시간보다 데이터 정리 시간이 더 깁니다. 그 정리 결과물이 "데이터 마트" — 분석 목적에 맞게 다듬어 둔 작은 창고입니다.',
        },
        {
          kind: 'section',
          title: 'DW vs 데이터 마트',
          body:
            'DW 가 전사 창고라면, 데이터 마트는 "마케팅팀 전용 코너" 처럼 부서·목적별로 뽑아 놓은 작은 저장소입니다. 더 빠르고, 더 집중되어 있고, 더 만들기 쉽습니다.',
        },
        {
          kind: 'table',
          title: '요약 vs 파생',
          headers: ['구분', '정의', '예시'],
          rows: [
            ['요약변수', '여러 행을 집계', '월별 총 매출, 고객별 평균 주문액'],
            ['파생변수', '기존 변수 조합/변환', 'BMI, 요일, 나이구간'],
          ],
        },
      ],
    },
    {
      id: 'adsp-3-1-s2',
      title: 'EDA 4원칙 — "저·잔·재·현"',
      quizId: 'adsp-3-1-cp-02',
      dialogue: [
        { pose: 'wave', text: '[EDA](탐색적 데이터 분석) — 모델 만들기 전에 데이터를 먼저 이해하는 단계.' },
        { pose: 'think', text: '4원칙 — [저]항성 · [잔]차 해석 · [재]표현 · [현]시성.' },
        { pose: 'lightbulb', text: '"[저잔재현]" 으로 외워! 극단값에 견디고, 잔차 분석, 변수 재표현, 시각화 강조.' },
        { pose: 'happy', text: '분석가는 [이상치]에 흔들리지 않고 [잔차]에서 힌트를 찾아.' },
        { pose: 'idle', text: '네 원칙 이름, 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '튜키(Tukey) 의 원칙',
          body:
            '데이터를 보고 눈·통계·시각화로 감을 잡는 단계. 네 원칙 모두 "R" 로 시작하지만 한국어 앞글자로는 "저잔재현" — 꼭 기억해두세요.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '4원칙 각각의 의미',
          body:
            '저항성(Resistance): 이상치에 덜 휘둘리는 통계 사용 · 잔차해석(Residual): 모형이 놓친 오차 분석 · 재표현(Re-expression): 로그·제곱근 등 스케일 변환 · 현시성(Revelation): 시각화로 패턴 드러내기.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s3',
      title: '결측값 처리',
      quizId: 'adsp-3-1-cp-03',
      dialogue: [
        { pose: 'wave', text: '데이터에 [빈칸]이 있으면? 무시할지 채울지 정해야 해.' },
        { pose: 'think', text: '[완전 삭제](레코드 제거) · [단순 대치](평균·중앙값) · [다중 대치](모델로 예측).' },
        { pose: 'lightbulb', text: '결측 매커니즘 3종 — [MCAR](완전 무작위) · [MAR](무작위) · [MNAR](비무작위).' },
        { pose: 'happy', text: '[MCAR]은 삭제해도 OK, [MNAR]은 삭제하면 [편향] 생김!' },
        { pose: 'idle', text: '방법 매칭 문제!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '빈칸을 어떻게 메꿀 것인가',
          body:
            '처리 방식에 따라 분석 결과가 크게 달라집니다. 단순 대치는 쉽지만 분산을 과소평가하고, 다중 대치는 여러 번 대치해 불확실성까지 반영합니다.',
        },
        {
          kind: 'table',
          headers: ['방식', '방법', '비고'],
          rows: [
            ['완전 제거', 'Listwise / Pairwise Deletion', '간단하나 정보 손실'],
            ['단순 대치', '평균·중앙값·최빈값', '분산 과소평가'],
            ['다중 대치 (MI)', '여러 번 대치 → 통합', '불확실성 반영'],
            ['모델 기반', '회귀·KNN 예측', '복잡·고품질'],
          ],
        },
      ],
    },
    {
      id: 'adsp-3-1-s4',
      title: '이상값 탐지 4가지',
      quizId: 'adsp-3-1-cp-04',
      dialogue: [
        { pose: 'wave', text: '[이상값] 한 개가 모델을 망가뜨릴 수 있어. 탐지가 필수!' },
        { pose: 'think', text: '[ESD] (평균 ± 3σ) · [IQR] (Q3 + 1.5·IQR 밖) · [기하 평균]법 · [사분위수 범위].' },
        { pose: 'lightbulb', text: '분포가 치우쳤으면 [IQR]이 안전, 정규 분포면 [ESD]가 빠름.' },
        { pose: 'happy', text: '이상값이 [오류]인지 [진짜 극단값]인지 구분해서 처리해야 해.' },
        { pose: 'idle', text: '방법 4종 암기, 체크!' },
      ],
      blocks: [
        {
          kind: 'keypoints',
          title: '대표 4방법',
          items: [
            'ESD (Extreme Studentized Deviate): 평균 ± 3σ 기준',
            'IQR: Q1 − 1.5·IQR, Q3 + 1.5·IQR 경계 바깥',
            'Z-Score: |z| > 2 또는 3 인 점',
            'DBScan: 밀도가 낮은 점을 이상값으로 — 밀도 기반',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '이상값 = 반드시 제거 아님',
          body:
            '오타·기기 오류는 제거. 사기 거래·고가치 고객처럼 "진짜 극단" 이라면 남겨서 분석 대상으로 삼아야 합니다.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s5',
      title: 'R 문법 기초 — 자료구조와 기본 함수',
      quizId: 'adsp-3-1-cp-05',
      dialogue: [
        { pose: 'wave', text: 'ADsP 에서 [R 문법] 기본도 나와. 자료구조부터!' },
        { pose: 'think', text: '[벡터](c) · [행렬](matrix) · [배열](array) · [리스트](list) · [데이터프레임](data.frame).' },
        { pose: 'lightbulb', text: '벡터는 [같은 타입만], 리스트는 [섞어도 됨], 데이터프레임은 [열별로 타입 다름].' },
        { pose: 'happy', text: '기본 함수 — [apply](행·열 적용) · [sapply](벡터 반환) · [lapply](리스트 반환).' },
        { pose: 'idle', text: '자료구조-용도 매칭, 문제로!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'R 은 통계 분석을 위해 태어난 언어입니다. 통계 함수가 내장돼 있고 벡터 연산이 기본이어서 한 줄에 많은 계산이 굴러갑니다. ADsP 에선 자료구조 구분과 할당 연산자가 특히 자주 나옵니다.',
        },
        {
          kind: 'table',
          title: '자료구조 4가지',
          headers: ['구조', '특징', '예시'],
          rows: [
            ['벡터 (vector)', '같은 유형 값의 1차원 묶음', 'c(1, 2, 3)'],
            ['리스트 (list)', '서로 다른 유형 혼합 가능', 'list(name = "A", age = 30)'],
            ['행렬 (matrix)', '같은 유형 2차원', 'matrix(1:6, 2, 3)'],
            ['데이터프레임 (data.frame)', '열마다 유형 다를 수 있는 표', 'iris, mtcars'],
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '할당은 "화살표" 가 정석',
          body:
            '기본 할당 연산자는 `<-`. `=` 도 대부분 동작하지만 관례상 `<-` 를 씁니다. 예: `x <- c(1, 2, 3)`.',
        },
        {
          kind: 'keypoints',
          title: 'apply 계열 — 반복문을 한 줄로',
          items: [
            'apply(X, MARGIN, FUN): 행(1) 또는 열(2) 단위로 함수 적용',
            'sapply(X, FUN): 결과를 벡터/행렬로 단순화 반환',
            'lapply(X, FUN): 결과를 리스트로 반환',
            'tapply(X, INDEX, FUN): 그룹별 집계',
          ],
        },
        {
          kind: 'keypoints',
          title: '자주 쓰는 함수 · 패키지',
          items: [
            '기본 통계: mean, median, sd, var, quantile',
            '시각화: plot, hist, boxplot / 고급 — ggplot2',
            '데이터 조작: dplyr(filter, select, mutate, summarize)',
            '패키지 사용: install.packages("pkg") → library(pkg)',
          ],
        },
      ],
    },
  ],
};

const ADSP_3_2: Lesson = {
  id: 'adsp-3-2',
  subject: 'adsp',
  chapter: 3,
  chapterTitle: '데이터 분석',
  topic: '통계 분석',
  title: '확률분포와 척도',
  hook: '평균·분산·정규분포를 "언제 뭘 쓰는지" 기준으로.',
  estimatedMinutes: 10,
  steps: [
    {
      id: 'adsp-3-2-s1',
      title: '측정 척도 4단계',
      quizId: 'adsp-3-2-cp-01',
      dialogue: [
        { pose: 'wave', text: '데이터의 [숫자]가 다 같은 숫자일까? 척도가 다르면 할 수 있는 계산도 달라.' },
        { pose: 'think', text: '[명목](구분만) · [순서](대소 있음) · [등간](차이 의미) · [비율](절대 0).' },
        { pose: 'lightbulb', text: '체온 [°C]는 [등간], 체중 [kg]은 [비율]. 섭씨는 0이 "없다"가 아니야!' },
        { pose: 'happy', text: '척도 낮을수록 [정보 적음], 높을수록 [계산 자유]. 이 위계 기억!' },
        { pose: 'idle', text: '예시 분류, 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '통계는 "불확실성을 숫자로 다루는 언어". 그 시작은 "우리 데이터가 어떤 연산까지 허용하는가" 를 분류하는 것입니다.',
        },
        {
          kind: 'table',
          headers: ['척도', '예시', '가능한 연산'],
          rows: [
            ['명목 (Nominal)', '성별, 혈액형', '='],
            ['순서 (Ordinal)', '학점, 만족도', '= · <'],
            ['등간 (Interval)', '섭씨 온도, 연도', '= · < · + / −'],
            ['비율 (Ratio)', '키, 몸무게', '모든 연산 + 비율'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '등간 vs 비율 — 0의 의미',
          body:
            '등간은 "0이 임의"(섭씨 0도 ≠ 온도 없음), 비율은 "0이 절대 없음"(몸무게 0kg = 질량 없음). 시험에서 항상 헷갈리는 포인트.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s2',
      title: '확률분포 — 이산과 연속',
      quizId: 'adsp-3-2-cp-02',
      dialogue: [
        { pose: 'wave', text: '확률분포는 [이산] vs [연속] 두 갈래.' },
        { pose: 'think', text: '[이산] — [베르누이] · [이항] · [포아송] · [기하] · [다항].' },
        { pose: 'lightbulb', text: '[연속] — [정규] · [t] · [카이제곱] · [F] · [균등] · [지수].' },
        { pose: 'happy', text: '"희귀 사건이 시간당 몇 번" → [포아송]. "대소표본 평균 검정" → [t분포].' },
        { pose: 'idle', text: '분포-용도 매칭, 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '이산 대표 7종',
          body:
            '베르누이(1회) → 이항(n회 중 k) → 기하(첫 성공까지) → 음이항(r번째까지) → 초기하(비복원) → 다항(여러 범주) → 포아송(단위시간 드문 사건). 포아송이 "단위시간 사건" 의 대표 주자.',
        },
        {
          kind: 'table',
          title: '연속 주 용도',
          headers: ['분포', '용도'],
          rows: [
            ['정규', '기본, 평균·분산'],
            ['t', '표본 작음 · 모분산 모를 때 평균 검정'],
            ['χ² (카이제곱)', '분산·적합도·독립성 검정'],
            ['F', '두 분산의 비 (ANOVA)'],
            ['지수', '사건 사이 대기 시간'],
          ],
        },
      ],
    },
    {
      id: 'adsp-3-2-s3',
      title: '좋은 추정량 — "불·효·일·충"',
      quizId: 'adsp-3-2-cp-03',
      dialogue: [
        { pose: 'wave', text: '[추정량]이 모수를 잘 맞추려면 4가지 성질이 필요해.' },
        { pose: 'think', text: '[불]편성(편향 없음) · [효]율성(분산 작음) · [일]치성(표본↑ → 모수 수렴) · [충]분성(정보 보존).' },
        { pose: 'lightbulb', text: '첫 글자 모아 "[불효일충]" — 시험 단골 니모닉!' },
        { pose: 'happy', text: '표본평균이 모평균의 [불편·일치] 추정량인 건 시험 직빵 지식!' },
        { pose: 'idle', text: '네 성질, 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '모수를 맞추는 점추정',
          body:
            '모수(참값) 를 한 값으로 짐작하는 것이 점추정. 아무 추정량이나 쓰면 안 되고, 아래 4성질을 만족할 때 "좋다" 고 말할 수 있습니다. 정규성은 포함되지 않습니다.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '4성질',
          body:
            '불편성(Unbiased): 평균적으로 참값 · 효율성(Efficient): 분산 작음 · 일치성(Consistent): n↑ 시 참값 수렴 · 충분성(Sufficient): 표본 정보를 다 담음.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s4',
      title: '중심극한정리 (CLT)',
      quizId: 'adsp-3-2-cp-04',
      dialogue: [
        { pose: 'wave', text: '통계학의 [슈퍼 무기] — [중심극한정리(CLT)].' },
        { pose: 'think', text: '모집단 분포가 뭐든, 표본크기 [n]이 충분히 크면 [표본평균]의 분포는 [정규]에 가까워져.' },
        { pose: 'lightbulb', text: '[n ≥ 30] 이 "충분히 크다" 의 관습적 기준. 여기서 [t분포]로 검정하는 근거가 나와.' },
        { pose: 'happy', text: '"모집단이 뭐든 [표본평균] 은 [정규]" — 이 한 줄이 핵심!' },
        { pose: 'idle', text: '정확한 조건, 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '통계 추론의 마법',
          body:
            '모집단 분포와 무관하게 n 이 커지면 표본 "평균" 의 분포가 정규분포에 가까워진다 — 이것이 CLT. 통계적 추론이 성립하는 토대입니다.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '흔한 오해',
          body:
            'CLT 는 "개별 관측값이 정규를 따른다" 는 말이 아닙니다. "표본 평균의 분포" 에 대한 진술이며, 보통 n ≥ 30 이면 정규로 근사합니다.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s5',
      title: '주성분 분석 (PCA)',
      quizId: 'adsp-3-2-cp-05',
      dialogue: [
        { pose: 'wave', text: '변수가 [100개] 있다면? 시각화·모델링 모두 힘들어. [차원 축소] 가 필요해.' },
        { pose: 'think', text: '[PCA(주성분 분석)] — [분산 최대] 방향을 새 축으로 잡아 축소.' },
        { pose: 'lightbulb', text: '원래 정보를 [최대한 보존]하면서 차원을 줄이는 [선형] 기법이야.' },
        { pose: 'happy', text: '[Scree Plot]에서 "꺾이는 지점"이 적정 주성분 수! 누적 분산비 [80~90%] 정도 기준.' },
        { pose: 'idle', text: '목적·원리, 체크!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '변수가 100개인 고객 데이터 — 그대로 분석하면 모델이 무거워지고 해석도 어렵습니다. "덜 중요한 방향은 버리고 중요한 방향 몇 개로 요약" 하는 것이 PCA. 수십 개 변수를 2~3개 주성분으로 압축해 시각화·모델 속도를 동시에 잡습니다.',
        },
        {
          kind: 'section',
          title: '핵심 아이디어 — 분산이 큰 방향',
          body:
            '데이터가 가장 넓게 "퍼져 있는" 방향을 1주성분으로, 그다음 퍼진 방향(1주성분과 직교) 을 2주성분으로… 순차로 뽑습니다. 분산이 클수록 정보량이 많다고 보는 거죠. 원 변수들의 선형결합으로 만들어집니다.',
        },
        {
          kind: 'keypoints',
          title: '적용 절차',
          items: [
            '1) 변수 표준화 — 스케일 다르면 큰 값 쪽으로 왜곡 → 필수',
            '2) 공분산(또는 상관) 행렬의 고유값·고유벡터 계산',
            '3) 분산 설명 비율 = 고유값 / 고유값 총합',
            '4) Scree Plot(팔꿈치) 또는 누적 설명력 70~80% 기준으로 K 결정',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '주의점',
          body:
            'PCA 는 **선형** 차원축소라 곡선·비선형 관계는 잡지 못합니다. 주성분은 원 변수들의 선형결합이라 해석이 어려울 수 있고, 정답 레이블을 고려하지 않는 **비지도** 기법입니다.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s6',
      title: '다차원척도화 (MDS)',
      quizId: 'adsp-3-2-cp-06',
      dialogue: [
        { pose: 'wave', text: 'PCA 의 사촌 — [MDS(다차원척도화)].' },
        { pose: 'think', text: 'PCA 가 [변수]에서 시작한다면, MDS 는 [거리·유사도 행렬]에서 시작해.' },
        { pose: 'lightbulb', text: '개체들의 [상대적 거리]를 최대한 보존하면서 [2~3차원]에 배치 — 시각화에 강해.' },
        { pose: 'happy', text: '[계량형 MDS](수치 거리) vs [비계량형 MDS](순위 거리) 구분!' },
        { pose: 'idle', text: 'PCA 와 차이 포인트, 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '거리를 지도에 펼친다',
          body:
            '개체들 사이 "얼마나 비슷한가"(유사도) 또는 "얼마나 다른가"(거리) 를 입력받아, 그 관계를 최대한 보존하는 저차원(주로 2D) 좌표에 개체들을 배치하는 기법입니다. 도시 간 거리표만으로 세계 지도를 복원해보는 것과 같은 발상.',
        },
        {
          kind: 'table',
          title: '두 가지 방식',
          headers: ['구분', '입력', '보존 대상'],
          rows: [
            ['계량 MDS (Metric)', '실제 거리 값', '거리 자체'],
            ['비계량 MDS (Non-metric)', '순위(ordering)', '거리의 순서만'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Stress 값으로 적합도 판정',
          body:
            'Stress = 원래 거리와 투영 거리의 불일치 정도. 0 에 가까울수록 좋고, 0.05 이하 우수 / 0.1 이하 양호 / 0.2 초과면 재검토. 해석은 2D 평면에 찍힌 점들의 **상대 위치** 를 본다 — 가까우면 유사.',
        },
        {
          kind: 'keypoints',
          title: 'PCA 와 비교',
          items: [
            '공통점: 차원 축소 · 시각화를 돕는 비지도 기법',
            'PCA 는 원 변수(값) 에서 출발',
            'MDS 는 개체 간 거리·유사도에서 출발',
            '같은 데이터라도 "무엇을 보존하고 싶은가" 에 따라 선택',
          ],
        },
      ],
    },
  ],
};

const ADSP_3_3: Lesson = {
  id: 'adsp-3-3',
  subject: 'adsp',
  chapter: 3,
  chapterTitle: '데이터 분석',
  topic: '통계적 가설 검정',
  title: '가설 검정 · 회귀 · 시계열',
  hook: 'p-value 0.05 를 넘었을 때 정확히 무슨 일이 일어난 걸까?',
  estimatedMinutes: 12,
  steps: [
    {
      id: 'adsp-3-3-s1',
      title: 'p-value 와 가설검정 5용어',
      quizId: 'adsp-3-3-cp-01',
      dialogue: [
        { pose: 'wave', text: '[가설검정] 5용어, 헷갈리면 시험에서 뚫려!' },
        { pose: 'think', text: '[귀무가설(H₀)](차이 없음) · [대립가설(H₁)](차이 있음) · [유의수준(α)] · [p-value] · [기각역].' },
        { pose: 'lightbulb', text: '[p < α] → H₀ 기각 = "차이 있다 주장". 반대면 기각 못 함.' },
        { pose: 'happy', text: '주의 — "차이 없음 증명"은 [불가능]! 기각 못 함은 "증거 부족"일 뿐.' },
        { pose: 'idle', text: '용어 정의, 체크!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '"광고를 돌렸더니 전환율이 2% 올랐다" — 진짜일까, 운일까? 그 차이를 재는 도구가 가설 검정. 귀무가설과 대립가설을 세우고, 우연으로는 설명되기 힘든지 p-value 로 계산합니다.',
        },
        {
          kind: 'keypoints',
          title: '5가지 용어',
          items: [
            '귀무가설(H0): "차이 없다 · 효과 없다" — 기각 목표',
            '대립가설(H1): "차이 있다" — 증명 목표',
            '유의수준(α): 잘못 기각할 위험, 보통 0.05',
            'p-value: H0 참일 때 현재 이상 극단값이 나올 확률',
            '1종 오류 = H0 맞는데 기각 / 2종 오류 = H0 틀렸는데 채택',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'p-value 는 "H0 가 참일 확률" 이 아니다',
          body:
            '자주 틀리는 포인트. p-value 는 "귀무가설이 참이라고 가정했을 때, 현재 데이터 정도의 극단값이 나올 확률". α 보다 작으면 "우연으로 보기 어렵다" 고 판단할 뿐.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s2',
      title: 't검정 3종류',
      quizId: 'adsp-3-3-cp-02',
      dialogue: [
        { pose: 'wave', text: '[t검정]은 "평균 차이" 검정에 쓰는데, 3가지 버전이 있어.' },
        { pose: 'think', text: '[일표본 t] — 한 집단 평균 = 특정값? | [독립표본 t] — 두 집단 평균 같아?' },
        { pose: 'lightbulb', text: '[대응표본 t] — [같은 사람] 전·후 비교 (다이어트 전후 체중).' },
        { pose: 'happy', text: '독립 vs 대응 헷갈리기 쉬워! "같은 대상" 이면 대응!' },
        { pose: 'idle', text: '상황별 t검정, 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '평균을 다루는 대표 검정',
          body:
            't검정은 "상황에 따라 3가지" 로 나뉩니다. 표본 수·쌍 여부에 따라 어떤 검정을 쓸지 결정됩니다.',
        },
        {
          kind: 'table',
          headers: ['종류', '상황', '예시'],
          rows: [
            ['단일 표본', '표본 평균 vs 기준값', '평균 수명이 1000시간인가'],
            ['대응 표본', '같은 대상 전/후', '다이어트 전/후 체중'],
            ['독립 표본', '서로 다른 두 집단', 'A조 vs B조 점수'],
          ],
        },
      ],
    },
    {
      id: 'adsp-3-3-s3',
      title: '회귀 가정 — "선·분·정·독"',
      quizId: 'adsp-3-3-cp-03',
      dialogue: [
        { pose: 'wave', text: '[선형회귀]가 정확히 돌려면 [4가지 가정]이 맞아야 해.' },
        { pose: 'think', text: '[선]형성 · [분]산 일정(등분산) · [정]규성 · [독]립성.' },
        { pose: 'lightbulb', text: '"[선분정독]" — 첫 글자만 기억하면 4가지 가정 순서가 완성!' },
        { pose: 'happy', text: '잔차플롯·QQ플롯 같은 진단 그래프가 이 가정들을 눈으로 확인하는 도구!' },
        { pose: 'idle', text: '가정 이름, 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: 'SST = SSE + SSR',
          body:
            '회귀는 "X 로 Y를 설명한다" 는 약속. 총 변동을 "설명된 부분 + 남은 부분" 으로 쪼갭니다. R² = SSR / SST 가 설명력.',
        },
        {
          kind: 'keypoints',
          items: [
            'SST(총) = Σ(y − ȳ)²',
            'SSR(설명) = Σ(ŷ − ȳ)²',
            'SSE(잔차) = Σ(y − ŷ)²',
            'R² = SSR / SST → 높을수록 설명력 ↑',
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '회귀 4가정',
          body:
            '선형성 · 등분산성 · 정규성(잔차) · 독립성(오차). 4가정이 무너지면 해석이 흔들립니다. "단조성" 같은 항목은 포함되지 않으니 주의.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s4',
      title: '다중공선성 · 변수 선택',
      quizId: 'adsp-3-3-cp-04',
      dialogue: [
        { pose: 'wave', text: '설명변수끼리 서로 너무 비슷하면? [다중공선성] 문제!' },
        { pose: 'think', text: '[VIF > 10] 이면 경고! 회귀계수의 분산이 [폭발]해 해석이 엉망.' },
        { pose: 'lightbulb', text: '변수 선택법 — [전진선택], [후진제거], [단계적(stepwise)].' },
        { pose: 'happy', text: '[AIC] · [BIC] 같은 정보 기준으로 모델 간 비교!' },
        { pose: 'idle', text: '탐지와 대응, 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: 'VIF ≥ 10 이면 의심',
          body:
            '설명변수끼리 상관이 너무 크면 계수 해석이 불안정해집니다. VIF(Variance Inflation Factor) 가 10 이상이면 다중공선성을 의심하세요.',
        },
        {
          kind: 'table',
          headers: ['변수 선택법', '설명'],
          rows: [
            ['전진선택', '빈 상태에서 하나씩 추가'],
            ['후진제거', '전부에서 하나씩 제거'],
            ['단계선택', '전진 + 후진 혼합'],
            ['벌점 기반', 'Ridge(L2) / Lasso(L1) / ElasticNet'],
          ],
        },
        {
          kind: 'keypoints',
          title: '정보 기준',
          items: [
            'AIC: 복잡도 약한 벌점',
            'BIC: 표본 크기 반영, 더 엄격',
            "Mallow's Cp: 잔차와 변수 수 균형",
          ],
        },
      ],
    },
    {
      id: 'adsp-3-3-s5',
      title: '시계열 — "추·계·순·불"',
      quizId: 'adsp-3-3-cp-05',
      dialogue: [
        { pose: 'wave', text: '[시계열]은 4가지 구성요소로 분해돼.' },
        { pose: 'think', text: '[추]세 · [계]절성 · [순]환 · [불]규칙. "[추계순불]"!' },
        { pose: 'lightbulb', text: '[AR](과거값), [MA](과거 오차), [ARMA](둘 다), [ARIMA](차분까지) — 한 걸음씩 확장.' },
        { pose: 'happy', text: '시계열이 [정상성] 만족해야 모델링이 의미 있어. 차분으로 정상화!' },
        { pose: 'idle', text: '구성요소 4개, 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '정상성과 ARIMA',
          body:
            '시간 축을 따라가는 데이터는 "추세 · 계절성 · 순환 · 불규칙" 4성분으로 분해합니다. 모델링 전에 정상성(평균·분산 시간 불변) 확보가 필수 — 그 도구가 차분(Differencing) · 평활화.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '4성분 vs 모델 파라미터',
          body:
            '시계열 분해 4성분 = 추세 · 계절 · 순환 · 불규칙. "지연(Lag)" 은 ARIMA 의 모형 파라미터이지 분해 성분이 아닙니다. 시험 함정.',
        },
      ],
    },
  ],
};

const ADSP_3_4: Lesson = {
  id: 'adsp-3-4',
  subject: 'adsp',
  chapter: 3,
  chapterTitle: '데이터 분석',
  topic: '정형 데이터 마이닝',
  title: '분류 · 군집 · 연관',
  hook: '지도학습 · 비지도학습, 그리고 장바구니 분석까지.',
  estimatedMinutes: 12,
  steps: [
    {
      id: 'adsp-3-4-s1',
      title: '과적합 / 데이터 분할',
      quizId: 'adsp-3-4-cp-01',
      dialogue: [
        { pose: 'wave', text: '모델이 [훈련 데이터]는 100% 맞추는데 [새 데이터]엔 망하면? [과적합]이야.' },
        { pose: 'think', text: '원인 — [모델 복잡], [데이터 부족], [잡음 학습].' },
        { pose: 'lightbulb', text: '대응 — [훈련·검증·테스트] 분할 + [교차검증(CV)] + [정규화(L1/L2)].' },
        { pose: 'happy', text: '편향-분산 트레이드오프 — 너무 단순하면 [편향], 너무 복잡하면 [분산] 폭발!' },
        { pose: 'idle', text: '과적합 신호, 체크!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '데이터 마이닝은 "큰 데이터에서 규칙·패턴을 발굴" 하는 작업. 정답 레이블이 있으면 지도(분류·회귀), 없으면 비지도(군집·연관).',
        },
        {
          kind: 'section',
          title: '과적합 vs 과소적합',
          body:
            '훈련 데이터에만 과하게 맞추면 과적합 — 새 데이터에 못 맞춥니다. 반대로 아예 학습이 덜 되면 과소적합. 균형점을 찾는 것이 모델링의 핵심.',
        },
        {
          kind: 'table',
          title: '분할 방법 4가지',
          headers: ['방법', '설명'],
          rows: [
            ['Hold-out', '훈련/검증/테스트로 한 번 쪼갬'],
            ['K-fold CV', 'K조각으로 K번 검증, 평균'],
            ['LOOCV', 'K=N — 한 개씩 뺀다'],
            ['부트스트랩', '복원추출로 여러 표본 생성'],
          ],
        },
      ],
    },
    {
      id: 'adsp-3-4-s2',
      title: '앙상블 4종',
      quizId: 'adsp-3-4-cp-02',
      dialogue: [
        { pose: 'wave', text: '[앙상블] — 모델 여러 개를 합쳐 더 강한 모델 만들기.' },
        { pose: 'think', text: '[배깅] (병렬 투표) · [부스팅] (순차 가중치) · [랜덤 포레스트] · [스태킹].' },
        { pose: 'lightbulb', text: '배깅은 [분산 감소] (과적합↓), 부스팅은 [편향 감소] (성능↑).' },
        { pose: 'happy', text: '[랜덤 포레스트] = 배깅 + [변수 무작위]. 가장 대중적 앙상블!' },
        { pose: 'idle', text: '종류별 차이, 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '여럿이 모이면 강해진다',
          body:
            '단일 모델보다 여러 모델의 결과를 합치면 더 안정적입니다. 핵심은 "어떻게 합치느냐".',
        },
        {
          kind: 'table',
          headers: ['방식', '동작', '대표'],
          rows: [
            ['Voting', '여러 모델 다수결/평균', ''],
            ['Bagging', '병렬 학습 + 평균', 'Random Forest'],
            ['Boosting', '순차 학습, 오차를 보완', 'AdaBoost / XGBoost'],
            ['Stacking', '예측을 또 다른 모델의 입력으로', ''],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Bagging vs Boosting',
          body:
            'Bagging 은 병렬, Boosting 은 순차. 이 구분이 제일 자주 출제됩니다.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s3',
      title: '연관분석 — "지·신·향"',
      quizId: 'adsp-3-4-cp-03',
      dialogue: [
        { pose: 'wave', text: '[연관분석] — "맥주 산 사람이 [기저귀] 도 살까?" 장바구니 규칙 찾기.' },
        { pose: 'think', text: '세 지표: [지지도] (동시구매 비율) · [신뢰도] (A→B 비율) · [향상도] (랜덤 대비 배수).' },
        { pose: 'lightbulb', text: '[향상도] > 1 → 양의 연관, = 1 → 독립, < 1 → 음의 연관!' },
        { pose: 'happy', text: '암기법: [지·신·향] — 지지도·신뢰도·향상도 순서 고정!' },
        { pose: 'idle', text: '알고리즘은 [Apriori] · [FP-Growth]. 문제로!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '장바구니 분석',
          body:
            '"맥주 산 사람이 기저귀도 산다" 같은 규칙을 찾는 기법. 세 가지 지표로 평가합니다 — 지지도 · 신뢰도 · 향상도.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '3지표의 의미',
          body:
            '지지도(Support) = A·B 동시 구매 비율. 신뢰도(Confidence) = A 산 사람 중 B 비율. 향상도(Lift) = 신뢰도 / B 구매 비율 → 1보다 크면 양의 연관, 1이면 독립.',
        },
        {
          kind: 'keypoints',
          title: '알고리즘',
          items: [
            'Apriori: 빈발 항목집합 후보 생성-검증 반복',
            'FP-Growth: FP-Tree 로 탐색 속도 개선',
          ],
        },
      ],
    },
    {
      id: 'adsp-3-4-s4',
      title: '군집 — DBSCAN 과 친구들',
      quizId: 'adsp-3-4-cp-04',
      dialogue: [
        { pose: 'wave', text: '[군집] — 레이블 없이 [유사한 것끼리] 묶기. 비지도 학습의 대표주자!' },
        { pose: 'think', text: '[계층적] (덴드로그램) · [K-means] (중심 K개) · [DBSCAN] (밀도) · [EM] · [SOM].' },
        { pose: 'lightbulb', text: '[DBSCAN] 은 K 불필요 + [이상치] 에 강함. [K-means] 는 K 를 먼저 정해야 함.' },
        { pose: 'happy', text: 'K-means 최적 K 찾기: [팔꿈치법] (WCSS) · [실루엣 계수] (1 가까울수록 좋음)!' },
        { pose: 'idle', text: '5가지 군집 기법, 각자 특징 명확! 문제로!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '비지도 군집 5종',
          body:
            '레이블 없이 유사한 것끼리 묶기. 방식에 따라 여러 갈래로 나뉩니다.',
        },
        {
          kind: 'table',
          headers: ['방법', '특징'],
          rows: [
            ['계층적', '덴드로그램 — 합병형/분할형'],
            ['K-means', '중심 K개로 반복 재배정'],
            ['DBSCAN', '밀도 기반, 이상치 강함, K 불필요'],
            ['EM', '혼합분포 확률 할당'],
            ['SOM', '뉴런 격자로 2D 투영'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'K-means 최적 K',
          body:
            '팔꿈치(Elbow) 법: WCSS 를 K에 따라 그려 꺾이는 지점. 실루엣 계수: 1에 가까울수록 잘 분리됨.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s5',
      title: '분류 평가지표',
      quizId: 'adsp-3-4-cp-05',
      dialogue: [
        { pose: 'wave', text: '[분류 평가] — [오분류표] (TP/FP/FN/TN) 에서 모든 지표가 나와!' },
        { pose: 'think', text: '[정확도] (전체 맞춘 비율) · [정밀도] (예측의 정확함) · [재현율] (실제 포착률).' },
        { pose: 'lightbulb', text: '[암 진단·스팸] → 놓치면 안 되니 [재현율]! [추천·검색] → 잘못 보이면 안 되니 [정밀도]!' },
        { pose: 'happy', text: '균형은 [F1] (조화평균). 상위 X% 타겟팅은 [Lift·Gain 차트]!' },
        { pose: 'idle', text: '[ROC/AUC] 는 1에 가까울수록 우수. 문제로!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '오분류표에서 시작',
          body:
            '오분류표(Confusion Matrix) 의 TP/FP/FN/TN 에서 여러 지표가 파생됩니다. 상황에 따라 "정밀도 우선" 인지 "재현율 우선" 인지가 달라집니다.',
        },
        {
          kind: 'keypoints',
          items: [
            '정확도(Accuracy) = (TP+TN) / 전체',
            '정밀도(Precision) = TP / (TP+FP) — 예측의 정확함',
            '재현율(Recall) = TP / (TP+FN) — 실제의 포착률',
            'F1 = 정밀도·재현율 조화평균',
            'ROC: TPR vs FPR, AUC 는 그 면적 (1에 가까울수록 우수)',
          ],
        },
        {
          kind: 'keypoints',
          title: '향상도 차트 (Lift / Gain Chart)',
          items: [
            '향상도(Lift) = 모델이 잡은 양성 비율 ÷ 랜덤으로 잡을 때 양성 비율',
            '예측 확률 내림차순으로 고객을 10분위(decile) 로 자른 뒤 분위별 Lift 를 그림',
            '상위 분위 Lift 가 1 보다 크면 "상위 타겟팅이 유효" 하다는 신호',
            'Gain 곡선: 상위 X% 고객에서 실제 양성의 몇 %를 잡았는지',
            '마케팅·리스크 관리처럼 "상위만 골라 행동" 하는 시나리오에서 핵심 평가 도구',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '언제 뭘 쓰나',
          body:
            '암 진단·스팸처럼 "놓치면 안 되는" 문제는 재현율. 추천·검색처럼 "잘못 보여주면 안 되는" 문제는 정밀도. 둘의 균형이 F1. 타겟 마케팅·우량 고객 선별처럼 "상위 X% 선별" 문제에선 Lift/Gain 을 같이 봅니다.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s6',
      title: '로지스틱 회귀',
      quizId: 'adsp-3-4-cp-06',
      dialogue: [
        { pose: 'wave', text: '[로지스틱 회귀] — "당뇨냐 아니냐" 처럼 [분류] 문제에 쓰는 회귀!' },
        { pose: 'think', text: '선형회귀는 음수·2도 나올 수 있어 부적합 → [시그모이드] 로 0~1 사이 확률로!' },
        { pose: 'lightbulb', text: '[odds] = p/(1−p) · [logit] = ln(odds) 로 선형 모델링. [Odds Ratio] > 1 → 양의 영향!' },
        { pose: 'happy', text: '다중 분류로 확장 = [소프트맥스 회귀]. 평가는 [ROC/AUC] · 검정은 [Wald]!' },
        { pose: 'idle', text: '회귀 이름이지만 실은 [분류기]. 문제로!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '"이 환자가 당뇨냐 아니냐" 처럼 **분류** 가 필요한데, 일반 선형회귀는 예측값이 음수나 2 가 나올 수 있어 부적합합니다. 로지스틱 회귀는 출력을 0~1 사이 확률로 바꿔주는 똑똑한 회귀입니다.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '핵심 공식 — 시그모이드',
          body:
            'P(y=1 | x) = 1 / (1 + e^−(β₀ + β₁x)). S 자형 곡선으로 확률을 반환 → 보통 0.5 를 기준으로 0 / 1 을 판정. 다중 분류로 확장하면 소프트맥스 회귀입니다.',
        },
        {
          kind: 'keypoints',
          title: '해석의 언어 — odds 와 log-odds',
          items: [
            'odds = p / (1 − p) — 일어날 확률 대 일어나지 않을 확률',
            'log-odds(logit) = ln(odds) — 선형결합으로 모델링',
            '계수 지수화 → exp(β) = "X 1단위 증가 시 odds 몇 배"',
            'Odds Ratio > 1: 양의 영향 · < 1: 음의 영향',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '평가·검정 지표',
          body:
            '회귀처럼 R² 를 쓰지 않고 분류 지표(정확도·정밀도·재현율·ROC/AUC) 를 사용합니다. 계수 검정은 Wald 검정, 모델 비교는 이탈도(Deviance) 또는 AIC.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s7',
      title: '의사결정나무',
      quizId: 'adsp-3-4-cp-07',
      dialogue: [
        { pose: 'wave', text: '[의사결정나무] — 뿌리에서 "나이 > 30?" 같은 [질문을 타고] 잎까지 내려가!' },
        { pose: 'think', text: '분리 기준 4가지: [정보이득] (ID3) · [이득비] (C4.5) · [지니] (CART) · [카이제곱] (CHAID).' },
        { pose: 'lightbulb', text: '최대 장점은 [해석이 쉽다]! 규칙이 그대로 보여서 "왜 그렇게 예측했나" 설명 가능.' },
        { pose: 'happy', text: '약점은 [과적합] — [가지치기] (사전/사후) 로 해결. 앙상블로도 보완!' },
        { pose: 'idle', text: '알고리즘별 분리 기준 매칭, 확실히! 문제로!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '"질문을 타고 내려가는" 분류',
          body:
            '뿌리 노드에서 "나이 > 30?" 같은 질문으로 데이터를 둘(또는 여러 개) 로 나누고, 가지마다 또 질문을 던집니다. 잎(leaf) 에 도달하면 그게 최종 예측. 규칙이 그대로 보여서 해석이 뛰어난 것이 최대 장점.',
        },
        {
          kind: 'table',
          title: '분리 기준(불순도) 과 대표 알고리즘',
          headers: ['분리 기준', '의미', '대표 알고리즘'],
          rows: [
            ['정보이득 (엔트로피 감소)', '불확실성이 얼마나 줄었나', 'ID3'],
            ['이득비 (Gain Ratio)', '정보이득을 분기 수로 보정', 'C4.5 · C5.0'],
            ['지니계수 (Gini)', '범주 불순도', 'CART'],
            ['카이제곱 통계량', '독립성 검정 기반', 'CHAID'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '과적합과 가지치기(Pruning)',
          body:
            '나무가 깊어지면 훈련 데이터에 과하게 맞춰져 새 데이터에 흔들립니다. 사전 가지치기(최대 깊이·최소 샘플 수 제한) 또는 사후 가지치기(일단 크게 키운 뒤 불필요한 가지 제거) 로 해결합니다.',
        },
        {
          kind: 'keypoints',
          title: '장단점',
          items: [
            '장점: 해석 쉬움 · 비선형 관계 포착 · 범주·수치 변수 모두 처리',
            '단점: 과적합 위험 · 데이터 작은 변화에도 구조 크게 달라짐',
            '대응: 앙상블(랜덤 포레스트·부스팅) 로 약점 보완',
          ],
        },
      ],
    },
    {
      id: 'adsp-3-4-s8',
      title: 'K-최근접이웃 (K-NN)',
      quizId: 'adsp-3-4-cp-08',
      dialogue: [
        { pose: 'wave', text: '[K-NN] — "비슷한 애들 [K 명] 보고 다수결로 따라 한다!"' },
        { pose: 'think', text: '학습은 데이터 [저장만] — 예측할 때 모든 점과 거리 계산. [게으른 학습기]!' },
        { pose: 'lightbulb', text: 'K 작으면 [과적합] · K 크면 [과소적합]. [홀수 K] 로 동률 회피!' },
        { pose: 'happy', text: '거리 측도: [유클리드] · [맨해튼] · [민코프스키] · [마할라노비스] (상관 반영).' },
        { pose: 'idle', text: '스케일 다르면 [표준화] 필수 (키 170 vs 체중 65)! 문제로!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '"비슷한 애들이 뭐였는지 보고 따라 한다." 새 데이터가 들어오면 가장 가까운 K개 이웃의 다수결로 범주를 정합니다. 학습 단계는 데이터를 "저장만" 할 뿐이라서 **게으른 학습기(lazy learner)** 로 불립니다.',
        },
        {
          kind: 'keypoints',
          title: '핵심 포인트',
          items: [
            'K 가 작을수록 경계가 들쭉날쭉 → 과적합 위험',
            'K 가 클수록 경계가 부드러움 → 과소적합 위험',
            '홀수 K 가 자주 쓰임 (다수결 동률 회피)',
            '학습은 가벼운데 예측 시 모든 데이터와 거리 계산 → 데이터 커지면 느림',
          ],
        },
        {
          kind: 'table',
          title: '주요 거리 측도',
          headers: ['이름', '용도'],
          rows: [
            ['유클리드 (Euclidean)', '기본 — 연속형 변수'],
            ['맨해튼 (Manhattan)', '격자·이동 거리 직관적'],
            ['민코프스키 (Minkowski)', '유클리드·맨해튼의 일반형'],
            ['마할라노비스 (Mahalanobis)', '변수 간 상관을 반영'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '표준화는 거의 필수',
          body:
            '키(170cm) 와 체중(65kg) 처럼 스케일이 크게 다르면 큰 값 변수에 거리가 지배당합니다. min-max 스케일링 또는 Z-점수 표준화로 맞춘 뒤 사용합니다.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s9',
      title: '나이브베이즈 분류기 (NBC)',
      quizId: 'adsp-3-4-cp-09',
      dialogue: [
        { pose: 'wave', text: '[나이브베이즈] — [베이즈 정리] + "특징들이 모두 [독립]" 이라는 순진한 가정!' },
        { pose: 'think', text: '복잡한 결합확률이 [각 확률의 곱] 으로 단순화 → 학습·예측 매우 빠름.' },
        { pose: 'lightbulb', text: '사후확률 ∝ [사전 × 가능도]. 클래스별 계산해서 가장 큰 거 선택!' },
        { pose: 'happy', text: '변형: [Gaussian NB] (연속형) · [Multinomial NB] (단어빈도) · [Bernoulli NB] (이진).' },
        { pose: 'idle', text: '대표 활용: [스팸 필터] · [문서 분류]. 문제로!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '"베이즈 정리 + 순진한 가정 하나." 각 특징이 서로 **조건부 독립** 이라고 가정하면, 복잡한 결합확률이 "각 특징 확률의 곱" 으로 확 단순해집니다. 스팸 필터·텍스트 분류의 고전.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '핵심 수식',
          body:
            'P(C | x₁, …, xₙ) ∝ P(C) · Π P(xᵢ | C). 사후확률 ∝ 사전 × 가능도. 클래스마다 이 값을 계산해 가장 큰 값을 고릅니다.',
        },
        {
          kind: 'keypoints',
          title: '왜 "순진한(naive)" 인가',
          items: [
            '현실에선 특징들이 서로 완전히 독립인 경우가 드물지만, 그래도 가정해 버림',
            '의외로 많은 도메인에서 단순화가 성능을 크게 해치지 않음',
            '장점: 학습·예측 매우 빠름 · 적은 데이터로도 동작',
            '단점: 특징 간 의존성이 강하면 정확도 하락',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '대표 활용 + 변형',
          body:
            '스팸 메일 필터 · 문서 분류 · 의료 진단 보조. 변형: Gaussian NB(연속형) · Multinomial NB(텍스트 단어 빈도) · Bernoulli NB(이진 특성).',
        },
      ],
    },
    {
      id: 'adsp-3-4-s10',
      title: '서포트 벡터 머신 (SVM)',
      quizId: 'adsp-3-4-cp-10',
      dialogue: [
        { pose: 'wave', text: '[SVM] — 두 집단 사이에 선 그을 때, [가장 여유롭게] 긋자!' },
        { pose: 'think', text: '[마진] (경계까지 거리) 최대화. 경계 결정하는 소수 점이 [서포트 벡터]!' },
        { pose: 'lightbulb', text: '[하드 마진] (완전 분리) vs [소프트 마진] (약간 허용, 파라미터 C 로 조정).' },
        { pose: 'happy', text: '[커널 트릭] — 선형 분리 안 되면 [고차원으로 올려서] 풀자! (RBF · 다항 · 시그모이드)' },
        { pose: 'idle', text: '[고차원·소표본] 에 강함. 문제로!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '두 집단 사이에 선을 긋는다면, **가장 여유롭게** 긋는 게 안전하겠죠. SVM 은 그 "여유(margin)" 가 최대가 되는 경계(초평면) 를 찾습니다. 경계에 가장 가까운 소수 점이 "서포트 벡터" — 이들이 경계를 결정합니다.',
        },
        {
          kind: 'keypoints',
          title: '핵심 개념',
          items: [
            '마진(margin): 경계와 가장 가까운 샘플 사이 거리',
            '서포트 벡터: 마진 경계 위의 샘플 — 이 점들만 경계에 영향',
            '하드 마진: 완전 분리 가정 / 소프트 마진: 약간의 오분류 허용',
            '하이퍼파라미터 C: 오분류 허용 정도 — 클수록 경계 빡빡',
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '커널 트릭 — "올려서 풀자"',
          body:
            '선형으로 나눌 수 없는 데이터도 더 높은 차원으로 옮기면 선형 분리가 가능합니다. RBF(가우시안)·다항·시그모이드 커널이 대표적. 원공간으로 돌아오면 복잡한 곡선 경계처럼 보입니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '강점과 약점',
          body:
            '강점: 고차원·소표본에 강하고 일반화 성능이 우수. 약점: 대용량 데이터에 학습이 느리고, 커널·C 튜닝 결과가 성능에 크게 영향.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s11',
      title: '인공신경망 · 딥러닝',
      quizId: 'adsp-3-4-cp-11',
      dialogue: [
        { pose: 'wave', text: '[인공신경망] — 뇌 뉴런을 수식으로 흉내. 층을 [깊게] 쌓으면 [딥러닝]!' },
        { pose: 'think', text: '구조: [입력층] → [은닉층 × N] → [출력층]. 학습은 [오차역전파] 로 뒤에서부터 가중치 조정.' },
        { pose: 'lightbulb', text: '활성화 함수: [시그모이드] (0~1) · [tanh] · [ReLU] (현대 표준) · [Softmax] (다중분류).' },
        { pose: 'happy', text: '3대 구조: [CNN] (이미지) · [RNN/LSTM] (시계열) · [Transformer] (BERT·GPT)!' },
        { pose: 'idle', text: '대량 데이터 + GPU + 역전파 = 2010년대 폭발적 성장! 문제로!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '뇌의 뉴런이 신호를 받아 임계를 넘으면 다음 뉴런에 전달 — 이걸 수식으로 흉내 낸 것이 인공신경망(ANN). 그 층(layer) 을 여러 개 깊게 쌓은 것이 딥러닝(Deep Learning) 입니다.',
        },
        {
          kind: 'section',
          title: '기본 구조',
          body:
            '입력층 → (은닉층 × N) → 출력층. 각 뉴런은 "가중합(Σwᵢxᵢ + b) → 활성화 함수 → 출력" 흐름. 학습은 **오차역전파(Backpropagation)** 로 출력 쪽 오차를 뒤에서부터 거꾸로 전달해 가중치를 조정합니다.',
        },
        {
          kind: 'table',
          title: '대표 활성화 함수',
          headers: ['함수', '출력 범위', '특징'],
          rows: [
            ['시그모이드', '(0, 1)', '확률 해석 용이 · 기울기 소실 문제'],
            ['tanh', '(−1, 1)', '중심 0 으로 개선'],
            ['ReLU', '[0, ∞)', '현재 은닉층 표준 · 계산 빠름'],
            ['Softmax', '(0, 1), 합 = 1', '다중 분류 출력층'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '딥러닝 3대 구조',
          body:
            'CNN(Convolutional): 이미지·영상 특징 추출. RNN/LSTM: 시계열·언어 순차 데이터. Transformer: 현대 자연어 처리의 주류(BERT, GPT 계열).',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '자주 틀리는 포인트',
          body:
            '은닉층이 1개만 있는 신경망은 얕은(shallow) ANN 이고, "여러 층" 이 깊게 쌓여야 딥러닝으로 봅니다. 대량 데이터 · GPU 연산 · 역전파 세 박자가 갖춰지며 2010년대 이후 폭발적으로 발전했습니다.',
        },
      ],
    },
  ],
};

// ================================================================
// SQLD · 1과목 · 데이터 모델링의 이해
// ================================================================

const SQLD_1_1: Lesson = {
  id: 'sqld-1-1',
  subject: 'sqld',
  chapter: 1,
  chapterTitle: '데이터 모델링의 이해',
  topic: '데이터 모델링의 이해',
  title: '엔티티·속성·관계 — 모델링의 3요소',
  hook: '테이블을 그리기 전에, "무엇을 저장할지" 를 먼저 정리하자.',
  estimatedMinutes: 8,
  steps: [
    {
      id: 'sqld-1-1-s1',
      title: '데이터 모델링의 3관점',
      quizId: 'sqld-1-1-cp-01',
      dialogue: [
        { pose: 'wave', text: '[SQLD] 시작! 먼저 [데이터 모델링] 부터. 복잡한 업무를 [표] 로 바꾸는 일!' },
        { pose: 'think', text: '세 관점: [데이터] (무엇이 저장되나) · [프로세스] (어떻게 흐르나) · [상관] (둘의 관계).' },
        { pose: 'lightbulb', text: '영어로는 [What] · [How] · [Data-Process]. 관점별로 같은 업무를 다르게 본다!' },
        { pose: 'happy', text: '암기법: [데프상] — 데이터·프로세스·상관 순!' },
        { pose: 'idle', text: '자, 어떤 관점이 [How] 인지 맞혀보자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '데이터 모델링은 현실 세계의 업무를 컴퓨터가 다룰 수 있는 형태(테이블·관계) 로 정리하는 작업입니다. 같은 업무를 세 관점에서 나눠 봅니다.',
        },
        {
          kind: 'keypoints',
          title: '3관점',
          items: [
            '데이터 관점(Data, What) — "무엇이 저장되는가": 엔티티·속성',
            '프로세스 관점(Process, How) — "어떻게 업무가 흐르는가": DFD·업무 흐름도',
            '상관 관점(Data-Process, Interaction) — "데이터가 프로세스에 어떻게 쓰이나"',
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"데·프·상" 으로 외우자',
          body:
            '데이터(What) → 프로세스(How) → 상관(Interaction). SQLD 는 주로 데이터 관점의 모델링을 다룹니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s2',
      title: '엔티티의 조건',
      quizId: 'sqld-1-1-cp-02',
      dialogue: [
        { pose: 'wave', text: '[엔티티] — "저장할 필요가 있는 [실체]"! 고객·주문·상품 같은 것.' },
        { pose: 'think', text: '엔티티 5조건: [업무에 필요] · [식별 가능] · [2개 이상 인스턴스] · [속성 보유] · [프로세스 이용].' },
        { pose: 'lightbulb', text: '"영속적 저장" 은 조건이 아니야! 임시 엔티티도 존재할 수 있음.' },
        { pose: 'happy', text: '암기법: [업식인속프] — 업무·식별·인스턴스·속성·프로세스!' },
        { pose: 'idle', text: '함정 문제 나올 수 있어. 문제로!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '엔티티란?',
          body:
            '업무에서 관리해야 할 "실체" 또는 "개념". 고객(Customer)·주문(Order)·상품(Product) 등이 전형적인 엔티티입니다.',
        },
        {
          kind: 'keypoints',
          title: '엔티티가 갖춰야 할 5가지',
          items: [
            '업무에서 필요한 정보 (업무적 가치)',
            '유일하게 식별 가능 (식별자 존재)',
            '2개 이상의 인스턴스를 가짐 (하나뿐인 것은 엔티티 아님)',
            '속성(Attribute) 을 반드시 가짐',
            '업무 프로세스에서 이용됨',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '자주 틀리는 함정',
          body:
            '"영속적으로 저장되어야 한다" 는 조건이 아닙니다. 임시 엔티티·이벤트성 엔티티도 엔티티로 인정됩니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s3',
      title: '속성 분류 — 기본·설계·파생',
      quizId: 'sqld-1-1-cp-03',
      dialogue: [
        { pose: 'wave', text: '[속성] — 엔티티를 구성하는 [세부 정보]! 고객의 이름·나이·주소 같은 것.' },
        { pose: 'think', text: '속성 3분류: [기본] (업무에서 원래 존재) · [설계] (설계 시 새로 정의) · [파생] (계산·가공).' },
        { pose: 'lightbulb', text: '예: \"이름\"은 기본, \"고객 ID\"는 설계, \"총 구매액\"은 파생(주문 합산)!' },
        { pose: 'happy', text: '암기법: [기설파] — 기본·설계·파생!' },
        { pose: 'idle', text: '분류 매칭 문제로!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '속성 3분류',
          body:
            '속성은 출처와 생성 방식에 따라 기본·설계·파생의 3가지로 나뉩니다.',
        },
        {
          kind: 'table',
          headers: ['분류', '의미', '예시'],
          rows: [
            ['기본속성', '업무에서 이미 존재하는 원천 속성', '이름, 주민등록번호, 주소'],
            ['설계속성', '설계 과정에서 새로 정의된 속성', '고객ID, 주문번호'],
            ['파생속성', '다른 속성에서 계산·가공해 생성', '총구매액, 평균단가, 나이(생년월일→계산)'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '도메인(Domain)',
          body:
            '속성이 가질 수 있는 값의 범위·제약. 예: "성별" 속성의 도메인은 {\'M\', \'F\'}. 도메인 정의는 데이터 정합성의 기본.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s4',
      title: '관계와 카디널리티',
      quizId: 'sqld-1-1-cp-04',
      dialogue: [
        { pose: 'wave', text: '[관계] — 엔티티끼리 어떻게 연결되나! 부서와 사원, 학생과 과목 같은.' },
        { pose: 'think', text: '카디널리티 3종: [1:1] (일대일) · [1:N] (일대다) · [N:M] (다대다).' },
        { pose: 'lightbulb', text: '"부서 1개 ↔ 사원 여러" → [1:N]. "학생 ↔ 과목" → [N:M] (여러 학생이 여러 과목 수강).' },
        { pose: 'happy', text: 'N:M 은 실제 DB에서는 [중간 테이블] 로 풀어서 구현해!' },
        { pose: 'idle', text: '관계 차수 맞히기! 문제로!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '관계의 3요소',
          body:
            '두 엔티티 간의 연결을 "관계" 라 부릅니다. 관계를 읽을 때는 (1) 관계명 (2) 카디널리티 (3) 선택성(참여도) 을 함께 봅니다.',
        },
        {
          kind: 'keypoints',
          title: '카디널리티(Cardinality) 3종',
          items: [
            '1:1 (일대일) — 사원과 사물함',
            '1:N (일대다) — 부서와 사원, 고객과 주문',
            'N:M (다대다) — 학생과 과목, 상품과 주문',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'N:M 풀기',
          body:
            '관계형 DB 는 N:M 을 직접 표현하지 못하므로 중간 교차 테이블(Associative Entity) 로 쪼갭니다. "학생–수강–과목" 에서 수강이 중간 테이블입니다.',
        },
      ],
    },
  ],
};

const SQLD_1_2: Lesson = {
  id: 'sqld-1-2',
  subject: 'sqld',
  chapter: 1,
  chapterTitle: '데이터 모델링의 이해',
  topic: '데이터 모델과 성능',
  title: '정규화·반정규화·식별자',
  hook: '좋은 테이블은 "중복이 없고 이상이 안 생기게" 쪼갠 것. 단, 성능이 필요하면 다시 합친다.',
  estimatedMinutes: 8,
  steps: [
    {
      id: 'sqld-1-2-s1',
      title: '정규화의 목적',
      quizId: 'sqld-1-2-cp-01',
      dialogue: [
        { pose: 'wave', text: '[정규화] — 테이블을 [잘게 쪼개] 중복·이상을 없애는 작업!' },
        { pose: 'think', text: '목적 3가지: [중복 최소화] · [이상(Anomaly) 방지] · [일관성 유지].' },
        { pose: 'lightbulb', text: '이상 3종: [삽입 이상] · [삭제 이상] · [갱신 이상]!' },
        { pose: 'happy', text: '주의: 조회 성능은 [떨어질 수 있어]! JOIN 이 늘어나니까. 성능은 반정규화로 보정!' },
        { pose: 'idle', text: '정규화 목적이 "아닌" 것 찾기! 문제로!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '정규화(Normalization) 는 테이블을 "더 작은 테이블들" 로 쪼개 중복을 없애고 이상(Anomaly) 을 방지하는 설계 원칙입니다.',
        },
        {
          kind: 'keypoints',
          title: '목적',
          items: [
            '데이터 중복 최소화 — 저장공간 절감 + 일관성 확보',
            '이상 현상 방지 — 삽입/삭제/갱신 이상 방지',
            '무결성 유지 — 일관된 데이터 상태 보장',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '조회 성능은 오히려 ↓',
          body:
            '정규화는 테이블을 늘리므로 JOIN 횟수가 증가해 조회 성능이 떨어질 수 있습니다. 성능이 필요하면 반정규화로 보정합니다.',
        },
      ],
    },
    {
      id: 'sqld-1-2-s2',
      title: '정규형 1NF → BCNF',
      quizId: 'sqld-1-2-cp-02',
      dialogue: [
        { pose: 'wave', text: '[정규형] — 정규화 단계. 보통 [3NF] 까지 많이 가고, 엄격하면 [BCNF]!' },
        { pose: 'think', text: '[1NF]: 모든 값이 원자값. [2NF]: 부분 함수 종속 제거 (완전 함수 종속). [3NF]: 이행 함수 종속 제거.' },
        { pose: 'lightbulb', text: '[BCNF]: 모든 [결정자] 가 [후보키] 여야 함. 3NF 보다 강한 조건!' },
        { pose: 'happy', text: '암기법: [원·부·이·결] — 원자값/부분종속/이행종속/결정자!' },
        { pose: 'idle', text: '2NF 규칙 맞히기! 문제로!' },
      ],
      blocks: [
        {
          kind: 'table',
          title: '정규형 단계',
          headers: ['정규형', '규칙'],
          rows: [
            ['1NF (제1정규형)', '모든 속성이 원자값(Atomic Value) 을 가짐 — 반복 그룹 제거'],
            ['2NF (제2정규형)', '1NF + 기본키 전체에 대한 완전 함수 종속 (부분 종속 제거)'],
            ['3NF (제3정규형)', '2NF + 이행 함수 종속 제거 (A→B, B→C 인 경우 A→C 제거)'],
            ['BCNF', '3NF + 모든 결정자가 후보키 (더 엄격)'],
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"원·부·이·결"',
          body:
            '1NF=원자값 · 2NF=부분종속제거 · 3NF=이행종속제거 · BCNF=결정자=후보키. 핵심 단어만 외우면 문제는 절반 풀린 것!',
        },
      ],
    },
    {
      id: 'sqld-1-2-s3',
      title: '반정규화',
      quizId: 'sqld-1-2-cp-03',
      dialogue: [
        { pose: 'wave', text: '[반정규화] — 정규화된 것을 다시 [합치거나 중복] 시켜 [조회 성능] 을 올리는 기법!' },
        { pose: 'think', text: '언제 쓰나? [대량 JOIN 반복] 으로 조회가 느릴 때, [같은 계산을 매번 반복] 할 때.' },
        { pose: 'lightbulb', text: '방법: [테이블 통합] · [컬럼 중복] · [파생 컬럼 추가] · [요약 테이블].' },
        { pose: 'happy', text: '대가: [갱신 부담] ↑ + [일관성 리스크] ↑. 세트로 외우기!' },
        { pose: 'idle', text: '반정규화가 적절한 상황 찾기!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '반정규화(Denormalization) 는 정규화된 테이블을 일부러 다시 "뭉치거나 중복시켜" 조회 성능을 끌어올리는 기법입니다.',
        },
        {
          kind: 'keypoints',
          title: '주요 방법',
          items: [
            '테이블 통합 — 1:1 관계 테이블을 하나로 합침',
            '컬럼 중복 — 자주 조회되는 컬럼을 다른 테이블에 복사',
            '파생 컬럼 추가 — 합계·평균·건수 같은 집계 결과를 미리 저장',
            '이력 요약 테이블 — 일별·월별 집계 테이블 별도 운영',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '성능 ↔ 일관성 트레이드오프',
          body:
            '반정규화는 INSERT/UPDATE 시 여러 곳을 동시에 수정해야 하므로 갱신 부담과 일관성 리스크가 커집니다. 꼭 필요한 지점에만 적용.',
        },
      ],
    },
    {
      id: 'sqld-1-2-s4',
      title: '주식별자(PK) 의 4가지 요건',
      quizId: 'sqld-1-2-cp-04',
      dialogue: [
        { pose: 'wave', text: '[주식별자] — 테이블의 [PK]! 각 행을 유일하게 구분하는 기준!' },
        { pose: 'think', text: '4요건: [유일성] · [최소성] · [불변성] · [존재성] (NOT NULL).' },
        { pose: 'lightbulb', text: '"의미가 있어야 함" 은 조건 [아님]! 의미 있는 값은 오히려 자주 바뀜.' },
        { pose: 'happy', text: '그래서 의미 없는 [인조키 (surrogate key)] 를 권장하는 경우가 많아!' },
        { pose: 'idle', text: '암기법: [유최불존] — 유일·최소·불변·존재!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '주식별자(Primary Key) 란',
          body:
            '테이블의 각 행(인스턴스) 을 유일하게 식별하는 기준이 되는 속성(또는 속성 집합).',
        },
        {
          kind: 'keypoints',
          title: '4가지 요건',
          items: [
            '유일성(Uniqueness) — 각 인스턴스가 유일하게 식별됨',
            '최소성(Minimality) — 꼭 필요한 속성만으로 구성 (중복 컬럼 X)',
            '불변성(Immutability) — 값이 자주 바뀌지 않음',
            '존재성(Existence) — NULL 이 아님',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '본질식별자 vs 인조식별자',
          body:
            '업무 의미가 있는 값(주민번호 등)은 "본질식별자" 지만 변경 리스크·개인정보 이슈가 큽니다. 대안으로 일련번호 같은 "인조식별자(surrogate key)" 를 PK 로 쓰는 경우가 많습니다.',
        },
      ],
    },
  ],
};

// ================================================================
// SQLD · 2과목 · SQL 기본 및 활용
// ================================================================

const SQLD_2_1: Lesson = {
  id: 'sqld-2-1',
  subject: 'sqld',
  chapter: 2,
  chapterTitle: 'SQL 기본 및 활용',
  topic: 'SQL 기본',
  title: 'SELECT · WHERE · GROUP BY · JOIN',
  hook: '모든 쿼리의 뼈대. 실행 순서부터 정확히!',
  estimatedMinutes: 10,
  steps: [
    {
      id: 'sqld-2-1-s1',
      title: 'SQL 실행 순서',
      quizId: 'sqld-2-1-cp-01',
      dialogue: [
        { pose: 'wave', text: '[SQL 실행 순서] — 이거 꼭 외워! 함정 문제 단골!' },
        { pose: 'think', text: '작성은 [SELECT] 부터지만, 엔진이 푸는 순서는 [FROM] 이 먼저야.' },
        { pose: 'lightbulb', text: '순서: [FROM] → [WHERE] → [GROUP BY] → [HAVING] → [SELECT] → [ORDER BY].' },
        { pose: 'happy', text: '암기법: [프웨그하셀오] — FROM·WHERE·GROUP·HAVING·SELECT·ORDER!' },
        { pose: 'idle', text: '실행 순서 맞히기! 문제로!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'SQL 은 "작성 순서" 와 "논리적 실행 순서" 가 다릅니다. 우리는 SELECT 부터 쓰지만, DB 엔진은 FROM 부터 처리합니다.',
        },
        {
          kind: 'table',
          title: '논리적 처리 순서',
          headers: ['단계', '절', '의미'],
          rows: [
            ['1', 'FROM / JOIN', '대상 테이블 결정'],
            ['2', 'WHERE', '행 단위 필터'],
            ['3', 'GROUP BY', '그룹화'],
            ['4', 'HAVING', '그룹 단위 필터'],
            ['5', 'SELECT', '컬럼 선택 및 표현식 계산'],
            ['6', 'ORDER BY', '정렬'],
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"프웨그하셀오"',
          body:
            'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. WHERE 는 "행 필터", HAVING 은 "그룹 필터" — 이 구분이 핵심!',
        },
      ],
    },
    {
      id: 'sqld-2-1-s2',
      title: 'NULL 과 3값 논리',
      quizId: 'sqld-2-1-cp-02',
      dialogue: [
        { pose: 'wave', text: '[NULL] — "값이 없음". 0 이나 "" 와 달라!' },
        { pose: 'think', text: 'NULL 과의 [=], [!=] 비교는 모두 [UNKNOWN] 을 반환. 예상과 다른 결과!' },
        { pose: 'lightbulb', text: '반드시 [IS NULL] · [IS NOT NULL] 써야 맞아!' },
        { pose: 'happy', text: '집계함수는 대부분 NULL을 [무시]해. COUNT(*) 는 NULL도 셈, COUNT(컬럼) 은 NULL 제외!' },
        { pose: 'idle', text: 'NULL 비교 연산자 맞히기!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: 'NULL 의 특별함',
          body:
            'NULL 은 "값이 없음" 을 의미합니다. 빈 문자열 \'\' 이나 0 과는 엄연히 다르며, 3값 논리(TRUE/FALSE/UNKNOWN) 의 UNKNOWN 을 만들어냅니다.',
        },
        {
          kind: 'keypoints',
          items: [
            'col = NULL → UNKNOWN (원하는 결과 안 나옴)',
            'col IS NULL · col IS NOT NULL → 올바른 방법',
            'NULL + 1 = NULL (산술 연산 결과도 NULL)',
            'COUNT(*) 는 NULL 포함, COUNT(컬럼) 은 NULL 제외',
            'AVG/SUM 은 NULL 무시',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'NVL / COALESCE',
          body:
            'NULL 을 다른 값으로 치환: Oracle 은 NVL(col, 0), 표준은 COALESCE(col, 0). COALESCE 는 인자 여러 개 중 첫 NOT NULL 을 반환.',
        },
      ],
    },
    {
      id: 'sqld-2-1-s3',
      title: 'GROUP BY 와 HAVING',
      quizId: 'sqld-2-1-cp-03',
      dialogue: [
        { pose: 'wave', text: '[GROUP BY] — 그룹으로 묶고 [집계함수] 로 요약. COUNT, SUM, AVG, MAX, MIN!' },
        { pose: 'think', text: '"행 하나하나 조건" 은 [WHERE], "집계 후 조건" 은 [HAVING]. 헷갈리면 바로 오답!' },
        { pose: 'lightbulb', text: '집계함수는 WHERE 에 못 써! 실행 순서상 GROUP BY 보다 먼저라 집계 결과가 아직 없음.' },
        { pose: 'happy', text: 'SELECT 절에 온 컬럼은 GROUP BY 에 있거나 집계함수로 감싸야 함!' },
        { pose: 'idle', text: '부서별 평균급여 조건 쿼리, 어느 게 맞나?' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '그룹화와 집계',
          body:
            'GROUP BY 는 같은 값을 가진 행들을 묶고, 집계함수로 묶음별 요약을 만듭니다. WHERE 는 "행 필터", HAVING 은 "집계 결과 필터".',
        },
        {
          kind: 'example',
          body:
            'SELECT DEPT, AVG(SAL) AS AVG_SAL\nFROM EMP\nWHERE HIRE_YEAR >= 2020\nGROUP BY DEPT\nHAVING AVG(SAL) >= 5000000\nORDER BY AVG_SAL DESC;',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '자주 틀리는 포인트',
          body:
            '(1) SELECT 의 비집계 컬럼은 모두 GROUP BY 에 있어야 함. (2) 집계함수는 WHERE 에 쓸 수 없음 — HAVING 에서만. (3) HAVING 은 GROUP BY 뒤, ORDER BY 앞.',
        },
      ],
    },
    {
      id: 'sqld-2-1-s4',
      title: 'JOIN 4종 세트',
      quizId: 'sqld-2-1-cp-04',
      dialogue: [
        { pose: 'wave', text: '[JOIN] — 여러 테이블을 엮는 가장 강력한 도구!' },
        { pose: 'think', text: '[INNER] (교집합) · [LEFT OUTER] (왼쪽 모두 보존) · [RIGHT OUTER] · [FULL OUTER] (합집합).' },
        { pose: 'lightbulb', text: '"사원 없는 부서까지 조회" → [LEFT OUTER JOIN] (부서 왼쪽에 두기)!' },
        { pose: 'happy', text: '[CROSS JOIN] 은 [카티시안 곱] — 모든 쌍. 신중히 쓰자!' },
        { pose: 'idle', text: '부서 없는 사원·사원 없는 부서 모두 보려면? 문제로!' },
      ],
      blocks: [
        {
          kind: 'table',
          title: 'JOIN 종류',
          headers: ['JOIN', '의미'],
          rows: [
            ['INNER JOIN', '양쪽에 매칭되는 행만 반환 (교집합)'],
            ['LEFT OUTER JOIN', '왼쪽 테이블의 모든 행 + 매칭된 오른쪽 (없으면 NULL)'],
            ['RIGHT OUTER JOIN', '오른쪽 테이블의 모든 행 + 매칭된 왼쪽'],
            ['FULL OUTER JOIN', '양쪽의 모든 행 (매칭 없는 쪽은 NULL)'],
            ['CROSS JOIN', '모든 행 쌍 — 카티시안 곱'],
            ['SELF JOIN', '같은 테이블을 두 번 참조 (사원-상사 관계 등)'],
          ],
        },
        {
          kind: 'example',
          body:
            '-- 사원이 없는 부서까지 조회\nSELECT D.DEPT_NAME, E.EMP_NAME\nFROM DEPT D\nLEFT OUTER JOIN EMP E ON D.DEPT_ID = E.DEPT_ID;',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'NATURAL JOIN 과 USING',
          body:
            'NATURAL JOIN 은 같은 이름 컬럼을 자동 매칭 (권장 X — 실수 유발). USING(컬럼명) 은 명시적으로 조인 컬럼을 지정하는 깔끔한 방법.',
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
  title: '서브쿼리 · 집합연산 · 윈도우 함수',
  hook: '한 쿼리 안에 쿼리를 품고, 여러 결과를 합치고, 순위를 매긴다.',
  estimatedMinutes: 10,
  steps: [
    {
      id: 'sqld-2-2-s1',
      title: '서브쿼리 4종',
      quizId: 'sqld-2-2-cp-01',
      dialogue: [
        { pose: 'wave', text: '[서브쿼리] — 쿼리 안의 쿼리! 쓰는 위치에 따라 이름이 달라져.' },
        { pose: 'think', text: '[스칼라] (SELECT 절) · [인라인 뷰] (FROM 절) · [중첩] (WHERE 절) · [상관] (바깥 값 참조).' },
        { pose: 'lightbulb', text: '[상관 서브쿼리] 는 바깥 쿼리 값을 [참조] 해서 행마다 다시 실행됨. 느릴 수 있어!' },
        { pose: 'happy', text: '[비상관] = 독립 실행, [상관] = 바깥 값 필요. 명확히 구분!' },
        { pose: 'idle', text: '설명 틀린 것 찾기! 문제로!' },
      ],
      blocks: [
        {
          kind: 'table',
          title: '서브쿼리 위치별 분류',
          headers: ['유형', '위치', '특징'],
          rows: [
            ['스칼라 서브쿼리', 'SELECT 절', '한 행·한 컬럼 반환'],
            ['인라인 뷰', 'FROM 절', '임시 테이블처럼 동작'],
            ['중첩 서브쿼리', 'WHERE 절', 'IN, EXISTS 등과 함께'],
            ['상관 서브쿼리', 'WHERE 절', '바깥 쿼리 값을 참조 → 행마다 실행'],
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '상관 vs 비상관',
          body:
            '상관(Correlated): 바깥 쿼리 컬럼 참조 → 행마다 실행. 비상관(Non-Correlated): 독립적으로 한 번만 실행. 상관은 EXISTS 와 자주 쓰임.',
        },
        {
          kind: 'example',
          body:
            '-- 상관 서브쿼리 예: 부서 평균보다 급여가 높은 사원\nSELECT EMP_NAME, SAL\nFROM EMP E\nWHERE SAL > (SELECT AVG(SAL) FROM EMP WHERE DEPT_ID = E.DEPT_ID);',
        },
      ],
    },
    {
      id: 'sqld-2-2-s2',
      title: '집합 연산자',
      quizId: 'sqld-2-2-cp-02',
      dialogue: [
        { pose: 'wave', text: '[집합 연산자] — 두 쿼리 결과를 [세로로] 합치는 도구!' },
        { pose: 'think', text: '[UNION] (중복제거) · [UNION ALL] (중복포함) · [INTERSECT] (교집합) · [MINUS/EXCEPT] (차집합).' },
        { pose: 'lightbulb', text: '[UNION ALL] 이 가장 빠름 — 정렬·중복제거를 안 해!' },
        { pose: 'happy', text: '전제: 두 쿼리의 [컬럼 개수] 와 [데이터 타입] 이 호환되어야 해!' },
        { pose: 'idle', text: '중복 유지하는 건? 문제로!' },
      ],
      blocks: [
        {
          kind: 'table',
          title: '집합 연산자',
          headers: ['연산자', '의미', '비용'],
          rows: [
            ['UNION', '합집합 — 중복 제거 + 정렬', '높음'],
            ['UNION ALL', '이어붙이기 — 중복 포함', '낮음 (가장 빠름)'],
            ['INTERSECT', '교집합 — 양쪽 모두 있는 행', '중간'],
            ['MINUS (EXCEPT)', '차집합 — 앞에서 뒤를 뺀 결과', '중간'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '성능 팁',
          body:
            '중복이 없음을 이미 알거나 중복 제거가 필요 없으면 UNION ALL 을 사용하세요. 중복 제거 비용을 안 내서 훨씬 빠릅니다.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '전제 조건',
          body:
            '집합 연산자를 쓰려면 두 쿼리의 (1) 컬럼 개수가 같고 (2) 대응 컬럼의 데이터 타입이 호환되어야 합니다. 컬럼 이름은 첫 쿼리 기준.',
        },
      ],
    },
    {
      id: 'sqld-2-2-s3',
      title: '윈도우 함수 — 순위',
      quizId: 'sqld-2-2-cp-03',
      dialogue: [
        { pose: 'wave', text: '[윈도우 함수] — 그룹 내 순위·누적·이동평균 등을 GROUP BY 없이 계산!' },
        { pose: 'think', text: '순위 3종: [RANK] (동점=같은 순위, 건너뜀) · [DENSE_RANK] (건너뛰지 않음) · [ROW_NUMBER] (고유 순번).' },
        { pose: 'lightbulb', text: '예: 점수 90,90,80 → RANK 는 1,1,3 / DENSE_RANK 는 1,1,2 / ROW_NUMBER 는 1,2,3!' },
        { pose: 'happy', text: '문법: [함수() OVER (PARTITION BY 기준 ORDER BY 정렬)]!' },
        { pose: 'idle', text: '동점자 다음 순위 건너뛰지 않는 함수?' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '윈도우 함수 기본 문법',
          body:
            '윈도우 함수는 OVER() 절로 "행들의 창(window)" 을 정의합니다. PARTITION BY 로 그룹, ORDER BY 로 순서, 필요시 ROWS/RANGE 로 윈도우 크기.',
        },
        {
          kind: 'example',
          body:
            '-- 부서별 급여 순위\nSELECT EMP_NAME, DEPT_ID, SAL,\n       RANK() OVER (PARTITION BY DEPT_ID ORDER BY SAL DESC) AS RNK\nFROM EMP;',
        },
        {
          kind: 'table',
          title: '대표 윈도우 함수',
          headers: ['함수', '의미'],
          rows: [
            ['RANK()', '동점 같은 순위, 다음 순위 건너뜀 (1,1,3)'],
            ['DENSE_RANK()', '동점 같은 순위, 다음 순위 연속 (1,1,2)'],
            ['ROW_NUMBER()', '동점 없이 고유 순번 (1,2,3)'],
            ['LAG/LEAD', '이전/다음 행의 값 참조'],
            ['SUM/AVG OVER', '누적 합계·이동 평균'],
            ['NTILE(n)', 'n 개 그룹으로 균등 분할'],
          ],
        },
      ],
    },
    {
      id: 'sqld-2-2-s4',
      title: 'DDL · DML · DCL · TCL',
      quizId: 'sqld-2-2-cp-04',
      dialogue: [
        { pose: 'wave', text: 'SQL 은 [4가지 명령군] 으로 나뉘어!' },
        { pose: 'think', text: '[DDL] (데이터 정의) · [DML] (데이터 조작) · [DCL] (권한) · [TCL] (트랜잭션 제어).' },
        { pose: 'lightbulb', text: '[TCL] 의 핵심 3종: [COMMIT] · [ROLLBACK] · [SAVEPOINT]!' },
        { pose: 'happy', text: '암기법: [정조권트] — 정의·조작·권한·트랜잭션!' },
        { pose: 'idle', text: 'COMMIT 이 속한 그룹은? 문제로!' },
      ],
      blocks: [
        {
          kind: 'table',
          title: 'SQL 명령 4군',
          headers: ['그룹', '의미', '대표 명령'],
          rows: [
            ['DDL (Definition)', '객체 정의·변경', 'CREATE, ALTER, DROP, TRUNCATE'],
            ['DML (Manipulation)', '데이터 조작', 'SELECT, INSERT, UPDATE, DELETE, MERGE'],
            ['DCL (Control)', '권한 제어', 'GRANT, REVOKE'],
            ['TCL (Transaction)', '트랜잭션 제어', 'COMMIT, ROLLBACK, SAVEPOINT'],
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '트랜잭션의 ACID',
          body:
            '원자성(Atomicity) · 일관성(Consistency) · 격리성(Isolation) · 지속성(Durability). COMMIT 전까지는 "되돌릴 수 있다"가 핵심.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'TRUNCATE 는 DDL',
          body:
            'DELETE 처럼 "모든 행 삭제" 에 쓰이지만 TRUNCATE 는 DDL 이라 자동 COMMIT 됩니다. ROLLBACK 불가 — 되돌릴 수 없음!',
        },
      ],
    },
  ],
};

// ================================================================
// Export & helpers
// ================================================================

export const ALL_LESSONS: Lesson[] = [
  ADSP_1_1,
  ADSP_1_2,
  ADSP_1_3,
  ADSP_2_1,
  ADSP_2_2,
  ADSP_2_3,
  ADSP_3_1,
  ADSP_3_2,
  ADSP_3_3,
  ADSP_3_4,
  SQLD_1_1,
  SQLD_1_2,
  SQLD_2_1,
  SQLD_2_2,
];

export function getLesson(
  subject: Subject,
  chapter: number,
  topic: string,
): Lesson | undefined {
  return ALL_LESSONS.find(
    (l) =>
      l.subject === subject && l.chapter === chapter && l.topic === topic,
  );
}

/** 같은 챕터의 레슨을 subjects.ts 의 토픽 순서대로 반환. */
export function getLessonsInChapter(
  subject: Subject,
  chapter: number,
): Lesson[] {
  const schema = SUBJECT_SCHEMAS[subject];
  const ch = schema.chapters.find((c) => c.chapter === chapter);
  if (!ch) return [];
  const byTopic = new Map(
    ALL_LESSONS.filter(
      (l) => l.subject === subject && l.chapter === chapter,
    ).map((l) => [l.topic, l]),
  );
  return ch.topics
    .map((t) => byTopic.get(t))
    .filter((l): l is Lesson => !!l);
}

/**
 * 챕터 전체의 (lesson, step, chapterStepIndex) flat 리스트.
 * chapterStepIndex 는 1-based — 진행바에 바로 쓸 수 있음.
 */
export interface ChapterStepEntry {
  lesson: Lesson;
  step: LessonStep;
  /** 0-based 챕터 내 스텝 인덱스. */
  index: number;
}

export function getChapterSteps(
  subject: Subject,
  chapter: number,
): ChapterStepEntry[] {
  const lessons = getLessonsInChapter(subject, chapter);
  const out: ChapterStepEntry[] = [];
  let i = 0;
  for (const lesson of lessons) {
    for (const step of lesson.steps) {
      out.push({ lesson, step, index: i++ });
    }
  }
  return out;
}

/** quizId → MCQ 조회. */
export function getQuizQuestion(
  quizId: string,
): MultipleChoiceQuestion | undefined {
  const q = ALL_QUESTIONS.find((x) => x.id === quizId);
  if (!q) return undefined;
  if (q.type !== 'multiple_choice') return undefined;
  return q;
}

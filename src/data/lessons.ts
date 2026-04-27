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
    // ─── DIKW 피라미드 — 1 step → 5 steps 로 분해 (Phase C, 2026-04-27) ───
    {
      id: 'adsp-1-1-s1',
      title: 'DIKW 피라미드 — 4단계 개요',
      quizId: 'adsp-1-1-cp-01a',
      dialogue: [
        { pose: 'wave', text: '안녕! 첫 시간이야. 오늘은 [DIKW 피라미드] 부터.' },
        { pose: 'think', text: '같은 데이터도 가공 정도에 따라 가치가 달라져. 단계는 4개야.' },
        { pose: 'happy', text: '데이터(D) → 정보(I) → 지식(K) → 지혜(W). 줄여서 [데정지혜].' },
        { pose: 'idle', text: '먼저 4단계 순서를 한 번 확인하고 가자.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'DIKW 피라미드는 데이터가 의사결정에 쓰이기까지의 가공 단계를 4 층으로 정리한 모델입니다. 아래로 갈수록 양은 많고 가치는 낮으며, 위로 갈수록 양은 줄지만 의사결정에 직접 쓰입니다.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"데정지혜" 로 외우자',
          body:
            '데이터(Data) → 정보(Information) → 지식(Knowledge) → 지혜(Wisdom). 시험에 순서를 묻는 문제가 자주 나옵니다.',
        },
        {
          kind: 'table',
          title: '4단계 한 줄 정리',
          headers: ['단계', '정의', '예시'],
          rows: [
            ['데이터', '가공 전 측정값', 'B마트 콜라 1,500원'],
            ['정보', '비교·해석이 더해진 의미', 'B마트가 300원 더 싸다'],
            ['지식', '일반화된 규칙', '콜라는 B마트가 유리'],
            ['지혜', '새 영역으로의 확장 추론', '음료 전반 B마트가 저렴할 것'],
          ],
        },
      ],
    },
    {
      id: 'adsp-1-1-s1-data',
      title: 'DIKW ① 데이터 (Data) — 가공 전 raw 값',
      quizId: 'adsp-1-1-cp-01b',
      dialogue: [
        { pose: 'wave', text: '첫 단계, [데이터] 야.' },
        { pose: 'think', text: '머리속에서 "이 정도면 좋은 가격이지" 같은 판단이 일어나기 [전] 의 단계.' },
        { pose: 'happy', text: '예: "B마트 콜라 1,500원". 그냥 가격표를 본 그 순간이야.' },
        { pose: 'idle', text: '어떤 게 데이터 단계인지 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '데이터(Data) 는 측정·관찰·기록의 결과 그 자체입니다. 어떤 의미나 해석도 붙지 않은 raw 값이에요. 마트에 가서 가격표를 본 그 순간, 체중계 위에 올라가서 숫자가 표시된 그 순간 — 그게 데이터입니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '편의점 영수증의 "삼다수 800원" / 체중계 화면의 "68.4kg" / 출석부에 찍힌 "9시 02분 출근" / 기상청 센서가 기록한 "오전 9시 기온 21.3℃". 모두 단일 측정값입니다. 다른 값과 비교하지도, "그래서 뭐?" 라는 의미를 붙이지도 않은 상태.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "그래서 뭐?" 가 빠져 있다',
          body:
            '"~원", "~kg", "~℃" 처럼 단일 값만 등장하고 다른 값과의 비교가 없다면 데이터 단계입니다. "B마트가 300원 싸다" 처럼 비교가 시작되면 다음 단계(정보) 로 넘어간 것.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s1-info',
      title: 'DIKW ② 정보 (Information) — 비교·집계로 의미가 생김',
      quizId: 'adsp-1-1-cp-01c',
      dialogue: [
        { pose: 'wave', text: '둘째, [정보] 단계.' },
        { pose: 'lightbulb', text: '데이터끼리 [비교·집계] 하면 "그래서 어떻다는 건지" 가 드러나.' },
        { pose: 'happy', text: '예: "B마트 1,500원 vs A마트 1,800원 → B마트가 300원 싸다". 점들을 잇는 선이야.' },
        { pose: 'idle', text: '정보 단계 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '정보(Information) 는 여러 데이터를 비교·집계·맥락 안에 놓아 "그래서 어떤 뜻이지?" 가 드러난 단계입니다. 데이터가 점이라면 정보는 점들을 잇는 선. 한 번 비교가 일어나는 순간 데이터는 정보로 승격합니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '"이번 주 평균 매출 320만원, 지난 주 280만원 → 14% 증가" / "이 학생의 수학 점수 85점, 반 평균 72점 → 평균보다 13점 높음" / "오늘 강수량 50mm, 6월 평균 60mm → 평균보다 적은 비". 모두 단일 값이 아니라 비교·집계가 들어 있습니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — 비교는 있는데 일반화는 아직',
          body:
            '"이번엔 ~가 더 ~하다" 까지가 정보. "다음에도 ~가 더 ~할 것" 처럼 미래에 적용되는 규칙으로 굳어지면 다음 단계(지식). 한 번의 비교 결과인지 여러 번 통하는 룰인지로 가릅니다.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s1-knowledge',
      title: 'DIKW ③ 지식 (Knowledge) — 반복 가능한 규칙',
      quizId: 'adsp-1-1-cp-01',
      dialogue: [
        { pose: 'wave', text: '셋째, [지식] 단계.' },
        { pose: 'think', text: '여러 번의 정보가 모이면 [다음에도 통할 룰] 이 보여.' },
        { pose: 'happy', text: '예: "콜라는 B마트가 유리해" — 한 번이 아니라 매번 그렇더라.' },
        { pose: 'idle', text: '어떤 게 지식 단계인지 골라봐!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '지식(Knowledge) 은 여러 정보를 묶어 "이런 상황엔 이렇게 한다" 라는 규칙·패턴으로 굳힌 단계입니다. 정보가 "이번에 어떻더라" 의 일회성 관찰이라면 지식은 "다음에도 그럴 것" 의 반복 가능한 룰.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '"콜라류는 B마트, 과일은 농협하나로마트가 항상 더 싸다" / "비 오는 화요일엔 매장 매출이 평소보다 20% 떨어진다" / "겨울엔 따뜻한 음료가 평소보다 2배 더 팔린다". 한 번의 비교로 끝나지 않고 "다음에 또 그럴 때도 이렇게 결정하면 된다" 는 의사결정용 룰.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "다음에도" 가 들어간다',
          body:
            '"~할 때는 ~한다", "~가 유리하다", "보통 ~다" 같은 일반화된 표현이 등장하면 지식. 한 번의 비교 결과면 정보, 새 영역으로의 확장 추론(직접 본 적 없는 영역) 이면 다음 단계(지혜).',
        },
      ],
    },
    {
      id: 'adsp-1-1-s1-wisdom',
      title: 'DIKW ④ 지혜 (Wisdom) — 새 영역으로의 확장',
      quizId: 'adsp-1-1-cp-01d',
      dialogue: [
        { pose: 'wave', text: '마지막, [지혜] 단계.' },
        { pose: 'lightbulb', text: '지식이 [직접 본 영역의 룰] 이라면, 지혜는 [본 적 없는 영역으로 확장] 한 추론.' },
        { pose: 'happy', text: '예: "콜라가 B마트에서 싸니까, 음료 전반도 B마트가 쌀 가능성이 크다".' },
        { pose: 'idle', text: '마지막 단계, 지혜 예시를 골라봐!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '지혜(Wisdom) 는 검증된 지식을 새로운 영역으로 확장하는 창의적 추론입니다. 직접 비교한 적 없는 영역까지 같은 룰이 통할 거라 미루어 짐작하는 통찰. DIKW 의 가장 위, 양은 가장 적지만 가치는 가장 높습니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '"콜라가 B마트에서 매번 싸다 → 따라서 음료 카테고리 전체도 B마트가 유리할 것" (콜라 → 음료 전반으로 확장) / "장맛비 화요일에 매출이 떨어진다 → 다른 악천후 평일에도 비슷하게 떨어질 것" (비 → 악천후 일반화) / "X 약이 환자 100명에게 효과적이었다 → 비슷한 증상의 새 환자에게도 시도할 가치가 있다". 모두 직접 보지 않은 새 영역으로 룰을 미루어 적용하는 추론.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "확장 / 미루어 / 따라서"',
          body:
            '"따라서 다른 영역도 ~할 것", "~로 미루어 ~할 것" 같은 확장 추론이 등장하면 지혜. 같은 영역의 반복 룰이면 지식. 시험 단골 키워드: 창의적 아이디어, 통찰, 확장 추론.',
        },
      ],
    },
    // ─── 데이터 3가지 분류 기준 — 1 step → 4 substeps ───
    // ─── 데이터 3가지 분류 기준 — 1 step → 4 substeps (beginner-friendly 보강) ───
    {
      id: 'adsp-1-1-s2',
      title: '데이터 분류 — 3축 동시 적용 (개요)',
      quizId: 'adsp-1-1-cp-02',
      dialogue: [
        { pose: 'wave', text: '같은 데이터라도 [3가지 다른 질문] 으로 분류해야 완전해.' },
        { pose: 'think', text: '"어떻게 정리되어 있나?" (구조) · "숫자로 잴 수 있나?" (형태) · "값이 뭘 의미하나?" (값).' },
        { pose: 'happy', text: '시험 함정 1위는 "어느 축으로 묻는지" 헷갈리게 섞는 문제. 축을 분리해서 보면 안 꼬여.' },
        { pose: 'idle', text: '먼저 3축 통합 예시로 감을 잡자.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '"고객 리뷰 텍스트는 어떤 데이터인가?" 같은 시험 문제는 한 마디로는 답이 안 됩니다. 같은 데이터를 세 가지 다른 관점으로 묻거든요. (1) 어떻게 정리됐나(구조) (2) 숫자로 잴 수 있나(형태) (3) 값이 무엇을 의미하나(값) — 이 세 축에 각각 답해야 완전한 분류가 됩니다.',
        },
        {
          kind: 'section',
          title: '예시로 한 번에 — "고객 리뷰 텍스트"',
          body:
            '같은 "고객 리뷰 텍스트" 를 3축으로 답해보면: 구조 = 비정형(미리 정해진 행·열 없음) · 형태 = 정성적(숫자가 아닌 자연어) · 값 = 범주형(특정 단어/감정 라벨로 분류). 한 데이터에 답이 3개 동시에 붙는다는 게 핵심입니다.',
        },
        {
          kind: 'table',
          title: '3축 한눈에',
          headers: ['축', '질문', '유형'],
          rows: [
            ['구조', '정리 형태가 어떤가?', '정형 / 반정형 / 비정형'],
            ['형태', '값이 숫자인가?', '정량 / 정성'],
            ['값', '값이 무엇을 의미하나?', '수치 / 범주'],
          ],
        },
      ],
    },
    {
      id: 'adsp-1-1-s2-structure',
      title: '데이터 분류 ① 구조 — 정형/반정형/비정형',
      quizId: 'adsp-1-1-cp-02-structure',
      dialogue: [
        { pose: 'wave', text: '첫째 축은 [구조] — "정리가 얼마나 깔끔한가?".' },
        { pose: 'think', text: '엑셀 표처럼 행·열이 정해져 있으면 [정형]. 문법은 있는데 모양이 자유로우면 [반정형]. 틀 자체가 없으면 [비정형].' },
        { pose: 'happy', text: '쉽게: 엑셀 → JSON → 동영상 순으로 점점 자유로워지는 거야.' },
        { pose: 'idle', text: '비정형 데이터 예시를 한 번 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '"구조" 라는 말이 어렵게 들리지만, 결국 "데이터가 얼마나 깔끔하게 정리돼 있느냐" 의 문제입니다. 학생 명단 엑셀처럼 행·열·열 이름이 미리 정해져 있는지, 아니면 친구가 보낸 음성 메시지처럼 그냥 한 덩어리인지의 차이예요.',
        },
        {
          kind: 'section',
          title: '① 정형 (Structured)',
          body:
            '엑셀 표 · 데이터베이스 테이블처럼 "어디에 무엇이 들어갈지" 가 미리 정해져 있는 데이터입니다. 이름·학번·전공이라는 열이 정해져 있고, 모든 학생이 같은 형식으로 한 행씩 들어갑니다. 컴퓨터가 가장 다루기 쉬운 형태 — SQL 한 줄로 검색·집계가 됩니다. 예: 회사 ERP 의 매출 테이블, 출석부 엑셀, 통장 거래내역.',
        },
        {
          kind: 'section',
          title: '② 반정형 (Semi-structured)',
          body:
            '"규칙은 있는데 모양이 자유롭다" 는 데이터입니다. 카카오톡 대화방을 백업해보면 메시지마다 보낸 사람·시간·내용이라는 항목 이름(=태그·키) 은 동일하지만, 어떤 메시지엔 사진이 들어가고 어떤 메시지엔 이모티콘만 있어 길이·내용이 매번 달라요. JSON·XML·HTML 이 대표 — 사람도 컴퓨터도 어느 정도 읽을 수 있지만 매번 모양이 다릅니다.',
        },
        {
          kind: 'section',
          title: '③ 비정형 (Unstructured)',
          body:
            '미리 정해진 틀이 전혀 없는 데이터입니다. 친구가 보낸 음성 메시지, CCTV 영상 30분, 인스타에 올린 사진, 자유롭게 쓴 블로그 글 — 사람은 의미를 바로 알아채지만 컴퓨터 입장에선 그냥 바이트(0과 1) 의 긴 묶음이에요. 분석에 쓰려면 별도로 텍스트 추출·이미지 인식 같은 가공 단계가 먼저 필요합니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '구분 팁 — 한 줄로',
          body:
            '"미리 정해진 행·열 표에 들어가나?" → 들어가면 정형, 항목 이름은 있는데 모양이 매번 달라지면 반정형, 표 자체가 안 만들어지면 비정형.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s2-form',
      title: '데이터 분류 ② 형태 — 정량/정성',
      quizId: 'adsp-1-1-cp-02-form',
      dialogue: [
        { pose: 'wave', text: '둘째 축은 [형태] — "숫자로 잴 수 있나?".' },
        { pose: 'think', text: '체중·매출처럼 숫자로 측정되면 [정량적]. 리뷰·인터뷰처럼 말·감정·서술이면 [정성적].' },
        { pose: 'happy', text: '주의 — 정성적 = 비정형 은 아니야. 학점(A·B·C) 처럼 정성적 + 정형 도 가능해.' },
        { pose: 'idle', text: '정성적 데이터 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '같은 데이터라도 "이 값이 숫자인가, 말인가?" 를 묻는 축이 형태입니다. 키 175cm 처럼 자로 잴 수 있으면 정량적, "이 영화 정말 감동적이었어요" 같은 자연어·감정·서술이면 정성적이에요. 측정 단위가 명확한지로 갈립니다.',
        },
        {
          kind: 'section',
          title: '① 정량적 (Quantitative)',
          body:
            '숫자로 측정 가능한 데이터입니다. 평균·합계·표준편차 같은 통계 연산이 자연스럽게 적용됩니다. 예: 키 175cm, 월 매출 300만 원, 페이지 체류시간 42초, 쇼핑 카트 수량 3개. "더하기·평균이 의미가 있나?" 라고 자문해서 의미가 있으면 정량적입니다.',
        },
        {
          kind: 'section',
          title: '② 정성적 (Qualitative)',
          body:
            '말·감정·서술처럼 숫자가 아닌 형태로 표현된 데이터입니다. 예: 인터뷰 녹음, 자유 응답 리뷰("배송이 빠르고 직원이 친절해요"), 만족도 등급("매우 만족"·"보통"·"불만족"), 콜센터 통화 녹취록. 분석할 때는 텍스트 마이닝·감성 분석·코딩(범주화) 같은 별도 처리가 필요합니다.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — "정성적 = 비정형" 아님',
          body:
            '정성적과 비정형은 다른 축이에요. "매우 만족 / 만족 / 보통 / 불만족" 같은 등급 코드는 정성적(말·감정 표현) 이지만 미리 정해진 5개 라벨로 정형화 돼 있습니다. 정성+정형 데이터의 좋은 예. 두 축을 섞어 묻는 게 시험 단골 함정.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s2-value',
      title: '데이터 분류 ③ 값 — 수치/범주',
      quizId: 'adsp-1-1-cp-02-value',
      dialogue: [
        { pose: 'wave', text: '셋째 축은 [값] — "값이 무엇을 의미하나?".' },
        { pose: 'think', text: '숫자 자체에 크기 의미가 있으면 [수치형]. 라벨·카테고리이면 [범주형].' },
        { pose: 'happy', text: '함정: 1·2·3 이 적혀 있어도 "1=서울 2=부산 3=대구" 라면 범주형이야. 더하면 의미 없잖아.' },
        { pose: 'idle', text: '범주형 데이터 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '값(value) 축은 "이 값에 산수가 의미가 있는가?" 를 묻습니다. 키 175cm 는 더하고 평균낼 수 있어서 수치형, 혈액형 A·B·O·AB 는 더하기가 의미 없어서 범주형이에요. 형태는 표현 방식, 값은 그 값이 가지는 의미를 봅니다.',
        },
        {
          kind: 'section',
          title: '① 수치형 (Numerical)',
          body:
            '숫자 자체가 크기·차이·비율의 의미를 가지는 값입니다. 두 가지로 더 나뉘어요. 이산형(Discrete): 학생 수 23명, 카트 수량 3개처럼 셀 수 있는 정수. 연속형(Continuous): 키 175.3cm, 시간 42.5초처럼 소수점이 의미 있는 실수. 산술 연산(평균·합계·차이) 이 자연스럽게 통합니다.',
        },
        {
          kind: 'section',
          title: '② 범주형 (Categorical)',
          body:
            '값이 카테고리·라벨인 데이터입니다. 두 가지로 나눠요. 명목형(Nominal): 혈액형(A·B·O·AB), 도시(서울·부산), 성별 — 순서 의미 없음. 순서형(Ordinal): 학점(A·B·C·D), 만족도 5단계, 군대 계급 — 순서·서열은 있지만 간격은 일정하지 않음. 두 경우 모두 "더하기" 가 의미 없습니다.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — 숫자처럼 보이지만 범주형',
          body:
            '"1=서울, 2=부산, 3=대구" 처럼 코드로 1·2·3 이 적혀 있어도 그건 라벨일 뿐 범주형입니다. (1+3)/2 = 2 = "부산" 이라는 평균은 말이 안 되니까요. 시험에선 "숫자가 적혀 있다 = 수치형" 으로 속이는 함정 자주 등장.',
        },
      ],
    },
    // ─── SECI — 1 step → 5 substeps (암묵·형식 + 4 변환) ───
    {
      id: 'adsp-1-1-s3',
      title: '암묵지 · 형식지 · SECI 개요',
      quizId: 'adsp-1-1-cp-03',
      dialogue: [
        { pose: 'wave', text: '[자전거 타는 법] 을 책으로 옮길 수 있을까?' },
        { pose: 'think', text: '몸이 배운 노하우가 [암묵지]. 글로 정리되면 [형식지]. 조직은 이 변환으로 성장해.' },
        { pose: 'happy', text: '변환은 [4단계] — 공동화·표출화·연결화·내면화. "[공표연내]".' },
        { pose: 'idle', text: '먼저 암묵지/형식지 구분부터 확인.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '자전거 타는 법은 책으로 옮기기 어렵지만 누구나 탈 수 있습니다. 몸이 배운 노하우 — 이게 암묵지. 매뉴얼·논문처럼 글로 정리된 게 형식지. 조직은 둘 사이를 4가지 방식으로 순환시키며 지식을 키웁니다 (SECI).',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"공표연내"',
          body:
            'Socialization(공동화) → Externalization(표출화) → Combination(연결화) → Internalization(내면화). 시험에 4단계 매핑이 자주 등장합니다.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s3-S',
      title: 'SECI ① 공동화 (Socialization)',
      quizId: 'adsp-1-1-cp-03-S',
      dialogue: [
        { pose: 'wave', text: '첫 단계 [공동화] — 암묵지 → 암묵지.' },
        { pose: 'think', text: '말이나 글 없이 [몸에서 몸으로] 전해지는 단계야.' },
        { pose: 'happy', text: '예를 들어 신입사원이 선배 옆에 붙어 어깨너머로 일을 배우는 OJT 가 전형이야.' },
        { pose: 'idle', text: '공동화 예시를 한 번 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '공동화(Socialization) — 머리 속이나 몸에 있는 노하우(암묵지) 가 다른 사람의 머리·몸으로 그대로 옮겨가는 단계입니다. 중요한 건 "글로 적힌 게 없다" 는 점이에요. 같이 일하며 보고 따라하고, 시행착오를 옆에서 지켜보며 익힙니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '신입 요리사가 셰프 옆에서 1년간 어깨너머로 칼질을 익히는 경우 / 신입사원이 사수와 같이 출장 다니며 거래처 응대법을 몸으로 배우는 경우 / 숙련 기술자가 후배에게 "이 정도 압력으로 잡아야 해" 하며 손에 쥐어주는 경우. 모두 글이나 영상이 아닌 "함께 있어야만" 전해지는 지식.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 식별 키워드',
          body:
            '"OJT", "도제식", "현장 어깨너머", "동행 학습". 어딘가에 매뉴얼이나 문서가 등장하면 공동화 아님 — 표출화/연결화/내면화로 가야 합니다.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s3-E',
      title: 'SECI ② 표출화 (Externalization)',
      quizId: 'adsp-1-1-cp-03-E',
      dialogue: [
        { pose: 'wave', text: '둘째 [표출화] — 암묵지 → 형식지.' },
        { pose: 'think', text: '머릿속이나 몸에 있던 노하우를 글·도식·체크리스트로 [밖에 꺼내] 적는 단계야.' },
        { pose: 'happy', text: '시험 단골! 베테랑 기술자가 자기 비법을 매뉴얼로 정리한다 = 표출화.' },
        { pose: 'idle', text: '표출화 예시를 한 번 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '표출화(Externalization) — 사람 안(암묵지) 에 머물던 지식을 처음으로 외부의 형태(글·도식·매뉴얼) 로 꺼내는 단계입니다. 영어 단어 그대로 "externalize = 밖으로 끄집어 낸다". 조직이 한 사람의 노하우에 의존하지 않고 자산화 하는 결정적 단계여서, SECI 4단계 중 시험에 가장 자주 등장합니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '40년 경력 장인의 작업 노하우를 영상 인터뷰 후 작업 매뉴얼로 작성 / 베테랑 영업사원의 거래처 응대 비법을 영업 가이드북으로 정리 / 노년 의사의 진료 패턴을 체크리스트화. 핵심은 "원래 글이 없던 지식이 글로 만들어진다" 는 것.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 식별 키워드',
          body:
            '"노하우를 매뉴얼로", "비법을 가이드북으로", "암묵 → 형식". 이미 글로 정리된 자료를 또 다른 글로 합치면 다음 단계(연결화).',
        },
      ],
    },
    {
      id: 'adsp-1-1-s3-C',
      title: 'SECI ③ 연결화 (Combination)',
      quizId: 'adsp-1-1-cp-03-C',
      dialogue: [
        { pose: 'wave', text: '셋째 [연결화] — 형식지 → 형식지.' },
        { pose: 'think', text: '이미 글로 정리된 자료들을 [모아 합쳐] 새 자료를 만드는 단계.' },
        { pose: 'happy', text: '여러 부서 보고서를 묶어 전사 백서를 발간하는 게 연결화야.' },
        { pose: 'idle', text: '연결화 예시를 한 번 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '연결화(Combination) — 이미 형식지(=글) 로 존재하는 여러 자료를 결합·재구성·요약해 새로운 형식지를 만드는 단계입니다. 글 → 글 의 변환이라는 점이 핵심이에요. 사람 머리 속의 새 노하우를 끌어내는 게 아니라, 흩어진 글들을 묶어 새 그림을 그리는 작업.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '사업부별 분기 보고서 4개를 통합해 전사 분기 백서 발간 / 여러 산학 논문을 모아 종합 리뷰 페이퍼 작성 / 부서별 데이터 표를 합쳐 통합 대시보드 보고서 제작. 모두 출발점이 "이미 적혀 있는" 자료라는 점이 표출화와의 차이.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 식별 키워드',
          body:
            '"여러 보고서를 합쳐", "기존 자료를 종합", "표준 매뉴얼 제정". 사람 머릿속에서 처음 꺼내면 표출화, 매뉴얼을 보고 익히면 내면화.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s3-I',
      title: 'SECI ④ 내면화 (Internalization)',
      quizId: 'adsp-1-1-cp-03-I',
      dialogue: [
        { pose: 'wave', text: '넷째 [내면화] — 형식지 → 암묵지.' },
        { pose: 'think', text: '매뉴얼·교본을 읽고 직접 따라하다 [몸에 배는] 단계야. 표출화의 반대 방향.' },
        { pose: 'happy', text: '신입이 매뉴얼대로 6개월 연습해서 손에 익는 게 전형이야.' },
        { pose: 'idle', text: '내면화 예시를 한 번 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '내면화(Internalization) — 글·매뉴얼·교본 같은 형식지를 읽고 실제로 반복 적용해 자기 몸·머리에 체화하는 단계입니다. 글 → 사람 안. 표출화(사람 → 글) 의 반대 방향이에요. SECI 사이클이 한 바퀴 돌아 다시 새로운 암묵지가 만들어지는 마무리 단계.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '신입 간호사가 표준 진료 가이드를 6개월간 반복 적용하다 손에 익어 매뉴얼 없이도 자연스러워짐 / 코딩 신입이 코드 컨벤션 문서를 보며 짜다가 어느 순간 자동으로 그렇게 코드 짬 / 영업사원이 응대 매뉴얼대로 반복 시도하다 자기만의 응대 패턴이 됨. 글로 시작했지만 "이젠 안 보고도 된다" 가 핵심.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 식별 키워드',
          body:
            '"매뉴얼 보고 연습 → 숙련", "교본대로 반복 후 체화". 매뉴얼을 처음 만든 단계는 표출화, 매뉴얼끼리 합치면 연결화.',
        },
      ],
    },
    // ─── DB 특징 + DW/Data Lake — 1 step → 3 substeps (특징 5종 통합 + DW + Data Lake) ───
    {
      id: 'adsp-1-1-s4',
      title: 'DB 5특징 — "공·통·저·변" + 실시간',
      quizId: 'adsp-1-1-cp-04',
      dialogue: [
        { pose: 'wave', text: '엑셀과 DB 차이는 [5가지 성질].' },
        { pose: 'think', text: '[공]용·[통]합·[저]장·[변]화 + [실시간]. "공통저변 + 실시간".' },
        { pose: 'idle', text: '5성질을 한꺼번에 골라봐.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: 'DB 5특징',
          body:
            '공용(여러 사용자 공유) · 통합(중복 최소화) · 저장(영속) · 변화(수정 반영) + 실시간 처리. 엑셀 파일과 구분짓는 5가지.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s4-dw',
      title: 'DW (Data Warehouse) — 분석 창고',
      quizId: 'adsp-1-1-cp-04-dw',
      dialogue: [
        { pose: 'wave', text: 'DW — 운영계 데이터를 [ETL] 해서 정돈한 분석 창고.' },
        { pose: 'think', text: '주제별·시간별로 정형 데이터만 담음. OLAP 을 위한 읽기 전용.' },
        { pose: 'idle', text: 'DW 의 특징을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Data Warehouse 는 운영 시스템(OLTP) 데이터를 ETL(Extract-Transform-Load) 한 후 주제별로 정돈한 분석 창고. 주로 정형 데이터, OLAP·BI 가 사용.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"ETL", "주제별·시간별 정돈", "OLAP·BI". 정형/반정형/비정형 모두면 Data Lake.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s4-lake',
      title: 'Data Lake — 정제 전 저수지',
      quizId: 'adsp-1-1-cp-04-lake',
      dialogue: [
        { pose: 'wave', text: 'Data Lake — 정제 전 원시까지 다 담음.' },
        { pose: 'think', text: '정형·반정형·비정형 모두 raw 로 저장.' },
        { pose: 'idle', text: 'Data Lake 의 특징을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Data Lake 는 정형뿐 아니라 반정형·비정형·raw 데이터까지 형태 변환 없이 적재하는 저장소. Schema-on-read (읽을 때 구조 적용) 방식.',
        },
        {
          kind: 'keypoints',
          title: 'OLTP vs OLAP',
          items: [
            'OLTP: 거래 중심, 짧고 많은 insert/update',
            'OLAP: 분석 중심, 읽기 위주 집계·다차원 조회',
            'DW 는 OLAP 지원, Data Lake 는 raw 까지 보관',
          ],
        },
      ],
    },
    // ─── 기업 정보 시스템 5종 — 1 step → 6 substeps ───
    {
      id: 'adsp-1-1-s5',
      title: '기업 정보 시스템 — "생고공의" 개요',
      quizId: 'adsp-1-1-cp-05',
      dialogue: [
        { pose: 'wave', text: '회사 부서마다 다른 데이터 → 통합 시스템 필요.' },
        { pose: 'think', text: '5종: [DBMS] · [ERP] · [CRM] · [SCM] · [BI].' },
        { pose: 'idle', text: '먼저 5 시스템 매칭 + DBMS 유형.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"생고공의" 흐름',
          body:
            'ERP(생산·전사) → CRM(고객) → SCM(공급사슬) → BI(의사결정). 모두 DBMS 위에서 작동.',
        },
        {
          kind: 'keypoints',
          title: 'DBMS 유형 4가지',
          items: [
            '계층형: 트리 구조 1:N',
            '망형: 자식이 여러 부모',
            '관계형(RDB): 테이블·SQL — 가장 널리 쓰임',
            'NoSQL: 대용량·비정형 대응',
          ],
        },
      ],
    },
    {
      id: 'adsp-1-1-s5-dbms',
      title: '기업 시스템 ① DBMS',
      quizId: 'adsp-1-1-cp-05-dbms',
      dialogue: [
        { pose: 'wave', text: 'DBMS — 모든 시스템의 기반.' },
        { pose: 'think', text: '데이터베이스 생성·조회·수정·백업 소프트웨어.' },
        { pose: 'idle', text: 'DBMS 의 역할을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'DBMS(DataBase Management System) 는 데이터베이스의 생성·조회·수정·삭제·백업을 담당하는 소프트웨어. ERP·CRM·SCM·BI 모두 DBMS 위에서 동작.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"DB 관리 SW", "Oracle·MySQL·PostgreSQL". 전사 통합 업무는 ERP, 고객 관리는 CRM.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s5-erp',
      title: '기업 시스템 ② ERP',
      quizId: 'adsp-1-1-cp-05-erp',
      dialogue: [
        { pose: 'wave', text: 'ERP — Enterprise Resource Planning.' },
        { pose: 'think', text: '생산·판매·재무·인사 등 전사 업무를 하나로 통합.' },
        { pose: 'idle', text: 'ERP 의 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'ERP 는 생산·판매·재무·인사 등 전사적 자원을 하나의 시스템으로 통합해 부서 간 데이터 일관성을 확보합니다. 대표: SAP · Oracle ERP.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"전사 자원 통합", "생산·재무·인사 통합". 고객 관리만이면 CRM, 공급사슬만이면 SCM.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s5-crm',
      title: '기업 시스템 ③ CRM',
      quizId: 'adsp-1-1-cp-05-crm',
      dialogue: [
        { pose: 'wave', text: 'CRM — Customer Relationship Management.' },
        { pose: 'think', text: '고객 이력·성향 관리, 맞춤 마케팅·서비스.' },
        { pose: 'idle', text: 'CRM 의 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'CRM 은 고객 정보·구매 이력·접점 데이터를 통합 관리해 개인화된 마케팅·서비스 제공을 지원. 대표: Salesforce.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"고객 관리", "맞춤 마케팅". 공급자·재고면 SCM, 의사결정 BI.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s5-scm',
      title: '기업 시스템 ④ SCM',
      quizId: 'adsp-1-1-cp-05-scm',
      dialogue: [
        { pose: 'wave', text: 'SCM — Supply Chain Management.' },
        { pose: 'think', text: '원자재 조달 → 생산 → 유통 공급사슬 최적화.' },
        { pose: 'idle', text: 'SCM 의 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'SCM 은 원자재 조달부터 생산·유통·반품까지 공급사슬 전체를 통합 관리해 재고·납기·비용을 최적화. 협력사 정보 공유가 핵심.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"공급사슬 최적화", "조달·재고·물류". 고객 접점이면 CRM, 의사결정 대시보드면 BI.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s5-bi',
      title: '기업 시스템 ⑤ BI',
      quizId: 'adsp-1-1-cp-05-bi',
      dialogue: [
        { pose: 'wave', text: 'BI — Business Intelligence.' },
        { pose: 'think', text: '쌓인 데이터를 대시보드·리포트로 가공 → 의사결정.' },
        { pose: 'idle', text: 'BI 의 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'BI 는 데이터를 다차원 분석·리포트·대시보드로 시각화해 경영 의사결정을 지원. 대표: Tableau · Power BI · Looker.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"대시보드·리포트", "의사결정 지원". 운영 통합이면 ERP, 고객 관리면 CRM.',
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
    // ─── 3V · 데이터 단위 — 1 step → 4 substeps ───
    {
      id: 'adsp-1-2-s1',
      title: '빅데이터 단위 · 3V/5V 개요',
      quizId: 'adsp-1-2-cp-01',
      dialogue: [
        { pose: 'wave', text: '스마트폰 10분이 인류 1만 년 분량을 넘는다고 해.' },
        { pose: 'think', text: '단위 KB·MB·GB·TB·PB·EB·ZB·YB — 단계마다 1024배.' },
        { pose: 'happy', text: '"빅" 의 정의는 가트너 [3V]: Volume · Variety · Velocity.' },
        { pose: 'idle', text: '단위·3V 개요부터 확인!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '데이터 단위',
          body:
            'KB → MB → GB → TB → PB(페타) → EB(엑사) → ZB(제타) → YB(요타). 단계마다 1024배. PB 이상을 빅데이터 영역으로 봅니다.',
        },
        {
          kind: 'table',
          title: '가트너의 3V',
          headers: ['V', '의미', '예시'],
          rows: [
            ['Volume', '데이터의 양', 'PB 로그'],
            ['Variety', '형태의 다양성', '정형+이미지+센서'],
            ['Velocity', '생성·처리 속도', '초당 수만 건'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '5V · 7V 확장',
          body:
            '3V + Value(가치) + Veracity(진실성) = 5V. + Validity(유효성) + Volatility(휘발성) = 7V.',
        },
      ],
    },
    {
      id: 'adsp-1-2-s1-volume',
      title: '3V ① Volume — "데이터가 너무 많다"',
      quizId: 'adsp-1-2-cp-01-volume',
      dialogue: [
        { pose: 'wave', text: '첫째 V, [Volume] — 그냥 [양] 이야.' },
        { pose: 'think', text: '엑셀 한 장으론 절대 안 들어가는 [수십~수백 PB] 의 규모.' },
        { pose: 'happy', text: '한 대 컴퓨터로는 못 다뤄서 [여러 대로 나눠] 처리해야 해 (Hadoop · Spark).' },
        { pose: 'idle', text: 'Volume 의 핵심 키워드를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Volume(양) — 가장 직관적인 V 입니다. 단위 시간·공간에 쌓인 데이터의 절대 규모가 너무 커서 평소 도구(엑셀·MySQL 단일 인스턴스) 로는 다룰 수 없는 상태. PB(페타바이트, 1024 TB) 이상이 되면 한 대 컴퓨터의 디스크·메모리·CPU 한계를 넘어가 분산처리가 필요해집니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '카카오톡 하루치 메시지 로그 / 유튜브 1분당 업로드되는 영상 500시간 / 글로벌 신용카드 회사의 1주일치 결제 트랜잭션. 이런 규모는 이미 "파일 한 개로 저장" 자체가 불가능해서, 수백~수천 대 서버에 쪼개 담는 분산저장(HDFS) 과 분산처리(Hadoop·Spark) 가 필수가 됩니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "양" 만 강조되면 Volume',
          body:
            '"엄청난 규모", "PB·EB 단위", "분산 저장 필수" 가 키워드면 Volume. 데이터 종류가 다양하다면 Variety, 빠르게 들어오는 게 강조면 Velocity.',
        },
      ],
    },
    {
      id: 'adsp-1-2-s1-variety',
      title: '3V ② Variety — "형태가 너무 제각각"',
      quizId: 'adsp-1-2-cp-01-variety',
      dialogue: [
        { pose: 'wave', text: '둘째 V, [Variety] — 형태의 [다양성].' },
        { pose: 'think', text: '엑셀 같은 [정형] 만이 아니라 카톡 로그(반정형) · 사진 · 음성까지 [한꺼번에] 쏟아져.' },
        { pose: 'happy', text: '예전엔 정형 데이터만 분석했는데, 이젠 모든 형태가 같은 시스템에 들어와.' },
        { pose: 'idle', text: 'Variety 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Variety(다양성) — 한 시스템 안에 정형(엑셀·DB 테이블) · 반정형(JSON·XML·로그) · 비정형(영상·이미지·음성·자유 텍스트) 이 함께 들어오는 상황입니다. 단순히 양이 많은 게 아니라 형태가 제각각이라는 점이 핵심. 같은 양이라도 형태가 한 가지면 Variety 가 아닙니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '쇼핑몰이 분석에 쓰는 데이터 — 회원 DB(정형) + 클릭 로그 JSON(반정형) + 상품 이미지(비정형) + 고객 리뷰 텍스트(비정형) + 콜센터 통화 녹취(비정형). 5가지 형태가 한 추천 시스템에 동시 입력. 또는 자율주행차의 카메라 영상(비정형) + 라이다 센서(반정형) + 차량 운행 로그(정형) 통합. 모두 단일 형태가 아닌 "여러 형태 동시" 라는 점이 시험 식별 포인트.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "다양한 형태" 가 강조되면 Variety',
          body:
            '"정형+비정형 혼재", "이미지·텍스트·센서 동시", "다양한 출처" 가 키워드면 Variety. "양이 많다" 만 강조면 Volume, "빠르다" 만 강조면 Velocity.',
        },
      ],
    },
    {
      id: 'adsp-1-2-s1-velocity',
      title: '3V ③ Velocity — "쉴 새 없이 들어온다"',
      quizId: 'adsp-1-2-cp-01-velocity',
      dialogue: [
        { pose: 'wave', text: '셋째 V, [Velocity] — 생성·처리 [속도].' },
        { pose: 'think', text: '하루치 모아서 한 번에 처리하면 못 따라가. [실시간] 으로 받아내야 해.' },
        { pose: 'happy', text: '예: 카드 결제 사기 탐지 — 결제 0.1초 안에 정상/사기 판단해야 함.' },
        { pose: 'idle', text: 'Velocity 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Velocity(속도) — 데이터가 들어오고 처리되어야 하는 속도가 빠른 상황입니다. 옛날 데이터 분석은 "저녁에 그날 매출을 한 번에 정리" 하는 배치(batch) 처리로 충분했지만, 빅데이터 시대엔 "지금 막 발생한 사건을 즉시 판단" 해야 하는 케이스가 많아졌습니다. 이걸 스트리밍(streaming) 처리라 부릅니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '신용카드 사기 탐지 — 결제 후 0.1초 안에 의심 거래 판별 / 자율주행 차량의 라이다 센서 — 매 0.05초마다 장애물 감지 / 주식 시장의 알고리즘 트레이딩 — 1ms 단위로 매수/매도 / SNS 트렌드 — 트위터 분당 수십만 트윗 실시간 분석. 모두 "내일 정리해도 돼" 가 절대 안 통하는 상황. Kafka·Flink 같은 스트리밍 엔진이 등장한 배경.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "실시간 / 스트리밍" 이 핵심',
          body:
            '"실시간", "스트리밍", "초당 N 건", "즉시 판단" 이 키워드면 Velocity. 배치 처리만 등장하면 Velocity 가 아님 — 단순히 양이 많은 Volume 일 가능성.',
        },
      ],
    },
    // ─── 빅데이터 변화 4축 — 1 step → 5 substeps ───
    {
      id: 'adsp-1-2-s2',
      title: '빅데이터 변화 — 4축 개요',
      quizId: 'adsp-1-2-cp-02',
      dialogue: [
        { pose: 'wave', text: '빅데이터로 분석 패러다임이 4축에서 뒤집혔어.' },
        { pose: 'think', text: '[표본→전수] · [질→양] · [인과→상관] · [이론→데이터].' },
        { pose: 'idle', text: '먼저 4축 비교 매트릭스.' },
      ],
      blocks: [
        {
          kind: 'table',
          title: '변화 4축',
          headers: ['축', '이전', '이후'],
          rows: [
            ['규모', '표본(Sample)', '전수(Population)'],
            ['품질', '질(Quality)', '양(Quantity)'],
            ['관점', '인과(Causation)', '상관(Correlation)'],
            ['접근', '이론 기반', '데이터 기반'],
          ],
        },
      ],
    },
    {
      id: 'adsp-1-2-s2-scale',
      title: '변화 ① 표본 → 전수',
      quizId: 'adsp-1-2-cp-02-scale',
      dialogue: [
        { pose: 'wave', text: '첫 축 [규모] — 작은 표본 → 전수 데이터.' },
        { pose: 'think', text: '저장·연산 비용 하락 → 전수 다루기 가능.' },
        { pose: 'idle', text: '규모 축의 이전/이후를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '과거엔 통계 표본 추출이 분석의 출발이었습니다. 빅데이터 시대엔 전수(Population) 자체를 다루는 것이 가능해졌습니다.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"표본 → 전수", "Sample → Population". 인과·상관 축은 별도, 질·양 축도 별도.',
        },
      ],
    },
    {
      id: 'adsp-1-2-s2-quality',
      title: '변화 ② 질 → 양',
      quizId: 'adsp-1-2-cp-02-quality',
      dialogue: [
        { pose: 'wave', text: '둘째 축 [품질] — 질 우선 → 양 우선.' },
        { pose: 'think', text: '깔끔한 소수 데이터 < 잡음 섞여도 풍부한 다량.' },
        { pose: 'idle', text: '품질 축의 변화를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '소량의 깔끔한 데이터를 정성스럽게 모으던 방식에서, 잡음이 있어도 양이 압도적으로 많은 데이터로 패턴을 찾는 쪽으로 무게가 옮겨갔습니다.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"질 → 양", "Quality → Quantity". 규모(표본/전수) 와 별개 축.',
        },
      ],
    },
    {
      id: 'adsp-1-2-s2-corr',
      title: '변화 ③ 인과 → 상관',
      quizId: 'adsp-1-2-cp-02-corr',
      dialogue: [
        { pose: 'wave', text: '셋째 축 [관점] — 인과 → 상관.' },
        { pose: 'think', text: '"왜?" 보다 "함께 움직이나?" 만으로도 의사결정 가능.' },
        { pose: 'idle', text: '관점 축의 변화를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '과거엔 "왜 그런가" 의 인과를 밝혀야 했지만, 빅데이터에선 "함께 움직인다" 는 상관만으로도 마케팅·운영 의사결정에 충분히 활용 가능해졌습니다.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"인과 → 상관", "Causation → Correlation". "원인 무관" 이 아니라 "상관만으로도 의사결정 가능".',
        },
      ],
    },
    {
      id: 'adsp-1-2-s2-data',
      title: '변화 ④ 이론 → 데이터',
      quizId: 'adsp-1-2-cp-02-data',
      dialogue: [
        { pose: 'wave', text: '넷째 축 [접근] — 이론 → 데이터.' },
        { pose: 'think', text: '가설 먼저 → 데이터로 확인 vs 데이터에서 패턴 발굴.' },
        { pose: 'idle', text: '접근 축의 변화를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '예전엔 이론·가설을 먼저 세우고 데이터로 검증했다면, 지금은 풍부한 데이터에서 직접 패턴을 발굴하는 데이터 기반 접근이 가능해졌습니다.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"이론 → 데이터", "Theory → Data-driven". 인과/상관 축과 혼동 주의.',
        },
      ],
    },
    // ─── 데이터 3법 (개정신) — 1 step → 4 substeps ───
    {
      id: 'adsp-1-2-s3',
      title: '데이터 3법 — "개·정·신" 개요',
      quizId: 'adsp-1-2-cp-03',
      dialogue: [
        { pose: 'wave', text: '2020년 개정으로 가명정보 활용 가능.' },
        { pose: 'think', text: '3법 "[개정신]" — 개인정보보호법 · 정보통신망법 · 신용정보법.' },
        { pose: 'idle', text: '먼저 3법 + 정보 카테고리 개요.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"개·정·신"',
          body:
            '개인정보보호법 · 정보통신망법 · 신용정보법. 2020년 개정으로 "가명정보" 개념 도입.',
        },
        {
          kind: 'keypoints',
          title: '3종 정보 카테고리',
          items: [
            '개인정보: 직접 식별 — 원칙적으로 동의 필요',
            '가명정보: 추가정보 없이는 식별 불가 — 통계·연구·공익 한정 동의 없이 활용 가능',
            '익명정보: 식별 불가능 — 개인정보보호법 대상 외',
          ],
        },
      ],
    },
    {
      id: 'adsp-1-2-s3-pipa',
      title: '데이터 3법 ① 개인정보보호법',
      quizId: 'adsp-1-2-cp-03-pipa',
      dialogue: [
        { pose: 'wave', text: '첫째 [개인정보보호법] — 개인정보 처리 일반.' },
        { pose: 'think', text: '수집·이용·제공·파기의 원칙. 일반법.' },
        { pose: 'idle', text: '개인정보보호법 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '개인정보보호법은 모든 개인정보 처리에 대한 일반법. 정보주체의 동의·열람·정정·삭제 권리, 처리자의 안전조치 의무 등을 규정.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"일반법", "동의 원칙", "정보주체 권리". 통신서비스 영역 추가 규제는 정보통신망법, 신용정보 영역은 신용정보법.',
        },
      ],
    },
    {
      id: 'adsp-1-2-s3-net',
      title: '데이터 3법 ② 정보통신망법',
      quizId: 'adsp-1-2-cp-03-net',
      dialogue: [
        { pose: 'wave', text: '둘째 [정보통신망법] — 통신서비스 특화.' },
        { pose: 'think', text: '온라인 서비스·웹사이트·앱에서의 개인정보 보호 강화.' },
        { pose: 'idle', text: '정보통신망법 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '정보통신망법은 정보통신서비스 제공자(웹사이트·앱·SNS 등) 의 개인정보 보호 의무·이용자 보호 조치를 규정.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"정보통신서비스", "웹·앱·SNS", "이용자 보호". 일반 처리는 개인정보보호법, 신용정보는 신용정보법.',
        },
      ],
    },
    {
      id: 'adsp-1-2-s3-credit',
      title: '데이터 3법 ③ 신용정보법',
      quizId: 'adsp-1-2-cp-03-credit',
      dialogue: [
        { pose: 'wave', text: '셋째 [신용정보법] — 금융·신용 영역.' },
        { pose: 'think', text: '신용평가·금융거래의 신용정보 처리 규제.' },
        { pose: 'idle', text: '신용정보법 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '신용정보법은 금융거래·신용평가에 사용되는 신용정보의 수집·이용·제공·집중관리(신용정보집중기관) 등을 규제. 마이데이터(본인신용정보관리업) 의 근거 법.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"금융·신용정보", "마이데이터". 일반 개인정보면 개인정보보호법, 통신서비스면 정보통신망법.',
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
    // ─── Digital CA메라 6역량 — 1 step → 7 substeps (overview + 6 역량) ───
    {
      id: 'adsp-1-3-s3',
      title: 'DS 6역량 — "Digital CA메라" 개요',
      quizId: 'adsp-1-3-cp-03',
      dialogue: [
        { pose: 'wave', text: '데이터 사이언티스트 6역량 — "Digital CA메라".' },
        { pose: 'think', text: '[C]·[A]·[M]·[E]·[R]·[A] — Comm·Analytics·Math·Eng·Research·Art.' },
        { pose: 'idle', text: '먼저 6역량 매핑 + 함정.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"Digital CA메라"',
          body:
            'Communication · Analytics · Math · Engineering · Research · Art. "Management" 는 포함되지 않음 — 함정.',
        },
        {
          kind: 'keypoints',
          title: '의사결정 진화',
          items: [
            '직관 → 데이터 기반 → 예측 → 처방',
            '예측 = 무슨 일이 일어날까',
            '처방 = 그럼 무엇을 해야 할까',
          ],
        },
      ],
    },
    {
      id: 'adsp-1-3-s3-c',
      title: '6역량 ① Communication',
      quizId: 'adsp-1-3-cp-03-c',
      dialogue: [
        { pose: 'wave', text: '첫째 [Communication] — 분석 결과 전달력.' },
        { pose: 'think', text: '시각화·스토리텔링·이해관계자 설득.' },
        { pose: 'idle', text: 'Communication 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Communication 은 분석 결과를 비즈니스 청중에 맞게 풀어내는 역량 — 시각화·스토리텔링·발표.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"전달", "스토리텔링", "시각화 발표". 통계·수식이면 Math, 시스템·코드면 Engineering.',
        },
      ],
    },
    {
      id: 'adsp-1-3-s3-a',
      title: '6역량 ② Analytics',
      quizId: 'adsp-1-3-cp-03-a',
      dialogue: [
        { pose: 'wave', text: '둘째 [Analytics] — 분석 기법·도메인 지식.' },
        { pose: 'think', text: '도메인 문제 정의 + 적합한 분석 방법 선택.' },
        { pose: 'idle', text: 'Analytics 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Analytics 는 도메인 이해 + 분석 기법 선택 능력. 어떤 비즈니스 문제에 어떤 모델·기법이 맞는지 판단하는 역량.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"도메인 + 분석 기법", "문제 정의 + 모델 선택". 순수 수학·통계면 Math, 새로운 가설 발굴이면 Research.',
        },
      ],
    },
    {
      id: 'adsp-1-3-s3-m',
      title: '6역량 ③ Math (수학·통계)',
      quizId: 'adsp-1-3-cp-03-m',
      dialogue: [
        { pose: 'wave', text: '셋째 [Math] — 수학·통계 이론.' },
        { pose: 'think', text: '확률·선형대수·미적분이 모델의 뼈대.' },
        { pose: 'idle', text: 'Math 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Math 는 통계·확률·선형대수·미적분 등 분석의 수학적 기반. 모델 가정·수식 유도·검정의 토대.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"확률·통계", "선형대수", "미적분". 코드·시스템이면 Engineering, 청중 설득이면 Communication.',
        },
      ],
    },
    {
      id: 'adsp-1-3-s3-e',
      title: '6역량 ④ Engineering',
      quizId: 'adsp-1-3-cp-03-e',
      dialogue: [
        { pose: 'wave', text: '넷째 [Engineering] — 데이터·시스템 구축.' },
        { pose: 'think', text: '파이프라인·DB·인프라·코드 구현.' },
        { pose: 'idle', text: 'Engineering 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Engineering 은 데이터 파이프라인·DB·분산 처리·코드 구현 능력. 모델을 실제 서비스로 옮기는 데 필수.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"파이프라인", "DB·시스템", "구현·코드". 수식·확률이면 Math, 도메인 분석이면 Analytics.',
        },
      ],
    },
    {
      id: 'adsp-1-3-s3-r',
      title: '6역량 ⑤ Research',
      quizId: 'adsp-1-3-cp-03-r',
      dialogue: [
        { pose: 'wave', text: '다섯째 [Research] — 새 가설·기법 탐구.' },
        { pose: 'think', text: '논문·신기법 도입, R&D 적 사고.' },
        { pose: 'idle', text: 'Research 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Research 는 기존 모델·기법으로 풀리지 않는 문제에 대해 새 가설·접근을 탐구하는 R&D 역량.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"새 가설·기법", "논문·R&D", "탐색적 연구". 검증된 기법 적용은 Analytics, 시각화 전달은 Communication.',
        },
      ],
    },
    {
      id: 'adsp-1-3-s3-art',
      title: '6역량 ⑥ Art (디자인·창의)',
      quizId: 'adsp-1-3-cp-03-art',
      dialogue: [
        { pose: 'wave', text: '여섯째 [Art] — 통찰·창의·디자인 감각.' },
        { pose: 'think', text: '데이터에서 새 관점·디자인을 끌어내는 능력.' },
        { pose: 'idle', text: 'Art 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Art 는 데이터에서 통찰·창의적 관점·미적 디자인을 끌어내는 비기술적 역량. 시각화 미감, 새 가치 발견의 직관.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"창의·통찰", "디자인 감각". 단순 발표면 Communication, 새 가설 R&D 면 Research. Management 는 6역량에 없음 — 시험 함정.',
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
    // ─── 분석 4유형 (What × How) — 1 step → 5 substeps ───
    {
      id: 'adsp-2-1-s1',
      title: '분석 4유형 — What × How (개요)',
      quizId: 'adsp-2-1-cp-01',
      dialogue: [
        { pose: 'wave', text: '분석 프로젝트 실패 1위 — 엉뚱한 방법을 엉뚱한 문제에.' },
        { pose: 'think', text: '두 축: [What] (풀 것이 분명?) × [How] (푸는 법 아는?).' },
        { pose: 'happy', text: '4 칸: Optimization · Solution · Insight · Discovery.' },
        { pose: 'idle', text: '먼저 매트릭스 구조부터.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '"What 을 안다 / 모른다" × "How 를 안다 / 모른다" 의 2×2. 각 칸이 다른 분석 전략을 요구합니다.',
        },
        {
          kind: 'table',
          title: 'What × How = 4유형',
          headers: ['What', 'How', '유형'],
          rows: [
            ['○', '○', 'Optimization (최적화)'],
            ['○', '×', 'Solution (방법 탐색)'],
            ['×', '○', 'Insight (대상 발견)'],
            ['×', '×', 'Discovery (전방위 탐험)'],
          ],
        },
      ],
    },
    {
      id: 'adsp-2-1-s1-opt',
      title: '4유형 ① Optimization — "둘 다 안다"',
      quizId: 'adsp-2-1-cp-01-opt',
      dialogue: [
        { pose: 'wave', text: '[Optimization] — 풀 [문제] 도 알고, 푸는 [방법] 도 안다.' },
        { pose: 'think', text: '이미 굴러가는 시스템을 [더 잘 굴러가게] 하는 거.' },
        { pose: 'happy', text: '예: 택배 회사가 이미 쓰는 경로 최적화 모델의 파라미터만 조정해 비용 5% 추가 절감.' },
        { pose: 'idle', text: 'Optimization 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Optimization(최적화) 는 What(풀 문제) 도 분명하고 How(푸는 방법) 도 갖춰진 가장 안정된 상태입니다. 새로운 모델을 만드는 게 아니라 이미 잘 작동하는 모델·프로세스의 효율을 한 단계 더 끌어올리는 일 — 파라미터 튜닝, 자원 배분 재조정, 운영 최적화.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '쿠팡이 이미 운영 중인 물류 경로 최적화 모델에서 변수만 조정해 연간 배송비 5% 절감 / 광고 회사가 기존 입찰 알고리즘의 학습률·임계값만 미세 조정해 ROAS 7% 개선 / 콜센터가 기존 인력 배치 모델의 가중치만 변경해 평균 대기시간 12초 단축. 모두 "새로 뭘 만든다" 가 아니라 "원래 있던 걸 더 잘 굴린다".',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "튜닝 / 미세 조정 / 효율 개선"',
          body:
            '"파라미터 튜닝", "자원 배분 최적화", "기존 모델 효율 개선" 이 키워드면 Optimization. 모델 자체를 새로 고를 단계면 Solution, 풀 대상부터 찾아야 하면 Insight 또는 Discovery.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s1-sol',
      title: '4유형 ② Solution — "문제는 알지만 방법을 모른다"',
      quizId: 'adsp-2-1-cp-01-sol',
      dialogue: [
        { pose: 'wave', text: '[Solution] — 풀 [문제] 는 분명, 푸는 [방법] 이 미정.' },
        { pose: 'think', text: '예: "고객 이탈을 예측하자" 는 분명한데, 어떤 모델로 풀어야 할진 아직 정해지지 않았어.' },
        { pose: 'happy', text: '여러 후보(로지스틱·랜덤포레스트·XGBoost) 를 비교해 가장 잘 맞는 걸 고르는 단계.' },
        { pose: 'idle', text: 'Solution 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Solution(방법 탐색) 은 What 은 분명("어떤 결과를 얻고 싶은지" 명확) 한데 How 가 비어있는 단계입니다. 여러 분석 기법·모델을 후보로 두고 "이 문제엔 어느 기법이 가장 잘 맞을까?" 를 비교 실험하는 일.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '통신사가 "어떤 고객이 다음 달에 해지할까?" 라는 명확한 문제를 두고 로지스틱 회귀, 랜덤포레스트, XGBoost, LightGBM 4개 모델을 학습시켜 가장 잘 맞는 걸 채택 / 병원이 "수술 후 합병증을 예측" 이라는 문제에 대해 의사 룰 기반 vs 머신러닝 vs 딥러닝 3가지 접근을 비교해 적용 / 쇼핑몰이 "추천 정확도 향상" 목표로 협업 필터링·콘텐츠 기반·하이브리드 후보를 비교. 풀어야 할 게 뭔지는 명확.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "여러 기법 비교"',
          body:
            '"여러 알고리즘 비교 후 선택", "최적 모델 선정" 이 키워드면 Solution. 이미 모델 정해져 있고 튜닝만이면 Optimization, 풀 문제 자체가 미정이면 Discovery.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s1-ins',
      title: '4유형 ③ Insight — "방법은 있지만 풀 대상이 없다"',
      quizId: 'adsp-2-1-cp-01-ins',
      dialogue: [
        { pose: 'wave', text: '[Insight] — 푸는 [방법] 은 안다, 풀 [대상] 이 미정.' },
        { pose: 'think', text: '"우리 회사 데이터로 뭐 재미난 거 없을까?" 식이야.' },
        { pose: 'happy', text: '예: 보유한 회원 데이터에서 새로운 고객 세그먼트(VIP·휴면·신규맘) 를 발굴.' },
        { pose: 'idle', text: 'Insight 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Insight(대상 발견) 는 How(분석 도구·기법) 는 갖춰져 있지만 What(어디에 적용할까) 이 비어 있는 단계입니다. "우리 회사가 잘하는 회귀·군집·EDA 를 어디에 써먹지?" 라는 질문에서 시작해 데이터에서 가치 있는 분석 대상을 발굴하는 일.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '카드사가 보유한 고객 결제 데이터에 군집 분석을 돌려 새로운 5개 고객 세그먼트(미식가·트래블러·홈쇼퍼…) 를 발견 → 이후 마케팅 캠페인 설계 / 통신사가 통화 패턴 데이터에 EDA 를 돌려 "주말 야간 요금제" 라는 새 상품 컨셉 발굴 / 의료기관이 환자 진료 기록에서 이상 패턴(예: 특정 약물 조합 부작용) 을 데이터 마이닝으로 자동 탐지. 모두 "데이터를 먼저 들여다보다가 흥미로운 무언가를 찾는" 흐름.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "패턴 발견 / 새 세그먼트 / 흥미로운 발견"',
          body:
            '"이상 패턴 발견", "새 고객 세그먼트 발굴" 같이 출발이 데이터인 표현이면 Insight. 풀 대상 + 방법 모두 모르는 진짜 미지면 Discovery.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s1-dis',
      title: '4유형 ④ Discovery — "둘 다 모른다"',
      quizId: 'adsp-2-1-cp-01-dis',
      dialogue: [
        { pose: 'wave', text: '[Discovery] — 풀 [문제] 도, 푸는 [방법] 도 모른다.' },
        { pose: 'think', text: '신규 사업·미지의 시장이라 [가설부터] 세워야 해.' },
        { pose: 'happy', text: '예: 메타버스 사업을 처음 시작하는 회사 — 어떤 데이터를 쌓아 어떤 가치를 낼지 자체가 미정.' },
        { pose: 'idle', text: 'Discovery 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Discovery(전방위 탐험) 는 What 도 How 도 모두 비어있는 가장 모험적인 영역입니다. 가설·문제 정의부터 시작해서 어떤 데이터가 의미 있는지, 어떤 기법으로 접근할지까지 전부 만들어가는 R&D 적 분석.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '대기업이 "메타버스 사업 진출 가능성" 을 검토 — 어떤 데이터(VR 사용 패턴? 게임 로그? SNS 트렌드?) 를 봐야 할지부터 막막한 상태 / 농업회사가 "기후위기 시대의 새 작물" 을 모색 — 풀 문제도, 적합한 기법도 모두 가설로부터 출발 / 신생 헬스케어 스타트업이 "예방의학 수요 발굴" 을 위해 산업 데이터·고객 인터뷰·논문을 동시에 들여다봄. 모두 "지도 없는 탐험".',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "신규 사업 / 미지 / 가설부터"',
          body:
            '"신규 사업 가능성 탐색", "탐색적 R&D", "가설부터 세움" 이 키워드면 Discovery. 풀 문제가 분명하면 Solution/Optimization, 풀 대상만 비어있으면 Insight.',
        },
      ],
    },
    // ─── KDD vs CRISP-DM — 1 step → 3 substeps (overview + KDD + CRISP) ───
    {
      id: 'adsp-2-1-s2',
      title: '분석 프로세스 — KDD vs CRISP-DM 개요',
      quizId: 'adsp-2-1-cp-02',
      dialogue: [
        { pose: 'wave', text: '분석 프로세스 두 표준 — [KDD] 5단계 · [CRISP-DM] 6단계.' },
        { pose: 'think', text: '큰 틀은 같지만 단계 수·이름이 다름.' },
        { pose: 'idle', text: '먼저 비교 매트릭스부터.' },
      ],
      blocks: [
        {
          kind: 'table',
          title: '두 프로세스 비교',
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
      ],
    },
    {
      id: 'adsp-2-1-s2-kdd',
      title: 'KDD 5단계',
      quizId: 'adsp-2-1-cp-02-kdd',
      dialogue: [
        { pose: 'wave', text: '[KDD] 5단계: 선택·전처리·변환·마이닝·해석/평가.' },
        { pose: 'think', text: '학술적 색채. 데이터부터 시작 (업무이해 단계 없음).' },
        { pose: 'idle', text: 'KDD 단계 순서를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'KDD(Knowledge Discovery in Databases) 는 1996년 Fayyad 가 정립한 5단계 프로세스. 데이터 선택 → 전처리 → 변환 → 마이닝 → 해석·평가.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"5단계", "선택·전처리·변환·마이닝·해석". 6단계+업무이해 시작이면 CRISP-DM.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s2-crisp',
      title: 'CRISP-DM 6단계 — "업데데이트모델평가전"',
      quizId: 'adsp-2-1-cp-02-crisp',
      dialogue: [
        { pose: 'wave', text: '[CRISP-DM] 6단계: 업무→데이터이해→준비→모델링→평가→전개.' },
        { pose: 'think', text: '"[업데데이트모델평가전]" 그대로 시험에 나옴.' },
        { pose: 'idle', text: 'CRISP-DM 단계 순서를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'CRISP-DM(Cross-Industry Standard Process for Data Mining) 은 산업 표준. 6단계: 업무 이해 → 데이터 이해 → 데이터 준비 → 모델링 → 평가 → 전개. 비즈니스 의도에서 출발하고 배포까지.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"업데데이트모델평가전"',
          body:
            '업무이해 · 데이터이해 · 데이터준비 · 모델링 · 평가 · 전개. 5단계·해석으로 끝나면 KDD.',
        },
      ],
    },
    // ─── 하향식 4단계 — 1 step → 5 substeps ───
    {
      id: 'adsp-2-1-s3',
      title: '하향식 접근 — "탐·정·해·타" 개요',
      quizId: 'adsp-2-1-cp-03',
      dialogue: [
        { pose: 'wave', text: '문제가 분명할 때 쓰는 정석 — [하향식 접근].' },
        { pose: 'think', text: '4단계: [탐]색 → [정]의 → [해]결방안 → [타]당성. "[탐정해타]" 로 외워.' },
        { pose: 'idle', text: '먼저 4단계 순서를 확인.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '하향식(Top-down) 접근은 풀어야 할 문제가 명확할 때 쓰는 정석. 4단계 순서가 시험에 그대로 나옵니다 — "탐정해타".',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"탐·정·해·타"',
          body:
            '문제 탐색(Exploration) → 문제 정의(Definition) → 해결방안 탐색(Solution) → 타당성 검토(Feasibility).',
        },
      ],
    },
    {
      id: 'adsp-2-1-s3-explore',
      title: '하향식 ① 문제 [탐]색 — "넓게 훑는다"',
      quizId: 'adsp-2-1-cp-03-explore',
      dialogue: [
        { pose: 'wave', text: '첫 단계 [탐] — 어떤 문제들이 있는지 [넓게] 모으는 단계.' },
        { pose: 'think', text: '회사 안(업·제·고·에) + 회사 밖(STEEP) 두 렌즈로 빠짐없이 둘러봐.' },
        { pose: 'happy', text: '예: "신상품 매출 침체" / "고객 이탈 가속" / "원자재 가격 변동" 같은 후보들을 줄줄이 적는 단계야.' },
        { pose: 'idle', text: '탐색 단계 행동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '문제 탐색(Exploration) 은 풀어야 할 문제 후보를 빠짐없이 모으는 단계입니다. 처음부터 한두 개로 좁히지 않고 일단 넓게 펼쳐놓는 게 핵심 — 회사 안과 밖, 두 관점을 교차하면 사각지대를 줄일 수 있습니다.',
        },
        {
          kind: 'section',
          title: '두 렌즈로 보기 — 내부 / 외부',
          body:
            '내부 관점("업·제·고·에"): 업무 프로세스의 비효율, 제품의 결함·기회, 고객 경험의 불편, 외부 협력사·공급망 이슈. 외부 관점(STEEP): Social(소셜·문화 트렌드), Technology(신기술 등장), Economic(경기·환율), Environment(기후·자원), Political(규제·정책). 이 5축을 한 바퀴 돌면 외부 환경 변화로 인한 신규 문제를 놓치지 않습니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "후보를 줄줄이 적는다"',
          body:
            '"문제 후보를 펼쳐놓는다", "내·외부 환경 분석" 이 키워드면 탐색. 한 문제를 골라 측정 가능하게 다시 쓰는 단계는 다음(정의).',
        },
      ],
    },
    {
      id: 'adsp-2-1-s3-define',
      title: '하향식 ② 문제 [정]의 — "측정 가능하게 다시 쓴다"',
      quizId: 'adsp-2-1-cp-03-define',
      dialogue: [
        { pose: 'wave', text: '둘째 [정] — 후보 중 하나를 골라 [숫자로 풀 수 있게] 다시 써.' },
        { pose: 'think', text: '"매출 부진" 은 분석 문제 아냐. "다음 달 이탈 확률 예측 → 이탈률 5%↓" 가 분석 문제.' },
        { pose: 'happy', text: '비즈니스 언어 → 데이터·지표 언어로 [번역] 하는 단계.' },
        { pose: 'idle', text: '정의 단계 행동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '문제 정의(Definition) 는 탐색에서 모은 후보 중 한 개를 골라 "데이터로 풀 수 있는 형태" 로 다시 쓰는 단계입니다. "요즘 매출이 좀 부진해" 같은 구어체 비즈니스 문제는 분석가가 그대로 풀 수 없어요. 측정 가능한 지표·시점·범위로 좁혀줘야 합니다.',
        },
        {
          kind: 'section',
          title: '예시로 — 비즈니스 → 분석 번역',
          body:
            '"고객들이 빠져나가는 것 같다" → "최근 3개월 활성 고객 중 다음 달 이탈할 사용자 식별 → 이탈률 5%p 감소" / "신상품이 안 팔린다" → "출시 후 4주차 재구매율 < 12% 인 상품 사전 선별 → 진열 우선순위 조정" / "재고가 자주 부족하다" → "주별 SKU 단위 수요 예측 → 안전재고 재산정". 모두 (1) 측정 단위 (2) 시간 범위 (3) 의사결정 행동이 분명합니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "지표·시점·행동"',
          body:
            '"비즈니스 문제 → 분석 문제 변환", "측정 가능한 KPI 설정" 이 키워드면 정의. 후보 발굴이 키워드면 탐색, 방법 비교면 해결방안.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s3-solve',
      title: '하향식 ③ [해]결방안 탐색 — "어떤 방법으로?"',
      quizId: 'adsp-2-1-cp-03-solve',
      dialogue: [
        { pose: 'wave', text: '셋째 [해] — 정의된 문제에 [어떤 도구·기법] 으로 답을 낼지 비교.' },
        { pose: 'think', text: '예: "이탈 예측" 을 로지스틱·랜덤포레스트·XGBoost 중 무엇으로 풀까?' },
        { pose: 'happy', text: '실행은 아직. "이걸 쓸 수 있을까?" 까지의 검토 단계.' },
        { pose: 'idle', text: '해결방안 단계 행동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '해결방안 탐색(Solution) 은 정의된 분석 문제에 대해 풀이 방법 후보를 나열하고 비교하는 단계입니다. 어떤 알고리즘으로? 어떤 데이터를? 어떤 시스템 위에서? — 도구·기법·데이터 소스의 후보를 줄세우고 일차 비교를 합니다. 실제로 운영에 올리기 전 단계.',
        },
        {
          kind: 'section',
          title: '예시로 — 후보 비교',
          body:
            '이탈 예측 문제라면: 모델 후보 = 로지스틱·랜덤포레스트·XGBoost·딥러닝 / 데이터 소스 후보 = 결제 로그·앱 활동·고객센터 문의 / 인프라 후보 = 사내 서버·AWS SageMaker·GCP Vertex. 각각의 정확도·속도·비용·구현 난이도를 일차 정리. 이 단계에서 "이건 우리가 할 수 있겠다" 까지만 결정.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "기법 후보 비교"',
          body:
            '"어떤 알고리즘으로 풀지 비교", "데이터·시스템 아키텍처 검토" 가 키워드면 해결방안. 비용 ROI·조직 수용성까지 따지면 다음 단계(타당성).',
        },
      ],
    },
    {
      id: 'adsp-2-1-s3-feas',
      title: '하향식 ④ [타]당성 검토 — "정말 굴러갈까?"',
      quizId: 'adsp-2-1-cp-03-feas',
      dialogue: [
        { pose: 'wave', text: '마지막 [타] — 실행 직전 [3축] 으로 실행 가능성 최종 점검.' },
        { pose: 'think', text: '경제적(돈 되나?) · 기술적(만들 수 있나?) · 운영적(조직이 받아들이나?).' },
        { pose: 'happy', text: '한 축이라도 빨간불이면 다시 정의·해결방안으로 회귀.' },
        { pose: 'idle', text: '타당성 검토 활동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '타당성 검토(Feasibility) 는 실제 프로젝트 착수 직전, "정말 진행 가능한가?" 를 3축으로 점검하는 마지막 관문입니다. 한 축이라도 막히면 앞 단계로 돌아가 후보를 다시 고려해야 합니다.',
        },
        {
          kind: 'section',
          title: '3축으로 보기',
          body:
            '경제적 타당성: 들어갈 비용 vs 기대 수익. ROI 가 양인가? 수익 회수 기간이 얼마? / 기술적 타당성: 우리 팀이 만들 수 있나? 필요한 데이터를 확보할 수 있나? 인프라가 되나? / 운영적 타당성: 사용 부서가 이 결과를 실제로 의사결정에 쓸까? 조직이 변화를 수용할까? 보안·규제 이슈는?',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "비용·기술·조직 동시 점검"',
          body:
            '"ROI 검토", "데이터 확보 가능성", "조직 수용성" 같은 표현이 등장하면 타당성. 단순히 "어떤 기법이 좋을까" 비교만이면 해결방안.',
        },
      ],
    },
    // ─── 분석 방법론 5종 — 1 step → 6 substeps ───
    {
      id: 'adsp-2-1-s4',
      title: '분석 방법론 5종 — 개요',
      quizId: 'adsp-2-1-cp-04',
      dialogue: [
        { pose: 'wave', text: '분석 방법론 5종 (SW공학에서 넘어옴).' },
        { pose: 'think', text: '[Waterfall] · [Prototype] · [Spiral] · [Agile] · [RAD].' },
        { pose: 'idle', text: '먼저 5종 매칭 + 상황별 선택.' },
      ],
      blocks: [
        {
          kind: 'table',
          title: '상황 → 방법론',
          headers: ['모델', '언제'],
          rows: [
            ['Waterfall', '요구사항 명확'],
            ['Prototype', '요구사항 불명확'],
            ['Spiral', '대형·위험 큰 프로젝트'],
            ['Agile', '요구 변화 잦음'],
            ['RAD', '단기 사이클 필요'],
          ],
        },
      ],
    },
    {
      id: 'adsp-2-1-s4-waterfall',
      title: '방법론 ① Waterfall — "물 흐르듯, 되돌릴 수 없다"',
      quizId: 'adsp-2-1-cp-04-waterfall',
      dialogue: [
        { pose: 'wave', text: '첫째 [Waterfall] — 순차적으로 한 단계씩 [되돌릴 수 없게] 흘러감.' },
        { pose: 'think', text: '분석 → 설계 → 구현 → 테스트 → 배포. 다음 단계로 가면 끝.' },
        { pose: 'happy', text: '예: 정부·관공서 시스템 — 요구사항이 법적으로 고정돼 있어 변경이 거의 없음.' },
        { pose: 'idle', text: 'Waterfall 적용 상황을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Waterfall(폭포수) 은 단계가 순차적으로 진행되어 한 번 다음 단계로 가면 이전으로 되돌리기 어려운 방법론입니다. 폭포처럼 위에서 아래로 한 방향으로만 흐른다는 뜻에서 이름이 붙었어요. 요구사항이 처음부터 명확하고 변경이 거의 없는 프로젝트에서만 효율적입니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '정부 행정망 시스템 — 법령으로 요구사항이 고정 / 항공기 제어 SW — 안전 표준이 미리 명시 / 대형 SI 프로젝트에서 발주처가 요구사항을 사전 문서화 후 RFP 발주. 모두 "처음부터 무엇을 만들지가 명확" 한 케이스라 단계 간 되돌아갈 일이 적습니다. 반대로 요구가 자주 바뀌는 스타트업 앱이라면 부적합.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "순차 / 변경 적음"',
          body:
            '"순차 진행", "요구 명확", "되돌리기 어려움" 이 키워드면 Waterfall. 변경이 잦으면 Agile, 위험 평가가 핵심이면 Spiral.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s4-prototype',
      title: '방법론 ② Prototype — "일단 만들어 보여주고 피드백"',
      quizId: 'adsp-2-1-cp-04-prototype',
      dialogue: [
        { pose: 'wave', text: '둘째 [Prototype] — 일단 [시제품] 부터 만들어 사용자한테 보여줘.' },
        { pose: 'think', text: '요구사항이 모호할 때 "이런 거예요?" 하고 빠르게 보여주며 피드백.' },
        { pose: 'happy', text: '예: 신규 모바일 앱의 와이어프레임 → 사용성 테스트 → 다시 수정하는 사이클.' },
        { pose: 'idle', text: 'Prototype 적용 상황을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Prototype(시제품) 방법론은 요구사항이 처음부터 분명하지 않을 때 일단 동작하는 시제품을 빠르게 만들어 사용자에게 보여주고 피드백을 받아 개선하는 반복 사이클입니다. "말로 설명해도 사용자가 정확히 뭘 원하는지 모를 때" 가장 강력 — 사용자도 만든 걸 봐야 진짜 원하는 걸 깨닫는 경우가 많거든요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '신규 모바일 앱의 와이어프레임을 Figma 로 빠르게 만들어 잠재 사용자에게 보여주고 클릭 흐름 피드백 / B2B SaaS 의 새 대시보드 — 더미 데이터로 시제품 한 페이지 만들어 고객 인터뷰 / VR 콘텐츠 — 단순한 360도 영상부터 시작해 사용자 반응 보고 점진 확장. 모두 "본격 개발 전 가설 검증" 단계.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "시제품 / 사용자 피드백"',
          body:
            '"시제품 → 피드백", "요구 불명확" 이 키워드면 Prototype. 위험 관리 강조면 Spiral, 짧은 반복이면 Agile/RAD.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s4-spiral',
      title: '방법론 ③ Spiral — "반복 + 매 회 위험 점검"',
      quizId: 'adsp-2-1-cp-04-spiral',
      dialogue: [
        { pose: 'wave', text: '셋째 [Spiral] — 반복은 하는데 매 사이클마다 [위험 평가] 가 끼어 있어.' },
        { pose: 'think', text: '대형·신기술·예산 큰 프로젝트에서 사용. 한 사이클 망치면 손실이 크거든.' },
        { pose: 'happy', text: '예: 우주항공·국방·자율주행 — 매 단계 "이게 안전한가?" 를 통과해야 다음 단계.' },
        { pose: 'idle', text: 'Spiral 적용 상황을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Spiral(나선형) 은 반복 사이클 + 각 사이클마다 위험 분석을 결합한 방법론입니다. 한 사이클당 4단계(계획·위험분석·개발·평가) 를 돌고, 다음 사이클로 갈지 멈출지를 위험 평가 결과로 결정해요. 신기술·대형·고위험 프로젝트에 적합 — 한 번의 실패가 너무 비싸기 때문에 매 단계 점검이 필요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '자율주행 시스템 — 단계마다 안전 위험 평가 후 다음 단계 진입 / 우주 발사체 SW — 매 사이클 시뮬레이션·실험·위험 검토 / 의료 기기 SW — 규제·환자 안전 위험을 매 단계 평가 / 대형 은행 차세대 시스템 — 단계마다 컴플라이언스·운영 위험 검토. 모두 "한 번 실패하면 사람 다치거나 수십억 손실" 인 영역.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "반복 + 위험 평가"',
          body:
            '"반복 + 위험 관리", "대형/고위험 프로젝트" 가 키워드면 Spiral. 단순 시제품 검증이면 Prototype, 짧고 변화 수용이 핵심이면 Agile.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s4-agile',
      title: '방법론 ④ Agile — "2~4주 스프린트로 변화 수용"',
      quizId: 'adsp-2-1-cp-04-agile',
      dialogue: [
        { pose: 'wave', text: '넷째 [Agile] — [2~4주 단위 스프린트] 로 짧게 끊어 만들고 [변경] 수용.' },
        { pose: 'think', text: '한 스프린트 끝나면 동작하는 결과물 + 사용자 피드백 → 다음 스프린트 계획 조정.' },
        { pose: 'happy', text: '예: 토스·카카오의 SaaS 프로덕트 — 격주로 새 기능 출시·실험·롤백.' },
        { pose: 'idle', text: 'Agile 적용 상황을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Agile(애자일) 은 2~4주 짧은 반복 주기(스프린트) 를 돌며 매 스프린트마다 동작하는 결과물을 만들고 변경을 적극 수용하는 방법론입니다. "요구사항이 자주 바뀐다" 를 약점이 아닌 자연스러운 사실로 받아들이는 게 철학적 차이 — Waterfall 이 변경을 비용으로 본다면 Agile 은 변경을 학습으로 봅니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '토스·쿠팡 같은 SaaS — 매 스프린트 새 기능 배포·실험·KPI 측정·롤백 / 모바일 게임 — 사용자 데이터 보며 매 패치마다 밸런스 조정 / B2B SaaS — 고객 요청을 매 스프린트 우선순위에 반영 / 스타트업 MVP — 빠르게 만들고 가설 검증 → 다시 조정. 모두 "변화 수용 = 빠르게 학습" 의 철학.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "스프린트 / 변경 수용"',
          body:
            '"짧은 반복", "변경 수용", "스프린트" 가 키워드면 Agile. 시제품 검증이 중심이면 Prototype, 위험 관리 강조면 Spiral.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s4-rad',
      title: '방법론 ⑤ RAD — "60~90일 안에 끝"',
      quizId: 'adsp-2-1-cp-04-rad',
      dialogue: [
        { pose: 'wave', text: '다섯째 [RAD] — Rapid Application Development. [60~90일] 단기 결과.' },
        { pose: 'think', text: '미리 만든 [모듈·컴포넌트] 를 빠르게 조립해 단기 완성.' },
        { pose: 'happy', text: '예: 고객사가 "분기 안에 데모 시스템 필요" 라고 짧은 데드라인 명시한 경우.' },
        { pose: 'idle', text: 'RAD 적용 상황을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'RAD(Rapid Application Development) 는 60~90일 같은 명확한 단기 데드라인 안에 결과물을 내야 하는 프로젝트에 쓰는 방법론입니다. 미리 만들어둔 모듈·컴포넌트·라이브러리를 빠르게 조립해 단기간에 동작하는 시스템을 완성. Agile 과 비슷해 보이지만 RAD 는 더 짧은 단발성 완료 사이클이 특징입니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '내부 사내 도구 — 60일 안에 영업팀용 간단 CRM 완성 / 마케팅 캠페인 랜딩페이지 — 2~3주 단기 / 컨퍼런스용 데모 시스템 — 행사 전까지 완성 / 단기 R&D 프로토타이핑 — 분기 안에 PoC 산출. 모두 "데드라인 명확 + 기존 컴포넌트 적극 활용" 으로 빠르게 끝내는 영역.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "단기 데드라인 + 컴포넌트 조립"',
          body:
            '"빠른 개발", "단기 사이클", "60~90일" 이 키워드면 RAD. 지속 반복이면 Agile, 시제품-피드백이면 Prototype, 위험 관리·대형이면 Spiral.',
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
    // ─── 우선순위 4사분면 — 1 step → 5 substeps ───
    {
      id: 'adsp-2-2-s1',
      title: '과제 우선순위 — 시급성 × 난이도 (개요)',
      quizId: 'adsp-2-2-cp-01',
      dialogue: [
        { pose: 'wave', text: '과제 100개? 한 번에 못 해. 순서가 필요.' },
        { pose: 'think', text: '두 축: [시급성] (지금?) × [난이도] (어려움?).' },
        { pose: 'idle', text: '먼저 4사분면 구조를 확인.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '과제 우선순위는 "지금 급한가" × "얼마나 어려운가" 의 2×2 매트릭스로 분류. 각 칸이 다른 행동을 권합니다.',
        },
        {
          kind: 'table',
          headers: ['시급성', '난이도', '권고'],
          rows: [
            ['Now', 'Easy', '1순위 즉시'],
            ['Now', 'Difficult', '장기 투자'],
            ['Future', 'Easy', '3순위'],
            ['Future', 'Difficult', '후순위'],
          ],
        },
      ],
    },
    {
      id: 'adsp-2-2-s1-now-easy',
      title: '우선순위 ① Now × Easy — "지금 + 쉬움 = 즉시 착수"',
      quizId: 'adsp-2-2-cp-01-ne',
      dialogue: [
        { pose: 'wave', text: '[Now × Easy] = 1순위. 망설일 이유가 없어.' },
        { pose: 'think', text: '효과는 빨리 나오고 비용·시간은 적게 드는 [Quick Win] 영역.' },
        { pose: 'happy', text: '예: 이미 있는 매출 데이터로 [지난달 vs 이번달] 대시보드 만들기.' },
        { pose: 'idle', text: '1순위에 해당하는 과제를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Now × Easy = 1순위. 시급성도 높고 난이도도 낮아 망설일 이유가 없는 과제입니다. 보통 데이터·인프라가 이미 갖춰져 있어 며칠~몇 주 안에 결과를 낼 수 있어요. 분석 조직이 처음 들어왔을 때 "조직의 신뢰" 를 빠르게 쌓는 카드로도 사용됩니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '이미 쌓인 매출 데이터로 "지난달 vs 이번달" 비교 대시보드 만들기 / 기존 고객 DB 에 RFM 분류 한 번 돌려서 VIP 세그먼트 추출 / 회원가입 폼의 이탈 단계를 GA 로그로 분석해 가장 비효율적인 1단계 개선. 모두 추가 데이터 수집·인프라 도입 없이 [기존 자원 + 며칠 작업] 으로 끝나는 일.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "단기 + 빠른 효과"',
          body:
            '"Quick Win", "단기 ROI 명확", "기존 자원으로 가능" 이 키워드면 1순위. 인프라·플랫폼 구축이 필요하면 Now×Difficult.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s1-now-hard',
      title: '우선순위 ② Now × Difficult — "지금 필요한데 어려움 = 장기 투자"',
      quizId: 'adsp-2-2-cp-01-nh',
      dialogue: [
        { pose: 'wave', text: '[Now × Difficult] — 지금 꼭 필요한데 [큰 투자] 가 필요해.' },
        { pose: 'think', text: '바로 끝낼 순 없으니 [단계적 로드맵] 으로 쪼개서 진행.' },
        { pose: 'happy', text: '예: 전사 데이터 플랫폼 구축 — 1년짜리지만 모든 분석의 토대가 됨.' },
        { pose: 'idle', text: '이 칸에 맞는 과제를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Now × Difficult = 시급성은 높은데 난이도도 높은 영역. 지금 안 하면 다른 분석들이 모두 막히지만, 한 번에 끝낼 수 없는 큰 투자가 필요한 과제들이 여기 옵니다. 단계적 로드맵·예산 분할·점진적 인도(MVP → 확장) 가 정석.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '전사 데이터 웨어하우스(DW) 신규 구축 — 1년짜리 프로젝트지만 끝나면 모든 부서가 통합 데이터를 쓸 수 있어 후속 분석이 모두 빨라짐 / 사내 머신러닝 플랫폼(MLOps) 도입 — 6~9개월 / 부서별 흩어진 고객 마스터 데이터 통합(MDM). 모두 "지금 안 하면 후속 분석 모두 정체" 라는 시급성 + "한 분기로는 안 끝남" 의 난이도가 결합.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "필수 인프라 / 6개월+"',
          body:
            '"전사 플랫폼", "대규모 시스템 통합", "필수지만 장기" 가 키워드면 이 칸. 짧고 빠르면 Now×Easy.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s1-fut-easy',
      title: '우선순위 ③ Future × Easy — "미래용 + 쉬움 = 3순위"',
      quizId: 'adsp-2-2-cp-01-fe',
      dialogue: [
        { pose: 'wave', text: '[Future × Easy] — 미래에 쓸만하고 부담도 적음.' },
        { pose: 'think', text: '지금 [급한 건 아님]. 자원 여유 있을 때 처리하는 [보너스] 영역.' },
        { pose: 'happy', text: '예: 보유 고객 만족도 데이터로 워드클라우드 만들기 — 흥미로운데 당장 의사결정에 안 쓰임.' },
        { pose: 'idle', text: '이 칸 과제를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Future × Easy = 시급하진 않지만 부담도 적은 영역. 분석 팀이 한가할 때 처리하면 작은 가치라도 확보할 수 있는 보너스 후보들입니다. 다만 이 영역에 자원을 너무 많이 쓰면 1·2순위 핵심 과제를 놓치기 쉬워요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '보유한 고객 리뷰 텍스트로 워드클라우드 시각화 (재미있고 쉽지만 즉각 의사결정엔 영향 작음) / 사내 자료실의 과거 보고서 메타데이터를 모아 키워드 트렌드 분석 / 영업팀 대시보드에 부가적인 시계열 위젯 하나 추가. 모두 "안 해도 큰일 안 나지만 해두면 작게나마 도움" 인 일들.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "여유 있을 때"',
          body:
            '"중요도 낮음 + 부담 낮음", "여유 있을 때 추가" 가 키워드면 3순위. 시급해지면 Now 칸들로 즉시 이동.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s1-fut-hard',
      title: '우선순위 ④ Future × Difficult — "미래용 + 어려움 = 후순위"',
      quizId: 'adsp-2-2-cp-01-fh',
      dialogue: [
        { pose: 'wave', text: '[Future × Difficult] — 미래에 쓸만한데 [큰 투자] 가 필요해.' },
        { pose: 'think', text: '당장 효용은 작고 비용은 큼 → [중장기 R&D] 로 분류.' },
        { pose: 'happy', text: '예: 양자컴퓨팅 기반 추천 엔진 — 5년 R&D, 지금은 ROI 거의 없음.' },
        { pose: 'idle', text: '이 칸 과제를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Future × Difficult = 후순위. 지금 시작하기엔 비용 부담이 크고 즉각 효용도 낮은 영역입니다. 보통 R&D·신기술 검토·실험적 프로젝트가 여기 분류됩니다. 회사 자원이 충분하고 미래 대비를 명확히 할 때만 착수.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '양자 컴퓨팅 기반 추천 엔진 R&D — 5년 단위 / 사내 LLM 직접 학습 — 6개월~1년 + 거대 인프라 / VR/AR 환경 데이터 분석 파이프라인 — 사용처가 아직 명확치 않은 사전 연구. 모두 "지금 당장 의사결정에 안 쓰이는데 비용은 막대" 한 영역.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "중장기 R&D"',
          body:
            '"중장기 R&D", "당장 효용 미미 + 큰 투자" 가 키워드면 후순위. 시급해지면 Now×Difficult.',
        },
      ],
    },
    // ─── 분석 거버넌스 5축 (시조프인데) — 1 step → 6 substeps ───
    {
      id: 'adsp-2-2-s2',
      title: '분석 거버넌스 — "시·조·프·인·데" 개요',
      quizId: 'adsp-2-2-cp-02',
      dialogue: [
        { pose: 'wave', text: '분석 거버넌스 5축 — 조직이 분석을 체계적으로 돌리는 틀.' },
        { pose: 'think', text: '"[시조프인데]" — 시스템 · 조직 · 프로세스 · 인력 · 데이터.' },
        { pose: 'idle', text: '먼저 5축 + 함정 ("마케팅" 미포함).' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"시·조·프·인·데"',
          body:
            '시스템(Infra) · 조직(Organization) · 프로세스(Process) · 인력(Resource) · 데이터(Data). "마케팅" 은 포함되지 않음 — 함정.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '조직 준비도 — "IT문데기인파"',
          body:
            'IT · 문화 · 데이터 · 기법 · 인력 · 파급효과. 거버넌스 5축과 별개의 6영역 평가.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s2-system',
      title: '거버넌스 ① 시스템 (Infra)',
      quizId: 'adsp-2-2-cp-02-system',
      dialogue: [
        { pose: 'wave', text: '첫 축 [시스템] — IT 인프라.' },
        { pose: 'think', text: '분석 플랫폼·DB·BI 도구 등 기술 기반.' },
        { pose: 'idle', text: '시스템 축 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '시스템(Infra) 축은 분석을 돌릴 수 있는 기술 기반 — 분석 플랫폼·데이터베이스·BI 도구·컴퓨팅 인프라.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"분석 플랫폼", "BI·DB·인프라". 사람·R&R 이면 조직, 작업 흐름이면 프로세스.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s2-org',
      title: '거버넌스 ② 조직 (Organization)',
      quizId: 'adsp-2-2-cp-02-org',
      dialogue: [
        { pose: 'wave', text: '둘째 [조직] — 분석을 책임지는 부서·체계.' },
        { pose: 'think', text: 'CDO · 데이터 분석팀 · CoE 같은 R&R 구조.' },
        { pose: 'idle', text: '조직 축 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '조직(Organization) 축은 분석 활동의 R&R · 보고 라인 · CoE / 분산 / 기능 같은 조직 형태를 정합니다.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"R&R", "CoE", "보고 체계". 인프라면 시스템, 직원 역량이면 인력.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s2-process',
      title: '거버넌스 ③ 프로세스 (Process)',
      quizId: 'adsp-2-2-cp-02-process',
      dialogue: [
        { pose: 'wave', text: '셋째 [프로세스] — 분석 작업 흐름·표준.' },
        { pose: 'think', text: '과제 발굴 → 수행 → 평가의 표준화된 순서.' },
        { pose: 'idle', text: '프로세스 축 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '프로세스(Process) 축은 과제 발굴 → 수행 → 평가의 표준화된 작업 흐름·승인 절차·산출물 양식.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"표준 절차", "작업 흐름", "단계별 산출물". 사람·역할이면 조직, 기술 기반이면 시스템.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s2-resource',
      title: '거버넌스 ④ 인력 (Resource)',
      quizId: 'adsp-2-2-cp-02-resource',
      dialogue: [
        { pose: 'wave', text: '넷째 [인력] — 분석가 역량·교육.' },
        { pose: 'think', text: '데이터 사이언티스트 채용·육성·교육.' },
        { pose: 'idle', text: '인력 축 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '인력(Resource) 축은 분석 인력의 채용·교육·역량 평가·경력 경로.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"역량 교육", "채용·육성". R&R 구조면 조직, 데이터 자체 관리면 데이터.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s2-data',
      title: '거버넌스 ⑤ 데이터 (Data)',
      quizId: 'adsp-2-2-cp-02-data',
      dialogue: [
        { pose: 'wave', text: '다섯째 [데이터] — 데이터 자체의 관리.' },
        { pose: 'think', text: '데이터 표준화·품질·메타데이터 — 데이터 거버넌스 3요소(원조프) 와 연결.' },
        { pose: 'idle', text: '데이터 축 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '데이터(Data) 축은 데이터 자체의 표준화·품질 관리·메타데이터·라이프사이클. 더 깊이 들어가면 별도 "데이터 거버넌스 (원·조·프)" 로 펼쳐짐.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"데이터 품질·표준화·메타", "데이터 자체". 인프라·도구면 시스템, 사람 역량이면 인력.',
        },
      ],
    },
    // ─── 성숙도 4단계 (도활확최) — 1 step → 5 substeps ───
    {
      id: 'adsp-2-2-s3',
      title: '분석 성숙도 — "도·활·확·최" 개요',
      quizId: 'adsp-2-2-cp-03',
      dialogue: [
        { pose: 'wave', text: '조직의 분석 [성숙도] 4단계.' },
        { pose: 'think', text: '"[도활확최]" — 도입 · 활용 · 확산 · 최적화.' },
        { pose: 'idle', text: '먼저 4단계 순서를 잡자.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"도·활·확·최"',
          body:
            '도입(Introduction) → 활용(Adoption) → 확산(Diffusion) → 최적화(Optimization). 준비도(Readiness) 와 혼동 금지 — 준비도는 별개 축.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '조직 구조 진화 — "집·기·분"',
          body:
            '집중형(CoE) → 기능형 → 분산형. 성숙도가 올라갈수록 DSCoE 가 전사 분산으로 퍼져나갑니다.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s3-intro',
      title: '성숙도 ① [도]입 — "한두 명이 시작"',
      quizId: 'adsp-2-2-cp-03-intro',
      dialogue: [
        { pose: 'wave', text: '첫 단계 [도]입 — 회사에 [한두 명] 만 분석을 해본 단계.' },
        { pose: 'think', text: '예산·표준·플랫폼 다 없음. 그저 호기심 많은 직원이 엑셀로 시도하는 수준.' },
        { pose: 'happy', text: '예: 마케팅 한 직원이 자기 노트북에서 엑셀로 캠페인 효과 분석 — 동료들은 무관심.' },
        { pose: 'idle', text: '도입 단계 특징을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '도입(Introduction) 은 회사의 분석이 일부 개인의 자발적 시도 수준에 머무는 단계입니다. 회사가 공식적으로 "분석을 하자" 라고 말한 적은 없고, 호기심 많은 한두 명이 엑셀·구글 시트로 자기 업무를 분석해 보는 정도. 표준·예산·플랫폼 모두 부재합니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '직원 100명 회사에서 마케팅 1명이 자기 노트북 엑셀로 광고 ROI 를 분석 — 동료는 관심 없음 / 영업팀의 한 매니저가 거래처 데이터를 피벗테이블로 정리하지만 다른 부서엔 공유 없음 / 데이터팀이라는 부서 자체가 아직 없음. "조직 차원이 아니라 개인 차원" 이 키워드.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "개인 / 비공식"',
          body:
            '"개인 차원", "비공식 시도", "표준·예산·플랫폼 없음" 이 키워드면 도입. 한 부서 단위로 정기 업무가 되면 다음 단계(활용).',
        },
      ],
    },
    {
      id: 'adsp-2-2-s3-adopt',
      title: '성숙도 ② [활]용 — "한두 부서가 정기적으로"',
      quizId: 'adsp-2-2-cp-03-adopt',
      dialogue: [
        { pose: 'wave', text: '둘째 [활]용 — [부서 단위] 로 분석이 정기 업무가 됨.' },
        { pose: 'think', text: '단, 부서마다 [도구·표준] 이 제각각. 마케팅은 R, 영업은 엑셀, 재무는 SAS.' },
        { pose: 'happy', text: '예: 마케팅팀에 분석 담당자 2명이 정규직으로 배치돼 매주 캠페인 성과를 정리해 공유.' },
        { pose: 'idle', text: '활용 단계 특징을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '활용(Adoption) 은 한두 부서가 분석을 정기 업무로 통합한 단계입니다. 도입과 다른 점은 (1) 개인이 아니라 부서 차원의 활동이 되었다는 것 (2) 정기적으로(주간·월간) 결과를 만들어 의사결정에 쓴다는 것. 다만 전사 차원의 통일된 도구·플랫폼은 아직 없어 부서마다 도구가 제각각입니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '마케팅팀에 데이터 분석가 2명 정규직 배치, 매주 캠페인 ROI 보고서 자동 발행 / 영업팀이 자체적으로 Power BI 도입해 거래처별 매출 추세 모니터링 / 재무팀은 별도로 SAS 라이선스로 리스크 분석. 세 부서가 모두 각자의 도구로 분석을 정기화 — 그러나 도구·데이터·표준은 통일 안 됨.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "부서별 + 산발적"',
          body:
            '"부서별로 정기 활용", "도구·표준 부서별 다름", "전사 표준 미정" 이 키워드면 활용. 전사 통일 플랫폼이 도입되면 다음 단계(확산).',
        },
      ],
    },
    {
      id: 'adsp-2-2-s3-diffuse',
      title: '성숙도 ③ [확]산 — "전사 표준 플랫폼"',
      quizId: 'adsp-2-2-cp-03-diffuse',
      dialogue: [
        { pose: 'wave', text: '셋째 [확]산 — [전사] 차원의 표준 플랫폼·거버넌스 도입.' },
        { pose: 'think', text: '도구가 통일되고 데이터도 한 곳에 모임. 거버넌스 정책도 발효.' },
        { pose: 'happy', text: '예: 전사 데이터 플랫폼 (Snowflake + Tableau) 구축, 모든 부서가 이걸로 통일.' },
        { pose: 'idle', text: '확산 단계 특징을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '확산(Diffusion) 은 전사 차원에서 분석을 표준화하는 단계입니다. 부서마다 흩어져 있던 데이터·도구를 통합 플랫폼 위로 모으고, 거버넌스 정책(누가 어떤 데이터를 볼 수 있는지·품질 기준은 어떻게 되는지) 을 공식화합니다. 분석이 "있으면 좋은" 게 아니라 "모든 부서가 공유하는 인프라" 가 됩니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '전사 데이터 플랫폼 (Snowflake + Tableau) 도입 — 마케팅·영업·재무 모두 같은 데이터 위에서 분석 / Data CoE(분석 전담 조직) 신설하고 거버넌스 정책 발효 / 모든 부서원이 분석 도구 사용 가능하도록 사내 교육 프로그램 운영. "부서별 산발" 이 "전사 표준" 으로 바뀌는 게 핵심 변화.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "전사 표준 + 거버넌스"',
          body:
            '"전사 통합 플랫폼", "Data CoE", "거버넌스 정책 발효" 가 키워드면 확산. 분석이 의사결정의 디폴트가 되어 ROI 까지 다시 최적화하면 마지막 단계(최적화).',
        },
      ],
    },
    {
      id: 'adsp-2-2-s3-optimize',
      title: '성숙도 ④ [최]적화 — "분석이 의사결정의 디폴트"',
      quizId: 'adsp-2-2-cp-03-optimize',
      dialogue: [
        { pose: 'wave', text: '마지막 [최]적화 — 분석이 [모든 의사결정의 기본값] 이 됨.' },
        { pose: 'think', text: '"감으로 결정" 은 거의 사라지고, 데이터 근거 없으면 회의에서 통과 안 됨.' },
        { pose: 'happy', text: '예: Netflix·Amazon — 추천·가격·재고 모두 알고리즘이 1차 결정, 사람은 검증만.' },
        { pose: 'idle', text: '최적화 단계 특징을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '최적화(Optimization) 는 분석이 조직 의사결정의 디폴트가 된 단계입니다. 회의에서 데이터 근거 없이 의견을 내면 통과되지 않을 정도로 분석이 일상에 내재화됩니다. 한 발 더 나아가 "분석 자체의 ROI 와 효율" 을 다시 분석해 최적화하는 메타 단계까지 진행됩니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            'Netflix — 추천·콘텐츠 투자·가격 모두 알고리즘이 1차 결정 / Amazon — 가격·재고·물류 경로 모두 실시간 ML 결정 / 토스 — 모든 신규 기능에 A/B 테스트 결과 첨부 안 되면 출시 보류. 모두 "분석 없는 의사결정은 예외" 인 상태. 추가로 어떤 분석이 효과적이었는지를 다시 측정해 분석 자체를 최적화.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "내재화 + 메타 최적화"',
          body:
            '"전사 내재화", "데이터 기반 의사결정 주류", "분석 ROI 최적화" 가 키워드면 최적화. 표준화 진행 중이면 확산, 부서별 산발이면 활용.',
        },
      ],
    },
    // ─── 데이터 거버넌스 3요소 (원조프) — 1 step → 4 substeps ───
    {
      id: 'adsp-2-2-s4',
      title: '데이터 거버넌스 — "원·조·프" 개요',
      quizId: 'adsp-2-2-cp-04',
      dialogue: [
        { pose: 'wave', text: '[분석 거버넌스] ≠ [데이터 거버넌스] — 시험 함정 1위.' },
        { pose: 'think', text: '데이터 거버넌스는 데이터 자체를 공용 자산으로 관리하는 규범. 3요소 "[원조프]".' },
        { pose: 'idle', text: '먼저 두 거버넌스 구분부터.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '"분석 거버넌스 5축 (시조프인데)" 와 "데이터 거버넌스 3요소 (원조프)" 는 별개. 시험에서 두 축을 섞어 오답 선지로 주는 게 흔합니다.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"원·조·프"',
          body:
            '원칙(Principle) · 조직(Organization) · 프로세스(Process). "비전·전략·계획" 같은 엉뚱한 묶음이 함정.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s4-principle',
      title: '데이터 거버넌스 ① [원]칙 — "회사의 헌법"',
      quizId: 'adsp-2-2-cp-04-principle',
      dialogue: [
        { pose: 'wave', text: '첫 요소 [원]칙 — 데이터를 다루는 [회사 헌법] 같은 규범.' },
        { pose: 'think', text: '"누가 어떤 데이터를 어떤 조건으로 볼 수 있나" — 모든 결정의 출발점.' },
        { pose: 'happy', text: '예: "고객 개인정보는 마케팅 목적 외 사용 금지", "재무 데이터는 임원 이상만 접근".' },
        { pose: 'idle', text: '원칙 영역의 활동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '원칙(Principle) 은 회사가 데이터를 다룰 때 따라야 할 기본 규범·정책입니다. "헌법" 에 비유하면 가장 정확해요. 보안 정책, 접근 권한 정책, 데이터 품질 정책, 활용 정책 — 모든 일상 결정이 이 원칙에서 출발합니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '"고객 개인정보는 마케팅 목적 외에는 사용 금지" / "재무 거래 데이터는 임원·재무팀만 조회 가능" / "외부 업체와 공유하는 모든 데이터는 익명화 후 송출" / "데이터 품질 등급 A·B·C 의 정의와 적용 범위". 모두 회사가 데이터에 대해 미리 약속한 큰 규칙들. 이 규칙을 누가 책임지고 굴리는지(조직), 매일 어떤 절차로 점검하는지(프로세스) 와는 분리됩니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "정책 / 헌법 / 표준 정의"',
          body:
            '"기본 정책 수립", "데이터 관리 원칙·표준 정의" 가 키워드면 원칙. "누가 책임자인지" 면 조직, "어떤 절차로 매일 굴리는지" 면 프로세스.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s4-org',
      title: '데이터 거버넌스 ② [조]직 — "누가 책임지나"',
      quizId: 'adsp-2-2-cp-04-org',
      dialogue: [
        { pose: 'wave', text: '둘째 [조]직 — 데이터 거버넌스를 [실행할 사람·역할] 구조.' },
        { pose: 'think', text: '원칙은 그냥 종이 — 책임자가 있어야 굴러가.' },
        { pose: 'happy', text: '대표 역할: CDO(Chief Data Officer), 데이터 오너, 데이터 스튜어드.' },
        { pose: 'idle', text: '조직 영역 활동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '조직(Organization) 은 데이터 거버넌스의 원칙을 실제로 굴릴 사람·역할 구조입니다. 아무리 좋은 정책도 책임자가 없으면 종이일 뿐 — 누가 어떤 데이터에 대해 결정권을 가지고, 누가 일상 운영을 담당할지를 명확히 합니다.',
        },
        {
          kind: 'section',
          title: '대표 역할 3가지',
          body:
            'CDO(Chief Data Officer) — 회사 전체의 데이터 전략·정책을 총괄하는 임원. 데이터 오너(Data Owner) — 특정 데이터(예: 고객 데이터, 재무 데이터) 의 최종 책임자. 보통 해당 비즈니스 부서장이 맡습니다. 데이터 스튜어드(Data Steward) — 일상적으로 데이터 품질 점검, 메타데이터 관리, 표준 코드 적용 등 실무를 담당하는 역할.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "사람·역할·R&R"',
          body:
            '"책임자 지정", "역할 분담(R&R)", "CDO/스튜어드" 가 키워드면 조직. 일상 실행 절차(품질 점검, 표준화 작업) 자체는 프로세스.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s4-process',
      title: '데이터 거버넌스 ③ [프]로세스 — "매일 굴러가는 절차"',
      quizId: 'adsp-2-2-cp-04-process',
      dialogue: [
        { pose: 'wave', text: '셋째 [프]로세스 — 원칙을 [매일 굴리는] 실행 절차.' },
        { pose: 'think', text: '데이터 표준화, 품질 점검, 메타데이터 운영, 백업·아카이브 관리.' },
        { pose: 'happy', text: '예: 매주 월요일 데이터 품질 점검 회의, 신규 테이블 등록 시 표준 코드 검토.' },
        { pose: 'idle', text: '프로세스 영역 활동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '프로세스(Process) 는 원칙을 일상 운영에 녹이는 실행 절차입니다. "매일·매주 어떤 일을 어떤 순서로 하는가" 가 프로세스. 원칙(헌법) 이 있고 조직(책임자) 이 정해졌어도 이 일상 절차가 없으면 결국 운영이 안 됩니다.',
        },
        {
          kind: 'keypoints',
          title: '주요 활동 4가지',
          items: [
            '데이터 표준화: 명칭(예: cust_id vs customerId)·코드·형식을 통일',
            '메타데이터 / 마스터데이터 관리: "이 컬럼이 뭘 의미하나" 를 항상 알 수 있게 운영',
            '저장소 관리: 아카이브 정책·접근 권한·백업·복구 절차',
            '품질관리: 정확성·완전성·일관성·시의성을 정기 점검',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "표준화·품질·메타데이터·백업"',
          body:
            '"표준화 작업", "품질 점검", "메타데이터 운영", "백업·아카이브" 가 키워드면 프로세스. 누가 책임자인지면 조직, 큰 규범 자체면 원칙.',
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
    // ─── 타당성 3요소 — 1 step → 4 substeps ───
    {
      id: 'adsp-2-3-s1',
      title: '타당성 3요소 — 개요',
      quizId: 'adsp-2-3-cp-01',
      dialogue: [
        { pose: 'wave', text: '하향식 마지막 [타당성] 은 3축으로 분리.' },
        { pose: 'think', text: '[경제적] · [기술적] · [운영적] — 사회적 타당성은 함정.' },
        { pose: 'idle', text: '먼저 3축 구분.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'warn',
          title: '"사회적 타당성" 함정',
          body:
            '기본 3요소는 경제·기술·운영. "사회적 타당성" 같은 추가 항목은 오답 함정.',
        },
      ],
    },
    {
      id: 'adsp-2-3-s1-econ',
      title: '타당성 ① 경제적 (Economic)',
      quizId: 'adsp-2-3-cp-01-econ',
      dialogue: [
        { pose: 'wave', text: '첫 [경제적] — 비용·편익(ROI).' },
        { pose: 'think', text: '투자 대비 수익이 양인지 검증.' },
        { pose: 'idle', text: '경제적 타당성 활동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '경제적(Economic) 타당성 — 비용·편익 분석(ROI). 프로젝트가 투자 대비 충분한 수익을 낼 수 있는지.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"비용 vs 편익", "ROI". 데이터·시스템 가용성이면 기술적, 사람·프로세스 수용성이면 운영적.',
        },
      ],
    },
    {
      id: 'adsp-2-3-s1-tech',
      title: '타당성 ② 기술적 (Technical)',
      quizId: 'adsp-2-3-cp-01-tech',
      dialogue: [
        { pose: 'wave', text: '둘째 [기술적] — 데이터·알고리즘·시스템.' },
        { pose: 'think', text: '필요한 데이터·기술 가용성 점검.' },
        { pose: 'idle', text: '기술적 타당성 활동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '기술적(Technical) 타당성 — 필요한 데이터가 있는지, 알고리즘·인프라·시스템이 가능한지.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"데이터·알고리즘 가능성", "시스템 인프라". 비용·편익은 경제적, 인력·조직 수용성은 운영적.',
        },
      ],
    },
    {
      id: 'adsp-2-3-s1-ops',
      title: '타당성 ③ 운영적 (Operational)',
      quizId: 'adsp-2-3-cp-01-ops',
      dialogue: [
        { pose: 'wave', text: '셋째 [운영적] — 조직·인력·프로세스.' },
        { pose: 'think', text: '결과를 받아 운영할 조직 준비도 점검.' },
        { pose: 'idle', text: '운영적 타당성 활동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '운영적(Operational) 타당성 — 분석 결과를 실제 운영할 조직·인력·프로세스 수용 가능성. "기술은 되지만 사람이 못 받는" 케이스 점검.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"조직 수용성", "인력·프로세스 준비도". ROI 면 경제적, 시스템·데이터면 기술적.',
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
    // ─── EDA 4원칙 — 1 step → 5 substeps ───
    {
      id: 'adsp-3-1-s2',
      title: 'EDA — "저·잔·재·현" 개요',
      quizId: 'adsp-3-1-cp-02',
      dialogue: [
        { pose: 'wave', text: '[EDA] — 모델 만들기 전에 데이터를 먼저 이해.' },
        { pose: 'think', text: '튜키 4원칙: [저]항성 · [잔]차 · [재]표현 · [현]시성.' },
        { pose: 'idle', text: '먼저 4원칙 이름·순서 확인.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'EDA(Exploratory Data Analysis) 는 튜키(Tukey) 가 정립한 단계. 모델링 전에 데이터의 형태·이상·관계를 파악합니다.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"저·잔·재·현"',
          body:
            'Resistance(저항성) · Residual(잔차) · Re-expression(재표현) · Revelation(현시성). 영어는 모두 R 로 시작하지만 한국어 앞글자는 저잔재현.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s2-resistance',
      title: 'EDA ① [저]항성 — "이상치에 안 흔들리게"',
      quizId: 'adsp-3-1-cp-02-resistance',
      dialogue: [
        { pose: 'wave', text: '첫 원칙 [저]항성 — 통계가 [이상치 한두 개] 에 휘둘리지 않게.' },
        { pose: 'think', text: '평균은 1억짜리 한 명이 들어오면 확 올라가지만 중앙값은 안 변해.' },
        { pose: 'happy', text: '예: 직원 10명 중 9명이 월급 300만, 1명이 1억이면 평균 1,070만 vs 중앙값 300만.' },
        { pose: 'idle', text: '저항성에 부합하는 통계를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '저항성(Resistance) 은 "소수의 이상치 때문에 결과가 크게 흔들리지 않는 통계를 쓰자" 는 원칙입니다. 평균·표준편차·분산은 한 점이 크게 튀면 통째로 끌려갑니다. 반면 중앙값·IQR·중위절대편차(MAD) 같은 통계는 이상치가 끼어들어도 거의 그대로예요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '직원 10명의 연봉이 [3,000 / 3,200 / 3,300 / 3,500 / 3,600 / 3,800 / 4,000 / 4,200 / 4,500 / 100,000(임원)] (만원). 평균은 약 13,310만원으로 평사원 누구의 연봉도 안 닮음. 중앙값은 3,700만원으로 실제 평사원 수준을 잘 대표. 평균이 임원 한 명 때문에 통째로 왜곡된 사례 — 저항성이 떨어지는 통계의 위험을 보여줍니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "robust / 중앙값 / IQR"',
          body:
            '"중앙값", "IQR(사분위범위)", "Trimmed Mean(절사평균)", "robust 통계" 가 키워드면 저항성. 평균·분산·표준편차만 등장하면 비저항성.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s2-residual',
      title: 'EDA ② [잔]차해석 — "모델이 놓친 부분 추적"',
      quizId: 'adsp-3-1-cp-02-residual',
      dialogue: [
        { pose: 'wave', text: '둘째 [잔]차 — 모델이 [틀린 양] 을 들여다보기.' },
        { pose: 'think', text: '잔차 = 실제값 − 예측값. 이게 무작위면 OK, 패턴 남으면 모델 부적합.' },
        { pose: 'happy', text: '예: 잔차를 그렸더니 U자 모양 곡선 → 비선형 항을 빠뜨렸다는 신호.' },
        { pose: 'idle', text: '잔차해석 활동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '잔차해석(Residual) 은 모델 적합 후 잔차(실제 − 예측) 를 들여다보며 모델이 놓친 게 없는지 점검하는 원칙입니다. 좋은 모델일수록 잔차가 평균 0 주변에 무작위로 흩어져 있어요. 만약 잔차에 어떤 모양·추세가 보이면 그건 모델이 잡아내지 못한 정보가 남아 있다는 신호.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '광고비 → 매출 회귀모델을 만들고 잔차를 그렸더니 광고비가 클수록 잔차가 점점 크게 흩어짐 → 등분산성 깨짐(이분산), 로그 변환 필요 / 잔차가 시간에 따라 위·아래로 출렁이는 패턴 → 시계열 자기상관 누락 / 잔차 vs 예측값 산점도가 U자 → 비선형 항 누락. 모두 잔차의 패턴이 "이거 더 들여다 봐" 라고 알려주는 신호.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "잔차 산점도 / 모델 부적합 진단"',
          body:
            '"잔차 산점도 분석", "잔차 패턴 검토", "모델 부적합 진단" 이 키워드면 잔차해석. 데이터 자체의 시각화면 현시성, 변수 스케일 변환이면 재표현.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s2-reexpression',
      title: 'EDA ③ [재]표현 — "변수의 스케일을 다시 쓴다"',
      quizId: 'adsp-3-1-cp-02-reexpression',
      dialogue: [
        { pose: 'wave', text: '셋째 [재]표현 — 변수의 [눈금] 자체를 바꿔서 분석하기 쉽게 만들기.' },
        { pose: 'think', text: '로그·제곱근·역수 변환이 대표. 한쪽으로 치우친 분포를 펴주는 효과.' },
        { pose: 'happy', text: '예: 연 매출이 10만~100억까지 천차만별 → log 매출로 바꾸면 비교가 쉬워짐.' },
        { pose: 'idle', text: '재표현 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '재표현(Re-expression) 은 변수의 척도(눈금) 를 다른 함수로 바꿔 분석에 더 적합한 형태로 만드는 원칙입니다. 한쪽으로 길게 늘어진 분포를 종 모양으로 펴주거나, 분산이 들쑥날쑥한 데이터를 균일하게 만들어 회귀·t검정의 가정을 충족시키기 위해 자주 사용.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '소득 데이터(원)는 한쪽 꼬리가 매우 길게 — 대부분 3,000만 근처, 소수 100억 → log(소득) 로 바꾸면 종 모양에 가까워짐 / 도시별 인구(명)도 비슷한 long-tail 분포 → log 변환 / 광고비-매출 회귀에서 잔차 분산이 광고비에 따라 커지면 매출에 sqrt 또는 log 변환 / 연봉 비율 데이터에선 Box-Cox 자동 탐색이 자주 사용. 모두 "원래 변수 그대로면 가정 못 맞춤 → 변환으로 맞춤".',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "로그/제곱근/Box-Cox 변환"',
          body:
            '"로그 변환", "제곱근 변환", "Box-Cox", "스케일 변환" 이 키워드면 재표현. 시각화로 단순 탐색이면 현시성, 잔차의 패턴을 본다면 잔차해석.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s2-revelation',
      title: 'EDA ④ [현]시성 — "시각화로 드러낸다"',
      quizId: 'adsp-3-1-cp-02-revelation',
      dialogue: [
        { pose: 'wave', text: '넷째 [현]시성 — 데이터를 [그림으로 보여주는] 단계.' },
        { pose: 'think', text: '히스토그램·박스플롯·산점도. 숫자 표보다 그림 한 장이 훨씬 빨라.' },
        { pose: 'happy', text: '예: 산점도를 그렸더니 두 그룹이 명확히 갈라짐 → 군집 구조 발견.' },
        { pose: 'idle', text: '현시성 활동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '현시성(Revelation) 은 적절한 시각화로 데이터에 숨은 구조·관계·이상을 드러내는 원칙입니다. EDA 4원칙 중 가장 자주 마주하는 활동 — 표나 평균값으론 안 보이는 패턴이 그림 한 장에서 단번에 드러나는 경우가 많거든요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '히스토그램으로 매출 분포를 그려 양봉(쌍봉) 분포 발견 → 두 종류 고객이 섞여 있다는 신호 / 박스플롯으로 부서별 야근시간을 비교해 한 부서만 outlier 다수 식별 / 키 vs 몸무게 산점도에서 두 그룹(성별) 이 명확히 분리되는 걸 보고 새 변수 추가 / 시간 vs 사용량 라인 차트에서 매주 토요일에 피크가 반복되는 주기성 발견. 모두 시각화 한 번이 "데이터를 들여다보게" 만들어 준 케이스.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "히스토그램/박스플롯/산점도"',
          body:
            '"히스토그램·박스플롯·산점도로 패턴 발견", "시각적 탐색" 이 키워드면 현시성. 잔차를 그리면 잔차해석으로 잡힐 수 있으니 초점에 따라 분리.',
        },
      ],
    },
    // ─── 결측값 처리 — 1 step → 5 substeps (overview + 4 방식) ───
    {
      id: 'adsp-3-1-s3',
      title: '결측값 처리 — 개요',
      quizId: 'adsp-3-1-cp-03',
      dialogue: [
        { pose: 'wave', text: '데이터 빈칸 — 무시할지 채울지.' },
        { pose: 'think', text: '4방식: [완전 제거] · [단순 대치] · [다중 대치] · [모델 기반].' },
        { pose: 'idle', text: '먼저 4방식 + 결측 매커니즘 (MCAR/MAR/MNAR).' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '결측 매커니즘 (MCAR/MAR/MNAR)',
          body:
            'MCAR(완전 무작위) → 삭제해도 편향 X. MAR(다른 변수에 의존) → 모델 기반 추천. MNAR(결측 자체에 의미) → 삭제 시 편향 큼.',
        },
        {
          kind: 'table',
          headers: ['방식', '핵심', '비고'],
          rows: [
            ['완전 제거', 'Listwise / Pairwise', '간단·정보 손실'],
            ['단순 대치', '평균·중앙값·최빈값', '분산 과소평가'],
            ['다중 대치(MI)', '여러 번 대치 → 통합', '불확실성 반영'],
            ['모델 기반', '회귀·KNN 예측', '고품질·복잡'],
          ],
        },
      ],
    },
    {
      id: 'adsp-3-1-s3-deletion',
      title: '결측 처리 ① 완전 제거',
      quizId: 'adsp-3-1-cp-03-deletion',
      dialogue: [
        { pose: 'wave', text: '첫 [완전 제거] — Listwise/Pairwise.' },
        { pose: 'think', text: '결측 있는 행 통째 제거. 가장 간단하지만 정보 손실 큼.' },
        { pose: 'idle', text: '완전 제거 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '완전 제거(Listwise Deletion) 는 결측이 있는 레코드를 모두 제외. Pairwise 는 분석마다 가용 변수만 사용. 단순하지만 표본이 작아지고 MNAR 일 때 편향 발생.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"행 제거", "Listwise/Pairwise", "정보 손실". 평균/중앙값으로 채우면 단순 대치, 모델로 예측이면 모델 기반.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s3-simple',
      title: '결측 처리 ② 단순 대치',
      quizId: 'adsp-3-1-cp-03-simple',
      dialogue: [
        { pose: 'wave', text: '둘째 [단순 대치] — 평균·중앙값·최빈값.' },
        { pose: 'think', text: '쉽고 빠르지만 분산 과소평가.' },
        { pose: 'idle', text: '단순 대치 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '단순 대치(Simple Imputation) 는 평균·중앙값·최빈값 같은 단일 통계로 결측을 채움. 빠르지만 변동성을 줄여 통계적 추론을 왜곡할 수 있음.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"평균·중앙값·최빈값", "분산 과소평가". 여러 번 대치 후 통합이면 다중 대치, 회귀·KNN 면 모델 기반.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s3-multiple',
      title: '결측 처리 ③ 다중 대치 (MI)',
      quizId: 'adsp-3-1-cp-03-multiple',
      dialogue: [
        { pose: 'wave', text: '셋째 [다중 대치] — 여러 번 대치 → 통합.' },
        { pose: 'think', text: 'M번 다른 값으로 채워 M개 데이터셋 생성 → 결과 통합.' },
        { pose: 'idle', text: '다중 대치 핵심을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '다중 대치(Multiple Imputation, MI) 는 결측 값에 대해 여러 번(M회) 다른 값을 대치해 M개의 완전 데이터셋을 만들고, 분석 후 결과를 통합. 대치의 불확실성까지 반영.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"여러 번 대치 → 통합", "불확실성 반영". 단일 통계로 채우면 단순 대치, 단일 모델 예측이면 모델 기반.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s3-model',
      title: '결측 처리 ④ 모델 기반',
      quizId: 'adsp-3-1-cp-03-model',
      dialogue: [
        { pose: 'wave', text: '넷째 [모델 기반] — 회귀·KNN 으로 예측.' },
        { pose: 'think', text: '다른 변수로 결측을 예측. 정교하지만 비용 큼.' },
        { pose: 'idle', text: '모델 기반 대치 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '모델 기반 대치는 회귀·KNN·랜덤포레스트 등으로 다른 변수에서 결측을 예측해 채움. 변수 간 관계를 활용해 단순 대치보다 정교.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"회귀·KNN 예측", "변수 간 관계 활용". 단일 통계는 단순, 다회 대치는 다중, 행 제거는 완전 제거.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s4',
      title: '이상값 탐지 — 개요',
      quizId: 'adsp-3-1-cp-04',
      dialogue: [
        { pose: 'wave', text: '이상값 한 개가 모델을 망친다. 탐지 필수.' },
        { pose: 'think', text: '대표 4방법: [ESD] · [IQR] · [Z-Score] · [DBScan].' },
        { pose: 'idle', text: '먼저 4방법 + 처리 원칙.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '이상값 = 반드시 제거 아님',
          body:
            '오타·기기 오류는 제거. 사기 거래·고가치 고객처럼 진짜 극단값이면 남겨서 분석 대상으로 삼습니다.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s4-esd',
      title: '이상값 ① ESD — "평균 ± 3σ 밖"',
      quizId: 'adsp-3-1-cp-04-esd',
      dialogue: [
        { pose: 'wave', text: '첫 방법 [ESD] — 평균에서 [표준편차의 3배] 이상 떨어진 점을 이상값으로.' },
        { pose: 'think', text: '정규분포 가정 위에서 작동. 종 모양 분포에 가까우면 빠르고 단순.' },
        { pose: 'happy', text: '예: 학생 시험점수 평균 70, σ=10 → 100점 이상 / 40점 이하가 ±3σ 밖 → 이상값 후보.' },
        { pose: 'idle', text: 'ESD 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'ESD(Extreme Studentized Deviate) 는 "평균 ± 3·표준편차" 라는 정규분포 기반의 경계로 이상값을 판정하는 방법입니다. 정규분포에선 99.7% 의 데이터가 평균 ±3σ 안에 들어오므로, 이 밖으로 나가면 0.3% 미만의 극단적인 값으로 봅니다. 종 모양 분포에 가까운 데이터에서 가장 빠르고 단순한 방법.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '학생 시험점수가 평균 70, σ=10 인 정규분포라 가정 → 100점 초과 또는 40점 미만이 ESD 기준 이상값 / 신장 데이터(평균 170cm, σ=8) → 194cm 초과 / 146cm 미만 / 매월 평균 매출 1,000만원, σ=200만원인 가게 → 이번 달 1,800만원이면 이상값 후보. 모두 정규성 가정이 통하는 케이스.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — 정규성 깨지면 위험',
          body:
            '소득·매출처럼 한쪽 꼬리가 길게 늘어진 분포(skewed) 는 정규가 아니어서 ESD 가 "정상값을 이상값으로" 또는 그 반대로 오판하기 쉽습니다. 정규성 미확인이면 IQR 이 안전.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s4-iqr',
      title: '이상값 ② IQR — "박스플롯의 수염 밖"',
      quizId: 'adsp-3-1-cp-04-iqr',
      dialogue: [
        { pose: 'wave', text: '둘째 [IQR] — [Q1 − 1.5·IQR / Q3 + 1.5·IQR] 밖이면 이상.' },
        { pose: 'think', text: '분포 모양에 [가정이 없어] 안전. 박스플롯의 점들이 바로 이상값.' },
        { pose: 'happy', text: '예: 소득처럼 한쪽 꼬리가 긴 데이터 → 정규 가정이 깨져도 IQR 은 잘 작동.' },
        { pose: 'idle', text: 'IQR 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'IQR(Interquartile Range, 사분위수 범위) 은 Q3(상위 25% 경계) 에서 Q1(하위 25% 경계) 을 뺀 폭입니다. 이 폭의 1.5배만큼을 양쪽에 더해 "Q1 − 1.5·IQR 미만" 또는 "Q3 + 1.5·IQR 초과" 를 이상값으로 판정합니다. 박스플롯의 수염 밖 점들이 바로 이 기준의 이상값.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '소득 데이터 — 한쪽 꼬리가 매우 길어 정규 가정 불가. IQR 로 가르면 자연스럽게 고소득자만 이상값으로 분류 / 부동산 가격 — 일부 초고가 매물 분리 / 통화 시간 — 대부분 짧고 일부 매우 긴 통화. 모두 비대칭 분포라 IQR 이 ESD 보다 안전한 케이스. 박스플롯 시각화와 1:1 매칭.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "Q1·Q3 / 1.5·IQR / 박스플롯"',
          body:
            '"분위수 기반", "1.5·IQR 경계", "박스플롯" 이 키워드면 IQR. 정규 분포 가정이면 ESD/Z-Score, 밀도 기반이면 DBScan.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s4-z',
      title: '이상값 ③ Z-Score — "표준화 점수가 임계 밖"',
      quizId: 'adsp-3-1-cp-04-z',
      dialogue: [
        { pose: 'wave', text: '셋째 [Z-Score] — 값을 [(값 − 평균)/σ] 로 표준화한 뒤 임계값 비교.' },
        { pose: 'think', text: '|z| > 2 면 가벼운 의심, > 3 이면 강한 이상값.' },
        { pose: 'happy', text: 'ESD 와 비슷하지만 임계값(2/3) 을 [상황에 맞게 조절] 가능한 게 차이.' },
        { pose: 'idle', text: 'Z-Score 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Z-Score 는 각 데이터 값을 "(값 − 평균) / 표준편차" 로 변환해 평균에서 몇 σ 떨어졌는지를 숫자로 표현하는 방법입니다. 변환된 |z| 가 임계값(보통 2 또는 3) 을 넘으면 이상값으로 판정. 임계값을 데이터 특성에 맞게 조절할 수 있다는 게 ESD 보다 유연한 점입니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '직원 연봉이 평균 5,000만, σ=1,500만 인 회사. 한 임원의 연봉이 1억이면 z = (10000-5000)/1500 ≈ 3.3 → 강한 이상값 / 학생의 시험 점수가 z = -2.5 → 평균보다 2.5σ 낮음 → 의심 / 카드 결제 금액의 z 가 4 → 평균을 매우 크게 벗어나는 거래 → 사기 탐지 후보. 임계값을 2 로 두면 더 민감하게, 3 으로 두면 보수적으로 잡을 수 있어요.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "표준화 + 임계값"',
          body:
            '"표준화 점수", "|z| > 2 또는 3" 이 키워드면 Z-Score. 분포 가정 없는 분위수 기반이면 IQR, 밀도 기반이면 DBScan, 평균 ± 3σ 고정이면 ESD.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s4-dbscan',
      title: '이상값 ④ DBScan — "주변에 친구가 적은 점"',
      quizId: 'adsp-3-1-cp-04-dbscan',
      dialogue: [
        { pose: 'wave', text: '넷째 [DBScan] — [밀도] 기반. 주변 ε 반경 안에 친구(점) 가 너무 적으면 이상.' },
        { pose: 'think', text: '본래 군집 알고리즘인데 noise 점을 [자동 마킹] 해서 이상값 탐지로도 쓸 수 있어.' },
        { pose: 'happy', text: '예: 위치 기반 데이터 — 도심에 점이 빽빽하면 밀집 군집, 외딴 한 점은 noise = 이상값.' },
        { pose: 'idle', text: 'DBScan 의 작동 원리를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'DBScan(Density-Based Spatial Clustering of Applications with Noise) 은 본래 군집 알고리즘이지만, "어느 군집에도 속하지 않는 점(noise)" 을 자동으로 분리해주기 때문에 이상값 탐지로도 자주 사용됩니다. 평균·분산이 아닌 거리·밀도 기반이라 비선형·비정규 분포에서도 강합니다.',
        },
        {
          kind: 'section',
          title: '핵심 두 파라미터 — ε 와 minPts',
          body:
            'ε(epsilon): 한 점의 "이웃" 으로 인정할 거리 반경. minPts: 그 반경 안에 최소 몇 개 점이 있어야 군집으로 보는지의 기준. 어떤 점의 ε 반경 안에 minPts 미만이면 어느 군집에도 못 끼어 noise 로 분류 → 자연스럽게 이상값.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '서울 위치 기반 점들 — 강남·홍대처럼 점이 빽빽한 곳은 밀집 군집, 산속 외딴 한 점은 noise → 이상값 / 신용카드 거래 분포 — 일상 패턴이 군집 형성, 멀리 떨어진 한 거래는 noise → 사기 의심 / IoT 센서 데이터 — 정상 작동 군집 + 외딴 측정값 → 장비 오작동 후보.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "ε 반경 + minPts / 밀도"',
          body:
            '"밀도 기반", "ε 반경 + minPts", "noise 자동 식별" 이 키워드면 DBScan. 평균·분산이 키워드면 ESD/Z, 분위수면 IQR.',
        },
      ],
    },
    // ─── R 자료구조 — 1 step → 5 substeps (overview + 4 자료구조) ───
    {
      id: 'adsp-3-1-s5',
      title: 'R 문법 기초 — 자료구조 개요',
      quizId: 'adsp-3-1-cp-05',
      dialogue: [
        { pose: 'wave', text: 'R 은 통계 분석 전용 언어. 자료구조부터.' },
        { pose: 'think', text: '4가지: [vector] · [list] · [matrix] · [data.frame].' },
        { pose: 'idle', text: '먼저 4구조 비교 + 할당 연산자.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '할당 — "화살표" `<-`',
          body:
            '기본 할당 연산자는 `<-` (예: `x <- c(1,2,3)`). `=` 도 대부분 동작하나 관례는 `<-`.',
        },
        {
          kind: 'table',
          title: '자료구조 4가지',
          headers: ['구조', '특징', '예시'],
          rows: [
            ['vector', '같은 유형 1차원', 'c(1, 2, 3)'],
            ['list', '서로 다른 유형 혼합', 'list(name="A", age=30)'],
            ['matrix', '같은 유형 2차원', 'matrix(1:6, 2, 3)'],
            ['data.frame', '열마다 유형 다른 표', 'iris, mtcars'],
          ],
        },
      ],
    },
    {
      id: 'adsp-3-1-s5-vector',
      title: 'R ① vector — 같은 타입 1차원',
      quizId: 'adsp-3-1-cp-05-vector',
      dialogue: [
        { pose: 'wave', text: '첫째 [vector] — 같은 타입 1차원.' },
        { pose: 'think', text: 'c(1, 2, 3) 처럼 한 줄에 같은 유형 값들.' },
        { pose: 'idle', text: 'vector 특징을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'vector 는 R 의 기본 단위. 같은 타입의 1차원 묶음. c(1, 2, 3) · c("a", "b") · 1:10 모두 vector. 다른 타입을 섞으면 가장 일반적인 타입으로 자동 변환(coercion).',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"같은 타입 1차원", "c() 함수". 다른 타입 혼합이면 list, 표 형태면 data.frame.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s5-list',
      title: 'R ② list — 다른 타입 혼합',
      quizId: 'adsp-3-1-cp-05-list',
      dialogue: [
        { pose: 'wave', text: '둘째 [list] — 서로 다른 타입 혼합.' },
        { pose: 'think', text: '문자·숫자·벡터·또 다른 리스트까지 한 객체에.' },
        { pose: 'idle', text: 'list 특징을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'list 는 서로 다른 타입·길이의 요소를 한 객체에 담는 컨테이너. list(name="A", age=30, scores=c(90,85)) 처럼 이름 붙여 접근.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"이질적 타입 혼합", "list()". 단일 타입 1차원이면 vector, 단일 타입 2차원이면 matrix.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s5-matrix',
      title: 'R ③ matrix — 같은 타입 2차원',
      quizId: 'adsp-3-1-cp-05-matrix',
      dialogue: [
        { pose: 'wave', text: '셋째 [matrix] — 같은 타입 2차원.' },
        { pose: 'think', text: 'matrix(1:6, 2, 3) — 행·열 형태. 선형대수 연산 가능.' },
        { pose: 'idle', text: 'matrix 특징을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'matrix 는 같은 타입의 2차원 배열. matrix(1:6, nrow=2, ncol=3) · 행렬 곱(%*%)·전치(t())·역행렬(solve()) 등 선형대수 연산 지원.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"같은 타입 2차원", "행·열". 열마다 타입 달라도 되면 data.frame, 1차원이면 vector.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s5-df',
      title: 'R ④ data.frame — 열마다 다른 타입',
      quizId: 'adsp-3-1-cp-05-df',
      dialogue: [
        { pose: 'wave', text: '넷째 [data.frame] — 열마다 다른 타입.' },
        { pose: 'think', text: '실무 표 데이터의 표준. iris, mtcars 가 대표.' },
        { pose: 'idle', text: 'data.frame 특징을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'data.frame 은 분석에서 가장 자주 다루는 자료구조. 행=관측치, 열=변수. 열마다 타입(숫자·문자·factor) 이 달라도 되며, dplyr 로 filter/select/mutate.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"열마다 타입 다른 표", "iris·mtcars", "행=관측치 열=변수". 모든 열 같은 타입이면 matrix.',
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
    // ─── 측정 척도 4단계 — 1 step → 5 substeps ───
    {
      id: 'adsp-3-2-s1',
      title: '측정 척도 — "명·서·등·비" 개요',
      quizId: 'adsp-3-2-cp-01',
      dialogue: [
        { pose: 'wave', text: '같은 숫자라도 [척도]가 다르면 가능한 계산이 달라.' },
        { pose: 'think', text: '4단계: [명]목 · [서]열 · [등]간 · [비]율.' },
        { pose: 'idle', text: '먼저 위계와 가능한 연산 확인.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '척도가 낮을수록 정보량이 적고, 높을수록 가능한 연산이 자유롭습니다. 명목 < 순서(서열) < 등간 < 비율 위계.',
        },
        {
          kind: 'table',
          headers: ['척도', '예시', '연산'],
          rows: [
            ['명목', '성별·혈액형', '='],
            ['순서', '학점·만족도', '=, <'],
            ['등간', '섭씨·연도', '=, <, +/−'],
            ['비율', '키·몸무게', '모든 연산 + 비율'],
          ],
        },
      ],
    },
    {
      id: 'adsp-3-2-s1-nominal',
      title: '척도 ① [명]목 — "이름표만"',
      quizId: 'adsp-3-2-cp-01-nominal',
      dialogue: [
        { pose: 'wave', text: '첫째 [명]목 — 그냥 [이름표] 야. 순서 없음.' },
        { pose: 'think', text: '예: 혈액형 A·B·O·AB. A 가 B 보다 큰가? 의미 없는 질문.' },
        { pose: 'happy', text: '가능한 연산은 [같다 / 다르다] 뿐.' },
        { pose: 'idle', text: '명목 척도 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '명목(Nominal) 척도는 카테고리를 구분하는 이름표일 뿐, 그 사이에 어떤 순서·크기·간격도 의미가 없는 척도입니다. "같다 / 다르다" 의 비교만 통하고, "크다·작다", "차이가 얼마", "두 배" 같은 비교는 모두 무의미합니다. 척도의 4단계 중 가장 정보량이 적은 단계.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '혈액형(A·B·O·AB) — A 가 B 보다 큰가? 무의미 / 성별(남·여·기타) — 어느 쪽이 위인가? 무의미 / 도시 코드("서울·부산·대구") — 1·2·3 으로 적혀 있어도 그건 라벨일 뿐 / 자동차 색상(빨·파·노) / 학과(컴공·경영·국문). 모두 분류만 가능, 산수는 무의미한 데이터.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — "1·2·3 코드는 명목"',
          body:
            '"1=서울, 2=부산, 3=대구" 처럼 숫자 코드가 들어가도 의미가 라벨이면 명목입니다. 평균을 내도 "2 = 부산" 이라는 결과가 의미 없으니까요. 학점 A·B·C 처럼 순서가 있으면 다음 단계(순서).',
        },
      ],
    },
    {
      id: 'adsp-3-2-s1-ordinal',
      title: '척도 ② [서]열(순서) — "줄 세우기는 OK, 간격은 모름"',
      quizId: 'adsp-3-2-cp-01-ordinal',
      dialogue: [
        { pose: 'wave', text: '둘째 [서]열 — 누가 [위인지 아래인지] 는 알지만 [얼마나 차이] 인지는 몰라.' },
        { pose: 'think', text: '예: 학점 A · B · C. A가 B보다 위인 건 분명. 그런데 A-B 차이가 B-C 와 같을까? 모름.' },
        { pose: 'happy', text: '가능한 연산은 [같다 / 다르다 / 크다 / 작다] 까지.' },
        { pose: 'idle', text: '순서 척도 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '순서(Ordinal, 서열) 척도는 값들 사이에 순위는 있지만 그 간격이 일정한지는 모르는 척도입니다. "A > B > C" 라고 줄세우는 건 의미 있지만, "A와 B의 차이가 B와 C의 차이와 같다" 라고 단정할 수는 없어요. 차이를 산수(빼기) 로 다루는 건 무의미.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '학점 A·B·C·D·F — 순위는 분명하지만 A와 B 사이 차이가 B와 C 사이 차이와 같다고 보장 못함 / 만족도 5단계(매우 만족 ~ 매우 불만족) — 4와 5의 차이가 1과 2의 차이와 같은지 알 수 없음 / 마라톤 순위(1·2·3등) — 1등과 2등의 시간 격차가 2등과 3등 격차와 같다는 보장 없음 / 군대 계급(이병·일병·상병·병장). 모두 줄세우기는 OK 인데 간격은 모르는 케이스.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "순위는 OK, 평균은 No"',
          body:
            '순서 척도에 평균을 내면 의미가 흐릿해집니다 — 만족도 평균 3.7 이 정확히 어떤 만족 상태인지 단정 못함. 차이가 일정한 의미를 가지면 다음 단계(등간).',
        },
      ],
    },
    {
      id: 'adsp-3-2-s1-interval',
      title: '척도 ③ [등]간 — "간격은 의미 있는데, 비율은 No"',
      quizId: 'adsp-3-2-cp-01-interval',
      dialogue: [
        { pose: 'wave', text: '셋째 [등]간 — 차이([빼기])는 의미 있지만 [비율(나누기)] 은 무의미.' },
        { pose: 'think', text: '대표 예: 섭씨 온도. 30°C - 20°C = 10°C 차이는 OK. 30°C ÷ 15°C = "두 배 덥다"? No.' },
        { pose: 'happy', text: '이유 — [0이 절대 0이 아니다]. 섭씨 0°C 가 "온도 없음" 이 아니거든.' },
        { pose: 'idle', text: '등간 척도 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '등간(Interval) 척도는 값의 차이(빼기) 가 일정한 의미를 갖는 척도입니다. "10°C 차이" 가 어디서나 같은 의미예요. 하지만 비율(나누기) 은 무의미한데, 그 이유는 "절대 0 (값이 진짜 없는 상태)" 이 정의되지 않았기 때문입니다. 0이 그저 "임의로 정한 기준점" 일 뿐.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '섭씨 온도 — 30°C 가 15°C 의 "두 배" 가 아닙니다. 0°C 도 "온도가 0" 이 아니라 그저 물의 어는점일 뿐 (실제 절대 0 은 -273°C) / 연도 — 2024년이 1012년의 "두 배" 가 아닙니다. AD/BC 의 0은 임의로 정한 기준점 / IQ 점수 — IQ 100 이 IQ 50 의 "두 배 똑똑" 이 아닙니다. IQ 0 = "지능 없음" 이 아니거든요. 모두 차이는 의미 있지만 비율은 의미 없는 케이스.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — 0의 의미가 등간 vs 비율을 가른다',
          body:
            '"0 이 진짜 \'없음\' 인가?" 가 핵심 질문. 섭씨 0°C / 연도 0년 / IQ 0 은 "없음" 이 아니므로 등간. 켈빈 0K (절대 0) / 키 0cm / 매출 0원 은 진짜 "없음" 이라 비율.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s1-ratio',
      title: '척도 ④ [비]율 — "0이 절대 0, 모든 연산 OK"',
      quizId: 'adsp-3-2-cp-01-ratio',
      dialogue: [
        { pose: 'wave', text: '마지막 [비]율 — [0이 진짜 없음] 을 의미해서 [비율 계산] 까지 자유로워.' },
        { pose: 'think', text: '예: 키 180cm 는 90cm 의 [두 배]. 명백히 의미 있어.' },
        { pose: 'happy', text: '+ - × ÷ 모두 OK. 척도 4단계 중 [가장 정보량이 많은] 단계.' },
        { pose: 'idle', text: '비율 척도 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '비율(Ratio) 척도는 절대 0 이 존재해 모든 산술 연산이 의미를 가지는 척도입니다. "두 배 / 절반" 같은 비율 표현이 명백히 통합니다. 4단계 척도 중 가장 정보량이 많고 자유롭게 분석할 수 있어요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '키 180cm vs 90cm → 두 배 (의미 있음, 키 0cm = "키 없음") / 매출 1,000만원 vs 500만원 → 두 배 (매출 0원 = "매출 없음") / 몸무게 80kg vs 40kg → 두 배 / 길이·시간(초) · 거리(km) · 볼륨(리터) · 켈빈 온도(0K = 분자 운동 없음). 모두 0 이 진짜 "없음" 이라 비율 비교가 자연스러움.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "두 배가 말이 되나?"',
          body:
            '"이 값이 다른 값의 두 배다" 라는 표현이 자연스러우면 비율, 어색하면 등간 이하. 키·몸무게·매출·길이는 비율, 섭씨 온도·연도·IQ 는 등간.',
        },
      ],
    },
    // ─── 확률분포 — 1 step → 3 substeps (overview + 이산 + 연속) ───
    {
      id: 'adsp-3-2-s2',
      title: '확률분포 — 이산 vs 연속 개요',
      quizId: 'adsp-3-2-cp-02',
      dialogue: [
        { pose: 'wave', text: '확률분포 — 이산 vs 연속 두 갈래.' },
        { pose: 'think', text: '이산: 셀 수 있는 결과. 연속: 실수 구간.' },
        { pose: 'idle', text: '먼저 두 갈래 + 대표 분포.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '구분 기준',
          body:
            '결과를 셀 수 있으면 이산 (베르누이·이항·포아송…), 실수 구간이면 연속 (정규·t·카이제곱·F·지수).',
        },
      ],
    },
    {
      id: 'adsp-3-2-s2-discrete',
      title: '확률분포 ① 이산 (Discrete)',
      quizId: 'adsp-3-2-cp-02-discrete',
      dialogue: [
        { pose: 'wave', text: '첫째 [이산] — 셀 수 있는 결과.' },
        { pose: 'think', text: '베르누이·이항·기하·포아송·다항.' },
        { pose: 'happy', text: '"희귀 사건이 단위시간 몇 번" → 포아송!' },
        { pose: 'idle', text: '이산 분포 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '이산 확률분포는 결과가 셀 수 있는 값. 베르누이(1회 성공/실패) · 이항(n회 중 k) · 기하(첫 성공까지) · 다항(여러 범주) · 포아송(단위시간 드문 사건).',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"셀 수 있음", "성공/실패", "단위시간 사건". 키·시간 같은 실수면 연속.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s2-continuous',
      title: '확률분포 ② 연속 (Continuous)',
      quizId: 'adsp-3-2-cp-02-continuous',
      dialogue: [
        { pose: 'wave', text: '둘째 [연속] — 실수 구간.' },
        { pose: 'think', text: '정규·t·카이제곱·F·지수.' },
        { pose: 'happy', text: '"표본 작음·모분산 모를 때 평균 검정" → t분포!' },
        { pose: 'idle', text: '연속 분포 용도를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '연속 확률분포는 결과가 실수 구간. 정규(기본·CLT) · t(소표본 평균) · 카이제곱(분산·적합도·독립성) · F(분산비·ANOVA) · 지수(사건 사이 대기시간).',
        },
        {
          kind: 'table',
          title: '연속 주 용도',
          headers: ['분포', '용도'],
          rows: [
            ['정규', '기본, 평균·분산'],
            ['t', '소표본 평균 검정'],
            ['χ²', '분산·적합도·독립성 검정'],
            ['F', '두 분산의 비 (ANOVA)'],
            ['지수', '사건 사이 대기시간'],
          ],
        },
      ],
    },
    // ─── 좋은 추정량 4성질 (불효일충) — 1 step → 5 substeps ───
    {
      id: 'adsp-3-2-s3',
      title: '좋은 추정량 — "불·효·일·충" 개요',
      quizId: 'adsp-3-2-cp-03',
      dialogue: [
        { pose: 'wave', text: '추정량이 좋은 이유는 [4가지 성질].' },
        { pose: 'think', text: '"[불효일충]" — 불편성 · 효율성 · 일치성 · 충분성.' },
        { pose: 'idle', text: '먼저 4성질 이름·구분.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"불·효·일·충"',
          body:
            'Unbiased(불편성) · Efficient(효율성) · Consistent(일치성) · Sufficient(충분성). "정규성" 은 포함되지 않습니다 — 함정.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s3-unbiased',
      title: '추정량 ① [불]편성 — "평균 내면 정답"',
      quizId: 'adsp-3-2-cp-03-unbiased',
      dialogue: [
        { pose: 'wave', text: '첫째 [불]편성 — 추정한 값을 [무한 번 평균] 내면 진짜 모수.' },
        { pose: 'think', text: '한 번만 추정하면 빗나갈 수 있어도 [기댓값] 으로 보면 정확.' },
        { pose: 'happy', text: '예: 표본평균이 모평균의 불편추정량 — 통계학의 출발점.' },
        { pose: 'idle', text: '불편성 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '불편성(Unbiased) 은 "추정값을 무한 번 반복했을 때 평균이 정확히 진짜 모수가 되는" 성질입니다. 한 번의 추정은 빗나갈 수 있어도 체계적인 편향(bias) 이 없다는 뜻이에요. 식으로는 E[추정량] = 모수.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '여론조사를 1,000번 반복해 매번 1,000명 표본의 지지율을 추정한다 가정. 표본평균은 매번 진짜 지지율 50% 근처에서 49.8 / 50.3 / 50.1 처럼 흔들리지만 1,000번 평균하면 정확히 50%. 반면 항상 "지지자만 인터뷰" 하는 편향된 표집은 평균이 60% 처럼 한쪽으로 치우쳐 — 불편성 깨짐. 표본분산도 (n-1) 로 나눠야 불편추정량이 되는 게 같은 이유.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "기댓값 = 모수"',
          body:
            '"기댓값이 모수와 일치", "편향 0" 이 키워드면 불편성. 분산이 작다 = 효율성, 표본↑ 시 모수에 수렴 = 일치성.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s3-efficient',
      title: '추정량 ② [효]율성 — "분산이 가장 작다"',
      quizId: 'adsp-3-2-cp-03-efficient',
      dialogue: [
        { pose: 'wave', text: '둘째 [효]율성 — 같은 모수를 추정하는 후보들 중 [흔들림이 가장 작은] 것.' },
        { pose: 'think', text: '평균적으로 정답이어도 매번 +-30%씩 튀면 못 써. 같은 정답률에 [덜 튀는] 게 좋은 추정량.' },
        { pose: 'happy', text: '예: 정규분포에서 표본평균이 표본중앙값보다 효율적 — 분산이 더 작거든.' },
        { pose: 'idle', text: '효율성 의미를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '효율성(Efficient) 은 같은 모수를 추정하는 여러 불편추정량 중 분산(또는 MSE) 이 가장 작은 것을 의미합니다. 평균적으로는 둘 다 정답이라도 한 번의 추정에서 덜 흔들리는 게 더 좋은 추정량 — 매번 더 신뢰할 수 있으니까요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '정규분포 모집단의 모평균을 추정할 때 후보 두 개: 표본평균과 표본중앙값. 둘 다 불편추정량이지만 표본평균의 분산이 더 작아 효율적 / 모분산을 추정할 때 (n-1) 로 나눈 표본분산은 불편이고 (n) 으로 나눈 추정량은 편향. 정규분포 가정하에 (n-1) 로 나눈 게 효율 측면에서도 좋은 선택. 같은 "옳음" 안에서 더 안정적인 쪽이 효율적.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "분산 / MSE 가 작다"',
          body:
            '"분산이 가장 작다", "MSE 최소" 가 키워드면 효율성. 평균이 모수와 같다면 불편성, 표본 커지면 수렴이면 일치성.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s3-consistent',
      title: '추정량 ③ [일]치성 — "표본 커지면 정답에 가까워진다"',
      quizId: 'adsp-3-2-cp-03-consistent',
      dialogue: [
        { pose: 'wave', text: '셋째 [일]치성 — [표본 크기 n] 이 커질수록 추정량이 [모수에 점점 다가감].' },
        { pose: 'think', text: '소수에선 빗나갈 수 있어도 표본을 100배 늘리면 거의 정답.' },
        { pose: 'happy', text: '예: 동전 앞면 확률 추정 — 10번 던지면 7/10=0.7 같이 흔들리지만 100만 번이면 0.5에 매우 가까움.' },
        { pose: 'idle', text: '일치성 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '일치성(Consistent) 은 표본 크기 n 이 커질수록 추정량이 모수에 확률적으로 수렴하는 성질입니다. "표본을 무한히 늘리면 결국 정답이 된다" 의 보장. 큰 표본을 가질 수만 있다면 신뢰할 수 있다는 의미라 통계 추론의 핵심 기반.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '동전의 앞면 확률을 추정할 때 10번 던지면 7번 앞면 = 0.7 처럼 0.5에서 멀리 빗나갈 수 있음. 1,000번 던지면 약 0.49~0.51, 100만 번 던지면 0.5에 매우 가까움 — 표본↑ 가 추정 정확도↑ / 여론조사 1,000명 vs 10만 명 — 후자가 진짜 지지율에 더 가까움 / 평균 키 추정 — 100명에서 174.3cm, 10,000명에서 173.85cm, 100만 명이면 모평균에 매우 근접.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "n↑ 시 모수에 수렴"',
          body:
            '"표본 크기↑ 시 모수에 수렴", "n → ∞ 일관성" 이 키워드면 일치성. 분산 작다 = 효율성, 표본 정보 다 담음 = 충분성.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s3-sufficient',
      title: '추정량 ④ [충]분성 — "표본의 정보를 다 담음"',
      quizId: 'adsp-3-2-cp-03-sufficient',
      dialogue: [
        { pose: 'wave', text: '넷째 [충]분성 — 추정량이 표본의 [모수 관련 정보를 다] 담아냄.' },
        { pose: 'think', text: '추정량을 알면 [원 표본을 더 들여다 봐도] 모수에 대한 추가 정보가 안 나와.' },
        { pose: 'happy', text: '예: 베르누이 시행에서 "성공 횟수" 만 알면 모비율 추정에 충분 — 어떤 순서로 성공했는지는 정보가 더 안 됨.' },
        { pose: 'idle', text: '충분성 의미를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '충분성(Sufficient) 은 추정량이 표본의 모수 관련 정보를 모두 흡수했음을 의미합니다. "추정량 값만 알면 충분하다 — 원 표본을 다시 들여다봐도 모수에 대한 더 많은 정보가 안 나온다" 는 보장. 정보 손실 없이 데이터를 압축한 통계량이라는 뜻.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '동전 100번 던지기에서 모비율 p 를 추정할 때, "성공 횟수 = 47" 만 알면 p 추정에 충분. 어떤 순서(앞·뒤·앞·앞…)로 47번 성공이었는지는 추가 정보가 아님 / 정규분포의 모평균 추정에서 "표본평균" 이 충분통계량 / 균등분포 U(0, θ) 에서 모수 θ 추정엔 "표본 최댓값" 이 충분. 모두 정보를 다 흡수해 더 압축할 수 없는 추정량.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '시험 함정 — "정규성" 은 4성질에 없음',
          body:
            '추정량의 4성질은 [불]편성·[효]율성·[일]치성·[충]분성. "정규성" 이 끼어 있으면 그건 함정 선지입니다.',
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
    // ─── p-value · 가설검정 5용어 — 1 step → 6 substeps ───
    {
      id: 'adsp-3-3-s1',
      title: '가설검정 5용어 — 개요',
      quizId: 'adsp-3-3-cp-01',
      dialogue: [
        { pose: 'wave', text: '가설검정 5용어 — 헷갈리면 시험에서 뚫림.' },
        { pose: 'think', text: '[H₀] · [H₁] · [α] · [p-value] · [1·2종 오류].' },
        { pose: 'idle', text: '먼저 5용어 매핑.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'warn',
          title: 'p-value 는 "H₀ 참일 확률" 이 아님',
          body:
            'p-value 는 "H₀ 가정 시 현재 이상 극단값이 나올 확률". α 보다 작으면 "우연으로 보기 어렵다" 라는 판단.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s1-h0',
      title: '가설검정 ① 귀무가설 (H₀)',
      quizId: 'adsp-3-3-cp-01-h0',
      dialogue: [
        { pose: 'wave', text: '첫째 [H₀] — "차이 없다 · 효과 없다".' },
        { pose: 'think', text: '기각의 대상. 우리가 부정하고 싶은 가설.' },
        { pose: 'idle', text: '귀무가설의 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '귀무가설(H₀, Null Hypothesis) 은 "차이 없음 · 효과 없음" 을 가정. 검정의 출발점 — 데이터가 H₀ 를 뒤집을 만큼 강한지를 봅니다.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"차이 없다", "효과 없다", "현 상태". 새로 주장할 것은 H₁(대립).',
        },
      ],
    },
    {
      id: 'adsp-3-3-s1-h1',
      title: '가설검정 ② 대립가설 (H₁)',
      quizId: 'adsp-3-3-cp-01-h1',
      dialogue: [
        { pose: 'wave', text: '둘째 [H₁] — "차이 있다 · 효과 있다".' },
        { pose: 'think', text: 'H₀ 를 기각하면 채택되는 가설. 우리가 증명하고 싶은 것.' },
        { pose: 'idle', text: '대립가설의 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '대립가설(H₁, Alternative Hypothesis) 은 "차이 있음 · 효과 있음" 을 주장. 연구자가 증명하고자 하는 가설로, H₀ 가 기각될 때 채택됩니다.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"차이 있다", "효과 있다", "주장하고 싶은 것". 부정·기각 대상은 H₀.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s1-alpha',
      title: '가설검정 ③ 유의수준 (α)',
      quizId: 'adsp-3-3-cp-01-alpha',
      dialogue: [
        { pose: 'wave', text: '셋째 [α] — 잘못 기각할 위험.' },
        { pose: 'think', text: '보통 0.05. "1종 오류를 허용할 최대 확률".' },
        { pose: 'idle', text: '유의수준의 의미를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '유의수준(α) 은 "참인 H₀ 를 잘못 기각할 위험" 의 허용 한도. 일반적으로 0.05. p-value < α 면 H₀ 기각.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"1종 오류 허용 한도", "보통 0.05". H₀ 가 거짓일 때 기각 못 할 위험은 β (2종 오류).',
        },
      ],
    },
    {
      id: 'adsp-3-3-s1-pvalue',
      title: '가설검정 ④ p-value',
      quizId: 'adsp-3-3-cp-01-pvalue',
      dialogue: [
        { pose: 'wave', text: '넷째 [p-value] — H₀ 참일 때 극단값 확률.' },
        { pose: 'think', text: 'H₀ 가정 + 현재 결과 이상의 극단값이 우연으로 나올 확률.' },
        { pose: 'idle', text: 'p-value 의 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'p-value 는 "H₀ 가 참이라고 가정할 때, 현재 데이터 또는 그보다 극단적인 결과가 나올 확률". α 보다 작으면 H₀ 기각.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '"H₀ 가 참일 확률" 이 아님',
          body:
            'p-value 는 H₀ 의 진위 확률이 아닙니다. "H₀ 가 참이라면 이런 데이터가 우연히 나올 확률" 이 정확한 정의.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s1-error',
      title: '가설검정 ⑤ 1종/2종 오류',
      quizId: 'adsp-3-3-cp-01-error',
      dialogue: [
        { pose: 'wave', text: '다섯째 [오류 2종] — 1종(α) · 2종(β).' },
        { pose: 'think', text: '1종: H₀ 맞는데 기각 (거짓 양성). 2종: H₀ 틀렸는데 채택 (놓침).' },
        { pose: 'idle', text: '오류 매칭을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '1종 오류(α) = H₀ 가 참인데 기각 (거짓 양성). 2종 오류(β) = H₀ 가 거짓인데 채택 (놓침). 검정력(Power) = 1 − β.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"1종 = H₀ 맞는데 기각 = α", "2종 = H₀ 틀렸는데 채택 = β". 검정력 = 1−β.',
        },
      ],
    },
    // ─── t검정 3종 — 1 step → 4 substeps ───
    {
      id: 'adsp-3-3-s2',
      title: 't검정 3종 — 개요',
      quizId: 'adsp-3-3-cp-02',
      dialogue: [
        { pose: 'wave', text: 't검정은 평균 차이 검정 — 3가지 버전.' },
        { pose: 'think', text: '[일표본] · [대응표본] · [독립표본].' },
        { pose: 'idle', text: '먼저 3가지 구분 + 상황 매칭.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '독립 vs 대응 함정',
          body:
            '"같은 대상의 전/후" 는 대응표본. "서로 다른 두 집단" 은 독립표본. 시험 단골.',
        },
        {
          kind: 'table',
          headers: ['종류', '상황', '예시'],
          rows: [
            ['일표본', '평균 vs 기준값', '평균 수명 = 1000시간?'],
            ['대응표본', '같은 대상 전/후', '다이어트 전/후 체중'],
            ['독립표본', '서로 다른 두 집단', 'A조 vs B조 점수'],
          ],
        },
      ],
    },
    {
      id: 'adsp-3-3-s2-one',
      title: 't검정 ① 일표본 — "한 집단 vs 기준값"',
      quizId: 'adsp-3-3-cp-02-one',
      dialogue: [
        { pose: 'wave', text: '첫째 [일표본 t] — [한 집단의 평균] 이 [기준값] 과 같은지 검정.' },
        { pose: 'think', text: '집단은 하나, 비교 상대는 [고정된 숫자] 한 개.' },
        { pose: 'happy', text: '예: 회사가 "이 전구 평균 수명은 1,000시간" 이라 광고. 실제로 그러한지 검증.' },
        { pose: 'idle', text: '일표본 t검정 상황을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '일표본(One-sample) t검정은 한 집단의 평균이 알려진 기준값과 같은지를 검증하는 검정입니다. H₀: μ = μ₀. 비교 상대가 또 다른 집단이 아니라 "특정 숫자" 라는 게 다른 t검정과의 결정적 차이.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '제조사가 "이 전구 평균 수명 = 1,000시간" 광고. 100개 표본의 평균이 985시간일 때, 광고가 맞는지 검정 / 학교가 "우리 학생 평균 키 170cm" 라 발표. 표본 평균과 실제 일치 여부 / 고객 만족도 평균이 회사 KPI 4.5점에 도달했는지 확인. 모두 비교 대상이 [집단 한 개 vs 숫자 한 개].',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "집단 1개 vs 숫자 1개"',
          body:
            '"평균 vs 특정값", "단일 그룹 vs 기준" 이 키워드면 일표본. 두 집단을 비교하면 독립표본, 같은 사람의 전/후를 비교하면 대응표본.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s2-paired',
      title: 't검정 ② 대응표본 — "같은 사람의 전/후"',
      quizId: 'adsp-3-3-cp-02-paired',
      dialogue: [
        { pose: 'wave', text: '둘째 [대응표본 t] — 같은 대상의 [전/후·처치 전/후] 비교.' },
        { pose: 'think', text: '핵심 — [같은 사람] 을 두 번 측정. 짝(pair) 으로 묶임.' },
        { pose: 'happy', text: '예: 다이어트 프로그램 참가자 30명의 시작 vs 12주 후 체중.' },
        { pose: 'idle', text: '대응표본 상황을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '대응표본(Paired) t검정은 같은 대상에서 두 시점 또는 두 조건을 측정해 차이의 평균이 0인지 검정합니다. 핵심은 "측정 대상이 같다" 는 것 — 같은 사람·같은 차량·같은 환자가 두 번 측정되어 자연스러운 짝(pair) 을 이룹니다. 분석 시엔 차이값(d = 사후 − 사전) 의 평균이 0인지 일표본 t로 풉니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '다이어트 프로그램 참가자 30명 — 시작 체중 vs 12주 후 체중 / 환자 50명 — 약 복용 전 혈압 vs 복용 후 혈압 / 같은 학생 30명 — 학기 초 시험 점수 vs 학기 말 점수 / 같은 차량 — 일반 타이어 vs 친환경 타이어 장착 후 연비. 모두 한 대상이 두 번 측정돼 짝지어진 데이터.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — "같은 대상" 을 놓치면 독립표본으로 오답',
          body:
            '"같은 사람", "같은 환자", "전/후" 같은 표현이 등장하면 대응표본. 만약 다이어트 그룹 vs 비다이어트 그룹처럼 다른 사람들이라면 독립표본이라 오답.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s2-indep',
      title: 't검정 ③ 독립표본 — "서로 다른 두 집단"',
      quizId: 'adsp-3-3-cp-02-indep',
      dialogue: [
        { pose: 'wave', text: '셋째 [독립표본 t] — [서로 다른 사람들] 로 구성된 두 그룹의 평균 비교.' },
        { pose: 'think', text: '핵심 — 두 그룹의 사람이 [겹치지 않음]. 짝지을 수 없음.' },
        { pose: 'happy', text: '예: A반(30명) vs B반(30명) 의 수학 점수 — 서로 다른 학생들.' },
        { pose: 'idle', text: '독립표본 상황을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '독립표본(Two-sample) t검정은 서로 다른 두 집단의 평균을 비교합니다. 두 그룹의 구성원이 겹치지 않아 짝지을 수 없는 게 대응표본과의 차이. 등분산성이 가정되면 pooled variance, 등분산이 깨졌으면 Welch 의 t를 사용합니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            'A반(30명) vs B반(30명) 의 수학 점수 — 학생 구성원이 다름 / 흡연자 그룹 vs 비흡연자 그룹의 폐활량 / 신약 투여 그룹(50명) vs 위약 그룹(50명) 의 회복 시간 / 남성 vs 여성의 평균 키. 모두 두 집단이 [서로 다른 사람들] 로 구성됨.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — 셋 중 무엇? 빠른 판별',
          body:
            '비교 상대가 [숫자 한 개] → 일표본 / [같은 대상의 두 측정] → 대응표본 / [서로 다른 두 그룹] → 독립표본. 시험 함정 1순위 — "같은 사람" 인지 "다른 사람" 인지.',
        },
      ],
    },
    // ─── 회귀 4가정 (선분정독) — 1 step → 5 substeps ───
    {
      id: 'adsp-3-3-s3',
      title: '회귀 4가정 — "선·분·정·독" 개요',
      quizId: 'adsp-3-3-cp-03',
      dialogue: [
        { pose: 'wave', text: '선형회귀가 의미 있으려면 [4가정] 충족.' },
        { pose: 'think', text: '"[선분정독]" — 선형성 · 등분산 · 정규성 · 독립성.' },
        { pose: 'idle', text: '먼저 SST = SSE + SSR + 4가정 개요.' },
      ],
      blocks: [
        {
          kind: 'section',
          title: 'SST = SSE + SSR',
          body:
            '총 변동(SST) = 설명된 변동(SSR) + 남은 잔차(SSE). R² = SSR/SST. 4가정이 무너지면 R² · p-value 모두 의심.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"선·분·정·독"',
          body:
            'Linearity · Homoscedasticity · Normality · Independence. "단조성" 같은 항목은 포함되지 않음.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s3-linear',
      title: '회귀 가정 ① [선]형성 — "X-Y 가 직선 관계"',
      quizId: 'adsp-3-3-cp-03-linear',
      dialogue: [
        { pose: 'wave', text: '첫째 [선]형성 — X와 Y의 관계가 [직선] 모양이어야 회귀를 쓸 수 있음.' },
        { pose: 'think', text: '진단: 잔차 vs 적합값 산점도에 [곡선 모양] 이 안 보이면 OK.' },
        { pose: 'happy', text: '예: 광고비 vs 매출이 직선이면 회귀 OK. 광고비 1억 이후 매출이 정체된다면 곡선 — 선형성 위반.' },
        { pose: 'idle', text: '선형성 진단 도구를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '선형성(Linearity) 은 "X 가 1단위 증가할 때 Y 도 일정하게 증가/감소한다" 는 직선 관계 가정입니다. 회귀의 가장 기본 전제 — 만약 X-Y 가 곡선이거나 어느 구간 후 정체된다면 직선으로 그은 회귀선이 시스템을 잘못 묘사하게 됩니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기 + 진단법',
          body:
            '광고비 vs 매출 — 작은 광고비에선 매출이 비례 증가하지만 광고비 1억 이후 매출이 평탄해지면 곡선. 회귀선이 큰 영역에서 과대/과소 추정 / 진단 도구: "잔차 vs 적합값" 산점도에 U자·역U자 같은 곡선 패턴이 보이면 선형성 깨짐 / 위반 시 대응: 다항식 항(X²) 추가, 변수 변환(log·sqrt), 비선형 모델로 전환.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "잔차에 곡선 패턴"',
          body:
            '"잔차 산점도에 곡선 패턴이 보이면 선형성 위반". 부채꼴이면 등분산성 위반, 종 모양 분포는 정규성 이슈, 시간·공간 패턴은 독립성 이슈.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s3-homo',
      title: '회귀 가정 ② [분]산 (등분산성) — "잔차의 흩어짐이 일정"',
      quizId: 'adsp-3-3-cp-03-homo',
      dialogue: [
        { pose: 'wave', text: '둘째 [분]산 — 잔차의 [흩어짐 크기] 가 X 어디서나 [비슷] 해야 함.' },
        { pose: 'think', text: '진단: 잔차 산점도가 [부채꼴] 로 퍼지면 위반.' },
        { pose: 'happy', text: '예: 매출 작은 가게는 잔차도 작게, 큰 가게는 크게 → 점차 벌어지는 부채꼴 → 등분산 깨짐.' },
        { pose: 'idle', text: '등분산성 위반 신호를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '등분산성(Homoscedasticity) 은 X 의 어느 영역에서나 잔차의 흩어짐(분산) 이 비슷하게 일정하다는 가정입니다. 깨지면(이분산) 회귀계수의 표준오차 추정이 잘못되어 t·F 검정의 p-value 를 신뢰할 수 없게 됩니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기 + 진단법',
          body:
            '소득 vs 지출 회귀 — 저소득에선 지출이 좁게 모이고 고소득에선 넓게 흩어짐 → 부채꼴 패턴 / 매출 vs 광고 효과 — 큰 광고비일수록 매출 변동 폭이 커짐 → 우상향 부채꼴 / 진단 도구: 잔차 vs 적합값 산점도에서 "왼쪽 좁고 오른쪽 넓은" funnel / Breusch-Pagan 검정 / 위반 시 대응: 종속변수에 log·sqrt 변환(재표현), 가중최소제곱(WLS) 적용.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "잔차의 부채꼴"',
          body:
            '"잔차 산점도가 부채꼴(funnel)" 이 키워드면 등분산성 위반. 곡선 패턴이면 선형성, 시간 자기상관이면 독립성.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s3-normal',
      title: '회귀 가정 ③ [정]규성 — "잔차가 종 모양"',
      quizId: 'adsp-3-3-cp-03-normal',
      dialogue: [
        { pose: 'wave', text: '셋째 [정]규성 — 잔차의 분포가 [종 모양 정규분포] 여야 함.' },
        { pose: 'think', text: '진단: [QQ플롯] 의 점이 직선 위에 있으면 OK. Shapiro-Wilk 검정 도 사용.' },
        { pose: 'happy', text: '왜 중요? 회귀계수의 신뢰구간·p-value 가 정규성을 가정해 계산되거든.' },
        { pose: 'idle', text: '정규성 진단 도구를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '정규성(Normality) 은 잔차가 평균 0인 정규분포를 따라야 한다는 가정입니다. 회귀계수의 신뢰구간·t·F 검정의 p-value 가 정규성 가정 위에서 계산되기 때문에 이 가정이 깨지면 통계적 추론이 흔들립니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기 + 진단법',
          body:
            '잔차 히스토그램이 한쪽으로 길게 뻗은 비대칭 (skewed) → 정규성 깨짐 / QQ플롯의 점들이 양 끝에서 대각선을 크게 벗어남 → 두꺼운 꼬리 (heavy tails) / 진단 도구: QQ플롯, Shapiro-Wilk 검정, 잔차 히스토그램 / 위반 시 대응: 종속변수 변환(log), 이상치 제거 후 재적합, 또는 표본이 충분히 크면 CLT 로 어느 정도 보완.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "QQ플롯 / Shapiro-Wilk"',
          body:
            '"QQ플롯", "Shapiro-Wilk 검정", "잔차 히스토그램 종 모양" 이 키워드면 정규성 가정. 분산 일정이면 등분산, 직선 관계면 선형성, 시간 자기상관이면 독립성.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s3-indep',
      title: '회귀 가정 ④ [독]립성 — "잔차끼리 영향 없음"',
      quizId: 'adsp-3-3-cp-03-indep',
      dialogue: [
        { pose: 'wave', text: '넷째 [독]립성 — 한 잔차가 [다음 잔차에 영향] 주면 안 됨.' },
        { pose: 'think', text: '시계열에서 자주 깨져. 어제 잔차가 +이면 오늘도 +일 가능성 → 자기상관.' },
        { pose: 'happy', text: '진단: [Durbin-Watson] 통계량 ≈ 2 면 OK. 0이나 4에 가까우면 자기상관 의심.' },
        { pose: 'idle', text: '독립성 진단 도구를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '독립성(Independence) 은 잔차들이 서로 상관이 없어야 한다는 가정입니다. 한 관측의 잔차가 다른 관측의 잔차에 영향을 주면 안 됨. 시계열·반복측정·군집 데이터에서 자주 깨지며 깨지면 회귀계수 표준오차가 과소/과대 추정되어 검정 신뢰가 떨어집니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기 + 진단법',
          body:
            '주식 일별 종가를 회귀하면 어제 잔차가 +였을 때 오늘 잔차도 + 인 경향 → 자기상관 / 같은 환자에게서 반복 측정한 혈압 데이터 — 같은 환자의 측정끼리 상관 / 진단 도구: Durbin-Watson 통계량 (≈ 2 면 OK, 0이나 4 가까우면 의심), 잔차 ACF 그래프 / 위반 시 대응: 시계열 모델(ARIMA), 일반화 최소제곱(GLS), 혼합효과 모형.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "Durbin-Watson / 자기상관"',
          body:
            '"Durbin-Watson 통계량", "잔차 자기상관", "시계열에서 위반" 이 키워드면 독립성. 잔차 산포가 변하면 등분산, 분포 형태면 정규성, 곡선이면 선형성.',
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
    // ─── 시계열 4성분 (추계순불) — 1 step → 5 substeps ───
    {
      id: 'adsp-3-3-s5',
      title: '시계열 4성분 — "추·계·순·불" 개요',
      quizId: 'adsp-3-3-cp-05',
      dialogue: [
        { pose: 'wave', text: '시계열은 [4가지 성분] 으로 분해.' },
        { pose: 'think', text: '"[추계순불]" — 추세 · 계절 · 순환 · 불규칙.' },
        { pose: 'idle', text: '먼저 4성분 + 정상성 개요.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"추·계·순·불"',
          body:
            'Trend(추세) · Seasonality(계절) · Cycle(순환) · Irregular(불규칙). "지연(Lag)" 은 ARIMA 파라미터지 분해 성분 아님 — 함정.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '정상성과 ARIMA',
          body:
            '모델링 전 정상성(평균·분산 시간 불변) 확보 필수. 도구는 차분(Differencing). AR/MA/ARMA/ARIMA 는 모형 확장 단계.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s5-trend',
      title: '시계열 ① [추]세 — "수년~수십 년 큰 흐름"',
      quizId: 'adsp-3-3-cp-05-trend',
      dialogue: [
        { pose: 'wave', text: '첫 성분 [추]세 — [수년~수십 년] 단위의 [큰 방향성].' },
        { pose: 'think', text: '단기 출렁임을 다 걷어내고 멀찍이서 보면 보이는 큰 흐름.' },
        { pose: 'happy', text: '예: 한국 인구 증가율 — 1970년대부터 2020년대까지 큰 우하향 추세.' },
        { pose: 'idle', text: '추세 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '추세(Trend) 는 시계열의 장기적이고 일관된 방향성입니다. "수년~수십 년" 단위에서 시계열을 멀찍이 보면 드러나는 큰 흐름 — 우상향, 우하향, 평탄화. 단기 출렁임이나 1년 주기 반복을 모두 걷어낸 뒤 남는 큰 그림이에요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '한국 인구 증가율 — 70년대 2.5% 에서 2020년대 0% 대로 수십 년 우하향 / 글로벌 평균 기온 — 산업혁명 이후 100년+ 우상향 / 인터넷 사용자 수 — 1995년부터 2020년대까지 우상향 / 기업의 매출 성장 곡선 — 창업 후 10년 우상향. 모두 짧게 보면 안 보이고 긴 시야에서만 드러나는 큰 흐름.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "장기 / 일관된 방향"',
          body:
            '"장기 상승/하락", "수년~수십 년 변화" 가 키워드면 추세. 1년 단위 반복이면 계절성, 비고정 주기 등락이면 순환, 무작위면 불규칙.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s5-season',
      title: '시계열 ② [계]절성 — "고정된 주기로 반복"',
      quizId: 'adsp-3-3-cp-05-season',
      dialogue: [
        { pose: 'wave', text: '둘째 [계]절성 — 매년·매주·매일처럼 [정확히 같은 주기] 로 반복.' },
        { pose: 'think', text: '여름엔 빙수, 12월엔 크리스마스 선물, 토요일엔 식당 — 주기가 [고정] 이야.' },
        { pose: 'happy', text: '시간 단위만 보면 분(점심시간) · 시간 · 일 · 주 · 월 · 년 다양해.' },
        { pose: 'idle', text: '계절성 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '계절성(Seasonality) 은 시·일·주·월·년 단위처럼 고정된 주기로 정확하게 반복되는 패턴입니다. "매년 8월에 늘 같은 모양" 처럼 주기가 일정하다는 게 핵심 — 다음 주기에 어느 정도 비슷한 패턴이 다시 올지 예측이 가능합니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '아이스크림 매출 — 매년 7~8월 피크, 12~2월 저점 (1년 주기) / 식당 매출 — 매주 토요일 피크, 월요일 저점 (1주 주기) / 카페 트래픽 — 매일 오전 8~10시 피크 (1일 주기) / 카드 결제 — 매월 25일 월급일 직후 피크 (1개월 주기). 모두 정확히 같은 주기로 반복되는 형태.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "고정 주기 / 매년 같은 시점"',
          body:
            '"고정 주기 반복", "여름·겨울", "월말·요일 패턴" 이 키워드면 계절성. 주기가 들쭉날쭉이면 순환, 장기 방향만이면 추세.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s5-cycle',
      title: '시계열 ③ [순]환 — "주기가 들쭉날쭉한 등락"',
      quizId: 'adsp-3-3-cp-05-cycle',
      dialogue: [
        { pose: 'wave', text: '셋째 [순]환 — 등락은 있는데 주기가 [고정 안 됨].' },
        { pose: 'think', text: '경기 사이클이 대표. 5~10년에 한 번 호황·불황이 오는데 정확히 5년이라곤 못 해.' },
        { pose: 'happy', text: '계절성 vs 순환의 차이 — 주기가 [고정] 이냐 [가변] 이냐가 결정.' },
        { pose: 'idle', text: '순환 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '순환(Cycle) 은 계절성보다 길고 등락이 있지만 주기가 일정하지 않은 변동입니다. 다음 등락이 언제 올지 정확히 예측하기 어려운 게 계절성과의 결정적 차이. 보통 수년 단위로 펼쳐지는 큰 사이클입니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '경기 사이클(호황·불황) — 짧으면 5년, 길면 10년 이상이지만 정확한 주기 없음 / 부동산 가격 사이클 — 7~10년 기간 등락이 있지만 매번 다름 / 금리 사이클 — 정책·외부 요인에 따라 주기가 변함 / IT 산업의 dot-com 버블·AI 붐 같은 기술 사이클. 모두 "오긴 오는데 언제일지 모름" 의 등락 패턴.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "주기가 가변 / 수년 등락"',
          body:
            '"경기 사이클", "주기가 불규칙", "수년 단위 등락" 이 키워드면 순환. 주기가 정확히 고정이면 계절성, 큰 방향성만이면 추세.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s5-irregular',
      title: '시계열 ④ [불]규칙 — "추세·계절·순환을 뺀 잔여 noise"',
      quizId: 'adsp-3-3-cp-05-irregular',
      dialogue: [
        { pose: 'wave', text: '넷째 [불]규칙 — 추세·계절·순환을 [다 빼고 남는] 무작위 변동.' },
        { pose: 'think', text: '예: 코로나 첫 락다운 한 달 — 일회성·예측 불가의 큰 변동.' },
        { pose: 'happy', text: '특징 — [예측 불가능]. 모델이 다음 값을 정확히 맞히지 못하는 부분.' },
        { pose: 'idle', text: '불규칙 성분 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '불규칙(Irregular) 성분은 추세·계절성·순환을 모두 분해해 빼낸 뒤 남는 무작위 변동입니다. 일회성 외부 충격, 자연재해, 측정 오차, 알 수 없는 우연 — 시계열 모델이 미리 예측할 수 없는 부분이 모두 여기로 모입니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '코로나 첫 락다운 한 달간 음식점 매출 폭락 — 일회성, 추세나 계절로 설명 불가 / 9·11 직후 항공권 수요 급락 — 예측 불가의 외부 충격 / 갑작스러운 자연재해(태풍·지진) 로 인한 단기 매출 변동 / 주식 시장의 일별 노이즈. 모두 추세·계절·순환을 다 분해해도 마지막에 남는 무작위 변동.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '시험 함정 — "Lag(지연)" 은 4성분이 아님',
          body:
            '시계열 4성분은 [추]세·[계]절·[순]환·[불]규칙. "지연(Lag)" 은 ARIMA 모델의 파라미터(AR/MA 의 lag 차수) 이지 분해 성분이 아닙니다 — 함정 선지로 자주 출제.',
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
    // ─── 앙상블 4종 — 1 step → 5 substeps ───
    {
      id: 'adsp-3-4-s2',
      title: '앙상블 — 개요',
      quizId: 'adsp-3-4-cp-02',
      dialogue: [
        { pose: 'wave', text: '여러 모델을 합쳐 더 강한 모델 — [앙상블].' },
        { pose: 'think', text: '4종: [Voting] · [Bagging] · [Boosting] · [Stacking].' },
        { pose: 'idle', text: '먼저 4종 구분 + 핵심 차이.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Bagging vs Boosting (시험 빈출)',
          body:
            'Bagging = 병렬 학습 + 평균 (분산 감소). Boosting = 순차 학습 + 오차 보완 (편향 감소).',
        },
      ],
    },
    {
      id: 'adsp-3-4-s2-voting',
      title: '앙상블 ① Voting — "여러 전문가의 다수결"',
      quizId: 'adsp-3-4-cp-02-voting',
      dialogue: [
        { pose: 'wave', text: '첫째 [Voting] — 서로 다른 [여러 모델] 이 각자 답하고 [다수결] 로 결정.' },
        { pose: 'think', text: '의사 5명이 환자 진단 → 3명 이상 같은 의견이면 그걸 채택, 같은 느낌.' },
        { pose: 'happy', text: 'hard voting: 다수결 / soft voting: 확률 평균.' },
        { pose: 'idle', text: 'Voting 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Voting 은 서로 다른 종류의 분류기·회귀기를 학습시킨 뒤 각자의 예측을 다수결(hard voting) 또는 확률 평균(soft voting) 으로 합치는 가장 단순한 앙상블입니다. 의사 여러 명에게 같은 환자를 보여주고 의견을 모은다고 생각하면 직관적이에요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '환자 진단 — 로지스틱 회귀, 랜덤 포레스트, XGBoost 세 모델이 각자 진단 → 2개 이상 "양성" 이면 양성으로 확정 / 영화 추천 — 협업필터링 + 콘텐츠기반 + 인기도 모델의 점수 평균 / 학생 합격 예측 — 점수 모델·면접 모델·자기소개서 모델의 합산. 모두 [성격이 다른 모델] 들이 한 사례에 대해 각자 답하고 모은 결과.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "이질적 모델 / 다수결 / 평균"',
          body:
            '"다수결", "예측 평균", "이질적 모델 결합" 이 키워드면 Voting. 같은 알고리즘으로 부트스트랩하면 Bagging, 순차 보완이면 Boosting, 메타 모델 한 층 더면 Stacking.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s2-bagging',
      title: '앙상블 ② Bagging — "부트스트랩 + 병렬"',
      quizId: 'adsp-3-4-cp-02-bagging',
      dialogue: [
        { pose: 'wave', text: '둘째 [Bagging] — Bootstrap Aggregating. 같은 알고리즘으로 [병렬] 학습.' },
        { pose: 'think', text: '데이터를 [부트스트랩(복원 추출)] 으로 N개 만들어 N개 모델 → 평균.' },
        { pose: 'happy', text: '대표 — [Random Forest] = Bagging + 변수 무작위 선택.' },
        { pose: 'idle', text: 'Bagging 의 효과를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Bagging(Bootstrap Aggregating) 은 같은 알고리즘 N 개를 병렬로 학습하되, 각각에게 부트스트랩(복원 허용 무작위 추출) 으로 약간씩 다른 데이터셋을 줍니다. 결과적으로 N 개 모델의 예측을 평균(다수결) 해서 분산을 줄이고 과적합을 완화합니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            'Random Forest — Bagging 으로 N개의 결정나무를 만들고 변수까지 무작위 선택해 다양화. 캐글에서 가장 흔히 쓰이는 모델 중 하나 / 의사 여러 명이 [같은 환자에 대해] 살짝 다른 의료 기록 일부씩만 보고 진단 → 평균 → 한 의사 의견의 변동 영향 줄임. "여러 사본을 만들어 평균을 내면 흔들림이 줄어든다" 가 Bagging 의 핵심 직관.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "병렬 / 부트스트랩 / 분산 감소"',
          body:
            '"병렬 학습", "부트스트랩 샘플링", "분산 감소" 가 키워드면 Bagging. 순차로 오차를 보완하면 Boosting, 이질적 모델의 다수결이면 Voting.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s2-boosting',
      title: '앙상블 ③ Boosting — "순차 + 오차 보완"',
      quizId: 'adsp-3-4-cp-02-boosting',
      dialogue: [
        { pose: 'wave', text: '셋째 [Boosting] — 약한 모델을 [순차] 로 만들며 [이전 오차를 보완].' },
        { pose: 'think', text: '1번 모델이 틀린 케이스에 더 신경 쓰는 2번 모델 → 또 틀린 곳에 신경 쓰는 3번 모델…' },
        { pose: 'happy', text: '대표 — [AdaBoost], [Gradient Boosting], [XGBoost], [LightGBM]. 캐글 우승 단골.' },
        { pose: 'idle', text: 'Boosting 의 핵심을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Boosting 은 약한 학습기(stump 같은 단순 모델) 를 순차로 학습시키며, 매 단계마다 이전 모델이 틀린 샘플에 더 큰 가중치를 두어 점진적으로 오차를 줄여나가는 앙상블입니다. 편향(bias) 을 줄이는 게 강점이라 단일 약한 모델로는 못 풀던 문제도 잘 풀어요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            'AdaBoost — 첫 분류기가 틀린 데이터에 가중치 ↑ → 다음 분류기가 그 부분 집중 학습 / Gradient Boosting / XGBoost / LightGBM — 캐글에서 가장 많은 우승자가 쓰는 모델 / 학생 시험 대비 — 1차 모의고사에서 자주 틀린 문제를 다음 모의고사 학습에 더 비중. 모두 "지난 번 실수를 다음 번에 보완" 의 순차적 학습.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — Bagging vs Boosting',
          body:
            '시험 빈출. Bagging = 병렬 + 분산 감소 (랜덤 포레스트). Boosting = 순차 + 편향 감소 (XGBoost·LightGBM). 둘을 섞어 묻는 게 단골.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s2-stacking',
      title: '앙상블 ④ Stacking — "베이스 예측을 메타 모델이 학습"',
      quizId: 'adsp-3-4-cp-02-stacking',
      dialogue: [
        { pose: 'wave', text: '넷째 [Stacking] — 베이스 모델들의 [예측 자체] 를 새 모델의 [입력] 으로.' },
        { pose: 'think', text: '1층: 여러 베이스 모델 → 2층: 그 출력을 받아 학습하는 [메타 모델].' },
        { pose: 'happy', text: '예: 캐글 상위권에서 자주 쓰는 "예측의 예측" 패턴. 적절히 잘 쓰면 단일 모델보다 강함.' },
        { pose: 'idle', text: 'Stacking 의 작동 방식을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Stacking 은 여러 베이스 모델(랜덤포레스트·XGBoost·로지스틱 등) 의 예측 결과를 모아 새로운 학습 데이터셋으로 만든 뒤, 그 위에 메타(블렌더) 모델 하나를 더 학습시키는 앙상블입니다. "예측의 예측" 이라는 한 층을 더 쌓는 것 — 다양한 모델의 강점을 한 번 더 결합합니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '캐글 대회 솔루션 — 1층에서 RF·XGB·LR·LightGBM 4모델을 학습 → 2층에서 이 4 예측을 입력으로 받는 로지스틱 회귀가 최종 예측 / 신용카드 사기 탐지 — 베이스 모델들이 각자 의심도 점수를 내고, 메타 모델이 이걸 종합해 최종 의심도 산출. 단순한 Voting 보다 "어떤 모델 의견을 얼마나 믿을지" 까지 학습한다는 게 핵심.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "예측을 입력으로 / 메타 모델"',
          body:
            '"예측을 다시 입력", "메타(블렌더) 모델", "층 쌓기" 가 키워드면 Stacking. 단순 다수결은 Voting, 부트스트랩 평균은 Bagging, 순차 오차 보완은 Boosting.',
        },
      ],
    },
    // ─── 연관분석 3 (지신향) — 1 step → 4 substeps ───
    {
      id: 'adsp-3-4-s3',
      title: '연관분석 — "지·신·향" 개요',
      quizId: 'adsp-3-4-cp-03',
      dialogue: [
        { pose: 'wave', text: '연관분석 — "맥주 산 사람이 기저귀도?" 장바구니 규칙.' },
        { pose: 'think', text: '3지표: [지지도] · [신뢰도] · [향상도].' },
        { pose: 'idle', text: '먼저 3지표 + 알고리즘 개요.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"지·신·향"',
          body:
            'Support(지지도) · Confidence(신뢰도) · Lift(향상도). 향상도 > 1 양의 연관, = 1 독립, < 1 음의 연관.',
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
      id: 'adsp-3-4-s3-support',
      title: '연관분석 ① [지]지도 — "전체에서 얼마나 자주?"',
      quizId: 'adsp-3-4-cp-03-support',
      dialogue: [
        { pose: 'wave', text: '첫 지표 [지]지도(Support) — [전체 거래 중] A 와 B 가 [같이 등장] 하는 비율.' },
        { pose: 'think', text: '"이 규칙이 얼마나 자주 나타나는가" 를 본다.' },
        { pose: 'happy', text: '예: 100 거래 중 12 거래에서 [맥주+기저귀] 같이 샀다 → Support = 12%.' },
        { pose: 'idle', text: '지지도 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '지지도(Support) = "A·B 가 함께 등장한 거래 수 ÷ 전체 거래 수" 입니다. 발견한 규칙이 얼마나 자주 일어나는지를 측정해요. 지지도가 너무 낮으면 어쩌다 한두 번 일어나는 우연일 가능성이 커서, 마이닝 시작 전에 최소 지지도(min support) 기준을 정해 그 이상만 본격 분석합니다.',
        },
        {
          kind: 'section',
          title: '예시로 — 슈퍼마켓 100 거래',
          body:
            '전체 100 거래 중 [맥주+기저귀] 가 함께 나온 거래가 12건이라면 Support({맥주, 기저귀}) = 12 / 100 = 12%. 만약 그 조합이 단 1건이라면 Support = 1% — 우연의 가능성이 높아 분석 가치 낮음. 지지도는 "이 규칙이 사업적으로 의미 있을 만큼 빈번한가" 를 거르는 첫 필터 역할.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "동시 등장 빈도 / 전체 대비"',
          body:
            '"동시 등장 비율", "전체 대비 빈도" 가 키워드면 Support. "A 산 사람 중 B 비율" 은 Confidence, "랜덤 대비 배수" 는 Lift.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s3-confidence',
      title: '연관분석 ② [신]뢰도 — "A 산 사람 중 B 도 산 비율"',
      quizId: 'adsp-3-4-cp-03-confidence',
      dialogue: [
        { pose: 'wave', text: '둘째 [신]뢰도(Confidence) — [A 를 산 사람] 중에서 [B 도 산] 비율.' },
        { pose: 'think', text: '조건부 확률 P(B|A). "A 를 골랐을 때 B 도 따라올 확률".' },
        { pose: 'happy', text: '예: 맥주 산 50명 중 30명이 기저귀도 샀다면 Confidence = 60%.' },
        { pose: 'idle', text: '신뢰도 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '신뢰도(Confidence) = P(B|A) = "A·B 가 함께 등장한 거래 수 ÷ A 가 등장한 거래 수". A 라는 행동이 일어났을 때 B 가 따라올 조건부 확률입니다. "맥주를 산 사람들 중 60%가 기저귀도 샀다" 같이 추천·번들링·진열 결정에 직접 쓰입니다.',
        },
        {
          kind: 'section',
          title: '예시로 — 맥주 → 기저귀',
          body:
            '맥주가 등장한 거래 50건, 그 중 [맥주+기저귀] 가 함께 등장한 게 30건이라면 Confidence(맥주 → 기저귀) = 30 / 50 = 60% / 모바일 앱에서 "결제 페이지 진입한 사용자" 중 90%가 "결제 완료" 까지 갔다면 Confidence = 90%. 마트에선 맥주 옆에 기저귀를 진열, 앱에선 결제 단계 이탈 줄이는 캠페인 설계에 직결.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — Confidence 가 높아도 [Lift 가 낮으면] 의미 약함',
          body:
            '"맥주 → 우유 Confidence 80%" 라도 우유 자체가 거래 90%에 등장하는 흔한 상품이면, 맥주 안 사도 우유 살 사람들이 대부분이라 인과/연관이 약함. 다음 지표인 Lift 가 이걸 보정합니다.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s3-lift',
      title: '연관분석 ③ [향]상도 — "랜덤 대비 몇 배?"',
      quizId: 'adsp-3-4-cp-03-lift',
      dialogue: [
        { pose: 'wave', text: '셋째 [향]상도(Lift) — A 가 B 의 [등장 확률을 몇 배] 끌어올리는지.' },
        { pose: 'think', text: 'Lift = Confidence(A→B) ÷ P(B) = "A 모를 때 B 비율" 대비 "A 알 때 B 비율".' },
        { pose: 'happy', text: 'Lift > 1 양의 연관 / = 1 독립(무관계) / < 1 음의 연관 (서로 안 사는 경향).' },
        { pose: 'idle', text: '향상도 해석을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '향상도(Lift) = 신뢰도 ÷ 전체에서 B 의 등장 비율 = P(B|A) ÷ P(B). 이는 "A 를 봤을 때 B 가 등장할 확률" 이 "A 와 무관하게 B 가 등장할 확률" 의 몇 배인지를 측정합니다. 연관성의 진짜 강도를 측정하는 핵심 지표 — Confidence 의 함정을 보정해줘요.',
        },
        {
          kind: 'section',
          title: '예시로 — Lift 해석',
          body:
            'Lift = 1.8 → A 를 산 사람의 B 구매 확률이 일반 평균의 1.8배 (양의 연관, 의미 있음) / Lift = 1.0 → A 와 B 는 독립 (Confidence 가 높아도 의미 없음) / Lift = 0.6 → A 를 산 사람일수록 오히려 B 를 덜 산다 (음의 연관, 같은 종류 상품 대체 관계). 마트에서 [맥주, 기저귀] 가 Lift 2.0 이라면 진짜 묶어 진열할 가치가 있음.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — 세 지표 한 번에',
          body:
            '[지]지도 — 전체 대비 빈도 / [신]뢰도 — A 안에서 B 비율 / [향]상도 — 랜덤 대비 배수. 시험에선 보통 세 값 계산 후 Lift > 1 인지로 의미 있는 규칙 판별.',
        },
      ],
    },
    // ─── 군집 알고리즘 — 1 step → 5 substeps (overview + 4 method) ───
    {
      id: 'adsp-3-4-s4',
      title: '군집 — 비지도 묶기 개요',
      quizId: 'adsp-3-4-cp-04',
      dialogue: [
        { pose: 'wave', text: '군집 — 레이블 없이 유사한 것끼리.' },
        { pose: 'think', text: '4종: [계층적] · [K-means] · [DBSCAN] · [EM/SOM].' },
        { pose: 'idle', text: '먼저 4종 비교 + K 선택법.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: 'K-means 최적 K',
          body:
            'Elbow(팔꿈치) 법 — WCSS 를 K 에 따라 그려 꺾이는 지점. 실루엣 계수 — 1 에 가까울수록 잘 분리.',
        },
        {
          kind: 'table',
          headers: ['방법', '특징'],
          rows: [
            ['계층적', '덴드로그램 합병/분할'],
            ['K-means', '중심 K개 반복 재배정'],
            ['DBSCAN', '밀도 기반, K 불필요, 이상치 강함'],
            ['EM/SOM', '확률·격자 기반'],
          ],
        },
      ],
    },
    {
      id: 'adsp-3-4-s4-hier',
      title: '군집 ① 계층적 (Hierarchical)',
      quizId: 'adsp-3-4-cp-04-hier',
      dialogue: [
        { pose: 'wave', text: '첫째 [계층적] — 덴드로그램.' },
        { pose: 'think', text: '합병형(Bottom-up) / 분할형(Top-down).' },
        { pose: 'idle', text: '계층적 군집의 특징을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '계층적 군집은 데이터를 점점 합치거나(합병형, agglomerative) 큰 덩어리에서 쪼개며(분할형, divisive) 트리(덴드로그램) 를 형성. K 를 미리 정할 필요 없음.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"덴드로그램", "합병형/분할형". 중심점 K개 반복이면 K-means, 밀도 기반이면 DBSCAN.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s4-kmeans',
      title: '군집 ② K-means',
      quizId: 'adsp-3-4-cp-04-kmeans',
      dialogue: [
        { pose: 'wave', text: '둘째 [K-means] — 중심 K 개 반복.' },
        { pose: 'think', text: 'K 를 미리 정 → 중심점 ↔ 점 거리 반복 재배정.' },
        { pose: 'idle', text: 'K-means 의 핵심을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'K-means 는 K 개의 중심점을 두고 각 점을 가장 가까운 중심에 할당 → 중심 갱신 → 반복. K 를 미리 정해야 하고, 구형 클러스터에 강함.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"K 사전 지정", "중심점 반복", "유클리드 거리". 트리 구조면 계층적, 밀도면 DBSCAN.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s4-dbscan',
      title: '군집 ③ DBSCAN',
      quizId: 'adsp-3-4-cp-04-dbscan',
      dialogue: [
        { pose: 'wave', text: '셋째 [DBSCAN] — 밀도 기반.' },
        { pose: 'think', text: 'ε 반경 안 점 개수 ≥ minPts 면 핵심점. K 불필요.' },
        { pose: 'idle', text: 'DBSCAN 의 강점을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'DBSCAN(Density-Based) 은 밀도가 충분한 영역을 클러스터로, 외곽은 noise(이상값) 로 분류. K 사전 지정 불필요 + 비구형 클러스터 + 이상치 강건.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"밀도 기반", "K 불필요", "noise 자동 식별", "비구형 OK". K 미리 지정이면 K-means.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s4-em-som',
      title: '군집 ④ EM · SOM',
      quizId: 'adsp-3-4-cp-04-em-som',
      dialogue: [
        { pose: 'wave', text: '넷째 [EM·SOM] — 확률·격자 기반.' },
        { pose: 'think', text: 'EM = 가우시안 혼합 확률 할당. SOM = 뉴런 격자로 2D 투영.' },
        { pose: 'idle', text: 'EM·SOM 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'EM(Expectation-Maximization) 은 가우시안 혼합 모델로 각 점이 클러스터에 속할 확률을 학습. SOM(Self-Organizing Map) 은 신경망 기반 2D 격자 투영.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"EM = 확률 할당, 가우시안 혼합", "SOM = 신경망 격자 2D". 단순 거리·중심점이면 K-means, 트리면 계층적.',
        },
      ],
    },
    // ─── 분류 평가지표 — 1 step → 5 substeps ───
    {
      id: 'adsp-3-4-s5',
      title: '평가지표 ① 오분류표 개요',
      quizId: 'adsp-3-4-cp-05',
      dialogue: [
        { pose: 'wave', text: '분류 평가는 [오분류표] (TP/FP/FN/TN) 에서 출발.' },
        { pose: 'think', text: '실제 vs 예측을 2×2 로 놓으면 모든 지표가 여기서 파생돼.' },
        { pose: 'idle', text: '먼저 오분류표 칸 정의부터.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '오분류표(Confusion Matrix) — 행=실제, 열=예측의 2×2 표. TP(맞게 양성), FP(거짓 양성), FN(놓친 양성), TN(맞게 음성). 정확도·정밀도·재현율·F1·ROC 모두 이 4 칸에서 계산.',
        },
        {
          kind: 'table',
          title: '오분류표',
          headers: ['', '예측 양성', '예측 음성'],
          rows: [
            ['실제 양성', 'TP (적중)', 'FN (놓침)'],
            ['실제 음성', 'FP (오경보)', 'TN (정상기각)'],
          ],
        },
      ],
    },
    {
      id: 'adsp-3-4-s5-acc',
      title: '평가지표 ② 정확도 (Accuracy) — "전체 중 맞춘 비율"',
      quizId: 'adsp-3-4-cp-05-acc',
      dialogue: [
        { pose: 'wave', text: '[정확도] — 전체 100문제 중 몇 개 맞췄나의 비율.' },
        { pose: 'think', text: '식: (TP + TN) ÷ 전체. 가장 직관적인 점수야.' },
        { pose: 'happy', text: '함정! 100명 중 1명만 암 환자인데 [전부 음성] 으로 예측해도 정확도 99%.' },
        { pose: 'idle', text: '정확도가 부적절한 케이스를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '정확도(Accuracy) = (TP + TN) ÷ 전체. 시험에서 100문제 중 95개 맞히면 95% 라고 하는 것과 똑같습니다. 가장 직관적이고 입에 붙는 지표지만, 클래스 불균형(양성과 음성 비율이 크게 차이남) 상황에서는 무력해진다는 결정적 약점이 있어요.',
        },
        {
          kind: 'section',
          title: '함정 — 불균형에서의 정확도 거짓말',
          body:
            '암 진단을 예로 들면 100명 중 진짜 환자는 1명뿐이고 99명은 정상입니다. 모델이 게으르게 "모두 정상" 이라고만 답해도 99명을 맞히니 정확도는 무려 99%. 하지만 정작 1명의 환자는 놓쳤습니다 — 가장 중요한 일을 놓친 모델이에요. 사기 탐지·드문 질병·기계 결함처럼 양성이 드문 문제에서 정확도만 보는 건 위험.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — 클래스가 균형 잡혔을 때만 신뢰',
          body:
            '양성:음성 비율이 50:50 ~ 30:70 정도면 정확도가 의미 있습니다. 1:99 처럼 한쪽이 압도적이면 정밀도·재현율·F1 으로 보조해야 함.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s5-prec',
      title: '평가지표 ③ 정밀도 (Precision) — "양성이라 외친 것 중 진짜"',
      quizId: 'adsp-3-4-cp-05-prec',
      dialogue: [
        { pose: 'wave', text: '[정밀도] = TP ÷ (TP + FP).' },
        { pose: 'think', text: '"모델이 양성이라고 예측한 것들 중 진짜 양성의 비율".' },
        { pose: 'happy', text: '"양성!" 이라고 외쳤는데 [헛소리] 면 비용이 큰 경우에 중요해.' },
        { pose: 'idle', text: '정밀도 우선 케이스를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '정밀도(Precision) = TP ÷ (TP + FP). 풀어쓰면 "모델이 양성이라고 외친 횟수 중 진짜 양성이었던 비율". 거짓 양성(FP, 양성이 아닌데 양성이라 외침) 의 비용이 클 때 중요한 지표입니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '쇼핑몰 추천 시스템: "이 사용자에게 추천할 만한 상품" 이라고 골랐는데 실제로 안 사면 신뢰가 떨어집니다 — 잘못 외치면 안 되는 상황 → 정밀도 우선 / 검색 엔진: 상위 10개에 무관한 결과가 섞이면 사용자가 떠납니다 → 정밀도 우선 / 광고 타겟팅: 관심 없는 사람에게 광고비 쓰면 손해 → 정밀도 우선. 모두 "양성이라 외쳤다 = 행동을 한다" 는 시나리오라 헛 외침이 곧 손실.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "잘못 외치면 신뢰·비용 ↓"',
          body:
            '"양성이라 분류하면 곧장 행동(추천/광고/검사) 이 일어나는데, 그 행동이 잘못되면 손해" 인 경우 정밀도. 반대로 "놓치면 큰일" 이면 재현율.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s5-recall',
      title: '평가지표 ④ 재현율 (Recall) — "실제 양성 중 잡은 비율"',
      quizId: 'adsp-3-4-cp-05-recall',
      dialogue: [
        { pose: 'wave', text: '[재현율] = TP ÷ (TP + FN).' },
        { pose: 'think', text: '"실제 양성 중 모델이 양성으로 잡아낸 비율". 다른 이름은 [민감도].' },
        { pose: 'happy', text: '암 환자·사기 거래처럼 [놓치면 치명적] 인 경우에 우선.' },
        { pose: 'idle', text: '재현율 우선 케이스를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '재현율(Recall, 민감도 Sensitivity) = TP ÷ (TP + FN). 풀어쓰면 "진짜 양성이 100명이었다면 그 중 모델이 몇 명을 잡아냈는가". 놓침(FN, 양성을 음성으로 오판) 의 비용이 클 때 중요한 지표입니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '암 진단: 환자 100명 중 90명을 정상으로 오판하면 그 90명이 치료 시기를 놓침 → 놓침 비용이 압도적, 재현율 우선 / 카드 사기 탐지: 사기 100건 중 30건만 잡고 70건을 놓치면 회사 손실이 직접적 → 재현율 우선 / 보안 침해 탐지: 한 건이라도 놓치면 데이터 유출 → 재현율 우선 / 코로나 진단키트: 양성 환자를 음성으로 보내면 추가 전파 → 재현율 우선. 공통점은 "한 번 놓친 양성이 큰 후속 손실".',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "놓치면 끝장"',
          body:
            '"양성을 놓치면 인명·금전·안전 피해가 직접" 이면 재현율. "양성으로 외쳐서 행동했는데 그게 헛것이었을 때 손해" 면 정밀도. 둘 다 중요하면 F1.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s5-f1',
      title: '평가지표 ⑤ F1 · ROC · Lift',
      quizId: 'adsp-3-4-cp-05-f1',
      dialogue: [
        { pose: 'wave', text: '균형은 [F1] (정밀도·재현율 조화평균).' },
        { pose: 'think', text: '[ROC] 는 TPR vs FPR 곡선, [AUC] 는 그 면적 — 1에 가까울수록 우수.' },
        { pose: 'happy', text: '상위 X% 타겟팅은 [Lift / Gain 차트] — 분위별 향상도.' },
        { pose: 'idle', text: '시나리오별 적합 지표를 골라봐!' },
      ],
      blocks: [
        {
          kind: 'keypoints',
          title: '복합 지표',
          items: [
            'F1 = 2·(P·R) / (P+R) — 정밀도·재현율의 조화평균. 균형 필요할 때.',
            'ROC: TPR(=Recall) vs FPR 곡선. 임계값 변화 따라 그림.',
            'AUC: ROC 곡선 아래 면적. 1=완벽 / 0.5=무작위 / <0.5=뒤집힘.',
            'Lift: 모델이 잡은 양성률 ÷ 무작위 양성률. 1보다 크면 효과 있음.',
            'Gain: 상위 X% 선별 시 실제 양성의 몇 % 잡았는지 누적 곡선.',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시나리오별 선택',
          body:
            '균형: F1. 임계값 비교: ROC/AUC. 상위 X% 행동(마케팅·우량 고객 선별): Lift / Gain.',
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

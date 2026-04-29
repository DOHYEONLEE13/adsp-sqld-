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

export interface ConceptReminder {
  /** "이거 기억나?" 같은 헤드라인. 한 줄. */
  headline: string;
  /** 핵심 요약. 2~3문장. 처음 학습이 아닌 복습 톤. */
  summary: string;
  /** 핵심 키워드/공식 3~5개 (불릿). */
  keyPoints: string[];
}

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
  /**
   * 2회독+ 진입 시 노출되는 짧은 리마인더. 처음 학습 X, "이거 기억나?" 톤.
   * 미정의 시 UI 가 첫 dialogue turn 또는 keypoints 로 fallback.
   */
  reminder?: ConceptReminder;
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
          title: '4단계 한 줄 정리 (위 → 아래: 가치 ↑ · 양 ↓)',
          headers: ['단계', '정의', '예시', '양·가치'],
          rows: [
            ['지혜 (W)', '새 영역으로의 확장 추론', '음료 전반 B마트가 저렴할 것', '양 ↓ · 가치 ↑↑'],
            ['지식 (K)', '일반화된 규칙', '콜라는 B마트가 유리', '양 ↓ · 가치 ↑'],
            ['정보 (I)', '비교·해석이 더해진 의미', 'B마트가 300원 더 싸다', '양 ↑ · 가치 ↑'],
            ['데이터 (D)', '가공 전 측정값', 'B마트 콜라 1,500원', '양 ↑↑ · 가치 ↓'],
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
          kind: 'intro',
          body:
            '엑셀 파일과 진짜 데이터베이스(DB) 의 차이는 단순히 "용량이 크냐" 가 아니라 5가지 본질적 성질로 갈립니다. 같은 학생 명단이라도, 엑셀 파일은 한 번에 한 사람만 열 수 있고 누군가 수정하면 다른 사람은 모르지만, DB 는 여러 사람이 동시에 보고 누군가의 수정이 즉시 반영됩니다.',
        },
        {
          kind: 'table',
          title: 'DB 5특징 한눈에',
          headers: ['특징', '의미', '엑셀과 차이'],
          rows: [
            ['공용', '여러 사용자가 동시에 공유·접근', '엑셀: 한 번에 한 사람만 열기'],
            ['통합', '동일 데이터의 중복을 최소화', '엑셀: 부서마다 같은 정보 반복 저장'],
            ['저장', '디스크에 영속 — 전원 꺼져도 유지', '엑셀: 파일 단위 저장 — 분실 위험'],
            ['변화', '수정·삽입·삭제가 즉시 반영', '엑셀: 누군가의 수정을 다른 사람은 모름'],
            ['실시간', '요청 즉시 응답 (초 이내)', '엑셀: 큰 파일은 열기·저장 자체가 느림'],
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '암기법: "공통저변 + 실시간"',
          body:
            '앞 글자 4개 = [공통저변]. 거기에 "실시간 처리" 까지. 시험에선 "DB 의 특징이 아닌 것" 으로 자주 출제 — 5가지 외 다른 보기가 정답.',
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
            'Data Warehouse 는 운영 시스템(OLTP) 데이터를 ETL 후 주제별로 정돈한 분석 창고입니다. 주로 정형 데이터, OLAP·BI 가 사용. 운영 시스템에 영향을 안 주려고 별도 저장소에 모으는 게 핵심.',
        },
        {
          kind: 'keypoints',
          title: 'DW 의 핵심 용어 — 한 줄로',
          items: [
            'ETL = Extract(추출) → Transform(변환) → Load(적재). 운영 DB 의 raw 를 읽어 분석 형태로 가공 후 DW 에 저장하는 파이프라인.',
            '주제별 정돈 = 부서·테이블 단위가 아니라 "매출", "고객", "재고" 같은 분석 주제별로 묶어 저장.',
            '시간별 정돈 = 같은 매출 데이터도 일·주·월 단위로 미리 집계해서 보관 → 시계열 분석이 빠름.',
            'Schema-on-Write = 저장하는 시점에 컬럼·타입을 미리 결정. 정형 데이터만 가능.',
            'OLAP = Online Analytical Processing — 다차원 집계·조회가 주 작업.',
            'BI = Business Intelligence — 의사결정용 시각화 도구. DW 의 주 사용자.',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 키워드 — DW 만의 시그널',
          body:
            '"ETL 후 주제별·시간별 정돈", "OLAP·BI 분석용", "Schema-on-Write". 정형·반정형·비정형 모두 raw 로 담는다 → Data Lake. 실시간 거래 처리 → OLTP.',
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
            'Data Lake 는 정형뿐 아니라 반정형·비정형·raw 데이터까지 형태 변환 없이 적재하는 저장소입니다. DW 와의 결정적 차이는 "Schema-on-Read" — 저장할 땐 구조를 안 정하고 읽을(분석할) 때 비로소 구조를 입힙니다. 사진·영상·로그 같은 비정형도 모두 그대로 받습니다.',
        },
        {
          kind: 'table',
          title: 'DW vs Data Lake — 한눈에',
          headers: ['축', 'DW (Data Warehouse)', 'Data Lake'],
          rows: [
            ['데이터 형태', '정형 only', '정형·반정형·비정형 모두'],
            ['스키마 적용 시점', 'Schema-on-Write (저장 시)', 'Schema-on-Read (분석 시)'],
            ['주 사용자', 'BI 분석가·경영진', '데이터 사이언티스트·엔지니어'],
            ['활용 목적', '정형 리포트·대시보드', '머신러닝·로그 탐색·실험'],
            ['데이터 가공', 'ETL 후 적재', 'raw 그대로 적재'],
          ],
        },
        {
          kind: 'table',
          title: 'OLTP vs OLAP — 운영 vs 분석',
          headers: ['축', 'OLTP (Transaction)', 'OLAP (Analytical)'],
          rows: [
            ['주 작업', 'insert·update·delete', 'select·aggregate'],
            ['응답 시간', '짧은 트랜잭션 (ms)', '긴 분석 쿼리 (초~분)'],
            ['데이터 형태', '정규화된 정형', '비정규화·집계'],
            ['예시 시스템', 'ERP·CRM 운영 DB', 'DW·BI 분석 환경'],
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
          kind: 'intro',
          body:
            '회사가 커지면 부서마다 데이터가 따로 쌓이고, 같은 고객 정보가 영업·마케팅·CS 에 중복 저장됩니다. 이를 통합·표준화하기 위한 5가지 정보 시스템이 시험에 자주 등장 — DBMS 가 가장 아래 인프라, 그 위에 ERP·CRM·SCM 이 영역별로 올라가고, BI 는 그 데이터들을 의사결정으로 연결합니다.',
        },
        {
          kind: 'table',
          title: '기업 정보 시스템 5종 — 한눈에',
          headers: ['시스템', '풀네임', '담당 영역', '대표 사례'],
          rows: [
            ['DBMS', 'DataBase Management System', '데이터 저장·관리 인프라', 'Oracle·MySQL·PostgreSQL'],
            ['ERP', 'Enterprise Resource Planning', '회사 안 — 생산·재무·인사 통합', 'SAP·Oracle ERP'],
            ['CRM', 'Customer Relationship Management', '고객 접점 — 마케팅·캠페인', 'Salesforce'],
            ['SCM', 'Supply Chain Management', '공급사슬 — 조달·재고·물류', 'SAP SCM'],
            ['BI', 'Business Intelligence', '의사결정 — 대시보드·리포트', 'Tableau·Power BI'],
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"생고공의" 흐름',
          body:
            'ERP(생산·전사) → CRM(고객) → SCM(공급사슬) → BI(의사결정). 모두 DBMS 위에서 작동. ERP 는 회사 안쪽, CRM·SCM 은 회사 바깥(고객·협력사) 접점, BI 는 그 데이터를 가공해 결정에 쓰는 도구.',
        },
        {
          kind: 'keypoints',
          title: 'DBMS 유형 4가지',
          items: [
            '계층형 (Hierarchical): 트리 구조 1:N — 한 부모-여러 자식. 예전 IBM IMS.',
            '망형 (Network): 한 자식이 여러 부모를 가질 수 있음. 복잡한 관계 표현.',
            '관계형 (RDB): 테이블·SQL — 현대 가장 널리 쓰임 (Oracle·MySQL·PostgreSQL).',
            'NoSQL: 대용량·비정형 대응 — 키-값·문서·그래프 등 (MongoDB·Redis).',
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
          kind: 'intro',
          body:
            '빅데이터 시대 이전엔 데이터가 비싸고 분석 도구도 비쌌습니다. 그래서 작은 표본을 정성스럽게 모으고, 가설을 먼저 세우고, "왜 그런가" 의 인과를 밝히는 방식이 표준이었어요. 지금은 저장·연산 비용이 폭락해 4가지 축에서 분석의 디폴트가 뒤집혔습니다. 시험에선 "이전 → 이후" 매칭을 자주 묻습니다.',
        },
        {
          kind: 'table',
          title: '변화 4축 — 이전 vs 이후',
          headers: ['축', '이전 (전통적 통계)', '이후 (빅데이터)'],
          rows: [
            ['규모', '표본(Sample)', '전수(Population)'],
            ['품질', '질(Quality)', '양(Quantity)'],
            ['관점', '인과(Causation)', '상관(Correlation)'],
            ['접근', '이론 기반 (가설 우선)', '데이터 기반 (패턴 발굴)'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 함정 — 축은 4개로 독립',
          body:
            '예를 들어 "표본 → 전수" 는 규모 축, "인과 → 상관" 은 관점 축. 서로 다른 축의 변화를 섞어서 묻는 게 단골 함정입니다. 어느 축의 변화인지 라벨을 먼저 붙이고 답을 고르세요.',
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
            '"전수 조사"란 모집단(예: 전체 가입자) 의 한 명도 빠짐없이 다 분석하는 것이고, "표본 조사"는 그중 일부만 추려 분석하는 것입니다. 전통적 통계학은 비용 때문에 표본을 강제했지만, 빅데이터 시대엔 가입자 1억 명 거래 로그도 다 다룰 수 있게 됐어요.',
        },
        {
          kind: 'section',
          title: '왜 가능해졌나 — 비용의 폭락',
          body:
            '저장 비용: 1990년대 1GB = 수백만 원 → 현재 = 수십 원. 연산 비용: 클라우드(AWS·GCP) 로 수천 대 컴퓨터를 분 단위로 빌릴 수 있게 됨. 이 두 변화로 "비용 때문에 표본만 보던" 제약이 사라졌습니다.',
        },
        {
          kind: 'section',
          title: '구체 사례',
          body:
            '예전: 백화점이 고객 1만 명 표본 추출 → 만족도 설문 → 결과 일반화. 지금: 카드사 5천만 회원 전체의 1년치 거래 5억 건을 다 다루며 사기 탐지 모델 학습. 표본 추정의 오차 자체가 사라지고, 희소한 사례(예: 0.001% 의 사기 거래) 도 그대로 잡힙니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 키워드',
          body:
            '"표본 → 전수", "Sample → Population", "전수 조사 가능". 인과·상관 축, 질·양 축, 이론·데이터 축은 별개의 변화 — 섞어서 묻는 함정 주의.',
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
            '"질" 이란 데이터가 얼마나 깔끔한지 — 결측·오타·이상치가 없는지를 말합니다. 전통 통계에선 작은 표본에서도 정확한 결론을 내야 했기에 데이터 정제에 큰 비중을 뒀어요. 빅데이터에선 양이 워낙 많아 일부 잡음이 평균에 묻혀버리는 효과가 생겨, 정제보다 양 확보가 우선이 됐습니다.',
        },
        {
          kind: 'section',
          title: '구체 사례',
          body:
            '예전: 의학 연구가 100명 환자의 혈액 샘플을 정밀 측정 → 깔끔한 작은 데이터로 모델 학습. 지금: 검색엔진이 수십억 개의 자유 텍스트 쿼리·클릭 로그를 학습 — 오타·중복·노이즈 섞여 있어도 양이 압도적이라 패턴이 더 잘 잡힘. ChatGPT 같은 거대 언어모델도 "정제된 소량" 보다 "잡음 섞인 인터넷 전체" 로 더 똑똑해진 사례.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 키워드',
          body:
            '"질 → 양", "Quality → Quantity", "잡음 허용", "정제보다 규모". 규모(표본/전수) 와 별개 축이라는 점이 함정 — 두 축이 비슷해 보이지만 다른 변화입니다.',
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
            '인과(Causation) = "A 가 B 의 원인이다" — A 를 바꾸면 B 가 바뀐다는 직접적 영향 관계. 상관(Correlation) = "A 와 B 가 함께 변한다" — 둘이 동시 변하지만 무엇이 원인인지는 모름. 전통 과학은 인과를 증명해야 결론을 내렸지만, 빅데이터 시대엔 상관만으로도 마케팅·운영 결정엔 충분합니다.',
        },
        {
          kind: 'section',
          title: '구체 사례 — 상관만으로 충분한 경우',
          body:
            '월마트가 분석해보니 "허리케인 예보 직전 → 스트로베리 팝타르트 매출 7배 증가". 왜 사람들이 폭풍에 대비해 팝타르트를 사는지 인과는 모르지만, 매대를 미리 채워놓으면 매출이 오릅니다. 상관만으로 의사결정 OK. / 넷플릭스 추천: "이 영화 본 사람은 저 영화도 본다" — 왜 그런 취향 패턴인지 몰라도 추천 효과는 충분.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '주의 — "원인 무관" 은 아님',
          body:
            '시험 함정: "빅데이터 시대엔 인과관계가 무의미해졌다" 라는 보기는 틀림. 정답은 "상관만으로도 의사결정 가능" — 인과는 여전히 가치 있지만, 상관만 있어도 활용 가능한 영역이 늘어났다는 뜻.',
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
            '"이론 기반"은 분석가가 먼저 가설을 세우고 ("월요일에 매출이 더 높을 것이다") 데이터로 검증하는 방식. "데이터 기반"은 가설 없이 풍부한 데이터에서 알고리즘이 직접 패턴을 찾아주는 방식. 데이터가 폭증하고 머신러닝이 발달하면서 후자가 가능해졌습니다.',
        },
        {
          kind: 'section',
          title: '구체 사례',
          body:
            '이론 기반: 마케터가 "20대가 30대보다 SNS 광고에 반응이 클 것" 이라는 가설을 세우고 A/B 테스트로 검증. 데이터 기반: 추천 알고리즘이 사용자 1억 명의 행동 로그에서 "이런 패턴을 가진 사람은 이런 상품을 산다" 같은 규칙을 자동 발견 — 분석가가 미리 가설을 세우지 않은 새로운 패턴이 튀어나옴.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 키워드 — 인과/상관 축과 혼동 주의',
          body:
            '"이론 → 데이터", "Theory → Data-driven", "가설 우선 → 패턴 발굴". 인과/상관 축과 비슷해 보이지만 다른 차원 — 이 축은 "분석을 어떻게 시작하느냐", 인과/상관은 "결론의 형태가 무엇이냐" 의 차이.',
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
  title: '모델링 · 스키마 · 엔터티 · 속성 · 관계 · 식별자',
  hook: '테이블을 그리기 전에, "무엇을 어떻게 저장할지" 를 정리하는 단계.',
  estimatedMinutes: 14,
  steps: [
    {
      id: 'sqld-1-1-s1',
      title: '데이터 모델링이란 — 3특징 + 3관점',
      quizId: 'sqld-1-1-cp-01',
      dialogue: [
        { pose: 'wave', text: 'SQLD 첫 시간! [데이터 모델링]부터 차근차근 배워보자.' },
        { pose: 'think', text: '학교에서 [수강신청] 한 번쯤 해봤지? 학생·과목·교수·시간표 같은 정보를 컴퓨터가 다루려면 어떻게 해야 할까?' },
        { pose: 'lightbulb', text: '바로 [표(Table)]로 정리하는 거야! 학생 표·과목 표·수강신청 표 식으로!' },
        { pose: 'happy', text: '"현실 정보 → 약속된 표기법 → DB 구조" 로 옮기는 [전체 과정]을 [데이터 모델링]이라 불러.' },
        { pose: 'think', text: '근데 아무렇게나 표를 만들면 안 돼. 좋은 모델은 [3가지 특징]이 있어야 해!' },
        { pose: 'lightbulb', text: '[단순화] 누구나 쉽게 이해 / [추상화] 핵심만 추출 / [명확화] 해석에 모호함이 없어야!' },
        { pose: 'happy', text: '암기는 [단추명]! "단순·추상·명확" 첫 글자!' },
        { pose: 'think', text: '그리고 같은 업무를 [3가지 관점]으로 봐야 해.' },
        { pose: 'lightbulb', text: '[데이터(What)] 무엇이 저장되나 / [프로세스(How)] 업무가 어떻게 흐르나 / [상관] 둘이 어떻게 만나나!' },
        { pose: 'happy', text: '암기는 [데프상]! "데이터·프로세스·상관" 첫 글자야.' },
        { pose: 'think', text: 'CRUD 라는 말 들어봤어? [Create·Read·Update·Delete] — 데이터에 가하는 4가지 기본 동작!' },
        { pose: 'idle', text: '"상관 관점" 은 결국 "이 업무 단계가 어느 데이터를 CRUD 중 뭘 하는가" 분석이야. 자, 문제로!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '데이터 모델링은 현실 세계의 정보를 약속된 표기법(ERD 등)으로 데이터베이스 구조에 옮기는 과정입니다. 본격적인 SQL 을 짜기 전, "어떤 표를 어떤 모양으로 만들지" 미리 그려보는 단계예요.',
        },
        {
          kind: 'section',
          title: '왜 모델링이 필요할까?',
          body:
            '학교 교무실의 종이 명부를 DB로 옮긴다고 가정해 봅시다. 한 종이에 학생 정보·수강 과목·점수가 다 적혀 있어요. 이걸 그대로 한 테이블에 넣으면 학생이 100명, 과목이 10개일 때 관리가 지옥이 됩니다. 모델링은 이걸 "학생 표·과목 표·수강 표" 처럼 의미 단위로 쪼개주는 작업입니다.',
        },
        {
          kind: 'keypoints',
          title: '모델링의 3가지 특징 — "단추명"',
          items: [
            '단순화 — 도메인 전문가가 아니라도 그림만 보면 의미가 통함',
            '추상화 — 모든 디테일을 다 그리지 않고 핵심 구조만',
            '명확화 — 누가 봐도 해석이 한 가지로 떨어짐 (모호함 X)',
          ],
        },
        {
          kind: 'keypoints',
          title: '모델링의 3가지 관점 — "데프상"',
          items: [
            '데이터 관점(Data, What) — 무엇이 저장되는가 → 엔터티·속성을 본다',
            '프로세스 관점(Process, How) — 업무가 어떻게 흐르는가 → 업무 흐름도(DFD)',
            '상관 관점(Data-Process, Interaction) — 둘이 어떻게 만나는가 → CRUD 매트릭스',
          ],
        },
        {
          kind: 'example',
          title: '쇼핑몰 예시',
          body:
            '데이터 관점: "회원·상품·주문" 같은 엔터티가 있다.\n프로세스 관점: "회원이 상품을 장바구니에 담고 → 결제 → 주문 생성".\n상관 관점: "결제 단계는 [회원] 을 R(읽기), [상품] 을 R, [주문] 을 C(생성). [주문] 을 U(수정) 하지는 않는다."',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"단·추·명 / 데·프·상"',
          body:
            '특징은 단순·추상·명확. 관점은 데이터·프로세스·상관. 시험에 자주 나오는 두 가지 묶음을 한 번에 외워두세요.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '유의사항 — "유유일"',
          body:
            '유연성(변경에 강함) · 유일성(중복 저장 X) · 일관성(같은 의미는 같은 이름). SQLD 는 주로 데이터 관점만 다루지만 면접·실무에선 3관점을 다 봅니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s2',
      title: '모델링 단계 — 개념 → 논리 → 물리',
      quizId: 'sqld-1-1-cp-02',
      dialogue: [
        { pose: 'wave', text: '모델링은 한 번에 끝나는 게 아니라 [3단계] 거쳐 가!' },
        { pose: 'think', text: '비유하면 집 짓기와 똑같아. [스케치] → [설계도면] → [실제 시공]!' },
        { pose: 'lightbulb', text: 'DB도 마찬가지야. [개념적] 모델링 (큰 그림) → [논리적] (정규화·구조 정밀화) → [물리적] (실제 DDL).' },
        { pose: 'happy', text: '암기 [개논물]! "개념·논리·물리" 첫 글자!' },
        { pose: 'think', text: '아래로 갈수록 [추상화 ↓ 구체화 ↑]. 점점 실제 DB 에 가까워져.' },
        { pose: 'lightbulb', text: '시험에서 자주 묻는 건 [논리적 단계의 특징] — [재사용성] 이 가장 높음!' },
        { pose: 'happy', text: '"DBMS 가 바뀌어도 그대로 쓸 수 있는 모델" 이 논리적 모델이라 그래.' },
        { pose: 'think', text: '데이터 모델의 [필수 구성요소] 3가지: 엔터티(Entity), 속성(Attribute), 관계(Relationship)!' },
        { pose: 'lightbulb', text: 'ERD 는 [Peter Chen] 이 1976년에 고안했어. 표기법은 IE·Barker 두 가지가 대표적!' },
        { pose: 'idle', text: '어느 단계에서 ERD 를 그릴까? 문제로!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '모델링은 추상도가 다른 3단계를 거칩니다. 개념적 단계에서는 큰 그림 (어떤 엔터티가 있고 어떻게 연결되는지) 만 그리고, 논리적 단계에서 정규화·키 정의 등 세부 구조를 잡고, 물리적 단계에서 실제 DBMS 의 자료형·인덱스·스토리지를 결정합니다.',
        },
        {
          kind: 'table',
          title: '3단계 비교 — "개논물"',
          headers: ['단계', '관점', '핵심 활동', '산출물'],
          rows: [
            ['개념적', '비즈니스', '엔터티 도출 + ERD 스케치', 'ERD'],
            ['논리적', '논리 구조', '정규화 + 식별자 정의 + 관계 정밀화', '논리 ERD'],
            ['물리적', '실제 DBMS', '컬럼 자료형 + 인덱스 + 파티션', 'DDL 스크립트'],
          ],
        },
        {
          kind: 'section',
          title: '왜 단계를 나눌까?',
          body:
            '한 단계에서 모든 결정을 내리려 하면 머리에 너무 많은 정보가 들어옵니다. 단계를 나누면 (1) 비즈니스 = 인터뷰·요구사항 (2) 논리 = 정규화·관계 (3) 물리 = 성능·스토리지 처럼 각 단계마다 집중할 주제가 달라져 결정 품질이 좋아집니다. 또 비즈니스 변경이 생기면 개념 단계만 고치면 되어 변경 비용이 낮아집니다.',
        },
        {
          kind: 'keypoints',
          title: '단계의 핵심 차이',
          items: [
            '개념적 — 비즈니스 언어, DBMS 무관, 가장 추상적',
            '논리적 — 정규화 적용, 재사용성 ↑, DBMS 와 어느 정도 독립',
            '물리적 — DBMS 종속 (Oracle/MySQL/SQL Server 등), 성능 최적화',
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"개논물"',
          body:
            '개념(스케치) → 논리(설계도) → 물리(시공). 시험에는 단계 순서·특징 매칭이 단골입니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '구성요소 3가지',
          body:
            '데이터 모델의 필수 구성요소 = 엔터티 + 속성 + 관계. 이 셋이 모여 한 ERD 를 이룹니다. ERD 표기법은 IE 와 Barker 가 대표적이며 SQLD 시험에선 둘의 차이를 묻기도 합니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s3',
      title: 'ANSI/SPARC 3-스키마 + 데이터 독립성',
      quizId: 'sqld-1-1-cp-03',
      dialogue: [
        { pose: 'wave', text: '같은 DB 라도 [보는 사람] 마다 시야가 달라야 해.' },
        { pose: 'think', text: '예를 들어 학생은 "내 성적표" 만 보고, 교수는 "전공 학생 명단" 보고, DBA 는 "DB 전체 구조" 를 봐.' },
        { pose: 'lightbulb', text: '이걸 [3계층]으로 나눈 게 [ANSI/SPARC 표준]! 시험 출제 1순위!' },
        { pose: 'happy', text: '[외부 스키마] = 사용자별 뷰 (여러 개), [개념 스키마] = 조직 전체 통합 (1개), [내부 스키마] = 물리 저장!' },
        { pose: 'think', text: '함정 키워드: 시험에 "조직 전체 통합" "통합적 표현" 키워드가 보이면 100% [개념 스키마]!' },
        { pose: 'lightbulb', text: '보기에 "응용 스키마" "논리 스키마" 같은 거 나오면 다 [가짜] 야.' },
        { pose: 'happy', text: '추가로 [데이터 독립성] 2가지: [논리적 독립성] · [물리적 독립성]!' },
        { pose: 'think', text: '[논리적 독립성]: 개념 스키마 변경 시 외부 스키마는 영향 없음 (테이블 추가해도 사용자 화면 안 바뀜).' },
        { pose: 'lightbulb', text: '[물리적 독립성]: 내부 스키마 변경 시 개념·외부 영향 없음 (디스크 옮겨도 SQL 안 바꿔도 됨).' },
        { pose: 'idle', text: '통합 관점 = ? 문제로 가자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'ANSI/SPARC 는 1975 년 미국 표준위원회가 제안한 DB 3-계층 아키텍처. 같은 DB 도 시점에 따라 다른 추상도로 보이도록 설계된 모델입니다. SQLD 1과목에서 가장 자주 나오는 개념 중 하나.',
        },
        {
          kind: 'table',
          title: '3계층 비교',
          headers: ['계층', '별명', '관점', '예시'],
          rows: [
            ['외부 스키마', '서브 스키마, 사용자 뷰', '사용자 — 여러 개 존재', '학생용 뷰 / 교수용 뷰'],
            ['개념 스키마', '전체 뷰, 통합 논리', 'DBA — 1개만 존재', '조직 전체 ER 모델'],
            ['내부 스키마', '저장 스키마', '저장장치 입장', '인덱스·파티션·블록 배치'],
          ],
        },
        {
          kind: 'section',
          title: '왜 계층을 나눌까? — 데이터 독립성',
          body:
            'DB 가 한 덩어리라면 작은 변경도 전체에 영향이 갑니다. 계층을 나누면 위 계층은 아래 계층의 변경을 모르고도 살 수 있어요. 새 인덱스를 추가해도 SQL 한 줄도 안 바꿔도 되고, 새 컬럼을 추가해도 기존 사용자 화면은 그대로 — 이걸 "데이터 독립성" 이라 합니다.',
        },
        {
          kind: 'keypoints',
          title: '독립성 2종',
          items: [
            '논리적 독립성 — 개념 스키마 변경 시 외부(=사용자 뷰)는 영향 X',
            '물리적 독립성 — 내부 스키마 변경 시 개념·외부는 영향 X',
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"외·개·내"',
          body:
            '외부(사용자) → 개념(전체) → 내부(저장). 위에서 아래로 추상도가 줄어듭니다. "통합" 키워드 = 개념 스키마.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — 가짜 보기',
          body:
            '"응용 스키마"·"논리 스키마"·"외래 스키마" 같은 보기는 모두 함정입니다. 정답은 외부·개념·내부 3개뿐.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s4',
      title: '엔터티 — 5요건 + 명명 규칙',
      quizId: 'sqld-1-1-cp-04',
      dialogue: [
        { pose: 'wave', text: '[엔터티(Entity)]는 우리가 [표] 로 관리할 대상이야!' },
        { pose: 'think', text: '실생활 예시: "학생", "과목", "수강신청", "고객", "주문" 같은 거. 결국 DB 의 [테이블 1개] 가 됨.' },
        { pose: 'lightbulb', text: '엔터티가 되려면 [5가지 조건]을 갖춰야 해. 시험 단골!' },
        { pose: 'happy', text: '① 업무에 필요해야 함 / ② 유일하게 식별 가능 / ③ 2개 이상 인스턴스 / ④ 속성 보유 / ⑤ 다른 엔터티와 관계!' },
        { pose: 'think', text: '함정! 시험에 "[영속적으로 저장돼야 함]" 같은 보기 나오면 [틀린 답]이야.' },
        { pose: 'lightbulb', text: '왜? 임시 엔터티도 있을 수 있어. "이번 학기 수강신청" 같은 한시적 데이터도 엔터티야.' },
        { pose: 'happy', text: '명명 규칙도 5가지: [현업 용어 사용]·[약어 지양]·[단수 명사]·[유일]·[의미 명확]!' },
        { pose: 'think', text: '"학생들" (X) → "학생" (O). 단수 명사 원칙. 약어 (예: STD) 보다 풀네임 권장!' },
        { pose: 'lightbulb', text: '"약어를 사용해야 한다" 는 보기는 항상 [함정]. 약어는 의미를 흐리니까 [지양]해야 해!' },
        { pose: 'idle', text: '엔터티 조건 아닌 것 찾기! 문제로!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '엔터티는 업무에서 관리해야 할 "실체" 또는 "개념" 입니다. 현실에 존재하는 사람·물건·장소뿐 아니라 "주문·계약·평가" 같은 사건도 엔터티가 될 수 있어요. 결국 DB 에서 한 테이블이 됩니다.',
        },
        {
          kind: 'section',
          title: '엔터티 vs 인스턴스 vs 속성',
          body:
            '"학생" 은 엔터티(테이블), 그 안에 있는 "홍길동·이영희·김철수" 는 인스턴스(행), 학생의 "학번·이름·전공" 은 속성(컬럼). 같은 의미를 다른 단어로 부르는 거라 헷갈리기 쉬우니 도식으로 외워두세요.',
        },
        {
          kind: 'keypoints',
          title: '엔터티의 5가지 특징',
          items: [
            '① 업무에서 필요한 정보 — 안 쓸 데이터를 굳이 모델링할 필요 X',
            '② 유일하게 식별 가능 — 식별자(주민번호·학번 등) 가 있어야',
            '③ 2개 이상의 인스턴스 — 한 행만 있는 건 엔터티 아님',
            '④ 2개 이상의 속성 보유 — 식별자 1개만 있으면 의미 없음',
            '⑤ 다른 엔터티와 관계 — 고립된 테이블은 거의 없음',
          ],
        },
        {
          kind: 'keypoints',
          title: '엔터티 명명 규칙 5가지',
          items: [
            '현업에서 실제 사용하는 용어 사용 (영어 직역 X)',
            '약어 사용 지양 (의미 흐려짐)',
            '단수 명사 사용 ("학생" O / "학생들" X)',
            '시스템 전체에서 유일한 이름',
            '의미가 명확해 누가 봐도 같은 그림이 그려짐',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '시험 함정 1 — "영속적 저장 필수"',
          body:
            '"엔터티는 반드시 영속적으로 저장되어야 한다" 는 보기는 [틀림]. 임시 엔터티·세션 엔터티도 존재합니다.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '시험 함정 2 — "약어 사용해야 한다"',
          body:
            '오히려 "약어를 지양해야 한다" 가 정답입니다. STD(학생)·DEPT(부서) 같은 약어는 가독성과 협업에 마이너스.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s5',
      title: '엔터티 분류 — 유무형 / 발생시점',
      quizId: 'sqld-1-1-cp-05',
      dialogue: [
        { pose: 'wave', text: '엔터티는 [2가지 기준]으로 분류돼! 두 분류를 헷갈리면 시험에서 함정에 걸려.' },
        { pose: 'think', text: '첫 번째 기준 = [유무형]: 형태가 있냐 없냐? [유형] · [개념] · [사건] 3종!' },
        { pose: 'lightbulb', text: '암기 [개사유]! "개념·사건·유형" 첫 글자 (순서 중요 X, 묶어 외우기)!' },
        { pose: 'happy', text: '예시: 학생·책·고객 = 유형(만질 수 있음). 과목·학과·부서 = 개념(만질 수 없음). 수강·주문 = 사건(시점에서 발생).' },
        { pose: 'think', text: '두 번째 기준 = [발생시점]: 언제 어떻게 만들어졌나? [기본] · [중심] · [행위] 3종!' },
        { pose: 'lightbulb', text: '[기본 엔터티]: 다른 엔터티 영향 X 독립 존재 → 부모 역할. 학생·과목·고객.' },
        { pose: 'happy', text: '[중심 엔터티]: 기본 ↔ 행위 사이를 연결. 수강신청·주문.' },
        { pose: 'think', text: '[행위 엔터티]: 둘 이상에서 상속받아 만들어짐. 자주 수정됨. 수강·주문내역.' },
        { pose: 'lightbulb', text: '함정! 보기에 "관계 엔터티"·"응용 엔터티"·"유형 엔터티" 가 발생시점 분류 자리에 나오면 [전부 가짜]야!' },
        { pose: 'happy', text: '발생시점 분류는 [딱 3개]: 기본·중심·행위. 다른 단어 보이면 의심!' },
        { pose: 'idle', text: '발생시점이 아닌 것 찾기 — 단골 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '엔터티 분류는 시험 단골입니다. 두 가지 기준이 있고 각각 분류명이 정해져 있어 외우는 게 정답률을 올리는 가장 빠른 길입니다.',
        },
        {
          kind: 'table',
          title: '유무형에 따른 분류 — "개·사·유"',
          headers: ['분류', '의미', '예'],
          rows: [
            ['유형 엔터티', '물리적 형태가 존재', '학생, 책, 고객, 자동차'],
            ['개념 엔터티', '형태는 없지만 개념적으로 구분', '과목, 학과, 부서, 계좌'],
            ['사건 엔터티', '특정 시점에 발생한 사건', '수강, 주문, 예약, 결제'],
          ],
        },
        {
          kind: 'table',
          title: '발생 시점에 따른 분류 (정확히 3개)',
          headers: ['분류', '의미', '예'],
          rows: [
            ['기본 엔터티', '독립적으로 존재 — 부모 역할', '학생, 과목, 고객, 직원'],
            ['중심 엔터티', '기본 + 행위 연결, 업무 핵심', '수강신청, 주문'],
            ['행위 엔터티', '두 엔터티 이상을 상속, 수정 잦음', '주문내역, 수강내역'],
          ],
        },
        {
          kind: 'section',
          title: '두 분류를 헷갈리지 않는 팁',
          body:
            '"수강" 은 유무형 분류로는 사건, 발생시점 분류로는 행위. 같은 엔터티가 두 분류 모두에 속할 수 있다는 점이 헷갈리는 포인트. 시험에서는 "어느 기준의 분류인지" 를 먼저 확인하고 그 기준의 분류명만 정답 후보로 두세요.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '시험 함정 — 가짜 분류명',
          body:
            '발생시점 분류 보기에 "관계 엔터티 / 유형 엔터티 / 응용 엔터티" 가 있으면 모두 [가짜]. 발생시점은 기본·중심·행위뿐.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"개사유" + "기중행"',
          body:
            '유무형 = 개념·사건·유형. 발생시점 = 기본·중심·행위. 두 묶음을 분리해 외우기.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s6',
      title: '속성 — 3 × 3 × 3 분류',
      quizId: 'sqld-1-1-cp-06',
      dialogue: [
        { pose: 'wave', text: '[속성(Attribute)]은 엔터티의 [세부 정보]야! DB 의 컬럼 1개와 매칭!' },
        { pose: 'think', text: '예: 엔터티 "학생" 의 속성 = "학번·이름·전공·생년월일·연락처". 한 줄(인스턴스) 마다 이 속성 값들이 채워져.' },
        { pose: 'lightbulb', text: '속성의 핵심 원칙: [원자성(Atomicity)] — 더 이상 분리되지 않는 [최소 단위]!' },
        { pose: 'happy', text: '"010-1234-5678" 을 한 컬럼에 통째 저장? OK. "010" "1234" "5678" 셋으로 쪼갤 수도 있음 — 분해 가능 여부에 따라 분류돼.' },
        { pose: 'think', text: '[분류 기준 1 — 특성]: [기본]·[설계]·[파생]!' },
        { pose: 'lightbulb', text: '[기본] = 업무에 원래 있는 속성 (이름·학번·생년월일).' },
        { pose: 'happy', text: '[설계] = 시스템 설계 과정에서 새로 만든 속성 (주문번호·일련번호 — 업무에는 원래 없었음).' },
        { pose: 'think', text: '[파생] = 다른 속성에서 [계산·가공] 으로 만든 속성! 시험 단골!' },
        { pose: 'lightbulb', text: '예: "총구매액" = SUM(주문액). "나이" = TODAY - 생년월일. "평균 점수" = AVG(과목별 점수).' },
        { pose: 'happy', text: '[분류 기준 2 — 분해]: [단일]·[복합]·[다중값]!' },
        { pose: 'think', text: '[복합 속성] = 주소 (시·도·도로명·건물번호 등). 하위 속성 여러 개로 쪼갤 수 있음.' },
        { pose: 'lightbulb', text: '[다중값 속성] = 한 사람이 여러 값을 가질 수 있음 — 전화번호·이메일·취미. 별도 테이블로 분리해 저장!' },
        { pose: 'happy', text: '[분류 기준 3 — 구성 방식]: [PK]·[FK]·[일반]!' },
        { pose: 'idle', text: '"다른 속성에서 계산되어 생성" → 어느 분류? 정답 매칭 가자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '속성은 엔터티의 세부 정보를 담는 단위입니다. 1 인스턴스 = 1 속성 값 (원자성). 시험에서는 속성을 3가지 기준으로 분류해 묻는 문제가 단골이며, 특히 "파생 속성" 정의 매칭이 가장 자주 출제됩니다.',
        },
        {
          kind: 'section',
          title: '속성의 핵심 원칙 — 원자성',
          body:
            '한 셀에는 하나의 의미만. "전화번호" 컬럼에 "010-1234-5678/02-555-0000" 같이 두 번호를 한 칸에 적어두면 검색·갱신·분리가 어려워집니다. 이 원칙을 지키지 못하면 "1NF 위반" 으로 정규화 대상이 됩니다.',
        },
        {
          kind: 'table',
          title: '분류 ① — 특성에 따른 분류',
          headers: ['분류', '의미', '예시'],
          rows: [
            ['기본 속성', '업무에서 원래 존재', '이름, 학번, 고객ID, 생년월일'],
            ['설계 속성', '설계로 새로 정의', '주문번호, 일련번호, 시퀀스ID'],
            ['파생 속성', '다른 속성에서 계산·가공', '합계, 평균, 나이, 등급, 잔여수량'],
          ],
        },
        {
          kind: 'table',
          title: '분류 ② — 분해 가능 여부',
          headers: ['분류', '의미', '예시'],
          rows: [
            ['단일(Simple) 속성', '하나의 의미, 더 못 쪼갬', '이름, 학번, 가격'],
            ['복합(Composite) 속성', '하위 속성으로 쪼갤 수 있음', '주소(시·도·도로명), 이름(성·이름)'],
            ['다중값(Multivalued) 속성', '여러 값 가능 → 별도 테이블', '전화번호, 이메일, 취미'],
          ],
        },
        {
          kind: 'table',
          title: '분류 ③ — 구성방식',
          headers: ['분류', '의미', '예시'],
          rows: [
            ['기본키(PK) 속성', '인스턴스를 유일 식별', '학번'],
            ['외래키(FK) 속성', '다른 엔터티의 PK 참조', '학생.학과ID → 학과.ID'],
            ['일반 속성', 'PK·FK 가 아닌 나머지', '이름, 전공, 학년'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '도메인(Domain) — 속성의 값 범위',
          body:
            '속성이 가질 수 있는 값의 타입·크기 제한. 예: 성별 → {M, F}, 나이 → 0~120 정수, 학번 → 8자리 숫자. CHECK 제약·CREATE TABLE 의 자료형으로 구현 — 도메인 무결성 보장.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — "파생 속성은 많을수록 좋다"',
          body:
            '오답입니다. 파생 속성이 많아질수록 원본 속성 변경 시 모두 재계산해야 해 일관성 리스크 ↑. 꼭 필요한 곳에만 사용 권장.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s7',
      title: '관계 — 관차선 + 교차 엔터티',
      quizId: 'sqld-1-1-cp-07',
      dialogue: [
        { pose: 'wave', text: '[관계(Relationship)]는 두 엔터티 사이의 [논리적 연결]!' },
        { pose: 'think', text: '예: "학생 [수강한다] 과목" → 두 엔터티 사이에 "수강" 이라는 행위 관계가 있어!' },
        { pose: 'lightbulb', text: '관계의 [3요소] — 시험 단골!' },
        { pose: 'happy', text: '[관계명(Membership)] · [차수(Cardinality)] · [선택사양(Optionality)] — 암기 [관차선]!' },
        { pose: 'think', text: '[관계명] = 동사형. "수강한다", "주문한다", "근무한다".' },
        { pose: 'lightbulb', text: '[차수(Cardinality)] = 양쪽이 몇 개씩 만나나? [1:1]·[1:M]·[M:N] 3가지!' },
        { pose: 'happy', text: '[1:1]: 사원 ↔ 사물함 / [1:M]: 부서 ↔ 사원 / [M:N]: 학생 ↔ 과목.' },
        { pose: 'think', text: '[선택사양] = 관계에 [반드시 참여]하는가, [선택적]으로 참여하는가?' },
        { pose: 'lightbulb', text: 'IE 표기: 필수(─) / 선택(○). Barker 표기: 필수(실선) / 선택(점선)!' },
        { pose: 'happy', text: '관계의 종류도 2가지: [존재적] (사원-부서, 부서가 있어야 사원도 의미가 있음) vs [행위적] (학생-수강).' },
        { pose: 'think', text: 'M:N 관계는 [관계형 DB 가 직접 못 표현해]! 그래서 [교차 엔터티]로 풀어!' },
        { pose: 'lightbulb', text: '"학생 ↔ 과목" (M:N) → "학생 1:M [수강] M:1 과목" 으로 변환! 수강이 [교차 엔터티(Associative)]!' },
        { pose: 'happy', text: '교차 엔터티는 보통 양쪽 PK 를 합한 복합 PK 를 가져. (학번·과목코드)!' },
        { pose: 'idle', text: '관차선 매칭 + 차수 식별 — 2가지 패턴 출제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '관계는 엔터티 사이의 의미적 연결입니다. 표면적으로는 ERD 의 선이지만, 그 안에 관계명·차수·선택사양 3가지 정보가 포함됩니다. 관계가 없는 고립된 엔터티는 거의 없으며, 모델링의 절반 이상이 "어떤 관계로 어떻게 묶을까" 를 결정하는 작업입니다.',
        },
        {
          kind: 'keypoints',
          title: '관계의 종류 2가지',
          items: [
            '존재적 관계 — 한쪽이 없으면 다른 쪽도 의미 없음 (사원-부서)',
            '행위적 관계 — 동작·사건에 의해 만들어짐 (학생-수강한다-과목)',
            '※ ERD 는 둘을 구분 X, UML 은 구분',
          ],
        },
        {
          kind: 'table',
          title: '관계의 3요소 — "관차선"',
          headers: ['요소', '의미', '표기 / 예'],
          rows: [
            ['관계명(Membership)', '관계의 이름 (동사)', '"수강한다", "주문한다"'],
            ['차수(Cardinality)', '양쪽 참여자 수', '1:1, 1:M, M:N'],
            ['선택사양(Optionality)', '필수 vs 선택 참여', '필수(─) / 선택(○ 또는 점선)'],
          ],
        },
        {
          kind: 'section',
          title: 'M:N 관계 풀기 — 교차 엔터티(Associative)',
          body:
            '관계형 DB 는 M:N 을 직접 표현하지 못합니다. 예: "학생 ↔ 과목" 이 다대다라면, 중간에 "수강(학생,과목,수강일자,점수)" 같은 교차 엔터티를 끼워 넣어 "학생 1:M 수강 M:1 과목" 두 개의 1:M 으로 풀어줍니다. 수강 엔터티는 (학번, 과목코드) 복합 PK 를 가지며, 이 패턴이 관계형 DB 의 가장 흔한 구조입니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'IE vs Barker 표기',
          body:
            'IE: 필수=실선 + 막대 / 선택=실선 + ○. Barker: 필수=실선 / 선택=점선. 시험에서 표기법 종류와 선·점선 의미를 매칭하는 문제가 출제됩니다.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — 관계 차수 오해',
          body:
            '"부모-자식 관계는 무조건 1:1" 같은 보기는 X. 부모 PK 만으로 자식 PK 인 경우 1:1 (= 식별자 관계) 가 가능하지만 보통은 1:M.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s8',
      title: '식별자 — 4가지 분류 + 주식별자 4요건',
      quizId: 'sqld-1-1-cp-08',
      dialogue: [
        { pose: 'wave', text: '[식별자(Identifier)]는 인스턴스를 [유일하게 구분]하는 [속성 또는 속성 집합]!' },
        { pose: 'think', text: '학생 1명을 어떻게 구분할까? "이름" 으로? 동명이인이 있으면 X. "학번" 이 있어야 안전!' },
        { pose: 'lightbulb', text: '식별자는 [4가지 기준]으로 분류돼!' },
        { pose: 'happy', text: '① [대표성]: [주식별자(PK)] vs [보조식별자(AK)]!' },
        { pose: 'think', text: '주식별자 = 테이블의 대표 키 (= PK). 보조식별자 = 유일하지만 대표는 아닌 키 (= AK = 대체키).' },
        { pose: 'lightbulb', text: '② [생성]: [내부식별자] vs [외부식별자(=FK)]!' },
        { pose: 'happy', text: '내부 = 엔터티 안에서 만든 식별자 (학생.학번). 외부 = 다른 엔터티에서 받아옴 (수강.학번 ← 학생.학번).' },
        { pose: 'think', text: '③ [속성 수]: [단일식별자] vs [복합식별자]!' },
        { pose: 'lightbulb', text: '단일 = 한 컬럼 (학번). 복합 = 두 개 이상 (학번 + 과목코드 = 수강 PK).' },
        { pose: 'happy', text: '④ [대체 여부]: [본질식별자] vs [인조식별자]!' },
        { pose: 'think', text: '본질 = 업무에 원래 있는 (주민번호·사업자번호). 인조 = 인위 생성 (시퀀스·UUID).' },
        { pose: 'lightbulb', text: '주식별자(PK) 의 [4요건]: [유일성]·[최소성]·[불변성]·[존재성(NOT NULL)]!' },
        { pose: 'happy', text: '암기 [유최불존]! "유일·최소·불변·존재" 첫 글자!' },
        { pose: 'think', text: '함정! "주식별자는 NULL 가능" 보기 = 항상 [틀림]. NULL 절대 X.' },
        { pose: 'lightbulb', text: '"의미가 있어야 한다" 도 X. 오히려 [의미 없는 인조 PK] 가 안정적 (값 변경·개인정보 이슈 회피).' },
        { pose: 'idle', text: '주식별자 특성이 아닌 것 찾기 — 단골!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '식별자는 인스턴스를 유일하게 구분하기 위한 속성(들). 모든 엔터티는 1개의 주식별자(PK)를 가져야 합니다. 4가지 기준으로 분류되며, 각각의 분류명과 의미를 매칭하는 문제가 단골 출제.',
        },
        {
          kind: 'table',
          title: '식별자 4가지 분류 기준',
          headers: ['기준', '분류'],
          rows: [
            ['대표성 여부', '주식별자(PK) · 보조식별자(AK = 대체키)'],
            ['생성 여부', '내부식별자 · 외부식별자(FK)'],
            ['속성 수', '단일식별자 · 복합식별자'],
            ['대체 여부', '본질식별자 · 인조식별자'],
          ],
        },
        {
          kind: 'keypoints',
          title: '주식별자(PK) 4요건 — "유최불존"',
          items: [
            '유일성(Uniqueness) — 한 값으로 한 인스턴스만 식별',
            '최소성(Minimality) — 꼭 필요한 속성만 (중복 컬럼 X)',
            '불변성(Immutability) — 한번 정해지면 잘 안 바뀜',
            '존재성(Existence, NOT NULL) — 반드시 값이 있음',
          ],
        },
        {
          kind: 'section',
          title: '본질식별자 vs 인조식별자 — 무엇을 PK 로?',
          body:
            '본질식별자(주민번호·사업자번호)는 업무에 이미 있어 직관적이지만, (1) 값이 바뀔 수 있고 (2) 개인정보 노출 리스크가 있습니다. 그래서 실무는 보통 의미 없는 인조 PK (id BIGSERIAL, UUID) 를 PK 로 두고 본질식별자를 별도 컬럼 + UNIQUE 제약으로 관리합니다.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '시험 함정 — 주식별자 NULL',
          body:
            '"주식별자는 NULL 가능" 보기는 항상 [틀림]. PK = NOT NULL + UNIQUE. NULL 이 들어가면 "유일하게 식별" 자체가 깨집니다.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '시험 함정 — "의미를 담아야 한다"',
          body:
            'PK 는 의미가 있을 필요 없음. 오히려 의미가 강할수록 값 변경 가능성 ↑ → 불변성 위배 위험. 인조 PK 권장 이유 중 하나.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s9',
      title: '식별자 관계 vs 비식별자 관계',
      quizId: 'sqld-1-1-cp-09',
      dialogue: [
        { pose: 'wave', text: '두 엔터티가 관계를 맺을 때 부모의 PK 를 자식이 받는 [방식]에 따라 두 종류로 갈려!' },
        { pose: 'think', text: '[식별자 관계] = 강한 연결. 부모 PK 를 자식이 [PK 의 일부] 로 받음.' },
        { pose: 'lightbulb', text: '예: "주문" PK = 주문번호. "주문상세" PK = (주문번호, 상세번호). 주문상세 는 주문 없이는 존재 불가능 — 부모와 [생명주기] 같음.' },
        { pose: 'happy', text: '[비식별자 관계] = 약한 연결. 부모 PK 를 자식이 [일반 속성(FK)] 으로만 받음.' },
        { pose: 'think', text: '예: "사원" 의 부서ID 컬럼. 사원의 PK 는 사번, 부서ID 는 그냥 외래키. 사원은 부서가 사라져도 (NULL 로 두면) 살아남을 수 있음.' },
        { pose: 'lightbulb', text: 'IE 표기법: [식별자] = [실선], [비식별자] = [점선]!' },
        { pose: 'happy', text: 'Barker 표기법: 비식별자에 [Bar(│)] 표시. 식별자는 Bar 없음.' },
        { pose: 'think', text: '함정! "부모-자식은 항상 1:1" 보기는 X. 자식 PK 가 부모 PK 만이면 1:1, 다른 PK 컬럼이 있거나 두 부모에서 받으면 1:M.' },
        { pose: 'lightbulb', text: 'NULL 허용 차이: 식별자 = [불가] (PK 라서), 비식별자 = [가능] (일반 FK).' },
        { pose: 'idle', text: '실선·점선 구분 + 생명주기 매칭!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '식별자 관계와 비식별자 관계는 부모 PK 의 "받는 방식" 만 다를 뿐, 둘 다 외래키(FK) 로 부모를 참조합니다. 차이는 (1) 자식 PK 에 포함되느냐 (2) 표기법 (3) 생명주기.',
        },
        {
          kind: 'table',
          title: '식별자 vs 비식별자 비교',
          headers: ['항목', '식별자 관계', '비식별자 관계'],
          rows: [
            ['연결 강도', '강한 연결', '약한 연결'],
            ['부모 PK 위치', '자식 주식별자(PK) 일부', '자식의 일반 속성(FK)'],
            ['생명주기', '부모와 동일', '독립적'],
            ['NULL 허용', '불가', '가능'],
            ['IE 표기', '실선', '점선'],
            ['Barker 표기', 'Bar(│) 없음', 'Bar(│)'],
            ['관계 차수', '1:1 또는 1:M', '1:M 일반적'],
          ],
        },
        {
          kind: 'section',
          title: '실생활 예시',
          body:
            '식별자 예: 주문(주문번호) ↔ 주문상세(주문번호+상세번호). 주문이 없으면 주문상세는 의미 자체가 없음 → 강한 결속.\n비식별자 예: 부서(부서ID) ↔ 사원(사번, 부서ID). 사원은 부서ID 가 NULL 이어도 (예: 미배정) 존재 가능 → 약한 결속.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '핵심 판별법',
          body:
            '부모 PK 가 자식 PK 일부 = 식별자. 자식 일반 속성 = 비식별자. 그림에서 실선 = 식별자, 점선 = 비식별자 (IE).',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — 차수 단정',
          body:
            '"식별자 관계의 부모-자식은 항상 1:1" 보기는 [틀림]. 자식 PK 가 부모 PK 만이면 1:1, 자식이 다른 PK 컬럼을 함께 가지면 1:M.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s10',
      title: '키 5종 + 무결성 3종 + 식별자 vs 키',
      quizId: 'sqld-1-1-cp-10',
      dialogue: [
        { pose: 'wave', text: '식별자가 [논리 단계]에서 쓰는 말이라면, [키(Key)]는 [물리 단계]에서 쓰는 말이야!' },
        { pose: 'think', text: '키는 [5종]! 후보키·기본키·대체키·슈퍼키·외래키.' },
        { pose: 'lightbulb', text: '먼저 [후보키(Candidate)]: [유일성 + 최소성] 둘 다 만족하는 키들의 [후보 풀]!' },
        { pose: 'happy', text: '예: 학생 테이블에서 (학번)·(주민번호) 둘 다 후보키. 둘 중 [대표] 하나가 [기본키(PK)]!' },
        { pose: 'think', text: '[기본키] 외 나머지 후보키들을 [대체키(Alternate Key, AK)] 라고 불러.' },
        { pose: 'lightbulb', text: '[슈퍼키(Super Key)]: 유일성만 만족 — 최소성 X!' },
        { pose: 'happy', text: '예: (학번, 이름) 도 슈퍼키 (학번 자체가 유일하니까 묶어도 유일). 하지만 "이름" 은 불필요 → 최소성 위배.' },
        { pose: 'think', text: '[외래키(Foreign Key, FK)]: 다른 테이블의 PK 를 참조 — 참조 무결성 보장!' },
        { pose: 'lightbulb', text: '무결성 3종도 같이! [개체 무결성] = PK / [참조 무결성] = FK / [도메인 무결성] = CHECK!' },
        { pose: 'happy', text: '암기: "PK 개, FK 참, CHECK 도" — 키와 무결성을 한 번에!' },
        { pose: 'think', text: '시험에 "후보키와 슈퍼키의 차이" 또는 "키와 무결성 짝짓기" 가 단골!' },
        { pose: 'idle', text: '키 vs 무결성 매칭 가자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '식별자가 모델링(논리) 단계에서 쓰는 용어라면, 키(Key)는 물리 단계에서 쓰는 용어. 둘은 같은 개념을 다르게 표현한 것이며 SQLD 1과목에서 둘의 분류가 함께 출제됩니다.',
        },
        {
          kind: 'table',
          title: '키 5종',
          headers: ['키', '유일성', '최소성', '특징'],
          rows: [
            ['후보키(Candidate)', 'O', 'O', 'PK 후보들 — 여러 개 가능'],
            ['기본키(Primary, PK)', 'O', 'O', '후보키 중 대표 — NOT NULL'],
            ['대체키(Alternate, AK)', 'O', 'O', '후보키 중 PK 제외'],
            ['슈퍼키(Super)', 'O', 'X', '유일은 보장하지만 불필요 컬럼 포함'],
            ['외래키(Foreign, FK)', '—', '—', '다른 테이블 PK 참조'],
          ],
        },
        {
          kind: 'table',
          title: '무결성 3종 — "PK 개 · FK 참 · CHECK 도"',
          headers: ['무결성', '의미', '구현'],
          rows: [
            ['개체 무결성', 'PK 는 NULL · 중복 불가', 'PRIMARY KEY 제약'],
            ['참조 무결성', 'FK 는 참조 불가능한 값 불가', 'FOREIGN KEY 제약'],
            ['도메인 무결성', '컬럼 값이 도메인 안', 'CHECK 제약 / 자료형'],
          ],
        },
        {
          kind: 'section',
          title: '예시로 정리 — 학생 테이블',
          body:
            '학생(학번, 주민번호, 이름, 학과ID).\n• 후보키 = {학번}, {주민번호} — 둘 다 유일 + 최소.\n• 기본키 = (학번) — 대표.\n• 대체키 = (주민번호) — PK 외 후보키.\n• 슈퍼키 = (학번, 이름) — 유일은 보장하지만 "이름" 은 불필요 → 최소성 X.\n• 외래키 = (학과ID) — 학과 테이블 참조.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"식별자 = 논리 / 키 = 물리"',
          body:
            '논리 모델링 단계에서는 "주식별자·외부식별자" 라 부르고, 물리 모델링·DDL 단계에서는 "PK·FK·UNIQUE·CHECK" 라 부릅니다. 같은 개념의 두 표현.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — UNIQUE 와 PK 차이',
          body:
            'UNIQUE 와 PK 둘 다 유일성 보장. 차이는 (1) PK 는 NOT NULL 강제, UNIQUE 는 NULL 허용 (2) PK 는 테이블당 1개, UNIQUE 는 여러 개 가능.',
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
  title: '정규화·반정규화·트랜잭션·NULL',
  hook: '좋은 테이블은 "중복 없고 이상 안 생기게" 쪼갠 것. 단, 성능 필요하면 합친다.',
  estimatedMinutes: 12,
  steps: [
    {
      id: 'sqld-1-2-s1',
      title: '이상 현상(Anomaly) 3종 — 정규화의 동기',
      quizId: 'sqld-1-2-cp-01',
      dialogue: [
        { pose: 'wave', text: '왜 [정규화]를 하는지부터 짚자. 핵심은 [이상 현상(Anomaly)] 을 막기 위해서!' },
        { pose: 'think', text: '한 테이블에 너무 많은 정보를 묶어두면 부작용이 생겨. 비유로 들어가자.' },
        { pose: 'lightbulb', text: '예시: "학생-학과" 를 한 테이블에 묶었어. (학번, 학생명, 학과ID, 학과명, 학과사무실).' },
        { pose: 'happy', text: '학생 100 명이 같은 학과 → "학과명" 이 100 번 중복! 학과명을 바꾸려면 100 행 다 갱신해야 해 — 미수정 행 발생 시 모순!' },
        { pose: 'think', text: '이걸 [갱신 이상(Update Anomaly)] 이라 불러.' },
        { pose: 'lightbulb', text: '또 다른 부작용 — [삽입 이상(Insert Anomaly)]!' },
        { pose: 'happy', text: '신규 학과 "AI 융합" 을 만들려는데 학생이 한 명도 없어! 학생 NULL 로 둘 수밖에 — 깔끔히 학과만 등록 불가!' },
        { pose: 'think', text: '마지막 — [삭제 이상(Delete Anomaly)]!' },
        { pose: 'lightbulb', text: '학과 마지막 학생이 자퇴 → 그 행을 삭제하면 학과 정보까지 통째 사라짐! 의도와 다른 손실!' },
        { pose: 'happy', text: '암기 [삽·삭·갱]! 정규화는 이 3가지를 막기 위한 작업!' },
        { pose: 'think', text: '근데 주의! 정규화하면 테이블이 [잘게 쪼개져] JOIN 횟수가 늘어 [조회 성능은 떨어질 수 있음]!' },
        { pose: 'lightbulb', text: '그래서 [반정규화]로 균형을 잡아. 정규화가 "원칙", 반정규화가 "현실 보정".' },
        { pose: 'idle', text: '어느 이상인지 매칭 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '정규화(Normalization)는 데이터 중복을 최소화하고 이상 현상(Anomaly)을 막기 위해 테이블을 의미 단위로 쪼개는 작업입니다. 정규화 → 이상 방지 + 일관성 ↑, 반대급부로 JOIN ↑ → 조회 성능 ↓.',
        },
        {
          kind: 'section',
          title: '실생활 예시 — 학생/학과를 한 테이블에 묶었을 때',
          body:
            '(학번, 학생명, 학과ID, 학과명, 학과사무실) 1 테이블 — 학생 100 명이 같은 학과면 학과명·사무실이 100 번 중복. 학과명 한 글자 바꾸려면 100 행을 다 수정해야 하고, 일부만 수정되면 즉시 모순 발생.',
        },
        {
          kind: 'table',
          title: '이상 현상 3종 — "삽·삭·갱"',
          headers: ['종류', '의미', '학생-학과 예시'],
          rows: [
            ['삽입 이상', '데이터 삽입 시 불필요 값까지 같이 넣어야', '신규 학과 등록하려는데 학생 정보가 없어 NULL 채움'],
            ['삭제 이상', '데이터 삭제 시 의도하지 않은 값도 사라짐', '학과 마지막 학생 삭제 → 학과 정보까지 소실'],
            ['갱신 이상', '일부만 갱신되어 모순 발생', '학과명 변경 시 100 행 중 99 행만 수정됨'],
          ],
        },
        {
          kind: 'keypoints',
          title: '정규화의 효과',
          items: [
            '✓ 중복 최소화 → 저장공간 ↓ + 일관성 ↑',
            '✓ 이상 현상 방지 (3가지 모두)',
            '✓ 무결성 유지',
            '✗ JOIN 횟수 ↑ → 조회 성능 ↓',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '주의 — 조회 성능 트레이드오프',
          body:
            '정규화 = 일관성 ↑ + 조회 성능 ↓. 운영 환경에서 대량 조회가 핵심이면 반정규화로 일부 컬럼 중복 허용. 균형이 모델링의 핵심 판단.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"삽삭갱"',
          body:
            '삽입·삭제·갱신 — 정규화 안 된 테이블의 3가지 부작용. 시험에서 어느 이상인지 매칭 문제로 자주 출제.',
        },
      ],
    },
    {
      id: 'sqld-1-2-s2',
      title: '함수적 종속 — 완전 / 부분 / 이행',
      quizId: 'sqld-1-2-cp-02',
      dialogue: [
        { pose: 'wave', text: '정규형 단계를 이해하려면 [함수적 종속(Functional Dependency)] 부터 알아야 해!' },
        { pose: 'think', text: '"A 의 값을 알면 B 의 값이 [유일하게] 결정된다" 를 [A → B] 로 표기해.' },
        { pose: 'lightbulb', text: '예: "학번 → 학생이름". 학번을 알면 학생 이름은 단 하나로 결정 (동명이인 있어도 학번은 다르니 OK).' },
        { pose: 'happy', text: 'A 를 [결정자(Determinant)], B 를 [종속자(Dependent)] 라 불러.' },
        { pose: 'think', text: '함수적 종속은 [3가지]로 갈려: [완전]·[부분]·[이행]!' },
        { pose: 'lightbulb', text: '[완전 함수적 종속]: 종속자가 기본키 [전체]에 의해 결정.' },
        { pose: 'happy', text: '예: PK = (학번, 과목) 인 수강 테이블에서 "점수" 는 두 컬럼 모두 알아야 결정 → 완전 종속.' },
        { pose: 'think', text: '[부분 함수적 종속]: 종속자가 기본키의 [일부]에만 결정.' },
        { pose: 'lightbulb', text: '같은 PK = (학번, 과목) 에서 "학생이름" 은 학번만 알면 결정 → 부분 종속! 이상 현상 유발!' },
        { pose: 'happy', text: '이걸 제거하는 게 [2NF]! 학생이름을 별도 학생 테이블로 분리.' },
        { pose: 'think', text: '[이행 함수적 종속]: A → B → C 일 때 A → C 가 자동 따라옴.' },
        { pose: 'lightbulb', text: '예: "학번 → 학과ID → 학과명" 일 때 "학번 → 학과명" 이 이행 종속.' },
        { pose: 'happy', text: '이걸 제거하는 게 [3NF]! 학과명을 학과 테이블로 분리.' },
        { pose: 'idle', text: '용어 매칭 + 정규형 연결!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '함수적 종속(FD)은 정규화의 수학적 기반입니다. "X 의 값으로 Y 의 값이 유일하게 정해진다" 를 X → Y 로 표기. 정규형 단계는 결국 어떤 종류의 함수적 종속을 제거하는가의 차이.',
        },
        {
          kind: 'section',
          title: '함수적 종속 — 결정자와 종속자',
          body:
            'A → B 에서 A 가 "결정자(Determinant)" 이고 B 가 "종속자(Dependent)". 한 결정자가 여러 종속자를 결정할 수 있습니다 (예: 학번 → 이름, 학번 → 전공). 종속자가 다중 값이면 함수적 종속이 아니므로 다른 종속(다치 종속) 으로 분류됨.',
        },
        {
          kind: 'table',
          title: '함수적 종속 3가지',
          headers: ['종류', '정의', '예시', '제거 단계'],
          rows: [
            ['완전 함수적 종속', '종속자가 PK 전체에 종속', '(학번,과목) → 점수', '— (1NF 후 만족)'],
            ['부분 함수적 종속', '종속자가 PK 일부에만 종속', '(학번,과목) → 학생이름', '2NF'],
            ['이행 함수적 종속', 'A→B 와 B→C 가 모두 성립', '학번→학과ID→학과명', '3NF'],
          ],
        },
        {
          kind: 'example',
          title: '실 예시 — 수강 테이블',
          body:
            '수강(학번, 과목코드, 학생이름, 점수, 학과ID, 학과명).\n• 점수 — (학번, 과목코드) 모두 알아야 결정 → 완전 종속 ✓\n• 학생이름 — 학번만 알면 결정 → 부분 종속 (PK 일부) ✗ → 2NF 위반\n• 학과명 — 학번 → 학과ID → 학과명 → 이행 종속 ✗ → 3NF 위반',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '정규형과의 연결',
          body:
            '부분 함수 종속 제거 = 2NF · 이행 함수 종속 제거 = 3NF · 모든 결정자가 후보키 = BCNF. 종속의 종류와 정규형이 1:1 대응됨.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '결정자가 후보키여야 BCNF',
          body:
            'BCNF 는 모든 결정자가 후보키여야 한다는 더 엄격한 조건. 일반적인 시험 출제는 3NF 까지지만, 결정자가 후보키가 아닌 케이스도 시험에 등장합니다.',
        },
      ],
    },
    {
      id: 'sqld-1-2-s3',
      title: '정규형 단계 — 1NF → BCNF (도·부·이·결)',
      quizId: 'sqld-1-2-cp-03',
      dialogue: [
        { pose: 'wave', text: '이제 [정규형(Normal Form)] 단계 차례야! 1NF 부터 단계적으로 적용해.' },
        { pose: 'think', text: '[1NF (제1정규형)]: 모든 속성이 [원자값(Atomic)]! 한 셀에 한 의미만!' },
        { pose: 'lightbulb', text: '예 위반: "전화번호" = "010-1234, 010-5678" → 한 셀에 두 번호. 분리해 별도 행 또는 다중값 테이블로!' },
        { pose: 'happy', text: '[2NF]: 1NF + [부분 함수 종속 제거]! 즉 모든 일반 속성이 PK [전체]에 완전 종속!' },
        { pose: 'think', text: '예: PK=(학번,과목)에서 "학생이름" 처럼 학번만으로 결정되는 속성 분리.' },
        { pose: 'lightbulb', text: '[3NF]: 2NF + [이행 함수 종속 제거]! A→B, B→C 면 A→C 도 따라오므로 B→C 부분을 분리!' },
        { pose: 'happy', text: '예: "학번 → 학과ID → 학과명" 에서 학과ID·학과명을 별도 학과 테이블로!' },
        { pose: 'think', text: '[BCNF (Boyce-Codd Normal Form)]: 3NF 의 강화판. [모든 결정자가 후보키]!' },
        { pose: 'lightbulb', text: '시험에 거의 [3NF + BCNF] 까지만 나와. 4NF (다치 종속) · 5NF (조인 종속) 는 거의 X.' },
        { pose: 'happy', text: '암기 [도·부·이·결·다·조]: 1=도메인 / 2=부분 / 3=이행 / B=결정자 / 4=다치 / 5=조인!' },
        { pose: 'think', text: '"두부이겨다줘" 도 같은 의미 — 도부이결다조의 발음 변형!' },
        { pose: 'idle', text: '정규형 정의 매칭 — 시험 단골!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '정규형은 단계적으로 적용됩니다. 각 단계는 특정 종류의 함수적 종속을 제거하는 작업입니다. 시험은 1NF~3NF + BCNF 가 핵심이며 4·5NF 는 거의 출제되지 않습니다.',
        },
        {
          kind: 'table',
          title: '정규형 단계 — "도·부·이·결·다·조"',
          headers: ['정규형', '제거 대상', '핵심 규칙'],
          rows: [
            ['1NF', '비원자값', '모든 속성이 도메인 = 원자값. 반복 그룹 X'],
            ['2NF', '부분 함수 종속', 'PK 전체에 완전 함수 종속'],
            ['3NF', '이행 함수 종속', 'A→B→C 의 B→C 부분 분리'],
            ['BCNF', '비후보키 결정자', '모든 결정자가 후보키'],
            ['4NF', '다치 종속', '한 컬럼에 다중 값 분리'],
            ['5NF', '조인 종속', '조인으로 표현되는 종속 분해'],
          ],
        },
        {
          kind: 'example',
          title: '단계별 적용 예시',
          body:
            '원본: 수강(학번, 학생이름, 과목코드, 과목명, 학과ID, 학과명, 점수, 전화번호[010-1234, 010-5678])\n→ 1NF: 전화번호 분리 (다중값 → 별도 테이블)\n→ 2NF: 학생이름·과목명 분리 (학번 또는 과목코드만으로 결정 — 부분 종속)\n→ 3NF: 학과ID→학과명 분리 (이행 종속)\n→ 결과: 학생, 과목, 학과, 수강(학번,과목코드,점수), 전화번호 5 테이블',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"도부이결다조" / "두부이겨다줘"',
          body:
            '1NF=도메인 / 2NF=부분 / 3NF=이행 / BCNF=결정자 / 4NF=다치 / 5NF=조인. 첫 글자만 외우면 정규형 정의 매칭 문제는 거의 다 풀립니다.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — "정규화는 항상 좋다"',
          body:
            '정규화는 일관성을 위한 도구이지 만능이 아님. 단계 ↑ → 테이블 수 ↑ → JOIN ↑ → 조회 성능 ↓. 운영 환경에선 보통 3NF 정도까지만 적용 후 핵심 부분은 반정규화.',
        },
      ],
    },
    {
      id: 'sqld-1-2-s4',
      title: '반정규화 — 언제 · 어떻게 · 대가',
      quizId: 'sqld-1-2-cp-04',
      dialogue: [
        { pose: 'wave', text: '[반정규화(Denormalization)]는 정규화의 [반대 방향]으로 가는 작업!' },
        { pose: 'think', text: '왜? 정규화로 분해된 테이블이 너무 많아 [JOIN 횟수 폭증] → 조회가 느려질 때!' },
        { pose: 'lightbulb', text: '예: 주문 화면 조회 시 (회원·상품·주문·주문상세·결제) 5 테이블 JOIN. 매번 무겁다면?' },
        { pose: 'happy', text: '주문 테이블에 회원이름·상품명을 [중복 컬럼]으로 복사해 두면 JOIN 없이 1번에 조회!' },
        { pose: 'think', text: '반정규화 [4가지 기법] — 시험 단골!' },
        { pose: 'lightbulb', text: '① [테이블 통합]: 1:1 관계 테이블 합치기. ② [컬럼 중복]: 자주 보는 컬럼 복사.' },
        { pose: 'happy', text: '③ [파생 컬럼 추가]: 합계·평균을 미리 저장. ④ [요약 테이블]: 일·월별 집계 별도 운영.' },
        { pose: 'think', text: '근데 공짜는 없어. [대가] = INSERT/UPDATE 시 여러 곳을 동시 수정해야 함 → [갱신 부담 ↑]!' },
        { pose: 'lightbulb', text: '또 한 곳만 수정되면 [일관성 깨짐] 위험! 반드시 트랜잭션으로 묶어 처리해야!' },
        { pose: 'happy', text: '판단 기준: "조회는 100배 더 자주, 갱신은 거의 없다" 면 반정규화 추천!' },
        { pose: 'idle', text: '어느 상황에 반정규화가 적합한지 매칭!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '반정규화(Denormalization)는 정규화된 테이블을 일부러 다시 합치거나 중복시켜 조회 성능을 끌어올리는 기법입니다. 이름은 "반정규화" 지만 무작위 비정규화가 아니라, 정규화 후 의도적·선별적으로 적용하는 최적화 기법.',
        },
        {
          kind: 'table',
          title: '주요 기법 4가지',
          headers: ['기법', '의미', '예'],
          rows: [
            ['테이블 통합', '1:1 관계 테이블 합치기', '회원 + 회원상세 → 1 테이블'],
            ['컬럼 중복', '자주 조회 컬럼 복사', '주문에 회원이름·상품명 사본'],
            ['파생 컬럼 추가', '집계 결과 미리 저장', '회원에 누적구매액·총주문수 컬럼'],
            ['요약 테이블', '일/월/주 단위 집계 별도', '일별매출_요약 테이블'],
          ],
        },
        {
          kind: 'section',
          title: '판단 기준 — "언제 반정규화 할까?"',
          body:
            '체크리스트: (1) 같은 JOIN 패턴이 반복되어 조회가 느린가? (2) 자주 계산되는 집계가 있는가? (3) 갱신 빈도는 낮고 조회 빈도가 압도적으로 높은가? 셋 다 YES 일 때 적합. 운영 시작 전부터 반정규화하지 말고, 실제 측정 후 병목 지점에만 적용.',
        },
        {
          kind: 'keypoints',
          title: '대가 (반드시 같이 외우기)',
          items: [
            '갱신 부담 ↑ — 한 곳 변경 시 여러 곳 수정 필요',
            '일관성 리스크 ↑ — 일부만 갱신되면 모순',
            '저장 공간 ↑ — 중복 데이터',
            '복잡도 ↑ — 트랜잭션·트리거로 동기화 보장 필요',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '실무 패턴',
          body:
            '읽기 전용 보고서 테이블·통계 테이블은 거의 모든 회사가 운영. 트랜잭션 OLTP 는 정규화 + 분석 OLAP 는 반정규화 (스타·스노우플레이크 스키마) 가 일반적인 분리.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — "반정규화는 모든 성능 문제의 만능키"',
          body:
            'X. 인덱스 추가·쿼리 튜닝·머터리얼라이즈드 뷰 등 다른 방법이 먼저. 반정규화는 가장 마지막 카드.',
        },
      ],
    },
    {
      id: 'sqld-1-2-s5',
      title: '특수 관계 — 계층형 / 상호배타 / 순환',
      quizId: 'sqld-1-2-cp-05',
      dialogue: [
        { pose: 'wave', text: '일반적인 1:1, 1:M, M:N 외에도 모델링에서 자주 보는 [특수 관계]가 있어!' },
        { pose: 'think', text: '① [계층형(Hierarchical)] 데이터 모델!' },
        { pose: 'lightbulb', text: '같은 테이블이 [자기 자신을 참조]하는 구조. 사원-상사, 카테고리-상위카테고리.' },
        { pose: 'happy', text: '예: 사원(사번, 이름, 상사사번 ← 사번 참조). 상사사번 = 같은 사원 테이블의 PK 참조!' },
        { pose: 'think', text: '계층형은 [셀프 조인(Self Join)] 또는 [CONNECT BY (Oracle 계층 질의)] 로 다뤄.' },
        { pose: 'lightbulb', text: '② [상호배타적(Exclusive) 관계]!' },
        { pose: 'happy', text: '한 자식이 [두 부모 중 하나]만 가질 수 있음. 예: 결제(결제ID, 결제수단_카드 OR 결제수단_계좌).' },
        { pose: 'think', text: 'ERD 에서 두 관계선을 호(arc) 로 묶어 표시. 한 결제는 카드 또는 계좌 하나만 참조.' },
        { pose: 'lightbulb', text: '③ [순환 관계(Recursive)]: 같은 엔터티에서 자기 자신을 참조 — 계층형의 일종!' },
        { pose: 'happy', text: '시험 함정: "상호배타적 관계는 배타적 상속이 불가능하다" 는 [틀림]! 가능해.' },
        { pose: 'idle', text: '특수 관계 매칭 가자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '대부분의 관계는 단순한 1:1 / 1:M / M:N 으로 표현됩니다. 그런데 모델링하다 보면 "사원-상사" 처럼 같은 엔터티끼리 연결되거나, "결제수단" 처럼 두 부모 중 하나만 선택되는 특수 패턴이 등장합니다.',
        },
        {
          kind: 'table',
          title: '특수 관계 3종',
          headers: ['관계', '의미', '예시', '구현'],
          rows: [
            ['계층형', '같은 테이블 자기 참조', '사원-상사, 카테고리-상위', 'CONNECT BY / 셀프 조인'],
            ['상호배타적', '두 부모 중 하나만 상속', '결제 ← 카드 | 계좌', 'ERD 의 arc 표기 + CHECK 제약'],
            ['순환 관계', '자기 엔터티가 자기 참조', '게시글-답글', '재귀 FK'],
          ],
        },
        {
          kind: 'section',
          title: '계층형 — 가장 흔한 특수 관계',
          body:
            '대부분의 시스템에 등장: 조직 구조 (사원-상사), 상품 분류 (대분류-중분류-소분류), 게시판 답글 (글-답글-답답글). 처리 방법은 (1) 셀프 조인 — FROM 절에 같은 테이블을 두 번 별칭으로, (2) CONNECT BY (Oracle) — START WITH + CONNECT BY PRIOR 로 트리 탐색.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '실무 — 계층형 처리 방식',
          body:
            'Oracle 외엔 CONNECT BY 가 없어 재귀 CTE (WITH RECURSIVE) 또는 셀프 조인을 사용. 깊이가 정해진 카테고리는 별도 컬럼 (대분류·중분류·소분류) 으로 비정규화하기도 함.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — "상호배타적 관계는 불가"',
          body:
            '오답입니다. 상호배타적 관계는 충분히 가능하며 실무에서 흔하게 사용됨. ERD 의 호(arc) 표기와 CHECK 제약으로 강제.',
        },
      ],
    },
    {
      id: 'sqld-1-2-s6',
      title: '트랜잭션 ACID + 격리수준 4종',
      quizId: 'sqld-1-2-cp-06',
      dialogue: [
        { pose: 'wave', text: '[트랜잭션(Transaction)]은 DB 에서 [하나의 논리 작업 단위]!' },
        { pose: 'think', text: '예: 계좌이체 = 송금자 잔액 - 1000 + 수신자 잔액 + 1000. 둘 다 성공해야지 한쪽만 성공하면 큰일!' },
        { pose: 'lightbulb', text: '이 "전부 성공 or 전부 취소" 가 [원자성(Atomicity)] — ACID 의 A!' },
        { pose: 'happy', text: 'ACID 4특성: [원자성·일관성·고립성·지속성]!' },
        { pose: 'think', text: '[A] Atomicity (원자성): All or Nothing!' },
        { pose: 'lightbulb', text: '[C] Consistency (일관성): 실행 전후 DB 가 [유효한 상태]! 제약조건 위배 X.' },
        { pose: 'happy', text: '[I] Isolation (고립성): 동시 실행 트랜잭션끼리 [간섭 X]!' },
        { pose: 'think', text: '[D] Durability (지속성): COMMIT 후엔 [시스템 오류에도] 데이터 유지!' },
        { pose: 'lightbulb', text: '암기 [원·일·고·지]! "동시에 실행돼도 영향 안 줌" = [고립성]!' },
        { pose: 'happy', text: '격리수준 4종: [Read Uncommitted < Read Committed < Repeatable Read < Serializable]!' },
        { pose: 'think', text: '격리수준 ↑ → 일관성 ↑ + 성능 ↓!' },
        { pose: 'lightbulb', text: '부작용 3종: [Dirty Read]·[Non-Repeatable Read]·[Phantom Read]!' },
        { pose: 'happy', text: 'Dirty=미완료 데이터 읽기 / NonRepeatable=같은 쿼리 결과 달라짐 / Phantom=같은 쿼리에 행 수 달라짐!' },
        { pose: 'idle', text: '"동시 실행 간섭 X" 는 어느 특성? 매칭!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '트랜잭션은 데이터베이스에서의 하나의 논리적 작업 단위. 여러 SQL 명령이 묶여 한 묶음으로 처리되며, 묶음 단위로 모두 성공(COMMIT) 또는 모두 취소(ROLLBACK) 됩니다. ACID 는 이 묶음이 신뢰성 있게 처리되기 위한 4가지 보장.',
        },
        {
          kind: 'section',
          title: '계좌이체 예시 — 왜 ACID 가 필요한가',
          body:
            'A 가 B 에게 1000원 이체:\n1) UPDATE 계좌 SET 잔액 = 잔액-1000 WHERE 이름="A"\n2) UPDATE 계좌 SET 잔액 = 잔액+1000 WHERE 이름="B"\n중간에 오류가 나서 1)만 실행되면 A 돈만 사라지고 B 는 받지 못함 → 큰 사고. 트랜잭션으로 묶어 둘 다 COMMIT 또는 둘 다 ROLLBACK 보장 = 원자성.',
        },
        {
          kind: 'table',
          title: 'ACID 4특성',
          headers: ['특성', '풀이', '의미'],
          rows: [
            ['Atomicity', '원자성', 'All or Nothing — 전부 성공/전부 취소'],
            ['Consistency', '일관성', '실행 전후 DB 가 유효한 상태 (제약조건 위배 X)'],
            ['Isolation', '고립성', '동시 실행 트랜잭션끼리 서로 영향 X'],
            ['Durability', '지속성', 'COMMIT 결과는 영구 저장 (장애에도 유지)'],
          ],
        },
        {
          kind: 'table',
          title: '격리수준 4종 + 부작용',
          headers: ['수준', 'Dirty', 'NonRepeatable', 'Phantom'],
          rows: [
            ['Read Uncommitted', '발생', '발생', '발생'],
            ['Read Committed', 'X', '발생', '발생'],
            ['Repeatable Read', 'X', 'X', '발생'],
            ['Serializable', 'X', 'X', 'X'],
          ],
        },
        {
          kind: 'keypoints',
          title: '부작용 3종 — 이름의 의미',
          items: [
            'Dirty Read — 다른 트랜잭션의 [미커밋(미완료)] 변경을 읽음',
            'Non-Repeatable Read — 같은 행을 두 번 읽었더니 [값이 달라짐]',
            'Phantom Read — 같은 조건으로 두 번 읽었더니 [행 개수가 달라짐]',
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"원·일·고·지"',
          body:
            'Atomicity·Consistency·Isolation·Durability. "동시 실행 간섭 X" 는 [고립성(Isolation)] 매칭 — 시험에서 가장 자주 묻는 매칭.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '실무 — 격리수준 선택',
          body:
            '대부분의 OLTP 는 Read Committed 가 기본 (Oracle 기본값). 금융처럼 강한 일관성 필요 시 Serializable. 격리 ↑ → 충돌·락 대기 ↑ → 처리량 ↓.',
        },
      ],
    },
    {
      id: 'sqld-1-2-s7',
      title: 'NULL — 본성 · 산술 · 집계 · 정렬',
      quizId: 'sqld-1-2-cp-07',
      dialogue: [
        { pose: 'wave', text: '[NULL]은 SQL 의 가장 까다로운 개념! 시험·실무 둘 다 단골 함정!' },
        { pose: 'think', text: 'NULL = "값이 없음" 또는 "미정의" 의미. [0 ≠ NULL]·[빈 문자열 \'\' ≠ NULL]!' },
        { pose: 'lightbulb', text: '핵심: NULL 과의 [모든 비교]는 [UNKNOWN]! TRUE 가 아니라 UNKNOWN!' },
        { pose: 'happy', text: 'col = NULL → UNKNOWN. col != NULL → UNKNOWN. col = NULL OR col != NULL → UNKNOWN.' },
        { pose: 'think', text: '그래서 [IS NULL] · [IS NOT NULL] 만 사용해야 정확!' },
        { pose: 'lightbulb', text: 'NULL 의 [산술]: NULL + 1 = NULL. NULL × 0 = NULL. 모든 연산 결과가 NULL.' },
        { pose: 'happy', text: 'NULL 의 [집계]: SUM, AVG, MIN, MAX 모두 NULL [제외]하고 계산!' },
        { pose: 'think', text: '단! [COUNT(*)] 는 NULL 행도 [포함]해서 셈! [COUNT(컬럼)] 은 NULL 제외!' },
        { pose: 'lightbulb', text: 'AVG 는 NULL 을 \"분모\" 에서 제외 — NVL(컬럼,0) 으로 NULL → 0 변환하면 분모가 늘어 평균이 다름!' },
        { pose: 'happy', text: '정렬: [Oracle] 은 NULL 을 [최댓값] 취급 (ASC 시 끝). [SQL Server] 는 [최솟값] (ASC 시 처음)!' },
        { pose: 'think', text: '제어 가능: ORDER BY col DESC NULLS LAST / NULLS FIRST 로 명시!' },
        { pose: 'lightbulb', text: 'ERD 표기: IE 는 NULL 여부 [확인 불가], Barker 는 [o/*] 로 명시 (o=허용, *=불허)!' },
        { pose: 'idle', text: 'NULL 정렬 + 집계 함정 매칭!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'NULL 은 "값이 없음 (unknown/missing)" 을 의미합니다. 0 이나 빈 문자열 \'\' 과 분명히 다르며 SQL 의 3-값 논리 (TRUE/FALSE/UNKNOWN) 의 핵심. 시험·실무 모두에서 가장 함정이 많은 영역.',
        },
        {
          kind: 'keypoints',
          title: 'NULL 의 핵심 5가지 진리',
          items: [
            '① NULL ≠ 0, NULL ≠ \'\'',
            '② NULL = NULL → UNKNOWN (TRUE 아님)',
            '③ NULL + 1 = NULL (모든 산술 연산이 NULL)',
            '④ 집계함수 SUM/AVG/MIN/MAX 는 NULL 무시',
            '⑤ COUNT(*) 는 NULL 포함, COUNT(컬럼) 은 NULL 제외',
          ],
        },
        {
          kind: 'example',
          title: 'AVG · NVL 함정',
          body:
            '점수 = (90, 80, NULL, NULL, 70).\nAVG(점수) = (90+80+70) / 3 = 80 (NULL 행은 분모에서 제외)\nAVG(NVL(점수, 0)) = (90+80+0+0+70) / 5 = 48 (NULL → 0 으로 분모 늘어남, 결과 다름!)\n→ AVG 에 NVL 을 쓰면 결과가 달라지므로 의도가 다른 두 표현입니다.',
        },
        {
          kind: 'table',
          title: 'NULL 정렬 (ASC 기본값)',
          headers: ['DBMS', 'ASC 시 NULL 위치', 'DESC 시'],
          rows: [
            ['Oracle', '맨 끝 (NULLS LAST)', '맨 앞 (NULLS FIRST)'],
            ['SQL Server', '맨 앞 (NULLS FIRST)', '맨 끝 (NULLS LAST)'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'NULL 처리 함수 빠르게',
          body:
            'NVL(c, repl) = NULL 이면 repl. NVL2(c, x, y) = c가 NOT NULL → x, NULL → y. NULLIF(a, b) = 같으면 NULL. COALESCE(a, b, c) = 첫 NOT NULL.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'NULL = NULL 함정',
          body:
            'WHERE col = NULL 은 "0행 반환" — 항상 UNKNOWN 이라 매칭 행이 없음. 의도한 "NULL인 행 찾기" 는 IS NULL 사용. CASE col WHEN NULL THEN ... 도 같은 이유로 동작 X — Searched CASE 또는 DECODE 사용.',
        },
      ],
    },
    {
      id: 'sqld-1-2-s8',
      title: '본질식별자 vs 인조식별자 — 실무 선택 기준',
      quizId: 'sqld-1-2-cp-08',
      dialogue: [
        { pose: 'wave', text: '식별자는 [본질(Natural)] vs [인조(Surrogate)] 두 종류!' },
        { pose: 'think', text: '[본질식별자]: 업무에 [원래 존재]하는 식별자.' },
        { pose: 'lightbulb', text: '예: 주민번호, 사업자등록번호, 학번, 운전면허번호 — 사회 시스템이 이미 부여한 ID!' },
        { pose: 'happy', text: '[인조식별자]: 시스템이 [인위적]으로 생성한 식별자.' },
        { pose: 'think', text: '예: 시퀀스 1·2·3·4..., UUID (a1b2-c3d4-...) — 의미는 없지만 [고유성·불변성] 보장!' },
        { pose: 'lightbulb', text: '본질의 장점: [업무 의미가 명확]! 사람이 봐도 "주민번호구나" 바로 인식!' },
        { pose: 'happy', text: '본질의 단점: ① [개인정보 노출 리스크] ② [값 변경 가능성] (예: 외국인등록번호 변경) ③ [정책 변화 영향]!' },
        { pose: 'think', text: '인조의 장점: ① [비즈니스 로직과 분리] ② [개인정보 X] ③ [변경 리스크 X]!' },
        { pose: 'lightbulb', text: '인조의 단점: ① [중복 데이터 가능성] (다른 컬럼이 같아도 ID 가 달라 중복) ② [불필요 인덱스 부담]!' },
        { pose: 'happy', text: '실무 권장: [인조 PK + 본질 UNIQUE] 조합! id 는 인조, 주민번호는 별도 UNIQUE 컬럼!' },
        { pose: 'idle', text: '인조식별자 장단점 매칭!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '식별자를 PK 로 정할 때 "업무에 이미 있는 값을 쓸까 (본질)" 또는 "인위적인 ID 를 만들까 (인조)" 의 선택 — 실무에서 가장 자주 부딪히는 모델링 결정.',
        },
        {
          kind: 'table',
          title: '본질 vs 인조',
          headers: ['항목', '본질식별자', '인조식별자'],
          rows: [
            ['생성 방식', '업무에 이미 존재', '시스템이 인위 생성'],
            ['대표 예', '주민번호, 학번, 사업자번호', 'id, 시퀀스, UUID'],
            ['장점', '업무 의미 명확, 추가 컬럼 불필요', '변경 리스크 X, 개인정보 X, 단순'],
            ['단점', '값 변경 가능, 개인정보 이슈', '중복 데이터 발생 가능, 인덱스 부담'],
          ],
        },
        {
          kind: 'section',
          title: '왜 인조식별자가 표준이 됐나',
          body:
            '주민번호는 1968 년 도입 후 여러 차례 정책이 바뀌었고 (외국인 ID·임시 식별번호 등) 시스템마다 처리가 달라졌습니다. 또 GDPR·개인정보보호법 강화로 PK 에 직접 노출은 위험. 그래서 PK 는 의미 없는 인조 ID, 본질 식별자는 별도 보호 컬럼이 표준이 됐습니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '실무 패턴 — "인조 PK + 본질 UNIQUE"',
          body:
            'CREATE TABLE 학생 ( id BIGSERIAL PRIMARY KEY, 주민번호 VARCHAR(13) UNIQUE, ... ). PK 는 인조, 본질식별자는 UNIQUE 제약으로. 변경·정책 변화에 강함.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — 인조식별자 단점 누락',
          body:
            '"인조식별자는 무조건 좋다" 는 X. "데이터 중복 가능성" + "불필요 인덱스 부담" 두 가지가 단점. 시험에 단점을 누락한 보기가 자주 등장.',
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

// ================================================================
// SQLD · 2과목 · 관리 구문 (DML / TCL / DDL / DCL)
// ================================================================

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
  SQLD_2_3,
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

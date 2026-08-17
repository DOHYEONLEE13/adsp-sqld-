/**
 * 게임 섹션 타입 정의.
 *
 * 4-tier progression:
 *   Galaxy (과목 선택)  →  Planet (챕터 선택)
 *     →  Zone (토픽 선택)  →  Quest (문제 풀이)  →  Result
 */

import type { MultipleChoiceQuestion, Subject } from '@/types/question';

export type GameScreen =
  | { kind: 'galaxy' }
  | { kind: 'planet'; subject: Subject }
  | {
      kind: 'zone';
      subject: Subject;
      chapter: number;
      /**
       * 진입 시 자동 강조할 topic — 펄스 애니메이션으로 사용자 안내.
       * "나의 약점" 탭에서 단원 노드 클릭 시 사용. 설정되면 ZoneScreen mount 후
       * 일정 시간 (10초) 펄스 후 자동 페이드.
       */
      highlightTopic?: string;
      /** topic 안에서 정확히 강조할 원본 step index. 없으면 첫 미완료 step. */
      highlightStepIdx?: number;
      /** 강조 출처 문항 id — 추적/접근성 라벨용. */
      highlightQuestionId?: string;
      /** 강조 이유. 약점 탭은 red, 학습 복귀는 과목 accent로 표시. */
      highlightReason?: 'weakness' | 'resume';
    }
  | {
      kind: 'lesson';
      subject: Subject;
      chapter: number;
      topic: string;
      /** 토픽 안에서 시작할 step index (0-based). 미지정 시 0. Zone 의 step
       *  노드에서 직접 진입할 때 사용. 지정되면 single-step 모드로 동작 —
       *  한 step 끝나면 onBack 으로 Zone 복귀. */
      stepIdx?: number;
      /** N회독 차수. 1=원본, 2/3=변형 (진입 시 reminder 카드 노출). 기본 1. */
      passNumber?: number;
      /** Zone 노드에서 진입 전에 에너지 차감을 마친 경우 중복 차감 방지. */
      energyPrepaid?: boolean;
    }
  | { kind: 'quest'; session: QuestSession }
  | { kind: 'result'; summary: QuestSummary }
  | { kind: 'review' };

/**
 * 세션 진행 방식.
 *   - play  : 기본. 선택 즉시 정답/오답 반영 + 해설.
 *   - learn : 해설을 먼저 노출 → 확인 → 선택. 처음 배울 때.
 *   - test  : 타이머 · 즉답 피드백 없음 · 끝에 한꺼번에 채점.
 */
export type FlowMode = 'play' | 'learn' | 'test';

/** 현재 iteration: 객관식만 다룹니다. */
export interface QuestSession {
  subject: Subject;
  chapter: number;
  chapterTitle: string;
  /** null 이면 챕터 전체 토픽에서 섞어 뽑은 세션. */
  topic: string | null;
  /** 진행 방식. 기본 'play'. */
  flow: FlowMode;
  /**
   * 세션 라벨. "Daily Mission" / "약점 집중" 같이 화면 헤더/이력용.
   * 비어 있으면 화면이 flow/topic 기반으로 fallback 합니다.
   */
  label?: string;
  /**
   * N회독 차수 (1~). 1이 기본 (1회독 진행 중).
   * Pass 시스템: docs/n-pass-design.md 참고.
   * 챕터 회독 완료 (정답률 ≥ 75%) 시 다음 회독 진입 가능.
   */
  passNumber: number;
  questions: MultipleChoiceQuestion[];
  sessionToken?: string;
  remainingQuota?: number | null;
  isUnlimitedQuestions?: boolean;
  /** 현재 풀고 있는 문제 index (0-based). */
  index: number;
  answers: QuestAnswer[];
  startedAt: number;
}

export interface QuestAnswer {
  questionId: string;
  /** 선택한 선지 index. -1 이면 시간 초과 등으로 미응답 (오답 처리). */
  chosenIndex: number;
  correct: boolean;
  /** 이 문제에만 소요된 시간 (ms). */
  timeMs: number;
}

export interface QuestSummary {
  subject: Subject;
  chapter: number;
  chapterTitle: string;
  topic: string | null;
  total: number;
  correctCount: number;
  /** 정답률 0~1 */
  accuracy: number;
  totalTimeMs: number;
  /** 결과 화면·SessionRecord 에 표시될 라벨 (예: "챕터 1 모의고사 1"). */
  label?: string;
  /** N회독 차수 (1~). Pass 시스템과 함께 chapter completion 판정에 사용. */
  passNumber: number;
  sessionToken?: string;
  /** 서버 권위 세션을 이미 제출해 결과를 받은 summary. 중복 RPC 제출 방지용. */
  serverSubmitted?: boolean;
  answers: Array<
    QuestAnswer & {
      question: MultipleChoiceQuestion;
    }
  >;
}

/** Zone 화면에서 보여줄 토픽 카드용 집계. */
export interface ZoneInfo {
  topic: string;
  questionCount: number;
}

/** Planet 화면에서 보여줄 챕터 카드용 집계. */
export interface PlanetInfo {
  chapter: number;
  title: string;
  topics: string[];
  questionCount: number;
}

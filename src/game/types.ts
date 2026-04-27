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
  | { kind: 'zone'; subject: Subject; chapter: number }
  | {
      kind: 'lesson';
      subject: Subject;
      chapter: number;
      topic: string;
      /** 토픽 안에서 시작할 step index (0-based). 미지정 시 0. Zone 의 step
       *  노드에서 직접 진입할 때 사용. 지정되면 single-step 모드로 동작 —
       *  한 step 끝나면 onBack 으로 Zone 복귀. */
      stepIdx?: number;
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
  questions: MultipleChoiceQuestion[];
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

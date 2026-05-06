/**
 * sm2Algorithm — SM-2 변형 알고리즘 핵심.
 *
 * Phase 4 Step 4 — 망각 곡선 시스템.
 *
 * 알고리즘 명세 (리서치 3-1절, 변경 금지):
 *
 *   정답 시:
 *     - current_interval 진행: 0 → 1 → 3 → 7 → 14 → 30
 *     - 30일 통과 → status='mastered' (자동 출제 X)
 *     - ease_factor + 0.1 (max 3.0)
 *     - consecutive_correct + 1, consecutive_wrong = 0
 *     - due_date = today + next_interval
 *
 *   오답 시:
 *     - current_interval 리셋 → 1일
 *     - ease_factor - 0.2 (min 1.3)
 *     - consecutive_wrong + 1, consecutive_correct = 0
 *     - consecutive_wrong ≥ 3 → status='paused', "lesson 다시 보기" 추천
 *     - due_date = today + 1일
 *
 *   paused 상태에서 진입:
 *     - paused 는 외부 (UI) 가 status 만 active 로 되돌리고 본 함수 호출
 *     - 본 함수는 status 를 직접 paused 로 만들 뿐 paused 입력에 특별 처리 X
 */

import type {
  ReviewItem,
  ReviewIntervalDays,
  ReviewUpdateInput,
  ReviewUpdateOutput,
} from '@/types/learning/reviewItem';
import { INTERVAL_PROGRESSION } from '@/types/learning/reviewItem';
import { updateEaseFactor } from './easeFactor';

/** 연속 오답 임계값 — 도달 시 paused 전환 + lesson 다시 보기 추천. */
export const CONSECUTIVE_WRONG_THRESHOLD = 3;

/** 1일 = ms. */
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 정답/오답 결과를 반영해 ReviewItem 갱신.
 *
 * @param input - 현재 ReviewItem + 풀이 결과 + 풀이 시각
 * @returns 갱신된 ReviewItem + lesson 재학습 추천 여부
 */
export function applyAttempt(input: ReviewUpdateInput): ReviewUpdateOutput {
  const { current, is_correct, attempted_at } = input;

  if (is_correct) {
    return applyCorrect(current, attempted_at);
  }
  return applyWrong(current, attempted_at);
}

/** 정답 처리. */
function applyCorrect(current: ReviewItem, attempted_at: Date): ReviewUpdateOutput {
  const ease_factor = updateEaseFactor(current.ease_factor, true);
  const consecutive_correct = current.consecutive_correct + 1;
  const consecutive_wrong = 0;

  // interval 진행
  const nextInterval = nextIntervalAfterCorrect(current.current_interval);

  // 30일 통과 → mastered (current_interval = 30 인 항목이 정답 시)
  // INTERVAL_PROGRESSION[30] = 30 (이미 mastered 단계). status 만 mastered 로 전환.
  const isReachedMastered = current.current_interval === 30;

  const next: ReviewItem = {
    ...current,
    current_interval: nextInterval,
    ease_factor,
    consecutive_correct,
    consecutive_wrong,
    last_attempted_at: attempted_at,
    status: isReachedMastered ? 'mastered' : current.status === 'paused' ? 'active' : current.status,
    due_date: isReachedMastered ? null : addDays(attempted_at, nextInterval),
  };

  return {
    next,
    recommend_lesson_replay: false,
  };
}

/** 오답 처리. */
function applyWrong(current: ReviewItem, attempted_at: Date): ReviewUpdateOutput {
  const ease_factor = updateEaseFactor(current.ease_factor, false);
  const consecutive_wrong = current.consecutive_wrong + 1;
  const consecutive_correct = 0;

  // interval 리셋: 1일 후 다시
  const nextInterval: ReviewIntervalDays = 1;

  // 3회 연속 오답 → paused + lesson 다시 보기 추천
  const isPaused = consecutive_wrong >= CONSECUTIVE_WRONG_THRESHOLD;

  const next: ReviewItem = {
    ...current,
    current_interval: nextInterval,
    ease_factor,
    consecutive_correct,
    consecutive_wrong,
    last_attempted_at: attempted_at,
    status: isPaused ? 'paused' : 'active',
    due_date: isPaused ? null : addDays(attempted_at, nextInterval),
  };

  return {
    next,
    recommend_lesson_replay: isPaused,
  };
}

/**
 * 정답 시 다음 interval 계산.
 *
 *   0 → 1
 *   1 → 3
 *   3 → 7
 *   7 → 14
 *   14 → 30
 *   30 → 30 (mastered, 더 이상 진행 X)
 */
export function nextIntervalAfterCorrect(
  current: ReviewIntervalDays,
): ReviewIntervalDays {
  return INTERVAL_PROGRESSION[current];
}

/**
 * 새 ReviewItem 생성 — 사용자가 처음 푼 문제에 대해 1단계 등록.
 *
 * @param userId - 사용자 ID
 * @param questionId - 문항 ID
 * @param isCorrect - 첫 풀이 결과
 * @param easeInitial - ease_factor 초기값 (recommendEaseFactor / determineEaseFactorVariant)
 * @param easeVariant - variant 라벨 (A/B 추적)
 * @param attemptedAt - 풀이 시각
 */
export function createInitialReviewItem(
  userId: string,
  questionId: string,
  isCorrect: boolean,
  easeInitial: number,
  easeVariant: ReviewItem['ease_factor_variant'],
  attemptedAt: Date,
): ReviewItem {
  // 첫 풀이부터 정답이면 1일 후 다시. 오답이면 1일 후 다시 (둘 다 1일).
  // current_interval 0 → 1 (정답) / 0 (오답 후 1일 due) — 명시 단순화: 1.
  const nextInterval: ReviewIntervalDays = 1;
  const consecutive_correct = isCorrect ? 1 : 0;
  const consecutive_wrong = isCorrect ? 0 : 1;

  return {
    user_id: userId,
    question_id: questionId,
    current_interval: nextInterval,
    ease_factor: easeInitial,
    consecutive_correct,
    consecutive_wrong,
    due_date: addDays(attemptedAt, nextInterval),
    last_attempted_at: attemptedAt,
    status: 'active',
    ease_factor_variant: easeVariant,
  };
}

/** Date + N일 (ms). */
export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * DAY_MS);
}

/**
 * paused 상태 항목을 다시 active 로 — 사용자가 lesson 재학습 후 "이제 다시 풀어볼게" 호출.
 * interval 1일로 리셋.
 */
export function resumeFromPaused(
  item: ReviewItem,
  resumedAt: Date,
): ReviewItem {
  if (item.status !== 'paused') return item;
  return {
    ...item,
    status: 'active',
    current_interval: 1,
    consecutive_wrong: 0,
    due_date: addDays(resumedAt, 1),
    last_attempted_at: resumedAt,
  };
}

/**
 * integration — lesson/quest 풀이 결과를 ReviewItem 시스템에 자동 반영.
 *
 * Phase 4 Step 4 — DialogueLesson, QuestScreen 등 풀이 진입점에서 호출.
 *
 * 정책 (사용자 결정):
 *   - onboarding 미완료 게스트: SM-2 작동 X (데이터 부족 — 페르소나/배경 모름)
 *     → recordReviewAttempt 가 no-op 반환
 *   - onboarding 완료 사용자:
 *     첫 풀이 → createInitialReviewItem (ease_factor variant 자동 결정)
 *     이후 → applyAttempt (SM-2 변형)
 *
 * 게스트 사용자도 기존 review.ts 의 Leitner box 시스템은 그대로 작동 (questionStats 기반).
 * SM-2 는 페르소나 정보 필요해서 onboarding 의존.
 */

import { findReviewItem, upsertReviewItem } from './reviewItemStorage';
import { applyAttempt, createInitialReviewItem } from './sm2Algorithm';
import { determineEaseFactorVariant, easeFactorInitial } from './easeFactor';
import { loadOnboardingResult } from '@/game/onboarding/onboardingStorage';

/** mock 단계의 user_id — Step 5/6 에서 인증된 user.id 로 전환. */
const MOCK_USER_ID = 'guest';

/** lesson/quest 풀이 1건을 SM-2 시스템에 반영. */
export function recordReviewAttempt(
  questionId: string,
  isCorrect: boolean,
  attemptedAt: Date = new Date(),
): { recommendLessonReplay: boolean; updated: boolean } {
  const onboarding = loadOnboardingResult();
  // 게스트 — onboarding 미완료 → SM-2 미작동 (기존 review.ts 만 사용)
  if (!onboarding) return { recommendLessonReplay: false, updated: false };

  const existing = findReviewItem(MOCK_USER_ID, questionId);

  if (!existing) {
    // 첫 풀이 → ReviewItem 생성 (페르소나/배경 기반 ease_factor variant 자동 결정)
    const variant = determineEaseFactorVariant(
      onboarding.persona,
      onboarding.background,
    );
    const ease = easeFactorInitial(variant);
    const newItem = createInitialReviewItem(
      MOCK_USER_ID,
      questionId,
      isCorrect,
      ease,
      variant,
      attemptedAt,
    );
    upsertReviewItem(newItem);
    return { recommendLessonReplay: false, updated: true };
  }

  // 기존 — applyAttempt (5-tier progression 또는 1d 리셋)
  const result = applyAttempt({
    current: existing,
    is_correct: isCorrect,
    attempted_at: attemptedAt,
  });
  upsertReviewItem(result.next);
  return {
    recommendLessonReplay: result.recommend_lesson_replay,
    updated: true,
  };
}

/** SM-2 사용 가능 여부 — onboarding 완료 시 true. */
export function isSm2Active(): boolean {
  return loadOnboardingResult() !== null;
}

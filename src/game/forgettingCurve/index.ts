/**
 * forgettingCurve — 망각 곡선 시스템 public API.
 *
 * Phase 4 Step 4. caller (QuestsPage / GamePage) 가 본 모듈을 통해 사용.
 */

// 알고리즘
export {
  applyAttempt,
  createInitialReviewItem,
  resumeFromPaused,
  nextIntervalAfterCorrect,
  CONSECUTIVE_WRONG_THRESHOLD,
} from './sm2Algorithm';
export {
  determineEaseFactorVariant,
  easeFactorInitial,
  updateEaseFactor,
  EASE_FACTOR_MIN,
  EASE_FACTOR_MAX,
} from './easeFactor';
export {
  generateDailyReviewQueue,
  detectQueueOverflow,
  autoMasterStaleItems,
} from './reviewQueue';
export {
  handleInactivity,
  resetQueue,
  INACTIVITY_THRESHOLDS,
  type InactivityAction,
} from './inactivityHandler';

// 영속성
export {
  saveReviewItems,
  loadReviewItems,
  loadActiveReviewItems,
  upsertReviewItem,
  findReviewItem,
  clearReviewItems,
  replaceAllReviewItems,
} from './reviewItemStorage';
export {
  markActive,
  getLastActive,
  inactivityDays,
  clearLastActive,
} from './lastActive';
export {
  getQuestionMeta,
  getQuestionMetaMap,
} from './questionMetaCache';

// 통합 헬퍼
export { recordReviewAttempt, isSm2Active } from './integration';

// UI
export { default as ReviewQuestCard } from './ReviewQuestCard';
export { default as InactivityModal } from './InactivityModal';
export { default as InAppBanner, clearBannerDismiss } from './InAppBanner';

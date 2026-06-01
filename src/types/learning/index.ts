/**
 * Phase 4 — 학습 시스템 타입 (re-export).
 *
 * 단일 진실의 원천: `Phase4_LearningSystem_Research_v2_Final.md`.
 * 결정 이력: 리서치 13절.
 *
 * Phase 4 Step 1 산출물:
 *   - userProfile.ts    UserProfile, Persona, UserBackground, StudyStyle, PremiumState, RewardCredit
 *   - attempt.ts        Attempt, AttemptContext, AttemptResult
 *   - reviewItem.ts     ReviewItem, ReviewIntervalDays, ReviewQueueItem, ReviewUpdate*, DAILY_REVIEW_LIMITS, INTERVAL_PROGRESSION
 *   - studyPlan.ts      StudyPlan, ReviewerStudyPlan, StudyPlanWeek, StudyPlanChapter, StudyPlanReplan, PlanMode, REVIEW_BUFFER_DAYS, TIME_RATIO_THRESHOLDS
 *   - cohortStats.ts    CohortStats, EXPECTED_PROGRESS_BY_DDAY, COHORT_ENABLE_THRESHOLD, PASSERS_ENABLE_THRESHOLD
 *   - passResponse.ts   PassResponse, PassResult, PassResponseFormInput, REWARD_DAYS_PER_RESPONSE, RESPONSE_WINDOW_DAYS
 *   - diagnostic.ts     DiagnosticSession, DiagnosticResult, ChapterDiagnosticResult, WeaknessLevel, DiagnosticConfig, WEAKNESS_THRESHOLDS, DIAGNOSTIC_DEFAULT_CONFIG
 *   - premium.ts        PremiumPlan, PremiumPlanType, PremiumEntitlements, BEGINNER_PREMIUM_PLAN, REVIEWER_PREMIUM_PLANS, FREE_ENTITLEMENTS, PREMIUM_ENTITLEMENTS, REVIEWER_FREE_THRESHOLD, pickReviewerPlan
 *
 * 사용:
 *   import type { UserProfile, StudyPlan } from '@/types/learning';
 */

export * from './userProfile';
export * from './attempt';
export * from './reviewItem';
export * from './studyPlan';
export * from './cohortStats';
export * from './passResponse';
export * from './diagnostic';
export * from './premium';
export * from './exam';

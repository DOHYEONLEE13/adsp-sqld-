/**
 * studyPlan — 학습 플랜 시스템 public API.
 *
 * Phase 4 Step 3.
 *
 * App.tsx / GamePage / OnboardingFlow 가 이 모듈을 통해 학습 플랜 기능 사용.
 */

export { generateBeginnerPlan, generateReviewerPlan } from './studyPlanGenerator';
export {
  trackProgress,
  getCurrentWeekProgress,
  applyProgressToPlan,
  type ProgressSnapshot,
  type ChapterProgress,
} from './progressTracker';
export {
  saveStudyPlan,
  loadStudyPlan,
  clearStudyPlan,
  hasStudyPlan,
} from './studyPlanStorage';
export { buildPlanFromOnboarding } from './fromOnboarding';
export {
  calculateRequiredHours,
  calculateAvailableMinutes,
  evaluatePlanFeasibility,
  formatMinutes,
} from './timeAllocation';
export {
  getAreas,
  findAreaByChapterId,
  type AreaConfig,
} from './areaConfig';
export { StudyPlanScreen } from './StudyPlanScreen';
export { default as ProgressIndicator } from './ProgressIndicator';
export { default as WeeklyPlanView } from './WeeklyPlanView';

/**
 * passPrediction — 합격 예측 점수 시스템 public API.
 *
 * Phase 4 Step 5.
 */

// 알고리즘
export {
  predictPassScore,
  simulateImprovement,
  PASS_THRESHOLD,
  EXAM_ADJUSTMENT,
  type PredictionResult,
} from './scoreCalculator';
export {
  CHAPTER_WEIGHTS,
  CHAPTER_NAMES,
  MIN_ATTEMPTS_PER_CHAPTER,
  aggregateChapterAccuracy,
  getFullChapterAccuracies,
  chapterIdsForExam,
  recentlyActiveChapters,
  type ChapterAccuracy,
} from './chapterWeights';
export {
  confidenceFromWeight,
  confidenceLabel,
  confidenceColor,
  CONFIDENCE_THRESHOLDS,
  type Confidence,
} from './confidenceLevel';
export {
  rankWeakChapters,
  unattemptedChapters,
  type WeakChapterRanking,
} from './weakChapterRanker';
export {
  generateMessage,
  generateInsufficientDataMessage,
  generateSimulationMessage,
} from './messageGenerator';

// 영속성
export {
  savePrediction,
  loadPrediction,
  clearPrediction,
} from './predictionCache';

// UI
export { default as PredictionScoreCard } from './PredictionScoreCard';
export { default as WeakChapterList } from './WeakChapterList';
export { default as ImprovementSimulator } from './ImprovementSimulator';
export { default as DataInsufficientGuide } from './DataInsufficientGuide';
export { default as ProgressDashboard } from './ProgressDashboard';

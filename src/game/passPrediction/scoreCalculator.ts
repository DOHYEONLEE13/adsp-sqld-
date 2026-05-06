/**
 * scoreCalculator — 합격 예측 점수 산정 핵심.
 *
 * Phase 4 Step 5 (리서치 4-2절 변경 금지):
 *   1. 단원별 정답률 × 가중치 합산
 *   2. total_weight (응시 충분 단원) < 0.7 → score = null, confidence = 'low'
 *   3. raw_score = sum(accuracy × 100 × weight) / total_weight
 *   4. exam_adjustment = -7 (시험 환경 보정, 보수적)
 *   5. final_score = max(0, min(100, raw_score + adjustment))
 *   6. is_pass = final_score >= 60
 *
 * 차이점 (기존 predictPassProbability vs scoreCalculator):
 *   - 기존: 진단 결과 (한 번에 28~33문항) 입력
 *   - 신규: 누적 questionStats 기반 (단원별 정답률 누적)
 *   - 기존: low → score=0
 *   - 신규: low → score=null (UI 분기)
 */

import {
  CHAPTER_WEIGHTS,
  MIN_ATTEMPTS_PER_CHAPTER,
  type ChapterAccuracy,
} from './chapterWeights';
import { confidenceFromWeight, type Confidence } from './confidenceLevel';

/** 합격 기준 (변경 금지). */
export const PASS_THRESHOLD = 60;

/** 시험 환경 보정 (변경 금지). */
export const EXAM_ADJUSTMENT = -7;

/** 합격 예측 결과. */
export interface PredictionResult {
  /** 0~100. null = 데이터 부족 (confidence='low'). */
  score: number | null;

  /** 보정 전 원시 점수 (raw_score). 디버그/시뮬레이션용. */
  raw_score: number | null;

  /** 적용된 시험 환경 보정. */
  exam_adjustment: number;

  /** is_pass = score >= 60. score=null 이면 false. */
  is_pass: boolean;

  /** 신뢰도. */
  confidence: Confidence;

  /** 응시 충분 단원의 가중치 합 (0~1). */
  total_weight: number;

  /** 본 시험의 모든 chapter_id 별 정답률 (UI 표시용 캐시). */
  chapter_accuracies: ChapterAccuracy[];

  /** 시험 종류. */
  exam: 'adsp' | 'sqld';
}

/**
 * 누적 데이터 기반 합격 예측.
 *
 * @param chapterAccuracies - getFullChapterAccuracies() 결과
 * @param exam - 시험
 */
export function predictPassScore(
  chapterAccuracies: ChapterAccuracy[],
  exam: 'adsp' | 'sqld',
): PredictionResult {
  let totalScore = 0;
  let totalWeight = 0;

  for (const ca of chapterAccuracies) {
    if (ca.accuracy === null) continue;
    if (ca.attempt_count < MIN_ATTEMPTS_PER_CHAPTER) continue;
    const weight = CHAPTER_WEIGHTS[ca.chapter_id];
    if (!weight) continue;
    totalScore += ca.accuracy * 100 * weight;
    totalWeight += weight;
  }

  const confidence = confidenceFromWeight(totalWeight);

  if (confidence === 'low') {
    return {
      score: null,
      raw_score: null,
      exam_adjustment: EXAM_ADJUSTMENT,
      is_pass: false,
      confidence,
      total_weight: totalWeight,
      chapter_accuracies: chapterAccuracies,
      exam,
    };
  }

  const raw = totalScore / totalWeight;
  const adjusted = clamp(raw + EXAM_ADJUSTMENT, 0, 100);
  const score = Math.round(adjusted);

  return {
    score,
    raw_score: Math.round(raw),
    exam_adjustment: EXAM_ADJUSTMENT,
    is_pass: score >= PASS_THRESHOLD,
    confidence,
    total_weight: totalWeight,
    chapter_accuracies: chapterAccuracies,
    exam,
  };
}

/** 점수를 [0, 100] 범위로 제한. */
function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * 약점 보강 시뮬레이션 — target_chapters 의 정답률을 target_accuracy 로 가정.
 *
 * @param current - 현재 prediction
 * @param targetChapterIds - 보강 대상 chapter_id 목록
 * @param targetAccuracy - 목표 정답률 (0~1, 기본 0.8)
 * @returns 보강 후 예측 + delta
 */
export function simulateImprovement(
  current: PredictionResult,
  targetChapterIds: readonly string[],
  targetAccuracy: number = 0.8,
): {
  predicted: PredictionResult;
  /** 점수 변화. score=null 이면 0. */
  delta: number;
  /** 보강 전후 합격 변화. */
  pass_changed: boolean;
} {
  const targetSet = new Set(targetChapterIds);
  const adjustedAccuracies: ChapterAccuracy[] = current.chapter_accuracies.map(
    (ca) => {
      if (!targetSet.has(ca.chapter_id)) return ca;
      // 보강 가정 — accuracy 를 target 으로 끌어올림 (이미 더 높으면 그대로)
      const newAcc = Math.max(ca.accuracy ?? 0, targetAccuracy);
      // 응시 < MIN 인 단원도 보강 시뮬레이션엔 가상 응시 5회로 가정 (UI 표시용)
      const newAttempts = Math.max(ca.attempt_count, MIN_ATTEMPTS_PER_CHAPTER);
      return {
        ...ca,
        accuracy: newAcc,
        attempt_count: newAttempts,
      };
    },
  );

  const predicted = predictPassScore(adjustedAccuracies, current.exam);
  const currentScore = current.score ?? 0;
  const newScore = predicted.score ?? 0;

  return {
    predicted,
    delta: newScore - currentScore,
    pass_changed: predicted.is_pass !== current.is_pass,
  };
}

/**
 * predictionCache — 예측 점수 캐시 (localStorage mock).
 *
 * Phase 4 Step 5 — Step 6 일괄 마이그레이션 0027 시 Supabase 로 전환.
 *
 * 정책:
 *   - 학습 진행 시 자동 갱신 (caller 가 questionStats 변경 후 호출)
 *   - 마지막 갱신 시각 보존 — UI "최근 N분 전 갱신" 표시 가능
 */

import type { PredictionResult } from './scoreCalculator';

const STORAGE_KEY = 'questdp_prediction_v1';

interface SerializedCache {
  _v: 1;
  exam: 'adsp' | 'sqld';
  result: PredictionResult;
  computed_at: string; // ISO
}

/** exam 별 prediction 캐시 저장. */
export function savePrediction(result: PredictionResult): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: SerializedCache = {
      _v: 1,
      exam: result.exam,
      result,
      computed_at: new Date().toISOString(),
    };
    window.localStorage.setItem(
      keyForExam(result.exam),
      JSON.stringify(payload),
    );
  } catch {
    /* quota — silent fail */
  }
}

/** exam 별 prediction 캐시 로드. 없거나 손상 시 null. */
export function loadPrediction(
  exam: 'adsp' | 'sqld',
): { result: PredictionResult; computed_at: Date } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(keyForExam(exam));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SerializedCache;
    if (parsed?._v !== 1) return null;
    if (parsed.exam !== exam) return null;
    return {
      result: parsed.result,
      computed_at: new Date(parsed.computed_at),
    };
  } catch {
    return null;
  }
}

/** 모든 exam 캐시 삭제. */
export function clearPrediction(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(keyForExam('adsp'));
    window.localStorage.removeItem(keyForExam('sqld'));
  } catch {
    /* noop */
  }
}

function keyForExam(exam: 'adsp' | 'sqld'): string {
  return `${STORAGE_KEY}_${exam}`;
}

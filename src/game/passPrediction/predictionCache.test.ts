import { describe, it, expect, beforeEach } from 'vitest';
import {
  savePrediction,
  loadPrediction,
  clearPrediction,
} from './predictionCache';
import type { PredictionResult } from './scoreCalculator';

function mkResult(overrides: Partial<PredictionResult> = {}): PredictionResult {
  return {
    score: 65,
    raw_score: 72,
    exam_adjustment: -7,
    is_pass: true,
    confidence: 'high',
    total_weight: 1.0,
    chapter_accuracies: [],
    exam: 'adsp',
    ...overrides,
  };
}

describe('predictionCache', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') window.localStorage?.clear();
  });

  it('초기 → null', () => {
    if (typeof window === 'undefined') return;
    expect(loadPrediction('adsp')).toBeNull();
    expect(loadPrediction('sqld')).toBeNull();
  });

  it('save → load round-trip', () => {
    if (typeof window === 'undefined') return;
    const result = mkResult();
    savePrediction(result);
    const loaded = loadPrediction('adsp');
    expect(loaded).not.toBeNull();
    expect(loaded?.result.score).toBe(65);
    expect(loaded?.result.is_pass).toBe(true);
    expect(loaded?.computed_at).toBeInstanceOf(Date);
  });

  it('exam 별 캐시 분리 — adsp 저장 시 sqld 영향 X', () => {
    if (typeof window === 'undefined') return;
    savePrediction(mkResult({ exam: 'adsp', score: 65 }));
    expect(loadPrediction('sqld')).toBeNull();
    expect(loadPrediction('adsp')?.result.score).toBe(65);
  });

  it('두 exam 동시 저장', () => {
    if (typeof window === 'undefined') return;
    savePrediction(mkResult({ exam: 'adsp', score: 65 }));
    savePrediction(mkResult({ exam: 'sqld', score: 80 }));
    expect(loadPrediction('adsp')?.result.score).toBe(65);
    expect(loadPrediction('sqld')?.result.score).toBe(80);
  });

  it('clearPrediction — 양쪽 모두 삭제', () => {
    if (typeof window === 'undefined') return;
    savePrediction(mkResult({ exam: 'adsp' }));
    savePrediction(mkResult({ exam: 'sqld' }));
    clearPrediction();
    expect(loadPrediction('adsp')).toBeNull();
    expect(loadPrediction('sqld')).toBeNull();
  });

  it('손상된 JSON → null', () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('questdp_prediction_v1_adsp', 'broken');
    expect(loadPrediction('adsp')).toBeNull();
  });

  it('schema 버전 mismatch → null', () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      'questdp_prediction_v1_adsp',
      JSON.stringify({ _v: 999, exam: 'adsp', result: mkResult() }),
    );
    expect(loadPrediction('adsp')).toBeNull();
  });

  it('null score 보존', () => {
    if (typeof window === 'undefined') return;
    savePrediction(mkResult({ score: null, raw_score: null, confidence: 'low' }));
    const loaded = loadPrediction('adsp');
    expect(loaded?.result.score).toBeNull();
  });
});

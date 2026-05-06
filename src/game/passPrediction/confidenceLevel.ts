/**
 * confidenceLevel — 합격 예측 신뢰도 판정.
 *
 * Phase 4 Step 5 (리서치 4-1절 변경 금지):
 *   total_weight < 0.7   → 'low'    (예측 신뢰 불가, score = null 표시)
 *   total_weight < 0.85  → 'medium' (참고용, "신뢰도: 중간" 표시)
 *   total_weight >= 0.85 → 'high'   (신뢰 가능)
 *
 * total_weight = 응시 충분한 (>= MIN_ATTEMPTS) 단원의 가중치 합.
 * 즉 모든 단원 응시 5회+ → total_weight = 1.0 → high.
 * 일부 단원 미응시 → total_weight < 1.0 → 임계값에 따라 분기.
 */

export type Confidence = 'low' | 'medium' | 'high';

export const CONFIDENCE_THRESHOLDS = {
  /** total_weight 미만이면 'low' (score 산출 불가). */
  LOW_MAX: 0.7,
  /** total_weight 미만이면 'medium'. */
  MEDIUM_MAX: 0.85,
} as const;

/**
 * total_weight (응시 충분한 단원의 가중치 합) → confidence.
 *
 * @param totalWeight - 0~1
 */
export function confidenceFromWeight(totalWeight: number): Confidence {
  if (totalWeight < CONFIDENCE_THRESHOLDS.LOW_MAX) return 'low';
  if (totalWeight < CONFIDENCE_THRESHOLDS.MEDIUM_MAX) return 'medium';
  return 'high';
}

/** UI 표시용 라벨 (한국어). */
export function confidenceLabel(c: Confidence): string {
  switch (c) {
    case 'low':
      return '낮음';
    case 'medium':
      return '보통';
    case 'high':
      return '높음';
  }
}

/** UI 색상 (Tailwind / CSS variable 친화). */
export function confidenceColor(c: Confidence): string {
  switch (c) {
    case 'low':
      return 'rgba(239,244,255,0.55)';
    case 'medium':
      return '#67e8f9';
    case 'high':
      return 'var(--neon)';
  }
}

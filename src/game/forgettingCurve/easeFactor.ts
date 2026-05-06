/**
 * easeFactor — SM-2 ease_factor variant 결정 + 정답/오답 시 갱신.
 *
 * Phase 4 Step 4 — 망각 곡선 알고리즘 입력값.
 *
 * variant 정책 (리서치 12-1절 결정 사항):
 *   beginner + novice → CONSERVATIVE (2.0): 천천히, 안전
 *   beginner + some_basis → STANDARD (2.5): SM-2 default
 *   beginner + experienced → STANDARD (2.5)
 *   reviewer + novice → STANDARD (2.5)
 *   reviewer + some_basis → AGGRESSIVE (2.8)
 *   reviewer + experienced → AGGRESSIVE (2.8): 빠른 progression
 *
 * 갱신 규칙:
 *   정답: ease + 0.1 (max 3.0)
 *   오답: ease - 0.2 (min 1.3)
 */

import type { Persona, UserBackground } from '@/types/learning';
import {
  EASE_FACTOR_INITIAL,
  type EaseFactorVariant,
} from '@/types/learning/reviewItem';

/** ease 갱신 한계. */
export const EASE_FACTOR_MIN = 1.3;
export const EASE_FACTOR_MAX = 3.0;

/** 정답 시 ease 증가량. */
export const EASE_FACTOR_DELTA_CORRECT = 0.1;
/** 오답 시 ease 감소량. */
export const EASE_FACTOR_DELTA_WRONG = 0.2;

/**
 * 페르소나 × 배경 → ease_factor variant 결정.
 *
 * Step 1 의 reviewItem.ts `recommendEaseFactor` 와 정합.
 * 본 함수는 variant 라벨 (CONSERVATIVE/STANDARD/AGGRESSIVE) 을 반환 — A/B 추적용.
 */
export function determineEaseFactorVariant(
  persona: Persona,
  background: UserBackground,
): EaseFactorVariant {
  if (persona === 'beginner' && background === 'novice') return 'CONSERVATIVE';
  if (persona === 'reviewer' && background !== 'novice') return 'AGGRESSIVE';
  return 'STANDARD';
}

/** variant 라벨 → 초기값 숫자. */
export function easeFactorInitial(variant: EaseFactorVariant): number {
  return EASE_FACTOR_INITIAL[variant];
}

/**
 * 정답/오답에 따라 ease_factor 갱신.
 *
 * @param current - 현재 ease_factor
 * @param isCorrect - 풀이 결과
 * @returns 갱신된 ease_factor (clamp 적용)
 */
export function updateEaseFactor(current: number, isCorrect: boolean): number {
  const delta = isCorrect ? EASE_FACTOR_DELTA_CORRECT : -EASE_FACTOR_DELTA_WRONG;
  const next = current + delta;
  return clampEase(next);
}

/** ease_factor 를 [MIN, MAX] 범위로 제한. */
export function clampEase(ease: number): number {
  if (Number.isNaN(ease)) return EASE_FACTOR_INITIAL.STANDARD;
  if (ease < EASE_FACTOR_MIN) return EASE_FACTOR_MIN;
  if (ease > EASE_FACTOR_MAX) return EASE_FACTOR_MAX;
  return ease;
}

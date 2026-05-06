import { describe, it, expect } from 'vitest';
import {
  confidenceFromWeight,
  confidenceLabel,
  confidenceColor,
  CONFIDENCE_THRESHOLDS,
} from './confidenceLevel';

describe('confidenceLevel', () => {
  describe('confidenceFromWeight', () => {
    it('0 → low', () => expect(confidenceFromWeight(0)).toBe('low'));
    it('0.5 → low', () => expect(confidenceFromWeight(0.5)).toBe('low'));
    it('0.69 → low', () => expect(confidenceFromWeight(0.69)).toBe('low'));
    it('0.7 (경계) → medium', () => expect(confidenceFromWeight(0.7)).toBe('medium'));
    it('0.8 → medium', () => expect(confidenceFromWeight(0.8)).toBe('medium'));
    it('0.84 → medium', () => expect(confidenceFromWeight(0.84)).toBe('medium'));
    it('0.85 (경계) → high', () => expect(confidenceFromWeight(0.85)).toBe('high'));
    it('1.0 → high', () => expect(confidenceFromWeight(1.0)).toBe('high'));
  });

  describe('threshold 상수', () => {
    it('LOW_MAX = 0.7', () => expect(CONFIDENCE_THRESHOLDS.LOW_MAX).toBe(0.7));
    it('MEDIUM_MAX = 0.85', () => expect(CONFIDENCE_THRESHOLDS.MEDIUM_MAX).toBe(0.85));
  });

  describe('confidenceLabel', () => {
    it('low → 낮음', () => expect(confidenceLabel('low')).toBe('낮음'));
    it('medium → 보통', () => expect(confidenceLabel('medium')).toBe('보통'));
    it('high → 높음', () => expect(confidenceLabel('high')).toBe('높음'));
  });

  describe('confidenceColor', () => {
    it('high → var(--neon)', () => expect(confidenceColor('high')).toBe('var(--neon)'));
    it('medium / low — 정의됨', () => {
      expect(confidenceColor('medium')).toBeTruthy();
      expect(confidenceColor('low')).toBeTruthy();
    });
  });
});

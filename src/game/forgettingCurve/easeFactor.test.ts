import { describe, it, expect } from 'vitest';
import {
  determineEaseFactorVariant,
  easeFactorInitial,
  updateEaseFactor,
  clampEase,
  EASE_FACTOR_MIN,
  EASE_FACTOR_MAX,
} from './easeFactor';

describe('easeFactor', () => {
  describe('determineEaseFactorVariant — 페르소나×배경 매핑', () => {
    it('beginner + novice → CONSERVATIVE', () => {
      expect(determineEaseFactorVariant('beginner', 'novice')).toBe('CONSERVATIVE');
    });

    it('beginner + some_basis → STANDARD', () => {
      expect(determineEaseFactorVariant('beginner', 'some_basis')).toBe('STANDARD');
    });

    it('beginner + experienced → STANDARD', () => {
      expect(determineEaseFactorVariant('beginner', 'experienced')).toBe('STANDARD');
    });

    it('reviewer + novice → STANDARD', () => {
      expect(determineEaseFactorVariant('reviewer', 'novice')).toBe('STANDARD');
    });

    it('reviewer + some_basis → AGGRESSIVE', () => {
      expect(determineEaseFactorVariant('reviewer', 'some_basis')).toBe('AGGRESSIVE');
    });

    it('reviewer + experienced → AGGRESSIVE', () => {
      expect(determineEaseFactorVariant('reviewer', 'experienced')).toBe('AGGRESSIVE');
    });

    it('unknown 페르소나 → STANDARD fallback', () => {
      expect(determineEaseFactorVariant('unknown', 'novice')).toBe('STANDARD');
    });
  });

  describe('easeFactorInitial — variant → 숫자', () => {
    it('CONSERVATIVE → 2.0', () => {
      expect(easeFactorInitial('CONSERVATIVE')).toBe(2.0);
    });
    it('STANDARD → 2.5', () => {
      expect(easeFactorInitial('STANDARD')).toBe(2.5);
    });
    it('AGGRESSIVE → 2.8', () => {
      expect(easeFactorInitial('AGGRESSIVE')).toBe(2.8);
    });
  });

  describe('updateEaseFactor — 정답/오답 갱신', () => {
    it('정답 → +0.1', () => {
      expect(updateEaseFactor(2.5, true)).toBeCloseTo(2.6, 5);
    });

    it('오답 → -0.2', () => {
      expect(updateEaseFactor(2.5, false)).toBeCloseTo(2.3, 5);
    });

    it('상한 3.0 — 초과 차단', () => {
      expect(updateEaseFactor(2.95, true)).toBe(EASE_FACTOR_MAX);
    });

    it('하한 1.3 — 미만 차단', () => {
      expect(updateEaseFactor(1.4, false)).toBe(EASE_FACTOR_MIN);
    });
  });

  describe('clampEase', () => {
    it('NaN → STANDARD', () => {
      expect(clampEase(NaN)).toBe(2.5);
    });
    it('2.5 → 2.5', () => {
      expect(clampEase(2.5)).toBe(2.5);
    });
    it('5.0 → 3.0 (상한 차단)', () => {
      expect(clampEase(5.0)).toBe(EASE_FACTOR_MAX);
    });
    it('0.5 → 1.3 (하한 차단)', () => {
      expect(clampEase(0.5)).toBe(EASE_FACTOR_MIN);
    });
  });
});

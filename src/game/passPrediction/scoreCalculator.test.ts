import { describe, it, expect } from 'vitest';
import {
  predictPassScore,
  simulateImprovement,
  PASS_THRESHOLD,
  EXAM_ADJUSTMENT,
} from './scoreCalculator';
import type { ChapterAccuracy } from './chapterWeights';

function mkCa(overrides: Partial<ChapterAccuracy> = {}): ChapterAccuracy {
  return {
    chapter_id: 'adsp-1-1',
    accuracy: 0.7,
    attempt_count: 10,
    correct_count: 7,
    question_count: 5,
    last_seen_at: Date.now(),
    ...overrides,
  };
}

describe('scoreCalculator', () => {
  describe('predictPassScore — 정상 케이스', () => {
    it('모든 단원 70% — total_weight=1.0 → high + raw 70 → adjusted 63', () => {
      const allCh: ChapterAccuracy[] = [
        // ADsP 1과목 (3 chapters, weight 0.0667 each = 0.2)
        mkCa({ chapter_id: 'adsp-1-1' }),
        mkCa({ chapter_id: 'adsp-1-2' }),
        mkCa({ chapter_id: 'adsp-1-3' }),
        // ADsP 2과목 (2 chapters, weight 0.1 each = 0.2)
        mkCa({ chapter_id: 'adsp-2-1' }),
        mkCa({ chapter_id: 'adsp-2-2' }),
        // ADsP 3과목 (3 chapters, weight 0.2 each = 0.6)
        mkCa({ chapter_id: 'adsp-3-1' }),
        mkCa({ chapter_id: 'adsp-3-2' }),
        mkCa({ chapter_id: 'adsp-3-3' }),
      ];
      const r = predictPassScore(allCh, 'adsp');
      expect(r.confidence).toBe('high');
      expect(r.total_weight).toBeCloseTo(1.0, 1);
      expect(r.raw_score).toBe(70);
      expect(r.score).toBe(63); // 70 - 7
      expect(r.is_pass).toBe(true);
    });

    it('모든 단원 60% — score 53 (불합격)', () => {
      const allCh: ChapterAccuracy[] = [
        mkCa({ chapter_id: 'adsp-1-1', accuracy: 0.6 }),
        mkCa({ chapter_id: 'adsp-1-2', accuracy: 0.6 }),
        mkCa({ chapter_id: 'adsp-1-3', accuracy: 0.6 }),
        mkCa({ chapter_id: 'adsp-2-1', accuracy: 0.6 }),
        mkCa({ chapter_id: 'adsp-2-2', accuracy: 0.6 }),
        mkCa({ chapter_id: 'adsp-3-1', accuracy: 0.6 }),
        mkCa({ chapter_id: 'adsp-3-2', accuracy: 0.6 }),
        mkCa({ chapter_id: 'adsp-3-3', accuracy: 0.6 }),
      ];
      const r = predictPassScore(allCh, 'adsp');
      expect(r.score).toBe(53);
      expect(r.is_pass).toBe(false);
    });

    it('SQLD 80% — high', () => {
      const allCh: ChapterAccuracy[] = [
        mkCa({ chapter_id: 'sqld-1-1', accuracy: 0.8 }),
        mkCa({ chapter_id: 'sqld-1-2', accuracy: 0.8 }),
        mkCa({ chapter_id: 'sqld-2-1', accuracy: 0.8 }),
        mkCa({ chapter_id: 'sqld-2-2', accuracy: 0.8 }),
        mkCa({ chapter_id: 'sqld-2-3', accuracy: 0.8 }),
      ];
      const r = predictPassScore(allCh, 'sqld');
      expect(r.confidence).toBe('high');
      expect(r.score).toBe(73); // 80 - 7
      expect(r.is_pass).toBe(true);
    });
  });

  describe('데이터 부족 케이스', () => {
    it('total_weight < 0.7 → score=null, confidence=low', () => {
      // adsp-1-1 (0.0667) + adsp-1-2 (0.0667) = 0.1333 < 0.7
      const ch: ChapterAccuracy[] = [
        mkCa({ chapter_id: 'adsp-1-1' }),
        mkCa({ chapter_id: 'adsp-1-2' }),
      ];
      const r = predictPassScore(ch, 'adsp');
      expect(r.score).toBeNull();
      expect(r.raw_score).toBeNull();
      expect(r.confidence).toBe('low');
      expect(r.is_pass).toBe(false);
    });

    it('accuracy=null 단원 무시', () => {
      const ch: ChapterAccuracy[] = [
        mkCa({ chapter_id: 'adsp-1-1', accuracy: null, attempt_count: 0 }),
        mkCa({ chapter_id: 'adsp-1-2' }),
      ];
      const r = predictPassScore(ch, 'adsp');
      // adsp-1-2 만 가중 (0.0667) → low
      expect(r.confidence).toBe('low');
    });

    it('attempt_count < 5 단원 무시', () => {
      const ch: ChapterAccuracy[] = [
        mkCa({ chapter_id: 'adsp-1-1', attempt_count: 4 }),
      ];
      const r = predictPassScore(ch, 'adsp');
      // 4문항이라 무시
      expect(r.total_weight).toBe(0);
      expect(r.confidence).toBe('low');
    });

    it('medium 신뢰도 — 0.7~0.85', () => {
      // adsp-3-1, 3-2, 3-3 (각 0.2 = 0.6) + adsp-2-1 (0.1) = 0.7 → medium
      const ch: ChapterAccuracy[] = [
        mkCa({ chapter_id: 'adsp-3-1' }),
        mkCa({ chapter_id: 'adsp-3-2' }),
        mkCa({ chapter_id: 'adsp-3-3' }),
        mkCa({ chapter_id: 'adsp-2-1' }),
      ];
      const r = predictPassScore(ch, 'adsp');
      expect(r.confidence).toBe('medium');
      expect(r.score).not.toBeNull();
    });
  });

  describe('극단 케이스', () => {
    it('모든 단원 100% → score 93 (100 - 7)', () => {
      const ch: ChapterAccuracy[] = [
        mkCa({ chapter_id: 'adsp-1-1', accuracy: 1.0 }),
        mkCa({ chapter_id: 'adsp-1-2', accuracy: 1.0 }),
        mkCa({ chapter_id: 'adsp-1-3', accuracy: 1.0 }),
        mkCa({ chapter_id: 'adsp-2-1', accuracy: 1.0 }),
        mkCa({ chapter_id: 'adsp-2-2', accuracy: 1.0 }),
        mkCa({ chapter_id: 'adsp-3-1', accuracy: 1.0 }),
        mkCa({ chapter_id: 'adsp-3-2', accuracy: 1.0 }),
        mkCa({ chapter_id: 'adsp-3-3', accuracy: 1.0 }),
      ];
      const r = predictPassScore(ch, 'adsp');
      expect(r.score).toBe(93);
    });

    it('모든 단원 0% → score 0 (clamp)', () => {
      const ch: ChapterAccuracy[] = [
        mkCa({ chapter_id: 'adsp-1-1', accuracy: 0 }),
        mkCa({ chapter_id: 'adsp-1-2', accuracy: 0 }),
        mkCa({ chapter_id: 'adsp-1-3', accuracy: 0 }),
        mkCa({ chapter_id: 'adsp-2-1', accuracy: 0 }),
        mkCa({ chapter_id: 'adsp-2-2', accuracy: 0 }),
        mkCa({ chapter_id: 'adsp-3-1', accuracy: 0 }),
        mkCa({ chapter_id: 'adsp-3-2', accuracy: 0 }),
        mkCa({ chapter_id: 'adsp-3-3', accuracy: 0 }),
      ];
      const r = predictPassScore(ch, 'adsp');
      expect(r.score).toBe(0); // max(0, 0 + (-7)) = 0
    });
  });

  describe('상수', () => {
    it('PASS_THRESHOLD = 60', () => expect(PASS_THRESHOLD).toBe(60));
    it('EXAM_ADJUSTMENT = -7', () => expect(EXAM_ADJUSTMENT).toBe(-7));
  });

  describe('simulateImprovement', () => {
    it('약점 단원 보강 시 점수 상승', () => {
      const initial: ChapterAccuracy[] = [
        mkCa({ chapter_id: 'adsp-1-1', accuracy: 0.5 }),
        mkCa({ chapter_id: 'adsp-1-2', accuracy: 0.5 }),
        mkCa({ chapter_id: 'adsp-1-3', accuracy: 0.5 }),
        mkCa({ chapter_id: 'adsp-2-1', accuracy: 0.5 }),
        mkCa({ chapter_id: 'adsp-2-2', accuracy: 0.5 }),
        mkCa({ chapter_id: 'adsp-3-1', accuracy: 0.5 }),
        mkCa({ chapter_id: 'adsp-3-2', accuracy: 0.4 }),
        mkCa({ chapter_id: 'adsp-3-3', accuracy: 0.4 }),
      ];
      const current = predictPassScore(initial, 'adsp');
      const sim = simulateImprovement(current, ['adsp-3-2', 'adsp-3-3'], 0.8);
      expect(sim.predicted.score).not.toBeNull();
      expect(sim.delta).toBeGreaterThan(0);
    });

    it('이미 합격 + 보강 → 점수 변화 가능', () => {
      const initial: ChapterAccuracy[] = [
        mkCa({ chapter_id: 'adsp-1-1', accuracy: 0.85 }),
        mkCa({ chapter_id: 'adsp-1-2', accuracy: 0.85 }),
        mkCa({ chapter_id: 'adsp-1-3', accuracy: 0.85 }),
        mkCa({ chapter_id: 'adsp-2-1', accuracy: 0.85 }),
        mkCa({ chapter_id: 'adsp-2-2', accuracy: 0.85 }),
        mkCa({ chapter_id: 'adsp-3-1', accuracy: 0.7 }),
        mkCa({ chapter_id: 'adsp-3-2', accuracy: 0.7 }),
        mkCa({ chapter_id: 'adsp-3-3', accuracy: 0.7 }),
      ];
      const current = predictPassScore(initial, 'adsp');
      expect(current.is_pass).toBe(true);
      const sim = simulateImprovement(current, ['adsp-3-1', 'adsp-3-2', 'adsp-3-3'], 0.85);
      expect(sim.delta).toBeGreaterThan(0);
    });

    it('보강 0개 → delta 0', () => {
      const initial: ChapterAccuracy[] = [
        mkCa({ chapter_id: 'adsp-1-1' }),
        mkCa({ chapter_id: 'adsp-1-2' }),
        mkCa({ chapter_id: 'adsp-1-3' }),
        mkCa({ chapter_id: 'adsp-2-1' }),
        mkCa({ chapter_id: 'adsp-2-2' }),
        mkCa({ chapter_id: 'adsp-3-1' }),
        mkCa({ chapter_id: 'adsp-3-2' }),
        mkCa({ chapter_id: 'adsp-3-3' }),
      ];
      const current = predictPassScore(initial, 'adsp');
      const sim = simulateImprovement(current, [], 0.8);
      expect(sim.delta).toBe(0);
    });
  });
});

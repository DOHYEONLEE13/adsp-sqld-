/**
 * Hardening 테스트 — 경계 조건 + 데이터 부재 + 극단 케이스.
 *
 * Phase 4 Step 5.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  predictPassScore,
  simulateImprovement,
  rankWeakChapters,
  generateMessage,
  savePrediction,
  loadPrediction,
  clearPrediction,
} from './index';
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

describe('passPrediction Hardening', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') window.localStorage?.clear();
  });

  describe('완전 빈 데이터 케이스', () => {
    it('chapter_accuracies 빈 배열 → low + score=null', () => {
      const r = predictPassScore([], 'adsp');
      expect(r.score).toBeNull();
      expect(r.confidence).toBe('low');
      expect(r.is_pass).toBe(false);
      expect(r.total_weight).toBe(0);
    });

    it('rankWeakChapters 빈 배열 → 빈 결과', () => {
      expect(rankWeakChapters([])).toEqual([]);
    });

    it('데이터 부족 + reviewer → 메시지 분기', () => {
      const m = generateMessage(null, false, 'reviewer', 30);
      expect(m).toContain('부족');
    });
  });

  describe('극단 데이터 — 모든 단원 100%', () => {
    it('ADsP 100% → 93점 (clamp + adjust)', () => {
      const all = ['adsp-1-1', 'adsp-1-2', 'adsp-1-3', 'adsp-2-1', 'adsp-2-2', 'adsp-3-1', 'adsp-3-2', 'adsp-3-3'];
      const ca = all.map((id) => mkCa({ chapter_id: id, accuracy: 1.0 }));
      const r = predictPassScore(ca, 'adsp');
      expect(r.score).toBe(93);
      expect(r.is_pass).toBe(true);
      // 100% 인 단원은 약점 X
      const ranked = rankWeakChapters(ca);
      ranked.forEach((w) => expect(w.improvement_potential).toBe(0));
    });

    it('SQLD 100% → 93점', () => {
      const all = ['sqld-1-1', 'sqld-1-2', 'sqld-2-1', 'sqld-2-2', 'sqld-2-3'];
      const ca = all.map((id) => mkCa({ chapter_id: id, accuracy: 1.0 }));
      const r = predictPassScore(ca, 'sqld');
      expect(r.score).toBe(93);
    });
  });

  describe('극단 데이터 — 모든 단원 0%', () => {
    it('ADsP 0% → 0점', () => {
      const all = ['adsp-1-1', 'adsp-1-2', 'adsp-1-3', 'adsp-2-1', 'adsp-2-2', 'adsp-3-1', 'adsp-3-2', 'adsp-3-3'];
      const ca = all.map((id) => mkCa({ chapter_id: id, accuracy: 0 }));
      const r = predictPassScore(ca, 'adsp');
      expect(r.score).toBe(0);
      expect(r.is_pass).toBe(false);
    });
  });

  describe('비정상 입력 안전성', () => {
    it('미존재 chapter_id 단원 — 가중치 0 → 무시', () => {
      const ca = [
        mkCa({ chapter_id: 'unknown-x', accuracy: 0.7 }),
        mkCa({ chapter_id: 'adsp-1-1', accuracy: 0.7 }),
      ];
      const r = predictPassScore(ca, 'adsp');
      // unknown-x 무시 + adsp-1-1 (0.0667) 만 → low
      expect(r.confidence).toBe('low');
    });

    it('attempt_count 0 인 단원 → 무시', () => {
      const ca = [
        mkCa({ chapter_id: 'adsp-3-1', accuracy: 0.5, attempt_count: 0 }),
        mkCa({ chapter_id: 'adsp-3-2', accuracy: 0.5, attempt_count: 0 }),
      ];
      const r = predictPassScore(ca, 'adsp');
      expect(r.total_weight).toBe(0);
      expect(r.confidence).toBe('low');
    });
  });

  describe('predictionCache 데이터 손상 fallback', () => {
    it('손상된 JSON 후에도 새 save 성공', () => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem('questdp_prediction_v1_adsp', '{not valid');
      // load 는 null
      expect(loadPrediction('adsp')).toBeNull();
      // 새 save 정상
      savePrediction({
        score: 65,
        raw_score: 72,
        exam_adjustment: -7,
        is_pass: true,
        confidence: 'high',
        total_weight: 1.0,
        chapter_accuracies: [],
        exam: 'adsp',
      });
      expect(loadPrediction('adsp')?.result.score).toBe(65);
    });

    it('clearPrediction 안전 호출 (데이터 없을 때)', () => {
      if (typeof window === 'undefined') return;
      expect(() => clearPrediction()).not.toThrow();
    });
  });

  describe('simulateImprovement 경계', () => {
    it('데이터 부족 (current.score=null) → predict 도 동일 또는 데이터 충족 시 예측 가능', () => {
      const lowCa = [mkCa({ chapter_id: 'adsp-1-1' })];
      const current = predictPassScore(lowCa, 'adsp');
      expect(current.score).toBeNull();
      // 모든 단원 보강 시뮬레이션
      const allChIds = [
        'adsp-1-1',
        'adsp-1-2',
        'adsp-1-3',
        'adsp-2-1',
        'adsp-2-2',
        'adsp-3-1',
        'adsp-3-2',
        'adsp-3-3',
      ];
      const sim = simulateImprovement(current, allChIds, 0.8);
      // current 의 chapter_accuracies 가 1개뿐이라 simulate 후에도 부족할 수 있음
      // 실제로는 simulateImprovement 가 chapter_accuracies 만 변경, 신규 단원 추가 X
      expect(sim.delta).toBeGreaterThanOrEqual(0);
    });

    it('이미 100% 인 단원 보강 → 변화 0', () => {
      const all = [
        'adsp-1-1',
        'adsp-1-2',
        'adsp-1-3',
        'adsp-2-1',
        'adsp-2-2',
        'adsp-3-1',
        'adsp-3-2',
        'adsp-3-3',
      ];
      const ca = all.map((id) => mkCa({ chapter_id: id, accuracy: 1.0 }));
      const current = predictPassScore(ca, 'adsp');
      const sim = simulateImprovement(current, ['adsp-3-1'], 0.8);
      expect(sim.delta).toBe(0);
    });
  });

  describe('메시지 생성 경계', () => {
    it('beginner score=39 (경계) → "차근차근"', () => {
      const m = generateMessage(39, false, 'beginner', 30);
      expect(m).toContain('차근차근');
    });

    it('beginner score=40 (경계) → "합격선까지"', () => {
      const m = generateMessage(40, false, 'beginner', 30);
      expect(m).toContain('합격선까지');
    });

    it('beginner score=60 (합격선 정확) → "합격 가능성"', () => {
      const m = generateMessage(60, true, 'beginner', 30);
      expect(m).toContain('합격 가능성');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { rankWeakChapters, unattemptedChapters } from './weakChapterRanker';
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

describe('weakChapterRanker', () => {
  describe('rankWeakChapters', () => {
    it('빈 입력 → 빈 배열', () => {
      expect(rankWeakChapters([])).toEqual([]);
    });

    it('accuracy=null 단원 제외', () => {
      const ranked = rankWeakChapters([
        mkCa({ chapter_id: 'adsp-1-1', accuracy: null }),
        mkCa({ chapter_id: 'adsp-1-2', accuracy: 0.5 }),
      ]);
      expect(ranked).toHaveLength(1);
      expect(ranked[0].chapter_id).toBe('adsp-1-2');
    });

    it('improvement_potential = (90 - accuracy*100) × weight', () => {
      // adsp-3-2 (weight 0.2, accuracy 0.5) → (90-50)*0.2 = 8
      const ranked = rankWeakChapters([
        mkCa({ chapter_id: 'adsp-3-2', accuracy: 0.5 }),
      ]);
      expect(ranked[0].improvement_potential).toBeCloseTo(8.0);
    });

    it('TOP 3 순서 — 영향 큰 순', () => {
      const ranked = rankWeakChapters([
        // adsp-3-2 (weight 0.2) — 50% → potential 8.0
        mkCa({ chapter_id: 'adsp-3-2', accuracy: 0.5 }),
        // adsp-1-1 (weight 0.0667) — 30% → potential 4.0
        mkCa({ chapter_id: 'adsp-1-1', accuracy: 0.3 }),
        // adsp-3-3 (weight 0.2) — 70% → potential 4.0
        mkCa({ chapter_id: 'adsp-3-3', accuracy: 0.7 }),
        // adsp-2-1 (weight 0.1) — 60% → potential 3.0
        mkCa({ chapter_id: 'adsp-2-1', accuracy: 0.6 }),
      ]);
      expect(ranked[0].chapter_id).toBe('adsp-3-2');
      expect(ranked).toHaveLength(3);
      ranked.forEach((r, i) => expect(r.rank).toBe(i + 1));
    });

    it('TOP N 옵션', () => {
      const all = [
        mkCa({ chapter_id: 'adsp-3-2', accuracy: 0.5 }),
        mkCa({ chapter_id: 'adsp-3-3', accuracy: 0.6 }),
      ];
      expect(rankWeakChapters(all, 1)).toHaveLength(1);
      expect(rankWeakChapters(all, 5)).toHaveLength(2);
    });

    it('100% 정답률 단원 — improvement_potential = 0', () => {
      const ranked = rankWeakChapters([
        mkCa({ chapter_id: 'adsp-3-2', accuracy: 1.0 }),
      ]);
      // potential = (90 - 100) * 0.2 = clamp 0
      expect(ranked[0].improvement_potential).toBe(0);
    });

    it('weight=0 (미정의 chapter_id) → 제외', () => {
      const ranked = rankWeakChapters([
        mkCa({ chapter_id: 'unknown-chapter', accuracy: 0.3 }),
      ]);
      expect(ranked).toEqual([]);
    });
  });

  describe('unattemptedChapters', () => {
    it('accuracy=null 만 추출', () => {
      const result = unattemptedChapters([
        mkCa({ chapter_id: 'a', accuracy: null }),
        mkCa({ chapter_id: 'b', accuracy: 0.7 }),
        mkCa({ chapter_id: 'c', accuracy: null }),
      ]);
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.chapter_id)).toEqual(['a', 'c']);
    });
  });
});

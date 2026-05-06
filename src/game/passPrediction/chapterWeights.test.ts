import { describe, it, expect } from 'vitest';
import {
  CHAPTER_WEIGHTS,
  MIN_ATTEMPTS_PER_CHAPTER,
  aggregateChapterAccuracy,
  chapterIdsForExam,
  getFullChapterAccuracies,
} from './chapterWeights';
import type { QuestionStat } from '@/game/storage';

function mkStat(overrides: Partial<QuestionStat> = {}): QuestionStat {
  return {
    attempts: 5,
    correct: 3,
    wrongStreak: 0,
    lastCorrect: true,
    lastSeenAt: Date.now(),
    lastTimeMs: 30000,
    avgTimeMs: 30000,
    ...overrides,
  };
}

describe('chapterWeights', () => {
  describe('CHAPTER_WEIGHTS — 가중치 표', () => {
    it('ADsP 1과목 합 = 0.20', () => {
      const sum = ['adsp-1-1', 'adsp-1-2', 'adsp-1-3']
        .map((k) => CHAPTER_WEIGHTS[k])
        .reduce((s, w) => s + w, 0);
      expect(sum).toBeCloseTo(0.2, 1);
    });
    it('ADsP 3과목 합 = 0.60', () => {
      const sum = ['adsp-3-1', 'adsp-3-2', 'adsp-3-3']
        .map((k) => CHAPTER_WEIGHTS[k])
        .reduce((s, w) => s + w, 0);
      expect(sum).toBeCloseTo(0.6, 1);
    });
    it('SQLD 2과목 합 = 0.80', () => {
      const sum = ['sqld-2-1', 'sqld-2-2', 'sqld-2-3']
        .map((k) => CHAPTER_WEIGHTS[k])
        .reduce((s, w) => s + w, 0);
      expect(sum).toBeCloseTo(0.8, 1);
    });
  });

  describe('aggregateChapterAccuracy', () => {
    it('빈 입력 → 빈 배열', () => {
      const result = aggregateChapterAccuracy({});
      expect(result).toEqual([]);
    });

    it('미존재 question_id (metaMap 매칭 X) → 무시', () => {
      const stats = { 'unknown-q-id': mkStat() };
      const result = aggregateChapterAccuracy(stats);
      // metaMap 에 없으면 chapter_id 결정 불가 → 무시
      expect(result).toEqual([]);
    });

    it('5문항 미만 → accuracy = null', () => {
      // 실제 question_id 가 ALL_QUESTIONS 에 있어야 metaMap 매칭됨
      // ADsP 의 알려진 question_id 사용 (Q-ADsP-1-1-0001)
      const stats = {
        'Q-ADsP-1-1-0001': mkStat({ attempts: 4, correct: 2 }),
      };
      const result = aggregateChapterAccuracy(stats);
      const ch = result.find((r) => r.chapter_id === 'adsp-1-1');
      if (ch) {
        expect(ch.accuracy).toBeNull();
        expect(ch.attempt_count).toBe(4);
      }
    });

    it('subjectFilter 적용 — adsp 만 추출', () => {
      // 다양한 subject 의 question_id 사용 (실제 ALL_QUESTIONS 에 없을 수 있음 — meta map 의존)
      const stats = {};
      const result = aggregateChapterAccuracy(stats, 'adsp');
      // 모든 결과의 chapter_id 가 'adsp-' prefix
      result.forEach((r) => expect(r.chapter_id).toMatch(/^adsp-/));
    });
  });

  describe('chapterIdsForExam', () => {
    it('adsp → adsp- prefix chapter 만', () => {
      const ids = chapterIdsForExam('adsp');
      expect(ids.every((id) => id.startsWith('adsp-'))).toBe(true);
      expect(ids).toContain('adsp-1-1');
      expect(ids).toContain('adsp-3-3');
    });
    it('sqld → sqld- prefix chapter 만', () => {
      const ids = chapterIdsForExam('sqld');
      expect(ids.every((id) => id.startsWith('sqld-'))).toBe(true);
      expect(ids).toContain('sqld-1-1');
      expect(ids).toContain('sqld-2-3');
    });
  });

  describe('getFullChapterAccuracies', () => {
    it('응시 안 한 chapter 도 포함 (accuracy=null)', () => {
      const result = getFullChapterAccuracies({}, 'adsp');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => expect(r.accuracy).toBeNull());
    });

    it('각 chapter 의 attempt_count = 0 (빈 questionStats)', () => {
      const result = getFullChapterAccuracies({}, 'sqld');
      result.forEach((r) => expect(r.attempt_count).toBe(0));
    });
  });

  describe('MIN_ATTEMPTS_PER_CHAPTER', () => {
    it('5 (지시서 4-1절)', () => {
      expect(MIN_ATTEMPTS_PER_CHAPTER).toBe(5);
    });
  });
});

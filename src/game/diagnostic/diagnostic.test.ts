import { describe, it, expect } from 'vitest';
import {
  aggregateByChapter,
  classifyWeakness,
  confidenceFor,
  shouldTriggerAdaptive,
  canEarlyAbort,
  buildChapterResults,
  extractWeakChapterIds,
  buildSummaryMessage,
  predictPassProbability,
  predictAfterImprovement,
  type DiagnosticAnswer,
} from './diagnostic';

describe('Diagnostic — Phase 4 Step 2', () => {
  const makeAnswer = (
    chapter_id: string,
    is_correct: boolean,
    overrides: Partial<DiagnosticAnswer> = {},
  ): DiagnosticAnswer => ({
    question_id: 'q-' + Math.random().toString(36).slice(2),
    chapter_id,
    is_correct,
    time_spent_seconds: 30,
    ...overrides,
  });

  describe('aggregateByChapter', () => {
    it('단원별 attempted/correct 정확 집계', () => {
      const answers = [
        makeAnswer('adsp-1-1', true),
        makeAnswer('adsp-1-1', false),
        makeAnswer('adsp-1-2', true),
      ];
      const agg = aggregateByChapter(answers);
      expect(agg['adsp-1-1']).toEqual({ attempted: 2, correct: 1 });
      expect(agg['adsp-1-2']).toEqual({ attempted: 1, correct: 1 });
    });

    it('빈 배열 → 빈 객체', () => {
      expect(aggregateByChapter([])).toEqual({});
    });
  });

  describe('classifyWeakness', () => {
    it('attempted=0 → unknown', () => {
      expect(classifyWeakness(0, 0)).toBe('unknown');
    });

    it('attempted < 5 → low_confidence', () => {
      expect(classifyWeakness(3, 3)).toBe('low_confidence');
      expect(classifyWeakness(4, 0)).toBe('low_confidence');
    });

    it('80%+ → strong', () => {
      expect(classifyWeakness(10, 8)).toBe('strong');
      expect(classifyWeakness(10, 10)).toBe('strong');
    });

    it('60~80% → normal', () => {
      expect(classifyWeakness(10, 7)).toBe('normal');
      expect(classifyWeakness(10, 6)).toBe('normal');
    });

    it('40~60% → weak', () => {
      expect(classifyWeakness(10, 5)).toBe('weak');
      expect(classifyWeakness(10, 4)).toBe('weak');
    });

    it('40% 미만 → critical', () => {
      expect(classifyWeakness(10, 3)).toBe('critical');
      expect(classifyWeakness(10, 0)).toBe('critical');
    });
  });

  describe('confidenceFor', () => {
    it('< 5: low / 5~9: normal / 10+: high', () => {
      expect(confidenceFor(0)).toBe('low');
      expect(confidenceFor(4)).toBe('low');
      expect(confidenceFor(5)).toBe('normal');
      expect(confidenceFor(9)).toBe('normal');
      expect(confidenceFor(10)).toBe('high');
    });
  });

  describe('shouldTriggerAdaptive', () => {
    it('< 4 문항이면 trigger X', () => {
      const answers = [
        makeAnswer('adsp-1-1', false),
        makeAnswer('adsp-1-1', false),
      ];
      expect(shouldTriggerAdaptive(answers, 'adsp-1-1')).toBe(false);
    });

    it('50% 이상 오답 시 trigger', () => {
      const answers = [
        makeAnswer('adsp-1-1', false),
        makeAnswer('adsp-1-1', false),
        makeAnswer('adsp-1-1', true),
        makeAnswer('adsp-1-1', false),
      ];
      expect(shouldTriggerAdaptive(answers, 'adsp-1-1')).toBe(true);
    });

    it('정답률 높으면 trigger X', () => {
      const answers = [
        makeAnswer('adsp-1-1', true),
        makeAnswer('adsp-1-1', true),
        makeAnswer('adsp-1-1', true),
        makeAnswer('adsp-1-1', false),
      ];
      expect(shouldTriggerAdaptive(answers, 'adsp-1-1')).toBe(false);
    });
  });

  describe('canEarlyAbort', () => {
    it('15 미만 풀이 시 abort 차단', () => {
      const answers = Array.from({ length: 14 }, () => makeAnswer('adsp-1-1', true));
      expect(canEarlyAbort(answers)).toBe(false);
    });

    it('15 이상 풀이 시 abort 가능', () => {
      const answers = Array.from({ length: 15 }, () => makeAnswer('adsp-1-1', true));
      expect(canEarlyAbort(answers)).toBe(true);
    });
  });

  describe('buildChapterResults', () => {
    it('응시 0 단원도 unknown 으로 포함', () => {
      const answers = [makeAnswer('adsp-1-1', true)];
      const results = buildChapterResults(answers, ['adsp-1-1', 'adsp-1-2', 'adsp-2-1']);
      expect(results).toHaveLength(3);
      const ch12 = results.find((r) => r.chapter_id === 'adsp-1-2')!;
      expect(ch12.attempted).toBe(0);
      expect(ch12.level).toBe('unknown');
    });

    it('정답률 정확 계산', () => {
      const answers = [
        makeAnswer('adsp-1-1', true),
        makeAnswer('adsp-1-1', true),
        makeAnswer('adsp-1-1', false),
      ];
      const results = buildChapterResults(answers, ['adsp-1-1']);
      expect(results[0].accuracy).toBeCloseTo(2 / 3);
    });
  });

  describe('extractWeakChapterIds', () => {
    it('weak/critical 만 추출, 정답률 낮은 순', () => {
      const answers = [
        // adsp-1-1: 9/10 = strong
        ...Array.from({ length: 9 }, () => makeAnswer('adsp-1-1', true)),
        makeAnswer('adsp-1-1', false),
        // adsp-1-2: 4/10 = weak (정답률 0.4)
        ...Array.from({ length: 4 }, () => makeAnswer('adsp-1-2', true)),
        ...Array.from({ length: 6 }, () => makeAnswer('adsp-1-2', false)),
        // adsp-1-3: 2/10 = critical (0.2)
        ...Array.from({ length: 2 }, () => makeAnswer('adsp-1-3', true)),
        ...Array.from({ length: 8 }, () => makeAnswer('adsp-1-3', false)),
      ];
      const results = buildChapterResults(answers, ['adsp-1-1', 'adsp-1-2', 'adsp-1-3']);
      const weak = extractWeakChapterIds(results);
      expect(weak).toEqual(['adsp-1-3', 'adsp-1-2']); // critical 먼저 (0.2 < 0.4)
      expect(weak).not.toContain('adsp-1-1');
    });

    it('low_confidence 단원 제외 (신뢰도 부족)', () => {
      const answers = [
        makeAnswer('adsp-1-1', false),
        makeAnswer('adsp-1-1', false),
        makeAnswer('adsp-1-1', false), // 3 attempts → low_confidence
      ];
      const results = buildChapterResults(answers, ['adsp-1-1']);
      expect(results[0].level).toBe('low_confidence');
      expect(extractWeakChapterIds(results)).toEqual([]);
    });
  });

  describe('buildSummaryMessage', () => {
    it('critical 있으면 가장 약한 단원 명시', () => {
      const results = buildChapterResults(
        [
          ...Array.from({ length: 5 }, () => makeAnswer('adsp-3-2', true)),
          // 통계 분석: 1/10 = 10% (critical)
          ...Array.from({ length: 1 }, () => makeAnswer('adsp-3-1', true)),
          ...Array.from({ length: 9 }, () => makeAnswer('adsp-3-1', false)),
        ],
        ['adsp-3-1', 'adsp-3-2'],
      );
      const msg = buildSummaryMessage(results, { 'adsp-3-1': 'R 기초' });
      expect(msg).toContain('R 기초');
      expect(msg).toMatch(/가장 약/);
    });

    it('weak 만 있으면 보강 권장', () => {
      const results = buildChapterResults(
        // 5/10 = 50% (weak)
        [
          ...Array.from({ length: 5 }, () => makeAnswer('adsp-2-1', true)),
          ...Array.from({ length: 5 }, () => makeAnswer('adsp-2-1', false)),
        ],
        ['adsp-2-1'],
      );
      const msg = buildSummaryMessage(results, { 'adsp-2-1': '분석 기획' });
      expect(msg).toContain('분석 기획');
      expect(msg).toMatch(/보강/);
    });

    it('전부 normal 이상이면 양호 메시지', () => {
      const answers = Array.from({ length: 10 }, () => makeAnswer('adsp-1-1', true));
      const results = buildChapterResults(answers, ['adsp-1-1']);
      const msg = buildSummaryMessage(results);
      expect(msg).toMatch(/양호/);
    });
  });

  describe('predictPassProbability', () => {
    const weights = { 'adsp-1': 0.2, 'adsp-2': 0.2, 'adsp-3': 0.6 };

    it('가중 평균 + 보정 계산', () => {
      const results = buildChapterResults(
        [
          // adsp-1: 8/10 = 80%
          ...Array.from({ length: 8 }, () => makeAnswer('adsp-1', true)),
          ...Array.from({ length: 2 }, () => makeAnswer('adsp-1', false)),
          // adsp-2: 6/10 = 60%
          ...Array.from({ length: 6 }, () => makeAnswer('adsp-2', true)),
          ...Array.from({ length: 4 }, () => makeAnswer('adsp-2', false)),
          // adsp-3: 7/10 = 70%
          ...Array.from({ length: 7 }, () => makeAnswer('adsp-3', true)),
          ...Array.from({ length: 3 }, () => makeAnswer('adsp-3', false)),
        ],
        ['adsp-1', 'adsp-2', 'adsp-3'],
      );
      const result = predictPassProbability(results, weights);
      // raw = 80*0.2 + 60*0.2 + 70*0.6 = 16+12+42 = 70
      // adjusted = 70 - 7 = 63
      expect(result.score).toBe(63);
      expect(result.confidence).toBe('high');
    });

    it('데이터 부족 (totalWeight < 0.7) 시 score=0, confidence=low', () => {
      const results = buildChapterResults(
        Array.from({ length: 5 }, () => makeAnswer('adsp-1', true)),
        ['adsp-1', 'adsp-2', 'adsp-3'],
      );
      const result = predictPassProbability(results, weights);
      expect(result.confidence).toBe('low');
      expect(result.score).toBe(0);
    });

    it('0~100 범위 clamp', () => {
      const results = buildChapterResults(
        [...Array.from({ length: 10 }, () => makeAnswer('adsp-1', true))],
        ['adsp-1'],
      );
      const result = predictPassProbability(results, { 'adsp-1': 1.0 });
      // 100 - 7 = 93
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('predictAfterImprovement', () => {
    it('weak/critical 단원이 80% 로 개선됐다고 가정', () => {
      const weights = { 'adsp-1': 1.0 };
      // 현재 30% (critical)
      const results = buildChapterResults(
        [
          ...Array.from({ length: 3 }, () => makeAnswer('adsp-1', true)),
          ...Array.from({ length: 7 }, () => makeAnswer('adsp-1', false)),
        ],
        ['adsp-1'],
      );
      const current = predictPassProbability(results, weights);
      const improved = predictAfterImprovement(results, weights);
      expect(improved).toBeGreaterThan(current.score);
      // 80 - 7 = 73
      expect(improved).toBeCloseTo(73, 0);
    });
  });
});

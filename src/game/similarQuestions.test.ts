import { describe, expect, it } from 'vitest';

import { countSimilarQuestions, findSimilarQuestions } from './similarQuestions';

describe('same-concept drill selection', () => {
  it('uses the authored lesson group when a step has no explicit extras', () => {
    const questions = findSimilarQuestions('adsp-1-1-cp-01a', 5);
    const ids = questions.map((q) => q.id);

    expect(ids).not.toContain('adsp-1-1-cp-01a');
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(4);
    expect(ids.every((id) => id.startsWith('adsp-1-1-cp-01'))).toBe(true);
    expect(countSimilarQuestions('adsp-1-1-cp-01a')).toBeGreaterThanOrEqual(4);
  });

  it('keeps explicit extraQuizIds and supplements from the same group', () => {
    const questions = findSimilarQuestions('sqld-2-2-cp-01', 5);
    const ids = questions.map((q) => q.id);

    expect(ids).not.toContain('sqld-2-2-cp-01');
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(4);
    expect(ids).toContain('sqld-2-2-cp-01-left-join');
    expect(countSimilarQuestions('sqld-2-2-cp-01')).toBeGreaterThanOrEqual(4);
  });
});

import { describe, expect, it } from 'vitest';
import {
  normalizeConceptSearchText,
  reviewConceptsInChapter,
  searchConcepts,
  searchConceptsInChapter,
} from './conceptSearch';
import { getLessonsInChapter } from '@/data/lessons';

describe('conceptSearch', () => {
  it('한글 개념 제목을 우선 검색한다', () => {
    const results = searchConcepts('sqld', '정규화');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].subject).toBe('sqld');
    expect(
      results.some((result) => result.title.includes('정규화')),
    ).toBe(true);
  });

  it('설명과 대화 안의 영문 키워드를 대소문자와 무관하게 찾는다', () => {
    const results = searchConcepts('sqld', 'group by');

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.some(
        (result) =>
          result.title.includes('GROUP BY') ||
          result.snippet.toLocaleLowerCase().includes('group by'),
      ),
    ).toBe(true);
  });

  it('현재 과목의 개념만 반환한다', () => {
    const results = searchConcepts('adsp', 'DIKW');

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((result) => result.subject === 'adsp')).toBe(true);
  });

  it('괄호형 강조 문법과 여러 공백을 검색에 방해되지 않게 정규화한다', () => {
    expect(normalizeConceptSearchText(' [GROUP   BY] ')).toBe('group by');
  });

  it('현재 챕터의 개념만 반환한다', () => {
    const results = searchConceptsInChapter('sqld', 1, '정규화');

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((result) => result.chapter === 1)).toBe(true);
  });

  it('마지막 오답을 해당 개념 노드로 묶는다', () => {
    const lesson = getLessonsInChapter('sqld', 1)[0];
    const step = lesson.steps.find(
      (candidate) => candidate.quizId && !candidate.id.endsWith('-review'),
    );
    expect(step?.quizId).toBeTruthy();

    const results = reviewConceptsInChapter('sqld', 1, {
      [step!.quizId!]: { lastCorrect: false },
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      topic: lesson.topic,
      stepId: step!.id,
      title: step!.title,
      wrongCount: 1,
    });
  });

  it('다시 맞힌 문항은 오답 개념에서 제외한다', () => {
    const step = getLessonsInChapter('adsp', 1)
      .flatMap((lesson) => lesson.steps)
      .find((candidate) => candidate.quizId);
    expect(step?.quizId).toBeTruthy();

    expect(
      reviewConceptsInChapter('adsp', 1, {
        [step!.quizId!]: { lastCorrect: true },
      }),
    ).toEqual([]);
  });
});

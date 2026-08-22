// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearDailyReviewQuest,
  recordDailyReviewCompletion,
  syncDailyReviewQuest,
} from './dailyReviewQuest';

const TODAY = new Date(2026, 7, 22, 12, 0, 0);

describe('dailyReviewQuest', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearDailyReviewQuest();
  });

  it('만기 항목의 30%를 올림해 목표로 정한다', () => {
    const progress = syncDailyReviewQuest(
      Array.from({ length: 11 }, (_, index) => `q-${index}`),
      TODAY,
    );
    expect(progress.total).toBe(11);
    expect(progress.target).toBe(4);
    expect(progress.isComplete).toBe(false);
  });

  it('복습 완료 문항을 중복 없이 기록한다', () => {
    syncDailyReviewQuest(['q-1', 'q-2', 'q-3'], TODAY);
    recordDailyReviewCompletion('q-1', TODAY);
    recordDailyReviewCompletion('q-1', TODAY);
    const progress = syncDailyReviewQuest([], TODAY);
    expect(progress.completed).toBe(1);
    expect(progress.target).toBe(1);
    expect(progress.isComplete).toBe(true);
  });

  it('날짜가 바뀌면 전날 대상과 완료 기록을 초기화한다', () => {
    syncDailyReviewQuest(['q-1'], TODAY);
    recordDailyReviewCompletion('q-1', TODAY);
    const tomorrow = new Date(2026, 7, 23, 12, 0, 0);
    const progress = syncDailyReviewQuest(['q-2', 'q-3'], tomorrow);
    expect(progress.total).toBe(2);
    expect(progress.completed).toBe(0);
  });
});

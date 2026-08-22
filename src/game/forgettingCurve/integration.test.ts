// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { saveOnboardingResult } from '@/game/onboarding/onboardingStorage';
import {
  clearDailyReviewQuest,
  syncDailyReviewQuest,
} from '@/game/dailyReviewQuest';
import { clearReviewItems, upsertReviewItem } from './reviewItemStorage';
import { recordReviewAttempt } from './integration';

describe('recordReviewAttempt daily review integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearReviewItems();
    clearDailyReviewQuest();
    saveOnboardingResult({
      persona: 'beginner',
      background: 'novice',
      exams: ['adsp'],
      exam_dates: {},
      daily_minutes: 20,
      study_style: 'distributed',
    });
  });

  it('풀이 직전 만기였던 문항만 오늘 복습 완료로 센다', () => {
    const now = new Date(2026, 7, 22, 12, 0, 0);
    const questionId = 'adsp-cp-dikw-data';
    upsertReviewItem({
      user_id: 'guest',
      question_id: questionId,
      current_interval: 1,
      ease_factor: 2.5,
      consecutive_correct: 0,
      consecutive_wrong: 0,
      due_date: new Date(2026, 7, 21, 12, 0, 0),
      last_attempted_at: new Date(2026, 7, 20, 12, 0, 0),
      status: 'active',
    });
    syncDailyReviewQuest([questionId], now);

    recordReviewAttempt(questionId, true, now);

    const progress = syncDailyReviewQuest([], now);
    expect(progress.completed).toBe(1);
    expect(progress.isComplete).toBe(true);
  });
});

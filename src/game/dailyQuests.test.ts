/**
 * dailyQuests.ts — 일일 퀘스트 산출 검증.
 *
 * 핵심 행동:
 *   1. review = 오늘 만기 복습의 30%.
 *   2. volume = 오늘 sessions 풀이 합 + 학습 모드 inline 풀이 합.
 *   3. accuracy = 오늘 Quest 세션에서 맞힌 정답 수 합계.
 */

import { describe, it, expect } from 'vitest';
import { getTodayQuests, completedCount } from './dailyQuests';
import type { ProgressStore, SessionRecord } from './storage';

const NOW = new Date(2026, 4, 1, 12, 0, 0).getTime(); // 2026-05-01 12:00
const TODAY_KEY = '2026-05-01';

function emptyStore(): ProgressStore {
  return {
    version: 1,
    questionStats: {},
    sessions: [],
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function session(
  subject: 'adsp' | 'sqld',
  total: number,
  correctCount: number,
  at: number = NOW,
): SessionRecord {
  return {
    at,
    subject,
    chapter: 1,
    chapterTitle: '',
    topic: null,
    total,
    correctCount,
    totalTimeMs: 1000,
  };
}

describe('getTodayQuests — volume', () => {
  it('빈 store → 0/8', () => {
    const [, volume] = getTodayQuests(emptyStore(), NOW);
    expect(volume.progress).toBe(0);
    expect(volume.target).toBe(8);
    expect(volume.completed).toBe(false);
  });

  it('오늘 sessions 풀이 6문 → volume 6/8', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      sessions: [session('adsp', 6, 3)],
    };
    const [, volume] = getTodayQuests(store, NOW);
    expect(volume.progress).toBe(6);
    expect(volume.completed).toBe(false);
  });

  it('오늘 학습 모드 inline 5문 → volume 5/8 (sessions 없어도)', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      lessonAttemptsByDay: {
        [TODAY_KEY]: { total: 5, bySubject: { adsp: 5 } },
      },
    };
    const [, volume] = getTodayQuests(store, NOW);
    expect(volume.progress).toBe(5);
    expect(volume.completed).toBe(false);
  });

  it('sessions 6 + 학습 모드 3 → volume 8/8 완료 (clamp)', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      sessions: [session('adsp', 6, 3)],
      lessonAttemptsByDay: {
        [TODAY_KEY]: { total: 3, bySubject: { adsp: 3 } },
      },
    };
    const [, volume] = getTodayQuests(store, NOW);
    expect(volume.progress).toBe(8);
    expect(volume.completed).toBe(true);
  });

  it('어제 학습 풀이는 오늘 카운트 안 됨', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      lessonAttemptsByDay: {
        '2026-04-30': { total: 99, bySubject: { adsp: 99 } },
      },
    };
    const [, volume] = getTodayQuests(store, NOW);
    expect(volume.progress).toBe(0);
  });
});

describe('getTodayQuests — accuracy', () => {
  it('정답이 4개 미만이면 완료되지 않음', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      sessions: [session('adsp', 8, 3)],
    };
    const [, , accuracy] = getTodayQuests(store, NOW);
    expect(accuracy.progress).toBe(3);
    expect(accuracy.target).toBe(4);
    expect(accuracy.completed).toBe(false);
  });

  it('여러 세션에서 맞힌 정답 4개를 합산해 완료', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      sessions: [session('adsp', 3, 2), session('sqld', 4, 2)],
    };
    const [, , accuracy] = getTodayQuests(store, NOW);
    expect(accuracy.progress).toBe(4);
    expect(accuracy.completed).toBe(true);
  });

  it('학습 모드 inline 풀이는 accuracy 인정 X (Quest 세션만)', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      lessonAttemptsByDay: {
        [TODAY_KEY]: { total: 100, bySubject: { adsp: 100 } },
      },
    };
    const [, , accuracy] = getTodayQuests(store, NOW);
    expect(accuracy.completed).toBe(false);
  });
});

describe('getTodayQuests — review', () => {
  it('복습 대상 10개 중 2개 완료 → 2/3', () => {
    const [review] = getTodayQuests(emptyStore(), NOW, {
      total: 10,
      completed: 2,
      target: 3,
      hasWork: true,
      isComplete: false,
    });
    expect(review.progress).toBe(2);
    expect(review.target).toBe(3);
    expect(review.completed).toBe(false);
    expect(review.rewardXp).toBe(20);
  });

  it('복습할 항목이 없으면 완료 처리하되 보상은 만들지 않음', () => {
    const [review] = getTodayQuests(emptyStore(), NOW);
    expect(review.completed).toBe(true);
    expect(review.rewardAvailable).toBe(false);
    expect(review.claimed).toBe(true);
  });

  it('오늘 수령한 퀘스트만 claimed로 표시한다', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      dailyQuestClaims: { day: TODAY_KEY, ids: ['daily-volume'] },
    };
    const [, volume, accuracy] = getTodayQuests(store, NOW);
    expect(volume.claimed).toBe(true);
    expect(accuracy.claimed).toBe(false);
  });
});

describe('completedCount', () => {
  it('완료 수만 세기', () => {
    const quests = getTodayQuests(emptyStore(), NOW);
    expect(completedCount(quests)).toBe(1);
  });

  it('3종 모두 완료 시 3 반환', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      sessions: [session('adsp', 10, 8), session('sqld', 5, 4)],
      lessonAttemptsByDay: {
        [TODAY_KEY]: { total: 5, bySubject: { adsp: 3, sqld: 2 } },
      },
    };
    const quests = getTodayQuests(store, NOW, {
      total: 10,
      completed: 3,
      target: 3,
      hasWork: true,
      isComplete: true,
    });
    expect(completedCount(quests)).toBe(3);
  });
});

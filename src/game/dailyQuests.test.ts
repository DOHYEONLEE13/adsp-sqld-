/**
 * dailyQuests.ts — 일일 퀘스트 산출 검증.
 *
 * 핵심 행동:
 *   1. volume = 오늘 sessions 풀이 합 + 학습 모드 inline 풀이 합.
 *   2. accuracy = 오늘 Quest 세션 중 5문 이상 & 정답률 ≥ 80% 하나라도.
 *   3. variety = 오늘 활동한 과목 수 (sessions OR 학습 모드).
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
  it('빈 store → 0/15', () => {
    const [volume] = getTodayQuests(emptyStore(), NOW);
    expect(volume.progress).toBe(0);
    expect(volume.target).toBe(15);
    expect(volume.completed).toBe(false);
  });

  it('오늘 sessions 풀이 10문 → volume 10/15', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      sessions: [session('adsp', 10, 5)],
    };
    const [volume] = getTodayQuests(store, NOW);
    expect(volume.progress).toBe(10);
    expect(volume.completed).toBe(false);
  });

  it('오늘 학습 모드 inline 5문 → volume 5/15 (sessions 없어도)', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      lessonAttemptsByDay: {
        [TODAY_KEY]: { total: 5, bySubject: { adsp: 5 } },
      },
    };
    const [volume] = getTodayQuests(store, NOW);
    expect(volume.progress).toBe(5);
    expect(volume.completed).toBe(false);
  });

  it('sessions 10 + 학습 모드 6 → volume 15/15 완료 (clamp)', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      sessions: [session('adsp', 10, 5)],
      lessonAttemptsByDay: {
        [TODAY_KEY]: { total: 6, bySubject: { adsp: 6 } },
      },
    };
    const [volume] = getTodayQuests(store, NOW);
    expect(volume.progress).toBe(15);
    expect(volume.completed).toBe(true);
  });

  it('어제 학습 풀이는 오늘 카운트 안 됨', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      lessonAttemptsByDay: {
        '2026-04-30': { total: 99, bySubject: { adsp: 99 } },
      },
    };
    const [volume] = getTodayQuests(store, NOW);
    expect(volume.progress).toBe(0);
  });
});

describe('getTodayQuests — accuracy', () => {
  it('5문 미만 세션은 인정 X', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      sessions: [session('adsp', 4, 4)],
    };
    const [, accuracy] = getTodayQuests(store, NOW);
    expect(accuracy.completed).toBe(false);
  });

  it('5문 + 80% 정답 → 인정', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      sessions: [session('adsp', 5, 4)],
    };
    const [, accuracy] = getTodayQuests(store, NOW);
    expect(accuracy.completed).toBe(true);
  });

  it('학습 모드 inline 풀이는 accuracy 인정 X (Quest 세션만)', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      lessonAttemptsByDay: {
        [TODAY_KEY]: { total: 100, bySubject: { adsp: 100 } },
      },
    };
    const [, accuracy] = getTodayQuests(store, NOW);
    expect(accuracy.completed).toBe(false);
  });
});

describe('getTodayQuests — variety', () => {
  it('한 과목 sessions 만 → 1/2', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      sessions: [session('adsp', 5, 3)],
    };
    const [, , variety] = getTodayQuests(store, NOW);
    expect(variety.progress).toBe(1);
    expect(variety.completed).toBe(false);
  });

  it('두 과목 sessions → 2/2 완료', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      sessions: [session('adsp', 5, 3), session('sqld', 5, 3)],
    };
    const [, , variety] = getTodayQuests(store, NOW);
    expect(variety.progress).toBe(2);
    expect(variety.completed).toBe(true);
  });

  it('한 과목 sessions + 다른 과목 학습 모드 → 2/2 완료', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      sessions: [session('adsp', 5, 3)],
      lessonAttemptsByDay: {
        [TODAY_KEY]: { total: 3, bySubject: { sqld: 3 } },
      },
    };
    const [, , variety] = getTodayQuests(store, NOW);
    expect(variety.progress).toBe(2);
    expect(variety.completed).toBe(true);
  });

  it('학습 모드 두 과목만 진행 → 2/2 완료', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      lessonAttemptsByDay: {
        [TODAY_KEY]: { total: 6, bySubject: { adsp: 3, sqld: 3 } },
      },
    };
    const [, , variety] = getTodayQuests(store, NOW);
    expect(variety.progress).toBe(2);
    expect(variety.completed).toBe(true);
  });
});

describe('completedCount', () => {
  it('완료 수만 세기', () => {
    const quests = getTodayQuests(emptyStore(), NOW);
    expect(completedCount(quests)).toBe(0);
  });

  it('3종 모두 완료 시 3 반환', () => {
    const store: ProgressStore = {
      ...emptyStore(),
      sessions: [session('adsp', 10, 8), session('sqld', 5, 4)],
      lessonAttemptsByDay: {
        [TODAY_KEY]: { total: 5, bySubject: { adsp: 3, sqld: 2 } },
      },
    };
    const quests = getTodayQuests(store, NOW);
    expect(completedCount(quests)).toBe(3);
  });
});

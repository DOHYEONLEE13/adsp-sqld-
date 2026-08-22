/**
 * 일일 퀘스트 — 복습·풀이·정확도 3종 목표.
 *
 * 풀이·정확도는 ProgressStore 에서 계산하고, 복습은 당일 만기 스냅샷을 사용한다.
 * 보상 수령 기록을 포함해 자정에 오늘 날짜 기준으로 자동 리셋된다.
 *
 * 퀘스트 목록:
 *   1. 오늘 만기 복습의 30% 완료
 *   2. 오늘 8문항 풀기 (sessions + 학습 모드 풀이 모두 포함)
 *   3. 오늘 문제 세션에서 정답 4개 맞히기
 */

import type { ProgressStore } from './storage';
import type { DailyReviewQuestProgress } from './dailyReviewQuest';

export type DailyQuestId = 'daily-review' | 'daily-volume' | 'daily-accuracy';

export const DAILY_QUEST_REWARDS: Record<DailyQuestId, number> = {
  'daily-review': 20,
  'daily-volume': 15,
  'daily-accuracy': 15,
};

export interface DailyQuest {
  id: DailyQuestId;
  title: string;
  description: string;
  icon: string;
  /** 0~target. 표시용. */
  progress: number;
  target: number;
  completed: boolean;
  rewardXp: number;
  claimed: boolean;
  /** 복습할 항목이 없는 날처럼 보상을 만들지 않는 완료 상태. */
  rewardAvailable: boolean;
}

function todayBounds(now: number): { start: number; end: number } {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.getTime(), end: end.getTime() };
}

/** 'YYYY-MM-DD' 로컬 자정 기준. storage.ts 의 dayKey 와 동일 규칙. */
function dayKey(at: number): string {
  const d = new Date(at);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function getTodayQuests(
  store: ProgressStore,
  now: number = Date.now(),
  reviewProgress: DailyReviewQuestProgress = {
    total: 0,
    completed: 0,
    target: 0,
    hasWork: false,
    isComplete: true,
  },
): DailyQuest[] {
  const { start, end } = todayBounds(now);
  const todaySessions = store.sessions.filter(
    (s) => s.at >= start && s.at < end,
  );
  const todayLesson =
    (store.lessonAttemptsByDay ?? {})[dayKey(now)] ?? {
      total: 0,
      bySubject: {},
    };
  const claimedIds = new Set(
    store.dailyQuestClaims?.day === dayKey(now)
      ? store.dailyQuestClaims.ids
      : [],
  );

  const review: DailyQuest = {
    id: 'daily-review',
    title: '복습',
    description: reviewProgress.hasWork
      ? `복습 ${reviewProgress.total}개 중 ${reviewProgress.target}개 완료하기`
      : '오늘 예정된 복습이 없어요',
    icon: '↻',
    progress: Math.min(reviewProgress.completed, reviewProgress.target),
    target: reviewProgress.target,
    completed: reviewProgress.isComplete,
    rewardXp: DAILY_QUEST_REWARDS['daily-review'],
    claimed:
      !reviewProgress.hasWork || claimedIds.has('daily-review'),
    rewardAvailable: reviewProgress.hasWork,
  };

  // 2) volume — sessions 풀이 + 학습 모드 inline 풀이 합산
  const sessionAttempts = todaySessions.reduce((n, s) => n + s.total, 0);
  const totalAttempts = sessionAttempts + todayLesson.total;
  const volumeTarget = 8;
  const volume: DailyQuest = {
    id: 'daily-volume',
    title: '풀이',
    description: `${volumeTarget}문항 풀기`,
    icon: '📚',
    progress: Math.min(totalAttempts, volumeTarget),
    target: volumeTarget,
    completed: totalAttempts >= volumeTarget,
    rewardXp: DAILY_QUEST_REWARDS['daily-volume'],
    claimed: claimedIds.has('daily-volume'),
    rewardAvailable: true,
  };

  // 3) accuracy — 사용자가 이해하기 쉽도록 오늘 문제 세션의 정답 수를 합산한다.
  const correctTarget = 4;
  const totalCorrect = todaySessions.reduce(
    (count, session) => count + session.correctCount,
    0,
  );
  const accuracy: DailyQuest = {
    id: 'daily-accuracy',
    title: '정확도',
    description: `문제 ${correctTarget}개 정답 맞히기`,
    icon: '🎯',
    progress: Math.min(totalCorrect, correctTarget),
    target: correctTarget,
    completed: totalCorrect >= correctTarget,
    rewardXp: DAILY_QUEST_REWARDS['daily-accuracy'],
    claimed: claimedIds.has('daily-accuracy'),
    rewardAvailable: true,
  };

  return [review, volume, accuracy];
}

/** 완료한 퀘스트 수. */
export function completedCount(quests: readonly DailyQuest[]): number {
  return quests.filter((q) => q.completed).length;
}

/**
 * 일일 퀘스트 — 3종 고정 목표를 progress.sessions + lessonAttemptsByDay 에서 파생.
 *
 * 퀘스트 진행 상황은 별도 저장소 없이 ProgressStore 로부터 매일 계산.
 * 자정에 자동 리셋 (오늘 날짜 기준 세션·학습 풀이만 집계).
 *
 * 퀘스트 목록:
 *   1. 오늘 15문항 풀기 (sessions + 학습 모드 풀이 모두 포함)
 *   2. 세션 한 번 이상 정답률 80% 이상 (최소 5문) — Quest 세션만 (정확도는 묶음 단위)
 *   3. 과목 두 개 모두 오늘 학습 진행 (ADSP · SQLD) — sessions 또는 학습 모드
 */

import type { ProgressStore } from './storage';

export type DailyQuestId = 'daily-volume' | 'daily-accuracy' | 'daily-variety';

export interface DailyQuest {
  id: DailyQuestId;
  title: string;
  description: string;
  icon: string;
  /** 0~target. 표시용. */
  progress: number;
  target: number;
  completed: boolean;
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

  // 1) volume — sessions 풀이 + 학습 모드 inline 풀이 합산
  const sessionAttempts = todaySessions.reduce((n, s) => n + s.total, 0);
  const totalAttempts = sessionAttempts + todayLesson.total;
  const volumeTarget = 15;
  const volume: DailyQuest = {
    id: 'daily-volume',
    title: '오늘의 퀘스트 · 풀이량',
    description: `${volumeTarget}문항 풀기`,
    icon: '📚',
    progress: Math.min(totalAttempts, volumeTarget),
    target: volumeTarget,
    completed: totalAttempts >= volumeTarget,
  };

  // 2) accuracy — Quest 세션 단위만 (정확도는 묶음 풀이 기준이라 학습 모드 inline 제외).
  const hasAccuracyWin = todaySessions.some(
    (s) => s.total >= 5 && s.correctCount / s.total >= 0.8,
  );
  const accuracy: DailyQuest = {
    id: 'daily-accuracy',
    title: '오늘의 퀘스트 · 정확도',
    description: '한 세션 정답률 80%+ (최소 5문)',
    icon: '🎯',
    progress: hasAccuracyWin ? 1 : 0,
    target: 1,
    completed: hasAccuracyWin,
  };

  // 3) variety — 두 과목 모두 오늘 학습 (sessions 또는 학습 모드 inline)
  const subjects = new Set<string>();
  for (const s of todaySessions) subjects.add(s.subject);
  for (const sub of Object.keys(todayLesson.bySubject)) {
    if ((todayLesson.bySubject as Record<string, number>)[sub] > 0) {
      subjects.add(sub);
    }
  }
  const variety: DailyQuest = {
    id: 'daily-variety',
    title: '오늘의 퀘스트 · 다양성',
    description: 'ADSP · SQLD 모두 학습 진행',
    icon: '🪐',
    progress: subjects.size,
    target: 2,
    completed: subjects.size >= 2,
  };

  return [volume, accuracy, variety];
}

/** 완료한 퀘스트 수. */
export function completedCount(quests: readonly DailyQuest[]): number {
  return quests.filter((q) => q.completed).length;
}

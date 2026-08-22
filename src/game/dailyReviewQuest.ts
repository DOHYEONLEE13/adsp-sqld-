/**
 * 오늘의 복습 퀘스트 진행도.
 *
 * 복습을 끝내면 SM-2의 due_date가 미래로 이동하므로 현재 큐 길이만으로는
 * 오늘 완료한 양을 알 수 없다. 하루 동안 확인된 만기 문항을 고정하고, 실제로
 * 복습한 문항 ID만 별도로 기록해 30% 목표를 안정적으로 계산한다.
 */

const STORAGE_KEY = 'questdp.daily-review-quest.v1';
export const DAILY_REVIEW_UPDATED_EVENT = 'questdp:daily-review-updated';

interface StoredDailyReviewQuest {
  version: 1;
  day: string;
  dueIds: string[];
  completedIds: string[];
}

export interface DailyReviewQuestProgress {
  total: number;
  completed: number;
  target: number;
  hasWork: boolean;
  isComplete: boolean;
}

function localDayKey(at: Date): string {
  const y = at.getFullYear();
  const m = String(at.getMonth() + 1).padStart(2, '0');
  const d = String(at.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function emptyState(now: Date): StoredDailyReviewQuest {
  return {
    version: 1,
    day: localDayKey(now),
    dueIds: [],
    completedIds: [],
  };
}

function readState(now: Date): StoredDailyReviewQuest {
  if (typeof window === 'undefined') return emptyState(now);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState(now);
    const parsed = JSON.parse(raw) as Partial<StoredDailyReviewQuest>;
    if (
      parsed.version !== 1 ||
      parsed.day !== localDayKey(now) ||
      !Array.isArray(parsed.dueIds) ||
      !Array.isArray(parsed.completedIds)
    ) {
      return emptyState(now);
    }
    return {
      version: 1,
      day: parsed.day,
      dueIds: [...new Set(parsed.dueIds.filter((id): id is string => typeof id === 'string'))],
      completedIds: [
        ...new Set(parsed.completedIds.filter((id): id is string => typeof id === 'string')),
      ],
    };
  } catch {
    return emptyState(now);
  }
}

function writeState(state: StoredDailyReviewQuest): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent(DAILY_REVIEW_UPDATED_EVENT));
    });
  } catch {
    // 저장 공간이 막혀도 복습 자체는 계속 진행한다.
  }
}

function summarize(state: StoredDailyReviewQuest): DailyReviewQuestProgress {
  const due = new Set(state.dueIds);
  const completed = new Set(
    state.completedIds.filter((questionId) => due.has(questionId)),
  ).size;
  const total = due.size;
  const target = total > 0 ? Math.max(1, Math.ceil(total * 0.3)) : 0;
  return {
    total,
    completed,
    target,
    hasWork: total > 0,
    isComplete: total === 0 || completed >= target,
  };
}

/** 하단 내비처럼 현재 저장된 복습 퀘스트 상태만 읽어야 하는 UI에서 사용한다. */
export function getDailyReviewQuestProgress(
  now: Date = new Date(),
): DailyReviewQuestProgress {
  return summarize(readState(now));
}

/** 현재 만기 큐를 오늘의 기준 목록에 합치고 진행도를 반환한다. */
export function syncDailyReviewQuest(
  dueQuestionIds: readonly string[],
  now: Date = new Date(),
): DailyReviewQuestProgress {
  const state = readState(now);
  const dueIds = [...new Set([...state.dueIds, ...dueQuestionIds])];
  if (dueIds.length !== state.dueIds.length) {
    state.dueIds = dueIds;
    writeState(state);
  }
  return summarize(state);
}

/** 풀이 직전 만기 상태였던 문항 한 건을 오늘 복습 완료로 기록한다. */
export function recordDailyReviewCompletion(
  questionId: string,
  attemptedAt: Date = new Date(),
): void {
  const state = readState(attemptedAt);
  state.dueIds = [...new Set([...state.dueIds, questionId])];
  state.completedIds = [...new Set([...state.completedIds, questionId])];
  writeState(state);
}

/** 테스트와 사용자 데이터 초기화 흐름에서만 사용한다. */
export function clearDailyReviewQuest(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

/**
 * 학습 진행 저장소 — localStorage 기반.
 *
 * 데이터 단위:
 *   - 문항별 통계 (QuestionStat): 풀이/정답 카운트, 최근 정답 여부, 이동 평균 시간
 *   - 세션 이력 (SessionRecord): 완료한 세션마다 스냅샷
 *
 * 모든 변경은 pure 함수로 새 store 를 만들고, `saveProgress` 로 flush 한 뒤
 * subscribe 리스너에게 알려서 React 가 re-render 합니다 (`useProgress` 훅).
 *
 * 버전 필드(`version`)는 추후 스키마 변경 시 마이그레이션 hook 용.
 */

import type { Subject } from '@/types/question';
import type { QuestSummary } from './types';

const STORAGE_KEY = 'questdp.progress.v1';
const SCHEMA_VERSION = 1 as const;
/** 세션 이력이 이보다 많이 쌓이면 오래된 것부터 자릅니다. */
const MAX_SESSION_HISTORY = 200;

export interface QuestionStat {
  /** 풀이 시도 횟수. */
  attempts: number;
  /** 맞춘 횟수. */
  correct: number;
  /** 현재 연속 오답. 맞추면 0 으로 리셋. 약점 점수 계산에 쓰입니다. */
  wrongStreak: number;
  /** 마지막 풀이의 정답 여부. */
  lastCorrect: boolean;
  /** 마지막 풀이 epoch ms. */
  lastSeenAt: number;
  /** 마지막 풀이 소요 시간 ms. */
  lastTimeMs: number;
  /** 지수 이동 평균 (α = 0.3) — 최근 풀이에 가중. */
  avgTimeMs: number;
}

export interface SessionRecord {
  /** 세션 완료 시점. */
  at: number;
  subject: Subject;
  chapter: number;
  chapterTitle: string;
  topic: string | null;
  total: number;
  correctCount: number;
  totalTimeMs: number;
}

export interface ProgressStore {
  version: typeof SCHEMA_VERSION;
  questionStats: Record<string, QuestionStat>;
  sessions: SessionRecord[];
  /** 마지막 Daily Mission 시작 epoch ms. UI 가 "오늘 완료" 를 계산. */
  lastDailyMissionAt?: number;
  /**
   * 사용자가 메인으로 공부 중인 과목.
   * - undefined = 아직 안 골랐음 (첫 방문) → onboarding chooser 표시
   * - 'adsp' / 'sqld' = 정해진 활성 과목 → `#/game` 진입 시 `#/game/${activeSubject}` 로 자동 redirect
   * 사용자는 Planet 화면의 "다른 과목" 버튼으로 언제든 변경 가능 (chooser 재진입).
   */
  activeSubject?: Subject;
  createdAt: number;
  updatedAt: number;
}

// ----------------------------------------------------------------
// Load / save
// ----------------------------------------------------------------

function emptyStore(): ProgressStore {
  const now = Date.now();
  return {
    version: SCHEMA_VERSION,
    questionStats: {},
    sessions: [],
    createdAt: now,
    updatedAt: now,
  };
}

/** localStorage 에서 로드. 손상/버전 불일치면 empty 로 대체. */
function loadStore(): ProgressStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<ProgressStore>;
    if (parsed?.version !== SCHEMA_VERSION) return emptyStore();
    return {
      version: SCHEMA_VERSION,
      questionStats: parsed.questionStats ?? {},
      sessions: parsed.sessions ?? [],
      lastDailyMissionAt: parsed.lastDailyMissionAt,
      activeSubject: parsed.activeSubject,
      createdAt: parsed.createdAt ?? Date.now(),
      updatedAt: parsed.updatedAt ?? Date.now(),
    };
  } catch {
    return emptyStore();
  }
}

function saveStore(store: ProgressStore): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // quota/privacy mode — 조용히 무시. 메모리 상태는 유지됩니다.
  }
}

// ----------------------------------------------------------------
// In-memory state + subscribe/publish (for useSyncExternalStore)
// ----------------------------------------------------------------

let current: ProgressStore = loadStore();
const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): ProgressStore {
  return current;
}

function commit(next: ProgressStore): void {
  current = next;
  saveStore(next);
  for (const l of listeners) l();
}

// ----------------------------------------------------------------
// Mutations
// ----------------------------------------------------------------

/** 한 문제에 대한 응답을 통계에 반영한 새 store 를 반환. */
function applyAnswer(
  store: ProgressStore,
  questionId: string,
  input: { correct: boolean; timeMs: number; at: number },
): ProgressStore {
  const prev = store.questionStats[questionId];
  const α = 0.3;
  const next: QuestionStat = prev
    ? {
        attempts: prev.attempts + 1,
        correct: prev.correct + (input.correct ? 1 : 0),
        wrongStreak: input.correct ? 0 : prev.wrongStreak + 1,
        lastCorrect: input.correct,
        lastSeenAt: input.at,
        lastTimeMs: input.timeMs,
        avgTimeMs: Math.round(
          α * input.timeMs + (1 - α) * prev.avgTimeMs,
        ),
      }
    : {
        attempts: 1,
        correct: input.correct ? 1 : 0,
        wrongStreak: input.correct ? 0 : 1,
        lastCorrect: input.correct,
        lastSeenAt: input.at,
        lastTimeMs: input.timeMs,
        avgTimeMs: input.timeMs,
      };

  return {
    ...store,
    questionStats: { ...store.questionStats, [questionId]: next },
    updatedAt: input.at,
  };
}

/** 완료된 세션의 응답 전부를 반영하고, 세션 레코드도 추가. */
export function recordSessionSummary(summary: QuestSummary): void {
  const at = Date.now();
  let next = current;
  for (const a of summary.answers) {
    next = applyAnswer(next, a.questionId, {
      correct: a.correct,
      timeMs: a.timeMs,
      at,
    });
  }

  const record: SessionRecord = {
    at,
    subject: summary.subject,
    chapter: summary.chapter,
    chapterTitle: summary.chapterTitle,
    topic: summary.topic,
    total: summary.total,
    correctCount: summary.correctCount,
    totalTimeMs: summary.totalTimeMs,
  };

  const sessions = [record, ...next.sessions].slice(0, MAX_SESSION_HISTORY);
  commit({ ...next, sessions, updatedAt: at });
}

/**
 * 레슨 스텝의 단일 문제 응답 기록.
 * Quest 세션이 아닌 개념 학습 중 즉석 풀이도 같은 stat 으로 누적됩니다.
 */
export function recordSingleAnswer(
  questionId: string,
  correct: boolean,
  timeMs: number,
): void {
  const at = Date.now();
  const next = applyAnswer(current, questionId, { correct, timeMs, at });
  commit({ ...next, updatedAt: at });
}

/** 개발자/사용자용 리셋 (#/stats 에 연결 예정). */
export function resetProgress(): void {
  commit(emptyStore());
}

/** Daily Mission 시작 시점 기록. */
export function markDailyMissionStarted(): void {
  commit({ ...current, lastDailyMissionAt: Date.now() });
}

/**
 * 메인 학습 과목을 정함 (onboarding 또는 "다른 과목" 전환).
 * 한 번 set 하면 `#/game` 진입 시 자동으로 해당 과목 Planet 으로 직진.
 */
export function setActiveSubject(subject: Subject): void {
  commit({ ...current, activeSubject: subject, updatedAt: Date.now() });
}

/**
 * 활성 과목 해제 — "다른 과목" 으로 가서 chooser 를 다시 노출시킬 때.
 * 다음 `#/game` 진입에서 chooser 가 보임. 이전 학습 데이터는 그대로 유지.
 */
export function clearActiveSubject(): void {
  if (current.activeSubject === undefined) return;
  const { activeSubject: _drop, ...rest } = current;
  void _drop;
  commit({ ...rest, updatedAt: Date.now() });
}

// ----------------------------------------------------------------
// Read-only accessors
// ----------------------------------------------------------------

export function getQuestionStat(id: string): QuestionStat | undefined {
  return current.questionStats[id];
}

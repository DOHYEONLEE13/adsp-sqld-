/**
 * 대시보드용 상위 집계.
 *
 * 저장소 내 `sessions` 과 `questionStats` 을 훑어서 KPI, 일자별 추이,
 * 연속 학습일(streak), 과목별 정답률 등을 뽑아냅니다. 순수 함수로 구성.
 */

import type { Subject } from '@/types/question';
import type { ProgressStore, SessionRecord } from './storage';

// ------------------------------------------------------------------
// 시간 헬퍼 — 로컬 자정 기준.
// ------------------------------------------------------------------

/** 로컬 자정 기준 타임스탬프. */
function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const DAY_MS = 24 * 60 * 60 * 1000;

// ------------------------------------------------------------------
// KPI
// ------------------------------------------------------------------

export interface DashboardKpi {
  totalAttempts: number;
  totalCorrect: number;
  /** 누적 정답률 (0~1). 0 attempts → 0. */
  overallAccuracy: number;
  /** 오늘(로컬 자정~) 풀이 수. */
  todayAttempts: number;
  /** 연속 학습일. 오늘 아직 학습 전이면 어제까지의 기록 유지. */
  streakDays: number;
  /** 전체 풀이 소요 시간 누적 ms. */
  totalTimeMs: number;
  /** 지금까지 완료한 세션 수. */
  sessionCount: number;
}

export function computeKpi(store: ProgressStore, now: number = Date.now()): DashboardKpi {
  let totalAttempts = 0;
  let totalCorrect = 0;
  for (const id in store.questionStats) {
    const s = store.questionStats[id]!;
    totalAttempts += s.attempts;
    totalCorrect += s.correct;
  }

  const todayStart = startOfDay(now);
  const todayAttempts = countAttemptsInRange(store, todayStart, now);

  const totalTimeMs = store.sessions.reduce((sum, s) => sum + s.totalTimeMs, 0);

  return {
    totalAttempts,
    totalCorrect,
    overallAccuracy: totalAttempts === 0 ? 0 : totalCorrect / totalAttempts,
    todayAttempts,
    streakDays: computeStreak(store, now),
    totalTimeMs,
    sessionCount: store.sessions.length,
  };
}

/** (start, end] 범위에 완료된 세션들의 총 풀이 수. */
function countAttemptsInRange(
  store: ProgressStore,
  startMs: number,
  endMs: number,
): number {
  let n = 0;
  for (const s of store.sessions) {
    if (s.at > startMs && s.at <= endMs) n += s.total;
  }
  return n;
}

/**
 * 연속 학습일 계산.
 * 오늘 세션이 있으면 오늘을 포함해서 거꾸로 하루씩 세션 존재 여부를 확인.
 * 오늘은 없고 어제까지 이어졌으면 어제 기준 연속일 반환 (grace 하루).
 */
export function computeStreak(store: ProgressStore, now: number = Date.now()): number {
  if (store.sessions.length === 0) return 0;
  const days = new Set<number>();
  for (const s of store.sessions) days.add(startOfDay(s.at));

  const today = startOfDay(now);
  let cursor = today;
  if (!days.has(cursor)) {
    // 오늘 없으면 어제부터 카운트 (grace).
    cursor -= DAY_MS;
    if (!days.has(cursor)) return 0;
  }

  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor -= DAY_MS;
  }
  return streak;
}

// ------------------------------------------------------------------
// 7일 추이
// ------------------------------------------------------------------

export interface DailyBucket {
  /** 로컬 자정 ms. */
  day: number;
  attempts: number;
  correct: number;
  /** 0~1. attempts===0 면 0. */
  accuracy: number;
}

/** 오늘을 포함한 최근 N일 일별 집계. 오래된 → 최신 순. */
export function recentDailyTrend(
  store: ProgressStore,
  days: number,
  now: number = Date.now(),
): DailyBucket[] {
  const today = startOfDay(now);
  const buckets: DailyBucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    buckets.push({
      day: today - i * DAY_MS,
      attempts: 0,
      correct: 0,
      accuracy: 0,
    });
  }
  for (const s of store.sessions) {
    const dayKey = startOfDay(s.at);
    const b = buckets.find((x) => x.day === dayKey);
    if (!b) continue;
    b.attempts += s.total;
    b.correct += s.correctCount;
  }
  for (const b of buckets) {
    b.accuracy = b.attempts === 0 ? 0 : b.correct / b.attempts;
  }
  return buckets;
}

// ------------------------------------------------------------------
// 과목별
// ------------------------------------------------------------------

export interface SubjectBreakdown {
  subject: Subject;
  sessionCount: number;
  totalAttempts: number;
  totalCorrect: number;
  /** 세션에 포함된 풀이 기준 정답률. */
  accuracy: number;
  totalTimeMs: number;
}

export function computeSubjectBreakdown(store: ProgressStore): SubjectBreakdown[] {
  const byKey = new Map<Subject, SubjectBreakdown>();
  for (const s of store.sessions) {
    const cur = byKey.get(s.subject) ?? emptyBreakdown(s.subject);
    cur.sessionCount += 1;
    cur.totalAttempts += s.total;
    cur.totalCorrect += s.correctCount;
    cur.totalTimeMs += s.totalTimeMs;
    byKey.set(s.subject, cur);
  }
  for (const b of byKey.values()) {
    b.accuracy = b.totalAttempts === 0 ? 0 : b.totalCorrect / b.totalAttempts;
  }
  return Array.from(byKey.values()).sort((a, b) => b.totalAttempts - a.totalAttempts);
}

function emptyBreakdown(subject: Subject): SubjectBreakdown {
  return {
    subject,
    sessionCount: 0,
    totalAttempts: 0,
    totalCorrect: 0,
    accuracy: 0,
    totalTimeMs: 0,
  };
}

// ------------------------------------------------------------------
// 최근 세션
// ------------------------------------------------------------------

/** 이미 내림차순으로 저장됨 — slice 만 하면 됨. */
export function recentSessions(store: ProgressStore, limit = 10): SessionRecord[] {
  return store.sessions.slice(0, limit);
}

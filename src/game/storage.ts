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
import { pushSessionToServer } from './sessionSync';
import { pushQuestionStatToServer } from './questionStatSync';
import { pushProgressMetaToServer } from './progressMetaSync';
import { claimDailyQuestBonusOnServer } from './dailyBonusSync';

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
  /** 라벨 — "챕터 1 모의고사 1" 같은 슬롯 식별용. 미지정 시 일반 세션. */
  label?: string;
  /** 이번 세션에서 틀린 문항 ID. 모의고사 오답 복습 진입점. */
  wrongQuestionIds?: string[];
  /**
   * N회독 차수 (1~). 미존재 (구 데이터) = 1.
   * Pass 시스템: docs/n-pass-design.md 참고.
   * 챕터 회독 완료 판정 + 친구 리더보드 진행 점에 사용.
   */
  passNumber?: number;
}

export interface PartReviewCompletion {
  completedAt: number;
  correctCount: number;
  totalCount: number;
}

export interface ProgressStore {
  version: typeof SCHEMA_VERSION;
  questionStats: Record<string, QuestionStat>;
  sessions: SessionRecord[];
  partReviewCompletions?: Record<string, PartReviewCompletion>;
  /** 마지막 Daily Mission 시작 epoch ms. UI 가 "오늘 완료" 를 계산. */
  lastDailyMissionAt?: number;
  /**
   * 사용자가 메인으로 공부 중인 과목.
   * - undefined = 아직 안 골랐음 (첫 방문) → onboarding chooser 표시
   * - 'adsp' / 'sqld' = 정해진 활성 과목 → `#/game` 진입 시 `#/game/${activeSubject}` 로 자동 redirect
   * 사용자는 Planet 화면의 "다른 과목" 버튼으로 언제든 변경 가능 (chooser 재진입).
   */
  activeSubject?: Subject;
  /**
   * 레슨 step 단일 문제 풀이로 누적된 XP. (sessions 의 합산과는 별도)
   * 같은 문제의 첫 정답에만 +XP_PER_LESSON_CORRECT 부여 — 같은 문제를 여러 번 정답해도
   * 무한 XP 가 쌓이지 않게 함. 세트 완주 보너스 (정확도·스트릭) 는 sessions 에서 별도.
   */
  lessonXp?: number;
  /** 로그인 사용자의 서버 기준 표시 XP. 존재하면 화면 XP 계산의 진실로 사용한다. */
  serverTotalXp?: number;
  /**
   * 사용자가 상점 (XP→에너지 등) 에서 누적 소비한 XP. 표시 XP = totalXp - spentXp.
   * computePlayerStats 가 차감해 화면에 보여줌 — 게임 내 currency 처럼 작동.
   */
  spentXp?: number;
  /**
   * 학습 모드 (LessonScreen / DialogueLesson) inline 풀이의 일별 집계.
   * 일일 퀘스트 (volume / variety) + streak 계산에 sessions 와 함께 활용.
   * key = 'YYYY-MM-DD' (로컬 자정 기준). 30일 초과분은 자동 정리.
   */
  lessonAttemptsByDay?: Record<
    string,
    { total: number; bySubject: Partial<Record<Subject, number>> }
  >;
  /**
   * 일일 퀘스트 3종 모두 완료 시 보너스 XP (+50) 청구한 날짜 (YYYY-MM-DD).
   * 같은 날 중복 지급 방지. 오늘이 아니면 다음 청구 가능.
   */
  dailyBonusClaimedAt?: string;
  createdAt: number;
  updatedAt: number;
}

/** 레슨 step 정답 시 부여되는 XP (한 문제당). */
export const XP_PER_LESSON_CORRECT = 10;

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
      partReviewCompletions: parsed.partReviewCompletions ?? {},
      lastDailyMissionAt: parsed.lastDailyMissionAt,
      activeSubject: parsed.activeSubject,
      lessonXp: parsed.lessonXp,
      serverTotalXp: parsed.serverTotalXp,
      spentXp: parsed.spentXp,
      lessonAttemptsByDay: parsed.lessonAttemptsByDay ?? {},
      dailyBonusClaimedAt: parsed.dailyBonusClaimedAt,
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

function applyLessonXpCorrection(
  localOptimisticXp: number,
  serverAwardedXp: number,
  options: { clearDailyBonusClaim?: string } = {},
): void {
  const safeLocal = Math.max(0, Math.floor(localOptimisticXp));
  const safeServer = Math.max(0, Math.floor(serverAwardedXp));
  const correction = safeServer - safeLocal;
  if (correction === 0 && !options.clearDailyBonusClaim) return;

  const next: ProgressStore = {
    ...current,
    lessonXp: Math.max(0, (current.lessonXp ?? 0) + correction),
    updatedAt: Date.now(),
  };

  if (
    options.clearDailyBonusClaim &&
    next.dailyBonusClaimedAt === options.clearDailyBonusClaim
  ) {
    next.dailyBonusClaimedAt = undefined;
  }

  if (typeof current.serverTotalXp === 'number') {
    next.serverTotalXp = Math.max(0, current.serverTotalXp + correction);
  }

  commit(next);
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

  const wrongQuestionIds = summary.answers
    .filter((a) => !a.correct)
    .map((a) => a.questionId);

  const record: SessionRecord = {
    at,
    subject: summary.subject,
    chapter: summary.chapter,
    chapterTitle: summary.chapterTitle,
    topic: summary.topic,
    total: summary.total,
    correctCount: summary.correctCount,
    totalTimeMs: summary.totalTimeMs,
    label: summary.label,
    wrongQuestionIds: wrongQuestionIds.length > 0 ? wrongQuestionIds : undefined,
    passNumber: summary.passNumber,
  };

  const sessions = [record, ...next.sessions].slice(0, MAX_SESSION_HISTORY);
  commit({ ...next, sessions, updatedAt: at });

  // 백그라운드로 server 에 push. 미로그인·env 미설정이면 outbox 에 쌓이고 끝.
  void pushSessionToServer(summary);
}

/**
 * questionId 에서 subject 추출. 형식 `<subject>-<chapter>-...` 이라
 * 첫 segment 가 subject. 알 수 없으면 undefined.
 */
function subjectFromQuestionId(questionId: string): Subject | undefined {
  const seg = questionId.split('-')[0];
  if (seg === 'adsp' || seg === 'sqld') return seg;
  return undefined;
}

/** epoch ms → 'YYYY-MM-DD' (로컬 자정 기준). */
function dayKey(at: number): string {
  const d = new Date(at);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/**
 * lessonAttemptsByDay 에 오늘 +1. 30일 초과 자동 정리.
 * sessions 와 별개 카운터이므로 일일 퀘스트 / streak 계산에 합쳐 사용.
 */
function bumpLessonAttempt(
  store: ProgressStore,
  questionId: string,
  at: number,
): ProgressStore {
  const subject = subjectFromQuestionId(questionId);
  const key = dayKey(at);
  const prev = store.lessonAttemptsByDay ?? {};
  const today = prev[key] ?? { total: 0, bySubject: {} };
  const nextToday = {
    total: today.total + 1,
    bySubject: {
      ...today.bySubject,
      ...(subject
        ? { [subject]: (today.bySubject[subject] ?? 0) + 1 }
        : {}),
    },
  };
  // 30일 초과 자동 정리 — 자정 기준 30일 전 이전 day key 제거.
  const cutoff = new Date(at);
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffKey = dayKey(cutoff.getTime());
  const cleaned: typeof prev = {};
  for (const [k, v] of Object.entries(prev)) {
    if (k >= cutoffKey) cleaned[k] = v;
  }
  cleaned[key] = nextToday;
  return { ...store, lessonAttemptsByDay: cleaned };
}

/**
 * 레슨 스텝의 단일 문제 응답 기록.
 * Quest 세션이 아닌 개념 학습 중 즉석 풀이도 같은 stat 으로 누적됩니다.
 * 같은 문제의 [첫 정답] 에만 +XP_PER_LESSON_CORRECT 부여.
 *
 * @returns 이번 답으로 부여된 XP 양 (UI 토스트용). 첫 정답이 아니면 0.
 */
export function recordSingleAnswer(
  questionId: string,
  correct: boolean,
  timeMs: number,
  stepKey?: string | null,
  selectedIndex?: number,
  sessionToken?: string | null,
): number {
  const at = Date.now();
  const prevStat = current.questionStats[questionId];
  // 첫 정답인지 — 이전에 한 번도 안 맞췄고 이번에 맞췄을 때.
  const isFirstCorrect =
    correct && (!prevStat || prevStat.correct === 0);
  const xpAwarded = isFirstCorrect ? XP_PER_LESSON_CORRECT : 0;

  let next = applyAnswer(current, questionId, { correct, timeMs, at });
  const nextLessonXp = (current.lessonXp ?? 0) + xpAwarded;
  const nextServerTotalXp =
    typeof current.serverTotalXp === 'number'
      ? Math.max(0, current.serverTotalXp + xpAwarded)
      : current.serverTotalXp;
  // 일일 퀘스트 / streak 계산용 — 학습 모드 풀이도 일별로 집계.
  next = bumpLessonAttempt(next, questionId, at);
  commit({
    ...next,
    lessonXp: nextLessonXp,
    serverTotalXp: nextServerTotalXp,
    updatedAt: at,
  });

  // 서버에도 반영 (인증돼 있을 때만, fire-and-forget). question_stats 는 PUT-style.
  const stat = next.questionStats[questionId];
  if (stat) {
    void pushQuestionStatToServer(questionId, stat, {
      correct,
      selectedIndex,
      sessionToken,
      timeMs,
      stepKey,
    }).then((result) => {
      applyLessonXpCorrection(xpAwarded, result?.xpAwarded ?? 0);
    });
  }
  return xpAwarded;
}

export function markPartReviewCompleted(
  reviewKey: string,
  correctCount: number,
  totalCount: number,
): void {
  if (!reviewKey) return;
  const at = Date.now();
  const safeTotal = Math.max(0, Math.floor(totalCount));
  const safeCorrect = Math.max(
    0,
    Math.min(safeTotal, Math.floor(correctCount)),
  );
  commit({
    ...current,
    partReviewCompletions: {
      ...(current.partReviewCompletions ?? {}),
      [reviewKey]: {
        completedAt: at,
        correctCount: safeCorrect,
        totalCount: safeTotal,
      },
    },
    updatedAt: at,
  });
}

/** 일일 퀘스트 3종 모두 완료 시 부여되는 보너스 XP. 같은 날 1회 한정. */
export const XP_DAILY_BONUS = 50;

/**
 * 일일 퀘스트 보너스 XP 청구. 오늘 이미 청구했으면 0 반환.
 * 호출 측 (QuestsPage) 가 3종 완료 여부를 판단 후 호출. 같은 날 중복 청구는
 * 자동 차단 (dailyBonusClaimedAt 에 오늘 날짜 마킹).
 *
 * @returns 지급된 XP (이미 청구했으면 0).
 */
export function claimDailyQuestBonus(): number {
  const at = Date.now();
  const todayKey = dayKey(at);
  if (current.dailyBonusClaimedAt === todayKey) return 0;
  const nextLessonXp = (current.lessonXp ?? 0) + XP_DAILY_BONUS;
  commit({
    ...current,
    lessonXp: nextLessonXp,
    dailyBonusClaimedAt: todayKey,
    updatedAt: at,
  });
  void claimDailyQuestBonusOnServer().then((result) => {
    if (!result || !result.ok) {
      applyLessonXpCorrection(XP_DAILY_BONUS, 0, {
        clearDailyBonusClaim: todayKey,
      });
      return;
    }
    applyLessonXpCorrection(XP_DAILY_BONUS, result.xpAwarded);
  });
  return XP_DAILY_BONUS;
}

/** 오늘 이미 보너스 청구했는지. */
export function hasDailyBonusBeenClaimedToday(
  store: ProgressStore,
  now: number = Date.now(),
): boolean {
  return store.dailyBonusClaimedAt === dayKey(now);
}

/** 개발자/사용자용 리셋 (#/stats 에 연결 예정). */
export function resetProgress(): void {
  commit(emptyStore());
}

/**
 * progressSync.pullProgress() 가 머지 후 호출. server↔local 통합 store 로
 * 한꺼번에 교체. 직접 호출 금지 — 외부에선 progressSync 만 사용.
 */
export function replaceFromMerge(merged: ProgressStore): void {
  commit(merged);
}

/**
 * XP 소비 — 상점 (XP→에너지) 등에서 사용. spentXp 누적 + commit.
 * computePlayerStats 가 표시 XP 에서 자동 차감. 사용자 잔액 검사는 호출측 책임.
 */
export function spendXp(amount: number): void {
  if (amount <= 0) return;
  const prevSpent = current.spentXp ?? 0;
  commit({ ...current, spentXp: prevSpent + amount, updatedAt: Date.now() });
}

/** Daily Mission 시작 시점 기록. */
export function markDailyMissionStarted(): void {
  const now = Date.now();
  commit({ ...current, lastDailyMissionAt: now });
  void pushProgressMetaToServer({ last_daily_mission_at: new Date(now).toISOString() });
}

/**
 * 메인 학습 과목을 정함 (onboarding 또는 "다른 과목" 전환).
 * 한 번 set 하면 `#/game` 진입 시 자동으로 해당 과목 Planet 으로 직진.
 */
export function setActiveSubject(subject: Subject): void {
  commit({ ...current, activeSubject: subject, updatedAt: Date.now() });
  void pushProgressMetaToServer({
    active_subject: subject,
    learning_subject: subject,
  });
}

/** 관리자 통계용 현재 학습 과목. 컴활은 core router 상태와 분리해 저장한다. */
export function setLearningSubject(subject: Subject | 'comhwal'): void {
  void pushProgressMetaToServer({ learning_subject: subject });
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
  void pushProgressMetaToServer({ active_subject: null });
}

// ----------------------------------------------------------------
// Read-only accessors
// ----------------------------------------------------------------

export function getQuestionStat(id: string): QuestionStat | undefined {
  return current.questionStats[id];
}

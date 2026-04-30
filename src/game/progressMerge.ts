/**
 * progressMerge.ts — server ↔ local progress 머지 순수 함수.
 *
 * progressSync 의 pull 시 server 데이터와 현재 local 의 ProgressStore 를
 * 합쳐 새 store 를 만든다. 다기기 동기화의 핵심.
 *
 * 정책:
 *  - questionStats: per-question lastSeenAt 비교. 더 큰 쪽 채택.
 *    동률이면 server (관행상 server = 진실의 근원).
 *    한쪽에만 있는 항목은 그대로 보존.
 *  - sessions: server append-only. server list 가 진실. local 의 sessions 중
 *    server 에 같은 client_id 가 없는 것 (= 방금 push 됐는데 아직 server 응답
 *    안 옴) 만 살려서 prepend. limit 200 슬라이스.
 *  - meta (activeSubject, lastDailyMissionAt, lessonXp):
 *    - activeSubject: server 우선 (서버가 last-write-wins 권한)
 *    - lastDailyMissionAt: max(server, local)
 *    - lessonXp: max(server, local) — XP 손실 절대 방지
 *
 * TODO(server-clock): lastSeenAt 이 클라 시계라 두 기기 시계 차이만큼 race.
 *   향후 RPC 에서 server now() 를 강제하는 패턴으로 마이그.
 */

import type { ProgressStore, QuestionStat, SessionRecord } from './storage';

/** server question_stats row (snake_case). */
export interface ServerQuestionStatRow {
  question_id: string;
  attempts: number;
  correct: number;
  wrong_streak: number;
  last_correct: boolean;
  last_seen_at: string; // ISO timestamp
  last_time_ms: number;
  avg_time_ms: number;
}

/** server sessions row (snake_case). */
export interface ServerSessionRow {
  subject: 'adsp' | 'sqld';
  chapter: number;
  chapter_title: string;
  topic: string | null;
  total: number;
  correct_count: number;
  total_time_ms: number;
  label: string | null;
  wrong_question_ids: string[] | null;
  ended_at: string;
  client_id: string | null;
  pass_number?: number | null;
}

/** server profiles 의 progress 관련 메타. */
export interface ServerProgressMeta {
  active_subject: 'adsp' | 'sqld' | null;
  last_daily_mission_at: string | null;
  lesson_xp: number;
}

/** progressSync 가 pull 후 store 에 반영할 때 사용. */
export interface MergeInput {
  local: ProgressStore;
  serverStats: ServerQuestionStatRow[];
  serverSessions: ServerSessionRow[];
  serverMeta: ServerProgressMeta;
}

const MAX_SESSION_HISTORY = 200;

// ─── helpers ────────────────────────────────────────────────────────

function parseIso(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

function rowToStat(row: ServerQuestionStatRow): QuestionStat {
  return {
    attempts: row.attempts,
    correct: row.correct,
    wrongStreak: row.wrong_streak,
    lastCorrect: row.last_correct,
    lastSeenAt: parseIso(row.last_seen_at),
    lastTimeMs: row.last_time_ms,
    avgTimeMs: row.avg_time_ms,
  };
}

function rowToSession(row: ServerSessionRow): SessionRecord {
  return {
    at: parseIso(row.ended_at),
    subject: row.subject,
    chapter: row.chapter,
    chapterTitle: row.chapter_title,
    topic: row.topic,
    total: row.total,
    correctCount: row.correct_count,
    totalTimeMs: row.total_time_ms,
    label: row.label ?? undefined,
    wrongQuestionIds:
      row.wrong_question_ids && row.wrong_question_ids.length > 0
        ? row.wrong_question_ids
        : undefined,
    passNumber: row.pass_number ?? undefined,
  };
}

// ─── 메인 머지 ────────────────────────────────────────────────────────

/**
 * 순수 함수 — 입력 객체를 변경하지 않고 새 ProgressStore 반환.
 * progressSync 의 pull 마지막 단계에서 한 번 호출.
 */
export function mergeProgress(input: MergeInput): ProgressStore {
  const { local, serverStats, serverSessions, serverMeta } = input;

  // ── questionStats — per-question lastSeenAt 비교 ──────────────────
  const merged: Record<string, QuestionStat> = { ...local.questionStats };

  for (const row of serverStats) {
    const serverStat = rowToStat(row);
    const localStat = merged[row.question_id];
    if (!localStat) {
      // 서버에만 있음 → 그대로 채택
      merged[row.question_id] = serverStat;
      continue;
    }
    // 양쪽 모두 있음 — lastSeenAt 비교
    if (localStat.lastSeenAt > serverStat.lastSeenAt) {
      // local 이 더 신선 (방금 풀고 push 응답 전에 pull 트리거됐을 수 있음)
      // local 보존
      continue;
    }
    // server >= local: server 채택 (동률 tie-break 도 server)
    merged[row.question_id] = serverStat;
  }
  // 한쪽에만 있는 local 항목은 ...local.questionStats spread 로 자연 보존됨.

  // ── sessions — server append-only, local 중 미반영분만 prepend ────
  const serverSessionRecords = serverSessions.map(rowToSession);
  // 향후 client_id 매칭으로 outbox-pending 세션 prepend 하려면 사용:
  //   const serverClientIds = new Set(
  //     serverSessions.map((r) => r.client_id).filter((x): x is string => !!x),
  //   );
  // 현재는 ProgressStore.sessions 가 client_id 를 저장 안 하므로 미사용.

  // local 에는 client_id 가 직접 없으나 sessionSync 의 outbox 가 client_id 를
  // 관리 — 다만 ProgressStore.sessions 는 client_id 없이 SessionRecord 만 저장.
  // 따라서 local sessions 는 "최근 push 됐는데 server 응답 못 받은 케이스" 를
  // 식별할 키가 없음 → 보수적으로 server list 만 신뢰.
  // 단, server 가 빈 응답이면 local 보존 (네트워크 일시 실패 케이스).
  const sessions =
    serverSessionRecords.length > 0
      ? serverSessionRecords.slice(0, MAX_SESSION_HISTORY)
      : local.sessions;

  // ── meta ──────────────────────────────────────────────────────────
  const localDaily = local.lastDailyMissionAt ?? 0;
  const serverDaily = serverMeta.last_daily_mission_at
    ? parseIso(serverMeta.last_daily_mission_at)
    : 0;
  const lastDailyMissionAt = Math.max(localDaily, serverDaily);

  const localXp = local.lessonXp ?? 0;
  const lessonXp = Math.max(localXp, serverMeta.lesson_xp);

  // activeSubject: server 우선. server 가 null 이면 local 유지 (사용자가 방금
  // 골랐는데 push 못 한 케이스 보호).
  const activeSubject =
    serverMeta.active_subject ?? local.activeSubject ?? undefined;

  return {
    version: local.version,
    questionStats: merged,
    sessions,
    lastDailyMissionAt: lastDailyMissionAt > 0 ? lastDailyMissionAt : undefined,
    activeSubject,
    lessonXp,
    createdAt: local.createdAt,
    updatedAt: Date.now(),
  };
}

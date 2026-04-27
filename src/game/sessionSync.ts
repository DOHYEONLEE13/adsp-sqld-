/**
 * sessionSync.ts — 세션 종료 시 server 에 RPC `record_session` 으로 push.
 *
 * 흐름:
 *   1. recordSessionSummary() 가 로컬에 즉시 반영 (UI 반응성 즉각)
 *   2. 직후 본 모듈의 pushSessionToServer() 가 background 로 RPC 호출
 *   3. 실패 시 outbox 큐 (localStorage) 에 적재 → 다음 세션·로그인·flush 시 재시도
 *
 * 멱등성: 각 세션마다 client-side `client_id` 생성 → server 의 unique index 가
 *   중복 commit 차단. 같은 client_id 로 RPC 두 번 와도 한 row.
 *
 * env 미설정·미로그인이면 no-op (게스트 모드).
 */

import { getSupabase, onAuthStateChange } from '@/lib/supabase';
import type { QuestSummary } from './types';
import { computeMaxStreak, xpForSession } from './rpg';

const OUTBOX_KEY = 'questdp.session_outbox.v1';

interface PendingSession {
  /** 멱등 키. */
  client_id: string;
  /** 페이로드 — RPC 인자 그대로. */
  payload: RecordSessionArgs;
  /** 큐에 들어온 시점. */
  queuedAt: number;
}

interface RecordSessionArgs {
  p_subject: 'adsp' | 'sqld';
  p_chapter: number;
  p_chapter_title: string;
  p_topic: string | null;
  p_total: number;
  p_correct_count: number;
  p_total_time_ms: number;
  p_label: string | null;
  p_wrong_ids: string[];
  p_flow: string | null;
  p_xp_delta: number;
  p_answer_log: Array<{ question_id: string; correct: boolean; time_ms: number }>;
  p_client_id: string;
}

interface OutboxV1 {
  v: 1;
  pending: PendingSession[];
}

function loadOutbox(): OutboxV1 {
  if (typeof window === 'undefined') return { v: 1, pending: [] };
  try {
    const raw = window.localStorage.getItem(OUTBOX_KEY);
    if (!raw) return { v: 1, pending: [] };
    const obj = JSON.parse(raw) as OutboxV1;
    if (obj?.v !== 1 || !Array.isArray(obj.pending)) return { v: 1, pending: [] };
    return obj;
  } catch {
    return { v: 1, pending: [] };
  }
}

function saveOutbox(o: OutboxV1) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(o));
  } catch {
    /* 무시 */
  }
}

function genClientId(): string {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildArgs(summary: QuestSummary): RecordSessionArgs {
  const xp = xpForSession({
    correctCount: summary.correctCount,
    total: summary.total,
    maxStreak: computeMaxStreak(summary.answers),
  });
  return {
    p_subject: summary.subject,
    p_chapter: summary.chapter,
    p_chapter_title: summary.chapterTitle,
    p_topic: summary.topic,
    p_total: summary.total,
    p_correct_count: summary.correctCount,
    p_total_time_ms: summary.totalTimeMs,
    p_label: summary.label ?? null,
    p_wrong_ids: summary.answers.filter((a) => !a.correct).map((a) => a.questionId),
    p_flow: null,
    p_xp_delta: xp.total,
    p_answer_log: summary.answers.map((a) => ({
      question_id: a.questionId,
      correct: a.correct,
      time_ms: a.timeMs,
    })),
    p_client_id: genClientId(),
  };
}

/**
 * 세션 push. 로그인돼 있으면 RPC, 미로그인이면 outbox 에만 쌓아둠
 * (다음 로그인 후 flush). 실패해도 throw 안 함 — 게임은 계속 진행.
 */
export async function pushSessionToServer(summary: QuestSummary): Promise<void> {
  const args = buildArgs(summary);
  const sb = getSupabase();
  if (!sb) {
    queueSession(args);
    return;
  }

  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) {
    queueSession(args);
    return;
  }

  try {
    const { error } = await sb.rpc('record_session', args);
    if (error) {
      console.warn('[sessionSync] RPC failed, queueing', error.message);
      queueSession(args);
      return;
    }
    // 성공 — 큐에 있던 것도 한꺼번에 flush (성공률 높음)
    void flushOutbox();
  } catch (e) {
    console.warn('[sessionSync] RPC exception, queueing', e);
    queueSession(args);
  }
}

function queueSession(args: RecordSessionArgs) {
  const outbox = loadOutbox();
  // 같은 client_id 로 이미 있는지 확인 (멱등)
  if (outbox.pending.some((p) => p.client_id === args.p_client_id)) return;
  outbox.pending.push({
    client_id: args.p_client_id,
    payload: args,
    queuedAt: Date.now(),
  });
  saveOutbox(outbox);
}

/**
 * outbox 에 쌓인 세션을 모두 push 시도.
 * - 성공한 건 outbox 에서 제거.
 * - 실패하면 그대로 두고 다음 flush 에 재시도.
 */
export async function flushOutbox(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) return;

  const outbox = loadOutbox();
  if (outbox.pending.length === 0) return;

  const survivors: PendingSession[] = [];
  for (const item of outbox.pending) {
    try {
      const { error } = await sb.rpc('record_session', item.payload);
      if (error) {
        survivors.push(item);
      }
    } catch {
      survivors.push(item);
    }
  }

  saveOutbox({ v: 1, pending: survivors });
}

/** App mount 시 한 번 호출. SIGNED_IN 시 outbox 자동 flush. */
export function initSessionSync(): () => void {
  // 페이지 새로고침 시 이미 세션 있으면 즉시 시도
  void flushOutbox();

  const unsub = onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      void flushOutbox();
    }
  });

  return unsub;
}

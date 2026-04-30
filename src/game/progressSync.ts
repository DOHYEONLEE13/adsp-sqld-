/**
 * progressSync.ts — server ↔ local progress 양방향 sync.
 *
 * 다기기 동기화 결함 수정의 핵심 (2026-04-30).
 * 기존: localStorage 가 sole truth, server 에는 push 만, pull 없음.
 * 변경: SIGNED_IN 시 pull → mergeProgress → commit. 다른 기기 변경 흡수.
 *
 * 흐름:
 *   1. App mount + SIGNED_IN / online / visibilitychange → pullProgress()
 *   2. select question_stats / sessions(limit 200) / profiles 메타 (3 쿼리)
 *   3. mergeProgress() 순수 함수로 local 과 머지
 *   4. storage.replaceFromMerge() 로 commit + notify
 *
 * inflight tracker: pull 직전 진행 중인 push 들 await — race 방지.
 *
 * env 미설정·미로그인이면 no-op.
 */

import { getSupabase, onAuthStateChange } from '@/lib/supabase';
import {
  mergeProgress,
  type ServerProgressMeta,
  type ServerQuestionStatRow,
  type ServerSessionRow,
} from './progressMerge';
import { getSnapshot, replaceFromMerge } from './storage';

// ─── inflight tracker ──────────────────────────────────────────────
//
// storage.ts 의 메타 push (active_subject 등) 가 진행 중일 때 pull 이 트리거되면
// server 가 옛 값을 돌려줘 last-write-wins 가 의도와 다르게 동작할 수 있음.
// pull 진입 시 inflight 들을 모두 await 해 race 차단.

const inflightPushes = new Set<Promise<unknown>>();

/** storage.ts·questionStatSync.ts·sessionSync.ts 가 push 시작 시 호출. */
export function trackPush<T>(p: Promise<T>): Promise<T> {
  inflightPushes.add(p);
  void p.finally(() => inflightPushes.delete(p));
  return p;
}

/** pull 진입 시 진행 중인 모든 push 를 기다려 race 방지. */
async function awaitInflightPushes(): Promise<void> {
  if (inflightPushes.size === 0) return;
  await Promise.allSettled([...inflightPushes]);
}

// ─── pull ──────────────────────────────────────────────────────────

/**
 * server → local pull. 머지 후 storage 갱신.
 * 미로그인·env 미설정이면 no-op.
 */
export async function pullProgress(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) return;

  // 진행 중인 push 들 먼저 마무리
  await awaitInflightPushes();

  const userId = sess.session.user.id;

  // 3 쿼리 병렬 — 응답 시간 ↓
  const [statsRes, sessionsRes, metaRes] = await Promise.all([
    sb
      .from('question_stats')
      .select(
        'question_id, attempts, correct, wrong_streak, last_correct, last_seen_at, last_time_ms, avg_time_ms',
      )
      .eq('user_id', userId),
    sb
      .from('sessions')
      .select(
        'subject, chapter, chapter_title, topic, total, correct_count, total_time_ms, label, wrong_question_ids, ended_at, client_id, pass_number',
      )
      .eq('user_id', userId)
      .order('ended_at', { ascending: false })
      .limit(200),
    sb
      .from('profiles')
      .select('active_subject, last_daily_mission_at, lesson_xp')
      .eq('id', userId)
      .maybeSingle(),
  ]);

  if (statsRes.error || sessionsRes.error || metaRes.error) {
    // 한 쿼리라도 실패면 전체 보류 — 다음 트리거에 재시도
    return;
  }

  const serverStats = (statsRes.data ?? []) as ServerQuestionStatRow[];
  const serverSessions = (sessionsRes.data ?? []) as ServerSessionRow[];
  const serverMeta: ServerProgressMeta = metaRes.data
    ? {
        active_subject:
          (metaRes.data.active_subject as 'adsp' | 'sqld' | null) ?? null,
        last_daily_mission_at:
          (metaRes.data.last_daily_mission_at as string | null) ?? null,
        lesson_xp: (metaRes.data.lesson_xp as number | undefined) ?? 0,
      }
    : { active_subject: null, last_daily_mission_at: null, lesson_xp: 0 };

  const merged = mergeProgress({
    local: getSnapshot(),
    serverStats,
    serverSessions,
    serverMeta,
  });
  replaceFromMerge(merged);
}

// ─── 다른 사용자로 로그인 감지 → local clear ─────────────────────────
//
// 같은 기기에서 사용자 A 로그아웃 → 사용자 B 로그인 시 A 의 progress 가
// 노출되지 않도록 local 을 한 번 비우고 그 다음 pull.

const LAST_USER_ID_KEY = 'questdp.lastUserId.v1';

function getLastUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(LAST_USER_ID_KEY);
  } catch {
    return null;
  }
}

function setLastUserId(uid: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (uid) window.localStorage.setItem(LAST_USER_ID_KEY, uid);
    else window.localStorage.removeItem(LAST_USER_ID_KEY);
  } catch {
    /* 무시 */
  }
}

/**
 * SIGNED_IN 이벤트 시 호출. 직전 user_id 와 다르면 local progress clear.
 * (storage 의 reset 호출 — emptyStore 로 commit)
 */
async function handleAuthChange(userId: string | null): Promise<void> {
  if (!userId) {
    // 로그아웃 — lastUserId 제거 (다음 로그인 시 비교 안 함)
    setLastUserId(null);
    return;
  }
  const last = getLastUserId();
  if (last && last !== userId) {
    // 다른 사용자가 같은 기기에서 로그인
    const { resetProgress } = await import('./storage');
    resetProgress();
  }
  setLastUserId(userId);
  // pull 은 호출자가 트리거 (initProgressSync 의 SIGNED_IN handler)
}

// ─── init ──────────────────────────────────────────────────────────

let _started = false;

/**
 * App mount 시 한 번 호출. 다음 트리거에서 pullProgress():
 *  - 즉시 (이미 세션 있을 수 있음)
 *  - SIGNED_IN / INITIAL_SESSION
 *  - window.online (네트워크 복귀)
 *  - document.visibilitychange (탭 다시 보일 때)
 */
export function initProgressSync(): () => void {
  if (_started) return () => {};
  _started = true;

  // 즉시 한 번 pull
  void (async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data: sess } = await sb.auth.getSession();
    if (sess.session) {
      await handleAuthChange(sess.session.user.id);
      void pullProgress();
    }
  })();

  const unsub = onAuthStateChange(async (event, session) => {
    if (
      (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') &&
      session
    ) {
      await handleAuthChange(session.user.id);
      void pullProgress();
    }
    if (event === 'SIGNED_OUT') {
      await handleAuthChange(null);
    }
  });

  // 네트워크 복귀
  const onOnline = () => void pullProgress();
  // 탭 다시 보일 때
  const onVisibility = () => {
    if (document.visibilityState === 'visible') void pullProgress();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisibility);
  }

  return () => {
    unsub();
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisibility);
    }
    _started = false;
  };
}

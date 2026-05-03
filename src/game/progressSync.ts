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

// ─── 사용자 전환 감지 → local clear ──────────────────────────────────
//
// 두 종류 전환을 처리:
//  1) 다른 사용자가 같은 기기에서 로그인 (A 로그아웃 → B 로그인) — A 데이터 leak 차단
//  2) 게스트 → 로그인 (last==null + 게스트 진도 있음) — 게스트 데이터가 server
//     데이터 contaminate 하지 않도록 가드. server 가 비어있으면 migrate.ts 가
//     흡수, 데이터 있으면 게스트 진도 discard.
//
// signInTransition 모듈이 결정 로직을 담당.

import {
  decideSignInTransition,
  getLastUserId,
  setLastUserId,
} from '@/lib/signInTransition';

/**
 * SIGNED_IN 이벤트 시 호출. transition 종류에 따라 local 정리:
 *  - 'reset': 게스트→기존 계정 — local 게스트 진도 폐기 (server 가 truth)
 *  - 'migrate': 게스트→신규 계정 — local 유지 (migrate.ts 가 server 로 push)
 *  - 'pull': 손실할 게스트 진도 없거나 같은 사용자 재로그인 — 평소대로
 */
async function handleAuthChange(userId: string | null): Promise<void> {
  if (!userId) {
    // 로그아웃 — lastUserId 제거 (다음 로그인 시 비교 안 함)
    setLastUserId(null);
    return;
  }
  const last = getLastUserId();
  if (last && last !== userId) {
    // 다른 인증 사용자가 같은 기기에서 로그인 — A 데이터 즉시 비우기
    const { resetProgress } = await import('./storage');
    resetProgress();
    setLastUserId(userId);
    return;
  }

  // 같은 사용자 재로그인 또는 게스트→로그인 케이스 — transition probe
  const decision = await decideSignInTransition(userId);
  if (decision === 'reset') {
    // 기존 계정 + 게스트 진도 흔적 → 게스트 데이터 폐기
    const { resetProgress } = await import('./storage');
    resetProgress();
    // UX 안내 — sessionStorage 로 토스트 트리거 (구독자가 처리)
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem('questdp.guestDiscardToast', '1');
        window.dispatchEvent(new CustomEvent('questdp:guest-discarded'));
      } catch {
        /* 무시 */
      }
    }
  }
  // 'migrate' / 'pull' — 별도 동작 없음. caller 가 pullProgress 호출.
  setLastUserId(userId);
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

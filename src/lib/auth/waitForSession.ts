/**
 * waitForSession.ts — Supabase JS 세션 hydration 대기 헬퍼.
 *
 * 문제 (2026-05-07 진단):
 *   첫 페이지 로드 (cold cache) 직후 `sb.auth.getSession()` 이 hydration 끝나기 전
 *   null 을 반환할 수 있음. energy/passSync/stepUnlocks 의 pull() 이 그대로 받아
 *   DEFAULT_GUEST 상태로 락 → 사용자 새로고침 필요.
 *
 *   profile.ts 는 onAuthStateChange (INITIAL_SESSION/TOKEN_REFRESHED 등) 로 재pull
 *   하지만 ALL pull 함수가 hydration race 에 무방비.
 *
 * 해결:
 *   pull 진입 시 waitForSession() 으로 ① getSession 즉시 체크 → ② 없으면
 *   onAuthStateChange 리스너 + 100ms polling 백업으로 timeout (3s) 까지 대기.
 *   timeout 시 null 반환 → 호출측이 graceful guest fallback.
 *
 * profile.ts 와의 관계:
 *   profile.ts 는 5-retry (응답 후) 로 SELECT 실패에 대비. 본 헬퍼는 그 전 단계
 *   (세션 hydration) 을 담당. 둘은 보호 layer 가 다름.
 */

import type { Session } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';

const POLL_INTERVAL_MS = 100;
const DEFAULT_TIMEOUT_MS = 3000;

/**
 * Supabase 세션이 hydrate 될 때까지 대기.
 *
 * @param timeoutMs 최대 대기 시간 (기본 3000ms). 초과 시 null 반환.
 * @returns Session 객체 (성공) 또는 null (게스트 / timeout).
 */
export async function waitForSession(
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Session | null> {
  const sb = getSupabase();
  if (!sb) return null;

  // ① 즉시 체크 — 이미 hydrated 됐으면 그대로 반환.
  try {
    const { data } = await sb.auth.getSession();
    if (data.session) return data.session;
  } catch {
    /* ignore — fall through to listener path */
  }

  // ② 없으면 INITIAL_SESSION/SIGNED_IN/TOKEN_REFRESHED 이벤트 또는 polling 으로 대기.
  return new Promise<Session | null>((resolve) => {
    let resolved = false;
    let pollTimer: number | null = null;
    let timeoutId: number | null = null;
    let unsub: (() => void) | null = null;

    const finish = (session: Session | null) => {
      if (resolved) return;
      resolved = true;
      if (pollTimer !== null) window.clearInterval(pollTimer);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      if (unsub) unsub();
      resolve(session);
    };

    // Auth event listener.
    const subscription = sb.auth.onAuthStateChange((event, session) => {
      if (
        session &&
        (event === 'INITIAL_SESSION' ||
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED')
      ) {
        finish(session);
      }
    });
    unsub = () => {
      try {
        subscription.data.subscription.unsubscribe();
      } catch {
        /* 무시 */
      }
    };

    // Polling 백업 — 이벤트 누락 (subscribe 사이의 윈도우) 보호.
    pollTimer = window.setInterval(() => {
      sb.auth
        .getSession()
        .then(({ data }) => {
          if (data.session) finish(data.session);
        })
        .catch(() => {
          /* 무시 — timeout 이 cleanup */
        });
    }, POLL_INTERVAL_MS);

    // Timeout — 결정된 시간 후 null 로 graceful fallback.
    timeoutId = window.setTimeout(() => finish(null), timeoutMs);
  });
}

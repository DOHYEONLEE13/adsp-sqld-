/**
 * Bounded Supabase session hydration helper.
 *
 * Supabase can briefly return no session on a cold load, and OAuth PKCE
 * callbacks can also make the first getSession() call wait while the code is
 * exchanged. This helper waits for the auth event/polling path, but never lets
 * the first getSession() call block the caller forever.
 */

import type { Session } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import {
  getAuthSnapshot,
  initAuthSessionSync,
  subscribeAuthSession,
} from '@/lib/auth/sessionStore';

const DEFAULT_TIMEOUT_MS = 3000;
const OAUTH_CALLBACK_TIMEOUT_MS = 10000;
const INITIAL_SESSION_READ_TIMEOUT_MS = 1000;

function hasOAuthCallback(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.has('code') || params.has('error') || params.has('error_code');
}

export async function waitForSession(
  timeoutMs?: number,
): Promise<Session | null> {
  const sb = getSupabase();
  if (!sb) return null;
  initAuthSessionSync();

  const current = getAuthSnapshot();
  if (current.status === 'authenticated') return current.session;
  if (current.status === 'unauthenticated' && !hasOAuthCallback()) return null;

  const effectiveTimeoutMs =
    timeoutMs ?? (hasOAuthCallback() ? OAUTH_CALLBACK_TIMEOUT_MS : DEFAULT_TIMEOUT_MS);

  return new Promise<Session | null>((resolve) => {
    let resolved = false;
    let timeoutId: number | null = null;
    let unsubStore: (() => void) | null = null;

    const finish = (session: Session | null) => {
      if (resolved) return;
      resolved = true;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      if (unsubStore) unsubStore();
      resolve(session);
    };

    unsubStore = subscribeAuthSession(() => {
      const next = getAuthSnapshot();
      if (next.status === 'authenticated') {
        finish(next.session);
      } else if (next.status === 'unauthenticated') {
        finish(null);
      }
    });

    void Promise.race([
      sb.auth.getSession().then(({ data }) => data.session ?? null),
      new Promise<'timeout'>((resolveInitial) => {
        window.setTimeout(
          () => resolveInitial('timeout'),
          Math.min(INITIAL_SESSION_READ_TIMEOUT_MS, effectiveTimeoutMs),
        );
      }),
    ])
      .then((initial) => {
        if (initial && initial !== 'timeout') finish(initial);
      })
      .catch(() => {
        /* store subscription or outer timeout will settle */
      });

    timeoutId = window.setTimeout(() => {
      console.warn(
        `[waitForSession] timeout after ${effectiveTimeoutMs}ms - hydration incomplete. ` +
          'Auth-dependent sync will retry on the next auth/visibility/online event.',
      );
      finish(null);
    }, effectiveTimeoutMs);
  });
}

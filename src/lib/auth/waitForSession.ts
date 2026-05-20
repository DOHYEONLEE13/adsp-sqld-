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

const POLL_INTERVAL_MS = 100;
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

  const effectiveTimeoutMs =
    timeoutMs ?? (hasOAuthCallback() ? OAUTH_CALLBACK_TIMEOUT_MS : DEFAULT_TIMEOUT_MS);

  try {
    const initial = await Promise.race([
      sb.auth.getSession().then(({ data }) => data.session ?? null),
      new Promise<'timeout'>((resolve) => {
        window.setTimeout(
          () => resolve('timeout'),
          Math.min(INITIAL_SESSION_READ_TIMEOUT_MS, effectiveTimeoutMs),
        );
      }),
    ]);
    if (initial && initial !== 'timeout') return initial;
  } catch {
    /* fall through to listener path */
  }

  return new Promise<Session | null>((resolve) => {
    let resolved = false;
    let pollTimer: number | null = null;
    let timeoutId: number | null = null;
    let unsub: (() => void) | null = null;
    let pollInFlight = false;

    const finish = (session: Session | null) => {
      if (resolved) return;
      resolved = true;
      if (pollTimer !== null) window.clearInterval(pollTimer);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      if (unsub) unsub();
      resolve(session);
    };

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
        /* ignore */
      }
    };

    pollTimer = window.setInterval(() => {
      if (pollInFlight) return;
      pollInFlight = true;
      sb.auth
        .getSession()
        .then(({ data }) => {
          if (data.session) finish(data.session);
        })
        .catch(() => {
          /* ignore until timeout */
        })
        .finally(() => {
          pollInFlight = false;
        });
    }, POLL_INTERVAL_MS);

    timeoutId = window.setTimeout(() => {
      console.warn(
        `[waitForSession] timeout after ${effectiveTimeoutMs}ms - hydration incomplete. ` +
          'Auth-dependent sync will retry on the next auth/visibility/online event.',
      );
      finish(null);
    }, effectiveTimeoutMs);
  });
}

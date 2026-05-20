import { useSyncExternalStore } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

export interface AuthSnapshot {
  status: AuthStatus;
  session: Session | null;
  timedOut: boolean;
}

const DEFAULT_TIMEOUT_MS = 4000;
const OAUTH_CALLBACK_TIMEOUT_MS = 12000;

const listeners = new Set<() => void>();

let snapshot: AuthSnapshot = isSupabaseConfigured()
  ? { status: 'checking', session: null, timedOut: false }
  : { status: 'unauthenticated', session: null, timedOut: false };

let started = false;
let timeoutId: number | null = null;
let unsubscribeAuth: (() => void) | null = null;
let notifyScheduled = false;

function hasOAuthCallback(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.has('code') || params.has('error') || params.has('error_code');
}

function authTimeoutMs(): number {
  return hasOAuthCallback() ? OAUTH_CALLBACK_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;
}

function setSnapshot(next: AuthSnapshot): void {
  if (
    snapshot.status === next.status &&
    snapshot.session === next.session &&
    snapshot.timedOut === next.timedOut
  ) {
    return;
  }
  snapshot = next;
  notifyListenersSoon();
}

function notifyListenersSoon(): void {
  if (notifyScheduled) return;
  notifyScheduled = true;

  const run = () => {
    notifyScheduled = false;
    for (const listener of listeners) {
      try {
        listener();
      } catch {
        /* ignore subscriber failures */
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.setTimeout(run, 0);
  } else {
    run();
  }
}

function clearOAuthCallbackFromUrl(): void {
  if (typeof window === 'undefined' || !hasOAuthCallback()) return;

  const url = new URL(window.location.href);
  let changed = false;
  for (const key of ['code', 'error', 'error_code', 'error_description']) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  }
  if (!changed) return;

  const next =
    `${url.pathname}${url.search}${url.hash}` ||
    `${window.location.pathname}${window.location.hash}`;
  window.history.replaceState(window.history.state, '', next);
}

function clearAuthTimeout(): void {
  if (timeoutId !== null) {
    window.clearTimeout(timeoutId);
    timeoutId = null;
  }
}

function scheduleAuthTimeout(): void {
  if (typeof window === 'undefined' || timeoutId !== null) return;
  timeoutId = window.setTimeout(() => {
    timeoutId = null;
    if (snapshot.status !== 'checking') return;
    setSnapshot({
      status: 'unauthenticated',
      session: null,
      timedOut: true,
    });
  }, authTimeoutMs());
}

export function initAuthSessionSync(): () => void {
  if (started) return () => {};
  started = true;

  const sb = getSupabase();
  if (!sb) {
    setSnapshot({ status: 'unauthenticated', session: null, timedOut: false });
    return () => {};
  }

  scheduleAuthTimeout();

  const { data } = sb.auth.onAuthStateChange((event, session) => {
    if (
      event === 'INITIAL_SESSION' ||
      event === 'SIGNED_IN' ||
      event === 'TOKEN_REFRESHED'
    ) {
      clearAuthTimeout();
      if (session) clearOAuthCallbackFromUrl();
      setSnapshot(
        session
          ? { status: 'authenticated', session, timedOut: false }
          : { status: 'unauthenticated', session: null, timedOut: false },
      );
      return;
    }

    if (event === 'SIGNED_OUT') {
      clearAuthTimeout();
      setSnapshot({ status: 'unauthenticated', session: null, timedOut: false });
    }
  });

  unsubscribeAuth = () => data.subscription.unsubscribe();

  void Promise.race([
    sb.auth.getSession(),
    new Promise<'timeout'>((resolve) => {
      window.setTimeout(() => resolve('timeout'), authTimeoutMs());
    }),
  ])
    .then((result) => {
      if (result === 'timeout') return;
      clearAuthTimeout();
      const session = result.data.session ?? null;
      if (session) clearOAuthCallbackFromUrl();
      setSnapshot(
        session
          ? { status: 'authenticated', session, timedOut: false }
          : { status: 'unauthenticated', session: null, timedOut: false },
      );
    })
    .catch(() => {
      clearAuthTimeout();
      if (snapshot.status === 'checking') {
        setSnapshot({
          status: 'unauthenticated',
          session: null,
          timedOut: true,
        });
      }
    });

  return () => {
    clearAuthTimeout();
    unsubscribeAuth?.();
    unsubscribeAuth = null;
    started = false;
  };
}

export function getAuthSnapshot(): AuthSnapshot {
  initAuthSessionSync();
  return snapshot;
}

export function subscribeAuthSession(cb: () => void): () => void {
  initAuthSessionSync();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useAuthSession(): AuthSnapshot {
  return useSyncExternalStore(
    subscribeAuthSession,
    getAuthSnapshot,
    getAuthSnapshot,
  );
}

/**
 * supabase.ts — 단일 Supabase 클라이언트.
 *
 * env 가 비어 있으면 (`.env` 미설정) `null` 반환 → 호출 측에서 localStorage
 * fallback 으로 동작. 즉 Supabase 없이도 앱이 부팅·동작하도록 graceful 하게.
 *
 * 인증은 OAuth (Google · Kakao). 익명 로그인은 사용 안 함 — 미로그인 상태는
 * "guest mode" 로 localStorage 만 사용.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let _client: SupabaseClient | null = null;
let _resolved = false;

/**
 * Supabase 클라이언트. env 미설정 시 null. 호출자는 항상 null 체크.
 *
 * 사용 예:
 * ```
 * const sb = getSupabase();
 * if (!sb) return null;            // guest mode — localStorage 사용
 * const { data } = await sb.from('profiles').select('*').single();
 * ```
 */
export function getSupabase(): SupabaseClient | null {
  if (_resolved) return _client;
  _resolved = true;

  if (!URL || !ANON_KEY) {
    if (typeof window !== 'undefined') {
      console.info(
        '[supabase] env 미설정 — localStorage 모드로 동작. .env 설정 후 새로고침하면 서버 동기화 활성화.',
      );
    }
    return null;
  }

  _client = createClient(URL, ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,        // OAuth 콜백 처리
      flowType: 'pkce',
    },
  });
  return _client;
}

/** 환경변수가 설정돼 있는지 — 로그인 UI 노출 여부 결정에 사용. */
export function isSupabaseConfigured(): boolean {
  return Boolean(URL && ANON_KEY);
}

// ── Auth helpers ───────────────────────────────────────────────────────

export type OAuthProvider = 'google' | 'kakao';

/** OAuth 로그인 — 외부 콘솔로 redirect. 콜백은 detectSessionInUrl 이 처리. */
export async function signInWithOAuth(provider: OAuthProvider) {
  const sb = getSupabase();
  if (!sb) return { error: new Error('supabase not configured') };
  return sb.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin,
    },
  });
}

/**
 * 로그아웃. 서버 세션 종료 + 사용자 식별성 캐시 (profile · friends · pendingRedirect
 * · isAdmin) 정리. 학습 진도 (progress · bookmarks · examDates) 는 보존 — 다시 로그인
 * 하지 않더라도 게스트로 같은 기기에서 이어 풀 수 있도록.
 */
export async function signOut() {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
  if (typeof window !== 'undefined') {
    const IDENTITY_KEYS = [
      'questdp.profile.v1',
      'questdp.friends.v1',
      'questdp.auth.pendingRedirect.v1',
      'questdp.passTier.lastShown.v1',
    ];
    for (const k of IDENTITY_KEYS) {
      try { window.localStorage.removeItem(k); } catch { /* 무시 */ }
    }
    try { window.sessionStorage.removeItem('questdp.auth.redirectReason.v1'); } catch { /* 무시 */ }
  }
}

/** 현재 세션 (synchronous cache). 미로그인이면 null. */
export async function getSession() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session;
}

/** 세션 변화 구독. 로그인/로그아웃 시 callback. */
export function onAuthStateChange(
  cb: (event: string, session: Awaited<ReturnType<typeof getSession>>) => void,
): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};
  const { data } = sb.auth.onAuthStateChange((event, session) => cb(event, session));
  return () => data.subscription.unsubscribe();
}

/**
 * 계정 + 모든 데이터 영구 삭제. RPC 가 auth.users row 를 지우면
 * cascade 로 profiles · sessions · friendships · ... 모두 자동 정리.
 * 마지막에 signOut + localStorage 정리.
 */
export async function deleteMyAccount(): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'supabase not configured' };
  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) return { ok: false, error: 'not signed in' };
  const { error } = await sb.rpc('delete_my_account');
  if (error) return { ok: false, error: error.message };

  // 서버 데이터 삭제 후 클라이언트 정리
  await sb.auth.signOut();
  if (typeof window !== 'undefined') {
    // localStorage 의 게스트용 캐시도 모두 비움 — 새 계정처럼 시작
    const KEYS = [
      'questdp.profile.v1',
      'questdp.friends.v1',
      'questdp.progress.v1',
      'questdp.bookmarks.v1',
      'questdp.examDates.v1',
      'questdp.session_outbox.v1',
      'questdp.migrated.v1',
    ];
    for (const k of KEYS) {
      try { window.localStorage.removeItem(k); } catch { /* 무시 */ }
    }
  }
  return { ok: true };
}

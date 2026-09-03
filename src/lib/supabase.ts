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

/**
 * OAuth callback redirect 의 정식 origin 결정.
 *
 * 정책:
 *  - 로컬 dev (`localhost`, `127.0.0.1`) → 현재 origin 그대로
 *  - prod (`quest-dp.com`) → quest-dp.com (canonical)
 *  - Cloudflare 자동 도메인 (`adsp-sqld.pages.dev`) → **quest-dp.com 으로 강제**
 *    이유: Supabase Site URL 이 quest-dp.com 으로 등록되어 callback 후 cookie
 *    도메인 분리되지 않도록. Pages 자동 도메인을 그대로 쓰면 OAuth 후 다른
 *    origin 으로 redirect 되어 session 새로 만들기 (= 로그인 한 번에 안 됨).
 *
 * env override: VITE_AUTH_REDIRECT_ORIGIN 이 있으면 그 값 우선.
 */
function canonicalAuthOrigin(): string {
  const envOverride = (import.meta.env.VITE_AUTH_REDIRECT_ORIGIN as string | undefined)?.trim();
  if (envOverride) return envOverride;
  if (typeof window === 'undefined') return 'https://quest-dp.com';
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return window.location.origin;
  }
  // prod 또는 Cloudflare 자동 도메인 모두 canonical 로 통합
  return 'https://quest-dp.com';
}

/** OAuth 로그인 — 외부 콘솔로 redirect. 콜백은 detectSessionInUrl 이 처리. */
export async function signInWithOAuth(provider: OAuthProvider) {
  const sb = getSupabase();
  if (!sb) return { error: new Error('supabase not configured') };
  return sb.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: canonicalAuthOrigin(),
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
  let active = true;
  const { data } = sb.auth.onAuthStateChange((event, session) => {
    const run = () => {
      if (active) cb(event, session);
    };
    if (typeof window !== 'undefined') {
      window.setTimeout(run, 0);
    } else {
      run();
    }
  });
  return () => {
    active = false;
    data.subscription.unsubscribe();
  };
}

/** 이메일·비밀번호 로그인. 심사용 계정을 포함한 일반 사용자 인증에 사용. */
export async function signInWithPassword(email: string, password: string) {
  const sb = getSupabase();
  if (!sb) return { error: new Error('supabase not configured') };
  return sb.auth.signInWithPassword({ email: email.trim(), password });
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

// ── Dev 전용 테스트 로그인 ────────────────────────────────────────────
// 임베디드 Preview 는 외부 도메인 "페이지 이동"을 차단해 OAuth 가 불가능하다.
// signInWithPassword 는 fetch 한 번이라 Preview 안에서도 동작한다.
// 자격증명은 .env.development.local(gitignore, dev 모드 전용 로드)에만 두며,
// 아래 분기는 prod 빌드에서 import.meta.env.DEV=false 로 접혀 제거된다.

export const DEV_TEST_LOGIN_AVAILABLE: boolean = import.meta.env.DEV
  ? Boolean(
      import.meta.env.VITE_TEST_LOGIN_EMAIL &&
        import.meta.env.VITE_TEST_LOGIN_PASSWORD,
    )
  : false;

export async function signInWithDevTestAccount(): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (!import.meta.env.DEV) return { ok: false, error: 'dev 모드 전용' };
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase 미설정' };
  const email = import.meta.env.VITE_TEST_LOGIN_EMAIL as string | undefined;
  const password = import.meta.env.VITE_TEST_LOGIN_PASSWORD as
    | string
    | undefined;
  if (!email || !password) {
    return { ok: false, error: 'VITE_TEST_LOGIN_* 미설정 (.env.development.local)' };
  }
  const { error } = await signInWithPassword(email, password);
  return error ? { ok: false, error: error.message } : { ok: true };
}

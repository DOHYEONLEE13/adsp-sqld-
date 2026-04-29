/**
 * authGuard.ts — 학습 로드맵 등 인증 필요 라우트 보호용 helpers.
 *
 * 정책:
 *   - 보호된 라우트는 미로그인 사용자 → `#/login` 으로 redirect
 *   - 의도한 라우트는 localStorage 에 보관 → 로그인 성공 (SIGNED_IN) 직후 복원
 *   - Supabase env 미설정 (`isSupabaseConfigured() === false`) 인 경우엔 가드 우회
 *     → 로컬 개발 경험 + 게스트 모드 보존
 *
 * 왜 localStorage?
 *   OAuth 콜백은 PKCE 로 `window.location.origin` 으로 redirect 되어 hash 가
 *   사라짐. URL query (#/login?returnTo=...) 도 OAuth round-trip 시 손실.
 *   localStorage 에 잠시 보관하면 OAuth 후 첫 mount 에서 안전하게 복원 가능.
 */

const PENDING_REDIRECT_KEY = 'questdp.auth.pendingRedirect.v1';

/**
 * 인증이 필요한 hash 라우트 prefix 목록.
 *
 * `landing` / `legal` / `login` / `redeem` / `refund-request` / `admin` 은 제외:
 *   - landing/legal/login: 공개
 *   - redeem: 자체 AuthCard 가 미로그인 처리 (이미 게이트 본인이 깔림)
 *   - refund-request: 게스트도 mailto fallback 으로 접수 가능
 *   - admin: 별도 admin 권한 검사 (서버 직접 호출)
 */
const PROTECTED_HASH_PREFIXES = [
  '/game',
  '/quests',
  '/friends',
  '/stats',
  '/bookmarks',
];

/** 주어진 hash (예: `#/game/adsp`) 가 보호 대상인지 판정. */
export function isProtectedHash(hash: string): boolean {
  const trimmed = hash.replace(/^#/, '');
  return PROTECTED_HASH_PREFIXES.some((p) => trimmed.startsWith(p));
}

/** 의도한 라우트를 보관 — 로그인 시도 직전 호출. */
export function setPendingAuthRedirect(hash: string): void {
  if (typeof window === 'undefined') return;
  const clean = hash.replace(/^#/, '');
  // 빈 hash 또는 login 자체 보관은 의미 X
  if (!clean || clean.startsWith('/login')) return;
  try {
    window.localStorage.setItem(PENDING_REDIRECT_KEY, clean);
  } catch {
    /* private mode 등 — 무시 */
  }
}

/** 보관된 의도 라우트 반환. 없으면 null. */
export function getPendingAuthRedirect(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(PENDING_REDIRECT_KEY);
  } catch {
    return null;
  }
}

/** 보관된 의도 라우트 비우기 — 복원 직후 또는 사용자가 다른 곳으로 이동했을 때. */
export function clearPendingAuthRedirect(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(PENDING_REDIRECT_KEY);
  } catch {
    /* 무시 */
  }
}

/**
 * 의도 라우트 복원 — SIGNED_IN 직후 호출.
 * 보관된 값을 hash 로 적용하고 localStorage 정리.
 * 보관된 값이 없으면 false 반환 (호출자가 default 라우트로 이동 결정 가능).
 */
export function consumePendingAuthRedirect(): boolean {
  const target = getPendingAuthRedirect();
  if (!target) return false;
  clearPendingAuthRedirect();
  // hash 가 이미 같은 곳이면 전이 X
  const currentHash = window.location.hash.replace(/^#/, '');
  if (currentHash === target) return true;
  window.location.hash = target;
  return true;
}

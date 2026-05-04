/**
 * navigate.ts — SPA 네비게이션 헬퍼.
 *
 * 현재 QuestDP 의 라우팅은 **하이브리드** 상태:
 *   - Legal 페이지 (`/about`, `/privacy`, `/terms`, `/refund`): path-based
 *     → SEO indexable 위해 (검색엔진봇이 hash 무시 문제 해결)
 *   - 그 외 (`#/game`, `#/quests`, `#/stats`, ...): hash-based (변경 위험 ↑ 라 추후)
 *
 * navigate(path) — path-based 라우트 이동에 사용. history.pushState + popstate
 * dispatch 로 App.tsx 가 reroute. 풀 페이지 reload 없이 SPA 네비.
 *
 * SEO 호환:
 *   - `<a href="/about" onClick={(e) => { e.preventDefault(); navigate('/about'); }}>`
 *   - 봇은 href 만 보고 따라옴 (정상 indexable)
 *   - 사용자는 onClick 으로 SPA 진입 (reload 없이)
 *
 * Legacy hash 호환 (App.tsx 마운트 시 처리):
 *   - `#/about` 등 옛 북마크는 mount 시 한 번 path 로 redirect (replaceState)
 */

/** Path-based 라우트 (검색엔진 indexable). hash 라우트와 분리. */
const PATH_ROUTES = new Set([
  '/',
  '/about',
  '/privacy',
  '/terms',
  '/refund',
]);

/** Path prefix 라우트 — `/lesson/:stepId`, `/quiz/:questionId` 등 동적 segment. */
const PATH_PREFIXES = ['/lesson/', '/quiz/'];

/**
 * Path-based 라우트로 이동. legacy hash 라우트와 path 모두 지원.
 *
 * @param path — `/about` 또는 `#/about` 형식 모두 허용. hash 형식이면 path 로 자동 변환.
 */
export function navigate(path: string): void {
  if (typeof window === 'undefined') return;

  // hash 형식 정규화: `#/about` → `/about`
  let normalized = path;
  if (normalized.startsWith('#')) {
    normalized = normalized.slice(1);
    if (!normalized.startsWith('/')) normalized = '/' + normalized;
  }

  // path 라우트인지 확인 — exact match 또는 prefix 일치
  const isPathRoute =
    PATH_ROUTES.has(normalized) ||
    PATH_PREFIXES.some((p) => normalized.startsWith(p));

  if (isPathRoute) {
    // path-based: pushState + popstate dispatch
    if (window.location.pathname !== normalized) {
      window.history.pushState({}, '', normalized);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  } else {
    // 그 외 라우트는 hash 사용 (기존 패턴 유지)
    const hashTarget = normalized.startsWith('/') ? normalized : '/' + normalized;
    if (window.location.hash !== '#' + hashTarget) {
      // pathname 이 path 라우트면 먼저 / 로 돌리고 hash 설정
      if (window.location.pathname !== '/') {
        window.history.replaceState({}, '', '/');
      }
      window.location.hash = hashTarget;
    }
  }
}

/** 외부 링크 / 일반 anchor 클릭을 SPA navigate 로 가로챔. */
export function handleNavClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  path: string,
): void {
  // 새 탭 / shift+click / cmd+click 등은 기본 동작 유지 (browser 표준)
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  e.preventDefault();
  navigate(path);
}

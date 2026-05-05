import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

/**
 * Cloudflare 자동 도메인 (adsp-sqld.pages.dev) 으로 들어온 사용자를 canonical
 * 도메인 (quest-dp.com) 으로 자동 redirect. URL · query · hash 모두 보존.
 *
 * 이유:
 *  - OAuth callback 의 cookie 도메인이 quest-dp.com 에만 묶여있어, pages.dev
 *    에서 로그인 → callback → quest-dp.com 으로 가야 session 정상 적용.
 *  - 두 도메인이 함께 떠있으면 session storage 분리되어 로그인 적용 시간 ↑.
 *
 * canonical 도메인은 SEO 측면에서도 단일화 필요 (sitemap, 검색 인덱스).
 */
function redirectToCanonicalIfNeeded(): boolean {
  if (typeof window === 'undefined') return false;
  const { hostname, pathname, search, hash } = window.location;
  // localhost / quest-dp.com 은 그대로
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === 'quest-dp.com'
  ) {
    return false;
  }
  // 그 외 (adsp-sqld.pages.dev, preview deploy 등) → canonical 로 강제
  const target = `https://quest-dp.com${pathname}${search}${hash}`;
  window.location.replace(target);
  return true;
}

if (!redirectToCanonicalIfNeeded()) {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

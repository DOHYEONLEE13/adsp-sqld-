import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initPushOnBoot } from './lib/push';
import './styles/index.css';

/**
 * GA4 동적 초기화.
 *
 * 정책 (2026-05-11 갱신):
 *  - **production 빌드**: 기본 측정 ID `G-T38EKQMQ04` 자동 활성 (공개 키 — gtag.js
 *    로드 시 브라우저에 그대로 노출되므로 hard-code 안전).
 *  - **dev 빌드**: 기본 비활성 (실 트래픽 통계 오염 방지).
 *  - `VITE_GA_MEASUREMENT_ID` env var 로 override 가능 (staging 등 별도 속성).
 *
 * SPA send_page_view: false — 라우트 변경 시 src/lib/analytics.ts 의
 * trackPageview() 가 수동 발사 (App.tsx 의 hashchange/popstate hook).
 */
const GA_DEFAULT_ID = 'G-T38EKQMQ04';

function initGA4(): void {
  const envId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
  // dev: env var 명시된 경우만 활성 (로컬에서 일부러 켜고 싶을 때).
  // prod: env var override 우선, 없으면 기본 ID.
  const id = envId
    ? envId
    : import.meta.env.PROD
      ? GA_DEFAULT_ID
      : undefined;
  if (!id || !id.startsWith('G-')) return;
  if (typeof window === 'undefined') return;

  // dataLayer + gtag 정의
  window.dataLayer = window.dataLayer ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gtag = function gtag(...args: unknown[]) {
    (window.dataLayer as unknown[]).push(args);
  } as any;
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', id, { send_page_view: false });

  // gtag.js 비동기 로드
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);
}
initGA4();

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
  // 알림 권한이 이미 허용된 기기 — SW 등록 갱신 (프롬프트 없음, 렌더 뒤 지연 실행)
  initPushOnBoot();
}

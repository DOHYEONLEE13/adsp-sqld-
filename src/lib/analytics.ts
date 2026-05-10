/**
 * analytics.ts — GA4 추적 헬퍼.
 *
 * SPA 라우트 변경 시 page_view 수동 fire + 핵심 이벤트 헬퍼.
 *
 * 활성화 정책 (2026-05-11 갱신, main.tsx 와 동기):
 *   - production 빌드: 기본 측정 ID `G-T38EKQMQ04` 자동 활성
 *   - dev 빌드: env var 명시 시만 활성 (실 트래픽 통계 오염 방지)
 *   - `VITE_GA_MEASUREMENT_ID` env var 로 override 가능
 *
 * 핵심 이벤트:
 *   - `lesson_start`, `lesson_complete`, `quiz_attempt`, `quiz_correct`
 *   - `signup_complete`, `purchase_premium`, `share_click`
 *
 * SEO/마케팅 측정용. 사용자 PII 는 절대 보내지 않음.
 */

declare global {
  interface Window {
    /** GA4 gtag.js global. index.html 에서 src/lib/supabase 같은 패턴으로 init. */
    gtag?: (...args: unknown[]) => void;
    /** GA4 dataLayer. */
    dataLayer?: unknown[];
  }
}

const GA_DEFAULT_ID = 'G-T38EKQMQ04';
const ENV_GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
/** 실효 측정 ID — env var override > production 기본 > undefined (dev). */
const GA_ID: string | undefined = ENV_GA_ID
  ? ENV_GA_ID
  : import.meta.env.PROD
    ? GA_DEFAULT_ID
    : undefined;

/** GA4 가 활성화 되어 있는지 (dev 환경에서도 토큰 있으면 활성). */
export function isAnalyticsEnabled(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.gtag === 'function' &&
    !!GA_ID &&
    GA_ID.startsWith('G-')
  );
}

/**
 * 가상 페이지뷰 트리거 — SPA 라우트 변경 시 호출.
 *
 * GA4 의 자동 page_view 는 첫 로드 1회만 잡으므로 SPA 의 hash 변경은 수동 발사.
 * `index.html` 의 gtag 스니펫이 `send_page_view: false` 로 설정되어야 정확.
 */
export function trackPageview(path: string): void {
  if (!isAnalyticsEnabled()) return;
  try {
    window.gtag!('event', 'page_view', {
      page_path: path,
      page_title: document.title,
      page_location: window.location.href,
    });
  } catch {
    /* 실패 silent — analytics 가 정상 흐름 막으면 안 됨. */
  }
}

/**
 * 임의 이벤트 트리거. PII / 민감 정보 절대 X.
 *
 * 표준 이벤트 (GA4 권장):
 *   - 'login', 'sign_up', 'purchase', 'share', 'select_content'
 * 커스텀 이벤트 (QuestDP):
 *   - 'lesson_start', 'lesson_complete', 'quiz_attempt', 'quiz_correct',
 *     'character_change', 'pose_change', 'redeem_code'
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (!isAnalyticsEnabled()) return;
  try {
    window.gtag!('event', eventName, params ?? {});
  } catch {
    /* 실패 silent */
  }
}

/**
 * dev 진단 — analytics 활성 여부 확인 (콘솔 로그).
 * 호출 측이 명시적으로 부를 때만 출력.
 */
export function debugAnalytics(): void {
  // eslint-disable-next-line no-console
  console.info('[analytics]', {
    enabled: isAnalyticsEnabled(),
    measurementId: GA_ID ? `${GA_ID.slice(0, 4)}…` : '(미설정)',
    source: ENV_GA_ID ? 'env' : import.meta.env.PROD ? 'default(prod)' : 'none',
    note: 'production 빌드는 기본 ID 자동 활성. dev 에서 켜려면 .env.local 에 VITE_GA_MEASUREMENT_ID 설정',
  });
}

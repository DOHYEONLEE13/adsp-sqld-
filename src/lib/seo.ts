/**
 * seo.ts — useSeoMeta hook (react-helmet-async 회피).
 *
 * react-helmet-async@3.0.0 + React 18.3 + StrictMode + production build 환경에서
 * <HelmetProvider> 가 React mount 자체를 silent fail 시키는 회귀가 확인됨
 * (2026-05-04 사고). 직접 useEffect + DOM 조작으로 동일 효과를 안전하게 구현.
 *
 * 사용 예:
 * ```tsx
 * import { useSeoMeta } from '@/lib/seo';
 *
 * export default function MyPage() {
 *   useSeoMeta({
 *     title: 'QuestDP — ADSP·SQLD 자격증',
 *     description: '...',
 *     canonical: 'https://quest-dp.com/',
 *     ogImage: 'https://quest-dp.com/og/default.png',
 *     ogType: 'website',
 *   });
 *   return <>...</>;
 * }
 * ```
 *
 * 동작 원칙:
 *  - title 갱신: document.title 직접 변경
 *  - meta · link 태그: head 안에 있으면 갱신, 없으면 생성
 *  - cleanup 안 함 — 다음 라우트가 호출하면 자연스럽게 덮어씀.
 *    이 패턴이 react-helmet-async 의 push/pop 스택보다 단순하고 안전.
 *  - SEO 봇은 client-side 에서 갱신된 head 도 인식 (Googlebot · Yeti 모두).
 */

import { useEffect } from 'react';

export interface SeoMeta {
  /** 페이지 title (= document.title + og:title + twitter:title). 60자 이내 권장. */
  title: string;
  /** description (= meta name="description" + og:description + twitter:description). 160자 이내 권장. */
  description?: string;
  /** canonical URL (= link rel="canonical" + og:url). */
  canonical?: string;
  /** OG/Twitter 이미지 URL (절대 경로 권장). */
  ogImage?: string;
  /** og:type. 기본 'website'. 블로그 포스트 등은 'article'. */
  ogType?: 'website' | 'article';
  /** robots noindex (검색 결과 노출 방지). 결제 콜백 등 비공개 페이지에 사용. */
  noIndex?: boolean;
  /**
   * JSON-LD structured data. 객체 또는 배열.
   * 예: { '@context': 'https://schema.org', '@type': 'Course', ... }
   * 페이지 unmount 시 제거됨.
   */
  jsonLd?: object | object[];
}

/**
 * 페이지별 SEO 메타 동적 갱신. SPA 라우트 전환 시 head 가 즉시 갱신됨.
 *
 * deps array 는 props 의 primitive 만 추적 — 함수·객체 props 는 호출 측에서
 * 안정적인 reference 로 전달해야 함 (보통 상수).
 */
export function useSeoMeta(meta: SeoMeta): void {
  useEffect(() => {
    // ── title 류 ──────────────────────────────────────────────
    if (meta.title) {
      document.title = meta.title;
      setMetaByProperty('og:title', meta.title);
      setMetaByName('twitter:title', meta.title);
    }

    // ── description 류 ────────────────────────────────────────
    if (meta.description) {
      setMetaByName('description', meta.description);
      setMetaByProperty('og:description', meta.description);
      setMetaByName('twitter:description', meta.description);
    }

    // ── canonical + og:url ────────────────────────────────────
    if (meta.canonical) {
      setLinkRel('canonical', meta.canonical);
      setMetaByProperty('og:url', meta.canonical);
    }

    // ── OG image (Twitter card 도 같은 image) ───────────────
    if (meta.ogImage) {
      setMetaByProperty('og:image', meta.ogImage);
      setMetaByName('twitter:image', meta.ogImage);
    }

    // ── og:type ─────────────────────────────────────────────
    if (meta.ogType) {
      setMetaByProperty('og:type', meta.ogType);
    }

    // ── robots ──────────────────────────────────────────────
    if (meta.noIndex) {
      setMetaByName('robots', 'noindex, nofollow');
    } else {
      // 이전 페이지가 noindex 였으면 해제 (다음 라우트가 indexable 일 때).
      const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
      if (robots && (robots.getAttribute('content') ?? '').includes('noindex')) {
        robots.setAttribute('content', 'index, follow');
      }
    }

    // ── JSON-LD (선택) ───────────────────────────────────────
    let jsonLdEls: HTMLScriptElement[] = [];
    if (meta.jsonLd) {
      const items = Array.isArray(meta.jsonLd) ? meta.jsonLd : [meta.jsonLd];
      jsonLdEls = items.map((data, i) => {
        const el = document.createElement('script');
        el.setAttribute('type', 'application/ld+json');
        el.setAttribute('data-seo-dynamic', String(i));
        el.textContent = JSON.stringify(data);
        document.head.appendChild(el);
        return el;
      });
    }

    return () => {
      // JSON-LD 만 cleanup. title·meta 는 다음 페이지가 덮어씀.
      for (const el of jsonLdEls) {
        if (el.parentNode) el.parentNode.removeChild(el);
      }
    };
  }, [
    meta.title,
    meta.description,
    meta.canonical,
    meta.ogImage,
    meta.ogType,
    meta.noIndex,
    // jsonLd 는 객체라 deep 비교 필요 — 호출 측이 stringify 비교 책임 또는
    // 안정적인 reference 사용. 대부분 정적 schema 라 큰 문제 없음.
    JSON.stringify(meta.jsonLd ?? null),
  ]);
}

// ─── DOM 헬퍼 ────────────────────────────────────────────────

function setMetaByName(name: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${cssEscape(name)}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setMetaByProperty(property: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(
    `meta[property="${cssEscape(property)}"]`,
  );
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkRel(rel: string, href: string): void {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${cssEscape(rel)}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** 간단한 CSS selector escape. og:title 같은 ":" 포함 selector 안전 처리. */
function cssEscape(s: string): string {
  return s.replace(/([:.])/g, '\\$1');
}

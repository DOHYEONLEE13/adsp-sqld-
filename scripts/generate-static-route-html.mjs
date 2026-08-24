#!/usr/bin/env node
/**
 * Vite serves QuestDP as a SPA, but crawlers first fetch raw HTML. This script
 * creates route-level HTML entries for indexable non-quiz pages so first fetch
 * has the correct canonical, title, description, OG tags, and a small readable
 * body snapshot before React mounts.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_IMAGE, getSeoRouteManifest } from './seo-route-manifest.mjs';

const DIST_DIR = path.resolve('dist');
const CONTENT_PROTECTION_NOTICE =
  'QuestDP의 개념 설명·문제·해설은 자체 제작 학습 콘텐츠입니다. 무단 복제·배포·재판매·상업적 이용이 확인되면 서비스 이용 제한 및 관련 법령에 따른 법적 조치를 진행할 수 있습니다.';

const template = await readFile(path.join(DIST_DIR, 'index.html'), 'utf8');
const manifest = getSeoRouteManifest();

for (const route of manifest.all) {
  if (route.path.startsWith('/quiz/')) {
    throw new Error(`Quiz route must not be statically generated: ${route.path}`);
  }
  const targetFile = route.path === '/'
    ? path.join(DIST_DIR, 'index.html')
    : path.join(DIST_DIR, ...route.path.split('/').filter(Boolean), 'index.html');
  await mkdir(path.dirname(targetFile), { recursive: true });
  await writeFile(targetFile, routeHtml(template, route), 'utf8');
}

console.log(
  `static route HTML generated: ${manifest.all.length} pages ` +
    `(core ${manifest.core.length}, blog ${manifest.blog.length}, lessons ${manifest.lessons.length}, topics ${manifest.topics.length}, quiz 0)`,
);

function routeHtml(baseTemplate, route) {
  let html = baseTemplate;
  const image = route.image || DEFAULT_IMAGE;
  const type = route.type || 'website';
  html = setTitle(html, route.title);
  html = setMetaByName(html, 'description', route.description);
  html = setMetaByProperty(html, 'og:title', route.title);
  html = setMetaByProperty(html, 'og:description', route.description);
  html = setMetaByProperty(html, 'og:type', type);
  html = setMetaByProperty(html, 'og:url', route.canonical);
  html = setMetaByProperty(html, 'og:image', image);
  html = setMetaByProperty(html, 'og:image:alt', `${route.h1} — QuestDP`);
  html = setMetaByName(html, 'twitter:title', route.title);
  html = setMetaByName(html, 'twitter:description', route.description);
  html = setMetaByName(html, 'twitter:image', image);
  html = setCanonical(html, route.canonical);
  html = setRobots(html, route);
  html = setImageSrc(html, image);
  html = injectStaticJsonLd(html, route);
  if (route.path === '/') {
    html = injectHomeFallbackStyle(html);
    html = setRootHomeFallback(html, route);
  } else {
    html = injectSnapshotStyle(html);
    html = setRootSnapshot(html, route);
  }
  return canonicalizeInternalAnchorHrefs(html);
}

/**
 * The canonical URL policy uses trailing slashes for public path routes.
 * Keep first-fetch snapshot links on those URLs so crawlers and users do not
 * pay an avoidable 308 redirect for every internal navigation.
 */
function canonicalizeInternalAnchorHrefs(html) {
  return html.replace(/<a\b[^>]*>/gi, (tag) =>
    tag.replace(/\bhref=(["'])([^"']+)\1/i, (match, quote, href) => {
      const canonicalHref = canonicalizeInternalHref(href);
      return match.replace(`${quote}${href}${quote}`, `${quote}${canonicalHref}${quote}`);
    }),
  );
}

function canonicalizeInternalHref(href) {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const suffixIndex = href.search(/[?#]/);
  const pathname = suffixIndex === -1 ? href : href.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? '' : href.slice(suffixIndex);
  if (pathname === '/' || pathname.endsWith('/') || /\/[^/]+\.[^/]+$/i.test(pathname)) {
    return href;
  }
  return `${pathname}/${suffix}`;
}

function setTitle(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
}

function setMetaByName(html, name, content) {
  const tag = `<meta name="${name}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(
    `<meta\\s+name=["']${escapeRegExp(name)}["'][^>]*>`,
    'i',
  );
  return upsertHeadTag(html, pattern, tag);
}

function setMetaByProperty(html, property, content) {
  const tag = `<meta property="${property}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(
    `<meta\\s+property=["']${escapeRegExp(property)}["'][^>]*>`,
    'i',
  );
  return upsertHeadTag(html, pattern, tag);
}

function setCanonical(html, canonical) {
  const tag = `<link rel="canonical" href="${escapeHtml(canonical)}" />`;
  const pattern = /<link\s+rel=["']canonical["'][^>]*>/i;
  return upsertHeadTag(html, pattern, tag);
}

function setRobots(html, route) {
  const pattern = /<meta\s+name=["']robots["'][^>]*>/i;
  if (route.indexable === false) {
    const tag = '<meta name="robots" content="noindex" />';
    return upsertHeadTag(html, pattern, tag);
  }
  return html.replace(pattern, '');
}

function setImageSrc(html, image) {
  const tag = `<link rel="image_src" href="${escapeHtml(image)}" />`;
  const pattern = /<link\s+rel=["']image_src["'][^>]*>/i;
  return upsertHeadTag(html, pattern, tag);
}

function upsertHeadTag(html, pattern, tag) {
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function injectStaticJsonLd(html, route) {
  const items = Array.isArray(route.jsonLd) ? route.jsonLd : [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: route.h1,
      headline: route.h1,
      description: route.description,
      url: route.canonical,
      image: route.images?.length
        ? [route.image || DEFAULT_IMAGE, ...route.images.map((image) => image.url)]
        : route.image || DEFAULT_IMAGE,
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: route.image || DEFAULT_IMAGE,
        contentUrl: route.image || DEFAULT_IMAGE,
      },
      associatedMedia: route.images?.map((image) => ({
        '@type': 'ImageObject',
        url: image.url,
        contentUrl: image.url,
        name: image.title,
        caption: image.caption,
        inLanguage: 'ko-KR',
      })),
      inLanguage: 'ko-KR',
      isPartOf: { '@type': 'WebSite', name: 'QuestDP', url: 'https://quest-dp.com' },
      publisher: { '@type': 'Organization', name: 'QuestDP' },
    },
  ];
  const scripts = items
    .map((item, index) =>
      `<script type="application/ld+json" data-seo-static="${index}">${safeJsonLd(item)}</script>`,
    )
    .join('\n    ');
  return html.replace('</head>', `    ${scripts}\n  </head>`);
}

function injectSnapshotStyle(html) {
  if (html.includes('data-seo-snapshot-style')) return html;
  const style = `<style data-seo-snapshot-style>
      .seo-snapshot{min-height:100vh;background:#010828;color:#eff4ff;font-family:'Noto Sans KR',system-ui,sans-serif;padding:48px 20px;box-sizing:border-box}
      .seo-snapshot__card{max-width:860px;margin:0 auto;padding:28px;border:1px solid rgba(239,244,255,.14);border-radius:24px;background:rgba(255,255,255,.04)}
      .seo-snapshot__eyebrow{margin:0 0 10px;color:#6fff00;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
      .seo-snapshot h1{margin:0 0 14px;font-size:clamp(28px,5vw,48px);line-height:1.18}
      .seo-snapshot p{margin:0 0 18px;color:rgba(239,244,255,.82);font-size:16px;line-height:1.75}
      .seo-snapshot__body{margin-top:24px;border-top:1px solid rgba(239,244,255,.12);padding-top:22px}
      .seo-snapshot__body .seo-lead{font-size:17px;color:rgba(239,244,255,.9)}
      .seo-snapshot__body h2{margin:30px 0 12px;font-size:24px;line-height:1.3}
      .seo-snapshot__body h3{margin:22px 0 8px;font-size:18px;line-height:1.38}
      .seo-snapshot__body section{margin-top:26px}
      .seo-snapshot__body article{margin-top:18px}
      .seo-snapshot__body ul,.seo-snapshot__body ol{margin:0 0 18px;padding-left:22px;color:rgba(239,244,255,.82);line-height:1.75}
      .seo-snapshot__body li{margin:7px 0}
      .seo-snapshot__body a{color:#a7e96a;text-underline-offset:3px}
      .seo-snapshot__body table{width:100%;border-collapse:collapse;margin:14px 0 22px;color:rgba(239,244,255,.82);font-size:14px}
      .seo-snapshot__body th,.seo-snapshot__body td{border:1px solid rgba(239,244,255,.14);padding:10px;text-align:left;vertical-align:top}
      .seo-snapshot__body th{color:#eff4ff;background:rgba(239,244,255,.07)}
      .seo-snapshot__body blockquote,.seo-snapshot__body .seo-callout,.seo-snapshot__body .seo-question-teaser{margin:18px 0;padding:16px;border:1px solid rgba(167,233,106,.24);border-radius:14px;background:rgba(167,233,106,.06)}
      .seo-snapshot__body blockquote cite{display:block;margin-top:8px;color:rgba(239,244,255,.62);font-size:13px}
      .seo-snapshot__body .seo-facts{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:10px 14px;margin:14px 0 20px;color:rgba(239,244,255,.84)}
      .seo-snapshot__body .seo-facts dt{font-weight:800;color:#eff4ff}
      .seo-snapshot__body .seo-facts dd{margin:0}
      .seo-snapshot__images{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:22px}
      .seo-snapshot__images figure{margin:0}
      .seo-snapshot__images img{display:block;width:100%;height:auto;border-radius:16px;border:1px solid rgba(239,244,255,.14);background:rgba(255,255,255,.04)}
      .seo-snapshot__images figcaption{margin-top:8px;color:rgba(239,244,255,.72);font-size:13px;line-height:1.55}
      .seo-snapshot__links{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
      .seo-snapshot__links a{color:#010828;background:#7dd850;text-decoration:none;border-radius:999px;padding:10px 14px;font-size:13px;font-weight:800}
      .seo-snapshot__notice{margin-top:22px;padding-top:18px;border-top:1px solid rgba(239,244,255,.12);color:rgba(239,244,255,.62);font-size:12px;line-height:1.65}
    </style>`;
  return html.replace('</head>', `    ${style}\n  </head>`);
}

function injectHomeFallbackStyle(html) {
  if (html.includes('data-seo-home-fallback-style')) return html;
  const style = `<style data-seo-home-fallback-style>
      .qdp-home-fallback{min-height:100vh;overflow:hidden;background:#010828;color:#eff4ff;font-family:'Noto Sans KR',system-ui,sans-serif;box-sizing:border-box}
      .qdp-home-fallback *{box-sizing:border-box}
      .qdp-home-fallback a{color:inherit}
      .qdp-home-shell{position:relative;isolation:isolate;min-height:100vh;padding:20px}
      .qdp-home-shell:before{content:"";position:absolute;inset:-18% -10% auto auto;width:46vw;min-width:320px;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(125,216,80,.28),rgba(253,128,46,.12) 42%,transparent 70%);filter:blur(18px);z-index:-1}
      .qdp-home-shell:after{content:"";position:absolute;inset:auto auto -18% -16%;width:48vw;min-width:300px;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(103,232,249,.22),rgba(192,132,252,.12) 44%,transparent 72%);filter:blur(20px);z-index:-1}
      .qdp-home-nav{display:flex;align-items:center;justify-content:space-between;gap:16px;max-width:1120px;margin:0 auto;padding:8px 0}
      .qdp-home-logo{font-weight:900;letter-spacing:.08em;font-size:14px}
      .qdp-home-login{border:1px solid rgba(239,244,255,.16);border-radius:999px;padding:9px 13px;text-decoration:none;color:rgba(239,244,255,.82);font-size:13px;font-weight:800;background:rgba(239,244,255,.05)}
      .qdp-home-hero{max-width:1120px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1.08fr) minmax(280px,.92fr);gap:32px;align-items:center;padding:72px 0 46px}
      .qdp-home-kicker{margin:0 0 14px;color:#7dd850;font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
      .qdp-home-title{margin:0;max-width:720px;font-size:clamp(44px,7vw,88px);line-height:.98;letter-spacing:0;font-weight:950}
      .qdp-home-title span{display:block}
      .qdp-home-lead{margin:24px 0 0;max-width:680px;color:rgba(239,244,255,.82);font-size:clamp(15px,2.4vw,18px);line-height:1.8}
      .qdp-home-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px}
      .qdp-home-primary,.qdp-home-secondary{display:inline-flex;align-items:center;justify-content:center;min-height:46px;border-radius:999px;padding:0 18px;text-decoration:none;font-weight:900;font-size:14px}
      .qdp-home-primary{background:#fd802e;color:#010828;box-shadow:0 14px 34px -18px rgba(253,128,46,.9)}
      .qdp-home-secondary{border:1px solid rgba(239,244,255,.18);background:rgba(239,244,255,.06);color:#eff4ff}
      .qdp-home-fact{max-width:1120px;margin:0 auto 26px;border-top:1px solid rgba(239,244,255,.12);border-bottom:1px solid rgba(239,244,255,.12);padding:22px 0;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:22px;align-items:center}
      .qdp-home-fact h2{margin:0 0 8px;color:#fd802e;font-size:13px;letter-spacing:.12em;text-transform:uppercase}
      .qdp-home-fact p{margin:0;max-width:850px;color:rgba(239,244,255,.78);font-size:15px;line-height:1.8}
      .qdp-home-hubs{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}
      .qdp-home-hubs a{border:1px solid rgba(239,244,255,.16);border-radius:999px;padding:9px 13px;text-decoration:none;color:rgba(239,244,255,.82);font-size:13px;font-weight:900;background:rgba(239,244,255,.045)}
      .qdp-home-card{border:1px solid rgba(239,244,255,.14);border-radius:28px;background:linear-gradient(180deg,rgba(239,244,255,.09),rgba(239,244,255,.035));padding:22px;box-shadow:0 24px 80px -52px rgba(0,0,0,.88)}
      .qdp-home-mascot{display:grid;place-items:center;min-height:220px;border-radius:22px;background:radial-gradient(circle at 50% 34%,rgba(239,244,255,.2),rgba(239,244,255,.04) 56%,rgba(1,8,40,.45));border:1px solid rgba(239,244,255,.12);font-weight:950;font-size:72px;color:#7dd850}
      .qdp-home-card h2{margin:18px 0 8px;font-size:24px;line-height:1.2}
      .qdp-home-card p{margin:0;color:rgba(239,244,255,.74);line-height:1.7;font-size:14px}
      .qdp-home-grid{max-width:1120px;margin:0 auto 48px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
      .qdp-home-subject{border:1px solid rgba(239,244,255,.14);border-radius:20px;background:rgba(239,244,255,.045);padding:18px;text-decoration:none;min-height:150px}
      .qdp-home-subject strong{display:block;margin-bottom:8px;font-size:20px}
      .qdp-home-subject p{margin:0;color:rgba(239,244,255,.72);font-size:14px;line-height:1.65}
      .qdp-home-proof{max-width:1120px;margin:0 auto 56px;border-top:1px solid rgba(239,244,255,.12);padding-top:22px;color:rgba(239,244,255,.7);font-size:13px;line-height:1.75}
      .qdp-home-proof b{color:#eff4ff}
      @media (max-width:820px){.qdp-home-shell{padding:16px}.qdp-home-hero{grid-template-columns:1fr;padding:46px 0 30px}.qdp-home-fact{grid-template-columns:1fr}.qdp-home-hubs{justify-content:flex-start}.qdp-home-card{order:-1}.qdp-home-mascot{min-height:150px;font-size:54px}.qdp-home-grid{grid-template-columns:1fr}.qdp-home-title{font-size:clamp(42px,13vw,64px)}}
    </style>`;
  return html.replace('</head>', `    ${style}\n  </head>`);
}

function setRootSnapshot(html, route) {
  const snapshot = renderSnapshot(route);
  return replaceRoot(html, snapshot);
}

function setRootHomeFallback(html, route) {
  return replaceRoot(html, renderHomeFallback(route));
}

function replaceRoot(html, content) {
  if (/<div\s+id=["']root["']>\s*<\/div>/i.test(html)) {
    return html.replace(/<div\s+id=["']root["']>\s*<\/div>/i, `<div id="root">\n${content}\n    </div>`);
  }
  return html.replace(
    /<div\s+id=["']root["'][^>]*>[\s\S]*?<\/div>/i,
    `<div id="root">\n${content}\n    </div>`,
  );
}

function renderHomeFallback(route) {
  return `      <main class="qdp-home-fallback" data-seo-home-fallback="true">
        <div class="qdp-home-shell">
          <nav class="qdp-home-nav" aria-label="QuestDP 주요 이동">
            <div class="qdp-home-logo">QUESTDP</div>
            <a class="qdp-home-login" href="#/login">로그인</a>
          </nav>
          <section class="qdp-home-hero" aria-labelledby="qdp-home-title">
            <div>
              <p class="qdp-home-kicker">${escapeHtml(route.eyebrow || 'ADsP · SQLD · 컴활 게임형 학습')}</p>
              <h1 id="qdp-home-title" class="qdp-home-title">
                <span>ADSP, SQLD</span>
                <span>컴활까지</span>
                <span>놀면서 합격!</span>
              </h1>
              <p class="qdp-home-lead">ADSP 학습사이트, SQLD 학습사이트, 컴활 학습사이트를 찾고 있다면 QuestDP에서 개념부터 문제풀이까지 게임처럼 따라가면 돼요. 오늘 공부할 챕터와 약점이 한눈에 보입니다.</p>
              <div class="qdp-home-actions">
                <a class="qdp-home-primary" href="#/game">지금 플레이</a>
                <a class="qdp-home-secondary" href="/study-method">학습 원리 보기</a>
                <a class="qdp-home-secondary" href="/curriculum/comhwal">컴활 커리큘럼</a>
              </div>
            </div>
            <aside class="qdp-home-card" aria-label="QuestDP 학습 흐름">
              <div class="qdp-home-mascot">Q</div>
              <h2>짧은 개념을 보고 바로 한 문제를 풀어요.</h2>
              <p>로드맵, 약점 분석, 망각곡선 복습을 한 화면에서 이어가며 ADsP·SQLD·컴활 시험 범위를 작게 반복합니다.</p>
            </aside>
          </section>
          <section class="qdp-home-fact" aria-labelledby="qdp-home-fact-title">
            <div>
              <h2 id="qdp-home-fact-title">QuestDP 는 무엇인가</h2>
              <p>QuestDP는 ADsP, SQLD, 컴퓨터활용능력 필기를 처음 보는 사람도 따라갈 수 있게 시험 범위를 작은 개념 스텝과 바로 푸는 문제로 나눈 학습 사이트입니다. 공개 페이지에서는 시험 구조, 커리큘럼, 자주 묻는 질문, 공부법을 확인하고, 실제 앱에서는 로드맵, 약점 분석, 망각곡선 복습을 이어갑니다.</p>
            </div>
            <div class="qdp-home-hubs" aria-label="과목 허브">
              <a href="/curriculum/adsp">ADsP 커리큘럼</a>
              <a href="/curriculum/sqld">SQLD 커리큘럼</a>
              <a href="/curriculum/comhwal">컴활 커리큘럼</a>
            </div>
          </section>
          <section class="qdp-home-grid" aria-label="자격증별 커리큘럼">
            <a class="qdp-home-subject" href="/curriculum/adsp">
              <strong>ADsP 커리큘럼</strong>
              <p>데이터 이해, 분석 기획, 데이터 분석을 초보자용 개념 스텝과 기출형 복습으로 학습합니다.</p>
            </a>
            <a class="qdp-home-subject" href="/curriculum/sqld">
              <strong>SQLD 커리큘럼</strong>
              <p>데이터 모델링과 SQL 기본·활용을 JOIN, 서브쿼리, 윈도우 함수까지 단계별로 풉니다.</p>
            </a>
            <a class="qdp-home-subject" href="/curriculum/comhwal">
              <strong>컴활 커리큘럼</strong>
              <p>컴퓨터 일반, 스프레드시트 일반, 데이터베이스 일반을 실제 카드가 있는 토픽부터 학습합니다.</p>
            </a>
          </section>
          <p class="qdp-home-proof"><b>QuestDP</b>는 ADsP·SQLD·컴활 자격증을 게임처럼 공부하는 학습사이트입니다. 개념 설명·문제·해설은 자체 제작 학습 콘텐츠이며, 공개 SEO 페이지는 색인을 위한 빈 껍데기가 아니라 사용자가 시험 범위와 공부 순서를 이해할 수 있는 본문을 우선합니다. ADsP는 데이터 이해, 데이터분석 기획, 데이터 분석을 짧은 스텝으로 나누고, SQLD는 데이터 모델링과 SQL 기본·활용을 문법 단위로 다시 꺼내 보게 합니다. 컴활은 1급과 2급 공통 출발점인 컴퓨터 일반부터 실제 카드가 있는 토픽을 공개합니다. 시험 일정과 응시료처럼 바뀌는 값은 공식 사이트 확인으로 남기고, QuestDP 안에서는 개념 학습, 문제풀이, 오답 복습, 약점 점검을 한 흐름으로 이어갑니다.</p>
        </div>
      </main>`;
}

function renderSnapshot(route) {
  const links = route.links
    .slice(0, 6)
    .map(
      (link) =>
        `<a href="${escapeHtml(encodeURI(link.href))}">${escapeHtml(link.label)}</a>`,
    )
    .join('\n          ');
  const images = (route.images || [])
    .slice(0, 6)
    .map(
      (image) =>
        `<figure><img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.caption)}" loading="lazy" /><figcaption>${escapeHtml(image.title)} — ${escapeHtml(image.caption)}</figcaption></figure>`,
    )
    .join('\n          ');
  const staticContent = route.staticContentHtml
    ? `<div class="seo-snapshot__body">\n${route.staticContentHtml}\n          </div>`
    : '';
  return `      <main class="seo-snapshot" data-seo-snapshot="true">
        <article class="seo-snapshot__card">
          ${route.eyebrow ? `<p class="seo-snapshot__eyebrow">${escapeHtml(route.eyebrow)}</p>` : ''}
          <h1>${escapeHtml(route.h1)}</h1>
          <p>${escapeHtml(route.summary || route.description)}</p>
          ${staticContent}
          ${images ? `<div class="seo-snapshot__images">\n          ${images}\n          </div>` : ''}
          ${links ? `<nav class="seo-snapshot__links" aria-label="관련 페이지">\n          ${links}\n          </nav>` : ''}
          <p class="seo-snapshot__notice">${escapeHtml(CONTENT_PROTECTION_NOTICE)}</p>
        </article>
      </main>`;
}

function safeJsonLd(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

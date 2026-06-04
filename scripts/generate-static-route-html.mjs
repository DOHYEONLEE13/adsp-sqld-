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
  html = setImageSrc(html, image);
  html = injectStaticJsonLd(html, route);
  if (route.path !== '/') {
    html = injectSnapshotStyle(html);
    html = setRootSnapshot(html, route);
  }
  return html;
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

function setRootSnapshot(html, route) {
  const snapshot = renderSnapshot(route);
  if (/<div\s+id=["']root["']>\s*<\/div>/i.test(html)) {
    return html.replace(/<div\s+id=["']root["']>\s*<\/div>/i, `<div id="root">\n${snapshot}\n    </div>`);
  }
  return html.replace(
    /<div\s+id=["']root["'][^>]*>[\s\S]*?<\/div>/i,
    `<div id="root">\n${snapshot}\n    </div>`,
  );
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
  return `      <main class="seo-snapshot" data-seo-snapshot="true">
        <article class="seo-snapshot__card">
          ${route.eyebrow ? `<p class="seo-snapshot__eyebrow">${escapeHtml(route.eyebrow)}</p>` : ''}
          <h1>${escapeHtml(route.h1)}</h1>
          <p>${escapeHtml(route.summary || route.description)}</p>
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

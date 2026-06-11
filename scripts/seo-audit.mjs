#!/usr/bin/env node
/**
 * Build-time SEO safety checks. Keeps quiz URLs out of the public SEO surface
 * and verifies that every sitemap URL has a matching static HTML file with its
 * own canonical. The root page needs a landing-like fallback body, and non-root
 * SEO pages also need a first-fetch H1 snapshot.
 */
import fs from 'node:fs';
import path from 'node:path';
import { getSeoRouteManifest } from './seo-route-manifest.mjs';

const DIST_DIR = path.resolve('dist');
const REQUIRED_SITEMAPS = [
  'sitemap-core.xml',
  'sitemap-blog.xml',
  'sitemap-lessons.xml',
  'sitemap-topics.xml',
];

const manifest = getSeoRouteManifest();
const expectedRoutes = new Map(manifest.all.map((route) => [route.canonical, route]));
const indexableRoutes = new Map(
  manifest.all.filter(isIndexableRoute).map((route) => [route.canonical, route]),
);

assertFile(path.join(DIST_DIR, 'sitemap.xml'));
const sitemapIndex = readDist('sitemap.xml');
for (const sitemap of REQUIRED_SITEMAPS) {
  if (!sitemapIndex.includes(`https://quest-dp.com/${sitemap}`)) {
    fail(`sitemap.xml is missing ${sitemap}`);
  }
  assertFile(path.join(DIST_DIR, sitemap));
}
if (/sitemap-quiz\.xml|\/quiz\//.test(sitemapIndex)) {
  fail('quiz sitemap or quiz URL leaked into sitemap.xml');
}

assertFile(path.join(DIST_DIR, 'rss.xml'));
const rssXml = readDist('rss.xml');
if (!/<rss\b[^>]*version=["']2\.0["'][^>]*>/i.test(rssXml)) {
  fail('rss.xml is not RSS 2.0');
}
const rssItemCount = (rssXml.match(/<item>/g) || []).length;
if (rssItemCount !== manifest.blog.length) {
  fail(`rss.xml item count mismatch: ${rssItemCount}, expected ${manifest.blog.length}`);
}

const submittedLocs = [];
for (const sitemap of REQUIRED_SITEMAPS) {
  const xml = readDist(sitemap);
  if (/\/quiz\//.test(xml)) fail(`/quiz/ URL leaked into ${sitemap}`);
  submittedLocs.push(...extractLocs(xml));
}

const submittedSet = new Set(submittedLocs);
for (const loc of submittedLocs) {
  if (!expectedRoutes.has(loc)) fail(`sitemap URL is not in SEO manifest: ${loc}`);
  if (!indexableRoutes.has(loc)) fail(`noindex manifest URL leaked into sitemap: ${loc}`);
}
for (const [canonical] of indexableRoutes) {
  if (!submittedSet.has(canonical)) fail(`SEO manifest URL is missing from sitemaps: ${canonical}`);
}

for (const route of manifest.all) {
  const file = htmlPathFor(route.path);
  assertFile(file);
  const html = fs.readFileSync(file, 'utf8');
  const canonicalTag = `<link rel="canonical" href="${route.canonical}"`;
  if (!html.includes(canonicalTag)) {
    fail(`Missing canonical for ${route.path}: expected ${route.canonical}`);
  }
  if (route.path !== '/' && html.includes('<link rel="canonical" href="https://quest-dp.com/"')) {
    fail(`Root canonical leaked into ${route.path}`);
  }
  const hasNoindex = /<meta\s+name=["']robots["']\s+content=["']noindex["']\s*\/?>/i.test(html);
  if (isIndexableRoute(route) && hasNoindex) {
    fail(`Indexable route has noindex robots meta: ${route.path}`);
  }
  if (!isIndexableRoute(route) && !hasNoindex) {
    fail(`Noindex manifest route is missing robots noindex meta: ${route.path}`);
  }
  if (isIndexableRoute(route) && route.path.startsWith('/lesson/') && /안녕|첫 시간이야/.test(route.description)) {
    fail(`Lesson meta description still looks like dialogue text: ${route.path}`);
  }
  if (route.path === '/') {
    if (!html.includes('data-seo-home-fallback="true"')) {
      fail('Missing home landing fallback body for /');
    }
    for (const keyword of ['ADSP 학습사이트', 'SQLD 학습사이트', '컴활 학습사이트']) {
      if (!html.includes(keyword)) fail(`Home fallback is missing keyword: ${keyword}`);
    }
  } else {
    if (!html.includes(`<h1>${escapeHtml(route.h1)}</h1>`)) {
      fail(`Missing static H1 snapshot for ${route.path}`);
    }
    if (!html.includes('data-seo-snapshot="true"')) {
      fail(`Missing static body snapshot for ${route.path}`);
    }
    if (route.minSeoTextChars) {
      const textChars = countVisibleTextCodepoints(html);
      if (textChars < route.minSeoTextChars) {
        fail(
          `Static body text is too short for ${route.path}: ${textChars} chars, expected at least ${route.minSeoTextChars} chars (Korean code points, not UTF-8 bytes)`,
        );
      }
    }
    if (route.path.startsWith('/topics/comhwal/')) {
      if (html.includes('"acceptedAnswer"') || html.includes('acceptedAnswer')) {
        fail(`Comhwal topic leaked acceptedAnswer JSON-LD: ${route.path}`);
      }
      const teaserCount = (html.match(/data-seo-question-teaser="true"/g) || []).length;
      if (teaserCount > 1) {
        fail(`Comhwal topic has more than one public question teaser: ${route.path}`);
      }
    }
  }
}

const htmlFiles = listIndexHtmlFiles(DIST_DIR);
const expectedFiles = new Set(manifest.all.map((route) => path.normalize(htmlPathFor(route.path))));
for (const file of htmlFiles) {
  if (!expectedFiles.has(path.normalize(file))) {
    fail(`Static HTML exists without sitemap manifest entry: ${path.relative(DIST_DIR, file)}`);
  }
}

console.log(
  `seo audit passed: ${manifest.all.length} static pages, ${submittedLocs.length} submitted URLs, ${manifest.all.length - indexableRoutes.size} noindex pages, quiz 0`,
);

function readDist(fileName) {
  return fs.readFileSync(path.join(DIST_DIR, fileName), 'utf8');
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function htmlPathFor(routePath) {
  if (routePath === '/') return path.join(DIST_DIR, 'index.html');
  return path.join(DIST_DIR, ...routePath.split('/').filter(Boolean), 'index.html');
}

function listIndexHtmlFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) listIndexHtmlFiles(file, out);
    else if (entry.name === 'index.html') out.push(file);
  }
  return out;
}

function assertFile(file) {
  if (!fs.existsSync(file)) fail(`Missing file: ${file}`);
}

function isIndexableRoute(route) {
  return route.indexable !== false;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function countVisibleTextCodepoints(html) {
  const text = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return Array.from(text).length;
}

function fail(message) {
  throw new Error(`[seo-audit] ${message}`);
}

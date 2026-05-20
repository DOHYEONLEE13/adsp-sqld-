/**
 * generate-static-route-html.mjs
 *
 * Vite SPA routes are rendered client-side, but search crawlers first fetch the
 * raw HTML. If every path returns the root canonical, Google can consolidate
 * otherwise indexable pages back to `/`. This script creates small per-route
 * HTML entry files after `vite build` so Cloudflare Pages serves a correct
 * first-fetch title, description, og:url, and canonical for priority SEO pages.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const SITE_ORIGIN = 'https://quest-dp.com';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/og/default.png`;

const pages = [
  {
    path: '/study-method',
    title: 'QuestDP 학습 원리 — ADsP·SQLD 게임형 학습사이트 설계',
    description:
      'ADsP·SQLD 게임형 학습사이트 QuestDP가 개념 스텝, 즉시 문제풀이, 약점 점수, 망각곡선 복습으로 시험범위를 학습시키는 원리를 정리했습니다.',
    image: `${SITE_ORIGIN}/og/questdp-method.png`,
    type: 'article',
  },
  {
    path: '/curriculum/adsp',
    title: 'ADsP 학습사이트 · KDATA 시험범위·기출문제 커리큘럼 — QuestDP',
    description:
      'KDATA ADsP 시험범위, 문제 수, 과목별 배점, 기출문제형 복습 흐름을 한 번에 보는 ADsP 학습사이트 커리큘럼입니다.',
  },
  {
    path: '/curriculum/sqld',
    title: 'SQLD 학습사이트 · KDATA 시험범위·기출문제 커리큘럼 — QuestDP',
    description:
      'KDATA SQLD 시험범위, 문제 수, 과목별 배점, 기출문제형 복습 흐름을 한 번에 보는 SQLD 학습사이트 커리큘럼입니다.',
  },
  {
    path: '/faq/adsp',
    title: 'ADsP 학습사이트 FAQ — KDATA 시험범위·기출문제·공부법',
    description:
      'ADsP 몇 문제, KDATA ADsP 시험범위, ADsP 기출문제 공부법, ADsP 합격 기준을 수험생 관점에서 정리한 FAQ입니다.',
  },
  {
    path: '/faq/sqld',
    title: 'SQLD 학습사이트 FAQ — KDATA 시험범위·기출문제·공부법',
    description:
      'SQLD 몇 문제, KDATA SQLD 시험범위, SQLD 기출문제 공부법, SQLD 합격 기준을 수험생 관점에서 정리한 FAQ입니다.',
  },
  {
    path: '/glossary',
    title: 'ADsP·SQLD 용어 사전 — QuestDP',
    description:
      'ADsP와 SQLD 시험에 자주 등장하는 데이터 분석, SQL, 모델링 용어를 초보자 기준으로 정리한 QuestDP 용어 사전입니다.',
  },
  {
    path: '/blog',
    title: 'ADsP·SQLD 공부법 블로그 — QuestDP',
    description:
      'ADsP 공부법, SQLD 공부법, 비전공자 학습 순서, 기출문제 복습 전략을 정리한 QuestDP 블로그입니다.',
    type: 'blog',
  },
  {
    path: '/pricing',
    title: 'QuestDP 요금제 — ADsP·SQLD 게임형 학습사이트',
    description:
      'ADsP·SQLD 게임형 학습사이트 QuestDP의 무료 플랜, 오픈 베타 쿠폰, 프리미엄 이용 안내를 확인하세요.',
  },
  {
    path: '/about',
    title: 'QuestDP 소개 — ADsP·SQLD 게임형 학습사이트',
    description:
      'QuestDP는 한국 ADsP·SQLD 자격증 학습을 우주 탐험 RPG와 마이크로 러닝으로 재구성한 학습사이트입니다.',
  },
  {
    path: '/privacy',
    title: '개인정보처리방침 — QuestDP',
    description: 'QuestDP 개인정보 수집, 이용, 보관, 파기 기준을 안내합니다.',
  },
  {
    path: '/terms',
    title: '이용약관 — QuestDP',
    description: 'QuestDP 서비스 이용 조건과 회원의 권리·의무를 안내합니다.',
  },
  {
    path: '/refund',
    title: '환불 정책 — QuestDP',
    description: 'QuestDP 결제, 환불, 청약철회 기준을 안내합니다.',
  },
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setTitle(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
}

function setMetaByName(html, name, content) {
  const escaped = escapeHtml(content);
  const pattern = new RegExp(
    `<meta\\s+name=["']${name}["']\\s+content=["'][\\s\\S]*?["']\\s*\\/?>`,
    'i',
  );
  return html.replace(pattern, `<meta name="${name}" content="${escaped}" />`);
}

function setMetaByProperty(html, property, content) {
  const escaped = escapeHtml(content);
  const pattern = new RegExp(
    `<meta\\s+property=["']${property}["']\\s+content=["'][\\s\\S]*?["']\\s*\\/?>`,
    'i',
  );
  return html.replace(pattern, `<meta property="${property}" content="${escaped}" />`);
}

function setCanonical(html, canonical) {
  return html.replace(
    /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
  );
}

function setImageSrc(html, image) {
  return html.replace(
    /<link\s+rel=["']image_src["']\s+href=["'][^"']*["']\s*\/?>/i,
    `<link rel="image_src" href="${escapeHtml(image)}" />`,
  );
}

function routeHtml(template, page) {
  const canonical = `${SITE_ORIGIN}${page.path}`;
  const image = page.image ?? DEFAULT_IMAGE;
  const type = page.type ?? 'website';

  let html = template;
  html = setTitle(html, page.title);
  html = setMetaByName(html, 'description', page.description);
  html = setMetaByProperty(html, 'og:title', page.title);
  html = setMetaByProperty(html, 'og:description', page.description);
  html = setMetaByProperty(html, 'og:type', type);
  html = setMetaByProperty(html, 'og:url', canonical);
  html = setMetaByProperty(html, 'og:image', image);
  html = setMetaByName(html, 'twitter:title', page.title);
  html = setMetaByName(html, 'twitter:description', page.description);
  html = setMetaByName(html, 'twitter:image', image);
  html = setCanonical(html, canonical);
  html = setImageSrc(html, image);
  return html;
}

const template = await readFile(path.join(DIST_DIR, 'index.html'), 'utf8');

for (const page of pages) {
  const targetDir = path.join(DIST_DIR, ...page.path.split('/').filter(Boolean));
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, 'index.html'), routeHtml(template, page), 'utf8');
}

console.log(`✅ static route HTML 생성 — ${pages.length} pages`);

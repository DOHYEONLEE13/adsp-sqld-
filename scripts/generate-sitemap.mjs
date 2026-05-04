#!/usr/bin/env node
/**
 * generate-sitemap.mjs — Tier 2 programmatic SEO 사이트맵 자동 생성.
 *
 * 빌드 시점에 실행 (npm run prebuild).
 *
 * 출력: public/sitemap.xml
 *   - 정적 페이지 (홈 / about / privacy / terms / refund)
 *   - lesson 페이지 (`/lesson/:stepId`) — ALL_LESSONS 의 모든 step
 *
 * 동적 import (TS 파일을 직접 못 읽으므로) — 대신 lesson 데이터 JSON 처럼 다루는
 * 간단한 추출 스크립트. ts-node 도입 부담 X.
 *
 * 향후 확장:
 *   - quiz 페이지 (`/quiz/:round/:n`) — 200+ URL
 *   - 토픽 클러스터 페이지 (`/topics/:subject/:topic`)
 *   - 블로그 (`/blog/:slug`)
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const LESSONS_ROOT = path.join(REPO_ROOT, 'src/data/lessons');
const QUESTIONS_ROOT = path.join(REPO_ROOT, 'src/data/questions');
const OUT = path.join(REPO_ROOT, 'public/sitemap.xml');

const BASE_URL = 'https://quest-dp.com';

// ─── lesson step ID 추출 ─────────────────────────────────────────
// .ts 파일에서 정규식으로 `id: 'adsp-1-1-s1'` 패턴 매칭. 직접 import 안 하고도
// 빌드 시점 의존성 없이 동작.

function collectLessonStepIds() {
  const tsFiles = [];
  for (const subj of ['adsp', 'sqld']) {
    const dir = path.join(LESSONS_ROOT, subj);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.ts')) tsFiles.push(path.join(dir, f));
    }
  }
  const stepIds = new Set();
  const stepIdRe = /id:\s*'((?:adsp|sqld)-\d+-\d+-s\d+(?:-[a-zA-Z0-9-]+)?)'/g;
  for (const file of tsFiles) {
    const src = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = stepIdRe.exec(src)) !== null) {
      stepIds.add(m[1]);
    }
  }
  return [...stepIds];
}

// ─── question ID 추출 (indexable 한 것만) ────────────────────────
// JSON 파일에서 type='multiple_choice' + status != 'restored' + !needsDistractors
// 인 모든 질문의 id 모음. isPlayable 의 mirror.

function walkJSON(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkJSON(p, out);
    else if (entry.name.endsWith('.json')) out.push(p);
  }
  return out;
}

function collectQuestionIds() {
  const ids = new Set();
  if (!fs.existsSync(QUESTIONS_ROOT)) return [];
  for (const file of walkJSON(QUESTIONS_ROOT)) {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    const arr = Array.isArray(raw) ? raw : Array.isArray(raw?.questions) ? raw.questions : null;
    if (!arr) continue;
    for (const q of arr) {
      if (!q || typeof q !== 'object') continue;
      if (q.type !== 'multiple_choice') continue;
      if (q.status === 'restored') continue;
      if (q.needsDistractors) continue;
      if (typeof q.id === 'string' && q.id) ids.add(q.id);
    }
  }
  return [...ids];
}

// ─── XML 생성 ───────────────────────────────────────────────────

const STATIC_URLS = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/about', changefreq: 'monthly', priority: '0.8' },
  { loc: '/pricing', changefreq: 'monthly', priority: '0.9' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
  { loc: '/refund', changefreq: 'yearly', priority: '0.3' },
  // Tier 2 PR 3 — pillar 커리큘럼 페이지 (모든 lesson 의 hub).
  { loc: '/curriculum/adsp', changefreq: 'weekly', priority: '0.9' },
  { loc: '/curriculum/sqld', changefreq: 'weekly', priority: '0.9' },
];

function buildSitemap(stepIds, questionIds) {
  const urls = [
    ...STATIC_URLS,
    ...stepIds.map((id) => ({
      loc: `/lesson/${id}`,
      changefreq: 'monthly',
      priority: '0.7',
    })),
    ...questionIds.map((id) => ({
      loc: `/quiz/${id}`,
      changefreq: 'monthly',
      // 기출문제 → transactional intent. lesson 보다 살짝 낮음 (개수 많아 중복 risk).
      priority: '0.6',
    })),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!--',
    '  QuestDP sitemap — generate-sitemap.mjs 가 자동 생성.',
    `  생성 시각: ${new Date().toISOString()}`,
    `  총 URL: ${urls.length} (정적 ${STATIC_URLS.length} + lesson ${stepIds.length} + quiz ${questionIds.length})`,
    '-->',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) =>
      [
        '  <url>',
        `    <loc>${BASE_URL}${u.loc}</loc>`,
        `    <changefreq>${u.changefreq}</changefreq>`,
        `    <priority>${u.priority}</priority>`,
        '  </url>',
      ].join('\n'),
    ),
    '</urlset>',
    '',
  ].join('\n');

  return xml;
}

// ─── 실행 ───────────────────────────────────────────────────────

const stepIds = collectLessonStepIds();
const questionIds = collectQuestionIds();
console.log(`📚 lesson step 발견: ${stepIds.length}`);
console.log(`❓ indexable question 발견: ${questionIds.length}`);
const xml = buildSitemap(stepIds, questionIds);
fs.writeFileSync(OUT, xml, 'utf8');
console.log(`✅ sitemap.xml 생성 — ${OUT}`);
console.log(
  `   총 URL: ${STATIC_URLS.length + stepIds.length + questionIds.length} ` +
    `(정적 ${STATIC_URLS.length} + lesson ${stepIds.length} + quiz ${questionIds.length})`,
);

#!/usr/bin/env node
/**
 * generate-og-images.mjs — 블로그 포스트별 Open Graph (1200x630) 이미지 자동 생성.
 *
 * 출력: public/og/blog-<slug>.png (기존 default.png 와 별개)
 *
 * 동작:
 *   1. src/data/seo/blog.ts 정규식 파싱 → 모든 POSTS 의 slug/title/subtitle/category
 *   2. Playwright Chromium 으로 1200x630 페이지 띄움
 *   3. 인라인 HTML (브랜드 색상 + 한글 폰트) 렌더 후 스크린샷
 *   4. public/og/blog-<slug>.png 저장
 *
 * 실행:
 *   - 수동: `node scripts/generate-og-images.mjs`
 *   - 빌드 통합: package.json prebuild 에 추가 (현재는 수동 — 빌드 시간 늘어남)
 *
 * BlogPostPage 가 자동으로 `/og/blog-<slug>.png` 우선 시도, 없으면 default 폴백.
 *
 * 의존: @playwright/test (이미 devDeps). chromium 바이너리 (`npx playwright install
 * chromium` 사전 1회 실행).
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { chromium } from '@playwright/test';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const BLOG_FILE = path.join(REPO_ROOT, 'src/data/seo/blog.ts');
const OUT_DIR = path.join(REPO_ROOT, 'public/og');

// ─── blog.ts 파싱 — sitemap 스크립트와 동일 패턴 ────────────────
function collectPosts() {
  if (!fs.existsSync(BLOG_FILE)) return [];
  const src = fs.readFileSync(BLOG_FILE, 'utf8');

  // POSTS 배열 객체 단위로 끊기 — 단순히 slug/title/subtitle/category 만 필요.
  // 정규식 매칭: 각 포스트는 { slug: '...', title: '...', subtitle: '...', category: '...', ... } 형태.
  // 여러 줄 매칭 (multiline + dot-all flag).
  const posts = [];
  const blockRe =
    /\{\s*slug:\s*'([^']+)',\s*title:\s*'([^']+)',\s*subtitle:\s*'([^']+)',\s*category:\s*'([^']+)'/g;
  let m;
  while ((m = blockRe.exec(src)) !== null) {
    posts.push({
      slug: m[1],
      title: m[2],
      subtitle: m[3],
      category: m[4],
    });
  }
  return posts;
}

// ─── 카테고리 별 한글 라벨 + 색상 ─────────────────────────────
const CATEGORY_LABEL = {
  comparison: '비교',
  roadmap: '로드맵',
  guide: '가이드',
};

const CATEGORY_COLOR = {
  comparison: '#67e8f9', // cyan
  roadmap: '#6FFF00', // neon
  guide: '#c084fc', // purple
};

// ─── HTML 템플릿 ───────────────────────────────────────────────
function buildHtml(post) {
  const catLabel = CATEGORY_LABEL[post.category] ?? post.category;
  const catColor = CATEGORY_COLOR[post.category] ?? '#6FFF00';
  // 텍스트 안 따옴표 escape (HTML — title/subtitle 만 안전)
  const esc = (s) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Sora:wght@700;800&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px; height: 630px;
    font-family: 'Noto Sans KR', system-ui, sans-serif;
    color: #EFF4FF;
    background:
      radial-gradient(ellipse at 75% 25%, rgba(103, 232, 249, 0.18) 0%, transparent 55%),
      radial-gradient(ellipse at 15% 80%, rgba(192, 132, 252, 0.18) 0%, transparent 55%),
      linear-gradient(135deg, #010828 0%, #0a1746 100%);
    position: relative;
    overflow: hidden;
  }
  /* 배경 그리드 (장식) */
  .grid-bg {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(239,244,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(239,244,255,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(ellipse at 50% 50%, black 30%, transparent 75%);
  }
  /* 우상단 글로우 */
  .corner-glow {
    position: absolute; top: -120px; right: -120px;
    width: 480px; height: 480px;
    border-radius: 50%;
    background: radial-gradient(circle, ${catColor}33 0%, transparent 70%);
    filter: blur(40px);
  }
  .container {
    position: relative; z-index: 1;
    width: 100%; height: 100%;
    padding: 64px 72px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  /* 헤더 — 로고 + 카테고리 */
  .header { display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 14px; }
  .brand-logo {
    width: 56px; height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6FFF00, #54c800);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 24px -6px rgba(111, 255, 0, 0.4);
    font-family: 'Sora', sans-serif;
    font-weight: 800; font-size: 28px;
    color: #010828;
  }
  .brand-name {
    font-family: 'Sora', sans-serif;
    font-weight: 800; font-size: 28px;
    letter-spacing: -0.02em;
  }
  .brand-name .accent { color: #6FFF00; }
  .badge {
    padding: 10px 20px;
    border-radius: 999px;
    background: ${catColor}22;
    border: 1.5px solid ${catColor}80;
    color: ${catColor};
    font-weight: 700; font-size: 16px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  /* 본문 — 제목 + 부제 */
  .body { display: flex; flex-direction: column; gap: 24px; max-width: 1000px; }
  .title {
    font-weight: 900;
    font-size: 64px;
    line-height: 1.18;
    letter-spacing: -0.03em;
    color: #EFF4FF;
  }
  .subtitle {
    font-weight: 500;
    font-size: 24px;
    line-height: 1.5;
    color: rgba(239, 244, 255, 0.72);
    /* 2 줄 클램프 */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  /* 푸터 */
  .footer {
    display: flex; align-items: center; justify-content: space-between;
    border-top: 1px solid rgba(239, 244, 255, 0.12);
    padding-top: 22px;
  }
  .domain {
    font-family: 'Sora', sans-serif;
    font-weight: 700; font-size: 18px;
    color: rgba(239, 244, 255, 0.6);
    letter-spacing: 0.04em;
  }
  .tagline {
    font-size: 16px;
    color: rgba(239, 244, 255, 0.5);
  }
</style>
</head>
<body>
  <div class="grid-bg"></div>
  <div class="corner-glow"></div>

  <div class="container">
    <div class="header">
      <div class="brand">
        <div class="brand-logo">Q</div>
        <div class="brand-name"><span>Quest</span><span class="accent">DP</span></div>
      </div>
      <div class="badge">${esc(catLabel)}</div>
    </div>

    <div class="body">
      <h1 class="title">${esc(post.title)}</h1>
      <p class="subtitle">${esc(post.subtitle)}</p>
    </div>

    <div class="footer">
      <div class="domain">quest-dp.com/blog</div>
      <div class="tagline">ADSP · SQLD, 놀면서 합격</div>
    </div>
  </div>
</body>
</html>`;
}

// ─── Playwright 실행 ───────────────────────────────────────────
async function main() {
  const posts = collectPosts();
  if (posts.length === 0) {
    console.warn('⚠️  blog.ts 에서 포스트를 찾지 못함. 정규식 / 파일 경로 확인 필요.');
    process.exit(1);
  }
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log(`📝 포스트 ${posts.length} 개 발견. OG 이미지 생성 시작...`);
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });

    for (const post of posts) {
      const page = await context.newPage();
      const html = buildHtml(post);
      await page.setContent(html, { waitUntil: 'networkidle' });
      // 폰트 로드 대기 — networkidle 만으론 가끔 web font swap 미완료.
      await page.evaluate(() => document.fonts.ready);
      const outPath = path.join(OUT_DIR, `blog-${post.slug}.png`);
      await page.screenshot({
        path: outPath,
        type: 'png',
        clip: { x: 0, y: 0, width: 1200, height: 630 },
      });
      await page.close();
      console.log(`  ✅ blog-${post.slug}.png`);
    }
  } finally {
    await browser.close();
  }
  console.log('🎉 완료');
}

await main();

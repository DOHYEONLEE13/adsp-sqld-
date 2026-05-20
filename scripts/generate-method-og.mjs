#!/usr/bin/env node
/**
 * generate-method-og.mjs — `/study-method` 대표 OG 이미지 생성.
 *
 * PowerShell pipe 로 인라인 스크립트를 넘기면 한글이 깨질 수 있어, UTF-8 파일로
 * 보관한다. 로컬 이미지도 file:// 대신 data URL 로 넣어 경로 인코딩 문제를 피한다.
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { chromium } from '@playwright/test';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const OUT = path.join(REPO_ROOT, 'public/og/questdp-method.png');

function imageDataUrl(relativePath) {
  const abs = path.join(REPO_ROOT, relativePath);
  const mime = abs.endsWith('.png') ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${fs.readFileSync(abs).toString('base64')}`;
}

function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const ques = imageDataUrl('public/mascot/ques-lightbulb.png');
const selli = imageDataUrl('public/mascot/selli-think.png');

const copy = {
  pill: 'ADsP · SQLD 게임형 학습사이트',
  title1: '개념을 보고',
  title2: '바로 풀고',
  title3: '약점으로 돌아오는 학습',
  subtitle: '225개 개념 스텝 · 즉시 문제풀이 · 약점 점수 · 망각곡선 복습',
  chips: ['개념 스텝', '기출 풀이', '약점 진단', '복습 큐'],
};

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@500;700;900&family=Sora:wght@700;800&display=swap" rel="stylesheet" />
<style>
*{box-sizing:border-box}
body{margin:0;width:1200px;height:630px;overflow:hidden;background:#010828;color:#EFF4FF;font-family:'Noto Sans KR',system-ui,sans-serif;position:relative}
body:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 18% 20%,rgba(103,232,249,.26),transparent 34%),radial-gradient(circle at 82% 18%,rgba(192,132,252,.22),transparent 35%),radial-gradient(circle at 48% 92%,rgba(125,216,80,.16),transparent 34%),linear-gradient(135deg,#010828 0%,#081541 65%,#010828 100%)}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(239,244,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(239,244,255,.05) 1px,transparent 1px);background-size:44px 44px;mask-image:radial-gradient(ellipse at 50% 50%,#000 26%,transparent 78%)}
.wrap{position:relative;z-index:1;width:100%;height:100%;padding:58px 68px;display:flex;flex-direction:column;justify-content:space-between}
.top{display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:16px}
.mark{width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#6FFF00,#7DD850);display:flex;align-items:center;justify-content:center;color:#010828;font-family:Sora;font-size:30px;font-weight:800;box-shadow:0 16px 34px rgba(111,255,0,.24)}
.word{font-family:Sora;font-weight:800;font-size:30px;letter-spacing:-.03em}.word b{color:#6FFF00}
.pill{border:1px solid rgba(239,244,255,.18);background:rgba(255,255,255,.06);border-radius:999px;padding:11px 18px;font-size:15px;font-weight:700;color:rgba(239,244,255,.82)}
.main{display:grid;grid-template-columns:1fr 360px;align-items:center;gap:40px}
.eyebrow{font-size:18px;color:#67e8f9;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin-bottom:18px}
.title{font-size:70px;line-height:1.12;font-weight:900;letter-spacing:-.04em;max-width:790px}.title span{color:#6FFF00}
.sub{margin-top:24px;font-size:25px;line-height:1.48;color:rgba(239,244,255,.74);max-width:720px}
.mascots{height:360px;position:relative}.mascots img{position:absolute;object-fit:contain;filter:drop-shadow(0 24px 44px rgba(0,0,0,.48))}
.q{width:250px;right:142px;top:18px}.s{width:255px;right:-2px;top:74px}
.badge{position:absolute;right:76px;bottom:22px;border:1px solid rgba(111,255,0,.42);background:rgba(111,255,0,.12);color:#B8FF7A;border-radius:18px;padding:18px 22px;font-size:22px;font-weight:900;box-shadow:0 20px 46px rgba(0,0,0,.22)}
.steps{display:flex;gap:14px}.step{border:1px solid rgba(239,244,255,.14);background:rgba(255,255,255,.055);border-radius:18px;padding:16px 19px;font-size:19px;font-weight:800;color:rgba(239,244,255,.86)}
.step:nth-child(1){color:#9beafe}.step:nth-child(2){color:#b8ff7a}.step:nth-child(3){color:#ffd0a8}.step:nth-child(4){color:#dec4ff}
.domain{font-family:Sora;font-size:18px;font-weight:800;color:rgba(239,244,255,.62);letter-spacing:.05em}
</style>
</head>
<body>
  <div class="grid"></div>
  <div class="wrap">
    <div class="top">
      <div class="brand"><div class="mark">Q</div><div class="word">Quest<b>DP</b></div></div>
      <div class="pill">${esc(copy.pill)}</div>
    </div>
    <div class="main">
      <div>
        <div class="eyebrow">Study Method</div>
        <div class="title">${esc(copy.title1)}<br/><span>${esc(copy.title2)}</span><br/>${esc(copy.title3)}</div>
        <div class="sub">${esc(copy.subtitle)}</div>
      </div>
      <div class="mascots">
        <img class="q" src="${ques}" alt="" />
        <img class="s" src="${selli}" alt="" />
        <div class="badge">Play → Solve → Review</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div class="steps">
        ${copy.chips.map((chip) => `<div class="step">${esc(chip)}</div>`).join('')}
      </div>
      <div class="domain">quest-dp.com/study-method</div>
    </div>
  </div>
</body>
</html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: OUT,
    type: 'png',
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });
  console.log(`created ${OUT} ${fs.statSync(OUT).size} bytes`);
} finally {
  await browser.close();
}

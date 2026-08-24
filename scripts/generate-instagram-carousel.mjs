import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const date = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) {
  throw new Error('Usage: node scripts/generate-instagram-carousel.mjs YYYY-MM-DD');
}

const packageDir = path.resolve('seo-ops', '04-daily-content', date);
const assetDir = path.join(packageDir, 'assets');
const sourcePath = path.join(assetDir, 'instagram-carousel.json');
const slides = JSON.parse(await fs.readFile(sourcePath, 'utf8'));
await fs.mkdir(assetDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

for (const [index, slide] of slides.entries()) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
  await page.setContent(renderDocument(slide, index, slides.length), { waitUntil: 'load' });
  await page.locator('.slide').screenshot({
    path: path.join(assetDir, `instagram-${String(index + 1).padStart(2, '0')}.png`),
  });
  await page.close();
}

await browser.close();
console.log(`instagram carousel generated: ${slides.length} slides → ${assetDir}`);

function renderDocument(slide, index, total) {
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><style>${styles()}</style></head>
<body><main class="slide layout-${escapeHtml(slide.layout)}">
  <div class="grid"></div><div class="glow glow-a"></div><div class="glow glow-b"></div>
  <header class="brandbar">
    <div class="brand"><span class="brand-mark">Q</span><span>Quest<span class="brand-accent">DP</span></span></div>
    <div class="series">SQLD STARTER GUIDE</div>
    <div class="page-number">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
  </header>
  ${renderLayout(slide)}
  <footer><span>quest-dp.com</span><span>${escapeHtml(slide.footer ?? '처음 보는 자격증을 게임처럼')}</span></footer>
</main></body></html>`;
}

function renderLayout(slide) {
  switch (slide.layout) {
    case 'hero':
      return `<section class="hero-copy">
        <p class="kicker">${escapeHtml(slide.kicker)}</p>
        <h1>${lines(slide.title)}</h1>
        <p class="lead">${escapeHtml(slide.subtitle)}</p>
      </section>
      <section class="orbit-timeline">
        <div class="orbit-line"></div>
        ${slide.steps.map((step, index) => `<div class="orbit-step step-${index + 1}"><span>${index + 1}</span><strong>${escapeHtml(step.title)}</strong><small>${escapeHtml(step.note)}</small></div>`).join('')}
      </section>`;
    case 'exam':
      return `<section class="section-head"><p class="kicker">${escapeHtml(slide.kicker)}</p><h1>${lines(slide.title)}</h1></section>
      <section class="exam-grid">
        <div class="donut"><div><strong>80%</strong><span>2과목</span></div></div>
        <div class="subject-stack">
          ${slide.subjects.map((item) => `<article class="subject-card ${escapeHtml(item.tone)}"><div><small>${escapeHtml(item.label)}</small><strong>${escapeHtml(item.score)}</strong></div><p>${escapeHtml(item.note)}</p></article>`).join('')}
        </div>
      </section>
      <div class="fact-row">${slide.facts.map((fact) => `<div><strong>${escapeHtml(fact.value)}</strong><span>${escapeHtml(fact.label)}</span></div>`).join('')}</div>`;
    case 'loop':
      return `<section class="section-head"><p class="kicker">${escapeHtml(slide.kicker)}</p><h1>${lines(slide.title)}</h1><p class="lead">${escapeHtml(slide.subtitle)}</p></section>
      <section class="flow-row">
        ${slide.steps.map((step, index) => `${index ? '<div class="flow-arrow">→</div>' : ''}<article class="flow-card ${escapeHtml(step.tone)}"><div class="flow-icon">${icon(step.icon)}</div><small>${escapeHtml(step.label)}</small><strong>${escapeHtml(step.title)}</strong><p>${escapeHtml(step.note)}</p></article>`).join('')}
      </section>
      <div class="return-loop"><span>↺</span><strong>${escapeHtml(slide.returnTitle)}</strong><p>${escapeHtml(slide.returnNote)}</p></div>`;
    case 'week':
      return `<section class="week-head"><div class="week-badge">WEEK ${escapeHtml(slide.week)}</div><div><p class="kicker">${escapeHtml(slide.kicker)}</p><h1>${lines(slide.title)}</h1><p class="lead">${escapeHtml(slide.subtitle)}</p></div></section>
      <section class="calendar">${slide.days.map((day) => `<article class="day ${escapeHtml(day.tone)}"><small>${escapeHtml(day.label)}</small><strong>${escapeHtml(day.title)}</strong><span>${escapeHtml(day.note)}</span></article>`).join('')}</section>
      <div class="goal"><span>이번 주 완료선</span><strong>${escapeHtml(slide.goal)}</strong></div>`;
    case 'double-week':
      return `<section class="section-head compact"><p class="kicker">${escapeHtml(slide.kicker)}</p><h1>${lines(slide.title)}</h1><p class="lead">${escapeHtml(slide.subtitle)}</p></section>
      <section class="double-grid">${slide.weeks.map((week) => `<article class="week-card"><div class="week-label">WEEK ${escapeHtml(week.week)}</div><h2>${escapeHtml(week.title)}</h2><p>${escapeHtml(week.note)}</p><div class="week-progress"><span style="width:${escapeHtml(week.progress)}"></span></div><strong>${escapeHtml(week.result)}</strong></article>`).join('')}</section>
      <div class="weight-banner"><span>공부 시간도 문항 비중대로</span><strong>2과목에 2주</strong><b>80점</b></div>`;
    case 'review':
      return `<section class="section-head compact"><p class="kicker">${escapeHtml(slide.kicker)}</p><h1>${lines(slide.title)}</h1><p class="lead">${escapeHtml(slide.subtitle)}</p></section>
      <section class="review-grid">${slide.passes.map((pass) => `<article class="pass-card ${escapeHtml(pass.tone)}"><div class="pass-number">${escapeHtml(pass.number)}</div><small>${escapeHtml(pass.label)}</small><h2>${escapeHtml(pass.title)}</h2><ul>${pass.items.map((item) => `<li><span>${escapeHtml(item.mark)}</span>${escapeHtml(item.text)}</li>`).join('')}</ul></article>`).join('')}</section>
      <div class="review-result"><span>완료선</span><strong>${escapeHtml(slide.result)}</strong></div>`;
    case 'checklist':
      return `<section class="section-head"><p class="kicker">${escapeHtml(slide.kicker)}</p><h1>${lines(slide.title)}</h1><p class="lead">${escapeHtml(slide.subtitle)}</p></section>
      <section class="check-list">${slide.items.map((item, index) => `<article><span>${index + 1}</span><div><small>${escapeHtml(item.label)}</small><strong>${escapeHtml(item.text)}</strong></div><b>✓</b></article>`).join('')}</section>
      <div class="cta-box"><div><small>${escapeHtml(slide.ctaEyebrow)}</small><strong>${escapeHtml(slide.cta)}</strong></div><span>PLAY →</span></div>`;
    default:
      throw new Error(`Unsupported layout: ${slide.layout}`);
  }
}

function lines(value) {
  return value.map((line) => `<span>${escapeHtml(line)}</span>`).join('');
}

function icon(name) {
  if (name === 'video') return '<span class="play-icon">▶</span>';
  if (name === 'game') return '<span class="q-icon">Q</span>';
  return '<span class="book-icon">▤</span>';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function styles() {
  return `
  *{box-sizing:border-box}html,body{margin:0;width:1080px;height:1080px;overflow:hidden}body{font-family:"Malgun Gothic","Noto Sans KR",sans-serif;background:#020725}.slide{position:relative;width:1080px;height:1080px;overflow:hidden;padding:126px 72px 88px;color:#f7fbff;background:radial-gradient(circle at 90% 10%,rgba(192,132,252,.25),transparent 32%),radial-gradient(circle at 5% 84%,rgba(103,232,249,.16),transparent 34%),linear-gradient(145deg,#030826,#091638 55%,#160e42)}
  .grid{position:absolute;inset:0;opacity:.16;background-image:linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px);background-size:72px 72px;mask-image:linear-gradient(to bottom,transparent,black 18%,black 78%,transparent)}.glow{position:absolute;border-radius:999px;filter:blur(80px);opacity:.3}.glow-a{width:340px;height:340px;background:#7c3aed;right:-160px;top:160px}.glow-b{width:300px;height:300px;background:#06b6d4;left:-170px;bottom:70px}
  .brandbar{position:absolute;z-index:3;left:72px;right:72px;top:48px;display:flex;align-items:center;gap:24px}.brand{display:flex;align-items:center;gap:12px;font-size:26px;font-weight:900;letter-spacing:-1px}.brand-mark{display:grid;place-items:center;width:44px;height:44px;border-radius:15px;background:#6fff00;color:#071126;font-size:26px;box-shadow:0 0 28px rgba(111,255,0,.3)}.brand-accent{color:#6fff00}.series{font-size:15px;font-weight:800;letter-spacing:3px;color:#91a8cf}.page-number{margin-left:auto;font-size:15px;font-weight:800;color:#91a8cf;letter-spacing:2px}
  footer{position:absolute;z-index:4;left:72px;right:72px;bottom:36px;display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,.16);padding-top:18px;color:#8fa3c7;font-size:14px;font-weight:700;letter-spacing:.3px}
  .kicker{margin:0 0 16px;color:#6fff00;font-size:18px;font-weight:900;letter-spacing:2.5px}.section-head{position:relative;z-index:2}.section-head.compact h1{font-size:64px}.section-head h1,.hero-copy h1{margin:0;font-size:76px;line-height:1.08;letter-spacing:-4.2px;font-weight:950}.section-head h1 span,.hero-copy h1 span{display:block}.lead{max-width:850px;margin:20px 0 0;color:#b8c7e2;font-size:25px;line-height:1.5;font-weight:650;letter-spacing:-.8px}
  .hero-copy{position:relative;z-index:2;max-width:900px}.hero-copy h1{font-size:86px}.hero-copy h1 span:nth-child(2){color:#6fff00}.orbit-timeline{position:absolute;z-index:2;left:78px;right:78px;bottom:150px;height:260px}.orbit-line{position:absolute;left:70px;right:70px;top:86px;height:4px;background:linear-gradient(90deg,#67e8f9,#c084fc,#fd802e,#6fff00);box-shadow:0 0 22px rgba(103,232,249,.5)}.orbit-step{position:absolute;top:34px;width:184px;text-align:center}.orbit-step span{display:grid;place-items:center;margin:0 auto 18px;width:104px;height:104px;border:3px solid rgba(255,255,255,.5);border-radius:50%;background:#091638;box-shadow:0 14px 40px rgba(0,0,0,.35);font-size:42px;font-weight:950}.orbit-step strong{display:block;font-size:22px}.orbit-step small{display:block;margin-top:7px;color:#aabbd7;font-size:15px}.step-1{left:0}.step-2{left:250px}.step-3{left:500px}.step-4{right:0}.step-1 span{border-color:#67e8f9}.step-2 span,.step-3 span{border-color:#c084fc}.step-4 span{border-color:#6fff00;color:#6fff00}
  .exam-grid{position:relative;z-index:2;display:grid;grid-template-columns:430px 1fr;gap:55px;align-items:center;margin-top:56px}.donut{display:grid;place-items:center;width:410px;height:410px;border-radius:50%;background:conic-gradient(#c084fc 0 80%,#67e8f9 80% 100%);box-shadow:0 30px 70px rgba(0,0,0,.35)}.donut:before{content:"";position:absolute;width:270px;height:270px;border-radius:50%;background:#081331}.donut div{position:relative;z-index:2;text-align:center}.donut strong{display:block;font-size:90px;letter-spacing:-5px}.donut span{display:block;color:#c8d5ea;font-size:25px;font-weight:800}.subject-stack{display:flex;flex-direction:column;gap:20px}.subject-card{padding:28px 30px;border-radius:28px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18)}.subject-card>div{display:flex;align-items:end;justify-content:space-between}.subject-card small{font-size:21px;font-weight:850}.subject-card strong{font-size:42px}.subject-card p{margin:15px 0 0;color:#bdc9de;font-size:19px;line-height:1.5}.subject-card.cyan{border-color:rgba(103,232,249,.6)}.subject-card.cyan strong{color:#67e8f9}.subject-card.purple{border-color:rgba(192,132,252,.7)}.subject-card.purple strong{color:#c084fc}.fact-row{position:absolute;z-index:2;left:72px;right:72px;bottom:112px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.fact-row div{text-align:center;padding:18px;border-radius:18px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12)}.fact-row strong{display:block;font-size:28px}.fact-row span{display:block;margin-top:4px;color:#9fb0cc;font-size:15px}
  .flow-row{position:relative;z-index:2;display:grid;grid-template-columns:1fr 42px 1fr 42px 1fr;align-items:center;margin-top:58px}.flow-card{height:300px;padding:28px 24px;border-radius:30px;text-align:center;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18)}.flow-card .flow-icon{display:grid;place-items:center;width:88px;height:88px;margin:0 auto 18px;border-radius:28px;background:rgba(255,255,255,.1)}.play-icon{display:grid;place-items:center;width:58px;height:42px;border-radius:13px;background:#ff3347;color:#fff;font-size:22px;padding-left:4px}.q-icon{display:grid;place-items:center;width:58px;height:58px;border-radius:50%;background:#6fff00;color:#071126;font-size:34px;font-weight:950}.book-icon{font-size:58px;color:#ffd45b}.flow-card small{display:block;color:#8fa3c7;font-size:14px;font-weight:850;letter-spacing:1px}.flow-card strong{display:block;margin-top:7px;font-size:26px}.flow-card p{margin:14px 0 0;color:#b9c6db;font-size:18px;line-height:1.45}.flow-card.cyan{border-color:rgba(103,232,249,.5)}.flow-card.neon{border-color:rgba(111,255,0,.55)}.flow-card.yellow{border-color:rgba(255,212,91,.55)}.flow-arrow{font-size:40px;text-align:center;color:#6fff00}.return-loop{position:absolute;z-index:2;left:200px;right:200px;bottom:122px;display:grid;grid-template-columns:70px auto;column-gap:20px;padding:20px 28px;border-radius:24px;background:linear-gradient(90deg,rgba(111,255,0,.16),rgba(103,232,249,.1));border:1px solid rgba(111,255,0,.45)}.return-loop span{grid-row:1/3;align-self:center;font-size:52px;color:#6fff00}.return-loop strong{font-size:22px}.return-loop p{margin:4px 0 0;color:#afbdd4;font-size:16px}
  .week-head{position:relative;z-index:2;display:grid;grid-template-columns:240px 1fr;gap:36px;align-items:center}.week-badge{display:grid;place-items:center;width:220px;height:220px;border-radius:50%;border:4px solid #67e8f9;background:rgba(103,232,249,.12);box-shadow:0 0 50px rgba(103,232,249,.18);font-size:32px;font-weight:950;color:#67e8f9}.week-head h1{margin:0;font-size:62px;line-height:1.08;letter-spacing:-3px}.week-head h1 span{display:block}.calendar{position:relative;z-index:2;display:grid;grid-template-columns:repeat(7,1fr);gap:10px;margin-top:58px}.day{height:260px;padding:20px 12px;border-radius:24px;text-align:center;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14)}.day small{display:block;color:#91a3bf;font-size:14px;font-weight:850}.day strong{display:block;margin-top:38px;font-size:20px;line-height:1.4;word-break:keep-all}.day span{display:block;margin-top:16px;color:#aebbd1;font-size:14px;line-height:1.4}.day.study{border-color:rgba(103,232,249,.55)}.day.study strong{color:#67e8f9}.day.practice{border-color:rgba(192,132,252,.6);background:rgba(192,132,252,.12)}.day.practice strong{color:#d8b4fe}.goal{position:absolute;z-index:2;left:72px;right:72px;bottom:118px;display:flex;justify-content:space-between;align-items:center;padding:20px 28px;border-radius:22px;background:#6fff00;color:#071126}.goal span{font-size:17px;font-weight:850}.goal strong{font-size:25px;font-weight:950}
  .double-grid{position:relative;z-index:2;display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:42px}.week-card{height:340px;padding:34px;border-radius:30px;background:rgba(255,255,255,.08);border:1px solid rgba(192,132,252,.48)}.week-label{color:#c084fc;font-size:17px;font-weight:900;letter-spacing:2px}.week-card h2{margin:16px 0 12px;font-size:35px;letter-spacing:-1.5px}.week-card p{height:78px;margin:0;color:#bac7dc;font-size:19px;line-height:1.5}.week-progress{height:12px;margin:28px 0 20px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden}.week-progress span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#c084fc,#67e8f9)}.week-card>strong{font-size:20px;color:#6fff00}.weight-banner{position:absolute;z-index:2;left:72px;right:72px;bottom:118px;display:grid;grid-template-columns:1fr auto auto;gap:22px;align-items:center;padding:23px 30px;border-radius:24px;background:linear-gradient(90deg,rgba(192,132,252,.22),rgba(103,232,249,.12));border:1px solid rgba(192,132,252,.5)}.weight-banner span{color:#b8c5dc;font-size:17px}.weight-banner strong{font-size:26px}.weight-banner b{display:grid;place-items:center;width:84px;height:46px;border-radius:15px;background:#c084fc;color:#12072a;font-size:20px}
  .review-grid{position:relative;z-index:2;display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:40px}.pass-card{position:relative;height:430px;padding:34px;border-radius:30px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18)}.pass-number{position:absolute;right:26px;top:24px;font-size:72px;font-weight:950;color:rgba(255,255,255,.08)}.pass-card small{color:#90a2be;font-size:15px;font-weight:850;letter-spacing:2px}.pass-card h2{margin:14px 0 28px;font-size:34px}.pass-card ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:18px}.pass-card li{display:flex;align-items:center;gap:14px;color:#c0cbe0;font-size:18px;line-height:1.4}.pass-card li span{display:grid;place-items:center;flex:0 0 auto;width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,.08);font-weight:950}.pass-card.first{border-color:rgba(103,232,249,.55)}.pass-card.second{border-color:rgba(111,255,0,.55)}.pass-card.second h2,.pass-card.second li span{color:#6fff00}.review-result{position:absolute;z-index:2;left:72px;right:72px;bottom:112px;display:flex;justify-content:space-between;align-items:center;padding:21px 28px;border-radius:23px;background:#6fff00;color:#071126}.review-result span{font-size:17px;font-weight:850}.review-result strong{font-size:25px}
  .check-list{position:relative;z-index:2;display:flex;flex-direction:column;gap:16px;margin-top:48px}.check-list article{display:grid;grid-template-columns:64px 1fr 54px;align-items:center;gap:18px;padding:22px 24px;border-radius:24px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16)}.check-list article>span{display:grid;place-items:center;width:54px;height:54px;border-radius:18px;background:#c084fc;color:#160d34;font-size:23px;font-weight:950}.check-list small{display:block;color:#8fa2be;font-size:14px;font-weight:850;letter-spacing:1px}.check-list strong{display:block;margin-top:5px;font-size:22px}.check-list b{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:rgba(111,255,0,.16);color:#6fff00;font-size:25px}.cta-box{position:absolute;z-index:2;left:72px;right:72px;bottom:108px;display:flex;justify-content:space-between;align-items:center;padding:24px 28px;border-radius:24px;background:linear-gradient(90deg,#fd802e,#ffb020);color:#071126;box-shadow:0 18px 55px rgba(253,128,46,.25)}.cta-box small{display:block;font-size:13px;font-weight:850;letter-spacing:1.5px}.cta-box strong{display:block;margin-top:5px;font-size:27px}.cta-box>span{font-size:24px;font-weight:950}
  `;
}

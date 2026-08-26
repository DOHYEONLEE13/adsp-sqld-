import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
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

try {
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
} catch (error) {
  if (!String(error).includes('EPERM') && !process.env.INSTAGRAM_SVG_RENDERER) throw error;
  await generateWithSvgRenderer(slides, assetDir);
}
console.log(`instagram carousel generated: ${slides.length} slides → ${assetDir}`);

async function generateWithSvgRenderer(items, outputDir) {
  const runtimeModules = process.env.CODEX_RUNTIME_NODE_MODULES;
  const sharpEntry = runtimeModules
    ? pathToFileURL(path.join(runtimeModules, 'sharp', 'dist', 'index.mjs')).href
    : 'sharp';
  const { default: sharp } = await import(sharpEntry);
  for (const [index, slide] of items.entries()) {
    const svg = renderSvg(slide, index, items.length);
    await sharp(Buffer.from(svg)).png().toFile(
      path.join(outputDir, `instagram-${String(index + 1).padStart(2, '0')}.png`),
    );
  }
}

function renderSvg(slide, index, total) {
  const body = renderSvgLayout(slide);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#030826"/><stop offset=".56" stop-color="#091638"/><stop offset="1" stop-color="#160e42"/></linearGradient>
    <radialGradient id="purpleGlow"><stop stop-color="#7c3aed" stop-opacity=".42"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient>
    <radialGradient id="cyanGlow"><stop stop-color="#06b6d4" stop-opacity=".28"/><stop offset="1" stop-color="#06b6d4" stop-opacity="0"/></radialGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000" flood-opacity=".3"/></filter>
    <pattern id="grid" width="72" height="72" patternUnits="userSpaceOnUse"><path d="M72 0H0V72" fill="none" stroke="#fff" stroke-opacity=".045"/></pattern>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg)"/><circle cx="960" cy="150" r="360" fill="url(#purpleGlow)"/><circle cx="40" cy="900" r="330" fill="url(#cyanGlow)"/><rect width="1080" height="1080" fill="url(#grid)"/>
  <g font-family="Malgun Gothic, Noto Sans KR, sans-serif" fill="#f7fbff">
    <g transform="translate(72 48)"><rect width="44" height="44" rx="15" fill="#6fff00"/><text x="22" y="32" text-anchor="middle" font-size="26" font-weight="900" fill="#071126">Q</text><text x="58" y="31" font-size="26" font-weight="900">Quest<tspan fill="#6fff00">DP</tspan></text><text x="255" y="28" font-size="15" font-weight="800" letter-spacing="3" fill="#91a8cf">${escapeHtml(slide.series ?? 'SEO STUDY GUIDE')}</text></g>
    <text x="1008" y="78" text-anchor="end" font-size="15" font-weight="800" letter-spacing="2" fill="#91a8cf">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</text>
    ${body}
    <line x1="72" y1="1008" x2="1008" y2="1008" stroke="#fff" stroke-opacity=".16"/><text x="72" y="1044" font-size="14" font-weight="700" fill="#8fa3c7">quest-dp.com</text><text x="1008" y="1044" text-anchor="end" font-size="14" font-weight="700" fill="#8fa3c7">${escapeHtml(slide.footer ?? '처음 보는 자격증을 게임처럼')}</text>
  </g></svg>`;
}

function renderSvgLayout(slide) {
  const title = svgTitle(slide.title, 72, 210, slide.layout === 'ratio-hero' ? 78 : 64);
  const kicker = `<text x="72" y="142" font-size="18" font-weight="900" letter-spacing="2.5" fill="#6fff00">${escapeHtml(slide.kicker)}</text>`;
  const subtitleY = 210 + slide.title.length * (slide.layout === 'ratio-hero' ? 84 : 70) + 12;
  const subtitle = slide.subtitle ? `<text x="72" y="${subtitleY}" font-size="24" font-weight="650" fill="#b8c7e2">${escapeHtml(slide.subtitle)}</text>` : '';

  if (slide.layout === 'ratio-hero') {
    const cards = slide.ratios.map((item, i) => {
      const x = 72 + i * 318;
      const y = i === 1 ? 566 : 584;
      const stroke = ['#67e8f9', '#c084fc', '#6fff00'][i];
      return `<g transform="translate(${x} ${y})" filter="url(#shadow)"><rect width="286" height="276" rx="32" fill="#ffffff" fill-opacity=".075" stroke="${stroke}" stroke-opacity=".7"/><text x="143" y="103" text-anchor="middle" font-size="72" font-weight="950" fill="${stroke}">${escapeHtml(item.value)}</text><text x="143" y="151" text-anchor="middle" font-size="24" font-weight="900">${escapeHtml(item.label)}</text><text x="143" y="190" text-anchor="middle" font-size="16" font-weight="700" fill="#9eafca">${escapeHtml(item.note)}</text></g>`;
    }).join('');
    return `${kicker}${title}${subtitle}${cards}<text x="374" y="734" text-anchor="middle" font-size="48" fill="#7487aa">:</text><text x="692" y="734" text-anchor="middle" font-size="48" fill="#7487aa">:</text>`;
  }

  if (slide.layout === 'weight') {
    const widths = [210, 210, 460];
    let cursor = 72;
    const cards = slide.subjects.map((item, i) => {
      const x = cursor;
      const width = widths[i];
      cursor += width + 18;
      const color = ['#67e8f9', '#c084fc', '#6fff00'][i];
      return `<g transform="translate(${x} 435)"><rect width="${width}" height="390" rx="30" fill="#fff" fill-opacity=".075" stroke="${color}" stroke-opacity=".68"/><rect x="24" y="24" width="${i === 2 ? 150 : 112}" height="112" rx="32" fill="#fff" fill-opacity=".08"/><text x="${i === 2 ? 99 : 80}" y="102" text-anchor="middle" font-size="54" font-weight="950" fill="${color}">${escapeHtml(item.number)}</text><text x="26" y="184" font-size="14" font-weight="850" letter-spacing="1.5" fill="#8fa3c2">${escapeHtml(item.label)}</text><text x="26" y="226" font-size="${i === 2 ? 31 : 24}" font-weight="900">${escapeHtml(item.title)}</text>${svgWrappedText(item.note, 26, 272, width - 52, 17, 27, '#b5c2d8')}</g>`;
    }).join('');
    const facts = slide.facts.map((fact, i) => `<g transform="translate(${72 + i * 318} 852)"><rect width="300" height="94" rx="20" fill="#fff" fill-opacity=".07" stroke="#fff" stroke-opacity=".12"/><text x="150" y="40" text-anchor="middle" font-size="26" font-weight="900">${escapeHtml(fact.value)}</text><text x="150" y="68" text-anchor="middle" font-size="14" fill="#9fb0cc">${escapeHtml(fact.label)}</text></g>`).join('');
    return `${kicker}${title}${subtitle}${cards}${facts}`;
  }

  if (slide.layout === 'week') {
    const days = slide.days.map((day, i) => {
      const x = 72 + i * 133;
      const color = day.tone === 'practice' ? '#c084fc' : '#67e8f9';
      return `<g transform="translate(${x} 493)"><rect width="123" height="264" rx="24" fill="#fff" fill-opacity=".07" stroke="${color}" stroke-opacity=".55"/><text x="61.5" y="40" text-anchor="middle" font-size="14" font-weight="850" fill="#91a3bf">${escapeHtml(day.label)}</text><text x="61.5" y="120" text-anchor="middle" font-size="20" font-weight="900" fill="${color}">${escapeHtml(day.title)}</text><text x="61.5" y="157" text-anchor="middle" font-size="14" fill="#aebbd1">${escapeHtml(day.note)}</text></g>`;
    }).join('');
    return `<circle cx="180" cy="290" r="108" fill="#67e8f9" fill-opacity=".1" stroke="#67e8f9" stroke-width="4"/><text x="180" y="303" text-anchor="middle" font-size="31" font-weight="950" fill="#67e8f9">WEEK ${escapeHtml(slide.week)}</text><g transform="translate(330 0)">${kicker.replaceAll('x="72"', 'x="0"')}${svgTitle(slide.title, 0, 210, 58)}${subtitle.replaceAll('x="72"', 'x="0"')}</g>${days}<rect x="72" y="790" width="936" height="82" rx="22" fill="#6fff00"/><text x="102" y="842" font-size="17" font-weight="850" fill="#071126">이번 주 완료선</text><text x="978" y="842" text-anchor="end" font-size="22" font-weight="950" fill="#071126">${escapeHtml(slide.goal)}</text>`;
  }

  if (slide.layout === 'double-week') {
    const cards = slide.weeks.map((week, i) => `<g transform="translate(${72 + i * 480} 430)"><rect width="456" height="340" rx="30" fill="#fff" fill-opacity=".08" stroke="#c084fc" stroke-opacity=".52"/><text x="34" y="54" font-size="17" font-weight="900" letter-spacing="2" fill="#c084fc">WEEK ${escapeHtml(week.week)}</text><text x="34" y="105" font-size="34" font-weight="900">${escapeHtml(week.title)}</text>${svgWrappedText(week.note, 34, 150, 388, 18, 30, '#bac7dc')}<rect x="34" y="245" width="388" height="12" rx="6" fill="#fff" fill-opacity=".1"/><rect x="34" y="245" width="${Math.round(388 * Number.parseInt(week.progress) / 100)}" height="12" rx="6" fill="#c084fc"/><text x="34" y="300" font-size="19" font-weight="900" fill="#6fff00">${escapeHtml(week.result)}</text></g>`).join('');
    return `${kicker}${title}${subtitle}${cards}<g transform="translate(72 806)"><rect width="936" height="88" rx="24" fill="#c084fc" fill-opacity=".18" stroke="#c084fc" stroke-opacity=".55"/><text x="28" y="52" font-size="17" fill="#b8c5dc">${escapeHtml(slide.bannerLabel)}</text><text x="672" y="54" text-anchor="end" font-size="26" font-weight="900">${escapeHtml(slide.bannerMain)}</text><rect x="812" y="20" width="96" height="50" rx="15" fill="#c084fc"/><text x="860" y="53" text-anchor="middle" font-size="20" font-weight="950" fill="#12072a">${escapeHtml(slide.bannerBadge)}</text></g>`;
  }

  if (slide.layout === 'time-loop') {
    const cards = slide.steps.map((step, i) => {
      const x = 72 + (i % 2) * 480;
      const y = 410 + Math.floor(i / 2) * 205;
      const color = ['#67e8f9', '#c084fc', '#67e8f9', '#6fff00'][i];
      return `<g transform="translate(${x} ${y})"><rect width="456" height="186" rx="28" fill="#fff" fill-opacity=".075" stroke="${color}" stroke-opacity=".55"/><text x="28" y="99" font-size="60" font-weight="950" fill="${color}">${escapeHtml(step.minutes)}</text><text x="105" y="98" font-size="16" font-weight="800" fill="#a7b7d0">분</text><text x="148" y="48" font-size="13" font-weight="900" letter-spacing="1.4" fill="#8ea0bd">${escapeHtml(step.when)}</text><text x="148" y="86" font-size="24" font-weight="900">${escapeHtml(step.title)}</text><text x="148" y="122" font-size="15" fill="#adbbd1">${escapeHtml(step.note)}</text></g>`;
    }).join('');
    return `${kicker}${title}${subtitle}${cards}<g transform="translate(72 840)"><rect width="936" height="88" rx="23" fill="#6fff00" fill-opacity=".12" stroke="#6fff00" stroke-opacity=".45"/><text x="28" y="39" font-size="16" fill="#b6c3d8">${escapeHtml(slide.totalLabel)}</text><text x="908" y="42" text-anchor="end" font-size="28" font-weight="950" fill="#6fff00">${escapeHtml(slide.total)}</text><text x="28" y="67" font-size="13" fill="#8195b4">${escapeHtml(slide.totalNote)}</text></g>`;
  }

  if (slide.layout === 'mistakes') {
    const cards = slide.items.map((item, i) => {
      const color = ['#67e8f9', '#c084fc', '#6fff00'][i];
      return `<g transform="translate(${72 + i * 318} 430)"><rect width="300" height="400" rx="30" fill="#fff" fill-opacity=".075" stroke="${color}" stroke-opacity=".58"/><rect x="26" y="28" width="88" height="88" rx="28" fill="#fff" fill-opacity=".08"/><text x="70" y="88" text-anchor="middle" font-size="38" font-weight="950" fill="${color}">${escapeHtml(item.mark)}</text><text x="28" y="160" font-size="14" font-weight="900" letter-spacing="1.3" fill="#8d9fbb">${escapeHtml(item.label)}</text><text x="28" y="209" font-size="31" font-weight="900">${escapeHtml(item.title)}</text>${svgWrappedText(item.action, 28, 258, 244, 17, 29, '#b5c2d7')}</g>`;
    }).join('');
    return `${kicker}${title}${subtitle}${cards}<g transform="translate(72 858)"><rect width="936" height="76" rx="22" fill="#fff" fill-opacity=".08" stroke="#fff" stroke-opacity=".17"/><text x="28" y="46" font-size="16" fill="#99aac5">오답노트에는 정답 번호 대신</text><text x="908" y="48" text-anchor="end" font-size="23" font-weight="900" fill="#6fff00">${escapeHtml(slide.note)}</text></g>`;
  }

  if (slide.layout === 'checklist') {
    const rows = slide.items.map((item, i) => `<g transform="translate(72 ${430 + i * 126})"><rect width="936" height="104" rx="24" fill="#fff" fill-opacity=".08" stroke="#fff" stroke-opacity=".16"/><rect x="20" y="20" width="64" height="64" rx="19" fill="#c084fc"/><text x="52" y="62" text-anchor="middle" font-size="24" font-weight="950" fill="#160d34">${i + 1}</text><text x="108" y="45" font-size="13" font-weight="850" letter-spacing="1" fill="#8fa2be">${escapeHtml(item.label)}</text><text x="108" y="75" font-size="22" font-weight="900">${escapeHtml(item.text)}</text><circle cx="886" cy="52" r="23" fill="#6fff00" fill-opacity=".16"/><text x="886" y="61" text-anchor="middle" font-size="25" font-weight="900" fill="#6fff00">✓</text></g>`).join('');
    return `${kicker}${title}${subtitle}${rows}<g transform="translate(72 836)"><rect width="936" height="104" rx="24" fill="#fd802e"/><text x="28" y="39" font-size="13" font-weight="850" letter-spacing="1.5" fill="#071126">${escapeHtml(slide.ctaEyebrow)}</text><text x="28" y="75" font-size="27" font-weight="950" fill="#071126">${escapeHtml(slide.cta)}</text><text x="908" y="66" text-anchor="end" font-size="23" font-weight="950" fill="#071126">PLAY →</text></g>`;
  }

  throw new Error(`Unsupported SVG layout: ${slide.layout}`);
}

function svgTitle(value, x, y, size) {
  return value.map((line, i) => `<text x="${x}" y="${y + i * (size + 6)}" font-size="${size}" font-weight="950" letter-spacing="-3" fill="${i === 1 ? '#6fff00' : '#f7fbff'}">${escapeHtml(line)}</text>`).join('');
}

function svgWrappedText(value, x, y, width, size, lineHeight, fill) {
  const maxChars = Math.max(7, Math.floor(width / (size * .92)));
  const words = String(value).split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else current = next;
  }
  if (current) lines.push(current);
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}">${lines.slice(0, 4).map((line, i) => `<tspan x="${x}" dy="${i ? lineHeight : 0}">${escapeHtml(line)}</tspan>`).join('')}</text>`;
}

function renderDocument(slide, index, total) {
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><style>${styles()}</style></head>
<body><main class="slide layout-${escapeHtml(slide.layout)}">
  <div class="grid"></div><div class="glow glow-a"></div><div class="glow glow-b"></div>
  <header class="brandbar">
    <div class="brand"><span class="brand-mark">Q</span><span>Quest<span class="brand-accent">DP</span></span></div>
    <div class="series">${escapeHtml(slide.series ?? 'SEO STUDY GUIDE')}</div>
    <div class="page-number">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
  </header>
  ${renderLayout(slide)}
  <footer><span>quest-dp.com</span><span>${escapeHtml(slide.footer ?? '처음 보는 자격증을 게임처럼')}</span></footer>
</main></body></html>`;
}

function renderLayout(slide) {
  switch (slide.layout) {
    case 'ratio-hero':
      return `<section class="hero-copy ratio-copy">
        <p class="kicker">${escapeHtml(slide.kicker)}</p>
        <h1>${lines(slide.title)}</h1>
        <p class="lead">${escapeHtml(slide.subtitle)}</p>
      </section>
      <section class="ratio-row">
        ${slide.ratios.map((item, index) => `<article class="ratio-card ratio-${index + 1}"><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span><small>${escapeHtml(item.note)}</small></article>${index < slide.ratios.length - 1 ? '<b>:</b>' : ''}`).join('')}
      </section>`;
    case 'weight':
      return `<section class="section-head compact"><p class="kicker">${escapeHtml(slide.kicker)}</p><h1>${lines(slide.title)}</h1><p class="lead">${escapeHtml(slide.subtitle)}</p></section>
      <section class="weight-grid">
        ${slide.subjects.map((item) => `<article class="weight-card ${escapeHtml(item.tone)}"><div class="weight-number">${escapeHtml(item.number)}</div><small>${escapeHtml(item.label)}</small><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.note)}</p></article>`).join('')}
      </section>
      <div class="fact-row">${slide.facts.map((fact) => `<div><strong>${escapeHtml(fact.value)}</strong><span>${escapeHtml(fact.label)}</span></div>`).join('')}</div>`;
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
      <div class="weight-banner"><span>${escapeHtml(slide.bannerLabel)}</span><strong>${escapeHtml(slide.bannerMain)}</strong><b>${escapeHtml(slide.bannerBadge)}</b></div>`;
    case 'time-loop':
      return `<section class="section-head compact"><p class="kicker">${escapeHtml(slide.kicker)}</p><h1>${lines(slide.title)}</h1><p class="lead">${escapeHtml(slide.subtitle)}</p></section>
      <section class="time-grid">${slide.steps.map((step, index) => `<article class="time-card time-${index + 1}"><div><strong>${escapeHtml(step.minutes)}</strong><span>분</span></div><small>${escapeHtml(step.when)}</small><h2>${escapeHtml(step.title)}</h2><p>${escapeHtml(step.note)}</p></article>`).join('')}</section>
      <div class="time-total"><span>${escapeHtml(slide.totalLabel)}</span><strong>${escapeHtml(slide.total)}</strong><small>${escapeHtml(slide.totalNote)}</small></div>`;
    case 'mistakes':
      return `<section class="section-head compact"><p class="kicker">${escapeHtml(slide.kicker)}</p><h1>${lines(slide.title)}</h1><p class="lead">${escapeHtml(slide.subtitle)}</p></section>
      <section class="mistake-grid">${slide.items.map((item, index) => `<article class="mistake-card mistake-${index + 1}"><div>${escapeHtml(item.mark)}</div><small>${escapeHtml(item.label)}</small><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.action)}</p></article>`).join('')}</section>
      <div class="mistake-note"><span>오답노트에는 정답 번호 대신</span><strong>${escapeHtml(slide.note)}</strong></div>`;
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
  .ratio-copy{max-width:940px}.ratio-copy h1{font-size:78px}.ratio-row{position:absolute;z-index:2;left:72px;right:72px;bottom:150px;display:grid;grid-template-columns:1fr 38px 1fr 38px 1fr;align-items:center}.ratio-row>b{text-align:center;color:#7487aa;font-size:58px}.ratio-card{height:250px;padding:30px 24px;border-radius:32px;text-align:center;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.18)}.ratio-card strong{display:block;font-size:72px;letter-spacing:-4px}.ratio-card span{display:block;margin-top:8px;font-size:24px;font-weight:900}.ratio-card small{display:block;margin-top:12px;color:#9eafca;font-size:16px}.ratio-1{border-color:rgba(103,232,249,.58)}.ratio-1 strong{color:#67e8f9}.ratio-2{border-color:rgba(192,132,252,.72);transform:translateY(-16px);box-shadow:0 24px 60px rgba(76,29,149,.24)}.ratio-2 strong{color:#d8b4fe}.ratio-3{border-color:rgba(111,255,0,.55)}.ratio-3 strong{color:#6fff00}
  .weight-grid{position:relative;z-index:2;display:grid;grid-template-columns:1fr 1fr 2.05fr;gap:18px;margin-top:48px}.weight-card{height:390px;padding:28px;border-radius:30px;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.18)}.weight-number{display:grid;place-items:center;width:112px;height:112px;border-radius:34px;background:rgba(255,255,255,.08);font-size:54px;font-weight:950}.weight-card small{display:block;margin-top:25px;color:#8fa3c2;font-size:14px;font-weight:850;letter-spacing:1.5px}.weight-card strong{display:block;margin-top:7px;font-size:27px}.weight-card p{margin:16px 0 0;color:#b5c2d8;font-size:17px;line-height:1.5}.weight-card.cyan{border-color:rgba(103,232,249,.55)}.weight-card.cyan .weight-number{color:#67e8f9}.weight-card.purple{border-color:rgba(192,132,252,.55)}.weight-card.purple .weight-number{color:#d8b4fe}.weight-card.neon{border-color:rgba(111,255,0,.58);background:linear-gradient(150deg,rgba(111,255,0,.12),rgba(192,132,252,.08))}.weight-card.neon .weight-number{width:150px;color:#6fff00}.weight-card.neon strong{font-size:33px}
  .exam-grid{position:relative;z-index:2;display:grid;grid-template-columns:430px 1fr;gap:55px;align-items:center;margin-top:56px}.donut{display:grid;place-items:center;width:410px;height:410px;border-radius:50%;background:conic-gradient(#c084fc 0 80%,#67e8f9 80% 100%);box-shadow:0 30px 70px rgba(0,0,0,.35)}.donut:before{content:"";position:absolute;width:270px;height:270px;border-radius:50%;background:#081331}.donut div{position:relative;z-index:2;text-align:center}.donut strong{display:block;font-size:90px;letter-spacing:-5px}.donut span{display:block;color:#c8d5ea;font-size:25px;font-weight:800}.subject-stack{display:flex;flex-direction:column;gap:20px}.subject-card{padding:28px 30px;border-radius:28px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18)}.subject-card>div{display:flex;align-items:end;justify-content:space-between}.subject-card small{font-size:21px;font-weight:850}.subject-card strong{font-size:42px}.subject-card p{margin:15px 0 0;color:#bdc9de;font-size:19px;line-height:1.5}.subject-card.cyan{border-color:rgba(103,232,249,.6)}.subject-card.cyan strong{color:#67e8f9}.subject-card.purple{border-color:rgba(192,132,252,.7)}.subject-card.purple strong{color:#c084fc}.fact-row{position:absolute;z-index:2;left:72px;right:72px;bottom:112px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.fact-row div{text-align:center;padding:18px;border-radius:18px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12)}.fact-row strong{display:block;font-size:28px}.fact-row span{display:block;margin-top:4px;color:#9fb0cc;font-size:15px}
  .flow-row{position:relative;z-index:2;display:grid;grid-template-columns:1fr 42px 1fr 42px 1fr;align-items:center;margin-top:58px}.flow-card{height:300px;padding:28px 24px;border-radius:30px;text-align:center;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18)}.flow-card .flow-icon{display:grid;place-items:center;width:88px;height:88px;margin:0 auto 18px;border-radius:28px;background:rgba(255,255,255,.1)}.play-icon{display:grid;place-items:center;width:58px;height:42px;border-radius:13px;background:#ff3347;color:#fff;font-size:22px;padding-left:4px}.q-icon{display:grid;place-items:center;width:58px;height:58px;border-radius:50%;background:#6fff00;color:#071126;font-size:34px;font-weight:950}.book-icon{font-size:58px;color:#ffd45b}.flow-card small{display:block;color:#8fa3c7;font-size:14px;font-weight:850;letter-spacing:1px}.flow-card strong{display:block;margin-top:7px;font-size:26px}.flow-card p{margin:14px 0 0;color:#b9c6db;font-size:18px;line-height:1.45}.flow-card.cyan{border-color:rgba(103,232,249,.5)}.flow-card.neon{border-color:rgba(111,255,0,.55)}.flow-card.yellow{border-color:rgba(255,212,91,.55)}.flow-arrow{font-size:40px;text-align:center;color:#6fff00}.return-loop{position:absolute;z-index:2;left:200px;right:200px;bottom:122px;display:grid;grid-template-columns:70px auto;column-gap:20px;padding:20px 28px;border-radius:24px;background:linear-gradient(90deg,rgba(111,255,0,.16),rgba(103,232,249,.1));border:1px solid rgba(111,255,0,.45)}.return-loop span{grid-row:1/3;align-self:center;font-size:52px;color:#6fff00}.return-loop strong{font-size:22px}.return-loop p{margin:4px 0 0;color:#afbdd4;font-size:16px}
  .week-head{position:relative;z-index:2;display:grid;grid-template-columns:240px 1fr;gap:36px;align-items:center}.week-badge{display:grid;place-items:center;width:220px;height:220px;border-radius:50%;border:4px solid #67e8f9;background:rgba(103,232,249,.12);box-shadow:0 0 50px rgba(103,232,249,.18);font-size:32px;font-weight:950;color:#67e8f9}.week-head h1{margin:0;font-size:62px;line-height:1.08;letter-spacing:-3px}.week-head h1 span{display:block}.calendar{position:relative;z-index:2;display:grid;grid-template-columns:repeat(7,1fr);gap:10px;margin-top:58px}.day{height:260px;padding:20px 12px;border-radius:24px;text-align:center;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14)}.day small{display:block;color:#91a3bf;font-size:14px;font-weight:850}.day strong{display:block;margin-top:38px;font-size:20px;line-height:1.4;word-break:keep-all}.day span{display:block;margin-top:16px;color:#aebbd1;font-size:14px;line-height:1.4}.day.study{border-color:rgba(103,232,249,.55)}.day.study strong{color:#67e8f9}.day.practice{border-color:rgba(192,132,252,.6);background:rgba(192,132,252,.12)}.day.practice strong{color:#d8b4fe}.goal{position:absolute;z-index:2;left:72px;right:72px;bottom:118px;display:flex;justify-content:space-between;align-items:center;padding:20px 28px;border-radius:22px;background:#6fff00;color:#071126}.goal span{font-size:17px;font-weight:850}.goal strong{font-size:25px;font-weight:950}
  .double-grid{position:relative;z-index:2;display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:42px}.week-card{height:340px;padding:34px;border-radius:30px;background:rgba(255,255,255,.08);border:1px solid rgba(192,132,252,.48)}.week-label{color:#c084fc;font-size:17px;font-weight:900;letter-spacing:2px}.week-card h2{margin:16px 0 12px;font-size:35px;letter-spacing:-1.5px}.week-card p{height:78px;margin:0;color:#bac7dc;font-size:19px;line-height:1.5}.week-progress{height:12px;margin:28px 0 20px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden}.week-progress span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#c084fc,#67e8f9)}.week-card>strong{font-size:20px;color:#6fff00}.weight-banner{position:absolute;z-index:2;left:72px;right:72px;bottom:118px;display:grid;grid-template-columns:1fr auto auto;gap:22px;align-items:center;padding:23px 30px;border-radius:24px;background:linear-gradient(90deg,rgba(192,132,252,.22),rgba(103,232,249,.12));border:1px solid rgba(192,132,252,.5)}.weight-banner span{color:#b8c5dc;font-size:17px}.weight-banner strong{font-size:26px}.weight-banner b{display:grid;place-items:center;width:84px;height:46px;border-radius:15px;background:#c084fc;color:#12072a;font-size:20px}
  .time-grid{position:relative;z-index:2;display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:38px}.time-card{display:grid;grid-template-columns:115px 1fr;grid-template-rows:auto auto 1fr;column-gap:22px;height:188px;padding:24px 28px;border-radius:28px;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.16)}.time-card>div{grid-row:1/4;align-self:center}.time-card>div strong{font-size:62px;letter-spacing:-4px}.time-card>div span{margin-left:4px;color:#a7b7d0;font-size:17px;font-weight:800}.time-card small{color:#8ea0bd;font-size:13px;font-weight:900;letter-spacing:1.4px}.time-card h2{margin:5px 0 0;font-size:25px}.time-card p{margin:9px 0 0;color:#adbbd1;font-size:15px;line-height:1.4}.time-1,.time-3{border-color:rgba(103,232,249,.48)}.time-1 strong,.time-3 strong{color:#67e8f9}.time-2{border-color:rgba(192,132,252,.55)}.time-2 strong{color:#d8b4fe}.time-4{border-color:rgba(111,255,0,.52)}.time-4 strong{color:#6fff00}.time-total{position:absolute;z-index:2;left:72px;right:72px;bottom:108px;display:grid;grid-template-columns:1fr auto;align-items:center;padding:19px 28px;border-radius:23px;background:linear-gradient(90deg,rgba(103,232,249,.14),rgba(111,255,0,.14));border:1px solid rgba(111,255,0,.4)}.time-total span{color:#b6c3d8;font-size:16px}.time-total strong{font-size:28px;color:#6fff00}.time-total small{grid-column:1/3;margin-top:4px;color:#8195b4;font-size:13px}
  .mistake-grid{position:relative;z-index:2;display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:46px}.mistake-card{height:410px;padding:30px 26px;border-radius:30px;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.16)}.mistake-card>div{display:grid;place-items:center;width:88px;height:88px;border-radius:28px;background:rgba(255,255,255,.08);font-size:39px;font-weight:950}.mistake-card small{display:block;margin-top:28px;color:#8d9fbb;font-size:14px;font-weight:900;letter-spacing:1.3px}.mistake-card h2{margin:9px 0 0;font-size:31px}.mistake-card p{margin:20px 0 0;color:#b5c2d7;font-size:17px;line-height:1.55}.mistake-1{border-color:rgba(103,232,249,.5)}.mistake-1>div{color:#67e8f9}.mistake-2{border-color:rgba(192,132,252,.56)}.mistake-2>div{color:#d8b4fe}.mistake-3{border-color:rgba(111,255,0,.52)}.mistake-3>div{color:#6fff00}.mistake-note{position:absolute;z-index:2;left:72px;right:72px;bottom:110px;display:flex;justify-content:space-between;align-items:center;padding:20px 28px;border-radius:22px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.17)}.mistake-note span{color:#99aac5;font-size:16px}.mistake-note strong{color:#6fff00;font-size:23px}
  .review-grid{position:relative;z-index:2;display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:40px}.pass-card{position:relative;height:430px;padding:34px;border-radius:30px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18)}.pass-number{position:absolute;right:26px;top:24px;font-size:72px;font-weight:950;color:rgba(255,255,255,.08)}.pass-card small{color:#90a2be;font-size:15px;font-weight:850;letter-spacing:2px}.pass-card h2{margin:14px 0 28px;font-size:34px}.pass-card ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:18px}.pass-card li{display:flex;align-items:center;gap:14px;color:#c0cbe0;font-size:18px;line-height:1.4}.pass-card li span{display:grid;place-items:center;flex:0 0 auto;width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,.08);font-weight:950}.pass-card.first{border-color:rgba(103,232,249,.55)}.pass-card.second{border-color:rgba(111,255,0,.55)}.pass-card.second h2,.pass-card.second li span{color:#6fff00}.review-result{position:absolute;z-index:2;left:72px;right:72px;bottom:112px;display:flex;justify-content:space-between;align-items:center;padding:21px 28px;border-radius:23px;background:#6fff00;color:#071126}.review-result span{font-size:17px;font-weight:850}.review-result strong{font-size:25px}
  .check-list{position:relative;z-index:2;display:flex;flex-direction:column;gap:16px;margin-top:48px}.check-list article{display:grid;grid-template-columns:64px 1fr 54px;align-items:center;gap:18px;padding:22px 24px;border-radius:24px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16)}.check-list article>span{display:grid;place-items:center;width:54px;height:54px;border-radius:18px;background:#c084fc;color:#160d34;font-size:23px;font-weight:950}.check-list small{display:block;color:#8fa2be;font-size:14px;font-weight:850;letter-spacing:1px}.check-list strong{display:block;margin-top:5px;font-size:22px}.check-list b{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:rgba(111,255,0,.16);color:#6fff00;font-size:25px}.cta-box{position:absolute;z-index:2;left:72px;right:72px;bottom:108px;display:flex;justify-content:space-between;align-items:center;padding:24px 28px;border-radius:24px;background:linear-gradient(90deg,#fd802e,#ffb020);color:#071126;box-shadow:0 18px 55px rgba(253,128,46,.25)}.cta-box small{display:block;font-size:13px;font-weight:850;letter-spacing:1.5px}.cta-box strong{display:block;margin-top:5px;font-size:27px}.cta-box>span{font-size:24px;font-weight:950}
  `;
}

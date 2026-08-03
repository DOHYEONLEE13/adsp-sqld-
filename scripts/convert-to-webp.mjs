/**
 * PNG/JPG → WebP 변환.
 *
 * 별도 네이티브 의존성(sharp 등) 없이, 이미 깔려 있는 Playwright 의 Chromium 을
 * 인코더로 쓴다. 캔버스에 그린 뒤 toDataURL('image/webp', quality) 로 뽑아낸다.
 *
 * 사용법:
 *   node scripts/convert-to-webp.mjs <입력> [출력] [품질 0~1]
 *
 * 예:
 *   node scripts/convert-to-webp.mjs public/hero/rocket.png
 *   node scripts/convert-to-webp.mjs public/hero/rocket.png public/hero/rocket.webp 0.9
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { extname } from 'node:path';

const [input, outputArg, qualityArg] = process.argv.slice(2);

if (!input) {
  console.error('입력 파일을 지정하세요. 예: node scripts/convert-to-webp.mjs public/hero/rocket.png');
  process.exit(1);
}

const output = outputArg ?? input.replace(/\.(png|jpe?g)$/i, '.webp');
const quality = qualityArg ? Number(qualityArg) : 0.9;

if (!(quality > 0 && quality <= 1)) {
  console.error(`품질은 0 초과 1 이하여야 합니다 (받은 값: ${qualityArg})`);
  process.exit(1);
}

const mime = extname(input).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
const sourceBytes = readFileSync(input);
const dataUri = `data:${mime};base64,${sourceBytes.toString('base64')}`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage();

  const encoded = await page.evaluate(
    async ({ uri, q }) => {
      const img = new Image();
      img.src = uri;
      await img.decode();

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      // 알파 채널 유지 — 배경 투명한 에셋이 검은 사각형이 되지 않도록.
      const ctx = canvas.getContext('2d', { alpha: true });
      ctx.drawImage(img, 0, 0);

      const url = canvas.toDataURL('image/webp', q);
      if (!url.startsWith('data:image/webp')) {
        throw new Error('이 브라우저가 WebP 인코딩을 지원하지 않습니다.');
      }
      return { base64: url.split(',')[1], w: canvas.width, h: canvas.height };
    },
    { uri: dataUri, q: quality },
  );

  writeFileSync(output, Buffer.from(encoded.base64, 'base64'));

  const before = statSync(input).size;
  const after = statSync(output).size;
  const kb = (n) => `${(n / 1024).toFixed(0)}KB`;

  console.log(`${input} → ${output}`);
  console.log(`  해상도 ${encoded.w}x${encoded.h} · 품질 ${quality}`);
  console.log(
    `  ${kb(before)} → ${kb(after)}  (${(100 - (after / before) * 100).toFixed(1)}% 감소)`,
  );
} finally {
  await browser.close();
}

/**
 * PNG/JPG → WebP 변환.
 *
 * 별도 네이티브 의존성(sharp 등) 없이, 이미 깔려 있는 Playwright 의 Chromium 을
 * 인코더로 쓴다. 캔버스에 그린 뒤 toDataURL('image/webp', quality) 로 뽑아낸다.
 *
 * 사용법:
 *   node scripts/convert-to-webp.mjs <입력> [출력] [품질 0~1] [최대 변 길이] [투명 여백 제거]
 *
 * 예:
 *   node scripts/convert-to-webp.mjs public/hero/rocket.png
 *   node scripts/convert-to-webp.mjs public/hero/rocket.png public/hero/rocket.webp 0.9
 *   node scripts/convert-to-webp.mjs public/mascot.png public/mascot-display.webp 0.88 768 true
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { extname } from 'node:path';

const [input, outputArg, qualityArg, maxEdgeArg, trimArg] = process.argv.slice(2);

if (!input) {
  console.error('입력 파일을 지정하세요. 예: node scripts/convert-to-webp.mjs public/hero/rocket.png');
  process.exit(1);
}

const output = outputArg ?? input.replace(/\.(png|jpe?g)$/i, '.webp');
const quality = qualityArg ? Number(qualityArg) : 0.9;
const maxEdge = maxEdgeArg ? Number(maxEdgeArg) : null;
const trimTransparent = trimArg === 'true';

if (!(quality > 0 && quality <= 1)) {
  console.error(`품질은 0 초과 1 이하여야 합니다 (받은 값: ${qualityArg})`);
  process.exit(1);
}

if (maxEdge !== null && (!Number.isInteger(maxEdge) || maxEdge <= 0)) {
  console.error(`최대 변 길이는 양의 정수여야 합니다 (받은 값: ${maxEdgeArg})`);
  process.exit(1);
}

const extension = extname(input).toLowerCase();
const mime =
  extension === '.png'
    ? 'image/png'
    : extension === '.webp'
      ? 'image/webp'
      : 'image/jpeg';
const sourceBytes = readFileSync(input);
const dataUri = `data:${mime};base64,${sourceBytes.toString('base64')}`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage();

  const encoded = await page.evaluate(
    async ({ uri, q, targetMaxEdge, shouldTrim }) => {
      const img = new Image();
      img.src = uri;
      await img.decode();

      const source = document.createElement('canvas');
      source.width = img.naturalWidth;
      source.height = img.naturalHeight;
      const sourceCtx = source.getContext('2d', { alpha: true });
      sourceCtx.drawImage(img, 0, 0);

      let cropX = 0;
      let cropY = 0;
      let cropWidth = source.width;
      let cropHeight = source.height;

      if (shouldTrim) {
        const { data } = sourceCtx.getImageData(0, 0, source.width, source.height);
        let minX = source.width;
        let minY = source.height;
        let maxX = -1;
        let maxY = -1;
        for (let y = 0; y < source.height; y += 1) {
          for (let x = 0; x < source.width; x += 1) {
            if (data[(y * source.width + x) * 4 + 3] <= 2) continue;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
        if (maxX >= minX && maxY >= minY) {
          const padding = Math.max(4, Math.round(Math.max(source.width, source.height) * 0.008));
          cropX = Math.max(0, minX - padding);
          cropY = Math.max(0, minY - padding);
          cropWidth = Math.min(source.width - cropX, maxX - cropX + 1 + padding);
          cropHeight = Math.min(source.height - cropY, maxY - cropY + 1 + padding);
        }
      }

      const scale = targetMaxEdge
        ? Math.min(1, targetMaxEdge / Math.max(cropWidth, cropHeight))
        : 1;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(cropWidth * scale));
      canvas.height = Math.max(1, Math.round(cropHeight * scale));
      // 알파 채널 유지 — 배경 투명한 에셋이 검은 사각형이 되지 않도록.
      const ctx = canvas.getContext('2d', { alpha: true });
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        source,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      const url = canvas.toDataURL('image/webp', q);
      if (!url.startsWith('data:image/webp')) {
        throw new Error('이 브라우저가 WebP 인코딩을 지원하지 않습니다.');
      }
      return { base64: url.split(',')[1], w: canvas.width, h: canvas.height };
    },
    {
      uri: dataUri,
      q: quality,
      targetMaxEdge: maxEdge,
      shouldTrim: trimTransparent,
    },
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

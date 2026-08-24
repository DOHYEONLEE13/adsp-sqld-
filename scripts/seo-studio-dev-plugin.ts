import { promises as fs } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import type { Plugin } from 'vite';

const API_PREFIX = '/__seo-studio';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const REVIEW_STATUSES = new Set(['PENDING', 'APPROVED', 'NEEDS_REVISION', 'HOLD']);
const PLATFORMS = new Set([
  'blog',
  'naver',
  'threads',
  'instagram',
  'velog',
  'tistory',
  'linkedin',
  'community',
]);

interface ReviewItem {
  status: string;
  feedback: string;
  updatedAt: string;
  publishedUrl?: string;
}

interface ReviewState {
  version: 1;
  date: string;
  updatedAt: string;
  items: Record<string, ReviewItem>;
}

interface ReviewRequest {
  date?: unknown;
  platform?: unknown;
  status?: unknown;
  feedback?: unknown;
}

interface PublishRequest {
  date?: unknown;
  platform?: unknown;
  keyword?: unknown;
  title?: unknown;
  url?: unknown;
}

export function seoStudioDevPlugin(rootDir = process.cwd()): Plugin {
  const seoOpsDir = path.resolve(rootDir, 'seo-ops');
  const dailyRoot = path.join(seoOpsDir, '04-daily-content');
  const publishedLog = path.join(seoOpsDir, '07-reports', 'published-log.csv');

  return {
    name: 'questdp-seo-studio-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const requestUrl = new URL(req.url ?? '/', 'http://localhost');
        if (!requestUrl.pathname.startsWith(API_PREFIX)) {
          next();
          return;
        }

        if (!isLoopback(req.socket.remoteAddress)) {
          sendJson(res, 403, { error: 'SEO Studio API is available from this computer only.' });
          return;
        }

        try {
          if (req.method === 'GET' && requestUrl.pathname === `${API_PREFIX}/packages`) {
            sendJson(res, 200, { packages: await readPackages(dailyRoot) });
            return;
          }

          if (req.method === 'GET' && requestUrl.pathname === `${API_PREFIX}/asset`) {
            const date = requireDate(requestUrl.searchParams.get('date'));
            const fileName = requireAssetFile(requestUrl.searchParams.get('file'));
            const asset = await fs.readFile(
              path.join(packageDirectory(dailyRoot, date), 'assets', fileName),
            );
            res.statusCode = 200;
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
            res.end(asset);
            return;
          }

          if (req.method === 'GET' && requestUrl.pathname === `${API_PREFIX}/management`) {
            sendJson(res, 200, {
              calendar: await readTextOrEmpty(
                path.join(seoOpsDir, '03-content-calendar', 'content-calendar.csv'),
              ),
              keywords: await readTextOrEmpty(
                path.join(seoOpsDir, '01-keywords', 'keyword-database.csv'),
              ),
              published: await readTextOrEmpty(publishedLog),
              backlinks: await readTextOrEmpty(
                path.join(seoOpsDir, '05-outreach', 'prospect-list.csv'),
              ),
            });
            return;
          }

          if (req.method === 'POST' && requestUrl.pathname === `${API_PREFIX}/review`) {
            const body = (await readJsonBody(req)) as ReviewRequest;
            const date = requireDate(body.date);
            const platform = requirePlatform(body.platform);
            const status = requireReviewStatus(body.status);
            const feedback = optionalString(body.feedback, 10_000);
            if (status === 'NEEDS_REVISION' && feedback.trim().length === 0) {
              throw new Error('수정 요청에는 피드백을 입력해야 합니다.');
            }
            const state = await updateReviewState(dailyRoot, date, platform, {
              status,
              feedback,
              updatedAt: new Date().toISOString(),
            });
            sendJson(res, 200, { review: state });
            return;
          }

          if (req.method === 'POST' && requestUrl.pathname === `${API_PREFIX}/publish`) {
            const body = (await readJsonBody(req)) as PublishRequest;
            const date = requireDate(body.date);
            const platform = requirePlatform(body.platform);
            if (platform === 'blog') {
              throw new Error('QuestDP Blog는 Git 검토·테스트·배포 흐름으로 처리합니다.');
            }
            const keyword = requireString(body.keyword, 'keyword', 300);
            const title = requireString(body.title, 'title', 500);
            const url = requirePublishedUrl(body.url);
            const currentReview = await readReviewState(packageDirectory(dailyRoot, date), date);
            if (currentReview.items[platform]?.status !== 'APPROVED') {
              throw new Error('APPROVED 상태의 원고만 게시 완료로 기록할 수 있습니다.');
            }
            const appended = await appendPublishedLog(publishedLog, {
              date,
              platform,
              keyword,
              title,
              url,
            });
            const state = await updateReviewState(dailyRoot, date, platform, {
              status: 'PUBLISHED',
              feedback: '',
              updatedAt: new Date().toISOString(),
              publishedUrl: url,
            });
            sendJson(res, 200, { review: state, appended });
            return;
          }

          sendJson(res, 404, { error: 'SEO Studio API route not found.' });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'SEO Studio request failed.';
          sendJson(res, 400, { error: message });
        }
      });
    },
  };
}

async function readPackages(dailyRoot: string) {
  let entries;
  try {
    entries = await fs.readdir(dailyRoot, { withFileTypes: true });
  } catch (error) {
    if (isMissingFile(error)) return [];
    throw error;
  }

  const dates = entries
    .filter((entry) => entry.isDirectory() && DATE_PATTERN.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => b.localeCompare(a));

  return Promise.all(
    dates.map(async (date) => {
      const packageDir = packageDirectory(dailyRoot, date);
      const files = await fs.readdir(packageDir, { withFileTypes: true });
      const markdownFiles = files
        .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
        .map((entry) => entry.name)
        .sort();
      const contentEntries = await Promise.all(
        markdownFiles.map(async (fileName) => [
          fileName,
          await fs.readFile(path.join(packageDir, fileName), 'utf8'),
        ] as const),
      );
      return {
        date,
        files: Object.fromEntries(contentEntries),
        review: await readReviewState(packageDir, date),
      };
    }),
  );
}

async function updateReviewState(
  dailyRoot: string,
  date: string,
  platform: string,
  item: ReviewItem,
): Promise<ReviewState> {
  const packageDir = packageDirectory(dailyRoot, date);
  await fs.access(packageDir);
  const current = await readReviewState(packageDir, date);
  const next: ReviewState = {
    version: 1,
    date,
    updatedAt: item.updatedAt,
    items: {
      ...current.items,
      [platform]: item,
    },
  };
  await fs.writeFile(
    path.join(packageDir, 'review-state.json'),
    `${JSON.stringify(next, null, 2)}\n`,
    'utf8',
  );
  await fs.writeFile(
    path.join(packageDir, 'review-feedback.md'),
    renderReviewFeedback(next),
    'utf8',
  );
  return next;
}

async function readReviewState(packageDir: string, date: string): Promise<ReviewState> {
  try {
    const parsed = JSON.parse(
      await fs.readFile(path.join(packageDir, 'review-state.json'), 'utf8'),
    ) as Partial<ReviewState>;
    return {
      version: 1,
      date,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
      items: parsed.items && typeof parsed.items === 'object' ? parsed.items : {},
    };
  } catch (error) {
    if (!isMissingFile(error) && !(error instanceof SyntaxError)) throw error;
    return { version: 1, date, updatedAt: '', items: {} };
  }
}

function renderReviewFeedback(state: ReviewState): string {
  const sections = Object.entries(state.items)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([platform, item]) => {
      const lines = [
        `## ${platform}`,
        '',
        `STATUS: ${item.status}`,
        `UPDATED AT: ${item.updatedAt}`,
      ];
      if (item.publishedUrl) lines.push(`PUBLISHED URL: ${item.publishedUrl}`);
      lines.push('', 'FEEDBACK:', '', item.feedback || '(없음)', '');
      return lines.join('\n');
    });
  return [
    '# SEO Studio Review Feedback',
    '',
    `TARGET DATE: ${state.date}`,
    `UPDATED AT: ${state.updatedAt}`,
    '',
    ...sections,
  ].join('\n');
}

async function appendPublishedLog(
  publishedLog: string,
  entry: { date: string; platform: string; keyword: string; title: string; url: string },
): Promise<boolean> {
  const header =
    'date,platform,keyword,title,url,status,indexed,impressions,clicks,ctr,position,engagement,notes';
  const current = await readTextOrEmpty(publishedLog);
  const lines = current.split(/\r?\n/).filter(Boolean);
  const duplicate = lines.slice(1).some((line) => {
    const cells = parseCsvLine(line);
    return cells[0] === entry.date && cells[1] === entry.platform && cells[4] === entry.url;
  });
  if (duplicate) return false;

  const row = [
    entry.date,
    entry.platform,
    entry.keyword,
    entry.title,
    entry.url,
    'PUBLISHED',
    'UNKNOWN',
    '',
    '',
    '',
    '',
    '',
    'Content Studio에서 기록',
  ].map(csvCell).join(',');
  const base = lines.length > 0 ? lines.join('\n') : header;
  await fs.mkdir(path.dirname(publishedLog), { recursive: true });
  await fs.writeFile(publishedLog, `${base}\n${row}\n`, 'utf8');
  return true;
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      cells.push(value);
      value = '';
    } else {
      value += char;
    }
  }
  cells.push(value);
  return cells;
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 256_000) throw new Error('요청 본문이 너무 큽니다.');
    chunks.push(buffer);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) throw new Error('요청 본문이 없습니다.');
  return JSON.parse(raw);
}

function packageDirectory(dailyRoot: string, date: string): string {
  if (!DATE_PATTERN.test(date)) throw new Error('날짜 형식은 YYYY-MM-DD여야 합니다.');
  const resolved = path.resolve(dailyRoot, date);
  if (path.dirname(resolved) !== path.resolve(dailyRoot)) {
    throw new Error('허용되지 않은 package 경로입니다.');
  }
  return resolved;
}

function requireDate(value: unknown): string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw new Error('유효한 target date가 필요합니다.');
  }
  return value;
}

function requireAssetFile(value: unknown): string {
  if (typeof value !== 'string' || !/^instagram-\d{2}\.png$/.test(value)) {
    throw new Error('유효한 Instagram asset 파일명이 필요합니다.');
  }
  return value;
}

function requirePlatform(value: unknown): string {
  if (typeof value !== 'string' || !PLATFORMS.has(value)) {
    throw new Error('유효한 platform이 필요합니다.');
  }
  return value;
}

function requireReviewStatus(value: unknown): string {
  if (typeof value !== 'string' || !REVIEW_STATUSES.has(value)) {
    throw new Error('유효한 review status가 필요합니다.');
  }
  return value;
}

function requireString(value: unknown, name: string, maxLength: number): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${name} 값이 필요합니다.`);
  }
  return value.trim().slice(0, maxLength);
}

function optionalString(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.slice(0, maxLength) : '';
}

function requirePublishedUrl(value: unknown): string {
  const raw = requireString(value, 'url', 2_000);
  const parsed = new URL(raw);
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('게시 URL은 http 또는 https여야 합니다.');
  }
  return parsed.toString();
}

async function readTextOrEmpty(file: string): Promise<string> {
  try {
    return await fs.readFile(file, 'utf8');
  } catch (error) {
    if (isMissingFile(error)) return '';
    throw error;
  }
}

function isMissingFile(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

function isLoopback(address: string | undefined): boolean {
  if (!address) return false;
  return address === '127.0.0.1' || address === '::1' || address.startsWith('::ffff:127.');
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.end(JSON.stringify(payload));
}

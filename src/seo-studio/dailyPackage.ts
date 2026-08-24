import type {
  ParsedDocument,
  PlatformDefinition,
  ReviewStatus,
  StudioPackage,
  StudioPlatformId,
} from './types';

export const PLATFORM_DEFINITIONS: PlatformDefinition[] = [
  { id: 'blog', label: 'QuestDP Blog', fileName: '01-questdp-blog.md', reviewable: true },
  { id: 'naver', label: 'Naver Blog', fileName: '02-naver-blog.md', reviewable: true },
  { id: 'threads', label: 'Threads', fileName: '03-threads.md', reviewable: true },
  { id: 'instagram', label: 'Instagram', fileName: '04-instagram.md', reviewable: true },
  { id: 'velog', label: 'Velog', fileName: '05-velog.md', reviewable: true },
  { id: 'tistory', label: 'Tistory', fileName: '06-tistory.md', reviewable: true },
  { id: 'linkedin', label: 'LinkedIn', fileName: '07-linkedin.md', reviewable: true },
  { id: 'community', label: 'Community', fileName: '08-community-opportunities.md', reviewable: true },
];

const FIELD_PATTERN = /^([A-Z][A-Z0-9 _/()?&-]{1,80}):(?:\s*(.*))?$/;

export function parseDailyDocument(raw = ''): ParsedDocument {
  const fields: Record<string, string> = {};
  let currentKey = '';
  let buffer: string[] = [];

  const flush = () => {
    if (!currentKey) return;
    fields[currentKey] = buffer.join('\n').trim();
  };

  for (const line of raw.replace(/\r\n/g, '\n').split('\n')) {
    const match = FIELD_PATTERN.exec(line.trim());
    if (match) {
      flush();
      currentKey = normalizeFieldKey(match[1]);
      buffer = match[2] ? [match[2]] : [];
    } else if (currentKey) {
      buffer.push(line);
    }
  }
  flush();
  return { raw, fields };
}

export function packageDocument(
  dailyPackage: StudioPackage,
  fileName: string,
): ParsedDocument {
  return parseDailyDocument(dailyPackage.files[fileName] ?? '');
}

export function platformDocument(
  dailyPackage: StudioPackage,
  platform: StudioPlatformId,
): ParsedDocument {
  const definition = PLATFORM_DEFINITIONS.find((item) => item.id === platform);
  return packageDocument(dailyPackage, definition?.fileName ?? '');
}

export function platformReviewStatus(
  dailyPackage: StudioPackage,
  platform: StudioPlatformId,
): ReviewStatus {
  const saved = dailyPackage.review.items[platform]?.status;
  if (saved) return saved;
  const document = platformDocument(dailyPackage, platform);
  const draftStatus = document.fields.STATUS?.trim().toUpperCase();
  if (draftStatus === 'HOLD' || draftStatus?.startsWith('HOLD —')) return 'HOLD';
  if (draftStatus === 'PUBLISHED') return 'PUBLISHED';
  if (
    platform === 'community' &&
    (
      document.raw.toUpperCase().includes('NO ACTION TODAY') ||
      document.fields.PLATFORM?.trim().toUpperCase() === 'NO ACTION TODAY' ||
      document.fields['IS RESPONSE USEFUL?']?.trim().toUpperCase() === 'NO'
    )
  ) return 'HOLD';
  return 'PENDING';
}

export function qualityScore(document: ParsedDocument): number | null {
  const direct = document.fields['QUALITY SCORE'] || document.fields.TOTAL;
  const directScore = firstScore(direct);
  if (directScore !== null) return directScore;

  const scoreKeys = [
    'SEARCH INTENT MATCH',
    'INFORMATION QUALITY',
    'ORIGINAL VALUE',
    'SEARCH DEMAND',
    'READABILITY',
    'QUESTDP RELEVANCE',
    'PLATFORM FIT',
  ];
  const values = scoreKeys.map((key) => firstScore(document.fields[key]));
  if (values.every((value): value is number => value !== null)) {
    return Math.min(100, values.reduce((sum, value) => sum + value, 0));
  }
  return null;
}

export function targetBlogSlug(document: ParsedDocument): string | null {
  const target =
    document.fields['TARGET URL'] ||
    document.fields['CURRENT QUESTDP URL'] ||
    document.fields.URL;
  if (!target) return null;
  try {
    const pathname = new URL(target, 'https://quest-dp.com').pathname;
    const match = pathname.match(/^\/blog\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export function instagramSlides(document: ParsedDocument): string[] {
  return Object.entries(document.fields)
    .filter(([key, value]) => /^SLIDE \d+$/.test(key) && value.trim().length > 0)
    .sort(([a], [b]) => Number(a.slice(6)) - Number(b.slice(6)))
    .map(([, value]) => value);
}

export function instagramAssets(document: ParsedDocument): string[] {
  return Object.entries(document.fields)
    .filter(([key, value]) => /^ASSET \d+$/.test(key) && value.trim().length > 0)
    .sort(([a], [b]) => Number(a.slice(6)) - Number(b.slice(6)))
    .map(([, value]) => value.trim());
}

export function primaryKeyword(dailyPackage: StudioPackage): string {
  return packageDocument(dailyPackage, '00-daily-brief.md').fields['PRIMARY KEYWORD'] || '미입력';
}

export function platformTitle(document: ParsedDocument, platform: StudioPlatformId): string {
  if (platform === 'naver') {
    return firstNonEmptyLine(document.fields['BEST TITLE'] || document.fields['TITLE OPTIONS']);
  }
  if (platform === 'threads') {
    return firstNonEmptyLine(document.fields.ANGLE || document.fields['PRIMARY POST']);
  }
  if (platform === 'instagram') {
    return firstNonEmptyLine(document.fields['SLIDE 1'] || document.fields['TARGET KEYWORD']);
  }
  return firstNonEmptyLine(document.fields.TITLE || document.fields['PRODUCT / BUSINESS ANGLE']);
}

export function chooseDefaultPackage(packages: StudioPackage[], today: string): StudioPackage | null {
  if (packages.length === 0) return null;
  const ascending = [...packages].sort((a, b) => a.date.localeCompare(b.date));
  return ascending.find((item) => item.date >= today) ?? ascending.at(-1) ?? null;
}

export function progressForPackage(dailyPackage: StudioPackage): { approved: number; total: number } {
  const statuses = PLATFORM_DEFINITIONS
    .filter((definition) => dailyPackage.files[definition.fileName])
    .map((definition) => platformReviewStatus(dailyPackage, definition.id));
  const reviewable = statuses.filter((status) => status !== 'HOLD');
  return {
    approved: reviewable.filter((status) => status === 'APPROVED' || status === 'PUBLISHED').length,
    total: reviewable.length,
  };
}

export function parseCsv(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (char === '"') {
      if (quoted && raw[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      row.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && raw[index + 1] === '\n') index += 1;
      row.push(value);
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }
  row.push(value);
  if (row.some((cell) => cell.length > 0)) rows.push(row);
  return rows;
}

export function currentKstDate(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function normalizeFieldKey(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toUpperCase();
}

function firstScore(value: string | undefined): number | null {
  if (!value) return null;
  const match = value.match(/\b(100|[1-9]?\d)\b/);
  return match ? Number(match[1]) : null;
}

function firstNonEmptyLine(value = ''): string {
  return value.split('\n').map((line) => line.trim()).find(Boolean) ?? '제목 미입력';
}

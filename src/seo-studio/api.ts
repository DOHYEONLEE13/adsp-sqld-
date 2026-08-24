import type {
  ManagementFiles,
  ReviewStatus,
  StudioPackage,
  StudioPlatformId,
  StudioReviewState,
} from './types';

const API_PREFIX = '/__seo-studio';

export async function fetchPackages(): Promise<StudioPackage[]> {
  const payload = await requestJson<{ packages: StudioPackage[] }>(`${API_PREFIX}/packages`);
  return payload.packages;
}

export async function fetchManagement(): Promise<ManagementFiles> {
  return requestJson<ManagementFiles>(`${API_PREFIX}/management`);
}

export async function saveReview(input: {
  date: string;
  platform: StudioPlatformId;
  status: Exclude<ReviewStatus, 'PUBLISHED'>;
  feedback: string;
}): Promise<StudioReviewState> {
  const payload = await requestJson<{ review: StudioReviewState }>(`${API_PREFIX}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return payload.review;
}

export async function recordPublished(input: {
  date: string;
  platform: Exclude<StudioPlatformId, 'blog'>;
  keyword: string;
  title: string;
  url: string;
}): Promise<{ review: StudioReviewState; appended: boolean }> {
  return requestJson(`${API_PREFIX}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: 'no-store', ...init });
  const payload = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || `Request failed: ${response.status}`);
  return payload;
}

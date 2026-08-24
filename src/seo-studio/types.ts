export type StudioPlatformId =
  | 'blog'
  | 'naver'
  | 'threads'
  | 'instagram'
  | 'velog'
  | 'tistory'
  | 'linkedin'
  | 'community';

export type ReviewStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'NEEDS_REVISION'
  | 'HOLD'
  | 'PUBLISHED';

export interface StudioReviewItem {
  status: ReviewStatus;
  feedback: string;
  updatedAt: string;
  publishedUrl?: string;
}

export interface StudioReviewState {
  version: 1;
  date: string;
  updatedAt: string;
  items: Partial<Record<StudioPlatformId, StudioReviewItem>>;
}

export interface StudioPackage {
  date: string;
  files: Record<string, string>;
  review: StudioReviewState;
}

export interface ManagementFiles {
  calendar: string;
  keywords: string;
  published: string;
  backlinks: string;
}

export interface ParsedDocument {
  raw: string;
  fields: Record<string, string>;
}

export interface PlatformDefinition {
  id: StudioPlatformId;
  label: string;
  fileName: string;
  reviewable: boolean;
}

/**
 * reviewItemStorage — ReviewItem 영속성 (localStorage mock).
 *
 * Phase 4 Step 4 — Step 5/6 에서 Supabase RPC 로 전환.
 *
 * 직렬화:
 *   - ReviewItem 의 due_date / last_attempted_at 은 Date → ISO string.
 *   - 로드 시 reviveDates() 로 복원.
 *
 * 키 공간:
 *   questdp_review_items_v1 — 사용자 1명만 (게스트 또는 인증) 가정.
 *   Step 5/6 에서 user_id 별 namespace 로 전환.
 */

import type { ReviewItem } from '@/types/learning/reviewItem';

const STORAGE_KEY = 'questdp_review_items_v1';

interface SerializedReviewItem
  extends Omit<ReviewItem, 'due_date' | 'last_attempted_at'> {
  due_date: string | null;
  last_attempted_at: string;
}

interface SerializedStore {
  _v: 1;
  items: SerializedReviewItem[];
}

/** 저장. 빈 배열도 그대로 보존. */
export function saveReviewItems(items: readonly ReviewItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: SerializedStore = {
      _v: 1,
      items: items.map(serialize),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // quota — silent fail
  }
}

/** 로드. 없거나 손상 시 빈 배열. */
export function loadReviewItems(): ReviewItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SerializedStore;
    if (parsed?._v !== 1) return [];
    if (!Array.isArray(parsed.items)) return [];
    return parsed.items.map(deserialize);
  } catch {
    return [];
  }
}

/** 단일 항목 upsert — 기존 question_id 있으면 갱신, 없으면 추가. */
export function upsertReviewItem(item: ReviewItem): ReviewItem[] {
  const all = loadReviewItems();
  const idx = all.findIndex(
    (it) => it.user_id === item.user_id && it.question_id === item.question_id,
  );
  if (idx >= 0) {
    all[idx] = item;
  } else {
    all.push(item);
  }
  saveReviewItems(all);
  return all;
}

/** question_id 로 1건 조회. 없으면 null. */
export function findReviewItem(
  userId: string,
  questionId: string,
): ReviewItem | null {
  const all = loadReviewItems();
  return (
    all.find(
      (it) => it.user_id === userId && it.question_id === questionId,
    ) ?? null
  );
}

/** 활성 ReviewItem 만 (status='active'). 큐 빌드 입력. */
export function loadActiveReviewItems(userId: string): ReviewItem[] {
  return loadReviewItems().filter(
    (it) => it.user_id === userId && it.status === 'active',
  );
}

/** 전체 클리어 (테스트 또는 사용자 reset). */
export function clearReviewItems(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

/** 일괄 갱신 — inactivity reset / autoMaster 후 호출. */
export function replaceAllReviewItems(items: readonly ReviewItem[]): void {
  saveReviewItems(items);
}

// ─── 직렬화 헬퍼 ────────────────────────────────────────────────

function serialize(it: ReviewItem): SerializedReviewItem {
  return {
    ...it,
    due_date: it.due_date ? it.due_date.toISOString() : null,
    last_attempted_at: it.last_attempted_at.toISOString(),
  };
}

function deserialize(s: SerializedReviewItem): ReviewItem {
  return {
    ...s,
    due_date: s.due_date ? new Date(s.due_date) : null,
    last_attempted_at: new Date(s.last_attempted_at),
  };
}

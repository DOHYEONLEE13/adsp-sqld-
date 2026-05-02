/**
 * conceptBookmarks.ts — 개념(LessonStep) 북마크 저장소.
 *
 * 기존 bookmarks.ts (questionId 단위) 와는 분리. step.id (예: 'adsp-3-4-s11') 를
 * 키로 저장하며, ADsP 첫 화면(PlanetScreen) 과 프로필(StatsPage) 에서 다시
 * 열람·점프 가능.
 *
 * 저장: localStorage (questdp.conceptBookmarks.v1).
 *   - 1차 구현은 로컬 only. Supabase sync 는 향후 단계 (bookmarks.ts 의 패턴 그대로
 *     migration + serverUpsert/Pull 추가하면 됨).
 *
 * 호출 패턴은 bookmarks.ts 와 1:1 미러:
 *   subscribe(cb), getSnapshot(), toggleConceptBookmark(id),
 *   isConceptBookmarked(id), listConceptBookmarks(), conceptBookmarkCount(),
 *   removeConceptBookmark(id).
 */

const STORAGE_KEY = 'questdp.conceptBookmarks.v1';
const SCHEMA_VERSION = 1 as const;

export interface ConceptBookmarkStore {
  version: typeof SCHEMA_VERSION;
  /** 북마크된 LessonStep.id 집합. */
  ids: Set<string>;
  updatedAt: number;
}

export interface ConceptBookmarkEntry {
  stepId: string;
  addedAt: number;
}

interface Wire {
  version: number;
  ids: string[];
  addedAt?: Record<string, number>;
  updatedAt: number;
}

let addedAt: Record<string, number> = {};

function emptyStore(): ConceptBookmarkStore {
  return {
    version: SCHEMA_VERSION,
    ids: new Set(),
    updatedAt: Date.now(),
  };
}

function loadStore(): ConceptBookmarkStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<Wire>;
    if (parsed?.version !== SCHEMA_VERSION) return emptyStore();
    const ids = new Set<string>(parsed.ids ?? []);
    addedAt = parsed.addedAt ?? {};
    const now = Date.now();
    for (const id of ids) {
      if (addedAt[id] == null) addedAt[id] = now;
    }
    return {
      version: SCHEMA_VERSION,
      ids,
      updatedAt: parsed.updatedAt ?? now,
    };
  } catch {
    return emptyStore();
  }
}

function saveStore(store: ConceptBookmarkStore): void {
  if (typeof window === 'undefined') return;
  try {
    const wire: Wire = {
      version: SCHEMA_VERSION,
      ids: Array.from(store.ids),
      addedAt,
      updatedAt: store.updatedAt,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wire));
  } catch {
    /* quota / privacy — 무시 */
  }
}

let current: ConceptBookmarkStore = loadStore();
const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): ConceptBookmarkStore {
  return current;
}

function commit(next: ConceptBookmarkStore): void {
  current = next;
  saveStore(next);
  for (const l of listeners) l();
}

/** stepId 토글. 추가됐으면 true 반환. */
export function toggleConceptBookmark(stepId: string): boolean {
  const next = new Set(current.ids);
  let added: boolean;
  if (next.has(stepId)) {
    next.delete(stepId);
    delete addedAt[stepId];
    added = false;
  } else {
    next.add(stepId);
    addedAt[stepId] = Date.now();
    added = true;
  }
  commit({ ...current, ids: next, updatedAt: Date.now() });
  return added;
}

/** 북마크 단건 해제. */
export function removeConceptBookmark(stepId: string): void {
  if (!current.ids.has(stepId)) return;
  const next = new Set(current.ids);
  next.delete(stepId);
  delete addedAt[stepId];
  commit({ ...current, ids: next, updatedAt: Date.now() });
}

export function isConceptBookmarked(stepId: string): boolean {
  return current.ids.has(stepId);
}

export function conceptBookmarkCount(): number {
  return current.ids.size;
}

/** 추가 시각 내림차순 정렬된 리스트 (최근 북마크 먼저). */
export function listConceptBookmarks(): ConceptBookmarkEntry[] {
  return Array.from(current.ids)
    .map((id) => ({ stepId: id, addedAt: addedAt[id] ?? 0 }))
    .sort((a, b) => b.addedAt - a.addedAt);
}

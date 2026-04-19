/**
 * 북마크 · 노트 저장소 — progress slice 와 분리된 독립 영역.
 *
 * - 즐겨찾기(별): Set<questionId>
 * - 노트: Record<questionId, string>    // 빈 문자열/없음 = 노트 없음
 *
 * Progress 와 별도 key 로 보관해 리셋/백업을 독립적으로 다룰 수 있게 합니다.
 */
import type { Subject } from '@/types/question';

const STORAGE_KEY = 'questdp.bookmarks.v1';
const SCHEMA_VERSION = 1 as const;

export interface BookmarkStore {
  version: typeof SCHEMA_VERSION;
  /** 북마크된 questionId 집합 (JSON 직렬화 시 배열로 변환). */
  ids: Set<string>;
  /** questionId -> note text. 빈 문자열이면 삭제된 것으로 간주. */
  notes: Record<string, string>;
  updatedAt: number;
}

/** 북마크 추가/제거 이력을 추적하기 위한 경량 엔트리. 리스트 페이지에서 사용. */
export interface BookmarkEntry {
  questionId: string;
  note: string;
  addedAt: number;
}

// ----------------------------------------------------------------
// Load / save
// ----------------------------------------------------------------

function emptyStore(): BookmarkStore {
  return {
    version: SCHEMA_VERSION,
    ids: new Set(),
    notes: {},
    updatedAt: Date.now(),
  };
}

interface BookmarkStoreWire {
  version: number;
  ids: string[];
  notes: Record<string, string>;
  addedAt?: Record<string, number>;
  updatedAt: number;
}

/** questionId -> 최초 북마크 시각. 정렬/리스트용. */
let addedAt: Record<string, number> = {};

function loadStore(): BookmarkStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<BookmarkStoreWire>;
    if (parsed?.version !== SCHEMA_VERSION) return emptyStore();
    const ids = new Set<string>(parsed.ids ?? []);
    addedAt = parsed.addedAt ?? {};
    // addedAt 누락된 id 는 지금 시각으로 채움.
    const now = Date.now();
    for (const id of ids) {
      if (addedAt[id] == null) addedAt[id] = now;
    }
    return {
      version: SCHEMA_VERSION,
      ids,
      notes: parsed.notes ?? {},
      updatedAt: parsed.updatedAt ?? Date.now(),
    };
  } catch {
    return emptyStore();
  }
}

function saveStore(store: BookmarkStore): void {
  if (typeof window === 'undefined') return;
  try {
    const wire: BookmarkStoreWire = {
      version: SCHEMA_VERSION,
      ids: Array.from(store.ids),
      notes: store.notes,
      addedAt,
      updatedAt: store.updatedAt,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wire));
  } catch {
    // quota/privacy — 조용히 무시.
  }
}

// ----------------------------------------------------------------
// In-memory state
// ----------------------------------------------------------------

let current: BookmarkStore = loadStore();
const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): BookmarkStore {
  return current;
}

function commit(next: BookmarkStore): void {
  current = next;
  saveStore(next);
  for (const l of listeners) l();
}

// ----------------------------------------------------------------
// Mutations
// ----------------------------------------------------------------

/** 북마크 토글. 추가/제거된 최종 상태(true=등록됨) 를 반환. */
export function toggleBookmark(questionId: string): boolean {
  const next = new Set(current.ids);
  let added: boolean;
  if (next.has(questionId)) {
    next.delete(questionId);
    // 노트는 유지 — 다시 북마크 시 그대로 복구.
    added = false;
    delete addedAt[questionId];
  } else {
    next.add(questionId);
    addedAt[questionId] = Date.now();
    added = true;
  }
  commit({ ...current, ids: next, updatedAt: Date.now() });
  return added;
}

/** 여러 개를 한 번에 북마크 (Result 의 "오답 전체 북마크" 용). 이미 있는 건 무시. */
export function bulkAdd(questionIds: readonly string[]): number {
  const next = new Set(current.ids);
  const now = Date.now();
  let n = 0;
  for (const id of questionIds) {
    if (!next.has(id)) {
      next.add(id);
      addedAt[id] = now;
      n += 1;
    }
  }
  if (n === 0) return 0;
  commit({ ...current, ids: next, updatedAt: now });
  return n;
}

/** 노트 저장. 빈 문자열/undefined 면 삭제. */
export function setNote(questionId: string, note: string): void {
  const trimmed = note.trim();
  const notes = { ...current.notes };
  if (trimmed === '') {
    delete notes[questionId];
  } else {
    notes[questionId] = trimmed;
  }
  commit({ ...current, notes, updatedAt: Date.now() });
}

/** 개별 해제 — 리스트 페이지용. 노트도 같이 제거. */
export function removeBookmark(questionId: string): void {
  if (!current.ids.has(questionId)) return;
  const next = new Set(current.ids);
  next.delete(questionId);
  const notes = { ...current.notes };
  delete notes[questionId];
  delete addedAt[questionId];
  commit({ ...current, ids: next, notes, updatedAt: Date.now() });
}

/** 모두 비우기 — 위험 액션. 대시보드 리셋과 별도. */
export function resetBookmarks(): void {
  addedAt = {};
  commit(emptyStore());
}

// ----------------------------------------------------------------
// Read-only accessors
// ----------------------------------------------------------------

export function isBookmarked(id: string): boolean {
  return current.ids.has(id);
}

export function getNote(id: string): string {
  return current.notes[id] ?? '';
}

export function bookmarkedIds(): string[] {
  return Array.from(current.ids);
}

/** 리스트 페이지용 — 과목/추가순으로 정렬된 엔트리. */
export function listEntries(filter?: { subject?: Subject }): BookmarkEntry[] {
  // 필터는 호출부에서 question 메타로 한 번 더 좁힘 — 여기선 순수 id 배열만.
  void filter;
  return Array.from(current.ids)
    .map((id) => ({
      questionId: id,
      note: current.notes[id] ?? '',
      addedAt: addedAt[id] ?? 0,
    }))
    .sort((a, b) => b.addedAt - a.addedAt);
}

/** 총 북마크 개수. */
export function bookmarkCount(): number {
  return current.ids.size;
}

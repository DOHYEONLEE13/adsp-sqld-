/**
 * 북마크 · 노트 저장소 — progress slice 와 분리된 독립 영역.
 *
 * - 즐겨찾기(별): Set<questionId>
 * - 노트: Record<questionId, string>    // 빈 문자열/없음 = 노트 없음
 *
 * Hybrid sync: localStorage 가 즉각 반영, 인증돼 있으면 background 로 Supabase 에 push.
 * mount 시 server pull → local overlay (다른 기기에서 추가한 북마크 포착).
 */
import type { Subject } from '@/types/question';
import { getSupabase, onAuthStateChange } from '@/lib/supabase';
import { decideSignInTransition } from '@/lib/signInTransition';

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
  if (added) {
    void serverUpsertBookmark(questionId, current.notes[questionId] ?? '');
  } else {
    void serverDeleteBookmark(questionId);
  }
  return added;
}

/** 여러 개를 한 번에 북마크 (Result 의 "오답 전체 북마크" 용). 이미 있는 건 무시. */
export function bulkAdd(questionIds: readonly string[]): number {
  const next = new Set(current.ids);
  const now = Date.now();
  const newIds: string[] = [];
  for (const id of questionIds) {
    if (!next.has(id)) {
      next.add(id);
      addedAt[id] = now;
      newIds.push(id);
    }
  }
  if (newIds.length === 0) return 0;
  commit({ ...current, ids: next, updatedAt: now });
  void serverUpsertBookmarks(newIds);
  return newIds.length;
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
  // 노트만 update — 북마크 자체는 변경 X
  if (current.ids.has(questionId)) {
    void serverUpsertBookmark(questionId, trimmed);
  }
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
  void serverDeleteBookmark(questionId);
}

/** 모두 비우기 — 위험 액션. 대시보드 리셋과 별도. */
export function resetBookmarks(): void {
  addedAt = {};
  commit(emptyStore());
  void serverDeleteAllBookmarks();
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

// ─── Supabase sync layer ────────────────────────────────────────────────

async function serverUpsertBookmark(questionId: string, note: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data: sess } = await sb.auth.getSession();
    if (!sess.session) return;
    await sb.from('bookmarks').upsert(
      { user_id: sess.session.user.id, question_id: questionId, note },
      { onConflict: 'user_id,question_id' },
    );
  } catch {
    /* 무시 */
  }
}

async function serverUpsertBookmarks(questionIds: string[]): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data: sess } = await sb.auth.getSession();
    if (!sess.session) return;
    const rows = questionIds.map((qid) => ({
      user_id: sess.session!.user.id,
      question_id: qid,
      note: current.notes[qid] ?? '',
    }));
    await sb.from('bookmarks').upsert(rows, { onConflict: 'user_id,question_id' });
  } catch {
    /* 무시 */
  }
}

async function serverDeleteBookmark(questionId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data: sess } = await sb.auth.getSession();
    if (!sess.session) return;
    await sb
      .from('bookmarks')
      .delete()
      .eq('user_id', sess.session.user.id)
      .eq('question_id', questionId);
  } catch {
    /* 무시 */
  }
}

async function serverDeleteAllBookmarks(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data: sess } = await sb.auth.getSession();
    if (!sess.session) return;
    await sb.from('bookmarks').delete().eq('user_id', sess.session.user.id);
  } catch {
    /* 무시 */
  }
}

/**
 * server push 없이 local 만 비우는 변형. signInTransition 의 'reset' 결정
 * 시 호출 — 게스트 북마크가 server 의 기존 계정 북마크와 union 되지 않도록.
 *
 * 일반 resetBookmarks() 는 server delete 까지 함께 — 위험 액션. 본 함수는
 * 인증 사용자가 아직 server pull 안 한 시점의 local-only reset 용.
 */
function resetBookmarksLocal(): void {
  addedAt = {};
  commit(emptyStore());
}

/** server → local pull. 다른 기기에서 추가한 북마크 흡수. */
async function pullBookmarks(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) return;
  const { data, error } = await sb
    .from('bookmarks')
    .select('question_id, note, created_at');
  if (error || !data) return;

  // server 데이터로 local 덮어쓰기 (server = 진실의 근원)
  const ids = new Set<string>();
  const notes: Record<string, string> = {};
  const newAddedAt: Record<string, number> = {};
  for (const row of data as Array<{ question_id: string; note: string | null; created_at: string }>) {
    ids.add(row.question_id);
    if (row.note) notes[row.question_id] = row.note;
    newAddedAt[row.question_id] = Date.parse(row.created_at) || Date.now();
  }
  addedAt = newAddedAt;
  commit({ version: SCHEMA_VERSION, ids, notes, updatedAt: Date.now() });
}

let _syncStarted = false;

export function initBookmarksSync(): () => void {
  if (_syncStarted) return () => {};
  _syncStarted = true;

  void pullBookmarks();

  const unsub = onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      // Guest → 기존 계정 전환이면 게스트 북마크 폐기 (server delete 없이).
      // 그러지 않으면 pullBookmarks 가 어차피 server 데이터로 덮어써서 동작은
      // 같지만, 명시적으로 reset 해서 의도 분명히 + race window 좁힘.
      if (session?.user.id) {
        const decision = await decideSignInTransition(session.user.id);
        if (decision === 'reset') {
          resetBookmarksLocal();
        }
      }
      void pullBookmarks();
    }
  });

  return () => {
    unsub();
    _syncStarted = false;
  };
}

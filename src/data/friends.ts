/**
 * friends.ts — 친구 목록 + 진행상황 스냅샷.
 *
 * 하이브리드 모델 (auto-upgrade):
 * - 미로그인 (guest): localStorage 만. 친구의 실제 진도는 placeholder 0.
 * - 로그인 (Supabase): server 가 진실의 근원.
 *   - mount 시: friendships join profiles 로 친구 목록 + 실제 XP/level/streak/avatar 가져옴
 *   - addFriend: RPC `add_friend_by_tag` → insert + UI 즉시 반영 (다음 pull 에서 최종 데이터)
 *   - realtime: 친구 profile 의 UPDATE 이벤트 구독 → XP/avatar 변화 자동 반영
 *
 * 컴포넌트는 sync API (`listFriends`) 그대로. server 데이터가 있으면 자동 overlay.
 */

import { DEFAULT_AVATAR_POSE, isValidTag, normalizeTag } from './profile';
import type { QuesPose } from '@/components/mascot/types';
import { getSupabase, onAuthStateChange } from '@/lib/supabase';

const STORAGE_KEY = 'questdp.friends.v1';

export interface FriendEntry {
  /** 친구의 고유 태그. */
  tag: string;
  /** 표시 이름 — 서버 연동 후엔 친구의 displayName 으로 갱신. */
  displayName: string;
  /** 친구가 선택한 아바타 포즈 — 서버 연동 시 profiles.avatar_pose 와 동기화. */
  avatarPose: QuesPose;
  /** 마지막으로 본 진행 스냅샷. 서버 없으니 일단 0. */
  level: number;
  totalXp: number;
  streakDays: number;
  /** 마지막 갱신 시각. 서버 연동 시 last_seen_at 으로 교체. */
  lastSeenAt: number;
  /** 친구 추가 시점. */
  addedAt: number;
}

interface StoredFriends {
  v: 1;
  list: FriendEntry[];
}

function load(): StoredFriends {
  if (typeof window === 'undefined') return { v: 1, list: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { v: 1, list: [] };
    const obj = JSON.parse(raw) as StoredFriends;
    if (obj?.v !== 1 || !Array.isArray(obj.list)) return { v: 1, list: [] };
    return obj;
  } catch {
    return { v: 1, list: [] };
  }
}

function save(data: StoredFriends) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* 무시 */
  }
}

export function listFriends(): FriendEntry[] {
  const sorted = load().list.map((f) => ({
    // 구버전(저장 시점에 avatarPose 가 없던) 대응 — 기본 포즈로 폴백.
    ...f,
    avatarPose: f.avatarPose ?? DEFAULT_AVATAR_POSE,
  }));
  // XP 내림차순 — 리더보드 정렬.
  sorted.sort((a, b) => b.totalXp - a.totalXp);
  return sorted;
}

export type AddResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | 'invalid'
        | 'self'
        | 'duplicate'
        | 'not_found'
        | 'unauthenticated'
        | 'network';
    };

/**
 * 태그로 친구 추가.
 * - 로그인: RPC `add_friend_by_tag` → server 가 검증+insert. 성공 시 pull 로 실데이터 동기화.
 * - 게스트: localStorage 에 placeholder 만 저장.
 */
export function addFriend(rawTag: string, myTag: string): AddResult {
  const tag = normalizeTag(rawTag);
  if (!isValidTag(tag)) return { ok: false, reason: 'invalid' };
  if (tag === myTag) return { ok: false, reason: 'self' };

  const sb = getSupabase();
  if (sb) {
    // 로그인 상태일 가능성 — server 통해 추가 시도. 비동기지만 즉시 반응을 위해
    // 로컬엔 placeholder 먼저 넣고 background 로 push.
    const data = load();
    if (data.list.some((f) => f.tag === tag)) {
      return { ok: false, reason: 'duplicate' };
    }
    void serverAddFriend(tag); // server 응답 후 pull 트리거
    // 즉시 placeholder — 곧 실데이터로 덮임
    data.list.push({
      tag,
      displayName: tag,
      avatarPose: DEFAULT_AVATAR_POSE,
      level: 0,
      totalXp: 0,
      streakDays: 0,
      lastSeenAt: 0,
      addedAt: Date.now(),
    });
    save(data);
    notify();
    return { ok: true };
  }

  // 게스트
  const data = load();
  if (data.list.some((f) => f.tag === tag)) {
    return { ok: false, reason: 'duplicate' };
  }
  data.list.push({
    tag,
    displayName: tag,
    avatarPose: DEFAULT_AVATAR_POSE,
    level: 0,
    totalXp: 0,
    streakDays: 0,
    lastSeenAt: 0,
    addedAt: Date.now(),
  });
  save(data);
  notify();
  return { ok: true };
}

export function removeFriend(tag: string) {
  const data = load();
  data.list = data.list.filter((f) => f.tag !== tag);
  save(data);
  notify();
  // server 에도 삭제 (인증돼 있을 때만)
  void serverRemoveFriend(tag);
}

// ── pub/sub — Supabase realtime 구독으로 교체될 자리 ──

const listeners = new Set<() => void>();

export function subscribeFriends(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify() {
  for (const cb of listeners) {
    try {
      cb();
    } catch {
      /* 무시 */
    }
  }
}

// ─── Supabase sync layer ────────────────────────────────────────────────

interface FriendRow {
  tag: string;
  display_name: string;
  avatar_pose: string;
  total_xp: number;
  level: number;
  streak_days: number;
  last_seen_at: string;
}

/** server 에서 친구 목록 + 진도 stat 까지 한 번에 fetch. RLS 가 자동 필터. */
async function pullFromSupabase(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) return;

  // friendships → profiles join. RLS policy `profiles_read_friends` 가 자동으로
  // 친구 row 만 노출. user_id 필터는 friendships RLS 가 처리.
  const { data, error } = await sb
    .from('friendships')
    .select(
      'friend_id, friend:profiles!friendships_friend_id_fkey(tag, display_name, avatar_pose, total_xp, level, streak_days, last_seen_at)',
    )
    .order('created_at', { ascending: false });

  if (error || !data) return;

  const list: FriendEntry[] = data.flatMap((row) => {
    const f = (row as unknown as { friend: FriendRow | null }).friend;
    if (!f) return [];
    return [
      {
        tag: f.tag,
        displayName: f.display_name || f.tag,
        avatarPose: (f.avatar_pose as QuesPose) ?? DEFAULT_AVATAR_POSE,
        level: f.level ?? 0,
        totalXp: f.total_xp ?? 0,
        streakDays: f.streak_days ?? 0,
        lastSeenAt: f.last_seen_at ? Date.parse(f.last_seen_at) : 0,
        addedAt: 0,
      },
    ];
  });

  save({ v: 1, list });
  notify();
}

/** RPC 호출 → 성공 시 pull 로 동기화. 결과는 즉시 표시되지 않고 다음 pull 에서. */
async function serverAddFriend(tag: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data: sess } = await sb.auth.getSession();
    if (!sess.session) return;
    const { data, error } = await sb.rpc('add_friend_by_tag', { target_tag: tag });
    if (error) return;
    // RPC 가 성공하면 friendships 에 row 가 들어가 있음 → pull 로 새 친구 가져옴
    const result = (data ?? [])[0] as { ok: boolean; reason: string | null } | undefined;
    if (result?.ok) {
      await pullFromSupabase();
    } else {
      // 서버가 거부 — 미리 넣은 placeholder 도 제거
      const local = load();
      local.list = local.list.filter((f) => f.tag !== tag);
      save(local);
      notify();
    }
  } catch {
    /* 무시 — 다음 pull 에서 정합성 회복 */
  }
}

async function serverRemoveFriend(tag: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data: sess } = await sb.auth.getSession();
    if (!sess.session) return;
    // friend_id 찾기 (tag → id)
    const { data: friendRow } = await sb
      .from('profiles')
      .select('id')
      .eq('tag', tag)
      .maybeSingle();
    if (!friendRow) return;
    await sb
      .from('friendships')
      .delete()
      .eq('user_id', sess.session.user.id)
      .eq('friend_id', friendRow.id);
  } catch {
    /* 무시 */
  }
}

let _syncStarted = false;
let _channelUnsub: (() => void) | null = null;

/**
 * mount 시 한 번 호출. auth 변화에 따라 pull + realtime 채널 관리.
 * cleanup 함수 반환 — App unmount 시 채널 끊음.
 */
export function initFriendsSync(): () => void {
  if (_syncStarted) return () => {};
  _syncStarted = true;

  const setupChannel = async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data: sess } = await sb.auth.getSession();
    if (!sess.session) return;

    // 친구 ID 목록 (filter 용)
    const { data: friendIds } = await sb
      .from('friendships')
      .select('friend_id')
      .eq('user_id', sess.session.user.id);
    const ids = (friendIds ?? []).map((r) => (r as { friend_id: string }).friend_id);

    // 친구 profile UPDATE 구독 — 친구가 XP/avatar 바꾸면 즉시 갱신
    if (ids.length > 0) {
      const channel = sb
        .channel('friends-profiles')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=in.(${ids.join(',')})`,
          },
          () => {
            void pullFromSupabase();
          },
        )
        .subscribe();
      _channelUnsub = () => {
        sb.removeChannel(channel);
      };
    }
  };

  void pullFromSupabase().then(() => setupChannel());

  const unsubAuth = onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      void pullFromSupabase().then(() => {
        // 채널 재구성 (친구 목록 변경 가능)
        _channelUnsub?.();
        _channelUnsub = null;
        void setupChannel();
      });
    }
    if (event === 'SIGNED_OUT') {
      _channelUnsub?.();
      _channelUnsub = null;
      // localStorage 그대로 — 다음 로그인 시 다시 hydrate
    }
  });

  return () => {
    unsubAuth();
    _channelUnsub?.();
    _channelUnsub = null;
    _syncStarted = false;
  };
}

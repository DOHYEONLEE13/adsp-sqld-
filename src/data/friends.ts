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
  /**
   * 친구의 회독 Pass Tier. 마이그 0013 미적용 환경 또는 게스트 placeholder
   * 에선 'bronze' 로 fallback. profiles.pass_tier 의 직접 mirror.
   */
  passTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'master';
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
 * 태그로 친구 추가. **async** — 인증 사용자는 server RPC 결과까지 await 후 실제
 * ok/error 를 반환. UI 가 명확한 토스트 노출 가능.
 *
 * 로그인 케이스 흐름:
 *   1. 즉시 placeholder 추가 → UI 반응성
 *   2. RPC `add_friend_by_tag` await
 *   3. 거부 시 placeholder 제거 + 정확한 reason 반환
 *   4. 성공 시 pull + channel rebuild + ok 반환
 *
 * 게스트 케이스: localStorage 만. 즉시 ok.
 */
/**
 * Promise 에 timeout 걸기. 네트워크/RLS 이슈로 hang 하는 supabase 호출이 영영
 * resolve 안 하면 UI 가 영구 disabled 됨. timeout 으로 강제 reject 해 catch 로
 * 흘려보내 사용자에게 즉시 피드백.
 */
function withTimeout<T>(p: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`timeout: ${label}`)), ms);
    p.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e) => {
        clearTimeout(id);
        reject(e);
      },
    );
  });
}

export async function addFriend(rawTag: string, myTag: string): Promise<AddResult> {
  const tag = normalizeTag(rawTag);
  if (!isValidTag(tag)) return { ok: false, reason: 'invalid' };
  if (tag === myTag) return { ok: false, reason: 'self' };

  const data = load();
  if (data.list.some((f) => f.tag === tag)) {
    return { ok: false, reason: 'duplicate' };
  }

  const sb = getSupabase();
  if (sb) {
    // 모든 supabase 호출을 단일 try/catch + timeout 안에 감쌈. getSession / RPC /
    // pull 어느 하나라도 hang/throw 하면 즉시 catch 로 흘러 UI 가 멈추지 않음.
    try {
      const sessRes = await withTimeout(
        sb.auth.getSession(),
        8000,
        'auth.getSession',
      );
      if (!sessRes.data.session) {
        return { ok: false, reason: 'unauthenticated' };
      }

      // 즉시 placeholder — UI 가 친구 카드 옅게 노출하다 server 응답 후 실데이터 또는 제거
      data.list.push({
        tag,
        displayName: tag,
        avatarPose: DEFAULT_AVATAR_POSE,
        level: 0,
        totalXp: 0,
        streakDays: 0,
        lastSeenAt: 0,
        addedAt: Date.now(),
        passTier: 'bronze',
      });
      save(data);
      notify();

      // server RPC — 8초 timeout
      const { data: rpcData, error } = await withTimeout(
        sb.rpc('add_friend_by_tag', { target_tag: tag }),
        8000,
        'rpc.add_friend_by_tag',
      );
      if (error) {
        // 네트워크/RPC 에러 — placeholder 제거
        const local = load();
        local.list = local.list.filter((f) => f.tag !== tag);
        save(local);
        notify();
        return { ok: false, reason: 'network' };
      }
      // RPC 가 `table (ok boolean, reason text)` 반환 — supabase-js 는 보통
      // 배열로 줌. 단일 객체로 오는 케이스 대비해 둘 다 허용.
      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      const result = row as { ok: boolean; reason: string | null } | undefined;
      if (!result?.ok) {
        // 서버 거부 — placeholder 제거 + 정확한 reason 반환
        const local = load();
        local.list = local.list.filter((f) => f.tag !== tag);
        save(local);
        notify();
        const r = result?.reason;
        if (r === 'not_found' || r === 'self' || r === 'duplicate' || r === 'unauthenticated') {
          return { ok: false, reason: r };
        }
        return { ok: false, reason: 'network' };
      }
      // 성공 — RPC 가 row 를 이미 insert 했으니 UI 는 즉시 ok.
      // pull / rebuildChannel 은 background (await 하면 RLS 이슈로 hang 시 UI 도
      // 같이 멈춤. realtime 채널이 있어 결국 자동 동기화됨).
      void pullFromSupabase();
      void rebuildChannel();
      return { ok: true };
    } catch {
      const local = load();
      local.list = local.list.filter((f) => f.tag !== tag);
      save(local);
      notify();
      return { ok: false, reason: 'network' };
    }
  }

  // 게스트
  data.list.push({
    tag,
    displayName: tag,
    avatarPose: DEFAULT_AVATAR_POSE,
    level: 0,
    totalXp: 0,
    streakDays: 0,
    lastSeenAt: 0,
    addedAt: Date.now(),
    passTier: 'bronze',
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
  /** 마이그 0013 적용 후 컬럼 존재. 미존재 시 null (graceful degrade). */
  pass_tier?: string | null;
}

/** server 에서 친구 목록 + 진도 stat 까지 한 번에 fetch. RLS 가 자동 필터. */
async function pullFromSupabase(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) return;

  // friendships → profiles join. RLS policy `profiles_read_friends` 가 자동으로
  // 친구 row 만 노출. user_id 필터는 friendships RLS 가 처리.
  // pass_tier 컬럼이 마이그 0013 후에만 존재 — 미적용 환경 대비 두 단계로 시도.
  // 1순위: pass_tier 포함. 2순위: 컬럼 부재 에러 → 기존 select 로 fallback.
  // 동일 supabase-js 타입 추론 충돌 회피 위해 unknown 으로 narrow 후 처리.
  let rawData: unknown = null;
  const r1 = await sb
    .from('friendships')
    .select(
      'friend_id, friend:profiles!friendships_friend_id_fkey(tag, display_name, avatar_pose, total_xp, level, streak_days, last_seen_at, pass_tier)',
    )
    .order('created_at', { ascending: false });
  if (!r1.error && r1.data) {
    rawData = r1.data;
  } else {
    const r2 = await sb
      .from('friendships')
      .select(
        'friend_id, friend:profiles!friendships_friend_id_fkey(tag, display_name, avatar_pose, total_xp, level, streak_days, last_seen_at)',
      )
      .order('created_at', { ascending: false });
    if (r2.error || !r2.data) return;
    rawData = r2.data;
  }
  const data = rawData as Array<unknown>;

  const list: FriendEntry[] = data.flatMap((row) => {
    const f = (row as { friend: FriendRow | null }).friend;
    if (!f) return [];
    const validTiers = ['bronze', 'silver', 'gold', 'platinum', 'master'] as const;
    type T = (typeof validTiers)[number];
    const tier: T = validTiers.includes(f.pass_tier as T)
      ? (f.pass_tier as T)
      : 'bronze';
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
        passTier: tier,
      },
    ];
  });

  save({ v: 1, list });
  notify();
}

// (serverAddFriend 함수는 addFriend 안 inline 처리로 통합되어 제거됨.
//  참고: addFriend 가 await RPC → 결과로 placeholder 정리 + UI 토스트 처리)

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
    // 양방향 삭제 (mutual friendship 모델) — 어느 쪽 row 든 둘 다 정리
    await sb
      .from('friendships')
      .delete()
      .or(
        `and(user_id.eq.${sess.session.user.id},friend_id.eq.${friendRow.id}),` +
        `and(user_id.eq.${friendRow.id},friend_id.eq.${sess.session.user.id})`,
      );
    // 친구 목록 변경 → channel filter 갱신
    void rebuildChannel();
  } catch {
    /* 무시 */
  }
}

let _syncStarted = false;
let _channelUnsub: (() => void) | null = null;

/**
 * 친구 profile UPDATE 구독 채널을 (재)구성. 친구 목록 변동 시마다 호출:
 *   - 초기 로드 (initFriendsSync)
 *   - SIGNED_IN
 *   - addFriend / removeFriend 직후
 * 기존 채널이 있으면 먼저 unsubscribe 하고 새 친구 ID 목록으로 재구독.
 */
async function rebuildChannel(): Promise<void> {
  // 기존 채널 정리
  _channelUnsub?.();
  _channelUnsub = null;

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

  if (ids.length === 0) return;

  // 친구 profile UPDATE 구독 — 친구가 displayName/XP/avatar/pass_tier 바꾸면 즉시 갱신
  // 같은 channel 이름을 재사용하면 멱등 (Supabase 가 기존 한 인스턴스만 유지)
  const channel = sb
    .channel(`friends-profiles-${Date.now()}`)
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

/**
 * mount 시 한 번 호출. auth 변화에 따라 pull + realtime 채널 관리.
 * cleanup 함수 반환 — App unmount 시 채널 끊음.
 */
export function initFriendsSync(): () => void {
  if (_syncStarted) return () => {};
  _syncStarted = true;

  void pullFromSupabase().then(() => rebuildChannel());

  const unsubAuth = onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      void pullFromSupabase().then(() => rebuildChannel());
    }
    if (event === 'SIGNED_OUT') {
      _channelUnsub?.();
      _channelUnsub = null;
      // 친구 목록 캐시도 비움 — 다른 계정으로 로그인 시 stale 안 보이게
      save({ v: 1, list: [] });
      notify();
    }
  });

  return () => {
    unsubAuth();
    _channelUnsub?.();
    _channelUnsub = null;
    _syncStarted = false;
  };
}

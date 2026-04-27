/**
 * profile.ts — 사용자 프로필 + 고유 태그.
 *
 * 하이브리드 모델 (auto-upgrade):
 * - 미로그인 (guest): localStorage 만 사용. 태그·displayName·avatarPose 모두 로컬.
 * - 로그인 (Supabase): localStorage 가 1차 캐시. 백그라운드에서 server 와 동기화.
 *   - mount 시: server 프로필을 fetch → localStorage 덮어쓰기 → notify
 *   - setter 호출 시: localStorage 즉시 update + notify (optimistic) → background 로 server PATCH
 *
 * 컴포넌트는 sync API (`getMyProfile`) 만 보면 됨 — 자동으로 server 값이 흘러옴.
 *
 * 태그 형식: `Q-XXXX-XXXX`. 서버측 트리거가 가입 시 자동 발급, 클라는 받아만 씀.
 */

import type { QuesPose } from '@/components/mascot/types';
import { getSupabase, onAuthStateChange } from '@/lib/supabase';

const STORAGE_KEY = 'questdp.profile.v1';
const TAG_RE = /^Q-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/** 아바타로 선택 가능한 Ques 포즈 (전체 8종 그대로 노출). */
export const AVATAR_POSES: ReadonlyArray<QuesPose> = [
  'happy',
  'wave',
  'celebrate',
  'lightbulb',
  'think',
  'idle',
  'sleep',
  'sad',
];

export const DEFAULT_AVATAR_POSE: QuesPose = 'wave';

export interface MyProfile {
  /** 친구 추가용 고유 태그 — `Q-XXXX-XXXX`. */
  tag: string;
  /** 표시 이름 — 사용자가 변경 가능. 기본값은 태그 그대로. */
  displayName: string;
  /** 아바타 포즈 — Ques 마스코트의 표정/포즈. */
  avatarPose: QuesPose;
  createdAt: number;
}

interface StoredProfile {
  v: 1;
  tag: string;
  displayName: string;
  avatarPose?: QuesPose;
  createdAt: number;
}

/** 8글자 알파벳·숫자 (혼동 글자 O/0/I/1 제외) 4-4 형식. */
function generateTag(): string {
  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ambiguous 글자 제거
  const pick = () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  let a = '';
  let b = '';
  for (let i = 0; i < 4; i++) {
    a += pick();
    b += pick();
  }
  return `Q-${a}-${b}`;
}

function loadStored(): StoredProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as StoredProfile;
    if (obj?.v !== 1 || typeof obj.tag !== 'string') return null;
    if (!TAG_RE.test(obj.tag)) return null;
    return obj;
  } catch {
    return null;
  }
}

function saveStored(p: StoredProfile) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* quota / private mode — 무시. */
  }
}

/**
 * 내 프로필을 가져온다. 없으면 생성. 항상 동일한 태그를 돌려줌.
 *
 * Supabase 마이그레이션 후: 이 함수만 `select * from profiles where id = auth.uid()`
 * 로 교체하면 됨. 로컬 캐시는 ETag 처럼 활용.
 */
export function getMyProfile(): MyProfile {
  const stored = loadStored();
  if (stored) {
    return {
      tag: stored.tag,
      displayName: stored.displayName || stored.tag,
      avatarPose: stored.avatarPose ?? DEFAULT_AVATAR_POSE,
      createdAt: stored.createdAt,
    };
  }
  const fresh: StoredProfile = {
    v: 1,
    tag: generateTag(),
    displayName: '',
    avatarPose: DEFAULT_AVATAR_POSE,
    createdAt: Date.now(),
  };
  saveStored(fresh);
  return {
    tag: fresh.tag,
    displayName: fresh.displayName || fresh.tag,
    avatarPose: fresh.avatarPose ?? DEFAULT_AVATAR_POSE,
    createdAt: fresh.createdAt,
  };
}

/** 표시 이름 변경. 빈 문자열이면 태그를 사용. */
export function setDisplayName(name: string) {
  const stored = loadStored();
  if (!stored) return;
  saveStored({ ...stored, displayName: name.trim() });
  notify();
  // 서버 동기화 (인증돼 있을 때만, fire-and-forget)
  void pushToSupabase({ display_name: name.trim() });
}

/** 아바타 포즈 변경. */
export function setAvatarPose(pose: QuesPose) {
  const stored = loadStored();
  if (!stored) return;
  saveStored({ ...stored, avatarPose: pose });
  notify();
  void pushToSupabase({ avatar_pose: pose });
}

/** 입력값이 유효한 태그 형식인지. */
export function isValidTag(tag: string): boolean {
  return TAG_RE.test(tag.trim().toUpperCase());
}

/** 정규화 — 대문자, 양끝 공백 제거. */
export function normalizeTag(tag: string): string {
  return tag.trim().toUpperCase();
}

// ── 변경 알림 (간단 pub/sub — 친구 페이지에서 displayName 변경 즉시 반영) ──

const listeners = new Set<() => void>();

export function subscribeProfile(cb: () => void): () => void {
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

/** 서버 프로필을 fetch 해 localStorage 에 덮어씌움. 인증돼 있을 때만. */
async function pullFromSupabase(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) return;
  const { data, error } = await sb
    .from('profiles')
    .select('tag, display_name, avatar_pose, created_at')
    .eq('id', sess.session.user.id)
    .maybeSingle();
  if (error || !data) return;
  // 서버 응답 → localStorage 덮어쓰기
  const local = loadStored();
  saveStored({
    v: 1,
    tag: data.tag,
    displayName: data.display_name ?? '',
    avatarPose: (data.avatar_pose as QuesPose) ?? DEFAULT_AVATAR_POSE,
    createdAt: local?.createdAt ?? Date.parse(data.created_at) ?? Date.now(),
  });
  notify();
}

/** 부분 업데이트를 server 에 PATCH (인증돼 있을 때만). 실패해도 무시. */
async function pushToSupabase(patch: {
  display_name?: string;
  avatar_pose?: QuesPose;
}): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data: sess } = await sb.auth.getSession();
    if (!sess.session) return;
    await sb
      .from('profiles')
      .update(patch)
      .eq('id', sess.session.user.id);
  } catch {
    /* 오프라인·일시적 오류 — localStorage 는 이미 update 됐으니 다음 pull 에 정리. */
  }
}

let _syncStarted = false;

/**
 * 앱 mount 시 한 번 호출. auth 상태 구독 → 로그인 시 server 프로필 hydrate,
 * 로그아웃 시 캐시 그대로 (게스트 모드 전환).
 */
export function initProfileSync(): () => void {
  if (_syncStarted) return () => {};
  _syncStarted = true;

  // 즉시 한 번 pull (이미 세션 있을 수 있음)
  void pullFromSupabase();

  const unsub = onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
      void pullFromSupabase();
    }
    // SIGNED_OUT 시엔 localStorage 그대로 — 다음 로그인 때 다시 hydrate.
  });

  return () => {
    unsub();
    _syncStarted = false;
  };
}

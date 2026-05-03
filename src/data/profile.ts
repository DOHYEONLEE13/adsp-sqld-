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

import { useSyncExternalStore } from 'react';
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
  /**
   * 친구 추가용 고유 태그 — `Q-XXXX-XXXX` 형식.
   *
   * **server-issued 식별자만**. `on_auth_user_created()` trigger 가 RPC
   * `generate_unique_tag()` 로 발급. 클라이언트가 임의 생성 X.
   *
   * 빈 문자열 (`''`) 인 경우:
   *   - 게스트 (미인증) — 친구 시스템 사용 불가
   *   - 인증됐지만 server pull 미완료 (pendingServerSync=true)
   *
   * UI 는 `tag === ''` 일 때 친구 기능 / 태그 노출을 스킵해야 함.
   */
  tag: string;
  /** 표시 이름 — 사용자가 닉네임 onboarding 또는 프로필 페이지에서 설정. */
  displayName: string;
  /** 아바타 포즈 — Ques 마스코트의 표정/포즈. */
  avatarPose: QuesPose;
  /**
   * Supabase 인증 상태. 게스트 = false. server tag·친구 시스템·결제 UI 의
   * 1차 게이트로 사용.
   */
  isAuthenticated: boolean;
  /** 운영자 권한. server 의 profiles.role 동기화. 게스트는 항상 false. */
  isAdmin: boolean;
  createdAt: number;
  /**
   * 인증된 상태에서 server pull 이 아직 완료 안 됨 (혹은 실패) 표시.
   * UI 는 이 플래그가 true 면 tag/displayName 노출 금지 — skeleton 으로 대체.
   *
   * 게스트는 항상 false (sync 자체가 없음). 게스트 vs auth-pending 구분이
   * 필요하면 isAuthenticated 와 함께 사용.
   */
  pendingServerSync: boolean;
  /**
   * 마지막 server pull 의 결과:
   *  - 'idle': 아직 시도 안 함 (게스트 또는 mount 직후)
   *  - 'pending': retry 중
   *  - 'ok': 성공 — server 데이터로 덮어쓰임
   *  - 'failed': 5회 retry 모두 실패 — fallback UX 노출
   */
  syncStatus: 'idle' | 'pending' | 'ok' | 'failed';
}

interface StoredProfile {
  v: 1;
  tag: string;
  displayName: string;
  avatarPose?: QuesPose;
  /** 'user' | 'admin' — server 에서 동기화. 미설정 시 'user'. */
  role?: 'user' | 'admin';
  createdAt: number;
}

// generateTag() (이전 client-generated 태그) 제거됨 (2026-05-04).
// tag 는 오직 server RPC `generate_unique_tag()` 가 trigger 시점에 발급.
// 게스트는 tag 가 없는 상태로 동작 — 친구 기능 비활성, 닉네임만 가능.

function loadStored(): StoredProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as StoredProfile;
    if (obj?.v !== 1 || typeof obj.tag !== 'string') return null;
    // tag 는 빈 문자열 (게스트) 또는 Q-XXXX-XXXX (server-issued) 둘 중 하나.
    // legacy guest tag (이전 버전이 client-generated 한 Q-XXXX-XXXX) 도
    // localStorage 에 그대로 남아있을 수 있지만, getMyProfile() 가 미인증
    // 시 tag='' 로 강제 → 노출 안 됨.
    if (obj.tag !== '' && !TAG_RE.test(obj.tag)) return null;
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

// ─── Auth 상태 + sync 상태 (메모리 캐시) ────────────────────────────
//
// pendingServerSync 의 진실 = 인증 상태 × syncStatus.
// useMyProfile 이 호출될 때마다 함수형으로 계산.

let _isAuthenticated = false;
let _syncStatus: 'idle' | 'pending' | 'ok' | 'failed' = 'idle';

/** 외부 (initProfileSync) 가 인증 상태 변경 시 호출. */
function setAuthState(authed: boolean): void {
  _isAuthenticated = authed;
  if (!authed) _syncStatus = 'idle';
  notify();
}

function setSyncStatus(s: 'idle' | 'pending' | 'ok' | 'failed'): void {
  _syncStatus = s;
  notify();
}

/**
 * 내 프로필을 가져온다. tag 는 server-issued 만 노출 — guest 는 tag='' 로 강제.
 *
 * 가드:
 *  - 게스트: tag 항상 ''. displayName 은 localStorage 에 따로 저장된 값
 *    (NicknameOnboarding 으로 설정 가능). 친구 시스템·태그 공유는 비활성.
 *  - 인증 + sync 미완료: tag/displayName='' + pendingServerSync=true.
 *  - 인증 + sync 'ok': server 의 tag·displayName 노출.
 */
export function getMyProfile(): MyProfile {
  const stored = loadStored();

  // 게스트 (미인증) — tag 절대 노출 X. displayName 은 stored 가 있으면 그대로.
  if (!_isAuthenticated) {
    return {
      tag: '',
      displayName: stored?.displayName ?? '',
      avatarPose: stored?.avatarPose ?? DEFAULT_AVATAR_POSE,
      isAuthenticated: false,
      isAdmin: false,
      createdAt: stored?.createdAt ?? 0,
      pendingServerSync: false,
      syncStatus: 'idle',
    };
  }

  // 인증 — server pull 결과 대기 중이면 tag/displayName 빈값 (skeleton)
  const syncDone = _syncStatus === 'ok';
  if (stored) {
    return {
      tag: syncDone ? stored.tag : '',
      displayName: syncDone ? stored.displayName : '',
      avatarPose: stored.avatarPose ?? DEFAULT_AVATAR_POSE,
      isAuthenticated: true,
      isAdmin: stored.role === 'admin',
      createdAt: stored.createdAt,
      pendingServerSync: !syncDone,
      syncStatus: _syncStatus,
    };
  }
  // 인증됐지만 한 번도 pull 안 됨
  return {
    tag: '',
    displayName: '',
    avatarPose: DEFAULT_AVATAR_POSE,
    isAuthenticated: true,
    isAdmin: false,
    createdAt: 0,
    pendingServerSync: true,
    syncStatus: _syncStatus,
  };
}

/**
 * 표시 이름 변경. NicknameOnboarding · FriendsPage 의 닉네임 설정에 사용.
 *
 * 가드:
 *  - 인증 + syncStatus != 'ok' → 차단 (의도와 다른 row 에 push 위험).
 *  - 게스트 + stored 없음 → 임시 stored 자동 생성 (tag='' 유지).
 *  - 인증 + stored 없음 → no-stored 에러 (sync 후 재시도).
 */
export function setDisplayName(name: string): { ok: boolean; reason?: string } {
  if (_isAuthenticated && _syncStatus !== 'ok') {
    return { ok: false, reason: 'sync-not-ready' };
  }
  const trimmed = name.trim();
  const stored = loadStored();
  if (!stored) {
    // 게스트 첫 닉네임 설정 — minimal stored 자동 생성. tag 는 빈값 유지.
    if (!_isAuthenticated) {
      saveStored({
        v: 1,
        tag: '',
        displayName: trimmed,
        avatarPose: DEFAULT_AVATAR_POSE,
        createdAt: Date.now(),
      });
      notify();
      return { ok: true };
    }
    return { ok: false, reason: 'no-stored' };
  }
  saveStored({ ...stored, displayName: trimmed });
  notify();
  // 서버 동기화 — 인증된 사용자 한정 (게스트는 push 대상 X).
  if (_isAuthenticated) {
    void pushToSupabase({ display_name: trimmed });
  }
  return { ok: true };
}

/** 아바타 포즈 변경. setDisplayName 과 동일 가드. */
export function setAvatarPose(pose: QuesPose): { ok: boolean; reason?: string } {
  if (_isAuthenticated && _syncStatus !== 'ok') {
    return { ok: false, reason: 'sync-not-ready' };
  }
  const stored = loadStored();
  if (!stored) {
    if (!_isAuthenticated) {
      saveStored({
        v: 1,
        tag: '',
        displayName: '',
        avatarPose: pose,
        createdAt: Date.now(),
      });
      notify();
      return { ok: true };
    }
    return { ok: false, reason: 'no-stored' };
  }
  saveStored({ ...stored, avatarPose: pose });
  notify();
  if (_isAuthenticated) {
    void pushToSupabase({ avatar_pose: pose });
  }
  return { ok: true };
}

/** 입력값이 유효한 태그 형식인지. */
export function isValidTag(tag: string): boolean {
  return TAG_RE.test(tag.trim().toUpperCase());
}

/** 정규화 — 대문자, 양끝 공백 제거. */
export function normalizeTag(tag: string): string {
  return tag.trim().toUpperCase();
}

/**
 * 사용자 입력을 `Q-XXXX-XXXX` 포맷으로 자동 정형. 친구 추가 input 의 onChange 에서 호출.
 *
 *  - 영문/숫자만 남기고 대문자화
 *  - 첫 글자가 Q 면 Q + 다음 글자들로 분할 (Q-XXXX-XXXX)
 *  - 첫 글자가 Q 가 아니면 자동 prepend
 *  - 8자리 (Q 다음) 까지 자동 dash 삽입
 *  - 9자리 이상 입력 시 잘라내기 (10 char total — Q + 8 + 2 dashes)
 *
 * 예) "qabcd1234" → "Q-ABCD-1234"
 *     "abcd1234" → "Q-ABCD-1234"
 *     "Q-ABCD" + 사용자가 "1" 추가 → "Q-ABCD-1"
 */
export function formatTagInput(raw: string): string {
  // 1) 영문/숫자만 남기고 대문자
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length === 0) return '';

  // 2) Q prefix 보장
  const body = cleaned.startsWith('Q') ? cleaned.slice(1) : cleaned;
  const truncated = body.slice(0, 8); // Q 뒤 8자리 한정

  // 3) dash 삽입
  if (truncated.length === 0) return 'Q-';
  if (truncated.length <= 4) return `Q-${truncated}`;
  return `Q-${truncated.slice(0, 4)}-${truncated.slice(4)}`;
}

// ── 변경 알림 (간단 pub/sub — 친구 페이지에서 displayName 변경 즉시 반영) ──

const listeners = new Set<() => void>();

export function subscribeProfile(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * useSyncExternalStore 가 reference equality 로 비교하므로
 * 매 호출마다 새 객체를 반환하면 무한 렌더가 발생.
 * 캐시된 snapshot 을 유지하고 notify 가 호출될 때만 무효화한다.
 */
let cachedSnapshot: MyProfile | null = null;
function profileSnapshot(): MyProfile {
  if (cachedSnapshot === null) cachedSnapshot = getMyProfile();
  return cachedSnapshot;
}

/**
 * React 훅 — `getMyProfile()` 결과를 구독해 변경 시 자동 re-render.
 * `useSyncExternalStore` 기반 (storage·friends·useProgress 와 동일 패턴).
 */
export function useMyProfile(): MyProfile {
  return useSyncExternalStore(
    subscribeProfile,
    profileSnapshot,
    profileSnapshot,
  );
}

function notify() {
  // 캐시 무효화 — 다음 snapshot 호출에서 fresh 객체 생성
  cachedSnapshot = null;
  for (const cb of listeners) {
    try {
      cb();
    } catch {
      /* 무시 */
    }
  }
}

// ─── Supabase sync layer ────────────────────────────────────────────────

/**
 * 서버 프로필을 fetch 해 localStorage 에 덮어씌움. 인증돼 있을 때만.
 *
 * 5회 retry (지수 backoff: 350ms·700ms·1500ms·3000ms·6000ms · 총 ~11.5초)
 * — 트리거 race / 네트워크 일시 실패 모두 흡수.
 *
 * 모두 실패 시 syncStatus='failed' 로 전환 → UI 가 fallback (재시도 버튼) 노출.
 */
const RETRY_DELAYS_MS = [350, 700, 1500, 3000, 6000];

async function pullFromSupabase(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) {
    setAuthState(false);
    return;
  }
  setAuthState(true);
  setSyncStatus('pending');

  const fetchOnce = () =>
    sb
      .from('profiles')
      .select('tag, display_name, avatar_pose, role, created_at')
      .eq('id', sess.session!.user.id)
      .maybeSingle();

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const { data, error } = await fetchOnce();
    if (!error && data) {
      // 성공 — localStorage 덮어쓰기
      const local = loadStored();
      const role: 'user' | 'admin' =
        data.role === 'admin' ? 'admin' : 'user';
      saveStored({
        v: 1,
        tag: data.tag,
        displayName: data.display_name ?? '',
        avatarPose: (data.avatar_pose as QuesPose) ?? DEFAULT_AVATAR_POSE,
        role,
        createdAt:
          local?.createdAt ?? Date.parse(data.created_at) ?? Date.now(),
      });
      setSyncStatus('ok');
      return;
    }
    // 실패 — 다음 retry 까지 대기 (마지막 시도는 대기 X)
    if (attempt < RETRY_DELAYS_MS.length) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
    }
  }

  // 모든 retry 실패
  setSyncStatus('failed');
}

/** 외부 (UI 의 [재시도] 버튼) 에서 수동 트리거. */
export async function retryProfileSync(): Promise<void> {
  await pullFromSupabase();
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
 *
 * 추가 트리거 (PR-6):
 *  - window.online: 네트워크 복귀 시 syncStatus='failed' 면 재시도
 *  - document.visibilitychange: 탭 다시 보일 때 동일
 */
export function initProfileSync(): () => void {
  if (_syncStarted) return () => {};
  _syncStarted = true;

  // 즉시 한 번 pull (이미 세션 있을 수 있음)
  void pullFromSupabase();

  const unsub = onAuthStateChange((event, session) => {
    // ⚠️ 핵심 — 모든 auth 이벤트에서 _isAuthenticated 를 즉시 session 존재
    // 여부로 동기화. pullFromSupabase 의 race / 네트워크 지연으로 stale 상태가
    // 되어 UI 가 "로그인 후에도 게스트" 로 표시되던 버그 fix.
    const sessionExists = !!session;
    if (sessionExists !== _isAuthenticated) {
      setAuthState(sessionExists);
    }

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
      void pullFromSupabase();
    }
    if (event === 'SIGNED_OUT') {
      setAuthState(false);
      // 다른 계정으로 로그인할 수 있으니 stale 식별 캐시 비움.
      // 다음 로그인 시 server pull 로 새 프로필이 들어옴. 게스트로만 쓰는 경우엔
      // 빈 프로필 + 새 태그 자동 발급 로직이 그대로 작동.
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } catch { /* 무시 */ }
      // 메모리 cached snapshot 무효화
      cachedSnapshot = null;
      for (const cb of listeners) cb();
    }
  });

  // 네트워크 복귀·탭 가시화 시 실패 상태면 재시도
  const onRecover = () => {
    if (_syncStatus === 'failed') void pullFromSupabase();
  };
  const onVisibility = () => {
    if (document.visibilityState === 'visible' && _syncStatus !== 'ok') {
      void pullFromSupabase();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('online', onRecover);
    document.addEventListener('visibilitychange', onVisibility);
  }

  return () => {
    unsub();
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', onRecover);
      document.removeEventListener('visibilitychange', onVisibility);
    }
    _syncStarted = false;
  };
}

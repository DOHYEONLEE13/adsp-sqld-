/**
 * stepUnlocks.ts — 로드맵 step 잠금 상태.
 *
 * 정책:
 *  - 게스트(미로그인): step 0 만 default unlocked. 이전 step 풀어야 다음 해금.
 *    진행도는 localStorage 에 저장 (서버 sync X).
 *  - 인증 무료: 각 lesson 의 step 0 만 default unlocked. step N (N≥1) 은
 *    `step_unlocks` 테이블에 row 가 있어야 unlocked.
 *  - 인증 프리미엄 / 어드민: 모든 step 항상 unlocked (enforced=false).
 *  - 자동 해금: 사용자가 step N 에 진입(visit) 하면 즉시 step N+1 을
 *    인증=`unlock_step` RPC, 게스트=localStorage 에 등록.
 *
 * step_key 컨벤션: `{lessonId}-s{stepIdx}` (예: `adsp-1-1-s2`).
 */

import { useSyncExternalStore } from 'react';
import {
  getSupabase,
  isSupabaseConfigured,
  onAuthStateChange,
} from '@/lib/supabase';
import { waitForSession } from '@/lib/auth/waitForSession';

export function stepKey(lessonId: string, stepIdx: number): string {
  return `${lessonId}-s${stepIdx}`;
}

export interface StepLockSnapshot {
  /** 인증돼 있고 무료 사용자인지 (게스트/프리미엄은 lock 자체 미적용). */
  enforced: boolean;
  /** 서버에서 받은 unlocked step_key 집합. */
  unlockedSet: Set<string>;
}

// 게스트(미로그인) 도 step 0 만 default unlocked → 잠금 enforce.
// localStorage 기반 진행도 추적 (보안 X 지만 가입 friction 효과).
const GUEST_UNLOCKS_KEY = 'questdp.stepUnlocks.guest.v1';

function loadGuestUnlocks(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(GUEST_UNLOCKS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr.filter((x): x is string => typeof x === 'string'));
  } catch {
    /* 무시 */
  }
  return new Set();
}

function saveGuestUnlocks(set: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GUEST_UNLOCKS_KEY, JSON.stringify([...set]));
  } catch {
    /* 무시 */
  }
}

/** 게스트 (서버 sync X) 도 enforced=true → step 0 외엔 진행도 추적 필요. */
function defaultGuestSnapshot(): StepLockSnapshot {
  return { enforced: true, unlockedSet: loadGuestUnlocks() };
}

const DEFAULT: StepLockSnapshot = defaultGuestSnapshot();

let _state: StepLockSnapshot = DEFAULT;
const _listeners = new Set<() => void>();

let _cachedSnapshot: StepLockSnapshot | null = null;
function stepUnlocksSnapshot(): StepLockSnapshot {
  if (_cachedSnapshot === null) _cachedSnapshot = _state;
  return _cachedSnapshot;
}

function subscribeStepUnlocks(cb: () => void): () => void {
  _listeners.add(cb);
  return () => {
    _listeners.delete(cb);
  };
}

function notify() {
  _cachedSnapshot = null;
  for (const l of _listeners) {
    try {
      l();
    } catch {
      /* 무시 */
    }
  }
}

function setState(next: StepLockSnapshot) {
  _state = next;
  notify();
}

// 마지막으로 인증된 사용자가 admin 이었는지 (dev unlock 토글 게이트용).
let _lastIsAdmin = false;
export function isLastSessionAdmin(): boolean {
  return _lastIsAdmin;
}

function isFutureOrLifetime(iso: unknown): boolean {
  if (iso == null) return true;
  if (typeof iso !== 'string') return false;
  const t = Date.parse(iso);
  return Number.isFinite(t) && t > Date.now();
}

async function hasActivePremiumGrant(userId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  const { data, error } = await sb
    .from('premium_grants')
    .select('id')
    .eq('user_id', userId)
    .is('revoked_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .limit(1);

  if (error || !data) return false;
  return data.length > 0;
}

async function pull(): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    // env 미설정 = 게스트 처리 (localStorage 기반 진행도)
    _lastIsAdmin = false;
    setState(defaultGuestSnapshot());
    return;
  }
  // 2026-05-07 hydration race fix: waitForSession() 으로 cold cache hydration 대기.
  const session = await waitForSession();
  if (!session) {
    // 미로그인 또는 hydration timeout = 게스트
    _lastIsAdmin = false;
    setState(defaultGuestSnapshot());
    return;
  }

  // 프리미엄 또는 어드민이면 enforce X (운영자 검수 + 결제 사용자는 자유)
  const { data: prof } = await sb
    .from('profiles')
    .select('is_premium, premium_until, role')
    .eq('id', session.user.id)
    .maybeSingle();
  const isAdmin = (prof as { role?: string } | null)?.role === 'admin';
  _lastIsAdmin = isAdmin;
  const profilePremium =
    !!prof?.is_premium &&
    isFutureOrLifetime((prof as { premium_until?: unknown } | null)?.premium_until);
  const grantPremium = profilePremium
    ? false
    : await hasActivePremiumGrant(session.user.id);
  if (profilePremium || grantPremium || isAdmin) {
    setState({ enforced: false, unlockedSet: new Set() });
    return;
  }

  const { data, error } = await sb
    .from('step_unlocks')
    .select('step_key');
  if (error || !data) {
    setState({ enforced: true, unlockedSet: new Set() });
    return;
  }
  const set = new Set<string>();
  for (const row of data as Array<{ step_key: string }>) {
    set.add(row.step_key);
  }
  setState({ enforced: true, unlockedSet: set });
}

let _channelUnsub: (() => void) | null = null;
let _syncStarted = false;

function startChannel() {
  const sb = getSupabase();
  if (!sb) return;
  void sb.auth.getSession().then(({ data }) => {
    if (!data.session) return;
    // 2026-05-07 race fix — channel name 에 userId + timestamp suffix.
    // 이전 'my-step-unlocks' 단일 이름은 supabase-js channel registry 에서 같은
    // reference 재사용 → 동시 호출 시 이미 subscribed 된 채널에 .on() 추가 시도 →
    // "cannot add postgres_changes callbacks ... after subscribe()" 에러.
    // unique suffix 로 race 영구 해소.
    const channelName = `my-step-unlocks-${data.session.user.id}-${Date.now()}`;
    const channel = sb
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${data.session.user.id}`,
        },
        () => {
          void pull();
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'step_unlocks',
          filter: `user_id=eq.${data.session.user.id}`,
        },
        (payload) => {
          const key = (payload.new as { step_key?: string } | null)?.step_key;
          if (!key) return;
          const next = new Set(_state.unlockedSet);
          next.add(key);
          setState({ ..._state, unlockedSet: next });
        },
      )
      .subscribe();
    _channelUnsub = () => {
      sb.removeChannel(channel);
    };
  });
}

export async function refreshStepUnlocks(): Promise<void> {
  await pull();
}

/**
 * 재진입 트리거 (1단계 — 2026-05-07 추가):
 *   - SIGNED_IN / INITIAL_SESSION / TOKEN_REFRESHED → re-pull
 *   - window.online → re-pull
 *   - document.visibilitychange → re-pull
 *
 *   사유: realtime UPDATE 가 막히면 is_premium / role 초기값에 stuck.
 *   profile.ts 의 검증된 패턴 복사.
 */
export function initStepUnlocksSync(): () => void {
  if (_syncStarted) return () => {};
  _syncStarted = true;

  void pull().then(() => startChannel());

  const unsubAuth = onAuthStateChange((event) => {
    if (
      event === 'SIGNED_IN' ||
      event === 'INITIAL_SESSION' ||
      event === 'TOKEN_REFRESHED'
    ) {
      void pull().then(() => {
        _channelUnsub?.();
        _channelUnsub = null;
        startChannel();
      });
    }
    if (event === 'SIGNED_OUT') {
      // 게스트 snapshot 새로 읽어 (현재 localStorage 의 unlocked set 반영)
      _lastIsAdmin = false;
      setState(defaultGuestSnapshot());
      _channelUnsub?.();
      _channelUnsub = null;
    }
  });

  const onOnline = () => void pull();
  const onVisibility = () => {
    if (document.visibilityState === 'visible') void pull();
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisibility);
  }

  return () => {
    unsubAuth();
    _channelUnsub?.();
    _channelUnsub = null;
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisibility);
    }
    _syncStarted = false;
  };
}

/**
 * 2026-05-07 race fix — useSyncExternalStore 기반 (profile.useMyProfile 패턴).
 * 기존 useState + useEffect 가 first render ↔ listener 부착 race 로 stale stuck.
 */
export function useStepUnlocks(): StepLockSnapshot {
  return useSyncExternalStore(
    subscribeStepUnlocks,
    stepUnlocksSnapshot,
    stepUnlocksSnapshot,
  );
}

/**
 * 검수용 dev 토글 — localStorage 의 'questdp.dev.unlockAllSteps' 가 '1' 이면
 * 모든 step 자동 unlock. AdminPage 의 "모든 회독 잠금해제(검수)" 버튼으로 set.
 * passes.ts 의 unlockAllPasses 와 짝으로 작동 (pass 잠금 + step 잠금 동시 해제).
 *
 * **권한 게이트**: localStorage 만으로는 일반 사용자가 우회 가능 (DevTools 로
 * 직접 set 가능). 그래서 isLastSessionAdmin() 체크를 추가 — 토글이 켜져 있어도
 * 현재 인증된 사용자가 admin 이 아니면 효과 없음.
 */
export const DEV_UNLOCK_STEPS_KEY = 'questdp.dev.unlockAllSteps';

export function isDevUnlockStepsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  // admin 이 아니면 토글 효과 발휘 안 함 (security gate).
  if (!_lastIsAdmin) return false;
  try {
    return window.localStorage.getItem(DEV_UNLOCK_STEPS_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * step idx 0 은 항상 unlocked. 그 외엔 **이전 step 정답 맞춤** 으로만 결정.
 *
 * 정책 (2026-05-05 변경):
 *   - prevSolved=true (이전 step 의 quiz 를 정답 맞췄거나 review 전용 step) → unlocked
 *   - prevSolved=false → locked
 *   - server step_unlocks 의 row 는 통계 목적으로만 유지. 클라이언트 잠금 결정엔
 *     사용 X. (이전 정책에서 자동 unlock 된 stale 데이터를 무시하기 위함.)
 *
 * `lessonId` 인자는 호환성 유지용 — server unlockedSet lookup 은 더 이상 안 함.
 */
export function isStepLocked(
  snap: StepLockSnapshot,
  _lessonId: string,
  stepIdx: number,
  prevSolved: boolean = true,
): boolean {
  // 검수 모드 — admin 이 dev 토글 ON 했으면 모든 step 강제 unlocked.
  if (isDevUnlockStepsEnabled()) return false;
  // 프리미엄 / 어드민 / env 미설정 = enforce X
  if (!snap.enforced) return false;
  // step 0 은 lesson 진입 시 항상 첫 번째라 default unlocked.
  if (stepIdx === 0) return false;
  // 이전 step 미클리어 = 잠금
  return !prevSolved;
}

/** 로컬 state + (게스트면) localStorage 에 step key 추가. */
function addUnlockedLocally(key: string): void {
  if (_state.unlockedSet.has(key)) return;
  const next = new Set(_state.unlockedSet);
  next.add(key);
  setState({ ..._state, unlockedSet: next });
}

/**
 * step 해금. fire-and-forget.
 * 인증 = `unlock_step` RPC 호출. 게스트 = localStorage 에 추가.
 */
export async function unlockStepOnServer(key: string): Promise<void> {
  if (_state.unlockedSet.has(key)) return;

  // env 미설정 또는 미로그인 = 게스트. localStorage 에만 저장.
  if (!isSupabaseConfigured()) {
    const next = new Set(_state.unlockedSet);
    next.add(key);
    saveGuestUnlocks(next);
    addUnlockedLocally(key);
    return;
  }
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data: sess } = await sb.auth.getSession();
    if (!sess.session) {
      // 게스트 — localStorage 에 추가
      const next = new Set(_state.unlockedSet);
      next.add(key);
      saveGuestUnlocks(next);
      addUnlockedLocally(key);
      return;
    }
    await sb.rpc('unlock_step', { step_key: key });
    // 인증 — 옵티미스틱 로컬 갱신 (realtime 채널이 곧 동일 set 으로 덮어씀)
    addUnlockedLocally(key);
  } catch {
    /* 무시 */
  }
}

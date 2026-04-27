/**
 * stepUnlocks.ts — 로드맵 step 잠금 상태.
 *
 * 정책:
 *  - 게스트(미로그인) · 프리미엄: 모든 step 항상 unlocked.
 *  - 인증 무료: 각 lesson 의 step 0 만 default unlocked. step N (N≥1) 은
 *    `step_unlocks` 테이블에 row 가 있어야 unlocked.
 *  - 자동 해금: 사용자가 step N 에 진입(visit) 하면 즉시 step N+1 을
 *    `unlock_step` RPC 로 등록. 다음 진입 때 자유롭게 풀이.
 *
 * step_key 컨벤션: `{lessonId}-s{stepIdx}` (예: `adsp-1-1-s2`).
 */

import { useEffect, useState } from 'react';
import {
  getSupabase,
  isSupabaseConfigured,
  onAuthStateChange,
} from '@/lib/supabase';

export function stepKey(lessonId: string, stepIdx: number): string {
  return `${lessonId}-s${stepIdx}`;
}

export interface StepLockSnapshot {
  /** 인증돼 있고 무료 사용자인지 (게스트/프리미엄은 lock 자체 미적용). */
  enforced: boolean;
  /** 서버에서 받은 unlocked step_key 집합. */
  unlockedSet: Set<string>;
}

const DEFAULT: StepLockSnapshot = {
  enforced: false,
  unlockedSet: new Set(),
};

let _state: StepLockSnapshot = DEFAULT;
const _listeners = new Set<() => void>();

function notify() {
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

async function pull(): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    setState(DEFAULT);
    return;
  }
  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) {
    setState(DEFAULT);
    return;
  }

  // 프리미엄이면 enforce X
  const { data: prof } = await sb
    .from('profiles')
    .select('is_premium')
    .eq('id', sess.session.user.id)
    .maybeSingle();
  if (prof?.is_premium) {
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
    const channel = sb
      .channel('my-step-unlocks')
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

export function initStepUnlocksSync(): () => void {
  if (_syncStarted) return () => {};
  _syncStarted = true;

  void pull().then(() => startChannel());

  const unsubAuth = onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      void pull().then(() => {
        _channelUnsub?.();
        _channelUnsub = null;
        startChannel();
      });
    }
    if (event === 'SIGNED_OUT') {
      setState(DEFAULT);
      _channelUnsub?.();
      _channelUnsub = null;
    }
  });

  return () => {
    unsubAuth();
    _channelUnsub?.();
    _channelUnsub = null;
    _syncStarted = false;
  };
}

export function useStepUnlocks(): StepLockSnapshot {
  const [snap, setSnap] = useState<StepLockSnapshot>(_state);
  useEffect(() => {
    const cb = () => setSnap(_state);
    _listeners.add(cb);
    return () => {
      _listeners.delete(cb);
    };
  }, []);
  return snap;
}

/** step idx 0 은 항상 unlocked. 그 외엔 enforced + 서버 등록 여부로 결정. */
export function isStepLocked(
  snap: StepLockSnapshot,
  lessonId: string,
  stepIdx: number,
): boolean {
  if (!snap.enforced) return false;
  if (stepIdx === 0) return false;
  return !snap.unlockedSet.has(stepKey(lessonId, stepIdx));
}

/**
 * 서버에 step 해금 RPC. fire-and-forget.
 * 게스트·env 미설정·이미 unlocked = 즉시 return.
 */
export async function unlockStepOnServer(key: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (_state.unlockedSet.has(key)) return;
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data: sess } = await sb.auth.getSession();
    if (!sess.session) return;
    await sb.rpc('unlock_step', { step_key: key });
    // 옵티미스틱 — 로컬 set 도 즉시 반영
    const next = new Set(_state.unlockedSet);
    next.add(key);
    setState({ ..._state, unlockedSet: next });
  } catch {
    /* 무시 */
  }
}

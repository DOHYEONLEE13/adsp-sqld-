/**
 * energy.ts — ⚡ 에너지 상태 + consume 헬퍼.
 *
 * 정책:
 *  - 게스트(미로그인): 무제한 (서버 동기화 안 하니 fair use 제약 X).
 *  - 인증 + 프리미엄: 무제한 (∞ 아이콘 표시).
 *  - 인증 + 무료: 5 에너지 cap, 30분당 +1 자동 충전. 세션 시작 시 1 소모.
 *
 * 서버 RPC `consume_energy` 가 atomic 처리. 클라는 호출 후 결과만 사용.
 */

import { useEffect, useState } from 'react';
import {
  getSupabase,
  isSupabaseConfigured,
  onAuthStateChange,
} from '@/lib/supabase';

export interface EnergyState {
  /** 인증돼 있고 서버 sync 중인지. 게스트면 false. */
  authenticated: boolean;
  /** 프리미엄 — true 면 무제한. */
  isPremium: boolean;
  /** 현재 에너지. 프리미엄이면 999 표시 / 게스트면 5 placeholder. */
  energy: number;
  /** 충전까지 남은 초. */
  energyUpdatedAt: number;
}

const DEFAULT_GUEST: EnergyState = {
  authenticated: false,
  isPremium: false,
  energy: 5,
  energyUpdatedAt: Date.now(),
};

let _state: EnergyState = DEFAULT_GUEST;
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

function setState(next: EnergyState) {
  _state = next;
  notify();
}

/** server 에서 profile 의 energy_count / is_premium 만 fetch. */
async function pullEnergy(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) {
    setState(DEFAULT_GUEST);
    return;
  }
  const { data } = await sb
    .from('profiles')
    .select('energy_count, energy_updated_at, is_premium')
    .eq('id', sess.session.user.id)
    .maybeSingle();
  if (!data) return;
  setState({
    authenticated: true,
    isPremium: !!data.is_premium,
    energy: data.is_premium ? 999 : (data.energy_count ?? 0),
    energyUpdatedAt: data.energy_updated_at
      ? Date.parse(data.energy_updated_at)
      : Date.now(),
  });
}

let _channelUnsub: (() => void) | null = null;
let _syncStarted = false;

function startRealtimeChannel() {
  const sb = getSupabase();
  if (!sb) return;
  void sb.auth.getSession().then(({ data }) => {
    if (!data.session) return;
    const channel = sb
      .channel('my-energy')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${data.session.user.id}`,
        },
        () => {
          void pullEnergy();
        },
      )
      .subscribe();
    _channelUnsub = () => {
      sb.removeChannel(channel);
    };
  });
}

/** mount 시 한 번 호출. SIGNED_IN 시 pull + realtime 채널 attach. */
export function initEnergySync(): () => void {
  if (_syncStarted) return () => {};
  _syncStarted = true;

  void pullEnergy().then(() => {
    startRealtimeChannel();
  });

  const unsubAuth = onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      void pullEnergy().then(() => {
        _channelUnsub?.();
        _channelUnsub = null;
        startRealtimeChannel();
      });
    }
    if (event === 'SIGNED_OUT') {
      setState(DEFAULT_GUEST);
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

/** React hook — useSyncExternalStore 흉내. */
export function useEnergy(): EnergyState {
  const [snap, setSnap] = useState<EnergyState>(_state);
  useEffect(() => {
    const cb = () => setSnap(_state);
    _listeners.add(cb);
    return () => {
      _listeners.delete(cb);
    };
  }, []);
  return snap;
}

export interface ConsumeResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

/**
 * 에너지 차감. 게스트·프리미엄·env 미설정 = 무조건 ok.
 * 무료 인증 사용자만 server RPC 통과해 atomic 차감.
 */
export async function consumeEnergy(amount = 1): Promise<ConsumeResult> {
  if (!isSupabaseConfigured()) {
    return { ok: true, remaining: 999, retryAfterSec: 0 };
  }
  const sb = getSupabase();
  if (!sb) return { ok: true, remaining: 999, retryAfterSec: 0 };

  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) {
    // 게스트 — 무제한
    return { ok: true, remaining: 999, retryAfterSec: 0 };
  }

  try {
    const { data, error } = await sb.rpc('consume_energy', { amount });
    if (error) {
      // 네트워크 오류 시엔 진행 허용 (offline-first)
      console.warn('[energy] consume_energy RPC failed', error.message);
      return { ok: true, remaining: _state.energy, retryAfterSec: 0 };
    }
    const row = (data ?? [])[0] as
      | { ok: boolean; remaining: number; retry_after_sec: number }
      | undefined;
    if (!row) return { ok: true, remaining: _state.energy, retryAfterSec: 0 };

    // 로컬 state 도 즉시 반영 (realtime 보다 빠른 UX)
    setState({
      ..._state,
      energy: row.remaining,
      energyUpdatedAt: Date.now(),
    });

    return {
      ok: row.ok,
      remaining: row.remaining,
      retryAfterSec: row.retry_after_sec,
    };
  } catch (e) {
    console.warn('[energy] exception', e);
    return { ok: true, remaining: _state.energy, retryAfterSec: 0 };
  }
}

/** 충전 분 단위 표기. 1800 → "30분", 600 → "10분". */
export function formatRetryAfter(sec: number): string {
  if (sec <= 0) return '곧';
  if (sec < 60) return `${sec}초`;
  const m = Math.ceil(sec / 60);
  return `${m}분`;
}

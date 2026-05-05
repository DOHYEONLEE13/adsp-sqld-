/**
 * energy.ts — ⚡ 에너지 상태 + consume 헬퍼.
 *
 * 정책:
 *  - 게스트(미로그인): **5 에너지 localStorage 게이트** (가입 인센티브).
 *    30분당 +1 회복. localStorage 라 보안 X 지만 friction 효과는 충분.
 *  - 인증 + 무료: 5 에너지 server cap, 30분당 +1. step 진입 시 1 소모 (per step).
 *  - 인증 + 프리미엄: 무제한 (∞ 아이콘 표시).
 *  - 인증 + 어드민: 무제한 (운영자 검수).
 *
 * 서버 RPC `consume_energy` 가 atomic 처리. 게스트는 localStorage 동일 모방.
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
  /** 어드민 — true 면 무제한 (운영자 검수용). */
  isAdmin: boolean;
  /** 현재 에너지. 프리미엄/어드민이면 999 표시 / 게스트면 5 placeholder. */
  energy: number;
  /**
   * 마지막 갱신 timestamp (ms). 30분 충전 타이머 계산의 기준.
   * nextRegenAt = energyUpdatedAt + 30*60*1000 (energy < cap 인 경우만).
   */
  energyUpdatedAt: number;
}

/**
 * 무제한 모드 — 프리미엄 / 어드민 만 true. 게스트는 5⚡ 게이트 적용.
 * UI 분기에 사용 (EnergyBadge 의 ∞ 표시 vs 카운트다운).
 */
export function isUnlimited(state: EnergyState): boolean {
  return state.isPremium || state.isAdmin;
}

// ─── 게스트용 localStorage 기반 ⚡ store ─────────────────────────
// 보안 X (사용자가 직접 수정 가능) 지만 친구·가입 friction 효과는 충분.
// 인증 시 SIGNED_IN 이벤트가 server pull 로 덮어씀.
const GUEST_KEY = 'questdp.energy.guest.v1';
const CAP = 5;
const REGEN_MS = 30 * 60 * 1000; // 30분

interface GuestEnergy {
  count: number;
  /** 마지막 갱신 timestamp (ms). 30분 회복 계산 기준. */
  updatedAt: number;
}

function loadGuestEnergy(): GuestEnergy {
  if (typeof window === 'undefined') return { count: CAP, updatedAt: Date.now() };
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    if (!raw) return { count: CAP, updatedAt: Date.now() };
    const obj = JSON.parse(raw) as Partial<GuestEnergy>;
    if (typeof obj.count === 'number' && typeof obj.updatedAt === 'number') {
      return {
        count: Math.max(0, Math.min(CAP, obj.count)),
        updatedAt: obj.updatedAt,
      };
    }
  } catch {
    /* 무시 */
  }
  return { count: CAP, updatedAt: Date.now() };
}

function saveGuestEnergy(e: GuestEnergy): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GUEST_KEY, JSON.stringify(e));
  } catch {
    /* 무시 */
  }
}

/** lazy regen — 30분당 +1, cap=5. updatedAt 도 함께 전진. */
function regenGuest(e: GuestEnergy): GuestEnergy {
  if (e.count >= CAP) return e;
  const elapsed = Date.now() - e.updatedAt;
  const gain = Math.floor(elapsed / REGEN_MS);
  if (gain <= 0) return e;
  const next = Math.min(CAP, e.count + gain);
  return {
    count: next,
    updatedAt: e.updatedAt + gain * REGEN_MS,
  };
}

function guestStateFrom(e: GuestEnergy): EnergyState {
  return {
    authenticated: false,
    isPremium: false,
    isAdmin: false,
    energy: e.count,
    energyUpdatedAt: e.updatedAt,
  };
}

const DEFAULT_GUEST: EnergyState = guestStateFrom(loadGuestEnergy());

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

/** server 에서 profile 의 energy_count / is_premium 만 fetch. 게스트면 localStorage. */
async function pullEnergy(): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    // env 미설정 = 게스트 처리 (localStorage)
    const guest = regenGuest(loadGuestEnergy());
    saveGuestEnergy(guest);
    setState(guestStateFrom(guest));
    return;
  }
  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) {
    // 미로그인 = 게스트 (localStorage 게이트)
    const guest = regenGuest(loadGuestEnergy());
    saveGuestEnergy(guest);
    setState(guestStateFrom(guest));
    return;
  }
  const { data } = await sb
    .from('profiles')
    .select('energy_count, energy_updated_at, is_premium, role')
    .eq('id', sess.session.user.id)
    .maybeSingle();
  if (!data) return;
  const isAdmin = (data as { role?: string }).role === 'admin';
  const isPremium = !!data.is_premium;
  setState({
    authenticated: true,
    isPremium,
    isAdmin,
    energy: isPremium || isAdmin ? 999 : (data.energy_count ?? 0),
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
 * 에너지 차감. 프리미엄·어드민 = 무조건 ok (RPC 가 즉시 통과).
 * 무료 인증 사용자 = server RPC 통과해 atomic 차감.
 * 게스트·env 미설정 = localStorage 기반 차감 (가입 인센티브 friction).
 */
function consumeGuest(amount: number): ConsumeResult {
  const cur = regenGuest(loadGuestEnergy());
  if (cur.count < amount) {
    // 부족 — 다음 충전까지 남은 초 계산
    const elapsed = Date.now() - cur.updatedAt;
    const remainingMs = REGEN_MS - (elapsed % REGEN_MS);
    saveGuestEnergy(cur);
    setState(guestStateFrom(cur));
    return {
      ok: false,
      remaining: cur.count,
      retryAfterSec: Math.ceil(remainingMs / 1000),
    };
  }
  const next: GuestEnergy = {
    count: cur.count - amount,
    updatedAt: Date.now(),
  };
  saveGuestEnergy(next);
  setState(guestStateFrom(next));
  return { ok: true, remaining: next.count, retryAfterSec: 0 };
}

export async function consumeEnergy(amount = 1): Promise<ConsumeResult> {
  if (!isSupabaseConfigured()) return consumeGuest(amount);
  const sb = getSupabase();
  if (!sb) return consumeGuest(amount);

  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) {
    // 게스트 — localStorage 기반 차감
    return consumeGuest(amount);
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

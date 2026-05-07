/**
 * energy.ts — ⚡ 에너지 상태 + consume 헬퍼.
 *
 * 정책 (2026-05-07 cap 5 → 10 상향, 광고 보상 추가):
 *  - 게스트(미로그인): **10 에너지 localStorage 게이트** (가입 인센티브).
 *    30분당 +1 회복. localStorage 라 보안 X 지만 friction 효과는 충분.
 *  - 인증 + 무료: 10 에너지 server cap, 30분당 +1. step 진입 시 1 소모 (per step).
 *  - 인증 + 프리미엄: 무제한 (∞ 아이콘 표시).
 *  - 인증 + 어드민: 무제한 (운영자 검수).
 *
 * 광고 보상: 광고 1회 시청 → +5 에너지 (cap 10 까지). 30초 쿨다운.
 *  - 인증 사용자: 서버 RPC `grant_ad_energy` 가 cap·쿨다운 검사 + atomic 차감.
 *  - 게스트: localStorage 기반 동일 동작 모방 (멀티 계정 우회 가능 — 가입 friction 의도).
 *
 * 서버 RPC `consume_energy` / `grant_ad_energy` 가 atomic 처리. 게스트는 localStorage 동일 모방.
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
/** 에너지 최대 보유량 (2026-05-07 5 → 10). 서버 cap 과 일치 — 마이그레이션 0021. */
export const ENERGY_CAP = 10;
/** 광고 1회 보상 — server `grant_ad_energy` 와 일치 (2026-05-07 5→3). */
export const AD_REWARD = 3;
/** 광고 보상 쿨다운 (초) — server `grant_ad_energy` 와 일치. */
export const AD_COOLDOWN_SEC = 30;
/** 광고 일일 한도 — server `grant_ad_energy` 와 일치, KST 자정 리셋 (2026-05-07 3→1). */
export const AD_DAILY_CAP = 1;
const CAP = ENERGY_CAP;
const REGEN_MS = 30 * 60 * 1000; // 30분

interface GuestEnergy {
  count: number;
  /** 마지막 갱신 timestamp (ms). 30분 회복 계산 기준. */
  updatedAt: number;
  /** 마지막 광고 보상 timestamp (ms). 쿨다운 검사 기준. 0 = 보상 받은 적 없음. */
  lastAdAt?: number;
  /** KST 기준 오늘 광고 시청 횟수 (자정 리셋). */
  adViewsToday?: number;
  /** 마지막 광고 시청 KST 날짜 (YYYY-MM-DD). 다른 날이면 adViewsToday 리셋. */
  adViewsDate?: string;
}

/** KST(Asia/Seoul) 의 오늘 날짜 (YYYY-MM-DD) — 게스트 일일 한도 비교 기준. */
function todayKstStr(): string {
  // KST = UTC+9. 'sv-SE' 로케일이 ISO date 와 동일한 YYYY-MM-DD 출력.
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
}

function loadGuestEnergy(): GuestEnergy {
  if (typeof window === 'undefined') return { count: CAP, updatedAt: Date.now() };
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    if (!raw) return { count: CAP, updatedAt: Date.now() };
    const obj = JSON.parse(raw) as Partial<GuestEnergy>;
    if (typeof obj.count === 'number' && typeof obj.updatedAt === 'number') {
      // 2026-05-07 cap 5 → 10 마이그레이션 — 기존 5 이하 게스트는 "선물" 로 cap 까지 끌어올림.
      // 시간이 지나서 자연스럽게 늘어난 것처럼 updatedAt 도 now() 로.
      const upgraded = obj.count <= 5;
      // 일일 카운트 정규화 — date 가 다르면 0 으로 리셋.
      const today = todayKstStr();
      const dateMatches = obj.adViewsDate === today;
      return {
        count: upgraded ? CAP : Math.max(0, Math.min(CAP, obj.count)),
        updatedAt: upgraded ? Date.now() : obj.updatedAt,
        lastAdAt: typeof obj.lastAdAt === 'number' ? obj.lastAdAt : 0,
        adViewsToday:
          dateMatches && typeof obj.adViewsToday === 'number'
            ? Math.max(0, Math.min(AD_DAILY_CAP, obj.adViewsToday))
            : 0,
        adViewsDate: today,
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

/** mount 시 한 번 호출. SIGNED_IN 시 pull + realtime 채널 attach.
 *
 * 재진입 트리거 (1단계 — 2026-05-07 추가):
 *   - SIGNED_IN / INITIAL_SESSION / TOKEN_REFRESHED → re-pull
 *   - window.online (네트워크 복귀) → re-pull
 *   - document.visibilitychange (탭 다시 보일 때) → re-pull
 *
 *   사유: profiles UPDATE realtime 이 permission denied 등으로 막히면 isPremium 이
 *   초기 잘못된 값에 stuck. 다양한 외부 트리거 추가로 무한 대기 방지.
 *   profile.ts 의 검증된 패턴 그대로 복사.
 */
export function initEnergySync(): () => void {
  if (_syncStarted) return () => {};
  _syncStarted = true;

  void pullEnergy().then(() => {
    startRealtimeChannel();
  });

  const unsubAuth = onAuthStateChange((event) => {
    if (
      event === 'SIGNED_IN' ||
      event === 'INITIAL_SESSION' ||
      event === 'TOKEN_REFRESHED'
    ) {
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

  // 네트워크 복귀 / 탭 가시화 시 재pull
  const onOnline = () => void pullEnergy();
  const onVisibility = () => {
    if (document.visibilityState === 'visible') void pullEnergy();
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
  // updatedAt 정책 (서버 RPC consume_energy 와 동일):
  //  - cap (5) 에서 첫 차감 → 새 30분 cycle 시작 (Date.now())
  //  - cap 미만에서 차감 → 기존 cycle 유지 (regenGuest 가 advance 한 updatedAt)
  const newUpdatedAt = cur.count >= CAP ? Date.now() : cur.updatedAt;
  const next: GuestEnergy = {
    count: cur.count - amount,
    updatedAt: newUpdatedAt,
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

// ─── XP → 에너지 상점 (게스트 localStorage 전용 — v1.1 서버 RPC 옵션) ──

export interface PurchaseResult {
  ok: boolean;
  /** 실패 사유. ok=true 면 undefined. */
  reason?: 'cap-overflow' | 'insufficient-xp' | 'invalid';
  /** 성공 시 적립 후 총 에너지. 실패 시 현재 에너지. */
  remaining: number;
}

/**
 * 게스트 (localStorage) — XP 차감 + 에너지 적립 atomic.
 * 인증 사용자도 일단 동일 path (서버 동기화는 v1.1 server RPC 로).
 *
 * 정책:
 *   - cap (10) 초과 시 거부 — "에너지 가득" 안내. (overflow 정책은 단순화 우선.)
 *   - XP 부족 시 거부.
 *
 * 호출측 (EnergyShopModal) 이 미리 잔액 검사 후 호출하지만 race condition 보호용
 * 으로 여기서도 final check.
 */
export function purchaseEnergyWithXp(args: {
  xpCost: number;
  energyAmount: number;
  currentDisplayedXp: number;
}): PurchaseResult {
  const { xpCost, energyAmount, currentDisplayedXp } = args;

  if (xpCost <= 0 || energyAmount <= 0) {
    return { ok: false, reason: 'invalid', remaining: _state.energy };
  }

  // XP 잔액 검사 — currentDisplayedXp 는 호출측이 computePlayerStats 결과 전달.
  if (currentDisplayedXp < xpCost) {
    return { ok: false, reason: 'insufficient-xp', remaining: _state.energy };
  }

  const cur = regenGuest(loadGuestEnergy());
  if (cur.count + energyAmount > CAP) {
    return { ok: false, reason: 'cap-overflow', remaining: cur.count };
  }

  // 에너지 적립 (게스트 storage). 서버 동기화는 v1.1.
  const next: GuestEnergy = {
    ...cur,
    count: cur.count + energyAmount,
    // updatedAt 은 그대로 — 회복 cycle 영향 X.
  };
  saveGuestEnergy(next);
  setState(guestStateFrom(next));

  return { ok: true, remaining: next.count };
}

// ─── 광고 보상 RPC — grant_ad_energy ───────────────────────────────

export interface AdGrantResult {
  ok: boolean;
  /** 실제 적립된 에너지. cap 초과면 0 < granted < AD_REWARD 일 수 있음. */
  granted: number;
  /** 적립 후 총 에너지 (cap 일 수도 있음). */
  remaining: number;
  /**
   * 쿨다운 남은 초. ok=false + retryAfterSec > 0 = 30초 쿨다운 위반.
   * ok=false + retryAfterSec = 0 + viewsToday >= dailyCap = 일일 한도 도달 (다른 안내 필요).
   */
  retryAfterSec: number;
  /** 본 호출 후 KST 오늘 누적 광고 시청 횟수. */
  viewsToday: number;
  /** 일일 한도 (3). */
  dailyCap: number;
}

/** 게스트 — localStorage 기반 광고 보상. 일일 한도 + 30초 쿨다운 + cap 까지 적립. */
function grantAdGuest(): AdGrantResult {
  const cur = regenGuest(loadGuestEnergy());
  const today = todayKstStr();
  const dateMatches = cur.adViewsDate === today;
  const currentViews = dateMatches ? cur.adViewsToday ?? 0 : 0;

  // 일일 한도 도달 — retryAfterSec=0 + viewsToday >= dailyCap 으로 신호.
  if (currentViews >= AD_DAILY_CAP) {
    return {
      ok: false,
      granted: 0,
      remaining: cur.count,
      retryAfterSec: 0,
      viewsToday: currentViews,
      dailyCap: AD_DAILY_CAP,
    };
  }

  // 쿨다운 검사.
  const lastAt = cur.lastAdAt ?? 0;
  const elapsedSec = (Date.now() - lastAt) / 1000;
  if (lastAt > 0 && elapsedSec < AD_COOLDOWN_SEC) {
    return {
      ok: false,
      granted: 0,
      remaining: cur.count,
      retryAfterSec: Math.ceil(AD_COOLDOWN_SEC - elapsedSec),
      viewsToday: currentViews,
      dailyCap: AD_DAILY_CAP,
    };
  }

  // 이미 cap — 보상 0 이지만 ok=true (UX 상 "꽉 찼습니다" 처리). 카운트는 차감.
  if (cur.count >= CAP) {
    const next: GuestEnergy = {
      ...cur,
      lastAdAt: Date.now(),
      adViewsToday: currentViews + 1,
      adViewsDate: today,
    };
    saveGuestEnergy(next);
    setState(guestStateFrom(next));
    return {
      ok: true,
      granted: 0,
      remaining: CAP,
      retryAfterSec: 0,
      viewsToday: currentViews + 1,
      dailyCap: AD_DAILY_CAP,
    };
  }

  const newCount = Math.min(CAP, cur.count + AD_REWARD);
  const granted = newCount - cur.count;
  const next: GuestEnergy = {
    ...cur,
    count: newCount,
    lastAdAt: Date.now(),
    adViewsToday: currentViews + 1,
    adViewsDate: today,
  };
  saveGuestEnergy(next);
  setState(guestStateFrom(next));
  return {
    ok: true,
    granted,
    remaining: newCount,
    retryAfterSec: 0,
    viewsToday: currentViews + 1,
    dailyCap: AD_DAILY_CAP,
  };
}

/**
 * 광고 1회 시청 보상 — +5 에너지 (cap 까지). 30초 쿨다운.
 *
 * 인증 사용자 = 서버 RPC `grant_ad_energy` 호출 (atomic + 쿨다운 검사 server-side).
 * 게스트 = localStorage 동일 모방.
 */
export async function grantAdEnergy(): Promise<AdGrantResult> {
  if (!isSupabaseConfigured()) return grantAdGuest();
  const sb = getSupabase();
  if (!sb) return grantAdGuest();

  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) return grantAdGuest();

  try {
    const { data, error } = await sb.rpc('grant_ad_energy');
    if (error) {
      // 네트워크 오류 — fallback 게스트 path (보상 손실 방지).
      console.warn('[energy] grant_ad_energy RPC failed', error.message);
      return {
        ok: false,
        granted: 0,
        remaining: _state.energy,
        retryAfterSec: 0,
        viewsToday: 0,
        dailyCap: AD_DAILY_CAP,
      };
    }
    const row = (data ?? [])[0] as
      | {
          ok: boolean;
          granted: number;
          remaining: number;
          retry_after_sec: number;
          views_today: number;
          daily_cap: number;
        }
      | undefined;
    if (!row) {
      return {
        ok: false,
        granted: 0,
        remaining: _state.energy,
        retryAfterSec: 0,
        viewsToday: 0,
        dailyCap: AD_DAILY_CAP,
      };
    }
    // 로컬 state 즉시 반영 (realtime 보다 빠른 UX).
    if (row.ok && row.granted > 0) {
      setState({
        ..._state,
        energy: row.remaining,
        energyUpdatedAt: Date.now(),
      });
    }
    return {
      ok: row.ok,
      granted: row.granted,
      remaining: row.remaining,
      retryAfterSec: row.retry_after_sec,
      viewsToday: row.views_today,
      dailyCap: row.daily_cap,
    };
  } catch (e) {
    console.warn('[energy] grant_ad_energy exception', e);
    return {
      ok: false,
      granted: 0,
      remaining: _state.energy,
      retryAfterSec: 0,
      viewsToday: 0,
      dailyCap: AD_DAILY_CAP,
    };
  }
}

// ─── 일일 카운트 prefetch — UI 가 idle 마운트 시 "남은 N/3" 표시용 ────

/** 게스트 — localStorage 기반 일일 카운트 정규화 후 반환. */
function readGuestAdViewsToday(): { viewsToday: number; dailyCap: number } {
  const cur = loadGuestEnergy();
  const today = todayKstStr();
  const dateMatches = cur.adViewsDate === today;
  return {
    viewsToday: dateMatches ? cur.adViewsToday ?? 0 : 0,
    dailyCap: AD_DAILY_CAP,
  };
}

/**
 * KST 오늘 누적 광고 시청 횟수 + daily cap.
 * 인증 사용자 = 서버 RPC `get_ad_views_today`. 게스트 = localStorage.
 */
export async function getAdViewsToday(): Promise<{
  viewsToday: number;
  dailyCap: number;
}> {
  if (!isSupabaseConfigured()) return readGuestAdViewsToday();
  const sb = getSupabase();
  if (!sb) return readGuestAdViewsToday();

  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) return readGuestAdViewsToday();

  try {
    const { data, error } = await sb.rpc('get_ad_views_today');
    if (error) {
      console.warn('[energy] get_ad_views_today RPC failed', error.message);
      return { viewsToday: 0, dailyCap: AD_DAILY_CAP };
    }
    const row = (data ?? [])[0] as
      | { views_today: number; daily_cap: number }
      | undefined;
    if (!row) return { viewsToday: 0, dailyCap: AD_DAILY_CAP };
    return { viewsToday: row.views_today, dailyCap: row.daily_cap };
  } catch (e) {
    console.warn('[energy] get_ad_views_today exception', e);
    return { viewsToday: 0, dailyCap: AD_DAILY_CAP };
  }
}

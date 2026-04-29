/**
 * passSync.ts — Pass Tier + pass_stamps 동기화 (Supabase ↔ 메모리 store).
 *
 * 정책:
 *  - 게스트(미로그인) · env 미설정: 빈 stamp 배열 + tier='bronze' 로 동작 (localStorage X — 서버 기반).
 *  - 인증된 사용자: profiles.pass_tier + pass_stamps 테이블 pull.
 *  - Realtime: pass_stamps INSERT 이벤트 + profiles UPDATE 이벤트 구독으로 즉시 반영.
 *  - 마이그 0013 미적용 환경: 모든 select 가 fail → 게스트와 동일 상태로 graceful degrade.
 *
 * 모듈 패턴은 stepUnlocks.ts 와 동일 — useSyncExternalStore 친화 listener.
 */

import { useEffect, useState } from 'react';
import {
  getSupabase,
  isSupabaseConfigured,
  onAuthStateChange,
} from '@/lib/supabase';
import { computePassTier, pickHigherTier } from './passes';
import {
  PASS_TIER_ORDER,
  type PassStamp,
  type PassTier,
} from '@/types/passes';
import type { Subject } from '@/types/question';
import { getSnapshot as getProgressSnapshot } from './storage';

export interface PassSnapshot {
  /** 인증된 사용자만 stamps/tier 가 의미 있음. 게스트는 false. */
  authed: boolean;
  /** 서버에서 받은 영구 stamp 목록. */
  stamps: PassStamp[];
  /** 현재 tier (서버 기준). */
  tier: PassTier;
}

const DEFAULT: PassSnapshot = {
  authed: false,
  stamps: [],
  tier: 'bronze',
};

let _state: PassSnapshot = DEFAULT;
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

function setState(next: PassSnapshot) {
  _state = next;
  notify();
}

/** 서버에서 stamps + tier 끌어옴. 마이그 미적용·세션 X 시 graceful degrade. */
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

  const userId = sess.session.user.id;

  // tier 는 profiles.pass_tier (마이그 0013 적용 후 컬럼 존재)
  let tier: PassTier = 'bronze';
  try {
    const { data: prof } = await sb
      .from('profiles')
      .select('pass_tier')
      .eq('id', userId)
      .maybeSingle();
    if (prof && typeof (prof as { pass_tier?: string }).pass_tier === 'string') {
      const raw = (prof as { pass_tier: string }).pass_tier;
      if (PASS_TIER_ORDER.includes(raw as PassTier)) {
        tier = raw as PassTier;
      }
    }
  } catch {
    /* 컬럼 미존재 = 마이그 0013 미적용. tier=bronze 유지. */
  }

  // pass_stamps 테이블 (마이그 0013 후 존재)
  let stamps: PassStamp[] = [];
  try {
    const { data, error } = await sb
      .from('pass_stamps')
      .select('subject, chapter, pass_number, achieved_at')
      .eq('user_id', userId);
    if (!error && data) {
      stamps = (data as Array<{
        subject: string;
        chapter: number;
        pass_number: number;
        achieved_at: string;
      }>)
        .filter((r) => r.subject === 'adsp' || r.subject === 'sqld')
        .map((r) => ({
          subject: r.subject as Subject,
          chapter: r.chapter,
          passNumber: r.pass_number,
          achievedAt: r.achieved_at,
        }));
    }
  } catch {
    /* 테이블 미존재 = 마이그 미적용. stamps=[] 유지. */
  }

  setState({ authed: true, stamps, tier });
}

let _channelUnsub: (() => void) | null = null;
let _syncStarted = false;

function startChannel() {
  const sb = getSupabase();
  if (!sb) return;
  void sb.auth.getSession().then(({ data }) => {
    if (!data.session) return;
    const userId = data.session.user.id;
    const channel = sb
      .channel('my-pass-sync')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pass_stamps',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as {
            subject?: string;
            chapter?: number;
            pass_number?: number;
            achieved_at?: string;
          } | null;
          if (!row?.subject || !row.chapter || !row.pass_number) return;
          const newStamp: PassStamp = {
            subject: row.subject as Subject,
            chapter: row.chapter,
            passNumber: row.pass_number,
            achievedAt: row.achieved_at ?? new Date().toISOString(),
          };
          setState({
            ..._state,
            stamps: [..._state.stamps, newStamp],
          });
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const next = (payload.new as { pass_tier?: string } | null)?.pass_tier;
          if (next && PASS_TIER_ORDER.includes(next as PassTier)) {
            setState({ ..._state, tier: next as PassTier });
          }
        },
      )
      .subscribe();
    _channelUnsub = () => {
      sb.removeChannel(channel);
    };
  });
}

/** App 루트에서 한 번만 호출. profile/friends/sessions sync 와 같은 패턴. */
export function initPassSync(): () => void {
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

export function usePassSnapshot(): PassSnapshot {
  const [snap, setSnap] = useState<PassSnapshot>(_state);
  useEffect(() => {
    const cb = () => setSnap(_state);
    _listeners.add(cb);
    return () => {
      _listeners.delete(cb);
    };
  }, []);
  return snap;
}

export function getPassSnapshot(): PassSnapshot {
  return _state;
}

/**
 * 챕터 회독 완료 시도 — 세션 종료 후 호출.
 * 클라이언트는 낙관적 tier 미리보기 + 서버 RPC fire-and-forget.
 *
 * 정책:
 *   - env 미설정·미로그인 = 즉시 return (게스트 모드)
 *   - 마이그 0013 미적용 = RPC 실패 → catch 후 무시 (Tier 도 유지)
 *   - 성공 시 stamp 가 INSERT 이벤트로 channel 통해 자동 반영
 */
export async function tryRecordPassCompletion(
  subject: Subject,
  chapter: number,
  passNumber: number,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data: sess } = await sb.auth.getSession();
    if (!sess.session) return;
    await sb.rpc('record_pass_completion', {
      p_subject: subject,
      p_chapter: chapter,
      p_pass: passNumber,
    });
    // 서버 응답 대신 channel 이 stamp/tier 갱신을 가져옴.
    // 안전장치: 클라 측에서도 tier 미리보기 갱신 시도.
    const sessionsForCalc = getProgressSnapshot()
      .sessions.filter((s) => s.subject !== undefined)
      .map((s) => ({
        subject: s.subject,
        chapter: s.chapter,
        passNumber: s.passNumber ?? 1,
        total: s.total,
        correctCount: s.correctCount,
      }));
    const optimistic = computePassTier(sessionsForCalc, _state.stamps);
    const next = pickHigherTier(_state.tier, optimistic);
    if (next !== _state.tier) {
      setState({ ..._state, tier: next });
    }
  } catch {
    /* 무시 — graceful degrade. */
  }
}

/** 회독 다시 시작 — RPC reset_pass_progress 호출 + 로컬 즉시 초기화. */
export async function resetPassProgress(): Promise<{ ok: boolean }> {
  const sb = getSupabase();
  if (!sb) return { ok: false };
  try {
    const { data: sess } = await sb.auth.getSession();
    if (!sess.session) return { ok: false };
    const { error } = await sb.rpc('reset_pass_progress');
    if (error) return { ok: false };
    setState({ ..._state, stamps: [], tier: 'bronze' });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/**
 * redemption.ts — 초대 코드 사용 클라이언트 helper.
 *
 * 흐름: 사용자가 #/redeem 에서 코드 입력 → `redeemCode(code)` 호출 →
 * Supabase RPC `redeem_code` → premium 활성화 + premium_grants 기록.
 *
 * env 미설정 (게스트 모드) 또는 미로그인 시: 명확한 에러 reason 반환 — UI 가
 * "Google 로그인 후 재시도" 안내 표시.
 */

import { getSupabase } from '@/lib/supabase';

export type RedeemReason =
  | 'unauthenticated'
  | 'not_found'
  | 'expired'
  | 'depleted'
  | 'already_redeemed'
  | 'rpc_error'
  | 'env_missing';

export interface RedeemResult {
  ok: boolean;
  reason: RedeemReason | null;
  /** 'lifetime' 등 — 성공 또는 already_redeemed 일 때 server 가 알려준 tier. */
  grantedTier: 'lifetime' | null;
}

/**
 * 초대 코드를 사용해 premium 을 활성화.
 *
 * - 빈 문자열 / 공백 → not_found
 * - env 미설정 → env_missing (UI 가 "로그인 환경 미설정" 표시)
 * - 미로그인 → unauthenticated
 * - 이미 같은 코드 사용 → ok=true + reason='already_redeemed' (멱등)
 *
 * 호출 후 UI 는 useMyProfile() 이 다음 sync 에 is_premium=true 로 갱신.
 */
export async function redeemCode(rawCode: string): Promise<RedeemResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, reason: 'not_found', grantedTier: null };

  const sb = getSupabase();
  if (!sb) return { ok: false, reason: 'env_missing', grantedTier: null };

  const { data, error } = await sb.rpc('redeem_code', { p_code: code });
  if (error) {
    return { ok: false, reason: 'rpc_error', grantedTier: null };
  }

  // RPC returns table — supabase-js wraps as array of rows
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { ok: false, reason: 'rpc_error', grantedTier: null };

  return {
    ok: row.ok === true,
    reason: (row.reason as RedeemReason | null) ?? null,
    grantedTier: (row.granted_tier as 'lifetime' | null) ?? null,
  };
}

/** UI 메시지 매핑 — reason → 한국어 안내. */
export function redeemReasonMessage(reason: RedeemReason | null, ok: boolean): string {
  if (ok && reason === 'already_redeemed') {
    return '이미 사용한 코드입니다 — premium 이 그대로 유지됩니다.';
  }
  if (ok) return '코드가 적용됐습니다. premium 이 활성화됐어요!';
  switch (reason) {
  case 'unauthenticated':
    return 'Google 로그인 후 다시 시도해 주세요.';
  case 'env_missing':
    return '로그인 환경이 아직 설정되지 않은 모드입니다. 환경 설정 후 다시 시도하세요.';
  case 'not_found':
    return '존재하지 않는 코드입니다. 오타를 확인해 주세요.';
  case 'expired':
    return '만료된 코드입니다.';
  case 'depleted':
    return '사용 가능 횟수가 모두 소진된 코드입니다.';
  case 'rpc_error':
  default:
    return '일시적 오류로 코드를 사용할 수 없습니다. 잠시 후 재시도해 주세요.';
  }
}

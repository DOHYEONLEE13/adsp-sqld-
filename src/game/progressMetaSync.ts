/**
 * progressMetaSync.ts — profiles 의 progress 관련 메타 컬럼 push.
 *
 * 대상 컬럼:
 *  - active_subject ('adsp' | 'sqld' | null)
 *  - last_daily_mission_at (timestamptz)
 *
 * 정책:
 *  - 인증 안 됐으면 no-op (게스트 모드).
 *  - fire-and-forget 이지만 progressSync 의 inflight tracker 로 등록 →
 *    pull 진입 시 await 보장.
 *  - 실패 시 무시. 다음 setter 호출 또는 다음 pull 에 자연 회복.
 */

import { getSupabase } from '@/lib/supabase';
import { waitForSession } from '@/lib/auth/waitForSession';
import { trackPush } from './progressSync';

export interface MetaPatch {
  active_subject?: 'adsp' | 'sqld' | null;
  last_daily_mission_at?: string | null;
}

/**
 * 2026-05-08 race fix — sb.auth.getSession() 직접 사용은 cold cache 시 null 반환 →
 *   silent fail → server 의 lesson_xp 영원히 0 (사용자 client lesson XP 누적은 되지만).
 *   waitForSession() 으로 hydration 대기 후 push.
 */
export async function pushProgressMetaToServer(patch: MetaPatch): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const session = await waitForSession();
  if (!session) return;

  // inflight 등록 — pull 이 race 안 되도록.
  const p: Promise<unknown> = (async () => {
    const { error } = await sb
      .from('profiles')
      .update(patch)
      .eq('id', session.user.id);
    if (error) {
      // eslint-disable-next-line no-console
      console.warn('[progressMetaSync] update failed', { patch, error });
    }
  })();

  await trackPush(p).catch(() => {
    /* 실패 무시 — 다음 setter 호출 시 다시 push */
  });
}

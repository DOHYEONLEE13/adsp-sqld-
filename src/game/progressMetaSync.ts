/**
 * progressMetaSync.ts — profiles 의 progress 관련 메타 컬럼 push.
 *
 * 대상 컬럼:
 *  - active_subject ('adsp' | 'sqld' | null)
 *  - last_daily_mission_at (timestamptz)
 *  - lesson_xp (integer)
 *
 * 정책:
 *  - 인증 안 됐으면 no-op (게스트 모드).
 *  - fire-and-forget 이지만 progressSync 의 inflight tracker 로 등록 →
 *    pull 진입 시 await 보장.
 *  - 실패 시 무시. 다음 setter 호출 또는 다음 pull 에 자연 회복.
 */

import { getSupabase } from '@/lib/supabase';
import { trackPush } from './progressSync';

export interface MetaPatch {
  active_subject?: 'adsp' | 'sqld' | null;
  last_daily_mission_at?: string | null;
  lesson_xp?: number;
}

export async function pushProgressMetaToServer(patch: MetaPatch): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) return;

  // inflight 등록 — pull 이 race 안 되도록. Builder 를 await 하면 진짜 Promise.
  const p: Promise<unknown> = (async () => {
    await sb
      .from('profiles')
      .update(patch)
      .eq('id', sess.session!.user.id);
  })();

  await trackPush(p).catch(() => {
    /* 실패 무시 — 다음 setter 호출 시 다시 push */
  });
}

import { waitForSession } from '@/lib/auth/waitForSession';
import { getSupabase } from '@/lib/supabase';
import { trackPush } from './progressSync';

export interface DailyBonusSyncResult {
  ok: boolean;
  xpAwarded: number;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function toInt(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function claimDailyQuestBonusOnServer(): Promise<DailyBonusSyncResult | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const session = await waitForSession();
  if (!session) return null;

  try {
    const response = (await trackPush(
      Promise.resolve(sb.rpc('claim_daily_quest_bonus')),
    )) as { data: unknown; error: { message: string } | null };

    if (response.error) {
      console.warn(
        '[dailyBonusSync] claim_daily_quest_bonus failed',
        response.error.message,
      );
      return null;
    }

    const payload = asRecord(response.data);
    if (payload.ok !== true) return { ok: false, xpAwarded: 0 };
    return {
      ok: true,
      xpAwarded: Math.max(0, toInt(payload.xpAwarded, 0)),
    };
  } catch (error) {
    console.warn('[dailyBonusSync] claim exception', error);
    return null;
  }
}

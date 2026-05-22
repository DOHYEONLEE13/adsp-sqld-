/**
 * Sends single lesson answers through the server-authoritative RPC path.
 *
 * The browser still updates local progress immediately for responsive UI, but
 * server XP and server question_stats are decided by the v2 answer RPCs.
 */

import { waitForSession } from '@/lib/auth/waitForSession';
import { getSupabase } from '@/lib/supabase';
import { trackPush } from './progressSync';
import type { QuestionStat } from './storage';

export interface LessonAnswerSyncResult {
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

function parseLessonAnswerResult(
  data: unknown,
): LessonAnswerSyncResult | null {
  const payload = asRecord(data);
  if (payload.ok !== true) {
    return Object.prototype.hasOwnProperty.call(payload, 'ok')
      ? { xpAwarded: 0 }
      : null;
  }
  return {
    xpAwarded: Math.max(0, toInt(payload.xpAwarded, 0)),
  };
}

export async function pushQuestionStatToServer(
  questionId: string,
  stat: QuestionStat,
  attempt?: {
    correct: boolean;
    selectedIndex?: number;
    sessionToken?: string | null;
    timeMs: number;
    stepKey?: string | null;
  },
): Promise<LessonAnswerSyncResult | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const session = await waitForSession();
    if (!session) return null;
    const rpcName = attempt?.sessionToken
      ? 'submit_lesson_question'
      : typeof attempt?.selectedIndex === 'number'
        ? 'submit_lesson_answer_v2'
        : null;
    if (!rpcName) return null;
    const args =
      rpcName === 'submit_lesson_question'
        ? {
            p_session_token: attempt!.sessionToken,
            p_question_id: questionId,
            p_selected_index: attempt!.selectedIndex ?? -1,
            p_time_ms: attempt?.timeMs ?? stat.lastTimeMs,
            p_step_key: attempt?.stepKey ?? null,
          }
        : {
            p_question_id: questionId,
            p_selected_index: attempt!.selectedIndex,
            p_time_ms: attempt?.timeMs ?? stat.lastTimeMs,
            p_step_key: attempt?.stepKey ?? null,
            p_client_request_id: null,
          };
    const response = (await trackPush(
      Promise.resolve(sb.rpc(rpcName, args)),
    )) as { data: unknown; error: { message: string } | null };
    const { data, error } = response;
    if (error) {
      console.warn(`[questionStatSync] ${rpcName} failed`, error.message);
      return null;
    }
    return parseLessonAnswerResult(data);
  } catch (error) {
    console.warn('[questionStatSync] lesson answer sync exception', error);
    return null;
  }
}

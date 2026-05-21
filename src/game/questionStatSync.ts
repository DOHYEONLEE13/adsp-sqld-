/**
 * Sends single lesson answers through the server-authoritative RPC path.
 *
 * The browser still updates local progress immediately for responsive UI, but
 * server XP and server question_stats are now decided by submit_lesson_answer.
 */

import { waitForSession } from '@/lib/auth/waitForSession';
import { getSupabase } from '@/lib/supabase';
import type { QuestionStat } from './storage';

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
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const session = await waitForSession();
    if (!session) return;
    const rpcName = attempt?.sessionToken
      ? 'submit_lesson_question'
      : typeof attempt?.selectedIndex === 'number'
        ? 'submit_lesson_answer_v2'
        : 'submit_lesson_answer';
    const args =
      rpcName === 'submit_lesson_question'
        ? {
            p_session_token: attempt!.sessionToken,
            p_question_id: questionId,
            p_selected_index: attempt!.selectedIndex ?? -1,
            p_time_ms: attempt?.timeMs ?? stat.lastTimeMs,
            p_step_key: attempt?.stepKey ?? null,
          }
        : rpcName === 'submit_lesson_answer_v2'
        ? {
            p_question_id: questionId,
            p_selected_index: attempt!.selectedIndex,
            p_time_ms: attempt?.timeMs ?? stat.lastTimeMs,
            p_step_key: attempt?.stepKey ?? null,
            p_client_request_id: null,
          }
        : {
            p_question_id: questionId,
            p_correct: attempt?.correct ?? stat.lastCorrect,
            p_time_ms: attempt?.timeMs ?? stat.lastTimeMs,
            p_step_key: attempt?.stepKey ?? null,
          };
    const { error } = await sb.rpc(rpcName, args);
    if (error) {
      console.warn(`[questionStatSync] ${rpcName} failed`, error.message);
    }
  } catch (error) {
    console.warn('[questionStatSync] submit_lesson_answer exception', error);
  }
}

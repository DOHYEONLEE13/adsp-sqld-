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
  attempt?: { correct: boolean; timeMs: number; stepKey?: string | null },
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const session = await waitForSession();
    if (!session) return;
    const { error } = await sb.rpc('submit_lesson_answer', {
      p_question_id: questionId,
      p_correct: attempt?.correct ?? stat.lastCorrect,
      p_time_ms: attempt?.timeMs ?? stat.lastTimeMs,
      p_step_key: attempt?.stepKey ?? null,
    });
    if (error) {
      console.warn('[questionStatSync] submit_lesson_answer failed', error.message);
    }
  } catch (error) {
    console.warn('[questionStatSync] submit_lesson_answer exception', error);
  }
}

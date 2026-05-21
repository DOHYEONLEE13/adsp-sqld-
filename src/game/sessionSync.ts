/**
 * Server sync for completed question sessions.
 *
 * v2 sessions are created by `start_question_session` and completed by
 * `submit_question_session`. Legacy no-token sessions are intentionally not
 * pushed anymore because the old `complete_quest_session` RPC trusted client
 * scoring data.
 */

import type { QuestSummary } from './types';
import { submitReservedQuestionSession } from './serverQuestionSessions';

const LEGACY_OUTBOX_KEY = 'questdp.session_outbox.v1';

function clearLegacyOutbox(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LEGACY_OUTBOX_KEY);
  } catch {
    /* ignore localStorage failures */
  }
}

export async function pushSessionToServer(summary: QuestSummary): Promise<void> {
  if (!summary.sessionToken || summary.serverSubmitted) return;
  try {
    await submitReservedQuestionSession(summary);
  } catch (error) {
    console.warn('[sessionSync] submit_question_session failed', error);
  }
}

export function initSessionSync(): () => void {
  clearLegacyOutbox();
  return () => {};
}

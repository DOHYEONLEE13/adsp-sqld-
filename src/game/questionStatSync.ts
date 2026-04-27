/**
 * questionStatSync.ts — 인라인 레슨 quiz 응답을 server 의 question_stats 에 즉시 반영.
 *
 * 정책:
 *  - 게스트·env 미설정·미로그인: no-op (localStorage 만 누적, 추후 로그인 시 migrate.ts 가 흡수).
 *  - 인증: 매 응답마다 PUT 형태 upsert. 서버는 같은 (user_id, question_id) 의
 *    누적 값으로 덮어씀. 클라가 진실의 근원이라 race condition 없음.
 *  - 실패: 무시. 다음 응답·세션·flush 때 자연 회복.
 */

import { getSupabase } from '@/lib/supabase';
import type { QuestionStat } from './storage';

export async function pushQuestionStatToServer(
  questionId: string,
  stat: QuestionStat,
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data: sess } = await sb.auth.getSession();
    if (!sess.session) return;
    await sb.from('question_stats').upsert(
      {
        user_id: sess.session.user.id,
        question_id: questionId,
        attempts: stat.attempts,
        correct: stat.correct,
        wrong_streak: stat.wrongStreak,
        last_correct: stat.lastCorrect,
        last_seen_at: new Date(stat.lastSeenAt).toISOString(),
        last_time_ms: stat.lastTimeMs,
        avg_time_ms: stat.avgTimeMs,
      },
      { onConflict: 'user_id,question_id' },
    );
  } catch {
    /* 무시 — 다음 답변 시 다시 push */
  }
}

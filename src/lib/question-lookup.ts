/**
 * question-lookup.ts — questionId 로 단일 문제 조회 + 관련 문제 매칭.
 *
 * Tier 2 programmatic SEO 의 quiz 페이지 (`/quiz/:questionId`) 에 사용.
 * 기존 ALL_QUESTIONS · isPlayable 기반 — 존재하는 question 풀 그대로 활용.
 */

import { ALL_QUESTIONS } from '@/lib/questions';
import { isPlayable } from '@/game/session';
import { canonicalTopic } from '@/data/topicAlias';
import type { MultipleChoiceQuestion, Subject } from '@/types/question';

export interface QuestionLookup {
  question: MultipleChoiceQuestion;
  /** 같은 (subject, chapter, canonicalTopic) 의 다른 문제 — internal linking. */
  related: MultipleChoiceQuestion[];
  /** 같은 회차 (예: 2024-46회) 의 다른 문제 — `source` 기반. */
  sameRound: MultipleChoiceQuestion[];
}

/** ALL_QUESTIONS 에서 indexable 한 질문만 캐시 — listAll/findById 재사용. */
let _playableCache: MultipleChoiceQuestion[] | null = null;
function playable(): MultipleChoiceQuestion[] {
  if (_playableCache) return _playableCache;
  _playableCache = ALL_QUESTIONS.filter(isPlayable);
  return _playableCache;
}

/** questionId 로 lookup. 없으면 null. */
export function findQuestionById(questionId: string): QuestionLookup | null {
  const all = playable();
  const q = all.find((x) => x.id === questionId);
  if (!q) return null;

  const canon = canonicalTopic(q.subject, q.chapter, q.topic);
  // 같은 캐노니컬 토픽 — 직접 경쟁 키워드 매칭
  const related = all
    .filter(
      (x) =>
        x.id !== q.id &&
        x.subject === q.subject &&
        x.chapter === q.chapter &&
        canonicalTopic(x.subject, x.chapter, x.topic) === canon,
    )
    .slice(0, 6);

  // 같은 회차 — `source` 매칭 (예: "2024-46회 1번")
  const sameRound: MultipleChoiceQuestion[] = [];
  if (q.source) {
    const round = extractRound(q.source);
    if (round) {
      for (const x of all) {
        if (x.id === q.id) continue;
        if (x.subject !== q.subject) continue;
        if (extractRound(x.source ?? '') === round) {
          sameRound.push(x);
          if (sameRound.length >= 6) break;
        }
      }
    }
  }

  return { question: q, related, sameRound };
}

/** 모든 indexable question 의 ID 배열 — sitemap 생성용. */
export function listAllQuestionIds(): string[] {
  return playable().map((q) => q.id);
}

/** subject 별 카운트 — 통계용. */
export function countQuestionsBySubject(): Record<Subject, number> {
  const out: Record<Subject, number> = { adsp: 0, sqld: 0 };
  for (const q of playable()) out[q.subject]++;
  return out;
}

// `source` 에서 회차 추출. 예: "2024-46회 1번" → "2024-46회"
function extractRound(source: string): string | null {
  const m = source.match(/^(\d{4}-\d+회)/);
  return m ? m[1] : null;
}

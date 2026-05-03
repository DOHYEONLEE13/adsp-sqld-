/**
 * similarQuestions.ts — 개념 학습 후 inline MCQ 답변 시 노출되는 "비슷한 문제 더
 * 풀기" 패널의 후보 풀 추출 로직.
 *
 * 풀 출처:
 *   1순위 — 동일 (subject, chapter, canonicalTopic) 의 다른 playable 문제
 *           (기출 + concept-practice-pass2 + concept-practice 본인 제외)
 *   2순위 — 동일 (subject, chapter) 전체 (1순위 풀이 부족할 때)
 *
 * 정렬: difficulty 차이가 작은 것 우선, 동률은 random shuffle.
 */

import { ALL_QUESTIONS } from '@/lib/questions';
import { canonicalTopic } from '@/data/topicAlias';
import { shuffle } from '@/lib/utils';
import { isPlayable } from './session';
import type { MultipleChoiceQuestion } from '@/types/question';

/** ALL_QUESTIONS 안에서 id 로 1건 찾기. */
function findById(id: string): MultipleChoiceQuestion | undefined {
  for (const q of ALL_QUESTIONS) {
    if (q.id === id && isPlayable(q)) return q;
  }
  return undefined;
}

/** 같은 (subject, chapter, canonicalTopic) 풀 — 본인 제외. */
function sameTopicCandidates(
  current: MultipleChoiceQuestion,
): MultipleChoiceQuestion[] {
  const canon = canonicalTopic(
    current.subject,
    current.chapter,
    current.topic,
  );
  return ALL_QUESTIONS.filter(
    (q): q is MultipleChoiceQuestion =>
      isPlayable(q) &&
      q.id !== current.id &&
      q.subject === current.subject &&
      q.chapter === current.chapter &&
      canonicalTopic(q.subject, q.chapter, q.topic) === canon,
  );
}

/** 같은 chapter 전체 — 본인 + 이미 1순위에서 뽑힌 것 제외. */
function sameChapterCandidates(
  current: MultipleChoiceQuestion,
  exclude: ReadonlySet<string>,
): MultipleChoiceQuestion[] {
  return ALL_QUESTIONS.filter(
    (q): q is MultipleChoiceQuestion =>
      isPlayable(q) &&
      q.id !== current.id &&
      !exclude.has(q.id) &&
      q.subject === current.subject &&
      q.chapter === current.chapter,
  );
}

/** difficulty 차이 가까운 순. 동률은 안정성 위해 0 반환 (sort 가 random shuffle 보존). */
function makeDifficultySorter(target: MultipleChoiceQuestion) {
  const t = target.difficulty ?? 2;
  return (a: MultipleChoiceQuestion, b: MultipleChoiceQuestion) => {
    const da = Math.abs((a.difficulty ?? 2) - t);
    const db = Math.abs((b.difficulty ?? 2) - t);
    return da - db;
  };
}

/**
 * 주어진 quizId 와 같은 토픽의 다른 문제 N개 반환.
 *
 * @param currentQuizId 현재 풀이 중인 문제 id
 * @param count 반환할 최대 개수 (기본 5)
 */
export function findSimilarQuestions(
  currentQuizId: string,
  count: number = 5,
): MultipleChoiceQuestion[] {
  const current = findById(currentQuizId);
  if (!current) return [];

  const sameTopic = sameTopicCandidates(current);
  const sortByDifficulty = makeDifficultySorter(current);

  // 1순위만으로 충분
  if (sameTopic.length >= count) {
    return shuffle(sameTopic).sort(sortByDifficulty).slice(0, count);
  }

  // 2순위 (같은 chapter) 로 보충
  const taken = new Set(sameTopic.map((q) => q.id));
  const sameChapter = sameChapterCandidates(current, taken);
  const need = count - sameTopic.length;
  const filler = shuffle(sameChapter).sort(sortByDifficulty).slice(0, need);

  // 1순위는 difficulty 매칭 후, 보충분은 뒤에 — 사용자가 가까운 것부터 풀게.
  return [
    ...shuffle(sameTopic).sort(sortByDifficulty),
    ...filler,
  ];
}

/**
 * 풀 사이즈만 빠르게 (1순위 동일 토픽 기준).
 * FeedbackSheet 의 "비슷한 문제 더 풀기 (N)" 배지에 사용.
 */
export function countSimilarQuestions(currentQuizId: string): number {
  const current = findById(currentQuizId);
  if (!current) return 0;
  return sameTopicCandidates(current).length;
}

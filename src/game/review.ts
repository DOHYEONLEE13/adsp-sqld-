/**
 * 복습 시스템 — SRS(Spaced Repetition) + 오답 큐 + 약점 믹스.
 *
 * Leitner 박스 5단계로 QuestionStat 을 분류 후,
 * 박스별 간격이 지난 문제를 "due" 로 판단합니다.
 *
 *   Box 0 — 미풀이 or 마지막 오답 → 즉시 due
 *   Box 1 — 1회 이상 정답 → 1일 간격
 *   Box 2 — 3회 이상 정답 → 3일 간격
 *   Box 3 — 6회 이상 정답 → 7일 간격
 *   Box 4 — 10회 이상 정답 → 14일 간격
 *
 * 복습 세션은 due 풀 + 오답 큐 + 약점 높은 문제를 혼합해서 10~15 문항으로 빌드합니다.
 */

import type { MultipleChoiceQuestion, Subject } from '@/types/question';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import { shuffle } from '@/lib/utils';
import { playableQuestions } from './session';
import type { ProgressStore, QuestionStat } from './storage';
import { getSnapshot } from './storage';
import type { QuestSession } from './types';
import { scoreQuestion } from './weakness';

export type LeitnerBox = 0 | 1 | 2 | 3 | 4;

const DAY_MS = 24 * 60 * 60 * 1000;
const INTERVAL_MS: Record<LeitnerBox, number> = {
  0: 0,
  1: 1 * DAY_MS,
  2: 3 * DAY_MS,
  3: 7 * DAY_MS,
  4: 14 * DAY_MS,
};

export function leitnerBox(stat: QuestionStat | undefined): LeitnerBox {
  if (!stat) return 0;
  if (!stat.lastCorrect) return 0;
  if (stat.correct >= 10) return 4;
  if (stat.correct >= 6) return 3;
  if (stat.correct >= 3) return 2;
  return 1;
}

export function intervalForBox(box: LeitnerBox): number {
  return INTERVAL_MS[box];
}

export function isDue(
  stat: QuestionStat | undefined,
  now: number = Date.now(),
): boolean {
  if (!stat) return true;
  const box = leitnerBox(stat);
  const interval = INTERVAL_MS[box];
  return now - stat.lastSeenAt >= interval;
}

export interface DueSlice {
  due: MultipleChoiceQuestion[];
  /** lastCorrect=false 인 문제만 (한 번 틀린 적 있는). */
  wrong: MultipleChoiceQuestion[];
  /** 한 번도 안 푼 새 문제. */
  fresh: MultipleChoiceQuestion[];
  /** 약점 점수 내림차순 TOP. */
  weak: MultipleChoiceQuestion[];
}

/**
 * 과목 풀에서 복습 대상 슬라이스를 뽑습니다.
 * weak 는 점수 상위 50 개. 나머지는 자연스런 필터.
 */
export function sliceReviewPool(
  subject: Subject,
  store: ProgressStore,
  now: number = Date.now(),
): DueSlice {
  const pool = playableQuestions(subject);

  const due: MultipleChoiceQuestion[] = [];
  const wrong: MultipleChoiceQuestion[] = [];
  const fresh: MultipleChoiceQuestion[] = [];

  for (const q of pool) {
    const stat = store.questionStats[q.id];
    if (!stat) {
      fresh.push(q);
      due.push(q);
      continue;
    }
    if (!stat.lastCorrect) wrong.push(q);
    if (isDue(stat, now)) due.push(q);
  }

  // 약점 점수 상위. 최소 1회 이상 시도한 문제만 포함해 의미있는 가중치 확보.
  const weak = [...pool]
    .filter((q) => store.questionStats[q.id])
    .sort(
      (a, b) =>
        scoreQuestion(store.questionStats[b.id], now).score -
        scoreQuestion(store.questionStats[a.id], now).score,
    )
    .slice(0, 50);

  return { due, wrong, fresh, weak };
}

/**
 * 복습 세션용 혼합 풀 — 기본 15문.
 *   wrong 50% + weak 30% + 기타 due 20% 비율로 채우고,
 *   중복 제거 후 셔플.
 */
export function buildReviewMix(
  subject: Subject,
  store: ProgressStore,
  size: number = 15,
  now: number = Date.now(),
): MultipleChoiceQuestion[] {
  const slice = sliceReviewPool(subject, store, now);
  const wrongN = Math.round(size * 0.5);
  const weakN = Math.round(size * 0.3);
  const restN = size - wrongN - weakN;

  const picked = new Map<string, MultipleChoiceQuestion>();
  const push = (q: MultipleChoiceQuestion) => {
    if (!picked.has(q.id)) picked.set(q.id, q);
  };

  // 섞은 뒤 앞에서 n 개.
  const take = (arr: MultipleChoiceQuestion[], n: number) => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    for (const q of shuffled) {
      if (picked.size >= size) break;
      if (picked.has(q.id)) continue;
      push(q);
      if ([...picked.values()].length >= n + picked.size - picked.size) {
        // 단순하게 size 도달까지만 제한 — n 은 희망치이므로 만족 못하면 이월.
      }
    }
  };

  // 1) wrong
  take(slice.wrong.slice(), wrongN);
  // 2) weak (이미 점수순)
  for (const q of slice.weak) {
    if (picked.size >= wrongN + weakN) break;
    push(q);
  }
  // 3) 나머지 due (기타)
  for (const q of slice.due.sort(() => Math.random() - 0.5)) {
    if (picked.size >= wrongN + weakN + restN) break;
    push(q);
  }
  // 여전히 부족하면 fresh 로 보충
  if (picked.size < size) {
    for (const q of slice.fresh.sort(() => Math.random() - 0.5)) {
      if (picked.size >= size) break;
      push(q);
    }
  }

  return [...picked.values()].sort(() => Math.random() - 0.5);
}

/** 선지 순서를 4지선다 범위 내에서 셔플해서 정답 위치를 변경. */
function shuffleChoices(q: MultipleChoiceQuestion): MultipleChoiceQuestion {
  const indices = [0, 1, 2, 3];
  const shuffled = shuffle(indices);
  const choices = shuffled.map((i) => q.choices[i]!);
  const answerIndex = shuffled.indexOf(q.answerIndex);
  return { ...q, choices, answerIndex };
}

/**
 * 복습 세션을 QuestSession 형태로 생성.
 * buildReviewMix 결과 + 선지 셔플 + 레이블 `복습` 을 묶습니다.
 */
export function createReviewSession(
  subject: Subject,
  size: number = 15,
): QuestSession | null {
  const store = getSnapshot();
  const picked = buildReviewMix(subject, store, size);
  if (picked.length === 0) return null;

  const repChapter = picked[0]!.chapter;
  const schema = SUBJECT_SCHEMAS[subject];
  const chapterTitle =
    schema.chapters.find((c) => c.chapter === repChapter)?.title ?? '';

  return {
    subject,
    chapter: repChapter,
    chapterTitle,
    topic: null,
    flow: 'play',
    label: '복습',
    questions: picked.map(shuffleChoices),
    index: 0,
    answers: [],
    startedAt: Date.now(),
  };
}

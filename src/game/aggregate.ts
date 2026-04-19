/**
 * 진행 통계 집계 헬퍼.
 *
 * 저장된 `ProgressStore` + 문제 은행(`ALL_QUESTIONS`)을 교차해서
 * Galaxy / Planet / Zone 화면의 진도 뱃지용 집계를 내보냅니다.
 *
 * 집계는 순수 함수 — 저장소 구독은 상위 컴포넌트에서 `useProgress` 로.
 */

import type { Subject } from '@/types/question';
import { playableQuestions } from './session';
import type { ProgressStore } from './storage';

export interface Aggregate {
  /** 플레이 가능한 총 문항 수. */
  total: number;
  /** 한 번이라도 푼 문항 수. */
  solved: number;
  /** 마지막 시도가 정답이었던 문항 수. */
  mastered: number;
  /** 전체 시도 누적 정답률 (0~1). 시도 없으면 0. */
  accuracy: number;
}

function aggregateFromIds(
  questionIds: readonly string[],
  store: ProgressStore,
): Aggregate {
  let solved = 0;
  let mastered = 0;
  let attempts = 0;
  let correct = 0;
  for (const id of questionIds) {
    const stat = store.questionStats[id];
    if (!stat) continue;
    solved++;
    if (stat.lastCorrect) mastered++;
    attempts += stat.attempts;
    correct += stat.correct;
  }
  return {
    total: questionIds.length,
    solved,
    mastered,
    accuracy: attempts === 0 ? 0 : correct / attempts,
  };
}

/** 과목 단위 집계. */
export function aggregateSubject(
  subject: Subject,
  store: ProgressStore,
): Aggregate {
  const ids = playableQuestions(subject).map((q) => q.id);
  return aggregateFromIds(ids, store);
}

/** 챕터 단위 집계. */
export function aggregateChapter(
  subject: Subject,
  chapter: number,
  store: ProgressStore,
): Aggregate {
  const ids = playableQuestions(subject)
    .filter((q) => q.chapter === chapter)
    .map((q) => q.id);
  return aggregateFromIds(ids, store);
}

/** 토픽 단위 집계. */
export function aggregateTopic(
  subject: Subject,
  chapter: number,
  topic: string,
  store: ProgressStore,
): Aggregate {
  const ids = playableQuestions(subject)
    .filter((q) => q.chapter === chapter && q.topic === topic)
    .map((q) => q.id);
  return aggregateFromIds(ids, store);
}

/** "17 / 42 · 78%" 형태의 간결 라벨. */
export function formatProgressLabel(agg: Aggregate): string {
  if (agg.total === 0) return '—';
  if (agg.solved === 0) return `0 / ${agg.total}`;
  const pct = Math.round(agg.accuracy * 100);
  return `${agg.solved} / ${agg.total} · ${pct}%`;
}

/** solved 비율 (0~1). 진도 바 너비 계산용. */
export function solvedRatio(agg: Aggregate): number {
  if (agg.total === 0) return 0;
  return agg.solved / agg.total;
}

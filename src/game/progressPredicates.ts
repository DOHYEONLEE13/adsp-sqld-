import type { QuestionStat } from './storage';

type SolvableStat = Pick<QuestionStat, 'correct'> | null | undefined;

/**
 * Completion is based on whether the user has ever solved the question.
 * `lastCorrect` is intentionally not part of this check: a later review miss
 * should put the question back into review, but it must not erase completed
 * lesson/roadmap progress.
 */
export function hasEverSolved(stat: SolvableStat): boolean {
  return (stat?.correct ?? 0) > 0;
}

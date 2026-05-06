/**
 * weakChapterRanker — 약점 단원 TOP 3 추출 + improvement_potential 계산.
 *
 * Phase 4 Step 5 (리서치 4-2절):
 *   1. accuracy != null 인 단원만 대상
 *   2. accuracy 낮은 순 정렬
 *   3. improvement_potential = (90 - accuracy*100) × weight
 *      ("90% 정답률 가정 시 점수 상승 예상")
 *   4. TOP N (기본 3) 반환
 */

import {
  CHAPTER_WEIGHTS,
  type ChapterAccuracy,
  CHAPTER_NAMES,
} from './chapterWeights';

/** 약점 단원 1건 (UI 표시용). */
export interface WeakChapterRanking {
  rank: number;
  chapter_id: string;
  chapter_name: string;
  /** 0~1. */
  accuracy: number;
  /** 응시 횟수 (UI 표시용). */
  attempt_count: number;
  /** 단원 가중치. */
  weight: number;
  /** 90% 가정 시 점수 상승 예상 (점). */
  improvement_potential: number;
}

/**
 * 약점 단원 랭킹 — 점수 상승 영향 큰 순.
 *
 * 정렬 기준:
 *   1순위: improvement_potential 내림차순
 *   2순위: accuracy 오름차순 (같은 potential 이면 정답률 더 낮은 것 우선)
 *
 * @param chapterAccuracies - 응시한 모든 chapter (accuracy != null 만 사용)
 * @param topN - 반환 개수 (기본 3)
 */
export function rankWeakChapters(
  chapterAccuracies: readonly ChapterAccuracy[],
  topN = 3,
): WeakChapterRanking[] {
  const ranked: WeakChapterRanking[] = [];

  for (const ca of chapterAccuracies) {
    if (ca.accuracy === null) continue;
    const weight = CHAPTER_WEIGHTS[ca.chapter_id] ?? 0;
    if (weight === 0) continue;
    const accuracyPct = ca.accuracy * 100;
    const improvement_potential = Math.max(
      0,
      (90 - accuracyPct) * weight,
    );
    ranked.push({
      rank: 0, // 정렬 후 부여
      chapter_id: ca.chapter_id,
      chapter_name: CHAPTER_NAMES[ca.chapter_id] ?? ca.chapter_id,
      accuracy: ca.accuracy,
      attempt_count: ca.attempt_count,
      weight,
      improvement_potential,
    });
  }

  ranked.sort((a, b) => {
    if (b.improvement_potential !== a.improvement_potential) {
      return b.improvement_potential - a.improvement_potential;
    }
    return a.accuracy - b.accuracy;
  });

  const top = ranked.slice(0, topN);
  top.forEach((r, i) => {
    r.rank = i + 1;
  });
  return top;
}

/**
 * 미응시 단원 목록 — 데이터 부족 안내용.
 * "현재 학습한 단원 N개 / 필요 M개" 표시 시 활용.
 */
export function unattemptedChapters(
  chapterAccuracies: readonly ChapterAccuracy[],
): ChapterAccuracy[] {
  return chapterAccuracies.filter((ca) => ca.accuracy === null);
}

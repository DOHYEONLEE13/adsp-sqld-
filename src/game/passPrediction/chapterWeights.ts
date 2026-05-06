/**
 * chapterWeights — 단원별 가중치 + 정답률 집계.
 *
 * Phase 4 Step 5 — 합격 예측 점수 산정의 핵심 입력.
 *
 * 가중치 (리서치 4-1절, 변경 금지):
 *   ADsP: 1과목 20% / 2과목 20% / 3과목 60%
 *   SQLD: 1과목 20% / 2과목 80%
 *
 * 정답률 산정:
 *   - chapter_id 의 모든 questionStats 모음
 *   - attempts 합산 < MIN_ATTEMPTS_PER_CHAPTER → accuracy = null (데이터 부족)
 *   - 그 외 → accuracy = (correct 합) / (attempts 합)
 *
 * 데이터 구조 한계 (자율 결정):
 *   기존 questionStats 는 attempt history 가 아닌 누적 카운트 (correct/attempts).
 *   지시서의 "최근 50문항 가중 평균 (10/30/50 zone)" 은 시도 단위 history 필요.
 *   본 step 에서는 단순화: 모든 attempt 동일 가중 + sessions.at 으로 chapter 단위
 *   "최근 활동" 보정.
 *   향후 v1.1 — attempt history 별도 저장 후 정확한 시간 가중 가능.
 */

import { CHAPTER_WEIGHTS } from '@/game/diagnostic/diagnosticPool';
import type { QuestionStat, SessionRecord } from '@/game/storage';
import { getQuestionMetaMap, type QuestionMeta } from '@/game/forgettingCurve/questionMetaCache';

/** 최소 응시 수 — 단원 정답률 신뢰 가능한 임계 (지시서 4-1절). */
export const MIN_ATTEMPTS_PER_CHAPTER = 5;

/** chapter_id → 가중치 표 export. */
export { CHAPTER_WEIGHTS };

/**
 * 단원별 정답률 집계 결과.
 */
export interface ChapterAccuracy {
  chapter_id: string;
  /** 0~1. 응시 < MIN_ATTEMPTS_PER_CHAPTER → null. */
  accuracy: number | null;
  /** 본 chapter 에 대한 응시 횟수 합 (모든 question 의 attempts 합). */
  attempt_count: number;
  /** 본 chapter 에 대한 정답 횟수 합. */
  correct_count: number;
  /** chapter 에 등장한 unique question 수. */
  question_count: number;
  /** 마지막 활동 시점 (questionStats.lastSeenAt 의 max). null = 미학습. */
  last_seen_at: number | null;
}

/**
 * questionStats 를 chapter_id 별로 그룹핑 + 정답률 산정.
 *
 * @param questionStats - ProgressStore.questionStats
 * @param subjectFilter - 'adsp' 또는 'sqld' — 본 시험만 대상
 */
export function aggregateChapterAccuracy(
  questionStats: Record<string, QuestionStat>,
  subjectFilter?: 'adsp' | 'sqld',
): ChapterAccuracy[] {
  const metaMap = getQuestionMetaMap();
  const buckets = new Map<
    string,
    {
      attempts: number;
      correct: number;
      questions: number;
      last_seen: number;
    }
  >();

  for (const [questionId, stat] of Object.entries(questionStats)) {
    const meta = metaMap[questionId];
    if (!meta?.chapter_id) continue;
    if (subjectFilter && meta.subject !== subjectFilter) continue;

    const cur = buckets.get(meta.chapter_id) ?? {
      attempts: 0,
      correct: 0,
      questions: 0,
      last_seen: 0,
    };
    cur.attempts += stat.attempts;
    cur.correct += stat.correct;
    cur.questions += 1;
    if (stat.lastSeenAt > cur.last_seen) cur.last_seen = stat.lastSeenAt;
    buckets.set(meta.chapter_id, cur);
  }

  const result: ChapterAccuracy[] = [];
  for (const [chapter_id, b] of buckets.entries()) {
    const accuracy =
      b.attempts >= MIN_ATTEMPTS_PER_CHAPTER ? b.correct / b.attempts : null;
    result.push({
      chapter_id,
      accuracy,
      attempt_count: b.attempts,
      correct_count: b.correct,
      question_count: b.questions,
      last_seen_at: b.last_seen > 0 ? b.last_seen : null,
    });
  }
  return result;
}

/**
 * 시험에 속한 모든 chapter_id 목록 (가중치 표 기반).
 */
export function chapterIdsForExam(exam: 'adsp' | 'sqld'): string[] {
  return Object.keys(CHAPTER_WEIGHTS).filter((id) => id.startsWith(exam));
}

/**
 * 시험에 속한 chapter 목록 + 각 chapter 의 정답률.
 * 응시 안 한 chapter 도 accuracy=null 로 포함 (UI 의 데이터 부족 카운트용).
 */
export function getFullChapterAccuracies(
  questionStats: Record<string, QuestionStat>,
  exam: 'adsp' | 'sqld',
): ChapterAccuracy[] {
  const aggregated = aggregateChapterAccuracy(questionStats, exam);
  const aggMap = new Map(aggregated.map((a) => [a.chapter_id, a]));
  return chapterIdsForExam(exam).map((chapter_id) =>
    aggMap.get(chapter_id) ?? {
      chapter_id,
      accuracy: null,
      attempt_count: 0,
      correct_count: 0,
      question_count: 0,
      last_seen_at: null,
    },
  );
}

/**
 * sessions 으로부터 최근 학습한 chapter_id 추출 — UI "최근 활동" 표시용.
 *
 * @param days - 최근 N일 이내 (기본 7)
 */
export function recentlyActiveChapters(
  sessions: readonly SessionRecord[],
  exam: 'adsp' | 'sqld',
  days = 7,
  now: number = Date.now(),
): Set<string> {
  const result = new Set<string>();
  const cutoff = now - days * 24 * 3600 * 1000;
  const metaMap = getQuestionMetaMap();
  // sessions 만으로는 chapter_id 직접 확인 불가능 (sessions.chapter 는 number).
  // wrongQuestionIds 의 question_id 로 metaMap 매칭하면 정확.
  for (const s of sessions) {
    if (s.subject !== exam) continue;
    if (s.at < cutoff) continue;
    if (s.wrongQuestionIds) {
      for (const qid of s.wrongQuestionIds) {
        const meta = metaMap[qid];
        if (meta?.chapter_id) result.add(meta.chapter_id);
      }
    }
    // wrongQuestionIds 없으면 session.chapter 만으로는 sub-chapter 식별 불가 — 단순화 skip
  }
  return result;
}

// ─── re-export 헬퍼 ──────────────────────────────────────────────────

/** chapter_id → 사람-읽는 이름 (UI 표시용). */
export { CHAPTER_NAMES } from '@/game/diagnostic/diagnosticPool';

export type { QuestionMeta };

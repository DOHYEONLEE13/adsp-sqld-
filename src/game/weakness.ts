/**
 * 약점 분석 — 룰 기반.
 *
 * 한 문제의 약점 점수 = oddsWrong*0.5 + timeOverrun*0.3 + recency*0.2
 *   - oddsWrong   : 오답률 (0~1). 풀이 전혀 없으면 0.5 (중립).
 *   - timeOverrun : (avgTimeMs / TARGET) - 1 를 0~1 로 clamp. 시간 없으면 0.
 *   - recency     : 마지막 풀이로부터 경과 시간, 7일이면 1.0. 풀이 없으면 0.
 *
 * 토픽 약점 = 토픽에 속한 "플레이 가능한" 문항의 약점 점수 평균.
 * 점수가 높을수록 더 약한 영역.
 */

import type { MultipleChoiceQuestion, Subject } from '@/types/question';
import { playableQuestions } from './session';
import type { ProgressStore, QuestionStat } from './storage';
import { clamp } from '@/lib/utils';

/** 문제당 목표 풀이 시간 (ms). 45초 = 시험장 평균 페이스. */
const TARGET_MS = 45 * 1000;
/** 약점 recency 기준 — 7 일 경과 시 1.0. */
const RECENCY_FULL_MS = 7 * 24 * 60 * 60 * 1000;

export interface WeaknessScore {
  /** 종합 점수 0~1. 높을수록 약함. */
  score: number;
  oddsWrong: number;
  timeOverrun: number;
  recency: number;
  /** 몇 번 풀었는지 — 뱃지 신뢰도 게이트에 씁니다. */
  attempts: number;
}

export function scoreQuestion(
  stat: QuestionStat | undefined,
  now: number = Date.now(),
): WeaknessScore {
  if (!stat) {
    // 시도 없는 문제는 "약한 것으로 의심" — 중립 0.5 로 약간 가중.
    return {
      score: 0.5 * 0.5,
      oddsWrong: 0.5,
      timeOverrun: 0,
      recency: 0,
      attempts: 0,
    };
  }
  const oddsWrong = 1 - stat.correct / Math.max(1, stat.attempts);
  const timeOverrun = clamp(stat.avgTimeMs / TARGET_MS - 1, 0, 1);
  const recency = clamp((now - stat.lastSeenAt) / RECENCY_FULL_MS, 0, 1);
  const score = oddsWrong * 0.5 + timeOverrun * 0.3 + recency * 0.2;
  return { score, oddsWrong, timeOverrun, recency, attempts: stat.attempts };
}

export interface TopicWeakness {
  subject: Subject;
  chapter: number;
  topic: string;
  /** 토픽 평균 약점 점수 0~1. */
  score: number;
  /** 최소 1회 이상 푼 문항 수. 신뢰도 게이트. */
  attemptedCount: number;
  /** 플레이 가능 문항 총수. */
  total: number;
}

/** 과목의 모든 토픽에 대해 약점 점수 계산. */
export function topicWeaknesses(
  subject: Subject,
  store: ProgressStore,
  now: number = Date.now(),
): TopicWeakness[] {
  const pool = playableQuestions(subject);
  const buckets = new Map<string, MultipleChoiceQuestion[]>();
  for (const q of pool) {
    const key = `${q.chapter}::${q.topic}`;
    const arr = buckets.get(key) ?? [];
    arr.push(q);
    buckets.set(key, arr);
  }

  const out: TopicWeakness[] = [];
  for (const [key, questions] of buckets) {
    const [chapterStr, topic] = key.split('::');
    const chapter = Number(chapterStr);
    let sum = 0;
    let attemptedCount = 0;
    for (const q of questions) {
      const stat = store.questionStats[q.id];
      if (stat) attemptedCount++;
      sum += scoreQuestion(stat, now).score;
    }
    out.push({
      subject,
      chapter,
      topic: topic ?? '',
      score: sum / questions.length,
      attemptedCount,
      total: questions.length,
    });
  }
  return out.sort((a, b) => b.score - a.score);
}

/** 한 챕터 내 토픽만. */
export function topicWeaknessesInChapter(
  subject: Subject,
  chapter: number,
  store: ProgressStore,
  now: number = Date.now(),
): TopicWeakness[] {
  return topicWeaknesses(subject, store, now).filter(
    (t) => t.chapter === chapter,
  );
}

/** 한 토픽의 약점 점수. */
export function topicWeaknessOf(
  subject: Subject,
  chapter: number,
  topic: string,
  store: ProgressStore,
  now: number = Date.now(),
): TopicWeakness | null {
  const found = topicWeaknessesInChapter(
    subject,
    chapter,
    store,
    now,
  ).find((t) => t.topic === topic);
  return found ?? null;
}

/** 약점 정도 → UI 뱃지 레벨. 신뢰도(attempts) 가 너무 낮으면 'unknown'. */
export type WeaknessLevel = 'unknown' | 'ok' | 'watch' | 'weak';

export function weaknessLevel(t: TopicWeakness): WeaknessLevel {
  // 토픽 내 최소 2문항 이상 풀어봤을 때만 유의미.
  if (t.attemptedCount < 2) return 'unknown';
  if (t.score >= 0.55) return 'weak';
  if (t.score >= 0.4) return 'watch';
  return 'ok';
}

/** 약점 우선 가중 샘플링을 위한 문제 점수. */
export function questionWeaknessScore(
  q: MultipleChoiceQuestion,
  store: ProgressStore,
  now: number = Date.now(),
): number {
  return scoreQuestion(store.questionStats[q.id], now).score;
}

/**
 * weakness.test.ts — 룰 기반 약점 점수 검증.
 *
 * 공식 (CLAUDE.md 절대 원칙 #5): score = oddsWrong*0.5 + timeOverrun*0.3 + recency*0.2
 *   - oddsWrong  : 1 - correct/attempts. 시도 없으면 0.5 (중립).
 *   - timeOverrun: clamp(avgTimeMs/45000 - 1, 0, 1). 시간 없으면 0.
 *   - recency    : clamp((now - lastSeenAt) / 7days, 0, 1). 풀이 없으면 0.
 */

import { describe, it, expect } from 'vitest';
import { scoreQuestion, weaknessLevel, type TopicWeakness } from './weakness';
import type { QuestionStat } from './storage';

const TARGET_MS = 45 * 1000; // 45초
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const NOW = 1_700_000_000_000; // fixed for determinism

function stat(partial: Partial<QuestionStat>): QuestionStat {
  return {
    attempts: 1,
    correct: 0,
    wrongStreak: 0,
    lastCorrect: false,
    lastSeenAt: NOW,
    lastTimeMs: TARGET_MS,
    avgTimeMs: TARGET_MS,
    ...partial,
  };
}

describe('scoreQuestion — 점수 분해', () => {
  it('시도 없음 (stat undefined) → 중립 0.5*0.5 = 0.25', () => {
    const r = scoreQuestion(undefined, NOW);
    expect(r.score).toBeCloseTo(0.25);
    expect(r.oddsWrong).toBe(0.5);
    expect(r.timeOverrun).toBe(0);
    expect(r.recency).toBe(0);
    expect(r.attempts).toBe(0);
  });

  it('완벽 정답 (1/1, 30초, 방금) → score = 0', () => {
    const r = scoreQuestion(
      stat({
        attempts: 1,
        correct: 1,
        avgTimeMs: 30_000,
        lastSeenAt: NOW,
      }),
      NOW,
    );
    expect(r.oddsWrong).toBe(0);
    expect(r.timeOverrun).toBe(0); // 30/45 - 1 = -0.33 → clamp 0
    expect(r.recency).toBe(0);
    expect(r.score).toBeCloseTo(0);
  });

  it('완전 실패 (0/3, 90초, 7일 전) → score = 1.0', () => {
    const r = scoreQuestion(
      stat({
        attempts: 3,
        correct: 0,
        avgTimeMs: 90_000, // 90/45 - 1 = 1.0
        lastSeenAt: NOW - SEVEN_DAYS,
      }),
      NOW,
    );
    expect(r.oddsWrong).toBe(1); // 1 - 0/3
    expect(r.timeOverrun).toBe(1); // clamp 1
    expect(r.recency).toBe(1);
    expect(r.score).toBeCloseTo(0.5 + 0.3 + 0.2); // 1.0
  });

  it('절반 정답 (5/10, 45초 정확, 방금) → 0.25', () => {
    const r = scoreQuestion(
      stat({ attempts: 10, correct: 5, avgTimeMs: TARGET_MS, lastSeenAt: NOW }),
      NOW,
    );
    expect(r.oddsWrong).toBe(0.5);
    expect(r.timeOverrun).toBe(0); // 45/45 - 1 = 0
    expect(r.recency).toBe(0);
    expect(r.score).toBeCloseTo(0.5 * 0.5);
  });

  it('recency clamp — 14일 경과해도 1.0 까지만', () => {
    const r = scoreQuestion(
      stat({ lastSeenAt: NOW - 2 * SEVEN_DAYS }),
      NOW,
    );
    expect(r.recency).toBe(1); // clamp
  });

  it('timeOverrun clamp — 4분 평균이어도 1.0 까지만', () => {
    const r = scoreQuestion(stat({ avgTimeMs: 240_000 }), NOW); // 240/45 - 1 ≈ 4.3
    expect(r.timeOverrun).toBe(1);
  });

  it('attempts > correct 이면 oddsWrong 비율 정확', () => {
    const r = scoreQuestion(stat({ attempts: 4, correct: 1 }), NOW);
    expect(r.oddsWrong).toBeCloseTo(0.75); // 1 - 1/4
  });
});

describe('weaknessLevel — 신뢰도 게이트 + 임계값', () => {
  function tw(overrides: Partial<TopicWeakness>): TopicWeakness {
    return {
      subject: 'adsp',
      chapter: 1,
      topic: '데이터의 이해',
      score: 0.3,
      attemptedCount: 5,
      total: 10,
      ...overrides,
    };
  }

  it('attempts < 2 → unknown (신뢰도 부족)', () => {
    expect(weaknessLevel(tw({ attemptedCount: 0 }))).toBe('unknown');
    expect(weaknessLevel(tw({ attemptedCount: 1 }))).toBe('unknown');
  });

  it('score ≥ 0.55 → weak', () => {
    expect(weaknessLevel(tw({ attemptedCount: 5, score: 0.55 }))).toBe('weak');
    expect(weaknessLevel(tw({ attemptedCount: 5, score: 0.9 }))).toBe('weak');
  });

  it('0.4 ≤ score < 0.55 → watch', () => {
    expect(weaknessLevel(tw({ attemptedCount: 5, score: 0.4 }))).toBe('watch');
    expect(weaknessLevel(tw({ attemptedCount: 5, score: 0.54 }))).toBe('watch');
  });

  it('score < 0.4 → ok', () => {
    expect(weaknessLevel(tw({ attemptedCount: 5, score: 0.39 }))).toBe('ok');
    expect(weaknessLevel(tw({ attemptedCount: 5, score: 0.0 }))).toBe('ok');
  });

  it('boundary 정확 — 0.4 = watch (≥), 0.55 = weak (≥)', () => {
    expect(weaknessLevel(tw({ attemptedCount: 2, score: 0.4 }))).toBe('watch');
    expect(weaknessLevel(tw({ attemptedCount: 2, score: 0.55 }))).toBe('weak');
  });
});

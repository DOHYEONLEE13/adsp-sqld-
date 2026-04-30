/**
 * rpg.test.ts — XP·Level·Streak 계산 검증.
 *
 * 핵심 — 클라이언트의 levelFromXp 공식이 Supabase RPC bump_progress
 * (`0006_level_formula_sync.sql`) 의 SQL 공식과 정확히 일치해야 함.
 * 두 곳이 어긋나면 사용자가 보는 레벨이 서버 저장 값과 차이남.
 */

import { describe, it, expect } from 'vitest';
import {
  thresholdForLevel,
  levelFromXp,
  xpForSession,
  computeMaxStreak,
  computeStreakDays,
  XP_PER_CORRECT,
} from './rpg';
import type { SessionRecord } from './storage';

describe('thresholdForLevel — 삼각수 공식 thresh(n) = 50·n·(n-1)', () => {
  it('Lv1 → 0 XP', () => expect(thresholdForLevel(1)).toBe(0));
  it('Lv2 → 100 XP', () => expect(thresholdForLevel(2)).toBe(100));
  it('Lv3 → 300 XP', () => expect(thresholdForLevel(3)).toBe(300));
  it('Lv4 → 600 XP', () => expect(thresholdForLevel(4)).toBe(600));
  it('Lv5 → 1000 XP', () => expect(thresholdForLevel(5)).toBe(1000));
  it('Lv6 → 1500 XP', () => expect(thresholdForLevel(6)).toBe(1500));
  it('Lv10 → 4500 XP', () => expect(thresholdForLevel(10)).toBe(4500));

  it('비정수 입력은 floor', () => {
    expect(thresholdForLevel(2.7)).toBe(100); // floor(2.7) = 2
  });
  it('0/음수는 1로 clamp', () => {
    expect(thresholdForLevel(0)).toBe(0); // 50 · 1 · 0 = 0
    expect(thresholdForLevel(-5)).toBe(0);
  });
});

describe('levelFromXp — Supabase bump_progress 공식과 sync', () => {
  // Supabase: greatest(1, floor((1 + sqrt(1 + 0.08·xp)) / 2))
  // 클라:   max n such that 50·n·(n-1) ≤ xp
  // 두 공식이 동치임을 임계값들로 검증.
  const cases: Array<[number, number]> = [
    [0, 1],
    [99, 1],
    [100, 2],
    [299, 2],
    [300, 3],
    [599, 3],
    [600, 4],
    [999, 4],
    [1000, 5],
    [1499, 5],
    [1500, 6],
    [5000, 10], // sanity
  ];

  it.each(cases)('xp=%i → level=%i', (xp, expected) => {
    expect(levelFromXp(xp).level).toBe(expected);
  });

  it('ratio·xpIntoLevel 가 thresholdForLevel 과 일치', () => {
    const info = levelFromXp(450); // Lv3 (thresh 300), 다음 Lv4 (thresh 600). 450 → into=150, span=300, ratio=0.5
    expect(info.level).toBe(3);
    expect(info.xpIntoLevel).toBe(150);
    expect(info.xpSpan).toBe(300);
    expect(info.nextThreshold).toBe(600);
    expect(info.ratio).toBeCloseTo(0.5);
  });

  it('음수 XP 는 0 으로 clamp', () => {
    expect(levelFromXp(-100).level).toBe(1);
    expect(levelFromXp(-100).xpIntoLevel).toBe(0);
  });

  it('비정수 XP 는 floor', () => {
    expect(levelFromXp(99.9).level).toBe(1); // floor(99.9) = 99 → Lv1
    expect(levelFromXp(100).level).toBe(2);
  });
});

describe('xpForSession — 정답 + 정확도 + 스트릭 보너스', () => {
  it('100% (10/10, streak 10) — 100 + 50 + 40 = 190', () => {
    const r = xpForSession({ correctCount: 10, total: 10, maxStreak: 10 });
    expect(r.correctXp).toBe(100); // 10 × XP_PER_CORRECT(10)
    expect(r.accuracyBonus).toBe(50);
    expect(r.streakBonus).toBe(40); // (10-2) × 5
    expect(r.total).toBe(190);
    expect(r.accuracy).toBe(1);
  });

  it('90% (9/10, streak 5) — 90 + 30 + 15 = 135', () => {
    const r = xpForSession({ correctCount: 9, total: 10, maxStreak: 5 });
    expect(r.correctXp).toBe(90);
    expect(r.accuracyBonus).toBe(30);
    expect(r.streakBonus).toBe(15); // (5-2) × 5
    expect(r.total).toBe(135);
  });

  it('80% (8/10, streak 2) — 80 + 15 + 0 = 95', () => {
    const r = xpForSession({ correctCount: 8, total: 10, maxStreak: 2 });
    expect(r.correctXp).toBe(80);
    expect(r.accuracyBonus).toBe(15);
    expect(r.streakBonus).toBe(0); // streak < 3
    expect(r.total).toBe(95);
  });

  it('70% (7/10, streak 1) — 70 + 0 + 0 = 70 (정확도 boundary 검증)', () => {
    const r = xpForSession({ correctCount: 7, total: 10, maxStreak: 1 });
    expect(r.accuracyBonus).toBe(0); // < 0.8
    expect(r.total).toBe(70);
  });

  it('streak 3 — 첫 보너스 +5', () => {
    const r = xpForSession({ correctCount: 5, total: 10, maxStreak: 3 });
    expect(r.streakBonus).toBe(5); // (3-2) × 5
  });

  it('total 0 — division-by-zero 방지', () => {
    const r = xpForSession({ correctCount: 0, total: 0 });
    expect(r.accuracy).toBe(0);
    expect(r.total).toBe(0);
  });

  it('correctCount > total — clamp to total', () => {
    const r = xpForSession({ correctCount: 999, total: 10 });
    expect(r.correctXp).toBe(10 * XP_PER_CORRECT); // 100, not 9990
    expect(r.accuracy).toBe(1);
  });

  it('음수 입력 — 0으로 clamp', () => {
    const r = xpForSession({ correctCount: -5, total: -10 });
    expect(r.correctXp).toBe(0);
    expect(r.total).toBe(0);
  });
});

describe('computeMaxStreak — 최대 연속 정답', () => {
  const ans = (correct: boolean) => ({
    questionId: 'x',
    chosenIndex: 0,
    correct,
    timeMs: 0,
  });

  it('빈 배열 → 0', () => {
    expect(computeMaxStreak([])).toBe(0);
  });
  it('전부 오답 → 0', () => {
    expect(computeMaxStreak([ans(false), ans(false)])).toBe(0);
  });
  it('전부 정답 → 길이', () => {
    expect(computeMaxStreak([ans(true), ans(true), ans(true)])).toBe(3);
  });
  it('중간에 끊긴 streak — 첫 streak 가 더 길면 그것 유지', () => {
    // T T T F T T → max = 3
    expect(
      computeMaxStreak([ans(true), ans(true), ans(true), ans(false), ans(true), ans(true)]),
    ).toBe(3);
  });
  it('마지막 streak 가 더 길면 그것 반환', () => {
    // T F T T T T → max = 4
    expect(
      computeMaxStreak([ans(true), ans(false), ans(true), ans(true), ans(true), ans(true)]),
    ).toBe(4);
  });
});

describe('computeStreakDays — 연속 플레이 일수', () => {
  function dayMs(year: number, month: number, day: number): number {
    return new Date(year, month - 1, day, 12, 0, 0).getTime();
  }
  function rec(at: number): SessionRecord {
    return {
      at,
      subject: 'adsp',
      chapter: 1,
      chapterTitle: '',
      topic: null,
      total: 10,
      correctCount: 5,
      totalTimeMs: 0,
    };
  }

  const today = dayMs(2026, 5, 1);
  const yesterday = dayMs(2026, 4, 30);
  const dayBefore = dayMs(2026, 4, 29);
  const week_ago = dayMs(2026, 4, 24);

  it('빈 sessions → 0', () => {
    expect(computeStreakDays([], today)).toBe(0);
  });

  it('오늘만 있으면 streak = 1', () => {
    expect(computeStreakDays([rec(today)], today)).toBe(1);
  });

  it('어제만 있으면 streak = 1', () => {
    expect(computeStreakDays([rec(yesterday)], today)).toBe(1);
  });

  it('오늘 + 어제 + 그제 → streak = 3', () => {
    expect(
      computeStreakDays(
        [rec(today), rec(yesterday), rec(dayBefore)],
        today,
      ),
    ).toBe(3);
  });

  it('마지막 세션이 일주일 전이면 streak = 0', () => {
    expect(computeStreakDays([rec(week_ago)], today)).toBe(0);
  });

  it('같은 날 여러 세션은 1일로 카운트', () => {
    const sameDay = [rec(today), rec(today + 1000), rec(today + 2000)];
    expect(computeStreakDays(sameDay, today)).toBe(1);
  });

  it('하루 갭이 있으면 거기서 끊김', () => {
    // 오늘 ✓ 어제 ✗ 그제 ✓ → streak = 1 (오늘만)
    expect(computeStreakDays([rec(today), rec(dayBefore)], today)).toBe(1);
  });
});

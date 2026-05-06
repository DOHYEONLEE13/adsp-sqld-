/**
 * Phase 4 — Hardening 테스트.
 *
 * 경계 조건 + 잘못된 입력 + 손실 fallback 검증.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateBeginnerPlan,
  generateReviewerPlan,
} from './studyPlanGenerator';
import { trackProgress } from './progressTracker';
import { saveStudyPlan, loadStudyPlan, clearStudyPlan } from './studyPlanStorage';
import { buildPlanFromOnboarding } from './fromOnboarding';
import type { OnboardingResult } from '@/game/onboarding/onboardingStorage';

describe('Hardening — 경계 조건', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') window.localStorage?.clear();
  });

  describe('generateBeginnerPlan 경계', () => {
    it('D-day = 오늘 → weeks 빈 배열', () => {
      const today = new Date('2026-05-01');
      const plan = generateBeginnerPlan({
        user_id: 'u',
        exam: 'adsp',
        exam_date: today,
        daily_minutes: 60,
        study_style: 'distributed',
        background: 'novice',
        now: today.getTime(),
      });
      expect(plan.weeks.length).toBe(0);
      expect(plan.mode).toBe('priority'); // 가용 시간 0 < 권장
    });

    it('D-day 과거 → weeks 빈 배열', () => {
      const today = new Date('2026-05-01').getTime();
      const past = new Date('2026-04-15');
      const plan = generateBeginnerPlan({
        user_id: 'u',
        exam: 'adsp',
        exam_date: past,
        daily_minutes: 60,
        study_style: 'distributed',
        background: 'novice',
        now: today,
      });
      expect(plan.weeks.length).toBe(0);
    });

    it('daily_minutes 0 → weeks 빈 배열 또는 plan 자체 무용', () => {
      const today = new Date('2026-05-01').getTime();
      const plan = generateBeginnerPlan({
        user_id: 'u',
        exam: 'adsp',
        exam_date: new Date('2026-08-01'),
        daily_minutes: 0,
        study_style: 'distributed',
        background: 'novice',
        now: today,
      });
      // available 0 → priority + weeks 가 비거나 의미없음. 알고리즘은 죽지 않아야.
      expect(plan.mode).toBe('priority');
      expect(plan.time_ratio).toBe(0);
    });

    it('극단적 deep — 매우 긴 D-day', () => {
      const today = new Date('2026-05-01').getTime();
      const plan = generateBeginnerPlan({
        user_id: 'u',
        exam: 'adsp',
        exam_date: new Date('2027-12-31'),
        daily_minutes: 120,
        study_style: 'distributed',
        background: 'novice',
        now: today,
      });
      expect(plan.mode).toBe('deep');
      // 시간 분배가 require 와 정합 (±5분)
      const total = plan.weeks
        .flatMap((w) => w.chapters)
        .reduce((s, c) => s + c.planned_minutes, 0);
      expect(Math.abs(total - 55 * 60)).toBeLessThanOrEqual(5);
    });
  });

  describe('generateReviewerPlan 경계', () => {
    it('weak_chapters 빈 배열 — 정상 동작', () => {
      const plan = generateReviewerPlan({
        user_id: 'u',
        exam: 'adsp',
        exam_date: new Date('2026-08-01'),
        daily_minutes: 60,
        study_style: 'distributed',
        weak_chapters: [],
        now: new Date('2026-05-01').getTime(),
      });
      expect(plan.weak_chapter_ids).toEqual([]);
      expect(plan.weeks.length).toBeGreaterThan(0);
    });

    it('미존재 chapter_id 만 약점 → 알고리즘 정상', () => {
      const plan = generateReviewerPlan({
        user_id: 'u',
        exam: 'adsp',
        exam_date: new Date('2026-08-01'),
        daily_minutes: 60,
        study_style: 'distributed',
        weak_chapters: ['unknown-x', 'nope'],
        now: new Date('2026-05-01').getTime(),
      });
      // 미존재 약점은 영역 매핑 안 됨 → 모든 영역 60% 가중 → 정규화 후 균일
      expect(plan.weeks.length).toBeGreaterThan(0);
    });
  });

  describe('trackProgress 경계', () => {
    it('plan.weeks 빈 배열 — current_week 1, expected 0', () => {
      const plan = generateBeginnerPlan({
        user_id: 'u',
        exam: 'adsp',
        exam_date: new Date('2026-05-01'),
        daily_minutes: 60,
        study_style: 'distributed',
        background: 'novice',
        now: new Date('2026-05-01').getTime(),
      });
      const snap = trackProgress(plan, [], new Date('2026-05-01').getTime());
      expect(snap.current_week).toBe(1);
      expect(snap.expected_progress).toBe(0);
    });

    it('미래 시점 plan + 과거 sessions → 진도 음수 X', () => {
      const planNow = new Date('2026-05-01').getTime();
      const plan = generateBeginnerPlan({
        user_id: 'u',
        exam: 'adsp',
        exam_date: new Date('2026-08-01'),
        daily_minutes: 60,
        study_style: 'distributed',
        background: 'novice',
        now: planNow,
      });
      const snap = trackProgress(plan, [], planNow - 10 * 24 * 3600 * 1000);
      expect(snap.expected_progress).toBeGreaterThanOrEqual(0);
      expect(snap.actual_progress).toBeGreaterThanOrEqual(0);
    });
  });

  describe('studyPlanStorage 경계', () => {
    it('clearStudyPlan() → load 즉시 null', () => {
      if (typeof window === 'undefined') return;
      const plan = generateBeginnerPlan({
        user_id: 'u',
        exam: 'adsp',
        exam_date: new Date('2026-08-01'),
        daily_minutes: 60,
        study_style: 'distributed',
        background: 'novice',
      });
      saveStudyPlan(plan);
      clearStudyPlan();
      expect(loadStudyPlan()).toBeNull();
    });

    it('미존재 schema 버전 → null fallback (기존 사용자 미손상)', () => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(
        'questdp_study_plan_v1',
        JSON.stringify({ _v: 'wrong', plan_id: 'x' }),
      );
      expect(loadStudyPlan()).toBeNull();
    });

    it('quota exceeded — saveStudyPlan 이 throw 하지 않음', () => {
      if (typeof window === 'undefined') return;
      const plan = generateBeginnerPlan({
        user_id: 'u',
        exam: 'adsp',
        exam_date: new Date('2026-08-01'),
        daily_minutes: 60,
        study_style: 'distributed',
        background: 'novice',
      });
      // setItem 을 일시적으로 throw 하게 만들기
      const orig = window.localStorage.setItem;
      window.localStorage.setItem = () => {
        throw new Error('Quota exceeded');
      };
      try {
        expect(() => saveStudyPlan(plan)).not.toThrow();
      } finally {
        window.localStorage.setItem = orig;
      }
    });
  });

  describe('buildPlanFromOnboarding 경계', () => {
    const baseResult: OnboardingResult = {
      persona: 'beginner',
      background: 'novice',
      exams: ['adsp'],
      exam_dates: { adsp: '2026-08-01T00:00:00.000Z' },
      daily_minutes: 60,
      study_style: 'distributed',
      completed_at: '2026-05-01T00:00:00.000Z',
      version: 1,
    };

    it('정상 입력 → plan 생성', () => {
      const plan = buildPlanFromOnboarding(baseResult);
      expect(plan).not.toBeNull();
      expect(plan?.exam).toBe('adsp');
    });

    it('exams 빈 배열 → null', () => {
      const plan = buildPlanFromOnboarding({ ...baseResult, exams: [] });
      expect(plan).toBeNull();
    });

    it('exam_dates 미완비 → null', () => {
      const plan = buildPlanFromOnboarding({
        ...baseResult,
        exam_dates: {},
      });
      expect(plan).toBeNull();
    });

    it('잘못된 ISO date string → null', () => {
      const plan = buildPlanFromOnboarding({
        ...baseResult,
        exam_dates: { adsp: 'not-a-date' },
      });
      expect(plan).toBeNull();
    });

    it('reviewer + weak_chapters 보존', () => {
      const plan = buildPlanFromOnboarding({
        ...baseResult,
        persona: 'reviewer',
        weak_chapters: ['adsp-3-stats'],
      });
      expect(plan).not.toBeNull();
      // reviewer plan 은 weak_chapter_ids 있음
      expect((plan as { weak_chapter_ids?: string[] }).weak_chapter_ids).toEqual([
        'adsp-3-stats',
      ]);
    });

    it('multi-exam — 가까운 시험 우선 선택', () => {
      const plan = buildPlanFromOnboarding({
        ...baseResult,
        exams: ['adsp', 'sqld'],
        exam_dates: {
          adsp: '2026-09-01T00:00:00.000Z',
          sqld: '2026-08-01T00:00:00.000Z', // 더 가까움
        },
      });
      expect(plan?.exam).toBe('sqld');
    });
  });
});

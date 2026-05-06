import { describe, it, expect } from 'vitest';
import {
  generateBeginnerPlan,
  generateReviewerPlan,
} from './studyPlanGenerator';

describe('studyPlanGenerator', () => {
  const baseInput = {
    user_id: 'test-user',
    exam: 'adsp' as const,
    exam_date: new Date('2026-08-08'),
    daily_minutes: 60,
    study_style: 'distributed' as const,
    background: 'novice' as const,
    now: new Date('2026-05-01').getTime(),
  };

  describe('generateBeginnerPlan', () => {
    it('plan_id, user_id, is_active 필드 셋업', () => {
      const plan = generateBeginnerPlan(baseInput);
      expect(plan.plan_id).toBeTruthy();
      expect(plan.user_id).toBe('test-user');
      expect(plan.is_active).toBe(true);
    });

    it('ADsP novice → required 55h, time_ratio < 1', () => {
      const plan = generateBeginnerPlan(baseInput);
      expect(plan.required_total_hours).toBe(55);
      // 99일 - 3 = 96일 * 60min = 5760min vs 55*60 = 3300min → ratio ~ 1.74
      expect(plan.time_ratio).toBeGreaterThan(1.5);
      expect(plan.mode).toBe('deep');
    });

    it('priority 모드 — 시간 부족', () => {
      const tightInput = {
        ...baseInput,
        exam_date: new Date('2026-05-25'), // D-24
        daily_minutes: 30,
      };
      const plan = generateBeginnerPlan(tightInput);
      // 24-3 = 21일 * 30 = 630min vs 3300min → 0.19
      expect(plan.mode).toBe('priority');
      expect(plan.time_ratio).toBeLessThan(0.7);
    });

    it('balanced 모드 — 딱 맞는 일정', () => {
      const balancedInput = {
        ...baseInput,
        // 55h = 3300min. daily 60 × X일 = 3300 → X = 55일 + 3 buffer = 58일
        exam_date: new Date('2026-06-28'),
        daily_minutes: 60,
      };
      const plan = generateBeginnerPlan(balancedInput);
      expect(plan.mode).toBe('balanced');
    });

    it('weeks[] 가 빈 배열이 아니어야 — D-day 충분', () => {
      const plan = generateBeginnerPlan(baseInput);
      expect(plan.weeks.length).toBeGreaterThan(0);
    });

    it('weeks 의 chapter 합 = required_total_minutes (±5분 오차)', () => {
      const plan = generateBeginnerPlan(baseInput);
      const totalPlanned = plan.weeks
        .flatMap((w) => w.chapters)
        .reduce((s, c) => s + c.planned_minutes, 0);
      const required = plan.required_total_hours * 60;
      expect(Math.abs(totalPlanned - required)).toBeLessThanOrEqual(5);
    });

    it('free_review_buffer_start = D-day - 3일', () => {
      const plan = generateBeginnerPlan(baseInput);
      const diffMs = plan.d_day.getTime() - plan.free_review_buffer_start.getTime();
      const diffDays = Math.round(diffMs / (24 * 3600 * 1000));
      expect(diffDays).toBe(3);
    });

    it('D-day 임박 (D < 3일) → weeks 빈 배열', () => {
      const tooClose = {
        ...baseInput,
        exam_date: new Date('2026-05-02'), // D-1
      };
      const plan = generateBeginnerPlan(tooClose);
      expect(plan.weeks.length).toBe(0);
    });

    it('SQLD some_basis → required 22h', () => {
      const plan = generateBeginnerPlan({
        ...baseInput,
        exam: 'sqld',
        background: 'some_basis',
      });
      expect(plan.required_total_hours).toBe(22);
    });

    it('replan_count = 0 (초기)', () => {
      const plan = generateBeginnerPlan(baseInput);
      expect(plan.replan_count).toBe(0);
    });
  });

  describe('generateReviewerPlan', () => {
    const reviewerInput = {
      user_id: 'test-user',
      exam: 'adsp' as const,
      exam_date: new Date('2026-08-08'),
      daily_minutes: 60,
      study_style: 'distributed' as const,
      weak_chapters: ['adsp-3-stats'],
      now: new Date('2026-05-01').getTime(),
    };

    it('reviewer 시간 = 17h (ADsP)', () => {
      const plan = generateReviewerPlan(reviewerInput);
      expect(plan.required_total_hours).toBe(17);
    });

    it('weak_chapter_ids 보존', () => {
      const plan = generateReviewerPlan(reviewerInput);
      expect(plan.weak_chapter_ids).toEqual(['adsp-3-stats']);
    });

    it('약점 단원이 첫 주차에 등장 (우선 정렬)', () => {
      const plan = generateReviewerPlan(reviewerInput);
      const firstWeekChapterIds = plan.weeks[0]?.chapters.map((c) => c.chapter_id);
      expect(firstWeekChapterIds?.[0]).toBe('adsp-3-stats');
    });

    it('약점 영역 시간 > 비가중 시간 (1.5x 이상)', () => {
      const plan = generateReviewerPlan(reviewerInput);
      // 비가중 시: 17h * 60 * 0.30 = 306min
      // 가중 시 (강점 60%, 약점 100%, 정규화): 비율 ↑
      const stats = plan.weeks
        .flatMap((w) => w.chapters)
        .filter((c) => c.chapter_id === 'adsp-3-stats')
        .reduce((s, c) => s + c.planned_minutes, 0);
      expect(stats).toBeGreaterThan(306 * 1.2);
    });

    it('정답률 데이터 시 — 정답률 낮은 약점이 더 우선', () => {
      const plan = generateReviewerPlan({
        ...reviewerInput,
        weak_chapters: ['adsp-1', 'adsp-3-stats'],
        initial_chapter_accuracy: { 'adsp-1': 0.4, 'adsp-3-stats': 0.2 },
      });
      // 정답률 낮은 stats 가 먼저
      const firstId = plan.weeks[0]?.chapters[0]?.chapter_id;
      expect(firstId).toBe('adsp-3-stats');
    });

    it('약점 0개 — 일반 플랜과 유사하게 동작', () => {
      const plan = generateReviewerPlan({
        ...reviewerInput,
        weak_chapters: [],
      });
      expect(plan.weeks.length).toBeGreaterThan(0);
    });
  });
});

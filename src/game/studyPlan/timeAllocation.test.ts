import { describe, it, expect } from 'vitest';
import {
  calculateRequiredHours,
  calculateAvailableMinutes,
  evaluatePlanFeasibility,
  allocateByArea,
  allocateByAreaForReviewer,
  formatMinutes,
} from './timeAllocation';

describe('timeAllocation', () => {
  describe('calculateRequiredHours — 페르소나/배경별 시간 표', () => {
    it('ADsP novice beginner = 50~60h, recommended 55h', () => {
      const r = calculateRequiredHours('adsp', 'novice', 'beginner');
      expect(r.min).toBe(50);
      expect(r.max).toBe(60);
      expect(r.recommended).toBe(55);
    });

    it('ADsP some_basis beginner = 30~40h', () => {
      const r = calculateRequiredHours('adsp', 'some_basis', 'beginner');
      expect(r.min).toBe(30);
      expect(r.max).toBe(40);
    });

    it('ADsP reviewer = 15~20h (background 무관)', () => {
      const a = calculateRequiredHours('adsp', 'novice', 'reviewer');
      const b = calculateRequiredHours('adsp', 'experienced', 'reviewer');
      expect(a.min).toBe(15);
      expect(a.max).toBe(20);
      expect(a).toEqual(b); // background 무관
    });

    it('SQLD novice beginner = 40~50h', () => {
      const r = calculateRequiredHours('sqld', 'novice', 'beginner');
      expect(r.min).toBe(40);
      expect(r.max).toBe(50);
    });

    it('SQLD reviewer = 10~15h', () => {
      const r = calculateRequiredHours('sqld', 'novice', 'reviewer');
      expect(r.min).toBe(10);
      expect(r.max).toBe(15);
    });
  });

  describe('calculateAvailableMinutes — 가용 시간', () => {
    const today = new Date('2026-05-01').getTime();

    it('D-30, daily 60min → (30-3)*60 = 1620', () => {
      const dDay = new Date('2026-05-31');
      const mins = calculateAvailableMinutes(dDay, 60, today);
      expect(mins).toBe(27 * 60);
    });

    it('D-day < buffer → 0', () => {
      const dDay = new Date('2026-05-02');
      const mins = calculateAvailableMinutes(dDay, 60, today);
      expect(mins).toBe(0);
    });

    it('D-day 과거 → 0', () => {
      const dDay = new Date('2026-04-15');
      const mins = calculateAvailableMinutes(dDay, 60, today);
      expect(mins).toBe(0);
    });

    it('daily_minutes ≤ 0 → 0', () => {
      const dDay = new Date('2026-06-01');
      expect(calculateAvailableMinutes(dDay, 0, today)).toBe(0);
      expect(calculateAvailableMinutes(dDay, -10, today)).toBe(0);
    });
  });

  describe('evaluatePlanFeasibility — 모드 판정', () => {
    it('ratio < 0.7 → priority', () => {
      const { mode, ratio } = evaluatePlanFeasibility(60, 100);
      expect(mode).toBe('priority');
      expect(ratio).toBeCloseTo(0.6);
    });

    it('ratio = 0.7 (경계) → balanced', () => {
      const { mode } = evaluatePlanFeasibility(70, 100);
      expect(mode).toBe('balanced');
    });

    it('ratio = 1.0 → balanced', () => {
      const { mode } = evaluatePlanFeasibility(100, 100);
      expect(mode).toBe('balanced');
    });

    it('ratio = 1.2 (경계) → deep', () => {
      const { mode } = evaluatePlanFeasibility(120, 100);
      expect(mode).toBe('deep');
    });

    it('ratio > 1.2 → deep', () => {
      const { mode } = evaluatePlanFeasibility(200, 100);
      expect(mode).toBe('deep');
    });

    it('required 0 → balanced (edge)', () => {
      const { mode } = evaluatePlanFeasibility(100, 0);
      expect(mode).toBe('balanced');
    });
  });

  describe('allocateByArea — 영역별 분배', () => {
    it('ADsP 100분 → 13/17/17/30/23 분', () => {
      const allocs = allocateByArea('adsp', 100);
      expect(allocs[0].planned_minutes).toBe(13);
      expect(allocs[1].planned_minutes).toBe(17);
      expect(allocs[2].planned_minutes).toBe(17);
      expect(allocs[3].planned_minutes).toBe(30);
      expect(allocs[4].planned_minutes).toBe(23);
    });

    it('ADsP 3300분 (55h) → 합 ≈ 3300 (반올림 오차 ±5)', () => {
      const allocs = allocateByArea('adsp', 3300);
      const sum = allocs.reduce((s, a) => s + a.planned_minutes, 0);
      expect(Math.abs(sum - 3300)).toBeLessThanOrEqual(5);
    });

    it('SQLD 1000분 → 36% = 360min (SQL 활용)', () => {
      const allocs = allocateByArea('sqld', 1000);
      const sqlActive = allocs.find((a) => a.area.chapter_id === 'sqld-2-2');
      expect(sqlActive?.planned_minutes).toBe(360);
    });
  });

  describe('allocateByAreaForReviewer — 약점 가중 분배', () => {
    it('약점 1개만 있을 때 — 약점 영역 시간 ↑, 강점 60%', () => {
      // ADsP: 영역 4 (adsp-3-stats, 30%) 가 약점
      const allocs = allocateByAreaForReviewer('adsp', 1000, ['adsp-3-stats']);
      const stats = allocs.find((a) => a.area.chapter_id === 'adsp-3-stats')!;
      const data = allocs.find((a) => a.area.chapter_id === 'adsp-1')!;
      // 약점 가중 100%, 강점 60% → 정규화 후 약점이 비례적으로 더 큰 비중
      // 비교: 약점/강점 = 1.0 / 0.6 = 1.67 배율
      expect(stats.planned_minutes).toBeGreaterThan(300); // 비가중 시 30% = 300
      expect(data.planned_minutes).toBeLessThan(130); // 비가중 시 13% = 130
    });

    it('전체 영역이 약점 → 비가중과 동일 (모두 100%)', () => {
      const weakAll = ['adsp-1', 'adsp-2', 'adsp-3-1', 'adsp-3-stats', 'adsp-3-4'];
      const a = allocateByArea('adsp', 1000);
      const b = allocateByAreaForReviewer('adsp', 1000, weakAll);
      for (let i = 0; i < a.length; i++) {
        expect(b[i].planned_minutes).toBe(a[i].planned_minutes);
      }
    });

    it('약점 0개 (빈 배열) → 모든 영역 60% 가중 = 비가중과 동일 비율', () => {
      const a = allocateByArea('adsp', 1000);
      const b = allocateByAreaForReviewer('adsp', 1000, []);
      for (let i = 0; i < a.length; i++) {
        // 모든 영역 60% 균일이라 정규화 후 비율 동일
        expect(b[i].planned_minutes).toBe(a[i].planned_minutes);
      }
    });
  });

  describe('formatMinutes — UI 표시 헬퍼', () => {
    it('75 → "1시간 15분"', () => {
      expect(formatMinutes(75)).toBe('1시간 15분');
    });
    it('60 → "1시간"', () => {
      expect(formatMinutes(60)).toBe('1시간');
    });
    it('30 → "30분"', () => {
      expect(formatMinutes(30)).toBe('30분');
    });
    it('0 → "0분"', () => {
      expect(formatMinutes(0)).toBe('0분');
    });
    it('음수 → "0분"', () => {
      expect(formatMinutes(-10)).toBe('0분');
    });
    it('소수 반올림', () => {
      expect(formatMinutes(60.4)).toBe('1시간');
    });
  });
});

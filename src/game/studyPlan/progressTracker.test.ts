import { describe, it, expect } from 'vitest';
import {
  trackProgress,
  getCurrentWeekProgress,
  applyProgressToPlan,
} from './progressTracker';
import { generateBeginnerPlan } from './studyPlanGenerator';
import type { SessionRecord } from '@/game/storage';

describe('progressTracker', () => {
  const planNow = new Date('2026-05-01').getTime();
  const plan = generateBeginnerPlan({
    user_id: 'u',
    exam: 'adsp',
    exam_date: new Date('2026-08-08'),
    daily_minutes: 60,
    study_style: 'distributed',
    background: 'novice',
    now: planNow,
  });

  function mkSession(
    chapter: number,
    topic: string | null,
    minutes: number,
    daysAfterStart: number = 0,
  ): SessionRecord {
    return {
      at: planNow + daysAfterStart * 24 * 3600 * 1000,
      subject: 'adsp',
      chapter,
      chapterTitle: `ch${chapter}`,
      topic,
      total: 10,
      correctCount: 7,
      totalTimeMs: minutes * 60 * 1000,
    };
  }

  describe('trackProgress', () => {
    it('빈 sessions → actual_progress 0', () => {
      const snap = trackProgress(plan, [], planNow);
      expect(snap.actual_progress).toBe(0);
      // plan 시작 시점엔 expected=0 이라 is_behind=false (앞서 가지도 뒤지지도 않음)
      expect(snap.is_behind).toBe(false);
    });

    it('영역 1 (ch1) sessions 30분 → adsp-1 actual = 30', () => {
      const sessions = [mkSession(1, '데이터의 이해', 30)];
      const snap = trackProgress(plan, sessions, planNow);
      const ch1 = snap.chapter_progress.find((c) => c.chapter_id === 'adsp-1');
      expect(ch1?.actual_minutes).toBe(30);
    });

    it('영역 4 (통계 분석 + 통계적 가설 검정) — 두 topic 모두 stats 영역으로 매핑', () => {
      const sessions = [
        mkSession(3, '통계 분석', 20),
        mkSession(3, '통계적 가설 검정', 25),
      ];
      const snap = trackProgress(plan, sessions, planNow);
      const stats = snap.chapter_progress.find((c) => c.chapter_id === 'adsp-3-stats');
      expect(stats?.actual_minutes).toBe(45);
    });

    it('SQLD session → ADsP plan 의 adsp-1 에 누적 X (subject mismatch)', () => {
      const sessions: SessionRecord[] = [
        {
          at: planNow,
          subject: 'sqld',
          chapter: 1,
          chapterTitle: 'sqld ch1',
          topic: '데이터 모델링의 이해',
          total: 10,
          correctCount: 7,
          totalTimeMs: 30 * 60 * 1000,
        },
      ];
      const snap = trackProgress(plan, sessions, planNow);
      const ch1 = snap.chapter_progress.find((c) => c.chapter_id === 'adsp-1');
      expect(ch1?.actual_minutes).toBe(0);
    });

    it('chapter_progress 5개 (ADsP 5영역)', () => {
      const snap = trackProgress(plan, [], planNow);
      expect(snap.chapter_progress).toHaveLength(5);
    });

    it('completion_rate 100% 캡 (over-achievement)', () => {
      // 영역 1 = 13% × 3300min = 429min planned. 1000min 풀이 시 cap.
      const sessions = [mkSession(1, '데이터의 이해', 1000)];
      const snap = trackProgress(plan, sessions, planNow);
      const ch1 = snap.chapter_progress.find((c) => c.chapter_id === 'adsp-1');
      expect(ch1?.completion_rate).toBe(1);
    });

    it('current_week — plan 시작 직후 = 1', () => {
      const snap = trackProgress(plan, [], planNow);
      expect(snap.current_week).toBe(1);
    });

    it('plan 종료 후 → current_week = 마지막', () => {
      const afterEnd = new Date('2026-09-01').getTime();
      const snap = trackProgress(plan, [], afterEnd);
      expect(snap.current_week).toBe(plan.weeks.length);
      expect(snap.expected_progress).toBe(1);
    });

    it('진행률 30% 이상 뒤처짐 → is_behind = true', () => {
      // plan 절반 시점 + 0% 진행 → delay_ratio = 1 > 0.3
      const half = planNow + Math.floor((plan.d_day.getTime() - planNow) / 2);
      const snap = trackProgress(plan, [], half);
      expect(snap.is_behind).toBe(true);
    });
  });

  describe('getCurrentWeekProgress', () => {
    it('현재 주차의 chapters 반환', () => {
      const wp = getCurrentWeekProgress(plan, [], planNow);
      expect(wp.week_number).toBe(1);
      expect(wp.chapters.length).toBeGreaterThan(0);
    });

    it('chapters 에 display_name 포함', () => {
      const wp = getCurrentWeekProgress(plan, [], planNow);
      const ch1 = wp.chapters.find((c) => c.chapter_id === 'adsp-1');
      if (ch1) expect(ch1.display_name).toBe('1과목 데이터 이해');
    });

    it('sessions 반영된 actual_minutes', () => {
      const sessions = [mkSession(1, '데이터의 이해', 30)];
      const wp = getCurrentWeekProgress(plan, sessions, planNow);
      const ch1 = wp.chapters.find((c) => c.chapter_id === 'adsp-1');
      // 1주차에 ch1 chapter 있으면 actual 분배됨
      if (ch1 && ch1.planned_minutes > 0) {
        expect(ch1.actual_minutes).toBeGreaterThan(0);
      }
    });
  });

  describe('applyProgressToPlan', () => {
    it('plan.weeks[].chapters[].actual_minutes 갱신', () => {
      const sessions = [mkSession(1, '데이터의 이해', 100)];
      const updated = applyProgressToPlan(plan, sessions);
      const totalActual = updated.weeks
        .flatMap((w) => w.chapters)
        .filter((c) => c.chapter_id === 'adsp-1')
        .reduce((s, c) => s + c.actual_minutes, 0);
      expect(totalActual).toBeCloseTo(100, 0);
    });

    it('updated_at 갱신', () => {
      const before = plan.updated_at.getTime();
      const updated = applyProgressToPlan(plan, []);
      expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(before);
    });
  });
});

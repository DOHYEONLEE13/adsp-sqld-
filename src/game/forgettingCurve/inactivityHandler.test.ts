import { describe, it, expect } from 'vitest';
import { handleInactivity, resetQueue, INACTIVITY_THRESHOLDS } from './inactivityHandler';
import type { ReviewItem } from '@/types/learning/reviewItem';

const DAY_MS = 24 * 60 * 60 * 1000;
const TODAY = new Date('2026-05-08T12:00:00.000Z');

function mkItem(overrides: Partial<ReviewItem> = {}): ReviewItem {
  return {
    user_id: 'u',
    question_id: 'Q',
    current_interval: 7,
    ease_factor: 2.5,
    consecutive_correct: 2,
    consecutive_wrong: 0,
    due_date: TODAY,
    last_attempted_at: TODAY,
    status: 'active',
    ...overrides,
  };
}

describe('inactivityHandler', () => {
  describe('handleInactivity 분기', () => {
    it('0일 미접속 → none', () => {
      const r = handleInactivity(TODAY, TODAY, []);
      expect(r.action).toBe('none');
      expect(r.inactivityDays).toBe(0);
    });

    it('1일 미접속 → notify', () => {
      const lastActive = new Date(TODAY.getTime() - 1.5 * DAY_MS);
      const r = handleInactivity(lastActive, TODAY, [mkItem({ question_id: 'Q1' })]);
      expect(r.action).toBe('notify');
      expect(r.message).toContain('1');
      expect(r.pendingCount).toBe(1);
    });

    it('3일 미접속 → inform', () => {
      const lastActive = new Date(TODAY.getTime() - 3 * DAY_MS);
      const r = handleInactivity(lastActive, TODAY, []);
      expect(r.action).toBe('inform');
    });

    it('7일 미접속 → suggest_reset + options', () => {
      const lastActive = new Date(TODAY.getTime() - 7.5 * DAY_MS);
      const r = handleInactivity(lastActive, TODAY, [
        mkItem({ question_id: 'Q1' }),
        mkItem({ question_id: 'Q2' }),
      ]);
      expect(r.action).toBe('suggest_reset');
      expect(r.options).toEqual(['reset', 'keep']);
      expect(r.pendingCount).toBe(2);
    });

    it('30일 미접속 → suggest_reset', () => {
      const lastActive = new Date(TODAY.getTime() - 30 * DAY_MS);
      const r = handleInactivity(lastActive, TODAY, []);
      expect(r.action).toBe('suggest_reset');
    });

    it('THRESHOLDS 상수 정합', () => {
      expect(INACTIVITY_THRESHOLDS.NOTIFY).toBe(1);
      expect(INACTIVITY_THRESHOLDS.INFORM).toBe(3);
      expect(INACTIVITY_THRESHOLDS.SUGGEST_RESET).toBe(7);
    });
  });

  describe('resetQueue', () => {
    it('active 항목 → due_date = today + 1d, interval=1', () => {
      const items = [
        mkItem({ question_id: 'Q1', current_interval: 14, consecutive_correct: 5 }),
        mkItem({ question_id: 'Q2', current_interval: 7, consecutive_wrong: 1 }),
      ];
      const reset = resetQueue(items, TODAY);
      const tomorrow = new Date(TODAY.getTime() + DAY_MS);
      reset.forEach((it) => {
        expect(it.current_interval).toBe(1);
        expect(it.due_date?.getTime()).toBe(tomorrow.getTime());
        expect(it.consecutive_correct).toBe(0);
        expect(it.consecutive_wrong).toBe(0);
      });
    });

    it('paused / mastered 보존 (변경 X)', () => {
      const items = [
        mkItem({ question_id: 'Q-paused', status: 'paused', current_interval: 14 }),
        mkItem({ question_id: 'Q-mastered', status: 'mastered', current_interval: 30 }),
      ];
      const reset = resetQueue(items, TODAY);
      expect(reset[0].status).toBe('paused');
      expect(reset[0].current_interval).toBe(14);
      expect(reset[1].status).toBe('mastered');
      expect(reset[1].current_interval).toBe(30);
    });

    it('ease_factor 보존', () => {
      const items = [mkItem({ ease_factor: 2.8 })];
      const reset = resetQueue(items, TODAY);
      expect(reset[0].ease_factor).toBe(2.8);
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  applyAttempt,
  nextIntervalAfterCorrect,
  createInitialReviewItem,
  resumeFromPaused,
  CONSECUTIVE_WRONG_THRESHOLD,
} from './sm2Algorithm';
import type { ReviewItem } from '@/types/learning/reviewItem';

const NOW = new Date('2026-05-01T00:00:00.000Z');

function mkItem(overrides: Partial<ReviewItem> = {}): ReviewItem {
  return {
    user_id: 'u',
    question_id: 'Q-1',
    current_interval: 1,
    ease_factor: 2.5,
    consecutive_correct: 0,
    consecutive_wrong: 0,
    due_date: NOW,
    last_attempted_at: NOW,
    status: 'active',
    ease_factor_variant: 'STANDARD',
    ...overrides,
  };
}

describe('sm2Algorithm', () => {
  describe('nextIntervalAfterCorrect — 5-tier progression', () => {
    it('0 → 1', () => expect(nextIntervalAfterCorrect(0)).toBe(1));
    it('1 → 3', () => expect(nextIntervalAfterCorrect(1)).toBe(3));
    it('3 → 7', () => expect(nextIntervalAfterCorrect(3)).toBe(7));
    it('7 → 14', () => expect(nextIntervalAfterCorrect(7)).toBe(14));
    it('14 → 30', () => expect(nextIntervalAfterCorrect(14)).toBe(30));
    it('30 → 30 (mastered)', () => expect(nextIntervalAfterCorrect(30)).toBe(30));
  });

  describe('applyAttempt — 정답', () => {
    it('1d 정답 → 3d 진행 + due_date 3일 뒤', () => {
      const r = applyAttempt({
        current: mkItem({ current_interval: 1 }),
        is_correct: true,
        attempted_at: NOW,
      });
      expect(r.next.current_interval).toBe(3);
      const expected = new Date(NOW.getTime() + 3 * 24 * 3600 * 1000);
      expect(r.next.due_date?.getTime()).toBe(expected.getTime());
    });

    it('정답 → ease_factor +0.1 (max 3.0)', () => {
      const r = applyAttempt({
        current: mkItem({ ease_factor: 2.5 }),
        is_correct: true,
        attempted_at: NOW,
      });
      expect(r.next.ease_factor).toBeCloseTo(2.6, 5);
    });

    it('정답 → consecutive_correct +1, consecutive_wrong = 0', () => {
      const r = applyAttempt({
        current: mkItem({ consecutive_correct: 2, consecutive_wrong: 1 }),
        is_correct: true,
        attempted_at: NOW,
      });
      expect(r.next.consecutive_correct).toBe(3);
      expect(r.next.consecutive_wrong).toBe(0);
    });

    it('30d 정답 → mastered + due_date null', () => {
      const r = applyAttempt({
        current: mkItem({ current_interval: 30 }),
        is_correct: true,
        attempted_at: NOW,
      });
      expect(r.next.status).toBe('mastered');
      expect(r.next.due_date).toBeNull();
      expect(r.recommend_lesson_replay).toBe(false);
    });

    it('paused 상태 정답 → active 복귀', () => {
      const r = applyAttempt({
        current: mkItem({ status: 'paused', current_interval: 1 }),
        is_correct: true,
        attempted_at: NOW,
      });
      expect(r.next.status).toBe('active');
    });
  });

  describe('applyAttempt — 오답', () => {
    it('오답 → interval 1d 리셋', () => {
      const r = applyAttempt({
        current: mkItem({ current_interval: 14 }),
        is_correct: false,
        attempted_at: NOW,
      });
      expect(r.next.current_interval).toBe(1);
    });

    it('오답 → ease_factor -0.2 (min 1.3)', () => {
      const r = applyAttempt({
        current: mkItem({ ease_factor: 2.5 }),
        is_correct: false,
        attempted_at: NOW,
      });
      expect(r.next.ease_factor).toBeCloseTo(2.3, 5);
    });

    it('오답 → consecutive_wrong +1, consecutive_correct = 0', () => {
      const r = applyAttempt({
        current: mkItem({ consecutive_correct: 5, consecutive_wrong: 0 }),
        is_correct: false,
        attempted_at: NOW,
      });
      expect(r.next.consecutive_wrong).toBe(1);
      expect(r.next.consecutive_correct).toBe(0);
    });

    it(`${CONSECUTIVE_WRONG_THRESHOLD}회 연속 오답 → paused + lesson 추천`, () => {
      const item = mkItem({
        consecutive_wrong: CONSECUTIVE_WRONG_THRESHOLD - 1,
      });
      const r = applyAttempt({
        current: item,
        is_correct: false,
        attempted_at: NOW,
      });
      expect(r.next.consecutive_wrong).toBe(CONSECUTIVE_WRONG_THRESHOLD);
      expect(r.next.status).toBe('paused');
      expect(r.next.due_date).toBeNull();
      expect(r.recommend_lesson_replay).toBe(true);
    });

    it('1회 오답 → active 유지 + lesson 추천 X', () => {
      const r = applyAttempt({
        current: mkItem({ consecutive_wrong: 0 }),
        is_correct: false,
        attempted_at: NOW,
      });
      expect(r.next.status).toBe('active');
      expect(r.recommend_lesson_replay).toBe(false);
    });

    it('ease_factor 하한 차단 (1.3)', () => {
      const r = applyAttempt({
        current: mkItem({ ease_factor: 1.4 }),
        is_correct: false,
        attempted_at: NOW,
      });
      expect(r.next.ease_factor).toBe(1.3);
    });
  });

  describe('createInitialReviewItem', () => {
    it('첫 풀이 정답 → 1d due_date + consecutive_correct=1', () => {
      const it = createInitialReviewItem('u', 'Q-1', true, 2.5, 'STANDARD', NOW);
      expect(it.current_interval).toBe(1);
      expect(it.consecutive_correct).toBe(1);
      expect(it.consecutive_wrong).toBe(0);
      expect(it.status).toBe('active');
      expect(it.ease_factor).toBe(2.5);
      expect(it.due_date?.getTime()).toBe(
        new Date(NOW.getTime() + 24 * 3600 * 1000).getTime(),
      );
    });

    it('첫 풀이 오답 → consecutive_wrong=1', () => {
      const it = createInitialReviewItem('u', 'Q-1', false, 2.5, 'STANDARD', NOW);
      expect(it.consecutive_wrong).toBe(1);
      expect(it.consecutive_correct).toBe(0);
    });

    it('variant 보존', () => {
      const it = createInitialReviewItem(
        'u',
        'Q-1',
        true,
        2.0,
        'CONSERVATIVE',
        NOW,
      );
      expect(it.ease_factor_variant).toBe('CONSERVATIVE');
      expect(it.ease_factor).toBe(2.0);
    });
  });

  describe('resumeFromPaused', () => {
    it('paused → active + interval 1 + consecutive_wrong 0', () => {
      const item = mkItem({
        status: 'paused',
        consecutive_wrong: 3,
        current_interval: 14,
      });
      const r = resumeFromPaused(item, NOW);
      expect(r.status).toBe('active');
      expect(r.current_interval).toBe(1);
      expect(r.consecutive_wrong).toBe(0);
    });

    it('paused 가 아니면 변경 없음', () => {
      const item = mkItem({ status: 'active' });
      const r = resumeFromPaused(item, NOW);
      expect(r).toEqual(item);
    });
  });

  describe('5-tier 전체 progression 시나리오', () => {
    it('정답 5회 연속 — 1 → 3 → 7 → 14 → 30 → mastered', () => {
      let item = createInitialReviewItem('u', 'Q-1', true, 2.5, 'STANDARD', NOW);
      // 첫 풀이 정답 → interval=1

      // 1d → 3d
      let r = applyAttempt({ current: item, is_correct: true, attempted_at: NOW });
      expect(r.next.current_interval).toBe(3);
      item = r.next;

      // 3d → 7d
      r = applyAttempt({ current: item, is_correct: true, attempted_at: NOW });
      expect(r.next.current_interval).toBe(7);
      item = r.next;

      // 7d → 14d
      r = applyAttempt({ current: item, is_correct: true, attempted_at: NOW });
      expect(r.next.current_interval).toBe(14);
      item = r.next;

      // 14d → 30d
      r = applyAttempt({ current: item, is_correct: true, attempted_at: NOW });
      expect(r.next.current_interval).toBe(30);
      expect(r.next.status).toBe('active');
      item = r.next;

      // 30d 정답 → mastered
      r = applyAttempt({ current: item, is_correct: true, attempted_at: NOW });
      expect(r.next.status).toBe('mastered');
      expect(r.next.due_date).toBeNull();
    });
  });
});

/**
 * Hardening 테스트 — 경계 조건, 데이터 손실 fallback, 큐 폭발 시나리오.
 *
 * Phase 4 Step 4.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  applyAttempt,
  createInitialReviewItem,
  generateDailyReviewQueue,
  detectQueueOverflow,
  autoMasterStaleItems,
  handleInactivity,
  resetQueue,
  saveReviewItems,
  loadReviewItems,
  upsertReviewItem,
} from './index';
import type { ReviewItem } from '@/types/learning/reviewItem';

const NOW = new Date('2026-05-01T00:00:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;

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
    ...overrides,
  };
}

describe('Hardening — 경계 조건', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') window.localStorage?.clear();
  });

  describe('applyAttempt 경계', () => {
    it('ease_factor 가 음수 — clamp 1.3', () => {
      const item = mkItem({ ease_factor: -1 });
      const r = applyAttempt({
        current: item,
        is_correct: true,
        attempted_at: NOW,
      });
      // -1 + 0.1 = -0.9 → clamp 1.3
      expect(r.next.ease_factor).toBe(1.3);
    });

    it('ease_factor 가 매우 큼 — clamp 3.0', () => {
      const item = mkItem({ ease_factor: 99 });
      const r = applyAttempt({
        current: item,
        is_correct: true,
        attempted_at: NOW,
      });
      expect(r.next.ease_factor).toBe(3.0);
    });

    it('consecutive_wrong 매우 큼 — paused 진입 (1회만)', () => {
      const item = mkItem({ consecutive_wrong: 100 });
      const r = applyAttempt({
        current: item,
        is_correct: false,
        attempted_at: NOW,
      });
      expect(r.next.status).toBe('paused');
      expect(r.recommend_lesson_replay).toBe(true);
    });

    it('정답으로 paused 회복', () => {
      const item = mkItem({
        status: 'paused',
        current_interval: 1,
        consecutive_wrong: 5,
      });
      const r = applyAttempt({
        current: item,
        is_correct: true,
        attempted_at: NOW,
      });
      expect(r.next.status).toBe('active');
      expect(r.next.consecutive_wrong).toBe(0);
    });
  });

  describe('큐 폭발 방지', () => {
    it('상한 초과 — 우선순위 낮은 항목 다음 날 이월', () => {
      // 50문항 만기, beginner 상한 15 → 15문항만 큐, 나머지 35문항 다음 날
      const items = Array.from({ length: 50 }, (_, i) =>
        mkItem({ question_id: `Q-${i}`, due_date: NOW }),
      );
      const queue = generateDailyReviewQueue({
        items,
        persona: 'beginner',
        today: NOW,
      });
      expect(queue).toHaveLength(15);
      // 큐에 들어가지 않은 35문항은 다음 날도 due_date 기준 만기 — 자동 이월
    });

    it('detectQueueOverflow — 7일+ 누적 시 알림 트리거', () => {
      const oldDue = new Date(NOW.getTime() - 10 * DAY_MS);
      const items = Array.from({ length: 100 }, (_, i) =>
        mkItem({ question_id: `Q-${i}`, due_date: oldDue }),
      );
      const result = detectQueueOverflow(items, NOW);
      expect(result.overflowCount).toBe(100);
      expect(result.oldestDays).toBe(10);
    });

    it('autoMasterStaleItems — 30일+ 자동 mastered', () => {
      const veryOld = new Date(NOW.getTime() - 35 * DAY_MS);
      const items = [
        mkItem({ question_id: 'Q-stale-1', due_date: veryOld }),
        mkItem({ question_id: 'Q-stale-2', due_date: veryOld }),
        mkItem({ question_id: 'Q-fresh', due_date: NOW }),
      ];
      const result = autoMasterStaleItems(items, NOW);
      expect(result.staleIds).toHaveLength(2);
      expect(result.updatedItems.find((x) => x.question_id === 'Q-fresh')?.status).toBe('active');
    });
  });

  describe('미접속 처리 경계', () => {
    it('100일 미접속 — suggest_reset (상한 없음)', () => {
      const lastActive = new Date(NOW.getTime() - 100 * DAY_MS);
      const r = handleInactivity(lastActive, NOW, []);
      expect(r.action).toBe('suggest_reset');
      expect(r.inactivityDays).toBe(100);
    });

    it('미래 시각 — inactivityDays 0 (clamp)', () => {
      const future = new Date(NOW.getTime() + DAY_MS);
      const r = handleInactivity(future, NOW, []);
      // future 면 lastActive > today → days < 0 → none
      expect(r.action).toBe('none');
    });

    it('resetQueue — paused/mastered 보존', () => {
      const items = [
        mkItem({ question_id: 'Q-paused', status: 'paused' }),
        mkItem({ question_id: 'Q-mastered', status: 'mastered' }),
        mkItem({ question_id: 'Q-active', status: 'active' }),
      ];
      const reset = resetQueue(items, NOW);
      expect(reset.find((x) => x.question_id === 'Q-paused')?.status).toBe('paused');
      expect(reset.find((x) => x.question_id === 'Q-mastered')?.status).toBe('mastered');
      expect(reset.find((x) => x.question_id === 'Q-active')?.status).toBe('active');
    });
  });

  describe('데이터 손실 fallback', () => {
    it('localStorage 손상된 JSON → loadReviewItems 빈 배열', () => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem('questdp_review_items_v1', '{not valid');
      expect(loadReviewItems()).toEqual([]);
    });

    it('upsertReviewItem 후 손상 → 새 save 가 복구', () => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem('questdp_review_items_v1', 'broken');
      // upsert 호출 — 내부에서 load 실패 → 빈 배열에 새 항목 추가
      const updated = upsertReviewItem(mkItem({ question_id: 'Q-rec' }));
      expect(updated).toHaveLength(1);
      expect(loadReviewItems()).toHaveLength(1);
    });
  });

  describe('createInitialReviewItem 경계', () => {
    it('미래 시각 attempted_at — due_date 도 미래로', () => {
      const future = new Date(NOW.getTime() + 7 * DAY_MS);
      const item = createInitialReviewItem('u', 'Q', true, 2.5, 'STANDARD', future);
      expect(item.due_date?.getTime()).toBe(future.getTime() + DAY_MS);
    });

    it('ease_factor 0 — 그대로 보존 (clamp 안 함, 직접 입력 신뢰)', () => {
      // createInitialReviewItem 은 clamp 안 함 — caller 가 easeFactorInitial 통해 valid 값 전달
      // 다만 다음 applyAttempt 시 update 시 clamp 작동
      const item = createInitialReviewItem('u', 'Q', true, 0, 'STANDARD', NOW);
      expect(item.ease_factor).toBe(0);
      // applyAttempt → ease 0 + 0.1 = 0.1 → clamp 1.3
      const r = applyAttempt({ current: item, is_correct: true, attempted_at: NOW });
      expect(r.next.ease_factor).toBe(1.3);
    });
  });

  describe('save → load → save round-trip 안정성', () => {
    it('100 항목 save/load — 데이터 무손실', () => {
      if (typeof window === 'undefined') return;
      const items = Array.from({ length: 100 }, (_, i) =>
        mkItem({
          question_id: `Q-${i}`,
          ease_factor: 2.0 + (i % 10) / 10,
          current_interval: ([1, 3, 7, 14, 30] as const)[i % 5],
        }),
      );
      saveReviewItems(items);
      const loaded = loadReviewItems();
      expect(loaded).toHaveLength(100);
      expect(loaded[42].ease_factor).toBeCloseTo(items[42].ease_factor, 5);
    });

    it('mastered (due_date null) 보존', () => {
      if (typeof window === 'undefined') return;
      saveReviewItems([
        mkItem({ question_id: 'Q-m', status: 'mastered', due_date: null }),
      ]);
      const loaded = loadReviewItems();
      expect(loaded[0].status).toBe('mastered');
      expect(loaded[0].due_date).toBeNull();
    });
  });
});

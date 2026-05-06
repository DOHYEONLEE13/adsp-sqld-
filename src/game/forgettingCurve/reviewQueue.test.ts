import { describe, it, expect } from 'vitest';
import {
  generateDailyReviewQueue,
  detectQueueOverflow,
  autoMasterStaleItems,
} from './reviewQueue';
import type { ReviewItem } from '@/types/learning/reviewItem';
import type { SessionRecord } from '@/game/storage';

const TODAY = new Date('2026-05-01T12:00:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;

function mkItem(overrides: Partial<ReviewItem> = {}): ReviewItem {
  return {
    user_id: 'u',
    question_id: 'Q-1',
    current_interval: 1,
    ease_factor: 2.5,
    consecutive_correct: 0,
    consecutive_wrong: 0,
    due_date: TODAY,
    last_attempted_at: new Date(TODAY.getTime() - DAY_MS),
    status: 'active',
    ...overrides,
  };
}

describe('reviewQueue', () => {
  describe('generateDailyReviewQueue — 우선순위', () => {
    it('빈 items → 빈 큐', () => {
      const q = generateDailyReviewQueue({
        items: [],
        persona: 'beginner',
        today: TODAY,
      });
      expect(q).toEqual([]);
    });

    it('paused / mastered 제외', () => {
      const q = generateDailyReviewQueue({
        items: [
          mkItem({ question_id: 'Q-1', status: 'paused' }),
          mkItem({ question_id: 'Q-2', status: 'mastered' }),
          mkItem({ question_id: 'Q-3', status: 'active' }),
        ],
        persona: 'beginner',
        today: TODAY,
      });
      expect(q).toHaveLength(1);
      expect(q[0].question_id).toBe('Q-3');
    });

    it('미만기 항목 제외 (due_date > today)', () => {
      const future = new Date(TODAY.getTime() + 3 * DAY_MS);
      const q = generateDailyReviewQueue({
        items: [
          mkItem({ question_id: 'Q-future', due_date: future }),
          mkItem({ question_id: 'Q-due', due_date: TODAY }),
        ],
        persona: 'beginner',
        today: TODAY,
      });
      expect(q.map((x) => x.question_id)).toEqual(['Q-due']);
    });

    it('overdue 가 normal 보다 우선', () => {
      const overdueDate = new Date(TODAY.getTime() - 5 * DAY_MS);
      const q = generateDailyReviewQueue({
        items: [
          mkItem({ question_id: 'Q-normal', due_date: TODAY }),
          mkItem({ question_id: 'Q-overdue', due_date: overdueDate }),
        ],
        persona: 'beginner',
        today: TODAY,
      });
      expect(q[0].question_id).toBe('Q-overdue');
      expect(q[0].priority_reason).toBe('overdue');
    });

    it('어제 오답 → wrong_yesterday reason', () => {
      const yesterday = new Date(TODAY.getTime() - DAY_MS);
      const session: SessionRecord = {
        at: yesterday.getTime() + 1000,
        subject: 'adsp',
        chapter: 1,
        chapterTitle: 'ch1',
        topic: '데이터의 이해',
        total: 5,
        correctCount: 3,
        totalTimeMs: 60000,
        wrongQuestionIds: ['Q-wrong'],
      };
      const q = generateDailyReviewQueue({
        items: [
          mkItem({ question_id: 'Q-normal', due_date: TODAY }),
          mkItem({ question_id: 'Q-wrong', due_date: TODAY }),
        ],
        persona: 'beginner',
        today: TODAY,
        sessions: [session],
      });
      const wrong = q.find((x) => x.question_id === 'Q-wrong');
      expect(wrong?.priority_reason).toBe('wrong_yesterday');
      // 우선순위 점수가 normal 보다 높음
      const normal = q.find((x) => x.question_id === 'Q-normal');
      expect(wrong!.priority).toBeGreaterThan(normal!.priority);
    });

    it('약점 chapter — weak_chapter reason', () => {
      const q = generateDailyReviewQueue({
        items: [
          mkItem({ question_id: 'Q-weak' }),
          mkItem({ question_id: 'Q-normal' }),
        ],
        weak_chapters: ['adsp-3-stats'],
        persona: 'reviewer',
        today: TODAY,
        questionMeta: {
          'Q-weak': {
            subject: 'adsp',
            chapter: 3,
            topic: '통계 분석',
            chapter_id: 'adsp-3-stats',
          },
          'Q-normal': {
            subject: 'adsp',
            chapter: 1,
            topic: '데이터의 이해',
            chapter_id: 'adsp-1',
          },
        },
      });
      const weak = q.find((x) => x.question_id === 'Q-weak');
      expect(weak?.priority_reason).toBe('weak_chapter');
    });

    it('beginner 일일 상한 15', () => {
      const items = Array.from({ length: 30 }, (_, i) =>
        mkItem({ question_id: `Q-${i}`, due_date: TODAY }),
      );
      const q = generateDailyReviewQueue({
        items,
        persona: 'beginner',
        today: TODAY,
      });
      expect(q).toHaveLength(15);
    });

    it('reviewer 일일 상한 25', () => {
      const items = Array.from({ length: 30 }, (_, i) =>
        mkItem({ question_id: `Q-${i}`, due_date: TODAY }),
      );
      const q = generateDailyReviewQueue({
        items,
        persona: 'reviewer',
        today: TODAY,
      });
      expect(q).toHaveLength(25);
    });

    it('priority 내림차순 정렬', () => {
      const q = generateDailyReviewQueue({
        items: [
          mkItem({ question_id: 'Q-1', due_date: TODAY }),
          mkItem({
            question_id: 'Q-overdue',
            due_date: new Date(TODAY.getTime() - 5 * DAY_MS),
          }),
        ],
        persona: 'beginner',
        today: TODAY,
      });
      for (let i = 1; i < q.length; i++) {
        expect(q[i - 1].priority).toBeGreaterThanOrEqual(q[i].priority);
      }
    });
  });

  describe('detectQueueOverflow', () => {
    it('만기 7일 이상 항목 카운트', () => {
      const old = new Date(TODAY.getTime() - 10 * DAY_MS);
      const recent = new Date(TODAY.getTime() - 3 * DAY_MS);
      const result = detectQueueOverflow(
        [
          mkItem({ question_id: 'Q-old', due_date: old }),
          mkItem({ question_id: 'Q-recent', due_date: recent }),
        ],
        TODAY,
      );
      expect(result.overflowCount).toBe(1);
      expect(result.oldestDays).toBe(10);
    });
  });

  describe('autoMasterStaleItems', () => {
    it('30일 이상 미수행 → mastered 자동 전환', () => {
      const stale = new Date(TODAY.getTime() - 35 * DAY_MS);
      const fresh = TODAY;
      const result = autoMasterStaleItems(
        [
          mkItem({ question_id: 'Q-stale', due_date: stale }),
          mkItem({ question_id: 'Q-fresh', due_date: fresh }),
        ],
        TODAY,
      );
      expect(result.staleIds).toEqual(['Q-stale']);
      const stalItem = result.updatedItems.find((x) => x.question_id === 'Q-stale');
      expect(stalItem?.status).toBe('mastered');
      expect(stalItem?.due_date).toBeNull();
    });
  });
});

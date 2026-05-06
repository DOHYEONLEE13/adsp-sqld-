import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveReviewItems,
  loadReviewItems,
  clearReviewItems,
  upsertReviewItem,
  findReviewItem,
  loadActiveReviewItems,
} from './reviewItemStorage';
import { createInitialReviewItem } from './sm2Algorithm';
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
    ...overrides,
  };
}

describe('reviewItemStorage', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') window.localStorage?.clear();
  });

  it('초기 → 빈 배열', () => {
    if (typeof window === 'undefined') return;
    expect(loadReviewItems()).toEqual([]);
  });

  it('save → load round-trip', () => {
    if (typeof window === 'undefined') return;
    const items = [mkItem({ question_id: 'Q-A' }), mkItem({ question_id: 'Q-B' })];
    saveReviewItems(items);
    const loaded = loadReviewItems();
    expect(loaded).toHaveLength(2);
    expect(loaded[0].question_id).toBe('Q-A');
    expect(loaded[0].due_date).toBeInstanceOf(Date);
    expect(loaded[0].last_attempted_at).toBeInstanceOf(Date);
  });

  it('createInitialReviewItem → save → load 정합', () => {
    if (typeof window === 'undefined') return;
    const it = createInitialReviewItem('u', 'Q-1', true, 2.5, 'STANDARD', NOW);
    saveReviewItems([it]);
    const loaded = loadReviewItems();
    expect(loaded[0].ease_factor_variant).toBe('STANDARD');
    expect(loaded[0].current_interval).toBe(1);
    expect(loaded[0].due_date?.toISOString()).toBe(it.due_date?.toISOString());
  });

  it('upsertReviewItem — 기존 갱신', () => {
    if (typeof window === 'undefined') return;
    saveReviewItems([mkItem({ question_id: 'Q-A', ease_factor: 2.0 })]);
    const updated = upsertReviewItem(mkItem({ question_id: 'Q-A', ease_factor: 2.8 }));
    expect(updated).toHaveLength(1);
    expect(updated[0].ease_factor).toBe(2.8);
  });

  it('upsertReviewItem — 신규 추가', () => {
    if (typeof window === 'undefined') return;
    saveReviewItems([mkItem({ question_id: 'Q-A' })]);
    const updated = upsertReviewItem(mkItem({ question_id: 'Q-B' }));
    expect(updated).toHaveLength(2);
  });

  it('findReviewItem — 매칭', () => {
    if (typeof window === 'undefined') return;
    saveReviewItems([mkItem({ question_id: 'Q-X', ease_factor: 2.7 })]);
    const found = findReviewItem('u', 'Q-X');
    expect(found?.ease_factor).toBe(2.7);
  });

  it('findReviewItem — 미매칭 → null', () => {
    if (typeof window === 'undefined') return;
    expect(findReviewItem('u', 'nope')).toBeNull();
  });

  it('loadActiveReviewItems — paused/mastered 제외', () => {
    if (typeof window === 'undefined') return;
    saveReviewItems([
      mkItem({ question_id: 'Q-A', status: 'active' }),
      mkItem({ question_id: 'Q-B', status: 'paused' }),
      mkItem({ question_id: 'Q-C', status: 'mastered' }),
    ]);
    const active = loadActiveReviewItems('u');
    expect(active).toHaveLength(1);
    expect(active[0].question_id).toBe('Q-A');
  });

  it('clearReviewItems → 빈 배열', () => {
    if (typeof window === 'undefined') return;
    saveReviewItems([mkItem()]);
    clearReviewItems();
    expect(loadReviewItems()).toEqual([]);
  });

  it('잘못된 JSON → 빈 배열 fallback', () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('questdp_review_items_v1', 'not-json');
    expect(loadReviewItems()).toEqual([]);
  });

  it('schema 버전 mismatch → 빈 배열', () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      'questdp_review_items_v1',
      JSON.stringify({ _v: 999, items: [] }),
    );
    expect(loadReviewItems()).toEqual([]);
  });

  it('due_date null 보존', () => {
    if (typeof window === 'undefined') return;
    saveReviewItems([
      mkItem({ question_id: 'Q-mast', status: 'mastered', due_date: null }),
    ]);
    const loaded = loadReviewItems();
    expect(loaded[0].due_date).toBeNull();
  });
});

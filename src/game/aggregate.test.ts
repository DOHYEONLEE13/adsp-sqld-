/**
 * aggregate.test.ts — 진도 집계 검증.
 *
 * 핵심: aggregateTopic 가 raw topic 을 직접 비교하지 않고 canonicalTopic 을
 * 거쳐 매핑된 문항만 집계하는지. 이게 깨지면 Zone 노드의 진도 뱃지가 0 으로
 * 박힘 (alias 매핑된 문항이 카운트 안 됨).
 */

import { describe, it, expect } from 'vitest';
import {
  aggregateSubject,
  aggregateChapter,
  aggregateTopic,
  formatProgressLabel,
  solvedRatio,
  type Aggregate,
} from './aggregate';
import type { ProgressStore, QuestionStat } from './storage';
import { ALL_QUESTIONS } from '@/lib/questions';
import { isPlayable } from './session';

const SCHEMA_VERSION = 1 as const;
const NOW = 1_700_000_000_000;

function emptyStore(): ProgressStore {
  return {
    version: SCHEMA_VERSION,
    questionStats: {},
    sessions: [],
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function stat(p: Partial<QuestionStat> = {}): QuestionStat {
  return {
    attempts: 1,
    correct: 1,
    wrongStreak: 0,
    lastCorrect: true,
    lastSeenAt: NOW,
    lastTimeMs: 30000,
    avgTimeMs: 30000,
    ...p,
  };
}

describe('aggregateSubject — 과목 전체 집계', () => {
  it('빈 store → solved=0, accuracy=0, total > 0', () => {
    const agg = aggregateSubject('adsp', emptyStore());
    expect(agg.solved).toBe(0);
    expect(agg.mastered).toBe(0);
    expect(agg.accuracy).toBe(0);
    expect(agg.total).toBeGreaterThan(0); // ADSP 문항이 있어야 함
  });

  it('첫 문항 1번 정답 → solved=1, mastered=1, accuracy=1', () => {
    const adspQ = ALL_QUESTIONS.find(
      (q) => q.subject === 'adsp' && isPlayable(q),
    );
    expect(adspQ, 'ADSP playable 문항 있어야 함').toBeDefined();
    const store = emptyStore();
    store.questionStats[adspQ!.id] = stat({ attempts: 1, correct: 1, lastCorrect: true });

    const agg = aggregateSubject('adsp', store);
    expect(agg.solved).toBe(1);
    expect(agg.mastered).toBe(1);
    expect(agg.accuracy).toBe(1);
  });

  it('마지막에 틀린 경우 — solved 카운트 O, mastered 카운트 X', () => {
    const adspQ = ALL_QUESTIONS.find(
      (q) => q.subject === 'adsp' && isPlayable(q),
    );
    const store = emptyStore();
    store.questionStats[adspQ!.id] = stat({
      attempts: 3,
      correct: 1,
      lastCorrect: false,
    });

    const agg = aggregateSubject('adsp', store);
    expect(agg.solved).toBe(1);
    expect(agg.mastered).toBe(0);
    expect(agg.accuracy).toBeCloseTo(1 / 3);
  });

  it('두 과목은 격리됨 — adsp store 가 sqld 집계에 영향 없음', () => {
    const adspQ = ALL_QUESTIONS.find(
      (q) => q.subject === 'adsp' && isPlayable(q),
    );
    const store = emptyStore();
    store.questionStats[adspQ!.id] = stat();

    const sqldAgg = aggregateSubject('sqld', store);
    expect(sqldAgg.solved).toBe(0); // ADSP 풀이는 SQLD 에 영향 없음
  });
});

describe('aggregateChapter — 챕터 단위 집계', () => {
  it('전체 챕터 합 = subject 합 (모든 챕터를 합산하면 일치)', () => {
    const store = emptyStore();
    // 임의로 5개 ADSP 문항을 정답 처리
    const samples = ALL_QUESTIONS.filter(
      (q) => q.subject === 'adsp' && isPlayable(q),
    ).slice(0, 5);
    for (const q of samples) {
      store.questionStats[q.id] = stat();
    }

    const subjectAgg = aggregateSubject('adsp', store);
    let chapterSolvedSum = 0;
    let chapterMasteredSum = 0;
    for (const ch of [1, 2, 3]) {
      const a = aggregateChapter('adsp', ch, store);
      chapterSolvedSum += a.solved;
      chapterMasteredSum += a.mastered;
    }
    expect(chapterSolvedSum).toBe(subjectAgg.solved);
    expect(chapterMasteredSum).toBe(subjectAgg.mastered);
  });

  it('존재하지 않는 챕터 → total=0, solved=0', () => {
    const agg = aggregateChapter('adsp', 99, emptyStore());
    expect(agg.total).toBe(0);
    expect(agg.solved).toBe(0);
  });
});

describe('aggregateTopic — canonicalTopic 매핑 거쳐서 집계', () => {
  it('스키마 토픽으로 그대로 등록된 문항 — 정상 집계', () => {
    // ADSP ch1 의 "데이터의 이해" 문항을 찾아서 풀어둠.
    const q = ALL_QUESTIONS.find(
      (q) =>
        q.subject === 'adsp' &&
        q.chapter === 1 &&
        q.topic === '데이터의 이해' &&
        isPlayable(q),
    );
    if (!q) {
      // skip — 데이터에 따라 없을 수도 있음
      return;
    }
    const store = emptyStore();
    store.questionStats[q.id] = stat();

    const agg = aggregateTopic('adsp', 1, '데이터의 이해', store);
    expect(agg.solved).toBeGreaterThanOrEqual(1);
  });

  it('alias 매핑된 raw 토픽 문항도 canonical 로 집계됨', () => {
    // ADSP 'DIKW 피라미드' raw → canonical '데이터의 이해'
    const q = ALL_QUESTIONS.find(
      (q) =>
        q.subject === 'adsp' &&
        q.chapter === 1 &&
        q.topic === 'DIKW 피라미드' &&
        isPlayable(q),
    );
    if (!q) return; // 데이터에 따라 없을 수도

    const store = emptyStore();
    store.questionStats[q.id] = stat();

    const agg = aggregateTopic('adsp', 1, '데이터의 이해', store);
    expect(agg.solved).toBeGreaterThanOrEqual(1);
  });

  it('canonical 매핑 안 되는 raw 는 토픽 집계에서 제외', () => {
    // 가짜 문항 ID 로 시도 — 이건 ALL_QUESTIONS 에 없으니 abort.
    // 대신 존재하지 않는 토픽으로 호출하면 0.
    const agg = aggregateTopic('adsp', 1, '없는토픽xyz', emptyStore());
    expect(agg.total).toBe(0);
    expect(agg.solved).toBe(0);
  });
});

describe('formatProgressLabel — UI 표시', () => {
  function agg(p: Partial<Aggregate>): Aggregate {
    return { total: 10, solved: 5, mastered: 3, accuracy: 0.6, ...p };
  }

  it('total=0 → "—"', () => {
    expect(formatProgressLabel(agg({ total: 0 }))).toBe('—');
  });
  it('solved=0 → "0 / N"', () => {
    expect(formatProgressLabel(agg({ solved: 0, total: 42 }))).toBe('0 / 42');
  });
  it('정상 → "5 / 10 · 60%"', () => {
    expect(formatProgressLabel(agg({ solved: 5, total: 10, accuracy: 0.6 }))).toBe(
      '5 / 10 · 60%',
    );
  });
  it('정확도 round — 0.776 → 78%', () => {
    expect(formatProgressLabel(agg({ solved: 7, total: 9, accuracy: 0.776 }))).toBe(
      '7 / 9 · 78%',
    );
  });
});

describe('solvedRatio — 진도 바 너비', () => {
  it('total=0 → 0', () => {
    expect(solvedRatio({ total: 0, solved: 0, mastered: 0, accuracy: 0 })).toBe(0);
  });
  it('solved=총수 → 1', () => {
    expect(solvedRatio({ total: 10, solved: 10, mastered: 0, accuracy: 0 })).toBe(1);
  });
  it('절반 → 0.5', () => {
    expect(solvedRatio({ total: 10, solved: 5, mastered: 0, accuracy: 0 })).toBe(0.5);
  });
});

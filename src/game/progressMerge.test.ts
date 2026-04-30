/**
 * progressMerge 의 머지 정책 회귀 테스트.
 *
 * 다기기 동기화 결함의 정확한 재발 영역. 한 케이스라도 깨지면 server↔local
 * 일관성이 무너지므로 PR 통과 조건.
 */

import { describe, it, expect } from 'vitest';
import {
  mergeProgress,
  type ServerQuestionStatRow,
  type ServerSessionRow,
  type ServerProgressMeta,
} from './progressMerge';
import type { ProgressStore, QuestionStat } from './storage';

// ─── 헬퍼 ────────────────────────────────────────────────────────────

function emptyLocal(): ProgressStore {
  return {
    version: 1,
    questionStats: {},
    sessions: [],
    createdAt: 1000,
    updatedAt: 1000,
  };
}

function stat(over: Partial<QuestionStat> = {}): QuestionStat {
  return {
    attempts: 1,
    correct: 1,
    wrongStreak: 0,
    lastCorrect: true,
    lastSeenAt: 1_700_000_000_000,
    lastTimeMs: 5000,
    avgTimeMs: 5000,
    ...over,
  };
}

function serverStatRow(
  question_id: string,
  over: Partial<ServerQuestionStatRow> = {},
): ServerQuestionStatRow {
  return {
    question_id,
    attempts: 1,
    correct: 1,
    wrong_streak: 0,
    last_correct: true,
    last_seen_at: '2023-11-14T22:13:20.000Z', // = 1_700_000_000_000
    last_time_ms: 5000,
    avg_time_ms: 5000,
    ...over,
  };
}

function emptyMeta(): ServerProgressMeta {
  return { active_subject: null, last_daily_mission_at: null, lesson_xp: 0 };
}

// ─── 테스트 ──────────────────────────────────────────────────────────

describe('mergeProgress — questionStats', () => {
  it('empty local + empty server → empty', () => {
    const out = mergeProgress({
      local: emptyLocal(),
      serverStats: [],
      serverSessions: [],
      serverMeta: emptyMeta(),
    });
    expect(Object.keys(out.questionStats)).toEqual([]);
    expect(out.sessions).toEqual([]);
  });

  it('empty local + server has 3 stats → all 3 from server', () => {
    const out = mergeProgress({
      local: emptyLocal(),
      serverStats: [
        serverStatRow('q1'),
        serverStatRow('q2'),
        serverStatRow('q3'),
      ],
      serverSessions: [],
      serverMeta: emptyMeta(),
    });
    expect(Object.keys(out.questionStats).sort()).toEqual(['q1', 'q2', 'q3']);
  });

  it('local has 2 stats + empty server → local preserved (push pending 케이스)', () => {
    const local = emptyLocal();
    local.questionStats['q1'] = stat();
    local.questionStats['q2'] = stat();
    const out = mergeProgress({
      local,
      serverStats: [],
      serverSessions: [],
      serverMeta: emptyMeta(),
    });
    expect(Object.keys(out.questionStats).sort()).toEqual(['q1', 'q2']);
  });

  it('overlap: local newer (lastSeenAt 더 큼) → local 채택', () => {
    const local = emptyLocal();
    local.questionStats['q1'] = stat({
      lastSeenAt: 2_000_000_000_000,
      attempts: 7,
      correct: 5,
    });
    const out = mergeProgress({
      local,
      serverStats: [
        serverStatRow('q1', {
          last_seen_at: '2023-11-14T22:13:20.000Z', // 1_700_000_000_000
          attempts: 5,
          correct: 3,
        }),
      ],
      serverSessions: [],
      serverMeta: emptyMeta(),
    });
    expect(out.questionStats['q1'].attempts).toBe(7);
    expect(out.questionStats['q1'].correct).toBe(5);
    expect(out.questionStats['q1'].lastSeenAt).toBe(2_000_000_000_000);
  });

  it('overlap: server newer → server 채택', () => {
    const local = emptyLocal();
    local.questionStats['q1'] = stat({
      lastSeenAt: 1_500_000_000_000,
      attempts: 2,
    });
    const out = mergeProgress({
      local,
      serverStats: [
        serverStatRow('q1', {
          last_seen_at: '2023-11-14T22:13:20.000Z', // 1_700_000_000_000
          attempts: 9,
        }),
      ],
      serverSessions: [],
      serverMeta: emptyMeta(),
    });
    expect(out.questionStats['q1'].attempts).toBe(9);
    expect(out.questionStats['q1'].lastSeenAt).toBe(1_700_000_000_000);
  });

  it('overlap: lastSeenAt 동일 → server 채택 (tie-break)', () => {
    const local = emptyLocal();
    local.questionStats['q1'] = stat({
      lastSeenAt: 1_700_000_000_000,
      attempts: 99,
    });
    const out = mergeProgress({
      local,
      serverStats: [
        serverStatRow('q1', {
          last_seen_at: '2023-11-14T22:13:20.000Z',
          attempts: 1,
        }),
      ],
      serverSessions: [],
      serverMeta: emptyMeta(),
    });
    // tie-break = server
    expect(out.questionStats['q1'].attempts).toBe(1);
  });
});

describe('mergeProgress — sessions', () => {
  it('server 가 비어 있으면 local 보존 (네트워크 일시 실패 보호)', () => {
    const local = emptyLocal();
    local.sessions = [
      {
        at: 1000,
        subject: 'adsp',
        chapter: 1,
        chapterTitle: '데이터 이해',
        topic: null,
        total: 10,
        correctCount: 7,
        totalTimeMs: 30000,
      },
    ];
    const out = mergeProgress({
      local,
      serverStats: [],
      serverSessions: [],
      serverMeta: emptyMeta(),
    });
    expect(out.sessions.length).toBe(1);
    expect(out.sessions[0].correctCount).toBe(7);
  });

  it('server 가 있으면 server list 가 진실 (local 덮어씀)', () => {
    const local = emptyLocal();
    local.sessions = [
      {
        at: 500,
        subject: 'adsp',
        chapter: 1,
        chapterTitle: 'old',
        topic: null,
        total: 5,
        correctCount: 1,
        totalTimeMs: 10000,
      },
    ];
    const serverSessions: ServerSessionRow[] = [
      {
        subject: 'sqld',
        chapter: 2,
        chapter_title: '서버에서 온 새 세션',
        topic: null,
        total: 10,
        correct_count: 9,
        total_time_ms: 60000,
        label: null,
        wrong_question_ids: null,
        ended_at: '2024-01-01T00:00:00.000Z',
        client_id: 'srv-1',
      },
    ];
    const out = mergeProgress({
      local,
      serverStats: [],
      serverSessions,
      serverMeta: emptyMeta(),
    });
    expect(out.sessions.length).toBe(1);
    expect(out.sessions[0].chapterTitle).toBe('서버에서 온 새 세션');
    expect(out.sessions[0].correctCount).toBe(9);
  });

  it('server sessions 200 개 초과 → 최근 200 개로 슬라이스', () => {
    const serverSessions: ServerSessionRow[] = Array.from(
      { length: 250 },
      (_, i) => ({
        subject: 'adsp' as const,
        chapter: 1,
        chapter_title: `s${i}`,
        topic: null,
        total: 10,
        correct_count: 5,
        total_time_ms: 30000,
        label: null,
        wrong_question_ids: null,
        ended_at: new Date(1_700_000_000_000 + i * 1000).toISOString(),
        client_id: `c${i}`,
      }),
    );
    const out = mergeProgress({
      local: emptyLocal(),
      serverStats: [],
      serverSessions,
      serverMeta: emptyMeta(),
    });
    expect(out.sessions.length).toBe(200);
  });
});

describe('mergeProgress — meta', () => {
  it('lessonXp: max(server, local) — XP 손실 방지', () => {
    const local = emptyLocal();
    local.lessonXp = 50;
    const out = mergeProgress({
      local,
      serverStats: [],
      serverSessions: [],
      serverMeta: { active_subject: null, last_daily_mission_at: null, lesson_xp: 30 },
    });
    expect(out.lessonXp).toBe(50);

    const out2 = mergeProgress({
      local,
      serverStats: [],
      serverSessions: [],
      serverMeta: { active_subject: null, last_daily_mission_at: null, lesson_xp: 80 },
    });
    expect(out2.lessonXp).toBe(80);
  });

  it('activeSubject: server 우선, server null 이면 local 유지', () => {
    const local = emptyLocal();
    local.activeSubject = 'adsp';
    const out = mergeProgress({
      local,
      serverStats: [],
      serverSessions: [],
      serverMeta: { active_subject: 'sqld', last_daily_mission_at: null, lesson_xp: 0 },
    });
    expect(out.activeSubject).toBe('sqld');

    const out2 = mergeProgress({
      local,
      serverStats: [],
      serverSessions: [],
      serverMeta: { active_subject: null, last_daily_mission_at: null, lesson_xp: 0 },
    });
    expect(out2.activeSubject).toBe('adsp');
  });

  it('lastDailyMissionAt: max(server, local)', () => {
    const local = emptyLocal();
    local.lastDailyMissionAt = 1_700_000_000_000;
    const out = mergeProgress({
      local,
      serverStats: [],
      serverSessions: [],
      serverMeta: {
        active_subject: null,
        last_daily_mission_at: '2024-01-01T00:00:00.000Z', // 1_704_067_200_000
        lesson_xp: 0,
      },
    });
    expect(out.lastDailyMissionAt).toBe(1_704_067_200_000);
  });
});

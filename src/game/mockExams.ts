/**
 * mockExams.ts — 챕터당 4-슬롯 모의고사 정의 + 진행 상태 도출.
 *
 * 슬롯: 모의고사 1·2·3 (각 20문항) + Final (25문항, 최종).
 * 식별: 라벨로 — 예 "챕터 2 모의고사 1" / "챕터 2 모의고사 Final".
 *
 * 진행 상태는 `progress.sessions` 의 label 매칭으로 그때그때 도출 — 별도
 * 저장 X. 이렇게 하면 사용자가 같은 슬롯을 여러 번 풀어도 가장 최근 시도의
 * 오답이 자동으로 "오답 복습" 대상이 되고, 시도 횟수·최고 정확도도 합산됨.
 */

import type { Subject } from '@/types/question';
import type { ProgressStore, SessionRecord } from './storage';

export interface MockExamSlot {
  /** 슬롯 인덱스. 1~3 일반, 4 = Final. */
  index: number;
  /** 표시 이름 ("1" / "2" / "3" / "Final"). */
  shortName: string;
  /** 세션 label (저장·매칭용). 예: "챕터 1 모의고사 1". */
  label: string;
  /** 문항 수. */
  size: number;
  /** Final 슬롯 여부 — UI 강조 + 큰 사이즈. */
  isFinal: boolean;
}

export function getMockSlots(chapter: number): MockExamSlot[] {
  return [
    {
      index: 1,
      shortName: '1',
      label: `챕터 ${chapter} 모의고사 1`,
      size: 20,
      isFinal: false,
    },
    {
      index: 2,
      shortName: '2',
      label: `챕터 ${chapter} 모의고사 2`,
      size: 20,
      isFinal: false,
    },
    {
      index: 3,
      shortName: '3',
      label: `챕터 ${chapter} 모의고사 3`,
      size: 20,
      isFinal: false,
    },
    {
      index: 4,
      shortName: 'Final',
      label: `챕터 ${chapter} 모의고사 Final`,
      size: 25,
      isFinal: true,
    },
  ];
}

export interface MockExamProgress {
  completed: boolean;
  attempts: number;
  /** 0~1. 시도 중 가장 좋았던 정확도. */
  bestAccuracy: number;
  /** 가장 최근 시도의 오답 ID (오답 복습 대상). */
  wrongQuestionIds: string[];
  /** 최근 시도 시각 (epoch ms). */
  lastTakenAt: number;
}

export function getMockProgress(
  subject: Subject,
  chapter: number,
  slotLabel: string,
  progress: ProgressStore,
): MockExamProgress {
  const matches: SessionRecord[] = progress.sessions.filter(
    (s) =>
      s.subject === subject && s.chapter === chapter && s.label === slotLabel,
  );

  if (matches.length === 0) {
    return {
      completed: false,
      attempts: 0,
      bestAccuracy: 0,
      wrongQuestionIds: [],
      lastTakenAt: 0,
    };
  }

  const latest = matches.reduce(
    (a, b) => (a.at >= b.at ? a : b),
    matches[0]!,
  );
  const accuracies = matches.map((s) =>
    s.total > 0 ? s.correctCount / s.total : 0,
  );
  const bestAccuracy = accuracies.length > 0 ? Math.max(...accuracies) : 0;

  return {
    completed: true,
    attempts: matches.length,
    bestAccuracy,
    wrongQuestionIds: latest.wrongQuestionIds ?? [],
    lastTakenAt: latest.at,
  };
}

/**
 * gameModes.test.ts — 랜딩 콘텐츠 카운트 sync 검증.
 *
 * 목적: 랜딩 "도전 가능한 자격증" 카드의 metaValue ("175 step · 380 문항") 가
 * 실제 ALL_LESSONS / ALL_QUESTIONS 의 카운트와 일치하는지 자동 검증.
 *
 * 갱신 누락 (이번 사고: SQLD 가 16 step · 16 문항 으로 박혀있던 것) 을 CI 에서
 * 즉시 검출 → "수정 완료" 보고 전 5단계 증거 #6 의 보강.
 */

import { describe, it, expect } from 'vitest';
import { SUBJECT_SHOWCASES } from './gameModes';
import { ALL_LESSONS } from './lessons';
import { ALL_QUESTIONS } from '@/lib/questions';
import type { Subject } from '@/types/question';

function actualSteps(subject: Subject): number {
  return ALL_LESSONS.filter((l) => l.subject === subject).reduce(
    (sum, l) => sum + l.steps.length,
    0,
  );
}

function actualPlayableQuestions(subject: Subject): number {
  return ALL_QUESTIONS.filter(
    (q) =>
      q.subject === subject &&
      q.type === 'multiple_choice' &&
      q.status !== 'restored' &&
      !q.needsDistractors,
  ).length;
}

/** "175 step · 380 문항" 같은 metaValue 에서 두 숫자만 파싱. */
function parseMetaValue(metaValue: string): { step: number; question: number } | null {
  const match = metaValue.match(/(\d+)\s*step.*?(\d+)\s*문항/);
  if (!match) return null;
  return {
    step: Number(match[1]),
    question: Number(match[2]),
  };
}

describe('SUBJECT_SHOWCASES — landing 카피 vs 실제 카운트 sync', () => {
  it.each(['adsp', 'sqld'] as Subject[])(
    '%s — metaValue 의 step/문항 수가 실제와 일치',
    (subject) => {
      const showcase = SUBJECT_SHOWCASES.find((s) => s.id === subject);
      expect(showcase, `${subject} showcase 가 SUBJECT_SHOWCASES 에 있어야 함`).toBeDefined();

      const parsed = parseMetaValue(showcase!.metaValue);
      expect(
        parsed,
        `${subject} metaValue "${showcase!.metaValue}" 가 "<N> step · <M> 문항" 형식이어야 함`,
      ).not.toBeNull();

      const expectedSteps = actualSteps(subject);
      const expectedQuestions = actualPlayableQuestions(subject);

      expect(
        parsed!.step,
        `${subject}: metaValue step (${parsed!.step}) ≠ 실제 (${expectedSteps}). gameModes.ts 갱신 필요.`,
      ).toBe(expectedSteps);

      expect(
        parsed!.question,
        `${subject}: metaValue 문항 (${parsed!.question}) ≠ 실제 playable (${expectedQuestions}). gameModes.ts 갱신 필요.`,
      ).toBe(expectedQuestions);
    },
  );

  it('빅분기 (bdat) 는 comingSoon 이라 metaValue 자유', () => {
    const bdat = SUBJECT_SHOWCASES.find((s) => s.id === 'bdat');
    expect(bdat?.comingSoon).toBe(true);
  });
});

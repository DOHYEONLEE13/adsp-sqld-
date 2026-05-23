import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLessonsInChapter } from '@/data/lessons';
import type { ProgressStore, QuestionStat } from './storage';
import {
  resolveChapterLearningResume,
  resolveLearningResume,
  saveLearningResume,
} from './learningResume';

function makeProgress(): ProgressStore {
  const now = Date.now();
  return {
    version: 1,
    questionStats: {},
    sessions: [],
    createdAt: now,
    updatedAt: now,
  };
}

function solved(): QuestionStat {
  return {
    attempts: 1,
    correct: 1,
    wrongStreak: 0,
    lastCorrect: true,
    lastSeenAt: Date.now(),
    lastTimeMs: 10_000,
    avgTimeMs: 10_000,
  };
}

function solvedThenMissed(): QuestionStat {
  return {
    attempts: 2,
    correct: 1,
    wrongStreak: 1,
    lastCorrect: false,
    lastSeenAt: Date.now(),
    lastTimeMs: 10_000,
    avgTimeMs: 10_000,
  };
}

describe('learningResume', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
        clear: () => storage.clear(),
      },
    });
  });

  it('returns the first incomplete step when there is no stored resume', () => {
    const progress = makeProgress();
    const firstLesson = getLessonsInChapter('sqld', 1)[0];
    const firstStepIndex = firstLesson.steps.findIndex((step) => !!step.quizId);

    const resume = resolveLearningResume('sqld', progress);

    expect(resume).toMatchObject({
      subject: 'sqld',
      chapter: 1,
      topic: firstLesson.topic,
      stepIdx: firstStepIndex,
    });
  });

  it('moves to the next step when the stored resume step was completed', () => {
    const progress = makeProgress();
    const lesson = getLessonsInChapter('sqld', 1)[0];
    const visible = lesson.steps
      .map((step, stepIdx) => ({ step, stepIdx }))
      .filter(({ step }) => !!step.quizId);

    saveLearningResume({
      subject: 'sqld',
      chapter: 1,
      topic: lesson.topic,
      stepIdx: visible[0].stepIdx,
      stepId: visible[0].step.id,
    });
    progress.questionStats[visible[0].step.quizId!] = solved();

    const resume = resolveLearningResume('sqld', progress);

    expect(resume).toMatchObject({
      subject: 'sqld',
      chapter: 1,
      topic: lesson.topic,
      stepIdx: visible[1].stepIdx,
    });
  });

  it('keeps a step completed even if the latest review answer was wrong', () => {
    const progress = makeProgress();
    const lesson = getLessonsInChapter('sqld', 1)[0];
    const visible = lesson.steps
      .map((step, stepIdx) => ({ step, stepIdx }))
      .filter(({ step }) => !!step.quizId);

    saveLearningResume({
      subject: 'sqld',
      chapter: 1,
      topic: lesson.topic,
      stepIdx: visible[0].stepIdx,
      stepId: visible[0].step.id,
    });
    progress.questionStats[visible[0].step.quizId!] = solvedThenMissed();

    const resume = resolveLearningResume('sqld', progress);

    expect(resume).toMatchObject({
      subject: 'sqld',
      chapter: 1,
      topic: lesson.topic,
      stepIdx: visible[1].stepIdx,
    });
  });

  it('can resolve the first incomplete step inside a selected chapter', () => {
    const progress = makeProgress();
    const lesson = getLessonsInChapter('sqld', 2)[0];
    const firstStepIndex = lesson.steps.findIndex((step) => !!step.quizId);

    const resume = resolveChapterLearningResume('sqld', 2, progress);

    expect(resume).toMatchObject({
      subject: 'sqld',
      chapter: 2,
      topic: lesson.topic,
      stepIdx: firstStepIndex,
    });
  });
});

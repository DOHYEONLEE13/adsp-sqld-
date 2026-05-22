import { SUBJECT_SCHEMAS } from '@/data/subjects';
import { getLessonsInChapter } from '@/data/lessons';
import type { Subject } from '@/types/question';
import type { ProgressStore } from './storage';

const STORAGE_KEY = 'questdp.learningResume.v1';

export interface LearningResumeTarget {
  subject: Subject;
  chapter: number;
  topic: string;
  stepIdx: number;
  stepId: string;
  updatedAt: number;
}

interface StoredResume {
  version: 1;
  bySubject: Partial<Record<Subject, LearningResumeTarget>>;
}

interface FlatStep {
  subject: Subject;
  chapter: number;
  topic: string;
  stepIdx: number;
  stepId: string;
  quizId?: string;
}

function emptyStored(): StoredResume {
  return { version: 1, bySubject: {} };
}

function readStored(): StoredResume {
  if (typeof window === 'undefined') return emptyStored();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStored();
    const parsed = JSON.parse(raw) as StoredResume;
    if (parsed?.version !== 1 || typeof parsed.bySubject !== 'object') {
      return emptyStored();
    }
    return parsed;
  } catch {
    return emptyStored();
  }
}

function writeStored(next: StoredResume): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Resume is a convenience feature; failing to write should not block play.
  }
}

function flattenSubject(subject: Subject): FlatStep[] {
  const schema = SUBJECT_SCHEMAS[subject];
  const out: FlatStep[] = [];

  for (const chapter of schema.chapters) {
    for (const lesson of getLessonsInChapter(subject, chapter.chapter)) {
      lesson.steps.forEach((step, stepIdx) => {
        if (!step.quizId) return;
        out.push({
          subject,
          chapter: chapter.chapter,
          topic: lesson.topic,
          stepIdx,
          stepId: step.id,
          quizId: step.quizId,
        });
      });
    }
  }

  return out;
}

function isCompleted(step: FlatStep, progress: ProgressStore): boolean {
  if (!step.quizId) return false;
  const stat = progress.questionStats[step.quizId];
  return !!stat?.lastCorrect && (stat.correct ?? 0) > 0;
}

function toTarget(step: FlatStep): LearningResumeTarget {
  return {
    subject: step.subject,
    chapter: step.chapter,
    topic: step.topic,
    stepIdx: step.stepIdx,
    stepId: step.stepId,
    updatedAt: Date.now(),
  };
}

function findStoredIndex(
  flat: FlatStep[],
  stored: LearningResumeTarget | null | undefined,
): number {
  if (!stored) return -1;
  return flat.findIndex(
    (step) =>
      step.subject === stored.subject &&
      step.chapter === stored.chapter &&
      step.topic === stored.topic &&
      step.stepIdx === stored.stepIdx &&
      step.stepId === stored.stepId,
  );
}

function firstIncompleteFrom(
  flat: FlatStep[],
  progress: ProgressStore,
  startIndex: number,
): FlatStep | null {
  for (let i = Math.max(0, startIndex); i < flat.length; i += 1) {
    if (!isCompleted(flat[i], progress)) return flat[i];
  }
  return null;
}

export function saveLearningResume(target: Omit<LearningResumeTarget, 'updatedAt'>): void {
  const next = readStored();
  next.bySubject[target.subject] = { ...target, updatedAt: Date.now() };
  writeStored(next);
}

export function resolveChapterLearningResume(
  subject: Subject,
  chapter: number,
  progress: ProgressStore,
): LearningResumeTarget | null {
  const flat = flattenSubject(subject).filter((step) => step.chapter === chapter);
  const target = firstIncompleteFrom(flat, progress, 0) ?? flat[flat.length - 1] ?? null;
  return target ? toTarget(target) : null;
}

export function resolveLearningResume(
  subject: Subject,
  progress: ProgressStore,
): LearningResumeTarget | null {
  const flat = flattenSubject(subject);
  if (flat.length === 0) return null;

  const stored = readStored().bySubject[subject];
  const storedIndex = findStoredIndex(flat, stored);
  if (storedIndex >= 0) {
    const storedStep = flat[storedIndex];
    if (!isCompleted(storedStep, progress)) return toTarget(storedStep);

    const nextAfterStored = firstIncompleteFrom(flat, progress, storedIndex + 1);
    if (nextAfterStored) return toTarget(nextAfterStored);

    return toTarget(storedStep);
  }

  const firstIncomplete = firstIncompleteFrom(flat, progress, 0);
  return toTarget(firstIncomplete ?? flat[0]);
}

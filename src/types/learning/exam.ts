import type { Subject } from '../question';

export type CoreExamSubject = Extract<Subject, 'adsp' | 'sqld'>;
export type ExpansionExamSubject = 'comhwal1' | 'comhwal2';
export type LearningExamSubject = CoreExamSubject | ExpansionExamSubject;

export const LEARNING_EXAMS = [
  'adsp',
  'sqld',
  'comhwal1',
  'comhwal2',
] as const satisfies readonly LearningExamSubject[];

export function isCoreExamSubject(value: unknown): value is CoreExamSubject {
  return value === 'adsp' || value === 'sqld';
}

export function isLearningExamSubject(value: unknown): value is LearningExamSubject {
  return (
    value === 'adsp' ||
    value === 'sqld' ||
    value === 'comhwal1' ||
    value === 'comhwal2'
  );
}

export function isComhwalExam(value: unknown): value is ExpansionExamSubject {
  return value === 'comhwal1' || value === 'comhwal2';
}

export function examToGameHash(exam: LearningExamSubject): string {
  if (isComhwalExam(exam)) return '/game/comhwal';
  return `/game/${exam}`;
}

export function examShortLabel(exam: LearningExamSubject): string {
  switch (exam) {
    case 'adsp':
      return 'ADsP';
    case 'sqld':
      return 'SQLD';
    case 'comhwal1':
      return '컴활 1급';
    case 'comhwal2':
      return '컴활 2급';
  }
}

import type { Subject } from './question';

export type SeoCurriculumSubject =
  | Subject
  | 'comhwal'
  | 'comhwal-1'
  | 'comhwal-2';

export type SeoFaqSubject = Subject | 'comhwal';

export function isSeoCurriculumSubject(
  value: string | undefined,
): value is SeoCurriculumSubject {
  return (
    value === 'adsp' ||
    value === 'sqld' ||
    value === 'comhwal' ||
    value === 'comhwal-1' ||
    value === 'comhwal-2'
  );
}

export function isSeoFaqSubject(
  value: string | undefined,
): value is SeoFaqSubject {
  return value === 'adsp' || value === 'sqld' || value === 'comhwal';
}

export function isCoreSubject(value: SeoCurriculumSubject): value is Subject {
  return value === 'adsp' || value === 'sqld';
}

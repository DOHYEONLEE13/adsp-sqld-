/**
 * 레슨 데이터 public API — 호출측은 변경 0.
 *
 * 모든 lesson 은 챕터별 파일에서 정의되고, 이 모듈이 한 데로 모아
 * `getLesson` / `getLessonsInChapter` / `getChapterSteps` / `getQuizQuestion` 을 제공.
 *
 * @/data/lessons 를 기존처럼 import 하면 됨 (디렉터리 import 자동 해석).
 */

import type { Subject, MultipleChoiceQuestion } from '@/types/question';
import { ALL_QUESTIONS } from '@/lib/questions';
import { SUBJECT_SCHEMAS } from '@/data/subjects';

import { ADSP_LESSONS } from './adsp';
import { SQLD_LESSONS } from './sqld';
import type { Lesson, ChapterStepEntry } from './types';

// 타입 re-export (`@/data/lessons` 에서 직접 import 하던 호출측 모두 호환)
export type {
  Lesson,
  LessonStep,
  LessonBlock,
  IntroBlock,
  SectionBlock,
  KeyPointsBlock,
  TableBlock,
  ExampleBlock,
  CalloutBlock,
  DialogueTurn,
  ConceptReminder,
  ChapterStepEntry,
} from './types';

export const ALL_LESSONS: Lesson[] = [...ADSP_LESSONS, ...SQLD_LESSONS];

export function getLesson(
  subject: Subject,
  chapter: number,
  topic: string,
): Lesson | undefined {
  return ALL_LESSONS.find(
    (l) =>
      l.subject === subject && l.chapter === chapter && l.topic === topic,
  );
}

/** 같은 챕터의 레슨을 subjects.ts 의 토픽 순서대로 반환. */
export function getLessonsInChapter(
  subject: Subject,
  chapter: number,
): Lesson[] {
  const schema = SUBJECT_SCHEMAS[subject];
  const ch = schema.chapters.find((c) => c.chapter === chapter);
  if (!ch) return [];
  const byTopic = new Map(
    ALL_LESSONS.filter(
      (l) => l.subject === subject && l.chapter === chapter,
    ).map((l) => [l.topic, l]),
  );
  return ch.topics
    .map((t) => byTopic.get(t))
    .filter((l): l is Lesson => !!l);
}

export function getChapterSteps(
  subject: Subject,
  chapter: number,
): ChapterStepEntry[] {
  const lessons = getLessonsInChapter(subject, chapter);
  const out: ChapterStepEntry[] = [];
  let i = 0;
  for (const lesson of lessons) {
    for (const step of lesson.steps) {
      out.push({ lesson, step, index: i++ });
    }
  }
  return out;
}

/** quizId → MCQ 조회. */
export function getQuizQuestion(
  quizId: string,
): MultipleChoiceQuestion | undefined {
  const q = ALL_QUESTIONS.find((x) => x.id === quizId);
  if (!q) return undefined;
  if (q.type !== 'multiple_choice') return undefined;
  return q;
}

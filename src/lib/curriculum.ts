/**
 * curriculum.ts — 과목 전체 커리큘럼 트리 조회.
 *
 * Tier 2 programmatic SEO 의 pillar 페이지 (`/curriculum/:subject`).
 * 한 과목의 전체 챕터 → 토픽 → lesson → step 트리를 구성해서, 모든
 * lesson 정적 페이지 (301개) 를 한 곳에서 들어갈 수 있는 hub 를 만든다.
 *
 * SEO 이점:
 *   - 고볼륨 키워드 진입 — "ADsP 출제범위", "SQLD 시험범위", "ADsP 커리큘럼"
 *   - lesson 페이지 301개로 향하는 internal link 그래프의 root
 *   - JSON-LD ItemList 로 구조화
 */

import { ALL_LESSONS, type Lesson, type LessonStep } from '@/data/lessons';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import type { Subject } from '@/types/question';

export interface CurriculumStep {
  step: LessonStep;
  /** 0-based — 챕터 내 step 번호. */
  indexInChapter: number;
}

export interface CurriculumLesson {
  lesson: Lesson;
  steps: CurriculumStep[];
}

export interface CurriculumTopic {
  topic: string;
  lessons: CurriculumLesson[];
}

export interface CurriculumChapter {
  chapter: number;
  title: string;
  topics: CurriculumTopic[];
  totalLessons: number;
  totalSteps: number;
}

export interface SubjectCurriculum {
  subject: Subject;
  title: string;
  chapters: CurriculumChapter[];
  totalChapters: number;
  totalTopics: number;
  totalLessons: number;
  totalSteps: number;
}

/**
 * 과목 전체 커리큘럼 트리 — schema 의 챕터·토픽 순서를 그대로 따름.
 * lesson 이 없는 토픽도 노드로 유지 (UI 가 "준비 중" 처리 가능).
 */
export function getCurriculum(subject: Subject): SubjectCurriculum {
  const schema = SUBJECT_SCHEMAS[subject];

  // 모든 step 의 챕터 내 index 를 미리 계산 (schema 토픽 순서 기준).
  const subjectLessons = ALL_LESSONS.filter((l) => l.subject === subject);

  let totalLessons = 0;
  let totalSteps = 0;
  let totalTopics = 0;

  const chapters: CurriculumChapter[] = schema.chapters.map((schemaChapter) => {
    // 챕터 내 schema 순서로 lesson 정렬
    const chapterLessons = schemaChapter.topics
      .map((topic) =>
        subjectLessons.find(
          (l) => l.chapter === schemaChapter.chapter && l.topic === topic,
        ),
      )
      .filter((l): l is Lesson => !!l);

    // 챕터 내 step 인덱스 집계
    let chapterIdx = 0;
    const topicsOut: CurriculumTopic[] = schemaChapter.topics.map((topic) => {
      totalTopics++;
      const lesson = chapterLessons.find((l) => l.topic === topic);
      if (!lesson) {
        return { topic, lessons: [] };
      }
      const steps: CurriculumStep[] = lesson.steps.map((step) => {
        const entry = { step, indexInChapter: chapterIdx };
        chapterIdx++;
        return entry;
      });
      return {
        topic,
        lessons: [{ lesson, steps }],
      };
    });

    const chapTotalLessons = chapterLessons.length;
    const chapTotalSteps = chapterLessons.reduce(
      (sum, l) => sum + l.steps.length,
      0,
    );

    totalLessons += chapTotalLessons;
    totalSteps += chapTotalSteps;

    return {
      chapter: schemaChapter.chapter,
      title: schemaChapter.title,
      topics: topicsOut,
      totalLessons: chapTotalLessons,
      totalSteps: chapTotalSteps,
    };
  });

  return {
    subject,
    title: schema.title,
    chapters,
    totalChapters: schema.chapters.length,
    totalTopics,
    totalLessons,
    totalSteps,
  };
}

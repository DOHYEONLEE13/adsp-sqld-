/**
 * lesson-lookup.ts — stepId / 라우트 → lesson 데이터 조회 헬퍼.
 *
 * Tier 2 programmatic SEO 의 진입점. `/lesson/:stepId` 라우트가 이 헬퍼로
 * 데이터를 가져와 LessonStaticPage 가 렌더.
 */

import { ALL_LESSONS, type Lesson, type LessonStep } from '@/data/lessons';
import { SUBJECT_SCHEMAS } from '@/data/subjects';

export interface LessonStepLookup {
  lesson: Lesson;
  step: LessonStep;
  /** 같은 그룹의 형제 step (자신 제외). 관련 콘텐츠 internal linking 용. */
  siblingsInGroup: Array<{ lesson: Lesson; step: LessonStep }>;
  /** 챕터 내 step 인덱스 (1-based). */
  indexInChapter: number;
  /** 챕터 step 총 개수. */
  totalInChapter: number;
}

/** 모든 step 의 평탄화 캐시 — 모듈 첫 호출 시 생성. */
let _allStepsCache: Array<{ lesson: Lesson; step: LessonStep }> | null = null;
function allSteps() {
  if (_allStepsCache) return _allStepsCache;
  const out: Array<{ lesson: Lesson; step: LessonStep }> = [];
  for (const lesson of ALL_LESSONS) {
    for (const step of lesson.steps) {
      out.push({ lesson, step });
    }
  }
  _allStepsCache = out;
  return out;
}

/** step.group 우선, 없으면 id 의 `-sN` prefix 가 그룹 키. similarQuestions 와 동일 로직. */
function groupKeyOf(step: LessonStep): string {
  if (step.group) return step.group;
  const m = step.id.match(/^(.+-s\d+)(?:-[a-zA-Z][a-zA-Z0-9-]*)?$/);
  return m ? m[1] : step.id;
}

/** stepId 로 lesson + step + sibling 조회. 없으면 null. */
export function findStepById(stepId: string): LessonStepLookup | null {
  const all = allSteps();
  const found = all.find((x) => x.step.id === stepId);
  if (!found) return null;
  const { lesson, step } = found;

  // 같은 chapter 내 인덱스 계산
  const chapterSteps = all.filter(
    (x) => x.lesson.subject === lesson.subject && x.lesson.chapter === lesson.chapter,
  );
  const indexInChapter = chapterSteps.findIndex((x) => x.step.id === stepId);
  const totalInChapter = chapterSteps.length;

  // sibling — 같은 그룹의 다른 step
  const myGroup = groupKeyOf(step);
  const siblingsInGroup = all.filter(
    (x) =>
      x.lesson.subject === lesson.subject &&
      x.step.id !== stepId &&
      groupKeyOf(x.step) === myGroup,
  );

  return {
    lesson,
    step,
    siblingsInGroup,
    indexInChapter: indexInChapter + 1,
    totalInChapter,
  };
}

/** 모든 step 의 stepId 배열. sitemap 생성용. */
export function listAllStepIds(): string[] {
  return allSteps().map((x) => x.step.id);
}

/** Subject + chapter title 찾기 — breadcrumb 노출용. */
export function getChapterTitle(
  subject: 'adsp' | 'sqld',
  chapter: number,
): string | undefined {
  return SUBJECT_SCHEMAS[subject].chapters.find((c) => c.chapter === chapter)
    ?.title;
}

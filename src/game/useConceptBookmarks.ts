/**
 * useConceptBookmarks — React hook (useSyncExternalStore) + stepId resolver.
 */

import { useMemo, useSyncExternalStore } from 'react';
import {
  getSnapshot,
  subscribe,
  type ConceptBookmarkEntry,
  listConceptBookmarks,
} from './conceptBookmarks';
import { ALL_LESSONS } from '@/data/lessons';
import type { Lesson, LessonStep } from '@/data/lessons';

export function useConceptBookmarks() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export interface ResolvedBookmark extends ConceptBookmarkEntry {
  lesson: Lesson;
  step: LessonStep;
  stepIdx: number;
}

/** 전 lessons 에서 stepId → (lesson, step, stepIdx) 인덱스 한 번 빌드 후 캐시. */
let _stepIndex: Map<string, { lesson: Lesson; step: LessonStep; stepIdx: number }> | null = null;
function buildStepIndex() {
  const idx = new Map<string, { lesson: Lesson; step: LessonStep; stepIdx: number }>();
  for (const lesson of ALL_LESSONS) {
    lesson.steps.forEach((step, stepIdx) => {
      idx.set(step.id, { lesson, step, stepIdx });
    });
  }
  return idx;
}

export function getStepIndex(): Map<string, { lesson: Lesson; step: LessonStep; stepIdx: number }> {
  if (!_stepIndex) _stepIndex = buildStepIndex();
  return _stepIndex;
}

/** 북마크 엔트리에 lesson/step 메타 결합 — 미존재 stepId 는 자동 필터. */
export function useResolvedBookmarks(): ResolvedBookmark[] {
  // subscribe 는 hook 으로 호출만 — 실제 리스트는 listConceptBookmarks 에서.
  useConceptBookmarks();
  return useMemo(() => {
    const idx = getStepIndex();
    const out: ResolvedBookmark[] = [];
    for (const entry of listConceptBookmarks()) {
      const meta = idx.get(entry.stepId);
      if (!meta) continue; // 삭제된 step — skip
      out.push({ ...entry, ...meta });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useConceptBookmarks()]);
}

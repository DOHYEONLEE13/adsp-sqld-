/**
 * useResolvedBookmarks — 기존 question-level bookmarks (bookmarks.ts) 를
 * step 메타와 결합해 "어느 lesson 의 어느 step 의 어느 문제" 를 보여주는 hook.
 *
 * 이전엔 별도 conceptBookmarks 스토어를 썼지만, 사용자 요청대로 모든 문제 단위
 * 통일 (학습 step 안의 quiz · 실전 세트 · 모의고사 모두 동일 questionId 공간).
 *
 * 주의: questionId → step 매핑은 quizId 보유 step 만. 실전 세트·모의고사처럼
 * step 외부에서 풀린 문제는 lesson 매칭이 없으므로 stepless 로 표시.
 */

import { useMemo } from 'react';
import { useBookmarks } from './useBookmarks';
import { ALL_LESSONS } from '@/data/lessons';
import { ALL_QUESTIONS } from '@/lib/questions';
import type { Lesson, LessonStep } from '@/data/lessons';
import type { Subject, MultipleChoiceQuestion } from '@/types/question';

export interface ResolvedBookmark {
  questionId: string;
  /** 추가 시각 (정렬용 — server pull 후엔 created_at). */
  addedAt: number;
  /** 문제의 과목 (lesson 매칭 안 되면 question 자체에서 추출). */
  subject: Subject;
  /** 챕터 (lesson 우선, 없으면 question.chapter). */
  chapter: number;
  /** 토픽 — lesson 매칭 안 되면 question.topic. */
  topic: string | null;
  /** 매칭된 lesson (있을 때만). */
  lesson?: Lesson;
  /** 매칭된 step (있을 때만). */
  step?: LessonStep;
  /** lesson 안에서의 step index. */
  stepIdx?: number;
  /** 표시용 짧은 제목 — step.title 우선, 없으면 question stem 앞 40자. */
  title: string;
}

// quizId(questionId) → lesson/step 인덱스
let _stepIndex: Map<
  string,
  { lesson: Lesson; step: LessonStep; stepIdx: number }
> | null = null;

function buildStepIndex() {
  const idx = new Map<
    string,
    { lesson: Lesson; step: LessonStep; stepIdx: number }
  >();
  // 같은 quizId 를 여러 step 이 공유 가능 (review · finale 은 부모 quizId 재사용).
  // 북마크 점프 시 primary (overview / substep) 로 가야 자연스러우므로 review·
  // finale 은 인덱싱에서 제외 — primary 가 항상 인덱스에 남음.
  for (const lesson of ALL_LESSONS) {
    lesson.steps.forEach((step, stepIdx) => {
      if (!step.quizId) return;
      if (step.id.endsWith('-review')) return;
      if (step.id.endsWith('-finale')) return;
      // 동시에 같은 quizId 가 여러 primary 에 쓰이는 경우는 데이터 결함 — 첫 매칭만.
      if (idx.has(step.quizId)) return;
      idx.set(step.quizId, { lesson, step, stepIdx });
    });
  }
  return idx;
}

function getStepIndex() {
  if (!_stepIndex) _stepIndex = buildStepIndex();
  return _stepIndex;
}

// 빠른 question lookup (subject·chapter·topic 추출용)
let _questionIndex: Map<string, MultipleChoiceQuestion> | null = null;
function getQuestionIndex() {
  if (!_questionIndex) {
    _questionIndex = new Map();
    for (const q of ALL_QUESTIONS) {
      if (q.type === 'multiple_choice') _questionIndex.set(q.id, q);
    }
  }
  return _questionIndex;
}

export function useResolvedBookmarks(): ResolvedBookmark[] {
  const bookmarks = useBookmarks();
  return useMemo(() => {
    const stepIdx = getStepIndex();
    const qIdx = getQuestionIndex();
    const out: ResolvedBookmark[] = [];
    for (const id of bookmarks.ids) {
      const lessonMeta = stepIdx.get(id);
      const q = qIdx.get(id);
      if (!q && !lessonMeta) continue; // 미존재 — 스킵

      const subject: Subject =
        lessonMeta?.lesson.subject ?? (q?.subject ?? 'adsp');
      const chapter = lessonMeta?.lesson.chapter ?? q?.chapter ?? 1;
      const topic = lessonMeta?.lesson.topic ?? q?.topic ?? null;
      const title = lessonMeta?.step.title ?? truncate(q?.question ?? id, 50);

      out.push({
        questionId: id,
        addedAt: 0, // bookmarks.ts 는 list 정렬을 별도 listEntries 에서 — 여기선 set 순서 보존
        subject,
        chapter,
        topic,
        lesson: lessonMeta?.lesson,
        step: lessonMeta?.step,
        stepIdx: lessonMeta?.stepIdx,
        title,
      });
    }
    return out;
  }, [bookmarks]);
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

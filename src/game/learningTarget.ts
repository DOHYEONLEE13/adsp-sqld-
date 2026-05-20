import { ALL_LESSONS } from '@/data/lessons';
import type { Lesson, LessonStep } from '@/data/lessons';
import { canonicalTopic } from '@/data/topicAlias';
import { ALL_QUESTIONS } from '@/lib/questions';
import type { MultipleChoiceQuestion, Subject } from '@/types/question';

export interface QuestionLearningTarget {
  questionId: string;
  subject: Subject;
  chapter: number;
  topic: string | null;
  stepIdx?: number;
  stepId?: string;
  stepTitle?: string;
  exactStep: boolean;
}

let _stepIndex:
  | Map<string, { lesson: Lesson; step: LessonStep; stepIdx: number }>
  | null = null;

function getStepIndex() {
  if (_stepIndex) return _stepIndex;

  const idx = new Map<
    string,
    { lesson: Lesson; step: LessonStep; stepIdx: number }
  >();

  for (const lesson of ALL_LESSONS) {
    lesson.steps.forEach((step, stepIdx) => {
      if (!step.quizId) return;
      if (step.id.endsWith('-review')) return;
      if (step.id.endsWith('-finale')) return;
      if (idx.has(step.quizId)) return;
      idx.set(step.quizId, { lesson, step, stepIdx });
    });
  }

  _stepIndex = idx;
  return idx;
}

let _questionIndex: Map<string, MultipleChoiceQuestion> | null = null;

function getQuestionIndex() {
  if (_questionIndex) return _questionIndex;

  const idx = new Map<string, MultipleChoiceQuestion>();
  for (const q of ALL_QUESTIONS) {
    if (q.type === 'multiple_choice') idx.set(q.id, q);
  }

  _questionIndex = idx;
  return idx;
}

export function resolveQuestionLearningTarget(
  questionId: string,
): QuestionLearningTarget | null {
  const lessonMeta = getStepIndex().get(questionId);
  if (lessonMeta) {
    return {
      questionId,
      subject: lessonMeta.lesson.subject,
      chapter: lessonMeta.lesson.chapter,
      topic: lessonMeta.lesson.topic,
      stepIdx: lessonMeta.stepIdx,
      stepId: lessonMeta.step.id,
      stepTitle: lessonMeta.step.title,
      exactStep: true,
    };
  }

  const q = getQuestionIndex().get(questionId);
  if (!q) return null;

  const topic = q.topic ? canonicalTopic(q.subject, q.chapter, q.topic) : null;

  return {
    questionId,
    subject: q.subject,
    chapter: q.chapter,
    topic,
    exactStep: false,
  };
}

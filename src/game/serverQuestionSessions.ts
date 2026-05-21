import { waitForSession } from '@/lib/auth/waitForSession';
import { getSupabase } from '@/lib/supabase';
import type { MultipleChoiceQuestion } from '@/types/question';
import type { QuestSession, QuestSummary } from './types';

export interface QuestionReservationOk {
  ok: true;
  sessionToken: string;
  remainingQuota: number | null;
  limitCount: number;
  isUnlimited: boolean;
  newQuestionCount: number;
  questions: MultipleChoiceQuestion[];
}

export interface QuestionReservationFail {
  ok: false;
  reason:
    | 'unauthenticated'
    | 'quota_exceeded'
    | 'premium_required'
    | 'no_questions'
    | 'server_error'
    | 'unknown';
  message?: string;
  remainingQuota?: number;
  limitCount?: number;
  requestedNewCount?: number;
}

export type QuestionReservationResult =
  | QuestionReservationOk
  | QuestionReservationFail;

function clientRequestId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function toInt(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asQuestionList(value: unknown): MultipleChoiceQuestion[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw) => asRecord(raw))
    .filter((raw) => typeof raw.id === 'string' && Array.isArray(raw.choices))
    .map((raw) => ({
      id: String(raw.id),
      subject: raw.subject === 'sqld' ? 'sqld' : 'adsp',
      chapter:
        typeof raw.chapter === 'number'
          ? raw.chapter
          : toInt(raw.chapter, 0),
      chapterTitle: String(raw.chapterTitle ?? ''),
      topic: String(raw.topic ?? raw.rawTopic ?? ''),
      subtopic:
        typeof raw.subtopic === 'string' && raw.subtopic
          ? raw.subtopic
          : undefined,
      difficulty:
        typeof raw.difficulty === 'number' &&
        raw.difficulty >= 1 &&
        raw.difficulty <= 5
          ? (raw.difficulty as MultipleChoiceQuestion['difficulty'])
          : undefined,
      pass:
        typeof raw.pass === 'number'
          ? raw.pass
          : toInt(raw.pass, 1),
      type: 'multiple_choice',
      question: String(raw.question ?? ''),
      choices: (raw.choices as unknown[]).map((choice) => String(choice)),
      // 서버가 제출 전까지 정답을 공개하지 않는다.
      answerIndex: -1,
      status:
        typeof raw.status === 'string'
          ? (raw.status as MultipleChoiceQuestion['status'])
          : undefined,
    }));
}

export async function reserveQuestionSession(
  session: QuestSession,
): Promise<QuestionReservationResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, reason: 'server_error' };

  const authSession = await waitForSession();
  if (!authSession) return { ok: false, reason: 'unauthenticated' };

  const { data, error } = await sb.rpc('start_question_session', {
    p_subject: session.subject,
    p_chapter: session.chapter,
    p_chapter_title: session.chapterTitle,
    p_topic: session.topic,
    p_flow: session.flow,
    p_label: session.label ?? null,
    p_size: session.questions.length,
    p_pass_number: session.passNumber,
    p_question_ids: session.questions.map((q) => q.id),
    p_client_request_id: clientRequestId('quest'),
  });

  if (error) {
    console.warn('[serverQuestionSessions] start_question_session failed', error);
    return { ok: false, reason: 'server_error', message: error.message };
  }

  const payload = asRecord(data);
  if (payload.ok !== true) {
    return {
      ok: false,
      reason: (payload.reason as QuestionReservationFail['reason']) ?? 'unknown',
      message: payload.message as string | undefined,
      remainingQuota:
        typeof payload.remainingQuota === 'number'
          ? payload.remainingQuota
          : undefined,
      limitCount:
        typeof payload.limitCount === 'number' ? payload.limitCount : undefined,
      requestedNewCount:
        typeof payload.requestedNewCount === 'number'
          ? payload.requestedNewCount
          : undefined,
    };
  }

  return {
    ok: true,
    sessionToken: String(payload.sessionToken),
    remainingQuota:
      typeof payload.remainingQuota === 'number'
        ? payload.remainingQuota
        : payload.remainingQuota === null
          ? null
          : null,
    limitCount: typeof payload.limitCount === 'number' ? payload.limitCount : 10,
    isUnlimited: payload.isUnlimited === true,
    newQuestionCount:
      typeof payload.newQuestionCount === 'number'
        ? payload.newQuestionCount
        : 0,
    questions: asQuestionList(payload.questions),
  };
}

export async function reserveLessonQuestion(args: {
  questionId: string;
  subject: 'adsp' | 'sqld';
  chapter: number;
  stepKey?: string | null;
}): Promise<QuestionReservationResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, reason: 'server_error' };

  const authSession = await waitForSession();
  if (!authSession) return { ok: false, reason: 'unauthenticated' };

  const { data, error } = await sb.rpc('start_lesson_question', {
    p_question_id: args.questionId,
    p_subject: args.subject,
    p_chapter: args.chapter,
    p_step_key: args.stepKey ?? null,
    p_client_request_id: clientRequestId('lesson'),
  });

  if (error) {
    console.warn('[serverQuestionSessions] start_lesson_question failed', error);
    return { ok: false, reason: 'server_error', message: error.message };
  }

  const payload = asRecord(data);
  if (payload.ok !== true) {
    return {
      ok: false,
      reason: (payload.reason as QuestionReservationFail['reason']) ?? 'unknown',
      message: payload.message as string | undefined,
      remainingQuota:
        typeof payload.remainingQuota === 'number'
          ? payload.remainingQuota
          : undefined,
      limitCount:
        typeof payload.limitCount === 'number' ? payload.limitCount : undefined,
      requestedNewCount:
        typeof payload.requestedNewCount === 'number'
          ? payload.requestedNewCount
          : undefined,
    };
  }

  return {
    ok: true,
    sessionToken: String(payload.sessionToken),
    remainingQuota:
      typeof payload.remainingQuota === 'number'
        ? payload.remainingQuota
        : payload.remainingQuota === null
          ? null
          : null,
    limitCount: typeof payload.limitCount === 'number' ? payload.limitCount : 10,
    isUnlimited: payload.isUnlimited === true,
    newQuestionCount:
      typeof payload.newQuestionCount === 'number'
        ? payload.newQuestionCount
        : 0,
    questions: asQuestionList(payload.questions),
  };
}

export interface ServerSessionSubmitResult {
  ok: boolean;
  correctCount: number;
  total: number;
  totalTimeMs: number;
  answers: Array<{
    questionId: string;
    selectedIndex: number;
    correct: boolean;
    correctIndex: number;
    timeMs: number;
    xpAwarded: number;
    explanation?: MultipleChoiceQuestion['explanation'];
  }>;
}

function parseSubmitResult(data: unknown): ServerSessionSubmitResult | null {
  const payload = asRecord(data);
  if (payload.ok !== true) return null;
  const rawAnswers = Array.isArray(payload.answers) ? payload.answers : [];
  return {
    ok: true,
    correctCount:
      typeof payload.correctCount === 'number' ? payload.correctCount : 0,
    total: typeof payload.total === 'number' ? payload.total : rawAnswers.length,
    totalTimeMs:
      typeof payload.totalTimeMs === 'number' ? payload.totalTimeMs : 0,
    answers: rawAnswers.map((rawAnswer) => {
      const answer = asRecord(rawAnswer);
      return {
        questionId: String(answer.questionId ?? ''),
        selectedIndex:
          typeof answer.selectedIndex === 'number'
            ? answer.selectedIndex
            : toInt(answer.selectedIndex, -1),
        correct: answer.correct === true,
        correctIndex:
          typeof answer.correctIndex === 'number'
            ? answer.correctIndex
            : toInt(answer.correctIndex, -1),
        timeMs:
          typeof answer.timeMs === 'number'
            ? answer.timeMs
            : toInt(answer.timeMs, 0),
        xpAwarded:
          typeof answer.xpAwarded === 'number'
            ? answer.xpAwarded
            : toInt(answer.xpAwarded, 0),
        explanation:
          answer.explanation === null
            ? undefined
            : (answer.explanation as MultipleChoiceQuestion['explanation']),
      };
    }),
  };
}

export async function submitReservedQuestionSession(
  summary: QuestSummary,
): Promise<ServerSessionSubmitResult | null> {
  if (!summary.sessionToken) return null;
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase client is not configured');

  const authSession = await waitForSession();
  if (!authSession) throw new Error('No active Supabase session');

  const { data, error } = await sb.rpc('submit_question_session', {
    p_session_token: summary.sessionToken,
    p_answers: summary.answers.map((answer) => ({
      question_id: answer.questionId,
      selected_index: answer.chosenIndex,
      time_ms: answer.timeMs,
    })),
  });

  if (error) throw error;
  return parseSubmitResult(data);
}

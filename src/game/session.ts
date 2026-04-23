/**
 * 게임 세션 헬퍼.
 *
 * Planet/Zone 화면용 집계, 세션 생성, 채점 로직을 담당합니다.
 * `restored` 상태 문항은 오답 선지가 없으므로 게임에 노출하지 않습니다.
 * 현재 iteration 에서는 객관식(multiple_choice) 만 사용합니다.
 */

import type {
  MultipleChoiceQuestion,
  Question,
  Subject,
} from '@/types/question';
import { ALL_QUESTIONS } from '@/lib/questions';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import { canonicalTopic } from '@/data/topicAlias';
import { shuffle } from '@/lib/utils';
import { getSnapshot } from './storage';
import { questionWeaknessScore } from './weakness';
import type {
  FlowMode,
  PlanetInfo,
  QuestAnswer,
  QuestSession,
  QuestSummary,
  ZoneInfo,
} from './types';

/** 샘플링 전략. 문항 풀을 어떻게 뽑을지. */
export type SamplingMode = 'random' | 'weakness' | 'review';

/** 게임에 노출 가능한 문항만 통과시키는 가드. */
export function isPlayable(q: Question): q is MultipleChoiceQuestion {
  if (q.type !== 'multiple_choice') return false;
  if (q.status === 'restored') return false;
  if (q.needsDistractors) return false;
  return true;
}

/** 캐시된 playable 목록. 모듈 로드 시 한 번만 계산. */
const PLAYABLE_QUESTIONS: MultipleChoiceQuestion[] =
  ALL_QUESTIONS.filter(isPlayable);

/** 전체 playable 문항 수. */
export function playableCount(subject?: Subject): number {
  if (!subject) return PLAYABLE_QUESTIONS.length;
  return PLAYABLE_QUESTIONS.filter((q) => q.subject === subject).length;
}

/** 과목별 playable 문항 */
export function playableQuestions(
  subject: Subject,
): MultipleChoiceQuestion[] {
  return PLAYABLE_QUESTIONS.filter((q) => q.subject === subject);
}

/** Planet 화면용 — 과목의 챕터별 집계. */
export function getPlanets(subject: Subject): PlanetInfo[] {
  const schema = SUBJECT_SCHEMAS[subject];
  const pool = playableQuestions(subject);
  return schema.chapters.map((ch) => ({
    chapter: ch.chapter,
    title: ch.title,
    topics: ch.topics,
    questionCount: pool.filter((q) => q.chapter === ch.chapter).length,
  }));
}

/**
 * Zone 화면용 — 챕터 안 토픽별 집계.
 *
 * 노드는 언제나 `SUBJECT_SCHEMAS` 의 토픽 목록을 따릅니다 (순서/개수 고정).
 * 각 문항은 `canonicalTopic` 으로 매핑된 스키마 토픽 버킷으로 집계됩니다.
 * 이렇게 해야 노드 1:1 로 레슨이 연결되고 "레슨 준비 중" 이 뜨지 않습니다.
 */
export function getZones(subject: Subject, chapter: number): ZoneInfo[] {
  const schema = SUBJECT_SCHEMAS[subject];
  const chapterMeta = schema.chapters.find((c) => c.chapter === chapter);
  if (!chapterMeta) return [];
  const pool = playableQuestions(subject).filter(
    (q) => q.chapter === chapter,
  );
  const counts = new Map<string, number>();
  for (const t of chapterMeta.topics) counts.set(t, 0);
  for (const q of pool) {
    const canon = canonicalTopic(subject, q.chapter, q.topic);
    if (!canon) continue;
    counts.set(canon, (counts.get(canon) ?? 0) + 1);
  }
  // 스키마 토픽 순서대로 반환 — UI 의 로드맵 순서가 예측 가능해집니다.
  return chapterMeta.topics.map((topic) => ({
    topic,
    questionCount: counts.get(topic) ?? 0,
  }));
}

export interface CreateSessionOptions {
  subject: Subject;
  chapter: number;
  /** null 이면 챕터 전체 토픽에서 뽑습니다. */
  topic: string | null;
  /** 기본 10, 실제 pool 크기를 넘지 않습니다. */
  size?: number;
  /**
   * 샘플링 전략. 기본 'random'. weakness/review 는 저장소 상태를 참조.
   */
  sampling?: SamplingMode;
  /** 진행 방식. 기본 'play'. */
  flow?: FlowMode;
  /** 결과 요약 등에 쓰이는 라벨. */
  label?: string;
}

/** 세션 생성 — 조건에 맞는 문항을 섞고 선지도 섞어서 세팅. */
export function createSession(opts: CreateSessionOptions): QuestSession | null {
  const {
    subject,
    chapter,
    topic,
    size = 10,
    sampling = 'random',
    flow = 'play',
    label,
  } = opts;
  const schema = SUBJECT_SCHEMAS[subject];
  const chapterMeta = schema.chapters.find((c) => c.chapter === chapter);
  if (!chapterMeta) return null;

  let pool = playableQuestions(subject).filter((q) => {
    if (q.chapter !== chapter) return false;
    if (topic && canonicalTopic(subject, q.chapter, q.topic) !== topic)
      return false;
    return true;
  });
  if (pool.length === 0) return null;

  const store = getSnapshot();
  const now = Date.now();

  if (sampling === 'review') {
    pool = pool.filter((q) => {
      const stat = store.questionStats[q.id];
      return stat && !stat.lastCorrect;
    });
    if (pool.length === 0) return null;
  }

  let picked: MultipleChoiceQuestion[];
  if (sampling === 'weakness') {
    const scored = pool
      .map((q) => ({ q, score: questionWeaknessScore(q, store, now) }))
      .sort((a, b) => b.score - a.score);
    const head = scored.slice(0, Math.min(size * 2, scored.length));
    picked = shuffle(head.map((s) => s.q)).slice(0, Math.min(size, head.length));
  } else {
    picked = shuffle(pool).slice(0, Math.min(size, pool.length));
  }

  const randomized = picked.map(shuffleChoices);

  return {
    subject,
    chapter,
    chapterTitle: chapterMeta.title,
    topic,
    flow,
    label,
    questions: randomized,
    index: 0,
    answers: [],
    startedAt: Date.now(),
  };
}

/**
 * Daily Mission — 과목 단위로 약점 7 + 복습 3 을 골라 한 세션으로 묶습니다.
 * 부족하면 랜덤으로 채워서 반드시 10 개로 맞춥니다 (0 이면 null).
 */
export function createDailyMissionSession(subject: Subject): QuestSession | null {
  const pool = playableQuestions(subject);
  if (pool.length === 0) return null;
  const store = getSnapshot();
  const now = Date.now();

  const WEAK_N = 7;
  const REVIEW_N = 3;
  const TOTAL = 10;

  const reviewPool = pool.filter((q) => {
    const stat = store.questionStats[q.id];
    return stat && !stat.lastCorrect;
  });

  const weakRanked = pool
    .map((q) => ({ q, score: questionWeaknessScore(q, store, now) }))
    .sort((a, b) => b.score - a.score)
    .map((s) => s.q);

  const picked: MultipleChoiceQuestion[] = [];
  const usedIds = new Set<string>();

  // 1. Review 3 — 가장 오래된 오답부터 (lastSeenAt asc).
  const sortedReview = reviewPool
    .slice()
    .sort((a, b) => {
      const sa = store.questionStats[a.id]?.lastSeenAt ?? 0;
      const sb = store.questionStats[b.id]?.lastSeenAt ?? 0;
      return sa - sb;
    });
  for (const q of sortedReview) {
    if (picked.length >= REVIEW_N) break;
    picked.push(q);
    usedIds.add(q.id);
  }

  // 2. 약점 7 — 이미 고른 것 제외.
  for (const q of weakRanked) {
    if (picked.length >= REVIEW_N + WEAK_N) break;
    if (usedIds.has(q.id)) continue;
    picked.push(q);
    usedIds.add(q.id);
  }

  // 3. 부족분은 랜덤으로 채움.
  if (picked.length < TOTAL) {
    for (const q of shuffle(pool)) {
      if (picked.length >= TOTAL) break;
      if (usedIds.has(q.id)) continue;
      picked.push(q);
      usedIds.add(q.id);
    }
  }

  if (picked.length === 0) return null;

  // 순서를 한 번 더 섞어서 약점/복습 티가 덜 나게.
  const final = shuffle(picked).map(shuffleChoices);

  // 챕터 필드는 "대표 챕터" 로 첫 문항 기준 — 이력 표기용.
  const repChapter = final[0]!.chapter;
  const schema = SUBJECT_SCHEMAS[subject];
  const chapterTitle =
    schema.chapters.find((c) => c.chapter === repChapter)?.title ?? '';

  return {
    subject,
    chapter: repChapter,
    chapterTitle,
    topic: null,
    flow: 'play',
    label: 'Daily Mission',
    questions: final,
    index: 0,
    answers: [],
    startedAt: Date.now(),
  };
}

/** Review 풀 크기 — Zone 화면 뱃지에 씁니다. */
export function reviewPoolSize(
  subject: Subject,
  chapter: number,
  topic: string | null,
): number {
  const store = getSnapshot();
  return playableQuestions(subject).filter((q) => {
    if (q.chapter !== chapter) return false;
    if (topic && canonicalTopic(subject, q.chapter, q.topic) !== topic)
      return false;
    const stat = store.questionStats[q.id];
    return stat && !stat.lastCorrect;
  }).length;
}

/** choices 를 섞고 answerIndex 를 재계산한 사본을 반환. */
function shuffleChoices(q: MultipleChoiceQuestion): MultipleChoiceQuestion {
  const correctText = q.choices[q.answerIndex];
  const shuffled = shuffle(q.choices);
  const newAnswerIndex = shuffled.findIndex((c) => c === correctText);
  return {
    ...q,
    choices: shuffled,
    answerIndex: newAnswerIndex >= 0 ? newAnswerIndex : q.answerIndex,
  };
}

/** 현재 문제에 대한 답을 기록하고 다음 state 를 반환. */
export function recordAnswer(
  session: QuestSession,
  chosenIndex: number,
  now: number = Date.now(),
): QuestSession {
  const current = session.questions[session.index];
  if (!current) return session;

  const prevElapsed = session.answers.reduce((sum, a) => sum + a.timeMs, 0);
  const elapsedSinceStart = now - session.startedAt;
  const timeMs = Math.max(0, elapsedSinceStart - prevElapsed);

  const answer: QuestAnswer = {
    questionId: current.id,
    chosenIndex,
    correct: chosenIndex === current.answerIndex,
    timeMs,
  };

  return {
    ...session,
    answers: [...session.answers, answer],
    index: session.index + 1,
  };
}

/** 세션이 끝났는지 (마지막 문제까지 답을 제출한 상태). */
export function isSessionDone(session: QuestSession): boolean {
  return session.index >= session.questions.length;
}

/** 완료된 세션에서 Summary 를 추출. */
export function summarize(session: QuestSession): QuestSummary {
  // answers[i] 는 questions[i] 에 대한 응답입니다 (recordAnswer 는 순차 기록).
  const answers = session.answers.map((a, i) => ({
    ...a,
    question: session.questions[i]!,
  }));
  const correctCount = answers.filter((a) => a.correct).length;
  const total = session.questions.length;
  const totalTimeMs = answers.reduce((sum, a) => sum + a.timeMs, 0);

  return {
    subject: session.subject,
    chapter: session.chapter,
    chapterTitle: session.chapterTitle,
    topic: session.topic,
    total,
    correctCount,
    accuracy: total === 0 ? 0 : correctCount / total,
    totalTimeMs,
    answers,
  };
}

/** ms → `0:23` 포맷. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

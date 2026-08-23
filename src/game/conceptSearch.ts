import {
  getLessonsInChapter,
  isPartReviewStep,
  type LessonBlock,
  type LessonStep,
} from '@/data/lessons';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import { canonicalTopic } from '@/data/topicAlias';
import { ALL_QUESTIONS } from '@/lib/questions';
import type { Subject } from '@/types/question';

export interface ConceptSearchResult {
  subject: Subject;
  chapter: number;
  chapterTitle: string;
  topic: string;
  stepIdx: number;
  stepId: string;
  title: string;
  snippet: string;
  score: number;
}

export interface ReviewConceptResult extends ConceptSearchResult {
  wrongCount: number;
  wrongQuestionIds: string[];
}

export type LastAnswerStats = Record<string, { lastCorrect: boolean } | undefined>;

interface ConceptSearchEntry extends Omit<ConceptSearchResult, 'score'> {
  order: number;
  quizIds: string[];
  normalizedTitle: string;
  normalizedTopic: string;
  normalizedChapterTitle: string;
  normalizedSearchText: string;
  snippetCandidates: string[];
}

const entryCache = new Map<Subject, ConceptSearchEntry[]>();

export function normalizeConceptSearchText(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('ko-KR')
    .replace(/[\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function blockText(block: LessonBlock): string[] {
  switch (block.kind) {
    case 'intro':
      return [block.body];
    case 'section':
      return [block.title, block.body];
    case 'keypoints':
      return [block.title ?? '', ...block.items];
    case 'table':
      return [
        block.title ?? '',
        ...block.headers,
        ...block.rows.flatMap((row) => row),
      ];
    case 'example':
      return [block.title ?? '', block.body];
    case 'callout':
      return [block.title, block.body];
  }
}

function plainText(value: string): string {
  return value.replace(/[\[\]]/g, '').replace(/\s+/g, ' ').trim();
}

function stepText(step: LessonStep): string[] {
  return [
    ...step.blocks.flatMap(blockText),
    ...(step.dialogue?.map((turn) => turn.text) ?? []),
    step.reminder?.headline ?? '',
    step.reminder?.summary ?? '',
    ...(step.reminder?.keyPoints ?? []),
  ]
    .map(plainText)
    .filter(Boolean);
}

function buildEntries(subject: Subject): ConceptSearchEntry[] {
  const schema = SUBJECT_SCHEMAS[subject];
  const entries: ConceptSearchEntry[] = [];

  for (const chapterMeta of schema.chapters) {
    for (const lesson of getLessonsInChapter(subject, chapterMeta.chapter)) {
      lesson.steps.forEach((step, stepIdx) => {
        // ZoneScreen에 실제 노드로 표시되는 학습 스텝만 검색 결과에 포함한다.
        if (!step.quizId || isPartReviewStep(step)) return;

        const snippets = stepText(step);
        const searchParts = [
          step.title,
          lesson.topic,
          lesson.title,
          lesson.hook,
          chapterMeta.title,
          ...snippets,
        ];

        entries.push({
          subject,
          chapter: chapterMeta.chapter,
          chapterTitle: chapterMeta.title,
          topic: lesson.topic,
          stepIdx,
          stepId: step.id,
          title: step.title,
          snippet: snippets[0] ?? lesson.hook,
          order: entries.length,
          quizIds: [step.quizId, ...(step.extraQuizIds ?? [])],
          normalizedTitle: normalizeConceptSearchText(step.title),
          normalizedTopic: normalizeConceptSearchText(lesson.topic),
          normalizedChapterTitle: normalizeConceptSearchText(chapterMeta.title),
          normalizedSearchText: normalizeConceptSearchText(searchParts.join(' ')),
          snippetCandidates: snippets,
        });
      });
    }
  }

  return entries;
}

const questionIndex = new Map(
  ALL_QUESTIONS.map((question) => [question.id, question]),
);

function fallbackEntryForQuestion(
  entries: ConceptSearchEntry[],
  subject: Subject,
  chapter: number,
  questionId: string,
): ConceptSearchEntry | undefined {
  const question = questionIndex.get(questionId);
  if (!question || question.subject !== subject || question.chapter !== chapter) {
    return undefined;
  }

  const topic = canonicalTopic(subject, chapter, question.topic);
  if (!topic) return undefined;
  const candidates = entries.filter((entry) => entry.topic === topic);
  if (candidates.length <= 1) return candidates[0];

  const terms = normalizeConceptSearchText(
    `${question.topic} ${question.subtopic ?? ''}`,
  )
    .split(' ')
    .filter((term) => term.length > 1);

  let best = candidates[0];
  let bestScore = -1;
  for (const candidate of candidates) {
    const score = terms.reduce((sum, term) => {
      if (candidate.normalizedTitle.includes(term)) return sum + 5;
      if (candidate.normalizedSearchText.includes(term)) return sum + 1;
      return sum;
    }, 0);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

/**
 * 마지막 풀이가 오답인 문항을 현재 챕터의 학습 노드로 묶는다.
 * 개념 문제는 quizId/extraQuizIds로 정확히 연결하고, 실전 문제는 정규화된
 * 토픽 안에서 가장 가까운 개념 노드로 연결한다.
 */
export function reviewConceptsInChapter(
  subject: Subject,
  chapter: number,
  stats: LastAnswerStats,
): ReviewConceptResult[] {
  const entries = entriesFor(subject).filter((entry) => entry.chapter === chapter);
  const directIndex = new Map<string, ConceptSearchEntry>();
  for (const entry of entries) {
    for (const quizId of entry.quizIds) {
      if (!directIndex.has(quizId)) directIndex.set(quizId, entry);
    }
  }

  const grouped = new Map<
    string,
    { entry: ConceptSearchEntry; wrongQuestionIds: string[] }
  >();

  for (const [questionId, stat] of Object.entries(stats)) {
    if (!stat || stat.lastCorrect) continue;
    const entry =
      directIndex.get(questionId) ??
      fallbackEntryForQuestion(entries, subject, chapter, questionId);
    if (!entry) continue;

    const current = grouped.get(entry.stepId);
    if (current) current.wrongQuestionIds.push(questionId);
    else grouped.set(entry.stepId, { entry, wrongQuestionIds: [questionId] });
  }

  return [...grouped.values()]
    .sort((a, b) => a.entry.order - b.entry.order)
    .map(({ entry, wrongQuestionIds }) => ({
      subject: entry.subject,
      chapter: entry.chapter,
      chapterTitle: entry.chapterTitle,
      topic: entry.topic,
      stepIdx: entry.stepIdx,
      stepId: entry.stepId,
      title: entry.title,
      snippet: entry.snippet,
      score: 0,
      wrongCount: wrongQuestionIds.length,
      wrongQuestionIds,
    }));
}

function entriesFor(subject: Subject): ConceptSearchEntry[] {
  const cached = entryCache.get(subject);
  if (cached) return cached;
  const entries = buildEntries(subject);
  entryCache.set(subject, entries);
  return entries;
}

function resultSnippet(entry: ConceptSearchEntry, terms: string[]): string {
  const matched = entry.snippetCandidates.find((candidate) => {
    const normalized = normalizeConceptSearchText(candidate);
    return terms.some((term) => normalized.includes(term));
  });
  const snippet = matched ?? entry.snippet;
  return snippet.length > 105 ? `${snippet.slice(0, 102).trimEnd()}...` : snippet;
}

export function searchConcepts(
  subject: Subject,
  query: string,
  limit = 24,
): ConceptSearchResult[] {
  return rankEntries(entriesFor(subject), query, limit);
}

export function searchConceptsInChapter(
  subject: Subject,
  chapter: number,
  query: string,
  limit = 12,
): ConceptSearchResult[] {
  return rankEntries(
    entriesFor(subject).filter((entry) => entry.chapter === chapter),
    query,
    limit,
  );
}

function rankEntries(
  entries: ConceptSearchEntry[],
  query: string,
  limit: number,
): ConceptSearchResult[] {
  const normalizedQuery = normalizeConceptSearchText(query);
  if (!normalizedQuery) return [];
  const terms = normalizedQuery.split(' ').filter(Boolean);

  return entries
    .filter((entry) =>
      terms.every((term) => entry.normalizedSearchText.includes(term)),
    )
    .map((entry) => {
      let score = 0;
      for (const term of terms) {
        if (entry.normalizedTitle === term) score += 140;
        else if (entry.normalizedTitle.startsWith(term)) score += 100;
        else if (entry.normalizedTitle.includes(term)) score += 80;

        if (entry.normalizedTopic === term) score += 60;
        else if (entry.normalizedTopic.includes(term)) score += 40;

        if (entry.normalizedChapterTitle.includes(term)) score += 18;
        score += 8;
      }

      return {
        subject: entry.subject,
        chapter: entry.chapter,
        chapterTitle: entry.chapterTitle,
        topic: entry.topic,
        stepIdx: entry.stepIdx,
        stepId: entry.stepId,
        title: entry.title,
        snippet: resultSnippet(entry, terms),
        score,
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.chapter - b.chapter ||
        a.stepIdx - b.stepIdx,
    )
    .slice(0, limit);
}

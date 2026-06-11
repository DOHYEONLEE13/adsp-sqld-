import type { Lesson, LessonBlock, LessonStep } from './types';

const PART_REVIEW_GROUP = 'part-review';
const LEGACY_PART_REVIEW_IDS = new Set(['adsp-1-1-s6-part1-wrapup']);
const MAX_REVIEW_QUIZZES = 5;
const PART_REVIEW_QUIZ_ID_EXCLUDES = new Set([
  // Present in the local bank, but not yet synced to live public.questions.
  'sqld-2-2-cp-04-subquery-place',
]);

export function isPartReviewStep(
  step: Pick<LessonStep, 'id'> & { group?: string },
): boolean {
  return (
    LEGACY_PART_REVIEW_IDS.has(step.id) ||
    step.id.endsWith('-part-review') ||
    step.id.endsWith('-part-wrapup') ||
    step.group === PART_REVIEW_GROUP ||
    step.group?.startsWith(`${PART_REVIEW_GROUP}:`) === true
  );
}

export function getPartReviewQuizIds(
  step: Pick<LessonStep, 'quizId' | 'extraQuizIds'>,
): string[] {
  return [step.quizId, ...(step.extraQuizIds ?? [])].filter(
    (id): id is string => !!id,
  );
}

export function getLessonQuizSteps(lesson: Lesson): LessonStep[] {
  return lesson.steps.filter(
    (step) =>
      !!step.quizId && !isPartReviewStep(step) && !step.id.endsWith('-finale'),
  );
}

function pickRepresentativeSteps(steps: LessonStep[]): LessonStep[] {
  const unique = steps.filter((step, index) => {
    if (!step.quizId) return false;
    if (PART_REVIEW_QUIZ_ID_EXCLUDES.has(step.quizId)) return false;
    return steps.findIndex((candidate) => candidate.quizId === step.quizId) === index;
  });
  if (unique.length <= MAX_REVIEW_QUIZZES) return unique;

  const selectedIndexes = new Set<number>();
  for (let i = 0; i < MAX_REVIEW_QUIZZES; i++) {
    selectedIndexes.add(
      Math.round(((unique.length - 1) * i) / (MAX_REVIEW_QUIZZES - 1)),
    );
  }

  for (let i = 0; selectedIndexes.size < MAX_REVIEW_QUIZZES && i < unique.length; i++) {
    selectedIndexes.add(i);
  }

  return Array.from(selectedIndexes)
    .sort((a, b) => a - b)
    .map((index) => unique[index]);
}

function compactText(text: string, maxLength = 42): string {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 1).trimEnd()}...`;
}

function summarizeBlock(block: LessonBlock): string | null {
  switch (block.kind) {
    case 'keypoints':
      return block.items[0] ? compactText(block.items[0]) : null;
    case 'section':
    case 'intro':
    case 'example':
      return compactText(block.body);
    case 'callout':
      return compactText(block.body);
    case 'table':
      return block.title
        ? compactText(block.title)
        : compactText(block.headers.join(' / '));
    default:
      return null;
  }
}

function summarizeStep(step: LessonStep): string {
  for (const block of step.blocks) {
    const summary = summarizeBlock(block);
    if (summary) return summary;
  }
  return '대표 개념을 다시 연결해 보기';
}

function buildPartReviewStep(
  lesson: Lesson,
  partNumber: number,
  representativeSteps: LessonStep[],
): LessonStep {
  const quizIds = representativeSteps
    .map((step) => step.quizId)
    .filter((id): id is string => !!id);
  const coreTitles = representativeSteps.map((step) => step.title);
  const firstThree = coreTitles.slice(0, 3).join(' · ');
  const reviewItems = representativeSteps.map(
    (step, index) => `${index + 1}. ${step.title}: ${summarizeStep(step)}`,
  );

  return {
    id: `${lesson.id}-s-part-wrapup`,
    title: `Part ${partNumber} ${lesson.topic} 총 복습`,
    quizId: quizIds[0],
    extraQuizIds: quizIds.slice(1),
    group: `${PART_REVIEW_GROUP}:${lesson.id}`,
    dialogue: [
      {
        pose: 'wave',
        text: `${lesson.topic} 전체를 한 번에 다시 묶어볼게.`,
      },
      {
        pose: 'think',
        text: firstThree
          ? `먼저 [${firstThree}] 흐름을 떠올려보자.`
          : '앞에서 본 핵심 개념들을 순서대로 떠올려보자.',
      },
      {
        pose: 'lightbulb',
        text: '각 개념을 따로 외우기보다 어떤 순서로 이어지는지 보면 문제 선지가 훨씬 빨리 정리돼.',
      },
      {
        pose: 'happy',
        text: `대표 문제 ${quizIds.length}개로 이 PART를 마무리 확인해보자.`,
      },
    ],
    blocks: [
      {
        kind: 'intro',
        body: `${lesson.topic}에서 배운 개념들을 한 장의 지도처럼 다시 연결하는 총복습이야. 개별 개념을 따로 외우기보다 어떤 순서로 이어지는지 먼저 잡으면 문제 선지가 덜 헷갈려.`,
      },
      {
        kind: 'keypoints',
        title: '전체 지도',
        items: reviewItems,
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: '복습할 때 보는 순서',
        body: '먼저 제목끼리 연결하고, 그다음 각 제목 아래의 핵심 문장을 확인해. 낯선 말이 나오면 그 구역이 다시 볼 개념이라는 신호야.',
      },
    ],
  };
}

export function addPartReviewSteps(lessons: Lesson[]): Lesson[] {
  const partCounters = new Map<string, number>();

  return lessons.map((lesson) => {
    const counterKey = `${lesson.subject}:${lesson.chapter}`;
    const partNumber = (partCounters.get(counterKey) ?? 0) + 1;
    partCounters.set(counterKey, partNumber);

    if (lesson.steps.some(isPartReviewStep)) {
      return lesson;
    }

    const quizSteps = getLessonQuizSteps(lesson);
    const representativeSteps = pickRepresentativeSteps(quizSteps);
    if (representativeSteps.length === 0) {
      return lesson;
    }

    return {
      ...lesson,
      steps: [
        ...lesson.steps,
        buildPartReviewStep(lesson, partNumber, representativeSteps),
      ],
    };
  });
}

import type {
  Difficulty,
  Question,
  QuestionBank,
  Subject,
} from '@/types/question';
import { groupBy, shuffle } from './utils';

// Vite glob import: 모든 문제 파일을 eager-load 합니다.
// 새 JSON 을 `src/data/questions/<subject>/` 에 추가하면 자동 픽업됩니다.
// 두 가지 루트 모양을 모두 허용합니다:
//   1) { subject, meta, questions: [...] }      (sample.json 형태)
//   2) [ q1, q2, ... ]                          (past-exams/*.json 형태)
const QUESTION_MODULES = import.meta.glob<QuestionBank | Question[]>(
  '../data/questions/*/**/*.json',
  { eager: true, import: 'default' },
);

/** 로드된 각 파일을 정규화된 QuestionBank 로 변환. */
function normalizeBank(
  raw: QuestionBank | Question[] | undefined,
  path: string,
): QuestionBank | null {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    if (raw.length === 0) return null;
    const subject = raw[0]?.subject ?? 'adsp';
    return {
      subject,
      meta: { version: '0.0.0', updatedAt: '', source: path, notes: '' },
      questions: raw.filter(Boolean),
    };
  }
  if (!raw.questions || !Array.isArray(raw.questions)) return null;
  return raw;
}

/** 모든 문제 은행 (JSON 파일 모음). */
export const ALL_QUESTION_BANKS: QuestionBank[] = Object.entries(
  QUESTION_MODULES,
)
  .map(([path, mod]) => normalizeBank(mod, path))
  .filter((b): b is QuestionBank => b !== null);

/** 모든 문제를 평탄화한 배열. undefined 엔트리는 안전하게 제거. */
export const ALL_QUESTIONS: Question[] = ALL_QUESTION_BANKS.flatMap((bank) =>
  bank.questions.filter((q): q is Question => Boolean(q)),
);

export function countBySubject(): Record<Subject, number> {
  const counts: Record<Subject, number> = { adsp: 0, sqld: 0 };
  for (const q of ALL_QUESTIONS) counts[q.subject]++;
  return counts;
}

export interface QuestionFilter {
  subject?: Subject;
  chapter?: number;
  topics?: string[];
  difficulty?: Difficulty | Difficulty[];
  /** 특정 ID 제외. 같은 세션에서 중복 방지용. */
  excludeIds?: string[];
}

/** 필터를 적용해 문제를 반환. */
export function filterQuestions(
  filter: QuestionFilter = {},
  source: readonly Question[] = ALL_QUESTIONS,
): Question[] {
  const excludeSet = filter.excludeIds ? new Set(filter.excludeIds) : null;
  const difficultySet = filter.difficulty
    ? new Set(
        Array.isArray(filter.difficulty) ? filter.difficulty : [filter.difficulty],
      )
    : null;
  const topicSet = filter.topics ? new Set(filter.topics) : null;

  return source.filter((q) => {
    if (filter.subject && q.subject !== filter.subject) return false;
    if (filter.chapter != null && q.chapter !== filter.chapter) return false;
    if (topicSet && !topicSet.has(q.topic)) return false;
    if (difficultySet && (!q.difficulty || !difficultySet.has(q.difficulty)))
      return false;
    if (excludeSet && excludeSet.has(q.id)) return false;
    return true;
  });
}

/** 필터 결과에서 n 개를 무작위로 뽑기. */
export function pickRandom(
  n: number,
  filter: QuestionFilter = {},
): Question[] {
  return shuffle(filterQuestions(filter)).slice(0, n);
}

/** 챕터별 그룹핑. */
export function groupByChapter(questions: readonly Question[]) {
  return groupBy(questions, (q) => q.chapter);
}

/** 주제별 그룹핑 — AI 약점 분석의 기본 단위. */
export function groupByTopic(questions: readonly Question[]) {
  return groupBy(questions, (q) => q.topic);
}

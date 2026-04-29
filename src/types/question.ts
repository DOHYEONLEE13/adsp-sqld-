/**
 * Domain types for ADSP / SQLD question banks.
 *
 * Designed to scale to 10k+ questions across both subjects.
 * Raw question files live under `src/data/questions/<subject>/` and are
 * loaded via helpers in `src/lib/questions.ts`.
 */

export type Subject = 'adsp' | 'sqld';

export type QuestionType = 'multiple_choice' | 'fill_blank' | 'short_answer';

/** 1 = 매우 쉬움, 5 = 매우 어려움 */
export type Difficulty = 1 | 2 | 3 | 4 | 5;

/**
 * 문제 라이프사이클 상태.
 * - `restored`: 기출 복원. 정답 텍스트만 있고 오답 선지가 없는 상태.
 * - `ai-generated`: Claude 가 생성한 문제. 검수 전.
 * - `draft`: 사람이 작성 중.
 * - `curated`: 검수 완료, 실제 게임에 노출 가능.
 */
export type QuestionStatus =
  | 'restored'
  | 'ai-generated'
  | 'draft'
  | 'curated';

export interface QuestionBase {
  /** Stable unique id. Recommended: `<subject>-<chapter>-<index>` */
  id: string;
  subject: Subject;
  /** 과목 번호 (ADSP 1~3, SQLD 1~2). */
  chapter: number;
  /** e.g. "데이터 분석 기획", "SQL 기본 및 활용" */
  chapterTitle: string;
  /** 세부 개념 분류. AI 약점 분석의 기준이 됩니다. e.g. "통계적 가설 검정" */
  topic: string;
  /** 더 구체적인 하위 주제 (옵션). e.g. "양측 검정" */
  subtopic?: string;
  difficulty?: Difficulty;
  /** 출처. e.g. "2024년 제38회 기출", "자체 예상" */
  source?: string;
  tags?: string[];
  /** 풀이/해설 */
  explanation?: string;
  /** 라이프사이클 상태. 기본값은 `curated` (게임 노출 가능). */
  status?: QuestionStatus;
  /** 4지선다 중 오답 선지가 아직 미완성인 경우 true. */
  needsDistractors?: boolean;
  /**
   * N회독 시스템에서 어느 차수에 출제될지. 기본 1 (1회독 = 원본 문제).
   * 2 = 2회독용 변형 (더 어려운 distractor·응용 케이스).
   * 3 = 3회독용 (최고난이도 또는 1·2회독 mix).
   */
  pass?: number;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multiple_choice';
  question: string;
  choices: string[];
  /** 0-based index into `choices`. */
  answerIndex: number;
}

export interface FillBlankQuestion extends QuestionBase {
  type: 'fill_blank';
  /** 빈칸은 `{{blank}}` 또는 `____` 로 표기합니다. */
  question: string;
  /** 단일 정답 또는 허용되는 동의어 배열. */
  answer: string | string[];
}

export interface ShortAnswerQuestion extends QuestionBase {
  type: 'short_answer';
  question: string;
  answer: string | string[];
}

export type Question =
  | MultipleChoiceQuestion
  | FillBlankQuestion
  | ShortAnswerQuestion;

/** 문제 은행 파일 루트 구조. JSON 파일은 이 shape 을 따릅니다. */
export interface QuestionBank {
  subject: Subject;
  /** 파일 메타. */
  meta?: {
    version?: string;
    updatedAt?: string;
    source?: string;
    notes?: string;
  };
  questions: Question[];
}

/** 과목 스키마 정의 (드롭다운/필터 UI 에서 사용) */
export interface SubjectSchema {
  subject: Subject;
  title: string;
  chapters: Array<{
    chapter: number;
    title: string;
    topics: string[];
  }>;
}

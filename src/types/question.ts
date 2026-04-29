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

/**
 * 풍부한 해설 객체 — 학습자가 정답·오답·핵심 개념·암기 팁까지 한 번에 파악.
 * 단순 문자열 explanation 보다 풍부하지만 호환성 위해 Union (`string | ExplanationObj`).
 *
 * UI 렌더링:
 *   - string 이면 그대로 출력
 *   - 객체면 섹션별로 헤더 + 본문 카드 형태
 */
export interface ExplanationObj {
  /** 이 문제가 묻는 핵심 개념 정의·맥락. */
  core_concept: string;
  /** 정답이 정답인 이유. */
  why_correct: string;
  /**
   * 각 오답이 오답인 이유. key 는 1-based 보기 번호 (UI 의 ① ② ③ ④ 순서와 일치).
   * 모든 오답을 다 채울 필요는 없지만 핵심 distractor 1~2개는 권장.
   */
  why_wrong?: Record<string, string>;
  /** 암기 팁 / 함정 포인트. */
  tip?: string;
  /** 관련 키워드 — 추후 약점 분석·복습 큐 매핑에 사용. */
  related?: string[];
}

/**
 * 품질 감사 메타. Phase 3 (수정) 결과 기록.
 * 선택적 필드 — 미수정 문항엔 부재. 통계·diff 분석에 사용.
 */
export interface AuditMeta {
  /** 수정한 결함 코드 — A1·A2·B1·C2 등 (체크리스트 항목). */
  fixed: string[];
  /** 변경된 필드 경로 — choices[2], explanation 등. */
  changed_fields: string[];
  /** 수정 사유 (한 줄). */
  reason: string;
  /** 수정 시점 ISO. */
  audited_at?: string;
}

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
  /**
   * 풀이/해설.
   *  - string: 단순 한 줄/문단 — 기존 데이터 그대로 호환
   *  - ExplanationObj: 풍부한 구조 — Phase 2/3 수정 후 권장 형태
   */
  explanation?: string | ExplanationObj;
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
  /** 품질 감사 메타. Phase 3 수정 결과 기록. */
  _audit?: AuditMeta;
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

/**
 * explanation (string | ExplanationObj) 을 일관된 평문 문자열로 변환.
 * UI 가 단순 텍스트만 필요할 때 사용. 객체면 섹션별로 합쳐 readable 하게.
 */
export function explanationToText(
  exp: string | ExplanationObj | undefined,
): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  const parts: string[] = [];
  if (exp.core_concept) parts.push(exp.core_concept);
  if (exp.why_correct) parts.push(`✅ ${exp.why_correct}`);
  if (exp.why_wrong) {
    for (const [k, v] of Object.entries(exp.why_wrong)) {
      parts.push(`❌ ${k}번: ${v}`);
    }
  }
  if (exp.tip) parts.push(`💡 ${exp.tip}`);
  return parts.join('\n\n');
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

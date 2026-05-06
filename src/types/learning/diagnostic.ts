/**
 * Diagnostic — 진단 테스트 (재응시생 페르소나).
 *
 * 리서치 1-3-B (진단형 분기), 1-4 (진단 테스트 알고리즘) 정본.
 *
 * Q2 결정 (2026-05-05):
 *   - 별도 테이블 (`diagnostic_sessions`, `diagnostic_results`) — sessions 와 분리.
 *   - 진단은 1회 측정 + 결과 저장의 라이프사이클로 별도 관리.
 *
 * 알고리즘 (1-4-1절):
 *   - 기본 25~30문항 (단원별 동일 비율).
 *   - 적응형: 한 단원 50% 이상 틀리면 추가 5문항 (시험당 1회만).
 *   - difficulty: 중 난이도 풀에서 추출.
 *   - 종료 조건: 25~30 완료 또는 사용자 "그만" (최소 15 이후).
 *
 * 약점 판정 (1-4-3절):
 *   - 정답률 80%+ : 강점 (strong)
 *   - 60~80% : 보통 (normal)
 *   - 40~60% : 약점 (weak)
 *   - 40% 미만 : 심각한 약점 (critical)
 *   - 응시 < 5 : 신뢰도 낮음 (low_confidence)
 */

import type { Subject } from '../question';

type ExamSubject = Extract<Subject, 'adsp' | 'sqld'>;

/**
 * 단원별 약점 등급 (1-4-3절).
 */
export type WeaknessLevel =
  | 'strong'         // 정답률 80%+ : 강점
  | 'normal'         // 60~80% : 보통
  | 'weak'           // 40~60% : 약점
  | 'critical'       // 40% 미만 : 심각한 약점
  | 'low_confidence' // 응시 < 5 : 신뢰도 낮음 (단정 회피)
  | 'unknown';       // 응시 0 : 미진단

/**
 * 진단 세션 상태.
 *   - in_progress: 진행 중
 *   - completed: 정상 종료 (25~30 완료)
 *   - aborted_early: 사용자 "그만" (15 이상 풀이 후 자발적 종료)
 *   - aborted_invalid: 15 미만에서 종료 (결과 신뢰도 낮음 → 결과 미생성)
 */
export type DiagnosticSessionStatus =
  | 'in_progress'
  | 'completed'
  | 'aborted_early'
  | 'aborted_invalid';

/**
 * DiagnosticSession — 진단 테스트 세션 메타.
 *
 * Supabase 테이블 `diagnostic_sessions` 의 row 1:1 매핑.
 * 한 사용자가 여러 진단 세션 가능 (재진단). 가장 최근 completed/aborted_early 가
 * UserProfile.latest_diagnostic_session_id 에 참조됨.
 */
export interface DiagnosticSession {
  // ───────────────────────────────────────────────
  // 식별
  // ───────────────────────────────────────────────

  /** 서버 발급 UUID. */
  session_id: string;

  /** 사용자. */
  user_id: string;

  // ───────────────────────────────────────────────
  // 세션 메타 (MVP 필수)
  // ───────────────────────────────────────────────

  /** 진단 대상 시험. */
  exam: ExamSubject;

  /** 시작 시각. */
  started_at: Date;

  /** 종료 시각 (in_progress 시 null). */
  ended_at: Date | null;

  /** 상태. */
  status: DiagnosticSessionStatus;

  // ───────────────────────────────────────────────
  // 알고리즘 추적 (1-4-1절)
  // ───────────────────────────────────────────────

  /**
   * 출제된 문항 ID 순서 (legacy_id).
   * 적응형 추가 출제 포함 — 마지막 5는 적응형으로 추가된 단원의 문항일 수 있음.
   */
  question_ids: string[];

  /**
   * 적응형 추가 출제 발생 여부 (1-4-1절).
   * true: 한 단원 50% 이상 틀려서 추가 5문항 출제됨.
   * 시험당 1회만 발생.
   */
  adaptive_extension_triggered: boolean;

  /**
   * 적응형 추가 출제 대상 chapter_id (트리거 시).
   * 예: 'adsp-3-2' (통계 분석 단원에서 50% 이상 틀려서 추가 출제).
   */
  adaptive_extension_chapter_id?: string | null;
}

/**
 * 단원별 진단 결과 (1-4-3절).
 */
export interface ChapterDiagnosticResult {
  /** Chapter ID (예: 'adsp-1-1'). */
  chapter_id: string;

  /** 응시 문제 수. */
  attempted: number;

  /** 맞힌 문제 수. */
  correct: number;

  /** 정답률 0~1. */
  accuracy: number;

  /** 약점 등급. */
  level: WeaknessLevel;

  /**
   * 신뢰도 분류 (1-4-3절):
   *   - low: 응시 < 5
   *   - normal: 5 ≤ 응시 < 10
   *   - high: 응시 ≥ 10 (적응형 추가 출제 후)
   */
  confidence: 'low' | 'normal' | 'high';
}

/**
 * DiagnosticResult — 진단 종료 후 분석 결과.
 *
 * Supabase 테이블 `diagnostic_results` 의 row 1:1 매핑.
 * session_id 와 1:1 (DiagnosticSession 종료 시점에 생성).
 */
export interface DiagnosticResult {
  // ───────────────────────────────────────────────
  // 식별
  // ───────────────────────────────────────────────

  /** 서버 발급 UUID. */
  result_id: string;

  /** 진단 세션 (1:1). */
  session_id: string;

  /** 사용자. */
  user_id: string;

  /** 시험. */
  exam: ExamSubject;

  // ───────────────────────────────────────────────
  // 분석 결과 (MVP 필수, 1-4-3/1-4-4절)
  // ───────────────────────────────────────────────

  /**
   * 단원별 결과.
   * 모든 단원 포함 (응시 0인 단원도 'unknown' level 로 표시).
   */
  chapters: ChapterDiagnosticResult[];

  /**
   * 약점 단원 ID 목록 (정답률 낮은 순).
   * level ∈ {weak, critical} 만 포함.
   * 학습 플랜 (재응시생용, 2-2절) 의 weak_chapter_ids 입력.
   */
  weak_chapter_ids: string[];

  /**
   * 종합 진단 메시지 (1-4-4절).
   * 예: "당신은 통계 분석 영역이 약해요. 거기에 집중하면 합격 가능성이 크게 올라가요."
   * 자동 생성 (가장 약한 단원 1~2개 기반).
   */
  summary_message: string;

  // ───────────────────────────────────────────────
  // 합격 가능성 예측 (1-4-4절)
  // ───────────────────────────────────────────────

  /**
   * 현재 시점 합격 가능성 (%, 0~100).
   * Phase 4 Step 5 의 predict_score 알고리즘 활용 (4절).
   */
  current_pass_probability: number;

  /**
   * 약점 보강 후 합격 가능성 시뮬레이션 (%).
   * "이 단원 보강 시 +N% 예상" UI 활용.
   */
  projected_pass_probability_after_improvement: number;

  // ───────────────────────────────────────────────
  // 메타
  // ───────────────────────────────────────────────

  /** 진단 종료 시각. */
  diagnosed_at: Date;
}

/**
 * 진단 테스트 알고리즘 입력 (1-4-1절).
 * Phase 4 Step 2 (첫 진입 플로우) 구현 시 사용.
 */
export interface DiagnosticConfig {
  /** 시험 종류. */
  exam: ExamSubject;

  /** 기본 출제 문항 수 (25~30, 사용자 부담 감안). */
  base_questions: number;

  /** 적응형 추가 출제 trigger 임계 (오답률, 0~1). */
  adaptive_trigger_error_rate: number;

  /** 적응형 추가 출제 문항 수. */
  adaptive_extra_questions: number;

  /** 사용자 "그만" 옵션 활성 임계 (최소 풀이 수). */
  early_abort_min_questions: number;
}

/**
 * 진단 테스트 기본 설정 (1-4-1절).
 */
export const DIAGNOSTIC_DEFAULT_CONFIG: Readonly<DiagnosticConfig> = {
  exam: 'adsp', // placeholder — 실제 사용 시 사용자 선택값 적용
  base_questions: 28, // 25~30 중간값
  adaptive_trigger_error_rate: 0.5, // 50% 이상 틀림
  adaptive_extra_questions: 5,
  early_abort_min_questions: 15,
} as const;

/**
 * 약점 판정 임계 (1-4-3절).
 */
export const WEAKNESS_THRESHOLDS = {
  STRONG_MIN: 0.8,   // 80%+ : strong
  NORMAL_MIN: 0.6,   // 60~80% : normal
  WEAK_MIN: 0.4,     // 40~60% : weak
  // < 0.4 : critical
  LOW_CONFIDENCE_MAX_ATTEMPTS: 5, // 응시 < 5 : low_confidence
} as const;

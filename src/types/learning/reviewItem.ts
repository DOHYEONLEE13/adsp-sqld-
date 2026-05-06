/**
 * ReviewItem — 망각 곡선 복습 큐 1 항목 (사용자 × 문항 N:M).
 *
 * 리서치 9-3절, 3절 (망각 곡선 시스템) 정본.
 *
 * 알고리즘: SM-2 변형 (3-1절).
 *   복습 간격: 1d → 3d → 7d → 14d → 30d (5-tier).
 *   30일 통과 시 'mastered' 상태 — 자동 출제 X.
 *
 * 운영 코드 통합 (Phase 0 분석):
 *   - 기존 `src/game/review.ts` 의 Leitner box 0~4 (1d/3d/7d/14d) 와 호환 확장.
 *     - Q4 결정: 5-tier (1/3/7/14/30) 로 backward-compatible 확장.
 *     - 기존 box 0~3 → current_interval 1/3/7/14 그대로 마이그레이션.
 *     - 신규 30일 단계 추가 + 'mastered' 상태 도입.
 *   - 기존 `question_stats` 테이블의 wrong_streak/last_correct/avg_time_ms 는
 *     Phase 4 에서도 활용 (성능: review queue 우선순위 정렬).
 */

/**
 * 망각 곡선 5단계 (3-1절).
 * 운영 코드의 Leitner box (0~4) 와 매핑:
 *   - box 0 (실패/신규)  → interval 0 (즉시 다시)
 *   - box 1 (1d 통과)   → interval 1
 *   - box 2 (3d 통과)   → interval 2 (3일)
 *   - box 3 (7d 통과)   → interval 3 (7일)
 *   - (신규)            → interval 4 (14일)
 *   - (신규)            → interval 5 (30일)
 *
 * Phase 4 에서는 day 기반 (1/3/7/14/30) 을 직접 표기 — 더 명료.
 */
export type ReviewIntervalDays = 0 | 1 | 3 | 7 | 14 | 30;

/**
 * ReviewItem 라이프사이클 상태.
 *   - active: 큐에 살아있음 (다음 복습 예정).
 *   - mastered: 30일 통과 후 마스터 (자동 출제 X, 사용자가 수동으로만 다시 풀이 가능).
 *   - paused: 사용자가 일시 정지 (예: "이 문항 그만 보기" 옵션, v1.1+).
 */
export type ReviewItemStatus = 'active' | 'mastered' | 'paused';

/**
 * ReviewItem — 사용자별 문항 복습 메타.
 *
 * Supabase 테이블 `review_items` 의 row 1:1 매핑.
 * Composite PK: (user_id, question_id).
 *
 * 인덱스: user_id + due_date (오늘 만기 큐 빠른 조회).
 */
export interface ReviewItem {
  // ───────────────────────────────────────────────
  // 식별 (Composite PK)
  // ───────────────────────────────────────────────

  user_id: string;

  /** 운영 legacy_id (예: "adsp-1-1-cp-01a"). attempts.question_id 와 동일. */
  question_id: string;

  // ───────────────────────────────────────────────
  // SM-2 변형 메타 (MVP 필수)
  // ───────────────────────────────────────────────

  /** 현재 복습 interval (일). 5-tier: 1, 3, 7, 14, 30. 신규 항목은 0 또는 1. */
  current_interval: ReviewIntervalDays;

  /**
   * SM-2 ease factor (난이도 가중).
   * 기본 2.5. 정답 시 약간 ↑, 오답 시 ↓.
   * 사용자별 문항 별 학습 난이도를 반영.
   * (운영 question_stats.avg_time_ms / wrong_streak 와 보완 관계.)
   */
  ease_factor: number;

  /** 연속 정답 카운트. 운영 question_stats 와 별개로 ReviewItem 생성 후 누적. */
  consecutive_correct: number;

  /** 연속 오답 카운트. 3 도달 시 "이 개념 lesson 다시 보기" 추천 (3-1절). */
  consecutive_wrong: number;

  // ───────────────────────────────────────────────
  // 일정 (MVP 필수)
  // ───────────────────────────────────────────────

  /** 다음 복습 예정 날짜. NULL 일 수 있음 (paused/mastered). */
  due_date: Date | null;

  /** 마지막 풀이 시각. */
  last_attempted_at: Date;

  // ───────────────────────────────────────────────
  // 상태 (MVP 필수)
  // ───────────────────────────────────────────────

  /** active / mastered / paused. */
  status: ReviewItemStatus;

  // ───────────────────────────────────────────────
  // A/B 테스트 추적 (v1.1+, ease_factor 초기값 cohort 분석)
  // ───────────────────────────────────────────────

  /**
   * ease_factor 초기값 variant — 사용자 첫 ReviewItem 생성 시 부여.
   * 출시 후 정답률·이탈률 cohort 분석 입력.
   * MVP 에서는 default = 'STANDARD'. 사용자별 추천값은 `recommendEaseFactor()` 사용.
   * Phase 4 Step 4 구현 시 profiles 에 동일 값 저장 (사용자 일관성).
   */
  ease_factor_variant?: EaseFactorVariant;
}

/**
 * 일일 복습 큐 1 항목 (UI 렌더용).
 * 퀘스트 탭 (3-5절) 의 "오늘의 복습" 섹션이 본 형식 사용.
 */
export interface ReviewQueueItem {
  /** ReviewItem 의 사본 (composite key 분해 + 보강 메타). */
  user_id: string;
  question_id: string;
  current_interval: ReviewIntervalDays;
  due_date: Date | null;

  /** 우선순위 점수 (높을수록 먼저). 큐 정렬 키. */
  priority: number;

  /** 우선순위 분류 (UI 배지 표시용). */
  priority_reason:
    | 'overdue'         // 오늘 만기 — 최우선 (3-2절)
    | 'wrong_yesterday' // 어제 틀린 문제 (1일 복습 대상)
    | 'weak_chapter'    // 약점 단원 소속
    | 'normal';

  /** 문항 메타 (캐시) — Q-bank 호출 절약. */
  question_topic?: string;
  question_chapter?: number;
}

/**
 * 망각 곡선 알고리즘 입력 (3-1절).
 * Phase 4 Step 4 (망각 곡선 구현) 에서 핵심 로직 입력.
 */
export interface ReviewUpdateInput {
  /** 현재 ReviewItem 상태. */
  current: ReviewItem;
  /** 새 풀이 결과. */
  is_correct: boolean;
  /** 풀이 시각 (계산 기준). */
  attempted_at: Date;
}

/**
 * 망각 곡선 알고리즘 출력 (3-1절).
 * 다음 due_date / interval / status 결정.
 */
export interface ReviewUpdateOutput {
  /** 갱신된 ReviewItem (DB upsert 대상). */
  next: ReviewItem;
  /** "이 개념 lesson 다시 보기" 추천 여부 (consecutive_wrong ≥ 3 트리거). */
  recommend_lesson_replay: boolean;
}

/**
 * 일일 복습 상한 (3-3절).
 * 페르소나별 상한:
 *   - 입문자: 15문항/일 (학습 부담 가중)
 *   - 재응시생: 25문항/일 (기존 기억 활용)
 */
export const DAILY_REVIEW_LIMITS = {
  beginner: 15,
  reviewer: 25,
} as const;

/**
 * Interval 진행 순서 (3-1절).
 * 정답 시 다음 interval 로 progression.
 */
export const INTERVAL_PROGRESSION: Readonly<Record<ReviewIntervalDays, ReviewIntervalDays>> = {
  0: 1,
  1: 3,
  3: 7,
  7: 14,
  14: 30,
  30: 30, // mastered → 더 이상 진행 X
} as const;

/**
 * SM-2 ease_factor 초기값 정책 (Reviewer 지적 #4 반영).
 *
 * 배경:
 *   - 기존 SM-2 (Anki 등) default = 2.5
 *   - 그러나 우리 도메인 (자격증 학습) 의 첫 학습 경험은 ease_factor 초기값에 좌우됨.
 *   - 너무 높음 (2.5+): 정답 시 interval 빠르게 늘어 → 학습자 부담 ↓ but 망각 위험 ↑
 *   - 너무 낮음 (2.0-): interval 천천히 늘어 → 안전 but 학습 진도 ↓ → 이탈 위험
 *
 * A/B 테스트 가능 구조:
 *   - 사용자 페르소나·배경별 차등 초기값
 *   - 출시 후 정답률·이탈률 데이터 기반 점진 조정
 *   - variant 식별자 (`ease_factor_variant`) 를 ReviewItem 에 기록하면 cohort 분석 가능
 *
 * Phase 4 Step 4 구현 시:
 *   - 본 상수에서 적절한 초기값 선택
 *   - variant 추가 가능성 명시
 *   - profiles 의 `ease_factor_variant` 필드 (Phase 4 Step 4 또는 v1.1 추가) 로 A/B 그룹 표시
 */
export const EASE_FACTOR_INITIAL = {
  /** 보수적 — 비전공자 입문자에 적합. 천천히 + 안전. */
  CONSERVATIVE: 2.0,
  /** 표준 — SM-2 default. */
  STANDARD: 2.5,
  /** 적극적 — 경험 있는 재응시생에 적합. 빠른 progression. */
  AGGRESSIVE: 2.8,
} as const;

export type EaseFactorVariant = keyof typeof EASE_FACTOR_INITIAL;

/**
 * 페르소나·배경 기반 ease_factor 초기값 추천 (Phase 4 Step 4 구현 입력).
 *
 * - 입문자 + 비전공자: CONSERVATIVE (2.0) — 부담 최소화
 * - 입문자 + 일부 기초: STANDARD (2.5)
 * - 입문자 + 경험 있음: STANDARD (2.5)
 * - 재응시생 + 비전공자: STANDARD (2.5) — 약점 보강 모드
 * - 재응시생 + 일부 기초: AGGRESSIVE (2.8) — 빠른 복습
 * - 재응시생 + 경험 있음: AGGRESSIVE (2.8)
 *
 * 출시 후 변경 가능 — A/B 테스트 결과 반영.
 */
export function recommendEaseFactor(
  persona: 'beginner' | 'reviewer' | 'unknown',
  background: 'novice' | 'some_basis' | 'experienced',
): number {
  if (persona === 'beginner' && background === 'novice') return EASE_FACTOR_INITIAL.CONSERVATIVE;
  if (persona === 'reviewer' && background !== 'novice') return EASE_FACTOR_INITIAL.AGGRESSIVE;
  return EASE_FACTOR_INITIAL.STANDARD;
}

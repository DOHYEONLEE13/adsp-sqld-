/**
 * CohortStats — 같은 회차 응시생 비교 데이터 (집계).
 *
 * 리서치 9-5절, 5절 (같은 회차 응시생 비교) 정본.
 *
 * 활성 정책 (5절):
 *   - 사용자 < 100명: 절대 평가만 (5-1절). cohortStats.enabled = false.
 *   - 사용자 ≥ 100명: 상대 평가 추가 (5-2절). enabled = true, 표시 시작.
 *   - 합격자 ≥ 30명: 합격자 평균 패턴 비교 (5-3절). passers_data 활성.
 *
 * 거짓 데이터 절대 금지 (5-5절):
 *   - 응시생 N명 가짜 표시 X
 *   - 합격자 평균 0건일 때 평균값 표시 X
 *
 * v1.2 이후 활성 (10-3절). MVP 에서는 데이터 모델만 정의.
 */

import type { Subject } from '../question';

type ExamSubject = Extract<Subject, 'adsp' | 'sqld'>;

/**
 * CohortStats — 회차별 집계 통계.
 *
 * Supabase 테이블 `cohort_stats` 의 row.
 * Composite PK: (exam, exam_date).
 * 매일 또는 사용자 활동 시 RPC 로 갱신 (집계 함수).
 */
export interface CohortStats {
  // ───────────────────────────────────────────────
  // 식별 (Composite PK)
  // ───────────────────────────────────────────────

  exam: ExamSubject;

  /** 시험일 (회차 식별). 같은 시험이라도 회차마다 별도 row. */
  exam_date: Date;

  // ───────────────────────────────────────────────
  // 사용자 풀 (5-2절)
  // ───────────────────────────────────────────────

  /** 본 회차에 응시 예정/예정이었던 사용자 수 (UserProfile.exam_dates 기반 집계). */
  total_users: number;

  /**
   * 활성 여부.
   * total_users ≥ 100 일 때 true 로 전환 (5-2절).
   * false 인 경우 UI 에서 cohort 비교 비표시 — 절대 평가만.
   */
  enabled: boolean;

  // ───────────────────────────────────────────────
  // D-day 별 평균 진도 (5-1/5-2절)
  // ───────────────────────────────────────────────

  /**
   * D-day 별 평균 진도율 (0~100).
   * key = 시험일까지 남은 일수 (예: 60, 45, 30, 20, 10, 3)
   *
   * 활성 전 (사용자 < 100명):
   *   - 책·인강·합격 후기 기반 추정값으로 EXPECTED_PROGRESS_BY_DDAY 사용 (절대 평가).
   * 활성 후 (사용자 ≥ 100명):
   *   - 실제 사용자 진도 기반 평균 갱신 (상대 평가).
   */
  d_day_avg_progress: { [d_day: number]: number };

  // ───────────────────────────────────────────────
  // 합격자 데이터 (5-3절, v1.2+)
  // ───────────────────────────────────────────────

  /**
   * 합격자 데이터 (PassResponse 누적 기반).
   * count ≥ 30 일 때만 의미 있는 데이터로 활용 (5-3절).
   */
  passers_data: {
    /**
     * 합격자 수.
     * < 30: avg_chapter_accuracy / avg_total_attempts 표시 X (거짓 데이터 방지).
     */
    count: number;

    /**
     * 합격자 단원별 평균 정답률 (0~1).
     * key = chapter_id (예: 'adsp-1-1').
     */
    avg_chapter_accuracy: { [chapter_id: string]: number };

    /** 합격자 총 풀이 문항 수 평균. */
    avg_total_attempts: number;
  };

  // ───────────────────────────────────────────────
  // 메타
  // ───────────────────────────────────────────────

  /** 마지막 집계 갱신 시각. */
  last_updated_at: Date;
}

/**
 * 절대 평가 baseline — 책·인강·합격 후기 기반 추정 (5-1절).
 *
 * cohortStats.enabled = false 일 때 (사용자 < 100명) 사용자에게 표시할 진도 기준.
 *
 * 본 데이터는 `cohort_stats` DB 와 분리 — 코드 상수 (Phase 4 Step 5 활용).
 */
export const EXPECTED_PROGRESS_BY_DDAY: Readonly<{
  [exam in ExamSubject]: { [d_day: number]: number };
}> = {
  adsp: {
    60: 10,
    45: 30,
    30: 55,
    20: 75,
    10: 90,
    3: 100,
  },
  sqld: {
    // SQLD 는 ADsP 보다 SQL 비중 (80%) 높아 분량 분포 다름.
    // 추정값 — Phase 4 Step 5 구현 시 합격 후기 기반 보정 가능.
    60: 12,
    45: 33,
    30: 58,
    20: 78,
    10: 92,
    3: 100,
  },
} as const;

/**
 * 활성화 임계 (5절).
 * 5-2절: 사용자 100명 이상에서 상대 평가 활성.
 */
export const COHORT_ENABLE_THRESHOLD = 100 as const;

/**
 * 합격자 데이터 활용 임계 (5-3절).
 * 합격자 30명 이상 누적 시 passers_data 표시.
 */
export const PASSERS_ENABLE_THRESHOLD = 30 as const;

/**
 * StudyPlan — 학습 플랜 (시험일 기반 + 페르소나 차등).
 *
 * 리서치 9-4절, 2절 (학습 플랜 알고리즘) 정본.
 *
 * 알고리즘 (2-1-4절):
 *   1. 권장 학습 시간 산정 (페르소나 × 배경, 2-1-2절 표)
 *   2. 가용 시간 계산 (D-day - review_buffer_days × daily_minutes)
 *   3. 시간 부족/여유 판정 → priority/balanced/deep 모드
 *   4. 단원별 시간 배분 (2-1-3절 비율표)
 *   5. 마지막 3일 review_buffer
 *   6. 망각 곡선 통합 (3절)
 *
 * 운영 코드 통합 (Phase 0):
 *   - 기존 lesson 시스템 (`src/data/lessons/`) 의 chapter id 와 정합 (예: 'adsp-1-1').
 *   - 기존 step_unlocks 테이블 (0001) 과 분리 — StudyPlan 은 학습 일정,
 *     step_unlocks 는 무료 구간 잠금 해제 (다른 도메인).
 *
 * Q3 결정 (2026-05-05):
 *   - 별도 `study_plans` 테이블 (사용자당 N개 plan, active 표시).
 *   - replan 시 새 plan row 추가 + 이전 plan inactive 처리.
 *   - replan_history 는 별도 테이블 — 마케팅 자산 활용 ("플랜 재조정 N회 후 합격").
 */

import type { UserBackground } from './userProfile';
import type { LearningExamSubject } from './exam';

type ExamSubject = LearningExamSubject;

/**
 * 시간 부족/여유 판정 모드 (2-1-4절).
 *   - priority: 시간 부족 (ratio < 0.7) — 핵심 단원만 집중
 *   - balanced: 딱 맞는 일정 (0.7 ≤ ratio < 1.2)
 *   - deep: 여유 있음 (ratio ≥ 1.2) — 심화 학습
 */
export type PlanMode = 'priority' | 'balanced' | 'deep';

/**
 * 단원별 학습 진도 (StudyPlan 의 chapter row).
 */
export interface StudyPlanChapter {
  /**
   * Chapter ID — 운영 lesson 의 식별자.
   * 예: 'adsp-1-1', 'sqld-2-2'
   * (운영 코드의 lesson_id 와 일치 — `src/data/lessons/<exam>/_metadata/ch*.yaml` 참조.)
   */
  chapter_id: string;

  /** 계획된 학습 시간 (분). */
  planned_minutes: number;

  /** 실제 누적 학습 시간 (분). 사용자가 lesson/문제 풀이 시 누적. */
  actual_minutes: number;

  /** 진행률 0~100. (actual_minutes / planned_minutes 기반 계산.) */
  completion_rate: number;
}

/**
 * 주간 학습 단위 (StudyPlan 의 week row).
 */
export interface StudyPlanWeek {
  /** 1부터 시작 (1주차, 2주차, ...). */
  week_number: number;

  /** 주간 시작 일자 (월요일 또는 사용자 시작일 기준). */
  start_date: Date;

  /** 주간 종료 일자. */
  end_date: Date;

  /** 해당 주에 학습할 단원 목록. */
  chapters: StudyPlanChapter[];
}

/**
 * 플랜 재조정 이력 (2-3절).
 *
 * Q3 결정: 별도 테이블 (`study_plan_replans`).
 *
 * 마케팅 자산 활용:
 *   - "플랜 재조정 N회 후 합격" 데이터
 *   - 사용자 학습 패턴 분석
 */
export interface StudyPlanReplan {
  /** 재조정 시각. */
  replanned_at: Date;

  /** 사유 (사용자 입력 또는 자동 분류). */
  reason: string;

  /**
   * 재조정 직전 진행률 (0~100).
   * 재조정 빈도 + 진행 상태 분석에 활용.
   */
  progress_at_replan?: number;

  /**
   * 재조정 트리거 (자동 분석용).
   *   - delay: 진도 30% 이상 밀림 (2-3절)
   *   - exam_date_change: 시험일 변경
   *   - background_change: 배경 변경 (페르소나 재선택)
   *   - manual: 사용자 직접 요청
   */
  trigger?: 'delay' | 'exam_date_change' | 'background_change' | 'manual';
}

/**
 * StudyPlan — 사용자별 학습 플랜 본체.
 *
 * Supabase 테이블 `study_plans` 의 row 1:1 매핑.
 * 한 사용자에게 여러 plan row 가능. is_active = true 인 row 1개가 현재 active plan.
 */
export interface StudyPlan {
  // ───────────────────────────────────────────────
  // 식별 (MVP 필수)
  // ───────────────────────────────────────────────

  /** 서버 발급 UUID. */
  plan_id: string;

  /** 사용자 (UserProfile.user_id). */
  user_id: string;

  /** 활성 여부. 한 사용자당 true 인 plan 1개. */
  is_active: boolean;

  // ───────────────────────────────────────────────
  // 입력값 (MVP 필수, 2-1-1절)
  // ───────────────────────────────────────────────

  /** 어떤 시험 plan 인지. */
  exam: ExamSubject;

  /** 시험일 (D-day). UserProfile.exam_dates 와 동기. */
  d_day: Date;

  /** 하루 학습 시간 (분). UserProfile.daily_minutes 와 동기. */
  daily_minutes: number;

  /** 사용자 배경. UserProfile.background 와 동기. 권장 시간 산정 입력. */
  background: UserBackground;

  // ───────────────────────────────────────────────
  // 산정 결과 (MVP 필수, 2-1-2/2-1-3절)
  // ───────────────────────────────────────────────

  /**
   * 페르소나별 권장 총 학습 시간 (시간 단위).
   * 2-1-2절 표 기반.
   * 예: ADsP × novice = 50~60h → 55h 평균값 사용 또는 사용자 선택.
   */
  required_total_hours: number;

  /** 시간 부족/여유 판정 (2-1-4절). */
  mode: PlanMode;

  /**
   * 가용 시간 vs 권장 시간 비율 (2-1-4절).
   * = (D-day - 3) × daily_minutes / (required_total_hours × 60)
   */
  time_ratio: number;

  // ───────────────────────────────────────────────
  // 주간 분배 (MVP 필수)
  // ───────────────────────────────────────────────

  /**
   * 주간 단위 학습 일정.
   * D-day 까지 N주 분량. 마지막 주는 review_buffer 포함.
   */
  weeks: StudyPlanWeek[];

  /**
   * 시험일 직전 여유 기간 시작일 (2-1-4절).
   * 기본 = d_day - 3일.
   * 이 기간 동안 자동 schedule 비움 — 시중 기출 풀이용.
   */
  free_review_buffer_start: Date;

  // ───────────────────────────────────────────────
  // 재조정 이력 참조 (v1.1+)
  // ───────────────────────────────────────────────

  /**
   * 본 plan 의 재조정 이력 카운트 (캐시).
   * 상세는 `study_plan_replans` 테이블 (plan_id 외래키) 참조.
   * MVP 에서 0 으로 초기화.
   */
  replan_count: number;

  // ───────────────────────────────────────────────
  // 메타
  // ───────────────────────────────────────────────

  created_at: Date;
  updated_at: Date;
}

/**
 * 약점 보강 플랜 (재응시생용, 2-2절).
 *
 * 일반 StudyPlan 의 변형:
 *   - 약점 단원의 학습 시간 = 정상 시간 × 0.6 (기존 학습한 영역)
 *   - 약점 단원 정답률 낮은 순으로 우선 정렬
 *   - 마지막 3일 모의고사 + 자유 학습
 *   - 변형 문제 반복 (8절, variant_group 활용)
 */
export interface ReviewerStudyPlan extends StudyPlan {
  /** 진단 결과의 약점 단원 ID 목록 (정답률 낮은 순). */
  weak_chapter_ids: string[];

  /**
   * 약점 단원별 정답률 (진단 시점). 0~1.
   * 진도 추적 + "약점 해소" 판정 (2-2-2절) 의 baseline.
   */
  initial_chapter_accuracy: { [chapter_id: string]: number };
}

/**
 * 시간 부족/여유 판정 결과 (2-1-4절).
 * Phase 4 Step 3 (학습 플랜 시스템) 의 모드 분류 출력.
 */
export const TIME_RATIO_THRESHOLDS = {
  /** ratio < 0.7 → priority 모드 (핵심 단원만). */
  PRIORITY_MAX: 0.7,
  /** 0.7 ≤ ratio < 1.2 → balanced 모드. */
  BALANCED_MAX: 1.2,
  /** ratio ≥ 1.2 → deep 모드. */
} as const;

/**
 * 시험일 직전 여유 일수 (2-1-4절).
 * 사용자 명시: 기본 3일 (시중 기출 풀이용 review_buffer).
 */
export const REVIEW_BUFFER_DAYS = 3 as const;

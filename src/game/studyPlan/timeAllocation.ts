/**
 * timeAllocation — 페르소나별 권장 학습 시간 산정 + 영역별 시간 분배.
 *
 * 리서치 2-1-2절 (시간 표) + 2-1-3절 (영역 비율) + 2-1-4절 (feasibility 판정).
 *
 * 결정된 사항 (변경 금지):
 *  - 페르소나 × 배경별 권장 시간 (50/30/15 등)
 *  - 영역별 비율 (areaConfig.ts)
 *  - feasibility 임계값 (0.7 / 1.2)
 *  - 마지막 3일 review_buffer
 *
 * 자율 결정 사항:
 *  - experienced 입문자 시간: spec 미명시 → some_basis 와 reviewer 사이로 보간
 *  - reviewer 의 background 영향: spec 상 reviewer 시간 표는 background 무관 → 단일값
 */

import type { PlanMode } from '@/types/learning/studyPlan';
import { TIME_RATIO_THRESHOLDS, REVIEW_BUFFER_DAYS } from '@/types/learning/studyPlan';
import type { Persona, UserBackground } from '@/types/learning';
import type { LearningExamSubject } from '@/types/learning';
import { getAreas, type AreaConfig } from './areaConfig';

type ExamSubject = LearningExamSubject;

/** 권장 시간 범위. */
export interface HoursRange {
  min: number;
  max: number;
  recommended: number;
}

/**
 * 페르소나 × 배경별 권장 학습 시간 (hour 단위).
 *
 * 리서치 2-1-2절 표:
 *   ADsP novice 50~60h, some_basis 30~40h, reviewer 15~20h
 *   SQLD novice 40~50h, some_basis 20~25h, reviewer 10~15h
 *
 * experienced 는 spec 미명시 — some_basis 의 60~70% 로 보간.
 * reviewer 는 background 무관 단일값.
 */
const HOURS_TABLE: {
  [exam in ExamSubject]: {
    beginner: { [bg in UserBackground]: HoursRange };
    reviewer: HoursRange;
  };
} = {
  adsp: {
    beginner: {
      novice: { min: 50, max: 60, recommended: 55 },
      some_basis: { min: 30, max: 40, recommended: 35 },
      experienced: { min: 20, max: 28, recommended: 24 },
    },
    reviewer: { min: 15, max: 20, recommended: 17 },
  },
  sqld: {
    beginner: {
      novice: { min: 40, max: 50, recommended: 45 },
      some_basis: { min: 20, max: 25, recommended: 22 },
      experienced: { min: 14, max: 20, recommended: 17 },
    },
    reviewer: { min: 10, max: 15, recommended: 12 },
  },
  comhwal1: {
    beginner: {
      novice: { min: 55, max: 70, recommended: 60 },
      some_basis: { min: 35, max: 45, recommended: 40 },
      experienced: { min: 22, max: 30, recommended: 26 },
    },
    reviewer: { min: 15, max: 22, recommended: 18 },
  },
  comhwal2: {
    beginner: {
      novice: { min: 35, max: 45, recommended: 40 },
      some_basis: { min: 22, max: 30, recommended: 25 },
      experienced: { min: 14, max: 20, recommended: 16 },
    },
    reviewer: { min: 10, max: 15, recommended: 12 },
  },
};

/**
 * 권장 학습 시간 산정.
 *
 * @param exam - 시험 종류
 * @param background - 학습 배경 (beginner 만 영향)
 * @param persona - beginner | reviewer
 * @returns 시간 범위 (hour 단위)
 */
export function calculateRequiredHours(
  exam: ExamSubject,
  background: UserBackground,
  persona: Persona,
): HoursRange {
  if (persona === 'reviewer') {
    return HOURS_TABLE[exam].reviewer;
  }
  // 'beginner' or 'unknown' fallback → beginner table 사용
  return HOURS_TABLE[exam].beginner[background];
}

/**
 * 가용 시간 계산 (분).
 *
 * = (D-day - REVIEW_BUFFER_DAYS) × daily_minutes
 *
 * D-day 가 buffer 미만이면 0 반환 (시간 부족 극단).
 *
 * @param dDayMs - 시험까지 남은 epoch ms
 * @param daily_minutes - 하루 학습 분
 * @param now - 기준 시각 (테스트 주입용)
 */
export function calculateAvailableMinutes(
  dDay: Date,
  daily_minutes: number,
  now: number = Date.now(),
): number {
  if (daily_minutes <= 0) return 0;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const target = new Date(dDay);
  target.setHours(0, 0, 0, 0);
  const totalDays = Math.floor((target.getTime() - today.getTime()) / (24 * 3600 * 1000));
  const usableDays = Math.max(0, totalDays - REVIEW_BUFFER_DAYS);
  return usableDays * daily_minutes;
}

/**
 * 시간 부족/여유 판정 (2-1-4절).
 *
 *   ratio < 0.7 → priority (시간 부족, 핵심만)
 *   0.7 ≤ ratio < 1.2 → balanced
 *   ratio ≥ 1.2 → deep
 *
 * @param availableMinutes - 가용 학습 시간 (분)
 * @param requiredMinutes - 권장 학습 시간 (분)
 */
export function evaluatePlanFeasibility(
  availableMinutes: number,
  requiredMinutes: number,
): { mode: PlanMode; ratio: number } {
  if (requiredMinutes <= 0) {
    return { mode: 'balanced', ratio: 1 };
  }
  const ratio = availableMinutes / requiredMinutes;
  let mode: PlanMode;
  if (ratio < TIME_RATIO_THRESHOLDS.PRIORITY_MAX) mode = 'priority';
  else if (ratio < TIME_RATIO_THRESHOLDS.BALANCED_MAX) mode = 'balanced';
  else mode = 'deep';
  return { mode, ratio };
}

/**
 * 영역별 시간 분배 결과 1건.
 */
export interface AreaAllocation {
  area: AreaConfig;
  /** 본 영역에 배정된 학습 시간 (분). */
  planned_minutes: number;
}

/**
 * 권장 시간을 영역별 비율로 분배.
 *
 * priority 모드 (ratio < 0.7): 비율 약점 단원 우선이라 변형 없이 그대로 분배 —
 *   사용자가 어차피 시간 모자라므로 알고리즘이 비율 강제 안 함. UI 가 메시지로 안내.
 *
 * balanced/deep 모드: 단순 비율 분배.
 *
 * @param exam - 시험
 * @param totalMinutes - 분배할 총 시간 (보통 권장 시간을 분으로 환산)
 */
export function allocateByArea(
  exam: ExamSubject,
  totalMinutes: number,
): AreaAllocation[] {
  const areas = getAreas(exam);
  return areas.map((a) => ({
    area: a,
    planned_minutes: Math.round(totalMinutes * a.ratio),
  }));
}

/**
 * 재응시생 약점 단원 시간 가중 분배.
 *
 * 리서치 2-2절: "약점 단원의 학습 시간 = 정상 단원 × 0.6"
 * → 강점 단원은 60% 만 시간 배정. 약점 단원은 100%. 절약된 시간을 약점 단원에 추가 분배.
 *
 * @param exam - 시험
 * @param totalMinutes - 권장 총 시간 (분)
 * @param weakChapterIds - 약점 chapter_id 목록 (areaConfig.chapter_id 와 매칭)
 * @returns 영역별 분배 — 약점 영역은 가중치 ↑, 강점 영역은 60%
 */
export function allocateByAreaForReviewer(
  exam: ExamSubject,
  totalMinutes: number,
  weakChapterIds: readonly string[],
): AreaAllocation[] {
  const areas = getAreas(exam);
  const weakSet = new Set(weakChapterIds);

  // Step 1: 강점 영역 60% / 약점 영역 100% 가중치 적용
  const weighted = areas.map((a) => {
    const isWeak = weakSet.has(a.chapter_id);
    return {
      area: a,
      effectiveRatio: a.ratio * (isWeak ? 1.0 : 0.6),
      isWeak,
    };
  });

  // Step 2: 가중치 합으로 정규화 → totalMinutes 가 정확히 분배되도록
  const totalWeight = weighted.reduce((s, w) => s + w.effectiveRatio, 0);
  if (totalWeight <= 0) {
    // 가중치 0 (이론상 불가) — 균등 분배로 fallback
    return areas.map((a) => ({
      area: a,
      planned_minutes: Math.round(totalMinutes / areas.length),
    }));
  }

  return weighted.map((w) => ({
    area: w.area,
    planned_minutes: Math.round(totalMinutes * (w.effectiveRatio / totalWeight)),
  }));
}

/**
 * 시간 (분) → "N시간 M분" 표시.
 * UI 일관성 헬퍼.
 *   75 → "1시간 15분"
 *   60 → "1시간"
 *   30 → "30분"
 *   0  → "0분"
 */
export function formatMinutes(mins: number): string {
  const m = Math.max(0, Math.round(mins));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}분`;
  if (rem === 0) return `${h}시간`;
  return `${h}시간 ${rem}분`;
}

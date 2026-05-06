/**
 * progressTracker — 학습 플랜 진도 추적.
 *
 * 리서치 2-3절 (재조정 로직) + Phase 0 결정 (sessions.totalTimeMs 기반).
 *
 * 입력: StudyPlan + ProgressStore.sessions
 * 출력: 영역별 actual_minutes / completion_rate + 전체 delay_ratio + is_behind
 *
 * 핵심 매핑:
 *   - sessions[i].subject + chapter + topic → areaConfig 의 chapter_id 매핑
 *   - chapter_id 단위로 actual_minutes 집계
 *   - 표시 단위는 chapter_id, 내부 추적은 topic 단위 (Phase 0 결정)
 */

import type { StudyPlan, StudyPlanChapter, StudyPlanWeek } from '@/types/learning/studyPlan';
import type { Subject } from '@/types/question';
import type { SessionRecord } from '@/game/storage';
import { getAreas, type AreaConfig } from './areaConfig';

type ExamSubject = Extract<Subject, 'adsp' | 'sqld'>;

/** 진도 측정 결과. */
export interface ProgressSnapshot {
  /** 현재 주차 번호 (1-based). plan 시작일~D-day 사이 위치. */
  current_week: number;

  /** 기대 진행률 (0~1) — 일정에 따라 지금쯤 어디에 있어야 하는가. */
  expected_progress: number;

  /** 실제 진행률 (0~1) — 누적 actual / 총 planned. */
  actual_progress: number;

  /** 지연 비율 — (expected - actual) / expected. 음수면 앞서감. */
  delay_ratio: number;

  /**
   * 30% 이상 뒤처짐 여부 — 재조정 알림 트리거 조건 (2-3절).
   * = delay_ratio > 0.3
   */
  is_behind: boolean;

  /** 영역별 진도 — 표시용 (chapter_id 단위). */
  chapter_progress: ChapterProgress[];
}

/** 영역별 진도 1건. */
export interface ChapterProgress {
  chapter_id: string;
  display_name: string;
  planned_minutes: number;
  actual_minutes: number;
  /** 0~1. min(actual/planned, 1). planned 0 이면 0. */
  completion_rate: number;
}

/**
 * 진도 계산 메인 함수.
 *
 * @param plan - 활성 학습 플랜
 * @param sessions - 사용자의 모든 세션 기록 (ProgressStore.sessions)
 * @param now - 기준 시각 (테스트 주입용)
 */
export function trackProgress(
  plan: StudyPlan,
  sessions: readonly SessionRecord[],
  now: number = Date.now(),
): ProgressSnapshot {
  const areas = getAreas(plan.exam);

  // 영역별 누적 actual_minutes 집계
  const actualByChapter = aggregateActualMinutes(plan.exam, sessions, areas);

  // 플랜 영역별 planned 합산 (모든 주차의 chapter_id 합)
  const plannedByChapter = aggregatePlannedMinutes(plan.weeks);

  // chapter_progress 빌드
  const chapter_progress: ChapterProgress[] = areas.map((a) => {
    const planned = plannedByChapter.get(a.chapter_id) ?? 0;
    const actual = actualByChapter.get(a.chapter_id) ?? 0;
    return {
      chapter_id: a.chapter_id,
      display_name: a.display_name,
      planned_minutes: planned,
      actual_minutes: actual,
      completion_rate: planned > 0 ? Math.min(actual / planned, 1) : 0,
    };
  });

  const totalPlanned = chapter_progress.reduce((s, c) => s + c.planned_minutes, 0);
  const totalActual = chapter_progress.reduce((s, c) => s + c.actual_minutes, 0);
  const actual_progress = totalPlanned > 0 ? Math.min(totalActual / totalPlanned, 1) : 0;

  // current_week + expected_progress
  const { current_week, expected_progress } = computeWeekState(plan, now);

  // delay_ratio
  const delay_ratio =
    expected_progress > 0 ? (expected_progress - actual_progress) / expected_progress : 0;

  return {
    current_week,
    expected_progress,
    actual_progress,
    delay_ratio,
    is_behind: delay_ratio > 0.3,
    chapter_progress,
  };
}

/**
 * sessions 에서 영역별 누적 시간 집계.
 *
 * 매핑 로직:
 *   1. session.subject + chapter + topic 으로 area 찾기
 *   2. area.topics 가 [{chapter, topic}] 형태 — topic null = chapter 전체
 *   3. matched area 의 chapter_id 에 totalTimeMs/60000 누적
 */
function aggregateActualMinutes(
  exam: ExamSubject,
  sessions: readonly SessionRecord[],
  areas: AreaConfig[],
): Map<string, number> {
  const result = new Map<string, number>();
  for (const a of areas) result.set(a.chapter_id, 0);

  for (const s of sessions) {
    if (s.subject !== exam) continue;
    const area = findAreaForSession(s, areas);
    if (!area) continue;
    const cur = result.get(area.chapter_id) ?? 0;
    result.set(area.chapter_id, cur + s.totalTimeMs / 60000);
  }
  return result;
}

/** session 1건 → matching area. 못 찾으면 undefined. */
function findAreaForSession(
  session: SessionRecord,
  areas: AreaConfig[],
): AreaConfig | undefined {
  for (const a of areas) {
    for (const t of a.topics) {
      if (t.chapter !== session.chapter) continue;
      // topic null = chapter 전체
      if (t.topic === null) return a;
      if (session.topic === t.topic) return a;
    }
  }
  return undefined;
}

/** plan.weeks → chapter_id 별 planned_minutes 합산. */
function aggregatePlannedMinutes(weeks: readonly StudyPlanWeek[]): Map<string, number> {
  const result = new Map<string, number>();
  for (const w of weeks) {
    for (const c of w.chapters) {
      const cur = result.get(c.chapter_id) ?? 0;
      result.set(c.chapter_id, cur + c.planned_minutes);
    }
  }
  return result;
}

/**
 * 현재 주차 + 기대 진행률 계산.
 *
 * 기대 진행률 = (오늘까지 경과 시간 / 전체 plan 기간) — 단순 선형.
 * v1.1 에 영역 우선순위 가중 모델 가능.
 */
function computeWeekState(plan: StudyPlan, now: number): {
  current_week: number;
  expected_progress: number;
} {
  if (plan.weeks.length === 0) {
    return { current_week: 1, expected_progress: 0 };
  }

  const start = plan.weeks[0].start_date.getTime();
  const last = plan.weeks[plan.weeks.length - 1].end_date.getTime();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const t = today.getTime();

  if (t < start) return { current_week: 1, expected_progress: 0 };
  if (t >= last) {
    return {
      current_week: plan.weeks.length,
      expected_progress: 1,
    };
  }

  // 현재 주차 — 경과 일수 / 7 + 1
  const elapsedDays = Math.floor((t - start) / (24 * 3600 * 1000));
  const current_week = Math.min(plan.weeks.length, Math.floor(elapsedDays / 7) + 1);

  // 선형 기대 진행률
  const totalSpan = last - start;
  const elapsed = t - start;
  const expected_progress = totalSpan > 0 ? elapsed / totalSpan : 0;

  return { current_week, expected_progress };
}

/**
 * 본주의 학습 카드 추출 — UI 의 "이번 주 목표" 영역.
 *
 * @returns 현재 주차의 chapters + 진도 정보
 */
export function getCurrentWeekProgress(
  plan: StudyPlan,
  sessions: readonly SessionRecord[],
  now: number = Date.now(),
): {
  week_number: number;
  chapters: ChapterProgress[];
} {
  const { current_week } = computeWeekState(plan, now);
  const week = plan.weeks.find((w) => w.week_number === current_week);
  if (!week) return { week_number: current_week, chapters: [] };

  const areas = getAreas(plan.exam);
  const actualByChapter = aggregateActualMinutes(plan.exam, sessions, areas);

  const chapters: ChapterProgress[] = week.chapters.map((c) => {
    const area = areas.find((a) => a.chapter_id === c.chapter_id);
    const display_name = area?.display_name ?? c.chapter_id;
    const actual = actualByChapter.get(c.chapter_id) ?? 0;
    return {
      chapter_id: c.chapter_id,
      display_name,
      planned_minutes: c.planned_minutes,
      actual_minutes: actual,
      completion_rate:
        c.planned_minutes > 0 ? Math.min(actual / c.planned_minutes, 1) : 0,
    };
  });

  return { week_number: current_week, chapters };
}

/** plan.weeks 의 chapter[].actual_minutes/completion_rate 를 sessions 기반으로 갱신해 새 plan 반환. */
export function applyProgressToPlan(
  plan: StudyPlan,
  sessions: readonly SessionRecord[],
): StudyPlan {
  const areas = getAreas(plan.exam);
  const actualByChapter = aggregateActualMinutes(plan.exam, sessions, areas);

  // 주차별로 chapter_id 비례 분배 — 본 영역의 누적 시간 중 본 주차에 속한 비율
  const plannedByChapter = aggregatePlannedMinutes(plan.weeks);

  const newWeeks: StudyPlanWeek[] = plan.weeks.map((w) => ({
    ...w,
    chapters: w.chapters.map((c) => {
      const totalPlanned = plannedByChapter.get(c.chapter_id) ?? 0;
      const totalActual = actualByChapter.get(c.chapter_id) ?? 0;
      const portion = totalPlanned > 0 ? c.planned_minutes / totalPlanned : 0;
      const actual_minutes = totalActual * portion;
      return {
        ...c,
        actual_minutes,
        completion_rate:
          c.planned_minutes > 0 ? Math.min(actual_minutes / c.planned_minutes, 1) : 0,
      } as StudyPlanChapter;
    }),
  }));

  return { ...plan, weeks: newWeeks, updated_at: new Date() };
}

/**
 * studyPlanStorage — 학습 플랜 영속성 (localStorage mock).
 *
 * Phase 4 Step 3 — Phase 1 영속성.
 *
 * 정책:
 *   - 마이그레이션 0025 (study_plans + study_plan_replans) 미적용 단계.
 *   - localStorage 에 활성 plan 1개만 보관.
 *   - 마이그레이션 적용 후 (Step 5/6): Supabase RPC 로 전환.
 *
 * 직렬화:
 *   - Date 객체는 ISO string 으로 변환.
 *   - 로드 시 Date 복원.
 */

import type { StudyPlan, ReviewerStudyPlan, StudyPlanWeek } from '@/types/learning/studyPlan';

const STORAGE_KEY = 'questdp_study_plan_v1';

/**
 * 직렬화 가능한 plan 형태 (Date → string).
 * 로드 시 reviveDates() 로 복원.
 */
type SerializedPlan = Omit<
  StudyPlan & Partial<ReviewerStudyPlan>,
  'd_day' | 'free_review_buffer_start' | 'created_at' | 'updated_at' | 'weeks'
> & {
  d_day: string;
  free_review_buffer_start: string;
  created_at: string;
  updated_at: string;
  weeks: SerializedWeek[];
  /** schema 버전. */
  _v: 1;
};

interface SerializedWeek {
  week_number: number;
  start_date: string;
  end_date: string;
  chapters: StudyPlanWeek['chapters'];
}

/** 활성 plan 저장. 한 사용자당 1개 — 새 plan 저장 시 이전은 덮어씀. */
export function saveStudyPlan(plan: StudyPlan): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = serialize(plan);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // 차단/quota — silent fail
  }
}

/** 저장된 활성 plan 로드. 없거나 손상 시 null. */
export function loadStudyPlan(): StudyPlan | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SerializedPlan;
    if (parsed?._v !== 1) return null;
    return deserialize(parsed);
  } catch {
    return null;
  }
}

/** plan 삭제 (사용자 reset 또는 onboarding 재진입 시). */
export function clearStudyPlan(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

/** 활성 plan 존재 여부. */
export function hasStudyPlan(): boolean {
  return loadStudyPlan() !== null;
}

// ─── 직렬화 헬퍼 ───────────────────────────────────────────────

function serialize(plan: StudyPlan): SerializedPlan {
  const reviewerExtras = (plan as ReviewerStudyPlan).weak_chapter_ids
    ? {
        weak_chapter_ids: (plan as ReviewerStudyPlan).weak_chapter_ids,
        initial_chapter_accuracy: (plan as ReviewerStudyPlan).initial_chapter_accuracy,
      }
    : {};
  return {
    ...plan,
    ...reviewerExtras,
    d_day: plan.d_day.toISOString(),
    free_review_buffer_start: plan.free_review_buffer_start.toISOString(),
    created_at: plan.created_at.toISOString(),
    updated_at: plan.updated_at.toISOString(),
    weeks: plan.weeks.map((w) => ({
      week_number: w.week_number,
      start_date: w.start_date.toISOString(),
      end_date: w.end_date.toISOString(),
      chapters: w.chapters,
    })),
    _v: 1,
  };
}

function deserialize(p: SerializedPlan): StudyPlan {
  return {
    ...p,
    d_day: new Date(p.d_day),
    free_review_buffer_start: new Date(p.free_review_buffer_start),
    created_at: new Date(p.created_at),
    updated_at: new Date(p.updated_at),
    weeks: p.weeks.map((w) => ({
      week_number: w.week_number,
      start_date: new Date(w.start_date),
      end_date: new Date(w.end_date),
      chapters: w.chapters,
    })),
  } as StudyPlan;
}

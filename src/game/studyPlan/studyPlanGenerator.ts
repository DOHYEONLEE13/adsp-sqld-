/**
 * studyPlanGenerator — 입문자 + 재응시생 학습 플랜 생성.
 *
 * 리서치 2-1-4절 (전체 알고리즘) + 2-2절 (재응시생 변형).
 *
 * 알고리즘 흐름 (입문자):
 *   1. 권장 시간 산정 (calculateRequiredHours)
 *   2. 가용 시간 계산 (calculateAvailableMinutes)
 *   3. feasibility 판정 (evaluatePlanFeasibility)
 *   4. 영역별 시간 분배 (allocateByArea)
 *   5. 주차별 분할 (daily_minutes 기준)
 *   6. 마지막 3일 review_buffer
 *   7. study_style 별 미세 조정 (분산형 vs 집중형)
 *
 * 알고리즘 흐름 (재응시생):
 *   1. reviewer 시간표 사용
 *   2. 약점 chapter_id 우선 정렬
 *   3. 영역별 가중 분배 (allocateByAreaForReviewer)
 *   4. 마지막 3일 = 모의고사 + 자유 학습 (입문자와 동일 buffer)
 *
 * 자율 결정:
 *   - 단원 순서 = 가이드북 순서 (v1.0)
 *   - intensive style: 주말 1.5x 시간 (월~목 배율 0.85, 금~일 1.2 정도)
 *   - 재응시생: 약점 우선 정렬, 그 외 가이드북 순서 유지
 */

import type {
  StudyPlan,
  StudyPlanChapter,
  StudyPlanWeek,
  ReviewerStudyPlan,
} from '@/types/learning/studyPlan';
import { REVIEW_BUFFER_DAYS } from '@/types/learning/studyPlan';
import type { Persona, UserBackground, StudyStyle } from '@/types/learning';
import type { LearningExamSubject } from '@/types/learning';
import {
  calculateRequiredHours,
  calculateAvailableMinutes,
  evaluatePlanFeasibility,
  allocateByArea,
  allocateByAreaForReviewer,
  type AreaAllocation,
} from './timeAllocation';
import type { AreaConfig } from './areaConfig';

type ExamSubject = LearningExamSubject;

/** 입문자 플랜 입력. */
export interface BeginnerPlanInput {
  user_id: string;
  exam: ExamSubject;
  exam_date: Date;
  daily_minutes: number;
  study_style: StudyStyle;
  background: UserBackground;
  /** 테스트 주입용 — 미지정 시 Date.now(). */
  now?: number;
}

/** 재응시생 플랜 입력. */
export interface ReviewerPlanInput {
  user_id: string;
  exam: ExamSubject;
  exam_date: Date;
  daily_minutes: number;
  study_style: StudyStyle;
  /** 진단 또는 메타인지로 선택된 약점 chapter_id 목록. */
  weak_chapters: string[];
  /** 진단 시점 단원별 정답률 (선택). */
  initial_chapter_accuracy?: { [chapter_id: string]: number };
  now?: number;
}

/**
 * 입문자 학습 플랜 생성.
 */
export function generateBeginnerPlan(input: BeginnerPlanInput): StudyPlan {
  const now = input.now ?? Date.now();
  const persona: Persona = 'beginner';

  // 1. 권장 시간
  const hoursRange = calculateRequiredHours(input.exam, input.background, persona);
  const requiredHours = hoursRange.recommended;
  const requiredMinutes = requiredHours * 60;

  // 2. 가용 시간
  const availableMinutes = calculateAvailableMinutes(
    input.exam_date,
    input.daily_minutes,
    now,
  );

  // 3. feasibility
  const { mode, ratio } = evaluatePlanFeasibility(availableMinutes, requiredMinutes);

  // 4. 영역별 분배
  const allocations = allocateByArea(input.exam, requiredMinutes);

  // 5~6. 주차별 분할 + buffer
  const weeks = buildWeeks(
    allocations,
    input.exam_date,
    input.daily_minutes,
    input.study_style,
    now,
  );

  const free_review_buffer_start = computeBufferStart(input.exam_date);

  return {
    plan_id: generatePlanId(),
    user_id: input.user_id,
    is_active: true,
    exam: input.exam,
    d_day: input.exam_date,
    daily_minutes: input.daily_minutes,
    background: input.background,
    required_total_hours: requiredHours,
    mode,
    time_ratio: ratio,
    weeks,
    free_review_buffer_start,
    replan_count: 0,
    created_at: new Date(now),
    updated_at: new Date(now),
  };
}

/**
 * 재응시생 학습 플랜 생성.
 *
 * 약점 chapter_id 우선 정렬. 강점 영역 시간 60%, 약점 100% 가중.
 */
export function generateReviewerPlan(input: ReviewerPlanInput): ReviewerStudyPlan {
  const now = input.now ?? Date.now();

  // reviewer 시간 — background 무관 단일값
  const hoursRange = calculateRequiredHours(input.exam, 'some_basis', 'reviewer');
  const requiredHours = hoursRange.recommended;
  const requiredMinutes = requiredHours * 60;

  const availableMinutes = calculateAvailableMinutes(
    input.exam_date,
    input.daily_minutes,
    now,
  );
  const { mode, ratio } = evaluatePlanFeasibility(availableMinutes, requiredMinutes);

  // 약점 가중 분배
  const allocations = allocateByAreaForReviewer(
    input.exam,
    requiredMinutes,
    input.weak_chapters,
  );

  // 약점 단원 우선 정렬 — 정답률 있으면 낮은 순, 없으면 가중치 큰 순
  const sortedAllocations = sortReviewerAllocations(
    allocations,
    input.weak_chapters,
    input.initial_chapter_accuracy,
  );

  const weeks = buildWeeks(
    sortedAllocations,
    input.exam_date,
    input.daily_minutes,
    input.study_style,
    now,
  );

  const free_review_buffer_start = computeBufferStart(input.exam_date);

  // background 는 reviewer 도 OnboardingResult 에서 옴 — 'some_basis' default
  return {
    plan_id: generatePlanId(),
    user_id: input.user_id,
    is_active: true,
    exam: input.exam,
    d_day: input.exam_date,
    daily_minutes: input.daily_minutes,
    background: 'some_basis',
    required_total_hours: requiredHours,
    mode,
    time_ratio: ratio,
    weeks,
    free_review_buffer_start,
    replan_count: 0,
    created_at: new Date(now),
    updated_at: new Date(now),
    // reviewer 전용
    weak_chapter_ids: [...input.weak_chapters],
    initial_chapter_accuracy: input.initial_chapter_accuracy ?? {},
  };
}

// ─── 내부 헬퍼 ─────────────────────────────────────────────────

/**
 * 영역 분배를 주차별로 쪼개기.
 *
 * 알고리즘:
 *   1. 가용 일수 = (D-day - REVIEW_BUFFER_DAYS) — 음수면 0
 *   2. 주당 가용 시간 = daily_minutes × 7 (분산형 기준)
 *   3. intensive: 평일 0.85 · 주말 1.2 → 주당 합 동일 (단순화 — 진짜 시간 분배는 미세 조정)
 *      v1.0 은 단순 균등으로 진행. intensive flag 는 메타에 보관.
 *   4. 영역 순서대로 시간 채우기 — 영역이 주차 경계를 넘어가면 분할
 */
function buildWeeks(
  allocations: AreaAllocation[],
  examDate: Date,
  daily_minutes: number,
  _study_style: StudyStyle,
  now: number,
): StudyPlanWeek[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const target = new Date(examDate);
  target.setHours(0, 0, 0, 0);

  const totalDays = Math.floor((target.getTime() - today.getTime()) / (24 * 3600 * 1000));
  const usableDays = Math.max(0, totalDays - REVIEW_BUFFER_DAYS);

  if (usableDays <= 0) {
    // 시험일 임박 — 단일 빈 주차로 처리. UI 가 priority 메시지로 대응.
    return [];
  }

  const totalWeeks = Math.max(1, Math.ceil(usableDays / 7));
  const minutesPerWeek = daily_minutes * 7; // study_style 별 미세 조정은 v1.1

  // 영역을 큐로 두고 주차에 차례대로 채움
  type AreaQueue = { area: AreaConfig; remaining: number };
  const queue: AreaQueue[] = allocations
    .filter((a) => a.planned_minutes > 0)
    .map((a) => ({ area: a.area, remaining: a.planned_minutes }));

  const weeks: StudyPlanWeek[] = [];
  for (let w = 0; w < totalWeeks; w++) {
    const start_date = new Date(today);
    start_date.setDate(today.getDate() + w * 7);
    const end_date = new Date(start_date);
    end_date.setDate(start_date.getDate() + 6);
    // 마지막 주는 usable 끝까지로 자름
    if (end_date.getTime() > today.getTime() + (usableDays - 1) * 24 * 3600 * 1000) {
      const limit = new Date(today);
      limit.setDate(today.getDate() + usableDays - 1);
      end_date.setTime(limit.getTime());
    }

    const chapters: StudyPlanChapter[] = [];
    let weekRemaining = minutesPerWeek;

    while (weekRemaining > 0 && queue.length > 0) {
      const head = queue[0];
      const take = Math.min(head.remaining, weekRemaining);
      // 같은 chapter_id 가 같은 주에 두 번 들어가지 않게 합치기
      const existing = chapters.find((c) => c.chapter_id === head.area.chapter_id);
      if (existing) {
        existing.planned_minutes += take;
      } else {
        chapters.push({
          chapter_id: head.area.chapter_id,
          planned_minutes: take,
          actual_minutes: 0,
          completion_rate: 0,
        });
      }
      head.remaining -= take;
      weekRemaining -= take;
      if (head.remaining <= 0) queue.shift();
    }

    weeks.push({ week_number: w + 1, start_date, end_date, chapters });
  }

  // 시간이 남은 영역이 있으면 마지막 주에 몰아넣기 (deep 모드 대응)
  if (queue.length > 0 && weeks.length > 0) {
    const last = weeks[weeks.length - 1];
    for (const q of queue) {
      const existing = last.chapters.find((c) => c.chapter_id === q.area.chapter_id);
      if (existing) {
        existing.planned_minutes += q.remaining;
      } else {
        last.chapters.push({
          chapter_id: q.area.chapter_id,
          planned_minutes: q.remaining,
          actual_minutes: 0,
          completion_rate: 0,
        });
      }
    }
  }

  return weeks;
}

/** 약점 단원 우선 정렬. */
function sortReviewerAllocations(
  allocations: AreaAllocation[],
  weakChapters: readonly string[],
  accuracy?: { [chapter_id: string]: number },
): AreaAllocation[] {
  const weakSet = new Set(weakChapters);
  return [...allocations].sort((a, b) => {
    const aWeak = weakSet.has(a.area.chapter_id);
    const bWeak = weakSet.has(b.area.chapter_id);
    if (aWeak !== bWeak) return aWeak ? -1 : 1;
    if (aWeak && bWeak && accuracy) {
      // 정답률 낮은 순
      const accA = accuracy[a.area.chapter_id] ?? 1;
      const accB = accuracy[b.area.chapter_id] ?? 1;
      return accA - accB;
    }
    return 0; // 가이드북 순서 유지
  });
}

/** D-day 의 buffer 시작일. */
function computeBufferStart(examDate: Date): Date {
  const start = new Date(examDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - REVIEW_BUFFER_DAYS);
  return start;
}

/** plan_id 발급 — Step 5/6 에서 Supabase UUID 로 교체. mock 단계는 timestamp + random. */
function generatePlanId(): string {
  // crypto.randomUUID 가 모든 환경에 있는 건 아님 (older Safari) — fallback
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `plan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

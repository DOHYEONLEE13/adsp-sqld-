/**
 * fromOnboarding — OnboardingResult → StudyPlan 변환 헬퍼.
 *
 * Step 2 의 OnboardingResult 와 Step 3 의 StudyPlan 사이 다리.
 *
 * 다과목 (exams = [adsp, sqld]) 처리:
 *   v1.0 — 첫 시험 (가까운 날짜) 만 plan 생성. v1.1 에 다과목 plan 지원.
 *
 * 페르소나 분기:
 *   - persona='beginner' → generateBeginnerPlan
 *   - persona='reviewer' → generateReviewerPlan
 *   - 'unknown' (이론상 onboarding 불완료) → null 반환
 */

import type { OnboardingResult } from '@/game/onboarding/onboardingStorage';
import type { StudyPlan } from '@/types/learning/studyPlan';
import {
  generateBeginnerPlan,
  generateReviewerPlan,
} from './studyPlanGenerator';
import type { LearningExamSubject } from '@/types/learning';

type ExamSubject = LearningExamSubject;

/**
 * OnboardingResult 에서 plan 생성용 입력 추출.
 *
 * @param result - Step 2 onboarding 완료 결과
 * @param userId - 게스트 = 'guest' 임시 ID, 인증 시 user.id
 * @returns 활성 plan 또는 null (생성 불가 시)
 */
export function buildPlanFromOnboarding(
  result: OnboardingResult,
  userId: string = 'guest',
): StudyPlan | null {
  // 첫 시험 = 가장 가까운 시험일 (multi-exam 인 경우 가까운 것 우선)
  const targetExam = pickTargetExam(result);
  if (!targetExam) return null;

  const examDateStr = result.exam_dates[targetExam];
  if (!examDateStr) return null;

  const examDate = new Date(examDateStr);
  if (Number.isNaN(examDate.getTime())) return null;

  if (result.persona === 'reviewer') {
    return generateReviewerPlan({
      user_id: userId,
      exam: targetExam,
      exam_date: examDate,
      daily_minutes: result.daily_minutes,
      study_style: result.study_style,
      weak_chapters: result.weak_chapters ?? [],
    });
  }

  if (result.persona === 'beginner') {
    return generateBeginnerPlan({
      user_id: userId,
      exam: targetExam,
      exam_date: examDate,
      daily_minutes: result.daily_minutes,
      study_style: result.study_style,
      background: result.background,
    });
  }

  return null; // unknown — 이론상 도달 X
}

/** 다가오는 시험 중 가장 가까운 1개 — null = 시험 없음. */
function pickTargetExam(result: OnboardingResult): ExamSubject | null {
  const candidates: { exam: ExamSubject; ms: number }[] = [];
  for (const ex of result.exams) {
    const ymd = result.exam_dates[ex];
    if (!ymd) continue;
    const t = new Date(ymd).getTime();
    if (Number.isNaN(t)) continue;
    candidates.push({ exam: ex, ms: t });
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.ms - b.ms);
  return candidates[0].exam;
}

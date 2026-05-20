/**
 * StudyPlanRoute — App.tsx 가 #/study-plan 진입 시 마운트하는 wrapper.
 *
 * 책임:
 *   - localStorage 의 활성 plan load
 *   - 없으면 OnboardingResult 에서 즉석 생성 (저장된 onboarding 결과는 있는데 plan 만 사라진 경우)
 *   - 둘 다 없으면 #/onboarding 으로 redirect
 *   - [학습 시작하기] → #/game
 *   - [플랜 다시 생성] → onboarding 재진입 (선택, 사용자 결정)
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { StudyPlanScreen } from './StudyPlanScreen';
import {
  loadStudyPlan,
  saveStudyPlan,
  clearStudyPlan,
} from './studyPlanStorage';
import { buildPlanFromOnboarding } from './fromOnboarding';
import {
  loadOnboardingResult,
  clearOnboardingResult,
  saveOnboardingResult,
} from '@/game/onboarding/onboardingStorage';
import type { StudyPlan } from '@/types/learning/studyPlan';

export default function StudyPlanRoute() {
  const [plan, setPlan] = useState<StudyPlan | null | 'loading'>('loading');

  useEffect(() => {
    // 1차: 저장된 plan
    const stored = loadStudyPlan();
    if (stored) {
      setPlan(stored);
      return;
    }
    // 2차: onboarding result 가 있으면 즉석 생성 (storage 손상/migration 케이스).
    // 진단형 사용자의 exam_dates 누락 케이스도 default D+60 으로 보강 후 시도.
    const onboarding = loadOnboardingResult();
    if (onboarding) {
      // exam_dates 비어있으면 default D+60 채워서 plan 생성 가능하게 함.
      const filledExamDates: typeof onboarding.exam_dates = {
        ...onboarding.exam_dates,
      };
      const defaultDday = new Date(
        Date.now() + 60 * 24 * 3600 * 1000,
      ).toISOString();
      let needsResave = false;
      for (const ex of onboarding.exams) {
        if (!filledExamDates[ex]) {
          filledExamDates[ex] = defaultDday;
          needsResave = true;
        }
      }
      if (needsResave) {
        saveOnboardingResult({
          persona: onboarding.persona,
          background: onboarding.background,
          exams: onboarding.exams,
          exam_dates: filledExamDates,
          daily_minutes: onboarding.daily_minutes,
          study_style: onboarding.study_style,
          weak_chapters: onboarding.weak_chapters,
        });
      }
      const fresh = loadOnboardingResult() ?? onboarding;
      const generated = buildPlanFromOnboarding(fresh);
      if (generated) {
        saveStudyPlan(generated);
        setPlan(generated);
        return;
      }
    }
    // 3차: onboarding 도 없는 신규 사용자 → onboarding 으로 보냄.
    // 단, redirect 직전이라 setPlan(null) 로 빈 화면 유지.
    setPlan(null);
    if (typeof window !== 'undefined') {
      window.location.hash = '/onboarding';
    }
  }, []);

  const stable = useMemo(() => plan, [plan]);

  /**
   * 일일 학습 시간 변경 — onboarding result 의 daily_minutes 갱신 후
   * buildPlanFromOnboarding 으로 새 plan 생성 + 저장 + 화면 갱신.
   *
   * NOTE: useCallback 은 hooks 순서 위반 방지를 위해 early return 위에 위치.
   * 'loading' 또는 null 인 렌더에서도 hook 개수가 일정해야 React 가 hook 추적 가능.
   */
  const handleChangeDailyMinutes = useCallback((minutes: number) => {
    const onboarding = loadOnboardingResult();
    if (!onboarding) return;
    // OnboardingResult 의 exam_dates 는 string (ISO) — saveOnboardingResult 가
    // SaveOnboardingInput 의 string|Date 둘 다 받음.
    saveOnboardingResult({
      persona: onboarding.persona,
      background: onboarding.background,
      exams: onboarding.exams,
      exam_dates: onboarding.exam_dates,
      daily_minutes: minutes,
      study_style: onboarding.study_style,
      weak_chapters: onboarding.weak_chapters,
    });
    const updated = loadOnboardingResult();
    if (!updated) return;
    const newPlan = buildPlanFromOnboarding(updated);
    if (newPlan) {
      saveStudyPlan(newPlan);
      setPlan(newPlan);
    }
  }, []);

  if (stable === 'loading') {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[var(--base)] kr-body text-cream/60 text-sm">
        학습 플랜을 불러오는 중…
      </section>
    );
  }
  if (!stable) {
    // redirect 진행 중 — 빈 화면
    return null;
  }

  // 일반 함수 (hook 아님) — early return 아래에 두어도 무방.
  /**
   * [학습 시작하기] 분기 — 첫 진입 1회만 사용자 페르소나에 따라 다른 화면으로.
   *
   *   - 재응시생 + 약점 명시 (메타인지) → '/weakness' (자기가 입력한 약점 단원이 모인 탭)
   *   - 그 외 (재응시생 fallback / 입문자 / 진단형 v1.1) → '/game' (닉네임 게이트 포함 정식 학습 탭)
   *
   * 첫 진입 후 questdp_first_entry_done flag 마킹 → 이후 [학습 시작하기] 는
   * 항상 학습 탭으로. 사용자가 자유롭게 다른 탭 탐색하더라도 강제 redirect X.
   */
  const handleStart = () => {
    if (typeof window === 'undefined') return;
    const FIRST_ENTRY_KEY = 'questdp_first_entry_done';
    const isFirstEntry = !window.localStorage.getItem(FIRST_ENTRY_KEY);
    if (isFirstEntry) {
      try {
        window.localStorage.setItem(FIRST_ENTRY_KEY, '1');
      } catch {
        /* quota — silent fail */
      }
      const onboarding = loadOnboardingResult();
      const hasManualWeakness =
        onboarding?.persona === 'reviewer' &&
        (onboarding.weak_chapters?.length ?? 0) > 0;
      if (hasManualWeakness) {
        window.location.hash = '/weakness';
        return;
      }
    }
    window.location.hash = '/game';
  };

  const handleRegenerate = () => {
    // 플랜 재생성: onboarding 재진입을 위해 onboarding result + plan 모두 클리어
    // (사용자가 입력값을 변경하고 싶을 때).
    // 새 onboarding 으로 페르소나가 바뀔 수 있으니 first-entry flag 도 리셋 → 다음 [학습 시작하기]
    // 가 다시 페르소나 기반 분기.
    clearStudyPlan();
    clearOnboardingResult();
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('questdp_first_entry_done');
      } catch {
        /* noop */
      }
    }
    if (typeof window !== 'undefined') {
      window.location.hash = '/onboarding';
    }
  };

  return (
    <StudyPlanScreen
      plan={stable}
      onStart={handleStart}
      onRegenerate={handleRegenerate}
      onChangeDailyMinutes={handleChangeDailyMinutes}
    />
  );
}

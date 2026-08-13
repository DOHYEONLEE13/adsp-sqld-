import { useCallback } from 'react';
import FirstEntryOnboarding, {
  clearFirstEntryDraft,
  type FirstEntrySubject,
} from './FirstEntryOnboarding';
import { saveOnboardingResult } from './onboardingStorage';
import { setActiveSubject, setLearningSubject } from '../storage';
import { isCoreExamSubject, type LearningExamSubject } from '@/types/learning';
import { LAST_EXPANSION_VIEW_KEY, LAST_LEARN_HASH_KEY } from '../learningContext';
import { ensureNearestUpcomingExamDate } from '../examDate';

interface OnboardingFlowProps {
  onFinish: () => void;
}

/** 신규 사용자의 첫 진입은 과목, 닉네임, 로그인 세 단계만 받는다. */
export function OnboardingFlow({ onFinish }: OnboardingFlowProps) {
  const handleComplete = useCallback(
    ({ subject }: { subject: FirstEntrySubject; nickname: string }) => {
      const exam: LearningExamSubject = subject === 'comhwal' ? 'comhwal1' : subject;
      const examDates: Partial<Record<LearningExamSubject, string>> = {};

      if (isCoreExamSubject(exam)) {
        const initialExamDate = ensureNearestUpcomingExamDate(exam);
        if (initialExamDate) examDates[exam] = initialExamDate;
      }

      // 상세 학습 계획은 홈에서 따로 받되, 첫 D-day 는 가장 가까운 회차로 준비한다.
      saveOnboardingResult({
        persona: 'beginner',
        background: 'novice',
        exams: [exam],
        exam_dates: examDates,
        daily_minutes: 30,
        study_style: 'distributed',
      });

      if (isCoreExamSubject(exam)) {
        setActiveSubject(exam);
        try {
          window.localStorage.setItem(LAST_LEARN_HASH_KEY, `/game/${exam}`);
        } catch {
          // 저장소를 사용할 수 없어도 과목 선택은 이미 반영됐다.
        }
      } else {
        setLearningSubject('comhwal');
        try {
          window.localStorage.setItem(LAST_LEARN_HASH_KEY, '/game/comhwal');
          window.localStorage.setItem(
            LAST_EXPANSION_VIEW_KEY,
            JSON.stringify({ subjectId: 'comhwal', variantId: 'grade-1' }),
          );
        } catch {
          // 저장소를 사용할 수 없어도 온보딩 완료는 계속 진행한다.
        }
      }

      clearFirstEntryDraft();
      onFinish();
    },
    [onFinish],
  );

  return <FirstEntryOnboarding onComplete={handleComplete} />;
}

export { needsOnboarding, loadOnboardingResult, clearOnboardingResult } from './onboardingStorage';

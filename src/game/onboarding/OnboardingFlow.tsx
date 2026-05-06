/**
 * OnboardingFlow — Onboarding + Diagnostic 조합 wrapper.
 *
 * Phase 4 Step 2 진입점.
 *
 * 흐름:
 *   1. OnboardingScreen 표시
 *   2. 재응시생 + 진단형 선택 시 → DiagnosticScreen 진입
 *   3. 진단 종료 → weak_chapters 가지고 OnboardingScreen 의 done 으로 복귀
 *   4. OnboardingScreen.onComplete → localStorage 저장 + onFinish callback
 *
 * App.tsx 가 본 컴포넌트를 신규 사용자에게 자동 진입.
 */

import { useState, useCallback } from 'react';
import { OnboardingScreen } from './OnboardingScreen';
import { DiagnosticScreen } from '../diagnostic/DiagnosticScreen';
import { saveOnboardingResult, markOnboardingSkipped, loadOnboardingResult } from './onboardingStorage';
import { buildPlanFromOnboarding, saveStudyPlan } from '../studyPlan';
import { setActiveSubject } from '../storage';
import type { Subject } from '@/types/question';

type ExamSubject = Extract<Subject, 'adsp' | 'sqld'>;

interface OnboardingFlowProps {
  /** Onboarding 완전 완료 시 callback (caller 가 다음 화면으로 이동). */
  onFinish: () => void;
  /** 사용자가 onboarding 건너뛰기 (게스트 모드 유지). */
  onSkip?: () => void;
}

/**
 * 내부 phase:
 *   - 'onboarding': OnboardingScreen 표시
 *   - 'diagnostic': DiagnosticScreen 표시 (재응시생-진단형 선택 시)
 */
type Phase =
  | { kind: 'onboarding' }
  | {
      kind: 'diagnostic';
      exams: ExamSubject[];
      onDiagnosticDone: (weak_chapters: string[]) => void;
    };

export function OnboardingFlow({ onFinish, onSkip }: OnboardingFlowProps) {
  const [phase, setPhase] = useState<Phase>({ kind: 'onboarding' });

  const handleDiagnosticEntry = useCallback(
    (exams: ExamSubject[], onDiagnosticDone: (weak_chapters: string[]) => void) => {
      setPhase({ kind: 'diagnostic', exams, onDiagnosticDone });
    },
    [],
  );

  const handleDiagnosticComplete = useCallback(
    (weak_chapters: string[]) => {
      if (phase.kind !== 'diagnostic') return;
      // Onboarding 으로 복귀하면서 진단 결과 전달
      phase.onDiagnosticDone(weak_chapters);
      setPhase({ kind: 'onboarding' });
    },
    [phase],
  );

  const handleOnboardingComplete = useCallback(
    (result: Parameters<React.ComponentProps<typeof OnboardingScreen>['onComplete']>[0]) => {
      // 진단형 사용자는 q4_reviewer_weak_chapters 미경유 → exam_dates 빈 객체.
      // buildPlanFromOnboarding 이 시험일 없으면 null 반환 → study-plan 무한 루프.
      // 해결: 누락된 exam 의 시험일을 default D+60 으로 자동 채움.
      // 사용자는 study-plan 화면에서 [플랜 다시 생성] 으로 정확한 시험일 입력 가능.
      const defaultDdayMs = Date.now() + 60 * 24 * 3600 * 1000;
      const filledExamDates: typeof result.exam_dates = { ...result.exam_dates };
      for (const ex of result.exams) {
        if (!filledExamDates[ex]) {
          filledExamDates[ex] = new Date(defaultDdayMs);
        }
      }

      saveOnboardingResult({ ...result, exam_dates: filledExamDates });
      // Phase 4 Step 3 — onboarding 완료 즉시 학습 플랜 자동 생성 + 저장.
      // load 후 buildPlanFromOnboarding 로 변환 (storage 의 OnboardingResult 형태 사용).
      const stored = loadOnboardingResult();
      if (stored) {
        const plan = buildPlanFromOnboarding(stored);
        if (plan) saveStudyPlan(plan);
      }
      // 사용자 흐름 폴리시 — activeSubject 자동 설정.
      // onboarding 에서 이미 시험 선택했으니 chooser 다시 보지 않게 progressStore 에 마킹.
      // 첫 exam 우선 (multi-exam 사용자도 첫 학습은 첫 exam — 이후 SubjectSwitcher 로 전환 가능).
      const firstExam = result.exams[0];
      if (firstExam) {
        setActiveSubject(firstExam);
      }
      onFinish();
    },
    [onFinish],
  );

  // 건너뛰기 — 스킵 플래그 마킹 후 caller 의 onSkip (App.tsx 가 #/game 으로 이동).
  // 플래그가 없으면 needsOnboarding() === true 라 redirect loop 발생.
  const handleSkip = useCallback(() => {
    markOnboardingSkipped();
    onSkip?.();
  }, [onSkip]);

  // OnboardingScreen 은 항상 mount 상태로 유지 — useReducer state 보존.
  // diagnostic 진행 중엔 display 토글로 숨김 (unmount 시 state reset 되는 버그 방지).
  return (
    <>
      <div
        style={{
          display: phase.kind === 'diagnostic' ? 'none' : 'contents',
        }}
      >
        <OnboardingScreen
          onComplete={handleOnboardingComplete}
          onDiagnosticEntry={handleDiagnosticEntry}
          onSkip={onSkip ? handleSkip : undefined}
        />
      </div>
      {phase.kind === 'diagnostic' && (
        <DiagnosticScreen
          exams={phase.exams}
          onComplete={handleDiagnosticComplete}
          onAbort={() => setPhase({ kind: 'onboarding' })}
        />
      )}
    </>
  );
}

// Re-export for convenience
export { needsOnboarding, loadOnboardingResult, clearOnboardingResult } from './onboardingStorage';

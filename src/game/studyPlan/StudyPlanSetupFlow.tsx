import { useCallback, useState } from 'react';
import { OnboardingScreen } from '../onboarding/OnboardingScreen';
import { DiagnosticScreen } from '../diagnostic/DiagnosticScreen';
import { loadOnboardingResult, saveOnboardingResult } from '../onboarding/onboardingStorage';
import { buildPlanFromOnboarding } from './fromOnboarding';
import { saveStudyPlan } from './studyPlanStorage';
import { setActiveSubject } from '../storage';
import {
  isCoreExamSubject,
  type CoreExamSubject,
  type LearningExamSubject,
} from '@/types/learning';

type ExamSubject = LearningExamSubject;

interface Props {
  onFinish: () => void;
}

type Phase =
  | { kind: 'setup' }
  | {
      kind: 'diagnostic';
      exams: CoreExamSubject[];
      onDone: (weakChapters: string[]) => void;
    };

/** 기존 상세 설문을 첫 진입에서 분리한 맞춤 학습 계획 전용 흐름. */
export default function StudyPlanSetupFlow({ onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>({ kind: 'setup' });

  const handleDiagnosticEntry = useCallback(
    (exams: ExamSubject[], onDone: (weakChapters: string[]) => void) => {
      const coreExams = exams.filter(isCoreExamSubject);
      if (coreExams.length === 0) {
        onDone([]);
        return;
      }
      setPhase({ kind: 'diagnostic', exams: coreExams, onDone });
    },
    [],
  );

  const handleComplete = useCallback(
    (result: Parameters<React.ComponentProps<typeof OnboardingScreen>['onComplete']>[0]) => {
      const fallbackDate = new Date(Date.now() + 60 * 24 * 3600 * 1000);
      const examDates = { ...result.exam_dates };
      for (const exam of result.exams) {
        if (!examDates[exam]) examDates[exam] = fallbackDate;
      }

      saveOnboardingResult({ ...result, exam_dates: examDates });
      const stored = loadOnboardingResult();
      const plan = stored ? buildPlanFromOnboarding(stored) : null;
      if (plan) saveStudyPlan(plan);

      const firstExam = result.exams[0];
      if (isCoreExamSubject(firstExam)) setActiveSubject(firstExam);
      onFinish();
    },
    [onFinish],
  );

  return (
    <>
      <div style={{ display: phase.kind === 'diagnostic' ? 'none' : 'contents' }}>
        <OnboardingScreen
          onComplete={handleComplete}
          onDiagnosticEntry={handleDiagnosticEntry}
        />
      </div>
      {phase.kind === 'diagnostic' ? (
        <DiagnosticScreen
          exams={phase.exams}
          onComplete={(weakChapters) => {
            phase.onDone(weakChapters);
            setPhase({ kind: 'setup' });
          }}
          onAbort={() => setPhase({ kind: 'setup' })}
        />
      ) : null}
    </>
  );
}

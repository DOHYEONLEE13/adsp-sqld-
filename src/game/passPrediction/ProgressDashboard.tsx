/**
 * ProgressDashboard — 진행도 현황 메인 화면 (5번째 네비 슬롯).
 *
 * Phase 4 Step 5 — 사용자 첫 화면, 합격 예측 + 약점 + 시뮬레이션 통합.
 *
 * 흐름:
 *   1. 게스트 (onboarding 미완료) → OnboardingPromptBanner 표시
 *   2. 데이터 충분 → PredictionScoreCard + WeakChapterList + ImprovementSimulator
 *   3. 데이터 부족 → DataInsufficientGuide
 *
 * subject 자동 결정:
 *   - StudyPlan 의 exam 우선
 *   - 없으면 questionStats 더 많은 시험
 */

import { useMemo } from 'react';
import ScreenShell from '../components/ScreenShell';
import { MobileBottomNav, MobileTopBar } from '../components/MobileGameNav';
import PageAmbientBg from '../components/PageAmbientBg';
import OnboardingPromptBanner from '../studyPlan/OnboardingPromptBanner';
import { useProgress } from '../useProgress';
import { loadOnboardingResult } from '../onboarding/onboardingStorage';
import { loadStudyPlan } from '../studyPlan/studyPlanStorage';
import { isCoreExamSubject } from '@/types/learning';
import { daysUntil } from '../examDate';
import {
  getFullChapterAccuracies,
} from './chapterWeights';
import { rankWeakChapters, unattemptedChapters } from './weakChapterRanker';
import WeakChapterRoadmap from './WeakChapterRoadmap';
// 사용자 흐름 폴리시: 예상 점수 시스템 제거.
// 알고리즘 자산 (predictPassScore / PredictionScoreCard / DataInsufficientGuide /
// ImprovementSimulator) 은 보존 — 합격자 데이터 30명+ 누적 후 v1.1 에서 재활성화.

interface Props {
  onExit: () => void;
}

export default function ProgressDashboard({ onExit }: Props) {
  const progress = useProgress();
  const onboarding = useMemo(() => loadOnboardingResult(), []);
  const plan = useMemo(() => loadStudyPlan(), []);

  // subject 결정 — plan 우선, fallback questionStats
  const subject = useMemo<'adsp' | 'sqld' | null>(() => {
    if (plan?.exam && isCoreExamSubject(plan.exam)) return plan.exam;
    const onboardingExam = onboarding?.exams.find(isCoreExamSubject);
    if (onboardingExam) return onboardingExam;
    return null;
  }, [plan, onboarding]);

  // d-day 계산
  const dDay = useMemo<number | null>(() => {
    if (!plan) return null;
    const ymd = plan.d_day instanceof Date ? plan.d_day : new Date(plan.d_day);
    const y = ymd.getFullYear();
    const m = String(ymd.getMonth() + 1).padStart(2, '0');
    const d = String(ymd.getDate()).padStart(2, '0');
    return daysUntil(`${y}-${m}-${d}`);
  }, [plan]);

  // chapter 정답률 — 약점 단원 산출 입력
  const chapterAccuracies = useMemo(() => {
    if (!subject) return [];
    return getFullChapterAccuracies(progress.questionStats, subject);
  }, [subject, progress.questionStats]);

  // 약점 ranking (TOP 5) — 로드맵에 표시
  const weakRankings = useMemo(
    () => rankWeakChapters(chapterAccuracies, 5),
    [chapterAccuracies],
  );

  // 미응시 단원 수 (UI 안내)
  const unattempted = useMemo(
    () => unattemptedChapters(chapterAccuracies).length,
    [chapterAccuracies],
  );

  // ─── 렌더 ───

  // 사용자 명시 약점 (onboarding.weak_chapters) — WeakChapterRoadmap 에 통합 source 로 전달.
  const manualWeak = onboarding?.weak_chapters ?? [];

  return (
    <ScreenShell
      eyebrow="My Weakness"
      title="나의 약점"
      subtitle="학습 결과로 찾은 약점 단원을 한곳에서 확인합니다."
      onExit={onExit}
      exitLabel="돌아가기"
      ambient={<PageAmbientBg />}
    >
      <MobileTopBar subject={subject ?? undefined} />
      <div className="md:hidden h-14" aria-hidden />

      {/* 게스트 사용자 → onboarding 유도 */}
      {!onboarding ? (
        <div className="space-y-4">
          <OnboardingPromptBanner />
        </div>
      ) : !subject ? (
        <div className="liquid-glass rounded-[18px] px-5 py-4">
          <p className="kr-body text-[13px] text-cream/65 leading-[1.6]">
            시험 선택 정보가 없어요. onboarding 을 다시 진행해주세요.
          </p>
        </div>
      ) : (
        <>
          {/* 약점 통합 로드맵 — 메인 카드 (사용자 명시 + 자동 식별) */}
          <div className="mb-4">
            <WeakChapterRoadmap
              exam={subject}
              manualWeakChapterIds={manualWeak}
              autoRankings={weakRankings}
              unattemptedCount={unattempted}
              dDay={dDay}
            />
          </div>

        </>
      )}

      <div className="md:hidden h-20" aria-hidden />
      <MobileBottomNav active="weakness" />
    </ScreenShell>
  );
}

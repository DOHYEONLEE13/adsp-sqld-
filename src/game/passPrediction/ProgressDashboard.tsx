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
import { BarChart3, ChevronRight } from 'lucide-react';
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
import {
  getLastLearnContext,
  LAST_EXPANSION_VIEW_KEY,
  LAST_LEARN_HASH_KEY,
  type LastLearnContext,
} from '../learningContext';
import {
  EXPANSION_SUBJECTS,
  type ExpansionVariantId,
} from '../expansionSubjects';
import { getComhwalTopicCards } from '@/data/comhwal/concepts';
import type { ProgressStore } from '../storage';
// 사용자 흐름 폴리시: 예상 점수 시스템 제거.
// 알고리즘 자산 (predictPassScore / PredictionScoreCard / DataInsufficientGuide /
// ImprovementSimulator) 은 보존 — 합격자 데이터 30명+ 누적 후 v1.1 에서 재활성화.

interface Props {
  onExit: () => void;
}

type ExpansionLearnContext = Extract<LastLearnContext, { kind: 'expansion' }>;

const LAST_EXPANSION_RESUME_KEY = 'questdp:last-expansion-resume:v1';

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
  const lastLearnContext = useMemo(
    () => getLastLearnContext(progress.activeSubject),
    [progress.activeSubject],
  );
  const expansionContext =
    lastLearnContext?.kind === 'expansion' ? lastLearnContext : null;
  const weaknessSubject = expansionContext ? null : subject;
  const comhwalVariantId = useMemo(
    () => resolveComhwalVariantId(expansionContext),
    [expansionContext],
  );
  const comhwalWeakness = useMemo(
    () =>
      expansionContext?.subjectId === 'comhwal'
        ? getComhwalWeaknessSummary(progress.questionStats, comhwalVariantId)
        : null,
    [comhwalVariantId, expansionContext?.subjectId, progress.questionStats],
  );

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
    if (!weaknessSubject) return [];
    return getFullChapterAccuracies(progress.questionStats, weaknessSubject);
  }, [weaknessSubject, progress.questionStats]);

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
      <MobileTopBar
        subject={expansionContext ? undefined : subject ?? undefined}
        customSubject={
          expansionContext
            ? {
                id: expansionContext.subjectId,
                label: expansionContext.label,
                accent: expansionContext.accent,
              }
            : undefined
        }
      />
      <div className="md:hidden h-14" aria-hidden />

      {/* 게스트 사용자 → onboarding 유도 */}
      {!onboarding ? (
        <div className="space-y-4">
          <OnboardingPromptBanner />
        </div>
      ) : expansionContext?.subjectId === 'comhwal' && comhwalWeakness ? (
        <ComhwalWeaknessRoadmap
          context={expansionContext}
          variantId={comhwalVariantId}
          entries={comhwalWeakness.entries}
          unattemptedCount={comhwalWeakness.unattemptedCount}
        />
      ) : !weaknessSubject ? (
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
              exam={weaknessSubject}
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

interface ComhwalWeakEntry {
  rank: number;
  planetKey: string;
  topicId: string;
  topicTitle: string;
  planetTitle: string;
  sectionTitle: string;
  accuracy: number;
  attemptCount: number;
  correctCount: number;
  questionCount: number;
  wrongStreak: number;
  lastSeenAt: number;
  score: number;
}

interface ComhwalWeaknessSummary {
  entries: ComhwalWeakEntry[];
  unattemptedCount: number;
}

function ComhwalWeaknessRoadmap({
  context,
  variantId,
  entries,
  unattemptedCount,
}: {
  context: ExpansionLearnContext;
  variantId: ExpansionVariantId;
  entries: ComhwalWeakEntry[];
  unattemptedCount: number;
}) {
  if (entries.length === 0) {
    return (
      <div className="liquid-glass rounded-[18px] px-5 py-5 text-center">
        <div
          className="kr-num mb-2 text-[10.5px] uppercase tracking-widest"
          style={{ color: context.accent }}
        >
          {context.label} · 나의 약점
        </div>
        <p className="kr-body text-[13px] leading-[1.6] text-cream/65">
          {unattemptedCount > 0
            ? '아직 컴활 약점을 판단할 만큼 풀이 기록이 충분하지 않아요. 몇 개 토픽을 더 풀면 약한 토픽이 여기 모입니다.'
            : '현재 뚜렷한 컴활 약점 토픽이 없어요. 지금처럼 고르게 유지하면 됩니다.'}
        </p>
      </div>
    );
  }

  return (
    <div className="liquid-glass rounded-[18px] px-4 py-4 sm:px-5 sm:py-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div
            className="kr-num mb-0.5 text-[10.5px] uppercase tracking-widest"
            style={{ color: 'rgba(239,244,255,0.58)' }}
          >
            나의 약점
          </div>
          <div className="kr-heading text-[15px] font-black text-cream">
            컴활 약점 토픽
          </div>
        </div>
        <span
          className="kr-num rounded-full px-2 py-1 text-[10px] uppercase tracking-widest"
          style={{
            color: context.accent,
            background: `${context.accent}14`,
            border: `1px solid ${context.accent}44`,
          }}
        >
          {entries.length}개
        </span>
      </div>

      <ol className="relative m-0 list-none p-0 pl-1">
        {entries.map((entry, index) => {
          const isLast = index === entries.length - 1;
          return (
            <li key={`${entry.planetKey}:${entry.topicId}`} className="relative pb-4 last:pb-0">
              <button
                type="button"
                onClick={() => openComhwalWeakEntry(entry, variantId)}
                aria-label={`${entry.topicTitle} 컴활 약점 학습 시작`}
                className="flex w-full items-center gap-3 rounded-xl p-1 text-left transition hover:bg-white/5 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-neon"
              >
                <span
                  className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background:
                      entry.accuracy < 0.5
                        ? 'var(--game-node-bg-strong)'
                        : 'var(--game-node-bg)',
                    border: '1px solid var(--game-node-border)',
                    boxShadow:
                      entry.accuracy < 0.5
                        ? 'var(--game-node-shadow-strong)'
                        : 'var(--game-node-shadow)',
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-1 rounded-full"
                    style={{
                      border: '1px solid rgba(255,255,255,0.22)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -2px 6px rgba(0,0,0,0.18)',
                    }}
                  />
                  <span className="kr-num relative text-[14px] font-bold leading-none text-[var(--game-node-text)]">
                    {entry.rank}
                  </span>
                </span>

                <span className="block min-w-0 flex-1">
                  <span className="mb-1 flex items-center justify-between gap-2">
                    <span className="kr-heading truncate text-[14px] text-cream/95">
                      {entry.topicTitle}
                    </span>
                    <ChevronRight
                      size={14}
                      strokeWidth={2.4}
                      style={{ color: 'rgba(239,244,255,0.4)', flexShrink: 0 }}
                    />
                  </span>
                  <span className="kr-body block truncate text-[11.5px] text-cream/52">
                    {entry.planetTitle} · {entry.sectionTitle}
                  </span>
                  <span className="kr-num mt-1 flex items-center gap-1.5 text-[11px] tabular-nums">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5"
                      style={{
                        background: 'var(--game-pill-bg)',
                        color: 'rgba(239,244,255,0.64)',
                        border: '1px solid var(--game-pill-border)',
                      }}
                    >
                      <BarChart3 size={10} strokeWidth={2.4} aria-hidden />
                      {Math.round(entry.accuracy * 100)}%
                    </span>
                    <span
                      className="rounded-full px-1.5 py-0.5"
                      style={{
                        color: 'rgba(239,244,255,0.68)',
                        background: 'var(--game-pill-bg)',
                        border: '1px solid rgba(111,255,232,0.16)',
                      }}
                    >
                      {entry.correctCount}/{entry.attemptCount}회
                    </span>
                  </span>
                </span>
              </button>

              {!isLast ? (
                <span
                  aria-hidden
                  className="absolute"
                  style={{
                    left: 24,
                    top: 50,
                    bottom: 8,
                    width: 2,
                    background:
                      'linear-gradient(180deg, rgba(239,244,255,0.18), rgba(239,244,255,0.06))',
                  }}
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      {unattemptedCount > 0 ? (
        <div
          className="kr-num mt-3 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10.5px] uppercase tracking-widest"
          style={{
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(239,244,255,0.55)',
            border: '1px solid rgba(239,244,255,0.08)',
          }}
        >
          <span>미풀이</span>
          <span>{unattemptedCount}</span>
        </div>
      ) : null}
    </div>
  );
}

function resolveComhwalVariantId(
  context: ExpansionLearnContext | null,
): ExpansionVariantId {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(LAST_EXPANSION_VIEW_KEY);
      const saved = raw
        ? (JSON.parse(raw) as { subjectId?: string; variantId?: string })
        : null;
      if (saved?.subjectId === 'comhwal' && saved.variantId) {
        return saved.variantId;
      }
    } catch {
      // Use label fallback below.
    }
  }
  return context?.label.includes('2') ? 'grade-2' : 'grade-1';
}

function getComhwalWeaknessSummary(
  questionStats: ProgressStore['questionStats'],
  variantId: ExpansionVariantId,
): ComhwalWeaknessSummary {
  const subject = EXPANSION_SUBJECTS.comhwal;
  const planets = subject.planets.filter((planet) =>
    planet.variantIds.includes(variantId),
  );
  const visiblePlanets = planets.length > 0 ? planets : subject.planets;
  const now = Date.now();
  const entries: ComhwalWeakEntry[] = [];
  let unattemptedCount = 0;

  for (const planet of visiblePlanets) {
    for (const section of planet.sections) {
      for (const topic of section.topics) {
        const questionCards = getComhwalTopicCards(planet.key, topic.id).filter(
          (card) => card.question,
        );
        if (questionCards.length === 0) continue;

        let attemptCount = 0;
        let correctCount = 0;
        let wrongStreak = 0;
        let lastSeenAt = 0;

        for (const card of questionCards) {
          const questionId = card.question?.id;
          if (!questionId) continue;
          const stat = questionStats[questionId];
          if (!stat || stat.attempts <= 0) continue;
          attemptCount += stat.attempts;
          correctCount += stat.correct;
          wrongStreak += stat.wrongStreak;
          lastSeenAt = Math.max(lastSeenAt, stat.lastSeenAt);
        }

        if (attemptCount === 0) {
          unattemptedCount += 1;
          continue;
        }

        const accuracy = correctCount / attemptCount;
        const recency = lastSeenAt
          ? Math.min(1, Math.max(0, (now - lastSeenAt) / (7 * 24 * 60 * 60 * 1000)))
          : 1;
        const score =
          (1 - accuracy) * 0.7 +
          Math.min(1, wrongStreak / 3) * 0.2 +
          recency * 0.1;

        if (accuracy >= 0.85 && wrongStreak === 0) continue;

        entries.push({
          rank: 0,
          planetKey: planet.key,
          topicId: topic.id,
          topicTitle: topic.title,
          planetTitle: planet.title,
          sectionTitle: section.title,
          accuracy,
          attemptCount,
          correctCount,
          questionCount: questionCards.length,
          wrongStreak,
          lastSeenAt,
          score,
        });
      }
    }
  }

  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
    return b.lastSeenAt - a.lastSeenAt;
  });

  return {
    entries: entries.slice(0, 5).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    })),
    unattemptedCount,
  };
}

function openComhwalWeakEntry(
  entry: ComhwalWeakEntry,
  variantId: ExpansionVariantId,
): void {
  if (typeof window === 'undefined') return;
  const saved = {
    subjectId: 'comhwal',
    variantId,
    planetKey: entry.planetKey,
    topicId: entry.topicId,
  };
  try {
    window.localStorage.setItem(LAST_LEARN_HASH_KEY, '/game/comhwal');
    window.localStorage.setItem(LAST_EXPANSION_VIEW_KEY, JSON.stringify(saved));
    window.localStorage.setItem(
      LAST_EXPANSION_RESUME_KEY,
      JSON.stringify(saved),
    );
  } catch {
    // Resume is a convenience feature; navigation still works without storage.
  }
  window.location.hash = '/game/comhwal';
}

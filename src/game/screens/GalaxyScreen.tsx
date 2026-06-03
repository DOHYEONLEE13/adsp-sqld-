/**
 * Galaxy 화면 — 과목 선택 (미니멀 톤, Phase 1).
 *
 * 팔레트: #FD802E on #233D4C.
 * Editorial 정렬, 보더 카드, glass·gradient·glow·cursive 모두 제거.
 *
 * 흐름은 동일: 카드 클릭 → SubjectInfoPanel → 워프 → onSelectSubject(subject).
 *
 * 다른 화면(Planet, Zone, Lesson, Stats…)은 기존 톤 유지 — phase 2+ 에서 확장.
 */

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Info,
  ListTodo,
  RotateCcw,
  Star,
  X,
} from 'lucide-react';
import { getSupabase, onAuthStateChange } from '@/lib/supabase';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import type { Subject } from '@/types/question';
import { playableCount } from '../session';
import ProgressBadge from '../components/ProgressBadge';
import { aggregateSubject } from '../aggregate';
import { useProgress } from '../useProgress';
import { useBookmarks } from '../useBookmarks';
import {
  getEffectiveStudyMode,
  setStudyMode,
  type StudyMode,
} from '../studyMode';
import { computePlayerStats, type PlayerStats } from '../rpg';
import Ques, { preloadMascotPoses } from '@/components/mascot/Ques';
import SpeechBubble from '@/game/lesson/SpeechBubble';
import TopBar from '@/game/lesson/TopBar';
import OptionsPanel from '@/game/lesson/OptionsPanel';
import type { QuesPose } from '@/components/mascot/types';
import type { ProgressStore } from '../storage';
import VideoBg from '@/components/ui/VideoBg';
import { VIDEO_POSTERS, VIDEO_URLS } from '@/data/site';
import { useMyProfile } from '@/data/profile';
import NicknameOnboarding from './NicknameOnboarding';
import StudyPlanBanner from '../studyPlan/StudyPlanBanner';
import OnboardingPromptBanner from '../studyPlan/OnboardingPromptBanner';
import { loadStudyPlan } from '../studyPlan/studyPlanStorage';
import { recommendNextStep } from '../studyPlan/nextStep';
import PageAmbientBg from '../components/PageAmbientBg';
import { MobileBottomNav, MobileTopBar } from '../components/MobileGameNav';
import {
  EXPANSION_SUBJECTS,
  type ExpansionPlanet,
  type ExpansionSubjectConfig,
  type ExpansionSubjectId,
  type ExpansionVariant,
  type ExpansionVariantId,
} from '../expansionSubjects';
import {
  getComhwalTopicCards,
  hasComhwalTopicCards,
  type ComhwalConceptCard,
} from '@/data/comhwal/concepts';

interface Props {
  initialExpansionSubject?: ExpansionSubjectId;
  onSelectSubject: (subject: Subject) => void;
  onStartDailyMission: (subject: Subject) => void;
  onStartMockExam: (subject: Subject) => void;
  onOpenReview: () => void;
}

/** 워프 완료 후 실제 Subject 전환까지 대기할 시간 (ms). */
const WARP_DURATION_MS = 900;

/** 미니멀 팔레트 (이 화면 한정).
 *  v3: 과목별 액센트 — ADSP 시안/블루, SQLD 퍼플 (CLAUDE.md 색 토큰과 일치).
 *  default ACCENT (주황) 는 일일 미션 등 과목 무관 영역에만 사용. */
const ACCENT = '#FD802E';
const BG = '#010828';
const FG = '#FFFFFF';
const FG_SOFT = 'rgba(255,255,255,0.72)';
const FG_DIM = 'rgba(255,255,255,0.5)';
const LINE = 'rgba(255,255,255,0.22)';
const LAST_LEARN_HASH_KEY = 'questdp:last-learn-hash:v1';
const LAST_EXPANSION_VIEW_KEY = 'questdp:last-expansion-view:v1';
const COMHWAL_MASCOT_CHARACTER = 'comhwal' as const;
const COMHWAL_MASCOT_POSES: QuesPose[] = [
  'idle',
  'happy',
  'sad',
  'celebrate',
  'sleep',
  'wave',
  'think',
  'lightbulb',
];

/** 과목별 액센트. */
const SUBJECT_ACCENT: Record<Subject, string> = {
  adsp: '#67e8f9', // cyan-300
  sqld: '#c084fc', // purple-400
};

/** 과목별 액센트 + 알파 (그림자·hover 등). */
const SUBJECT_ACCENT_RGB: Record<Subject, string> = {
  adsp: '103, 232, 249',
  sqld: '192, 132, 252',
};

/** 과목별 소개 문구. */
const SUBJECT_INTRO: Record<Subject, { tagline: string; description: string }> = {
  adsp: {
    tagline: '데이터 분석 준전문가',
    description:
      '데이터의 가치를 이해하고, 분석 프로세스를 기획하며, R 과 통계 · 데이터 마이닝으로 인사이트를 도출하는 자격증이에요. 데이터 직무 입문자에게 가장 보편적인 출발점.',
  },
  sqld: {
    tagline: 'SQL 개발자',
    description:
      '관계형 데이터베이스 설계부터 복잡한 쿼리 최적화까지 — 실무 SQL 능력을 검증하는 자격증이에요. 백엔드 · 데이터 분석 · BI 어느 트랙이든 반드시 마주치는 기본기.',
  },
};

type View =
  | { kind: 'overview' }
  | { kind: 'detail'; subject: Subject }
  | { kind: 'launching'; subject: Subject }
  | {
      kind: 'expansionLaunching';
      subjectId: ExpansionSubjectId;
      variantId: ExpansionVariantId;
    }
  | {
      kind: 'expansionPlanets';
      subjectId: ExpansionSubjectId;
      variantId: ExpansionVariantId;
    }
  | {
      kind: 'expansionOutline';
      subjectId: ExpansionSubjectId;
      variantId: ExpansionVariantId;
      planetKey: string;
    }
  | {
      kind: 'expansionConcept';
      subjectId: ExpansionSubjectId;
      variantId: ExpansionVariantId;
      planetKey: string;
      topicId: string;
    };

type ExpansionView = Extract<
  View,
  {
    kind:
      | 'expansionLaunching'
      | 'expansionPlanets'
      | 'expansionOutline'
      | 'expansionConcept';
  }
>;

interface SavedExpansionView {
  subjectId: ExpansionSubjectId;
  variantId: ExpansionVariantId;
  planetKey?: string;
  topicId?: string;
}

function preferredExpansionVariant(subjectId: ExpansionSubjectId) {
  const subject = EXPANSION_SUBJECTS[subjectId];
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem('questdp_onboarding_v4');
      const parsed = raw
        ? (JSON.parse(raw) as { version?: number; exams?: string[] })
        : null;
      const firstExam = parsed?.version === 1 ? parsed.exams?.[0] : null;
      if (
        firstExam === 'comhwal2' &&
        subject.variants.some((variant) => variant.id === 'grade-2')
      ) {
        return 'grade-2';
      }
    } catch {
      // Ignore malformed onboarding data and fall back to the first variant.
    }
  }
  return subject.variants[0].id;
}

function isValidSavedExpansionView(
  saved: SavedExpansionView | null,
): saved is SavedExpansionView {
  if (!saved) return false;
  const subject = EXPANSION_SUBJECTS[saved.subjectId];
  if (!subject) return false;
  const hasVariant = subject.variants.some(
    (variant) => variant.id === saved.variantId,
  );
  if (!hasVariant) return false;
  if (!saved.planetKey) return true;
  const validPlanet = subject.planets.some(
    (planet) =>
      planet.key === saved.planetKey &&
      planet.variantIds.includes(saved.variantId),
  );
  if (!validPlanet) return false;
  if (!saved.topicId) return true;
  return hasComhwalTopicCards(saved.planetKey, saved.topicId);
}

function readSavedExpansionView(subjectId: ExpansionSubjectId) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LAST_EXPANSION_VIEW_KEY);
    const saved = raw ? (JSON.parse(raw) as SavedExpansionView) : null;
    if (saved?.subjectId !== subjectId) return null;
    return isValidSavedExpansionView(saved) ? saved : null;
  } catch {
    return null;
  }
}

function initialExpansionView(subjectId: ExpansionSubjectId): View {
  const saved = readSavedExpansionView(subjectId);
  const variantId = saved?.variantId ?? preferredExpansionVariant(subjectId);
  if (saved?.planetKey && saved.topicId) {
    return {
      kind: 'expansionConcept',
      subjectId,
      variantId,
      planetKey: saved.planetKey,
      topicId: saved.topicId,
    };
  }
  if (saved?.planetKey) {
    return {
      kind: 'expansionOutline',
      subjectId,
      variantId,
      planetKey: saved.planetKey,
    };
  }
  return {
    kind: 'expansionPlanets',
    subjectId,
    variantId,
  };
}

function replaceHashSilently(nextHash: string) {
  if (typeof window === 'undefined') return;
  const normalized = nextHash.startsWith('/') ? nextHash : `/${nextHash}`;
  const current = window.location.hash.replace(/^#/, '') || '/';
  if (current === normalized) return;
  window.history.replaceState({}, '', `#${normalized}`);
}

function rememberExpansionView(view: ExpansionView) {
  if (typeof window === 'undefined') return;
  const route = `/game/${view.subjectId}`;
  const saved: SavedExpansionView = {
    subjectId: view.subjectId,
    variantId: view.variantId,
    ...(view.kind === 'expansionOutline' || view.kind === 'expansionConcept'
      ? { planetKey: view.planetKey }
      : {}),
    ...(view.kind === 'expansionConcept' ? { topicId: view.topicId } : {}),
  };
  try {
    window.localStorage.setItem(LAST_LEARN_HASH_KEY, route);
    window.localStorage.setItem(
      LAST_EXPANSION_VIEW_KEY,
      JSON.stringify(saved),
    );
  } catch {
    // Embedded/mobile webviews may occasionally block localStorage.
  }
  replaceHashSilently(route);
}

export default function GalaxyScreen({
  initialExpansionSubject,
  onSelectSubject,
  onStartDailyMission,
  onStartMockExam,
  onOpenReview,
}: Props) {
  const progress = useProgress();
  const bookmarks = useBookmarks();
  const profile = useMyProfile();
  const bookmarkCount = bookmarks.ids.size;
  const playerStats = computePlayerStats(progress);
  const defaultMissionSubject: Subject =
    playableCount('adsp') >= playableCount('sqld') ? 'adsp' : 'sqld';

  const adspTotal = playableCount('adsp');
  const sqldTotal = playableCount('sqld');

  const [view, setView] = useState<View>(() => {
    if (initialExpansionSubject && EXPANSION_SUBJECTS[initialExpansionSubject]) {
      return initialExpansionView(initialExpansionSubject);
    }
    return { kind: 'overview' };
  });

  // 닉네임 onboarding 게이트 — 첫 방문 + 닉네임 미설정일 때만 노출.
  //
  // 단순화 (2026-05-04): tag 는 이제 server-issued 만 — 게스트는 항상 ''.
  // "닉네임 미설정" = displayName.trim() === '' 만 체크하면 됨.
  //
  // sync-loading (pendingServerSync) 동안엔 surge 방지 위해 false 로 친다.
  // 완료 직후 profile subscription 반영 전까지 한 세션 안에서 재노출을 막는다.
  const [nicknameGateDone, setNicknameGateDone] = useState(false);
  const hasNickname = profile.displayName.trim() !== '';
  const needsNicknameOnboarding =
    !nicknameGateDone &&
    !profile.pendingServerSync &&
    !hasNickname &&
    playerStats.sessionsCount === 0;

  // launching 상태면 WARP_DURATION_MS 후에 실제 전환.
  useEffect(() => {
    if (view.kind !== 'launching') return;
    const id = window.setTimeout(() => {
      onSelectSubject(view.subject);
    }, WARP_DURATION_MS);
    return () => window.clearTimeout(id);
  }, [view, onSelectSubject]);

  useEffect(() => {
    if (view.kind !== 'expansionLaunching') return;
    const id = window.setTimeout(() => {
      setView({
        kind: 'expansionPlanets',
        subjectId: view.subjectId,
        variantId: view.variantId,
      });
    }, WARP_DURATION_MS);
    return () => window.clearTimeout(id);
  }, [view]);

  useEffect(() => {
    if (
      view.kind === 'expansionLaunching' ||
      view.kind === 'expansionPlanets' ||
      view.kind === 'expansionOutline' ||
      view.kind === 'expansionConcept'
    ) {
      rememberExpansionView(view);
      return;
    }
    if (view.kind === 'overview') {
      replaceHashSilently('/game');
    }
  }, [view]);

  // 닉네임 미설정 + subject 클릭 시 NicknameOnboarding 노출 후 자동 진입.
  useEffect(() => {
    if (
      view.kind !== 'expansionLaunching' &&
      view.kind !== 'expansionPlanets' &&
      view.kind !== 'expansionOutline' &&
      view.kind !== 'expansionConcept'
    ) {
      return;
    }
    if (view.subjectId !== 'comhwal') return;
    preloadMascotPoses(COMHWAL_MASCOT_CHARACTER, COMHWAL_MASCOT_POSES);
  }, [view]);

  const [pendingSubject, setPendingSubject] = useState<Subject | null>(null);

  const handlePlanetClick = (subject: Subject) => {
    if (view.kind === 'launching') return;
    const total = subject === 'adsp' ? adspTotal : sqldTotal;
    if (total === 0) return;
    if (!hasNickname && !profile.pendingServerSync) {
      // 닉네임 입력 후 자동으로 해당 subject 의 detail 뷰로 진입
      setPendingSubject(subject);
      return;
    }
    setView({ kind: 'detail', subject });
  };

  const handleBack = () => setView({ kind: 'overview' });
  const handlePlay = (subject: Subject) =>
    setView({ kind: 'launching', subject });

  const selectedSubject =
    view.kind === 'detail' || view.kind === 'launching' ? view.subject : null;
  const launchingExpansion =
    view.kind === 'expansionLaunching'
      ? {
          subject: EXPANSION_SUBJECTS[view.subjectId],
          variant:
            EXPANSION_SUBJECTS[view.subjectId].variants.find(
              (item) => item.id === view.variantId,
            ) ?? EXPANSION_SUBJECTS[view.subjectId].variants[0],
        }
      : null;
  const isLaunching =
    view.kind === 'launching' || view.kind === 'expansionLaunching';

  // 오늘 데일리 미션 완료 여부 — banner 상태 표시.
  const dailyDoneToday = isToday(progress.lastDailyMissionAt);

  // 사용자가 ADSP/SQLD 클릭했지만 닉네임 미설정 — onboarding 후 자동 진입.
  if (pendingSubject) {
    return (
      <NicknameOnboarding
        onDone={() => {
          const subj = pendingSubject;
          setPendingSubject(null);
          setView({ kind: 'detail', subject: subj });
        }}
      />
    );
  }

  // 첫 방문자 — 닉네임 onboarding 만 노출하고 chooser 는 그 후에.
  if (needsNicknameOnboarding) {
    return (
      <NicknameOnboarding onDone={() => setNicknameGateDone(true)} />
    );
  }

  if (view.kind === 'expansionPlanets') {
    const expansionSubject = EXPANSION_SUBJECTS[view.subjectId];
    const variant =
      expansionSubject.variants.find((item) => item.id === view.variantId) ??
      expansionSubject.variants[0];
    return (
      <ExpansionPlanetScreen
        subject={expansionSubject}
        variant={variant}
        onBack={() => setView({ kind: 'overview' })}
        onSelectPlanet={(planetKey) =>
          setView({
            kind: 'expansionOutline',
            subjectId: expansionSubject.id,
            variantId: variant.id,
            planetKey,
          })
        }
      />
    );
  }

  if (view.kind === 'expansionOutline') {
    const expansionSubject = EXPANSION_SUBJECTS[view.subjectId];
    const variant =
      expansionSubject.variants.find((item) => item.id === view.variantId) ??
      expansionSubject.variants[0];
    const planet =
      expansionSubject.planets.find((item) => item.key === view.planetKey) ??
      expansionSubject.planets.find((item) =>
        item.variantIds.includes(variant.id),
      );

    if (!planet) {
      return (
        <ExpansionPlanetScreen
          subject={expansionSubject}
          variant={variant}
          onBack={() => setView({ kind: 'overview' })}
          onSelectPlanet={(planetKey) =>
            setView({
              kind: 'expansionOutline',
              subjectId: expansionSubject.id,
              variantId: variant.id,
              planetKey,
            })
          }
        />
      );
    }

    return (
      <ExpansionOutlineScreen
        subject={expansionSubject}
        variant={variant}
        planet={planet}
        onBack={() =>
          setView({
            kind: 'expansionPlanets',
            subjectId: expansionSubject.id,
            variantId: variant.id,
          })
        }
        onSubjectBack={() => setView({ kind: 'overview' })}
        onSelectTopic={(topicId) =>
          setView({
            kind: 'expansionConcept',
            subjectId: expansionSubject.id,
            variantId: variant.id,
            planetKey: planet.key,
            topicId,
          })
        }
      />
    );
  }

  if (view.kind === 'expansionConcept') {
    const expansionSubject = EXPANSION_SUBJECTS[view.subjectId];
    const variant =
      expansionSubject.variants.find((item) => item.id === view.variantId) ??
      expansionSubject.variants[0];
    const planet =
      expansionSubject.planets.find((item) => item.key === view.planetKey) ??
      expansionSubject.planets.find((item) =>
        item.variantIds.includes(variant.id),
      );

    if (!planet) {
      return (
        <ExpansionPlanetScreen
          subject={expansionSubject}
          variant={variant}
          onBack={() => setView({ kind: 'overview' })}
          onSelectPlanet={(planetKey) =>
            setView({
              kind: 'expansionOutline',
              subjectId: expansionSubject.id,
              variantId: variant.id,
              planetKey,
            })
          }
        />
      );
    }

    return (
      <ExpansionConceptScreen
        subject={expansionSubject}
        variant={variant}
        planet={planet}
        topicId={view.topicId}
        onBack={() =>
          setView({
            kind: 'expansionOutline',
            subjectId: expansionSubject.id,
            variantId: variant.id,
            planetKey: planet.key,
          })
        }
        onSubjectBack={() => setView({ kind: 'overview' })}
      />
    );
  }

  return (
    <section
      className="relative min-h-screen isolate overflow-hidden"
      style={{ background: BG, color: FG }}
    >
      {/* === Background: Mux HLS ambient + 흰글씨 가독성용 어두운 그라디언트 === */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <VideoBg
          src={VIDEO_URLS.pageAmbient}
          poster={VIDEO_POSTERS.pageAmbient}
          fit="cover"
        />
        {/* dark scrim — 배경 영상 위에 깔아 흰 텍스트 가독성 확보 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(1,8,40,0.55) 0%, rgba(1,8,40,0.62) 50%, rgba(1,8,40,0.78) 100%)',
          }}
          aria-hidden
        />
      </div>

      {/* === Frame: 가운데 정렬 column === */}
      <div className="relative z-10 w-full max-w-[840px] lg:max-w-[1080px] xl:max-w-[1240px] mx-auto min-h-screen px-5 md:px-10 lg:px-16 xl:px-20 pt-5 md:pt-7 lg:pt-10 pb-10 flex flex-col">
        {/* TOP BAR */}
        <div className="flex items-center justify-between gap-3 mb-12 md:mb-20">
          <div className="w-9 h-9 md:w-10 md:h-10" aria-hidden />

          <div className="flex gap-2">
            <IconBox
              label="일일 퀘스트"
              onClick={() => {
                window.location.hash = '/stats';
              }}
            >
              <ListTodo size={15} strokeWidth={2} />
            </IconBox>
            <IconBox label="복습" onClick={onOpenReview}>
              <RotateCcw size={15} strokeWidth={2} />
            </IconBox>
            <IconBox
              label="북마크"
              onClick={() => {
                window.location.hash = '/bookmarks';
              }}
              indicator={bookmarkCount > 0}
            >
              <Star
                size={15}
                strokeWidth={2}
                fill={bookmarkCount > 0 ? ACCENT : 'none'}
              />
            </IconBox>
            <IconBox
              label="대시보드"
              onClick={() => {
                window.location.hash = '/stats';
              }}
            >
              <BarChart3 size={15} strokeWidth={2} />
            </IconBox>
          </div>
        </div>

        {/* MASCOT + SPEECH BUBBLE — 사용자 상태별 인사 */}
        <div className="mb-8 md:mb-10">
          <ChooserMascot
            stats={playerStats}
            progress={progress}
            displayName={profile.displayName}
          />
        </div>

        {/*
          Phase 4 Step 3 — 학습 플랜 진도 배너 / onboarding 권유 배너.
          plan 있으면 StudyPlanBanner, 없으면 OnboardingPromptBanner — 둘 중 하나만.
        */}
        <div className="mb-6 md:mb-8">
          <StudyPlanBanner variant="compact" />
          <OnboardingPromptBanner />
        </div>

        {/* HAIRLINE */}
        <div
          className="h-px w-full mb-8 md:mb-12"
          style={{ background: LINE }}
        />

        {/* SUBJECT CARDS */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-auto">
          <SubjectChoice
            subject="adsp"
            disabled={adspTotal === 0}
            total={adspTotal}
            onSelect={() => handlePlanetClick('adsp')}
          />
          <SubjectChoice
            subject="sqld"
            disabled={sqldTotal === 0}
            total={sqldTotal}
            onSelect={() => handlePlanetClick('sqld')}
          />
          {Object.values(EXPANSION_SUBJECTS).flatMap((expansionSubject) =>
            expansionSubject.variants.map((variant) => (
              <ExpansionVariantChoice
                key={`${expansionSubject.id}:${variant.id}`}
                subject={expansionSubject}
                variant={variant}
                onSelect={() =>
                  setView({
                    kind: 'expansionLaunching',
                    subjectId: expansionSubject.id,
                    variantId: variant.id,
                  })
                }
              />
            )),
          )}
        </div>

        {/* DAILY MISSION BANNER — 1줄 */}
        <button
          type="button"
          onClick={() => onStartDailyMission(defaultMissionSubject)}
          className="mt-12 md:mt-16 w-full text-left transition hover:bg-[rgba(255,255,255,0.04)] focus:outline-none focus-visible:bg-[rgba(255,255,255,0.06)]"
          style={{
            borderTop: `1px solid ${LINE}`,
            borderBottom: `1px solid ${LINE}`,
            color: FG,
          }}
        >
          <div className="flex items-center justify-between gap-3 px-1 py-4 md:py-5">
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="kr-heading uppercase text-[11px] md:text-[12px]"
                style={{ letterSpacing: '0.18em' }}
              >
                오늘의 미션
              </span>
              <span style={{ color: FG_DIM }}>·</span>
              <span
                className="kr-heading uppercase text-[11px] md:text-[12px] truncate"
                style={{ letterSpacing: '0.13em', color: FG_SOFT }}
              >
                {defaultMissionSubject.toUpperCase()} 약점 7 + 복습 3 = 10문
              </span>
              {dailyDoneToday ? (
                <span
                  className="kr-heading uppercase text-[10px] shrink-0 px-2 py-0.5 rounded-full"
                  style={{
                    letterSpacing: '0.13em',
                    color: '#FFFFFF',
                    background: ACCENT,
                  }}
                >
                  오늘 완료
                </span>
              ) : null}
            </div>
            <ArrowRight size={16} strokeWidth={2} />
          </div>
        </button>
      </div>

      {/* === Modal: Subject Info Panel === */}
      {selectedSubject ? (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center p-4 md:p-6"
          onClick={(e) => {
            // backdrop 클릭 시 닫기 (패널 내부 클릭은 제외)
            if (e.target === e.currentTarget && !isLaunching) handleBack();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedSubject.toUpperCase()} 과목 정보`}
        >
          {/* 어두운 backdrop + 강한 블러 (배경의 카드 영역을 가림) */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: 'rgba(1,8,40,0.62)',
              backdropFilter: 'blur(14px) saturate(110%)',
              WebkitBackdropFilter: 'blur(14px) saturate(110%)',
            }}
          />
          {/* 패널 자체는 backdrop 위에 떠 있음 */}
          <div className="relative w-full max-w-[460px]">
            <SubjectInfoPanel
              subject={selectedSubject}
              total={selectedSubject === 'adsp' ? adspTotal : sqldTotal}
              progress={progress}
              launching={isLaunching}
              onBack={handleBack}
              onPlay={() => handlePlay(selectedSubject)}
              onMockExam={() => onStartMockExam(selectedSubject)}
            />
          </div>
        </div>
      ) : null}

      {/* === Overlay: Full — 워프 === */}
      {isLaunching ? (
        <div
          className="warp-overlay pointer-events-none absolute inset-0 flex items-center justify-center z-30"
          style={{
            background: `radial-gradient(ellipse at center, rgba(253,128,46,0.18) 0%, rgba(253,128,46,0.06) 40%, rgba(1,8,40,0.94) 85%)`,
          }}
        >
          <div
            className="warp-text kr-heading uppercase text-[18px] md:text-[22px] text-center"
            style={{
              color: FG,
              letterSpacing: '0.18em',
            }}
          >
            Entering{' '}
            {selectedSubject?.toUpperCase() ??
              launchingExpansion?.variant.shortLabel ??
              'QUEST'}…
          </div>
        </div>
      ) : null}
    </section>
  );
}

// ----------------------------------------------------------------
// ChooserMascot — Ques 마스코트 + 말풍선. 사용자 상태별 카피.
// ----------------------------------------------------------------

interface ChooserGreeting {
  pose: QuesPose;
  text: string;
}

function buildChooserGreeting(
  stats: PlayerStats,
  progress: ProgressStore,
  displayName: string,
): ChooserGreeting {
  // 닉네임 있으면 호칭 prefix 로 활용 (없으면 빈 문자열 → 일반 톤).
  // tag 는 이제 server-issued 만 — guest 는 빈값이라 별도 비교 불필요.
  const name = displayName.trim();
  const isReal = name !== '';
  const nickPrefix = isReal ? `[${name}]님, ` : '';

  if (stats.sessionsCount === 0) {
    // onboarding 직후 (닉네임 방금 설정한 케이스). 짧게 맞이 + 과목 유도.
    return {
      pose: 'wave',
      text: isReal
        ? `반가워요 [${name}]님! 어떤 과목으로 시작해볼까요?`
        : '안녕하세요! 저는 [토리] 라고 해요! 어떤 과목을 공부하려고 하세요?',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  const hasToday = progress.sessions.some((s) => s.at >= todayStart);

  if (hasToday) {
    return {
      pose: 'happy',
      text:
        stats.streakDays >= 3
          ? `${nickPrefix}[${stats.streakDays}일 연속] — 더 가볼까?`
          : `${nickPrefix}오늘도 한 번 더?`,
    };
  }

  if (stats.streakDays >= 3) {
    return {
      pose: 'celebrate',
      text: `${nickPrefix}[${stats.streakDays}일 연속] 이어가요!`,
    };
  }

  const now = Date.now();
  const lastAt = progress.sessions.reduce((mx, s) => Math.max(mx, s.at), 0);
  const daysAway = Math.floor((now - lastAt) / (24 * 60 * 60 * 1000));

  if (daysAway >= 3) {
    return {
      pose: 'sad',
      text: `${nickPrefix}${daysAway}일 만이에요. 다시 시작!`,
    };
  }

  return {
    pose: 'idle',
    text: `${nickPrefix}오늘 뭘 공부할까?`,
  };
}

function ChooserMascot({
  stats,
  progress,
  displayName,
}: {
  stats: PlayerStats;
  progress: ProgressStore;
  displayName: string;
}) {
  const greeting = useMemo(
    () => buildChooserGreeting(stats, progress, displayName),
    [stats, progress, displayName],
  );
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="max-w-[280px]">
        <SpeechBubble text={greeting.text} placement="top" />
      </div>
      <Ques pose={greeting.pose} size={140} />
    </div>
  );
}

// ----------------------------------------------------------------
// SubjectChoice — 유리재질(liquid-glass) 카드.
// ----------------------------------------------------------------

function SubjectChoice({
  subject,
  disabled,
  total,
  onSelect,
}: {
  subject: Subject;
  disabled: boolean;
  total: number;
  onSelect: () => void;
}) {
  const intro = SUBJECT_INTRO[subject];
  const schema = SUBJECT_SCHEMAS[subject];
  const subjectAccent = SUBJECT_ACCENT[subject];
  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect()}
      disabled={disabled}
      aria-label={`${subject.toUpperCase()} 선택`}
      className="liquid-glass rounded-[18px] group flex flex-col text-left transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.05)]"
      style={{
        color: FG,
        padding: '20px 16px',
        minHeight: 200,
      }}
    >
      {/* 코너 마커 — 과목별 액센트 (ADSP 시안 / SQLD 퍼플) */}
      <span
        aria-hidden
        className="block w-[7px] h-[7px] mb-5 transition group-hover:scale-110"
        style={{ background: subjectAccent }}
      />

      {/* 타이틀 — Anton 큰 사이즈 */}
      <div
        className="kr-heading uppercase text-[34px] md:text-[42px] leading-none mb-2.5"
        style={{ letterSpacing: '0.005em', color: FG }}
      >
        {subject.toUpperCase()}
      </div>

      {/* 태그라인 */}
      <p
        className="kr-heading uppercase text-[10px] md:text-[11px] leading-snug mb-auto"
        style={{ letterSpacing: '0.16em', color: FG_SOFT }}
      >
        {intro.tagline}
      </p>

      {/* 메타 — 하단 hairline 으로 구분 */}
      <div
        className="flex items-center justify-between mt-5 pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.16)' }}
      >
        <span
          className="kr-heading uppercase text-[10px] tabular-nums"
          style={{ letterSpacing: '0.13em', color: FG_SOFT }}
        >
          챕터 {schema.chapters.length} · 문항 {total}
        </span>
        <ArrowRight size={14} strokeWidth={2} style={{ color: subjectAccent }} />
      </div>
    </button>
  );
}

function ExpansionVariantChoice({
  subject,
  variant,
  onSelect,
}: {
  subject: ExpansionSubjectConfig;
  variant: ExpansionVariant;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${variant.title} 선택`}
      className="liquid-glass rounded-[18px] group flex flex-col text-left transition duration-200 focus:outline-none focus-visible:bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.05)]"
      style={{
        color: FG,
        padding: '20px 16px',
        minHeight: 200,
        borderColor: `rgba(${subject.accentRgb}, 0.28)`,
      }}
    >
      <span
        aria-hidden
        className="block h-[7px] w-[7px] transition group-hover:scale-110"
        style={{ background: subject.accent }}
      />

      <div
        className="kr-heading mt-5 text-[30px] leading-none md:text-[38px]"
        style={{ letterSpacing: '0.005em', color: FG }}
      >
        {variant.title}
      </div>

      <p
        className="kr-heading mt-2.5 text-[10px] uppercase leading-snug md:text-[11px]"
        style={{ letterSpacing: '0.16em', color: FG_SOFT }}
      >
        {variant.subtitle}
      </p>

      <div
        className="mt-auto flex items-center justify-between gap-3 pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.16)' }}
      >
        <span
          className="kr-heading text-[10px] uppercase tabular-nums"
          style={{ letterSpacing: '0.13em', color: FG_SOFT }}
        >
          {variant.meta}
        </span>
        <ArrowRight
          size={14}
          strokeWidth={2.4}
          className="shrink-0 transition group-hover:translate-x-0.5"
          style={{ color: subject.accent }}
        />
      </div>
    </button>
  );
}

function ExpansionPlanetScreen({
  subject,
  variant,
  onBack,
  onSelectPlanet,
}: {
  subject: ExpansionSubjectConfig;
  variant: ExpansionVariant;
  onBack: () => void;
  onSelectPlanet: (planetKey: string) => void;
}) {
  const planets = subject.planets.filter((planet) =>
    planet.variantIds.includes(variant.id),
  );

  return (
    <section className="relative min-h-screen isolate overflow-hidden text-cream">
      <PageAmbientBg />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${subject.accent}1f 0%, rgba(1,8,40,0) 55%)`,
        }}
      />
      <MobileTopBar
        customSubject={{
          id: subject.id,
          label: variant.shortLabel,
          accent: subject.accent,
          onClick: onBack,
        }}
      />
      <MobileBottomNav
        active="learn"
        accent={subject.accent}
        onLearn={() => {}}
      />

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-layout px-6 pb-28 pt-20 md:px-10 lg:px-16">
        <header className="mb-12 max-w-[640px] md:mb-16">
          <button
            type="button"
            onClick={onBack}
            aria-label="은하로 돌아가기"
            className="game-back-button mb-5 inline-flex items-center gap-2 kr-heading text-[11px] uppercase tracking-widest transition"
          >
            <ArrowLeft size={14} strokeWidth={2.4} />
            은하로
          </button>

          <div className="mb-3 flex items-center gap-2 kr-num text-[10px] uppercase tracking-widest text-cream/55">
            <span>Galaxy</span>
            <span className="text-cream/30">›</span>
            <span style={{ color: subject.accent }}>
              {subject.routeLabel}
            </span>
          </div>
          <h1 className="kr-heading text-[26px] uppercase leading-[1.15] tracking-[0.01em] drop-shadow-[0_2px_20px_rgba(0,0,0,0.75)] md:text-[36px] lg:text-[44px]">
            {variant.title} 필기
          </h1>
          <p className="kr-body mt-4 max-w-xl text-[13px] leading-[1.7] text-cream/80 md:text-[14px]">
            탐사할 과목 행성을 선택하세요. 지금은 개념 노드 없이 과목명만 먼저 열어뒀어요.
          </p>
        </header>

        <div className="flex justify-center lg:justify-end lg:pr-4 xl:pr-10">
          <ExpansionChapterPath
            planets={planets}
            accent={subject.accent}
            onSelectPlanet={onSelectPlanet}
          />
        </div>
      </div>
    </section>
  );
}

function ExpansionChapterPath({
  planets,
  accent,
  onSelectPlanet,
}: {
  planets: ExpansionPlanet[];
  accent: string;
  onSelectPlanet: (planetKey: string) => void;
}) {
  const W = 420;
  const NODE = 78;
  const TITLE_GAP = 74;
  const NODE_GAP = 42;
  const GAP_Y = NODE + TITLE_GAP + NODE_GAP;
  const PAD_Y = 28;
  const OFFSET_X = 46;
  const CENTER = W / 2;
  const totalH = PAD_Y * 2 + NODE + (planets.length - 1) * GAP_Y;

  const nodes = planets.map((planet, idx) => {
    const leftSide = idx % 2 === 0;
    const cx = CENTER + (leftSide ? -OFFSET_X : OFFSET_X);
    const cy = PAD_Y + NODE / 2 + idx * GAP_Y;
    return { cx, cy, leftSide, planet, idx };
  });

  const PATH_MARGIN = 8;
  let d = '';
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const node = nodes[i];
    const startY = prev.cy + NODE / 2 + PATH_MARGIN;
    const endY = node.cy - NODE / 2 - PATH_MARGIN;
    const midY = (startY + endY) / 2;
    d += `M ${prev.cx} ${startY} C ${prev.cx} ${midY}, ${node.cx} ${midY}, ${node.cx} ${endY} `;
  }

  return (
    <div className="relative w-full max-w-[480px]" style={{ height: totalH }}>
      <svg
        width="100%"
        height={totalH}
        viewBox={`0 0 ${W} ${totalH}`}
        preserveAspectRatio="xMidYMin meet"
        className="absolute inset-0 pointer-events-none"
      >
        <path
          d={d}
          fill="none"
          stroke={`${accent}88`}
          strokeWidth={2.5}
          strokeDasharray="2 7"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${accent}66)` }}
        />
      </svg>

      {nodes.map((node) => (
        <ExpansionChapterNode
          key={node.planet.key}
          planetKey={node.planet.key}
          cx={node.cx}
          cy={node.cy}
          chapter={node.idx + 1}
          title={node.planet.title}
          subtitle={`${node.planet.sections.length}단원 · ${node.planet.sections.reduce(
            (sum, section) => sum + section.topics.length,
            0,
          )}개`}
          accent={accent}
          NODE={NODE}
          TITLE_GAP={TITLE_GAP}
          containerW={W}
          onSelect={onSelectPlanet}
        />
      ))}
    </div>
  );
}

function ExpansionChapterNode({
  planetKey,
  cx,
  cy,
  chapter,
  title,
  subtitle,
  accent,
  NODE,
  TITLE_GAP,
  containerW,
  onSelect,
}: {
  planetKey: string;
  cx: number;
  cy: number;
  chapter: number;
  title: string;
  subtitle: string;
  accent: string;
  NODE: number;
  TITLE_GAP: number;
  containerW: number;
  onSelect: (planetKey: string) => void;
}) {
  const ringSize = NODE + 12;
  const r = (ringSize - 4) / 2;
  const titleW = Math.min(containerW - 40, 260);

  return (
    <>
      <div
        className="absolute"
        style={{
          left: cx - ringSize / 2,
          top: cy - ringSize / 2,
          width: ringSize,
          height: ringSize,
        }}
      >
        <svg
          width={ringSize}
          height={ringSize}
          className="absolute inset-0 pointer-events-none"
        >
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={r}
            fill="none"
            stroke="rgba(239, 244, 255, 0.22)"
            strokeWidth={3}
          />
        </svg>

        <button
          type="button"
          onClick={() => onSelect(planetKey)}
          aria-label={`${title} 과목`}
          className="absolute rounded-full inline-flex items-center justify-center transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon"
          style={{
            inset: 6,
            background: `radial-gradient(circle at 32% 24%, ${accent} 0%, ${accent}d8 38%, ${accent}99 78%, ${accent}66 100%)`,
            boxShadow: `0 4px 0 -1px rgba(0,0,0,0.42), 0 12px 28px -10px ${accent}aa`,
          }}
        >
          <span
            aria-hidden
            className="absolute inset-1 rounded-full pointer-events-none"
            style={{
              border: '1px solid rgba(255,255,255,0.55)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -2px 6px rgba(0,0,0,0.22)',
            }}
          />
          <span
            className="kr-num leading-none relative"
            style={{
              fontSize: NODE * 0.36,
              fontWeight: 600,
              color: '#1a1f33',
              textShadow: '0 1px 0 rgba(255,255,255,0.25)',
            }}
          >
            {chapter}
          </span>
        </button>
      </div>

      <div
        className="absolute flex flex-col items-center text-center pointer-events-none"
        style={{
          left: cx - titleW / 2,
          top: cy + NODE / 2 + 14,
          width: titleW,
          height: TITLE_GAP - 14,
        }}
      >
        <h3
          className="kr-body font-semibold text-[14px] md:text-[15px] leading-[1.25] tracking-[-0.005em] truncate w-full"
          style={{
            color: 'var(--cream)',
            textShadow: '0 1px 10px rgba(0,0,0,0.8)',
          }}
        >
          {title}
        </h3>
        <div
          className="kr-num text-[11px] text-cream/65 mt-1.5 inline-flex items-center gap-2"
          style={{ textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}
        >
          <span>{subtitle}</span>
        </div>
      </div>
    </>
  );
}

function ExpansionOutlineScreen({
  subject,
  variant,
  planet,
  onBack,
  onSubjectBack,
  onSelectTopic,
}: {
  subject: ExpansionSubjectConfig;
  variant: ExpansionVariant;
  planet: ExpansionPlanet;
  onBack: () => void;
  onSubjectBack: () => void;
  onSelectTopic: (topicId: string) => void;
}) {
  const totalTopics = planet.sections.reduce(
    (sum, section) => sum + section.topics.length,
    0,
  );

  return (
    <section className="relative min-h-screen isolate overflow-hidden text-cream">
      <PageAmbientBg />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${subject.accent}1f 0%, rgba(1,8,40,0) 55%)`,
        }}
      />
      <MobileTopBar
        customSubject={{
          id: subject.id,
          label: variant.shortLabel,
          accent: subject.accent,
          onClick: onSubjectBack,
        }}
      />
      <MobileBottomNav
        active="learn"
        accent={subject.accent}
        onLearn={() => {}}
      />

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-layout px-6 pb-28 pt-20 md:px-10 lg:px-16">
        <header className="mb-8 max-w-[680px] md:mb-10">
          <button
            type="button"
            onClick={onBack}
            aria-label="행성으로 돌아가기"
            className="game-back-button mb-5 inline-flex items-center gap-2 kr-heading text-[11px] uppercase tracking-widest transition"
          >
            <ArrowLeft size={14} strokeWidth={2.4} />
            행성으로
          </button>

          <div className="mb-3 flex items-center gap-2 kr-num text-[10px] uppercase tracking-widest text-cream/55">
            <span>Galaxy</span>
            <span className="text-cream/30">›</span>
            <span style={{ color: subject.accent }}>
              {subject.routeLabel}
            </span>
          </div>

          <h1 className="kr-heading text-[26px] uppercase leading-[1.12] tracking-[0.01em] drop-shadow-[0_2px_20px_rgba(0,0,0,0.75)] md:text-[36px] lg:text-[44px]">
            {planet.title}
          </h1>
          <p className="kr-body mt-3 max-w-xl text-[13px] leading-[1.65] text-cream/78 md:text-[14px]">
            단원 목차를 먼저 열어뒀어요. 세부 개념과 문제는 이 순서로 붙일게요.
          </p>

          <div className="mt-4 flex items-center gap-2 kr-num text-[10px] uppercase tracking-widest text-cream/50">
            <span style={{ color: subject.accent }}>
              {planet.sections.length}단원
            </span>
            <span className="text-cream/25">·</span>
            <span>{totalTopics}개 목차</span>
            <span className="text-cream/25">·</span>
            <span>개념 준비 중</span>
          </div>
        </header>

        <div className="flex flex-col gap-8 md:gap-10">
          {planet.sections.map((section, sectionIndex) => (
            <ExpansionOutlineSection
              key={section.key}
              index={sectionIndex + 1}
              title={section.title}
              planetKey={planet.key}
              topics={section.topics}
              accent={subject.accent}
              onSelectTopic={onSelectTopic}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ExpansionOutlineSection({
  index,
  title,
  planetKey,
  topics,
  accent,
  onSelectTopic,
}: {
  index: number;
  title: string;
  planetKey: string;
  topics: ExpansionPlanet['sections'][number]['topics'];
  accent: string;
  onSelectTopic: (topicId: string) => void;
}) {
  return (
    <section className="mt-2 md:mt-3" aria-label={title}>
      <div className="mb-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="kr-heading text-[10px] uppercase tracking-[0.18em]"
                style={{ color: accent }}
              >
                Part {index}
              </span>
            </div>
            <h2
              className="kr-heading mt-1 text-[18px] uppercase leading-tight tracking-[0.01em] md:text-[21px]"
              style={{ color: 'var(--cream)' }}
            >
              {title}
            </h2>
          </div>
          <span className="kr-num shrink-0 text-[11px] uppercase tracking-widest text-cream/62">
            {topics.length}개
          </span>
        </div>
        <div
          className="mt-3 h-px"
          style={{ background: `${accent}33` }}
          aria-hidden
        />
      </div>

      <div className="flex flex-col">
        {topics.map((topic, topicIndex) => (
          <ExpansionOutlineNode
            key={topic.id}
            n={topicIndex + 1}
            planetKey={planetKey}
            topicId={topic.id}
            title={topic.title}
            accent={accent}
            isLast={topicIndex === topics.length - 1}
            onSelectTopic={onSelectTopic}
          />
        ))}
      </div>
    </section>
  );
}

function ExpansionOutlineNode({
  n,
  planetKey,
  topicId,
  title,
  accent,
  isLast,
  onSelectTopic,
}: {
  n: number;
  planetKey: string;
  topicId: string;
  title: string;
  accent: string;
  isLast: boolean;
  onSelectTopic: (topicId: string) => void;
}) {
  const cardCount = getComhwalTopicCards(planetKey, topicId).length;
  const isReady = cardCount > 0;

  return (
    <button
      type="button"
      className="group flex w-full text-left disabled:cursor-not-allowed disabled:opacity-60"
      disabled={!isReady}
      onClick={() => onSelectTopic(topicId)}
      aria-label={
        isReady ? `${title} 개념 카드 열기` : `${title} 개념 준비 중`
      }
    >
      <div className="mr-4 flex flex-col items-center md:mr-5">
        <span
          aria-hidden
          className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full md:h-12 md:w-12"
          style={{
            background:
              'linear-gradient(180deg, rgba(239,244,255,0.16), rgba(239,244,255,0.07))',
            border: '1.5px solid rgba(239,244,255,0.48)',
            color: 'rgba(239,244,255,0.96)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.14), 0 8px 18px -16px rgba(239,244,255,0.42)',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          <span className="kr-heading text-[13px] leading-none tabular-nums">
            {n}
          </span>
        </span>
        {!isLast ? (
          <div
            className="my-1 w-px flex-1"
            style={{
              background: 'rgba(239,244,255,0.30)',
              minHeight: 28,
            }}
            aria-hidden
          />
        ) : null}
      </div>

      <div className="flex-1 pb-6 md:pb-7">
        <h3
          className="kr-body text-[13px] font-medium leading-[1.4] tracking-[-0.005em] transition md:text-[14px]"
          style={{
            color: 'var(--cream)',
            textShadow:
              '0 1px 3px rgba(1,8,40,0.7), 0 0 1px rgba(0,0,0,0.4)',
          }}
        >
          {title}
        </h3>
        <div
          className="kr-body mt-1 flex flex-wrap items-center gap-2 text-[10.5px]"
          style={{
            color: 'rgba(239,244,255,0.7)',
            textShadow: '0 1px 2px rgba(1,8,40,0.6)',
          }}
        >
          <span
            className="kr-num uppercase tracking-widest text-[9px]"
            style={{ color: accent }}
          >
            NO. {topicId}
          </span>
          <span style={{ color: 'rgba(239,244,255,0.4)' }}>·</span>
          <span style={{ color: isReady ? 'rgba(239,244,255,0.78)' : 'rgba(239,244,255,0.7)' }}>
            {isReady ? `개념 카드 ${cardCount}장` : '개념 준비 중'}
          </span>
          {isReady ? (
            <>
              <span style={{ color: 'rgba(239,244,255,0.4)' }}>·</span>
              <span
                className="inline-flex items-center gap-1 kr-num text-[9px] uppercase tracking-widest"
                style={{ color: accent }}
              >
                열기
                <ChevronRight size={11} strokeWidth={2.4} />
              </span>
            </>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function getComhwalConceptPose(
  card: ComhwalConceptCard | undefined,
  index: number,
  total: number,
): QuesPose {
  if (!card) return 'sad';
  if (total > 0 && index === total - 1) return 'celebrate';
  if (index === 0) return 'wave';
  if (card.examTip) return 'think';
  if (card.visualHint) return 'lightbulb';
  return 'idle';
}

function ComhwalConceptQuestionPanel({
  question,
  accent,
  selectedAnswer,
  onSelectAnswer,
}: {
  question: NonNullable<ComhwalConceptCard['question']>;
  accent: string;
  selectedAnswer?: number;
  onSelectAnswer: (choiceIndex: number) => void;
}) {
  const hasAnswered = selectedAnswer !== undefined;
  const isCorrectAnswer =
    selectedAnswer !== undefined ? selectedAnswer === question.answerIndex : false;

  return (
    <div className="mt-8 w-full max-w-[560px]">
      <OptionsPanel
        choices={question.choices}
        chosen={selectedAnswer ?? null}
        correctIndex={hasAnswered ? question.answerIndex : null}
        graded={hasAnswered}
        onChoose={onSelectAnswer}
      />

      {hasAnswered ? (
        <div
          className="mt-4 rounded-2xl px-4 py-3"
          style={{
            background: isCorrectAnswer
              ? `${accent}18`
              : 'rgba(251,113,133,0.12)',
            border: `1px solid ${
              isCorrectAnswer ? `${accent}66` : 'rgba(251,113,133,0.36)'
            }`,
          }}
        >
          <p
            className="kr-heading text-[13px]"
            style={{ color: isCorrectAnswer ? accent : '#fb7185' }}
          >
            {isCorrectAnswer ? '좋아, 정확해!' : '다시 확인해볼까?'}
          </p>
          <p className="kr-body mt-1.5 text-[13px] leading-[1.65] text-cream/78">
            {question.explanation}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ComhwalConceptProgressList({
  cards,
  activeIndex,
  accent,
  answeredCardIds,
  currentStepProgress,
}: {
  cards: ComhwalConceptCard[];
  activeIndex: number;
  accent: string;
  answeredCardIds: Set<string>;
  currentStepProgress: number;
}) {
  const currentPercent = Math.max(0, Math.min(100, Math.round(currentStepProgress * 100)));

  return (
    <nav
      className="w-full max-w-[420px]"
      aria-label="개념 진행"
    >
      <div
        className="kr-num mb-3.5 text-[10px] uppercase tracking-[0.18em]"
        style={{ color: 'rgba(239,244,255,0.45)' }}
      >
        개념 진행 · {cards.length > 0 ? activeIndex + 1 : 0} / {cards.length}
      </div>
      <ol className="relative m-0 flex list-none flex-col gap-6 p-0 md:gap-5">
        <span
          aria-hidden
          className="absolute bottom-3 left-[7px] top-3 z-0 w-px"
          style={{ background: 'rgba(239,244,255,0.08)' }}
        />
        {cards.map((card, index) => {
          const isActive = index === activeIndex;
          const isPast = index < activeIndex;
          const isDone = answeredCardIds.has(card.id) || isPast;
          return (
            <li
              key={card.id}
              className="relative flex items-center gap-3"
              aria-current={isActive ? 'step' : undefined}
            >
            <span
              aria-hidden
              className="relative z-10 inline-flex shrink-0 items-center justify-center rounded-full transition-all"
              style={{
                width: isActive ? 16 : 14,
                height: isActive ? 16 : 14,
                border: isActive
                  ? `2px solid ${accent}`
                  : isDone || isPast
                    ? '1.5px solid var(--neon-55)'
                    : '1.5px solid rgba(239,244,255,0.22)',
                background: isActive
                  ? accent
                  : 'linear-gradient(#010828, #010828) padding-box',
                boxShadow: isActive
                  ? `0 0 12px ${accent}, 0 0 0 3px rgba(1,8,40,1)`
                  : '0 0 0 3px var(--base, #010828)',
                color: isDone || isPast ? 'var(--neon)' : 'transparent',
              }}
            >
              {isDone || isPast ? (
                <span className="text-[9px] font-black leading-none">
                  ✓
                </span>
              ) : null}
            </span>

            <span
              title={card.title}
              className="kr-body flex-1 text-[12.5px] leading-tight"
              style={{
                color: isActive
                  ? accent
                  : isDone || isPast
                    ? 'rgba(239,244,255,0.85)'
                    : 'rgba(239,244,255,0.5)',
                fontWeight: isActive ? 700 : isDone || isPast ? 500 : 400,
              }}
            >
              {card.title}
            </span>

            {isActive ? (
              <span
                className="kr-num shrink-0 tabular-nums text-[10px]"
                style={{ color: accent }}
              >
                {currentPercent}%
              </span>
            ) : null}
          </li>
        );
      })}
      </ol>
    </nav>
  );
}

function ExpansionConceptStudyScreen({
  subject,
  planet,
  topicId,
  onBack,
  onSubjectBack: _onSubjectBack,
}: {
  subject: ExpansionSubjectConfig;
  variant: ExpansionVariant;
  planet: ExpansionPlanet;
  topicId: string;
  onBack: () => void;
  onSubjectBack: () => void;
}) {
  const cards = getComhwalTopicCards(planet.key, topicId);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showQuestion, setShowQuestion] = useState(false);
  const activeCard = cards[activeIndex];
  const isLastCard = activeIndex >= cards.length - 1;
  const activeQuestion = activeCard?.question;
  const selectedAnswer = activeCard ? selectedAnswers[activeCard.id] : undefined;
  const isQuestionMode = showQuestion && !!activeQuestion;
  const answeredCardIds = new Set(
    Object.keys(selectedAnswers).filter((cardId) => selectedAnswers[cardId] !== undefined),
  );
  const lessonProgress =
    cards.length > 0 ? (activeIndex + (isQuestionMode ? 1 : 0)) / cards.length : 0;
  const stepProgress = isQuestionMode ? 1 : activeQuestion ? 0.55 : 1;
  const activePose: QuesPose =
    isQuestionMode && activeQuestion
      ? selectedAnswer === undefined
        ? 'think'
        : selectedAnswer === activeQuestion.answerIndex
          ? 'happy'
          : 'sad'
      : getComhwalConceptPose(activeCard, activeIndex, cards.length);

  useEffect(() => {
    setActiveIndex(0);
    setSelectedAnswers({});
    setShowQuestion(false);
  }, [planet.key, topicId]);

  useEffect(() => {
    setShowQuestion(false);
  }, [activeCard?.id]);

  const handlePrev = () => {
    if (isQuestionMode) {
      setShowQuestion(false);
      return;
    }
    setActiveIndex((index) => Math.max(0, index - 1));
  };

  const goNextCard = () => {
    if (cards.length === 0 || isLastCard) {
      onBack();
      return;
    }
    setActiveIndex((index) => Math.min(cards.length - 1, index + 1));
  };

  const handleNext = () => {
    if (isQuestionMode) {
      if (selectedAnswer === undefined) return;
      goNextCard();
      return;
    }

    if (activeQuestion) {
      setShowQuestion(true);
      return;
    }

    goNextCard();
  };

  const speechText = activeCard
    ? isQuestionMode && activeQuestion
      ? activeQuestion.prompt
      : activeCard.body
    : '아직 이 토픽의 개념 카드가 준비 중이야. 목차는 열어뒀고, 곧 ADSP·SQLD처럼 하나씩 붙일게.';
  const primaryLabel = isQuestionMode
    ? isLastCard
      ? '목차로'
      : '다음 카드'
    : activeQuestion
      ? '문제 풀기'
      : cards.length === 0 || isLastCard
        ? '목차로'
        : '계속';

  return (
    <section
      className="relative isolate flex min-h-screen flex-col overflow-hidden text-cream"
      style={{ '--subject-accent': subject.accent } as CSSProperties}
    >
      <PageAmbientBg />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${subject.accent}1f 0%, rgba(1,8,40,0) 55%)`,
        }}
      />
      <TopBar
        progress={lessonProgress}
        stepProgress={stepProgress}
        accent={subject.accent}
        onExit={onBack}
      />

      <main className="relative z-10 mx-auto flex-1 w-full max-w-[820px] px-5 pb-36 pt-6 md:px-8 lg:max-w-[1000px] lg:px-12 lg:pt-10 xl:max-w-[1180px] xl:px-16">
        <div className="mx-auto flex max-w-[760px] flex-col items-center">
          {activeCard ? (
            <ComhwalConceptProgressList
              cards={cards}
              activeIndex={activeIndex}
              accent={subject.accent}
              answeredCardIds={answeredCardIds}
              currentStepProgress={stepProgress}
            />
          ) : null}

          <div className={activeCard ? 'mt-8 flex justify-center' : 'flex justify-center'}>
            <Ques
              pose={activePose}
              character={COMHWAL_MASCOT_CHARACTER}
              size={152}
              priority
            />
          </div>

          <div className="mt-5 w-full">
            <SpeechBubble text={speechText} placement="top" />
          </div>

          <div className="mt-7 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={!isQuestionMode && activeIndex === 0}
              aria-label="이전 대사"
              className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-4 py-3 kr-heading text-[12px] uppercase tracking-widest transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 md:px-5 md:py-3.5 md:text-[13px]"
            >
              <ChevronLeft size={16} strokeWidth={2.7} />
              이전
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={isQuestionMode && selectedAnswer === undefined}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 kr-heading text-[13px] uppercase tracking-widest text-[#07121f] transition hover:-translate-y-0.5 active:translate-y-0 md:px-8 md:py-4 md:text-[14px]"
              style={{
                background:
                  'linear-gradient(180deg, var(--subject-accent) 0%, color-mix(in srgb, var(--subject-accent) 70%, #010828) 100%)',
                boxShadow:
                  '0 6px 0 -2px rgba(0,0,0,0.5), 0 10px 22px -8px var(--subject-accent)',
              }}
            >
              {primaryLabel}
              <ChevronRight size={16} strokeWidth={2.7} />
            </button>
          </div>

          {isQuestionMode && activeQuestion && activeCard ? (
            <ComhwalConceptQuestionPanel
              key={activeQuestion.id}
              question={activeQuestion}
              accent={subject.accent}
              selectedAnswer={selectedAnswer}
              onSelectAnswer={(choiceIndex) =>
                setSelectedAnswers((answers) => ({
                  ...answers,
                  [activeCard.id]: choiceIndex,
                }))
              }
            />
          ) : activeCard ? (
            null
          ) : (
            <div className="liquid-glass mt-8 w-full max-w-[560px] rounded-[22px] p-6">
              <p className="kr-body text-[14px] leading-[1.8] text-cream/82">
                아직 이 목차의 개념 카드는 준비 중이야. 먼저 1과목 컴퓨터 일반부터 순서대로 붙이고 있어.
              </p>
            </div>
          )}
        </div>
      </main>
    </section>
  );
}

function ExpansionConceptScreen({
  subject,
  variant,
  planet,
  topicId,
  onBack,
  onSubjectBack,
}: {
  subject: ExpansionSubjectConfig;
  variant: ExpansionVariant;
  planet: ExpansionPlanet;
  topicId: string;
  onBack: () => void;
  onSubjectBack: () => void;
}) {
  return (
    <ExpansionConceptStudyScreen
      subject={subject}
      variant={variant}
      planet={planet}
      topicId={topicId}
      onBack={onBack}
      onSubjectBack={onSubjectBack}
    />
  );
}

// ----------------------------------------------------------------
// IconBox — 미니멀 36px 보더 박스 + 아이콘.
// ----------------------------------------------------------------

function IconBox({
  label,
  onClick,
  children,
  indicator,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  /** 우상단에 작은 도트 (e.g. 북마크 N개 있음). */
  indicator?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative w-9 h-9 md:w-10 md:h-10 inline-flex items-center justify-center rounded-full transition hover:bg-[rgba(255,255,255,0.1)] focus:outline-none focus-visible:bg-[rgba(255,255,255,0.14)] backdrop-blur-md"
      style={{
        border: `1px solid ${LINE}`,
        color: FG,
        background: 'rgba(255,255,255,0.06)',
      }}
    >
      {children}
      {indicator ? (
        <span
          className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
          style={{ background: ACCENT }}
        />
      ) : null}
    </button>
  );
}


// ----------------------------------------------------------------
// Subject info panel — 과목 카드 클릭 시 오버레이 (orange retint).
// ----------------------------------------------------------------

interface PanelProps {
  subject: Subject;
  total: number;
  progress: ReturnType<typeof useProgress>;
  launching: boolean;
  onBack: () => void;
  onPlay: () => void;
  onMockExam: () => void;
}

function SubjectInfoPanel({
  subject,
  total,
  progress,
  launching,
  onBack,
  onPlay,
  onMockExam,
}: PanelProps) {
  const schema = SUBJECT_SCHEMAS[subject];
  const intro = SUBJECT_INTRO[subject];
  const agg = aggregateSubject(subject, progress);
  const subjectAccent = SUBJECT_ACCENT[subject];
  const subjectAccentRgb = SUBJECT_ACCENT_RGB[subject];

  // 게스트 여부 — 미인증이면 진도가 이 기기에만 저장된다는 안내 노출.
  //
  // 정책 (2026-05-05): profile store (localStorage 기반, mount 즉시 반영) 우선.
  // session fetch 는 추가 안전망. 둘 중 하나라도 인증이면 banner 숨김.
  // 이전 정책: useState(false) 만 → mount 마다 false 초기화 → 라우트 진입
  // 시 잠깐 게스트 banner 깜빡임. profile.isAuthenticated 사용으로 해결.
  const profileForAuth = useMyProfile();
  const [sessionExists, setSessionExists] = useState(false);
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setSessionExists(!!data.session));
    const unsub = onAuthStateChange((_e, s) => setSessionExists(!!s));
    return () => {
      unsub();
    };
  }, []);
  const isSignedIn = profileForAuth.isAuthenticated || sessionExists;

  // 학습 모드 — Phase 4 Step 3 작업 A:
  //   1) 사용자가 명시적으로 설정한 값 우선
  //   2) onboarding persona 자동 매핑 (beginner→'first', reviewer→'review')
  //   3) 둘 다 없으면 undefined → 큰 카드 selector 노출 (게스트 사용자)
  const [studyMode, setStudyModeState] = useState<StudyMode | undefined>(() =>
    getEffectiveStudyMode(subject),
  );
  const handleStudyModeSelect = (mode: StudyMode) => {
    setStudyMode(subject, mode);
    setStudyModeState(mode);
  };

  // Phase 4 Step 3 작업 B — 본 주차 목표 진입 추천.
  // plan 이 본 subject 와 일치하면 메인 CTA 가 [본 주차 목표 시작] 으로 변경되어
  // 곧장 lesson step 으로 점프. 추천 없으면 기존 "{SUBJECT} 플레이하기" 동작.
  const recommendation = useMemo(() => {
    const plan = loadStudyPlan();
    if (!plan || plan.exam !== subject) return null;
    return recommendNextStep(plan, progress.sessions, progress.questionStats);
  }, [subject, progress.sessions, progress.questionStats]);

  /**
   * 메인 CTA 동작 — 추천 있으면 sessionStorage 에 lesson 점프 정보 셋업 후 onPlay.
   * GamePage 가 mount/route 변경 시 sessionStorage 를 읽어 lesson 화면으로 곧장 진입.
   *
   * 안전: sessionStorage 셋업 + 기존 onPlay (워프 → onSelectSubject) 흐름 유지.
   * 워프 후 GamePage useState 초기화 시점에 pendingConceptOpen 소비.
   */
  const handleMainCta = () => {
    if (recommendation && typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        'questdp.pendingConceptOpen',
        JSON.stringify({
          subject: recommendation.subject,
          chapter: recommendation.chapter,
          topic: recommendation.topic,
          stepIdx: recommendation.initialStepIdx,
          stepId: '',
          phase: 'narrate',
        }),
      );
    }
    onPlay();
  };

  return (
    <div className="panel-slide-up">
      <div
        className="rounded-[20px] relative overflow-hidden"
        style={{
          padding: '24px 22px 24px',
          color: FG,
          // 어두운 반투명 + 강한 블러 — backdrop 위에서도 콘트라스트 확보
          background:
            'linear-gradient(135deg, rgba(15,25,50,0.72) 0%, rgba(15,25,50,0.55) 100%)',
          backdropFilter: 'blur(28px) saturate(170%)',
          WebkitBackdropFilter: 'blur(28px) saturate(170%)',
          border: `1px solid rgba(${subjectAccentRgb}, 0.3)`,
          boxShadow: `0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(${subjectAccentRgb}, 0.25)`,
        }}
      >
        {/* 닫기 */}
        <button
          type="button"
          onClick={onBack}
          disabled={launching}
          aria-label="닫기"
          className="absolute top-3 right-3 w-8 h-8 inline-flex items-center justify-center rounded-full transition hover:bg-[rgba(255,255,255,0.12)] disabled:opacity-40"
          style={{ color: FG }}
        >
          <X size={16} strokeWidth={2} />
        </button>

        <div className="flex items-baseline gap-3 pr-8">
          <span
            className="kr-heading uppercase text-[28px] md:text-[34px] leading-none"
            style={{ letterSpacing: '0.005em', color: subjectAccent }}
          >
            {subject.toUpperCase()}
          </span>
          <span
            className="kr-heading uppercase text-[10px] md:text-[11px]"
            style={{ letterSpacing: '0.16em', color: FG_SOFT }}
          >
            {intro.tagline}
          </span>
        </div>

        <h3
          className="kr-heading text-[14px] md:text-[15px] uppercase mt-2 leading-tight"
          style={{ letterSpacing: '0.04em', color: FG }}
        >
          {schema.title}
        </h3>

        <p
          className="kr-body text-[12px] md:text-[13px] leading-[1.7] mt-3"
          style={{ color: FG_SOFT }}
        >
          {intro.description}
        </p>

        <div
          className="mt-3 flex items-center gap-2 kr-heading uppercase text-[10px]"
          style={{ letterSpacing: '0.13em', color: FG_SOFT }}
        >
          <span>챕터 {schema.chapters.length}</span>
          <span style={{ color: FG_DIM }}>·</span>
          <span>문항 {total}</span>
        </div>

        <ProgressBadge agg={agg} />

        {/*
          학습 모드 — 첫 방문 시 1회 묻고, 이후엔 기억. 'review' 면 GamePage 의
          모든 createSession 이 자동으로 passNumber=2 로 시작 (변형 문제 우선).
        */}
        <StudyModePanel
          mode={studyMode}
          onSelect={handleStudyModeSelect}
          subjectAccent={subjectAccent}
          subjectAccentRgb={subjectAccentRgb}
        />

        {/*
          게스트 안내 — 미로그인 사용자에게 진도 저장 범위 알림.
          다기기 동기화 사고 (postmortem-phase3) 의 사용자 보호 차원에서:
            "게스트 진행도 OK, 단 이 기기에만 저장" 을 명확히 노출.
          톤: 경고 X, 정보 안내 (amber #FFB020 — profile tag 색과 통일).
          launching 중엔 숨겨서 시각적 잡음 방지.
        */}
        {!isSignedIn && !launching && (
          <div
            className="mt-4 p-3 rounded-[12px] flex items-start gap-2.5"
            role="note"
            style={{
              background: 'rgba(255,176,32,0.08)',
              border: '1px solid rgba(255,176,32,0.28)',
            }}
          >
            <Info
              size={14}
              strokeWidth={2.4}
              aria-hidden
              style={{ color: '#FFB020', marginTop: 2, flexShrink: 0 }}
            />
            <p
              className="kr-body text-[12px] leading-[1.55]"
              style={{ color: 'rgba(255,205,120,0.95)' }}
            >
              게스트 모드 — 진도가{' '}
              <strong style={{ color: '#FFCB6E', fontWeight: 700 }}>
                이 브라우저에만
              </strong>{' '}
              저장돼요. 캐시 삭제 · 다른 기기 · 시크릿 모드에선 사라집니다.
              안전하게 보관하려면{' '}
              <a
                href="#/login"
                onClick={(e) => e.stopPropagation()}
                className="kr-num underline"
                style={{ color: '#FFB020', fontWeight: 700 }}
              >
                로그인
              </a>
              을 권장합니다.
            </p>
          </div>
        )}

        {/*
          Phase 4 Step 3 작업 B — 본 주차 목표가 있으면 메인 CTA 위에 컨텍스트 카드 노출.
          "이번 주 목표: 1과목 데이터 이해 / lesson 1-1 (35분 남음)" 같은 미리보기.
        */}
        {recommendation && !launching ? (
          <div
            className="mt-5 mb-3 px-3.5 py-2.5 rounded-[12px] flex items-center gap-2"
            style={{
              background: `rgba(${subjectAccentRgb}, 0.08)`,
              border: `1px solid rgba(${subjectAccentRgb}, 0.32)`,
            }}
          >
            <span
              className="kr-num text-[10px] uppercase tracking-[0.18em] shrink-0"
              style={{ color: subjectAccent, letterSpacing: '0.18em' }}
            >
              WEEK {recommendation.week_number}
            </span>
            <span
              className="kr-body text-[12.5px] leading-tight flex-1 truncate"
              style={{ color: 'rgba(239,244,255,0.85)' }}
            >
              {recommendation.chapter_display_name} ·{' '}
              <span style={{ color: 'rgba(239,244,255,0.55)' }}>
                {recommendation.lesson_title}
              </span>
            </span>
          </div>
        ) : null}

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={handleMainCta}
            disabled={launching || total === 0 || !studyMode}
            aria-label={
              !studyMode
                ? '학습 모드를 먼저 선택해주세요'
                : recommendation
                  ? `이번 주 목표 시작 — ${recommendation.chapter_display_name}`
                  : `${subject.toUpperCase()} 플레이하기`
            }
            className="kr-heading uppercase tracking-widest text-[12px] md:text-[13px] px-5 py-3 rounded-full inline-flex items-center gap-2 transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex-1 justify-center"
            style={{
              background: subjectAccent,
              color: '#0a0f1f',
              letterSpacing: '0.16em',
              boxShadow: `0 6px 18px rgba(${subjectAccentRgb}, 0.45)`,
            }}
          >
            {launching
              ? '워프 중…'
              : recommendation
                ? '이번 주 목표 시작'
                : `${subject.toUpperCase()} 플레이하기`}
            {!launching ? <ChevronRight size={15} strokeWidth={2.4} /> : null}
          </button>
          <button
            type="button"
            onClick={onBack}
            disabled={launching}
            className="kr-heading uppercase text-[10px] md:text-[11px] px-4 py-3 rounded-full transition hover:bg-[rgba(255,255,255,0.1)] disabled:opacity-40 shrink-0"
            style={{
              border: `1px solid ${LINE}`,
              color: FG,
              letterSpacing: '0.16em',
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            다른 과목
          </button>
        </div>

        {/* 모의고사 — 50문항 시험 모드 */}
        <button
          type="button"
          onClick={onMockExam}
          disabled={launching || total === 0}
          className="mt-2 w-full kr-heading uppercase text-[10px] md:text-[11px] px-4 py-3 rounded-full inline-flex items-center justify-center gap-2 transition hover:bg-[rgba(255,255,255,0.08)] disabled:opacity-40"
          style={{
            border: `1px solid ${LINE}`,
            color: FG_SOFT,
            letterSpacing: '0.16em',
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          <span>모의고사 50문항</span>
          <span style={{ color: FG_DIM }}>·</span>
          <span style={{ color: FG_DIM }}>시험 모드</span>
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// 학습 모드 패널 — Ques 마스코트가 묻고 사용자가 답하는 대화 형식
// ----------------------------------------------------------------

interface StudyModePanelProps {
  mode: StudyMode | undefined;
  onSelect: (mode: StudyMode) => void;
  subjectAccent: string;
  subjectAccentRgb: string;
}

/**
 * 미선택 (mode=undefined) 시 — Ques 마스코트가 'think' 포즈 (?-모션) 로 등장해
 * 말풍선으로 묻고, 두 답 카드를 노출.
 * 한 번 답하면 작은 chip 으로 축소 — 변경 가능 (눌러서 다시 묻는 모드).
 *
 * 'review' 선택 시 — GamePage 의 startSession 이 자동 passNumber=2 로 시작:
 *   · 변형 문제 (concept-practice-pass2) 우선
 *   · 부족하면 원본 문제로 보충 (session.ts 의 기존 N회독 로직)
 *   · 챕터 회독 stamp / Pass Tier 시스템 자연스럽게 연결
 */
function StudyModePanel({
  mode,
  onSelect,
  subjectAccent,
  subjectAccentRgb,
}: StudyModePanelProps) {
  const [editing, setEditing] = useState(mode === undefined);
  // mode 외부에서 바뀌면 editing 도 동기화 (selecting → 자동 close)
  useEffect(() => {
    if (mode !== undefined) setEditing(false);
  }, [mode]);

  // 이미 선택됨 + 변경 안 하는 중 → 작은 chip
  if (!editing && mode !== undefined) {
    return (
      <div className="mt-4 flex items-center gap-2">
        <span
          className="kr-num text-[10px] uppercase tracking-[0.18em]"
          style={{ color: 'rgba(239,244,255,0.45)' }}
        >
          학습 모드
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="학습 모드 변경"
          className="kr-num inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] transition active:scale-95 hover:brightness-110"
          style={{
            background: `rgba(${subjectAccentRgb}, 0.16)`,
            color: subjectAccent,
            border: `1px solid ${subjectAccent}55`,
            fontWeight: 600,
          }}
        >
          {mode === 'review' ? '복습 (2회독)' : '처음 학습'}
          <span style={{ opacity: 0.55 }}>변경</span>
        </button>
      </div>
    );
  }

  // 미선택 또는 변경 중 — 마스코트 + 말풍선 + 두 답
  return (
    <div className="mt-5">
      <div className="flex items-start gap-3 md:gap-4">
        <div className="shrink-0">
          <Ques pose="think" size={72} animated />
        </div>
        <div className="flex-1 pt-1">
          <SpeechBubble
            text={'복습용으로 이용하실건가요?\n아니면 [개념부터 천천히] 이용하실건가요?'}
            placement="right"
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <ModeButton
          active={mode === 'review'}
          subjectAccent={subjectAccent}
          subjectAccentRgb={subjectAccentRgb}
          title="복습 (2회독)"
          desc="변형 문제 우선 + 빠른 진도. 시험 임박용."
          onClick={() => onSelect('review')}
        />
        <ModeButton
          active={mode === 'first'}
          subjectAccent={subjectAccent}
          subjectAccentRgb={subjectAccentRgb}
          title="개념부터 천천히"
          desc="원본 문제 + 대화형 학습. 처음 시작용."
          onClick={() => onSelect('first')}
        />
      </div>
    </div>
  );
}

function ModeButton({
  active,
  subjectAccent,
  subjectAccentRgb,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  subjectAccent: string;
  subjectAccentRgb: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="text-left rounded-[14px] p-3 transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
      style={{
        background: active
          ? `rgba(${subjectAccentRgb}, 0.16)`
          : 'rgba(239,244,255,0.04)',
        border: active
          ? `1.5px solid ${subjectAccent}`
          : '1.5px solid rgba(239,244,255,0.12)',
        boxShadow: active
          ? `0 0 0 3px rgba(${subjectAccentRgb}, 0.12), inset 0 1px 0 rgba(255,255,255,0.06)`
          : 'none',
      }}
    >
      <div
        className="kr-heading text-[13px] uppercase tracking-[0.06em]"
        style={{
          color: active ? subjectAccent : 'rgba(239,244,255,0.92)',
          fontWeight: 700,
        }}
      >
        {title}
      </div>
      <div
        className="kr-body text-[11.5px] mt-1 leading-[1.45]"
        style={{
          color: active
            ? 'rgba(239,244,255,0.85)'
            : 'rgba(239,244,255,0.55)',
        }}
      >
        {desc}
      </div>
    </button>
  );
}

// ----------------------------------------------------------------
// helpers
// ----------------------------------------------------------------

/** 오늘 자정 ts 이후인지. */
function isToday(ts: number | undefined, now: number = Date.now()): boolean {
  if (!ts) return false;
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return ts >= d.getTime();
}

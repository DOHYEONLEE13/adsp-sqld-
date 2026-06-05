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

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  ListTodo,
  RotateCcw,
  Star,
  Target,
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
import FeedbackSheet from '@/game/lesson/FeedbackSheet';
import type { QuesPose } from '@/components/mascot/types';
import { recordSingleAnswer, type ProgressStore } from '../storage';
import VideoBg from '@/components/ui/VideoBg';
import { VIDEO_POSTERS, VIDEO_URLS } from '@/data/site';
import { useMyProfile } from '@/data/profile';
import { hasEverSolved } from '../progressPredicates';
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
import {
  getComhwalExpansionVisualModel,
  type ComhwalVisualFocus,
} from '../comhwalVisualModels';

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
const BG = 'var(--game-star-bg)';
const FG = '#FFFFFF';
const FG_SOFT = 'rgba(255,255,255,0.72)';
const FG_DIM = 'rgba(255,255,255,0.5)';
const LINE = 'rgba(255,255,255,0.22)';
const LAST_LEARN_HASH_KEY = 'questdp:last-learn-hash:v1';
const LAST_EXPANSION_VIEW_KEY = 'questdp:last-expansion-view:v1';
const LAST_EXPANSION_RESUME_KEY = 'questdp:last-expansion-resume:v1';
const COMHWAL_MASCOT_CHARACTER = 'harry' as const;
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
const COMHWAL_CARD_ID_RE = /^comhwal-(\d)-(\d{3})-c(\d{2})$/;

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
      kind: 'expansionDetail';
      subjectId: ExpansionSubjectId;
      variantId: ExpansionVariantId;
    }
  | {
      kind: 'expansionLaunching';
      subjectId: ExpansionSubjectId;
      variantId: ExpansionVariantId;
    }
  | {
      kind: 'expansionPlanets';
      subjectId: ExpansionSubjectId;
      variantId: ExpansionVariantId;
      resumePlanetKey?: string;
    }
  | {
      kind: 'expansionOutline';
      subjectId: ExpansionSubjectId;
      variantId: ExpansionVariantId;
      planetKey: string;
      resumeTopicId?: string;
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

type SavedExpansionResume = SavedExpansionView & {
  planetKey: string;
  topicId: string;
};

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

function isSavedExpansionResume(
  saved: SavedExpansionView | null,
): saved is SavedExpansionResume {
  return !!saved?.planetKey && !!saved.topicId && isValidSavedExpansionView(saved);
}

function readSavedExpansionResume(subjectId: ExpansionSubjectId) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LAST_EXPANSION_RESUME_KEY);
    const saved = raw ? (JSON.parse(raw) as SavedExpansionView) : null;
    if (saved?.subjectId === subjectId && isSavedExpansionResume(saved)) {
      return saved;
    }
  } catch {
    // Fall through to the legacy view key below.
  }

  const legacySaved = readSavedExpansionView(subjectId);
  return isSavedExpansionResume(legacySaved) ? legacySaved : null;
}

function expansionResumeView(
  subjectId: ExpansionSubjectId,
  resume: SavedExpansionResume,
): View {
  return {
    kind: 'expansionOutline',
    subjectId,
    variantId: resume.variantId,
    planetKey: resume.planetKey,
    resumeTopicId: resume.topicId,
  };
}

function initialExpansionView(subjectId: ExpansionSubjectId): View {
  const resume = readSavedExpansionResume(subjectId);
  if (resume) {
    return expansionResumeView(subjectId, resume);
  }

  const saved = readSavedExpansionView(subjectId);
  const variantId = saved?.variantId ?? preferredExpansionVariant(subjectId);
  if (saved?.planetKey && saved.topicId) {
    return {
      kind: 'expansionOutline',
      subjectId,
      variantId,
      planetKey: saved.planetKey,
      resumeTopicId: saved.topicId,
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
  const resumeTopicId =
    view.kind === 'expansionConcept'
      ? view.topicId
      : view.kind === 'expansionOutline'
        ? view.resumeTopicId
        : undefined;
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
    if (
      (view.kind === 'expansionConcept' || view.kind === 'expansionOutline') &&
      resumeTopicId
    ) {
      window.localStorage.setItem(
        LAST_EXPANSION_RESUME_KEY,
        JSON.stringify({
          subjectId: view.subjectId,
          variantId: view.variantId,
          planetKey: view.planetKey,
          topicId: resumeTopicId,
        } satisfies SavedExpansionResume),
      );
    }
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
      const resume = readSavedExpansionResume(view.subjectId);
      setView(
        resume && resume.variantId === view.variantId
          ? expansionResumeView(view.subjectId, resume)
          : {
              kind: 'expansionPlanets',
              subjectId: view.subjectId,
              variantId: view.variantId,
            },
      );
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
      view.kind !== 'expansionDetail' &&
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
  const selectedExpansion =
    view.kind === 'expansionDetail' || view.kind === 'expansionLaunching'
      ? {
          subject: EXPANSION_SUBJECTS[view.subjectId],
          variant:
            EXPANSION_SUBJECTS[view.subjectId].variants.find(
              (item) => item.id === view.variantId,
            ) ?? EXPANSION_SUBJECTS[view.subjectId].variants[0],
        }
      : null;
  const launchingExpansion =
    view.kind === 'expansionLaunching' ? selectedExpansion : null;
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
    const resume = readSavedExpansionResume(expansionSubject.id);
    const resumePlanetKey =
      view.resumePlanetKey ??
      (resume?.variantId === variant.id ? resume.planetKey : undefined);
    return (
      <ExpansionPlanetScreen
        subject={expansionSubject}
        variant={variant}
        resumePlanetKey={resumePlanetKey}
        onBack={() => setView({ kind: 'overview' })}
        onSelectPlanet={(planetKey) =>
          setView({
            kind: 'expansionOutline',
            subjectId: expansionSubject.id,
            variantId: variant.id,
            planetKey,
            ...(resume?.variantId === variant.id &&
            resume.planetKey === planetKey
              ? { resumeTopicId: resume.topicId }
              : {}),
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
          resumePlanetKey={view.planetKey}
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
        progress={progress}
        resumeTopicId={view.resumeTopicId}
        onBack={() =>
          setView({
            kind: 'expansionPlanets',
            subjectId: expansionSubject.id,
            variantId: variant.id,
            resumePlanetKey: planet.key,
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
          resumePlanetKey={view.planetKey}
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
            resumeTopicId: view.topicId,
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
            background: 'var(--game-ambient-media-overlay-blur)',
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
                    kind: 'expansionDetail',
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
      {selectedExpansion ? (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center p-4 md:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLaunching) handleBack();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedExpansion.variant.title} 과목 정보`}
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: 'rgba(1,8,40,0.62)',
              backdropFilter: 'blur(14px) saturate(110%)',
              WebkitBackdropFilter: 'blur(14px) saturate(110%)',
            }}
          />
          <div className="relative w-full max-w-[460px]">
            <ExpansionSubjectInfoPanel
              subject={selectedExpansion.subject}
              variant={selectedExpansion.variant}
              launching={isLaunching}
              onBack={handleBack}
              onPlay={() =>
                setView({
                  kind: 'expansionLaunching',
                  subjectId: selectedExpansion.subject.id,
                  variantId: selectedExpansion.variant.id,
                })
              }
            />
          </div>
        </div>
      ) : null}

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

function ExpansionSubjectInfoPanel({
  subject,
  variant,
  launching,
  onBack,
  onPlay,
}: {
  subject: ExpansionSubjectConfig;
  variant: ExpansionVariant;
  launching: boolean;
  onBack: () => void;
  onPlay: () => void;
}) {
  const planets = subject.planets.filter((planet) =>
    planet.variantIds.includes(variant.id),
  );
  const totalSections = planets.reduce(
    (sum, planet) => sum + planet.sections.length,
    0,
  );
  const totalTopics = planets.reduce(
    (sum, planet) =>
      sum +
      planet.sections.reduce(
        (sectionSum, section) => sectionSum + section.topics.length,
        0,
      ),
    0,
  );
  const intro =
    variant.id === 'grade-1'
      ? '컴퓨터 일반, 스프레드시트 일반, 데이터베이스 일반까지 1급 필기 범위를 행성 로드맵으로 나눠서 들어가요.'
      : '컴퓨터 일반과 스프레드시트 일반을 먼저 열고, 2급 필기 범위를 짧은 토픽 단위로 따라가요.';

  return (
    <div className="panel-slide-up">
      <div
        className="relative overflow-hidden rounded-[20px]"
        style={{
          padding: '24px 22px 24px',
          color: FG,
          background:
            'linear-gradient(135deg, rgba(15,25,50,0.72) 0%, rgba(15,25,50,0.55) 100%)',
          backdropFilter: 'blur(28px) saturate(170%)',
          WebkitBackdropFilter: 'blur(28px) saturate(170%)',
          border: `1px solid rgba(${subject.accentRgb}, 0.3)`,
          boxShadow: `0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(${subject.accentRgb}, 0.25)`,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          disabled={launching}
          aria-label="닫기"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[rgba(255,255,255,0.12)] disabled:opacity-40"
          style={{ color: FG }}
        >
          <X size={16} strokeWidth={2} />
        </button>

        <div className="flex items-baseline gap-3 pr-8">
          <span
            className="kr-heading text-[28px] uppercase leading-none md:text-[34px]"
            style={{ letterSpacing: '0.005em', color: subject.accent }}
          >
            {variant.title}
          </span>
          <span
            className="kr-heading text-[10px] uppercase md:text-[11px]"
            style={{ letterSpacing: '0.16em', color: FG_SOFT }}
          >
            {subject.routeLabel}
          </span>
        </div>

        <h3
          className="kr-heading mt-2 text-[14px] uppercase leading-tight md:text-[15px]"
          style={{ letterSpacing: '0.04em', color: FG }}
        >
          {variant.subtitle}
        </h3>

        <p
          className="kr-body mt-3 text-[12px] leading-[1.7] md:text-[13px]"
          style={{ color: FG_SOFT }}
        >
          {intro}
        </p>

        <div
          className="mt-3 flex flex-wrap items-center gap-2 kr-heading text-[10px] uppercase"
          style={{ letterSpacing: '0.13em', color: FG_SOFT }}
        >
          <span>{variant.meta}</span>
          <span style={{ color: FG_DIM }}>·</span>
          <span>섹션 {totalSections}</span>
          <span style={{ color: FG_DIM }}>·</span>
          <span>토픽 {totalTopics}</span>
        </div>

        <div className="mt-5 space-y-2">
          {planets.map((planet, index) => (
            <div
              key={planet.key}
              className="flex items-center justify-between gap-3 rounded-[12px] border px-3.5 py-2.5"
              style={{
                borderColor: 'rgba(239,244,255,0.12)',
                background: 'rgba(239,244,255,0.04)',
              }}
            >
              <div className="min-w-0">
                <p
                  className="kr-num text-[10px] uppercase"
                  style={{ letterSpacing: '0.14em', color: subject.accent }}
                >
                  Planet {index + 1}
                </p>
                <p className="kr-body mt-1 truncate text-[12.5px] font-semibold text-cream/90">
                  {planet.title}
                </p>
              </div>
              <span
                className="kr-num shrink-0 text-[11px]"
                style={{ color: FG_SOFT }}
              >
                {planet.sections.reduce(
                  (sum, section) => sum + section.topics.length,
                  0,
                )}
                토픽
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={onPlay}
            disabled={launching}
            aria-label={`${variant.title} 시작하기`}
            className="kr-heading inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-[12px] uppercase tracking-widest transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 md:text-[13px]"
            style={{
              background: subject.accent,
              color: '#0a0f1f',
              letterSpacing: '0.16em',
              boxShadow: `0 6px 18px rgba(${subject.accentRgb}, 0.45)`,
            }}
          >
            {launching ? '워프 중' : `${variant.shortLabel} 시작하기`}
            {!launching ? <ChevronRight size={15} strokeWidth={2.4} /> : null}
          </button>
          <button
            type="button"
            onClick={onBack}
            disabled={launching}
            className="kr-heading shrink-0 rounded-full px-4 py-3 text-[10px] uppercase transition hover:bg-[rgba(255,255,255,0.1)] disabled:opacity-40 md:text-[11px]"
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
      </div>
    </div>
  );
}

function ExpansionPlanetScreen({
  subject,
  variant,
  resumePlanetKey,
  onBack,
  onSelectPlanet,
}: {
  subject: ExpansionSubjectConfig;
  variant: ExpansionVariant;
  resumePlanetKey?: string;
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
            resumePlanetKey={resumePlanetKey}
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
  resumePlanetKey,
  onSelectPlanet,
}: {
  planets: ExpansionPlanet[];
  accent: string;
  resumePlanetKey?: string;
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
          stroke="rgba(94,237,223,0.54)"
          strokeWidth={2.5}
          strokeDasharray="2 7"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 8px rgba(94,237,223,0.36))' }}
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
          isResumeTarget={node.planet.key === resumePlanetKey}
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
  isResumeTarget,
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
  isResumeTarget: boolean;
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
            stroke="var(--game-node-ring)"
            strokeWidth={3}
          />
        </svg>

        <button
          type="button"
          onClick={() => onSelect(planetKey)}
          aria-label={`${title} 과목${isResumeTarget ? ' (학습 복귀 — 여기서부터)' : ''}`}
          className={`absolute rounded-full inline-flex items-center justify-center transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon${
            isResumeTarget ? ' qd-pulse-ring qd-pulse-ring-resume' : ''
          }`}
          style={{
            inset: 6,
            background: 'var(--game-node-bg-strong)',
            border: '1px solid var(--game-node-border)',
            boxShadow: 'var(--game-node-shadow-strong)',
          }}
        >
          <span
            aria-hidden
            className="absolute inset-1 rounded-full pointer-events-none"
            style={{
              border: '1px solid rgba(111,255,232,0.32)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -2px 6px rgba(0,0,0,0.22)',
            }}
          />
          <span
            className="kr-num leading-none relative"
            style={{
              fontSize: NODE * 0.36,
              fontWeight: 600,
              color: 'var(--game-node-text)',
              textShadow: '0 1px 2px rgba(0,0,0,0.55)',
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
          className="kr-num text-[11px] text-cream/65 mt-1.5 inline-flex flex-wrap items-center justify-center gap-1.5"
          style={{ textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}
        >
          <span>{subtitle}</span>
          {isResumeTarget ? (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 kr-heading text-[9px] uppercase tracking-widest"
              style={{
                color: accent,
                background: `${accent}18`,
                border: `1px solid ${accent}66`,
                boxShadow: `0 6px 18px -14px ${accent}`,
              }}
            >
              <Target size={9} strokeWidth={2.8} />
              여기서 시작
            </span>
          ) : null}
        </div>
      </div>
    </>
  );
}

function ExpansionOutlineScreen({
  subject,
  variant,
  planet,
  progress,
  resumeTopicId,
  onBack,
  onSubjectBack,
  onSelectTopic,
}: {
  subject: ExpansionSubjectConfig;
  variant: ExpansionVariant;
  planet: ExpansionPlanet;
  progress: ProgressStore;
  resumeTopicId?: string;
  onBack: () => void;
  onSubjectBack: () => void;
  onSelectTopic: (topicId: string) => void;
}) {
  const totalTopics = planet.sections.reduce(
    (sum, section) => sum + section.topics.length,
    0,
  );
  const outlineTopics = planet.sections.flatMap((section) => section.topics);
  const studyStats = outlineTopics.reduce(
    (stats, topic) => {
      const cards = getComhwalTopicCards(planet.key, topic.id);
      const questionCount = cards.filter((card) => card.question).length;
      return {
        readyTopics: stats.readyTopics + (cards.length > 0 ? 1 : 0),
        totalCards: stats.totalCards + cards.length,
        totalQuestions: stats.totalQuestions + questionCount,
      };
    },
    { readyTopics: 0, totalCards: 0, totalQuestions: 0 },
  );
  const isFullyReady = studyStats.readyTopics === totalTopics;

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
        <header className="mb-10 max-w-[680px] md:mb-12">
          <button
            type="button"
            onClick={onBack}
            aria-label="행성으로 돌아가기"
            className="game-back-button mb-5 inline-flex items-center gap-2 kr-heading text-[11px] uppercase tracking-widest transition"
          >
            <ArrowLeft size={14} strokeWidth={2.4} />
            행성으로
          </button>

          <div className="mb-3 flex flex-wrap items-center gap-2 kr-heading text-[10px] uppercase tracking-widest text-cream/55">
            <span style={{ color: subject.accent }}>{variant.shortLabel}</span>
            <span className="text-cream/30">›</span>
            <span className="text-cream/70">{planet.subtitle}</span>
          </div>

          <h1 className="kr-heading text-[26px] uppercase leading-[1.12] tracking-[0.01em] drop-shadow-[0_2px_20px_rgba(0,0,0,0.75)] md:text-[36px] lg:text-[44px]">
            {planet.title}
          </h1>
          <p className="kr-body mt-3 max-w-xl text-[13px] leading-[1.65] text-cream/78 md:text-[14px]">
            동그라미를 순서대로 눌러봐. 짧은 개념을 보고, 바로 한 문제로
            이해했는지 확인해.
          </p>

          <div className="mt-4 flex items-center gap-2 kr-num text-[10px] uppercase tracking-widest text-cream/50">
            <span style={{ color: subject.accent }}>
              {planet.sections.length}단원
            </span>
            <span className="text-cream/25">·</span>
            <span>{totalTopics}개 토픽</span>
            <span className="text-cream/25">·</span>
            <span>{studyStats.totalCards}개 카드</span>
            <span className="text-cream/25">·</span>
            <span>{studyStats.totalQuestions}개 확인 문제</span>
            {!isFullyReady ? (
              <>
                <span className="text-cream/25">·</span>
                <span>{studyStats.readyTopics}개 개념 열림</span>
              </>
            ) : null}
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
              progress={progress}
              resumeTopicId={resumeTopicId}
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
  progress,
  resumeTopicId,
  onSelectTopic,
}: {
  index: number;
  title: string;
  planetKey: string;
  topics: ExpansionPlanet['sections'][number]['topics'];
  accent: string;
  progress: ProgressStore;
  resumeTopicId?: string;
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
            progress={progress}
            isResumeTarget={topic.id === resumeTopicId}
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
  progress,
  isResumeTarget,
  isLast,
  onSelectTopic,
}: {
  n: number;
  planetKey: string;
  topicId: string;
  title: string;
  accent: string;
  progress: ProgressStore;
  isResumeTarget: boolean;
  isLast: boolean;
  onSelectTopic: (topicId: string) => void;
}) {
  const cards = getComhwalTopicCards(planetKey, topicId);
  const cardCount = cards.length;
  const questionCards = cards.filter((card) => card.question);
  const completedQuestionCount = questionCards.reduce((count, card) => {
    const questionId = card.question?.id;
    if (!questionId) return count;
    return count + (hasEverSolved(progress.questionStats[questionId]) ? 1 : 0);
  }, 0);
  const attempted = questionCards.some((card) => {
    const questionId = card.question?.id;
    if (!questionId) return false;
    return (progress.questionStats[questionId]?.attempts ?? 0) > 0;
  });
  const completed =
    questionCards.length > 0 && completedQuestionCount === questionCards.length;
  const isReady = cardCount > 0;
  const nodeBackground = completed
    ? `linear-gradient(180deg, ${accent} 0%, color-mix(in srgb, ${accent} 76%, #010828) 100%)`
    : attempted
      ? `linear-gradient(180deg, color-mix(in srgb, ${accent} 30%, rgba(16,35,82,0.94)) 0%, rgba(9,21,58,0.92) 100%)`
      : `linear-gradient(180deg, color-mix(in srgb, ${accent} 16%, rgba(16,35,82,0.90)) 0%, rgba(9,21,58,0.90) 100%)`;
  const nodeBorder = completed || attempted
    ? `2px solid color-mix(in srgb, ${accent} 68%, transparent)`
    : `1.5px solid color-mix(in srgb, ${accent} 44%, transparent)`;
  const nodeShadow = completed
    ? `0 0 0 3px color-mix(in srgb, ${accent} 16%, transparent), 0 14px 34px -16px color-mix(in srgb, ${accent} 70%, transparent), inset 0 1px 0 rgba(255,255,255,0.22)`
    : attempted
      ? `0 0 0 3px color-mix(in srgb, ${accent} 12%, transparent), 0 12px 30px -16px color-mix(in srgb, ${accent} 58%, transparent), inset 0 1px 0 rgba(255,255,255,0.16)`
      : `0 10px 28px -16px color-mix(in srgb, ${accent} 48%, transparent), inset 0 1px 0 rgba(255,255,255,0.14)`;

  return (
    <button
      type="button"
      className="group flex w-full text-left disabled:cursor-not-allowed disabled:opacity-60"
      disabled={!isReady}
      onClick={() => onSelectTopic(topicId)}
      aria-label={
        isReady
          ? `${title} 개념 카드 열기${isResumeTarget ? ' (학습 복귀 — 여기서부터)' : ''}`
          : `${title} 개념 준비 중`
      }
    >
      <div className="mr-4 flex flex-col items-center md:mr-5">
        <span
          aria-hidden
          className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full md:h-12 md:w-12${
            isResumeTarget ? ' qd-pulse-ring qd-pulse-ring-resume' : ''
          }`}
          style={{
            background: nodeBackground,
            border: nodeBorder,
            color: completed
              ? '#07121f'
              : 'var(--game-node-text)',
            boxShadow: nodeShadow,
            textShadow: completed ? 'none' : '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          {completed ? (
            <Check size={18} strokeWidth={3} />
          ) : (
            <span className="kr-heading text-[13px] leading-none tabular-nums">
              {n}
            </span>
          )}
        </span>
        {!isLast ? (
          <div
            className="my-1 w-px flex-1"
            style={{
              background: completed
                ? `linear-gradient(180deg, color-mix(in srgb, ${accent} 72%, transparent), color-mix(in srgb, ${accent} 24%, transparent))`
                : 'rgba(239,244,255,0.30)',
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
            color: completed ? 'rgba(239,244,255,0.9)' : 'var(--cream)',
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
          {isReady && questionCards.length > 0 ? (
            <>
              <span style={{ color: 'rgba(239,244,255,0.4)' }}>·</span>
              {completed ? (
                <span
                  className="inline-flex items-center gap-1 kr-heading text-[9px] uppercase tracking-widest"
                  style={{ color: accent }}
                >
                  <Check size={10} strokeWidth={3} />
                  완료
                </span>
              ) : (
                <span
                  className="kr-num uppercase tracking-widest text-[9px]"
                  style={{
                    color: attempted
                      ? 'rgba(239,244,255,0.86)'
                      : 'rgba(239,244,255,0.58)',
                  }}
                >
                  확인 {completedQuestionCount}/{questionCards.length}
                </span>
              )}
            </>
          ) : null}
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
          {isResumeTarget ? (
            <>
              <span style={{ color: 'rgba(239,244,255,0.4)' }}>·</span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 kr-heading text-[9px] uppercase tracking-widest"
                style={{
                  color: accent,
                  background: `${accent}18`,
                  border: `1px solid ${accent}66`,
                  boxShadow: `0 6px 18px -14px ${accent}`,
                }}
              >
                <Target size={9} strokeWidth={2.8} />
                여기서 시작
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
  selectedAnswer,
  onSelectAnswer,
}: {
  question: NonNullable<ComhwalConceptCard['question']>;
  selectedAnswer?: number;
  onSelectAnswer: (choiceIndex: number) => void;
}) {
  const hasAnswered = selectedAnswer !== undefined;

  return (
    <div className="mt-8 w-full max-w-[560px]">
      <OptionsPanel
        choices={question.choices}
        chosen={selectedAnswer ?? null}
        correctIndex={hasAnswered ? question.answerIndex : null}
        graded={hasAnswered}
        onChoose={onSelectAnswer}
      />
    </div>
  );
}

function getComhwalStepKey(card: ComhwalConceptCard): string | null {
  const match = COMHWAL_CARD_ID_RE.exec(card.id);
  if (!match) return null;
  return `comhwal-${match[1]}-${match[2]}-s${Number(match[3])}`;
}

type ComhwalVisualModel = {
  eyebrow: string;
  title: string;
  lead: string;
  flow: string[];
  chips: string[];
  pattern?: string;
  kind?: string;
  focus?: ComhwalVisualFocus;
  focusLabel?: string;
  mode?:
    | 'manager'
    | 'windows'
    | 'cards'
    | 'document'
    | 'sheet-grid'
    | 'formula'
    | 'chart'
    | 'database-table';
};

function getComhwalVisualModel(card: ComhwalConceptCard): ComhwalVisualModel {
  switch (card.visualHint) {
    case 'windows-os-map':
      return {
        eyebrow: 'OS MAP',
        title: '사람 말과 컴퓨터 일을 이어 줘',
        lead: '운영체제가 가운데서 부품이 알아들을 말로 바꿔 줘.',
        flow: ['사용자', '운영체제', '앱·파일·장치'],
        chips: ['명령 전달', '자원 정리', '화면 표시'],
        mode: 'windows',
      };
    case 'windows-os-role':
      return {
        eyebrow: 'OS ROLE',
        title: '운영체제는 총관리자야',
        lead: '앱, 파일, 장치가 서로 부딪히지 않게 순서와 자리를 정리해.',
        flow: ['앱 실행', '파일 자리', '장치 연결'],
        chips: ['순서 관리', '자리 배정', '충돌 방지'],
        mode: 'manager',
      };
    case 'windows-app-file':
      return {
        eyebrow: 'FILE TO APP',
        title: '파일을 누르면 맞는 앱으로 이어 줘',
        lead: '문서 파일을 누르면 Windows가 열 앱을 찾아 연결해 줘.',
        flow: ['문서 파일', 'Windows', '맞는 앱 실행'],
        chips: ['파일 연결', '앱 실행', '사용자 대신 판단'],
        mode: 'windows',
      };
    case 'gui-window-icons':
      return {
        eyebrow: 'GUI',
        title: '글자 명령 대신 화면으로 조작해',
        lead: '아이콘, 창, 버튼을 보고 마우스나 터치로 누르는 방식이야.',
        flow: ['아이콘', '창', '마우스·터치'],
        chips: ['눈으로 확인', '클릭', '드래그'],
        mode: 'cards',
      };
    case 'multitasking-switch':
      return {
        eyebrow: 'MULTITASKING',
        title: '여러 일을 번갈아 챙겨 줘',
        lead: '문서, 음악, 브라우저를 함께 켜도 운영체제가 순서를 나눠 줘.',
        flow: ['문서', '음악', '브라우저'],
        chips: ['창 전환', '동시 실행', '순서 분배'],
        mode: 'cards',
      };
    case 'plug-and-play-device':
      return {
        eyebrow: 'PLUG & PLAY',
        title: '꽂으면 먼저 알아봐 줘',
        lead: 'USB 같은 장치를 연결하면 Windows가 인식하고 쓸 준비를 도와줘.',
        flow: ['장치 연결', '자동 인식', '사용 준비'],
        chips: ['USB', '드라이버', '장치 관리자'],
        mode: 'windows',
      };
    case 'ole-document-link':
      return {
        eyebrow: 'OLE',
        title: '다른 앱 자료를 문서 안에 넣어',
        lead: '워드 문서 안에 엑셀 차트처럼 다른 앱 자료를 함께 쓸 수 있어.',
        flow: ['엑셀 차트', '문서 안에 포함', '같이 사용'],
        chips: ['개체 연결', '개체 포함', '문서 활용'],
        mode: 'document',
      };
    default:
      break;
  }

  return getComhwalExpansionVisualModel(card);
}

function ComhwalFlowNode({
  label,
  accent,
  active = false,
}: {
  label: string;
  accent: string;
  active?: boolean;
}) {
  return (
    <div
      className="relative flex min-h-[58px] min-w-0 flex-1 items-center justify-center rounded-2xl border px-2 text-center"
      style={{
        borderColor: active ? accent : 'rgba(239,244,255,0.18)',
        background: active
          ? `linear-gradient(180deg, color-mix(in srgb, ${accent} 28%, rgba(1,8,40,0.92)), rgba(1,8,40,0.78))`
          : 'rgba(239,244,255,0.055)',
        boxShadow: active ? `0 0 0 1px color-mix(in srgb, ${accent} 45%, transparent)` : 'none',
      }}
    >
      <span className="kr-heading text-[12px] leading-snug text-cream md:text-[13px]">
        {label}
      </span>
    </div>
  );
}

function ComhwalMiniSpreadsheet({ accent }: { accent: string }) {
  const rows = [
    ['', 'A', 'B', 'C'],
    ['1', '셀 A1', '', ''],
    ['2', '', '', ''],
    ['3', '', '', ''],
  ];

  return (
    <div
      className="mt-4 rounded-[22px] border p-3"
      style={{
        borderColor: 'rgba(239,244,255,0.16)',
        background: 'rgba(1,8,40,0.28)',
      }}
    >
      <div
        className="grid grid-cols-4 overflow-hidden rounded-2xl border text-center"
        style={{ borderColor: 'rgba(239,244,255,0.16)' }}
      >
        {rows.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isHeader = rowIndex === 0 || colIndex === 0;
            const isActive = rowIndex === 1 && colIndex === 1;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="flex min-h-[38px] items-center justify-center border-r border-b px-1 kr-heading text-[11px] last:border-r-0"
                style={{
                  borderColor: 'rgba(239,244,255,0.12)',
                  color: isActive ? '#07121f' : 'rgba(239,244,255,0.82)',
                  background: isActive
                    ? `linear-gradient(180deg, ${accent}, color-mix(in srgb, ${accent} 74%, #010828))`
                    : isHeader
                      ? 'rgba(239,244,255,0.12)'
                      : 'rgba(239,244,255,0.045)',
                }}
              >
                {cell || (isHeader ? '' : '·')}
              </div>
            );
          }),
        )}
      </div>
      <p className="kr-body mt-3 text-center text-[11.5px] text-cream/62">
        열 문자와 행 번호가 만나 한 칸 주소가 돼
      </p>
    </div>
  );
}

function ComhwalFormulaDiagram({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  return (
    <div
      className="mt-4 rounded-[22px] border p-3"
      style={{
        borderColor: 'rgba(239,244,255,0.16)',
        background: 'rgba(1,8,40,0.28)',
      }}
    >
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-2">
        {model.flow.slice(0, 3).map((item, index) => (
          <div key={`${item}-${index}`} className="contents">
            <ComhwalFlowNode label={item} accent={accent} active={index === 1} />
            {index < 2 ? (
              <div className="flex items-center justify-center">
                <ArrowRight size={16} strokeWidth={2.5} style={{ color: accent }} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div
        className="mt-3 rounded-2xl border px-3 py-2 kr-num text-[12px] text-cream/82"
        style={{
          borderColor: 'rgba(239,244,255,0.14)',
          background: 'rgba(239,244,255,0.06)',
        }}
      >
        = {model.flow[1]}({model.flow[0]}) → {model.flow[2]}
      </div>
    </div>
  );
}

function ComhwalChartDiagram({ accent }: { accent: string }) {
  const bars = [54, 78, 38, 66];

  return (
    <div
      className="mt-4 rounded-[22px] border p-3"
      style={{
        borderColor: 'rgba(239,244,255,0.16)',
        background: 'rgba(1,8,40,0.28)',
      }}
    >
      <div
        className="flex h-[118px] items-end justify-center gap-4 rounded-2xl border px-5 py-4"
        style={{
          borderColor: 'rgba(239,244,255,0.12)',
          background:
            'linear-gradient(180deg, rgba(239,244,255,0.08), rgba(239,244,255,0.025))',
        }}
      >
        {bars.map((height, index) => (
          <div key={`${height}-${index}`} className="flex h-full flex-1 items-end justify-center">
            <span
              className="w-full max-w-[34px] rounded-t-xl"
              style={{
                height: `${height}%`,
                background: index === 1 ? accent : 'rgba(239,244,255,0.34)',
                boxShadow:
                  index === 1
                    ? `0 0 18px color-mix(in srgb, ${accent} 35%, transparent)`
                    : 'none',
              }}
            />
          </div>
        ))}
      </div>
      <p className="kr-body mt-3 text-center text-[11.5px] text-cream/62">
        숫자 차이를 막대 높이로 바로 비교해
      </p>
    </div>
  );
}

function ComhwalDatabaseDiagram({ accent }: { accent: string }) {
  return (
    <div
      className="mt-4 rounded-[22px] border p-3"
      style={{
        borderColor: 'rgba(239,244,255,0.16)',
        background: 'rgba(1,8,40,0.28)',
      }}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {['고객 테이블', '주문 테이블'].map((title, index) => (
          <div
            key={title}
            className="overflow-hidden rounded-2xl border"
            style={{
              borderColor: index === 0 ? accent : 'rgba(239,244,255,0.2)',
            }}
          >
            <div
              className="px-3 py-2 kr-heading text-[11px] text-cream/90"
              style={{
                background:
                  index === 0
                    ? `color-mix(in srgb, ${accent} 26%, rgba(1,8,40,0.8))`
                    : 'rgba(239,244,255,0.08)',
              }}
            >
              {title}
            </div>
            {['ID', '이름', index === 0 ? '등급' : '고객ID'].map((row) => (
              <div
                key={row}
                className="border-t px-3 py-1.5 kr-body text-[11px] text-cream/68"
                style={{ borderColor: 'rgba(239,244,255,0.1)' }}
              >
                {row}
              </div>
            ))}
          </div>
        ))}
        <ArrowRight size={16} strokeWidth={2.5} style={{ color: accent }} />
      </div>
      <p className="kr-body mt-3 text-center text-[11.5px] text-cream/62">
        공통 키가 두 테이블을 이어 줘
      </p>
    </div>
  );
}

function ComhwalDiagramFrame({
  accent,
  children,
}: {
  accent: string;
  children: ReactNode;
}) {
  return (
    <div
      className="mt-4 overflow-hidden rounded-[22px] border p-3"
      style={{
        borderColor: 'rgba(239,244,255,0.16)',
        background:
          'radial-gradient(circle at 22% 0%, rgba(239,244,255,0.12), transparent 42%), rgba(1,8,40,0.28)',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 38px color-mix(in srgb, ${accent} 10%, transparent)`,
      }}
    >
      {children}
    </div>
  );
}

function ComhwalMiniCell({
  children,
  accent,
  active = false,
  focus = false,
  className = '',
}: {
  children?: React.ReactNode;
  accent: string;
  active?: boolean;
  focus?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative flex min-h-[34px] items-center justify-center rounded-xl border px-2 text-center kr-heading text-[11px] leading-tight ${className}`}
      style={{
        borderColor: active || focus ? accent : 'rgba(239,244,255,0.14)',
        borderWidth: focus && !active ? 2 : 1,
        color: active ? '#07121f' : 'rgba(239,244,255,0.86)',
        background: active
          ? `linear-gradient(180deg, ${accent}, color-mix(in srgb, ${accent} 72%, #010828))`
          : focus
            ? `linear-gradient(180deg, color-mix(in srgb, ${accent} 18%, rgba(239,244,255,0.08)), rgba(239,244,255,0.045))`
            : 'rgba(239,244,255,0.06)',
        boxShadow: active || focus
          ? `0 0 18px color-mix(in srgb, ${accent} 32%, transparent)`
          : 'none',
      }}
    >
      {children}
      {focus && !active ? (
        <span
          aria-hidden
          className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full"
          style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
        />
      ) : null}
    </div>
  );
}

function hasComhwalFocus(
  model: ComhwalVisualModel,
  ...focuses: ComhwalVisualFocus[]
) {
  return model.focus ? focuses.includes(model.focus) : false;
}

function getComhwalFlowFocusIndex(model: ComhwalVisualModel) {
  switch (model.focus) {
    case 'ribbon':
    case 'workbook':
    case 'input-value':
    case 'error':
    case 'chart-data':
    case 'table':
    case 'select':
    case 'form':
    case 'report':
    case 'event':
      return 0;
    case 'formula-bar':
    case 'format':
    case 'condition':
    case 'absolute-reference':
    case 'function':
    case 'criteria':
    case 'chart-element':
    case 'page':
    case 'sort':
    case 'subtotal':
    case 'pivot-field':
    case 'dbms':
    case 'key':
    case 'relationship':
    case 'where':
    case 'order':
    case 'group':
    case 'join':
    case 'property':
    case 'control':
    case 'macro':
    case 'recordset':
      return 1;
    case 'sheet-tab':
    case 'worksheet':
    case 'cell':
    case 'pointer':
    case 'fill-handle':
    case 'search':
    case 'protect':
    case 'result':
    case 'lookup':
    case 'chart-type':
    case 'print':
    case 'filter':
    case 'external-data':
    case 'scenario':
    case 'goal-cell':
    case 'deduplicate':
    case 'foreign-key':
    case 'integrity':
    case 'import':
    case 'export':
    case 'subquery':
    case 'action-query':
    case 'parameter':
    case 'subform':
    case 'section':
    case 'object':
    case 'branch':
      return 2;
    default:
      return 1;
  }
}

function getComhwalPatternVariant(pattern?: string) {
  if (!pattern) return 0;
  return Array.from(pattern).reduce((total, char) => total + char.charCodeAt(0), 0);
}

function ComhwalPatternMotif({
  pattern,
  accent,
  labels,
  activeIndex,
}: {
  pattern?: string;
  accent: string;
  labels: string[];
  activeIndex?: number;
}) {
  const variant = getComhwalPatternVariant(pattern);
  const mode = variant % 6;
  const safeLabels = labels.length > 0 ? labels : ['입력', '처리', '결과'];
  const focusIndex = activeIndex ?? variant % 3;

  if (mode === 0) {
    return (
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: 12 }).map((_, index) => (
          <ComhwalMiniCell
            key={index}
            accent={accent}
            active={index === variant % 12 || index === (variant + 5) % 12}
          >
            {index % 5 === 0 ? safeLabels[index % safeLabels.length] : ''}
          </ComhwalMiniCell>
        ))}
      </div>
    );
  }

  if (mode === 1) {
    return (
      <div className="relative mx-auto h-[126px] max-w-[280px]">
        <div
          className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{ borderColor: accent, background: 'rgba(239,244,255,0.06)' }}
        />
        {safeLabels.slice(0, 3).map((label, index) => (
          <div
            key={label}
            className="absolute rounded-2xl border px-3 py-2 kr-heading text-[10px]"
            style={{
              left: index === 0 ? 0 : index === 1 ? '50%' : 'auto',
              right: index === 2 ? 0 : 'auto',
              top: index === 1 ? 0 : 78,
              transform: index === 1 ? 'translateX(-50%)' : undefined,
              borderColor: index === focusIndex ? accent : 'rgba(239,244,255,0.16)',
              background: index === focusIndex ? accent : 'rgba(239,244,255,0.07)',
              color: index === focusIndex ? '#07121f' : 'rgba(239,244,255,0.76)',
            }}
          >
            {label}
          </div>
        ))}
      </div>
    );
  }

  if (mode === 2) {
    return (
      <div className="space-y-2">
        {safeLabels.slice(0, 3).map((label, index) => (
          <div
            key={label}
            className="rounded-2xl border px-3 py-2 kr-heading text-[11px]"
            style={{
              marginLeft: `${index * 18}px`,
              width: `calc(100% - ${index * 18}px)`,
              borderColor: index === focusIndex ? accent : 'rgba(239,244,255,0.16)',
              background: index === focusIndex ? accent : 'rgba(239,244,255,0.07)',
              color: index === focusIndex ? '#07121f' : 'rgba(239,244,255,0.76)',
            }}
          >
            {label}
          </div>
        ))}
      </div>
    );
  }

  if (mode === 3) {
    return (
      <div className="grid grid-cols-[1fr_76px_1fr] items-center gap-2">
        <div className="grid gap-1.5">
          {safeLabels.slice(0, 2).map((label, index) => (
            <ComhwalMiniCell key={label} accent={accent} active={index === focusIndex}>
              {label}
            </ComhwalMiniCell>
          ))}
        </div>
        <div className="flex items-center justify-center">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 kr-num text-[11px]"
            style={{
              borderColor: accent,
              color: focusIndex === 1 ? '#07121f' : accent,
              background: focusIndex === 1 ? accent : 'rgba(1,8,40,0.18)',
            }}
          >
            {variant % 100}
          </span>
        </div>
        <ComhwalMiniCell accent={accent} active={focusIndex === 2}>
          {safeLabels[2] ?? safeLabels[0]}
        </ComhwalMiniCell>
      </div>
    );
  }

  if (mode === 4) {
    const fill = 38 + (variant % 44);

    return (
      <div className="space-y-3">
        <div className="h-3 overflow-hidden rounded-full bg-cream/10">
          <div className="h-full rounded-full" style={{ width: `${fill}%`, background: accent }} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {safeLabels.slice(0, 3).map((label, index) => (
            <ComhwalMiniCell key={label} accent={accent} active={index === focusIndex}>
              {label}
            </ComhwalMiniCell>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
      {safeLabels.slice(0, 3).map((label, index) => (
        <div key={label} className="contents">
          <ComhwalMiniCell accent={accent} active={index === focusIndex}>
            {label}
          </ComhwalMiniCell>
          {index < 2 ? (
            <ArrowRight size={16} strokeWidth={2.5} style={{ color: accent }} />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ComhwalVisualFlow({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  const focusIndex = getComhwalFlowFocusIndex(model);

  return (
    <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-2">
      {model.flow.slice(0, 3).map((item, index) => (
        <div key={`${item}-${index}`} className="contents">
          <ComhwalFlowNode label={item} accent={accent} active={index === focusIndex} />
          {index < 2 ? (
            <div className="flex items-center justify-center">
              <ArrowRight size={16} strokeWidth={2.5} style={{ color: accent }} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ComhwalSheetPattern({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  const pattern = model.pattern ?? '';

  if (pattern.includes('tabs')) {
    const tabFocus = hasComhwalFocus(model, 'sheet-tab', 'worksheet');
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="rounded-2xl border border-cream/15 bg-cream/[0.04] p-3">
          <div className="mb-3 flex items-center gap-1.5">
            {['Book', 'Sheet1', 'Sheet2'].map((label, index) => (
              <span
                key={label}
                className="rounded-t-xl border px-3 py-1.5 kr-num text-[10px]"
                style={{
                  borderColor:
                    (tabFocus && index === 1) || (hasComhwalFocus(model, 'workbook') && index === 0)
                      ? accent
                      : 'rgba(239,244,255,0.14)',
                  background:
                    (tabFocus && index === 1) || (hasComhwalFocus(model, 'workbook') && index === 0)
                      ? accent
                      : 'rgba(239,244,255,0.06)',
                  color:
                    (tabFocus && index === 1) || (hasComhwalFocus(model, 'workbook') && index === 0)
                      ? '#07121f'
                      : 'rgba(239,244,255,0.72)',
                }}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 12 }).map((_, index) => (
              <ComhwalMiniCell
                key={index}
                accent={accent}
                active={hasComhwalFocus(model, 'cell') && index === 5}
                focus={tabFocus && index === 9}
              >
                {index === 5 ? 'B2' : ''}
              </ComhwalMiniCell>
            ))}
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('input-bar')) {
    const formulaFocus = hasComhwalFocus(model, 'formula-bar', 'function');
    const pointerFocus = hasComhwalFocus(model, 'pointer');
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="space-y-3">
          <div className="grid grid-cols-[70px_1fr] gap-2">
            <ComhwalMiniCell accent={accent} active={hasComhwalFocus(model, 'cell')} focus={pointerFocus}>A1</ComhwalMiniCell>
            <div
              className="relative rounded-xl border px-3 py-2 kr-num text-[12px] text-cream/80"
              style={{
                borderColor: formulaFocus ? accent : 'rgba(239,244,255,0.15)',
                background: formulaFocus
                  ? `color-mix(in srgb, ${accent} 16%, rgba(239,244,255,0.06))`
                  : 'rgba(239,244,255,0.06)',
                boxShadow: formulaFocus
                  ? `0 0 18px color-mix(in srgb, ${accent} 28%, transparent)`
                  : 'none',
              }}
            >
              =SUM(B2:B5)
              {formulaFocus ? (
                <span
                  aria-hidden
                  className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full"
                  style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
                />
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
              <ComhwalMiniCell
                key={index}
                accent={accent}
                active={hasComhwalFocus(model, 'result') && index === 0}
                focus={hasComhwalFocus(model, 'input-value') && index > 0 && index < 4}
              >
                {index === 0 ? '결과' : index + 1}
              </ComhwalMiniCell>
            ))}
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('format') || pattern.includes('custom')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <ComhwalMiniCell accent={accent} focus={hasComhwalFocus(model, 'input-value')}>12000</ComhwalMiniCell>
          <ArrowRight size={18} style={{ color: accent }} />
          <div className="space-y-2">
            {['#,##0', '0.00%', 'yyyy-mm-dd'].map((label, index) => (
              <ComhwalMiniCell
                key={label}
                accent={accent}
                active={hasComhwalFocus(model, 'format') && index === 0}
                focus={hasComhwalFocus(model, 'result') && index === 1}
              >
                {label}
              </ComhwalMiniCell>
            ))}
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('fill-series')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-5 items-center gap-2">
          {['1', '2', '3', '4'].map((label, index) => (
            <ComhwalMiniCell
              key={label}
              accent={accent}
              active={hasComhwalFocus(model, 'input-value') && index === 0}
              focus={hasComhwalFocus(model, 'relative-reference') && index > 0}
            >
              {label}
            </ComhwalMiniCell>
          ))}
          <div className="flex items-center justify-center">
            <span
              className="h-5 w-5 rounded-full border-2"
              style={{
                borderColor: accent,
                background: hasComhwalFocus(model, 'fill-handle') ? accent : 'transparent',
                boxShadow: hasComhwalFocus(model, 'fill-handle')
                  ? `0 0 16px color-mix(in srgb, ${accent} 50%, transparent)`
                  : 'none',
              }}
            />
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('find-lens')) {
    const searchFocus = hasComhwalFocus(model, 'search');
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[1fr_88px] gap-3">
          <div className="rounded-2xl border border-cream/15 bg-cream/[0.04] p-2">
            <div
              className="mb-2 rounded-xl border px-3 py-2 kr-body text-[11px] text-cream/70"
              style={{
                borderColor: searchFocus ? accent : 'rgba(239,244,255,0.15)',
                background: searchFocus
                  ? `color-mix(in srgb, ${accent} 14%, rgba(239,244,255,0.06))`
                  : 'transparent',
              }}
            >
              Ctrl + F
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 9 }).map((_, index) => (
                <ComhwalMiniCell key={index} accent={accent} active={index === 4 && searchFocus}>
                  {index === 4 ? '찾음' : ''}
                </ComhwalMiniCell>
              ))}
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <span className="h-14 w-14 rounded-full border-4" style={{ borderColor: accent }} />
            <span
              className="absolute bottom-7 right-4 h-8 w-1.5 rotate-[-42deg] rounded-full"
              style={{ background: accent }}
            />
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('pointer-routes')) {
    const pointerFocus = hasComhwalFocus(model, 'pointer');
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[1fr_92px] gap-3">
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 12 }).map((_, index) => (
              <ComhwalMiniCell key={index} accent={accent} active={index === 6 && pointerFocus} focus={index === 6 && hasComhwalFocus(model, 'cell')}>
                {index === 6 ? 'C2' : ''}
              </ComhwalMiniCell>
            ))}
          </div>
          <div className="grid grid-cols-3 grid-rows-3 gap-1.5">
            {['', '↑', '', '←', '셀', '→', '', '↓', ''].map((label, index) => (
              <ComhwalMiniCell key={`${label}-${index}`} accent={accent} active={label === '셀' && pointerFocus}>
                {label}
              </ComhwalMiniCell>
            ))}
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('options-panel') || pattern.includes('protect-lock')) {
    const focusIndex = hasComhwalFocus(model, 'option')
      ? 1
      : hasComhwalFocus(model, 'protect')
        ? 2
        : 0;
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[112px_1fr] gap-3">
          <div className="rounded-2xl border border-cream/15 bg-cream/[0.06] p-2">
            {model.flow.map((item, index) => (
              <div
                key={item}
                className="mb-1.5 rounded-xl px-2 py-1.5 kr-heading text-[10px] last:mb-0"
                style={{
                  border: index === focusIndex ? `1px solid ${accent}` : '1px solid transparent',
                  background: index === focusIndex ? accent : 'rgba(239,244,255,0.08)',
                  color: index === focusIndex ? '#07121f' : 'rgba(239,244,255,0.74)',
                }}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center rounded-2xl border border-cream/15 bg-cream/[0.035]">
            <span
              className="relative h-16 w-14 rounded-b-2xl rounded-t-md border-4"
              style={{
                borderColor: accent,
                background: hasComhwalFocus(model, 'protect')
                  ? `color-mix(in srgb, ${accent} 18%, transparent)`
                  : 'transparent',
              }}
            >
              <span
                className="absolute -top-8 left-1/2 h-9 w-9 -translate-x-1/2 rounded-t-full border-4 border-b-0"
                style={{ borderColor: accent }}
              />
            </span>
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('edit-before-after')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <ComhwalMiniCell accent={accent} focus={!hasComhwalFocus(model, 'edit')}>old</ComhwalMiniCell>
          <ArrowRight size={18} style={{ color: accent }} />
          <ComhwalMiniCell accent={accent} active={hasComhwalFocus(model, 'edit')}>new</ComhwalMiniCell>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('conditional-heatmap')) {
    const conditionFocus = hasComhwalFocus(model, 'condition');
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-5 gap-1.5">
          {[12, 38, 64, 82, 95, 22, 58, 73, 40, 88].map((value, index) => (
            <div
              key={`${value}-${index}`}
              className="flex min-h-[32px] items-center justify-center rounded-xl kr-num text-[10px]"
              style={{
                outline: conditionFocus && value > 70 ? `2px solid ${accent}` : 'none',
                outlineOffset: 1,
                color: value > 70 ? '#07121f' : 'rgba(239,244,255,0.72)',
                background:
                  value > 70
                    ? accent
                    : value > 45
                      ? `color-mix(in srgb, ${accent} 34%, rgba(239,244,255,0.08))`
                      : 'rgba(239,244,255,0.06)',
              }}
            >
              {value}
            </div>
          ))}
        </div>
      </ComhwalDiagramFrame>
    );
  }

  return (
    <ComhwalDiagramFrame accent={accent}>
      <div className="space-y-2">
        <div
          className="rounded-xl border px-3 py-2 kr-heading text-[10px]"
          style={{
            borderColor: hasComhwalFocus(model, 'ribbon') ? accent : 'rgba(239,244,255,0.14)',
            background: hasComhwalFocus(model, 'ribbon')
              ? `color-mix(in srgb, ${accent} 18%, rgba(239,244,255,0.06))`
              : 'rgba(239,244,255,0.06)',
            color: hasComhwalFocus(model, 'ribbon') ? 'rgba(239,244,255,0.96)' : 'rgba(239,244,255,0.68)',
          }}
        >
          홈 · 삽입 · 수식
        </div>
        <div className="grid grid-cols-[74px_1fr] gap-2">
          <ComhwalMiniCell accent={accent} focus={hasComhwalFocus(model, 'name-box')}>
            A1
          </ComhwalMiniCell>
          <div
            className="relative rounded-xl border px-3 py-2 kr-num text-[11px]"
            style={{
              borderColor: hasComhwalFocus(model, 'formula-bar') ? accent : 'rgba(239,244,255,0.14)',
              background: hasComhwalFocus(model, 'formula-bar')
                ? `color-mix(in srgb, ${accent} 16%, rgba(239,244,255,0.06))`
                : 'rgba(239,244,255,0.055)',
              color: 'rgba(239,244,255,0.78)',
              boxShadow: hasComhwalFocus(model, 'formula-bar')
                ? `0 0 18px color-mix(in srgb, ${accent} 28%, transparent)`
                : 'none',
            }}
          >
            fx  =A1
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {['', 'A', 'B', 'C', '1', 'A1', '', '', '2', '', '', '', '3', '', '', ''].map(
            (label, index) => {
              const isHeader = !label || ['A', 'B', 'C', '1', '2', '3'].includes(label);
              const isCell = label === 'A1';

              return (
                <ComhwalMiniCell
                  key={`${label}-${index}`}
                  accent={accent}
                  active={isCell && hasComhwalFocus(model, 'cell')}
                  focus={isCell && !hasComhwalFocus(model, 'cell')}
                  className={isHeader ? 'opacity-90' : ''}
                >
                  {label}
                </ComhwalMiniCell>
              );
            },
          )}
        </div>
        <div className="flex gap-1.5">
          {['Sheet1', 'Sheet2'].map((label, index) => (
            <span
              key={label}
              className="rounded-t-xl border px-3 py-1.5 kr-num text-[10px]"
              style={{
                borderColor: hasComhwalFocus(model, 'sheet-tab') && index === 0 ? accent : 'rgba(239,244,255,0.14)',
                background: hasComhwalFocus(model, 'sheet-tab') && index === 0 ? accent : 'rgba(239,244,255,0.06)',
                color: hasComhwalFocus(model, 'sheet-tab') && index === 0 ? '#07121f' : 'rgba(239,244,255,0.72)',
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </ComhwalDiagramFrame>
  );
}

function ComhwalFormulaPattern({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  const pattern = model.pattern ?? '';

  if (pattern.includes('error-tags')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-3 gap-2">
          {['#DIV/0!', '#VALUE!', '#N/A'].map((label, index) => (
            <ComhwalMiniCell key={label} accent={accent} active={hasComhwalFocus(model, 'error') && index === 1}>
              {label}
            </ComhwalMiniCell>
          ))}
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('reference') || pattern.includes('named-range')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[1fr_92px] gap-3">
          <div className="grid grid-cols-4 gap-1.5">
            {['A1', 'B1', '$A$1', '이름', 'A2', 'B2', 'A3', 'B3'].map((label, index) => (
              <ComhwalMiniCell
                key={`${label}-${index}`}
                accent={accent}
                active={
                  (hasComhwalFocus(model, 'absolute-reference') && index === 2) ||
                  (hasComhwalFocus(model, 'named-range') && index === 3) ||
                  (hasComhwalFocus(model, 'relative-reference') && index === 0)
                }
                focus={hasComhwalFocus(model, 'cell') && index === 0}
              >
                {label}
              </ComhwalMiniCell>
            ))}
          </div>
          <div className="flex flex-col justify-center gap-2">
            <ComhwalMiniCell accent={accent} active={hasComhwalFocus(model, 'relative-reference')}>이동</ComhwalMiniCell>
            <ComhwalMiniCell accent={accent} active={hasComhwalFocus(model, 'absolute-reference')}>고정</ComhwalMiniCell>
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('text') || pattern.includes('date') || pattern.includes('finance')) {
    const focusIndex = getComhwalFlowFocusIndex(model);
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
          {model.flow.map((item, index) => (
            <div key={item} className="contents">
              <ComhwalMiniCell accent={accent} active={index === focusIndex}>{item}</ComhwalMiniCell>
              {index < 2 ? <ArrowRight size={16} style={{ color: accent }} /> : null}
            </div>
          ))}
        </div>
        <div className="mt-3 h-2 rounded-full bg-cream/10">
          <div className="h-2 w-2/3 rounded-full" style={{ background: accent }} />
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('logic') || pattern.includes('info')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[1fr_1fr] gap-2">
          <ComhwalMiniCell accent={accent} active={hasComhwalFocus(model, 'condition')}>{model.flow[0]}</ComhwalMiniCell>
          <div className="grid gap-2">
            <ComhwalMiniCell accent={accent} focus={hasComhwalFocus(model, 'result')}>TRUE</ComhwalMiniCell>
            <ComhwalMiniCell accent={accent} focus={hasComhwalFocus(model, 'result')}>FALSE</ComhwalMiniCell>
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('lookup') || pattern.includes('database-criteria')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[82px_1fr] gap-3">
          <ComhwalMiniCell accent={accent} active={hasComhwalFocus(model, 'lookup')}>{model.flow[0]}</ComhwalMiniCell>
          <div className="grid grid-cols-3 gap-1.5">
            {['키', '이름', '값', 'A01', '사과', '300', 'B02', '배', '500'].map((label, index) => (
              <ComhwalMiniCell
                key={`${label}-${index}`}
                accent={accent}
                active={(hasComhwalFocus(model, 'result') && index === 5) || (hasComhwalFocus(model, 'criteria') && index === 0)}
                focus={hasComhwalFocus(model, 'lookup') && index === 3}
              >
                {label}
              </ComhwalMiniCell>
            ))}
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('array')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, index) => (
            <ComhwalMiniCell key={index} accent={accent} active={hasComhwalFocus(model, 'result') && [0, 4, 8].includes(index)} focus={hasComhwalFocus(model, 'input-value') && index < 3}>
              {index + 1}
            </ComhwalMiniCell>
          ))}
        </div>
      </ComhwalDiagramFrame>
    );
  }

  return (
    <ComhwalDiagramFrame accent={accent}>
      <div className="rounded-2xl border border-cream/15 bg-cream/[0.04] p-3">
        <ComhwalPatternMotif pattern={model.pattern} accent={accent} labels={model.flow} />
        <div
          className="mt-3 rounded-2xl border px-3 py-2 kr-num text-[12px] text-cream/82"
          style={{ borderColor: 'rgba(239,244,255,0.14)', background: 'rgba(239,244,255,0.06)' }}
        >
          = {model.flow[1]}({model.flow[0]}) {'->'} {model.flow[2]}
        </div>
      </div>
    </ComhwalDiagramFrame>
  );
}

function ComhwalAnalysisPattern({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  const pattern = model.pattern ?? '';

  if (pattern.startsWith('chart-')) {
    const bars = pattern.includes('type') ? [72, 42, 72] : pattern.includes('edit') ? [44, 74, 58, 88] : [38, 64, 86, 52];
    const focusIndex = getComhwalFlowFocusIndex(model);
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[1fr_92px] gap-3">
          <div className="flex h-[112px] items-end gap-2 rounded-2xl border border-cream/15 bg-cream/[0.04] px-4 py-3">
            {bars.map((height, index) => (
              <span
                key={`${height}-${index}`}
                className="flex-1 rounded-t-xl"
                style={{
                  height: `${height}%`,
                  outline: hasComhwalFocus(model, 'chart-data') && index === 2 ? `2px solid ${accent}` : 'none',
                  outlineOffset: 2,
                  background:
                    (hasComhwalFocus(model, 'chart-data') && index === 2) ||
                    (hasComhwalFocus(model, 'chart-type') && index === 0)
                      ? accent
                      : 'rgba(239,244,255,0.34)',
                }}
              />
            ))}
          </div>
          <div className="grid gap-2">
            {model.flow.map((item, index) => (
              <ComhwalMiniCell key={item} accent={accent} active={index === focusIndex}>{item}</ComhwalMiniCell>
            ))}
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.startsWith('print-') || pattern.includes('freeze')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="mx-auto grid max-w-[260px] grid-cols-[74px_1fr] gap-3">
          <div
            className="rounded-2xl border bg-cream/[0.08] p-2"
            style={{ borderColor: hasComhwalFocus(model, 'page', 'print') ? accent : 'rgba(239,244,255,0.15)' }}
          >
            <div
              className="h-3 rounded"
              style={{ background: hasComhwalFocus(model, 'freeze') ? accent : 'rgba(239,244,255,0.35)' }}
            />
            <div className="mt-2 grid grid-cols-2 gap-1">
              {Array.from({ length: 8 }).map((_, index) => (
                <span
                  key={index}
                  className="h-3 rounded"
                  style={{
                    background:
                      (hasComhwalFocus(model, 'print') && index > 3) ||
                      (hasComhwalFocus(model, 'page') && index === 1)
                        ? accent
                        : 'rgba(239,244,255,0.15)',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {model.flow.map((item, index) => (
              <ComhwalMiniCell key={item} accent={accent} active={index === 1}>{item}</ComhwalMiniCell>
            ))}
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.startsWith('analysis-pivot') || pattern.startsWith('analysis-data-table')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-4 gap-1.5">
          {['필드', '1월', '2월', '합계', 'A', '12', '18', '30', 'B', '22', '16', '38'].map((label, index) => (
            <ComhwalMiniCell
              key={`${label}-${index}`}
              accent={accent}
              active={
                (hasComhwalFocus(model, 'pivot-field') && index === 0) ||
                (hasComhwalFocus(model, 'result') && index === 7)
              }
              focus={hasComhwalFocus(model, 'filter') && index === 3}
            >
              {label}
            </ComhwalMiniCell>
          ))}
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.startsWith('macro-') || pattern.startsWith('vba-')) {
    const focusIndex = getComhwalFlowFocusIndex(model);
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
          {model.flow.map((item, index) => (
            <div key={item} className="contents">
              <ComhwalMiniCell accent={accent} active={index === focusIndex}>{item}</ComhwalMiniCell>
              {index < 2 ? <ArrowRight size={16} style={{ color: accent }} /> : null}
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {['Sub', 'If', 'Next'].map((label, index) => (
            <ComhwalMiniCell
              key={label}
              accent={accent}
              active={
                (hasComhwalFocus(model, 'vba') && index === 0) ||
                (hasComhwalFocus(model, 'branch') && index === 1) ||
                (hasComhwalFocus(model, 'macro') && index === 2)
              }
            >
              {label}
            </ComhwalMiniCell>
          ))}
        </div>
      </ComhwalDiagramFrame>
    );
  }

  return (
    <ComhwalDiagramFrame accent={accent}>
      <ComhwalPatternMotif pattern={model.pattern} accent={accent} labels={model.flow} />
    </ComhwalDiagramFrame>
  );
}

function ComhwalDatabasePattern({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  const pattern = model.pattern ?? '';

  if (pattern.includes('erd') || pattern.includes('relationship') || pattern.includes('integrity')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[1fr_70px_1fr] items-center gap-2">
          {['고객', '주문'].map((title, index) => (
            <div key={title} className="rounded-2xl border border-cream/15 bg-cream/[0.04] p-2">
              <ComhwalMiniCell accent={accent} active={hasComhwalFocus(model, 'table') && index === 0}>{title}</ComhwalMiniCell>
              <div className="mt-1.5 grid gap-1">
                {['ID', index === 0 ? '이름' : '고객ID'].map((row) => (
                  <span
                    key={row}
                    className="rounded-lg border px-2 py-1 kr-num text-[10px]"
                    style={{
                      borderColor:
                        (hasComhwalFocus(model, 'key') && row === 'ID') ||
                        (hasComhwalFocus(model, 'foreign-key', 'integrity') && row === '고객ID')
                          ? accent
                          : 'transparent',
                      background:
                        (hasComhwalFocus(model, 'key') && row === 'ID') ||
                        (hasComhwalFocus(model, 'foreign-key', 'integrity') && row === '고객ID')
                          ? `color-mix(in srgb, ${accent} 18%, rgba(239,244,255,0.08))`
                          : 'rgba(239,244,255,0.08)',
                      color: 'rgba(239,244,255,0.68)',
                    }}
                  >
                    {row}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div className="-order-none flex items-center justify-center">
            <span
              className="h-px w-full"
              style={{
                background: accent,
                boxShadow: hasComhwalFocus(model, 'relationship', 'integrity')
                  ? `0 0 14px ${accent}`
                  : 'none',
                height: hasComhwalFocus(model, 'relationship', 'integrity') ? 3 : 1,
              }}
            />
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('key') || pattern.includes('index')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-3 gap-2">
          {model.flow.map((item, index) => (
            <div key={item} className="relative">
              <ComhwalMiniCell
                accent={accent}
                active={
                  (hasComhwalFocus(model, 'key') && index === 1) ||
                  (hasComhwalFocus(model, 'foreign-key') && index === 2)
                }
                focus={hasComhwalFocus(model, 'record') && index === 0}
              >
                {item}
              </ComhwalMiniCell>
              {(hasComhwalFocus(model, 'key') && index === 1) || (hasComhwalFocus(model, 'foreign-key') && index === 2) ? (
                <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full" style={{ background: accent }} />
              ) : null}
            </div>
          ))}
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('normalization')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="grid grid-cols-2 gap-1.5">
            {['고객', '주문', '고객', '주문'].map((label, index) => (
              <ComhwalMiniCell key={`${label}-${index}`} accent={accent} active={hasComhwalFocus(model, 'deduplicate') && index < 2}>{label}</ComhwalMiniCell>
            ))}
          </div>
          <ArrowRight size={16} style={{ color: accent }} />
          <div className="grid gap-1.5">
            <ComhwalMiniCell accent={accent} active={hasComhwalFocus(model, 'table')}>고객 표</ComhwalMiniCell>
            <ComhwalMiniCell accent={accent} focus={hasComhwalFocus(model, 'relationship')}>주문 표</ComhwalMiniCell>
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('system-layers')) {
    const focusIndex = hasComhwalFocus(model, 'dbms') ? 1 : getComhwalFlowFocusIndex(model);
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="mx-auto max-w-[260px] space-y-2">
          {model.flow.map((item, index) => (
            <div
              key={item}
              className="rounded-2xl border px-4 py-3 text-center kr-heading text-[11px]"
              style={{
                transform: `translateX(${(index - 1) * 14}px)`,
                borderColor: index === focusIndex ? accent : 'rgba(239,244,255,0.16)',
                background: index === focusIndex ? accent : 'rgba(239,244,255,0.07)',
                color: index === focusIndex ? '#07121f' : 'rgba(239,244,255,0.78)',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (
    pattern.includes('relational') ||
    pattern.includes('design-grid') ||
    pattern.includes('data-type')
  ) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[1fr_92px] gap-3">
          <div className="grid grid-cols-3 gap-1.5">
            {['필드', '형식', '설명', 'ID', '숫자', '키', '이름', '텍스트', '값'].map(
              (label, index) => (
                <ComhwalMiniCell
                  key={`${label}-${index}`}
                  accent={accent}
                  active={
                    (hasComhwalFocus(model, 'field') && index === 0) ||
                    (hasComhwalFocus(model, 'key') && index === 5) ||
                    (hasComhwalFocus(model, 'format') && index === 1)
                  }
                  focus={hasComhwalFocus(model, 'record') && [3, 4, 5].includes(index)}
                >
                  {label}
                </ComhwalMiniCell>
              ),
            )}
          </div>
          <div className="grid gap-1.5">
            {model.flow.map((item, index) => (
              <ComhwalMiniCell key={item} accent={accent} active={index === getComhwalFlowFocusIndex(model)}>
                {item}
              </ComhwalMiniCell>
            ))}
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('mask') || pattern.includes('validation') || pattern.includes('lookup')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[1fr_92px] gap-3">
          <div className="rounded-2xl border border-cream/15 bg-cream/[0.04] p-2">
            <div
              className="mb-2 rounded-xl border px-3 py-2 kr-num text-[11px] text-cream/72"
              style={{
                borderColor: hasComhwalFocus(model, 'format', 'condition') ? accent : 'transparent',
                background: hasComhwalFocus(model, 'format', 'condition')
                  ? `color-mix(in srgb, ${accent} 16%, rgba(239,244,255,0.08))`
                  : 'rgba(239,244,255,0.08)',
              }}
            >
              000-0000
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {['허용', '거절', '목록', '저장'].map((label, index) => (
                <ComhwalMiniCell
                  key={label}
                  accent={accent}
                  active={
                    (hasComhwalFocus(model, 'condition') && index === 0) ||
                    (hasComhwalFocus(model, 'lookup') && index === 2)
                  }
                >
                  {label}
                </ComhwalMiniCell>
              ))}
            </div>
          </div>
          <ComhwalMiniCell accent={accent} active={hasComhwalFocus(model, 'result') || hasComhwalFocus(model, 'lookup')}>{model.flow[2]}</ComhwalMiniCell>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('import') || pattern.includes('export')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <ComhwalMiniCell accent={accent}>{pattern.includes('import') ? 'Excel/CSV' : 'Access'}</ComhwalMiniCell>
          <ArrowRight size={18} style={{ color: accent }} />
          <ComhwalMiniCell accent={accent} active>{pattern.includes('import') ? 'Access' : 'Excel/PDF'}</ComhwalMiniCell>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  return (
    <ComhwalDiagramFrame accent={accent}>
      <div className="grid grid-cols-[84px_1fr] gap-3">
        <div className="flex flex-col items-center justify-center gap-1">
          <span
            className="h-10 w-20 rounded-[50%] border-2"
            style={{
              borderColor: accent,
              background: hasComhwalFocus(model, 'data-store')
                ? `color-mix(in srgb, ${accent} 18%, rgba(239,244,255,0.07))`
                : 'rgba(239,244,255,0.07)',
            }}
          />
          <span className="-mt-6 h-16 w-20 rounded-b-2xl border-x-2 border-b-2" style={{ borderColor: accent }} />
        </div>
        <div className="grid gap-2">
          {model.flow.map((item, index) => (
            <ComhwalMiniCell key={item} accent={accent} active={index === getComhwalFlowFocusIndex(model)}>
              {item}
            </ComhwalMiniCell>
          ))}
        </div>
      </div>
    </ComhwalDiagramFrame>
  );
}

function ComhwalQueryPattern({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  const pattern = model.pattern ?? '';

  if (pattern.includes('join')) {
    const joinFocus = hasComhwalFocus(model, 'join', 'relationship');
    const tableFocus = hasComhwalFocus(model, 'table', 'select');
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <ComhwalMiniCell accent={accent} focus={tableFocus}>Table A</ComhwalMiniCell>
          <div
            className="rounded-full border px-3 py-2 kr-num text-[11px]"
            style={{
              borderColor: accent,
              color: joinFocus ? '#07121f' : accent,
              background: joinFocus ? accent : 'rgba(1,8,40,0.26)',
              boxShadow: joinFocus ? `0 0 18px color-mix(in srgb, ${accent} 36%, transparent)` : 'none',
            }}
          >
            JOIN
          </div>
          <ComhwalMiniCell accent={accent} focus={tableFocus}>Table B</ComhwalMiniCell>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('subquery')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="rounded-2xl border border-cream/15 p-3">
          <ComhwalMiniCell accent={accent} active={hasComhwalFocus(model, 'select')} focus={hasComhwalFocus(model, 'where')}>
            바깥 SELECT
          </ComhwalMiniCell>
          <div className="mx-auto my-2 h-5 w-px" style={{ background: accent }} />
          <div className="mx-auto max-w-[210px] rounded-2xl border border-cream/15 bg-cream/[0.05] p-2">
            <ComhwalMiniCell accent={accent} active={hasComhwalFocus(model, 'subquery')}>
              안쪽 SELECT
            </ComhwalMiniCell>
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('action')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[1fr_86px] gap-3">
          <ComhwalVisualFlow model={model} accent={accent} />
          <div
            className="flex items-center justify-center rounded-2xl border kr-heading text-[28px]"
            style={{
              borderColor: hasComhwalFocus(model, 'action-query') ? accent : 'rgba(239,244,255,0.15)',
              color: accent,
              background: hasComhwalFocus(model, 'action-query')
                ? `color-mix(in srgb, ${accent} 14%, rgba(239,244,255,0.04))`
                : 'rgba(239,244,255,0.04)',
              boxShadow: hasComhwalFocus(model, 'action-query')
                ? `0 0 18px color-mix(in srgb, ${accent} 28%, transparent)`
                : 'none',
            }}
          >
            !
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('crosstab') || pattern.includes('group')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-3 gap-1.5">
          {['', '1월', '2월', 'A', '12', '16', 'B', '20', '18'].map((label, index) => (
            <ComhwalMiniCell
              key={`${label}-${index}`}
              accent={accent}
              active={
                (hasComhwalFocus(model, 'group') && [3, 6].includes(index)) ||
                (hasComhwalFocus(model, 'parameter') && [1, 2].includes(index)) ||
                (hasComhwalFocus(model, 'result') && index === 4)
              }
            >
              {label}
            </ComhwalMiniCell>
          ))}
        </div>
      </ComhwalDiagramFrame>
    );
  }

  return (
    <ComhwalDiagramFrame accent={accent}>
      <div className="rounded-2xl border border-cream/15 bg-cream/[0.04] p-3">
        <div className="grid grid-cols-3 gap-2">
          {model.flow.map((item, index) => (
            <ComhwalMiniCell key={item} accent={accent} active={index === getComhwalFlowFocusIndex(model)}>
              {item}
            </ComhwalMiniCell>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 rounded-xl bg-cream/[0.07] px-3 py-2 kr-num text-[11px] text-cream/70">
          {[
            ['SELECT', 'select'],
            ['field', 'field'],
            ['FROM table', 'table'],
            ['WHERE', 'where'],
            ['condition', 'condition'],
            ['ORDER BY', 'order'],
          ].map(([label, focus]) => (
            <span
              key={label}
              className="rounded-lg border px-2 py-1"
              style={{
                borderColor: model.focus === focus ? accent : 'transparent',
                color: model.focus === focus ? '#07121f' : 'rgba(239,244,255,0.72)',
                background: model.focus === focus ? accent : 'rgba(239,244,255,0.04)',
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </ComhwalDiagramFrame>
  );
}

function ComhwalFormReportPattern({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  const pattern = model.pattern ?? '';
  const isReport = pattern.startsWith('report-');

  if (pattern.includes('wizard')) {
    const focusIndex = getComhwalFlowFocusIndex(model);
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3'].map((step, index) => (
            <div
              key={step}
              className="rounded-2xl border p-2"
              style={{
                borderColor: index === focusIndex ? accent : 'rgba(239,244,255,0.15)',
                background: index === focusIndex
                  ? `color-mix(in srgb, ${accent} 12%, rgba(239,244,255,0.04))`
                  : 'rgba(239,244,255,0.04)',
              }}
            >
              <ComhwalMiniCell accent={accent} active={index === focusIndex}>{step}</ComhwalMiniCell>
              <div
                className="mt-2 h-2 rounded"
                style={{ background: index === focusIndex ? accent : 'rgba(239,244,255,0.15)' }}
              />
            </div>
          ))}
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('palette') || pattern.includes('properties') || pattern.includes('format')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[86px_1fr] gap-3">
          <div className="grid gap-1.5">
            {['Aa', '□', 'Btn'].map((item, index) => (
              <ComhwalMiniCell
                key={item}
                accent={accent}
                active={hasComhwalFocus(model, 'control') && index === 1}
                focus={hasComhwalFocus(model, 'form') && index === 0}
              >
                {item}
              </ComhwalMiniCell>
            ))}
          </div>
          <div className="rounded-2xl border border-cream/15 bg-cream/[0.04] p-2">
            {model.flow.map((item, index) => (
              <ComhwalMiniCell
                key={item}
                accent={accent}
                active={index === getComhwalFlowFocusIndex(model)}
                className="mb-1.5 last:mb-0"
              >
                {item}
              </ComhwalMiniCell>
            ))}
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  if (pattern.includes('subform')) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="rounded-2xl border border-cream/15 bg-cream/[0.04] p-3">
          <ComhwalMiniCell accent={accent} active={hasComhwalFocus(model, 'form')}>
            기본 폼
          </ComhwalMiniCell>
          <div className="mt-3 rounded-2xl border border-cream/15 bg-cream/[0.05] p-2">
            <ComhwalMiniCell accent={accent} active={hasComhwalFocus(model, 'subform')}>
              하위 폼
            </ComhwalMiniCell>
          </div>
        </div>
      </ComhwalDiagramFrame>
    );
  }

  return (
    <ComhwalDiagramFrame accent={accent}>
      <div
        className={`mx-auto max-w-[280px] rounded-2xl border p-3 ${isReport ? 'bg-cream/[0.08]' : 'bg-cream/[0.04]'}`}
        style={{
          borderColor: hasComhwalFocus(model, 'form', 'report') ? accent : 'rgba(239,244,255,0.16)',
          boxShadow: hasComhwalFocus(model, 'form', 'report')
            ? `0 0 18px color-mix(in srgb, ${accent} 22%, transparent)`
            : 'none',
        }}
      >
        <div
          className="mb-2 rounded-xl border px-3 py-2 kr-heading text-[11px]"
          style={{
            borderColor: accent,
            background: hasComhwalFocus(model, 'form', 'report') ? accent : 'rgba(239,244,255,0.08)',
            color: hasComhwalFocus(model, 'form', 'report') ? '#07121f' : 'rgba(239,244,255,0.82)',
          }}
        >
          {isReport ? 'REPORT' : 'FORM'}
        </div>
        <div className="grid gap-1.5">
          {['머리글', '본문', '바닥글'].map((section, index) => (
            <ComhwalMiniCell
              key={section}
              accent={accent}
              active={hasComhwalFocus(model, 'section') && index === 1}
              focus={hasComhwalFocus(model, 'control', 'property') && index === 1}
            >
              {section}
            </ComhwalMiniCell>
          ))}
        </div>
        <div className="mt-3">
          <ComhwalPatternMotif
            pattern={model.pattern}
            accent={accent}
            labels={model.flow}
            activeIndex={getComhwalFlowFocusIndex(model)}
          />
        </div>
      </div>
    </ComhwalDiagramFrame>
  );
}

function ComhwalAutomationPattern({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  const pattern = model.pattern ?? '';

  if (pattern.includes('radar') || pattern.includes('data-access')) {
    const focusIndex = getComhwalFlowFocusIndex(model);
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="relative mx-auto h-[132px] max-w-[280px]">
          <div
            className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
            style={{
              borderColor: accent,
              background: hasComhwalFocus(model, 'object', 'event', 'recordset')
                ? `color-mix(in srgb, ${accent} 14%, rgba(239,244,255,0.04))`
                : 'transparent',
              boxShadow: hasComhwalFocus(model, 'object', 'event', 'recordset')
                ? `0 0 18px color-mix(in srgb, ${accent} 26%, transparent)`
                : 'none',
            }}
          />
          {model.flow.map((item, index) => (
            <div
              key={item}
              className="absolute rounded-2xl border px-3 py-2 kr-heading text-[10px]"
              style={{
                left: index === 0 ? 0 : index === 1 ? '50%' : 'auto',
                right: index === 2 ? 0 : 'auto',
                top: index === 1 ? 0 : 82,
                transform: index === 1 ? 'translateX(-50%)' : undefined,
                borderColor: index === focusIndex ? accent : 'rgba(239,244,255,0.16)',
                background: index === focusIndex ? accent : 'rgba(239,244,255,0.07)',
                color: index === focusIndex ? '#07121f' : 'rgba(239,244,255,0.76)',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </ComhwalDiagramFrame>
    );
  }

  return (
    <ComhwalDiagramFrame accent={accent}>
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
        {model.flow.map((item, index) => (
          <div key={item} className="contents">
            <ComhwalMiniCell accent={accent} active={index === getComhwalFlowFocusIndex(model)}>
              {item}
            </ComhwalMiniCell>
            {index < 2 ? <ArrowRight size={16} style={{ color: accent }} /> : null}
          </div>
        ))}
      </div>
      <div className="mt-3">
        <ComhwalPatternMotif
          pattern={model.pattern}
          accent={accent}
          labels={['OpenForm', 'RunQuery', 'SetValue']}
          activeIndex={getComhwalFlowFocusIndex(model)}
        />
      </div>
    </ComhwalDiagramFrame>
  );
}

function ComhwalAdaptiveDiagram({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  const pattern = model.pattern ?? '';

  if (pattern.startsWith('sheet-')) {
    return <ComhwalSheetPattern model={model} accent={accent} />;
  }
  if (pattern.startsWith('formula-')) {
    return <ComhwalFormulaPattern model={model} accent={accent} />;
  }
  if (
    pattern.startsWith('chart-') ||
    pattern.startsWith('print-') ||
    pattern.startsWith('data-') ||
    pattern.startsWith('analysis-') ||
    pattern.startsWith('macro-') ||
    pattern.startsWith('vba-')
  ) {
    return <ComhwalAnalysisPattern model={model} accent={accent} />;
  }
  if (pattern.startsWith('db-') || pattern.startsWith('table-')) {
    return <ComhwalDatabasePattern model={model} accent={accent} />;
  }
  if (pattern.startsWith('query-')) {
    return <ComhwalQueryPattern model={model} accent={accent} />;
  }
  if (pattern.startsWith('form-') || pattern.startsWith('report-')) {
    return <ComhwalFormReportPattern model={model} accent={accent} />;
  }
  if (pattern.startsWith('automation-')) {
    return <ComhwalAutomationPattern model={model} accent={accent} />;
  }

  return (
    <ComhwalDiagramFrame accent={accent}>
      <ComhwalPatternMotif pattern={model.pattern} accent={accent} labels={model.flow} />
    </ComhwalDiagramFrame>
  );
}

function ComhwalConceptVisualCard({
  card,
  accent,
}: {
  card: ComhwalConceptCard;
  accent: string;
}) {
  const model = getComhwalVisualModel(card);

  return (
    <figure
      className="w-full max-w-[440px]"
      aria-label={`${model.title} 그림 설명`}
      data-comhwal-visual-pattern={model.pattern ?? model.mode ?? 'legacy'}
      data-comhwal-visual-kind={model.kind ?? model.pattern ?? model.mode ?? 'legacy'}
      data-comhwal-visual-focus={model.focus ?? 'generic'}
    >
      <div
        className="overflow-hidden rounded-[24px] border p-4 md:p-5"
        style={{
          borderColor: 'rgba(239,244,255,0.48)',
          background:
            'linear-gradient(180deg, rgba(10,29,72,0.76), rgba(5,13,43,0.72))',
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className="kr-num text-[9px] uppercase tracking-[0.22em]"
              style={{ color: accent }}
            >
              {model.eyebrow}
            </p>
            <h3 className="kr-heading mt-1 text-[18px] leading-tight text-cream md:text-[20px]">
              {model.title}
            </h3>
          </div>
          <div
            className="hidden shrink-0 rounded-full border px-3 py-1 kr-num text-[10px] uppercase tracking-widest sm:inline-flex"
            style={{
              borderColor: 'rgba(239,244,255,0.18)',
              color: 'rgba(239,244,255,0.7)',
              background: 'rgba(1,8,40,0.34)',
            }}
          >
            그림 요약
          </div>
        </div>

        {model.pattern ? (
          <ComhwalAdaptiveDiagram model={model} accent={accent} />
        ) : model.mode === 'sheet-grid' ? (
          <ComhwalMiniSpreadsheet accent={accent} />
        ) : model.mode === 'formula' ? (
          <ComhwalFormulaDiagram model={model} accent={accent} />
        ) : model.mode === 'chart' ? (
          <ComhwalChartDiagram accent={accent} />
        ) : model.mode === 'database-table' ? (
          <ComhwalDatabaseDiagram accent={accent} />
        ) : model.mode === 'manager' ? (
          <div
            className="mt-4 rounded-[22px] border p-3"
            style={{
              borderColor: 'rgba(239,244,255,0.16)',
              background: 'rgba(1,8,40,0.24)',
            }}
          >
            <div className="grid grid-cols-3 gap-2">
              {model.flow.map((item) => (
                <ComhwalFlowNode key={item} label={item} accent={accent} />
              ))}
            </div>
            <div className="my-2 grid grid-cols-3 items-center gap-2 px-3">
              <span aria-hidden className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent})` }} />
              <span aria-hidden className="mx-auto h-7 w-px" style={{ background: accent }} />
              <span aria-hidden className="h-px" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
            </div>
            <div
              className="mx-auto max-w-[220px] rounded-2xl border px-4 py-3 text-center"
              style={{
                borderColor: accent,
                background:
                  'radial-gradient(circle at 50% 0%, rgba(239,244,255,0.16), transparent 56%), rgba(1,8,40,0.88)',
                boxShadow: `0 0 18px color-mix(in srgb, ${accent} 32%, transparent)`,
              }}
            >
              <p className="kr-num text-[10px] uppercase tracking-widest" style={{ color: accent }}>
                OS MANAGER
              </p>
              <p className="kr-heading mt-0.5 text-[15px] text-cream">운영체제</p>
              <p className="kr-body mt-1 text-[11.5px] text-cream/62">
                순서와 자리를 정리해
              </p>
            </div>
          </div>
        ) : model.mode === 'document' ? (
          <div className="mt-4 rounded-[20px] border p-3" style={{ borderColor: 'rgba(239,244,255,0.16)', background: 'rgba(1,8,40,0.28)' }}>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
              <span className="kr-heading text-[12px] text-cream/70">문서</span>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <ComhwalFlowNode label={model.flow[0]} accent={accent} />
              <ArrowRight size={16} strokeWidth={2.5} style={{ color: accent }} />
              <ComhwalFlowNode label={model.flow[1]} accent={accent} active />
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-2">
            {model.flow.slice(0, 3).map((item, index) => (
              <div key={`${item}-${index}`} className="contents">
                <ComhwalFlowNode label={item} accent={accent} active={index === 1} />
                {index < 2 ? (
                  <div className="flex items-center justify-center">
                    <ArrowRight size={16} strokeWidth={2.5} style={{ color: accent }} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <p
          className="kr-body mt-4 rounded-2xl border px-3 py-3 text-[12.5px] leading-relaxed text-cream/78 md:text-[13px]"
          style={{
            borderColor: 'rgba(239,244,255,0.12)',
            background: 'rgba(1,8,40,0.34)',
          }}
        >
          {model.lead}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {model.chips.slice(0, 3).map((chip) => (
            <span
              key={chip}
              className="rounded-full border px-3 py-1.5 kr-heading text-[10px] text-cream/80"
              style={{
                borderColor: 'rgba(239,244,255,0.14)',
                background: `color-mix(in srgb, ${accent} 14%, rgba(1,8,40,0.42))`,
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </figure>
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
  const [showQuestionIntro, setShowQuestionIntro] = useState(false);
  const [xpToast, setXpToast] = useState<{ amount: number; key: number } | null>(null);
  const questionStartedAtRef = useRef(Date.now());
  const activeCard = cards[activeIndex];
  const isLastCard = activeIndex >= cards.length - 1;
  const activeQuestion = activeCard?.question;
  const selectedAnswer = activeCard ? selectedAnswers[activeCard.id] : undefined;
  const isQuestionMode = showQuestion && !!activeQuestion;
  const isQuestionIntroMode = showQuestionIntro && !isQuestionMode && !!activeQuestion;
  const isAnswered = selectedAnswer !== undefined;
  const isCorrectAnswer =
    !!activeQuestion && selectedAnswer !== undefined
      ? selectedAnswer === activeQuestion.answerIndex
      : false;
  const clampProgress = (value: number) => Math.max(0, Math.min(1, value));
  const currentCardProgress = isQuestionMode ? 1 : isQuestionIntroMode ? 0.78 : activeQuestion ? 0.55 : 1;
  const topicProgress =
    cards.length > 0
      ? clampProgress((activeIndex + currentCardProgress) / cards.length)
      : 0;
  const topicEntries = planet.sections.flatMap((section) => section.topics);
  const currentTopicIndex = Math.max(
    0,
    topicEntries.findIndex((topic) => topic.id === topicId),
  );
  const cardsBeforeCurrentTopic = topicEntries
    .slice(0, currentTopicIndex)
    .reduce(
      (sum, topic) => sum + getComhwalTopicCards(planet.key, topic.id).length,
      0,
    );
  const totalPlanetCards = topicEntries.reduce(
    (sum, topic) => sum + getComhwalTopicCards(planet.key, topic.id).length,
    0,
  );
  const lessonProgress =
    totalPlanetCards > 0
      ? clampProgress((cardsBeforeCurrentTopic + activeIndex + currentCardProgress) / totalPlanetCards)
      : topicProgress;
  const activePose: QuesPose =
    isQuestionMode && activeQuestion
      ? selectedAnswer === undefined
        ? 'think'
        : selectedAnswer === activeQuestion.answerIndex
          ? 'celebrate'
          : 'sad'
      : isQuestionIntroMode
        ? 'think'
      : getComhwalConceptPose(activeCard, activeIndex, cards.length);

  useEffect(() => {
    setActiveIndex(0);
    setSelectedAnswers({});
    setShowQuestion(false);
    setShowQuestionIntro(false);
  }, [planet.key, topicId]);

  useEffect(() => {
    setShowQuestion(false);
    setShowQuestionIntro(false);
  }, [activeCard?.id]);

  const handlePrev = () => {
    if (isQuestionMode) {
      setShowQuestion(false);
      setShowQuestionIntro(true);
      return;
    }
    if (isQuestionIntroMode) {
      setShowQuestionIntro(false);
      return;
    }
    setActiveIndex((index) => Math.max(0, index - 1));
  };

  const goNextCard = () => {
    setShowQuestion(false);
    setShowQuestionIntro(false);
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

    if (isQuestionIntroMode) {
      setShowQuestionIntro(false);
      questionStartedAtRef.current = Date.now();
      setShowQuestion(true);
      return;
    }

    if (activeQuestion) {
      setShowQuestionIntro(true);
      return;
    }

    goNextCard();
  };

  const handleSelectAnswer = (choiceIndex: number) => {
    if (!activeCard || !activeQuestion || selectedAnswer !== undefined) return;
    const correct = choiceIndex === activeQuestion.answerIndex;
    const timeMs = Math.max(0, Date.now() - questionStartedAtRef.current);
    const xp = recordSingleAnswer(
      activeQuestion.id,
      correct,
      timeMs,
      getComhwalStepKey(activeCard),
      choiceIndex,
      null,
    );
    setSelectedAnswers((answers) => ({
      ...answers,
      [activeCard.id]: choiceIndex,
    }));
    if (xp > 0) {
      setXpToast({ amount: xp, key: Date.now() });
      window.setTimeout(() => setXpToast(null), 1800);
    }
  };

  const speechText = activeCard
    ? isQuestionMode && activeQuestion
      ? activeQuestion.prompt
      : isQuestionIntroMode
        ? activeQuestion.prompt
      : activeCard.body
    : '아직 이 토픽의 개념 카드가 준비 중이야. 목차는 열어뒀고, 곧 ADSP·SQLD처럼 하나씩 붙일게.';
  const primaryLabel = isQuestionMode
    ? isLastCard
      ? '목차로'
      : '다음 카드'
    : isQuestionIntroMode
      ? '문제 풀기'
    : activeQuestion
      ? '문제로 확인'
      : cards.length === 0 || isLastCard
        ? '목차로'
        : '계속';

  return (
    <section
      className="relative isolate flex min-h-screen flex-col overflow-hidden text-cream"
      style={{ '--subject-accent': subject.accent } as CSSProperties}
    >
      <PageAmbientBg />
      {xpToast ? (
        <div
          key={xpToast.key}
          className="fixed top-[18%] left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
          style={{
            animation: 'xpToastRise 1.8s cubic-bezier(0.18, 0.9, 0.4, 1) forwards',
          }}
        >
          <div
            className="kr-heading px-5 py-3 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #FFB020 0%, #FD802E 100%)',
              color: '#0a0f1f',
              boxShadow:
                '0 18px 48px -8px rgba(253,128,46,0.6), 0 0 0 2px rgba(255,255,255,0.18) inset',
              fontSize: 22,
              letterSpacing: '0.04em',
              textShadow: '0 1px 0 rgba(255,255,255,0.25)',
            }}
          >
            +{xpToast.amount} XP
          </div>
        </div>
      ) : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${subject.accent}1f 0%, rgba(1,8,40,0) 55%)`,
        }}
      />
      <TopBar
        progress={lessonProgress}
        stepProgress={topicProgress}
        progressLabel="전체"
        stepProgressLabel="챕터"
        accent={subject.accent}
        onExit={onBack}
      />

      <main className="relative z-10 mx-auto flex-1 w-full max-w-[820px] px-5 pb-36 pt-6 md:px-8 lg:max-w-[1000px] lg:px-12 lg:pt-10 xl:max-w-[1180px] xl:px-16">
        <div className="mx-auto flex max-w-[760px] flex-col items-center">
          <div className="flex justify-center">
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

          {!isQuestionMode ? (
            <div className="mt-7 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePrev}
                disabled={activeIndex === 0}
                aria-label="이전 대사"
                className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-4 py-3 kr-heading text-[12px] uppercase tracking-widest transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 md:px-5 md:py-3.5 md:text-[13px]"
              >
                <ChevronLeft size={16} strokeWidth={2.7} />
                이전
              </button>
              <button
                type="button"
                onClick={handleNext}
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
          ) : null}

          {activeCard && !isQuestionMode && !isQuestionIntroMode ? (
            <div className="mt-8 flex w-full flex-col items-center gap-4">
              <ComhwalConceptVisualCard card={activeCard} accent={subject.accent} />
            </div>
          ) : null}

          {isQuestionMode && activeQuestion && activeCard ? (
            <>
              <div className="mt-8 flex w-full max-w-[560px] justify-start">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuestion(false);
                    setShowQuestionIntro(false);
                  }}
                  className="kr-heading uppercase tracking-widest rounded-full inline-flex items-center gap-1.5 transition liquid-glass hover:bg-white/10 text-[11px] md:text-[12px] px-3.5 py-2"
                >
                  <ChevronLeft size={13} strokeWidth={2.6} />
                  개념 다시 보기
                </button>
              </div>
              <ComhwalConceptQuestionPanel
                key={activeQuestion.id}
                question={activeQuestion}
                selectedAnswer={selectedAnswer}
                onSelectAnswer={handleSelectAnswer}
              />
            </>
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

      {isQuestionMode && activeQuestion && isAnswered ? (
        <FeedbackSheet
          correct={isCorrectAnswer}
          explanation={activeQuestion.explanation}
          correctAnswerText={
            isCorrectAnswer ? undefined : activeQuestion.choices[activeQuestion.answerIndex]
          }
          ctaLabel={isLastCard ? '목차로' : '다음 개념'}
          onContinue={goNextCard}
          secondaryCtaLabel="개념 다시 보기"
          onSecondary={() => {
            setShowQuestion(false);
            setShowQuestionIntro(false);
          }}
        />
      ) : null}
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

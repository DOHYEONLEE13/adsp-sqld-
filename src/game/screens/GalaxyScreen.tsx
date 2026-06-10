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
  AppWindow,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BatteryCharging,
  Check,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FileText,
  Folder,
  Globe2,
  HardDrive,
  Info,
  Keyboard,
  ListTodo,
  Lock,
  Monitor,
  MousePointer2,
  Palette,
  Printer,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Target,
  Trash2,
  Volume2,
  Wifi,
  Wrench,
  X,
  type LucideIcon,
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
import EnergyBlockModal from '../components/EnergyBlockModal';
import PlanetOrb, { type PlanetVariant } from '../components/PlanetOrb';
import type { QuesPose } from '@/components/mascot/types';
import { recordSingleAnswer, type ProgressStore } from '../storage';
import { consumeEnergy } from '../energy';
import {
  unlockStepOnServer,
  useStepUnlocks,
  type StepLockSnapshot,
} from '../stepUnlocks';
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
import { scrollElementIntoPageView } from '@/lib/pageScroll';

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
function cssEscape(s: string): string {
  if (typeof window !== 'undefined' && typeof window.CSS?.escape === 'function') {
    return window.CSS.escape(s);
  }
  return s.replace(/(["\\])/g, '\\$1');
}

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

function initialExpansionView(subjectId: ExpansionSubjectId): View {
  const resume = readSavedExpansionResume(subjectId);
  if (resume) {
    return {
      kind: 'expansionPlanets',
      subjectId,
      variantId: resume.variantId,
      resumePlanetKey: resume.planetKey,
    };
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
      setView({
        kind: 'expansionPlanets',
        subjectId: view.subjectId,
        variantId: view.variantId,
        resumePlanetKey:
          resume && resume.variantId === view.variantId
            ? resume.planetKey
            : undefined,
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

  const PATH_MARGIN = 2;
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
        width={W}
        height={totalH}
        viewBox={`0 0 ${W} ${totalH}`}
        className="absolute left-0 top-0 pointer-events-none"
      >
        <path
          d={d}
          fill="none"
          stroke={`color-mix(in srgb, ${accent} 12%, transparent)`}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.72}
        />
        <path
          d={d}
          fill="none"
          stroke={`color-mix(in srgb, ${accent} 44%, transparent)`}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: `drop-shadow(0 0 4px color-mix(in srgb, ${accent} 16%, transparent))`,
          }}
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

const EXPANSION_PLANET_VARIANTS: Record<string, PlanetVariant> = {
  'computer-general': 'terra',
  'spreadsheet-general': 'ring',
  'database-general': 'crater',
};

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
  const ringSize = NODE + 18;
  const buttonInset = (ringSize - NODE) / 2;
  const trackR = (ringSize - 6) / 2;
  const orbitR = (ringSize - 16) / 2;
  const titleW = Math.min(containerW - 32, 280);
  const planetVariant = EXPANSION_PLANET_VARIANTS[planetKey] ?? null;
  const isPlanetNode = planetVariant !== null;
  const nodeStyle = {
    inset: buttonInset,
    '--roadmap-accent': accent,
  } as CSSProperties;

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
            r={trackR}
            fill="none"
            stroke={`color-mix(in srgb, ${accent} 22%, rgba(239,244,255,0.14))`}
            strokeWidth={isPlanetNode ? 1.2 : 2}
            opacity={isPlanetNode ? 0.4 : 1}
          />
          {!isPlanetNode ? (
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={orbitR}
              fill="none"
              stroke={`color-mix(in srgb, ${accent} 22%, transparent)`}
              strokeWidth={1.25}
              strokeDasharray="3 10"
              strokeLinecap="round"
            />
          ) : null}
        </svg>

        <button
          type="button"
          onClick={() => onSelect(planetKey)}
          aria-label={`${title} 과목${isResumeTarget ? ' (학습 복귀 — 여기서부터)' : ''}`}
          className={`absolute qd-roadmap-orb rounded-full inline-flex items-center justify-center transition-transform duration-150 hover:-translate-y-1 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon${
            isResumeTarget ? ' qd-roadmap-orb--resume' : ''
          }${isPlanetNode ? ' qd-roadmap-orb--three-planet' : ''}`}
          style={nodeStyle}
        >
          {planetVariant ? (
            <PlanetOrb variant={planetVariant} accent={accent} />
          ) : null}
          <span
            className="qd-roadmap-orb__number kr-num leading-none relative"
            style={{
              fontSize: NODE * 0.38,
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
          className="kr-body font-bold text-[14px] md:text-[15px] leading-[1.2] truncate w-full"
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
  const lockSnap = useStepUnlocks();
  const [energyBlock, setEnergyBlock] = useState<{ retryAfterSec: number } | null>(
    null,
  );
  const [lockToast, setLockToast] = useState<string | null>(null);
  const [openingTopicId, setOpeningTopicId] = useState<string | null>(null);

  const handleSelectTopic = async ({
    topicId,
    locked,
    ready,
    visited,
  }: {
    topicId: string;
    locked: boolean;
    ready: boolean;
    visited: boolean;
  }) => {
    if (!ready || openingTopicId) return;
    if (locked) {
      setLockToast('앞 개념을 먼저 완료해야 열 수 있어요.');
      window.setTimeout(() => setLockToast(null), 2400);
      return;
    }
    if (visited) {
      onSelectTopic(topicId);
      return;
    }

    setOpeningTopicId(topicId);
    try {
      const energyResult = await consumeEnergy(1);
      if (!energyResult.ok) {
        setEnergyBlock({ retryAfterSec: energyResult.retryAfterSec });
        return;
      }
      await unlockStepOnServer(getComhwalTopicUnlockKey(planet.key, topicId));
      onSelectTopic(topicId);
    } finally {
      setOpeningTopicId(null);
    }
  };

  useEffect(() => {
    if (!resumeTopicId) return;
    const frame = window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(
        `[data-expansion-topic-id="${cssEscape(resumeTopicId)}"]`,
      );
      if (!target) return;
      scrollElementIntoPageView(target, 88, 'smooth');
    });
    return () => window.cancelAnimationFrame(frame);
  }, [planet.key, resumeTopicId]);

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
              planetTopics={outlineTopics}
              accent={subject.accent}
              progress={progress}
              lockSnap={lockSnap}
              openingTopicId={openingTopicId}
              resumeTopicId={resumeTopicId}
              onSelectTopic={handleSelectTopic}
            />
          ))}
        </div>
      </div>
      {energyBlock ? (
        <EnergyBlockModal
          retryAfterSec={energyBlock.retryAfterSec}
          onClose={() => setEnergyBlock(null)}
        />
      ) : null}
      {lockToast ? (
        <div
          role="status"
          className="fixed top-20 left-1/2 z-40 -translate-x-1/2 rounded-full px-4 py-2.5 kr-num text-[12px] pointer-events-none"
          style={{
            background: 'rgba(20,32,46,0.96)',
            color: 'var(--cream)',
            border: '1px solid rgba(167,139,250,0.5)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
          }}
        >
          잠금 {lockToast}
        </div>
      ) : null}
    </section>
  );
}

function ExpansionOutlineSection({
  index,
  title,
  planetKey,
  topics,
  planetTopics,
  accent,
  progress,
  lockSnap,
  openingTopicId,
  resumeTopicId,
  onSelectTopic,
}: {
  index: number;
  title: string;
  planetKey: string;
  topics: ExpansionPlanet['sections'][number]['topics'];
  planetTopics: ExpansionPlanet['sections'][number]['topics'];
  accent: string;
  progress: ProgressStore;
  lockSnap: StepLockSnapshot;
  openingTopicId: string | null;
  resumeTopicId?: string;
  onSelectTopic: (args: {
    topicId: string;
    locked: boolean;
    ready: boolean;
    visited: boolean;
  }) => void;
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
            previousTopicsComplete={
              (() => {
                const planetTopicIndex = planetTopics.findIndex(
                  (item) => item.id === topic.id,
                );
                if (planetTopicIndex <= 0) return true;
                return planetTopics
                  .slice(0, planetTopicIndex)
                  .every(
                    (item) =>
                      getComhwalTopicProgress(planetKey, item.id, progress)
                        .completed,
                  );
              })()
            }
            topicId={topic.id}
            title={topic.title}
            accent={accent}
            progress={progress}
            lockSnap={lockSnap}
            opening={openingTopicId === topic.id}
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
  previousTopicsComplete,
  topicId,
  title,
  accent,
  progress,
  lockSnap,
  opening,
  isResumeTarget,
  isLast,
  onSelectTopic,
}: {
  n: number;
  planetKey: string;
  previousTopicsComplete: boolean;
  topicId: string;
  title: string;
  accent: string;
  progress: ProgressStore;
  lockSnap: StepLockSnapshot;
  opening: boolean;
  isResumeTarget: boolean;
  isLast: boolean;
  onSelectTopic: (args: {
    topicId: string;
    locked: boolean;
    ready: boolean;
    visited: boolean;
  }) => void;
}) {
  const {
    cardCount,
    questionCount,
    completedQuestionCount,
    attempted,
    completed,
  } = getComhwalTopicProgress(planetKey, topicId, progress);
  const topicKey = getComhwalTopicUnlockKey(planetKey, topicId);
  const visited =
    !lockSnap.enforced ||
    completed ||
    attempted ||
    lockSnap.unlockedSet.has(topicKey);
  const isReady = cardCount > 0;
  const locked = lockSnap.enforced && !completed && !previousTopicsComplete;
  const nodeBackground = locked
    ? 'linear-gradient(180deg, rgba(13,27,66,0.74), rgba(8,18,48,0.76))'
    : completed
    ? `linear-gradient(180deg, ${accent} 0%, color-mix(in srgb, ${accent} 76%, #010828) 100%)`
    : attempted
      ? `linear-gradient(180deg, color-mix(in srgb, ${accent} 30%, rgba(16,35,82,0.94)) 0%, rgba(9,21,58,0.92) 100%)`
      : `linear-gradient(180deg, color-mix(in srgb, ${accent} 16%, rgba(16,35,82,0.90)) 0%, rgba(9,21,58,0.90) 100%)`;
  const nodeBorder = locked
    ? '1.5px solid rgba(111,255,232,0.16)'
    : completed || attempted
    ? `2px solid color-mix(in srgb, ${accent} 68%, transparent)`
    : `1.5px solid color-mix(in srgb, ${accent} 44%, transparent)`;
  const nodeShadow = locked
    ? '0 10px 26px -18px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08)'
    : completed
    ? `0 0 0 3px color-mix(in srgb, ${accent} 16%, transparent), 0 14px 34px -16px color-mix(in srgb, ${accent} 70%, transparent), inset 0 1px 0 rgba(255,255,255,0.22)`
    : attempted
      ? `0 0 0 3px color-mix(in srgb, ${accent} 12%, transparent), 0 12px 30px -16px color-mix(in srgb, ${accent} 58%, transparent), inset 0 1px 0 rgba(255,255,255,0.16)`
      : `0 10px 28px -16px color-mix(in srgb, ${accent} 48%, transparent), inset 0 1px 0 rgba(255,255,255,0.14)`;

  return (
    <button
      type="button"
      data-expansion-topic-id={topicId}
      data-expansion-resume-target={isResumeTarget ? 'true' : undefined}
      className="group flex w-full text-left disabled:cursor-not-allowed disabled:opacity-60"
      disabled={!isReady || opening}
      onClick={() =>
        onSelectTopic({
          topicId,
          locked,
          ready: isReady,
          visited,
        })
      }
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
              : locked
                ? 'rgba(239,244,255,0.72)'
              : 'var(--game-node-text)',
            boxShadow: nodeShadow,
            textShadow: completed ? 'none' : '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          {completed ? (
            <Check size={18} strokeWidth={3} />
          ) : locked ? (
            <Lock size={14} strokeWidth={2.4} />
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
          {completed ? (
            <span style={{ color: accent }}>✓ 완료</span>
          ) : locked ? (
            <span
              className="inline-flex items-center gap-1"
              style={{ color: 'rgba(239,244,255,0.62)' }}
            >
              <Lock size={9} strokeWidth={2.6} />
              잠김
            </span>
          ) : attempted ? (
            <span style={{ color: 'rgba(239,244,255,0.85)' }}>
              확인 {completedQuestionCount}/{questionCount}
            </span>
          ) : visited ? (
            <span style={{ color: 'rgba(239,244,255,0.78)' }}>열림</span>
          ) : isReady ? (
            <span style={{ color: accent }}>에너지 1</span>
          ) : (
            <span style={{ color: 'rgba(239,244,255,0.7)' }}>준비 중</span>
          )}
          <span style={{ color: 'rgba(239,244,255,0.4)' }}>·</span>
          <span className="kr-num uppercase tracking-widest text-[9px]">
            STEP {n}
          </span>
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

function getComhwalTopicUnlockKey(planetKey: string, topicId: string): string {
  return `comhwal-${planetKey}-${topicId}`;
}

function getComhwalTopicProgress(
  planetKey: string,
  topicId: string,
  progress: ProgressStore,
) {
  const cards = getComhwalTopicCards(planetKey, topicId);
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

  return {
    cards,
    cardCount: cards.length,
    questionCount: questionCards.length,
    completedQuestionCount,
    attempted,
    completed:
      questionCards.length > 0 &&
      completedQuestionCount === questionCards.length,
  };
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
  visualHint?: string;
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

  const computerVisual = getComhwalComputerVisualModel(card);
  if (computerVisual) return computerVisual;

  return getComhwalExpansionVisualModel(card);
}

type ComhwalComputerVisualPreset = {
  eyebrow: string;
  title: string;
  lead: string;
  flow: [string, string, string];
  chips?: string[];
  pattern: string;
};

const COMHWAL_SETTINGS_VISUAL_PRESETS: Record<string, ComhwalComputerVisualPreset> = {
  'settings-system': {
    eyebrow: 'WINDOWS SETTINGS',
    title: '시스템 설정은 컴퓨터 상태판',
    lead: '왼쪽 설정 메뉴에서 [시스템]을 열면 화면, 소리, 저장 공간, 전원처럼 컴퓨터 기본 상태를 한곳에서 확인해.',
    flow: ['설정 홈', '시스템', '화면·소리·전원'],
    chips: ['디스플레이', '소리', '저장 공간', '전원'],
    pattern: 'computer-settings-system',
  },
  'personalization-theme': {
    eyebrow: 'WINDOWS SETTINGS',
    title: '개인 설정은 화면 꾸미기',
    lead: '배경, 색, 테마, 잠금 화면처럼 사용자가 보는 겉모습을 바꾸는 메뉴야.',
    flow: ['설정 홈', '개인 설정', '배경·테마'],
    chips: ['배경', '색', '테마'],
    pattern: 'computer-settings-personalization',
  },
  'settings-apps': {
    eyebrow: 'WINDOWS SETTINGS',
    title: '앱 설정은 프로그램 관리',
    lead: '설치된 앱을 확인하고 제거하거나, 파일을 열 기본 앱을 정하는 흐름으로 보면 돼.',
    flow: ['설정 홈', '앱', '설치·기본 앱'],
    chips: ['설치 앱', '앱 제거', '기본 앱'],
    pattern: 'computer-settings-apps',
  },
  'settings-devices': {
    eyebrow: 'WINDOWS SETTINGS',
    title: '장치 설정은 연결 기기 관리',
    lead: '프린터, 마우스, 키보드, 블루투스처럼 컴퓨터에 붙여 쓰는 장비를 다루는 메뉴야.',
    flow: ['설정 홈', '장치', '프린터·마우스'],
    chips: ['프린터', '마우스', '키보드'],
    pattern: 'computer-settings-devices',
  },
  'update-security': {
    eyebrow: 'WINDOWS SETTINGS',
    title: '업데이트와 보안은 보호 센터',
    lead: 'Windows를 최신 상태로 맞추고, 백업·복구처럼 문제가 생겼을 때 돌아올 길을 챙겨.',
    flow: ['설정 홈', '업데이트 및 보안', '패치·복구'],
    chips: ['업데이트', '보안 패치', '백업·복구'],
    pattern: 'computer-settings-security',
  },
};

const includesHint = (hint: string, hints: readonly string[]) => hints.includes(hint);

function getComhwalComputerVisualModel(
  card: ComhwalConceptCard,
): ComhwalVisualModel | null {
  const hint = card.visualHint;
  if (!hint) return null;

  const settingsPreset = COMHWAL_SETTINGS_VISUAL_PRESETS[hint];
  if (settingsPreset) {
    return {
      ...settingsPreset,
      chips: settingsPreset.chips ?? card.keyPoints.slice(0, 3),
      kind: hint,
      visualHint: hint,
      focus: 'generic',
    };
  }

  const base = (preset: ComhwalComputerVisualPreset): ComhwalVisualModel => ({
    ...preset,
    chips: preset.chips ?? card.keyPoints.slice(0, 3),
    kind: hint,
    visualHint: hint,
    focus: 'generic',
  });

  if (
    includesHint(hint, [
      'file-system-shelves',
      'ntfs-permission',
      'folder-options-view',
      'file-unit',
      'file-folder-box',
      'shortcut-arrow',
      'recycle-bin-flow',
    ])
  ) {
    return base({
      eyebrow: 'FILE EXPLORER',
      title: hint === 'recycle-bin-flow' ? '휴지통은 삭제 전 대기실' : '파일은 위치와 권한으로 찾아',
      lead:
        hint === 'shortcut-arrow'
          ? '바로 가기는 원본으로 가는 작은 표지판이라, 표지판을 지워도 원본 자체와는 달라.'
          : hint === 'recycle-bin-flow'
            ? '삭제한 파일은 바로 사라지기 전에 휴지통에 잠시 머물 수 있어. 복원과 완전 삭제를 구분해.'
            : card.body,
      flow:
        hint === 'shortcut-arrow'
          ? ['바로 가기', '대상 경로', '원본 파일']
          : hint === 'recycle-bin-flow'
            ? ['삭제', '휴지통', '복원/비우기']
            : ['저장 장치', '폴더', '파일'],
      pattern: 'computer-file-explorer',
    });
  }

  if (
    includesHint(hint, [
      'gui-window-icons',
      'multitasking-switch',
      'keyboard-shortcut',
      'taskbar-map',
      'task-view-windows',
      'virtual-desktops',
      'start-menu-map',
      'search-box-map',
      'windows-accessories',
      'universal-app-devices',
    ])
  ) {
    return base({
      eyebrow: 'WINDOWS DESKTOP',
      title:
        hint === 'keyboard-shortcut'
          ? '단축키는 손 빠른 조작'
          : hint === 'search-box-map'
            ? '검색 상자는 빠른 길찾기'
            : '바탕화면은 조작 입구',
      lead: card.body,
      flow:
        hint === 'keyboard-shortcut'
          ? ['Ctrl', '+', '작업 실행']
          : hint === 'search-box-map'
            ? ['키워드', '검색', '파일·앱·설정']
            : ['시작', '작업 표시줄', '창 전환'],
      pattern: 'computer-desktop-controls',
    });
  }

  if (
    includesHint(hint, [
      'plug-and-play-device',
      'device-manager-tree',
      'printer-device',
      'print-queue',
      'admin-tools',
      'troubleshooter',
    ])
  ) {
    return base({
      eyebrow: 'DEVICE TOOLS',
      title:
        hint === 'print-queue'
          ? '인쇄는 대기열을 거쳐'
          : hint === 'troubleshooter'
            ? '문제 해결은 자동 점검'
            : '장치는 연결 상태로 관리해',
      lead: card.body,
      flow:
        hint === 'print-queue'
          ? ['인쇄 요청', '대기열', '출력/취소']
          : hint === 'troubleshooter'
            ? ['문제 발견', '자동 진단', '해결 안내']
            : ['장치 연결', '상태 확인', '드라이버'],
      pattern: 'computer-device-tools',
    });
  }

  if (
    includesHint(hint, [
      'computer-classification-scale',
      'data-unit-ladder',
      'complement-bits',
      'binary-representation',
    ])
  ) {
    return base({
      eyebrow: 'DATA SCALE',
      title: hint === 'data-unit-ladder' ? '자료 단위는 계단처럼 커져' : '컴퓨터 값은 기준으로 나눠 봐',
      lead: card.body,
      flow:
        hint === 'data-unit-ladder'
          ? ['bit', 'Byte', 'KB·MB·GB']
          : hint === 'binary-representation'
            ? ['사람이 보는 값', '코드 변환', '0과 1']
            : ['기준', '분류', '비교'],
      pattern: 'computer-data-scale',
    });
  }

  if (
    includesHint(hint, [
      'cpu-core',
      'main-memory',
      'ram-rom-compare',
      'secondary-storage',
      'output-devices',
      'interrupt-signal',
      'motherboard-map',
      'bios-boot',
      'raid-disks',
      'system-management',
      'hardware-upgrade',
    ])
  ) {
    return base({
      eyebrow: 'HARDWARE MAP',
      title:
        hint === 'cpu-core'
          ? 'CPU는 계산과 지휘 중심'
          : hint === 'main-memory' || hint === 'ram-rom-compare'
            ? '주기억장치는 작업 공간'
            : hint === 'secondary-storage' || hint === 'raid-disks'
              ? '저장 장치는 오래 보관해'
              : '부품은 역할과 연결로 이해해',
      lead: card.body,
      flow:
        hint === 'cpu-core'
          ? ['명령', 'CPU', '계산 결과']
          : hint === 'main-memory' || hint === 'ram-rom-compare'
            ? ['CPU', 'RAM/ROM', '작업 데이터']
            : ['부품', '메인보드', '동작'],
      pattern: 'computer-hardware-board',
    });
  }

  if (
    includesHint(hint, [
      'software-vs-hardware',
      'os-resource-manager',
      'os-processing-modes',
      'programming-language',
      'html-css-js',
    ])
  ) {
    return base({
      eyebrow: 'SOFTWARE LAYERS',
      title: hint === 'html-css-js' ? '웹은 구조·꾸밈·동작으로 나눠' : '소프트웨어는 하드웨어를 움직여',
      lead: card.body,
      flow:
        hint === 'html-css-js'
          ? ['HTML 구조', 'CSS 꾸밈', 'JS 동작']
          : ['사용자 작업', '소프트웨어', '하드웨어'],
      pattern: 'computer-software-layers',
    });
  }

  if (
    includesHint(hint, [
      'network-status-card',
      'network-types',
      'network-topology',
      'internet-global',
      'ip-address',
      'protocol-rules',
      'internet-services',
      'ict-services',
    ])
  ) {
    return base({
      eyebrow: 'NETWORK MAP',
      title:
        hint === 'ip-address'
          ? 'IP 주소는 장치 주소'
          : hint === 'protocol-rules'
            ? '프로토콜은 통신 약속'
            : '네트워크는 연결 범위와 길',
      lead: card.body,
      flow:
        hint === 'ip-address'
          ? ['장치', 'IP 주소', '데이터 도착']
          : hint === 'protocol-rules'
            ? ['규칙', '전송', '이해']
            : ['내 컴퓨터', '네트워크', '인터넷'],
      pattern: 'computer-network-map',
    });
  }

  if (
    includesHint(hint, [
      'multimedia-media-types',
      'media-software',
      'bitmap-vector-compare',
      'audio-video-formats',
      'multimedia-use-cases',
    ])
  ) {
    return base({
      eyebrow: 'MEDIA BOARD',
      title:
        hint === 'bitmap-vector-compare'
          ? '비트맵과 벡터는 저장 방식이 달라'
          : '멀티미디어는 여러 매체를 섞어',
      lead: card.body,
      flow:
        hint === 'bitmap-vector-compare'
          ? ['픽셀', '도형 정보', '확대 차이']
          : ['문자', '그림·소리', '영상'],
      pattern: 'computer-media-board',
    });
  }

  if (
    includesHint(hint, [
      'copyright-protection',
      'malware-types',
      'cia-triad',
      'security-methods',
    ])
  ) {
    return base({
      eyebrow: 'SECURITY SHIELD',
      title:
        hint === 'cia-triad'
          ? '보안 3요소는 CIA'
          : hint === 'malware-types'
            ? '악성 코드는 피해 방식이 달라'
            : '보안은 접근과 변조를 막아',
      lead: card.body,
      flow:
        hint === 'cia-triad'
          ? ['기밀성', '무결성', '가용성']
          : ['위협', '점검', '보호'],
      pattern: 'computer-security-shield',
    });
  }

  return null;
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

function ComhwalComputerPattern({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  const pattern = model.pattern ?? '';

  if (pattern.startsWith('computer-settings-')) {
    return <ComhwalSettingsDiagram model={model} accent={accent} />;
  }
  if (pattern === 'computer-file-explorer') {
    return <ComhwalFileExplorerDiagram model={model} accent={accent} />;
  }
  if (pattern === 'computer-desktop-controls') {
    return <ComhwalDesktopDiagram model={model} accent={accent} />;
  }
  if (pattern === 'computer-device-tools') {
    return <ComhwalDeviceToolsDiagram model={model} accent={accent} />;
  }
  if (pattern === 'computer-data-scale') {
    return <ComhwalDataScaleDiagram model={model} accent={accent} />;
  }
  if (pattern === 'computer-hardware-board') {
    return <ComhwalHardwareBoardDiagram model={model} accent={accent} />;
  }
  if (pattern === 'computer-software-layers') {
    return <ComhwalSoftwareLayersDiagram model={model} accent={accent} />;
  }
  if (pattern === 'computer-network-map') {
    return <ComhwalNetworkMapDiagram model={model} accent={accent} />;
  }
  if (pattern === 'computer-media-board') {
    return <ComhwalMediaBoardDiagram model={model} accent={accent} />;
  }
  if (pattern === 'computer-security-shield') {
    return <ComhwalSecurityShieldDiagram model={model} accent={accent} />;
  }

  return (
    <ComhwalDiagramFrame accent={accent}>
      <ComhwalVisualFlow model={model} accent={accent} />
    </ComhwalDiagramFrame>
  );
}

function ComhwalIconCard({
  label,
  sub,
  Icon,
  accent,
  active = false,
  compact = false,
  muted = false,
}: {
  label: string;
  sub?: string;
  Icon: LucideIcon;
  accent: string;
  active?: boolean;
  compact?: boolean;
  muted?: boolean;
}) {
  const mutedAccentBorder = getComhwalMutedAccentBorder(accent);
  const mutedAccentFill = getComhwalMutedAccentFill(accent);
  const borderColor = active
    ? muted
      ? mutedAccentBorder
      : accent
    : 'rgba(239,244,255,0.14)';
  const cardBackground =
    active && muted
      ? mutedAccentFill
      : active
        ? `linear-gradient(180deg, color-mix(in srgb, ${accent} 22%, rgba(239,244,255,0.08)), rgba(239,244,255,0.055))`
        : 'rgba(239,244,255,0.055)';
  const iconBackground =
    active && muted
      ? `linear-gradient(180deg, color-mix(in srgb, ${accent} 18%, rgba(9,26,60,0.96)), rgba(6,18,49,0.96))`
      : active
        ? accent
        : 'rgba(1,8,40,0.34)';
  const iconColor = active && muted ? accent : active ? '#07121f' : accent;

  return (
    <div
      className={`relative min-w-0 rounded-2xl border ${compact ? 'p-2' : 'p-3'}`}
      style={{
        borderColor,
        background: cardBackground,
        boxShadow:
          active && !muted
            ? `0 0 18px color-mix(in srgb, ${accent} 30%, transparent)`
            : 'none',
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border"
          style={{
            borderColor,
            background: iconBackground,
            color: iconColor,
          }}
        >
          <Icon size={16} strokeWidth={2.5} />
        </span>
        <span className="min-w-0 kr-heading text-[11px] leading-tight text-cream/88">
          {label}
        </span>
      </div>
      {sub ? (
        <p className="mt-2 kr-body text-[10.5px] font-bold leading-snug text-cream/52">
          {sub}
        </p>
      ) : null}
    </div>
  );
}

function getComhwalMutedAccentBorder(accent: string) {
  return `color-mix(in srgb, ${accent} 46%, rgba(239,244,255,0.14))`;
}

function getComhwalMutedAccentFill(accent: string) {
  return `linear-gradient(180deg, color-mix(in srgb, ${accent} 12%, rgba(10,28,66,0.96)), rgba(5,17,47,0.94))`;
}

function ComhwalSettingsDiagram({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  const pattern = model.pattern ?? '';
  const activeKey = pattern.includes('personalization')
    ? 'personalization'
    : pattern.includes('apps')
      ? 'apps'
      : pattern.includes('devices')
        ? 'devices'
        : pattern.includes('security')
          ? 'security'
          : 'system';
  const menuItems: Array<{ key: string; label: string; Icon: LucideIcon }> = [
    { key: 'system', label: '시스템', Icon: Monitor },
    { key: 'personalization', label: '개인 설정', Icon: Palette },
    { key: 'apps', label: '앱', Icon: AppWindow },
    { key: 'devices', label: '장치', Icon: MousePointer2 },
    { key: 'security', label: '업데이트', Icon: ShieldCheck },
  ];
  const panelMap: Record<string, Array<{ label: string; sub: string; Icon: LucideIcon }>> = {
    system: [
      { label: '디스플레이', sub: '화면·해상도', Icon: Monitor },
      { label: '소리', sub: '출력·볼륨', Icon: Volume2 },
      { label: '저장 공간', sub: '디스크 상태', Icon: HardDrive },
      { label: '전원', sub: '절전·배터리', Icon: BatteryCharging },
    ],
    personalization: [
      { label: '배경', sub: '바탕화면', Icon: Monitor },
      { label: '색', sub: '테마 색', Icon: Palette },
      { label: '테마', sub: '화면 분위기', Icon: AppWindow },
      { label: '잠금 화면', sub: '로그인 전 화면', Icon: Lock },
    ],
    apps: [
      { label: '설치 앱', sub: '목록 확인', Icon: ListTodo },
      { label: '앱 제거', sub: '프로그램 삭제', Icon: X },
      { label: '기본 앱', sub: '파일 연결', Icon: AppWindow },
      { label: '옵션 기능', sub: '추가 구성', Icon: Settings },
    ],
    devices: [
      { label: '프린터', sub: '출력 장치', Icon: Printer },
      { label: '마우스', sub: '포인터 조작', Icon: MousePointer2 },
      { label: '키보드', sub: '입력 장치', Icon: Keyboard },
      { label: '블루투스', sub: '무선 연결', Icon: Wifi },
    ],
    security: [
      { label: 'Windows 업데이트', sub: '최신 상태', Icon: RotateCcw },
      { label: '보안 패치', sub: '취약점 보완', Icon: ShieldCheck },
      { label: '백업', sub: '되돌릴 준비', Icon: HardDrive },
      { label: '복구', sub: '문제 후 복원', Icon: Wrench },
    ],
  };
  const activeMenu = menuItems.find((item) => item.key === activeKey) ?? menuItems[0];
  const ActiveIcon = activeMenu.Icon;
  const panelCards = panelMap[activeKey] ?? panelMap.system;
  const mutedAccentBorder = getComhwalMutedAccentBorder(accent);
  const mutedAccentFill = getComhwalMutedAccentFill(accent);

  return (
    <ComhwalDiagramFrame accent={accent}>
      <div className="grid grid-cols-[94px_1fr] gap-3">
        <div className="space-y-1.5 rounded-2xl border border-cream/10 bg-white/[0.035] p-1.5">
          {menuItems.map((item) => {
            const Icon = item.Icon;
            const active = item.key === activeKey;
            return (
              <div
                key={item.key}
                className="flex min-h-[34px] items-center gap-1.5 rounded-xl border px-2 kr-heading text-[10px] leading-tight"
                style={{
                  borderColor: active ? mutedAccentBorder : 'transparent',
                  background: active ? mutedAccentFill : 'transparent',
                  color: active ? 'rgba(239,244,255,0.92)' : 'rgba(239,244,255,0.62)',
                }}
              >
                <Icon
                  size={13}
                  strokeWidth={2.5}
                  style={{ color: active ? accent : 'currentColor' }}
                />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        <div className="min-w-0 rounded-2xl border border-cream/12 bg-[#07183b]/80 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border"
                style={{
                  borderColor: mutedAccentBorder,
                  background: mutedAccentFill,
                  color: accent,
                }}
              >
                <ActiveIcon size={18} strokeWidth={2.6} />
              </span>
              <div className="min-w-0">
                <div className="kr-heading text-[15px] leading-none text-cream">
                  {activeMenu.label}
                </div>
                <div className="mt-1 kr-body text-[10.5px] font-bold text-cream/48">
                  Windows 설정 패널
                </div>
              </div>
            </div>
            <Settings size={17} strokeWidth={2.4} style={{ color: 'rgba(239,244,255,0.5)' }} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {panelCards.map((item) => (
              <ComhwalIconCard
                key={item.label}
                label={item.label}
                sub={item.sub}
                Icon={item.Icon}
                accent={accent}
                active
                compact
                muted
              />
            ))}
          </div>
        </div>
      </div>
    </ComhwalDiagramFrame>
  );
}

function ComhwalFileExplorerDiagram({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  const hint = model.visualHint ?? '';
  const isShortcut = hint === 'shortcut-arrow';
  const isRecycle = hint === 'recycle-bin-flow';
  const activeRows = isRecycle ? ['삭제 파일', '복원'] : isShortcut ? ['바로 가기', '원본'] : ['문서', '사진'];

  return (
    <ComhwalDiagramFrame accent={accent}>
      <div className="grid grid-cols-[86px_1fr] gap-3">
        <div className="rounded-2xl border border-cream/10 bg-white/[0.035] p-2">
          {['내 PC', '문서', '다운로드'].map((item, index) => (
            <div
              key={item}
              className="mb-1.5 flex items-center gap-1.5 rounded-xl px-2 py-1.5 kr-heading text-[10px] last:mb-0"
              style={{
                background: index === 1 ? `color-mix(in srgb, ${accent} 20%, rgba(255,255,255,0.04))` : 'transparent',
                color: index === 1 ? 'rgba(239,244,255,0.92)' : 'rgba(239,244,255,0.52)',
              }}
            >
              <Folder size={13} strokeWidth={2.4} style={{ color: index === 1 ? accent : 'currentColor' }} />
              {item}
            </div>
          ))}
        </div>
        <div className="min-w-0 rounded-2xl border border-cream/12 bg-[#07183b]/78 p-3">
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-cream/10 bg-white/[0.045] px-3 py-2 kr-num text-[10px] text-cream/58">
            <Folder size={13} style={{ color: accent }} />
            C:\Users\QuestDP\문서
          </div>
          <div className="grid gap-1.5">
            {[
              { label: activeRows[0], Icon: isRecycle ? Trash2 : isShortcut ? ArrowRight : FileText },
              { label: activeRows[1], Icon: isShortcut ? FileText : Folder },
              { label: isRecycle ? '완전 삭제' : '권한·위치', Icon: isRecycle ? X : Lock },
            ].map((row, index) => {
              const Icon = row.Icon;
              return (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-xl border px-3 py-2"
                  style={{
                    borderColor: index < 2 ? accent : 'rgba(239,244,255,0.12)',
                    background: index < 2 ? `color-mix(in srgb, ${accent} 14%, rgba(255,255,255,0.04))` : 'rgba(255,255,255,0.035)',
                  }}
                >
                  <span className="flex items-center gap-2 kr-heading text-[11px] text-cream/82">
                    <Icon size={14} strokeWidth={2.4} style={{ color: index < 2 ? accent : 'rgba(239,244,255,0.46)' }} />
                    {row.label}
                  </span>
                  {index === 0 ? <Check size={14} strokeWidth={2.8} style={{ color: accent }} /> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ComhwalDiagramFrame>
  );
}

function ComhwalDesktopDiagram({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  const hint = model.visualHint ?? '';
  const isKeyboard = hint === 'keyboard-shortcut';
  const isSearch = hint === 'search-box-map';

  if (isKeyboard) {
    return (
      <ComhwalDiagramFrame accent={accent}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {['Ctrl', '+', model.flow[2] ?? '작업 실행'].map((item, index) => (
            <div key={`${item}-${index}`} className={index === 1 ? 'kr-heading text-center text-[18px]' : ''} style={{ color: index === 1 ? accent : undefined }}>
              {index === 1 ? (
                item
              ) : (
                <ComhwalIconCard
                  label={item}
                  Icon={index === 0 ? Keyboard : Check}
                  accent={accent}
                  active
                  compact
                  muted
                />
              )}
            </div>
          ))}
        </div>
      </ComhwalDiagramFrame>
    );
  }

  return (
    <ComhwalDiagramFrame accent={accent}>
      <div className="relative h-[150px] overflow-hidden rounded-2xl border border-cream/12 bg-[#07183b]/82 p-3">
        <div className="grid grid-cols-3 gap-2">
          {(isSearch ? ['파일', '앱', '설정'] : ['문서', '브라우저', '설정']).map((label, index) => (
            <div
              key={label}
              className="rounded-2xl border p-2"
              style={{
                borderColor: index === 1 ? accent : 'rgba(239,244,255,0.12)',
                background: index === 1 ? `color-mix(in srgb, ${accent} 14%, rgba(255,255,255,0.05))` : 'rgba(255,255,255,0.04)',
              }}
            >
              <AppWindow size={16} strokeWidth={2.4} style={{ color: index === 1 ? accent : 'rgba(239,244,255,0.48)' }} />
              <div className="mt-2 kr-heading text-[10px] text-cream/78">{label}</div>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-2xl border border-cream/12 bg-[#020b25]/90 px-2 py-2">
          <div
            className="rounded-xl border px-2 py-1 kr-heading text-[10px]"
            style={{
              borderColor: getComhwalMutedAccentBorder(accent),
              background: getComhwalMutedAccentFill(accent),
              color: 'rgba(239,244,255,0.88)',
            }}
          >
            시작
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl bg-white/[0.08] px-2 py-1.5 kr-body text-[10.5px] font-bold text-cream/58">
            <Search size={12} strokeWidth={2.5} style={{ color: isSearch ? accent : 'currentColor' }} />
            {isSearch ? '검색어로 빠르게 찾기' : '작업 표시줄'}
          </div>
          <MousePointer2 size={15} strokeWidth={2.5} style={{ color: accent }} />
        </div>
      </div>
    </ComhwalDiagramFrame>
  );
}

function ComhwalDeviceToolsDiagram({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  const hint = model.visualHint ?? '';
  const isPrint = hint === 'print-queue' || hint === 'printer-device';

  return (
    <ComhwalDiagramFrame accent={accent}>
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
        {model.flow.slice(0, 3).map((item, index) => {
          const Icon = isPrint ? (index === 2 ? Printer : FileText) : index === 0 ? MousePointer2 : index === 1 ? Wrench : Check;
          return (
            <div key={item} className="contents">
              <ComhwalIconCard
                label={item}
                Icon={Icon}
                accent={accent}
                active={index === 1}
                compact
                muted
              />
              {index < 2 ? <ArrowRight size={15} strokeWidth={2.5} style={{ color: accent }} /> : null}
            </div>
          );
        })}
      </div>
      <div className="mt-3 rounded-2xl border border-cream/10 bg-white/[0.04] p-2">
        {(isPrint ? ['대기 중', '일시 중지', '취소 가능'] : ['상태 확인', '오류 표시', '해결 안내']).map((item, index) => (
          <div
            key={item}
            className="mb-1.5 h-7 rounded-xl px-3 py-1.5 kr-heading text-[10px] last:mb-0"
            style={{
              border: index === 0 ? `1px solid ${getComhwalMutedAccentBorder(accent)}` : '1px solid transparent',
              background: index === 0 ? getComhwalMutedAccentFill(accent) : 'rgba(239,244,255,0.06)',
              color: index === 0 ? 'rgba(239,244,255,0.86)' : 'rgba(239,244,255,0.66)',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </ComhwalDiagramFrame>
  );
}

function ComhwalDataScaleDiagram({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  return (
    <ComhwalDiagramFrame accent={accent}>
      <div className="space-y-2">
        {model.flow.slice(0, 3).map((item, index) => (
          <div
            key={item}
            className="grid grid-cols-[44px_1fr] items-center gap-3 rounded-2xl border px-3 py-2"
            style={{
              width: `calc(100% - ${(2 - index) * 22}px)`,
              marginLeft: `${index * 22}px`,
              borderColor: index === 1 ? accent : 'rgba(239,244,255,0.14)',
              background: index === 1 ? `color-mix(in srgb, ${accent} 16%, rgba(255,255,255,0.05))` : 'rgba(255,255,255,0.045)',
            }}
          >
            <span
              className="grid h-8 w-8 place-items-center rounded-xl border kr-num text-[11px]"
              style={{
                borderColor: index === 1 ? getComhwalMutedAccentBorder(accent) : 'transparent',
                background: index === 1 ? getComhwalMutedAccentFill(accent) : 'rgba(255,255,255,0.08)',
                color: index === 1 ? accent : 'rgba(239,244,255,0.62)',
              }}
            >
              {index + 1}
            </span>
            <span className="kr-heading text-[12px] text-cream/82">{item}</span>
          </div>
        ))}
      </div>
    </ComhwalDiagramFrame>
  );
}

function ComhwalHardwareBoardDiagram({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  const hint = model.visualHint ?? '';
  const active = hint.includes('cpu')
    ? 'CPU'
    : hint.includes('memory') || hint.includes('ram')
      ? 'RAM'
      : hint.includes('storage') || hint.includes('raid')
        ? 'SSD'
        : 'BUS';

  return (
    <ComhwalDiagramFrame accent={accent}>
      <div className="relative h-[156px] rounded-2xl border border-cream/12 bg-[#07183b]/82 p-3">
        <div className="absolute left-1/2 top-1/2 h-px w-[72%] -translate-x-1/2" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
        <div className="absolute left-1/2 top-1/2 h-[74%] w-px -translate-y-1/2" style={{ background: `linear-gradient(180deg, transparent, ${accent}, transparent)` }} />
        {[
          { label: 'CPU', x: '50%', y: '50%', Icon: Cpu },
          { label: 'RAM', x: '18%', y: '24%', Icon: HardDrive },
          { label: 'SSD', x: '82%', y: '24%', Icon: HardDrive },
          { label: '출력', x: '18%', y: '76%', Icon: Monitor },
          { label: 'BUS', x: '82%', y: '76%', Icon: Settings },
        ].map((part) => {
          const Icon = part.Icon;
          const isActive = part.label === active;
          return (
            <div
              key={part.label}
              className="absolute flex h-14 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border"
              style={{
                left: part.x,
                top: part.y,
                borderColor: isActive ? getComhwalMutedAccentBorder(accent) : 'rgba(239,244,255,0.14)',
                background: isActive ? getComhwalMutedAccentFill(accent) : 'rgba(1,8,40,0.72)',
                color: isActive ? 'rgba(239,244,255,0.88)' : 'rgba(239,244,255,0.76)',
                boxShadow: 'none',
              }}
            >
              <Icon size={16} strokeWidth={2.4} style={{ color: isActive ? accent : 'currentColor' }} />
              <span className="mt-1 kr-heading text-[10px]">{part.label}</span>
            </div>
          );
        })}
      </div>
    </ComhwalDiagramFrame>
  );
}

function ComhwalSoftwareLayersDiagram({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  return (
    <ComhwalDiagramFrame accent={accent}>
      <div className="space-y-2">
        {model.flow.slice(0, 3).map((item, index) => (
          <div
            key={item}
            className="rounded-2xl border px-4 py-3"
            style={{
              borderColor: index === 1 ? getComhwalMutedAccentBorder(accent) : 'rgba(239,244,255,0.14)',
              background: index === 1 ? getComhwalMutedAccentFill(accent) : 'rgba(255,255,255,0.045)',
              color: index === 1 ? 'rgba(239,244,255,0.88)' : 'rgba(239,244,255,0.8)',
              transform: `translateX(${Math.abs(index - 1) * 12}px)`,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="kr-heading text-[12px]">{item}</span>
              <span className="kr-num text-[10px] opacity-70">
                {index === 0 ? 'request' : index === 1 ? 'translate' : 'run'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ComhwalDiagramFrame>
  );
}

function ComhwalNetworkMapDiagram({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  return (
    <ComhwalDiagramFrame accent={accent}>
      <div className="relative mx-auto h-[150px] max-w-[300px]">
        <div className="absolute left-[20%] top-[62%] h-px w-[60%]" style={{ background: accent }} />
        <div className="absolute left-[50%] top-[22%] h-[42%] w-px" style={{ background: accent }} />
        {[
          { label: model.flow[0] ?? '내 컴퓨터', x: '18%', y: '64%', Icon: Monitor },
          { label: model.flow[1] ?? '네트워크', x: '50%', y: '22%', Icon: Wifi },
          { label: model.flow[2] ?? '인터넷', x: '82%', y: '64%', Icon: Globe2 },
        ].map((node, index) => {
          const Icon = node.Icon;
          return (
            <div
              key={node.label}
              className="absolute flex h-16 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border px-1 text-center"
              style={{
                left: node.x,
                top: node.y,
                borderColor: index === 1 ? getComhwalMutedAccentBorder(accent) : 'rgba(239,244,255,0.14)',
                background: index === 1 ? getComhwalMutedAccentFill(accent) : 'rgba(1,8,40,0.78)',
                color: index === 1 ? 'rgba(239,244,255,0.88)' : 'rgba(239,244,255,0.8)',
                boxShadow: 'none',
              }}
            >
              <Icon size={17} strokeWidth={2.4} style={{ color: index === 1 ? accent : 'currentColor' }} />
              <span className="mt-1 kr-heading text-[10px] leading-tight">{node.label}</span>
            </div>
          );
        })}
      </div>
    </ComhwalDiagramFrame>
  );
}

function ComhwalMediaBoardDiagram({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  const hint = model.visualHint ?? '';
  const cards =
    hint === 'bitmap-vector-compare'
      ? [
          { label: '비트맵', sub: '픽셀 저장', Icon: Monitor },
          { label: '벡터', sub: '도형 정보', Icon: Star },
          { label: '확대', sub: '깨짐 차이', Icon: Search },
        ]
      : [
          { label: '문자', sub: '읽는 정보', Icon: FileText },
          { label: '그림', sub: '보는 정보', Icon: Monitor },
          { label: '소리·영상', sub: '듣고 보는 정보', Icon: Volume2 },
        ];

  return (
    <ComhwalDiagramFrame accent={accent}>
      <div className="grid grid-cols-3 gap-2">
        {cards.map((item, index) => (
          <ComhwalIconCard
            key={item.label}
            label={item.label}
            sub={item.sub}
            Icon={item.Icon}
            accent={accent}
            active={index === 1}
            compact
            muted
          />
        ))}
      </div>
    </ComhwalDiagramFrame>
  );
}

function ComhwalSecurityShieldDiagram({
  model,
  accent,
}: {
  model: ComhwalVisualModel;
  accent: string;
}) {
  return (
    <ComhwalDiagramFrame accent={accent}>
      <div className="grid grid-cols-[88px_1fr] gap-3">
        <div
          className="flex min-h-[132px] flex-col items-center justify-center rounded-[28px] border"
          style={{
            borderColor: accent,
            background: `radial-gradient(circle at 50% 16%, color-mix(in srgb, ${accent} 22%, transparent), rgba(1,8,40,0.72))`,
            color: accent,
          }}
        >
          <ShieldCheck size={38} strokeWidth={2.1} />
          <span className="mt-2 kr-num text-[10px] uppercase tracking-widest">protect</span>
        </div>
        <div className="grid gap-2">
          {model.flow.slice(0, 3).map((item, index) => (
            <div
              key={item}
              className="rounded-2xl border px-3 py-2 kr-heading text-[11px]"
              style={{
                borderColor: index === 1 ? getComhwalMutedAccentBorder(accent) : 'rgba(239,244,255,0.14)',
                background: index === 1 ? getComhwalMutedAccentFill(accent) : 'rgba(255,255,255,0.045)',
                color: index === 1 ? 'rgba(239,244,255,0.88)' : 'rgba(239,244,255,0.78)',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </ComhwalDiagramFrame>
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

  if (pattern.startsWith('computer-')) {
    return <ComhwalComputerPattern model={model} accent={accent} />;
  }
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

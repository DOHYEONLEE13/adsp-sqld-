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

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
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
import { getStudyMode, setStudyMode, type StudyMode } from '../studyMode';
import { computePlayerStats, type PlayerStats } from '../rpg';
import Ques from '@/components/mascot/Ques';
import SpeechBubble from '@/game/lesson/SpeechBubble';
import type { QuesPose } from '@/components/mascot/types';
import type { ProgressStore } from '../storage';
import VideoBg from '@/components/ui/VideoBg';
import { VIDEO_URLS } from '@/data/site';
import { useMyProfile } from '@/data/profile';
import NicknameOnboarding from './NicknameOnboarding';

interface Props {
  onSelectSubject: (subject: Subject) => void;
  onStartDailyMission: (subject: Subject) => void;
  onStartMockExam: (subject: Subject) => void;
  onOpenReview: () => void;
  onExit: () => void;
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
  | { kind: 'launching'; subject: Subject };

export default function GalaxyScreen({
  onSelectSubject,
  onStartDailyMission,
  onStartMockExam,
  onOpenReview,
  onExit,
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

  const [view, setView] = useState<View>({ kind: 'overview' });

  // 닉네임 onboarding 게이트 — 첫 방문 + 닉네임 미설정일 때만 노출.
  //
  // 단순화 (2026-05-04): tag 는 이제 server-issued 만 — 게스트는 항상 ''.
  // "닉네임 미설정" = displayName.trim() === '' 만 체크하면 됨.
  //
  // sync-loading (pendingServerSync) 동안엔 surge 방지 위해 false 로 친다.
  // - "건너뛰기" 누른 사용자는 onboardingDismissed 로 한 세션 동안 다시 안 뜸.
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const hasNickname = profile.displayName.trim() !== '';
  const needsNicknameOnboarding =
    !onboardingDismissed &&
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

  const handlePlanetClick = (subject: Subject) => {
    if (view.kind === 'launching') return;
    const total = subject === 'adsp' ? adspTotal : sqldTotal;
    if (total === 0) return;
    setView({ kind: 'detail', subject });
  };

  const handleBack = () => setView({ kind: 'overview' });
  const handlePlay = (subject: Subject) =>
    setView({ kind: 'launching', subject });

  const selectedSubject =
    view.kind === 'detail' || view.kind === 'launching' ? view.subject : null;
  const isLaunching = view.kind === 'launching';

  // 오늘 데일리 미션 완료 여부 — banner 상태 표시.
  const dailyDoneToday = isToday(progress.lastDailyMissionAt);

  // 첫 방문자 — 닉네임 onboarding 만 노출하고 chooser 는 그 후에.
  if (needsNicknameOnboarding) {
    return (
      <NicknameOnboarding onDone={() => setOnboardingDismissed(true)} />
    );
  }

  return (
    <section
      className="relative min-h-screen isolate overflow-hidden"
      style={{ background: BG, color: FG }}
    >
      {/* === Background: Mux HLS ambient + 흰글씨 가독성용 어두운 그라디언트 === */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <VideoBg src={VIDEO_URLS.pageAmbient} fit="cover" />
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
          <IconBox label="돌아가기" onClick={onExit}>
            <ArrowLeft size={16} strokeWidth={2} />
          </IconBox>

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
            Entering {selectedSubject?.toUpperCase()}…
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
  // 다른 페이지(FriendsPage·AuthCard) 와 동일한 패턴.
  const [isSignedIn, setIsSignedIn] = useState(false);
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setIsSignedIn(!!data.session));
    const unsub = onAuthStateChange((_e, s) => setIsSignedIn(!!s));
    return () => {
      unsub();
    };
  }, []);

  // 학습 모드 — 과목별 첫 진입 시 1회 묻고, 이후엔 기억된 값 사용.
  // 'review' 면 GamePage 가 자동으로 passNumber=2 로 시작 (studyMode.passNumberFor).
  const [studyMode, setStudyModeState] = useState<StudyMode | undefined>(() =>
    getStudyMode(subject),
  );
  const handleStudyModeSelect = (mode: StudyMode) => {
    setStudyMode(subject, mode);
    setStudyModeState(mode);
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

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={onPlay}
            disabled={launching || total === 0 || !studyMode}
            aria-label={
              !studyMode
                ? '학습 모드를 먼저 선택해주세요'
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
            {launching ? '워프 중…' : `${subject.toUpperCase()} 플레이하기`}
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


/**
 * Galaxy 화면 — 과목 선택.
 *
 * 2D 풀블리드 레이아웃. 중앙에 Ques 마스코트 + ADSP/SQLD 선택 카드가 놓이고,
 * 모든 UI(타이틀/HUD/데일리 미션)는 그 위에 오버레이로 배치됩니다.
 *
 * 선택 카드 클릭 → 과목 상세 패널(우측 하단).
 * "플레이하기" 버튼 → 워프 트랜지션 → Planet 화면.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  ChevronRight,
  RotateCcw,
  Star,
  X,
} from 'lucide-react';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import type { Subject } from '@/types/question';
import { playableCount } from '../session';
import ProgressBadge from '../components/ProgressBadge';
import DailyMissionCard from '../components/DailyMissionCard';
import { aggregateSubject } from '../aggregate';
import { useProgress } from '../useProgress';
import { useBookmarks } from '../useBookmarks';
import { computePlayerStats, type PlayerStats } from '../rpg';
import PlayerHud from '../components/PlayerHud';
import Ques from '@/components/mascot/Ques';
import SpeechBubble from '@/game/lesson/SpeechBubble';
import type { QuesPose } from '@/components/mascot/types';
import type { ProgressStore } from '../storage';
import DailyQuestsCard from '../components/DailyQuestsCard';
import { getTodayQuests } from '../dailyQuests';

interface Props {
  onSelectSubject: (subject: Subject) => void;
  onStartDailyMission: (subject: Subject) => void;
  onStartMockExam: (subject: Subject) => void;
  onOpenReview: () => void;
  onExit: () => void;
}

/** 워프 완료 후 실제 Subject 전환까지 대기할 시간 (ms). */
const WARP_DURATION_MS = 900;

/** 과목별 소개 문구 — info 패널 상단. */
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
  const bookmarkCount = bookmarks.ids.size;
  const playerStats = computePlayerStats(progress);
  const dailyQuests = getTodayQuests(progress);
  const defaultMissionSubject: Subject =
    playableCount('adsp') >= playableCount('sqld') ? 'adsp' : 'sqld';

  const adspTotal = playableCount('adsp');
  const sqldTotal = playableCount('sqld');

  const [view, setView] = useState<View>({ kind: 'overview' });

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

  return (
    <section className="relative min-h-screen bg-base text-cream isolate overflow-hidden">
      {/* === Background: 2D 은하 (풀 블리드) === */}
      <div className="absolute inset-0">
        <GalaxyStarfield />

        {/* 상하 그라디언트 — 텍스트 가독성용 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(1,8,40,0.65) 0%, rgba(1,8,40,0) 22%, rgba(1,8,40,0) 60%, rgba(1,8,40,0.55) 100%)',
          }}
        />
      </div>

      {/* === Overlay: Top === */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 p-4 md:p-10 lg:p-14 z-10">
        {/* 최상단 row — 항상 back(좌) + 액션 버튼(우) inline */}
        <div className="flex items-center justify-between gap-3 mb-4 md:mb-5">
          <button
            type="button"
            onClick={onExit}
            aria-label="돌아가기"
            className="pointer-events-auto w-11 h-11 rounded-full inline-flex items-center justify-center liquid-glass hover:bg-white/10 transition shrink-0"
          >
            <ArrowLeft size={18} strokeWidth={2.4} />
          </button>

          <div className="pointer-events-auto flex gap-2">
            <DailyQuestsCard
              quests={dailyQuests}
              compact
              onClick={() => {
                window.location.hash = '/stats';
              }}
            />
            <button
              type="button"
              onClick={onOpenReview}
              aria-label="복습"
              className="liquid-glass kr-heading inline-flex items-center gap-2 whitespace-nowrap text-[10px] md:text-[11px] uppercase tracking-widest px-3 py-2 md:px-4 md:py-2.5 rounded-full hover:bg-white/10 transition"
            >
              <RotateCcw size={12} strokeWidth={2.4} />
              <span className="hidden sm:inline">복습</span>
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.hash = '/bookmarks';
              }}
              aria-label="북마크"
              className="liquid-glass kr-heading inline-flex items-center gap-2 whitespace-nowrap text-[10px] md:text-[11px] uppercase tracking-widest px-3 py-2 md:px-4 md:py-2.5 rounded-full hover:bg-white/10 transition"
            >
              <Star
                size={12}
                strokeWidth={2.4}
                className={bookmarkCount > 0 ? 'text-[#fbbf24]' : ''}
                fill={bookmarkCount > 0 ? 'currentColor' : 'none'}
              />
              <span className="hidden sm:inline">북마크</span>
              {bookmarkCount > 0 ? (
                <span
                  className="ml-1 text-[10px] px-2 py-0.5 rounded-full tabular-nums"
                  style={{
                    background: 'rgba(251,191,36,0.14)',
                    color: '#fbbf24',
                  }}
                >
                  {bookmarkCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.hash = '/stats';
              }}
              aria-label="대시보드"
              className="liquid-glass kr-heading inline-flex items-center gap-2 whitespace-nowrap text-[10px] md:text-[11px] uppercase tracking-widest px-3 py-2 md:px-4 md:py-2.5 rounded-full hover:bg-white/10 transition"
            >
              <BarChart3 size={12} strokeWidth={2.4} />
              <span className="hidden sm:inline">대시보드</span>
            </button>
          </div>
        </div>

        {/* 콘텐츠 row — 타이틀(좌) + HUD(우). 모바일은 세로 스택. */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
          <div className="flex flex-col w-full md:max-w-[640px]">
            <span className="cursive text-neon text-[24px] md:text-[40px] leading-none drop-shadow-[0_0_20px_rgba(111,255,0,0.35)]">
              Galaxy
            </span>
            <h1 className="kr-heading uppercase text-[28px] md:text-[48px] lg:text-[60px] mt-2 leading-[1.05] drop-shadow-[0_2px_20px_rgba(0,0,0,0.75)]">
              은하를 선택하라
            </h1>
          </div>

          {/* PlayerHud — 모바일은 타이틀 아래 풀폭, 데스크탑은 우측 고정폭 */}
          <div className="pointer-events-auto w-full md:max-w-[380px] shrink-0 hud-in-overlay">
            <PlayerHud stats={playerStats} />
          </div>
        </div>
      </div>

      {/* === Overlay: Bottom-left — Daily Mission ===
          모바일에서는 SubjectInfoPanel 이 풀폭으로 하단을 차지하므로
          과목 선택 상태(detail/launching)에서는 숨김. 데스크탑은 좌우로 나뉘어 문제 없음. */}
      <div
        className={`pointer-events-none absolute bottom-0 left-0 p-4 md:p-10 lg:p-14 w-full md:w-auto md:max-w-[420px] z-10 ${
          selectedSubject ? 'hidden md:block' : ''
        }`}
      >
        <div className="pointer-events-auto">
          <DailyMissionCard
            subject={defaultMissionSubject}
            subjectLabel={SUBJECT_SCHEMAS[defaultMissionSubject].title}
            onStart={onStartDailyMission}
          />
        </div>
      </div>

      {/* === Overlay: Center — Subject Chooser (overview 한정) ===
          조롱이 마스코트가 사용자에게 ADSP/SQLD 중 오늘의 과목을 고르라고 안내.
          모바일에선 상단의 타이틀·HUD 와 겹치지 않도록 top 을 고정하고 bottom 은 데일리
          미션 카드 위쪽에서 멈춤. 데스크탑은 HUD 가 우상단이라 inset-0 로 중앙 정렬. */}
      {view.kind === 'overview' ? (
        <div className="pointer-events-none absolute inset-x-0 top-[260px] bottom-[170px] md:top-[240px] md:bottom-[200px] flex items-center justify-center z-10 px-5">
          <div className="pointer-events-auto flex flex-col items-center gap-3 md:gap-5 w-full max-w-[560px]">
            <ChooserMascot stats={playerStats} progress={progress} />
            <div className="flex items-stretch gap-3 md:gap-4 w-full">
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
          </div>
        </div>
      ) : null}

      {/* === Overlay: Bottom-right — Subject Info Panel === */}
      {selectedSubject ? (
        <div className="absolute bottom-0 right-0 p-4 md:p-6 lg:p-10 w-full md:w-auto md:max-w-[460px] z-20">
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
      ) : null}

      {/* === Overlay: Full — 워프 === */}
      {isLaunching ? (
        (() => {
          const warpAccent =
            selectedSubject === 'adsp' ? '#67e8f9' : '#c084fc';
          return (
            <div
              className="warp-overlay pointer-events-none absolute inset-0 flex items-center justify-center z-30"
              style={{
                background: `radial-gradient(ellipse at center, ${warpAccent}2e 0%, ${warpAccent}14 40%, rgba(1,8,40,0.88) 85%)`,
              }}
            >
              <div
                className="warp-text kr-heading uppercase text-[18px] md:text-[22px] text-center"
                style={{
                  color: warpAccent,
                  textShadow: `0 0 18px ${warpAccent}, 0 0 40px ${warpAccent}66`,
                }}
              >
                Entering {selectedSubject?.toUpperCase()} Galaxy…
              </div>
            </div>
          );
        })()
      ) : null}

    </section>
  );
}

// ----------------------------------------------------------------
// GalaxyStarfield — 심우주 그라디언트 + SVG 별밭. 배경 전용.
// ----------------------------------------------------------------

function GalaxyStarfield() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 심우주 그라디언트 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(103,232,249,0.12) 0%, rgba(1,8,40,0) 55%),' +
            'radial-gradient(ellipse at 75% 80%, rgba(192,132,252,0.14) 0%, rgba(1,8,40,0) 55%),' +
            'linear-gradient(180deg, #010828 0%, #020a30 100%)',
        }}
      />
      {/* 정적 별밭 (SVG) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-70"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        {STARFIELD_2D.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#eff4ff"
            opacity={s.o}
          />
        ))}
      </svg>
    </div>
  );
}

const STARFIELD_2D = Array.from({ length: 80 }, (_, i) => {
  const seed = (i + 1) * 9301 + 49297;
  const rand = (n: number) => ((Math.sin(seed + n) + 1) / 2);
  return {
    x: rand(1) * 1200,
    y: rand(2) * 800,
    r: rand(3) * 1.4 + 0.3,
    o: rand(4) * 0.6 + 0.3,
  };
});

// ----------------------------------------------------------------
// ChooserMascot — Ques 캐릭터 + 질문 말풍선. 사용자 상태별 카피 분기.
// ----------------------------------------------------------------

interface ChooserGreeting {
  pose: QuesPose;
  text: string;
}

function buildChooserGreeting(
  stats: PlayerStats,
  progress: ProgressStore,
): ChooserGreeting {
  if (stats.sessionsCount === 0) {
    return {
      pose: 'wave',
      text: '어서 와! 나는 [조롱이] 야. [ADSP] 랑 [SQLD] 중에 뭘 공부할래?',
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
          ? `오늘도 도착! [${stats.streakDays}일 연속] — 어느 쪽으로 이어갈까?`
          : '오늘도 잘 오셨어요! 어떤 과목으로 이어갈까요?',
    };
  }

  if (stats.streakDays >= 3) {
    return {
      pose: 'celebrate',
      text: `스트릭 [${stats.streakDays}일 연속] — 오늘은 어떤 시험을 볼까?`,
    };
  }

  const now = Date.now();
  const lastAt = progress.sessions.reduce((mx, s) => Math.max(mx, s.at), 0);
  const daysAway = Math.floor((now - lastAt) / (24 * 60 * 60 * 1000));

  if (daysAway >= 3) {
    return {
      pose: 'sad',
      text: `${daysAway}일 만이에요... 오늘은 어떤 시험을 볼까?`,
    };
  }

  return {
    pose: 'idle',
    text: '오늘은 어떤 시험을 공부할까?',
  };
}

function ChooserMascot({
  stats,
  progress,
}: {
  stats: PlayerStats;
  progress: ProgressStore;
}) {
  const greeting = useMemo(
    () => buildChooserGreeting(stats, progress),
    [stats, progress],
  );
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="max-w-[360px]">
        <SpeechBubble text={greeting.text} placement="top" />
      </div>
      <Ques pose={greeting.pose} size={150} />
    </div>
  );
}

// ----------------------------------------------------------------
// SubjectChoice — ADSP/SQLD 중 하나를 선택하는 글래스 카드 버튼.
//
// liquid-glass 위에 과목 액센트 glow 를 얹고, 좌상단에 3D 미니 행성 오브를 앵커로.
// 본체는 심우주 톤 유리 — 두 옵션이 나란히 있을 때 배경과 자연스럽게 섞이게.
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
  const accent = subject === 'adsp' ? '#67e8f9' : '#c084fc';
  const intro = SUBJECT_INTRO[subject];
  const schema = SUBJECT_SCHEMAS[subject];
  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect()}
      disabled={disabled}
      aria-label={`${subject.toUpperCase()} 선택`}
      className="group flex-1 liquid-glass rounded-[26px] px-4 py-5 md:px-5 md:py-6 text-left transition duration-300 relative overflow-hidden hover:scale-[1.03] hover:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon"
      style={{
        boxShadow: disabled
          ? undefined
          : `0 16px 36px -18px ${accent}, 0 0 0 1px rgba(255,255,255,0.04)`,
      }}
    >
      {/* 액센트 aura — 우상단 */}
      <div
        className="pointer-events-none absolute -top-14 -right-14 w-44 h-44 rounded-full opacity-55 group-hover:opacity-85 transition duration-300"
        style={{
          background: `radial-gradient(circle, ${accent}55 0%, transparent 65%)`,
        }}
      />
      {/* 저층 노이즈 tint */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `linear-gradient(180deg, rgba(1,8,40,0.35) 0%, rgba(1,8,40,0.65) 100%)`,
        }}
      />

      {/* 3D 미니 행성 오브 */}
      <div
        className="w-[46px] h-[46px] md:w-[54px] md:h-[54px] rounded-full relative z-10 mb-3 transition-transform duration-300 group-hover:scale-110"
        style={{
          background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0) 46%), linear-gradient(180deg, ${accent} 0%, ${accent}cc 55%, rgba(1,8,40,0.7) 100%)`,
          boxShadow: `0 10px 24px -6px ${accent}, inset 0 -5px 12px rgba(0,0,0,0.42), inset 0 2px 0 rgba(255,255,255,0.25)`,
        }}
      />

      {/* 타이틀 + 태그라인 + 메타 */}
      <div className="relative z-10">
        <div
          className="cursive text-[34px] md:text-[42px] leading-none"
          style={{
            color: accent,
            textShadow: `0 0 18px ${accent}88, 0 1px 0 rgba(0,0,0,0.4)`,
          }}
        >
          {subject.toUpperCase()}
        </div>
        <p className="kr-heading text-[10px] md:text-[11px] uppercase tracking-widest text-cream/85 mt-2 leading-snug">
          {intro.tagline}
        </p>
        <p className="kr-body text-[10px] md:text-[11px] text-cream/50 mt-2 tabular-nums">
          챕터 {schema.chapters.length} · 문항 {total}
        </p>
      </div>
    </button>
  );
}

// ----------------------------------------------------------------
// Subject info panel — 과목 카드 클릭 시 오버레이
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
  const accent = subject === 'adsp' ? '#67e8f9' : '#c084fc';

  return (
    <div className="panel-slide-up">
      <div
        className="liquid-glass rounded-[22px] p-5 md:p-6 relative"
        style={{ boxShadow: `0 0 50px -18px ${accent}` }}
      >
        {/* 닫기 */}
        <button
          type="button"
          onClick={onBack}
          disabled={launching}
          aria-label="닫기"
          className="absolute top-3 right-3 w-8 h-8 rounded-full inline-flex items-center justify-center text-cream/60 hover:text-cream hover:bg-white/10 transition disabled:opacity-40"
        >
          <X size={16} strokeWidth={2.4} />
        </button>

        <div className="flex items-baseline gap-3 pr-8">
          <span
            className="cursive text-[32px] md:text-[40px] leading-none"
            style={{ color: accent, textShadow: `0 0 16px ${accent}66` }}
          >
            {subject.toUpperCase()}
          </span>
          <span className="kr-heading text-[11px] uppercase tracking-widest text-cream/60">
            {intro.tagline}
          </span>
        </div>

        <h3 className="kr-heading text-[16px] md:text-[18px] uppercase mt-2 leading-tight">
          {schema.title}
        </h3>

        <p className="kr-body text-[13px] leading-[1.75] text-cream/80 mt-3">
          {intro.description}
        </p>

        <div className="mt-4 flex items-center gap-3 kr-body text-[12px] text-cream/60">
          <span>챕터 {schema.chapters.length}개</span>
          <span className="text-cream/30">·</span>
          <span>문항 {total}개</span>
        </div>

        <ProgressBadge agg={agg} />

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={onPlay}
            disabled={launching || total === 0}
            className="kr-heading uppercase tracking-widest text-[13px] px-5 py-3.5 rounded-full inline-flex items-center gap-2 transition hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex-1 justify-center"
            style={{
              background: `linear-gradient(135deg, ${accent}, var(--purple-2))`,
              color: '#fff',
              boxShadow: `0 12px 30px -8px ${accent}88`,
            }}
          >
            {launching
              ? '⚡ 워프 중…'
              : `${subject.toUpperCase()} 플레이하기`}
            {!launching ? (
              <ChevronRight size={16} strokeWidth={2.6} />
            ) : null}
          </button>
          <button
            type="button"
            onClick={onBack}
            disabled={launching}
            className="liquid-glass kr-heading uppercase tracking-widest text-[11px] px-4 py-3.5 rounded-full transition hover:bg-white/10 disabled:opacity-40 shrink-0"
          >
            다른 과목
          </button>
        </div>

        {/* 모의고사 — 과목 전체 50문항 · 시험 모드(타이머 + 피드백 숨김) */}
        <button
          type="button"
          onClick={onMockExam}
          disabled={launching || total === 0}
          className="mt-2 w-full liquid-glass kr-heading uppercase tracking-widest text-[11px] px-4 py-3 rounded-full inline-flex items-center justify-center gap-2 transition hover:bg-white/10 disabled:opacity-40"
          style={{ color: accent }}
        >
          <span>🎯 모의고사 50문항</span>
          <span className="kr-body text-[10px] text-cream/60 normal-case tracking-normal">
            · 시험 모드
          </span>
        </button>
      </div>
    </div>
  );
}

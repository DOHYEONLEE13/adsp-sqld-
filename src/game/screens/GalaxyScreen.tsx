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
  ListTodo,
  RotateCcw,
  Star,
  X,
} from 'lucide-react';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import type { Subject } from '@/types/question';
import { playableCount } from '../session';
import ProgressBadge from '../components/ProgressBadge';
import { aggregateSubject } from '../aggregate';
import { useProgress } from '../useProgress';
import { useBookmarks } from '../useBookmarks';
import { computePlayerStats, type PlayerStats } from '../rpg';
import Ques from '@/components/mascot/Ques';
import SpeechBubble from '@/game/lesson/SpeechBubble';
import type { QuesPose } from '@/components/mascot/types';
import type { ProgressStore } from '../storage';
import VideoBg from '@/components/ui/VideoBg';
import { VIDEO_URLS } from '@/data/site';

interface Props {
  onSelectSubject: (subject: Subject) => void;
  onStartDailyMission: (subject: Subject) => void;
  onStartMockExam: (subject: Subject) => void;
  onOpenReview: () => void;
  onExit: () => void;
}

/** 워프 완료 후 실제 Subject 전환까지 대기할 시간 (ms). */
const WARP_DURATION_MS = 900;

/** 미니멀 팔레트 (이 화면 한정). */
const FG = '#FD802E';
const BG = '#233D4C';
const FG_SOFT = 'rgba(253,128,46,0.65)';
const FG_DIM = 'rgba(253,128,46,0.45)';
const LINE = 'rgba(253,128,46,0.25)';
const LINE_SOFT = 'rgba(253,128,46,0.18)';

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
  const bookmarkCount = bookmarks.ids.size;
  const playerStats = computePlayerStats(progress);
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

  // 오늘 데일리 미션 완료 여부 — banner 상태 표시.
  const dailyDoneToday = isToday(progress.lastDailyMissionAt);

  return (
    <section
      className="relative min-h-screen isolate overflow-hidden"
      style={{ background: BG, color: FG }}
    >
      {/* === Background: video + teal overlay (가독성 + 톤 통일) === */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <VideoBg src={VIDEO_URLS.cta} fit="cover" />
        {/* teal tint — 영상 위에 #233D4C 톤으로 깔아서 오렌지 텍스트 가독성 확보 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(35,61,76,0.78) 0%, rgba(35,61,76,0.85) 50%, rgba(35,61,76,0.92) 100%)',
          }}
          aria-hidden
        />
      </div>

      {/* === Frame: 가운데 정렬 column === */}
      <div className="relative z-10 w-full max-w-[840px] mx-auto min-h-screen px-5 md:px-10 lg:px-14 pt-5 md:pt-7 pb-10 flex flex-col">
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
                fill={bookmarkCount > 0 ? FG : 'none'}
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
          <ChooserMascot stats={playerStats} progress={progress} />
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
          className="mt-12 md:mt-16 w-full text-left transition hover:bg-[rgba(253,128,46,0.04)] focus:outline-none focus-visible:bg-[rgba(253,128,46,0.06)]"
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
                  className="kr-heading uppercase text-[10px] shrink-0 px-2 py-0.5"
                  style={{
                    letterSpacing: '0.13em',
                    color: BG,
                    background: FG,
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

      {/* === Overlay: Subject Info Panel === */}
      {selectedSubject ? (
        <div className="absolute bottom-0 right-0 left-0 md:left-auto p-4 md:p-6 lg:p-10 w-full md:w-auto md:max-w-[460px] z-20">
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
        <div
          className="warp-overlay pointer-events-none absolute inset-0 flex items-center justify-center z-30"
          style={{
            background: `radial-gradient(ellipse at center, rgba(253,128,46,0.18) 0%, rgba(253,128,46,0.06) 40%, ${BG}f0 85%)`,
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
): ChooserGreeting {
  if (stats.sessionsCount === 0) {
    return { pose: 'wave', text: '어서 와! 오늘 뭘 공부할까?' };
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
          ? `[${stats.streakDays}일 연속] — 더 가볼까?`
          : '오늘도 한 번 더?',
    };
  }

  if (stats.streakDays >= 3) {
    return {
      pose: 'celebrate',
      text: `[${stats.streakDays}일 연속] 이어가요!`,
    };
  }

  const now = Date.now();
  const lastAt = progress.sessions.reduce((mx, s) => Math.max(mx, s.at), 0);
  const daysAway = Math.floor((now - lastAt) / (24 * 60 * 60 * 1000));

  if (daysAway >= 3) {
    return { pose: 'sad', text: `${daysAway}일 만이에요. 다시 시작!` };
  }

  return { pose: 'idle', text: '오늘 뭘 공부할까?' };
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
      <div className="max-w-[280px]">
        <SpeechBubble text={greeting.text} placement="top" />
      </div>
      <Ques pose={greeting.pose} size={140} />
    </div>
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
      className="relative w-9 h-9 md:w-10 md:h-10 inline-flex items-center justify-center transition hover:bg-[rgba(253,128,46,0.06)] focus:outline-none focus-visible:bg-[rgba(253,128,46,0.1)]"
      style={{ border: `1px solid ${LINE}`, color: FG }}
    >
      {children}
      {indicator ? (
        <span
          className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
          style={{ background: FG }}
        />
      ) : null}
    </button>
  );
}

// ----------------------------------------------------------------
// SubjectChoice — 미니멀 보더 카드.
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
  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect()}
      disabled={disabled}
      aria-label={`${subject.toUpperCase()} 선택`}
      className="group flex flex-col text-left transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:bg-[rgba(253,128,46,0.06)] hover:bg-[rgba(253,128,46,0.045)]"
      style={{
        border: `1.5px solid ${FG_DIM}`,
        color: FG,
        padding: '20px 16px',
        minHeight: 200,
      }}
    >
      {/* 코너 마커 — 6×6 정사각 dot */}
      <span
        aria-hidden
        className="block w-[7px] h-[7px] mb-5 transition group-hover:scale-110"
        style={{ background: FG }}
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
        style={{ borderTop: `1px solid ${LINE_SOFT}` }}
      >
        <span
          className="kr-heading uppercase text-[10px] tabular-nums"
          style={{ letterSpacing: '0.13em', color: FG_SOFT }}
        >
          챕터 {schema.chapters.length} · 문항 {total}
        </span>
        <ArrowRight size={14} strokeWidth={2} style={{ color: FG }} />
      </div>
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

  return (
    <div className="panel-slide-up">
      <div
        className="relative"
        style={{
          background: BG,
          border: `1.5px solid ${FG_DIM}`,
          padding: '20px 20px 22px',
          color: FG,
        }}
      >
        {/* 닫기 */}
        <button
          type="button"
          onClick={onBack}
          disabled={launching}
          aria-label="닫기"
          className="absolute top-3 right-3 w-8 h-8 inline-flex items-center justify-center transition hover:bg-[rgba(253,128,46,0.08)] disabled:opacity-40"
          style={{ color: FG }}
        >
          <X size={16} strokeWidth={2} />
        </button>

        <div className="flex items-baseline gap-3 pr-8">
          <span
            className="kr-heading uppercase text-[28px] md:text-[34px] leading-none"
            style={{ letterSpacing: '0.005em', color: FG }}
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

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={onPlay}
            disabled={launching || total === 0}
            className="kr-heading uppercase tracking-widest text-[12px] md:text-[13px] px-5 py-3 inline-flex items-center gap-2 transition hover:bg-[rgba(253,128,46,0.9)] disabled:opacity-50 disabled:cursor-not-allowed flex-1 justify-center"
            style={{
              background: FG,
              color: BG,
              letterSpacing: '0.16em',
            }}
          >
            {launching ? '워프 중…' : `${subject.toUpperCase()} 플레이하기`}
            {!launching ? <ChevronRight size={15} strokeWidth={2.4} /> : null}
          </button>
          <button
            type="button"
            onClick={onBack}
            disabled={launching}
            className="kr-heading uppercase text-[10px] md:text-[11px] px-4 py-3 transition hover:bg-[rgba(253,128,46,0.08)] disabled:opacity-40 shrink-0"
            style={{
              border: `1px solid ${LINE}`,
              color: FG,
              letterSpacing: '0.16em',
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
          className="mt-2 w-full kr-heading uppercase text-[10px] md:text-[11px] px-4 py-3 inline-flex items-center justify-center gap-2 transition hover:bg-[rgba(253,128,46,0.06)] disabled:opacity-40"
          style={{
            border: `1px solid ${LINE}`,
            color: FG_SOFT,
            letterSpacing: '0.16em',
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
// helpers
// ----------------------------------------------------------------

/** 오늘 자정 ts 이후인지. */
function isToday(ts: number | undefined, now: number = Date.now()): boolean {
  if (!ts) return false;
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return ts >= d.getTime();
}


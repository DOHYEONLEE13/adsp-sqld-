/**
 * Galaxy 화면 — 과목 선택.
 *
 * 3D 은하가 전체 뷰포트를 차지하는 "히어로" 레이아웃.
 * 타이틀/HUD/데일리 미션 등 모든 UI 는 캔버스 위에 오버레이로 올라갑니다.
 *
 * 행성 클릭 → 카메라 줌인 + 과목 상세 패널 오버레이 (우측 하단).
 * 패널의 "플레이하기" 버튼 → 워프 애니메이션 → Planet 화면 진입.
 */

import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowLeft, BarChart3, ChevronRight, Star, X } from 'lucide-react';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import type { Subject } from '@/types/question';
import { playableCount } from '../session';
import ProgressBadge from '../components/ProgressBadge';
import DailyMissionCard from '../components/DailyMissionCard';
import { aggregateSubject } from '../aggregate';
import { useProgress } from '../useProgress';
import { useBookmarks } from '../useBookmarks';
import { computePlayerStats } from '../rpg';
import PlayerHud from '../components/PlayerHud';

// three.js 스택(약 240KB gzip)은 Galaxy 화면에서만 필요 → lazy chunk 로 분리.
const GalaxyScene = lazy(() => import('../three/GalaxyScene'));

interface Props {
  onSelectSubject: (subject: Subject) => void;
  onStartDailyMission: (subject: Subject) => void;
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

  return (
    <section className="relative min-h-screen bg-base text-cream isolate overflow-hidden">
      {/* === Background: 3D 은하 캔버스 (풀 블리드) === */}
      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center text-cream/50 kr-heading text-[11px] uppercase tracking-widest">
              ⚡ Loading galaxy...
            </div>
          }
        >
          <GalaxyScene
            zoomTarget={selectedSubject}
            disabled={{ adsp: adspTotal === 0, sqld: sqldTotal === 0 }}
            onSelect={handlePlanetClick}
          />
        </Suspense>

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
            <button
              type="button"
              onClick={() => {
                window.location.hash = '/bookmarks';
              }}
              className="liquid-glass kr-heading inline-flex items-center gap-2 text-[10px] md:text-[11px] uppercase tracking-widest px-3 py-2 md:px-4 md:py-2.5 rounded-full hover:bg-white/10 transition"
            >
              <Star
                size={12}
                strokeWidth={2.4}
                className={bookmarkCount > 0 ? 'text-[#fbbf24]' : ''}
                fill={bookmarkCount > 0 ? 'currentColor' : 'none'}
              />
              북마크
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
              className="liquid-glass kr-heading inline-flex items-center gap-2 text-[10px] md:text-[11px] uppercase tracking-widest px-3 py-2 md:px-4 md:py-2.5 rounded-full hover:bg-white/10 transition"
            >
              <BarChart3 size={12} strokeWidth={2.4} />
              대시보드
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
              행성을 선택하라
            </h1>
            <p className="hidden md:block kr-body text-[13px] md:text-[14px] text-cream/75 mt-3 max-w-xl leading-[1.7]">
              탐사할 자격증 은하를 선택하세요.
              <br className="hidden md:block" />
              행성을 클릭하면 소개가 나타납니다.
            </p>
          </div>

          {/* PlayerHud — 모바일은 타이틀 아래 풀폭, 데스크탑은 우측 고정폭 */}
          <div className="pointer-events-auto w-full md:max-w-[380px] shrink-0 hud-in-overlay">
            <PlayerHud stats={playerStats} />
          </div>
        </div>
      </div>

      {/* === Overlay: Bottom-left — Daily Mission ===
          모바일에서는 SubjectInfoPanel 이 풀폭으로 하단을 차지하므로
          행성 선택 상태(detail/launching)에서는 숨김. 데스크탑은 좌우로 나뉘어 문제 없음. */}
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

      {/* === Overlay: Bottom-center — 안내 문구 (overview 일 때만) === */}
      {view.kind === 'overview' ? (
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 kr-heading text-[11px] uppercase tracking-widest text-cream/55 text-center hidden md:block z-10">
          · 행성을 클릭하세요 ·
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

      {/* === Overlay: Bottom — 크레딧 (CC BY 4.0) === */}
      <div className="pointer-events-none absolute bottom-2 right-4 text-[9px] text-cream/35 leading-[1.6] text-right hidden lg:block z-10">
        <span className="pointer-events-auto">
          3D:{' '}
          <a
            href="https://sketchfab.com/3d-models/stylized-planet-789725db86f547fc9163b00f302c3e70"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-cream/60"
          >
            Stylized Planet
          </a>{' '}
          by cmzw ·{' '}
          <a
            href="https://sketchfab.com/3d-models/purple-planet-264eb22207184fc99a5e3b1279a763b8"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-cream/60"
          >
            Purple Planet
          </a>{' '}
          by Yo.Ri ·{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-cream/60"
          >
            CC BY 4.0
          </a>
        </span>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------
// Subject info panel — 행성 클릭 시 오버레이
// ----------------------------------------------------------------

interface PanelProps {
  subject: Subject;
  total: number;
  progress: ReturnType<typeof useProgress>;
  launching: boolean;
  onBack: () => void;
  onPlay: () => void;
}

function SubjectInfoPanel({
  subject,
  total,
  progress,
  launching,
  onBack,
  onPlay,
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
            다른 행성
          </button>
        </div>
      </div>
    </div>
  );
}

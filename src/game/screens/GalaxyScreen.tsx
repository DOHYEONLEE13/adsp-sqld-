/**
 * Galaxy 화면 — 과목 선택.
 * ADSP / SQLD 가 각각 하나의 "행성" 으로 3D 씬에 배치됩니다.
 * 행성 클릭 → 카메라 줌인 워프 → Planet 화면으로 전환.
 */

import { lazy, Suspense, useEffect, useState } from 'react';
import { BarChart3, Star } from 'lucide-react';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import type { Subject } from '@/types/question';
import { playableCount } from '../session';
import ScreenShell from '../components/ScreenShell';
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

/** 카메라 줌인 완료까지 대기할 시간 (ms). 너무 짧으면 컷씬 느낌이 안 남. */
const ZOOM_WARP_MS = 900;

export default function GalaxyScreen({
  onSelectSubject,
  onStartDailyMission,
  onExit,
}: Props) {
  const progress = useProgress();
  const bookmarks = useBookmarks();
  const bookmarkCount = bookmarks.ids.size;
  const playerStats = computePlayerStats(progress);
  // 현재는 데이터 있는 과목 우선 — 가장 많은 플레이 가능 문항 기준.
  const defaultMissionSubject: Subject =
    playableCount('adsp') >= playableCount('sqld') ? 'adsp' : 'sqld';

  const adspTotal = playableCount('adsp');
  const sqldTotal = playableCount('sqld');

  // 카메라 워프 중인 행성. null 이면 전체 뷰.
  const [warping, setWarping] = useState<Subject | null>(null);

  // 워프 트리거 → 900ms 후 실제 Subject 전환.
  useEffect(() => {
    if (!warping) return;
    const id = window.setTimeout(() => {
      onSelectSubject(warping);
    }, ZOOM_WARP_MS);
    return () => window.clearTimeout(id);
  }, [warping, onSelectSubject]);

  const handlePlanetClick = (subject: Subject) => {
    if (warping) return;
    const total = subject === 'adsp' ? adspTotal : sqldTotal;
    if (total === 0) return;
    setWarping(subject);
  };

  return (
    <ScreenShell
      eyebrow="Galaxy"
      title="행성을 선택하라"
      subtitle="탐사할 자격증 은하를 선택하세요. 각 행성을 클릭하면 탐사가 시작됩니다."
      onExit={onExit}
      backgroundImage="/error%20404.gif"
    >
      {/* Player HUD — 레벨 · XP · 스트릭 */}
      <PlayerHud stats={playerStats} />

      {/* 대시보드 / 북마크 진입 */}
      <div className="mb-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            window.location.hash = '/bookmarks';
          }}
          className="liquid-glass kr-heading inline-flex items-center gap-2 text-[12px] uppercase tracking-widest px-5 py-3 rounded-full hover:bg-white/10 transition"
        >
          <Star
            size={14}
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
          className="liquid-glass kr-heading inline-flex items-center gap-2 text-[12px] uppercase tracking-widest px-5 py-3 rounded-full hover:bg-white/10 transition"
        >
          <BarChart3 size={14} strokeWidth={2.4} />
          학습 대시보드
        </button>
      </div>

      {/* Daily Mission */}
      <div className="mb-8">
        <DailyMissionCard
          subject={defaultMissionSubject}
          subjectLabel={SUBJECT_SCHEMAS[defaultMissionSubject].title}
          onStart={onStartDailyMission}
        />
      </div>

      {/* 3D 행성 씬 — 클릭해서 과목 선택 */}
      <div
        className="liquid-glass rounded-[28px] overflow-hidden relative"
        style={{ height: 'min(62vh, 520px)' }}
      >
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center text-cream/50 kr-heading text-[11px] uppercase tracking-widest">
              ⚡ Loading galaxy...
            </div>
          }
        >
          <GalaxyScene
            zoomTarget={warping}
            disabled={{ adsp: adspTotal === 0, sqld: sqldTotal === 0 }}
            onSelect={handlePlanetClick}
          />
        </Suspense>

        {/* 워프 중 오버레이 — 네온 비네트 + 텍스트 */}
        {warping ? (
          <div
            className="pointer-events-none absolute inset-0 flex items-end justify-center pb-10"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(103,232,249,0) 25%, rgba(1,8,40,0.55) 75%, rgba(1,8,40,0.9) 100%)',
              animation: 'xpPopupRise 0.9s ease-out',
            }}
          >
            <div className="kr-heading uppercase tracking-widest text-[13px] text-cream/80">
              ⚡ Entering {warping.toUpperCase()} Galaxy...
            </div>
          </div>
        ) : null}

        {/* 모서리 도움말 */}
        <div className="pointer-events-none absolute bottom-3 right-4 kr-heading text-[10px] uppercase tracking-widest text-cream/40">
          · 행성을 클릭하세요 ·
        </div>
      </div>

      {/* 요약 라인 — 각 행성의 진도/문항 수를 2D 로 부연 */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {(['adsp', 'sqld'] as Subject[]).map((subject) => {
          const schema = SUBJECT_SCHEMAS[subject];
          const total = playableCount(subject);
          const disabled = total === 0;
          const isWarping = warping === subject;
          return (
            <button
              key={subject}
              type="button"
              onClick={() => handlePlanetClick(subject)}
              disabled={disabled || !!warping}
              className="liquid-glass rounded-[18px] p-4 md:p-5 text-left transition hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <span className="cursive text-neon text-[22px] leading-none">
                    {subject.toUpperCase()}
                  </span>
                  <span className="kr-heading text-[13px] uppercase">
                    {schema.title}
                  </span>
                </div>
                <span className="kr-heading text-[10px] uppercase tracking-widest text-cream/60">
                  {isWarping ? '⚡ 워프 중' : disabled ? 'Coming Soon' : 'Enter'}
                </span>
              </div>
              <div className="kr-body text-[12px] leading-[1.7] text-cream/60 mt-2">
                챕터 {schema.chapters.length}개 · 문항 {total}개
              </div>
              {!disabled ? (
                <ProgressBadge agg={aggregateSubject(subject, progress)} />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* 3D 에셋 크레딧 — CC BY 4.0 attribution */}
      <div className="mt-6 text-[10px] text-cream/35 leading-[1.7]">
        3D 행성:{' '}
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
      </div>
    </ScreenShell>
  );
}

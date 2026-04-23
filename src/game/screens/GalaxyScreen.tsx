/**
 * Galaxy 화면 — 과목 선택.
 * ADSP / SQLD 가 각각 하나의 "은하" 로 표현됩니다.
 */

import { BarChart3, ChevronRight, Sparkles, Star } from 'lucide-react';
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

interface Props {
  onSelectSubject: (subject: Subject) => void;
  onStartDailyMission: (subject: Subject) => void;
  onExit: () => void;
}

const SUBJECTS: Subject[] = ['adsp', 'sqld'];

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
  return (
    <ScreenShell
      eyebrow="Galaxy"
      title="행성을 선택하라"
      subtitle="탐사할 자격증 은하를 선택하세요. 각 은하에는 여러 행성(챕터)이 존재합니다."
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SUBJECTS.map((subject) => {
          const schema = SUBJECT_SCHEMAS[subject];
          const total = playableCount(subject);
          const disabled = total === 0;
          return (
            <button
              key={subject}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onSelectSubject(subject)}
              className="liquid-glass rounded-[28px] p-6 md:p-7 text-left transition hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="cursive text-neon text-[28px] md:text-[36px] block leading-none">
                    {subject.toUpperCase()}
                  </span>
                  <h3 className="kr-heading text-[22px] md:text-[26px] uppercase mt-3 leading-tight">
                    {schema.title}
                  </h3>
                </div>
                <span className="text-neon opacity-80">
                  <Sparkles size={22} />
                </span>
              </div>

              <div className="kr-body text-[13px] leading-[1.7] text-cream/70 mt-4">
                챕터 {schema.chapters.length}개 · 플레이 가능 문항 {total}개
              </div>

              {!disabled ? (
                <ProgressBadge agg={aggregateSubject(subject, progress)} />
              ) : null}

              <div className="mt-6 flex items-center justify-between">
                <span className="kr-heading text-[11px] uppercase tracking-widest text-cream/60">
                  {disabled ? 'Coming Soon' : 'Enter Galaxy'}
                </span>
                <span
                  className="w-11 h-11 rounded-full inline-flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--purple-1), var(--purple-2))',
                    boxShadow:
                      '0 10px 25px -5px rgba(124, 58, 237, 0.55)',
                  }}
                >
                  <ChevronRight
                    width={20}
                    height={20}
                    strokeWidth={2.5}
                    color="#fff"
                  />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </ScreenShell>
  );
}

/**
 * Galaxy 화면 상단 HUD — 레벨 · XP 바 · 스트릭.
 *
 * 순수 프리젠테이션. PlayerStats 를 받아 그리기만 합니다.
 */

import { Flame, Sparkles } from 'lucide-react';
import type { PlayerStats } from '../rpg';

interface Props {
  stats: PlayerStats;
}

export default function PlayerHud({ stats }: Props) {
  const pct = Math.round(stats.ratio * 100);
  const hasAny = stats.totalXp > 0 || stats.sessionsCount > 0;

  return (
    <div className="liquid-glass rounded-[22px] p-5 md:p-6 mb-6">
      <div className="flex items-center gap-4 md:gap-5">
        {/* 레벨 디스크 */}
        <div
          className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full inline-flex items-center justify-center"
          style={{
            background:
              'linear-gradient(135deg, var(--purple-1), var(--purple-2))',
            boxShadow: '0 10px 25px -8px rgba(124,58,237,0.55)',
          }}
        >
          <div className="text-center leading-none">
            <div className="kr-heading text-[9px] uppercase tracking-widest text-white/70">
              Lv
            </div>
            <div className="kr-heading text-[22px] md:text-[26px] text-white mt-0.5">
              {stats.level}
            </div>
          </div>
        </div>

        {/* XP 바 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <span className="kr-heading text-[11px] uppercase tracking-widest text-cream/70 inline-flex items-center gap-1.5">
              <Sparkles size={12} strokeWidth={2.4} className="text-neon" />
              {hasAny ? 'Adventurer' : 'Newbie Explorer'}
            </span>
            <span className="kr-body text-[11px] text-cream/60 tabular-nums shrink-0">
              {stats.xpIntoLevel.toLocaleString()} /{' '}
              {stats.xpSpan.toLocaleString()} XP
            </span>
          </div>
          <div
            className="relative h-2.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
              style={{
                width: `${pct}%`,
                background:
                  'linear-gradient(90deg, #6FFF00 0%, #67e8f9 55%, #c084fc 100%)',
                boxShadow: '0 0 12px rgba(103,232,249,0.55)',
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[10px] text-cream/50 tabular-nums">
            <span>총 {stats.totalXp.toLocaleString()} XP</span>
            <span>
              다음 레벨까지{' '}
              {(stats.xpSpan - stats.xpIntoLevel).toLocaleString()}
            </span>
          </div>
        </div>

        {/* 스트릭 */}
        <div className="shrink-0 flex flex-col items-center min-w-[54px]">
          <Flame
            size={22}
            strokeWidth={2.4}
            className={
              stats.streakDays > 0 ? 'text-[#fb923c]' : 'text-cream/30'
            }
            fill={stats.streakDays > 0 ? 'currentColor' : 'none'}
          />
          <div className="kr-heading text-[16px] md:text-[18px] leading-none mt-1 tabular-nums">
            {stats.streakDays}
          </div>
          <div className="kr-heading text-[9px] uppercase tracking-widest text-cream/50 mt-0.5">
            day{stats.streakDays === 1 ? '' : 's'}
          </div>
        </div>
      </div>
    </div>
  );
}

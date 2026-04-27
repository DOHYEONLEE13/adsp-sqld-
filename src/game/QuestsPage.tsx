/**
 * QuestsPage — 오늘의 퀘스트 단독 화면.
 *
 * 모바일 하단 내비의 깃발 탭(quests) 진입점. StatsPage 의 일부였던
 * `DailyQuestsCard` 를 그대로 재사용하면서, 진도 컨텍스트만 살짝 더 보여줌.
 */

import { useMemo } from 'react';
import { Flame, Zap } from 'lucide-react';
import ScreenShell from './components/ScreenShell';
import DailyQuestsCard from './components/DailyQuestsCard';
import { useProgress } from './useProgress';
import { computePlayerStats } from './rpg';
import { getTodayQuests } from './dailyQuests';
import { MobileBottomNav } from './components/MobileGameNav';
import PageAmbientBg from './components/PageAmbientBg';

interface Props {
  onExit: () => void;
}

export default function QuestsPage({ onExit }: Props) {
  const progress = useProgress();
  const stats = useMemo(() => computePlayerStats(progress), [progress]);
  const dailyQuests = useMemo(() => getTodayQuests(progress), [progress]);

  return (
    <ScreenShell
      eyebrow="Daily Quests"
      title="오늘의 퀘스트"
      subtitle="매일 자정에 갱신돼요. 3개 모두 끝내면 보너스 XP."
      onExit={onExit}
      exitLabel="돌아가기"
      ambient={<PageAmbientBg />}
    >
      {/* 상단 — 현재 XP 요약 (퀘스트가 곧 XP 원천이라 함께 노출) */}
      <section
        className="liquid-glass rounded-[20px] px-5 py-4 md:px-6 md:py-5 mb-6 flex items-center justify-between gap-4"
        aria-label="진도 요약"
      >
        <div className="flex items-center gap-4 md:gap-6">
          <Stat
            label="레벨"
            value={String(stats.level)}
            icon={<Zap size={18} fill="#A78BFA" strokeWidth={0} />}
            color="#A78BFA"
          />
          <Stat
            label="XP"
            value={stats.totalXp.toLocaleString()}
            icon={
              <span
                className="kr-heading text-[10px] font-bold tracking-wider"
                style={{ color: '#FFB020' }}
              >
                XP
              </span>
            }
            color="#FFB020"
          />
          <Stat
            label="연속"
            value={`${stats.streakDays}일`}
            icon={<Flame size={18} fill="#cbd5e1" strokeWidth={0} />}
            color="#cbd5e1"
          />
        </div>
      </section>

      <DailyQuestsCard quests={dailyQuests} />

      <p className="kr-body text-[12px] text-cream/55 mt-4 leading-[1.65]">
        퀘스트는 일반 풀이로 자동 카운트됩니다. 학습 모드·모의고사·일일미션 모두 동일.
      </p>

      {/* 모바일 하단 내비 — 다른 탭과의 이동을 위해 모든 페이지에 부착 */}
      <div className="md:hidden h-20" aria-hidden />
      <MobileBottomNav active="quests" />
    </ScreenShell>
  );
}

function Stat({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded-full"
        style={{ background: `${color}1f`, border: `1px solid ${color}66` }}
      >
        {icon}
      </span>
      <div className="leading-tight">
        <div
          className="kr-heading text-[9px] uppercase tracking-widest"
          style={{ color: 'rgba(239,244,255,0.55)' }}
        >
          {label}
        </div>
        <div
          className="kr-heading text-[15px] tabular-nums"
          style={{ color }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

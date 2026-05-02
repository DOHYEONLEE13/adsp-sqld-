/**
 * QuestsPage — 오늘의 퀘스트 단독 화면.
 *
 * 모바일 하단 내비의 깃발 탭(quests) 진입점. StatsPage 의 일부였던
 * `DailyQuestsCard` 를 그대로 재사용하면서, 진도 컨텍스트만 살짝 더 보여줌.
 */

import { useEffect, useMemo, useState } from 'react';
import { Flame, Zap } from 'lucide-react';
import ScreenShell from './components/ScreenShell';
import DailyQuestsCard from './components/DailyQuestsCard';
import { useProgress } from './useProgress';
import { computePlayerStats } from './rpg';
import { getTodayQuests, completedCount } from './dailyQuests';
import {
  claimDailyQuestBonus,
  hasDailyBonusBeenClaimedToday,
  XP_DAILY_BONUS,
} from './storage';
import { MobileBottomNav, MobileTopBar } from './components/MobileGameNav';
import PageAmbientBg from './components/PageAmbientBg';

interface Props {
  onExit: () => void;
}

export default function QuestsPage({ onExit }: Props) {
  const progress = useProgress();
  const stats = useMemo(() => computePlayerStats(progress), [progress]);
  const dailyQuests = useMemo(() => getTodayQuests(progress), [progress]);
  const allDone = completedCount(dailyQuests) === dailyQuests.length;
  const bonusClaimed = hasDailyBonusBeenClaimedToday(progress);
  const [bonusToast, setBonusToast] = useState<number | null>(null);

  // 3종 모두 완료 + 오늘 미청구면 자동 보너스 XP 지급. 같은 날 1회 한정.
  useEffect(() => {
    if (allDone && !bonusClaimed) {
      const xp = claimDailyQuestBonus();
      if (xp > 0) {
        setBonusToast(xp);
        const t = window.setTimeout(() => setBonusToast(null), 2400);
        return () => window.clearTimeout(t);
      }
    }
  }, [allDone, bonusClaimed]);

  return (
    <ScreenShell
      eyebrow="Daily Quests"
      title="오늘의 퀘스트"
      subtitle={`매일 자정에 갱신돼요. 3개 모두 끝내면 보너스 +${XP_DAILY_BONUS} XP.`}
      onExit={onExit}
      exitLabel="돌아가기"
      ambient={<PageAmbientBg />}
    >
      {/* 모바일 상단 내비 — 닉네임/요금제/streak/XP/⚡ 통합 (다른 탭과 일관) */}
      <MobileTopBar />
      <div className="md:hidden h-14" aria-hidden />

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

      {/* 3종 완료 시 보너스 배너 — 오늘 청구 여부 표시 */}
      {allDone && (
        <div
          className="liquid-glass rounded-[16px] px-4 py-3 mt-4 flex items-center justify-between gap-3"
          style={{
            background:
              'linear-gradient(135deg, rgba(111,255,0,0.12), rgba(255,176,32,0.12))',
            border: '1px solid rgba(111,255,0,0.4)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[18px] leading-none">🎉</span>
            <span
              className="kr-heading text-[12px] uppercase tracking-wide"
              style={{ color: 'var(--neon)' }}
            >
              오늘 보너스 획득 +{XP_DAILY_BONUS} XP
            </span>
          </div>
          <span
            className="kr-body text-[11px]"
            style={{ color: 'rgba(239,244,255,0.6)' }}
          >
            내일 자정 갱신
          </span>
        </div>
      )}

      <p className="kr-body text-[12px] text-cream/55 mt-4 leading-[1.65]">
        풀이량·다양성은 학습 모드 inline 풀이도 카운트, 정확도는 실전 세트·모의고사·
        일일미션 등 묶음 세션 기준입니다.
      </p>

      {/* Floating bonus toast — 첫 청구 시 잠깐 노출 */}
      {bonusToast !== null && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full kr-heading text-[12px] uppercase tracking-widest"
          style={{
            top: '20%',
            background: 'rgba(111,255,0,0.95)',
            color: 'var(--base)',
            boxShadow: '0 14px 40px rgba(111,255,0,0.45)',
          }}
        >
          🎉 일일 퀘스트 완료! +{bonusToast} XP
        </div>
      )}

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

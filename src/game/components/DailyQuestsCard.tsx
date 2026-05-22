/**
 * DailyQuestsCard — 오늘의 퀘스트 3종을 한 카드로.
 *
 * 진행/완료 상태를 progress store 에서 파생. 별도 저장 없음 — 자정 지나면 자동 리셋.
 */

import {
  BookOpen,
  CheckCircle2,
  Layers,
  ListTodo,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { cx } from '@/lib/utils';
import type { DailyQuest } from '../dailyQuests';

interface Props {
  quests: readonly DailyQuest[];
  /** compact=true 면 갤럭시 상단용 뱃지 형태 (작은 카운터). */
  compact?: boolean;
  /** compact 모드에서 클릭 시 stats 로 이동하는 핸들러. */
  onClick?: () => void;
}

const QUEST_VISUAL: Record<
  DailyQuest['id'],
  { Icon: LucideIcon; color: string; background: string }
> = {
  'daily-volume': {
    Icon: BookOpen,
    color: '#67e8f9',
    background: 'rgba(103,232,249,0.10)',
  },
  'daily-accuracy': {
    Icon: Target,
    color: '#fbbf24',
    background: 'rgba(251,191,36,0.10)',
  },
  'daily-variety': {
    Icon: Layers,
    color: '#c084fc',
    background: 'rgba(192,132,252,0.10)',
  },
};

export default function DailyQuestsCard({ quests, compact, onClick }: Props) {
  const done = quests.filter((q) => q.completed).length;
  const total = quests.length;
  const allDone = done === total && total > 0;

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cx(
          'liquid-glass kr-heading inline-flex items-center gap-2 whitespace-nowrap text-[10px] md:text-[11px] uppercase tracking-widest px-3 py-2 md:px-4 md:py-2.5 rounded-full hover:bg-white/10 transition',
        )}
        aria-label={`일일 퀘스트 ${done}/${total} 완료`}
      >
        <ListTodo size={12} strokeWidth={2.4} />
        <span className="hidden sm:inline">퀘스트</span>
        <span
          className="ml-1 text-[10px] px-2 py-0.5 rounded-full tabular-nums"
          style={{
            background: allDone ? 'var(--neon-18)' : 'rgba(255,255,255,0.08)',
            color: allDone ? 'var(--neon)' : 'rgba(239,244,255,0.85)',
          }}
        >
          {done}/{total}
        </span>
      </button>
    );
  }

  return (
    <section
      className="liquid-glass rounded-[24px] p-5 md:p-6"
      style={
        allDone ? { boxShadow: '0 0 40px -12px var(--neon-60)' } : undefined
      }
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="kr-heading text-[13px] uppercase tracking-widest text-cream/70 inline-flex items-center gap-2">
          <ListTodo size={14} strokeWidth={2.4} />
          오늘의 퀘스트
        </h2>
        <span
          className="kr-heading text-[11px] tabular-nums"
          style={{ color: allDone ? 'var(--neon)' : 'rgba(239,244,255,0.6)' }}
        >
          {done} / {total} 완료
        </span>
      </div>

      <ul className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
        {quests.map((q) => (
          <QuestRow key={q.id} quest={q} />
        ))}
      </ul>

      {allDone ? (
        <p
          className="kr-body text-[12px] mt-4 text-center inline-flex w-full items-center justify-center gap-1.5"
          style={{ color: 'var(--neon)' }}
        >
          <CheckCircle2 size={14} strokeWidth={2.6} />
          오늘의 퀘스트를 모두 완료했어요! 내일 또 만나요.
        </p>
      ) : null}
    </section>
  );
}

function QuestRow({ quest }: { quest: DailyQuest }) {
  const pct = quest.target === 0 ? 0 : (quest.progress / quest.target) * 100;
  const barColor = quest.completed ? 'var(--neon)' : '#a78bfa';
  const visual = QUEST_VISUAL[quest.id];
  const Icon = visual.Icon;
  return (
    <li
      className="rounded-[14px] lg:rounded-[18px] px-4 py-3 lg:px-5 lg:py-4 flex flex-col"
      style={{
        background: quest.completed
          ? 'var(--neon-08)'
          : 'rgba(239,244,255,0.04)',
        border: quest.completed
          ? '1px solid var(--neon-25)'
          : '1px solid rgba(239,244,255,0.06)',
      }}
    >
      <div className="flex items-center gap-3 mb-2 lg:mb-3">
        <span
          className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-2xl"
          style={{
            background: quest.completed
              ? 'var(--neon-10)'
              : visual.background,
          }}
          aria-hidden
        >
          <Icon
            size={19}
            strokeWidth={2.35}
            style={{ color: quest.completed ? 'var(--neon)' : visual.color }}
          />
        </span>
        <div className="flex-1 min-w-0">
          <p className="kr-heading text-[12px] lg:text-[13px] uppercase tracking-wide truncate">
            {quest.title}
          </p>
          <p className="kr-body text-[11px] lg:text-[12px] text-cream/60 truncate">
            {quest.description}
          </p>
        </div>
        {quest.completed ? (
          <CheckCircle2
            size={20}
            strokeWidth={2.4}
            style={{ color: 'var(--neon)' }}
          />
        ) : (
          <span className="kr-heading text-[11px] lg:text-[12px] text-cream/50 tabular-nums shrink-0">
            {quest.progress} / {quest.target}
          </span>
        )}
      </div>
      <div
        className="h-[5px] rounded-full overflow-hidden"
        style={{ background: 'rgba(239,244,255,0.08)' }}
      >
        <div
          className="h-full transition-[width] duration-500"
          style={{ width: `${Math.min(100, pct)}%`, background: barColor }}
        />
      </div>
    </li>
  );
}

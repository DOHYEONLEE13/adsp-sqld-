/**
 * DailyQuestsCard — 오늘의 퀘스트 3종을 한 카드로.
 *
 * 진행/완료 상태를 progress store 에서 파생. 별도 저장 없음 — 자정 지나면 자동 리셋.
 */

import {
  BookOpen,
  ChevronRight,
  CheckCircle2,
  Gift,
  ListTodo,
  RotateCcw,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { cx } from '@/lib/utils';
import type { Subject } from '@/types/question';
import type { DailyQuest } from '../dailyQuests';
import { CORE_SUBJECT_ACCENT } from '../learningContext';

interface Props {
  quests: readonly DailyQuest[];
  /** compact=true 면 갤럭시 상단용 뱃지 형태 (작은 카운터). */
  compact?: boolean;
  /** compact 모드에서 클릭 시 stats 로 이동하는 핸들러. */
  onClick?: () => void;
  /** 미완료 퀘스트 이동 또는 완료 퀘스트 보상 수령. */
  onQuestAction?: (quest: DailyQuest) => void;
  subject?: Subject;
}

const QUEST_VISUAL: Record<
  DailyQuest['id'],
  { Icon: LucideIcon; color: string; background: string }
> = {
  'daily-review': {
    Icon: RotateCcw,
    color: '#86efac',
    background: 'rgba(134,239,172,0.10)',
  },
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
};

export default function DailyQuestsCard({
  quests,
  compact,
  onClick,
  onQuestAction,
  subject = 'adsp',
}: Props) {
  const done = quests.filter((q) => q.completed).length;
  const total = quests.length;
  const allDone = done === total && total > 0;
  const accent = CORE_SUBJECT_ACCENT[subject];

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
            background: allDone
              ? `color-mix(in srgb, ${accent} 18%, transparent)`
              : 'rgba(255,255,255,0.08)',
            color: allDone ? accent : 'rgba(239,244,255,0.85)',
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
      style={{ boxShadow: '0 20px 52px -34px rgba(0,0,0,0.72)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="kr-heading text-[13px] uppercase tracking-widest text-cream/70 inline-flex items-center gap-2">
          <ListTodo size={14} strokeWidth={2.4} />
          오늘의 퀘스트
        </h2>
        <span
          className="kr-heading shrink-0 text-[11px] tabular-nums"
          style={{ color: 'rgba(239,244,255,0.7)' }}
        >
          {done} / {total} 완료
        </span>
      </div>

      <ul className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
        {quests.map((q) => (
          <QuestRow
            key={q.id}
            quest={q}
            accent={accent}
            onAction={() => onQuestAction?.(q)}
          />
        ))}
      </ul>

      {allDone ? (
        <p
          className="kr-body text-[12px] mt-4 text-center inline-flex w-full items-center justify-center gap-1.5"
          style={{ color: 'rgba(239,244,255,0.62)' }}
        >
          <CheckCircle2 size={14} strokeWidth={2.6} />
          오늘의 퀘스트를 모두 완료했어요! 내일 또 만나요.
        </p>
      ) : null}
    </section>
  );
}

function QuestRow({
  quest,
  accent,
  onAction,
}: {
  quest: DailyQuest;
  accent: string;
  onAction: () => void;
}) {
  const pct =
    quest.target === 0
      ? quest.completed
        ? 100
        : 0
      : (quest.progress / quest.target) * 100;
  const barColor = quest.completed ? accent : '#a78bfa';
  const visual = QUEST_VISUAL[quest.id];
  const Icon = visual.Icon;
  const canClaim =
    quest.completed && quest.rewardAvailable && !quest.claimed;
  const canOpen = !quest.completed;
  const clickable = canClaim || canOpen;
  const statusLabel = quest.claimed
    ? quest.rewardAvailable
      ? '완료'
      : '복습 없음'
    : '시작하기';

  if (canClaim) {
    return (
      <li>
        <button
          type="button"
          onClick={onAction}
          className="group flex min-h-[84px] w-full items-center justify-center gap-3 rounded-[16px] px-4 py-4 text-center transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
          style={{
            color: 'var(--base)',
            background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 88%, white 12%), color-mix(in srgb, ${accent} 68%, #60a5fa 32%))`,
            border: '1px solid rgba(255,255,255,0.38)',
            boxShadow: `0 14px 30px -20px ${accent}, inset 0 1px 0 rgba(255,255,255,0.5)`,
          }}
          aria-label={`${quest.title} 퀘스트 보상 받기, ${quest.rewardXp} XP`}
        >
          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'rgba(1,8,40,0.12)' }}
            aria-hidden
          >
            <Gift size={20} strokeWidth={2.5} />
          </span>
          <span className="kr-heading flex-1 text-left text-[14px] lg:text-[15px]">
            보상 받기
          </span>
          <span
            className="kr-num inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-black tabular-nums"
            style={{
              color: 'var(--base)',
              background: 'rgba(255,255,255,0.34)',
              border: '1px solid rgba(255,255,255,0.46)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.34)',
            }}
          >
            +{quest.rewardXp} XP
          </span>
          <ChevronRight
            size={18}
            strokeWidth={2.6}
            className="transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </button>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={onAction}
        disabled={!clickable}
        className={cx(
          'group w-full rounded-[16px] px-4 py-3.5 lg:px-5 lg:py-4 flex flex-col text-left transition',
          clickable
            ? 'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]'
            : 'cursor-default',
        )}
        style={{
          background: quest.completed
            ? `linear-gradient(135deg, rgba(239,244,255,0.055), color-mix(in srgb, ${accent} 7%, transparent))`
            : 'rgba(239,244,255,0.045)',
          border: quest.completed
            ? '1px solid rgba(239,244,255,0.13)'
            : '1px solid rgba(239,244,255,0.09)',
        }}
        aria-label={`${quest.title}, ${quest.description}, ${statusLabel}`}
      >
      <div className="flex w-full items-center gap-3 mb-2.5 lg:mb-3">
        <span
          className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-[14px]"
          style={{
            background: visual.background,
          }}
          aria-hidden
        >
          <Icon
            size={19}
            strokeWidth={2.35}
            style={{ color: visual.color }}
          />
        </span>
        <div className="flex-1 min-w-0">
          <p className="kr-heading text-[13px] lg:text-[14px] tracking-wide">
            {quest.title}
          </p>
          <p className="kr-body mt-0.5 text-[11px] lg:text-[12px] text-cream/60 leading-[1.45]">
            {quest.description}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className="kr-heading inline-flex items-center gap-1.5 text-[12px] lg:text-[13px]"
            style={{
              color: quest.claimed
                ? '#86efac'
                : 'rgba(239,244,255,0.68)',
            }}
          >
            {quest.claimed && quest.rewardAvailable ? (
              <CheckCircle2 size={17} strokeWidth={2.6} />
            ) : null}
            {statusLabel}
            {canOpen ? <ChevronRight size={14} strokeWidth={2.4} /> : null}
          </span>
          <span
            className="kr-num inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tabular-nums"
            style={{
              color: 'rgba(255,226,154,0.88)',
              background: 'rgba(251,191,36,0.07)',
              border: '1px solid rgba(251,191,36,0.17)',
            }}
          >
            <Gift size={10} strokeWidth={2.4} aria-hidden />
            보상 +{quest.rewardXp} XP
          </span>
        </div>
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
      {!quest.completed && quest.target > 0 ? (
        <span className="kr-num mt-2 self-end text-[10px] text-cream/45 tabular-nums">
          {quest.progress} / {quest.target}
        </span>
      ) : null}
      </button>
    </li>
  );
}

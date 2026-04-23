/**
 * 토픽 마스터리 뱃지 — Bronze / Silver / Gold / Platinum / Diamond.
 * tier='none' 이면 null 반환.
 */

import { Award } from 'lucide-react';
import type { MasteryInfo } from '../rpg';

interface Props {
  info: MasteryInfo;
  /** 컴팩트 모드 — 배지 크기를 줄여 Zone 카드용에 알맞게. */
  compact?: boolean;
}

export default function MasteryBadge({ info, compact = false }: Props) {
  if (info.tier === 'none') return null;

  const size = compact ? 11 : 12;
  const padX = compact ? 'px-2' : 'px-2.5';
  const padY = compact ? 'py-0.5' : 'py-1';
  const fontSize = compact ? 'text-[10px]' : 'text-[11px]';

  return (
    <span
      className={`kr-heading ${fontSize} uppercase tracking-widest inline-flex items-center gap-1 rounded-full ${padX} ${padY} shrink-0`}
      style={{
        background: `${info.color}1f`, // hex + 알파 12%
        color: info.color,
        border: `1px solid ${info.color}33`,
      }}
      title={`마스터리: ${info.mastered}/${info.total} 문항 정복`}
    >
      <Award size={size} strokeWidth={2.4} />
      {info.label}
    </span>
  );
}

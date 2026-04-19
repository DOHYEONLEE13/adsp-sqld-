/**
 * 약점 뱃지 — 토픽 카드 옆에 '🔥 약점' / '⚠️ 점검' / '✓ 안정' 작은 라벨.
 * 데이터가 부족하면(unknown) 아무것도 표시하지 않습니다.
 */

import { AlertTriangle, Flame, Check } from 'lucide-react';
import type { TopicWeakness } from '../weakness';
import { weaknessLevel } from '../weakness';

interface Props {
  weakness: TopicWeakness;
}

export default function WeaknessBadge({ weakness }: Props) {
  const level = weaknessLevel(weakness);
  if (level === 'unknown') return null;

  const map = {
    weak: {
      label: '약점',
      color: '#f87171',
      bg: 'rgba(248, 113, 113, 0.12)',
      icon: <Flame size={12} strokeWidth={2.6} />,
    },
    watch: {
      label: '점검',
      color: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.12)',
      icon: <AlertTriangle size={12} strokeWidth={2.6} />,
    },
    ok: {
      label: '안정',
      color: '#6FFF00',
      bg: 'rgba(111, 255, 0, 0.10)',
      icon: <Check size={12} strokeWidth={2.8} />,
    },
  } as const;
  const v = map[level];

  return (
    <span
      className="kr-heading inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full"
      style={{ color: v.color, background: v.bg }}
    >
      {v.icon}
      {v.label}
    </span>
  );
}

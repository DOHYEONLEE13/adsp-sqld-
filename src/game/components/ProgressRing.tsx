/**
 * ProgressRing — 원형 SVG 진도 링.
 *
 * Planet/Zone 카드용. solved/total 비율을 원둘레로, 중앙에 % 텍스트.
 * 과목 액센트 컬러를 `accent` 로 받아 Galaxy 와 시각 연결.
 */

import type { Aggregate } from '../aggregate';
import { solvedRatio } from '../aggregate';

interface Props {
  agg: Aggregate;
  /** 링 색상 (과목 액센트). */
  accent: string;
  size?: number;
  stroke?: number;
  /** 중앙에 % 라벨 표시. false 면 링만. */
  withLabel?: boolean;
}

export default function ProgressRing({
  agg,
  accent,
  size = 52,
  stroke = 3.5,
  withLabel = true,
}: Props) {
  const ratio = solvedRatio(agg);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.round(ratio * 100);
  const empty = agg.total === 0 || agg.solved === 0;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-label={`진도 ${pct}%`}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(239, 244, 255, 0.1)"
          strokeWidth={stroke}
        />
        {!empty ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={accent}
            strokeWidth={stroke}
            strokeDasharray={c}
            strokeDashoffset={c * (1 - ratio)}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              transition: 'stroke-dashoffset 0.6s ease-out',
              filter: `drop-shadow(0 0 6px ${accent}80)`,
            }}
          />
        ) : null}
      </svg>
      {withLabel ? (
        <div className="absolute inset-0 flex items-center justify-center kr-heading text-[10px] tabular-nums text-cream/80">
          {empty ? '—' : `${pct}%`}
        </div>
      ) : null}
    </div>
  );
}

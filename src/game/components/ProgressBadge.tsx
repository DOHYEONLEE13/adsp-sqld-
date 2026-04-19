/**
 * 진도 뱃지 — solved/total + 정답률 + 얇은 진도 바.
 * Galaxy / Planet / Zone 카드 상단·하단 어디든 붙일 수 있도록 만듭니다.
 */

import type { Aggregate } from '../aggregate';
import { formatProgressLabel, solvedRatio } from '../aggregate';
import { cx } from '@/lib/utils';

interface Props {
  agg: Aggregate;
  /** bar 표시 여부. false 면 텍스트 라벨만. */
  withBar?: boolean;
  className?: string;
}

export default function ProgressBadge({
  agg,
  withBar = true,
  className,
}: Props) {
  const ratio = solvedRatio(agg);
  const pctLabel = formatProgressLabel(agg);
  const accuracyColor =
    agg.solved === 0
      ? 'var(--cream)'
      : agg.accuracy >= 0.8
        ? '#6FFF00'
        : agg.accuracy >= 0.5
          ? '#a78bfa'
          : '#f87171';

  return (
    <div className={cx('mt-3', className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="kr-heading text-[11px] uppercase tracking-widest text-cream/60">
          Progress
        </span>
        <span
          className="kr-heading text-[12px] tracking-wide"
          style={{ color: accuracyColor }}
        >
          {pctLabel}
        </span>
      </div>
      {withBar ? (
        <div
          className="mt-2 h-[6px] rounded-full overflow-hidden"
          style={{ background: 'rgba(239, 244, 255, 0.08)' }}
        >
          <div
            className="h-full transition-[width] duration-500"
            style={{
              width: `${Math.round(ratio * 100)}%`,
              background:
                ratio === 0
                  ? 'transparent'
                  : 'linear-gradient(90deg, var(--purple-1), var(--purple-2), #6FFF00)',
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

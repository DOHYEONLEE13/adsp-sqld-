/**
 * PassTierBadge — 회독 Tier 시각화 칩.
 *
 * 사용처:
 *   - MobileTopBar 닉네임 옆 (size='xs')
 *   - StatsPage 헤더 (size='lg')
 *   - FriendsPage 카드 좌측 vertical accent (size='accent' — 띠 스타일)
 *   - PlanetScreen / ZoneScreen 탭 (size='md')
 *
 * Tier 색·아이콘 토큰: src/types/passes.ts 의 PASS_TIER_VISUAL.
 */

import {
  PASS_TIER_LABEL,
  PASS_TIER_MEANING,
  PASS_TIER_VISUAL,
  type PassTier,
} from '@/types/passes';

const TIER_ICON: Record<PassTier, string> = {
  bronze: '🛰',
  silver: '🌍',
  gold: '🚀',
  platinum: '🌌',
  master: '⭐',
};

interface Props {
  tier: PassTier;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** 의미 텍스트 (1회독 진행 중 …) 표시 여부. */
  showMeaning?: boolean;
  /** 클릭 가능한지 (탭 등). */
  onClick?: () => void;
  /** active 상태 — 탭에서 현재 선택 시 강조. */
  active?: boolean;
  className?: string;
}

const SIZE_TOKENS = {
  xs: { px: 'px-2', py: 'py-0.5', text: 'text-[9px]', icon: 'text-[10px]', gap: 'gap-1' },
  sm: { px: 'px-2.5', py: 'py-1', text: 'text-[10px]', icon: 'text-[11px]', gap: 'gap-1' },
  md: { px: 'px-3', py: 'py-1.5', text: 'text-[11px]', icon: 'text-[13px]', gap: 'gap-1.5' },
  lg: { px: 'px-4', py: 'py-2', text: 'text-[13px]', icon: 'text-[16px]', gap: 'gap-2' },
} as const;

export default function PassTierBadge({
  tier,
  size = 'sm',
  showMeaning = false,
  onClick,
  active = false,
  className,
}: Props) {
  const visual = PASS_TIER_VISUAL[tier];
  const tokens = SIZE_TOKENS[size];
  const Wrapper = onClick ? 'button' : 'span';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={[
        'kr-num inline-flex items-center rounded-full transition select-none uppercase tracking-widest',
        tokens.px,
        tokens.py,
        tokens.gap,
        tokens.text,
        onClick ? 'active:scale-[0.97] cursor-pointer' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        background: active ? `${visual.color}33` : 'rgba(239,244,255,0.06)',
        border: `1px solid ${active ? visual.color : 'rgba(239,244,255,0.18)'}`,
        color: active ? visual.color : 'var(--cream)',
        boxShadow: active ? `0 0 14px ${visual.glow}` : undefined,
      }}
    >
      <span className={tokens.icon} aria-hidden>
        {TIER_ICON[tier]}
      </span>
      <span style={{ fontWeight: 600 }}>{PASS_TIER_LABEL[tier]}</span>
      {showMeaning ? (
        <span
          className={tokens.text}
          style={{ opacity: 0.65, marginLeft: 4, textTransform: 'none' }}
        >
          {PASS_TIER_MEANING[tier]}
        </span>
      ) : null}
    </Wrapper>
  );
}

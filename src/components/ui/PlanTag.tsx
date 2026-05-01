/**
 * PlanTag — 사용자의 현재 요금제를 작은 라벨로 표시.
 *
 * 어디 쓰나:
 *   - 학습 대시보드 (StatsPage) 우상단
 *   - 학습 섹션 (Game pages 의 MobileTopBar) 우상단
 *
 * 세 가지 변형:
 *   - FREE  : 회색 ghost 톤
 *   - PRO   : neon outline (1주 단기)
 *   - MAX   : neon solid + glow (월 구독)
 *
 * 클릭 시 #/#pricing 으로 이동 — 사용자가 업그레이드 경로를 즉시 인지.
 *
 * 결제 시스템 도입 전이라 현재는 항상 FREE 표시. is_premium 컬럼만으론 PRO·MAX
 * 구분 어려움 (premium_until 으로 간접 추정 가능 — 7일 이내 만료면 PRO, 30일이면
 * MAX). 그건 결제 webhook 활성 후 처리.
 */

import { useEffect, useState } from 'react';
import { getMyProfile, subscribeProfile } from '@/data/profile';

export type PlanTagSize = 'sm' | 'md';

interface Props {
  size?: PlanTagSize;
  className?: string;
}

type PlanLevel = 'FREE' | 'PRO' | 'MAX';

/**
 * is_premium + premium_until 로 어느 plan 인지 추정.
 * (정확한 product_code 추적은 결제 webhook 활성 후 추가.)
 */
function inferPlan(profile: ReturnType<typeof getMyProfile>): PlanLevel {
  // pendingServerSync 면 추정 불가 — FREE 로.
  if (profile.pendingServerSync) return 'FREE';
  // is_premium 필드는 MyProfile 에 없으므로 단계적으로:
  // 결제 시스템 활성 전이라 현재는 모두 FREE.
  // 향후 profile.isPremium · profile.premiumPlan 등 추가되면 여기서 분기.
  return 'FREE';
}

export default function PlanTag({ size = 'sm', className }: Props) {
  const [profile, setProfile] = useState(() => getMyProfile());
  useEffect(() => {
    const unsub = subscribeProfile(() => setProfile(getMyProfile()));
    return () => {
      unsub();
    };
  }, []);

  const plan = inferPlan(profile);

  const dims =
    size === 'md'
      ? { padding: '4px 9px', fontSize: 11, gap: 5 }
      : { padding: '2px 7px', fontSize: 9.5, gap: 4 };

  const styles: Record<PlanLevel, { bg: string; color: string; border: string; shadow?: string }> =
    {
      FREE: {
        bg: 'rgba(239,244,255,0.08)',
        color: 'rgba(239,244,255,0.75)',
        border: '1px solid rgba(239,244,255,0.18)',
      },
      PRO: {
        bg: 'rgba(111,255,0,0.1)',
        color: '#9CFF3D',
        border: '1px solid rgba(111,255,0,0.4)',
      },
      MAX: {
        bg: 'linear-gradient(180deg, #6FFF00 0%, #5BD600 100%)',
        color: '#010828',
        border: '1px solid rgba(111,255,0,0.55)',
        shadow: '0 4px 12px -3px rgba(111,255,0,0.55)',
      },
    };

  const s = styles[plan];

  return (
    <a
      href="#pricing"
      onClick={(e) => {
        // 같은 페이지의 #pricing 으로 점프 (홈에서만 의미). 다른 페이지면 홈 진입.
        if (!window.location.pathname.endsWith('/') && window.location.hash !== '') {
          e.preventDefault();
          window.location.href = '/#pricing';
        }
      }}
      aria-label={`현재 요금제 ${plan} — Pricing 으로 이동`}
      className={
        'kr-num inline-flex items-center font-bold tracking-[0.18em] uppercase rounded-full transition active:scale-95 hover:brightness-110 ' +
        (className ?? '')
      }
      style={{
        background: s.bg,
        color: s.color,
        border: s.border,
        boxShadow: s.shadow,
        padding: dims.padding,
        fontSize: dims.fontSize,
        gap: dims.gap,
      }}
    >
      <span>{plan}</span>
    </a>
  );
}

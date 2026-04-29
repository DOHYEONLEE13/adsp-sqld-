/**
 * TierUpgradeToast — Pass Tier 승급 시 4초 화면 상단 토스트.
 *
 * 동작:
 *   - usePassSnapshot 으로 tier 변화 감지
 *   - 이전 tier 보다 높아지면 토스트 표시
 *   - 마운트 직후 첫 snapshot 은 비교만 (초기 로드 시 토스트 X)
 *   - sessionStorage 에 마지막 표시한 tier 보관 — 같은 세션에서 같은 승급 중복 방지
 *
 * App 루트에 1번 마운트해 모든 라우트에서 동작.
 */

import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { usePassSnapshot } from '@/game/passSync';
import {
  PASS_TIER_LABEL,
  PASS_TIER_ORDER,
  PASS_TIER_VISUAL,
  type PassTier,
} from '@/types/passes';

const SHOWN_KEY = 'questdp.passTier.lastShown.v1';

export default function TierUpgradeToast() {
  const snap = usePassSnapshot();
  const prevTierRef = useRef<PassTier | null>(null);
  const [show, setShow] = useState<{ tier: PassTier; key: number } | null>(null);

  useEffect(() => {
    if (!snap.authed) return;
    const prev = prevTierRef.current;
    prevTierRef.current = snap.tier;

    // 첫 mount = baseline
    if (prev === null) return;

    const newRank = PASS_TIER_ORDER.indexOf(snap.tier);
    const prevRank = PASS_TIER_ORDER.indexOf(prev);

    if (newRank > prevRank) {
      // 이미 같은 tier 토스트 표시했으면 skip
      try {
        const lastShown = window.sessionStorage.getItem(SHOWN_KEY);
        if (lastShown === snap.tier) return;
        window.sessionStorage.setItem(SHOWN_KEY, snap.tier);
      } catch {
        /* private mode 등 — 무시 */
      }
      setShow({ tier: snap.tier, key: Date.now() });
      const t = window.setTimeout(() => setShow(null), 4200);
      return () => window.clearTimeout(t);
    }
  }, [snap.tier, snap.authed]);

  if (!show) return null;

  const visual = PASS_TIER_VISUAL[show.tier];

  return (
    <div
      role="status"
      key={show.key}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl pointer-events-none flex items-center gap-3"
      style={{
        background: 'rgba(20,32,46,0.96)',
        border: `1.5px solid ${visual.color}`,
        boxShadow: `0 0 24px ${visual.glow}`,
        animation: 'tierToastRise 0.5s ease-out',
      }}
    >
      <Sparkles size={16} style={{ color: visual.color }} />
      <div className="flex flex-col">
        <span
          className="kr-num text-[10px] uppercase tracking-widest"
          style={{ color: visual.color, fontWeight: 600 }}
        >
          🎉 Tier 승급
        </span>
        <span
          className="kr-heading text-[14px] mt-0.5"
          style={{ color: 'var(--cream)' }}
        >
          {PASS_TIER_LABEL[show.tier]} 도달!
        </span>
      </div>
    </div>
  );
}

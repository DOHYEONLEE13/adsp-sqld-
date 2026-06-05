/**
 * EnergyBadge — ⚡ 에너지 + 30분 충전 타이머.
 *
 * 표시 정책 (cap=10):
 *  - 게스트 (인증 X): "⚡ N/10" — localStorage 기반 가입 friction
 *  - 프리미엄 / 어드민: "∞ ⚡" — 무제한 표식
 *  - 무료 인증, energy === 10 (cap): "⚡ 10" — 타이머 없음 (이미 풀 상태)
 *  - 무료 인증, energy < 10: "⚡ N · MM:SS" — 다음 충전까지 카운트다운
 *
 * 30분 타이머:
 *   nextRegenAt = energyUpdatedAt + 30분
 *   energy >= cap 이면 타이머 숨김
 *   1초마다 useState 로 갱신
 */

import { useEffect, useRef, useState } from 'react';
import { Infinity as InfinityIcon, Zap } from 'lucide-react';
import {
  useEnergy,
  isUnlimited,
  ENERGY_CAP,
  refreshEnergy,
  type EnergyState,
} from '../energy';
import EnergyShopModal from './EnergyShopModal';

const REGEN_AFTER_MS = 30 * 60 * 1000; // 30분
const CAP = ENERGY_CAP;

interface Props {
  /** 색상 — 기본 보라 (#A78BFA). 다른 contexts 에서 customize 가능. */
  color?: string;
  /** 크기 — 'sm' (Mobile nav) 또는 'md' (settings 등). */
  size?: 'sm' | 'md';
  /** 좁은 앱 상단바용 — 타이머/보조 텍스트 없이 핵심 숫자만 표시. */
  compact?: boolean;
}

export default function EnergyBadge({
  color = '#A78BFA',
  size = 'sm',
  compact = false,
}: Props) {
  const energy = useEnergy();

  // 무제한 (게스트 / 프리미엄 / 어드민) — 단일 ∞ 표식
  if (isUnlimited(energy)) {
    return (
      <span
        className={`inline-flex items-center ${compact ? 'gap-0.5' : 'gap-1'}`}
        title={energy.isAdmin ? '어드민 — ⚡ 무제한' : energy.isPremium ? '프리미엄 — ⚡ 무제한' : '게스트 — ⚡ 무제한'}
      >
        <InfinityIcon
          size={compact ? 17 : size === 'sm' ? 20 : 24}
          style={{ color }}
          strokeWidth={2.4}
        />
        <Zap size={compact ? 13 : size === 'sm' ? 16 : 18} fill={color} strokeWidth={0} />
      </span>
    );
  }

  // 무료 인증 — 카운트 + (충전 중이면) 타이머
  return <CountedBadge state={energy} color={color} size={size} compact={compact} />;
}

function CountedBadge({
  state,
  color,
  size,
  compact,
}: {
  state: EnergyState;
  color: string;
  size: 'sm' | 'md';
  compact: boolean;
}) {
  const showTimer = state.energy < CAP;
  const [now, setNow] = useState<number>(() => Date.now());
  // 충전 상점 모달 — XP 구매 + 광고 시청 통합 진입점.
  const [shopOpen, setShopOpen] = useState(false);

  // 1초 tick — 타이머 표시 시에만 활성
  useEffect(() => {
    if (!showTimer) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [showTimer]);

  const nextRegenAt = state.energyUpdatedAt + REGEN_AFTER_MS;
  const remainingMs = Math.max(0, nextRegenAt - now);
  const mm = Math.floor(remainingMs / 60000);
  const ss = Math.floor((remainingMs % 60000) / 1000);
  const refreshedCycleRef = useRef<number | null>(null);

  useEffect(() => {
    if (!showTimer) {
      refreshedCycleRef.current = null;
      return;
    }
    if (remainingMs > 0) {
      refreshedCycleRef.current = null;
      return;
    }
    if (refreshedCycleRef.current === state.energyUpdatedAt) return;
    refreshedCycleRef.current = state.energyUpdatedAt;
    void refreshEnergy();
  }, [remainingMs, showTimer, state.energyUpdatedAt]);

  // 항상 탭 가능 — 충전 상점 모달 (XP 구매 + 광고).
  const title =
    state.energy < CAP
      ? `⚡ ${state.energy}/${CAP} — 다음 회복 ${mm}:${String(ss).padStart(2, '0')} (탭 = 충전 상점)`
      : `⚡ ${state.energy}/${CAP} — 풀 충전 (탭 = 충전 상점)`;

  const inner = (
    <>
      <span className="inline-flex items-center gap-1">
        <Zap size={size === 'sm' ? 16 : 18} fill={color} strokeWidth={0} />
        <span
          className="kr-num tabular-nums"
          style={{
            color,
            fontSize: compact ? 12 : size === 'sm' ? 13 : 15,
            lineHeight: 1,
          }}
        >
          {state.energy}
        </span>
      </span>
      {showTimer ? (
        <span
          className="kr-num tabular-nums"
          style={{
            color: 'rgba(239,244,255,0.55)',
            fontSize: compact ? 9.5 : size === 'sm' ? 10 : 11,
            lineHeight: 1,
            letterSpacing: '0.02em',
          }}
          aria-label={`다음 충전까지 ${mm}분 ${ss}초`}
        >
          {mm}:{String(ss).padStart(2, '0')}
        </span>
      ) : null}
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setShopOpen(true)}
        aria-label={
          state.energy < CAP
            ? `에너지 ${state.energy}, 충전 상점 열기`
            : `에너지 ${state.energy}, 충전 상점 열기`
        }
        title={title}
        className={`inline-flex shrink-0 items-center ${compact ? 'gap-1' : 'gap-1.5'} transition active:scale-95 hover:opacity-80`}
      >
        {inner}
      </button>
      {shopOpen ? <EnergyShopModal onClose={() => setShopOpen(false)} /> : null}
    </>
  );
}

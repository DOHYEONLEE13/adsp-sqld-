/**
 * EnergyBadge — ⚡ 에너지 + 30분 충전 타이머.
 *
 * 표시 정책:
 *  - 게스트 (인증 X): "⚡ 5" 정적 (서버 sync 없으니 fair use 제약 X)
 *  - 프리미엄 / 어드민: "∞ ⚡" — 무제한 표식
 *  - 무료 인증, energy === 5 (cap): "⚡ 5" — 타이머 없음 (이미 풀 상태)
 *  - 무료 인증, energy < 5: "⚡ N · MM:SS" — 다음 충전까지 카운트다운
 *
 * 30분 타이머:
 *   nextRegenAt = energyUpdatedAt + 30분
 *   energy >= cap 이면 타이머 숨김
 *   1초마다 useState 로 갱신
 */

import { useEffect, useState } from 'react';
import { Infinity as InfinityIcon, Zap } from 'lucide-react';
import { useEnergy, isUnlimited, type EnergyState } from '../energy';

const REGEN_AFTER_MS = 30 * 60 * 1000; // 30분
const CAP = 5;

interface Props {
  /** 색상 — 기본 보라 (#A78BFA). 다른 contexts 에서 customize 가능. */
  color?: string;
  /** 크기 — 'sm' (Mobile nav) 또는 'md' (settings 등). */
  size?: 'sm' | 'md';
}

export default function EnergyBadge({ color = '#A78BFA', size = 'sm' }: Props) {
  const energy = useEnergy();

  // 무제한 (게스트 / 프리미엄 / 어드민) — 단일 ∞ 표식
  if (isUnlimited(energy)) {
    return (
      <span
        className="inline-flex items-center gap-1"
        title={energy.isAdmin ? '어드민 — ⚡ 무제한' : energy.isPremium ? '프리미엄 — ⚡ 무제한' : '게스트 — ⚡ 무제한'}
      >
        <InfinityIcon
          size={size === 'sm' ? 20 : 24}
          style={{ color }}
          strokeWidth={2.4}
        />
        <Zap size={size === 'sm' ? 16 : 18} fill={color} strokeWidth={0} />
      </span>
    );
  }

  // 무료 인증 — 카운트 + (충전 중이면) 타이머
  return <CountedBadge state={energy} color={color} size={size} />;
}

function CountedBadge({
  state,
  color,
  size,
}: {
  state: EnergyState;
  color: string;
  size: 'sm' | 'md';
}) {
  const showTimer = state.energy < CAP;
  const [now, setNow] = useState<number>(() => Date.now());

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

  return (
    <span
      className="inline-flex items-center gap-1.5"
      title={
        showTimer
          ? `⚡ ${state.energy}/${CAP} — 다음 충전 ${mm}:${String(ss).padStart(2, '0')}`
          : `⚡ ${state.energy}/${CAP} — 풀 충전`
      }
    >
      <span className="inline-flex items-center gap-1">
        <Zap size={size === 'sm' ? 16 : 18} fill={color} strokeWidth={0} />
        <span
          className="kr-num tabular-nums"
          style={{
            color,
            fontSize: size === 'sm' ? 13 : 15,
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
            fontSize: size === 'sm' ? 10 : 11,
            lineHeight: 1,
            letterSpacing: '0.02em',
          }}
          aria-label={`다음 충전까지 ${mm}분 ${ss}초`}
        >
          {mm}:{String(ss).padStart(2, '0')}
        </span>
      ) : null}
    </span>
  );
}

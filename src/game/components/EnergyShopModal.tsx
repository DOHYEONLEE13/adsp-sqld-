/**
 * EnergyShopModal — 상단 ⚡ 배지 클릭 시 노출되는 충전 상점.
 *
 * 옵션:
 *   1) XP → 에너지 구매 (3 티어)
 *      - 40 XP → +1 ⚡
 *      - 100 XP → +3 ⚡
 *      - 300 XP → +10 ⚡
 *   2) 광고 시청 → +5 ⚡ (기존 AdRewardModal 흐름 — 자식 모달로 띄움)
 *
 * 정책:
 *   - cap (10) 초과 시 구매 거부 ("에너지 가득").
 *   - XP 부족 시 구매 거부 ("XP 부족").
 *   - 게스트 (localStorage) atomic. 인증 사용자 서버 동기화는 v1.1 (server RPC) 에서.
 *
 * Portal 으로 document.body 마운트 — backdrop-filter stacking context 회피.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Zap, Check, AlertTriangle, PlayCircle, Crown } from 'lucide-react';
import {
  useEnergy,
  ENERGY_CAP,
  AD_REWARD,
  AD_DAILY_CAP,
  isUnlimited,
  purchaseEnergyWithXp,
  type PurchaseResult,
} from '../energy';
import { useProgress } from '../useProgress';
import { computePlayerStats } from '../rpg';
import { spendXp } from '../storage';
import AdRewardModal from './AdRewardModal';

interface PurchaseTier {
  /** 카드 식별자 (storage key 아님 — UI 용). */
  id: 'tier-small' | 'tier-mid' | 'tier-big';
  xpCost: number;
  energyAmount: number;
  /** 큰 카드 강조 (best value). */
  highlight?: boolean;
}

const TIERS: PurchaseTier[] = [
  { id: 'tier-small', xpCost: 40, energyAmount: 1 },
  { id: 'tier-mid', xpCost: 100, energyAmount: 3, highlight: true },
  { id: 'tier-big', xpCost: 300, energyAmount: 10 },
];

interface Props {
  onClose: () => void;
}

export default function EnergyShopModal({ onClose }: Props) {
  const energy = useEnergy();
  const progress = useProgress();
  const stats = computePlayerStats(progress);
  const [adOpen, setAdOpen] = useState(false);
  /** 사용자가 선택한 티어 (확인 step 활성화 — 한 번 더 "구매하기" 눌러야 결제). */
  const [selectedTierId, setSelectedTierId] = useState<PurchaseTier['id'] | null>(null);
  /** 직전 구매 결과 — 토스트로 1.6 초 노출. */
  const [flash, setFlash] = useState<{
    kind: 'ok' | 'err';
    text: string;
  } | null>(null);

  // ESC 닫기.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !adOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, adOpen]);

  const unlimited = isUnlimited(energy);
  const energyDisplay = unlimited ? '∞' : `${energy.energy}/${ENERGY_CAP}`;

  const handleConfirmBuy = (tier: PurchaseTier) => {
    if (unlimited) {
      setFlash({ kind: 'err', text: '프리미엄은 이미 ⚡ 무제한이에요.' });
      setSelectedTierId(null);
      return;
    }
    const result: PurchaseResult = purchaseEnergyWithXp({
      xpCost: tier.xpCost,
      energyAmount: tier.energyAmount,
      currentDisplayedXp: stats.totalXp,
    });
    if (!result.ok) {
      setFlash({
        kind: 'err',
        text:
          result.reason === 'insufficient-xp'
            ? 'XP 가 부족해요.'
            : result.reason === 'cap-overflow'
              ? `에너지가 가득 차서 살 수 없어요 (cap ${ENERGY_CAP}).`
              : '잠깐 문제가 있어요.',
      });
    } else {
      // XP 차감은 storage 에 (purchaseEnergyWithXp 는 에너지만 처리).
      spendXp(tier.xpCost);
      setFlash({
        kind: 'ok',
        text: `+${tier.energyAmount} ⚡ 충전! 잔여 XP ${stats.totalXp - tier.xpCost}`,
      });
    }
    setSelectedTierId(null);
    window.setTimeout(() => setFlash(null), 1600);
  };

  const node = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="energy-shop-title"
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6"
      style={{ background: 'rgba(1,8,40,0.78)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="liquid-glass relative w-full max-w-[420px] max-h-[90vh] overflow-y-auto rounded-[24px] p-5 md:p-6"
        style={{
          background: 'rgba(20,32,46,0.96)',
          border: '1px solid rgba(167,139,250,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-3 right-3 w-8 h-8 inline-flex items-center justify-center rounded-full transition active:scale-95"
        >
          <X size={16} className="text-cream" strokeWidth={2.4} />
        </button>

        {/* 헤더 — 현재 ⚡ + 현재 XP */}
        <div className="mb-4">
          <h3 id="energy-shop-title" className="kr-heading text-[19px] mb-1">
            ⚡ 충전 상점
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{
                background: 'rgba(167,139,250,0.16)',
                border: '1px solid rgba(167,139,250,0.5)',
              }}
            >
              <Zap size={12} fill="#A78BFA" strokeWidth={0} />
              <span
                className="kr-num text-[12px] tabular-nums"
                style={{ color: '#A78BFA' }}
              >
                {energyDisplay}
              </span>
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{
                background: 'rgba(255,176,32,0.16)',
                border: '1px solid rgba(255,176,32,0.5)',
              }}
            >
              <span
                className="kr-num text-[10px] tracking-wider"
                style={{ color: '#FFB020' }}
              >
                XP
              </span>
              <span
                className="kr-num text-[12px] tabular-nums"
                style={{ color: '#FFB020' }}
              >
                {stats.totalXp}
              </span>
            </span>
          </div>
        </div>

        <p className="kr-body text-[12px] text-cream/65 leading-[1.55] mb-4">
          XP 로 ⚡ 즉시 충전. 광고 시청은 1 일 {AD_DAILY_CAP} 회 한도.
        </p>

        {/* 3 티어 구매 카드 — 클릭 시 선택 상태 → "구매하기" 버튼 노출 (이중 confirm) */}
        <div className="flex flex-col gap-2 mb-4">
          {TIERS.map((t) => {
            const canAfford = stats.totalXp >= t.xpCost;
            const wouldOverflow =
              !unlimited && energy.energy + t.energyAmount > ENERGY_CAP;
            const disabled = unlimited || !canAfford || wouldOverflow;
            const isSelected = selectedTierId === t.id;
            const reasonShort = unlimited
              ? '프리미엄'
              : !canAfford
                ? 'XP 부족'
                : wouldOverflow
                  ? '에너지 가득'
                  : '선택';
            return (
              <div
                key={t.id}
                className="rounded-2xl overflow-hidden transition"
                style={{
                  background: disabled
                    ? 'rgba(239,244,255,0.04)'
                    : isSelected
                      ? 'rgba(167,139,250,0.22)'
                      : t.highlight
                        ? 'rgba(167,139,250,0.18)'
                        : 'rgba(239,244,255,0.06)',
                  border: isSelected
                    ? '1.5px solid var(--neon)'
                    : t.highlight
                      ? '1.5px solid rgba(167,139,250,0.55)'
                      : '1px solid rgba(239,244,255,0.14)',
                  opacity: disabled ? 0.55 : 1,
                }}
              >
                {/* 1 단계: 티어 카드 (클릭 → 선택) */}
                <button
                  type="button"
                  onClick={() => {
                    if (disabled) return;
                    setSelectedTierId(isSelected ? null : t.id);
                  }}
                  disabled={disabled}
                  aria-pressed={isSelected}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 transition active:scale-[0.99] disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className="kr-num text-[13px] tabular-nums px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(255,176,32,0.16)',
                        color: '#FFB020',
                        border: '1px solid rgba(255,176,32,0.4)',
                      }}
                    >
                      {t.xpCost} XP
                    </span>
                    <span className="kr-body text-[13px] text-cream/65">→</span>
                    <span
                      className="kr-num text-[14px] font-medium tabular-nums inline-flex items-center gap-1"
                      style={{ color: '#A78BFA' }}
                    >
                      +{t.energyAmount}
                      <Zap size={13} fill="#A78BFA" strokeWidth={0} />
                    </span>
                    {t.highlight ? (
                      <span
                        className="kr-num text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded-full ml-1"
                        style={{
                          background: 'rgba(111,255,0,0.12)',
                          color: 'var(--neon)',
                          border: '1px solid rgba(111,255,0,0.4)',
                        }}
                      >
                        추천
                      </span>
                    ) : null}
                  </span>
                  <span
                    className="kr-num text-[11px] uppercase tracking-widest"
                    style={{
                      color: disabled
                        ? 'rgba(239,244,255,0.4)'
                        : isSelected
                          ? 'var(--neon)'
                          : 'var(--cream)',
                    }}
                  >
                    {isSelected ? '선택됨' : reasonShort}
                  </span>
                </button>

                {/* 2 단계: 선택 시 "구매하기" + "취소" 노출 */}
                {isSelected && !disabled ? (
                  <div className="flex gap-2 px-4 pb-3">
                    <button
                      type="button"
                      onClick={() => handleConfirmBuy(t)}
                      className="flex-1 kr-num text-[12.5px] font-medium py-2.5 rounded-full inline-flex items-center justify-center gap-1.5 transition active:scale-[0.97]"
                      style={{
                        background: 'var(--neon)',
                        color: '#0a1f00',
                      }}
                    >
                      <Check size={13} strokeWidth={2.6} />
                      구매하기
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTierId(null)}
                      className="kr-num text-[12.5px] py-2.5 px-4 rounded-full transition active:scale-[0.97]"
                      style={{
                        background: 'rgba(239,244,255,0.08)',
                        color: 'rgba(239,244,255,0.75)',
                        border: '1px solid rgba(239,244,255,0.14)',
                      }}
                    >
                      취소
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* 광고 시청 옵션 — 무료, 일일 한도 */}
        <button
          type="button"
          onClick={() => setAdOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full transition active:scale-[0.98]"
          style={{
            background: 'rgba(111,255,0,0.10)',
            color: 'var(--neon)',
            border: '1px solid rgba(111,255,0,0.35)',
          }}
        >
          <PlayCircle size={13} strokeWidth={2.4} />
          <span className="kr-num text-[12.5px] font-medium">
            광고 보고 ⚡ {AD_REWARD} 무료 충전
          </span>
        </button>

        {/* 프리미엄 결제 유도 — 광고·XP 신경 안 쓰고 ⚡ 무제한 */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/#pricing';
            }
          }}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full transition active:scale-[0.98]"
          style={{
            background: 'rgba(167,139,250,0.18)',
            color: '#A78BFA',
            border: '1px solid rgba(167,139,250,0.5)',
          }}
        >
          <Crown size={13} strokeWidth={2.4} />
          <span className="kr-num text-[12.5px] font-medium">
            무제한 — 프리미엄 보기
          </span>
        </button>

        {/* 토스트 */}
        {flash ? (
          <div
            role="status"
            className="mt-3 px-3 py-2 rounded-lg kr-body text-[12px] flex items-center gap-2"
            style={{
              background:
                flash.kind === 'ok'
                  ? 'rgba(111,255,0,0.10)'
                  : 'rgba(248,113,113,0.10)',
              border:
                flash.kind === 'ok'
                  ? '1px solid rgba(111,255,0,0.4)'
                  : '1px solid rgba(248,113,113,0.4)',
              color: flash.kind === 'ok' ? 'var(--neon)' : '#fca5a5',
            }}
          >
            {flash.kind === 'ok' ? (
              <Check size={12} strokeWidth={2.6} />
            ) : (
              <AlertTriangle size={12} strokeWidth={2.4} />
            )}
            {flash.text}
          </div>
        ) : null}
      </motion.div>

      {/* 자식: 광고 모달 */}
      {adOpen ? (
        <AdRewardModal
          onClose={() => setAdOpen(false)}
        />
      ) : null}
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(node, document.body);
}

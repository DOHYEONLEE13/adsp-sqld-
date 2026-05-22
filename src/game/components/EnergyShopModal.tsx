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
import { X, Zap, Check, AlertTriangle, Play, Crown, Sparkles } from 'lucide-react';
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
        className="liquid-glass relative w-full max-w-[420px] max-h-[90vh] overflow-y-auto rounded-[28px] p-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, rgba(167,139,250,0.18) 0%, rgba(20,32,46,0.98) 55%)',
          border: '1px solid rgba(167,139,250,0.45)',
          boxShadow:
            '0 24px 60px -10px rgba(167,139,250,0.35), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-3 right-3 w-9 h-9 inline-flex items-center justify-center rounded-full transition active:scale-95 z-10"
          style={{
            background: 'rgba(239,244,255,0.06)',
            border: '1px solid rgba(239,244,255,0.10)',
          }}
        >
          <X size={16} className="text-cream" strokeWidth={2.4} />
        </button>

        {/* ─── HERO 헤더 — 큰 ⚡ 게이지 + XP 표시 ─────────────────── */}
        <div className="px-6 pt-7 pb-5 text-center">
          <h3
            id="energy-shop-title"
            className="kr-heading text-[11px] uppercase tracking-[0.22em] text-cream/55 mb-3"
          >
            Energy Shop
          </h3>

          {/* 메인 ⚡ 게이지 — 동그란 글로우 + 큰 숫자 */}
          <div className="relative inline-flex items-center justify-center mb-3">
            <div
              aria-hidden
              className="absolute inset-0 rounded-full blur-2xl"
              style={{
                background: unlimited
                  ? 'radial-gradient(circle, rgba(255,176,32,0.45), transparent 70%)'
                  : 'radial-gradient(circle, rgba(167,139,250,0.45), transparent 70%)',
                transform: 'scale(1.5)',
              }}
            />
            <div
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-full"
              style={{
                background:
                  'linear-gradient(180deg, rgba(167,139,250,0.25), rgba(167,139,250,0.10))',
                border: '1.5px solid rgba(167,139,250,0.55)',
                boxShadow:
                  '0 8px 24px -6px rgba(167,139,250,0.55), inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
            >
              <Zap size={22} fill="#A78BFA" strokeWidth={0} />
              <span
                className="kr-num font-bold tabular-nums"
                style={{
                  color: '#EFF4FF',
                  fontSize: 28,
                  lineHeight: 1,
                  textShadow: '0 2px 8px rgba(167,139,250,0.5)',
                }}
              >
                {energyDisplay}
              </span>
            </div>
          </div>

          {/* 보유 XP */}
          <div className="inline-flex items-center gap-1.5">
            <span
              className="kr-num text-[10px] uppercase tracking-widest"
              style={{ color: 'rgba(239,244,255,0.5)' }}
            >
              보유 XP
            </span>
            <span
              className="kr-num text-[14px] font-semibold tabular-nums"
              style={{ color: '#FFB020' }}
            >
              {stats.totalXp.toLocaleString()}
            </span>
          </div>
        </div>

        {/* ─── 본문 — 회색 배경으로 hero 와 시각 분리 ──────────── */}
        <div
          className="px-5 md:px-6 pb-6 pt-4 rounded-b-[28px]"
          style={{
            background:
              'linear-gradient(180deg, rgba(1,8,40,0.0) 0%, rgba(1,8,40,0.35) 100%)',
          }}
        >
          {/* 3 티어 구매 카드 — 시각적 ⚡ 다중 표시 + highlight gradient */}
          <div className="flex flex-col gap-2.5 mb-5">
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
                    ? '가득 참'
                    : null;
              return (
                <div
                  key={t.id}
                  className="relative rounded-2xl overflow-visible transition"
                  style={{
                    background: disabled
                      ? 'rgba(239,244,255,0.03)'
                      : isSelected
                        ? 'linear-gradient(135deg, rgba(167,139,250,0.32), rgba(167,139,250,0.18))'
                        : t.highlight
                          ? 'linear-gradient(135deg, rgba(167,139,250,0.22), rgba(255,176,32,0.10))'
                          : 'rgba(239,244,255,0.05)',
                    border: isSelected
                      ? '1.5px solid var(--neon)'
                      : t.highlight
                        ? '1.5px solid rgba(167,139,250,0.6)'
                        : '1px solid rgba(239,244,255,0.10)',
                    opacity: disabled ? 0.5 : 1,
                    boxShadow: t.highlight && !disabled
                      ? '0 8px 22px -8px rgba(167,139,250,0.5)'
                      : undefined,
                  }}
                >
                  {/* 떠있는 BEST 스탬프 — highlight tier 만 */}
                  {t.highlight ? (
                    <div
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full inline-flex items-center gap-1"
                      style={{
                        background:
                          'linear-gradient(90deg, #A78BFA, #FFB020)',
                        boxShadow:
                          '0 4px 12px -2px rgba(167,139,250,0.6)',
                      }}
                    >
                      <Sparkles size={10} className="text-white" strokeWidth={2.6} />
                      <span
                        className="kr-num text-[9px] uppercase tracking-[0.16em] font-bold text-white"
                      >
                        Best Value
                      </span>
                    </div>
                  ) : null}

                  {/* 1 단계: 티어 카드 (클릭 → 선택) */}
                  <button
                    type="button"
                    onClick={() => {
                      if (disabled) return;
                      setSelectedTierId(isSelected ? null : t.id);
                    }}
                    disabled={disabled}
                    aria-pressed={isSelected}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3.5 transition active:scale-[0.99] disabled:cursor-not-allowed"
                  >
                    {/* 좌: 비주얼 ⚡ 아이콘들 + 수량 */}
                    <span className="flex items-center gap-2.5 min-w-0">
                      <ZapStack count={t.energyAmount} disabled={disabled} />
                      <span
                        className="kr-num font-bold tabular-nums"
                        style={{
                          color: disabled ? 'rgba(239,244,255,0.5)' : '#EFF4FF',
                          fontSize: t.highlight ? 22 : 19,
                          lineHeight: 1,
                        }}
                      >
                        +{t.energyAmount}
                      </span>
                    </span>

                    {/* 우: XP 가격 (항상 표시) + 상태 칩 (disabled 시) */}
                    <span className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-lg"
                        style={{
                          background: 'rgba(255,176,32,0.14)',
                          border: '1px solid rgba(255,176,32,0.4)',
                        }}
                      >
                        <span
                          className="kr-num text-[15px] font-bold tabular-nums leading-none"
                          style={{ color: '#FFB020' }}
                        >
                          {t.xpCost}
                        </span>
                        <span
                          className="kr-num text-[9px] uppercase tracking-widest leading-none"
                          style={{ color: 'rgba(255,176,32,0.8)' }}
                        >
                          XP
                        </span>
                      </span>
                      {reasonShort ? (
                        <span
                          className="kr-num text-[9px] uppercase tracking-widest leading-none"
                          style={{ color: 'rgba(248,113,113,0.85)' }}
                        >
                          {reasonShort}
                        </span>
                      ) : null}
                    </span>
                  </button>

                  {/* 2 단계: 선택 시 "구매하기" + "취소" 노출 */}
                  {isSelected && !disabled ? (
                    <div className="flex gap-2 px-4 pb-3 pt-1">
                      <button
                        type="button"
                        onClick={() => handleConfirmBuy(t)}
                        className="flex-1 kr-num text-[13px] font-bold py-2.5 rounded-full inline-flex items-center justify-center gap-1.5 transition active:scale-[0.97]"
                        style={{
                          background:
                            'linear-gradient(180deg, var(--cta-primary), var(--cta-primary-dark))',
                          color: 'var(--cta-text)',
                          boxShadow:
                            '0 5px 14px -4px rgba(125,216,80,0.45), inset 0 1px 0 rgba(255,255,255,0.22)',
                        }}
                      >
                        <Check size={14} strokeWidth={2.8} />
                        구매하기
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTierId(null)}
                        className="kr-num text-[12.5px] py-2.5 px-4 rounded-full transition active:scale-[0.97]"
                        style={{
                          background: 'rgba(239,244,255,0.06)',
                          color: 'rgba(239,244,255,0.7)',
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

          {/* 구분선 — "또는" */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-cream/10" />
            <span className="kr-num text-[10px] uppercase tracking-[0.22em] text-cream/40">
              또는
            </span>
            <div className="flex-1 h-px bg-cream/10" />
          </div>

          {/* 광고 시청 옵션 — 무료, 일일 한도 */}
          <button
            type="button"
            onClick={() => setAdOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition active:scale-[0.98] mb-3"
            style={{
              background: 'var(--neon-08)',
              color: 'var(--neon)',
              border: '1px solid var(--neon-35)',
            }}
          >
            <Play size={14} fill="currentColor" strokeWidth={0} />
            <span className="kr-num text-[13px] font-semibold">
              광고 보고 +{AD_REWARD} ⚡
            </span>
            <span
              className="kr-num text-[10px] px-1.5 py-0.5 rounded-full ml-1"
              style={{
                background: 'var(--neon-18)',
                color: 'var(--neon)',
              }}
            >
              무료 · 1/일
            </span>
          </button>

          {/* 프리미엄 hero 카드 — gold gradient, 가치 어필 */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/#pricing';
              }
            }}
            className="relative w-full overflow-hidden rounded-2xl px-4 py-3.5 transition active:scale-[0.98] text-left"
            style={{
              background:
                'linear-gradient(135deg, rgba(167,139,250,0.28), rgba(255,176,32,0.18))',
              border: '1.5px solid rgba(167,139,250,0.55)',
              boxShadow:
                '0 10px 28px -8px rgba(167,139,250,0.5)',
            }}
          >
            {/* 배경 sparkle */}
            <div
              aria-hidden
              className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,176,32,0.5), transparent 70%)',
              }}
            />
            <div className="relative flex items-center gap-3">
              <div
                className="shrink-0 w-11 h-11 rounded-full inline-flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(135deg, #FFB020, #FF8a00)',
                  boxShadow:
                    '0 6px 14px -4px rgba(255,176,32,0.6)',
                }}
              >
                <Crown size={22} fill="#fff" strokeWidth={0} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="kr-heading text-[14px] font-bold text-cream">
                    프리미엄
                  </span>
                  <span
                    className="kr-num text-[11px] tabular-nums px-1.5 py-0.5 rounded-md"
                    style={{
                      background: 'rgba(255,176,32,0.22)',
                      color: '#FFB020',
                      border: '1px solid rgba(255,176,32,0.4)',
                    }}
                  >
                    ∞ ⚡
                  </span>
                </div>
                <p className="kr-body text-[11.5px] text-cream/70 leading-tight">
                  광고·XP 신경 X · 무제한 풀이
                </p>
              </div>
              <span
                className="kr-num text-[10px] uppercase tracking-widest shrink-0"
                style={{ color: 'rgba(239,244,255,0.7)' }}
              >
                보기 →
              </span>
            </div>
          </button>

          {/* 광고 한도 안내 — 작게 하단 */}
          <p className="kr-body text-[10.5px] text-cream/40 leading-[1.5] mt-3 text-center">
            광고는 1일 {AD_DAILY_CAP}회까지 가능
          </p>

          {/* 토스트 */}
          {flash ? (
            <div
              role="status"
              className="mt-3 px-3 py-2.5 rounded-xl kr-body text-[12px] flex items-center gap-2"
              style={{
                background:
                  flash.kind === 'ok'
                    ? 'var(--neon-12)'
                    : 'rgba(248,113,113,0.12)',
                border:
                  flash.kind === 'ok'
                    ? '1px solid var(--neon-40)'
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
        </div>
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

/**
 * ZapStack — 구매할 ⚡ 양을 시각적으로 표현.
 *  - 1~3개: 그만큼 ⚡ 아이콘을 겹치게 표시 (Duolingo gem 스타일)
 *  - 4개 이상: 1개 + "×N" 라벨 (스타카토 길어지는 것 방지)
 */
function ZapStack({
  count,
  disabled,
}: {
  count: number;
  disabled: boolean;
}) {
  const color = disabled ? 'rgba(167,139,250,0.4)' : '#A78BFA';
  if (count <= 3) {
    return (
      <span className="inline-flex items-center" aria-hidden>
        {Array.from({ length: count }).map((_, i) => (
          <Zap
            key={i}
            size={20}
            fill={color}
            strokeWidth={0}
            style={{
              marginLeft: i === 0 ? 0 : -8,
              filter: disabled
                ? undefined
                : `drop-shadow(0 2px 6px rgba(167,139,250,${0.4 - i * 0.05}))`,
            }}
          />
        ))}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      <Zap
        size={22}
        fill={color}
        strokeWidth={0}
        style={{
          filter: disabled
            ? undefined
            : 'drop-shadow(0 2px 8px rgba(167,139,250,0.55))',
        }}
      />
      <span
        className="kr-num text-[11px] font-bold tabular-nums"
        style={{ color }}
      >
        ×{count}
      </span>
    </span>
  );
}

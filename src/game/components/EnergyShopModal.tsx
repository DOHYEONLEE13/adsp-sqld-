/**
 * EnergyShopModal — 홈의 에너지샵 메뉴에서 노출되는 충전 상점.
 *
 * 옵션:
 *   1) XP → 에너지 구매 (3 티어)
 *      - 40 XP → +1 ⚡
 *      - 100 XP → +3 ⚡
 *      - 300 XP → +10 ⚡
 * 정책:
 *   - cap (10) 초과 시 구매 거부 ("에너지 가득").
 *   - XP 부족 시 구매 거부 ("XP 부족").
 *   - 게스트는 localStorage, 인증 사용자는 서버 RPC에서 원자적으로 처리.
 *
 * Portal 으로 document.body 마운트 — backdrop-filter stacking context 회피.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  X,
  Zap,
  Check,
  AlertTriangle,
  Crown,
  LoaderCircle,
  ChevronRight,
} from 'lucide-react';
import type { Subject } from '@/types/question';
import { openWebOrAppPremiumEntry } from '@/lib/appMode';
import adspCharacter from '@/assets/energy-shop/adsp-character.png';
import comhwalCharacter from '@/assets/energy-shop/comhwal-character.png';
import sqldCharacter from '@/assets/energy-shop/sqld-character.png';
import {
  useEnergy,
  ENERGY_CAP,
  isUnlimited,
  purchaseEnergyWithXp,
  type PurchaseResult,
} from '../energy';
import type { ExpansionSubjectId } from '../expansionSubjects';
import { getLastLearnContext } from '../learningContext';
import { useProgress } from '../useProgress';
import { computePlayerStats } from '../rpg';
import { applyServerXpBalance, spendXp } from '../storage';

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

export type EnergyShopSubject = Subject | ExpansionSubjectId;

interface CharacterConfig {
  src: string;
  label: string;
  width: string;
  stageHeight: string;
  top: string;
  handEdgeWidth: string;
}

const SHOP_CHARACTERS: Record<EnergyShopSubject, CharacterConfig> = {
  adsp: {
    src: adspCharacter,
    label: 'ADsP',
    width: 'min(62vw, 242px)',
    stageHeight: 'min(40.6vw, 158px)',
    top: '0px',
    handEdgeWidth: '31%',
  },
  sqld: {
    src: sqldCharacter,
    label: 'SQLD',
    width: 'min(50vw, 190px)',
    stageHeight: 'min(41.2vw, 156px)',
    top: '0px',
    handEdgeWidth: '31%',
  },
  comhwal: {
    src: comhwalCharacter,
    label: '컴활',
    width: 'min(51vw, 200px)',
    stageHeight: 'min(39.6vw, 155px)',
    top: '0px',
    handEdgeWidth: '31%',
  },
};

interface Props {
  onClose: () => void;
  subject?: EnergyShopSubject;
}

export default function EnergyShopModal({ onClose, subject }: Props) {
  const energy = useEnergy();
  const progress = useProgress();
  const stats = computePlayerStats(progress);
  const lastLearnContext = getLastLearnContext(progress.activeSubject);
  const resolvedSubject: EnergyShopSubject =
    subject ??
    (lastLearnContext?.kind === 'expansion'
      ? lastLearnContext.subjectId
      : (lastLearnContext?.subject ?? progress.activeSubject ?? 'adsp'));
  const character = SHOP_CHARACTERS[resolvedSubject];
  /** 사용자가 선택한 티어 (확인 step 활성화 — 한 번 더 "구매하기" 눌러야 결제). */
  const [selectedTierId, setSelectedTierId] = useState<PurchaseTier['id'] | null>(null);
  const [buyingTierId, setBuyingTierId] = useState<PurchaseTier['id'] | null>(null);
  /** 직전 구매 결과 — 토스트로 1.6 초 노출. */
  const [flash, setFlash] = useState<{
    kind: 'ok' | 'err';
    text: string;
  } | null>(null);

  // ESC 닫기.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const unlimited = isUnlimited(energy);
  const energyDisplay = unlimited ? '∞' : energy.energy;

  const handleConfirmBuy = async (tier: PurchaseTier) => {
    if (buyingTierId) return;
    if (unlimited) {
      setFlash({ kind: 'err', text: '프리미엄은 이미 ⚡ 무제한이에요.' });
      setSelectedTierId(null);
      return;
    }
    setBuyingTierId(tier.id);
    let result: PurchaseResult;
    try {
      result = await purchaseEnergyWithXp({
        xpCost: tier.xpCost,
        energyAmount: tier.energyAmount,
        currentDisplayedXp: stats.totalXp,
      });
    } finally {
      setBuyingTierId(null);
    }
    if (!result.ok) {
      setFlash({
        kind: 'err',
        text:
          result.reason === 'insufficient-xp'
            ? 'XP 가 부족해요.'
            : result.reason === 'cap-overflow'
              ? `에너지가 가득 차서 살 수 없어요 (cap ${ENERGY_CAP}).`
              : result.reason === 'unauthenticated'
                ? '로그인 상태를 다시 확인해 주세요.'
                : '구매 처리에 실패했어요. 잠시 후 다시 시도해 주세요.',
      });
    } else {
      if (typeof result.remainingXp === 'number') {
        applyServerXpBalance(result.remainingXp);
      } else {
        spendXp(tier.xpCost);
      }
      setFlash({
        kind: 'ok',
        text: `+${tier.energyAmount} ⚡ 충전! 잔여 XP ${result.remainingXp ?? stats.totalXp - tier.xpCost}`,
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
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden px-3 py-3"
      style={{ background: 'rgba(1,8,40,0.76)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <motion.div
        data-testid="energy-shop-stage"
        data-subject={resolvedSubject}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[396px]"
        style={{ paddingTop: character.stageHeight }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 overflow-hidden"
          style={{ width: character.width, height: character.stageHeight }}
        >
          <img
            data-testid="energy-shop-character"
            src={character.src}
            alt=""
            className="absolute left-0 w-full select-none"
            style={{
              top: character.top,
              filter: 'drop-shadow(0 16px 20px rgba(1, 8, 40, 0.34))',
            }}
            draggable={false}
          />
        </div>

        <div
          data-testid="energy-shop-panel"
          className="relative z-10 w-full overflow-y-auto rounded-[26px] p-0"
          style={{
            maxHeight: `calc(100dvh - ${character.stageHeight} - 26px)`,
            background:
              'radial-gradient(85% 58% at 82% 0%, rgba(120,223,251,0.10), transparent 72%), linear-gradient(180deg, rgba(13,28,68,0.97), rgba(5,13,42,0.985))',
            border: '1px solid rgba(149,211,255,0.24)',
            boxShadow:
              '0 28px 72px -26px rgba(28,104,190,0.58), inset 0 1px 0 rgba(255,255,255,0.10)',
            backdropFilter: 'blur(24px) saturate(125%)',
          }}
        >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(120,223,251,0.85), rgba(157,140,255,0.7), transparent)',
          }}
        />
        <div className="px-5 pb-4 pt-5 md:px-6">
          <p className="kr-num mb-1 text-[9px] font-semibold text-cyan-200/55">
            {character.label} ENERGY SHOP
          </p>
          <h3
            id="energy-shop-title"
            className="kr-heading pr-12 text-[20px] font-bold text-cream"
          >
            에너지 상점
          </h3>

          <div
            className="mt-4 flex items-center justify-between border-y px-1 py-4"
            style={{ borderColor: 'rgba(239,244,255,0.08)' }}
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-[14px]"
                style={{
                  background:
                    'linear-gradient(145deg, rgba(120,223,251,0.17), rgba(157,140,255,0.12))',
                  border: '1px solid rgba(120,223,251,0.24)',
                  boxShadow: '0 8px 24px -16px rgba(120,223,251,0.9)',
                }}
              >
                <Zap size={21} fill="#78DFFB" color="#78DFFB" strokeWidth={1.5} />
              </span>
              <div className="flex items-end gap-1">
                <span className="kr-num text-[31px] font-bold leading-none text-cream tabular-nums">
                  {energyDisplay}
                </span>
                {!unlimited ? (
                  <span className="kr-num pb-0.5 text-[13px] text-cream/45">
                    / {ENERGY_CAP}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="text-right">
              <p className="kr-body text-[10px] text-cream/45">보유 XP</p>
              <p className="kr-num mt-0.5 text-[18px] font-semibold text-[#FFD166] tabular-nums">
                {stats.totalXp.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-1 md:px-6 md:pb-6">
          <p className="kr-body mb-2.5 text-[11px] font-medium text-cream/50">충전량</p>
          <div className="mb-4 flex flex-col gap-2">
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
                  className="relative overflow-hidden rounded-[16px] transition"
                  style={{
                    background: disabled
                      ? 'rgba(239,244,255,0.025)'
                      : isSelected
                        ? 'linear-gradient(105deg, rgba(120,223,251,0.12), rgba(157,140,255,0.10))'
                        : 'rgba(239,244,255,0.045)',
                    border: isSelected
                      ? '1px solid rgba(120,223,251,0.62)'
                      : '1px solid rgba(239,244,255,0.095)',
                    opacity: disabled ? 0.42 : 1,
                    boxShadow: isSelected
                      ? '0 12px 32px -24px rgba(120,223,251,0.95), inset 0 1px 0 rgba(255,255,255,0.07)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.035)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (disabled) return;
                      setSelectedTierId(isSelected ? null : t.id);
                    }}
                    disabled={disabled || buyingTierId !== null}
                    aria-pressed={isSelected}
                    className="flex w-full items-center justify-between gap-3 px-3.5 py-3 transition active:scale-[0.99] disabled:cursor-not-allowed"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px]"
                        style={{
                          background: isSelected
                            ? 'rgba(120,223,251,0.16)'
                            : 'rgba(157,140,255,0.10)',
                          border: `1px solid ${isSelected ? 'rgba(120,223,251,0.24)' : 'rgba(157,140,255,0.14)'}`,
                        }}
                      >
                        <Zap
                          size={18}
                          fill={disabled ? 'rgba(120,223,251,0.36)' : '#78DFFB'}
                          color={disabled ? 'rgba(120,223,251,0.36)' : '#78DFFB'}
                          strokeWidth={1.4}
                        />
                      </span>
                      <span
                        className="kr-num text-[19px] font-bold leading-none text-cream tabular-nums"
                        style={{
                          color: disabled ? 'rgba(239,244,255,0.5)' : '#EFF4FF',
                        }}
                      >
                        +{t.energyAmount}
                      </span>
                      {t.highlight ? (
                        <span
                          className="kr-body rounded-full px-2 py-0.5 text-[9px] font-bold"
                          style={{
                            color: '#BEEFFF',
                            background: 'rgba(120,223,251,0.09)',
                            border: '1px solid rgba(120,223,251,0.18)',
                          }}
                        >
                          추천
                        </span>
                      ) : null}
                    </span>

                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className="inline-flex items-baseline gap-1">
                        <span
                          className="kr-num text-[15px] font-semibold leading-none text-[#FFD166] tabular-nums"
                        >
                          {t.xpCost}
                        </span>
                        <span
                          className="kr-num text-[9px] uppercase leading-none text-[#FFD166]/65"
                        >
                          XP
                        </span>
                      </span>
                      {reasonShort ? (
                        <span
                          className="kr-body text-[9px] leading-none text-rose-300/80"
                        >
                          {reasonShort}
                        </span>
                      ) : null}
                    </span>
                  </button>

                  {isSelected && !disabled ? (
                    <div
                      className="mx-3 flex gap-2 border-t pb-3 pt-2.5"
                      style={{ borderColor: 'rgba(239,244,255,0.08)' }}
                    >
                      <button
                        type="button"
                        onClick={() => void handleConfirmBuy(t)}
                        disabled={buyingTierId !== null}
                        className="kr-body inline-flex flex-1 items-center justify-center gap-1.5 rounded-[12px] py-2.5 text-[12px] font-bold transition active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(120,223,251,0.96), rgba(100,169,255,0.96))',
                          color: '#03142F',
                          boxShadow:
                            '0 8px 18px -12px rgba(120,223,251,0.95), inset 0 1px 0 rgba(255,255,255,0.36)',
                        }}
                      >
                        {buyingTierId === t.id ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} strokeWidth={2.8} />
                        )}
                        {buyingTierId === t.id ? '처리 중' : '구매하기'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTierId(null)}
                        disabled={buyingTierId !== null}
                        className="kr-body rounded-[12px] px-4 py-2.5 text-[12px] transition active:scale-[0.98] disabled:cursor-wait disabled:opacity-50"
                        style={{
                          background: 'rgba(239,244,255,0.055)',
                          border: '1px solid rgba(239,244,255,0.08)',
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

          <div className="mb-3 h-px bg-cream/[0.08]" />
          <button
            type="button"
            onClick={() => {
              openWebOrAppPremiumEntry();
            }}
            className="relative w-full overflow-hidden rounded-[16px] px-3.5 py-3.5 text-left transition hover:bg-white/[0.06] active:scale-[0.99]"
            style={{
              background:
                'linear-gradient(105deg, rgba(157,140,255,0.11), rgba(120,223,251,0.055))',
              border: '1px solid rgba(157,140,255,0.22)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.045)',
            }}
          >
            <div className="relative flex items-center gap-3">
              <div
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]"
                style={{
                  background:
                    'linear-gradient(145deg, rgba(157,140,255,0.22), rgba(120,223,251,0.12))',
                  border: '1px solid rgba(157,140,255,0.25)',
                  boxShadow:
                    '0 8px 20px -16px rgba(157,140,255,0.9)',
                }}
              >
                <Crown size={19} color="#B9ACFF" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="kr-heading text-[13px] font-bold text-cream">
                  MAX 멤버십
                </p>
                <p className="kr-body mt-0.5 text-[10.5px] leading-tight text-cream/50">
                  에너지와 대기시간 없이 무제한 학습
                </p>
              </div>
              <span className="kr-num mr-0.5 text-[15px] font-semibold text-[#B9ACFF]">∞</span>
              <ChevronRight size={17} className="shrink-0 text-cream/40" strokeWidth={2} />
            </div>
          </button>

          {/* 토스트 */}
          {flash ? (
            <div
              role="status"
              className="kr-body mt-3 flex items-center gap-2 rounded-[12px] px-3 py-2.5 text-[11.5px]"
              style={{
                background:
                  flash.kind === 'ok'
                    ? 'rgba(120,223,251,0.09)'
                    : 'rgba(248,113,113,0.12)',
                border:
                  flash.kind === 'ok'
                    ? '1px solid rgba(120,223,251,0.24)'
                    : '1px solid rgba(248,113,113,0.4)',
                color: flash.kind === 'ok' ? '#BEEFFF' : '#fca5a5',
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
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2"
          style={{
            width: character.width,
            height: `calc(${character.stageHeight} + 32px)`,
          }}
        >
          <div
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: character.handEdgeWidth }}
          >
            <img
              src={character.src}
              alt=""
              className="absolute left-0 w-auto max-w-none select-none"
              style={{ top: character.top, width: character.width }}
              draggable={false}
            />
          </div>
          <div
            className="absolute inset-y-0 right-0 overflow-hidden"
            style={{ width: character.handEdgeWidth }}
          >
            <img
              src={character.src}
              alt=""
              className="absolute right-0 w-auto max-w-none select-none"
              style={{ top: character.top, width: character.width }}
              draggable={false}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="에너지 상점 닫기"
          className="absolute right-4 z-30 inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10 active:scale-95"
          style={{
            top: `calc(${character.stageHeight} + 16px)`,
            background: 'rgba(239,244,255,0.075)',
            border: '1px solid rgba(239,244,255,0.14)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <X size={17} className="text-cream/80" strokeWidth={2.2} />
        </button>
      </motion.div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(node, document.body);
}

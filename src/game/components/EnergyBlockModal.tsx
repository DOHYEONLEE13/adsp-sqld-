/**
 * EnergyBlockModal — ⚡ 0 일 때 차단 모달.
 *
 * - 우는 마스코트 (subject 별 토리/셀리)
 * - 충전까지 남은 시간 표시 (1분 단위 round-up)
 * - "프리미엄 전환" 결제 유도 CTA
 * - "확인" 으로 닫기
 */

import {
  ChevronRight,
  Clock3,
  Crown,
  ShoppingBag,
  Zap,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { openEnergyShop, openWebOrAppPremiumEntry } from '@/lib/appMode';
import Ques from '@/components/mascot/Ques';
import {
  characterForSubject,
  DEFAULT_CHARACTER,
  type MascotCharacter,
} from '@/components/mascot/types';
import type { Subject } from '@/types/question';
import { formatRetryAfter } from '../energy';

interface Props {
  retryAfterSec: number;
  /** subject 가 있으면 해당 마스코트 (adsp→토리, sqld→셀리), 없으면 기본 토리. */
  subject?: Subject;
  onClose: () => void;
  /** 프리미엄 알아보기 — 미지정 시 #pricing 으로 hash 점프. */
  onUpgrade?: () => void;
}

export default function EnergyBlockModal({
  retryAfterSec,
  subject,
  onClose,
  onUpgrade,
}: Props) {
  const character: MascotCharacter = subject
    ? characterForSubject(subject)
    : DEFAULT_CHARACTER;
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
      return;
    }
    // 기본 동작 — 메인의 #pricing 섹션으로 점프
    openWebOrAppPremiumEntry();
  };
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="energy-block-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(1,8,40,0.82)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[372px] overflow-hidden rounded-[26px]"
        style={{
          background:
            'linear-gradient(155deg, rgba(17,34,58,0.98) 0%, rgba(10,23,45,0.98) 58%, rgba(13,22,48,0.98) 100%)',
          border: '1px solid rgba(125,211,252,0.26)',
          boxShadow:
            '0 30px 90px rgba(0,0,0,0.58), 0 0 36px rgba(56,189,248,0.10), inset 0 1px 0 rgba(255,255,255,0.10)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          aria-hidden
          className="absolute inset-x-12 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(103,232,249,0.9), transparent)',
            boxShadow: '0 0 18px rgba(103,232,249,0.7)',
          }}
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-3.5 top-3.5 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10 active:scale-95"
          style={{
            color: 'rgba(239,244,255,0.68)',
            border: '1px solid rgba(239,244,255,0.10)',
            background: 'rgba(239,244,255,0.05)',
          }}
        >
          <X size={16} strokeWidth={2.2} />
        </button>

        <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
          <div className="flex items-center gap-3 pr-4">
            <div className="relative flex h-[104px] w-[92px] shrink-0 items-center justify-center">
              <div
                aria-hidden
                className="absolute bottom-1 h-3 w-16 rounded-full blur-md"
                style={{ background: 'rgba(103,232,249,0.22)' }}
              />
              <Ques
                character={character}
                pose="sad"
                className="relative h-[112px] w-[112px] max-w-none"
              />
            </div>

            <div className="min-w-0 text-left">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Zap size={13} fill="#C4B5FD" color="#C4B5FD" strokeWidth={1.8} />
                <span className="kr-num text-[10px] uppercase text-[#C4B5FD]">
                  Energy empty
                </span>
              </div>
              <h3
                id="energy-block-title"
                className="kr-heading break-keep text-[19px] leading-[1.32] text-cream"
              >
                에너지가 모두 떨어졌어요
              </h3>
              <p className="kr-body mt-1.5 text-[12px] leading-[1.5] text-cream/58">
                충전하거나 잠시 기다리면 새 개념을 이어갈 수 있어요.
              </p>
            </div>
          </div>

          <div
            className="mt-4 flex items-center justify-between rounded-[18px] px-4 py-3"
            style={{
              background: 'rgba(239,244,255,0.055)',
              border: '1px solid rgba(239,244,255,0.09)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  color: '#C4B5FD',
                  background: 'rgba(167,139,250,0.13)',
                  border: '1px solid rgba(167,139,250,0.24)',
                }}
              >
                <Zap size={17} fill="currentColor" strokeWidth={0} />
              </span>
              <div>
                <p className="kr-num text-[10px] uppercase text-cream/45">현재 에너지</p>
                <p className="kr-num mt-0.5 text-[18px] font-bold leading-none text-cream">
                  0<span className="ml-1 text-[12px] font-medium text-cream/38">/ 10</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="kr-num inline-flex items-center justify-end gap-1 text-[10px] text-cream/45">
                <Clock3 size={11} strokeWidth={2} /> 다음 충전
              </p>
              <p className="kr-num mt-1 text-[13px] font-bold text-[#67E8F9]">
                약 {formatRetryAfter(retryAfterSec)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                openEnergyShop();
                onClose();
              }}
              className="group relative inline-flex h-[54px] w-full items-center justify-between overflow-hidden rounded-[17px] px-3.5 transition hover:brightness-110 active:scale-[0.985]"
              style={{
                background:
                  'linear-gradient(135deg, rgba(34,211,238,0.16) 0%, rgba(14,116,144,0.13) 48%, rgba(30,64,175,0.14) 100%)',
                border: '1px solid rgba(103,232,249,0.42)',
                boxShadow:
                  '0 7px 18px rgba(34,211,238,0.08), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(34,211,238,0.08)',
              }}
            >
              <span
                aria-hidden
                className="absolute inset-x-8 top-0 h-px"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(165,243,252,0.72), transparent)',
                }}
              />
              <span className="inline-flex items-center gap-3">
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] text-[#A5F3FC]"
                  style={{
                    background: 'rgba(103,232,249,0.12)',
                    border: '1px solid rgba(103,232,249,0.20)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)',
                  }}
                >
                  <ShoppingBag size={16} strokeWidth={2.15} />
                </span>
                <span className="kr-heading text-[13px] text-cream">에너지 상점</span>
              </span>
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#A5F3FC] transition-transform group-hover:translate-x-0.5"
                style={{
                  background: 'rgba(103,232,249,0.10)',
                  border: '1px solid rgba(103,232,249,0.18)',
                }}
              >
                <ChevronRight size={15} strokeWidth={2.3} />
              </span>
            </button>

            {/* 프리미엄 — secondary (장기 가치) */}
            <button
              type="button"
              onClick={handleUpgrade}
              className="kr-num inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] text-[12px] font-bold transition hover:bg-white/[0.04] active:scale-[0.985]"
              style={{
                background: 'rgba(167,139,250,0.08)',
                border: '1px solid rgba(167,139,250,0.22)',
                color: '#C4B5FD',
              }}
            >
              <Crown size={14} strokeWidth={2.2} />
              프리미엄으로 무제한 학습
            </button>
            <button
              type="button"
              onClick={onClose}
              className="kr-num h-8 w-full text-[11px] text-cream/45 transition hover:text-cream/72 active:scale-[0.985]"
            >
              나중에
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

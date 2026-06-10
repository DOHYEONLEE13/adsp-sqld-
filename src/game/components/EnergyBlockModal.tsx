/**
 * EnergyBlockModal — ⚡ 0 일 때 차단 모달.
 *
 * - 우는 마스코트 (subject 별 토리/셀리)
 * - 충전까지 남은 시간 표시 (1분 단위 round-up)
 * - "프리미엄 전환" 결제 유도 CTA
 * - "확인" 으로 닫기
 */

import { Zap, X, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { openWebOrAppPremiumEntry } from '@/lib/appMode';
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
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ background: 'rgba(1,8,40,0.78)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="liquid-glass rounded-[24px] w-full max-w-[360px] p-6 pt-7 relative"
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
          className="absolute top-3 right-3 w-8 h-8 inline-flex items-center justify-center transition opacity-60 hover:opacity-100"
        >
          <X size={16} className="text-cream" strokeWidth={2.4} />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* 우는 마스코트 — subject 별 토리/셀리, 'sad' 포즈 */}
          <Ques
            character={character}
            pose="sad"
            className="w-28 h-28 md:w-32 md:h-32 mb-2"
          />

          <span
            className="inline-flex items-center justify-center w-11 h-11 rounded-full mb-3"
            style={{
              background: 'rgba(167,139,250,0.16)',
              border: '1px solid rgba(167,139,250,0.5)',
            }}
          >
            <Zap size={22} fill="#A78BFA" strokeWidth={0} />
          </span>

          <h3 id="energy-block-title" className="kr-heading text-[20px] mb-1.5">
            에너지가 모두 떨어졌어요
          </h3>
          <p className="kr-body text-[13.5px] text-cream/80 leading-[1.55] mb-1">
            다음 충전까지 약{' '}
            <span className="kr-num text-[#A78BFA]">
              {formatRetryAfter(retryAfterSec)}
            </span>
            .
          </p>
          <p className="kr-body text-[12.5px] text-cream/60 leading-[1.55]">
            잠시 기다리거나 프리미엄으로 에너지 제한 없이 이어갈 수 있어요.
          </p>

          <div className="w-full mt-5 flex flex-col gap-2">
            {/* 프리미엄 — secondary (장기 가치) */}
            <button
              type="button"
              onClick={handleUpgrade}
              className="w-full kr-num text-[12.5px] py-2.5 rounded-full inline-flex items-center justify-center gap-2 transition active:scale-[0.98]"
              style={{
                background: 'rgba(167,139,250,0.18)',
                border: '1px solid rgba(167,139,250,0.5)',
                color: '#A78BFA',
              }}
            >
              <Crown size={13} strokeWidth={2.4} />
              프리미엄 알아보기
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full kr-num text-[12px] py-2 rounded-full transition active:scale-[0.98]"
              style={{
                background: 'rgba(239,244,255,0.06)',
                border: '1px solid rgba(239,244,255,0.12)',
                color: 'rgba(239,244,255,0.75)',
              }}
            >
              나중에
            </button>
          </div>
        </div>
      </motion.div>

    </div>
  );
}

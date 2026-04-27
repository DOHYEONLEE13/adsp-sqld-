/**
 * EnergyBlockModal — ⚡ 0 일 때 차단 모달.
 *
 * - 충전까지 남은 시간 표시 (1분 단위 round-up)
 * - "프리미엄 전환" 안내 (실 결제는 추후 phase)
 * - "확인" 으로 닫기
 */

import { Zap, X, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatRetryAfter } from '../energy';

interface Props {
  retryAfterSec: number;
  onClose: () => void;
  onUpgrade?: () => void;
}

export default function EnergyBlockModal({
  retryAfterSec,
  onClose,
  onUpgrade,
}: Props) {
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
        className="liquid-glass rounded-[24px] w-full max-w-[360px] p-6 relative"
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
          <span
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3"
            style={{
              background: 'rgba(167,139,250,0.16)',
              border: '1px solid rgba(167,139,250,0.5)',
            }}
          >
            <Zap size={28} fill="#A78BFA" strokeWidth={0} />
          </span>

          <h3 id="energy-block-title" className="kr-heading text-[20px] mb-1">
            에너지 0
          </h3>
          <p className="kr-body text-[13px] text-cream/75 leading-[1.55]">
            다음 충전까지 약 <span className="kr-num text-[#A78BFA]">{formatRetryAfter(retryAfterSec)}</span>.
            기다리거나 프리미엄으로 무제한 풀이를.
          </p>

          <div className="w-full mt-5 flex flex-col gap-2">
            {onUpgrade ? (
              <button
                type="button"
                onClick={onUpgrade}
                className="w-full kr-num text-[13px] font-medium py-3 rounded-full inline-flex items-center justify-center gap-2 transition active:scale-[0.98]"
                style={{
                  background: '#A78BFA',
                  color: '#1a0e3d',
                }}
              >
                <Crown size={14} strokeWidth={2.4} />
                프리미엄 알아보기
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="w-full kr-num text-[12px] py-2.5 rounded-full transition active:scale-[0.98]"
              style={{
                background: 'rgba(239,244,255,0.08)',
                border: '1px solid rgba(239,244,255,0.14)',
                color: 'var(--cream)',
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

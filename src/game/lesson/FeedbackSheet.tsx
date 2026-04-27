/**
 * FeedbackSheet — 답안 채점 직후 하단에서 슬라이드업되는 피드백 + 계속 버튼.
 *
 * 듀오링고와 동일 패턴: 초록(정답) / 빨간(오답) 배경, 해설 텍스트, 우측 CTA.
 * 오답 시 "정답은 <텍스트>" 를 보조 라인으로 표시.
 */

import { CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  correct: boolean;
  /** 문항의 해설. 없으면 간단한 메시지로 대체. */
  explanation?: string;
  /** 오답일 때 보여줄 정답 텍스트. */
  correctAnswerText?: string;
  ctaLabel: string;
  onContinue: () => void;
  /** Secondary 액션 — primary 옆에 ghost 버튼으로 노출. 없으면 미렌더. */
  secondaryCtaLabel?: string;
  onSecondary?: () => void;
}

export default function FeedbackSheet({
  correct,
  explanation,
  correctAnswerText,
  ctaLabel,
  onContinue,
  secondaryCtaLabel,
  onSecondary,
}: Props) {
  const accent = correct ? '#6FFF00' : '#f87171';
  const tintBg = correct
    ? 'rgba(111,255,0,0.12)'
    : 'rgba(248,113,113,0.12)';

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: tintBg,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderTop: `2px solid ${accent}`,
      }}
    >
      <div className="mx-auto max-w-[820px] px-5 py-5 md:px-8 md:py-6 flex items-center gap-4 md:gap-6">
        <div
          className="shrink-0 inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full"
          style={{ background: accent, color: '#010828' }}
        >
          {correct ? (
            <CheckCircle2 size={22} strokeWidth={2.6} />
          ) : (
            <XCircle size={22} strokeWidth={2.6} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div
            className="kr-heading uppercase tracking-widest text-[12px] md:text-[13px]"
            style={{ color: accent }}
          >
            {correct ? '정답!' : '다시 확인해볼까?'}
          </div>
          {explanation ? (
            <p className="kr-body text-[12.5px] md:text-[13.5px] text-cream/85 leading-[1.55] mt-1 line-clamp-3">
              {explanation}
            </p>
          ) : null}
          {!correct && correctAnswerText ? (
            <p className="kr-body text-[12px] md:text-[13px] text-cream/60 mt-1">
              정답은 <span style={{ color: '#6FFF00' }}>{correctAnswerText}</span>
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {secondaryCtaLabel && onSecondary ? (
            <button
              type="button"
              onClick={onSecondary}
              className="kr-heading uppercase tracking-widest text-[11px] md:text-[12px] px-3.5 py-2.5 md:px-4 md:py-3 rounded-full transition liquid-glass hover:bg-white/10 whitespace-nowrap"
            >
              {secondaryCtaLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onContinue}
            className="kr-heading uppercase tracking-widest text-[13px] md:text-[14px] px-5 py-3 md:px-7 md:py-3.5 rounded-full whitespace-nowrap"
            style={{
              background: accent,
              color: '#010828',
              boxShadow: `0 6px 18px -6px ${accent}`,
            }}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ExternalLink, MessageSquareText, Sparkles, Star, X } from 'lucide-react';
import Ques from '@/components/mascot/Ques';
import { characterForSubject } from '@/components/mascot/types';
import type { Subject } from '@/types/question';

interface Props {
  subject: Subject;
  totalAttempts: number;
  onReview: () => void;
  onClose: () => void;
}
export default function PlayReviewPromptModal({
  subject,
  totalAttempts,
  onReview,
  onClose,
}: Props) {
  const node = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="play-review-title"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{
        background: 'rgba(1,8,40,0.84)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[372px] overflow-hidden rounded-[28px] px-5 pb-5 pt-6 text-center"
        style={{
          background:
            'radial-gradient(100% 68% at 50% 0%, rgba(103,232,249,0.16), transparent 70%), linear-gradient(155deg, rgba(17,34,58,0.99), rgba(9,22,45,0.99))',
          border: '1px solid rgba(103,232,249,0.30)',
          boxShadow:
            '0 30px 90px rgba(0,0,0,0.58), 0 0 34px rgba(56,189,248,0.09), inset 0 1px 0 rgba(255,255,255,0.10)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          aria-hidden
          className="absolute inset-x-14 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(165,243,252,0.92), transparent)',
          }}
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-3.5 top-3.5 inline-flex h-9 w-9 items-center justify-center rounded-full text-cream/60 transition hover:bg-white/10 hover:text-cream active:scale-95"
          style={{
            border: '1px solid rgba(239,244,255,0.10)',
            background: 'rgba(239,244,255,0.05)',
          }}
        >
          <X size={16} strokeWidth={2.2} />
        </button>

        <div className="relative mx-auto h-[118px] w-[132px]">
          <motion.span
            aria-hidden
            className="absolute left-1 top-7 text-[#FACC15]"
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1.08, 0.85] }}
            transition={{ duration: 2.1, repeat: Infinity }}
          >
            <Star size={17} fill="currentColor" strokeWidth={0} />
          </motion.span>
          <motion.span
            aria-hidden
            className="absolute right-0 top-3 text-[#A5F3FC]"
            animate={{ opacity: [1, 0.35, 1], rotate: [0, 12, 0] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            <Sparkles size={18} strokeWidth={1.8} />
          </motion.span>
          <div
            aria-hidden
            className="absolute bottom-2 left-1/2 h-4 w-24 -translate-x-1/2 rounded-full blur-xl"
            style={{ background: 'rgba(103,232,249,0.20)' }}
          />
          <Ques
            character={characterForSubject(subject)}
            pose="happy"
            className="relative mx-auto h-[120px] w-[120px]"
          />
        </div>

        <div className="mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{
            background: 'rgba(103,232,249,0.08)',
            border: '1px solid rgba(103,232,249,0.16)',
          }}
        >
          <MessageSquareText size={12} color="#A5F3FC" strokeWidth={2.2} />
          <span className="kr-num text-[10px] font-bold uppercase text-[#A5F3FC]">
            {totalAttempts}문제 학습 완료
          </span>
        </div>

        <h2
          id="play-review-title"
          className="kr-heading mt-3 break-keep text-[22px] leading-[1.35] text-cream"
        >
          함께 공부한 경험을<br />들려주세요
        </h2>
        <p className="kr-body mx-auto mt-2 max-w-[290px] break-keep text-[12px] leading-[1.65] text-cream/60">
          좋았던 점과 아쉬웠던 점을 솔직하게 남겨주시면 다음 업데이트에 큰 도움이 돼요.
        </p>

        <button
          type="button"
          onClick={onReview}
          className="kr-heading mt-5 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[17px] text-[13px] text-[#061526] transition hover:brightness-110 active:scale-[0.985]"
          style={{
            background:
              'linear-gradient(135deg, #A5F3FC 0%, #67E8F9 55%, #38BDF8 100%)',
            border: '1px solid rgba(207,250,254,0.92)',
            boxShadow:
              '0 9px 22px rgba(34,211,238,0.14), inset 0 1px 0 rgba(255,255,255,0.55)',
          }}
        >
          Google Play에서 리뷰 남기기
          <ExternalLink size={15} strokeWidth={2.3} />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="kr-num mt-2 h-9 w-full text-[11px] text-cream/44 transition hover:text-cream/72"
        >
          다음에 할게요
        </button>
      </motion.div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(node, document.body);
}

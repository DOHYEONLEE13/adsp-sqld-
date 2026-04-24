/**
 * SpeechBubble — Ques 마스코트 우측(또는 상단)에 붙는 말풍선.
 * [키워드] 하이라이트를 적용한 본문 + 왼쪽을 향한 삼각형 꼬리.
 */

import { motion } from 'framer-motion';
import { renderHighlighted } from './highlight';

interface Props {
  text: string;
  /** 위치 — 'right': Ques 오른쪽 (데스크탑/태블릿), 'top': Ques 위 (모바일 세로). */
  placement?: 'right' | 'top';
}

export default function SpeechBubble({ text, placement = 'right' }: Props) {
  const isTop = placement === 'top';
  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, y: isTop ? 6 : 0, x: isTop ? 0 : 8 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="relative"
    >
      <div
        className="liquid-glass rounded-[22px] px-5 py-4 md:px-6 md:py-5 kr-body text-[15px] md:text-[17px] leading-[1.7] text-cream"
        style={{
          background: 'rgba(255,255,255,0.04)',
          boxShadow: '0 8px 24px -12px rgba(0,0,0,0.6)',
        }}
      >
        {renderHighlighted(text)}
      </div>

      {/* 꼬리 — 말풍선 쪽에서 Ques 를 가리킴 */}
      <span
        aria-hidden
        className="absolute"
        style={
          isTop
            ? {
                left: '50%',
                bottom: -8,
                transform: 'translateX(-50%) rotate(45deg)',
                width: 14,
                height: 14,
                background: 'rgba(255,255,255,0.04)',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }
            : {
                left: -7,
                top: 28,
                transform: 'rotate(45deg)',
                width: 14,
                height: 14,
                background: 'rgba(255,255,255,0.04)',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }
        }
      />
    </motion.div>
  );
}

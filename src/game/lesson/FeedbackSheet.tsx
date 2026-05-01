/**
 * FeedbackSheet — 답안 채점 직후 하단에서 슬라이드업되는 피드백 + 계속 버튼.
 *
 * 듀오링고와 동일 패턴: 초록(정답) / 빨간(오답) 배경, 헤딩 + 정답 reveal + CTA.
 *
 * 모바일 간결화: 헤딩 한 줄(끊김 없이) + 정답 reveal + 강조된 '정답 상세 보기'
 * 토글만 노출. 해설 풀텍스트는 토글을 눌렀을 때만 expansion 영역에서 보여줌.
 */

import { CheckCircle2, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

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

  // 정답 상세 보기 — 기본은 접힘. 메인은 헤딩 + 정답만, 풀 해설은 토글 후 expansion.
  const [expanded, setExpanded] = useState(false);
  const hasExplanation = !!explanation && explanation.trim().length > 0;

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
      <div className="mx-auto max-w-[820px] px-5 py-4 md:px-8 md:py-6 flex flex-col gap-3">
        {/*
          메인 줄 — 모바일은 세로 stack (헤딩→버튼 순서),
          md+ 는 한 줄 가로 배치. 모바일에서 CTA 가 옆에 끼면 텍스트 영역이
          너무 좁아져 정답 reveal/토글이 줄바꿈되던 문제 해결.
        */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
          <div className="flex items-start gap-3 flex-1 min-w-0">
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
                className="kr-heading uppercase tracking-widest text-[12px] md:text-[13px] whitespace-nowrap"
                style={{ color: accent }}
              >
                {correct ? '정답!' : '다시 확인해볼까?'}
              </div>
              {!correct && correctAnswerText ? (
                <p className="kr-body text-[12.5px] md:text-[13px] text-cream/75 mt-1 leading-[1.5]">
                  정답:{' '}
                  <span style={{ color: '#6FFF00', fontWeight: 600 }}>
                    {correctAnswerText}
                  </span>
                </p>
              ) : null}

              {/* 정답 상세 보기 토글 — 강조 버튼.
                  기본 헤딩만 보이고 풀 해설은 이 버튼을 눌러야 expansion 으로 노출.
                  사용자가 "여기를 누르면 자세한 답이 나온다" 를 인지하도록 배경 +
                  테두리 + chevron 으로 actionable 하게. */}
              {hasExplanation ? (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  aria-expanded={expanded}
                  className="kr-heading uppercase tracking-widest inline-flex items-center gap-1.5 text-[11px] md:text-[12px] mt-2.5 px-3.5 py-2 rounded-full transition active:scale-95 hover:brightness-110 whitespace-nowrap"
                  style={{
                    background: `${accent}24`,
                    border: `1.5px solid ${accent}`,
                    color: accent,
                    boxShadow: `0 4px 14px -6px ${accent}`,
                  }}
                >
                  {expanded ? (
                    <>
                      <ChevronUp size={14} strokeWidth={2.8} />
                      <span>접기</span>
                    </>
                  ) : (
                    <>
                      <span>정답 상세 보기</span>
                      <ChevronDown size={14} strokeWidth={2.8} />
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 justify-end">
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

        {/*
          확장 영역 — 해설 풀텍스트 + 정답 강조.
          위 메인 라인의 line-clamp 가 풀려도 섹션 시각이 약하므로 따로
          박스 형태로 깔끔하게 노출. 모바일에서 가독성 ↑.
        */}
        <AnimatePresence initial={false}>
          {expanded && explanation ? (
            <motion.div
              key="expansion"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div
                className="rounded-[14px] p-4 md:p-5 mt-1"
                style={{
                  background: 'rgba(1,8,40,0.55)',
                  border: '1px solid rgba(239,244,255,0.08)',
                }}
              >
                <div
                  className="kr-num text-[10px] uppercase tracking-[0.18em] mb-2"
                  style={{ color: accent, opacity: 0.85 }}
                >
                  해설 상세
                </div>
                <p className="kr-body text-[13px] md:text-[14px] text-cream/95 leading-[1.7] whitespace-pre-line">
                  {explanation}
                </p>
                {!correct && correctAnswerText ? (
                  <p
                    className="kr-body text-[12.5px] md:text-[13px] mt-3 pt-3"
                    style={{
                      color: 'rgba(239,244,255,0.7)',
                      borderTop: '1px solid rgba(239,244,255,0.08)',
                    }}
                  >
                    <span className="kr-num text-[10px] uppercase tracking-[0.18em] mr-2" style={{ color: '#6FFF00' }}>
                      정답
                    </span>
                    <span style={{ color: '#9CFF3D', fontWeight: 600 }}>
                      {correctAnswerText}
                    </span>
                  </p>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

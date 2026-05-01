/**
 * FeedbackSheet — 답안 채점 직후 하단에서 슬라이드업되는 피드백 + 계속 버튼.
 *
 * 듀오링고와 동일 패턴: 초록(정답) / 빨간(오답) 배경, 해설 텍스트, 우측 CTA.
 * 오답 시 "정답은 <텍스트>" 를 보조 라인으로 표시.
 *
 * 모바일에선 해설이 좁은 폭 + line-clamp-3 으로 잘려 핵심을 못 보던 문제 →
 * '정답 상세 보기' 토글로 expansion 모드 추가. expansion 시 풀 텍스트 + 해설
 * 마크다운식 강조 영역까지 노출.
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

  // 정답 상세 보기 — 오답일 때 더 가치 있음 (해설 풀텍스트 노출)
  const [expanded, setExpanded] = useState(false);
  // 해설이 line-clamp-3 보다 짧으면 토글 의미 없음 — 대략 90 chars 이하
  const hasLongExplanation = (explanation?.length ?? 0) > 90;

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
      <div className="mx-auto max-w-[820px] px-5 py-5 md:px-8 md:py-6 flex flex-col gap-3">
        {/* 메인 줄 — 아이콘 + 헤딩 + 요약 + CTA */}
        <div className="flex items-start gap-3 md:items-center md:gap-6">
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
              <p
                className={
                  'kr-body text-[12.5px] md:text-[13.5px] text-cream/85 leading-[1.55] mt-1 ' +
                  (expanded ? '' : 'line-clamp-2 md:line-clamp-3')
                }
              >
                {explanation}
              </p>
            ) : null}
            {!correct && correctAnswerText ? (
              <p className="kr-body text-[12px] md:text-[13px] text-cream/60 mt-1">
                정답은{' '}
                <span style={{ color: '#6FFF00' }}>{correctAnswerText}</span>
              </p>
            ) : null}

            {/* 정답 상세 보기 토글 — 모바일에서 해설 잘림 해결 */}
            {hasLongExplanation ? (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="kr-num inline-flex items-center gap-1 text-[11px] mt-2 transition active:scale-95"
                style={{ color: accent, opacity: 0.85 }}
              >
                {expanded ? (
                  <>
                    <ChevronUp size={12} strokeWidth={2.6} />
                    <span>접기</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} strokeWidth={2.6} />
                    <span>정답 상세 보기</span>
                  </>
                )}
              </button>
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

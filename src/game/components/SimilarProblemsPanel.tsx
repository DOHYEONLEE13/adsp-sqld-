/**
 * SimilarProblemsPanel — 학습 화면의 FeedbackSheet 위에 슬라이드업되는
 * 모달시트. 같은 토픽의 다른 문제를 N개 (default 5) 순차 풀이.
 *
 * 흐름:
 *   1. mount 시 findSimilarQuestions 호출로 풀 구성
 *   2. 각 문제: phase='question' → 선택 → recordSingleAnswer → phase='feedback'
 *   3. "다음 비슷한 문제" 클릭 → 다음 문제로 / 마지막이면 "학습으로 돌아가기"
 *   4. ×, backdrop, ESC 모두 onClose
 *
 * 풀 0건이면 마운트 안 됨 (호출 측에서 가드 — FeedbackSheet 의 버튼 자체 숨김).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, RefreshCcw, X } from 'lucide-react';
import { findSimilarQuestions } from '../similarQuestions';
import { recordSingleAnswer } from '../storage';
import { explanationToText } from '@/types/question';
import OptionsPanel from '../lesson/OptionsPanel';
import { toggleBookmark } from '../bookmarks';
import { useBookmarks } from '../useBookmarks';

interface Props {
  currentQuizId: string;
  accent: string;
  onClose: () => void;
}

type Phase = 'question' | 'feedback';

const POOL_SIZE = 5;

export default function SimilarProblemsPanel({
  currentQuizId,
  accent,
  onClose,
}: Props) {
  const pool = useMemo(
    () => findSimilarQuestions(currentQuizId, POOL_SIZE),
    [currentQuizId],
  );
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('question');
  const [chosen, setChosen] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const bookmarks = useBookmarks();

  // ESC 로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // body scroll lock 동안 패널만 스크롤
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // 새 문제로 넘어갈 때 state 리셋
  useEffect(() => {
    setPhase('question');
    setChosen(null);
    setCorrect(null);
    startedAtRef.current = Date.now();
  }, [idx]);

  const total = pool.length;
  const current = pool[idx];

  // 풀 0건인데 마운트된 경우 (방어적) — 즉시 닫기
  useEffect(() => {
    if (total === 0) onClose();
  }, [total, onClose]);

  if (total === 0 || !current) return null;

  const handleChoose = (chosenIdx: number) => {
    if (phase !== 'question') return;
    const ok = chosenIdx === current.answerIndex;
    const timeMs = Date.now() - startedAtRef.current;
    setChosen(chosenIdx);
    setCorrect(ok);
    recordSingleAnswer(current.id, ok, timeMs);
    setPhase('feedback');
  };

  const isLast = idx === total - 1;
  const isBookmarked = bookmarks.ids.has(current.id);
  const handleNext = () => {
    if (isLast) {
      onClose();
      return;
    }
    setIdx(idx + 1);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="비슷한 문제 더 풀기"
    >
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute inset-0 bg-base/70 backdrop-blur-sm"
      />

      {/* Sheet */}
      <div
        className="relative w-full max-w-[820px] max-h-[88vh] rounded-t-[24px] flex flex-col overflow-hidden"
        style={{
          background: 'rgba(1,8,40,0.97)',
          border: `1px solid ${accent}33`,
          borderBottom: 'none',
          boxShadow: '0 -20px 60px -10px rgba(0,0,0,0.7)',
          animation: 'similarSlideUp 280ms cubic-bezier(0.18,0.9,0.4,1)',
        }}
      >
        {/* drag handle 시각 */}
        <div
          aria-hidden
          className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full"
          style={{ background: 'rgba(239,244,255,0.25)' }}
        />

        {/* 헤더 */}
        <header className="flex items-center justify-between gap-3 px-5 md:px-7 pt-6 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="kr-heading uppercase text-[10px] tracking-widest"
              style={{ color: accent }}
            >
              비슷한 문제
            </span>
            <span
              className="kr-num tabular-nums text-[12px]"
              style={{ color: 'rgba(239,244,255,0.7)' }}
            >
              {idx + 1} / {total}
            </span>
            <span
              className="kr-body text-[11px] truncate hidden sm:inline"
              style={{ color: 'rgba(239,244,255,0.45)' }}
            >
              · {current.topic}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="shrink-0 w-9 h-9 rounded-full inline-flex items-center justify-center text-cream/70 hover:text-cream hover:bg-white/10 transition"
          >
            <X size={18} strokeWidth={2.4} />
          </button>
        </header>

        {/* 진행 바 */}
        <div className="px-5 md:px-7 pb-3">
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full transition-[width] duration-300"
              style={{
                width: `${((idx + (phase === 'feedback' ? 1 : 0)) / total) * 100}%`,
                background: accent,
              }}
            />
          </div>
        </div>

        {/* 본문 — 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto px-5 md:px-7 pb-6">
          {/* 질문 */}
          <div className="flex items-start gap-3 mb-4">
            <p
              className="kr-body text-[14.5px] md:text-[15.5px] leading-[1.6] flex-1"
              style={{ color: 'rgba(239,244,255,0.95)' }}
            >
              {current.question}
            </p>
            <button
              type="button"
              onClick={() => toggleBookmark(current.id)}
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? '북마크 해제' : '이 문제 북마크'}
              className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full transition active:scale-[0.92]"
              style={{
                background: isBookmarked
                  ? `${accent}26`
                  : 'rgba(239,244,255,0.06)',
                border: isBookmarked
                  ? `1.5px solid ${accent}`
                  : '1.5px solid rgba(239,244,255,0.18)',
                color: isBookmarked ? accent : 'rgba(239,244,255,0.65)',
              }}
            >
              <Bookmark
                size={14}
                strokeWidth={isBookmarked ? 2.4 : 2}
                fill={isBookmarked ? accent : 'none'}
              />
            </button>
          </div>

          {/* 선택지 */}
          <OptionsPanel
            choices={current.choices}
            chosen={chosen}
            correctIndex={phase === 'feedback' ? current.answerIndex : null}
            graded={phase === 'feedback'}
            onChoose={handleChoose}
          />

          {/* 피드백 */}
          {phase === 'feedback' && correct !== null ? (
            <div
              className="mt-5 rounded-[14px] p-4"
              style={{
                background: correct
                  ? 'rgba(111,255,0,0.10)'
                  : 'rgba(255,107,107,0.08)',
                border: correct
                  ? '1px solid rgba(111,255,0,0.4)'
                  : '1px solid rgba(255,107,107,0.4)',
              }}
            >
              <p
                className="kr-heading uppercase text-[11px] tracking-widest mb-2"
                style={{
                  color: correct ? '#9CFF3D' : '#ff9c9c',
                }}
              >
                {correct ? '정답!' : '오답'}
                {!correct && (
                  <span className="kr-body text-[12px] tracking-normal ml-2 normal-case text-cream/75">
                    정답: {String.fromCharCode(65 + current.answerIndex)}.{' '}
                    {current.choices[current.answerIndex]}
                  </span>
                )}
              </p>
              <p
                className="kr-body text-[13px] leading-[1.65]"
                style={{ color: 'rgba(239,244,255,0.85)' }}
              >
                {explanationToText(current.explanation)}
              </p>
            </div>
          ) : null}
        </div>

        {/* 하단 CTA */}
        <footer
          className="px-5 md:px-7 py-4 flex items-center gap-3"
          style={{
            borderTop: '1px solid rgba(239,244,255,0.10)',
            background: 'rgba(1,8,40,0.6)',
          }}
        >
          {phase === 'question' ? (
            <p className="kr-body text-[12px] text-cream/55 flex-1">
              선택지를 골라봐!
            </p>
          ) : (
            <>
              <p className="kr-body text-[12px] text-cream/55 flex-1 hidden sm:block">
                {isLast
                  ? total < POOL_SIZE
                    ? '관련 문제가 더 추가될 예정이에요.'
                    : '다 풀었어! 학습으로 돌아갈까?'
                  : '다음 비슷한 문제로 넘어갈까?'}
              </p>
              <button
                type="button"
                onClick={handleNext}
                className="kr-heading uppercase text-[12px] tracking-widest px-5 py-3 rounded-full transition active:scale-[0.97]"
                style={{
                  background: accent,
                  color: '#010828',
                  boxShadow: `0 6px 20px -4px ${accent}66`,
                }}
              >
                {isLast ? (
                  '학습으로 돌아가기'
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <RefreshCcw size={13} strokeWidth={2.6} />
                    다음 비슷한 문제
                  </span>
                )}
              </button>
            </>
          )}
        </footer>
      </div>

      {/* slide-up keyframe */}
      <style>{`
        @keyframes similarSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

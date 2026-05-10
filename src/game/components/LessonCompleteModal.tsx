/**
 * LessonCompleteModal — 레슨 마지막 스텝 정답 시 노출되는 클리어 축하 화면.
 *
 * 트리거 (LessonScreen):
 *   - stepIdx === lesson.steps.length - 1
 *   - quizState[stepIdx].correct === true
 *   - 정답 채점 직후 1.2 초 딜레이 (사용자가 피드백 시트 읽을 시간 확보)
 *
 * 디자인 의도:
 *   - 마지막 스텝 클리어가 단순 "다음 버튼" 으로 끝나면 임팩트 0.
 *   - 마스코트 celebrate 포즈 + sparkle + 큰 헤드라인으로 "해냈다" 감정 강화.
 *   - 통계 (스텝 수 · 정답률) 보여줘 노력 시각화.
 *   - CTA 2 종: 실전 세트 (primary, neon) · Zone 으로 (secondary).
 *
 * Portal 으로 document.body 마운트 — backdrop-filter stacking context 회피.
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Trophy, X, Zap } from 'lucide-react';
import Ques from '@/components/mascot/Ques';
import { characterForSubject } from '@/components/mascot/types';
import type { Subject } from '@/types/question';

interface Props {
  subject: Subject;
  /** 챕터 번호 — "챕터 N 클리어" 표시. */
  chapter: number;
  /** 챕터명 (있으면 표시). */
  chapterTitle?: string;
  /** 레슨 (토픽) 명 — "X 정복" 표시. */
  topic: string;
  /** 풀어낸 스텝 수 (= 정답 + 오답 합). */
  totalSteps: number;
  /** 정답 수. */
  correctSteps: number;
  /** "실전 세트로 도전" 클릭. */
  onGoToPractice: () => void;
  /** "Zone 으로 돌아가기" 또는 X 닫기. */
  onClose: () => void;
}

export default function LessonCompleteModal({
  subject,
  chapter,
  chapterTitle,
  topic,
  totalSteps,
  correctSteps,
  onGoToPractice,
  onClose,
}: Props) {
  // ESC 닫기.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const accuracy =
    totalSteps === 0 ? 0 : Math.round((correctSteps / totalSteps) * 100);
  const character = characterForSubject(subject);

  const node = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lesson-complete-title"
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6"
      style={{ background: 'rgba(1,8,40,0.85)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[460px] max-h-[92vh] overflow-y-auto rounded-[28px] p-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, rgba(111,255,0,0.22) 0%, rgba(20,32,46,0.98) 55%)',
          border: '1.5px solid rgba(111,255,0,0.5)',
          boxShadow:
            '0 28px 70px -10px rgba(111,255,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 (X) — 우상단 */}
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-3 right-3 w-9 h-9 inline-flex items-center justify-center rounded-full transition active:scale-95 z-10"
          style={{
            background: 'rgba(239,244,255,0.06)',
            border: '1px solid rgba(239,244,255,0.10)',
          }}
        >
          <X size={16} className="text-cream" strokeWidth={2.4} />
        </button>

        {/* ── 배경 sparkle 파티클 (절대 위치, 장식용) ───────────── */}
        <Sparkle x="12%" y="18%" size={14} delay={0} />
        <Sparkle x="86%" y="22%" size={10} delay={0.3} />
        <Sparkle x="22%" y="62%" size={8} delay={0.6} />
        <Sparkle x="78%" y="58%" size={12} delay={0.2} />
        <Sparkle x="50%" y="8%" size={16} delay={0.5} />

        {/* ── HERO — 마스코트 + 헤드라인 ──────────────────────── */}
        <div className="relative px-6 pt-8 pb-5 text-center">
          {/* 떠있는 "CHAPTER N CLEAR" 배지 */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4"
            style={{
              background: 'linear-gradient(90deg, #6FFF00, #54c800)',
              boxShadow: '0 6px 16px -4px rgba(111,255,0,0.5)',
            }}
          >
            <Trophy size={12} fill="#0a1f00" strokeWidth={0} />
            <span className="kr-num text-[10px] uppercase tracking-[0.18em] font-bold" style={{ color: '#0a1f00' }}>
              Chapter {chapter} Clear
            </span>
          </div>

          {/* 마스코트 — celebrate 포즈, 글로우 둘러서 */}
          <div className="relative inline-flex items-center justify-center mb-4">
            <motion.div
              aria-hidden
              className="absolute inset-0 rounded-full blur-2xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(111,255,0,0.55), transparent 70%)',
                transform: 'scale(1.6)',
              }}
              animate={{ opacity: [0.55, 0.85, 0.55] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative">
              <Ques
                pose="celebrate"
                character={character}
                size={120}
                animated={false}
              />
            </div>
          </div>

          {/* 메인 헤드라인 */}
          <h2
            id="lesson-complete-title"
            className="kr-heading text-[26px] md:text-[30px] leading-[1.2] mb-1"
            style={{ color: '#EFF4FF' }}
          >
            <span style={{ color: '#9CFF3D' }}>{topic}</span> 정복!
          </h2>
          <p className="kr-body text-[13px] text-cream/70 leading-[1.55]">
            개념 파악 완료 — 이제 실전 감각 끌어올릴 차례
          </p>
        </div>

        {/* ── 통계 카드 — 진척도 시각화 ───────────────────────── */}
        <div className="px-5 md:px-6">
          <div
            className="rounded-2xl p-4 mb-4 grid grid-cols-3 gap-2"
            style={{
              background: 'rgba(239,244,255,0.04)',
              border: '1px solid rgba(239,244,255,0.08)',
            }}
          >
            <Stat
              label="개념"
              value={totalSteps}
              suffix="개"
              color="#A78BFA"
            />
            <Stat
              label="정답"
              value={correctSteps}
              suffix={`/${totalSteps}`}
              color="#9CFF3D"
            />
            <Stat
              label="정확도"
              value={accuracy}
              suffix="%"
              color="#FFB020"
            />
          </div>

          {chapterTitle ? (
            <p className="kr-body text-[11.5px] text-cream/45 text-center mb-5">
              Chapter {chapter} · {chapterTitle}
            </p>
          ) : null}
        </div>

        {/* ── CTA — 실전 세트 (primary) + Zone 복귀 (secondary) ─── */}
        <div className="px-5 md:px-6 pb-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onGoToPractice}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl kr-num font-bold text-[14px] transition active:scale-[0.97]"
            style={{
              background: 'linear-gradient(180deg, #6FFF00, #54c800)',
              color: '#0a1f00',
              boxShadow:
                '0 10px 26px -8px rgba(111,255,0,0.55), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}
          >
            <Zap size={16} fill="#0a1f00" strokeWidth={0} />
            실전 세트로 도전
            <ArrowRight size={16} strokeWidth={2.8} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl kr-num text-[12.5px] transition active:scale-[0.97]"
            style={{
              background: 'rgba(239,244,255,0.06)',
              color: 'rgba(239,244,255,0.75)',
              border: '1px solid rgba(239,244,255,0.12)',
            }}
          >
            Zone으로 돌아가기
          </button>
        </div>
      </motion.div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(node, document.body);
}

// ─── 보조 컴포넌트 ─────────────────────────────────────────────

function Stat({
  label,
  value,
  suffix,
  color,
}: {
  label: string;
  value: number;
  suffix: string;
  color: string;
}) {
  return (
    <div className="text-center py-1">
      <div
        className="kr-num font-bold leading-none mb-1"
        style={{ color, fontSize: 22 }}
      >
        {value}
        <span className="kr-num text-[12px] font-medium ml-0.5" style={{ color: `${color}cc` }}>
          {suffix}
        </span>
      </div>
      <div className="kr-num text-[10px] uppercase tracking-widest text-cream/50">
        {label}
      </div>
    </div>
  );
}

/**
 * Sparkle — 위치/크기/딜레이를 받아 깜빡이는 ⭐ 파티클.
 * 절대 위치로 모달 안 곳곳에 뿌려 축제 분위기.
 */
function Sparkle({
  x,
  y,
  size,
  delay,
}: {
  x: string;
  y: string;
  size: number;
  delay: number;
}) {
  return (
    <motion.div
      aria-hidden
      className="absolute pointer-events-none"
      style={{ left: x, top: y, color: '#9CFF3D' }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{
        opacity: [0, 1, 0.4, 1, 0],
        scale: [0.4, 1.2, 0.9, 1.1, 0.4],
        rotate: [0, 12, -8, 6, 0],
      }}
      transition={{
        duration: 2.6,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    >
      <Sparkles size={size} fill="currentColor" strokeWidth={0} />
    </motion.div>
  );
}

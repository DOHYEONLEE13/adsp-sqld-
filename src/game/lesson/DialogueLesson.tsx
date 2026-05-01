/**
 * DialogueLesson — 듀오링고식 캐릭터 대화 레슨.
 *
 * 흐름:
 *   1. dialogue[0] 부터 순서대로 SpeechBubble 등장 → 탭/CTA 로 다음 대사
 *   2. 대사 끝나면 같은 화면에서 SpeechBubble 이 "질문" 으로 바뀌고 OptionsPanel 등장
 *   3. 선택 → FeedbackSheet 슬라이드업 → "계속" → 다음 스텝
 *   4. 챕터 전 스텝 통과 시 onFinishGoToPractice() 로 실전 세트
 *
 * LessonStep.dialogue 가 없는 스텝은 GamePage 에서 LessonScreen 으로 분기됨.
 * 즉 이 컴포넌트가 마운트되는 시점엔 lesson.steps[0].dialogue 가 존재함을 가정.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Subject } from '@/types/question';
import {
  getChapterSteps,
  getLesson,
  getQuizQuestion,
} from '@/data/lessons';
import { recordSingleAnswer } from '../storage';
import Ques from '@/components/mascot/Ques';
import TopBar from './TopBar';
import SpeechBubble from './SpeechBubble';
import OptionsPanel from './OptionsPanel';
import FeedbackSheet from './FeedbackSheet';
import PageAmbientBg from '../components/PageAmbientBg';
import { getReminder } from '@/data/reminders';
import { PASS_TIER_VISUAL } from '@/types/passes';
import { explanationToText } from '@/types/question';

interface Props {
  subject: Subject;
  chapter: number;
  topic: string;
  /**
   * 진입 시 시작 step index. 지정되면 single-step 모드 — 한 step 끝나면
   * 다음 step 으로 가지 않고 onBack(Zone) 으로 복귀. Zone 의 step 노드에서
   * 직접 진입할 때 사용.
   */
  initialStepIdx?: number;
  /**
   * N회독 차수 (1~). 1=원본 dialogue. 2/3=reminder 카드 먼저 노출 후 풀이로.
   * 기본 1.
   */
  passNumber?: number;
  onFinishGoToPractice: () => void;
  onBack: () => void;
}

type Phase = 'narrate' | 'question' | 'feedback';

export default function DialogueLesson({
  subject,
  chapter,
  topic,
  initialStepIdx,
  passNumber = 1,
  onFinishGoToPractice,
  onBack,
}: Props) {
  const isReplay = passNumber > 1;
  const isSingleStep = typeof initialStepIdx === 'number';
  const lesson = useMemo(
    () => getLesson(subject, chapter, topic),
    [subject, chapter, topic],
  );
  const chapterSteps = useMemo(
    () => getChapterSteps(subject, chapter),
    [subject, chapter],
  );
  const topicOffset = useMemo(() => {
    if (!lesson) return 0;
    const i = chapterSteps.findIndex(
      (e) => e.lesson.id === lesson.id && e.step === lesson.steps[0],
    );
    return i >= 0 ? i : 0;
  }, [chapterSteps, lesson]);

  const [stepIdx, setStepIdx] = useState(initialStepIdx ?? 0);
  const [turnIdx, setTurnIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('narrate');
  const [chosen, setChosen] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  // 회독 진입 시 reminder 카드 노출 여부. true 면 카드 화면, false 면 본 학습으로 진입.
  const [showReminder, setShowReminder] = useState<boolean>(isReplay);
  const startedAtRef = useRef<number>(Date.now());
  const [xpToast, setXpToast] = useState<{ amount: number; key: number } | null>(
    null,
  );

  // 스텝이 바뀔 때 상태 초기화 + 질문 타이머 시작
  useEffect(() => {
    setTurnIdx(0);
    setPhase('narrate');
    setChosen(null);
    setCorrect(null);
    if (isReplay) setShowReminder(true);
  }, [stepIdx, isReplay]);

  if (!lesson) {
    return (
      <section className="relative min-h-screen bg-base text-cream flex items-center justify-center px-6">
        <div className="liquid-glass rounded-[20px] p-8 text-center max-w-md">
          <h2 className="kr-heading text-[18px] mb-2">레슨 준비 중</h2>
          <button
            type="button"
            onClick={onBack}
            className="block mt-3 mx-auto kr-heading text-[11px] text-cream/60 hover:text-neon"
          >
            돌아가기
          </button>
        </div>
      </section>
    );
  }

  const step = lesson.steps[stepIdx];
  const dialogue = step.dialogue ?? [];
  const hasDialogue = dialogue.length > 0;
  const turn = hasDialogue ? dialogue[Math.min(turnIdx, dialogue.length - 1)] : null;

  const quizQuestion = getQuizQuestion(step.quizId);

  // 진행도: 챕터 전체 대비 (현재 스텝 + phase 진척률)
  const chapterIdx = topicOffset + stepIdx;
  const chapterTotal = chapterSteps.length;
  const innerProgress =
    phase === 'narrate' && hasDialogue
      ? turnIdx / (dialogue.length + 1)
      : phase === 'question'
        ? dialogue.length / (dialogue.length + 1)
        : 1;
  const progress =
    chapterTotal === 0
      ? 0
      : (chapterIdx + innerProgress) / chapterTotal;

  // --- handlers ---
  const handleAdvanceNarrative = () => {
    if (turnIdx < dialogue.length - 1) {
      setTurnIdx(turnIdx + 1);
      return;
    }
    // 마지막 대사 → 질문으로
    startedAtRef.current = Date.now();
    setPhase('question');
  };

  /**
   * 한 단계 뒤로:
   *  - narrate: 이전 대사 (turnIdx 0 이고 stepIdx 0 이면 비활성)
   *  - narrate (turnIdx 0, stepIdx > 0): 이전 step 의 마지막 대사로
   *  - question: 마지막 narration 으로 복귀 (선택 취소)
   *  - feedback: 비활성 (이미 채점 기록됨)
   */
  const canGoPrev =
    (phase === 'narrate' && (turnIdx > 0 || stepIdx > 0)) ||
    phase === 'question';
  const handleGoPrev = () => {
    if (!canGoPrev) return;
    if (phase === 'question') {
      setPhase('narrate');
      return;
    }
    if (phase === 'narrate') {
      if (turnIdx > 0) {
        setTurnIdx(turnIdx - 1);
        return;
      }
      // turnIdx === 0 && stepIdx > 0 → 이전 step 마지막 narration 으로
      const prev = lesson.steps[stepIdx - 1];
      const prevDialogue = prev?.dialogue ?? [];
      setStepIdx(stepIdx - 1);
      // useEffect 가 stepIdx 변화에 turn=0/phase=narrate 로 reset 하므로
      // 다음 tick 에 마지막 turn 으로 다시 set.
      window.setTimeout(() => {
        setTurnIdx(Math.max(0, prevDialogue.length - 1));
      }, 0);
    }
  };

  const handleChoose = (idx: number) => {
    if (!quizQuestion || phase !== 'question') return;
    setChosen(idx);
    const ok = idx === quizQuestion.answerIndex;
    setCorrect(ok);
    const timeMs = Date.now() - startedAtRef.current;
    const xp = recordSingleAnswer(quizQuestion.id, ok, timeMs);
    setPhase('feedback');
    if (xp > 0) {
      setXpToast({ amount: xp, key: Date.now() });
      window.setTimeout(() => setXpToast(null), 1800);
    }
  };

  const handleNextStep = () => {
    if (stepIdx < lesson.steps.length - 1) {
      setStepIdx(stepIdx + 1);
      window.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      // 마지막 step — single-step 모드는 Zone 복귀, legacy 는 실전 세트.
      if (isSingleStep) {
        onBack();
      } else {
        onFinishGoToPractice();
      }
    }
  };

  const handleBackToZone = () => {
    onBack();
  };

  // === 렌더 ===
  const isMobile =
    typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  const bubblePlacement: 'top' | 'right' = isMobile ? 'top' : 'right';

  // 현재 Ques 포즈
  const questPose =
    phase === 'narrate' && turn?.pose
      ? turn.pose
      : phase === 'question'
        ? 'think'
        : phase === 'feedback'
          ? correct
            ? 'celebrate'
            : 'sad'
          : 'idle';

  // 현재 SpeechBubble 에 보여줄 텍스트
  const bubbleText =
    phase === 'narrate' && turn
      ? turn.text
      : phase === 'question' && quizQuestion
        ? quizQuestion.question
        : phase === 'feedback'
          ? correct
            ? '정답이야! 한 걸음 더!'
            : '괜찮아, 다시 보면 돼.'
          : '';

  // ── 회독 진입 reminder 카드 — 2회독+ 만 ─────────────────
  if (showReminder) {
    const reminder = getReminder(step.id);
    const tier = passNumber === 2 ? 'gold' : 'master';
    const visual = PASS_TIER_VISUAL[tier];
    return (
      <section
        className="relative min-h-screen text-cream flex flex-col isolate"
        data-subject={subject}
      >
        <PageAmbientBg blur />
        <TopBar
          progress={progress}
          stepProgress={innerProgress}
          onExit={onBack}
        />
        <div className="flex-1 flex flex-col items-center justify-center px-5 md:px-8 py-10 max-w-[640px] mx-auto w-full">
          <div className="mb-5">
            <Ques pose={passNumber === 2 ? 'think' : 'lightbulb'} size={120} />
          </div>
          <span
            className="kr-num inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-widest mb-3"
            style={{
              background: `${visual.color}33`,
              border: `1px solid ${visual.color}`,
              color: visual.color,
              boxShadow: `0 0 14px ${visual.glow}`,
            }}
          >
            {passNumber}회독
          </span>
          <h2 className="kr-heading text-[24px] md:text-[28px] text-center mb-3 leading-[1.2]">
            {reminder?.headline ?? `${step.title}, 기억나?`}
          </h2>
          {reminder ? (
            <>
              <p className="kr-body text-[14px] md:text-[15px] text-cream/80 text-center leading-[1.65] mb-5 max-w-[480px]">
                {reminder.summary}
              </p>
              <ul
                className="w-full max-w-[480px] mb-6 px-5 py-4 rounded-2xl space-y-2"
                style={{
                  background: 'rgba(8,14,36,0.6)',
                  border: '1px solid rgba(239,244,255,0.12)',
                }}
              >
                {reminder.keyPoints.map((p, i) => (
                  <li
                    key={i}
                    className="kr-body text-[12.5px] md:text-[13px] text-cream/85 leading-[1.55] flex items-start gap-2"
                  >
                    <span style={{ color: visual.color, marginTop: 2 }}>•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="kr-body text-[13px] text-cream/65 text-center leading-[1.6] mb-6 max-w-[420px]">
              이 개념의 짧은 요약은 아직 준비 중. 전체 다시 보기로 진행해도 좋아.
            </p>
          )}
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => {
                setShowReminder(false);
                // 곧장 문제로 — narrate 단계 스킵
                startedAtRef.current = Date.now();
                setPhase('question');
              }}
              className="kr-num inline-flex items-center gap-2 text-[12px] uppercase tracking-widest px-5 py-3 rounded-full transition active:scale-[0.97]"
              style={{
                background: `${visual.color}22`,
                border: `1.5px solid ${visual.color}`,
                color: visual.color,
              }}
            >
              확인했어 · 문제 풀기
            </button>
            <button
              type="button"
              onClick={() => setShowReminder(false)}
              className="kr-num inline-flex items-center gap-2 text-[12px] uppercase tracking-widest px-5 py-3 rounded-full transition active:scale-[0.97]"
              style={{
                background: 'rgba(239,244,255,0.06)',
                border: '1px solid rgba(239,244,255,0.2)',
                color: 'var(--cream)',
              }}
            >
              전체 다시 보기
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative min-h-screen text-cream flex flex-col isolate"
      data-subject={subject}
    >
      <PageAmbientBg blur />
      <TopBar progress={progress} onExit={onBack} />

      {/* XP 획득 토스트 */}
      {xpToast ? (
        <div
          key={xpToast.key}
          className="fixed top-[18%] left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
          style={{
            animation: 'xpToastRise 1.8s cubic-bezier(0.18, 0.9, 0.4, 1) forwards',
          }}
        >
          <div
            className="kr-heading px-5 py-3 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #FFB020 0%, #FD802E 100%)',
              color: '#0a0f1f',
              boxShadow:
                '0 18px 48px -8px rgba(253,128,46,0.6), 0 0 0 2px rgba(255,255,255,0.18) inset',
              fontSize: 22,
              letterSpacing: '0.04em',
              textShadow: '0 1px 0 rgba(255,255,255,0.25)',
            }}
          >
            +{xpToast.amount} XP
          </div>
        </div>
      ) : null}

      <main className="flex-1 mx-auto w-full max-w-[820px] px-5 md:px-8 pt-6 pb-36">
        {/* 캐릭터 + 말풍선 영역 */}
        <div
          className={
            'flex gap-4 md:gap-6 ' +
            (bubblePlacement === 'top'
              ? 'flex-col items-center'
              : 'items-start')
          }
        >
          <div className="shrink-0">
            <Ques pose={questPose} size={isMobile ? 140 : 180} />
          </div>
          <div className="flex-1 w-full pt-2">
            {bubbleText ? (
              <SpeechBubble
                text={bubbleText}
                placement={bubblePlacement}
              />
            ) : null}
          </div>
        </div>

        {/* narrate 단계 — "이전" + "계속" 버튼 */}
        {phase === 'narrate' ? (
          <div className="mt-8 flex justify-center items-center gap-3">
            <button
              type="button"
              onClick={handleGoPrev}
              disabled={!canGoPrev}
              aria-label="이전 대사"
              className="kr-heading uppercase tracking-widest text-[12px] md:text-[13px] px-4 py-3 md:px-5 md:py-3.5 rounded-full inline-flex items-center gap-1.5 transition liquid-glass hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} strokeWidth={2.6} />
              이전
            </button>
            <button
              type="button"
              onClick={handleAdvanceNarrative}
              className="kr-heading uppercase tracking-widest text-[13px] md:text-[14px] px-6 py-3.5 md:px-8 md:py-4 rounded-full inline-flex items-center gap-2 transition hover:-translate-y-0.5 active:translate-y-0"
              style={{
                background:
                  'linear-gradient(180deg, var(--subject-accent) 0%, color-mix(in srgb, var(--subject-accent) 70%, #010828) 100%)',
                color: '#010828',
                boxShadow:
                  '0 6px 0 -2px rgba(0,0,0,0.5), 0 10px 22px -8px var(--subject-accent)',
              }}
            >
              {turnIdx < dialogue.length - 1 ? '계속' : '문제 풀기'}
              <ChevronRight size={16} strokeWidth={2.6} />
            </button>
          </div>
        ) : null}

        {/* question / feedback 단계 — 4지선다 */}
        {(phase === 'question' || phase === 'feedback') && quizQuestion ? (
          <div className="mt-8">
            {phase === 'question' ? (
              <div className="flex justify-start mb-4">
                <button
                  type="button"
                  onClick={handleGoPrev}
                  aria-label="대사로 돌아가기"
                  className="kr-heading uppercase tracking-widest text-[11px] md:text-[12px] px-3.5 py-2 rounded-full inline-flex items-center gap-1.5 transition liquid-glass hover:bg-white/10"
                >
                  <ChevronLeft size={13} strokeWidth={2.6} />
                  대사 다시 보기
                </button>
              </div>
            ) : null}
            <OptionsPanel
              choices={quizQuestion.choices}
              chosen={chosen}
              correctIndex={
                phase === 'feedback' ? quizQuestion.answerIndex : null
              }
              graded={phase === 'feedback'}
              onChoose={handleChoose}
            />
          </div>
        ) : null}
      </main>

      {/* FeedbackSheet — 채점 직후 슬라이드업
          액션 분기:
            - 다음 step 있음 → primary "다음 단계", secondary "존으로 돌아가기"
            - 마지막 step (legacy) → primary "실전 세트로", secondary "존으로 돌아가기"
            - 마지막 step (single-step) → primary "존으로 돌아가기", secondary 없음 */}
      {phase === 'feedback' && quizQuestion && correct !== null
        ? (() => {
            const hasNext = stepIdx < lesson.steps.length - 1;
            let ctaLabel: string;
            let onContinue: () => void;
            let secondaryCtaLabel: string | undefined;
            let onSecondary: (() => void) | undefined;
            if (hasNext) {
              ctaLabel = '다음 단계';
              onContinue = handleNextStep;
              secondaryCtaLabel = '존으로';
              onSecondary = handleBackToZone;
            } else if (isSingleStep) {
              ctaLabel = '존으로 돌아가기';
              onContinue = handleBackToZone;
            } else {
              ctaLabel = '실전 세트로';
              onContinue = handleNextStep;
              secondaryCtaLabel = '존으로';
              onSecondary = handleBackToZone;
            }
            return (
              <FeedbackSheet
                correct={correct}
                explanation={explanationToText(quizQuestion.explanation)}
                correctAnswerText={
                  !correct
                    ? quizQuestion.choices[quizQuestion.answerIndex]
                    : undefined
                }
                ctaLabel={ctaLabel}
                onContinue={onContinue}
                secondaryCtaLabel={secondaryCtaLabel}
                onSecondary={onSecondary}
              />
            );
          })()
        : null}
    </section>
  );
}

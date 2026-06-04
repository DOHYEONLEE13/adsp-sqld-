/**
 * Lesson 화면 — 개념 1개 → 예제 1개 → 다음 개념 1개 → 예제 1개…
 *
 * 구조:
 *   [Header] 챕터 진행바 (X / N in Chapter) + 현재 스텝 제목 + 토픽
 *   [Body]   currentView === 'concept' → 개념 블록 카드
 *            currentView === 'quiz'    → 4지선다 + 선택 → 해설 피드백
 *   [CTA]    concept: "예제 풀기"
 *            quiz (정답 전): 선택 시 즉시 채점
 *            quiz (채점 후): "다음 개념" 또는 "다음 문제로" 또는 "완료"
 *
 * 챕터 진행바는 모든 토픽의 스텝을 평면화해서 "이 챕터 안에서 내가 몇 번째
 * 스텝을 보고 있는지" 를 표시합니다. 맞춘 수는 실시간 누적됩니다.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  Flame,
  Lightbulb,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react';
import type { MultipleChoiceQuestion, Subject } from '@/types/question';
import { openWebOrAppPremiumEntry } from '@/lib/appMode';
import { scrollPageTo } from '@/lib/pageScroll';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import {
  getChapterSteps,
  getLesson,
  getQuizQuestion,
  type LessonBlock,
} from '@/data/lessons';
import { useProgress } from '../useProgress';
import { recordSingleAnswer } from '../storage';
import { consumeEnergy } from '../energy';
import { stepKey, useStepUnlocks } from '../stepUnlocks';
import EnergyBlockModal from '../components/EnergyBlockModal';
import LessonCompleteModal from '../components/LessonCompleteModal';
import PageAmbientBg from '../components/PageAmbientBg';
import { reserveLessonQuestion } from '../serverQuestionSessions';
import SqlQuestionContextCard from '../components/SqlQuestionContextCard';
import SqlOrderingPanel, {
  isSqlOrderingQuestion,
  sqlOrderingCorrectAnswerText,
} from '../lesson/SqlOrderingPanel';
import GlossaryKeyword, { GLOSSARY_TERMS } from '../lesson/GlossaryKeyword';
import { hasEverSolved } from '../progressPredicates';

const SUBJECT_ACCENT: Record<Subject, string> = {
  adsp: '#67e8f9',
  sqld: '#c084fc',
};

interface Props {
  subject: Subject;
  chapter: number;
  topic: string;
  /** 진입 시 시작 step. 지정되면 single-step 모드. */
  initialStepIdx?: number;
  /** N회독 차수 (LessonScreen 은 현재 무시 — DialogueLesson 만 reminder 분기). */
  passNumber?: number;
  /** 레슨 완료 후 "실전 세트" 로 넘어갈 때. */
  onFinishGoToPractice: () => void;
  /** 상단 "Zone 으로". */
  onBack: (stepIdx?: number) => void;
}

export default function LessonScreen({
  subject,
  chapter,
  topic,
  initialStepIdx,
  passNumber: _passNumber,
  onFinishGoToPractice,
  onBack,
}: Props) {
  // _passNumber 는 향후 reminder 카드 추가 시 사용. 현재는 대화형 dialogue 가 없는
  // step 만 LessonScreen 으로 떨어지므로 회독 분기 우선순위 낮음.
  void _passNumber;
  const isSingleStep = typeof initialStepIdx === 'number';
  const accent = SUBJECT_ACCENT[subject];
  const schema = SUBJECT_SCHEMAS[subject];
  const chapterMeta = schema.chapters.find((c) => c.chapter === chapter);

  const lesson = useMemo(
    () => getLesson(subject, chapter, topic),
    [subject, chapter, topic],
  );

  // 챕터 전체 스텝 평면화 — 진행바용
  const chapterSteps = useMemo(
    () => getChapterSteps(subject, chapter),
    [subject, chapter],
  );

  // 이 토픽(lesson) 의 챕터-내 첫 스텝 offset
  const topicOffset = useMemo(() => {
    if (!lesson) return 0;
    const idx = chapterSteps.findIndex(
      (e) => e.lesson.id === lesson.id && e.step === lesson.steps[0],
    );
    return idx >= 0 ? idx : 0;
  }, [chapterSteps, lesson]);

  // 현재 스텝 index (토픽 내, 0-based)
  const [stepIdx, setStepIdx] = useState(initialStepIdx ?? 0);
  // 'concept' → 개념 카드 보여주는 중, 'quiz' → 문제 풀이 중
  const [view, setView] = useState<'concept' | 'quiz'>('concept');
  const [quizIdx, setQuizIdx] = useState(0);
  // 스텝별 선택/채점 상태: { [stepIdx]: { chosen, correct } }
  const [quizState, setQuizState] = useState<
    Record<string, { chosen: number; correct: boolean }>
  >({});

  /** XP 획득 토스트 — `+10` 같이 잠깐 떴다 사라짐. */
  const [xpToast, setXpToast] = useState<{ amount: number; key: number } | null>(
    null,
  );

  const progress = useProgress();
  const startedAtRef = useRef<number>(Date.now());

  // ── ⚡ 차감 정책:
  //  - 처음 진입하는 step → 1⚡ + visit 기록 (server step_unlocks)
  //  - 이미 정답 맞춘 step 재진입 → 차감 X (revisit free)
  //  - 이미 visited 한 step (= 한 번 ⚡ 차감 후 진입했음) 재진입 → 차감 X
  //  - ⚡ 차감 실패 시 visit 기록 X — 다음 진입 시 재시도 (정상 동작)
  //  - 프리미엄/어드민 = RPC 가 ok=true 즉시 반환 → 차감 0
  const consumedStepsRef = useRef<Set<number>>(new Set());
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const lockSnap = useStepUnlocks();
  const lockSnapRef = useRef(lockSnap);
  lockSnapRef.current = lockSnap;
  const [energyBlock, setEnergyBlock] = useState<{ retryAfterSec: number } | null>(null);
  const [quotaBlock, setQuotaBlock] = useState<string | null>(null);
  const [lessonTokens, setLessonTokens] = useState<Record<string, string>>({});
  /** 레슨 마지막 스텝 정답 시 축하 모달. handleChoose 에서 setTimeout 으로 set. */
  const [showCelebration, setShowCelebration] = useState(false);
  useEffect(() => {
    if (consumedStepsRef.current.has(stepIdx)) return;
    consumedStepsRef.current.add(stepIdx);

    // 이미 정답 맞춘 step (revisit) — 차감 X
    const currentStep = lesson?.steps[stepIdx];
    const stat = currentStep?.quizId
      ? progressRef.current.questionStats[currentStep.quizId]
      : undefined;
    const alreadySolved = !!stat && (stat.correct ?? 0) > 0;
    if (alreadySolved) return;

    // 이미 visited 한 step — 차감 X
    if (lesson) {
      const sk = stepKey(lesson.id, stepIdx);
      if (lockSnapRef.current.unlockedSet.has(sk)) return;
    }

    let cancelled = false;
    void consumeEnergy(1).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setEnergyBlock({ retryAfterSec: res.retryAfterSec });
        return;
      }
      // 차감 성공 시에만 visit 기록
    });
    return () => {
      cancelled = true;
    };
  }, [stepIdx, lesson]);

  if (!lesson) {
    return (
      <section className="relative min-h-screen bg-base text-cream flex items-center justify-center px-6">
        <div className="liquid-glass rounded-[20px] p-8 text-center max-w-md">
          <h2 className="kr-heading text-[18px] mb-2">레슨 준비 중</h2>
          <p className="kr-body text-[13px] text-cream/70 mb-6 leading-[1.8]">
            이 토픽의 개념 학습 콘텐츠는 아직 준비 중입니다. 실전 예제는 바로
            풀 수 있어요.
          </p>
          <button
            type="button"
            onClick={onFinishGoToPractice}
            className="kr-heading uppercase text-[12px] tracking-widest px-5 py-3 rounded-full bg-neon text-[#0a1024]"
          >
            예제 풀기
          </button>
          <button
            type="button"
            onClick={() => onBack(stepIdx)}
            className="block mt-3 mx-auto kr-heading text-[11px] text-cream/60 hover:text-neon"
          >
            존으로 돌아가기
          </button>
        </div>
      </section>
    );
  }

  const currentStep = lesson.steps[stepIdx];
  const chapterIdx = topicOffset + stepIdx; // 0-based

  // 챕터 전체 중 맞춘 문제 수 (실시간)
  const chapterSolvedCount = useMemo(() => {
    let n = 0;
    for (const entry of chapterSteps) {
      // review (quiz-less) step 은 풀이 카운트에서 제외.
      if (!entry.step.quizId) continue;
      const stat = progress.questionStats[entry.step.quizId];
      // 한 번이라도 맞혔으면 "풀었음" 으로 간주. 이후 복습 오답은 완료 진도를 지우지 않는다.
      if (hasEverSolved(stat)) n++;
    }
    return n;
  }, [chapterSteps, progress]);

  const chapterTotal = chapterSteps.length;
  const chapterRatio =
    chapterTotal === 0 ? 0 : (chapterIdx + 1) / chapterTotal;

  const stepQuizIds = [
    currentStep.quizId,
    ...(currentStep.extraQuizIds ?? []),
  ].filter((id): id is string => !!id);
  const activeQuizIdx =
    stepQuizIds.length === 0
      ? 0
      : Math.min(quizIdx, stepQuizIds.length - 1);
  const activeQuizId = stepQuizIds[activeQuizIdx];
  const quizQuestion = activeQuizId ? getQuizQuestion(activeQuizId) : null;
  const hasNextQuizInStep = activeQuizIdx < stepQuizIds.length - 1;
  const quizStateKey = `${stepIdx}:${activeQuizIdx}`;
  const savedQuiz = quizState[quizStateKey];

  // --- handlers ---

  const handleStartQuiz = async () => {
    if (quizQuestion && !lessonTokens[quizQuestion.id]) {
      const sk = lesson ? stepKey(lesson.id, stepIdx) : null;
      const reservation = await reserveLessonQuestion({
        questionId: quizQuestion.id,
        subject,
        chapter,
        stepKey: sk,
      });
      if (!reservation.ok) {
        const message =
          reservation.reason === 'quota_exceeded'
            ? `오늘 새 문제는 ${reservation.remainingQuota ?? 0}개 남았어요.`
            : '문제를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.';
        setQuotaBlock(message);
        window.setTimeout(() => setQuotaBlock(null), 3200);
        return;
      }
      setLessonTokens((tokens) => ({
        ...tokens,
        [quizQuestion.id]: reservation.sessionToken,
      }));
    }
    startedAtRef.current = Date.now();
    setView('quiz');
  };

  const handleChoose = (idx: number) => {
    if (savedQuiz || !quizQuestion) return;
    const correct = idx === quizQuestion.answerIndex;
    const timeMs = Date.now() - startedAtRef.current;
    const xp = recordSingleAnswer(
      quizQuestion.id,
      correct,
      timeMs,
      lesson ? stepKey(lesson.id, stepIdx) : null,
      idx,
      lessonTokens[quizQuestion.id] ?? null,
    );
    setQuizState((s) => ({ ...s, [quizStateKey]: { chosen: idx, correct } }));
    // 잠금 결정은 prevSolved (이전 step 정답 cross-check) 로만 — 별도 unlock 호출 X.
    if (xp > 0) {
      setXpToast({ amount: xp, key: Date.now() });
      window.setTimeout(() => {
        setXpToast(null);
      }, 1800);
    }

    // ── 레슨 완료 축하 트리거 ─────────────────────────────────
    // 마지막 스텝 + 정답 시 1.4 초 후 축하 모달. 사용자가 정답 피드백 시트
    // (해설 문구) 를 잠깐 읽을 시간을 확보한 뒤 노출. single-step 모드는
    // 한 step 만 풀고 즉시 Zone 복귀 의도라 축하 화면 skip.
    if (
      correct &&
      !isSingleStep &&
      stepIdx === lesson.steps.length - 1 &&
      !hasNextQuizInStep
    ) {
      window.setTimeout(() => setShowCelebration(true), 1400);
    }
  };

  const goNextQuizInStep = async () => {
    const nextQuizIdx = activeQuizIdx + 1;
    const nextQuizId = stepQuizIds[nextQuizIdx];
    if (!nextQuizId) {
      goNextStep();
      return;
    }
    const nextQuestion = getQuizQuestion(nextQuizId);
    if (!nextQuestion) {
      goNextStep();
      return;
    }
    if (!lessonTokens[nextQuestion.id]) {
      const sk = lesson ? stepKey(lesson.id, stepIdx) : null;
      const reservation = await reserveLessonQuestion({
        questionId: nextQuestion.id,
        subject,
        chapter,
        stepKey: sk,
      });
      if (!reservation.ok) {
        const message =
          reservation.reason === 'quota_exceeded'
            ? `오늘 새 문제는 ${reservation.remainingQuota ?? 0}개 남아있어요.`
            : '문제를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';
        setQuotaBlock(message);
        window.setTimeout(() => setQuotaBlock(null), 3200);
        return;
      }
      setLessonTokens((tokens) => ({
        ...tokens,
        [nextQuestion.id]: reservation.sessionToken,
      }));
    }
    setQuizIdx(nextQuizIdx);
    startedAtRef.current = Date.now();
    setView('quiz');
    scrollPageTo({ top: 0, behavior: 'smooth' });
  };

  const goNextStep = () => {
    if (isSingleStep) {
      // single-step 모드 — 한 step 만 풀고 Zone 복귀.
      onBack(stepIdx);
      return;
    }
    if (stepIdx < lesson.steps.length - 1) {
      const nextIdx = stepIdx + 1;
      // 잠금은 prevSolved 로만 결정 — 별도 unlock 호출 X.
      // 다음 step mount useEffect 가 ⚡ 차감 + visit 기록 처리.
      setStepIdx(nextIdx);
      setQuizIdx(0);
      setView('concept');
      scrollPageTo({ top: 0, behavior: 'smooth' });
    } else {
      // 레슨 마지막 스텝 이후 → 실전 세트
      onFinishGoToPractice();
    }
  };

  /**
   * 뒤로가기 — 선형 흐름 역순으로 한 단계씩.
   *   step0-concept → (없음, 비활성)
   *   step0-quiz    → step0-concept
   *   stepN-concept → step(N-1)-quiz (이전 채점 결과 그대로 보존)
   *   stepN-quiz    → stepN-concept
   */
  const canGoPrev = !(stepIdx === 0 && view === 'concept');
  const goPrevStep = () => {
    if (!canGoPrev) return;
    if (view === 'quiz') {
      setQuizIdx(0);
      setView('concept');
    } else {
      setStepIdx(stepIdx - 1);
      setQuizIdx(0);
      setView('quiz');
    }
    scrollPageTo({ top: 0, behavior: 'smooth' });
  };

  /** 직전 화면에서 어디로 돌아가는지 사용자에게 힌트로. */
  const prevLabel = (() => {
    if (!canGoPrev) return '이전';
    if (view === 'quiz') return `이전 · ${currentStep.title}`;
    const prev = lesson.steps[stepIdx - 1];
    return `이전 · ${prev.title} 예제`;
  })();

  const isLastStep = stepIdx === lesson.steps.length - 1;

  return (
    <section className="relative min-h-screen text-cream isolate overflow-hidden pb-24">
      {energyBlock ? (
        <EnergyBlockModal
          retryAfterSec={energyBlock.retryAfterSec}
          subject={subject}
          onClose={() => {
            setEnergyBlock(null);
            onBack(stepIdx);
          }}
          onUpgrade={() => {
            // 랜딩의 #pricing 섹션으로 이동 → SPA 가 hashchange 로 landing 전환
            openWebOrAppPremiumEntry();
            // mount 이후 anchor scroll 명시 (브라우저 자동 scroll 누락 보장)
            window.setTimeout(() => {
              document
                .getElementById('pricing')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 250);
          }}
        />
      ) : null}
      {showCelebration ? (
        <LessonCompleteModal
          subject={subject}
          chapter={chapter}
          chapterTitle={chapterMeta?.title}
          topic={topic}
          totalSteps={lesson.steps.length}
          correctSteps={
            lesson.steps.filter((_, i) => quizState[`${i}:0`]?.correct).length
          }
          onGoToPractice={() => {
            setShowCelebration(false);
            onFinishGoToPractice();
          }}
          onClose={() => {
            setShowCelebration(false);
            onBack(stepIdx);
          }}
        />
      ) : null}
      <PageAmbientBg blur />
      {/* 토픽 액센트 글로우 — 영상 위에 살짝 색감 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[5]"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${accent}1f 0%, rgba(1,8,40,0) 55%)`,
        }}
      />

      {/* XP 획득 토스트 — 첫 정답 시 1.8초 등장 */}
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

      {/* ============ Sticky 진행바 ============ */}
      <div
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{
          background: 'var(--game-chrome-top)',
          borderBottom: '1px solid var(--game-chrome-border)',
        }}
      >
        <div className="mx-auto max-w-[760px] lg:max-w-[1000px] xl:max-w-[1180px] px-5 md:px-8 lg:px-12 xl:px-16 py-3 md:py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onBack(stepIdx)}
              className="game-back-button shrink-0 inline-flex items-center gap-1.5 kr-heading text-[10.5px] uppercase tracking-widest transition"
              aria-label="존으로 돌아가기"
            >
              <ArrowLeft size={13} strokeWidth={2.4} />
              존
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="kr-heading text-[9.5px] uppercase tracking-widest text-cream/60 truncate">
                  Chapter {chapter} · {chapterMeta?.title}
                </div>
                <div className="kr-heading text-[10px] tracking-[0.04em] tabular-nums whitespace-nowrap flex items-center gap-2">
                  <span style={{ color: accent }}>
                    {chapterIdx + 1}
                    <span className="text-cream/35"> / {chapterTotal}</span>
                  </span>
                  <span className="text-cream/30">·</span>
                  <span className="inline-flex items-center gap-1 text-neon">
                    <CheckCircle2 size={10} strokeWidth={2.6} />
                    {chapterSolvedCount}
                  </span>
                </div>
              </div>
              <ProgressBar
                ratio={chapterRatio}
                accent={accent}
                chapterSolvedRatio={
                  chapterTotal === 0 ? 0 : chapterSolvedCount / chapterTotal
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============ Body ============ */}
      <div className="mx-auto max-w-[760px] lg:max-w-[1000px] xl:max-w-[1180px] px-6 md:px-10 lg:px-14 xl:px-20 pt-6 md:pt-10 lg:pt-14">
        {/* Topic + step meta */}
        <div className="mb-5">
          <div className="flex items-center gap-2 kr-heading text-[10px] uppercase tracking-widest text-cream/55 mb-2 flex-wrap">
            <span className="text-neon">
              Lesson
            </span>
            <span className="text-cream/30">›</span>
            <span style={{ color: accent }}>{topic}</span>
            <span className="text-cream/30">·</span>
            <span className="text-cream/70 tabular-nums">
              Step {stepIdx + 1}/{lesson.steps.length}
            </span>
          </div>
          <h1 className="kr-heading text-[22px] md:text-[28px] leading-[1.2] tracking-[0.01em]">
            {currentStep.title}
          </h1>
          {view === 'concept' ? (
            <div className="mt-2 inline-flex items-center gap-1.5 kr-heading text-[10px] uppercase tracking-widest text-cream/50">
              <Clock size={11} strokeWidth={2.4} />
              <span>개념 읽기 · 약 1분</span>
            </div>
          ) : (
            <div className="mt-2 inline-flex items-center gap-1.5 kr-heading text-[10px] uppercase tracking-widest text-[#fbbf24]">
              <Trophy size={11} strokeWidth={2.4} />
              <span>바로 풀어보는 예제</span>
            </div>
          )}
        </div>

        {view === 'concept' ? (
          <ConceptView blocks={currentStep.blocks} accent={accent} />
        ) : quizQuestion ? (
          <QuizView
            question={quizQuestion}
            saved={savedQuiz}
            onChoose={handleChoose}
          />
        ) : (
          <div className="liquid-glass rounded-[20px] p-6 kr-body text-cream/70">
            이 스텝의 예제를 불러오지 못했습니다.
          </div>
        )}

        {/* ============ CTA ============ */}
        <div className="mt-8 md:mt-10 space-y-3">
          {view === 'concept' ? (
            <PrimaryButton
              onClick={handleStartQuiz}
              accent="#fbbf24"
              icon={<Trophy size={18} strokeWidth={2.6} />}
              label="예제 풀기"
            />
          ) : savedQuiz ? (
            <PrimaryButton
              onClick={() => {
                if (hasNextQuizInStep) {
                  void goNextQuizInStep();
                } else {
                  goNextStep();
                }
              }}
              accent={isLastStep && !hasNextQuizInStep ? 'var(--neon)' : accent}
              icon={
                isLastStep && !hasNextQuizInStep ? (
                  <Sparkles size={18} strokeWidth={2.6} />
                ) : (
                  <ArrowRight size={18} strokeWidth={2.6} />
                )
              }
              label={
                hasNextQuizInStep ? '다음 SQL 문제' : isLastStep
                  ? '실전 세트로 마무리'
                  : `다음 개념 — ${lesson.steps[stepIdx + 1]?.title ?? ''}`
              }
            />
          ) : (
            <div className="kr-body text-[12px] text-cream/55 text-center leading-[1.6]">
              선지를 골라 바로 채점해보세요.
            </div>
          )}

          {/* 이전 화면으로 — 선형 흐름 역순 */}
          <button
            type="button"
            onClick={goPrevStep}
            disabled={!canGoPrev}
            className="w-full rounded-[14px] px-5 py-3.5 kr-heading uppercase text-[11.5px] tracking-[0.06em] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:border-cream/35 hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-neon"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(239,244,255,0.15)',
              color: 'rgba(239,244,255,0.78)',
            }}
            aria-label={canGoPrev ? '이전 페이지로 돌아가기' : '첫 페이지입니다'}
          >
            <span className="inline-flex items-center justify-center gap-2 w-full">
              <ArrowLeft size={14} strokeWidth={2.4} />
              <span className="truncate">{prevLabel}</span>
            </span>
          </button>
        </div>
      </div>
      {quotaBlock ? (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full border border-cyan-200/30 bg-[#071326]/95 px-4 py-2.5 kr-body text-[12px] font-bold text-cream shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
          {quotaBlock}
        </div>
      ) : null}
    </section>
  );
}

// ================================================================
// Progress Bar
// ================================================================

interface ProgressBarProps {
  /** 지금 이 스텝의 위치 비율 (0~1). */
  ratio: number;
  accent: string;
  /** 챕터 내 맞춘 비율 (0~1) — 연한 채움으로 깔아준다. */
  chapterSolvedRatio: number;
}

function ProgressBar({
  ratio,
  accent,
  chapterSolvedRatio,
}: ProgressBarProps) {
  return (
    <div
      className="relative w-full h-2 rounded-full overflow-hidden"
      style={{ background: 'rgba(239,244,255,0.08)' }}
    >
      {/* 맞춘 문제 누적(연한 네온) */}
      <div
        className="absolute top-0 left-0 bottom-0 transition-all duration-500"
        style={{
          width: `${chapterSolvedRatio * 100}%`,
          background: 'var(--neon-35)',
        }}
      />
      {/* 현재 스텝 위치 */}
      <div
        className="absolute top-0 left-0 bottom-0 transition-all duration-500"
        style={{
          width: `${ratio * 100}%`,
          background: `linear-gradient(90deg, ${accent}00 0%, ${accent} 70%, #ffffff 100%)`,
          boxShadow: `0 0 14px ${accent}cc`,
        }}
      />
    </div>
  );
}

// ================================================================
// Concept View — 블록 카드 렌더링
// ================================================================

function ConceptView({
  blocks,
  accent,
}: {
  blocks: LessonBlock[];
  accent: string;
}) {
  return (
    <div className="space-y-5 md:space-y-6">
      {blocks.map((b, i) => (
        <BlockCard key={i} block={b} accent={accent} />
      ))}
    </div>
  );
}

function LessonRichText({ text }: { text: string }): ReactNode {
  return text.split(/(\[[^\]]+\])/g).map((part, idx) => {
    const match = /^\[([^\]]+)\]$/.exec(part);
    if (!match) return part;

    const term = GLOSSARY_TERMS[match[1]];
    if (!term) return part;

    return (
      <GlossaryKeyword
        key={`${match[1]}-${idx}`}
        label={match[1]}
        term={term}
        buttonClassName="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 align-baseline font-bold text-neon underline decoration-dotted underline-offset-4 transition hover:bg-neon/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon"
      />
    );
  });
}

function BlockCard({ block, accent }: { block: LessonBlock; accent: string }) {
  switch (block.kind) {
    case 'intro':
      return (
        <div
          className="relative rounded-[20px] p-6 md:p-7"
          style={{
            background:
              'linear-gradient(180deg, rgba(103,232,249,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            border: `1px solid ${accent}33`,
            boxShadow: `0 12px 30px -20px ${accent}80`,
          }}
        >
          <div
            aria-hidden
            className="absolute -top-3 left-6 px-2 py-0.5 kr-heading text-[9px] uppercase tracking-widest rounded-full"
            style={{
              color: accent,
              background: '#0a1024',
              border: `1px solid ${accent}55`,
            }}
          >
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={10} strokeWidth={2.6} /> Intro
            </span>
          </div>
          <p className="kr-body text-[14.5px] md:text-[15.5px] leading-[1.85] text-cream/90">
            <LessonRichText text={block.body} />
          </p>
        </div>
      );
    case 'section':
      return (
        <div className="rounded-[20px] p-6 md:p-7 liquid-glass">
          <h3 className="kr-heading uppercase text-[15px] md:text-[17px] tracking-[0.02em] leading-[1.3] mb-3">
            {block.title}
          </h3>
          <p className="kr-body text-[14px] md:text-[14.5px] leading-[1.8] text-cream/85 whitespace-pre-line">
            <LessonRichText text={block.body} />
          </p>
        </div>
      );
    case 'keypoints':
      return (
        <div className="rounded-[20px] p-6 md:p-7 liquid-glass">
          {block.title ? (
            <h3 className="kr-heading uppercase text-[13px] md:text-[15px] tracking-[0.02em] mb-4 inline-flex items-center gap-2">
              <CheckCircle2
                size={14}
                strokeWidth={2.4}
                style={{ color: accent }}
              />
              {block.title}
            </h3>
          ) : null}
          <ul className="space-y-2.5">
            {block.items.map((item, i) => (
              <li
                key={i}
                className="kr-body text-[13.5px] md:text-[14.5px] leading-[1.75] text-cream/85 pl-6 relative"
              >
                <span
                  className="absolute left-0 top-[0.65em] w-1.5 h-1.5 rounded-full"
                  style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
                />
                <LessonRichText text={item} />
              </li>
            ))}
          </ul>
        </div>
      );
    case 'table':
      return (
        <div className="rounded-[20px] p-5 md:p-6 liquid-glass">
          {block.title ? (
            <h3 className="kr-heading uppercase text-[13px] md:text-[15px] tracking-[0.02em] mb-3">
              {block.title}
            </h3>
          ) : null}
          <div className="overflow-x-auto -mx-1">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  {block.headers.map((h, i) => (
                    <th
                      key={i}
                      className="kr-heading uppercase text-[10.5px] tracking-widest py-2 px-3 border-b text-cream/70"
                      style={{ borderColor: 'rgba(239,244,255,0.18)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr
                    key={ri}
                    style={{
                      background:
                        ri % 2 === 0
                          ? 'transparent'
                          : 'rgba(239,244,255,0.03)',
                    }}
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="kr-body text-[12.5px] md:text-[13.5px] leading-[1.6] py-2.5 px-3 align-top text-cream/85"
                        style={{
                          borderBottom:
                            ri < block.rows.length - 1
                              ? '1px solid rgba(239,244,255,0.08)'
                              : 'none',
                          color: ci === 0 ? 'var(--cream)' : undefined,
                          fontWeight: ci === 0 ? 600 : undefined,
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case 'example':
      return (
        <div
          className="rounded-[20px] p-6 md:p-7"
          style={{
            background: 'rgba(251, 191, 36, 0.06)',
            border: '1px solid rgba(251, 191, 36, 0.28)',
          }}
        >
          <h3 className="kr-heading uppercase text-[11.5px] tracking-widest mb-2 inline-flex items-center gap-2 text-[#fbbf24]">
            <Sparkles size={12} strokeWidth={2.6} />
            {block.title ?? '예시'}
          </h3>
          <p className="kr-body text-[13.5px] md:text-[14.5px] leading-[1.8] text-cream/88">
            <LessonRichText text={block.body} />
          </p>
        </div>
      );
    case 'callout': {
      const toneMap = {
        mnemonic: {
          color: 'var(--neon)',
          bg: 'var(--neon-08)',
          border: 'var(--neon-35)',
          label: '암기법',
          Icon: Brain,
        },
        tip: {
          color: '#67e8f9',
          bg: 'rgba(103,232,249,0.08)',
          border: 'rgba(103,232,249,0.35)',
          label: 'TIP',
          Icon: Lightbulb,
        },
        warn: {
          color: '#f87171',
          bg: 'rgba(248,113,113,0.08)',
          border: 'rgba(248,113,113,0.35)',
          label: '주의',
          Icon: Flame,
        },
      } as const;
      const t = toneMap[block.tone];
      const { Icon } = t;
      return (
        <div
          className="rounded-[20px] p-6 md:p-7 relative overflow-hidden"
          style={{ background: t.bg, border: `1px solid ${t.border}` }}
        >
          <div
            aria-hidden
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ background: t.color, boxShadow: `0 0 14px ${t.color}` }}
          />
          <div className="pl-2">
            <div
              className="kr-heading uppercase text-[10.5px] tracking-widest mb-1.5 inline-flex items-center gap-1.5"
              style={{ color: t.color }}
            >
              <Icon size={12} strokeWidth={2.6} />
              {t.label}
            </div>
            <h4 className="kr-heading text-[14.5px] md:text-[16px] leading-[1.35] mb-2">
              {block.title}
            </h4>
            <p className="kr-body text-[13.5px] md:text-[14px] leading-[1.8] text-cream/85">
              <LessonRichText text={block.body} />
            </p>
          </div>
        </div>
      );
    }
  }
}

// ================================================================
// Quiz View — 4지선다 + 즉시 채점
// ================================================================

interface QuizViewProps {
  question: MultipleChoiceQuestion;
  saved?: { chosen: number; correct: boolean };
  onChoose: (idx: number) => void;
}

function QuizView({ question, saved, onChoose }: QuizViewProps) {
  const isOrderingQuestion = isSqlOrderingQuestion(question);

  return (
    <div className={isOrderingQuestion ? 'space-y-2.5' : 'space-y-4'}>
      {/* 문항 */}
      <div
        className={
          isOrderingQuestion
            ? 'rounded-[16px] p-3 md:p-4'
            : 'rounded-[20px] p-6 md:p-7'
        }
        style={{
          background: 'rgba(251,191,36,0.05)',
          border: '1px solid rgba(251,191,36,0.28)',
        }}
      >
        <div
          className={
            'kr-heading uppercase tracking-widest text-[#fbbf24] inline-flex items-center gap-1.5 ' +
            (isOrderingQuestion ? 'mb-1.5 text-[9.5px]' : 'mb-2 text-[10.5px]')
          }
        >
          <Trophy size={12} strokeWidth={2.6} />
          예제
        </div>
        <p
          className={
            'kr-body text-cream/95 whitespace-pre-line ' +
            (isOrderingQuestion
              ? 'text-[12.5px] md:text-[13.5px] leading-[1.45]'
              : 'text-[15px] md:text-[16px] leading-[1.7]')
          }
        >
          {question.question}
        </p>
        {!isOrderingQuestion ? (
          <SqlQuestionContextCard
            context={question.sqlContext}
            revealed={!!saved}
            className="mt-4"
          />
        ) : null}
      </div>

      {isOrderingQuestion ? (
        <SqlOrderingPanel question={question} saved={saved} onChoose={onChoose} />
      ) : (
        <div className="space-y-2.5">
          {question.choices.map((c, i) => {
            const isChosen = saved?.chosen === i;
            const isAnswer = question.answerIndex === i;
            const revealed = !!saved;
            let state:
              | 'default'
              | 'chosen-correct'
              | 'chosen-wrong'
              | 'answer-reveal'
              | 'dim' = 'default';
            if (revealed) {
              if (isChosen && saved!.correct) state = 'chosen-correct';
              else if (isChosen && !saved!.correct) state = 'chosen-wrong';
              else if (isAnswer) state = 'answer-reveal';
              else state = 'dim';
            }
            const styles = choiceStyle(state);
            return (
              <button
                key={i}
                type="button"
                disabled={revealed}
                onClick={() => onChoose(i)}
                className="w-full text-left rounded-[14px] p-4 md:p-5 transition-all disabled:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-neon"
                style={styles}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="shrink-0 w-7 h-7 rounded-full kr-heading text-[12px] inline-flex items-center justify-center tabular-nums"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      color: 'inherit',
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="kr-body text-[13.5px] md:text-[14.5px] leading-[1.6] flex-1 whitespace-pre-line">
                    {c}
                  </span>
                  {revealed && isAnswer ? (
                    <CheckCircle2 size={18} strokeWidth={2.4} className="shrink-0 text-neon" />
                  ) : null}
                  {revealed && isChosen && !saved!.correct ? (
                    <XCircle size={18} strokeWidth={2.4} className="shrink-0 text-[#f87171]" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 해설 */}
      {saved ? (
        <div
          className="rounded-[20px] p-5 md:p-6"
          style={{
            background: saved.correct
              ? 'var(--neon-08)'
              : 'rgba(248,113,113,0.08)',
            border: `1px solid ${
              saved.correct ? 'var(--neon-35)' : 'rgba(248,113,113,0.35)'
            }`,
          }}
        >
          <div
            className="kr-heading uppercase text-[10.5px] tracking-widest mb-1.5 inline-flex items-center gap-1.5"
            style={{ color: saved.correct ? 'var(--neon)' : '#f87171' }}
          >
            {saved.correct ? (
              <>
                <CheckCircle2 size={12} strokeWidth={2.6} /> 정답
              </>
            ) : (
              <>
                <XCircle size={12} strokeWidth={2.6} /> 오답 ·{' '}
                {sqlOrderingCorrectAnswerText(question)
                  ? '정답 순서'
                  : `정답은 ${question.answerIndex + 1}번`}
              </>
            )}
          </div>
          {question.explanation ? (
            <p className="kr-body text-[13px] md:text-[14px] leading-[1.8] text-cream/88">
              {(() => {
                const e = question.explanation;
                if (typeof e === 'string') return e;
                const parts: string[] = [];
                if (e.core_concept) parts.push(e.core_concept);
                if (e.why_correct) parts.push(`✅ ${e.why_correct}`);
                if (e.why_wrong) {
                  for (const [k, v] of Object.entries(e.why_wrong)) {
                    parts.push(`❌ ${k}번: ${v}`);
                  }
                }
                if (e.tip) parts.push(`💡 ${e.tip}`);
                return parts.join('\n\n');
              })()}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function choiceStyle(
  state:
    | 'default'
    | 'chosen-correct'
    | 'chosen-wrong'
    | 'answer-reveal'
    | 'dim',
): React.CSSProperties {
  switch (state) {
    case 'default':
      return {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(239,244,255,0.12)',
        color: 'var(--cream)',
      };
    case 'chosen-correct':
      return {
        background: 'var(--neon-14)',
        border: '1.5px solid var(--neon)',
        color: '#eaffd0',
        boxShadow: '0 0 0 3px var(--neon-18)',
      };
    case 'chosen-wrong':
      return {
        background: 'rgba(248,113,113,0.12)',
        border: '1.5px solid #f87171',
        color: '#ffdada',
      };
    case 'answer-reveal':
      return {
        background: 'var(--neon-08)',
        border: '1.5px dashed var(--neon-60)',
        color: '#dfffc6',
      };
    case 'dim':
      return {
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(239,244,255,0.07)',
        color: 'rgba(239,244,255,0.45)',
      };
  }
}

// ================================================================
// Primary Button — 3D beveled CTA
// ================================================================

function PrimaryButton({
  onClick,
  label,
  accent,
  icon,
}: {
  onClick: () => void;
  label: string;
  accent: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[18px] px-6 py-5 kr-heading uppercase tracking-[0.04em] text-[14px] md:text-[16px] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon"
      style={{
        color: '#0a1024',
        background: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 48%), linear-gradient(180deg, ${accent} 0%, ${shade(accent)} 100%)`,
        boxShadow: `0 6px 0 -1px rgba(0,0,0,0.55), 0 18px 30px -10px ${accent}99, inset 0 2px 0 rgba(255,255,255,0.5)`,
        border: `2px solid ${accent}`,
      }}
    >
      <span className="inline-flex items-center gap-3">
        {icon}
        {label}
      </span>
    </button>
  );
}

/** 간단한 HEX 어둡게 — "#rrggbb" 만 지원. */
function shade(hex: string): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const r = Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) * 0.75));
  const g = Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) * 0.75));
  const b = Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) * 0.75));
  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

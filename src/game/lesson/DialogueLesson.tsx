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

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppWindow,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Database,
  Eye,
  Layers,
  Server,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Subject } from '@/types/question';
import {
  getChapterSteps,
  getLesson,
  getQuizQuestion,
} from '@/data/lessons';
import { recordSingleAnswer } from '../storage';
import { recordReviewAttempt } from '../forgettingCurve';
import { useProgress } from '../useProgress';
import { consumeEnergy } from '../energy';
import { stepKey, useStepUnlocks } from '../stepUnlocks';
import EnergyBlockModal from '../components/EnergyBlockModal';
import LessonCompleteModal from '../components/LessonCompleteModal';
import Ques from '@/components/mascot/Ques';
import { characterForSubject } from '@/components/mascot/types';
import TopBar from './TopBar';
import SpeechBubble from './SpeechBubble';
import OptionsPanel from './OptionsPanel';
import GlossaryKeyword, { GLOSSARY_TERMS } from './GlossaryKeyword';
import SqlOrderingPanel, {
  isSqlOrderingQuestion,
  sqlOrderingCorrectAnswerText,
} from './SqlOrderingPanel';
import FeedbackSheet from './FeedbackSheet';
import SimilarProblemsPanel from '../components/SimilarProblemsPanel';
import { countSimilarQuestions } from '../similarQuestions';
import PageAmbientBg from '../components/PageAmbientBg';
import StudyPlanContextBar from '../studyPlan/StudyPlanContextBar';
import SqlQuestionContextCard from '../components/SqlQuestionContextCard';
import { getReminder } from '@/data/reminders';
import { PASS_TIER_VISUAL } from '@/types/passes';
import { explanationToText } from '@/types/question';
import { reserveLessonQuestion } from '../serverQuestionSessions';

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
  onBack: (stepIdx?: number) => void;
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
  // ⚡ 차감 정책:
  //  - 처음 푸는 step (questionStats 에 correct 기록 없음) 진입 → 1⚡
  //  - 이미 정답 맞춘 step 재진입 → 차감 X (revisit free)
  //  - review 전용 step (quizId 없음) → 항상 진입 시 1⚡
  //  - 같은 mount 안에서 같은 stepIdx 재방문 (refresh 등) → 추가 차감 X
  //  - 프리미엄/어드민 = RPC 가 ok=true 즉시 반환 → 차감 0
  const consumedStepsRef = useRef<Set<number>>(new Set());
  // progressStore (ProgressStore 객체) 의 latest snapshot 을 ref 에 보관
  // — useEffect 안에서 stale 방지. (line 229 의 진행률 number 와 별개)
  const progressStore = useProgress();
  const progressStoreRef = useRef(progressStore);
  progressStoreRef.current = progressStore;
  // step_unlocks 서버/localStorage set 도 ref — visited dedup 용.
  const lockSnap = useStepUnlocks();
  const lockSnapRef = useRef(lockSnap);
  lockSnapRef.current = lockSnap;
  const [energyBlock, setEnergyBlock] = useState<{ retryAfterSec: number } | null>(null);
  const [quotaBlock, setQuotaBlock] = useState<string | null>(null);
  const [lessonTokens, setLessonTokens] = useState<Record<string, string>>({});
  useEffect(() => {
    if (consumedStepsRef.current.has(stepIdx)) return;
    consumedStepsRef.current.add(stepIdx);

    // 이미 정답 맞춘 step (revisit) — 차감 X
    const currentStep = lesson?.steps[stepIdx];
    const stat = currentStep?.quizId
      ? progressStoreRef.current.questionStats[currentStep.quizId]
      : undefined;
    const alreadySolved = !!stat && (stat.correct ?? 0) > 0;
    if (alreadySolved) return;

    // 이미 visited (한 번 ⚡ 차감하고 진입한 적 있음) — 차감 X
    // step_unlocks 서버 row 가 visit 기록 의미. 서버 unlocked set 에 있으면 차감 X.
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
      // 차감 성공 시에만 visit 기록 (= 서버 step_unlocks insert / localStorage 추가)
    });
    return () => {
      cancelled = true;
    };
  }, [stepIdx, lesson]);
  // 비슷한 문제 패널 (FeedbackSheet 위로 슬라이드업) 노출 여부.
  const [similarOpen, setSimilarOpen] = useState(false);
  // 북마크 카드에서 점프해온 경우 narration 스킵 → 곧장 question phase 로.
  // sessionStorage 의 'questdp.pendingLessonPhase' 가 'question' 이면 한 번만 소비.
  const initialPhase = ((): Phase => {
    if (typeof window === 'undefined') return 'narrate';
    try {
      const v = window.sessionStorage.getItem('questdp.pendingLessonPhase');
      if (v === 'question') {
        window.sessionStorage.removeItem('questdp.pendingLessonPhase');
        return 'question';
      }
    } catch {
      /* 무시 */
    }
    return 'narrate';
  })();
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [chosen, setChosen] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [quizIdx, setQuizIdx] = useState(0);
  // 회독 진입 시 reminder 카드 노출 여부. true 면 카드 화면, false 면 본 학습으로 진입.
  // review step (id 끝이 `-review`) 은 첫 진입에도 강제로 카드 노출.
  // 단, 북마크 점프 (initialPhase='question') 인 경우엔 reminder 도 스킵 — 사용자가
  // [문제 풀이] 의도로 진입했으므로 곧장 quiz 화면이 자연스러움.
  const initialStep = lesson?.steps[initialStepIdx ?? 0];
  const initialIsReview = initialStep?.id.endsWith('-review') ?? false;
  const [showReminder, setShowReminder] = useState<boolean>(
    initialPhase === 'question' ? false : isReplay || initialIsReview,
  );
  const startedAtRef = useRef<number>(Date.now());
  const [xpToast, setXpToast] = useState<{ amount: number; key: number } | null>(
    null,
  );
  /** 레슨 내 정답 처리한 step idx 들 — 마지막 스텝 클리어 시 통계 표시용. */
  const [correctStepIdxs, setCorrectStepIdxs] = useState<Set<number>>(
    () => new Set(),
  );
  /** 레슨 마지막 스텝 정답 시 축하 모달. */
  const [showCelebration, setShowCelebration] = useState(false);

  // 스텝이 바뀔 때 상태 초기화 + 질문 타이머 시작
  useEffect(() => {
    setTurnIdx(0);
    setPhase('narrate');
    setChosen(null);
    setCorrect(null);
    setQuizIdx(0);
    setSimilarOpen(false); // 다음 step 진입 시 패널 자동 닫기 (안전망)
    // 새 step 이 review 면 reminder 카드 강제 노출. 그 외엔 isReplay 모드일 때만.
    const nextStep = lesson?.steps[stepIdx];
    const nextIsReview = nextStep?.id.endsWith('-review') ?? false;
    if (isReplay || nextIsReview) setShowReminder(true);
  }, [stepIdx, isReplay, lesson]);

  if (!lesson) {
    return (
      <section className="relative min-h-screen bg-base text-cream flex items-center justify-center px-6">
        <div className="liquid-glass rounded-[20px] p-8 text-center max-w-md">
          <h2 className="kr-heading text-[18px] mb-2">레슨 준비 중</h2>
          <button
            type="button"
            onClick={() => onBack(stepIdx)}
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

  // 그룹 끝 review step — id 가 `-review` 로 끝나면 무조건 2회독 UX 강제 (reminder
  // 카드 + 그룹 overview quiz 재사용). 강제 노출은 useEffect/initial state 에서
  // 처리하므로 여기서 별도 분기 불필요.
  const stepQuizIds = [step.quizId, ...(step.extraQuizIds ?? [])].filter(
    (id): id is string => !!id,
  );
  const activeQuizIdx =
    stepQuizIds.length === 0
      ? 0
      : Math.min(quizIdx, stepQuizIds.length - 1);
  const activeQuizId = stepQuizIds[activeQuizIdx];
  const quizQuestion = activeQuizId ? getQuizQuestion(activeQuizId) : null;
  const isOrderingQuestion = quizQuestion
    ? isSqlOrderingQuestion(quizQuestion)
    : false;
  const hasNextQuizInStep = activeQuizIdx < stepQuizIds.length - 1;

  // ── Sub-step group trail ─────────────────────────────────────────────
  // 명시적 step.group 우선. 없으면 id 의 `-s\d+` prefix 가 그룹 키.
  // 같은 그룹의 step 들을 묶어 trail 노출 — 사용자가 "DIKW 5 단계 중 어디" 인지 인지.
  // s4 안에서 DB / DW / DM / Lake 가 4개 그룹으로 분리되도록 group 필드 사용.
  const groupKey = (s: typeof step): string => {
    if (s.group) return s.group;
    const m = s.id.match(/^(.+-s\d+)(?:-[a-zA-Z][a-zA-Z0-9-]*)?$/);
    return m ? m[1] : s.id;
  };
  const currentGroupKey = groupKey(step);
  const groupSteps = lesson.steps.filter(
    (s) => groupKey(s) === currentGroupKey,
  );
  const currentInGroup = groupSteps.findIndex((s) => s.id === step.id);

  const groupTrailLabel = (key: string): string => {
    if (key.includes('g1-basic')) return '기초 진행';
    if (key.includes('g2-features')) return '특징 진행';
    if (key.includes('g3-perspectives')) return '관점 진행';
    if (key.includes('g4-stages')) return '단계 진행';
    if (key.includes('g5-schema')) return '스키마 진행';
    if (key.includes('g6-entity')) return '엔터티 기초 진행';
    if (key.includes('g7-entity-types')) return '엔터티 분류 진행';
    if (key.includes('g8-attributes')) return '속성 분류 진행';
    if (key.includes('g2-entity')) return '엔터티 진행';
    if (key.includes('g3-attr-rel')) return '속성·관계 진행';
    if (key.includes('g4-identifier')) return '식별자 진행';
    if (key.includes('query-basics')) return 'SQL 기초 진행';
    if (key.includes('functions')) return '함수 진행';
    if (key.includes('filter-sort')) return '조건·정렬 진행';
    if (key.includes('joins')) return 'JOIN 진행';
    if (key.includes('subqueries')) return '서브쿼리 진행';
    if (key.includes('set-group')) return '집합·그룹 진행';
    if (key.includes('window-apps')) return '윈도우 진행';
    if (key.includes('regex')) return '정규식 진행';
    if (key.includes('g1-dml')) return 'DML 진행';
    if (key.includes('transaction')) return '트랜잭션 진행';
    if (key.includes('ddl-constraints')) return 'DDL 진행';
    if (key.includes('g4-dcl')) return '권한 진행';
    return '개념 진행';
  };
  const trailLabel = groupTrailLabel(currentGroupKey);
  const shouldShowGroupTrail =
    groupSteps.length > 1 ||
    currentGroupKey.includes('g1-basic') ||
    currentGroupKey.startsWith('sqld-2-');
  const trailSectionLabel = (stepId: string): string | null => {
    if (!currentGroupKey.includes('g8-attributes')) return null;
    if (stepId === 'sqld-1-1-s6') return '속성 기초';
    if (stepId === 'sqld-1-1-s6-origin') return '특성에 따른 분류';
    if (stepId === 'sqld-1-1-s6-shape') return '분해·값 개수에 따른 분류';
    if (stepId === 'sqld-1-1-s6-role') return '구성 방식에 따른 분류';
    return null;
  };
  const entityTypeDiagramMode = (() => {
    if (phase !== 'narrate' || step.id !== 'sqld-1-1-s5-kind') return null;
    if (turnIdx < 1) return null;
    if (turnIdx <= 2) return 'type';
    if (turnIdx <= 4) return 'concept';
    if (turnIdx <= 6) return 'event';
    return 'all';
  })();
  const schemaDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    if (step.id === 'sqld-1-1-s3') {
      if (turnIdx < 1) return null;
      return 'overview';
    }
    if (step.id === 'sqld-1-1-s3a') return 'external';
    if (step.id === 'sqld-1-1-s3b') return 'conceptual';
    if (step.id === 'sqld-1-1-s3c') return 'internal';
    if (step.id === 'sqld-1-1-s3d') {
      if (turnIdx < 2) return 'overview';
      if (turnIdx <= 3) return 'logical';
      if (turnIdx <= 5) return 'physical';
      return 'overview';
    }
    return null;
  })();
  const relationshipDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    if (step.id === 'sqld-1-1-s7-cardinality') {
      if (turnIdx < 3) return null;
      if (turnIdx <= 4) return 'notation';
      return 'example';
    }
    if (step.id === 'sqld-1-1-s7-erd-order') {
      if (turnIdx < 1) return null;
      return 'order';
    }
    return null;
  })();
  const identifierRelationshipDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    if (step.id === 'sqld-1-1-s9') {
      if (turnIdx < 1) return null;
      return 'identifying';
    }
    if (step.id === 'sqld-1-1-s9-nonident') {
      if (turnIdx < 1) return null;
      return 'nonidentifying';
    }
    if (step.id === 'sqld-1-1-s9-compare') {
      if (turnIdx < 1) return null;
      return 'compare';
    }
    return null;
  })();

  // step.title 에서 trail 라벨 추출 — ' — ' 와 ' (' 앞부분만.
  // 예: 'DIKW ① 데이터 (Data) — raw 값' → 'DIKW ① 데이터'
  const shortLabel = (title: string): string => {
    let s = title.split(' — ')[0];
    s = s.split(' (')[0];
    return s.trim();
  };

  // 진행도: 챕터 전체 대비 (현재 스텝 + phase 진척률)
  const chapterIdx = topicOffset + stepIdx;
  const chapterTotal = chapterSteps.length;
  // turnIdx + 1 — 첫 turn 에서도 step bar 가 살짝 차게 (1/N+1 ≈ 8%).
  // 0/N+1 = 0% 라 width 0 이라 사용자가 'step bar 가 안 보임' 으로 인지하던 문제.
  const innerProgress =
    phase === 'narrate' && hasDialogue
      ? (turnIdx + 1) / (dialogue.length + 1)
      : phase === 'question'
        ? dialogue.length / (dialogue.length + 1)
        : 1;
  const progress =
    chapterTotal === 0
      ? 0
      : (chapterIdx + innerProgress) / chapterTotal;

  // --- handlers ---
  const reserveQuiz = async (questionId: string): Promise<boolean> => {
    if (lessonTokens[questionId]) return true;
    const sk = lesson ? stepKey(lesson.id, stepIdx) : null;
    const reservation = await reserveLessonQuestion({
      questionId,
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
      return false;
    }
    setLessonTokens((tokens) => ({
      ...tokens,
      [questionId]: reservation.sessionToken,
    }));
    return true;
  };

  const reserveCurrentQuiz = async (): Promise<boolean> => {
    if (!quizQuestion) return true;
    return reserveQuiz(quizQuestion.id);
  };

  const handleAdvanceNarrative = async () => {
    if (turnIdx < dialogue.length - 1) {
      setTurnIdx(turnIdx + 1);
      return;
    }
    // 마지막 대사 → 질문으로 (quizId 없는 step 은 그냥 다음 step 진행)
    if (!quizQuestion) {
      handleNextStep();
      return;
    }
    const reserved = await reserveCurrentQuiz();
    if (!reserved) return;
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
    const xp = recordSingleAnswer(
      quizQuestion.id,
      ok,
      timeMs,
      lesson ? stepKey(lesson.id, stepIdx) : null,
      idx,
      lessonTokens[quizQuestion.id] ?? null,
    );
    // Phase 4 Step 4 — SM-2 망각 곡선 시스템에도 풀이 결과 반영.
    // onboarding 완료 사용자만 작동 (게스트는 no-op).
    void recordReviewAttempt(quizQuestion.id, ok, new Date());
    setPhase('feedback');
    // 잠금 결정은 prevSolved (이전 step 정답 cross-check) 로만 — 별도 unlock RPC X.
    // 다음 step 진입 시 mount useEffect 가 ⚡ 차감 + visit 기록 알아서 처리.
    if (xp > 0) {
      setXpToast({ amount: xp, key: Date.now() });
      window.setTimeout(() => setXpToast(null), 1800);
    }
    if (ok) {
      setCorrectStepIdxs((s) => {
        if (s.has(stepIdx)) return s;
        const next = new Set(s);
        next.add(stepIdx);
        return next;
      });
      // 마지막 스텝 정답 → 축하 모달 (1.4 초 후 — feedback 메시지 읽을 시간 확보).
      // single-step 모드는 한 step 만 풀고 Zone 복귀 의도라 skip.
      if (
        !isSingleStep &&
        lesson &&
        stepIdx === lesson.steps.length - 1 &&
        !hasNextQuizInStep
      ) {
        window.setTimeout(() => setShowCelebration(true), 1400);
      }
    }
  };

  const handleNextQuestionInStep = async () => {
    const nextQuizIdx = activeQuizIdx + 1;
    const nextQuizId = stepQuizIds[nextQuizIdx];
    if (!nextQuizId) {
      handleNextStep();
      return;
    }
    const reserved = await reserveQuiz(nextQuizId);
    if (!reserved) return;
    setQuizIdx(nextQuizIdx);
    setChosen(null);
    setCorrect(null);
    setSimilarOpen(false);
    startedAtRef.current = Date.now();
    setPhase('question');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleNextStep = () => {
    if (stepIdx < lesson.steps.length - 1) {
      const nextIdx = stepIdx + 1;
      // 잠금은 prevSolved 로만 결정 — 별도 unlock 호출 X.
      // 다음 step mount useEffect 가 ⚡ 차감 + visit 기록 처리.
      setStepIdx(nextIdx);
      window.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      // 마지막 step — single-step 모드는 Zone 복귀, legacy 는 실전 세트.
      if (isSingleStep) {
        onBack(stepIdx);
      } else {
        onFinishGoToPractice();
      }
    }
  };

  const handleBackToZone = () => {
    onBack(stepIdx);
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
          questionId={step.quizId}
          accent={visual.color}
          onExit={() => onBack(stepIdx)}
        />
        <div className="flex-1 flex flex-col items-center justify-center px-5 md:px-8 py-10 max-w-[640px] mx-auto w-full">
          <div className="mb-5">
            <Ques
              pose={passNumber === 2 ? 'think' : 'lightbulb'}
              character={characterForSubject(subject)}
              size={120}
              priority
            />
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
          <h2 className="kr-heading text-[24px] md:text-[28px] lg:text-[32px] text-center mb-3 leading-[1.2]">
            {reminder?.headline ?? `${step.title}, 기억나?`}
          </h2>
          {reminder ? (
            <>
              <p className="kr-body text-[14px] md:text-[15px] lg:text-[16px] text-cream/80 text-center leading-[1.65] mb-5 max-w-[480px] lg:max-w-[560px]">
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
              onClick={async () => {
                setShowReminder(false);
                // quiz 없는 step (드물게) → 바로 다음 step. 일반/review 는 곧장 문제로.
                if (!quizQuestion) {
                  handleNextStep();
                  return;
                }
                const reserved = await reserveCurrentQuiz();
                if (!reserved) return;
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
              {quizQuestion ? '확인했어 · 문제 풀기' : '확인했어 · 다음 스텝'}
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
            window.location.href = '/#pricing';
            window.setTimeout(() => {
              document
                .getElementById('pricing')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 250);
          }}
        />
      ) : null}
      {showCelebration && lesson ? (
        <LessonCompleteModal
          subject={subject}
          chapter={chapter}
          topic={topic}
          totalSteps={lesson.steps.length}
          correctSteps={correctStepIdxs.size}
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
      <TopBar
        progress={progress}
        questionId={quizQuestion?.id ?? step.quizId}
        accent={subject === 'sqld' ? '#c084fc' : '#67e8f9'}
        onExit={() => onBack(stepIdx)}
      />
      {/*
        Phase 4 Step 3 작업 B — "이번 주 목표" 컨텍스트 띠.
        plan 이 본 lesson chapter 와 일치할 때만 표시 (자유 진입 사용자에게는 숨김).
      */}
      <StudyPlanContextBar subject={subject} chapter={chapter} topic={topic} />

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

      <main
        className={
          'flex-1 mx-auto w-full max-w-[820px] lg:max-w-[1000px] xl:max-w-[1180px] px-5 md:px-8 lg:px-12 xl:px-16 pb-36 ' +
          (isOrderingQuestion && phase !== 'narrate'
            ? 'pt-2 lg:pt-5'
            : 'pt-6 lg:pt-10')
        }
      >
        {/* 캐릭터 + 말풍선 영역 */}
          <div
            className={
            (isOrderingQuestion && phase !== 'narrate'
              ? 'flex gap-2 md:gap-4 '
              : 'flex gap-4 md:gap-6 ') +
            (bubblePlacement === 'top'
              ? 'flex-col items-center'
              : 'items-start')
          }
        >
          <div className="shrink-0">
            <Ques
              pose={questPose}
              character={characterForSubject(subject)}
              size={isMobile ? 152 : 196}
              priority
            />
          </div>
          <div
            className={
              'flex-1 w-full ' +
              (isOrderingQuestion && phase !== 'narrate' ? 'pt-0' : 'pt-2')
            }
          >
            {bubbleText ? (
              <SpeechBubble
                text={bubbleText}
                placement={bubblePlacement}
              />
            ) : null}
            {(phase === 'question' || phase === 'feedback') &&
            quizQuestion?.sqlContext &&
            !isOrderingQuestion ? (
              <SqlQuestionContextCard
                context={quizQuestion.sqlContext}
                revealed={phase === 'feedback'}
                className="mt-4"
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

        {/*
          Sub-step trail — 그룹 안 단계 (DIKW 5단계 등) 세로 배치.
          narrate 단계만 노출 (문제 풀 때는 선지가 우선이라 숨김).
          그룹 step 1개뿐이면 기본적으로 숨김. 단, SQLD 첫 기초 그룹처럼
          시작 맥락이 필요한 경우에는 짧은 1/1 트레일로 노출.

          시각:
            ✓ DIKW 피라미드        ← 완료
            ✓ DIKW ① 데이터        ← 완료
            ● DIKW ② 정보  [현재]  ← 현재 (subject-accent 강조 + dot 더 큼)
            ○ DIKW ③ 지식         ← 미진행
            ○ DIKW ④ 지혜         ← 미진행
        */}
        {phase === 'narrate' &&
        shouldShowGroupTrail &&
        !schemaDiagramMode &&
        !entityTypeDiagramMode &&
        !relationshipDiagramMode &&
        !identifierRelationshipDiagramMode ? (
          <nav
            aria-label={trailLabel}
            className="mt-10 max-w-[420px] mx-auto"
          >
            <div
              className="kr-num text-[10px] uppercase tracking-[0.18em] mb-3.5"
              style={{ color: 'rgba(239,244,255,0.45)' }}
            >
              {trailLabel} · {currentInGroup + 1} / {groupSteps.length}
            </div>
            <ol className="flex flex-col gap-6 md:gap-5 list-none p-0 m-0 relative">
              {/*
                좌측 세로 가이드 라인 — 마커 뒤(z-0) 에 깔리고, 마커는 z-10 + solid
                background (var(--base) = #010828) 로 라인을 가림. gap 이 늘어나도
                top/bottom 은 마커 반지름(7px)+여유 정도로 두면 라인이 마커 사이만
                채움.
              */}
              <span
                aria-hidden
                className="absolute top-3 bottom-3 left-[7px] w-px z-0"
                style={{ background: 'rgba(239,244,255,0.08)' }}
              />
              {groupSteps.map((s, i) => {
                const completed = i < currentInGroup;
                const current = i === currentInGroup;
                const label = shortLabel(s.title);
                const sectionLabel = trailSectionLabel(s.id);
                return (
                  <Fragment key={s.id}>
                    {sectionLabel ? (
                      <li
                        aria-hidden="true"
                        className="relative z-10 ml-[26px] -mb-2 mt-1"
                      >
                        <span className="kr-num inline-flex rounded-full border border-cream/10 bg-[#06112a]/95 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-cream/42 shadow-[0_0_0_3px_var(--base,#010828)]">
                          {sectionLabel}
                        </span>
                      </li>
                    ) : null}
                    <li
                      className="flex items-center gap-3 relative"
                      aria-current={current ? 'step' : undefined}
                    >
                      {/* 좌측 마커 — 완료/현재/미진행 */}
                      <span
                        aria-hidden
                        className="shrink-0 inline-flex items-center justify-center rounded-full relative z-10 transition-all"
                        style={{
                          width: current ? 16 : 14,
                          height: current ? 16 : 14,
                          // background 를 base 색 (#010828) 으로 깔고 그 위에 색상 layer
                          // → 라인이 마커 뒤에서 잘려 보임. 이전엔 alpha 0.18 등으로
                          //   투명도가 있어 라인이 뚫고 보였음.
                          background: current
                            ? 'var(--subject-accent)'
                            : completed
                              ? 'linear-gradient(#010828, #010828) padding-box, var(--neon-22) border-box'
                              : 'linear-gradient(#010828, #010828) padding-box, rgba(239,244,255,0.06) border-box',
                          border: current
                            ? '2px solid var(--subject-accent)'
                            : completed
                              ? '1.5px solid var(--neon-55)'
                              : '1.5px solid rgba(239,244,255,0.22)',
                          boxShadow: current
                            ? '0 0 12px var(--subject-accent), 0 0 0 3px rgba(1,8,40,1)'
                            : `0 0 0 3px var(--base, #010828)`,
                          color: completed ? 'var(--neon)' : 'transparent',
                        }}
                      >
                        {completed ? (
                          <Check size={9} strokeWidth={3.4} />
                        ) : null}
                      </span>

                      {/* 라벨 */}
                      <span
                        title={s.title}
                        className="kr-body text-[12.5px] leading-tight flex-1"
                        style={{
                          color: current
                            ? 'var(--subject-accent)'
                            : completed
                              ? 'rgba(239,244,255,0.85)'
                              : 'rgba(239,244,255,0.5)',
                          fontWeight: current ? 700 : completed ? 500 : 400,
                        }}
                      >
                        {label}
                      </span>

                      {/* 우측 — 현재일 때만 progress % */}
                      {current ? (
                        <span
                          className="kr-num text-[10px] tabular-nums shrink-0"
                          style={{ color: 'var(--subject-accent)' }}
                        >
                          {Math.round(innerProgress * 100)}%
                        </span>
                      ) : null}
                    </li>
                  </Fragment>
                );
              })}
            </ol>
          </nav>
        ) : null}

        {schemaDiagramMode ? (
          <AnsiSparcSchemaDiagram mode={schemaDiagramMode} />
        ) : null}

        {entityTypeDiagramMode ? (
          <EntityTypeErdDiagram mode={entityTypeDiagramMode} />
        ) : null}

        {relationshipDiagramMode ? (
          <RelationshipErdDiagram mode={relationshipDiagramMode} />
        ) : null}

        {identifierRelationshipDiagramMode ? (
          <IdentifierRelationshipDiagram mode={identifierRelationshipDiagramMode} />
        ) : null}

        {/* question / feedback 단계 — 4지선다 또는 SQL 순서 조립 */}
        {(phase === 'question' || phase === 'feedback') && quizQuestion ? (
          <div className={isOrderingQuestion ? 'mt-3' : 'mt-8'}>
            {phase === 'question' ? (
              <div className={isOrderingQuestion ? 'flex justify-start mb-2' : 'flex justify-start mb-4'}>
                <button
                  type="button"
                  onClick={handleGoPrev}
                  aria-label="대사로 돌아가기"
                  className={
                    'kr-heading uppercase tracking-widest rounded-full inline-flex items-center gap-1.5 transition liquid-glass hover:bg-white/10 ' +
                    (isOrderingQuestion
                      ? 'text-[10px] px-2.5 py-1.5'
                      : 'text-[11px] md:text-[12px] px-3.5 py-2')
                  }
                >
                  <ChevronLeft size={13} strokeWidth={2.6} />
                  대사 다시 보기
                </button>
              </div>
            ) : null}
            {isSqlOrderingQuestion(quizQuestion) ? (
              <SqlOrderingPanel
                question={quizQuestion}
                saved={
                  phase === 'feedback' && correct !== null && chosen !== null
                    ? { chosen, correct }
                    : undefined
                }
                onChoose={handleChoose}
              />
            ) : (
              <OptionsPanel
                choices={quizQuestion.choices}
                chosen={chosen}
                correctIndex={
                  phase === 'feedback' ? quizQuestion.answerIndex : null
                }
                graded={phase === 'feedback'}
                onChoose={handleChoose}
              />
            )}
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
            if (hasNextQuizInStep) {
              ctaLabel = '다음 SQL 문제';
              onContinue = () => {
                void handleNextQuestionInStep();
              };
              secondaryCtaLabel = '나가기';
              onSecondary = handleBackToZone;
            } else if (hasNext) {
              ctaLabel = '다음 단계';
              onContinue = handleNextStep;
              secondaryCtaLabel = '← 돌아가기';
              onSecondary = handleBackToZone;
            } else if (isSingleStep) {
              ctaLabel = '존으로 돌아가기';
              onContinue = handleBackToZone;
            } else {
              ctaLabel = '실전 세트로';
              onContinue = handleNextStep;
              secondaryCtaLabel = '← 돌아가기';
              onSecondary = handleBackToZone;
            }
            return (
              <FeedbackSheet
                correct={correct}
                explanation={explanationToText(quizQuestion.explanation)}
                correctAnswerText={
                  !correct
                    ? sqlOrderingCorrectAnswerText(quizQuestion) ??
                      quizQuestion.choices[quizQuestion.answerIndex]
                    : undefined
                }
                ctaLabel={ctaLabel}
                onContinue={onContinue}
                secondaryCtaLabel={secondaryCtaLabel}
                onSecondary={onSecondary}
                onSimilarProblems={() => setSimilarOpen(true)}
                similarCount={countSimilarQuestions(quizQuestion.id)}
              />
            );
          })()
        : null}

      {/* 비슷한 문제 더 풀기 — 하단 슬라이드업 모달시트 */}
      {similarOpen && quizQuestion ? (
        <SimilarProblemsPanel
          currentQuizId={quizQuestion.id}
          accent={subject === 'sqld' ? '#c084fc' : '#67e8f9'}
          onClose={() => setSimilarOpen(false)}
        />
      ) : null}
      {quotaBlock ? (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full border border-cyan-200/30 bg-[#071326]/95 px-4 py-2.5 kr-body text-[12px] font-bold text-cream shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
          {quotaBlock}
        </div>
      ) : null}
    </section>
  );
}

type SchemaDiagramMode =
  | 'overview'
  | 'external'
  | 'conceptual'
  | 'internal'
  | 'logical'
  | 'physical';

function AnsiSparcSchemaDiagram({ mode }: { mode: SchemaDiagramMode }) {
  const isOverview = mode === 'overview';
  const isLogical = mode === 'logical';
  const isPhysical = mode === 'physical';
  const isExternalActive = isOverview || isLogical || mode === 'external';
  const isConceptualActive =
    isOverview || isLogical || isPhysical || mode === 'conceptual';
  const isInternalActive = isOverview || isPhysical || mode === 'internal';
  const isDatabaseActive = isOverview || isPhysical || mode === 'internal';

  return (
    <motion.figure
      key={`ansi-sparc-${mode}`}
      className="mt-5 mx-auto w-full max-w-[560px]"
      aria-label="ANSI/SPARC 3-스키마 구조도"
      initial={{ opacity: 0, y: 16, scale: 0.985, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 330, damping: 30, mass: 0.8 }}
    >
      <div className="relative overflow-hidden rounded-[24px] border border-cream/10 bg-[#050d26]/95 p-3 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
        <div className="grid grid-cols-3 gap-2">
          {['학생 앱', '교수 앱', '관리자 앱'].map((label) => (
            <ApplicationPill key={label} label={label} />
          ))}
        </div>

        <div className="relative mt-3 rounded-[22px] border border-cream/10 bg-white/[0.035] py-3 pl-9 pr-3">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-cream/10 bg-[#071326]/90 px-1.5 py-3 text-center">
            <span className="kr-num text-[10px] font-black tracking-[0.2em] text-cream/58 [writing-mode:vertical-rl]">
              DBMS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <SchemaLayerCard
              title="외부 스키마"
              subtitle="View"
              hint="사용자별 화면"
              Icon={Eye}
              active={isExternalActive}
              compact
            />
            <SchemaLayerCard
              title="외부 스키마"
              subtitle="View"
              hint="필요한 것만"
              Icon={Eye}
              active={isExternalActive}
              compact
            />
          </div>

          <SchemaConnector
            label={isLogical ? '논리적 독립성' : '외부 ↕ 개념'}
            active={isLogical || isExternalActive}
          />

          <SchemaLayerCard
            title="개념 스키마"
            subtitle="Conceptual Schema"
            hint="전체 DB 설계도"
            Icon={Layers}
            active={isConceptualActive}
          />

          <SchemaConnector
            label={isPhysical ? '물리적 독립성' : '개념 ↕ 내부'}
            active={isPhysical || isInternalActive}
          />

          <SchemaLayerCard
            title="내부 스키마"
            subtitle="Internal Schema"
            hint="저장 방식"
            Icon={Server}
            active={isInternalActive}
          />
        </div>

        <SchemaConnector label="내부 ↕ 실제 데이터" active={isDatabaseActive} short />
        <DatabaseCylinder active={isDatabaseActive} />
      </div>
      <figcaption className="sr-only">
        응용 프로그램은 외부 스키마인 View를 통해 DBMS에 접근하고, 개념 스키마는 전체
        데이터베이스 구조를, 내부 스키마는 실제 저장 방식을 나타냅니다.
      </figcaption>
    </motion.figure>
  );
}

function ApplicationPill({ label }: { label: string }) {
  return (
    <div className="flex min-h-10 items-center justify-center gap-1.5 rounded-[14px] border border-cream/10 bg-white/[0.055] px-2">
      <AppWindow size={15} strokeWidth={2.4} className="shrink-0 text-cream/64" />
      <div className="min-w-0">
        <div className="kr-heading truncate text-[11px] leading-none text-cream/92">
          {label}
        </div>
        <div className="kr-num mt-1 truncate text-[8px] font-black uppercase tracking-[0.16em] text-cream/38">
          Application
        </div>
      </div>
    </div>
  );
}

function SchemaLayerCard({
  title,
  subtitle,
  hint,
  Icon,
  active,
  compact = false,
}: {
  title: string;
  subtitle: string;
  hint: string;
  Icon: LucideIcon;
  active: boolean;
  compact?: boolean;
}) {
  const accent = '#c084fc';
  return (
    <motion.div
      className={
        'relative overflow-hidden rounded-[17px] border transition ' +
        (compact ? 'px-3 py-3' : 'px-3.5 py-3.5')
      }
      style={{
        borderColor: active ? `${accent}88` : 'rgba(239,244,255,0.12)',
        background: active
          ? 'linear-gradient(145deg, rgba(35,22,69,0.84), rgba(10,18,48,0.94))'
          : 'rgba(255,255,255,0.04)',
      }}
      animate={{
        scale: active ? 1 : 0.992,
      }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[13px] border"
          style={{
            borderColor: active ? `${accent}66` : 'rgba(239,244,255,0.12)',
            background: active ? `${accent}18` : 'rgba(255,255,255,0.035)',
            color: active ? accent : 'rgba(239,244,255,0.58)',
          }}
          aria-hidden
        >
          <Icon size={18} strokeWidth={2.45} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="kr-heading truncate text-[15px] leading-tight text-cream">
            {title}
          </div>
          <div className="kr-num mt-1 truncate text-[8px] font-black uppercase tracking-[0.16em] text-cream/42">
            {subtitle}
          </div>
        </div>
      </div>
      <div className="kr-body mt-2 text-[11px] font-bold leading-none text-cream/64">
        {hint}
      </div>
    </motion.div>
  );
}

function SchemaConnector({
  label,
  active,
  short = false,
}: {
  label: string;
  active: boolean;
  short?: boolean;
}) {
  const accent = '#c084fc';
  return (
    <div className={'flex flex-col items-center justify-center ' + (short ? 'py-2' : 'py-2.5')}>
      <div
        className={short ? 'h-3 w-px' : 'h-4 w-px'}
        style={{ background: active ? `${accent}80` : 'rgba(239,244,255,0.18)' }}
      />
      <div
        className="kr-num rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em]"
        style={{
          color: active ? '#f3e8ff' : 'rgba(239,244,255,0.46)',
          borderColor: active ? `${accent}66` : 'rgba(239,244,255,0.12)',
          background: active ? `${accent}18` : 'rgba(255,255,255,0.035)',
        }}
      >
        {label}
      </div>
      <div
        className={short ? 'h-3 w-px' : 'h-4 w-px'}
        style={{ background: active ? `${accent}80` : 'rgba(239,244,255,0.18)' }}
      />
    </div>
  );
}

function DatabaseCylinder({ active }: { active: boolean }) {
  const accent = '#c084fc';
  return (
    <div className="flex justify-center pb-1">
      <div
        className="relative h-[74px] w-[156px] rounded-b-[32px] border-x border-b px-4 pt-5 text-center"
        style={{
          borderColor: active ? `${accent}70` : 'rgba(239,244,255,0.16)',
          background: active
            ? 'linear-gradient(180deg, rgba(35,22,69,0.82), rgba(8,16,42,0.96))'
            : 'rgba(255,255,255,0.04)',
        }}
      >
        <div
          className="absolute -top-3 left-[-1px] h-6 w-[calc(100%+2px)] rounded-[999px] border"
          style={{
            borderColor: active ? `${accent}70` : 'rgba(239,244,255,0.16)',
            background: active ? 'rgba(35,22,69,0.98)' : 'rgba(12,20,45,0.98)',
          }}
        />
        <Database
          size={18}
          strokeWidth={2.45}
          className="relative mx-auto mb-1"
          style={{ color: active ? accent : 'rgba(239,244,255,0.56)' }}
          aria-hidden
        />
        <div className="relative kr-heading text-[15px] leading-none text-cream">
          Database
        </div>
        <div className="relative kr-body mt-1 text-[10px] font-bold text-cream/54">
          실제 데이터
        </div>
      </div>
    </div>
  );
}

type EntityDiagramMode = 'type' | 'concept' | 'event' | 'all';

function EntityTypeErdDiagram({ mode }: { mode: EntityDiagramMode }) {
  return (
    <motion.figure
      key={mode}
      className="mt-6 mx-auto w-full max-w-[560px]"
      aria-label="학생, 수강, 과목 엔터티 예시 ERD"
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(7px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 30, mass: 0.82 }}
    >
      {mode === 'all' ? (
        <>
          <div className="md:hidden">
            <MobileEntityTypeErd mode={mode} />
          </div>
          <svg
            viewBox="0 0 760 260"
            role="img"
            className="hidden h-auto w-full md:block"
            aria-labelledby="entity-type-erd-title entity-type-erd-desc"
          >
            <title id="entity-type-erd-title">엔터티 유무형 분류 예시 ERD</title>
            <desc id="entity-type-erd-desc">
              학생은 유형 엔터티, 수강은 사건 엔터티, 과목은 개념 엔터티로 표현한 예시입니다.
            </desc>
            <defs>
              <filter id="erd-soft-shadow" x="-10%" y="-20%" width="120%" height="150%">
                <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000000" floodOpacity="0.18" />
              </filter>
            </defs>

            <rect
              x="8"
              y="8"
              width="744"
              height="244"
              rx="18"
              fill="rgba(1,8,40,0.72)"
              stroke="rgba(239,244,255,0.18)"
              strokeWidth="2"
            />

            <g filter="url(#erd-soft-shadow)">
              <EntityBox x={38} y={44} title="학생" rows={['학번', '생년월일', '이름']} label="유형 엔터티" accent="#c084fc" />
              <EntityBox x={305} y={44} title="수강" rows={['학번', '과목명', '학점']} label="사건 엔터티" accent="#c084fc" />
              <EntityBox x={572} y={44} title="과목" rows={['과목명', '강의실', '교수']} label="개념 엔터티" accent="#c084fc" />
            </g>

            <RelationLine x1={197} x2={305} y={103} left="one" right="many" />
            <RelationLine x1={464} x2={572} y={103} left="many" right="one" />
          </svg>
        </>
      ) : (
        <MobileEntityTypeErd mode={mode} />
      )}
      <figcaption className="sr-only">
        학생은 실제로 존재하는 유형 엔터티, 수강은 발생한 일을 기록하는 사건 엔터티, 과목은 기준으로 구분하는 개념 엔터티입니다.
      </figcaption>
    </motion.figure>
  );
}

function MobileEntityTypeErd({ mode }: { mode: EntityDiagramMode }) {
  const boxes = [
    {
      kind: 'type',
      title: '학생',
      rows: ['학번', '생년월일', '이름'],
      label: '유형 엔터티',
      note: '눈에 보이는 대상',
      instance: '김민지',
      accent: '#c084fc',
      relation: '1 : N',
      Icon: UserRound,
    },
    {
      kind: 'event',
      title: '수강',
      rows: ['학번', '과목명', '학점'],
      label: '사건 엔터티',
      note: '일어난 일을 남긴 기록',
      instance: '김민지의 SQL 기본 수강',
      accent: '#c084fc',
      relation: 'N : 1',
      Icon: ClipboardList,
    },
    {
      kind: 'concept',
      title: '과목',
      rows: ['과목명', '강의실', '교수'],
      label: '개념 엔터티',
      note: '기준으로 나누는 묶음',
      instance: 'SQL 기본',
      accent: '#c084fc',
      relation: null,
      Icon: BookOpen,
    },
  ] as const;
  const displayBoxes =
    mode === 'all'
      ? boxes
      : boxes.filter((box) => box.kind === mode);

  return (
    <div className="space-y-2.5">
      {displayBoxes.map((box, index) => (
        <div key={box.title}>
          <motion.div
            className="relative overflow-hidden rounded-[20px] border p-4"
            style={{
              borderColor: `${box.accent}66`,
              background:
                'linear-gradient(145deg, rgba(12,22,52,0.96) 0%, rgba(5,11,31,0.96) 100%)',
            }}
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 360,
              damping: 32,
              mass: 0.75,
              delay: mode === 'all' ? index * 0.055 : 0.02,
            }}
          >
            <div
              aria-hidden
              className="absolute left-0 top-0 h-full w-1"
              style={{
                background: box.accent,
              }}
            />
            <div className="relative flex items-start justify-between gap-3 border-b border-cream/10 pb-3">
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border"
                  style={{
                    color: box.accent,
                    borderColor: `${box.accent}44`,
                    background: `${box.accent}10`,
                  }}
                  aria-hidden
                >
                  <box.Icon size={20} strokeWidth={2.35} />
                </div>
                <div className="min-w-0">
                  <div className="kr-heading text-[22px] leading-none text-cream">
                    {box.title}
                  </div>
                  <div
                    className="kr-num mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]"
                    style={{
                      color: box.accent,
                      borderColor: `${box.accent}55`,
                      background: `${box.accent}14`,
                    }}
                  >
                    {box.label}
                  </div>
                </div>
              </div>
              <div className="kr-body max-w-[116px] text-right text-[12px] font-bold leading-snug text-cream/70">
                {box.note}
              </div>
            </div>
            <div className="relative mt-3 rounded-[14px] border border-cream/10 bg-white/[0.04] px-3 py-2.5">
              <div className="flex items-center">
                <GlossaryKeyword
                  label="인스턴스 예시"
                  term={GLOSSARY_TERMS['인스턴스']}
                  buttonClassName="kr-num inline-flex items-center gap-1 rounded-full px-0 py-0 text-[9px] font-black uppercase tracking-[0.16em] text-cream/50 underline decoration-dotted underline-offset-4 transition hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c084fc]"
                />
              </div>
              <div className="kr-heading mt-1 text-[14px] leading-snug text-cream">
                {box.instance}
              </div>
            </div>
            <div className="relative mt-3">
              <div className="mb-1.5 flex items-center">
                <GlossaryKeyword
                  label="속성"
                  term={GLOSSARY_TERMS['속성']}
                  buttonClassName="kr-num inline-flex items-center gap-1 rounded-full px-0 py-0 text-[9px] font-black uppercase tracking-[0.16em] text-cream/50 underline decoration-dotted underline-offset-4 transition hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c084fc]"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {box.rows.map((row) => (
                  <div
                    key={row}
                    className="rounded-[12px] border border-cream/10 bg-white/[0.055] px-2 py-2.5 text-center kr-body text-[13px] font-black leading-none text-cream/90"
                  >
                    {row}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          {mode === 'all' && index < displayBoxes.length - 1 ? (
            <motion.div
              className="flex items-center justify-center py-1"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.09 + index * 0.055 }}
            >
              <div className="relative flex flex-col items-center">
                <div
                  className="h-4 w-px"
                  style={{
                    background: 'rgba(192,132,252,0.42)',
                  }}
                />
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full border"
                    style={{
                      borderColor: box.accent,
                      background: 'rgba(192,132,252,0.16)',
                    }}
                  />
                  <div className="kr-num rounded-full border border-cream/15 bg-[#071326]/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cream/72">
                    {box.relation}
                  </div>
                  <span
                    className="h-2.5 w-2.5 rounded-full border"
                    style={{
                      borderColor: displayBoxes[index + 1].accent,
                      background: 'rgba(192,132,252,0.16)',
                    }}
                  />
                </div>
                <div
                  className="h-4 w-px"
                  style={{
                    background: 'rgba(192,132,252,0.42)',
                  }}
                />
              </div>
            </motion.div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

type RelationshipDiagramMode = 'notation' | 'example' | 'order';

function RelationshipErdDiagram({ mode }: { mode: RelationshipDiagramMode }) {
  return (
    <motion.figure
      key={mode}
      className="mt-6 mx-auto w-full max-w-[560px]"
      aria-label="ERD 관계 차수와 선택사양 표기 설명"
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(7px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 30, mass: 0.82 }}
    >
      {mode === 'order' ? (
        <ErdOrderSheet />
      ) : mode === 'notation' ? (
        <RelationshipNotationCards />
      ) : (
        <RelationshipExampleCard />
      )}
      <figcaption className="sr-only">
        ERD 관계 표기와 작성 순서를 설명합니다.
      </figcaption>
    </motion.figure>
  );
}

function ErdOrderSheet() {
  const rows: Array<{
    no: string;
    key: string;
    task: string;
    point: string;
    accent?: boolean;
  }> = [
    {
      no: '1',
      key: '도',
      task: '엔터티 도출',
      point: '관리할 대상 찾기',
    },
    {
      no: '2',
      key: '배',
      task: '엔터티 배치',
      point: '중요 엔터티는 왼쪽 상단',
      accent: true,
    },
    {
      no: '3',
      key: '설',
      task: '관계 설정',
      point: '연결되는 엔터티 잇기',
    },
    {
      no: '4',
      key: '명',
      task: '관계명 기술',
      point: '수강한다, 주문한다',
    },
    {
      no: '5',
      key: '차',
      task: '관계 차수 설정',
      point: '1:1, 1:N, M:N',
    },
    {
      no: '6',
      key: '선',
      task: '필수/선택사양 기술',
      point: '반드시? 없어도 됨?',
    },
  ];

  return (
    <div className="overflow-hidden rounded-[24px] border border-cream/10 bg-[#06122d]/92 p-3.5 shadow-[0_18px_42px_rgba(0,0,0,0.22)]">
      <div className="mb-2.5 flex items-end justify-between gap-3 px-0.5">
        <div>
          <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-cream/38">
            ERD ORDER
          </div>
          <div className="kr-heading mt-1 text-[19px] leading-none text-cream">
            도배설명차선
          </div>
        </div>
        <div className="kr-body text-right text-[11px] font-bold leading-snug text-cream/48">
          작성 순서
        </div>
      </div>

      <div className="mb-2.5 flex flex-wrap gap-1.5">
        {rows.map((row) => (
          <span
            key={`mnemonic-${row.key}`}
            className={
              'grid h-6 min-w-6 place-items-center rounded-full border px-2 kr-heading text-[10.5px] ' +
              (row.accent
                ? 'border-[#c084fc]/45 bg-[#c084fc]/16 text-[#ead7ff]'
                : 'border-cream/10 bg-white/[0.045] text-cream/58')
            }
          >
            {row.key}
          </span>
        ))}
      </div>

      <div className="rounded-[20px] border border-cream/10 bg-[#081632]/82 p-2">
        {rows.map((row, index) => (
          <motion.div
            key={row.no}
            className={
              'grid grid-cols-[34px_1fr] gap-2.5 rounded-[15px] px-2.5 py-2 ' +
              (row.accent ? 'bg-[#c084fc]/12' : index % 2 === 0 ? 'bg-white/[0.045]' : 'bg-transparent')
            }
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: index * 0.04 }}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="kr-num text-[9px] font-black text-cream/34">
                {row.no}
              </span>
              <span
                className={
                  'grid h-7 w-7 place-items-center rounded-full border kr-heading text-[11px] ' +
                  (row.accent
                    ? 'border-[#c084fc]/52 bg-[#c084fc]/16 text-[#ead7ff]'
                    : 'border-cream/12 bg-white/[0.045] text-cream/62')
                }
              >
                {row.key}
              </span>
            </div>
            <div className="min-w-0">
              <div className="kr-heading text-[12.5px] leading-snug text-cream">
                {row.task}
              </div>
              <div className="mt-0.5 kr-body text-[10.5px] font-bold leading-snug text-cream/55">
                {row.point}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-2.5 rounded-[16px] border border-cream/10 bg-white/[0.035] px-3 py-2">
        <div className="kr-body text-[11.5px] font-bold leading-[1.45] text-cream/64">
          배치는 가독성 문제입니다. 핵심 엔터티를 먼저 보이는 위치에 두면 관계선이 덜 꼬입니다.
        </div>
      </div>
    </div>
  );
}

function RelationshipNotationCards() {
  const rows = [
    {
      ratio: '1 : 1',
      option: '필수',
      note: '반드시 하나',
      optional: false,
      many: false,
    },
    {
      ratio: '1 : 1',
      option: '선택',
      note: '없거나 하나',
      optional: true,
      many: false,
    },
    {
      ratio: '1 : N',
      option: '필수',
      note: '하나 이상 가능',
      optional: false,
      many: true,
    },
    {
      ratio: '1 : N',
      option: '선택',
      note: '없거나 여러 개',
      optional: true,
      many: true,
    },
  ] as const;

  return (
    <div className="rounded-[24px] border border-cream/14 bg-[#06122d]/94 p-3.5 shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <div className="kr-num text-[10px] font-black uppercase tracking-[0.18em] text-[#c084fc]">
            ERD SIGNAL
          </div>
          <div className="kr-heading mt-1 text-[19px] leading-none text-cream">
            선 끝 기호
          </div>
        </div>
        <div className="kr-body text-right text-[11px] font-bold leading-snug text-cream/54">
          차수 + 선택사양
        </div>
      </div>

      <div className="grid gap-2.5">
        {rows.map((row, index) => (
          <motion.div
            key={`${row.ratio}-${row.option}`}
            className="rounded-[18px] border border-cream/10 bg-white/[0.045] p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: index * 0.045 }}
          >
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="kr-num rounded-full border border-[#c084fc]/35 bg-[#c084fc]/12 px-2.5 py-1 text-[10px] font-black text-[#d8b4fe]">
                  {row.ratio}
                </span>
                <span className="kr-heading text-[13px] text-cream">
                  {row.option}
                </span>
              </div>
              <span className="kr-body text-[11px] font-bold text-cream/58">
                {row.note}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[14px] border border-cream/10 bg-[#091735]/80 px-2 py-2">
                <div className="kr-num mb-1 text-[9px] font-black uppercase tracking-[0.16em] text-cream/45">
                  IE 표기
                </div>
                <NotationPreview optional={row.optional} many={row.many} />
              </div>
              <div className="rounded-[14px] border border-cream/10 bg-[#091735]/80 px-2 py-2">
                <div className="kr-num mb-1 text-[9px] font-black uppercase tracking-[0.16em] text-cream/45">
                  Barker
                </div>
                <NotationPreview
                  optional={row.optional}
                  many={row.many}
                  dashed={row.optional}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RelationshipExampleCard() {
  return (
    <div className="rounded-[24px] border border-cream/14 bg-[#06122d]/94 p-3.5 shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <div className="kr-num text-[10px] font-black uppercase tracking-[0.18em] text-[#c084fc]">
            EXAMPLE ERD
          </div>
          <div className="kr-heading mt-1 text-[19px] leading-none text-cream">
            학생 ↔ 수강내역
          </div>
        </div>
        <div className="kr-body text-right text-[11px] font-bold leading-snug text-cream/54">
          1명과 0..N건
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_120px_1fr] md:items-center">
        <RelationshipEntityCard
          title="학생"
          caption="반드시 1명"
          rows={['학생ID', '이름', '전화번호', '이메일']}
          Icon={UserRound}
        />
        <div className="rounded-[18px] border border-[#c084fc]/25 bg-[#c084fc]/8 px-3 py-3">
          <div className="kr-num mb-1 text-center text-[9px] font-black uppercase tracking-[0.16em] text-[#d8b4fe]">
            관계
          </div>
          <NotationPreview optional many />
          <div className="mt-1.5 text-center kr-body text-[11px] font-bold leading-snug text-cream/64">
            학생 1명은 수강내역이 없거나 여러 개
          </div>
        </div>
        <RelationshipEntityCard
          title="수강내역"
          caption="0개 이상 가능"
          rows={['학생ID', '과목ID', '학점']}
          Icon={ClipboardList}
        />
      </div>

      <div className="mt-3 rounded-[16px] border border-cream/10 bg-white/[0.04] px-3 py-2.5">
        <div className="kr-body text-[12px] font-bold leading-[1.55] text-cream/76">
          수강내역 한 건은 반드시 학생 한 명에게 속합니다. 반대로 학생은 아직 수강내역이 없을 수도 있고,
          여러 과목을 들으면 수강내역이 여러 건 생길 수 있습니다.
        </div>
      </div>
    </div>
  );
}

function RelationshipEntityCard({
  title,
  caption,
  rows,
  Icon,
}: {
  title: string;
  caption: string;
  rows: string[];
  Icon: LucideIcon;
}) {
  return (
    <div className="rounded-[20px] border border-[#c084fc]/36 bg-[#0b1836]/92 p-3.5">
      <div className="flex items-center justify-between gap-3 border-b border-cream/10 pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[13px] border border-[#c084fc]/35 bg-[#c084fc]/10 text-[#d8b4fe]"
            aria-hidden
          >
            <Icon size={18} strokeWidth={2.45} />
          </div>
          <div className="kr-heading text-[20px] leading-none text-cream">
            {title}
          </div>
        </div>
        <div className="kr-body text-right text-[11px] font-black leading-snug text-cream/56">
          {caption}
        </div>
      </div>
      <div className="mt-3 grid gap-2">
        {rows.map((row) => (
          <div
            key={row}
            className="rounded-[12px] border border-cream/10 bg-white/[0.055] px-3 py-2 text-center kr-body text-[12px] font-black leading-none text-cream/86"
          >
            {row}
          </div>
        ))}
      </div>
    </div>
  );
}

type IdentifierRelationshipMode = 'identifying' | 'nonidentifying' | 'compare';

function IdentifierRelationshipDiagram({
  mode,
}: {
  mode: IdentifierRelationshipMode;
}) {
  return (
    <motion.figure
      className="mt-6 mx-auto w-full max-w-[560px]"
      initial={{ opacity: 0, y: 18, scale: 0.97, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.82 }}
    >
      {mode === 'identifying' ? (
        <IdentifyingRelationCard />
      ) : mode === 'nonidentifying' ? (
        <NonIdentifyingRelationCard />
      ) : (
        <IdentifierCompareCard />
      )}
      <figcaption className="sr-only">
        식별자 관계와 비식별자 관계에서 부모 식별자가 자식 엔터티 안에 들어가는 위치를 비교합니다.
      </figcaption>
    </motion.figure>
  );
}

function IdentifyingRelationCard() {
  return (
    <div className="rounded-[24px] border border-cream/10 bg-[#06122d]/94 p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.24)]">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-[#c084fc]/85">
            IDENTIFYING
          </div>
          <div className="kr-heading mt-1 text-[19px] leading-none text-cream">
            부모 PK가 자식 PK 안으로
          </div>
        </div>
        <div className="kr-body text-right text-[11px] font-black leading-snug text-cream/52">
          강한 연결
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <IdentifierEntityCard
          title="학생"
          caption="부모"
          Icon={UserRound}
          pkRows={['학번']}
          attrRows={['이름']}
        />
        <IdentifierEntityCard
          title="과목"
          caption="부모"
          Icon={BookOpen}
          pkRows={['과목코드']}
          attrRows={['과목명']}
        />
      </div>

      <div className="my-2.5 flex items-center gap-2 px-1">
        <div className="h-px flex-1 bg-[#c084fc]/24" />
        <div className="rounded-full border border-[#c084fc]/28 bg-[#c084fc]/10 px-3 py-1 kr-body text-[11px] font-black text-[#ead7ff]">
          두 부모 키가 합쳐짐
        </div>
        <div className="h-px flex-1 bg-[#c084fc]/24" />
      </div>

      <IdentifierEntityCard
        title="수강신청"
        caption="자식"
        Icon={ClipboardList}
        pkRows={['학번', '과목코드']}
        attrRows={['신청일', '학점']}
        highlightPk
      />

      <div className="mt-3 rounded-[16px] border border-[#c084fc]/18 bg-[#c084fc]/8 px-3 py-2.5">
        <div className="kr-body text-[12px] font-bold leading-[1.55] text-cream/76">
          수강신청은 학생과 과목의 PK를 받아 자기 PK를 완성합니다. 그래서 부모 키가 비어 있으면 수강신청 한 건도 구분할 수 없습니다.
        </div>
      </div>
    </div>
  );
}

function NonIdentifyingRelationCard() {
  return (
    <div className="rounded-[24px] border border-cream/10 bg-[#06122d]/94 p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.24)]">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-cream/42">
            NON IDENTIFYING
          </div>
          <div className="kr-heading mt-1 text-[19px] leading-none text-cream">
            부모 키는 FK로만
          </div>
        </div>
        <div className="kr-body text-right text-[11px] font-black leading-snug text-cream/52">
          약한 연결
        </div>
      </div>

      <IdentifierEntityCard
        title="고객"
        caption="부모"
        Icon={UserRound}
        pkRows={['고객ID']}
        attrRows={['이름']}
      />

      <div className="my-2.5 flex items-center gap-2 px-1">
        <div className="h-px flex-1 border-t border-dashed border-cream/18" />
        <div className="rounded-full border border-cream/12 bg-white/[0.045] px-3 py-1 kr-body text-[11px] font-black text-cream/64">
          참조만 함
        </div>
        <div className="h-px flex-1 border-t border-dashed border-cream/18" />
      </div>

      <IdentifierEntityCard
        title="주문"
        caption="자식"
        Icon={ClipboardList}
        pkRows={['주문ID']}
        attrRows={['고객ID(FK)', '주문일']}
        highlightFk
      />

      <div className="mt-3 rounded-[16px] border border-cream/10 bg-white/[0.04] px-3 py-2.5">
        <div className="kr-body text-[12px] font-bold leading-[1.55] text-cream/72">
          주문은 주문ID만으로 구분됩니다. 고객ID는 고객을 가리키는 FK지만, 주문의 PK 안에는 들어가지 않습니다.
        </div>
      </div>
    </div>
  );
}

function IdentifierCompareCard() {
  return (
    <div className="rounded-[24px] border border-cream/10 bg-[#06122d]/94 p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.24)]">
      <div className="mb-3 px-1">
        <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-cream/42">
          PK POSITION
        </div>
        <div className="kr-heading mt-1 text-[19px] leading-none text-cream">
          기준은 자식 PK 안쪽/바깥쪽
        </div>
      </div>

      <div className="grid gap-2.5">
        <IdentifierRuleRow
          title="식별자 관계"
          badge="PK 안"
          body="부모 PK가 자식 PK의 일부가 됩니다."
          accent
        />
        <IdentifierRuleRow
          title="비식별자 관계"
          badge="PK 밖"
          body="부모 키는 자식의 FK 또는 일반 속성으로만 남습니다."
        />
      </div>
    </div>
  );
}

function IdentifierRuleRow({
  title,
  badge,
  body,
  accent = false,
}: {
  title: string;
  badge: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        'flex items-center gap-3 rounded-[18px] border px-3 py-3 ' +
        (accent
          ? 'border-[#c084fc]/32 bg-[#c084fc]/10'
          : 'border-cream/10 bg-white/[0.045]')
      }
    >
      <div
        className={
          'grid h-12 w-12 shrink-0 place-items-center rounded-[16px] border kr-heading text-[12px] ' +
          (accent
            ? 'border-[#c084fc]/45 bg-[#c084fc]/12 text-[#ead7ff]'
            : 'border-cream/12 bg-white/[0.045] text-cream/58')
        }
      >
        {badge}
      </div>
      <div className="min-w-0">
        <div className="kr-heading text-[14px] leading-snug text-cream">
          {title}
        </div>
        <div className="mt-1 kr-body text-[11.5px] font-bold leading-snug text-cream/62">
          {body}
        </div>
      </div>
    </div>
  );
}

function IdentifierEntityCard({
  title,
  caption,
  pkRows,
  attrRows,
  Icon,
  highlightPk = false,
  highlightFk = false,
}: {
  title: string;
  caption: string;
  pkRows: string[];
  attrRows: string[];
  Icon: LucideIcon;
  highlightPk?: boolean;
  highlightFk?: boolean;
}) {
  return (
    <div className="rounded-[20px] border border-cream/10 bg-[#081632]/88 p-3">
      <div className="flex items-center justify-between gap-2 border-b border-cream/10 pb-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[12px] border border-cream/12 bg-white/[0.045] text-cream/68"
            aria-hidden
          >
            <Icon size={16} strokeWidth={2.4} />
          </div>
          <div className="kr-heading text-[17px] leading-none text-cream">
            {title}
          </div>
        </div>
        <div className="kr-num text-[9px] font-black uppercase tracking-[0.12em] text-cream/38">
          {caption}
        </div>
      </div>

      <div className="mt-2.5 grid gap-1.5">
        <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-cream/40">
          PK
        </div>
        {pkRows.map((row) => (
          <div
            key={`pk-${row}`}
            className={
              'rounded-[12px] border px-2.5 py-2 text-center kr-body text-[12px] font-black leading-none ' +
              (highlightPk
                ? 'border-[#c084fc]/40 bg-[#c084fc]/14 text-[#ead7ff]'
                : 'border-cream/10 bg-white/[0.055] text-cream/86')
            }
          >
            {row}
          </div>
        ))}
      </div>

      <div className="mt-2.5 grid gap-1.5">
        <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-cream/36">
          속성
        </div>
        {attrRows.map((row) => (
          <div
            key={`attr-${row}`}
            className={
              'rounded-[12px] border px-2.5 py-2 text-center kr-body text-[11.5px] font-bold leading-none ' +
              (highlightFk && row.includes('FK')
                ? 'border-[#67e8f9]/30 bg-[#67e8f9]/10 text-[#dffbff]'
                : 'border-cream/10 bg-white/[0.035] text-cream/62')
            }
          >
            {row}
          </div>
        ))}
      </div>
    </div>
  );
}

function NotationPreview({
  optional,
  many,
  dashed = false,
}: {
  optional: boolean;
  many: boolean;
  dashed?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 132 38"
      role="img"
      className="h-9 w-full"
      aria-label={`${optional ? '선택' : '필수'} ${many ? '다' : '일'} 관계 표기`}
    >
      <path
        d="M 12 19 H 118"
        stroke="rgba(239,244,255,0.76)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={dashed ? '7 7' : undefined}
      />
      <path
        d="M 22 8 V 30"
        stroke="#d8b4fe"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {optional ? (
        <circle
          cx="83"
          cy="19"
          r="8"
          fill="#06122d"
          stroke="#d8b4fe"
          strokeWidth="2.5"
        />
      ) : null}
      {many ? (
        <path
          d="M 99 19 L 120 8 M 99 19 L 120 19 M 99 19 L 120 30"
          stroke="#d8b4fe"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M 110 8 V 30"
          stroke="#d8b4fe"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function EntityBox({
  x,
  y,
  title,
  rows,
  label,
  accent,
}: {
  x: number;
  y: number;
  title: string;
  rows: string[];
  label: string;
  accent: string;
}) {
  const width = 150;
  const headerHeight = 36;
  const rowHeight = 28;
  const height = headerHeight + rowHeight * rows.length;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="10"
        fill="rgba(239,244,255,0.94)"
        stroke={accent}
        strokeWidth="2"
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={headerHeight}
        rx="10"
        fill="rgba(255,255,255,0.96)"
      />
      <path
        d={`M ${x} ${y + headerHeight} H ${x + width}`}
        stroke="rgba(1,8,40,0.32)"
        strokeWidth="1.5"
      />
      <text
        x={x + 16}
        y={y + 24}
        fill="#071326"
        fontSize="17"
        fontWeight="800"
        fontFamily="Noto Sans KR, sans-serif"
      >
        {title}
      </text>
      {rows.map((row, index) => {
        const rowY = y + headerHeight + rowHeight * index;
        return (
          <g key={row}>
            {index > 0 ? (
              <path
                d={`M ${x} ${rowY} H ${x + width}`}
                stroke="rgba(1,8,40,0.16)"
                strokeWidth="1"
              />
            ) : null}
            <text
              x={x + 16}
              y={rowY + 20}
              fill="#1b2746"
              fontSize="15"
              fontWeight="650"
              fontFamily="Noto Sans KR, sans-serif"
            >
              {row}
            </text>
          </g>
        );
      })}
      <text
        x={x + width / 2}
        y={y + height + 32}
        textAnchor="middle"
        fill={accent}
        fontSize="18"
        fontWeight="900"
        fontFamily="Noto Sans KR, sans-serif"
      >
        {label}
      </text>
    </g>
  );
}

function RelationLine({
  x1,
  x2,
  y,
  left,
  right,
}: {
  x1: number;
  x2: number;
  y: number;
  left: 'one' | 'many';
  right: 'one' | 'many';
}) {
  const renderEnd = (x: number, side: 'left' | 'right', type: 'one' | 'many') => {
    const dir = side === 'left' ? -1 : 1;
    if (type === 'one') {
      return (
        <g>
          <path
            d={`M ${x + dir * 8} ${y - 18} V ${y + 18}`}
            stroke="rgba(239,244,255,0.88)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      );
    }

    return (
      <g>
        <circle
          cx={x + dir * 10}
          cy={y}
          r="8"
          fill="none"
          stroke="rgba(239,244,255,0.78)"
          strokeWidth="2.5"
        />
        <path
          d={`M ${x + dir * 6} ${y} L ${x + dir * 28} ${y - 17} M ${x + dir * 6} ${y} L ${x + dir * 28} ${y} M ${x + dir * 6} ${y} L ${x + dir * 28} ${y + 17}`}
          stroke="rgba(239,244,255,0.88)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    );
  };

  return (
    <g>
      <path
        d={`M ${x1 + 12} ${y} H ${x2 - 12}`}
        stroke="rgba(239,244,255,0.74)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {renderEnd(x1, 'right', left)}
      {renderEnd(x2, 'left', right)}
    </g>
  );
}

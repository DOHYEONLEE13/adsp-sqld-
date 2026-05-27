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
import type { ReactNode } from 'react';
import { openWebOrAppPremiumEntry } from '@/lib/appMode';
import {
  AlertTriangle,
  AppWindow,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Database,
  Eye,
  Fingerprint,
  KeyRound,
  Layers,
  Link2,
  Music2,
  PencilLine,
  Plus,
  Server,
  ShieldCheck,
  Trash2,
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
    if (key.includes('g1-anomaly')) return '정규화 흐름';
    if (key.includes('g2-fd')) return '함수 종속 진행';
    if (key.includes('g3-normal-forms')) return '정규형 진행';
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
  const dataModelingDiagramMode = (() => {
    if (phase !== 'narrate' || step.id !== 'sqld-1-1-s1') return null;
    if (turnIdx < 1) return null;
    if (turnIdx <= 2) return 'reality';
    if (turnIdx <= 3) return 'modeling';
    return 'schema';
  })();
  const modelFeatureDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    if (step.id === 'sqld-1-1-s1b') {
      if (turnIdx < 1) return null;
      return 'overview';
    }
    if (step.id === 'sqld-1-1-s1c') return 'simple';
    if (step.id === 'sqld-1-1-s1d') return 'abstract';
    if (step.id === 'sqld-1-1-s1e') return 'clear';
    return null;
  })();
  const processPerspectiveDiagramMode = (() => {
    if (phase !== 'narrate' || step.id !== 'sqld-1-1-s1h') return null;
    if (turnIdx < 1) return null;
    return 'flow';
  })();
  const interactionPerspectiveDiagramMode = (() => {
    if (phase !== 'narrate' || step.id !== 'sqld-1-1-s1i') return null;
    if (turnIdx < 1) return null;
    return 'crud';
  })();
  const modelingStageDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    if (step.id === 'sqld-1-1-s2') return 'overview';
    if (step.id === 'sqld-1-1-s2a') return 'conceptual';
    if (step.id === 'sqld-1-1-s2b') return 'logical';
    if (step.id === 'sqld-1-1-s2c') return 'physical';
    return null;
  })();
  const entityTypeDiagramMode = (() => {
    if (phase !== 'narrate' || step.id !== 'sqld-1-1-s5-kind') return null;
    if (turnIdx < 1) return null;
    if (turnIdx <= 2) return 'type';
    if (turnIdx <= 4) return 'concept';
    if (turnIdx <= 6) return 'event';
    return 'all';
  })();
  const attributeDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    if (step.id === 'sqld-1-1-s6') {
      if (turnIdx < 1) return null;
      return 'atom';
    }
    if (step.id === 'sqld-1-1-s6-origin') return 'origin';
    if (step.id === 'sqld-1-1-s6-designed') return 'designed';
    if (step.id === 'sqld-1-1-s6-derived') return 'derived';
    return null;
  })();
  const attributeShapeDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    if (step.id === 'sqld-1-1-s6-shape') return 'single';
    if (step.id === 'sqld-1-1-s6-shape-composite') return 'composite';
    if (step.id === 'sqld-1-1-s6-shape-multivalue') return 'multi';
    return null;
  })();
  const attributeRoleDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    if (step.id === 'sqld-1-1-s6-role') return 'pk';
    if (step.id === 'sqld-1-1-s6-role-fk') return 'fk';
    if (step.id === 'sqld-1-1-s6-role-general') return 'general';
    return null;
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
  const keyIntegrityDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    if (step.id === 'sqld-1-1-s10') {
      if (turnIdx < 1) return null;
      return 'keys';
    }
    if (step.id === 'sqld-1-1-s10-integrity') {
      if (turnIdx < 1) return null;
      return 'integrity';
    }
    if (step.id === 'sqld-1-1-s10-pk-unique') {
      if (turnIdx < 1) return null;
      return 'pkUnique';
    }
    return null;
  })();
  const anomalyDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    if (step.id === 'sqld-1-2-s1') {
      if (turnIdx < 1) return null;
      return 'overview';
    }
    if (step.id === 'sqld-1-2-s1-insert') {
      if (turnIdx < 1) return null;
      return 'insert';
    }
    if (step.id === 'sqld-1-2-s1-delete') {
      if (turnIdx < 1) return null;
      return 'delete';
    }
    if (step.id === 'sqld-1-2-s1-update') {
      if (turnIdx < 1) return null;
      return 'update';
    }
    return null;
  })();
  const functionalDependencyDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    if (step.id === 'sqld-1-2-s2') {
      if (turnIdx < 1) return null;
      return 'basic';
    }
    if (step.id === 'sqld-1-2-s2-full') {
      if (turnIdx < 1) return null;
      return 'full';
    }
    if (step.id === 'sqld-1-2-s2-partial') {
      if (turnIdx < 1) return null;
      return 'partial';
    }
    if (step.id === 'sqld-1-2-s2-transitive') {
      if (turnIdx < 1) return null;
      return 'transitive';
    }
    return null;
  })();
  const normalFormDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    if (step.id === 'sqld-1-2-s3') {
      if (turnIdx < 1) return null;
      return 'roadmap';
    }
    if (step.id === 'sqld-1-2-s3-1nf') return 'oneNf';
    if (step.id === 'sqld-1-2-s3-2nf') return 'twoNf';
    if (step.id === 'sqld-1-2-s3-3nf') return 'threeNf';
    if (step.id === 'sqld-1-2-s3-bcnf') return 'bcnf';
    return null;
  })();
  const denormalizationDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    if (step.id === 'sqld-1-2-s4') return 'overview';
    if (step.id === 'sqld-1-2-s4-methods') return 'methods';
    if (step.id === 'sqld-1-2-s4-tradeoff') return 'tradeoff';
    return null;
  })();
  const specialRelationDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    if (step.id === 'sqld-1-2-s5') return 'overview';
    if (step.id === 'sqld-1-2-s5-hierarchy') return 'hierarchy';
    if (step.id === 'sqld-1-2-s5-exclusive') return 'exclusive';
    return null;
  })();
  const transactionDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    if (step.id === 'sqld-1-2-s6') return 'transfer';
    if (step.id === 'sqld-1-2-s6-acid') return 'acid';
    if (step.id === 'sqld-1-2-s6-isolation') return 'isolation';
    return null;
  })();
  const nullDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    if (step.id === 'sqld-1-2-s7') return 'meaning';
    if (step.id === 'sqld-1-2-s7-compare') return 'operation';
    if (step.id === 'sqld-1-2-s7-aggregate') return 'aggregate';
    if (step.id === 'sqld-1-2-s7-sort') return 'sort';
    return null;
  })();
  const keyChoiceDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    if (step.id === 'sqld-1-2-s8') return 'compare';
    if (step.id === 'sqld-1-2-s8-surrogate') return 'surrogate';
    if (step.id === 'sqld-1-2-s8-practice') return 'practice';
    return null;
  })();
  const sqld2BasicsDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    const map: Record<string, Sqld2BasicsDiagramMode> = {
      'sqld-2-1-s1': 'commands',
      'sqld-2-1-s2': 'algebra',
      'sqld-2-1-s3': 'execution',
      'sqld-2-1-s4': 'aliasDistinct',
      'sqld-2-1-s5': 'stringFunctions',
      'sqld-2-1-s6': 'numberDateFunctions',
      'sqld-2-1-s7': 'aggregateFunctions',
      'sqld-2-1-s8': 'nullFunctions',
      'sqld-2-1-s9': 'caseDecode',
      'sqld-2-1-s10': 'where',
      'sqld-2-1-s11': 'groupHaving',
      'sqld-2-1-s12': 'orderBy',
    };
    return map[step.id] ?? null;
  })();
  const sqld2UsageDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    const map: Record<string, Sqld2UsageDiagramMode> = {
      'sqld-2-2-s1': 'joinKinds',
      'sqld-2-2-s2': 'joinSyntax',
      'sqld-2-2-s3': 'crossSelf',
      'sqld-2-2-s4': 'subquery',
      'sqld-2-2-s5': 'multirow',
      'sqld-2-2-s6': 'setOps',
      'sqld-2-2-s7': 'groupExtension',
      'sqld-2-2-s8': 'windowRank',
      'sqld-2-2-s9': 'windowAggregate',
      'sqld-2-2-s10': 'lagLeadFrame',
      'sqld-2-2-s11': 'topN',
      'sqld-2-2-s12': 'regex',
    };
    return map[step.id] ?? null;
  })();
  const sqld2ManagementDiagramMode = (() => {
    if (phase !== 'narrate') return null;
    const map: Record<string, Sqld2ManagementDiagramMode> = {
      'sqld-2-3-s1': 'dml',
      'sqld-2-3-s2': 'merge',
      'sqld-2-3-s3': 'tcl',
      'sqld-2-3-s4': 'autocommit',
      'sqld-2-3-s5': 'createTable',
      'sqld-2-3-s6': 'ddlCompare',
      'sqld-2-3-s7': 'constraints',
      'sqld-2-3-s8': 'dcl',
    };
    return map[step.id] ?? null;
  })();
  const adsp1DiagramMode: Adsp1DiagramMode | null = (() => {
    if (phase !== 'narrate') return null;
    if (step.id === 'adsp-1-1-s1') return 'dikw';
    if (step.id === 'adsp-1-1-s2') return 'dataClassification';
    if (step.id === 'adsp-1-1-s3') return 'tacitExplicit';
    if (step.id === 'adsp-1-1-s3-seci') return 'seci';
    if (step.id === 'adsp-1-1-s3-S') return 'seciSocialization';
    if (step.id === 'adsp-1-1-s4') return 'dbFeatures';
    if (step.id === 'adsp-1-1-s4-dw') return 'dwOverview';
    if (
      step.id === 'adsp-1-1-s4-dm' ||
      step.id === 'adsp-1-1-s4-dm-purpose' ||
      step.id === 'adsp-1-1-s4-dm-features'
    ) return 'dataMart';
    if (
      step.id === 'adsp-1-1-s4-lake' ||
      step.id === 'adsp-1-1-s4-lake-purpose' ||
      step.id === 'adsp-1-1-s4-lake-features'
    ) return 'dataLake';
    if (step.id === 'adsp-1-1-s4-olap') return 'olapOverview';
    if (step.id === 'adsp-1-1-s4-oltp') return 'oltpOverview';
    if (step.id === 'adsp-1-1-s4-oltp-features') return 'oltpOlap';
    if (step.id.startsWith('adsp-1-1-s5')) return 'enterpriseSystems';
    if (step.id === 'adsp-1-2-s0') return 'bigDataBackground';
    if (
      step.id === 'adsp-1-2-s1-3v' ||
      step.id === 'adsp-1-2-s1-volume' ||
      step.id === 'adsp-1-2-s1-variety' ||
      step.id === 'adsp-1-2-s1-velocity'
    ) return 'bigData3v';
    if (step.id === 'adsp-1-2-s2') return 'bigDataChange';
    if (step.id === 'adsp-1-3-s1') return 'dataScienceAxes';
    if (step.id === 'adsp-1-3-s2') return 'hardSoftSkills';
    if (step.id.startsWith('adsp-1-3-s3')) return 'digitalCamera';
    if (step.id.startsWith('adsp-2-1-s1')) return 'analysisTypes';
    if (step.id.startsWith('adsp-2-1-s2')) return 'analysisProcess';
    if (step.id.startsWith('adsp-2-1-s3')) return 'topDownApproach';
    if (step.id.startsWith('adsp-2-1-s4')) return 'analysisMethodology';
    if (step.id.startsWith('adsp-2-2-s1')) return 'priorityMatrix';
    if (step.id.startsWith('adsp-2-2-s2')) return 'analyticsGovernance';
    if (step.id.startsWith('adsp-2-2-s3')) return 'maturityStages';
    if (step.id.startsWith('adsp-2-2-s4')) return 'dataGovernance';
    if (step.id.startsWith('adsp-2-3-s1')) return 'analysisFeasibility';
    if (step.id === 'adsp-2-3-s2' || step.id === 'adsp-2-3-s3') return 'analysisApproachMix';
    if (step.id === 'adsp-2-3-s4') return 'projectDefinition';
    if (step.id.startsWith('adsp-2-3-s5')) return 'readinessAreas';
    if (step.id === 'adsp-3-1-s1') return 'adsp3SummaryDerived';
    if (step.id.startsWith('adsp-3-1-s2')) return 'adsp3Eda4r';
    if (step.id.startsWith('adsp-3-1-s3')) return 'adsp3Missing';
    if (step.id.startsWith('adsp-3-1-s4')) return 'adsp3Outlier';
    if (step.id.startsWith('adsp-3-1-s5')) return 'adsp3RStructures';
    if (step.id.startsWith('adsp-3-2-s1')) return 'adsp3Scales';
    if (step.id.startsWith('adsp-3-2-s2')) return 'adsp3Distribution';
    if (step.id.startsWith('adsp-3-2-s3')) return 'adsp3Estimator';
    if (step.id === 'adsp-3-2-s4') return 'adsp3Clt';
    if (step.id === 'adsp-3-2-s5') return 'adsp3Pca';
    if (step.id === 'adsp-3-2-s6') return 'adsp3Mds';
    if (step.id.startsWith('adsp-3-3-s1')) return 'adsp3Hypothesis';
    if (step.id.startsWith('adsp-3-3-s2')) return 'adsp3Ttest';
    if (step.id.startsWith('adsp-3-3-s3')) return 'adsp3Regression';
    if (step.id === 'adsp-3-3-s4') return 'adsp3Multicollinearity';
    if (step.id.startsWith('adsp-3-3-s5')) return 'adsp3TimeSeries';
    if (step.id === 'adsp-3-4-s1') return 'adsp3Overfit';
    if (step.id.startsWith('adsp-3-4-s2')) return 'adsp3Ensemble';
    if (step.id.startsWith('adsp-3-4-s3')) return 'adsp3Association';
    if (step.id.startsWith('adsp-3-4-s4')) return 'adsp3Clustering';
    if (step.id.startsWith('adsp-3-4-s5')) return 'adsp3Metrics';
    if (step.id === 'adsp-3-4-s6') return 'adsp3Logistic';
    if (step.id === 'adsp-3-4-s7') return 'adsp3Tree';
    if (step.id === 'adsp-3-4-s8') return 'adsp3Knn';
    if (step.id === 'adsp-3-4-s9') return 'adsp3NaiveBayes';
    if (step.id === 'adsp-3-4-s10') return 'adsp3Svm';
    if (step.id === 'adsp-3-4-s11') return 'adsp3Neural';
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
            openWebOrAppPremiumEntry();
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

        {dataModelingDiagramMode ? (
          <DataModelingIntroDiagram mode={dataModelingDiagramMode} />
        ) : null}

        {modelFeatureDiagramMode ? (
          <ModelFeatureDiagram mode={modelFeatureDiagramMode} />
        ) : null}

        {processPerspectiveDiagramMode ? (
          <ProcessPerspectiveDiagram />
        ) : null}

        {interactionPerspectiveDiagramMode ? (
          <InteractionPerspectiveDiagram />
        ) : null}

        {modelingStageDiagramMode ? (
          <ModelingStageDiagram mode={modelingStageDiagramMode} />
        ) : null}

        {attributeDiagramMode ? (
          <AttributeClassificationDiagram mode={attributeDiagramMode} />
        ) : null}

        {attributeShapeDiagramMode ? (
          <AttributeShapeDiagram mode={attributeShapeDiagramMode} />
        ) : null}

        {attributeRoleDiagramMode ? (
          <AttributeRoleDiagram mode={attributeRoleDiagramMode} />
        ) : null}

        {keyIntegrityDiagramMode ? (
          <KeyIntegrityDiagram mode={keyIntegrityDiagramMode} />
        ) : null}

        {adsp1DiagramMode ? (
          <Adsp1ConceptDiagram mode={adsp1DiagramMode} stepId={step.id} turnIdx={turnIdx} />
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
        !dataModelingDiagramMode &&
        !modelFeatureDiagramMode &&
        !processPerspectiveDiagramMode &&
        !interactionPerspectiveDiagramMode &&
        !modelingStageDiagramMode &&
        !attributeDiagramMode &&
        !attributeShapeDiagramMode &&
        !attributeRoleDiagramMode &&
        !schemaDiagramMode &&
        !entityTypeDiagramMode &&
        !relationshipDiagramMode &&
        !identifierRelationshipDiagramMode &&
        !keyIntegrityDiagramMode &&
        !functionalDependencyDiagramMode &&
        !normalFormDiagramMode &&
        !denormalizationDiagramMode &&
        !specialRelationDiagramMode &&
        !transactionDiagramMode &&
        !nullDiagramMode &&
        !keyChoiceDiagramMode &&
        !sqld2BasicsDiagramMode &&
        !sqld2UsageDiagramMode &&
        !sqld2ManagementDiagramMode &&
        !adsp1DiagramMode ? (
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

        {anomalyDiagramMode ? (
          <AnomalyTableDiagram mode={anomalyDiagramMode} />
        ) : null}

        {functionalDependencyDiagramMode ? (
          <FunctionalDependencyDiagram mode={functionalDependencyDiagramMode} />
        ) : null}

        {normalFormDiagramMode ? (
          <NormalFormDiagram mode={normalFormDiagramMode} />
        ) : null}

        {denormalizationDiagramMode ? (
          <DenormalizationDiagram mode={denormalizationDiagramMode} />
        ) : null}

        {specialRelationDiagramMode ? (
          <SpecialRelationDiagram mode={specialRelationDiagramMode} />
        ) : null}

        {transactionDiagramMode ? (
          <TransactionDiagram mode={transactionDiagramMode} />
        ) : null}

        {nullDiagramMode ? <NullBehaviorDiagram mode={nullDiagramMode} /> : null}

        {keyChoiceDiagramMode ? (
          <KeyChoiceDiagram mode={keyChoiceDiagramMode} />
        ) : null}

        {sqld2BasicsDiagramMode ? (
          <Sqld2BasicsDiagram mode={sqld2BasicsDiagramMode} />
        ) : null}

        {sqld2UsageDiagramMode ? (
          <Sqld2UsageDiagram mode={sqld2UsageDiagramMode} />
        ) : null}

        {sqld2ManagementDiagramMode ? (
          <Sqld2ManagementDiagram mode={sqld2ManagementDiagramMode} />
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

type DataModelingDiagramMode = 'reality' | 'modeling' | 'schema';

function DataModelingIntroDiagram({ mode }: { mode: DataModelingDiagramMode }) {
  const realityActive = mode === 'reality';
  const modelingActive = mode === 'modeling';
  const schemaActive = mode === 'schema';

  return (
    <motion.figure
      key={`data-modeling-${mode}`}
      className="mx-auto mt-6 w-full max-w-[560px]"
      aria-label="현실 세계의 정보가 데이터 모델링을 거쳐 데이터베이스 구조가 되는 과정"
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 31, mass: 0.82 }}
    >
      <div className="relative overflow-hidden rounded-[26px] border border-[#c084fc]/24 bg-[#06122d]/94 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(circle at 20% 8%, rgba(192,132,252,0.18), transparent 34%), radial-gradient(circle at 88% 18%, rgba(103,232,249,0.12), transparent 32%)',
          }}
        />

        <div className="relative mb-4 flex items-end justify-between gap-3">
          <div>
            <div className="kr-num text-[9px] font-black uppercase tracking-[0.18em] text-[#c084fc]/85">
              DATA MODELING
            </div>
            <div className="kr-heading mt-1 text-[20px] leading-tight text-cream">
              현실을 DB 설계도로
            </div>
          </div>
          <div className="kr-body max-w-[118px] text-right text-[11px] font-bold leading-snug text-cream/56">
            수강신청을
            <br />
            구조로 정리
          </div>
        </div>

        <div className="relative grid gap-3">
          <DataModelingRealityPanel active={realityActive} />
          <DataModelingFlowBridge active={modelingActive} />
          <DataModelingSchemaPanel active={schemaActive} />
        </div>
      </div>
      <figcaption className="sr-only">
        학생, 과목, 교수, 시간표 같은 현실 정보가 데이터 모델링을 통해 학생, 수강, 과목 같은 데이터베이스 구조로 정리됩니다.
      </figcaption>
    </motion.figure>
  );
}

function DataModelingRealityPanel({ active }: { active: boolean }) {
  const items: Array<{ label: string; caption: string; Icon: LucideIcon }> = [
    { label: '학생', caption: '누가', Icon: UserRound },
    { label: '과목', caption: '무엇을', Icon: BookOpen },
    { label: '교수', caption: '누가 담당', Icon: AppWindow },
    { label: '시간표', caption: '언제', Icon: Layers },
  ];

  return (
    <motion.div
      className={active ? 'relative rounded-[22px] border p-3.5' : 'relative rounded-[18px] border p-3'}
      style={{
        borderColor: active ? 'rgba(192,132,252,0.62)' : 'rgba(239,244,255,0.12)',
        background: active
          ? 'linear-gradient(145deg, rgba(22,20,60,0.96), rgba(8,16,42,0.96))'
          : 'rgba(255,255,255,0.035)',
      }}
      animate={{ opacity: active ? 1 : 0.74, scale: active ? 1 : 0.992 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
    >
      <div className={active ? 'mb-3 flex items-center justify-between gap-3' : 'mb-2 flex items-center justify-between gap-3'}>
        <div className={active ? 'kr-heading text-[16px] leading-none text-cream' : 'kr-heading text-[13px] leading-none text-cream/72'}>
          현실 세계
        </div>
        <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-cream/40">
          raw facts
        </div>
      </div>
      <div className={active ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-4 gap-1.5'}>
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            className={
              active
                ? 'flex items-center gap-2.5 rounded-[16px] border border-cream/10 bg-white/[0.055] px-3 py-2.5'
                : 'flex min-w-0 flex-col items-center justify-center gap-1 rounded-[12px] border border-cream/10 bg-white/[0.04] px-1.5 py-2'
            }
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.18 }}
          >
            <div
              className={active ? 'grid h-9 w-9 shrink-0 place-items-center rounded-[13px] border' : 'grid h-7 w-7 shrink-0 place-items-center rounded-[10px] border'}
              style={{
                color: active ? '#d8b4fe' : 'rgba(239,244,255,0.55)',
                borderColor: active ? 'rgba(192,132,252,0.38)' : 'rgba(239,244,255,0.12)',
                background: active ? 'rgba(192,132,252,0.12)' : 'rgba(255,255,255,0.035)',
              }}
              aria-hidden
            >
              <item.Icon size={active ? 17 : 13} strokeWidth={2.35} />
            </div>
            <div className={active ? 'min-w-0' : 'min-w-0 text-center'}>
              <div className={active ? 'kr-heading text-[14px] leading-none text-cream' : 'truncate kr-heading text-[10.5px] leading-none text-cream/64'}>
                {item.label}
              </div>
              {active ? (
                <div className="mt-1 kr-body text-[10.5px] font-bold leading-none text-cream/45">
                  {item.caption}
                </div>
              ) : null}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function DataModelingFlowBridge({ active }: { active: boolean }) {
  return (
    <motion.div
      className="relative flex items-center gap-3 px-1"
      animate={{ opacity: active ? 1 : 0.72 }}
      transition={{ duration: 0.18 }}
      aria-hidden
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c084fc]/28 to-[#c084fc]/10" />
      <div
        className={active ? 'relative grid h-[74px] w-[74px] shrink-0 place-items-center rounded-[24px] border' : 'relative grid h-[54px] w-[54px] shrink-0 place-items-center rounded-[18px] border'}
        style={{
          borderColor: active ? 'rgba(209,248,67,0.64)' : 'rgba(239,244,255,0.14)',
          background: active
            ? 'linear-gradient(145deg, rgba(209,248,67,0.16), rgba(103,232,249,0.10))'
            : 'rgba(255,255,255,0.04)',
          boxShadow: active ? '0 16px 34px rgba(0,0,0,0.28)' : 'none',
        }}
      >
        <div className={active ? 'absolute inset-[11px] rounded-[18px] border border-white/10' : 'absolute inset-[8px] rounded-[13px] border border-white/10'} />
        <Database
          size={active ? 25 : 19}
          strokeWidth={2.5}
          className={active ? 'text-[#d1f843]' : 'text-cream/48'}
        />
        <div className="absolute -bottom-3 rounded-full border border-cream/10 bg-[#071326] px-3 py-1 kr-num text-[9px] font-black uppercase tracking-[0.12em] text-cream/68">
          MODELING
        </div>
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-[#c084fc]/10 via-[#67e8f9]/28 to-transparent" />
    </motion.div>
  );
}

function DataModelingSchemaPanel({ active }: { active: boolean }) {
  const tables = [
    { title: '학생', rows: ['학번', '이름'], Icon: UserRound },
    { title: '수강', rows: ['학번', '과목코드'], Icon: ClipboardList },
    { title: '과목', rows: ['과목코드', '과목명'], Icon: BookOpen },
  ] as const;

  return (
    <motion.div
      className={active ? 'relative rounded-[22px] border p-3.5' : 'relative rounded-[18px] border p-3'}
      style={{
        borderColor: active ? 'rgba(103,232,249,0.52)' : 'rgba(239,244,255,0.12)',
        background: active
          ? 'linear-gradient(145deg, rgba(9,34,56,0.96), rgba(8,16,42,0.96))'
          : 'rgba(255,255,255,0.035)',
      }}
      animate={{ opacity: active ? 1 : 0.78, scale: active ? 1 : 0.992 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
    >
      <div className={active ? 'mb-3 flex items-center justify-between gap-3' : 'mb-2 flex items-center justify-between gap-3'}>
        <div className={active ? 'kr-heading text-[16px] leading-none text-cream' : 'kr-heading text-[13px] leading-none text-cream/72'}>
          DB 구조
        </div>
        <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-cream/40">
          tables
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {tables.map((table, index) => (
          <motion.div
            key={table.title}
            className={active ? 'rounded-[16px] border border-cream/10 bg-[#081632]/88 p-2.5' : 'rounded-[12px] border border-cream/10 bg-[#081632]/70 p-2'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.045, duration: 0.18 }}
          >
            <div className={active ? 'flex items-center gap-1.5 border-b border-cream/10 pb-2' : 'flex items-center justify-center gap-1.5'}>
              <table.Icon
                size={active ? 14 : 12}
                strokeWidth={2.4}
                className={active ? 'text-[#67e8f9]' : 'text-cream/48'}
                aria-hidden
              />
              <div className={active ? 'kr-heading text-[13px] leading-none text-cream' : 'kr-heading text-[10.5px] leading-none text-cream/64'}>
                {table.title}
              </div>
            </div>
            {active ? (
              <div className="mt-2 grid gap-1.5">
                {table.rows.map((row) => (
                  <div
                    key={row}
                    className="rounded-[10px] border border-cream/10 bg-white/[0.045] px-1.5 py-1.5 text-center kr-body text-[10.5px] font-black leading-none text-cream/76"
                  >
                    {row}
                  </div>
                ))}
              </div>
            ) : null}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

type ModelFeatureMode = 'overview' | 'simple' | 'abstract' | 'clear';

function ModelFeatureDiagram({ mode }: { mode: ModelFeatureMode }) {
  const cards = [
    {
      key: '단',
      title: '단순화',
      body: '처음 본 사람도 길을 잃지 않게',
      before: '한 화면에 전부',
      after: '역할별로 나눔',
      active: mode === 'overview' || mode === 'simple',
    },
    {
      key: '추',
      title: '추상화',
      body: '지금 필요한 핵심만 남기기',
      before: '취미·신발·점심',
      after: '학생·과목·수강',
      active: mode === 'overview' || mode === 'abstract',
    },
    {
      key: '명',
      title: '명확화',
      body: '누가 봐도 같은 뜻으로 읽히게',
      before: '날짜',
      after: '수강신청일',
      active: mode === 'overview' || mode === 'clear',
    },
  ];

  return (
    <motion.figure
      key={`model-feature-${mode}`}
      className="mx-auto mt-6 w-full max-w-[560px]"
      aria-label="좋은 데이터 모델의 단순화, 추상화, 명확화 그림 설명"
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 31, mass: 0.82 }}
    >
      <div className="rounded-[26px] border border-[#c084fc]/18 bg-[#06122d]/94 p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-[#c084fc]/82">
              MODEL QUALITY
            </div>
            <div className="kr-heading mt-1 text-[20px] leading-none text-cream">
              단추명
            </div>
          </div>
          <div className="kr-body text-right text-[11px] font-bold leading-snug text-cream/52">
            좋은 모델의
            <br />
            3가지 감각
          </div>
        </div>

        <div className="grid gap-2.5">
          {cards.map((card, index) => (
            <motion.div
              key={card.key}
              className={
                'grid grid-cols-[44px_1fr] gap-3 rounded-[19px] border p-3 transition ' +
                (card.active
                  ? 'border-[#c084fc]/38 bg-[#c084fc]/10'
                  : 'border-cream/10 bg-white/[0.035] opacity-68')
              }
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.045, duration: 0.18 }}
            >
              <div
                className={
                  'grid h-11 w-11 place-items-center rounded-[15px] border kr-heading text-[18px] ' +
                  (card.active
                    ? 'border-[#c084fc]/50 bg-[#c084fc]/16 text-[#ead7ff]'
                    : 'border-cream/12 bg-white/[0.035] text-cream/46')
                }
              >
                {card.key}
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="kr-heading text-[16px] leading-none text-cream">
                    {card.title}
                  </div>
                  <div className="kr-body text-[11px] font-bold text-cream/54">
                    {card.body}
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-[1fr_22px_1fr] items-center gap-1.5">
                  <FeatureMiniLabel dim={!card.active}>{card.before}</FeatureMiniLabel>
                  <ChevronRight
                    size={16}
                    strokeWidth={2.8}
                    className={card.active ? 'mx-auto text-[#d1f843]' : 'mx-auto text-cream/28'}
                    aria-hidden
                  />
                  <FeatureMiniLabel accent={card.active}>{card.after}</FeatureMiniLabel>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {mode === 'clear' ? (
          <div className="mt-3 rounded-[18px] border border-cream/10 bg-[#081632]/82 p-3">
            <div className="mb-2 kr-num text-[9px] font-black uppercase tracking-[0.16em] text-cream/44">
              CLEAR ERD
            </div>
            <div className="grid grid-cols-[1fr_34px_1fr] items-center gap-2">
              <ClearEntityCard title="수강신청" rows={['학생ID', '과목ID', '수강신청일']} />
              <div className="flex flex-col items-center gap-1">
                <div className="h-px w-7 bg-[#d1f843]/55" />
                <div className="rounded-full border border-[#d1f843]/30 bg-[#d1f843]/10 px-2 py-0.5 kr-num text-[8px] font-black text-[#e8ff9d]">
                  읽힘
                </div>
                <div className="h-px w-7 bg-[#d1f843]/55" />
              </div>
              <ClearEntityCard title="과목" rows={['과목ID', '과목명']} />
            </div>
          </div>
        ) : null}
      </div>
    </motion.figure>
  );
}

function FeatureMiniLabel({
  children,
  accent = false,
  dim = false,
}: {
  children: ReactNode;
  accent?: boolean;
  dim?: boolean;
}) {
  return (
    <div
      className={
        'rounded-[12px] border px-2 py-2 text-center kr-body text-[11.5px] font-black leading-tight ' +
        (accent
          ? 'border-[#d1f843]/28 bg-[#d1f843]/10 text-[#e8ff9d]'
          : dim
            ? 'border-cream/8 bg-white/[0.025] text-cream/38'
            : 'border-cream/10 bg-white/[0.045] text-cream/62')
      }
    >
      {children}
    </div>
  );
}

function ClearEntityCard({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="rounded-[16px] border border-[#c084fc]/28 bg-[#0b1836]/90 p-2.5">
      <div className="border-b border-cream/10 pb-2 kr-heading text-[14px] leading-none text-cream">
        {title}
      </div>
      <div className="mt-2 grid gap-1.5">
        {rows.map((row) => (
          <div
            key={row}
            className="rounded-[10px] border border-cream/10 bg-white/[0.045] px-2 py-1.5 text-center kr-body text-[10.5px] font-black leading-none text-cream/78"
          >
            {row}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcessPerspectiveDiagram() {
  const steps = ['강의 조회', '과목 선택', '신청 확인', '완료'];
  return (
    <motion.figure
      className="mx-auto mt-6 w-full max-w-[560px]"
      aria-label="프로세스 관점 업무 흐름 그림"
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 31, mass: 0.82 }}
    >
      <div className="rounded-[26px] border border-[#67e8f9]/18 bg-[#06122d]/94 p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-[#67e8f9]/82">
              PROCESS VIEW
            </div>
            <div className="kr-heading mt-1 text-[20px] leading-none text-cream">
              업무가 흘러가는 길
            </div>
          </div>
          <div className="kr-body text-right text-[11px] font-bold leading-snug text-cream/52">
            저장 대상보다
            <br />
            처리 순서
          </div>
        </div>

        <div className="grid gap-2">
          {steps.map((label, index) => (
            <motion.div
              key={label}
              className="grid grid-cols-[34px_1fr_34px] items-center gap-2 rounded-[18px] border border-cream/10 bg-white/[0.045] px-3 py-2.5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.045, duration: 0.18 }}
            >
              <div className="grid h-8 w-8 place-items-center rounded-full border border-[#67e8f9]/30 bg-[#67e8f9]/10 kr-num text-[10px] font-black text-[#dffbff]">
                {index + 1}
              </div>
              <div>
                <div className="kr-heading text-[15px] leading-none text-cream">
                  {label}
                </div>
                <div className="mt-1 kr-body text-[10.5px] font-bold leading-none text-cream/46">
                  {index === 0 ? 'Read' : index === 3 ? 'Create' : 'Process'}
                </div>
              </div>
              {index < steps.length - 1 ? (
                <ChevronRight size={18} strokeWidth={2.8} className="text-[#67e8f9]" aria-hidden />
              ) : (
                <Check size={18} strokeWidth={2.8} className="text-[#d1f843]" aria-hidden />
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-3 rounded-[16px] border border-cream/10 bg-white/[0.035] px-3 py-2.5">
          <div className="kr-body text-[12px] font-bold leading-[1.5] text-cream/66">
            프로세스 관점은 “무엇을 저장하지?”보다 “업무가 어떤 순서로 움직이지?”를 먼저 봅니다.
          </div>
        </div>
      </div>
    </motion.figure>
  );
}

function InteractionPerspectiveDiagram() {
  const actions = [
    {
      key: 'R',
      label: '읽기',
      title: '학생 정보 확인',
      body: '누가 신청하는지 본다',
      icon: Eye,
      accent: '#67e8f9',
    },
    {
      key: 'R',
      label: '읽기',
      title: '과목 정보 확인',
      body: '신청할 과목을 본다',
      icon: BookOpen,
      accent: '#67e8f9',
    },
    {
      key: 'C',
      label: '만들기',
      title: '수강 기록 생성',
      body: '신청 결과를 새로 남긴다',
      icon: Plus,
      accent: '#d1f843',
    },
    {
      key: 'U',
      label: '고치기',
      title: '남은 자리 변경',
      body: '정원이 줄어든다',
      icon: PencilLine,
      accent: '#c084fc',
    },
  ];

  return (
    <motion.figure
      className="mx-auto mt-6 w-full max-w-[560px]"
      aria-label="상관 관점 CRUD 연결 그림"
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 31, mass: 0.82 }}
    >
      <div className="rounded-[26px] border border-[#d1f843]/18 bg-[#06122d]/94 p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-[#d1f843]/82">
              INTERACTION VIEW
            </div>
            <div className="kr-heading mt-1 text-[20px] leading-none text-cream">
              업무와 데이터가 만나는 순간
            </div>
          </div>
          <div className="kr-body text-right text-[11px] font-bold leading-snug text-cream/52">
            버튼 하나가
            <br />
            데이터를 움직임
          </div>
        </div>

        <div className="rounded-[20px] border border-cream/10 bg-white/[0.04] p-3">
          <div className="grid grid-cols-[1fr_28px_1fr] items-center gap-2">
            <div className="rounded-[18px] border border-[#d1f843]/28 bg-[#d1f843]/10 p-3">
              <div className="kr-num text-[9px] font-black uppercase tracking-[0.14em] text-[#e8ff9d]/78">
                업무
              </div>
              <div className="mt-1 kr-heading text-[16px] leading-tight text-cream">
                수강신청 버튼
              </div>
              <div className="mt-2 kr-body text-[11.5px] font-bold leading-[1.45] text-cream/58">
                사용자는 버튼 하나를 누르지만,
                <br />
                뒤에서는 여러 데이터가 움직여요.
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <ChevronRight size={17} strokeWidth={2.8} className="text-[#d1f843]" aria-hidden />
              <div className="h-10 w-px bg-[#d1f843]/30" />
              <ChevronRight size={17} strokeWidth={2.8} className="text-[#d1f843]" aria-hidden />
            </div>

            <div className="rounded-[18px] border border-[#67e8f9]/22 bg-[#67e8f9]/8 p-3">
              <div className="kr-num text-[9px] font-black uppercase tracking-[0.14em] text-[#dffbff]/70">
                데이터
              </div>
              <div className="mt-1 grid gap-1.5">
                {['학생', '과목', '수강 기록'].map((item) => (
                  <div
                    key={item}
                    className="rounded-[11px] border border-cream/10 bg-white/[0.05] px-2.5 py-1.5 kr-body text-[11px] font-black leading-none text-cream/75"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={`${action.key}-${action.title}`}
                className="rounded-[17px] border border-cream/10 bg-white/[0.04] p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.045, duration: 0.18 }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="grid h-8 w-8 place-items-center rounded-[12px] border"
                    style={{
                      borderColor: `${action.accent}55`,
                      background: `${action.accent}18`,
                      color: action.accent,
                    }}
                  >
                    <Icon size={15} strokeWidth={2.7} aria-hidden />
                  </div>
                  <div
                    className="rounded-full border px-2 py-0.5 kr-num text-[9px] font-black uppercase"
                    style={{
                      borderColor: `${action.accent}4d`,
                      background: `${action.accent}12`,
                      color: action.accent,
                    }}
                  >
                    {action.key} · {action.label}
                  </div>
                </div>
                <div className="mt-2 kr-heading text-[13.5px] leading-tight text-cream">
                  {action.title}
                </div>
                <div className="mt-1 kr-body text-[11px] font-bold leading-[1.45] text-cream/52">
                  {action.body}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 rounded-[16px] border border-cream/10 bg-white/[0.035] px-3 py-2.5">
          <div className="kr-body text-[12px] font-bold leading-[1.5] text-cream/66">
            상관 관점은 “이 업무가 어떤 데이터를 읽고, 만들고, 고치고, 지우는가?”를 보는 관점입니다.
          </div>
          <div className="mt-1 kr-body text-[11px] font-bold leading-[1.45] text-cream/42">
            취소 기능이 있다면 수강 기록을 지우는 Delete까지 함께 떠올리면 됩니다.
          </div>
        </div>
      </div>
    </motion.figure>
  );
}

type ModelingStageMode = 'overview' | 'conceptual' | 'logical' | 'physical';

function ModelingStageDiagram({ mode }: { mode: ModelingStageMode }) {
  const stages = [
    {
      key: '개',
      title: '개념적',
      body: '업무 큰 그림',
      detail: '학생이 과목을 신청한다',
      active: mode === 'overview' || mode === 'conceptual',
    },
    {
      key: '논',
      title: '논리적',
      body: '키·관계·의존성 정리',
      detail: '학번 → 이름, 복합키 → 성적',
      active: mode === 'overview' || mode === 'logical',
    },
    {
      key: '물',
      title: '물리적',
      body: 'DBMS에 맞게 구현',
      detail: '자료형·인덱스·성능',
      active: mode === 'overview' || mode === 'physical',
    },
  ];

  return (
    <motion.figure
      key={`modeling-stage-${mode}`}
      className="mx-auto mt-6 w-full max-w-[560px]"
      aria-label="개념적 논리적 물리적 모델링 단계 그림"
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 31, mass: 0.82 }}
    >
      <div className="rounded-[26px] border border-[#c084fc]/18 bg-[#06122d]/94 p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-[#c084fc]/82">
              MODELING STAGES
            </div>
            <div className="kr-heading mt-1 text-[20px] leading-none text-cream">
              개논물
            </div>
          </div>
          <div className="kr-body text-right text-[11px] font-bold leading-snug text-cream/52">
            큰 그림에서
            <br />
            실제 구현까지
          </div>
        </div>

        <div className="grid gap-2.5">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.key}
              className={
                'grid grid-cols-[42px_1fr] gap-3 rounded-[18px] border p-3 ' +
                (stage.active
                  ? 'border-[#c084fc]/40 bg-[#c084fc]/10'
                  : 'border-cream/10 bg-white/[0.035] opacity-65')
              }
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.045, duration: 0.18 }}
            >
              <div
                className={
                  'grid h-10 w-10 place-items-center rounded-[14px] border kr-heading text-[16px] ' +
                  (stage.active
                    ? 'border-[#c084fc]/50 bg-[#c084fc]/16 text-[#ead7ff]'
                    : 'border-cream/12 bg-white/[0.035] text-cream/46')
                }
              >
                {stage.key}
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="kr-heading text-[15px] leading-none text-cream">
                    {stage.title}
                  </div>
                  <div className="kr-body text-[11px] font-bold text-cream/55">
                    {stage.body}
                  </div>
                </div>
                <div className="mt-2 rounded-[12px] border border-cream/10 bg-white/[0.045] px-3 py-2 kr-body text-[11.5px] font-bold leading-tight text-cream/72">
                  {stage.detail}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-3 rounded-[16px] border border-[#d1f843]/18 bg-[#d1f843]/8 px-3 py-2.5">
          <div className="kr-body text-[12px] font-bold leading-[1.5] text-[#ecffab]">
            함수적 종속 같은 “무엇이 무엇을 결정하나?” 문제는 주로 논리적 모델링에서 정리합니다.
          </div>
        </div>
      </div>
    </motion.figure>
  );
}

type AttributeDiagramMode = 'atom' | 'origin' | 'designed' | 'derived';

function AttributeClassificationDiagram({ mode }: { mode: AttributeDiagramMode }) {
  const items: Array<{
    key: string;
    title: string;
    body: string;
    example: string;
    icon: LucideIcon;
    accent: string;
    active: boolean;
  }> = [
    {
      key: '기본',
      title: '기본 속성',
      body: '현실 업무에 원래 있던 값',
      example: '이름 · 생년월일 · 주소',
      icon: UserRound,
      accent: '#67e8f9',
      active: mode === 'origin',
    },
    {
      key: '설계',
      title: '설계 속성',
      body: '관리하려고 새로 붙인 값',
      example: '회원ID · 주문번호',
      icon: PencilLine,
      accent: '#c084fc',
      active: mode === 'designed',
    },
    {
      key: '파생',
      title: '파생 속성',
      body: '다른 값으로 계산한 값',
      example: '나이 · 총점 · 평균',
      icon: Layers,
      accent: '#d1f843',
      active: mode === 'derived',
    },
  ];

  const isAtom = mode === 'atom';

  return (
    <motion.figure
      key={`attribute-classification-${mode}`}
      className="mx-auto mt-6 w-full max-w-[560px]"
      aria-label="속성과 속성 분류 그림 설명"
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 31, mass: 0.82 }}
    >
      <div className="rounded-[26px] border border-[#67e8f9]/18 bg-[#06122d]/94 p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-[#67e8f9]/82">
              ATTRIBUTE
            </div>
            <div className="kr-heading mt-1 text-[20px] leading-none text-cream">
              속성은 작은 정보 칸
            </div>
          </div>
          <div className="kr-body text-right text-[11px] font-bold leading-snug text-cream/52">
            엔터티를
            <br />
            설명하는 값
          </div>
        </div>

        <div className="rounded-[20px] border border-cream/10 bg-white/[0.04] p-3">
          <div className="flex items-center justify-between gap-2 border-b border-cream/10 pb-2">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-[13px] border border-[#67e8f9]/30 bg-[#67e8f9]/10 text-[#dffbff]">
                <UserRound size={17} strokeWidth={2.7} aria-hidden />
              </div>
              <div>
                <div className="kr-heading text-[16px] leading-none text-cream">
                  학생
                </div>
                <div className="mt-1 kr-body text-[10.5px] font-bold leading-none text-cream/44">
                  엔터티
                </div>
              </div>
            </div>
            <div className="rounded-full border border-[#67e8f9]/24 bg-[#67e8f9]/8 px-2.5 py-1 kr-body text-[10.5px] font-black text-[#dffbff]/80">
              하나씩 의미를 담는 칸
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {['학번', '이름', '학과'].map((attr, index) => (
              <motion.div
                key={attr}
                className={
                  'rounded-[13px] border px-2 py-2 text-center kr-heading text-[12px] leading-none ' +
                  (isAtom
                    ? 'border-[#d1f843]/32 bg-[#d1f843]/10 text-[#e8ff9d]'
                    : 'border-cream/10 bg-white/[0.045] text-cream/72')
                }
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.045, duration: 0.18 }}
              >
                {attr}
              </motion.div>
            ))}
          </div>

          {isAtom ? (
            <div className="mt-3 rounded-[15px] border border-[#d1f843]/18 bg-[#d1f843]/8 px-3 py-2.5">
              <div className="kr-body text-[12px] font-bold leading-[1.5] text-[#ecffab]">
                속성은 더 이상 나누지 않고 하나의 의미로 쓰는 최소 데이터 단위입니다.
              </div>
            </div>
          ) : null}
        </div>

        {!isAtom ? (
          <div className="mt-3 grid gap-2">
            {items.map((item, index) => {
              const Icon = item.icon;
              const active = item.active;
              return (
                <motion.div
                  key={item.key}
                  className={
                    'grid grid-cols-[38px_1fr] gap-3 rounded-[18px] border p-3 transition ' +
                    (active
                      ? 'bg-white/[0.07]'
                      : 'border-cream/10 bg-white/[0.035] opacity-68')
                  }
                  style={{
                    borderColor: active ? `${item.accent}66` : undefined,
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.045, duration: 0.18 }}
                >
                  <div
                    className="grid h-9 w-9 place-items-center rounded-[13px] border"
                    style={{
                      borderColor: `${item.accent}4d`,
                      background: `${item.accent}${active ? '1f' : '10'}`,
                      color: item.accent,
                    }}
                  >
                    <Icon size={16} strokeWidth={2.7} aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="kr-heading text-[15px] leading-none text-cream">
                        {item.title}
                      </div>
                      <div
                        className="rounded-full border px-2 py-0.5 kr-num text-[9px] font-black uppercase"
                        style={{
                          borderColor: `${item.accent}45`,
                          background: `${item.accent}12`,
                          color: item.accent,
                        }}
                      >
                        {item.key}
                      </div>
                    </div>
                    <div className="mt-1 kr-body text-[11px] font-bold leading-[1.45] text-cream/54">
                      {item.body}
                    </div>
                    <div className="mt-2 rounded-[12px] border border-cream/10 bg-white/[0.045] px-2.5 py-1.5 kr-body text-[11px] font-black leading-tight text-cream/70">
                      {item.example}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : null}

        {!isAtom ? (
          <div className="mt-3 rounded-[16px] border border-cream/10 bg-white/[0.035] px-3 py-2.5">
            <div className="kr-body text-[12px] font-bold leading-[1.5] text-cream/66">
              특성에 따른 분류는 “현실에 원래 있었나, 시스템이 만들었나, 계산해서 나왔나”를 구분하는 방식입니다.
            </div>
          </div>
        ) : null}
      </div>
    </motion.figure>
  );
}

type AttributeShapeMode = 'single' | 'composite' | 'multi';

function AttributeShapeDiagram({ mode }: { mode: AttributeShapeMode }) {
  const items: Array<{
    key: AttributeShapeMode;
    title: string;
    body: string;
    exampleTitle: string;
    example: ReactNode;
    accent: string;
  }> = [
    {
      key: 'single',
      title: '단일 속성',
      body: '하나의 의미로 끝나는 값',
      exampleTitle: '학번',
      example: '2026001',
      accent: '#67e8f9',
    },
    {
      key: 'composite',
      title: '복합 속성',
      body: '필요하면 더 작은 의미로 나눌 수 있는 값',
      exampleTitle: '주소',
      example: (
        <div className="grid grid-cols-2 gap-1">
          {['시', '구', '도로명', '상세'].map((part) => (
            <span
              key={part}
              className="rounded-[9px] border border-cream/10 bg-white/[0.055] px-1.5 py-1 text-center"
            >
              {part}
            </span>
          ))}
        </div>
      ),
      accent: '#c084fc',
    },
    {
      key: 'multi',
      title: '다중값 속성',
      body: '같은 종류의 값을 여러 개 가질 수 있는 값',
      exampleTitle: '이메일',
      example: (
        <div className="grid gap-1">
          {['개인 메일', '학교 메일', '회사 메일'].map((part) => (
            <span
              key={part}
              className="rounded-[9px] border border-cream/10 bg-white/[0.055] px-2 py-1 text-center"
            >
              {part}
            </span>
          ))}
        </div>
      ),
      accent: '#d1f843',
    },
  ];

  return (
    <motion.figure
      key={`attribute-shape-${mode}`}
      className="mx-auto mt-6 w-full max-w-[560px]"
      aria-label="단일 속성 복합 속성 다중값 속성 그림 설명"
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 31, mass: 0.82 }}
    >
      <div className="rounded-[26px] border border-[#c084fc]/18 bg-[#06122d]/94 p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-[#c084fc]/82">
              ATTRIBUTE SHAPE
            </div>
            <div className="kr-heading mt-1 text-[20px] leading-none text-cream">
              값의 모양으로 보기
            </div>
          </div>
          <div className="kr-body text-right text-[11px] font-bold leading-snug text-cream/52">
            쪼갤 수 있나
            <br />
            여러 개인가
          </div>
        </div>

        <div className="grid gap-2.5">
          {items.map((item, index) => {
            const active = item.key === mode;
            return (
              <motion.div
                key={item.key}
                className={
                  'rounded-[19px] border p-3 transition ' +
                  (active ? 'bg-white/[0.07]' : 'border-cream/10 bg-white/[0.035] opacity-68')
                }
                style={{ borderColor: active ? `${item.accent}66` : undefined }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.045, duration: 0.18 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="kr-heading text-[16px] leading-none text-cream">
                      {item.title}
                    </div>
                    <div className="mt-1 kr-body text-[11px] font-bold leading-[1.45] text-cream/52">
                      {item.body}
                    </div>
                  </div>
                  <div
                    className="rounded-full border px-2.5 py-1 kr-num text-[9px] font-black uppercase"
                    style={{
                      borderColor: `${item.accent}45`,
                      background: `${item.accent}12`,
                      color: item.accent,
                    }}
                  >
                    {item.exampleTitle}
                  </div>
                </div>
                <div
                  className="mt-2 rounded-[14px] border px-3 py-2.5 kr-body text-[11.5px] font-black leading-tight text-cream/76"
                  style={{
                    borderColor: active ? `${item.accent}38` : 'rgba(239,244,255,0.10)',
                    background: active ? `${item.accent}10` : 'rgba(255,255,255,0.035)',
                  }}
                >
                  {item.example}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 rounded-[16px] border border-cream/10 bg-white/[0.035] px-3 py-2.5">
          <div className="kr-body text-[12px] font-bold leading-[1.5] text-cream/66">
            이 분류는 “한 칸으로 충분한가, 더 쪼갤 수 있는가, 같은 값이 여러 번 나올 수 있는가”를 보는 기준입니다.
          </div>
        </div>
      </div>
    </motion.figure>
  );
}

type AttributeRoleMode = 'pk' | 'fk' | 'general';

function AttributeRoleDiagram({ mode }: { mode: AttributeRoleMode }) {
  const roles = [
    {
      key: 'pk' as const,
      title: 'PK 속성',
      label: '대표 이름표',
      body: '한 행을 딱 하나로 찾는 기준',
      value: '학번',
      accent: '#d1f843',
    },
    {
      key: 'fk' as const,
      title: 'FK 속성',
      label: '연결 고리',
      body: '다른 표의 대표값을 가리킴',
      value: '학과ID',
      accent: '#67e8f9',
    },
    {
      key: 'general' as const,
      title: '일반 속성',
      label: '설명 정보',
      body: '구분·연결보다 대상을 설명',
      value: '이름 · 생년월일',
      accent: '#c084fc',
    },
  ];

  return (
    <motion.figure
      key={`attribute-role-${mode}`}
      className="mx-auto mt-6 w-full max-w-[560px]"
      aria-label="PK 속성 FK 속성 일반 속성 그림 설명"
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 31, mass: 0.82 }}
    >
      <div className="rounded-[26px] border border-[#d1f843]/18 bg-[#06122d]/94 p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-[#d1f843]/82">
              ATTRIBUTE ROLE
            </div>
            <div className="kr-heading mt-1 text-[20px] leading-none text-cream">
              속성의 역할
            </div>
          </div>
          <div className="kr-body text-right text-[11px] font-bold leading-snug text-cream/52">
            찾기
            <br />
            연결하기
            <br />
            설명하기
          </div>
        </div>

        <div className="rounded-[20px] border border-cream/10 bg-white/[0.04] p-3">
          <div className="grid grid-cols-[1fr_30px_1fr] items-center gap-2">
            <RoleMiniTable
              title="학생"
              rows={[
                { label: '학번', tone: mode === 'pk' ? 'active' : 'normal' },
                { label: '이름', tone: mode === 'general' ? 'active' : 'normal' },
                { label: '생년월일', tone: mode === 'general' ? 'active' : 'normal' },
                { label: '학과ID', tone: mode === 'fk' ? 'active' : 'normal' },
              ]}
            />
            <div className="flex flex-col items-center gap-1">
              <div className="h-7 w-px bg-[#67e8f9]/30" />
              <ChevronRight size={18} strokeWidth={2.8} className="text-[#67e8f9]" aria-hidden />
              <div className="h-7 w-px bg-[#67e8f9]/30" />
            </div>
            <RoleMiniTable
              title="학과"
              rows={[
                { label: '학과ID', tone: mode === 'fk' ? 'active' : 'normal' },
                { label: '학과명', tone: 'normal' },
              ]}
            />
          </div>
        </div>

        <div className="mt-3 grid gap-2">
          {roles.map((role, index) => {
            const active = role.key === mode;
            return (
              <motion.div
                key={role.key}
                className={
                  'grid grid-cols-[1fr_auto] items-center gap-3 rounded-[17px] border px-3 py-2.5 ' +
                  (active ? 'bg-white/[0.07]' : 'border-cream/10 bg-white/[0.035] opacity-68')
                }
                style={{ borderColor: active ? `${role.accent}66` : undefined }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.045, duration: 0.18 }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="kr-heading text-[15px] leading-none text-cream">
                      {role.title}
                    </div>
                    <div
                      className="rounded-full border px-2 py-0.5 kr-num text-[8.5px] font-black uppercase"
                      style={{
                        borderColor: `${role.accent}45`,
                        background: `${role.accent}12`,
                        color: role.accent,
                      }}
                    >
                      {role.label}
                    </div>
                  </div>
                  <div className="mt-1 kr-body text-[11px] font-bold leading-[1.45] text-cream/52">
                    {role.body}
                  </div>
                </div>
                <div
                  className="rounded-[13px] border px-2.5 py-2 text-center kr-heading text-[11px] leading-tight"
                  style={{
                    borderColor: `${role.accent}42`,
                    background: `${role.accent}12`,
                    color: active ? role.accent : 'rgba(239,244,255,0.58)',
                  }}
                >
                  {role.value}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 rounded-[16px] border border-cream/10 bg-white/[0.035] px-3 py-2.5">
          <div className="kr-body text-[12px] font-bold leading-[1.5] text-cream/66">
            이 분류는 같은 속성이라도 테이블 안에서 맡는 일이 다르다는 걸 보는 기준입니다.
          </div>
        </div>
      </div>
    </motion.figure>
  );
}

function RoleMiniTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; tone: 'active' | 'normal' }>;
}) {
  return (
    <div className="rounded-[16px] border border-cream/10 bg-[#071634]/88 p-2.5">
      <div className="border-b border-cream/10 pb-2 kr-heading text-[14px] leading-none text-cream">
        {title}
      </div>
      <div className="mt-2 grid gap-1.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className={
              'rounded-[10px] border px-2 py-1.5 text-center kr-body text-[10.5px] font-black leading-none ' +
              (row.tone === 'active'
                ? 'border-[#d1f843]/34 bg-[#d1f843]/10 text-[#e8ff9d]'
                : 'border-cream/10 bg-white/[0.045] text-cream/60')
            }
          >
            {row.label}
          </div>
        ))}
      </div>
    </div>
  );
}

type KeyIntegrityDiagramMode = 'keys' | 'integrity' | 'pkUnique';

function KeyIntegrityDiagram({ mode }: { mode: KeyIntegrityDiagramMode }) {
  return (
    <motion.figure
      key={`key-integrity-${mode}`}
      className="mx-auto mt-6 w-full max-w-[560px]"
      aria-label="키 무결성 PK UNIQUE 그림 설명"
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 31, mass: 0.82 }}
    >
      <div className="rounded-[26px] border border-[#d1f843]/16 bg-[#06122d]/94 p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
        {mode === 'keys' ? <KeysFiveDiagram /> : null}
        {mode === 'integrity' ? <IntegrityThreeDiagram /> : null}
        {mode === 'pkUnique' ? <PkUniqueDiagram /> : null}
      </div>
    </motion.figure>
  );
}

function KeysFiveDiagram() {
  const cards = [
    {
      icon: Fingerprint,
      title: '슈퍼키',
      badge: '넓음',
      body: '한 행을 찾을 수만 있으면 됨',
      example: '학번 + 이름',
      accent: '#94a3b8',
    },
    {
      icon: BadgeCheck,
      title: '후보키',
      badge: '최소',
      body: '불필요한 속성을 뺀 대표 후보',
      example: '학번 / 이메일',
      accent: '#67e8f9',
    },
    {
      icon: KeyRound,
      title: '기본키',
      badge: '대표',
      body: '후보키 중 실제 대표로 선택',
      example: '학번',
      accent: '#d1f843',
    },
    {
      icon: Check,
      title: '대체키',
      badge: '후보',
      body: '대표로 선택되지 않은 후보키',
      example: '이메일',
      accent: '#c084fc',
    },
    {
      icon: Link2,
      title: '외래키',
      badge: '연결',
      body: '다른 표의 키를 가져와 연결',
      example: '수강.학번',
      accent: '#ffcc66',
    },
  ];

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-[#d1f843]/82">
            KEY MAP
          </div>
          <div className="kr-heading mt-1 text-[20px] leading-tight text-cream">
            키 5종은 역할로 구분
          </div>
        </div>
        <div className="kr-body text-right text-[11px] font-bold leading-snug text-cream/52">
          찾기
          <br />
          대표 선택
          <br />
          연결하기
        </div>
      </div>

      <div className="grid gap-2">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              className="grid grid-cols-[42px_1fr_auto] items-center gap-3 rounded-[18px] border bg-white/[0.04] px-3 py-2.5"
              style={{ borderColor: `${card.accent}36` }}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.045, duration: 0.18 }}
            >
              <div
                className="grid h-10 w-10 place-items-center rounded-[14px] border"
                style={{
                  borderColor: `${card.accent}40`,
                  background: `${card.accent}10`,
                  color: card.accent,
                }}
                aria-hidden
              >
                <Icon size={18} strokeWidth={2.6} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="kr-heading text-[15px] leading-none text-cream">
                    {card.title}
                  </div>
                  <span
                    className="rounded-full border px-2 py-0.5 kr-num text-[8.5px] font-black uppercase"
                    style={{
                      borderColor: `${card.accent}45`,
                      background: `${card.accent}12`,
                      color: card.accent,
                    }}
                  >
                    {card.badge}
                  </span>
                </div>
                <div className="mt-1 kr-body text-[11.5px] font-bold leading-snug text-cream/56">
                  {card.body}
                </div>
              </div>
              <div
                className="rounded-[12px] border px-2.5 py-2 text-center kr-heading text-[11px] leading-tight"
                style={{
                  borderColor: `${card.accent}34`,
                  background: `${card.accent}0d`,
                  color: card.accent,
                }}
              >
                {card.example}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-3 rounded-[16px] border border-cream/10 bg-white/[0.035] px-3 py-2.5">
        <div className="kr-body text-[12px] font-bold leading-[1.5] text-cream/66">
          후보키 중 대표로 고른 것이 기본키, 대표가 되지 못한 후보가 대체키입니다.
        </div>
      </div>
    </div>
  );
}

function IntegrityThreeDiagram() {
  const items = [
    {
      icon: KeyRound,
      title: '개체 무결성',
      rule: 'PK는 비면 안 되고 겹치면 안 됨',
      example: '학번 NULL / 중복 금지',
      accent: '#d1f843',
    },
    {
      icon: Link2,
      title: '참조 무결성',
      rule: 'FK는 실제 부모 행을 가리켜야 함',
      example: '없는 학번 수강 금지',
      accent: '#67e8f9',
    },
    {
      icon: ShieldCheck,
      title: '도메인 무결성',
      rule: '값은 정해진 범위와 형식 안',
      example: '점수 0~100',
      accent: '#c084fc',
    },
  ];

  return (
    <div>
      <div className="mb-3 px-1">
        <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-[#67e8f9]/82">
          INTEGRITY RULES
        </div>
        <div className="kr-heading mt-1 text-[20px] leading-tight text-cream">
          DB가 지키는 3가지 약속
        </div>
      </div>

      <div className="grid gap-2.5">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              className="rounded-[19px] border bg-white/[0.04] p-3"
              style={{ borderColor: `${item.accent}36` }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.055, duration: 0.18 }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border"
                  style={{
                    borderColor: `${item.accent}40`,
                    background: `${item.accent}10`,
                    color: item.accent,
                  }}
                  aria-hidden
                >
                  <Icon size={18} strokeWidth={2.7} />
                </div>
                <div className="min-w-0">
                  <div className="kr-heading text-[15px] leading-none text-cream">
                    {item.title}
                  </div>
                  <div className="mt-1 kr-body text-[12px] font-bold leading-[1.45] text-cream/62">
                    {item.rule}
                  </div>
                  <div
                    className="mt-2 inline-flex rounded-full border px-2.5 py-1 kr-num text-[9px] font-black uppercase"
                    style={{
                      borderColor: `${item.accent}40`,
                      background: `${item.accent}10`,
                      color: item.accent,
                    }}
                  >
                    {item.example}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function PkUniqueDiagram() {
  return (
    <div>
      <div className="mb-3 px-1">
        <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-[#d1f843]/82">
          PK VS UNIQUE
        </div>
        <div className="kr-heading mt-1 text-[20px] leading-tight text-cream">
          대표 이름표 vs 중복 방지
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ConstraintCard
          title="PK"
          badge="대표"
          accent="#d1f843"
          rows={[
            ['역할', '테이블 대표 식별자'],
            ['중복', '불가'],
            ['NULL', '불가'],
            ['개수', '테이블당 PK 제약 1개'],
          ]}
          example="id PK"
        />
        <ConstraintCard
          title="UNIQUE"
          badge="보조"
          accent="#67e8f9"
          rows={[
            ['역할', '중복 방지 제약'],
            ['중복', '불가'],
            ['NULL', 'SQLD/Oracle 기준 허용 가능'],
            ['개수', '여러 UNIQUE 제약 가능'],
          ]}
          example="email UNIQUE"
        />
      </div>

      <div className="mt-3 rounded-[16px] border border-[#d1f843]/18 bg-[#d1f843]/8 px-3 py-2.5">
        <div className="kr-body text-[12px] font-bold leading-[1.55] text-[#ecffab]">
          시험 기준: PK는 UNIQUE + NOT NULL + 대표 키. UNIQUE는 대표가 아니라 중복 방지 규칙입니다.
        </div>
      </div>
    </div>
  );
}

function ConstraintCard({
  title,
  badge,
  accent,
  rows,
  example,
}: {
  title: string;
  badge: string;
  accent: string;
  rows: string[][];
  example: string;
}) {
  return (
    <div className="rounded-[20px] border bg-white/[0.04] p-3" style={{ borderColor: `${accent}38` }}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="kr-heading text-[20px] leading-none text-cream">
          {title}
        </div>
        <span
          className="rounded-full border px-2.5 py-1 kr-num text-[9px] font-black uppercase"
          style={{
            borderColor: `${accent}45`,
            background: `${accent}12`,
            color: accent,
          }}
        >
          {badge}
        </span>
      </div>
      <div className="grid gap-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[58px_1fr] items-center gap-2 rounded-[12px] border border-cream/10 bg-[#071634]/76 px-2.5 py-2">
            <div className="kr-num text-[8.5px] font-black uppercase tracking-[0.12em] text-cream/36">
              {label}
            </div>
            <div className="kr-body text-[11.5px] font-black leading-tight text-cream/78">
              {value}
            </div>
          </div>
        ))}
      </div>
      <div
        className="mt-2.5 rounded-[13px] border px-3 py-2 text-center kr-heading text-[12px]"
        style={{
          borderColor: `${accent}40`,
          background: `${accent}10`,
          color: accent,
        }}
      >
        {example}
      </div>
    </div>
  );
}

type FunctionalDependencyMode = 'basic' | 'full' | 'partial' | 'transitive';

function FunctionalDependencyDiagram({ mode }: { mode: FunctionalDependencyMode }) {
  const meta: Record<
    FunctionalDependencyMode,
    { label: string; title: string; caption: string }
  > = {
    basic: {
      label: 'A → B',
      title: '하나를 알면 하나가 정해짐',
      caption: '학번을 알면 학생 이름이 하나로 정해지는 관계입니다.',
    },
    full: {
      label: '전체 필요',
      title: '키 전체가 필요함',
      caption: '학번과 과목코드를 함께 알아야 성적이 정해집니다.',
    },
    partial: {
      label: '일부만',
      title: '키 일부만으로 정해짐',
      caption: '복합키 중 학번만으로 이름이 정해지면 부분 종속입니다.',
    },
    transitive: {
      label: '중간 경유',
      title: '중간을 거쳐 정해짐',
      caption: '학번이 학과코드를 정하고, 학과코드가 학과명을 정합니다.',
    },
  };
  const data = meta[mode];

  return (
    <motion.figure
      key={`fd-${mode}`}
      className="mx-auto mt-6 w-full max-w-[560px]"
      aria-label="함수적 종속 그림 설명"
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 31, mass: 0.82 }}
    >
      <div className="rounded-[26px] border border-[#67e8f9]/18 bg-[#06122d]/94 p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-[#67e8f9]/82">
              DEPENDENCY
            </div>
            <div className="kr-heading mt-1 text-[19px] leading-tight text-cream">
              {data.title}
            </div>
          </div>
          <div className="rounded-full border border-[#67e8f9]/28 bg-[#67e8f9]/10 px-3 py-1 kr-num text-[10px] font-black text-[#dffbff]">
            {data.label}
          </div>
        </div>

        {mode === 'transitive' ? (
          <div className="grid grid-cols-[1fr_22px_1fr_22px_1fr] items-center gap-1.5">
            <DependencyNode label="학번" />
            <ChevronRight size={16} strokeWidth={2.8} className="mx-auto text-[#67e8f9]" />
            <DependencyNode label="학과코드" />
            <ChevronRight size={16} strokeWidth={2.8} className="mx-auto text-[#67e8f9]" />
            <DependencyNode label="학과명" accent />
          </div>
        ) : mode === 'full' ? (
          <div className="grid grid-cols-[1fr_22px_1fr] items-center gap-2">
            <div className="grid gap-1.5">
              <DependencyNode label="학번" />
              <DependencyNode label="과목코드" />
            </div>
            <ChevronRight size={18} strokeWidth={2.8} className="mx-auto text-[#67e8f9]" />
            <DependencyNode label="성적" accent />
          </div>
        ) : mode === 'partial' ? (
          <div className="grid grid-cols-[1fr_22px_1fr] items-center gap-2">
            <div className="grid gap-1.5">
              <DependencyNode label="학번" />
              <DependencyNode label="과목코드" dim />
            </div>
            <ChevronRight size={18} strokeWidth={2.8} className="mx-auto text-[#ffb020]" />
            <DependencyNode label="이름" warn />
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_22px_1fr] items-center gap-2">
            <DependencyNode label="학번" />
            <ChevronRight size={18} strokeWidth={2.8} className="mx-auto text-[#67e8f9]" />
            <DependencyNode label="이름" accent />
          </div>
        )}

        <div className="mt-3 rounded-[16px] border border-cream/10 bg-white/[0.035] px-3 py-2.5">
          <div className="kr-body text-[12px] font-bold leading-[1.5] text-cream/66">
            {data.caption}
          </div>
        </div>
      </div>
    </motion.figure>
  );
}

function DependencyNode({
  label,
  accent = false,
  warn = false,
  dim = false,
}: {
  label: string;
  accent?: boolean;
  warn?: boolean;
  dim?: boolean;
}) {
  return (
    <div
      className={
        'rounded-[16px] border px-2.5 py-3 text-center kr-heading text-[13px] leading-tight ' +
        (accent
          ? 'border-[#d1f843]/30 bg-[#d1f843]/10 text-[#e8ff9d]'
          : warn
            ? 'border-[#ffb020]/34 bg-[#ffb020]/10 text-[#ffe3a3]'
            : dim
              ? 'border-cream/8 bg-white/[0.025] text-cream/34'
              : 'border-[#67e8f9]/24 bg-[#67e8f9]/8 text-[#dffbff]')
      }
    >
      {label}
    </div>
  );
}

type VisualTone = 'cyan' | 'lime' | 'violet' | 'amber' | 'red' | 'muted';

const visualToneClass = (tone: VisualTone): string => {
  switch (tone) {
    case 'lime':
      return 'border-[#d1f843]/30 bg-[#d1f843]/10 text-[#e8ff9d]';
    case 'violet':
      return 'border-[#c084fc]/30 bg-[#c084fc]/10 text-[#eadcff]';
    case 'amber':
      return 'border-[#ffb020]/34 bg-[#ffb020]/10 text-[#ffe2a3]';
    case 'red':
      return 'border-[#ff6b6b]/35 bg-[#ff6b6b]/10 text-[#ffd1d1]';
    case 'muted':
      return 'border-cream/10 bg-white/[0.035] text-cream/55';
    case 'cyan':
    default:
      return 'border-[#67e8f9]/25 bg-[#67e8f9]/9 text-[#dffbff]';
  }
};

function LearningVisualFrame({
  eyebrow,
  title,
  caption,
  children,
}: {
  eyebrow: string;
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <motion.figure
      className="mx-auto mt-6 w-full max-w-[560px]"
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 31, mass: 0.82 }}
    >
      <div className="rounded-[26px] border border-[#67e8f9]/16 bg-[#06122d]/94 p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-[#67e8f9]/82">
              {eyebrow}
            </div>
            <div className="kr-heading mt-1 text-[19px] leading-tight text-cream">
              {title}
            </div>
          </div>
        </div>
        {children}
        <div className="mt-3 rounded-[16px] border border-cream/10 bg-white/[0.035] px-3 py-2.5">
          <div className="kr-body text-[12px] font-bold leading-[1.5] text-cream/66">
            {caption}
          </div>
        </div>
      </div>
    </motion.figure>
  );
}

function VisualPill({
  label,
  sub,
  tone = 'cyan',
}: {
  label: string;
  sub?: string;
  tone?: VisualTone;
}) {
  return (
    <div className={`rounded-[16px] border px-3 py-2.5 ${visualToneClass(tone)}`}>
      <div className="kr-heading text-[13px] leading-tight">{label}</div>
      {sub ? (
        <div className="kr-body mt-1 text-[10.5px] font-bold leading-snug opacity-70">
          {sub}
        </div>
      ) : null}
    </div>
  );
}

function ArrowStep() {
  return <ChevronRight size={17} strokeWidth={2.8} className="mx-auto text-[#67e8f9]/80" />;
}

function MiniDataTable({
  title,
  columns,
  rows,
  highlight,
}: {
  title: string;
  columns: string[];
  rows: string[][];
  highlight?: (rowIndex: number, columnIndex: number, value: string) => VisualTone | null;
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-cream/10 bg-[#020b24]/70">
      <div className="border-b border-cream/10 px-3 py-2 kr-heading text-[12px] text-cream/78">
        {title}
      </div>
      <div
        className="grid border-b border-cream/10 bg-white/[0.035]"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((column) => (
          <div key={column} className="px-2 py-2 text-center kr-num text-[9px] font-black text-cream/45">
            {column}
          </div>
        ))}
      </div>
      {rows.map((row, rowIndex) => (
        <div
          key={`${title}-${rowIndex}`}
          className="grid border-b border-cream/8 last:border-b-0"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {row.map((value, columnIndex) => {
            const tone = highlight?.(rowIndex, columnIndex, value);
            return (
              <div
                key={`${title}-${rowIndex}-${columnIndex}`}
                className={
                  'm-1 rounded-[10px] px-1.5 py-1.5 text-center kr-body text-[10.5px] font-black leading-tight ' +
                  (tone ? visualToneClass(tone) : 'text-cream/72')
                }
              >
                {value}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

type NormalFormMode = 'roadmap' | 'oneNf' | 'twoNf' | 'threeNf' | 'bcnf';

function NormalFormDiagram({ mode }: { mode: NormalFormMode }) {
  if (mode === 'roadmap') {
    const steps = [
      ['1NF', '한 칸 하나', 'cyan'],
      ['2NF', '부분 종속 제거', 'lime'],
      ['3NF', '이행 종속 제거', 'violet'],
      ['BCNF', '결정자=후보키', 'amber'],
    ] as const;
    return (
      <LearningVisualFrame
        eyebrow="NORMAL FORM"
        title="정규형은 단계별 안전장치"
        caption="1NF부터 BCNF까지 조건이 하나씩 강해집니다. 도·부·이·결 흐름으로 보세요."
      >
        <div className="grid grid-cols-[1fr_18px_1fr] gap-2 sm:grid-cols-[1fr_18px_1fr_18px_1fr_18px_1fr]">
          {steps.map(([label, sub, tone], index) => (
            <Fragment key={label}>
              <VisualPill label={label} sub={sub} tone={tone} />
              {index < steps.length - 1 ? (
                <div className="hidden items-center sm:flex"><ArrowStep /></div>
              ) : null}
            </Fragment>
          ))}
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'oneNf') {
    return (
      <LearningVisualFrame
        eyebrow="1NF"
        title="한 칸에는 값 하나"
        caption="한 칸에 전화번호가 두 개 있으면 검색·수정이 어려워요. 1NF는 값을 원자값으로 나눕니다."
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_24px_1fr] sm:items-center">
          <MiniDataTable
            title="나쁜 표"
            columns={['학생', '전화번호']}
            rows={[['도현', '010-1111, 010-2222']]}
            highlight={(_, column) => (column === 1 ? 'red' : null)}
          />
          <div className="hidden sm:block"><ArrowStep /></div>
          <MiniDataTable
            title="1NF"
            columns={['학생', '전화번호']}
            rows={[
              ['도현', '010-1111'],
              ['도현', '010-2222'],
            ]}
            highlight={(_, column) => (column === 1 ? 'lime' : null)}
          />
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'twoNf') {
    return (
      <LearningVisualFrame
        eyebrow="2NF"
        title="복합키 일부에만 붙은 값 분리"
        caption="성적은 학번+과목코드가 모두 필요하지만, 이름은 학번만으로 정해집니다. 그래서 학생 정보는 따로 빼야 해요."
      >
        <div className="grid gap-3">
          <div className="grid grid-cols-[1fr_22px_1fr] items-center gap-2">
            <div className="grid gap-1.5">
              <VisualPill label="학번 + 과목코드" sub="복합키" tone="cyan" />
            </div>
            <ArrowStep />
            <VisualPill label="성적" sub="전체가 필요" tone="lime" />
          </div>
          <div className="grid grid-cols-[1fr_22px_1fr] items-center gap-2">
            <VisualPill label="학번" sub="키 일부" tone="amber" />
            <ArrowStep />
            <VisualPill label="이름" sub="부분 종속" tone="red" />
          </div>
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'threeNf') {
    return (
      <LearningVisualFrame
        eyebrow="3NF"
        title="중간을 거치는 값 분리"
        caption="학과명은 학생이 직접 정하는 값이 아니라 학과코드가 정합니다. 학과 테이블로 빼면 중복이 줄어요."
      >
        <div className="grid grid-cols-[1fr_18px_1fr_18px_1fr] items-center gap-1.5">
          <VisualPill label="학번" tone="cyan" />
          <ArrowStep />
          <VisualPill label="학과코드" tone="amber" />
          <ArrowStep />
          <VisualPill label="학과명" tone="violet" />
        </div>
      </LearningVisualFrame>
    );
  }

  return (
    <LearningVisualFrame
      eyebrow="BCNF"
      title="결정자는 후보키여야 함"
      caption="다른 값을 정하는 속성이 있다면, 그 속성 자체가 행을 구분할 수 있는 후보키여야 BCNF입니다."
    >
      <div className="grid grid-cols-[1fr_22px_1fr] items-center gap-2">
        <VisualPill label="결정자" sub="다른 값을 정함" tone="amber" />
        <ArrowStep />
        <VisualPill label="후보키" sub="행을 유일하게 구분" tone="lime" />
      </div>
    </LearningVisualFrame>
  );
}

type DenormalizationMode = 'overview' | 'methods' | 'tradeoff';

function DenormalizationDiagram({ mode }: { mode: DenormalizationMode }) {
  if (mode === 'methods') {
    return (
      <LearningVisualFrame
        eyebrow="DENORMALIZATION"
        title="합치기 · 복사하기 · 미리 계산"
        caption="반정규화는 조회가 느린 지점을 확인한 뒤, 필요한 곳에만 쓰는 성능 보정입니다."
      >
        <div className="grid grid-cols-3 gap-2">
          <VisualPill label="합치기" sub="테이블 통합" tone="cyan" />
          <VisualPill label="복사" sub="컬럼 중복" tone="violet" />
          <VisualPill label="계산" sub="요약/파생" tone="lime" />
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'tradeoff') {
    return (
      <LearningVisualFrame
        eyebrow="TRADEOFF"
        title="빨라지는 대신 맞춰야 할 값이 늘어남"
        caption="같은 고객명이 여러 곳에 있으면 한쪽만 바뀌는 순간 데이터가 서로 달라집니다."
      >
        <MiniDataTable
          title="주문 테이블에 고객명 복사"
          columns={['주문ID', '고객ID', '고객명']}
          rows={[
            ['O-1', 'C-7', '토리'],
            ['O-2', 'C-7', '토리님'],
          ]}
          highlight={(row, column) => (column === 2 ? (row === 0 ? 'amber' : 'red') : null)}
        />
      </LearningVisualFrame>
    );
  }

  return (
    <LearningVisualFrame
      eyebrow="NORMALIZE ↔ DENORMALIZE"
      title="안전하게 나누기 vs 빠르게 읽기"
      caption="정규화는 중복을 줄이고, 반정규화는 조회 속도를 위해 일부러 중복을 허용합니다."
    >
      <div className="grid grid-cols-[1fr_22px_1fr] items-center gap-2">
        <VisualPill label="정규화" sub="학생 / 수강 / 과목" tone="cyan" />
        <ArrowStep />
        <VisualPill label="반정규화" sub="자주 보는 값 복사" tone="amber" />
      </div>
    </LearningVisualFrame>
  );
}

type SpecialRelationMode = 'overview' | 'hierarchy' | 'exclusive';

function SpecialRelationDiagram({ mode }: { mode: SpecialRelationMode }) {
  if (mode === 'hierarchy') {
    return (
      <LearningVisualFrame
        eyebrow="SELF REFERENCE"
        title="같은 테이블이 자기 자신을 참조"
        caption="사원 테이블 안의 상사사번이 다시 사원 테이블의 사번을 가리키면 계층형 관계입니다."
      >
        <div className="grid grid-cols-[1fr_22px_1fr_22px_1fr] items-center gap-1.5">
          <VisualPill label="사원" sub="나" tone="cyan" />
          <ArrowStep />
          <VisualPill label="상사사번" sub="FK" tone="amber" />
          <ArrowStep />
          <VisualPill label="사원" sub="상사" tone="violet" />
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'exclusive') {
    return (
      <LearningVisualFrame
        eyebrow="EXCLUSIVE ARC"
        title="여러 후보 중 하나만 선택"
        caption="결제 한 건은 카드 결제이거나 계좌이체일 수 있지만, 동시에 둘 다로 잡지는 않습니다."
      >
        <div className="grid gap-2">
          <VisualPill label="결제" sub="하나의 거래" tone="cyan" />
          <div className="grid grid-cols-2 gap-2">
            <VisualPill label="카드" sub="선택 A" tone="lime" />
            <VisualPill label="계좌이체" sub="선택 B" tone="muted" />
          </div>
        </div>
      </LearningVisualFrame>
    );
  }

  return (
    <LearningVisualFrame
      eyebrow="SPECIAL RELATION"
      title="모델 구조에서 자주 나오는 특수 패턴"
      caption="성능 이야기를 잠깐 내려놓고, 이제 관계 구조 자체가 특이한 경우를 구분합니다."
    >
      <div className="grid grid-cols-2 gap-2">
        <VisualPill label="계층형·순환" sub="자기 자신 참조" tone="cyan" />
        <VisualPill label="상호배타" sub="후보 중 하나" tone="violet" />
      </div>
    </LearningVisualFrame>
  );
}

type TransactionMode = 'transfer' | 'acid' | 'isolation';

function TransactionDiagram({ mode }: { mode: TransactionMode }) {
  if (mode === 'acid') {
    return (
      <LearningVisualFrame
        eyebrow="ACID"
        title="안전한 거래의 4가지 약속"
        caption="원자성은 전부 성공/취소, 일관성은 규칙 유지, 고립성은 간섭 최소화, 지속성은 커밋 결과 보존입니다."
      >
        <div className="grid grid-cols-2 gap-2">
          <VisualPill label="원자성" sub="전부 성공/취소" tone="lime" />
          <VisualPill label="일관성" sub="규칙 유지" tone="cyan" />
          <VisualPill label="고립성" sub="동시 실행 분리" tone="violet" />
          <VisualPill label="지속성" sub="커밋 결과 보존" tone="amber" />
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'isolation') {
    const levels = [
      ['RU', '가장 약함'],
      ['RC', '커밋된 값'],
      ['RR', '반복 읽기'],
      ['Serializable', '가장 강함'],
    ] as const;
    return (
      <LearningVisualFrame
        eyebrow="ISOLATION"
        title="강할수록 안전하지만 느릴 수 있음"
        caption="격리수준은 동시에 실행되는 트랜잭션을 얼마나 엄격하게 분리할지 정하는 단계입니다."
      >
        <div className="grid grid-cols-4 gap-1.5">
          {levels.map(([label, sub], index) => (
            <VisualPill key={label} label={label} sub={sub} tone={index === 3 ? 'lime' : 'cyan'} />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between px-1 kr-num text-[10px] font-black text-cream/45">
          <span>동시성 ↑</span>
          <span>안전성 ↑</span>
        </div>
      </LearningVisualFrame>
    );
  }

  return (
    <LearningVisualFrame
      eyebrow="TRANSACTION"
      title="출금과 입금은 한 덩어리"
      caption="계좌이체는 출금만 성공하거나 입금만 성공하면 안 됩니다. 함께 성공하거나 함께 취소되어야 해요."
    >
      <div className="grid grid-cols-[1fr_22px_1fr_22px_1fr] items-center gap-1.5">
        <VisualPill label="출금" sub="A - 10,000" tone="amber" />
        <ArrowStep />
        <VisualPill label="입금" sub="B + 10,000" tone="cyan" />
        <ArrowStep />
        <VisualPill label="COMMIT" sub="둘 다 성공" tone="lime" />
      </div>
    </LearningVisualFrame>
  );
}

type NullMode = 'meaning' | 'operation' | 'aggregate' | 'sort';

function NullBehaviorDiagram({ mode }: { mode: NullMode }) {
  if (mode === 'operation') {
    return (
      <LearningVisualFrame
        eyebrow="NULL OPERATION"
        title="비교는 UNKNOWN, 산술은 NULL"
        caption="NULL은 모르는 값이라 = NULL로 찾지 않습니다. 계산해도 결과를 알 수 없어 NULL이 됩니다."
      >
        <div className="grid grid-cols-2 gap-2">
          <VisualPill label="col IS NULL" sub="NULL 찾기" tone="lime" />
          <VisualPill label="col = NULL" sub="UNKNOWN" tone="red" />
          <VisualPill label="NULL + 1" sub="NULL" tone="amber" />
          <VisualPill label="NULL * 0" sub="NULL" tone="amber" />
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'aggregate') {
    return (
      <LearningVisualFrame
        eyebrow="COUNT"
        title="행을 세나, 값을 세나"
        caption="COUNT(*)는 행 자체를 세고, COUNT(점수)는 NULL이 아닌 점수 값만 셉니다."
      >
        <MiniDataTable
          title="점수"
          columns={['행', '점수', 'COUNT']}
          rows={[
            ['1', '90', '포함'],
            ['2', 'NULL', '컬럼 제외'],
            ['3', '80', '포함'],
          ]}
          highlight={(_, column, value) => (value === 'NULL' || column === 2 ? 'amber' : null)}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'sort') {
    return (
      <LearningVisualFrame
        eyebrow="ORACLE ORDER"
        title="Oracle ASC에서는 NULL이 뒤쪽"
        caption="DBMS마다 다를 수 있으니 시험에서는 Oracle 기준과 NULLS FIRST/LAST 지정법을 함께 기억하세요."
      >
        <div className="grid grid-cols-4 gap-1.5">
          <VisualPill label="10" tone="cyan" />
          <VisualPill label="20" tone="cyan" />
          <VisualPill label="30" tone="cyan" />
          <VisualPill label="NULL" tone="amber" />
        </div>
      </LearningVisualFrame>
    );
  }

  return (
    <LearningVisualFrame
      eyebrow="NULL"
      title="0도 아니고 빈칸도 아님"
      caption="0은 숫자 값, 빈 문자열은 빈 글자 값, NULL은 값이 없거나 알 수 없다는 표시입니다."
    >
      <div className="grid grid-cols-3 gap-2">
        <VisualPill label="0" sub="숫자 값" tone="cyan" />
        <VisualPill label="''" sub="빈 문자열" tone="violet" />
        <VisualPill label="NULL" sub="모름/없음" tone="amber" />
      </div>
    </LearningVisualFrame>
  );
}

type KeyChoiceMode = 'compare' | 'surrogate' | 'practice';

function KeyChoiceDiagram({ mode }: { mode: KeyChoiceMode }) {
  if (mode === 'surrogate') {
    return (
      <LearningVisualFrame
        eyebrow="SURROGATE KEY"
        title="업무 값이 바뀌어도 PK는 덜 흔들리게"
        caption="자동 id는 의미가 없어서 노출 위험이 낮고, 학번 같은 업무 값은 UNIQUE로 중복만 막을 수 있습니다."
      >
        <MiniDataTable
          title="학생"
          columns={['id', '학번', '이름']}
          rows={[
            ['1', 'S-100', '토리'],
            ['2', 'S-101', '도현'],
          ]}
          highlight={(_, column) => (column === 0 ? 'lime' : column === 1 ? 'amber' : null)}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'practice') {
    return (
      <LearningVisualFrame
        eyebrow="PK + UNIQUE"
        title="연결은 id, 중복 방지는 학번"
        caption="실무에서는 인조 PK로 관계를 안정화하고, 업무상 중복되면 안 되는 값은 UNIQUE로 관리하는 조합을 자주 씁니다."
      >
        <div className="grid grid-cols-[1fr_22px_1fr] items-center gap-2">
          <VisualPill label="id" sub="PK · 내부 연결" tone="lime" />
          <ArrowStep />
          <VisualPill label="학번" sub="UNIQUE · 중복 방지" tone="amber" />
        </div>
      </LearningVisualFrame>
    );
  }

  return (
    <LearningVisualFrame
      eyebrow="NATURAL vs SURROGATE"
      title="업무에 원래 있나, 시스템이 만들었나"
      caption="학번처럼 현실 업무에 이미 있는 값은 본질식별자, 자동 id처럼 시스템이 새로 만든 값은 인조식별자입니다."
    >
      <div className="grid grid-cols-2 gap-2">
        <VisualPill label="학번" sub="본질식별자" tone="cyan" />
        <VisualPill label="id / UUID" sub="인조식별자" tone="violet" />
      </div>
    </LearningVisualFrame>
  );
}

type Adsp3DiagramMode =
  | 'adsp3SummaryDerived'
  | 'adsp3Eda4r'
  | 'adsp3Missing'
  | 'adsp3Outlier'
  | 'adsp3RStructures'
  | 'adsp3Scales'
  | 'adsp3Distribution'
  | 'adsp3Estimator'
  | 'adsp3Clt'
  | 'adsp3Pca'
  | 'adsp3Mds'
  | 'adsp3Hypothesis'
  | 'adsp3Ttest'
  | 'adsp3Regression'
  | 'adsp3Multicollinearity'
  | 'adsp3TimeSeries'
  | 'adsp3Overfit'
  | 'adsp3Ensemble'
  | 'adsp3Association'
  | 'adsp3Clustering'
  | 'adsp3Metrics'
  | 'adsp3Logistic'
  | 'adsp3Tree'
  | 'adsp3Knn'
  | 'adsp3NaiveBayes'
  | 'adsp3Svm'
  | 'adsp3Neural';

type Adsp1DiagramMode =
  | 'dikw'
  | 'dataClassification'
  | 'tacitExplicit'
  | 'seci'
  | 'seciSocialization'
  | 'dbFeatures'
  | 'dwOverview'
  | 'dataMart'
  | 'dataLake'
  | 'warehouseLake'
  | 'olapOverview'
  | 'oltpOverview'
  | 'oltpOlap'
  | 'enterpriseSystems'
  | 'bigDataBackground'
  | 'bigData3v'
  | 'bigDataChange'
  | 'dataScienceAxes'
  | 'hardSoftSkills'
  | 'digitalCamera'
  | 'analysisTypes'
  | 'analysisProcess'
  | 'topDownApproach'
  | 'analysisMethodology'
  | 'priorityMatrix'
  | 'analyticsGovernance'
  | 'maturityStages'
  | 'dataGovernance'
  | 'analysisFeasibility'
  | 'analysisApproachMix'
  | 'projectDefinition'
  | 'readinessAreas'
  | Adsp3DiagramMode;

function Adsp1ConceptDiagram({
  mode,
  stepId,
  turnIdx = 0,
}: {
  mode: Adsp1DiagramMode;
  stepId?: string;
  turnIdx?: number;
}) {
  if (mode.startsWith('adsp3')) {
    return <Adsp3ConceptDiagram mode={mode as Adsp3DiagramMode} stepId={stepId} />;
  }

  if (mode === 'dikw') {
    const rows = [
      {
        label: '지혜',
        sub: '상황에 맞게 적용',
        example: '다른 음료도 B마트가 유리할 수 있음',
        tone: 'lime',
        width: 'w-[46%]',
      },
      {
        label: '지식',
        sub: '반복해서 쓰는 판단 기준',
        example: '콜라는 B마트가 보통 더 싸다',
        tone: 'violet',
        width: 'w-[62%]',
      },
      {
        label: '정보',
        sub: '비교해서 의미가 생긴 값',
        example: 'B마트가 300원 더 싸다',
        tone: 'cyan',
        width: 'w-[78%]',
      },
      {
        label: '데이터',
        sub: '가공 전 단순 값',
        example: 'B마트 콜라 1,500원',
        tone: 'amber',
        width: 'w-[94%]',
      },
    ] as const;

    return (
      <LearningVisualFrame
        eyebrow="DIKW PYRAMID"
        title="아래로 갈수록 많고, 위로 갈수록 가치가 높다"
        caption="DIKW는 데이터가 의사결정에 쓰이기까지 올라가는 4단계입니다. 순서는 데이터 → 정보 → 지식 → 지혜로 고정해서 보세요."
      >
        <div className="grid grid-cols-[44px_1fr_44px] items-stretch gap-2">
          <div className="flex flex-col items-center justify-between py-2">
            <span className="kr-body text-center text-[10px] font-black leading-tight text-[#d1f843]/70">
              가치<br />높음
            </span>
            <div className="my-2 w-px flex-1 rounded-full bg-gradient-to-b from-[#d1f843]/55 via-[#67e8f9]/24 to-[#ffb020]/18" />
            <span className="kr-body text-center text-[10px] font-black leading-tight text-cream/38">
              가치<br />낮음
            </span>
          </div>

          <div className="space-y-2.5">
            {rows.map((row, index) => (
              <motion.div
                key={row.label}
                className={`${row.width} mx-auto rounded-[18px] border px-3 py-2.5 text-center ${visualToneClass(row.tone as VisualTone)}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: index * 0.04 }}
              >
                <div className="kr-heading text-[14px] leading-tight">{row.label}</div>
                <div className="kr-body mt-1 text-[10.5px] font-black leading-snug opacity-72">
                  {row.sub}
                </div>
                <div className="mt-2 rounded-[12px] border border-cream/10 bg-[#020b24]/42 px-2 py-1.5 kr-body text-[10.5px] font-bold leading-snug text-cream/64">
                  {row.example}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between py-2">
            <span className="kr-body text-center text-[10px] font-black leading-tight text-cream/42">
              양<br />적음
            </span>
            <div className="my-2 w-px flex-1 rounded-full bg-gradient-to-b from-[#67e8f9]/18 via-[#67e8f9]/26 to-[#67e8f9]/55" />
            <span className="kr-body text-center text-[10px] font-black leading-tight text-[#67e8f9]/70">
              양<br />많음
            </span>
          </div>
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'dataClassification') {
    return (
      <LearningVisualFrame
        eyebrow="DATA LENSES"
        title="하나의 데이터도 3가지 기준으로 다시 본다"
        caption="분류 문제는 먼저 어떤 기준을 묻는지 잡는 게 핵심입니다. 형태, 표현 방식, 분석 목적은 서로 다른 렌즈예요."
      >
        <div className="rounded-[20px] border border-[#67e8f9]/20 bg-[#67e8f9]/8 px-4 py-3 text-center">
          <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-[#67e8f9]/75">
            SAME DATA
          </div>
          <div className="kr-heading mt-1 text-[18px] text-cream">고객 리뷰 텍스트</div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <VisualPill label="형태" sub="비정형 데이터" tone="cyan" />
          <VisualPill label="표현 방식" sub="정성 데이터" tone="violet" />
          <VisualPill label="분석 목적" sub="범주형으로 변환 가능" tone="lime" />
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'tacitExplicit') {
    return (
      <LearningVisualFrame
        eyebrow="TACIT vs EXPLICIT"
        title="몸 안에 있으면 암묵지, 밖에 적히면 형식지"
        caption="암묵지는 말로 다 옮기기 어려운 감각이고, 형식지는 글·그림·매뉴얼처럼 다른 사람이 바로 읽을 수 있는 지식입니다."
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_26px_1fr] sm:items-stretch">
          <div className="rounded-[20px] border border-[#67e8f9]/24 bg-[#67e8f9]/8 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="kr-heading text-[16px] text-[#dffbff]">암묵지</span>
              <span className="kr-num rounded-full border border-[#67e8f9]/20 bg-[#67e8f9]/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#dffbff]/72">
                몸 안
              </span>
            </div>
            <div className="grid h-20 place-items-center rounded-[16px] border border-cream/10 bg-[#020b24]/46">
              <div className="text-center">
                <div className="text-[26px]" aria-hidden>
                  ?
                </div>
                <div className="kr-body mt-1 text-[11px] font-black text-cream/64">
                  자전거 타는 감각
                </div>
              </div>
            </div>
            <div className="mt-2 kr-body text-[11.5px] font-bold leading-[1.45] text-cream/62">
              직접 보고 따라해야 전해지는 노하우
            </div>
          </div>

          <div className="hidden sm:flex sm:items-center sm:justify-center">
            <ArrowStep />
          </div>

          <div className="rounded-[20px] border border-[#d1f843]/26 bg-[#d1f843]/9 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="kr-heading text-[16px] text-[#e8ff9d]">형식지</span>
              <span className="kr-num rounded-full border border-[#d1f843]/22 bg-[#d1f843]/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#e8ff9d]/72">
                밖으로
              </span>
            </div>
            <div className="grid h-20 place-items-center rounded-[16px] border border-cream/10 bg-[#020b24]/46">
              <div className="text-center">
                <BookOpen size={26} strokeWidth={2.4} className="mx-auto text-[#e8ff9d]" />
                <div className="kr-body mt-1 text-[11px] font-black text-cream/64">
                  자전거 매뉴얼
                </div>
              </div>
            </div>
            <div className="mt-2 kr-body text-[11.5px] font-bold leading-[1.45] text-cream/62">
              글·표·그림으로 읽을 수 있게 정리된 지식
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-[16px] border border-[#ffb020]/20 bg-[#ffb020]/8 px-3 py-2">
          <div className="kr-body text-[11.5px] font-bold leading-[1.45] text-cream/66">
            핵심 질문: “이 지식이 사람 안에 있나, 문서로 밖에 나와 있나?”
          </div>
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'seci') {
    const steps = [
      { label: '공동화', sub: '암묵 → 암묵', tone: 'cyan' },
      { label: '표출화', sub: '암묵 → 형식', tone: 'amber' },
      { label: '연결화', sub: '형식 → 형식', tone: 'violet' },
      { label: '내면화', sub: '형식 → 암묵', tone: 'lime' },
    ] as const;
    return (
      <LearningVisualFrame
        eyebrow="SECI CYCLE"
        title="지식은 암묵지와 형식지를 오가며 자란다"
        caption="시험에서는 사례가 어느 방향인지 묻습니다. 특히 표출화는 사람 안의 노하우를 매뉴얼로 꺼내는 단계라 자주 나와요."
      >
        <div className="grid grid-cols-[1fr_24px_1fr] items-center gap-2">
          <VisualPill label={steps[0].label} sub={steps[0].sub} tone={steps[0].tone as VisualTone} />
          <ArrowStep />
          <VisualPill label={steps[1].label} sub={steps[1].sub} tone={steps[1].tone as VisualTone} />
          <div className="col-span-3 grid grid-cols-[1fr_24px_1fr] items-center gap-2">
            <div className="h-px rounded-full bg-[#67e8f9]/18" />
            <div className="grid h-8 w-8 place-items-center rounded-full border border-cream/10 bg-white/[0.04] kr-num text-[10px] font-black text-cream/48">
              SECI
            </div>
            <div className="h-px rounded-full bg-[#67e8f9]/18" />
          </div>
          <VisualPill label={steps[3].label} sub={steps[3].sub} tone={steps[3].tone as VisualTone} />
          <ArrowStep />
          <VisualPill label={steps[2].label} sub={steps[2].sub} tone={steps[2].tone as VisualTone} />
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'seciSocialization') {
    return (
      <LearningVisualFrame
        eyebrow="SOCIALIZATION"
        title="공동화는 옆에서 보고 따라 배우는 암묵지 전달"
        caption="핵심은 문서가 아니라 함께 있는 경험입니다. 선배의 몸에 있던 감각이 후배의 몸으로 옮겨가면 암묵지 → 암묵지, 즉 공동화예요."
      >
        <div className="grid gap-3">
          <div className="grid grid-cols-[1fr_42px_1fr] items-stretch gap-2">
            <div className="rounded-[20px] border border-[#67e8f9]/24 bg-[#67e8f9]/8 p-3">
              <div className="flex items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-[#67e8f9]/25 bg-[#67e8f9]/10 text-[#dffbff]">
                  <UserRound size={20} strokeWidth={2.4} />
                </div>
                <div>
                  <div className="kr-heading text-[16px] text-[#dffbff]">선배</div>
                  <div className="kr-body text-[10.5px] font-black text-cream/48">암묵지 보유</div>
                </div>
              </div>
              <div className="mt-3 rounded-[16px] border border-cream/10 bg-[#020b24]/44 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Music2 size={17} strokeWidth={2.4} className="text-[#67e8f9]" />
                  <span className="kr-body text-[11.5px] font-black text-cream/66">
                    악기 연주 감각
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="h-10 w-px bg-gradient-to-b from-transparent via-[#67e8f9]/42 to-transparent sm:hidden" />
              <div className="grid h-10 w-10 place-items-center rounded-full border border-[#d1f843]/24 bg-[#d1f843]/10 kr-num text-[10px] font-black text-[#e8ff9d]">
                보기
              </div>
              <div className="h-10 w-px bg-gradient-to-b from-transparent via-[#67e8f9]/42 to-transparent sm:hidden" />
            </div>

            <div className="rounded-[20px] border border-[#d1f843]/24 bg-[#d1f843]/8 p-3">
              <div className="flex items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-[#d1f843]/25 bg-[#d1f843]/10 text-[#e8ff9d]">
                  <UserRound size={20} strokeWidth={2.4} />
                </div>
                <div>
                  <div className="kr-heading text-[16px] text-[#e8ff9d]">후배</div>
                  <div className="kr-body text-[10.5px] font-black text-cream/48">따라 하며 습득</div>
                </div>
              </div>
              <div className="mt-3 rounded-[16px] border border-cream/10 bg-[#020b24]/44 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Music2 size={17} strokeWidth={2.4} className="text-[#d1f843]" />
                  <span className="kr-body text-[11.5px] font-black text-cream/66">
                    몸으로 익힌 감각
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <VisualPill label="암묵지" sub="선배 몸 안" tone="cyan" />
            <VisualPill label="문서 없음" sub="매뉴얼로 적지 않음" tone="muted" />
            <VisualPill label="암묵지" sub="후배 몸 안" tone="lime" />
          </div>
          <div className="rounded-[16px] border border-[#ffb020]/18 bg-[#ffb020]/8 px-3 py-2">
            <div className="kr-body text-[11.5px] font-bold leading-[1.45] text-cream/66">
              시험 포인트: 매뉴얼로 정리하면 표출화, 옆에서 직접 보여주며 익히면 공동화입니다.
            </div>
          </div>
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'dbFeatures') {
    return (
      <LearningVisualFrame
        eyebrow="DATABASE"
        title="DB는 공통저변으로 기억한다"
        caption="공용, 통합, 저장, 변화는 DB의 본질 특징입니다. 보기에서 낯선 단어가 나오면 이 4가지에 들어가는지 먼저 확인하세요."
      >
        <div className="relative rounded-[22px] border border-cream/10 bg-[#020b24]/62 p-3">
          <div className="mx-auto mb-3 flex h-24 w-24 flex-col items-center justify-center rounded-full border border-[#67e8f9]/30 bg-[#67e8f9]/10">
            <Database size={25} strokeWidth={2.4} className="text-[#dffbff]" />
            <span className="kr-heading mt-1 text-[14px] text-[#dffbff]">DB</span>
          </div>
          <VisualPillGrid
            columns="grid-cols-2"
            items={[
              { label: '공용', sub: '여러 사용자가 함께', tone: 'cyan' },
              { label: '통합', sub: '중복 없이 한곳에', tone: 'lime' },
              { label: '저장', sub: '저장매체에 보관', tone: 'violet' },
              { label: '변화', sub: '추가·수정에도 정확', tone: 'amber' },
            ]}
          />
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'dwOverview') {
    return (
      <LearningVisualFrame
        eyebrow="DATA WAREHOUSE"
        title="DW는 흩어진 데이터를 모아 둔 분석 창고"
        caption="처음에는 이것만 잡으면 됩니다. 여러 시스템에 흩어진 데이터를 한곳에 정리해, 보고서와 의사결정에 쓰기 쉽게 만든 저장소가 DW예요."
      >
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <VisualPill label="POS" sub="매출" tone="muted" />
            <VisualPill label="ERP" sub="자원" tone="muted" />
            <VisualPill label="CRM" sub="고객" tone="muted" />
          </div>

          <div className="mx-auto flex max-w-[260px] items-center justify-center gap-2">
            <div className="h-px flex-1 rounded-full bg-gradient-to-r from-transparent to-[#67e8f9]/32" />
            <div className="rounded-full border border-[#67e8f9]/24 bg-[#67e8f9]/10 px-3 py-1 kr-num text-[10px] font-black uppercase tracking-[0.12em] text-[#dffbff]/74">
              모아서 정리
            </div>
            <div className="h-px flex-1 rounded-full bg-gradient-to-l from-transparent to-[#67e8f9]/32" />
          </div>

          <div className="rounded-[24px] border border-[#67e8f9]/24 bg-[#67e8f9]/8 p-4 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-[22px] border border-[#67e8f9]/30 bg-[#020b24]/48">
              <Database size={30} strokeWidth={2.4} className="text-[#dffbff]" />
            </div>
            <div className="kr-heading mt-3 text-[20px] text-[#dffbff]">DW</div>
            <div className="kr-body mt-1 text-[12px] font-black leading-snug text-cream/58">
              분석용으로 정돈된 큰 데이터 창고
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <VisualPill label="보고서" sub="한 화면에서 보기" tone="cyan" />
            <VisualPill label="의사결정" sub="매출·고객·재고 판단" tone="lime" />
          </div>
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'dataMart') {
    const focusByStep: Record<string, string> = {
      'adsp-1-1-s4-dm': 'concept',
      'adsp-1-1-s4-dm-purpose': 'purpose',
      'adsp-1-1-s4-dm-features': 'type',
    };
    const focus = stepId ? focusByStep[stepId] : 'concept';
    const isPurpose = focus === 'purpose';
    const isType = focus === 'type';

    return (
      <LearningVisualFrame
        eyebrow="DATA MART"
        title={
          isPurpose
            ? 'DM은 부서가 자기 데이터만 빠르게 보는 작은 창고'
            : isType
              ? 'DM은 DW에서 떼어오거나, 독립적으로 만들 수 있다'
              : 'DM은 DW에서 필요한 부분만 떼어낸 작은 분석 마트'
        }
        caption={
          isType
            ? '종속형 DM은 DW에서 필요한 데이터를 가져오고, 독립형 DM은 부서가 별도로 만든 작은 저장소입니다. 시험에서는 출처를 보고 구분하세요.'
            : 'DW가 회사 전체 분석 창고라면, DM은 마케팅·재무·인사처럼 특정 부서나 주제만 빠르게 보는 작은 창고입니다.'
        }
      >
        <div className="space-y-3">
          <div className="rounded-[22px] border border-[#67e8f9]/22 bg-[#67e8f9]/8 p-4 text-center">
            <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-[#67e8f9]/72">
              DW
            </div>
            <div className="kr-heading mt-1 text-[18px] text-[#dffbff]">회사 전체 데이터 창고</div>
            <div className="kr-body mt-1 text-[11px] font-bold text-cream/52">
              매출 · 고객 · 인사 · 재고를 통합
            </div>
          </div>

          <div className="mx-auto flex max-w-[260px] items-center justify-center gap-2">
            <div className="h-px flex-1 rounded-full bg-gradient-to-r from-transparent to-[#d1f843]/34" />
            <div className="rounded-full border border-[#d1f843]/22 bg-[#d1f843]/9 px-3 py-1 kr-num text-[10px] font-black uppercase tracking-[0.12em] text-[#e8ff9d]/74">
              필요한 부분만
            </div>
            <div className="h-px flex-1 rounded-full bg-gradient-to-l from-transparent to-[#d1f843]/34" />
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { label: '마케팅 DM', sub: '고객·캠페인', tone: 'lime' as VisualTone },
              { label: '재무 DM', sub: '매출·비용', tone: 'amber' as VisualTone },
              { label: '인사 DM', sub: '직원·급여', tone: 'violet' as VisualTone },
            ].map((mart, index) => (
              <motion.div
                key={mart.label}
                className={
                  'rounded-[18px] border px-3 py-3 ' +
                  (isPurpose || (!isType && index === 0)
                    ? `${visualToneClass(mart.tone)} shadow-[0_0_0_1px_rgba(209,248,67,0.16)]`
                    : `${visualToneClass(mart.tone)} opacity-86`)
                }
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, delay: index * 0.035 }}
              >
                <div className="kr-heading text-[14px] leading-tight">{mart.label}</div>
                <div className="kr-body mt-1 text-[10.5px] font-black leading-snug opacity-72">
                  {mart.sub}
                </div>
                <div className="mt-3 rounded-[12px] border border-current/10 bg-[#020b24]/30 px-2.5 py-2 kr-body text-[10.5px] font-bold leading-snug opacity-74">
                  부서가 바로 쓰는 작은 분석 창고
                </div>
              </motion.div>
            ))}
          </div>

          {isType ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <VisualPill label="종속형 DM" sub="DW에서 가져옴" tone="cyan" />
              <VisualPill label="독립형 DM" sub="부서가 별도로 구축" tone="violet" />
            </div>
          ) : (
            <div className="rounded-[16px] border border-cream/10 bg-white/[0.035] px-3 py-2.5">
              <div className="kr-body text-[11.5px] font-bold leading-[1.5] text-cream/66">
                기억 포인트: DW는 전사 통합, DM은 부서·주제 특화입니다.
              </div>
            </div>
          )}
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'dataLake') {
    const focusByStep: Record<string, 'concept' | 'purpose' | 'features'> = {
      'adsp-1-1-s4-lake': 'concept',
      'adsp-1-1-s4-lake-purpose': 'purpose',
      'adsp-1-1-s4-lake-features': 'features',
    };
    const focus = stepId ? focusByStep[stepId] : 'concept';
    const isPurpose = focus === 'purpose';
    const isFeatures = focus === 'features';
    const rawItems: Array<{ label: string; sub: string; tone: VisualTone }> = [
      { label: '표 데이터', sub: '정형', tone: 'cyan' },
      { label: '로그', sub: '반정형', tone: 'violet' },
      { label: '사진·영상', sub: '비정형', tone: 'lime' },
      { label: 'SNS 글', sub: '텍스트 원본', tone: 'amber' },
    ];

    return (
      <LearningVisualFrame
        eyebrow="DATA LAKE"
        title={
          isPurpose
            ? 'Data Lake는 일단 담아두고, 나중에 여러 분석에 꺼내 쓴다'
            : isFeatures
              ? 'Data Lake는 원본 그대로 담지만, 관리가 약하면 늪이 된다'
              : 'Data Lake는 정제 전 원시 데이터를 넓게 담아두는 호수'
        }
        caption={
          isFeatures
            ? '핵심은 Schema-on-Read, 모든 형태 원시 저장, 대규모 분산 저장, 그리고 Data Swamp 위험입니다.'
            : 'DW가 정리된 분석 창고라면, Data Lake는 사진·영상·로그·SNS 글까지 원본 상태로 먼저 받아두는 큰 저장소입니다.'
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {rawItems.map((item, index) => (
              <motion.div
                key={item.label}
                className={`rounded-[16px] border px-3 py-2.5 ${visualToneClass(item.tone)}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, delay: index * 0.035 }}
              >
                <div className="kr-heading text-[13px] leading-tight">{item.label}</div>
                <div className="kr-body mt-1 text-[10.5px] font-black leading-snug opacity-68">
                  {item.sub}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mx-auto flex max-w-[270px] items-center justify-center gap-2">
            <div className="h-px flex-1 rounded-full bg-gradient-to-r from-transparent to-[#67e8f9]/34" />
            <div className="rounded-full border border-[#67e8f9]/22 bg-[#67e8f9]/9 px-3 py-1 kr-num text-[10px] font-black uppercase tracking-[0.12em] text-[#dffbff]/74">
              원본 그대로 먼저 저장
            </div>
            <div className="h-px flex-1 rounded-full bg-gradient-to-l from-transparent to-[#67e8f9]/34" />
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-[#67e8f9]/26 bg-[#061a36]/72 p-4">
            <div className="absolute inset-x-6 bottom-3 h-16 rounded-[999px] bg-[#67e8f9]/12 blur-2xl" />
            <div className="relative">
              <div className="mx-auto flex h-28 max-w-[320px] items-end justify-center rounded-b-[999px] rounded-t-[70px] border border-[#67e8f9]/34 bg-gradient-to-b from-[#0b254d] to-[#0b3b62] px-5 pb-5 shadow-[inset_0_10px_26px_rgba(103,232,249,0.12)]">
                <div className="text-center">
                  <div className="kr-num text-[9px] font-black uppercase tracking-[0.18em] text-[#67e8f9]/72">
                    RAW DATA LAKE
                  </div>
                  <div className="kr-heading mt-1 text-[20px] text-[#dffbff]">원시 데이터 호수</div>
                  <div className="kr-body mt-1 text-[11px] font-bold text-cream/58">
                    아직 요리하지 않은 재료를 넓게 보관
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isPurpose ? (
            <div className="grid gap-2 sm:grid-cols-3">
              <VisualPill label="ML 학습" sub="나중에 가공" tone="lime" />
              <VisualPill label="로그 탐색" sub="문제 추적" tone="cyan" />
              <VisualPill label="SNS 분석" sub="트렌드 확인" tone="violet" />
            </div>
          ) : isFeatures ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <VisualPill label="Schema-on-Read" sub="읽을 때 구조 적용" tone="cyan" />
              <VisualPill label="모든 형태 원시" sub="정형·반정형·비정형" tone="lime" />
              <VisualPill label="대규모 분산 저장" sub="HDFS·S3 같은 저장" tone="violet" />
              <VisualPill label="Data Swamp 주의" sub="관리 없으면 늪" tone="amber" />
            </div>
          ) : (
            <div className="rounded-[16px] border border-cream/10 bg-white/[0.035] px-3 py-2.5">
              <div className="kr-body text-[11.5px] font-bold leading-[1.5] text-cream/66">
                기억 포인트: DW는 정리해서 저장, Data Lake는 원본을 먼저 담고 나중에 해석합니다.
              </div>
            </div>
          )}
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'warehouseLake') {
    return (
      <LearningVisualFrame
        eyebrow="DW vs DATA LAKE"
        title="창고는 정리해서, 호수는 원본 그대로"
        caption="DW는 분석 목적에 맞게 정제된 데이터 창고, Data Lake는 정형·반정형·비정형 원천 데이터를 넓게 담아두는 저장소입니다."
      >
        <div className="grid gap-2 sm:grid-cols-[1fr_24px_1fr] sm:items-center">
          <div className="space-y-2">
            <VisualPill label="POS · ERP · CRM" sub="운영 시스템" tone="muted" />
            <VisualPill label="ETL" sub="가져와서 다듬고 적재" tone="amber" />
            <VisualPill label="DW" sub="정제된 분석 창고" tone="cyan" />
          </div>
          <div className="hidden sm:block">
            <ArrowStep />
          </div>
          <div className="space-y-2">
            <VisualPill label="로그 · 이미지 · 센서" sub="형태가 제각각" tone="muted" />
            <VisualPill label="원본 저장" sub="먼저 담고 나중에 해석" tone="violet" />
            <VisualPill label="Data Lake" sub="원천 데이터 호수" tone="lime" />
          </div>
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'olapOverview') {
    return (
      <LearningVisualFrame
        eyebrow="OLAP"
        title="OLAP은 쌓인 데이터를 여러 각도로 보는 분석 도구"
        caption="OLAP은 주문을 처리하는 시스템이 아니라, 이미 모인 데이터를 지역·시기·상품 같은 축으로 잘라 보며 의사결정을 돕는 분석 방식입니다."
      >
        <div className="space-y-3">
          <div className="rounded-[24px] border border-[#d1f843]/20 bg-[#d1f843]/8 p-4">
            <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-[#e8ff9d]/70">
              SALES CUBE
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <VisualPill label="지역" sub="서울·대구" tone="cyan" />
              <VisualPill label="시기" sub="월·분기" tone="violet" />
              <VisualPill label="상품" sub="커피·빵" tone="lime" />
            </div>
            <div className="mt-3 rounded-[18px] border border-cream/10 bg-[#020b24]/46 p-3 text-center">
              <div className="kr-heading text-[18px] text-cream">월별 매출을 요약</div>
              <div className="kr-body mt-1 text-[11.5px] font-bold text-cream/54">
                여러 축을 바꿔가며 빠르게 조회
              </div>
            </div>
          </div>
          <VisualPillGrid
            columns="grid-cols-2"
            items={[
              { label: '요약', sub: '합계·평균 집계', tone: 'lime' },
              { label: '분석', sub: '추세와 비교 확인', tone: 'cyan' },
            ]}
          />
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'oltpOverview') {
    return (
      <LearningVisualFrame
        eyebrow="OLTP"
        title="OLTP는 지금 일어난 거래를 바로 처리한다"
        caption="카페 주문, 쇼핑몰 결제, 은행 출금처럼 짧은 거래를 빠르게 기록하고 정확히 반영하는 운영 시스템입니다."
      >
        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_24px_1fr_24px_1fr] items-center gap-2">
            <VisualPill label="주문" sub="손님 요청" tone="cyan" />
            <ArrowStep />
            <VisualPill label="결제" sub="즉시 승인" tone="lime" />
            <ArrowStep />
            <VisualPill label="재고" sub="바로 반영" tone="violet" />
          </div>
          <div className="rounded-[24px] border border-[#67e8f9]/20 bg-[#67e8f9]/8 p-4 text-center">
            <div className="kr-heading text-[18px] text-[#dffbff]">짧은 트랜잭션</div>
            <div className="kr-body mt-1 text-[11.5px] font-bold text-cream/58">
              insert · update · delete를 빠르고 정확하게 처리
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <VisualPill label="빠름" sub="ms 응답" tone="cyan" />
              <VisualPill label="정확" sub="일관성 유지" tone="lime" />
              <VisualPill label="운영" sub="실시간 업무" tone="amber" />
            </div>
          </div>
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'oltpOlap') {
    return (
      <LearningVisualFrame
        eyebrow="OLTP vs OLAP"
        title="OLTP까지 배운 뒤 둘을 비교하면 선명하다"
        caption="OLTP는 운영 현장에서 거래를 즉시 처리하고, OLAP은 쌓인 데이터를 여러 각도로 분석합니다. 시험에서는 목적과 쿼리 성격을 나눠 묻습니다."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <MiniDataTable
            title="OLTP"
            columns={['상황', '목표']}
            rows={[
              ['결제', '즉시 기록'],
              ['주문', '정확한 처리'],
              ['재고', '실시간 반영'],
            ]}
            highlight={(_, column) => (column === 1 ? 'cyan' : null)}
          />
          <MiniDataTable
            title="OLAP"
            columns={['상황', '목표']}
            rows={[
              ['월별 매출', '요약'],
              ['지역 비교', '분석'],
              ['상품 추세', '의사결정'],
            ]}
            highlight={(_, column) => (column === 1 ? 'lime' : null)}
          />
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'enterpriseSystems') {
    const activeByStep: Record<string, string> = {
      'adsp-1-1-s5-dbms': 'DBMS',
      'adsp-1-1-s5-erp': 'ERP',
      'adsp-1-1-s5-crm': 'CRM',
      'adsp-1-1-s5-scm': 'SCM',
      'adsp-1-1-s5-kms': 'KMS',
      'adsp-1-1-s5-bi': 'BI',
      'adsp-1-1-s5-ba': 'BA',
    };
    const activeKey = stepId ? activeByStep[stepId] : undefined;
    const systems: Array<{
      key: string;
      label: string;
      sub: string;
      work: string;
      tone: VisualTone;
    }> = [
      { key: 'DBMS', label: 'DBMS', sub: '데이터 저장 기반', work: '모든 시스템의 바닥', tone: 'muted' },
      { key: 'ERP', label: 'ERP', sub: '내부 자원 통합', work: '인사·회계·생산을 한곳에', tone: 'cyan' },
      { key: 'CRM', label: 'CRM', sub: '고객 관계 관리', work: '구매·상담·마케팅 기록', tone: 'lime' },
      { key: 'SCM', label: 'SCM', sub: '공급망 흐름 관리', work: '조달·재고·물류 연결', tone: 'amber' },
      { key: 'KMS', label: 'KMS', sub: '조직 지식 관리', work: '문서·노하우를 남김', tone: 'violet' },
      { key: 'BI', label: 'BI', sub: '보고서·대시보드', work: '지금/과거를 한눈에', tone: 'cyan' },
      { key: 'BA', label: 'BA', sub: '고급 분석·예측', work: '왜/앞으로를 분석', tone: 'lime' },
    ];

    return (
      <LearningVisualFrame
        eyebrow="ENTERPRISE DATA"
        title={activeKey ? `${activeKey}가 맡은 일을 켜서 본다` : '회사 데이터 시스템은 맡은 일이 다르다'}
        caption={
          activeKey
            ? `전체 지도는 그대로 두고, 지금 배우는 ${activeKey}만 밝게 표시했습니다. 약어보다 맡은 일을 먼저 보면 훨씬 덜 헷갈립니다.`
            : '전체 지도를 먼저 보고, 다음 단계부터 DBMS, ERP, CRM처럼 하나씩 불이 켜지는 방식으로 익힙니다.'
        }
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {systems.map((system, index) => {
            const active = activeKey === system.key;
            const dim = activeKey && !active;
            return (
              <motion.div
                key={system.key}
                className={
                  'relative overflow-hidden rounded-[18px] border px-3 py-3 transition-colors ' +
                  (active
                    ? `${visualToneClass(system.tone)} shadow-[0_0_0_1px_rgba(209,248,67,0.26),0_10px_30px_rgba(209,248,67,0.08)]`
                    : dim
                      ? 'border-cream/8 bg-white/[0.025] text-cream/34'
                      : `${visualToneClass(system.tone)} opacity-90`)
                }
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, delay: index * 0.025 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="kr-heading text-[15px] leading-tight">{system.label}</div>
                    <div className="kr-body mt-1 text-[10.5px] font-black leading-snug opacity-72">
                      {system.sub}
                    </div>
                  </div>
                  <div
                    className={
                      'mt-0.5 h-2.5 w-2.5 rounded-full border ' +
                      (active
                        ? 'border-[#d1f843]/70 bg-[#d1f843]'
                        : 'border-cream/12 bg-white/[0.045]')
                    }
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 rounded-[12px] border border-current/10 bg-[#020b24]/30 px-2.5 py-2 kr-body text-[10.5px] font-bold leading-snug opacity-74">
                  {system.work}
                </div>
              </motion.div>
            );
          })}
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'bigDataBackground') {
    const activeIndex = turnIdx >= 1 && turnIdx <= 5 ? turnIdx - 1 : -1;
    const factors: Array<{
      label: string;
      sub: string;
      example: string;
      tone: VisualTone;
    }> = [
      { label: '저장', sub: '싸게 많이 보관', example: 'HDD · SSD', tone: 'cyan' },
      { label: '병렬', sub: '나눠서 빠르게 처리', example: 'Hadoop · Spark', tone: 'violet' },
      { label: '인터넷', sub: '대용량 빠른 전송', example: '5G · 광케이블', tone: 'lime' },
      { label: '클라우드', sub: '서버를 빌려 씀', example: 'AWS · GCP', tone: 'amber' },
      { label: 'IoT·모바일', sub: '기기가 데이터 생산', example: '폰 · 센서 · 자동차', tone: 'cyan' },
    ];

    return (
      <LearningVisualFrame
        eyebrow="BIG DATA BACKGROUND"
        title="5가지 조건이 모여 빅데이터 시대가 됐다"
        caption="처음에는 저장·병렬·인터넷·클라우드·IoT/모바일이 동시에 커졌다고 잡으면 됩니다. 대화를 넘길 때마다 지금 보는 조건만 켜집니다."
      >
        <div className="space-y-3">
          <div className="grid gap-2">
            {factors.map((factor, index) => {
              const active = index === activeIndex;
              const dim = activeIndex >= 0 && !active;
              return (
                <motion.div
                  key={factor.label}
                  className={
                    'grid grid-cols-[34px_1fr] items-center gap-2 rounded-[17px] border px-3 py-2.5 transition-colors ' +
                    (active
                      ? `${visualToneClass(factor.tone)} shadow-[0_0_0_1px_rgba(209,248,67,0.18)]`
                      : dim
                        ? 'border-cream/8 bg-white/[0.025] text-cream/34'
                        : 'border-cream/10 bg-white/[0.035] text-cream/62')
                  }
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.16, delay: index * 0.03 }}
                >
                  <div
                    className={
                      'grid h-8 w-8 place-items-center rounded-full border kr-num text-[11px] font-black ' +
                      (active
                        ? 'border-[#d1f843]/60 bg-[#d1f843]/16 text-[#e8ff9d]'
                        : 'border-cream/12 bg-[#020b24]/36 text-cream/45')
                    }
                  >
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="kr-heading text-[13.5px] leading-tight">{factor.label}</div>
                      <div className="kr-num text-[9px] font-black uppercase tracking-[0.1em] opacity-50">
                        {factor.example}
                      </div>
                    </div>
                    <div className="kr-body mt-1 text-[10.5px] font-bold leading-snug opacity-72">
                      {factor.sub}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mx-auto flex max-w-[270px] items-center justify-center gap-2">
            <div className="h-px flex-1 rounded-full bg-gradient-to-r from-transparent to-[#67e8f9]/30" />
            <div className="rounded-full border border-[#67e8f9]/22 bg-[#67e8f9]/9 px-3 py-1 kr-num text-[10px] font-black uppercase tracking-[0.12em] text-[#dffbff]/72">
              동시에 커짐
            </div>
            <div className="h-px flex-1 rounded-full bg-gradient-to-l from-transparent to-[#67e8f9]/30" />
          </div>

          <div className="rounded-[20px] border border-[#d1f843]/18 bg-[#d1f843]/8 px-4 py-3 text-center">
            <div className="kr-heading text-[18px] text-[#e8ff9d]">빅데이터 등장</div>
            <div className="kr-body mt-1 text-[11.5px] font-bold text-cream/58">
              많이 만들고, 싸게 저장하고, 빠르게 처리할 수 있게 됨
            </div>
          </div>
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'bigData3v') {
    const activeByStep: Record<string, string> = {
      'adsp-1-2-s1-volume': 'Volume',
      'adsp-1-2-s1-variety': 'Variety',
      'adsp-1-2-s1-velocity': 'Velocity',
    };
    const activeKey = stepId
      ? activeByStep[stepId] ?? (stepId === 'adsp-1-2-s1-3v' && turnIdx === 1 ? 'Volume' : undefined)
      : undefined;
    const vItems: Array<{
      key: string;
      label: string;
      sub: string;
      example: string;
      tone: VisualTone;
    }> = [
      { key: 'Volume', label: 'Volume', sub: '양 · 규모', example: 'PB급 로그', tone: 'cyan' },
      { key: 'Variety', label: 'Variety', sub: '형태 다양성', example: '정형+이미지+센서', tone: 'violet' },
      { key: 'Velocity', label: 'Velocity', sub: '생성·처리 속도', example: '실시간 스트리밍', tone: 'lime' },
    ];

    return (
      <LearningVisualFrame
        eyebrow="BIG DATA 3V"
        title={activeKey ? `${activeKey}만 켜서 본다` : '빅데이터는 양·형태·속도가 동시에 커진다'}
        caption={
          activeKey
            ? `전체 3V 지도는 그대로 두고, 지금 배우는 ${activeKey}만 밝게 표시했습니다. 보기에서 무엇을 강조하는지 먼저 잡으세요.`
            : '3V는 Volume, Variety, Velocity입니다. 다음 단계부터 양, 형태, 속도가 하나씩 켜지며 구분됩니다.'
        }
      >
        <div className="grid gap-2 sm:grid-cols-3">
          {vItems.map((item, index) => {
            const active = activeKey === item.key;
            const dim = activeKey && !active;
            return (
              <motion.div
                key={item.key}
                className={
                  'relative overflow-hidden rounded-[18px] border px-3 py-3 transition-colors ' +
                  (active
                    ? `${visualToneClass(item.tone)} shadow-[0_0_0_1px_rgba(209,248,67,0.24),0_10px_28px_rgba(209,248,67,0.07)]`
                    : dim
                      ? 'border-cream/8 bg-white/[0.025] text-cream/34'
                      : `${visualToneClass(item.tone)} opacity-90`)
                }
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, delay: index * 0.035 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="kr-heading text-[15px] leading-tight">{item.label}</div>
                    <div className="kr-body mt-1 text-[10.5px] font-black leading-snug opacity-72">
                      {item.sub}
                    </div>
                  </div>
                  <div
                    className={
                      'mt-0.5 h-2.5 w-2.5 rounded-full border ' +
                      (active
                        ? 'border-[#d1f843]/70 bg-[#d1f843]'
                        : 'border-cream/12 bg-white/[0.045]')
                    }
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 rounded-[12px] border border-current/10 bg-[#020b24]/30 px-2.5 py-2 kr-body text-[10.5px] font-bold leading-snug opacity-74">
                  {item.example}
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <VisualPill label="+ Value" sub="가치" tone="amber" />
          <VisualPill label="+ Veracity" sub="진실성" tone="amber" />
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'dataScienceAxes') {
    return (
      <LearningVisualFrame
        eyebrow="DATA SCIENCE"
        title="데이터 사이언스는 분석·기술·비즈니스가 만나는 지점"
        caption="통계학만으로 끝나는 게 아니라, 데이터를 다루는 기술과 실제 문제를 가치로 바꾸는 비즈니스 감각까지 함께 필요합니다."
      >
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <VisualPill label="Analytics" sub="데이터로 답 찾기" tone="cyan" />
            <VisualPill label="IT" sub="데이터를 다루는 기술" tone="violet" />
            <VisualPill label="Business" sub="문제와 의사결정" tone="lime" />
          </div>
          <div className="relative mx-auto h-[180px] max-w-[340px]">
            <div className="absolute left-1/2 top-2 h-[118px] w-[118px] -translate-x-1/2 rounded-full border border-[#67e8f9]/28 bg-[#67e8f9]/10" />
            <div className="absolute left-[20%] bottom-3 h-[118px] w-[118px] rounded-full border border-[#c084fc]/28 bg-[#c084fc]/10" />
            <div className="absolute right-[20%] bottom-3 h-[118px] w-[118px] rounded-full border border-[#d1f843]/28 bg-[#d1f843]/10" />
            <div className="absolute inset-x-0 top-[70px] mx-auto flex h-[70px] w-[170px] items-center justify-center rounded-[26px] border border-cream/18 bg-[#020b24]/78 px-4 text-center shadow-[0_14px_32px_rgba(0,0,0,0.24)]">
              <div>
                <div className="kr-num text-[9px] font-black uppercase tracking-[0.18em] text-[#d1f843]/78">
                  INTERSECTION
                </div>
                <div className="kr-heading mt-1 text-[19px] leading-tight text-cream">
                  데이터 사이언스
                </div>
              </div>
            </div>
            <div className="absolute left-1/2 top-7 -translate-x-1/2 kr-heading text-[12px] text-[#dffbff]">
              분석
            </div>
            <div className="absolute bottom-10 left-[25%] kr-heading text-[12px] text-[#eadcff]">
              기술
            </div>
            <div className="absolute bottom-10 right-[19%] kr-heading text-[12px] text-[#e8ff9d]">
              비즈니스
            </div>
          </div>
          <VisualPill label="AI 비" sub="Analytics · IT · Business" tone="amber" />
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'hardSoftSkills') {
    return (
      <LearningVisualFrame
        eyebrow="HARD / SOFT"
        title="Hard Skill은 도구를 다루는 힘, Soft Skill은 가치를 전하는 힘"
        caption="SQL과 머신러닝을 잘해도 방향을 못 잡으면 가치가 작고, 통찰이 좋아도 구현할 기술이 없으면 결과로 이어지기 어렵습니다."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <motion.div
            className={`rounded-[22px] border p-4 ${visualToneClass('cyan')}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
          >
            <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] opacity-70">
              HARD SKILL
            </div>
            <div className="kr-heading mt-1 text-[19px] leading-tight">배워서 익히는 기술</div>
            <div className="mt-3 grid gap-2">
              <VisualPill label="SQL" sub="데이터 조회" tone="cyan" />
              <VisualPill label="ML" sub="모델 만들기" tone="cyan" />
              <VisualPill label="Programming" sub="코드 구현" tone="cyan" />
            </div>
          </motion.div>
          <motion.div
            className={`rounded-[22px] border p-4 ${visualToneClass('lime')}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, delay: 0.05 }}
          >
            <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] opacity-70">
              SOFT SKILL
            </div>
            <div className="kr-heading mt-1 text-[19px] leading-tight">방향을 잡고 설득하는 힘</div>
            <div className="mt-3 grid gap-2">
              <VisualPill label="통찰" sub="무엇이 중요한지" tone="lime" />
              <VisualPill label="스토리텔링" sub="쉽게 전달" tone="lime" />
              <VisualPill label="협력" sub="팀과 의사결정" tone="lime" />
            </div>
          </motion.div>
        </div>
        <div className="mt-3 rounded-[18px] border border-cream/10 bg-white/[0.035] px-3 py-2.5 text-center">
          <div className="kr-body text-[11.5px] font-bold leading-[1.5] text-cream/66">
            기억 포인트: Hard는 기술, Soft는 태도·관점·소통입니다.
          </div>
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'digitalCamera') {
    const activeByStep: Record<string, string> = {
      'adsp-1-3-s3-c': 'Communication',
      'adsp-1-3-s3-a': 'Analytics',
      'adsp-1-3-s3-m': 'Math',
      'adsp-1-3-s3-e': 'Engineering',
      'adsp-1-3-s3-r': 'Research',
      'adsp-1-3-s3-art': 'Art',
    };
    const activeKey =
      stepId && stepId !== 'adsp-1-3-s3-review'
        ? activeByStep[stepId]
        : undefined;
    const reviewMode = stepId === 'adsp-1-3-s3-review';
    const skills: Array<{
      key: string;
      letter: string;
      label: string;
      sub: string;
      tone: VisualTone;
    }> = [
      { key: 'Communication', letter: 'C', label: 'Communication', sub: '전달·스토리텔링', tone: 'cyan' },
      { key: 'Analytics', letter: 'A', label: 'Analytics', sub: '문제·기법 선택', tone: 'lime' },
      { key: 'Math', letter: 'M', label: 'Math', sub: '확률·통계 기반', tone: 'violet' },
      { key: 'Engineering', letter: 'E', label: 'Engineering', sub: 'DB·코드·파이프라인', tone: 'amber' },
      { key: 'Research', letter: 'R', label: 'Research', sub: '새 가설·실험', tone: 'cyan' },
      { key: 'Art', letter: 'A', label: 'Art', sub: '창의·디자인 감각', tone: 'lime' },
    ];

    return (
      <LearningVisualFrame
        eyebrow="DIGITAL CAMERA"
        title={
          activeKey
            ? `${activeKey} 역량만 켜서 본다`
            : reviewMode
              ? 'Digital CAMERA 6역량을 한 번에 복습한다'
              : 'Digital CAMERA는 데이터 사이언티스트의 6역량'
        }
        caption={
          activeKey
            ? '전체 CAMERA 지도를 그대로 두고 지금 배우는 역량만 밝게 표시했습니다. Management는 6역량에 들어가지 않습니다.'
            : 'C·A·M·E·R·A는 Communication, Analytics, Math, Engineering, Research, Art입니다. Management는 시험 함정입니다.'
        }
      >
        <div className="space-y-3">
          <div className="relative mx-auto flex h-[104px] max-w-[330px] items-center justify-center rounded-[30px] border border-cream/12 bg-[#020b24]/72 px-5">
            <div className="absolute left-5 top-1/2 h-12 w-12 -translate-y-1/2 rounded-[18px] border border-[#67e8f9]/24 bg-[#67e8f9]/9" />
            <div className="absolute right-5 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border border-[#d1f843]/28 bg-[#d1f843]/9" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[#c084fc]/30 bg-[#c084fc]/12">
              <div className="h-8 w-8 rounded-full border border-cream/18 bg-[#020b24]/72" />
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 kr-num text-[10px] font-black uppercase tracking-[0.18em] text-cream/48">
              CAMERA
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {skills.map((skill, index) => {
              const active = reviewMode || activeKey === skill.key || (!activeKey && !reviewMode);
              const dim = activeKey && activeKey !== skill.key;
              return (
                <motion.div
                  key={skill.key}
                  className={
                    'rounded-[18px] border px-3 py-3 transition-colors ' +
                    (active && !dim
                      ? `${visualToneClass(skill.tone)} shadow-[0_0_0_1px_rgba(209,248,67,0.16)]`
                      : 'border-cream/8 bg-white/[0.025] text-cream/34')
                  }
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16, delay: index * 0.03 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current/20 bg-[#020b24]/34 kr-heading text-[14px]">
                      {skill.letter}
                    </div>
                    <div className="min-w-0">
                      <div className="kr-heading text-[12.5px] leading-tight">{skill.label}</div>
                      <div className="kr-body mt-0.5 text-[10px] font-black leading-tight opacity-70">
                        {skill.sub}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <VisualPill label="Management" sub="CAMERA에 없음 · 시험 함정" tone="red" />
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'analysisTypes') {
    const activeByStep: Record<string, string> = {
      'adsp-2-1-s1-opt': 'optimization',
      'adsp-2-1-s1-sol': 'solution',
      'adsp-2-1-s1-ins': 'insight',
      'adsp-2-1-s1-dis': 'discovery',
    };
    const activeKey = stepId ? activeByStep[stepId] : undefined;
    const cards = [
      {
        key: 'optimization',
        title: 'Optimization',
        sub: '문제도 방법도 안다',
        what: 'What O',
        how: 'How O',
        tone: 'lime',
      },
      {
        key: 'solution',
        title: 'Solution',
        sub: '문제는 알고 방법을 찾는다',
        what: 'What O',
        how: 'How ?',
        tone: 'cyan',
      },
      {
        key: 'insight',
        title: 'Insight',
        sub: '방법은 있고 문제를 발견한다',
        what: 'What ?',
        how: 'How O',
        tone: 'violet',
      },
      {
        key: 'discovery',
        title: 'Discovery',
        sub: '문제도 방법도 탐색한다',
        what: 'What ?',
        how: 'How ?',
        tone: 'amber',
      },
    ] as const;

    return (
      <LearningVisualFrame
        eyebrow="WHAT x HOW"
        title={activeKey ? '지금 보는 칸만 밝게 켠다' : '분석 유형은 2x2 사분면으로 나뉜다'}
        caption="풀 것이 무엇인지 아는지, 푸는 방법을 아는지 두 축으로 먼저 보면 4유형이 바로 갈립니다."
      >
        <div className="rounded-[24px] border border-cream/12 bg-[#020b24]/44 p-2.5">
          <div className="mb-2 grid grid-cols-[78px_1fr_1fr] gap-1.5">
            <div />
            {['방법을 안다', '방법을 모른다'].map((label) => (
              <div
                key={label}
                className="rounded-[14px] border border-cream/10 bg-white/[0.04] px-2 py-2 text-center kr-heading text-[10.5px] leading-tight text-cream/76"
              >
                {label}
                <div className="mt-0.5 kr-num text-[8px] font-black uppercase tracking-[0.12em] text-cream/38">How</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[78px_1fr_1fr] gap-1.5">
            {[
              { row: '풀 것이 무엇인지 안다', rowMark: 'What O', cells: [cards[0], cards[1]] },
              { row: '풀 것이 무엇인지 모른다', rowMark: 'What ?', cells: [cards[2], cards[3]] },
            ].map((row, rowIndex) => (
              <Fragment key={row.row}>
                <div className="flex min-h-[98px] flex-col justify-center rounded-[16px] border border-cream/10 bg-white/[0.035] px-2 py-2">
                  <div className="kr-heading text-[10.5px] leading-snug text-cream/78">{row.row}</div>
                  <div className="mt-1 kr-num text-[8px] font-black uppercase tracking-[0.12em] text-cream/38">
                    {row.rowMark}
                  </div>
                </div>
                {row.cells.map((card, colIndex) => {
                  const index = rowIndex * 2 + colIndex;
                  const active = !activeKey || activeKey === card.key || stepId === 'adsp-2-1-s1-review';
                  return (
                    <motion.div
                      key={card.key}
                      className={
                        'min-h-[98px] rounded-[18px] border p-3 transition-colors ' +
                        (active
                          ? visualToneClass(card.tone as VisualTone)
                          : 'border-cream/8 bg-white/[0.025] text-cream/34')
                      }
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.16, delay: index * 0.035 }}
                    >
                      <div className="flex h-full flex-col justify-between gap-2">
                        <div>
                          <div className="kr-heading text-[13.5px] leading-tight">{card.title}</div>
                          <div className="kr-body mt-1 text-[10px] font-black leading-tight opacity-72">
                            {card.sub}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 kr-num text-[8px] font-black uppercase tracking-[0.1em] opacity-64">
                          <span>{card.what}</span>
                          <span className="opacity-40">/</span>
                          <span>{card.how}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'analysisProcess') {
    const isKdd = stepId === 'adsp-2-1-s2-kdd';
    const isCrisp = stepId === 'adsp-2-1-s2-crisp';
    return (
      <LearningVisualFrame
        eyebrow="KDD / CRISP-DM"
        title={isKdd ? 'KDD는 데이터에서 지식을 찾는 5단계' : isCrisp ? 'CRISP-DM은 업무 이해부터 전개까지 본다' : '분석 프로세스는 흐름을 먼저 잡는다'}
        caption="KDD는 데이터 처리 흐름, CRISP-DM은 비즈니스 문제 해결 흐름에 가깝습니다. 시험에서는 단계 순서를 자주 묻습니다."
      >
        <div className="grid gap-3">
          <div className={`rounded-[20px] border p-3 ${isCrisp ? 'border-cream/8 bg-white/[0.025] text-cream/38' : visualToneClass('cyan')}`}>
            <div className="kr-heading mb-2 text-[15px]">KDD 5단계</div>
            <div className="grid grid-cols-5 gap-1.5">
              {['선택', '전처리', '변환', '마이닝', '해석'].map((label, index) => (
                <div key={label} className="rounded-[12px] border border-current/12 bg-[#020b24]/34 px-1.5 py-2 text-center">
                  <div className="kr-num text-[9px] font-black opacity-55">{index + 1}</div>
                  <div className="kr-heading mt-1 text-[10.5px] leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={`rounded-[20px] border p-3 ${isKdd ? 'border-cream/8 bg-white/[0.025] text-cream/38' : visualToneClass('lime')}`}>
            <div className="kr-heading mb-2 text-[15px]">CRISP-DM 6단계</div>
            <div className="grid grid-cols-3 gap-1.5">
              {['업무', '데이터 이해', '준비', '모델링', '평가', '전개'].map((label, index) => (
                <div key={label} className="rounded-[12px] border border-current/12 bg-[#020b24]/34 px-1.5 py-2 text-center">
                  <div className="kr-num text-[9px] font-black opacity-55">{index + 1}</div>
                  <div className="kr-heading mt-1 text-[10.5px] leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'topDownApproach') {
    const activeByStep: Record<string, string> = {
      'adsp-2-1-s3-explore': '탐색',
      'adsp-2-1-s3-define': '정의',
      'adsp-2-1-s3-solve': '해결방안',
      'adsp-2-1-s3-feas': '타당성',
    };
    const activeLabel = stepId ? activeByStep[stepId] : undefined;
    const steps = [
      { label: '탐색', sub: '문제 후보 찾기', tone: 'cyan' },
      { label: '정의', sub: '분석 문제로 좁히기', tone: 'lime' },
      { label: '해결방안', sub: '기법 후보 비교', tone: 'violet' },
      { label: '타당성', sub: '비용·기술·운영 점검', tone: 'amber' },
    ] as const;

    return (
      <LearningVisualFrame
        eyebrow="TOP-DOWN"
        title="하향식은 탐정해타 순서로 좁혀간다"
        caption="큰 비즈니스 문제를 바로 모델로 풀지 않고, 후보를 찾고 정의한 뒤 해결방안과 타당성을 차례로 봅니다."
      >
        <div className="grid gap-2">
          {steps.map((item, index) => {
            const active = !activeLabel || activeLabel === item.label || stepId === 'adsp-2-1-s3-review';
            return (
              <motion.div
                key={item.label}
                className={
                  'grid grid-cols-[34px_1fr] items-center gap-2 rounded-[18px] border p-2.5 ' +
                  (active ? visualToneClass(item.tone as VisualTone) : 'border-cream/8 bg-white/[0.025] text-cream/35')
                }
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.16, delay: index * 0.035 }}
              >
                <div className="grid h-8 w-8 place-items-center rounded-full border border-current/20 bg-[#020b24]/34 kr-num text-[11px] font-black">
                  {index + 1}
                </div>
                <div>
                  <div className="kr-heading text-[14px] leading-tight">{item.label}</div>
                  <div className="kr-body mt-1 text-[10.5px] font-black leading-tight opacity-70">{item.sub}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'analysisMethodology') {
    const activeByStep: Record<string, string> = {
      'adsp-2-1-s4-waterfall': 'Waterfall',
      'adsp-2-1-s4-prototype': 'Prototype',
      'adsp-2-1-s4-spiral': 'Spiral',
      'adsp-2-1-s4-agile': 'Agile',
      'adsp-2-1-s4-rad': 'RAD',
    };
    const activeKey = stepId ? activeByStep[stepId] : undefined;
    const items = [
      { label: 'Waterfall', sub: '순차 진행', tone: 'cyan' },
      { label: 'Prototype', sub: '시제품 피드백', tone: 'lime' },
      { label: 'Spiral', sub: '반복 + 위험관리', tone: 'amber' },
      { label: 'Agile', sub: '짧은 스프린트', tone: 'violet' },
      { label: 'RAD', sub: '빠른 조립 개발', tone: 'cyan' },
    ] as const;

    return (
      <LearningVisualFrame
        eyebrow="METHODOLOGY"
        title="방법론은 프로젝트 상황에 맞춰 고른다"
        caption="변경이 적으면 Waterfall, 피드백이 중요하면 Prototype/Agile, 위험이 크면 Spiral, 빠른 납기가 중요하면 RAD로 연결하세요."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {items.map((item, index) => {
            const active = !activeKey || activeKey === item.label || stepId === 'adsp-2-1-s4-review';
            return (
              <motion.div
                key={item.label}
                className={
                  'rounded-[18px] border px-3 py-3 ' +
                  (active ? visualToneClass(item.tone as VisualTone) : 'border-cream/8 bg-white/[0.025] text-cream/34')
                }
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, delay: index * 0.03 }}
              >
                <div className="kr-heading text-[14px] leading-tight">{item.label}</div>
                <div className="kr-body mt-1 text-[10.5px] font-black leading-tight opacity-70">{item.sub}</div>
              </motion.div>
            );
          })}
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'priorityMatrix') {
    const activeByStep: Record<string, string> = {
      'adsp-2-2-s1-now-easy': 'nowEasy',
      'adsp-2-2-s1-now-hard': 'nowHard',
      'adsp-2-2-s1-fut-easy': 'futureEasy',
      'adsp-2-2-s1-fut-hard': 'futureHard',
    };
    const activeKey = stepId ? activeByStep[stepId] : undefined;
    const cells = [
      { key: 'nowEasy', label: '지금 + 쉬움', sub: '바로 실행', tone: 'lime' },
      { key: 'nowHard', label: '지금 + 어려움', sub: '투자 계획', tone: 'amber' },
      { key: 'futureEasy', label: '나중 + 쉬움', sub: '여유 때', tone: 'cyan' },
      { key: 'futureHard', label: '나중 + 어려움', sub: '중장기 R&D', tone: 'violet' },
    ] as const;

    return (
      <LearningVisualFrame
        eyebrow="PRIORITY MATRIX"
        title="시급성과 난이도로 과제 순서를 정한다"
        caption="시급하고 쉬운 과제는 빠른 성과, 시급하지만 어려운 과제는 투자·로드맵이 필요합니다."
      >
        <div className="grid grid-cols-[42px_1fr_1fr] gap-2">
          <div />
          <div className="kr-num text-center text-[10px] font-black uppercase tracking-[0.12em] text-[#d1f843]/70">쉬움</div>
          <div className="kr-num text-center text-[10px] font-black uppercase tracking-[0.12em] text-[#ffb020]/75">어려움</div>
          <div className="grid place-items-center kr-heading text-[11px] text-cream/55 [writing-mode:vertical-rl]">지금</div>
          {cells.slice(0, 2).map((cell) => (
            <div
              key={cell.key}
              className={
                'rounded-[18px] border px-3 py-3 text-center ' +
                (!activeKey || activeKey === cell.key || stepId === 'adsp-2-2-s1-review'
                  ? visualToneClass(cell.tone as VisualTone)
                  : 'border-cream/8 bg-white/[0.025] text-cream/34')
              }
            >
              <div className="kr-heading text-[13px] leading-tight">{cell.label}</div>
              <div className="kr-body mt-1 text-[10.5px] font-black opacity-70">{cell.sub}</div>
            </div>
          ))}
          <div className="grid place-items-center kr-heading text-[11px] text-cream/55 [writing-mode:vertical-rl]">나중</div>
          {cells.slice(2).map((cell) => (
            <div
              key={cell.key}
              className={
                'rounded-[18px] border px-3 py-3 text-center ' +
                (!activeKey || activeKey === cell.key || stepId === 'adsp-2-2-s1-review'
                  ? visualToneClass(cell.tone as VisualTone)
                  : 'border-cream/8 bg-white/[0.025] text-cream/34')
              }
            >
              <div className="kr-heading text-[13px] leading-tight">{cell.label}</div>
              <div className="kr-body mt-1 text-[10.5px] font-black opacity-70">{cell.sub}</div>
            </div>
          ))}
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'analyticsGovernance') {
    const activeByStep: Record<string, string> = {
      'adsp-2-2-s2-system': '시스템',
      'adsp-2-2-s2-org': '조직',
      'adsp-2-2-s2-process': '프로세스',
      'adsp-2-2-s2-resource': '인력',
      'adsp-2-2-s2-data': '데이터',
    };
    const activeLabel = stepId ? activeByStep[stepId] : undefined;
    const items = [
      { label: '시스템', sub: '플랫폼·도구', tone: 'cyan' },
      { label: '조직', sub: '전담 조직', tone: 'lime' },
      { label: '프로세스', sub: '절차·관리', tone: 'violet' },
      { label: '인력', sub: '역량·역할', tone: 'amber' },
      { label: '데이터', sub: '품질·표준', tone: 'cyan' },
    ] as const;

    return (
      <LearningVisualFrame
        eyebrow="ANALYTICS GOVERNANCE"
        title="분석 거버넌스는 분석이 계속 굴러가게 하는 장치"
        caption="시스템만 있어도 부족하고, 조직·프로세스·인력·데이터가 함께 있어야 분석이 회사 안에 자리 잡습니다."
      >
        <div className="grid gap-2 sm:grid-cols-5">
          {items.map((item, index) => {
            const active = !activeLabel || activeLabel === item.label || stepId === 'adsp-2-2-s2-review';
            return (
              <motion.div
                key={item.label}
                className={
                  'rounded-[18px] border px-2.5 py-3 text-center ' +
                  (active ? visualToneClass(item.tone as VisualTone) : 'border-cream/8 bg-white/[0.025] text-cream/34')
                }
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: index * 0.03 }}
              >
                <div className="kr-num text-[9px] font-black opacity-55">{index + 1}</div>
                <div className="kr-heading mt-1 text-[13px] leading-tight">{item.label}</div>
                <div className="kr-body mt-1 text-[10px] font-black leading-tight opacity-70">{item.sub}</div>
              </motion.div>
            );
          })}
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'maturityStages') {
    const activeByStep: Record<string, string> = {
      'adsp-2-2-s3-intro': '도입',
      'adsp-2-2-s3-adopt': '활용',
      'adsp-2-2-s3-diffuse': '확산',
      'adsp-2-2-s3-optimize': '최적화',
    };
    const activeLabel = stepId ? activeByStep[stepId] : undefined;
    const stages = [
      { label: '도입', sub: '개인·비공식', tone: 'muted' },
      { label: '활용', sub: '부서별 사용', tone: 'cyan' },
      { label: '확산', sub: '전사 표준', tone: 'violet' },
      { label: '최적화', sub: '내재화·고도화', tone: 'lime' },
    ] as const;

    return (
      <LearningVisualFrame
        eyebrow="MATURITY"
        title="분석 성숙도는 도활확최로 올라간다"
        caption="개인 수준에서 시작해 부서 활용, 전사 확산, 최적화 단계로 갈수록 분석이 조직의 기본 운영 방식이 됩니다."
      >
        <div className="grid gap-2">
          {stages.map((stage, index) => {
            const active = !activeLabel || activeLabel === stage.label || stepId === 'adsp-2-2-s3-review';
            return (
              <div
                key={stage.label}
                className="rounded-[18px] border px-3 py-2.5"
                style={{ marginLeft: index * 10 }}
              >
                <div
                  className={
                    'rounded-[14px] border px-3 py-2 ' +
                    (active ? visualToneClass(stage.tone as VisualTone) : 'border-cream/8 bg-white/[0.025] text-cream/34')
                  }
                >
                  <div className="kr-heading text-[14px] leading-tight">{stage.label}</div>
                  <div className="kr-body mt-1 text-[10.5px] font-black leading-tight opacity-70">{stage.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'dataGovernance') {
    const activeByStep: Record<string, string> = {
      'adsp-2-2-s4-principle': '원칙',
      'adsp-2-2-s4-org': '조직',
      'adsp-2-2-s4-process': '프로세스',
    };
    const activeLabel = stepId ? activeByStep[stepId] : undefined;
    const items = [
      { label: '원칙', sub: '표준·정책', tone: 'lime' },
      { label: '조직', sub: '책임자·역할', tone: 'cyan' },
      { label: '프로세스', sub: '품질·메타·백업', tone: 'violet' },
    ] as const;

    return (
      <LearningVisualFrame
        eyebrow="DATA GOVERNANCE"
        title="데이터 거버넌스는 데이터 관리의 원조프"
        caption="분석 거버넌스가 분석 활동 전체라면, 데이터 거버넌스는 데이터 자체를 믿고 쓸 수 있게 관리하는 체계입니다."
      >
        <div className="grid gap-2 sm:grid-cols-[1fr_22px_1fr_22px_1fr] sm:items-center">
          {items.map((item, index) => {
            const active = !activeLabel || activeLabel === item.label || stepId === 'adsp-2-2-s4-review';
            return (
              <Fragment key={item.label}>
                <div
                  className={
                    'rounded-[18px] border px-3 py-3 text-center ' +
                    (active ? visualToneClass(item.tone as VisualTone) : 'border-cream/8 bg-white/[0.025] text-cream/34')
                  }
                >
                  <div className="kr-heading text-[14px] leading-tight">{item.label}</div>
                  <div className="kr-body mt-1 text-[10.5px] font-black leading-tight opacity-70">{item.sub}</div>
                </div>
                {index < items.length - 1 ? <div className="hidden sm:block"><ArrowStep /></div> : null}
              </Fragment>
            );
          })}
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'analysisFeasibility') {
    const activeByStep: Record<string, string> = {
      'adsp-2-3-s1-econ': '경제적',
      'adsp-2-3-s1-tech': '기술적',
      'adsp-2-3-s1-ops': '운영적',
    };
    const activeLabel = stepId ? activeByStep[stepId] : undefined;
    const items = [
      { label: '경제적', sub: '비용 대비 효과', tone: 'lime' },
      { label: '기술적', sub: '데이터·기술 가능', tone: 'cyan' },
      { label: '운영적', sub: '현장에서 쓸 수 있음', tone: 'violet' },
    ] as const;

    return (
      <LearningVisualFrame
        eyebrow="FEASIBILITY"
        title="좋은 과제는 돈·기술·현장을 함께 통과한다"
        caption="경제적, 기술적, 운영적 타당성은 분석 과제를 실제로 실행할 수 있는지 보는 3개 필터입니다."
      >
        <div className="grid gap-2 sm:grid-cols-3">
          {items.map((item, index) => {
            const active = !activeLabel || activeLabel === item.label || stepId === 'adsp-2-3-s1-review';
            return (
              <motion.div
                key={item.label}
                className={
                  'rounded-[20px] border p-3 text-center ' +
                  (active ? visualToneClass(item.tone as VisualTone) : 'border-cream/8 bg-white/[0.025] text-cream/34')
                }
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, delay: index * 0.035 }}
              >
                <div className="kr-heading text-[15px] leading-tight">{item.label}</div>
                <div className="kr-body mt-1 text-[10.5px] font-black leading-tight opacity-70">{item.sub}</div>
              </motion.div>
            );
          })}
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'analysisApproachMix') {
    return (
      <LearningVisualFrame
        eyebrow="APPROACH MIX"
        title={stepId === 'adsp-2-3-s2' ? '상향식은 데이터에서 단서를 먼저 찾는다' : '디자인 씽킹은 하향식과 상향식을 왕복한다'}
        caption="하향식은 문제에서 출발하고, 상향식은 데이터에서 단서를 찾습니다. 디자인 씽킹은 사용자의 문제와 데이터 단서를 오가며 과제를 다듬습니다."
      >
        <div className="grid gap-3">
          <div className="grid grid-cols-[1fr_28px_1fr] items-center gap-2">
            <VisualPill label="비즈니스 문제" sub="하향식 출발점" tone={stepId === 'adsp-2-3-s3' ? 'lime' : 'muted'} />
            <ArrowStep />
            <VisualPill label="분석 과제" sub="정의된 문제" tone="cyan" />
          </div>
          <div className="grid grid-cols-[1fr_28px_1fr] items-center gap-2">
            <VisualPill label="데이터 패턴" sub="상향식 출발점" tone={stepId === 'adsp-2-3-s2' ? 'lime' : 'violet'} />
            <ArrowStep />
            <VisualPill label="새로운 가설" sub="발견한 단서" tone="amber" />
          </div>
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'projectDefinition') {
    return (
      <LearningVisualFrame
        eyebrow="PROJECT BRIEF"
        title="분석 과제 정의서는 실행 전 약속 문서"
        caption="무엇을 왜 분석하는지, 어떤 데이터와 기준으로 성공을 판단할지 적어두어야 팀이 같은 목표를 보고 움직입니다."
      >
        <div className="rounded-[20px] border border-cream/10 bg-[#020b24]/62 p-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              ['배경', '왜 필요한가', 'cyan'],
              ['목표', '무엇을 바꿀까', 'lime'],
              ['범위', '어디까지 할까', 'violet'],
              ['데이터', '무엇을 쓸까', 'amber'],
              ['성과기준', '성공 판단', 'cyan'],
              ['위험', '막힐 수 있는 점', 'red'],
            ].map(([label, sub, tone]) => (
              <VisualPill key={label} label={label} sub={sub} tone={tone as VisualTone} />
            ))}
          </div>
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'readinessAreas') {
    const activeByStep: Record<string, string> = {
      'adsp-2-3-s5-biz': '분석 업무',
      'adsp-2-3-s5-org': '인력·조직',
      'adsp-2-3-s5-method': '분석 기법',
      'adsp-2-3-s5-data': '분석 데이터',
      'adsp-2-3-s5-culture': '분석 문화',
      'adsp-2-3-s5-it': 'IT 인프라',
    };
    const activeLabel = stepId ? activeByStep[stepId] : undefined;
    const items = [
      { label: '분석 업무', sub: '분석할 일이 있나', tone: 'cyan' },
      { label: '인력·조직', sub: '담당할 사람이 있나', tone: 'lime' },
      { label: '분석 기법', sub: '방법을 알고 있나', tone: 'violet' },
      { label: '분석 데이터', sub: '쓸 데이터가 있나', tone: 'amber' },
      { label: '분석 문화', sub: '데이터로 말하나', tone: 'cyan' },
      { label: 'IT 인프라', sub: '도구와 환경이 있나', tone: 'lime' },
    ] as const;

    return (
      <LearningVisualFrame
        eyebrow="READINESS"
        title="분석 준비도는 업조기데문아이티로 확인한다"
        caption="분석할 업무, 사람과 조직, 기법, 데이터, 문화, IT 인프라가 준비되어야 과제가 실제 실행으로 이어집니다."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((item, index) => {
            const active = !activeLabel || activeLabel === item.label || stepId === 'adsp-2-3-s5-review';
            return (
              <motion.div
                key={item.label}
                className={
                  'rounded-[18px] border px-3 py-3 ' +
                  (active ? visualToneClass(item.tone as VisualTone) : 'border-cream/8 bg-white/[0.025] text-cream/34')
                }
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: index * 0.025 }}
              >
                <div className="kr-heading text-[13.5px] leading-tight">{item.label}</div>
                <div className="kr-body mt-1 text-[10.5px] font-black leading-tight opacity-70">{item.sub}</div>
              </motion.div>
            );
          })}
        </div>
      </LearningVisualFrame>
    );
  }

  return (
    <LearningVisualFrame
      eyebrow="BIG DATA SHIFT"
      title="빅데이터 이후 분석의 기본값이 바뀐다"
      caption="변화 후 상태만 모으면 전수조사, 사후처리, 양, 상관관계입니다. 그래서 전후양상으로 외우면 매칭 문제가 쉬워집니다."
    >
      <div className="space-y-2">
        {[
          ['표본조사', '전수조사', '규모'],
          ['사전처리', '사후처리', '처리'],
          ['질', '양', '품질'],
          ['인과관계', '상관관계', '관점'],
        ].map(([before, after, axis], index) => (
          <motion.div
            key={axis}
            className="grid grid-cols-[1fr_24px_1fr_48px] items-center gap-2 rounded-[16px] border border-cream/10 bg-white/[0.035] p-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18, delay: index * 0.035 }}
          >
            <VisualPill label={before} tone="muted" />
            <ArrowStep />
            <VisualPill label={after} tone={index % 2 === 0 ? 'cyan' : 'lime'} />
            <div className="kr-num text-center text-[9px] font-black uppercase tracking-[0.12em] text-cream/42">
              {axis}
            </div>
          </motion.div>
        ))}
      </div>
    </LearningVisualFrame>
  );
}

function Adsp3ConceptDiagram({
  mode,
  stepId,
}: {
  mode: Adsp3DiagramMode;
  stepId?: string;
}) {
  type DiagramCard = {
    key: string;
    label: string;
    sub?: string;
    detail?: string;
    tone?: VisualTone;
  };

  const renderCards = (
    items: DiagramCard[],
    activeKey?: string,
    columns = 'grid-cols-2',
  ) => (
    <div className={`grid gap-2 ${columns}`}>
      {items.map((item, index) => {
        const active = !activeKey || item.key === activeKey || stepId?.endsWith('-review');
        return (
          <motion.div
            key={item.key}
            className={
              'rounded-[18px] border px-3 py-3 ' +
              (active
                ? visualToneClass(item.tone ?? 'cyan')
                : 'border-cream/8 bg-white/[0.025] text-cream/34')
            }
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, delay: index * 0.025 }}
          >
            <div className="kr-heading text-[13.5px] leading-tight">{item.label}</div>
            {item.sub ? (
              <div className="kr-body mt-1 text-[10.5px] font-black leading-snug opacity-72">
                {item.sub}
              </div>
            ) : null}
            {item.detail ? (
              <div className="mt-2 rounded-[12px] border border-cream/10 bg-[#020b24]/42 px-2 py-1.5 kr-body text-[10.5px] font-bold leading-snug text-cream/62">
                {item.detail}
              </div>
            ) : null}
          </motion.div>
        );
      })}
    </div>
  );

  if (mode === 'adsp3SummaryDerived') {
    return (
      <LearningVisualFrame
        eyebrow="VARIABLES"
        title="요약변수는 모아 보고, 파생변수는 계산해서 만든다"
        caption="요약변수는 여러 기록을 합쳐 만든 값이고, 파생변수는 기존 변수로 새 의미를 계산한 값입니다. 둘 다 원본을 그대로 보는 것이 아니라 분석에 쓰기 좋게 가공한 값이에요."
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_28px_1fr] sm:items-stretch">
          <div className="rounded-[20px] border border-[#67e8f9]/24 bg-[#67e8f9]/8 p-3">
            <div className="kr-num text-[9px] font-black uppercase tracking-[0.14em] text-[#67e8f9]/72">
              SUMMARY
            </div>
            <div className="kr-heading mt-1 text-[17px] text-[#dffbff]">요약변수</div>
            <div className="mt-3 grid gap-1.5">
              {['1월 구매', '2월 구매', '3월 구매'].map((label) => (
                <div key={label} className="rounded-[12px] border border-cream/10 bg-[#020b24]/42 px-3 py-2 kr-body text-[11px] font-black text-cream/62">
                  {label}
                </div>
              ))}
            </div>
            <div className="mt-2 rounded-[14px] border border-[#67e8f9]/22 bg-[#67e8f9]/10 px-3 py-2 kr-heading text-[13px] text-[#dffbff]">
              3개월 총 구매액
            </div>
          </div>
          <div className="hidden sm:grid sm:place-items-center">
            <ArrowStep />
          </div>
          <div className="rounded-[20px] border border-[#d1f843]/24 bg-[#d1f843]/8 p-3">
            <div className="kr-num text-[9px] font-black uppercase tracking-[0.14em] text-[#d1f843]/72">
              DERIVED
            </div>
            <div className="kr-heading mt-1 text-[17px] text-[#e8ff9d]">파생변수</div>
            <div className="mt-3 grid grid-cols-[1fr_26px_1fr] items-center gap-2">
              <VisualPill label="생년" sub="1999" tone="muted" />
              <ArrowStep />
              <VisualPill label="나이" sub="올해-생년" tone="lime" />
            </div>
            <div className="mt-2 kr-body text-[11px] font-bold leading-snug text-cream/58">
              기존 값으로 새 의미를 계산합니다.
            </div>
          </div>
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3Eda4r') {
    const activeByStep: Record<string, string> = {
      'adsp-3-1-s2-resistance': 'resistance',
      'adsp-3-1-s2-residual': 'residual',
      'adsp-3-1-s2-reexpression': 'reexpression',
      'adsp-3-1-s2-revelation': 'revelation',
    };
    return (
      <LearningVisualFrame
        eyebrow="EDA 4R"
        title="EDA는 데이터를 먼저 관찰해 이상한 신호를 찾는다"
        caption="저항성은 이상값에 흔들리지 않는 기준, 잔차해석은 남은 오차 보기, 재표현은 변환해서 보기, 현시성은 그림으로 드러내기입니다."
      >
        {renderCards(
          [
            { key: 'resistance', label: '저항성', sub: '이상값에 덜 흔들림', detail: '중앙값, IQR', tone: 'cyan' },
            { key: 'residual', label: '잔차해석', sub: '예측 후 남은 차이', detail: '모델이 놓친 패턴', tone: 'violet' },
            { key: 'reexpression', label: '재표현', sub: '로그·제곱근 변환', detail: '분포를 보기 좋게', tone: 'amber' },
            { key: 'revelation', label: '현시성', sub: '그림으로 드러냄', detail: '산점도·박스플롯', tone: 'lime' },
          ],
          activeByStep[stepId ?? ''],
        )}
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3Missing') {
    const activeByStep: Record<string, string> = {
      'adsp-3-1-s3-deletion': 'deletion',
      'adsp-3-1-s3-simple': 'simple',
      'adsp-3-1-s3-multiple': 'multiple',
      'adsp-3-1-s3-model': 'model',
    };
    return (
      <LearningVisualFrame
        eyebrow="MISSING VALUES"
        title="결측값은 버리거나, 채우거나, 모델로 예측한다"
        caption="결측 처리 문제는 완전 제거, 단순 대치, 다중 대치, 모델 기반 중 어느 방식인지 구분하는 것이 핵심입니다."
      >
        <div className="rounded-[18px] border border-cream/10 bg-[#020b24]/52 p-3">
          <MiniDataTable
            title="고객 데이터"
            columns={['고객', '나이', '소득']}
            rows={[
              ['A', '23', '300'],
              ['B', 'NULL', '420'],
              ['C', '35', 'NULL'],
            ]}
            highlight={(_, __, value) => (value === 'NULL' ? 'amber' : null)}
          />
        </div>
        <div className="mt-3">
          {renderCards(
            [
              { key: 'deletion', label: '완전 제거', sub: '결측 행을 삭제', tone: 'red' },
              { key: 'simple', label: '단순 대치', sub: '평균·최빈값으로 채움', tone: 'cyan' },
              { key: 'multiple', label: '다중 대치', sub: '여러 번 채워 불확실성 반영', tone: 'violet' },
              { key: 'model', label: '모델 기반', sub: '다른 변수로 예측해 채움', tone: 'lime' },
            ],
            activeByStep[stepId ?? ''],
          )}
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3Outlier') {
    const activeByStep: Record<string, string> = {
      'adsp-3-1-s4-esd': 'esd',
      'adsp-3-1-s4-iqr': 'iqr',
      'adsp-3-1-s4-z': 'z',
      'adsp-3-1-s4-dbscan': 'dbscan',
    };
    return (
      <LearningVisualFrame
        eyebrow="OUTLIER"
        title="이상값은 튀는 값이지만 무조건 삭제 대상은 아니다"
        caption="시험에서는 이상값 탐지 기준을 자주 묻습니다. 정규분포 가정이면 ESD/Z-Score, 사분위수 기준이면 IQR, 밀도 기준이면 DBSCAN을 떠올리면 좋아요."
      >
        <div className="mb-3 rounded-[18px] border border-cream/10 bg-[#020b24]/52 px-3 py-4">
          <div className="flex items-end gap-2">
            {[28, 40, 52, 46, 58, 42, 92].map((height, index) => (
              <div key={index} className="flex-1 rounded-t-[10px] border border-[#67e8f9]/20 bg-[#67e8f9]/12" style={{ height }} />
            ))}
          </div>
          <div className="mt-2 kr-body text-center text-[11px] font-bold text-cream/48">
            오른쪽처럼 혼자 크게 튀는 값이 이상값 후보입니다.
          </div>
        </div>
        {renderCards(
          [
            { key: 'esd', label: 'ESD', sub: '정규성 가정 + 여러 이상값', tone: 'cyan' },
            { key: 'iqr', label: 'IQR', sub: 'Q1·Q3와 1.5배 IQR', tone: 'lime' },
            { key: 'z', label: 'Z-Score', sub: '평균에서 표준편차 몇 배?', tone: 'violet' },
            { key: 'dbscan', label: 'DBSCAN', sub: '밀도 낮은 점을 noise로', tone: 'amber' },
          ],
          activeByStep[stepId ?? ''],
        )}
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3RStructures') {
    const activeByStep: Record<string, string> = {
      'adsp-3-1-s5-vector': 'vector',
      'adsp-3-1-s5-list': 'list',
      'adsp-3-1-s5-matrix': 'matrix',
      'adsp-3-1-s5-df': 'df',
    };
    return (
      <LearningVisualFrame
        eyebrow="R DATA STRUCTURES"
        title="R 자료구조는 담는 모양이 다르다"
        caption="벡터는 한 줄, 리스트는 서로 다른 묶음, 매트릭스는 같은 타입의 표, 데이터프레임은 열마다 타입이 다른 표입니다."
      >
        {renderCards(
          [
            { key: 'vector', label: 'vector', sub: '같은 타입 한 줄', detail: 'c(1, 2, 3)', tone: 'cyan' },
            { key: 'list', label: 'list', sub: '서로 다른 묶음', detail: '숫자 + 문자 + 표', tone: 'violet' },
            { key: 'matrix', label: 'matrix', sub: '같은 타입 2차원', detail: '숫자만 있는 표', tone: 'amber' },
            { key: 'df', label: 'data.frame', sub: '열마다 타입 가능', detail: '실무 데이터 표', tone: 'lime' },
          ],
          activeByStep[stepId ?? ''],
        )}
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3Scales') {
    const activeByStep: Record<string, string> = {
      'adsp-3-2-s1-nominal': 'nominal',
      'adsp-3-2-s1-ordinal': 'ordinal',
      'adsp-3-2-s1-interval': 'interval',
      'adsp-3-2-s1-ratio': 'ratio',
    };
    return (
      <LearningVisualFrame
        eyebrow="MEASUREMENT SCALE"
        title="척도는 숫자로 무엇까지 말할 수 있는지의 단계다"
        caption="명목은 구분만, 서열은 순서까지, 등간은 간격까지, 비율은 진짜 0과 배수 비교까지 가능합니다."
      >
        {renderCards(
          [
            { key: 'nominal', label: '명목', sub: '구분만 가능', detail: '성별, 혈액형', tone: 'muted' },
            { key: 'ordinal', label: '서열', sub: '순서 가능', detail: '1등, 2등, 3등', tone: 'cyan' },
            { key: 'interval', label: '등간', sub: '간격 가능', detail: '섭씨 온도', tone: 'violet' },
            { key: 'ratio', label: '비율', sub: '진짜 0 + 배수', detail: '키, 몸무게, 매출', tone: 'lime' },
          ],
          activeByStep[stepId ?? ''],
        )}
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3Distribution') {
    const activeByStep: Record<string, string> = {
      'adsp-3-2-s2-discrete': 'discrete',
      'adsp-3-2-s2-continuous': 'continuous',
    };
    return (
      <LearningVisualFrame
        eyebrow="DISTRIBUTION"
        title="확률분포는 값이 나올 가능성을 그린 지도다"
        caption="셀 수 있는 값은 이산형, 끊기지 않고 이어지는 값은 연속형입니다. 문제에서 주사위·불량품 개수는 이산, 키·시간·무게는 연속을 먼저 의심하세요."
      >
        {renderCards(
          [
            { key: 'discrete', label: '이산형', sub: '하나, 둘 셀 수 있음', detail: '주사위 눈, 고객 수', tone: 'cyan' },
            { key: 'continuous', label: '연속형', sub: '끊기지 않는 값', detail: '키, 시간, 무게', tone: 'lime' },
          ],
          activeByStep[stepId ?? ''],
          'grid-cols-2',
        )}
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3Estimator') {
    const activeByStep: Record<string, string> = {
      'adsp-3-2-s3-unbiased': 'unbiased',
      'adsp-3-2-s3-efficient': 'efficient',
      'adsp-3-2-s3-consistent': 'consistent',
      'adsp-3-2-s3-sufficient': 'sufficient',
    };
    return (
      <LearningVisualFrame
        eyebrow="GOOD ESTIMATOR"
        title="좋은 추정량은 정확하고, 흔들림이 작고, 정보 손실이 적다"
        caption="불편성은 평균적으로 맞는 것, 효율성은 흔들림이 작은 것, 일치성은 표본이 커질수록 가까워지는 것, 충분성은 필요한 정보를 잘 담는 것입니다."
      >
        {renderCards(
          [
            { key: 'unbiased', label: '불편성', sub: '평균적으로 모수에 맞음', tone: 'cyan' },
            { key: 'efficient', label: '효율성', sub: '분산·MSE가 작음', tone: 'lime' },
            { key: 'consistent', label: '일치성', sub: 'n이 커질수록 수렴', tone: 'violet' },
            { key: 'sufficient', label: '충분성', sub: '정보를 충분히 담음', tone: 'amber' },
          ],
          activeByStep[stepId ?? ''],
        )}
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3Clt') {
    return (
      <LearningVisualFrame
        eyebrow="CENTRAL LIMIT THEOREM"
        title="표본평균을 많이 모으면 종 모양에 가까워진다"
        caption="원자료 분포가 완벽한 정규분포가 아니어도, 표본 크기가 충분히 크면 표본평균의 분포가 정규분포에 가까워진다는 아이디어입니다."
      >
        <div className="grid gap-2 sm:grid-cols-[1fr_22px_1fr_22px_1fr] sm:items-center">
          <VisualPill label="원자료" sub="들쭉날쭉" tone="muted" />
          <ArrowStep />
          <VisualPill label="표본평균" sub="여러 번 계산" tone="cyan" />
          <ArrowStep />
          <VisualPill label="정규분포" sub="종 모양에 가까움" tone="lime" />
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3Pca' || mode === 'adsp3Mds') {
    return (
      <LearningVisualFrame
        eyebrow={mode === 'adsp3Pca' ? 'PCA' : 'MDS'}
        title={mode === 'adsp3Pca' ? 'PCA는 정보가 큰 방향으로 축을 줄인다' : 'MDS는 거리 관계를 지도로 펼친다'}
        caption={
          mode === 'adsp3Pca'
            ? 'PCA는 여러 변수를 분산이 큰 축으로 압축합니다. 변수 자체보다 정보 손실을 줄이며 차원을 낮추는 장면을 떠올리면 좋아요.'
            : 'MDS는 대상들 사이의 거리를 최대한 보존하면서 2차원이나 3차원 지도 위에 배치하는 방법입니다.'
        }
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_28px_1fr] sm:items-center">
          <VisualPill
            label={mode === 'adsp3Pca' ? '많은 변수' : '거리표'}
            sub={mode === 'adsp3Pca' ? 'x1, x2, x3, x4' : 'A-B 거리, B-C 거리'}
            tone="cyan"
          />
          <ArrowStep />
          <VisualPill
            label={mode === 'adsp3Pca' ? '적은 축' : '지도 배치'}
            sub={mode === 'adsp3Pca' ? 'PC1, PC2' : '가까운 것은 가깝게'}
            tone="lime"
          />
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3Hypothesis') {
    const activeByStep: Record<string, string> = {
      'adsp-3-3-s1-h0': 'h0',
      'adsp-3-3-s1-h1': 'h1',
      'adsp-3-3-s1-alpha': 'alpha',
      'adsp-3-3-s1-pvalue': 'pvalue',
      'adsp-3-3-s1-error': 'error',
    };
    return (
      <LearningVisualFrame
        eyebrow="HYPOTHESIS TEST"
        title="가설검정은 기존 주장(H0)을 버릴지 판단하는 절차다"
        caption="p-value가 유의수준보다 작으면 H0를 기각합니다. 단, p-value는 H0가 참일 확률이 아니라 관측 결과가 얼마나 드문지를 보는 값입니다."
      >
        {renderCards(
          [
            { key: 'h0', label: '귀무가설 H0', sub: '기존 주장', tone: 'muted' },
            { key: 'h1', label: '대립가설 H1', sub: '보이고 싶은 주장', tone: 'cyan' },
            { key: 'alpha', label: '유의수준 α', sub: '기각 기준선', tone: 'amber' },
            { key: 'pvalue', label: 'p-value', sub: '관측 결과의 드묾', tone: 'lime' },
            { key: 'error', label: '1종/2종 오류', sub: '틀린 판단의 종류', tone: 'red' },
          ],
          activeByStep[stepId ?? ''],
          'grid-cols-2 sm:grid-cols-3',
        )}
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3Ttest') {
    const activeByStep: Record<string, string> = {
      'adsp-3-3-s2-one': 'one',
      'adsp-3-3-s2-paired': 'paired',
      'adsp-3-3-s2-indep': 'indep',
    };
    return (
      <LearningVisualFrame
        eyebrow="T-TEST"
        title="t검정은 평균 차이를 어떤 비교 구조로 보는지가 핵심이다"
        caption="집단 하나를 기준값과 비교하면 일표본, 같은 사람의 전후 비교는 대응표본, 서로 다른 두 집단 비교는 독립표본입니다."
      >
        {renderCards(
          [
            { key: 'one', label: '일표본', sub: '한 집단 vs 기준값', detail: '우리 반 평균 = 70?', tone: 'cyan' },
            { key: 'paired', label: '대응표본', sub: '같은 대상 전후', detail: '수업 전 vs 후', tone: 'lime' },
            { key: 'indep', label: '독립표본', sub: '다른 두 집단', detail: 'A반 vs B반', tone: 'violet' },
          ],
          activeByStep[stepId ?? ''],
          'grid-cols-1 sm:grid-cols-3',
        )}
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3Regression') {
    const activeByStep: Record<string, string> = {
      'adsp-3-3-s3-linear': 'linear',
      'adsp-3-3-s3-homo': 'homo',
      'adsp-3-3-s3-normal': 'normal',
      'adsp-3-3-s3-indep': 'indep',
    };
    return (
      <LearningVisualFrame
        eyebrow="REGRESSION ASSUMPTIONS"
        title="회귀는 선·분·정·독이 무너지면 해석이 위험해진다"
        caption="선형성, 등분산성, 정규성, 독립성은 회귀 결과를 믿어도 되는지 확인하는 기본 점검표입니다."
      >
        {renderCards(
          [
            { key: 'linear', label: '선형성', sub: '관계가 직선에 가까운가', tone: 'cyan' },
            { key: 'homo', label: '등분산성', sub: '잔차 폭이 일정한가', tone: 'lime' },
            { key: 'normal', label: '정규성', sub: '잔차가 종 모양인가', tone: 'violet' },
            { key: 'indep', label: '독립성', sub: '잔차끼리 독립인가', tone: 'amber' },
          ],
          activeByStep[stepId ?? ''],
        )}
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3Multicollinearity') {
    return (
      <LearningVisualFrame
        eyebrow="MULTICOLLINEARITY"
        title="설명변수끼리 너무 비슷하면 회귀가 흔들린다"
        caption="다중공선성은 설명변수끼리 강하게 관련되어 계수 해석이 불안정해지는 문제입니다. VIF가 크면 의심합니다."
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_28px_1fr] sm:items-center">
          <VisualPill label="키" sub="몸무게와 강한 관련" tone="cyan" />
          <ArrowStep />
          <VisualPill label="몸무게" sub="서로 비슷한 설명" tone="amber" />
        </div>
        <div className="mt-3 rounded-[16px] border border-[#ffb020]/20 bg-[#ffb020]/8 px-3 py-2 kr-body text-[11.5px] font-bold text-cream/66">
          둘 다 넣으면 모델이 “누구 덕분인지” 헷갈릴 수 있습니다.
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3TimeSeries') {
    const activeByStep: Record<string, string> = {
      'adsp-3-3-s5-trend': 'trend',
      'adsp-3-3-s5-season': 'season',
      'adsp-3-3-s5-cycle': 'cycle',
      'adsp-3-3-s5-irregular': 'irregular',
    };
    return (
      <LearningVisualFrame
        eyebrow="TIME SERIES"
        title="시계열은 추·계·순·불 네 성분으로 나눠 본다"
        caption="추세는 장기 방향, 계절성은 고정 주기 반복, 순환은 주기가 일정하지 않은 등락, 불규칙은 설명하기 어려운 흔들림입니다."
      >
        {renderCards(
          [
            { key: 'trend', label: '추세', sub: '장기적으로 올라가거나 내려감', tone: 'cyan' },
            { key: 'season', label: '계절성', sub: '고정 주기로 반복', tone: 'lime' },
            { key: 'cycle', label: '순환', sub: '주기가 일정하지 않은 등락', tone: 'violet' },
            { key: 'irregular', label: '불규칙', sub: '우연한 흔들림', tone: 'amber' },
          ],
          activeByStep[stepId ?? ''],
        )}
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3Overfit') {
    return (
      <LearningVisualFrame
        eyebrow="OVERFITTING"
        title="과적합은 연습문제만 외우고 새 문제를 못 푸는 상태다"
        caption="훈련 데이터에는 너무 잘 맞지만 테스트 데이터에서 성능이 떨어지면 과적합을 의심합니다. 데이터 분할과 검증은 이 문제를 찾기 위한 장치예요."
      >
        <div className="grid gap-2 sm:grid-cols-3">
          <VisualPill label="Train" sub="공부한 문제" tone="cyan" />
          <VisualPill label="Validation" sub="중간 점검" tone="violet" />
          <VisualPill label="Test" sub="처음 보는 문제" tone="lime" />
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3Ensemble') {
    const activeByStep: Record<string, string> = {
      'adsp-3-4-s2-voting': 'voting',
      'adsp-3-4-s2-bagging': 'bagging',
      'adsp-3-4-s2-boosting': 'boosting',
      'adsp-3-4-s2-stacking': 'stacking',
    };
    return (
      <LearningVisualFrame
        eyebrow="ENSEMBLE"
        title="앙상블은 여러 모델의 판단을 모아 더 안정적으로 예측한다"
        caption="Voting은 여러 모델 투표, Bagging은 병렬 학습, Boosting은 순차 보완, Stacking은 예측 결과를 다시 모델에 넣는 방식입니다."
      >
        {renderCards(
          [
            { key: 'voting', label: 'Voting', sub: '서로 다른 모델 투표', tone: 'cyan' },
            { key: 'bagging', label: 'Bagging', sub: '병렬 + 부트스트랩', tone: 'lime' },
            { key: 'boosting', label: 'Boosting', sub: '틀린 것을 순차 보완', tone: 'amber' },
            { key: 'stacking', label: 'Stacking', sub: '예측을 모아 메타 모델', tone: 'violet' },
          ],
          activeByStep[stepId ?? ''],
        )}
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3Association') {
    const activeByStep: Record<string, string> = {
      'adsp-3-4-s3-support': 'support',
      'adsp-3-4-s3-confidence': 'confidence',
      'adsp-3-4-s3-lift': 'lift',
    };
    return (
      <LearningVisualFrame
        eyebrow="ASSOCIATION RULE"
        title="연관분석은 함께 나타나는 규칙을 찾는다"
        caption="지지도는 같이 나온 비율, 신뢰도는 A가 있을 때 B도 있는 비율, 향상도는 우연보다 얼마나 강한지를 봅니다."
      >
        {renderCards(
          [
            { key: 'support', label: '지지도', sub: 'A와 B가 함께 나온 비율', tone: 'cyan' },
            { key: 'confidence', label: '신뢰도', sub: 'A가 있을 때 B도 있는 비율', tone: 'lime' },
            { key: 'lift', label: '향상도', sub: '우연 대비 얼마나 강한가', tone: 'violet' },
          ],
          activeByStep[stepId ?? ''],
          'grid-cols-1 sm:grid-cols-3',
        )}
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3Clustering') {
    const activeByStep: Record<string, string> = {
      'adsp-3-4-s4-hier': 'hier',
      'adsp-3-4-s4-kmeans': 'kmeans',
      'adsp-3-4-s4-dbscan': 'dbscan',
      'adsp-3-4-s4-em-som': 'em',
    };
    return (
      <LearningVisualFrame
        eyebrow="CLUSTERING"
        title="군집은 정답 라벨 없이 비슷한 대상끼리 묶는다"
        caption="계층적 군집은 트리, K-means는 중심점, DBSCAN은 밀도, EM/SOM은 확률이나 격자 관점으로 묶는다고 보면 됩니다."
      >
        {renderCards(
          [
            { key: 'hier', label: '계층적', sub: '트리처럼 묶음', tone: 'cyan' },
            { key: 'kmeans', label: 'K-means', sub: '중심점 K개', tone: 'lime' },
            { key: 'dbscan', label: 'DBSCAN', sub: '밀도 기반 + noise', tone: 'amber' },
            { key: 'em', label: 'EM · SOM', sub: '확률 · 격자 관점', tone: 'violet' },
          ],
          activeByStep[stepId ?? ''],
        )}
      </LearningVisualFrame>
    );
  }

  if (mode === 'adsp3Metrics') {
    const activeByStep: Record<string, string> = {
      'adsp-3-4-s5-acc': 'acc',
      'adsp-3-4-s5-prec': 'prec',
      'adsp-3-4-s5-recall': 'recall',
      'adsp-3-4-s5-f1': 'f1',
    };
    return (
      <LearningVisualFrame
        eyebrow="MODEL METRICS"
        title="평가지표는 무엇을 더 중요하게 볼지 정하는 언어다"
        caption="정확도는 전체 정답률, 정밀도는 맞다고 한 것의 신뢰도, 재현율은 놓치지 않는 능력, F1은 정밀도와 재현율의 균형입니다."
      >
        {renderCards(
          [
            { key: 'acc', label: '정확도', sub: '전체 중 맞춘 비율', tone: 'cyan' },
            { key: 'prec', label: '정밀도', sub: '양성 예측의 신뢰도', tone: 'lime' },
            { key: 'recall', label: '재현율', sub: '실제 양성을 놓치지 않음', tone: 'amber' },
            { key: 'f1', label: 'F1', sub: '정밀도와 재현율 균형', tone: 'violet' },
          ],
          activeByStep[stepId ?? ''],
        )}
      </LearningVisualFrame>
    );
  }

  const modelCards: Partial<Record<Adsp3DiagramMode, { eyebrow: string; title: string; caption: string; cards: DiagramCard[] }>> = {
    adsp3Logistic: {
      eyebrow: 'LOGISTIC REGRESSION',
      title: '로지스틱 회귀는 확률을 S자 곡선으로 만든다',
      caption: '결과가 합격/불합격처럼 두 범주일 때 확률을 예측합니다. odds, log-odds, sigmoid를 연결해서 보면 됩니다.',
      cards: [
        { key: 'x', label: '입력 변수', sub: '공부시간, 출석률', tone: 'cyan' },
        { key: 'sigmoid', label: 'Sigmoid', sub: '0~1 확률로 변환', tone: 'lime' },
        { key: 'y', label: '분류', sub: '합격 가능성', tone: 'violet' },
      ],
    },
    adsp3Tree: {
      eyebrow: 'DECISION TREE',
      title: '의사결정나무는 질문을 타고 내려가며 분류한다',
      caption: '불순도가 줄어드는 질문을 골라 가지를 나눕니다. 너무 깊어지면 과적합이라 가지치기가 필요합니다.',
      cards: [
        { key: 'q1', label: '질문 1', sub: '공부시간 > 5?', tone: 'cyan' },
        { key: 'q2', label: '질문 2', sub: '기출 3회 이상?', tone: 'lime' },
        { key: 'leaf', label: '잎 노드', sub: '예측 결과', tone: 'amber' },
      ],
    },
    adsp3Knn: {
      eyebrow: 'K-NN',
      title: 'K-NN은 가까운 이웃 K개를 보고 판단한다',
      caption: '거리 기반 모델이라 변수 스케일이 다르면 가까움 판단이 왜곡됩니다. 그래서 표준화가 중요합니다.',
      cards: [
        { key: 'new', label: '새 점', sub: '분류할 대상', tone: 'cyan' },
        { key: 'near', label: '가까운 K개', sub: '거리 계산', tone: 'lime' },
        { key: 'vote', label: '다수결', sub: '가장 많은 라벨', tone: 'violet' },
      ],
    },
    adsp3NaiveBayes: {
      eyebrow: 'NAIVE BAYES',
      title: '나이브베이즈는 조건들이 독립이라고 단순화해 계산한다',
      caption: '실제로 완전히 독립이 아니어도 빠르고 강력합니다. 텍스트 분류처럼 단어 출현 기반 문제에서 자주 등장합니다.',
      cards: [
        { key: 'prior', label: '사전확률', sub: '원래 가능성', tone: 'cyan' },
        { key: 'likelihood', label: '우도', sub: '증거가 나올 가능성', tone: 'lime' },
        { key: 'posterior', label: '사후확률', sub: '증거 반영 후', tone: 'amber' },
      ],
    },
    adsp3Svm: {
      eyebrow: 'SVM',
      title: 'SVM은 두 집단 사이의 가장 넓은 길을 찾는다',
      caption: '마진을 최대화하는 경계선을 찾고, 선형으로 어렵다면 커널 트릭으로 더 높은 공간에서 나눕니다.',
      cards: [
        { key: 'margin', label: 'Margin', sub: '경계와 점 사이 거리', tone: 'cyan' },
        { key: 'support', label: 'Support Vector', sub: '경계를 정하는 점', tone: 'lime' },
        { key: 'kernel', label: 'Kernel', sub: '올려서 나누기', tone: 'violet' },
      ],
    },
    adsp3Neural: {
      eyebrow: 'NEURAL NETWORK',
      title: '신경망은 층을 지나며 특징을 조합한다',
      caption: '입력층, 은닉층, 출력층을 지나며 가중치를 학습합니다. CNN, RNN, AutoEncoder 같은 구조는 어디에 강한지 구분하면 됩니다.',
      cards: [
        { key: 'input', label: '입력층', sub: '데이터 입력', tone: 'cyan' },
        { key: 'hidden', label: '은닉층', sub: '특징 조합', tone: 'lime' },
        { key: 'output', label: '출력층', sub: '예측 결과', tone: 'violet' },
      ],
    },
  };

  const model = modelCards[mode];
  if (model) {
    return (
      <LearningVisualFrame
        eyebrow={model.eyebrow}
        title={model.title}
        caption={model.caption}
      >
        <div className="grid gap-2 sm:grid-cols-[1fr_22px_1fr_22px_1fr] sm:items-center">
          {model.cards.map((card, index) => (
            <Fragment key={card.key}>
              <VisualPill label={card.label} sub={card.sub} tone={card.tone} />
              {index < model.cards.length - 1 ? (
                <div className="hidden sm:block">
                  <ArrowStep />
                </div>
              ) : null}
            </Fragment>
          ))}
        </div>
      </LearningVisualFrame>
    );
  }

  return null;
}

type Sqld2BasicsDiagramMode =
  | 'commands'
  | 'algebra'
  | 'execution'
  | 'aliasDistinct'
  | 'stringFunctions'
  | 'numberDateFunctions'
  | 'aggregateFunctions'
  | 'nullFunctions'
  | 'caseDecode'
  | 'where'
  | 'groupHaving'
  | 'orderBy';

type Sqld2UsageDiagramMode =
  | 'joinKinds'
  | 'joinSyntax'
  | 'crossSelf'
  | 'subquery'
  | 'multirow'
  | 'setOps'
  | 'groupExtension'
  | 'windowRank'
  | 'windowAggregate'
  | 'lagLeadFrame'
  | 'topN'
  | 'regex';

type Sqld2ManagementDiagramMode =
  | 'dml'
  | 'merge'
  | 'tcl'
  | 'autocommit'
  | 'createTable'
  | 'ddlCompare'
  | 'constraints'
  | 'dcl';

function VisualPillGrid({
  items,
  columns = 'grid-cols-2',
}: {
  items: Array<{ label: string; sub?: string; tone?: VisualTone }>;
  columns?: string;
}) {
  return (
    <div className={`grid gap-2 ${columns}`}>
      {items.map((item) => (
        <VisualPill
          key={`${item.label}-${item.sub ?? ''}`}
          label={item.label}
          sub={item.sub}
          tone={item.tone ?? 'cyan'}
        />
      ))}
    </div>
  );
}

function SqlPipeline({
  steps,
}: {
  steps: Array<{ label: string; sub?: string; tone?: VisualTone }>;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_18px_1fr_18px_1fr] sm:items-center">
      {steps.map((item, index) => (
        <Fragment key={`${item.label}-${index}`}>
          <VisualPill label={item.label} sub={item.sub} tone={item.tone ?? 'cyan'} />
          {index < steps.length - 1 ? (
            <div className="hidden sm:flex sm:items-center">
              <ArrowStep />
            </div>
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

function Sqld2BasicsDiagram({ mode }: { mode: Sqld2BasicsDiagramMode }) {
  if (mode === 'commands') {
    return (
      <LearningVisualFrame
        eyebrow="SQL COMMANDS"
        title="명령어는 역할로 먼저 나눈다"
        caption="SQLD에서는 명령어 이름을 외우기 전에 구조·데이터·권한·트랜잭션 중 무엇을 다루는지부터 잡으면 덜 헷갈립니다."
      >
        <VisualPillGrid
          columns="grid-cols-2"
          items={[
            { label: 'DDL', sub: '구조 만들기 · TCARD', tone: 'violet' },
            { label: 'DML', sub: '데이터 다루기 · SIDUM', tone: 'cyan' },
            { label: 'DCL', sub: '권한 주고 회수 · GR', tone: 'lime' },
            { label: 'TCL', sub: '확정/취소 · CRS', tone: 'amber' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'algebra') {
    return (
      <LearningVisualFrame
        eyebrow="RELATIONAL ALGEBRA"
        title="기호를 SQL 절로 바꿔 읽기"
        caption="σ는 행 조건이라 WHERE, π는 열 선택이라 SELECT, ⨝는 테이블 결합이라 JOIN과 연결하면 됩니다."
      >
        <VisualPillGrid
          columns="grid-cols-3"
          items={[
            { label: 'σ', sub: '행 선택 · WHERE', tone: 'lime' },
            { label: 'π', sub: '열 선택 · SELECT', tone: 'cyan' },
            { label: '⨝', sub: '테이블 결합 · JOIN', tone: 'violet' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'execution') {
    return (
      <LearningVisualFrame
        eyebrow="FWGHSO"
        title="SQL은 FROM부터 처리된다"
        caption="작성은 SELECT부터 해도 논리 처리는 FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY 순서입니다."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            ['FROM', '대상 표', 'cyan'],
            ['WHERE', '행 필터', 'lime'],
            ['GROUP BY', '묶기', 'violet'],
            ['HAVING', '그룹 필터', 'amber'],
            ['SELECT', '열 선택', 'cyan'],
            ['ORDER BY', '정렬', 'lime'],
          ].map(([label, sub, tone]) => (
            <VisualPill key={label} label={label} sub={sub} tone={tone as VisualTone} />
          ))}
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'aliasDistinct') {
    return (
      <LearningVisualFrame
        eyebrow="ALIAS · DISTINCT"
        title="이름 붙이고, 중복 줄이기"
        caption="ALIAS는 결과 이름을 읽기 쉽게 만들고, DISTINCT는 선택한 컬럼 조합이 같은 행을 하나로 줄입니다."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <MiniDataTable
            title="ALIAS"
            columns={['표현식', '결과 이름']}
            rows={[['SAL * 12', 'YEAR_SAL'], ['ENAME', '이름']]}
            highlight={(_, column) => (column === 1 ? 'lime' : null)}
          />
          <MiniDataTable
            title="DISTINCT"
            columns={['DEPT', '결과']}
            rows={[['10', '남김'], ['10', '중복 제거'], ['20', '남김']]}
            highlight={(_, column, value) => (column === 1 && value.includes('제거') ? 'amber' : null)}
          />
        </div>
      </LearningVisualFrame>
    );
  }

  if (mode === 'stringFunctions') {
    return (
      <LearningVisualFrame
        eyebrow="STRING FUNCTIONS"
        title="문자 함수는 글자를 자르고 찾고 바꾼다"
        caption="Oracle 기준 SUBSTR은 1부터 위치를 세고, INSTR은 찾은 글자의 위치를 반환합니다."
      >
        <SqlPipeline
          steps={[
            { label: 'QUESTDP', sub: '입력 문자열', tone: 'cyan' },
            { label: 'SUBSTR(2,3)', sub: '2번째부터 3글자', tone: 'violet' },
            { label: 'UES', sub: '결과', tone: 'lime' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'numberDateFunctions') {
    return (
      <LearningVisualFrame
        eyebrow="NUMBER · DATE"
        title="숫자는 반올림/버림, 날짜는 차이와 변환"
        caption="ROUND는 반올림, TRUNC는 버림입니다. 날짜/문자 변환은 TO_CHAR, TO_DATE 같은 형식 모델을 함께 봅니다."
      >
        <VisualPillGrid
          columns="grid-cols-2"
          items={[
            { label: 'ROUND(148.6, -1)', sub: '150', tone: 'lime' },
            { label: 'TRUNC(148.6, -1)', sub: '140', tone: 'amber' },
            { label: 'TO_CHAR(date)', sub: '날짜 → 문자', tone: 'cyan' },
            { label: 'TO_DATE(text)', sub: '문자 → 날짜', tone: 'violet' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'aggregateFunctions') {
    return (
      <LearningVisualFrame
        eyebrow="AGGREGATE"
        title="집계함수는 여러 행을 하나로 요약"
        caption="COUNT(*)는 행 자체를 세고, COUNT(컬럼)·SUM·AVG는 NULL 값을 제외하고 계산합니다."
      >
        <MiniDataTable
          title="점수"
          columns={['행', '점수', 'COUNT(*)', 'COUNT(점수)']}
          rows={[['1', '10', '포함', '포함'], ['2', 'NULL', '포함', '제외'], ['3', '20', '포함', '포함']]}
          highlight={(_, column, value) => (value === 'NULL' || column >= 2 ? 'amber' : null)}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'nullFunctions') {
    return (
      <LearningVisualFrame
        eyebrow="NULL FUNCTIONS"
        title="NULL을 다른 값으로 바꾸거나 비교"
        caption="NVL은 NULL일 때 대체값, COALESCE는 첫 NOT NULL, NULLIF는 두 값이 같으면 NULL을 반환합니다."
      >
        <VisualPillGrid
          columns="grid-cols-2"
          items={[
            { label: 'NVL(NULL, 0)', sub: '0', tone: 'lime' },
            { label: 'COALESCE(NULL, A)', sub: 'A', tone: 'cyan' },
            { label: 'NULLIF(100,100)', sub: 'NULL', tone: 'amber' },
            { label: 'NULLIF(100,90)', sub: '100', tone: 'violet' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'caseDecode') {
    return (
      <LearningVisualFrame
        eyebrow="CASE · DECODE"
        title="조건에 따라 다른 값을 반환"
        caption="CASE는 표준 SQL 조건 분기이고, DECODE는 Oracle에서 자주 보는 값 비교 함수입니다."
      >
        <SqlPipeline
          steps={[
            { label: 'SCORE ≥ 90', sub: '조건', tone: 'cyan' },
            { label: 'CASE', sub: '분기', tone: 'violet' },
            { label: 'A 등급', sub: '결과', tone: 'lime' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'where') {
    return (
      <LearningVisualFrame
        eyebrow="WHERE"
        title="WHERE는 행을 먼저 걸러낸다"
        caption="WHERE는 GROUP BY보다 먼저 실행되므로 행 단위 조건에는 좋지만, 집계 결과 조건에는 사용할 수 없습니다."
      >
        <MiniDataTable
          title="EMP WHERE SAL >= 3000"
          columns={['사원', '급여', '통과']}
          rows={[['A', '4000', 'O'], ['B', '2500', 'X'], ['C', '3200', 'O']]}
          highlight={(_, column, value) => (column === 2 ? (value === 'O' ? 'lime' : 'red') : null)}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'groupHaving') {
    return (
      <LearningVisualFrame
        eyebrow="GROUP BY · HAVING"
        title="묶은 뒤 조건은 HAVING"
        caption="WHERE는 행 조건, HAVING은 그룹으로 묶은 뒤 계산된 SUM/AVG 같은 집계 조건입니다."
      >
        <SqlPipeline
          steps={[
            { label: '행', sub: 'EMP', tone: 'cyan' },
            { label: 'GROUP BY DEPT', sub: '부서별 묶기', tone: 'violet' },
            { label: 'HAVING AVG ≥ 5000', sub: '그룹 조건', tone: 'lime' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  return (
    <LearningVisualFrame
      eyebrow="ORDER BY"
      title="마지막에 정렬한다"
      caption="ORDER BY는 SELECT 뒤에 실행되므로 별칭을 쓸 수 있습니다. Oracle ASC 기준 NULL은 뒤쪽으로 갑니다."
    >
      <div className="grid grid-cols-4 gap-1.5">
        <VisualPill label="A" sub="10" tone="cyan" />
        <VisualPill label="B" sub="20" tone="cyan" />
        <VisualPill label="C" sub="30" tone="cyan" />
        <VisualPill label="D" sub="NULL" tone="amber" />
      </div>
    </LearningVisualFrame>
  );
}

function Sqld2UsageDiagram({ mode }: { mode: Sqld2UsageDiagramMode }) {
  if (mode === 'joinKinds') {
    return (
      <LearningVisualFrame
        eyebrow="JOIN"
        title="JOIN은 두 표의 행을 맞춰 붙인다"
        caption="INNER는 매칭된 행만, OUTER는 한쪽 또는 양쪽의 안 맞는 행까지 보존합니다."
      >
        <VisualPillGrid
          columns="grid-cols-2"
          items={[
            { label: 'INNER', sub: '맞는 행만', tone: 'lime' },
            { label: 'LEFT OUTER', sub: '왼쪽 보존', tone: 'cyan' },
            { label: 'RIGHT OUTER', sub: '오른쪽 보존', tone: 'violet' },
            { label: 'FULL OUTER', sub: '양쪽 보존', tone: 'amber' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'joinSyntax') {
    return (
      <LearningVisualFrame
        eyebrow="JOIN SYNTAX"
        title="ON은 조건식, USING은 같은 컬럼명"
        caption="ON A.id = B.id처럼 조건식을 쓰고, USING(id)은 양쪽 컬럼명이 같을 때만 씁니다."
      >
        <VisualPillGrid
          columns="grid-cols-3"
          items={[
            { label: 'ON', sub: '컬럼명이 달라도 OK', tone: 'lime' },
            { label: 'USING', sub: '같은 컬럼명', tone: 'cyan' },
            { label: 'NATURAL', sub: '같은 이름 자동', tone: 'amber' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'crossSelf') {
    return (
      <LearningVisualFrame
        eyebrow="CROSS · SELF"
        title="모든 조합 vs 자기 자신과 연결"
        caption="CROSS JOIN은 M×N 모든 쌍, SELF JOIN은 같은 테이블을 별칭으로 나눠 자기 자신과 연결합니다."
      >
        <VisualPillGrid
          columns="grid-cols-2"
          items={[
            { label: '3행 × 4행', sub: 'CROSS = 12행', tone: 'amber' },
            { label: '사원 e → 상사 m', sub: 'SELF JOIN', tone: 'violet' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'subquery') {
    return (
      <LearningVisualFrame
        eyebrow="SUBQUERY"
        title="쿼리 안에 들어간 작은 쿼리"
        caption="SELECT 안은 스칼라, FROM 안은 인라인 뷰, WHERE 안은 조건 판단용 서브쿼리로 자주 나옵니다."
      >
        <VisualPillGrid
          columns="grid-cols-3"
          items={[
            { label: 'SELECT 안', sub: '스칼라', tone: 'cyan' },
            { label: 'FROM 안', sub: '인라인 뷰', tone: 'violet' },
            { label: 'WHERE 안', sub: 'IN/EXISTS', tone: 'lime' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'multirow') {
    return (
      <LearningVisualFrame
        eyebrow="MULTI-ROW"
        title="여러 행 결과는 IN/ANY/ALL/EXISTS"
        caption="NOT IN은 결과에 NULL이 섞이면 위험합니다. 계약 없는 회원처럼 부정 조건은 NOT EXISTS가 안전합니다."
      >
        <VisualPillGrid
          columns="grid-cols-2"
          items={[
            { label: 'IN', sub: '목록 중 하나', tone: 'cyan' },
            { label: 'ANY / ALL', sub: '비교 범위', tone: 'violet' },
            { label: 'EXISTS', sub: '행 존재 여부', tone: 'lime' },
            { label: 'NOT IN + NULL', sub: '시험 함정', tone: 'red' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'setOps') {
    return (
      <LearningVisualFrame
        eyebrow="SET OPERATORS"
        title="두 SELECT 결과를 집합처럼 계산"
        caption="UNION은 합집합 중복 제거, UNION ALL은 중복 유지, INTERSECT는 교집합, MINUS는 차집합입니다."
      >
        <VisualPillGrid
          columns="grid-cols-2"
          items={[
            { label: 'UNION', sub: '합집합 · 중복 제거', tone: 'cyan' },
            { label: 'UNION ALL', sub: '합집합 · 중복 유지', tone: 'amber' },
            { label: 'INTERSECT', sub: '교집합', tone: 'lime' },
            { label: 'MINUS', sub: '차집합', tone: 'violet' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'groupExtension') {
    return (
      <LearningVisualFrame
        eyebrow="ROLLUP · CUBE"
        title="소계와 총계를 자동으로 만든다"
        caption="ROLLUP은 오른쪽부터 하나씩 제거하며 소계, CUBE는 가능한 모든 조합의 집계를 만듭니다."
      >
        <VisualPillGrid
          columns="grid-cols-3"
          items={[
            { label: 'ROLLUP(A,B)', sub: '(A,B) → A → 전체', tone: 'lime' },
            { label: 'CUBE(A,B)', sub: '모든 조합', tone: 'violet' },
            { label: 'GROUPING', sub: '소계 행 구분', tone: 'amber' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'windowRank') {
    return (
      <LearningVisualFrame
        eyebrow="WINDOW RANK"
        title="행은 유지하고 순위를 붙인다"
        caption="RANK는 동점 뒤를 건너뛰고, DENSE_RANK는 건너뛰지 않으며, ROW_NUMBER는 모든 행에 고유 번호를 줍니다."
      >
        <MiniDataTable
          title="점수 100, 100, 90"
          columns={['점수', 'RANK', 'DENSE', 'ROW']}
          rows={[['100', '1', '1', '1'], ['100', '1', '1', '2'], ['90', '3', '2', '3']]}
          highlight={(_, column) => (column > 0 ? 'lime' : null)}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'windowAggregate') {
    return (
      <LearningVisualFrame
        eyebrow="WINDOW AGGREGATE"
        title="GROUP BY와 달리 행 수를 줄이지 않는다"
        caption="SUM(...) OVER(PARTITION BY 부서)는 각 사원 행을 그대로 두고 부서 합계를 옆에 붙입니다."
      >
        <MiniDataTable
          title="부서별 합계 붙이기"
          columns={['사원', '부서', '급여', '부서합']}
          rows={[['A', '10', '100', '300'], ['B', '10', '200', '300'], ['C', '20', '150', '150']]}
          highlight={(_, column) => (column === 3 ? 'lime' : null)}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'lagLeadFrame') {
    return (
      <LearningVisualFrame
        eyebrow="LAG · LEAD · FRAME"
        title="이전/다음 행과 누적 범위를 본다"
        caption="LAG는 이전 행, LEAD는 다음 행입니다. ROWS는 실제 행 수, RANGE는 정렬 값 범위 기준입니다."
      >
        <VisualPillGrid
          columns="grid-cols-2"
          items={[
            { label: 'LAG', sub: '이전 행', tone: 'cyan' },
            { label: 'LEAD', sub: '다음 행', tone: 'lime' },
            { label: 'ROWS', sub: '물리적 행', tone: 'violet' },
            { label: 'RANGE', sub: '정렬 값 범위', tone: 'amber' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'topN') {
    return (
      <LearningVisualFrame
        eyebrow="TOP N"
        title="정렬 후 상위 N개를 고른다"
        caption="Oracle ROWNUM은 ORDER BY보다 먼저 붙을 수 있어, 정렬을 인라인 뷰 안에서 먼저 처리하는 패턴이 중요합니다."
      >
        <SqlPipeline
          steps={[
            { label: 'ORDER BY', sub: '먼저 정렬', tone: 'cyan' },
            { label: '인라인 뷰', sub: '정렬 결과 고정', tone: 'violet' },
            { label: 'ROWNUM <= 5', sub: '상위 5개', tone: 'lime' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  return (
    <LearningVisualFrame
      eyebrow="REGEXP"
      title="패턴으로 문자열을 찾는다"
      caption="정규표현식은 LIKE보다 강한 패턴 검색입니다. ^는 시작, $는 끝, *는 0회 이상, +는 1회 이상입니다."
    >
      <VisualPillGrid
        columns="grid-cols-4"
        items={[
          { label: '^A', sub: 'A로 시작', tone: 'cyan' },
          { label: 'Z$', sub: 'Z로 끝', tone: 'lime' },
          { label: 'A*', sub: '0회 이상', tone: 'amber' },
          { label: 'A+', sub: '1회 이상', tone: 'violet' },
        ]}
      />
    </LearningVisualFrame>
  );
}

function Sqld2ManagementDiagram({ mode }: { mode: Sqld2ManagementDiagramMode }) {
  if (mode === 'dml') {
    return (
      <LearningVisualFrame
        eyebrow="DML"
        title="데이터 행을 넣고 바꾸고 지운다"
        caption="INSERT는 새 행, UPDATE는 기존 행 수정, DELETE는 조건에 맞는 행 삭제입니다. 테이블 구조는 그대로 둡니다."
      >
        <VisualPillGrid
          columns="grid-cols-3"
          items={[
            { label: 'INSERT', sub: '행 추가', tone: 'lime' },
            { label: 'UPDATE', sub: '행 수정', tone: 'cyan' },
            { label: 'DELETE', sub: '행 삭제', tone: 'amber' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'merge') {
    return (
      <LearningVisualFrame
        eyebrow="MERGE"
        title="있으면 수정, 없으면 삽입"
        caption="MERGE는 원본 데이터와 대상 테이블을 비교해 매칭되면 UPDATE, 매칭되지 않으면 INSERT를 수행합니다."
      >
        <SqlPipeline
          steps={[
            { label: 'USING 원본', sub: '새 데이터', tone: 'cyan' },
            { label: 'ON 매칭', sub: '키 비교', tone: 'violet' },
            { label: 'UPDATE / INSERT', sub: '분기 실행', tone: 'lime' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'tcl') {
    return (
      <LearningVisualFrame
        eyebrow="TCL"
        title="COMMIT 전까지는 되돌릴 수 있다"
        caption="SAVEPOINT는 중간 저장점입니다. COMMIT 후에는 이전 작업을 ROLLBACK으로 되돌릴 수 없습니다."
      >
        <SqlPipeline
          steps={[
            { label: 'INSERT', sub: '작업', tone: 'cyan' },
            { label: 'SAVEPOINT', sub: '중간점', tone: 'violet' },
            { label: 'ROLLBACK TO', sub: '중간점으로', tone: 'amber' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'autocommit') {
    return (
      <LearningVisualFrame
        eyebrow="AUTOCOMMIT"
        title="DDL은 앞선 DML까지 확정시킬 수 있음"
        caption="Oracle 기준 DDL은 자동 COMMIT 성격이 있어, 앞에서 아직 확정하지 않은 DML까지 함께 확정될 수 있습니다."
      >
        <SqlPipeline
          steps={[
            { label: 'INSERT', sub: '대기 중', tone: 'amber' },
            { label: 'CREATE TABLE', sub: 'DDL 실행', tone: 'violet' },
            { label: 'COMMIT됨', sub: 'ROLLBACK 불가', tone: 'red' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'createTable') {
    return (
      <LearningVisualFrame
        eyebrow="CREATE TABLE"
        title="표 이름, 컬럼, 타입, 제약을 함께 선언"
        caption="CREATE TABLE은 구조를 만드는 DDL입니다. 컬럼명, 데이터 타입, NOT NULL/PK 같은 제약조건이 같이 등장합니다."
      >
        <MiniDataTable
          title="STUDENT"
          columns={['컬럼', '타입', '제약']}
          rows={[['ID', 'NUMBER', 'PK'], ['NAME', 'VARCHAR2', 'NOT NULL'], ['EMAIL', 'VARCHAR2', 'UNIQUE']]}
          highlight={(_, column) => (column === 2 ? 'lime' : null)}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'ddlCompare') {
    return (
      <LearningVisualFrame
        eyebrow="DELETE · TRUNCATE · DROP"
        title="행만 지우나, 구조까지 지우나"
        caption="DELETE는 DML이라 조건 삭제와 ROLLBACK이 가능하고, TRUNCATE/DROP은 DDL이라 자동 COMMIT 함정이 있습니다."
      >
        <VisualPillGrid
          columns="grid-cols-3"
          items={[
            { label: 'DELETE', sub: '행 일부 가능 · DML', tone: 'cyan' },
            { label: 'TRUNCATE', sub: '행 전체 · 구조 유지', tone: 'amber' },
            { label: 'DROP', sub: '구조까지 삭제', tone: 'red' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  if (mode === 'constraints') {
    return (
      <LearningVisualFrame
        eyebrow="CONSTRAINTS"
        title="제약조건은 값이 망가지지 않게 막는 규칙"
        caption="PK는 대표 식별자, FK는 다른 표 참조, UNIQUE는 중복 방지, NOT NULL은 빈 값 금지입니다."
      >
        <VisualPillGrid
          columns="grid-cols-2"
          items={[
            { label: 'PRIMARY KEY', sub: '대표 식별자', tone: 'lime' },
            { label: 'FOREIGN KEY', sub: '다른 표 참조', tone: 'cyan' },
            { label: 'UNIQUE', sub: '중복 방지', tone: 'violet' },
            { label: 'NOT NULL', sub: 'NULL 금지', tone: 'amber' },
          ]}
        />
      </LearningVisualFrame>
    );
  }

  return (
    <LearningVisualFrame
      eyebrow="DCL"
      title="권한을 주고 회수한다"
      caption="GRANT는 권한 부여, REVOKE는 권한 회수입니다. 객체 권한의 재부여는 WITH GRANT OPTION을 봅니다."
    >
      <SqlPipeline
        steps={[
          { label: 'GRANT', sub: '권한 부여', tone: 'lime' },
          { label: 'WITH OPTION', sub: '다시 줄 수 있음', tone: 'violet' },
          { label: 'REVOKE', sub: '권한 회수', tone: 'amber' },
        ]}
      />
    </LearningVisualFrame>
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

      <ErdPlacementGrid />

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

function ErdPlacementGrid() {
  const cells = [
    { label: '핵심 엔터티', sub: '왼쪽 상단', active: true },
    { label: '주요 관계', sub: '오른쪽으로', active: false },
    { label: '참조 엔터티', sub: '상단 라인', active: false },
    { label: '세부 엔터티', sub: '아래로 확장', active: false },
    { label: '교차 엔터티', sub: '관계 사이', active: false },
    { label: '보조 정보', sub: '하단 배치', active: false },
  ];

  return (
    <div className="mb-2.5 rounded-[18px] border border-cream/10 bg-[#081632]/82 p-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="kr-heading text-[12.5px] leading-none text-cream">
          배치 감각
        </div>
        <div className="kr-body text-[10.5px] font-bold text-cream/46">
          엑셀 표처럼 먼저 보이는 자리
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {cells.map((cell, index) => (
          <motion.div
            key={cell.label}
            className={
              'min-h-[54px] rounded-[13px] border px-2 py-2 ' +
              (cell.active
                ? 'border-[#d1f843]/34 bg-[#d1f843]/10'
                : 'border-cream/10 bg-white/[0.035]')
            }
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, delay: index * 0.035 }}
          >
            <div
              className={
                'kr-heading text-[11.5px] leading-tight ' +
                (cell.active ? 'text-[#e8ff9d]' : 'text-cream/72')
              }
            >
              {cell.label}
            </div>
            <div className="mt-1 kr-body text-[9.5px] font-bold leading-tight text-cream/42">
              {cell.sub}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-2 kr-body text-[10.5px] font-bold leading-[1.45] text-cream/52">
        시험 포인트: 중요한 엔터티를 왼쪽 상단에 두면 사람이 흐름을 먼저 읽고, 관계선도 덜 꼬입니다.
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

type AnomalyDiagramMode = 'overview' | 'insert' | 'delete' | 'update';

function AnomalyTableDiagram({ mode }: { mode: AnomalyDiagramMode }) {
  const copy: Record<
    AnomalyDiagramMode,
    { label: string; title: string; caption: string; Icon: LucideIcon }
  > = {
    overview: {
      label: 'NORMALIZATION',
      title: '정규화가 필요한 이유',
      caption: '한 표에 섞인 정보를 나누면 중복과 이상 현상을 줄일 수 있어요.',
      Icon: AlertTriangle,
    },
    insert: {
      label: 'INSERT',
      title: '의도하지 않은 값도 삽입됨',
      caption: '휴학생만 넣고 싶은데 과목명·교수명 NULL까지 함께 들어오면 삽입 이상이에요.',
      Icon: Plus,
    },
    delete: {
      label: 'DELETE',
      title: '의도하지 않은 정보도 삭제됨',
      caption: '학생 행을 지웠더니 과목·교수 정보도 함께 사라지면 삭제 이상이에요.',
      Icon: Trash2,
    },
    update: {
      label: 'UPDATE',
      title: '일부만 갱신되어 모순 발생',
      caption: '반복된 교수명 중 일부만 바뀌면 같은 과목에 다른 교수명이 남아요.',
      Icon: PencilLine,
    },
  };
  const meta = copy[mode];

  return (
    <motion.figure
      className="mx-auto mt-6 w-full max-w-[560px]"
      initial={{ opacity: 0, y: 18, scale: 0.97, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.82 }}
    >
      <div className="rounded-[24px] border border-cream/10 bg-[#06122d]/94 p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.24)]">
        <div className="mb-3 flex items-start justify-between gap-3 px-1">
          <div className="min-w-0">
            <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-[#c084fc]/85">
              {meta.label}
            </div>
            <div className="kr-heading mt-1 text-[19px] leading-tight text-cream">
              {meta.title}
            </div>
            <div className="kr-body mt-1 text-[12px] font-bold leading-snug text-cream/58">
              {meta.caption}
            </div>
          </div>
          <div
            className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] border border-[#c084fc]/28 bg-[#c084fc]/12 text-[#ead7ff]"
            aria-hidden
          >
            <meta.Icon size={20} strokeWidth={2.5} />
          </div>
        </div>

        {mode === 'overview' ? <AnomalyOverviewCard /> : null}
        {mode === 'insert' ? <InsertAnomalyCard /> : null}
        {mode === 'delete' ? <DeleteAnomalyCard /> : null}
        {mode === 'update' ? <UpdateAnomalyCard /> : null}
      </div>
      <figcaption className="sr-only">
        이상 현상은 중복된 정보가 있는 테이블에서 삽입, 삭제, 갱신 과정에 부작용이 생기는 상황입니다.
      </figcaption>
    </motion.figure>
  );
}

function AnomalyOverviewCard() {
  return (
    <div className="grid gap-3">
      <MixedTableCard
        rows={[
          { no: '101', name: '홍길동', course: '수학', professor: '김OO' },
          { no: '102', name: '이순신', course: '수학', professor: '김OO' },
          { no: '103', name: '임꺽정', course: '컴퓨터', professor: '오OO' },
          { no: '104', name: '장보고', course: '경제', professor: '박OO' },
        ]}
        highlightCourseProfessor
        footer="학생, 과목, 교수 정보가 한 표에 섞여 반복됨"
      />
      <div className="flex items-center justify-center gap-2">
        <div className="h-px flex-1 bg-cream/10" />
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#d1f843]/24 bg-[#d1f843]/10 px-3 py-1.5">
          <ChevronRight size={15} strokeWidth={2.8} className="text-[#d1f843]" aria-hidden />
          <span className="kr-heading text-[11px] leading-none text-[#ecffab]">
            정규화
          </span>
        </div>
        <div className="h-px flex-1 bg-cream/10" />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <NormalizedTableCard
          title="학생"
          accent="#67e8f9"
          rows={['학번', '이름']}
        />
        <NormalizedTableCard
          title="수강"
          accent="#d1f843"
          rows={['학번', '과목명']}
        />
        <NormalizedTableCard
          title="과목"
          accent="#c084fc"
          rows={['과목명', '교수명']}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <AnomalyMiniRisk label="삽입" body="필요 없는 값 요구" />
        <AnomalyMiniRisk label="삭제" body="보존할 정보 사라짐" />
        <AnomalyMiniRisk label="갱신" body="일부만 바뀌어 모순" />
      </div>
    </div>
  );
}

function NormalizedTableCard({
  title,
  rows,
  accent,
}: {
  title: string;
  rows: string[];
  accent: string;
}) {
  return (
    <div className="rounded-[17px] border bg-white/[0.04] p-2.5" style={{ borderColor: `${accent}34` }}>
      <div className="flex items-center justify-between border-b border-cream/10 pb-2">
        <div className="kr-heading text-[14px] leading-none text-cream">
          {title}
        </div>
        <div
          className="h-2 w-2 rounded-full"
          style={{ background: accent, boxShadow: `0 0 10px ${accent}66` }}
          aria-hidden
        />
      </div>
      <div className="mt-2 grid gap-1.5">
        {rows.map((row) => (
          <div
            key={`${title}-${row}`}
            className="rounded-[10px] border border-cream/10 bg-[#071634]/80 px-2 py-1.5 text-center kr-body text-[10.5px] font-black leading-none text-cream/70"
          >
            {row}
          </div>
        ))}
      </div>
    </div>
  );
}

function InsertAnomalyCard() {
  return (
    <div className="grid gap-3">
      <div className="rounded-[20px] border border-cream/10 bg-white/[0.045] p-3">
        <div className="kr-num text-[9px] font-black uppercase tracking-[0.16em] text-cream/38">
          넣고 싶은 정보
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-[16px] border border-[#d1f843]/26 bg-[#d1f843]/10 px-3 py-2.5">
          <Plus size={16} className="shrink-0 text-[#d1f843]" strokeWidth={2.8} />
          <div className="kr-heading text-[14px] text-cream">
            105번 휴학생만 등록
          </div>
        </div>
      </div>
      <MixedTableCard
        rows={[
          { no: '105', name: '휴학생', course: 'NULL', professor: 'NULL' },
        ]}
        highlightNull
        footer="원하지 않은 과목명·교수명 NULL까지 함께 삽입됨"
      />
      <div className="rounded-[18px] border border-[#ff7a7a]/18 bg-[#ff7a7a]/8 px-3 py-2.5">
        <div className="kr-body text-[12px] font-bold leading-snug text-cream/62">
          데이터 삽입 시 의도하지 않은 값까지 함께 들어오면 삽입 이상입니다.
        </div>
      </div>
    </div>
  );
}

function DeleteAnomalyCard() {
  return (
    <div className="grid gap-3">
      <MixedTableCard
        rows={[
          { no: '104', name: '장보고', course: '경제', professor: '박OO' },
        ]}
        highlightCourseProfessor
        dimRow
        footer="이 행이 사라지면 경제 과목·박OO 교수 정보도 함께 사라짐"
      />
      <div className="flex items-center gap-2 rounded-[20px] border border-[#ffb020]/24 bg-[#ffb020]/10 px-3 py-3">
        <Trash2 size={17} className="shrink-0 text-[#ffcc66]" strokeWidth={2.8} />
        <div className="min-w-0">
          <div className="kr-heading text-[14px] text-cream">
            행 삭제
          </div>
          <div className="kr-body mt-1 text-[12px] font-bold leading-snug text-cream/58">
            학생을 지웠을 뿐인데 보존해야 할 과목·교수 정보도 함께 사라짐
          </div>
        </div>
      </div>
    </div>
  );
}

function UpdateAnomalyCard() {
  return (
    <div className="grid gap-3">
      <MixedTableCard
        rows={[
          { no: '101', name: '홍길동', course: '수학', professor: '한OO' },
          { no: '102', name: '이순신', course: '수학', professor: '김OO' },
          { no: '103', name: '임꺽정', course: '컴퓨터', professor: '오OO' },
        ]}
        highlightCourseProfessor
        conflictProfessor
        footer="같은 수학 과목인데 교수명이 서로 달라짐"
      />
      <div className="rounded-[20px] border border-[#c084fc]/24 bg-[#c084fc]/10 px-3 py-3">
        <div className="flex items-center gap-2">
          <PencilLine size={16} className="text-[#d7b2ff]" strokeWidth={2.8} />
          <div className="kr-heading text-[14px] text-cream">
            일부 행만 수정됨
          </div>
        </div>
        <div className="kr-body mt-1.5 text-[12px] font-bold leading-snug text-cream/60">
          일부 데이터만 갱신되면 같은 사실이 서로 다르게 남아 모순이 발생합니다.
        </div>
      </div>
    </div>
  );
}

function MixedTableCard({
  rows,
  highlightCourseProfessor = false,
  highlightNull = false,
  dimRow = false,
  conflictProfessor = false,
  footer,
}: {
  rows: Array<{ no: string; name: string; course: string; professor: string }>;
  highlightCourseProfessor?: boolean;
  highlightNull?: boolean;
  dimRow?: boolean;
  conflictProfessor?: boolean;
  footer: string;
}) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-cream/10 bg-[#081632]/88">
      <div className="grid grid-cols-4 border-b border-cream/10 bg-white/[0.04]">
        {['학번', '이름', '과목명', '교수명'].map((header) => (
          <div
            key={header}
            className="px-2 py-2 kr-num text-[8.5px] font-black uppercase tracking-[0.11em] text-cream/42"
          >
            {header}
          </div>
        ))}
      </div>
      {rows.map((row, idx) => (
        <div
          key={`${row.no}-${idx}`}
          className={
            'grid grid-cols-4 border-b border-cream/8 last:border-b-0 ' +
            (dimRow ? 'opacity-55' : '')
          }
        >
          <AnomalyCell>{row.no}</AnomalyCell>
          <AnomalyCell>{row.name}</AnomalyCell>
          <AnomalyCell highlight={highlightCourseProfessor} danger={highlightNull && row.course === 'NULL'}>
            {row.course}
          </AnomalyCell>
          <AnomalyCell
            highlight={highlightCourseProfessor}
            danger={highlightNull && row.professor === 'NULL'}
            conflict={conflictProfessor && row.course === '수학'}
          >
            {row.professor}
          </AnomalyCell>
        </div>
      ))}
      <div className="border-t border-cream/10 px-3 py-2 kr-body text-[11.5px] font-black leading-snug text-cream/58">
        {footer}
      </div>
    </div>
  );
}

function AnomalyCell({
  children,
  highlight = false,
  danger = false,
  conflict = false,
}: {
  children: string;
  highlight?: boolean;
  danger?: boolean;
  conflict?: boolean;
}) {
  return (
    <div className="min-h-[42px] px-2 py-2 text-[11px] font-bold leading-snug text-cream/76">
      <span
        className={
          danger
            ? 'inline-flex rounded-full border border-[#ff7a7a]/35 bg-[#ff7a7a]/12 px-2 py-1 text-[#ffd0d0]'
            : highlight
            ? 'inline-flex rounded-full border px-2 py-1 ' +
              (conflict
                ? 'border-[#c084fc]/36 bg-[#c084fc]/12 text-[#ead7ff]'
                : 'border-[#d1f843]/28 bg-[#d1f843]/10 text-[#e8ff9d]')
            : ''
        }
      >
        {children}
      </span>
    </div>
  );
}

function AnomalyMiniRisk({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-[16px] border border-cream/10 bg-white/[0.045] p-2.5">
      <div className="kr-heading text-[12px] leading-tight text-cream">
        {label}
      </div>
      <div className="kr-body mt-1 text-[10.5px] font-bold leading-snug text-cream/54">
        {body}
      </div>
    </div>
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
          PK POSITION CHECK
        </div>
        <div className="kr-heading mt-1 text-[19px] leading-tight text-cream">
          자식의 대표 이름표 안에 들어갔나?
        </div>
      </div>

      <div className="grid gap-3">
        <IdentifierCompareExample
          title="식별자 관계"
          subtitle="부모 키가 자식 PK 안으로 들어감"
          parentLabel="학생 PK"
          childLabel="수강신청 PK"
          pkRows={['학번', '과목코드']}
          attrRows={['수강일', '성적']}
          result="학번+과목코드가 없으면 수강신청 한 건을 구분할 수 없어요."
          accent="#c084fc"
          solid
        />
        <IdentifierCompareExample
          title="비식별자 관계"
          subtitle="부모 키가 자식 PK 밖에 FK로만 남음"
          parentLabel="고객 PK"
          childLabel="주문 PK"
          pkRows={['주문ID']}
          attrRows={['고객ID(FK)', '주문일']}
          result="주문은 주문ID만으로 구분되고, 고객ID는 연결용으로만 남아요."
          accent="#67e8f9"
        />
      </div>

      <div className="mt-3 rounded-[16px] border border-[#d1f843]/18 bg-[#d1f843]/8 px-3 py-2.5">
        <div className="kr-body text-[12px] font-bold leading-[1.55] text-[#ecffab]">
          한 줄 기준: 부모 키가 자식 PK 안에 있으면 식별자, PK 밖에서 FK로만 있으면 비식별자.
        </div>
      </div>
    </div>
  );
}

function IdentifierCompareExample({
  title,
  subtitle,
  parentLabel,
  childLabel,
  pkRows,
  attrRows,
  result,
  accent,
  solid = false,
}: {
  title: string;
  subtitle: string;
  parentLabel: string;
  childLabel: string;
  pkRows: string[];
  attrRows: string[];
  result: string;
  accent: string;
  solid?: boolean;
}) {
  return (
    <div
      className="rounded-[19px] border bg-white/[0.04] p-3"
      style={{ borderColor: `${accent}42` }}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <div className="kr-heading text-[15px] leading-none text-cream">
            {title}
          </div>
          <div className="mt-1 kr-body text-[11px] font-bold leading-[1.4] text-cream/52">
            {subtitle}
          </div>
        </div>
        <div
          className="rounded-full border px-2.5 py-1 kr-num text-[9px] font-black uppercase"
          style={{
            borderColor: `${accent}45`,
            background: `${accent}12`,
            color: accent,
          }}
        >
          {solid ? '실선 감각' : '점선 감각'}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_26px_1fr] items-center gap-2">
        <div className="rounded-[15px] border border-cream/10 bg-[#071634]/82 p-2">
          <div className="kr-num text-[8px] font-black uppercase tracking-[0.14em] text-cream/38">
            부모
          </div>
          <div className="mt-1 rounded-[10px] border border-cream/10 bg-white/[0.045] px-2 py-1.5 text-center kr-heading text-[11px] leading-none text-cream/72">
            {parentLabel}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div
            className={solid ? 'h-px w-6' : 'h-px w-6 border-t'}
            style={{
              background: solid ? accent : undefined,
              borderColor: solid ? undefined : `${accent}80`,
              borderStyle: solid ? undefined : 'dashed',
            }}
          />
          <ChevronRight size={16} strokeWidth={2.8} style={{ color: accent }} aria-hidden />
          <div
            className={solid ? 'h-px w-6' : 'h-px w-6 border-t'}
            style={{
              background: solid ? accent : undefined,
              borderColor: solid ? undefined : `${accent}80`,
              borderStyle: solid ? undefined : 'dashed',
            }}
          />
        </div>

        <div className="rounded-[15px] border border-cream/10 bg-[#071634]/82 p-2">
          <div className="kr-num text-[8px] font-black uppercase tracking-[0.14em] text-cream/38">
            자식
          </div>
          <div className="mt-1 rounded-[10px] border px-2 py-1.5 text-center kr-heading text-[11px] leading-none"
            style={{
              borderColor: `${accent}42`,
              background: `${accent}10`,
              color: accent,
            }}
          >
            {childLabel}
          </div>
          <div className="mt-1.5 grid gap-1">
            {pkRows.map((row) => (
              <div
                key={row}
                className="rounded-[9px] border px-2 py-1 text-center kr-body text-[10px] font-black leading-none"
                style={{
                  borderColor: `${accent}36`,
                  background: `${accent}0d`,
                  color: solid ? '#ead7ff' : '#dffbff',
                }}
              >
                {row}
              </div>
            ))}
            {attrRows.map((row) => (
              <div
                key={row}
                className="rounded-[9px] border border-cream/10 bg-white/[0.04] px-2 py-1 text-center kr-body text-[10px] font-black leading-none text-cream/58"
              >
                {row}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-[13px] border border-cream/10 bg-white/[0.035] px-3 py-2 kr-body text-[11.3px] font-bold leading-[1.45] text-cream/62">
        {result}
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

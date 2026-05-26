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
        !keyChoiceDiagramMode ? (
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

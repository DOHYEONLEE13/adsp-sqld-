/**
 * Zone 화면 — 챕터 안의 step-by-step 학습 path.
 *
 * 구조:
 *   상단: header (back · breadcrumb · 챕터 타이틀)
 *   본문: 토픽별 섹션 — 각 토픽은 헤더 + step 노드 column.
 *         하나의 step = 하나의 노드. 클릭하면 그 step 만 단독 학습.
 *   하단: 5종 풀이 모드 chip (랜덤·약점·오답·학습·시험)
 *
 * Sololearn-스타일 path: 작은 원 노드 + 점선 connector. 3D bevel 없음.
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  Clock,
  Code2,
  Flame,
  GitBranch,
  Lock,
  RefreshCcw,
  Settings2,
  Shuffle,
  Target,
  Trophy,
} from 'lucide-react';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import { getLessonsInChapter } from '@/data/lessons';
import type { Subject } from '@/types/question';
import type { FlowMode } from '../types';
import { getZones, reviewPoolSize, type SamplingMode } from '../session';
import { useProgress } from '../useProgress';
import type { ProgressStore } from '../storage';
import { topicWeaknessOf, weaknessLevel } from '../weakness';
import { MobileTopBar, MobileBottomNav } from '../components/MobileGameNav';
import PageAmbientBg from '../components/PageAmbientBg';
import {
  getMockSlots,
  getMockProgress,
  type MockExamSlot,
  type MockExamProgress,
} from '../mockExams';
import { isStepLocked, useStepUnlocks } from '../stepUnlocks';
import { isFinaleStep, isFinaleStepLocked } from '../finale';
import { useDevUnlockFlags } from '../useDevUnlockFlags';
import { usePassSnapshot } from '../passSync';
import { hasEverSolved } from '../progressPredicates';
import {
  chapterPassProgress,
  currentPassFor,
  passUnlockState,
  type PassSession,
} from '../passes';
import { getStudyMode } from '../studyMode';
import { loadOnboardingResult } from '../onboarding/onboardingStorage';
import PassTabs from '@/components/passes/PassTabs';
import { PASS_TIER_VISUAL } from '@/types/passes';

const SUBJECT_ACCENT: Record<Subject, string> = {
  adsp: '#67e8f9',
  sqld: '#c084fc',
};

/**
 * CSS attribute selector escape — querySelector 의 [data-x="..."] 안에 들어갈 값.
 * 브라우저 native CSS.escape 가 있으면 사용, 없으면 큰따옴표·역슬래시만 escape (한글 등 비-ASCII 는 그대로).
 */
function cssEscape(s: string): string {
  if (typeof window !== 'undefined' && typeof window.CSS?.escape === 'function') {
    return window.CSS.escape(s);
  }
  return s.replace(/(["\\])/g, '\\$1');
}

export interface StartParams {
  topic: string | null;
  sampling: SamplingMode;
  flow: FlowMode;
  /** 풀이 문항 수 — 미지정 시 createSession 의 기본(10). */
  size?: number;
  /** 결과 화면 라벨. */
  label?: string;
  /** N회독 차수 — 미지정 시 1. */
  passNumber?: number;
}

export interface ReviewIdsParams {
  questionIds: string[];
  label: string;
}

interface Props {
  subject: Subject;
  chapter: number;
  /**
   * 진입 시 자동 강조할 topic — "나의 약점" 탭에서 단원 노드 클릭 시 사용.
   * 본 topic 의 첫 미완료 step 노드에 ~10초간 펄스 애니메이션 적용.
   * 사용자가 화면 어디든 한 번 인터랙션하면 즉시 페이드 (지속성 X).
   */
  highlightTopic?: string;
  /** highlightTopic 안에서 정확히 강조할 원본 step index. */
  highlightStepIdx?: number;
  /** 강조 출처 문항 id — 추적/접근성 라벨용. */
  highlightQuestionId?: string;
  /** 강조 이유. 약점 탭은 red, 학습 복귀는 과목 accent로 표시. */
  highlightReason?: 'weakness' | 'resume';
  onStart: (params: StartParams) => void;
  /** 특정 step 노드 클릭 → 그 step 만 단독 학습. passNumber 전달 (선택). */
  onSelectStep: (topic: string, stepIdx: number, passNumber?: number) => void;
  /** 모의고사 오답 복습 — 특정 문항 ID 만 묶어 학습 모드 세션. */
  onReviewIds: (params: ReviewIdsParams) => void;
  onBack: () => void;
}

export default function ZoneScreen({
  subject,
  chapter,
  highlightTopic,
  highlightStepIdx,
  highlightQuestionId,
  highlightReason = 'weakness',
  onStart,
  onSelectStep,
  onReviewIds,
  onBack,
}: Props) {
  // dev unlock 토글 변경 시 즉시 재렌더 — passUnlockState / isStepLocked 가
  // 함수 호출 시점에 localStorage 를 읽으므로 ZoneScreen 재렌더만 유도하면 됨.
  useDevUnlockFlags();
  const schema = SUBJECT_SCHEMAS[subject];
  const chapterMeta = schema.chapters.find((c) => c.chapter === chapter);
  const lessons = getLessonsInChapter(subject, chapter);
  const total = getZones(subject, chapter).reduce(
    (sum, z) => sum + z.questionCount,
    0,
  );
  const progress = useProgress();
  const reviewCount = reviewPoolSize(subject, chapter, null);
  const accent = SUBJECT_ACCENT[subject];
  const hasSqldChapterGuide = subject === 'sqld' && (chapter === 1 || chapter === 2);

  // ── Pass 시스템 통합 ───────────────────────────────────────
  const passSnap = usePassSnapshot();
  const passSessions: PassSession[] = useMemo(
    () =>
      progress.sessions
        .filter((s) => s.subject !== undefined)
        .map((s) => ({
          subject: s.subject,
          chapter: s.chapter,
          passNumber: s.passNumber ?? 1,
          total: s.total,
          correctCount: s.correctCount,
        })),
    [progress.sessions],
  );
  const defaultPass = useMemo(
    () => currentPassFor(passSessions, passSnap.stamps, subject, chapter),
    [passSessions, passSnap.stamps, subject, chapter],
  );
  // studyMode='review' 면 2회독부터 시작이 자연스러움 (사용자가 다른 곳에서
  // 1회독을 했다는 의미 → QuestDP 안 stamp 없어도 2회독 unlocked).
  //
  // 사용자 흐름 폴리시 — onboarding.persona='reviewer' (재응시생) 도 자동 review 모드:
  //   - 메타인지: 약점 단원 학습은 #/weakness 탭에서 처리되니 ZoneScreen 진입은
  //     "다른 단원 둘러보기" 의도. 기본은 복습 (2회독).
  //   - fallback_beginner ("처음부터 다시"): 이미 공부한 적 있는 재응시생이라 복습부터.
  //   사용자가 1회독 보고 싶으면 PassTabs 클릭으로 자유 진입 (잠금 X — 시각만 비활성).
  const reviewerOnboarding = loadOnboardingResult()?.persona === 'reviewer';
  const isReviewMode =
    getStudyMode(subject) === 'review' || reviewerOnboarding;
  const initialPass = isReviewMode ? Math.max(defaultPass, 2) : defaultPass;
  const [selectedPass, setSelectedPass] = useState<number>(initialPass);
  const [lockToast, setLockToast] = useState<string | null>(null);

  // 탭 데이터 — 1·2·3회독 각각의 unlock/inProgress/completed 상태
  const passTabs = useMemo(
    () =>
      [1, 2, 3].map((pass) => {
        const u = passUnlockState(
          passSessions,
          passSnap.stamps,
          subject,
          chapter,
          pass,
          // review 모드: 2회독은 강제 unlocked (3회독 이상은 정상 정책)
          { forceUnlocked: isReviewMode && pass === 2 },
        );
        const prog = chapterPassProgress(
          passSessions,
          passSnap.stamps,
          subject,
          chapter,
          pass,
        );
        return {
          passNumber: pass,
          unlocked: u.unlocked,
          inProgress: u.inProgress,
          completed: u.completed,
          progress: prog.accuracy,
        };
      }),
    [passSessions, passSnap.stamps, subject, chapter, isReviewMode],
  );

  // 선택된 회독에 따라 path 색조 변환
  const passTier = selectedPass === 1 ? 'bronze' : selectedPass === 2 ? 'gold' : 'master';
  const passColor = PASS_TIER_VISUAL[passTier].color;
  const pathAccent = selectedPass === 1 ? accent : passColor;

  // onStart 호출 시 자동으로 selectedPass 주입
  const onStartWithPass = (p: StartParams) =>
    onStart({ ...p, passNumber: p.passNumber ?? selectedPass });

  // ── highlightTopic — "나의 약점" 탭 → 단원 노드 클릭 시 자동 강조 ──
  // 마운트 시 prop 으로 받은 topic 을 활성 강조 상태로 설정 → 10초 후 자동 페이드.
  // 사용자 인터랙션 (step 클릭 등) 시 즉시 false 로 — 인지 부하 최소화.
  const [activeHighlight, setActiveHighlight] = useState<{
    topic: string;
    stepIdx?: number;
    questionId?: string;
    reason: 'weakness' | 'resume';
  } | null>(
    highlightTopic
      ? {
          topic: highlightTopic,
          stepIdx: highlightStepIdx,
          questionId: highlightQuestionId,
          reason: highlightReason,
        }
      : null,
  );
  useEffect(() => {
    if (!highlightTopic) return;
    setActiveHighlight({
      topic: highlightTopic,
      stepIdx: highlightStepIdx,
      questionId: highlightQuestionId,
      reason: highlightReason,
    });
    const t = window.setTimeout(() => setActiveHighlight(null), 10000);
    return () => window.clearTimeout(t);
  }, [highlightTopic, highlightStepIdx, highlightQuestionId, highlightReason]);
  // 강조 topic 의 섹션 시작점 (Part 헤더 + Step 1) 을 sticky top bar 바로 아래로
  // 정확히 안착시킴.
  //
  // scrollIntoView({ block: 'center' }) 는 섹션이 큰 lesson 에선 (예: 53-step 데이터의 이해)
  // 섹션 중앙 = step 25 위치로 가버려 사용자가 Step 1 펄스를 바로 못 봄. 대신 섹션의 top
  // 좌표를 직접 계산해 약 88px 오프셋 (MobileTopBar h-14 = 56px + 32px 여유) 두고 scrollTo.
  // 마운트 후 첫 frame 에 layout 안정화 후 실행.
  useEffect(() => {
    if (!activeHighlight) return;
    const section = document.querySelector<HTMLElement>(
      `[data-highlight-topic="${cssEscape(activeHighlight.topic)}"]`,
    );
    if (!section) return;
    const r = window.requestAnimationFrame(() => {
      const target =
        typeof activeHighlight.stepIdx === 'number'
          ? section.querySelector<HTMLElement>(
              `[data-step-idx="${activeHighlight.stepIdx}"]`,
            ) ?? section
          : section;
      const rect = target.getBoundingClientRect();
      const TOP_BAR_OFFSET = 88; // MobileTopBar 높이 + 여유
      const targetY = rect.top + window.scrollY - TOP_BAR_OFFSET;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    });
    return () => window.cancelAnimationFrame(r);
  }, [activeHighlight]);

  return (
    <section className="relative min-h-screen text-cream isolate overflow-hidden">
      {/* 풀뷰포트 ambient 비디오 배경 + 가독성 오버레이 */}
      <PageAmbientBg />

      {/* 과목 액센트 radial — 화면 상단 (오버레이 위에 살짝) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${accent}1a 0%, rgba(1,8,40,0) 55%)`,
        }}
      />

      {/* 모바일 상/하단 내비 */}
      <MobileTopBar subject={subject} />
      <MobileBottomNav active="learn" accent={accent} />

      <div className="relative mx-auto w-full max-w-[760px] lg:max-w-[1000px] xl:max-w-[1180px] px-5 md:px-8 lg:px-12 xl:px-16 pt-20 pb-28 min-h-screen">
        {/* ============ Header ============ */}
        <header className="mb-10 md:mb-12">
          <button
            type="button"
            onClick={onBack}
            aria-label="행성으로 돌아가기"
            className="game-back-button mb-5 inline-flex items-center gap-2 kr-heading text-[11px] uppercase tracking-widest transition"
          >
            <ArrowLeft size={14} strokeWidth={2.4} />
            행성으로
          </button>

          <div className="flex items-center gap-2 kr-heading text-[10px] uppercase tracking-widest text-cream/55 mb-3 flex-wrap">
            <span style={{ color: accent }}>{subject.toUpperCase()}</span>
            <span className="text-cream/30">›</span>
            <span className="text-cream/70">Chapter {chapter}</span>
          </div>

          <h1 className="kr-heading uppercase text-[26px] md:text-[34px] leading-[1.1] tracking-[0.01em]">
            {chapterMeta?.title ?? `Chapter ${chapter}`}
          </h1>
          <p className="kr-body text-[12px] md:text-[13px] text-cream/65 mt-3 leading-[1.65] max-w-xl">
            {hasSqldChapterGuide ? (
              <>
                {chapter === 1 ? (
                  <>
                    데이터 모델링은 DB 설계의 뼈대를 잡는 과목이에요.
                    <br />
                    모델링 기초 → 성능을 지키는 설계 순서로 진행합니다.
                  </>
                ) : (
                  <>
                    SQL은 외우는 문법보다 절의 자리와 실행 순서가 중요해요.
                    <br />
                    기본 문법 → 쿼리 활용 → 관리 구문 순서로 진행합니다.
                  </>
                )}
              </>
            ) : (
              <>
                동그라미를 순서대로 눌러보세요. 짧은 개념을 보고, 바로 한 문제로
                이해했는지 확인합니다.
              </>
            )}
          </p>

          {hasSqldChapterGuide ? (
            <SqldChapterGuide
              accent={accent}
              chapter={chapter}
              lessons={lessons}
              progress={progress}
            />
          ) : null}

          {/* ── 회독 탭 ──
              사용자 흐름 폴리시 — 재응시생 (persona='reviewer') 한정으로 라벨 교체:
                1회독 → '약점 학습' (약점 chapter 우선 정렬된 1회독 풀이)
                2회독 → '복습' (reminder 카드 + 변형 문제)
              입문자 (persona='beginner') 는 기존 1·2·3회독 라벨 유지. */}
          <div className="mt-5">
            <PassTabs
              tabs={passTabs}
              currentPass={selectedPass}
              labels={
                loadOnboardingResult()?.persona === 'reviewer'
                  ? { 1: '약점 학습', 2: '복습' }
                  : undefined
              }
              onSelect={(p) => setSelectedPass(p)}
              onLockedClick={(p) => {
                setLockToast(
                  p === 2
                    ? '1회독 정답률 75% 도달 후 2회독이 열려요.'
                    : '직전 회독을 먼저 마쳐주세요.',
                );
                window.setTimeout(() => setLockToast(null), 2400);
              }}
            />
          </div>
        </header>

        {lockToast ? (
          <div
            role="status"
            className="fixed top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-full kr-num text-[12px] pointer-events-none"
            style={{
              background: 'rgba(20,32,46,0.96)',
              color: 'var(--cream)',
              border: '1px solid rgba(167,139,250,0.5)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            }}
          >
            🔒 {lockToast}
          </div>
        ) : null}

        {/* ============ 빠른 진입 chip row (모드 5종, 상단) ============ */}
        {total > 0 ? (
          <section className="mb-8 md:mb-10" aria-label="풀이 모드 빠른 진입">
            <div className="kr-num text-[10px] uppercase tracking-[0.18em] text-cream/45 mb-2.5">
              {hasSqldChapterGuide ? '연습 모드' : '빠른 진입'}
            </div>
            <div
              className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{
                scrollSnapType: 'x proximity',
                // 첫·마지막 chip 이 컨테이너 가장자리에서 잘리지 않도록 양쪽 4px 여유.
                paddingInline: '4px',
                marginInline: '-4px',
              }}
            >
              <ModeChip
                icon={<Shuffle size={14} strokeWidth={2.4} />}
                title={`전체 랜덤 · ${total}`}
                onClick={() =>
                  onStartWithPass({ topic: null, sampling: 'random', flow: 'play' })
                }
                accent="purple"
              />
              <ModeChip
                icon={<Flame size={14} strokeWidth={2.4} />}
                title="약점 집중"
                onClick={() =>
                  onStartWithPass({ topic: null, sampling: 'weakness', flow: 'play' })
                }
                accent="red"
              />
              <ModeChip
                icon={<RefreshCcw size={14} strokeWidth={2.4} />}
                title={
                  reviewCount > 0 ? `오답 복습 · ${reviewCount}` : '오답 복습'
                }
                onClick={() =>
                  reviewCount > 0 &&
                  onStartWithPass({ topic: null, sampling: 'review', flow: 'play' })
                }
                disabled={reviewCount === 0}
                accent="neon"
              />
              <ModeChip
                icon={<BookOpen size={14} strokeWidth={2.4} />}
                title="학습 모드"
                onClick={() =>
                  onStartWithPass({ topic: null, sampling: 'random', flow: 'learn' })
                }
                accent="cyan"
              />
              <ModeChip
                icon={<Clock size={14} strokeWidth={2.4} />}
                title="시험 모드"
                onClick={() =>
                  onStartWithPass({ topic: null, sampling: 'random', flow: 'test' })
                }
                accent="amber"
              />
            </div>
          </section>
        ) : null}

        {/* ============ 토픽 섹션별 step path ============ */}
        {lessons.length === 0 ? (
          <div className="liquid-glass rounded-[20px] p-8 text-center kr-body text-cream/70">
            아직 이 챕터에 플레이 가능한 콘텐츠가 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-12 md:gap-14 mb-12">
            {lessons.map((lesson, lessonIdx) => (
              <TopicSection
                key={lesson.id}
                index={lessonIdx + 1}
                topic={lesson.topic}
                lessonId={lesson.id}
                steps={lesson.steps}
                accent={pathAccent}
                progress={progress}
                isWeak={(() => {
                  const w = topicWeaknessOf(
                    subject,
                    chapter,
                    lesson.topic,
                    progress,
                  );
                  return w ? weaknessLevel(w) === 'weak' : false;
                })()}
                passNumber={selectedPass}
                pulse={activeHighlight?.topic === lesson.topic}
                pulseReason={activeHighlight?.reason ?? 'weakness'}
                highlightStepIdx={
                  activeHighlight?.topic === lesson.topic
                    ? activeHighlight.stepIdx
                    : undefined
                }
                onSelectStep={(stepIdx) => {
                  // 사용자 인터랙션 발생 → 강조 즉시 페이드.
                  setActiveHighlight(null);
                  onSelectStep(lesson.topic, stepIdx, selectedPass);
                }}
                onLockedClick={() => {
                  setLockToast('이전 단계를 먼저 끝내야 해요');
                  window.setTimeout(() => setLockToast(null), 2400);
                }}
              />
            ))}

            {/* ─── 분기: 챕터 모의고사 (4 슬롯) ─── */}
            {total > 0 ? (
              <ChapterMockExamPath
                slots={getMockSlots(chapter)}
                getSlotProgress={(slot) =>
                  getMockProgress(subject, chapter, slot.label, progress)
                }
                onStart={(slot) =>
                  onStartWithPass({
                    topic: null,
                    sampling: 'random',
                    flow: 'test',
                    size: Math.min(slot.size, total),
                    label: slot.label,
                  })
                }
                onReview={(slot, ids) =>
                  onReviewIds({
                    questionIds: ids,
                    label: `${slot.label} · 오답 복습`,
                  })
                }
              />
            ) : null}
          </div>
        )}

        {/* 챕터 전체 풀이 모드는 상단 '빠른 진입' 으로 이동 (사용자 요청 2026-05). */}
      </div>
    </section>
  );
}

// ================================================================
// TopicSection — 토픽 헤더 + step 노드 column
// ================================================================

type SqldChapterGuideLesson = {
  topic: string;
  steps: { quizId?: string }[];
};

function sqldPartGuide(chapter: number, topic: string, index: number) {
  if (chapter === 1) {
    switch (topic) {
      case '데이터 모델링의 이해':
        return {
          icon: <GitBranch size={17} strokeWidth={2.4} />,
          label: 'PART 1',
          title: '데이터 모델링',
          subtitle: '엔터티 · 속성 · 관계',
          caption: 'DB 설계의 뼈대 만들기',
        };
      case '데이터 모델과 성능':
        return {
          icon: <Target size={17} strokeWidth={2.4} />,
          label: 'PART 2',
          title: '모델과 성능',
          subtitle: '정규화 · 반정규화 · NULL',
          caption: '빠르고 안전한 설계로 다듬기',
        };
      default:
        break;
    }
  }

  if (chapter === 2) {
    switch (topic) {
      case 'SQL 기본':
        return {
          icon: <Code2 size={17} strokeWidth={2.4} />,
          label: 'PART 1',
          title: 'SQL 기본',
          subtitle: 'SELECT · WHERE · GROUP BY',
          caption: '쿼리의 뼈대와 실행 순서',
        };
      case 'SQL 활용':
        return {
          icon: <GitBranch size={17} strokeWidth={2.4} />,
          label: 'PART 2',
          title: 'SQL 활용',
          subtitle: 'JOIN · 서브쿼리 · 윈도우',
          caption: '여러 테이블을 연결하는 기술',
        };
      case '관리 구문':
        return {
          icon: <Settings2 size={17} strokeWidth={2.4} />,
          label: 'PART 3',
          title: '관리 구문',
          subtitle: 'DML · DDL · TCL · DCL',
          caption: '데이터 변경과 권한 관리',
        };
      default:
        break;
    }
  }

  return {
    icon: <BookOpen size={17} strokeWidth={2.4} />,
    label: `PART ${index}`,
    title: topic,
    subtitle: '개념 → 문제',
    caption: '짧게 보고 바로 확인',
  };
}

function topicSectionSummary(topic: string): string | null {
  switch (topic) {
    case '데이터 모델링의 이해':
      return '엔터티, 속성, 관계를 잡고 ERD로 DB 설계의 뼈대를 세워요.';
    case '데이터 모델과 성능':
      return '정규화, 반정규화, 트랜잭션, NULL로 성능과 안정성을 다져요.';
    case 'SQL 기본':
      return 'SELECT부터 GROUP BY까지, SQL 문장을 읽는 기본 순서를 잡아요.';
    case 'SQL 활용':
      return 'JOIN, 서브쿼리, 윈도우 함수로 여러 테이블을 다루는 힘을 키워요.';
    case '관리 구문':
      return 'DML, DDL, TCL, DCL로 데이터를 바꾸고 지키는 명령을 익혀요.';
    default:
      return null;
  }
}

function SqldChapterGuide({
  accent,
  chapter,
  lessons,
  progress,
}: {
  accent: string;
  chapter: number;
  lessons: SqldChapterGuideLesson[];
  progress: ProgressStore;
}) {
  const label = chapter === 1 ? 'MODEL ROADMAP' : 'SQL ROADMAP';
  const ariaLabel =
    chapter === 1 ? 'SQLD 1과목 학습 순서' : 'SQLD 2과목 학습 순서';

  return (
    <section className="mt-3.5 md:mt-5" aria-label={ariaLabel}>
      <div className="kr-num mb-1.5 md:mb-2.5 text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-cream/42">
        {label}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {lessons.map((lesson, lessonIdx) => {
          const meta = sqldPartGuide(chapter, lesson.topic, lessonIdx + 1);
          const quizSteps = lesson.steps.filter((step) => !!step.quizId);
          const done = quizSteps.reduce((acc, step) => {
            const stat = step.quizId
              ? progress.questionStats[step.quizId]
              : undefined;
            return acc + (hasEverSolved(stat) ? 1 : 0);
          }, 0);
          const pct = quizSteps.length > 0 ? (done / quizSteps.length) * 100 : 0;

          return (
            <article
              key={lesson.topic}
              className="min-w-[148px] flex-1 rounded-[16px] border px-3 py-2.5 md:min-w-[188px] md:rounded-[18px] md:px-3.5 md:py-3.5"
              style={{
                background:
                  'linear-gradient(145deg, rgba(239,244,255,0.075), rgba(7,16,43,0.52))',
                borderColor: `${accent}2f`,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
              }}
            >
              <div className="mb-2 flex items-center justify-between gap-2 md:mb-3 md:gap-3">
                <span
                  className="inline-flex size-6 items-center justify-center rounded-full md:size-8"
                  style={{
                    color: accent,
                    background: `${accent}17`,
                    border: `1px solid ${accent}33`,
                  }}
                >
                  {meta.icon}
                </span>
                <span className="kr-num text-[8px] uppercase tracking-[0.14em] text-cream/42 md:text-[9px] md:tracking-[0.16em]">
                  {meta.label}
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <h2 className="kr-heading text-[13px] leading-tight text-cream md:text-[15px]">
                  {meta.title}
                </h2>
                <span className="kr-num shrink-0 text-[9px] text-cream/45 md:hidden">
                  {done}/{quizSteps.length}
                </span>
              </div>
              <p className="kr-body mt-1 hidden text-[11px] leading-[1.45] text-cream/58 md:block">
                {meta.caption}
              </p>
              <p className="kr-num mt-3 hidden text-[9px] uppercase tracking-[0.14em] text-cream/40 md:block">
                {meta.subtitle}
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8 md:mt-3 md:h-1.5">
                <div
                  className="h-full rounded-full transition-[width]"
                  style={{
                    width: `${pct}%`,
                    background: accent,
                    boxShadow: `0 0 12px ${accent}66`,
                  }}
                />
              </div>
              <div className="kr-num mt-2 hidden text-[10px] text-cream/45 md:block">
                {done}/{quizSteps.length} step
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

interface TopicSectionProps {
  index: number;
  topic: string;
  lessonId: string;
  steps: { id: string; title: string; quizId?: string }[];
  accent: string;
  progress: ProgressStore;
  isWeak: boolean;
  /**
   * 현재 회독 차수 (1·2·3). 2 이상이면 review-only step (quizId 없음) 을
   * 노출에서 제외 — 회독 자체가 복습이라 안에 또 복습 step 둘 필요 없음.
   */
  passNumber: number;
  /** "나의 약점" 진입 시 본 topic 을 자동 강조 — 첫 미완료/미잠금 step 에 펄스. */
  pulse?: boolean;
  pulseReason?: 'weakness' | 'resume';
  /** 펄스를 특정 원본 step index 에 고정. 없으면 첫 미완료 step. */
  highlightStepIdx?: number;
  onSelectStep: (stepIdx: number) => void;
  onLockedClick?: (stepIdx: number) => void;
}

function TopicSection({
  index,
  topic,
  lessonId,
  steps,
  accent,
  progress,
  isWeak,
  passNumber,
  pulse = false,
  pulseReason = 'weakness',
  highlightStepIdx,
  onSelectStep,
  onLockedClick,
}: TopicSectionProps) {
  const lockSnap = useStepUnlocks();
  // dev unlock 토글이 변경되면 즉시 재렌더 — isStepLocked / isFinaleStepLocked
  // 가 함수 호출 시점에 localStorage 를 읽으므로 hook 결과 사용 안 해도 됨.
  // 단지 변경 감지 → 재렌더 트리거 목적.
  useDevUnlockFlags();

  // review-only step (quizId 없음) 은 모든 회독에서 노출 제외.
  // 사용자 정책: 회독 시스템 안에 별도 복습 step 두지 않음 (회독 자체가 복습).
  // _origIdx 보존 — onSelectStep 호출 시 lesson.steps 의 원본 index 전달용.
  void passNumber; // 향후 회독별 분기 필요 시 사용
  const stepsWithIdx = steps.map((s, i) => ({ ...s, _origIdx: i }));
  const visibleSteps = stepsWithIdx.filter((s) => !!s.quizId);

  // ── 레슨 정복 여부 (CLAUDE.md P1 §5 — 토픽 노드 완료 표식) ──
  // 한 번이라도 맞힌 visible step 은 "정복 완료"로 본다. 이후 복습 오답은 완료 진도를 지우지 않는다.
  // 골드 체크 배지로 시각화 → 사용자가 무엇을 끝냈는지 한눈에.
  const stepCompletedCount = visibleSteps.reduce((acc, s) => {
    const stat = s.quizId ? progress.questionStats[s.quizId] : undefined;
    return acc + (hasEverSolved(stat) ? 1 : 0);
  }, 0);
  const lessonCompleted =
    visibleSteps.length > 0 && stepCompletedCount === visibleSteps.length;
  const sectionSummary = topicSectionSummary(topic);

  // pulse 활성화 시: 첫 미완료(미정답) step 의 displayIdx 를 골라 펄스 표시 노드로.
  // 모두 완료된 토픽이면 첫 step 에 펄스 (= "다시 복기" 안내).
  const pulseDisplayIdx = pulse
    ? (() => {
        if (typeof highlightStepIdx === 'number') {
          const explicitIdx = visibleSteps.findIndex(
            (s) => s._origIdx === highlightStepIdx,
          );
          if (explicitIdx >= 0) return explicitIdx;
        }
        for (let i = 0; i < visibleSteps.length; i += 1) {
          const s = visibleSteps[i];
          const stat = s.quizId ? progress.questionStats[s.quizId] : undefined;
          const completed = hasEverSolved(stat);
          if (!completed) return i;
        }
        return 0;
      })()
    : -1;

  return (
    <section data-highlight-topic={topic}>
      {/* 섹션 헤더 — caps eyebrow + 토픽 이름 + hairline */}
      <div className="mb-5">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span
            className="kr-heading uppercase text-[10px] tracking-widest"
            style={{ color: accent, letterSpacing: '0.18em' }}
          >
            Part {index}
          </span>
          <h3
            className="kr-heading text-[17px] md:text-[19px] uppercase tracking-[0.01em]"
            style={lessonCompleted ? { color: '#FFD66B' } : undefined}
          >
            {topic}
          </h3>
          {/* 완료 배지 — 모든 step 정답. weak 보다 우선 (정복은 약점 상위 상태). */}
          {lessonCompleted ? (
            <span
              className="kr-heading inline-flex items-center gap-1 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{
                color: '#FFD66B',
                background:
                  'linear-gradient(135deg, rgba(255,214,107,0.18), rgba(255,176,32,0.12))',
                border: '1px solid rgba(255,214,107,0.45)',
                boxShadow: '0 0 12px -2px rgba(255,214,107,0.35)',
              }}
            >
              <Check size={9} strokeWidth={3} />
              정복
            </span>
          ) : isWeak ? (
            <span
              className="kr-heading inline-flex items-center gap-1 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ color: '#f87171', background: 'rgba(248, 113, 113, 0.12)' }}
            >
              <Flame size={9} strokeWidth={2.6} />
              약점
            </span>
          ) : null}
          <span
            className="kr-body text-[11px] tabular-nums ml-auto"
            style={{
              color: lessonCompleted
                ? 'rgba(255,214,107,0.75)'
                : 'rgba(239,244,255,0.5)',
            }}
          >
            {lessonCompleted
              ? `${visibleSteps.length}/${visibleSteps.length} steps`
              : `${stepCompletedCount}/${visibleSteps.length} steps`}
          </span>
        </div>
        {sectionSummary ? (
          <p className="kr-body mt-2 max-w-[520px] text-[11.5px] leading-[1.55] text-cream/58">
            {sectionSummary}
          </p>
        ) : null}
        <div
          className="h-px mt-3"
          style={{
            background: lessonCompleted
              ? 'linear-gradient(90deg, rgba(255,214,107,0.55), rgba(255,176,32,0.15))'
              : `${accent}33`,
          }}
          aria-hidden
        />
      </div>

      {/* step 노드 column */}
      <div className="flex flex-col">
        {visibleSteps.map((step, displayIdx) => {
          const idx = step._origIdx;
          // review (quiz-less) step 은 stat 없음 — 항상 미완료 취급 (진행하면 됨).
          const stat = step.quizId
            ? progress.questionStats[step.quizId]
            : undefined;
          const completed = hasEverSolved(stat);
          const attempted = !!stat && (stat.attempts ?? 0) > 0;
          // 이전 step 클리어 여부 — visibleSteps 기준으로 prev 산정.
          const prevStep = displayIdx > 0 ? visibleSteps[displayIdx - 1] : null;
          const prevSolved = !prevStep
            ? true
            : !prevStep.quizId
              ? true // review 전용 step 은 진입만으로 통과 (1회독에서만 노출)
              : (() => {
                  const ps = progress.questionStats[prevStep.quizId];
                  return !!ps && (ps.correct ?? 0) > 0;
                })();
          // finale step 은 별도 잠금 (subject 완주 + admin 검수 모드만 우회).
          const locked = isFinaleStep(step)
            ? isFinaleStepLocked(progress, step)
            : isStepLocked(lockSnap, lessonId, idx, prevSolved);
          return (
            <StepNode
              key={step.id}
              stepIdx={idx}
              n={displayIdx + 1}
              title={step.title}
              accent={accent}
              completed={completed}
              attempted={attempted}
              locked={locked}
              isLast={displayIdx === visibleSteps.length - 1}
              pulse={displayIdx === pulseDisplayIdx}
              pulseReason={pulseReason}
              onClick={() => {
                if (locked) {
                  onLockedClick?.(idx);
                  return;
                }
                onSelectStep(idx);
              }}
            />
          );
        })}
      </div>
    </section>
  );
}

// ================================================================
// StepNode — 작은 원형 step 노드 + 타이틀 + 다음 노드와 connector
// ================================================================

interface StepNodeProps {
  stepIdx: number;
  n: number;
  title: string;
  accent: string;
  completed: boolean;
  attempted: boolean;
  locked: boolean;
  isLast: boolean;
  /** "나의 약점" 진입 자동 강조 — 펄스 링 + 살짝 강한 보더. */
  pulse?: boolean;
  pulseReason?: 'weakness' | 'resume';
  onClick: () => void;
}

function StepNode({
  stepIdx,
  n,
  title,
  accent,
  completed,
  attempted,
  locked,
  isLast,
  pulse = false,
  pulseReason = 'weakness',
  onClick,
}: StepNodeProps) {
  const pulseLabel = pulseReason === 'resume' ? '여기서 시작' : '여기 풀기';
  const pulseA11y = pulseReason === 'resume' ? '학습 복귀 — 여기서부터' : '약점 — 여기서부터';
  return (
    <div
      className="flex"
      data-step-idx={stepIdx}
      data-step-target={pulse ? 'true' : undefined}
    >
      {/* 좌측: 노드 + connector */}
      <div className="flex flex-col items-center mr-4 md:mr-5">
        <button
          type="button"
          onClick={onClick}
          aria-label={`Step ${n} ${title}${completed ? ' (완료)' : locked ? ' (잠김 — 앞 단계 먼저)' : ''}${pulse ? ` (${pulseA11y})` : ''}`}
          aria-disabled={locked}
          className={`relative w-11 h-11 md:w-12 md:h-12 rounded-full inline-flex items-center justify-center transition shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon${
            pulse
              ? ` qd-pulse-ring${pulseReason === 'resume' ? ' qd-pulse-ring-resume' : ''}`
              : ''
          }`}
          style={{
            // 잠금 step 도 어두운 별 사진 배경 위에서 보이도록 살짝 어두운 backdrop
            // 추가 (transparent → rgba(1,8,40,0.45)). 활성 step 은 그대로 transparent.
            background: completed
              ? accent
              : locked
                ? 'rgba(1,8,40,0.45)'
                : 'transparent',
            border: completed
              ? `2px solid ${accent}`
              : attempted
                ? `2px solid ${accent}aa`
                : locked
                  ? '1.5px solid rgba(239,244,255,0.18)'
                  : `1.5px solid rgba(239,244,255,0.22)`,
            color: completed
              ? '#010828'
              : locked
                ? 'rgba(239,244,255,0.6)'
                : 'rgba(239,244,255,0.85)',
            // 0.55 → 0.7 — 잠금 표현 유지하되 가독성 ↑
            opacity: locked && !completed ? 0.7 : 1,
            // 별 사진 배경의 밝은 영역에서도 동그라미 안 글자/Lock 아이콘이 묻히지 않게
            textShadow:
              completed
                ? 'none'
                : '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          {completed ? (
            <Check size={18} strokeWidth={3} />
          ) : locked ? (
            <Lock size={14} strokeWidth={2.4} />
          ) : (
            <span className="kr-heading text-[14px] tabular-nums leading-none">
              {n}
            </span>
          )}
        </button>
        {!isLast ? (
          <div
            className="w-px flex-1 my-1"
            style={{
              background: completed
                ? `linear-gradient(180deg, ${accent}88, ${accent}33)`
                : 'rgba(239,244,255,0.12)',
              minHeight: 28,
            }}
            aria-hidden
          />
        ) : null}
      </div>

      {/* 우측: step 타이틀 + 상태 라벨 */}
      <button
        type="button"
        onClick={onClick}
        aria-disabled={locked}
        className="flex-1 text-left pb-6 md:pb-7 group"
        // 0.55 → 0.7 — 잠금이라도 텍스트 읽힘. 디자인은 그대로 무딘 톤 유지.
        style={{ opacity: locked && !completed ? 0.7 : 1 }}
      >
        <h4
          className="kr-body font-medium text-[13px] md:text-[14px] tracking-[-0.005em] leading-[1.4] group-hover:text-neon transition"
          style={{
            color: completed ? 'rgba(239,244,255,0.9)' : 'var(--cream)',
            // 별 사진 배경에서도 한글이 묻히지 않게 — 미세한 어두운 그림자.
            // 0.5 alpha 정도라 시각적으로 거의 안 보이지만 contrast 가 살아남.
            textShadow: '0 1px 3px rgba(1,8,40,0.7), 0 0 1px rgba(0,0,0,0.4)',
          }}
        >
          {title}
        </h4>
        <div
          className="mt-1 flex flex-wrap items-center gap-2 kr-body text-[10.5px]"
          style={{
            color: 'rgba(239,244,255,0.7)',
            // 메타 라벨도 동일 — 작은 글자라 더 필요.
            textShadow: '0 1px 2px rgba(1,8,40,0.6)',
          }}
        >
          {completed ? (
            <span style={{ color: accent }}>✓ 완료</span>
          ) : attempted ? (
            <span style={{ color: 'rgba(239,244,255,0.85)' }}>진행 중</span>
          ) : locked ? (
            <span
              className="inline-flex items-center gap-1"
              style={{ color: 'rgba(239,244,255,0.7)' }}
            >
              <Lock size={9} strokeWidth={2.6} />
              앞 단계 먼저
            </span>
          ) : (
            <span style={{ color: 'rgba(239,244,255,0.7)' }}>시작 전</span>
          )}
          <span style={{ color: 'rgba(239,244,255,0.4)' }}>·</span>
          <span className="kr-num uppercase tracking-widest text-[9px]">
            STEP {n}
          </span>
          {pulse ? (
            <>
              <span style={{ color: 'rgba(239,244,255,0.4)' }}>·</span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 kr-heading text-[9px] uppercase tracking-widest"
                style={{
                  color: pulseReason === 'resume' ? accent : '#FFB4B4',
                  background:
                    pulseReason === 'resume'
                      ? `${accent}18`
                      : 'rgba(248,113,113,0.12)',
                  border:
                    pulseReason === 'resume'
                      ? `1px solid ${accent}66`
                      : '1px solid rgba(248,113,113,0.38)',
                  boxShadow:
                    pulseReason === 'resume'
                      ? `0 6px 18px -14px ${accent}`
                      : '0 6px 18px -14px rgba(248,113,113,0.85)',
                }}
              >
                <Target size={9} strokeWidth={2.8} />
                {pulseLabel}
              </span>
            </>
          ) : null}
        </div>
      </button>
    </div>
  );
}

// ================================================================
// ChapterMockExamPath — 4-슬롯 모의고사 path (1·2·3 + Final)
// ================================================================

interface MockPathProps {
  slots: MockExamSlot[];
  getSlotProgress: (slot: MockExamSlot) => MockExamProgress;
  onStart: (slot: MockExamSlot) => void;
  onReview: (slot: MockExamSlot, wrongIds: string[]) => void;
}

function ChapterMockExamPath({
  slots,
  getSlotProgress,
  onStart,
  onReview,
}: MockPathProps) {
  const gold = '#fbbf24';
  return (
    <section aria-label="챕터 모의고사 path" className="relative">
      {/* 분기 connector — 토픽 path 에서 모의고사 영역으로 진입하는 점선 */}
      <div className="flex justify-center mb-3 md:mb-4" aria-hidden>
        <svg width="60" height="36" viewBox="0 0 60 36" className="block">
          <path
            d="M 30 0 C 30 18, 30 18, 30 36"
            fill="none"
            stroke={`${gold}99`}
            strokeWidth="3"
            strokeDasharray="3 8"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${gold}66)` }}
          />
        </svg>
      </div>

      {/* 헤더 */}
      <div className="mb-4 md:mb-5 text-center md:text-left">
        <div
          className="kr-heading uppercase text-[10px] tracking-widest"
          style={{ color: gold, letterSpacing: '0.18em' }}
        >
          CHAPTER MOCK EXAMS
        </div>
        <h3
          className="kr-heading text-[17px] md:text-[19px] uppercase tracking-[0.01em] mt-1"
          style={{ color: '#fef3c7' }}
        >
          챕터 모의고사
        </h3>
        <p className="kr-body text-[12px] md:text-[12.5px] text-cream/65 mt-1.5 leading-[1.55]">
          실제 시험처럼 끝까지 풀어봐요. 제출 후 틀린 문제만 바로 다시 연습할 수 있어요.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:gap-4">
        {slots.map((slot) => (
          <MockExamSlotCard
            key={slot.label}
            slot={slot}
            progress={getSlotProgress(slot)}
            onStart={() => onStart(slot)}
            onReview={(ids) => onReview(slot, ids)}
          />
        ))}
      </div>
    </section>
  );
}

interface SlotCardProps {
  slot: MockExamSlot;
  progress: MockExamProgress;
  onStart: () => void;
  onReview: (ids: string[]) => void;
}

function MockExamSlotCard({
  slot,
  progress,
  onStart,
  onReview,
}: SlotCardProps) {
  const gold = '#fbbf24';
  const finalRed = '#f97316';
  const accent = slot.isFinal ? finalRed : gold;
  const tinted = slot.isFinal ? '#fff7ed' : '#fef3c7';
  const wrongCount = progress.wrongQuestionIds.length;
  const acc = Math.round(progress.bestAccuracy * 100);

  return (
    <article
      className="liquid-glass rounded-[20px] px-4 py-4 md:px-5 md:py-5"
      style={{
        border: slot.isFinal
          ? `2px solid ${accent}80`
          : `1.5px solid ${accent}55`,
        boxShadow: slot.isFinal
          ? `0 8px 28px -10px ${accent}aa`
          : `0 4px 18px -10px ${accent}80`,
      }}
    >
      <div className="flex items-center gap-3 md:gap-4">
        {/* 슬롯 메달 — 메달리언 스타일 (톤 정리, 가벼운 안쪽 림) */}
        <span
          aria-hidden
          className="relative shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full inline-flex items-center justify-center"
          style={{
            background: `radial-gradient(circle at 32% 24%, ${accent} 0%, ${accent}d8 38%, ${accent}99 78%, ${accent}66 100%)`,
            boxShadow: `0 4px 0 -1px rgba(0,0,0,0.42), 0 10px 24px -10px ${accent}aa`,
            color: '#1a1300',
          }}
        >
          {/* 안쪽 림 — 메달의 입체감 */}
          <span
            aria-hidden
            className="absolute inset-1 rounded-full pointer-events-none"
            style={{
              border: `1px solid ${slot.isFinal ? '#fff7ed' : '#fef3c7'}55`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -2px 4px rgba(0,0,0,0.18)`,
            }}
          />
          {slot.isFinal ? (
            <Trophy size={22} strokeWidth={2.6} />
          ) : (
            <span className="kr-num text-[20px] md:text-[22px] font-semibold relative">
              {slot.shortName}
            </span>
          )}
        </span>

        <div className="flex-1 min-w-0">
          <div
            className="kr-heading uppercase text-[9px] tracking-widest"
            style={{ color: accent, letterSpacing: '0.18em' }}
          >
            {slot.isFinal ? 'FINAL · 종합' : `MOCK ${slot.shortName}`}
          </div>
          <h4
            className="kr-heading text-[15px] md:text-[16px] uppercase tracking-[0.01em] mt-0.5"
            style={{ color: tinted }}
          >
            모의고사 {slot.shortName} · {slot.size}문항
          </h4>
          {progress.completed ? (
            <div className="kr-body text-[11px] text-cream/60 mt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Check size={11} strokeWidth={2.6} style={{ color: accent }} />
                완료 {progress.attempts}회
              </span>
              <span className="text-cream/30">·</span>
              <span>최고 {acc}%</span>
              {wrongCount > 0 ? (
                <>
                  <span className="text-cream/30">·</span>
                  <span style={{ color: '#f87171' }}>최근 오답 {wrongCount}개</span>
                </>
              ) : null}
            </div>
          ) : (
            <p className="kr-body text-[11px] text-cream/55 mt-0.5">
              아직 시도 전. 시험 모드로 진행돼요.
            </p>
          )}
        </div>
      </div>

      {/* CTA — 미완료: 도전. 완료: 다시 풀어보기 + 오답 복습. */}
      <div className="mt-3 md:mt-4 flex items-center gap-2">
        {progress.completed ? (
          <>
            <button
              type="button"
              onClick={onStart}
              className="kr-heading uppercase tracking-widest text-[11px] md:text-[12px] px-3.5 py-2.5 rounded-full transition active:scale-95 inline-flex items-center gap-1.5"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: tinted,
                border: `1px solid ${accent}55`,
                letterSpacing: '0.16em',
              }}
            >
              <RefreshCcw size={12} strokeWidth={2.4} />
              다시 풀어보기
            </button>
            {wrongCount > 0 ? (
              <button
                type="button"
                onClick={() => onReview(progress.wrongQuestionIds)}
                className="kr-heading uppercase tracking-widest text-[11px] md:text-[12px] px-3.5 py-2.5 rounded-full transition active:scale-95 inline-flex items-center gap-1.5 flex-1 justify-center"
                style={{
                  background: '#f87171',
                  color: '#1a0808',
                  letterSpacing: '0.16em',
                }}
              >
                <BookOpen size={12} strokeWidth={2.4} />
                오답 {wrongCount}개 복습
              </button>
            ) : (
              <span
                className="kr-heading uppercase text-[10px] tracking-widest text-cream/45 ml-auto"
                style={{ letterSpacing: '0.16em' }}
              >
                오답 0 · 만점!
              </span>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={onStart}
            className="kr-heading uppercase tracking-widest text-[12px] md:text-[13px] px-4 py-2.5 rounded-full transition active:scale-95 inline-flex items-center gap-2 ml-auto"
            style={{
              background: accent,
              color: '#1a1300',
              letterSpacing: '0.16em',
            }}
          >
            도전
            <Trophy size={12} strokeWidth={2.6} />
          </button>
        )}
      </div>
    </article>
  );
}

// ================================================================
// ModeChip — 챕터 전체 풀이 모드 (secondary, chip 형태)
// ================================================================

interface ModeChipProps {
  icon: ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  accent: 'purple' | 'red' | 'neon' | 'cyan' | 'amber';
}

function ModeChip({ icon, title, onClick, disabled, accent }: ModeChipProps) {
  const fg = {
    purple: '#a78bfa',
    red: '#f87171',
    neon: 'var(--neon)',
    cyan: '#67e8f9',
    amber: '#fbbf24',
  }[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="liquid-glass kr-heading inline-flex items-center gap-2 whitespace-nowrap shrink-0 text-[11px] md:text-[12px] uppercase tracking-widest px-3.5 py-2.5 rounded-full hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <span style={{ color: fg }} className="inline-flex">
        {icon}
      </span>
      <span>{title}</span>
    </button>
  );
}

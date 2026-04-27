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

import { type ReactNode } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  Clock,
  Flame,
  Lock,
  RefreshCcw,
  Shuffle,
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

const SUBJECT_ACCENT: Record<Subject, string> = {
  adsp: '#67e8f9',
  sqld: '#c084fc',
};

export interface StartParams {
  topic: string | null;
  sampling: SamplingMode;
  flow: FlowMode;
  /** 풀이 문항 수 — 미지정 시 createSession 의 기본(10). */
  size?: number;
  /** 결과 화면 라벨. */
  label?: string;
}

export interface ReviewIdsParams {
  questionIds: string[];
  label: string;
}

interface Props {
  subject: Subject;
  chapter: number;
  onStart: (params: StartParams) => void;
  /** 특정 step 노드 클릭 → 그 step 만 단독 학습. */
  onSelectStep: (topic: string, stepIdx: number) => void;
  /** 모의고사 오답 복습 — 특정 문항 ID 만 묶어 학습 모드 세션. */
  onReviewIds: (params: ReviewIdsParams) => void;
  onBack: () => void;
}

export default function ZoneScreen({
  subject,
  chapter,
  onStart,
  onSelectStep,
  onReviewIds,
  onBack,
}: Props) {
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

      <div className="relative mx-auto w-full max-w-[760px] px-5 md:px-8 lg:px-10 pt-20 md:pt-10 pb-28 md:pb-10 min-h-screen">
        {/* ============ Header ============ */}
        <header className="mb-10 md:mb-12">
          <button
            type="button"
            onClick={onBack}
            aria-label="행성으로 돌아가기"
            className="mb-5 inline-flex items-center gap-2 kr-heading text-[11px] uppercase tracking-widest text-cream/75 hover:text-neon transition"
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
            노드를 하나씩 따라가며 개념을 정복하세요. 한 노드 = 한 개의 짧은 step
            (개념 + 확인 문제 한 묶음).
          </p>
        </header>

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
                accent={accent}
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
                onSelectStep={(stepIdx) =>
                  onSelectStep(lesson.topic, stepIdx)
                }
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
                  onStart({
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

        {/* ============ 챕터 전체 풀이 모드 (chip row) ============ */}
        {total > 0 ? (
          <section className="mt-4">
            <h2 className="kr-heading text-[11px] uppercase tracking-widest text-cream/60 mb-1">
              또 다른 풀이 모드
            </h2>
            <p className="kr-body text-[11px] text-cream/55 mb-4 leading-[1.55]">
              토픽 가리지 않고 챕터 전체로 풀기.
            </p>
            <div className="flex flex-wrap gap-2">
              <ModeChip
                icon={<Shuffle size={14} strokeWidth={2.4} />}
                title={`전체 랜덤 · ${total}`}
                onClick={() =>
                  onStart({ topic: null, sampling: 'random', flow: 'play' })
                }
                accent="purple"
              />
              <ModeChip
                icon={<Flame size={14} strokeWidth={2.4} />}
                title="약점 집중"
                onClick={() =>
                  onStart({ topic: null, sampling: 'weakness', flow: 'play' })
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
                  onStart({ topic: null, sampling: 'review', flow: 'play' })
                }
                disabled={reviewCount === 0}
                accent="neon"
              />
              <ModeChip
                icon={<BookOpen size={14} strokeWidth={2.4} />}
                title="학습 모드"
                onClick={() =>
                  onStart({ topic: null, sampling: 'random', flow: 'learn' })
                }
                accent="cyan"
              />
              <ModeChip
                icon={<Clock size={14} strokeWidth={2.4} />}
                title="시험 모드"
                onClick={() =>
                  onStart({ topic: null, sampling: 'random', flow: 'test' })
                }
                accent="amber"
              />
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}

// ================================================================
// TopicSection — 토픽 헤더 + step 노드 column
// ================================================================

interface TopicSectionProps {
  index: number;
  topic: string;
  lessonId: string;
  steps: { id: string; title: string; quizId: string }[];
  accent: string;
  progress: ProgressStore;
  isWeak: boolean;
  onSelectStep: (stepIdx: number) => void;
}

function TopicSection({
  index,
  topic,
  lessonId,
  steps,
  accent,
  progress,
  isWeak,
  onSelectStep,
}: TopicSectionProps) {
  const lockSnap = useStepUnlocks();
  return (
    <section>
      {/* 섹션 헤더 — caps eyebrow + 토픽 이름 + hairline */}
      <div className="mb-5">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span
            className="kr-heading uppercase text-[10px] tracking-widest"
            style={{ color: accent, letterSpacing: '0.18em' }}
          >
            Part {index}
          </span>
          <h3 className="kr-heading text-[17px] md:text-[19px] uppercase tracking-[0.01em]">
            {topic}
          </h3>
          {isWeak ? (
            <span
              className="kr-heading inline-flex items-center gap-1 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ color: '#f87171', background: 'rgba(248, 113, 113, 0.12)' }}
            >
              <Flame size={9} strokeWidth={2.6} />
              약점
            </span>
          ) : null}
          <span className="kr-body text-[11px] text-cream/50 tabular-nums ml-auto">
            {steps.length} steps
          </span>
        </div>
        <div
          className="h-px mt-3"
          style={{ background: `${accent}33` }}
          aria-hidden
        />
      </div>

      {/* step 노드 column */}
      <div className="flex flex-col">
        {steps.map((step, idx) => {
          const stat = progress.questionStats[step.quizId];
          const completed = !!stat?.lastCorrect && (stat?.correct ?? 0) > 0;
          const attempted = !!stat && (stat.attempts ?? 0) > 0;
          const locked = isStepLocked(lockSnap, lessonId, idx);
          return (
            <StepNode
              key={step.id}
              n={idx + 1}
              title={step.title}
              accent={accent}
              completed={completed}
              attempted={attempted}
              locked={locked}
              isLast={idx === steps.length - 1}
              onClick={() => onSelectStep(idx)}
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
  n: number;
  title: string;
  accent: string;
  completed: boolean;
  attempted: boolean;
  locked: boolean;
  isLast: boolean;
  onClick: () => void;
}

function StepNode({
  n,
  title,
  accent,
  completed,
  attempted,
  locked,
  isLast,
  onClick,
}: StepNodeProps) {
  return (
    <div className="flex">
      {/* 좌측: 노드 + connector */}
      <div className="flex flex-col items-center mr-4 md:mr-5">
        <button
          type="button"
          onClick={onClick}
          aria-label={`Step ${n} ${title}${completed ? ' (완료)' : locked ? ' (잠김 — 앞 단계 먼저)' : ''}`}
          aria-disabled={locked}
          className="w-11 h-11 md:w-12 md:h-12 rounded-full inline-flex items-center justify-center transition shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon"
          style={{
            background: completed ? accent : 'transparent',
            border: completed
              ? `2px solid ${accent}`
              : attempted
                ? `2px solid ${accent}aa`
                : locked
                  ? '1.5px solid rgba(239,244,255,0.12)'
                  : `1.5px solid rgba(239,244,255,0.22)`,
            color: completed
              ? '#010828'
              : locked
                ? 'rgba(239,244,255,0.4)'
                : 'rgba(239,244,255,0.85)',
            opacity: locked && !completed ? 0.55 : 1,
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
        style={{ opacity: locked && !completed ? 0.55 : 1 }}
      >
        <h4
          className="kr-body font-medium text-[13px] md:text-[14px] tracking-[-0.005em] leading-[1.4] group-hover:text-neon transition"
          style={{ color: completed ? 'rgba(239,244,255,0.9)' : 'var(--cream)' }}
        >
          {title}
        </h4>
        <div className="mt-1 flex items-center gap-2 kr-body text-[10.5px] text-cream/55">
          {completed ? (
            <span style={{ color: accent }}>✓ 완료</span>
          ) : attempted ? (
            <span className="text-cream/65">진행 중</span>
          ) : locked ? (
            <span className="text-cream/45 inline-flex items-center gap-1">
              <Lock size={9} strokeWidth={2.6} />
              앞 단계 먼저
            </span>
          ) : (
            <span className="text-cream/45">시작 전</span>
          )}
          <span className="text-cream/30">·</span>
          <span className="kr-num uppercase tracking-widest text-[9px]">
            STEP {n}
          </span>
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
          시험 모드 · 즉시 채점 X. 풀고 나면 [오답 복습] 으로 약점 다지기.
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
    neon: '#6FFF00',
    cyan: '#67e8f9',
    amber: '#fbbf24',
  }[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="liquid-glass kr-heading inline-flex items-center gap-2 whitespace-nowrap text-[11px] md:text-[12px] uppercase tracking-widest px-3.5 py-2.5 rounded-full hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <span style={{ color: fg }} className="inline-flex">
        {icon}
      </span>
      <span>{title}</span>
    </button>
  );
}

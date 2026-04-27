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
  RefreshCcw,
  Shuffle,
} from 'lucide-react';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import { getLessonsInChapter } from '@/data/lessons';
import type { Subject } from '@/types/question';
import type { FlowMode } from '../types';
import { getZones, reviewPoolSize, type SamplingMode } from '../session';
import { useProgress } from '../useProgress';
import type { ProgressStore } from '../storage';
import { topicWeaknessOf, weaknessLevel } from '../weakness';

const SUBJECT_ACCENT: Record<Subject, string> = {
  adsp: '#67e8f9',
  sqld: '#c084fc',
};

export interface StartParams {
  topic: string | null;
  sampling: SamplingMode;
  flow: FlowMode;
}

interface Props {
  subject: Subject;
  chapter: number;
  onStart: (params: StartParams) => void;
  /** 특정 step 노드 클릭 → 그 step 만 단독 학습. */
  onSelectStep: (topic: string, stepIdx: number) => void;
  onBack: () => void;
}

export default function ZoneScreen({
  subject,
  chapter,
  onStart,
  onSelectStep,
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
    <section className="relative min-h-screen bg-base text-cream isolate overflow-hidden">
      {/* 과목 액센트 radial — 화면 상단 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${accent}1a 0%, rgba(1,8,40,0) 55%)`,
        }}
      />

      <div className="relative mx-auto w-full max-w-[760px] px-5 md:px-8 lg:px-10 py-8 md:py-10 min-h-screen">
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
  steps: { id: string; title: string; quizId: string }[];
  accent: string;
  progress: ProgressStore;
  isWeak: boolean;
  onSelectStep: (stepIdx: number) => void;
}

function TopicSection({
  index,
  topic,
  steps,
  accent,
  progress,
  isWeak,
  onSelectStep,
}: TopicSectionProps) {
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
          return (
            <StepNode
              key={step.id}
              n={idx + 1}
              title={step.title}
              accent={accent}
              completed={completed}
              attempted={attempted}
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
  isLast: boolean;
  onClick: () => void;
}

function StepNode({
  n,
  title,
  accent,
  completed,
  attempted,
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
          aria-label={`Step ${n} ${title}${completed ? ' (완료)' : ''}`}
          className="w-11 h-11 md:w-12 md:h-12 rounded-full inline-flex items-center justify-center transition shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon"
          style={{
            background: completed ? accent : 'transparent',
            border: completed
              ? `2px solid ${accent}`
              : attempted
                ? `2px solid ${accent}aa`
                : `1.5px solid rgba(239,244,255,0.22)`,
            color: completed ? '#010828' : 'rgba(239,244,255,0.85)',
          }}
        >
          {completed ? (
            <Check size={18} strokeWidth={3} />
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
        className="flex-1 text-left pb-6 md:pb-7 group"
      >
        <h4
          className="kr-heading text-[14px] md:text-[15px] tracking-[0.01em] leading-[1.35] group-hover:text-neon transition"
          style={{ color: completed ? 'rgba(239,244,255,0.9)' : 'var(--cream)' }}
        >
          {title}
        </h4>
        <div className="mt-1 flex items-center gap-2 kr-body text-[10.5px] text-cream/55">
          {completed ? (
            <span style={{ color: accent }}>✓ 완료</span>
          ) : attempted ? (
            <span className="text-cream/65">진행 중</span>
          ) : (
            <span className="text-cream/45">시작 전</span>
          )}
          <span className="text-cream/30">·</span>
          <span className="kr-heading uppercase tracking-widest text-[9px]">
            STEP {n}
          </span>
        </div>
      </button>
    </div>
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

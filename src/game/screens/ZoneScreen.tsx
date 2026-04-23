/**
 * Zone 화면 — 챕터 안의 토픽 리스트 + 모드 CTA.
 *
 * 상단: 5종 모드 CTA (랜덤 · 약점 · 오답 · 학습 · 시험)
 * 하단: "토픽별 집중" — Duolingo-풍 3D 노드 로드맵
 *       각 토픽이 3D-beveled 노드로 이어져 챕터 진행 흐름을 보여준다.
 *
 * PlanetScreen 과 시각 톤 통일: HUD 제거, h1 26/36/44, cursive 32/44,
 * 3D 노드 78px + 지그재그 경로.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Flame,
  RefreshCcw,
  Shuffle,
} from 'lucide-react';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import { getLesson } from '@/data/lessons';
import type { Subject } from '@/types/question';
import type { FlowMode } from '../types';
import {
  getZones,
  reviewPoolSize,
  type SamplingMode,
} from '../session';
import {
  aggregateTopic,
  solvedRatio,
  type Aggregate,
} from '../aggregate';
import { useProgress } from '../useProgress';
import { topicWeaknessOf, weaknessLevel } from '../weakness';
import type { ProgressStore } from '../storage';

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
  /** 토픽 노드 탭 → 개념 학습 화면으로. */
  onSelectTopic: (topic: string) => void;
  onBack: () => void;
}

export default function ZoneScreen({
  subject,
  chapter,
  onStart,
  onSelectTopic,
  onBack,
}: Props) {
  const schema = SUBJECT_SCHEMAS[subject];
  const chapterMeta = schema.chapters.find((c) => c.chapter === chapter);
  const zones = getZones(subject, chapter);
  const total = zones.reduce((sum, z) => sum + z.questionCount, 0);
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
          background: `radial-gradient(ellipse at 50% 0%, ${accent}22 0%, rgba(1,8,40,0) 55%)`,
        }}
      />
      {/* 하단 비네트 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(1,8,40,0) 70%, rgba(1,8,40,0.7) 100%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-layout px-6 md:px-10 lg:px-16 py-8 md:py-10 lg:py-12 min-h-screen">
        {/* ============ Header ============ */}
        <header className="mb-10 md:mb-14 max-w-[640px]">
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
            <span>Galaxy</span>
            <span className="text-cream/30">›</span>
            <span style={{ color: accent }}>{subject.toUpperCase()} Planet</span>
            <span className="text-cream/30">›</span>
            <span className="text-cream/70">Chapter {chapter}</span>
          </div>

          <span className="cursive text-neon text-[32px] md:text-[44px] leading-[0.95] drop-shadow-[0_0_20px_rgba(111,255,0,0.35)]">
            Zone
          </span>
          <h1 className="kr-heading uppercase text-[26px] md:text-[36px] lg:text-[44px] mt-3 leading-[1.15] tracking-[0.01em] drop-shadow-[0_2px_20px_rgba(0,0,0,0.75)]">
            {chapterMeta?.title ?? `Chapter ${chapter}`}
          </h1>
          <p className="kr-body text-[13px] md:text-[14px] leading-[1.7] text-cream/80 mt-4 max-w-xl">
            공략할 모드와 토픽을 선택하세요.
          </p>
        </header>

        {/* ============ 모드 CTA ============ */}
        {total > 0 ? (
          <section className="mb-12 md:mb-16">
            <h2 className="kr-heading text-[11px] uppercase tracking-widest text-cream/60 mb-4">
              플레이 모드
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <ModeCta
                icon={<Shuffle size={18} strokeWidth={2.4} />}
                title="전체 랜덤 믹스"
                subtitle={`챕터 전 토픽 · ${total}개`}
                onClick={() =>
                  onStart({ topic: null, sampling: 'random', flow: 'play' })
                }
                accent="purple"
              />
              <ModeCta
                icon={<Flame size={18} strokeWidth={2.4} />}
                title="약점 집중 공략"
                subtitle="틀렸거나 오래된 문항 우선"
                onClick={() =>
                  onStart({ topic: null, sampling: 'weakness', flow: 'play' })
                }
                accent="red"
              />
              <ModeCta
                icon={<RefreshCcw size={18} strokeWidth={2.4} />}
                title="오답 복습"
                subtitle={
                  reviewCount > 0 ? `복습 가능 ${reviewCount}개` : '오답 없음'
                }
                onClick={() =>
                  reviewCount > 0 &&
                  onStart({ topic: null, sampling: 'review', flow: 'play' })
                }
                disabled={reviewCount === 0}
                accent="neon"
              />
              <ModeCta
                icon={<BookOpen size={18} strokeWidth={2.4} />}
                title="학습 모드"
                subtitle="해설부터 읽고 풀기"
                onClick={() =>
                  onStart({ topic: null, sampling: 'random', flow: 'learn' })
                }
                accent="cyan"
              />
              <ModeCta
                icon={<Clock size={18} strokeWidth={2.4} />}
                title="시험 모드"
                subtitle="타이머 · 일괄 채점"
                onClick={() =>
                  onStart({ topic: null, sampling: 'random', flow: 'test' })
                }
                accent="amber"
              />
            </div>
          </section>
        ) : null}

        {/* ============ 토픽별 집중 — 3D 로드맵 ============ */}
        <section>
          <h2 className="kr-heading text-[11px] uppercase tracking-widest text-cream/60 mb-2">
            토픽별 개념 학습
          </h2>
          <p className="kr-body text-[12px] text-cream/60 mb-8 leading-[1.6]">
            노드를 누르면 개념을 먼저 학습한 뒤, 같은 주제의 실전 예제로
            이어집니다.
          </p>

          {zones.length === 0 ? (
            <div className="liquid-glass rounded-[24px] p-8 text-center kr-body text-cream/70 max-w-xl mx-auto">
              아직 이 행성에 플레이 가능한 문항이 없습니다.
            </div>
          ) : (
            <div className="flex justify-center">
              <TopicPath
                zones={zones}
                subject={subject}
                chapter={chapter}
                accent={accent}
                progress={progress}
                onSelectTopic={onSelectTopic}
              />
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

// ================================================================
// ModeCta — 상단 모드 선택 카드 (로드맵 아님, 액션 버튼)
// ================================================================

interface ModeCtaProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  disabled?: boolean;
  accent: 'purple' | 'red' | 'neon' | 'cyan' | 'amber';
}

function ModeCta({
  icon,
  title,
  subtitle,
  onClick,
  disabled,
  accent,
}: ModeCtaProps) {
  const bg = {
    purple: 'rgba(124, 58, 237, 0.12)',
    red: 'rgba(248, 113, 113, 0.12)',
    neon: 'rgba(111, 255, 0, 0.12)',
    cyan: 'rgba(103, 232, 249, 0.12)',
    amber: 'rgba(251, 191, 36, 0.12)',
  }[accent];
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
      className="liquid-glass rounded-[16px] p-4 text-left transition hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-3">
        <span
          className="w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0"
          style={{ background: bg, color: fg }}
        >
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="kr-heading text-[13.5px] uppercase leading-tight tracking-[0.01em]">
            {title}
          </h3>
          <p className="kr-body text-[11px] leading-[1.5] text-cream/70 mt-1 truncate">
            {subtitle}
          </p>
        </div>
      </div>
    </button>
  );
}

// ================================================================
// TopicPath — 토픽 3D 로드맵 (PlanetScreen 의 ChapterPath 와 동일 패턴)
// ================================================================

interface TopicPathProps {
  zones: ReturnType<typeof getZones>;
  subject: Subject;
  chapter: number;
  accent: string;
  progress: ProgressStore;
  onSelectTopic: (topic: string) => void;
}

function TopicPath({
  zones,
  subject,
  chapter,
  accent,
  progress,
  onSelectTopic,
}: TopicPathProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(420);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const update = () => setW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const NODE = 78;
  const TITLE_GAP = 74;
  const NODE_GAP = 42;
  const GAP_Y = NODE + TITLE_GAP + NODE_GAP;
  const PAD_Y = 28;
  const OFFSET_X = Math.min(W * 0.11, 46);
  const CENTER = W / 2;
  const totalH = PAD_Y * 2 + NODE + (zones.length - 1) * GAP_Y;

  const nodes = zones.map((zone, idx) => {
    const leftSide = idx % 2 === 0;
    const cx = CENTER + (leftSide ? -OFFSET_X : OFFSET_X);
    const cy = PAD_Y + NODE / 2 + idx * GAP_Y;
    return { cx, cy, leftSide, zone, idx };
  });

  const PATH_MARGIN = 8;
  let d = '';
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const n = nodes[i];
    const startY = prev.cy + NODE / 2 + PATH_MARGIN;
    const endY = n.cy - NODE / 2 - PATH_MARGIN;
    const midY = (startY + endY) / 2;
    d += `M ${prev.cx} ${startY} C ${prev.cx} ${midY}, ${n.cx} ${midY}, ${n.cx} ${endY} `;
  }

  return (
    <div
      ref={ref}
      className="relative w-full max-w-[480px]"
      style={{ height: totalH }}
    >
      {/* 이어지는 경로 */}
      <svg
        width="100%"
        height={totalH}
        className="absolute inset-0 pointer-events-none"
      >
        <path
          d={d}
          fill="none"
          stroke={`${accent}77`}
          strokeWidth={3}
          strokeDasharray="3 9"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${accent}66)` }}
        />
      </svg>

      {nodes.map((n) => {
        const agg = aggregateTopic(subject, chapter, n.zone.topic, progress);
        const weakness = topicWeaknessOf(
          subject,
          chapter,
          n.zone.topic,
          progress,
        );
        const isWeak = weakness ? weaknessLevel(weakness) === 'weak' : false;
        const disabled = n.zone.questionCount === 0;
        const hasLesson = !!getLesson(subject, chapter, n.zone.topic);
        return (
          <TopicNode
            key={n.zone.topic}
            cx={n.cx}
            cy={n.cy}
            index={n.idx + 1}
            title={n.zone.topic}
            questionCount={n.zone.questionCount}
            agg={agg}
            accent={accent}
            isWeak={isWeak}
            hasLesson={hasLesson}
            disabled={disabled}
            NODE={NODE}
            TITLE_GAP={TITLE_GAP}
            containerW={W}
            onClick={() => !disabled && onSelectTopic(n.zone.topic)}
          />
        );
      })}
    </div>
  );
}

// ================================================================
// TopicNode — 3D-beveled 노드 + 진도 링 + 아래쪽 타이틀
// ================================================================

interface TopicNodeProps {
  cx: number;
  cy: number;
  index: number;
  title: string;
  questionCount: number;
  agg: Aggregate;
  accent: string;
  isWeak: boolean;
  hasLesson: boolean;
  disabled: boolean;
  NODE: number;
  TITLE_GAP: number;
  containerW: number;
  onClick: () => void;
}

function TopicNode({
  cx,
  cy,
  index,
  title,
  questionCount,
  agg,
  accent,
  isWeak,
  hasLesson,
  disabled,
  NODE,
  TITLE_GAP,
  containerW,
  onClick,
}: TopicNodeProps) {
  const ringSize = NODE + 12;
  const r = (ringSize - 4) / 2;
  const circ = 2 * Math.PI * r;
  const ratio = solvedRatio(agg);
  const titleW = Math.min(containerW - 40, 260);

  return (
    <>
      {/* 링 + 3D 노드 */}
      <div
        className="absolute"
        style={{
          left: cx - ringSize / 2,
          top: cy - ringSize / 2,
          width: ringSize,
          height: ringSize,
        }}
      >
        <svg
          width={ringSize}
          height={ringSize}
          className="absolute inset-0 pointer-events-none"
        >
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={r}
            fill="none"
            stroke="rgba(239, 244, 255, 0.14)"
            strokeWidth={3}
          />
          {!disabled && ratio > 0 ? (
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={r}
              fill="none"
              stroke={accent}
              strokeWidth={3}
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - ratio)}
              strokeLinecap="round"
              transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
              style={{
                transition: 'stroke-dashoffset 0.6s ease-out',
                filter: `drop-shadow(0 0 6px ${accent}cc)`,
              }}
            />
          ) : null}
        </svg>

        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className="absolute rounded-full inline-flex items-center justify-center transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-neon"
          style={{
            inset: 6,
            background: disabled
              ? `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.14) 0%, transparent 45%), linear-gradient(180deg, #3a4060 0%, #1b1e30 100%)`
              : `radial-gradient(circle at 32% 26%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 48%), linear-gradient(180deg, ${accent} 0%, ${accent}cc 55%, rgba(0,0,0,0.28) 100%)`,
            boxShadow: disabled
              ? '0 5px 0 -1px rgba(0,0,0,0.45), inset 0 2px 0 rgba(255,255,255,0.08), inset 0 -4px 8px rgba(0,0,0,0.35)'
              : `0 6px 0 -1px rgba(0,0,0,0.55), 0 18px 30px -10px ${accent}cc, inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -5px 12px rgba(0,0,0,0.3)`,
            border: disabled
              ? '2px solid rgba(255,255,255,0.08)'
              : `2.5px solid ${accent}`,
            opacity: disabled ? 0.55 : 1,
          }}
          aria-label={`토픽 ${index} ${title}${disabled ? ' (준비중)' : ''}`}
        >
          <span
            className="kr-heading leading-none tabular-nums text-white"
            style={{
              fontSize: NODE * 0.42,
              textShadow: '0 2px 4px rgba(0,0,0,0.35)',
            }}
          >
            {index}
          </span>
        </button>
      </div>

      {/* 타이틀 블록 */}
      <div
        className="absolute flex flex-col items-center text-center pointer-events-none"
        style={{
          left: cx - titleW / 2,
          top: cy + NODE / 2 + 14,
          width: titleW,
          height: TITLE_GAP - 14,
        }}
      >
        <h3
          className="kr-heading text-[13px] md:text-[14px] uppercase leading-[1.2] tracking-[0.02em] truncate w-full"
          style={{
            color: disabled ? 'rgba(239,244,255,0.55)' : 'var(--cream)',
            textShadow: '0 1px 10px rgba(0,0,0,0.8)',
          }}
        >
          {title}
        </h3>
        <div
          className="kr-body text-[11px] text-cream/70 mt-1.5 tabular-nums inline-flex items-center gap-2 flex-wrap justify-center"
          style={{ textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}
        >
          <span>문항 {questionCount}</span>
          <span className="text-cream/30">·</span>
          <span>{disabled ? '준비중' : `${agg.solved}/${agg.total}`}</span>
          {hasLesson && !disabled ? (
            <span
              className="kr-heading inline-flex items-center gap-1 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full"
              style={{
                color: '#6FFF00',
                background: 'rgba(111, 255, 0, 0.14)',
                border: '1px solid rgba(111,255,0,0.3)',
              }}
            >
              개념
            </span>
          ) : null}
          {isWeak ? (
            <span
              className="kr-heading inline-flex items-center gap-1 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full"
              style={{
                color: '#f87171',
                background: 'rgba(248, 113, 113, 0.16)',
              }}
            >
              <Flame size={8} strokeWidth={2.6} />
              약점
            </span>
          ) : null}
        </div>
      </div>
    </>
  );
}

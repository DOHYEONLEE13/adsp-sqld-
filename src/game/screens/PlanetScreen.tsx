/**
 * Planet 화면 — 선택된 과목의 챕터(행성) 리스트.
 *
 * 3D 행성이 뷰포트 전체를 "배경" 으로 차지하고 (fixed), 그 위에 타이틀 + 챕터
 * 로드맵이 오버레이로 떠 있는 풀블리드 레이아웃.
 *
 *   ┌────────────────────────────────────────────────┐
 *   │ ← 은하로                                        │
 *   │ Galaxy › ADSP Planet                           │
 *   │ Planet                                         │
 *   │ ADSP — 데이터분석 준전문가                     │
 *   │                                                │
 *   │        ●●●                ●  Chapter 1         │
 *   │      ●█████●               \                   │
 *   │     ███████████             ●  Chapter 2       │
 *   │      ●█████●               /                   │
 *   │        ●●●                ●  Chapter 3         │
 *   │                                                │
 *   │   adsp                                         │
 *   └────────────────────────────────────────────────┘
 *
 * 노드는 Duolingo 레슨 버튼처럼 3D-beveled 원으로, cubic bezier 한 선으로
 * 이어져 로드맵 느낌을 준다. HUD/레벨 뱃지는 이 화면에서 제거됨 — Galaxy
 * 화면에서 이미 노출되므로 여기서는 "탐사 경로" 에만 집중.
 */

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Flame } from 'lucide-react';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import type { Subject } from '@/types/question';
import { getPlanets } from '../session';
import {
  aggregateChapter,
  aggregateSubject,
  solvedRatio,
  type Aggregate,
} from '../aggregate';
import { useProgress } from '../useProgress';
import { topicWeaknessesInChapter, weaknessLevel } from '../weakness';
import type { ProgressStore } from '../storage';

const SUBJECT_ACCENT: Record<Subject, string> = {
  adsp: '#67e8f9',
  sqld: '#c084fc',
};

interface Props {
  subject: Subject;
  onSelectChapter: (chapter: number) => void;
  onBack: () => void;
}

export default function PlanetScreen({
  subject,
  onSelectChapter,
  onBack,
}: Props) {
  const schema = SUBJECT_SCHEMAS[subject];
  const planets = getPlanets(subject);
  const progress = useProgress();
  const accent = SUBJECT_ACCENT[subject];
  const subjectAgg = aggregateSubject(subject, progress);
  const totalQuestions = subjectAgg.total;

  return (
    <section className="relative min-h-screen bg-base text-cream isolate overflow-hidden">
      {/* === 2D 풀뷰포트 배경 (fixed, 스크롤해도 따라옴) === */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
        {/* 큰 행성 실루엣 — 좌측에서 반만 보임 */}
        <div
          className="absolute"
          style={{
            left: '-18vmin',
            top: '38%',
            width: '68vmin',
            height: '68vmin',
            borderRadius: '50%',
            background: `radial-gradient(circle at 62% 32%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 42%), linear-gradient(180deg, ${accent} 0%, ${accent}bb 55%, rgba(0,0,0,0.45) 100%)`,
            boxShadow: `0 0 120px -10px ${accent}, inset 0 -12px 40px rgba(0,0,0,0.4)`,
            transform: 'translateY(-50%)',
            opacity: 0.55,
          }}
        />

        {/* 과목 액센트 radial — 화면 좌중앙에 은은하게 */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 32% 52%, ${accent}24 0%, rgba(1,8,40,0) 55%)`,
          }}
        />
        {/* 상·하 비네트 — 타이틀/하단 요소 가독성 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(1,8,40,0.6) 0%, rgba(1,8,40,0) 18%, rgba(1,8,40,0) 72%, rgba(1,8,40,0.75) 100%)',
          }}
        />
        {/* 우측 가림 — 로드맵 쪽 어둡게 (lg+ 전용) */}
        <div
          className="hidden lg:block absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(1,8,40,0) 42%, rgba(1,8,40,0.55) 100%)',
          }}
        />
      </div>

      {/* === 오버레이 콘텐츠 === */}
      <div className="relative z-10 mx-auto w-full max-w-layout px-6 md:px-10 lg:px-16 py-8 md:py-10 lg:py-12 min-h-screen">
        {/* Top: Back + Breadcrumb + Title (HUD 없음 — 로드맵 공간 확보) */}
        <header className="mb-12 md:mb-16 max-w-[640px]">
          <button
            type="button"
            onClick={onBack}
            aria-label="은하로 돌아가기"
            className="mb-5 inline-flex items-center gap-2 kr-heading text-[11px] uppercase tracking-widest text-cream/75 hover:text-neon transition"
          >
            <ArrowLeft size={14} strokeWidth={2.4} />
            은하로
          </button>

          <div className="flex items-center gap-2 kr-heading text-[10px] uppercase tracking-widest text-cream/55 mb-3">
            <span>Galaxy</span>
            <span className="text-cream/30">›</span>
            <span style={{ color: accent }}>{subject.toUpperCase()} Planet</span>
          </div>

          <span className="cursive text-neon text-[32px] md:text-[44px] leading-[0.95] drop-shadow-[0_0_20px_rgba(111,255,0,0.35)]">
            Planet
          </span>
          <h1
            className="kr-heading uppercase text-[26px] md:text-[36px] lg:text-[44px] mt-3 leading-[1.15] tracking-[0.01em] drop-shadow-[0_2px_20px_rgba(0,0,0,0.75)]"
          >
            {schema.title}
          </h1>
          <p className="kr-body text-[13px] md:text-[14px] text-cream/80 mt-4 max-w-xl leading-[1.7]">
            탐사할 행성(챕터)을 선택하세요. 각 행성에는 여러 존(토픽)이
            있습니다.
          </p>
        </header>

        {/* === 로드맵 — 중앙(모바일) / 우측(lg+) 오버레이 === */}
        <div className="flex justify-center lg:justify-end lg:pr-4 xl:pr-10">
          <ChapterPath
            planets={planets}
            subject={subject}
            accent={accent}
            progress={progress}
            onSelectChapter={onSelectChapter}
          />
        </div>

        {/* === 행성 라벨 — 좌하단에 플로팅 (lg+ 에서만) === */}
        <div className="pointer-events-none hidden lg:flex flex-col items-center absolute left-10 xl:left-20 bottom-14 xl:bottom-20">
          <div
            className="cursive leading-none text-[44px] xl:text-[52px]"
            style={{
              color: accent,
              textShadow: `0 0 24px ${accent}66`,
            }}
          >
            {subject}
          </div>
          <div className="kr-heading text-[10px] uppercase tracking-widest text-cream/65 mt-2 tabular-nums">
            {planets.length} CHAPTERS · {totalQuestions} QUESTIONS
          </div>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------
// ChapterPath — Duolingo-풍 3D 노드 로드맵
//
// 세로 축을 따라 노드가 살짝 좌우로 지그재그하며, cubic bezier 한 선으로
// 이어진다. 각 노드 아래 타이틀·메타가 중앙 정렬로 배치되어 로드맵이
// "경로 + 이름" 구조로 깔끔하게 읽힌다.
// ----------------------------------------------------------------

interface ChapterPathProps {
  planets: ReturnType<typeof getPlanets>;
  subject: Subject;
  accent: string;
  progress: ProgressStore;
  onSelectChapter: (chapter: number) => void;
}

function ChapterPath({
  planets,
  subject,
  accent,
  progress,
  onSelectChapter,
}: ChapterPathProps) {
  // 컨테이너 실제 폭을 관측 — 좁은 폰 뷰포트도 대응.
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

  // === 레이아웃 상수 ===
  const NODE = 78; // 3D 노드 지름
  const TITLE_GAP = 74; // 노드 아래 타이틀·메타 블록 공간
  const NODE_GAP = 42; // 타이틀 끝 ~ 다음 노드 사이 여백
  const GAP_Y = NODE + TITLE_GAP + NODE_GAP; // 노드 중심 간 거리 = 194
  const PAD_Y = 28;
  const OFFSET_X = Math.min(W * 0.11, 46); // 완만한 지그재그
  const CENTER = W / 2;
  const totalH = PAD_Y * 2 + NODE + (planets.length - 1) * GAP_Y;

  const nodes = planets.map((planet, idx) => {
    const leftSide = idx % 2 === 0;
    const cx = CENTER + (leftSide ? -OFFSET_X : OFFSET_X);
    const cy = PAD_Y + NODE / 2 + idx * GAP_Y;
    return { cx, cy, leftSide, planet, idx };
  });

  // 연결선: 노드 하단 → 다음 노드 상단, S-커브.
  // 타이틀 텍스트 영역(노드 하단 ~ 타이틀 끝) 을 피해서 이어지도록 경로를
  // "노드 아래 12px" 지점에서 시작해서 다음 노드 위 12px 에 도달.
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
        const disabled = n.planet.questionCount === 0;
        const agg = aggregateChapter(subject, n.planet.chapter, progress);
        const weakCount = disabled
          ? 0
          : topicWeaknessesInChapter(
              subject,
              n.planet.chapter,
              progress,
            ).filter((t) => weaknessLevel(t) === 'weak').length;
        return (
          <ChapterNode
            key={n.planet.chapter}
            cx={n.cx}
            cy={n.cy}
            chapter={n.planet.chapter}
            title={n.planet.title}
            topicCount={n.planet.topics.length}
            agg={agg}
            accent={accent}
            weakCount={weakCount}
            disabled={disabled}
            NODE={NODE}
            TITLE_GAP={TITLE_GAP}
            containerW={W}
            onClick={() => !disabled && onSelectChapter(n.planet.chapter)}
          />
        );
      })}
    </div>
  );
}

// ----------------------------------------------------------------
// ChapterNode — 3D-beveled 노드 + 진도 링 + 아래쪽 타이틀
// ----------------------------------------------------------------

interface ChapterNodeProps {
  cx: number;
  cy: number;
  chapter: number;
  title: string;
  topicCount: number;
  agg: Aggregate;
  accent: string;
  weakCount: number;
  disabled: boolean;
  NODE: number;
  TITLE_GAP: number;
  containerW: number;
  onClick: () => void;
}

function ChapterNode({
  cx,
  cy,
  chapter,
  title,
  topicCount,
  agg,
  accent,
  weakCount,
  disabled,
  NODE,
  TITLE_GAP,
  containerW,
  onClick,
}: ChapterNodeProps) {
  // 진도 링 — 노드 주변을 감싸는 얇은 원.
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
        {/* 진도 링 */}
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

        {/* 3D 노드 */}
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
          aria-label={`Chapter ${chapter} ${title}${
            disabled ? ' (준비중)' : ''
          }`}
        >
          <span
            className="kr-heading leading-none tabular-nums text-white"
            style={{
              fontSize: NODE * 0.42,
              textShadow: '0 2px 4px rgba(0,0,0,0.35)',
            }}
          >
            {chapter}
          </span>
        </button>
      </div>

      {/* 타이틀 블록 — 노드 아래 중앙 정렬 */}
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
          className="kr-body text-[11px] text-cream/70 mt-1.5 tabular-nums inline-flex items-center gap-2"
          style={{ textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}
        >
          <span>토픽 {topicCount}</span>
          <span className="text-cream/30">·</span>
          <span>{disabled ? '준비중' : `${agg.solved}/${agg.total}`}</span>
          {weakCount > 0 ? (
            <span
              className="kr-heading inline-flex items-center gap-1 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full"
              style={{
                color: '#f87171',
                background: 'rgba(248, 113, 113, 0.16)',
              }}
            >
              <Flame size={8} strokeWidth={2.6} />
              {weakCount}
            </span>
          ) : null}
        </div>
      </div>
    </>
  );
}

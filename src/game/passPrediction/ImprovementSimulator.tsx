/**
 * ImprovementSimulator — 약점 보강 시뮬레이션 카드.
 *
 * Phase 4 Step 5:
 *   - TOP 3 약점 자동 선택 + 토글 (1/2/3 개)
 *   - 각 보강 시나리오의 score delta 표시
 *   - 합격 통과 여부 시각화
 */

import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import type { PredictionResult } from './scoreCalculator';
import { simulateImprovement } from './scoreCalculator';
import type { WeakChapterRanking } from './weakChapterRanker';
import { generateSimulationMessage } from './messageGenerator';

interface Props {
  current: PredictionResult;
  weakRankings: readonly WeakChapterRanking[];
  /** 보강 학습 시작 클릭 시 — 약점 chapter_id 들 전달. */
  onStartLearning?: (chapter_ids: string[]) => void;
}

export default function ImprovementSimulator({
  current,
  weakRankings,
  onStartLearning,
}: Props) {
  // 기본 — 모든 약점 단원 선택 (TOP 3)
  const [selectedCount, setSelectedCount] = useState<number>(
    Math.min(3, weakRankings.length),
  );

  const targetIds = useMemo(
    () => weakRankings.slice(0, selectedCount).map((r) => r.chapter_id),
    [weakRankings, selectedCount],
  );

  const sim = useMemo(
    () => simulateImprovement(current, targetIds, 0.8),
    [current, targetIds],
  );

  if (current.score === null || weakRankings.length === 0) return null;

  const msg = generateSimulationMessage(
    sim.delta,
    sim.predicted.is_pass,
    current.is_pass,
  );

  return (
    <div className="liquid-glass rounded-[18px] px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} strokeWidth={2.4} style={{ color: 'var(--neon)' }} />
        <span
          className="kr-num text-[10.5px] uppercase tracking-widest"
          style={{ color: 'var(--neon)' }}
        >
          약점 보강 시뮬레이션
        </span>
      </div>

      {/* 토글 — 보강 단원 수 (1/2/3) */}
      <div className="flex gap-1.5 mb-3">
        {Array.from({ length: Math.min(3, weakRankings.length) }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setSelectedCount(n)}
            className={
              'kr-num text-[11px] tabular-nums px-3 py-1.5 rounded-full transition ' +
              (n === selectedCount
                ? 'font-bold'
                : 'text-cream/55 hover:text-cream hover:bg-white/5')
            }
            style={
              n === selectedCount
                ? {
                    background: 'var(--cta-primary)',
                    color: 'var(--cta-text)',
                  }
                : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(239,244,255,0.12)',
                  }
            }
          >
            TOP {n}
          </button>
        ))}
      </div>

      {/* 점수 변화 시각화 */}
      <div className="flex items-baseline justify-center gap-3 my-4">
        <div className="text-center">
          <div
            className="kr-num text-[10.5px] uppercase tracking-widest mb-1"
            style={{ color: 'rgba(239,244,255,0.45)' }}
          >
            현재
          </div>
          <div
            className="kr-heading text-[28px] tabular-nums leading-none"
            style={{ color: 'var(--cream)' }}
          >
            {current.score}
          </div>
        </div>

        <div
          className="kr-num text-[14px] tabular-nums"
          style={{ color: 'var(--neon)' }}
        >
          →
        </div>

        <div className="text-center">
          <div
            className="kr-num text-[10.5px] uppercase tracking-widest mb-1"
            style={{ color: 'var(--neon)' }}
          >
            보강 후
          </div>
          <div
            className="kr-heading text-[28px] tabular-nums leading-none"
            style={{
              color: sim.predicted.is_pass ? 'var(--neon)' : '#FFB020',
            }}
          >
            {sim.predicted.score ?? '—'}
          </div>
        </div>

        {sim.delta > 0 && (
          <div
            className="kr-num text-[16px] tabular-nums ml-1"
            style={{ color: 'var(--neon)' }}
          >
            +{sim.delta}
          </div>
        )}
      </div>

      {/* 메시지 */}
      <p
        className="kr-body text-[12.5px] text-cream/80 text-center leading-[1.5] mb-3"
      >
        {msg}
      </p>

      {/* 시작 버튼 */}
      {onStartLearning && targetIds.length > 0 && (
        <button
          type="button"
          onClick={() => onStartLearning(targetIds)}
          className="w-full p-2.5 rounded-xl kr-heading uppercase tracking-widest text-[11.5px] transition active:scale-[0.98]"
          style={{
            background: 'var(--cta-primary)',
            color: 'var(--cta-text)',
            boxShadow:
              '0 4px 14px -6px color-mix(in srgb, var(--cta-primary) 60%, transparent)',
          }}
        >
          약점 단원 학습 시작
        </button>
      )}
    </div>
  );
}

/**
 * PredictionScoreCard — 합격 예측 점수 큰 카드.
 *
 * Phase 4 Step 5 — ProgressDashboard 의 메인 시각 요소.
 *
 * 표시:
 *   - 큰 점수 (예: "65 / 100")
 *   - 합격선까지 ±N점
 *   - 신뢰도 배지
 *   - 단원별 출제 비중 미니바 (ADsP 20/20/60, SQLD 20/80) — C-3 흡수
 *
 * 데이터 부족 (score=null) 시 → DataInsufficientGuide 가 caller 에서 분기.
 * 본 컴포넌트는 score 값 있을 때만 렌더 가정.
 */

import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { PredictionResult } from './scoreCalculator';
import { PASS_THRESHOLD } from './scoreCalculator';
import { confidenceLabel, confidenceColor } from './confidenceLevel';

interface Props {
  result: PredictionResult;
  /** 클릭 시 caller — 보통 ImprovementSimulator 토글 또는 학습 진입. */
  onAction?: () => void;
  actionLabel?: string;
}

const SUBJECT_WEIGHT_BREAKDOWN: Record<
  'adsp' | 'sqld',
  Array<{ label: string; ratio: number }>
> = {
  adsp: [
    { label: '1과목', ratio: 0.2 },
    { label: '2과목', ratio: 0.2 },
    { label: '3과목', ratio: 0.6 },
  ],
  sqld: [
    { label: '1과목', ratio: 0.2 },
    { label: '2과목', ratio: 0.8 },
  ],
};

export default function PredictionScoreCard({
  result,
  onAction,
  actionLabel,
}: Props) {
  if (result.score === null) return null; // caller 가 DataInsufficientGuide 표시

  const score = result.score;
  const passDelta = score - PASS_THRESHOLD;
  const isPass = result.is_pass;
  const accent = isPass ? 'var(--neon)' : '#FFB020';
  const breakdown = SUBJECT_WEIGHT_BREAKDOWN[result.exam];

  return (
    <div
      className="liquid-glass rounded-[22px] px-5 py-5 md:px-6 md:py-6"
      style={{
        border: `1px solid ${
          isPass
            ? 'color-mix(in srgb, var(--neon) 35%, transparent)'
            : 'rgba(255,176,32,0.4)'
        }`,
        background: isPass
          ? 'linear-gradient(135deg, color-mix(in srgb, var(--neon) 6%, transparent), transparent)'
          : 'linear-gradient(135deg, rgba(255,176,32,0.06), transparent)',
      }}
    >
      {/* 헤더 */}
      <div
        className="kr-num text-[10.5px] uppercase tracking-widest mb-2"
        style={{ color: accent }}
      >
        예상 점수 · {result.exam.toUpperCase()}
      </div>

      {/* 큰 점수 */}
      <div className="flex items-baseline gap-2 mb-3">
        <span
          className="kr-heading text-[56px] md:text-[64px] tabular-nums leading-none"
          style={{ color: 'var(--cream)' }}
        >
          {score}
        </span>
        <span
          className="kr-num text-[14px] md:text-[16px] tabular-nums"
          style={{ color: 'rgba(239,244,255,0.45)' }}
        >
          / 100
        </span>
      </div>

      {/* 합격 상태 */}
      <div className="flex items-center gap-2 mb-4">
        {isPass ? (
          <CheckCircle2
            size={16}
            strokeWidth={2.4}
            style={{ color: accent }}
          />
        ) : (
          <AlertCircle size={16} strokeWidth={2.4} style={{ color: accent }} />
        )}
        <span className="kr-body text-[13.5px]" style={{ color: accent }}>
          {isPass
            ? `합격선 +${passDelta}점 — 합격권`
            : `합격선까지 ${-passDelta}점 더 필요`}
        </span>
      </div>

      {/* 신뢰도 배지 */}
      <div className="flex items-baseline justify-between mb-4">
        <span className="kr-body text-[12px] text-cream/55">신뢰도</span>
        <span
          className="kr-num text-[12px] tabular-nums"
          style={{ color: confidenceColor(result.confidence) }}
        >
          {confidenceLabel(result.confidence)}
        </span>
      </div>

      {/* 단원별 출제 비중 미니바 (C-3 흡수) */}
      <div>
        <div
          className="kr-num text-[10px] uppercase tracking-widest mb-1.5"
          style={{ color: 'rgba(239,244,255,0.45)' }}
        >
          출제 비중
        </div>
        <div className="space-y-1.5">
          {breakdown.map((b) => {
            const pct = Math.round(b.ratio * 100);
            return (
              <div key={b.label} className="flex items-baseline gap-2">
                <span
                  className="kr-num text-[11px] tabular-nums shrink-0"
                  style={{ color: 'rgba(239,244,255,0.7)', width: 36 }}
                >
                  {b.label}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${pct}%`,
                      background:
                        b.ratio >= 0.5
                          ? 'var(--neon)'
                          : b.ratio >= 0.3
                            ? '#67e8f9'
                            : 'rgba(239,244,255,0.4)',
                    }}
                  />
                </div>
                <span
                  className="kr-num text-[11px] tabular-nums shrink-0"
                  style={{ color: 'rgba(239,244,255,0.55)', width: 32, textAlign: 'right' }}
                >
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 액션 (선택) */}
      {onAction && actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="w-full mt-5 p-3 rounded-xl kr-heading uppercase tracking-widest text-[12px] transition active:scale-[0.98] liquid-glass hover:bg-white/10"
          style={{
            border: `1px solid ${accent}55`,
            color: accent,
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

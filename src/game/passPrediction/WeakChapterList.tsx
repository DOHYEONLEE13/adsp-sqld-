/**
 * WeakChapterList — 약점 단원 TOP 3 표시.
 *
 * Phase 4 Step 5 — ProgressDashboard 의 약점 카드.
 *
 * 표시:
 *   - 우선순위 (1~3) 컬러 배지
 *   - 단원명 + 정답률 + 응시 횟수
 *   - improvement_potential ("보강 시 +N점 예상")
 */

import { ChevronRight } from 'lucide-react';
import type { WeakChapterRanking } from './weakChapterRanker';

interface Props {
  rankings: readonly WeakChapterRanking[];
  /** 카드 클릭 시 — 보통 ImprovementSimulator 또는 학습 진입. */
  onSelect?: (chapter_id: string) => void;
}

export default function WeakChapterList({ rankings, onSelect }: Props) {
  if (rankings.length === 0) {
    return (
      <div className="liquid-glass rounded-[18px] px-5 py-4">
        <div
          className="kr-num text-[10.5px] uppercase tracking-widest mb-2"
          style={{ color: 'rgba(239,244,255,0.5)' }}
        >
          약점 단원
        </div>
        <p className="kr-body text-[13px] text-cream/55 leading-[1.55]">
          모든 단원이 골고루 잘 풀리고 있어요. 꾸준히 유지!
        </p>
      </div>
    );
  }

  return (
    <div className="liquid-glass rounded-[18px] px-5 py-4">
      <div className="flex items-baseline justify-between mb-3">
        <div
          className="kr-num text-[10.5px] uppercase tracking-widest"
          style={{ color: 'rgba(239,244,255,0.55)' }}
        >
          약점 단원 TOP {rankings.length}
        </div>
        <span
          className="kr-num text-[10.5px] tabular-nums"
          style={{ color: 'rgba(239,244,255,0.4)' }}
        >
          보강 시 점수 영향 큰 순
        </span>
      </div>

      <ol className="space-y-2 list-none p-0 m-0">
        {rankings.map((r) => (
          <li key={r.chapter_id}>
            <button
              type="button"
              onClick={() => onSelect?.(r.chapter_id)}
              disabled={!onSelect}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition disabled:cursor-default"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* 우선순위 번호 */}
              <span
                className="shrink-0 w-7 h-7 rounded-full inline-flex items-center justify-center kr-num text-[12px] tabular-nums"
                style={{
                  background:
                    r.rank === 1
                      ? 'rgba(248,113,113,0.18)'
                      : r.rank === 2
                        ? 'rgba(251,146,60,0.18)'
                        : 'rgba(251,191,36,0.18)',
                  color:
                    r.rank === 1 ? '#fca5a5' : r.rank === 2 ? '#fdba74' : '#fcd34d',
                  border:
                    r.rank === 1
                      ? '1px solid rgba(248,113,113,0.4)'
                      : r.rank === 2
                        ? '1px solid rgba(251,146,60,0.4)'
                        : '1px solid rgba(251,191,36,0.4)',
                  fontWeight: 700,
                }}
              >
                {r.rank}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <span className="kr-body text-[13.5px] text-cream/90 truncate">
                    {r.chapter_name}
                  </span>
                  <span
                    className="kr-num text-[11px] tabular-nums shrink-0"
                    style={{ color: 'var(--neon)' }}
                  >
                    +{r.improvement_potential.toFixed(1)}점
                  </span>
                </div>
                <div
                  className="flex items-baseline justify-between gap-2"
                  style={{ color: 'rgba(239,244,255,0.5)' }}
                >
                  <span className="kr-body text-[11.5px]">
                    정답률 {Math.round(r.accuracy * 100)}% · {r.attempt_count}문항
                  </span>
                  <span
                    className="kr-num text-[10.5px] tabular-nums"
                    style={{ color: 'rgba(239,244,255,0.35)' }}
                  >
                    가중치 {Math.round(r.weight * 100)}%
                  </span>
                </div>
              </div>

              {onSelect && (
                <ChevronRight
                  size={14}
                  strokeWidth={2.4}
                  style={{ color: 'rgba(239,244,255,0.3)', flexShrink: 0 }}
                />
              )}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

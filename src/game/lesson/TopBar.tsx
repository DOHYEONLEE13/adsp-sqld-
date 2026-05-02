/**
 * TopBar — X(나가기) + 진행바 + 북마크 토글.
 *
 * 두 가지 진행률을 한꺼번에 노출:
 *   1) progress:     챕터 전체 진행률 (모든 step 포함, 두꺼운 메인 바)
 *   2) stepProgress: 현재 진행 중인 개념(step) 안의 진척 (얇은 보조 바)
 *
 * stepId 가 있으면 우측에 ★ 북마크 토글 — 개념을 즐겨찾기하면 PlanetScreen /
 * StatsPage 의 "북마크한 개념" 섹션에서 다시 열람 가능.
 */

import { X } from 'lucide-react';
import ConceptBookmarkButton from '../components/ConceptBookmarkButton';

interface Props {
  /** 챕터 전체 진행률 0~1. */
  progress: number;
  /** 현재 step 안의 micro 진행률 0~1. 미지정 시 step 바 숨김. */
  stepProgress?: number;
  /** 현재 step 의 id — 북마크 토글용. 없으면 버튼 숨김. */
  stepId?: string;
  /** 과목 색상 (북마크 활성 색). */
  accent?: string;
  onExit: () => void;
}

export default function TopBar({
  progress,
  stepProgress,
  stepId,
  accent,
  onExit,
}: Props) {
  const chapter = Math.max(0, Math.min(1, progress));
  const step =
    stepProgress === undefined ? null : Math.max(0, Math.min(1, stepProgress));
  const chapterPct = Math.round(chapter * 100);
  const stepPct = step === null ? null : Math.round(step * 100);

  return (
    <div className="sticky top-0 z-30 bg-base/85 backdrop-blur-md">
      <div className="mx-auto max-w-[820px] flex items-center gap-3 md:gap-4 px-5 py-3 md:px-8 md:py-4">
        <button
          type="button"
          onClick={onExit}
          aria-label="레슨 나가기"
          className="shrink-0 w-9 h-9 rounded-full inline-flex items-center justify-center text-cream/70 hover:text-cream hover:bg-white/10 transition"
        >
          <X size={20} strokeWidth={2.4} />
        </button>

        {/* 두 줄 progress — 메인 chapter + 보조 step */}
        <div className="flex-1 flex flex-col gap-1.5">
          {/* Chapter 진행률 — 메인 바 */}
          <div className="flex items-center gap-2">
            <div
              className="flex-1 h-3 md:h-3.5 rounded-full bg-white/10 relative overflow-hidden"
              role="progressbar"
              aria-valuenow={chapterPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`챕터 진행률 ${chapterPct}%`}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
                style={{
                  width: `${chapter * 100}%`,
                  background:
                    'linear-gradient(90deg, var(--subject-accent), #6FFF00)',
                  boxShadow: '0 0 18px -2px var(--subject-accent)',
                }}
              />
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 50%)',
                }}
              />
            </div>
            <span
              className="kr-num shrink-0 tabular-nums text-[12px] md:text-[13px] font-bold w-[42px] text-right"
              style={{
                color:
                  chapterPct >= 100
                    ? '#9CFF3D'
                    : 'var(--subject-accent, #67e8f9)',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              }}
              aria-hidden
            >
              {chapterPct}%
            </span>
          </div>

          {/* Step 진행률 — 얇은 보조 바 (현재 개념 안의 진척) */}
          {step !== null && (
            <div className="flex items-center gap-2">
              <div
                className="flex-1 h-1 rounded-full bg-white/6 relative overflow-hidden"
                role="progressbar"
                aria-valuenow={stepPct ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`현재 개념 진행률 ${stepPct}%`}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ease-out"
                  style={{
                    width: `${step * 100}%`,
                    background:
                      'linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,0.7))',
                  }}
                />
              </div>
              <span
                className="kr-num shrink-0 tabular-nums text-[10px] md:text-[10.5px] font-medium w-[42px] text-right"
                style={{
                  color: 'rgba(239,244,255,0.55)',
                }}
                aria-hidden
              >
                {stepPct}%
              </span>
            </div>
          )}
        </div>

        {/* 북마크 토글 — 우측 끝. stepId 없으면 자리만 차지하지 않게 숨김. */}
        {stepId ? (
          <ConceptBookmarkButton stepId={stepId} accent={accent} size="md" />
        ) : null}
      </div>
    </div>
  );
}

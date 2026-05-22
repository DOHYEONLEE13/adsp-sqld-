/**
 * ProgressIndicator — 게임 화면 상단/사이드 진도 카드.
 *
 * 표시 내용 (지시서 명세):
 *   - 이번 주 목표 (chapter_id × planned_minutes)
 *   - 진행 시간 / 계획 시간 (%)
 *   - 본 주차의 chapter 들 (남은 시간 강조)
 *   - 전체 delay_ratio 가 30% 이상이면 "뒤처짐" 배지
 *
 * variant:
 *   - 'compact' (모바일/사이드): 1줄 진행률 + 본 주차 chapter 1개
 *   - 'expanded' (기본): 본 주차 chapter 전체 + 진행 막대
 */

import type { StudyPlan } from '@/types/learning/studyPlan';
import type { SessionRecord } from '@/game/storage';
import { trackProgress, getCurrentWeekProgress } from './progressTracker';
import { formatMinutes } from './timeAllocation';

interface Props {
  plan: StudyPlan;
  sessions: readonly SessionRecord[];
  variant?: 'compact' | 'expanded';
  /** [학습 플랜 보기] 클릭 시 (선택). */
  onViewPlan?: () => void;
}

export default function ProgressIndicator({
  plan,
  sessions,
  variant = 'expanded',
  onViewPlan,
}: Props) {
  const snap = trackProgress(plan, sessions);
  const week = getCurrentWeekProgress(plan, sessions);

  const overallPct = Math.round(snap.actual_progress * 100);
  const expectedPct = Math.round(snap.expected_progress * 100);

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={onViewPlan}
        className="liquid-glass rounded-2xl px-4 py-2.5 w-full text-left transition hover:bg-white/5"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="kr-num text-[10.5px] uppercase tracking-widest text-cream/55">
            WEEK {snap.current_week} · 진행
          </span>
          <span className="kr-num text-[13px] tabular-nums text-cream">
            {overallPct}%
          </span>
        </div>
        <div className="mt-1.5 h-1 rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full transition-all"
            style={{
              width: `${overallPct}%`,
              background: snap.is_behind ? '#FFB020' : 'var(--neon)',
            }}
          />
        </div>
      </button>
    );
  }

  return (
    <div className="liquid-glass rounded-2xl px-5 py-4 space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="kr-num text-[10.5px] uppercase tracking-widest text-cream/55 mb-0.5">
            WEEK {snap.current_week} / {plan.weeks.length}
          </div>
          <div className="kr-heading text-[16px] md:text-[17px] text-cream">
            이번 주 목표
          </div>
        </div>
        {snap.is_behind && (
          <span
            className="kr-num inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest"
            style={{
              background: 'rgba(255,176,32,0.18)',
              color: '#FFB020',
              border: '1px solid rgba(255,176,32,0.45)',
            }}
          >
            뒤처짐
          </span>
        )}
      </div>

      {/* 본 주차 chapter 목록 */}
      <div className="space-y-2">
        {week.chapters.length === 0 ? (
          <div className="kr-body text-sm text-cream/55">
            이번 주 학습 일정이 없어. 자유 학습 또는 복습.
          </div>
        ) : (
          week.chapters.map((c) => {
            const pct = Math.round(c.completion_rate * 100);
            return (
              <div key={c.chapter_id}>
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <span className="kr-body text-[13.5px] text-cream/90 truncate">
                    {c.display_name}
                  </span>
                  <span className="kr-num text-[11.5px] tabular-nums text-cream/55 shrink-0">
                    {formatMinutes(c.actual_minutes)} / {formatMinutes(c.planned_minutes)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background:
                        pct >= 100
                          ? 'var(--neon)'
                          : pct >= 50
                            ? 'var(--neon)'
                            : '#67e8f9',
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 전체 진행률 */}
      <div className="pt-2 border-t border-white/5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="kr-body text-[12.5px] text-cream/55">전체 진행</span>
          <span className="kr-num text-[12.5px] tabular-nums text-cream">
            {overallPct}% <span className="text-cream/40">/ 기대 {expectedPct}%</span>
          </span>
        </div>
      </div>

      {onViewPlan && (
        <button
          type="button"
          onClick={onViewPlan}
          className="w-full text-center kr-body text-[12px] text-cream/55 hover:text-cream pt-1"
        >
          학습 플랜 보기 →
        </button>
      )}
    </div>
  );
}

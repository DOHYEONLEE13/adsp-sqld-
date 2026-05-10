/**
 * StudyPlanScreen — Phase 4 Step 3 학습 플랜 확인 화면.
 *
 * 진입 시점:
 *   - Onboarding 완료 직후 자동 진입 (App.tsx 라우팅).
 *   - 사용자가 #/study-plan 으로 직접 진입 (재확인).
 *
 * 구조:
 *   1. 마스코트 + 인사말 ("플랜이 완성됐어!")
 *   2. 전체 요약 카드 (D-day · 총 학습 시간 · feasibility 메시지)
 *   3. 주차별 상세 (WeeklyPlanView 위임 — 접기/펼치기)
 *   4. CTA: [학습 시작하기] → game 화면 / [플랜 다시 생성]
 */

import { useEffect, useMemo, useState } from 'react';
import Ques from '@/components/mascot/Ques';
import { characterForSubject, type MascotCharacter } from '@/components/mascot/types';
import SpeechBubble from '@/game/lesson/SpeechBubble';
import PageAmbientBg from '@/game/components/PageAmbientBg';
import type { StudyPlan } from '@/types/learning/studyPlan';
import { REVIEW_BUFFER_DAYS } from '@/types/learning/studyPlan';
import { formatMinutes } from './timeAllocation';
import { daysUntil } from '@/game/examDate';
import WeeklyPlanView from './WeeklyPlanView';

interface Props {
  plan: StudyPlan;
  /** [학습 시작하기] 클릭 시. */
  onStart: () => void;
  /** [플랜 다시 생성] 클릭 시 (선택). */
  onRegenerate?: () => void;
  /**
   * 일일 학습 시간 변경 시 — caller 가 새 plan 을 생성/저장하고 다시 렌더해주세요.
   * 미지정 시 슬라이더는 read-only 로 표시.
   */
  onChangeDailyMinutes?: (minutes: number) => void;
}

export function StudyPlanScreen({
  plan,
  onStart,
  onRegenerate,
  onChangeDailyMinutes,
}: Props) {
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const bubblePlacement: 'top' | 'right' = isMobile ? 'top' : 'right';

  const character: MascotCharacter = characterForSubject(plan.exam);

  // D-day 계산 (yyyy-mm-dd 포맷으로)
  const dDayYmd = formatYmd(plan.d_day);
  const days = daysUntil(dDayYmd) ?? 0;

  // 가용 계산 — 인사말 + feasibility 카드 둘 다 사용
  const usableDays = Math.max(0, days - REVIEW_BUFFER_DAYS);
  const totalRequiredMin = plan.required_total_hours * 60;
  // 권장 시간을 가용 일수로 나눈 "이상적 일일 시간". usableDays 0 이면 비율 0.
  const idealDailyMin =
    usableDays > 0 ? Math.round(totalRequiredMin / usableDays) : 0;

  // 인사말 — mode 별 분기. priority 일 때 "충분해" 같은 거짓 안심 금지.
  const greeting = useMemo(() => {
    const totalHours = plan.required_total_hours;
    const ddayLabel = days > 0 ? `D-${days}` : 'D-day';
    const userDaily = formatMinutes(plan.daily_minutes);
    switch (plan.mode) {
      case 'priority':
        return `${totalHours}시간 권장인데 시험까지 ${ddayLabel}이라 시간이 빠듯해. 매일 ${userDaily}으로는 핵심 단원만 골라야 해 — 같이 가자!`;
      case 'balanced':
        return `${totalHours}시간 학습 플랜이 완성됐어! 시험까지 ${ddayLabel}, 매일 ${userDaily}이면 딱 맞아.`;
      case 'deep':
        return `${totalHours}시간 학습 플랜이 완성됐어! 시험까지 ${ddayLabel} — 시간 여유가 있으니 개념을 깊게 파볼까?`;
    }
  }, [plan, days]);

  // feasibility 메시지 — usableDays / idealDailyMin 기반 자연어로 재구성.
  const feasibilityMsg = feasibilityMessage(plan, {
    days,
    usableDays,
    idealDailyMin,
  });

  return (
    <section className="relative min-h-screen text-cream flex flex-col isolate bg-[var(--base)]">
      <PageAmbientBg blur />
      <main className="flex-1 mx-auto w-full max-w-[820px] lg:max-w-[1000px] xl:max-w-[1180px] px-5 md:px-8 lg:px-12 xl:px-16 pt-8 lg:pt-12 pb-20">
        {/* 마스코트 + 인사말 */}
        <div
          className={
            'flex gap-4 md:gap-6 ' +
            (bubblePlacement === 'top' ? 'flex-col items-center' : 'items-start')
          }
        >
          <div className="shrink-0">
            <Ques
              pose="celebrate"
              character={character}
              size={isMobile ? 140 : 180}
            />
          </div>
          <div className="flex-1 w-full pt-2">
            <SpeechBubble text={greeting} placement={bubblePlacement} />
          </div>
        </div>

        {/* 요약 카드 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 max-w-[800px] mx-auto">
          <SummaryCard
            label="총 학습 시간"
            value={formatMinutes(plan.required_total_hours * 60)}
          />
          {onChangeDailyMinutes ? (
            <DailyMinutesPicker
              current={plan.daily_minutes}
              onChange={onChangeDailyMinutes}
            />
          ) : (
            <SummaryCard
              label="일일 권장"
              value={formatMinutes(plan.daily_minutes)}
            />
          )}
          <SummaryCard
            label="시험까지"
            value={days > 0 ? `${days}일` : '오늘'}
          />
        </div>

        {/* feasibility 안내 */}
        <div className="mt-6 max-w-[800px] mx-auto">
          <div
            className="liquid-glass rounded-2xl px-5 py-4 kr-body text-[14px] md:text-[15px] text-cream/90 leading-[1.65]"
            style={{
              border: `1px solid ${feasibilityMsg.borderColor}`,
              background: feasibilityMsg.bg,
            }}
          >
            <span
              className="kr-num inline-block text-[10.5px] uppercase tracking-widest mb-1"
              style={{ color: feasibilityMsg.accent }}
            >
              {feasibilityMsg.tag}
            </span>
            <p className="kr-body">{feasibilityMsg.body}</p>
          </div>
        </div>

        {/* 주차별 상세 */}
        <div className="mt-8 max-w-[800px] mx-auto">
          <h2 className="kr-heading text-[18px] md:text-[20px] mb-3 text-cream">주차별 학습</h2>
          <WeeklyPlanView weeks={plan.weeks} exam={plan.exam} />
        </div>

        {/* CTA */}
        <div className="mt-10 max-w-[560px] mx-auto w-full space-y-3">
          <button
            type="button"
            onClick={onStart}
            className="w-full p-4 rounded-xl liquid-glass kr-heading uppercase tracking-widest text-[14px] transition hover:bg-white/10 active:scale-[0.98]"
            style={{
              color: 'var(--neon)',
              border: '1px solid color-mix(in srgb, var(--neon) 45%, transparent)',
              boxShadow:
                '0 6px 24px -10px color-mix(in srgb, var(--neon) 60%, transparent), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            학습 시작하기
          </button>
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="w-full text-center kr-body text-sm text-white/55 hover:text-white py-2"
            >
              플랜 다시 생성
            </button>
          )}
        </div>
      </main>
    </section>
  );
}

// ─── 헬퍼 ─────────────────────────────────────────────────────

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="liquid-glass rounded-2xl px-4 py-3.5 text-center md:text-left">
      <div
        className="kr-num text-[10.5px] uppercase tracking-widest mb-1"
        style={{ color: 'rgba(239,244,255,0.55)' }}
      >
        {label}
      </div>
      <div className="kr-heading text-[20px] md:text-[22px] text-cream tabular-nums">
        {value}
      </div>
    </div>
  );
}

/**
 * 일일 학습 시간 변경 칩 — 클릭 시 즉시 새 plan 생성 + mode 재계산.
 * 옵션: 30 / 60 / 90 / 120 / 180 분.
 */
const DAILY_MINUTE_OPTIONS = [30, 60, 90, 120, 180] as const;

function DailyMinutesPicker({
  current,
  onChange,
}: {
  current: number;
  onChange: (minutes: number) => void;
}) {
  return (
    <div className="liquid-glass rounded-2xl px-4 py-3.5">
      <div
        className="kr-num text-[10.5px] uppercase tracking-widest mb-2"
        style={{ color: 'rgba(239,244,255,0.55)' }}
      >
        일일 학습 시간 · 조정 가능
      </div>
      <div className="flex flex-wrap gap-1.5">
        {DAILY_MINUTE_OPTIONS.map((m) => {
          const active = m === current;
          return (
            <button
              key={m}
              type="button"
              onClick={() => {
                if (!active) onChange(m);
              }}
              className={
                'kr-num text-[12px] px-3 py-1.5 rounded-full transition tabular-nums ' +
                (active
                  ? 'font-bold'
                  : 'text-cream/60 hover:text-cream hover:bg-white/5')
              }
              style={
                active
                  ? {
                      background: 'var(--cta-primary)',
                      color: 'var(--cta-text)',
                      boxShadow: '0 4px 12px -4px color-mix(in srgb, var(--cta-primary) 60%, transparent)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(239,244,255,0.12)',
                    }
              }
            >
              {formatMinutes(m)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface FeasibilityMessage {
  tag: string;
  body: string;
  accent: string;
  borderColor: string;
  bg: string;
}

interface FeasibilityContext {
  /** 시험까지 남은 일수 (D-day). 0 이면 오늘 또는 과거. */
  days: number;
  /** review_buffer 차감 후 학습 가능 일수. */
  usableDays: number;
  /** 권장 시간을 usableDays 에 맞추려면 매일 필요한 분. usableDays 0 이면 0. */
  idealDailyMin: number;
}

function feasibilityMessage(
  plan: StudyPlan,
  ctx: FeasibilityContext,
): FeasibilityMessage {
  const userDaily = formatMinutes(plan.daily_minutes);
  const idealDaily =
    ctx.idealDailyMin > 0 ? formatMinutes(ctx.idealDailyMin) : null;
  const bufferNote =
    ctx.days > 0
      ? `시험 직전 ${REVIEW_BUFFER_DAYS}일은 자유 복습용으로 비워뒀어. 학습 가능 ${ctx.usableDays}일.`
      : '';

  switch (plan.mode) {
    case 'priority':
      return {
        tag: '시간 부족 · priority',
        body: idealDaily
          ? `이상적으로는 매일 ${idealDaily} 필요한데 입력은 매일 ${userDaily}. 핵심 단원에 집중 권장. ${bufferNote}`
          : `학습 가능 일수가 부족해. 핵심 단원만 빠르게 진행하자. ${bufferNote}`,
        accent: '#FFB020',
        borderColor: 'rgba(255,176,32,0.45)',
        bg: 'linear-gradient(135deg, rgba(255,176,32,0.08), rgba(255,176,32,0.02))',
      };
    case 'balanced':
      return {
        tag: '딱 맞는 일정 · balanced',
        body: idealDaily
          ? `이상적 페이스: 매일 ${idealDaily}. 입력하신 매일 ${userDaily} — 딱 맞아. 꾸준히 진행하면 충분해. ${bufferNote}`
          : `딱 맞는 일정. 꾸준히 진행하면 충분해. ${bufferNote}`,
        accent: '#67e8f9',
        borderColor: 'rgba(103,232,249,0.45)',
        bg: 'linear-gradient(135deg, rgba(103,232,249,0.08), rgba(103,232,249,0.02))',
      };
    case 'deep':
      return {
        tag: '여유 · deep',
        body: idealDaily
          ? `이상적 페이스: 매일 ${idealDaily}. 입력하신 매일 ${userDaily}로 여유가 있어 — 개념을 깊게 파거나 변형 문제까지 풀어볼 수 있어. ${bufferNote}`
          : `시간이 여유있어. 개념을 깊게 파고 변형 문제까지 풀어보자. ${bufferNote}`,
        accent: '#6FFF00',
        borderColor: 'rgba(111,255,0,0.45)',
        bg: 'linear-gradient(135deg, rgba(111,255,0,0.08), rgba(111,255,0,0.02))',
      };
  }
}

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export default StudyPlanScreen;

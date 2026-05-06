/**
 * OnboardingPromptBanner — onboarding 안 한 게스트 유도 카드.
 *
 * Phase 4 Step 3 작업 A:
 *   - StudyPlan 없음 + onboarding 안 함 (skip 또는 미진입) → 본 카드 노출
 *   - StudyPlan 있으면 자체적으로 null 반환 (StudyPlanBanner 가 그 자리 차지)
 *
 * 클릭 → #/onboarding 진입.
 */

import { useEffect, useState } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { loadStudyPlan } from './studyPlanStorage';

export default function OnboardingPromptBanner() {
  const [hasPlan, setHasPlan] = useState<boolean>(() => !!loadStudyPlan());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = () => setHasPlan(!!loadStudyPlan());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (hasPlan) return null;

  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.location.hash = '/onboarding';
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full liquid-glass rounded-2xl px-4 py-3 text-left transition hover:bg-white/5 active:scale-[0.99] flex items-center gap-3"
      style={{
        border: '1px solid color-mix(in srgb, var(--neon) 30%, transparent)',
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--neon) 6%, transparent), transparent)',
      }}
    >
      <Sparkles
        size={18}
        strokeWidth={2.2}
        aria-hidden
        style={{ color: 'var(--neon)' }}
      />
      <div className="flex-1 min-w-0">
        <div
          className="kr-num text-[10.5px] uppercase tracking-widest mb-0.5"
          style={{ color: 'var(--neon)' }}
        >
          맞춤 학습 플랜 받기
        </div>
        <div className="kr-body text-[13px] text-cream/85 leading-tight">
          몇 가지 답하면 시험일 기반 학습 일정이 자동 생성돼요
        </div>
      </div>
      <ChevronRight
        size={18}
        strokeWidth={2.4}
        aria-hidden
        style={{ color: 'rgba(239,244,255,0.45)' }}
      />
    </button>
  );
}

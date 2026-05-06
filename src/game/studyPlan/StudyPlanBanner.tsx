/**
 * StudyPlanBanner — GalaxyScreen 등 외부 화면에서 가볍게 import 해 쓰는 진도 카드.
 *
 * 동작:
 *   - localStorage 의 plan load → 없으면 null 반환 (마운트해도 표시 X)
 *   - sessions 는 useProgress 의 questionStats/sessions 활용
 *   - compact variant — 1줄 진행률 + WEEK 표시 + 클릭 시 #/study-plan
 *
 * GalaxyScreen 의 TOP BAR 직후 inject 용 — 영향 최소.
 */

import { useEffect, useState } from 'react';
import ProgressIndicator from './ProgressIndicator';
import { loadStudyPlan } from './studyPlanStorage';
import { useProgress } from '../useProgress';
import type { StudyPlan } from '@/types/learning/studyPlan';

interface Props {
  variant?: 'compact' | 'expanded';
}

export default function StudyPlanBanner({ variant = 'compact' }: Props) {
  const progress = useProgress();
  const [plan, setPlan] = useState<StudyPlan | null>(() => loadStudyPlan());

  // localStorage 변화 감지 (storage 이벤트 — 다른 탭/창에서 plan 변경 시)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = () => setPlan(loadStudyPlan());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!plan) return null;

  const handleViewPlan = () => {
    if (typeof window !== 'undefined') {
      window.location.hash = '/study-plan';
    }
  };

  return (
    <ProgressIndicator
      plan={plan}
      sessions={progress.sessions}
      variant={variant}
      onViewPlan={handleViewPlan}
    />
  );
}

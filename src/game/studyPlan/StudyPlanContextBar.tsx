/**
 * StudyPlanContextBar — Lesson 화면 상단의 "이번 주 목표" 컨텍스트 띠.
 *
 * Phase 4 Step 3 작업 B:
 *   GalaxyScreen 의 [본 주차 목표 시작] CTA 가 lesson 으로 곧장 점프하므로
 *   사용자가 "왜 이 lesson 으로 왔지?" 컨텍스트를 잃지 않게 화면 상단에
 *   1줄 띠로 명시.
 *
 * 표시 조건:
 *   - 활성 plan 이 있고
 *   - plan.exam === 본 lesson 의 subject
 *   - 본 (subject, chapter, topic) 이 plan 의 어느 chapter_id 영역에 속함
 * → 모두 만족 시에만 표시. 자유 진입 (PlanetScreen → ZoneScreen → Lesson) 사용자에게는 숨김.
 *
 * 사용처:
 *   DialogueLesson.tsx — TopBar 직후, 마스코트 영역 직전.
 */

import { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import type { Subject } from '@/types/question';
import { loadStudyPlan } from './studyPlanStorage';
import { getAreas, type AreaConfig } from './areaConfig';
import type { StudyPlan } from '@/types/learning/studyPlan';

interface Props {
  subject: Subject;
  chapter: number;
  topic: string;
}

export default function StudyPlanContextBar({ subject, chapter, topic }: Props) {
  const [plan, setPlan] = useState<StudyPlan | null>(() => loadStudyPlan());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = () => setPlan(loadStudyPlan());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!plan) return null;
  if (plan.exam !== subject) return null;
  if (subject !== 'adsp' && subject !== 'sqld') return null;

  // 본 (subject, chapter, topic) 이 어느 영역에 속하는지
  const area = findArea(getAreas(subject), chapter, topic);
  if (!area) return null;

  // 본 영역이 plan 의 어느 주차에 등장하는지 (가장 빠른 주차)
  const week = plan.weeks.find((w) =>
    w.chapters.some((c) => c.chapter_id === area.chapter_id),
  );
  if (!week) return null;

  return (
    <div
      className="sticky top-[58px] z-20 backdrop-blur-md"
      style={{
        background: 'rgba(1,8,40,0.7)',
        borderBottom: '1px solid rgba(239,244,255,0.06)',
      }}
    >
      <div className="mx-auto max-w-[820px] flex items-center gap-2.5 px-5 py-2 md:px-8">
        <Target
          size={13}
          strokeWidth={2.4}
          aria-hidden
          style={{ color: 'var(--neon)', flexShrink: 0 }}
        />
        <span
          className="kr-num text-[10px] uppercase tracking-[0.18em] shrink-0"
          style={{ color: 'var(--neon)' }}
        >
          WEEK {week.week_number} · 이번 주 목표
        </span>
        <span
          className="kr-body text-[12px] truncate"
          style={{ color: 'rgba(239,244,255,0.7)' }}
        >
          {area.display_name}
        </span>
      </div>
    </div>
  );
}

function findArea(
  areas: AreaConfig[],
  chapter: number,
  topic: string,
): AreaConfig | undefined {
  for (const a of areas) {
    for (const t of a.topics) {
      if (t.chapter !== chapter) continue;
      if (t.topic === null) return a; // chapter 전체
      if (t.topic === topic) return a;
    }
  }
  return undefined;
}

/**
 * WeeklyPlanView — 주차별 학습 일정 (접기/펼치기).
 *
 * 첫 주는 기본 펼침, 나머지는 접힘. 사용자가 토글 가능.
 *
 * 표시 단위:
 *   - chapter_id 단위 (Phase 0 결정)
 *   - display_name 우선, 매핑 미존재 시 chapter_id 그대로
 *   - 시간은 "N시간 M분" 표기
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { StudyPlanWeek } from '@/types/learning/studyPlan';
import type { LearningExamSubject } from '@/types/learning';
import { getAreas } from './areaConfig';
import { formatMinutes } from './timeAllocation';

type ExamSubject = LearningExamSubject;

interface Props {
  weeks: StudyPlanWeek[];
  exam: ExamSubject;
}

export default function WeeklyPlanView({ weeks, exam }: Props) {
  const [openSet, setOpenSet] = useState<Set<number>>(new Set([1]));
  const areas = getAreas(exam);

  const toggle = (n: number) => {
    setOpenSet((s) => {
      const next = new Set(s);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  if (weeks.length === 0) {
    return (
      <div className="liquid-glass rounded-2xl p-5 text-center kr-body text-sm text-cream/60">
        시험일이 임박해 주차 일정을 만들 수 없어. 핵심 단원 위주로 빠르게 풀어보자.
      </div>
    );
  }

  return (
    <ol className="space-y-2 list-none p-0 m-0">
      {weeks.map((w) => {
        const open = openSet.has(w.week_number);
        const totalPlanned = w.chapters.reduce(
          (s, c) => s + c.planned_minutes,
          0,
        );
        return (
          <li
            key={w.week_number}
            className="liquid-glass rounded-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggle(w.week_number)}
              className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-white/5 transition"
              aria-expanded={open}
            >
              <div className="flex-1 min-w-0">
                <div
                  className="kr-num text-[10.5px] uppercase tracking-widest mb-1"
                  style={{ color: 'rgba(239,244,255,0.55)' }}
                >
                  WEEK {w.week_number} · {formatRange(w.start_date, w.end_date)}
                </div>
                <div className="kr-heading text-[15px] md:text-[16px] text-cream truncate">
                  {summarizeWeek(w, areas)}
                </div>
              </div>
              <span
                className="kr-num text-[12px] tabular-nums"
                style={{ color: 'rgba(239,244,255,0.65)' }}
              >
                {formatMinutes(totalPlanned)}
              </span>
              <ChevronDown
                size={18}
                strokeWidth={2.4}
                className="shrink-0 transition-transform"
                style={{
                  color: 'rgba(239,244,255,0.45)',
                  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>
            {open && (
              <div className="border-t border-white/5 px-5 py-3 space-y-2">
                {w.chapters.map((c) => {
                  const a = areas.find((x) => x.chapter_id === c.chapter_id);
                  return (
                    <div
                      key={c.chapter_id}
                      className="flex items-baseline gap-3"
                    >
                      <span className="kr-body text-[13.5px] text-cream/85 flex-1 truncate">
                        {a?.display_name ?? c.chapter_id}
                      </span>
                      <span
                        className="kr-num text-[12px] tabular-nums shrink-0"
                        style={{ color: 'rgba(239,244,255,0.6)' }}
                      >
                        {formatMinutes(c.planned_minutes)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function formatRange(start: Date, end: Date): string {
  const f = (d: Date) =>
    `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  return `${f(start)} ~ ${f(end)}`;
}

function summarizeWeek(
  w: StudyPlanWeek,
  areas: ReturnType<typeof getAreas>,
): string {
  if (w.chapters.length === 0) return '학습 일정 없음';
  if (w.chapters.length === 1) {
    const a = areas.find((x) => x.chapter_id === w.chapters[0].chapter_id);
    return a?.display_name ?? w.chapters[0].chapter_id;
  }
  // 가장 큰 비중 chapter 의 이름 + N개 단원
  const sorted = [...w.chapters].sort(
    (a, b) => b.planned_minutes - a.planned_minutes,
  );
  const top = areas.find((x) => x.chapter_id === sorted[0].chapter_id);
  return `${top?.display_name ?? sorted[0].chapter_id} 외 ${w.chapters.length - 1}개 단원`;
}

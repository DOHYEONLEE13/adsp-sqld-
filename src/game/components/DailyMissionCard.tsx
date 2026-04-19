/**
 * Daily Mission 카드 — Galaxy 화면 상단 배너.
 * 약점 7 + 복습 3 = 10 문항 프리셋. 하루 1회 완료 체크.
 */

import { CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import type { Subject } from '@/types/question';
import { playableCount } from '../session';
import { useProgress } from '../useProgress';

interface Props {
  /** 기본 대상 과목 — 현재 데이터 양을 보고 호출부에서 결정. */
  subject: Subject;
  subjectLabel: string;
  onStart: (subject: Subject) => void;
}

/** 오늘 자정 ts 이후인지. */
function isToday(ts: number | undefined, now: number = Date.now()): boolean {
  if (!ts) return false;
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return ts >= d.getTime();
}

export default function DailyMissionCard({
  subject,
  subjectLabel,
  onStart,
}: Props) {
  const progress = useProgress();
  const total = playableCount(subject);
  if (total === 0) return null;

  const completedToday = isToday(progress.lastDailyMissionAt);

  return (
    <button
      type="button"
      onClick={() => onStart(subject)}
      className="liquid-glass rounded-[24px] p-5 md:p-6 w-full text-left transition hover:bg-white/10"
      style={{
        background:
          'linear-gradient(135deg, rgba(124,58,237,0.10), rgba(111,255,0,0.08))',
      }}
    >
      <div className="flex items-center gap-4">
        <span
          className="w-12 h-12 rounded-full inline-flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(111, 255, 0, 0.14)',
            color: '#6FFF00',
            boxShadow: '0 0 32px -6px rgba(111, 255, 0, 0.45) inset',
          }}
        >
          <Sparkles size={20} strokeWidth={2.4} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="kr-heading text-[16px] md:text-[18px] uppercase leading-tight">
              오늘의 미션
            </h3>
            {completedToday ? (
              <span
                className="kr-heading inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full"
                style={{
                  color: '#6FFF00',
                  background: 'rgba(111,255,0,0.12)',
                }}
              >
                <CheckCircle2 size={12} strokeWidth={2.6} />
                오늘 완료
              </span>
            ) : null}
          </div>
          <p className="kr-body text-[12px] md:text-[13px] leading-[1.6] text-cream/70 mt-1">
            {subjectLabel} · 약점 7 + 복습 3 = 10 문항
          </p>
        </div>
        <span
          className="w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0"
          style={{
            background:
              'linear-gradient(135deg, var(--purple-1), var(--purple-2))',
            boxShadow: '0 10px 20px -5px rgba(124, 58, 237, 0.55)',
          }}
        >
          <ChevronRight width={18} height={18} strokeWidth={2.5} color="#fff" />
        </span>
      </div>
    </button>
  );
}

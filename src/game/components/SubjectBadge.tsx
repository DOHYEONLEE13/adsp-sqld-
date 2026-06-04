/**
 * SubjectBadge — 좌측 상단 마스코트 옆 작은 과목 칩.
 *
 * 사용자 흐름 폴리시:
 *   클릭 시 SubjectSwitcher 모달 노출 → 과목 변경 가능.
 *
 * 표시 조건:
 *   - activeSubject 또는 onboarding.exams[0] 가 결정된 경우만 노출
 *   - 게스트 / onboarding 미완료 → null (UI 잡음 방지)
 */

import type { Subject } from '@/types/question';

const SUBJECT_VISUAL: Record<
  'adsp' | 'sqld',
  { label: string; color: string }
> = {
  adsp: {
    label: 'ADsP',
    color: '#67e8f9',
  },
  sqld: {
    label: 'SQLD',
    color: '#c084fc',
  },
};

interface Props {
  subject: Subject;
  onClick?: () => void;
  size?: 'xs' | 'sm';
}

export default function SubjectBadge({ subject, onClick, size = 'sm' }: Props) {
  if (subject !== 'adsp' && subject !== 'sqld') return null;
  const v = SUBJECT_VISUAL[subject];
  const padding = size === 'xs' ? 'px-1.5 py-0.5' : 'px-2 py-0.5';
  const fontSize = size === 'xs' ? 'text-[9px]' : 'text-[10px]';

  const inner = (
    <span
      className={`kr-num ${fontSize} tabular-nums uppercase tracking-[0.12em] ${padding} rounded-full inline-flex items-center`}
      style={{
        color: v.color,
        background: 'var(--game-pill-bg)',
        border: '1px solid var(--game-pill-border)',
        fontWeight: 700,
      }}
    >
      {v.label}
    </span>
  );

  if (!onClick) return inner;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${v.label} 과목 변경`}
      className="inline-flex items-center transition hover:brightness-125 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
      style={{ borderRadius: 999 }}
    >
      {inner}
    </button>
  );
}

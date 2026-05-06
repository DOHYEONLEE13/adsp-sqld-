/**
 * SubjectSwitchToast — 과목 전환 직후 화면 상단 floating 인사.
 *
 * "이번엔 SQLD 를 공부하려고 하시는군요!" — 디자인 통일성.
 *
 * 자동 dismiss (기본 2.8s) + 클릭 dismiss.
 *
 * Portal 사용 — MobileTopBar 의 backdrop-filter stacking context 회피.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Ques from '@/components/mascot/Ques';
import { characterForSubject } from '@/components/mascot/types';
import type { Subject } from '@/types/question';

const SUBJECT_LABEL: Record<'adsp' | 'sqld', string> = {
  adsp: 'ADsP',
  sqld: 'SQLD',
};

interface Props {
  subject: Subject;
  onDismiss: () => void;
  /** 자동 닫기 시간 ms (기본 2800). */
  autoCloseMs?: number;
}

export default function SubjectSwitchToast({
  subject,
  onDismiss,
  autoCloseMs = 2800,
}: Props) {
  const [enter, setEnter] = useState(false);

  useEffect(() => {
    // 다음 frame 에 fade-in
    const t1 = window.setTimeout(() => setEnter(true), 16);
    const t2 = window.setTimeout(() => onDismiss(), autoCloseMs);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [autoCloseMs, onDismiss]);

  if (subject !== 'adsp' && subject !== 'sqld') return null;
  if (typeof document === 'undefined') return null;
  const label = SUBJECT_LABEL[subject];

  return createPortal(
    <button
      type="button"
      onClick={onDismiss}
      aria-label="인사 닫기"
      className="fixed left-1/2 -translate-x-1/2 z-[110] liquid-glass rounded-2xl px-4 py-3 flex items-center gap-3 text-left transition-all duration-300"
      style={{
        top: 'calc(env(safe-area-inset-top, 0px) + 64px)',
        maxWidth: 'min(92vw, 420px)',
        opacity: enter ? 1 : 0,
        transform: `translate(-50%, ${enter ? '0' : '-8px'})`,
        background: 'rgba(20,32,46,0.96)',
        border: '1px solid rgba(239,244,255,0.16)',
        boxShadow: '0 12px 36px rgba(0,0,0,0.45)',
      }}
    >
      <span className="shrink-0">
        <Ques
          pose="wave"
          character={characterForSubject(subject)}
          size={36}
          animated={false}
        />
      </span>
      <span className="kr-body text-[13px] text-cream/95 leading-[1.45] flex-1">
        이번엔 <strong className="kr-num font-bold">{label}</strong>를(을) 공부하려고
        하시는군요!
      </span>
    </button>,
    document.body,
  );
}

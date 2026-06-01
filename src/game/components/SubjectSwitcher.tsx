/**
 * SubjectSwitcher — 과목 전환 모달.
 *
 * 사용자 흐름 폴리시:
 *   - SubjectBadge 클릭 시 노출
 *   - chooser 의 인사 카피 ("오늘은 어떤 공부를 하실건가요?") 재사용
 *   - 활성 과목은 비활성 표시 + 체크 마크
 *   - 다른 과목 선택 시 → setActiveSubject + onSwitched callback (toast 노출 등)
 *
 * 디자인 통일성: liquid-glass + kr-body + 마스코트 패턴.
 *
 * Portal 사용 이유:
 *   MobileTopBar 가 backdrop-filter: blur 사용 → stacking context 생성.
 *   그 안에서 mount 되는 fixed 모달은 viewport 대신 MobileTopBar 영역에 anchored.
 *   document.body 에 직접 mount 하여 viewport 전체 덮음 보장.
 */

import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import Ques from '@/components/mascot/Ques';
import SpeechBubble from '@/game/lesson/SpeechBubble';
import { characterForSubject } from '@/components/mascot/types';
import type { Subject } from '@/types/question';
import { setActiveSubject } from '@/game/storage';

const SUBJECT_VISUAL = {
  adsp: {
    label: 'ADsP',
    full: 'ADsP — 데이터분석 준전문가',
    accent: '#67e8f9',
    rgb: '103,232,249',
  },
  sqld: {
    label: 'SQLD',
    full: 'SQLD — SQL 개발자',
    accent: '#c084fc',
    rgb: '192,132,252',
  },
} as const;

const COMHWAL_VISUAL = {
  label: '컴활',
  full: '컴퓨터활용능력 필기',
  accent: '#a7e96a',
} as const;

interface Props {
  /** 현재 활성 과목 (체크 표시용). */
  current: Subject | null;
  onClose: () => void;
  /** 과목 전환 시 caller (보통 toast 노출 + 라우트 이동). */
  onSwitched?: (newSubject: Subject) => void;
}

export default function SubjectSwitcher({
  current,
  onClose,
  onSwitched,
}: Props) {
  const handleSelect = (subject: Subject) => {
    if (subject === current) {
      onClose();
      return;
    }
    setActiveSubject(subject);
    onSwitched?.(subject);
    onClose();
  };

  const handleSelectComhwal = () => {
    onClose();
    window.location.hash = '/game/comhwal';
  };

  const activeChar =
    current === 'adsp' || current === 'sqld'
      ? characterForSubject(current)
      : characterForSubject('adsp');

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-5 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      style={{ background: 'rgba(1,8,40,0.78)' }}
      onClick={onClose}
    >
      <div
        className="liquid-glass rounded-[22px] max-w-[440px] w-full p-6 relative"
        style={{
          border: '1px solid rgba(239,244,255,0.12)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 inline-flex items-center justify-center rounded-full text-cream/55 hover:text-cream hover:bg-white/10 transition"
          aria-label="닫기"
        >
          <X size={16} strokeWidth={2.4} />
        </button>

        {/* 마스코트 + 인사 (chooser 와 동일 카피) */}
        <div className="flex items-start gap-3 mb-5">
          <div className="shrink-0">
            <Ques pose="wave" character={activeChar} size={72} animated={false} />
          </div>
          <div className="flex-1 pt-1">
            <SpeechBubble
              text={'오늘은 어떤 공부를 하실건가요?'}
              placement="right"
            />
          </div>
        </div>

        {/* 과목 카드 */}
        <div className="grid grid-cols-1 gap-2.5">
          {(['adsp', 'sqld'] as const).map((subject) => {
            const v = SUBJECT_VISUAL[subject];
            const isActive = subject === current;
            return (
              <button
                key={subject}
                type="button"
                onClick={() => handleSelect(subject)}
                className="relative w-full p-4 rounded-2xl text-left transition active:scale-[0.99]"
                style={{
                  background: isActive
                    ? `rgba(${v.rgb},0.08)`
                    : 'rgba(255,255,255,0.04)',
                  border: isActive
                    ? `1.5px solid ${v.accent}`
                    : '1px solid rgba(239,244,255,0.12)',
                  boxShadow: isActive
                    ? `0 0 18px rgba(${v.rgb},0.28)`
                    : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="kr-heading text-[18px] tabular-nums shrink-0"
                    style={{
                      color: v.accent,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {v.label}
                  </span>
                  <span className="kr-body text-[12.5px] text-cream/70 flex-1 truncate">
                    {v.full}
                  </span>
                  {isActive && (
                    <span
                      className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full"
                      style={{
                        background: `${v.accent}33`,
                        border: `1px solid ${v.accent}`,
                      }}
                    >
                      <Check size={12} strokeWidth={3} style={{ color: v.accent }} />
                    </span>
                  )}
                </div>
                {isActive && (
                  <div
                    className="kr-num text-[10px] uppercase tracking-widest mt-1.5"
                    style={{ color: v.accent }}
                  >
                    현재 학습 중
                  </div>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleSelectComhwal}
            className="relative w-full p-4 rounded-2xl text-left transition active:scale-[0.99]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(239,244,255,0.12)',
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="kr-heading text-[18px] tabular-nums shrink-0"
                style={{
                  color: COMHWAL_VISUAL.accent,
                  letterSpacing: '0.04em',
                }}
              >
                {COMHWAL_VISUAL.label}
              </span>
              <span className="kr-body text-[12.5px] text-cream/70 flex-1 truncate">
                {COMHWAL_VISUAL.full}
              </span>
              <span
                className="kr-num shrink-0 text-[10px] uppercase tracking-widest"
                style={{ color: COMHWAL_VISUAL.accent }}
              >
                1급·2급
              </span>
            </div>
          </button>
        </div>

        <p className="kr-body text-[11.5px] text-cream/45 mt-4 leading-[1.5]">
          과목을 바꿔도 진행도는 각 과목별로 따로 보존돼요. 컴활은 학습 화면에서
          1급·2급을 먼저 고를 수 있어요.
        </p>
      </div>
    </div>,
    document.body,
  );
}

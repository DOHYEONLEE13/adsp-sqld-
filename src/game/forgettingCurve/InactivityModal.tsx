/**
 * InactivityModal — 미접속 단계별 안내 모달.
 *
 * Phase 4 Step 4 — 망각 곡선 시스템.
 *
 * 표시 시점 (App 진입 또는 퀘스트 탭 진입 시):
 *   - 1~3일 미접속: action='notify' — 작은 배너 (이 모달 X, InAppBanner 사용)
 *   - 3~7일 미접속: action='inform' — 모달 ("지난 복습 N개 쌓였어요")
 *   - 7일+ 미접속: action='suggest_reset' — 모달 ([재계산 / 유지] 버튼)
 *
 * 닫기:
 *   - inform/suggest_reset 모두 모달 닫기 후 24h 동안 같은 단계 알림 X (피로 방지).
 *   - 사용자가 "유지" 선택 시 큐 그대로, "재계산" 시 resetQueue 호출.
 */

import { createPortal } from 'react-dom';
import { Clock, RefreshCw, X } from 'lucide-react';
import type { InactivityAction } from './inactivityHandler';

interface Props {
  action: InactivityAction;
  /** [재계산] 클릭 시 — caller 가 resetQueue 호출. */
  onReset: () => void;
  /** [유지] 또는 [확인] 닫기 시. */
  onDismiss: () => void;
}

export default function InactivityModal({ action, onReset, onDismiss }: Props) {
  if (action.action !== 'inform' && action.action !== 'suggest_reset') {
    return null;
  }
  if (typeof document === 'undefined') return null;

  const isReset = action.action === 'suggest_reset';
  const Icon = isReset ? RefreshCw : Clock;
  const accent = isReset ? '#FFB020' : '#67e8f9';

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-5 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      style={{ background: 'rgba(1,8,40,0.78)' }}
      onClick={onDismiss}
    >
      <div
        className="liquid-glass rounded-[22px] max-w-[440px] w-full p-6 relative"
        style={{
          border: `1px solid ${accent}55`,
          boxShadow: `0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px ${accent}33 inset`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3 right-3 w-8 h-8 inline-flex items-center justify-center rounded-full text-cream/55 hover:text-cream hover:bg-white/10 transition"
          aria-label="닫기"
        >
          <X size={16} strokeWidth={2.4} />
        </button>

        {/* 아이콘 + 헤더 */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full inline-flex items-center justify-center"
            style={{
              background: `${accent}1f`,
              border: `1px solid ${accent}66`,
            }}
          >
            <Icon size={18} strokeWidth={2.2} style={{ color: accent }} />
          </div>
          <div>
            <div
              className="kr-num text-[10.5px] uppercase tracking-widest mb-0.5"
              style={{ color: accent }}
            >
              {isReset ? '큐 재계산 권장' : '오랜만이에요'}
            </div>
            <div className="kr-heading text-[16px] text-cream">
              {action.inactivityDays}일 미접속
            </div>
          </div>
        </div>

        {/* 메시지 */}
        <p className="kr-body text-[14px] text-cream/85 leading-[1.65] mb-5">
          {action.message}
        </p>

        {/* 액션 */}
        {isReset ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onReset();
                onDismiss();
              }}
              className="flex-1 p-3 rounded-xl kr-heading uppercase tracking-widest text-[12px] transition active:scale-[0.98]"
              style={{
                background: accent,
                color: 'var(--base)',
                boxShadow: `0 6px 20px -8px ${accent}99`,
              }}
            >
              큐 재계산 (1일부터)
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="flex-1 p-3 rounded-xl kr-heading uppercase tracking-widest text-[12px] transition liquid-glass hover:bg-white/10"
              style={{
                color: 'var(--cream)',
                border: '1px solid rgba(239,244,255,0.18)',
              }}
            >
              그대로 유지
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onDismiss}
            className="w-full p-3 rounded-xl kr-heading uppercase tracking-widest text-[13px] transition active:scale-[0.98]"
            style={{
              background: accent,
              color: 'var(--base)',
              boxShadow: `0 6px 20px -8px ${accent}99`,
            }}
          >
            확인 · 천천히 따라가기
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}

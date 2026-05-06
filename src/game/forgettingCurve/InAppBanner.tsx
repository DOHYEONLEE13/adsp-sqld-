/**
 * InAppBanner — 앱 진입 시 작은 배너 (망각 곡선 알림).
 *
 * Phase 4 Step 4 — 망각 곡선 인앱 알림.
 *
 * 표시 정책:
 *   - 1~3일 미접속 + 만기 큐 N개 → "복습 큐 N개 대기 중" 배너
 *   - 클릭 시 #/quests (퀘스트 탭) 이동
 *   - X 클릭 시 닫기 — 24h 동안 같은 배너 표시 X (피로 방지)
 *   - 닫기 timestamp 는 localStorage 에 저장
 *
 * 표시 안 함 조건:
 *   - 미접속 0일 (오늘 활성)
 *   - 큐 비어있음
 *   - 24h 내 닫은 적 있음
 *   - 3일+ 미접속 (InactivityModal 이 담당)
 */

import { useEffect, useState } from 'react';
import { Repeat, ChevronRight, X } from 'lucide-react';

const BANNER_DISMISS_KEY = 'questdp.reviewBanner.dismissedAt';
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h

interface Props {
  /** 만기 큐 항목 수. 0 이면 표시 X. */
  pendingCount: number;
  /** 클릭 시 caller — 보통 #/quests 로 이동. */
  onOpen: () => void;
}

export default function InAppBanner({ pendingCount, onOpen }: Props) {
  const [hidden, setHidden] = useState<boolean>(() => isRecentlyDismissed());

  // 다른 탭에서 dismiss 되면 즉시 반영
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === BANNER_DISMISS_KEY) setHidden(isRecentlyDismissed());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(BANNER_DISMISS_KEY, String(Date.now()));
      } catch {
        /* noop */
      }
    }
    setHidden(true);
  };

  if (hidden) return null;
  if (pendingCount <= 0) return null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full liquid-glass rounded-2xl px-4 py-3 transition hover:bg-white/5 active:scale-[0.99] flex items-center gap-3"
      style={{
        border: 'color-mix(in srgb, var(--neon) 35%, transparent) 1px solid',
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--neon) 8%, transparent), transparent)',
      }}
    >
      <Repeat
        size={16}
        strokeWidth={2.4}
        style={{ color: 'var(--neon)', flexShrink: 0 }}
      />
      <div className="flex-1 min-w-0 text-left">
        <div
          className="kr-num text-[10px] uppercase tracking-widest mb-0.5"
          style={{ color: 'var(--neon)' }}
        >
          오늘의 복습 대기
        </div>
        <div className="kr-body text-[12.5px] text-cream/85 leading-tight">
          복습 큐 <strong style={{ color: 'var(--neon)' }}>{pendingCount}개</strong>
          가 망각 시점에 도달했어요
        </div>
      </div>
      <ChevronRight
        size={16}
        strokeWidth={2.4}
        aria-hidden
        style={{ color: 'rgba(239,244,255,0.55)' }}
      />
      <span
        role="button"
        tabIndex={0}
        onClick={handleDismiss}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleDismiss(e as unknown as React.MouseEvent);
          }
        }}
        aria-label="배너 닫기 (24시간 동안 표시 안 함)"
        className="ml-1 inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/10 transition cursor-pointer"
      >
        <X size={13} strokeWidth={2.4} style={{ color: 'rgba(239,244,255,0.6)' }} />
      </span>
    </button>
  );
}

/** 마지막 dismiss 후 24h 이내인지. */
function isRecentlyDismissed(now: number = Date.now()): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(BANNER_DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (Number.isNaN(dismissedAt)) return false;
    return now - dismissedAt < DISMISS_COOLDOWN_MS;
  } catch {
    return false;
  }
}

/** 닫기 timestamp 클리어 — 테스트용. */
export function clearBannerDismiss(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(BANNER_DISMISS_KEY);
  } catch {
    /* noop */
  }
}

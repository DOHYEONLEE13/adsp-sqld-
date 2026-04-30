/**
 * Toast — 통합 토스트 시스템 (provider + hook).
 *
 * 어디 쓰나:
 *   - Supabase RPC 실패: "저장 실패 — 재시도 중..."
 *   - 네트워크 복귀: "동기화됨"
 *   - 일회성 액션 결과: "북마크 추가됨"
 *
 * 사용 패턴:
 *   const { show } = useToast();
 *   show({ kind: 'error', text: '저장 실패. 잠시 후 다시 시도합니다.' });
 *
 * 정책:
 *   - 동시 노출 최대 3개 (FIFO).
 *   - 자동 dismiss: success/info 3초 · error 5초 (수동 X 클릭도 가능).
 *   - 같은 라벨 토스트 중복 호출은 dedupe (3초 내 동일 메시지면 무시).
 *
 * TierUpgradeToast 같은 특화 토스트는 본 시스템과 독립적으로 운용 — 방해 없음.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { X } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastInput {
  kind: ToastKind;
  text: string;
  /** 사용자 액션 (선택). 텍스트 + 클릭 핸들러. */
  action?: { label: string; onClick: () => void };
  /** 직접 dismiss 시간 지정 (ms). 미지정이면 kind 기본값. */
  durationMs?: number;
}

interface ToastEntry extends ToastInput {
  id: number;
  createdAt: number;
}

interface ToastContextValue {
  show(input: ToastInput): void;
  dismiss(id: number): void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_VISIBLE = 3;
const DEDUPE_MS = 3000;

function defaultDuration(kind: ToastKind): number {
  return kind === 'error' ? 5000 : 3000;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextIdRef = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((input: ToastInput) => {
    const now = Date.now();
    setToasts((prev) => {
      // dedupe — 같은 텍스트가 3초 내에 또 들어오면 무시
      const dup = prev.find(
        (t) => t.text === input.text && now - t.createdAt < DEDUPE_MS,
      );
      if (dup) return prev;

      const entry: ToastEntry = {
        ...input,
        id: nextIdRef.current++,
        createdAt: now,
      };
      const next = [...prev, entry];
      // FIFO — 최대 MAX_VISIBLE 개. 가장 오래된 것부터 잘라냄.
      return next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next;
    });
  }, []);

  // 자동 dismiss 타이머
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) => {
      const dur = t.durationMs ?? defaultDuration(t.kind);
      return window.setTimeout(() => dismiss(t.id), dur);
    });
    return () => {
      for (const tm of timers) window.clearTimeout(tm);
    };
  }, [toasts, dismiss]);

  const value = useMemo<ToastContextValue>(
    () => ({ show, dismiss }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/** 안전 hook — Provider 밖에서 호출 시 silent no-op (Storybook·테스트 호환). */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  // fallback: 콘솔로만. UI 깨짐 방지.
  return {
    show(input) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn('[useToast] outside provider:', input);
      }
    },
    dismiss() {},
  };
}

interface ViewportProps {
  toasts: ToastEntry[];
  onDismiss: (id: number) => void;
}

function ToastViewport({ toasts, onDismiss }: ViewportProps) {
  if (toasts.length === 0) return null;
  return (
    <div
      role="region"
      aria-label="알림"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
        maxWidth: 'calc(100vw - 32px)',
        width: 380,
      }}
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} entry={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({
  entry,
  onDismiss,
}: {
  entry: ToastEntry;
  onDismiss: () => void;
}) {
  const tone = TONE[entry.kind];
  return (
    <div
      role="status"
      style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px',
        background: tone.bg,
        border: `1px solid ${tone.border}`,
        borderRadius: 14,
        color: 'var(--cream)',
        boxShadow:
          '0 12px 40px -8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <span style={{ fontSize: 16 }} aria-hidden>
        {tone.icon}
      </span>
      <span
        className="kr-body"
        style={{ flex: 1, fontSize: 13, lineHeight: 1.45 }}
      >
        {entry.text}
      </span>
      {entry.action && (
        <button
          type="button"
          onClick={() => {
            entry.action!.onClick();
            onDismiss();
          }}
          className="kr-num"
          style={{
            padding: '6px 10px',
            borderRadius: 999,
            border: 'none',
            background: 'rgba(255,255,255,0.12)',
            color: 'var(--cream)',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {entry.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="닫기"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(239,244,255,0.6)',
          cursor: 'pointer',
          padding: 4,
          display: 'inline-flex',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

const TONE: Record<ToastKind, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'rgba(111,255,0,0.12)',
    border: 'rgba(111,255,0,0.45)',
    icon: '✓',
  },
  error: {
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.45)',
    icon: '⚠',
  },
  info: {
    bg: 'rgba(103,232,249,0.12)',
    border: 'rgba(103,232,249,0.45)',
    icon: 'ℹ',
  },
};

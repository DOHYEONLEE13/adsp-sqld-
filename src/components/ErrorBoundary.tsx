/**
 * ErrorBoundary — React 렌더 에러를 잡아 fallback UI 노출.
 *
 * 어디 쓰나:
 * - App.tsx 루트에서 전체 라우트를 감쌈 → 한 라우트가 깨져도 다른 라우트는 살아있음
 * - 무거운 lazy 컴포넌트 주변에서 import 실패 시 fallback
 *
 * 의도된 정책:
 * - 사용자에게 "다시 시도" 버튼 + 정중한 안내. 에러 자세한 내용은 dev 에서만.
 * - production 에선 stack trace 가 사용자에게 보이지 않음 (보안).
 * - "다시 시도" 클릭 시 ErrorBoundary 내부 state 만 리셋 → 같은 트리 재마운트.
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  /** 자식 트리. */
  children: ReactNode;
  /**
   * 커스텀 fallback (선택). 없으면 기본 fallback 사용.
   * 인자: error 객체 + reset 핸들러. reset 호출 시 ErrorBoundary state 초기화.
   */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /**
   * 에러 발생 시 호출되는 콜백 (선택). 외부 에러 추적 (Sentry 등) 연동 자리.
   */
  onError?: (error: Error, info: ErrorInfo) => void;
  /**
   * 라벨 (선택). 디버깅 시 어느 boundary 가 잡았는지 식별.
   * 예: 'GamePage', 'StatsPage'.
   */
  label?: string;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // dev 콘솔에는 항상 자세히 출력 — 디버깅 편의.
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(
        `[ErrorBoundary${this.props.label ? ` · ${this.props.label}` : ''}]`,
        error,
        info,
      );
    }
    this.props.onError?.(error, info);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error === null) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset);
    }

    return <DefaultFallback error={error} onReset={this.reset} />;
  }
}

interface DefaultFallbackProps {
  error: Error;
  onReset: () => void;
}

function DefaultFallback({ error, onReset }: DefaultFallbackProps) {
  return (
    <div
      role="alert"
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        gap: 16,
        color: 'var(--cream)',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'rgba(253,128,46,0.15)',
          border: '1.5px solid rgba(253,128,46,0.4)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
        }}
        aria-hidden
      >
        ⚠
      </div>
      <h2
        className="kr-heading"
        style={{ fontSize: 18, margin: 0, textAlign: 'center' }}
      >
        화면을 불러오는 중 문제가 생겼어요
      </h2>
      <p
        className="kr-body"
        style={{
          fontSize: 13,
          opacity: 0.7,
          margin: 0,
          textAlign: 'center',
          maxWidth: 320,
          lineHeight: 1.55,
        }}
      >
        잠시 후 다시 시도해주세요. 문제가 계속되면 페이지를 새로고침 해보세요.
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button
          type="button"
          onClick={onReset}
          className="kr-num"
          style={{
            padding: '10px 18px',
            borderRadius: 999,
            background: '#6FFF00',
            color: '#010828',
            fontSize: 13,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          다시 시도
        </button>
        <button
          type="button"
          onClick={() => {
            window.location.reload();
          }}
          className="kr-num"
          style={{
            padding: '10px 18px',
            borderRadius: 999,
            background: 'rgba(239,244,255,0.06)',
            color: 'var(--cream)',
            fontSize: 13,
            fontWeight: 600,
            border: '1px solid rgba(239,244,255,0.18)',
            cursor: 'pointer',
          }}
        >
          새로고침
        </button>
      </div>
      {import.meta.env.DEV && (
        <pre
          style={{
            marginTop: 16,
            maxWidth: 600,
            padding: 12,
            borderRadius: 8,
            background: 'rgba(255,0,0,0.08)',
            border: '1px solid rgba(255,0,0,0.25)',
            fontSize: 11,
            color: '#fca5a5',
            overflow: 'auto',
            maxHeight: 200,
          }}
        >
          {error.message}
          {'\n'}
          {error.stack}
        </pre>
      )}
    </div>
  );
}

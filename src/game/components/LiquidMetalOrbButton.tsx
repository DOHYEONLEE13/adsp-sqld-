import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react';
import { LiquidMetalButton } from '@/shaders/liquid-metal-button/LiquidMetalButton';

interface LiquidMetalOrbButtonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick'> {
  accent: string;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  selected?: boolean;
  size?: number;
}

type LiquidMetalControlStyle = CSSProperties & {
  '--liquid-metal-control-accent': string;
  '--liquid-metal-control-size': string;
};

/** Uses the supplied WebGL button unchanged and replaces only its plus icon. */
export default function LiquidMetalOrbButton({
  accent,
  children,
  className = '',
  disabled = false,
  onClick,
  selected = false,
  size = 56,
  style: customStyle,
  ...wrapperProps
}: LiquidMetalOrbButtonProps) {
  const label = String(wrapperProps['aria-label'] ?? '학습 옵션');
  const style: LiquidMetalControlStyle = {
    ...customStyle,
    '--liquid-metal-control-accent': accent,
    '--liquid-metal-control-size': `${size}px`,
  };

  return (
    <div
      {...wrapperProps}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(event) => {
        wrapperProps.onKeyDown?.(event);
        if (disabled || event.defaultPrevented) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
      tabIndex={disabled ? -1 : (wrapperProps.tabIndex ?? 0)}
      data-disabled={disabled || undefined}
      data-selected={selected || undefined}
      className={`liquid-metal-control ${className}`.trim()}
      style={style}
    >
      <LiquidMetalButton
        variant="circle"
        text={label}
        embedded
        onClick={disabled ? undefined : onClick}
      />
      <span className="liquid-metal-control__icon" aria-hidden="true">
        {children}
      </span>
    </div>
  );
}

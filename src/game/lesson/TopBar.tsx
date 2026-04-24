/**
 * TopBar — X(나가기) + 진행바. 듀오링고 레슨 상단을 그대로 차용.
 */

import { X } from 'lucide-react';

interface Props {
  /** 0~1 범위. */
  progress: number;
  onExit: () => void;
}

export default function TopBar({ progress, onExit }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <div className="sticky top-0 z-30 bg-base/85 backdrop-blur-md">
      <div className="mx-auto max-w-[820px] flex items-center gap-4 px-5 py-3 md:px-8 md:py-4">
        <button
          type="button"
          onClick={onExit}
          aria-label="레슨 나가기"
          className="shrink-0 w-9 h-9 rounded-full inline-flex items-center justify-center text-cream/70 hover:text-cream hover:bg-white/10 transition"
        >
          <X size={20} strokeWidth={2.4} />
        </button>

        <div className="flex-1 h-3 md:h-3.5 rounded-full bg-white/10 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
            style={{
              width: `${clamped * 100}%`,
              background:
                'linear-gradient(90deg, var(--subject-accent), #6FFF00)',
              boxShadow: '0 0 18px -2px var(--subject-accent)',
            }}
          />
          {/* 은은한 상단 하이라이트 */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 50%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

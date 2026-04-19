import { ChevronRight } from 'lucide-react';
import VideoBg from './VideoBg';
import type { GameMode } from '@/types/site';

interface Props {
  mode: GameMode;
  funScoreLabel: string;
  /** 카드 진입 버튼 클릭 핸들러. 없으면 기본적으로 게임 섹션으로 이동합니다. */
  onEnter?: () => void;
}

export default function ModeCard({ mode, funScoreLabel, onEnter }: Props) {
  const handleEnter = () => {
    if (onEnter) onEnter();
    else window.location.hash = '/game';
  };
  return (
    <article className="liquid-glass rounded-[32px] p-[18px] transition hover:bg-white/10">
      <div className="relative w-full pb-[100%] rounded-[24px] overflow-hidden bg-black">
        <VideoBg src={mode.videoUrl} />
      </div>

      <h3 className="kr-heading text-[20px] uppercase mt-[18px] tracking-wide">
        {mode.title}
      </h3>
      <p className="kr-body text-[13px] leading-[1.7] text-cream/70 mt-1.5">
        {mode.description}
      </p>

      <div className="liquid-glass rounded-[20px] mt-3.5 px-5 py-4 flex items-center justify-between">
        <div>
          <span className="kr-heading block text-[11px] uppercase tracking-widest text-cream/70">
            {funScoreLabel}
          </span>
          <span className="kr-heading block text-[16px] mt-0.5">
            {mode.funScore.toFixed(1)} / 10
          </span>
        </div>

        <button
          type="button"
          aria-label="모드 진입"
          onClick={handleEnter}
          className="w-12 h-12 rounded-full inline-flex items-center justify-center transition hover:scale-110"
          style={{
            background:
              'linear-gradient(135deg, var(--purple-1), var(--purple-2))',
            boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.55)',
          }}
        >
          <ChevronRight width={22} height={22} strokeWidth={2.5} color="#fff" />
        </button>
      </div>
    </article>
  );
}

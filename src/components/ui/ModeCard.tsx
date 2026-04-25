import { ChevronRight, Lock } from 'lucide-react';
import VideoBg from './VideoBg';
import type { SubjectShowcase } from '@/types/site';

interface Props {
  mode: SubjectShowcase;
  /** 카드 하단 좌측 라벨 (예: "콘텐츠"). COLLECTION.cardFunScoreLabel 에서 옴. */
  funScoreLabel: string;
  /** 카드 진입 클릭 핸들러. 미지정 시 mode.href 또는 #/game 으로 이동. comingSoon 이면 무시. */
  onEnter?: () => void;
}

export default function ModeCard({ mode, funScoreLabel, onEnter }: Props) {
  const handleEnter = () => {
    if (mode.comingSoon) return;
    if (onEnter) onEnter();
    else window.location.hash = (mode.href ?? '#/game').replace(/^#/, '');
  };

  const locked = !!mode.comingSoon;

  return (
    <article
      className="liquid-glass rounded-[32px] p-[18px] transition hover:bg-white/10 relative"
      style={locked ? { opacity: 0.78 } : undefined}
    >
      <div className="relative w-full pb-[100%] rounded-[24px] overflow-hidden bg-black">
        <VideoBg src={mode.videoUrl} />
        {locked ? (
          <div
            className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]"
            style={{ background: 'rgba(1,8,40,0.5)' }}
            aria-hidden
          >
            <span className="kr-heading uppercase tracking-widest text-[12px] md:text-[13px] px-4 py-2 rounded-full liquid-glass text-cream/85">
              준비중...
            </span>
          </div>
        ) : null}
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
            {mode.metaLabel || funScoreLabel}
          </span>
          <span className="kr-heading block text-[16px] mt-0.5">
            {mode.metaValue}
          </span>
        </div>

        <button
          type="button"
          aria-label={locked ? `${mode.title} 출시 예정` : `${mode.title} 진입`}
          aria-disabled={locked}
          onClick={handleEnter}
          disabled={locked}
          className="w-12 h-12 rounded-full inline-flex items-center justify-center transition hover:scale-110 disabled:hover:scale-100 disabled:cursor-not-allowed"
          style={
            locked
              ? {
                  background: 'rgba(255,255,255,0.06)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                }
              : {
                  background:
                    'linear-gradient(135deg, var(--purple-1), var(--purple-2))',
                  boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.55)',
                }
          }
        >
          {locked ? (
            <Lock width={18} height={18} strokeWidth={2.4} color="rgba(239,244,255,0.55)" />
          ) : (
            <ChevronRight width={22} height={22} strokeWidth={2.5} color="#fff" />
          )}
        </button>
      </div>
    </article>
  );
}

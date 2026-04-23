/**
 * XP 팝업 — 정답 맞췄을 때 떠오르는 "+10 XP" 마이크로 애니메이션.
 *
 * 부모가 `key` prop 을 바꿔주면 리마운트되며 애니메이션이 재생됩니다.
 * absolute positioning 전제 — 부모가 relative 컨테이너여야 합니다.
 */

import { Sparkles } from 'lucide-react';

interface Props {
  xp: number;
  /** 추가 라벨. "연속!" 같이 붙이고 싶을 때. */
  label?: string;
}

export default function XpPopup({ xp, label }: Props) {
  return (
    <div
      aria-hidden
      className="xp-popup pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 kr-heading text-[13px] uppercase tracking-widest inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
      style={{
        background: 'rgba(111, 255, 0, 0.16)',
        color: '#6FFF00',
        border: '1px solid rgba(111, 255, 0, 0.4)',
        boxShadow: '0 6px 18px -6px rgba(111, 255, 0, 0.55)',
        textShadow: '0 0 14px rgba(111, 255, 0, 0.6)',
      }}
    >
      <Sparkles size={12} strokeWidth={2.8} />+{xp} XP
      {label ? (
        <span className="text-[10px] text-cream/80 ml-0.5">· {label}</span>
      ) : null}
    </div>
  );
}

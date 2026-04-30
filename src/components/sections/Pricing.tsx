import { PRICING_PLANS } from '@/data/pricing';
import { cx } from '@/lib/utils';
import type { PricingPlan } from '@/types/site';

export default function Pricing() {
  return (
    <section id="pricing" className="bg-base pt-16 pb-10">
      <div className="max-w-layout mx-auto px-6 md:px-12">
        {/*
          3-카드 그리드 — 무료 / 1주 / 월간.
          모바일: 1열 stack (스크롤로 비교).
          md+: 3열 균등.
          강조 카드 (emphasis='highlight') 는 살짝 위로 들리고 neon 보더.
        */}
        <div className="grid gap-5 md:gap-6 grid-cols-1 md:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan }: { plan: PricingPlan }) {
  const isHighlight = plan.emphasis === 'highlight';
  const isPremium = plan.id !== 'free';
  return (
    <div
      className={cx(
        'liquid-glass rounded-[24px] p-7 relative',
        isHighlight && 'md:-translate-y-2',
      )}
      style={
        isHighlight
          ? {
              boxShadow:
                '0 24px 64px -20px rgba(111,255,0,0.35), 0 0 0 1.5px rgba(111,255,0,0.55)',
            }
          : undefined
      }
    >
      {/* 우상단 뱃지 — BEST / 단기 */}
      {plan.badge && (
        <span
          className={cx(
            'kr-num absolute top-4 right-4 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider',
            isHighlight
              ? 'bg-neon text-base'
              : 'bg-cream/10 text-cream/85 border border-cream/20',
          )}
        >
          {plan.badge}
        </span>
      )}

      <div className="kr-heading uppercase text-[14px] tracking-widest text-cream/70 pr-16">
        {plan.tier}
      </div>

      <div
        className={cx(
          'kr-num text-[32px] md:text-[36px] leading-[1] mt-2',
          isPremium ? 'text-neon' : 'text-cream',
        )}
      >
        {plan.price}
      </div>

      {plan.description && (
        <p className="kr-body text-[12.5px] text-cream/60 mt-2 leading-[1.55]">
          {plan.description}
        </p>
      )}

      <ul className="mt-5 flex flex-col gap-2.5 list-none p-0 m-0">
        {plan.features.map((f, i) => (
          <li
            key={i}
            className="kr-body text-[14px] text-cream/85 flex items-baseline gap-2.5"
          >
            <span className="text-neon">▸</span>
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

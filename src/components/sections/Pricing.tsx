import { PRICING_PLANS } from '@/data/pricing';
import { cx } from '@/lib/utils';
import type { PricingPlan } from '@/types/site';

export default function Pricing() {
  return (
    <section id="pricing" className="bg-base pt-16 pb-10">
      <div className="max-w-layout mx-auto px-6 md:px-12">
        <div className="grid gap-5 md:gap-6 grid-cols-1 md:grid-cols-2">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan }: { plan: PricingPlan }) {
  const isPremium = plan.id === 'premium';
  return (
    <div className="liquid-glass rounded-[24px] p-7">
      <div className="kr-heading uppercase text-[14px] tracking-widest text-cream/70">
        {plan.tier}
      </div>
      <div
        className={cx(
          'kr-heading text-[44px] leading-[1] mt-2',
          isPremium && 'text-neon',
        )}
      >
        {plan.price}
      </div>
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

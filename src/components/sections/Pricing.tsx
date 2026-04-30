import { Check } from 'lucide-react';
import { PRICING_PLANS } from '@/data/pricing';
import { cx } from '@/lib/utils';
import type { PricingPlan } from '@/types/site';

/**
 * Pricing — 3 카드 (무료 / 1주 / 월간) 그리드.
 *
 * 디자인 원칙:
 *   - 명확한 typography hierarchy: category → tier → price → valueNote → desc → features
 *   - 가격을 '숫자' 와 '단위 / 주기' 로 분리 → 큰 숫자가 즉시 읽힘
 *   - 월 구독은 valueNote (neon) + glow border + 살짝 들림 으로 자연스럽게 추천
 *   - 평면 alpha · 단순 ▸ 글머리 → divider + Check 아이콘 으로 정돈된 인상
 */
export default function Pricing() {
  return (
    <section id="pricing" className="bg-base pt-16 pb-10">
      <div className="max-w-layout mx-auto px-6 md:px-12">
        <div className="grid gap-5 md:gap-6 grid-cols-1 md:grid-cols-3 items-stretch">
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
  const isPaid = plan.id !== 'free';

  return (
    <div
      className={cx(
        'liquid-glass rounded-[24px] p-7 md:p-8 relative flex flex-col',
        isHighlight && 'md:-translate-y-2',
      )}
      style={
        isHighlight
          ? {
              boxShadow:
                '0 28px 72px -22px rgba(111,255,0,0.32), 0 0 0 1.5px rgba(111,255,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
              background:
                'linear-gradient(180deg, rgba(111,255,0,0.04) 0%, rgba(255,255,255,0) 35%)',
            }
          : undefined
      }
    >
      {/* 우상단 뱃지 */}
      {plan.badge && (
        <span
          className={cx(
            'kr-num absolute top-5 right-5 px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-[0.16em] uppercase',
            isHighlight
              ? 'bg-neon text-base shadow-[0_4px_12px_-2px_rgba(111,255,0,0.55)]'
              : 'bg-cream/8 text-cream/75 border border-cream/15',
          )}
        >
          {plan.badge}
        </span>
      )}

      {/* 카테고리 (FREE / PREMIUM) — 작은 caps */}
      {plan.category && (
        <div
          className={cx(
            'kr-num text-[10px] font-bold tracking-[0.22em] uppercase',
            isHighlight ? 'text-neon' : 'text-cream/45',
          )}
        >
          {plan.category}
        </div>
      )}

      {/* Tier (월 구독 / 1주 단기 / 무료 플랜) */}
      <h3 className="kr-heading text-[20px] md:text-[22px] text-cream mt-1.5 leading-[1.25] pr-16">
        {plan.tier}
      </h3>

      {/* 가격 — 숫자(큰) + 단위·주기(작게) 분리 */}
      <div className="mt-5 flex items-baseline gap-1.5">
        <span
          className={cx(
            'kr-num font-bold leading-[1]',
            isPaid ? 'text-neon' : 'text-cream',
            isPaid ? 'text-[40px] md:text-[44px]' : 'text-[36px] md:text-[40px]',
          )}
        >
          {plan.price}
        </span>
        {plan.priceSuffix && (
          <span className="kr-body text-[13px] text-cream/55 font-medium">
            {plan.priceSuffix}
          </span>
        )}
      </div>

      {/* 가치 안내 — neon, 월 구독 차별화 */}
      {plan.valueNote && (
        <div
          className="kr-num text-[12px] mt-2 leading-[1.4] font-semibold"
          style={{ color: '#9CFF3D' /* neon 보다 살짝 밝게 — 본문 톤 안 깨고 가독 */ }}
        >
          {plan.valueNote}
        </div>
      )}

      {/* 설명 */}
      {plan.description && (
        <p className="kr-body text-[13px] text-cream/65 mt-3 leading-[1.55]">
          {plan.description}
        </p>
      )}

      {/* 미세 divider */}
      <div className="my-5 h-px bg-cream/10" aria-hidden />

      {/* 혜택 — Check 아이콘 + 본문 */}
      <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
        {plan.features.map((f, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 kr-body text-[13.5px] leading-[1.5]"
          >
            <span
              aria-hidden
              className={cx(
                'shrink-0 inline-flex items-center justify-center rounded-full mt-[2px]',
                f.highlight
                  ? 'bg-neon/20 text-neon w-[18px] h-[18px]'
                  : 'bg-cream/8 text-cream/55 w-[16px] h-[16px]',
              )}
            >
              <Check
                size={f.highlight ? 11 : 10}
                strokeWidth={3}
                aria-hidden
              />
            </span>
            <span
              className={cx(
                f.highlight ? 'text-cream' : 'text-cream/80',
              )}
            >
              {f.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

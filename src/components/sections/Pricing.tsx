import { Check, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PRICING_PLANS } from '@/data/pricing';
import { cx } from '@/lib/utils';
import type { PricingPlan } from '@/types/site';
import {
  isTossConfigured,
  requestPayment,
  type ProductCode,
} from '@/lib/toss';
import { getMyProfile } from '@/data/profile';
import {
  getSupabase,
  isSupabaseConfigured,
} from '@/lib/supabase';
import { setPendingAuthRedirect } from '@/lib/authGuard';

/** Plan id → 토스 product code 매핑. free 플랜은 결제 X. */
const PLAN_TO_PRODUCT: Record<string, ProductCode | null> = {
  free: null,
  'premium-weekly': 'weekly',
  'premium-monthly': 'monthly',
};

/**
 * Pricing — 3 카드 가로 슬라이드 (모든 폭).
 *
 * 디자인 원칙:
 *   - 옆으로 스와이프 (모바일) / 트랙패드 가로 스크롤 (데스크톱) — 자연스러운 비교
 *   - scroll-snap 으로 카드가 정중앙에 stop
 *   - 도트 인디케이터 — 현재 보이는 카드 표시
 *   - PC 에선 카드 폭이 작아져 단순 grid 보다 비교 어려울 수 있어 max 460px
 *   - typography hierarchy: category → tier → price → valueNote → desc → features
 *   - 체크 아이콘 — 모든 feature 동일 디자인 (highlight 와 일반 통일).
 *     이전엔 두 톤이라 "어떤 건 강조 어떤 건 흐림" 으로 일관성 부족 → 사용자
 *     "이거 할거면 다 해줘" 의 핵심.
 */
export default function Pricing() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // ── 어떤 카드가 viewport 가운데에 있는지 추적 ────────────────────────
  // IntersectionObserver 로 threshold 0.55 → 절반 이상 보이면 active.
  // 도트 인디케이터에 반영.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.querySelectorAll<HTMLElement>('[data-pricing-card]'));
    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-idx') ?? -1);
            if (idx >= 0) setActiveIdx(idx);
          }
        }
      },
      {
        root: track,
        threshold: 0.55,
      },
    );
    for (const card of cards) observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const scrollToIdx = (idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(`[data-idx="${idx}"]`);
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  return (
    <section id="pricing" className="bg-base pt-16 pb-10">
      <div className="max-w-layout mx-auto">
        {/*
          가로 스크롤 트랙 — px 로 좌우 padding 두어 첫·마지막 카드도 가운데 snap 가능.
          scroll-snap-type: x mandatory + scroll-snap-align: center.
          스크롤바 숨김 (모바일 자연 / 데스크톱 트랙패드 친화).
        */}
        <div
          ref={trackRef}
          className="flex gap-4 md:gap-6 overflow-x-auto px-6 md:px-12 pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{
            scrollSnapType: 'x mandatory',
            scrollPaddingLeft: '24px',
            scrollPaddingRight: '24px',
          }}
        >
          {PRICING_PLANS.map((plan, i) => (
            <div
              key={plan.id}
              data-pricing-card
              data-idx={i}
              className="shrink-0 snap-center w-[88vw] sm:w-[60vw] md:w-[400px] max-w-[460px]"
            >
              <PricingCard plan={plan} />
            </div>
          ))}
        </div>

        {/* 도트 인디케이터 — 현재 보이는 카드 강조 + 클릭으로 이동 */}
        <div
          className="flex items-center justify-center gap-2.5 mt-1"
          role="tablist"
          aria-label="요금제 카드 인디케이터"
        >
          {PRICING_PLANS.map((plan, i) => {
            const isActive = activeIdx === i;
            return (
              <button
                key={plan.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`${plan.tier} 카드로 이동`}
                onClick={() => scrollToIdx(i)}
                className="rounded-full transition-all duration-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon/50"
                style={{
                  width: isActive ? 24 : 8,
                  height: 8,
                  background: isActive
                    ? 'linear-gradient(90deg, #6FFF00, #9CFF3D)'
                    : 'rgba(239,244,255,0.18)',
                  boxShadow: isActive
                    ? '0 0 10px rgba(111,255,0,0.4)'
                    : 'none',
                }}
              />
            );
          })}
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
        'liquid-glass rounded-[24px] p-7 md:p-8 relative flex flex-col h-full',
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

      {/* 카테고리 */}
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

      {/* Tier */}
      <h3 className="kr-heading text-[20px] md:text-[22px] text-cream mt-1.5 leading-[1.25] pr-16">
        {plan.tier}
      </h3>

      {/* 가격 */}
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

      {/* 가치 안내 */}
      {plan.valueNote && (
        <div
          className="kr-num text-[12px] mt-2 leading-[1.4] font-semibold"
          style={{ color: '#9CFF3D' }}
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

      {/* divider */}
      <div className="my-5 h-px bg-cream/10" aria-hidden />

      {/* 혜택 — 모든 feature 동일 디자인 (체크 통일) */}
      <ul className="flex flex-col gap-3 list-none p-0 m-0 mb-6">
        {plan.features.map((f, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 kr-body text-[13.5px] leading-[1.5]"
          >
            <span
              aria-hidden
              className="shrink-0 inline-flex items-center justify-center rounded-full mt-[2px] w-[18px] h-[18px]"
              style={{
                background: 'rgba(111,255,0,0.15)',
                color: '#9CFF3D',
              }}
            >
              <Check size={11} strokeWidth={3} aria-hidden />
            </span>
            <span className={cx(f.highlight ? 'text-cream' : 'text-cream/80')}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA — 카드 하단 고정 (mt-auto). PG 등록 전이라 placeholder 동작 */}
      <div className="mt-auto pt-2">
        <PricingCTA plan={plan} isHighlight={isHighlight} />
      </div>
    </div>
  );
}

/**
 * PricingCTA — 결제하기 버튼.
 *
 * 현 시점 (Phase B 결제 게이트 도입 전): 클릭 시 alert 안내 — '결제 시스템 준비
 * 중. 곧 오픈됩니다'. PG 등록·webhook 연동 완료 후 실제 Toss SDK 호출로 교체
 * (B-4 작업 — `src/lib/payments.ts` initiatePremiumCheckout 사용 예정).
 *
 * 디자인 차별:
 *   - 무료 (id='free')               → 'guest' 톤 outline 버튼, 라벨 '지금 시작하기'
 *   - 프리미엄 (highlight=BEST)      → solid neon, 라벨 '월 구독 결제하기' (강조)
 *   - 프리미엄 (1주 단기)             → outline neon, 라벨 '1주 단기 결제하기'
 */
function PricingCTA({
  plan,
  isHighlight,
}: {
  plan: PricingPlan;
  isHighlight: boolean;
}) {
  const isPaid = plan.id !== 'free';
  const productCode = PLAN_TO_PRODUCT[plan.id] ?? null;
  const [submitting, setSubmitting] = useState(false);

  // 월 구독 (정기결제 / 빌링) 은 Phase 2 — 현재는 일회성 1주권 + 평생권만 활성.
  // monthly 카드 클릭 시는 안내만.
  const isMonthly = plan.id === 'premium-monthly';

  const label = !isPaid
    ? '지금 시작하기'
    : isMonthly
      ? '월 구독 결제하기'
      : '1주 단기 결제하기';

  const handleClick = async () => {
    if (submitting) return;
    if (!isPaid) {
      // 무료: 게임 진입
      window.location.hash = '/game';
      return;
    }

    // 월 구독은 빌링 (정기결제) — Phase 2 미구현 안내
    if (isMonthly) {
      window.alert(
        '월 자동 구독은 곧 오픈 예정입니다.\n지금은 1주 단기 또는 평생 코드 (마케팅 이벤트) 로 이용 가능합니다.',
      );
      return;
    }

    if (!productCode) return;

    // Toss 키 미설정 — 환경 안내
    if (!isTossConfigured()) {
      window.alert(
        '결제 시스템 준비 중입니다.\n토스 페이먼츠 가맹점 활성 후 정식 오픈 예정.',
      );
      return;
    }

    // 인증 가드 — 미로그인이면 로그인으로 redirect (결제 의도는 hash 로 보존)
    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      const { data } = (await sb?.auth.getSession()) ?? { data: { session: null } };
      if (!data.session) {
        // 로그인 후 자동으로 #pricing 으로 복귀하도록
        setPendingAuthRedirect('#pricing');
        window.location.hash = '/login';
        return;
      }
    }

    // 토스 결제창 호출 (성공 시 successUrl 로 redirect — 함수 resolve X)
    setSubmitting(true);
    try {
      const profile = getMyProfile();
      await requestPayment({
        productCode,
        customerEmail: profile.displayName ? `${profile.tag}@questdp.user` : 'guest@questdp.user',
        customerName: profile.displayName || profile.tag || '게스트',
      });
    } catch (err) {
      setSubmitting(false);
      const msg =
        err instanceof Error
          ? err.message === 'toss-client-key-missing'
            ? '결제 시스템 환경설정이 누락되어 있습니다.'
            : `결제창 호출 실패: ${err.message}`
          : '결제창 호출 실패. 잠시 후 다시 시도해주세요.';
      window.alert(msg);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className="kr-num w-full inline-flex items-center justify-center gap-1.5 rounded-full font-bold transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon/60"
      style={
        isHighlight
          ? {
              padding: '13px 18px',
              background: 'linear-gradient(180deg, #6FFF00 0%, #5BD600 100%)',
              color: '#010828',
              fontSize: 14,
              boxShadow:
                '0 8px 24px -6px rgba(111,255,0,0.55), inset 0 1px 0 rgba(255,255,255,0.25)',
            }
          : isPaid
            ? {
                padding: '12px 18px',
                background: 'rgba(111,255,0,0.08)',
                color: '#9CFF3D',
                fontSize: 13,
                border: '1.5px solid rgba(111,255,0,0.4)',
              }
            : {
                padding: '12px 18px',
                background: 'rgba(239,244,255,0.06)',
                color: 'var(--cream)',
                fontSize: 13,
                border: '1.5px solid rgba(239,244,255,0.18)',
              }
      }
    >
      <span>{label}</span>
      <ArrowRight size={14} strokeWidth={2.6} aria-hidden />
    </button>
  );
}

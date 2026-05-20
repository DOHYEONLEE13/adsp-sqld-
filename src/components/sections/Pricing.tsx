import { ArrowRight, Check, Network, Sparkles } from 'lucide-react';
import { useState } from 'react';
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

const PLAN_TO_PRODUCT: Record<string, ProductCode | null> = {
  free: null,
  'premium-weekly': 'weekly',
  'premium-monthly': 'monthly',
};

interface PricingProps {
  showIntro?: boolean;
}

export default function Pricing({ showIntro = true }: PricingProps) {
  return (
    <section
      id="pricing"
      className={cx(
        'bg-base text-cream',
        showIntro ? 'py-16 md:py-20' : 'pt-8 pb-16 md:pt-10 md:pb-20',
      )}
    >
      <div className="mx-auto w-full max-w-[1120px] px-5 md:px-8">
        {showIntro ? (
          <header className="mb-8 text-center md:mb-10">
            <h2 className="kr-heading text-[38px] font-medium leading-none tracking-normal text-cream md:text-[54px]">
              요금제
            </h2>
            <div className="mt-8 inline-flex rounded-[12px] border border-cream/12 bg-cream/[0.045] p-1 text-[12px] text-cream/58">
              <span className="rounded-[9px] bg-cream px-4 py-2 text-base shadow-[0_8px_20px_rgba(0,0,0,0.16)]">
                개인
              </span>
              <span className="px-4 py-2">시험 직전</span>
              <span className="px-4 py-2">꾸준 학습</span>
            </div>
          </header>
        ) : null}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        <p className="kr-body mt-8 text-center text-[11.5px] leading-[1.6] text-cream/48 md:text-[12px]">
          무료 플랜으로 전체 커리큘럼을 시작할 수 있습니다. 결제 전 가격과 제공 범위를 다시 확인하세요.
        </p>
      </div>
    </section>
  );
}

function planTitle(plan: PricingPlan): string {
  switch (plan.id) {
  case 'free':
    return '무료';
  case 'premium-weekly':
    return 'Pro';
  case 'premium-monthly':
    return 'Max';
  }
}

function planSubtitle(plan: PricingPlan): string {
  switch (plan.id) {
  case 'free':
    return 'QuestDP를 먼저 사용해 보기';
  case 'premium-weekly':
    return '시험 직전 집중 풀이';
  case 'premium-monthly':
    return '꾸준히 가장 알차게 활용';
  }
}

function planPrice(plan: PricingPlan): string {
  if (plan.id === 'free') return '₩0';
  return `${plan.price}원`;
}

function planPriceNote(plan: PricingPlan): string {
  switch (plan.id) {
  case 'free':
    return '모든 사용자가 무료';
  case 'premium-weekly':
    return '7일 이용 · 자동 갱신 없음';
  case 'premium-monthly':
    return '월간 · 주당 약 2,475원';
  }
}

function includedIntro(plan: PricingPlan): string {
  switch (plan.id) {
  case 'free':
    return '무료로 포함되는 기능';
  case 'premium-weekly':
    return '무료 요금제의 모든 기능 + 추가 기능';
  case 'premium-monthly':
    return 'Pro의 모든 기능 + 추가 기능';
  }
}

function primaryFeatures(plan: PricingPlan): string[] {
  switch (plan.id) {
  case 'free':
    return [
      'ADSP · SQLD 전체 커리큘럼',
      '에너지 10회 보유',
      '30분마다 1회 자동 충전',
      '오답 복습과 일일 미션',
      '순차 로드맵 진행',
    ];
  case 'premium-weekly':
    return [
      '7일 동안 에너지 무제한',
      '대기시간 없이 바로 풀이',
      '챕터와 스텝 자유 이동',
      '모의고사 무제한 재시도',
      '결제 후 자동 만료',
    ];
  case 'premium-monthly':
    return [
      '월간 에너지 무제한',
      '모든 챕터 자유 진행',
      '마스터리 대시보드 해금',
      'D-day와 스트릭 관리',
      '장기 학습에 가장 낮은 주당 비용',
    ];
  }
}

function cardIcon(plan: PricingPlan) {
  const isMax = plan.id === 'premium-monthly';
  return (
    <div
      className={cx(
        'mb-8 inline-flex h-9 w-9 items-center justify-center text-cream/82',
        isMax && 'text-neon',
      )}
      aria-hidden
    >
      {isMax ? <Sparkles size={32} strokeWidth={1.55} /> : <Network size={32} strokeWidth={1.55} />}
    </div>
  );
}

function PricingCard({ plan }: { plan: PricingPlan }) {
  const isMax = plan.id === 'premium-monthly';

  return (
    <article
      data-pricing-card
      className={cx(
        'flex min-h-[560px] flex-col rounded-[18px] border px-6 py-7 md:px-7 md:py-8',
        isMax
          ? 'border-[rgba(125,216,80,0.36)] bg-[rgba(8,22,42,0.78)] shadow-[0_22px_58px_rgba(111,255,0,0.10)]'
          : 'border-[rgba(239,244,255,0.13)] bg-cream/[0.035]',
      )}
    >
      {cardIcon(plan)}

      <h3 className="kr-heading text-[24px] font-medium leading-tight tracking-normal text-cream">
        {planTitle(plan)}
      </h3>
      <p className="kr-body mt-1.5 text-[13px] leading-[1.45] text-cream/62">
        {planSubtitle(plan)}
      </p>

      <div className="mt-6">
        <div className={cx(
          'kr-heading text-[20px] font-black leading-none',
          isMax ? 'text-neon' : 'text-cream',
        )}>
          {planPrice(plan)}
        </div>
        <p className="kr-body mt-1.5 text-[12px] leading-[1.45] text-cream/55">
          {planPriceNote(plan)}
        </p>
        {plan.valueNote ? (
          <p className="kr-body mt-1 text-[12px] leading-[1.45] text-neon/80">
            {plan.valueNote}
          </p>
        ) : null}
      </div>

      <div className="mt-7">
        <PricingCTA plan={plan} />
      </div>

      <div className="my-7 h-px bg-cream/10" aria-hidden />

      <p className="kr-body mb-3 text-[13px] font-bold leading-[1.45] text-cream/88">
        {includedIntro(plan)}
      </p>
      <ul className="flex flex-col gap-3">
        {primaryFeatures(plan).map((feature) => (
          <li
            key={feature}
            className="kr-body flex items-start gap-2.5 text-[13px] leading-[1.55] text-cream/76"
          >
            <Check
              size={14}
              strokeWidth={1.7}
              className="mt-[3px] shrink-0 text-cream/70"
              aria-hidden
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function PricingCTA({ plan }: { plan: PricingPlan }) {
  const isPaid = plan.id !== 'free';
  const productCode = PLAN_TO_PRODUCT[plan.id] ?? null;
  const [submitting, setSubmitting] = useState(false);
  const isMonthly = plan.id === 'premium-monthly';

  const label = !isPaid
    ? 'QuestDP 사용해 보기'
    : isMonthly
      ? 'Max 시작하기'
      : 'Pro 시작하기';

  const handleClick = async () => {
    if (submitting) return;
    if (!isPaid) {
      window.location.hash = '/game';
      return;
    }

    if (isMonthly) {
      window.alert(
        '월 자동 구독은 곧 오픈 예정입니다.\n지금은 1주 단기 또는 평생 코드 (마케팅 이벤트) 로 이용 가능합니다.',
      );
      return;
    }

    if (!productCode) return;

    if (!isTossConfigured()) {
      window.alert(
        '결제 시스템 준비 중입니다.\n토스 페이먼츠 가맹점 활성 후 정식 오픈 예정.',
      );
      return;
    }

    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      const { data } = (await sb?.auth.getSession()) ?? { data: { session: null } };
      if (!data.session) {
        setPendingAuthRedirect('#pricing');
        window.location.hash = '/login';
        return;
      }
    }

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
      disabled={submitting}
      aria-label={label}
      className="kr-body inline-flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-cream px-4 text-[13px] font-bold text-base transition hover:bg-white active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
    >
      <span>{submitting ? '처리 중' : label}</span>
      <ArrowRight size={13} strokeWidth={2} aria-hidden />
    </button>
  );
}

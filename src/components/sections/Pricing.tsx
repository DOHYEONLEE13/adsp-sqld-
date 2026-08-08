import { AlertTriangle, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { PRICING_PLANS } from '@/data/pricing';
import { useAuthSession } from '@/lib/auth/sessionStore';
import {
  isTossConfigured,
  isTossTestMode,
  requestPayment,
  SHOP_NAME,
  type ProductCode,
} from '@/lib/toss';
import { cx } from '@/lib/utils';
import type { PricingPlan } from '@/types/site';

/** 유료 플랜 → 토스 상품 코드. 무료 플랜은 결제 대상이 아니라 매핑 없음. */
const PLAN_PRODUCT: Partial<Record<PricingPlan['id'], ProductCode>> = {
  'premium-weekly': 'weekly',
  'premium-monthly': 'monthly',
};

/** 사용자가 결제창을 그냥 닫은 경우 — 에러로 표시하지 않는다. */
const CANCEL_CODES = new Set([
  'USER_CANCEL',
  'PAY_PROCESS_CANCELED',
  'PAY_PROCESS_ABORTED',
]);

interface PricingProps {
  showIntro?: boolean;
}

export default function Pricing({ showIntro = true }: PricingProps) {
  const auth = useAuthSession();
  // 결제창을 띄우는 중인 플랜 id — 해당 버튼만 스피너로 잠근다.
  const [pendingPlanId, setPendingPlanId] = useState<PricingPlan['id'] | null>(
    null,
  );
  const [error, setError] = useState('');

  const configured = isTossConfigured();

  /**
   * 유료 CTA → 토스 결제창. method 를 넘기지 않으므로 카드·계좌이체 등을
   * 고를 수 있는 통합 결제창이 열린다.
   *
   * 성공 시 토스가 successUrl 로 현재 창을 redirect 하므로 이 함수는
   * resolve 하지 않는다 — 스피너를 되돌리는 코드는 실패 경로에만 있다.
   */
  const startPayment = async (plan: PricingPlan) => {
    const productCode = PLAN_PRODUCT[plan.id];
    if (!productCode) return;

    if (!configured) {
      setError(
        '결제 설정이 아직 없습니다. .env 의 VITE_TOSS_CLIENT_KEY 를 확인해주세요.',
      );
      return;
    }

    setError('');
    setPendingPlanId(plan.id);

    const email = auth.session?.user.email ?? undefined;
    try {
      await requestPayment({
        productCode,
        customerEmail: email,
        customerName: email ? email.split('@')[0] : '게스트',
      });
    } catch (err) {
      setPendingPlanId(null);
      const code = (err as { code?: string })?.code ?? '';
      if (CANCEL_CODES.has(code)) return; // 사용자가 닫음 — 조용히 복귀
      setError((err as Error)?.message || '결제창을 여는 중 문제가 발생했어요.');
    }
  };

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
          </header>
        ) : null}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {PRICING_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              pending={pendingPlanId === plan.id}
              disabled={pendingPlanId !== null && pendingPlanId !== plan.id}
              onPaidClick={() => void startPayment(plan)}
            />
          ))}
        </div>

        {error ? (
          <p
            role="alert"
            className="kr-body mx-auto mt-6 flex max-w-[560px] items-start gap-2 rounded-[12px] border border-[rgba(255,140,140,0.28)] bg-[rgba(255,90,90,0.08)] px-4 py-3 text-[12.5px] leading-[1.6] text-[#ffbcbc]"
          >
            <AlertTriangle
              size={14}
              strokeWidth={2}
              className="mt-[3px] shrink-0"
              aria-hidden
            />
            <span>{error}</span>
          </p>
        ) : null}

        <p className="kr-body mt-8 text-center text-[11.5px] leading-[1.6] text-cream/48 md:text-[12px]">
          무료 플랜으로 전체 커리큘럼을 시작할 수 있습니다. 결제 전 가격과 제공 범위를 다시 확인하세요.
        </p>

        {isTossTestMode() ? (
          <p className="kr-body mt-3 text-center text-[11.5px] leading-[1.6] text-neon/70 md:text-[12px]">
            {SHOP_NAME} · 테스트 결제 모드 — 실제로 청구되지 않습니다.
          </p>
        ) : null}
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

function PricingCard({
  plan,
  pending,
  disabled,
  onPaidClick,
}: {
  plan: PricingPlan;
  pending: boolean;
  disabled: boolean;
  onPaidClick: () => void;
}) {
  const isMax = plan.id === 'premium-monthly';

  return (
    <article
      data-pricing-card
      className={cx(
        'flex min-h-[560px] flex-col rounded-[18px] border px-6 py-7 md:px-7 md:py-8',
        isMax
          ? 'border-[rgba(125,216,80,0.36)] bg-[rgba(8,22,42,0.78)] shadow-[0_22px_58px_var(--neon-10)]'
          : 'border-[rgba(239,244,255,0.13)] bg-cream/[0.035]',
      )}
    >
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
        <PricingCTA
          plan={plan}
          pending={pending}
          disabled={disabled}
          onPaidClick={onPaidClick}
        />
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

function PricingCTA({
  plan,
  pending,
  disabled,
  onPaidClick,
}: {
  plan: PricingPlan;
  pending: boolean;
  disabled: boolean;
  onPaidClick: () => void;
}) {
  const isPaid = plan.id !== 'free';
  const isMonthly = plan.id === 'premium-monthly';

  const label = !isPaid
    ? 'QuestDP 사용해 보기'
    : isMonthly
      ? 'Max 시작하기'
      : 'Pro 시작하기';

  const handleClick = () => {
    if (!isPaid) {
      window.location.hash = '/game';
      return;
    }

    onPaidClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending || disabled}
      aria-label={label}
      aria-busy={pending}
      className="kr-body inline-flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-cream px-4 text-[13px] font-bold text-base transition hover:bg-white active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-cream"
    >
      {pending ? (
        <>
          <Loader2
            size={13}
            strokeWidth={2.2}
            className="animate-spin"
            aria-hidden
          />
          <span>결제창 여는 중…</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <ArrowRight size={13} strokeWidth={2} aria-hidden />
        </>
      )}
    </button>
  );
}

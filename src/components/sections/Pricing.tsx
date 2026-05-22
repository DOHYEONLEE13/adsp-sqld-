import {
  ArrowRight,
  Check,
  Copy,
  CreditCard,
  Network,
  Sparkles,
  TicketPercent,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { PRICING_PLANS } from '@/data/pricing';
import { cx } from '@/lib/utils';
import type { PricingPlan } from '@/types/site';

const BETA_COUPON_CODE = 'QDP-BETA-MAY31';

function fallbackCopyText(text: string): boolean {
  if (typeof document === 'undefined') return false;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  } finally {
    document.body.removeChild(textarea);
  }
  return copied;
}

interface PricingProps {
  showIntro?: boolean;
}

export default function Pricing({ showIntro = true }: PricingProps) {
  const [betaModalOpen, setBetaModalOpen] = useState(false);

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
              onPaidClick={() => setBetaModalOpen(true)}
            />
          ))}
        </div>

        <p className="kr-body mt-8 text-center text-[11.5px] leading-[1.6] text-cream/48 md:text-[12px]">
          무료 플랜으로 전체 커리큘럼을 시작할 수 있습니다. 결제 전 가격과 제공 범위를 다시 확인하세요.
        </p>
      </div>

      {betaModalOpen ? (
        <BetaCouponModal onClose={() => setBetaModalOpen(false)} />
      ) : null}
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

function PricingCard({
  plan,
  onPaidClick,
}: {
  plan: PricingPlan;
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
        <PricingCTA plan={plan} onPaidClick={onPaidClick} />
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
  onPaidClick,
}: {
  plan: PricingPlan;
  onPaidClick: () => void;
}) {
  const isPaid = plan.id !== 'free';
  const isMonthly = plan.id === 'premium-monthly';

  const label = !isPaid
    ? 'QuestDP 사용해 보기'
    : isMonthly
      ? 'Max 시작하기'
      : 'Pro 시작하기';

  const handleClick = async () => {
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
      aria-label={label}
      className="kr-body inline-flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-cream px-4 text-[13px] font-bold text-base transition hover:bg-white active:scale-[0.99]"
    >
      <span>{label}</span>
      <ArrowRight size={13} strokeWidth={2} aria-hidden />
    </button>
  );
}

function BetaCouponModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(BETA_COUPON_CODE);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) ok = fallbackCopyText(BETA_COUPON_CODE);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const goRedeem = () => {
    window.location.hash = '/redeem';
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="beta-coupon-title"
    >
      <button
        type="button"
        className="beta-coupon-backdrop absolute inset-0 cursor-default bg-[rgba(1,8,40,0.76)] backdrop-blur-md"
        aria-label="안내 닫기"
        onClick={onClose}
      />

      <div className="beta-coupon-panel relative w-full max-w-[450px] overflow-hidden rounded-[24px] border border-cream/14 bg-[rgb(7,18,36)] text-cream shadow-[0_28px_96px_rgba(0,0,0,0.58)]">
        <div
          aria-hidden
          className="beta-coupon-line absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cream/35 to-transparent"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="안내 닫기"
          className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-cream/10 bg-cream/[0.035] text-cream/62 transition hover:border-cream/20 hover:text-cream"
        >
          <X size={15} strokeWidth={2.2} aria-hidden />
        </button>

        <div className="px-6 pb-5 pt-6">
          <div className="flex items-start gap-3 pr-9">
            <div className="beta-coupon-icon inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-cream/12 bg-cream/[0.045] text-cream/84">
              <CreditCard size={20} strokeWidth={1.9} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="kr-num text-[10px] uppercase tracking-[0.18em] text-cream/45">
                QuestDP Checkout
              </p>
              <h3
                id="beta-coupon-title"
                className="kr-heading mt-1 text-[23px] font-black leading-[1.18] text-cream"
              >
                관심 가져주셔서 감사합니다.
              </h3>
            </div>
          </div>

          <p className="kr-body mt-5 text-[13.5px] leading-[1.72] text-cream/66">
            현재 2026년 5월 31일까지 오픈 베타로 무료 운영 중입니다. 아래 쿠폰 코드를 등록하시면 오픈 베타 무료 이용권을 제공받아 프리미엄 기능을 바로 이용할 수 있습니다.
          </p>
        </div>

        <div className="border-y border-cream/10 bg-cream/[0.025] px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="kr-body text-[13px] font-bold text-cream/88">
                Premium Beta Access
              </p>
              <p className="kr-body mt-1 text-[12px] leading-[1.45] text-cream/48">
                무제한 에너지 · 자유 로드맵 · 모의고사 재시도
              </p>
            </div>
            <div className="kr-heading shrink-0 text-right text-[18px] font-black text-cream">
              ₩0
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">
          <div className="rounded-[16px] border border-cream/12 bg-base/45 p-3.5">
            <div className="mb-3 flex items-center gap-2 text-cream/58">
              <TicketPercent size={14} strokeWidth={2} aria-hidden />
              <p className="kr-num text-[10px] uppercase tracking-[0.18em]">
                Coupon Code
              </p>
            </div>
            <div className="flex items-stretch gap-2">
              <code className="kr-num flex min-w-0 items-center rounded-[12px] border border-cream/10 bg-[rgba(255,255,255,0.035)] px-3 text-[13px] font-black tracking-[0.12em] text-cream">
                {BETA_COUPON_CODE}
              </code>
              <button
                type="button"
                onClick={copyCode}
                className={cx(
                  'kr-body inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-[12px] px-3 text-[12px] font-bold transition active:scale-[0.96]',
                  copied
                    ? 'bg-neon text-base shadow-[0_0_0_4px_var(--neon-12)]'
                    : 'bg-cream text-base hover:bg-white',
                )}
              >
                <Copy
                  size={13}
                  strokeWidth={2.1}
                  aria-hidden
                  className={copied ? 'animate-[coupon-pop_420ms_ease-out]' : undefined}
                />
                {copied ? '복사됨' : '복사'}
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={goRedeem}
              className="kr-body inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-cream px-4 text-[13px] font-black text-base transition hover:bg-white active:scale-[0.99]"
            >
              쿠폰 등록하고 시작
              <ArrowRight size={14} strokeWidth={2.2} aria-hidden />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="kr-body inline-flex h-11 w-full items-center justify-center rounded-[12px] px-4 text-[13px] font-bold text-cream/56 transition hover:text-cream"
            >
              요금제 더 보기
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes coupon-pop {
            0% { transform: scale(0.86) rotate(-7deg); }
            55% { transform: scale(1.14) rotate(5deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          .beta-coupon-backdrop {
            animation: beta-coupon-backdrop-in 220ms ease-out both;
          }
          .beta-coupon-panel {
            transform-origin: 50% 42%;
            animation: beta-coupon-panel-in 420ms cubic-bezier(.16, 1, .3, 1) both;
          }
          .beta-coupon-line {
            transform-origin: center;
            animation: beta-coupon-line-in 520ms 120ms cubic-bezier(.16, 1, .3, 1) both;
          }
          .beta-coupon-icon {
            animation: beta-coupon-icon-in 520ms 150ms cubic-bezier(.18, 1.25, .32, 1) both;
          }
          @keyframes beta-coupon-backdrop-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes beta-coupon-panel-in {
            0% {
              opacity: 0;
              transform: translateY(18px) scale(0.965);
              filter: blur(8px);
            }
            62% {
              opacity: 1;
              transform: translateY(-2px) scale(1.006);
              filter: blur(0);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0);
            }
          }
          @keyframes beta-coupon-line-in {
            from {
              opacity: 0;
              transform: scaleX(0.2);
            }
            to {
              opacity: 1;
              transform: scaleX(1);
            }
          }
          @keyframes beta-coupon-icon-in {
            0% {
              opacity: 0;
              transform: translateY(8px) scale(0.78) rotate(-8deg);
            }
            70% {
              opacity: 1;
              transform: translateY(-1px) scale(1.08) rotate(3deg);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1) rotate(0deg);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .beta-coupon-backdrop,
            .beta-coupon-panel,
            .beta-coupon-line,
            .beta-coupon-icon,
            .beta-coupon-panel * {
              animation-duration: 1ms !important;
              animation-delay: 0ms !important;
              transition-duration: 1ms !important;
            }
          }
        `}
      </style>
    </div>
  );
}

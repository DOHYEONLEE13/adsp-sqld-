import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BadgeCheck, Check, X, Zap } from 'lucide-react';
import {
  PREMIUM_PLAN_EVENT,
  isAppMode,
  requestWebOrAppPremiumPurchase,
} from '@/lib/appMode';
import { useEnergy } from '@/game/energy';

const BENEFITS = [
  '에너지 제한 없이 무제한 학습',
  '챕터·스텝 순차 잠금 없이 자유 진행',
  '오답 복습 · 약점 집중 무제한',
];

export default function PremiumPlanModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(PREMIUM_PLAN_EVENT, show);
    return () => window.removeEventListener(PREMIUM_PLAN_EVENT, show);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-plan-title"
      className="fixed inset-0 z-[75] flex items-start justify-center overflow-y-auto px-5 py-8 text-cream"
      style={{
        background: 'rgba(2,8,22,0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-[430px] pb-[env(safe-area-inset-bottom)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={() => setOpen(false)}
          className="absolute left-0 top-0 inline-flex h-11 w-11 items-center justify-center rounded-full text-cream/78 transition hover:text-cream"
        >
          <X size={28} strokeWidth={2.1} />
        </button>

        <header className="px-2 pt-16 text-center">
          <h2
            id="premium-plan-title"
            className="kr-heading text-[26px] font-black leading-[1.18] text-cream"
          >
            퀘스트디피 더 이용하기
          </h2>
          <p className="kr-body mt-4 text-[14px] font-semibold leading-[1.45] text-cream/72">
            MAX 플랜으로 제한 없이 학습하세요
          </p>
        </header>

        <PremiumPlanPanel
          onPurchased={() => setOpen(false)}
          onRedeem={() => {
            setOpen(false);
            window.location.hash = '/redeem';
          }}
        />
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export function PremiumPlanPanel({
  embedded = false,
  onPurchased,
  onRedeem,
}: {
  embedded?: boolean;
  onPurchased?: () => void;
  onRedeem?: () => void;
}) {
  const energy = useEnergy();
  const [purchasing, setPurchasing] = useState(false);
  const alreadyPremium = energy.isPremium || energy.isAdmin;
  const appMode = isAppMode();

  return (
    <section
      className={`relative overflow-hidden ${embedded ? 'rounded-[22px]' : 'mt-12 rounded-[28px]'}`}
      style={{
        background:
          'radial-gradient(130% 70% at 50% 0%, rgba(103,232,249,0.06), transparent 58%), linear-gradient(180deg, rgba(239,244,255,0.07), rgba(239,244,255,0.035))',
        border: '1px solid rgba(239,244,255,0.15)',
        boxShadow: embedded
          ? 'inset 0 1px 0 rgba(255,255,255,0.09)'
          : '0 26px 70px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.09)',
      }}
    >
      {/* 상단 오로라 헤어라인 — 유일한 장식 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(103,232,249,0.6) 24%, rgba(192,132,252,0.55) 58%, rgba(167,233,106,0.4) 84%, transparent)',
        }}
      />

      <div className={`relative ${embedded ? 'p-5' : 'p-6'}`}>
        <div className="flex items-center justify-between gap-3">
          <span
            className="kr-num inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cream/75"
            style={{
              background: 'rgba(239,244,255,0.06)',
              border: '1px solid rgba(239,244,255,0.16)',
            }}
          >
            <Zap size={11} strokeWidth={2.6} className="text-[#9beefb]" />
            MAX PLAN
          </span>
          {alreadyPremium ? (
            <span
              className="kr-num inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em]"
              style={{
                color: '#b9e99b',
                background: 'rgba(125,216,80,0.12)',
                border: '1px solid rgba(125,216,80,0.35)',
              }}
            >
              <BadgeCheck size={11} strokeWidth={2.6} />
              이용 중
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-end justify-between gap-5">
          <div className="min-w-0">
            <p className="kr-heading text-[27px] font-black leading-none text-cream">
              MAX
            </p>
            <p className="kr-body mt-2.5 text-[12.5px] font-semibold leading-[1.45] text-cream/70">
              에너지 걱정 없이, 막히는 잠금 없이 학습을 진행해요.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="kr-num text-[25px] font-black leading-none text-cream">
              ₩9,900
              <span className="kr-body ml-1 text-[12px] font-bold text-cream/55">/월</span>
            </p>
            <p className="kr-body mt-1.5 text-[11.5px] font-semibold text-cream/50">
              월간 구독
            </p>
          </div>
        </div>

        {alreadyPremium ? (
          <div
            className="mt-5 flex items-start gap-2.5 rounded-[18px] px-4 py-3.5"
            style={{
              background: 'rgba(239,244,255,0.05)',
              border: '1px solid rgba(239,244,255,0.14)',
            }}
          >
            <BadgeCheck
              size={17}
              strokeWidth={2.4}
              className="mt-0.5 shrink-0 text-[#7DD850]"
            />
            <div>
              <p className="kr-body text-[13.5px] font-black text-cream">
                지금 MAX 플랜 이용 중이에요
              </p>
              <p className="kr-body mt-0.5 text-[11.5px] font-semibold leading-[1.5] text-cream/60">
                에너지 무제한과 자유 진행이 적용되고 있어요.
              </p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={purchasing}
            onClick={async () => {
              setPurchasing(true);
              try {
                await requestWebOrAppPremiumPurchase();
                onPurchased?.();
              } finally {
                setPurchasing(false);
              }
            }}
            className="kr-body mt-5 h-12 w-full rounded-full bg-cream text-[14px] font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              color: '#0a1638',
              boxShadow:
                '0 14px 30px -18px rgba(239,244,255,0.45), inset 0 -4px 10px rgba(1,8,40,0.12)',
            }}
          >
            {purchasing
              ? '결제창 여는 중'
              : appMode
                ? 'MAX 플랜 구매하기'
                : '요금제·쿠폰 안내 보기'}
          </button>
        )}
      </div>

      <div
        className={`relative ${embedded ? 'px-5 pb-6 pt-5' : 'px-6 pb-7 pt-5'}`}
        style={{ borderTop: '1px solid rgba(239,244,255,0.1)' }}
      >
        <p className="kr-num text-[10px] font-black uppercase tracking-[0.18em] text-cream/45">
          무료 플랜에서 추가되는 것
        </p>
        <ul className="mt-3.5 space-y-2.5">
          {BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className="kr-body flex items-start gap-2.5 text-[12.5px] font-semibold leading-[1.45] text-cream/78"
            >
              <span
                className="mt-[1px] grid h-5 w-5 shrink-0 place-items-center rounded-[7px]"
                style={{
                  background: 'rgba(103,232,249,0.08)',
                  border: '1px solid rgba(103,232,249,0.26)',
                }}
              >
                <Check size={12} strokeWidth={3} className="text-[#9beefb]" />
              </span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => {
            if (onRedeem) {
              onRedeem();
              return;
            }
            window.location.hash = '/redeem';
          }}
          className="kr-body mt-5 text-[12px] font-semibold text-cream/55 underline underline-offset-4 transition hover:text-cream"
        >
          쿠폰 코드가 있어요
        </button>
      </div>
    </section>
  );
}

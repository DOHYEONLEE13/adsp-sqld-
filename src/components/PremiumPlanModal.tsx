import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import {
  PREMIUM_PLAN_EVENT,
  requestWebOrAppPremiumPurchase,
} from '@/lib/appMode';
import { useEnergy } from '@/game/energy';

const BENEFITS = [
  '무료 플랜의 모든 기능',
  '에너지 제한 없이 무제한 학습',
  '챕터와 스텝 자유 진행',
  '오답 복습과 약점 집중 무제한',
];

export default function PremiumPlanModal() {
  const energy = useEnergy();
  const [open, setOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

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

  const alreadyPremium = energy.isPremium || energy.isAdmin;

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
      onClick={() => {
        if (!purchasing) setOpen(false);
      }}
    >
      <div
        className="relative w-full max-w-[430px] pb-[env(safe-area-inset-bottom)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={() => setOpen(false)}
          disabled={purchasing}
          className="absolute left-0 top-0 inline-flex h-11 w-11 items-center justify-center rounded-full text-cream/78 transition hover:text-cream disabled:opacity-45"
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

        <section
          className="mt-12 overflow-hidden rounded-[28px]"
          style={{
            background:
              'linear-gradient(180deg, rgba(239,244,255,0.09), rgba(239,244,255,0.045))',
            border: '1px solid rgba(239,244,255,0.14)',
            boxShadow:
              '0 26px 70px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          <div className="p-6">
            <div className="flex items-end justify-between gap-5">
              <div className="min-w-0">
                <p className="kr-num text-[10px] font-bold uppercase tracking-[0.18em] text-cream/45">
                  MAX PLAN
                </p>
                <p className="kr-heading mt-2 text-[25px] font-black leading-none text-cream">
                  MAX
                </p>
                <p className="kr-body mt-2.5 text-[12.5px] font-semibold leading-[1.45] text-cream/68">
                  에너지 제한 없이 모든 학습을 진행
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="kr-num text-[24px] font-black leading-none text-cream">
                  ₩9,900
                </p>
                <p className="kr-body mt-1.5 text-[12px] font-semibold text-cream/52">
                  월간 구독
                </p>
              </div>
            </div>

            <div className="mt-5 h-px w-full bg-cream/10" />
            <p className="kr-body mt-4 text-[12px] font-semibold leading-[1.55] text-cream/52">
              Google Play 월 정기 결제로 안전하게 처리됩니다.
            </p>

            <button
              type="button"
              disabled={alreadyPremium || purchasing}
              onClick={async () => {
                setPurchasing(true);
                try {
                  await requestWebOrAppPremiumPurchase();
                  setOpen(false);
                } finally {
                  setPurchasing(false);
                }
              }}
              className="kr-body mt-5 h-12 w-full rounded-full bg-cream text-[14px] font-black text-base transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {alreadyPremium
                ? '이미 MAX 플랜 사용 중'
                : purchasing
                  ? '결제창 여는 중'
                  : 'MAX 플랜 구매하기'}
            </button>
          </div>

          <div
            className="px-6 pb-7 pt-5"
            style={{ borderTop: '1px solid rgba(239,244,255,0.10)' }}
          >
            <p className="kr-body text-[12.5px] font-black text-cream/76">
              무료 플랜의 모든 기능에 다음 기능 추가:
            </p>
            <ul className="mt-4 space-y-3">
              {BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="kr-body flex items-start gap-2.5 text-[12.5px] leading-[1.45] text-cream/64"
                >
                  <Check
                    size={15}
                    strokeWidth={2.4}
                    className="mt-0.5 shrink-0 text-cream/50"
                  />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                window.location.hash = '/redeem';
              }}
              className="kr-body mt-6 text-[12px] font-semibold text-cream/52 underline underline-offset-4 transition hover:text-cream"
            >
              쿠폰 코드가 있어요
            </button>
          </div>
        </section>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

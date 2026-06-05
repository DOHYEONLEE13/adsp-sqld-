import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

const BILLING_EVENT = 'questdp:app-billing-request';

interface BillingNoticeState {
  ok: boolean;
  message: string;
  expiresAt?: string;
}

export default function AppBillingNotice() {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<BillingNoticeState>({
    ok: false,
    message:
      'Google Play 앱에서는 프리미엄 구매가 Google Play 결제로 연결되어야 해요.',
  });

  useEffect(() => {
    const show = (event: Event) => {
      const detail = (event as CustomEvent<Partial<BillingNoticeState>>).detail;
      setNotice({
        ok: detail?.ok === true,
        message:
          detail?.message ||
          'Google Play 결제를 사용할 수 없어요. 잠시 후 다시 시도해 주세요.',
        expiresAt: detail?.expiresAt,
      });
      setOpen(true);
    };
    window.addEventListener(BILLING_EVENT, show);
    return () => window.removeEventListener(BILLING_EVENT, show);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-billing-title"
      className="fixed inset-0 z-[80] flex items-center justify-center px-5"
      style={{ background: 'rgba(1,8,40,0.78)', backdropFilter: 'blur(8px)' }}
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-[360px] rounded-[24px] border border-cream/14 bg-[rgb(9,20,38)] p-6 text-cream shadow-[0_24px_70px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-cream/[0.06] text-cream/64 transition hover:text-cream"
        >
          <X size={15} strokeWidth={2.2} />
        </button>

        <p className="kr-num text-[10px] uppercase tracking-[0.2em] text-cream/45">
          Google Play Billing
        </p>
        {notice.ok ? (
          <div className="mt-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(125,216,80,0.14)] text-[var(--cta-primary)]">
            <CheckCircle2 size={22} strokeWidth={2.4} />
          </div>
        ) : null}
        <h2
          id="app-billing-title"
          className="kr-heading mt-2 pr-8 text-[21px] font-black leading-[1.25] text-cream"
        >
          {notice.ok ? '프리미엄이 활성화됐어요' : '앱 결제를 확인해 주세요'}
        </h2>
        <p className="kr-body mt-4 text-[13px] leading-[1.65] text-cream/68">
          {notice.message}
        </p>
        {notice.expiresAt ? (
          <p className="kr-body mt-3 text-[12.5px] leading-[1.6] text-cream/52">
            만료 예정: {new Date(notice.expiresAt).toLocaleDateString('ko-KR')}
          </p>
        ) : (
          <p className="kr-body mt-3 text-[12.5px] leading-[1.6] text-cream/52">
            이미 쿠폰을 받은 경우에는 쿠폰 등록으로 프리미엄 기능을 사용할 수 있어요.
          </p>
        )}

        <div className="mt-5 flex flex-col gap-2">
          {!notice.ok ? (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                window.location.hash = '/redeem';
              }}
              className="kr-body h-11 rounded-full bg-cream text-[13px] font-bold text-base transition active:scale-[0.98]"
            >
              쿠폰 등록하기
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="kr-body h-10 rounded-full border border-cream/12 bg-cream/[0.05] text-[12.5px] font-bold text-cream/72 transition active:scale-[0.98]"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

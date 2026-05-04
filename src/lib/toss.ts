/**
 * toss.ts — 토스 페이먼츠 결제 플로우 wrapper.
 *
 * 환경변수:
 *   - VITE_TOSS_CLIENT_KEY: 토스 client key (공개 안전). test_ck_* / live_ck_*
 *
 * 흐름:
 *   1. 사용자가 Pricing CTA 클릭 → requestPayment(productCode, amount)
 *   2. 토스 결제창 popup → 사용자 결제 진행
 *   3. 성공 시 successUrl (= /payment/callback?paymentKey=...&orderId=...&amount=...) 으로 redirect
 *   4. PaymentCallbackPage 가 Edge Function `toss-confirm` 호출 → 서버 검증 → premium 부여
 *
 * 멱등 / 재처리:
 *   - orderId 는 매 결제마다 unique (uuid v4)
 *   - localStorage 에 productCode 저장 (callback 페이지가 검증용으로 읽음)
 */

import { loadTossPayments } from '@tosspayments/payment-sdk';

const CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY as string | undefined;

export type ProductCode = 'lifetime' | 'weekly' | 'monthly';

export const PRODUCT_LABELS: Record<ProductCode, string> = {
  lifetime: 'QuestDP 평생 이용권',
  weekly: 'QuestDP 1주 이용권',
  monthly: 'QuestDP 월 구독',
};

export const PRODUCT_AMOUNTS: Record<ProductCode, number> = {
  lifetime: 99000, // 평생권 가격 (필요 시 조정)
  weekly: 4900,
  monthly: 9900,
};

/** 환경에 토스 키가 설정돼 있는지. 미설정 시 결제 CTA 비활성화. */
export function isTossConfigured(): boolean {
  return Boolean(CLIENT_KEY && CLIENT_KEY.startsWith('test_ck_') || CLIENT_KEY?.startsWith('live_ck_'));
}

/** 결제 요청 시 sessionStorage 에 보관 — callback 페이지가 검증·복원에 사용. */
const PENDING_KEY = 'questdp.toss.pending';

interface PendingPayment {
  orderId: string;
  productCode: ProductCode;
  amount: number;
  startedAt: number;
}

export function getPendingPayment(): PendingPayment | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as PendingPayment;
    if (!obj?.orderId || !obj?.productCode) return null;
    // 1시간 이상 오래된 pending 은 폐기 (사용자가 결제창 띄우고 잊어버린 케이스)
    if (Date.now() - obj.startedAt > 60 * 60 * 1000) {
      clearPendingPayment();
      return null;
    }
    return obj;
  } catch {
    return null;
  }
}

export function clearPendingPayment(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* 무시 */
  }
}

function savePendingPayment(p: PendingPayment): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(p));
  } catch {
    /* quota — 무시 */
  }
}

/** uuid v4 ish. crypto.randomUUID 사용 가능하면 그것, 아니면 폴백. */
function generateOrderId(productCode: ProductCode): string {
  const stamp = Date.now().toString(36);
  const random =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `qdp-${productCode}-${stamp}-${random}`;
}

interface RequestOpts {
  productCode: ProductCode;
  customerEmail: string;
  customerName: string; // 표시용 — 토스 결제창에 노출
}

/**
 * 토스 결제창 호출. 성공 시 토스가 successUrl 로 redirect (현재 창 이동).
 *
 * 호출 측은 이 함수가 resolve 하지 않을 것이라 가정해야 함 (redirect 발생).
 * 실패만 throw. catch 측이 사용자에게 안내.
 */
export async function requestPayment(opts: RequestOpts): Promise<void> {
  if (!CLIENT_KEY) {
    throw new Error('toss-client-key-missing');
  }
  const { productCode, customerEmail, customerName } = opts;
  const amount = PRODUCT_AMOUNTS[productCode];
  const orderId = generateOrderId(productCode);

  // 결제 진행 컨텍스트 저장 — callback 에서 amount/productCode 검증
  savePendingPayment({
    orderId,
    productCode,
    amount,
    startedAt: Date.now(),
  });

  const tp = await loadTossPayments(CLIENT_KEY);

  // successUrl / failUrl — origin 기반 절대 URL (해시 라우터 호환).
  const origin =
    typeof window !== 'undefined' ? window.location.origin : '';
  const successUrl = `${origin}/#/payment/callback`;
  const failUrl = `${origin}/#/payment/callback?status=fail`;

  // requestPayment 는 redirect 또는 throw — Promise resolve 되지 않음.
  await tp.requestPayment('카드', {
    amount,
    orderId,
    orderName: PRODUCT_LABELS[productCode],
    customerEmail,
    customerName: customerName || '게스트',
    successUrl,
    failUrl,
  });
}

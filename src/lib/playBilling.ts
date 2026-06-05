import { getSupabase } from '@/lib/supabase';
import { refreshEnergy } from '@/game/energy';
import type { SupabaseClient } from '@supabase/supabase-js';

const PLAY_BILLING_METHOD = 'https://play.google.com/billing';
const PLAY_PREMIUM_PRODUCT_ID =
  (import.meta.env.VITE_PLAY_BILLING_SUBSCRIPTION_ID as string | undefined)?.trim() ||
  'questdp_premium';

export interface PlayBillingResult {
  ok: boolean;
  reason?:
    | 'unsupported'
    | 'unauthenticated'
    | 'cancelled'
    | 'missing-token'
    | 'backend'
    | 'error';
  message: string;
  productId?: string;
  expiresAt?: string;
}

interface ConfirmResponse {
  ok?: boolean;
  error?: string;
  productId?: string;
  expiresAt?: string;
}

export async function requestPlayPremiumSubscription(): Promise<PlayBillingResult> {
  if (typeof window === 'undefined') {
    return {
      ok: false,
      reason: 'unsupported',
      message: 'Google Play 결제는 Android 앱 안에서만 사용할 수 있어요.',
    };
  }

  const sb = getSupabase();
  if (!sb) {
    return {
      ok: false,
      reason: 'backend',
      message: 'Supabase 설정이 없어 결제를 확인할 수 없어요.',
    };
  }

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) {
    return {
      ok: false,
      reason: 'unauthenticated',
      message: '구매 전에 먼저 로그인해 주세요.',
    };
  }

  if (!window.getDigitalGoodsService || typeof PaymentRequest === 'undefined') {
    return {
      ok: false,
      reason: 'unsupported',
      message: '현재 실행 환경에서 Google Play Billing을 사용할 수 없어요.',
    };
  }

  let service: DigitalGoodsService;
  try {
    service = await window.getDigitalGoodsService(PLAY_BILLING_METHOD);
  } catch {
    return {
      ok: false,
      reason: 'unsupported',
      message: 'Google Play Billing 서비스에 연결할 수 없어요. Play 스토어에서 설치한 앱인지 확인해 주세요.',
    };
  }

  const details = await loadSkuDetails(service, PLAY_PREMIUM_PRODUCT_ID);
  const ownedPurchaseToken = await findOwnedPurchaseToken(
    service,
    PLAY_PREMIUM_PRODUCT_ID,
  );
  if (ownedPurchaseToken) {
    const restored = await confirmPlayPurchase(
      sb,
      PLAY_PREMIUM_PRODUCT_ID,
      ownedPurchaseToken,
    );
    if (restored.ok) {
      void refreshEnergy();
      return {
        ok: true,
        message: '기존 Google Play 구독을 확인해 프리미엄을 활성화했어요.',
        productId: restored.productId || PLAY_PREMIUM_PRODUCT_ID,
        expiresAt: restored.expiresAt,
      };
    }
  }

  const request = new PaymentRequest(
    [
      {
        supportedMethods: PLAY_BILLING_METHOD,
        data: { sku: PLAY_PREMIUM_PRODUCT_ID },
      },
    ],
    {
      total: {
        label: details?.title || 'Total',
        amount: {
          currency: 'USD',
          value: '0',
        },
      },
    },
  );

  let response: PaymentResponse;
  try {
    response = await request.show();
  } catch (error) {
    const name = error instanceof DOMException ? error.name : '';
    const detailMessage = error instanceof Error ? error.message : '';
    return {
      ok: false,
      reason: name === 'AbortError' ? 'cancelled' : 'error',
      message:
        name === 'AbortError'
          ? '구매가 취소됐어요.'
          : detailMessage
            ? `Google Play 결제창을 열지 못했어요. (${name || 'Error'}: ${detailMessage})`
            : 'Google Play 결제창을 열지 못했어요.',
    };
  }

  const purchaseToken = extractPurchaseToken(response.details);
  if (!purchaseToken) {
    await completePayment(response, 'fail');
    return {
      ok: false,
      reason: 'missing-token',
      message: '구매 토큰을 받지 못했어요. 다시 시도해 주세요.',
    };
  }

  const confirmed = await confirmPlayPurchase(
    sb,
    PLAY_PREMIUM_PRODUCT_ID,
    purchaseToken,
  );

  if (!confirmed.ok) {
    await completePayment(response, 'fail');
    return {
      ok: false,
      reason: 'backend',
      message: confirmed.error || '구매 검증에 실패했어요.',
    };
  }

  await completePayment(response, 'success');
  void refreshEnergy();

  return {
    ok: true,
    message: '프리미엄이 활성화됐어요.',
    productId: confirmed.productId || PLAY_PREMIUM_PRODUCT_ID,
    expiresAt: confirmed.expiresAt,
  };
}

async function loadSkuDetails(
  service: DigitalGoodsService,
  productId: string,
): Promise<DigitalGoodsItemDetails | null> {
  try {
    const details = await service.getDetails([productId]);
    return details.find((item) => item.itemId === productId) ?? details[0] ?? null;
  } catch {
    return null;
  }
}

async function findOwnedPurchaseToken(
  service: DigitalGoodsService,
  productId: string,
): Promise<string | null> {
  try {
    const purchases = await service.listPurchases();
    const match = purchases.find((purchase) => purchase.itemId === productId);
    return match?.purchaseToken ?? null;
  } catch {
    return null;
  }
}

async function confirmPlayPurchase(
  sb: SupabaseClient,
  productId: string,
  purchaseToken: string,
): Promise<ConfirmResponse> {
  const { data, error } = await sb.functions.invoke<ConfirmResponse>(
    'google-play-confirm',
    {
      body: {
        productId,
        purchaseToken,
      },
    },
  );
  if (error || !data?.ok) {
    return {
      ok: false,
      error: data?.error || error?.message || '구매 검증에 실패했어요.',
    };
  }
  return data;
}

function extractPurchaseToken(details: unknown): string | null {
  if (!details || typeof details !== 'object') return null;
  const record = details as Record<string, unknown>;
  const token =
    record.purchaseToken ||
    record.purchase_token ||
    record.token ||
    record.purchaseTokenString;
  return typeof token === 'string' && token.trim() ? token.trim() : null;
}

async function completePayment(
  response: PaymentResponse,
  result: 'success' | 'fail',
): Promise<void> {
  try {
    await response.complete(result);
  } catch {
    // Browser UI completion is best-effort; backend verification already decided.
  }
}

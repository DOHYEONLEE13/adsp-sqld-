// Google Play Billing confirmation endpoint for the TWA app.
// Requires a valid Supabase JWT and a service account with Android Publisher API access.

// @ts-expect-error Deno runtime, esm.sh import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// @ts-expect-error Deno global
const Deno = globalThis.Deno;

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const ANDROID_PUBLISHER_SCOPE = 'https://www.googleapis.com/auth/androidpublisher';
const DEFAULT_PACKAGE_NAME = 'com.questdp.app';
const DEFAULT_PRODUCT_ID = 'questdp_premium';
const DEFAULT_AMOUNT_KRW = 9900;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ConfirmInput {
  productId: string;
  purchaseToken: string;
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

interface SubscriptionLineItem {
  productId?: string;
  expiryTime?: string;
  latestSuccessfulOrderId?: string;
}

interface SubscriptionPurchaseV2 {
  subscriptionState?: string;
  acknowledgementState?: string;
  latestOrderId?: string;
  lineItems?: SubscriptionLineItem[];
  testPurchase?: Record<string, never>;
  [key: string]: unknown;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return json({ ok: true });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
  if (!jwt) {
    return json({ error: 'unauthorized: missing JWT' }, 401);
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const serviceAccountJson = Deno.env.get('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON');
  const packageName =
    Deno.env.get('PLAY_BILLING_PACKAGE_NAME') || DEFAULT_PACKAGE_NAME;
  const allowedProducts = parseAllowedProducts(
    Deno.env.get('PLAY_BILLING_PRODUCT_IDS') || DEFAULT_PRODUCT_ID,
  );
  const amountKrw = Number(
    Deno.env.get('PLAY_BILLING_AMOUNT_KRW') || DEFAULT_AMOUNT_KRW,
  );

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return json({ error: 'server misconfigured: supabase env missing' }, 500);
  }
  if (!serviceAccountJson) {
    return json(
      { error: 'server misconfigured: GOOGLE_PLAY_SERVICE_ACCOUNT_JSON missing' },
      500,
    );
  }
  if (!Number.isFinite(amountKrw) || amountKrw < 0) {
    return json({ error: 'server misconfigured: invalid Play amount' }, 500);
  }

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser(jwt);
  if (userErr || !user) {
    return json({ error: 'unauthorized: invalid JWT' }, 401);
  }

  let body: ConfirmInput;
  try {
    body = (await req.json()) as ConfirmInput;
  } catch {
    return json({ error: 'bad request: invalid JSON' }, 400);
  }

  const productId = body.productId?.trim();
  const purchaseToken = body.purchaseToken?.trim();
  if (!productId || !purchaseToken) {
    return json({ error: 'bad request: missing productId or purchaseToken' }, 400);
  }
  if (!allowedProducts.has(productId)) {
    return json({ error: `bad request: unknown productId ${productId}` }, 400);
  }

  let serviceAccount: ServiceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
  } catch {
    return json({ error: 'server misconfigured: invalid service account JSON' }, 500);
  }
  if (!serviceAccount.client_email || !serviceAccount.private_key) {
    return json({ error: 'server misconfigured: service account fields missing' }, 500);
  }

  let accessToken: string;
  let purchase: SubscriptionPurchaseV2;
  try {
    accessToken = await getGoogleAccessToken(serviceAccount);
    purchase = await getSubscriptionPurchase({
      accessToken,
      packageName,
      purchaseToken,
    });
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Google Play purchase verification failed',
      },
      400,
    );
  }

  const lineItem =
    purchase.lineItems?.find((item) => item.productId === productId) ??
    purchase.lineItems?.[0];
  if (!lineItem || lineItem.productId !== productId) {
    return json({ error: 'purchase product mismatch' }, 400);
  }

  const expiresAt = lineItem.expiryTime;
  if (!expiresAt || Date.parse(expiresAt) <= Date.now()) {
    return json({ error: 'subscription is expired or has no expiryTime' }, 400);
  }

  const activeStates = new Set([
    'SUBSCRIPTION_STATE_ACTIVE',
    'SUBSCRIPTION_STATE_IN_GRACE_PERIOD',
    'SUBSCRIPTION_STATE_CANCELED',
  ]);
  if (!purchase.subscriptionState || !activeStates.has(purchase.subscriptionState)) {
    return json(
      { error: `subscription is not active: ${purchase.subscriptionState}` },
      400,
    );
  }

  if (purchase.acknowledgementState === 'ACKNOWLEDGEMENT_STATE_PENDING') {
    try {
      await acknowledgeSubscription({
        accessToken,
        packageName,
        productId,
        purchaseToken,
        userId: user.id,
      });
    } catch (error) {
      return json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Google Play acknowledge failed',
        },
        400,
      );
    }
  }

  const orderId =
    lineItem.latestSuccessfulOrderId || purchase.latestOrderId || null;
  const { error: rpcErr } = await sb.rpc('grant_premium_from_google_play', {
    p_user_id: user.id,
    p_purchase_token: purchaseToken,
    p_order_id: orderId,
    p_amount_krw: amountKrw,
    p_product_code: productId,
    p_expires_at: expiresAt,
    p_raw: purchase,
  });
  if (rpcErr) {
    return json({ error: `db rpc failed: ${rpcErr.message}` }, 500);
  }

  return json({
    ok: true,
    productId,
    expiresAt,
    orderId,
    subscriptionState: purchase.subscriptionState,
    testPurchase: Boolean(purchase.testPurchase),
  });
});

function parseAllowedProducts(raw: string): Set<string> {
  const products = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return new Set(products.length ? products : [DEFAULT_PRODUCT_ID]);
}

async function getGoogleAccessToken(account: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: account.client_email,
    scope: ANDROID_PUBLISHER_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };
  const unsignedJwt = `${base64UrlJson(header)}.${base64UrlJson(claim)}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(account.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsignedJwt),
  );
  const assertion = `${unsignedJwt}.${base64UrlBytes(new Uint8Array(signature))}`;

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const tokenData = (await tokenRes.json().catch(() => ({}))) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(
      tokenData.error_description ||
        tokenData.error ||
        `Google OAuth token failed: ${tokenRes.status}`,
    );
  }
  return tokenData.access_token;
}

async function getSubscriptionPurchase(args: {
  accessToken: string;
  packageName: string;
  purchaseToken: string;
}): Promise<SubscriptionPurchaseV2> {
  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/` +
    `${encodeURIComponent(args.packageName)}/purchases/subscriptionsv2/tokens/` +
    `${encodeURIComponent(args.purchaseToken)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${args.accessToken}` },
  });
  const data = (await res.json().catch(() => ({}))) as SubscriptionPurchaseV2 & {
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(data.error?.message || `Play subscription lookup failed: ${res.status}`);
  }
  return data;
}

async function acknowledgeSubscription(args: {
  accessToken: string;
  packageName: string;
  productId: string;
  purchaseToken: string;
  userId: string;
}): Promise<void> {
  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/` +
    `${encodeURIComponent(args.packageName)}/purchases/subscriptions/` +
    `${encodeURIComponent(args.productId)}/tokens/` +
    `${encodeURIComponent(args.purchaseToken)}:acknowledge`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${args.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ developerPayload: `questdp:${args.userId}` }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(data.error?.message || `Play acknowledge failed: ${res.status}`);
  }
}

function base64UrlJson(value: unknown): string {
  return base64UrlBytes(new TextEncoder().encode(JSON.stringify(value)));
}

function base64UrlBytes(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

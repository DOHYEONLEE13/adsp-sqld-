// supabase/functions/toss-confirm/index.ts
// Toss Payments confirm endpoint. Requires a valid Supabase JWT and service role env.

// @ts-expect-error Deno runtime, esm.sh import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// @ts-expect-error Deno global
const Deno = globalThis.Deno;

const TOSS_API = 'https://api.tosspayments.com/v1/payments/confirm';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ConfirmInput {
  paymentKey: string;
  orderId: string;
  amount: number;
  productCode: 'lifetime' | 'weekly' | 'monthly';
}

const ALLOWED_PRODUCTS = new Set(['lifetime', 'weekly', 'monthly']);
const PRODUCT_AMOUNTS: Record<string, number> = {
  lifetime: 99000,
  weekly: 4900,
  monthly: 9900,
};

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
  const TOSS_SECRET_KEY = Deno.env.get('TOSS_SECRET_KEY');
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return json({ error: 'server misconfigured: supabase env missing' }, 500);
  }
  if (!TOSS_SECRET_KEY) {
    return json({ error: 'server misconfigured: TOSS_SECRET_KEY missing' }, 500);
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

  const { paymentKey, orderId, amount, productCode } = body;
  if (!paymentKey || !orderId || !Number.isFinite(amount) || !productCode) {
    return json({ error: 'bad request: missing fields' }, 400);
  }
  if (!ALLOWED_PRODUCTS.has(productCode)) {
    return json({ error: `bad request: unknown productCode ${productCode}` }, 400);
  }

  const expected = PRODUCT_AMOUNTS[productCode];
  if (amount !== expected) {
    return json(
      { error: `amount mismatch: expected ${expected}, got ${amount}` },
      400,
    );
  }

  const auth = `Basic ${btoa(`${TOSS_SECRET_KEY}:`)}`;
  const tossRes = await fetch(TOSS_API, {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  if (!tossRes.ok) {
    const errBody = await tossRes.json().catch(() => ({ message: 'unknown' }));
    return json(
      {
        error: `toss confirm failed: ${errBody.message || tossRes.statusText}`,
        code: errBody.code,
      },
      400,
    );
  }

  const tossData = (await tossRes.json()) as {
    status?: string;
    totalAmount?: number;
    [key: string]: unknown;
  };

  if (tossData.status !== 'DONE') {
    return json(
      { error: `toss confirm not DONE: status=${tossData.status}` },
      400,
    );
  }
  if (tossData.totalAmount !== amount) {
    return json(
      {
        error: `toss totalAmount mismatch: expected ${amount}, got ${tossData.totalAmount}`,
      },
      400,
    );
  }

  const { error: rpcErr } = await sb.rpc('grant_premium_from_payment', {
    p_user_id: user.id,
    p_pg_payment_key: paymentKey,
    p_pg_order_id: orderId,
    p_amount_krw: amount,
    p_product_code: productCode,
    p_raw: tossData,
  });
  if (rpcErr) {
    return json({ error: `db rpc failed: ${rpcErr.message}` }, 500);
  }

  return json({ ok: true, productCode, amount });
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

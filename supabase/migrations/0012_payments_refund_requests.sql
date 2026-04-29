-- 0012 — payments + refund_requests 스켈레톤.
--
-- 가맹점 통과 + Toss API 키 발급 전 단계: 테이블 + RLS 만 미리 만들어두고,
-- 실제 결제 webhook · 환불 자동화는 가맹점 활성 후 별도 마이그·Edge Function 으로.
--
-- 지금 시점에 사용:
--   - refund_requests: 환불 요청 폼이 (인증된 사용자) DB 에 row 남김
--   - payments: 향후 Toss webhook → insert 자리. 지금은 비어 있음.
--
-- 나중 (Toss 연동 후) 추가될 것:
--   - Toss webhook → payments insert
--   - refund_requests.status='pending' → Edge Function 이 Toss /cancel 호출
--   - 자동 환불 성공 시 status='refunded', refunded_at 채움 + premium_grants revoked

begin;

-- ── payments — 결제 이력 ───────────────────────────────────────────────────
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,

  -- Toss / Stripe 같은 PG 식별자
  pg_provider text not null default 'toss'
    check (pg_provider in ('toss','stripe','manual')),
  pg_payment_key text,                    -- Toss paymentKey (UNIQUE)
  pg_order_id text,                       -- Toss orderId (UNIQUE)

  amount_krw integer not null check (amount_krw >= 0),
  product_code text not null,             -- 'premium_monthly' 등
  status text not null default 'paid'
    check (status in ('paid','refunded','partial_refund','failed')),

  paid_at timestamptz not null default now(),
  refunded_at timestamptz,                -- 부분 또는 전체 환불 완료 시점
  raw jsonb,                              -- PG 원본 응답 보존 (debug)

  created_at timestamptz not null default now()
);

create unique index if not exists payments_pg_payment_key_uniq
  on public.payments(pg_payment_key)
  where pg_payment_key is not null;

create unique index if not exists payments_pg_order_id_uniq
  on public.payments(pg_order_id)
  where pg_order_id is not null;

create index if not exists payments_user_paid_idx
  on public.payments(user_id, paid_at desc);

-- ── refund_requests — 사용자 환불 요청 큐 ─────────────────────────────────
create table if not exists public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete set null,
  payment_id uuid references public.payments on delete set null,

  contact_email text not null,
  paid_date date,                         -- 사용자 입력 (payment_id 자동 매칭 전)
  reason text,
  eligibility text not null
    check (eligibility in ('within7','after7','unknown')),

  status text not null default 'pending'
    check (status in ('pending','approved','rejected','refunded','cancelled')),
  admin_note text,

  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists refund_requests_user_idx
  on public.refund_requests(user_id, created_at desc);
create index if not exists refund_requests_pending_idx
  on public.refund_requests(status)
  where status = 'pending';

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table public.payments         enable row level security;
alter table public.refund_requests  enable row level security;

-- payments: 본인 read 만. 쓰기는 webhook (service_role) 만.
create policy payments_self_read on public.payments
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy payments_admin_read on public.payments
  for select to authenticated
  using (
    exists (select 1 from public.profiles me
            where me.id = (select auth.uid()) and me.role = 'admin')
  );

-- refund_requests: 본인 insert + read. 운영자가 update (status 변경).
create policy refund_requests_self_insert on public.refund_requests
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy refund_requests_self_read on public.refund_requests
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy refund_requests_admin_read on public.refund_requests
  for select to authenticated
  using (
    exists (select 1 from public.profiles me
            where me.id = (select auth.uid()) and me.role = 'admin')
  );

create policy refund_requests_admin_update on public.refund_requests
  for update to authenticated
  using (
    exists (select 1 from public.profiles me
            where me.id = (select auth.uid()) and me.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles me
            where me.id = (select auth.uid()) and me.role = 'admin')
  );

commit;

-- 0075 — Google Play Billing premium grants.
--
-- TWA Play Billing returns a Play purchase token to the web client. The client
-- sends that token to the google-play-confirm Edge Function, and the function
-- verifies it with Google Play before calling this service-role-only RPC.

begin;

alter table public.payments
  drop constraint if exists payments_pg_provider_check;

alter table public.payments
  add constraint payments_pg_provider_check
  check (pg_provider in ('toss','stripe','manual','google_play'));

create or replace function public.grant_premium_from_google_play(
  p_user_id uuid,
  p_purchase_token text,
  p_order_id text,
  p_amount_krw int,
  p_product_code text,
  p_expires_at timestamptz,
  p_raw jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_until timestamptz;
  current_is_premium boolean;
  existing_grant_id uuid;
begin
  if p_user_id is null then
    raise exception 'missing user id';
  end if;
  if p_purchase_token is null or length(trim(p_purchase_token)) = 0 then
    raise exception 'missing purchase token';
  end if;
  if p_product_code is null or length(trim(p_product_code)) = 0 then
    raise exception 'missing product code';
  end if;
  if p_expires_at is null or p_expires_at <= now() then
    raise exception 'subscription is not active';
  end if;
  if p_amount_krw is null or p_amount_krw < 0 then
    raise exception 'invalid amount';
  end if;

  insert into public.payments (
    user_id,
    pg_provider,
    pg_payment_key,
    pg_order_id,
    amount_krw,
    product_code,
    status,
    paid_at,
    raw
  ) values (
    p_user_id,
    'google_play',
    p_purchase_token,
    nullif(trim(coalesce(p_order_id, '')), ''),
    p_amount_krw,
    p_product_code,
    'paid',
    now(),
    p_raw
  ) on conflict (pg_payment_key) where pg_payment_key is not null do update
    set pg_order_id = coalesce(excluded.pg_order_id, public.payments.pg_order_id),
        amount_krw = excluded.amount_krw,
        product_code = excluded.product_code,
        status = 'paid',
        paid_at = now(),
        raw = excluded.raw;

  select id
    into existing_grant_id
    from public.premium_grants
   where source = 'paid'
     and source_ref = p_purchase_token
   for update;

  if existing_grant_id is null then
    insert into public.premium_grants (
      user_id,
      source,
      source_ref,
      granted_at,
      expires_at,
      note
    ) values (
      p_user_id,
      'paid',
      p_purchase_token,
      now(),
      p_expires_at,
      'Google Play Billing subscription'
    );
  else
    update public.premium_grants
       set expires_at = greatest(expires_at, p_expires_at),
           revoked_at = null,
           note = 'Google Play Billing subscription'
     where id = existing_grant_id;
  end if;

  select is_premium, premium_until
    into current_is_premium, current_until
    from public.profiles
   where id = p_user_id
   for update;

  update public.profiles
     set is_premium = true,
         premium_until = case
           when current_is_premium is true and current_until is null then null
           when current_until is null then p_expires_at
           else greatest(current_until, p_expires_at)
         end,
         updated_at = now()
   where id = p_user_id;
end;
$$;

revoke execute on function public.grant_premium_from_google_play(
  uuid, text, text, int, text, timestamptz, jsonb
) from public, anon, authenticated;

grant execute on function public.grant_premium_from_google_play(
  uuid, text, text, int, text, timestamptz, jsonb
) to service_role;

comment on function public.grant_premium_from_google_play is
  'Service-role RPC used by google-play-confirm after Play Developer API verification.';

commit;

-- 0031 — Match Toss payment upsert to the partial unique payment key index.

begin;

create or replace function public.grant_premium_from_payment(
  p_user_id uuid,
  p_pg_payment_key text,
  p_pg_order_id text,
  p_amount_krw int,
  p_product_code text,
  p_raw jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  grant_until timestamptz;
  current_until timestamptz;
  current_is_premium boolean;
begin
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
    'toss',
    p_pg_payment_key,
    p_pg_order_id,
    p_amount_krw,
    p_product_code,
    'paid',
    now(),
    p_raw
  ) on conflict (pg_payment_key) where pg_payment_key is not null do nothing;

  if p_product_code = 'lifetime' then
    grant_until := null;
  elsif p_product_code = 'weekly' then
    grant_until := now() + interval '7 days';
  elsif p_product_code = 'monthly' then
    grant_until := now() + interval '30 days';
  else
    raise exception 'unknown product_code: %', p_product_code;
  end if;

  if not exists (
    select 1
      from public.premium_grants
     where source = 'paid'
       and source_ref = p_pg_payment_key
  ) then
    insert into public.premium_grants (
      user_id, source, source_ref, granted_at, expires_at
    ) values (
      p_user_id, 'paid', p_pg_payment_key, now(), grant_until
    );
  end if;

  select is_premium, premium_until
    into current_is_premium, current_until
    from public.profiles
   where id = p_user_id
   for update;

  update public.profiles
     set is_premium = true,
         premium_until = case
           when grant_until is null then null
           when current_is_premium is true and current_until is null then null
           when current_until is null then grant_until
           else greatest(current_until, grant_until)
         end,
         updated_at = now()
   where id = p_user_id;
end;
$$;

revoke execute on function public.grant_premium_from_payment(uuid, text, text, int, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.grant_premium_from_payment(uuid, text, text, int, text, jsonb)
  to service_role;

commit;

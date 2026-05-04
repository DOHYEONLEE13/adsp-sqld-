-- 0018 — 결제 → premium 부여 트랜잭션 RPC.
--
-- 호출자: Edge Function `toss-confirm` (service_role 컨텍스트).
-- 멱등: payments.pg_payment_key 의 UNIQUE constraint (마이그 0012 line ~) 또는
--       ON CONFLICT DO NOTHING 으로 중복 차단. 같은 paymentKey 로 두 번 호출
--       해도 한 번만 premium 부여.
--
-- 동작:
--   1. payments 테이블에 결제 row insert (이미 있으면 noop)
--   2. product_code 기반 premium 만료 시점 계산
--      - lifetime: NULL (무기한)
--      - weekly: now() + 7일
--      - monthly: now() + 30일
--   3. premium_grants 테이블에 grant row insert
--   4. profiles.is_premium = true + premium_until 업데이트
--      (기존 premium_until 이 더 길면 그것 유지 — 사용자가 손해 안 보게)
--
-- 호출 예 (Edge Function 에서):
--   await sb.rpc('grant_premium_from_payment', {
--     p_user_id: <uuid>,
--     p_pg_payment_key: 'tvip_xxxx',
--     p_pg_order_id: 'qdp-...',
--     p_amount_krw: 9900,
--     p_product_code: 'monthly',
--     p_raw: <jsonb>,
--   });

create or replace function public.grant_premium_from_payment(
  p_user_id uuid,
  p_pg_payment_key text,
  p_pg_order_id text,
  p_amount_krw int,
  p_product_code text,
  p_raw jsonb
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  grant_until timestamptz;
  current_until timestamptz;
begin
  -- 1. payments insert (멱등 — pg_payment_key UNIQUE)
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
  ) on conflict (pg_payment_key) do nothing;

  -- 2. product_code 별 premium 기간 결정
  if p_product_code = 'lifetime' then
    grant_until := null; -- 무기한
  elsif p_product_code = 'weekly' then
    grant_until := now() + interval '7 days';
  elsif p_product_code = 'monthly' then
    grant_until := now() + interval '30 days';
  else
    raise exception 'unknown product_code: %', p_product_code;
  end if;

  -- 3. premium_grants insert (source='paid' + payment key 참조)
  --    이 테이블은 0011 에서 정의. source_ref 로 paymentKey 저장 → 환불 시 추적.
  --    멱등: 같은 source_ref 의 중복 grant 차단 (revoked_at IS NULL 인 active 만 비교)
  if not exists (
    select 1 from public.premium_grants
    where source = 'paid' and source_ref = p_pg_payment_key
  ) then
    insert into public.premium_grants (
      user_id, source, source_ref, granted_at, expires_at
    ) values (
      p_user_id, 'paid', p_pg_payment_key, now(), grant_until
    );
  end if;

  -- 4. profiles.is_premium / premium_until 업데이트
  --    기존 premium 이 있으면:
  --    - 기존 무기한 (NULL) → 그대로 유지 (덮지 않음)
  --    - 새 무기한 (NULL) → NULL 로 (영구화)
  --    - 둘 다 만료일 있으면 더 큰 값
  select premium_until into current_until from public.profiles where id = p_user_id;

  update public.profiles
  set
    is_premium = true,
    premium_until = case
      when grant_until is null then null   -- 새 무기한 → 무기한
      when current_until is null then current_until  -- 기존 무기한 유지
      else greatest(current_until, grant_until)
    end,
    updated_at = now()
  where id = p_user_id;
end;
$$;

-- service_role 만 호출 가능 (Edge Function). 일반 사용자 차단.
revoke execute on function public.grant_premium_from_payment(uuid, text, text, int, text, jsonb)
  from public, anon, authenticated;

comment on function public.grant_premium_from_payment is
  'Toss confirm Edge Function 이 호출. payment + premium_grant + profiles 업데이트를 단일 트랜잭션 + 멱등 보장.';

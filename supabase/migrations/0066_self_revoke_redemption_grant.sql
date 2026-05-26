-- 0066 Let users revoke their own redemption-code premium grant.
--
-- Goal:
--   A user who redeemed a promo/coupon code can cancel that specific grant
--   without admin intervention.
--
-- Safety rules:
--   - Only the signed-in user's own premium_grants row can be revoked.
--   - Only source='redemption_code' can be revoked here.
--   - Paid/admin/comp grants remain protected.
--   - profiles.is_premium / premium_until are recomputed from remaining active grants.
--   - redemption_codes.uses is not decremented. A revoked one-use code should not
--     silently become reusable.

begin;

create or replace function public.revoke_my_redemption_grant(p_grant_id uuid)
returns table (
  ok boolean,
  reason text,
  grant_revoked boolean,
  premium_still_active boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  target public.premium_grants;
  has_active boolean := false;
  has_lifetime boolean := false;
  next_until timestamptz;
begin
  if me is null then
    return query select false, 'unauthenticated', false, false; return;
  end if;

  if p_grant_id is null then
    return query select false, 'not_found', false, false; return;
  end if;

  select *
    into target
    from public.premium_grants
   where id = p_grant_id
     and user_id = me
   for update;

  if target.id is null then
    return query select false, 'not_found', false, false; return;
  end if;

  if target.source <> 'redemption_code' then
    return query select false, 'not_redemption_code', false, false; return;
  end if;

  if target.revoked_at is not null then
    select
      count(*) > 0,
      coalesce(bool_or(expires_at is null), false),
      max(expires_at)
    into has_active, has_lifetime, next_until
    from public.premium_grants
    where user_id = me
      and revoked_at is null
      and (expires_at is null or expires_at > now());

    return query select true, 'already_revoked', false, coalesce(has_active, false); return;
  end if;

  update public.premium_grants
     set revoked_at = now()
   where id = target.id;

  select
    count(*) > 0,
    coalesce(bool_or(expires_at is null), false),
    max(expires_at)
  into has_active, has_lifetime, next_until
  from public.premium_grants
  where user_id = me
    and revoked_at is null
    and (expires_at is null or expires_at > now());

  if coalesce(has_active, false) then
    update public.profiles
       set is_premium = true,
           premium_until = case
             when has_lifetime then null
             else next_until
           end
     where id = me;
  else
    update public.profiles
       set is_premium = false,
           premium_until = null
     where id = me;
  end if;

  return query select true, null::text, true, coalesce(has_active, false);
end;
$$;

revoke execute on function public.revoke_my_redemption_grant(uuid) from public, anon;
grant execute on function public.revoke_my_redemption_grant(uuid) to authenticated;

commit;

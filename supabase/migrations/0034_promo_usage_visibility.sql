-- 0034 — Promo usage visibility for operations.
--
-- Purpose:
--   - Keep redemption_codes.uses auditable with the latest redeemer metadata.
--   - Let the admin dashboard show "who used which promo code" without exposing
--     premium_grants directly to normal users.
--
-- Data model note:
--   premium_grants(source='redemption_code', source_ref=<code>) remains the
--   authoritative usage ledger. redemption_codes.last_redeemed_* is only a
--   quick operational hint for the code list.

begin;

alter table public.redemption_codes
  add column if not exists last_redeemed_by uuid references public.profiles(id) on delete set null,
  add column if not exists last_redeemed_at timestamptz;

create index if not exists premium_grants_redemption_code_usage_idx
  on public.premium_grants(source, source_ref, granted_at desc)
  where source = 'redemption_code';

create index if not exists redemption_codes_last_redeemed_at_idx
  on public.redemption_codes(last_redeemed_at desc);

with latest as (
  select distinct on (upper(source_ref))
         upper(source_ref) as code,
         user_id,
         granted_at
    from public.premium_grants
   where source = 'redemption_code'
     and source_ref is not null
   order by upper(source_ref), granted_at desc
)
update public.redemption_codes rc
   set last_redeemed_by = latest.user_id,
       last_redeemed_at = latest.granted_at
  from latest
 where rc.code = latest.code
   and (
     rc.last_redeemed_by is distinct from latest.user_id
     or rc.last_redeemed_at is distinct from latest.granted_at
   );

create or replace function public.redeem_code(p_code text)
returns table (ok boolean, reason text, granted_tier text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec public.redemption_codes;
  me uuid := (select auth.uid());
  normalized text;
begin
  if me is null then
    return query select false, 'unauthenticated', null::text; return;
  end if;

  normalized := upper(trim(p_code));

  select * into rec from public.redemption_codes where code = normalized for update;

  if rec.code is null then
    return query select false, 'not_found', null::text; return;
  end if;

  if rec.expires_at is not null and rec.expires_at < now() then
    return query select false, 'expired', null::text; return;
  end if;

  -- Idempotent: do not increment usage again if this user already has
  -- an active grant for the same code.
  if exists (
    select 1 from public.premium_grants
    where user_id = me
      and source = 'redemption_code'
      and source_ref = rec.code
      and revoked_at is null
  ) then
    return query select true, 'already_redeemed', rec.granted_tier; return;
  end if;

  if rec.uses >= rec.max_uses then
    return query select false, 'depleted', null::text; return;
  end if;

  update public.redemption_codes
     set uses = uses + 1,
         last_redeemed_by = me,
         last_redeemed_at = now()
   where code = rec.code;

  insert into public.premium_grants (user_id, source, source_ref, expires_at, note)
  values (me, 'redemption_code', rec.code, rec.expires_at, rec.note);

  update public.profiles
     set is_premium = true,
         premium_until = case
           when rec.expires_at is null then null
           when premium_until is null and is_premium = true then null
           when premium_until > rec.expires_at then premium_until
           else rec.expires_at
         end
   where id = me;

  return query select true, null::text, rec.granted_tier;
end;
$$;

revoke execute on function public.redeem_code(text) from public, anon;
grant execute on function public.redeem_code(text) to authenticated;

create or replace function public.admin_redemption_code_usage()
returns table (
  code text,
  grant_id uuid,
  user_id uuid,
  tag text,
  display_name text,
  role text,
  is_premium boolean,
  premium_until timestamptz,
  total_xp integer,
  lesson_xp integer,
  display_xp integer,
  level integer,
  energy_count integer,
  user_created_at timestamptz,
  last_seen_at timestamptz,
  granted_at timestamptz,
  grant_expires_at timestamptz,
  revoked_at timestamptz,
  note text,
  code_exists boolean,
  code_uses integer,
  code_max_uses integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  is_admin boolean;
begin
  if me is null then
    return;
  end if;

  select p.role = 'admin'
    into is_admin
    from public.profiles p
   where p.id = me;

  if not coalesce(is_admin, false) then
    return;
  end if;

  return query
  select
    upper(pg.source_ref) as code,
    pg.id as grant_id,
    pg.user_id,
    p.tag,
    p.display_name,
    p.role,
    p.is_premium,
    p.premium_until,
    p.total_xp,
    coalesce(p.lesson_xp, 0) as lesson_xp,
    (p.total_xp + coalesce(p.lesson_xp, 0))::integer as display_xp,
    p.level,
    p.energy_count,
    p.created_at as user_created_at,
    p.last_seen_at,
    pg.granted_at,
    pg.expires_at as grant_expires_at,
    pg.revoked_at,
    pg.note,
    (rc.code is not null) as code_exists,
    rc.uses as code_uses,
    rc.max_uses as code_max_uses
  from public.premium_grants pg
  join public.profiles p on p.id = pg.user_id
  left join public.redemption_codes rc on rc.code = upper(pg.source_ref)
  where pg.source = 'redemption_code'
    and pg.source_ref is not null
  order by pg.granted_at desc;
end;
$$;

revoke execute on function public.admin_redemption_code_usage() from public, anon;
grant execute on function public.admin_redemption_code_usage() to authenticated;

commit;

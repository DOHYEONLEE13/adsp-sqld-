-- 0035 — Make promo usage admin RPC security invoker.
--
-- 0034 introduced admin_redemption_code_usage() as SECURITY DEFINER following
-- the older admin RPC style in this project. Supabase's current security
-- advisor correctly warns about authenticated users being able to execute
-- SECURITY DEFINER functions in the exposed public schema.
--
-- This RPC can rely on existing RLS admin policies instead, so keep the
-- explicit admin check and run it as the caller.

begin;

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
security invoker
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

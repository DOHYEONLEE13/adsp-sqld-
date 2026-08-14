-- Read-only admin snapshot for current and cumulative XP.
--
-- cumulative_xp comes from the append-only xp_awards ledger. greatest() keeps
-- older accounts from appearing below their current balance when awards from
-- before the ledger was introduced are not represented there.

begin;

create or replace function public.admin_user_xp_snapshot(
  p_limit integer default 100
)
returns table (
  id uuid,
  tag text,
  display_name text,
  role text,
  total_xp integer,
  lesson_xp integer,
  cumulative_xp bigint,
  level integer,
  is_premium boolean,
  learning_subject text,
  last_seen_at timestamptz,
  created_at timestamptz
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  safe_limit integer := greatest(1, least(coalesce(p_limit, 100), 500));
begin
  if not public.is_current_user_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return query
  with award_totals as (
    select
      xa.user_id,
      sum(xa.xp_amount)::bigint as awarded_xp
    from public.xp_awards as xa
    group by xa.user_id
  )
  select
    p.id,
    p.tag,
    p.display_name,
    p.role::text,
    coalesce(p.total_xp, 0)::integer,
    coalesce(p.lesson_xp, 0)::integer,
    greatest(
      (coalesce(p.total_xp, 0) + coalesce(p.lesson_xp, 0))::bigint,
      coalesce(a.awarded_xp, 0::bigint)
    ) as cumulative_xp,
    p.level,
    p.is_premium,
    p.learning_subject::text,
    p.last_seen_at,
    p.created_at
  from public.profiles as p
  left join award_totals as a on a.user_id = p.id
  order by p.last_seen_at desc nulls last, p.created_at desc
  limit safe_limit;
end;
$$;

revoke execute on function public.admin_user_xp_snapshot(integer)
  from public, anon;
grant execute on function public.admin_user_xp_snapshot(integer)
  to authenticated;

commit;

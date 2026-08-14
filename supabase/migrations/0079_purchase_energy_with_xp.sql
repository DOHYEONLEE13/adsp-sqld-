-- 0079 - Buy energy with XP in one transaction.
-- The function locks only the authenticated user's profile row, so concurrent
-- clicks cannot spend the same XP twice or overwrite the energy balance.

create or replace function public.purchase_energy_with_xp(
  p_xp_cost integer,
  p_energy_amount integer
)
returns table (
  ok boolean,
  reason text,
  remaining_energy integer,
  remaining_xp integer,
  energy_updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  profile_row record;
  current_total integer;
  current_lesson integer;
  current_xp integer;
  current_energy integer;
  current_energy_updated_at timestamptz;
  elapsed_seconds integer;
  regenerated integer;
  lesson_deduct integer;
  total_deduct integer;
  next_energy integer;
  next_energy_updated_at timestamptz;
  energy_cap constant integer := 10;
  regen_seconds constant integer := 1800;
begin
  if me is null then
    return query select false, 'unauthenticated', 0, 0, now();
    return;
  end if;

  -- Keep the public RPC limited to the tiers exposed by the client.
  if not (
    (p_xp_cost = 40 and p_energy_amount = 1) or
    (p_xp_cost = 100 and p_energy_amount = 3) or
    (p_xp_cost = 300 and p_energy_amount = 10)
  ) then
    return query select false, 'invalid_tier', 0, 0, now();
    return;
  end if;

  select
    p.total_xp,
    coalesce(p.lesson_xp, 0) as lesson_xp,
    p.energy_count,
    coalesce(p.energy_updated_at, now()) as energy_updated_at,
    p.is_premium,
    p.role
  into profile_row
  from public.profiles as p
  where p.id = me
  for update;

  if not found then
    return query select false, 'profile_not_found', 0, 0, now();
    return;
  end if;

  current_total := coalesce(profile_row.total_xp, 0);
  current_lesson := coalesce(profile_row.lesson_xp, 0);
  current_xp := current_total + current_lesson;
  current_energy := greatest(0, least(energy_cap, coalesce(profile_row.energy_count, 0)));
  current_energy_updated_at := profile_row.energy_updated_at;

  if profile_row.is_premium or profile_row.role = 'admin' then
    return query
      select false, 'unlimited', current_energy, current_xp, current_energy_updated_at;
    return;
  end if;

  -- Apply lazy regeneration before checking capacity. Reaching the cap resets
  -- the timer, matching get_energy_state/consume_energy behavior.
  if current_energy < energy_cap then
    elapsed_seconds := greatest(
      0,
      floor(extract(epoch from (now() - current_energy_updated_at)))::integer
    );
    regenerated := floor(elapsed_seconds::numeric / regen_seconds)::integer;
    if regenerated > 0 then
      current_energy := least(energy_cap, current_energy + regenerated);
      if current_energy >= energy_cap then
        current_energy_updated_at := now();
      else
        current_energy_updated_at :=
          current_energy_updated_at + make_interval(secs => regenerated * regen_seconds);
      end if;
    end if;
  end if;

  if current_energy + p_energy_amount > energy_cap then
    return query
      select false, 'cap_overflow', current_energy, current_xp, current_energy_updated_at;
    return;
  end if;

  if current_xp < p_xp_cost then
    return query
      select false, 'insufficient_xp', current_energy, current_xp, current_energy_updated_at;
    return;
  end if;

  lesson_deduct := least(current_lesson, p_xp_cost);
  total_deduct := p_xp_cost - lesson_deduct;
  next_energy := current_energy + p_energy_amount;
  next_energy_updated_at := current_energy_updated_at;

  update public.profiles as p
  set
    lesson_xp = current_lesson - lesson_deduct,
    total_xp = current_total - total_deduct,
    energy_count = next_energy,
    energy_updated_at = next_energy_updated_at,
    updated_at = now()
  where p.id = me;

  return query
    select
      true,
      null::text,
      next_energy,
      current_xp - p_xp_cost,
      next_energy_updated_at;
end;
$$;

revoke execute on function public.purchase_energy_with_xp(integer, integer)
  from public, anon;
grant execute on function public.purchase_energy_with_xp(integer, integer)
  to authenticated;

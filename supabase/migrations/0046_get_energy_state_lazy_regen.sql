-- 0046 — energy state 조회 시점에도 30분 회복을 서버 기준으로 반영.
--
-- 기존 consume_energy 는 "소비 시점" 에만 lazy regen 을 계산했다.
-- 이 함수는 앱 진입/재방문/타이머 만료 시점에 호출되어, 사용자가
-- 실제로 문제를 누르지 않아도 화면과 DB 가 같은 회복 상태를 보게 한다.

create or replace function public.get_energy_state()
returns table (
  energy integer,
  energy_updated_at timestamptz,
  is_premium boolean,
  is_admin boolean,
  retry_after_sec integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec record;
  cap int := 10;
  regen_after_sec int := 1800;
  elapsed_sec bigint;
  gained int;
  regenerated int;
  next_updated_at timestamptz;
  next_retry_after int;
begin
  if auth.uid() is null then
    return query select 0, now(), false, false, 0; return;
  end if;

  select p.energy_count, p.energy_updated_at, p.is_premium, p.role
    into rec
    from public.profiles p
   where p.id = auth.uid()
   for update;

  if not found then
    return query select 0, now(), false, false, 0; return;
  end if;

  if rec.role = 'admin' or rec.is_premium then
    return query select
      999,
      coalesce(rec.energy_updated_at, now()),
      coalesce(rec.is_premium, false),
      rec.role = 'admin',
      0;
    return;
  end if;

  elapsed_sec := greatest(0, extract(epoch from now() - rec.energy_updated_at)::bigint);
  gained := (elapsed_sec / regen_after_sec)::int;
  regenerated := least(cap, rec.energy_count + gained);

  if regenerated >= cap then
    next_retry_after := 0;
    -- 이미 cap 이면 불필요한 UPDATE 를 반복하지 않는다.
    if rec.energy_count >= cap then
      next_updated_at := rec.energy_updated_at;
    else
      next_updated_at := now();
    end if;
  else
    next_retry_after := regen_after_sec - (elapsed_sec % regen_after_sec)::int;
    next_updated_at := rec.energy_updated_at + make_interval(secs => gained * regen_after_sec);
  end if;

  if rec.energy_count is distinct from regenerated
     or rec.energy_updated_at is distinct from next_updated_at then
    update public.profiles
       set energy_count = regenerated,
           energy_updated_at = next_updated_at
     where profiles.id = auth.uid();
  end if;

  return query select
    regenerated,
    next_updated_at,
    false,
    false,
    next_retry_after;
end;
$$;

revoke execute on function public.get_energy_state() from public, anon;
grant execute on function public.get_energy_state() to authenticated;

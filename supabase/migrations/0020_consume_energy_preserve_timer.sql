-- 0020 — consume_energy 의 30분 타이머 보존.
--
-- 버그: 매 차감 시 energy_updated_at=now() 로 갱신되어 다음 충전까지
--      항상 30분으로 리셋됨.
-- 수정: cap (5) 에서 첫 차감 시에만 새 30분 cycle 시작. cap 미만에서 추가
--      차감은 기존 cycle 유지 → 같은 30분 안에 여러 번 차감해도 충전 시점
--      변경 X.
-- regen 발생 시: regen 만큼 cycle 도 전진 (rec.energy_updated_at + N*30분).

create or replace function public.consume_energy(amount int default 1)
returns table (ok boolean, remaining int, retry_after_sec int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec record;
  cap int := 5;
  regen_after_sec int := 1800;
  elapsed_sec bigint;
  regen_count int;
  rem_sec int;
  new_updated_at timestamptz;
begin
  if auth.uid() is null then
    return query select false, 0, 0; return;
  end if;

  select energy_count, energy_updated_at, is_premium, role
    into rec from public.profiles where id = auth.uid() for update;

  if rec.role = 'admin' or rec.is_premium then
    return query select true, 999, 0; return;
  end if;

  elapsed_sec := extract(epoch from now() - rec.energy_updated_at)::bigint;
  regen_count := least(cap, rec.energy_count + (elapsed_sec / regen_after_sec)::int);

  if regen_count < amount then
    rem_sec := regen_after_sec - (elapsed_sec % regen_after_sec)::int;
    return query select false, regen_count, rem_sec; return;
  end if;

  if regen_count >= cap then
    new_updated_at := now();
  else
    new_updated_at := rec.energy_updated_at
      + make_interval(secs => (regen_count - rec.energy_count) * regen_after_sec);
  end if;

  update public.profiles
     set energy_count = regen_count - amount,
         energy_updated_at = new_updated_at
   where id = auth.uid();

  return query select true, regen_count - amount, 0;
end;
$$;

revoke execute on function public.consume_energy(int) from public, anon;
grant  execute on function public.consume_energy(int) to authenticated;

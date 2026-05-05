-- 0019 — Admin 계정 에너지·잠금 우회.
--
-- 정책 요약:
--   admin (profiles.role = 'admin') 은 결제 없이도 무제한 ⚡ + 모든 step 자유.
--   consume_energy / unlock_step 두 RPC 가 admin 을 즉시 통과시키도록 갱신.
--
-- 클라이언트에서도 같은 분기 — energy.ts / stepUnlocks.ts 가 profile.role 을
-- 추가로 select 해서 isAdmin 이면 isPremium 처럼 무제한 처리.

begin;

-- ── consume_energy: admin 통과 ───────────────────────────────────────────

create or replace function public.consume_energy(amount int default 1)
returns table (ok boolean, remaining int, retry_after_sec int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec record;
  cap int := 5;
  regen_after_sec int := 1800;        -- 30 min
  elapsed_sec bigint;
  regen_count int;
  rem_sec int;
begin
  if auth.uid() is null then
    return query select false, 0, 0; return;
  end if;

  select energy_count, energy_updated_at, is_premium, role
    into rec from public.profiles where id = auth.uid() for update;

  -- Admin: 무제한, 소모 없음 (premium 과 동일 처리)
  if rec.role = 'admin' or rec.is_premium then
    return query select true, 999, 0; return;
  end if;

  elapsed_sec := extract(epoch from now() - rec.energy_updated_at)::bigint;
  regen_count := least(cap, rec.energy_count + (elapsed_sec / regen_after_sec)::int);

  if regen_count < amount then
    rem_sec := regen_after_sec - (elapsed_sec % regen_after_sec)::int;
    return query select false, regen_count, rem_sec; return;
  end if;

  update public.profiles
     set energy_count = regen_count - amount,
         energy_updated_at = now()
   where id = auth.uid();

  return query select true, regen_count - amount, 0;
end;
$$;

-- 함수 권한 — authenticated 만 실행
revoke execute on function public.consume_energy(int) from public, anon;
grant  execute on function public.consume_energy(int) to authenticated;

-- ── unlock_step: admin / premium 모두 즉시 통과 (no-op insert) ──────────
-- (admin·premium 은 클라이언트가 enforced=false 로 모든 step 을 자유롭게
--  진입하므로 RPC 호출조차 안 함. 그래도 RPC 경로를 호출해도 안전하도록
--  on conflict do nothing 패턴 그대로 유지. 별도 변경 불필요.)

commit;

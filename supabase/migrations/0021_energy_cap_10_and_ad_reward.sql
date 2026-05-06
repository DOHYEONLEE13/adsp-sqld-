-- 0021 — 에너지 cap 5 → 10 + 광고 보상 RPC.
--
-- 변경 1: cap 상수를 5 → 10 으로 상향. 시작 에너지도 10 으로 (DEFAULT 변경).
-- 변경 2: 기존 무료 사용자의 energy_count 도 10 으로 일괄 상향 (선물 효과 + UX 일관).
--   - 프리미엄·어드민은 server 가 항상 999 반환하므로 영향 없음.
-- 변경 3: 신규 RPC `grant_ad_energy()` — 광고 1회 시청 보상 +5 (cap=10 까지).
--   - 30초 쿨다운 — F12 console 으로 빠른 반복 호출 방지 (light spam guard).
--   - 향후 AdMob/AdSense 의 server-side reward callback 검증 (signed token) 으로 강화 예정.

-- ── (1) cap 보장 — 컬럼 default 변경 + 기존 프로필 일괄 상향 ──
alter table public.profiles
  alter column energy_count set default 10;

-- 게스트 (auth.users 미존재 row 없음) + 인증 사용자 모두 무료라면 5 → 10.
-- 단 999 를 채워둔 admin/premium row 는 그대로.
update public.profiles
   set energy_count = 10,
       energy_updated_at = now()
 where energy_count between 0 and 9
   and is_premium = false
   and (role is null or role <> 'admin');

-- ── (2) consume_energy 의 cap 상수 5 → 10 ──
create or replace function public.consume_energy(amount int default 1)
returns table (ok boolean, remaining int, retry_after_sec int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec record;
  cap int := 10;
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

-- ── (3) 광고 보상 RPC — grant_ad_energy() ──
-- 30초 쿨다운 — last_ad_grant_at 컬럼 신설 + check 로 abuse 차단.
-- 하루 3회 한도 — ad_views_today + ad_views_date 로 KST(Asia/Seoul) 기준 일일 카운트.
alter table public.profiles
  add column if not exists last_ad_grant_at timestamptz,
  add column if not exists ad_views_today int not null default 0,
  add column if not exists ad_views_date date;

-- 하루 3회 한도 + 30초 쿨다운. KST(Asia/Seoul) 기준으로 자정에 리셋.
create or replace function public.grant_ad_energy()
returns table (
  ok boolean,
  granted int,
  remaining int,
  retry_after_sec int,
  views_today int,
  daily_cap int
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec record;
  cap int := 10;
  reward int := 5;
  cooldown_sec int := 30;
  regen_after_sec int := 1800;
  daily_max int := 3;
  today_kst date := (now() at time zone 'Asia/Seoul')::date;
  current_views int;
  elapsed_sec bigint;
  regen_count int;
  cooldown_remaining int;
  new_count int;
  granted_count int;
begin
  if auth.uid() is null then
    return query select false, 0, 0, 0, 0, daily_max; return;
  end if;

  select energy_count, energy_updated_at, is_premium, role,
         last_ad_grant_at, ad_views_today, ad_views_date
    into rec from public.profiles where id = auth.uid() for update;

  -- 프리미엄/어드민 — 어차피 무제한이라 광고 의미 X. ok=true 로 받지만 grant 0.
  if rec.role = 'admin' or rec.is_premium then
    return query select true, 0, 999, 0, 0, daily_max; return;
  end if;

  -- 일일 카운트 정규화 — date 가 다르면 0 으로 리셋 (KST 자정 기준).
  if rec.ad_views_date is null or rec.ad_views_date <> today_kst then
    current_views := 0;
  else
    current_views := coalesce(rec.ad_views_today, 0);
  end if;

  -- 일일 한도 도달 — 쿨다운 형태로 알려주되 retry_after_sec 은 0 (안내는 daily_cap 으로).
  if current_views >= daily_max then
    return query select false, 0, rec.energy_count, 0, current_views, daily_max; return;
  end if;

  -- 쿨다운 체크 — 마지막 광고 보상 후 30초 미만이면 차단.
  if rec.last_ad_grant_at is not null then
    cooldown_remaining := cooldown_sec
      - extract(epoch from now() - rec.last_ad_grant_at)::int;
    if cooldown_remaining > 0 then
      return query select false, 0, rec.energy_count, cooldown_remaining,
                          current_views, daily_max; return;
    end if;
  end if;

  -- lazy regen 먼저 (consume_energy 와 동일 로직).
  elapsed_sec := extract(epoch from now() - rec.energy_updated_at)::bigint;
  regen_count := least(cap, rec.energy_count + (elapsed_sec / regen_after_sec)::int);

  -- 이미 cap 면 grant 0 (저장만 갱신, last_ad_grant_at + views 도 갱신).
  if regen_count >= cap then
    update public.profiles
       set last_ad_grant_at = now(),
           ad_views_today = current_views + 1,
           ad_views_date = today_kst
     where id = auth.uid();
    return query select true, 0, cap, 0, current_views + 1, daily_max; return;
  end if;

  -- 보상 적용 — cap 초과 시 반올림 (max 5 grant).
  new_count := least(cap, regen_count + reward);
  granted_count := new_count - regen_count;

  update public.profiles
     set energy_count = new_count,
         energy_updated_at = case
           when regen_count >= cap then rec.energy_updated_at
           else rec.energy_updated_at
             + make_interval(secs => (regen_count - rec.energy_count) * regen_after_sec)
         end,
         last_ad_grant_at = now(),
         ad_views_today = current_views + 1,
         ad_views_date = today_kst
   where id = auth.uid();

  return query select true, granted_count, new_count, 0,
                      current_views + 1, daily_max;
end;
$$;

revoke execute on function public.grant_ad_energy() from public, anon;
grant  execute on function public.grant_ad_energy() to authenticated;

-- 일일 카운트 조회 RPC — UI 가 idle 상태 마운트 시 "남은 N/3" 표시용.
-- prefetch 없이 폴링 안 하려면 별도 RPC 필요 (RLS 가 ad_views_* 컬럼 read 차단 안 하지만
-- 매번 SELECT 보내는 비용 절약).
create or replace function public.get_ad_views_today()
returns table (views_today int, daily_cap int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  daily_max int := 3;
  today_kst date := (now() at time zone 'Asia/Seoul')::date;
  rec record;
begin
  if auth.uid() is null then
    return query select 0, daily_max; return;
  end if;
  select ad_views_today, ad_views_date into rec
    from public.profiles where id = auth.uid();
  if rec.ad_views_date is null or rec.ad_views_date <> today_kst then
    return query select 0, daily_max; return;
  end if;
  return query select coalesce(rec.ad_views_today, 0), daily_max;
end;
$$;

revoke execute on function public.get_ad_views_today() from public, anon;
grant  execute on function public.get_ad_views_today() to authenticated;

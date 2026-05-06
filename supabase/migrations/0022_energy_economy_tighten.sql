-- 0022 — 에너지 이코노미 강화 (Free 사용자 일일 학습량 ↓).
--
-- 변경 1: 광고 일일 한도 3 → 1
-- 변경 2: 광고 보상 +5 → +3
-- 회복 주기는 30분 유지 (사용자 결정).
--
-- 사유: Duolingo 류 freemium 대비 너무 후함. Free conversion 동기 약화 → 광고 보상
--       강화로 결제 유도 회복. EnergyShopModal 의 XP→⚡ 구매는 유지 (confirm 단계 추가).

-- consume_energy 는 0021 그대로 (regen 30분). 본 마이그레이션은 광고 RPC 만 변경.

-- ── (1) grant_ad_energy — 보상 5→3, 일일 3→1 ──
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
  reward int := 3;          -- 5 → 3
  cooldown_sec int := 30;
  regen_after_sec int := 1800;
  daily_max int := 1;       -- 3 → 1
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

  if rec.role = 'admin' or rec.is_premium then
    return query select true, 0, 999, 0, 0, daily_max; return;
  end if;

  if rec.ad_views_date is null or rec.ad_views_date <> today_kst then
    current_views := 0;
  else
    current_views := coalesce(rec.ad_views_today, 0);
  end if;

  if current_views >= daily_max then
    return query select false, 0, rec.energy_count, 0, current_views, daily_max; return;
  end if;

  if rec.last_ad_grant_at is not null then
    cooldown_remaining := cooldown_sec
      - extract(epoch from now() - rec.last_ad_grant_at)::int;
    if cooldown_remaining > 0 then
      return query select false, 0, rec.energy_count, cooldown_remaining,
                          current_views, daily_max; return;
    end if;
  end if;

  elapsed_sec := extract(epoch from now() - rec.energy_updated_at)::bigint;
  regen_count := least(cap, rec.energy_count + (elapsed_sec / regen_after_sec)::int);

  if regen_count >= cap then
    update public.profiles
       set last_ad_grant_at = now(),
           ad_views_today = current_views + 1,
           ad_views_date = today_kst
     where id = auth.uid();
    return query select true, 0, cap, 0, current_views + 1, daily_max; return;
  end if;

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

-- ── (3) get_ad_views_today — daily_max 1 로 일치 ──
create or replace function public.get_ad_views_today()
returns table (views_today int, daily_cap int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  daily_max int := 1;       -- 3 → 1
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

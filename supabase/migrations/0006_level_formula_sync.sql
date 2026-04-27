-- 0006 — bump_progress 레벨 공식을 클라 src/game/rpg.ts 와 정확히 일치.
--
-- 클라이언트:
--   thresholdForLevel(n) = 50·n·(n-1)
--   levelFromXp(xp): max n such that 50·n·(n-1) ≤ xp
--                  = floor((1 + sqrt(1 + 0.08·xp)) / 2)
--
-- Lv1:0 / Lv2:100 / Lv3:300 / Lv4:600 / Lv5:1000 / Lv6:1500 / ...
--
-- 검증: 0→1, 99→1, 100→2, 299→2, 300→3, 600→4, 999→4, 1000→5, 5000→10

create or replace function public.bump_progress(xp_delta int, day_played date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  prev_date date;
  new_xp int;
  new_level int;
begin
  if auth.uid() is null then return; end if;

  select last_played_date, total_xp into prev_date, new_xp
    from public.profiles where id = auth.uid() for update;

  new_xp := new_xp + xp_delta;
  new_level := greatest(1, floor((1 + sqrt(1 + 0.08 * new_xp::numeric)) / 2)::int);

  update public.profiles set
    total_xp = new_xp,
    level = new_level,
    streak_days = case
      when prev_date = day_played - 1 then streak_days + 1
      when prev_date = day_played then streak_days
      else 1
    end,
    last_played_date = day_played,
    last_seen_at = now()
  where id = auth.uid();
end;
$$;

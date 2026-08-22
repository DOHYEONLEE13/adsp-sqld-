-- Avoid PL/pgSQL ambiguity between the xp_awards.award_key column and a local
-- variable. This replaces the functions applied by daily_quest_rewards.

begin;

create or replace function private.questdp_claim_daily_quest_reward(
  quest_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  reward_day date := private.questdp_kst_date();
  reward_xp integer;
  reward_award_key text;
  inserted_rows integer := 0;
  new_lesson_xp integer := 0;
begin
  if me is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  end if;

  reward_xp := case quest_id
    when 'daily-review' then 20
    when 'daily-volume' then 15
    when 'daily-accuracy' then 15
    else null
  end;

  if reward_xp is null then
    return jsonb_build_object('ok', false, 'reason', 'invalid_quest');
  end if;

  if exists (
    select 1
      from public.xp_awards as awards
     where awards.user_id = me
       and awards.award_key = 'daily-quest-bonus:' || reward_day::text
  ) then
    return jsonb_build_object(
      'ok', true,
      'questId', quest_id,
      'xpAwarded', 0,
      'alreadyClaimed', true,
      'legacyBonusClaimed', true
    );
  end if;

  reward_award_key := 'daily-quest:' || quest_id || ':' || reward_day::text;

  insert into public.xp_awards (user_id, award_key, source, xp_amount)
  values (me, reward_award_key, 'lesson', reward_xp)
  on conflict do nothing;
  get diagnostics inserted_rows = row_count;

  if inserted_rows > 0 then
    update public.profiles
       set lesson_xp = coalesce(public.profiles.lesson_xp, 0) + reward_xp,
           last_seen_at = now(),
           updated_at = now()
     where id = me
     returning public.profiles.lesson_xp into new_lesson_xp;
  else
    select coalesce(profiles.lesson_xp, 0)
      into new_lesson_xp
      from public.profiles as profiles
     where profiles.id = me;
  end if;

  return jsonb_build_object(
    'ok', true,
    'questId', quest_id,
    'xpAwarded', inserted_rows * reward_xp,
    'lessonXp', coalesce(new_lesson_xp, 0),
    'awardKey', reward_award_key,
    'alreadyClaimed', inserted_rows = 0
  );
end;
$$;

create or replace function private.questdp_claim_daily_quest_bonus()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  bonus_day date := private.questdp_kst_date();
  reward_award_key text := 'daily-quest-bonus:' || bonus_day::text;
  inserted_rows integer := 0;
  new_lesson_xp integer := 0;
begin
  if me is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  end if;

  if exists (
    select 1
      from public.xp_awards as awards
     where awards.user_id = me
       and awards.award_key like 'daily-quest:%:' || bonus_day::text
  ) then
    select coalesce(profiles.lesson_xp, 0)
      into new_lesson_xp
      from public.profiles as profiles
     where profiles.id = me;
    return jsonb_build_object(
      'ok', true,
      'xpAwarded', 0,
      'lessonXp', coalesce(new_lesson_xp, 0),
      'alreadyClaimed', true,
      'individualRewardClaimed', true
    );
  end if;

  insert into public.xp_awards (user_id, award_key, source, xp_amount)
  values (me, reward_award_key, 'lesson', 50)
  on conflict do nothing;
  get diagnostics inserted_rows = row_count;

  if inserted_rows > 0 then
    update public.profiles
       set lesson_xp = coalesce(public.profiles.lesson_xp, 0) + 50,
           last_seen_at = now(),
           updated_at = now()
     where id = me
     returning public.profiles.lesson_xp into new_lesson_xp;
  else
    select coalesce(profiles.lesson_xp, 0)
      into new_lesson_xp
      from public.profiles as profiles
     where profiles.id = me;
  end if;

  return jsonb_build_object(
    'ok', true,
    'xpAwarded', inserted_rows * 50,
    'lessonXp', coalesce(new_lesson_xp, 0),
    'awardKey', reward_award_key,
    'alreadyClaimed', inserted_rows = 0
  );
end;
$$;

commit;

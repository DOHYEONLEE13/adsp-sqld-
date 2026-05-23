-- 0053 - Server-authoritative daily quest bonus.
--
-- The client used to add the +50 XP daily quest completion bonus only in
-- localStorage. That made the XP appear temporarily and then disappear after a
-- server pull. Keep the award idempotent in xp_awards and update profile XP on
-- the server.

begin;

create or replace function private.questdp_claim_daily_quest_bonus()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  bonus_day date := private.questdp_kst_date();
  award_key text := 'daily-quest-bonus:' || bonus_day::text;
  inserted_rows integer := 0;
  new_lesson_xp integer := 0;
begin
  if me is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  end if;

  insert into public.xp_awards (user_id, award_key, source, xp_amount)
  values (me, award_key, 'lesson', 50)
  on conflict do nothing;
  get diagnostics inserted_rows = row_count;

  if inserted_rows > 0 then
    update public.profiles
       set lesson_xp = public.profiles.lesson_xp + 50,
           last_seen_at = now(),
           updated_at = now()
     where id = me
     returning public.profiles.lesson_xp into new_lesson_xp;
  else
    select coalesce(lesson_xp, 0)
      into new_lesson_xp
      from public.profiles
     where id = me;
  end if;

  return jsonb_build_object(
    'ok', true,
    'xpAwarded', inserted_rows * 50,
    'lessonXp', coalesce(new_lesson_xp, 0),
    'awardKey', award_key,
    'alreadyClaimed', inserted_rows = 0
  );
end;
$$;

revoke execute on function private.questdp_claim_daily_quest_bonus()
  from public, anon;
grant execute on function private.questdp_claim_daily_quest_bonus()
  to authenticated;

create or replace function public.claim_daily_quest_bonus()
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.questdp_claim_daily_quest_bonus();
$$;

revoke execute on function public.claim_daily_quest_bonus()
  from public, anon;
grant execute on function public.claim_daily_quest_bonus()
  to authenticated;

commit;

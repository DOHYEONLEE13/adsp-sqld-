-- 0074 - Add Harry, the COMHWAL mascot, to profile avatars.
-- Harry is the product-facing name; the image files still use the existing
-- public/mascot/comhwal-*.png asset prefix.

begin;

alter table public.profiles
  drop constraint if exists profiles_avatar_character_check;

do $$
declare
  constraint_name text;
begin
  select c.conname
    into constraint_name
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
   where n.nspname = 'public'
     and t.relname = 'profiles'
     and c.contype = 'c'
     and pg_get_constraintdef(c.oid) like '%avatar_character%'
   order by c.conname
   limit 1;

  if constraint_name is not null then
    execute format('alter table public.profiles drop constraint %I', constraint_name);
  end if;
end $$;

update public.profiles
   set avatar_character = 'harry'
 where avatar_character = 'comhwal';

update public.profiles
   set avatar_character = 'tori'
 where avatar_character is null
    or avatar_character not in ('tori', 'selli', 'harry');

alter table public.profiles
  add constraint profiles_avatar_character_check
  check (avatar_character = any (array['tori'::text, 'selli'::text, 'harry'::text]));

comment on column public.profiles.avatar_character is
  'Mascot character. tori=ADSP/default, selli=SQLD, harry=COMHWAL. Harry uses the comhwal-* asset prefix.';

alter table public.profiles
  alter column unlocked_characters set default array['tori', 'selli', 'harry']::text[];

update public.profiles
   set unlocked_characters = (
     select array_agg(distinct normalized order by normalized)
       from (
         select case when c = 'comhwal' then 'harry' else c end as normalized
           from unnest(
             coalesce(unlocked_characters, array[]::text[])
             || array['tori', 'selli', 'harry']::text[]
           ) as c
       ) normalized_chars
   );

alter table public.profiles
  alter column unlocked_poses set default array['tori-wave', 'selli-wave', 'harry-wave']::text[];

update public.profiles
   set unlocked_poses = (
     select array_agg(distinct normalized order by normalized)
       from (
         select case
                  when p like 'comhwal-%' then 'harry-' || substring(p from 9)
                  else p
                end as normalized
           from unnest(
             coalesce(unlocked_poses, array[]::text[])
             || array['tori-wave', 'selli-wave', 'harry-wave']::text[]
           ) as p
       ) normalized_poses
   );

create or replace function public.purchase_character(p_character text)
returns table (ok boolean, reason text, remaining_xp integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  cost integer := 50;
  current_xp integer;
  current_chars text[];
  known_chars constant text[] := array['tori', 'selli', 'harry'];
begin
  if me is null then
    return query select false, 'unauthenticated', 0;
    return;
  end if;

  if p_character is null or p_character != all(known_chars) then
    return query select false, 'unknown_character', 0;
    return;
  end if;

  select total_xp, unlocked_characters
    into current_xp, current_chars
    from public.profiles
   where id = me
   for update;

  if current_xp is null then
    return query select false, 'profile_not_found', 0;
    return;
  end if;

  if p_character = any(current_chars) then
    return query select true, 'already_owned', current_xp;
    return;
  end if;

  if current_xp < cost then
    return query select false, 'insufficient_xp', current_xp;
    return;
  end if;

  update public.profiles
     set total_xp = total_xp - cost,
         unlocked_characters = array_append(unlocked_characters, p_character)
   where id = me;

  return query select true, null::text, current_xp - cost;
end;
$$;

revoke execute on function public.purchase_character(text) from public, anon;
grant execute on function public.purchase_character(text) to authenticated;

create or replace function public.purchase_pose(p_character_pose text)
returns table (ok boolean, reason text, remaining_xp integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  cost integer := 50;
  current_total integer;
  current_lesson integer;
  current_combined integer;
  lesson_deduct integer;
  total_deduct integer;
  current_poses text[];
  ch text;
  po text;
  known_chars constant text[] := array['tori', 'selli', 'harry'];
  known_poses constant text[] := array[
    'wave','happy','celebrate','lightbulb','think','idle','sleep','sad'
  ];
begin
  if me is null then
    return query select false, 'unauthenticated', 0;
    return;
  end if;

  if p_character_pose is null or position('-' in p_character_pose) = 0 then
    return query select false, 'invalid_format', 0;
    return;
  end if;

  ch := split_part(p_character_pose, '-', 1);
  po := split_part(p_character_pose, '-', 2);

  if ch = '' or po = '' then
    return query select false, 'invalid_format', 0;
    return;
  end if;

  if ch != all(known_chars) then
    return query select false, 'unknown_character', 0;
    return;
  end if;

  if po != all(known_poses) then
    return query select false, 'unknown_pose', 0;
    return;
  end if;

  select total_xp, coalesce(lesson_xp, 0), unlocked_poses
    into current_total, current_lesson, current_poses
    from public.profiles
   where id = me
   for update;

  if current_total is null then
    return query select false, 'profile_not_found', 0;
    return;
  end if;

  current_combined := current_total + current_lesson;

  if p_character_pose = any(current_poses) then
    return query select true, 'already_owned', current_combined;
    return;
  end if;

  if current_combined < cost then
    return query select false, 'insufficient_xp', current_combined;
    return;
  end if;

  if current_lesson >= cost then
    lesson_deduct := cost;
    total_deduct := 0;
  else
    lesson_deduct := current_lesson;
    total_deduct := cost - current_lesson;
  end if;

  update public.profiles
     set lesson_xp = current_lesson - lesson_deduct,
         total_xp = current_total - total_deduct,
         unlocked_poses = array_append(unlocked_poses, p_character_pose)
   where id = me;

  return query select true, null::text, current_combined - cost;
end;
$$;

revoke execute on function public.purchase_pose(text) from public, anon;
grant execute on function public.purchase_pose(text) to authenticated;

commit;

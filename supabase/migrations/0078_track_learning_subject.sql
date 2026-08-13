-- 0078 - Track each user's selected learning subject for admin reporting.
--
-- `active_subject` remains limited to ADSP/SQLD because it drives the core game
-- router. `learning_subject` is reporting metadata and also supports COMHWAL.

begin;

alter table public.profiles
  add column if not exists learning_subject text;

alter table public.profiles
  drop constraint if exists profiles_learning_subject_check;

alter table public.profiles
  add constraint profiles_learning_subject_check
  check (learning_subject is null or learning_subject in ('adsp', 'sqld', 'comhwal'));

comment on column public.profiles.learning_subject is
  'Most recently selected learning subject. Reporting-only; active_subject continues to drive the core router.';

-- Existing accounts: use the latest answered question when possible. This also
-- recognizes COMHWAL, whose question ids are stored in question_stats.
with latest_subject as (
  select distinct on (qs.user_id)
    qs.user_id,
    case
      when qs.question_id like 'adsp-%' then 'adsp'
      when qs.question_id like 'sqld-%' then 'sqld'
      when qs.question_id like 'comhwal-%' then 'comhwal'
      else null
    end as subject
  from public.question_stats qs
  where qs.question_id like 'adsp-%'
     or qs.question_id like 'sqld-%'
     or qs.question_id like 'comhwal-%'
  order by qs.user_id, qs.last_seen_at desc, qs.question_id
)
update public.profiles p
   set learning_subject = latest.subject
  from latest_subject latest
 where p.id = latest.user_id
   and p.learning_subject is null
   and latest.subject is not null;

-- Accounts without answer history still have useful selection hints from the
-- core router or the onboarding mascot. Leave truly unselected accounts null.
update public.profiles p
   set learning_subject = case
     when p.avatar_character = 'harry' then 'comhwal'
     when p.active_subject in ('adsp', 'sqld') then p.active_subject
     when p.avatar_character = 'selli' then 'sqld'
     else null
   end
 where p.learning_subject is null;

create index if not exists profiles_learning_subject_idx
  on public.profiles (learning_subject)
  where coalesce(role, 'user') <> 'admin';

-- profiles_update_self already restricts UPDATE to auth.uid(). Keep the new
-- reporting field in the same column-level permission model as active_subject.
grant update (learning_subject) on public.profiles to authenticated;

create or replace function public.admin_subject_counts()
returns table (
  adsp_users integer,
  sqld_users integer,
  comhwal_users integer,
  unselected_users integer
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  is_admin boolean;
begin
  if me is null then
    return;
  end if;

  select p.role = 'admin'
    into is_admin
    from public.profiles p
   where p.id = me;

  if not coalesce(is_admin, false) then
    return;
  end if;

  return query
  select
    count(*) filter (where p.learning_subject = 'adsp')::integer,
    count(*) filter (where p.learning_subject = 'sqld')::integer,
    count(*) filter (where p.learning_subject = 'comhwal')::integer,
    count(*) filter (where p.learning_subject is null)::integer
  from public.profiles p
  where coalesce(p.role, 'user') <> 'admin';
end;
$$;

revoke execute on function public.admin_subject_counts() from public, anon;
grant execute on function public.admin_subject_counts() to authenticated;

commit;

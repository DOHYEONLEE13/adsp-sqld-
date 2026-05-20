-- 0033 — Auth callback hardening: guarantee a profile row for the current user.
--
-- The auth.users trigger normally creates profiles, but OAuth callback timing,
-- trigger drift, or an older account missing a row can leave the client waiting
-- on an empty profiles select. The client now calls this RPC before reading the
-- profile so the invariant is restored on the server, not papered over in UI.

create or replace function public.ensure_my_profile()
returns table (
  tag text,
  display_name text,
  avatar_pose text,
  avatar_character text,
  role text,
  unlocked_characters text[],
  unlocked_poses text[],
  total_xp integer,
  lesson_xp integer,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  user_email text;
  new_tag text;
  initial_role text := 'user';
begin
  if me is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if not exists (select 1 from public.profiles p where p.id = me) then
    select u.email into user_email
      from auth.users u
     where u.id = me;

    if public.is_admin_email(coalesce(user_email, '')) then
      initial_role := 'admin';
    end if;

    select public.generate_unique_tag() into new_tag;

    insert into public.profiles (id, tag, role)
    values (me, new_tag, initial_role)
    on conflict (id) do nothing;
  end if;

  return query
  select
    p.tag,
    p.display_name,
    p.avatar_pose,
    p.avatar_character,
    p.role,
    p.unlocked_characters,
    p.unlocked_poses,
    p.total_xp,
    p.lesson_xp,
    p.created_at
  from public.profiles p
  where p.id = me;
end;
$$;

revoke execute on function public.ensure_my_profile() from public, anon;
grant execute on function public.ensure_my_profile() to authenticated;


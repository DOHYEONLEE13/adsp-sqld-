-- 0041 — Consolidate xp_awards SELECT policy.
--
-- 0040 added a separate admin read policy for xp_awards so the admin learning
-- metrics RPC could count lesson completions. Functionally correct, but it
-- creates a Supabase advisor "multiple permissive policies" warning for the
-- same role/action. Keep the same access model with one SELECT policy instead.

begin;

drop policy if exists xp_awards_admin_read on public.xp_awards;
drop policy if exists xp_awards_read_self on public.xp_awards;
drop policy if exists xp_awards_read_self_or_admin on public.xp_awards;

create policy xp_awards_read_self_or_admin on public.xp_awards
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_current_user_admin())
  );

grant select on public.xp_awards to authenticated;

commit;

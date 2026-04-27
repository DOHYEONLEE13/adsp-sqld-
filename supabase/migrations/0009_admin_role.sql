-- 0009 — Admin 역할.
--
-- profiles.role 컬럼 + 이메일 화이트리스트 + 자동 부여 트리거 + RLS 정책.
-- Google OAuth 로 가입한 사용자 중 is_admin_email 매칭되는 이메일이면
-- profile.role 이 'admin' 으로 자동 부여됩니다.
--
-- 운영자 추가/제거: is_admin_email 함수의 array 를 수정 후 재배포.

begin;

-- ── 1. role 컬럼 ────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists role text not null default 'user'
    check (role in ('user','admin'));

create index if not exists profiles_role_idx on public.profiles(role)
  where role <> 'user';

-- ── 2. Admin 이메일 화이트리스트 ───────────────────────────────────────
create or replace function public.is_admin_email(em text)
returns boolean
language sql
immutable
security definer
set search_path = ''
as $$
  select em = any(array[
    'dohyeonlee13@gmail.com'
  ]::text[]);
$$;

revoke execute on function public.is_admin_email(text) from public, anon;
grant execute on function public.is_admin_email(text) to authenticated;

-- ── 3. 가입 트리거 — 화이트리스트 매칭 시 자동 admin ────────────────
create or replace function public.on_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  initial_role text;
  new_tag text;
begin
  initial_role := case
    when public.is_admin_email(new.email) then 'admin'
    else 'user'
  end;

  select public.generate_unique_tag() into new_tag;

  insert into public.profiles (id, tag, role)
  values (new.id, new_tag, initial_role);

  return new;
end;
$$;

-- ── 4. 기존 가입자 화이트리스트 일괄 승격 ─────────────────────────────
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and public.is_admin_email(u.email)
  and p.role <> 'admin';

-- ── 5. RLS — admin 전용 read 정책 ─────────────────────────────────────
-- 기존 self/friends 정책은 유지. admin 은 추가로 전체 조회 가능.

create policy profiles_admin_read on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles me
      where me.id = (select auth.uid()) and me.role = 'admin'
    )
  );

create policy sessions_admin_read on public.sessions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles me
      where me.id = (select auth.uid()) and me.role = 'admin'
    )
  );

create policy question_stats_admin_read on public.question_stats
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles me
      where me.id = (select auth.uid()) and me.role = 'admin'
    )
  );

commit;

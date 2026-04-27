-- 0010 — Admin 화이트리스트에 운영 전용 이메일 추가.
--
-- questdpofficial@gmail.com — 약관·정책·문의 등 사용자 응대 전용 계정.
-- 기존 dohyeonlee13@gmail.com 은 개인 운영자 계정으로 유지.

begin;

create or replace function public.is_admin_email(em text)
returns boolean
language sql
immutable
security definer
set search_path = ''
as $$
  select em = any(array[
    'dohyeonlee13@gmail.com',
    'questdpofficial@gmail.com'
  ]::text[]);
$$;

revoke execute on function public.is_admin_email(text) from public, anon;
grant execute on function public.is_admin_email(text) to authenticated;

-- 이미 가입한 사용자가 새로 화이트리스트에 들어왔다면 즉시 승격
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and public.is_admin_email(u.email)
  and p.role <> 'admin';

commit;

-- 0007 — 계정 삭제 RPC.
--
-- auth.users 의 row 삭제 → cascade 로 profiles + sessions + friendships +
-- question_stats + step_unlocks + bookmarks + exam_dates 모두 자동 정리.
-- (모든 테이블의 FK 가 `references profiles on delete cascade` 이고
--  profiles.id 는 `references auth.users on delete cascade`)
--
-- SECURITY DEFINER 라 함수 소유자(postgres) 권한으로 auth.users 삭제 가능.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'unauthenticated';
  end if;
  delete from auth.users where id = me;
end;
$$;

revoke execute on function public.delete_my_account() from anon, public;
grant execute on function public.delete_my_account() to authenticated;

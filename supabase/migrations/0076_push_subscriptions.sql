-- 0076_push_subscriptions.sql — 웹 푸시 (학습 리마인더) 구독 저장소.
--
-- 구성:
--  1. push_subscriptions 테이블 — 기기(브라우저)별 Web Push 구독. endpoint 가 기기 식별자.
--  2. RLS — 본인 row 만 select/update/delete. insert 는 RPC 경유만
--     (계정 전환 시 같은 endpoint 의 타 계정 row 회수가 필요해서).
--  3. upsert_push_subscription RPC — 구독 저장/갱신 (security definer).
--  4. get_push_secrets RPC — Edge Function(send-push-reminders) 전용.
--     Vault 의 VAPID 키·cron 시크릿을 service_role 만 읽을 수 있게 노출.
--     ⚠️ 시크릿 값 자체는 이 파일에 없음 — Vault 에만 존재 (git 비포함).

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  enabled boolean not null default true,
  -- 리마인더 시각 (KST 기준 시). 계정 단위 정책이지만 row 단위로 저장 —
  -- 클라이언트가 user_id 로 일괄 update.
  reminder_hour smallint not null default 21
    check (reminder_hour between 0 and 23),
  last_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id);
-- 발송 쿼리 (enabled + reminder_hour 매칭) 전용 부분 인덱스
create index if not exists push_subscriptions_due_idx
  on public.push_subscriptions (reminder_hour)
  where enabled;

alter table public.push_subscriptions enable row level security;

create policy push_subs_select_own on public.push_subscriptions
  for select using (user_id = auth.uid());
create policy push_subs_update_own on public.push_subscriptions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy push_subs_delete_own on public.push_subscriptions
  for delete using (user_id = auth.uid());
-- insert 정책 없음 — upsert_push_subscription RPC 만 insert 가능.

-- ── 구독 저장/갱신 ────────────────────────────────────────────────────
-- 같은 브라우저(endpoint)를 다른 계정이 쓰던 흔적이 있으면 회수 후 재귀속.
create or replace function public.upsert_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if p_endpoint is null or length(p_endpoint) = 0 or length(p_endpoint) > 2048 then
    raise exception 'INVALID_ENDPOINT';
  end if;
  if p_p256dh is null or length(p_p256dh) = 0 or length(p_p256dh) > 512
     or p_auth is null or length(p_auth) = 0 or length(p_auth) > 512 then
    raise exception 'INVALID_KEYS';
  end if;

  -- 계정 전환: 같은 기기의 이전 계정 구독 회수
  delete from public.push_subscriptions
  where endpoint = p_endpoint and user_id <> auth.uid();

  insert into public.push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
  values (auth.uid(), p_endpoint, p_p256dh, p_auth, left(coalesce(p_user_agent, ''), 300))
  on conflict (endpoint) do update
    set p256dh = excluded.p256dh,
        auth = excluded.auth,
        user_agent = excluded.user_agent,
        enabled = true,
        updated_at = now();
end;
$$;

revoke all on function public.upsert_push_subscription(text, text, text, text) from public;
revoke all on function public.upsert_push_subscription(text, text, text, text) from anon;
grant execute on function public.upsert_push_subscription(text, text, text, text) to authenticated;

-- ── Edge Function 전용 시크릿 조회 ───────────────────────────────────
-- service_role 만 실행 가능. 클라이언트 (anon/authenticated) 는 호출 불가.
create or replace function public.get_push_secrets()
returns table(name text, secret text)
language sql
security definer
set search_path = ''
as $$
  select s.name, s.decrypted_secret
  from vault.decrypted_secrets s
  where s.name in ('vapid_public_key', 'vapid_private_key', 'push_cron_secret');
$$;

revoke all on function public.get_push_secrets() from public;
revoke all on function public.get_push_secrets() from anon;
revoke all on function public.get_push_secrets() from authenticated;
grant execute on function public.get_push_secrets() to service_role;

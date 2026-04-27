-- 0008 — Premium 자동 만료 cron.
--
-- pg_cron 설치 후 매일 03:00 UTC (= 12:00 KST) 에 만료된 premium 회수.
-- premium_until < now() 인 row 는 is_premium=false + premium_until=null.
-- pgcron job 은 superuser 권한으로 실행되므로 RLS 우회 가능.

create extension if not exists pg_cron with schema extensions;

-- 기존 같은 이름 job 이 있으면 정리 (idempotent)
select cron.unschedule('expire-premium')
where exists (select 1 from cron.job where jobname = 'expire-premium');

-- 매일 03:00 UTC
select cron.schedule(
  'expire-premium',
  '0 3 * * *',
  $$
    update public.profiles
    set is_premium = false, premium_until = null
    where is_premium = true and premium_until is not null and premium_until < now()
  $$
);

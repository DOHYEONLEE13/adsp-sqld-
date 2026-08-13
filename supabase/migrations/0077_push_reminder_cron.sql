-- 0077_push_reminder_cron.sql — 매시 5분에 발송 함수 호출.
--
-- pg_cron → pg_net 으로 Edge Function `send-push-reminders` 를 HTTP POST.
-- 인증: Vault 의 push_cron_secret 을 x-cron-secret 헤더로 전달 —
-- 함수 쪽에서 동일 값 검증 (verify_jwt=false 대신 shared secret 방식).
--
-- 매시 정각(:00) 대신 :05 — 정각 배치 피크 회피.
-- 시각 필터링(사용자별 reminder_hour, KST)은 함수 내부에서 수행.

create extension if not exists pg_net with schema extensions;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'send-push-reminders-hourly') then
    perform cron.unschedule('send-push-reminders-hourly');
  end if;
end
$$;

select cron.schedule(
  'send-push-reminders-hourly',
  '5 * * * *',
  $cron$
  select net.http_post(
    url := 'https://zkglnbfdoftfwkwrobox.supabase.co/functions/v1/send-push-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'push_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 15000
  );
  $cron$
);

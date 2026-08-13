/**
 * send-push-reminders — 학습 리마인더 푸시 발송 (매시 5분, pg_cron 이 호출).
 *
 * 발송 조건 (모두 충족 시):
 *  1. 구독 enabled = true
 *  2. reminder_hour == 현재 KST 시각
 *  3. 오늘(KST) 아직 학습 안 함 — profiles.last_played_date < today
 *  4. 오늘 아직 알림 안 보냄 — last_notified_at < 오늘 KST 자정
 *
 * 카피: 스트릭 있으면 "N일 연속 끊기기 직전", 없으면 일반 리마인더.
 * 시험일(exam_dates) 이 30일 이내면 D-day 를 본문에 붙임.
 *
 * 인증: x-cron-secret 헤더 == Vault push_cron_secret (verify_jwt=false).
 * VAPID 키: Vault → public.get_push_secrets() (service_role 전용 RPC).
 *
 * 배포: supabase/migrations/0077 이 cron 스케줄, 이 파일이 함수 본체.
 *   npx supabase functions deploy send-push-reminders --no-verify-jwt
 *   (또는 MCP deploy_edge_function)
 */

import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const VAPID_SUBJECT = 'mailto:dohyeonlee13@gmail.com';

interface SubRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  reminder_hour: number;
  last_notified_at: string | null;
  profiles: {
    last_played_date: string | null;
    streak_days: number;
  } | null;
}

/** KST(UTC+9) 시계로 시프트한 Date — getUTC* 접근자로 읽는다. */
function kstClock(): Date {
  return new Date(Date.now() + 9 * 3600 * 1000);
}

function buildPayload(streak: number, dday: number | null): string {
  let title: string;
  let body: string;
  if (streak > 0) {
    title = `🔥 ${streak}일 연속 학습이 끊기기 직전이에요!`;
    body = '오늘 한 문제만 풀어도 스트릭이 이어져요. 5분이면 충분해요.';
  } else {
    title = '오늘의 퀘스트가 기다리고 있어요 🚀';
    body = '하루 10분, 한 스텝만 클리어해도 실력이 쌓여요.';
  }
  if (dday !== null && dday >= 0 && dday <= 30) {
    body = dday === 0 ? `오늘이 시험일이에요! ${body}` : `시험까지 D-${dday}. ${body}`;
  }
  return JSON.stringify({
    title,
    body,
    url: '/#/game',
    tag: 'questdp-daily-reminder',
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405 });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // ── 시크릿 로드 + cron 인증 ──────────────────────────────────────
  const { data: secretRows, error: secretErr } = await admin.rpc('get_push_secrets');
  if (secretErr || !secretRows) {
    console.error('secret load failed', secretErr?.message);
    return new Response(JSON.stringify({ error: 'secrets unavailable' }), { status: 500 });
  }
  const secrets = new Map<string, string>(
    (secretRows as { name: string; secret: string }[]).map((r) => [r.name, r.secret]),
  );
  const cronSecret = secrets.get('push_cron_secret');
  const vapidPublic = secrets.get('vapid_public_key');
  const vapidPrivate = secrets.get('vapid_private_key');
  if (!cronSecret || !vapidPublic || !vapidPrivate) {
    return new Response(JSON.stringify({ error: 'secrets incomplete' }), { status: 500 });
  }
  if (req.headers.get('x-cron-secret') !== cronSecret) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
  }

  webpush.setVapidDetails(VAPID_SUBJECT, vapidPublic, vapidPrivate);

  // ── 발송 대상 계산 (KST) ─────────────────────────────────────────
  const kst = kstClock();
  const kstHour = kst.getUTCHours();
  const todayKst = kst.toISOString().slice(0, 10); // YYYY-MM-DD
  const kstMidnightUtcMs = Date.parse(`${todayKst}T00:00:00+09:00`);

  const { data: subs, error: subsErr } = await admin
    .from('push_subscriptions')
    .select(
      'id, user_id, endpoint, p256dh, auth, reminder_hour, last_notified_at, profiles!inner(last_played_date, streak_days)',
    )
    .eq('enabled', true)
    .eq('reminder_hour', kstHour);
  if (subsErr) {
    console.error('subscription query failed', subsErr.message);
    return new Response(JSON.stringify({ error: subsErr.message }), { status: 500 });
  }

  const due = ((subs ?? []) as unknown as SubRow[]).filter((s) => {
    // 오늘 이미 학습했으면 스킵
    if (s.profiles?.last_played_date && s.profiles.last_played_date >= todayKst) return false;
    // 오늘 이미 알림 보냈으면 스킵 (재배포/중복 cron 방어)
    if (s.last_notified_at && Date.parse(s.last_notified_at) >= kstMidnightUtcMs) return false;
    return true;
  });

  // ── 시험 D-day (있으면 카피 보강) ────────────────────────────────
  const ddayByUser = new Map<string, number>();
  if (due.length > 0) {
    const userIds = [...new Set(due.map((s) => s.user_id))];
    const { data: exams } = await admin
      .from('exam_dates')
      .select('user_id, exam_date')
      .in('user_id', userIds)
      .gte('exam_date', todayKst);
    for (const row of exams ?? []) {
      const days = Math.round(
        (Date.parse(`${row.exam_date}T00:00:00+09:00`) - kstMidnightUtcMs) / 86_400_000,
      );
      const prev = ddayByUser.get(row.user_id);
      if (prev === undefined || days < prev) ddayByUser.set(row.user_id, days);
    }
  }

  // ── 발송 ─────────────────────────────────────────────────────────
  let sent = 0;
  let removed = 0;
  let failed = 0;
  const nowIso = new Date().toISOString();

  await Promise.allSettled(
    due.map(async (s) => {
      const payload = buildPayload(
        s.profiles?.streak_days ?? 0,
        ddayByUser.get(s.user_id) ?? null,
      );
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          payload,
          { TTL: 3600 * 6 }, // 6시간 내 미전달 시 폐기 — 새벽 뒷북 알림 방지
        );
        sent += 1;
        await admin
          .from('push_subscriptions')
          .update({ last_notified_at: nowIso })
          .eq('id', s.id);
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          // 만료/해지된 구독 — 정리
          removed += 1;
          await admin.from('push_subscriptions').delete().eq('id', s.id);
        } else {
          failed += 1;
          console.error('push send failed', s.id, status, (e as Error).message);
        }
      }
    }),
  );

  return new Response(
    JSON.stringify({ kstHour, checked: subs?.length ?? 0, due: due.length, sent, removed, failed }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});

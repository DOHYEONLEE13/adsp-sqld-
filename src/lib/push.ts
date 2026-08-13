/**
 * push.ts — 웹 푸시 (학습 리마인더) 구독 관리.
 *
 * 흐름:
 *  1. 사용자가 설정 → 알림 토글 ON
 *  2. `/sw.js` 등록 → Notification 권한 요청 → PushManager.subscribe (VAPID)
 *  3. 구독 정보를 Supabase RPC `upsert_push_subscription` 으로 저장
 *  4. 매시 5분 pg_cron → Edge Function `send-push-reminders` 가
 *     "오늘 아직 안 푼 + reminder_hour(KST) 도달" 사용자에게 발송
 *
 * 정책:
 *  - 로그인 필수 — 게스트는 서버에 구독을 저장할 곳이 없음.
 *  - reminder_hour 는 KST 기준, 계정 단위 (여러 기기 동일 시각).
 *  - VAPID 공개키는 이름 그대로 공개 값 (GA4 측정 ID 와 같은 취급) — hardcode 안전.
 *    비밀키는 Supabase Vault 에만 존재.
 */

import { getSupabase } from '@/lib/supabase';

const VAPID_PUBLIC_KEY_DEFAULT =
  'BH7RPEEkRqRHUOvGlQ2Bn_EPAVIO58bfUlHINS3J6lZ4jyFyGPhfjUWQLj1uBmmih5etBKqJPSFLBm8p7OnawKk';

const VAPID_PUBLIC_KEY =
  (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) ??
  VAPID_PUBLIC_KEY_DEFAULT;

/** 기본 리마인더 시각 (KST) — 서버 컬럼 default 와 일치. */
export const DEFAULT_REMINDER_HOUR = 21;

// ─── 지원 여부 ────────────────────────────────────────────────────────

/** 이 브라우저가 웹 푸시를 지원하는가. iOS Safari 는 홈 화면 설치(PWA) 후에만 true. */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/** iOS 기기 여부 — 미지원 안내 문구 분기용 (홈 화면 추가 가이드). */
export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // iPadOS 13+ 는 Mac UA 로 위장하므로 touch point 로 보조 판별
  return (
    /iP(hone|ad|od)/.test(ua) ||
    (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  );
}

/** 현재 Notification 권한. 미지원 브라우저면 'unsupported'. */
export function getPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

// ─── 상태 조회 ────────────────────────────────────────────────────────

export interface PushSnapshot {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
  /** 이 브라우저에 활성 구독 + 서버 row(enabled) 가 모두 있는가. */
  enabled: boolean;
  /** 서버에 저장된 리마인더 시각 (KST). row 없으면 기본값. */
  reminderHour: number;
}

/** 현재 기기의 푸시 상태 스냅샷. 설정 화면 진입 시 1회 호출. */
export async function getPushSnapshot(): Promise<PushSnapshot> {
  const base: PushSnapshot = {
    supported: isPushSupported(),
    permission: getPermission(),
    enabled: false,
    reminderHour: DEFAULT_REMINDER_HOUR,
  };
  if (!base.supported || base.permission !== 'granted') return base;

  try {
    const reg = await navigator.serviceWorker.getRegistration('/sw.js');
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return base;

    const sb = getSupabase();
    if (!sb) return base;
    const { data } = await sb
      .from('push_subscriptions')
      .select('enabled, reminder_hour')
      .eq('endpoint', sub.endpoint)
      .maybeSingle();
    if (!data) return base;
    return {
      ...base,
      enabled: Boolean(data.enabled),
      reminderHour:
        typeof data.reminder_hour === 'number'
          ? data.reminder_hour
          : DEFAULT_REMINDER_HOUR,
    };
  } catch {
    return base;
  }
}

// ─── 구독 / 해제 ──────────────────────────────────────────────────────

export type EnablePushResult =
  | { ok: true; reminderHour: number }
  | {
      ok: false;
      reason: 'unsupported' | 'signin-required' | 'denied' | 'error';
      message?: string;
    };

/** applicationServerKey 용 base64url → Uint8Array (BufferSource 호환 ArrayBuffer 기반). */
function urlBase64ToUint8Array(base64Url: string) {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

/**
 * 푸시 활성화 — SW 등록 → 권한 요청 → 구독 → 서버 저장.
 * 사용자 제스처(토글 클릭) 안에서 호출할 것 (권한 프롬프트 정책).
 */
export async function enablePush(): Promise<EnablePushResult> {
  if (!isPushSupported()) return { ok: false, reason: 'unsupported' };

  const sb = getSupabase();
  if (!sb) return { ok: false, reason: 'signin-required' };
  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) return { ok: false, reason: 'signin-required' };

  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return { ok: false, reason: 'denied' };

    const existing = await reg.pushManager.getSubscription();
    const sub =
      existing ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      }));

    const json = sub.toJSON();
    const p256dh = json.keys?.p256dh;
    const auth = json.keys?.auth;
    if (!p256dh || !auth) {
      return { ok: false, reason: 'error', message: '구독 키 추출 실패' };
    }

    const { error } = await sb.rpc('upsert_push_subscription', {
      p_endpoint: sub.endpoint,
      p_p256dh: p256dh,
      p_auth: auth,
      p_user_agent: navigator.userAgent,
    });
    if (error) return { ok: false, reason: 'error', message: error.message };

    // 계정 단위 시각을 반영해 반환 (다른 기기에서 바꿨을 수 있음)
    const { data } = await sb
      .from('push_subscriptions')
      .select('reminder_hour')
      .eq('endpoint', sub.endpoint)
      .maybeSingle();
    return {
      ok: true,
      reminderHour:
        typeof data?.reminder_hour === 'number'
          ? data.reminder_hour
          : DEFAULT_REMINDER_HOUR,
    };
  } catch (e) {
    return {
      ok: false,
      reason: 'error',
      message: e instanceof Error ? e.message : String(e),
    };
  }
}

/** 푸시 비활성화 — 서버 row 삭제 + 브라우저 구독 해지. */
export async function disablePush(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.getRegistration('/sw.js');
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;

    const sb = getSupabase();
    if (sb) {
      // RLS delete_own — 내 row 만 지워짐
      await sb.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
    }
    await sub.unsubscribe();
  } catch {
    /* 해지 실패는 치명적이지 않음 — 서버 발송 시 410 으로 자동 정리 */
  }
}

/** 리마인더 시각(KST) 변경 — 계정의 모든 기기 구독에 일괄 적용. */
export async function setReminderHour(hour: number): Promise<boolean> {
  const clamped = Math.max(0, Math.min(23, Math.round(hour)));
  const sb = getSupabase();
  if (!sb) return false;
  const { data: sess } = await sb.auth.getSession();
  const uid = sess.session?.user.id;
  if (!uid) return false;
  const { error } = await sb
    .from('push_subscriptions')
    .update({ reminder_hour: clamped, updated_at: new Date().toISOString() })
    .eq('user_id', uid);
  return !error;
}

// ─── 부팅 훅 ─────────────────────────────────────────────────────────

/**
 * 앱 부팅 시 1회 — 권한이 이미 허용된 기기에서 SW 등록을 갱신.
 * (SW 파일이 배포로 바뀌었을 때 업데이트를 받아오는 역할. 권한 프롬프트는 절대 안 띄움.)
 */
export function initPushOnBoot(): void {
  if (!isPushSupported()) return;
  if (Notification.permission !== 'granted') return;
  // 렌더 블로킹 방지 — 여유 시점에 등록
  window.setTimeout(() => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* 등록 실패는 다음 방문 때 재시도 */
    });
  }, 3000);
}

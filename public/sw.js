/**
 * sw.js — 푸시 알림 전용 서비스워커.
 *
 * ⚠️ fetch 핸들러 의도적 부재 — 오프라인 캐싱을 하지 않는다.
 * Cloudflare 빌드 스테일 사고 (docs/postmortem-phase3-false-completion.md) 이후
 * 캐싱 레이어는 별도 검토 전까지 도입 금지. SW 는 push/notificationclick 만 처리.
 */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    /* payload 가 JSON 이 아니면 기본 카피 사용 */
  }
  const title = data.title || '퀘스트디피';
  const options = {
    body: data.body || '오늘의 학습을 시작해보세요! 하루 10분이면 충분해요.',
    icon: '/logo/questdp-app-icon.png',
    badge: '/logo/questdp-app-icon.png',
    tag: data.tag || 'questdp-daily-reminder', // 같은 tag 는 중복 표시 대신 교체
    data: { url: data.url || '/#/game' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/#/game';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windows) => {
        // 이미 열린 탭이 있으면 재사용, 없으면 새 창
        for (const client of windows) {
          if ('focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      }),
  );
});

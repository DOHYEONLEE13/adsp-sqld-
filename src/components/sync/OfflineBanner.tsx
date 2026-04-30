/**
 * OfflineBanner — 네트워크 끊김 알림 sticky 1줄 banner.
 *
 * 위치: 헤더 바로 아래 (App.tsx 의 컨텐트 위 fixed/sticky).
 * 표시 조건: navigator.onLine === false.
 * 풀이는 그대로 진행 가능 — 학습 자체는 차단 X (sessionSync 의 outbox 가 큐잉).
 *
 * 사용자 동작:
 *  - [닫기]: 세션 동안 숨김 (sessionStorage)
 *  - 네트워크 복귀 시 자동 사라짐 (online 이벤트)
 */

import { useEffect, useState } from 'react';
import { WifiOff, X } from 'lucide-react';
import { useOnlineStatus } from './useOnlineStatus';

const DISMISS_KEY = 'questdp.offline.dismissed.v1';

export default function OfflineBanner() {
  const online = useOnlineStatus();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  // 네트워크 복귀 시 dismiss 상태 리셋 — 다음 끊김에 다시 노출.
  useEffect(() => {
    if (online && dismissed) {
      try {
        window.sessionStorage.removeItem(DISMISS_KEY);
      } catch {
        /* 무시 */
      }
      setDismissed(false);
    }
  }, [online, dismissed]);

  if (online) return null;
  if (dismissed) return null;

  return (
    <div
      className="sticky top-0 z-40 flex items-center justify-center gap-2 px-3 py-2 text-[12px] kr-body"
      style={{
        background: 'rgba(255,176,32,0.16)',
        borderBottom: '1px solid rgba(255,176,32,0.45)',
        color: '#FFB020',
      }}
      role="status"
    >
      <WifiOff size={14} strokeWidth={2.4} />
      <span className="leading-[1.6]">
        오프라인 — 풀이는 계속 가능, 일부 데이터는 네트워크 복귀 시 동기화돼요.
      </span>
      <button
        type="button"
        onClick={() => {
          try {
            window.sessionStorage.setItem(DISMISS_KEY, '1');
          } catch {
            /* 무시 */
          }
          setDismissed(true);
        }}
        aria-label="알림 닫기"
        className="inline-flex items-center justify-center w-6 h-6 rounded-full transition hover:bg-white/10 ml-2"
      >
        <X size={12} strokeWidth={2.4} />
      </button>
    </div>
  );
}

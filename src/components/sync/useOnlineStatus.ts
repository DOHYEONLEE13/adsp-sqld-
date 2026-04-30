/**
 * useOnlineStatus — 브라우저의 navigator.onLine 을 reactively 추적.
 *
 * online / offline 이벤트 구독. 초기값은 navigator.onLine.
 * 노트: navigator.onLine 은 일부 브라우저에서 잘못 reportf 함 — 단순 신호로만 활용.
 */

import { useEffect, useState } from 'react';

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  });

  useEffect(() => {
    const onOn = () => setOnline(true);
    const onOff = () => setOnline(false);
    window.addEventListener('online', onOn);
    window.addEventListener('offline', onOff);
    return () => {
      window.removeEventListener('online', onOn);
      window.removeEventListener('offline', onOff);
    };
  }, []);

  return online;
}

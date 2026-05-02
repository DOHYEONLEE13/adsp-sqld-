/**
 * useDevUnlockFlags — admin 검수 모드 (모든 step·pass 잠금해제) localStorage 토글
 * 의 [반응형] hook.
 *
 * AdminPage 의 토글 버튼이 localStorage 를 set 하고 `dev-unlock-changed` 커스텀
 * 이벤트를 dispatch 하면, 이 hook 을 쓰는 컴포넌트들이 즉시 re-render 됩니다.
 * (페이지 reload 없이 ZoneScreen / GamePage / 마무리 잠금이 즉각 풀림.)
 *
 * 다른 탭에서 변경 시에도 'storage' 이벤트로 동기화.
 */

import { useEffect, useState } from 'react';
import { DEV_UNLOCK_KEY, isDevUnlockEnabled } from './passes';
import { DEV_UNLOCK_STEPS_KEY, isDevUnlockStepsEnabled } from './stepUnlocks';

/** dev unlock 토글이 변경될 때 dispatch 할 커스텀 이벤트명. */
export const DEV_UNLOCK_EVENT = 'dev-unlock-changed';

export interface DevUnlockFlags {
  /** 모든 N회독 (passes) 잠금 해제. */
  passes: boolean;
  /** 모든 step (chapter 내 순차) 잠금 해제. */
  steps: boolean;
  /** 둘 다 ON 인지 — 검수 모드 통합 상태. */
  any: boolean;
}

function readFlags(): DevUnlockFlags {
  const passes = isDevUnlockEnabled();
  const steps = isDevUnlockStepsEnabled();
  return { passes, steps, any: passes || steps };
}

export function useDevUnlockFlags(): DevUnlockFlags {
  const [flags, setFlags] = useState<DevUnlockFlags>(() => readFlags());
  useEffect(() => {
    const update = () => setFlags(readFlags());
    // 같은 탭 내 변경 — AdminPage 토글이 dispatchEvent 호출 시
    window.addEventListener(DEV_UNLOCK_EVENT, update);
    // 다른 탭 변경 — storage 이벤트
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === DEV_UNLOCK_KEY ||
        e.key === DEV_UNLOCK_STEPS_KEY ||
        e.key === null /* localStorage.clear() */
      ) {
        update();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(DEV_UNLOCK_EVENT, update);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  return flags;
}

/**
 * AdminPage 등에서 dev unlock 토글 ON/OFF 시 호출. localStorage write +
 * 같은 탭 내 hook 사용 컴포넌트들에게 즉시 알림 (reload 불필요).
 */
export function setDevUnlockFlags(next: { passes: boolean; steps: boolean }) {
  if (typeof window === 'undefined') return;
  if (next.passes) window.localStorage.setItem(DEV_UNLOCK_KEY, '1');
  else window.localStorage.removeItem(DEV_UNLOCK_KEY);
  if (next.steps) window.localStorage.setItem(DEV_UNLOCK_STEPS_KEY, '1');
  else window.localStorage.removeItem(DEV_UNLOCK_STEPS_KEY);
  // 같은 탭 내 모든 useDevUnlockFlags 구독자에게 즉시 알림
  window.dispatchEvent(new Event(DEV_UNLOCK_EVENT));
}

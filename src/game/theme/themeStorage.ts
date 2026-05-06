/**
 * themeStorage.ts — 사용자가 선택한 ambient 테마 id 저장 + pub/sub.
 *
 * 게스트·인증 사용자 공통 — localStorage. 인증 사용자 전용 동기화는 v1.1 에서
 * profiles.theme_id 컬럼 추가 시 옵트인.
 *
 * publish/subscribe 패턴 — GlobalAmbientBg 가 setTheme 호출 즉시 재렌더.
 */

import { DEFAULT_THEME_ID } from './themes';

const STORAGE_KEY = 'questdp.theme.id.v1';

let _current: string = loadInitial();
const _listeners = new Set<(themeId: string) => void>();

function loadInitial(): string {
  if (typeof window === 'undefined') return DEFAULT_THEME_ID;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && typeof raw === 'string') return raw;
  } catch {
    /* 무시 */
  }
  return DEFAULT_THEME_ID;
}

export function getCurrentThemeId(): string {
  return _current;
}

export function setCurrentThemeId(id: string): void {
  if (id === _current) return;
  _current = id;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* quota — silent */
    }
  }
  for (const cb of _listeners) {
    try {
      cb(id);
    } catch {
      /* listener 에러 격리 */
    }
  }
}

export function subscribeTheme(cb: (themeId: string) => void): () => void {
  _listeners.add(cb);
  return () => {
    _listeners.delete(cb);
  };
}

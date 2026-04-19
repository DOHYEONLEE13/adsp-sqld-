/**
 * React hook — 진행 저장소를 구독합니다.
 * useSyncExternalStore 로 SSR 안전 + tearing 방지.
 */

import { useSyncExternalStore } from 'react';
import { getSnapshot, subscribe, type ProgressStore } from './storage';

export function useProgress(): ProgressStore {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

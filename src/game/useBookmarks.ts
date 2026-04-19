/**
 * useBookmarks — bookmarks slice 를 구독하는 훅.
 * getSnapshot 은 mutation 때만 새 참조라서 useSyncExternalStore 와 잘 맞습니다.
 */
import { useSyncExternalStore } from 'react';
import { getSnapshot, subscribe, type BookmarkStore } from './bookmarks';

export function useBookmarks(): BookmarkStore {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

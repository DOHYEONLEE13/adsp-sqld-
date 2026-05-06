/**
 * useTheme — themeStorage 구독 React hook.
 *
 * 반환값은 현재 선택된 Theme 객체 (themes.ts 의 getThemeById 가 fallback 처리).
 */

import { useEffect, useState } from 'react';
import { getThemeById, type Theme } from './themes';
import {
  getCurrentThemeId,
  subscribeTheme,
} from './themeStorage';

export function useTheme(): Theme {
  const [id, setId] = useState<string>(() => getCurrentThemeId());
  useEffect(() => subscribeTheme(setId), []);
  return getThemeById(id);
}

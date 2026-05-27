const APP_MODE_SESSION_KEY = 'questdp.appMode';

function canUseSessionStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function isAppEntryPath(pathname: string): boolean {
  return pathname === '/app' || pathname === '/app/';
}

export function markAppModeFromLocation(): void {
  if (typeof window === 'undefined' || !canUseSessionStorage()) return;

  const params = new URLSearchParams(window.location.search);
  if (isAppEntryPath(window.location.pathname) || params.get('app') === '1') {
    window.sessionStorage.setItem(APP_MODE_SESSION_KEY, '1');
  }
}

export function isAppMode(): boolean {
  if (typeof window === 'undefined') return false;
  if (isAppEntryPath(window.location.pathname)) return true;
  if (!canUseSessionStorage()) return false;
  return window.sessionStorage.getItem(APP_MODE_SESSION_KEY) === '1';
}

export function openWebOrAppPremiumEntry(): void {
  if (typeof window === 'undefined') return;

  if (isAppMode()) {
    window.dispatchEvent(new CustomEvent('questdp:app-billing-request'));
    return;
  }

  window.location.href = '/#pricing';
}

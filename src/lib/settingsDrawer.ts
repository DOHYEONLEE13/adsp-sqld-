export const SETTINGS_DRAWER_EVENT = 'questdp:settings-drawer-open';
export const SETTINGS_DRAWER_STATE_EVENT = 'questdp:settings-drawer-state';

let drawerOpen = false;

export function setSettingsDrawerOpen(open: boolean) {
  if (drawerOpen === open) return;
  drawerOpen = open;
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(SETTINGS_DRAWER_STATE_EVENT, { detail: { open } }),
  );
}

export function getSettingsDrawerOpen() {
  return drawerOpen;
}

export function subscribeSettingsDrawer(listener: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(SETTINGS_DRAWER_STATE_EVENT, listener);
  return () => window.removeEventListener(SETTINGS_DRAWER_STATE_EVENT, listener);
}

export function openSettingsDrawer() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SETTINGS_DRAWER_EVENT));
}

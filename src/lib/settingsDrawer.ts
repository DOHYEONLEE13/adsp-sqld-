export const SETTINGS_DRAWER_EVENT = 'questdp:settings-drawer-open';

export function openSettingsDrawer() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SETTINGS_DRAWER_EVENT));
}

const APP_SCROLL_SELECTOR = '.questdp-route-layer';

function isAppScrollMode(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('questdp-app-mode');
}

export function getAppScrollSurface(): HTMLElement | null {
  if (typeof document === 'undefined' || !isAppScrollMode()) return null;
  return document.querySelector<HTMLElement>(APP_SCROLL_SELECTOR);
}

export function getPageScrollY(): number {
  const surface = getAppScrollSurface();
  if (surface) return surface.scrollTop;
  if (typeof window === 'undefined') return 0;
  return window.scrollY;
}

export function scrollPageTo(options: ScrollToOptions): void {
  const surface = getAppScrollSurface();
  if (surface) {
    surface.scrollTo(options);
    return;
  }
  if (typeof window !== 'undefined') {
    window.scrollTo(options);
  }
}

export function scrollElementIntoPageView(
  target: HTMLElement,
  offset = 0,
  behavior: ScrollBehavior = 'smooth',
): void {
  const surface = getAppScrollSurface();
  if (surface) {
    const targetRect = target.getBoundingClientRect();
    const surfaceRect = surface.getBoundingClientRect();
    const nextTop = targetRect.top - surfaceRect.top + surface.scrollTop - offset;
    surface.scrollTo({ top: Math.max(0, nextTop), behavior });
    return;
  }

  if (typeof window === 'undefined') return;
  const rect = target.getBoundingClientRect();
  const nextTop = rect.top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, nextTop), behavior });
}

const APP_MODE_SESSION_KEY = 'questdp.appMode';
const APP_MODE_CLASS = 'questdp-app-mode';
const APP_MODE_THEME_COLOR = '#081642';
export const PREMIUM_PLAN_EVENT = 'questdp:premium-plan-open';
export const ENERGY_SHOP_EVENT = 'questdp:energy-shop-open';

const FIRST_ENTRY_BYPASS_HASH_PREFIXES = [
  '/onboarding',
  '/payment/callback',
  '/redeem',
  '/refund-request',
] as const;

export function resolveInitialAppRouteHash(
  initialHash: string,
  appModeActive: boolean,
  onboardingRequired: boolean,
): string {
  const normalized = initialHash.replace(/^#/, '').replace(/\/$/, '');
  if (!appModeActive || !onboardingRequired) return normalized;

  const canBypassFirstEntry = FIRST_ENTRY_BYPASS_HASH_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}?`),
  );
  return canBypassFirstEntry ? normalized : '/onboarding';
}

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
  if (new URLSearchParams(window.location.search).get('app') === '1') return true;
  if (!canUseSessionStorage()) return false;
  return window.sessionStorage.getItem(APP_MODE_SESSION_KEY) === '1';
}

export function installAppModeChrome(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }
  if (!isAppMode()) return () => {};

  const root = document.documentElement;
  root.classList.add(APP_MODE_CLASS);

  const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const previousThemeColor = themeMeta?.getAttribute('content') ?? null;
  if (themeMeta) {
    themeMeta.setAttribute('content', APP_MODE_THEME_COLOR);
  }

  const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  const previousManifestHref = manifestLink?.getAttribute('href') ?? null;
  if (manifestLink) {
    manifestLink.setAttribute('href', '/app.webmanifest');
  }

  let touchStartY = 0;
  const onTouchStart = (event: TouchEvent) => {
    touchStartY = event.touches[0]?.clientY ?? 0;
  };
  const onTouchMove = (event: TouchEvent) => {
    const currentY = event.touches[0]?.clientY ?? 0;
    const appScrollSurface = document.querySelector<HTMLElement>('.questdp-route-layer');
    const scrollTop = appScrollSurface?.scrollTop ?? window.scrollY;
    const pullingDownAtTop = scrollTop <= 0 && currentY - touchStartY > 8;
    if (pullingDownAtTop) {
      event.preventDefault();
    }
  };

  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });

  return () => {
    root.classList.remove(APP_MODE_CLASS);
    if (themeMeta && previousThemeColor) {
      themeMeta.setAttribute('content', previousThemeColor);
    }
    if (manifestLink && previousManifestHref) {
      manifestLink.setAttribute('href', previousManifestHref);
    }
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
  };
}

export function refreshAppSurface(): void {
  if (typeof window === 'undefined') return;

  const target = new URL(window.location.href);
  target.searchParams.set('app', '1');
  target.searchParams.set('v', String(Date.now()));

  const navigate = () => {
    window.location.replace(target.toString());
  };

  if ('caches' in window) {
    window.caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => window.caches.delete(key))))
      .catch(() => undefined)
      .finally(navigate);
    return;
  }

  navigate();
}

export function openWebOrAppPremiumEntry(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PREMIUM_PLAN_EVENT));
}

export function openEnergyShop(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ENERGY_SHOP_EVENT));
}

export async function requestWebOrAppPremiumPurchase(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (isAppMode()) {
    await import('@/lib/playBilling')
      .then(({ requestPlayPremiumSubscription }) => requestPlayPremiumSubscription())
      .then((result) => {
        if (result.reason === 'cancelled') return;
        window.dispatchEvent(
          new CustomEvent('questdp:app-billing-request', {
            detail: result,
          }),
        );
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : 'Google Play 결제를 시작하지 못했어요.';
        window.dispatchEvent(
          new CustomEvent('questdp:app-billing-request', {
            detail: {
              ok: false,
              reason: 'error',
              message,
            },
          }),
        );
      });
    return;
  }

  window.location.href = '/#pricing';
}

import { needsOnboarding } from '@/game/onboarding/onboardingStorage';
import {
  getAuthSnapshot,
  type AuthStatus,
} from '@/lib/auth/sessionStore';

export function resolvePlayEntryHash(
  authStatus: AuthStatus,
  onboardingRequired: boolean,
): '#/onboarding' | '#/game' {
  if (authStatus !== 'authenticated') return '#/onboarding';
  return onboardingRequired ? '#/onboarding' : '#/game';
}

export function getPlayEntryHash(): '#/onboarding' | '#/game' {
  return resolvePlayEntryHash(getAuthSnapshot().status, needsOnboarding());
}

export function openPlayEntry(): void {
  if (typeof window === 'undefined') return;
  window.location.hash = getPlayEntryHash().slice(1);
}

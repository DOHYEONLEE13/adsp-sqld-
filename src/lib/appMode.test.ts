import { describe, expect, it } from 'vitest';
import { resolveInitialAppRouteHash } from './appMode';

describe('resolveInitialAppRouteHash', () => {
  it.each(['', '/home', '/game', '/login', '/quests'])(
    'sends a fresh app launch from %s to onboarding',
    (initialHash) => {
      expect(resolveInitialAppRouteHash(initialHash, true, true)).toBe('/onboarding');
    },
  );

  it('keeps auth callbacks available during first entry', () => {
    expect(resolveInitialAppRouteHash('/payment/callback', true, true)).toBe(
      '/payment/callback',
    );
  });

  it('keeps login when onboarding has already been completed', () => {
    expect(resolveInitialAppRouteHash('/login', true, false)).toBe('/login');
  });

  it('does not change the regular web login route', () => {
    expect(resolveInitialAppRouteHash('/login', false, true)).toBe('/login');
  });
});

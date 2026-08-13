// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { getPlayEntryHash, resolvePlayEntryHash } from './playEntry';

describe('getPlayEntryHash', () => {
  beforeEach(() => window.localStorage.clear());

  it('sends a first-time visitor to onboarding', () => {
    expect(getPlayEntryHash()).toBe('#/onboarding');
  });

  it('still sends a signed-out visitor with old onboarding data to onboarding', () => {
    window.localStorage.setItem(
      'questdp_onboarding_v4',
      JSON.stringify({
        persona: 'beginner',
        background: 'novice',
        exams: ['adsp'],
        exam_dates: {},
        daily_minutes: 30,
        study_style: 'distributed',
        completed_at: new Date().toISOString(),
        version: 1,
      }),
    );

    expect(getPlayEntryHash()).toBe('#/onboarding');
  });

  it('opens the game only after authentication and onboarding', () => {
    expect(resolvePlayEntryHash('authenticated', false)).toBe('#/game');
    expect(resolvePlayEntryHash('authenticated', true)).toBe('#/onboarding');
  });
});

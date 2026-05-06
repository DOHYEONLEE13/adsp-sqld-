import { describe, it, expect, beforeEach } from 'vitest';
import {
  markActive,
  getLastActive,
  inactivityDays,
  clearLastActive,
} from './lastActive';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('lastActive', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') window.localStorage?.clear();
  });

  it('초기 → null', () => {
    if (typeof window === 'undefined') return;
    expect(getLastActive()).toBeNull();
  });

  it('markActive → getLastActive 반영', () => {
    if (typeof window === 'undefined') return;
    const t = Date.parse('2026-05-01T00:00:00.000Z');
    markActive(t);
    expect(getLastActive()?.getTime()).toBe(t);
  });

  it('inactivityDays — 0일', () => {
    if (typeof window === 'undefined') return;
    const now = Date.now();
    markActive(now);
    expect(inactivityDays(now)).toBe(0);
  });

  it('inactivityDays — 5일', () => {
    if (typeof window === 'undefined') return;
    const now = Date.now();
    markActive(now - 5 * DAY_MS);
    expect(inactivityDays(now)).toBe(5);
  });

  it('미설정 → 0일 (신규 사용자)', () => {
    if (typeof window === 'undefined') return;
    expect(inactivityDays(Date.now())).toBe(0);
  });

  it('clearLastActive → null', () => {
    if (typeof window === 'undefined') return;
    markActive();
    clearLastActive();
    expect(getLastActive()).toBeNull();
  });

  it('손상된 값 → null', () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('questdp.lastActiveAt', 'not-a-number');
    expect(getLastActive()).toBeNull();
  });
});

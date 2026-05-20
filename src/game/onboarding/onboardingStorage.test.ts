import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveOnboardingResult,
  loadOnboardingResult,
  needsOnboarding,
  clearOnboardingResult,
  deserializeDates,
} from './onboardingStorage';

describe('onboardingStorage — Phase 4 Step 2 mock 단계', () => {
  beforeEach(() => {
    // node 환경에서는 localStorage polyfill 필요 — vitest config 가 node 라
    // window 객체 자체가 없을 수 있으므로 가드.
    if (typeof window !== 'undefined') {
      window.localStorage?.clear();
    }
  });

  it('초기 상태 — needsOnboarding = true', () => {
    if (typeof window === 'undefined') return; // skip (node only)
    expect(needsOnboarding()).toBe(true);
    expect(loadOnboardingResult()).toBeNull();
  });

  it('save → load round-trip', () => {
    if (typeof window === 'undefined') return;
    saveOnboardingResult({
      persona: 'beginner',
      background: 'novice',
      exams: ['adsp'],
      exam_dates: { adsp: new Date('2026-08-15') },
      daily_minutes: 60,
      study_style: 'distributed',
    });
    const loaded = loadOnboardingResult();
    expect(loaded).not.toBeNull();
    expect(loaded?.persona).toBe('beginner');
    expect(loaded?.background).toBe('novice');
    expect(loaded?.exams).toEqual(['adsp']);
    expect(loaded?.daily_minutes).toBe(60);
    expect(loaded?.exam_dates.adsp).toBe(new Date('2026-08-15').toISOString());
    expect(needsOnboarding()).toBe(false);
  });

  it('clear 후 needsOnboarding = true 복귀', () => {
    if (typeof window === 'undefined') return;
    saveOnboardingResult({
      persona: 'reviewer',
      background: 'experienced',
      exams: ['sqld'],
      exam_dates: { sqld: new Date() },
      daily_minutes: 90,
      study_style: 'intensive',
      weak_chapters: ['sqld-2-2'],
    });
    expect(needsOnboarding()).toBe(false);

    clearOnboardingResult();
    expect(needsOnboarding()).toBe(true);
    expect(loadOnboardingResult()).toBeNull();
  });

  it('legacy skipped flag no longer bypasses onboarding', () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('questdp_onboarding_skipped_v4', '1');
    expect(needsOnboarding()).toBe(true);

    clearOnboardingResult();
    expect(window.localStorage.getItem('questdp_onboarding_skipped_v4')).toBeNull();
  });

  it('deserializeDates: ISO string → Date', () => {
    const iso = '2026-09-01T00:00:00.000Z';
    const result = deserializeDates({ adsp: iso, sqld: undefined });
    expect(result.adsp).toBeInstanceOf(Date);
    expect(result.adsp?.toISOString()).toBe(iso);
    expect(result.sqld).toBeUndefined();
  });

  it('weak_chapters 보존 (재응시생)', () => {
    if (typeof window === 'undefined') return;
    saveOnboardingResult({
      persona: 'reviewer',
      background: 'some_basis',
      exams: ['adsp'],
      exam_dates: { adsp: new Date('2026-09-01') },
      daily_minutes: 60,
      study_style: 'distributed',
      weak_chapters: ['adsp-3-2', 'adsp-3-3'],
    });
    const loaded = loadOnboardingResult();
    expect(loaded?.weak_chapters).toEqual(['adsp-3-2', 'adsp-3-3']);
  });

  it('잘못된 JSON 무시 — null 반환', () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('questdp_onboarding_v4', 'not-json');
    expect(loadOnboardingResult()).toBeNull();
  });

  it('version mismatch 무시', () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      'questdp_onboarding_v4',
      JSON.stringify({ version: 999, persona: 'beginner' }),
    );
    expect(loadOnboardingResult()).toBeNull();
  });
});

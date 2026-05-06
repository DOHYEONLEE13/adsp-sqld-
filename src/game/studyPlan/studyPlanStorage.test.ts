import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveStudyPlan,
  loadStudyPlan,
  clearStudyPlan,
  hasStudyPlan,
} from './studyPlanStorage';
import { generateBeginnerPlan, generateReviewerPlan } from './studyPlanGenerator';

describe('studyPlanStorage', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage?.clear();
    }
  });

  it('초기 상태 — loadStudyPlan = null', () => {
    if (typeof window === 'undefined') return;
    expect(loadStudyPlan()).toBeNull();
    expect(hasStudyPlan()).toBe(false);
  });

  it('save → load round-trip (입문자 plan)', () => {
    if (typeof window === 'undefined') return;
    const plan = generateBeginnerPlan({
      user_id: 'u',
      exam: 'adsp',
      exam_date: new Date('2026-08-08'),
      daily_minutes: 60,
      study_style: 'distributed',
      background: 'novice',
      now: new Date('2026-05-01').getTime(),
    });
    saveStudyPlan(plan);
    const loaded = loadStudyPlan();
    expect(loaded).not.toBeNull();
    expect(loaded?.plan_id).toBe(plan.plan_id);
    expect(loaded?.exam).toBe('adsp');
    expect(loaded?.required_total_hours).toBe(55);
    expect(loaded?.weeks.length).toBe(plan.weeks.length);
  });

  it('Date 필드가 Date 객체로 복원', () => {
    if (typeof window === 'undefined') return;
    const plan = generateBeginnerPlan({
      user_id: 'u',
      exam: 'adsp',
      exam_date: new Date('2026-08-08'),
      daily_minutes: 60,
      study_style: 'distributed',
      background: 'novice',
    });
    saveStudyPlan(plan);
    const loaded = loadStudyPlan();
    expect(loaded?.d_day).toBeInstanceOf(Date);
    expect(loaded?.created_at).toBeInstanceOf(Date);
    expect(loaded?.weeks[0]?.start_date).toBeInstanceOf(Date);
  });

  it('재응시생 plan — weak_chapter_ids 보존', () => {
    if (typeof window === 'undefined') return;
    const plan = generateReviewerPlan({
      user_id: 'u',
      exam: 'adsp',
      exam_date: new Date('2026-08-08'),
      daily_minutes: 60,
      study_style: 'distributed',
      weak_chapters: ['adsp-3-stats', 'adsp-3-4'],
      now: new Date('2026-05-01').getTime(),
    });
    saveStudyPlan(plan);
    const loaded = loadStudyPlan() as typeof plan;
    expect(loaded.weak_chapter_ids).toEqual(['adsp-3-stats', 'adsp-3-4']);
  });

  it('clearStudyPlan → load = null', () => {
    if (typeof window === 'undefined') return;
    const plan = generateBeginnerPlan({
      user_id: 'u',
      exam: 'sqld',
      exam_date: new Date('2026-08-22'),
      daily_minutes: 90,
      study_style: 'intensive',
      background: 'some_basis',
    });
    saveStudyPlan(plan);
    expect(hasStudyPlan()).toBe(true);
    clearStudyPlan();
    expect(loadStudyPlan()).toBeNull();
    expect(hasStudyPlan()).toBe(false);
  });

  it('잘못된 JSON → null 반환 (silent)', () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('questdp_study_plan_v1', 'not-json');
    expect(loadStudyPlan()).toBeNull();
  });

  it('schema 버전 mismatch → null', () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      'questdp_study_plan_v1',
      JSON.stringify({ _v: 999, plan_id: 'x' }),
    );
    expect(loadStudyPlan()).toBeNull();
  });

  it('새 plan 저장 → 이전 plan 덮어씀', () => {
    if (typeof window === 'undefined') return;
    const planA = generateBeginnerPlan({
      user_id: 'u',
      exam: 'adsp',
      exam_date: new Date('2026-08-08'),
      daily_minutes: 60,
      study_style: 'distributed',
      background: 'novice',
    });
    saveStudyPlan(planA);
    const planB = generateBeginnerPlan({
      user_id: 'u',
      exam: 'sqld',
      exam_date: new Date('2026-08-22'),
      daily_minutes: 90,
      study_style: 'intensive',
      background: 'some_basis',
    });
    saveStudyPlan(planB);
    const loaded = loadStudyPlan();
    expect(loaded?.exam).toBe('sqld');
    expect(loaded?.required_total_hours).toBe(22);
  });
});

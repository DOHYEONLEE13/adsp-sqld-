import { describe, it, expect } from 'vitest';
import {
  initialOnboardingState,
  reduce,
  isComplete,
} from './onboardingState';

describe('Onboarding state machine — Phase 4 Step 2', () => {
  describe('초기 상태', () => {
    it('q1_persona 에서 시작', () => {
      const s = initialOnboardingState();
      expect(s.current_step).toBe('q1_persona');
      expect(s.persona).toBe('unknown');
      expect(s.exams).toEqual([]);
      expect(s.history).toEqual([]);
    });

    it('isComplete 는 초기 상태에서 false', () => {
      expect(isComplete(initialOnboardingState())).toBe(false);
    });
  });

  describe('Q1 페르소나 선택', () => {
    it('beginner 선택 → q2_exam 으로', () => {
      const s = reduce(initialOnboardingState(), { type: 'q1_answer', persona: 'beginner' });
      expect(s.current_step).toBe('q2_exam');
      expect(s.persona).toBe('beginner');
      expect(s.history).toEqual(['q1_persona']);
    });

    it('reviewer 선택 → q2_exam 으로', () => {
      const s = reduce(initialOnboardingState(), { type: 'q1_answer', persona: 'reviewer' });
      expect(s.current_step).toBe('q2_exam');
      expect(s.persona).toBe('reviewer');
    });

    it('unknown 선택 시 진행 X', () => {
      const s = reduce(initialOnboardingState(), { type: 'q1_answer', persona: 'unknown' });
      expect(s.current_step).toBe('q1_persona');
      expect(s.persona).toBe('unknown');
    });
  });

  describe('입문자 흐름 (Q1→Q2→Q3→Q4→Q5→Q6→done)', () => {
    it('전체 시나리오', () => {
      let s = initialOnboardingState();
      s = reduce(s, { type: 'q1_answer', persona: 'beginner' });
      s = reduce(s, { type: 'q2_answer', exams: ['adsp'] });
      expect(s.current_step).toBe('q3_beginner_background');

      s = reduce(s, { type: 'q3_beginner_answer', background: 'novice' });
      expect(s.current_step).toBe('q4_beginner_exam_date');

      s = reduce(s, {
        type: 'q4_beginner_answer',
        exam_dates: { adsp: new Date('2026-08-15') },
      });
      expect(s.current_step).toBe('q5_beginner_daily_minutes');

      s = reduce(s, { type: 'q5_beginner_answer', daily_minutes: 60 });
      expect(s.current_step).toBe('q6_beginner_study_style');

      s = reduce(s, { type: 'q6_beginner_answer', study_style: 'distributed' });
      expect(s.current_step).toBe('done');

      expect(isComplete(s)).toBe(true);
      expect(s.persona).toBe('beginner');
      expect(s.background).toBe('novice');
      expect(s.daily_minutes).toBe(60);
      expect(s.study_style).toBe('distributed');
    });

    it('daily_minutes 가 5~600 범위 밖이면 진행 X', () => {
      let s = initialOnboardingState();
      s = reduce(s, { type: 'q1_answer', persona: 'beginner' });
      s = reduce(s, { type: 'q2_answer', exams: ['sqld'] });
      s = reduce(s, { type: 'q3_beginner_answer', background: 'experienced' });
      s = reduce(s, { type: 'q4_beginner_answer', exam_dates: { sqld: new Date() } });
      const before = s.current_step;

      const tooSmall = reduce(s, { type: 'q5_beginner_answer', daily_minutes: 4 });
      expect(tooSmall.current_step).toBe(before);

      const tooBig = reduce(s, { type: 'q5_beginner_answer', daily_minutes: 601 });
      expect(tooBig.current_step).toBe(before);

      const ok = reduce(s, { type: 'q5_beginner_answer', daily_minutes: 30 });
      expect(ok.current_step).toBe('q6_beginner_study_style');
    });

    it('exams 빈 배열이면 q2 통과 X', () => {
      let s = initialOnboardingState();
      s = reduce(s, { type: 'q1_answer', persona: 'beginner' });
      const blocked = reduce(s, { type: 'q2_answer', exams: [] });
      expect(blocked.current_step).toBe('q2_exam');
    });
  });

  describe('재응시생 흐름 — 메타인지형', () => {
    it('Q3 metacognitive → q4_reviewer_weak_chapters → done', () => {
      let s = initialOnboardingState();
      s = reduce(s, { type: 'q1_answer', persona: 'reviewer' });
      s = reduce(s, { type: 'q2_answer', exams: ['adsp'] });
      expect(s.current_step).toBe('q3_reviewer_weak_known');

      s = reduce(s, { type: 'q3_reviewer_answer', choice: 'metacognitive' });
      expect(s.current_step).toBe('q4_reviewer_weak_chapters');

      s = reduce(s, {
        type: 'q4_reviewer_answer',
        weak_chapters: ['adsp-3-2', 'adsp-3-3'],
        exam_dates: { adsp: new Date('2026-09-01') },
      });
      expect(s.current_step).toBe('done');
      expect(s.weak_chapters).toEqual(['adsp-3-2', 'adsp-3-3']);
      expect(isComplete(s)).toBe(true);
    });

    it('weak_chapters 빈 배열 차단', () => {
      let s = initialOnboardingState();
      s = reduce(s, { type: 'q1_answer', persona: 'reviewer' });
      s = reduce(s, { type: 'q2_answer', exams: ['adsp'] });
      s = reduce(s, { type: 'q3_reviewer_answer', choice: 'metacognitive' });

      const blocked = reduce(s, {
        type: 'q4_reviewer_answer',
        weak_chapters: [],
        exam_dates: { adsp: new Date() },
      });
      expect(blocked.current_step).toBe('q4_reviewer_weak_chapters');
    });
  });

  describe('재응시생 흐름 — 진단형', () => {
    it('Q3 diagnostic → reviewer_diagnostic_entry → diagnostic_complete → done', () => {
      let s = initialOnboardingState();
      s = reduce(s, { type: 'q1_answer', persona: 'reviewer' });
      s = reduce(s, { type: 'q2_answer', exams: ['sqld'] });
      s = reduce(s, { type: 'q3_reviewer_answer', choice: 'diagnostic' });
      expect(s.current_step).toBe('reviewer_diagnostic_entry');

      s = reduce(s, {
        type: 'diagnostic_complete',
        weak_chapters: ['sqld-2-2', 'sqld-2-3'],
      });
      expect(s.current_step).toBe('done');
      expect(s.weak_chapters).toEqual(['sqld-2-2', 'sqld-2-3']);
      expect(isComplete(s)).toBe(true);
    });
  });

  describe('재응시생 → 입문자 흐름 (정체성 보존)', () => {
    it('Q3 fallback_beginner → 입문자 단계 진입 + persona reviewer 보존 + weak_chapters=[]', () => {
      let s = initialOnboardingState();
      s = reduce(s, { type: 'q1_answer', persona: 'reviewer' });
      s = reduce(s, { type: 'q2_answer', exams: ['adsp'] });
      s = reduce(s, { type: 'q3_reviewer_answer', choice: 'fallback_beginner' });
      // 흐름은 입문자 단계 (background 입력) 로 진입
      expect(s.current_step).toBe('q3_beginner_background');
      // 정체성은 reviewer 유지 — "이미 공부한 적 있어" 사용자에게
      // PassTabs 라벨 "약점 학습"/"복습" 적용 위함
      expect(s.persona).toBe('reviewer');
      // weak_chapters = [] — isComplete 통과 (reviewer 분기 검사)
      expect(s.weak_chapters).toEqual([]);
    });
  });

  describe('back 동작', () => {
    it('back 으로 이전 단계 복귀', () => {
      let s = initialOnboardingState();
      s = reduce(s, { type: 'q1_answer', persona: 'beginner' });
      s = reduce(s, { type: 'q2_answer', exams: ['adsp'] });
      expect(s.current_step).toBe('q3_beginner_background');

      s = reduce(s, { type: 'back' });
      expect(s.current_step).toBe('q2_exam');

      s = reduce(s, { type: 'back' });
      expect(s.current_step).toBe('q1_persona');

      // 초기 상태에서 back — no-op
      const stayed = reduce(s, { type: 'back' });
      expect(stayed.current_step).toBe('q1_persona');
      expect(stayed.history).toEqual([]);
    });
  });

  describe('잘못된 event 무시', () => {
    it('q1_persona 에서 q2_answer 보내면 무시', () => {
      const s = initialOnboardingState();
      const result = reduce(s, { type: 'q2_answer', exams: ['adsp'] });
      expect(result.current_step).toBe('q1_persona');
    });
  });
});

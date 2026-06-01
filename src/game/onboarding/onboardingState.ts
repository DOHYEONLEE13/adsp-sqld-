/**
 * Onboarding 상태 머신 — Phase 4 Step 2.
 *
 * 리서치 1-1·1-2·1-3절 정본.
 *
 * 페르소나 분기:
 *   beginner: Q1→Q2(exam)→Q3(background)→Q4(exam_date)→Q5(daily_minutes)→Q6(study_style)→DONE
 *   reviewer: Q1→Q2(exam)→Q3-rev(weak_known)→{메타인지: Q4-A | 진단: 진단 진입 | 입문자: beginner 분기}
 *
 * 본 모듈은 순수 로직 (UI 비의존). 테스트 친화적.
 */

import type {
  Persona,
  UserBackground,
  StudyStyle,
  LearningExamSubject,
} from '@/types/learning';

type ExamSubject = LearningExamSubject;

/** Onboarding 단계 식별자. */
export type OnboardingStep =
  | 'q1_persona'
  | 'q2_exam'
  | 'q3_beginner_background'   // 입문자 전용
  | 'q3_reviewer_weak_known'   // 재응시생 전용
  | 'q4_beginner_exam_date'    // 입문자
  | 'q4_reviewer_weak_chapters' // 재응시생 메타인지형 — 약점 단원 직접 선택
  | 'q5_beginner_daily_minutes'
  | 'q6_beginner_study_style'
  | 'reviewer_diagnostic_entry' // 재응시생 진단형 → 진단 화면으로 분기
  | 'done';

/** Onboarding 누적 응답. */
export interface OnboardingState {
  persona: Persona;
  exams: ExamSubject[];
  background?: UserBackground;
  exam_dates: { [exam in ExamSubject]?: Date };
  daily_minutes?: number;
  study_style?: StudyStyle;

  /** 재응시생 메타인지형 — 사용자 직접 선택한 약점 chapter id 들. */
  weak_chapters?: string[];

  current_step: OnboardingStep;
  history: OnboardingStep[];
}

/** 초기 상태. */
export function initialOnboardingState(): OnboardingState {
  return {
    persona: 'unknown',
    exams: [],
    exam_dates: {},
    current_step: 'q1_persona',
    history: [],
  };
}

/** 단계별 이벤트 (input → next state). */
export type OnboardingEvent =
  | { type: 'q1_answer'; persona: Persona }
  | { type: 'q2_answer'; exams: ExamSubject[] }
  | { type: 'q3_beginner_answer'; background: UserBackground }
  | { type: 'q3_reviewer_answer'; choice: 'metacognitive' | 'diagnostic' | 'fallback_beginner' }
  | { type: 'q4_beginner_answer'; exam_dates: { [exam in ExamSubject]?: Date } }
  | { type: 'q4_reviewer_answer'; weak_chapters: string[]; exam_dates: { [exam in ExamSubject]?: Date } }
  | { type: 'q5_beginner_answer'; daily_minutes: number }
  | { type: 'q6_beginner_answer'; study_style: StudyStyle }
  | { type: 'diagnostic_complete'; weak_chapters: string[] }
  | { type: 'back' };

/**
 * 상태 전이 — 순수 함수.
 * 잘못된 이벤트가 현재 step 에 들어오면 state 무변화.
 */
export function reduce(state: OnboardingState, event: OnboardingEvent): OnboardingState {
  if (event.type === 'back') {
    if (state.history.length === 0) return state;
    const prev = state.history[state.history.length - 1];
    return {
      ...state,
      current_step: prev,
      history: state.history.slice(0, -1),
    };
  }

  const push = (next: OnboardingStep): Pick<OnboardingState, 'current_step' | 'history'> => ({
    current_step: next,
    history: [...state.history, state.current_step],
  });

  switch (state.current_step) {
    case 'q1_persona': {
      if (event.type !== 'q1_answer') return state;
      // unknown → 다음 단계로 못 감 (의도). beginner/reviewer 만 진행.
      if (event.persona === 'unknown') return state;
      return { ...state, persona: event.persona, ...push('q2_exam') };
    }

    case 'q2_exam': {
      if (event.type !== 'q2_answer') return state;
      if (event.exams.length === 0) return state;
      const next: OnboardingStep =
        state.persona === 'beginner' ? 'q3_beginner_background' : 'q3_reviewer_weak_known';
      return { ...state, exams: event.exams, ...push(next) };
    }

    case 'q3_beginner_background': {
      if (event.type !== 'q3_beginner_answer') return state;
      return { ...state, background: event.background, ...push('q4_beginner_exam_date') };
    }

    case 'q3_reviewer_weak_known': {
      if (event.type !== 'q3_reviewer_answer') return state;
      if (event.choice === 'metacognitive') return { ...state, ...push('q4_reviewer_weak_chapters') };
      if (event.choice === 'diagnostic') return { ...state, ...push('reviewer_diagnostic_entry') };
      // fallback_beginner — "처음부터 다시 보고 싶어"
      // 정체성 보존 (persona='reviewer') + weak_chapters=[] (약점 모르겠다는 의미).
      // 흐름은 입문자 단계 (background/exam_date/daily/style) 거쳐 정보 수집.
      // 결과: PassTabs 라벨 "약점 학습"/"복습" 유지 + isComplete 통과 (weak_chapters !== undefined).
      return {
        ...state,
        weak_chapters: [],
        ...push('q3_beginner_background'),
      };
    }

    case 'q4_beginner_exam_date': {
      if (event.type !== 'q4_beginner_answer') return state;
      return { ...state, exam_dates: event.exam_dates, ...push('q5_beginner_daily_minutes') };
    }

    case 'q4_reviewer_weak_chapters': {
      if (event.type !== 'q4_reviewer_answer') return state;
      if (event.weak_chapters.length === 0) return state;
      return {
        ...state,
        weak_chapters: event.weak_chapters,
        exam_dates: event.exam_dates,
        ...push('done'),
      };
    }

    case 'q5_beginner_daily_minutes': {
      if (event.type !== 'q5_beginner_answer') return state;
      if (event.daily_minutes < 5 || event.daily_minutes > 600) return state;
      return { ...state, daily_minutes: event.daily_minutes, ...push('q6_beginner_study_style') };
    }

    case 'q6_beginner_study_style': {
      if (event.type !== 'q6_beginner_answer') return state;
      return { ...state, study_style: event.study_style, ...push('done') };
    }

    case 'reviewer_diagnostic_entry': {
      if (event.type === 'diagnostic_complete') {
        return {
          ...state,
          weak_chapters: event.weak_chapters,
          ...push('done'),
        };
      }
      return state;
    }

    case 'done':
      return state; // terminal
  }
}

/** Onboarding 완료 검증 — UserProfile 으로 변환 가능한 상태인지. */
export function isComplete(state: OnboardingState): boolean {
  if (state.current_step !== 'done') return false;
  if (state.persona === 'unknown') return false;
  if (state.exams.length === 0) return false;
  if (state.persona === 'beginner') {
    return !!state.background && !!state.daily_minutes && !!state.study_style;
  }
  // reviewer: weak_chapters 가 정의되어 있으면 OK (진단 결과 빈 배열도 valid).
  // - 메타인지형: q4_reviewer_weak_chapters 가 length>0 보장 (reduce 에서 차단)
  // - 진단형: 진단 결과로 들어옴 — 0개 (모두 강점) 도 정상 종료 케이스
  return state.weak_chapters !== undefined;
}

/** Default values for reviewer (background/daily/style 미입력 보충). */
export const REVIEWER_DEFAULTS = {
  background: 'some_basis' as UserBackground,
  daily_minutes: 60,
  study_style: 'distributed' as StudyStyle,
} as const;

/**
 * UserProfile — Phase 4 학습 시스템의 사용자 본체.
 *
 * 리서치 9-1절 정본. 12-1 결정 사항 반영:
 *   - 두 페르소나 분기 (입문자 / 재응시생)
 *   - 사용자 배경 3단계 (비전공자 / 일부 기초 / 경험 있음)
 *   - 페르소나별 학습 시간 (2-1-2절)
 *   - Premium 명명 (Q1 결정, 2026-05-05 갱신)
 *   - 5개 네비게이터 (진행도 현황 추가)
 *
 * 운영 코드 통합:
 *   - 기존 `profiles` 테이블 (Supabase 0001) 의 컬럼 일부 재사용
 *     (id, display_name, avatar_*, is_premium, premium_until)
 *   - 신규 컬럼: persona, background, daily_minutes, study_style
 *   - exam_dates 는 별도 테이블 (0001) 그대로 사용
 *
 * 단계적 구현 (10절):
 *   - MVP: persona, background, exams, exam_dates, daily_minutes, study_style, premium
 *   - v1.1+: reward_credits, diagnostic_result (참조), active_plan_id (참조)
 */

import type { Subject } from '../question';
import type { LearningExamSubject } from './exam';

/** 학습자 페르소나 (1-1절). 첫 진입 시 마스코트 대화로 분기. */
export type Persona = 'beginner' | 'reviewer' | 'unknown';

/**
 * 사용자 배경 (1-2절 Q3, 1-3절 Q4).
 * 페르소나별 권장 학습 시간 산정에 사용 (2-1-2절 표).
 */
export type UserBackground =
  /** 비전공자/완전 입문 (통계/SQL 경험 없음). 권장 시간 최대치. */
  | 'novice'
  /** 일부 기초 있음 (통계 또는 SQL 경험 일부). */
  | 'some_basis'
  /** 개발/통계 경험 충분 (전공자 또는 실무자). 권장 시간 최소치. */
  | 'experienced';

/**
 * 학습 스타일 (1-2절 Q6).
 * 망각 곡선 알림 빈도 결정에 사용 (3절).
 */
export type StudyStyle =
  /** 매일 꾸준히 (분산형). 망각 곡선 알림 빈도 ↑. */
  | 'distributed'
  /** 몰아서 집중 (집중형). 망각 곡선 알림 빈도 ↓. */
  | 'intensive';

/**
 * Premium 결제 상태 (6절, Q1 결정 반영).
 *
 * 운영 코드 매핑:
 *   - profiles.is_premium (boolean) → type !== 'free'
 *   - profiles.premium_until (timestamptz) → expires_at
 *   - premium_grants 테이블 → 결제 이력 추적 (0011, 0018)
 */
export interface PremiumState {
  /**
   * 결제 유형:
   *   - free: 무료 사용자 (입문자 1과목 무료 / 재응시생 약점 단원 30% 무료)
   *   - beginner_paid: 입문자 9,900원 (6-2절)
   *   - reviewer_paid: 재응시생 시험일 기반 동적 가격 (6-3절)
   */
  type: 'free' | 'beginner_paid' | 'reviewer_paid';

  /** 만료 시각. null = lifetime (premium_grants.expires_at = null). */
  expires_at: Date | null;
}

/**
 * 보상 크레딧 — 다른 시험 무료 이용권 (5-4절).
 *
 * 시나리오:
 *   - ADsP 합격자가 PassResponse 응답 → SQLD 1주일 무료 (cross-sell)
 *   - SQLD 합격자가 응답 → ADsP 1주일 무료
 *   - 친구 추천 / 이벤트로도 발급 가능
 *
 * v1.1 이후 활성화 (10-2절). MVP 에서는 데이터 모델만 정의.
 */
export interface RewardCredit {
  /** 적용 가능 시험. */
  exam: Extract<Subject, 'adsp' | 'sqld'>;
  /** 무료 이용 일수 (예: 7). */
  days: number;
  /** 크레딧 만료. null = 무기한. */
  expires_at: Date | null;
  /** 발급 출처. */
  source: 'pass_response' | 'friend_referral' | 'event';
}

/** Subject literal — 운영 코드의 'adsp'/'sqld' 와 호환. */
type ExamSubject = LearningExamSubject;

/**
 * UserProfile — 학습 시스템의 단일 진실의 원천.
 *
 * MVP 필수 필드만 required, v1.1+ 는 optional.
 * 기존 profiles 테이블 일부 컬럼을 references 로 끌어옴 (Phase 2 스키마에서 정합).
 */
export interface UserProfile {
  // ───────────────────────────────────────────────
  // 식별 (MVP 필수)
  // ───────────────────────────────────────────────

  /** Supabase auth.users.id 와 1:1 (운영 profiles.id 그대로). */
  user_id: string;

  // ───────────────────────────────────────────────
  // 학습 메타 (MVP 필수, Phase 4 신규)
  // ───────────────────────────────────────────────

  /** 페르소나 (1-1절). 'unknown' = 첫 대화 미완료. */
  persona: Persona;

  /** 사용자 배경 (1-2절 Q3, 2-1-2절 권장 시간 산정 입력). */
  background: UserBackground;

  /** 응시 예정 시험 목록 ('둘 다' 선택 시 [adsp, sqld]). */
  exams: ExamSubject[];

  /**
   * 시험별 시험일.
   * 운영 코드의 `exam_dates` 테이블 (0001) 의 row 와 1:1 매핑.
   * 'unknown' (시험일 미정) 시점에는 D-60 가정 (1-2절 Q4).
   */
  exam_dates: { [exam in ExamSubject]?: Date };

  /** 하루 학습 가능 시간 (분, 1-2절 Q5). 30/60/120/주말집중 매핑. */
  daily_minutes: number;

  /** 학습 스타일 (1-2절 Q6). */
  study_style: StudyStyle;

  // ───────────────────────────────────────────────
  // 진단 결과 참조 (재응시생, v1.1)
  // ───────────────────────────────────────────────

  /**
   * 가장 최근 진단 세션 ID. 상세는 `DiagnosticResult` 테이블 참조.
   * MVP 에서는 reviewer 페르소나만 채워짐.
   * 진단 미수행 시 null.
   */
  latest_diagnostic_session_id?: string | null;

  // ───────────────────────────────────────────────
  // 결제 (MVP 필수)
  // ───────────────────────────────────────────────

  /** Premium 결제 상태 (Q1 결정). */
  premium: PremiumState;

  // ───────────────────────────────────────────────
  // 학습 플랜 참조 (MVP 필수)
  // ───────────────────────────────────────────────

  /**
   * 활성 학습 플랜 ID. 상세는 `study_plans` 테이블 참조.
   * 한 사용자에게 active 플랜 1개. replan 시 새 row + 이전 row inactive 처리.
   * 플랜 미생성 시 null (페르소나 결정 직후 plan 생성됨).
   */
  active_plan_id: string | null;

  // ───────────────────────────────────────────────
  // 보상 (v1.1+)
  // ───────────────────────────────────────────────

  /**
   * 보유 보상 크레딧 (5-4절). v1.1 이후 활성.
   * MVP 에서는 빈 배열로 초기화.
   */
  reward_credits: RewardCredit[];

  // ───────────────────────────────────────────────
  // 메타 (MVP 필수)
  // ───────────────────────────────────────────────

  created_at: Date;
  updated_at: Date;
}

/**
 * UserProfile 부분 업데이트용 (Phase 2 RPC 인터페이스 설계용).
 * persona/background/daily_minutes/study_style 같은 onboarding 응답 저장에 사용.
 */
export type UserProfileUpdate = Partial<
  Pick<
    UserProfile,
    | 'persona'
    | 'background'
    | 'exams'
    | 'exam_dates'
    | 'daily_minutes'
    | 'study_style'
    | 'latest_diagnostic_session_id'
    | 'active_plan_id'
  >
>;

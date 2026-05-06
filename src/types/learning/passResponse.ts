/**
 * PassResponse — 시험 응시 후 합/불 응답 데이터.
 *
 * 리서치 9-6절, 5-4절 (합격자 데이터 수집 + 보상) 정본.
 *
 * ⚠ 명명 주의 (Phase 0 분석):
 *   - "Pass" = 시험 합격/불합격 (영어 verb 의미: pass the exam).
 *   - 결제 시스템의 "Premium" 과 다른 도메인 (Q1 결정 — Pass 명명 → Premium).
 *   - 운영 코드의 N회독 시스템 "pass_tier" / "pass_stamps" 와도 다른 도메인 (회독 횟수).
 *   - 본 인터페이스는 "시험 합격 응답" 의미 — 그대로 PassResponse 명칭 유지.
 *
 * v1.1 이후 활성 (10-2절). MVP 에서는 데이터 모델 + 빈 폼 UI만.
 *
 * 보상 정책 (5-4절):
 *   - 응답 시 다른 시험 1주일 무료 이용권 지급 (RewardCredit 발급)
 *   - ADsP 합격자 → SQLD 무료 (cross-sell)
 *   - SQLD 합격자 → ADsP 무료
 *   - 미응답 패널티 X (이탈 방지)
 */

import type { Subject } from '../question';

type ExamSubject = Extract<Subject, 'adsp' | 'sqld'>;

/**
 * 시험 응답 결과.
 *   - pass: 합격 (점수 입력 필수)
 *   - fail: 불합격 (점수 입력 가능, 선택)
 *   - no_attempt: 응시 안 함
 *   - private: 응답하지 않음 / 비공개
 */
export type PassResult = 'pass' | 'fail' | 'no_attempt' | 'private';

/**
 * PassResponse — 사용자별 시험 응답 1건.
 *
 * Supabase 테이블 `pass_responses` 의 row 1:1 매핑.
 *
 * 한 사용자가 같은 시험을 여러 회차 응시할 수 있음.
 * Composite Logical Key: (user_id, exam, exam_date).
 */
export interface PassResponse {
  // ───────────────────────────────────────────────
  // 식별
  // ───────────────────────────────────────────────

  /** 서버 발급 UUID. */
  response_id: string;

  /** 사용자. */
  user_id: string;

  // ───────────────────────────────────────────────
  // 시험 정보 (MVP 필수)
  // ───────────────────────────────────────────────

  /** 시험 종류. */
  exam: ExamSubject;

  /** 시험일 (회차 식별). UserProfile.exam_dates 와 일관. */
  exam_date: Date;

  // ───────────────────────────────────────────────
  // 응답 (MVP 필수)
  // ───────────────────────────────────────────────

  /** 결과. */
  result: PassResult;

  /**
   * 점수 (선택).
   * - result = 'pass' 일 때 권장 입력 (cohort passers_data 갱신에 활용).
   * - result = 'fail' 일 때 선택 입력.
   * - result = 'no_attempt' / 'private' 일 때 null.
   */
  score?: number | null;

  /** 응답 시각. */
  responded_at: Date;

  // ───────────────────────────────────────────────
  // 보상 지급 흔적 (5-4절, v1.1+)
  // ───────────────────────────────────────────────

  /**
   * RewardCredit 지급 여부.
   * - true 인 경우, profiles.reward_credits 에 다른 시험 1주일 무료 추가됨.
   * - private / no_attempt 응답에도 보상 지급 (이탈 방지).
   */
  reward_granted: boolean;

  /**
   * 발급된 RewardCredit 의 식별자.
   * 사용자가 보상 사용 시 추적 + 환불/철회 시 참조.
   * reward_granted = true 일 때만 set.
   */
  reward_id: string | null;
}

/**
 * 시험 응답 폼 입력 (Phase 4 Step 6 또는 v1.1 UI 입력값).
 * 사용자 직접 입력. PassResponse 생성 input.
 */
export type PassResponseFormInput = Pick<
  PassResponse,
  'exam' | 'exam_date' | 'result' | 'score'
>;

/**
 * 시험 응답 시 보상 발급 정책 (5-4절).
 *
 * 응답한 시험과 보상 시험이 다름 (cross-sell):
 *   - ADsP 응답 → SQLD 1주일 보상
 *   - SQLD 응답 → ADsP 1주일 보상
 *
 * 둘 다 합격자가 응답: 다음 회차 응시 시 사용 쿠폰 (별도 RewardCredit 또는 사용자 결정).
 */
export const REWARD_DAYS_PER_RESPONSE = 7 as const;

/**
 * 응답 시점 기준 시험일 후 며칠 안에 응답 가능한지 (정책 가드).
 * 시험일 다음 날 ~ +30일 윈도우 내 응답 시 보상.
 * 너무 늦은 응답은 데이터 신뢰도 ↓ + 보상 비용 ↑ → 윈도우 제한.
 */
export const RESPONSE_WINDOW_DAYS = 30 as const;

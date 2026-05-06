/**
 * Premium — 결제 시스템 (Phase 4 Q1 결정 — Pass → Premium 명명).
 *
 * 리서치 6절 (결제 시스템 — Premium) 정본.
 *
 * Q1 결정 (2026-05-05):
 *   - 운영 코드의 N회독 시스템 (`pass_tier`, `pass_stamps`) 과 명명 충돌 회피.
 *   - 운영 코드의 기존 Premium 명명 (is_premium, premium_grants) 과 자연스러운 정합.
 *
 * 운영 코드 통합 (Phase 0):
 *   - 기존 profiles.is_premium / premium_until — Premium 활성 여부.
 *   - 기존 premium_grants 테이블 — 결제 이력 + 출처 추적 (paid/redemption_code/admin_grant).
 *   - 기존 payments 테이블 (Toss webhook) — 결제 webhook → premium_grants insert.
 *   - 기존 pricing.ts — 정적 가격표. Phase 4 Step 6 에서 페르소나·시험일 기반 동적 가격으로 갱신.
 *
 * Q5 결정: 가격 모델 갱신 시점 = Phase 4 Step 6 (Phase 1 에서는 타입만 정의).
 */

/**
 * Premium 결제 유형 (6-2/6-3절).
 *
 * 운영 product_code 와 매핑 (Phase 4 Step 6 마이그레이션):
 *   - 'free' → product_code 없음
 *   - 'beginner' → 신규 product_code (예: 'premium_beginner')
 *   - 'reviewer_2w' → 신규 (시험일 < 2주)
 *   - 'reviewer_4w' → 신규 (2~4주)
 *   - 'reviewer_8w' → 신규 (4주 이상, 8주 이상도 동일 가격)
 *
 * 기존 product_code (lifetime/weekly/monthly) 는 deprecated 예정 (Q5 결정 후).
 */
export type PremiumPlanType =
  | 'free'
  | 'beginner'      // 입문자 단일 plan (6-2절)
  | 'reviewer_2w'   // 재응시생, 시험일 2주 미만 (6-3절)
  | 'reviewer_4w'   // 재응시생, 시험일 4주 미만
  | 'reviewer_8w';  // 재응시생, 시험일 8주 이상 (8주 이상도 동일 가격)

/**
 * 페르소나별 Premium plan 가격 모델 (6-2/6-3절).
 *
 * 시간 기반 동적 가격 (재응시생):
 *   - 시험일 임박 → 부담 ↓ (전환율 ↑)
 *   - 시험일 여유 → 가치 ↑ (정상가 적용)
 */
export interface PremiumPlan {
  /** plan 식별자. */
  type: PremiumPlanType;

  /** 정상가 (KRW). */
  list_price_krw: number;

  /**
   * 출시 할인가 (KRW).
   * MVP 출시 기간 한정 — Phase 4 Step 6 에서 환경변수 또는 운영자 설정으로 토글.
   */
  launch_price_krw: number;

  /**
   * 유효 기간 (일). null = lifetime.
   * 6절은 단일 결제 모델 — 구독 X. 모든 plan 은 결제 후 N일 유효 또는 lifetime.
   */
  validity_days: number | null;

  /**
   * 적용 페르소나 (UI 분기용).
   * - 'beginner': 입문자 plan (6-2절)
   * - 'reviewer': 재응시생 plan (6-3절)
   * - 'free': 무료 (모든 페르소나)
   */
  persona: 'beginner' | 'reviewer' | 'free';

  /**
   * 시험일 윈도우 (재응시생 plan 만 의미).
   *   - reviewer_2w: D-day < 14
   *   - reviewer_4w: 14 ≤ D-day < 28
   *   - reviewer_8w: D-day ≥ 28 (8주 이상도 동일)
   */
  d_day_window?: {
    min_days?: number;
    max_days?: number;
  };
}

/**
 * 입문자 Premium 가격표 (6-2절 결정 사항).
 *
 * 무료 구간 (옵션 C):
 *   - 1과목 lesson 전체 + 1과목 문제 + 진단 테스트
 *
 * 유료 구간:
 *   - 1과목 끝나는 시점에 결제 안내
 *   - 9,900원 (출시 할인) / 29,000원 (정상가)
 */
export const BEGINNER_PREMIUM_PLAN: Readonly<PremiumPlan> = {
  type: 'beginner',
  list_price_krw: 29_000,
  launch_price_krw: 9_900,
  validity_days: null, // lifetime
  persona: 'beginner',
} as const;

/**
 * 재응시생 Premium 가격표 (6-3절 결정 사항).
 *
 * 무료 구간 (옵션 A):
 *   - 진단 테스트 전체 + 분석 결과
 *   - 약점 단원 lesson 30% 무료 (모든 약점 단원 평균 30%)
 *
 * 유료 구간 (시험일 기반 동적 가격):
 *   - 2주 미만: 29,000원 / 9,900원 (출시)
 *   - 4주 미만: 34,900원 / 14,900원
 *   - 8주 미만/이상: 44,900원 / 24,900원
 */
export const REVIEWER_PREMIUM_PLANS: Readonly<{
  [type in 'reviewer_2w' | 'reviewer_4w' | 'reviewer_8w']: PremiumPlan;
}> = {
  reviewer_2w: {
    type: 'reviewer_2w',
    list_price_krw: 29_000,
    launch_price_krw: 9_900,
    validity_days: null,
    persona: 'reviewer',
    d_day_window: { max_days: 13 }, // < 2주
  },
  reviewer_4w: {
    type: 'reviewer_4w',
    list_price_krw: 34_900,
    launch_price_krw: 14_900,
    validity_days: null,
    persona: 'reviewer',
    d_day_window: { min_days: 14, max_days: 27 }, // 2~4주
  },
  reviewer_8w: {
    type: 'reviewer_8w',
    list_price_krw: 44_900,
    launch_price_krw: 24_900,
    validity_days: null,
    persona: 'reviewer',
    d_day_window: { min_days: 28 }, // 4주 이상 (8주 이상도 동일)
  },
} as const;

/**
 * 재응시생 무료 구간 측정 정책 (6-3절, 30% 측정 방식 결정 사항).
 *
 * "약점 단원 lesson 30% 무료 체험" 의 정확한 측정 방식:
 *   - 모든 약점 단원의 lesson 진행률 평균 = 30%
 *   - 30% 도달 시 결제 안내 시점
 */
export const REVIEWER_FREE_THRESHOLD = 0.3 as const;

/**
 * Premium 사용자에게 부여되는 권한 (게이트 정책).
 * 운영 코드의 isPlayable / energy / step_unlocks 와 통합 (Phase 4 Step 6).
 */
export interface PremiumEntitlements {
  /** 모든 단원 lesson + 문제 풀이 가능 (잠금 없음). */
  unlimited_content_access: boolean;
  /** 에너지 무한 (운영 consume_energy RPC 가 admin/premium 우회). */
  unlimited_energy: boolean;
  /** 모의고사 무제한 시도. */
  unlimited_mock_exams: boolean;
  /** Phase 4 합격 예측 점수 자세히 보기. */
  full_pass_prediction: boolean;
}

/**
 * Free 사용자 entitlement (모든 false).
 */
export const FREE_ENTITLEMENTS: Readonly<PremiumEntitlements> = {
  unlimited_content_access: false,
  unlimited_energy: false,
  unlimited_mock_exams: false,
  full_pass_prediction: false,
} as const;

/**
 * Premium 사용자 entitlement (모든 true).
 */
export const PREMIUM_ENTITLEMENTS: Readonly<PremiumEntitlements> = {
  unlimited_content_access: true,
  unlimited_energy: true,
  unlimited_mock_exams: true,
  full_pass_prediction: true,
} as const;

/**
 * 사용자별 Premium 상태 lookup 입력.
 * Phase 4 Step 6 의 결제 게이트 로직에서 활용.
 */
export interface PremiumStateInput {
  /** UserProfile.premium 의 사본. */
  type: 'free' | 'beginner_paid' | 'reviewer_paid';
  expires_at: Date | null;
  /** 비교 기준 시각 (보통 now). */
  now: Date;
}

/**
 * 시험일 D-day → 재응시생 plan type 매핑 (6-3절).
 * Phase 4 Step 6 의 가격 산정 로직에서 활용.
 */
export function pickReviewerPlan(d_day_remaining: number): PremiumPlanType {
  if (d_day_remaining < 14) return 'reviewer_2w';
  if (d_day_remaining < 28) return 'reviewer_4w';
  return 'reviewer_8w';
}

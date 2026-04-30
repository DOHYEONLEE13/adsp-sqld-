/**
 * Site content types for the landing page.
 * Keep content values in `src/data/site.ts` so copywriting can be edited
 * without touching components.
 */

export interface NavLink {
  label: string;
  href: string;
}

/**
 * 랜딩 페이지의 "도전 가능한 자격증" 컬렉션 카드.
 *
 * 과거 이름은 GameMode (몬스터 배틀 / 계단 / AI 보스). 지금은 실제 앱에 맞춰
 * 자격증(ADSP / SQLD / 빅분기) 한 장씩. comingSoon=true 면 카드 클릭 비활성 +
 * "준비중" 라벨.
 */
export interface SubjectShowcase {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  /** 카드 하단 라벨 (예: "콘텐츠"). */
  metaLabel: string;
  /** 카드 하단 값 (예: "243 문항 · 50 step", "2026 Q3 출시"). */
  metaValue: string;
  /** true 면 카드 진입 비활성화 + 잠금/준비중 표기. */
  comingSoon?: boolean;
  /** 진입 deep link (#/game?subject=adsp 등). 미지정 시 #/game. */
  href?: string;
}

/** @deprecated SubjectShowcase 로 대체. 외부 import 호환을 위해 alias. */
export type GameMode = SubjectShowcase;

export interface PricingFeature {
  text: string;
  /** Highlight with neon accent */
  highlight?: boolean;
}

export interface PricingPlan {
  /**
   * - free            : 무료 플랜
   * - premium-weekly  : 1주 단기 (시험 직전 집중)
   * - premium-monthly : 월간 구독 (best value)
   */
  id: 'free' | 'premium-weekly' | 'premium-monthly';
  /** 작은 태그 라벨 — 'PREMIUM' / 'FREE' 같은 카테고리. */
  category?: string;
  /** 큰 부제 — '월 구독' / '1주 단기' / '무료'. */
  tier: string;
  /** 가격 본체 — '9,900' (원 단위 숫자만) 또는 '₩0'. */
  price: string;
  /** 가격 뒤 단위 + 주기 — '원 / 월'·'원 / 주' 등. price 와 함께 한 줄로 렌더. */
  priceSuffix?: string;
  /**
   * 가격 아래 작은 가치 안내 — '주당 ₩2,475 · 1주 단기 대비 약 50% 저렴'.
   * neon 색으로 강조. 월 구독 카드의 차별 포인트 노출용.
   */
  valueNote?: string;
  description?: string;
  /** 카드 우상단 작은 뱃지 (예: "BEST", "단기"). 강조 카드 식별용. */
  badge?: string;
  /**
   * 카드 시각 강조 정도.
   * - 'highlight' = neon 액센트 + glow + 살짝 들림 (월간 추천 카드)
   * - 기본 = 평면
   */
  emphasis?: 'highlight';
  features: PricingFeature[];
  ctaLabel?: string;
  ctaHref?: string;
}

export interface HeroContent {
  headingLines: string[];
  cursiveAccent: string;
  videoUrl: string;
}

export interface AboutContent {
  headingLines: string[];
  lead: string;
  bulletLines: string[];
  videoUrl: string;
}

export interface CollectionContent {
  titleFirstLine: string;
  cursiveInline: string;
  titleSecondLineSuffix: string;
  seeAllPrimary: string;
  seeAllSecondaryTop: string;
  seeAllSecondaryBottom: string;
  cardFunScoreLabel: string;
}

export interface CtaContent {
  cursiveAccent: string;
  joinLine: string;
  restLines: string[];
  videoUrl: string;
}

export interface SocialLink {
  /**
   * 현재는 email 만. 추후 X / 카카오 채널 / 인스타 등 추가 시 union 확장.
   * (X·GitHub 는 의도적 제외 — 2026-05-01 결정.)
   */
  platform: 'email';
  href: string;
  label: string;
}

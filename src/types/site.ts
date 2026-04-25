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
  id: 'free' | 'premium';
  tier: string;
  price: string;
  description?: string;
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
  platform: 'email' | 'twitter' | 'github';
  href: string;
  label: string;
}

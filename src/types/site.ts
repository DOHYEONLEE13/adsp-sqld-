/**
 * Site content types for the landing page.
 * Keep content values in `src/data/site.ts` so copywriting can be edited
 * without touching components.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface GameMode {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  funScore: number; // 0-10
  /** Deep link or route for when this mode launches. */
  href?: string;
}

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

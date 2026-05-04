import type { NavLink, SocialLink } from '@/types/site';
import { COMPANY } from './site';

/**
 * 헤더 메뉴 — 2 섹션 구조.
 *
 * - MAIN: onboarding 3 핵심 (visitor 가 가장 먼저 만나야 할 것)
 * - SUPPORT: 운영·법적·문의 (한국 ecommerce 의무 + 결제 launch 필수)
 *
 * 합쳐서 6항목. 메뉴 패널이 길어지지 않으면서도 사용자가 필요로 하는 거의
 * 모든 진입점 커버. 게임 안 페이지 (친구/통계/북마크 등) 는 game 안 bottom
 * nav 에 별도 존재 — 여기엔 안 넣음.
 */
export const NAV_LINKS_MAIN: NavLink[] = [
  { label: '플레이', href: '#/game' },
  { label: '소개', href: '#/about' },
  { label: '요금제', href: '#pricing' },
];

export const NAV_LINKS_SUPPORT: NavLink[] = [
  { label: '쿠폰 등록', href: '#/redeem' },
  { label: '환불 정책', href: '#/refund' },
  { label: '고객문의', href: `mailto:${COMPANY.email}` },
];

/** 호환용 — 기존 import 처가 있으면 main 만 노출. */
export const NAV_LINKS: NavLink[] = NAV_LINKS_MAIN;

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: 'email', href: `mailto:${COMPANY.email}`, label: 'Email' },
];

import type { NavLink, SocialLink } from '@/types/site';
import { COMPANY } from './site';

export const NAV_LINKS: NavLink[] = [
  { label: '홈', href: '#hero' },
  { label: '소개', href: '#/about' },
  { label: '모드', href: '#modes' },
  { label: '요금제', href: '#pricing' },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: 'email', href: `mailto:${COMPANY.email}`, label: 'Email' },
];

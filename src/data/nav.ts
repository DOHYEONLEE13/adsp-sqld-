import type { NavLink, SocialLink } from '@/types/site';

export const NAV_LINKS: NavLink[] = [
  { label: '홈', href: '#hero' },
  { label: 'ADSP', href: '#modes' },
  { label: 'SQLD', href: '#modes' },
  { label: '요금제', href: '#pricing' },
  { label: '플레이', href: '#/game' },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: 'email', href: 'mailto:hello@questdp.app', label: 'Email' },
  { platform: 'twitter', href: 'https://twitter.com', label: 'Twitter' },
  { platform: 'github', href: 'https://github.com', label: 'GitHub' },
];

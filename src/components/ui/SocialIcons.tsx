import { Github, Mail, Twitter } from 'lucide-react';
import { SOCIAL_LINKS } from '@/data/nav';
import { cx } from '@/lib/utils';
import type { SocialLink } from '@/types/site';

const ICONS = {
  email: Mail,
  twitter: Twitter,
  github: Github,
} as const;

interface Props {
  /** layout orientation */
  orientation?: 'vertical' | 'horizontal';
  /** size in px applied as width/height on the button */
  size?: number;
  className?: string;
  /** icon size in px */
  iconSize?: number;
}

export default function SocialIcons({
  orientation = 'vertical',
  size = 56,
  iconSize = 20,
  className,
}: Props) {
  return (
    <div
      className={cx(
        'flex gap-3',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        className,
      )}
    >
      {SOCIAL_LINKS.map((link) => (
        <SocialButton
          key={link.platform}
          link={link}
          size={size}
          iconSize={iconSize}
        />
      ))}
    </div>
  );
}

function SocialButton({
  link,
  size,
  iconSize,
}: {
  link: SocialLink;
  size: number;
  iconSize: number;
}) {
  const Icon = ICONS[link.platform];
  return (
    <a
      href={link.href}
      aria-label={link.label}
      target="_blank"
      rel="noopener noreferrer"
      className="liquid-glass rounded-2xl inline-flex items-center justify-center transition hover:bg-white/10"
      style={{ width: size, height: size }}
    >
      <Icon width={iconSize} height={iconSize} strokeWidth={2} />
    </a>
  );
}

import { Github, Mail, Twitter } from 'lucide-react';
import VideoBg from '@/components/ui/VideoBg';
import { CTA as CTA_CONTENT } from '@/data/site';
import { SOCIAL_LINKS } from '@/data/nav';

const ICONS = { email: Mail, twitter: Twitter, github: Github } as const;

export default function CTA() {
  return (
    <section id="join" className="relative overflow-hidden bg-base">
      <VideoBg src={CTA_CONTENT.videoUrl} fit="native" />

      <div className="absolute inset-0 z-[2] flex items-center justify-end px-6 lg:pl-[15%] lg:pr-[20%] py-8 pointer-events-none">
        <div className="relative text-right pointer-events-auto">
          <span
            className="cursive text-neon absolute -top-7 -left-2 rotate-[-2deg] text-[17px] sm:text-[28px] sm:-top-9 md:text-[44px] md:-top-12 lg:text-[68px] lg:-top-[68px] lg:-left-6"
            style={{ mixBlendMode: 'exclusion' }}
          >
            {CTA_CONTENT.cursiveAccent}
          </span>

          <h2 className="kr-heading uppercase leading-[1.05] text-[16px] xs:text-[22px] sm:text-[32px] md:text-[44px] lg:text-[60px]">
            <span className="block mb-4 md:mb-8 lg:mb-12">
              {CTA_CONTENT.joinLine}
            </span>
            {CTA_CONTENT.restLines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h2>
        </div>
      </div>

      {/* Vertical stacked social icons at bottom-left */}
      <div className="absolute left-[8%] bottom-[12%] sm:bottom-[14%] md:bottom-[16%] lg:bottom-[20%] z-[3] liquid-glass rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-[1.25rem] overflow-hidden">
        {SOCIAL_LINKS.map((link, i) => {
          const Icon = ICONS[link.platform];
          const isLast = i === SOCIAL_LINKS.length - 1;
          return (
            <a
              key={link.platform}
              href={link.href}
              aria-label={link.label}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center transition hover:bg-white/10 w-[14vw] h-[14vw] sm:w-[14.375rem] sm:h-[6rem] md:w-[10.78125rem] md:h-[5.5rem] lg:w-[16.77rem] lg:h-[7rem] ${!isLast ? 'border-b border-white/10' : ''}`}
            >
              <Icon className="w-6 h-6 lg:w-7 lg:h-7" strokeWidth={2} />
            </a>
          );
        })}
      </div>
    </section>
  );
}

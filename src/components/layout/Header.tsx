import { BRAND } from '@/data/site';
import { NAV_LINKS } from '@/data/nav';

export default function Header() {
  return (
    <div className="flex items-center justify-between gap-4">
      <Logo />
      <Nav />
      {/* Spacer keeps logo balanced against nav; social icons float absolutely. */}
      <div className="w-20 hidden lg:block" aria-hidden="true" />
    </div>
  );
}

function Logo() {
  return (
    <div className="kr-heading uppercase text-[16px] tracking-wider">
      {BRAND.logoLeft}
      <span className="text-neon">{BRAND.separator}</span>
      {BRAND.logoRight}
    </div>
  );
}

function Nav() {
  return (
    <nav
      aria-label="주요 메뉴"
      className="liquid-glass rounded-[28px] px-5 py-3 md:px-9 md:py-4 lg:px-[52px] lg:py-6"
    >
      <ul className="flex gap-4 md:gap-7 lg:gap-10 list-none m-0 p-0">
        {NAV_LINKS.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="kr-body font-bold text-[12px] md:text-[13px] whitespace-nowrap transition-colors hover:text-neon"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

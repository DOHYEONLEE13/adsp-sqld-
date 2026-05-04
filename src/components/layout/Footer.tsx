import { BRAND, COMPANY } from '@/data/site';
import { handleNavClick } from '@/lib/navigate';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-base text-cream/55 border-t border-cream/10">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-12 md:py-14">
        {/* 상단 — 로고 + 법적 링크 */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-12 mb-10">
          {/* 좌: 로고 + 한 줄 소개 */}
          <div className="max-w-[320px]">
            <a
              href="#"
              aria-label={`${BRAND.nameEn} 홈으로`}
              className="inline-flex items-center gap-2 group select-none mb-3"
            >
              <img
                src="/logo/questdp-mark.png"
                alt=""
                width={36}
                height={36}
                draggable={false}
                className="w-9 h-9 shrink-0 rounded-full transition-transform group-hover:scale-105"
              />
              <span className="logo-wordmark uppercase text-[20px] leading-none">
                <span className="text-cream group-hover:text-neon transition-colors">
                  Quest
                </span>
                <span className="text-neon">DP</span>
              </span>
            </a>
            <p className="kr-body text-[12px] leading-[1.65] text-cream/55">
              {BRAND.tagline}. ADSP · SQLD 자격증을 게임으로 정복하는 학습
              플랫폼.
            </p>
          </div>

          {/* 우: 링크 그룹 (서비스 / 정책 / 문의) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12 text-[11px] md:text-[12px] uppercase tracking-widest">
            <FooterLinkGroup
              title="서비스"
              links={[
                { label: '소개', href: '/about' },
                { label: '플레이', href: '#/game' },
                { label: '요금제', href: '#pricing' },
              ]}
            />
            <FooterLinkGroup
              title="정책"
              links={[
                { label: '개인정보 처리방침', href: '/privacy' },
                { label: '이용약관', href: '/terms' },
                { label: '환불 정책', href: '/refund' },
              ]}
            />
            <FooterLinkGroup
              title="문의"
              links={[
                { label: COMPANY.email, href: `mailto:${COMPANY.email}` },
              ]}
            />
          </div>
        </div>

        {/* 중간 — 사업자 정보 (전자상거래법 표시 의무) */}
        <div className="text-[11px] md:text-[12px] leading-[1.7] text-cream/45 space-y-1 mb-8 pb-8 border-b border-cream/10">
          <p>
            <span className="text-cream/60">상호</span> {BRAND.nameKr} ·{' '}
            <span className="text-cream/60">대표</span> {COMPANY.representative}
          </p>
          <p>
            <span className="text-cream/60">사업자등록번호</span>{' '}
            {COMPANY.businessNumber} ·{' '}
            <span className="text-cream/60">통신판매업</span>{' '}
            {COMPANY.ecommerceNumber}
          </p>
          <p>
            <span className="text-cream/60">주소</span> {COMPANY.address} ·{' '}
            <span className="text-cream/60">호스팅</span>{' '}
            {COMPANY.hostingProvider}
          </p>
          <p>
            <span className="text-cream/60">이메일</span> {COMPANY.email}
          </p>
        </div>

        {/* 하단 — 저작권 */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 text-[11px] uppercase tracking-widest text-cream/45">
          <p>
            © {year} {BRAND.nameKr}. ALL RIGHTS RESERVED.
          </p>
          <p>최종 개정 · {COMPANY.policyUpdatedAt}</p>
        </div>
      </div>
    </footer>
  );
}

interface FooterLinkGroupProps {
  title: string;
  links: { label: string; href: string }[];
}

function FooterLinkGroup({ title, links }: FooterLinkGroupProps) {
  return (
    <div>
      <div className="kr-heading text-[10px] text-cream/85 mb-3">{title}</div>
      <ul className="space-y-2.5 list-none m-0 p-0">
        {links.map((link) => {
          const isExternal =
            link.href.startsWith('mailto:') || link.href.startsWith('http');
          // path-based 라우트 (legal pages) 는 SPA navigation 으로 가로채 reload
          // 없이 이동. hash route (#/...) 는 브라우저 기본 동작.
          const isPathRoute =
            !isExternal &&
            !link.href.startsWith('#') &&
            link.href.startsWith('/');
          return (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={
                  isPathRoute
                    ? (e) => handleNavClick(e, link.href)
                    : undefined
                }
                className="text-cream/55 hover:text-neon transition-colors break-all"
                {...(link.href.startsWith('mailto:')
                  ? {}
                  : link.href.startsWith('http')
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
              >
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

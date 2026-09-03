/**
 * PricingPage — `/pricing` 단독 페이지.
 *
 * 만든 목적 (2026-05-11):
 *  1. **Toss 가맹점 심사** — 심사자가 /pricing 직접 방문 시 상품·약관·환불·사업자
 *     정보가 즉시 노출돼야 함. 이전엔 라우트가 없어서 Landing 으로 fallback →
 *     Hero·About 먼저 보이고 Pricing 섹션은 스크롤해야 보였음.
 *  2. **SEO** — /pricing 단독 indexable URL. 키워드 "ADSP SQLD 가격", "퀘스트디피
 *     요금", "자격증 학습 구독" 진입점.
 *  3. **공유** — 트위터·카카오톡으로 가격 페이지 공유 시 OG 미리보기에 가격 정보.
 *
 * 구조:
 *  - Header (로고 + 상단 nav) — Hero 안에 있는 그것 재활용
 *  - Pricing 섹션 — 메인 콘텐츠
 *  - 사업자/판매 정보 inline 안내 — Toss 심사 친화적 위치
 *  - Footer
 *
 * JSON-LD Product schema 동봉 — Google rich results (가격 표시 가능).
 */

import { useSeoMeta } from '@/lib/seo';
import Header from '@/components/layout/Header';
import Pricing from '@/components/sections/Pricing';
import Footer from '@/components/layout/Footer';
import { COMPANY, BRAND } from '@/data/site';
import { PRICING_PLANS } from '@/data/pricing';
import { COMMERCE_POLICY } from '@/data/commerce';
import { handleNavClick } from '@/lib/navigate';

const PRODUCT_IMAGE = 'https://quest-dp.com/og/default.png';

export default function PricingPage() {
  // ── SEO 메타 — 가격 정보 명시 ─────────────────────────────────
  useSeoMeta({
    title: '요금제 — QuestDP | 1주 4,900원 · 월 9,900원',
    description:
      'QuestDP의 ADSP·SQLD 자격증 학습 이용권. 무료 · Pro 7일 4,900원 · Max 30일 9,900원. 이용기간, 환불 정책, 사업자 정보를 안내합니다.',
    canonical: 'https://quest-dp.com/pricing/',
    ogImage: 'https://quest-dp.com/og/default.png',
    ogType: 'website',
    jsonLd: [
      // 각 유료 상품 Product schema — Google rich results (가격·이름·설명)
      ...PRICING_PLANS.filter((p) => p.id !== 'free').map((p) => ({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `QuestDP — ${p.tier}`,
        description: p.description ?? '',
        image: PRODUCT_IMAGE,
        brand: {
          '@type': 'Brand',
          name: BRAND.nameKr,
        },
        offers: {
          '@type': 'Offer',
          price: p.price.replace(/[^\d]/g, ''),
          priceCurrency: 'KRW',
          availability: 'https://schema.org/InStock',
          url: 'https://quest-dp.com/pricing/',
          seller: {
            '@type': 'Organization',
            name: BRAND.nameKr,
          },
        },
      })),
      // Breadcrumb
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '홈',
            item: 'https://quest-dp.com/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: '요금제',
            item: 'https://quest-dp.com/pricing/',
          },
        ],
      },
    ],
  });

  return (
    <div className="bg-base min-h-screen text-cream">
      {/* 상단 네비 — 로고 + 메뉴 */}
      <Header />

      {/* 페이지 헤더 — 가격 페이지 명확히 (Toss 심사·SEO 양쪽 친화) */}
      <header className="max-w-[1200px] mx-auto px-6 md:px-10 pt-28 md:pt-32 pb-6 md:pb-10 text-center">
        <span className="kr-heading uppercase tracking-[0.22em] text-[11px] md:text-[12px] text-[#D1F843]">
          Pricing
        </span>
        <h1 className="kr-heading text-[36px] md:text-[52px] lg:text-[60px] leading-[1.1] mt-3">
          요금제
        </h1>
        <p className="kr-body text-[14px] md:text-[16px] text-cream/70 mt-4 leading-[1.6] max-w-[680px] mx-auto">
          ADSP · SQLD 자격증 학습. 무료로 시작 · 시험 직전 7일 · 꾸준한 30일 이용권.
          모든 플랜이 동일한 커리큘럼.
        </p>
      </header>

      {/* 가격 카드 3종 — 기존 Pricing 컴포넌트 재활용 */}
      <Pricing showIntro={false} />

      {/* ── Toss 심사·고객 안내용 판매 정보 블록 ─────────────────
          전자상거래법 표시 의무 + 결제 전 사용자가 봐야 하는 정보를
          명시적으로 한 곳에 모음. 푸터에도 사업자정보가 있지만,
          심사자/사용자가 가격 페이지 안에서 즉시 확인 가능하도록 inline. */}
      <section className="max-w-[920px] mx-auto px-6 md:px-10 pt-8 pb-16">
        <div className="rounded-2xl border border-cream/10 bg-cream/[0.03] p-6 md:p-8">
          <h2 className="kr-heading text-[16px] md:text-[18px] mb-4 text-cream">
            결제·환불 안내
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-[13px] md:text-[14px] kr-body">
            <InfoRow label="판매자" value={`${BRAND.nameKr} (대표 ${COMPANY.representative})`} />
            <InfoRow label="사업자등록번호" value={COMPANY.businessNumber} />
            <InfoRow label="통신판매업" value={COMPANY.ecommerceNumber} />
            <InfoRow label="연락처" value={`${COMPANY.contact} · ${COMPANY.email}`} />
            <InfoRow label="사업장 주소" value={COMPANY.address} />
            <InfoRow label="결제수단" value={COMMERCE_POLICY.paymentMethods} />
            <InfoRow label="상품유형" value="디지털 콘텐츠 (기간제 학습 이용권)" />
            <InfoRow label="공급시점" value={COMMERCE_POLICY.activation} />
            <InfoRow label="이용기간" value={`Pro ${COMMERCE_POLICY.weeklyPeriod} · Max ${COMMERCE_POLICY.monthlyPeriod}`} />
            <InfoRow label="최대 제공기간" value={COMMERCE_POLICY.maximumServicePeriod} />
          </dl>

          <div className="mt-6 pt-6 border-t border-cream/10 text-[12.5px] md:text-[13px] text-cream/65 leading-[1.65] space-y-2">
            <p>
              ※ <strong className="text-cream/85">청약철회</strong>: {COMMERCE_POLICY.unusedRefund}{' '}
              {COMMERCE_POLICY.startedContentRefund}
            </p>
            <p>
              ※ <strong className="text-cream/85">이용권 만료</strong>: {COMMERCE_POLICY.renewal}
            </p>
            <p>
              ※ <strong className="text-cream/85">예외 환불</strong>: {COMMERCE_POLICY.statutoryException}
            </p>
            <p>
              ※ 자세한 환불 절차·면책 조건은{' '}
              <a
                href="/refund"
                onClick={(e) => handleNavClick(e, '/refund')}
                className="text-[#D1F843] hover:underline"
              >
                환불 정책
              </a>
              {' · '}
              <a
                href="/terms"
                onClick={(e) => handleNavClick(e, '/terms')}
                className="text-[#D1F843] hover:underline"
              >
                이용약관
              </a>
              {' 참조.'}
            </p>
          </div>
        </div>
      </section>

      {/* Footer — 사업자·법적 정보 (전체 하단) */}
      <Footer />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-cream/55">{label}</dt>
      <dd className="text-cream/90 font-medium">{value}</dd>
    </>
  );
}

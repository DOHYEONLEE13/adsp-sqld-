/**
 * FaqPage — Tier 2 SEO 자주 묻는 질문 페이지.
 *
 * 라우트: `/faq/:subject` — adsp · sqld
 *
 * 목적:
 *   - 네이버 People Also Ask · 구글 PAA 노출
 *   - 정보형 검색 ("ADsP 비전공자", "SQLD 합격 기준") 진입
 *   - 본문 내 lesson · curriculum · 내부 페이지로 link
 *
 * SEO 요소:
 *   - 페이지별 unique title/description
 *   - canonical
 *   - JSON-LD FAQPage (Question · Answer 구조)
 *   - BreadcrumbList
 */

import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ChevronRight, HelpCircle, Sparkles } from 'lucide-react';
import { ALL_FAQ } from '@/data/seo/faq';
import { handleNavClick } from '@/lib/navigate';

interface Props {
  subject: 'adsp' | 'sqld';
}

const SUBJECT_LABEL: Record<'adsp' | 'sqld', string> = {
  adsp: 'ADsP 데이터분석준전문가',
  sqld: 'SQLD SQL 개발자',
};

const SUBJECT_ACCENT: Record<'adsp' | 'sqld', string> = {
  adsp: '#67e8f9',
  sqld: '#c084fc',
};

export default function FaqPage({ subject }: Props) {
  const data = ALL_FAQ[subject];
  const accent = SUBJECT_ACCENT[subject];
  const label = SUBJECT_LABEL[subject];
  const canonical = `https://quest-dp.com/faq/${subject}`;

  // FAQPage JSON-LD — Q&A 평탄화
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.groups.flatMap((g) =>
      g.items.map((it) => ({
        '@type': 'Question',
        name: it.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: it.a,
        },
      })),
    ),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://quest-dp.com/' },
      { '@type': 'ListItem', position: 2, name: label, item: `https://quest-dp.com/curriculum/${subject}` },
      { '@type': 'ListItem', position: 3, name: '자주 묻는 질문', item: canonical },
    ],
  };

  return (
    <article className="relative min-h-screen isolate overflow-hidden bg-base text-cream">
      <Helmet>
        <title>{data.metaTitle}</title>
        <meta name="description" content={data.metaDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={data.metaTitle} />
        <meta property="og:description" content={data.metaDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <div className="relative z-10 max-w-[820px] lg:max-w-[920px] mx-auto px-5 md:px-8 lg:px-12 pt-8 pb-16">
        {/* Back home */}
        <a
          href="/"
          onClick={(e) => handleNavClick(e, '/')}
          className="inline-flex items-center gap-2 kr-heading uppercase text-[11px] tracking-widest text-cream/65 hover:text-neon transition mb-6"
        >
          <ArrowLeft size={14} strokeWidth={2.4} />
          홈으로
        </a>

        {/* Breadcrumb */}
        <nav
          aria-label="breadcrumb"
          className="kr-num text-[11px] text-cream/55 mb-3 flex items-center gap-1.5 flex-wrap"
        >
          <span style={{ color: accent }}>{label}</span>
          <ChevronRight size={12} className="text-cream/30" />
          <span className="text-cream/85">자주 묻는 질문</span>
        </nav>

        {/* H1 */}
        <header className="mb-10 pb-8 border-b border-cream/10">
          <h1 className="kr-heading text-[28px] md:text-[36px] lg:text-[42px] leading-[1.2] mb-3">
            {data.title}
          </h1>
          <p className="kr-body text-[14.5px] md:text-[15.5px] text-cream/75 leading-[1.65] max-w-[680px]">
            {data.metaDescription}
          </p>
        </header>

        {/* FAQ groups */}
        <div className="space-y-12">
          {data.groups.map((group) => (
            <section key={group.heading}>
              <h2
                className="kr-heading text-[18px] md:text-[22px] mb-5 inline-flex items-center gap-2"
                style={{ color: accent }}
              >
                <HelpCircle size={18} strokeWidth={2.4} />
                {group.heading}
              </h2>
              <ul className="space-y-4 list-none m-0 p-0">
                {group.items.map((it, i) => (
                  <li
                    key={i}
                    className="rounded-[14px] p-5 md:p-6 border border-cream/10 bg-white/[0.02]"
                  >
                    <h3 className="kr-heading text-[15px] md:text-[16.5px] text-cream/95 mb-2.5 leading-[1.4]">
                      Q. {it.q}
                    </h3>
                    <p className="kr-body text-[13.5px] md:text-[14.5px] text-cream/80 leading-[1.7] whitespace-pre-line">
                      {it.a}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Cross-link CTA */}
        <section
          className="mt-14 rounded-[20px] p-6 md:p-8"
          style={{
            background: `linear-gradient(135deg, ${accent}1a 0%, rgba(111,255,0,0.08) 100%)`,
            border: `1px solid ${accent}40`,
          }}
        >
          <h2 className="kr-heading text-[18px] md:text-[20px] mb-2 inline-flex items-center gap-2">
            <Sparkles size={18} style={{ color: accent }} />
            바로 학습 시작하기
          </h2>
          <p className="kr-body text-[13px] md:text-[14px] text-cream/75 leading-[1.65] mb-5">
            궁금한 게 더 있다면 토리·셀리와 함께 한 챕터씩 마이크로 러닝으로 풀어보세요.
            225 학습 스텝과 631 기출문제가 모두 무료.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`/curriculum/${subject}`}
              onClick={(e) => handleNavClick(e, `/curriculum/${subject}`)}
              className="kr-heading uppercase tracking-widest inline-flex items-center gap-2 text-[12px] md:text-[13px] px-5 py-3 rounded-full active:scale-95 transition"
              style={{
                background: '#FD802E',
                color: '#010828',
                boxShadow: '0 8px 22px -6px rgba(253,128,46,0.55)',
              }}
            >
              {label.split(' ')[0]} 출제범위 보기
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
            <a
              href={subject === 'adsp' ? '/faq/sqld' : '/faq/adsp'}
              onClick={(e) =>
                handleNavClick(e, subject === 'adsp' ? '/faq/sqld' : '/faq/adsp')
              }
              className="kr-heading uppercase tracking-widest inline-flex items-center gap-2 text-[12px] md:text-[13px] px-5 py-3 rounded-full border border-cream/20 hover:border-neon/40 hover:text-neon transition"
            >
              {subject === 'adsp' ? 'SQLD FAQ' : 'ADsP FAQ'}
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
            <a
              href="/glossary"
              onClick={(e) => handleNavClick(e, '/glossary')}
              className="kr-heading uppercase tracking-widest inline-flex items-center gap-2 text-[12px] md:text-[13px] px-5 py-3 rounded-full border border-cream/20 hover:border-neon/40 hover:text-neon transition"
            >
              용어 사전
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-cream/10 text-center">
          <p className="kr-body text-[12px] text-cream/50 mb-3">
            QuestDP — 한국 ADsP·SQLD 자격증을 우주 탐험 RPG 로 재구성
          </p>
          <a
            href="/about"
            onClick={(e) => handleNavClick(e, '/about')}
            className="kr-heading uppercase tracking-widest text-[11px] text-cream/65 hover:text-neon transition"
          >
            QuestDP 소개 →
          </a>
        </div>
      </div>
    </article>
  );
}

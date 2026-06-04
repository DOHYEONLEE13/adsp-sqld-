/**
 * BlogIndexPage — Tier 2 SEO 블로그 인덱스.
 *
 * 라우트: `/blog`
 *
 * 목적:
 *   - 코너스톤 포스트 4편의 hub
 *   - JSON-LD: Blog + ItemList
 *   - 카테고리별 그룹핑 — 비교·로드맵·가이드
 */

import { useSeoMeta } from '@/lib/seo';
import { ArrowLeft, ChevronRight, Clock, Sparkles } from 'lucide-react';
import { ALL_BLOG_POSTS, BLOG_CATEGORY_LABEL, type BlogPost } from '@/data/seo/blog';
import { handleNavClick } from '@/lib/navigate';

export default function BlogIndexPage() {
  const canonical = 'https://quest-dp.com/blog/';
  const seoTitle = 'QuestDP 블로그 — ADsP·SQLD·컴활 학습 가이드';
  const seoDescription =
    `ADsP vs SQLD 우선순위, 컴활 1급 vs 2급, 비전공자 공부법, 압축 로드맵까지 — 한국 자격증 합격에 필요한 코너스톤 콘텐츠 ${ALL_BLOG_POSTS.length}편.`;

  // JSON-LD Blog
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'QuestDP 블로그',
    url: canonical,
    inLanguage: 'ko-KR',
    publisher: {
      '@type': 'Organization',
      name: 'QuestDP',
      url: 'https://quest-dp.com',
    },
    blogPost: ALL_BLOG_POSTS.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `https://quest-dp.com/blog/${encodeURI(p.slug)}/`,
      datePublished: p.publishedAt,
      description: p.metaDescription,
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://quest-dp.com/' },
      { '@type': 'ListItem', position: 2, name: '블로그', item: canonical },
    ],
  };

  // Group by category
  const grouped = new Map<BlogPost['category'], BlogPost[]>();
  for (const p of ALL_BLOG_POSTS) {
    const arr = grouped.get(p.category) ?? [];
    arr.push(p);
    grouped.set(p.category, arr);
  }

  useSeoMeta({
    title: seoTitle,
    description: seoDescription,
    canonical,
    ogType: 'website',
    ogImage: 'https://quest-dp.com/og/default.png',
    jsonLd: [blogJsonLd, breadcrumbJsonLd],
  });

  return (
    <article className="relative min-h-screen isolate overflow-hidden bg-base text-cream">
      <div className="relative z-10 max-w-[860px] lg:max-w-[1020px] mx-auto px-5 md:px-8 lg:px-12 pt-8 pb-16">
        <a
          href="/"
          onClick={(e) => handleNavClick(e, '/')}
          className="inline-flex items-center gap-2 kr-heading uppercase text-[11px] tracking-widest text-cream/65 hover:text-neon transition mb-6"
        >
          <ArrowLeft size={14} strokeWidth={2.4} />
          홈으로
        </a>

        <header className="mb-10 pb-8 border-b border-cream/10">
          <h1 className="kr-heading text-[28px] md:text-[40px] lg:text-[44px] leading-[1.15] mb-3">
            QuestDP 블로그
          </h1>
          <p className="kr-body text-[14.5px] md:text-[15.5px] text-cream/75 leading-[1.65] max-w-[680px]">
            ADsP·SQLD·컴활 자격증 합격에 필요한 핵심 가이드 모음. 비교·로드맵·가이드 카테고리별로
            정리된 코너스톤 콘텐츠 {ALL_BLOG_POSTS.length}편.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#/game/comhwal"
              onClick={(e) => handleNavClick(e, '#/game/comhwal')}
              className="kr-heading uppercase tracking-widest inline-flex items-center gap-2 text-[12px] md:text-[13px] px-5 py-3 rounded-full active:scale-95 transition"
              style={{ background: '#FD802E', color: '#010828', boxShadow: '0 8px 22px -6px rgba(253,128,46,0.55)' }}
            >
              컴활 게임 섹션으로
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
            <a
              href="/curriculum/comhwal"
              onClick={(e) => handleNavClick(e, '/curriculum/comhwal')}
              className="kr-heading uppercase tracking-widest inline-flex items-center gap-2 text-[12px] md:text-[13px] px-5 py-3 rounded-full border border-cream/20 hover:border-neon/40 hover:text-neon transition"
            >
              컴활 커리큘럼
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
            <a
              href="/faq/comhwal"
              onClick={(e) => handleNavClick(e, '/faq/comhwal')}
              className="kr-heading uppercase tracking-widest inline-flex items-center gap-2 text-[12px] md:text-[13px] px-5 py-3 rounded-full border border-cream/20 hover:border-neon/40 hover:text-neon transition"
            >
              컴활 FAQ
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
          </div>
        </header>

        {/* Category sections */}
        <div className="space-y-12">
          {Array.from(grouped.entries()).map(([category, posts]) => (
            <section key={category}>
              <h2 className="kr-heading text-[18px] md:text-[22px] mb-5 inline-flex items-center gap-2">
                <Sparkles size={18} className="text-neon" />
                {BLOG_CATEGORY_LABEL[category]}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map((p) => {
                  const href = `/blog/${encodeURI(p.slug)}`;
                  return (
                    <a
                      key={p.slug}
                      href={href}
                      onClick={(e) => handleNavClick(e, href)}
                      className="block rounded-[14px] p-5 border border-cream/10 hover:border-neon/40 hover:bg-white/[0.04] transition"
                    >
                      <div className="kr-num text-[10px] uppercase tracking-widest text-cream/55 mb-2 inline-flex items-center gap-2">
                        <span className="text-neon">{BLOG_CATEGORY_LABEL[p.category]}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={10} strokeWidth={2.4} />
                          {p.readingMinutes}분
                        </span>
                      </div>
                      <h3 className="kr-heading text-[16px] md:text-[18px] leading-[1.3] mb-1.5">
                        {p.title}
                      </h3>
                      <p className="kr-body text-[13px] text-cream/65 leading-[1.55] line-clamp-2 mb-2">
                        {p.subtitle}
                      </p>
                      <span className="kr-num text-[10.5px] text-cream/45">
                        {p.publishedAt}
                      </span>
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Cross-link CTA */}
        <section
          className="mt-14 rounded-[20px] p-6 md:p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(103,232,249,0.12) 0%, rgba(192,132,252,0.12) 60%, var(--neon-08) 100%)',
            border: '1px solid rgba(192,132,252,0.4)',
          }}
        >
          <h2 className="kr-heading text-[18px] md:text-[20px] mb-2 inline-flex items-center gap-2">
            <Sparkles size={18} className="text-neon" />
            첫 화면에서 시작하기
          </h2>
          <p className="kr-body text-[13px] md:text-[14px] text-cream/75 leading-[1.65] mb-5">
            과목부터 정하고 뛰어들기보다, 먼저 닉네임과 학습 상황을 맞춘 뒤 시작하세요.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/"
              onClick={(e) => handleNavClick(e, '/')}
              className="kr-heading uppercase tracking-widest inline-flex items-center gap-2 text-[12px] md:text-[13px] px-5 py-3 rounded-full active:scale-95 transition"
              style={{ background: '#FD802E', color: '#010828' }}
            >
              QuestDP 첫 화면으로
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
            <a
              href="#/game"
              onClick={(e) => handleNavClick(e, '#/game')}
              className="kr-heading uppercase tracking-widest inline-flex items-center gap-2 text-[12px] md:text-[13px] px-5 py-3 rounded-full border border-cream/20 hover:border-neon/40 hover:text-neon transition"
            >
              온보딩으로 시작
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

        <div className="mt-12 pt-6 border-t border-cream/10 text-center">
          <p className="kr-body text-[12px] text-cream/50 mb-3">
            QuestDP — 한국 ADsP·SQLD·컴활 자격증을 우주 탐험 RPG 로 재구성
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

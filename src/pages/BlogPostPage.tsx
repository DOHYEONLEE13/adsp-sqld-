/**
 * BlogPostPage — Tier 2 SEO cornerstone 블로그 포스트.
 *
 * 라우트: `/blog/:slug` (slug 는 한국어 URL-encoded 가능)
 *
 * 목적:
 *   - high-intent 키워드 cornerstone ("ADsP vs SQLD", "ADsP 2주 합격" 등)
 *   - 내부 링크 그래프의 또 다른 root — lesson · curriculum · faq · glossary 와 cross-link
 *
 * SEO 요소:
 *   - 페이지별 unique title/description
 *   - canonical
 *   - JSON-LD: Article + FAQPage (faqs 가 있을 때) + BreadcrumbList
 *   - 본문 H2/H3 → ToC anchor 가능
 */

import { Helmet } from 'react-helmet-async';
import { ArrowLeft, BookOpen, ChevronRight, Sparkles, Clock } from 'lucide-react';
import {
  type BlogBlock,
  type BlogPost,
  ALL_BLOG_POSTS,
  BLOG_CATEGORY_LABEL,
  findPostBySlug,
} from '@/data/seo/blog';
import { handleNavClick } from '@/lib/navigate';

interface Props {
  slug: string;
}

export default function BlogPostPage({ slug }: Props) {
  const post = findPostBySlug(slug);
  if (!post) return <NotFound />;

  const canonical = `https://quest-dp.com/blog/${encodeURI(post.slug)}`;
  const seoTitle = `${post.title} — QuestDP`;

  // JSON-LD Article
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    inLanguage: 'ko-KR',
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'QuestDP',
      url: 'https://quest-dp.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'QuestDP',
      logo: {
        '@type': 'ImageObject',
        url: 'https://quest-dp.com/logo/questdp-mark.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
    image: 'https://quest-dp.com/og/default.png',
    keywords: post.primaryKeyword,
  };

  const faqJsonLd =
    post.faqs && post.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faqs.map((it) => ({
            '@type': 'Question',
            name: it.q,
            acceptedAnswer: { '@type': 'Answer', text: it.a },
          })),
        }
      : null;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://quest-dp.com/' },
      { '@type': 'ListItem', position: 2, name: '블로그', item: 'https://quest-dp.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
    ],
  };

  // related posts
  const related =
    post.relatedSlugs
      ?.map((s) => ALL_BLOG_POSTS.find((p) => p.slug === s))
      .filter((p): p is BlogPost => !!p) ?? [];

  return (
    <article className="relative min-h-screen isolate overflow-hidden bg-base text-cream">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={post.metaDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.publishedAt} />
        {post.updatedAt ? (
          <meta property="article:modified_time" content={post.updatedAt} />
        ) : null}
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        {faqJsonLd ? (
          <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        ) : null}
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <div className="relative z-10 max-w-[760px] lg:max-w-[860px] mx-auto px-5 md:px-8 lg:px-12 pt-8 pb-16">
        <a
          href="/blog"
          onClick={(e) => handleNavClick(e, '/blog')}
          className="inline-flex items-center gap-2 kr-heading uppercase text-[11px] tracking-widest text-cream/65 hover:text-neon transition mb-6"
        >
          <ArrowLeft size={14} strokeWidth={2.4} />
          블로그 목록
        </a>

        <nav
          aria-label="breadcrumb"
          className="kr-num text-[11px] text-cream/55 mb-3 flex items-center gap-1.5 flex-wrap"
        >
          <a href="/blog" onClick={(e) => handleNavClick(e, '/blog')} className="hover:text-neon transition">
            블로그
          </a>
          <ChevronRight size={12} className="text-cream/30" />
          <span className="text-cream/85">{BLOG_CATEGORY_LABEL[post.category]}</span>
        </nav>

        {/* H1 */}
        <header className="mb-8 pb-6 border-b border-cream/10">
          <div className="kr-num text-[10px] uppercase tracking-widest text-cream/55 mb-2 inline-flex items-center gap-3">
            <span className="text-neon">{BLOG_CATEGORY_LABEL[post.category]}</span>
            <span>·</span>
            <span>{post.publishedAt}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={11} strokeWidth={2.4} />
              {post.readingMinutes}분
            </span>
          </div>
          <h1 className="kr-heading text-[28px] md:text-[36px] lg:text-[42px] leading-[1.2] mb-3">
            {post.title}
          </h1>
          <p className="kr-body text-[14.5px] md:text-[15.5px] text-cream/75 leading-[1.65]">
            {post.subtitle}
          </p>
        </header>

        {/* Body */}
        <div className="space-y-5">
          {post.blocks.map((block, i) => (
            <BlockRenderer key={i} block={block} />
          ))}
        </div>

        {/* FAQ section */}
        {post.faqs && post.faqs.length > 0 ? (
          <section className="mt-14 pt-8 border-t border-cream/10">
            <h2 className="kr-heading text-[20px] md:text-[24px] mb-5 inline-flex items-center gap-2">
              <Sparkles size={18} className="text-neon" />
              자주 묻는 질문
            </h2>
            <ul className="space-y-4 list-none m-0 p-0">
              {post.faqs.map((it, i) => (
                <li
                  key={i}
                  className="rounded-[14px] p-5 border border-cream/10 bg-white/[0.02]"
                >
                  <h3 className="kr-heading text-[14.5px] md:text-[15.5px] text-cream/95 mb-2 leading-[1.4]">
                    Q. {it.q}
                  </h3>
                  <p className="kr-body text-[13px] md:text-[13.5px] text-cream/80 leading-[1.7] whitespace-pre-line">
                    {it.a}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Related */}
        {related.length > 0 ? (
          <section className="mt-14 pt-8 border-t border-cream/10">
            <h2 className="kr-heading text-[18px] md:text-[20px] mb-5 inline-flex items-center gap-2">
              <BookOpen size={16} strokeWidth={2.4} className="text-cream/55" />
              이어서 읽기
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {related.map((r) => {
                const href = `/blog/${encodeURI(r.slug)}`;
                return (
                  <a
                    key={r.slug}
                    href={href}
                    onClick={(e) => handleNavClick(e, href)}
                    className="block rounded-[14px] p-4 border border-cream/10 hover:border-neon/40 hover:bg-white/[0.04] transition"
                  >
                    <div className="kr-num text-[10px] uppercase tracking-widest text-cream/50 mb-1.5">
                      {BLOG_CATEGORY_LABEL[r.category]} · {r.readingMinutes}분
                    </div>
                    <div className="kr-heading text-[14.5px] text-cream/95 leading-[1.35] mb-1">
                      {r.title}
                    </div>
                    <div className="kr-body text-[12px] text-cream/60 leading-[1.5] line-clamp-2">
                      {r.subtitle}
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* Footer mini-CTA */}
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

// ─── 보조 컴포넌트 ────────────────────────────────────────────

function BlockRenderer({ block }: { block: BlogBlock }) {
  switch (block.kind) {
    case 'p':
      return (
        <p className="kr-body text-[15px] md:text-[16px] leading-[1.85] text-cream/90">
          <InlineMd text={block.text} />
        </p>
      );
    case 'h2':
      return (
        <h2
          id={block.id}
          className="kr-heading text-[22px] md:text-[26px] mt-10 mb-3 leading-[1.3] text-cream/95"
        >
          {block.text}
        </h2>
      );
    case 'h3':
      return (
        <h3
          id={block.id}
          className="kr-heading text-[18px] md:text-[20px] mt-6 mb-2 leading-[1.35] text-cream/90"
        >
          {block.text}
        </h3>
      );
    case 'ul':
      return (
        <ul className="space-y-2 list-disc pl-6 marker:text-neon/70">
          {block.items.map((it, i) => (
            <li key={i} className="kr-body text-[14.5px] md:text-[15.5px] leading-[1.75] text-cream/85">
              <InlineMd text={it} />
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="space-y-2 list-decimal pl-6 marker:text-neon/70 marker:kr-num">
          {block.items.map((it, i) => (
            <li key={i} className="kr-body text-[14.5px] md:text-[15.5px] leading-[1.75] text-cream/85">
              <InlineMd text={it} />
            </li>
          ))}
        </ol>
      );
    case 'callout': {
      const tone =
        block.tone === 'tip'
          ? { bg: 'rgba(111,255,0,0.08)', border: 'rgba(111,255,0,0.4)', color: '#9CFF3D' }
          : block.tone === 'warn'
            ? { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.4)', color: '#fca5a5' }
            : { bg: 'rgba(255,176,32,0.08)', border: 'rgba(255,176,32,0.4)', color: '#FFB020' };
      return (
        <div
          className="rounded-[14px] p-5"
          style={{ background: tone.bg, border: `1px solid ${tone.border}` }}
        >
          {block.title ? (
            <h3 className="kr-heading text-[14px] mb-2" style={{ color: tone.color }}>
              {block.title}
            </h3>
          ) : null}
          <p className="kr-body text-[14px] leading-[1.7] text-cream/90">
            <InlineMd text={block.body} />
          </p>
        </div>
      );
    }
    case 'table':
      return (
        <div className="overflow-x-auto rounded-[14px] border border-cream/10">
          <table className="w-full kr-body text-[13px] md:text-[14px]">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-3 py-2.5 text-left kr-heading text-[12.5px] text-cream/85 bg-white/[0.05]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-t border-cream/8">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="px-3 py-2.5 text-cream/85 align-top whitespace-pre-line"
                    >
                      <InlineMd text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'quote':
      return (
        <blockquote className="border-l-4 border-neon/50 pl-4 py-1 italic text-cream/80">
          <p className="kr-body text-[14.5px] leading-[1.7]">
            <InlineMd text={block.text} />
          </p>
          {block.cite ? (
            <cite className="kr-num text-[11px] text-cream/55 mt-2 block">— {block.cite}</cite>
          ) : null}
        </blockquote>
      );
    case 'cta':
      return (
        <div className="my-2">
          <a
            href={block.href}
            onClick={(e) => {
              if (block.href.startsWith('/')) handleNavClick(e, block.href);
            }}
            className="inline-flex items-center gap-2 kr-heading uppercase tracking-widest text-[12px] md:text-[13px] px-5 py-3 rounded-full active:scale-95 transition"
            style={{
              background: '#FD802E',
              color: '#010828',
              boxShadow: '0 8px 22px -6px rgba(253,128,46,0.55)',
            }}
          >
            {block.label}
            <ChevronRight size={14} strokeWidth={2.6} />
          </a>
        </div>
      );
    default:
      return null;
  }
}

/**
 * 인라인 마크다운: **bold** 와 [text](href) 만 처리.
 * 다른 마크다운 문법은 의도적으로 무시 — 평문 위주 콘텐츠라 충분.
 */
function InlineMd({ text }: { text: string }) {
  // 1. 토큰화: bold / link / plain
  type Token =
    | { type: 'bold'; text: string }
    | { type: 'link'; text: string; href: string }
    | { type: 'text'; text: string };

  const tokens: Token[] = [];
  let i = 0;
  while (i < text.length) {
    // **bold**
    if (text[i] === '*' && text[i + 1] === '*') {
      const close = text.indexOf('**', i + 2);
      if (close > i + 2) {
        tokens.push({ type: 'bold', text: text.slice(i + 2, close) });
        i = close + 2;
        continue;
      }
    }
    // [text](href)
    if (text[i] === '[') {
      const closeBracket = text.indexOf(']', i + 1);
      if (closeBracket > i && text[closeBracket + 1] === '(') {
        const closeParen = text.indexOf(')', closeBracket + 2);
        if (closeParen > closeBracket + 2) {
          tokens.push({
            type: 'link',
            text: text.slice(i + 1, closeBracket),
            href: text.slice(closeBracket + 2, closeParen),
          });
          i = closeParen + 1;
          continue;
        }
      }
    }
    // plain — 한 글자씩 모으되, 다음 특수 문자 직전까지 모음
    let next = i + 1;
    while (next < text.length) {
      if (text[next] === '*' && text[next + 1] === '*') break;
      if (text[next] === '[') break;
      next++;
    }
    tokens.push({ type: 'text', text: text.slice(i, next) });
    i = next;
  }

  return (
    <>
      {tokens.map((t, idx) => {
        if (t.type === 'bold') {
          return (
            <strong key={idx} className="kr-heading text-cream/95">
              {t.text}
            </strong>
          );
        }
        if (t.type === 'link') {
          const isInternal = t.href.startsWith('/');
          return (
            <a
              key={idx}
              href={t.href}
              onClick={(e) => {
                if (isInternal) handleNavClick(e, t.href);
              }}
              className="text-neon hover:underline"
              {...(isInternal ? {} : { target: '_blank', rel: 'noopener' })}
            >
              {t.text}
            </a>
          );
        }
        return <span key={idx}>{t.text}</span>;
      })}
    </>
  );
}

function NotFound() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 bg-base text-cream">
      <Helmet>
        <title>블로그 포스트를 찾을 수 없어요 — QuestDP</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1 className="kr-heading text-[24px] md:text-[28px] mb-3">블로그 포스트를 찾을 수 없어요</h1>
      <p className="kr-body text-[14px] text-cream/65 mb-6 text-center max-w-md">
        URL 이 잘못되었거나 콘텐츠가 이동했을 수 있어요.
      </p>
      <a
        href="/blog"
        onClick={(e) => handleNavClick(e, '/blog')}
        className="kr-heading uppercase tracking-widest text-[12px] px-5 py-3 rounded-full"
        style={{ background: '#FD802E', color: '#010828' }}
      >
        블로그 목록으로
      </a>
    </section>
  );
}

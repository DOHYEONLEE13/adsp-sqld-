/**
 * GlossaryPage — Tier 2 SEO 데이터 분석·SQL 용어 사전.
 *
 * 라우트: `/glossary`
 *
 * 목적:
 *   - 정의형 검색 ("DIKW 뜻", "JOIN 종류", "정규화 BCNF") 진입
 *   - 토픽 클러스터 마지막 단계 — 모든 lesson · faq 와 cross-link
 *
 * SEO 요소:
 *   - 페이지별 unique title/description
 *   - canonical
 *   - JSON-LD DefinedTermSet · DefinedTerm 구조
 *   - BreadcrumbList
 */

import { Helmet } from 'react-helmet-async';
import { ArrowLeft, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { GLOSSARY, type GlossaryTerm } from '@/data/seo/glossary';
import { handleNavClick } from '@/lib/navigate';

const SUBJECT_BADGE: Record<GlossaryTerm['subject'], { label: string; color: string }> = {
  adsp: { label: 'ADsP', color: '#67e8f9' },
  sqld: { label: 'SQLD', color: '#c084fc' },
  common: { label: '공통', color: '#9CFF3D' },
};

export default function GlossaryPage() {
  const canonical = 'https://quest-dp.com/glossary';

  // 카테고리별 그룹핑 — schema 순서 유지
  const grouped = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>();
    for (const t of GLOSSARY) {
      const arr = map.get(t.category) ?? [];
      arr.push(t);
      map.set(t.category, arr);
    }
    return Array.from(map.entries());
  }, []);

  const seoTitle = `데이터 분석·SQL 용어 사전 — ADsP·SQLD 핵심 ${GLOSSARY.length}개 용어`;
  const seoDescription =
    `DIKW · 정규화 · JOIN · 윈도우 함수까지 — ADsP·SQLD 자격증 시험 단골 용어 ${GLOSSARY.length}개의 정의와 활용을 한 곳에서. 관련 lesson 페이지로 바로 점프 가능.`;

  // DefinedTermSet JSON-LD
  const definedTermSet = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'QuestDP 데이터 분석·SQL 용어 사전',
    url: canonical,
    hasDefinedTerm: GLOSSARY.map((t) => ({
      '@type': 'DefinedTerm',
      name: t.term,
      alternateName: t.aliases ?? [],
      description: t.short,
      inDefinedTermSet: canonical,
      url: `${canonical}#${t.slug}`,
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://quest-dp.com/' },
      { '@type': 'ListItem', position: 2, name: '용어 사전', item: canonical },
    ],
  };

  return (
    <article className="relative min-h-screen isolate overflow-hidden bg-base text-cream">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(definedTermSet)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <div className="relative z-10 max-w-[900px] lg:max-w-[1080px] mx-auto px-5 md:px-8 lg:px-12 pt-8 pb-16">
        <a
          href="/"
          onClick={(e) => handleNavClick(e, '/')}
          className="inline-flex items-center gap-2 kr-heading uppercase text-[11px] tracking-widest text-cream/65 hover:text-neon transition mb-6"
        >
          <ArrowLeft size={14} strokeWidth={2.4} />
          홈으로
        </a>

        <nav
          aria-label="breadcrumb"
          className="kr-num text-[11px] text-cream/55 mb-3 flex items-center gap-1.5 flex-wrap"
        >
          <span className="text-cream/85">데이터 분석·SQL 용어 사전</span>
        </nav>

        {/* H1 */}
        <header className="mb-10 pb-8 border-b border-cream/10">
          <h1 className="kr-heading text-[28px] md:text-[40px] lg:text-[44px] leading-[1.15] mb-3">
            데이터 분석·SQL 용어 사전
          </h1>
          <p className="kr-body text-[14.5px] md:text-[15.5px] text-cream/75 leading-[1.65] mb-5 max-w-[700px]">
            ADsP·SQLD 자격증 시험에 자주 등장하는 핵심 용어 {GLOSSARY.length}개를 한 곳에 모았어요.
            짧은 정의와 보충 설명, 그리고 관련 학습 페이지로 바로 점프할 수 있는 링크.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Tag color="#67e8f9">ADsP</Tag>
            <Tag color="#c084fc">SQLD</Tag>
            <Tag color="#9CFF3D">공통</Tag>
          </div>
        </header>

        {/* Index — 카테고리 점프 링크 */}
        <nav className="mb-10 rounded-[14px] p-4 md:p-5 border border-cream/10 bg-white/[0.02]">
          <div className="kr-num text-[10px] uppercase tracking-widest text-cream/55 mb-3">
            카테고리 인덱스
          </div>
          <ul className="flex flex-wrap gap-2 list-none m-0 p-0">
            {grouped.map(([category, terms]) => (
              <li key={category}>
                <a
                  href={`#cat-${slug(category)}`}
                  className="inline-flex items-center gap-1.5 kr-body text-[12px] text-cream/75 hover:text-neon px-3 py-1.5 rounded-full border border-cream/15 hover:border-neon/40 transition"
                >
                  {category}
                  <span className="kr-num text-[10px] text-cream/45">{terms.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Terms by category */}
        <div className="space-y-12">
          {grouped.map(([category, terms]) => (
            <section key={category} id={`cat-${slug(category)}`}>
              <h2 className="kr-heading text-[18px] md:text-[22px] mb-5 inline-flex items-center gap-2">
                <BookOpen size={18} strokeWidth={2.4} className="text-cream/55" />
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {terms.map((t) => (
                  <TermCard key={t.slug} term={t} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <section
          className="mt-14 rounded-[20px] p-6 md:p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(103,232,249,0.12) 0%, rgba(192,132,252,0.12) 60%, rgba(111,255,0,0.08) 100%)',
            border: '1px solid rgba(192,132,252,0.4)',
          }}
        >
          <h2 className="kr-heading text-[18px] md:text-[20px] mb-2 inline-flex items-center gap-2">
            <Sparkles size={18} className="text-neon" />
            QuestDP 에서 바로 풀어보기
          </h2>
          <p className="kr-body text-[13px] md:text-[14px] text-cream/75 leading-[1.65] mb-5">
            용어 정의를 알았다면 이제 적용 차례. 토리·셀리와 함께 인터랙티브로 풀어보세요.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/curriculum/adsp"
              onClick={(e) => handleNavClick(e, '/curriculum/adsp')}
              className="kr-heading uppercase tracking-widest inline-flex items-center gap-2 text-[12px] md:text-[13px] px-5 py-3 rounded-full active:scale-95 transition"
              style={{ background: '#FD802E', color: '#010828' }}
            >
              ADsP 커리큘럼
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
            <a
              href="/curriculum/sqld"
              onClick={(e) => handleNavClick(e, '/curriculum/sqld')}
              className="kr-heading uppercase tracking-widest inline-flex items-center gap-2 text-[12px] md:text-[13px] px-5 py-3 rounded-full border border-cream/20 hover:border-neon/40 hover:text-neon transition"
            >
              SQLD 커리큘럼
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
            <a
              href="/faq/adsp"
              onClick={(e) => handleNavClick(e, '/faq/adsp')}
              className="kr-heading uppercase tracking-widest inline-flex items-center gap-2 text-[12px] md:text-[13px] px-5 py-3 rounded-full border border-cream/20 hover:border-neon/40 hover:text-neon transition"
            >
              자주 묻는 질문
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t border-cream/10 text-center">
          <p className="kr-body text-[12px] text-cream/50 mb-3">
            용어가 더 필요하다면 chap@quest-dp.com 으로 제안해주세요.
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

function TermCard({ term }: { term: GlossaryTerm }) {
  const badge = SUBJECT_BADGE[term.subject];
  const lessonHref = term.relatedStepId ? `/lesson/${term.relatedStepId}` : null;

  return (
    <article
      id={term.slug}
      className="rounded-[14px] p-4 md:p-5 border border-cream/10 bg-white/[0.02]"
    >
      <header className="mb-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="kr-heading text-[16px] md:text-[17.5px] mb-0.5 leading-[1.3]">
            {term.term}
          </h3>
          {term.aliases && term.aliases.length > 0 ? (
            <div className="kr-num text-[10.5px] text-cream/45 truncate">
              {term.aliases.join(' · ')}
            </div>
          ) : null}
        </div>
        <span
          className="shrink-0 kr-num text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{
            color: badge.color,
            background: `${badge.color}1f`,
            border: `1px solid ${badge.color}55`,
          }}
        >
          {badge.label}
        </span>
      </header>

      <p className="kr-body text-[13.5px] md:text-[14px] text-cream/90 leading-[1.6] mb-2">
        {term.short}
      </p>
      <p className="kr-body text-[12.5px] md:text-[13px] text-cream/65 leading-[1.65] mb-3 whitespace-pre-line">
        {term.detail}
      </p>

      {lessonHref ? (
        <a
          href={lessonHref}
          onClick={(e) => handleNavClick(e, lessonHref)}
          className="inline-flex items-center gap-1.5 kr-heading uppercase tracking-widest text-[10.5px] text-neon hover:underline"
        >
          관련 학습 페이지
          <ChevronRight size={11} strokeWidth={2.6} />
        </a>
      ) : null}
    </article>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="inline-flex items-center kr-num text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full"
      style={{
        color,
        background: `${color}1a`,
        border: `1px solid ${color}55`,
      }}
    >
      {children}
    </span>
  );
}

function slug(s: string): string {
  return s.replace(/\s+/g, '-').toLowerCase();
}

/**
 * LessonStaticPage — Tier 2 programmatic SEO 페이지.
 *
 * 라우트: `/lesson/:stepId` (예: `/lesson/adsp-1-1-s1`)
 *
 * 목적:
 *   - 검색엔진봇이 색인 가능한 단일 step 콘텐츠 페이지
 *   - 토픽 long-tail 키워드 진입 (`DIKW 피라미드 ADsP`, `JOIN 종류 SQLD` 등)
 *   - Internal linking: 같은 group 의 형제 step 으로 링크 → SEO 그래프 강화
 *
 * 게임 화면 (LessonScreen / DialogueLesson) 와 별개:
 *   - 이 페이지는 SEO·marketing 진입점 (정적, 인터랙티브 X)
 *   - "지금 학습 시작" CTA 가 게임 화면 (`#/game`) 으로 이동
 *
 * SEO 요소:
 *   - 페이지별 unique title (step.title + topic + subject)
 *   - description (dialogue 첫 turn 또는 첫 intro block)
 *   - canonical (https://quest-dp.com/lesson/{stepId})
 *   - JSON-LD Course schema
 *   - Breadcrumb schema
 */

import { Helmet } from 'react-helmet-async';
import { ArrowLeft, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import {
  findStepById,
  getChapterTitle,
} from '@/lib/lesson-lookup';
import type { LessonBlock } from '@/data/lessons';
import { handleNavClick } from '@/lib/navigate';

interface Props {
  stepId: string;
}

const SUBJECT_LABEL: Record<'adsp' | 'sqld', string> = {
  adsp: 'ADsP 데이터분석준전문가',
  sqld: 'SQLD SQL 개발자',
};

const SUBJECT_ACCENT: Record<'adsp' | 'sqld', string> = {
  adsp: '#67e8f9',
  sqld: '#c084fc',
};

export default function LessonStaticPage({ stepId }: Props) {
  const lookup = findStepById(stepId);

  // step 못 찾음 — 404
  if (!lookup) {
    return <NotFound />;
  }

  const { lesson, step, siblingsInGroup, indexInChapter, totalInChapter } = lookup;
  const subject = lesson.subject;
  const accent = SUBJECT_ACCENT[subject];
  const chapterTitle = getChapterTitle(subject, lesson.chapter) ?? `Chapter ${lesson.chapter}`;

  // SEO 메타 — title 60자 / description 160자 이내
  const seoTitle = `${step.title} — ${lesson.topic} | ${SUBJECT_LABEL[subject]}`;
  const seoDescription = makeDescription(step, lesson.topic);
  const canonical = `https://quest-dp.com/lesson/${stepId}`;

  // JSON-LD — Course schema (학습 콘텐츠)
  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: step.title,
    description: seoDescription,
    provider: {
      '@type': 'Organization',
      name: 'QuestDP',
      sameAs: 'https://quest-dp.com',
    },
    inLanguage: 'ko-KR',
    teaches: lesson.topic,
    educationalLevel: SUBJECT_LABEL[subject],
    isAccessibleForFree: true,
  };

  // BreadcrumbList schema
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://quest-dp.com/' },
      { '@type': 'ListItem', position: 2, name: SUBJECT_LABEL[subject], item: `https://quest-dp.com/#/game/${subject}` },
      { '@type': 'ListItem', position: 3, name: chapterTitle, item: canonical },
      { '@type': 'ListItem', position: 4, name: step.title, item: canonical },
    ],
  };

  return (
    <article
      className="relative min-h-screen isolate overflow-hidden bg-base text-cream"
    >
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">
          {JSON.stringify(courseJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
      </Helmet>

      <div className="relative z-10 max-w-[820px] lg:max-w-[1000px] mx-auto px-5 md:px-8 lg:px-12 pt-8 pb-16">
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
          <span style={{ color: accent }}>{SUBJECT_LABEL[subject]}</span>
          <ChevronRight size={12} className="text-cream/30" />
          <span>Chapter {lesson.chapter}</span>
          <ChevronRight size={12} className="text-cream/30" />
          <span className="text-cream/75">{chapterTitle}</span>
          <ChevronRight size={12} className="text-cream/30" />
          <span className="text-cream/85">{lesson.topic}</span>
        </nav>

        {/* Main heading — H1 (SEO 핵심) */}
        <header className="mb-8 pb-6 border-b border-cream/10">
          <h1 className="kr-heading text-[28px] md:text-[36px] lg:text-[42px] leading-[1.2] mb-3">
            {step.title}
          </h1>
          <p className="kr-body text-[14px] md:text-[15px] text-cream/65 leading-[1.6]">
            {seoDescription}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 kr-num text-[11px] uppercase tracking-widest text-cream/55">
            <BookOpen size={12} strokeWidth={2.4} />
            챕터 진행 — Step {indexInChapter} / {totalInChapter}
          </div>
        </header>

        {/* Content blocks — 정적 SEO 노출용 */}
        <div className="space-y-6 mb-10">
          {step.blocks.map((block, i) => (
            <BlockRenderer key={i} block={block} accent={accent} />
          ))}
        </div>

        {/* CTA — 게임으로 진입 */}
        <section
          className="rounded-[20px] p-6 md:p-8 mb-10"
          style={{
            background: `linear-gradient(135deg, ${accent}1a 0%, rgba(111,255,0,0.08) 100%)`,
            border: `1px solid ${accent}40`,
          }}
        >
          <h2 className="kr-heading text-[18px] md:text-[20px] mb-2 inline-flex items-center gap-2">
            <Sparkles size={18} style={{ color: accent }} />
            게임으로 풀어보기
          </h2>
          <p className="kr-body text-[13px] md:text-[14px] text-cream/75 leading-[1.65] mb-5">
            QuestDP 의 인터랙티브 학습 화면에서 이 개념을 토리·셀리와 함께 풀어보세요.
            정답·해설·약점 분석까지 한 화면에서 즉시 진행.
          </p>
          <a
            href={`#/game/${subject}`}
            className="kr-heading uppercase tracking-widest inline-flex items-center gap-2 text-[12px] md:text-[13px] px-5 py-3 rounded-full active:scale-95 transition"
            style={{
              background: '#FD802E',
              color: '#010828',
              boxShadow: '0 8px 22px -6px rgba(253,128,46,0.55)',
            }}
          >
            지금 학습하기
            <ChevronRight size={14} strokeWidth={2.6} />
          </a>
        </section>

        {/* 관련 step (같은 group) — Internal linking */}
        {siblingsInGroup.length > 0 ? (
          <section>
            <h2 className="kr-heading text-[16px] md:text-[18px] mb-4">
              관련 학습 — {lesson.topic}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none m-0 p-0">
              {siblingsInGroup.map(({ step: sib }) => {
                const href = `/lesson/${sib.id}`;
                return (
                  <li key={sib.id}>
                    <a
                      href={href}
                      onClick={(e) => handleNavClick(e, href)}
                      className="block rounded-[14px] px-4 py-3.5 border border-cream/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-neon/40 transition"
                    >
                      <div className="kr-num text-[10px] uppercase tracking-widest text-cream/50 mb-1">
                        같은 토픽 다른 개념
                      </div>
                      <div className="kr-body text-[14px] text-cream/90">
                        {sib.title}
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {/* Footer mini-CTA */}
        <div className="mt-12 pt-6 border-t border-cream/10 text-center">
          <p className="kr-body text-[12px] text-cream/50 mb-3">
            총 225 step · 631 문항 · 토리·셀리와 함께 RPG 처럼 학습
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

// ─── 보조 컴포넌트 ─────────────────────────────────────────────

function BlockRenderer({ block, accent }: { block: LessonBlock; accent: string }) {
  switch (block.kind) {
    case 'intro':
      return (
        <p className="kr-body text-[15px] md:text-[16px] leading-[1.75] text-cream/90 whitespace-pre-line">
          {block.body}
        </p>
      );
    case 'section':
      return (
        <div>
          <h3 className="kr-heading text-[16px] md:text-[18px] mb-2" style={{ color: accent }}>
            {block.title}
          </h3>
          <p className="kr-body text-[14px] md:text-[15px] leading-[1.7] text-cream/85 whitespace-pre-line">
            {block.body}
          </p>
        </div>
      );
    case 'keypoints':
      return (
        <div className="rounded-[14px] p-4 md:p-5 border border-cream/10 bg-white/[0.02]">
          {block.title ? (
            <h3 className="kr-heading text-[14px] md:text-[15px] mb-2.5" style={{ color: accent }}>
              {block.title}
            </h3>
          ) : null}
          <ul className="space-y-1.5 list-none m-0 p-0">
            {block.items.map((it, i) => (
              <li key={i} className="kr-body text-[13.5px] md:text-[14px] leading-[1.65] text-cream/85 flex gap-2">
                <span style={{ color: accent }}>•</span>
                <span className="whitespace-pre-line">{it}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case 'table':
      return (
        <div className="overflow-x-auto rounded-[14px] border border-cream/10">
          {block.title ? (
            <div className="kr-heading text-[13px] px-4 pt-3 pb-2 border-b border-cream/10" style={{ color: accent }}>
              {block.title}
            </div>
          ) : null}
          <table className="w-full kr-body text-[12.5px] md:text-[13.5px]">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left font-semibold text-cream/85 bg-white/[0.04]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-t border-cream/8">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-cream/80 align-top whitespace-pre-line">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'example':
      return (
        <div className="rounded-[14px] p-4 md:p-5 border-l-4" style={{ borderLeftColor: accent, background: 'rgba(255,255,255,0.03)' }}>
          {block.title ? (
            <h3 className="kr-heading text-[13px] md:text-[14px] mb-2 text-cream/75 uppercase tracking-widest">
              {block.title}
            </h3>
          ) : null}
          <p className="kr-body text-[14px] md:text-[15px] leading-[1.7] text-cream/85 whitespace-pre-line">
            {block.body}
          </p>
        </div>
      );
    case 'callout':
      const toneStyle =
        block.tone === 'mnemonic'
          ? { bg: 'rgba(111,255,0,0.08)', border: 'rgba(111,255,0,0.4)', color: '#9CFF3D' }
          : block.tone === 'warn'
            ? { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.4)', color: '#fca5a5' }
            : { bg: 'rgba(255,176,32,0.08)', border: 'rgba(255,176,32,0.4)', color: '#FFB020' };
      return (
        <div className="rounded-[14px] p-4 md:p-5" style={{ background: toneStyle.bg, border: `1px solid ${toneStyle.border}` }}>
          <h3 className="kr-heading text-[13px] md:text-[14px] mb-2" style={{ color: toneStyle.color }}>
            {block.title}
          </h3>
          <p className="kr-body text-[13.5px] md:text-[14.5px] leading-[1.7] text-cream/90 whitespace-pre-line">
            {block.body}
          </p>
        </div>
      );
    default:
      return null;
  }
}

function NotFound() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 bg-base text-cream">
      <Helmet>
        <title>학습 페이지를 찾을 수 없어요 — QuestDP</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1 className="kr-heading text-[24px] md:text-[28px] mb-3">학습 페이지를 찾을 수 없어요</h1>
      <p className="kr-body text-[14px] text-cream/65 mb-6 text-center max-w-md">
        URL 이 잘못되었거나 콘텐츠가 이동했을 수 있어요. 홈에서 다른 학습을 둘러보세요.
      </p>
      <a
        href="/"
        onClick={(e) => handleNavClick(e, '/')}
        className="kr-heading uppercase tracking-widest text-[12px] px-5 py-3 rounded-full"
        style={{ background: '#FD802E', color: '#010828' }}
      >
        홈으로 돌아가기
      </a>
    </section>
  );
}

// dialogue 첫 turn → description 변환 (160자 이내).
// dialogue 없으면 첫 intro/section block 의 body 사용.
function makeDescription(
  step: { dialogue?: Array<{ text: string }>; blocks: Array<{ kind: string; body?: string }> },
  topic: string,
): string {
  // 1순위: dialogue 첫 turn (텍스트가 자연스러움)
  if (step.dialogue && step.dialogue.length > 0) {
    const text = step.dialogue[0].text
      .replace(/\[([^\]]+)\]/g, '$1') // [keyword] → keyword
      .trim();
    if (text.length > 160) return text.slice(0, 157) + '…';
    return text;
  }
  // 2순위: 첫 intro 또는 section block
  for (const b of step.blocks) {
    if ((b.kind === 'intro' || b.kind === 'section') && b.body) {
      const text = b.body.trim().split('\n')[0];
      if (text.length > 160) return text.slice(0, 157) + '…';
      return text;
    }
  }
  // fallback
  return `${topic} 의 핵심 개념을 정리한 학습 페이지. QuestDP 에서 인터랙티브하게 풀어보세요.`;
}

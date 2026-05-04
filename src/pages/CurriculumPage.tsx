/**
 * CurriculumPage — Tier 2 programmatic SEO pillar 페이지.
 *
 * 라우트: `/curriculum/:subject` — `adsp` 또는 `sqld`
 *
 * 목적:
 *   - 고볼륨 키워드 진입 ("ADsP 출제범위", "SQLD 시험범위", "ADsP 커리큘럼")
 *   - 301 lesson 페이지로 향하는 internal link 그래프의 root (pillar ↔ supporting)
 *   - 사용자가 한 화면에서 전체 커리큘럼을 훑고 원하는 토픽으로 점프
 *
 * SEO 요소:
 *   - 페이지별 unique title — 과목명 + 출제범위
 *   - description (총 챕터·토픽·step 카운트)
 *   - canonical
 *   - JSON-LD Course (subject 단위) + ItemList (모든 lesson 의 link)
 *   - BreadcrumbList
 */

import { Helmet } from 'react-helmet-async';
import { ArrowLeft, BookOpen, ChevronRight, Sparkles, Layers } from 'lucide-react';
import { getCurriculum, type SubjectCurriculum, type CurriculumTopic } from '@/lib/curriculum';
import { handleNavClick } from '@/lib/navigate';

interface Props {
  subject: 'adsp' | 'sqld';
}

const SUBJECT_LABEL: Record<'adsp' | 'sqld', string> = {
  adsp: 'ADsP 데이터분석준전문가',
  sqld: 'SQLD SQL 개발자',
};

const SUBJECT_TAGLINE: Record<'adsp' | 'sqld', string> = {
  adsp: '데이터의 이해부터 분석 기획·통계·머신러닝까지 — 시험 출제범위 전체.',
  sqld: '데이터 모델링부터 SQL 기본·활용·관리 구문까지 — 시험 출제범위 전체.',
};

const SUBJECT_ACCENT: Record<'adsp' | 'sqld', string> = {
  adsp: '#67e8f9',
  sqld: '#c084fc',
};

export default function CurriculumPage({ subject }: Props) {
  const curriculum = getCurriculum(subject);
  const accent = SUBJECT_ACCENT[subject];
  const label = SUBJECT_LABEL[subject];
  const tagline = SUBJECT_TAGLINE[subject];

  const seoTitle = `${label} 출제범위 · 커리큘럼 — QuestDP`;
  const seoDescription =
    `${label} 시험 출제범위 전체를 ${curriculum.totalChapters}개 챕터 · ${curriculum.totalTopics}개 토픽 · ` +
    `${curriculum.totalSteps}개 학습 스텝으로 구조화. 무료로 모든 개념을 학습하고 인터랙티브하게 풀어보세요.`;
  const canonical = `https://quest-dp.com/curriculum/${subject}`;

  // JSON-LD Course
  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `${label} 출제범위 커리큘럼`,
    description: seoDescription,
    provider: {
      '@type': 'Organization',
      name: 'QuestDP',
      sameAs: 'https://quest-dp.com',
    },
    inLanguage: 'ko-KR',
    educationalLevel: label,
    isAccessibleForFree: true,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: `PT${Math.max(20, curriculum.totalSteps * 5)}M`,
    },
  };

  // JSON-LD ItemList — 모든 lesson 페이지를 list 로 노출
  const allLessonItems: Array<{ name: string; url: string }> = [];
  for (const ch of curriculum.chapters) {
    for (const topic of ch.topics) {
      for (const tl of topic.lessons) {
        for (const cs of tl.steps) {
          allLessonItems.push({
            name: cs.step.title,
            url: `https://quest-dp.com/lesson/${cs.step.id}`,
          });
        }
      }
    }
  }
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: allLessonItems.slice(0, 100).map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: it.url,
      name: it.name,
    })),
  };

  // BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://quest-dp.com/' },
      { '@type': 'ListItem', position: 2, name: label, item: canonical },
      { '@type': 'ListItem', position: 3, name: '출제범위', item: canonical },
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
        <script type="application/ld+json">{JSON.stringify(courseJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(itemListJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <div className="relative z-10 max-w-[900px] lg:max-w-[1080px] mx-auto px-5 md:px-8 lg:px-12 pt-8 pb-16">
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
          <span className="text-cream/85">출제범위 · 커리큘럼</span>
        </nav>

        {/* H1 */}
        <header className="mb-10 pb-8 border-b border-cream/10">
          <h1 className="kr-heading text-[28px] md:text-[40px] lg:text-[48px] leading-[1.15] mb-3">
            {label} 출제범위
          </h1>
          <p className="kr-body text-[15px] md:text-[16px] text-cream/75 leading-[1.65] mb-5 max-w-[680px]">
            {tagline}
          </p>

          {/* Stat strip */}
          <div className="flex items-center gap-3 md:gap-4 flex-wrap">
            <Stat label="챕터" value={curriculum.totalChapters} accent={accent} />
            <Stat label="토픽" value={curriculum.totalTopics} accent={accent} />
            <Stat label="학습 스텝" value={curriculum.totalSteps} accent={accent} />
          </div>
        </header>

        {/* Chapters */}
        <div className="space-y-12">
          {curriculum.chapters.map((ch) => (
            <ChapterSection key={ch.chapter} chapter={ch} accent={accent} />
          ))}
        </div>

        {/* CTA */}
        <section
          className="mt-14 rounded-[20px] p-6 md:p-8"
          style={{
            background: `linear-gradient(135deg, ${accent}1a 0%, rgba(111,255,0,0.08) 100%)`,
            border: `1px solid ${accent}40`,
          }}
        >
          <h2 className="kr-heading text-[18px] md:text-[20px] mb-2 inline-flex items-center gap-2">
            <Sparkles size={18} style={{ color: accent }} />
            토리·셀리와 함께 풀어보기
          </h2>
          <p className="kr-body text-[13px] md:text-[14px] text-cream/75 leading-[1.65] mb-5">
            QuestDP 의 우주 탐험 RPG 화면에서 이 커리큘럼을 게임처럼 학습. 정답·해설·약점 분석까지 한 화면에서.
          </p>
          <div className="flex flex-wrap gap-3">
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
            <a
              href={subject === 'adsp' ? '/curriculum/sqld' : '/curriculum/adsp'}
              onClick={(e) =>
                handleNavClick(e, subject === 'adsp' ? '/curriculum/sqld' : '/curriculum/adsp')
              }
              className="kr-heading uppercase tracking-widest inline-flex items-center gap-2 text-[12px] md:text-[13px] px-5 py-3 rounded-full border border-cream/20 hover:border-neon/40 hover:text-neon transition"
            >
              {subject === 'adsp' ? 'SQLD 출제범위' : 'ADsP 출제범위'}
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

// ─── 보조 컴포넌트 ────────────────────────────────────────────

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div
      className="rounded-[12px] px-4 py-2.5 border"
      style={{ borderColor: `${accent}40`, background: 'rgba(255,255,255,0.03)' }}
    >
      <div className="kr-num text-[10px] uppercase tracking-widest text-cream/55 mb-0.5">
        {label}
      </div>
      <div className="kr-heading text-[20px] md:text-[22px]" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

function ChapterSection({
  chapter,
  accent,
}: {
  chapter: SubjectCurriculum['chapters'][number];
  accent: string;
}) {
  return (
    <section>
      <header className="mb-5">
        <div className="kr-num text-[10px] uppercase tracking-widest text-cream/50 mb-1">
          Chapter {chapter.chapter}
        </div>
        <h2 className="kr-heading text-[22px] md:text-[28px] leading-[1.25] mb-1.5">
          {chapter.title}
        </h2>
        <div className="kr-num text-[11px] text-cream/55 inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <BookOpen size={11} strokeWidth={2.4} />
            토픽 {chapter.topics.length}개
          </span>
          <span className="inline-flex items-center gap-1">
            <Layers size={11} strokeWidth={2.4} />
            학습 스텝 {chapter.totalSteps}개
          </span>
        </div>
      </header>

      <div className="space-y-6">
        {chapter.topics.map((topic) => (
          <TopicGroup key={topic.topic} topic={topic} accent={accent} />
        ))}
      </div>
    </section>
  );
}

function TopicGroup({ topic, accent }: { topic: CurriculumTopic; accent: string }) {
  // lesson 이 비어 있으면 placeholder
  if (topic.lessons.length === 0) {
    return (
      <div className="rounded-[14px] p-4 md:p-5 border border-cream/10 bg-white/[0.02]">
        <h3 className="kr-heading text-[15px] md:text-[16px] mb-1" style={{ color: accent }}>
          {topic.topic}
        </h3>
        <p className="kr-body text-[12.5px] text-cream/55">학습 콘텐츠 준비 중</p>
      </div>
    );
  }

  // step 카운트 합계
  const totalSteps = topic.lessons.reduce((sum, l) => sum + l.steps.length, 0);

  return (
    <div className="rounded-[14px] p-4 md:p-5 border border-cream/10 bg-white/[0.02]">
      <header className="mb-3">
        <h3 className="kr-heading text-[15px] md:text-[17px] mb-0.5" style={{ color: accent }}>
          {topic.topic}
        </h3>
        <div className="kr-num text-[10px] uppercase tracking-widest text-cream/50">
          Step {totalSteps}개
        </div>
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-none m-0 p-0">
        {topic.lessons.flatMap((tl) =>
          tl.steps.map(({ step, indexInChapter }) => {
            const href = `/lesson/${step.id}`;
            return (
              <li key={step.id}>
                <a
                  href={href}
                  onClick={(e) => handleNavClick(e, href)}
                  className="block rounded-[10px] px-3 py-2.5 border border-cream/8 hover:border-neon/40 hover:bg-white/[0.04] transition"
                >
                  <div className="flex items-baseline gap-2">
                    <span
                      className="kr-num text-[10px] tabular-nums shrink-0"
                      style={{ color: accent }}
                    >
                      {String(indexInChapter + 1).padStart(2, '0')}
                    </span>
                    <span className="kr-body text-[13px] md:text-[13.5px] text-cream/85 leading-[1.4]">
                      {step.title}
                    </span>
                  </div>
                </a>
              </li>
            );
          }),
        )}
      </ul>
    </div>
  );
}

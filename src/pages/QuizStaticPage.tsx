/**
 * QuizStaticPage — Tier 2 programmatic SEO 의 quiz 진입점.
 *
 * 라우트: `/quiz/:questionId` (예: `/quiz/adsp-1-1-cp-01`)
 *
 * 목적:
 *   - 600+ 문제별 단일 indexable 페이지
 *   - "ADsP 2024-46회 1번 해설" / "SQLD 2024-55회 12번" / 토픽별 long-tail 등
 *     transactional intent 키워드 진입
 *   - JSON-LD Question schema → Google rich results (Q&A snippet)
 *
 * 콘텐츠 정책:
 *   - 질문 + 보기 4개 모두 정적 노출 (SEO 인덱싱 + 사용자 사전 검토)
 *   - 정답 + 해설은 progressive disclosure (CSS hidden, "정답 보기" 클릭 시 펼침)
 *     → 봇은 모든 콘텐츠 인덱싱 가능, 사용자는 self-pacing 으로 풀이 진행
 *
 * Internal linking:
 *   - 같은 토픽 다른 문제 6개 (학습 cluster)
 *   - 같은 회차 다른 문제 6개 (회차 단위 cluster)
 *   - 게임 학습 화면 (#/game/{subject}) CTA
 */

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  CircleX,
  Sparkles,
} from 'lucide-react';
import { findQuestionById } from '@/lib/question-lookup';
import { explanationToText } from '@/types/question';
import type { MultipleChoiceQuestion } from '@/types/question';
import { handleNavClick } from '@/lib/navigate';

interface Props {
  questionId: string;
}

const SUBJECT_LABEL: Record<'adsp' | 'sqld', string> = {
  adsp: 'ADsP 데이터분석준전문가',
  sqld: 'SQLD SQL 개발자',
};

const SUBJECT_ACCENT: Record<'adsp' | 'sqld', string> = {
  adsp: '#67e8f9',
  sqld: '#c084fc',
};

export default function QuizStaticPage({ questionId }: Props) {
  const lookup = findQuestionById(questionId);
  const [revealed, setRevealed] = useState(false);

  if (!lookup) return <NotFound />;
  const { question: q, related, sameRound } = lookup;
  const accent = SUBJECT_ACCENT[q.subject];

  // SEO 메타
  const seoTitle = makeSeoTitle(q);
  const seoDescription = makeSeoDescription(q);
  const canonical = `https://quest-dp.com/quiz/${q.id}`;

  // JSON-LD Question schema
  const questionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Question',
    name: stripBrackets(q.question),
    text: stripBrackets(q.question),
    inLanguage: 'ko-KR',
    answerCount: 1,
    acceptedAnswer: {
      '@type': 'Answer',
      text: q.choices[q.answerIndex],
    },
    suggestedAnswer: q.choices.map((c, i) => ({
      '@type': 'Answer',
      text: c,
      ...(i === q.answerIndex ? {} : {}), // marker only on accepted
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://quest-dp.com/' },
      { '@type': 'ListItem', position: 2, name: SUBJECT_LABEL[q.subject], item: `https://quest-dp.com/#/game/${q.subject}` },
      { '@type': 'ListItem', position: 3, name: q.chapterTitle, item: canonical },
      { '@type': 'ListItem', position: 4, name: q.topic, item: canonical },
    ],
  };

  const round = q.source && /^\d{4}-\d+회/.test(q.source) ? q.source.match(/^(\d{4}-\d+회)/)?.[1] : null;

  return (
    <article className="relative min-h-screen isolate overflow-hidden bg-base text-cream">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">
          {JSON.stringify(questionJsonLd)}
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
          <span style={{ color: accent }}>{SUBJECT_LABEL[q.subject]}</span>
          <ChevronRight size={12} className="text-cream/30" />
          <span>Chapter {q.chapter}</span>
          <ChevronRight size={12} className="text-cream/30" />
          <span className="text-cream/75">{q.chapterTitle}</span>
          <ChevronRight size={12} className="text-cream/30" />
          <span className="text-cream/85">{q.topic}</span>
          {round ? (
            <>
              <ChevronRight size={12} className="text-cream/30" />
              <span className="text-cream/85">{round}</span>
            </>
          ) : null}
        </nav>

        {/* H1 — SEO 핵심 */}
        <header className="mb-6 pb-5 border-b border-cream/10">
          <h1 className="kr-heading text-[24px] md:text-[30px] lg:text-[34px] leading-[1.3] mb-3">
            {q.topic} — {round ? `${round} 문제` : '개념 예제'}
          </h1>
          <div className="flex items-center gap-3 flex-wrap kr-num text-[11px] uppercase tracking-widest text-cream/55">
            <span>난이도 {'★'.repeat(q.difficulty ?? 2)}{'☆'.repeat(5 - (q.difficulty ?? 2))}</span>
            <span className="text-cream/30">·</span>
            <span>{q.source ?? 'QuestDP 출제'}</span>
          </div>
        </header>

        {/* 문제 본문 */}
        <section className="mb-6">
          <h2 className="kr-heading text-[14px] md:text-[15px] uppercase tracking-widest text-cream/55 mb-3">
            문제
          </h2>
          <p className="kr-body text-[16px] md:text-[18px] leading-[1.7] text-cream whitespace-pre-line">
            {renderHighlighted(q.question)}
          </p>
        </section>

        {/* 보기 — 모두 노출 (SEO + UX) */}
        <section className="mb-6">
          <ul className="space-y-2 list-none m-0 p-0">
            {q.choices.map((choice, i) => {
              const isAnswer = i === q.answerIndex;
              const showHighlight = revealed && isAnswer;
              return (
                <li
                  key={i}
                  className="rounded-[14px] px-4 py-3.5 transition flex items-start gap-3"
                  style={{
                    background: showHighlight
                      ? 'rgba(111,255,0,0.10)'
                      : 'rgba(255,255,255,0.03)',
                    border: showHighlight
                      ? '1.5px solid rgba(111,255,0,0.5)'
                      : '1px solid rgba(239,244,255,0.10)',
                  }}
                >
                  <span
                    className="kr-heading inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] shrink-0"
                    style={{
                      background: showHighlight ? '#6FFF00' : 'rgba(239,244,255,0.08)',
                      color: showHighlight ? '#010828' : 'rgba(239,244,255,0.7)',
                    }}
                  >
                    {['A', 'B', 'C', 'D', 'E'][i]}
                  </span>
                  <span className="kr-body text-[14.5px] md:text-[15.5px] leading-[1.6] text-cream/90 whitespace-pre-line">
                    {choice}
                  </span>
                  {showHighlight ? (
                    <CircleCheck
                      size={18}
                      strokeWidth={2.4}
                      className="ml-auto shrink-0"
                      style={{ color: '#6FFF00' }}
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        {/* 정답·해설 토글 (progressive disclosure) */}
        <section className="mb-10">
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="kr-heading uppercase tracking-widest inline-flex items-center gap-2 text-[12px] md:text-[13px] px-5 py-3 rounded-full transition active:scale-95"
            style={{
              background: revealed ? 'rgba(111,255,0,0.14)' : '#FD802E',
              color: revealed ? '#9CFF3D' : '#010828',
              border: revealed ? '1.5px solid rgba(111,255,0,0.4)' : 'none',
              boxShadow: revealed ? 'none' : '0 8px 22px -6px rgba(253,128,46,0.55)',
            }}
            aria-expanded={revealed}
          >
            {revealed ? <ChevronUp size={14} strokeWidth={2.6} /> : <ChevronDown size={14} strokeWidth={2.6} />}
            {revealed ? '정답·해설 접기' : '정답·해설 보기'}
          </button>

          {revealed ? (
            <div className="mt-5 rounded-[16px] p-5 md:p-6" style={{ background: 'rgba(111,255,0,0.06)', border: '1px solid rgba(111,255,0,0.3)' }}>
              <div className="kr-num text-[10.5px] uppercase tracking-widest text-neon/85 mb-2">정답</div>
              <p className="kr-heading text-[16px] md:text-[18px] mb-4 text-cream">
                <span className="kr-num inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] mr-2" style={{ background: '#6FFF00', color: '#010828' }}>
                  {['A', 'B', 'C', 'D', 'E'][q.answerIndex]}
                </span>
                {q.choices[q.answerIndex]}
              </p>
              {q.explanation ? (
                <>
                  <div className="kr-num text-[10.5px] uppercase tracking-widest text-cream/55 mb-2">해설</div>
                  <p className="kr-body text-[14px] md:text-[15px] leading-[1.75] text-cream/90 whitespace-pre-line">
                    {explanationToText(q.explanation)}
                  </p>
                </>
              ) : null}
            </div>
          ) : null}
        </section>

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
            게임처럼 풀어보기
          </h2>
          <p className="kr-body text-[13px] md:text-[14px] text-cream/75 leading-[1.65] mb-5">
            QuestDP 의 인터랙티브 학습 화면에서 같은 토픽 문제를 무제한 풀이.
            정답·해설 즉시 확인 + AI 약점 분석 + Leitner SRS 자동 복습.
          </p>
          <a
            href={`#/game/${q.subject}`}
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

        {/* 같은 토픽 다른 문제 — Internal linking */}
        {related.length > 0 ? (
          <section className="mb-8">
            <h2 className="kr-heading text-[16px] md:text-[18px] mb-4">
              같은 토픽 다른 문제 — {q.topic}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none m-0 p-0">
              {related.map((r) => (
                <RelatedQuestionLink key={r.id} q={r} />
              ))}
            </ul>
          </section>
        ) : null}

        {/* 같은 회차 다른 문제 */}
        {sameRound.length > 0 ? (
          <section>
            <h2 className="kr-heading text-[16px] md:text-[18px] mb-4">
              같은 회차 다른 문제 {round ? `— ${round}` : ''}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none m-0 p-0">
              {sameRound.map((r) => (
                <RelatedQuestionLink key={r.id} q={r} />
              ))}
            </ul>
          </section>
        ) : null}

        {/* Footer mini-CTA */}
        <div className="mt-12 pt-6 border-t border-cream/10 text-center">
          <p className="kr-body text-[12px] text-cream/50 mb-3">
            225 step + 631 문항 — 토리·셀리와 함께 RPG 처럼 학습
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

function RelatedQuestionLink({ q }: { q: MultipleChoiceQuestion }) {
  const href = `/quiz/${q.id}`;
  return (
    <li>
      <a
        href={href}
        onClick={(e) => handleNavClick(e, href)}
        className="block rounded-[14px] px-4 py-3.5 border border-cream/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-neon/40 transition"
      >
        <div className="kr-num text-[10px] uppercase tracking-widest text-cream/50 mb-1">
          {q.source ?? '개념 예제'}
        </div>
        <div className="kr-body text-[13.5px] text-cream/90 line-clamp-2">
          {stripBrackets(q.question)}
        </div>
      </a>
    </li>
  );
}

function NotFound() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 bg-base text-cream">
      <Helmet>
        <title>문제를 찾을 수 없어요 — QuestDP</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <CircleX size={48} strokeWidth={1.6} className="text-cream/40 mb-4" />
      <h1 className="kr-heading text-[24px] md:text-[28px] mb-3">
        문제를 찾을 수 없어요
      </h1>
      <p className="kr-body text-[14px] text-cream/65 mb-6 text-center max-w-md">
        URL 이 잘못되었거나 문제가 비공개되었을 수 있어요.
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

// ─── helpers ───────────────────────────────────────────────────

/** [keyword] brackets 제거 — 검색 결과·schema 에 노출 시 깔끔하게. */
function stripBrackets(text: string): string {
  return text.replace(/\[([^\]]+)\]/g, '$1');
}

/** [keyword] 강조 렌더 — 본문 표시용. */
function renderHighlighted(text: string): React.ReactNode {
  const parts = text.split(/(\[[^\]]+\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]$/);
    if (m) {
      return (
        <span
          key={i}
          className="text-neon font-semibold"
          style={{ borderBottom: '1px dashed rgba(111,255,0,0.4)' }}
        >
          {m[1]}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function makeSeoTitle(q: MultipleChoiceQuestion): string {
  const round = q.source?.match(/^(\d{4}-\d+회)/)?.[1];
  const subjectShort = q.subject.toUpperCase();
  if (round) {
    return `${subjectShort} ${round} ${q.topic} 문제 — 정답·해설 | QuestDP`;
  }
  return `${q.topic} — ${subjectShort} 개념 문제 풀이 | QuestDP`;
}

function makeSeoDescription(q: MultipleChoiceQuestion): string {
  const stripped = stripBrackets(q.question).trim();
  const sourceTag = q.source ? `${q.source} ` : '';
  const expRaw = q.explanation ? explanationToText(q.explanation) : '';
  const expTrim = stripBrackets(expRaw).slice(0, 80);
  const tail = expTrim ? ` 해설: ${expTrim}…` : '';
  const desc = `${sourceTag}${q.topic} — ${stripped.slice(0, 80)}${tail}`;
  return desc.length > 160 ? desc.slice(0, 157) + '…' : desc;
}

import { ArrowLeft, CheckCircle2, ChevronRight, HelpCircle, Sparkles } from 'lucide-react';
import {
  getComhwalTopicCards,
  getComhwalTopicMeta,
  type ComhwalConceptCard,
} from '@/data/comhwal/concepts';
import { EXPANSION_SUBJECTS } from '@/game/expansionSubjects';
import { handleNavClick } from '@/lib/navigate';
import { useSeoMeta } from '@/lib/seo';

interface Props {
  planetKey: string;
  topicId: string;
}

export default function ComhwalTopicPage({ planetKey, topicId }: Props) {
  const topic = findComhwalTopic(planetKey, topicId);
  const cards = getComhwalTopicCards(planetKey, topicId);
  const meta = getComhwalTopicMeta(planetKey, topicId);
  const canonical = `https://quest-dp.com/topics/comhwal/${planetKey}/${topicId}/`;
  const title = topic?.title ?? '컴활 토픽';
  const planetTitle = meta?.chapter.title ?? topic?.planetTitle ?? '컴활 필기';
  const sectionTitle = meta?.section.title ?? topic?.sectionTitle ?? planetTitle;
  const hasContent = !!topic && cards.length > 0;
  const seoDescription = hasContent
    ? `컴활 필기 ${planetTitle} ${topicId} ${title}를 초보자도 이해할 수 있게 짧은 개념 카드 ${cards.length}개와 체크포인트 문제로 정리했습니다.`
    : '컴활 필기 토픽 페이지를 찾을 수 없습니다.';

  useSeoMeta({
    title: hasContent
      ? `${title} — 컴활 ${planetTitle} 개념 카드 | QuestDP`
      : '컴활 토픽을 찾을 수 없어요 — QuestDP',
    description: seoDescription,
    canonical,
    ogType: 'article',
    ogImage: 'https://quest-dp.com/og/default.png',
    noIndex: !hasContent,
    jsonLd: hasContent
      ? buildJsonLd({
          cards,
          canonical,
          planetTitle,
          sectionTitle,
          title,
          topicId,
        })
      : undefined,
  });

  if (!hasContent) {
    return <NotFound />;
  }

  const checkpointQuestions = cards
    .map((card) => card.question)
    .filter((question): question is NonNullable<ComhwalConceptCard['question']> => !!question);

  return (
    <article className="relative isolate min-h-screen overflow-hidden bg-base text-cream">
      <div className="relative z-10 mx-auto max-w-[820px] px-5 pb-16 pt-8 md:px-8 lg:max-w-[960px] lg:px-12">
        <a
          href="/curriculum/comhwal"
          onClick={(event) => handleNavClick(event, '/curriculum/comhwal')}
          className="mb-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-cream/65 transition hover:text-neon"
        >
          <ArrowLeft size={14} strokeWidth={2.4} />
          컴활 커리큘럼
        </a>

        <nav
          aria-label="breadcrumb"
          className="mb-3 flex flex-wrap items-center gap-1.5 text-[11px] text-cream/55"
        >
          <a
            href="/curriculum/comhwal"
            onClick={(event) => handleNavClick(event, '/curriculum/comhwal')}
            className="transition hover:text-neon"
          >
            컴활 필기
          </a>
          <ChevronRight size={12} className="text-cream/30" />
          <span className="text-[#A7E96A]">{planetTitle}</span>
          <ChevronRight size={12} className="text-cream/30" />
          <span className="text-cream/85">{topicId}</span>
        </nav>

        <header className="mb-10 border-b border-cream/10 pb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#A7E96A]/35 bg-[#A7E96A]/10 px-3 py-1.5 text-[11px] uppercase tracking-widest text-[#A7E96A]">
            <Sparkles size={13} strokeWidth={2.4} />
            컴활 {planetTitle}
          </div>
          <h1 className="kr-heading mb-3 text-[28px] leading-[1.16] md:text-[38px] lg:text-[44px]">
            {title}
          </h1>
          <p className="kr-body max-w-[700px] text-[15px] leading-[1.72] text-cream/76 md:text-[16px]">
            {seoDescription}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Stat label="토픽 번호" value={topicId} />
            <Stat label="개념 카드" value={`${cards.length}개`} />
            <Stat label="체크포인트" value={`${checkpointQuestions.length}개`} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#/game/comhwal"
              onClick={(event) => handleNavClick(event, '#/game/comhwal')}
              className="inline-flex items-center gap-2 rounded-full bg-[#FD802E] px-5 py-3 text-[12px] uppercase tracking-widest text-[#010828] transition active:scale-95 md:text-[13px]"
            >
              QuestDP 게임 섹션으로
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
            <a
              href="/curriculum/comhwal"
              onClick={(event) => handleNavClick(event, '/curriculum/comhwal')}
              className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-5 py-3 text-[12px] uppercase tracking-widest text-cream/76 transition hover:border-neon/40 hover:text-neon md:text-[13px]"
            >
              컴활 전체 범위
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
          </div>
        </header>

        <section className="mb-12 rounded-[18px] border border-[#A7E96A]/20 bg-[#A7E96A]/[0.055] p-5 md:p-6">
          <h2 className="kr-heading mb-2 text-[18px] md:text-[22px]">
            먼저 이렇게 잡으면 쉬워요
          </h2>
          <p className="kr-body text-[13.5px] leading-[1.75] text-cream/78 md:text-[14.5px]">
            컴퓨터 노베이스라면 용어를 외우기 전에 “어떤 상황에서 쓰는 말인지”를 먼저 잡아야 합니다.
            아래 카드는 한 개념을 짧게 보고 바로 선지 판단으로 이어가도록 만든 컴활 필기 학습 단위입니다.
          </p>
        </section>

        <div className="space-y-5">
          {cards.map((card, index) => (
            <ConceptCard key={card.id} card={card} index={index} />
          ))}
        </div>

        <section className="mt-14 rounded-[20px] border border-cream/10 bg-white/[0.03] p-6 md:p-8">
          <h2 className="kr-heading mb-2 text-[20px] md:text-[24px]">
            다음 토픽으로 이어가기
          </h2>
          <p className="kr-body mb-5 max-w-[680px] text-[14px] leading-[1.75] text-cream/70">
            컴활 {planetTitle} 토픽은 실제 카드가 준비된 항목만 개별 페이지로 열립니다.
            전체 과목 구조와 1급·2급 차이는 커리큘럼에서 함께 확인하세요.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/curriculum/comhwal"
              onClick={(event) => handleNavClick(event, '/curriculum/comhwal')}
              className="inline-flex items-center gap-2 rounded-full bg-[#FD802E] px-5 py-3 text-[12px] uppercase tracking-widest text-[#010828] transition active:scale-95 md:text-[13px]"
            >
              컴활 전체 범위
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
            <a
              href="/faq/comhwal"
              onClick={(event) => handleNavClick(event, '/faq/comhwal')}
              className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-5 py-3 text-[12px] uppercase tracking-widest transition hover:border-neon/40 hover:text-neon md:text-[13px]"
            >
              컴활 FAQ
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
            <a
              href="#/game/comhwal"
              onClick={(event) => handleNavClick(event, '#/game/comhwal')}
              className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-5 py-3 text-[12px] uppercase tracking-widest transition hover:border-neon/40 hover:text-neon md:text-[13px]"
            >
              게임 화면으로
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
          </div>
        </section>
      </div>
    </article>
  );
}

function ConceptCard({ card, index }: { card: ComhwalConceptCard; index: number }) {
  return (
    <section className="rounded-[16px] border border-cream/10 bg-white/[0.025] p-5 md:p-6">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 text-[10px] uppercase tracking-widest text-cream/45">
            Card {String(index + 1).padStart(2, '0')}
          </div>
          <h2 className="kr-heading text-[18px] leading-[1.35] text-cream/95 md:text-[21px]">
            {card.title}
          </h2>
        </div>
        <CheckCircle2 className="mt-1 shrink-0 text-[#A7E96A]" size={20} strokeWidth={2.4} />
      </div>

      <p className="kr-body mb-4 text-[14.5px] leading-[1.78] text-cream/82 md:text-[15.5px]">
        {card.body}
      </p>

      <ul className="mb-4 grid list-none gap-2 p-0 md:grid-cols-3">
        {card.keyPoints.map((point) => (
          <li
            key={point}
            className="rounded-[12px] border border-[#A7E96A]/18 bg-[#A7E96A]/[0.045] px-3 py-2 text-[12.5px] leading-[1.55] text-cream/78"
          >
            {point}
          </li>
        ))}
      </ul>

      {card.examTip ? (
        <p className="kr-body mb-4 rounded-[12px] border border-cream/10 bg-white/[0.025] px-4 py-3 text-[13px] leading-[1.7] text-cream/72">
          <strong className="kr-heading mr-1 text-[#A7E96A]">시험 포인트</strong>
          {card.examTip}
        </p>
      ) : null}

      {card.question ? (
        <div className="rounded-[14px] border border-cream/10 bg-base/35 p-4">
          <h3 className="kr-heading mb-3 inline-flex items-center gap-2 text-[14px] text-cream/95">
            <HelpCircle size={15} className="text-[#A7E96A]" strokeWidth={2.4} />
            체크포인트 문제
          </h3>
          <p className="kr-body mb-3 text-[13.5px] leading-[1.7] text-cream/82">
            {card.question.prompt}
          </p>
          <ol className="m-0 list-none space-y-2 p-0">
            {card.question.choices.map((choice, choiceIndex) => (
              <li
                key={choice}
                className="rounded-[10px] border px-3 py-2 text-[13px] leading-[1.55]"
                style={{
                  borderColor:
                    choiceIndex === card.question?.answerIndex
                      ? 'rgba(167,233,106,0.5)'
                      : 'rgba(239,244,255,0.1)',
                  color:
                    choiceIndex === card.question?.answerIndex
                      ? '#A7E96A'
                      : 'rgba(239,244,255,0.72)',
                  background:
                    choiceIndex === card.question?.answerIndex
                      ? 'rgba(167,233,106,0.08)'
                      : 'rgba(255,255,255,0.02)',
                }}
              >
                {choice}
              </li>
            ))}
          </ol>
          <p className="kr-body mt-3 text-[12.5px] leading-[1.7] text-cream/62">
            {card.question.explanation}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-[#A7E96A]/30 bg-white/[0.03] px-4 py-2.5">
      <div className="mb-0.5 text-[10px] uppercase tracking-widest text-cream/55">
        {label}
      </div>
      <div className="kr-heading text-[18px] text-[#A7E96A] md:text-[20px]">{value}</div>
    </div>
  );
}

function NotFound() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-base px-6 text-center text-cream">
      <h1 className="kr-heading mb-3 text-[24px] md:text-[28px]">
        컴활 토픽을 찾을 수 없어요
      </h1>
      <p className="kr-body mb-6 max-w-md text-[14px] leading-[1.7] text-cream/65">
        아직 개별 카드가 공개되지 않았거나 URL이 잘못되었을 수 있습니다.
      </p>
      <a
        href="/curriculum/comhwal"
        onClick={(event) => handleNavClick(event, '/curriculum/comhwal')}
        className="rounded-full bg-[#FD802E] px-5 py-3 text-[12px] uppercase tracking-widest text-[#010828]"
      >
        컴활 커리큘럼으로
      </a>
    </section>
  );
}

function findComhwalTopic(planetKey: string, topicId: string) {
  const planet = EXPANSION_SUBJECTS.comhwal.planets.find((item) => item.key === planetKey);
  if (!planet) return null;
  for (const section of planet.sections) {
    const topic = section.topics.find((item) => item.id === topicId);
    if (topic) return { ...topic, sectionTitle: section.title, planetTitle: planet.title };
  }
  return null;
}

function buildJsonLd({
  cards,
  canonical,
  planetTitle,
  sectionTitle,
  title,
  topicId,
}: {
  cards: ComhwalConceptCard[];
  canonical: string;
  planetTitle: string;
  sectionTitle: string;
  title: string;
  topicId: string;
}) {
  const questions = cards
    .map((card) => card.question)
    .filter((question): question is NonNullable<ComhwalConceptCard['question']> => !!question);
  const learningResource = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: `${title} 컴활 개념 카드`,
    description: `${title}를 컴활 필기 초보자도 이해할 수 있게 짧은 카드와 체크포인트 문제로 정리했습니다.`,
    url: canonical,
    inLanguage: 'ko-KR',
    learningResourceType: 'Concept overview',
    teaches: [title, planetTitle, sectionTitle],
    educationalLevel: '컴퓨터활용능력 필기',
    provider: { '@type': 'Organization', name: 'QuestDP', url: 'https://quest-dp.com' },
    isAccessibleForFree: true,
    hasPart: cards.slice(0, 12).map((card, index) => ({
      '@type': 'CreativeWork',
      position: index + 1,
      name: card.title,
      text: card.body,
    })),
  };

  const quizJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: `${title} 체크포인트 문제`,
    about: title,
    inLanguage: 'ko-KR',
    educationalLevel: '컴퓨터활용능력 필기',
    assesses: `${topicId} ${title}`,
    provider: { '@type': 'Organization', name: 'QuestDP', url: 'https://quest-dp.com' },
    hasPart: questions.slice(0, 8).map((question) => ({
      '@type': 'Question',
      name: question.prompt,
      acceptedAnswer: {
        '@type': 'Answer',
        text: question.choices[question.answerIndex],
      },
      suggestedAnswer: question.choices.map((choice) => ({
        '@type': 'Answer',
        text: choice,
      })),
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://quest-dp.com/' },
      { '@type': 'ListItem', position: 2, name: '컴활 커리큘럼', item: 'https://quest-dp.com/curriculum/comhwal/' },
      { '@type': 'ListItem', position: 3, name: planetTitle, item: 'https://quest-dp.com/curriculum/comhwal/' },
      { '@type': 'ListItem', position: 4, name: title, item: canonical },
    ],
  };

  return [learningResource, quizJsonLd, breadcrumbJsonLd];
}

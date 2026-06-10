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
    ? `${planetTitle} ${topicId}번, ${title}. 처음 보는 용어를 길게 붙잡지 않도록 개념 카드 ${cards.length}개와 바로 확인하는 문제로 나눴습니다.`
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
  const teaserQuestion = checkpointQuestions[0];

  return (
    <article className="relative isolate min-h-screen overflow-hidden bg-[#f5f8ef] text-[#162015]">
      <div className="relative z-10 mx-auto max-w-[820px] px-5 pb-16 pt-8 md:px-8 lg:max-w-[960px] lg:px-12">
        <a
          href="/curriculum/comhwal"
          onClick={(event) => handleNavClick(event, '/curriculum/comhwal')}
          className="mb-7 inline-flex items-center gap-2 text-[13px] font-bold text-[#52604d] transition hover:text-[#256d2f]"
        >
          <ArrowLeft size={14} strokeWidth={2.4} />
          컴활 커리큘럼
        </a>

        <nav
          aria-label="breadcrumb"
          className="mb-4 flex flex-wrap items-center gap-1.5 text-[12px] font-semibold text-[#697561]"
        >
          <a
            href="/curriculum/comhwal"
            onClick={(event) => handleNavClick(event, '/curriculum/comhwal')}
            className="transition hover:text-[#256d2f]"
          >
            컴활 필기
          </a>
          <ChevronRight size={12} className="text-[#9aa58f]" />
          <span className="text-[#256d2f]">{planetTitle}</span>
          <ChevronRight size={12} className="text-[#9aa58f]" />
          <span className="text-[#33402f]">{topicId}</span>
        </nav>

        <header className="mb-10 border-b border-[#d8e2ce] pb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#cbd9c1] bg-white px-3 py-1.5 text-[12px] font-bold text-[#256d2f]">
            <Sparkles size={13} strokeWidth={2.4} />
            {planetTitle} {topicId}
          </div>
          <h1 className="kr-heading mb-3 text-[28px] leading-[1.16] md:text-[38px] lg:text-[44px]">
            {title}
          </h1>
          <p className="kr-body max-w-[700px] text-[16px] leading-[1.75] text-[#4c5947]">
            {seoDescription}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Stat label="토픽 번호" value={topicId} />
            <Stat label="개념 카드" value={`${cards.length}개`} />
            <Stat label="문제 티저" value={teaserQuestion ? '1개' : '0개'} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#/game/comhwal"
              onClick={(event) => handleNavClick(event, '#/game/comhwal')}
              className="inline-flex items-center gap-2 rounded-full bg-[#FD802E] px-5 py-3 text-[14px] font-black text-[#162015] transition active:scale-95"
            >
              게임 화면에서 풀어보기
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
            <a
              href="/curriculum/comhwal"
              onClick={(event) => handleNavClick(event, '/curriculum/comhwal')}
              className="inline-flex items-center gap-2 rounded-full border border-[#cbd9c1] px-5 py-3 text-[14px] font-bold text-[#33402f] transition hover:border-[#4d8a45] hover:text-[#256d2f]"
            >
              컴활 전체 범위
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
          </div>
        </header>

        <section className="mb-12 rounded-[10px] border border-[#d8e2ce] bg-white p-5 shadow-[0_18px_60px_-45px_rgba(22,32,21,0.5)] md:p-6">
          <h2 className="kr-heading mb-2 text-[18px] md:text-[22px]">
            먼저 이렇게 읽으면 덜 외워져요
          </h2>
          <p className="kr-body text-[14px] leading-[1.75] text-[#53614f] md:text-[15px]">
            용어를 뜻만 외우면 선지에서 금방 흔들립니다. 먼저 “어떤 화면이나 상황에서 쓰는 말인지”를 잡고,
            바로 아래 문제로 맞게 이해했는지만 확인하세요.
          </p>
        </section>

        <div className="space-y-5">
          {cards.map((card, index) => (
            <ConceptCard key={card.id} card={card} index={index} />
          ))}
        </div>

        {teaserQuestion ? (
          <QuestionTeaser question={teaserQuestion} />
        ) : null}

        <section className="mt-14 rounded-[10px] border border-[#d8e2ce] bg-[#162015] p-6 text-white md:p-8">
          <h2 className="kr-heading mb-2 text-[20px] md:text-[24px]">
            다음 토픽으로 이어가기
          </h2>
          <p className="kr-body mb-5 max-w-[680px] text-[14px] leading-[1.75] text-white/72">
            이 토픽이 잡혔다면 옆 토픽으로 넘어가도 됩니다. 전체 과목 구조와 1급·2급 차이는 커리큘럼에서 한 번에 확인하세요.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/curriculum/comhwal"
              onClick={(event) => handleNavClick(event, '/curriculum/comhwal')}
              className="inline-flex items-center gap-2 rounded-full bg-[#FD802E] px-5 py-3 text-[14px] font-black text-[#162015] transition active:scale-95"
            >
              컴활 전체 범위
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
            <a
              href="/faq/comhwal"
              onClick={(event) => handleNavClick(event, '/faq/comhwal')}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-[14px] font-bold text-white/82 transition hover:border-[#A7E96A]/60 hover:text-[#A7E96A]"
            >
              컴활 FAQ
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
            <a
              href="#/game/comhwal"
              onClick={(event) => handleNavClick(event, '#/game/comhwal')}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-[14px] font-bold text-white/82 transition hover:border-[#A7E96A]/60 hover:text-[#A7E96A]"
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
    <section className="rounded-[10px] border border-[#d8e2ce] bg-white p-5 shadow-[0_12px_45px_-35px_rgba(22,32,21,0.45)] md:p-6">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 text-[12px] font-bold text-[#74806d]">
            카드 {String(index + 1).padStart(2, '0')}
          </div>
          <h2 className="kr-heading text-[18px] leading-[1.35] text-[#162015] md:text-[21px]">
            {card.title}
          </h2>
        </div>
        <CheckCircle2 className="mt-1 shrink-0 text-[#256d2f]" size={20} strokeWidth={2.4} />
      </div>

      <p className="kr-body mb-4 text-[14.5px] leading-[1.78] text-[#3e4a3a] md:text-[15.5px]">
        {card.body}
      </p>

      <ul className="mb-4 grid list-none gap-2 p-0 md:grid-cols-3">
        {card.keyPoints.map((point) => (
          <li
            key={point}
            className="rounded-[8px] border border-[#d8e2ce] bg-[#f7faf3] px-3 py-2 text-[12.5px] leading-[1.55] text-[#53614f]"
          >
            {point}
          </li>
        ))}
      </ul>

      {card.examTip ? (
        <p className="kr-body mb-4 rounded-[8px] border border-[#e0cdbb] bg-[#fff7ed] px-4 py-3 text-[13px] leading-[1.7] text-[#624b35]">
          <strong className="kr-heading mr-1 text-[#256d2f]">시험 포인트</strong>
          {card.examTip}
        </p>
      ) : null}
    </section>
  );
}

function QuestionTeaser({
  question,
}: {
  question: NonNullable<ComhwalConceptCard['question']>;
}) {
  return (
    <section className="mt-10 rounded-[10px] border border-[#d8e2ce] bg-[#162015] p-5 text-white shadow-[0_18px_60px_-45px_rgba(22,32,21,0.5)] md:p-6">
      <h2 className="kr-heading mb-3 inline-flex items-center gap-2 text-[18px] md:text-[22px]">
        <HelpCircle size={18} className="text-[#A7E96A]" strokeWidth={2.4} />
        체크포인트 문제 티저
      </h2>
      <p className="kr-body mb-4 text-[14px] leading-[1.75] text-white/84 md:text-[15px]">
        {question.prompt}
      </p>
      <ol className="m-0 list-none space-y-2 p-0">
        {question.choices.map((choice, choiceIndex) => (
          <li
            key={`${choice}-${choiceIndex}`}
            className="rounded-[10px] border border-white/10 bg-white/[0.025] px-3 py-2 text-[13px] leading-[1.6] text-white/76"
          >
            {choice}
          </li>
        ))}
      </ol>
      <p className="kr-body mt-4 text-[12.5px] leading-[1.7] text-white/62 md:text-[13px]">
        정답과 해설은 공개 토픽 페이지에 넣지 않습니다. 게임 화면에서 직접 풀고 바로 확인하세요.
      </p>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[#d8e2ce] bg-white px-4 py-2.5">
      <div className="mb-0.5 text-[12px] font-bold text-[#687662]">
        {label}
      </div>
      <div className="kr-heading text-[18px] text-[#1d2a1a] md:text-[20px]">{value}</div>
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
    hasPart: questions.slice(0, 1).map((question) => ({
      '@type': 'Question',
      name: question.prompt,
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

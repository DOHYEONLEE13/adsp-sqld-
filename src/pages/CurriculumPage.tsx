import { ArrowLeft, BookOpen, ChevronRight, Layers, Sparkles } from 'lucide-react';
import { getCurriculum, type CurriculumTopic, type SubjectCurriculum } from '@/lib/curriculum';
import { handleNavClick } from '@/lib/navigate';
import { useSeoMeta } from '@/lib/seo';
import type { SeoCurriculumSubject } from '@/types/seo';

interface Props {
  subject: SeoCurriculumSubject;
}

const SUBJECT_ACCENT: Record<SeoCurriculumSubject, string> = {
  adsp: '#67e8f9',
  sqld: '#c084fc',
  comhwal: '#256d2f',
  'comhwal-1': '#256d2f',
  'comhwal-2': '#256d2f',
};

const EXAM_FACTS: Record<
  SeoCurriculumSubject,
  {
    authority: string;
    exam: string;
    questions: string;
    scoring: string;
    scope: string;
    strategy: string;
    officialUrl: string;
  }
> = {
  adsp: {
    authority: 'KDATA 데이터자격검정',
    exam: '데이터분석준전문가(ADsP)',
    questions: '객관식 50문항 · 90분',
    scoring: '총점 60점 이상 · 과목별 40% 미만 과락',
    scope: '데이터 이해 10문항 · 데이터분석 기획 10문항 · 데이터분석 30문항',
    strategy:
      '3과목 데이터분석 비중이 가장 커서 R 기초, 통계, 가설검정, 머신러닝을 반복 루프로 묶는 것이 중요합니다.',
    officialUrl: 'https://www.dataq.or.kr/www/sub/a_06.do',
  },
  sqld: {
    authority: 'KDATA 데이터자격검정',
    exam: 'SQL 개발자(SQLD)',
    questions: '객관식 50문항 · 90분',
    scoring: '총점 60점 이상 · 과목별 40% 미만 과락',
    scope: '데이터 모델링의 이해 10문항 · SQL 기본 및 활용 40문항',
    strategy:
      '2과목 SQL 기본 및 활용 배점이 80점입니다. JOIN, 서브쿼리, 윈도우 함수, 관리 구문을 우선순위로 잡아야 합니다.',
    officialUrl: 'https://www.dataq.or.kr/www/sub/a_04.do',
  },
  comhwal: {
    authority: '대한상공회의소 자격평가사업단',
    exam: '컴퓨터활용능력 필기',
    questions: '1급 60문항 · 60분 / 2급 40문항 · 40분',
    scoring: '필기: 과목당 40점 이상 · 평균 60점 이상',
    scope:
      '1급: 컴퓨터 일반, 스프레드시트 일반, 데이터베이스 일반 / 2급: 컴퓨터 일반, 스프레드시트 일반',
    strategy:
      '컴퓨터 일반은 1급과 2급이 함께 보는 공통 출발점입니다. QuestDP는 실제 카드가 준비된 컴퓨터 일반 001~059부터 개별 토픽 색인을 엽니다.',
    officialUrl: 'https://devm.korcham.net/co/examguide.do%3Fcd%3D01%26jmcd%3D0103',
  },
  'comhwal-1': {
    authority: '대한상공회의소 자격평가사업단',
    exam: '컴퓨터활용능력 1급 필기',
    questions: '객관식 60문항 · 60분',
    scoring: '필기: 과목당 40점 이상 · 평균 60점 이상',
    scope: '컴퓨터 일반 · 스프레드시트 일반 · 데이터베이스 일반',
    strategy:
      '컴활 1급은 데이터베이스 일반까지 포함됩니다. 먼저 컴퓨터 일반 공통 기반을 빠르게 끝내고, 스프레드시트와 데이터베이스는 실기 연결 개념으로 확장하세요.',
    officialUrl: 'https://devm.korcham.net/co/examguide.do%3Fcd%3D01%26jmcd%3D0103',
  },
  'comhwal-2': {
    authority: '대한상공회의소 자격평가사업단',
    exam: '컴퓨터활용능력 2급 필기',
    questions: '객관식 40문항 · 40분',
    scoring: '필기: 과목당 40점 이상 · 평균 60점 이상',
    scope: '컴퓨터 일반 · 스프레드시트 일반',
    strategy:
      '컴활 2급은 데이터베이스 일반이 빠지므로 컴퓨터 일반과 스프레드시트 일반을 촘촘히 회전시키는 전략이 효율적입니다.',
    officialUrl: 'https://devm.korcham.net/co/examguide.do%3Fcd%3D01%26jmcd%3D0103',
  },
};

export default function CurriculumPage({ subject }: Props) {
  const curriculum = getCurriculum(subject);
  const accent = SUBJECT_ACCENT[subject];
  const facts = EXAM_FACTS[subject];
  const isComhwal = subject.startsWith('comhwal');
  const label = curriculum.label;
  const canonical = `https://quest-dp.com/curriculum/${subject}/`;
  const seoTitle = `${label} 학습사이트 · 시험범위 커리큘럼 — QuestDP`;
  const seoDescription =
    `${facts.authority} 기준 ${facts.exam} 시험범위를 ${curriculum.totalChapters}개 과목 · ${curriculum.totalTopics}개 토픽으로 정리했습니다. ` +
    `${curriculum.isExpansion ? '컴활은 실제 카드가 있는 컴퓨터 일반 토픽부터 개별 학습 페이지를 공개합니다.' : `${curriculum.totalSteps}개 학습 스텝과 기출형 복습으로 이어집니다.`}`;
  const introDescription = isComhwal
    ? subject === 'comhwal-1'
      ? '1급은 범위가 넓어서 처음부터 세 과목을 같은 무게로 들고 가면 금방 지칩니다. 공통 과목인 컴퓨터 일반으로 말문을 트고, 스프레드시트와 데이터베이스를 화면 감각에 맞춰 붙이는 순서로 보세요.'
      : subject === 'comhwal-2'
        ? '2급은 데이터베이스가 빠지는 대신 컴퓨터 일반과 스프레드시트에서 실수를 줄이는 싸움입니다. 낯선 용어를 먼저 풀어내고, 엑셀 화면에서 바로 떠올릴 수 있는 단어부터 쌓으면 훨씬 덜 막힙니다.'
        : '컴활은 범위표만 보면 딱딱하지만, 실제로는 “컴퓨터 화면에서 자주 만나는 말”을 차례로 익히는 시험입니다. 1급과 2급의 차이를 먼저 확인하고, 지금 공개된 개념 카드부터 부담 없이 시작하세요.'
    : seoDescription;

  const allItems = curriculum.isExpansion
    ? curriculum.chapters.flatMap((chapter) =>
        chapter.topics
          .filter((topic) => topic.href)
          .map((topic) => ({
            name: `${topic.topic} 개념 카드`,
            url: absoluteUrl(topic.href!),
          })),
      )
    : curriculum.chapters.flatMap((chapter) =>
        chapter.topics.flatMap((topic) =>
          topic.lessons.flatMap((lesson) =>
            lesson.steps.map((step) => ({
              name: step.title,
              url: absoluteUrl(step.href),
            })),
          ),
        ),
      );

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `${label} 시험범위 커리큘럼`,
    description: seoDescription,
    provider: {
      '@type': 'Organization',
      name: 'QuestDP',
      sameAs: 'https://quest-dp.com',
    },
    inLanguage: 'ko-KR',
    educationalLevel: label,
    isAccessibleForFree: true,
    keywords: keywordText(subject),
    about: aboutTerms(subject),
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: `PT${Math.max(20, curriculum.totalSteps * 5)}M`,
    },
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: allItems.slice(0, 100).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: item.url,
      name: item.name,
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://quest-dp.com/' },
      { '@type': 'ListItem', position: 2, name: label, item: canonical },
      { '@type': 'ListItem', position: 3, name: '시험범위', item: canonical },
    ],
  };

  useSeoMeta({
    title: seoTitle,
    description: seoDescription,
    canonical,
    ogType: 'website',
    ogImage: 'https://quest-dp.com/og/default.png',
    jsonLd: [courseJsonLd, itemListJsonLd, breadcrumbJsonLd],
  });

  return (
    <article
      className={
        isComhwal
          ? 'relative isolate min-h-screen overflow-hidden bg-[#f5f8ef] text-[#162015]'
          : 'relative isolate min-h-screen overflow-hidden bg-base text-cream'
      }
    >
      <div className="relative z-10 mx-auto max-w-[900px] px-5 pb-16 pt-8 md:px-8 lg:max-w-[1080px] lg:px-12">
        <a
          href="/"
          onClick={(event) => handleNavClick(event, '/')}
          className={
            isComhwal
              ? 'mb-7 inline-flex items-center gap-2 text-[13px] font-bold text-[#52604d] transition hover:text-[#256d2f]'
              : 'mb-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-cream/65 transition hover:text-neon'
          }
        >
          <ArrowLeft size={14} strokeWidth={2.4} />
          홈으로
        </a>

        <nav
          aria-label="breadcrumb"
          className={
            isComhwal
              ? 'mb-4 flex flex-wrap items-center gap-1.5 text-[12px] font-semibold text-[#697561]'
              : 'mb-3 flex flex-wrap items-center gap-1.5 text-[11px] text-cream/55'
          }
        >
          <span style={{ color: accent }}>{label}</span>
          <ChevronRight size={12} className={isComhwal ? 'text-[#9aa58f]' : 'text-cream/30'} />
          <span className={isComhwal ? 'text-[#33402f]' : 'text-cream/85'}>
            시험범위 · 커리큘럼
          </span>
        </nav>

        <header
          className={
            isComhwal
              ? 'mb-10 border-b border-[#d8e2ce] pb-8'
              : 'mb-10 border-b border-cream/10 pb-8'
          }
        >
          <h1 className="kr-heading mb-3 text-[28px] leading-[1.15] md:text-[40px] lg:text-[48px]">
            {isComhwal ? `${label}, 여기서부터 보면 덜 막혀요` : `${label} 시험범위`}
          </h1>
          <p
            className={
              isComhwal
                ? 'kr-body mb-6 max-w-[760px] text-[16px] leading-[1.75] text-[#4c5947] md:text-[17px]'
                : 'kr-body mb-5 max-w-[720px] text-[15px] leading-[1.65] text-cream/75 md:text-[16px]'
            }
          >
            {introDescription}
          </p>
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <Stat label="과목" value={curriculum.totalChapters} accent={accent} light={isComhwal} />
            <Stat label="토픽" value={curriculum.totalTopics} accent={accent} light={isComhwal} />
            <Stat
              label={curriculum.isExpansion ? '공개 토픽' : '학습 스텝'}
              value={curriculum.isExpansion ? curriculum.availableTopics : curriculum.totalSteps}
              accent={accent}
              light={isComhwal}
            />
          </div>
        </header>

        <section
          className={
            isComhwal
              ? 'mb-12 rounded-[10px] border border-[#d8e2ce] bg-white p-5 shadow-[0_18px_60px_-45px_rgba(22,32,21,0.5)] md:p-6'
              : 'mb-12 rounded-[18px] border border-cream/10 bg-white/[0.03] p-5 md:p-6'
          }
        >
          <div
            className={
              isComhwal
                ? 'mb-2 text-[13px] font-bold text-[#5c6b55]'
                : 'mb-2 text-[10px] uppercase tracking-widest text-cream/50'
            }
          >
            {isComhwal ? '시험장에서 실제로 만나는 구조' : '공식 기준 요약'}
          </div>
          <h2 className="kr-heading mb-4 text-[18px] md:text-[22px]">
            {facts.exam} 시험 구조
          </h2>
          <dl className="grid gap-3 md:grid-cols-2">
            <Fact label="시행기관" value={facts.authority} accent={accent} light={isComhwal} />
            <Fact label="문항 / 시간" value={facts.questions} accent={accent} light={isComhwal} />
            <Fact label="합격 기준" value={facts.scoring} accent={accent} light={isComhwal} />
            <Fact label="시험 범위" value={facts.scope} accent={accent} light={isComhwal} />
          </dl>
          <p
            className={
              isComhwal
                ? 'kr-body mt-4 text-[14px] leading-[1.75] text-[#53614f]'
                : 'kr-body mt-4 text-[13.5px] leading-[1.7] text-cream/72'
            }
          >
            {facts.strategy}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={faqHref(subject)}
              onClick={(event) => handleNavClick(event, faqHref(subject))}
              className={
                isComhwal
                  ? 'inline-flex items-center gap-2 rounded-full border border-[#cbd9c1] px-4 py-2.5 text-[13px] font-bold text-[#33402f] transition hover:border-[#4d8a45] hover:text-[#256d2f]'
                  : 'inline-flex items-center gap-2 rounded-full border border-cream/18 px-4 py-2.5 text-[11px] uppercase tracking-widest text-cream/72 transition hover:border-neon/40 hover:text-neon'
              }
            >
              FAQ 보기
              <ChevronRight size={13} strokeWidth={2.5} />
            </a>
            <a
              href={facts.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={
                isComhwal
                  ? 'inline-flex items-center gap-2 rounded-full border border-[#cbd9c1] px-4 py-2.5 text-[13px] font-bold text-[#33402f] transition hover:border-[#4d8a45] hover:text-[#256d2f]'
                  : 'inline-flex items-center gap-2 rounded-full border border-cream/18 px-4 py-2.5 text-[11px] uppercase tracking-widest text-cream/72 transition hover:border-neon/40 hover:text-neon'
              }
            >
              공식 안내
              <ChevronRight size={13} strokeWidth={2.5} />
            </a>
          </div>
        </section>

        <div className="space-y-12">
          {curriculum.chapters.map((chapter) => (
            <ChapterSection
              key={`${subject}-${chapter.chapter}`}
              chapter={chapter}
              accent={accent}
              isExpansion={curriculum.isExpansion}
              light={isComhwal}
            />
          ))}
        </div>

        <section
          className={
            isComhwal
              ? 'mt-14 rounded-[10px] border border-[#d8e2ce] bg-[#162015] p-6 text-white md:p-8'
              : 'mt-14 rounded-[20px] p-6 md:p-8'
          }
          style={
            isComhwal
              ? undefined
              : {
                  background: `linear-gradient(135deg, ${accent}1a 0%, var(--neon-08) 100%)`,
                  border: `1px solid ${accent}40`,
                }
          }
        >
          <h2 className="kr-heading mb-2 inline-flex items-center gap-2 text-[18px] md:text-[20px]">
            <Sparkles size={18} style={{ color: accent }} />
            로드맵에서 바로 학습하기
          </h2>
          <p className="kr-body mb-5 text-[13px] leading-[1.65] text-white/75 md:text-[14px]">
            {isComhwal
              ? '커리큘럼을 훑었다면 이제 실제 카드로 넘어가세요. 한 번에 많이 외우기보다, 낯선 단어를 보고 바로 한 문제로 확인하는 흐름이 훨씬 오래 갑니다.'
              : 'QuestDP의 우주 탐험 화면에서 커리큘럼을 게임처럼 따라가며 개념 카드, 즉시 문제풀이, 약점 복습을 한 흐름으로 이어갈 수 있습니다.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={gameHref(subject)}
              onClick={(event) => handleNavClick(event, gameHref(subject))}
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[12px] uppercase tracking-widest text-[#010828] transition active:scale-95 md:text-[13px]"
              style={{
                background: '#FD802E',
                boxShadow: '0 8px 22px -6px rgba(253,128,46,0.55)',
              }}
            >
              QuestDP 게임 섹션으로
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
            {alternateLinks(subject).map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => handleNavClick(event, link.href)}
                className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-5 py-3 text-[12px] uppercase tracking-widest transition hover:border-neon/40 hover:text-neon md:text-[13px]"
              >
                {link.label}
                <ChevronRight size={14} strokeWidth={2.6} />
              </a>
            ))}
          </div>
        </section>

        <div className="mt-12 border-t border-cream/10 pt-6 text-center">
          <p className={isComhwal ? 'kr-body mb-3 text-[12px] text-[#697561]' : 'kr-body mb-3 text-[12px] text-cream/50'}>
            {isComhwal
              ? 'QuestDP — 처음 보는 자격증 용어를 짧은 카드와 문제로 익히는 학습 앱'
              : 'QuestDP — ADsP·SQLD·컴활 자격증을 우주 탐험 RPG로 재구성'}
          </p>
          <a
            href="/about"
            onClick={(event) => handleNavClick(event, '/about')}
            className={
              isComhwal
                ? 'text-[12px] font-bold text-[#52604d] transition hover:text-[#256d2f]'
                : 'text-[11px] uppercase tracking-widest text-cream/65 transition hover:text-neon'
            }
          >
            QuestDP 소개 →
          </a>
        </div>
      </div>
    </article>
  );
}

function Stat({
  label,
  value,
  accent,
  light = false,
}: {
  label: string;
  value: number;
  accent: string;
  light?: boolean;
}) {
  return (
    <div
      className={light ? 'rounded-[8px] border px-4 py-2.5' : 'rounded-[12px] border px-4 py-2.5'}
      style={{
        borderColor: light ? '#d8e2ce' : `${accent}40`,
        borderLeftColor: light ? accent : `${accent}40`,
        borderLeftWidth: light ? 3 : 1,
        background: light ? '#ffffff' : 'rgba(255,255,255,0.03)',
      }}
    >
      <div
        className={
          light
            ? 'mb-0.5 text-[12px] font-bold text-[#687662]'
            : 'mb-0.5 text-[10px] uppercase tracking-widest text-cream/55'
        }
      >
        {label}
      </div>
      <div
        className={
          light
            ? 'kr-heading text-[20px] text-[#1d2a1a] md:text-[22px]'
            : 'kr-heading text-[20px] md:text-[22px]'
        }
        style={light ? undefined : { color: accent }}
      >
        {value}
      </div>
    </div>
  );
}

function Fact({
  label,
  value,
  accent,
  light = false,
}: {
  label: string;
  value: string;
  accent: string;
  light?: boolean;
}) {
  return (
    <div
      className={
        light
          ? 'rounded-[8px] border border-[#e1e8d8] bg-[#f7faf3] px-4 py-3'
          : 'rounded-[12px] border border-cream/8 bg-white/[0.025] px-4 py-3'
      }
      style={light ? { borderLeft: `3px solid ${accent}` } : undefined}
    >
      <dt
        className={
          light
            ? 'mb-1 text-[12px] font-bold text-[#66745f]'
            : 'mb-1 text-[10px] uppercase tracking-widest text-cream/45'
        }
      >
        {label}
      </dt>
      <dd
        className={
          light
            ? 'kr-body m-0 text-[14px] font-semibold leading-[1.65] text-[#1f2a1d]'
            : 'kr-body m-0 text-[13.5px] leading-[1.55] text-cream/84'
        }
      >
        {light ? value : <span style={{ color: accent }}>{value}</span>}
      </dd>
    </div>
  );
}

function ChapterSection({
  chapter,
  accent,
  isExpansion,
  light = false,
}: {
  chapter: SubjectCurriculum['chapters'][number];
  accent: string;
  isExpansion: boolean;
  light?: boolean;
}) {
  return (
    <section>
      <header className="mb-5">
        <div
          className={
            light
              ? 'mb-1 text-[13px] font-bold text-[#67735f]'
              : 'mb-1 text-[10px] uppercase tracking-widest text-cream/50'
          }
        >
          {light ? `${chapter.chapter}과목` : `Subject ${chapter.chapter}`}
        </div>
        <h2 className="kr-heading mb-1.5 text-[22px] leading-[1.25] md:text-[28px]">
          {chapter.title}
        </h2>
        {chapter.subtitle ? (
          <p className={light ? 'kr-body mb-2 text-[13px] text-[#67735f]' : 'kr-body mb-2 text-[13px] text-cream/58'}>{chapter.subtitle}</p>
        ) : null}
        <div className={light ? 'inline-flex items-center gap-3 text-[12px] font-semibold text-[#67735f]' : 'inline-flex items-center gap-3 text-[11px] text-cream/55'}>
          <span className="inline-flex items-center gap-1">
            <BookOpen size={11} strokeWidth={2.4} />
            토픽 {chapter.totalTopics}개
          </span>
          <span className="inline-flex items-center gap-1">
            <Layers size={11} strokeWidth={2.4} />
            {isExpansion ? `공개 ${chapter.availableTopics}개` : `학습 스텝 ${chapter.totalSteps}개`}
          </span>
        </div>
      </header>

      <div className="space-y-4">
        {chapter.topics.map((topic) => (
          <TopicGroup
            key={`${chapter.chapter}-${topic.topicId ?? topic.topic}`}
            topic={topic}
            accent={accent}
            isExpansion={isExpansion}
            light={light}
          />
        ))}
      </div>
    </section>
  );
}

function TopicGroup({
  topic,
  accent,
  isExpansion,
  light = false,
}: {
  topic: CurriculumTopic;
  accent: string;
  isExpansion: boolean;
  light?: boolean;
}) {
  if (isExpansion) {
    return <ExpansionTopic topic={topic} accent={accent} light={light} />;
  }

  if (topic.lessons.length === 0) {
    return (
      <div className={light ? 'rounded-[8px] border border-[#dbe5d2] bg-white p-4 md:p-5' : 'rounded-[14px] border border-cream/10 bg-white/[0.02] p-4 md:p-5'}>
        <h3 className="kr-heading mb-1 text-[15px] md:text-[16px]" style={{ color: accent }}>
          {topic.topic}
        </h3>
        <p className="kr-body text-[12.5px] text-cream/55">학습 콘텐츠 준비 중</p>
      </div>
    );
  }

  const totalSteps = topic.lessons.reduce((sum, lesson) => sum + lesson.steps.length, 0);

  return (
    <div className="rounded-[14px] border border-cream/10 bg-white/[0.02] p-4 md:p-5">
      <header className="mb-3">
        <h3 className="kr-heading mb-0.5 text-[15px] md:text-[17px]" style={{ color: accent }}>
          {topic.topic}
        </h3>
        <div className="text-[10px] uppercase tracking-widest text-cream/50">
          Step {totalSteps}개
        </div>
      </header>

      <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 md:grid-cols-2">
        {topic.lessons.flatMap((lesson) =>
          lesson.steps.map((step) => (
            <li key={step.id}>
              <a
                href={step.href}
                onClick={(event) => handleNavClick(event, step.href)}
                className="block rounded-[10px] border border-cream/8 px-3 py-2.5 transition hover:border-neon/40 hover:bg-white/[0.04]"
              >
                <div className="flex items-baseline gap-2">
                  <span className="shrink-0 tabular-nums text-[10px]" style={{ color: accent }}>
                    {String(step.indexInChapter + 1).padStart(2, '0')}
                  </span>
                  <span className="kr-body text-[13px] leading-[1.4] text-cream/85 md:text-[13.5px]">
                    {step.title}
                  </span>
                </div>
              </a>
            </li>
          )),
        )}
      </ul>
    </div>
  );
}

function ExpansionTopic({
  topic,
  accent,
  light = false,
}: {
  topic: CurriculumTopic;
  accent: string;
  light?: boolean;
}) {
  const previewSteps = topic.lessons.flatMap((lesson) => lesson.steps).slice(0, 3);

  return (
    <div
      className={
        light
          ? 'rounded-[8px] border border-[#dbe5d2] bg-white p-4 shadow-[0_10px_35px_-30px_rgba(22,32,21,0.45)] md:p-5'
          : 'rounded-[14px] border border-cream/10 bg-white/[0.02] p-4 md:p-5'
      }
    >
      <header className="mb-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className={light ? 'mb-1 text-[12px] font-bold text-[#74806d]' : 'mb-1 text-[10px] uppercase tracking-widest text-cream/45'}>
            {topic.topicId} · {topic.sectionTitle}
          </div>
          <h3 className="kr-heading text-[15px] md:text-[17px]" style={{ color: accent }}>
            {topic.topic}
          </h3>
        </div>
        <span
          className={light ? 'w-fit rounded-full border px-3 py-1 text-[12px] font-bold' : 'w-fit rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest'}
          style={{ borderColor: `${accent}55`, color: topic.available ? accent : 'rgba(239,244,255,0.52)' }}
        >
          {topic.available ? `카드 ${topic.totalCards}개` : '로드맵 수록'}
        </span>
      </header>

      {topic.available && topic.href ? (
        <>
          <ul className="mb-4 m-0 list-none space-y-1.5 p-0">
            {previewSteps.map((step) => (
              <li
                key={step.id}
                className={
                  light
                    ? 'kr-body text-[13px] leading-[1.6] text-[#53614f]'
                    : 'kr-body text-[12.5px] leading-[1.55] text-cream/68'
                }
              >
                {step.title}
              </li>
            ))}
          </ul>
          <a
            href={topic.href}
            onClick={(event) => handleNavClick(event, topic.href!)}
            className={
              light
                ? 'inline-flex items-center gap-2 rounded-full border border-[#cbd9c1] px-4 py-2.5 text-[13px] font-bold text-[#33402f] transition hover:border-[#4d8a45] hover:text-[#256d2f]'
                : 'inline-flex items-center gap-2 rounded-full border border-cream/18 px-4 py-2.5 text-[11px] uppercase tracking-widest text-cream/74 transition hover:border-neon/40 hover:text-neon'
            }
          >
            개념 카드 보기
            <ChevronRight size={13} strokeWidth={2.5} />
          </a>
        </>
      ) : (
        <p
          className={
            light
              ? 'kr-body text-[13px] leading-[1.6] text-[#66745f]'
              : 'kr-body text-[12.5px] leading-[1.6] text-cream/55'
          }
        >
          전체 범위에는 들어가지만, 아직 얇은 미리보기 페이지로 열지 않았습니다. 실제 카드가 준비된 토픽부터 연결합니다.
        </p>
      )}
    </div>
  );
}

function absoluteUrl(href: string): string {
  if (href.startsWith('http')) return href;
  const clean = href.endsWith('/') ? href : `${href}/`;
  return `https://quest-dp.com${clean}`;
}

function faqHref(subject: SeoCurriculumSubject): string {
  return subject.startsWith('comhwal') ? '/faq/comhwal' : `/faq/${subject}`;
}

function gameHref(subject: SeoCurriculumSubject): string {
  return subject.startsWith('comhwal') ? '#/game/comhwal' : `#/game/${subject}`;
}

function alternateLinks(subject: SeoCurriculumSubject): Array<{ href: string; label: string }> {
  if (subject === 'comhwal') {
    return [
      { href: '/curriculum/comhwal-1', label: '컴활 1급 범위' },
      { href: '/curriculum/comhwal-2', label: '컴활 2급 범위' },
    ];
  }
  if (subject === 'comhwal-1' || subject === 'comhwal-2') {
    return [
      { href: '/curriculum/comhwal', label: '컴활 전체 범위' },
      { href: subject === 'comhwal-1' ? '/curriculum/comhwal-2' : '/curriculum/comhwal-1', label: subject === 'comhwal-1' ? '컴활 2급 범위' : '컴활 1급 범위' },
    ];
  }
  return [
    { href: subject === 'adsp' ? '/curriculum/sqld' : '/curriculum/adsp', label: subject === 'adsp' ? 'SQLD 범위' : 'ADsP 범위' },
    { href: '/curriculum/comhwal', label: '컴활 범위' },
  ];
}

function keywordText(subject: SeoCurriculumSubject): string {
  if (subject === 'adsp') {
    return 'ADsP 학습사이트, ADSP 학습사이트, ADsP 시험범위, ADsP 기출문제, 데이터분석준전문가';
  }
  if (subject === 'sqld') {
    return 'SQLD 학습사이트, SQLD 시험범위, SQL 개발자, SQLD 기출문제, 데이터 모델링, SQL 기본';
  }
  return '컴활 학습사이트, 컴퓨터활용능력 필기, 컴활 1급 필기, 컴활 2급 필기, 컴활 컴퓨터 일반, 대한상공회의소 컴활';
}

function aboutTerms(subject: SeoCurriculumSubject): string[] {
  if (subject === 'adsp') {
    return ['ADsP', '데이터분석준전문가', '데이터 이해', '분석 기획', '데이터 분석'];
  }
  if (subject === 'sqld') {
    return ['SQLD', 'SQL 개발자', '데이터 모델링', 'SQL 기본', 'SQL 활용'];
  }
  return ['컴퓨터활용능력', '컴활 필기', '컴퓨터 일반', '스프레드시트 일반', '데이터베이스 일반'];
}

import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Gauge,
  Image as ImageIcon,
  Route,
  Sparkles,
} from 'lucide-react';
import { useSeoMeta } from '@/lib/seo';
import { handleNavClick } from '@/lib/navigate';

const CANONICAL = 'https://quest-dp.com/study-method/';
const OG_IMAGE = 'https://quest-dp.com/og/questdp-method.png';

const METHOD_STEPS = [
  {
    title: '개념을 작게 자른다',
    body: 'ADsP·SQLD·컴활 시험범위를 토픽과 카드 단위로 나누고 한 번에 한 가지 판단만 익힙니다.',
    icon: Route,
    color: '#67e8f9',
  },
  {
    title: '바로 한 문제를 푼다',
    body: '설명을 오래 읽기보다 방금 본 개념을 즉시 객관식 문제로 확인해 기억을 행동으로 바꿉니다.',
    icon: CheckCircle2,
    color: '#D1F843',
  },
  {
    title: '약점 점수를 계산한다',
    body: '오답 확률, 풀이 시간 초과, 최근 풀이 기록을 함께 보며 오늘 다시 만나야 할 토픽을 고릅니다.',
    icon: Gauge,
    color: '#FD802E',
  },
  {
    title: '망각곡선 전에 다시 꺼낸다',
    body: 'Leitner 방식의 복습 큐가 어제의 오답과 애매한 개념을 망각곡선이 가팔라지기 전에 다음 미션으로 되돌립니다.',
    icon: Clock3,
    color: '#c084fc',
  },
] as const;

const SUBJECT_ROWS = [
  {
    subject: 'ADsP',
    focus: '데이터 이해, 분석 기획, 통계·머신러닝',
    structure: '3개 과목 · 175개 개념 스텝',
    useCase: '처음 보는 용어를 짧게 익히고 바로 기출형 판단으로 확인',
  },
  {
    subject: 'SQLD',
    focus: '데이터 모델링, SQL 기본·활용·관리 구문',
    structure: '2개 과목 · 50개 개념 스텝',
    useCase: 'JOIN, 서브쿼리, 정규화처럼 헷갈리는 단위를 반복 풀이',
  },
  {
    subject: '컴활',
    focus: '컴퓨터 일반, 스프레드시트 일반, 데이터베이스 일반',
    structure: '1급 3과목 · 2급 2과목 · 152개 토픽 카드',
    useCase: '컴퓨터 노베이스가 낯선 용어를 장면과 확인 문제로 연결',
  },
] as const;

const FAQS = [
  {
    q: 'QuestDP는 일반 ADsP·SQLD·컴활 학습사이트와 무엇이 다른가요?',
    a: '긴 요약을 읽고 끝내는 방식이 아니라, 개념 스텝과 문제 풀이를 붙여 둔 게임형 학습사이트입니다. 사용자는 로드맵을 따라가며 개념을 보고, 바로 문제를 풀고, 약점 복습으로 다시 돌아옵니다.',
  },
  {
    q: '게임형이어도 시험 대비에 충분한가요?',
    a: '게임 요소는 보상을 위한 장식이 아니라 학습 순서를 유지하기 위한 장치입니다. 커리큘럼은 ADsP·SQLD·컴활 시험범위를 기준으로 나뉘고, 문제 풀이와 해설은 실제 시험 판단을 연습하는 데 초점을 둡니다.',
  },
  {
    q: '약점은 어떻게 고르나요?',
    a: '단순히 틀린 문제만 보지 않습니다. 오답 가능성, 제한 시간 대비 풀이 지연, 최근에 다시 본 기록을 함께 계산해 오늘 복습할 토픽을 정합니다.',
  },
  {
    q: '왜 설명을 읽고 바로 문제를 풀게 하나요?',
    a: '자격증 공부에서는 “아는 것 같다”와 “선지를 고를 수 있다”가 다릅니다. QuestDP는 개념을 본 직후 작은 문제로 확인해 기억을 더 빨리 고정시키는 쪽으로 설계됐습니다.',
  },
] as const;

const FEATURE_IMAGES = [
  {
    title: '과목 선택 화면',
    src: '/seo/features/questdp-course-selection.jpg',
    alt: 'QuestDP 메인 게임 화면에서 ADsP, SQLD, 빅데이터분석기사 학습 카드를 선택하는 화면',
    caption: '처음에는 ADsP와 SQLD 중 원하는 자격증 카드를 골라 학습 은하로 진입합니다.',
    width: 1246,
    height: 913,
  },
  {
    title: 'SQLD 학습 로드맵',
    src: '/seo/features/questdp-sqld-learning-roadmap.jpg',
    alt: 'QuestDP 학습 탭에서 SQLD SQL 기본 및 활용 챕터의 개념 스텝을 따라가는 화면',
    caption: '학습 탭은 챕터와 개념 스텝을 순서대로 보여주고, 바로 문제 풀이로 이어집니다.',
    width: 450,
    height: 917,
  },
  {
    title: '오늘의 퀘스트',
    src: '/seo/features/questdp-daily-quests.jpg',
    alt: 'QuestDP 퀘스트 탭에서 오늘의 복습, 풀이량, 정확도 미션을 확인하는 화면',
    caption: '퀘스트 탭은 오늘 복습할 문제와 일일 미션을 모아 짧은 학습 목표로 바꿉니다.',
    width: 463,
    height: 918,
  },
  {
    title: '나의 약점',
    src: '/seo/features/questdp-weakness-analysis.jpg',
    alt: 'QuestDP 나의 약점 탭에서 ADsP 약점 단원과 정답률, 미응시 문항을 확인하는 화면',
    caption: '약점 탭은 학습 결과를 바탕으로 다시 볼 단원을 한곳에 모아 보여줍니다.',
    width: 448,
    height: 918,
  },
  {
    title: '친구 비교',
    src: '/seo/features/questdp-friends-ranking.jpg',
    alt: 'QuestDP 친구 탭에서 친구 태그를 추가하고 XP 리더보드를 비교하는 화면',
    caption: '친구 탭은 태그로 친구를 추가하고 XP와 연속 학습을 함께 비교하게 합니다.',
    width: 448,
    height: 913,
  },
  {
    title: '개념 레슨 화면',
    src: '/seo/features/questdp-sqld-lesson-having.jpg',
    alt: 'QuestDP SQLD 레슨 화면에서 HAVING 개념을 마스코트와 함께 학습하는 화면',
    caption: '레슨 화면은 짧은 개념 설명과 진행률을 보여주고 바로 확인 문제로 이어집니다.',
    width: 448,
    height: 914,
  },
  {
    title: '챕터 모의고사',
    src: '/seo/features/questdp-chapter-mock-exams.jpg',
    alt: 'QuestDP 학습 탭에서 SQLD 챕터 모의고사 1, 2, 3, FINAL을 선택하는 화면',
    caption: '챕터 모의고사는 실제 시험처럼 풀고 제출 후 틀린 문제를 다시 연습하게 합니다.',
    width: 1251,
    height: 914,
  },
  {
    title: '학습 대시보드',
    src: '/seo/features/questdp-study-dashboard.jpg',
    alt: 'QuestDP 프로필과 통계 탭에서 마스코트, 태그, 북마크 문제와 학습 정보를 확인하는 화면',
    caption: '통계와 프로필 화면은 내 캐릭터, 태그, 북마크, 누적 학습 상태를 한 화면에 모읍니다.',
    width: 462,
    height: 912,
  },
  {
    title: '요금제 화면',
    src: '/seo/features/questdp-pricing-plans.jpg',
    alt: 'QuestDP 요금제 페이지에서 무료, Pro, Max 플랜을 비교하는 화면',
    caption: '요금제 화면은 무료 플랜과 집중 학습용 유료 플랜의 차이를 명확히 비교합니다.',
    width: 443,
    height: 915,
  },
] as const;

export default function StudyMethodPage() {
  const seoDescription =
    'QuestDP가 ADsP·SQLD·컴활을 게임형 학습사이트로 설계한 방식. 개념 스텝, 즉시 문제풀이, 약점 점수, 망각곡선 기반 Leitner 복습 큐로 시험범위를 학습하는 원리를 정리했습니다.';
  const featureImageObjects = FEATURE_IMAGES.map((image) => ({
    '@type': 'ImageObject',
    name: image.title,
    url: `https://quest-dp.com${image.src}`,
    contentUrl: `https://quest-dp.com${image.src}`,
    caption: image.caption,
    description: image.alt,
    width: image.width,
    height: image.height,
    inLanguage: 'ko-KR',
  }));

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'QuestDP 학습 원리',
    description: seoDescription,
    inLanguage: 'ko-KR',
    image: [OG_IMAGE, ...FEATURE_IMAGES.map((image) => `https://quest-dp.com${image.src}`)],
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: OG_IMAGE,
      contentUrl: OG_IMAGE,
      width: 1200,
      height: 630,
      caption: 'QuestDP 대표 이미지',
    },
    associatedMedia: featureImageObjects,
    datePublished: '2026-05-21',
    dateModified: '2026-06-04',
    author: { '@type': 'Organization', name: 'QuestDP', url: 'https://quest-dp.com' },
    publisher: {
      '@type': 'Organization',
      name: 'QuestDP',
      logo: { '@type': 'ImageObject', url: 'https://quest-dp.com/logo/questdp-mark.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': CANONICAL },
    about: ['ADsP 학습사이트', 'SQLD 학습사이트', '컴활 학습사이트', 'ADsP·SQLD·컴활 게임형 학습사이트', '게임형 학습', '약점 복습', '망각곡선 복습', 'Leitner SRS'],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://quest-dp.com/' },
      { '@type': 'ListItem', position: 2, name: '학습 원리', item: CANONICAL },
    ],
  };

  useSeoMeta({
    title: 'QuestDP 학습 원리 — ADsP·SQLD·컴활 게임형 학습사이트 설계',
    description: seoDescription,
    canonical: CANONICAL,
    ogType: 'article',
    ogImage: OG_IMAGE,
    jsonLd: [articleJsonLd, faqJsonLd, breadcrumbJsonLd],
  });

  return (
    <article className="relative isolate min-h-screen overflow-hidden bg-base text-cream">
      <div aria-hidden className="absolute inset-0 opacity-70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(103,232,249,0.16),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(192,132,252,0.14),transparent_34%),linear-gradient(180deg,rgba(1,8,40,0.35),#010828_70%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cream/25 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1080px] px-5 pb-16 pt-8 md:px-8 lg:px-12">
        <a
          href="/"
          onClick={(e) => handleNavClick(e, '/')}
          className="mb-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-cream/65 transition hover:text-[#D1F843]"
        >
          <ArrowLeft size={14} strokeWidth={2.4} />
          홈으로
        </a>

        <header className="mb-12 border-b border-cream/10 pb-9">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D1F843]/30 bg-[#D1F843]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#D1F843]">
            <Brain size={13} strokeWidth={2.4} />
            Study Method
          </div>
          <h1 className="kr-heading mb-4 max-w-[860px] text-[32px] leading-[1.12] md:text-[48px] lg:text-[58px]">
            ADsP·SQLD·컴활을 게임처럼 풀어도 시험 공부가 되도록 만든 원리
          </h1>
          <p className="kr-body max-w-[720px] text-[15px] leading-[1.75] text-cream/76 md:text-[17px]">
            QuestDP는 단순히 문제에 점수를 붙인 앱이 아닙니다. 시험범위를 작게 자르고,
            방금 본 개념을 바로 문제로 확인하고, 약점 점수와 망각곡선 복습으로 다시 등장하도록 만든
            ADsP·SQLD·컴활 게임형 학습사이트입니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#/game/comhwal"
              onClick={(e) => handleNavClick(e, '#/game/comhwal')}
              className="inline-flex items-center gap-2 rounded-full bg-[#FD802E] px-5 py-3 text-[12px] font-semibold uppercase tracking-widest text-[#010828] transition active:scale-95"
            >
              컴활 게임 섹션으로
              <ChevronRight size={14} strokeWidth={2.5} />
            </a>
            <a
              href="/topics/comhwal/computer-general/001"
              onClick={(e) => handleNavClick(e, '/topics/comhwal/computer-general/001')}
              className="inline-flex items-center gap-2 rounded-full border border-lime-300/30 px-5 py-3 text-[12px] font-semibold uppercase tracking-widest text-lime-200 transition hover:bg-lime-300/10"
            >
              컴퓨터 일반 001
              <ChevronRight size={14} strokeWidth={2.5} />
            </a>
            <a
              href="/topics/comhwal/spreadsheet-general/060"
              onClick={(e) => handleNavClick(e, '/topics/comhwal/spreadsheet-general/060')}
              className="inline-flex items-center gap-2 rounded-full border border-lime-300/30 px-5 py-3 text-[12px] font-semibold uppercase tracking-widest text-lime-200 transition hover:bg-lime-300/10"
            >
              스프레드시트 060
              <ChevronRight size={14} strokeWidth={2.5} />
            </a>
          </div>
        </header>

        <section aria-labelledby="method-loop" className="mb-14">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="kr-num mb-2 text-[11px] uppercase tracking-widest text-cream/50">
                Core Loop
              </p>
              <h2 id="method-loop" className="kr-heading text-[24px] md:text-[30px]">
                읽는 공부를 푸는 공부로 바꾸는 4단계
              </h2>
            </div>
            <a
              href="#/game"
              onClick={(e) => handleNavClick(e, '#/game')}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[#FD802E] px-5 py-3 text-[12px] font-semibold uppercase tracking-widest text-[#010828] transition active:scale-95"
            >
              지금 학습하기
              <ChevronRight size={14} strokeWidth={2.5} />
            </a>
          </div>

          <ol className="grid list-none gap-4 p-0 md:grid-cols-2">
            {METHOD_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className="rounded-[16px] border border-cream/10 bg-white/[0.035] p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border"
                      style={{
                        color: step.color,
                        borderColor: `${step.color}66`,
                        background: `${step.color}14`,
                      }}
                    >
                      <Icon size={20} strokeWidth={2.3} />
                    </span>
                    <span className="kr-num text-[12px] text-cream/45">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="kr-heading mb-2 text-[17px] text-cream">{step.title}</h3>
                  <p className="kr-body text-[13.5px] leading-[1.7] text-cream/70">
                    {step.body}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="subject-fit" className="mb-14">
          <p className="kr-num mb-2 text-[11px] uppercase tracking-widest text-cream/50">
            ADsP · SQLD · 컴활
          </p>
          <h2 id="subject-fit" className="kr-heading mb-4 text-[24px] md:text-[30px]">
            두 시험은 같은 방식으로 보지 않습니다
          </h2>
          <div className="overflow-hidden rounded-[18px] border border-cream/10 bg-white/[0.03]">
            <div className="grid grid-cols-[0.7fr_1fr_1fr] border-b border-cream/10 bg-white/[0.04] px-4 py-3 text-[12px] font-semibold text-cream/72 md:grid-cols-[0.55fr_1fr_1fr_1.2fr]">
              <span>과목</span>
              <span>핵심 범위</span>
              <span>구조</span>
              <span className="hidden md:block">QuestDP에서 쓰는 방식</span>
            </div>
            {SUBJECT_ROWS.map((row) => (
              <div
                key={row.subject}
                className="grid grid-cols-[0.7fr_1fr_1fr] gap-3 border-b border-cream/8 px-4 py-4 text-[13px] leading-[1.65] text-cream/76 last:border-b-0 md:grid-cols-[0.55fr_1fr_1fr_1.2fr]"
              >
                <strong className="kr-heading text-cream">{row.subject}</strong>
                <span>{row.focus}</span>
                <span>{row.structure}</span>
                <span className="hidden md:block">{row.useCase}</span>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="feature-images" className="mb-14">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-[#D1F843]">
                <ImageIcon size={17} strokeWidth={2.4} />
                <span className="kr-num text-[11px] uppercase tracking-widest">
                  Visual Search
                </span>
              </div>
              <h2 id="feature-images" className="kr-heading text-[24px] md:text-[30px]">
                화면만 봐도 이해되는 QuestDP 기능
              </h2>
            </div>
            <p className="kr-body max-w-[430px] text-[13.5px] leading-[1.75] text-cream/62">
              Google AI 검색과 네이버 AI 브리핑이 기능을 더 잘 이해할 수 있도록 주요 탭을
              이미지, 대체 텍스트, 캡션으로 함께 설명합니다.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {FEATURE_IMAGES.map((image, index) => (
              <figure key={image.src} className={index === 0 ? 'md:col-span-2' : undefined}>
                <div className="overflow-hidden rounded-[18px] border border-cream/10 bg-white/[0.035]">
                  <img
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="block h-auto w-full"
                  />
                </div>
                <figcaption className="kr-body mt-3 text-[13px] leading-[1.65] text-cream/68">
                  <strong className="kr-heading mr-2 text-cream">{image.title}</strong>
                  {image.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="weakness-score"
          className="mb-14 rounded-[20px] border border-[#D1F843]/20 bg-[#D1F843]/[0.055] p-6 md:p-8"
        >
          <div className="mb-4 inline-flex items-center gap-2 text-[#D1F843]">
            <Sparkles size={18} strokeWidth={2.4} />
            <span className="kr-num text-[11px] uppercase tracking-widest">Weakness Logic</span>
          </div>
          <h2 id="weakness-score" className="kr-heading mb-3 text-[23px] md:text-[30px]">
            약점은 “틀림” 하나로 결정하지 않습니다
          </h2>
          <p className="kr-body max-w-[760px] text-[14.5px] leading-[1.8] text-cream/78 md:text-[16px]">
            같은 정답이라도 오래 걸린 문제는 시험장에서 다시 흔들릴 수 있습니다. QuestDP는
            오답 가능성, 풀이 시간 초과, 최근 복습 여부를 함께 보고 약점 노드를 만듭니다.
            그래서 ADsP 게임·SQLD 게임·컴활 게임 화면에서 오늘 다시 풀어야 할 부분이 자연스럽게
            앞으로 올라옵니다.
          </p>
        </section>

        <section aria-labelledby="faq" className="mb-14">
          <h2 id="faq" className="kr-heading mb-5 text-[24px] md:text-[30px]">
            자주 묻는 질문
          </h2>
          <div className="space-y-3">
            {FAQS.map((item) => (
              <section
                key={item.q}
                className="rounded-[14px] border border-cream/10 bg-white/[0.025] p-5"
              >
                <h3 className="kr-heading mb-2 text-[15px] text-cream">Q. {item.q}</h3>
                <p className="kr-body text-[13.5px] leading-[1.75] text-cream/72">{item.a}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-cream/10 bg-white/[0.03] p-6 md:p-8">
          <h2 className="kr-heading mb-2 text-[20px] md:text-[24px]">
            전체 커리큘럼을 먼저 보고 싶다면
          </h2>
          <p className="kr-body mb-5 max-w-[680px] text-[14px] leading-[1.75] text-cream/70">
            시험범위 전체를 확인한 뒤 시작하면 어디까지 공부했는지 더 잘 보입니다.
            ADsP와 SQLD, 컴활 커리큘럼 페이지에서 챕터, 토픽, 학습 스텝을 한 번에 볼 수 있습니다.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/curriculum/adsp"
              onClick={(e) => handleNavClick(e, '/curriculum/adsp')}
              className="rounded-full border border-cyan-300/35 px-5 py-3 text-[12px] font-semibold uppercase tracking-widest text-cyan-200 transition hover:bg-cyan-300/10"
            >
              ADsP 커리큘럼
            </a>
            <a
              href="/curriculum/sqld"
              onClick={(e) => handleNavClick(e, '/curriculum/sqld')}
              className="rounded-full border border-purple-300/35 px-5 py-3 text-[12px] font-semibold uppercase tracking-widest text-purple-200 transition hover:bg-purple-300/10"
            >
              SQLD 커리큘럼
            </a>
            <a
              href="/curriculum/comhwal"
              onClick={(e) => handleNavClick(e, '/curriculum/comhwal')}
              className="rounded-full border border-lime-300/35 px-5 py-3 text-[12px] font-semibold uppercase tracking-widest text-lime-200 transition hover:bg-lime-300/10"
            >
              컴활 커리큘럼
            </a>
            <a
              href="/faq/comhwal"
              onClick={(e) => handleNavClick(e, '/faq/comhwal')}
              className="rounded-full border border-lime-300/35 px-5 py-3 text-[12px] font-semibold uppercase tracking-widest text-lime-200 transition hover:bg-lime-300/10"
            >
              컴활 FAQ
            </a>
          </div>
        </section>
      </div>
    </article>
  );
}

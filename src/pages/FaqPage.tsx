import { ArrowLeft, ChevronRight, HelpCircle, Sparkles } from 'lucide-react';
import { ALL_FAQ } from '@/data/seo/faq';
import { handleNavClick } from '@/lib/navigate';
import { useSeoMeta } from '@/lib/seo';
import type { SeoFaqSubject } from '@/types/seo';

interface Props {
  subject: SeoFaqSubject;
}

const SUBJECT_LABEL: Record<SeoFaqSubject, string> = {
  adsp: 'ADsP 데이터분석준전문가',
  sqld: 'SQLD SQL 개발자',
  comhwal: '컴활 필기',
};

const SUBJECT_ACCENT: Record<SeoFaqSubject, string> = {
  adsp: '#67e8f9',
  sqld: '#c084fc',
  comhwal: '#256d2f',
};

export default function FaqPage({ subject }: Props) {
  const data = ALL_FAQ[subject];
  const accent = SUBJECT_ACCENT[subject];
  const label = SUBJECT_LABEL[subject];
  const canonical = `https://quest-dp.com/faq/${subject}/`;
  const isComhwal = subject === 'comhwal';

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.groups.flatMap((group) =>
      group.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    ),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://quest-dp.com/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: label,
        item: `https://quest-dp.com/${curriculumHref(subject).slice(1)}/`,
      },
      { '@type': 'ListItem', position: 3, name: '자주 묻는 질문', item: canonical },
    ],
  };

  useSeoMeta({
    title: data.metaTitle,
    description: data.metaDescription,
    canonical,
    ogType: 'article',
    ogImage: 'https://quest-dp.com/og/default.png',
    jsonLd: [faqJsonLd, breadcrumbJsonLd],
  });

  return (
    <article
      className={
        isComhwal
          ? 'relative isolate min-h-screen overflow-hidden bg-[#f5f8ef] text-[#162015]'
          : 'relative isolate min-h-screen overflow-hidden bg-base text-cream'
      }
    >
      <div className="relative z-10 mx-auto max-w-[820px] px-5 pb-16 pt-8 md:px-8 lg:max-w-[920px] lg:px-12">
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
          <span className={isComhwal ? 'text-[#33402f]' : 'text-cream/85'}>자주 묻는 질문</span>
        </nav>

        <header className={isComhwal ? 'mb-10 border-b border-[#d8e2ce] pb-8' : 'mb-10 border-b border-cream/10 pb-8'}>
          <h1 className="kr-heading mb-3 text-[28px] leading-[1.2] md:text-[36px] lg:text-[42px]">
            {isComhwal ? '컴활, 처음 시작할 때 진짜 궁금한 것들' : data.title}
          </h1>
          <p
            className={
              isComhwal
                ? 'kr-body max-w-[720px] text-[16px] leading-[1.75] text-[#4c5947]'
                : 'kr-body max-w-[700px] text-[14.5px] leading-[1.65] text-cream/75 md:text-[15.5px]'
            }
          >
            {isComhwal
              ? '1급과 2급 중 뭘 고를지, 필기는 몇 문제인지, 노베이스가 어디서 막히는지처럼 시작 전에 자주 걸리는 질문만 모았습니다.'
              : data.metaDescription}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={gameHref(subject)}
              onClick={(event) => handleNavClick(event, gameHref(subject))}
              className={
                isComhwal
                  ? 'inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-black text-[#162015] transition active:scale-95'
                  : 'inline-flex items-center gap-2 rounded-full px-5 py-3 text-[12px] uppercase tracking-widest text-[#010828] transition active:scale-95 md:text-[13px]'
              }
              style={{
                background: '#FD802E',
                boxShadow: '0 8px 22px -6px rgba(253,128,46,0.55)',
              }}
            >
              QuestDP 게임 섹션으로
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
            <a
              href={curriculumHref(subject)}
              onClick={(event) => handleNavClick(event, curriculumHref(subject))}
              className={
                isComhwal
                  ? 'inline-flex items-center gap-2 rounded-full border border-[#cbd9c1] px-5 py-3 text-[14px] font-bold text-[#33402f] transition hover:border-[#4d8a45] hover:text-[#256d2f]'
                  : 'inline-flex items-center gap-2 rounded-full border border-cream/20 px-5 py-3 text-[12px] uppercase tracking-widest text-cream/76 transition hover:border-neon/40 hover:text-neon md:text-[13px]'
              }
            >
              커리큘럼 보기
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
          </div>
        </header>

        <div className="space-y-12">
          {data.groups.map((group) => (
            <section key={group.heading}>
              <h2
                className="kr-heading mb-5 inline-flex items-center gap-2 text-[18px] md:text-[22px]"
                style={{ color: accent }}
              >
                <HelpCircle size={18} strokeWidth={2.4} />
                {group.heading}
              </h2>
              <ul className="m-0 list-none space-y-4 p-0">
                {group.items.map((item) => (
                  <li
                key={item.q}
                    className={
                      isComhwal
                        ? 'rounded-[8px] border border-[#d8e2ce] bg-white p-5 shadow-[0_12px_45px_-35px_rgba(22,32,21,0.45)] md:p-6'
                        : 'rounded-[14px] border border-cream/10 bg-white/[0.02] p-5 md:p-6'
                    }
                  >
                    <h3 className={isComhwal ? 'kr-heading mb-2.5 text-[15.5px] leading-[1.45] text-[#162015] md:text-[17px]' : 'kr-heading mb-2.5 text-[15px] leading-[1.4] text-cream/95 md:text-[16.5px]'}>
                      Q. {item.q}
                    </h3>
                    <p className={isComhwal ? 'kr-body whitespace-pre-line text-[14px] leading-[1.75] text-[#4c5947] md:text-[15px]' : 'kr-body whitespace-pre-line text-[13.5px] leading-[1.7] text-cream/80 md:text-[14.5px]'}>
                      {item.a}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section
          className={isComhwal ? 'mt-14 rounded-[10px] border border-[#d8e2ce] bg-[#162015] p-6 text-white md:p-8' : 'mt-14 rounded-[20px] p-6 md:p-8'}
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
            바로 학습 시작하기
          </h2>
          <p className="kr-body mb-5 text-[13px] leading-[1.65] text-white/75 md:text-[14px]">
            {isComhwal
              ? '대충 감이 잡혔다면 바로 첫 카드로 넘어가도 됩니다. 모르는 말을 오래 붙잡기보다, 보고 바로 풀어보는 쪽이 덜 지칩니다.'
              : '질문으로 큰 그림을 잡았다면, 커리큘럼에서 시험범위를 토픽 단위로 확인하고 실제 학습 화면으로 이어가세요.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={curriculumHref(subject)}
              onClick={(event) => handleNavClick(event, curriculumHref(subject))}
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[12px] uppercase tracking-widest text-[#010828] transition active:scale-95 md:text-[13px]"
              style={{
                background: '#FD802E',
                boxShadow: '0 8px 22px -6px rgba(253,128,46,0.55)',
              }}
            >
              {label.split(' ')[0]} 커리큘럼 보기
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
            {alternateFaqLinks(subject).map((link) => (
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
            <a
              href="/glossary"
              onClick={(event) => handleNavClick(event, '/glossary')}
              className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-5 py-3 text-[12px] uppercase tracking-widest transition hover:border-neon/40 hover:text-neon md:text-[13px]"
            >
              용어 사전
              <ChevronRight size={14} strokeWidth={2.6} />
            </a>
          </div>
        </section>

        <div className={isComhwal ? 'mt-12 border-t border-[#d8e2ce] pt-6 text-center' : 'mt-12 border-t border-cream/10 pt-6 text-center'}>
          <p className={isComhwal ? 'kr-body mb-3 text-[12px] text-[#697561]' : 'kr-body mb-3 text-[12px] text-cream/50'}>
            {isComhwal
              ? 'QuestDP — 처음 보는 자격증 용어를 짧은 카드와 문제로 익히는 학습 앱'
              : 'QuestDP — ADsP·SQLD·컴활 자격증을 우주 탐험 RPG로 재구성'}
          </p>
          <a
            href="/about"
            onClick={(event) => handleNavClick(event, '/about')}
            className={isComhwal ? 'text-[12px] font-bold text-[#52604d] transition hover:text-[#256d2f]' : 'text-[11px] uppercase tracking-widest text-cream/65 transition hover:text-neon'}
          >
            QuestDP 소개 →
          </a>
        </div>
      </div>
    </article>
  );
}

function curriculumHref(subject: SeoFaqSubject): string {
  return subject === 'comhwal' ? '/curriculum/comhwal' : `/curriculum/${subject}`;
}

function gameHref(subject: SeoFaqSubject): string {
  return subject === 'comhwal' ? '#/game/comhwal' : `#/game/${subject}`;
}

function alternateFaqLinks(subject: SeoFaqSubject): Array<{ href: string; label: string }> {
  return (['adsp', 'sqld', 'comhwal'] as const)
    .filter((item) => item !== subject)
    .map((item) => ({
      href: `/faq/${item}`,
      label: `${SUBJECT_LABEL[item].split(' ')[0]} FAQ`,
    }));
}

import { ArrowLeft, CalendarDays, ChevronRight } from 'lucide-react';
import {
  getExamScheduleHub,
  hasPublishedExamSchedule,
  type ExamSubject,
} from '@/data/seo/examSchedule';
import { handleNavClick } from '@/lib/navigate';
import { useSeoMeta } from '@/lib/seo';

interface Props {
  subject: ExamSubject;
}

const SUBJECT_LINKS: Record<ExamSubject, string> = {
  adsp: '/curriculum/adsp',
  sqld: '/curriculum/sqld',
  comhwal: '/curriculum/comhwal',
};

export default function ExamSchedulePage({ subject }: Props) {
  const hub = getExamScheduleHub(subject);
  const isPublished = hasPublishedExamSchedule(hub);
  const canonical = `https://quest-dp.com/exams/${subject}/`;

  useSeoMeta({
    title: `${hub.label} 시험 회차 허브 — QuestDP`,
    description: hub.description,
    canonical,
    ogType: 'website',
    noIndex: !isPublished,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${hub.label} 시험 회차 허브`,
        description: hub.description,
        url: canonical,
        inLanguage: 'ko-KR',
        isAccessibleForFree: true,
        about: hub.examName,
      },
    ],
  });

  return (
    <article className="relative isolate min-h-screen overflow-hidden bg-[#f5f8ef] text-[#162015]">
      <div className="relative z-10 mx-auto max-w-[920px] px-5 pb-16 pt-8 md:px-8">
        <a
          href="/"
          onClick={(event) => handleNavClick(event, '/')}
          className="mb-7 inline-flex items-center gap-2 text-[13px] font-bold text-[#52604d] transition hover:text-[#256d2f]"
        >
          <ArrowLeft size={14} strokeWidth={2.4} />
          홈으로
        </a>

        <header className="mb-10 border-b border-[#d8e2ce] pb-8">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-[#256d2f]">
            Exam Hub
          </p>
          <h1 className="kr-heading mb-3 text-[28px] leading-[1.15] md:text-[42px]">
            {hub.label} 시험 회차 허브
          </h1>
          <p className="kr-body max-w-[760px] text-[16px] leading-[1.75] text-[#4c5947]">
            {hub.description} 일정과 접수기간은 변동될 수 있으므로, 공개 전에는 공식 사이트 확인 링크만 제공합니다.
          </p>
        </header>

        <section className="mb-8 rounded-[10px] border border-[#d8e2ce] bg-white p-5 shadow-[0_18px_60px_-45px_rgba(22,32,21,0.5)] md:p-6">
          <h2 className="kr-heading mb-4 inline-flex items-center gap-2 text-[18px] md:text-[22px]">
            <CalendarDays size={18} />
            회차 데이터 상태
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#d8e2ce] text-[12px] text-[#66745f]">
                  <th className="py-2 pr-4">회차</th>
                  <th className="py-2 pr-4">접수 기간</th>
                  <th className="py-2 pr-4">시험일</th>
                  <th className="py-2 pr-4">발표일</th>
                  <th className="py-2">메모</th>
                </tr>
              </thead>
              <tbody>
                {hub.rounds.map((round, index) => (
                  <tr key={`${hub.subject}-${index}`} className="border-b border-[#edf2e8]">
                    <td className="py-3 pr-4 font-bold text-[#1f2a1d]">{round.round}</td>
                    <td className="py-3 pr-4 text-[#53614f]">{round.registrationPeriod}</td>
                    <td className="py-3 pr-4 text-[#53614f]">{round.examDate}</td>
                    <td className="py-3 pr-4 text-[#53614f]">{round.resultDate}</td>
                    <td className="py-3 text-[#697561]">{round.note ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isPublished ? (
            <p className="kr-body mt-4 rounded-[8px] border border-[#e1e8d8] bg-[#f7faf3] px-4 py-3 text-[13px] leading-[1.7] text-[#53614f]">
              현재 이 페이지는 일정 데이터가 TODO 상태라 검색엔진에 제출하지 않습니다. 공식 일정 확인 후 모든 필드가 채워지면 sitemap 제출 대상으로 전환됩니다.
            </p>
          ) : null}
        </section>

        <section className="rounded-[10px] border border-[#d8e2ce] bg-white p-5 md:p-6">
          <h2 className="kr-heading mb-3 text-[18px]">공식 확인 링크</h2>
          <p className="kr-body mb-5 text-[14px] leading-[1.7] text-[#53614f]">
            기준 기관은 {hub.sourceLabel}입니다. 일정, 접수 기간, 발표일, 응시료는 공식 사이트에서 확인한 뒤 운영자가 입력합니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={hub.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#cbd9c1] px-4 py-2.5 text-[13px] font-bold text-[#33402f] transition hover:border-[#4d8a45] hover:text-[#256d2f]"
            >
              공식 사이트 확인
              <ChevronRight size={13} strokeWidth={2.5} />
            </a>
            <a
              href={SUBJECT_LINKS[subject]}
              onClick={(event) => handleNavClick(event, SUBJECT_LINKS[subject])}
              className="inline-flex items-center gap-2 rounded-full border border-[#cbd9c1] px-4 py-2.5 text-[13px] font-bold text-[#33402f] transition hover:border-[#4d8a45] hover:text-[#256d2f]"
            >
              커리큘럼 보기
              <ChevronRight size={13} strokeWidth={2.5} />
            </a>
          </div>
        </section>
      </div>
    </article>
  );
}

/**
 * LegalPage — 법적 페이지·소개 페이지 공통 렌더러.
 *
 * `slug` 로 어느 문서를 보여줄지 선택. 본문은 `src/data/legal.ts` 에서 가져옴.
 * 라우팅 — `#/about`, `#/privacy`, `#/terms`, `#/refund`.
 */

import { ArrowLeft } from 'lucide-react';
import { LEGAL_DOCS, type LegalDoc } from '@/data/legal';
import VideoBg from '@/components/ui/VideoBg';
import { VIDEO_URLS } from '@/data/site';
import { useSeoMeta } from '@/lib/seo';
import { handleNavClick } from '@/lib/navigate';

interface Props {
  slug: LegalDoc['slug'];
  onBack?: () => void;
}

const SEO_META: Record<
  LegalDoc['slug'],
  { title: string; description: string }
> = {
  about: {
    title: 'QuestDP 소개 — ADSP·SQLD·컴활 자격증 학습 RPG | QuestDP',
    description:
      '한국 ADsP·SQLD·컴활 자격증을 우주 탐험 RPG 로 재구성한 학습 SaaS. 토리·셀리 마스코트와 마이크로러닝, AI 약점 분석으로 게임처럼 합격.',
  },
  privacy: {
    title: '개인정보 처리방침 | QuestDP',
    description:
      'QuestDP 가 수집·이용·보관하는 개인정보 항목과 처리 절차. 이용자 권리 및 행사 방법, 보유 기간, 파기 절차 안내.',
  },
  terms: {
    title: '이용약관 | QuestDP',
    description:
      'QuestDP 서비스 이용 시 회원과 회사의 권리·의무 및 책임 사항. 결제·환불·계정 정책 포함.',
  },
  refund: {
    title: '환불 정책 | QuestDP',
    description:
      '전자상거래법 기준 QuestDP 의 환불 정책. 청약철회 가능 기간, 환불 신청 방법, 자동 결제 해지 절차 안내.',
  },
};

export default function LegalPage({ slug, onBack }: Props) {
  const doc = LEGAL_DOCS[slug];
  const meta = SEO_META[slug];
  useSeoMeta({
    title: meta.title,
    description: meta.description,
    canonical: `https://quest-dp.com/${slug}/`,
    ogImage: 'https://quest-dp.com/og/default.png',
    ogType: 'website',
  });
  return (
    <section className="relative min-h-screen isolate overflow-hidden bg-base text-cream">
      {/* 배경 — 게임 페이지와 같은 ambient 영상 + 어두운 오버레이 */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <VideoBg src={VIDEO_URLS.pageAmbient} fit="cover" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(1,8,40,0.78) 0%, rgba(1,8,40,0.92) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-[760px] mx-auto px-5 md:px-8 lg:px-10 pt-8 pb-16">
        <button
          type="button"
          onClick={() => {
            if (onBack) onBack();
            else {
              // path-based legal → home (/) 으로 이동
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
          }}
          aria-label="홈으로"
          className="inline-flex items-center gap-2 kr-heading uppercase text-[11px] tracking-widest text-cream/75 transition hover:text-[#D1F843] mb-8"
        >
          <ArrowLeft size={14} strokeWidth={2.4} />
          홈으로
        </button>

        <header className="mb-10 md:mb-12 pb-6 border-b border-cream/15">
          <div className="kr-heading uppercase text-[10px] tracking-widest text-[#D1F843]/85 mb-3">
            QuestDP · {slug.toUpperCase()}
          </div>
          <h1 className="kr-heading text-[32px] md:text-[44px] leading-[1.1] mb-4">
            {doc.title}
          </h1>
          {doc.subtitle ? (
            <p className="kr-body text-[14px] md:text-[15px] text-cream/70 leading-[1.65]">
              {doc.subtitle}
            </p>
          ) : null}
          <p className="kr-body text-[11px] text-cream/50 mt-3 uppercase tracking-widest">
            최종 개정 · {doc.updatedAt}
          </p>
        </header>

        <article className="space-y-9 md:space-y-11">
          {doc.sections.map((section, i) => (
            <section key={i}>
              <h2 className="kr-heading text-[18px] md:text-[20px] mb-3 text-cream">
                {section.heading}
              </h2>
              <div className="space-y-3">
                {section.body.map((p, j) => (
                  <p
                    key={j}
                    className="kr-body text-[13.5px] md:text-[14px] leading-[1.75] text-cream/85"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </article>

        {/* 다른 문서로 이동 */}
        <nav
          aria-label="다른 정책 문서"
          className="mt-14 pt-8 border-t border-cream/15"
        >
          <div className="kr-heading uppercase text-[10px] tracking-widest text-cream/55 mb-3">
            관련 문서
          </div>
          <ul className="flex flex-wrap gap-2">
            {(Object.keys(LEGAL_DOCS) as LegalDoc['slug'][])
              .filter((s) => s !== slug)
              .map((s) => (
                <li key={s}>
                  <a
                    href={`/${s}`}
                    onClick={(e) => handleNavClick(e, `/${s}`)}
                    className="kr-heading uppercase text-[11px] tracking-widest px-4 py-2 rounded-full border border-cream/25 hover:bg-cream/10 transition inline-block"
                  >
                    {LEGAL_DOCS[s].title}
                  </a>
                </li>
              ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

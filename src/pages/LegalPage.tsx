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

interface Props {
  slug: LegalDoc['slug'];
  onBack?: () => void;
}

export default function LegalPage({ slug, onBack }: Props) {
  const doc = LEGAL_DOCS[slug];
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
            else window.location.hash = '';
          }}
          aria-label="홈으로"
          className="inline-flex items-center gap-2 kr-heading uppercase text-[11px] tracking-widest text-cream/75 hover:text-neon transition mb-8"
        >
          <ArrowLeft size={14} strokeWidth={2.4} />
          홈으로
        </button>

        <header className="mb-10 md:mb-12 pb-6 border-b border-cream/15">
          <div className="kr-heading uppercase text-[10px] tracking-widest text-neon/85 mb-3">
            QuestDP · {slug.toUpperCase()}
          </div>
          <h1 className="kr-heading text-[32px] md:text-[44px] leading-[1.1] mb-4">
            {doc.title}
          </h1>
          <p className="kr-body text-[14px] md:text-[15px] text-cream/70 leading-[1.65]">
            {doc.subtitle}
          </p>
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
                    href={`#/${s}`}
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

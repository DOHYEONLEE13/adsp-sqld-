import { ChevronRight, Gamepad2, Mail } from 'lucide-react';
import VideoBg from '@/components/ui/VideoBg';
import { CTA as CTA_CONTENT } from '@/data/site';
import { SOCIAL_LINKS } from '@/data/nav';

const ICONS = { email: Mail } as const;

/**
 * CTA 섹션 — 두 가지 레이아웃.
 *
 * 모바일/sm  : 영상은 hero-style cover 배경, 콘텐츠는 [세로 stack] 으로 깨끗하게.
 * md+        : 기존 디자인 유지 — 영상 native 비율 + 우측 헤딩 + 좌하단 카드 overlay.
 */
export default function CTA() {
  return (
    <section
      id="join"
      className="relative overflow-hidden bg-base text-cream"
    >
      {/* ===================================================================== */}
      {/* MOBILE / SM — stack layout                                             */}
      {/* ===================================================================== */}
      <div className="md:hidden relative isolate">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <VideoBg src={CTA_CONTENT.videoUrl} fit="cover" />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(1,8,40,0.55) 0%, rgba(1,8,40,0.85) 100%)',
            }}
          />
        </div>

        <div className="relative z-[2] px-6 py-16 flex flex-col gap-8">
          {/* 헤딩 */}
          <div className="relative text-left">
            <h2 className="kr-heading uppercase leading-[1.1] text-[24px]">
              <span className="block mb-3">{CTA_CONTENT.joinLine}</span>
              {CTA_CONTENT.restLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </div>

          {/* CTA 버튼 */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="#/game"
              className="kr-heading inline-flex items-center gap-2 uppercase tracking-widest text-[12px] px-5 py-3 rounded-full transition hover:scale-[1.03]"
              style={{
                background: '#FD802E',
                color: '#0a0f1f',
                boxShadow: '0 14px 40px -10px rgba(253,128,46,0.55)',
              }}
            >
              <Gamepad2 size={16} strokeWidth={2.4} />
              지금 플레이
              <ChevronRight size={16} strokeWidth={2.6} />
            </a>
            <a
              href="#/about"
              className="liquid-glass kr-heading inline-flex items-center gap-1.5 uppercase tracking-widest text-[11px] px-4 py-3 rounded-full hover:bg-white/10 transition text-cream"
            >
              소개 보기
            </a>
          </div>

          {/* 트러스트 카드 */}
          <TrustCard />

          {/* Social */}
          <SocialBar />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MD+ — 기존 native overlay 디자인                                       */}
      {/* ===================================================================== */}
      <div className="hidden md:block relative">
        <VideoBg src={CTA_CONTENT.videoUrl} fit="native" />

        <div
          aria-hidden
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(1,8,40,0.62) 0%, rgba(1,8,40,0.22) 50%, rgba(1,8,40,0.5) 100%)',
          }}
        />

        {/* 우측 헤딩 + CTA 버튼 */}
        <div className="absolute inset-0 z-[2] flex items-center justify-end px-6 lg:pl-[15%] lg:pr-[20%] py-8 pointer-events-none">
          <div className="relative text-right pointer-events-auto max-w-[640px]">
            <h2 className="kr-heading uppercase leading-[1.05] text-[32px] md:text-[44px] lg:text-[60px]">
              <span className="block mb-4 md:mb-8 lg:mb-12">
                {CTA_CONTENT.joinLine}
              </span>
              {CTA_CONTENT.restLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h2>

            <div className="mt-8 lg:mt-12 flex flex-wrap items-center justify-end gap-3">
              <a
                href="#/game"
                className="kr-heading inline-flex items-center gap-2 uppercase tracking-widest text-[12px] lg:text-[13px] px-6 lg:px-7 py-3.5 lg:py-4 rounded-full transition hover:scale-[1.03]"
                style={{
                  background: '#FD802E',
                  color: '#0a0f1f',
                  boxShadow: '0 14px 40px -10px rgba(253,128,46,0.55)',
                }}
              >
                <Gamepad2 size={16} strokeWidth={2.4} />
                지금 플레이
                <ChevronRight size={16} strokeWidth={2.6} />
              </a>
              <a
                href="#/about"
                className="liquid-glass kr-heading inline-flex items-center gap-1.5 uppercase tracking-widest text-[11px] lg:text-[12px] px-5 py-3.5 rounded-full hover:bg-white/10 transition text-cream"
              >
                소개 보기
              </a>
            </div>
          </div>
        </div>

        {/* 좌하단: 트러스트 카드 + social */}
        <div className="absolute left-[6%] lg:left-[8%] bottom-[6%] lg:bottom-[10%] z-[3] flex flex-col gap-3 lg:gap-4 w-[300px] lg:w-[380px]">
          <TrustCard />
          <SocialBar />
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// 공유 컴포넌트
// ============================================================================

function TrustCard() {
  return (
    <div
      className="rounded-[16px] md:rounded-[20px] p-4 md:p-5 lg:p-6 text-cream"
      style={{
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
        border: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(18px) saturate(140%)',
        WebkitBackdropFilter: 'blur(18px) saturate(140%)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
      }}
    >
      <div className="kr-heading uppercase text-[10px] tracking-widest text-neon mb-2">
        ADSP · SQLD
      </div>
      <p className="kr-body text-[13px] leading-[1.55] mb-3 text-cream">
        518문항 · 50 step 마이크로 러닝 · 실시간 친구 리더보드. 무료 회원도 모든
        콘텐츠를 볼 수 있어요.
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-2 kr-body text-[11px] text-cream/70">
        <a
          href="#/about"
          className="hover:text-neon transition uppercase tracking-widest"
        >
          소개
        </a>
        <a
          href="#/privacy"
          className="hover:text-neon transition uppercase tracking-widest"
        >
          개인정보
        </a>
        <a
          href="#/terms"
          className="hover:text-neon transition uppercase tracking-widest"
        >
          이용약관
        </a>
        <a
          href="#/refund"
          className="hover:text-neon transition uppercase tracking-widest"
        >
          환불정책
        </a>
      </div>
    </div>
  );
}

function SocialBar() {
  return (
    <div
      className="rounded-[16px] md:rounded-[20px] overflow-hidden flex"
      style={{
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
        border: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(18px) saturate(140%)',
        WebkitBackdropFilter: 'blur(18px) saturate(140%)',
      }}
    >
      {SOCIAL_LINKS.map((link, i) => {
        const Icon = ICONS[link.platform];
        const isLast = i === SOCIAL_LINKS.length - 1;
        return (
          <a
            key={link.platform}
            href={link.href}
            aria-label={link.label}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center py-3 md:py-3.5 transition hover:bg-white/10 text-cream ${!isLast ? 'border-r border-white/10' : ''}`}
          >
            <Icon className="w-5 h-5" strokeWidth={2} />
          </a>
        );
      })}
    </div>
  );
}

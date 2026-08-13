import { ChevronRight, Gamepad2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import SocialIcons from '@/components/ui/SocialIcons';
import VideoBg from '@/components/ui/VideoBg';
import { HERO } from '@/data/site';
import { openPlayEntry } from '@/lib/playEntry';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen rounded-b-[32px] overflow-hidden isolate"
    >
      {/*
        poster 미지정 — 영상 로드 동안 검은 배경 (Hero 의 dark gradient overlay 가
        자연스럽게 흡수). OG 이미지를 poster 로 쓰니 영상 시작 직전 1~2 프레임
        깜빡임 발생 (사용자 보고 2026-05-07) → poster 제거. preload="metadata"
        는 그대로 유지해 첫 프레임까지 LTE 1~3s 단축 효과는 보존.
      */}
      <VideoBg src={HERO.videoUrl} loading="immediate" preload="metadata" />

      {/* dark gradient for legibility */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(1,8,40,0.15) 0%, rgba(1,8,40,0.55) 100%)',
        }}
      />

      <div className="relative z-[2] min-h-screen flex flex-col pt-7 pb-16 max-w-layout mx-auto px-6 md:px-12">
        <Header />

        {/* Desktop social stack */}
        <div className="hidden lg:flex absolute top-[120px] right-12 flex-col gap-3 z-[3]">
          <SocialIcons orientation="vertical" />
        </div>

        <div className="flex-1 flex items-end lg:items-center pt-20 relative">
          <div className="relative max-w-[780px] lg:ml-32 lg:translate-y-28 xl:translate-y-32 2xl:translate-y-36">
            <h1 className="kr-heading uppercase leading-[1.05] sm:leading-[1] text-[40px] sm:text-[60px] md:text-[75px] lg:text-[90px]">
              {HERO.headingLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>

            {/* 메인 CTA — 랜딩에서 곧장 플레이로. */}
            <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-3 md:gap-4">
              <a
                href="#/game"
                onClick={(event) => {
                  event.preventDefault();
                  openPlayEntry();
                }}
                className="kr-heading inline-flex items-center gap-2.5 uppercase tracking-widest text-[13px] md:text-[14px] px-7 md:px-8 py-4 md:py-5 rounded-full transition hover:scale-[1.03]"
                style={{
                  background: '#FD802E',
                  color: '#233D4C',
                  boxShadow: '0 14px 40px -10px rgba(253, 128, 46, 0.55)',
                }}
              >
                <Gamepad2 size={18} strokeWidth={2.4} />
                지금 플레이
                <ChevronRight size={18} strokeWidth={2.6} />
              </a>
              <a
                href="#modes"
                className="liquid-glass kr-heading inline-flex items-center gap-2 uppercase tracking-widest text-[12px] md:text-[13px] px-6 py-4 rounded-full hover:bg-white/10 transition"
              >
                모드 둘러보기
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

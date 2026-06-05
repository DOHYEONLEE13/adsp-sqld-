/**
 * 게임 화면 공통 쉘.
 * 상단에 eyebrow/title/subtitle 과 뒤로가기 버튼을 배치합니다.
 */

import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  eyebrow: string;
  title: string;
  subtitle?: string;
  onExit?: () => void;
  /** 뒤로가기 버튼 라벨. 없으면 기본값 "뒤로". */
  exitLabel?: string;
  /**
   * 화면 최상단에 깔리는 장식용 배경 이미지/GIF URL.
   * 지정 시 isolate + radial overlay 를 적용해 가독성을 유지합니다.
   */
  backgroundImage?: string;
  /** true 면 section 자체 bg-base 를 제거 — 외부에서 ambient 비디오 깔 때 사용. */
  transparentBg?: boolean;
  /** ambient 배경을 section 내부에 마운트하고 싶을 때. */
  ambient?: ReactNode;
  /** 헤더 우상단 영역 (예: PlanTag) — title 과 같은 줄에 absolute 위치. */
  topRight?: ReactNode;
  compact?: boolean;
  children: ReactNode;
}

export default function ScreenShell({
  eyebrow,
  title,
  subtitle,
  onExit,
  exitLabel = '뒤로',
  backgroundImage,
  transparentBg,
  ambient,
  topRight,
  compact,
  children,
}: Props) {
  return (
    <section
      className={`relative min-h-screen text-cream isolate overflow-hidden ${
        transparentBg || ambient ? '' : 'bg-base'
      }`}
    >
      {ambient ?? null}
      {backgroundImage ? (
        <>
          <img
            src={backgroundImage}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-40 -z-10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background: 'var(--game-screen-image-overlay)',
            }}
          />
        </>
      ) : null}
      {/*
        Mobile top padding pt-[72px]:
          MobileTopBar 가 fixed top-0 z-30 (높이 56px) 으로 깔리는 페이지가 다수 — header (돌아가기 버튼)
          가 가려지는 것 방지. 56 + 16 breathing = 72. desktop (md+) 은 MobileTopBar 미사용 (md:hidden)
          이라 기존 py-14/16 유지.
      */}
      <div
        className={
          compact
            ? 'relative mx-auto w-full px-5 pt-6 pb-8'
            : 'relative mx-auto w-full max-w-[1240px] xl:max-w-[1320px] px-6 md:px-10 lg:px-14 xl:px-20 pt-[72px] pb-10 md:py-14 lg:py-16'
        }
      >
        <header className={`${compact ? 'mb-7' : 'mb-10 md:mb-14'} relative`}>
          {/* topRight — PlanTag 등 우상단 floating 요소 */}
          {topRight ? (
            <div className="absolute top-0 right-0 z-10">{topRight}</div>
          ) : null}

          {onExit ? (
            <button
              type="button"
              onClick={onExit}
              className={`game-back-button kr-heading inline-flex items-center gap-2 text-[12px] uppercase tracking-widest transition ${
                compact ? 'mb-5' : 'mb-6'
              }`}
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
              {exitLabel}
            </button>
          ) : null}

          <span className="game-section-eyebrow kr-heading uppercase tracking-widest text-[11px] md:text-[12px] block leading-none">
            {eyebrow}
          </span>
          <h1
            className={
              compact
                ? 'kr-heading uppercase leading-[1.05] text-[30px] mt-3'
                : 'kr-heading uppercase leading-[1.05] text-[32px] md:text-[48px] lg:text-[60px] xl:text-[68px] mt-3'
            }
          >
            {title}
          </h1>
          {subtitle ? (
            <p
              className={
                compact
                  ? 'kr-body text-[13px] leading-[1.65] text-cream/70 mt-3'
                  : 'kr-body text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] leading-[1.7] text-cream/70 mt-4 max-w-2xl lg:max-w-3xl'
              }
            >
              {subtitle}
            </p>
          ) : null}
        </header>

        {children}
      </div>
    </section>
  );
}

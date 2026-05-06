import { useEffect } from 'react';
import TextureOverlay from '@/components/layout/TextureOverlay';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import GameModes from '@/components/sections/GameModes';
import Pricing from '@/components/sections/Pricing';
import CTA from '@/components/sections/CTA';
import { useSeoMeta } from '@/lib/seo';

/**
 * 마운트/해시 변경 시 hash anchor (#pricing 등) 가 있으면 해당 섹션으로 스크롤.
 *
 * 이슈: AdRewardModal·EnergyBlockModal·LessonScreen 의 "프리미엄 보기" 가
 * `window.location.href = '/#pricing'` 으로 이동시키면, 다른 라우트 (#/game/adsp 등)
 * 에서 navigation 으로 Landing 이 mount 되는 시점엔 브라우저 native anchor scroll
 * 이 이미 실패한 상태. mount 직후 + hashchange 두 곳에서 명시적으로 scrollIntoView.
 */
function useScrollToHashAnchor() {
  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace(/^#/, '');
      if (!id || id.startsWith('/')) return; // SPA route 는 무시
      // 다음 frame 에 — Landing 의 lazy 섹션이 layout 안정화될 시간 확보.
      window.requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };
    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);
}

export default function Landing() {
  useSeoMeta({
    title: 'QuestDP — ADSP·SQLD 자격증, 게임으로 놀면서 합격',
    description:
      'ADsP·SQLD 자격증을 게임처럼 학습하는 마이크로러닝 SaaS. 토리·셀리와 함께 챕터를 정복하고 AI 약점 분석으로 단기 합격. 월 9,900원.',
    canonical: 'https://quest-dp.com/',
    ogImage: 'https://quest-dp.com/og/default.png',
    ogType: 'website',
  });

  useScrollToHashAnchor();

  return (
    <>
      <TextureOverlay />
      <Hero />
      <About />
      <GameModes />
      <Pricing />
      <CTA />
      <Footer />
    </>
  );
}

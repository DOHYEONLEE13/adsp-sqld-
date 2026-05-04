import TextureOverlay from '@/components/layout/TextureOverlay';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import GameModes from '@/components/sections/GameModes';
import Pricing from '@/components/sections/Pricing';
import CTA from '@/components/sections/CTA';
import { useSeoMeta } from '@/lib/seo';

export default function Landing() {
  useSeoMeta({
    title: 'QuestDP — ADSP·SQLD 자격증, 게임으로 놀면서 합격',
    description:
      'ADsP·SQLD 자격증을 게임처럼 학습하는 마이크로러닝 SaaS. 토리·셀리와 함께 챕터를 정복하고 AI 약점 분석으로 단기 합격. 월 9,900원.',
    canonical: 'https://quest-dp.com/',
    ogImage: 'https://quest-dp.com/og/default.png',
    ogType: 'website',
  });

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

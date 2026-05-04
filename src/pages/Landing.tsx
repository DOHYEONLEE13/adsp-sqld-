import { Helmet } from 'react-helmet-async';
import TextureOverlay from '@/components/layout/TextureOverlay';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import GameModes from '@/components/sections/GameModes';
import Pricing from '@/components/sections/Pricing';
import CTA from '@/components/sections/CTA';

export default function Landing() {
  return (
    <>
      <Helmet>
        <title>QuestDP — ADSP·SQLD 자격증, 게임으로 놀면서 합격</title>
        <meta
          name="description"
          content="ADsP·SQLD 자격증을 게임처럼 학습하는 마이크로러닝 SaaS. 토리·셀리와 함께 챕터를 정복하고 AI 약점 분석으로 단기 합격. 월 9,900원."
        />
        <meta name="keywords" content="ADsP, SQLD, 자격증, 데이터 분석 준전문가, SQL 개발자, 학습앱, 게임형 학습, 마이크로러닝, 인강, 기출문제" />
        <link rel="canonical" href="https://quest-dp.com/" />
      </Helmet>
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

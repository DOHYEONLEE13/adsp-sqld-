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

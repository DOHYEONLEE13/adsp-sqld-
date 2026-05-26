import { useEffect } from 'react';
import TextureOverlay from '@/components/layout/TextureOverlay';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import StudyMethodTeaser from '@/components/sections/StudyMethodTeaser';
import GameModes from '@/components/sections/GameModes';
import Pricing from '@/components/sections/Pricing';
import CTA from '@/components/sections/CTA';
import { useSeoMeta } from '@/lib/seo';
import { getSupabase } from '@/lib/supabase';
import { waitForSession } from '@/lib/auth/waitForSession';

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
    title: 'QuestDP — ADsP·SQLD 자격증 학습사이트 | 게임형 문제풀이',
    description:
      'QuestDP는 ADsP·SQLD 자격증을 게임처럼 공부하는 학습사이트입니다. 로드맵과 퀘스트를 따라 개념을 익히고, 문제풀이와 약점 복습으로 시험을 준비하세요.',
    canonical: 'https://quest-dp.com/',
    ogImage: 'https://quest-dp.com/og/questdp-home.png',
    ogType: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'QuestDP',
        alternateName: [
          '퀘스트디피',
          'ADsP 게임형 학습',
          'SQLD 게임형 학습',
          'ADSP 학습사이트',
          'SQLD 학습사이트',
          'ADSP SQLD 학습사이트',
        ],
        url: 'https://quest-dp.com/',
        inLanguage: 'ko-KR',
        description:
          'ADsP·SQLD 자격증을 게임처럼 공부하는 개념 스텝, 문제풀이, 약점 복습 중심 학습사이트.',
        image: 'https://quest-dp.com/og/questdp-home.png',
        publisher: {
          '@type': 'Organization',
          name: 'QuestDP',
          alternateName: '퀘스트디피',
          url: 'https://quest-dp.com/',
          logo: 'https://quest-dp.com/logo/questdp-mark.png',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: 'QuestDP',
        alternateName: '퀘스트디피',
        url: 'https://quest-dp.com/',
        image: 'https://quest-dp.com/og/questdp-home.png',
        description:
          'ADsP·SQLD 자격증을 로드맵과 퀘스트로 공부하는 게임형 온라인 학습사이트.',
        teaches: [
          'ADsP 데이터분석준전문가',
          'SQLD SQL 개발자',
          'ADSP 기출문제',
          'SQLD 기출문제',
        ],
        knowsAbout: [
          '게임형 학습',
          'Leitner SRS',
          '약점 복습',
          'ADsP 학습사이트',
          'SQLD 학습사이트',
        ],
      },
    ],
  });

  useScrollToHashAnchor();

  // 방안 L (확장) — Landing 마운트 시점에 Supabase 세션 hydration 적극 워밍.
  // 1) getSession() 즉시 트리거 (방안 D 의 기존 동작)
  // 2) waitForSession() 으로 hydration 완료까지 명시 대기 — 사용자가 "Play"
  //    클릭 시점엔 이미 INITIAL_SESSION 이벤트 fire 됐을 확률 ↑
  //    → energy.ts/passSync.ts/stepUnlocks.ts 의 첫 pull 이 정상 session 받음
  // 둘 다 fire-and-forget. 실패해도 정상 흐름엔 영향 없음.
  useEffect(() => {
    void getSupabase()?.auth.getSession();
    void waitForSession();
  }, []);

  return (
    <>
      <TextureOverlay />
      <Hero />
      <About />
      <StudyMethodTeaser />
      <GameModes />
      <Pricing />
      <CTA />
      <Footer />
    </>
  );
}

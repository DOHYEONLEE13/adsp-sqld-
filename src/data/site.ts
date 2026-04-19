import type {
  AboutContent,
  CollectionContent,
  CtaContent,
  HeroContent,
} from '@/types/site';

export const BRAND = {
  nameKr: '퀘스트디피',
  nameEn: 'QuestDP',
  /** 로고에서 neon dot 으로 강조되는 구분자. */
  separator: '.',
  logoLeft: '퀘스트',
  logoRight: '디피',
  tagline: 'ADSP · SQLD, 놀면서 합격',
} as const;

export const VIDEO_URLS = {
  hero: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_045634_e1c98c76-1265-4f5c-882a-4276f2080894.mp4',
  about:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_151551_992053d1-3d3e-4b8c-abac-45f22158f411.mp4',
  mode1:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_053923_22c0a6a5-313c-474c-85ff-3b50d25e944a.mp4',
  mode2:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_054411_511c1b7a-fb2f-42ef-bf6c-32c0b1a06e79.mp4',
  mode3:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_055427_ac7035b5-9f3b-4289-86fc-941b2432317d.mp4',
  cta: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_055729_72d66327-b59e-4ae9-bb70-de6ccb5ecdb0.mp4',
} as const;

export const HERO: HeroContent = {
  headingLines: ['ADSP, SQLD', '게임으로', '놀면서 합격!'],
  cursiveAccent: 'Play & Pass',
  videoUrl: VIDEO_URLS.hero,
};

export const ABOUT: AboutContent = {
  headingLines: ['안녕!', '난 퀘스트디피야'],
  lead: '암기 싫어하는 수험생을 위한 게임형 학습 플랫폼. 몬스터를 잡고 보스를 깨며, 책 없이 ADSP·SQLD에 합격하세요.',
  bulletLines: [
    '몬스터는 개념, 보스는 과목. 정답 하나가 곧 한 방의 공격.',
    'AI가 당신의 약점을 진단해 맞춤형 보스 스테이지를 생성합니다.',
  ],
  videoUrl: VIDEO_URLS.about,
};

export const COLLECTION: CollectionContent = {
  titleFirstLine: '게임 모드',
  cursiveInline: '전체 ',
  titleSecondLineSuffix: '컬렉션',
  seeAllPrimary: '모두',
  seeAllSecondaryTop: '모드',
  seeAllSecondaryBottom: '보기',
  cardFunScoreLabel: '재미 지수:',
};

export const CTA: CtaContent = {
  cursiveAccent: '지금 시작',
  joinLine: '함께하세요.',
  restLines: ['보스를 잡고.', '레벨을 올리고.', '시험을 끝내세요.'],
  videoUrl: VIDEO_URLS.cta,
};

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
  /** 게임 인내 화면(Zone/Quests/Friends/Stats) 공용 배경 — Mux HLS. */
  pageAmbient:
    'https://stream.mux.com/Si6ej2ZRrxRCnTYBXSScDRCdd7CGnyTqiPszZcw3z4I.m3u8',
} as const;

/**
 * Mux 가 자동 생성하는 썸네일 (poster 용). 영상 로드 전·자동재생 차단 시 표시.
 * `time=2` = 영상 2초 시점 (보통 첫 인상에 좋은 프레임).
 */
export const VIDEO_POSTERS = {
  pageAmbient:
    'https://image.mux.com/Si6ej2ZRrxRCnTYBXSScDRCdd7CGnyTqiPszZcw3z4I/thumbnail.webp?width=1920&fit_mode=preserve&time=2',
} as const;

export const HERO: HeroContent = {
  headingLines: ['ADSP, SQLD', '게임으로', '놀면서 합격!'],
  cursiveAccent: 'Play & Pass',
  videoUrl: VIDEO_URLS.hero,
};

export const ABOUT: AboutContent = {
  headingLines: ['안녕!', '난 퀘스트디피야'],
  lead: '암기 싫어하는 수험생을 위한 게임형 학습 플랫폼. 우주를 탐험하듯 챕터를 정복하고, AI가 매일 약점을 골라 맞춤 미션을 던집니다.',
  bulletLines: [
    'ADSP · SQLD 두 은하, 행성마다 챕터, 그 안엔 토픽 존. 한 스텝씩 풀며 레벨업.',
    'Leitner 5단계 SRS · 오답 큐 · 약점 점수 — 오늘 풀이가 내일 다시 만나는 복습으로.',
  ],
  videoUrl: VIDEO_URLS.about,
};

export const COLLECTION: CollectionContent = {
  titleFirstLine: '도전할',
  cursiveInline: '전체 ',
  titleSecondLineSuffix: '자격증',
  seeAllPrimary: '지금',
  seeAllSecondaryTop: '플레이',
  seeAllSecondaryBottom: '하기',
  cardFunScoreLabel: '콘텐츠',
};

export const CTA: CtaContent = {
  cursiveAccent: '지금 시작',
  joinLine: '함께하세요.',
  restLines: ['행성을 정복하고.', '레벨을 올리고.', '시험을 끝내세요.'],
  videoUrl: VIDEO_URLS.cta,
};

/**
 * 회사·운영자 정보. 사업자등록 전이면 placeholder 유지 + "준비 중" 표기.
 * 사업자등록 완료 시 실제 정보로 교체. 한국 전자상거래법상 표시 의무.
 */
export const COMPANY = {
  name: 'QuestDP',
  representative: '이도현',
  /** 운영 전용 이메일 — 약관·정책·푸터·문의 모든 곳에서 이 한 곳을 참조. */
  email: 'questdpofficial@gmail.com',
  contact: '문의는 이메일로',
  // 아래 항목들은 사업자등록 후 채워질 자리. 현재는 "준비 중" 명시.
  businessNumber: '사업자등록 준비 중',
  ecommerceNumber: '통신판매업 신고 준비 중',
  address: '서울특별시 (정식 주소 등록 예정)',
  hostingProvider: 'Cloudflare Pages',
  /** 약관·정책의 마지막 개정일. 변경 시 같이 갱신. */
  policyUpdatedAt: '2026-04-29',
} as const;

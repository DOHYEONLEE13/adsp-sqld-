import type { PricingPlan } from '@/types/site';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    tier: '무료 플랜',
    price: '₩0',
    features: [
      { text: '하루 10문제' },
      { text: '기본 몬스터 배틀 모드' },
      { text: '월 1회 모의고사' },
    ],
  },
  {
    id: 'premium',
    tier: '프리미엄 / 월 구독',
    price: '월 9,900원',
    features: [
      { text: '모든 문제 · 모든 모드 무제한', highlight: true },
      { text: 'AI 약점 분석 & 보스 스테이지', highlight: true },
      { text: '모의고사 & 해설 전체 공개' },
      { text: '합격 예측 점수 대시보드' },
    ],
  },
];

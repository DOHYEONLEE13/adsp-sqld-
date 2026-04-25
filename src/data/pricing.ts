import type { PricingPlan } from '@/types/site';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    tier: '무료 플랜',
    price: '₩0',
    features: [
      { text: 'Daily Mission 하루 10문제' },
      { text: 'ADSP · SQLD 학습 모드 일부 챕터' },
      { text: '월 1회 모의고사' },
    ],
  },
  {
    id: 'premium',
    tier: '프리미엄 / 월 구독',
    price: '월 9,900원',
    features: [
      { text: '모든 자격증 · 모든 모드 무제한', highlight: true },
      { text: 'AI 약점 분석 + 맞춤 Daily Mission', highlight: true },
      { text: 'Leitner SRS 자동 복습 큐 · 오답 재출제' },
      { text: '모의고사 50문항 무제한 + 해설 전체 공개' },
      { text: '마스터리 · D-day · 스트릭 대시보드' },
    ],
  },
];

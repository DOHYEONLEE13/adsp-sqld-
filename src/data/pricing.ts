import type { PricingPlan } from '@/types/site';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    tier: '무료 플랜',
    price: '₩0',
    features: [
      { text: '⚡ 에너지 5회 — 개념 학습·모의고사 풀이 시 1회 소모' },
      { text: '30분마다 ⚡ 1회 자동 충전 (최대 5회)' },
      { text: '로드맵 순차 진행 — 앞 단계를 깨야 다음 단계 잠금 해제' },
      { text: 'ADSP · SQLD 모든 개념 콘텐츠 열람' },
      { text: '오답 복습 · 일일 미션 기본 제공' },
    ],
  },
  {
    id: 'premium',
    tier: '프리미엄 / 월 구독',
    price: '월 9,900원',
    features: [
      { text: '⚡ 무제한 — 에너지·대기시간 없이 즉시 풀이', highlight: true },
      { text: '로드맵 자유 진행 — 어떤 챕터·스텝이든 즉시 도전', highlight: true },
      { text: '챕터 모의고사 무제한 (1·2·3·Final 모두 재시도 자유)' },
      { text: 'AI 약점 분석 + 맞춤 Daily Mission' },
      { text: 'Leitner SRS 자동 복습 큐 · 오답 재출제' },
      { text: '마스터리 · D-day · 스트릭 대시보드 전체 해금' },
    ],
  },
];

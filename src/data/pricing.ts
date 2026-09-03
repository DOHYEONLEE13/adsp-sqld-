import type { PricingPlan } from '@/types/site';

/**
 * 요금제 데이터.
 *
 * 가격 정직성:
 *   - 1주 4,900원 × 30/7 ≈ 21,000원 vs 30일 9,900원
 *   - 30일 이용권 절약율: (21,000 - 9,900) / 21,000 ≈ 52.9%
 *   - 30일권을 7일로 환산하면 약 2,310원 → 1주 4,900원 대비 약 53% 절약.
 *
 * 가격 표기 분리:
 *   price        = '9,900' 같이 숫자만 (큰 글씨)
 *   priceSuffix  = '원 / 월' 같이 단위·주기 (작은 글씨)
 *   valueNote    = neon 색 가치 안내 (30일 이용권 차별화)
 */

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    category: 'FREE',
    tier: '무료 플랜',
    price: '₩0',
    description:
      'ADSP · SQLD 전체 커리큘럼 무료. 새 풀이는 ⚡ 최대 10회 (30분마다 자동 충전).',
    features: [
      { text: '⚡ 10회 보유 — 새 step·모의고사 진입 시 1회 소모' },
      { text: '30분마다 ⚡ 1회 자동 충전 (최대 10회)' },
      { text: 'XP 로 ⚡ 즉시 구매 가능 (40/100/300 XP 티어)' },
      { text: '로드맵 순차 진행 — 앞 단계 정답 처리 시 다음 잠금 해제' },
      { text: 'ADSP · SQLD 전체 커리큘럼 + 오답 복습 + 일일 미션 기본 제공' },
    ],
  },
  {
    id: 'premium-weekly',
    category: 'PRO',
    tier: '1주 단기',
    price: '4,900',
    priceSuffix: '원 / 주',
    badge: '단기',
    description: '시험 직전 집중. 결제일부터 7일간 모든 프리미엄 기능 사용.',
    features: [
      { text: '⚡ 무제한 — 7일 동안 에너지·대기시간 없음', highlight: true },
      { text: '로드맵 자유 진행 — 어떤 챕터·스텝이든 즉시 도전', highlight: true },
      { text: '챕터 모의고사 무제한 (1·2·3·Final 모두 재시도 자유)' },
      { text: '결제일부터 7일 후 자동 만료 — 자동 갱신 없음' },
    ],
  },
  {
    id: 'premium-monthly',
    category: 'MAX',
    tier: '30일 이용권',
    price: '9,900',
    priceSuffix: '원 / 30일',
    valueNote: '주당 약 2,310원 · 1주 이용권 대비 약 53% 절약',
    badge: 'BEST',
    emphasis: 'highlight',
    description: '결제일부터 30일간 꾸준히 공부하는 가장 합리적인 선택.',
    features: [
      { text: '⚡ 무제한 — 에너지·대기시간 없이 즉시 풀이', highlight: true },
      { text: '로드맵 자유 진행 — 어떤 챕터·스텝이든 즉시 도전', highlight: true },
      { text: '챕터 모의고사 무제한 (1·2·3·Final 모두 재시도 자유)' },
      { text: '마스터리 · D-day · 스트릭 대시보드 전체 해금' },
      { text: '결제일부터 30일 후 자동 만료 — 자동 갱신 없음' },
    ],
  },
];

import type { PricingPlan } from '@/types/site';

/**
 * 요금제 데이터.
 *
 * 가격 정직성:
 *   - 1주 4,900원 × 4주 = 19,600원 vs 월 9,900원
 *   - 월 구독 절약율: (19,600 - 9,900) / 19,600 ≈ 49.5%
 *   - 즉 "월 구독 = 1주 단기의 약 절반 가격" 이 정확.
 *   - "주당 환산: 9,900 / 4 ≈ 2,475원" → 1주 4,900원 대비 약 50% 절약.
 *
 * 가격 표기 분리:
 *   price        = '9,900' 같이 숫자만 (큰 글씨)
 *   priceSuffix  = '원 / 월' 같이 단위·주기 (작은 글씨)
 *   valueNote    = neon 색 가치 안내 (월 구독 차별화)
 */

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    category: 'FREE',
    tier: '무료 플랜',
    price: '₩0',
    description: '모든 콘텐츠 열람 가능. 풀이는 하루 ⚡ 5회까지.',
    features: [
      { text: '⚡ 에너지 5회 — 학습·모의고사 풀이 시 1회 소모' },
      { text: '30분마다 ⚡ 1회 자동 충전 (최대 5회)' },
      { text: '로드맵 순차 진행 — 앞 단계 클리어 시 다음 잠금 해제' },
      { text: 'ADSP · SQLD 모든 개념 콘텐츠 열람' },
      { text: '오답 복습 · 일일 미션 기본 제공' },
    ],
  },
  {
    id: 'premium-weekly',
    category: 'PRO',
    tier: '1주 단기',
    price: '4,900',
    priceSuffix: '원 / 주',
    badge: '단기',
    description: '시험 직전 집중. 7일간 모든 프리미엄 기능 사용.',
    features: [
      { text: '⚡ 무제한 — 7일 동안 에너지·대기시간 없음', highlight: true },
      { text: '로드맵 자유 진행 — 어떤 챕터·스텝이든 즉시 도전', highlight: true },
      { text: '챕터 모의고사 무제한 (1·2·3·Final 모두 재시도 자유)' },
      { text: 'AI 약점 분석 + 맞춤 Daily Mission' },
      { text: 'Leitner SRS 자동 복습 큐 · 오답 재출제' },
      { text: '결제 후 7일 자동 만료 — 자동 갱신 X' },
    ],
  },
  {
    id: 'premium-monthly',
    category: 'MAX',
    tier: '월 구독',
    price: '9,900',
    priceSuffix: '원 / 월',
    valueNote: '주당 약 2,475원 · 1주 단기 대비 절반 가격',
    badge: 'BEST',
    emphasis: 'highlight',
    description: '꾸준히 공부할 사람에게 가장 합리적인 선택.',
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

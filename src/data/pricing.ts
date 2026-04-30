import type { PricingPlan } from '@/types/site';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    tier: '무료 플랜',
    price: '₩0',
    description: '모든 콘텐츠 열람 가능. 풀이는 하루 ⚡ 5회 한도.',
    features: [
      { text: '⚡ 에너지 5회 — 개념 학습·모의고사 풀이 시 1회 소모' },
      { text: '30분마다 ⚡ 1회 자동 충전 (최대 5회)' },
      { text: '로드맵 순차 진행 — 앞 단계를 깨야 다음 단계 잠금 해제' },
      { text: 'ADSP · SQLD 모든 개념 콘텐츠 열람' },
      { text: '오답 복습 · 일일 미션 기본 제공' },
    ],
  },
  {
    id: 'premium-weekly',
    tier: '프리미엄 / 1주 단기',
    price: '주 4,900원',
    description: '시험 직전 집중. 7일간 모든 프리미엄 기능 사용.',
    badge: '단기',
    features: [
      { text: '⚡ 무제한 — 7일 동안 에너지·대기시간 없음', highlight: true },
      { text: '로드맵 자유 진행 — 어떤 챕터·스텝이든 즉시 도전', highlight: true },
      { text: '챕터 모의고사 무제한 (1·2·3·Final 모두 재시도 자유)' },
      { text: 'AI 약점 분석 + 맞춤 Daily Mission' },
      { text: 'Leitner SRS 자동 복습 큐 · 오답 재출제' },
      { text: '시험 직전 1주 집중에 적합 — 결제 후 7일 자동 만료' },
    ],
  },
  {
    id: 'premium-monthly',
    tier: '프리미엄 / 월 구독',
    price: '월 9,900원',
    description: '꾸준히 공부할 사람에게 가장 합리적 (1주 대비 약 28% 저렴).',
    badge: 'BEST',
    emphasis: 'highlight',
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

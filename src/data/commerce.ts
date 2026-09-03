/** 결제·이용기간·환불 문구의 단일 원천. */
export const COMMERCE_POLICY = {
  paymentMethods: '신용·체크카드 · 간편결제 (토스페이먼츠)',
  activation: '결제 승인 즉시 자동 활성',
  weeklyPeriod: '결제일부터 7일',
  monthlyPeriod: '결제일부터 30일',
  maximumServicePeriod: '1회 결제 기준 최대 30일',
  renewal: 'Pro와 Max 모두 단건 결제 이용권이며 자동 갱신되지 않습니다.',
  unusedRefund:
    '결제일부터 7일 이내이고 유료 콘텐츠 사용 이력이 없는 경우 전액 환불합니다.',
  startedContentRefund:
    '유료 콘텐츠 이용을 시작한 경우 청약철회가 제한될 수 있으며, 남은 기간을 일할 계산해 환불하지 않습니다.',
  statutoryException:
    '중복 결제, 서비스 미제공, 표시·광고 또는 계약 내용과 다른 제공 등 관계 법령상 사유가 있는 경우에는 별도로 확인해 환불합니다.',
  processing:
    '환불 요청은 영업일 기준 3일 이내에 확인하며, 승인 후 결제수단에 따라 실제 환급까지 3~7영업일이 추가로 걸릴 수 있습니다.',
} as const;

/**
 * PaymentCallbackPage — 토스 결제 성공·실패 후 진입점.
 *
 * 라우트: `#/payment/callback?status=fail&...` (실패) 또는
 *         `#/payment/callback?paymentKey=...&orderId=...&amount=...` (성공)
 *
 * 흐름 (성공):
 *   1. URL 쿼리 파싱 (paymentKey, orderId, amount)
 *   2. sessionStorage 의 pending payment 검증 (orderId 매칭, amount 일치)
 *   3. Edge Function `toss-confirm` 호출 (Authorization: Bearer <user JWT>)
 *      → 서버가 토스 /confirm 호출 + payments insert + premium 부여
 *   4. 성공: "프리미엄 활성화 완료" + 자동 #/game redirect (3초 카운트)
 *   5. 실패: 에러 메시지 + [재시도] / [홈으로] 버튼
 *
 * 흐름 (실패 — 사용자가 결제창 닫음 / 카드사 거절):
 *   1. status=fail 감지 → 안내 메시지 + [요금제로 돌아가기]
 *
 * 멱등:
 *   - 같은 orderId 로 confirm 재호출해도 server RPC 가 ON CONFLICT DO NOTHING
 *     로 멱등 처리. 사용자가 새로고침해도 안전.
 */

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import {
  clearPendingPayment,
  getPendingPayment,
  PRODUCT_LABELS,
} from '@/lib/toss';

interface Props {
  onBack: () => void;
}

type Phase = 'verifying' | 'success' | 'failure' | 'cancelled';

export default function PaymentCallbackPage({ onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('verifying');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [productLabel, setProductLabel] = useState<string>('');
  const [redirectIn, setRedirectIn] = useState(3);

  useEffect(() => {
    const params = parseHashQuery();
    if (params.status === 'fail' || params.code) {
      setPhase('cancelled');
      setErrorMsg(params.message || '결제가 취소됐어요.');
      clearPendingPayment();
      return;
    }

    const paymentKey = params.paymentKey;
    const orderId = params.orderId;
    const amount = Number(params.amount);

    if (!paymentKey || !orderId || !Number.isFinite(amount)) {
      setPhase('failure');
      setErrorMsg('결제 정보가 누락됐어요. 요금제 페이지에서 다시 시도해주세요.');
      return;
    }

    const pending = getPendingPayment();
    if (!pending) {
      setPhase('failure');
      setErrorMsg(
        '결제 세션이 만료됐거나 다른 기기에서 진행한 결제입니다. 토스 대시보드에서 직접 처리되었으면 자동 반영됩니다.',
      );
      return;
    }
    if (pending.orderId !== orderId || pending.amount !== amount) {
      setPhase('failure');
      setErrorMsg('결제 정보가 일치하지 않아요. 보안 차원에서 차단했습니다.');
      return;
    }

    setProductLabel(PRODUCT_LABELS[pending.productCode]);

    void confirmPayment({
      paymentKey,
      orderId,
      amount,
      productCode: pending.productCode,
    })
      .then(() => {
        clearPendingPayment();
        setPhase('success');
      })
      .catch((err: Error) => {
        setPhase('failure');
        setErrorMsg(err.message || '서버 검증 중 오류가 발생했어요.');
      });
  }, []);

  // 성공 시 카운트다운 후 #/game 자동 이동
  useEffect(() => {
    if (phase !== 'success') return;
    if (redirectIn <= 0) {
      window.location.hash = '/game';
      return;
    }
    const id = window.setTimeout(() => setRedirectIn((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [phase, redirectIn]);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center px-6"
      style={{ background: '#010828', color: 'var(--cream)' }}
    >
      <div className="w-full max-w-[480px]">
        <div
          className="liquid-glass rounded-[24px] p-8 md:p-10 text-center"
        >
          {phase === 'verifying' ? (
            <>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
                style={{ background: 'rgba(111,255,0,0.10)' }}>
                <Loader2
                  size={28}
                  strokeWidth={2.4}
                  className="animate-spin"
                  style={{ color: '#6FFF00' }}
                />
              </div>
              <h1 className="kr-heading text-[20px] md:text-[24px] mb-2">
                결제를 확인하는 중…
              </h1>
              <p className="kr-body text-[13px] text-cream/65 leading-[1.6]">
                토스 결제 응답을 검증하고 프리미엄을 활성화하고 있어요.
                <br />
                창을 닫지 말고 잠시만 기다려주세요.
              </p>
            </>
          ) : phase === 'success' ? (
            <>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
                style={{ background: 'rgba(111,255,0,0.18)' }}>
                <CheckCircle2 size={32} strokeWidth={2.4} style={{ color: '#6FFF00' }} />
              </div>
              <h1 className="kr-heading text-[22px] md:text-[26px] mb-2">
                결제 완료!
              </h1>
              {productLabel ? (
                <p className="kr-body text-[14px] text-cream/85 mb-1">
                  {productLabel} 활성화됐어요.
                </p>
              ) : null}
              <p className="kr-body text-[13px] text-cream/60 leading-[1.6] mt-3">
                {redirectIn} 초 후 학습 화면으로 자동 이동합니다.
              </p>
              <button
                type="button"
                onClick={() => (window.location.hash = '/game')}
                className="kr-heading uppercase tracking-widest text-[12px] mt-6 px-6 py-3 rounded-full"
                style={{
                  background: '#6FFF00',
                  color: '#010828',
                  boxShadow: '0 8px 20px -6px rgba(111,255,0,0.5)',
                }}
              >
                바로 학습하러 가기
              </button>
            </>
          ) : phase === 'cancelled' ? (
            <>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
                style={{ background: 'rgba(239,244,255,0.06)' }}>
                <AlertTriangle size={28} strokeWidth={2.2} style={{ color: 'rgba(239,244,255,0.65)' }} />
              </div>
              <h1 className="kr-heading text-[20px] md:text-[24px] mb-2">
                결제 취소됨
              </h1>
              <p className="kr-body text-[13px] text-cream/70 leading-[1.6]">
                {errorMsg}
              </p>
              <div className="flex gap-2 mt-6 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={onBack}
                  className="kr-heading uppercase tracking-widest text-[12px] px-5 py-3 rounded-full"
                  style={{
                    background: 'rgba(239,244,255,0.06)',
                    color: 'var(--cream)',
                    border: '1.5px solid rgba(239,244,255,0.18)',
                  }}
                >
                  돌아가기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = '';
                    window.setTimeout(() => {
                      const el = document.getElementById('pricing');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="kr-heading uppercase tracking-widest text-[12px] px-5 py-3 rounded-full"
                  style={{
                    background: '#FD802E',
                    color: '#010828',
                  }}
                >
                  요금제 다시 보기
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
                style={{ background: 'rgba(248,113,113,0.14)' }}>
                <AlertTriangle size={28} strokeWidth={2.4} style={{ color: '#f87171' }} />
              </div>
              <h1 className="kr-heading text-[20px] md:text-[24px] mb-2">
                결제 검증 실패
              </h1>
              <p className="kr-body text-[13px] text-cream/75 leading-[1.6]">
                {errorMsg}
              </p>
              <p className="kr-body text-[12px] text-cream/45 mt-3 leading-[1.55]">
                금액이 빠져나갔다면 자동 환불 처리됩니다. 5분 후에도 활성화 안 되면
                고객문의로 알려주세요. 처리 ID: <code>{getPendingPayment()?.orderId ?? '—'}</code>
              </p>
              <div className="flex gap-2 mt-6 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={onBack}
                  className="kr-heading uppercase tracking-widest text-[12px] px-5 py-3 rounded-full"
                  style={{
                    background: 'rgba(239,244,255,0.06)',
                    color: 'var(--cream)',
                    border: '1.5px solid rgba(239,244,255,0.18)',
                  }}
                >
                  홈으로
                </button>
                <a
                  href="mailto:questdpofficial@gmail.com?subject=결제 검증 실패 문의"
                  className="kr-heading uppercase tracking-widest text-[12px] px-5 py-3 rounded-full"
                  style={{
                    background: '#FD802E',
                    color: '#010828',
                  }}
                >
                  고객문의
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────

/**
 * 해시 라우터 환경에서 쿼리 파싱.
 * URL 예: `https://x.com/#/payment/callback?paymentKey=...&orderId=...&amount=...`
 * window.location.hash = `#/payment/callback?paymentKey=...&...`
 */
function parseHashQuery(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const hash = window.location.hash || '';
  const qIdx = hash.indexOf('?');
  if (qIdx < 0) return {};
  const q = hash.slice(qIdx + 1);
  const params: Record<string, string> = {};
  for (const part of q.split('&')) {
    if (!part) continue;
    const [k, v] = part.split('=');
    params[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
  }
  return params;
}

interface ConfirmInput {
  paymentKey: string;
  orderId: string;
  amount: number;
  productCode: string;
}

async function confirmPayment(input: ConfirmInput): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase 환경이 설정되지 않았어요.');

  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) throw new Error('로그인이 필요해요.');

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
  const url = `${SUPABASE_URL}/functions/v1/toss-confirm`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sess.session.access_token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    let parsed: { error?: string } | null = null;
    try {
      parsed = JSON.parse(errText) as { error?: string };
    } catch {
      /* 무시 */
    }
    throw new Error(parsed?.error || errText || `HTTP ${res.status}`);
  }
}

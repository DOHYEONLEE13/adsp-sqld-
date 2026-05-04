/**
 * RefundRequestPage — 환불 요청 폼.
 *
 * 라우팅: `#/refund-request`
 *
 * 흐름:
 *   1. 결제일 입력 → 자동 자격 판정 (≤7일 / >7일)
 *   2. 사유 입력 (선택)
 *   3. 제출 → DB `refund_requests` insert (Supabase 활성 시)
 *      + mailto: 로 운영자 이메일 자동 작성
 *
 * 가맹점 통과 후 Toss API 자동 환불 연동 위치:
 *   - DB row 가 만들어지면 Edge Function (또는 cron) 이 Toss `/cancel` 호출
 *   - 지금은 placeholder — 운영자 (questdpofficial@gmail.com) 가 수동 처리
 *
 * env 미설정·미로그인이어도 폼 자체는 동작 (mailto: 만 trigger).
 * 인증된 사용자면 DB 에 row 도 추가로 남김.
 */

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronRight, Mail, Loader2, Check } from 'lucide-react';
import VideoBg from '@/components/ui/VideoBg';
import { VIDEO_URLS, COMPANY } from '@/data/site';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface Props {
  onBack?: () => void;
}

type Eligibility = 'within7' | 'after7' | 'unknown';

function calcEligibility(paidDate: string): Eligibility {
  if (!paidDate) return 'unknown';
  const paid = new Date(paidDate);
  if (isNaN(paid.getTime())) return 'unknown';
  const now = new Date();
  const days = (now.getTime() - paid.getTime()) / (1000 * 60 * 60 * 24);
  if (days < 0) return 'unknown';
  return days <= 7 ? 'within7' : 'after7';
}

export default function RefundRequestPage({ onBack }: Props) {
  const [email, setEmail] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const eligibility = useMemo(() => calcEligibility(paidDate), [paidDate]);

  // 로그인된 사용자라면 이메일 미리 채움
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      if (data.session?.user.email && !email) {
        setEmail(data.session.user.email);
      }
    });
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !email || !paidDate) return;
    setSubmitting(true);

    // (1) 인증된 경우 DB 에 row 남김 — 가맹점 통과 후 Edge Function 이 처리
    const sb = getSupabase();
    if (sb) {
      const { data: sess } = await sb.auth.getSession();
      if (sess.session) {
        await sb.from('refund_requests').insert({
          user_id: sess.session.user.id,
          contact_email: email,
          paid_date: paidDate,
          reason: reason || null,
          eligibility,
          status: 'pending',
        });
      }
    }

    // (2) 운영자 이메일 자동 작성 (mailto:)
    const subject = encodeURIComponent('[QuestDP] 환불 요청');
    const body = encodeURIComponent(buildMailtoBody());
    const href = `mailto:${COMPANY.email}?subject=${subject}&body=${body}`;
    window.location.href = href;

    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <section className="relative min-h-screen isolate overflow-hidden text-cream">
      {/* 배경 */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <VideoBg src={VIDEO_URLS.pageAmbient} fit="cover" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(1,8,40,0.78) 0%, rgba(1,8,40,0.92) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-[640px] mx-auto px-5 md:px-8 lg:px-10 pt-8 pb-16">
        <button
          type="button"
          onClick={() => {
            if (onBack) onBack();
            else {
              // /refund 는 path-based — pushState + popstate dispatch
              window.history.pushState({}, '', '/refund');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
          }}
          aria-label="환불 정책으로 돌아가기"
          className="inline-flex items-center gap-2 kr-heading uppercase text-[11px] tracking-widest text-cream/75 hover:text-neon transition mb-8"
        >
          <ArrowLeft size={14} strokeWidth={2.4} />
          환불 정책
        </button>

        <header className="mb-10 pb-6 border-b border-cream/15">
          <div className="kr-heading uppercase text-[10px] tracking-widest text-neon/85 mb-3">
            QuestDP · REFUND REQUEST
          </div>
          <h1 className="kr-heading text-[32px] md:text-[44px] leading-[1.1] mb-4">
            환불 요청
          </h1>
          <p className="kr-body text-[14px] md:text-[15px] text-cream/70 leading-[1.65]">
            전자상거래법 제17조 청약철회 기준에 따라 처리됩니다. 제출 후 영업일 기준 3일
            이내에 {COMPANY.email} 에서 회신드려요.
          </p>
        </header>

        {submitted ? (
          // ── 제출 완료 화면 ──────────────────────────────────
          <div
            className="liquid-glass rounded-[20px] p-6 md:p-8 flex flex-col items-center text-center gap-3"
            role="status"
          >
            <span
              className="inline-flex items-center justify-center w-12 h-12 rounded-full"
              style={{
                background: 'rgba(111,255,0,0.12)',
                border: '1px solid rgba(111,255,0,0.5)',
              }}
            >
              <Check size={20} className="text-neon" />
            </span>
            <h2 className="kr-heading text-[20px] md:text-[22px] mt-1">
              요청이 접수됐어요
            </h2>
            <p className="kr-body text-[13px] text-cream/70 leading-[1.65] max-w-[420px]">
              메일 앱이 열리면 그대로 발송해 주세요. 운영자 회신이 영업일 기준 3일 이내에
              도착합니다.
              {isSupabaseConfigured() ? (
                <>
                  <br />
                  로그인 상태였다면 시스템에도 같은 내용이 기록됐어요.
                </>
              ) : null}
            </p>
            <a
              href={`mailto:${COMPANY.email}?subject=${encodeURIComponent(
                '[QuestDP] 환불 요청 (재발송)',
              )}&body=${encodeURIComponent(buildMailtoBody())}`}
              className="kr-num inline-flex items-center gap-2 text-[11px] uppercase tracking-widest px-4 py-2 rounded-full mt-3 transition active:scale-95"
              style={{
                background: 'rgba(239,244,255,0.06)',
                border: '1px solid rgba(239,244,255,0.18)',
                color: 'var(--cream)',
              }}
            >
              <Mail size={12} strokeWidth={2.4} />
              메일 다시 작성
            </a>
          </div>
        ) : (
          // ── 입력 폼 ─────────────────────────────────────────
          <form
            onSubmit={handleSubmit}
            className="liquid-glass rounded-[20px] p-5 md:p-6 space-y-5"
            aria-label="환불 요청 폼"
          >
            <Field
              id="rr-email"
              label="회신받을 이메일"
              required
            >
              <input
                id="rr-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full kr-num text-[14px] px-4 py-3 rounded-xl bg-cream/5 text-cream placeholder:text-cream/35 outline-none transition"
                style={{ border: '1px solid rgba(239,244,255,0.18)' }}
                disabled={submitting}
              />
            </Field>

            <Field
              id="rr-date"
              label="결제일"
              required
              hint="결제 후 7일 이내인지 자동 판정됩니다."
            >
              <input
                id="rr-date"
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                required
                max={new Date().toISOString().slice(0, 10)}
                className="w-full kr-num text-[14px] px-4 py-3 rounded-xl bg-cream/5 text-cream outline-none transition"
                style={{ border: '1px solid rgba(239,244,255,0.18)' }}
                disabled={submitting}
              />
            </Field>

            {eligibility !== 'unknown' ? (
              <div
                role="status"
                className="px-4 py-3 rounded-xl flex items-start gap-2.5 kr-body text-[13px] leading-[1.6]"
                style={{
                  background:
                    eligibility === 'within7'
                      ? 'rgba(111,255,0,0.10)'
                      : 'rgba(252,211,77,0.10)',
                  border:
                    eligibility === 'within7'
                      ? '1px solid rgba(111,255,0,0.4)'
                      : '1px solid rgba(252,211,77,0.4)',
                  color:
                    eligibility === 'within7'
                      ? 'rgba(196,255,128,0.95)'
                      : 'rgba(253,224,71,0.95)',
                }}
              >
                <ChevronRight size={14} className="mt-0.5 shrink-0" />
                <span>{eligibilityMessage(eligibility)}</span>
              </div>
            ) : null}

            <Field
              id="rr-reason"
              label="환불 사유 (선택)"
              hint="기재해주시면 처리에 도움이 됩니다."
            >
              <textarea
                id="rr-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="예: 콘텐츠가 기대와 달랐어요"
                rows={4}
                className="w-full kr-body text-[13px] px-4 py-3 rounded-xl bg-cream/5 text-cream placeholder:text-cream/35 outline-none transition resize-none"
                style={{ border: '1px solid rgba(239,244,255,0.18)' }}
                disabled={submitting}
              />
            </Field>

            <button
              type="submit"
              disabled={submitting || !email || !paidDate}
              className="w-full kr-num inline-flex items-center justify-center gap-2 text-[12px] uppercase tracking-widest py-3 rounded-xl transition active:scale-[0.98] disabled:opacity-40"
              style={{
                background: 'rgba(111,255,0,0.16)',
                border: '1px solid rgba(111,255,0,0.5)',
                color: 'var(--neon)',
              }}
            >
              {submitting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Mail size={13} strokeWidth={2.4} />
              )}
              요청 제출 + 메일 작성
            </button>

            <p className="kr-body text-[11px] text-cream/45 leading-[1.55]">
              제출 시 메일 앱이 자동으로 열려요. 그대로 발송하면 접수가 완료됩니다.
              {isSupabaseConfigured()
                ? ' 로그인 상태이면 시스템에도 기록됩니다.'
                : ''}
            </p>
          </form>
        )}
      </div>
    </section>
  );

  function buildMailtoBody() {
    const lines = [
      '── 환불 요청 ──',
      `이메일: ${email || '(미기재)'}`,
      `결제일: ${paidDate || '(미기재)'}`,
      `자격 판정: ${eligibilityLabel(eligibility)}`,
      '',
      '── 사유 ──',
      reason || '(미기재)',
      '',
      '──',
      'QuestDP 환불 정책 기준 처리 부탁드립니다.',
    ];
    return lines.join('\n');
  }
}

function Field({
  id,
  label,
  required,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block kr-num text-[10px] uppercase tracking-widest text-cream/65 mb-2"
      >
        {label}
        {required ? <span className="text-neon ml-1">*</span> : null}
      </label>
      {children}
      {hint ? (
        <p className="kr-body text-[11px] text-cream/45 mt-1.5 leading-[1.55]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function eligibilityLabel(e: Eligibility): string {
  switch (e) {
  case 'within7':
    return '결제 후 7일 이내 — 전액 환불 대상';
  case 'after7':
    return '결제 후 8일 이상 — 자동 갱신 중단으로 처리';
  default:
    return '결제일 미확인';
  }
}

function eligibilityMessage(e: Eligibility): string {
  switch (e) {
  case 'within7':
    return '결제 후 7일 이내입니다. 전액 환불 대상이에요.';
  case 'after7':
    return '결제 후 8일 이상이라 일할 환불은 불가하지만, 다음 결제부터 자동 중단으로 처리됩니다.';
  default:
    return '';
  }
}

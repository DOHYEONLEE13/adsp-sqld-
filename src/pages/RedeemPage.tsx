/**
 * RedeemPage — 초대 코드 입력 → 평생 무료 활성화.
 *
 * 라우팅: `#/redeem`
 *
 * 흐름:
 *   1. 미로그인 → AuthCard 의 "Google 로 시작" 버튼 노출 (코드는 로그인 후)
 *   2. 로그인 → 코드 입력란 + "코드 사용" 버튼
 *   3. 제출 → `redeemCode(code)` → 결과 토스트 (success / error)
 *   4. 성공 후 → 본인 grant 이력 표시 ("어떤 코드로 받았는지")
 *
 * env 미설정·게스트 모드: AuthCard 가 안내 fallback.
 */

import { useEffect, useState } from 'react';
import { ArrowLeft, Gift, Check, X, Loader2, Sparkles } from 'lucide-react';
import AuthCard from '@/game/components/AuthCard';
import {
  getSupabase,
  isSupabaseConfigured,
  onAuthStateChange,
} from '@/lib/supabase';
import {
  redeemCode,
  redeemReasonMessage,
  type RedeemReason,
} from '@/data/redemption';
import VideoBg from '@/components/ui/VideoBg';
import { VIDEO_URLS } from '@/data/site';

interface Props {
  onBack?: () => void;
}

interface GrantRow {
  id: string;
  source: string;
  source_ref: string | null;
  granted_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  note: string | null;
}

export default function RedeemPage({ onBack }: Props) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    reason: RedeemReason | null;
    message: string;
  } | null>(null);
  const [grants, setGrants] = useState<GrantRow[]>([]);

  // ── auth state 구독 ───────────────────────────────────────────
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setAuthed(false);
      return;
    }
    sb.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
    });
    const unsub = onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => unsub();
  }, []);

  // ── 본인 grant 이력 fetch ────────────────────────────────────
  const reloadGrants = async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb
      .from('premium_grants')
      .select('id, source, source_ref, granted_at, expires_at, revoked_at, note')
      .order('granted_at', { ascending: false });
    if (data) setGrants(data as GrantRow[]);
  };

  useEffect(() => {
    if (authed) void reloadGrants();
  }, [authed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || submitting) return;
    setSubmitting(true);
    const r = await redeemCode(code);
    setResult({
      ok: r.ok,
      reason: r.reason,
      message: redeemReasonMessage(r.reason, r.ok),
    });
    setSubmitting(false);
    if (r.ok) {
      setCode('');
      await reloadGrants();
    }
  };

  return (
    <section className="relative min-h-screen isolate overflow-hidden text-cream">
      {/* 배경 영상 + 어두운 오버레이 */}
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
            else window.location.hash = '';
          }}
          aria-label="홈으로"
          className="inline-flex items-center gap-2 kr-heading uppercase text-[11px] tracking-widest text-cream/75 hover:text-neon transition mb-8"
        >
          <ArrowLeft size={14} strokeWidth={2.4} />
          홈으로
        </button>

        {/* ── 타이틀 ───────────────────────────────────────────── */}
        <header className="mb-10 pb-6 border-b border-cream/15">
          <div className="kr-heading uppercase text-[10px] tracking-widest text-neon/85 mb-3">
            QuestDP · INVITE
          </div>
          <h1 className="kr-heading text-[32px] md:text-[44px] leading-[1.1] mb-4 flex items-center gap-3">
            <Sparkles size={28} className="text-neon" />
            초대 코드
          </h1>
          <p className="kr-body text-[14px] md:text-[15px] text-cream/70 leading-[1.65]">
            친구·지인에게 받은 코드를 입력하면 평생 무료 또는 일정 기간 premium 이
            활성화됩니다. 한 코드는 한 번만 사용할 수 있어요.
          </p>
        </header>

        {/* ── 미로그인 → AuthCard ─────────────────────────────── */}
        {authed === null ? (
          <div className="kr-body text-[13px] text-cream/60 flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            로그인 상태 확인 중…
          </div>
        ) : !authed ? (
          <>
            <p className="kr-body text-[13px] text-cream/65 mb-3 leading-[1.65]">
              코드 사용은 로그인 후 가능합니다. 로그인해주세요.
            </p>
            <AuthCard />
          </>
        ) : (
          // ── 로그인됨 → 코드 입력 ────────────────────────────
          <>
            <form
              onSubmit={handleSubmit}
              className="liquid-glass rounded-[20px] p-5 md:p-6 mb-6"
              aria-label="초대 코드 입력"
            >
              <label
                htmlFor="redeem-code"
                className="block kr-num text-[10px] uppercase tracking-widest text-cream/65 mb-2"
              >
                초대 코드
              </label>
              <div className="flex gap-2 flex-wrap">
                <input
                  id="redeem-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="QDP-FRIEND-XXXX"
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 min-w-[200px] kr-num text-[14px] tracking-widest px-4 py-3 rounded-xl bg-cream/5 text-cream placeholder:text-cream/35 outline-none transition"
                  style={{
                    border: '1px solid rgba(239,244,255,0.18)',
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = 'rgba(111,255,0,0.5)')
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = 'rgba(239,244,255,0.18)')
                  }
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={submitting || !code.trim()}
                  className="kr-num inline-flex items-center justify-center gap-2 text-[12px] uppercase tracking-widest px-5 py-3 rounded-xl transition active:scale-[0.97] disabled:opacity-40"
                  style={{
                    background: 'rgba(111,255,0,0.16)',
                    border: '1px solid rgba(111,255,0,0.5)',
                    color: 'var(--neon)',
                  }}
                >
                  {submitting ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Gift size={13} strokeWidth={2.4} />
                  )}
                  코드 사용
                </button>
              </div>

              {/* 결과 메시지 */}
              {result ? (
                <div
                  role="status"
                  className="mt-4 px-4 py-3 rounded-xl flex items-start gap-2.5 kr-body text-[13px] leading-[1.6]"
                  style={{
                    background: result.ok
                      ? 'rgba(111,255,0,0.10)'
                      : 'rgba(248,113,113,0.10)',
                    border: result.ok
                      ? '1px solid rgba(111,255,0,0.4)'
                      : '1px solid rgba(248,113,113,0.4)',
                    color: result.ok
                      ? 'rgba(196,255,128,0.95)'
                      : 'rgba(252,165,165,0.95)',
                  }}
                >
                  {result.ok ? (
                    <Check size={14} className="mt-0.5 shrink-0" />
                  ) : (
                    <X size={14} className="mt-0.5 shrink-0" />
                  )}
                  <span>{result.message}</span>
                </div>
              ) : null}
            </form>

            {/* ── 본인 grant 이력 ──────────────────────────── */}
            {grants.length > 0 ? (
              <section
                aria-label="premium 부여 이력"
                className="liquid-glass rounded-[20px] p-5 md:p-6"
              >
                <h2 className="kr-heading uppercase text-[11px] tracking-widest text-cream/55 mb-3">
                  내 premium 활성화 이력
                </h2>
                <ul className="space-y-2.5">
                  {grants.map((g) => {
                    const active = !g.revoked_at && (!g.expires_at || new Date(g.expires_at) > new Date());
                    return (
                      <li
                        key={g.id}
                        className="flex items-start gap-3 kr-body text-[12.5px] leading-[1.55]"
                      >
                        <span
                          className="mt-1 inline-block w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            background: active
                              ? 'var(--neon)'
                              : 'rgba(239,244,255,0.25)',
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-cream/85">
                            {sourceLabel(g.source)}
                            {g.source_ref ? (
                              <span className="text-cream/45 kr-num text-[11px] ml-2">
                                {g.source_ref}
                              </span>
                            ) : null}
                          </div>
                          <div className="kr-num text-[10.5px] text-cream/45 uppercase tracking-widest mt-0.5">
                            {fmtDate(g.granted_at)}
                            {g.expires_at ? (
                              <span> · 만료 {fmtDate(g.expires_at)}</span>
                            ) : (
                              <span> · 평생</span>
                            )}
                            {g.revoked_at ? (
                              <span className="text-red-300/70">
                                {' '}
                                · 회수됨 {fmtDate(g.revoked_at)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
          </>
        )}

        {!isSupabaseConfigured() ? (
          <p className="kr-body text-[11px] text-cream/45 mt-6 leading-[1.55]">
            ⚠ 환경 변수가 설정되지 않은 모드입니다. 코드 사용은 운영 환경에서만 가능해요.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function sourceLabel(source: string): string {
  switch (source) {
  case 'paid':
    return '결제 (premium 구독)';
  case 'redemption_code':
    return '초대 코드';
  case 'admin_grant':
    return '관리자 부여';
  case 'comp':
    return '운영 보상';
  default:
    return source;
  }
}

function fmtDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return iso.slice(0, 10);
  }
}

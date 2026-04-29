/**
 * LoginPage — 보호 라우트에서 redirect 된 사용자가 도착하는 전용 로그인 페이지.
 *
 * 라우트: `#/login`
 *
 * 동작:
 *   - "로그인이 필요한 페이지입니다" 안내 + AuthCard 노출
 *   - SIGNED_IN 이벤트 감지 시 `consumePendingAuthRedirect()` 호출 →
 *     원래 가려던 라우트로 자동 복귀. pending 없으면 `/game` 으로 이동.
 *   - 미로그인 상태에서 직접 `#/login` 진입 시 (보호 redirect 가 아닌 경우) 도
 *     동일하게 노출 — 그 경우 로그인 후엔 default `/game` 으로.
 *   - sessionStorage 의 redirectReason 이 'protected' 면 위쪽 안내 강조.
 */

import { useEffect, useState } from 'react';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import AuthCard from '@/game/components/AuthCard';
import VideoBg from '@/components/ui/VideoBg';
import { VIDEO_URLS } from '@/data/site';
import {
  getSupabase,
  isSupabaseConfigured,
  onAuthStateChange,
} from '@/lib/supabase';
import {
  consumePendingAuthRedirect,
  getPendingAuthRedirect,
  clearPendingAuthRedirect,
} from '@/lib/authGuard';

interface Props {
  onBack?: () => void;
}

export default function LoginPage({ onBack }: Props) {
  const [redirectReason, setRedirectReason] = useState<'protected' | null>(
    null,
  );
  const pendingTarget = getPendingAuthRedirect();

  // 진입 직후 redirectReason 1회 읽고 정리
  useEffect(() => {
    try {
      const r = window.sessionStorage.getItem('questdp.auth.redirectReason.v1');
      if (r === 'protected') {
        setRedirectReason('protected');
        window.sessionStorage.removeItem('questdp.auth.redirectReason.v1');
      }
    } catch {
      /* 무시 */
    }
  }, []);

  // 이미 로그인된 사용자가 직접 #/login 진입한 경우 → 곧장 default 또는 pending 으로
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    let cancelled = false;
    sb.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) {
        const restored = consumePendingAuthRedirect();
        if (!restored) window.location.hash = '/game';
      }
    });
    // SIGNED_IN 이벤트 — OAuth 콜백 후 발화
    const unsub = onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'SIGNED_IN' && session) {
        const restored = consumePendingAuthRedirect();
        if (!restored) window.location.hash = '/game';
      }
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

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

      <div className="relative z-10 max-w-[560px] mx-auto px-5 md:px-8 lg:px-10 pt-8 pb-16">
        <button
          type="button"
          onClick={() => {
            // 미로그인 상태에서 뒤로가면 pending 도 같이 정리
            clearPendingAuthRedirect();
            if (onBack) onBack();
            else (window.location.hash = '');
          }}
          aria-label="홈으로"
          className="inline-flex items-center gap-2 kr-heading uppercase text-[11px] tracking-widest text-cream/75 hover:text-neon transition mb-8"
        >
          <ArrowLeft size={14} strokeWidth={2.4} />
          홈으로
        </button>

        <header className="mb-8 pb-6 border-b border-cream/15">
          <div className="kr-heading uppercase text-[10px] tracking-widest text-neon/85 mb-3">
            QuestDP · LOGIN REQUIRED
          </div>
          <h1 className="kr-heading text-[28px] md:text-[36px] leading-[1.15] mb-3 flex items-center gap-3">
            <ShieldCheck size={24} className="text-neon" />
            로그인이 필요한 페이지입니다
          </h1>
          <p className="kr-body text-[14px] md:text-[15px] text-cream/70 leading-[1.65]">
            학습 로드맵·진도·친구 비교·통계 페이지는 로그인 후에만 이용할 수
            있어요. Google 계정으로 5초 안에 로그인 가능합니다.
          </p>
        </header>

        {/* 안내 — 보호 라우트에서 redirect 됐을 때 강조 */}
        {redirectReason === 'protected' ? (
          <div
            role="status"
            className="mb-6 px-4 py-3 rounded-xl flex items-start gap-2.5 kr-body text-[13px] leading-[1.6]"
            style={{
              background: 'rgba(252,211,77,0.10)',
              border: '1px solid rgba(252,211,77,0.4)',
              color: 'rgba(253,224,71,0.95)',
            }}
          >
            <Sparkles size={14} className="mt-0.5 shrink-0" />
            <span>
              {pendingTarget
                ? `로그인이 완료되면 자동으로 [${pendingTarget}] 페이지로 돌아갑니다.`
                : '로그인이 완료되면 학습 로드맵으로 이동합니다.'}
            </span>
          </div>
        ) : null}

        <AuthCard />

        {!isSupabaseConfigured() ? (
          <p className="kr-body text-[11px] text-cream/45 mt-4 leading-[1.55]">
            ⚠ 로그인 환경이 아직 설정되지 않은 모드입니다. 환경 설정 후 다시
            시도해주세요.
          </p>
        ) : null}
      </div>
    </section>
  );
}

/**
 * AuthGuard — 보호된 라우트 (학습 로드맵 등) 의 wrapping 컴포넌트.
 *
 * 동작:
 *   1. Supabase env 미설정 (게스트 모드) → 자식 그대로 렌더 (로컬 개발/오프라인 호환)
 *   2. 세션 확인 중 → 깜빡임 방지 로딩 화면
 *   3. 미로그인 → setPendingAuthRedirect(현재 hash) → 토스트 + #/login 리다이렉트
 *   4. 로그인 → 자식 렌더
 *
 * 토큰 만료 (`onAuthStateChange` 의 SIGNED_OUT 또는 TOKEN_REFRESHED 실패) 도
 * 같은 흐름으로 다시 로그인 페이지로 보냄.
 */

import { ReactNode, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  getSupabase,
  isSupabaseConfigured,
  onAuthStateChange,
} from '@/lib/supabase';
import { setPendingAuthRedirect } from '@/lib/authGuard';

type AuthState = 'checking' | 'authed' | 'guest';

interface Props {
  children: ReactNode;
  /** "로그인이 필요한 페이지입니다" 같은 토스트를 잠깐 표시. 기본 true. */
  showRedirectToast?: boolean;
}

export default function AuthGuard({
  children,
  showRedirectToast = true,
}: Props) {
  // env 미설정 = 게스트 모드 인정 — synchronous 결정 (re-render 안 거치게)
  const guestModeAllowed = !isSupabaseConfigured();

  const [state, setState] = useState<AuthState>(
    guestModeAllowed ? 'authed' : 'checking',
  );

  useEffect(() => {
    if (guestModeAllowed) return;

    const sb = getSupabase();
    if (!sb) {
      setState('guest');
      return;
    }

    let cancelled = false;

    sb.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setState(data.session ? 'authed' : 'guest');
    });

    const unsub = onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setState(session ? 'authed' : 'guest');
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [guestModeAllowed]);

  // 미로그인 → pending 라우트 보관 + #/login 으로 redirect (토스트는 LoginPage 에서 표시)
  useEffect(() => {
    if (state !== 'guest') return;
    const currentHash = window.location.hash;
    setPendingAuthRedirect(currentHash);
    if (showRedirectToast) {
      // 깜빡 토스트 — LoginPage 가 다음 화면. 여기서 잠깐 글자만 보여주고 이동.
      // (Toast 인프라 분리 전 임시 구현)
      // 별도 dispatch event 로 LoginPage 가 감지해 노출.
      try {
        window.sessionStorage.setItem(
          'questdp.auth.redirectReason.v1',
          'protected',
        );
      } catch {
        /* 무시 */
      }
    }
    // 직접 hash 변경
    window.location.hash = '/login';
  }, [state, showRedirectToast]);

  if (state === 'checking') {
    return <AuthCheckingScreen />;
  }
  if (state === 'guest') {
    // 위 useEffect 에서 hash 가 곧 /login 으로 바뀜 — 그 사이 잠깐 빈 화면
    return <AuthCheckingScreen />;
  }
  return <>{children}</>;
}

function AuthCheckingScreen() {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-cream">
      <div className="flex flex-col items-center gap-3 px-6">
        <Loader2 size={20} className="animate-spin text-cream/55" />
        <span className="kr-num text-[11px] uppercase tracking-widest text-cream/55">
          권한 확인 중…
        </span>
      </div>
    </section>
  );
}

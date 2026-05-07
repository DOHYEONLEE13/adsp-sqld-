/**
 * SlowAuthHint — 로그인 후 권한 동기화가 5초+ 걸릴 때 사용자에게 새로고침 안내.
 *
 * 배경 (2026-05-07):
 *   cold cache + 모바일 + 약한 네트워크 환경에서 Supabase JS hydration 이
 *   3초 timeout (waitForSession) 을 넘어 게스트 fallback 으로 진행되는 케이스 잔존.
 *   이 경우 사용자는 "로그인은 됐는데 권한 (PlanTag/⚡/태그) 이 안 보임" 상태로
 *   stuck → 새로고침 한 번 해야 정상화.
 *
 *   기술 레벨에서 hydration 자체를 빠르게 만드는 건 한계 있음 (Supabase JS 의존).
 *   사용자 안내로 "타협" — 5초+ 지속 시 안내 토스트 + 새로고침 버튼 노출.
 *
 * 노출 조건:
 *   1. Supabase configured
 *   2. auth.getSession() 결과 session 있음 (= 로그인 상태)
 *   3. profile.pendingServerSync === true 또는 syncStatus === 'failed'
 *      가 5초 이상 지속
 *
 * 자동 dismiss:
 *   - profile.pendingServerSync 가 false 로 바뀌면 즉시 사라짐
 *   - 사용자가 "닫기" 누르면 즉시 사라짐 (sessionStorage flag — 이번 세션 다시 안 뜸)
 *   - 사용자가 "새로고침" 누르면 window.location.reload()
 */

import { useEffect, useState } from 'react';
import { RefreshCcw, X } from 'lucide-react';
import { useMyProfile } from '@/data/profile';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const DISMISS_KEY = 'questdp.slowAuthHint.dismissed';
const SHOW_AFTER_MS = 5000;

export default function SlowAuthHint() {
  const profile = useMyProfile();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  // 1) 세션 존재 여부 확인 — 로그인 안 했으면 hint 자체 비활성
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setHasSession(false);
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      setHasSession(false);
      return;
    }
    let cancelled = false;
    void sb.auth.getSession().then(({ data }) => {
      if (!cancelled) setHasSession(!!data.session);
    });
    // SIGNED_IN 같은 이벤트로 늦게 세션 도달하는 경우도 추적
    const { data } = sb.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        setHasSession(!!session);
      }
      if (event === 'SIGNED_OUT') {
        setHasSession(false);
      }
    });
    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  // 2) 5초 이상 sync 미완료면 hint 노출
  useEffect(() => {
    if (!hasSession || dismissed) {
      setShowHint(false);
      return;
    }
    // sync 가 정상이면 hint 사라지고 timer 도 reset
    const stuck = profile.pendingServerSync || profile.syncStatus === 'failed';
    if (!stuck) {
      setShowHint(false);
      return;
    }
    // 5초 후에도 stuck 이면 hint 노출
    const timer = window.setTimeout(() => {
      setShowHint(true);
    }, SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [hasSession, dismissed, profile.pendingServerSync, profile.syncStatus]);

  if (!showHint) return null;

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowHint(false);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* private mode — 무시 */
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] max-w-[92vw] md:max-w-[420px]"
      style={{
        background: 'rgba(20,32,46,0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(103,232,249,0.35)',
        borderRadius: '14px',
        padding: '12px 14px',
        boxShadow: '0 10px 30px -8px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div
            className="kr-num text-[10px] uppercase tracking-widest mb-1"
            style={{ color: '#67e8f9' }}
          >
            로딩 안내
          </div>
          <p className="kr-body text-[12.5px] leading-[1.55] text-cream/90 mb-2.5">
            권한 표시가 평소보다 오래 걸려요. 새로고침 한 번이면 보통 즉시 적용됩니다.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="kr-num inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full transition active:scale-[0.97]"
              style={{
                background: 'rgba(103,232,249,0.18)',
                color: '#67e8f9',
                border: '1px solid rgba(103,232,249,0.45)',
              }}
            >
              <RefreshCcw size={11} strokeWidth={2.6} />
              새로고침
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="kr-num text-[11px] uppercase tracking-widest px-2 py-1.5 rounded-full text-cream/55 hover:text-cream/85 transition"
            >
              닫기
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="안내 닫기"
          className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md text-cream/45 hover:text-cream/85 hover:bg-cream/8 transition"
        >
          <X size={14} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

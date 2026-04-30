/**
 * AuthCard — Google OAuth 로그인 / 로그아웃 카드.
 *
 * 미로그인: "Google 로 시작" 버튼. 클릭 시 OAuth flow 시작.
 * 로그인: 이메일 표시 + 로그아웃 버튼. 진도 동기화 안내.
 *
 * env 미설정 (Supabase 비활성) 이면 안내 문구로 fallback.
 */

import { useEffect, useState } from 'react';
import { LogIn, LogOut, Cloud, CloudOff, Trash2 } from 'lucide-react';
import {
  deleteMyAccount,
  getSupabase,
  isSupabaseConfigured,
  signInWithOAuth,
  signOut,
  onAuthStateChange,
  type OAuthProvider,
} from '@/lib/supabase';

interface SessionLite {
  email: string;
  userId: string;
}

export default function AuthCard() {
  const [session, setSession] = useState<SessionLite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }
    // 초기 세션 fetch
    sb.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession({
          email: data.session.user.email ?? '(no email)',
          userId: data.session.user.id,
        });
      }
      setLoading(false);
    });
    // 구독
    const unsub = onAuthStateChange((_event, s) => {
      if (s) {
        setSession({
          email: s.user.email ?? '(no email)',
          userId: s.user.id,
        });
      } else {
        setSession(null);
      }
    });
    return () => {
      unsub();
    };
  }, []);

  const handleSignIn = async (provider: OAuthProvider) => {
    setLoading(true);
    const result = await signInWithOAuth(provider);
    if ((result as { error?: unknown })?.error) {
      setLoading(false);
      window.alert('로그인 실패. 잠시 후 다시 시도해주세요.');
    }
    // 성공 시엔 redirect → 콜백 후 onAuthStateChange 가 처리
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
  };

  const handleDelete = async () => {
    // 2단계 confirm — 실수 방지
    const first = window.confirm(
      '정말 계정을 삭제할까요?\n프로필·진도·친구·북마크 모두 영구 삭제됩니다.',
    );
    if (!first) return;
    const second = window.confirm(
      '되돌릴 수 없어요. 한 번 더 확인 — 정말 삭제할까요?',
    );
    if (!second) return;
    setLoading(true);
    const result = await deleteMyAccount();
    setLoading(false);
    if (result.ok) {
      window.alert('계정이 삭제됐습니다. 안녕히 가세요.');
    } else {
      window.alert(`삭제 실패: ${result.error ?? '알 수 없는 오류'}`);
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <section
        className="liquid-glass rounded-[20px] p-4 md:p-5 mb-6 flex items-center gap-3"
        style={{ border: '1px solid rgba(239,244,255,0.08)' }}
      >
        <CloudOff size={18} className="text-cream/50 shrink-0" />
        <p className="kr-body text-[12px] text-cream/65 leading-[1.55]">
          Supabase 미설정 — 로컬 모드. 진도가 이 브라우저에만 저장돼요 (캐시 삭제 시 사라짐).
        </p>
      </section>
    );
  }

  return (
    <section
      className="liquid-glass rounded-[20px] p-4 md:p-5 mb-6"
      aria-label="로그인 / 로그아웃"
    >
      {session ? (
        <div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full"
                style={{ background: 'rgba(111,255,0,0.12)', border: '1px solid rgba(111,255,0,0.4)' }}
              >
                <Cloud size={14} className="text-neon" />
              </span>
              <div className="min-w-0">
                <div className="kr-num text-[10px] uppercase tracking-widest text-neon">
                  동기화 중
                </div>
                <div className="kr-num text-[12px] text-cream/85 truncate max-w-[220px]">
                  {session.email}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={loading}
              className="kr-num inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full transition active:scale-95 disabled:opacity-40"
              style={{
                background: 'rgba(239,244,255,0.06)',
                border: '1px solid rgba(239,244,255,0.18)',
                color: 'var(--cream)',
              }}
            >
              <LogOut size={11} strokeWidth={2.4} />
              로그아웃
            </button>
          </div>
          {/* 탈퇴 — 매우 작은 ghost 링크. 의도적으로 눈에 안 띄게. */}
          <div className="mt-3 pt-3 border-t border-cream/8">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="kr-body text-[10.5px] inline-flex items-center gap-1 transition opacity-50 hover:opacity-90 disabled:opacity-30"
              style={{ color: 'rgba(248,113,113,0.85)' }}
            >
              <Trash2 size={10} strokeWidth={2} />
              계정 영구 삭제 (모든 데이터 사라짐)
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CloudOff size={14} className="text-cream/50" />
            <span className="kr-num text-[10px] uppercase tracking-widest text-cream/55">
              게스트 모드 — 진도가 이 브라우저에만 저장 (캐시 삭제 시 사라짐)
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleSignIn('google')}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2.5 kr-num text-[13px] py-2.5 rounded-full transition active:scale-[0.98] disabled:opacity-40"
            style={{
              background: '#fff',
              color: '#1a1f33',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            <GoogleLogo />
            <span style={{ fontWeight: 500 }}>Google 로 시작</span>
            <LogIn size={12} strokeWidth={2.4} />
          </button>
          <p className="kr-body text-[11px] text-cream/50 mt-2 leading-[1.55]">
            로그인하면 친구 리더보드 + 다른 기기 진도 동기화 활성화.
          </p>
        </div>
      )}
    </section>
  );
}

function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

import { useState } from 'react';
import { Cloud, CloudOff, LogIn, LogOut, Trash2 } from 'lucide-react';
import {
  DEV_TEST_LOGIN_AVAILABLE,
  deleteMyAccount,
  isSupabaseConfigured,
  signInWithDevTestAccount,
  signInWithOAuth,
  signOut,
  type OAuthProvider,
} from '@/lib/supabase';
import { useAuthSession } from '@/lib/auth/sessionStore';

type PendingAction = 'sign-in' | 'sign-out' | 'delete' | null;

export default function AuthCard() {
  const auth = useAuthSession();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const session = auth.session
    ? {
        email: auth.session.user.email ?? '(no email)',
        userId: auth.session.user.id,
      }
    : null;
  const busy = pendingAction !== null || auth.status === 'checking';

  const handleSignIn = async (provider: OAuthProvider) => {
    if (busy) return;
    setPendingAction('sign-in');
    const result = await signInWithOAuth(provider);
    if ((result as { error?: unknown })?.error) {
      setPendingAction(null);
      window.alert('로그인에 실패했어요. 잠시 뒤 다시 시도해주세요.');
    }
  };

  const handleDevSignIn = async () => {
    if (busy) return;
    setPendingAction('sign-in');
    const result = await signInWithDevTestAccount();
    setPendingAction(null);
    if (!result.ok) {
      window.alert(`테스트 로그인 실패: ${result.error ?? '알 수 없는 오류'}`);
    }
  };

  const handleSignOut = async () => {
    setPendingAction('sign-out');
    await signOut();
    setPendingAction(null);
  };

  const handleDelete = async () => {
    const first = window.confirm(
      '정말 계정을 삭제할까요?\n진도, 친구, 북마크가 모두 영구 삭제됩니다.',
    );
    if (!first) return;
    const second = window.confirm(
      '되돌릴 수 없습니다. 한 번 더 확인할게요. 정말 삭제할까요?',
    );
    if (!second) return;

    setPendingAction('delete');
    const result = await deleteMyAccount();
    setPendingAction(null);
    if (result.ok) {
      window.alert('계정이 삭제되었습니다.');
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
          로그인 환경이 아직 설정되지 않았습니다. 현재 기기의 임시 기록만 사용할 수 있어요.
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
                style={{
                  background: 'var(--neon-12)',
                  border: '1px solid var(--neon-40)',
                }}
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
              disabled={busy}
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
          <div className="mt-3 pt-3 border-t border-cream/8">
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="kr-body text-[10.5px] inline-flex items-center gap-1 transition opacity-50 hover:opacity-90 disabled:opacity-30"
              style={{ color: 'rgba(248,113,113,0.85)' }}
            >
              <Trash2 size={10} strokeWidth={2} />
              계정 영구 삭제
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CloudOff size={14} className="text-cream/50" />
            <span className="kr-num text-[10px] uppercase tracking-widest text-cream/55">
              로그인하면 진도와 친구 비교가 기기 사이에 동기화됩니다.
            </span>
          </div>
          <button
            type="button"
            onClick={() => void handleSignIn('google')}
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2.5 kr-num text-[13px] py-2.5 rounded-full transition active:scale-[0.98] disabled:opacity-40"
            style={{
              background: '#fff',
              color: '#1a1f33',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            <GoogleLogo />
            <span style={{ fontWeight: 500 }}>
              {auth.status === 'checking' ? '로그인 확인 중' : 'Google로 시작'}
            </span>
            <LogIn size={12} strokeWidth={2.4} />
          </button>
          <p className="kr-body text-[11px] text-cream/50 mt-2 leading-[1.55]">
            새로고침 없이 로그인 직후 같은 기록으로 이어갑니다.
          </p>
          {import.meta.env.DEV && DEV_TEST_LOGIN_AVAILABLE ? (
            <button
              type="button"
              onClick={() => void handleDevSignIn()}
              disabled={busy}
              data-dev-test-login="true"
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 kr-num text-[11px] uppercase tracking-widest py-2 rounded-full transition active:scale-[0.98] disabled:opacity-40"
              style={{
                background: 'rgba(239,244,255,0.05)',
                border: '1px dashed rgba(239,244,255,0.25)',
                color: 'rgba(239,244,255,0.7)',
              }}
            >
              테스트 계정 로그인 (DEV 전용)
            </button>
          ) : null}
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


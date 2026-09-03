import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, LockKeyhole, Mail } from 'lucide-react';
import AuthCard from '@/game/components/AuthCard';
import VideoBg from '@/components/ui/VideoBg';
import { VIDEO_URLS } from '@/data/site';
import Ques from '@/components/mascot/Ques';
import { isSupabaseConfigured, signInWithPassword } from '@/lib/supabase';
import {
  clearPendingAuthRedirect,
  consumePendingAuthRedirect,
  getPendingAuthRedirect,
} from '@/lib/authGuard';
import { useAuthSession } from '@/lib/auth/sessionStore';
import { isAppMode } from '@/lib/appMode';

interface Props {
  onBack?: () => void;
}

export default function LoginPage({ onBack }: Props) {
  const auth = useAuthSession();
  const appMode = isAppMode();
  const [redirectReason, setRedirectReason] = useState<'protected' | null>(null);
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewPassword, setReviewPassword] = useState('');
  const [reviewPending, setReviewPending] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const pendingTarget = getPendingAuthRedirect();
  const reviewMode = new URLSearchParams(
    window.location.hash.split('?')[1] ?? '',
  ).get('review') === '1';

  const handleReviewLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (reviewPending || !reviewEmail || !reviewPassword) return;
    setReviewPending(true);
    setReviewError('');
    const { error } = await signInWithPassword(reviewEmail, reviewPassword);
    if (error) {
      setReviewError('이메일 또는 비밀번호를 확인해 주세요.');
      setReviewPending(false);
    }
  };

  useEffect(() => {
    try {
      const reason = window.sessionStorage.getItem(
        'questdp.auth.redirectReason.v1',
      );
      if (reason === 'protected') {
        setRedirectReason('protected');
        window.sessionStorage.removeItem('questdp.auth.redirectReason.v1');
      }
    } catch {
      /* ignore private-mode storage failures */
    }
  }, []);

  useEffect(() => {
    if (auth.status !== 'authenticated') return;
    const restored = consumePendingAuthRedirect();
    if (!restored) window.location.hash = '/home';
  }, [auth.status, auth.session?.user.id]);

  return (
    <section className="relative min-h-screen isolate overflow-hidden text-cream">
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
        {!appMode ? (
          <button
            type="button"
            onClick={() => {
              clearPendingAuthRedirect();
              if (onBack) onBack();
              else window.location.hash = '';
            }}
            aria-label="뒤로가기"
            className="inline-flex items-center gap-2 kr-heading uppercase text-[11px] tracking-widest text-cream/75 hover:text-neon transition mb-6"
          >
            <ArrowLeft size={14} strokeWidth={2.4} />
            뒤로
          </button>
        ) : null}

        <header
          className={`flex flex-col items-center text-center mb-8 pb-6 border-b border-cream/15 ${
            appMode ? 'pt-4' : ''
          }`}
        >
          <Ques pose="wave" size={140} />
          <h1 className="kr-heading text-[26px] md:text-[32px] leading-[1.2] mt-5">
            {reviewMode ? '심사용 계정 로그인' : '먼저 로그인해주세요'}
          </h1>
          <p className="kr-body text-[13.5px] md:text-[14.5px] text-cream/70 leading-[1.65] mt-3 max-w-[420px]">
            {reviewMode
              ? '담당자에게 전달받은 이메일과 비밀번호로 로그인해 결제 경로와 서비스를 확인할 수 있습니다.'
              : 'Google 계정으로 5초만에 시작할 수 있어요. 진도, 친구 비교, 통계가 기기 사이에 동기화돼요.'}
            {redirectReason === 'protected' && pendingTarget ? (
              <>
                <br />
                <span className="text-cream/55">
                  로그인 후 <span className="text-neon">{pendingTarget}</span>
                  {' '}페이지로 자동 복귀합니다.
                </span>
              </>
            ) : null}
          </p>
        </header>

        {reviewMode ? (
          <form
            onSubmit={handleReviewLogin}
            className="liquid-glass rounded-[20px] p-5 md:p-6 space-y-4"
            aria-label="심사용 계정 로그인"
          >
            <label className="block">
              <span className="kr-body mb-2 flex items-center gap-2 text-[12px] text-cream/70">
                <Mail size={14} aria-hidden /> 이메일
              </span>
              <input
                type="email"
                value={reviewEmail}
                onChange={(event) => setReviewEmail(event.target.value)}
                autoComplete="username"
                required
                className="kr-body w-full rounded-xl border border-cream/15 bg-cream/[0.06] px-4 py-3 text-[14px] text-cream outline-none focus:border-neon/60"
              />
            </label>
            <label className="block">
              <span className="kr-body mb-2 flex items-center gap-2 text-[12px] text-cream/70">
                <LockKeyhole size={14} aria-hidden /> 비밀번호
              </span>
              <input
                type="password"
                value={reviewPassword}
                onChange={(event) => setReviewPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="kr-body w-full rounded-xl border border-cream/15 bg-cream/[0.06] px-4 py-3 text-[14px] text-cream outline-none focus:border-neon/60"
              />
            </label>
            {reviewError ? (
              <p role="alert" className="kr-body text-[12px] text-[#ffbcbc]">
                {reviewError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={reviewPending || !reviewEmail || !reviewPassword}
              className="kr-body inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-cream px-4 text-[13px] font-bold text-base transition active:scale-[0.99] disabled:opacity-45"
            >
              {reviewPending ? <Loader2 size={15} className="animate-spin" aria-hidden /> : null}
              로그인
            </button>
            <button
              type="button"
              onClick={() => { window.location.hash = '/login'; }}
              className="kr-body w-full text-center text-[11.5px] text-cream/50 hover:text-cream/75"
            >
              일반 Google 로그인으로 돌아가기
            </button>
          </form>
        ) : (
          <AuthCard />
        )}

        {!isSupabaseConfigured() ? (
          <p className="kr-body text-[11px] text-cream/45 mt-4 leading-[1.55] text-center">
            로그인 환경이 아직 설정되지 않았습니다. 환경 설정 후 다시 시도해주세요.
          </p>
        ) : null}
      </div>
    </section>
  );
}

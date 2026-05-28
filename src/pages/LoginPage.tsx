import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import AuthCard from '@/game/components/AuthCard';
import VideoBg from '@/components/ui/VideoBg';
import { VIDEO_URLS } from '@/data/site';
import Ques from '@/components/mascot/Ques';
import { isSupabaseConfigured } from '@/lib/supabase';
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
  const pendingTarget = getPendingAuthRedirect();

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
    if (!restored) window.location.hash = '/game';
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
            먼저 로그인해주세요
          </h1>
          <p className="kr-body text-[13.5px] md:text-[14.5px] text-cream/70 leading-[1.65] mt-3 max-w-[420px]">
            Google 계정으로 5초만에 시작할 수 있어요. 진도, 친구 비교,
            통계가 기기 사이에 동기화돼요.
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

        <AuthCard />

        {!isSupabaseConfigured() ? (
          <p className="kr-body text-[11px] text-cream/45 mt-4 leading-[1.55] text-center">
            로그인 환경이 아직 설정되지 않았습니다. 환경 설정 후 다시 시도해주세요.
          </p>
        ) : null}
      </div>
    </section>
  );
}

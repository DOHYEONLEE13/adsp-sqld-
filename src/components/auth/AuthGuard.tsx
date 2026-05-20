import { ReactNode, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { setPendingAuthRedirect } from '@/lib/authGuard';
import { useAuthSession } from '@/lib/auth/sessionStore';

type AuthState = 'checking' | 'authed' | 'guest';

interface Props {
  children: ReactNode;
  showRedirectToast?: boolean;
}

export default function AuthGuard({
  children,
  showRedirectToast = true,
}: Props) {
  const guestModeAllowed = !isSupabaseConfigured();
  const auth = useAuthSession();
  const state: AuthState = guestModeAllowed
    ? 'authed'
    : auth.status === 'authenticated'
      ? 'authed'
      : auth.status === 'checking'
        ? 'checking'
        : 'guest';

  useEffect(() => {
    if (state !== 'guest') return;

    const currentHash = window.location.hash;
    setPendingAuthRedirect(currentHash);

    if (showRedirectToast) {
      try {
        window.sessionStorage.setItem(
          'questdp.auth.redirectReason.v1',
          'protected',
        );
      } catch {
        /* ignore private-mode storage failures */
      }
    }

    if (!window.location.hash.startsWith('#/login')) {
      window.location.hash = '/login';
    }
  }, [state, showRedirectToast]);

  if (state === 'checking' || state === 'guest') {
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
          권한 확인 중...
        </span>
      </div>
    </section>
  );
}


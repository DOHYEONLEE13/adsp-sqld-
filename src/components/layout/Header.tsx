import { useEffect, useState } from 'react';
import { LogIn, LogOut, Shield } from 'lucide-react';
import { BRAND } from '@/data/site';
import { NAV_LINKS } from '@/data/nav';
import {
  getSupabase,
  isSupabaseConfigured,
  onAuthStateChange,
  signInWithOAuth,
  signOut,
} from '@/lib/supabase';
import { useMyProfile } from '@/data/profile';

export default function Header() {
  return (
    <div className="flex items-center justify-between gap-3 md:gap-4">
      <Logo />
      <div className="hidden md:block">
        <Nav />
      </div>
      <div className="flex items-center gap-2">
        <AdminLink />
        <AuthButton />
      </div>
    </div>
  );
}

/** admin 일 때만 노출되는 운영자 페이지 진입 버튼. */
function AdminLink() {
  const profile = useMyProfile();
  if (!profile.isAdmin) return null;
  return (
    <a
      href="#/admin"
      aria-label="운영자 페이지"
      title="운영자 페이지"
      className="kr-heading inline-flex items-center gap-1.5 uppercase tracking-widest text-[10px] md:text-[11px] px-3 py-2 md:py-2.5 rounded-full transition hover:scale-[1.03]"
      style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #FD802E 100%)',
        color: '#0a0f1f',
        boxShadow: '0 6px 18px -4px rgba(245,158,11,0.55)',
      }}
    >
      <Shield size={11} strokeWidth={2.6} />
      <span className="hidden sm:inline">Admin</span>
    </a>
  );
}

function Logo() {
  return (
    <a
      href="#"
      aria-label="홈으로"
      className="kr-heading uppercase text-[15px] md:text-[16px] tracking-wider hover:text-neon transition-colors"
    >
      {BRAND.logoLeft}
      <span className="text-neon">{BRAND.separator}</span>
      {BRAND.logoRight}
    </a>
  );
}

function Nav() {
  return (
    <nav
      aria-label="주요 메뉴"
      className="liquid-glass rounded-[28px] px-5 py-3 md:px-7 md:py-3.5 lg:px-10 lg:py-4"
    >
      <ul className="flex gap-4 md:gap-6 lg:gap-8 list-none m-0 p-0">
        {NAV_LINKS.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="kr-body font-bold text-[12px] md:text-[13px] whitespace-nowrap transition-colors hover:text-neon"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * 헤더 우측의 로그인/로그아웃 버튼.
 *
 * - Supabase 미설정 시: 게스트 모드 — "지금 시작" 버튼 (게임 직진).
 * - 비로그인: "로그인" 버튼 (Google OAuth).
 * - 로그인 후: 이메일 + 로그아웃 아이콘.
 */
function AuthButton() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      if (data.session) setEmail(data.session.user.email ?? null);
    });
    const unsub = onAuthStateChange((_event, s) => {
      setEmail(s?.user.email ?? null);
    });
    return () => unsub();
  }, []);

  // Supabase 미설정 → 게스트 진입 버튼
  if (!isSupabaseConfigured()) {
    return (
      <a
        href="#/game"
        className="kr-heading inline-flex items-center gap-1.5 uppercase tracking-widest text-[11px] md:text-[12px] px-4 md:px-5 py-2.5 md:py-3 rounded-full transition hover:scale-[1.03]"
        style={{
          background: '#FD802E',
          color: '#0a0f1f',
          boxShadow: '0 8px 24px -6px rgba(253,128,46,0.55)',
        }}
      >
        지금 시작
      </a>
    );
  }

  if (email) {
    return (
      <button
        type="button"
        onClick={async () => {
          setLoading(true);
          await signOut();
          setLoading(false);
        }}
        disabled={loading}
        aria-label="로그아웃"
        className="kr-heading inline-flex items-center gap-1.5 uppercase tracking-widest text-[10px] md:text-[11px] px-3 md:px-4 py-2 md:py-2.5 rounded-full border border-cream/25 hover:bg-cream/10 transition disabled:opacity-40"
      >
        <LogOut size={12} strokeWidth={2.4} />
        <span className="hidden sm:inline truncate max-w-[120px]">{email}</span>
        <span className="sm:hidden">로그아웃</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        setLoading(true);
        const result = await signInWithOAuth('google');
        if ((result as { error?: unknown })?.error) {
          window.alert('로그인 실패. 잠시 후 다시 시도해주세요.');
        }
        setLoading(false);
      }}
      disabled={loading}
      className="kr-heading inline-flex items-center gap-1.5 uppercase tracking-widest text-[11px] md:text-[12px] px-4 md:px-5 py-2.5 md:py-3 rounded-full transition hover:scale-[1.03] disabled:opacity-50"
      style={{
        background: '#FD802E',
        color: '#0a0f1f',
        boxShadow: '0 8px 24px -6px rgba(253,128,46,0.55)',
      }}
    >
      <LogIn size={13} strokeWidth={2.4} />
      로그인
    </button>
  );
}

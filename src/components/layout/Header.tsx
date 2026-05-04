import { useEffect, useState } from 'react';
import { LogIn, LogOut, Menu, Shield, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { BRAND } from '@/data/site';
import { NAV_LINKS_MAIN, NAV_LINKS_SUPPORT } from '@/data/nav';
import type { NavLink } from '@/types/site';
import {
  getSupabase,
  isSupabaseConfigured,
  onAuthStateChange,
  signInWithOAuth,
  signOut,
} from '@/lib/supabase';
import { useMyProfile } from '@/data/profile';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // ESC + body scroll lock 동안 메뉴만 스크롤. unmount 시 원복.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <>
      <div className="flex items-center justify-between gap-3 md:gap-4">
        <Logo />
        <div className="flex items-center gap-2">
          <AdminLink />
          <AuthButton />
          {/* 햄버거 — 클릭 시 카테고리 패널 슬라이드다운 */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="메뉴 열기"
            aria-expanded={menuOpen}
            className="inline-flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full liquid-glass hover:bg-white/10 transition active:scale-95 text-cream/85"
          >
            <Menu size={20} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <MenuOverlay onClose={() => setMenuOpen(false)} />
        ) : null}
      </AnimatePresence>
    </>
  );
}

/**
 * 햄버거 클릭 시 위에서 슬라이드다운하는 카테고리 패널.
 * 닫기: × 버튼 / backdrop / ESC / 링크 클릭.
 */
function MenuOverlay({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Backdrop — 클릭 닫기 */}
      <motion.button
        type="button"
        onClick={onClose}
        aria-label="메뉴 닫기"
        className="fixed inset-0 z-[60] bg-base/70 backdrop-blur-sm cursor-default"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* 슬라이드다운 패널 */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="메뉴"
        className="fixed top-0 left-0 right-0 z-[61]"
        initial={{ y: '-100%' }}
        animate={{ y: 0 }}
        exit={{ y: '-100%' }}
        transition={{ type: 'tween', duration: 0.3, ease: [0.18, 0.9, 0.4, 1] }}
      >
        <div
          className="max-w-layout mx-auto px-6 md:px-12 py-7 md:py-9"
          style={{
            background: 'rgba(1,8,40,0.95)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            borderBottom: '1px solid rgba(239,244,255,0.10)',
            boxShadow: '0 16px 40px -10px rgba(0,0,0,0.55)',
          }}
        >
          {/* 패널 헤더 — 라벨 + 닫기 */}
          <div className="flex items-center justify-between mb-6">
            <span className="kr-heading uppercase tracking-widest text-[11px] text-cream/55">
              메뉴
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="메뉴 닫기"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition active:scale-95 text-cream/75"
            >
              <X size={18} strokeWidth={2.4} />
            </button>
          </div>

          {/* 서비스 섹션 */}
          <NavSection
            title="서비스"
            links={NAV_LINKS_MAIN}
            onClickLink={onClose}
          />

          {/* 지원 섹션 */}
          <div className="mt-5">
            <NavSection
              title="지원"
              links={NAV_LINKS_SUPPORT}
              onClickLink={onClose}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
}

/**
 * admin 일 때만 노출되는 운영자 페이지 진입 버튼.
 *
 * 다층 검증 — localStorage 캐시 (`useMyProfile().isAdmin`) 가 stale 일 수 있어
 * 마운트 시 server 에 직접 한 번 더 fetch 해서 admin 여부 확인.
 * 둘 중 하나라도 admin 이면 노출.
 */
function AdminLink() {
  const profile = useMyProfile();
  const [serverAdmin, setServerAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setServerAdmin(false);
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      setServerAdmin(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data: sess } = await sb.auth.getSession();
        if (cancelled) return;
        if (!sess.session) {
          setServerAdmin(false);
          return;
        }
        const { data } = await sb
          .from('profiles')
          .select('role')
          .eq('id', sess.session.user.id)
          .maybeSingle();
        if (cancelled) return;
        setServerAdmin(data?.role === 'admin');
      } catch {
        if (!cancelled) setServerAdmin(false);
      }
    })();
    // 로그인/로그아웃 시 재확인
    const unsub = onAuthStateChange(async (_event, session) => {
      if (!session) {
        setServerAdmin(false);
        return;
      }
      const { data } = await sb
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();
      if (!cancelled) setServerAdmin(data?.role === 'admin');
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const isAdmin = profile.isAdmin || serverAdmin === true;
  if (!isAdmin) return null;
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
      aria-label={`${BRAND.nameEn} 홈으로`}
      className="inline-flex items-center gap-2.5 group select-none"
    >
      {/* 로고 마크 — 토리 mascot headshot roundel.
          rounded-full 로 PNG 의 흰색 사각 모서리 잘라냄. */}
      <img
        src="/logo/questdp-mark.png"
        alt=""
        width={44}
        height={44}
        draggable={false}
        className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full transition-transform group-hover:scale-105 group-hover:rotate-[-4deg]"
      />
      {/* 워드마크 — Sora ExtraBold (.logo-wordmark) + DP 만 neon accent */}
      <span className="logo-wordmark uppercase text-[22px] md:text-[28px] leading-none">
        <span className="text-cream group-hover:text-neon transition-colors">
          Quest
        </span>
        <span className="text-neon">DP</span>
      </span>
    </a>
  );
}

/**
 * 한 섹션 (서비스 / 지원) 의 라벨 + cell 리스트.
 * 외부 링크 (mailto:, 다른 도메인) 는 새 탭으로 열고, hash 링크는 같은 탭.
 */
function NavSection({
  title,
  links,
  onClickLink,
}: {
  title: string;
  links: NavLink[];
  onClickLink: () => void;
}) {
  return (
    <>
      <h3 className="kr-heading uppercase tracking-widest text-[10px] text-cream/45 mb-2 px-1">
        {title}
      </h3>
      <ul className="flex flex-col gap-2 list-none m-0 p-0">
        {links.map((link) => {
          const isExternal =
            link.href.startsWith('mailto:') ||
            link.href.startsWith('http');
          return (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={onClickLink}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="block kr-heading uppercase tracking-widest text-[14px] md:text-[15px] py-4 px-5 rounded-[16px] border border-cream/10 bg-white/[0.03] text-cream/90 hover:bg-white/[0.08] hover:text-neon hover:border-neon/40 transition"
              >
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    </>
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

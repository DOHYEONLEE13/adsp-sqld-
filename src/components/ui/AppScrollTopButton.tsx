import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { isAppMode } from '@/lib/appMode';

const GAME_HASH_RE = /^#\/(game|quests|weakness|friends|stats|settings|bookmarks)/;

function shouldRenderScrollButton(): boolean {
  if (typeof window === 'undefined') return false;
  if (isAppMode()) return true;
  if (window.innerWidth > 640) return false;
  return GAME_HASH_RE.test(window.location.hash);
}

export default function AppScrollTopButton() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const nextEnabled = shouldRenderScrollButton();
      setEnabled(nextEnabled);
      setVisible(nextEnabled && window.scrollY > 420);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('hashchange', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('hashchange', update);
    };
  }, []);

  if (!enabled || !visible) return null;

  return (
    <button
      type="button"
      aria-label="맨 위로 이동"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed right-3 z-[45] inline-flex h-12 w-12 items-center justify-center rounded-full transition hover:brightness-110 active:scale-95"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 86px)',
        color: 'var(--cream)',
        background:
          'linear-gradient(180deg, rgba(15,25,50,0.92), rgba(8,14,36,0.84))',
        border: '1px solid rgba(209,248,67,0.42)',
        boxShadow:
          '0 18px 44px rgba(0,0,0,0.44), 0 0 18px rgba(209,248,67,0.18), inset 0 1px 0 rgba(255,255,255,0.12)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-full"
        style={{
          background: 'rgba(209,248,67,0.12)',
          color: 'var(--neon)',
        }}
      >
        <ArrowUp size={20} strokeWidth={2.7} />
      </span>
    </button>
  );
}

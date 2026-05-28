import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { isAppMode } from '@/lib/appMode';

export default function AppScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isAppMode()) return;

    const update = () => {
      setVisible(window.scrollY > 420);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  if (!visible || !isAppMode()) return null;

  return (
    <button
      type="button"
      aria-label="맨 위로 이동"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed right-4 z-[35] inline-flex h-11 w-11 items-center justify-center rounded-full transition active:scale-95"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 92px)',
        color: 'var(--cream)',
        background:
          'linear-gradient(180deg, rgba(239,244,255,0.14), rgba(239,244,255,0.07))',
        border: '1px solid rgba(239,244,255,0.18)',
        boxShadow:
          '0 18px 44px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.12)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <ArrowUp size={19} strokeWidth={2.5} />
    </button>
  );
}

import { lazy, Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AuthGuard from './auth/AuthGuard';
import {
  SETTINGS_DRAWER_EVENT,
  setSettingsDrawerOpen,
} from '@/lib/settingsDrawer';

const SettingsPage = lazy(() => import('@/game/SettingsPage'));

const DRAWER_FALLBACK = (
  <div className="min-h-dvh px-6 pt-8 text-cream">
    <div className="h-4 w-24 rounded-full bg-cream/10" />
    <div className="mt-8 h-8 w-36 rounded-full bg-cream/10" />
    <div className="mt-6 space-y-3">
      <div className="h-16 rounded-[14px] bg-cream/8" />
      <div className="h-28 rounded-[14px] bg-cream/8" />
      <div className="h-28 rounded-[14px] bg-cream/8" />
    </div>
  </div>
);

export default function SettingsDrawer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener(SETTINGS_DRAWER_EVENT, handleOpen);
    return () => window.removeEventListener(SETTINGS_DRAWER_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    setSettingsDrawerOpen(open);
    return () => setSettingsDrawerOpen(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[160]" role="dialog" aria-modal="true">
          <motion.button
            type="button"
            aria-label="설정 닫기"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="absolute right-0 top-0 h-dvh w-[calc(100vw-32px)] max-w-[420px] overflow-y-auto bg-[#081642] shadow-[-20px_0_50px_rgba(0,0,0,0.42)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
          >
            <AuthGuard>
              <Suspense fallback={DRAWER_FALLBACK}>
                <SettingsPage embedded onExit={() => setOpen(false)} />
              </Suspense>
            </AuthGuard>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

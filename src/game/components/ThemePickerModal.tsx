/**
 * ThemePickerModal — SettingsPage 에서 "배경 테마 변경" 클릭 시 노출되는 팝업.
 *
 * 내부 ThemePicker 컴포넌트를 그대로 재사용 (cards + 적용 버튼). 모달 오버레이 +
 * 닫기 버튼만 추가. Portal 으로 document.body 마운트 — backdrop-filter stacking
 * context 회피.
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import ThemePicker from './ThemePicker';

interface Props {
  onClose: () => void;
}

export default function ThemePickerModal({ onClose }: Props) {
  // ESC 로 닫기.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const node = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-picker-modal-title"
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6"
      style={{ background: 'rgba(1,8,40,0.78)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-[440px] max-h-[90vh] overflow-y-auto rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-3 right-3 z-10 w-8 h-8 inline-flex items-center justify-center rounded-full transition active:scale-95"
          style={{
            background: 'rgba(20,32,46,0.85)',
            border: '1px solid rgba(239,244,255,0.18)',
          }}
        >
          <X size={14} className="text-cream" strokeWidth={2.4} />
        </button>
        <div id="theme-picker-modal-title" className="sr-only">
          배경 테마 선택
        </div>
        <ThemePicker />
      </motion.div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(node, document.body);
}

/**
 * DevUnlockBadge — admin 검수 모드 ON 인 동안 화면 상단에 항상 노출되는 배지.
 *
 * 목적: 검수 모드가 활성화돼 있다는 사실을 모든 페이지에서 즉각 인지하게.
 * 토글이 켜져있는데 작동 안 한다고 오해하는 일 방지 + 운영 후 OFF 잊는 일 방지.
 */

import { Unlock } from 'lucide-react';
import { useDevUnlockFlags, setDevUnlockFlags } from '@/game/useDevUnlockFlags';

export default function DevUnlockBadge() {
  const flags = useDevUnlockFlags();
  if (!flags.any) return null;

  const handleTurnOff = () => {
    setDevUnlockFlags({ passes: false, steps: false });
  };

  return (
    <div
      className="fixed top-2 left-1/2 -translate-x-1/2 z-[60] inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full kr-heading uppercase text-[10px] tracking-widest"
      style={{
        background: 'rgba(111,255,0,0.92)',
        color: 'var(--base)',
        boxShadow: '0 4px 16px rgba(111,255,0,0.4)',
        border: '1px solid rgba(111,255,0,1)',
      }}
      aria-label="검수 모드 활성"
    >
      <Unlock size={11} strokeWidth={2.6} />
      <span>검수 모드 ON</span>
      <button
        type="button"
        onClick={handleTurnOff}
        className="ml-1 px-1.5 py-0.5 rounded-full text-[9px]"
        style={{
          background: 'rgba(1,8,40,0.85)',
          color: '#6FFF00',
        }}
      >
        OFF
      </button>
    </div>
  );
}

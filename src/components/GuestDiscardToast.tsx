/**
 * GuestDiscardToast — 게스트 → 기존 계정 로그인 시 게스트 진도가 폐기됐음을
 * 사용자에게 한 번 알림.
 *
 * 트리거: progressSync.handleAuthChange 가 'reset' 결정 시 두 가지 신호 발산:
 *  1) sessionStorage 'questdp.guestDiscardToast' 마킹 — 새로고침 직후에도 노출
 *  2) window 'questdp:guest-discarded' CustomEvent — 같은 세션에서 즉시 노출
 *
 * 본 컴포넌트는 mount 시 sessionStorage 체크 + CustomEvent 구독으로 두 경로 모두
 * 처리. 한 번 노출 후 sessionStorage 키 제거.
 *
 * App.tsx 의 ToastProvider 내부에 mount 되어야 useToast 가 작동.
 */

import { useEffect } from 'react';
import { useToast } from './ui/Toast';

const STORAGE_KEY = 'questdp.guestDiscardToast';
const TOAST_TEXT =
  '기존 계정 데이터로 동기화됐어요. 게스트로 푼 진도는 보존되지 않습니다.';

export default function GuestDiscardToast() {
  const { show } = useToast();

  useEffect(() => {
    // (1) mount 직후 sessionStorage 체크 — 페이지 새로고침으로 들어온 케이스
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) === '1') {
        show({ kind: 'info', text: TOAST_TEXT, durationMs: 6000 });
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* 무시 */
    }

    // (2) 같은 세션 내 SIGNED_IN → reset 결정 시 즉시 노출
    const onDiscard = () => {
      show({ kind: 'info', text: TOAST_TEXT, durationMs: 6000 });
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* 무시 */
      }
    };
    window.addEventListener('questdp:guest-discarded', onDiscard);
    return () => window.removeEventListener('questdp:guest-discarded', onDiscard);
  }, [show]);

  return null;
}

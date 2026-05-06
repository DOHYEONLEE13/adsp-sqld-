/**
 * lastActive — 사용자의 마지막 앱 활성 시각 추적.
 *
 * Phase 4 Step 4 — 망각 곡선 미접속 처리 입력.
 *
 * 정책 (사용자 결정):
 *   - 어느 페이지든 진입 = 활성 (lastActiveAt 갱신)
 *   - 단순 페이지 진입만으로 활성 인정 (실제 학습 안 해도)
 *   - localStorage 기반 (Step 5/6 에서 profiles.last_active_at 으로 전환)
 */

const STORAGE_KEY = 'questdp.lastActiveAt';

/** 마지막 활성 시각 갱신 — 페이지 진입 시 호출. */
export function markActive(now: number = Date.now()): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(now));
  } catch {
    // quota — silent fail
  }
}

/** 마지막 활성 시각 조회. 없으면 null. */
export function getLastActive(): Date | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const ms = Number(raw);
    if (Number.isNaN(ms) || ms <= 0) return null;
    return new Date(ms);
  } catch {
    return null;
  }
}

/** 미접속 일수 계산 — 0~. last_active 없으면 999 (신규 사용자). */
export function inactivityDays(now: number = Date.now()): number {
  const last = getLastActive();
  if (!last) return 0; // 신규 — 0일 (알림 없음)
  const days = Math.floor((now - last.getTime()) / (24 * 60 * 60 * 1000));
  return Math.max(0, days);
}

/** 클리어 (테스트 또는 사용자 reset). */
export function clearLastActive(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

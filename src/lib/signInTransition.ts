/**
 * signInTransition.ts — 게스트 → 로그인 전환 시 데이터 손실 방지.
 *
 * ⚠️ 사고 컨텍스트 (2026-05-04):
 * 게스트로 플레이 후 기존 계정으로 로그인 → server 데이터가 게스트 localStorage
 * 데이터로 contaminate 되는 critical 버그.
 *
 * 원인 (progressSync.handleAuthChange):
 *   if (last && last !== userId) { resetProgress() }
 *   ↑ last 가 null (게스트 — never logged in 또는 logged out) 이면 reset 안 됨.
 *   → guest localStorage 가 살아있는 채로 pull 진입
 *   → mergeProgress 가 max(server, guest) / newer-wins 정책으로 guest 데이터를
 *     local 에 흡수
 *   → 다음 user action (recordSingleAnswer 등) 의 push 가 contaminated 값을
 *     server 에 PUT-style 로 덮어씀 → 서버 데이터 손상
 *
 * 정책 결정:
 * - 신규 계정 (server 비어있음) + 게스트 진도 있음 → migration scenario (게스트
 *   진도를 새 계정에 마이그레이트). migrate.ts 가 처리.
 * - 기존 계정 (server 에 데이터 있음) + 게스트 진도 있음 → guest 진도 discard.
 *   server 가 진실의 근원. 사용자에게 토스트로 안내.
 * - 같은 사용자 재로그인 (last === userId) → 평소대로 pull/merge.
 *
 * 본 모듈은 transition 게이트만 제공. 실제 reset 은 호출 측 (progressSync) 에서.
 */

import { getSupabase } from './supabase';

const LAST_USER_ID_KEY = 'questdp.lastUserId.v1';
const PROGRESS_KEY = 'questdp.progress.v1';

interface ProgressV1 {
  questionStats?: Record<string, unknown>;
  sessions?: unknown[];
  lessonXp?: number;
}

/** localStorage 의 lastUserId — 직전 인증 사용자 (또는 null=게스트). */
export function getLastUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(LAST_USER_ID_KEY);
  } catch {
    return null;
  }
}

export function setLastUserId(uid: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (uid) window.localStorage.setItem(LAST_USER_ID_KEY, uid);
    else window.localStorage.removeItem(LAST_USER_ID_KEY);
  } catch {
    /* 무시 */
  }
}

/**
 * 로컬 progress 가 게스트 활동 흔적 있는지. sessions·questionStats·lessonXp
 * 셋 중 하나라도 의미있는 값이면 true.
 *
 * 활용: SIGNED_IN 시 last==null + hasGuestProgress=true 면 "게스트→로그인"
 * 전환 후보. server probe 로 마이그/discard 결정.
 */
export function hasGuestProgress(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as ProgressV1;
    if (!parsed || typeof parsed !== 'object') return false;
    const sessionCount = Array.isArray(parsed.sessions) ? parsed.sessions.length : 0;
    const statCount = parsed.questionStats
      ? Object.keys(parsed.questionStats).length
      : 0;
    const xp = typeof parsed.lessonXp === 'number' ? parsed.lessonXp : 0;
    return sessionCount > 0 || statCount > 0 || xp > 0;
  } catch {
    return false;
  }
}

/**
 * Server 가 이미 의미있는 데이터를 보유하는지 probe.
 * sessions count 또는 question_stats count 가 0 이상이면 "기존 계정".
 *
 * 두 쿼리 head:true count:exact — 데이터 다운로드 X, count 만 받아옴 (저비용).
 * 미인증·env 미설정·네트워크 실패 시 보수적으로 true 반환 (= reset 결정 유보).
 */
export async function probeServerHasData(): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return true; // env 미설정 = 결정 유보
  try {
    const { data: sess } = await sb.auth.getSession();
    if (!sess.session) return true;

    const [sessRes, statsRes] = await Promise.all([
      sb.from('sessions').select('*', { count: 'exact', head: true }),
      sb.from('question_stats').select('*', { count: 'exact', head: true }),
    ]);

    if (sessRes.error || statsRes.error) {
      // 쿼리 실패 — 보수적으로 "데이터 있음" 가정 (게스트 진도 discard)
      // 사용자 데이터 무손상 우선. 잘못 판단해도 게스트 진도만 손실, 서버 안전.
      return true;
    }
    const sCount = sessRes.count ?? 0;
    const qCount = statsRes.count ?? 0;
    return sCount > 0 || qCount > 0;
  } catch {
    return true; // 보수적 fallback
  }
}

/**
 * SIGNED_IN 시 호출. 전환 결정 + reset 권장 여부 반환.
 *
 * @returns
 *   - `'reset'`: 게스트 진도가 있고 server 도 데이터 있음 → caller 가 local reset
 *   - `'migrate'`: 게스트 진도 있지만 server 비어있음 → caller 는 그대로 (migrate.ts 흡수)
 *   - `'pull'`: 게스트 진도 없거나 같은 사용자 재로그인 → 평소대로 pull/merge
 */
export type TransitionDecision = 'reset' | 'migrate' | 'pull';

/**
 * 결정 캐시 — progressSync / bookmarks / examDate 가 같은 SIGNED_IN 이벤트에서
 * 각각 호출하면 server probe 가 3 번 발생. 같은 userId 에 대해 10초 동안 결정
 * 재사용 → 1 번만 probe.
 *
 * 또한 한 sync (progressSync) 가 reset 으로 local 진도 비운 후, 다른 sync
 * (bookmarks) 가 호출될 때 hasGuestProgress 가 이미 false 가 되어 'pull' 로
 * 잘못 결정되는 문제도 방지 (캐시된 'reset' 그대로 반환).
 */
interface CachedDecision {
  userId: string;
  decision: TransitionDecision;
  at: number;
}
let _cachedDecision: CachedDecision | null = null;
const DECISION_TTL_MS = 10_000;

export async function decideSignInTransition(
  userId: string,
): Promise<TransitionDecision> {
  // 캐시 hit
  if (
    _cachedDecision &&
    _cachedDecision.userId === userId &&
    Date.now() - _cachedDecision.at < DECISION_TTL_MS
  ) {
    return _cachedDecision.decision;
  }

  const last = getLastUserId();

  let decision: TransitionDecision;
  if (last === userId) {
    // 같은 사용자 재로그인 — 전환 아님
    decision = 'pull';
  } else if (!hasGuestProgress()) {
    // 게스트 진도 흔적 없음 — 전환이긴 하지만 손실할 데이터 없음
    decision = 'pull';
  } else {
    // 게스트 진도 있음 + 다른 user 로 전환 — server 상태 probe
    const serverHasData = await probeServerHasData();
    decision = serverHasData ? 'reset' : 'migrate';
  }

  _cachedDecision = { userId, decision, at: Date.now() };
  return decision;
}

/** 테스트·재시도용 — 캐시 강제 무효화. */
export function clearTransitionCache(): void {
  _cachedDecision = null;
}

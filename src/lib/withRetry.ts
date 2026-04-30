/**
 * withRetry — 비동기 호출에 지수 backoff 재시도를 입힘.
 *
 * fire-and-forget 으로 무음 실패하던 Supabase RPC / write 호출에 사용.
 * 실패하면 onError 콜백으로 surface 해서 토스트로 안내.
 *
 * 사용 예:
 *   await withRetry(
 *     () => sb.from('profiles').update({ display_name }).eq('id', uid),
 *     { onError: (e) => toast.show({ kind: 'error', text: '저장 실패' }) }
 *   );
 *
 * 정책:
 *   - 기본 재시도 5회 (총 ~11.5초): 350·700·1500·3000·6000 ms backoff
 *     (profile.ts pullFromSupabase 와 동일 — 재시도 윈도우 일관성)
 *   - 마지막 시도까지 실패하면 onError 호출 + 마지막 에러 throw
 *   - shouldRetry(error) 가 false 반환 시 즉시 abort (e.g. 권한 에러)
 */

const DEFAULT_DELAYS_MS = [350, 700, 1500, 3000, 6000];

export interface WithRetryOptions {
  /** 시도 사이 대기 시간 (ms) 배열. 길이만큼 재시도. */
  delaysMs?: readonly number[];
  /**
   * 재시도 여부 판정 (선택). 받은 에러를 보고 false 반환하면 즉시 abort.
   * 권한 에러처럼 재시도해도 의미 없는 경우에 사용.
   */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /**
   * 모든 재시도 실패 시 호출 (선택). 사용자 토스트·로깅 자리.
   * 던진 에러는 throw 됨 (호출측 try/catch 로 추가 처리 가능).
   */
  onError?: (error: unknown) => void;
  /**
   * Supabase 응답 객체처럼 `{ data, error }` 형태인 경우 error 가 truthy 면
   * 재시도. true 가 default — 일반 promise 면 무시됨 (영향 없음).
   */
  detectSupabaseError?: boolean;
}

/**
 * fn 을 호출하고 실패하면 backoff 로 재시도.
 * 마지막 시도 결과 (성공 또는 throw) 를 반환.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: WithRetryOptions = {},
): Promise<T> {
  const {
    delaysMs = DEFAULT_DELAYS_MS,
    shouldRetry,
    onError,
    detectSupabaseError = true,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= delaysMs.length; attempt++) {
    try {
      const result = await fn();
      // Supabase: { data, error } 패턴 — error 가 truthy 면 throw 로 변환
      if (
        detectSupabaseError &&
        result !== null &&
        typeof result === 'object' &&
        'error' in result &&
        (result as { error: unknown }).error
      ) {
        lastError = (result as { error: unknown }).error;
        if (shouldRetry && !shouldRetry(lastError, attempt)) {
          onError?.(lastError);
          throw lastError;
        }
        // continue retry loop
      } else {
        return result;
      }
    } catch (err) {
      lastError = err;
      if (shouldRetry && !shouldRetry(err, attempt)) {
        onError?.(err);
        throw err;
      }
    }
    // 다음 시도 대기 (마지막 시도면 대기 X)
    if (attempt < delaysMs.length) {
      await sleep(delaysMs[attempt]);
    }
  }

  onError?.(lastError);
  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Supabase 에러 중 재시도해봐야 무의미한 케이스 식별.
 * - permission denied (42501) — RLS 거부: 재시도해도 같음
 * - syntax error (42601) — 쿼리 문제
 * - duplicate key (23505) — 멱등 처리 필요
 * 그 외 (네트워크·타임아웃·일시 장애) 는 재시도.
 */
export function isPermanentSupabaseError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: string }).code;
  if (!code) return false;
  return (
    code === '42501' || // permission denied
    code === '42601' || // syntax error
    code === '23505' || // duplicate key
    code === '42P17' // infinite recursion (이번 사고 코드)
  );
}

/**
 * withRetry.test.ts — 재시도 로직 검증.
 */

import { describe, it, expect, vi } from 'vitest';
import { withRetry, isPermanentSupabaseError } from './withRetry';

describe('withRetry — 성공 / 실패 / 재시도', () => {
  it('첫 시도에 성공 → 그 결과 반환, 재시도 X', async () => {
    const fn = vi.fn(() => Promise.resolve('ok'));
    const result = await withRetry(fn, { delaysMs: [10, 10] });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('두 번째 시도에 성공 → 그 결과 반환', async () => {
    let attempts = 0;
    const fn = vi.fn(() => {
      attempts++;
      if (attempts < 2) return Promise.reject(new Error('flake'));
      return Promise.resolve('ok');
    });
    const result = await withRetry(fn, { delaysMs: [10, 10] });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('모두 실패 → 마지막 에러 throw + onError 호출', async () => {
    const fn = vi.fn(() => Promise.reject(new Error('boom')));
    const onError = vi.fn();
    await expect(
      withRetry(fn, { delaysMs: [10, 10], onError }),
    ).rejects.toThrow('boom');
    expect(fn).toHaveBeenCalledTimes(3); // 1 + 2 retries
    expect(onError).toHaveBeenCalledOnce();
  });

  it('shouldRetry false → 즉시 abort + onError 호출', async () => {
    const fn = vi.fn(() => Promise.reject(new Error('forbidden')));
    const onError = vi.fn();
    await expect(
      withRetry(fn, {
        delaysMs: [10, 10, 10],
        shouldRetry: () => false,
        onError,
      }),
    ).rejects.toThrow('forbidden');
    expect(fn).toHaveBeenCalledTimes(1); // no retries
    expect(onError).toHaveBeenCalledOnce();
  });

  it('Supabase 패턴 — { data, error } 의 error 도 재시도 트리거', async () => {
    let attempts = 0;
    type SbResult = { data: unknown; error: { message: string } | null };
    const fn = vi.fn(
      (): Promise<SbResult> => {
        attempts++;
        if (attempts < 3) {
          return Promise.resolve({ data: null, error: { message: 'transient' } });
        }
        return Promise.resolve({ data: { ok: true }, error: null });
      },
    );
    const result = await withRetry<SbResult>(fn, { delaysMs: [10, 10, 10] });
    expect(fn).toHaveBeenCalledTimes(3);
    expect(result.data).toEqual({ ok: true });
  });

  it('Supabase 패턴 — 모두 error 면 마지막 error throw', async () => {
    const fn = vi.fn(() =>
      Promise.resolve({ data: null, error: { message: 'permanent' } }),
    );
    await expect(withRetry(fn, { delaysMs: [10] })).rejects.toMatchObject({
      message: 'permanent',
    });
    expect(fn).toHaveBeenCalledTimes(2); // 1 + 1 retry
  });

  it('detectSupabaseError=false → error 가 있어도 그대로 반환 (일반 객체)', async () => {
    const fn = vi.fn(() =>
      Promise.resolve({ data: null, error: { message: 'something' } }),
    );
    const result = await withRetry(fn, {
      delaysMs: [10],
      detectSupabaseError: false,
    });
    expect(result).toEqual({ data: null, error: { message: 'something' } });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('isPermanentSupabaseError — 권한·중복·재귀 에러', () => {
  it('42501 (permission denied) → true', () => {
    expect(isPermanentSupabaseError({ code: '42501' })).toBe(true);
  });
  it('42601 (syntax) → true', () => {
    expect(isPermanentSupabaseError({ code: '42601' })).toBe(true);
  });
  it('23505 (duplicate key) → true', () => {
    expect(isPermanentSupabaseError({ code: '23505' })).toBe(true);
  });
  it('42P17 (infinite recursion) → true', () => {
    expect(isPermanentSupabaseError({ code: '42P17' })).toBe(true);
  });
  it('네트워크 에러 (코드 없음) → false (재시도 가치 있음)', () => {
    expect(isPermanentSupabaseError(new Error('fetch failed'))).toBe(false);
  });
  it('null/undefined → false', () => {
    expect(isPermanentSupabaseError(null)).toBe(false);
    expect(isPermanentSupabaseError(undefined)).toBe(false);
  });
  it('기타 에러 코드 (500 등) → false', () => {
    expect(isPermanentSupabaseError({ code: '500' })).toBe(false);
  });
});

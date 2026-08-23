import { describe, expect, it } from 'vitest';
import { passUnlockState, type PassSession } from './passes';
import type { PassStamp } from '@/types/passes';

describe('passUnlockState', () => {
  it('학습 기록이 없어도 2회독 복습 모드는 열려 있다', () => {
    expect(passUnlockState([], [], 'sqld', 1, 2).unlocked).toBe(true);
  });

  it('3회독 이상은 직전 회독 stamp가 있어야 열린다', () => {
    const sessions: PassSession[] = [];
    const stamps: PassStamp[] = [];
    expect(passUnlockState(sessions, stamps, 'sqld', 1, 3).unlocked).toBe(false);

    stamps.push({
      subject: 'sqld',
      chapter: 1,
      passNumber: 2,
      achievedAt: '2026-08-23T00:00:00.000Z',
    });
    expect(passUnlockState(sessions, stamps, 'sqld', 1, 3).unlocked).toBe(true);
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  waitForSession: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => ({ rpc: mocks.rpc }),
  isSupabaseConfigured: () => true,
  onAuthStateChange: () => () => {},
}));

vi.mock('@/lib/auth/waitForSession', () => ({
  waitForSession: mocks.waitForSession,
}));

import { purchaseEnergyWithXp } from './energy';

describe('purchaseEnergyWithXp', () => {
  beforeEach(() => {
    mocks.rpc.mockReset();
    mocks.waitForSession.mockReset();
    mocks.waitForSession.mockResolvedValue({ user: { id: 'user-1' } });
  });

  it('uses the atomic server RPC for authenticated users', async () => {
    mocks.rpc.mockImplementation(async (name: string) => {
      if (name === 'purchase_energy_with_xp') {
        return {
          data: [
            {
              ok: true,
              reason: null,
              remaining_energy: 8,
              remaining_xp: 70,
              energy_updated_at: '2026-08-15T00:00:00Z',
            },
          ],
          error: null,
        };
      }
      return {
        data: [
          {
            energy: 8,
            energy_updated_at: '2026-08-15T00:00:00Z',
            is_premium: false,
            is_admin: false,
            retry_after_sec: 0,
          },
        ],
        error: null,
      };
    });

    await expect(
      purchaseEnergyWithXp({
        xpCost: 100,
        energyAmount: 3,
        currentDisplayedXp: 170,
      }),
    ).resolves.toEqual({ ok: true, remaining: 8, remainingXp: 70 });

    expect(mocks.rpc).toHaveBeenCalledWith('purchase_energy_with_xp', {
      p_xp_cost: 100,
      p_energy_amount: 3,
    });
    await vi.waitFor(() => {
      expect(mocks.rpc).toHaveBeenCalledWith('get_energy_state');
    });
  });

  it('does not mutate local balances when the RPC fails', async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { message: 'function is not available' },
    });

    await expect(
      purchaseEnergyWithXp({
        xpCost: 40,
        energyAmount: 1,
        currentDisplayedXp: 170,
      }),
    ).resolves.toMatchObject({ ok: false, reason: 'server-error' });
  });
});

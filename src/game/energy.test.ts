import { describe, expect, it } from 'vitest';
import { mapEnergyPurchaseRpcRow } from './energy';

describe('mapEnergyPurchaseRpcRow', () => {
  it('returns the server-confirmed energy and XP balances after purchase', () => {
    expect(
      mapEnergyPurchaseRpcRow(
        {
          ok: true,
          reason: null,
          remaining_energy: 8,
          remaining_xp: 70,
          energy_updated_at: '2026-08-15T00:00:00Z',
        },
        5,
      ),
    ).toEqual({ ok: true, remaining: 8, remainingXp: 70 });
  });

  it.each([
    ['cap_overflow', 'cap-overflow'],
    ['insufficient_xp', 'insufficient-xp'],
    ['invalid_tier', 'invalid'],
    ['unauthenticated', 'unauthenticated'],
    ['profile_not_found', 'server-error'],
  ] as const)('maps %s to %s', (serverReason, expectedReason) => {
    expect(
      mapEnergyPurchaseRpcRow(
        {
          ok: false,
          reason: serverReason,
          remaining_energy: 5,
          remaining_xp: 170,
          energy_updated_at: '2026-08-15T00:00:00Z',
        },
        0,
      ),
    ).toMatchObject({
      ok: false,
      reason: expectedReason,
      remaining: 5,
      remainingXp: 170,
    });
  });

  it('uses the local energy as a fallback for malformed server data', () => {
    expect(
      mapEnergyPurchaseRpcRow(
        {
          ok: false,
          reason: 'unexpected',
          remaining_energy: Number.NaN,
          remaining_xp: Number.NaN,
          energy_updated_at: null,
        },
        4,
      ),
    ).toEqual({
      ok: false,
      reason: 'server-error',
      remaining: 4,
      remainingXp: undefined,
    });
  });
});

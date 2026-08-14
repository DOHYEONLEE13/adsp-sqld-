// @vitest-environment jsdom

import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdminPage from './AdminPage';

const fixtures = vi.hoisted(() => ({
  users: [
    {
      id: 'user-adsp',
      tag: 'Q-ADSP-0001',
      display_name: '분석이',
      role: 'user',
      total_xp: 1200,
      lesson_xp: 100,
      cumulative_xp: 1400,
      level: 4,
      is_premium: false,
      learning_subject: 'adsp',
      last_seen_at: '2026-08-13T10:00:00Z',
      created_at: '2026-08-01T10:00:00Z',
    },
    {
      id: 'user-sqld',
      tag: 'Q-SQLD-0002',
      display_name: '쿼리왕',
      role: 'user',
      total_xp: 900,
      lesson_xp: 50,
      cumulative_xp: 2000,
      level: 3,
      is_premium: true,
      learning_subject: 'sqld',
      last_seen_at: '2026-08-13T09:00:00Z',
      created_at: '2026-08-02T10:00:00Z',
    },
    {
      id: 'user-comhwal',
      tag: 'Q-COMH-0003',
      display_name: '활용이',
      role: 'user',
      total_xp: 700,
      lesson_xp: 20,
      cumulative_xp: 800,
      level: 2,
      is_premium: false,
      learning_subject: 'comhwal',
      last_seen_at: '2026-08-13T08:00:00Z',
      created_at: '2026-08-03T10:00:00Z',
    },
  ],
  metrics: {
    total_users: 66,
    premium_users: 4,
    today_answered_questions: 89,
    today_completed_concepts: 36,
    total_answered_questions: 2670,
    total_completed_concepts: 1311,
    top_new_question_users: [],
    quota_reached_users: [],
    rapid_submit_users: [],
  },
  subjectCounts: {
    adsp_users: 26,
    sqld_users: 29,
    comhwal_users: 10,
    unselected_users: 1,
  },
}));

const supabase = vi.hoisted(() => ({
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: { session: { user: { id: 'admin-user' } } },
    }),
  },
  from: vi.fn((table: string) => ({
    select: vi.fn((columns: string) => {
      if (table === 'profiles' && columns === 'role') {
        return {
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { role: 'admin' },
              error: null,
            }),
          })),
        };
      }

      const data = table === 'profiles' ? fixtures.users : [];
      return {
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({ data, error: null }),
        })),
      };
    }),
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
  rpc: vi.fn((name: string) => {
    if (name === 'admin_user_xp_snapshot') {
      return Promise.resolve({ data: fixtures.users, error: null });
    }
    if (name === 'admin_learning_activity') {
      return Promise.resolve({ data: fixtures.metrics, error: null });
    }
    if (name === 'admin_subject_counts') {
      return Promise.resolve({ data: fixtures.subjectCounts, error: null });
    }
    if (name === 'admin_redemption_code_usage') {
      return Promise.resolve({ data: [], error: null });
    }
    return Promise.resolve({ data: null, error: null });
  }),
}));

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => supabase,
  isSupabaseConfigured: () => true,
}));

vi.mock('@/data/profile', () => ({
  useMyProfile: () => ({ isAdmin: true }),
}));

vi.mock('@/components/ui/VideoBg', () => ({
  default: () => null,
}));

vi.mock('@/game/useDevUnlockFlags', () => ({
  useDevUnlockFlags: () => ({ passes: false, steps: false, any: false }),
  setDevUnlockFlags: vi.fn(),
}));

let root: Root | null = null;
let host: HTMLDivElement | null = null;

afterEach(() => {
  if (root) {
    act(() => root?.unmount());
  }
  host?.remove();
  root = null;
  host = null;
  vi.clearAllMocks();
});

async function renderAdminPage() {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);

  await act(async () => {
    root?.render(<AdminPage onBack={vi.fn()} />);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe('AdminPage learning subjects', () => {
  it('shows subject totals and each user subject without the coupon usage panel', async () => {
    await renderAdminPage();

    const pageText = document.body.textContent ?? '';
    expect(pageText).toContain('학습 과목 현황');
    expect(pageText).toContain('26명');
    expect(pageText).toContain('29명');
    expect(pageText).toContain('10명');
    expect(pageText).toContain('과목을 선택하지 않은 사용자 1명');

    for (const [tag, subject] of [
      ['Q-ADSP-0001', 'ADsP'],
      ['Q-SQLD-0002', 'SQLD'],
      ['Q-COMH-0003', '컴활'],
    ]) {
      const row = Array.from(document.querySelectorAll('tbody tr')).find((candidate) =>
        candidate.textContent?.includes(tag),
      );
      expect(row?.textContent).toContain(subject);
    }
    expect(pageText).not.toContain('쿠폰 사용자 중 오늘 새 문제 사용량');
  });

  it('shows current and cumulative XP and sorts the loaded users by cumulative XP', async () => {
    await renderAdminPage();

    expect(document.body.textContent).toContain('보유 XP');
    expect(document.body.textContent).toContain('누적 XP');

    const cumulativeButton = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === '누적 XP순',
    );
    expect(cumulativeButton).toBeTruthy();

    await act(async () => {
      cumulativeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const tags = Array.from(document.querySelectorAll('tbody tr'))
      .map((row) => row.querySelector('td')?.textContent?.trim())
      .filter(Boolean);
    expect(tags.slice(0, 3)).toEqual(['Q-SQLD-0002', 'Q-ADSP-0001', 'Q-COMH-0003']);
    expect(supabase.rpc).toHaveBeenCalledWith('admin_user_xp_snapshot', { p_limit: 100 });
  });
});

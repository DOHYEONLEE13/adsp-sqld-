/**
 * smoke.spec.ts — 핵심 UX flow 가 깨지지 않았는지 빠르게 검증.
 *
 * 인증 모델 (2026-04-29 변경):
 *   - 학습 로드맵·진도·통계 등 보호 라우트 (/game, /quests, /friends, /stats,
 *     /bookmarks) 는 미로그인 사용자가 진입 시 #/login 으로 redirect
 *   - Supabase env 미설정 (게스트 모드) 인 경우 가드 우회
 *   - 본 테스트는 dev 서버 (.env 가 Supabase configured) 대상이라 보호 라우트는
 *     로그인 페이지로 redirect 되는 것을 검증
 *
 * 검증 흐름:
 *   1. 랜딩 페이지 hero 노출
 *   2. 보호 라우트 (/game, /game/sqld, /quests, /friends, /stats) — #/login 으로 redirect
 *   3. /login 페이지 본문 + Google 버튼
 *   4. 법적 페이지 — 정상 진입
 *   5. 랜딩 헤더 — 로그인/지금 시작 노출
 *   6. /admin — 게스트 거부
 *   7. /redeem — 자체 AuthCard (게스트도 진입 가능)
 *   8. /refund-request — 게스트도 진입 가능 (mailto fallback)
 */

import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test.beforeEach(async ({ page }) => {
    // 기존 localStorage 가 영향 안 주게 매번 깨끗하게
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    await page.reload();
  });

  test('1. landing hero 노출', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toContainText(/ADSP|SQLD|놀면서/);
  });

  test('2. /game (보호) — 미로그인이면 #/login 으로 redirect', async ({ page }) => {
    await page.goto('/#/game');
    // 짧게 권한 확인 → /login 으로 이동
    await page.waitForFunction(() => window.location.hash === '#/login', null, {
      timeout: 8000,
    });
    // LoginPage 의 안내 헤딩이 보여야
    await expect(
      page.getByRole('heading', { name: /먼저 로그인을 해주세요/ }),
    ).toBeVisible({ timeout: 5000 });
  });

  test('2-deep. /game/sqld 직진 — 로그인 redirect 후 returnTo 보관', async ({
    page,
  }) => {
    await page.goto('/#/game/sqld');
    await page.waitForFunction(() => window.location.hash === '#/login', null, {
      timeout: 8000,
    });
    // pendingAuthRedirect localStorage 에 원본 라우트 보관 확인
    const pending = await page.evaluate(() =>
      window.localStorage.getItem('questdp.auth.pendingRedirect.v1'),
    );
    expect(pending).toBe('/game/sqld');
  });

  test('3. /quests (보호) — #/login redirect', async ({ page }) => {
    await page.goto('/#/quests');
    await page.waitForFunction(() => window.location.hash === '#/login', null, {
      timeout: 8000,
    });
  });

  test('4. /friends (보호) — #/login redirect', async ({ page }) => {
    await page.goto('/#/friends');
    await page.waitForFunction(() => window.location.hash === '#/login', null, {
      timeout: 8000,
    });
  });

  test('5. /stats (보호) — #/login redirect', async ({ page }) => {
    await page.goto('/#/stats');
    await page.waitForFunction(() => window.location.hash === '#/login', null, {
      timeout: 8000,
    });
  });

  test('5-login. /login 페이지 — Google 버튼 + 안내 노출', async ({ page }) => {
    await page.goto('/#/login');
    await expect(
      page.getByRole('heading', { name: /먼저 로그인을 해주세요/ }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Google 로 시작/i }),
    ).toBeVisible();
  });

  test('7. 법적 페이지 — 개인정보·이용약관·환불·소개 라우트 정상 진입', async ({
    page,
  }) => {
    for (const slug of ['about', 'privacy', 'terms', 'refund']) {
      await page.goto(`/#/${slug}`);
      // 각 페이지의 hero h1 가 보여야
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 });
      // 홈으로 버튼
      await expect(page.getByRole('button', { name: /홈으로/ })).toBeVisible();
    }
  });

  test('8. 랜딩 헤더 — 로그인/지금 시작 버튼 노출', async ({ page }) => {
    await page.goto('/');
    // Supabase 미설정 환경이면 "지금 시작" 버튼, 설정되어 있으면 "로그인" 버튼
    const loginOrStart = page
      .getByRole('link', { name: /지금 시작/ })
      .or(page.getByRole('button', { name: /로그인/ }));
    await expect(loginOrStart.first()).toBeVisible({ timeout: 5000 });
  });

  test('9. /admin — 비-admin 게스트는 접근 거부 또는 랜딩으로 redirect', async ({
    page,
  }) => {
    await page.goto('/#/admin');
    // 게스트 (Supabase 미설정/미로그인) 는:
    //   ① "권한 확인 중…" 잠깐 보이거나
    //   ② "접근 권한이 없습니다" 메시지가 뜨거나
    //   ③ 즉시 랜딩으로 redirect (ADSP/SQLD 또는 hero 키워드 보임)
    // 셋 중 어느 케이스든 통과로 본다.
    const guard = page.getByText(
      /권한 확인 중|접근 권한이 없습니다|ADSP|SQLD|놀면서/,
    );
    await expect(guard.first()).toBeVisible({ timeout: 8000 });
  });

  test('10. /redeem — 자체 AuthCard 처리 (게스트도 진입 가능)', async ({
    page,
  }) => {
    await page.goto('/#/redeem');
    // 보호 라우트가 아니므로 redirect 안 됨
    await expect(
      page.getByRole('heading', { name: /초대 코드/ }),
    ).toBeVisible({ timeout: 5000 });
  });

  test('11. /refund-request — 게스트 mailto fallback 진입 가능', async ({
    page,
  }) => {
    await page.goto('/#/refund-request');
    await expect(
      page.getByRole('heading', { name: /환불 요청/ }),
    ).toBeVisible({ timeout: 5000 });
  });
});

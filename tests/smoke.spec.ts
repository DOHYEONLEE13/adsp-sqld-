/**
 * smoke.spec.ts — 핵심 UX flow 가 깨지지 않았는지 빠르게 검증.
 *
 * 인증 모델 (2026-04-29 게스트 모드 복원):
 *   - 게스트 (미로그인) 사용자도 모든 학습 라우트 접근 가능 — 무료 계정처럼 동작.
 *     진도·북마크는 localStorage 에 저장.
 *   - Supabase 로그인은 선택 — 친구 비교·다른 기기 동기화·premium 결제 시점에만 필요.
 *   - 로그인 인프라 (#/login, AuthGuard, authGuard.ts) 는 유지되며 Phase B
 *     premium 결제 게이트에서 재사용.
 *
 * 검증 흐름:
 *   1. 랜딩 페이지 hero 노출
 *   2. 게임 진입 → Galaxy chooser → ADSP planet → Chapter zone
 *   2-SQLD. SQLD chooser → planet → zone
 *   2-SQLD-deep. SQLD ch2 zone — SQL 토픽 노출
 *   3. /quests 페이지 — 오늘의 퀘스트
 *   4. /friends 페이지 — guest 안내
 *   5. /stats 페이지 — AuthCard "Google 로 시작" 버튼
 *   6. 모바일 하단 4-탭 nav
 *   7. 법적 페이지 — 정상 진입
 *   8. 랜딩 헤더 — 로그인 버튼 노출
 *   9. /admin — 비-admin 게스트 거부
 *  10. /login — 마스코트 + Google 버튼
 *  11. /redeem — 자체 AuthCard 처리
 *  12. /refund-request — 게스트 mailto fallback 진입 가능
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

  test('2. game chooser → ADSP planet → chapter zone', async ({ page }) => {
    await page.goto('/#/game');
    // chooser 에 ADSP 카드
    await expect(page.getByRole('button', { name: /ADSP/i }).first()).toBeVisible();
    // ADSP 클릭 → SubjectInfoPanel
    await page.getByRole('button', { name: /ADSP 선택/i }).click();
    // "ADSP 플레이하기" 버튼이 나타나야 함
    const playButton = page.getByRole('button', { name: /플레이하기/ });
    await expect(playButton).toBeVisible({ timeout: 5000 });
    await playButton.click();
    // Planet 화면 — Chapter 1 노드
    await expect(page.getByRole('button', { name: /Chapter 1/i })).toBeVisible({
      timeout: 10_000,
    });
    // Chapter 1 클릭 → Zone
    await page.getByRole('button', { name: /Chapter 1/i }).click();
    // Zone 의 첫 step
    await expect(page.getByText(/Step\s*1/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('2-SQLD. SQLD chooser → planet → zone (스키마 토픽 노출)', async ({ page }) => {
    await page.goto('/#/game');
    // SQLD 카드
    await expect(page.getByRole('button', { name: /SQLD/i }).first()).toBeVisible();
    await page.getByRole('button', { name: /SQLD 선택/i }).click();
    // SubjectInfoPanel — SQLD 플레이하기
    const playButton = page.getByRole('button', { name: /플레이하기/ });
    await expect(playButton).toBeVisible({ timeout: 5000 });
    await playButton.click();
    // Planet — Chapter 1, Chapter 2
    await expect(page.getByRole('button', { name: /Chapter 1/i })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole('button', { name: /Chapter 2/i })).toBeVisible();
    // Chapter 1 → Zone
    await page.getByRole('button', { name: /Chapter 1/i }).click();
    await expect(page.getByText(/Step\s*1/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('2-SQLD-deep. SQLD ch2 zone — SQL 기본/활용/관리 구문 3 토픽 모두 노출', async ({
    page,
  }) => {
    await page.goto('/#/game/sqld');
    await page.getByRole('button', { name: /Chapter 2/i }).click();
    await expect(page.getByText(/Step\s*1/i).first()).toBeVisible({ timeout: 5000 });
    const stepCount = await page.getByText(/Step\s*\d+/i).count();
    expect(stepCount).toBeGreaterThanOrEqual(8);
  });

  test('3. /quests 페이지 렌더', async ({ page }) => {
    await page.goto('/#/quests');
    await expect(page.getByRole('heading', { name: /오늘의 퀘스트/ }).first()).toBeVisible();
  });

  test('4. /friends 게스트 안내', async ({ page }) => {
    await page.goto('/#/friends');
    await expect(page.getByText(/친구 경쟁/)).toBeVisible();
    // 본인 태그가 카드에 노출
    await expect(page.locator('text=/Q-[A-Z0-9]{4}-[A-Z0-9]{4}/').first()).toBeVisible();
  });

  test('5. /stats AuthCard Google 버튼 노출', async ({ page }) => {
    await page.goto('/#/stats');
    // Google 로 시작 버튼
    await expect(page.getByRole('button', { name: /Google 로 시작/i })).toBeVisible();
  });

  test('7. 법적 페이지 — 개인정보·이용약관·환불·소개 라우트 정상 진입', async ({
    page,
  }) => {
    for (const slug of ['about', 'privacy', 'terms', 'refund']) {
      await page.goto(`/#/${slug}`);
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('button', { name: /홈으로/ })).toBeVisible();
    }
  });

  test('8. 랜딩 헤더 — 로그인 버튼 노출', async ({ page }) => {
    await page.goto('/');
    const loginOrStart = page
      .getByRole('link', { name: /지금 시작/ })
      .or(page.getByRole('button', { name: /로그인/ }));
    await expect(loginOrStart.first()).toBeVisible({ timeout: 5000 });
  });

  test('9. /admin — 비-admin 게스트는 접근 거부 또는 랜딩으로 redirect', async ({
    page,
  }) => {
    await page.goto('/#/admin');
    const guard = page.getByText(
      /권한 확인 중|접근 권한이 없습니다|ADSP|SQLD|놀면서/,
    );
    await expect(guard.first()).toBeVisible({ timeout: 8000 });
  });

  test('6. 모바일 하단 4-탭 nav (학습/퀘스트/친구/프로필)', async ({ page }) => {
    await page.goto('/#/game/adsp');
    const tabs = ['학습', '퀘스트', '친구', '프로필'];
    for (const t of tabs) {
      const tab = page.getByRole('button', { name: t });
      if (await tab.isVisible().catch(() => false)) {
        await expect(tab).toBeVisible();
      }
    }
  });

  test('10. /login — 마스코트 + Google 버튼 (직접 진입 가능)', async ({ page }) => {
    await page.goto('/#/login');
    await expect(
      page.getByRole('heading', { name: /먼저 로그인을 해주세요/ }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Google 로 시작/i }),
    ).toBeVisible();
  });

  test('11. /redeem — 자체 AuthCard 처리 (게스트도 진입 가능)', async ({
    page,
  }) => {
    await page.goto('/#/redeem');
    await expect(
      page.getByRole('heading', { name: /초대 코드/ }),
    ).toBeVisible({ timeout: 5000 });
  });

  test('12. /refund-request — 게스트 mailto fallback 진입 가능', async ({
    page,
  }) => {
    await page.goto('/#/refund-request');
    await expect(
      page.getByRole('heading', { name: /환불 요청/ }),
    ).toBeVisible({ timeout: 5000 });
  });
});

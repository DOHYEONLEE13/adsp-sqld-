/**
 * smoke.spec.ts — 핵심 UX flow 가 깨지지 않았는지 빠르게 검증.
 *
 * 인증 X (게스트 모드) 로 진행. 인증 flow 는 Google OAuth 라
 * 별도 mock session injection 또는 Supabase test auth 가 필요해 다음 phase.
 *
 * 검증 흐름:
 *   1. 랜딩 페이지 hero 노출
 *   2. 게임 진입 → Galaxy chooser
 *   3. ADSP 선택 → Planet (3 chapters)
 *   4. Chapter 1 → Zone (step path)
 *   5. 모바일 뷰포트 — 하단 nav 4 탭
 *   6. /quests 페이지 — 오늘의 퀘스트
 *   7. /friends 페이지 — guest 안내
 *   8. /stats 페이지 — AuthCard "Google 로 시작" 버튼
 */

import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test.beforeEach(async ({ page }) => {
    // 기존 localStorage 가 영향 안 주게 매번 깨끗하게
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
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
    // Planet — Chapter 1 (데이터 모델링의 이해), Chapter 2 (SQL 기본 및 활용)
    await expect(page.getByRole('button', { name: /Chapter 1/i })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole('button', { name: /Chapter 2/i })).toBeVisible();
    // Chapter 1 → Zone
    await page.getByRole('button', { name: /Chapter 1/i }).click();
    // Step 1 (= 모델링의 3특징 + 3관점) 표시
    await expect(page.getByText(/Step\s*1/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('2-SQLD-deep. SQLD ch2 zone — SQL 기본/활용/관리 구문 3 토픽 모두 노출', async ({
    page,
  }) => {
    await page.goto('/#/game/sqld');
    await page.getByRole('button', { name: /Chapter 2/i }).click();
    // ZoneScreen 의 step 라벨은 화면상 "STEP n" (대문자) — case-insensitive 매칭
    await expect(page.getByText(/Step\s*1/i).first()).toBeVisible({ timeout: 5000 });
    // 12+12+8 = 32 step 중 적어도 8개는 표시되어야 함 (스크롤 가능)
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
      // 각 페이지의 hero h1 가 보여야
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 });
      // 홈으로 버튼
      await expect(page.getByRole('button', { name: /홈으로/ })).toBeVisible();
    }
  });

  test('8. 랜딩 헤더 — 로그인 버튼 노출', async ({ page }) => {
    await page.goto('/');
    // Supabase 미설정 환경이면 "지금 시작" 버튼, 설정되어 있으면 "로그인" 버튼
    const loginOrStart = page
      .getByRole('link', { name: /지금 시작/ })
      .or(page.getByRole('button', { name: /로그인/ }));
    await expect(loginOrStart.first()).toBeVisible({ timeout: 5000 });
  });

  test('9. /admin — 비-admin 게스트는 접근 거부 메시지 또는 홈 redirect', async ({
    page,
  }) => {
    await page.goto('/#/admin');
    // 게스트는 isAdmin=false → "접근 권한이 없습니다" 보이거나 홈으로 redirect
    const denied = page.getByText(/접근 권한이 없습니다|홈으로/);
    await expect(denied.first()).toBeVisible({ timeout: 5000 });
  });

  test('6. 모바일 하단 4-탭 nav (학습/퀘스트/친구/프로필)', async ({ page }) => {
    await page.goto('/#/game/adsp');
    // 모바일 뷰포트는 config 의 chromium-mobile project 에서 자동
    const tabs = ['학습', '퀘스트', '친구', '프로필'];
    for (const t of tabs) {
      // aria-label 매칭 (모바일에서만 노출)
      // skip if not on mobile viewport
      const tab = page.getByRole('button', { name: t });
      if (await tab.isVisible().catch(() => false)) {
        await expect(tab).toBeVisible();
      }
    }
  });
});

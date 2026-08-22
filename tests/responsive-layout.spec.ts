import { expect, test, type Page } from '@playwright/test';

const ONBOARDING_VIEWPORTS = [
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1366, height: 768 },
  { width: 1920, height: 920 },
] as const;

const HOME_VIEWPORTS = [
  { width: 1366, height: 768 },
  { width: 1920, height: 920 },
] as const;

async function seedHome(page: Page) {
  await page.addInitScript(() => {
    const now = Date.now();
    window.localStorage.setItem(
      'questdp_onboarding_v4',
      JSON.stringify({
        persona: 'beginner',
        background: 'novice',
        exams: ['adsp'],
        exam_dates: { adsp: '2026-10-31' },
        daily_minutes: 30,
        study_style: 'distributed',
        completed_at: new Date(now).toISOString(),
        version: 1,
      }),
    );
    window.localStorage.setItem(
      'questdp.progress.v1',
      JSON.stringify({
        version: 1,
        questionStats: {},
        sessions: [],
        activeSubject: 'adsp',
        createdAt: now,
        updatedAt: now,
      }),
    );
  });
}

test.describe('responsive layout', () => {
  test.describe.configure({ timeout: 90_000 });

  test('온보딩이 기준 해상도에서 한 화면 안에 정렬된다', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    for (const viewport of ONBOARDING_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.evaluate(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
      });
      await page.goto('/#/onboarding');
      await expect(page.getByTestId('onboarding-subject-step')).toBeVisible();

      const metrics = await page.evaluate(() => {
        const rect = (testId: string) =>
          document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!
            .getBoundingClientRect();
        const heading = rect('onboarding-subject-heading');
        const bubble = rect('onboarding-selected-bubble');
        const character = rect('onboarding-selected-character');
        const action = rect('onboarding-primary-action');
        const existingAccount = rect('onboarding-existing-account');

        return {
          scrollHeight: document.documentElement.scrollHeight,
          viewportHeight: window.innerHeight,
          headingBubbleGap: bubble.top - heading.bottom,
          centerDelta: Math.abs(
            bubble.left + bubble.width / 2 - (character.left + character.width / 2),
          ),
          actionBottom: action.bottom,
          existingAccountBottom: existingAccount.bottom,
        };
      });

      expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.viewportHeight + 1);
      expect(
        metrics.headingBubbleGap,
        `${viewport.width}x${viewport.height} 제목과 말풍선 간격`,
      ).toBeGreaterThanOrEqual(16);
      expect(metrics.centerDelta).toBeLessThanOrEqual(2);
      expect(metrics.actionBottom).toBeLessThanOrEqual(metrics.viewportHeight);
      expect(metrics.existingAccountBottom).toBeLessThanOrEqual(metrics.viewportHeight);

      await page.getByRole('button', { name: /다음 자격증/ }).click();
      await expect(
        page.locator('[data-subject-id="sqld"][data-subject-slot="center"]'),
      ).toBeVisible();

      await page.getByTestId('onboarding-subject-next').click();
      await expect(page.getByTestId('onboarding-nickname-step')).toBeVisible();
      const nicknameMetrics = await page.evaluate(() => {
        const rect = (testId: string) =>
          document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!
            .getBoundingClientRect();
        const heading = rect('onboarding-nickname-heading');
        const character = rect('onboarding-nickname-character');
        const form = rect('onboarding-nickname-form');
        return {
          characterGap: character.top - heading.bottom,
          formBottom: form.bottom,
        };
      });
      expect(nicknameMetrics.characterGap).toBeGreaterThanOrEqual(0);
      expect(nicknameMetrics.formBottom).toBeLessThanOrEqual(viewport.height);

      await page.getByLabel('닉네임').fill('토리');
      await page.getByTestId('onboarding-nickname-next').click();
      await expect(page.getByTestId('onboarding-login-step')).toBeVisible();
      const loginActions = await page.getByTestId('onboarding-login-actions').boundingBox();
      expect(loginActions?.y).toBeGreaterThanOrEqual(0);
      expect((loginActions?.y ?? 0) + (loginActions?.height ?? 0)).toBeLessThanOrEqual(
        viewport.height,
      );
    }
  });

  test('데스크톱 홈 D-DAY가 중앙에서 로켓 뒤에 놓인다', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await seedHome(page);

    for (const viewport of HOME_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.goto('/#/home');
      await expect(page.getByTestId('home-desktop-dday')).toBeVisible();
      await expect(page.getByTestId('home-hero-rocket').locator('img')).toBeVisible();

      const metrics = await page.evaluate(() => {
        const dday = document
          .querySelector<HTMLElement>('[data-testid="home-desktop-dday"]')!
          .getBoundingClientRect();
        const ddayElement = document.querySelector<HTMLElement>(
          '[data-testid="home-desktop-dday"]',
        )!;
        const rocket = document
          .querySelector<HTMLElement>('[data-testid="home-hero-rocket"] img')!
          .getBoundingClientRect();
        const viewportCenter = window.innerWidth / 2;

        return {
          rocketCenterDelta: Math.abs(rocket.left + rocket.width / 2 - viewportCenter),
          ddayCenterDelta: Math.abs(dday.left + dday.width / 2 - viewportCenter),
          rocketWidth: rocket.width,
          fontSize: Number.parseFloat(getComputedStyle(ddayElement).fontSize),
          ddayLayer: Number.parseInt(
            getComputedStyle(
              document.querySelector<HTMLElement>('[data-testid="home-dday-layer"]')!,
            ).zIndex,
            10,
          ),
          rocketLayer: Number.parseInt(
            getComputedStyle(
              document.querySelector<HTMLElement>('[data-testid="home-hero-rocket"]')!,
            ).zIndex,
            10,
          ),
        };
      });

      expect(metrics.rocketCenterDelta).toBeLessThanOrEqual(2);
      expect(metrics.ddayCenterDelta).toBeLessThanOrEqual(2);
      expect(metrics.ddayLayer).toBeLessThan(metrics.rocketLayer);
      expect(metrics.rocketWidth).toBeGreaterThanOrEqual(380);
      expect(metrics.rocketWidth).toBeLessThanOrEqual(470);
      expect(metrics.fontSize).toBeGreaterThanOrEqual(250);
      expect(metrics.fontSize).toBeLessThanOrEqual(370);

      await page.mouse.wheel(0, viewport.height * 0.8);
      await expect
        .poll(() =>
          page.evaluate(() => {
            const rocket = document
              .querySelector<HTMLElement>('[data-testid="home-hero-rocket"] img')!
              .getBoundingClientRect();
            return Math.abs(rocket.left + rocket.width / 2 - window.innerWidth / 2);
          }),
        )
        .toBeLessThanOrEqual(362);
    }
  });
});

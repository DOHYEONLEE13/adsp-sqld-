import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 447, height: 920 } });

test('홈의 과목 바꾸기에서 온보딩 과목 선택 화면을 열고 바로 적용한다', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const now = Date.now();
    window.localStorage.clear();
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

  await page.goto('/#/home');
  await page.getByTestId('home-subject-switch').click();

  await expect(page.getByTestId('onboarding-subject-step')).toBeVisible();
  await expect(page.getByRole('heading', { name: /공부할 자격증을/ })).toBeVisible();

  await page.getByRole('button', { name: 'SQLD 선택', exact: true }).click();
  await expect(
    page.locator('[data-subject-id="sqld"][data-subject-slot="center"]'),
  ).toBeVisible();
  await page.getByTestId('onboarding-subject-next').click();

  await expect(page.getByText('SQLD 정기시험', { exact: true })).toBeVisible();
  await expect(page.getByTestId('onboarding-subject-step')).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const raw = window.localStorage.getItem('questdp.progress.v1');
        return raw ? JSON.parse(raw).activeSubject : null;
      }),
    )
    .toBe('sqld');
});

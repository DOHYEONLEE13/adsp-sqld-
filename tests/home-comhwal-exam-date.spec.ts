import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 432, height: 920 } });

test('컴활 홈에서 시험일 선택 팝업을 열고 날짜를 적용한다', async ({ page }) => {
  const target = new Date();
  target.setDate(15);
  target.setMonth(target.getMonth() + 1);
  const targetYmd = [
    target.getFullYear(),
    String(target.getMonth() + 1).padStart(2, '0'),
    String(target.getDate()).padStart(2, '0'),
  ].join('-');
  const targetLabel = `${target.getFullYear()}년 ${target.getMonth() + 1}월 ${target.getDate()}일 선택`;

  await page.addInitScript(() => {
    const now = Date.now();
    window.localStorage.clear();
    window.localStorage.setItem(
      'questdp_onboarding_v4',
      JSON.stringify({
        persona: 'beginner',
        background: 'novice',
        exams: ['comhwal1'],
        exam_dates: {},
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
        activeSubject: 'sqld',
        createdAt: now,
        updatedAt: now,
      }),
    );
    window.localStorage.setItem('questdp:last-learn-hash:v1', '/game/comhwal');
    window.localStorage.setItem(
      'questdp:last-expansion-view:v1',
      JSON.stringify({ subjectId: 'comhwal', variantId: 'grade-1' }),
    );
  });

  await page.goto('/#/home');

  await expect(page.getByText('컴활 1급', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: '시험일 선택하기', exact: true }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.getByTestId('home-comhwal-calendar')).toBeVisible();
  await dialog.getByRole('button', { name: '다음 달', exact: true }).click();
  await dialog.getByRole('button', { name: targetLabel, exact: true }).click();
  await dialog
    .getByRole('button', { name: '이 날짜로 설정하기', exact: true })
    .click();

  await expect(dialog).toHaveCount(0);
  await expect(page.getByText(targetYmd, { exact: true })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const raw = window.localStorage.getItem('questdp.examDates.v1');
        return raw ? JSON.parse(raw).comhwal1 : null;
      }),
    )
    .toBe(targetYmd);
});

test('시험 당일에는 홈 D-DAY를 D-Day로 표시한다', async ({ page }) => {
  await page.addInitScript(() => {
    const now = new Date();
    const ymd = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
    window.localStorage.clear();
    window.localStorage.setItem(
      'questdp_onboarding_v4',
      JSON.stringify({
        persona: 'beginner',
        background: 'novice',
        exams: ['sqld'],
        exam_dates: { sqld: ymd },
        daily_minutes: 30,
        study_style: 'distributed',
        completed_at: now.toISOString(),
        version: 1,
      }),
    );
    window.localStorage.setItem(
      'questdp.progress.v1',
      JSON.stringify({
        version: 1,
        questionStats: {},
        sessions: [],
        activeSubject: 'sqld',
        createdAt: now.getTime(),
        updatedAt: now.getTime(),
      }),
    );
    window.localStorage.setItem(
      'questdp.examDates.v1',
      JSON.stringify({ sqld: ymd }),
    );
    window.localStorage.setItem('questdp:last-learn-hash:v1', '/game/sqld');
  });

  await page.goto('/#/home');

  await expect(page.getByTestId('home-mobile-dday')).toHaveText('D-Day');
});

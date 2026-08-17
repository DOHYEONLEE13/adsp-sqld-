import { describe, expect, it } from 'vitest';
import { isPlayReviewPromptEligible } from './playReviewPrompt';

const NOW = Date.UTC(2026, 7, 18);
const DAY = 24 * 60 * 60 * 1000;

describe('isPlayReviewPromptEligible', () => {
  it('30문제 미만이면 노출하지 않는다', () => {
    expect(isPlayReviewPromptEligible(29, { promptCount: 0 }, NOW)).toBe(false);
  });

  it('기존 사용자를 포함해 30문제 이상이면 첫 완료 세션에서 노출한다', () => {
    expect(isPlayReviewPromptEligible(30, { promptCount: 0 }, NOW)).toBe(true);
    expect(isPlayReviewPromptEligible(300, { promptCount: 0 }, NOW)).toBe(true);
  });

  it('리뷰 페이지를 열었다면 다시 노출하지 않는다', () => {
    expect(
      isPlayReviewPromptEligible(
        100,
        { promptCount: 1, reviewPageOpenedAt: NOW - DAY },
        NOW,
      ),
    ).toBe(false);
  });

  it('닫은 뒤 90일이 지나야 한 번 더 노출한다', () => {
    expect(
      isPlayReviewPromptEligible(
        100,
        { promptCount: 1, lastPromptedAt: NOW - 89 * DAY },
        NOW,
      ),
    ).toBe(false);
    expect(
      isPlayReviewPromptEligible(
        100,
        { promptCount: 1, lastPromptedAt: NOW - 90 * DAY },
        NOW,
      ),
    ).toBe(true);
  });

  it('최대 두 번까지만 요청한다', () => {
    expect(
      isPlayReviewPromptEligible(
        100,
        { promptCount: 2, lastPromptedAt: NOW - 180 * DAY },
        NOW,
      ),
    ).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import {
  chooseDefaultPackage,
  instagramAssets,
  instagramSlides,
  parseCsv,
  parseDailyDocument,
  platformReviewStatus,
  qualityScore,
  targetBlogSlug,
} from './dailyPackage';
import type { StudioPackage } from './types';

function packageFixture(date: string): StudioPackage {
  return {
    date,
    files: {
      '02-naver-blog.md': 'STATUS: PUBLISH\n\nTITLE: 테스트',
    },
    review: { version: 1, date, updatedAt: '', items: {} },
  };
}

describe('SEO Studio daily package parser', () => {
  it('parses multiline labeled fields', () => {
    const document = parseDailyDocument(
      'STATUS: PUBLISH\n\nBODY:\n첫 문단\n\n둘째 문단\n\nIS RESPONSE USEFUL?: NO\n\nTAGS:\nSQLD\n자격증',
    );
    expect(document.fields.STATUS).toBe('PUBLISH');
    expect(document.fields.BODY).toContain('둘째 문단');
    expect(document.fields['IS RESPONSE USEFUL?']).toBe('NO');
    expect(document.fields.TAGS).toContain('자격증');
  });

  it('extracts blog slug and carousel slides', () => {
    const blog = parseDailyDocument(
      'TARGET URL: https://quest-dp.com/blog/SQLD-%EA%B3%B5%EB%B6%80%EB%B2%95/',
    );
    expect(targetBlogSlug(blog)).toBe('SQLD-공부법');

    const instagram = parseDailyDocument(
      'ASSET 2: instagram-02.png\n\nASSET 1: instagram-01.png\n\nSLIDE 2: 둘\n\nSLIDE 1: 하나\n\nSLIDE 3: 셋',
    );
    expect(instagramSlides(instagram)).toEqual(['하나', '둘', '셋']);
    expect(instagramAssets(instagram)).toEqual(['instagram-01.png', 'instagram-02.png']);
  });

  it('reads explicit quality scores and review state precedence', () => {
    expect(qualityScore(parseDailyDocument('QUALITY SCORE: 91 / 100'))).toBe(91);
    const fixture = packageFixture('2026-08-25');
    fixture.review.items.naver = {
      status: 'NEEDS_REVISION',
      feedback: '도입부 수정',
      updatedAt: '2026-08-24T00:00:00.000Z',
    };
    expect(platformReviewStatus(fixture, 'naver')).toBe('NEEDS_REVISION');
  });

  it('treats a community package with no useful response as HOLD', () => {
    const fixture = packageFixture('2026-08-25');
    fixture.files['08-community-opportunities.md'] =
      'PLATFORM: NO ACTION TODAY\nIS RESPONSE USEFUL?: NO\n';
    expect(platformReviewStatus(fixture, 'community')).toBe('HOLD');
  });

  it('selects the nearest upcoming package and falls back to latest', () => {
    const packages = [
      packageFixture('2026-08-24'),
      packageFixture('2026-08-27'),
      packageFixture('2026-09-01'),
    ];
    expect(chooseDefaultPackage(packages, '2026-08-25')?.date).toBe('2026-08-27');
    expect(chooseDefaultPackage(packages, '2026-09-10')?.date).toBe('2026-09-01');
  });

  it('parses quoted CSV cells', () => {
    const rows = parseCsv('a,b,c\n1,"two, too",3\n');
    expect(rows).toEqual([
      ['a', 'b', 'c'],
      ['1', 'two, too', '3'],
    ]);
  });
});

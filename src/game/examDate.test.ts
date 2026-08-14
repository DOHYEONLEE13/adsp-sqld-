// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import {
  ensureNearestUpcomingExamDate,
  getExamDate,
  mergePulledExamDates,
  setExamDate,
} from './examDate';

describe('ensureNearestUpcomingExamDate', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('ADsP의 가장 가까운 예정 회차를 최초 기본값으로 저장한다', () => {
    const now = new Date(2026, 7, 13, 12).getTime();

    expect(ensureNearestUpcomingExamDate('adsp', now)).toBe('2026-10-31');
    expect(getExamDate('adsp')).toBe('2026-10-31');
  });

  it('SQLD의 가장 가까운 예정 회차를 최초 기본값으로 저장한다', () => {
    const now = new Date(2026, 7, 13, 12).getTime();

    expect(ensureNearestUpcomingExamDate('sqld', now)).toBe('2026-08-22');
    expect(getExamDate('sqld')).toBe('2026-08-22');
  });

  it('사용자가 이미 선택한 시험일은 덮어쓰지 않는다', () => {
    setExamDate('sqld', '2026-11-14');
    const now = new Date(2026, 7, 13, 12).getTime();

    expect(ensureNearestUpcomingExamDate('sqld', now)).toBe('2026-11-14');
    expect(getExamDate('sqld')).toBe('2026-11-14');
  });

  it('남은 시험 회차가 없으면 임의 날짜를 만들지 않는다', () => {
    const now = new Date(2027, 0, 1, 12).getTime();

    expect(ensureNearestUpcomingExamDate('adsp', now)).toBeUndefined();
    expect(getExamDate('adsp')).toBeUndefined();
  });
});

describe('mergePulledExamDates', () => {
  it('빈 서버 응답이 온보딩에서 막 저장한 기본 시험일을 지우지 않는다', () => {
    expect(
      mergePulledExamDates({}, { sqld: '2026-08-22' }, {}),
    ).toEqual({ sqld: '2026-08-22' });
  });

  it('조회 중 로컬 변경이 없으면 서버의 변경과 삭제를 그대로 사용한다', () => {
    expect(
      mergePulledExamDates(
        { adsp: '2026-10-31', sqld: '2026-08-22' },
        { adsp: '2026-10-31', sqld: '2026-08-22' },
        { sqld: '2026-11-14' },
      ),
    ).toEqual({ sqld: '2026-11-14' });
  });
});

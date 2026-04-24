/**
 * 시험 D-day — 사용자 설정 시험 날짜를 localStorage 에 저장하고
 * "오늘로부터 며칠 남았는지" 를 계산합니다.
 *
 * 두 과목은 각자 독립적인 시험일을 가질 수 있음 (ADSP / SQLD 분기).
 * 저장 포맷은 `YYYY-MM-DD` 문자열 (타임존 영향 없는 비교용).
 */

import type { Subject } from '@/types/question';

const STORAGE_KEY = 'questdp.examDates.v1';

type ExamDates = Partial<Record<Subject, string>>;

function load(): ExamDates {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function save(dates: ExamDates): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
  } catch {
    /* quota — 무시 */
  }
  // 동일 탭 내 다른 구독자 알림 — 단순 storage 이벤트 모방은 생략하고
  // 호출 측에서 setState 로 리렌더 유도.
}

export function getExamDate(subject: Subject): string | undefined {
  return load()[subject];
}

export function setExamDate(subject: Subject, ymd: string | null): void {
  const cur = load();
  if (ymd === null || ymd === '') delete cur[subject];
  else cur[subject] = ymd;
  save(cur);
}

export function getAllExamDates(): ExamDates {
  return load();
}

/**
 * YYYY-MM-DD → 오늘로부터 남은 일수.
 * 음수면 시험이 지남. null 이면 미설정.
 */
export function daysUntil(ymd: string | undefined, now: number = Date.now()): number | null {
  if (!ymd) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;
  const target = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  target.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

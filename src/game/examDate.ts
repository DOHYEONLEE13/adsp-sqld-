/**
 * 시험 D-day — 사용자 설정 시험 날짜를 localStorage 에 저장하고
 * "오늘로부터 며칠 남았는지" 를 계산합니다.
 *
 * 두 과목은 각자 독립적인 시험일을 가질 수 있음 (ADSP / SQLD 분기).
 * 저장 포맷은 `YYYY-MM-DD` 문자열 (타임존 영향 없는 비교용).
 *
 * Hybrid sync: localStorage 즉시 반영, 인증돼 있으면 Supabase 에 background push.
 */

import type { Subject } from '@/types/question';
import { getSupabase, onAuthStateChange } from '@/lib/supabase';
import { decideSignInTransition } from '@/lib/signInTransition';

const STORAGE_KEY = 'questdp.examDates.v1';

// ─── 시험일 프리셋 ──────────────────────────────────────────────────────
// 한국데이터산업진흥원 공식 일정 — 2026 년 4 회차 ADSP / SQLD.
// 사용자가 [회차 선택] 으로 클릭 한 번에 D-day 설정 가능.
// 2027 일정 발표 시 이 배열에 추가.

export interface ExamPreset {
  subject: Subject;
  /** "제48회" 같이 회차 표기 — UI 라벨에 사용. */
  round: string;
  /** YYYY-MM-DD — getExamDate / setExamDate 와 동일 포맷. */
  date: string;
  /** 사람이 읽는 표시 — "2026.02.07 (토)" 등. */
  display: string;
}

export const EXAM_PRESETS: ExamPreset[] = [
  // ADSP 2026
  { subject: 'adsp', round: '제48회', date: '2026-02-07', display: '2026.02.07 (토)' },
  { subject: 'adsp', round: '제49회', date: '2026-05-17', display: '2026.05.17 (일)' },
  { subject: 'adsp', round: '제50회', date: '2026-08-08', display: '2026.08.08 (토)' },
  { subject: 'adsp', round: '제51회', date: '2026-10-31', display: '2026.10.31 (토)' },
  // SQLD 2026
  { subject: 'sqld', round: '제60회', date: '2026-03-07', display: '2026.03.07 (토)' },
  { subject: 'sqld', round: '제61회', date: '2026-05-31', display: '2026.05.31 (일)' },
  { subject: 'sqld', round: '제62회', date: '2026-08-22', display: '2026.08.22 (토)' },
  { subject: 'sqld', round: '제63회', date: '2026-11-14', display: '2026.11.14 (토)' },
];

/** 과목별 다가오는 시험 프리셋 (오늘 이후만, 가까운 순). */
export function getUpcomingPresets(
  subject: Subject,
  now: number = Date.now(),
): ExamPreset[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return EXAM_PRESETS.filter((p) => {
    if (p.subject !== subject) return false;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(p.date);
    if (!m) return false;
    const exam = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return exam.getTime() >= today.getTime();
  });
}

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
  void serverSetExamDate(subject, ymd);
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

// ─── Supabase sync layer ────────────────────────────────────────────────

async function serverSetExamDate(subject: Subject, ymd: string | null): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data: sess } = await sb.auth.getSession();
    if (!sess.session) return;
    if (ymd === null || ymd === '') {
      await sb
        .from('exam_dates')
        .delete()
        .eq('user_id', sess.session.user.id)
        .eq('subject', subject);
    } else {
      await sb
        .from('exam_dates')
        .upsert(
          { user_id: sess.session.user.id, subject, exam_date: ymd },
          { onConflict: 'user_id,subject' },
        );
    }
  } catch {
    /* 무시 */
  }
}

async function pullExamDates(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) return;
  const { data, error } = await sb
    .from('exam_dates')
    .select('subject, exam_date');
  if (error || !data) return;
  const merged: ExamDates = {};
  for (const row of data as Array<{ subject: Subject; exam_date: string }>) {
    merged[row.subject] = row.exam_date;
  }
  save(merged);
}

let _syncStarted = false;

/** server push 없이 local 만 비우는 변형 — guest→기존 계정 전환 시. */
function resetExamDatesLocal(): void {
  save({});
}

export function initExamDatesSync(): () => void {
  if (_syncStarted) return () => {};
  _syncStarted = true;

  void pullExamDates();
  const unsub = onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      if (session?.user.id) {
        const decision = await decideSignInTransition(session.user.id);
        if (decision === 'reset') {
          resetExamDatesLocal();
        }
      }
      void pullExamDates();
    }
  });
  return () => {
    unsub();
    _syncStarted = false;
  };
}

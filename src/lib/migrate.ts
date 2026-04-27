/**
 * migrate.ts — 첫 로그인 시 localStorage → Supabase 일회 마이그레이션.
 *
 * 흐름:
 *  1. 사용자가 OAuth 로그인 → onAuthStateChange('SIGNED_IN')
 *  2. 서버 sessions count = 0 인지 확인 → 신규 가입자만 마이그레이션
 *  3. localStorage 의 progress / bookmarks / examDates 를 batch insert
 *  4. localStorage 에 마이그레이션 완료 flag 저장 → 재실행 방지
 *
 * 실패 시: 부분 진행 그대로 두고 다음 로그인에 retry. 사용자 경험은 깨지 않음.
 *
 * XP / level / streak / total_xp 는 마이그레이션 안 함 — 이후 새 세션부터 자연 누적.
 * (현재 RLS 가 클라 직접 변경 차단 + 마이그레이션 전용 RPC 가 없어서. 추후 필요시 추가.)
 */

import { getSupabase, onAuthStateChange } from './supabase';

const MIGRATION_FLAG_KEY = 'questdp.migrated.v1';
const PROGRESS_KEY = 'questdp.progress.v1';
const BOOKMARKS_KEY = 'questdp.bookmarks.v1';
const EXAM_DATES_KEY = 'questdp.examDates.v1';

interface ProgressV1 {
  version: 1;
  questionStats: Record<string, {
    attempts: number;
    correct: number;
    wrongStreak: number;
    lastCorrect: boolean;
    lastSeenAt: number;
    lastTimeMs: number;
    avgTimeMs: number;
  }>;
  sessions: Array<{
    at: number;
    subject: 'adsp' | 'sqld';
    chapter: number;
    chapterTitle: string;
    topic: string | null;
    total: number;
    correctCount: number;
    totalTimeMs: number;
    label?: string;
    wrongQuestionIds?: string[];
  }>;
}

interface BookmarksV1 {
  version: 1;
  ids: string[] | { type?: 'Set'; values?: string[] };
  notes: Record<string, string>;
}

type ExamDatesV1 = Partial<Record<'adsp' | 'sqld', string>>;

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function alreadyMigrated(userId: string): boolean {
  if (typeof window === 'undefined') return true;
  const flag = window.localStorage.getItem(MIGRATION_FLAG_KEY);
  return flag === userId;
}

function markMigrated(userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MIGRATION_FLAG_KEY, userId);
  } catch {
    /* 무시 */
  }
}

/**
 * 마이그레이션 본체. authenticated 사용자에 대해 1회 실행.
 * 서버에 이미 데이터가 있으면 (다른 기기에서 만든 계정) skip.
 */
async function runMigration(userId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  if (alreadyMigrated(userId)) return;

  // 서버에 이미 sessions 있으면 skip — 신규 사용자가 아님
  const { count: existingSessions } = await sb
    .from('sessions')
    .select('*', { count: 'exact', head: true });
  if ((existingSessions ?? 0) > 0) {
    markMigrated(userId);
    return;
  }

  // ── progress (sessions + question_stats) ─────────────────────────
  const progress = readJson<ProgressV1>(PROGRESS_KEY);
  if (progress) {
    // sessions 일괄 insert
    if (progress.sessions.length > 0) {
      const rows = progress.sessions.map((s) => ({
        user_id: userId,
        subject: s.subject,
        chapter: s.chapter,
        chapter_title: s.chapterTitle,
        topic: s.topic,
        total: s.total,
        correct_count: s.correctCount,
        total_time_ms: s.totalTimeMs,
        label: s.label ?? null,
        wrong_question_ids: s.wrongQuestionIds ?? [],
        flow: null,                       // 옛 로컬 데이터엔 flow 없음
        ended_at: new Date(s.at).toISOString(),
        client_id: `legacy-${s.at}`,      // 멱등 키 — 재실행해도 같은 row
      }));
      // Supabase 는 배열을 한 번에 insert 가능. RLS 통과 (user_id = auth.uid()).
      const { error } = await sb
        .from('sessions')
        .upsert(rows, { onConflict: 'user_id,client_id', ignoreDuplicates: true });
      if (error) {
        console.warn('[migrate] sessions insert failed', error.message);
      }
    }

    // question_stats UPSERT
    const qStats = Object.entries(progress.questionStats);
    if (qStats.length > 0) {
      const rows = qStats.map(([qid, s]) => ({
        user_id: userId,
        question_id: qid,
        attempts: s.attempts,
        correct: s.correct,
        wrong_streak: s.wrongStreak,
        last_correct: s.lastCorrect,
        last_seen_at: new Date(s.lastSeenAt).toISOString(),
        last_time_ms: s.lastTimeMs,
        avg_time_ms: s.avgTimeMs,
      }));
      const { error } = await sb
        .from('question_stats')
        .upsert(rows, { onConflict: 'user_id,question_id' });
      if (error) {
        console.warn('[migrate] question_stats upsert failed', error.message);
      }
    }
  }

  // ── bookmarks ────────────────────────────────────────────────────
  const bookmarks = readJson<BookmarksV1>(BOOKMARKS_KEY);
  if (bookmarks) {
    const ids: string[] = Array.isArray(bookmarks.ids)
      ? bookmarks.ids
      : (bookmarks.ids?.values ?? []);
    if (ids.length > 0) {
      const rows = ids.map((qid) => ({
        user_id: userId,
        question_id: qid,
        note: bookmarks.notes?.[qid] ?? '',
      }));
      const { error } = await sb
        .from('bookmarks')
        .upsert(rows, { onConflict: 'user_id,question_id' });
      if (error) {
        console.warn('[migrate] bookmarks upsert failed', error.message);
      }
    }
  }

  // ── exam_dates ───────────────────────────────────────────────────
  const exam = readJson<ExamDatesV1>(EXAM_DATES_KEY);
  if (exam) {
    const rows: Array<{ user_id: string; subject: string; exam_date: string }> = [];
    if (exam.adsp) rows.push({ user_id: userId, subject: 'adsp', exam_date: exam.adsp });
    if (exam.sqld) rows.push({ user_id: userId, subject: 'sqld', exam_date: exam.sqld });
    if (rows.length > 0) {
      const { error } = await sb
        .from('exam_dates')
        .upsert(rows, { onConflict: 'user_id,subject' });
      if (error) {
        console.warn('[migrate] exam_dates upsert failed', error.message);
      }
    }
  }

  markMigrated(userId);
  console.info('[migrate] localStorage → Supabase 마이그레이션 완료');
}

/**
 * App mount 시 한 번 호출. SIGNED_IN 시 마이그레이션 트리거.
 */
export function initMigration(): () => void {
  // 이미 세션이 있는 경우도 처리 (페이지 새로고침)
  const sb = getSupabase();
  if (sb) {
    void sb.auth.getSession().then(({ data }) => {
      if (data.session) {
        void runMigration(data.session.user.id);
      }
    });
  }

  const unsub = onAuthStateChange((event, session) => {
    if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
      void runMigration(session.user.id);
    }
  });

  return unsub;
}

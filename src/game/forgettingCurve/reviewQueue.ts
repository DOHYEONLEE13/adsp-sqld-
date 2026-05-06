/**
 * reviewQueue — 일일 복습 큐 생성 + 우선순위 정렬 + 일일 상한.
 *
 * Phase 4 Step 4 — 망각 곡선 시스템.
 *
 * 알고리즘 명세 (리서치 3-2절, 변경 금지):
 *
 *   우선순위 (점수 높을수록 먼저):
 *     1. 만기 (overdue): due_date <= today
 *     2. 어제 틀린 문제 (wrong_yesterday): yesterday 의 sessions 에서 오답 기록
 *     3. 약점 단원 (weak_chapter): 문항 chapter_id 가 weak_chapters 에 포함
 *     4. 오래된 항목 (last_attempted_at 가 가장 옛것)
 *
 *   상한 (페르소나별, DAILY_REVIEW_LIMITS):
 *     - beginner: 15 문항/일
 *     - reviewer: 25 문항/일
 *     - 초과 항목 = 다음 날 이월 (큐 폭발 방지)
 *
 *   미접속 누적 시 큐 폭발 방지:
 *     - 7일 이상 이월된 항목 = inactivityHandler 의 suggest_reset 분기
 */

import type {
  ReviewItem,
  ReviewQueueItem,
  ReviewIntervalDays,
} from '@/types/learning/reviewItem';
import { DAILY_REVIEW_LIMITS } from '@/types/learning/reviewItem';
import type { Persona } from '@/types/learning';
import type { SessionRecord } from '@/game/storage';
import type { Subject } from '@/types/question';

/** 1일 (ms) — 어제 판정용. */
const DAY_MS = 24 * 60 * 60 * 1000;

/** 큐 빌드 입력. */
export interface QueueContext {
  /** 사용자 활성 ReviewItem 목록 (status='active' 만 포함 가정). */
  items: readonly ReviewItem[];
  /** 진단 또는 사용자 선택 약점 chapter_id 목록. */
  weak_chapters?: readonly string[];
  /** 어제~오늘 학습 세션 (어제 오답 판정용). */
  sessions?: readonly SessionRecord[];
  /** 페르소나 (일일 상한 결정). */
  persona: Persona;
  /** 오늘 시각 (테스트 주입용). */
  today?: Date;
  /** question_id → chapter / topic 정보 매핑 (약점 chapter 매칭용). */
  questionMeta?: Record<
    string,
    { subject: Subject; chapter: number; topic?: string; chapter_id?: string }
  >;
}

/**
 * 일일 복습 큐 생성.
 *
 * 처리 순서:
 *   1. 만기 항목 (due_date <= today) 만 후보로 추출
 *   2. 각 항목의 priority 점수 산정
 *   3. priority 내림차순 정렬
 *   4. 페르소나별 상한 적용 — 초과는 잘라냄 (다음 날 이월)
 */
export function generateDailyReviewQueue(ctx: QueueContext): ReviewQueueItem[] {
  const today = ctx.today ?? new Date();
  const yesterdayMs = today.getTime() - DAY_MS;

  // 어제 오답 question_id 집합
  const wrongYesterday = collectYesterdayWrong(ctx.sessions ?? [], today);

  // 약점 chapter_id 집합
  const weakSet = new Set(ctx.weak_chapters ?? []);

  // 1. 만기 항목 추출 (active 만, paused/mastered 제외)
  const candidates = ctx.items.filter((it) => {
    if (it.status !== 'active') return false;
    if (!it.due_date) return false;
    return it.due_date.getTime() <= today.getTime();
  });

  // 2. priority 산정
  const queueItems: ReviewQueueItem[] = candidates.map((it) => {
    const meta = ctx.questionMeta?.[it.question_id];
    const isOverdue =
      !!it.due_date && it.due_date.getTime() < yesterdayMs; // 어제보다 이전 만기
    const isWrongYesterday = wrongYesterday.has(it.question_id);
    const chapterIdForCheck = meta?.chapter_id;
    const isWeakChapter =
      !!chapterIdForCheck && weakSet.has(chapterIdForCheck);

    const reason: ReviewQueueItem['priority_reason'] = isOverdue
      ? 'overdue'
      : isWrongYesterday
        ? 'wrong_yesterday'
        : isWeakChapter
          ? 'weak_chapter'
          : 'normal';

    return {
      user_id: it.user_id,
      question_id: it.question_id,
      current_interval: it.current_interval,
      due_date: it.due_date,
      priority: priorityScore({
        isOverdue,
        isWrongYesterday,
        isWeakChapter,
        last_attempted_at: it.last_attempted_at,
        today,
        current_interval: it.current_interval,
      }),
      priority_reason: reason,
      question_topic: meta?.topic,
      question_chapter: meta?.chapter,
    };
  });

  // 3. 정렬 (점수 내림차순)
  queueItems.sort((a, b) => b.priority - a.priority);

  // 4. 일일 상한 적용
  const limit = DAILY_REVIEW_LIMITS[ctx.persona === 'reviewer' ? 'reviewer' : 'beginner'];
  return queueItems.slice(0, limit);
}

/**
 * priority 점수 산정.
 *
 * 가중치 (높을수록 먼저):
 *   - overdue: +10000 (최우선 — 어제 이전 만기)
 *   - wrong_yesterday: +5000
 *   - weak_chapter: +1000
 *   - last_attempted 오래된 정도 (일 단위): +N (오래된 것 우선)
 *   - interval 짧은 것 (어려운 문항): +interval_bonus (1d → +50, 30d → +0)
 */
function priorityScore(input: {
  isOverdue: boolean;
  isWrongYesterday: boolean;
  isWeakChapter: boolean;
  last_attempted_at: Date;
  today: Date;
  current_interval: ReviewIntervalDays;
}): number {
  let score = 0;
  if (input.isOverdue) score += 10000;
  if (input.isWrongYesterday) score += 5000;
  if (input.isWeakChapter) score += 1000;

  // 마지막 풀이 후 경과 일수 — 오래된 것 우선
  const elapsedDays = Math.floor(
    (input.today.getTime() - input.last_attempted_at.getTime()) / DAY_MS,
  );
  score += Math.max(0, elapsedDays);

  // interval 짧은 것 (어려운 문항) 약간 우선
  const intervalBonus: Record<ReviewIntervalDays, number> = {
    0: 60,
    1: 50,
    3: 30,
    7: 15,
    14: 5,
    30: 0,
  };
  score += intervalBonus[input.current_interval];

  return score;
}

/**
 * 어제 학습 세션에서 틀린 question_id 집합.
 *
 * "어제" = 오늘 자정 - 24h ~ 오늘 자정 (로컬). 단순화: today.getTime() - 24h ~ today.getTime().
 */
function collectYesterdayWrong(
  sessions: readonly SessionRecord[],
  today: Date,
): Set<string> {
  const result = new Set<string>();
  const todayMs = today.getTime();
  const yesterdayStartMs = todayMs - 2 * DAY_MS;
  const yesterdayEndMs = todayMs - 0; // 오늘 시작 전까지 — 단순화: 24h 윈도우
  for (const s of sessions) {
    if (s.at < yesterdayStartMs || s.at > yesterdayEndMs) continue;
    if (!s.wrongQuestionIds) continue;
    for (const q of s.wrongQuestionIds) result.add(q);
  }
  return result;
}

/**
 * 큐 폭발 시점 감지 — 만기지만 일일 상한 초과로 누적된 항목 수.
 *
 * @param overflowDays - 며칠 이상 이월되면 폭발로 간주 (기본 7)
 */
export function detectQueueOverflow(
  items: readonly ReviewItem[],
  today: Date,
  overflowDays = 7,
): { overflowCount: number; oldestDays: number } {
  const todayMs = today.getTime();
  const threshold = todayMs - overflowDays * DAY_MS;
  let overflowCount = 0;
  let oldestDays = 0;
  for (const it of items) {
    if (it.status !== 'active') continue;
    if (!it.due_date) continue;
    if (it.due_date.getTime() > today.getTime()) continue;
    const daysOverdue = Math.floor(
      (todayMs - it.due_date.getTime()) / DAY_MS,
    );
    if (it.due_date.getTime() < threshold) overflowCount++;
    if (daysOverdue > oldestDays) oldestDays = daysOverdue;
  }
  return { overflowCount, oldestDays };
}

/**
 * 30일 이상 이월된 항목을 자동 mastered 처리 (큐 폭발 방지).
 * 또는 paused 상태로 전환해 사용자에게 lesson 다시 보기 추천 가능.
 *
 * @returns 변경된 item id 목록
 */
export function autoMasterStaleItems(
  items: ReviewItem[],
  today: Date,
  staleDays = 30,
): {
  updatedItems: ReviewItem[];
  staleIds: string[];
} {
  const staleIds: string[] = [];
  const staleMs = today.getTime() - staleDays * DAY_MS;
  const updatedItems = items.map((it) => {
    if (it.status !== 'active') return it;
    if (!it.due_date) return it;
    if (it.due_date.getTime() > staleMs) return it;
    staleIds.push(it.question_id);
    // 30일 이상 미수행 → mastered 자동 전환 (관용적 처리 — 사용자 부담 최소화)
    return { ...it, status: 'mastered' as const, due_date: null };
  });
  return { updatedItems, staleIds };
}

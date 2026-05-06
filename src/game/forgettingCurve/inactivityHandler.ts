/**
 * inactivityHandler — 미접속 처리 알고리즘.
 *
 * Phase 4 Step 4 — 망각 곡선 시스템.
 *
 * 알고리즘 명세 (리서치 3-3절 + 사용자 결정):
 *
 *   미접속 정의: localStorage.lastActiveAt 갱신 시점 기준.
 *     - 어느 페이지든 진입 = 활성 (lastActiveAt 갱신)
 *     - 단순 진입만으로 활성 인정 (실제 학습 안 해도)
 *
 *   분기:
 *     0~1일 미접속:  action='none' (무알림)
 *     1~3일 미접속:  action='notify', "복습 큐 N개 대기 중"
 *     3~7일 미접속:  action='inform', "지난 복습 N개 쌓였어요"
 *     7일 이상 미접속: action='suggest_reset', "전체 큐 재계산할까요?"
 *
 *   reset 옵션 처리:
 *     - reset 선택: 모든 ReviewItem.due_date = today + 1일, current_interval = 1, ease_factor 유지
 *     - keep 선택: 현재 큐 그대로 (큐 폭발 가능성 경고)
 */

import type { ReviewItem } from '@/types/learning/reviewItem';

/** 1일 (ms). */
const DAY_MS = 24 * 60 * 60 * 1000;

/** 미접속 단계 임계값 (일). */
export const INACTIVITY_THRESHOLDS = {
  NOTIFY: 1,
  INFORM: 3,
  SUGGEST_RESET: 7,
} as const;

/** handleInactivity 결과. */
export interface InactivityAction {
  action: 'none' | 'notify' | 'inform' | 'suggest_reset';
  /** UI 메시지. */
  message: string;
  /** suggest_reset 시 사용자 선택 옵션. */
  options?: Array<'reset' | 'keep'>;
  /** 미접속 일수 (UI 표시용). */
  inactivityDays: number;
  /** 만기 큐 항목 수. */
  pendingCount: number;
}

/**
 * 미접속 단계 판정.
 *
 * @param last_active - 마지막 활성 시각
 * @param today - 기준 시각
 * @param pending_reviews - 만기 ReviewItem 목록 (status='active' + due_date <= today)
 */
export function handleInactivity(
  last_active: Date,
  today: Date,
  pending_reviews: readonly ReviewItem[],
): InactivityAction {
  const inactivityDays = Math.floor(
    (today.getTime() - last_active.getTime()) / DAY_MS,
  );
  const pendingCount = pending_reviews.length;

  if (inactivityDays >= INACTIVITY_THRESHOLDS.SUGGEST_RESET) {
    return {
      action: 'suggest_reset',
      message: pendingCount > 0
        ? `${inactivityDays}일 동안 안 보였어! 복습 ${pendingCount}개가 쌓였어요. 전체 큐를 재계산할까요?`
        : `${inactivityDays}일 동안 안 보였어! 다시 시작해볼까요?`,
      options: ['reset', 'keep'],
      inactivityDays,
      pendingCount,
    };
  }

  if (inactivityDays >= INACTIVITY_THRESHOLDS.INFORM) {
    return {
      action: 'inform',
      message: pendingCount > 0
        ? `${inactivityDays}일 미접속 — 지난 복습 ${pendingCount}개가 쌓였어요. 천천히 따라가볼까?`
        : `${inactivityDays}일 미접속 — 다시 만나서 반가워요!`,
      inactivityDays,
      pendingCount,
    };
  }

  if (inactivityDays >= INACTIVITY_THRESHOLDS.NOTIFY) {
    return {
      action: 'notify',
      message: pendingCount > 0
        ? `복습 큐 ${pendingCount}개 대기 중`
        : `오늘도 가볍게 한 판?`,
      inactivityDays,
      pendingCount,
    };
  }

  return {
    action: 'none',
    message: '',
    inactivityDays,
    pendingCount,
  };
}

/**
 * 큐 재계산 (reset) — 모든 active 항목의 due_date 를 today+1d 로 통일.
 * current_interval 은 1로 리셋. ease_factor 는 보존.
 *
 * 사용자가 "다시 시작" 선택 시 호출. paused/mastered 는 보존.
 */
export function resetQueue(
  items: readonly ReviewItem[],
  today: Date,
): ReviewItem[] {
  const tomorrow = new Date(today.getTime() + DAY_MS);
  return items.map((it) => {
    if (it.status !== 'active') return it;
    return {
      ...it,
      current_interval: 1,
      due_date: tomorrow,
      consecutive_correct: 0,
      consecutive_wrong: 0,
    };
  });
}

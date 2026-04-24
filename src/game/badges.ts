/**
 * 뱃지 시스템 — 20종 업적 정의 + 획득 여부 판정.
 *
 * 순수 계산 — `ProgressStore` + `PlayerStats` 만 입력으로 받습니다.
 * 저장은 하지 않고 매번 조건을 재평가 (저렴 · 캐시 불일치 위험 없음).
 */

import type { ProgressStore } from './storage';
import type { PlayerStats } from './rpg';

export interface BadgeDef {
  id: string;
  /** 한글 이름. */
  name: string;
  /** 한 줄 설명 (획득 조건). */
  description: string;
  /** 카테고리. UI 그룹핑용. */
  group: 'session' | 'level' | 'streak' | 'accuracy' | 'coverage' | 'quirky';
  /** 이모지 1자. 아이콘. */
  icon: string;
  /** 이 뱃지를 획득했나? */
  earned: (ctx: BadgeContext) => boolean;
}

export interface BadgeContext {
  progress: ProgressStore;
  stats: PlayerStats;
  totalAttempts: number;
  totalCorrect: number;
  /** 한 번이라도 세션을 한 과목 수 (0~2). */
  subjectsTouched: Set<string>;
  /** 완벽 세션(정답률 100% & total>=5) 존재 여부. */
  hasPerfectSession: boolean;
  /** total >= 50 인 세션 존재 (= 모의고사 수행). */
  hasMockExamSession: boolean;
  /** 0~4시 사이에 시작된 세션이 있었나. */
  hasLateNightSession: boolean;
}

function overallAccuracy(ctx: BadgeContext): number {
  return ctx.totalAttempts === 0 ? 0 : ctx.totalCorrect / ctx.totalAttempts;
}

export const BADGES: readonly BadgeDef[] = [
  // 세션 누적 ----------------------------------------------------------
  {
    id: 'first-step',
    name: '첫 걸음',
    description: '첫 세션 완료',
    group: 'session',
    icon: '🌱',
    earned: (c) => c.stats.sessionsCount >= 1,
  },
  {
    id: 'routine',
    name: '루틴',
    description: '10회 세션 완료',
    group: 'session',
    icon: '📘',
    earned: (c) => c.stats.sessionsCount >= 10,
  },
  {
    id: 'devotion',
    name: '헌신',
    description: '50회 세션 완료',
    group: 'session',
    icon: '🏅',
    earned: (c) => c.stats.sessionsCount >= 50,
  },
  {
    id: 'obsession',
    name: '집념',
    description: '100회 세션 완료',
    group: 'session',
    icon: '🏆',
    earned: (c) => c.stats.sessionsCount >= 100,
  },

  // 레벨 ---------------------------------------------------------------
  {
    id: 'level-2',
    name: '입문자',
    description: 'Lv.2 달성',
    group: 'level',
    icon: '⭐',
    earned: (c) => c.stats.level >= 2,
  },
  {
    id: 'level-5',
    name: '모험가',
    description: 'Lv.5 달성',
    group: 'level',
    icon: '🛰',
    earned: (c) => c.stats.level >= 5,
  },
  {
    id: 'level-10',
    name: '정복자',
    description: 'Lv.10 달성',
    group: 'level',
    icon: '👑',
    earned: (c) => c.stats.level >= 10,
  },
  {
    id: 'level-20',
    name: '초신성',
    description: 'Lv.20 달성',
    group: 'level',
    icon: '🌟',
    earned: (c) => c.stats.level >= 20,
  },

  // 스트릭 -------------------------------------------------------------
  {
    id: 'spark',
    name: '불꽃',
    description: '3일 연속 학습',
    group: 'streak',
    icon: '🔥',
    earned: (c) => c.stats.streakDays >= 3,
  },
  {
    id: 'blaze',
    name: '활활',
    description: '7일 연속 학습',
    group: 'streak',
    icon: '🔥🔥',
    earned: (c) => c.stats.streakDays >= 7,
  },
  {
    id: 'furnace',
    name: '용광로',
    description: '14일 연속 학습',
    group: 'streak',
    icon: '🌋',
    earned: (c) => c.stats.streakDays >= 14,
  },
  {
    id: 'eternal',
    name: '영원불멸',
    description: '30일 연속 학습',
    group: 'streak',
    icon: '♾️',
    earned: (c) => c.stats.streakDays >= 30,
  },

  // 정확도 -------------------------------------------------------------
  {
    id: 'marksman',
    name: '명사수',
    description: '평균 정답률 70% · 30문 이상',
    group: 'accuracy',
    icon: '🎯',
    earned: (c) => c.totalAttempts >= 30 && overallAccuracy(c) >= 0.7,
  },
  {
    id: 'sniper',
    name: '저격수',
    description: '평균 정답률 85% · 50문 이상',
    group: 'accuracy',
    icon: '🔭',
    earned: (c) => c.totalAttempts >= 50 && overallAccuracy(c) >= 0.85,
  },
  {
    id: 'perfect',
    name: '퍼펙트',
    description: '5문 이상 세션 100% 정답',
    group: 'accuracy',
    icon: '💯',
    earned: (c) => c.hasPerfectSession,
  },
  {
    id: 'century',
    name: '백 번의 탐사',
    description: '누적 풀이 100문항',
    group: 'accuracy',
    icon: '💫',
    earned: (c) => c.totalAttempts >= 100,
  },

  // 커버리지 -----------------------------------------------------------
  {
    id: 'explorer',
    name: '양대산맥',
    description: 'ADSP · SQLD 모두 세션 완료',
    group: 'coverage',
    icon: '🪐',
    earned: (c) =>
      c.subjectsTouched.has('adsp') && c.subjectsTouched.has('sqld'),
  },
  {
    id: 'mock-survivor',
    name: '모의고사 생존자',
    description: '50문항 세션 1회 완료',
    group: 'coverage',
    icon: '📝',
    earned: (c) => c.hasMockExamSession,
  },

  // 괴짜 ---------------------------------------------------------------
  {
    id: 'night-owl',
    name: '심야학습',
    description: '0시 ~ 4시에 세션 진행',
    group: 'quirky',
    icon: '🦉',
    earned: (c) => c.hasLateNightSession,
  },
  {
    id: 'bookworm',
    name: '책벌레',
    description: '누적 풀이 1,000문항',
    group: 'quirky',
    icon: '🐛',
    earned: (c) => c.totalAttempts >= 1000,
  },
];

/** BadgeContext 를 ProgressStore + PlayerStats 에서 계산. */
export function buildBadgeContext(
  progress: ProgressStore,
  stats: PlayerStats,
): BadgeContext {
  let totalAttempts = 0;
  let totalCorrect = 0;
  const subjectsTouched = new Set<string>();
  let hasPerfectSession = false;
  let hasMockExamSession = false;
  let hasLateNightSession = false;

  for (const s of progress.sessions) {
    totalAttempts += s.total;
    totalCorrect += s.correctCount;
    subjectsTouched.add(s.subject);

    if (s.total >= 5 && s.correctCount === s.total) hasPerfectSession = true;
    if (s.total >= 50) hasMockExamSession = true;

    const h = new Date(s.at).getHours();
    if (h >= 0 && h < 4) hasLateNightSession = true;
  }

  return {
    progress,
    stats,
    totalAttempts,
    totalCorrect,
    subjectsTouched,
    hasPerfectSession,
    hasMockExamSession,
    hasLateNightSession,
  };
}

export interface EarnedBadge extends BadgeDef {
  isEarned: boolean;
}

/** 20종 뱃지 전부에 획득 여부 attach. */
export function computeBadges(
  progress: ProgressStore,
  stats: PlayerStats,
): EarnedBadge[] {
  const ctx = buildBadgeContext(progress, stats);
  return BADGES.map((b) => ({ ...b, isEarned: b.earned(ctx) }));
}

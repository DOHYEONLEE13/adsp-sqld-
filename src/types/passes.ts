/**
 * passes.ts — N회독 시스템 타입.
 *
 * 설계 정본: docs/n-pass-design.md
 *
 * Tier 5단계: BRONZE → SILVER → GOLD → PLATINUM → MASTER
 *   - BRONZE   : 1회독 진행 중
 *   - SILVER   : 한 과목이라도 1회독 완료
 *   - GOLD     : 2회독 진행 중
 *   - PLATINUM : 한 과목이라도 2회독 완료
 *   - MASTER   : 두 과목 모두 3회독 stamp 보유
 *
 * Stamp = 챕터 + 회독 차수 단위 영구 기록.
 * 챕터 회독 완료 기준: 정답률 75%.
 */

import type { Subject } from './question';

export type PassTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'master';

export const PASS_TIER_ORDER: PassTier[] = [
  'bronze',
  'silver',
  'gold',
  'platinum',
  'master',
];

/** Tier 표시 이름 (한국어 UI) — 영문 단어 대문자 그대로 노출. */
export const PASS_TIER_LABEL: Record<PassTier, string> = {
  bronze: 'BRONZE',
  silver: 'SILVER',
  gold: 'GOLD',
  platinum: 'PLATINUM',
  master: 'MASTER',
};

/** Tier 의미 (모바일 칩 등 보조 텍스트). */
export const PASS_TIER_MEANING: Record<PassTier, string> = {
  bronze: '1회독 진행 중',
  silver: '1회독 완료',
  gold: '2회독 진행 중',
  platinum: '2회독 완료',
  master: '3회독 마스터',
};

/** 시각 토큰 — 컴포넌트가 직접 import 해서 사용. */
export const PASS_TIER_VISUAL: Record<
  PassTier,
  { color: string; glow: string; mascotPose: string }
> = {
  bronze: { color: '#b45309', glow: 'rgba(103,232,249,0.35)', mascotPose: 'wave' }, // 청동 + cyan glow
  silver: { color: '#94a3b8', glow: 'rgba(52,211,153,0.35)', mascotPose: 'think' }, // 은 + emerald glow
  gold:   { color: '#fbbf24', glow: 'rgba(251,191,36,0.45)', mascotPose: 'lightbulb' },
  platinum: { color: '#67e8f9', glow: 'rgba(192,132,252,0.4)', mascotPose: 'celebrate' },
  master: { color: '#6FFF00', glow: 'rgba(111,255,0,0.55)', mascotPose: 'celebrate' },
};

/** 챕터 + 회독 단위 영구 stamp. Supabase pass_stamps 테이블의 row 와 1:1. */
export interface PassStamp {
  subject: Subject;
  chapter: number;
  passNumber: number;
  achievedAt: string; // ISO
}

/** 한 챕터의 특정 회독 진행 상태. */
export interface ChapterPassProgress {
  subject: Subject;
  chapter: number;
  passNumber: number;
  totalQuestions: number;
  correctCount: number;
  /** 0~1. */
  accuracy: number;
  /** 75% 도달했는가 (stamp 자격). */
  completed: boolean;
  /** 이미 stamp 가 발급됐는가. */
  stamped: boolean;
}

/** 회독 차수 진입 가능성 — 탭 잠금 표시용. */
export interface PassUnlockState {
  /** 1회독은 항상 unlocked. N+1회독은 N회독 stamp 필요. */
  unlocked: boolean;
  /** 현재 진행 중 (stamp 없음, 세션 일부 존재). */
  inProgress: boolean;
  /** stamp 보유 (해당 회독 완료). */
  completed: boolean;
}

export const CHAPTER_PASS_THRESHOLD = 0.75;

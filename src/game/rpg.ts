/**
 * RPG 레이어 — XP / 레벨 / 토픽 마스터리 계산.
 *
 * 저장소 스키마 변경 없이, 기존 `ProgressStore.sessions[]` 와 `questionStats`
 * 로부터 파생만 합니다. 순수 함수 모음 — React 훅은 호출 측에서 `useProgress`
 * 로 구독한 snapshot 을 넘겨주세요.
 *
 * 설계 원칙:
 *   - 세션 단위 XP = 정답당 +10 + 정확도 보너스 + 스트릭 보너스
 *   - 레벨 임계값 = 삼각수 기반 (50·n·(n-1)) → 초반 가볍게, 후반 완만히 가파름
 *   - 토픽 마스터리 5단계 — 기존 aggregateTopic 결과에 매핑
 */

import type { Subject } from '@/types/question';
import type { ProgressStore, SessionRecord } from './storage';
import type { QuestAnswer } from './types';
import { aggregateTopic, type Aggregate } from './aggregate';

// ----------------------------------------------------------------
// XP 계산 — 세션 단위
// ----------------------------------------------------------------

export const XP_PER_CORRECT = 10;

export interface SessionXpInput {
  correctCount: number;
  total: number;
  /** 세션 내 최대 연속 정답 수. 없으면 0. */
  maxStreak?: number;
}

export interface SessionXpBreakdown {
  correctXp: number;
  accuracyBonus: number;
  streakBonus: number;
  total: number;
  accuracy: number;
}

/** 한 세션의 XP 내역. UI 설명 노출용으로 breakdown 을 그대로 돌려줍니다. */
export function xpForSession(input: SessionXpInput): SessionXpBreakdown {
  const total = Math.max(0, input.total);
  const correctCount = Math.max(0, Math.min(input.correctCount, total));
  const accuracy = total === 0 ? 0 : correctCount / total;
  const correctXp = correctCount * XP_PER_CORRECT;

  // 정확도 보너스 — 미니게임 느낌으로 완벽 > 상위권.
  let accuracyBonus = 0;
  if (accuracy >= 1.0) accuracyBonus = 50;
  else if (accuracy >= 0.9) accuracyBonus = 30;
  else if (accuracy >= 0.8) accuracyBonus = 15;

  // 스트릭 보너스 — 3연속부터 한 번에 +5씩.
  const maxStreak = Math.max(0, input.maxStreak ?? 0);
  const streakBonus = maxStreak >= 3 ? (maxStreak - 2) * 5 : 0;

  return {
    correctXp,
    accuracyBonus,
    streakBonus,
    total: correctXp + accuracyBonus + streakBonus,
    accuracy,
  };
}

/** SessionRecord 에서 XP 산출. (저장소엔 개별 answer 가 없어 streak=0 취급.) */
export function xpForSessionRecord(r: SessionRecord): SessionXpBreakdown {
  return xpForSession({ correctCount: r.correctCount, total: r.total });
}

/** answers[] 배열에서 최대 연속 정답 길이 계산. */
export function computeMaxStreak(answers: readonly QuestAnswer[]): number {
  let best = 0;
  let run = 0;
  for (const a of answers) {
    if (a.correct) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return best;
}

// ----------------------------------------------------------------
// 레벨 임계값 — triangular
// ----------------------------------------------------------------

/**
 * 레벨 N 에 도달하기 위해 필요한 누적 XP.
 * thresh(1) = 0, thresh(n) = 50·n·(n-1).
 * → Lv1:0 / Lv2:100 / Lv3:300 / Lv4:600 / Lv5:1000 / Lv6:1500 ...
 */
export function thresholdForLevel(level: number): number {
  const n = Math.max(1, Math.floor(level));
  return 50 * n * (n - 1);
}

export interface LevelInfo {
  level: number;
  xpIntoLevel: number;
  xpSpan: number;
  nextThreshold: number;
  ratio: number;
}

/** 누적 XP → 레벨 정보. */
export function levelFromXp(totalXp: number): LevelInfo {
  const xp = Math.max(0, Math.floor(totalXp));
  // 이분 탐색 없이 단순 루프 — 레벨은 현실적으로 수십 이내.
  let level = 1;
  while (thresholdForLevel(level + 1) <= xp) level += 1;
  const base = thresholdForLevel(level);
  const next = thresholdForLevel(level + 1);
  const span = Math.max(1, next - base);
  const into = xp - base;
  return {
    level,
    xpIntoLevel: into,
    xpSpan: span,
    nextThreshold: next,
    ratio: Math.min(1, into / span),
  };
}

// ----------------------------------------------------------------
// PlayerStats — 전체 누적
// ----------------------------------------------------------------

export interface PlayerStats extends LevelInfo {
  totalXp: number;
  sessionsCount: number;
  correctTotal: number;
  /** 오늘 또는 어제까지 이어진 연속 플레이 일수. */
  streakDays: number;
}

/** 전체 플레이어 상태 — sessions 합산 + 레슨 step 누적 XP. */
export function computePlayerStats(store: ProgressStore): PlayerStats {
  let totalXp = 0;
  let correctTotal = 0;
  for (const s of store.sessions) {
    totalXp += xpForSessionRecord(s).total;
    correctTotal += s.correctCount;
  }
  // 레슨 step 정답으로 누적된 XP (sessions 와 별도)
  totalXp += store.lessonXp ?? 0;
  const lvl = levelFromXp(totalXp);
  return {
    ...lvl,
    totalXp,
    sessionsCount: store.sessions.length,
    correctTotal,
    streakDays: computeStreakDays(
      store.sessions,
      Date.now(),
      Object.keys(store.lessonAttemptsByDay ?? {}),
    ),
  };
}

// ----------------------------------------------------------------
// Streak days — 연속 플레이 일수
// ----------------------------------------------------------------

/** epoch ms → 로컬 자정 기준 day bucket (YYYY-MM-DD). */
function dayKey(at: number): string {
  const d = new Date(at);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/**
 * 오늘부터 하루씩 뒤로 가며 연속 활동 일수.
 * 활동 = Quest session 완료 OR 학습 모드 inline 풀이 1문 이상.
 *
 * @param sessions Quest 세션 이력
 * @param now 현재 epoch ms (테스트용 주입)
 * @param lessonActivityDays 학습 모드 inline 활동 있는 'YYYY-MM-DD' 키 목록
 *                          (기본 [] — 호출 측에서 미공급 시 sessions 만 고려).
 */
export function computeStreakDays(
  sessions: readonly SessionRecord[],
  now: number = Date.now(),
  lessonActivityDays: readonly string[] = [],
): number {
  const days = new Set<string>();
  for (const s of sessions) days.add(dayKey(s.at));
  for (const k of lessonActivityDays) days.add(k);
  if (days.size === 0) return 0;

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayKey = dayKey(today.getTime());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = dayKey(yesterday.getTime());

  // 가장 최근 활동이 오늘도 어제도 아니면 streak = 0.
  if (!days.has(todayKey) && !days.has(yesterdayKey)) return 0;

  // 시작점 — 오늘이 있으면 오늘, 아니면 어제.
  const cursor = new Date(today);
  if (!days.has(todayKey)) cursor.setDate(cursor.getDate() - 1);

  let count = 0;
  // 안전 상한 — 365일 이상은 체크하지 않음.
  for (let i = 0; i < 365; i += 1) {
    if (!days.has(dayKey(cursor.getTime()))) break;
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

// ----------------------------------------------------------------
// 토픽 마스터리 5단계
// ----------------------------------------------------------------

export type MasteryTier =
  | 'none'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond';

export interface MasteryInfo {
  tier: MasteryTier;
  label: string;
  color: string;
  /** lastCorrect 문항 수 / 전체 문항 수 (0~1). */
  ratio: number;
  mastered: number;
  total: number;
}

// 토픽 "탐사도" — Pass Tier (BRONZE/SILVER/GOLD/PLATINUM/MASTER) 와 단어 충돌 회피.
// 우주 탐험 메타포로 한국어 라벨링. enum 키·색상 토큰은 그대로 유지 (대규모 refactor 회피).
const TIER_META: Record<MasteryTier, { label: string; color: string }> = {
  none: { label: '—', color: '#64748b' },
  bronze: { label: '신참', color: '#b45309' },
  silver: { label: '탐사자', color: '#94a3b8' },
  gold: { label: '베테랑', color: '#fbbf24' },
  platinum: { label: '달인', color: '#67e8f9' },
  diamond: { label: '우주인', color: '#c084fc' },
};

/** aggregate 결과를 티어로 매핑. mastered = 마지막에 맞춘 문항 수. */
export function masteryFromAggregate(agg: Aggregate): MasteryInfo {
  const ratio = agg.total === 0 ? 0 : agg.mastered / agg.total;
  let tier: MasteryTier = 'none';
  if (agg.total > 0) {
    if (ratio >= 1.0) tier = 'diamond';
    else if (ratio >= 0.9) tier = 'platinum';
    else if (ratio >= 0.7) tier = 'gold';
    else if (ratio >= 0.5) tier = 'silver';
    else if (agg.mastered >= 3) tier = 'bronze';
  }
  const meta = TIER_META[tier];
  return {
    tier,
    label: meta.label,
    color: meta.color,
    ratio,
    mastered: agg.mastered,
    total: agg.total,
  };
}

/** 편의: (subject, chapter, topic, store) → MasteryInfo. */
export function topicMastery(
  subject: Subject,
  chapter: number,
  topic: string,
  store: ProgressStore,
): MasteryInfo {
  return masteryFromAggregate(aggregateTopic(subject, chapter, topic, store));
}

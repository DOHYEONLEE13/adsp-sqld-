/**
 * passes.ts — N회독 시스템 알고리즘 (순수 함수).
 *
 * 설계 정본: docs/n-pass-design.md
 *
 * 책임:
 *   - 챕터·회독 단위 진행률 계산 (정답률 ≥ 75% 면 stamp 자격)
 *   - Tier 계산 (server RPC `recompute_pass_tier` 의 클라이언트 mirror — 즉시
 *     UI 갱신 + 서버 RPC 가 권위 있는 source)
 *   - 회독 차수 잠금 상태 (탭 잠금 표시용)
 *
 * 주의:
 *   - 이 모듈은 순수 함수만 — Supabase / localStorage 직접 접근 X.
 *     호출자가 sessions 배열·stamps 배열을 입력으로 전달.
 *   - 서버의 `record_pass_completion` RPC 가 stamp 발급의 권위 있는 주체.
 *     클라이언트 계산은 UI 즉시 반응용 (낙관적 미리보기).
 */

import type { Subject } from '@/types/question';
import {
  CHAPTER_PASS_THRESHOLD,
  PASS_TIER_ORDER,
  type ChapterPassProgress,
  type PassStamp,
  type PassTier,
  type PassUnlockState,
} from '@/types/passes';

/** SessionRecord 의 N회독 추적용 슬림 인터페이스. ProgressStore 의 SessionRecord 가 포함. */
export interface PassSession {
  subject: Subject;
  chapter: number;
  passNumber: number;
  total: number;
  correctCount: number;
}

/**
 * 한 챕터·회독의 누적 정답률 + stamp 자격 계산.
 *
 * accuracy = sum(correctCount) / sum(total) (해당 subject·chapter·passNumber 의 모든 sessions).
 * completed = accuracy ≥ 0.75 (서버 임계와 일치).
 * stamped = stamps 에 해당 row 가 있는지.
 */
export function chapterPassProgress(
  sessions: PassSession[],
  stamps: PassStamp[],
  subject: Subject,
  chapter: number,
  passNumber: number,
): ChapterPassProgress {
  let total = 0;
  let correct = 0;
  for (const s of sessions) {
    if (
      s.subject === subject &&
      s.chapter === chapter &&
      s.passNumber === passNumber
    ) {
      total += s.total;
      correct += s.correctCount;
    }
  }
  const accuracy = total > 0 ? correct / total : 0;
  const stamped = stamps.some(
    (st) =>
      st.subject === subject &&
      st.chapter === chapter &&
      st.passNumber === passNumber,
  );
  return {
    subject,
    chapter,
    passNumber,
    totalQuestions: total,
    correctCount: correct,
    accuracy,
    completed: accuracy >= CHAPTER_PASS_THRESHOLD,
    stamped,
  };
}

/**
 * 검수용 dev 토글 — localStorage 의 'questdp.dev.unlockAllPasses' 가 '1' 이면
 * 모든 회독 자동 unlock. StatsPage 의 토글 버튼 또는 콘솔에서 직접 set.
 * 마이그 0013 미적용 환경에서 stamp 가 발급 안 되어 영원히 잠금되는 문제 우회용.
 */
export const DEV_UNLOCK_KEY = 'questdp.dev.unlockAllPasses';

export function isDevUnlockEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(DEV_UNLOCK_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * 특정 회독 차수가 진입 가능한가.
 *
 * 정책:
 *   - 1회독: 항상 unlocked.
 *   - N+1회독: N회독 stamp 가 해당 챕터에 존재해야 unlocked.
 *   - dev 토글 ON 시 모든 회독 강제 unlocked.
 *   - opts.forceUnlocked=true (e.g. studyMode='review') 도 강제 unlocked.
 *     사용자가 명시적으로 "복습용" 모드를 선택했다는 건 다른 곳에서 1회독을
 *     이미 했다는 의미 → QuestDP 안 stamp 가 없어도 2회독부터 진입 허용.
 *
 * 추가로 in-progress / completed 정보를 반환.
 */
export function passUnlockState(
  sessions: PassSession[],
  stamps: PassStamp[],
  subject: Subject,
  chapter: number,
  passNumber: number,
  opts?: { forceUnlocked?: boolean },
): PassUnlockState {
  if (passNumber < 1) {
    return { unlocked: false, inProgress: false, completed: false };
  }

  const completed = stamps.some(
    (st) =>
      st.subject === subject &&
      st.chapter === chapter &&
      st.passNumber === passNumber,
  );

  const inProgress = sessions.some(
    (s) =>
      s.subject === subject &&
      s.chapter === chapter &&
      s.passNumber === passNumber,
  );

  // dev 토글 / 1회독 / studyMode='review' 강제 = 항상 unlocked
  if (
    opts?.forceUnlocked ||
    isDevUnlockEnabled() ||
    passNumber === 1
  ) {
    return { unlocked: true, inProgress, completed };
  }

  // N+1 회독: 직전 회독 stamp 보유 시 unlock
  const prevStamped = stamps.some(
    (st) =>
      st.subject === subject &&
      st.chapter === chapter &&
      st.passNumber === passNumber - 1,
  );
  return { unlocked: prevStamped, inProgress, completed };
}

/**
 * 사용자가 어느 회독 차수를 "현재" 진행 중인지 판단 (탭 default 선택용).
 *
 * 정책:
 *   - 진행 중인 (sessions 있음, stamp 없음) 가장 높은 회독 = current.
 *   - 진행 중이 없으면 가장 높은 stamp 의 다음 회독 (해금된 경우).
 *   - 둘 다 없으면 1회독.
 */
export function currentPassFor(
  sessions: PassSession[],
  stamps: PassStamp[],
  subject: Subject,
  chapter: number,
): number {
  // 진행 중인 가장 높은 회독
  let inProgressMax = 0;
  for (const s of sessions) {
    if (s.subject === subject && s.chapter === chapter) {
      if (s.passNumber > inProgressMax) inProgressMax = s.passNumber;
    }
  }
  if (inProgressMax > 0) {
    // 그 회독이 stamp 보유면 다음 회독으로
    const stamped = stamps.some(
      (st) =>
        st.subject === subject &&
        st.chapter === chapter &&
        st.passNumber === inProgressMax,
    );
    return stamped ? inProgressMax + 1 : inProgressMax;
  }
  // 진행 중 없음 — 가장 높은 stamp 의 다음
  let stampMax = 0;
  for (const st of stamps) {
    if (st.subject === subject && st.chapter === chapter) {
      if (st.passNumber > stampMax) stampMax = st.passNumber;
    }
  }
  return stampMax + 1; // stampMax=0 이면 1, stampMax=2 면 3 등
}

/**
 * Tier 클라이언트 계산 — server RPC `recompute_pass_tier` 와 동일 로직.
 *
 * 정책 (server 와 sync — 0013_n_pass_system.sql 참고):
 *   - MASTER  : 두 과목 모두 3회독 stamp 보유
 *   - PLATINUM: 어떤 과목이든 2회독 stamp 보유
 *   - GOLD    : 어떤 과목이든 1회독 stamp 보유 + 2회독 sessions 존재
 *   - SILVER  : 어떤 과목이든 1회독 stamp 보유
 *   - BRONZE  : 그 외 (=신규 사용자)
 *
 * Tier 강등 X — 호출자가 현재 tier 와 비교해 max 만 반영.
 */
export function computePassTier(
  sessions: PassSession[],
  stamps: PassStamp[],
): PassTier {
  // 두 과목 모두 3회독 stamp?
  const subjectsWithPass3 = new Set<Subject>();
  for (const st of stamps) if (st.passNumber === 3) subjectsWithPass3.add(st.subject);
  if (subjectsWithPass3.size >= 2) return 'master';

  // 어떤 과목이든 2회독 stamp?
  if (stamps.some((st) => st.passNumber === 2)) return 'platinum';

  // 어떤 과목이든 1회독 stamp + 2회독 sessions 존재?
  const subjectsWith1Stamp = new Set<Subject>();
  for (const st of stamps) if (st.passNumber === 1) subjectsWith1Stamp.add(st.subject);
  const subjectsWith2Sessions = new Set<Subject>();
  for (const s of sessions) if (s.passNumber === 2) subjectsWith2Sessions.add(s.subject);
  for (const subj of subjectsWith1Stamp) {
    if (subjectsWith2Sessions.has(subj)) return 'gold';
  }

  // 어떤 과목이든 1회독 stamp?
  if (stamps.some((st) => st.passNumber === 1)) return 'silver';

  return 'bronze';
}

/**
 * Tier 강등 방지 — 새로 계산된 tier 가 현재보다 낮으면 현재 tier 유지.
 */
export function pickHigherTier(current: PassTier, candidate: PassTier): PassTier {
  return PASS_TIER_ORDER.indexOf(candidate) > PASS_TIER_ORDER.indexOf(current)
    ? candidate
    : current;
}

/**
 * 챕터별 진행 매트릭스 — 한 과목의 모든 챕터 × 모든 회독 차수의 진행률.
 * StatsPage 의 Pass 컬렉션 그리드 등 시각화 용.
 *
 * @param maxPass 표시할 최대 회독 차수 (보통 현재 도달 + 1)
 */
export function passMatrixForSubject(
  sessions: PassSession[],
  stamps: PassStamp[],
  subject: Subject,
  chapters: number[],
  maxPass: number,
): ChapterPassProgress[][] {
  return chapters.map((ch) =>
    Array.from({ length: maxPass }, (_, i) =>
      chapterPassProgress(sessions, stamps, subject, ch, i + 1),
    ),
  );
}

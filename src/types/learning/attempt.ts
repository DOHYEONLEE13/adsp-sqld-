/**
 * Attempt — 문제 풀이 1회 기록.
 *
 * 리서치 9-2절 정본.
 *
 * 운영 코드 통합 (Phase 0 분석):
 *   - 기존 `sessions` 테이블 (0001): 세션 단위 — Phase 4 의 attempts 는 더 fine-grained.
 *   - 기존 `question_stats` 테이블 (0001): 문항별 누적 — Phase 4 의 attempts 가 누적의 source-of-truth.
 *
 * 마이그레이션 정책:
 *   - 신규 `attempts` 테이블 추가 (Phase 2 스키마 설계). question_stats 는 attempts 의 집계 view 또는 캐시.
 *   - sessions.flow CHECK 확장: 'play' | 'learn' | 'test' → + 'diagnostic'
 *   - 기존 sessions row 의 flow → AttemptContext 매핑 (Phase 2):
 *       - 'play'  → 'review'   (랜덤/약점/오답 모드)
 *       - 'learn' → 'lesson'   (lesson 내부 인라인 MCQ)
 *       - 'test'  → 'mock_exam' (실전 모의고사)
 *       - (신규) → 'diagnostic'
 */

/**
 * Attempt 컨텍스트 — 어느 모드에서 풀었는지.
 *
 * 운영 sessions.flow 와 매핑 (Phase 2 마이그레이션):
 *   - 'lesson'      ← 'learn' (개념 학습 인라인 MCQ)
 *   - 'review'      ← 'play'  (랜덤·약점·오답·복습큐 모드)
 *   - 'mock_exam'   ← 'test'  (실전 10문 세트, 모의고사)
 *   - 'diagnostic'  → 신규    (페르소나=reviewer 의 진단 테스트)
 *
 * MVP 에서 4가지 모두 필수. CHECK 제약 확장 마이그레이션 필요.
 */
export type AttemptContext = 'lesson' | 'review' | 'mock_exam' | 'diagnostic';

/**
 * Attempt — 문제 1회 풀이 단위 기록.
 *
 * Supabase 테이블 `attempts` 의 row 1:1 매핑.
 * 사용자 풀이 빈도가 가장 빠른 테이블 (성능 인덱스 필수: user_id + attempted_at).
 */
export interface Attempt {
  // ───────────────────────────────────────────────
  // 식별
  // ───────────────────────────────────────────────

  /** 서버 발급 UUID. */
  attempt_id: string;

  /** 사용자 (profiles.id 와 동일). */
  user_id: string;

  /**
   * 문항 ID — 운영 question_bank 의 legacy_id.
   * 형식: 예) "adsp-1-1-cp-01a", "sqld-2-1-cp-01"
   * 새 ID (Q-XXX-X-X-XXXX) 는 markdown 검수 시스템 전용 — Attempt 는 legacy_id 사용 (운영 호환).
   */
  question_id: string;

  // ───────────────────────────────────────────────
  // 풀이 결과 (MVP 필수)
  // ───────────────────────────────────────────────

  /** 정답 여부. */
  is_correct: boolean;

  /** 사용자가 선택한 답 (선택형: A/B/C/D, 단답: 입력 텍스트). */
  selected_answer: string;

  /** 풀이 소요 시간 (초). question_stats.last_time_ms 의 source. */
  time_spent_seconds: number;

  /** 풀이 시각. */
  attempted_at: Date;

  // ───────────────────────────────────────────────
  // 컨텍스트 (MVP 필수)
  // ───────────────────────────────────────────────

  /** 어느 모드에서 풀었는지 (lesson/review/mock_exam/diagnostic). */
  context: AttemptContext;

  /** 세션 ID (sessions.id). 같은 세션의 풀이는 동일 session_id 공유. */
  session_id?: string | null;

  // ───────────────────────────────────────────────
  // 망각 곡선 메타 (MVP 필수, 3절)
  // ───────────────────────────────────────────────

  /**
   * 회독 차수 (Leitner-style).
   * 0 = 처음 풀이 (lesson 또는 첫 review).
   * 1, 2, 3, 4 = 1일·3일·7일·14일·30일 복습 라운드.
   * 5 이상 = 마스터 (3-1절).
   */
  review_round: number;

  /**
   * 다음 복습 예정 날짜.
   * SM-2 변형 알고리즘 (3-1절) 결과에 따라 계산:
   *   - 정답 시: now + 다음 interval (1→3→7→14→30일)
   *   - 오답 시: now + 1일 (interval 리셋)
   *   - 마스터 (round=5) 통과 후: null (자동 출제 X)
   */
  next_review_date: Date | null;
}

/**
 * 사용자 답변 후 즉시 ReviewItem 갱신용 부분 정보.
 * Phase 4 Step 4 (망각 곡선) 구현 시 attempt 기록 + reviewItem 갱신을 한 트랜잭션으로 처리.
 */
export type AttemptResult = Pick<
  Attempt,
  'question_id' | 'is_correct' | 'time_spent_seconds' | 'context' | 'review_round'
>;

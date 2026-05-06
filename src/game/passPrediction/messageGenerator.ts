/**
 * messageGenerator — 합격 예측 메시지 생성.
 *
 * Phase 4 Step 5 (리서치 4-3절 정책 정확히):
 *
 * beginner:
 *   score < 40: "D-{d_day} 시점에 평균 진도율이라면 좋은 시작! 차근차근 가자."
 *   score < 60: "합격선까지 {60-score}점 남았어. 약점 단원 짚어줄게!"
 *   else:       "이대로 가면 합격 가능성 높아! 꾸준히 유지하자."
 *
 * reviewer:
 *   not is_pass: "맞춘 문제 기반 예상 점수는 {score}점. 불합격 가능성 있어. 하지만 약한 부분 짚어줄게! 내 학습 탭에서 확인해."
 *   is_pass:     "맞춘 문제 기반 예상 점수는 {score}점. 합격 가능성 있어! 이대로 유지하면서 약점 보강하면 안전권."
 *
 * 데이터 부족 (score=null):
 *   "아직 데이터가 부족해. 더 풀어봐!"
 */

import type { Persona } from '@/types/learning';
import { PASS_THRESHOLD } from './scoreCalculator';

/**
 * 메시지 생성.
 *
 * @param score - 예측 점수 (null = 데이터 부족)
 * @param isPass - score >= 60
 * @param persona - beginner / reviewer / unknown (unknown → beginner 처리)
 * @param dDay - D-day 일수 (null 또는 음수 가능 — 음수면 과거)
 */
export function generateMessage(
  score: number | null,
  isPass: boolean,
  persona: Persona,
  dDay: number | null,
): string {
  if (score === null) {
    return '아직 데이터가 부족해. 더 풀어봐!';
  }

  const ddayText = dDay && dDay > 0 ? `D-${dDay}` : '시험 직전';

  if (persona === 'reviewer') {
    if (!isPass) {
      return `맞춘 문제 기반 예상 점수는 ${score}점. 불합격 가능성 있어. 하지만 약한 부분 짚어줄게! 내 학습 탭에서 확인해.`;
    }
    return `맞춘 문제 기반 예상 점수는 ${score}점. 합격 가능성 있어! 이대로 유지하면서 약점 보강하면 안전권.`;
  }

  // beginner / unknown 분기
  if (score < 40) {
    return `${ddayText} 시점에 평균 진도율이라면 좋은 시작! 차근차근 가자.`;
  }
  if (score < PASS_THRESHOLD) {
    const remaining = PASS_THRESHOLD - score;
    return `합격선까지 ${remaining}점 남았어. 약점 단원 짚어줄게!`;
  }
  return '이대로 가면 합격 가능성 높아! 꾸준히 유지하자.';
}

/**
 * 데이터 부족 상세 메시지 — score=null 일 때 보조 표시.
 *
 * @param attemptedChapters - 응시 5+ 한 chapter 수
 * @param totalChapters - 시험 전체 chapter 수
 */
export function generateInsufficientDataMessage(
  attemptedChapters: number,
  totalChapters: number,
): string {
  const need = Math.ceil(totalChapters * 0.7); // total_weight 0.7 ≈ 70% chapter
  const remaining = Math.max(0, need - attemptedChapters);
  if (remaining === 0) {
    return `학습한 단원 ${attemptedChapters}개. 곧 정확한 예측이 가능해요.`;
  }
  return `현재 학습한 단원: ${attemptedChapters}개 / 예측 가능: ${need}개 (${remaining}개 더 필요)`;
}

/**
 * 약점 보강 시뮬레이션 메시지 — ImprovementSimulator 표시용.
 *
 * @param delta - 보강 시 점수 상승
 * @param newPass - 보강 후 합격 가능 여부
 * @param wasPass - 현재 합격 가능 여부
 */
export function generateSimulationMessage(
  delta: number,
  newPass: boolean,
  wasPass: boolean,
): string {
  if (delta === 0) {
    return '이미 충분히 잘하고 있어요. 약점 단원 정답률 80% 가정 시 변화 없음.';
  }
  if (!wasPass && newPass) {
    return `약점 보강 시 +${delta}점 — 합격선 통과 예상!`;
  }
  if (wasPass) {
    return `이미 합격권. 약점 보강 시 +${delta}점 더 — 안전권 진입.`;
  }
  return `약점 보강 시 +${delta}점 상승 예상. 조금 더 힘내자!`;
}

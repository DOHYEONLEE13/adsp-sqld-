/**
 * finale.ts — 과목 완주 마무리 step (id 끝이 `-finale`) 잠금 정책.
 *
 * 정책:
 *   - 일반 step 잠금과 별개로 "전 콘텐츠 클리어" 가 unlock 조건.
 *   - 게스트·무료·프리미엄(MAX) 모두 동일 — 단계적 잠금이 아닌 [완주 보상].
 *   - admin 검수 모드 (DEV_UNLOCK_STEPS_KEY) 만 우회 가능.
 *
 * 완주 정의: 해당 subject 의 모든 LessonStep (quizId 보유 + 자기 자신/review 제외)
 * 의 questionStat.lastCorrect === true.
 */

import type { ProgressStore } from './storage';
import { ALL_LESSONS } from '@/data/lessons';
import type { Subject } from '@/types/question';
import { isDevUnlockStepsEnabled } from './stepUnlocks';

/** id 끝이 `-finale` 인 step 인지. */
export function isFinaleStep(step: { id: string }): boolean {
  return step.id.endsWith('-finale');
}

/**
 * 해당 subject 의 모든 quiz step 이 lastCorrect 인가.
 * review step (quizId 없음) + finale step 자체는 카운트에서 제외.
 */
export function isSubjectCompleted(
  progress: ProgressStore,
  subject: Subject,
): boolean {
  for (const lesson of ALL_LESSONS) {
    if (lesson.subject !== subject) continue;
    for (const step of lesson.steps) {
      if (!step.quizId) continue; // review step skip
      if (isFinaleStep(step)) continue; // finale 자체 skip
      const stat = progress.questionStats[step.quizId];
      if (!stat || !stat.lastCorrect) return false;
    }
  }
  return true;
}

/**
 * Finale step 잠금 여부.
 *   - admin 검수 모드 ON → unlocked (false)
 *   - subject 완주 → unlocked (false)
 *   - 그 외 → locked (true)
 */
export function isFinaleStepLocked(
  progress: ProgressStore,
  step: { id: string },
): boolean {
  if (!isFinaleStep(step)) return false; // 안전 — finale 아니면 영향 없음
  if (isDevUnlockStepsEnabled()) return false;
  // step.id 의 첫 segment 가 subject (예: 'adsp-3-4-finale' → 'adsp')
  const subject = step.id.split('-')[0] as Subject;
  return !isSubjectCompleted(progress, subject);
}

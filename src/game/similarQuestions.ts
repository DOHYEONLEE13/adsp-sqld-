/**
 * similarQuestions.ts — 개념 학습 후 inline MCQ 답변 시 노출되는 "비슷한 문제 더
 * 풀기" 패널의 후보 풀 추출 로직.
 *
 * 매칭 단위: **lesson step group** (canonical topic 보다 한 단계 세분화).
 *
 *   기존 (canonical topic 기반) — 너무 거침: "데이터의 이해" 안에 DIKW · 데이터
 *   분류 · SECI · DB · DW · 기업DB 가 모두 섞여 있어 DIKW 풀 때 SECI 가 노출되는
 *   정확도 결함.
 *
 *   현재 (group 기반) — 정확: step.group (예: 'adsp-1-1-s1' = DIKW group) 에 속한
 *   다른 quizId 만 풀에 포함. cp 문제는 lesson step 매핑이 1:1 이라 자동.
 *
 * 풀 부족 시 (그룹 substep 수가 적을 때) 그대로 노출 — 같은 group 안에서 가져올 수
 * 있는 만큼만. fallback 으로 다른 group 풀을 끌어쓰지 않음 (정확도 우선).
 *
 * 정렬: difficulty 차이가 작은 것 우선, 동률은 random shuffle.
 *
 * 한계: lesson step 에 매핑되지 않는 quiz (실전 세트·모의고사·기출 단독 풀이) 는
 * group 미매핑 → 풀 0 반환 → "비슷한 문제 더 풀기" 버튼 자동 숨김.
 */

import { ALL_QUESTIONS } from '@/lib/questions';
import { ALL_LESSONS } from '@/data/lessons';
import { shuffle } from '@/lib/utils';
import { isPlayable } from './session';
import type { MultipleChoiceQuestion } from '@/types/question';

/**
 * step.group 우선, 미지정 시 id 의 `-sN` prefix 가 그룹 키.
 * (DialogueLesson 의 trail group 로직과 동일.)
 */
function extractGroupKey(stepId: string, explicitGroup?: string): string {
  if (explicitGroup) return explicitGroup;
  const m = stepId.match(/^(.+-s\d+)(?:-[a-zA-Z][a-zA-Z0-9-]*)?$/);
  return m ? m[1] : stepId;
}

/**
 * quizId → group 인덱스 + group → quizIds[] 역인덱스.
 * 모듈 첫 호출 시 lazy build, 이후 캐시.
 *
 * 같은 quizId 를 여러 step 이 공유 (예: review 가 overview 와 동일 quizId 재사용)
 * 해도 group 은 같으므로 첫 매칭만 저장.
 */
let _quizToGroup: Map<string, string> | null = null;
let _groupToQuizIds: Map<string, Set<string>> | null = null;

function buildIndex() {
  const q2g = new Map<string, string>();
  const g2q = new Map<string, Set<string>>();
  for (const lesson of ALL_LESSONS) {
    for (const step of lesson.steps) {
      if (!step.quizId) continue;
      const gkey = extractGroupKey(step.id, step.group);
      if (!q2g.has(step.quizId)) q2g.set(step.quizId, gkey);
      if (!g2q.has(gkey)) g2q.set(gkey, new Set());
      g2q.get(gkey)!.add(step.quizId);
    }
  }
  _quizToGroup = q2g;
  _groupToQuizIds = g2q;
}

function quizToGroup(): Map<string, string> {
  if (!_quizToGroup) buildIndex();
  return _quizToGroup!;
}

function groupToQuizIds(): Map<string, Set<string>> {
  if (!_groupToQuizIds) buildIndex();
  return _groupToQuizIds!;
}

/** ALL_QUESTIONS 안에서 id 로 1건 찾기 (playable 가드 포함). */
function findById(id: string): MultipleChoiceQuestion | undefined {
  for (const q of ALL_QUESTIONS) {
    if (q.id === id && isPlayable(q)) return q;
  }
  return undefined;
}

/** difficulty 차이 가까운 순. */
function makeDifficultySorter(target: MultipleChoiceQuestion) {
  const t = target.difficulty ?? 2;
  return (a: MultipleChoiceQuestion, b: MultipleChoiceQuestion) => {
    const da = Math.abs((a.difficulty ?? 2) - t);
    const db = Math.abs((b.difficulty ?? 2) - t);
    return da - db;
  };
}

/**
 * 주어진 quizId 와 같은 lesson step group 의 다른 quiz N개 반환.
 *
 * @param currentQuizId 현재 풀이 중인 문제 id
 * @param count 반환할 최대 개수 (기본 5). 그룹 substep 이 적으면 그만큼만 반환.
 */
export function findSimilarQuestions(
  currentQuizId: string,
  count: number = 5,
): MultipleChoiceQuestion[] {
  const current = findById(currentQuizId);
  if (!current) return [];

  const groupKey = quizToGroup().get(currentQuizId);
  if (!groupKey) return []; // lesson step 매핑 없음 (예: 실전 세트 단독 quiz)

  const groupQuizIds = groupToQuizIds().get(groupKey);
  if (!groupQuizIds) return [];

  // 같은 group 의 다른 quizId 들 → question 으로 resolve
  const pool: MultipleChoiceQuestion[] = [];
  for (const qid of groupQuizIds) {
    if (qid === currentQuizId) continue;
    const q = findById(qid);
    if (q) pool.push(q);
  }

  if (pool.length === 0) return [];
  return shuffle(pool).sort(makeDifficultySorter(current)).slice(0, count);
}

/**
 * 풀 사이즈만 빠르게 (FeedbackSheet 의 카운트 배지용).
 * 그룹 안의 다른 unique quizId 수 (본인 제외).
 */
export function countSimilarQuestions(currentQuizId: string): number {
  const groupKey = quizToGroup().get(currentQuizId);
  if (!groupKey) return 0;
  const groupQuizIds = groupToQuizIds().get(groupKey);
  if (!groupQuizIds) return 0;
  // 본인 제외 + ALL_QUESTIONS 에 실제 존재하고 playable 인 것만
  let n = 0;
  for (const qid of groupQuizIds) {
    if (qid === currentQuizId) continue;
    if (findById(qid)) n++;
  }
  return n;
}

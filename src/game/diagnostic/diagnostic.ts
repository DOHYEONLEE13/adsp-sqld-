/**
 * Diagnostic 알고리즘 — Phase 4 Step 2.
 *
 * 리서치 1-4절 정본.
 *
 * 핵심:
 *   - 1-4-1: 출제 풀 = difficulty=중 난이도, 단원별 동일 비율, 25~30 기본 + 적응형 5
 *   - 1-4-3: 약점 판정 임계 (strong/normal/weak/critical/low_confidence)
 *   - 1-4-4: 종합 진단 메시지 자동 생성
 *
 * 본 모듈은 순수 로직 (운영 question-bank 와 분리). UI 비의존.
 */

import type {
  DiagnosticConfig,
  ChapterDiagnosticResult,
  WeaknessLevel,
} from '@/types/learning';
import { DIAGNOSTIC_DEFAULT_CONFIG, WEAKNESS_THRESHOLDS } from '@/types/learning';

/** 풀이 결과 입력 (DiagnosticSession 진행 중 누적). */
export interface DiagnosticAnswer {
  question_id: string;
  chapter_id: string;
  is_correct: boolean;
  time_spent_seconds: number;
}

/** 단원별 정답률 집계. */
export function aggregateByChapter(
  answers: DiagnosticAnswer[],
): { [chapter_id: string]: { attempted: number; correct: number } } {
  const acc: { [chapter_id: string]: { attempted: number; correct: number } } = {};
  for (const a of answers) {
    if (!acc[a.chapter_id]) acc[a.chapter_id] = { attempted: 0, correct: 0 };
    acc[a.chapter_id].attempted++;
    if (a.is_correct) acc[a.chapter_id].correct++;
  }
  return acc;
}

/** 단원별 정답률 → 약점 등급 (1-4-3절). */
export function classifyWeakness(attempted: number, correct: number): WeaknessLevel {
  if (attempted === 0) return 'unknown';
  if (attempted < WEAKNESS_THRESHOLDS.LOW_CONFIDENCE_MAX_ATTEMPTS) return 'low_confidence';
  const accuracy = correct / attempted;
  if (accuracy >= WEAKNESS_THRESHOLDS.STRONG_MIN) return 'strong';
  if (accuracy >= WEAKNESS_THRESHOLDS.NORMAL_MIN) return 'normal';
  if (accuracy >= WEAKNESS_THRESHOLDS.WEAK_MIN) return 'weak';
  return 'critical';
}

/** 신뢰도 분류 (1-4-3절). */
export function confidenceFor(attempted: number): 'low' | 'normal' | 'high' {
  if (attempted < 5) return 'low';
  if (attempted < 10) return 'normal';
  return 'high';
}

/** 적응형 추가 출제 트리거 검사 (1-4-1절). */
export function shouldTriggerAdaptive(
  answers: DiagnosticAnswer[],
  chapter_id: string,
  config: DiagnosticConfig = DIAGNOSTIC_DEFAULT_CONFIG,
): boolean {
  const subset = answers.filter((a) => a.chapter_id === chapter_id);
  if (subset.length < 4) return false; // 최소 4문항 풀어야 trigger 검사
  const errorRate = subset.filter((a) => !a.is_correct).length / subset.length;
  return errorRate >= config.adaptive_trigger_error_rate;
}

/** 종료 가능 여부 — 사용자 "그만" 옵션 (1-4-1절). */
export function canEarlyAbort(
  answers: DiagnosticAnswer[],
  config: DiagnosticConfig = DIAGNOSTIC_DEFAULT_CONFIG,
): boolean {
  return answers.length >= config.early_abort_min_questions;
}

/**
 * 단원별 진단 결과 생성.
 * 모든 chapter_id 포함 (응시 0 인 단원도 unknown 으로 표시).
 */
export function buildChapterResults(
  answers: DiagnosticAnswer[],
  all_chapter_ids: string[],
): ChapterDiagnosticResult[] {
  const agg = aggregateByChapter(answers);
  return all_chapter_ids.map((chapter_id) => {
    const a = agg[chapter_id] ?? { attempted: 0, correct: 0 };
    return {
      chapter_id,
      attempted: a.attempted,
      correct: a.correct,
      accuracy: a.attempted > 0 ? a.correct / a.attempted : 0,
      level: classifyWeakness(a.attempted, a.correct),
      confidence: confidenceFor(a.attempted),
    };
  });
}

/**
 * 약점 단원 추출 (정답률 낮은 순 정렬).
 * level ∈ {weak, critical} 만 포함. low_confidence 는 제외 (신뢰도 부족).
 */
export function extractWeakChapterIds(results: ChapterDiagnosticResult[]): string[] {
  return [...results]
    .filter((r) => r.level === 'weak' || r.level === 'critical')
    .sort((a, b) => a.accuracy - b.accuracy)
    .map((r) => r.chapter_id);
}

/**
 * 종합 진단 메시지 자동 생성 (1-4-4절).
 *
 * 우선순위:
 *   1. critical 단원 1+ → "X 영역이 가장 약해요"
 *   2. weak 단원 1+ → "X·Y 영역 보강 권장"
 *   3. 모두 normal 이상 → "기본기 양호"
 *   4. low_confidence 만 → "더 풀어보면 정확한 진단 가능"
 */
export function buildSummaryMessage(
  results: ChapterDiagnosticResult[],
  chapterNameMap: { [chapter_id: string]: string } = {},
): string {
  const named = (id: string) => chapterNameMap[id] ?? id;

  const critical = results.filter((r) => r.level === 'critical');
  const weak = results.filter((r) => r.level === 'weak');

  if (critical.length > 0) {
    const top = critical.sort((a, b) => a.accuracy - b.accuracy)[0];
    return `당신은 [${named(top.chapter_id)}] 영역이 가장 약해요. 거기에 집중하면 합격 가능성이 크게 올라가요.`;
  }
  if (weak.length > 0) {
    const names = weak.slice(0, 2).map((r) => named(r.chapter_id)).join('·');
    return `${names} 영역 보강이 필요해요. 차근차근 풀어보면 충분히 따라잡을 수 있어요.`;
  }
  const allLowConfidence = results.every((r) => r.level === 'low_confidence' || r.level === 'unknown');
  if (allLowConfidence) {
    return '아직 데이터가 부족해요. 몇 문제 더 풀면 정확한 진단이 가능해요.';
  }
  return '기본기 양호. 약점은 풀이를 늘려가며 자연스럽게 발견될 거예요.';
}

/**
 * 합격 가능성 예측 (1-4-4절).
 *
 * 단순 가중 평균:
 *   - 단원별 정답률 × 단원 가중치 (4-1절)
 *   - 시험 환경 보정 -7 (4-2절)
 *   - 0~100 범위 clamp
 *
 * 단원 가중치는 외부 입력 (운영 코드의 chapter weight map).
 */
export function predictPassProbability(
  results: ChapterDiagnosticResult[],
  chapterWeights: { [chapter_id: string]: number },
  examAdjustment = -7,
): { score: number; confidence: 'low' | 'medium' | 'high' } {
  let totalScore = 0;
  let totalWeight = 0;
  for (const r of results) {
    if (r.attempted === 0) continue;
    const weight = chapterWeights[r.chapter_id];
    if (!weight) continue;
    totalScore += r.accuracy * 100 * weight;
    totalWeight += weight;
  }
  if (totalWeight < 0.7) {
    return { score: 0, confidence: 'low' };
  }
  const raw = totalScore / totalWeight;
  const adjusted = Math.max(0, Math.min(100, raw + examAdjustment));
  const confidence: 'low' | 'medium' | 'high' =
    totalWeight < 0.85 ? 'medium' : 'high';
  return { score: Math.round(adjusted), confidence };
}

/**
 * 약점 보강 후 합격 가능성 시뮬레이션 (1-4-4절).
 *
 * 가정: weak/critical 단원들의 정답률을 80% 수준으로 끌어올렸을 때.
 */
export function predictAfterImprovement(
  results: ChapterDiagnosticResult[],
  chapterWeights: { [chapter_id: string]: number },
  targetAccuracy = 0.8,
  examAdjustment = -7,
): number {
  const improved: ChapterDiagnosticResult[] = results.map((r) => {
    if (r.level === 'weak' || r.level === 'critical') {
      return { ...r, accuracy: Math.max(r.accuracy, targetAccuracy) };
    }
    return r;
  });
  return predictPassProbability(improved, chapterWeights, examAdjustment).score;
}

/**
 * weakRoadmap — 약점 단원별 권장 학습 시간 산정.
 *
 * Phase 4 Step 3 후속 — DiagnosticResults 에서 사용자에게 "어디 집중 + 얼마면 커버"
 * 를 한눈에 보여주기 위한 헬퍼.
 *
 * 핵심 알고리즘 (재응시생 가중과 정합):
 *   - reviewer 권장 시간 (ADsP 17h, SQLD 12h) 을 baseline 으로
 *   - 약점 단원 가중치 100% / 강점 60% 비율 분배 적용
 *   - 약점 영역에 배정된 시간만 추출 → "약점 보강에 필요한 시간"
 *
 * 시간 → 일수 변환:
 *   - daily_minutes (default 60) 기준 days = ceil(totalMinutes / daily_minutes)
 *   - 시험까지 D-day 와 비교해 가능/부족 판정
 */

import type { Subject } from '@/types/question';
import type { ChapterDiagnosticResult, WeaknessLevel } from '@/types/learning';
import { calculateRequiredHours, allocateByAreaForReviewer } from './timeAllocation';
import { getAreas, type AreaConfig } from './areaConfig';

type ExamSubject = Extract<Subject, 'adsp' | 'sqld'>;

/** 진단 → 약점 우선순위 정렬된 로드맵 1건. */
export interface WeakRoadmapEntry {
  /** 우선순위 (1-based). */
  rank: number;
  /** 영역 식별자 (chapter_id). */
  chapter_id: string;
  /** 표시 이름 (예: "1과목 데이터 이해"). */
  display_name: string;
  /** 진단 정답률 0~1. */
  accuracy: number;
  /** 응시 문항 수. */
  attempted: number;
  /** 약점 정도. */
  level: WeaknessLevel;
  /** 본 영역 권장 학습 시간 (분). */
  planned_minutes: number;
  /** 매일 daily_minutes 기준 며칠 학습 필요. */
  days_at_daily: number;
}

/** 전체 로드맵 + 합계. */
export interface WeakRoadmap {
  entries: WeakRoadmapEntry[];
  /** 약점 영역 합계 학습 시간 (분). */
  total_planned_minutes: number;
  /** 매일 daily_minutes 기준 며칠 필요. */
  total_days_at_daily: number;
  /** 사용한 daily_minutes (display 용). */
  daily_minutes: number;
}

/**
 * 진단 결과 → 약점 보강 로드맵.
 *
 * 진단의 chapter_id (예: 'adsp-1-1', 'adsp-3-2') 는 운영 lesson 단위.
 * StudyPlan 의 영역 chapter_id (예: 'adsp-1', 'adsp-3-stats') 와 다른 단위.
 * 매핑은 chapter (1~3 숫자) 기준으로 영역 추정.
 *
 * 알고리즘:
 *   1. 진단 결과 중 attempt > 0 + level ∈ {weak, critical} 인 항목 추출
 *   2. 각 항목의 chapter_id → 운영 chapter 번호 추출 (예: 'adsp-1-2' → 1)
 *   3. 그 chapter 가 속한 영역 (areaConfig) 매핑
 *   4. 같은 영역에 여러 진단 chapter 가 있으면 평균 정답률 + 합산 attempted
 *   5. 영역별 가중 분배 (allocateByAreaForReviewer) 로 영역 별 권장 시간 계산
 *   6. 정답률 낮은 순 정렬 + rank 부여
 */
export function buildWeakRoadmap(
  exam: ExamSubject,
  diagnosticResults: readonly ChapterDiagnosticResult[],
  daily_minutes: number = 60,
): WeakRoadmap {
  const areas = getAreas(exam);

  // 1. 진단 chapter → 운영 chapter (1~3) → 영역 매핑
  type ChapterAggregate = {
    area: AreaConfig;
    accuracy_sum: number;
    attempted: number;
    sample_count: number;
    level: WeaknessLevel;
  };
  const byArea = new Map<string, ChapterAggregate>();

  for (const r of diagnosticResults) {
    if (r.attempted === 0) continue;
    if (r.level !== 'weak' && r.level !== 'critical') continue;

    const area = mapDiagnosticChapterToArea(r.chapter_id, areas);
    if (!area) continue;

    const cur = byArea.get(area.chapter_id);
    if (cur) {
      cur.accuracy_sum += r.accuracy;
      cur.attempted += r.attempted;
      cur.sample_count += 1;
      // critical > weak 우선
      if (r.level === 'critical') cur.level = 'critical';
    } else {
      byArea.set(area.chapter_id, {
        area,
        accuracy_sum: r.accuracy,
        attempted: r.attempted,
        sample_count: 1,
        level: r.level,
      });
    }
  }

  // 2. 영역별 가중 분배 (reviewer 권장 시간 기준)
  const reviewerHoursRange = calculateRequiredHours(exam, 'some_basis', 'reviewer');
  const totalReviewerMin = reviewerHoursRange.recommended * 60;
  const weakChapterIds = Array.from(byArea.keys());
  const allocations = allocateByAreaForReviewer(
    exam,
    totalReviewerMin,
    weakChapterIds,
  );

  // 3. 본 약점 영역만 추출 + entry 빌드
  const entries: WeakRoadmapEntry[] = [];
  for (const [chapter_id, agg] of byArea.entries()) {
    const alloc = allocations.find((a) => a.area.chapter_id === chapter_id);
    if (!alloc) continue;
    const accuracy = agg.accuracy_sum / agg.sample_count;
    const days_at_daily =
      daily_minutes > 0 ? Math.ceil(alloc.planned_minutes / daily_minutes) : 0;
    entries.push({
      rank: 0, // 정렬 후 부여
      chapter_id,
      display_name: agg.area.display_name,
      accuracy,
      attempted: agg.attempted,
      level: agg.level,
      planned_minutes: alloc.planned_minutes,
      days_at_daily,
    });
  }

  // 4. 정답률 낮은 순 (critical 우선) 정렬 + rank
  entries.sort((a, b) => {
    if (a.level === 'critical' && b.level !== 'critical') return -1;
    if (b.level === 'critical' && a.level !== 'critical') return 1;
    return a.accuracy - b.accuracy;
  });
  entries.forEach((e, i) => {
    e.rank = i + 1;
  });

  const total_planned_minutes = entries.reduce(
    (s, e) => s + e.planned_minutes,
    0,
  );
  const total_days_at_daily =
    daily_minutes > 0 ? Math.ceil(total_planned_minutes / daily_minutes) : 0;

  return {
    entries,
    total_planned_minutes,
    total_days_at_daily,
    daily_minutes,
  };
}

/**
 * 진단 chapter_id (운영 lesson 단위, 예 'adsp-1-1', 'adsp-3-2') 를 영역 (areaConfig) 으로 매핑.
 *
 * 패턴:
 *   - 'adsp-1-N' (N=1~3) → adsp-1 영역 (chapter 1 전체)
 *   - 'adsp-2-N' (N=1~3) → adsp-2 영역 (chapter 2 전체)
 *   - 'adsp-3-1' → adsp-3-1 영역 (R 기초)
 *   - 'adsp-3-2', 'adsp-3-3' → adsp-3-stats 영역 (통계 분석 + 가설검정 병합)
 *   - 'adsp-3-4' → adsp-3-4 영역 (정형 데이터 마이닝)
 *   - SQLD 는 1:1 (sqld-1-1, sqld-1-2, sqld-2-1, sqld-2-2, sqld-2-3)
 */
function mapDiagnosticChapterToArea(
  diagnosticChapterId: string,
  areas: AreaConfig[],
): AreaConfig | undefined {
  // 1순위: chapter_id 직접 매칭 (SQLD + ADsP 영역 1·2·5 케이스)
  const direct = areas.find((a) => a.chapter_id === diagnosticChapterId);
  if (direct) return direct;

  // 2순위: ADsP chapter 1, 2 의 sub-chapter 들 (adsp-1-1 → adsp-1)
  // 패턴 매칭: 'adsp-1-X' → 'adsp-1' 등
  const m = /^(adsp|sqld)-(\d+)-(\d+)$/.exec(diagnosticChapterId);
  if (m) {
    const examPart = m[1];
    const chapterNum = m[2];

    // ADsP 통계 병합 케이스: adsp-3-2 / adsp-3-3 → adsp-3-stats
    if (examPart === 'adsp' && chapterNum === '3') {
      const subNum = m[3];
      if (subNum === '2' || subNum === '3') {
        return areas.find((a) => a.chapter_id === 'adsp-3-stats');
      }
      // adsp-3-1, adsp-3-4 는 1순위에서 잡혔어야 함 (direct match)
    }

    // ADsP 1, 2 chapter 전체: adsp-1-N → adsp-1
    if (examPart === 'adsp' && (chapterNum === '1' || chapterNum === '2')) {
      return areas.find((a) => a.chapter_id === `adsp-${chapterNum}`);
    }
  }

  return undefined;
}

/**
 * 시험까지 가용 일수 대비 로드맵 커버 가능 여부.
 *
 * @param roadmap - buildWeakRoadmap 결과
 * @param days - D-day (시험까지 남은 일수, REVIEW_BUFFER_DAYS 차감 전)
 * @param reviewBufferDays - 자유 복습 버퍼 (기본 3)
 * @returns 'sufficient' | 'tight' | 'insufficient' + 차이 일수
 */
export function evaluateRoadmapFeasibility(
  roadmap: WeakRoadmap,
  days: number,
  reviewBufferDays: number = 3,
): {
  status: 'sufficient' | 'tight' | 'insufficient';
  usableDays: number;
  needDays: number;
  surplusDays: number;
} {
  const usableDays = Math.max(0, days - reviewBufferDays);
  const needDays = roadmap.total_days_at_daily;
  const surplusDays = usableDays - needDays;
  let status: 'sufficient' | 'tight' | 'insufficient';
  if (surplusDays >= 3) status = 'sufficient';
  else if (surplusDays >= 0) status = 'tight';
  else status = 'insufficient';
  return { status, usableDays, needDays, surplusDays };
}

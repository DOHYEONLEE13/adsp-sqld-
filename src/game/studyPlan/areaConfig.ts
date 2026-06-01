/**
 * areaConfig — 학습 플랜 5 영역 정의 + 시간 배분 비율.
 *
 * Phase 4 Step 3 — Phase 1 (학습 플랜 알고리즘 토대).
 *
 * 출처: 리서치 2-1-3절 + Phase 0 Discovery 사용자 결정 (2026-05-06).
 *
 * ─── 핵심 결정 사항 ────────────────────────────────────────────
 *  - 5 영역 비율은 변경 금지 (리서치 12-1절 결정 사항).
 *  - ADsP 운영 schema 의 chapter 3 (4 topic) 는 가이드북 출제 비중에 따라
 *    영역 3·4·5 로 재구성됨:
 *      영역 3 (17%) = R 기초와 데이터 마트
 *      영역 4 (30%) = 통계 분석 + 통계적 가설 검정 (병합)
 *      영역 5 (23%) = 정형 데이터 마이닝
 *  - SQLD 는 운영 schema 5 topic = 5 영역 1:1.
 *
 * ─── 표시 vs 추적 단위 (Phase 0 결정) ─────────────────────────
 *  - 표시: chapter_id 단위 ("1과목 학습 6.5시간")
 *  - 내부 progress tracking: topic 단위 (sessions.topic 필드 활용)
 */

import type { LearningExamSubject } from '@/types/learning';

type ExamSubject = LearningExamSubject;

/** 한 영역 안의 운영 chapter/topic 매핑 1건. */
export interface AreaTopic {
  /** 운영 schema 의 chapter 번호 (1, 2, 3...). */
  chapter: number;
  /**
   * 운영 schema 의 topic 이름. null = 해당 chapter 의 모든 topic 포함.
   * 예: ADsP 영역 1 = adsp ch1 의 모든 topic.
   */
  topic: string | null;
}

/** 학습 플랜의 시간 분배 영역 1건. */
export interface AreaConfig {
  /** 영역 식별자 — `${exam}-area-${index}` 패턴 (1-based). */
  area_id: string;

  /**
   * 사용자 표시용 chapter_id — UI 의 "단원 카드" 라벨.
   * 운영 lesson 매핑이 1:1 인 영역 (대부분) 은 lesson_id 그대로 (예: 'adsp-1-1').
   * 병합 영역 (영역 4: 통계분석+가설검정) 은 가상 ID (예: 'adsp-3-stats').
   */
  chapter_id: string;

  /** 영역 표시 이름. UI 헤더 + 진도 카드 라벨. */
  display_name: string;

  /** 영역 시간 배분 비율 (총합 1.0). */
  ratio: number;

  /** 본 영역에 포함되는 운영 chapter/topic 매핑들. */
  topics: AreaTopic[];
}

// ─── ADsP 5 영역 (총 100%) ────────────────────────────────────────
// 합산 검증: 0.13 + 0.17 + 0.17 + 0.30 + 0.23 = 1.00 ✅
export const ADSP_AREAS: AreaConfig[] = [
  {
    area_id: 'adsp-area-1',
    chapter_id: 'adsp-1',
    display_name: '1과목 데이터 이해',
    ratio: 0.13,
    topics: [
      { chapter: 1, topic: null }, // ch1 전체 (3 topic)
    ],
  },
  {
    area_id: 'adsp-area-2',
    chapter_id: 'adsp-2',
    display_name: '2과목 데이터 분석 기획',
    ratio: 0.17,
    topics: [
      { chapter: 2, topic: null }, // ch2 전체 (3 topic)
    ],
  },
  {
    area_id: 'adsp-area-3',
    chapter_id: 'adsp-3-1',
    display_name: 'R 기초와 데이터 마트',
    ratio: 0.17,
    topics: [{ chapter: 3, topic: 'R 기초와 데이터 마트' }],
  },
  {
    area_id: 'adsp-area-4',
    chapter_id: 'adsp-3-stats',
    display_name: '통계 분석',
    ratio: 0.3,
    topics: [
      { chapter: 3, topic: '통계 분석' },
      { chapter: 3, topic: '통계적 가설 검정' },
    ],
  },
  {
    area_id: 'adsp-area-5',
    chapter_id: 'adsp-3-4',
    display_name: '정형 데이터 마이닝',
    ratio: 0.23,
    topics: [{ chapter: 3, topic: '정형 데이터 마이닝' }],
  },
];

// ─── SQLD 5 영역 (총 100%) ────────────────────────────────────────
// 합산 검증: 0.12 + 0.12 + 0.24 + 0.36 + 0.16 = 1.00 ✅
export const SQLD_AREAS: AreaConfig[] = [
  {
    area_id: 'sqld-area-1',
    chapter_id: 'sqld-1-1',
    display_name: '데이터 모델링의 이해',
    ratio: 0.12,
    topics: [{ chapter: 1, topic: '데이터 모델링의 이해' }],
  },
  {
    area_id: 'sqld-area-2',
    chapter_id: 'sqld-1-2',
    display_name: '데이터 모델과 성능',
    ratio: 0.12,
    topics: [{ chapter: 1, topic: '데이터 모델과 성능' }],
  },
  {
    area_id: 'sqld-area-3',
    chapter_id: 'sqld-2-1',
    display_name: 'SQL 기본',
    ratio: 0.24,
    topics: [{ chapter: 2, topic: 'SQL 기본' }],
  },
  {
    area_id: 'sqld-area-4',
    chapter_id: 'sqld-2-2',
    display_name: 'SQL 활용',
    ratio: 0.36,
    topics: [{ chapter: 2, topic: 'SQL 활용' }],
  },
  {
    area_id: 'sqld-area-5',
    chapter_id: 'sqld-2-3',
    display_name: '관리 구문',
    ratio: 0.16,
    topics: [{ chapter: 2, topic: '관리 구문' }],
  },
];

/** 시험별 영역 설정 조회. */
export const COMHWAL1_AREAS: AreaConfig[] = [
  {
    area_id: 'comhwal1-area-1',
    chapter_id: 'comhwal1-computer-general',
    display_name: '컴퓨터 일반',
    ratio: 0.35,
    topics: [{ chapter: 1, topic: null }],
  },
  {
    area_id: 'comhwal1-area-2',
    chapter_id: 'comhwal1-spreadsheet-general',
    display_name: '스프레드시트 일반',
    ratio: 0.35,
    topics: [{ chapter: 2, topic: null }],
  },
  {
    area_id: 'comhwal1-area-3',
    chapter_id: 'comhwal1-database-general',
    display_name: '데이터베이스 일반',
    ratio: 0.3,
    topics: [{ chapter: 3, topic: null }],
  },
];

export const COMHWAL2_AREAS: AreaConfig[] = [
  {
    area_id: 'comhwal2-area-1',
    chapter_id: 'comhwal2-computer-general',
    display_name: '컴퓨터 일반',
    ratio: 0.45,
    topics: [{ chapter: 1, topic: null }],
  },
  {
    area_id: 'comhwal2-area-2',
    chapter_id: 'comhwal2-spreadsheet-general',
    display_name: '스프레드시트 일반',
    ratio: 0.55,
    topics: [{ chapter: 2, topic: null }],
  },
];

export function getAreas(exam: ExamSubject): AreaConfig[] {
  switch (exam) {
    case 'adsp':
      return ADSP_AREAS;
    case 'sqld':
      return SQLD_AREAS;
    case 'comhwal1':
      return COMHWAL1_AREAS;
    case 'comhwal2':
      return COMHWAL2_AREAS;
  }
}

/** 영역 ID 로 영역 1건 조회. */
export function findAreaById(area_id: string): AreaConfig | undefined {
  return [...ADSP_AREAS, ...SQLD_AREAS, ...COMHWAL1_AREAS, ...COMHWAL2_AREAS].find(
    (a) => a.area_id === area_id,
  );
}

/** chapter_id 로 영역 1건 조회. */
export function findAreaByChapterId(chapter_id: string): AreaConfig | undefined {
  return [...ADSP_AREAS, ...SQLD_AREAS, ...COMHWAL1_AREAS, ...COMHWAL2_AREAS].find(
    (a) => a.chapter_id === chapter_id,
  );
}

/**
 * 비율 합산 검증 — dev assertion. 각 시험의 영역 비율 합이 1.0±0.001 이어야 함.
 * 새 영역 추가 시 build-time 검증.
 */
export function validateAreaRatios(): { exam: ExamSubject; sum: number; ok: boolean }[] {
  const out: { exam: ExamSubject; sum: number; ok: boolean }[] = [];
  for (const exam of ['adsp', 'sqld', 'comhwal1', 'comhwal2'] as const) {
    const sum = getAreas(exam).reduce((s, a) => s + a.ratio, 0);
    out.push({ exam, sum, ok: Math.abs(sum - 1) < 0.001 });
  }
  return out;
}

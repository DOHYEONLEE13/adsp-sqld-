import type { SubjectSchema } from '@/types/question';

/**
 * 과목 구조 정의.
 * 문제 은행을 파싱할 때 topic validation, 필터 UI 생성, AI 약점 분석의
 * 카테고리 그룹핑 등에 사용됩니다. topic 리스트는 문제 파일이 들어오는 대로
 * 확장합니다.
 */

export const ADSP_SCHEMA: SubjectSchema = {
  subject: 'adsp',
  title: 'ADSP — 데이터분석 준전문가',
  chapters: [
    {
      chapter: 1,
      title: '데이터 이해',
      topics: [
        '데이터의 이해',
        '데이터의 가치와 미래',
        '가치 창조를 위한 데이터 사이언스',
      ],
    },
    {
      chapter: 2,
      title: '데이터 분석 기획',
      topics: [
        '데이터 분석 기획의 이해',
        '분석 마스터플랜',
        '분석 과제 발굴',
      ],
    },
    {
      chapter: 3,
      title: '데이터 분석',
      topics: [
        'R 기초와 데이터 마트',
        '통계 분석',
        '통계적 가설 검정',
        '정형 데이터 마이닝',
      ],
    },
  ],
};

export const SQLD_SCHEMA: SubjectSchema = {
  subject: 'sqld',
  title: 'SQLD — SQL 개발자',
  chapters: [
    {
      chapter: 1,
      title: '데이터 모델링의 이해',
      topics: ['데이터 모델링의 이해', '데이터 모델과 성능'],
    },
    {
      chapter: 2,
      title: 'SQL 기본 및 활용',
      topics: ['SQL 기본', 'SQL 활용', 'SQL 최적화 기본 원리'],
    },
  ],
};

export const SUBJECT_SCHEMAS = {
  adsp: ADSP_SCHEMA,
  sqld: SQLD_SCHEMA,
} as const;

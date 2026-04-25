/**
 * 랜딩 "도전 가능한 자격증" 컬렉션 — 실제 앱이 지원하는 과목으로 일치.
 *
 * 사용 가능: ADSP (50 step · 243 문항), SQLD (16 step · 16 문항).
 * 준비중: 빅데이터 분석기사 — 콘텐츠 작성 트랙.
 */

import type { SubjectShowcase } from '@/types/site';
import { VIDEO_URLS } from './site';

export const SUBJECT_SHOWCASES: SubjectShowcase[] = [
  {
    id: 'adsp',
    title: 'ADSP',
    description:
      '데이터 분석 준전문가. 데이터 입문자의 보편적 출발점. 우주 탐험으로 챕터를 정복하세요.',
    videoUrl: VIDEO_URLS.mode1,
    metaLabel: '콘텐츠',
    metaValue: '50 step · 243 문항',
    href: '#/game/adsp',
  },
  {
    id: 'sqld',
    title: 'SQLD',
    description:
      'SQL 개발자. 관계형 DB 설계부터 쿼리 최적화까지. 백엔드 · 분석 · BI 의 기본기.',
    videoUrl: VIDEO_URLS.mode2,
    metaLabel: '콘텐츠',
    metaValue: '16 step · 16 문항',
    href: '#/game/sqld',
  },
  {
    id: 'bdat',
    title: '빅데이터 분석기사',
    description:
      '통계 · 분석 · 머신러닝 실기. 데이터 직무 중급 트랙. 콘텐츠 작성 중.',
    videoUrl: VIDEO_URLS.mode3,
    metaLabel: '출시 예정',
    metaValue: '준비중...',
    comingSoon: true,
  },
];

/** @deprecated SUBJECT_SHOWCASES 사용 — 호환용 alias. */
export const GAME_MODES = SUBJECT_SHOWCASES;

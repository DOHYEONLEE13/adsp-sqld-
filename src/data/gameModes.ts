/**
 * 랜딩 "도전 가능한 자격증" 컬렉션 — 실제 앱이 지원하는 과목으로 일치.
 *
 * 콘텐츠 카운트 (2026-05-01 기준, playable 기준):
 *   사용 가능: ADSP (251 step · 420 문항), SQLD (121 step · 373 문항).
 *   확장 준비: 컴퓨터활용능력 필기 — 1급/2급 행성 세션.
 *
 * "playable" 정의: multiple_choice 타입 + status≠restored + needsDistractors≠true.
 * raw 문항 수와 다를 수 있음 (e.g. restored/deprecated 문항은 playable 에서 제외).
 * gameModes.test.ts 가 metaValue ↔ 실제 playable 수 sync 자동 검증.
 *
 * ⚠️  카운트 갱신 시 sync 필요:
 *   - step 수: src/data/lessons/{adsp,sqld}/ 의 모든 lesson 의 steps 합산
 *     (lessons.integration.test.ts 가 총 372 검증 중)
 *   - 문항 수: npm run audit 출력 — playable (multiple_choice & status≠restored)
 *     기준. ADSP + SQLD 합 793.
 *   런타임 자동 카운트는 의도적으로 안 함 — ALL_QUESTIONS / ALL_LESSONS 를 import
 *   하면 lessons chunk(545KB) + questions chunk 가 랜딩 페이지에 끌려와 첫 진입
 *   번들이 부풀음. 정적 문자열 + 갱신 시 sync 가 더 가벼움.
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
    metaValue: '251 step · 420 문항',
    href: '#/game',
  },
  {
    id: 'sqld',
    title: 'SQLD',
    description:
      'SQL 개발자. 관계형 DB 설계부터 쿼리 최적화까지. 백엔드 · 분석 · BI 의 기본기.',
    videoUrl: VIDEO_URLS.mode2,
    metaLabel: '콘텐츠',
    metaValue: '121 step · 373 문항',
    href: '#/game',
  },
  {
    id: 'comhwal',
    title: '컴퓨터활용능력 필기',
    description:
      '컴퓨터 일반과 스프레드시트 일반부터 시작해요. 1급은 데이터베이스 일반까지 함께 열립니다.',
    videoUrl: VIDEO_URLS.mode3,
    metaLabel: '새 과목',
    metaValue: '1급 · 2급 행성 오픈',
    href: '#/game/comhwal',
  },
];

/** @deprecated SUBJECT_SHOWCASES 사용 — 호환용 alias. */
export const GAME_MODES = SUBJECT_SHOWCASES;

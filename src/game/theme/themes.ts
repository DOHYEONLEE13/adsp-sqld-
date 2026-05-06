/**
 * themes.ts — 사용자가 선택 가능한 ambient 배경 테마 레지스트리.
 *
 * 테마 종류:
 *   - video: 기존 Mux HLS 영상 (movement, 데이터 사용 큼)
 *   - image: 정적 이미지 파일 (public/bg/*.jpg, 가벼움)
 *   - css:   inline CSS-only (네트워크 요청 0, 가장 가벼움)
 *
 * 추가 방법:
 *   1) public/bg/<name>.jpg 에 이미지 저장
 *   2) THEMES 배열에 한 entry 추가 (kind:'image', src 경로 + label + 썸네일)
 *      썸네일은 그냥 같은 이미지 src 재사용해도 OK (background-size: cover 로 카드 채움).
 */

import { VIDEO_URLS, VIDEO_POSTERS } from '@/data/site';

export type ThemeKind = 'video' | 'image' | 'css';

export interface ThemeBase {
  /** localStorage key + UI 식별자. 안정적 — 변경 시 사용자 선택 리셋됨. */
  id: string;
  /** 카드에 표시할 한국어 이름. */
  label: string;
  /** 카드 미리보기 — kind 별 다름. */
  preview:
    | { kind: 'image'; src: string }
    | { kind: 'css'; background: string };
}

export interface ThemeVideo extends ThemeBase {
  kind: 'video';
  src: string; // HLS m3u8 또는 mp4
  poster?: string;
}

export interface ThemeImage extends ThemeBase {
  kind: 'image';
  src: string; // public/ 기준 절대 경로 (예: '/bg/zone-stars.jpg')
}

export interface ThemeCss extends ThemeBase {
  kind: 'css';
  /** GlobalAmbientBg 가 그대로 inline style.background 로 사용. */
  background: string;
  /** 추가 background-size · background-repeat · background-color 옵션. */
  backgroundSize?: string;
  backgroundRepeat?: string;
  backgroundColor?: string;
}

export type Theme = ThemeVideo | ThemeImage | ThemeCss;

// ─── CSS 별빛 — 현재 폴백과 동일 (inline SVG tile) ────────────────────
const STARS_CSS_BG = [
  // 작은 별 90px tile (8 점)
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90'>
      <circle cx='8' cy='12' r='0.7' fill='white' opacity='0.85'/>
      <circle cx='34' cy='5' r='0.5' fill='white' opacity='0.7'/>
      <circle cx='62' cy='18' r='0.6' fill='white' opacity='0.8'/>
      <circle cx='80' cy='32' r='0.7' fill='%23dde8ff' opacity='0.9'/>
      <circle cx='15' cy='44' r='0.5' fill='white' opacity='0.65'/>
      <circle cx='48' cy='58' r='0.6' fill='white' opacity='0.78'/>
      <circle cx='70' cy='70' r='0.5' fill='%23c8d8ff' opacity='0.7'/>
      <circle cx='25' cy='82' r='0.7' fill='white' opacity='0.82'/>
    </svg>`,
  )}")`,
  // 큰 별 180px tile (4 점 + halo)
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>
      <circle cx='30' cy='40' r='1.2' fill='white' opacity='0.95'/>
      <circle cx='30' cy='40' r='2.4' fill='white' opacity='0.18'/>
      <circle cx='130' cy='28' r='1' fill='%23dde8ff' opacity='0.9'/>
      <circle cx='95' cy='110' r='1.4' fill='white' opacity='1'/>
      <circle cx='95' cy='110' r='3' fill='white' opacity='0.18'/>
      <circle cx='160' cy='150' r='1.1' fill='%23c8d8ff' opacity='0.85'/>
    </svg>`,
  )}")`,
  // 은하수
  'radial-gradient(ellipse 65% 35% at 50% 60%, rgba(120,170,255,0.16), transparent 75%)',
  // 베이스 navy vignette
  'radial-gradient(ellipse 100% 100% at 50% 50%, #0a1228 0%, #050a1c 55%, #02050f 100%)',
].join(', ');

const STARS_CSS_SIZE = '90px 90px, 180px 180px, 100% 100%, 100% 100%';
const STARS_CSS_REPEAT = 'repeat, repeat, no-repeat, no-repeat';

// ─── 테마 레지스트리 ─────────────────────────────────────────────────

export const THEMES: Theme[] = [
  {
    id: 'video-original',
    kind: 'video',
    label: '우주 영상',
    src: VIDEO_URLS.pageAmbient,
    poster: VIDEO_POSTERS.pageAmbient,
    preview: {
      kind: 'image',
      src: VIDEO_POSTERS.pageAmbient,
    },
  },
  {
    id: 'stars-css',
    kind: 'css',
    label: '은하수',
    background: STARS_CSS_BG,
    backgroundSize: STARS_CSS_SIZE,
    backgroundRepeat: STARS_CSS_REPEAT,
    backgroundColor: '#02050f',
    preview: {
      kind: 'css',
      background: STARS_CSS_BG,
    },
  },
  // ── 사용자 추가 테마 placeholder ──
  // 이미지 저장 후 아래 entry 의 주석을 풀고 파일명 맞추세요.
  // {
  //   id: 'aurora',
  //   kind: 'image',
  //   label: '오로라',
  //   src: '/bg/aurora.jpg',
  //   preview: { kind: 'image', src: '/bg/aurora.jpg' },
  // },
];

/** 기본 테마 — 사용자 미선택 / 잘못된 id 일 때 fallback. */
export const DEFAULT_THEME_ID = 'stars-css';

export function getThemeById(id: string | null): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME_ID) ?? THEMES[0];
}

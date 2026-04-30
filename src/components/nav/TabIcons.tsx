/**
 * TabIcons — 하단 네비 탭 4종 전용 아이콘.
 *
 * 왜 lucide 가 아닌 커스텀인가:
 *   lucide 는 outline 기반이라 한 아이콘이 여러 path 로 구성됨. path 끝점의
 *   round-cap 들이 서로 만나면 살짝 두꺼워 보여 "선을 이어 붙인 듯한 조잡함" 이
 *   생김 (특히 비활성 / 작은 사이즈에서 도드라짐).
 *
 *   본 컴포넌트들은 모두 **단일 path · fill-only** 실루엣. stroke 0 → join/overlap
 *   자체가 발생 안 함. 활성/비활성 모두 같은 path, 색상만 다름.
 *
 * API (lucide 와 호환되는 최소 set):
 *   - size:   px (default 26)
 *   - className / style: 자유
 *   - fill:   "currentColor" 가 default — 부모의 color 를 따름
 *
 * 디자인 톤:
 *   - 24×24 viewBox · 24px 안에 살짝 여유를 둔 크기 (약 22px 정도 시각 면적)
 *   - 둥근 corner (rx 1~2) 로 부드러운 인상
 *   - 한 가지 형태로 인지 가능한 단순한 실루엣
 */

import type { CSSProperties } from 'react';

export interface TabIconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** 기본 'currentColor'. 부모의 color 따라감. */
  fill?: string;
  /** ARIA — 보통 부모 button 의 aria-label 이 의미를 담으므로 hidden. */
  'aria-hidden'?: boolean;
}

function base(p: TabIconProps) {
  return {
    width: p.size ?? 26,
    height: p.size ?? 26,
    viewBox: '0 0 24 24',
    fill: p.fill ?? 'currentColor',
    className: p.className,
    style: p.style,
    'aria-hidden': p['aria-hidden'] ?? true,
    xmlns: 'http://www.w3.org/2000/svg',
  } as const;
}

/**
 * 학습 — 펼친 책 (open book).
 * 사이트 메타포 (지도/우주) 대신 "공부" 의 직관적 시그널 — 두 페이지 실루엣.
 */
export function BookTabIcon(props: TabIconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v14.5a.5.5 0 0 1-.85.36A4 4 0 0 0 8.34 18.5H5a2 2 0 0 1-2-2V5zm18 0a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v14.5a.5.5 0 0 0 .85.36 4 4 0 0 1 2.81-1.36H19a2 2 0 0 0 2-2V5z" />
    </svg>
  );
}

/**
 * 퀘스트 — 깃발 (flag with pole).
 * 단일 path: 수직 막대 + 삼각 깃발 부분이 한 outline 으로.
 */
export function FlagTabIcon(props: TabIconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 2a1 1 0 0 1 1 1v1h12.4a1 1 0 0 1 .81 1.59L17 9l2.21 3.41A1 1 0 0 1 18.4 14H6v7a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1z" />
    </svg>
  );
}

/**
 * 친구 — 트로피 (trophy cup).
 * 손잡이 두 개 + 컵 + 받침대. 단일 path 로 evenodd fill rule 사용 X — 모두 외곽선.
 */
export function TrophyTabIcon(props: TabIconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 2a1 1 0 0 0-1 1v1H3a2 2 0 0 0-2 2v1a4 4 0 0 0 3.6 3.98A7.01 7.01 0 0 0 9 14.92V17H8a2 2 0 0 0-2 2v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2a2 2 0 0 0-2-2h-1v-2.08a7.01 7.01 0 0 0 4.4-3.94A4 4 0 0 0 23 7V6a2 2 0 0 0-2-2h-2V3a1 1 0 0 0-1-1H6zm0 4H3v1c0 .87.56 1.61 1.34 1.88A12 12 0 0 1 4 6.5V6zm14 0c-.04.17-.04.34-.04.5 0 .85-.13 1.66-.32 2.43A2 2 0 0 0 21 7V6h-1z" />
    </svg>
  );
}

/**
 * 프로필 — 사람 (person silhouette).
 * 머리(원) + 어깨(반원). 두 영역이 만나 단일 path 처럼 보이도록 살짝 겹침.
 */
export function UserTabIcon(props: TabIconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM3 22a9 9 0 1 1 18 0 1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

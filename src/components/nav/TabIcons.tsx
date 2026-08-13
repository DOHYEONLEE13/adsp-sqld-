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
      <path
        d="M4.4 5.2c0-.95.77-1.72 1.72-1.72h3.15c1.52 0 2.73.78 2.73 1.76V19.3c-.7-.92-1.78-1.52-3.18-1.52h-2.7a1.72 1.72 0 0 1-1.72-1.72V5.2Z"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <path
        d="M19.6 5.2c0-.95-.77-1.72-1.72-1.72h-3.15c-1.52 0-2.73.78-2.73 1.76V19.3c.7-.92 1.78-1.52 3.18-1.52h2.7a1.72 1.72 0 0 0 1.72-1.72V5.2Z"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path
        d="M4.4 5.2c0-.95.77-1.72 1.72-1.72h3.15c1.52 0 2.73.78 2.73 1.76V19.3c-.7-.92-1.78-1.52-3.18-1.52h-2.7a1.72 1.72 0 0 1-1.72-1.72V5.2ZM19.6 5.2c0-.95-.77-1.72-1.72-1.72h-3.15c-1.52 0-2.73.78-2.73 1.76V19.3c.7-.92 1.78-1.52 3.18-1.52h2.7a1.72 1.72 0 0 0 1.72-1.72V5.2ZM12 5.15v14.2M7.25 7.35h2.25M7.25 10.05h2.25M7.25 12.75h2.1M14.5 7.35h2.25M14.5 10.05h2.25M14.65 12.75h2.1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M8.15 15.55c1.45 0 2.75.42 3.85 1.24 1.1-.82 2.4-1.24 3.85-1.24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.45"
        strokeOpacity="0.78"
      />
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
      <path
        d="M6 3.4v17.2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M7 4.4h10.7c.75 0 1.15.87.67 1.45L16.25 8.4l2.12 2.55c.48.58.08 1.45-.67 1.45H7V4.4Z"
        fill="currentColor"
        fillOpacity="0.26"
      />
      <path
        d="M7 4.4h10.7c.75 0 1.15.87.67 1.45L16.25 8.4l2.12 2.55c.48.58.08 1.45-.67 1.45H7"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
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
      <path
        d="M7.2 4h9.6v3.9c0 2.9-1.88 5.35-4.8 5.35S7.2 10.8 7.2 7.9V4Z"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <path
        d="M7.2 5.2H4.7c-.75 0-1.35.6-1.35 1.35v.75c0 2.15 1.65 3.75 3.85 3.85M16.8 5.2h2.5c.75 0 1.35.6 1.35 1.35v.75c0 2.15-1.65 3.75-3.85 3.85M7.2 4h9.6v3.9c0 2.9-1.88 5.35-4.8 5.35S7.2 10.8 7.2 7.9V4ZM12 13.25v3.3M8.8 20h6.4M10 16.55h4c.72 0 1.3.58 1.3 1.3V20H8.7v-2.15c0-.72.58-1.3 1.3-1.3Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
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
      <circle cx="12" cy="8" r="4.1" fill="currentColor" fillOpacity="0.24" />
      <path
        d="M12 12.1c-4.45 0-7.7 2.85-7.7 6.25 0 .93.75 1.65 1.68 1.65h12.04c.93 0 1.68-.72 1.68-1.65 0-3.4-3.25-6.25-7.7-6.25Z"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path
        d="M16.1 8A4.1 4.1 0 1 1 7.9 8a4.1 4.1 0 0 1 8.2 0ZM4.3 18.35c0-3.4 3.25-6.25 7.7-6.25s7.7 2.85 7.7 6.25c0 .93-.75 1.65-1.68 1.65H5.98c-.93 0-1.68-.72-1.68-1.65Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

/**
 * 홈 — 지붕과 몸체로 이루어진 집 실루엣.
 * 다른 탭들과 같은 구성: 옅은 fill 레이어 + 같은 path 의 stroke 윤곽.
 */
export function HomeTabIcon(props: TabIconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M3.9 10.35 12 3.8l8.1 6.55v8.05c0 .93-.75 1.68-1.68 1.68H5.58c-.93 0-1.68-.75-1.68-1.68v-8.05Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M3.9 10.35 12 3.8l8.1 6.55v8.05c0 .93-.75 1.68-1.68 1.68H5.58c-.93 0-1.68-.75-1.68-1.68v-8.05Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <path
        d="M9.65 20.08v-4.9c0-.6.49-1.09 1.09-1.09h2.52c.6 0 1.09.49 1.09 1.09v4.9"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

/**
 * 진행도 — 3개 막대 그래프 (오름차순).
 * 단일 path 로 3개 직사각형이 baseline 에서 떠올라 progressing.
 */
export function ChartTabIcon(props: TabIconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 14a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6zm6-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V9zm6-6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V3z" />
    </svg>
  );
}

/**
 * 약점 — 불꽃 (flame).
 * 약점 단원이 핫스팟이라는 메타포. ZoneScreen 의 "약점 집중" 칩 (Flame) 과 일관.
 * 단일 path filled 실루엣 — 한 번에 그려짐, join/overlap 없음.
 */
export function FlameTabIcon(props: TabIconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M12.2 2.9c.34 2.32 1.65 4.08 3.35 5.57 1.73 1.52 2.95 3.12 2.95 5.55a6.5 6.5 0 0 1-13 0c0-1.3.46-2.47 1.17-3.42.47 1.03 1.44 1.73 2.63 1.73 1.58 0 2.7-1.15 2.7-2.83 0-1.1-.38-1.9-.78-2.72-.7-1.42-.45-2.73.98-3.88Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M12.2 2.9c.34 2.32 1.65 4.08 3.35 5.57 1.73 1.52 2.95 3.12 2.95 5.55a6.5 6.5 0 0 1-13 0c0-1.3.46-2.47 1.17-3.42.47 1.03 1.44 1.73 2.63 1.73 1.58 0 2.7-1.15 2.7-2.83 0-1.1-.38-1.9-.78-2.72-.7-1.42-.45-2.73.98-3.88Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <path
        d="M12.15 17.9c1.45-.42 2.25-1.5 2.25-2.85 0-.9-.35-1.58-.95-2.22-.2 1.02-.88 1.58-1.72 2.18-.8.57-1.2 1.1-1.2 1.85 0 .78.62 1.35 1.62 1.04Z"
        fill="currentColor"
        fillOpacity="0.72"
      />
    </svg>
  );
}

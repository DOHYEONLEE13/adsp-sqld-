/**
 * PlanetOrb — 로드맵 노드용 순수 SVG 행성.
 *
 * GLB(서드파티 모델, 테마 불일치·23MB) 와 three.js 절차 행성을 대체한다.
 * 모든 색이 과목 accent 에서 color-mix 로 파생되므로 ADSP(시안)·SQLD(퍼플)·
 * 컴활(그린)이 자동으로 같은 디자인 언어를 공유한다.
 *
 * 라이팅 규칙은 `.qd-roadmap-orb` 3D 버튼과 동일: 좌상단 키라이트,
 * 우하단 네이비 셰이드, accent 림 글로우.
 *
 * variant:
 *   - terra  : 대륙 + 극지방 캡 + 구름 드리프트 + 위성 궤도
 *   - ring   : 가스 밴드 + 폭풍 + 기울어진 고리 (행성 뒤/앞 분리)
 *   - crater : 암석 표면 + 크레이터 + 더스트 밴드 (정적)
 *
 * 애니메이션은 CSS 클래스(qd-planet-orb__*)로 구동, reduced-motion 시 정지.
 */

import { useId } from 'react';

export type PlanetVariant = 'terra' | 'ring' | 'crater';

interface Props {
  accent: string;
  variant: PlanetVariant;
}

const DEEP = '#0a1838'; // 행성 어두운 면 — --base(#010828) 계열
const SHADE = '6, 14, 46'; // 터미네이터 셰이드 rgb

export default function PlanetOrb({ accent, variant }: Props) {
  // useId 는 ':' 를 포함할 수 있어 url(#...) 참조용으로 정리.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const mix = (pct: number, base: string) =>
    `color-mix(in srgb, ${accent} ${pct}%, ${base})`;

  const clipId = `${uid}-clip`;

  return (
    <svg
      viewBox="0 0 120 120"
      className="qd-planet-orb"
      style={{ overflow: 'visible' }}
      aria-hidden="true"
      data-planet-variant={variant}
      data-planet-ready="true"
    >
      <defs>
        {/* 본체 — 좌상단 키라이트 → accent → 딥네이비 */}
        <radialGradient id={`${uid}-base`} cx="36%" cy="30%" r="80%">
          <stop offset="0%" stopColor={mix(26, '#ffffff')} />
          <stop offset="30%" stopColor={mix(70, '#ffffff')} />
          <stop offset="58%" stopColor={accent} />
          <stop offset="80%" stopColor={mix(50, '#14306e')} />
          <stop offset="100%" stopColor={mix(22, DEEP)} />
        </radialGradient>

        {/* 터미네이터 — 광원 반대편을 어둡게 */}
        <radialGradient id={`${uid}-shade`} cx="36%" cy="30%" r="100%">
          <stop offset="0%" stopColor={`rgba(${SHADE}, 0)`} />
          <stop offset="52%" stopColor={`rgba(${SHADE}, 0)`} />
          <stop offset="78%" stopColor={`rgba(${SHADE}, 0.30)`} />
          <stop offset="100%" stopColor={`rgba(${SHADE}, 0.62)`} />
        </radialGradient>

        {/* 림 글로우(대기) — 행성 가장자리를 감싸는 halo */}
        <radialGradient id={`${uid}-atmo`} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor={accent} stopOpacity="0" />
          <stop offset="80%" stopColor={accent} stopOpacity="0.5" />
          <stop offset="90%" stopColor={accent} stopOpacity="0.16" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>

        {/* 스펙큘러 하이라이트 */}
        <radialGradient id={`${uid}-spec`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* 고리 — 중앙이 밝고 양끝이 사라지는 스트로크 */}
        <linearGradient id={`${uid}-ringG`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={mix(35, '#ffffff')} stopOpacity="0.05" />
          <stop offset="50%" stopColor={mix(45, '#ffffff')} stopOpacity="0.95" />
          <stop offset="100%" stopColor={mix(35, '#ffffff')} stopOpacity="0.05" />
        </linearGradient>

        {/* 위성 */}
        <radialGradient id={`${uid}-moon`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor={mix(28, '#dde8ff')} />
          <stop offset="100%" stopColor={mix(18, '#5d6c9e')} />
        </radialGradient>

        <clipPath id={clipId}>
          <circle cx="60" cy="60" r="38" />
        </clipPath>
      </defs>

      {/* 대기 halo — 행성 뒤 */}
      <circle cx="60" cy="60" r="47" fill={`url(#${uid}-atmo)`} />

      {/* 고리 뒷면 — 행성에 가려지는 위쪽 절반 */}
      {variant === 'ring' ? (
        <g transform="rotate(-18 60 60)">
          <path
            d="M 4 60 A 56 14.5 0 0 1 116 60"
            fill="none"
            stroke={`url(#${uid}-ringG)`}
            strokeWidth="3.4"
            strokeLinecap="round"
            opacity="0.5"
          />
        </g>
      ) : null}

      {/* 행성 본체 */}
      <circle cx="60" cy="60" r="38" fill={`url(#${uid}-base)`} />

      {/* 표면 디테일 — 구체 클립 */}
      <g clipPath={`url(#${clipId})`}>
        {variant === 'terra' ? (
          <>
            {/* 극지방 캡 */}
            <ellipse cx="56" cy="27" rx="23" ry="10" fill="#ffffff" opacity="0.2" />
            {/* 대륙 — accent 비중을 높여 탁한 회색 대신 깊은 동색 계열로 */}
            <path
              d="M 28 52 C 34 42, 50 40, 56 48 C 62 56, 52 64, 42 64 C 32 64, 24 60, 28 52 Z"
              fill={mix(58, '#10306e')}
              opacity="0.5"
            />
            <path
              d="M 66 70 C 76 64, 90 68, 88 78 C 86 88, 70 90, 62 84 C 56 78, 60 74, 66 70 Z"
              fill={mix(58, '#10306e')}
              opacity="0.55"
            />
            {/* 구름 — 두 세트가 76px 주기로 무한 드리프트 */}
            <g className="qd-planet-orb__drift" opacity="0.85">
              {[0, 76].map((dx) => (
                <g key={dx} transform={`translate(${dx} 0)`}>
                  <ellipse cx="32" cy="46" rx="12" ry="3.4" fill="#ffffff" opacity="0.16" />
                  <ellipse cx="54" cy="38" rx="9" ry="2.8" fill="#ffffff" opacity="0.13" />
                  <ellipse cx="46" cy="72" rx="14" ry="3.8" fill="#ffffff" opacity="0.15" />
                  <ellipse cx="72" cy="58" rx="10" ry="3" fill="#ffffff" opacity="0.12" />
                </g>
              ))}
            </g>
          </>
        ) : null}

        {variant === 'ring' ? (
          <g transform="rotate(-7 60 60)">
            <rect x="10" y="30" width="100" height="9" rx="4.5" fill="#ffffff" opacity="0.16" />
            <rect x="10" y="42" width="100" height="12" rx="6" fill={mix(70, '#ffffff')} opacity="0.26" />
            <rect x="10" y="57" width="100" height="10" rx="5" fill={mix(30, '#11295e')} opacity="0.38" />
            <rect x="10" y="70" width="100" height="7" rx="3.5" fill="#ffffff" opacity="0.1" />
            <rect x="10" y="80" width="100" height="12" rx="6" fill={mix(25, '#0c1f4c')} opacity="0.42" />
            {/* 폭풍 — 좌우로 천천히 흔들리는 스팟 */}
            <g className="qd-planet-orb__sway">
              <ellipse cx="74" cy="63" rx="9.5" ry="5.5" fill={`url(#${uid}-spec)`} opacity="0.75" />
              <ellipse cx="72" cy="62" rx="4" ry="2.2" fill="#ffffff" opacity="0.5" />
            </g>
          </g>
        ) : null}

        {variant === 'crater' ? (
          <>
            <rect
              x="0"
              y="50"
              width="130"
              height="11"
              fill="#ffffff"
              opacity="0.07"
              transform="rotate(-18 60 60)"
            />
            {[
              { cx: 44, cy: 42, r: 7 },
              { cx: 70, cy: 52, r: 4.5 },
              { cx: 52, cy: 72, r: 5.5 },
              { cx: 76, cy: 76, r: 3.4 },
              { cx: 34, cy: 62, r: 3.2 },
            ].map(({ cx, cy, r }) => (
              <g key={`${cx}-${cy}`}>
                <circle cx={cx} cy={cy} r={r} fill={`rgba(${SHADE}, 0.4)`} />
                <circle cx={cx + r * 0.18} cy={cy + r * 0.22} r={r * 0.66} fill={`rgba(${SHADE}, 0.32)`} />
                <path
                  d={`M ${cx - r * 0.72} ${cy - r * 0.3} A ${r * 0.82} ${r * 0.82} 0 0 1 ${cx + r * 0.28} ${cy - r * 0.76}`}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={r * 0.16}
                  strokeLinecap="round"
                  opacity="0.3"
                />
              </g>
            ))}
          </>
        ) : null}

        {/* 터미네이터 + 스펙큘러 — 모든 variant 공통 */}
        <circle cx="60" cy="60" r="38" fill={`url(#${uid}-shade)`} />
        <ellipse cx="46" cy="36" rx="15" ry="9" fill={`url(#${uid}-spec)`} opacity="0.55" />
      </g>

      {/* 림 라이트 — 밝은 쪽 가장자리 얇은 선 */}
      <circle
        cx="60"
        cy="60"
        r="37.4"
        fill="none"
        stroke={mix(55, '#ffffff')}
        strokeWidth="1"
        opacity="0.28"
        strokeDasharray="92 147"
        strokeDashoffset="155"
        strokeLinecap="round"
      />

      {/* 고리 앞면 — 행성 위를 지나는 아래쪽 절반 */}
      {variant === 'ring' ? (
        <g transform="rotate(-18 60 60)">
          <path
            d="M 4 60 A 56 14.5 0 0 0 116 60"
            fill="none"
            stroke={`url(#${uid}-ringG)`}
            strokeWidth="4.4"
            strokeLinecap="round"
          />
          <path
            d="M 8 62 A 52 12.5 0 0 0 112 62"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.3"
          />
        </g>
      ) : null}

      {/* 위성 — terra 전용, 궤도 회전 */}
      {variant === 'terra' ? (
        <g className="qd-planet-orb__orbit">
          <circle cx="60" cy="13.5" r="4.6" fill={`url(#${uid}-moon)`} />
          <circle cx="58.6" cy="12.2" r="1.3" fill="#ffffff" opacity="0.5" />
        </g>
      ) : null}
    </svg>
  );
}

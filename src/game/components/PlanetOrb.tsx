/**
 * PlanetOrb — 로드맵 노드용 순수 SVG 행성 (v2).
 *
 * GLB(서드파티 모델, 테마 불일치·23MB) 와 three.js 절차 행성을 대체한다.
 * 모든 색이 과목 accent 에서 color-mix 로 파생되므로 ADSP(시안)·SQLD(퍼플)·
 * 컴활(그린)이 자동으로 같은 디자인 언어를 공유한다.
 *
 * v2 디테일 업그레이드:
 *   - feTurbulence + feDisplacementMap 으로 유기적 해안선·지형 (정적 레이어에만
 *     적용 — 애니메이션 레이어에 필터를 걸면 매 프레임 래스터라이즈되므로 금지)
 *   - 위도 밴드가 구면을 따라 휘어짐 (직선 rect 금지)
 *   - 크레이터: radial gradient 깊이 + 광원 방향 림 하이라이트 + 림 그림자
 *   - 고리: 스트로크가 아니라 채워진 annulus + 행성 표면에 떨어지는 고리 그림자
 *   - 입체 구름 (본체 + 아래쪽 드롭 섀도 쌍)
 *   - 이중 셰이딩 (radial 터미네이터 + 코어 섀도) / 방향성 대기 글로우
 *
 * 라이팅 규칙은 `.qd-roadmap-orb` 3D 버튼과 동일: 좌상단 키라이트,
 * 우하단 네이비 셰이드, accent 림 글로우.
 *
 * variant:
 *   - terra  : 대륙 + 극관 + 구름 드리프트 + 위성 궤도
 *   - ring   : 휘어진 가스 밴드 + 폭풍 소용돌이 + 기울어진 고리
 *   - crater : 암석 지형 + 크레이터 군 + 더스트 밴드 (정적)
 *
 * 애니메이션은 CSS 클래스(qd-planet-orb__*)로 구동, reduced-motion 시 정지.
 */

import { useId } from 'react';

export type PlanetVariant = 'terra' | 'ring' | 'crater';

interface Props {
  accent: string;
  variant: PlanetVariant;
}

const DEEP = '#091430'; // 행성 어두운 면 — --base(#010828) 계열
const SHADE = '5, 12, 42'; // 터미네이터 셰이드 rgb

/** 구면 위도를 따라 휘는 닫힌 밴드 패스. bow > 0 = 아래로 볼록(스마일). */
function bandPath(yTop: number, yBot: number, bow: number): string {
  return `M 14 ${yTop} Q 60 ${yTop + bow}, 106 ${yTop} L 106 ${yBot} Q 60 ${
    yBot + bow
  }, 14 ${yBot} Z`;
}

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
        {/* 본체 — 좌상단 키라이트 → accent → 딥네이비 (그림자 쪽은 한색 계열로 휘어짐) */}
        <radialGradient id={`${uid}-base`} cx="34%" cy="28%" r="82%">
          <stop offset="0%" stopColor={mix(18, '#ffffff')} />
          <stop offset="24%" stopColor={mix(58, '#ffffff')} />
          <stop offset="50%" stopColor={accent} />
          <stop offset="74%" stopColor={mix(56, '#17336e')} />
          <stop offset="100%" stopColor={mix(26, DEEP)} />
        </radialGradient>

        {/* 터미네이터 1 — 광원 반대편 라디얼 셰이드 */}
        <radialGradient id={`${uid}-shade`} cx="34%" cy="28%" r="102%">
          <stop offset="0%" stopColor={`rgba(${SHADE}, 0)`} />
          <stop offset="50%" stopColor={`rgba(${SHADE}, 0)`} />
          <stop offset="74%" stopColor={`rgba(${SHADE}, 0.26)`} />
          <stop offset="92%" stopColor={`rgba(${SHADE}, 0.52)`} />
          <stop offset="100%" stopColor={`rgba(${SHADE}, 0.66)`} />
        </radialGradient>

        {/* 터미네이터 2 — 우하단 코어 섀도 (이중 셰이딩으로 부피감) */}
        <radialGradient id={`${uid}-core`} cx="76%" cy="80%" r="55%">
          <stop offset="0%" stopColor={`rgba(${SHADE}, 0.34)`} />
          <stop offset="55%" stopColor={`rgba(${SHADE}, 0.16)`} />
          <stop offset="100%" stopColor={`rgba(${SHADE}, 0)`} />
        </radialGradient>

        {/* 림 글로우(대기) — 행성 가장자리 halo */}
        <radialGradient id={`${uid}-atmo`} cx="50%" cy="50%" r="50%">
          <stop offset="72%" stopColor={accent} stopOpacity="0" />
          <stop offset="82%" stopColor={accent} stopOpacity="0.38" />
          <stop offset="92%" stopColor={accent} stopOpacity="0.12" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>

        {/* 스펙큘러 */}
        <radialGradient id={`${uid}-spec`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* 크레이터 — 가운데가 깊고 림에서 사라지는 보울 */}
        <radialGradient id={`${uid}-bowl`} cx="44%" cy="42%" r="58%">
          <stop offset="0%" stopColor={`rgba(${SHADE}, 0.5)`} />
          <stop offset="62%" stopColor={`rgba(${SHADE}, 0.3)`} />
          <stop offset="88%" stopColor={`rgba(${SHADE}, 0.08)`} />
          <stop offset="100%" stopColor={`rgba(${SHADE}, 0)`} />
        </radialGradient>

        {/* 고리 — 안쪽이 밝고 바깥이 옅은 띠 */}
        <linearGradient id={`${uid}-ringG`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={mix(40, '#ffffff')} stopOpacity="0.12" />
          <stop offset="28%" stopColor={mix(34, '#ffffff')} stopOpacity="0.85" />
          <stop offset="50%" stopColor={mix(55, '#ffffff')} stopOpacity="0.95" />
          <stop offset="72%" stopColor={mix(34, '#ffffff')} stopOpacity="0.85" />
          <stop offset="100%" stopColor={mix(40, '#ffffff')} stopOpacity="0.12" />
        </linearGradient>

        {/* 위성 */}
        <radialGradient id={`${uid}-moon`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor={mix(26, '#dde8ff')} />
          <stop offset="100%" stopColor={mix(16, '#56659a')} />
        </radialGradient>

        {/* 유기적 변형 필터 — 정적 레이어 전용 */}
        <filter id={`${uid}-fLand`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.052" numOctaves="3" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="8" />
        </filter>
        <filter id={`${uid}-fRock`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.085" numOctaves="2" seed="11" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="6" />
        </filter>
        <filter id={`${uid}-fBand`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.09" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
        </filter>
        <filter id={`${uid}-blur2`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.1" />
        </filter>
        <filter id={`${uid}-blur1`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1" />
        </filter>

        <clipPath id={clipId}>
          <circle cx="60" cy="60" r="38" />
        </clipPath>
      </defs>

      {/* 대기 halo — 행성 뒤, 은은하게 */}
      <circle cx="60" cy="60" r="48" fill={`url(#${uid}-atmo)`} opacity="0.8" />

      {/* 고리 뒷면 — 행성 위쪽으로 지나가는 절반 (어둡게) */}
      {variant === 'ring' ? (
        <g transform="translate(60 60) rotate(-18)">
          <path
            d="M -57 0 A 57 14.6 0 0 1 57 0 L 45 0 A 45 11 0 0 0 -45 0 Z"
            fill={`url(#${uid}-ringG)`}
            opacity="0.42"
          />
        </g>
      ) : null}

      {/* 행성 본체 */}
      <circle cx="60" cy="60" r="38" fill={`url(#${uid}-base)`} />

      {/* 표면 디테일 — 구체 클립 */}
      <g clipPath={`url(#${clipId})`}>
        {variant === 'terra' ? (
          <>
            {/* 대륙 — 터뷸런스 변위로 유기적 해안선 (정적) */}
            <g filter={`url(#${uid}-fLand)`}>
              <path
                d="M 22 50 C 26 40, 40 36, 50 41 C 60 45, 62 54, 55 60 C 47 66, 42 62, 36 65 C 28 69, 18 60, 22 50 Z"
                fill={mix(54, '#10306e')}
                opacity="0.62"
              />
              <path
                d="M 62 72 C 70 64, 86 66, 90 75 C 93 83, 84 90, 73 89 C 63 88, 56 78, 62 72 Z"
                fill={mix(54, '#10306e')}
                opacity="0.66"
              />
              <path
                d="M 73 36 C 79 32, 88 35, 88 42 C 88 48, 80 50, 74 47 C 69 44, 69 39, 73 36 Z"
                fill={mix(54, '#10306e')}
                opacity="0.5"
              />
              {/* 섬 */}
              <circle cx="44" cy="78" r="2.6" fill={mix(54, '#10306e')} opacity="0.55" />
              <circle cx="84" cy="56" r="2" fill={mix(54, '#10306e')} opacity="0.5" />
              {/* 해안선 글린트 — 광원 방향 */}
              <path
                d="M 24 48 C 28 40, 40 37, 49 42"
                fill="none"
                stroke={mix(20, '#ffffff')}
                strokeWidth="1.1"
                strokeLinecap="round"
                opacity="0.4"
              />
            </g>

            {/* 극관 — 변위된 가장자리 */}
            <g filter={`url(#${uid}-fLand)`}>
              <path
                d="M 30 26 Q 44 16, 62 19 Q 78 21, 84 30 Q 70 36, 52 34 Q 36 32, 30 26 Z"
                fill="#ffffff"
                opacity="0.55"
              />
              <path
                d="M 34 29 Q 48 22, 64 24 Q 74 26, 80 31"
                fill="none"
                stroke={mix(35, '#ffffff')}
                strokeWidth="1.4"
                opacity="0.35"
              />
            </g>

            {/* 구름 — 본체+그림자 쌍, 두 세트가 76px 주기 드리프트 (필터 없음) */}
            <g className="qd-planet-orb__drift">
              {[0, 76].map((dx) => (
                <g key={dx} transform={`translate(${dx} 0)`}>
                  {/* 그림자 먼저 (아래로 1.8 오프셋) */}
                  <path
                    d="M 26 47 q 4 -6 10 -5 q 3 -5 9 -3 q 7 -2 9 4 q 5 2 2 6 q -14 3 -30 -2 z"
                    transform="translate(1.2 1.8)"
                    fill={`rgba(${SHADE}, 0.28)`}
                  />
                  <path
                    d="M 26 47 q 4 -6 10 -5 q 3 -5 9 -3 q 7 -2 9 4 q 5 2 2 6 q -14 3 -30 -2 z"
                    fill="#ffffff"
                    opacity="0.78"
                  />
                  <path
                    d="M 56 68 q 3 -5 8 -4 q 3 -4 8 -2 q 6 -1 7 3 q 4 2 1 5 q -11 3 -24 -2 z"
                    transform="translate(1 1.6)"
                    fill={`rgba(${SHADE}, 0.24)`}
                  />
                  <path
                    d="M 56 68 q 3 -5 8 -4 q 3 -4 8 -2 q 6 -1 7 3 q 4 2 1 5 q -11 3 -24 -2 z"
                    fill="#ffffff"
                    opacity="0.7"
                  />
                  <ellipse cx="78" cy="44" rx="7" ry="2.2" fill="#ffffff" opacity="0.45" />
                </g>
              ))}
            </g>
          </>
        ) : null}

        {variant === 'ring' ? (
          <>
            {/* 위도 밴드 — 구면을 따라 휘어짐 + 가장자리 터뷸런스 */}
            <g filter={`url(#${uid}-fBand)`}>
              <path d={bandPath(28, 36, 4.5)} fill="#ffffff" opacity="0.2" />
              <path d={bandPath(38, 50, 5.5)} fill={mix(28, '#ffffff')} opacity="0.34" />
              <path d={bandPath(52, 60, 6.5)} fill={mix(42, '#11295e')} opacity="0.42" />
              <path d={bandPath(62, 68, 7.5)} fill="#ffffff" opacity="0.14" />
              <path d={bandPath(70, 82, 8.5)} fill={mix(30, '#0c1f4c')} opacity="0.5" />
              <path d={bandPath(86, 96, 9.5)} fill={mix(20, '#ffffff')} opacity="0.16" />
            </g>

            {/* 폭풍 소용돌이 — 좌우 sway (필터 없음) */}
            <g className="qd-planet-orb__sway">
              <g transform="rotate(-10 76 73)">
                <ellipse cx="76" cy="73" rx="11" ry="6" fill={mix(18, '#ffffff')} opacity="0.34" />
                <ellipse cx="77.5" cy="72.4" rx="7.2" ry="4" fill={mix(30, '#ffffff')} opacity="0.5" />
                <ellipse cx="79" cy="71.8" rx="3.6" ry="2" fill="#ffffff" opacity="0.82" />
                <path
                  d="M 65 74 Q 70 78.5, 80 77.5"
                  fill="none"
                  stroke={mix(16, '#ffffff')}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  opacity="0.45"
                />
              </g>
            </g>
          </>
        ) : null}

        {variant === 'crater' ? (
          <>
            {/* 지형 모틀 — 밝고 어두운 패치 (정적, 변위) */}
            <g filter={`url(#${uid}-fRock)`}>
              <path
                d="M 26 40 Q 42 28, 60 34 Q 52 48, 38 50 Q 28 50, 26 40 Z"
                fill="#ffffff"
                opacity="0.12"
              />
              <path
                d="M 58 80 Q 72 70, 88 76 Q 86 90, 70 92 Q 60 90, 58 80 Z"
                fill={`rgba(${SHADE}, 0.22)`}
              />
              <path
                d="M 20 64 Q 32 58, 40 66 Q 34 76, 24 74 Q 18 70, 20 64 Z"
                fill={`rgba(${SHADE}, 0.16)`}
              />
            </g>

            {/* 더스트 밴드 */}
            <rect
              x="-4"
              y="50"
              width="130"
              height="9"
              fill="#ffffff"
              opacity="0.06"
              transform="rotate(-18 60 60)"
            />

            {/* 크레이터 군 — 림 근처는 원근 압축(squash) */}
            {[
              { cx: 42, cy: 40, r: 7.5, squash: 1, rot: 0 },
              { cx: 73, cy: 50, r: 4.6, squash: 0.92, rot: -12 },
              { cx: 50, cy: 74, r: 6, squash: 1, rot: 0 },
              { cx: 79, cy: 75, r: 3.6, squash: 0.78, rot: -32 },
              { cx: 30, cy: 62, r: 3.4, squash: 0.8, rot: 24 },
              { cx: 62, cy: 30, r: 2.6, squash: 0.85, rot: -6 },
              { cx: 88, cy: 62, r: 2.4, squash: 0.6, rot: -48 },
            ].map(({ cx, cy, r, squash, rot }) => (
              <g key={`${cx}-${cy}`} transform={`rotate(${rot} ${cx} ${cy})`}>
                {/* 보울 (깊이) */}
                <ellipse cx={cx} cy={cy} rx={r} ry={r * squash} fill={`url(#${uid}-bowl)`} />
                {/* 림 하이라이트 — 광원 반대쪽(우하단) 안쪽 림이 밝음 */}
                <path
                  d={`M ${cx - r * 0.62} ${cy + r * squash * 0.62} A ${r * 0.9} ${
                    r * squash * 0.9
                  } 0 0 0 ${cx + r * 0.85} ${cy + r * squash * 0.28}`}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={Math.max(0.7, r * 0.14)}
                  strokeLinecap="round"
                  opacity="0.4"
                />
                {/* 림 섀도 — 광원 쪽(좌상단) 바깥 림이 어두움 */}
                <path
                  d={`M ${cx - r * 0.92} ${cy - r * squash * 0.2} A ${r} ${
                    r * squash
                  } 0 0 1 ${cx + r * 0.2} ${cy - r * squash * 0.94}`}
                  fill="none"
                  stroke={`rgba(${SHADE}, 0.45)`}
                  strokeWidth={Math.max(0.8, r * 0.16)}
                  strokeLinecap="round"
                />
              </g>
            ))}

            {/* 자갈 하이라이트 점 */}
            <circle cx="36" cy="50" r="1" fill="#ffffff" opacity="0.25" />
            <circle cx="68" cy="64" r="0.9" fill="#ffffff" opacity="0.22" />
            <circle cx="56" cy="44" r="0.8" fill="#ffffff" opacity="0.2" />
          </>
        ) : null}

        {/* 고리 그림자 — 행성 표면에 떨어지는 어두운 띠 */}
        {variant === 'ring' ? (
          <g transform="translate(60 60) rotate(-18)" filter={`url(#${uid}-blur1)`}>
            <path
              d="M -50 -4 A 50 12 0 0 0 50 -4"
              fill="none"
              stroke={`rgba(${SHADE}, 0.34)`}
              strokeWidth="4.5"
              transform="translate(0 7)"
            />
          </g>
        ) : null}

        {/* 터미네이터 + 코어 섀도 + 스펙큘러 — 모든 variant 공통 */}
        <circle cx="60" cy="60" r="38" fill={`url(#${uid}-shade)`} />
        <circle cx="60" cy="60" r="38" fill={`url(#${uid}-core)`} />
        <ellipse
          cx="45"
          cy="35"
          rx="16"
          ry="10"
          fill={`url(#${uid}-spec)`}
          opacity="0.6"
          transform="rotate(-18 45 35)"
        />
      </g>

      {/* 림 라이트 — 밝은 쪽 가장자리 (블러로 부드럽게) */}
      <circle
        cx="60"
        cy="60"
        r="37.2"
        fill="none"
        stroke={mix(40, '#ffffff')}
        strokeWidth="1.6"
        opacity="0.5"
        pathLength={100}
        strokeDasharray="30 70"
        strokeDashoffset="-31"
        strokeLinecap="round"
        filter={`url(#${uid}-blur1)`}
      />
      {/* 대기 산란 — 림 라이트 바깥 글로우 아크 */}
      <circle
        cx="60"
        cy="60"
        r="40"
        fill="none"
        stroke={accent}
        strokeWidth="2.6"
        opacity="0.4"
        pathLength={100}
        strokeDasharray="34 66"
        strokeDashoffset="-29"
        strokeLinecap="round"
        filter={`url(#${uid}-blur2)`}
      />

      {/* 고리 앞면 — 채워진 annulus + 바깥 보조선 */}
      {variant === 'ring' ? (
        <g transform="translate(60 60) rotate(-18)">
          <path
            d="M -57 0 A 57 14.6 0 0 0 57 0 L 45 0 A 45 11 0 0 1 -45 0 Z"
            fill={`url(#${uid}-ringG)`}
          />
          <path
            d="M -61 0 A 61 16 0 0 0 61 0"
            fill="none"
            stroke={mix(45, '#ffffff')}
            strokeWidth="1"
            opacity="0.4"
          />
          {/* 고리 위 미세 입자 결 */}
          <path
            d="M -51 0 A 51 12.8 0 0 0 51 0"
            fill="none"
            stroke={`rgba(${SHADE}, 0.3)`}
            strokeWidth="0.8"
            opacity="0.7"
          />
        </g>
      ) : null}

      {/* 위성 — terra 전용, 궤도 회전 */}
      {variant === 'terra' ? (
        <g className="qd-planet-orb__orbit">
          <circle cx="60" cy="13.5" r="4.6" fill={`url(#${uid}-moon)`} />
          <circle cx="61.4" cy="14.6" r="1.4" fill={`rgba(${SHADE}, 0.3)`} />
          <circle cx="58.5" cy="12" r="1.2" fill="#ffffff" opacity="0.6" />
        </g>
      ) : null}
    </svg>
  );
}

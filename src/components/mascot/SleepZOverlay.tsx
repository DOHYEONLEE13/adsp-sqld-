/**
 * SleepZOverlay — sleep 포즈 위에 얹는 "Z z z" 3중 파티클.
 * 원본 이미지에 Z 글자가 없어서 CSS 애니메이션으로 떠오르는 효과를 덧붙인다.
 */

interface Props {
  /** 부모 Ques 크기(px) — 글자 크기 스케일링용. */
  size: number;
}

export default function SleepZOverlay({ size }: Props) {
  const fontBase = Math.max(14, size * 0.14);
  // 3개의 Z — 크기·지연·시작 위치를 살짝씩 비틀어 자연스럽게.
  const zs = [
    { delay: 0,    scale: 1.0, left: 0.62 },
    { delay: 0.9,  scale: 0.78, left: 0.68 },
    { delay: 1.8,  scale: 0.9, left: 0.58 },
  ];
  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden
    >
      {zs.map((z, i) => (
        <span
          key={i}
          className="sleep-z absolute kr-heading"
          style={{
            left: `${z.left * 100}%`,
            top: `${0.22 * 100}%`,
            fontSize: fontBase * z.scale,
            color: '#9ec5ff',
            textShadow: '0 0 10px rgba(158,197,255,0.6)',
            animationDelay: `${z.delay}s`,
            fontWeight: 800,
          }}
        >
          z
        </span>
      ))}
    </div>
  );
}

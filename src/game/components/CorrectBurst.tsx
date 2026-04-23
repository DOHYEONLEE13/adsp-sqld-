/**
 * CorrectBurst — 정답 시 방사형으로 퍼지는 작은 파티클 버스트.
 *
 * absolute 위치 전제. 부모가 relative 컨테이너여야 합니다.
 * React key 가 갱신되면 새 burst 가 발사됩니다.
 */

interface Props {
  /** 파티클 수. 기본 12. */
  count?: number;
  /** 색상 팔레트. 랜덤 순환. */
  colors?: string[];
}

const DEFAULT_COLORS = ['#6FFF00', '#67e8f9', '#c084fc', '#fbbf24'];

export default function CorrectBurst({
  count = 12,
  colors = DEFAULT_COLORS,
}: Props) {
  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (i * 360) / count + (Math.random() * 20 - 10);
    const color = colors[i % colors.length]!;
    const size = 4 + Math.round(Math.random() * 4);
    const delay = Math.round(Math.random() * 90);
    return { angle, color, size, delay, i };
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-0 w-0 h-0"
    >
      {particles.map((p) => (
        <span
          key={p.i}
          className="burst-particle"
          style={
            {
              ['--angle' as string]: `${p.angle}deg`,
              background: p.color,
              width: `${p.size}px`,
              height: `${p.size}px`,
              boxShadow: `0 0 10px ${p.color}`,
              animationDelay: `${p.delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/**
 * Starfield — 수천 개의 별을 Points 로 렌더.
 *
 * 구체 셸 안에 랜덤 배치 후 천천히 회전. 프레임마다 y축 0.00015 rad.
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  count?: number;
  radius?: number;
}

export default function Starfield({ count = 2400, radius = 90 }: Props) {
  const ref = useRef<THREE.Points>(null);

  // positions / colors / sizes 는 메모 — 마운트 시 한 번만 계산.
  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    // 약간 따뜻한 / 차가운 / 네온 계열 팔레트.
    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#cfe6ff'),
      new THREE.Color('#ffdfa8'),
      new THREE.Color('#c084fc'),
      new THREE.Color('#6FFF00'),
    ];

    for (let i = 0; i < count; i += 1) {
      // 구면 셸 위 균일 분포 → 얇은 두께로 약간 변주.
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const r = radius * (0.75 + Math.random() * 0.35);
      pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // 80% 는 흰/푸른 별, 20% 는 팔레트 기타.
      const color =
        Math.random() < 0.8
          ? palette[Math.random() < 0.5 ? 0 : 1]!
          : palette[2 + Math.floor(Math.random() * 3)]!;
      col[i * 3 + 0] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;

      // 대부분 작음, 일부 큰 별.
      siz[i] = Math.random() < 0.92 ? 0.4 + Math.random() * 0.5 : 1.2 + Math.random() * 1.2;
    }
    return { positions: pos, colors: col, sizes: siz };
  }, [count, radius]);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.00015;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={colors.length / 3}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
          count={sizes.length}
        />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.6}
        sizeAttenuation
        transparent
        depthWrite={false}
        opacity={0.95}
      />
    </points>
  );
}

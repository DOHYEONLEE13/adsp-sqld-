/**
 * Planet — Sketchfab GLB 를 로드해서 회전 · 호버 발광 효과.
 *
 * Credits:
 *   ADSP  — "Stylized Planet" by cmzw  (CC BY 4.0)
 *   SQLD  — "Purple Planet"   by Yo.Ri (CC BY 4.0)
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  url: string;
  position: [number, number, number];
  /** 반경 기준 크기 (scale). */
  size?: number;
  /** 축 회전 속도 (rad/frame). */
  spin?: number;
  /** 떠다니는 oscillation amplitude. */
  bob?: number;
  hovered?: boolean;
  onHover?: (hovered: boolean) => void;
  onClick?: () => void;
  /** 하단에 겹쳐 그릴 라벨 텍스트 (HTML 오버레이). */
  label?: string;
  subLabel?: string;
}

export default function Planet({
  url,
  position,
  size = 1,
  spin = 0.003,
  bob = 0.12,
  hovered = false,
  onHover,
  onClick,
  label,
  subLabel,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);

  // 호버 시 살짝 커지고 스핀이 빨라짐 — lerp 로 부드럽게.
  const targetScale = useRef(size);
  targetScale.current = hovered ? size * 1.08 : size;

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y += hovered ? spin * 2 : spin;
    const t = clock.elapsedTime;
    // 떠 있는 느낌 (sin bob).
    group.current.position.y = position[1] + Math.sin(t + position[0]) * bob;

    // scale 보간.
    const s = group.current.scale.x;
    const next = s + (targetScale.current - s) * 0.12;
    group.current.scale.setScalar(next);
  });

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover?.(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* 호버 시 은은하게 퍼지는 발광 구. */}
      <mesh scale={hovered ? 1.45 : 1.25}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={hovered ? '#c084fc' : '#67e8f9'}
          transparent
          opacity={hovered ? 0.18 : 0.08}
          depthWrite={false}
        />
      </mesh>
      <primitive object={scene} />
      {label ? (
        <Html
          position={[0, -1.25, 0]}
          center
          distanceFactor={8}
          style={{ pointerEvents: 'none' }}
        >
          <div className="text-center select-none">
            <div
              className="cursive text-neon leading-none"
              style={{
                fontSize: '28px',
                textShadow: '0 0 18px rgba(111,255,0,0.55)',
              }}
            >
              {label}
            </div>
            {subLabel ? (
              <div className="kr-heading text-[11px] uppercase tracking-widest text-cream/80 mt-1">
                {subLabel}
              </div>
            ) : null}
          </div>
        </Html>
      ) : null}
    </group>
  );
}

// Sketchfab 에셋 프리로드 — GalaxyScreen 진입 시 즉시 보이도록.
useGLTF.preload('/models/adsp-planet.glb');
useGLTF.preload('/models/sqld-planet.glb');

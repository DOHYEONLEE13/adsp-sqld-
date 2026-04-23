/**
 * PlanetScene — Planet 화면용 3D 씬.
 *
 *   ┌─────────────────────────┐
 *   │   ·    ★     ·   ★      │   ← Starfield 배경 (은은)
 *   │                          │
 *   │         ███              │
 *   │       ███████            │   ← 선택된 과목의 행성 하나, 자전
 *   │         ███              │
 *   │                          │
 *   └─────────────────────────┘
 *
 * 행성 클릭 이벤트 없음 (display only).
 * GLB 는 GalaxyScreen 에서 이미 preload 되어 있어 인스턴트.
 */

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import type { Subject } from '@/types/question';
import Starfield from './Starfield';
import Planet from './Planet';

const PLANET_URL: Record<Subject, string> = {
  adsp: '/models/adsp-planet.glb',
  sqld: '/models/sqld-planet.glb',
};

interface Props {
  subject: Subject;
}

export default function PlanetScene({ subject }: Props) {
  return (
    <Canvas
      // 카메라를 뒤로 빼서 행성 주변 "우주 여백"을 확보.
      // 이전 z=4 는 행성이 캔버스 경계까지 꽉 차서 비디오 프레임처럼 보였음.
      camera={{ position: [0, 0.2, 7.5], fov: 42, near: 0.1, far: 400 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 4, 6]} intensity={1.2} color="#fff6e0" />
      <directionalLight
        position={[-6, -3, -5]}
        intensity={0.35}
        color="#b9a6ff"
      />

      <Suspense fallback={null}>
        <Starfield count={2200} radius={110} />
        <Planet
          url={PLANET_URL[subject]}
          position={[0, 0, 0]}
          size={1.9}
          spin={subject === 'sqld' ? -0.0018 : 0.002}
          bob={0.08}
        />
      </Suspense>
    </Canvas>
  );
}

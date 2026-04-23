/**
 * GalaxyScene — Galaxy 화면용 3D 씬.
 *
 *   ┌───────────────────────────────────────┐
 *   │  ★ · · ★  ·   ·   ·   ·   ★   ·  ★  │  ← Starfield
 *   │                                       │
 *   │     🪐 (ADSP)          🌍 (SQLD)      │  ← GLB 행성 두 개
 *   │                                       │
 *   │   Enter Galaxy ↓  라벨 오버레이       │
 *   └───────────────────────────────────────┘
 *
 * 행성 클릭 → onSelect(subject) 콜백. 카메라가 그 행성으로 줌인.
 * 카메라 전환 완료는 상위 Galaxy 스크린에서 setTimeout 으로 트리거.
 */

import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import type { Subject } from '@/types/question';
import Starfield from './Starfield';
import Planet from './Planet';
import CameraRig from './CameraRig';

interface Props {
  /** 클릭으로 현재 "줌인 중" 인 행성. null 이면 전체 뷰. */
  zoomTarget: Subject | null;
  disabled?: { adsp?: boolean; sqld?: boolean };
  onSelect: (subject: Subject) => void;
}

// 행성 고정 위치 — 살짝 엇갈려서 깊이감.
const ADSP_POS: [number, number, number] = [-3.2, 0.2, 0];
const SQLD_POS: [number, number, number] = [3.0, -0.3, -0.8];

// 카메라 기본 뷰 vs 행성별 줌인 포지션 (lookAt 은 행성 중심).
const CAM_DEFAULT: [number, number, number] = [0, 0.8, 9];
const CAM_ADSP: [number, number, number] = [
  ADSP_POS[0] * 0.4,
  ADSP_POS[1] + 0.2,
  ADSP_POS[2] + 2.4,
];
const CAM_SQLD: [number, number, number] = [
  SQLD_POS[0] * 0.4,
  SQLD_POS[1] + 0.2,
  SQLD_POS[2] + 2.4,
];

export default function GalaxyScene({ zoomTarget, disabled, onSelect }: Props) {
  const [hovered, setHovered] = useState<Subject | null>(null);

  // 카메라 상태 — zoomTarget 에 따라.
  let camPos: [number, number, number] = CAM_DEFAULT;
  let camLook: [number, number, number] = [0, 0, 0];
  let lerpSpeed = 0.05;
  if (zoomTarget === 'adsp') {
    camPos = CAM_ADSP;
    camLook = ADSP_POS;
    lerpSpeed = 0.08;
  } else if (zoomTarget === 'sqld') {
    camPos = CAM_SQLD;
    camLook = SQLD_POS;
    lerpSpeed = 0.08;
  }

  return (
    <Canvas
      camera={{ position: CAM_DEFAULT, fov: 50, near: 0.1, far: 400 }}
      dpr={[1, 2]}
      // alpha 로 페이지 배경이 비치게.
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* 은은한 전역 조명. 행성 텍스처가 완전히 까맣게 되지 않도록. */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 4, 6]} intensity={1.2} color="#fff6e0" />
      <directionalLight
        position={[-6, -3, -5]}
        intensity={0.35}
        color="#b9a6ff"
      />

      <Suspense fallback={null}>
        <Starfield count={2400} radius={90} />

        <Planet
          url="/models/adsp-planet.glb"
          position={ADSP_POS}
          size={1.05}
          hovered={hovered === 'adsp'}
          onHover={(h) => setHovered(h ? 'adsp' : null)}
          onClick={() => !disabled?.adsp && onSelect('adsp')}
          label="adsp"
          subLabel="데이터분석 준전문가"
        />

        <Planet
          url="/models/sqld-planet.glb"
          position={SQLD_POS}
          size={1.1}
          spin={-0.0025}
          hovered={hovered === 'sqld'}
          onHover={(h) => setHovered(h ? 'sqld' : null)}
          onClick={() => !disabled?.sqld && onSelect('sqld')}
          label="sqld"
          subLabel="SQL 개발자"
        />
      </Suspense>

      <CameraRig
        targetPos={camPos}
        targetLookAt={camLook}
        lerp={lerpSpeed}
      />
    </Canvas>
  );
}

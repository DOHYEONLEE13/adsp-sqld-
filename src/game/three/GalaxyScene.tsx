/**
 * GalaxyScene — Galaxy 화면용 3D 씬.
 *
 *   ┌───────────────────────────────────────┐
 *   │  ★ · · ★  ·   ·   ·   ·   ★   ·  ★  │  ← Starfield
 *   │                                       │
 *   │     🪐 (ADSP)          🌍 (SQLD)      │  ← 데스크탑: 좌우 배치
 *   │                                       │
 *   │   Enter Galaxy ↓  라벨 오버레이       │
 *   └───────────────────────────────────────┘
 *
 * 모바일(세로)에서는 aspect 가 좁아서 좌우 배치가 둘 다 화면 밖으로 나감.
 * 그래서 viewport aspect 를 감지해 상하 대각선 배치 + 카메라 당김 로직을 씁니다.
 *
 * 행성 클릭 → onSelect(subject) 콜백. 카메라가 그 행성으로 줌인.
 */

import { Suspense, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
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

/** 초기 카메라 포지션 — 세로 모바일이면 약간 당겨서, 첫 프레임부터 양쪽 행성이 보이도록. */
function initialCamera(): [number, number, number] {
  if (typeof window === 'undefined') return [0, 0.8, 9];
  return window.innerWidth < 768 ? [0, 0, 7] : [0, 0.8, 9];
}

export default function GalaxyScene({ zoomTarget, disabled, onSelect }: Props) {
  const [hovered, setHovered] = useState<Subject | null>(null);

  return (
    <Canvas
      camera={{ position: initialCamera(), fov: 50, near: 0.1, far: 400 }}
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
        <Starfield count={2400} radius={90} />
        <ResponsivePlanets
          zoomTarget={zoomTarget}
          disabled={disabled}
          onSelect={onSelect}
          hovered={hovered}
          setHovered={setHovered}
        />
      </Suspense>
    </Canvas>
  );
}

// ----------------------------------------------------------------
// 뷰포트 aspect 에 따라 행성 배치 · 카메라 변경
// ----------------------------------------------------------------

interface InnerProps extends Props {
  hovered: Subject | null;
  setHovered: (s: Subject | null) => void;
}

function ResponsivePlanets({
  zoomTarget,
  disabled,
  onSelect,
  hovered,
  setHovered,
}: InnerProps) {
  // `useThree(s => s.size)` 는 canvas resize 시 반응형으로 업데이트됨.
  const size = useThree((s) => s.size);
  const isMobile = size.width < 768;

  // 배치 — 모바일은 세로 대각선, 데스크탑은 수평.
  // 모바일 y=±1.0 은 헤더(상단 ~290px) / 데일리 미션(하단 ~124px) 오버레이 사이
  // "중간 자유 영역" 에 planet 중심이 정확히 들어가도록 계산된 값.
  const ADSP_POS: [number, number, number] = isMobile
    ? [-0.5, 1.0, 0]
    : [-3.2, 0.2, 0];
  const SQLD_POS: [number, number, number] = isMobile
    ? [0.5, -1.0, -0.3]
    : [3.0, -0.3, -0.8];

  // 모바일은 행성이 가까이 배치되므로 행성 자체도 살짝 작게 (화면 오버레이와 겹침 방지).
  const planetSize = isMobile ? 0.85 : 1.05;
  const sqldSize = isMobile ? 0.9 : 1.1;

  // 카메라 기본 뷰 · 줌인 뷰.
  const CAM_DEFAULT: [number, number, number] = isMobile
    ? [0, 0, 7]
    : [0, 0.8, 9];
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
    <>
      {/* 행성 선택 상태에서는 라벨을 숨긴다.
          - SubjectInfoPanel 이 이미 과목명을 크게 보여주므로 중복 제거
          - 모바일에서 bob 진동 + 카메라 줌인으로 라벨이 "플레이하기" 버튼과 겹치는 문제 해결 */}
      <Planet
        url="/models/adsp-planet.glb"
        position={ADSP_POS}
        size={planetSize}
        hovered={hovered === 'adsp'}
        onHover={(h) => setHovered(h ? 'adsp' : null)}
        onClick={() => !disabled?.adsp && onSelect('adsp')}
        label={zoomTarget ? undefined : 'adsp'}
        subLabel={zoomTarget ? undefined : '데이터분석 준전문가'}
      />

      <Planet
        url="/models/sqld-planet.glb"
        position={SQLD_POS}
        size={sqldSize}
        spin={-0.0025}
        hovered={hovered === 'sqld'}
        onHover={(h) => setHovered(h ? 'sqld' : null)}
        onClick={() => !disabled?.sqld && onSelect('sqld')}
        label={zoomTarget ? undefined : 'sqld'}
        subLabel={zoomTarget ? undefined : 'SQL 개발자'}
      />

      <CameraRig targetPos={camPos} targetLookAt={camLook} lerp={lerpSpeed} />
    </>
  );
}

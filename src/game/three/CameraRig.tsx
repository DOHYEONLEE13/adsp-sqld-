/**
 * CameraRig — 카메라 위치/타겟을 매 프레임 보간해서 부드럽게 움직입니다.
 *
 * 상위가 targetPos / targetLookAt 을 바꾸면 자동으로 lerp.
 * zoomIn 모드에서는 `target` 이 행성 쪽으로 돌진하는 애니메이션.
 */

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  targetPos: [number, number, number];
  targetLookAt: [number, number, number];
  /** 1.0 = 기본 보간 속도. zoomIn 시 더 크게 주면 빠름. */
  lerp?: number;
}

export default function CameraRig({
  targetPos,
  targetLookAt,
  lerp = 0.06,
}: Props) {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(...targetLookAt));
  const posTarget = useRef(new THREE.Vector3(...targetPos));

  // targetLookAt / targetPos prop 이 바뀌면 target 벡터를 갱신.
  useEffect(() => {
    posTarget.current.set(...targetPos);
  }, [targetPos]);
  useEffect(() => {
    lookTarget.current.set(...targetLookAt);
  }, [targetLookAt]);

  useFrame(() => {
    camera.position.lerp(posTarget.current, lerp);
    // lookAt 목표도 lerp — 급작스런 카메라 스냅 방지.
    const curr = new THREE.Vector3();
    camera.getWorldDirection(curr);
    const desired = new THREE.Vector3()
      .subVectors(lookTarget.current, camera.position)
      .normalize();
    const next = curr.clone().lerp(desired, lerp).normalize();
    camera.lookAt(
      camera.position.clone().add(next.multiplyScalar(10)),
    );
  });

  return null;
}

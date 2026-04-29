/**
 * PageAmbientBg — 페이지가 ambient 배경을 원한다고 컨트롤러에 알리는 마커.
 *
 * 실제 비디오 element 는 `GlobalAmbientBg` (App 루트에 단 1개) 에서 렌더하고,
 * 여기는 `pushAmbient`/`popAmbient` 만 호출해 활성 상태와 blur 선호도를 갱신.
 * 그래서 페이지 전환 시 비디오가 unmount → remount 되지 않아 영상이 끊김 없이
 * 이어진다.
 *
 * `blur` prop: 영상에 blur filter — 문제 풀 때 시선이 본문으로 가게.
 *
 * 사용처는 그대로 — 각 페이지 JSX 에 `<PageAmbientBg />` (또는 `<PageAmbientBg blur />`)
 * 를 한 번 넣으면 됨. 렌더 결과는 `null`.
 */

import { useEffect } from 'react';
import { popAmbient, pushAmbient } from './ambientBg';

interface Props {
  /** 영상에 가벼운 blur 적용 (문제·읽기 화면용). 기본 false. */
  blur?: boolean;
}

export default function PageAmbientBg({ blur = false }: Props) {
  useEffect(() => {
    pushAmbient(blur);
    return () => popAmbient();
  }, [blur]);
  return null;
}

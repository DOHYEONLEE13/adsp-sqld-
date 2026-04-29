/**
 * GlobalAmbientBg — App 루트에 단 한 번만 마운트되는 ambient 배경 비디오.
 *
 * 페이지 (PlanetScreen / ZoneScreen / LessonScreen / QuestScreen / Quests /
 * Friends / Stats …) 전환 시에도 video element 가 unmount 되지 않아 영상이
 * 끊기지 않고 부드럽게 이어진다.
 *
 * 표시 / blur 여부는 `ambientBg.ts` 컨트롤러를 구독해 결정.
 *  - ambient 가 필요 없는 페이지 (Galaxy chooser / Landing) 에선 페이드아웃.
 *  - 문제 풀이·읽기 화면 (Lesson · Quest) 에선 blur 강하게.
 *
 * 페이드는 opacity transition — DOM/video 는 유지되므로 다시 active 가 돼도
 * 처음부터 재생되지 않는다.
 */

import { useEffect, useState } from 'react';
import VideoBg from '@/components/ui/VideoBg';
import { VIDEO_URLS, VIDEO_POSTERS } from '@/data/site';
import {
  subscribeAmbientBg,
  type AmbientBgState,
  getAmbientBg,
} from './ambientBg';

export default function GlobalAmbientBg() {
  const [state, setState] = useState<AmbientBgState>(() => getAmbientBg());

  useEffect(() => subscribeAmbientBg(setState), []);

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      style={{
        opacity: state.active ? 1 : 0,
        // ambient 가 켜질 때는 살짝 빠르게, 꺼질 때도 자연스럽게.
        transition: 'opacity 480ms ease',
      }}
    >
      <VideoBg
        src={VIDEO_URLS.pageAmbient}
        poster={VIDEO_POSTERS.pageAmbient}
        fit="cover"
        // Tailwind composition: blur + scale 와 brightness 를 함께 적용
        // (Tailwind 의 filter utility 는 CSS var 로 합성되므로 충돌 없음).
        // brightness-110 / saturate-110 = 영상 자체를 살짝 밝고 선명하게 —
        // 사용자 피드백 "칙칙함" 완화.  blur 토글 시 부드러운 transition.
        className={
          'transition-[filter,transform] duration-500 ease-out brightness-110 saturate-110' +
          (state.blur ? ' blur-md scale-110' : '')
        }
      />
      {/* 가독성 오버레이 — blur=true 일 땐 좀 더 진하게 (문제 풀이 시 시선 본문 집중).
          기본 (false) 은 배경이 잘 보이게 옅은 vignette 만. */}
      <div
        className="absolute inset-0"
        style={{
          background: state.blur
            ? 'linear-gradient(180deg, rgba(1,8,40,0.45) 0%, rgba(1,8,40,0.58) 50%, rgba(1,8,40,0.72) 100%)'
            : 'linear-gradient(180deg, rgba(1,8,40,0.28) 0%, rgba(1,8,40,0.38) 50%, rgba(1,8,40,0.50) 100%)',
          transition: 'background 360ms ease',
        }}
      />
    </div>
  );
}

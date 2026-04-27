/**
 * PageAmbientBg — Zone/Quests/Friends/Stats 공통 배경 비디오 + 가독성 오버레이.
 *
 * `position: fixed` 로 뷰포트 전체에 깔리므로 컨텐츠 z-index 가 자동으로 위.
 * 다른 페이지의 배경과 충돌 없이 단독 사용. `aria-hidden` 처리.
 *
 * `blur` prop: 영상에 직접 blur filter — 문제 풀 때 시선이 본문으로 가게.
 */

import VideoBg from '@/components/ui/VideoBg';
import { VIDEO_URLS, VIDEO_POSTERS } from '@/data/site';

interface Props {
  /** 영상에 가벼운 blur 적용 (문제·읽기 화면용). 기본 false. */
  blur?: boolean;
}

export default function PageAmbientBg({ blur = false }: Props) {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
    >
      <VideoBg
        src={VIDEO_URLS.pageAmbient}
        poster={VIDEO_POSTERS.pageAmbient}
        fit="cover"
        className={blur ? 'blur-md scale-110' : undefined}
      />
      {/* 가독성 오버레이 — 베이스 톤 vignette. 비디오가 살짝 비치게 톤다운 */}
      <div
        className="absolute inset-0"
        style={{
          background: blur
            ? 'linear-gradient(180deg, rgba(1,8,40,0.65) 0%, rgba(1,8,40,0.78) 50%, rgba(1,8,40,0.88) 100%)'
            : 'linear-gradient(180deg, rgba(1,8,40,0.55) 0%, rgba(1,8,40,0.65) 50%, rgba(1,8,40,0.78) 100%)',
        }}
      />
    </div>
  );
}

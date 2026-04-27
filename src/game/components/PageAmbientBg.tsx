/**
 * PageAmbientBg — Zone/Quests/Friends/Stats 공통 배경 비디오 + 가독성 오버레이.
 *
 * `position: fixed` 로 뷰포트 전체에 깔리므로 컨텐츠 z-index 가 자동으로 위.
 * 다른 페이지의 배경과 충돌 없이 단독 사용. `aria-hidden` 처리.
 */

import VideoBg from '@/components/ui/VideoBg';
import { VIDEO_URLS } from '@/data/site';

export default function PageAmbientBg() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
    >
      <VideoBg src={VIDEO_URLS.pageAmbient} fit="cover" />
      {/* 가독성 오버레이 — 베이스 톤 vignette. 비디오가 살짝 비치게 톤다운 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(1,8,40,0.55) 0%, rgba(1,8,40,0.65) 50%, rgba(1,8,40,0.78) 100%)',
        }}
      />
    </div>
  );
}

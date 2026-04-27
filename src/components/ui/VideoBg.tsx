import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { cx } from '@/lib/utils';

interface Props {
  src: string;
  className?: string;
  /** `cover` fills and crops, `native` keeps aspect ratio (no cropping). */
  fit?: 'cover' | 'native';
  /** 영상 로드 전 / 자동재생 차단 시 보여줄 정적 이미지. Mux 의 thumbnail URL 권장. */
  poster?: string;
}

/**
 * Reusable autoplay/loop/muted background video.
 *
 * `.m3u8` (HLS) 도 지원:
 *   - iOS Safari · macOS Safari → 네이티브 HLS (canPlayType 매칭)
 *   - 그 외 (Chrome · Firefox · Edge) → hls.js 로 MSE attach
 *   - HLS 미지원 환경 → 어두운 그라디언트 fallback (영상만 안 보임)
 *
 * autoplay 가 일부 환경 (iOS Low Power, 모바일 데이터 절약) 에서 동작하지 않는
 * 케이스를 대비해 manifest parsed / loadedmetadata 후 video.play() 를 명시 호출.
 * 호출이 reject 돼도 silent — 그라디언트 배경이 그대로 유지됨.
 */
export default function VideoBg({
  src,
  className,
  fit = 'cover',
  poster,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isHls = src.toLowerCase().includes('.m3u8');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    /** 명시적으로 play() — promise 무시 (자동재생 정책 위반 시 그라디언트로 fallback). */
    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          /* autoplay 차단 — 사용자 클릭 시점에 다시 시도해도 OK. silent. */
        });
      }
    };

    // ── mp4 등 — 브라우저 기본 재생 흐름. play() 명시만 추가.
    if (!isHls) {
      // metadata 가 로드되면 즉시 play 시도
      const onLoaded = () => tryPlay();
      video.addEventListener('loadedmetadata', onLoaded, { once: true });
      // 이미 metadata 가 있으면 (캐시) 곧장 시도
      if (video.readyState >= 1) tryPlay();
      return () => video.removeEventListener('loadedmetadata', onLoaded);
    }

    // ── HLS — Safari 네이티브 우선
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      const onLoaded = () => tryPlay();
      video.addEventListener('loadedmetadata', onLoaded, { once: true });
      return () => video.removeEventListener('loadedmetadata', onLoaded);
    }

    // ── HLS — hls.js (Chrome/FF/Edge)
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        // 네트워크 일시 오류 시 자동 복구
        fragLoadingMaxRetry: 6,
        manifestLoadingMaxRetry: 4,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // manifest 파싱 끝 → 이제 play 가능 상태
        tryPlay();
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          // fatal 에러 — 복구 시도. 실패해도 그라디언트 배경 fallback.
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        }
      });
      return () => {
        hls.destroy();
      };
    }

    // ── HLS 미지원 환경 (구형 브라우저) — 영상 없이 그라디언트만
  }, [src, isHls]);

  return (
    <video
      ref={videoRef}
      className={cx(
        fit === 'cover'
          ? 'absolute inset-0 w-full h-full object-cover'
          : 'block w-full h-auto',
        className,
      )}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      // crossOrigin 설정 — Mux 같은 외부 CDN 의 CORS 허용을 명시적으로
      crossOrigin="anonymous"
      poster={poster}
    >
      {!isHls ? <source src={src} type="video/mp4" /> : null}
    </video>
  );
}

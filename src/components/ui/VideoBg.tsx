import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { cx } from '@/lib/utils';

interface Props {
  src: string;
  className?: string;
  /** `cover` fills and crops, `native` keeps aspect ratio (no cropping). */
  fit?: 'cover' | 'native';
}

/**
 * Reusable autoplay/loop/muted background video.
 *
 * `.m3u8` (HLS) 도 지원 — Safari 는 네이티브 재생, 그 외 브라우저는 hls.js 로
 * 어태치. 그 외 (mp4 등) 는 그냥 `<source>` 로 처리.
 */
export default function VideoBg({ src, className, fit = 'cover' }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isHls = src.toLowerCase().includes('.m3u8');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isHls) return;

    // Safari 등 네이티브 HLS 가능: 그대로 src 세팅.
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    // 그 외: hls.js 로 어태치.
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => {
        hls.destroy();
      };
    }
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
    >
      {!isHls ? <source src={src} type="video/mp4" /> : null}
    </video>
  );
}

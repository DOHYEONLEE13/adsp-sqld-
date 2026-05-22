import { useEffect, useRef, useState } from 'react';
import { cx } from '@/lib/utils';

interface Props {
  src: string;
  className?: string;
  /** `cover` fills and crops, `native` keeps aspect ratio without cropping. */
  fit?: 'cover' | 'native';
  /** Static image shown before the video is requested or when autoplay is blocked. */
  poster?: string;
  /** `immediate` is for above-the-fold media; `visible` avoids loading offscreen media. */
  loading?: 'immediate' | 'visible';
  /** IntersectionObserver root margin for lazy video hydration. */
  rootMargin?: string;
  /** Native video preload hint after the source is attached. */
  preload?: 'none' | 'metadata' | 'auto';
  /** Pause background playback when it leaves the viewport. */
  pauseWhenHidden?: boolean;
}

type HlsInstance = {
  destroy: () => void;
  startLoad: () => void;
  recoverMediaError: () => void;
  loadSource: (src: string) => void;
  attachMedia: (media: HTMLMediaElement) => void;
  on: (event: string, callback: (event: string, data: { fatal?: boolean; type?: string }) => void) => void;
};

/**
 * Reusable autoplay/loop/muted background video.
 *
 * Offscreen videos do not receive a `src` until they approach the viewport.
 * HLS support is dynamically imported so landing pages do not pay for hls.js.
 */
export default function VideoBg({
  src,
  className,
  fit = 'cover',
  poster,
  loading = 'visible',
  rootMargin = '120px 0px',
  preload = 'metadata',
  pauseWhenHidden = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<HlsInstance | null>(null);
  const [shouldLoad, setShouldLoad] = useState(() => loading === 'immediate');
  const isHls = src.toLowerCase().includes('.m3u8');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || shouldLoad) return;

    if (loading === 'immediate' || !('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin, threshold: 0.18 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [loading, rootMargin, shouldLoad]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    let disposed = false;

    const tryPlay = () => {
      if (disposed) return;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Autoplay can be blocked by browser or data-saver settings. The poster stays visible.
        });
      }
    };

    const onLoaded = () => tryPlay();
    video.addEventListener('loadedmetadata', onLoaded, { once: true });

    if (!isHls) {
      video.load();
      if (video.readyState >= 1) tryPlay();
      return () => {
        disposed = true;
        video.removeEventListener('loadedmetadata', onLoaded);
      };
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.load();
      if (video.readyState >= 1) tryPlay();
      return () => {
        disposed = true;
        video.removeEventListener('loadedmetadata', onLoaded);
        video.removeAttribute('src');
        video.load();
      };
    }

    void import('hls.js').then(({ default: Hls }) => {
      if (disposed || !Hls.isSupported()) return;

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        fragLoadingMaxRetry: 4,
        manifestLoadingMaxRetry: 3,
      }) as HlsInstance;

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => tryPlay());
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    });

    return () => {
      disposed = true;
      video.removeEventListener('loadedmetadata', onLoaded);
      hlsRef.current?.destroy();
      hlsRef.current = null;
      video.removeAttribute('src');
      video.load();
    };
  }, [src, isHls, shouldLoad]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad || !pauseWhenHidden || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          const playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {});
          }
        } else {
          video.pause();
        }
      },
      { threshold: 0.08 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [pauseWhenHidden, shouldLoad]);

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
      preload={shouldLoad ? preload : 'none'}
      aria-hidden="true"
      crossOrigin={isHls && shouldLoad ? 'anonymous' : undefined}
      poster={poster}
      src={!isHls && shouldLoad ? src : undefined}
    />
  );
}

import { cx } from '@/lib/utils';

interface Props {
  src: string;
  className?: string;
  /** `cover` fills and crops, `native` keeps aspect ratio (no cropping). */
  fit?: 'cover' | 'native';
}

/** Reusable autoplay/loop/muted background video. */
export default function VideoBg({ src, className, fit = 'cover' }: Props) {
  return (
    <video
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
      <source src={src} type="video/mp4" />
    </video>
  );
}

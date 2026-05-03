/**
 * Ques — QuestDP 의 우주비행사 마스코트.
 *
 * props.pose 가 바뀌면 AnimatePresence 로 크로스페이드. 'idle' 포즈에선 CSS
 * 호흡 애니메이션이 자동으로 붙는다. 'sleep' 포즈는 위에 Z 파티클 오버레이.
 *
 * 이미지는 public/mascot/ques-<pose>.png 에 있으며 eager import 하지 않는다
 * (PNG 합계 약 4MB — 필요한 포즈만 브라우저가 요청).
 */

import { AnimatePresence, motion } from 'framer-motion';
import type { QuesPose } from './types';
import SleepZOverlay from './SleepZOverlay';

const POSE_SRC: Record<QuesPose, string> = {
  idle: '/mascot/ques-idle.png',
  happy: '/mascot/ques-happy.png',
  sad: '/mascot/ques-sad.png',
  celebrate: '/mascot/ques-celebrate.png',
  sleep: '/mascot/ques-sleep.png',
  wave: '/mascot/ques-wave.png',
  think: '/mascot/ques-think.png',
  lightbulb: '/mascot/ques-lightbulb.png',
};

interface Props {
  pose: QuesPose;
  /**
   * 한 변(px). 명시적 사이즈가 필요할 때만 전달.
   * 미지정 시 `className` 의 Tailwind w-* / h-* 가 외곽 크기 결정 — 데스크톱
   * 반응형 (lg:w-32 등) 사이즈에 적합.
   */
  size?: number;
  /** false 면 호흡/크로스페이드 등 모든 애니메이션 비활성. 접근성 · 배포 성능용. */
  animated?: boolean;
  className?: string;
}

export default function Ques({
  pose,
  size,
  animated = true,
  className,
}: Props) {
  const src = POSE_SRC[pose];

  return (
    <div
      className={['relative inline-block select-none', className]
        .filter(Boolean)
        .join(' ')}
      style={size !== undefined ? { width: size, height: size } : undefined}
      aria-label={`Ques - ${pose}`}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={pose}
          className="absolute inset-0"
          initial={animated ? { opacity: 0, scale: 0.94 } : false}
          animate={{ opacity: 1, scale: 1 }}
          exit={animated ? { opacity: 0, scale: 0.94 } : undefined}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.35))' }}
        >
          <img
            src={src}
            alt=""
            {...(size !== undefined ? { width: size, height: size } : {})}
            draggable={false}
            className={[
              'w-full h-full object-contain',
              animated && pose === 'idle' ? 'ques-breathe' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        </motion.div>
      </AnimatePresence>

      {pose === 'sleep' && animated && size !== undefined ? (
        <SleepZOverlay size={size} />
      ) : null}
    </div>
  );
}

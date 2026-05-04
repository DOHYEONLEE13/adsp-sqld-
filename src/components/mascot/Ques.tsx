/**
 * Ques — QuestDP 마스코트 컴포넌트.
 *
 * 캐릭터:
 *   - `tori` (기본, ADSP): public/mascot/ques-<pose>.png
 *   - `selli` (SQLD): public/mascot/selli-<pose>.png
 *
 * props.pose 가 바뀌면 AnimatePresence 로 크로스페이드. 'idle' 포즈에선 CSS
 * 호흡 애니메이션이 자동으로 붙는다. 'sleep' 포즈는 위에 Z 파티클 오버레이.
 *
 * 이미지는 eager import 하지 않음 (PNG 합계 약 8MB — 필요한 포즈만 요청).
 */

import { AnimatePresence, motion } from 'framer-motion';
import type { MascotCharacter, QuesPose } from './types';
import { DEFAULT_CHARACTER } from './types';
import SleepZOverlay from './SleepZOverlay';

/** 캐릭터별 파일 prefix. `<prefix>-<pose>.png` 로 결합. */
const PREFIX_BY_CHARACTER: Record<MascotCharacter, string> = {
  tori: 'ques',
  selli: 'selli',
};

function poseSrc(character: MascotCharacter, pose: QuesPose): string {
  return `/mascot/${PREFIX_BY_CHARACTER[character]}-${pose}.png`;
}

interface Props {
  pose: QuesPose;
  /**
   * 캐릭터 종류. 기본 `tori` (ADSP). SQLD subject 컨텍스트는 `selli`.
   */
  character?: MascotCharacter;
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
  character = DEFAULT_CHARACTER,
  size,
  animated = true,
  className,
}: Props) {
  const src = poseSrc(character, pose);

  return (
    <div
      className={['relative inline-block select-none', className]
        .filter(Boolean)
        .join(' ')}
      style={size !== undefined ? { width: size, height: size } : undefined}
      aria-label={`${character} - ${pose}`}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={`${character}-${pose}`}
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

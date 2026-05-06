/**
 * GlobalAmbientBg — App 루트 단일 마운트 ambient 배경.
 *
 * 사용자 선택 테마 (themes.ts / themeStorage.ts) 에 따라 분기 렌더:
 *   - 'video' → <VideoBg> (기존 Mux HLS, movement)
 *   - 'image' → <img> (정적 jpg/png/webp, 가벼움)
 *   - 'css'   → inline style.background (네트워크 0)
 *
 * 페이지 (PlanetScreen / ZoneScreen / Lesson / Quest …) 전환과 무관하게 항상
 * 마운트 — 영상 끊김 없이 부드러운 전환 + 테마 즉시 반영.
 *
 * ambientBg.ts 의 active/blur 도 그대로 구독:
 *   - active=false → 페이드아웃 (Galaxy chooser 등 ambient 원치 않는 페이지)
 *   - blur=true   → blur-md scale-110 + 진한 가독성 오버레이
 *
 * 사용자 검토 단계 (2026-05-07) — opacity 항상 1 로 풀어둠 → 추후 페이지별
 * 테마 차등화 정책 정해지면 active 분기 복원.
 */

import { useEffect, useState } from 'react';
import VideoBg from '@/components/ui/VideoBg';
import {
  subscribeAmbientBg,
  type AmbientBgState,
  getAmbientBg,
} from './ambientBg';
import { useTheme } from '../theme/useTheme';

export default function GlobalAmbientBg() {
  const [state, setState] = useState<AmbientBgState>(() => getAmbientBg());
  useEffect(() => subscribeAmbientBg(setState), []);
  const theme = useTheme();
  const blurClass = state.blur ? ' blur-md scale-110' : '';

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      style={{
        // 모든 페이지에 노출 — opacity 항상 1.
        opacity: 1,
        transition: 'opacity 480ms ease',
      }}
    >
      {theme.kind === 'video' ? (
        <VideoBg
          src={theme.src}
          poster={theme.poster}
          fit="cover"
          className={
            'transition-[filter,transform] duration-500 ease-out brightness-110 saturate-110' +
            blurClass
          }
        />
      ) : theme.kind === 'image' ? (
        <img
          src={theme.src}
          alt=""
          className={
            'absolute inset-0 w-full h-full object-cover transition-[filter,transform] duration-500 ease-out brightness-110 saturate-110' +
            blurClass
          }
        />
      ) : (
        <div
          className={'absolute inset-0 transition-[filter,transform] duration-500 ease-out' + blurClass}
          style={{
            backgroundColor: theme.backgroundColor,
            backgroundImage: theme.background,
            backgroundSize: theme.backgroundSize,
            backgroundRepeat: theme.backgroundRepeat,
            backgroundPosition: theme.backgroundPosition,
          }}
        />
      )}
      {/* 가독성 오버레이 — blur=true 일 땐 좀 더 진하게 */}
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

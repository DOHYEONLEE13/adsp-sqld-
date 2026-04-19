import type { GameMode } from '@/types/site';
import { VIDEO_URLS } from './site';

export const GAME_MODES: GameMode[] = [
  {
    id: 'monster-battle',
    title: '몬스터 배틀',
    description:
      '개념이 몬스터가 된다. 정답 하나에 HP 한 칸. MP를 모아 스킬을 해금하라.',
    videoUrl: VIDEO_URLS.mode1,
    funScore: 8.7,
  },
  {
    id: 'stair-mode',
    title: '계단 모드',
    description:
      '틀리면 즉시 게임오버. 빠르게 올라가며 실시간 상위 몇 %인지 확인하라.',
    videoUrl: VIDEO_URLS.mode2,
    funScore: 9.0,
  },
  {
    id: 'ai-boss',
    title: 'AI 보스 스테이지',
    description:
      'AI가 당신의 약점을 찾아낸다. 취약 개념만으로 구성된 맞춤형 보스가 등장.',
    videoUrl: VIDEO_URLS.mode3,
    funScore: 8.2,
  },
];

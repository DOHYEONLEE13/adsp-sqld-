import { isAppMode } from '@/lib/appMode';

const STORAGE_KEY = 'questdp.play-review-prompt.v1';
const MIN_TOTAL_ATTEMPTS = 30;
const MAX_PROMPT_COUNT = 2;
const PROMPT_COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000;

export const QUESTDP_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.questdp.app';

export interface PlayReviewPromptState {
  promptCount: number;
  lastPromptedAt?: number;
  reviewPageOpenedAt?: number;
}
function loadState(): PlayReviewPromptState {
  if (typeof window === 'undefined') return { promptCount: 0 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { promptCount: 0 };
    const parsed = JSON.parse(raw) as Partial<PlayReviewPromptState>;
    return {
      promptCount: Math.max(0, Math.floor(parsed.promptCount ?? 0)),
      lastPromptedAt:
        typeof parsed.lastPromptedAt === 'number' ? parsed.lastPromptedAt : undefined,
      reviewPageOpenedAt:
        typeof parsed.reviewPageOpenedAt === 'number'
          ? parsed.reviewPageOpenedAt
          : undefined,
    };
  } catch {
    return { promptCount: 0 };
  }
}

function saveState(state: PlayReviewPromptState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 저장이 막힌 환경에서는 다음 세션에 다시 판단합니다.
  }
}

export function isPlayReviewPromptEligible(
  totalAttempts: number,
  state: PlayReviewPromptState,
  now: number = Date.now(),
): boolean {
  if (totalAttempts < MIN_TOTAL_ATTEMPTS) return false;
  if (state.reviewPageOpenedAt) return false;
  if (state.promptCount >= MAX_PROMPT_COUNT) return false;
  if (
    state.lastPromptedAt &&
    now - state.lastPromptedAt < PROMPT_COOLDOWN_MS
  ) {
    return false;
  }
  return true;
}

/** 운영에서는 Android 앱에서만, 개발 중에는 웹에서도 화면을 확인할 수 있습니다. */
export function shouldShowPlayReviewPrompt(totalAttempts: number): boolean {
  if (!import.meta.env.DEV && !isAppMode()) return false;
  return isPlayReviewPromptEligible(totalAttempts, loadState());
}

export function markPlayReviewPromptShown(now: number = Date.now()): void {
  const current = loadState();
  saveState({
    ...current,
    promptCount: current.promptCount + 1,
    lastPromptedAt: now,
  });
}

export function markPlayReviewPageOpened(now: number = Date.now()): void {
  saveState({ ...loadState(), reviewPageOpenedAt: now });
}

export function openQuestDpPlayStore(): void {
  if (typeof window === 'undefined') return;
  window.open(QUESTDP_PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
}

/** 오늘의 퀘스트: 복습·풀이·정확도 세 가지 행동과 개별 XP 보상. */

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Clock3 } from 'lucide-react';
import ScreenShell from './components/ScreenShell';
import DailyQuestsCard from './components/DailyQuestsCard';
import { useProgress } from './useProgress';
import { completedCount, getTodayQuests, type DailyQuest } from './dailyQuests';
import { claimDailyQuestReward } from './storage';
import { MobileBottomNav, MobileTopBar } from './components/MobileGameNav';
import PageAmbientBg from './components/PageAmbientBg';
import {
  InactivityModal,
  generateDailyReviewQueue,
  getLastActive,
  getQuestionMetaMap,
  handleInactivity,
  loadActiveReviewItems,
  replaceAllReviewItems,
  resetQueue,
} from './forgettingCurve';
import { loadOnboardingResult } from './onboarding/onboardingStorage';
import OnboardingPromptBanner from './studyPlan/OnboardingPromptBanner';
import {
  DAILY_REVIEW_UPDATED_EVENT,
  syncDailyReviewQuest,
} from './dailyReviewQuest';
import { CORE_SUBJECT_ACCENT } from './learningContext';

interface Props {
  onExit: () => void;
}

export default function QuestsPage({ onExit }: Props) {
  const progress = useProgress();
  const questClock = useDailyQuestClock();
  const [reviewTick, setReviewTick] = useState(0);
  const [previewAccuracyClaimed, setPreviewAccuracyClaimed] = useState(false);
  const [rewardToast, setRewardToast] = useState<{
    amount: number;
    token: number;
  } | null>(null);
  const reduceMotion = useReducedMotion();
  const completedPreview =
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get('quest-preview') ===
      'complete';

  useEffect(() => {
    const refresh = () => setReviewTick((tick) => tick + 1);
    const onStorage = (event: StorageEvent) => {
      if (
        event.key === 'questdp_review_items_v1' ||
        event.key === 'questdp.daily-review-quest.v1' ||
        event.key === null
      ) {
        refresh();
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(DAILY_REVIEW_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(DAILY_REVIEW_UPDATED_EVENT, refresh);
    };
  }, []);

  const onboarding = useMemo(() => loadOnboardingResult(), [reviewTick]);
  const reviewQueue = useMemo(() => {
    if (!onboarding) return [];
    return generateDailyReviewQueue({
      items: loadActiveReviewItems('guest'),
      persona:
        onboarding.persona === 'unknown' ? 'beginner' : onboarding.persona,
      weak_chapters: onboarding.weak_chapters,
      sessions: progress.sessions,
      questionMeta: getQuestionMetaMap(),
      today: new Date(),
    });
  }, [onboarding, progress.sessions, reviewTick]);
  const reviewProgress = useMemo(
    () =>
      syncDailyReviewQuest(
        reviewQueue.map((item) => item.question_id),
        new Date(),
      ),
    [questClock.day, reviewQueue],
  );
  const calculatedDailyQuests = useMemo(
    () => getTodayQuests(progress, Date.now(), reviewProgress),
    [progress, reviewProgress],
  );
  const dailyQuests = useMemo(() => {
    if (!completedPreview) return calculatedDailyQuests;

    return calculatedDailyQuests.map((quest) => ({
      ...quest,
      progress: quest.target,
      completed: true,
      rewardAvailable: true,
      claimed:
        quest.id === 'daily-accuracy' ? previewAccuracyClaimed : true,
    }));
  }, [calculatedDailyQuests, completedPreview, previewAccuracyClaimed]);
  const allDone = completedCount(dailyQuests) === dailyQuests.length;
  const allRewardsClaimed = dailyQuests.every((quest) => quest.claimed);

  const [inactivityModalShown, setInactivityModalShown] = useState(false);
  const inactivity = useMemo(() => {
    if (inactivityModalShown || !onboarding) return null;
    const lastActive = getLastActive();
    if (!lastActive) return null;
    const today = new Date();
    return handleInactivity(
      lastActive,
      today,
      reviewQueue.map((item) => ({
        user_id: item.user_id,
        question_id: item.question_id,
        current_interval: item.current_interval,
        ease_factor: 2.5,
        consecutive_correct: 0,
        consecutive_wrong: 0,
        due_date: item.due_date,
        last_attempted_at: today,
        status: 'active' as const,
      })),
    );
  }, [inactivityModalShown, onboarding, reviewQueue]);

  const handleInactivityReset = () => {
    const items = loadActiveReviewItems('guest');
    const reset = resetQueue(items, new Date());
    const allItems = items.filter((item) => item.status !== 'active');
    replaceAllReviewItems([...reset, ...allItems]);
  };

  const activeSubject = progress.activeSubject ?? 'adsp';
  const subjectAccent = CORE_SUBJECT_ACCENT[activeSubject];
  const openDailyReview = () => {
    try {
      window.sessionStorage.setItem('questdp.pendingReviewOpen', 'daily');
    } catch {
      // 일반 게임 진입으로 대체한다.
    }
    window.location.hash = `/game/${activeSubject}`;
  };

  const openVolumeQuest = () => {
    window.location.hash = `/game/${activeSubject}`;
  };

  const openAccuracyQuest = () => {
    try {
      window.sessionStorage.setItem(
        'questdp.pendingDailyQuestSession',
        JSON.stringify({ subject: activeSubject, quest: 'daily-accuracy' }),
      );
    } catch {
      // 일반 게임 진입으로 대체한다.
    }
    window.location.hash = `/game/${activeSubject}`;
  };

  const handleQuestAction = (quest: DailyQuest) => {
    if (completedPreview) {
      if (quest.id !== 'daily-accuracy' || previewAccuracyClaimed) return;
      setPreviewAccuracyClaimed(true);
      const token = Date.now();
      setRewardToast({ amount: quest.rewardXp, token });
      window.setTimeout(
        () =>
          setRewardToast((current) =>
            current?.token === token ? null : current,
          ),
        2200,
      );
      return;
    }

    if (quest.completed) {
      if (!quest.rewardAvailable || quest.claimed) return;
      const awarded = claimDailyQuestReward(quest.id, quest.rewardXp);
      if (awarded > 0) {
        const token = Date.now();
        setRewardToast({ amount: awarded, token });
        window.setTimeout(
          () =>
            setRewardToast((current) =>
              current?.token === token ? null : current,
            ),
          2200,
        );
      }
      return;
    }

    if (quest.id === 'daily-review') openDailyReview();
    if (quest.id === 'daily-volume') openVolumeQuest();
    if (quest.id === 'daily-accuracy') openAccuracyQuest();
  };

  return (
    <ScreenShell
      eyebrow="Daily Quests"
      title="퀘스트"
      subtitle={
        <span
          className="inline-flex min-h-9 items-center gap-2 rounded-full px-3.5 py-2"
          style={{
            background: 'rgba(8,19,56,0.52)',
            border: '1px solid rgba(239,244,255,0.11)',
            boxShadow:
              '0 8px 22px -18px rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.06)',
            backdropFilter: 'blur(14px) saturate(125%)',
          }}
        >
          <Clock3 size={14} strokeWidth={2.2} style={{ color: subjectAccent }} />
          <span className="kr-body text-[11px] text-cream/50">
            다음 퀘스트
          </span>
          <span className="kr-num text-[12px] font-bold tabular-nums text-cream/85">
            {questClock.countdown}
          </span>
        </span>
      }
      onExit={onExit}
      exitLabel="돌아가기"
      ambient={<PageAmbientBg />}
    >
      <MobileTopBar />

      {!onboarding ? (
        <div className="mb-5">
          <OnboardingPromptBanner />
        </div>
      ) : null}

      <DailyQuestsCard
        quests={dailyQuests}
        subject={activeSubject}
        onQuestAction={handleQuestAction}
      />

      {allDone ? (
        <div
          className="liquid-glass mt-4 flex items-center justify-between gap-3 rounded-[16px] px-4 py-3"
          style={{
            background: allRewardsClaimed
              ? `linear-gradient(135deg, color-mix(in srgb, ${subjectAccent} 12%, transparent), rgba(239,244,255,0.04))`
              : `linear-gradient(135deg, color-mix(in srgb, ${subjectAccent} 18%, transparent), rgba(239,244,255,0.05))`,
            border: `1px solid color-mix(in srgb, ${subjectAccent} 34%, transparent)`,
          }}
        >
          <span
            className="kr-heading text-[12px]"
            style={{ color: subjectAccent }}
          >
            {allRewardsClaimed
              ? '오늘의 퀘스트를 모두 마쳤어요'
              : '완료한 퀘스트의 XP를 받아가세요'}
          </span>
          <span className="kr-body shrink-0 text-[11px] text-cream/55">
            자정 갱신
          </span>
        </div>
      ) : null}

      <AnimatePresence>
        {rewardToast !== null ? (
          <motion.div
            key={rewardToast.token}
            role="status"
            aria-live="polite"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 20, scale: 0.82 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -26, scale: 0.94 }
            }
            transition={
              reduceMotion
                ? { duration: 0.18 }
                : { type: 'spring', stiffness: 360, damping: 22 }
            }
            className="pointer-events-none fixed left-1/2 top-[20%] z-50 -translate-x-1/2 rounded-full px-5 py-3 kr-heading text-[12px]"
            style={{
              background:
                'linear-gradient(135deg, var(--neon), rgba(103,232,249,0.96))',
              color: 'var(--base)',
              border: '1px solid rgba(255,255,255,0.45)',
              boxShadow:
                '0 16px 46px -14px var(--neon-60), inset 0 1px 0 rgba(255,255,255,0.58)',
            }}
          >
            보상 수령 +{rewardToast.amount} XP
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="md:hidden h-20" aria-hidden />
      <MobileBottomNav
        active="quests"
        questNotificationCount={dailyQuests.filter(
          (quest) =>
            quest.completed && quest.rewardAvailable && !quest.claimed,
        ).length}
      />

      {inactivity &&
      (inactivity.action === 'inform' ||
        inactivity.action === 'suggest_reset') ? (
        <InactivityModal
          action={inactivity}
          onReset={handleInactivityReset}
          onDismiss={() => setInactivityModalShown(true)}
        />
      ) : null}
    </ScreenShell>
  );
}

function useDailyQuestClock(): { countdown: string; day: string } {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const current = new Date(now);
  const day = [
    current.getFullYear(),
    String(current.getMonth() + 1).padStart(2, '0'),
    String(current.getDate()).padStart(2, '0'),
  ].join('-');
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  const remainingSeconds = Math.max(
    0,
    Math.floor((nextMidnight.getTime() - now) / 1000),
  );
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const countdown = [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');

  return { countdown, day };
}

/**
 * ReviewQuestCard — 퀘스트 탭의 "오늘의 복습" 카드.
 *
 * Phase 4 Step 4 — 망각 곡선 자동 큐 진입점.
 *
 * 표시:
 *   - 헤더 "오늘의 복습 (망각 곡선) [N개]"
 *   - 항목 미리보기 (top 3) — chapter / topic / priority 배지
 *   - 큐 폭발 경고 (overflow > 0)
 *   - [복습 시작하기 (N분 예상)] 버튼
 *
 * 데이터 소스:
 *   - loadActiveReviewItems(userId)
 *   - generateDailyReviewQueue (페르소나 + 약점 + sessions 입력)
 *   - getQuestionMetaMap (chapter / topic 매핑)
 *
 * 게스트 사용자 (onboarding 미완료) → null 반환. caller 가 OnboardingPromptBanner 표시.
 */

import { useEffect, useMemo, useState } from 'react';
import { Repeat, ChevronRight, AlertTriangle } from 'lucide-react';
import type { ReviewQueueItem } from '@/types/learning/reviewItem';
import { loadActiveReviewItems } from './reviewItemStorage';
import { generateDailyReviewQueue, detectQueueOverflow } from './reviewQueue';
import { getQuestionMetaMap } from './questionMetaCache';
import { loadOnboardingResult } from '@/game/onboarding/onboardingStorage';
import { useProgress } from '../useProgress';

interface Props {
  /** [복습 시작] 클릭 시 caller. queue 항목 전달 → ReviewSession 진입. */
  onStartReview: (queue: ReviewQueueItem[]) => void;
}

const SUBJECT_LABEL: Record<string, string> = {
  adsp: 'ADsP',
  sqld: 'SQLD',
};

export default function ReviewQuestCard({ onStartReview }: Props) {
  const progress = useProgress();
  // localStorage 변화 감지 — 다른 탭/세션 종료 후 갱신 시 즉시 반영
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'questdp_review_items_v1' || e.key === null) {
        setTick((t) => t + 1);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const onboarding = useMemo(() => loadOnboardingResult(), [tick]);
  const persona = onboarding?.persona ?? 'beginner';

  const queue = useMemo(() => {
    if (!onboarding) return [];
    const items = loadActiveReviewItems('guest');
    if (items.length === 0) return [];
    return generateDailyReviewQueue({
      items,
      persona: persona === 'unknown' ? 'beginner' : persona,
      weak_chapters: onboarding.weak_chapters,
      sessions: progress.sessions,
      questionMeta: getQuestionMetaMap(),
      today: new Date(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboarding, progress.sessions, tick, persona]);

  const overflow = useMemo(() => {
    if (!onboarding) return null;
    const items = loadActiveReviewItems('guest');
    return detectQueueOverflow(items, new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboarding, tick]);

  // onboarding 미완료 게스트 → null (caller 가 prompt banner 표시)
  if (!onboarding) return null;

  // 큐 비어있음 — "오늘 복습할 것 없어요" 표시
  if (queue.length === 0) {
    return (
      <div
        className="liquid-glass rounded-[20px] px-5 py-4 mb-5"
        style={{ border: '1px solid rgba(239,244,255,0.08)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Repeat
            size={16}
            strokeWidth={2.4}
            style={{ color: 'rgba(239,244,255,0.4)' }}
          />
          <span
            className="kr-num text-[10.5px] uppercase tracking-widest"
            style={{ color: 'rgba(239,244,255,0.5)' }}
          >
            오늘의 복습 · 망각 곡선
          </span>
        </div>
        <p className="kr-body text-[13px] text-cream/55 leading-[1.55]">
          오늘 복습할 항목이 없어요. 새 lesson 진행하면 망각 곡선 큐에 자동
          등록돼요.
        </p>
      </div>
    );
  }

  const previewItems = queue.slice(0, 3);
  const estMinutes = Math.max(1, Math.round(queue.length * 0.7)); // 문항당 ~40초 추정

  return (
    <div
      className="liquid-glass rounded-[20px] px-5 py-4 mb-5"
      style={{
        border: '1px solid color-mix(in srgb, var(--neon) 35%, transparent)',
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--neon) 6%, transparent), transparent)',
      }}
    >
      {/* 헤더 */}
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Repeat
            size={16}
            strokeWidth={2.4}
            style={{ color: 'var(--neon)' }}
          />
          <span
            className="kr-num text-[10.5px] uppercase tracking-widest"
            style={{ color: 'var(--neon)' }}
          >
            오늘의 복습 · 망각 곡선
          </span>
        </div>
        <span
          className="kr-num text-[11px] tabular-nums"
          style={{ color: 'rgba(239,244,255,0.7)' }}
        >
          {queue.length}개
        </span>
      </div>

      <p className="kr-body text-[13.5px] text-cream/85 leading-[1.55] mb-3">
        {queue.length}개 문항이 망각 시점에 도달했어요.
      </p>

      {/* 미리보기 */}
      <ul className="space-y-1.5 mb-4 list-none p-0 m-0">
        {previewItems.map((item) => (
          <PreviewRow key={item.question_id} item={item} />
        ))}
        {queue.length > previewItems.length && (
          <li
            className="kr-body text-[11.5px] text-cream/45 px-2"
            aria-label={`${queue.length - previewItems.length}개 더 있음`}
          >
            +{queue.length - previewItems.length}개 더…
          </li>
        )}
      </ul>

      {/* 큐 폭발 경고 */}
      {overflow && overflow.overflowCount > 0 && (
        <div
          className="flex items-start gap-2 px-3 py-2 mb-3 rounded-[10px]"
          style={{
            background: 'rgba(255,176,32,0.08)',
            border: '1px solid rgba(255,176,32,0.32)',
          }}
        >
          <AlertTriangle
            size={13}
            strokeWidth={2.4}
            style={{ color: '#FFB020', marginTop: 1, flexShrink: 0 }}
          />
          <span
            className="kr-body text-[11.5px] leading-[1.5]"
            style={{ color: '#FFCB6E' }}
          >
            7일 이상 미수행 항목 {overflow.overflowCount}개. 한 번에 다 풀면
            부담 — 매일 조금씩.
          </span>
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={() => onStartReview(queue)}
        className="w-full p-3 rounded-xl kr-heading uppercase tracking-widest text-[13px] transition active:scale-[0.98] inline-flex items-center justify-center gap-2"
        style={{
          background: 'var(--neon)',
          color: 'var(--base)',
          boxShadow:
            '0 6px 20px -8px color-mix(in srgb, var(--neon) 60%, transparent)',
        }}
      >
        복습 시작하기 · {estMinutes}분 예상
        <ChevronRight size={14} strokeWidth={2.6} />
      </button>
    </div>
  );
}

function PreviewRow({ item }: { item: ReviewQueueItem }) {
  const subjectLabel = '';
  const subject = item.question_id.split('-')[0]?.toLowerCase();
  const subjectShort = SUBJECT_LABEL[subject] ?? '';
  const reasonBadge = priorityReasonBadge(item.priority_reason);
  return (
    <li
      className="flex items-baseline gap-2 px-2 py-1.5 rounded-[8px]"
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      {reasonBadge && (
        <span
          className="kr-num text-[9.5px] uppercase tracking-widest shrink-0 px-1.5 py-0.5 rounded-full"
          style={{
            color: reasonBadge.color,
            border: `1px solid ${reasonBadge.color}55`,
          }}
        >
          {reasonBadge.label}
        </span>
      )}
      <span className="kr-body text-[12.5px] text-cream/90 flex-1 truncate">
        {subjectShort && <span className="text-cream/45 mr-1">{subjectShort}</span>}
        {item.question_topic ?? `Q-${item.question_id.slice(-4)}`}
      </span>
      {subjectLabel}
    </li>
  );
}

function priorityReasonBadge(
  reason: ReviewQueueItem['priority_reason'],
): { label: string; color: string } | null {
  switch (reason) {
    case 'overdue':
      return { label: '지연', color: '#FFB020' };
    case 'wrong_yesterday':
      return { label: '어제 오답', color: '#FF7B7B' };
    case 'weak_chapter':
      return { label: '약점', color: '#FFA500' };
    case 'normal':
      return null;
  }
}

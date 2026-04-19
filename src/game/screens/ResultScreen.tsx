/**
 * Result 화면 — 세션 완료 후 결과.
 * 정답률 / 소요 시간 / 문항별 정오표 + 리매치 or 다른 토픽 진입 액션.
 */

import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, RefreshCcw, Star, XCircle } from 'lucide-react';
import type { QuestSummary } from '../types';
import { formatDuration } from '../session';
import ScreenShell from '../components/ScreenShell';
import { cx } from '@/lib/utils';
import { bulkAdd, toggleBookmark } from '../bookmarks';
import { useBookmarks } from '../useBookmarks';

interface Props {
  summary: QuestSummary;
  onReplay: () => void;
  onPickAnotherZone: () => void;
  onBackToGalaxy: () => void;
}

export default function ResultScreen({
  summary,
  onReplay,
  onPickAnotherZone,
  onBackToGalaxy,
}: Props) {
  const accuracyPct = Math.round(summary.accuracy * 100);
  const verdict = verdictFor(summary.accuracy);

  const bookmarks = useBookmarks();
  const wrongIds = useMemo(
    () => summary.answers.filter((a) => !a.correct).map((a) => a.questionId),
    [summary.answers],
  );
  const allWrongAlreadyBookmarked =
    wrongIds.length > 0 && wrongIds.every((id) => bookmarks.ids.has(id));
  const [bulkFlash, setBulkFlash] = useState<string | null>(null);
  const handleBulkBookmarkWrong = () => {
    if (wrongIds.length === 0) return;
    const added = bulkAdd(wrongIds);
    setBulkFlash(
      added === 0
        ? '이미 모두 북마크 되어 있어요'
        : `오답 ${added}개를 북마크에 담았어요`,
    );
    window.setTimeout(() => setBulkFlash(null), 2400);
  };

  return (
    <ScreenShell
      eyebrow="Mission Report"
      title={verdict.title}
      subtitle={`${summary.chapterTitle}${summary.topic ? ' · ' + summary.topic : ' · 전체 믹스'}`}
      onExit={onBackToGalaxy}
      exitLabel="은하로"
    >
      {/* KPI 3종 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <KpiCard
          label="Accuracy"
          value={`${accuracyPct}%`}
          accent={verdict.accent}
        />
        <KpiCard
          label="Correct"
          value={`${summary.correctCount} / ${summary.total}`}
        />
        <KpiCard
          label="Duration"
          value={formatDuration(summary.totalTimeMs)}
          icon={<Clock size={16} />}
        />
      </div>

      {/* 문항별 정오표 */}
      <section className="mb-10">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="kr-heading text-[13px] uppercase tracking-widest text-cream/70">
            문항별 결과
          </h2>
          {wrongIds.length > 0 ? (
            <button
              type="button"
              onClick={handleBulkBookmarkWrong}
              disabled={allWrongAlreadyBookmarked}
              className={cx(
                'kr-heading inline-flex items-center gap-2 text-[11px] uppercase tracking-widest px-4 py-2.5 rounded-full transition',
                allWrongAlreadyBookmarked
                  ? 'liquid-glass text-cream/50 cursor-not-allowed'
                  : 'liquid-glass hover:bg-white/10 text-[#fbbf24]',
              )}
            >
              <Star
                size={14}
                strokeWidth={2.4}
                fill={allWrongAlreadyBookmarked ? 'currentColor' : 'none'}
              />
              {allWrongAlreadyBookmarked
                ? '오답 북마크 완료'
                : `오답 ${wrongIds.length}개 북마크`}
            </button>
          ) : null}
        </div>
        {bulkFlash ? (
          <div
            className="liquid-glass kr-body text-[12px] px-4 py-2.5 rounded-full mb-3 inline-flex items-center gap-2"
            style={{ color: '#fbbf24' }}
          >
            <Star size={12} fill="currentColor" />
            {bulkFlash}
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-3">
          {summary.answers.map((a, i) => {
            const starred = bookmarks.ids.has(a.questionId);
            return (
              <div
                key={a.questionId}
                className={cx(
                  'liquid-glass rounded-[18px] p-4 md:p-5 flex gap-4 items-start',
                  a.correct
                    ? 'ring-1 ring-[rgba(111,255,0,0.35)]'
                    : 'ring-1 ring-[rgba(248,113,113,0.35)]',
                )}
              >
                <span className="kr-heading text-[12px] uppercase tracking-widest text-cream/60 shrink-0 mt-0.5 min-w-[28px]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <p className="kr-body text-[13px] md:text-[14px] leading-[1.7]">
                    {a.question.question}
                  </p>
                  {!a.correct ? (
                    <p className="kr-body text-[12px] leading-[1.7] text-cream/70 mt-2">
                      <span className="text-red-400">내 답</span>:{' '}
                      {a.chosenIndex < 0
                        ? '시간 초과 (미응답)'
                        : a.question.choices[a.chosenIndex] ?? '—'}
                      <br />
                      <span className="text-neon">정답</span>:{' '}
                      {a.question.choices[a.question.answerIndex]}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleBookmark(a.questionId)}
                    aria-pressed={starred}
                    aria-label={starred ? '북마크 해제' : '북마크'}
                    className={cx(
                      'w-9 h-9 rounded-full inline-flex items-center justify-center transition',
                      starred
                        ? 'bg-[rgba(251,191,36,0.14)] text-[#fbbf24]'
                        : 'text-cream/50 hover:text-[#fbbf24] hover:bg-white/5',
                    )}
                  >
                    <Star
                      size={16}
                      strokeWidth={2.2}
                      fill={starred ? 'currentColor' : 'none'}
                    />
                  </button>
                  {a.correct ? (
                    <CheckCircle2
                      className="text-neon"
                      size={22}
                      strokeWidth={2.4}
                    />
                  ) : (
                    <XCircle
                      className="text-red-400"
                      size={22}
                      strokeWidth={2.4}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 액션 */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onReplay}
          className="kr-heading uppercase tracking-widest text-[12px] px-6 py-4 rounded-full inline-flex items-center gap-2 transition hover:scale-[1.02]"
          style={{
            background:
              'linear-gradient(135deg, var(--purple-1), var(--purple-2))',
            color: '#fff',
            boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.55)',
          }}
        >
          <RefreshCcw size={16} strokeWidth={2.4} />
          다시 풀기
        </button>
        <button
          type="button"
          onClick={onPickAnotherZone}
          className="liquid-glass kr-heading uppercase tracking-widest text-[12px] px-6 py-4 rounded-full transition hover:bg-white/10"
        >
          다른 존 선택
        </button>
        <button
          type="button"
          onClick={onBackToGalaxy}
          className="liquid-glass kr-heading uppercase tracking-widest text-[12px] px-6 py-4 rounded-full transition hover:bg-white/10"
        >
          은하로 돌아가기
        </button>
      </div>
    </ScreenShell>
  );
}

function KpiCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className="liquid-glass rounded-[20px] p-5"
      style={accent ? { boxShadow: `0 0 40px -12px ${accent}` } : undefined}
    >
      <span className="kr-heading text-[11px] uppercase tracking-widest text-cream/60 inline-flex items-center gap-2">
        {icon}
        {label}
      </span>
      <div
        className="kr-heading text-[32px] md:text-[40px] mt-2 leading-none"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
    </div>
  );
}

function verdictFor(acc: number): { title: string; accent: string } {
  if (acc >= 0.9)
    return { title: '완벽한 항해', accent: '#6FFF00' };
  if (acc >= 0.7)
    return { title: '안정적인 탐사', accent: '#6FFF00' };
  if (acc >= 0.5)
    return { title: '계속 전진', accent: '#a78bfa' };
  return { title: '재정비가 필요', accent: '#f87171' };
}

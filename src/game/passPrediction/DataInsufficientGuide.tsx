/**
 * DataInsufficientGuide — 신뢰도 'low' 사용자 안내 카드.
 *
 * Phase 4 Step 5:
 *   - PredictionScoreCard 대신 표시
 *   - "더 풀어보면 알려줄게!" 메시지
 *   - 응시 단원 수 / 필요 단원 수
 *   - 다음 단원 추천 CTA
 */

import { Compass, ChevronRight } from 'lucide-react';
import type { ChapterAccuracy } from './chapterWeights';
import { CHAPTER_NAMES, MIN_ATTEMPTS_PER_CHAPTER } from './chapterWeights';
import { generateInsufficientDataMessage } from './messageGenerator';
import { unattemptedChapters } from './weakChapterRanker';

interface Props {
  exam: 'adsp' | 'sqld';
  chapterAccuracies: readonly ChapterAccuracy[];
  /** 다음 단원 추천 클릭 시 — chapter_id 전달. */
  onSelectChapter?: (chapter_id: string) => void;
}

export default function DataInsufficientGuide({
  exam,
  chapterAccuracies,
  onSelectChapter,
}: Props) {
  const attemptedCount = chapterAccuracies.filter(
    (ca) => ca.accuracy !== null,
  ).length;
  const totalCount = chapterAccuracies.length;
  const subMsg = generateInsufficientDataMessage(attemptedCount, totalCount);

  // 다음 추천 단원 — 응시 안 한 단원 중 첫 3개 (가중치 큰 순)
  const candidates = unattemptedChapters(chapterAccuracies)
    .slice()
    .sort((a, b) => {
      // weight 큰 순 — 메인 영역 우선
      const wa =
        a.chapter_id.includes('-3-') ? 3 : a.chapter_id.includes('-2-') ? 2 : 1;
      const wb =
        b.chapter_id.includes('-3-') ? 3 : b.chapter_id.includes('-2-') ? 2 : 1;
      return wb - wa;
    })
    .slice(0, 3);

  return (
    <div
      className="liquid-glass rounded-[22px] px-5 py-5 md:px-6 md:py-6"
      style={{
        border: '1px solid rgba(103,232,249,0.32)',
        background:
          'linear-gradient(135deg, rgba(103,232,249,0.06), transparent)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Compass size={14} strokeWidth={2.4} style={{ color: '#67e8f9' }} />
        <span
          className="kr-num text-[10.5px] uppercase tracking-widest"
          style={{ color: '#67e8f9' }}
        >
          예상 점수 · {exam.toUpperCase()}
        </span>
      </div>

      {/* 큰 placeholder */}
      <div className="flex items-baseline gap-2 mb-3">
        <span
          className="kr-heading text-[56px] md:text-[64px] tabular-nums leading-none"
          style={{ color: 'rgba(239,244,255,0.45)' }}
        >
          —
        </span>
        <span
          className="kr-body text-[13px] tabular-nums"
          style={{ color: 'rgba(239,244,255,0.55)' }}
        >
          / 100
        </span>
      </div>

      <p className="kr-body text-[14px] text-cream/85 leading-[1.6] mb-3">
        아직 데이터가 부족해. 더 풀어보면 알려줄게!
      </p>

      <div
        className="kr-num text-[11.5px] tabular-nums mb-4 px-3 py-2 rounded-lg"
        style={{
          background: 'rgba(255,255,255,0.04)',
          color: 'rgba(239,244,255,0.65)',
        }}
      >
        {subMsg}
      </div>

      {/* 다음 단원 추천 */}
      {candidates.length > 0 && (
        <div>
          <div
            className="kr-num text-[10px] uppercase tracking-widest mb-2"
            style={{ color: 'rgba(239,244,255,0.45)' }}
          >
            다음 학습 추천
          </div>
          <ul className="space-y-1.5 list-none p-0 m-0">
            {candidates.map((c) => (
              <li key={c.chapter_id}>
                <button
                  type="button"
                  onClick={() => onSelectChapter?.(c.chapter_id)}
                  disabled={!onSelectChapter}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition liquid-glass hover:bg-white/10 disabled:cursor-default"
                >
                  <span className="kr-body text-[13px] text-cream/85 flex-1 truncate">
                    {CHAPTER_NAMES[c.chapter_id] ?? c.chapter_id}
                  </span>
                  <span
                    className="kr-num text-[11px] tabular-nums"
                    style={{ color: 'rgba(239,244,255,0.4)' }}
                  >
                    {c.attempt_count > 0
                      ? `${c.attempt_count}/${MIN_ATTEMPTS_PER_CHAPTER}`
                      : '미응시'}
                  </span>
                  {onSelectChapter && (
                    <ChevronRight
                      size={13}
                      strokeWidth={2.4}
                      style={{ color: 'rgba(239,244,255,0.4)' }}
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * ReviewPage — 복습 허브 (GamePage 안의 화면. 라우트가 아님).
 *
 * 과목을 고르면 복습할 문제 수를 보여주고, 시작하면 15문 세션을 연다.
 *
 * 화면에 쓰는 말은 전부 학습자 언어로. "SRS due", "오답 큐", "혼합 비율" 같은
 * 내부 용어는 노출하지 않는다 — 사용자는 알고리즘이 아니라 자기 공부를 보러 온다.
 * 장식도 마찬가지로 절제한다. 네온 글로우와 반짝이는 화면을 싸구려로 보이게 한다.
 */

import { useMemo, useState } from 'react';
import { Play } from 'lucide-react';
import type { Subject } from '@/types/question';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import ScreenShell from './components/ScreenShell';
import { useProgress } from './useProgress';
import { sliceReviewPool, createReviewSession } from './review';
import { topicWeaknesses, weaknessLevel } from './weakness';
import { playableCount } from './session';
import { cx } from '@/lib/utils';

interface Props {
  onStartSession: (subject: Subject) => void;
  onExit: () => void;
}

const SUBJECT_LABEL: Record<Subject, string> = {
  adsp: 'ADSP',
  sqld: 'SQLD',
};

export default function ReviewPage({ onStartSession, onExit }: Props) {
  const progress = useProgress();
  const adspTotal = playableCount('adsp');
  const sqldTotal = playableCount('sqld');
  const defaultSubject: Subject =
    adspTotal >= sqldTotal ? 'adsp' : 'sqld';
  const [subject, setSubject] = useState<Subject>(defaultSubject);

  const slice = useMemo(
    () => sliceReviewPool(subject, progress),
    [subject, progress],
  );
  const weakTopics = useMemo(
    () =>
      topicWeaknesses(subject, progress)
        .filter((t) => weaknessLevel(t) !== 'unknown')
        .slice(0, 5),
    [subject, progress],
  );

  const hasData = slice.due.length > 0 || slice.wrong.length > 0;
  const accent = subject === 'adsp' ? '#67e8f9' : '#c084fc';

  const handleStart = () => {
    const session = createReviewSession(subject, 15);
    if (session) onStartSession(subject);
  };

  return (
    <ScreenShell
      eyebrow="Review"
      title="복습"
      subtitle="틀린 문제와 약한 단원을 모아 다시 풉니다."
      onExit={onExit}
      exitLabel="돌아가기"
    >
      {/* 과목 스위치 — 활성 표시는 채움 하나로 끝낸다 (그라디언트·글로우 없음) */}
      <section className="flex items-center gap-2 mb-7">
        {(['adsp', 'sqld'] as const).map((s) => {
          const total = s === 'adsp' ? adspTotal : sqldTotal;
          const disabled = total === 0;
          const active = subject === s;
          const a = s === 'adsp' ? '#67e8f9' : '#c084fc';
          return (
            <button
              key={s}
              type="button"
              onClick={() => !disabled && setSubject(s)}
              disabled={disabled}
              className={cx(
                'kr-heading text-[13px] px-4 py-2 rounded-full transition',
                disabled ? 'opacity-40 cursor-not-allowed' : '',
              )}
              style={
                active
                  ? { background: a, color: 'var(--base)' }
                  : {
                      background: 'rgba(239,244,255,0.05)',
                      color: 'rgba(239,244,255,0.7)',
                    }
              }
            >
              {SUBJECT_LABEL[s]}
            </button>
          );
        })}
      </section>

      {/* 복습 대상 요약 */}
      <section className="grid grid-cols-3 gap-3 mb-6">
        <Kpi label="다시 볼 때" value={slice.due.length.toString()} />
        <Kpi label="틀린 문제" value={slice.wrong.length.toString()} />
        <Kpi label="약한 단원" value={weakTopics.length.toString()} />
      </section>

      {/* 시작 버튼 */}
      <section className="mb-8">
        <button
          type="button"
          onClick={handleStart}
          disabled={!hasData}
          className="kr-heading text-[15px] px-6 py-4 rounded-[16px] inline-flex items-center gap-2 transition active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed w-full justify-center"
          style={{ background: accent, color: 'var(--base)' }}
        >
          <Play size={16} strokeWidth={2.6} />
          15문항 복습 시작
        </button>
      </section>

      {/* 약점 토픽 Top 5 */}
      <section className="liquid-glass rounded-[20px] p-5 md:p-6 mb-4">
        <h2 className="kr-heading text-[14px] text-cream mb-4">약한 단원</h2>
        {weakTopics.length === 0 ? (
          <p className="kr-body text-[13px] text-cream/60">
            문제를 조금 더 풀면 약한 단원이 여기에 나타납니다.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {weakTopics.map((t, i) => {
              const lvl = weaknessLevel(t);
              const color =
                lvl === 'weak'
                  ? '#f87171'
                  : lvl === 'watch'
                    ? '#fbbf24'
                    : 'var(--neon)';
              const schema = SUBJECT_SCHEMAS[t.subject];
              const chTitle =
                schema.chapters.find((c) => c.chapter === t.chapter)?.title ??
                '';
              return (
                <li
                  key={`${t.chapter}-${t.topic}`}
                  className="flex items-center justify-between gap-3 rounded-[14px] px-4 py-3"
                  style={{ background: 'rgba(239,244,255,0.04)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="kr-heading text-[12px] text-cream/40 w-5">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="kr-heading text-[13.5px] truncate">
                        {t.topic}
                      </p>
                      <p className="kr-body text-[11.5px] text-cream/50 truncate">
                        {t.chapter}단원 · {chTitle}
                      </p>
                    </div>
                  </div>
                  <span
                    className="kr-heading text-[12px] tracking-wide shrink-0"
                    style={{ color }}
                  >
                    {Math.round(t.score * 100)}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* 오답 큐 미리보기 */}
      <section className="liquid-glass rounded-[20px] p-5 md:p-6">
        <h2 className="kr-heading text-[14px] text-cream mb-4">틀린 문제</h2>
        {slice.wrong.length === 0 ? (
          <p className="kr-body text-[13px] text-cream/60">
            지금은 다시 풀 문제가 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {slice.wrong.slice(0, 5).map((q) => (
              <li
                key={q.id}
                className="rounded-[14px] px-4 py-3 kr-body text-[12.5px] text-cream/80"
                style={{ background: 'rgba(239,244,255,0.04)' }}
              >
                <div className="kr-body text-[11.5px] text-cream/45 mb-1">
                  {q.chapter}단원 · {q.topic}
                </div>
                <div className="line-clamp-2">{q.question}</div>
              </li>
            ))}
            {slice.wrong.length > 5 ? (
              <p className="kr-body text-[11px] text-cream/50 pl-1">
                …외 {slice.wrong.length - 5} 문항
              </p>
            ) : null}
          </ul>
        )}
      </section>
    </ScreenShell>
  );
}

/**
 * 숫자 하나만 보여주는 칸. 색으로 강조하지 않는다 — 셋 다 색을 입히면 어느
 * 것도 강조가 아니게 되고, 컬러 글로우가 겹쳐 화면이 번쩍인다.
 */
function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="liquid-glass rounded-[16px] px-4 py-3.5">
      <span className="kr-body text-[11.5px] text-cream/55">{label}</span>
      <div className="kr-heading text-[24px] mt-1 leading-none text-cream">
        {value}
      </div>
    </div>
  );
}

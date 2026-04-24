/**
 * ReviewPage — #/review 복습 허브.
 *
 * 과목을 선택하면 SRS due 수 · 오답 큐 · 약점 토픽을 보여주고,
 * "복습 시작" 을 누르면 15문 혼합 세션을 실행합니다.
 */

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Flame,
  Play,
  Sparkles,
} from 'lucide-react';
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
      title="복습 허브"
      subtitle="SRS · 오답 · 약점을 한 세트로 혼합해 복습합니다."
      onExit={onExit}
      exitLabel="돌아가기"
    >
      {/* 과목 스위치 */}
      <section className="flex items-center gap-2 mb-8">
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
                'kr-heading uppercase tracking-widest text-[12px] px-5 py-2.5 rounded-full transition',
                active ? '' : 'liquid-glass hover:bg-white/10',
                disabled ? 'opacity-40 cursor-not-allowed' : '',
              )}
              style={
                active
                  ? {
                      background: `linear-gradient(135deg, ${a}, var(--purple-2))`,
                      color: '#fff',
                      boxShadow: `0 10px 24px -8px ${a}88`,
                    }
                  : undefined
              }
            >
              {SUBJECT_LABEL[s]}
            </button>
          );
        })}
      </section>

      {/* KPI 3종 */}
      <section className="grid grid-cols-3 gap-4 mb-8">
        <Kpi
          icon={<Clock size={14} />}
          label="SRS due"
          value={slice.due.length.toString()}
          sub="지금 풀 타이밍"
          accent="#67e8f9"
        />
        <Kpi
          icon={<AlertTriangle size={14} />}
          label="오답 큐"
          value={slice.wrong.length.toString()}
          sub="마지막 시도가 오답"
          accent="#f87171"
        />
        <Kpi
          icon={<Flame size={14} />}
          label="약점 토픽"
          value={weakTopics.length.toString()}
          sub="Top 5 추려진 토픽"
          accent="#fbbf24"
        />
      </section>

      {/* 시작 버튼 */}
      <section className="mb-8">
        <button
          type="button"
          onClick={handleStart}
          disabled={!hasData}
          className="kr-heading uppercase tracking-widest text-[14px] px-6 py-4 rounded-full inline-flex items-center gap-3 transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center"
          style={{
            background: `linear-gradient(135deg, ${accent}, var(--purple-2))`,
            color: '#fff',
            boxShadow: `0 14px 32px -10px ${accent}88`,
          }}
        >
          <Play size={16} strokeWidth={2.6} />
          복습 세션 시작 · 15문항
          <Sparkles size={14} />
        </button>
        <p className="kr-body text-[11px] text-cream/50 mt-3">
          오답 50% · 약점 30% · SRS due 20% 비율로 혼합됩니다.
        </p>
      </section>

      {/* 약점 토픽 Top 5 */}
      <section className="liquid-glass rounded-[24px] p-5 md:p-6 mb-6">
        <h2 className="kr-heading text-[13px] uppercase tracking-widest text-cream/70 mb-4 inline-flex items-center gap-2">
          <Flame size={14} strokeWidth={2.4} />
          약점 토픽
        </h2>
        {weakTopics.length === 0 ? (
          <p className="kr-body text-[13px] text-cream/60">
            더 풀이 기록이 쌓이면 약점이 여기에 드러납니다.
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
                    : '#6FFF00';
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
                      <p className="kr-heading text-[13px] uppercase truncate">
                        {t.topic}
                      </p>
                      <p className="kr-body text-[11px] text-cream/50">
                        Ch {t.chapter} · {chTitle}
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
      <section className="liquid-glass rounded-[24px] p-5 md:p-6">
        <h2 className="kr-heading text-[13px] uppercase tracking-widest text-cream/70 mb-4 inline-flex items-center gap-2">
          <AlertTriangle size={14} strokeWidth={2.4} />
          오답 큐 미리보기
        </h2>
        {slice.wrong.length === 0 ? (
          <p className="kr-body text-[13px] text-cream/60">
            아직 오답이 없거나, 전부 재정복했어요. 👏
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {slice.wrong.slice(0, 5).map((q) => (
              <li
                key={q.id}
                className="rounded-[14px] px-4 py-3 kr-body text-[12px] text-cream/80"
                style={{ background: 'rgba(248,113,113,0.08)' }}
              >
                <div className="kr-heading text-[11px] text-cream/50 mb-1 uppercase tracking-wider">
                  Ch {q.chapter} · {q.topic}
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

function Kpi({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      className="liquid-glass rounded-[18px] p-4 md:p-5"
      style={accent ? { boxShadow: `0 0 28px -12px ${accent}` } : undefined}
    >
      <span className="kr-heading text-[10px] uppercase tracking-widest text-cream/60 inline-flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <div
        className="kr-heading text-[24px] md:text-[28px] mt-2 leading-none"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
      {sub ? (
        <p className="kr-body text-[11px] text-cream/50 mt-1">{sub}</p>
      ) : null}
    </div>
  );
}

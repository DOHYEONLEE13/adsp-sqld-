import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Database,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import type {
  MultipleChoiceQuestion,
  SqlDialect,
  SqlOrderingInteraction,
} from '@/types/question';
import { cx } from '@/lib/utils';

type SqlOrderingQuestion = MultipleChoiceQuestion & {
  interaction: SqlOrderingInteraction;
};

interface Props {
  question: MultipleChoiceQuestion;
  saved?: { chosen: number; correct: boolean };
  onChoose: (idx: number) => void;
}

export function isSqlOrderingQuestion(
  question: MultipleChoiceQuestion,
): question is SqlOrderingQuestion {
  return question.interaction?.kind === 'sql_ordering';
}

export function sqlOrderingCorrectAnswerText(
  question: MultipleChoiceQuestion,
): string | undefined {
  if (!isSqlOrderingQuestion(question)) return undefined;
  return question.interaction.answer.join(' → ');
}

export default function SqlOrderingPanel({ question, saved, onChoose }: Props) {
  if (!isSqlOrderingQuestion(question)) return null;

  const { interaction } = question;
  const [selected, setSelected] = useState<Array<string | null>>(
    () => interaction.answer.map(() => null),
  );

  useEffect(() => {
    setSelected(interaction.answer.map(() => null));
  }, [question.id, interaction.answer]);

  const usedCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const token of selected) {
      if (!token) continue;
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
    return counts;
  }, [selected]);

  const complete = selected.every(Boolean);
  const locked = !!saved;
  const correct = saved?.correct ?? null;
  const filledCount = selected.filter(Boolean).length;

  const addToken = (token: string) => {
    if (locked) return;
    const idx = selected.findIndex((item) => item === null);
    if (idx < 0) return;
    setSelected((prev) => {
      const next = [...prev];
      next[idx] = token;
      return next;
    });
  };

  const removeSlot = (idx: number) => {
    if (locked) return;
    setSelected((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
  };

  const reset = () => {
    if (locked) return;
    setSelected(interaction.answer.map(() => null));
  };

  const grade = () => {
    if (!complete || locked) return;
    const ok = interaction.answer.every((token, idx) => selected[idx] === token);
    onChoose(ok ? question.answerIndex : wrongIndex(question));
  };

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-[28px] border border-[#67e8f9]/28 bg-[linear-gradient(180deg,rgba(10,32,66,0.96),rgba(8,20,45,0.96))] p-3.5 shadow-[0_22px_48px_-34px_rgba(103,232,249,0.72),inset_0_1px_0_rgba(255,255,255,0.12)] md:p-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(circle at 14% 0%, rgba(103,232,249,0.16), transparent 30%), radial-gradient(circle at 92% 8%, rgba(209,248,67,0.10), transparent 28%)',
          }}
          aria-hidden
        />
        <div className="relative flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 kr-heading text-[9.5px] uppercase tracking-[0.08em] text-cream/76">
            <Database size={12} strokeWidth={2.4} />
            SQL Lab
          </span>
          <span className="rounded-full border border-[#c084fc]/18 bg-[#c084fc]/12 px-2.5 py-1 kr-heading text-[9.5px] uppercase tracking-[0.08em] text-[#d8b4fe]">
            {dialectLabel(interaction.dialect)}
          </span>
          <span className="rounded-full border border-[#67e8f9]/16 bg-[#67e8f9]/10 px-2.5 py-1 kr-heading text-[9.5px] uppercase tracking-[0.08em] text-[#bff8ff]">
            순서 조립
          </span>
        </div>

        {interaction.instruction ? (
          <div className="relative mt-3 rounded-[18px] border border-white/10 bg-white/[0.055] px-3.5 py-3">
            <p className="kr-body text-[12px] font-bold leading-[1.45] text-cream/78">
              {interaction.instruction}
            </p>
          </div>
        ) : null}

        <div className="relative mt-3 overflow-hidden rounded-[22px] border border-white/12 bg-[#030b20]/96 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-white/[0.035] px-3 py-2 text-[#67e8f9]">
            <div className="flex items-center gap-1.5">
              <Code2 size={13} strokeWidth={2.4} />
              <span className="kr-heading text-[9.5px] uppercase tracking-[0.08em]">
                Build Query
              </span>
            </div>
            <span className="kr-num text-[10px] font-black text-cream/44">
              {filledCount}/{interaction.answer.length}
            </span>
          </div>
          <div className="overflow-x-auto p-3.5 md:p-4">
            <code className="block whitespace-pre-wrap font-mono text-[12px] leading-[2.35] text-cream/88 md:text-[13px]">
              {interaction.answer.map((_, idx) => (
                <span key={`${question.id}-slot-${idx}`}>
                  {interaction.template[idx] ?? ''}
                  <button
                    type="button"
                    onClick={() => removeSlot(idx)}
                    disabled={locked}
                    aria-label={`${idx + 1}번째 SQL 블록`}
                    className={cx(
                      'mx-1.5 inline-flex min-h-9 min-w-[108px] items-center justify-center rounded-[14px] border px-3.5 py-1.5 align-middle font-mono text-[12px] font-black transition active:scale-[0.98] md:min-w-[120px] md:text-[13px]',
                      selected[idx]
                        ? 'border-[#d1f843]/46 bg-[#d1f843]/12 text-[#efffc0] shadow-[0_7px_0_rgba(10,20,38,0.72),inset_0_1px_0_rgba(255,255,255,0.2)]'
                        : 'border-[#7f8eac]/36 bg-[linear-gradient(180deg,rgba(239,244,255,0.09),rgba(239,244,255,0.035))] text-transparent shadow-[0_6px_0_rgba(6,12,28,0.72),inset_0_1px_0_rgba(255,255,255,0.08)]',
                      !locked &&
                        selected[idx] &&
                        'hover:border-[#d1f843]/62 hover:bg-[#d1f843]/16',
                    )}
                  >
                    {selected[idx] ? (
                      selected[idx]
                    ) : (
                      <span className="h-1.5 w-11 rounded-full bg-cream/20" />
                    )}
                  </button>
                </span>
              ))}
              {interaction.template[interaction.answer.length] ?? ''}
            </code>
          </div>
        </div>

        <div className="relative mt-4 flex min-h-[92px] flex-wrap content-start items-start justify-center gap-2.5 border-t border-white/8 pt-4">
          {interaction.tokens.map((token, tokenIdx) => {
            const tokenTotal = interaction.tokens.filter((item) => item === token).length;
            const tokenUsed = usedCounts.get(token) ?? 0;
            const disabled = locked || tokenUsed >= tokenTotal;
            return (
              <button
                key={`${question.id}-${token}-${tokenIdx}`}
                type="button"
                onClick={() => addToken(token)}
                disabled={disabled}
                className={cx(
                  'min-w-[86px] rounded-[16px] border px-3.5 py-3 text-center font-mono text-[12px] font-black transition active:translate-y-1 active:shadow-none md:min-w-[96px] md:px-4 md:text-[13px]',
                  disabled
                    ? 'pointer-events-none border-white/6 bg-white/[0.018] text-cream/16 shadow-none'
                    : 'border-[#7f8eac]/34 bg-[linear-gradient(180deg,rgba(239,244,255,0.16),rgba(239,244,255,0.075))] text-cream shadow-[0_7px_0_rgba(6,12,28,0.82),inset_0_1px_0_rgba(255,255,255,0.18)] hover:border-[#d1f843]/44 hover:bg-[#d1f843]/12',
                )}
              >
                {token}
              </button>
            );
          })}
        </div>

        <div className="relative mt-3 grid grid-cols-[auto_1fr] items-center gap-2.5">
          <button
            type="button"
            onClick={reset}
            disabled={locked || selected.every((item) => item === null)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-[16px] border border-white/10 bg-white/[0.035] px-3 kr-heading text-[10px] uppercase tracking-[0.08em] text-cream/58 transition hover:text-cream disabled:opacity-30"
          >
            <RotateCcw size={12} strokeWidth={2.4} />
            다시
          </button>
          <button
            type="button"
            onClick={grade}
            disabled={!complete || locked}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[16px] px-4 py-2.5 kr-heading text-[12px] uppercase tracking-[0.08em] transition active:translate-y-1 disabled:opacity-45"
            style={gradeButtonStyle(complete && !locked)}
          >
            채점
            <ArrowRight size={13} strokeWidth={2.6} />
          </button>
        </div>
      </div>

      {correct !== null ? (
        <div
          className={cx(
            'rounded-[18px] border p-3.5',
            correct
              ? 'border-[var(--neon-35)] bg-[var(--neon-08)]'
              : 'border-red-300/35 bg-red-400/10',
          )}
        >
          <div
            className={cx(
              'mb-1.5 inline-flex items-center gap-1.5 kr-heading text-[10px] uppercase tracking-[0.08em]',
              correct ? 'text-[var(--neon)]' : 'text-[#f87171]',
            )}
          >
            {correct ? (
              <CheckCircle2 size={13} strokeWidth={2.6} />
            ) : (
              <XCircle size={13} strokeWidth={2.6} />
            )}
            {correct ? '정답' : '정답 순서'}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {interaction.answer.map((token, idx) => (
              <span
                key={`${question.id}-answer-${idx}`}
                className="rounded-[12px] border border-white/10 bg-white/[0.06] px-3 py-1.5 font-mono text-[11px] font-black text-cream/86"
              >
                {token}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function wrongIndex(question: MultipleChoiceQuestion): number {
  const candidate = question.choices.findIndex((_, idx) => idx !== question.answerIndex);
  return candidate >= 0 ? candidate : -1;
}

function gradeButtonStyle(active: boolean): CSSProperties {
  return active
    ? {
        background:
          'linear-gradient(180deg, #d1f843 0%, #83d83f 100%)',
        color: '#07101f',
        boxShadow:
          '0 7px 0 rgba(39,76,24,0.82), 0 14px 24px -18px rgba(209,248,67,0.95), inset 0 1px 0 rgba(255,255,255,0.36)',
      }
    : {
        background: 'rgba(239,244,255,0.08)',
        color: 'rgba(239,244,255,0.55)',
        boxShadow: '0 7px 0 rgba(6,12,28,0.55)',
      };
}

function dialectLabel(dialect: SqlDialect): string {
  switch (dialect) {
    case 'oracle':
      return 'Oracle';
    case 'sqlserver':
      return 'SQL Server';
    case 'mysql':
      return 'MySQL';
    case 'postgresql':
      return 'PostgreSQL';
    case 'mixed':
      return 'DBMS Mix';
    default:
      return 'Standard SQL';
  }
}

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
    <div className="space-y-2.5 md:space-y-3">
      <div className="rounded-[20px] border border-white/10 bg-[#07102b]/88 p-4 md:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_42px_-32px_rgba(103,232,249,0.5)]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 kr-heading text-[9.5px] uppercase tracking-[0.08em] text-cream/70">
            <Database size={12} strokeWidth={2.4} />
            SQL Lab
          </span>
          <span className="rounded-full bg-[#c084fc]/12 px-2.5 py-1 kr-heading text-[9.5px] uppercase tracking-[0.08em] text-[#d8b4fe]">
            {dialectLabel(interaction.dialect)}
          </span>
          <span className="rounded-full bg-[#67e8f9]/10 px-2.5 py-1 kr-heading text-[9.5px] uppercase tracking-[0.08em] text-[#bff8ff]">
            순서 조립
          </span>
        </div>

        {interaction.instruction ? (
          <p className="mt-2 kr-body text-[11.5px] leading-[1.45] text-cream/55">
            {interaction.instruction}
          </p>
        ) : null}

        <div className="mt-3 overflow-hidden rounded-[16px] border border-white/10 bg-[#030a1c]">
          <div className="flex items-center gap-1.5 border-b border-white/8 bg-white/[0.025] px-2.5 py-1.5 text-[#67e8f9]">
            <Code2 size={13} strokeWidth={2.4} />
            <span className="kr-heading text-[9.5px] uppercase tracking-[0.08em]">
              Build Query
            </span>
          </div>
          <div className="overflow-x-auto p-3 md:p-3.5">
            <code className="block whitespace-pre-wrap font-mono text-[11.5px] md:text-[12.5px] leading-[2.05] text-cream/88">
              {interaction.answer.map((_, idx) => (
                <span key={`${question.id}-slot-${idx}`}>
                  {interaction.template[idx] ?? ''}
                  <button
                    type="button"
                    onClick={() => removeSlot(idx)}
                    disabled={locked}
                    aria-label={`${idx + 1}번째 SQL 블록`}
                    className={cx(
                      'mx-1 inline-flex min-h-8 min-w-[92px] items-center justify-center rounded-xl border px-3 py-1.5 align-middle font-mono text-[11.5px] transition md:min-w-[104px] md:text-[12.5px]',
                      selected[idx]
                        ? 'border-[#67e8f9]/50 bg-[#67e8f9]/15 text-[#dffbff] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_18px_-16px_rgba(103,232,249,0.9)]'
                        : 'border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))] text-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
                      !locked &&
                        selected[idx] &&
                        'hover:border-[#67e8f9]/65 hover:bg-[#67e8f9]/18',
                    )}
                  >
                    {selected[idx] ? (
                      selected[idx]
                    ) : (
                      <span className="h-1.5 w-10 rounded-full bg-white/18" />
                    )}
                  </button>
                </span>
              ))}
              {interaction.template[interaction.answer.length] ?? ''}
            </code>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
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
                  'rounded-xl border px-3.5 py-2.5 font-mono text-[11.5px] transition active:scale-[0.98] md:px-4 md:text-[12.5px]',
                  disabled
                    ? 'border-white/8 bg-white/[0.025] text-cream/25'
                    : 'border-[#7aa7ff]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.13),rgba(255,255,255,0.065))] text-cream shadow-[0_5px_12px_-10px_rgba(103,232,249,0.75),inset_0_1px_0_rgba(255,255,255,0.16)] hover:border-[#67e8f9]/42 hover:bg-[#67e8f9]/13',
                )}
              >
                {token}
              </button>
            );
          })}
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={locked || selected.every((item) => item === null)}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 kr-heading text-[10px] uppercase tracking-[0.08em] text-cream/55 transition hover:text-cream disabled:opacity-30"
          >
            <RotateCcw size={12} strokeWidth={2.4} />
            다시
          </button>
          <button
            type="button"
            onClick={grade}
            disabled={!complete || locked}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 kr-heading text-[11px] uppercase tracking-[0.08em] transition active:scale-[0.98] disabled:opacity-35"
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
            'rounded-[14px] border p-3',
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
                className="rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1 font-mono text-[11px] text-cream/86"
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
          'linear-gradient(180deg, #d8b4fe 0%, #a855f7 100%)',
        color: '#070a1b',
        boxShadow: '0 8px 22px -10px rgba(192,132,252,0.9)',
      }
    : {
        background: 'rgba(255,255,255,0.06)',
        color: 'rgba(239,244,255,0.55)',
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

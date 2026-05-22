import { Code2, Database, ListChecks, Table2 } from 'lucide-react';
import type { SqlQuestionContext, SqlContextTable } from '@/types/question';
import { cx } from '@/lib/utils';

interface Props {
  context?: SqlQuestionContext;
  revealed?: boolean;
  className?: string;
}

export default function SqlQuestionContextCard({
  context,
  revealed = false,
  className,
}: Props) {
  if (!context) return null;

  return (
    <div
      className={cx(
        'rounded-[18px] border border-white/10 bg-[#050b24]/72 p-4 md:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 kr-heading text-[10.5px] uppercase tracking-[0.08em] text-cream/70">
          <Database size={13} strokeWidth={2.4} />
          SQL Lab
        </span>
        {context.dialect ? (
          <span className="rounded-full bg-white/[0.05] px-3 py-1.5 kr-heading text-[10.5px] uppercase tracking-[0.08em] text-cream/55">
            {dialectLabel(context.dialect)}
          </span>
        ) : null}
        {context.focus?.map((item) => (
          <span
            key={item}
            className="rounded-full bg-[rgba(192,132,252,0.11)] px-3 py-1.5 kr-body text-[11.5px] text-[#d8b4fe]"
          >
            {item}
          </span>
        ))}
      </div>

      {context.title || context.prompt ? (
        <div className="mt-3">
          {context.title ? (
            <p className="kr-heading text-[13px] uppercase text-cream/90">
              {context.title}
            </p>
          ) : null}
          {context.prompt ? (
            <p className="kr-body mt-1 text-[12.5px] leading-[1.65] text-cream/62">
              {context.prompt}
            </p>
          ) : null}
        </div>
      ) : null}

      {context.tables?.length ? (
        <div className="mt-4 grid gap-3">
          {context.tables.map((table) => (
            <SqlTable key={table.name} table={table} />
          ))}
        </div>
      ) : null}

      {context.sql ? (
        <div className="mt-4 overflow-hidden rounded-[14px] border border-[#67e8f9]/15 bg-[#020817]">
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-[#67e8f9]">
            <Code2 size={14} strokeWidth={2.4} />
            <span className="kr-heading text-[10.5px] uppercase tracking-[0.08em]">
              Query
            </span>
          </div>
          <pre className="overflow-x-auto p-3 text-[12px] leading-[1.7] text-cream/88">
            <code>{context.sql}</code>
          </pre>
        </div>
      ) : null}

      {context.expectedShape ? (
        <p className="mt-3 kr-body text-[12px] leading-[1.6] text-cream/50">
          {context.expectedShape}
        </p>
      ) : null}

      {revealed && context.trace?.length ? (
        <div className="mt-4 rounded-[14px] border border-[var(--neon-20)] bg-[var(--neon-06)] p-3">
          <div className="mb-2 inline-flex items-center gap-1.5 kr-heading text-[10.5px] uppercase tracking-[0.08em] text-[var(--neon)]">
            <ListChecks size={13} strokeWidth={2.4} />
            Trace
          </div>
          <ol className="space-y-1.5 kr-body text-[12px] leading-[1.65] text-cream/78">
            {context.trace.map((item, idx) => (
              <li key={`${idx}-${item}`} className="flex gap-2">
                <span className="mt-[1px] text-[var(--neon)]">{idx + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

function SqlTable({ table }: { table: SqlContextTable }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.035]">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-cream/72">
        <Table2 size={14} strokeWidth={2.3} />
        <span className="kr-heading text-[10.5px] uppercase tracking-[0.08em]">
          {table.name}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left kr-body text-[12px]">
          <thead>
            <tr className="bg-white/[0.045] text-cream/58">
              {table.columns.map((column) => (
                <th key={column} className="whitespace-nowrap px-3 py-2 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, idx) => (
              <tr key={idx} className="border-t border-white/[0.06] text-cream/82">
                {table.columns.map((column) => (
                  <td key={column} className="whitespace-nowrap px-3 py-2">
                    {formatCell(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return 'NULL';
  return String(value);
}

function dialectLabel(dialect: NonNullable<SqlQuestionContext['dialect']>): string {
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

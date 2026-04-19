/**
 * StatsPage — #/stats 대시보드.
 *
 * 구성:
 *   - KPI 4개: 총 풀이 · 평균 정답률 · 오늘 풀이 · 연속 학습일
 *   - 7일 정답률 추이 바 차트
 *   - 과목별 정답률
 *   - 약점 토픽 Top 5 (과목 통합)
 *   - 최근 세션 이력 10개
 *   - 데이터 리셋 버튼 (확인 다이얼로그)
 */

import { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  Flame,
  RefreshCcw,
  Target,
  Trash2,
} from 'lucide-react';
import type { Subject } from '@/types/question';
import ScreenShell from './components/ScreenShell';
import { useProgress } from './useProgress';
import { resetProgress } from './storage';
import {
  computeKpi,
  computeSubjectBreakdown,
  recentDailyTrend,
  recentSessions,
} from './stats';
import { topicWeaknesses, weaknessLevel } from './weakness';
import { formatDuration } from './session';
import { cx } from '@/lib/utils';

interface Props {
  onExit: () => void;
}

const SUBJECT_LABEL: Record<Subject, string> = {
  adsp: 'ADSP',
  sqld: 'SQLD',
};

export default function StatsPage({ onExit }: Props) {
  const progress = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);

  const kpi = useMemo(() => computeKpi(progress), [progress]);
  const trend = useMemo(() => recentDailyTrend(progress, 7), [progress]);
  const subjects = useMemo(() => computeSubjectBreakdown(progress), [progress]);
  const sessions = useMemo(() => recentSessions(progress, 10), [progress]);
  const topWeak = useMemo(() => {
    const all = [
      ...topicWeaknesses('adsp', progress),
      ...topicWeaknesses('sqld', progress),
    ];
    return all
      .filter((t) => weaknessLevel(t) !== 'unknown')
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [progress]);

  const empty = kpi.totalAttempts === 0;

  return (
    <ScreenShell
      eyebrow="Mission Log"
      title="학습 대시보드"
      subtitle="누적 진도, 약점, 최근 세션을 한눈에 확인합니다."
      onExit={onExit}
      exitLabel="돌아가기"
    >
      {empty ? (
        <div className="liquid-glass rounded-[24px] p-8 md:p-12 text-center">
          <p className="kr-heading text-[18px] md:text-[22px] uppercase leading-tight">
            아직 기록이 없습니다
          </p>
          <p className="kr-body text-[13px] text-cream/70 mt-3">
            세션을 완료하면 이곳에 진도·약점·이력이 쌓입니다.
          </p>
        </div>
      ) : (
        <>
          {/* KPI 4종 */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <Kpi
              icon={<BarChart3 size={16} />}
              label="총 풀이"
              value={kpi.totalAttempts.toString()}
              sub={`세션 ${kpi.sessionCount}회`}
            />
            <Kpi
              icon={<Target size={16} />}
              label="평균 정답률"
              value={`${Math.round(kpi.overallAccuracy * 100)}%`}
              sub={`${kpi.totalCorrect} 정답`}
              accent={accuracyAccent(kpi.overallAccuracy)}
            />
            <Kpi
              icon={<Calendar size={16} />}
              label="오늘 풀이"
              value={kpi.todayAttempts.toString()}
              sub={formatDuration(kpi.totalTimeMs) + ' 누적'}
            />
            <Kpi
              icon={<Flame size={16} />}
              label="연속 학습일"
              value={`${kpi.streakDays}일`}
              sub={kpi.streakDays > 0 ? '🔥 불타는 중' : '오늘 시작하기'}
              accent={kpi.streakDays > 0 ? '#f97316' : undefined}
            />
          </section>

          {/* 7일 추이 */}
          <section className="liquid-glass rounded-[24px] p-5 md:p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="kr-heading text-[13px] uppercase tracking-widest text-cream/70 inline-flex items-center gap-2">
                <Activity size={14} strokeWidth={2.4} />
                최근 7일 추이
              </h2>
              <span className="kr-body text-[11px] text-cream/50">
                바 높이 = 풀이 수 · 컬러 = 정답률
              </span>
            </div>
            <TrendBars trend={trend} />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 과목별 */}
            <section className="liquid-glass rounded-[24px] p-5 md:p-6">
              <h2 className="kr-heading text-[13px] uppercase tracking-widest text-cream/70 mb-4">
                과목별 정답률
              </h2>
              {subjects.length === 0 ? (
                <p className="kr-body text-[13px] text-cream/60">데이터 없음</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {subjects.map((s) => (
                    <SubjectRow
                      key={s.subject}
                      label={SUBJECT_LABEL[s.subject]}
                      attempts={s.totalAttempts}
                      accuracy={s.accuracy}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* 약점 Top 5 */}
            <section className="liquid-glass rounded-[24px] p-5 md:p-6">
              <h2 className="kr-heading text-[13px] uppercase tracking-widest text-cream/70 mb-4 inline-flex items-center gap-2">
                <Flame size={14} strokeWidth={2.4} />
                약점 토픽 Top 5
              </h2>
              {topWeak.length === 0 ? (
                <p className="kr-body text-[13px] text-cream/60">
                  데이터가 더 쌓이면 약점이 표시됩니다.
                </p>
              ) : (
                <ol className="flex flex-col gap-2">
                  {topWeak.map((t, i) => (
                    <li
                      key={`${t.subject}-${t.chapter}-${t.topic}`}
                      className="flex items-center justify-between gap-3"
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
                            {SUBJECT_LABEL[t.subject]} · Ch {t.chapter}
                          </p>
                        </div>
                      </div>
                      <span
                        className="kr-heading text-[12px] tracking-wide shrink-0"
                        style={{ color: weaknessColor(t.score) }}
                      >
                        {Math.round(t.score * 100)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          {/* 최근 세션 */}
          <section className="liquid-glass rounded-[24px] p-5 md:p-6 mb-8">
            <h2 className="kr-heading text-[13px] uppercase tracking-widest text-cream/70 mb-4">
              최근 세션
            </h2>
            <div className="flex flex-col gap-2">
              {sessions.map((s) => {
                const acc = s.total === 0 ? 0 : s.correctCount / s.total;
                return (
                  <div
                    key={s.at}
                    className="flex items-center justify-between gap-3 rounded-[14px] px-4 py-3"
                    style={{ background: 'rgba(239,244,255,0.04)' }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="kr-heading text-[13px] uppercase truncate">
                        {s.chapterTitle}
                        {s.topic ? (
                          <span className="text-cream/60"> · {s.topic}</span>
                        ) : (
                          <span className="text-cream/40"> · 전체 믹스</span>
                        )}
                      </p>
                      <p className="kr-body text-[11px] text-cream/50 mt-0.5">
                        {SUBJECT_LABEL[s.subject]} · {formatRelativeTime(s.at)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className="kr-heading text-[14px]"
                        style={{ color: accuracyAccent(acc) }}
                      >
                        {s.correctCount}/{s.total}
                      </span>
                      <p className="kr-body text-[10px] text-cream/50">
                        {formatDuration(s.totalTimeMs)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* 리셋 */}
      <section className="liquid-glass rounded-[24px] p-5 md:p-6 border border-red-400/20">
        <h2 className="kr-heading text-[13px] uppercase tracking-widest text-red-400 mb-2 inline-flex items-center gap-2">
          <Trash2 size={14} strokeWidth={2.4} />
          Danger Zone
        </h2>
        <p className="kr-body text-[12px] text-cream/70 mb-4">
          모든 진행 기록(풀이 통계, 세션 이력)을 삭제합니다. 되돌릴 수 없습니다.
        </p>
        {confirmReset ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                resetProgress();
                setConfirmReset(false);
              }}
              className="kr-heading uppercase tracking-widest text-[12px] px-5 py-3 rounded-full"
              style={{
                background: '#f87171',
                color: '#010828',
              }}
            >
              정말 삭제
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="liquid-glass kr-heading uppercase tracking-widest text-[12px] px-5 py-3 rounded-full hover:bg-white/10 transition"
            >
              취소
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="liquid-glass kr-heading uppercase tracking-widest text-[12px] px-5 py-3 rounded-full inline-flex items-center gap-2 hover:bg-white/10 transition"
          >
            <RefreshCcw size={14} strokeWidth={2.4} />
            진행 기록 초기화
          </button>
        )}
      </section>
    </ScreenShell>
  );
}

// ------------------------------------------------------------------
// 서브 컴포넌트
// ------------------------------------------------------------------

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
      className="liquid-glass rounded-[20px] p-4 md:p-5"
      style={accent ? { boxShadow: `0 0 40px -14px ${accent}` } : undefined}
    >
      <span className="kr-heading text-[10px] uppercase tracking-widest text-cream/60 inline-flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <div
        className="kr-heading text-[26px] md:text-[32px] mt-2 leading-none"
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

function SubjectRow({
  label,
  attempts,
  accuracy,
}: {
  label: string;
  attempts: number;
  accuracy: number;
}) {
  const pct = Math.round(accuracy * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="kr-heading text-[13px] uppercase tracking-wide">
          {label}
        </span>
        <span
          className="kr-heading text-[13px] tracking-wide"
          style={{ color: accuracyAccent(accuracy) }}
        >
          {pct}% · {attempts}문항
        </span>
      </div>
      <div
        className="h-[6px] rounded-full overflow-hidden"
        style={{ background: 'rgba(239, 244, 255, 0.08)' }}
      >
        <div
          className="h-full transition-[width] duration-500"
          style={{
            width: `${pct}%`,
            background: accuracyAccent(accuracy),
          }}
        />
      </div>
    </div>
  );
}

function TrendBars({
  trend,
}: {
  trend: ReturnType<typeof recentDailyTrend>;
}) {
  const max = Math.max(1, ...trend.map((b) => b.attempts));
  return (
    <div className="flex items-end gap-2 h-[120px]">
      {trend.map((b) => {
        const h = b.attempts === 0 ? 4 : Math.max(6, (b.attempts / max) * 100);
        const label = new Date(b.day).toLocaleDateString(undefined, {
          weekday: 'short',
        });
        return (
          <div
            key={b.day}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <div className="w-full flex items-end" style={{ height: '100%' }}>
              <div
                className="w-full rounded-t-md transition-[height] duration-500"
                style={{
                  height: `${h}%`,
                  background:
                    b.attempts === 0
                      ? 'rgba(239, 244, 255, 0.08)'
                      : accuracyAccent(b.accuracy),
                  opacity: b.attempts === 0 ? 0.5 : 0.85,
                }}
                title={`${b.attempts}문항 · ${Math.round(b.accuracy * 100)}%`}
              />
            </div>
            <span
              className={cx(
                'kr-heading text-[10px] uppercase tracking-widest',
                'text-cream/50',
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------
// 유틸 — 컬러 · 상대시간
// ------------------------------------------------------------------

function accuracyAccent(acc: number): string {
  if (acc >= 0.8) return '#6FFF00';
  if (acc >= 0.5) return '#a78bfa';
  return '#f87171';
}

function weaknessColor(score: number): string {
  if (score >= 0.55) return '#f87171';
  if (score >= 0.4) return '#fbbf24';
  return '#6FFF00';
}

function formatRelativeTime(ts: number, now: number = Date.now()): string {
  const diff = now - ts;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return '방금 전';
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}일 전`;
  return new Date(ts).toLocaleDateString();
}

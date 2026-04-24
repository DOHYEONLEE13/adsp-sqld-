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
  Award,
  BarChart3,
  Calendar,
  CalendarClock,
  Flame,
  RefreshCcw,
  Target,
  Trash2,
} from 'lucide-react';
import type { Subject } from '@/types/question';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
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
import { computePlayerStats } from './rpg';
import { aggregateChapter } from './aggregate';
import { computeBadges } from './badges';
import {
  daysUntil,
  getAllExamDates,
  setExamDate,
} from './examDate';
import { getTodayQuests } from './dailyQuests';
import DailyQuestsCard from './components/DailyQuestsCard';

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
  const [examDates, setExamDatesState] = useState(() => getAllExamDates());

  const kpi = useMemo(() => computeKpi(progress), [progress]);
  const trend = useMemo(() => recentDailyTrend(progress, 7), [progress]);
  const subjects = useMemo(() => computeSubjectBreakdown(progress), [progress]);
  const sessions = useMemo(() => recentSessions(progress, 10), [progress]);
  const playerStats = useMemo(() => computePlayerStats(progress), [progress]);
  const badges = useMemo(
    () => computeBadges(progress, playerStats),
    [progress, playerStats],
  );
  const calendar = useMemo(() => recentDailyTrend(progress, 30), [progress]);
  const dailyQuests = useMemo(() => getTodayQuests(progress), [progress]);
  const chapterMastery = useMemo(() => {
    const result: Record<Subject, ChapterMasteryRow[]> = { adsp: [], sqld: [] };
    (['adsp', 'sqld'] as const).forEach((subject) => {
      const schema = SUBJECT_SCHEMAS[subject];
      result[subject] = schema.chapters.map((ch) => {
        const agg = aggregateChapter(subject, ch.chapter, progress);
        return {
          chapter: ch.chapter,
          title: ch.title,
          total: agg.total,
          solved: agg.solved,
          accuracy: agg.accuracy,
        };
      });
    });
    return result;
  }, [progress]);

  const handleExamDateChange = (subject: Subject, ymd: string) => {
    setExamDate(subject, ymd || null);
    setExamDatesState(getAllExamDates());
  };
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
      {/* D-day — 항상 표시 (빈 상태에서도 설정 가능) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {(['adsp', 'sqld'] as const).map((subject) => (
          <DdayCard
            key={subject}
            subject={subject}
            ymd={examDates[subject]}
            onChange={(v) => handleExamDateChange(subject, v)}
          />
        ))}
      </section>

      {/* 오늘의 퀘스트 */}
      <div className="mb-8">
        <DailyQuestsCard quests={dailyQuests} />
      </div>

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

          {/* 30일 스트릭 캘린더 */}
          <section className="liquid-glass rounded-[24px] p-5 md:p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="kr-heading text-[13px] uppercase tracking-widest text-cream/70 inline-flex items-center gap-2">
                <Calendar size={14} strokeWidth={2.4} />
                30일 스트릭 캘린더
              </h2>
              <span className="kr-body text-[11px] text-cream/50">
                초록 진할수록 많이 푼 날
              </span>
            </div>
            <StreakCalendar trend={calendar} />
          </section>

          {/* 과목별 챕터 마스터리 */}
          <section className="liquid-glass rounded-[24px] p-5 md:p-6 mb-8">
            <h2 className="kr-heading text-[13px] uppercase tracking-widest text-cream/70 mb-4 inline-flex items-center gap-2">
              <BarChart3 size={14} strokeWidth={2.4} />
              챕터 마스터리
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(['adsp', 'sqld'] as const).map((subject) => (
                <div key={subject}>
                  <div className="kr-heading text-[12px] uppercase tracking-widest text-cream/60 mb-3">
                    {SUBJECT_LABEL[subject]}
                  </div>
                  <div className="flex flex-col gap-3">
                    {chapterMastery[subject].map((ch) => (
                      <ChapterMasteryRow key={ch.chapter} row={ch} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 뱃지 그리드 */}
          <section className="liquid-glass rounded-[24px] p-5 md:p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="kr-heading text-[13px] uppercase tracking-widest text-cream/70 inline-flex items-center gap-2">
                <Award size={14} strokeWidth={2.4} />
                업적 뱃지
              </h2>
              <span className="kr-body text-[11px] text-cream/50">
                {badges.filter((b) => b.isEarned).length} / {badges.length} 획득
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {badges.map((b) => (
                <BadgeTile key={b.id} badge={b} />
              ))}
            </div>
          </section>

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

interface ChapterMasteryRow {
  chapter: number;
  title: string;
  total: number;
  solved: number;
  accuracy: number;
}

function DdayCard({
  subject,
  ymd,
  onChange,
}: {
  subject: Subject;
  ymd: string | undefined;
  onChange: (v: string) => void;
}) {
  const days = daysUntil(ymd);
  const accent = subject === 'adsp' ? '#67e8f9' : '#c084fc';
  const label = days === null
    ? '시험일 미설정'
    : days > 0
      ? `D-${days}`
      : days === 0
        ? 'D-Day'
        : `D+${-days}`;
  const urgent = days !== null && days >= 0 && days <= 14;
  return (
    <div
      className="liquid-glass rounded-[20px] p-4 md:p-5"
      style={urgent ? { boxShadow: `0 0 40px -12px ${accent}` } : undefined}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="kr-heading text-[11px] uppercase tracking-widest text-cream/60 inline-flex items-center gap-1.5">
          <CalendarClock size={12} strokeWidth={2.4} />
          {SUBJECT_LABEL[subject]} 시험일
        </span>
        <input
          type="date"
          value={ymd ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="kr-body text-[11px] bg-white/5 text-cream/80 rounded-md px-2 py-1 outline-none border border-white/10 focus:border-white/30"
          style={{ colorScheme: 'dark' }}
        />
      </div>
      <div
        className="kr-heading text-[32px] md:text-[40px] mt-1 leading-none"
        style={{ color: urgent ? accent : 'var(--cream)' }}
      >
        {label}
      </div>
      {ymd ? (
        <p className="kr-body text-[11px] text-cream/50 mt-2">
          {formatExamDate(ymd)} 예정
        </p>
      ) : (
        <p className="kr-body text-[11px] text-cream/50 mt-2">
          시험 날짜를 지정하면 카운트다운이 표시됩니다.
        </p>
      )}
    </div>
  );
}

function formatExamDate(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  return `${m[1]}년 ${Number(m[2])}월 ${Number(m[3])}일`;
}

function StreakCalendar({
  trend,
}: {
  trend: ReturnType<typeof recentDailyTrend>;
}) {
  // 6주 x 5 = 30 일을 요일 그리드로 펼치면 세로가 너무 길어져서,
  // 그냥 5열 x 6행 그리드 (가로 캘린더) 로 단순화.
  const max = Math.max(1, ...trend.map((b) => b.attempts));
  return (
    <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-15 gap-1.5">
      {trend.map((b) => {
        const intensity = b.attempts === 0 ? 0 : b.attempts / max;
        const day = new Date(b.day);
        const dayNum = day.getDate();
        const weekday = day.getDay();
        const isWeekend = weekday === 0 || weekday === 6;
        const bg =
          b.attempts === 0
            ? 'rgba(239,244,255,0.06)'
            : `rgba(111, 255, 0, ${0.15 + intensity * 0.7})`;
        const title = `${b.day} · ${b.attempts}문항${
          b.attempts > 0 ? ` · ${Math.round(b.accuracy * 100)}%` : ''
        }`;
        return (
          <div
            key={b.day}
            title={title}
            className="aspect-square rounded-[6px] flex items-center justify-center"
            style={{ background: bg }}
          >
            <span
              className={cx(
                'kr-body text-[9px] tabular-nums',
                b.attempts > 0
                  ? 'text-[#010828] font-bold'
                  : isWeekend
                    ? 'text-cream/30'
                    : 'text-cream/50',
              )}
            >
              {dayNum}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ChapterMasteryRow({ row }: { row: ChapterMasteryRow }) {
  const pct = Math.round(row.accuracy * 100);
  const solvedPct =
    row.total === 0 ? 0 : Math.round((row.solved / row.total) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="kr-body text-[12px] text-cream/80 truncate pr-2">
          Ch {row.chapter} · {row.title}
        </span>
        <span
          className="kr-heading text-[11px] tabular-nums shrink-0"
          style={{ color: row.total === 0 ? 'rgba(239,244,255,0.3)' : accuracyAccent(row.accuracy) }}
        >
          {row.total === 0 ? '—' : `${pct}%`}
        </span>
      </div>
      <div
        className="h-[5px] rounded-full overflow-hidden relative"
        style={{ background: 'rgba(239, 244, 255, 0.08)' }}
      >
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-500"
          style={{
            width: `${solvedPct}%`,
            background: 'rgba(239, 244, 255, 0.18)',
          }}
        />
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-500"
          style={{
            width: `${pct}%`,
            background: accuracyAccent(row.accuracy),
          }}
        />
      </div>
      <p className="kr-body text-[10px] text-cream/40 mt-1">
        {row.solved} / {row.total} 문항 탐사
      </p>
    </div>
  );
}

function BadgeTile({
  badge,
}: {
  badge: { id: string; name: string; description: string; icon: string; isEarned: boolean };
}) {
  return (
    <div
      className={cx(
        'rounded-[14px] p-3 flex flex-col items-center gap-1.5 transition',
        badge.isEarned ? 'liquid-glass' : 'opacity-40',
      )}
      style={
        badge.isEarned
          ? { boxShadow: '0 0 20px -8px rgba(111, 255, 0, 0.5)' }
          : { background: 'rgba(239,244,255,0.04)' }
      }
      title={badge.description}
    >
      <span
        className={cx(
          'text-[28px] leading-none',
          badge.isEarned ? '' : 'grayscale',
        )}
      >
        {badge.icon}
      </span>
      <span className="kr-heading text-[10px] uppercase tracking-widest text-center leading-tight">
        {badge.name}
      </span>
      <span className="kr-body text-[9px] text-cream/50 text-center leading-snug">
        {badge.description}
      </span>
    </div>
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

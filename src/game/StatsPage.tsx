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

import { useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Flame,
  Target,
} from 'lucide-react';
import type { Subject } from '@/types/question';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import ScreenShell from './components/ScreenShell';
import { useProgress } from './useProgress';
import {
  computeKpi,
  computeSubjectBreakdown,
  recentDailyTrend,
} from './stats';
import { topicWeaknesses, weaknessLevel } from './weakness';
import { formatDuration } from './session';
import { cx } from '@/lib/utils';
import { aggregateChapter } from './aggregate';
import { MobileTopBar, MobileBottomNav } from './components/MobileGameNav';
import ProfileCustomizer from './components/ProfileCustomizer';
import PageAmbientBg from './components/PageAmbientBg';
import PassSection from '@/components/passes/PassSection';
import BookmarkedConceptsList from './components/BookmarkedConceptsList';

interface Props {
  onExit: () => void;
}

const SUBJECT_LABEL: Record<Subject, string> = {
  adsp: 'ADSP',
  sqld: 'SQLD',
};

export default function StatsPage({ onExit }: Props) {
  const progress = useProgress();

  const kpi = useMemo(() => computeKpi(progress), [progress]);
  const subjects = useMemo(() => computeSubjectBreakdown(progress), [progress]);
  const calendar = useMemo(() => recentDailyTrend(progress, 30), [progress]);
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
      ambient={<PageAmbientBg />}
    >
      {/* 모바일 상/하단 내비 */}
      <MobileTopBar />
      <div className="md:hidden h-14" aria-hidden />

      {/* 프로필 꾸미기 — 아바타 포즈 + 이름 */}
      <div className="mb-6">
        <ProfileCustomizer />
      </div>

      {/* 북마크한 개념 — 양 과목 모두 (학습 화면 우상단 ★ 로 추가) */}
      <BookmarkedConceptsCard />

      {/* 회독 Pass Tier + Stamp 컬렉션 */}
      <PassSection />

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

          {/* 7일 추이 / 업적 뱃지 / 최근 세션 — 사용자 결정 (2026-05) 으로 제거.
              간소화 우선. 데이터 추가될 때 다시 보강 검토. */}

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

        </>
      )}

      <div className="md:hidden h-20" aria-hidden />
      <MobileBottomNav active="profile" />
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
            : `color-mix(in srgb, var(--neon) ${Math.round(
                15 + intensity * 70,
              )}%, transparent)`;
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
  // 마스터리 = '챕터를 얼마나 정복했나' = 진도 (solved/total) 가 메인.
  // 이전엔 정답률 (accuracy) 을 메인 % 로 표시해 사용자가 '1/90 문항' 과 매치
  // 안 되는 67% 가 보여 혼란. 진도 % 를 메인으로, 정답률은 부가 정보로.
  const solvedPct =
    row.total === 0 ? 0 : Math.round((row.solved / row.total) * 100);
  const accuracyPct = Math.round(row.accuracy * 100);
  const empty = row.total === 0;
  const noProgress = row.solved === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <span className="kr-body text-[12px] text-cream/80 truncate flex-1 min-w-0">
          Ch {row.chapter} · {row.title}
        </span>
        <span
          className="kr-num text-[11px] tabular-nums shrink-0 font-bold"
          style={{
            color: empty
              ? 'rgba(239,244,255,0.3)'
              : noProgress
                ? 'rgba(239,244,255,0.55)'
                : 'var(--cream)',
          }}
        >
          {empty ? '—' : `${solvedPct}%`}
        </span>
      </div>
      <div
        className="h-[5px] rounded-full overflow-hidden relative"
        style={{ background: 'rgba(239, 244, 255, 0.08)' }}
      >
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-500 rounded-full"
          style={{
            width: `${solvedPct}%`,
            background: noProgress
              ? 'rgba(239,244,255,0.18)'
              : accuracyAccent(row.accuracy),
            boxShadow: noProgress
              ? 'none'
              : `0 0 8px ${accuracyAccent(row.accuracy)}55`,
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-1 gap-2">
        <p
          className="kr-body text-[10px]"
          style={{ color: 'rgba(239,244,255,0.4)' }}
        >
          {row.solved} / {row.total} 문항 탐사
        </p>
        {!noProgress && !empty ? (
          <p
            className="kr-num text-[10px] tabular-nums shrink-0"
            style={{ color: accuracyAccent(row.accuracy) }}
          >
            정답률 {accuracyPct}%
          </p>
        ) : null}
      </div>
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

// ------------------------------------------------------------------
// 유틸 — 컬러 · 상대시간
// ------------------------------------------------------------------

function accuracyAccent(acc: number): string {
  if (acc >= 0.8) return 'var(--neon)';
  if (acc >= 0.5) return '#a78bfa';
  return '#f87171';
}

function weaknessColor(score: number): string {
  if (score >= 0.55) return '#f87171';
  if (score >= 0.4) return '#fbbf24';
  return 'var(--neon)';
}

// formatRelativeTime — 최근 세션 섹션 제거로 미사용. 향후 재도입 시 git history 참조.

// ----------------------------------------------------------------
// BookmarkedConceptsCard — 프로필 영역. 양 과목 (ADsP + SQLD) 모두 노출.
// 토글 가능한 collapsible 리스트 — 기본 collapsed (긴 리스트 화면 점령 방지).
// 클릭 시 해당 step 의 LessonScreen 으로 jump (sessionStorage handoff).
// ----------------------------------------------------------------
function BookmarkedConceptsCard() {
  return (
    <section
      className="liquid-glass rounded-[24px] p-5 md:p-6 mb-6"
      aria-label="북마크한 문제"
    >
      <BookmarkedConceptsList
        limit={20}
        defaultOpen={false}
        headerLabel="북마크한 문제"
      />
    </section>
  );
}

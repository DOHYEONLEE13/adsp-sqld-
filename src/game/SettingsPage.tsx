/**
 * SettingsPage — 설정 모음 (#/settings).
 *
 * MobileTopBar 의 ⚙ 기어 아이콘 클릭 시 진입. 프로필(StatsPage) 에서 분리한 4 섹션:
 *   1) 로그인/계정 (AuthCard)
 *   2) 배경 테마 — 변경 버튼 → ThemePicker 모달
 *   3) 시험일 (D-day) — ADsP/SQLD 두 카드
 *   4) Danger Zone — 진행 기록 초기화
 */

import { useState } from 'react';
import { CalendarClock, Palette, RefreshCcw, Trash2 } from 'lucide-react';
import type { Subject } from '@/types/question';
import ScreenShell from './components/ScreenShell';
import { MobileTopBar, MobileBottomNav } from './components/MobileGameNav';
import PageAmbientBg from './components/PageAmbientBg';
import AuthCard from './components/AuthCard';
import ThemePickerModal from './components/ThemePickerModal';
import { useTheme } from './theme/useTheme';
import {
  daysUntil,
  getAllExamDates,
  getUpcomingPresets,
  setExamDate,
} from './examDate';
import { resetProgress } from './storage';

interface Props {
  onExit: () => void;
}

const SUBJECT_LABEL: Record<Subject, string> = {
  adsp: 'ADSP',
  sqld: 'SQLD',
};

export default function SettingsPage({ onExit }: Props) {
  const [examDates, setExamDatesState] = useState(() => getAllExamDates());
  const [confirmReset, setConfirmReset] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const currentTheme = useTheme();

  const handleExamDateChange = (subject: Subject, ymd: string) => {
    setExamDate(subject, ymd || null);
    setExamDatesState(getAllExamDates());
  };

  return (
    <ScreenShell
      eyebrow="Settings"
      title="설정"
      subtitle="계정·배경 테마·시험일·진행 기록 관리."
      onExit={onExit}
      exitLabel="돌아가기"
      ambient={<PageAmbientBg />}
    >
      <MobileTopBar />
      <div className="md:hidden h-14" aria-hidden />

      {/* (1) 계정 — 게스트 모드 안내 + Google 로그인 */}
      <AuthCard />

      {/* (2) 배경 테마 — 변경 버튼 → 모달 */}
      <section className="liquid-glass rounded-[20px] px-4 py-4 md:px-5 md:py-5 mb-6 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Palette
            size={14}
            strokeWidth={2.4}
            style={{ color: 'var(--neon)' }}
          />
          <h3 className="kr-heading uppercase text-[11px] tracking-widest text-cream/85">
            배경 테마
          </h3>
        </div>
        <p className="kr-body text-[12px] text-cream/60 leading-[1.55] mb-3">
          현재 테마: <span className="kr-body text-cream/90">{currentTheme.label}</span>
        </p>
        <button
          type="button"
          onClick={() => setThemeModalOpen(true)}
          className="kr-num text-[12.5px] font-medium px-4 py-2.5 rounded-full inline-flex items-center justify-center gap-1.5 transition active:scale-[0.98] hover:bg-white/10"
          style={{
            background: 'rgba(111,255,0,0.10)',
            color: 'var(--neon)',
            border: '1px solid rgba(111,255,0,0.35)',
          }}
        >
          배경 테마 변경하기
        </button>
      </section>

      {/* (3) 시험일 (D-day) */}
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

      {/* (4) Danger Zone */}
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

      <div className="md:hidden h-20" aria-hidden />
      {/* 설정은 별도 화면 — 5개 탭 중 어느 것도 active 아님 */}
      <MobileBottomNav />

      {themeModalOpen ? (
        <ThemePickerModal onClose={() => setThemeModalOpen(false)} />
      ) : null}
    </ScreenShell>
  );
}

// ─── DdayCard (StatsPage 에서 이전) ─────────────────────────────────

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
  const label =
    days === null
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
        <>
          <p className="kr-body text-[11px] text-cream/50 mt-2">
            시험 날짜를 지정하면 카운트다운이 표시됩니다.
          </p>
          <PresetChips subject={subject} accent={accent} onPick={onChange} />
        </>
      )}
    </div>
  );
}

function PresetChips({
  subject,
  accent,
  onPick,
}: {
  subject: Subject;
  accent: string;
  onPick: (ymd: string) => void;
}) {
  const presets = getUpcomingPresets(subject);
  if (presets.length === 0) {
    return (
      <p className="kr-body text-[10.5px] text-cream/40 mt-2">
        2026 시험 일정이 모두 종료됐습니다. 2027 일정 발표 후 추가 예정.
      </p>
    );
  }
  return (
    <div className="mt-3">
      <div className="kr-num text-[10px] uppercase tracking-[0.18em] text-cream/45 mb-1.5">
        2026 회차 빠른 설정
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p.date}
            type="button"
            onClick={() => onPick(p.date)}
            aria-label={`${p.round} 시험일 ${p.display} 로 설정`}
            className="kr-num inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] transition active:scale-95"
            style={{
              background: `${accent}14`,
              color: accent,
              border: `1px solid ${accent}33`,
              fontWeight: 600,
            }}
          >
            <span>{p.round}</span>
            <span className="text-cream/50">·</span>
            <span className="kr-body text-cream/70 font-normal">
              {p.display.split(' ')[0].slice(5)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function formatExamDate(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  return `${m[1]}년 ${Number(m[2])}월 ${Number(m[3])}일`;
}

/**
 * SettingsPage — 설정 모음 (#/settings).
 *
 * MobileTopBar 의 설정 메뉴 클릭 시 진입.
 * 설정 홈 목록에서 계정, 요금제, 배경 테마, 시험일 상세 섹션으로 이동한다.
 */

import { useMemo, useState, type ReactNode } from 'react';
import {
  CalendarClock,
  ChevronRight,
  CreditCard,
  LogOut,
  Palette,
  RefreshCw,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import type { Subject } from '@/types/question';
import ScreenShell from './components/ScreenShell';
import { MobileTopBar, MobileBottomNav } from './components/MobileGameNav';
import PageAmbientBg from './components/PageAmbientBg';
import AuthCard from './components/AuthCard';
import ThemePicker from './components/ThemePicker';
import { useTheme } from './theme/useTheme';
import { useEnergy } from './energy';
import { useAuthSession } from '@/lib/auth/sessionStore';
import {
  isSupabaseConfigured,
  signInWithOAuth,
  signOut,
} from '@/lib/supabase';
import {
  isAppMode,
  refreshAppSurface,
} from '@/lib/appMode';
import { PremiumPlanPanel } from '@/components/PremiumPlanModal';
import {
  daysUntil,
  getAllExamDates,
  getUpcomingPresets,
  setExamDate,
} from './examDate';

interface Props {
  onExit: () => void;
  embedded?: boolean;
}

const SUBJECT_LABEL: Record<Subject, string> = {
  adsp: 'ADSP',
  sqld: 'SQLD',
};

type SettingsSection = 'home' | 'account' | 'plan' | 'theme' | 'exams';

interface SectionMeta {
  eyebrow: string;
  title: string;
  subtitle: string;
}

const SECTION_META: Record<SettingsSection, SectionMeta> = {
  home: {
    eyebrow: 'Settings',
    title: '설정',
    subtitle: '계정·요금제·테마·시험일 관리.',
  },
  account: {
    eyebrow: 'Account',
    title: '계정',
    subtitle: '로그인과 동기화 상태를 관리합니다.',
  },
  plan: {
    eyebrow: 'Plan',
    title: '요금제',
    subtitle: '현재 플랜과 업그레이드를 확인합니다.',
  },
  theme: {
    eyebrow: 'Theme',
    title: '배경 테마',
    subtitle: '앱 전체 배경 스타일을 선택합니다.',
  },
  exams: {
    eyebrow: 'Exam Dates',
    title: '시험일',
    subtitle: '자격증별 D-Day를 설정합니다.',
  },
};

export default function SettingsPage({ onExit, embedded = false }: Props) {
  const [examDates, setExamDatesState] = useState(() => getAllExamDates());
  const [activeSection, setActiveSection] = useState<SettingsSection>('home');
  const currentTheme = useTheme();
  const energy = useEnergy();
  const auth = useAuthSession();
  const [switchingAccount, setSwitchingAccount] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const meta = SECTION_META[activeSection];
  const appMode = isAppMode();
  const planLabel = energy.isPremium || energy.isAdmin ? 'MAX' : 'Free';
  const isSignedIn = Boolean(auth.session?.user.email);
  const accountLabel =
    auth.session?.user.email ?? (auth.status === 'checking' ? '확인 중' : '로그인 필요');
  const examSummary = useMemo(() => {
    const configured = (['adsp', 'sqld'] as const).filter(
      (subject) => !!examDates[subject],
    ).length;
    return configured > 0 ? `${configured}개 설정됨` : '미설정';
  }, [examDates]);

  const handleExamDateChange = (subject: Subject, ymd: string) => {
    setExamDate(subject, ymd || null);
    setExamDatesState(getAllExamDates());
  };

  return (
    <ScreenShell
      eyebrow={meta.eyebrow}
      title={meta.title}
      subtitle={meta.subtitle}
      onExit={activeSection === 'home' ? onExit : () => setActiveSection('home')}
      exitLabel={activeSection === 'home' ? (embedded ? '닫기' : '돌아가기') : '설정으로'}
      ambient={embedded ? null : <PageAmbientBg />}
      transparentBg={embedded}
      compact={embedded}
    >
      {embedded ? null : <MobileTopBar />}
      {embedded ? null : <div className="md:hidden h-14" aria-hidden />}

      {activeSection === 'home' ? (
        <SettingsHome
          accountLabel={accountLabel}
          planLabel={planLabel}
          themeLabel={currentTheme.label}
          examSummary={examSummary}
          switchingAccount={switchingAccount}
          loggingOut={loggingOut}
          canLogout={isSignedIn}
          onSwitchAccount={async () => {
            if (switchingAccount || !isSupabaseConfigured()) return;
            setSwitchingAccount(true);
            try {
              await signOut();
              const result = await signInWithOAuth('google');
              if ((result as { error?: unknown })?.error) {
                setSwitchingAccount(false);
                window.alert('계정 전환을 시작하지 못했어요. 잠시 뒤 다시 시도해주세요.');
              }
            } catch {
              setSwitchingAccount(false);
              window.alert('계정 전환을 시작하지 못했어요. 잠시 뒤 다시 시도해주세요.');
            }
          }}
          onLogout={async () => {
            if (loggingOut || !isSignedIn) return;
            setLoggingOut(true);
            try {
              await signOut();
            } catch {
              window.alert('로그아웃에 실패했어요. 잠시 뒤 다시 시도해주세요.');
            } finally {
              setLoggingOut(false);
            }
          }}
          showAppRefresh={appMode}
          onRefreshApp={refreshAppSurface}
          onOpen={setActiveSection}
        />
      ) : null}

      {activeSection === 'account' ? <AuthCard /> : null}

      {activeSection === 'plan' ? <PlanSection /> : null}

      {activeSection === 'theme' ? <ThemePicker /> : null}

      {activeSection === 'exams' ? (
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
      ) : null}

      {embedded ? null : <div className="md:hidden h-20" aria-hidden />}
      {/* 설정은 별도 화면 — 5개 탭 중 어느 것도 active 아님 */}
      {embedded ? null : <MobileBottomNav />}
    </ScreenShell>
  );
}

function SettingsHome({
  accountLabel,
  planLabel,
  themeLabel,
  examSummary,
  switchingAccount,
  loggingOut,
  canLogout,
  onSwitchAccount,
  onLogout,
  showAppRefresh,
  onRefreshApp,
  onOpen,
}: {
  accountLabel: string;
  planLabel: string;
  themeLabel: string;
  examSummary: string;
  switchingAccount: boolean;
  loggingOut: boolean;
  canLogout: boolean;
  onSwitchAccount: () => void;
  onLogout: () => void;
  showAppRefresh: boolean;
  onRefreshApp: () => void;
  onOpen: (section: SettingsSection) => void;
}) {
  return (
    <div className="space-y-3">
      <section
        className="rounded-[14px] px-4 py-4"
        style={{
          background: 'rgba(239,244,255,0.075)',
          border: '1px solid rgba(239,244,255,0.08)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="kr-num min-w-0 truncate text-[13px] font-bold text-cream/90">
            {accountLabel}
          </p>
          <span className="kr-num inline-flex h-[20px] min-w-[38px] shrink-0 items-center justify-center rounded-full bg-cream px-2 text-[10.5px] font-black leading-none text-[#010828]">
            {planLabel}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onSwitchAccount}
            disabled={switchingAccount}
            className="kr-body h-8 flex-1 rounded-full px-3 text-[11px] font-bold transition active:scale-[0.98] disabled:opacity-45"
            style={{
              background: 'rgba(239,244,255,0.08)',
              border: '1px solid rgba(239,244,255,0.12)',
              color: 'rgba(239,244,255,0.82)',
            }}
          >
            {switchingAccount ? '전환 중' : '계정 전환하기'}
          </button>
          <button
            type="button"
            onClick={onLogout}
            disabled={!canLogout || loggingOut}
            className="kr-body inline-flex h-8 min-w-[86px] items-center justify-center gap-1.5 rounded-full px-3 text-[11px] font-bold transition active:scale-[0.98] disabled:opacity-40"
            style={{
              background: 'rgba(239,244,255,0.06)',
              border: '1px solid rgba(239,244,255,0.12)',
              color: 'rgba(239,244,255,0.78)',
            }}
          >
            <LogOut size={12} strokeWidth={2.35} />
            {loggingOut ? '처리 중' : '로그아웃'}
          </button>
        </div>
      </section>

      <SettingsGroup>
        <SettingsRow
          icon={UserRound}
          title="계정"
          value={accountLabel}
          onClick={() => onOpen('account')}
        />
        <SettingsRow
          icon={CreditCard}
          title="요금제"
          value={planLabel}
          onClick={() => onOpen('plan')}
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          icon={Palette}
          title="배경 테마"
          value={themeLabel}
          onClick={() => onOpen('theme')}
        />
        <SettingsRow
          icon={CalendarClock}
          title="시험일"
          value={examSummary}
          onClick={() => onOpen('exams')}
        />
      </SettingsGroup>

      {showAppRefresh ? (
        <SettingsGroup>
          <SettingsRow
            icon={RefreshCw}
            title="앱 새로고침"
            value="최신 상태로 다시 불러오기"
            onClick={onRefreshApp}
          />
        </SettingsGroup>
      ) : null}

    </div>
  );
}

function SettingsGroup({ children }: { children: ReactNode }) {
  return (
    <section
      className="overflow-hidden rounded-[14px]"
      style={{
        background: 'rgba(239,244,255,0.075)',
        border: '1px solid rgba(239,244,255,0.08)',
      }}
    >
      {children}
    </section>
  );
}

function SettingsRow({
  icon: Icon,
  title,
  value,
  danger = false,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  value?: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-cream/8 px-3.5 py-4 text-left transition active:scale-[0.995] last:border-b-0 hover:bg-cream/[0.035]"
    >
      <Icon
        size={19}
        strokeWidth={2.1}
        className={danger ? 'text-red-300/80' : 'text-cream/82'}
      />
      <span className="min-w-0 flex-1">
        <span className={`kr-body block text-[14px] font-bold ${danger ? 'text-red-200/90' : 'text-cream/90'}`}>
          {title}
        </span>
        {value ? (
          <span className="kr-body mt-0.5 block truncate text-[11.5px] font-medium text-cream/48">
            {value}
          </span>
        ) : null}
      </span>
      <ChevronRight size={17} strokeWidth={2.2} className="shrink-0 text-cream/34" />
    </button>
  );
}

function PlanSection() {
  return <PremiumPlanPanel embedded />;
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

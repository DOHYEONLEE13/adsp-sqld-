/**
 * MobileGameNav — 게임 내 상/하단 바.
 *
 * 듀오링고 스타일: 상단에 과목 뱃지·통계(스트릭·XP·레벨), 하단에 4-탭 내비게이션.
 * 모바일·태블릿·데스크탑 모두 동일하게 노출 (이전엔 `md:hidden` 으로 모바일 전용이었으나
 * PC 사용자도 재화·내비 보이게 통일). 데스크탑에선 max-width 와 좌우 여백을 두어
 * 가운데 정렬된 narrow bar 로 표시.
 *
 * 통계 의미:
 * - 🔥 streak — 연속 플레이 일수
 * - XP totalXp — 누적 경험치 (탭 → 공유 다이얼로그)
 * - ⚡ level — 현재 레벨
 */

import { Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, type ComponentType } from 'react';
import {
  BookTabIcon,
  FlagTabIcon,
  TrophyTabIcon,
  UserTabIcon,
  FlameTabIcon,
  type TabIconProps,
} from '@/components/nav/TabIcons';
import type { Subject } from '@/types/question';
import { useProgress } from '../useProgress';
import { computePlayerStats } from '../rpg';
import EnergyBadge from './EnergyBadge';
import Ques from '@/components/mascot/Ques';
import { useMyProfile } from '@/data/profile';
import { usePassSnapshot } from '../passSync';
import PassTierBadge from '@/components/passes/PassTierBadge';
import ProfileSyncSkeleton from '@/components/profile/ProfileSyncSkeleton';
import SubjectBadge from './SubjectBadge';
import SubjectSwitcher from './SubjectSwitcher';
import SubjectSwitchToast from './SubjectSwitchToast';
import { loadOnboardingResult } from '../onboarding/onboardingStorage';

const SUBJECT_ACCENT: Record<Subject, string> = {
  adsp: '#67e8f9',
  sqld: '#c084fc',
};


// ---------------------------------------------------------------- Top Bar

interface TopProps {
  /** 현재 화면의 과목. 좌측 뱃지 색·글자 결정. 미지정 시 프로필 모드. */
  subject?: Subject;
}

export function MobileTopBar({ subject }: TopProps) {
  const progress = useProgress();
  const stats = computePlayerStats(progress);
  const [shareOpen, setShareOpen] = useState(false);
  // 방안 S (2026-05-07) — useMyProfile (useSyncExternalStore) 로 race condition 해소.
  // 이전 useState + subscribeProfile 패턴은 first render 와 listener 부착 race 로 stale stuck.
  const profile = useMyProfile();
  const passSnap = usePassSnapshot();

  // 사용자 흐름 폴리시 — 좌측 상단 마스코트 옆 과목 배지 + 전환 모달.
  // 활성 과목 = props.subject 우선, 없으면 progress.activeSubject, 없으면 onboarding.exams[0].
  const onboarding = loadOnboardingResult();
  const activeSubject: Subject | null =
    subject ??
    progress.activeSubject ??
    onboarding?.exams[0] ??
    null;
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [toastSubject, setToastSubject] = useState<Subject | null>(null);

  const handleShare = async () => {
    const subj = subject ? subject.toUpperCase() : 'QuestDP';
    const text = `QuestDP — ${subj} 진도\n레벨 ${stats.level} · XP ${stats.totalXp}\n나도 도전해봐!`;
    const shareData = { title: 'QuestDP 진도', text, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      /* user cancelled or share failed — fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      setShareOpen(true);
      window.setTimeout(() => setShareOpen(false), 2200);
    } catch {
      window.alert(text);
    }
  };

  const badgeLabel = subject
    ? `${subject.toUpperCase()} 과목 — 프로필 열기`
    : '프로필 열기';

  return (
    <div
      className="fixed top-0 left-0 right-0 z-30"
      style={{
        background: 'rgba(20,32,46,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(239,244,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-2 max-w-[1200px] mx-auto md:px-6 lg:px-10">
        {/*
          좌측 영역: 마스코트 + 닉네임 (#/stats) + 과목 배지 (SubjectSwitcher).
          마스코트/닉네임 button 안에 또 다른 button 을 넣으면 nested button 에러가
          발생하므로 SubjectBadge 는 별도 형제로 둠.
        */}
        <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={() => {
            window.location.hash = '/stats';
          }}
          className="inline-flex items-center gap-2 min-w-0 transition active:scale-[0.97] hover:opacity-90"
          aria-label={badgeLabel}
        >
          <span className="shrink-0 inline-flex items-center justify-center w-10 h-10">
            <Ques
              pose={profile.avatarPose}
              character={profile.avatarCharacter}
              size={40}
              animated={false}
            />
          </span>
          {(() => {
            // 인증된 상태에서 server pull 결과 도착 전 — skeleton 노출
            if (profile.pendingServerSync) {
              return (
                <div className="flex flex-col items-start min-w-0">
                  <ProfileSyncSkeleton
                    width="w-20"
                    failed={profile.syncStatus === 'failed'}
                  />
                </div>
              );
            }
            const isUnset =
              !profile.displayName || profile.displayName === profile.tag;
            return (
              <div className="flex flex-col items-start min-w-0">
                <span
                  className="kr-num text-[13px] truncate max-w-[110px] text-left"
                  style={{
                    color: isUnset
                      ? 'var(--neon-85)'
                      : 'var(--cream)',
                  }}
                  title={isUnset ? '닉네임 설정하기' : profile.displayName}
                >
                  {isUnset ? '닉네임 설정' : profile.displayName}
                </span>
                {!isUnset && passSnap.authed ? (
                  <PassTierBadge
                    tier={passSnap.tier}
                    size="xs"
                    className="mt-0.5"
                  />
                ) : null}
              </div>
            );
          })()}
        </button>
        {/* 과목 배지 — 클릭 시 SubjectSwitcher. 활성 과목 없으면 미노출. */}
        {activeSubject ? (
          <SubjectBadge
            subject={activeSubject}
            onClick={() => setSwitcherOpen(true)}
          />
        ) : null}
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          {/* 순서: XP · 에너지 · 설정 (가장 오른쪽 끝). PlanTag 는 사용자 결정으로 제거. */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="XP 공유하기"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full transition active:scale-95"
            style={{
              background: 'rgba(255,176,32,0.16)',
              border: '1px solid rgba(255,176,32,0.5)',
            }}
          >
            <span
              className="kr-num text-[10px] tracking-wider"
              style={{ color: '#FFB020' }}
            >
              XP
            </span>
            <span
              className="kr-num text-[13px]"
              style={{ color: '#FFB020' }}
            >
              {stats.totalXp}
            </span>
          </button>
          <EnergyBadge size="sm" />
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.hash = '/settings';
              }
            }}
            aria-label="설정 열기"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full transition active:scale-95 hover:opacity-80"
            style={{
              background: 'rgba(239,244,255,0.06)',
              border: '1px solid rgba(239,244,255,0.18)',
            }}
          >
            <SettingsIcon
              size={16}
              strokeWidth={2.2}
              style={{ color: 'rgba(239,244,255,0.85)' }}
            />
          </button>
        </div>
      </div>
      {shareOpen ? (
        <div
          role="status"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 rounded-lg kr-body text-[12px]"
          style={{
            background: 'rgba(20,32,46,0.96)',
            color: '#FFB020',
            border: '1px solid rgba(255,176,32,0.4)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
          }}
        >
          진도 텍스트 복사됨!
        </div>
      ) : null}
      {/* 과목 전환 모달 */}
      {switcherOpen ? (
        <SubjectSwitcher
          current={activeSubject}
          onClose={() => setSwitcherOpen(false)}
          onSwitched={(newSubject) => {
            setToastSubject(newSubject);
            // 다음 화면 진입 — 학습 탭(galaxy chooser X, planet 직진)
            window.location.hash = `/game/${newSubject}`;
          }}
        />
      ) : null}
      {/* 과목 전환 인사 toast */}
      {toastSubject ? (
        <SubjectSwitchToast
          subject={toastSubject}
          onDismiss={() => setToastSubject(null)}
        />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------- Bottom Nav

export type MobileNavTab = 'learn' | 'quests' | 'weakness' | 'trophy' | 'profile';

interface BottomProps {
  /**
   * 현재 활성 탭 — 강조 표시. undefined 면 어떤 탭도 강조 안 됨 (예: 설정 페이지).
   */
  active?: MobileNavTab;
  /** Learn 탭 콜백. 보통 현재 탭이라 no-op. */
  onLearn?: () => void;
  /** Quests 탭 콜백 — 일일 미션 트리거 등. */
  onQuests?: () => void;
  /** 활성 탭의 강조 색. 과목별 톤 사용 가능. */
  accent?: string;
}

export function MobileBottomNav({
  active,
  onLearn,
  onQuests,
  accent = SUBJECT_ACCENT.adsp,
}: BottomProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30"
      style={{
        background: 'rgba(20,32,46,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(239,244,255,0.08)',
      }}
    >
      {/*
        Phase 4 Step 5 — 5번째 슬롯 '진행도' 추가. grid-cols-4 → grid-cols-5.
        iPhone SE (375px) 기준 슬롯 폭 75px — 한글 3자 라벨 (퀘스트/진행도/프로필)
        모두 잘림 없이 표시 가능 (10.5px 폰트 × 3자 ≈ 33px).
      */}
      <div className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)] max-w-[1200px] mx-auto">
        <Tab
          tab="learn"
          active={active}
          accent={accent}
          Icon={BookTabIcon}
          label="학습"
          onClick={() => {
            if (onLearn) {
              onLearn();
            } else {
              window.location.hash = '/game';
            }
          }}
        />
        <Tab
          tab="quests"
          active={active}
          accent={accent}
          Icon={FlagTabIcon}
          label="퀘스트"
          onClick={() => {
            if (onQuests) {
              onQuests();
            } else {
              window.location.hash = '/quests';
            }
          }}
        />
        <Tab
          tab="weakness"
          active={active}
          accent={accent}
          Icon={FlameTabIcon}
          label="나의 약점"
          onClick={() => {
            window.location.hash = '/weakness';
          }}
        />
        <Tab
          tab="trophy"
          active={active}
          accent={accent}
          Icon={TrophyTabIcon}
          label="친구"
          onClick={() => {
            window.location.hash = '/friends';
          }}
        />
        <Tab
          tab="profile"
          active={active}
          accent={accent}
          Icon={UserTabIcon}
          label="프로필"
          onClick={() => {
            window.location.hash = '/stats';
          }}
        />
      </div>
    </nav>
  );
}

/**
 * Tab — 도우어듀오 톤 microinteraction + 3D 아이콘.
 *
 * 비활성 → 활성 전환:
 *  1) translateY(0 → -4px) + scale(1 → 1.08) spring (살짝 위로 떠오름)
 *  2) 3D pill 배경: radial 하이라이트 + 외부 glow + inset 깊이감
 *  3) 아이콘 자체 변화 — strokeWidth 2 → 2.4 + fill 추가 (outline → 살짝 채워짐)
 *  4) 라벨 굵기 500 → 700
 * Press: whileTap scale 0.92 (CSS active 보다 GPU 가속 spring).
 * Spring 톤: stiffness 400 / damping 17 — EnergyBlockModal·Ques 와 통일.
 *
 * 색상은 prop accent — 과목 톤 (adsp 청록 / sqld 보라) 자동 반영.
 */
function Tab({
  tab,
  active,
  accent,
  Icon,
  label,
  onClick,
}: {
  tab: MobileNavTab;
  active: MobileNavTab | undefined;
  accent: string;
  /**
   * 단일-path filled 실루엣 아이콘. lucide 아닌 src/components/nav/TabIcons 의
   * 커스텀 컴포넌트만 사용. fill='currentColor' 라 button 의 color 가 자동 반영.
   */
  Icon: ComponentType<TabIconProps>;
  label: string;
  onClick?: () => void;
}) {
  const isActive = tab === active;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      className="relative flex flex-col items-center justify-center py-2.5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
      style={{
        color: isActive ? accent : 'rgba(239,244,255,0.42)',
      }}
    >
      {/* 아이콘 영역 — 3D pill 배경 + spring */}
      <motion.span
        className="relative inline-flex items-center justify-center w-14 h-9"
        animate={{
          y: isActive ? -4 : 0,
          scale: isActive ? 1.08 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        whileTap={{ scale: 0.92 }}
      >
        {/* ── 3D pill 배경 (활성 시) ────────────────────────────────────────
            CLAUDE.md "3D 버튼 패턴" 의 미니어처 버전:
              - radial-gradient 상단 highlight (8% white)
              - linear-gradient 본체 (accent 계열 12-22% alpha)
              - 외부 glow (box-shadow 0 0 14px accent/40%)
              - inset 1px 위쪽 highlight + inset -2px 아래쪽 그림자 → 깊이감
            결과: 단순 alpha 배경 → "솟아오른 알약" 으로 보임. */}
        {isActive && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              background: `
                radial-gradient(circle at 50% 0%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 55%),
                linear-gradient(180deg, ${accent}30 0%, ${accent}1a 100%)
              `,
              boxShadow: `
                0 0 14px ${accent}55,
                inset 0 1px 0 rgba(255,255,255,0.12),
                inset 0 -2px 0 rgba(0,0,0,0.18)
              `,
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          />
        )}
        {/* ── 아이콘 — 단일 path filled 실루엣 ────────────────────────────
            stroke 0 → path join/overlap 이 발생하지 않음. 따라서 비활성 (흐릿)
            상태에서도 "선이 이어붙은 듯한 조잡함" 이 사라짐.
            활성/비활성은 색상만 다름 — 부모 button 의 color 를 currentColor 로 받음.
            활성 시 drop-shadow 로 살짝 떠오른 느낌. */}
        <Icon
          size={26}
          className="relative z-10"
          style={{
            filter: isActive ? `drop-shadow(0 1px 2px ${accent}66)` : 'none',
          }}
        />
      </motion.span>

      {/* 라벨 — 항상 노출. 활성 시 굵기 ↑ */}
      <motion.span
        className="kr-num text-[10.5px] mt-1 leading-none tracking-[0.02em]"
        style={{
          fontWeight: isActive ? 700 : 500,
        }}
        animate={{
          y: isActive ? -2 : 0,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {label}
      </motion.span>
    </button>
  );
}

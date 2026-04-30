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

import {
  Flame,
  Zap,
  Map,
  Flag,
  Trophy,
  User,
  Infinity as InfinityIcon,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import type { Subject } from '@/types/question';
import { useProgress } from '../useProgress';
import { computePlayerStats } from '../rpg';
import { useEnergy } from '../energy';
import Ques from '@/components/mascot/Ques';
import {
  getMyProfile,
  subscribeProfile,
  type MyProfile,
} from '@/data/profile';
import { usePassSnapshot } from '../passSync';
import PassTierBadge from '@/components/passes/PassTierBadge';
import ProfileSyncSkeleton from '@/components/profile/ProfileSyncSkeleton';

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
  const energy = useEnergy();
  const [shareOpen, setShareOpen] = useState(false);
  const [profile, setProfile] = useState<MyProfile>(() => getMyProfile());
  const passSnap = usePassSnapshot();
  useEffect(() => {
    const unsub = subscribeProfile(() => setProfile(getMyProfile()));
    return () => {
      unsub();
    };
  }, []);

  const handleShare = async () => {
    const subj = subject ? subject.toUpperCase() : 'QuestDP';
    const text = `QuestDP — ${subj} 진도\n레벨 ${stats.level} · XP ${stats.totalXp} · ${stats.streakDays}일 연속\n나도 도전해봐!`;
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
        <button
          type="button"
          onClick={() => {
            window.location.hash = '/stats';
          }}
          className="inline-flex items-center gap-2 min-w-0 transition active:scale-[0.97] hover:opacity-90"
          aria-label={badgeLabel}
        >
          <span className="shrink-0 inline-flex items-center justify-center w-10 h-10">
            <Ques pose={profile.avatarPose} size={40} animated={false} />
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
                      ? 'rgba(111,255,0,0.85)'
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
        <div className="flex items-center gap-4">
          <Stat
            icon={<Flame size={20} fill="#cbd5e1" strokeWidth={0} />}
            value={stats.streakDays}
            color="#cbd5e1"
          />
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
          {energy.isPremium ? (
            <span
              className="inline-flex items-center gap-1"
              title="프리미엄 — ⚡ 무제한"
            >
              <InfinityIcon size={20} className="text-[#A78BFA]" strokeWidth={2.4} />
              <Zap size={16} fill="#A78BFA" strokeWidth={0} />
            </span>
          ) : (
            <Stat
              icon={<Zap size={20} fill="#A78BFA" strokeWidth={0} />}
              value={energy.energy}
              color="#A78BFA"
            />
          )}
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
    </div>
  );
}

function Stat({
  icon,
  value,
  color,
}: {
  icon: ReactNode;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="kr-num text-[13px]" style={{ color }}>
        {value}
      </span>
      {icon}
    </div>
  );
}

// ---------------------------------------------------------------- Bottom Nav

export type MobileNavTab = 'learn' | 'quests' | 'trophy' | 'profile';

interface BottomProps {
  /** 현재 활성 탭 — 강조 표시. */
  active: MobileNavTab;
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
      <div className="grid grid-cols-4 pb-[env(safe-area-inset-bottom)] max-w-[1200px] mx-auto">
        <Tab
          tab="learn"
          active={active}
          accent={accent}
          Icon={Map}
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
          Icon={Flag}
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
          tab="trophy"
          active={active}
          accent={accent}
          Icon={Trophy}
          label="친구"
          onClick={() => {
            window.location.hash = '/friends';
          }}
        />
        <Tab
          tab="profile"
          active={active}
          accent={accent}
          Icon={User}
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
  active: MobileNavTab;
  accent: string;
  /** lucide 아이콘 컴포넌트. 활성 여부에 따라 fill·strokeWidth 가 동적으로 바뀜. */
  Icon: LucideIcon;
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
        {/* ── 아이콘 — 활성 시 fill + strokeWidth ↑ ────────────────────────
            도우어듀오 트릭: lucide outline 만 써도 fill 색을 살짝 더하면
            "outline → 살짝 채워짐" 으로 자연스럽게 morph. */}
        <Icon
          size={26}
          strokeWidth={isActive ? 2.4 : 2}
          fill={isActive ? `${accent}33` : 'none'}
          className="relative z-10"
          style={{
            // strokeLinecap·Join 은 lucide 기본값 (round). 추가 처리 X.
            // active 시 살짝 위로 더 들리는 느낌 — drop-shadow 로.
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

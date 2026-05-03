/**
 * FriendsPage — 친구 경쟁 / 진행상황 보드.
 *
 * 흐름:
 *  1. 내 태그 — 클릭하면 클립보드 복사, 친구에게 전달.
 *  2. 친구 추가 — 태그 입력 → 검증 → 로컬 추가.
 *  3. 친구 리더보드 — XP 내림차순. 현재는 placeholder 스냅샷.
 *
 * 서버 없을 때의 한계와 향후 Supabase 연동 후 라이브 갱신 메시지를
 * UI 에 명시해 사용자에게 기대치를 맞춤.
 */

import { useEffect, useMemo, useState } from 'react';
import { Copy, LogIn, Trash2, UserPlus, Trophy, Zap, Flame, ArrowUpDown } from 'lucide-react';
import ScreenShell from './components/ScreenShell';
import { MobileBottomNav, MobileTopBar } from './components/MobileGameNav';
import PageAmbientBg from './components/PageAmbientBg';
import { useProgress } from './useProgress';
import { computePlayerStats } from './rpg';
import Ques from '@/components/mascot/Ques';
import type { QuesPose } from '@/components/mascot/types';
import { usePassSnapshot } from './passSync';
import ProfileSyncSkeleton from '@/components/profile/ProfileSyncSkeleton';
import {
  PASS_TIER_VISUAL,
  PASS_TIER_ORDER,
  type PassTier,
} from '@/types/passes';
import PassTierBadge from '@/components/passes/PassTierBadge';
import {
  getSupabase,
  isSupabaseConfigured,
  onAuthStateChange,
  signInWithOAuth,
} from '@/lib/supabase';
import {
  getMyProfile,
  setDisplayName,
  isValidTag,
  normalizeTag,
  formatTagInput,
  subscribeProfile,
  type MyProfile,
} from '@/data/profile';
import {
  addFriend,
  listFriends,
  removeFriend,
  subscribeFriends,
  type FriendEntry,
} from '@/data/friends';

interface Props {
  onExit: () => void;
}

export default function FriendsPage({ onExit }: Props) {
  const progress = useProgress();
  const playerStats = useMemo(() => computePlayerStats(progress), [progress]);

  // 프로필 — 컴포넌트 마운트 시 한 번 생성·로드. subscribe 로 변경 추적.
  const [me, setMe] = useState<MyProfile>(() => getMyProfile());
  useEffect(() => {
    const unsub = subscribeProfile(() => setMe(getMyProfile()));
    return () => {
      unsub();
    };
  }, []);

  const [friends, setFriends] = useState<FriendEntry[]>(() => listFriends());
  useEffect(() => {
    const unsub = subscribeFriends(() => setFriends(listFriends()));
    return () => {
      unsub();
    };
  }, []);

  // auth 상태 — 로그인 여부에 따라 안내 문구·기능 달라짐
  const [isSignedIn, setIsSignedIn] = useState(false);
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setIsSignedIn(!!data.session));
    const unsub = onAuthStateChange((_e, s) => setIsSignedIn(!!s));
    return () => {
      unsub();
    };
  }, []);

  // 정렬 기준 — 4종 토글
  type SortKey = 'tier' | 'xp' | 'streak' | 'recent';
  const [sortKey, setSortKey] = useState<SortKey>('tier');
  const passSnap = usePassSnapshot();

  // 내 진행상황도 리더보드에 합산해 보여주려고 합성.
  const board = useMemo(() => {
    const myRow = {
      tag: me.tag,
      displayName: me.displayName || me.tag,
      avatarPose: me.avatarPose,
      level: playerStats.level,
      totalXp: playerStats.totalXp,
      streakDays: playerStats.streakDays,
      lastSeenAt: Date.now(),
      passTier: passSnap.tier,
      isMe: true as const,
    };
    const others = friends.map((f) => ({
      tag: f.tag,
      displayName: f.displayName,
      avatarPose: f.avatarPose,
      level: f.level,
      totalXp: f.totalXp,
      streakDays: f.streakDays,
      lastSeenAt: f.lastSeenAt,
      passTier: f.passTier,
      isMe: false as const,
    }));
    const all = [myRow, ...others];
    const tierRank = (t: PassTier) => PASS_TIER_ORDER.indexOf(t);
    return all.sort((a, b) => {
      switch (sortKey) {
      case 'tier': {
        const tr = tierRank(b.passTier) - tierRank(a.passTier);
        if (tr !== 0) return tr;
        return b.totalXp - a.totalXp;
      }
      case 'streak':
        return b.streakDays - a.streakDays || b.totalXp - a.totalXp;
      case 'recent':
        return b.lastSeenAt - a.lastSeenAt;
      case 'xp':
      default:
        return b.totalXp - a.totalXp;
      }
    });
  }, [me, playerStats, friends, sortKey, passSnap.tier]);

  return (
    <ScreenShell
      eyebrow="Friends"
      title="친구 경쟁"
      subtitle="태그를 공유하면 친구를 추가하고 서로의 XP·레벨·연속 일수를 비교할 수 있어요."
      onExit={onExit}
      exitLabel="돌아가기"
      ambient={<PageAmbientBg />}
    >
      {/* 모바일 상단 내비 — 닉네임/요금제/streak/XP/⚡ 통합 (다른 탭과 일관) */}
      <MobileTopBar />
      <div className="md:hidden h-14" aria-hidden />

      <MyTagCard
        profile={me}
        onRename={(n) => {
          const result = setDisplayName(n);
          if (!result.ok && result.reason === 'sync-not-ready') {
            window.alert('프로필 동기화가 완료되지 않았어요. 잠시 후 다시 시도해주세요.');
          }
        }}
      />

      {/* AddFriendCard 게이트:
          1) 게스트 (미인증) — 비노출. 로그인 후 활성화 (MyTagCard 가 안내).
          2) sync 중 (myTag === '') — 비노출. skeleton 만.
          3) ready — 노출. */}
      {me.isAuthenticated && !me.pendingServerSync && me.tag !== '' ? (
        <AddFriendCard myTag={me.tag} />
      ) : null}

      <Leaderboard rows={board} sortKey={sortKey} onChangeSort={setSortKey} />

      {isSignedIn ? (
        <p className="kr-body text-[12px] text-cream/55 mt-4 leading-[1.65]">
          ✨ 친구가 풀이를 진행하면 리더보드가 실시간으로 갱신돼요.
        </p>
      ) : isSupabaseConfigured() ? (
        <p className="kr-body text-[12px] text-cream/55 mt-4 leading-[1.65]">
          ※ 게스트 모드 — 친구 시스템은 로그인 후 활성화돼요. 위 카드의
          [Google 로그인] 으로 고유 태그를 발급받고 친구 진도를 비교해보세요.
        </p>
      ) : (
        <p className="kr-body text-[12px] text-cream/55 mt-4 leading-[1.65]">
          ※ 로컬 미리보기 — 친구 진도는 Supabase 환경 변수 설정 후 활성화됩니다.
        </p>
      )}

      <div className="md:hidden h-20" aria-hidden />
      <MobileBottomNav active="trophy" />
    </ScreenShell>
  );
}

// ────────────────────────────────────────────────────────── My Tag

function MyTagCard({
  profile,
  onRename,
}: {
  profile: MyProfile;
  onRename: (name: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile.displayName);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => setDraft(profile.displayName), [profile.displayName]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profile.tag);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('아래 태그를 복사하세요', profile.tag);
    }
  };

  const handleLogin = async () => {
    if (authLoading) return;
    setAuthLoading(true);
    const result = await signInWithOAuth('google');
    if ((result as { error?: unknown })?.error) {
      window.alert('로그인 실패. 잠시 후 다시 시도해주세요.');
      setAuthLoading(false);
    }
    // 성공 시 OAuth 리다이렉트 — 이 컴포넌트는 unmount.
  };

  // 게스트 (미인증) — 태그·친구 시스템 비활성. 닉네임만 설정 가능 + 로그인 CTA.
  if (!profile.isAuthenticated) {
    return (
      <section
        className="liquid-glass rounded-[24px] p-5 md:p-6 mb-6"
        aria-label="내 프로필"
      >
        <h2 className="kr-heading text-[11px] uppercase tracking-widest text-cream/60 mb-3">
          내 프로필 (게스트)
        </h2>
        <div className="flex flex-col gap-4">
          {/* 닉네임 — guest 도 설정 가능 */}
          <div className="flex items-center gap-2 flex-wrap">
            {editing ? (
              <>
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="닉네임"
                  className="bg-transparent outline-none kr-heading text-[16px] md:text-[18px] border-b border-cream/30 focus:border-neon transition pb-1 min-w-[120px]"
                  style={{ color: 'var(--cream)' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    onRename(draft);
                    setEditing(false);
                  }}
                  className="kr-heading text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full"
                  style={{ background: '#6FFF00', color: '#010828' }}
                >
                  저장
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="kr-heading text-[16px] md:text-[18px] hover:text-neon transition"
                style={{ color: 'var(--cream)' }}
              >
                {profile.displayName || '닉네임 설정'}
                <span className="text-cream/40 text-[12px] ml-2">(이름 변경)</span>
              </button>
            )}
          </div>

          {/* 로그인 CTA — 고유 태그·친구 시스템 활성화 안내.
              lg+ 에서 inner max-width 로 너무 길게 늘어지지 않도록 — "의도된 카드"
              느낌 유지. 너무 와이드하면 메시지 + 버튼 사이 빈 공간이 어색함. */}
          <div
            className="rounded-[16px] p-4 lg:p-5 flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-5 lg:max-w-[720px]"
            style={{
              background: 'rgba(111,255,0,0.06)',
              border: '1px solid rgba(111,255,0,0.22)',
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="kr-body text-[13px] text-cream/85 leading-[1.55]">
                로그인하면 <span className="text-neon">고유 태그</span> 가
                발급되고, 친구를 추가해서 진도를 비교할 수 있어요.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogin}
              disabled={authLoading || !isSupabaseConfigured()}
              className="kr-heading uppercase tracking-widest inline-flex items-center justify-center gap-2 text-[12px] px-4 py-2.5 rounded-full transition active:scale-95 disabled:opacity-40 shrink-0"
              style={{
                background: '#6FFF00',
                color: '#010828',
                boxShadow: '0 6px 18px -4px rgba(111,255,0,0.45)',
              }}
            >
              <LogIn size={13} strokeWidth={2.6} />
              {authLoading ? '이동 중…' : 'Google 로그인'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="liquid-glass rounded-[24px] p-5 md:p-6 mb-6"
      aria-label="내 프로필 태그"
    >
      <h2 className="kr-heading text-[11px] uppercase tracking-widest text-cream/60 mb-3">
        내 태그
      </h2>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          {profile.pendingServerSync ? (
            <ProfileSyncSkeleton
              width="w-44"
              failed={profile.syncStatus === 'failed'}
            />
          ) : editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="표시 이름"
                className="bg-transparent outline-none kr-heading text-[16px] md:text-[18px] border-b border-cream/30 focus:border-neon transition pb-1 min-w-[120px]"
                style={{ color: 'var(--cream)' }}
              />
              <button
                type="button"
                onClick={() => {
                  onRename(draft);
                  setEditing(false);
                }}
                className="kr-heading text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full"
                style={{ background: '#6FFF00', color: '#010828' }}
              >
                저장
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="kr-heading text-[16px] md:text-[18px] hover:text-neon transition"
              style={{ color: 'var(--cream)' }}
            >
              {profile.displayName || '닉네임 설정'}
              <span className="text-cream/40 text-[12px] ml-2">(이름 변경)</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {profile.pendingServerSync ? (
            <ProfileSyncSkeleton
              width="w-32"
              failed={profile.syncStatus === 'failed'}
              showRetry={false}
            />
          ) : (
            <code
              className="kr-num text-[13px] md:text-[14px] px-3 py-2 rounded-lg select-all"
              style={{
                background: 'rgba(255,176,32,0.14)',
                border: '1px solid rgba(255,176,32,0.45)',
                color: '#FFB020',
                letterSpacing: '0.02em',
              }}
            >
              {profile.tag}
            </code>
          )}
          <button
            type="button"
            onClick={handleCopy}
            disabled={profile.pendingServerSync}
            aria-label="태그 복사"
            className="inline-flex items-center gap-1.5 kr-heading text-[11px] uppercase tracking-widest px-3 py-2 rounded-full transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: copied ? '#6FFF00' : 'rgba(111,255,0,0.12)',
              border: `1px solid ${copied ? '#6FFF00' : 'rgba(111,255,0,0.4)'}`,
              color: copied ? '#010828' : '#6FFF00',
            }}
          >
            <Copy size={12} strokeWidth={2.4} />
            {copied ? '복사됨' : '복사'}
          </button>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────── Add friend

function AddFriendCard({ myTag }: { myTag: string }) {
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(
    null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    // try/finally — addFriend 안 어딘가가 hang/throw 해도 submitting 이 영원히
    // true 로 박혀 button 이 잠기는 것 방지. addFriend 자체에도 timeout 안전망이
    // 있지만 외부에서도 한 번 더 보호.
    try {
      const result = await addFriend(tagInput, myTag);
      if (result.ok) {
        setFeedback({ tone: 'ok', msg: '친구 추가 완료!' });
        setTagInput('');
      } else {
        const map: Record<typeof result.reason, string> = {
          invalid: '태그 형식이 올바르지 않아요. 예: Q-XXXX-XXXX',
          self: '본인 태그는 추가할 수 없어요.',
          duplicate: '이미 추가된 친구입니다.',
          not_found: '해당 태그의 사용자를 찾을 수 없어요.',
          unauthenticated: '로그인 후 친구 추가가 가능해요.',
          network: '네트워크 오류 — 잠시 후 다시 시도해주세요.',
        };
        setFeedback({ tone: 'err', msg: map[result.reason] });
      }
    } catch {
      setFeedback({
        tone: 'err',
        msg: '예기치 못한 오류 — 잠시 후 다시 시도해주세요.',
      });
    } finally {
      setSubmitting(false);
    }
    window.setTimeout(() => setFeedback(null), 3200);
  };

  const normalized = normalizeTag(tagInput);
  const isLikelyValid = tagInput.length > 0 && isValidTag(normalized);

  return (
    <section
      className="liquid-glass rounded-[24px] p-5 md:p-6 mb-6"
      aria-label="친구 추가"
    >
      <h2 className="kr-heading text-[11px] uppercase tracking-widest text-cream/60 mb-3 inline-flex items-center gap-2">
        <UserPlus size={14} strokeWidth={2.4} />
        친구 추가
      </h2>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(formatTagInput(e.target.value))}
          placeholder="Q-XXXX-XXXX"
          className="flex-1 min-w-[160px] bg-transparent outline-none kr-num text-[14px] tracking-wider px-3 py-2.5 rounded-lg"
          style={{
            background: 'rgba(239,244,255,0.04)',
            border: '1px solid rgba(239,244,255,0.12)',
            color: 'var(--cream)',
          }}
          aria-label="친구 태그"
          autoCapitalize="characters"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={!isLikelyValid || submitting}
          className="kr-heading uppercase tracking-widest text-[12px] px-4 py-2.5 rounded-full transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: '#6FFF00',
            color: '#010828',
            letterSpacing: '0.16em',
          }}
        >
          {submitting ? '추가 중…' : '추가'}
        </button>
      </form>
      {feedback ? (
        <p
          className="kr-body text-[12px] mt-3"
          style={{
            color: feedback.tone === 'ok' ? '#6FFF00' : '#f87171',
          }}
        >
          {feedback.msg}
        </p>
      ) : null}
    </section>
  );
}

// ────────────────────────────────────────────────────────── Leaderboard

interface BoardRow {
  tag: string;
  displayName: string;
  avatarPose: QuesPose;
  level: number;
  totalXp: number;
  streakDays: number;
  passTier: PassTier;
  isMe: boolean;
}

type SortKey = 'tier' | 'xp' | 'streak' | 'recent';

const SORT_LABEL: Record<SortKey, string> = {
  tier: 'Tier 순',
  xp: 'XP 순',
  streak: '연속일 순',
  recent: '최근 활동',
};

function Leaderboard({
  rows,
  sortKey,
  onChangeSort,
}: {
  rows: BoardRow[];
  sortKey: SortKey;
  onChangeSort: (k: SortKey) => void;
}) {
  return (
    <section
      className="liquid-glass rounded-[24px] p-5 md:p-6"
      aria-label="친구 리더보드"
    >
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h2 className="kr-heading text-[13px] uppercase tracking-widest text-cream/70 inline-flex items-center gap-2">
          <Trophy size={14} strokeWidth={2.4} />
          리더보드
        </h2>
        <div className="inline-flex items-center gap-1 flex-wrap">
          <ArrowUpDown size={11} className="text-cream/45" />
          {(['tier', 'xp', 'streak', 'recent'] as SortKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => onChangeSort(k)}
              className="kr-num text-[10px] uppercase tracking-widest px-2 py-1 rounded-full transition active:scale-[0.97]"
              style={{
                background:
                  sortKey === k ? 'rgba(111,255,0,0.14)' : 'rgba(239,244,255,0.04)',
                border:
                  sortKey === k
                    ? '1px solid rgba(111,255,0,0.45)'
                    : '1px solid rgba(239,244,255,0.10)',
                color: sortKey === k ? '#6FFF00' : 'rgba(239,244,255,0.55)',
              }}
            >
              {SORT_LABEL[k]}
            </button>
          ))}
        </div>
      </div>

      <ol className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3">
        {rows.map((row, idx) => (
          <li
            key={row.tag}
            className="rounded-[14px] px-4 py-3 flex items-center gap-3 relative overflow-hidden"
            style={{
              background: row.isMe
                ? 'rgba(111,255,0,0.08)'
                : 'rgba(239,244,255,0.04)',
              border: row.isMe
                ? '1px solid rgba(111,255,0,0.35)'
                : '1px solid rgba(239,244,255,0.06)',
            }}
          >
            {/* Tier vertical accent — 좌측 4px 띠 */}
            <span
              aria-hidden
              className="absolute left-0 top-0 bottom-0"
              style={{
                width: 4,
                background: PASS_TIER_VISUAL[row.passTier].color,
                opacity: row.passTier === 'bronze' ? 0.3 : 0.85,
                boxShadow: row.passTier !== 'bronze' ? `0 0 8px ${PASS_TIER_VISUAL[row.passTier].glow}` : undefined,
              }}
            />
            <span
              className="shrink-0 w-7 h-7 rounded-full inline-flex items-center justify-center kr-num text-[12px]"
              style={{
                background:
                  idx === 0
                    ? '#FFB020'
                    : idx === 1
                      ? 'rgba(239,244,255,0.85)'
                      : idx === 2
                        ? '#cd7f32'
                        : 'rgba(239,244,255,0.12)',
                color:
                  idx <= 2 ? '#010828' : 'rgba(239,244,255,0.7)',
              }}
            >
              {idx + 1}
            </span>
            {/* 아바타 — 친구가 고른 Ques 포즈 */}
            <span
              aria-hidden
              className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full overflow-hidden"
              style={{
                background: row.isMe
                  ? 'rgba(111,255,0,0.14)'
                  : 'rgba(253,128,46,0.14)',
                border: row.isMe
                  ? '1.5px solid rgba(111,255,0,0.45)'
                  : '1.5px solid rgba(253,128,46,0.4)',
              }}
            >
              <Ques pose={row.avatarPose} size={36} animated={false} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="kr-body text-[13px] font-medium truncate text-cream">
                  {row.displayName}
                </span>
                {row.isMe ? (
                  <span
                    className="kr-num text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: '#6FFF00', color: '#010828' }}
                  >
                    나
                  </span>
                ) : null}
                <PassTierBadge tier={row.passTier} size="xs" />
              </div>
              <div className="flex items-center gap-2 kr-num text-[10px] text-cream/55 mt-0.5 flex-nowrap whitespace-nowrap">
                <span className="inline-flex items-center gap-1 shrink-0">
                  <Zap size={10} fill="#A78BFA" strokeWidth={0} />
                  Lv. {row.level}
                </span>
                <span className="text-cream/25 shrink-0">·</span>
                <span className="inline-flex items-center gap-1 shrink-0">
                  <Flame size={10} fill="#cbd5e1" strokeWidth={0} />
                  {row.streakDays}일
                </span>
                <span className="text-cream/25 shrink-0 hidden sm:inline">·</span>
                <span
                  className="kr-num text-[10px] tracking-wider truncate hidden sm:inline-block"
                  style={{ color: 'rgba(239,244,255,0.4)' }}
                  title={row.tag}
                >
                  {row.tag}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div
                className="kr-num text-[15px]"
                style={{ color: '#FFB020' }}
              >
                {row.totalXp.toLocaleString()}
              </div>
              <div
                className="kr-num text-[9px] uppercase tracking-widest"
                style={{ color: 'rgba(239,244,255,0.45)' }}
              >
                XP
              </div>
            </div>
            {!row.isMe ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`${row.displayName} 을(를) 친구에서 제거할까요?`)) {
                    removeFriend(row.tag);
                  }
                }}
                aria-label={`${row.displayName} 제거`}
                className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full transition opacity-50 hover:opacity-100 hover:bg-red-500/10"
                style={{ color: '#f87171' }}
              >
                <Trash2 size={12} strokeWidth={2.4} />
              </button>
            ) : null}
          </li>
        ))}

        {/*
          데스크톱 placeholder — 친구 적을 때 빈 슬롯이 시각적으로 공허해지는
          것 방지. lg+ grid (2-col) 기준 슬롯이 비면 "친구 추가" 인비테이션
          카드로 채움. rows.length 가 짝수가 안 되면 마지막 row 옆이 비므로,
          비는 슬롯 수만큼 placeholder 추가 (최대 3 개).
        */}
        {rows.length < 4
          ? Array.from({ length: Math.min(4 - rows.length, 3) }).map((_, i) => (
              <li
                key={`placeholder-${i}`}
                aria-hidden="true"
                className="hidden lg:flex rounded-[14px] px-4 py-3 items-center gap-3 border-dashed"
                style={{
                  background: 'rgba(239,244,255,0.02)',
                  border: '1.5px dashed rgba(239,244,255,0.10)',
                }}
              >
                <span
                  className="shrink-0 w-9 h-9 rounded-full inline-flex items-center justify-center"
                  style={{
                    background: 'rgba(239,244,255,0.04)',
                    border: '1px dashed rgba(239,244,255,0.15)',
                    color: 'rgba(239,244,255,0.35)',
                  }}
                >
                  <UserPlus size={14} strokeWidth={2.2} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="kr-body text-[12.5px] text-cream/45 truncate">
                    친구 추가하면 여기에 표시돼요
                  </p>
                  <p className="kr-num text-[10px] text-cream/30 mt-0.5">
                    태그 공유로 진도 비교 시작
                  </p>
                </div>
              </li>
            ))
          : null}
      </ol>
    </section>
  );
}

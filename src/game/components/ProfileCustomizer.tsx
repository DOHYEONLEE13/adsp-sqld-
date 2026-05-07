/**
 * ProfileCustomizer — 프로필 페이지(StatsPage) 상단의 꾸미기 섹션.
 *
 * - 큰 아바타 + 표시 이름 + 태그
 * - 8개 Ques 포즈 그리드 → 클릭 시 즉시 저장 + 화면 갱신
 * - 이름 편집 (인라인)
 *
 * 데이터는 모두 `src/data/profile.ts` 의 동기 API 만 사용. Supabase 연동 후엔
 * setAvatarPose / setDisplayName 만 서버 호출로 교체.
 */

import { useEffect, useRef, useState } from 'react';
import { Pencil, Check, Lock } from 'lucide-react';
import Ques from '@/components/mascot/Ques';
import {
  AVATAR_POSES,
  purchaseCharacter,
  setAvatarCharacter,
  setAvatarPose,
  setDisplayName,
  useMyProfile,
} from '@/data/profile';
import { useProgress } from '@/game/useProgress';
import { computePlayerStats } from '@/game/rpg';
import ProfileSyncSkeleton from '@/components/profile/ProfileSyncSkeleton';
import type { MascotCharacter, QuesPose } from '@/components/mascot/types';

/** 캐릭터 1개 잠금해제 비용. 마이그 0025 의 cost 와 동기화. */
const CHARACTER_PRICE_XP = 50;

const POSE_LABELS: Record<QuesPose, string> = {
  happy: '행복',
  wave: '인사',
  celebrate: '축하',
  lightbulb: '아이디어',
  think: '생각 중',
  idle: '평온',
  sleep: '잠',
  sad: '시무룩',
};

export default function ProfileCustomizer() {
  // 방안 S (2026-05-07) — useMyProfile 로 race condition 해소.
  const profile = useMyProfile();

  const [editingName, setEditingName] = useState(false);
  const [draft, setDraft] = useState(profile.displayName);
  useEffect(() => setDraft(profile.displayName), [profile.displayName]);

  // ── 아바타 포즈 + 캐릭터: "미리보기 후 명시적 저장" 패턴 ────────────────
  // 사용자가 16 옵션 (캐릭터 2 × 포즈 8) 중 마음껏 눌러볼 수 있도록 클릭은 draft
  // state 만 갱신. [저장하기] 클릭 시에만 setAvatarPose / setAvatarCharacter 가
  // localStorage + Supabase 에 push.
  const [draftAvatarPose, setDraftAvatarPose] = useState<QuesPose>(
    profile.avatarPose,
  );
  const [draftCharacter, setDraftCharacter] = useState<MascotCharacter>(
    profile.avatarCharacter,
  );

  // 외부에서 profile 이 변하면 (다른 기기 sync · 새로 fetch) draft 도 따라가게.
  // 단, "사용자가 draft 만 바꾸고 아직 저장 안 한 상태" 에선 외부 변경을 흡수
  // 하지 않도록 마지막으로 본 server 값을 ref 로 추적해서 비교.
  const lastSeenServerPoseRef = useRef<QuesPose>(profile.avatarPose);
  const lastSeenServerCharRef = useRef<MascotCharacter>(profile.avatarCharacter);
  useEffect(() => {
    const externalPoseChanged =
      profile.avatarPose !== lastSeenServerPoseRef.current;
    const userHasUnsavedPose =
      draftAvatarPose !== lastSeenServerPoseRef.current;
    if (externalPoseChanged && !userHasUnsavedPose) {
      setDraftAvatarPose(profile.avatarPose);
    }
    lastSeenServerPoseRef.current = profile.avatarPose;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.avatarPose]);

  useEffect(() => {
    const externalCharChanged =
      profile.avatarCharacter !== lastSeenServerCharRef.current;
    const userHasUnsavedChar =
      draftCharacter !== lastSeenServerCharRef.current;
    if (externalCharChanged && !userHasUnsavedChar) {
      setDraftCharacter(profile.avatarCharacter);
    }
    lastSeenServerCharRef.current = profile.avatarCharacter;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.avatarCharacter]);

  const avatarChanged =
    draftAvatarPose !== profile.avatarPose ||
    draftCharacter !== profile.avatarCharacter;

  const onSaveAvatar = () => {
    if (!avatarChanged) return;
    let blocked = false;
    let lockedAttempt = false;
    if (draftAvatarPose !== profile.avatarPose) {
      const r = setAvatarPose(draftAvatarPose);
      if (!r.ok && r.reason === 'sync-not-ready') blocked = true;
    }
    if (!blocked && draftCharacter !== profile.avatarCharacter) {
      const r = setAvatarCharacter(draftCharacter);
      if (!r.ok && r.reason === 'sync-not-ready') blocked = true;
      // 안전망 — UI 가 잠금 캐릭터를 draft 로 못 만들지만, race 또는 stale state
      // 시 'locked' reason 가능. 잠금 캐릭터 적용 거부 + 안내.
      if (!r.ok && r.reason === 'locked') lockedAttempt = true;
    }
    if (blocked) {
      window.alert(
        '프로필 동기화가 완료되지 않았어요. 잠시 후 다시 시도해주세요.',
      );
    }
    if (lockedAttempt) {
      window.alert('잠긴 캐릭터입니다. 먼저 50 XP 로 잠금해제해 주세요.');
      // draft 를 server 값으로 되돌림
      setDraftCharacter(profile.avatarCharacter);
    }
  };

  const onCancelAvatar = () => {
    setDraftAvatarPose(profile.avatarPose);
    setDraftCharacter(profile.avatarCharacter);
  };

  // 캐릭터 라벨
  const CHAR_LABEL: Record<MascotCharacter, string> = {
    tori: '토리 (ADSP)',
    selli: '셀리 (SQLD)',
  };

  // 닉네임 미설정 — 빈 값이거나 자동 생성된 태그 그대로면 "미설정" 으로 본다.
  const isNameUnset =
    !profile.displayName || profile.displayName === profile.tag;

  return (
    <section
      className="liquid-glass rounded-[24px] p-5 md:p-6"
      aria-label="프로필 꾸미기"
    >
      <div className="flex items-center gap-4 md:gap-5 lg:gap-7">
        {/* 큰 아바타 — 데스크톱에서 사이즈 ↑ (모바일 88 → md 108 → lg 132 → xl 156). */}
        <div
          className="shrink-0 rounded-[24px] inline-flex items-center justify-center w-[88px] h-[88px] md:w-[108px] md:h-[108px] lg:w-[132px] lg:h-[132px] xl:w-[156px] xl:h-[156px]"
          style={{
            background:
              'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%), rgba(253,128,46,0.12)',
            border: '1.5px solid rgba(253,128,46,0.4)',
          }}
        >
          {/* 큰 아바타는 draft 를 미리보기 (캐릭터 + 포즈 둘 다). */}
          <Ques
            pose={draftAvatarPose}
            character={draftCharacter}
            animated={false}
            className="w-[76px] h-[76px] md:w-[92px] md:h-[92px] lg:w-[112px] lg:h-[112px] xl:w-[132px] xl:h-[132px]"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="kr-heading uppercase text-[10px] md:text-[11px] tracking-widest text-cream/55 mb-1">
            나의 프로필
          </div>
          {profile.pendingServerSync ? (
            // 동기화 중 — skeleton + 안내
            <div className="flex flex-col items-start gap-1.5 mt-1">
              <ProfileSyncSkeleton
                width="w-40"
                failed={profile.syncStatus === 'failed'}
              />
              <ProfileSyncSkeleton
                width="w-28"
                failed={profile.syncStatus === 'failed'}
                showRetry={false}
              />
            </div>
          ) : editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="닉네임"
                maxLength={20}
                className="bg-transparent outline-none kr-heading text-[18px] md:text-[22px] border-b border-cream/30 focus:border-neon transition pb-1 min-w-0 flex-1"
                style={{ color: 'var(--cream)' }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  const result = setDisplayName(draft);
                  if (!result.ok && result.reason === 'sync-not-ready') {
                    window.alert('프로필 동기화가 완료되지 않았어요. 잠시 후 다시 시도해주세요.');
                    return;
                  }
                  setEditingName(false);
                }}
                aria-label="이름 저장"
                className="inline-flex items-center justify-center w-8 h-8 rounded-full transition active:scale-95"
                style={{ background: '#6FFF00', color: '#010828' }}
              >
                <Check size={14} strokeWidth={2.6} />
              </button>
            </div>
          ) : isNameUnset ? (
            // 닉네임 미설정 — 강조된 CTA 로 입력 유도
            <button
              type="button"
              onClick={() => {
                setDraft('');
                setEditingName(true);
              }}
              aria-label="닉네임 설정"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition active:scale-95"
              style={{
                background: 'rgba(111,255,0,0.12)',
                border: '1px solid #6FFF00',
                color: '#6FFF00',
              }}
            >
              <Pencil size={12} strokeWidth={2.4} />
              <span className="kr-num text-[13px]">닉네임 설정하기</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <h2
                className="kr-heading text-[18px] md:text-[22px] lg:text-[26px] xl:text-[30px] truncate"
                style={{ color: 'var(--cream)' }}
              >
                {profile.displayName}
              </h2>
              <button
                type="button"
                onClick={() => setEditingName(true)}
                aria-label="이름 변경"
                className="inline-flex items-center justify-center w-7 h-7 rounded-full transition opacity-60 hover:opacity-100"
                style={{ color: 'var(--cream)' }}
              >
                <Pencil size={12} strokeWidth={2.4} />
              </button>
            </div>
          )}
          {profile.pendingServerSync ? null : (
            <code
              className="kr-num text-[12px] mt-1 inline-block"
              style={{ color: '#FFB020', letterSpacing: '0.02em' }}
            >
              {profile.tag}
            </code>
          )}
        </div>
      </div>

      {/* 캐릭터 선택 탭 (tori/selli) + 포즈 선택 그리드.
          클릭은 draft 만 갱신. 저장은 별도 버튼. */}
      <div className="mt-5 lg:mt-7">
        {/* 캐릭터 탭 — 2 캐릭터 토글 + 잠금/구매 표시 */}
        <div className="kr-heading uppercase text-[10px] md:text-[11px] tracking-widest text-cream/55 mb-2">
          캐릭터
        </div>
        <CharacterTabs
          draftCharacter={draftCharacter}
          setDraftCharacter={setDraftCharacter}
          profile={profile}
          characterLabel={CHAR_LABEL}
        />

        <div className="kr-heading uppercase text-[10px] md:text-[11px] tracking-widest text-cream/55 mb-2">
          아바타 표정
        </div>
        <div className="grid grid-cols-4 gap-2 md:gap-3 lg:gap-4">
          {AVATAR_POSES.map((pose) => {
            const isDraft = pose === draftAvatarPose;
            const isSaved = pose === profile.avatarPose;
            return (
              <button
                key={pose}
                type="button"
                disabled={profile.pendingServerSync}
                onClick={() => {
                  // 미리보기만 — server write X. 사용자는 마음껏 눌러볼 수 있음.
                  setDraftAvatarPose(pose);
                }}
                aria-label={`아바타 — ${POSE_LABELS[pose]}${isSaved ? ' (저장됨)' : ''}${isDraft && !isSaved ? ' (선택 중)' : ''}`}
                aria-pressed={isDraft}
                className="aspect-square rounded-[14px] lg:rounded-[18px] inline-flex items-center justify-center transition active:scale-95 p-2 md:p-3 lg:p-5"
                style={{
                  background: isDraft
                    ? 'rgba(111,255,0,0.12)'
                    : 'rgba(239,244,255,0.04)',
                  border: isDraft
                    ? '2px solid #6FFF00'
                    : isSaved
                      ? '2px dashed rgba(111,255,0,0.35)' // 현재 저장된 포즈는 점선 hint
                      : '2px solid rgba(239,244,255,0.08)',
                }}
              >
                {/* className 으로 cell 안에서 100% — 현재 선택 캐릭터 (draft) 의 포즈 */}
                <Ques
                  pose={pose}
                  character={draftCharacter}
                  animated={false}
                  className="w-full h-full"
                />
              </button>
            );
          })}
        </div>

        {/* 저장 / 취소 — 변경된 경우에만 강조 노출 */}
        <div className="mt-3 flex items-center gap-2 min-h-[36px]">
          {avatarChanged ? (
            <>
              <button
                type="button"
                onClick={onSaveAvatar}
                disabled={profile.pendingServerSync}
                aria-label="아바타 저장"
                className="kr-num inline-flex items-center gap-1.5 px-4 py-2 rounded-full transition active:scale-95 disabled:opacity-50"
                style={{
                  background: '#6FFF00',
                  color: '#010828',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <Check size={14} strokeWidth={2.6} />
                <span>저장하기</span>
              </button>
              <button
                type="button"
                onClick={onCancelAvatar}
                aria-label="선택 취소"
                className="kr-num px-3 py-2 rounded-full transition active:scale-95"
                style={{
                  background: 'transparent',
                  color: 'var(--cream)',
                  fontSize: 12,
                  opacity: 0.65,
                  border: '1px solid rgba(239,244,255,0.18)',
                }}
              >
                취소
              </button>
              <span
                className="kr-body ml-1"
                style={{ fontSize: 11, color: 'rgba(239,244,255,0.55)' }}
                aria-live="polite"
              >
                저장하지 않으면 사라져요
              </span>
            </>
          ) : (
            <p className="kr-body text-[11px] text-cream/50 leading-[1.55]">
              현재 선택한 표정이 친구 리더보드에서도 표시됩니다.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── CharacterTabs ─────────────────────────────────────────────────────────
// 캐릭터 토글 + 잠금 표시 + 50 XP 구매 흐름.
//
// 잠금 캐릭터 클릭 시:
//   1) confirm — "X XP 사용해 잠금해제?"
//   2) purchaseCharacter RPC 호출
//   3) 성공 → stored 갱신 + draft 적용
//   4) 실패 → reason 별 메시지
//
// 동시 호출 방지 — purchasing flag.

interface CharacterTabsProps {
  draftCharacter: MascotCharacter;
  setDraftCharacter: (c: MascotCharacter) => void;
  profile: ReturnType<typeof useMyProfile>;
  characterLabel: Record<MascotCharacter, string>;
}

function CharacterTabs({
  draftCharacter,
  setDraftCharacter,
  profile,
  characterLabel,
}: CharacterTabsProps) {
  const progress = useProgress();
  const stats = computePlayerStats(progress);
  const totalXp = stats.totalXp;

  const [purchasing, setPurchasing] = useState<MascotCharacter | null>(null);
  const [feedback, setFeedback] = useState<{
    kind: 'ok' | 'err';
    msg: string;
  } | null>(null);

  const unlocked = profile.unlockedCharacters;

  const handleClick = async (c: MascotCharacter) => {
    setFeedback(null);
    if (unlocked.includes(c)) {
      setDraftCharacter(c);
      return;
    }

    // 잠금 캐릭터 — 구매 흐름
    if (purchasing) return; // 동시 호출 차단
    if (!profile.isAuthenticated) {
      setFeedback({
        kind: 'err',
        msg: '구매하려면 로그인해 주세요.',
      });
      return;
    }
    if (profile.pendingServerSync) {
      setFeedback({
        kind: 'err',
        msg: '동기화 완료 후 다시 시도해 주세요.',
      });
      return;
    }
    if (totalXp < CHARACTER_PRICE_XP) {
      setFeedback({
        kind: 'err',
        msg: `XP ${CHARACTER_PRICE_XP - totalXp}개 부족 — 학습으로 더 모아주세요.`,
      });
      return;
    }
    if (
      !window.confirm(
        `'${characterLabel[c]}' 캐릭터를 잠금해제할까요?\n\n` +
          `비용: ${CHARACTER_PRICE_XP} XP\n` +
          `현재 XP: ${totalXp}\n` +
          `잠금해제 후: ${totalXp - CHARACTER_PRICE_XP} XP\n\n` +
          `한 번 잠금해제하면 영구 보유.`,
      )
    ) {
      return;
    }

    setPurchasing(c);
    try {
      const result = await purchaseCharacter(c);
      if (result.ok) {
        setFeedback({
          kind: 'ok',
          msg: `${characterLabel[c]} 잠금해제 완료! (XP ${result.remainingXp ?? '?'} 남음)`,
        });
        // 잠금해제된 캐릭터를 draft 로 자동 적용 — 사용자가 즉시 확인 가능
        setDraftCharacter(c);
      } else {
        const reasonMsg: Record<string, string> = {
          insufficient_xp: 'XP 부족',
          unknown_character: '알 수 없는 캐릭터',
          unauthenticated: '로그인이 필요합니다',
          'sync-not-ready': '동기화 완료 후 다시 시도',
          guest_no_purchase: '게스트는 구매할 수 없습니다',
          rpc_error: '서버 오류 — 잠시 후 재시도',
          no_supabase: '서버 연결 없음',
        };
        const msg = reasonMsg[result.reason ?? ''] ?? `실패 — ${result.reason}`;
        setFeedback({ kind: 'err', msg });
      }
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {(['tori', 'selli'] as const).map((c) => {
          const isActive = c === draftCharacter;
          const isUnlocked = unlocked.includes(c);
          const isPurchasing = purchasing === c;

          return (
            <button
              key={c}
              type="button"
              onClick={() => void handleClick(c)}
              disabled={profile.pendingServerSync || isPurchasing}
              aria-pressed={isActive}
              aria-label={
                isUnlocked
                  ? `${characterLabel[c]} 선택`
                  : `${characterLabel[c]} 잠금 — ${CHARACTER_PRICE_XP} XP 로 잠금해제`
              }
              className="kr-heading uppercase tracking-widest text-[11px] md:text-[12px] px-4 py-2 rounded-full transition active:scale-95 disabled:opacity-50 inline-flex items-center gap-1.5"
              style={{
                background: isActive
                  ? 'rgba(111,255,0,0.16)'
                  : isUnlocked
                    ? 'rgba(239,244,255,0.04)'
                    : 'rgba(255,176,32,0.08)',
                border: isActive
                  ? '1.5px solid #6FFF00'
                  : isUnlocked
                    ? '1.5px solid rgba(239,244,255,0.10)'
                    : '1.5px dashed rgba(255,176,32,0.45)',
                color: isActive
                  ? '#6FFF00'
                  : isUnlocked
                    ? 'rgba(239,244,255,0.65)'
                    : '#FFB020',
              }}
            >
              {!isUnlocked && (
                <Lock size={10} strokeWidth={2.6} aria-hidden />
              )}
              <span>{characterLabel[c]}</span>
              {!isUnlocked && (
                <span
                  className="kr-num text-[10px] tabular-nums"
                  style={{ marginLeft: 2 }}
                >
                  {isPurchasing ? '구매 중...' : `${CHARACTER_PRICE_XP} XP`}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {feedback ? (
        <p
          className="kr-body text-[11px] mb-3 leading-[1.5]"
          role="status"
          aria-live="polite"
          style={{
            color: feedback.kind === 'ok' ? '#6FFF00' : '#fca5a5',
          }}
        >
          {feedback.msg}
        </p>
      ) : null}
    </>
  );
}

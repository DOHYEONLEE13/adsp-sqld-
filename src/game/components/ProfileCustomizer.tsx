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
import { Pencil, Check } from 'lucide-react';
import Ques from '@/components/mascot/Ques';
import {
  AVATAR_POSES,
  setAvatarCharacter,
  setAvatarPose,
  setDisplayName,
  useMyProfile,
} from '@/data/profile';
import ProfileSyncSkeleton from '@/components/profile/ProfileSyncSkeleton';
import type { MascotCharacter, QuesPose } from '@/components/mascot/types';

// 2026-05-08 — 캐릭터/포즈 잠금/구매 시스템 폐기. 모두 자유 사용.
// PurchaseConfirmModal 컴포넌트는 향후 재사용 위해 보존 (다른 구매 흐름에 활용 가능).

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

  // 안전망 (2026-05-08) — draft (캐릭터, 포즈) 조합이 잠금 상태면 default 로 자동 전환.
  // 시나리오: 사용자가 캐릭터 토글 → 그 캐릭터의 현재 draft 포즈가 잠금일 때
  //          (예: 토리는 happy 보유, 셀리는 wave 만 보유 — 토리에서 셀리로 전환).
  // 자동 전환으로 잠금 포즈 active 인 채로 표시되는 혼란 방지.
  useEffect(() => {
    if (profile.unlockedPoses.length === 0) return; // 데이터 없음 — 대기
    const key = `${draftCharacter}-${draftAvatarPose}`;
    if (!profile.unlockedPoses.includes(key)) {
      setDraftAvatarPose('wave');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftCharacter, draftAvatarPose, profile.unlockedPoses]);

  // 캐릭터는 클릭 즉시 저장 → draft 와 profile 항상 동기화. 표정만 비교.
  const avatarChanged = draftAvatarPose !== profile.avatarPose;

  // onSaveAvatar — 표정만 저장. 캐릭터는 클릭 즉시 저장이라 여기 미포함.
  const onSaveAvatar = () => {
    if (!avatarChanged) return;
    if (draftAvatarPose !== profile.avatarPose) {
      const r = setAvatarPose(draftAvatarPose);
      if (!r.ok && r.reason === 'sync-not-ready') {
        window.alert(
          '프로필 동기화가 완료되지 않았어요. 잠시 후 다시 시도해주세요.',
        );
      }
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
    comhwal: '컴활',
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
                style={{ background: 'var(--cta-primary)', color: 'var(--cta-text)' }}
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
                background: 'var(--neon-12)',
                border: '1px solid var(--neon)',
                color: 'var(--neon)',
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
          캐릭터는 클릭 즉시 저장 (2 옵션이라 미리보기 의미 X).
          포즈는 미리보기 후 명시적 저장 (8 옵션이라 마음껏 눌러볼 수 있게). */}
      <div className="mt-5 lg:mt-7">
        {/* 캐릭터 탭 — 2 캐릭터 토글 + 잠금/구매 표시 */}
        <div className="kr-heading uppercase text-[10px] md:text-[11px] tracking-widest text-cream/55 mb-2">
          캐릭터
        </div>
        <CharacterTabs
          draftCharacter={draftCharacter}
          onSelectCharacter={(c) => {
            // 클릭 즉시 저장 — draft + server push 동시.
            // 캐릭터는 잠금 X (둘 다 free, 마이그 0026 이후) — 잠금/구매는 포즈 단위.
            setDraftCharacter(c);
            const r = setAvatarCharacter(c);
            if (!r.ok && r.reason === 'sync-not-ready') {
              window.alert(
                '프로필 동기화가 완료되지 않았어요. 잠시 후 다시 시도해주세요.',
              );
              setDraftCharacter(profile.avatarCharacter);
            }
          }}
          profile={profile}
          characterLabel={CHAR_LABEL}
        />

        <div className="kr-heading uppercase text-[10px] md:text-[11px] tracking-widest text-cream/55 mb-2">
          아바타 표정
        </div>
        <PoseGrid
          draftCharacter={draftCharacter}
          draftAvatarPose={draftAvatarPose}
          setDraftAvatarPose={setDraftAvatarPose}
          profile={profile}
          poseLabels={POSE_LABELS}
        />

        {/* 저장 / 취소 — 항상 표시 (변경 없을 때 disabled). 사용자 보고 2026-05-08:
            "적용하기 버튼이 없어졌어" — 변경 없을 때 안 보여서 혼란. 항상 표시. */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onSaveAvatar}
            disabled={profile.pendingServerSync || !avatarChanged}
            aria-label={avatarChanged ? '아바타 저장' : '변경 사항 없음'}
            className="kr-num inline-flex items-center gap-1.5 px-4 py-2 rounded-full transition active:scale-95 disabled:opacity-40"
            style={{
              background: avatarChanged
                ? 'var(--neon)'
                : 'rgba(239,244,255,0.06)',
              color: avatarChanged ? '#010828' : 'rgba(239,244,255,0.55)',
              fontSize: 13,
              fontWeight: 700,
              border: avatarChanged
                ? 'none'
                : '1px solid rgba(239,244,255,0.12)',
              cursor: avatarChanged ? 'pointer' : 'not-allowed',
            }}
          >
            <Check size={14} strokeWidth={2.6} />
            <span>저장하기</span>
          </button>
          {avatarChanged ? (
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
          ) : null}
          <span
            className="kr-body"
            style={{
              fontSize: 11,
              color: avatarChanged
                ? 'rgba(239,244,255,0.55)'
                : 'rgba(239,244,255,0.45)',
              marginLeft: 4,
            }}
            aria-live="polite"
          >
            {avatarChanged
              ? '저장하지 않으면 사라져요'
              : '표정을 골라 [저장하기] 누르세요'}
          </span>
        </div>
      </div>
    </section>
  );
}

// ─── CharacterTabs ─────────────────────────────────────────────────────────
// 캐릭터 토글 — 둘 다 free, 잠금 시스템 X (포즈 단위로 이동, 마이그 0026).

interface CharacterTabsProps {
  draftCharacter: MascotCharacter;
  /** 캐릭터 선택 — 부모가 즉시 저장 (setAvatarCharacter). */
  onSelectCharacter: (c: MascotCharacter) => void;
  profile: ReturnType<typeof useMyProfile>;
  characterLabel: Record<MascotCharacter, string>;
}

function CharacterTabs({
  draftCharacter,
  onSelectCharacter,
  profile,
  characterLabel,
}: CharacterTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {(['tori', 'selli'] as const).map((c) => {
        const isActive = c === draftCharacter;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onSelectCharacter(c)}
            disabled={profile.pendingServerSync}
            aria-pressed={isActive}
            aria-label={`${characterLabel[c]} 선택`}
            className="kr-heading uppercase tracking-widest text-[11px] md:text-[12px] px-4 py-2 rounded-full transition active:scale-95 disabled:opacity-50"
            style={{
              background: isActive
                ? 'var(--neon-16)'
                : 'rgba(239,244,255,0.04)',
              border: isActive
                ? '1.5px solid var(--neon)'
                : '1.5px solid rgba(239,244,255,0.10)',
              color: isActive ? 'var(--neon)' : 'rgba(239,244,255,0.65)',
            }}
          >
            {characterLabel[c]}
          </button>
        );
      })}
    </div>
  );
}

// ─── PoseGrid ─────────────────────────────────────────────────────────────
// 표정 그리드 (8 포즈) — 모두 자유 사용.
// 2026-05-08 — 잠금/구매 시스템 폐기. 단순 표정 선택 + draft 미리보기 패턴.

interface PoseGridProps {
  draftCharacter: MascotCharacter;
  draftAvatarPose: QuesPose;
  setDraftAvatarPose: (p: QuesPose) => void;
  profile: ReturnType<typeof useMyProfile>;
  poseLabels: Record<QuesPose, string>;
}

function PoseGrid({
  draftCharacter,
  draftAvatarPose,
  setDraftAvatarPose,
  profile,
  poseLabels,
}: PoseGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2 md:gap-3 lg:gap-4">
      {AVATAR_POSES.map((pose) => {
        const isDraft = pose === draftAvatarPose;
        const isSaved = pose === profile.avatarPose;
        return (
          <button
            key={pose}
            type="button"
            disabled={profile.pendingServerSync}
            onClick={() => setDraftAvatarPose(pose)}
            aria-label={`아바타 — ${poseLabels[pose]}${isSaved ? ' (저장됨)' : ''}${isDraft && !isSaved ? ' (선택 중)' : ''}`}
            aria-pressed={isDraft}
            className="aspect-square rounded-[14px] lg:rounded-[18px] inline-flex items-center justify-center transition active:scale-95 p-2 md:p-3 lg:p-5 disabled:opacity-50"
            style={{
              background: isDraft
                ? 'var(--neon-12)'
                : 'rgba(239,244,255,0.04)',
              border: isDraft
                ? '2px solid var(--neon)'
                : isSaved
                  ? '2px dashed var(--neon-35)' // 현재 저장된 포즈는 점선 hint
                  : '2px solid rgba(239,244,255,0.08)',
            }}
          >
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
  );
}

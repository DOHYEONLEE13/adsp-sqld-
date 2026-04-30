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
  getMyProfile,
  setAvatarPose,
  setDisplayName,
  subscribeProfile,
  type MyProfile,
} from '@/data/profile';
import ProfileSyncSkeleton from '@/components/profile/ProfileSyncSkeleton';
import type { QuesPose } from '@/components/mascot/types';

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
  const [profile, setProfile] = useState<MyProfile>(() => getMyProfile());
  useEffect(() => {
    const unsub = subscribeProfile(() => setProfile(getMyProfile()));
    return () => {
      unsub();
    };
  }, []);

  const [editingName, setEditingName] = useState(false);
  const [draft, setDraft] = useState(profile.displayName);
  useEffect(() => setDraft(profile.displayName), [profile.displayName]);

  // ── 아바타 포즈: "미리보기 후 명시적 저장" 패턴 ──────────────────────────
  // 사용자가 8개 포즈 중 마음껏 눌러볼 수 있도록 클릭은 draftAvatarPose 만 갱신.
  // [저장하기] 클릭 시에만 setAvatarPose 가 localStorage + Supabase 에 push.
  // 효과:
  //   - 사용자: 탐색 부담 ↓ (실수로 확정될 우려 X)
  //   - 서버:  N 회 클릭 → 1 회 write (다기기 sync 트래픽 감소)
  const [draftAvatarPose, setDraftAvatarPose] = useState<QuesPose>(
    profile.avatarPose,
  );
  // 외부에서 profile.avatarPose 가 변하면 (다른 기기 sync · 새로 fetch) draft 도
  // 따라가게. 단, "사용자가 draft 만 바꾸고 아직 저장 안 한 상태" 에선 외부 변경을
  // 흡수하지 않도록 마지막으로 본 server pose 를 ref 로 추적해서 비교.
  const lastSeenServerPoseRef = useRef<QuesPose>(profile.avatarPose);
  useEffect(() => {
    const externalChanged =
      profile.avatarPose !== lastSeenServerPoseRef.current;
    const userHasUnsavedDraft =
      draftAvatarPose !== lastSeenServerPoseRef.current;
    if (externalChanged && !userHasUnsavedDraft) {
      // 외부 변경만 있고 사용자 draft 는 없음 → 흡수
      setDraftAvatarPose(profile.avatarPose);
    }
    lastSeenServerPoseRef.current = profile.avatarPose;
    // 의도적으로 draftAvatarPose 는 deps 에서 제외 — draft 변경이 effect 를
    // 다시 트리거하면 저장 직후 사이클이 꼬임.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.avatarPose]);

  const avatarChanged = draftAvatarPose !== profile.avatarPose;

  const onSaveAvatar = () => {
    if (!avatarChanged) return;
    const result = setAvatarPose(draftAvatarPose);
    if (!result.ok && result.reason === 'sync-not-ready') {
      window.alert(
        '프로필 동기화가 완료되지 않았어요. 잠시 후 다시 시도해주세요.',
      );
    }
  };

  const onCancelAvatar = () => {
    setDraftAvatarPose(profile.avatarPose);
  };

  // 닉네임 미설정 — 빈 값이거나 자동 생성된 태그 그대로면 "미설정" 으로 본다.
  const isNameUnset =
    !profile.displayName || profile.displayName === profile.tag;

  return (
    <section
      className="liquid-glass rounded-[24px] p-5 md:p-6"
      aria-label="프로필 꾸미기"
    >
      <div className="flex items-center gap-4 md:gap-5">
        {/* 큰 아바타 */}
        <div
          className="shrink-0 rounded-[24px] inline-flex items-center justify-center"
          style={{
            width: 88,
            height: 88,
            background:
              'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%), rgba(253,128,46,0.12)',
            border: '1.5px solid rgba(253,128,46,0.4)',
          }}
        >
          {/* 큰 아바타는 draft 를 미리보기 — 저장 전이라도 어떻게 보일지 즉시 확인 */}
          <Ques pose={draftAvatarPose} size={76} animated={false} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="kr-heading uppercase text-[10px] tracking-widest text-cream/55 mb-1">
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
                className="kr-heading text-[18px] md:text-[22px] truncate"
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

      {/* 포즈 선택 그리드 — 클릭은 draft 만 갱신. 저장은 별도 버튼. */}
      <div className="mt-5">
        <div className="kr-heading uppercase text-[10px] tracking-widest text-cream/55 mb-2">
          아바타 표정
        </div>
        <div className="grid grid-cols-4 gap-2 md:gap-3">
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
                className="aspect-square rounded-[14px] inline-flex items-center justify-center transition active:scale-95"
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
                <Ques pose={pose} size={56} animated={false} />
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

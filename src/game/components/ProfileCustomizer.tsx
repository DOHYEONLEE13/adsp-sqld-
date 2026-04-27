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

import { useEffect, useState } from 'react';
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
          <Ques pose={profile.avatarPose} size={76} animated={false} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="kr-heading uppercase text-[10px] tracking-widest text-cream/55 mb-1">
            나의 프로필
          </div>
          {editingName ? (
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
                  setDisplayName(draft);
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
          <code
            className="kr-num text-[12px] mt-1 inline-block"
            style={{ color: '#FFB020', letterSpacing: '0.02em' }}
          >
            {profile.tag}
          </code>
        </div>
      </div>

      {/* 포즈 선택 그리드 */}
      <div className="mt-5">
        <div className="kr-heading uppercase text-[10px] tracking-widest text-cream/55 mb-2">
          아바타 표정
        </div>
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {AVATAR_POSES.map((pose) => {
            const isActive = pose === profile.avatarPose;
            return (
              <button
                key={pose}
                type="button"
                onClick={() => setAvatarPose(pose)}
                aria-label={`아바타 — ${POSE_LABELS[pose]}`}
                aria-pressed={isActive}
                className="aspect-square rounded-[14px] inline-flex items-center justify-center transition active:scale-95"
                style={{
                  background: isActive
                    ? 'rgba(111,255,0,0.12)'
                    : 'rgba(239,244,255,0.04)',
                  border: isActive
                    ? '2px solid #6FFF00'
                    : '2px solid rgba(239,244,255,0.08)',
                }}
              >
                <Ques pose={pose} size={56} animated={false} />
              </button>
            );
          })}
        </div>
        <p className="kr-body text-[11px] text-cream/50 mt-2 leading-[1.55]">
          현재 선택한 표정이 친구 리더보드에서도 표시됩니다.
        </p>
      </div>
    </section>
  );
}

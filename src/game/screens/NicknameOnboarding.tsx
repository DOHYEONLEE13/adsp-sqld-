/**
 * NicknameOnboarding — 첫 진입 시 토리가 닉네임을 묻는 onboarding step.
 *
 * 노출 조건 (GalaxyScreen 내부에서 게이팅):
 *   - profile.pendingServerSync === false   (프로필 로드 완료)
 *   - profile.displayName === ''            (닉네임 미설정)
 *   - playerStats.sessionsCount === 0       (정말 첫 사용자)
 *
 * 흐름:
 *   1. 토리 wave + 말풍선 "안녕하세요! 저는 토리예요. 뭐라고 불러드릴까요?"
 *   2. 닉네임 입력 (1~12자) + Enter / 시작 버튼
 *   3. setDisplayName 성공 → onDone() → GalaxyScreen 의 needsNickname 플래그가
 *      false 로 떨어지면서 자연스럽게 chooser 노출
 *   4. "건너뛰기" — 태그(Q-XXXX-XXXX) 그대로 사용. 나중에 프로필에서 변경 가능.
 */

import { useEffect, useState } from 'react';
import { ArrowRight, Cloud } from 'lucide-react';
import Ques from '@/components/mascot/Ques';
import SpeechBubble from '@/game/lesson/SpeechBubble';
import { setDisplayName } from '@/data/profile';
import VideoBg from '@/components/ui/VideoBg';
import { VIDEO_URLS } from '@/data/site';
import {
  getSupabase,
  isSupabaseConfigured,
  onAuthStateChange,
  signInWithOAuth,
} from '@/lib/supabase';

const ACCENT = '#6FFF00';
const MAX_LEN = 12;

interface Props {
  /** 닉네임 입력 완료 또는 건너뛰기 → galaxy chooser 로 진행. */
  onDone: () => void;
}

export default function NicknameOnboarding({ onDone }: Props) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Supabase 세션 상태 구독 — 로그인 시 banner 가 "✓ 로그인됨" 으로 바뀜.
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      setIsAuthed(!!data.session);
    });
    const unsub = onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
    });
    return () => unsub();
  }, []);

  const trimmed = name.trim();
  const isValid = trimmed.length >= 1 && trimmed.length <= MAX_LEN;
  const supabaseEnabled = isSupabaseConfigured();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (submitting || !isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = setDisplayName(trimmed);
      if (!result.ok) {
        if (result.reason === 'sync-not-ready') {
          setError('잠시 후 다시 시도해주세요.');
        } else {
          setError('저장 중 오류가 발생했어요.');
        }
        setSubmitting(false);
        return;
      }
      onDone();
    } catch {
      setError('알 수 없는 오류 — 잠시 후 다시 시도해주세요.');
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (submitting) return;
    onDone();
  };

  const handleGoogleLogin = async () => {
    if (authLoading) return;
    setAuthLoading(true);
    const result = await signInWithOAuth('google');
    if ((result as { error?: unknown })?.error) {
      window.alert('로그인 실패. 잠시 후 다시 시도해주세요.');
      setAuthLoading(false);
    }
    // 성공 시 OAuth 리다이렉트 → 페이지 새로고침. authLoading 그대로 두어도 OK.
  };

  return (
    <section
      className="relative min-h-screen isolate overflow-hidden flex items-center justify-center"
      style={{ background: '#010828', color: '#FFFFFF' }}
    >
      {/* 배경 — galaxy 와 동일한 ambient 영상 (분위기 일관성) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <VideoBg src={VIDEO_URLS.pageAmbient} fit="cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(1,8,40,0.65) 0%, rgba(1,8,40,0.78) 100%)',
          }}
          aria-hidden
        />
      </div>

      <div className="relative z-10 w-full max-w-[480px] px-6 md:px-8 py-10 flex flex-col items-center">
        {/* 로그인 banner — Supabase 가능 + 미로그인일 때만. 사용자에게 동기화
            가치 알리되 강제 X (게스트로도 진행 가능). */}
        {supabaseEnabled && !isAuthed ? (
          <div
            className="w-full mb-6 rounded-[16px] border border-cream/10 bg-white/[0.04] px-4 py-3.5 flex items-center gap-3"
          >
            <Cloud
              size={18}
              strokeWidth={2.2}
              className="shrink-0 text-cream/60"
            />
            <div className="flex-1 min-w-0">
              <p className="kr-body text-[12.5px] text-cream/85 leading-[1.5]">
                다른 기기에서도 진도를 이어 풀려면 로그인 하세요.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="kr-heading uppercase tracking-widest text-[10px] md:text-[11px] px-3 py-2 rounded-full whitespace-nowrap transition active:scale-95 disabled:opacity-40"
              style={{
                background: 'rgba(239,244,255,0.10)',
                color: 'var(--cream)',
                border: '1px solid rgba(239,244,255,0.18)',
              }}
            >
              {authLoading ? '이동 중…' : 'Google 로그인'}
            </button>
          </div>
        ) : null}
        {supabaseEnabled && isAuthed ? (
          <div className="w-full mb-6 rounded-[16px] border border-neon/30 bg-neon/[0.06] px-4 py-3 flex items-center gap-2">
            <Cloud size={16} strokeWidth={2.4} className="shrink-0 text-neon" />
            <p className="kr-body text-[12px] text-cream/85">
              로그인 완료 — 다른 기기에서도 진도가 이어져요.
            </p>
          </div>
        ) : null}

        {/* 토리 + 말풍선 */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="max-w-[320px]">
            <SpeechBubble
              text="안녕하세요! 저는 [토리] 예요. 뭐라고 불러드리면 될까요?"
              placement="top"
            />
          </div>
          <Ques pose="wave" size={140} />
        </div>

        {/* 입력 폼 */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-3"
          aria-label="닉네임 설정"
        >
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setError(null);
                setName(e.target.value.slice(0, MAX_LEN));
              }}
              placeholder="닉네임 (1~12자)"
              autoFocus
              maxLength={MAX_LEN}
              spellCheck={false}
              className="w-full bg-white/[0.04] border-[1.5px] border-white/15 rounded-[16px] px-5 py-4 kr-heading text-[16px] text-cream placeholder:text-cream/35 outline-none focus:border-neon focus:bg-white/[0.06] transition"
              style={{ letterSpacing: '0.02em' }}
              aria-label="닉네임"
              aria-invalid={!!error}
            />
            <span
              className="absolute right-5 top-1/2 -translate-y-1/2 kr-num text-[11px] tabular-nums text-cream/40"
              aria-hidden
            >
              {trimmed.length}/{MAX_LEN}
            </span>
          </div>

          {error ? (
            <p className="kr-body text-[12px] text-red-400 px-1" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!isValid || submitting}
            className="kr-heading uppercase tracking-widest inline-flex items-center justify-center gap-2 text-[13px] md:text-[14px] py-4 rounded-full transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            style={{
              background: ACCENT,
              color: '#010828',
              boxShadow: `0 8px 24px -6px ${ACCENT}66`,
            }}
          >
            {submitting ? '저장 중…' : '시작하기'}
            <ArrowRight size={16} strokeWidth={2.6} />
          </button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={submitting}
            className="kr-body text-[12px] text-cream/55 hover:text-cream/85 transition py-2 disabled:opacity-40"
          >
            건너뛰기 (나중에 프로필에서 변경 가능)
          </button>
        </form>
      </div>
    </section>
  );
}

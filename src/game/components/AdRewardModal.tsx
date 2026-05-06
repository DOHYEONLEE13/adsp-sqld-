/**
 * AdRewardModal — 광고 시청 보상 모달.
 *
 * 흐름:
 *   1. 본 모달 마운트 — idle 상태 (안내 + "광고 보기" 버튼)
 *   2. 사용자 "광고 보기" 클릭 → playing 으로 전환, 5초 placeholder 광고 재생
 *   3. 진행바 완료 → grantAdEnergy() RPC 호출
 *   4. 보상 성공 → 마스코트 celebrate + "+N ⚡" 펌프 → 1.5초 후 자동 onClose
 *   5. 쿨다운 / cap 도달 / 네트워크 오류 → 적절한 안내 후 닫기 버튼만
 *
 * 사용자 동의 우선 — idle 단계를 거쳐 명시적으로 "광고 보기" 클릭해야 광고 재생.
 *
 * 향후 (실제 AdSense / AdMob 통합 시):
 *   - placeholder div 자리에 <ins class="adsbygoogle"> 또는 AdMob SDK 마운트
 *   - 광고 종료 callback 시 grantAdEnergy 호출 + server-side reward token 검증
 *
 * Portal 으로 document.body 마운트 — backdrop-filter stacking context 회피.
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Zap, Check, Clock, AlertTriangle, PlayCircle, Crown } from 'lucide-react';
import Ques from '@/components/mascot/Ques';
import {
  characterForSubject,
  DEFAULT_CHARACTER,
  type MascotCharacter,
} from '@/components/mascot/types';
import type { Subject } from '@/types/question';
import {
  grantAdEnergy,
  getAdViewsToday,
  useEnergy,
  ENERGY_CAP,
  AD_REWARD,
  AD_COOLDOWN_SEC,
  AD_DAILY_CAP,
  formatRetryAfter,
} from '../energy';

const AD_DURATION_MS = 5000;

type Phase =
  | { kind: 'idle' } // 마운트 직후 — 사용자가 "광고 보기" 누르길 대기
  | { kind: 'playing'; elapsed: number }
  | { kind: 'pending' }
  | { kind: 'success'; granted: number; remaining: number }
  | { kind: 'cap' }
  | { kind: 'cooldown'; retryAfterSec: number }
  | { kind: 'daily-cap' } // KST 오늘 3회 모두 소진
  | { kind: 'error'; message: string };

interface Props {
  subject?: Subject;
  onClose: () => void;
  /** 프리미엄 알아보기 — 미지정 시 #pricing 으로 hash 점프 (랜딩 가격 섹션). */
  onUpgrade?: () => void;
}

export default function AdRewardModal({ subject, onClose, onUpgrade }: Props) {
  const character: MascotCharacter = subject
    ? characterForSubject(subject)
    : DEFAULT_CHARACTER;
  const initialEnergy = useEnergy();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
      return;
    }
    // 기본 동작 — 메인의 #pricing 섹션으로 점프
    if (typeof window !== 'undefined') {
      window.location.href = '/#pricing';
    }
  };
  // 이미 cap 도달 → "이미 가득" 안내, 그 외에는 idle (사용자가 "광고 보기" 클릭 대기).
  const [phase, setPhase] = useState<Phase>(() =>
    initialEnergy.energy >= ENERGY_CAP && !initialEnergy.isPremium && !initialEnergy.isAdmin
      ? { kind: 'cap' }
      : { kind: 'idle' },
  );
  // 오늘 누적 광고 시청 — idle / daily-cap UI 에 사용. 마운트 시 prefetch.
  const [viewsToday, setViewsToday] = useState<number>(0);
  const [dailyCap, setDailyCap] = useState<number>(AD_DAILY_CAP);
  const startedAt = useRef<number>(0);
  const grantedOnce = useRef(false);

  // 일일 카운트 prefetch — 인증 사용자도 게스트도 동일 API. cap 일 때는 fetch 생략.
  useEffect(() => {
    if (phase.kind === 'cap') return;
    let cancelled = false;
    void getAdViewsToday().then((r) => {
      if (cancelled) return;
      setViewsToday(r.viewsToday);
      setDailyCap(r.dailyCap);
      // 마운트 시점에 이미 한도 도달이면 idle 대신 daily-cap 으로.
      if (r.viewsToday >= r.dailyCap) {
        setPhase({ kind: 'daily-cap' });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [phase.kind]);

  /** 사용자 "광고 보기" 클릭 → playing 전환 + 타이머 시작. */
  const handleStartAd = () => {
    startedAt.current = Date.now();
    setPhase({ kind: 'playing', elapsed: 0 });
  };

  // 진행바 — playing 동안 16ms 간격 갱신.
  useEffect(() => {
    if (phase.kind !== 'playing') return;
    let raf = 0;
    const tick = () => {
      const elapsed = Date.now() - startedAt.current;
      if (elapsed >= AD_DURATION_MS) {
        setPhase({ kind: 'pending' });
        return;
      }
      setPhase({ kind: 'playing', elapsed });
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [phase.kind]);

  // pending → grantAdEnergy 호출 (한 번만).
  useEffect(() => {
    if (phase.kind !== 'pending' || grantedOnce.current) return;
    grantedOnce.current = true;
    void (async () => {
      const result = await grantAdEnergy();
      // 응답 → 카운트 갱신 (모든 분기 공통).
      setViewsToday(result.viewsToday);
      setDailyCap(result.dailyCap);
      if (result.ok) {
        if (result.granted === 0) {
          setPhase({ kind: 'cap' });
        } else {
          setPhase({
            kind: 'success',
            granted: result.granted,
            remaining: result.remaining,
          });
        }
      } else if (result.retryAfterSec > 0) {
        setPhase({ kind: 'cooldown', retryAfterSec: result.retryAfterSec });
      } else if (result.viewsToday >= result.dailyCap) {
        // 일일 한도 도달 — race condition (다른 탭이 먼저 소진) 보호.
        setPhase({ kind: 'daily-cap' });
      } else {
        setPhase({
          kind: 'error',
          message: '연결이 불안정해요. 잠시 후 다시 시도해주세요.',
        });
      }
    })();
  }, [phase.kind]);

  // success / cap 일 때 1.5초 후 자동 닫기.
  useEffect(() => {
    if (phase.kind !== 'success' && phase.kind !== 'cap') return;
    const t = window.setTimeout(() => onClose(), 1500);
    return () => window.clearTimeout(t);
  }, [phase.kind, onClose]);

  // playing 중 닫기 — 보상 X. pending 중 닫기 막음 (RPC 진행).
  const canClose = phase.kind !== 'pending';

  const progress =
    phase.kind === 'playing' ? Math.min(1, phase.elapsed / AD_DURATION_MS) : 1;

  const node = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ad-reward-title"
      className="fixed inset-0 z-[60] flex items-center justify-center px-5"
      style={{ background: 'rgba(1,8,40,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={canClose ? onClose : undefined}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="liquid-glass rounded-[24px] w-full max-w-[380px] p-6 pt-7 relative"
        style={{
          background: 'rgba(20,32,46,0.96)',
          border: '1px solid rgba(167,139,250,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {canClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute top-3 right-3 w-8 h-8 inline-flex items-center justify-center transition opacity-60 hover:opacity-100"
          >
            <X size={16} className="text-cream" strokeWidth={2.4} />
          </button>
        ) : null}

        <div className="flex flex-col items-center text-center">
          {/* 상태별 본문 */}
          {phase.kind === 'idle' ? (
            <IdleBody
              character={character}
              viewsToday={viewsToday}
              dailyCap={dailyCap}
              onStart={handleStartAd}
              onUpgrade={handleUpgrade}
              onCancel={onClose}
            />
          ) : phase.kind === 'playing' || phase.kind === 'pending' ? (
            <PlayingBody character={character} progress={progress} />
          ) : phase.kind === 'success' ? (
            <SuccessBody
              character={character}
              granted={phase.granted}
              remaining={phase.remaining}
              viewsToday={viewsToday}
              dailyCap={dailyCap}
            />
          ) : phase.kind === 'cap' ? (
            <CapBody character={character} />
          ) : phase.kind === 'cooldown' ? (
            <CooldownBody retryAfterSec={phase.retryAfterSec} />
          ) : phase.kind === 'daily-cap' ? (
            <DailyCapBody
              character={character}
              dailyCap={dailyCap}
              onUpgrade={handleUpgrade}
            />
          ) : (
            <ErrorBody message={phase.message} />
          )}

          {/* 하단 닫기 (cooldown / error / daily-cap) — close-only flows */}
          {phase.kind === 'cooldown' ||
          phase.kind === 'error' ||
          phase.kind === 'daily-cap' ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-5 kr-num text-[12px] py-2.5 rounded-full transition active:scale-[0.98]"
              style={{
                background: 'rgba(239,244,255,0.08)',
                border: '1px solid rgba(239,244,255,0.14)',
                color: 'var(--cream)',
              }}
            >
              확인
            </button>
          ) : null}
        </div>
      </motion.div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(node, document.body);
}

// ─── 상태별 body ─────────────────────────────────────────────────────

function IdleBody({
  character,
  viewsToday,
  dailyCap,
  onStart,
  onUpgrade,
  onCancel,
}: {
  character: MascotCharacter;
  viewsToday: number;
  dailyCap: number;
  onStart: () => void;
  onUpgrade: () => void;
  onCancel: () => void;
}) {
  const remaining = Math.max(0, dailyCap - viewsToday);
  return (
    <>
      <Ques
        character={character}
        pose="lightbulb"
        className="w-24 h-24 md:w-28 md:h-28 mb-2"
      />
      <span
        className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
        style={{
          background: 'rgba(167,139,250,0.18)',
          border: '1px solid rgba(167,139,250,0.55)',
        }}
      >
        <Zap size={22} fill="#A78BFA" strokeWidth={0} />
      </span>
      <h3 id="ad-reward-title" className="kr-heading text-[19px] mb-1.5">
        광고 보고 ⚡ {AD_REWARD} 충전
      </h3>
      <p className="kr-body text-[12.5px] text-cream/70 leading-[1.55]">
        5초 짧은 광고 후 에너지가 즉시 충전돼요.
      </p>
      {/* 남은 광고 횟수 칩 — 일일 한도 시각화 */}
      <span
        className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full"
        style={{
          background: 'rgba(111,255,0,0.10)',
          border: '1px solid rgba(111,255,0,0.35)',
        }}
        aria-label={`오늘 남은 광고 보기 ${remaining}회 중 ${dailyCap}회`}
      >
        <PlayCircle size={11} strokeWidth={2.4} style={{ color: 'var(--neon)' }} />
        <span
          className="kr-num text-[11px] tabular-nums"
          style={{ color: 'var(--neon)', letterSpacing: '0.04em' }}
        >
          오늘 남은 광고 {remaining}/{dailyCap}
        </span>
      </span>

      <div className="w-full mt-5 flex flex-col gap-2">
        <button
          type="button"
          onClick={onStart}
          className="w-full kr-num text-[13px] font-medium py-3 rounded-full inline-flex items-center justify-center gap-2 transition active:scale-[0.98]"
          style={{
            background: 'var(--neon)',
            color: '#0a1f00',
            boxShadow: '0 6px 18px -4px rgba(111,255,0,0.55)',
          }}
        >
          <PlayCircle size={14} strokeWidth={2.4} />
          광고 보기
        </button>

        {/* 결제 유도 — 광고 없이 ⚡ 무제한. secondary 톤 (보라). */}
        <button
          type="button"
          onClick={onUpgrade}
          className="w-full kr-num text-[12.5px] py-2.5 rounded-full inline-flex items-center justify-center gap-2 transition active:scale-[0.98]"
          style={{
            background: 'rgba(167,139,250,0.18)',
            border: '1px solid rgba(167,139,250,0.5)',
            color: '#A78BFA',
          }}
        >
          <Crown size={13} strokeWidth={2.4} />
          광고 없이 ⚡ 무제한 — 프리미엄 보기
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full kr-num text-[12px] py-2 rounded-full transition active:scale-[0.98]"
          style={{
            background: 'rgba(239,244,255,0.06)',
            border: '1px solid rgba(239,244,255,0.12)',
            color: 'rgba(239,244,255,0.75)',
          }}
        >
          나중에
        </button>
      </div>
    </>
  );
}

function PlayingBody({
  character,
  progress,
}: {
  character: MascotCharacter;
  progress: number;
}) {
  return (
    <>
      <div
        className="w-full aspect-[16/9] rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center"
        style={{
          background:
            'linear-gradient(135deg, rgba(167,139,250,0.22), rgba(103,232,249,0.18))',
          border: '1px solid rgba(167,139,250,0.3)',
        }}
      >
        {/* placeholder ad — QuestDP 내부 광고 슬롯 (실제 AdSense/AdMob 자리) */}
        <div className="text-center px-4">
          <div
            className="kr-num uppercase tracking-widest text-[10px] mb-1.5"
            style={{ color: 'rgba(239,244,255,0.55)', letterSpacing: '0.18em' }}
          >
            SPONSORED
          </div>
          <div className="kr-heading text-[15px] text-cream/95 mb-1">
            QuestDP — 게임으로 합격
          </div>
          <div className="kr-body text-[11px] text-cream/65 leading-[1.5]">
            ADsP·SQLD 자격증, 토리·셀리와 함께
          </div>
        </div>
        {/* 진행바 */}
        <div
          className="absolute left-0 right-0 bottom-0 h-1"
          style={{ background: 'rgba(0,0,0,0.35)' }}
        >
          <div
            className="h-full transition-[width] duration-100"
            style={{
              width: `${progress * 100}%`,
              background:
                'linear-gradient(90deg, #A78BFA 0%, #67e8f9 100%)',
            }}
          />
        </div>
      </div>

      <Ques character={character} pose="think" className="w-20 h-20 mb-2" />
      <h3 id="ad-reward-title" className="kr-heading text-[18px] mb-1">
        잠깐만 봐주세요
      </h3>
      <p className="kr-body text-[12.5px] text-cream/65 leading-[1.55]">
        끝나면 ⚡ {AD_REWARD} 충전돼요.
      </p>
    </>
  );
}

function SuccessBody({
  character,
  granted,
  remaining,
  viewsToday,
  dailyCap,
}: {
  character: MascotCharacter;
  granted: number;
  remaining: number;
  viewsToday: number;
  dailyCap: number;
}) {
  const left = Math.max(0, dailyCap - viewsToday);
  return (
    <>
      <Ques
        character={character}
        pose="celebrate"
        className="w-28 h-28 md:w-32 md:h-32 mb-2"
      />
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 18 }}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-2.5"
        style={{
          background: 'rgba(167,139,250,0.22)',
          border: '1px solid rgba(167,139,250,0.55)',
        }}
      >
        <Zap size={16} fill="#A78BFA" strokeWidth={0} />
        <span
          className="kr-num text-[14px] tabular-nums"
          style={{ color: '#A78BFA' }}
        >
          +{granted}
        </span>
      </motion.span>
      <h3 id="ad-reward-title" className="kr-heading text-[18px] mb-1">
        충전 완료!
      </h3>
      <p className="kr-body text-[12.5px] text-cream/65 leading-[1.55]">
        지금 ⚡ <span className="kr-num text-cream/90">{remaining}</span> 보유 중.
      </p>
      <p className="kr-body text-[11px] text-cream/45 leading-[1.55] mt-1">
        오늘 남은 광고 {left}/{dailyCap}회
      </p>
    </>
  );
}

function CapBody({ character }: { character: MascotCharacter }) {
  return (
    <>
      <Ques
        character={character}
        pose="happy"
        className="w-24 h-24 md:w-28 md:h-28 mb-2"
      />
      <span
        className="inline-flex items-center justify-center w-11 h-11 rounded-full mb-3"
        style={{
          background: 'rgba(111,255,0,0.18)',
          border: '1px solid rgba(111,255,0,0.55)',
        }}
      >
        <Check size={18} strokeWidth={2.6} style={{ color: 'var(--neon)' }} />
      </span>
      <h3 id="ad-reward-title" className="kr-heading text-[18px] mb-1">
        이미 가득 차 있어요
      </h3>
      <p className="kr-body text-[12.5px] text-cream/65 leading-[1.55]">
        에너지를 쓰고 다시 와주세요.
      </p>
    </>
  );
}

function DailyCapBody({
  character,
  dailyCap,
  onUpgrade,
}: {
  character: MascotCharacter;
  dailyCap: number;
  onUpgrade: () => void;
}) {
  return (
    <>
      <Ques
        character={character}
        pose="sleep"
        className="w-24 h-24 md:w-28 md:h-28 mb-2"
      />
      <span
        className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
        style={{
          background: 'rgba(167,139,250,0.16)',
          border: '1px solid rgba(167,139,250,0.55)',
        }}
      >
        <Zap size={20} fill="#A78BFA" strokeWidth={0} />
      </span>
      <h3 id="ad-reward-title" className="kr-heading text-[18px] mb-1">
        오늘 광고 모두 소진
      </h3>
      <p className="kr-body text-[12.5px] text-cream/70 leading-[1.55]">
        하루 {dailyCap}회 충전이 끝났어요. 자정에 다시 열려요.
      </p>
      <p className="kr-body text-[11.5px] text-cream/50 leading-[1.55] mt-2">
        지금 더 풀고 싶다면 프리미엄으로 ⚡ 무제한.
      </p>
      <div className="w-full mt-4">
        <button
          type="button"
          onClick={onUpgrade}
          className="w-full kr-num text-[12.5px] py-2.5 rounded-full inline-flex items-center justify-center gap-2 transition active:scale-[0.98]"
          style={{
            background: 'rgba(167,139,250,0.22)',
            border: '1px solid rgba(167,139,250,0.55)',
            color: '#A78BFA',
          }}
        >
          <Crown size={13} strokeWidth={2.4} />
          광고 없이 ⚡ 무제한 — 프리미엄 보기
        </button>
      </div>
    </>
  );
}

function CooldownBody({ retryAfterSec }: { retryAfterSec: number }) {
  return (
    <>
      <span
        className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
        style={{
          background: 'rgba(167,139,250,0.16)',
          border: '1px solid rgba(167,139,250,0.55)',
        }}
      >
        <Clock size={20} strokeWidth={2.4} style={{ color: '#A78BFA' }} />
      </span>
      <h3 id="ad-reward-title" className="kr-heading text-[18px] mb-1">
        잠시만 기다려주세요
      </h3>
      <p className="kr-body text-[12.5px] text-cream/70 leading-[1.55]">
        다음 광고까지 약{' '}
        <span className="kr-num text-[#A78BFA]">
          {formatRetryAfter(retryAfterSec)}
        </span>
        .
      </p>
      <p className="kr-body text-[11px] text-cream/45 leading-[1.55] mt-1">
        쿨다운 {AD_COOLDOWN_SEC}초 — 너무 빨리 보면 잠깐 쉬어가요.
      </p>
    </>
  );
}

function ErrorBody({ message }: { message: string }) {
  return (
    <>
      <span
        className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
        style={{
          background: 'rgba(248,113,113,0.16)',
          border: '1px solid rgba(248,113,113,0.55)',
        }}
      >
        <AlertTriangle
          size={20}
          strokeWidth={2.4}
          style={{ color: '#f87171' }}
        />
      </span>
      <h3 id="ad-reward-title" className="kr-heading text-[18px] mb-1">
        잠깐 문제가 있어요
      </h3>
      <p className="kr-body text-[12.5px] text-cream/65 leading-[1.55]">
        {message}
      </p>
    </>
  );
}

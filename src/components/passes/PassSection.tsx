/**
 * PassSection — StatsPage 의 N회독 종합 카드.
 *
 * 구성:
 *   - 상단: Tier 카드 (PassTierBadge size='lg' + 의미 설명)
 *   - 중간: Stamp 컬렉션 그리드 (과목 × 챕터 × 회독 도트)
 *   - 하단: "회독 다시 시작" 두 번 confirm 버튼 (XP/Level/Streak 보존 명시)
 *
 * 인증되지 않은 사용자: 미로그인 안내 + Tier 시스템 소개
 * 인증되었지만 마이그 미적용: 모든 stamps 빈 상태로 정상 노출 (BRONZE)
 */

import { useEffect, useState } from 'react';
import {
  RotateCcw,
  Trophy,
  Loader2,
  Wrench,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import type { Subject } from '@/types/question';
import {
  PASS_TIER_MEANING,
  PASS_TIER_VISUAL,
  type PassStamp,
  type PassTier,
} from '@/types/passes';
import { usePassSnapshot, resetPassProgress } from '@/game/passSync';
import { DEV_UNLOCK_KEY, isDevUnlockEnabled } from '@/game/passes';
import { useMyProfile } from '@/data/profile';
import {
  getSupabase,
  isSupabaseConfigured,
  onAuthStateChange,
} from '@/lib/supabase';
import PassTierBadge from './PassTierBadge';

const SUBJECT_LABEL: Record<Subject, string> = {
  adsp: 'ADSP',
  sqld: 'SQLD',
};
const SUBJECT_ACCENT: Record<Subject, string> = {
  adsp: '#67e8f9',
  sqld: '#c084fc',
};

const TIER_FOR_PASS: Record<number, PassTier> = {
  1: 'bronze',
  2: 'gold',
  3: 'master',
};

export default function PassSection() {
  const passSnap = usePassSnapshot();
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  // ── Tier 룰 설명 collapsible ─────────────────────────────
  const [explainOpen, setExplainOpen] = useState(false);

  // ── admin 권한 — 검수 모드 노출 가드 ───────────────────────
  // useMyProfile 의 localStorage isAdmin 이 stale 일 수 있어 server 직접 fetch 도 병행.
  // (Header AdminLink 와 동일 패턴)
  const profile = useMyProfile();
  const [serverAdmin, setServerAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setServerAdmin(false);
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      setServerAdmin(false);
      return;
    }
    let cancelled = false;

    const checkRole = async (userId: string | undefined) => {
      if (!userId) {
        if (!cancelled) setServerAdmin(false);
        return;
      }
      try {
        const { data } = await sb
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
        if (cancelled) return;
        setServerAdmin(data?.role === 'admin');
      } catch {
        if (!cancelled) setServerAdmin(false);
      }
    };

    // 초기 1회
    sb.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      void checkRole(data.session?.user.id);
    });

    // SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED 모두 재확인
    const unsubAuth = onAuthStateChange((_event, session) => {
      void checkRole(session?.user.id);
    });

    return () => {
      cancelled = true;
      unsubAuth();
    };
  }, []);
  const isAdmin = profile.isAdmin || serverAdmin === true;

  // ── 검수용 dev 토글 ──────────────────────────────────────
  // localStorage 의 unlockAllPasses 플래그. ON 시 모든 회독 탭 강제 unlocked.
  // 마이그 0013 적용 전 stamp 발급 불가 환경에서 검수하려고 추가.
  const [devUnlock, setDevUnlock] = useState<boolean>(() => isDevUnlockEnabled());
  useEffect(() => {
    // 다른 탭에서 변경 시 동기화 (선택적)
    const handler = () => setDevUnlock(isDevUnlockEnabled());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);
  const handleToggleDevUnlock = () => {
    const next = !devUnlock;
    if (next) {
      window.localStorage.setItem(DEV_UNLOCK_KEY, '1');
    } else {
      window.localStorage.removeItem(DEV_UNLOCK_KEY);
    }
    setDevUnlock(next);
    // 같은 탭 내에선 storage 이벤트 안 뜨므로 페이지 reload 권장 (탭 컴포넌트가 함수 호출 시점만 체크)
    // → 사용자가 ZoneScreen 재진입 시 적용됨. 즉시 반영하려면 reload.
    window.setTimeout(() => window.location.reload(), 200);
  };

  const handleReset = async () => {
    if (!passSnap.authed) return;
    const first = window.confirm(
      '회독 진행도를 초기화할까요?\n\n· stamp 모두 삭제\n· Pass Tier → BRONZE\n· XP / Level / 친구 / 북마크 → 보존',
    );
    if (!first) return;
    const second = window.confirm(
      '되돌릴 수 없어요. 한 번 더 확인 — 정말 회독을 처음부터 다시 시작할까요?',
    );
    if (!second) return;
    setResetting(true);
    const result = await resetPassProgress();
    setResetting(false);
    if (result.ok) {
      setResetMsg('회독이 초기화됐습니다. 1회독부터 다시 시작해 주세요.');
      window.setTimeout(() => setResetMsg(null), 4000);
    } else {
      setResetMsg('초기화 실패 — 잠시 후 다시 시도해 주세요.');
      window.setTimeout(() => setResetMsg(null), 4000);
    }
  };

  // 메인 카드 외곽 스타일 (explainer 패널과 공유)
  const cardStyle: React.CSSProperties = {
    background: 'rgba(8, 14, 36, 0.72)',
    backdropFilter: 'blur(16px) saturate(120%)',
    WebkitBackdropFilter: 'blur(16px) saturate(120%)',
    border: '1px solid rgba(239, 244, 255, 0.12)',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.08), 0 6px 24px rgba(0,0,0,0.35)',
  };

  return (
    <>
    <section
      aria-label="회독 진행도"
      className="rounded-[24px] p-5 md:p-6 mb-6 relative overflow-hidden"
      style={cardStyle}
    >
      {/* ── 헤더 + 현재 Tier ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Trophy size={14} className="text-cream/65" />
            <h2 className="kr-heading uppercase text-[11px] tracking-widest text-cream/70">
              회독 Pass Tier
            </h2>
          </div>
          <p className="kr-body text-[12.5px] text-cream/75 leading-[1.55]">
            {passSnap.authed
              ? PASS_TIER_MEANING[passSnap.tier]
              : '로그인 후 stamp · Tier 시스템 활성화. 같은 챕터를 여러 번 풀어 마스터를 향해.'}
          </p>
          {/* 카드 안 헤더 영역 — Tier 원리 보기 작은 ghost 링크 */}
          <button
            type="button"
            onClick={() => setExplainOpen((v) => !v)}
            aria-expanded={explainOpen}
            aria-controls="pass-tier-explain-panel"
            className="kr-num inline-flex items-center gap-1 text-[10.5px] uppercase tracking-widest mt-2.5 transition opacity-75 hover:opacity-100"
            style={{ color: explainOpen ? '#6FFF00' : 'rgba(239,244,255,0.85)' }}
          >
            <HelpCircle size={11} strokeWidth={2.4} />
            TIER 원리 자세히 보기
            {explainOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>
        <PassTierBadge tier={passSnap.tier} size="lg" active showMeaning={false} />
      </div>

      {/* ── Stamp 그리드 ── */}
      <div className="space-y-4 mb-5">
        {(['adsp', 'sqld'] as const).map((subject) => (
          <SubjectStampRow
            key={subject}
            subject={subject}
            stamps={passSnap.stamps.filter((s) => s.subject === subject)}
          />
        ))}
      </div>

      {/* ── 안내 메시지 + reset 버튼 (인증 사용자만) ── */}
      {passSnap.authed ? (
        <div className="pt-4 border-t border-cream/10">
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="kr-body text-[11px] inline-flex items-center gap-1 transition opacity-50 hover:opacity-90 disabled:opacity-30"
            style={{ color: 'rgba(248,113,113,0.85)' }}
          >
            {resetting ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <RotateCcw size={11} strokeWidth={2} />
            )}
            회독 다시 시작 (XP·Level 보존, stamp 만 초기화)
          </button>
          {resetMsg ? (
            <p className="kr-body text-[11px] text-cream/65 mt-2">{resetMsg}</p>
          ) : null}
        </div>
      ) : (
        <p className="kr-body text-[11px] text-cream/45 leading-[1.55] pt-4 border-t border-cream/10">
          ⚠ 로그인 후 stamp · Tier 가 서버에 영구 저장돼 다른 기기에서도 이어서
          풀이할 수 있어요.
        </p>
      )}
    </section>

    {/* ── Tier 원리 자세히 보기 (collapsible) — 메인 카드 밖 별도 패널 ── */}
    {explainOpen ? (
      <section
        id="pass-tier-explain-panel"
        aria-label="Tier 룰 설명"
        className="rounded-[24px] p-5 md:p-6 mb-6 relative overflow-hidden"
        style={cardStyle}
      >
        <TierRulesExplainer />
      </section>
    ) : null}

    {/* ── 검수 모드 — admin 전용. 메인 카드 밖 별도 패널 ── */}
    {isAdmin ? (
      <section
        aria-label="검수 모드 (admin 전용)"
        className="rounded-[24px] p-4 mb-6 flex items-start gap-2.5 relative overflow-hidden"
        style={{
          ...cardStyle,
          background: devUnlock
            ? 'rgba(252,211,77,0.10)'
            : 'rgba(8, 14, 36, 0.72)',
          border: devUnlock
            ? '1px solid rgba(252,211,77,0.45)'
            : '1px solid rgba(239,244,255,0.12)',
        }}
      >
        <Wrench
          size={14}
          className={devUnlock ? 'text-yellow-300/85 mt-0.5' : 'text-cream/55 mt-0.5'}
          strokeWidth={2}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="kr-num text-[10px] uppercase tracking-widest text-cream/70">
              검수 모드
            </span>
            <span
              className="kr-num text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full"
              style={{
                background: 'rgba(245,158,11,0.18)',
                border: '1px solid rgba(245,158,11,0.5)',
                color: '#fbbf24',
              }}
            >
              ADMIN
            </span>
          </div>
          <p className="kr-body text-[11.5px] text-cream/70 leading-[1.5]">
            {devUnlock
              ? '모든 회독 탭이 강제로 열려 있어요. 검수가 끝나면 끄세요.'
              : '마이그 미적용·stamp 없는 상태에서 2·3회독 탭을 강제로 열어 UI 를 검수합니다. 페이지가 새로고침됩니다.'}
          </p>
          <button
            type="button"
            onClick={handleToggleDevUnlock}
            className="kr-num text-[10px] uppercase tracking-widest mt-2 px-3 py-1.5 rounded-full transition active:scale-95"
            style={{
              background: devUnlock
                ? 'rgba(252,211,77,0.22)'
                : 'rgba(239,244,255,0.08)',
              border: devUnlock
                ? '1px solid rgba(252,211,77,0.6)'
                : '1px solid rgba(239,244,255,0.22)',
              color: devUnlock ? 'rgba(253,224,71,0.95)' : 'var(--cream)',
            }}
          >
            {devUnlock ? '검수 모드 끄기' : '🔧 모든 회독 잠금 해제 (검수)'}
          </button>
        </div>
      </section>
    ) : null}
    </>
  );
}

// ----------------------------------------------------------------

/**
 * 처음 보는 사용자를 위한 Tier 룰 설명. 친근한 톤 + 단계별 풀이.
 * 카드 형태로 collapsible 안에 노출.
 */
function TierRulesExplainer() {
  return (
    <div
      id="pass-tier-explain"
      className="mb-5 px-4 py-4 rounded-2xl"
      style={{
        background: 'rgba(111,255,0,0.06)',
        border: '1px solid rgba(111,255,0,0.25)',
      }}
    >
      <p className="kr-body text-[13px] text-cream/85 leading-[1.65] mb-3">
        같은 챕터를 <b>여러 번</b> 풀수록 더 어려운 변형 문제가 등장하고, 누적
        실력은 <b>훈장 (Tier)</b> 으로 표시됩니다. 회독 한 번 = 한 챕터를 75%
        넘게 푸는 것.
      </p>

      <div className="space-y-2.5 mb-3">
        <RuleRow num={1} title="문제 풀어 stamp 모으기">
          어떤 챕터든 <b>정답률 75% 넘게</b> 풀면 그 챕터의 <b>1회독 stamp</b>{' '}
          1개를 얻어요. 같은 회독 안에서 여러 세션 정답률은 합산돼요.
        </RuleRow>
        <RuleRow num={2} title="과목 단위로 회독 완성">
          ADSP 또는 SQLD 한 과목의 <b>모든 챕터</b>에서 1회독 stamp 를 모으면
          <b> SILVER 승급</b>! 알림으로 띄워드려요.
        </RuleRow>
        <RuleRow num={3} title="2회독 도전 = 다음 Tier">
          1회독을 끝낸 챕터는 <b>2회독 탭</b>이 자동으로 열려요. 같은 개념인데
          더 까다로운 변형 문제가 나옵니다. 한 번이라도 시작하면 <b>GOLD</b>
          으로 올라가요.
        </RuleRow>
        <RuleRow num={4} title="모든 챕터 2회독 stamp = PLATINUM">
          한 과목의 모든 챕터를 2회독 75% 까지 끝내면 PLATINUM. 거의 마스터한
          단계에요.
        </RuleRow>
        <RuleRow num={5} title="두 과목 다 3회독 = MASTER">
          ADSP·SQLD 둘 다 모든 챕터를 3회독까지 끝내면 최종 MASTER 훈장. 회독
          시스템의 최정상이에요.
        </RuleRow>
      </div>

      <div
        className="px-3 py-2.5 rounded-xl"
        style={{
          background: 'rgba(8,14,36,0.4)',
          border: '1px solid rgba(239,244,255,0.10)',
        }}
      >
        <p className="kr-body text-[11.5px] text-cream/70 leading-[1.6]">
          <b className="text-cream/85">Tip.</b> 한 번 올라간 Tier 는 절대
          내려가지 않아요. 천천히 풀어도 OK. <br />
          <b className="text-cream/85">Tip.</b> 2·3회독 잠금은 직전 회독 stamp
          로만 풀려요. 챕터별로 독립적으로 진행돼요.
        </p>
      </div>
    </div>
  );
}

function RuleRow({
  num,
  title,
  children,
}: {
  num: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="kr-num inline-flex items-center justify-center shrink-0 rounded-full text-[10px]"
        style={{
          width: 20,
          height: 20,
          background: 'rgba(111,255,0,0.18)',
          border: '1px solid rgba(111,255,0,0.45)',
          color: '#6FFF00',
          fontWeight: 600,
          marginTop: 1,
        }}
      >
        {num}
      </span>
      <div className="min-w-0 flex-1">
        <div className="kr-heading text-[12px] text-cream/95 mb-0.5">{title}</div>
        <p className="kr-body text-[12px] text-cream/70 leading-[1.6]">
          {children}
        </p>
      </div>
    </div>
  );
}

function SubjectStampRow({
  subject,
  stamps,
}: {
  subject: Subject;
  stamps: PassStamp[];
}) {
  const schema = SUBJECT_SCHEMAS[subject];
  const accent = SUBJECT_ACCENT[subject];
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span
          className="kr-num text-[11px] uppercase tracking-widest"
          style={{ color: accent }}
        >
          {SUBJECT_LABEL[subject]}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {schema.chapters.map((ch) => (
          <ChapterStampRow
            key={ch.chapter}
            chapter={ch.chapter}
            title={ch.title}
            stamps={stamps.filter((s) => s.chapter === ch.chapter)}
          />
        ))}
      </div>
    </div>
  );
}

function ChapterStampRow({
  chapter,
  title,
  stamps,
}: {
  chapter: number;
  title: string;
  stamps: PassStamp[];
}) {
  const passSet = new Set(stamps.map((s) => s.passNumber));
  return (
    <div
      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl"
      style={{
        background: 'rgba(239,244,255,0.04)',
        border: '1px solid rgba(239,244,255,0.08)',
      }}
    >
      <div className="min-w-0 flex-1">
        <div className="kr-num text-[10px] uppercase tracking-widest text-cream/45">
          Chapter {chapter}
        </div>
        <div className="kr-body text-[12.5px] text-cream/85 truncate">{title}</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {[1, 2, 3].map((pass) => {
          const earned = passSet.has(pass);
          const tier = TIER_FOR_PASS[pass];
          const visual = PASS_TIER_VISUAL[tier];
          return (
            <span
              key={pass}
              title={`${pass}회독 ${earned ? '완료' : '미완료'}`}
              className="kr-num inline-flex items-center justify-center rounded-full text-[9px]"
              style={{
                width: 22,
                height: 22,
                background: earned ? `${visual.color}33` : 'rgba(239,244,255,0.06)',
                border: `1px solid ${earned ? visual.color : 'rgba(239,244,255,0.18)'}`,
                color: earned ? visual.color : 'rgba(239,244,255,0.45)',
                fontWeight: 600,
              }}
            >
              {pass}
            </span>
          );
        })}
      </div>
    </div>
  );
}

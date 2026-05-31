/**
 * AdminPage — 운영자 전용 대시보드.
 *
 * 진입 규칙:
 *   1) Supabase 미설정/비로그인 → 홈으로 redirect
 *   2) profile.isAdmin === false → 홈으로 redirect (RLS 가 다시 막지만 UX 차원)
 *   3) admin 이면 통계 + 사용자 목록 + 콘텐츠 도구 표시
 *
 * RLS 가 admin 만 전체 read 를 허용하므로 select * 가 일반 user 에겐 본인 행만 반환됩니다.
 * 즉 보안의 1차 라인은 RLS, 2차 라인이 frontend 의 isAdmin 체크.
 */

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  Gauge,
  Plus,
  RefreshCcw,
  Shield,
  Sparkles,
  Ticket,
  Trash2,
  Unlock,
  Users,
} from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { useMyProfile } from '@/data/profile';
import VideoBg from '@/components/ui/VideoBg';
import { VIDEO_URLS } from '@/data/site';
import { setDevUnlockFlags, useDevUnlockFlags } from '@/game/useDevUnlockFlags';

interface UserRow {
  id: string;
  tag: string;
  display_name: string;
  role: 'user' | 'admin';
  total_xp: number;
  lesson_xp: number;
  level: number;
  is_premium: boolean;
  last_seen_at: string;
  created_at: string;
}

type UserSortKey = 'xp' | 'premium' | 'recent';

const USER_SORT_OPTIONS: Array<{ key: UserSortKey; label: string; hint: string }> = [
  { key: 'xp', label: 'XP순', hint: 'XP 높은 순' },
  { key: 'premium', label: '프리미엄순', hint: '프리미엄 먼저' },
  { key: 'recent', label: '최근 접속순', hint: '최근 접속 먼저' },
];

interface TopNewQuestionUser {
  userId: string;
  tag: string;
  displayName: string;
  role: 'user' | 'admin';
  isPremium: boolean;
  newQuestions: number;
  sessions: number;
}

interface QuotaReachedUser {
  userId: string;
  tag: string;
  displayName: string;
  usedCount: number;
  limitCount: number;
}

interface CouponUsageToday {
  userId: string;
  tag: string;
  displayName: string;
  code: string;
  newQuestions: number;
  sessions: number;
  grantedAt: string;
  expiresAt: string | null;
}

interface RapidSubmitUser {
  userId: string;
  tag: string;
  displayName: string;
  submittedQuestions: number;
  sessions: number;
  totalTimeSec: number;
  avgSecPerQuestion: number | null;
}

interface LearningMetrics {
  total_users: number;
  premium_users: number;
  today_answered_questions: number;
  today_completed_concepts: number;
  total_answered_questions: number;
  total_completed_concepts: number;
  top_new_question_users: TopNewQuestionUser[];
  quota_reached_users: QuotaReachedUser[];
  coupon_usage_today: CouponUsageToday[];
  rapid_submit_users: RapidSubmitUser[];
}

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeLearningMetrics(value: unknown): LearningMetrics {
  const row = (value ?? {}) as Partial<LearningMetrics>;
  return {
    total_users: toNumber(row.total_users),
    premium_users: toNumber(row.premium_users),
    today_answered_questions: toNumber(row.today_answered_questions),
    today_completed_concepts: toNumber(row.today_completed_concepts),
    total_answered_questions: toNumber(row.total_answered_questions),
    total_completed_concepts: toNumber(row.total_completed_concepts),
    top_new_question_users: asArray<TopNewQuestionUser>(row.top_new_question_users),
    quota_reached_users: asArray<QuotaReachedUser>(row.quota_reached_users),
    coupon_usage_today: asArray<CouponUsageToday>(row.coupon_usage_today),
    rapid_submit_users: asArray<RapidSubmitUser>(row.rapid_submit_users),
  };
}

function userTotalXp(user: UserRow): number {
  return (user.total_xp ?? 0) + (user.lesson_xp ?? 0);
}

function userLastSeenMs(user: UserRow): number {
  if (!user.last_seen_at) return 0;
  const parsed = Date.parse(user.last_seen_at);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function AdminPage({ onBack }: { onBack: () => void }) {
  const profile = useMyProfile();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userSort, setUserSort] = useState<UserSortKey>('xp');
  const [learningMetrics, setLearningMetrics] = useState<LearningMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** server 직접 확인한 admin 여부. localStorage 가 stale 한 케이스 대응. */
  const [serverAdmin, setServerAdmin] = useState<boolean | null>(null);

  // server 에 직접 admin 여부 확인 — localStorage 우회용 안전망
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
    (async () => {
      const { data: sess } = await sb.auth.getSession();
      if (cancelled) return;
      if (!sess.session) {
        setServerAdmin(false);
        return;
      }
      const { data } = await sb
        .from('profiles')
        .select('role')
        .eq('id', sess.session.user.id)
        .maybeSingle();
      if (!cancelled) setServerAdmin(data?.role === 'admin');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isAdminFinal = profile.isAdmin || serverAdmin === true;
  const sortedUsers = useMemo(() => {
    const byXp = (a: UserRow, b: UserRow) =>
      userTotalXp(b) - userTotalXp(a) || userLastSeenMs(b) - userLastSeenMs(a);
    const byRecent = (a: UserRow, b: UserRow) =>
      userLastSeenMs(b) - userLastSeenMs(a) || userTotalXp(b) - userTotalXp(a);

    return [...users].sort((a, b) => {
      if (userSort === 'premium') {
        const premiumDiff = Number(b.is_premium) - Number(a.is_premium);
        return premiumDiff || byXp(a, b);
      }
      if (userSort === 'recent') return byRecent(a, b);
      return byXp(a, b);
    });
  }, [users, userSort]);

  // ── 검수 모드 — 모든 회독·step 잠금해제 토글 ─────────────────
  // pass + step 두 잠금 시스템을 동시에 ON/OFF. 즉시 반영 (reload 불필요).
  const devUnlock = useDevUnlockFlags();
  const bypassActive = devUnlock.passes && devUnlock.steps;
  const handleToggleBypass = () => {
    const next = !bypassActive;
    setDevUnlockFlags({ passes: next, steps: next });
    // 같은 탭 내 모든 useDevUnlockFlags 구독자에게 즉시 알림 — ZoneScreen 의
    // 잠금 표시가 실시간으로 풀리고, 다음 step 클릭 시 toast 없이 진입.
  };

  // 비-admin 진입 시 홈으로 (clientside guard)
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      window.location.hash = '';
      return;
    }
    // server 확인이 끝났는데도 admin 아니면 redirect
    if (serverAdmin === false && !profile.isAdmin) {
      window.location.hash = '';
    }
  }, [profile.isAdmin, serverAdmin]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    const sb = getSupabase();
    if (!sb) {
      setError('Supabase 연결이 없습니다.');
      setLoading(false);
      return;
    }
    try {
      const [userResult, metricsResult] = await Promise.all([
        sb
          .from('profiles')
          .select(
            'id, tag, display_name, role, total_xp, lesson_xp, level, is_premium, last_seen_at, created_at',
          )
          .order('total_xp', { ascending: false })
          .limit(100),
        sb.rpc('admin_learning_activity'),
      ]);
      if (userResult.error) throw userResult.error;
      if (metricsResult.error) throw metricsResult.error;

      setUsers((userResult.data ?? []) as UserRow[]);
      const metricRow = Array.isArray(metricsResult.data)
        ? metricsResult.data[0]
        : metricsResult.data;
      setLearningMetrics(normalizeLearningMetrics(metricRow));
    } catch (e) {
      setError(e instanceof Error ? e.message : '조회 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminFinal) {
      void refresh();
    }
  }, [isAdminFinal]);

  // server 확인 진행 중인 동안 잠깐 로딩 표시
  if (serverAdmin === null && !profile.isAdmin) {
    return (
      <section className="relative min-h-screen bg-base text-cream flex items-center justify-center">
        <div className="kr-body text-cream/60 text-[14px]">권한 확인 중…</div>
      </section>
    );
  }

  if (!isAdminFinal) {
    return (
      <section className="relative min-h-screen bg-base text-cream flex items-center justify-center px-6">
        <div className="text-center">
          <Shield size={32} className="mx-auto mb-3 text-cream/50" />
          <h1 className="kr-heading text-[20px] mb-2">접근 권한이 없습니다</h1>
          <p className="kr-body text-[13px] text-cream/65 mb-5">
            이 페이지는 운영자 전용이에요.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="kr-heading uppercase text-[12px] tracking-widest px-5 py-3 rounded-full border border-cream/25 hover:bg-cream/10 transition"
          >
            홈으로
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen bg-base text-cream isolate overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <VideoBg src={VIDEO_URLS.pageAmbient} fit="cover" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(1,8,40,0.82) 0%, rgba(1,8,40,0.94) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-5 md:px-8 lg:px-12 pt-7 pb-20">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={onBack}
            aria-label="홈으로"
            className="inline-flex items-center gap-2 kr-heading uppercase text-[11px] tracking-widest text-cream/75 hover:text-neon transition"
          >
            <ArrowLeft size={14} strokeWidth={2.4} />
            홈으로
          </button>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 kr-heading uppercase text-[10px] tracking-widest px-3 py-2 rounded-full border border-cream/25 hover:bg-cream/10 transition disabled:opacity-50"
          >
            <RefreshCcw size={12} strokeWidth={2.4} className={loading ? 'animate-spin' : ''} />
            새로고침
          </button>
        </div>

        <header className="mb-10 pb-6 border-b border-cream/15">
          <div className="kr-heading uppercase text-[10px] tracking-widest text-neon/85 mb-3 inline-flex items-center gap-2">
            <Shield size={12} strokeWidth={2.6} />
            ADMIN
          </div>
          <h1 className="kr-heading text-[28px] md:text-[36px] mb-2">
            운영자 대시보드
          </h1>
          <p className="kr-body text-[13px] text-cream/65">
            서비스 사용 통계와 가입자 목록을 한눈에. 데이터는 Supabase RLS
            정책으로 admin 만 조회 가능합니다.
          </p>
          <p className="kr-body text-[12px] text-cream/45 mt-2">
            운영 통계와 감지 목록은 관리자 QA 계정을 제외한 사용자 기준입니다.
          </p>
        </header>

        {error ? (
          <div className="mb-6 p-4 rounded-lg border border-red-400/40 bg-red-400/10 text-red-200 text-sm">
            {error}
          </div>
        ) : null}

        {/* 통계 카드 */}
        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-6">
          <Stat label="총 가입자" value={learningMetrics?.total_users ?? users.length} />
          <Stat
            label="프리미엄"
            value={
              learningMetrics?.premium_users ??
              users.filter((u) => u.is_premium).length
            }
          />
          <Stat label="오늘 푼 문항" value={learningMetrics?.today_answered_questions ?? 0} />
          <Stat label="오늘 완료한 개념" value={learningMetrics?.today_completed_concepts ?? 0} />
          <Stat label="누적 푼 문항" value={learningMetrics?.total_answered_questions ?? 0} />
          <Stat label="누적 개념 완료" value={learningMetrics?.total_completed_concepts ?? 0} />
        </section>

        <LearningActivityPanels metrics={learningMetrics} loading={loading} />

        {/* 사용자 목록 */}
        <section>
          <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-neon" />
                <h2 className="kr-heading text-[16px]">최근 활성 사용자</h2>
              </div>
              <p className="kr-body mt-1 text-[11px] text-cream/45">
                DB 재조회 없이 현재 불러온 100명을 기준으로 정렬해요.
              </p>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="사용자 목록 정렬">
              {USER_SORT_OPTIONS.map((option) => {
                const active = userSort === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setUserSort(option.key)}
                    title={option.hint}
                    className="kr-heading rounded-full border px-3 py-2 text-[11px] tracking-tight transition"
                    style={{
                      background: active
                        ? 'rgba(209,248,67,0.16)'
                        : 'rgba(239,244,255,0.05)',
                      borderColor: active
                        ? 'rgba(209,248,67,0.55)'
                        : 'rgba(239,244,255,0.14)',
                      color: active ? 'var(--neon)' : 'rgba(239,244,255,0.7)',
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto rounded-[16px] border border-cream/12">
            <table className="w-full text-[12px] kr-body">
              <thead className="bg-cream/5 text-cream/60 uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="text-left px-4 py-3">태그</th>
                  <th className="text-left px-4 py-3">닉네임</th>
                  <th className="text-right px-4 py-3">레벨</th>
                  <th className="text-right px-4 py-3">XP</th>
                  <th className="text-center px-4 py-3">프리미엄</th>
                  <th className="text-center px-4 py-3">역할</th>
                  <th className="text-left px-4 py-3">최근 접속</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && !loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center px-4 py-12 text-cream/45"
                    >
                      가입자가 아직 없습니다.
                    </td>
                  </tr>
                ) : null}
                {sortedUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-cream/10 hover:bg-cream/5 transition"
                  >
                    <td className="px-4 py-3 font-mono text-cream/85">{u.tag}</td>
                    <td className="px-4 py-3 truncate max-w-[160px]">
                      {u.display_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {u.level}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {((u.total_xp ?? 0) + (u.lesson_xp ?? 0)).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.is_premium ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-neon/15 text-neon uppercase tracking-widest">
                          P
                        </span>
                      ) : (
                        <span className="text-cream/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-400/15 text-amber-300 uppercase tracking-widest">
                          <Shield size={10} strokeWidth={2.6} />
                          ADMIN
                        </span>
                      ) : (
                        <span className="text-cream/45 text-[10px] uppercase tracking-widest">
                          user
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-cream/55 text-[11px]">
                      {u.last_seen_at
                        ? new Date(u.last_seen_at).toLocaleString('ko-KR')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 검수 도구 — 모든 잠금 해제 토글 */}
        <section
          className="mt-10 p-5 rounded-[16px] border"
          style={{
            background: bypassActive
              ? 'linear-gradient(135deg, var(--neon-10), var(--neon-04))'
              : 'rgba(239,244,255,0.04)',
            borderColor: bypassActive
              ? 'var(--neon-45)'
              : 'rgba(239,244,255,0.12)',
          }}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h3 className="kr-heading text-[13px] mb-2 inline-flex items-center gap-2">
                <Unlock
                  size={12}
                  strokeWidth={2.6}
                  className={bypassActive ? 'text-neon' : 'text-cream/55'}
                />
                모든 회독 잠금해제 (검수)
              </h3>
              <p className="kr-body text-[12px] text-cream/65 leading-[1.7]">
                토글 ON 시 <strong>이전 step 클리어 여부</strong> +{' '}
                <strong>N회독 stamp 보유 여부</strong> +{' '}
                <strong>마무리 step 완주 조건</strong> 과 무관하게 모든
                콘텐츠가 즉시 열람 가능해집니다. 검수·QA 용도. OFF 시 정상
                잠금 정책으로 즉시 복원 (reload 불필요).
              </p>
              <p className="kr-body text-[11px] text-cream/45 mt-2 leading-[1.6]">
                저장 위치: localStorage (디바이스별 — 다른 기기에선 별도 토글
                필요). 같은 탭 내 ZoneScreen / GamePage 가 즉시 재렌더링됩니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleBypass}
              className="kr-heading uppercase text-[11px] tracking-widest px-4 py-2.5 rounded-full transition shrink-0"
              style={{
                background: bypassActive
                  ? 'var(--neon-95)'
                  : 'rgba(239,244,255,0.08)',
                color: bypassActive ? 'var(--base)' : 'var(--cream)',
                border: bypassActive
                  ? '1px solid var(--neon-100)'
                  : '1px solid rgba(239,244,255,0.25)',
                boxShadow: bypassActive
                  ? '0 6px 20px var(--neon-35)'
                  : 'none',
              }}
            >
              {bypassActive ? '✓ 검수 모드 ON' : '검수 모드 OFF'}
            </button>
          </div>
        </section>

        {/* 프로모션 코드 관리 — 활성 코드 목록 + 생성/삭제 */}
        <PromoCodeManager />

        {/* 안내 */}
        <section className="mt-6 p-5 rounded-[16px] border border-cream/12 bg-cream/5">
          <h3 className="kr-heading text-[13px] mb-2 inline-flex items-center gap-2">
            <Shield size={12} strokeWidth={2.6} className="text-neon" />
            운영자 추가/제거
          </h3>
          <p className="kr-body text-[12px] text-cream/65 leading-[1.7]">
            Supabase 마이그레이션{' '}
            <code className="px-1.5 py-0.5 rounded bg-cream/10 text-cream/85">
              supabase/migrations/0009_admin_role.sql
            </code>{' '}
            의{' '}
            <code className="px-1.5 py-0.5 rounded bg-cream/10 text-cream/85">
              is_admin_email()
            </code>{' '}
            함수의 array 에 운영자 이메일을 추가/제거한 뒤 재배포하면 됩니다.
            기존 가입자도 즉시 자동 승격/강등됩니다.
          </p>
        </section>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-[16px] p-4 md:p-5"
      style={{
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
        border: '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
    >
      <div className="kr-heading uppercase text-[10px] tracking-widest text-cream/55 mb-2">
        {label}
      </div>
      <div className="kr-heading text-[24px] md:text-[28px] tabular-nums">
        {value.toLocaleString('ko-KR')}
      </div>
    </div>
  );
}

function LearningActivityPanels({
  metrics,
  loading,
}: {
  metrics: LearningMetrics | null;
  loading: boolean;
}) {
  const topNewUsers = metrics?.top_new_question_users ?? [];
  const quotaReachedUsers = metrics?.quota_reached_users ?? [];
  const couponUsage = metrics?.coupon_usage_today ?? [];
  const rapidUsers = metrics?.rapid_submit_users ?? [];

  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-10">
      <MetricPanel
        title="오늘 새 문제를 가장 많이 본 사용자"
        caption="관리자 제외. 문제를 보여준 순간 기준이며 중도 이탈도 포함됩니다."
        icon={<Eye size={15} strokeWidth={2.5} />}
        loading={loading && !metrics}
        empty={topNewUsers.length === 0}
      >
        {topNewUsers.map((row) => (
          <MetricUserRow
            key={row.userId}
            tag={row.tag}
            displayName={row.displayName}
            value={`${row.newQuestions.toLocaleString('ko-KR')}문항`}
            meta={`${row.sessions.toLocaleString('ko-KR')}세션${
              row.isPremium ? ' · 프리미엄' : ''
            }${row.role === 'admin' ? ' · admin' : ''}`}
          />
        ))}
      </MetricPanel>

      <MetricPanel
        title="오늘 10개 한도에 도달한 사용자"
        caption="관리자 제외. 무료 플랜의 KST 일일 새 문제 한도 도달 여부입니다."
        icon={<CheckCircle2 size={15} strokeWidth={2.5} />}
        loading={loading && !metrics}
        empty={quotaReachedUsers.length === 0}
      >
        {quotaReachedUsers.map((row) => (
          <MetricUserRow
            key={row.userId}
            tag={row.tag}
            displayName={row.displayName}
            value={`${row.usedCount.toLocaleString('ko-KR')} / ${row.limitCount.toLocaleString(
              'ko-KR',
            )}`}
            meta="오늘 새 문제 사용량"
          />
        ))}
      </MetricPanel>

      <MetricPanel
        title="쿠폰 사용자 중 오늘 새 문제 사용량"
        caption="관리자 제외. 활성 쿠폰 권한 사용자의 오늘 새 문제 노출량입니다."
        icon={<Ticket size={15} strokeWidth={2.5} />}
        loading={loading && !metrics}
        empty={couponUsage.length === 0}
      >
        {couponUsage.map((row) => (
          <MetricUserRow
            key={`${row.userId}-${row.code}`}
            tag={row.tag}
            displayName={row.displayName}
            value={`${row.newQuestions.toLocaleString('ko-KR')}문항`}
            meta={`${row.code} · ${row.sessions.toLocaleString('ko-KR')}세션`}
          />
        ))}
      </MetricPanel>

      <MetricPanel
        title="짧은 시간에 많은 문제를 제출한 사용자"
        caption="관리자 제외. 오늘 5문항 이상 제출한 사용자 중 문항당 시간이 짧은 순서입니다."
        icon={<Gauge size={15} strokeWidth={2.5} />}
        loading={loading && !metrics}
        empty={rapidUsers.length === 0}
      >
        {rapidUsers.map((row) => (
          <MetricUserRow
            key={row.userId}
            tag={row.tag}
            displayName={row.displayName}
            value={`${row.submittedQuestions.toLocaleString('ko-KR')}문항`}
            meta={`${row.avgSecPerQuestion ?? 0}초/문항 · ${row.sessions.toLocaleString(
              'ko-KR',
            )}세션`}
            tone={(row.avgSecPerQuestion ?? 999) <= 2 ? 'warn' : 'default'}
          />
        ))}
      </MetricPanel>
    </section>
  );
}

function MetricPanel({
  title,
  caption,
  icon,
  loading,
  empty,
  children,
}: {
  title: string;
  caption: string;
  icon: ReactNode;
  loading: boolean;
  empty: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="rounded-[16px] p-4 md:p-5 min-h-[220px]"
      style={{
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.085) 0%, rgba(255,255,255,0.035) 100%)',
        border: '1px solid rgba(255,255,255,0.13)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-cream/15 bg-cream/8 text-neon">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="kr-heading text-[14px] leading-tight">{title}</h3>
          <p className="kr-body text-[11px] text-cream/48 mt-1 leading-[1.5]">
            {caption}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="kr-body text-[12px] text-cream/45 py-8 text-center">
          불러오는 중…
        </div>
      ) : empty ? (
        <div className="kr-body text-[12px] text-cream/42 py-8 text-center">
          데이터 없음
        </div>
      ) : (
        <div className="space-y-2.5">{children}</div>
      )}
    </div>
  );
}

function MetricUserRow({
  tag,
  displayName,
  value,
  meta,
  tone = 'default',
}: {
  tag: string;
  displayName: string;
  value: string;
  meta: string;
  tone?: 'default' | 'warn';
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[12px] border border-cream/10 bg-base/25 px-3 py-2.5">
      <div className="min-w-0">
        <div className="kr-heading text-[12px] text-cream truncate">
          {displayName || '—'}
        </div>
        <div className="kr-num text-[10px] text-cream/42 truncate mt-0.5">
          {tag} · {meta}
        </div>
      </div>
      <div
        className="kr-num text-[12px] tabular-nums shrink-0"
        style={{ color: tone === 'warn' ? '#fbbf24' : 'var(--neon)' }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── 프로모션 코드 관리 ─────────────────────────────────────────────

interface RedemptionCodeRow {
  code: string;
  granted_tier: string;
  max_uses: number;
  uses: number;
  note: string | null;
  expires_at: string | null;
  created_at: string;
  last_redeemed_by: string | null;
  last_redeemed_at: string | null;
}

interface RedemptionCodeUsageRow {
  code: string;
  grant_id: string;
  user_id: string;
  tag: string;
  display_name: string;
  role: 'user' | 'admin';
  is_premium: boolean;
  premium_until: string | null;
  total_xp: number;
  lesson_xp: number;
  display_xp: number;
  level: number;
  energy_count: number;
  user_created_at: string;
  last_seen_at: string;
  granted_at: string;
  grant_expires_at: string | null;
  revoked_at: string | null;
  note: string | null;
  code_exists: boolean;
  code_uses: number | null;
  code_max_uses: number | null;
}

/** 코드 무작위 suffix 생성 — 혼동되기 쉬운 0/O/1/I 제외. */
function genCodeSuffix(len = 8): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function formatDateShort(value: string | null | undefined): string {
  if (!value) return '없음';
  return new Date(value).toLocaleDateString('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatDateTimeShort(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isActivePromoGrant(row: RedemptionCodeUsageRow): boolean {
  if (row.revoked_at) return false;
  return !row.grant_expires_at || new Date(row.grant_expires_at) > new Date();
}

function PromoCodeManager() {
  const [codes, setCodes] = useState<RedemptionCodeRow[]>([]);
  const [usages, setUsages] = useState<RedemptionCodeUsageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxUses, setMaxUses] = useState<number>(1);
  const [note, setNote] = useState('');
  const [expiresAt, setExpiresAt] = useState(''); // YYYY-MM-DD form
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);

  const reload = async () => {
    setLoading(true);
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }
    try {
      const [codeResult, usageResult] = await Promise.all([
        sb
          .from('redemption_codes')
          .select(
            'code, granted_tier, max_uses, uses, note, expires_at, created_at, last_redeemed_by, last_redeemed_at',
          )
          .order('created_at', { ascending: false })
          .limit(100),
        sb.rpc('admin_redemption_code_usage'),
      ]);
      if (!codeResult.error && codeResult.data) {
        setCodes(codeResult.data as RedemptionCodeRow[]);
      }
      if (codeResult.error) {
        console.error('[promo] code reload failed', codeResult.error);
        setFeedback({ kind: 'err', msg: `코드 목록 조회 실패 — ${codeResult.error.message}` });
      }
      if (!usageResult.error && usageResult.data) {
        setUsages(usageResult.data as RedemptionCodeUsageRow[]);
      }
      if (usageResult.error) {
        console.error('[promo] usage reload failed', usageResult.error);
        setUsages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const usageByCode = useMemo(() => {
    const grouped = new Map<string, RedemptionCodeUsageRow[]>();
    for (const usage of usages) {
      const key = usage.code.toUpperCase();
      const list = grouped.get(key) ?? [];
      list.push(usage);
      grouped.set(key, list);
    }
    return grouped;
  }, [usages]);

  const archivedUsageGroups = useMemo(() => {
    const currentCodes = new Set(codes.map((row) => row.code.toUpperCase()));
    return Array.from(usageByCode.entries())
      .filter(([code]) => !currentCodes.has(code))
      .sort((a, b) => {
        const aTime = Date.parse(a[1][0]?.granted_at ?? '1970-01-01');
        const bTime = Date.parse(b[1][0]?.granted_at ?? '1970-01-01');
        return bTime - aTime;
      });
  }, [codes, usageByCode]);

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    setFeedback(null);
    try {
      const sb = getSupabase();
      if (!sb) {
        setFeedback({ kind: 'err', msg: 'Supabase 미설정 — 발급 불가' });
        return;
      }
      const code = `QDP-PROMO-${genCodeSuffix(8)}`;
      const expires = expiresAt
        ? new Date(`${expiresAt}T23:59:59`).toISOString()
        : null;
      const { error } = await sb.from('redemption_codes').insert({
        code,
        granted_tier: 'lifetime',
        max_uses: Math.max(1, maxUses | 0),
        note: note.trim() || null,
        expires_at: expires,
      });
      if (error) {
        // eslint-disable-next-line no-console
        console.error('[promo] insert failed', error);
        setFeedback({
          kind: 'err',
          msg: `발급 실패 — ${error.message} (코드 ${error.code ?? '?'})`,
        });
        return;
      }
      setFeedback({ kind: 'ok', msg: `${code} 발급됨` });
      setNote('');
      await reload();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[promo] exception', e);
      const msg = e instanceof Error ? e.message : String(e);
      setFeedback({ kind: 'err', msg: `오류 — ${msg}` });
    } finally {
      // 어떤 경우에도 발급 중 spinner 해제 (이전 코드의 hang 보호)
      setCreating(false);
    }
  };

  // 동시 호출 방지 — 사용자가 삭제 버튼 빠르게 더블클릭하는 케이스 보호.
  // RPC 가 idempotent 이지만 두 번째 호출은 의미 X + 사용자 혼란 → UI 차단.
  const [deleting, setDeleting] = useState<string | null>(null);

  /**
   * 코드 삭제 — 0024 마이그의 두 RPC 활용.
   *
   * 흐름:
   *   1) count_redemption_code_users 로 영향받을 사용자 수 미리 조회
   *   2) 사용자 0명 → "정말 삭제?" 단일 confirm → revoke RPC (회수 0 + 코드 삭제)
   *   3) 사용자 N명 → 2단계 confirm:
   *      a. "이 코드 N명 사용 — 다음 단계로 진행?" (cancel 가능)
   *      b. "정말 N명 권한 박탈?" (마지막 안전망)
   *   4) revoke_redemption_code(p_delete_code=true) 호출
   *   5) 결과 표시 (revoked/demoted/deleted 카운트)
   *
   * 에러 케이스 (모두 graceful):
   *   - count RPC 실패 → 메시지 + 종료 (DB 변화 0)
   *   - 권한 부족 (not_admin) → 메시지 + 종료
   *   - 코드 미존재 → count 결과 0 + 정상 흐름 (이미 삭제된 케이스)
   *   - revoke RPC 실패 → 메시지 + 부분 상태 X (RPC 가 atomic transaction)
   *   - 멱등 — 두 번째 호출 시 revoked_count=0 graceful
   *   - paid 사용자 보호 — RPC 안에서 다른 source 의 활성 grant 검사 후 demote
   */
  const handleDelete = async (code: string) => {
    if (deleting) return; // 동시 호출 차단
    const sb = getSupabase();
    if (!sb) {
      setFeedback({ kind: 'err', msg: 'Supabase 미설정' });
      return;
    }

    setDeleting(code);
    try {
      // ── 1) 영향받을 사용자 수 조회 ────────────────────────────────────
      const { data: countData, error: countError } = await sb.rpc(
        'count_redemption_code_users',
        { p_code: code },
      );
      if (countError) {
        // eslint-disable-next-line no-console
        console.error('[promo] count failed', countError);
        setFeedback({
          kind: 'err',
          msg: `사용자 조회 실패 — ${countError.message}`,
        });
        return;
      }
      const cnt = (countData as Array<{
        ok: boolean;
        reason: string | null;
        active_grant_count: number;
        total_grant_count: number;
      }> | null)?.[0];
      if (!cnt || !cnt.ok) {
        const reason = cnt?.reason ?? 'unknown';
        setFeedback({
          kind: 'err',
          msg: `조회 거절 — ${reason === 'not_admin' ? '관리자 권한 필요' : reason}`,
        });
        return;
      }
      const activeCount = cnt.active_grant_count ?? 0;

      // ── 2) 사용자 0명 — 단일 confirm ──────────────────────────────────
      if (activeCount === 0) {
        if (
          !window.confirm(
            `"${code}" 코드를 삭제하시겠어요?\n\n이 코드를 사용한 사람이 없습니다.`,
          )
        ) {
          return;
        }
        // 회수 + 삭제 (회수 대상 0이라 effectively 코드 삭제만)
      } else {
        // ── 3) 사용자 N명 — 2단계 confirm ──────────────────────────────
        if (
          !window.confirm(
            `⚠️ "${code}" 코드 처리\n\n` +
              `이 코드를 사용한 사용자: ${activeCount}명 (활성 권한)\n\n` +
              `[확인] = 다음 단계 (권한 박탈 여부 한 번 더 확인)\n` +
              `[취소] = 작업 취소`,
          )
        ) {
          return;
        }
        if (
          !window.confirm(
            `정말 ${activeCount}명의 유료 권한을 박탈하시겠어요?\n\n` +
              `이 작업은 즉시 반영됩니다. 박탈된 사용자는 ⚡ 5/5 게스트로 전환됩니다.\n` +
              `(다른 source 의 활성 권한 — 결제·admin 부여 — 이 있는 사용자는 보존됩니다.)\n\n` +
              `[확인] = 권한 박탈 + 코드 삭제\n` +
              `[취소] = 작업 취소`,
          )
        ) {
          return;
        }
      }

      // ── 4) revoke RPC 호출 ────────────────────────────────────────────
      const { data: revokeData, error: revokeError } = await sb.rpc(
        'revoke_redemption_code',
        { p_code: code, p_delete_code: true },
      );
      if (revokeError) {
        // eslint-disable-next-line no-console
        console.error('[promo] revoke failed', revokeError);
        setFeedback({
          kind: 'err',
          msg: `회수 실패 — ${revokeError.message}`,
        });
        return;
      }
      const r = (revokeData as Array<{
        ok: boolean;
        reason: string | null;
        revoked_count: number;
        profiles_demoted: number;
        code_deleted: boolean;
      }> | null)?.[0];
      if (!r || !r.ok) {
        const reason = r?.reason ?? 'unknown';
        setFeedback({
          kind: 'err',
          msg: `회수 거절 — ${reason === 'not_admin' ? '관리자 권한 필요' : reason}`,
        });
        return;
      }

      // ── 5) 결과 표시 ──────────────────────────────────────────────────
      const parts: string[] = [];
      if (r.code_deleted) parts.push(`${code} 삭제됨`);
      if (r.revoked_count > 0) parts.push(`grant ${r.revoked_count}건 회수`);
      if (r.profiles_demoted > 0) parts.push(`권한 박탈 ${r.profiles_demoted}명`);
      if (parts.length === 0) {
        // 이미 삭제됐던 케이스 — 멱등 보장 메시지
        parts.push(`${code} — 이미 처리됨 (변경 사항 없음)`);
      }
      setFeedback({ kind: 'ok', msg: parts.join(' · ') });
      await reload();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[promo] delete exception', e);
      const msg = e instanceof Error ? e.message : String(e);
      setFeedback({ kind: 'err', msg: `오류 — ${msg}` });
    } finally {
      setDeleting(null);
    }
  };

  const isExpired = (row: RedemptionCodeRow): boolean =>
    !!row.expires_at && new Date(row.expires_at) < new Date();
  const isDepleted = (row: RedemptionCodeRow): boolean => row.uses >= row.max_uses;

  return (
    <section className="mt-10">
      <header className="flex items-center justify-between mb-4">
        <h2 className="kr-heading text-[16px] inline-flex items-center gap-2">
          <Sparkles size={16} className="text-neon" strokeWidth={2.4} />
          프로모션 코드 관리
        </h2>
        <button
          type="button"
          onClick={() => void reload()}
          aria-label="새로고침"
          className="kr-num text-[11px] text-cream/65 hover:text-neon transition inline-flex items-center gap-1"
        >
          <RefreshCcw size={11} strokeWidth={2.4} />
          새로고침
        </button>
      </header>

      {/* 코드 발급 폼 */}
      <div className="rounded-[16px] p-4 md:p-5 mb-5 border border-cream/12 bg-cream/5">
        <div className="kr-heading uppercase text-[10px] tracking-widest text-cream/55 mb-3">
          코드 발급
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5 min-w-[140px]">
            <span className="kr-num text-[10px] uppercase tracking-widest text-cream/55">
              인원 제한
            </span>
            <input
              type="number"
              min={1}
              max={10000}
              value={maxUses}
              onChange={(e) => setMaxUses(parseInt(e.target.value || '1', 10))}
              className="kr-num text-[13px] px-3 py-2 rounded-lg bg-cream/8 border border-cream/15 outline-none focus:border-neon/50 transition text-cream placeholder:text-cream/35"
            />
            <span className="kr-body text-[10.5px] text-cream/55 leading-[1.4]">
              이 코드를 입력해 프리미엄을 받을 수 있는 최대 인원수.
              1 = 1명만 사용 가능.
            </span>
          </label>
          <label className="flex flex-col gap-1.5 min-w-[160px]">
            <span className="kr-num text-[10px] uppercase tracking-widest text-cream/55">
              권한 만료일 (선택)
            </span>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="kr-num text-[13px] px-3 py-2 rounded-lg bg-cream/8 border border-cream/15 outline-none focus:border-neon/50 transition text-cream"
            />
            <span className="kr-body text-[10.5px] text-cream/55 leading-[1.4]">
              이 날짜 이후엔 코드 입력 거절 + 이미 사용한 사람의 권한도 자동 회수
              (매일 03 UTC cron). 비워두면 영구.
            </span>
          </label>
          <label className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <span className="kr-num text-[10px] uppercase tracking-widest text-cream/55">
              메모 (선택)
            </span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="예: 5월 마케팅 캠페인"
              className="kr-body text-[13px] px-3 py-2 rounded-lg bg-cream/8 border border-cream/15 outline-none focus:border-neon/50 transition text-cream placeholder:text-cream/35"
            />
          </label>
          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={creating}
            className="kr-num inline-flex items-center gap-1.5 text-[12px] uppercase tracking-widest px-4 py-2.5 rounded-lg transition active:scale-[0.97] disabled:opacity-40"
            style={{
              background: 'var(--neon-16)',
              color: 'var(--neon)',
              border: '1px solid var(--neon-40)',
            }}
          >
            <Plus size={12} strokeWidth={2.6} />
            {creating ? '발급 중...' : '발급'}
          </button>
        </div>
        {feedback ? (
          <div
            className="mt-3 kr-body text-[12px]"
            style={{
              color: feedback.kind === 'ok' ? 'var(--neon)' : '#fca5a5',
            }}
          >
            {feedback.msg}
          </div>
        ) : null}
      </div>

      {/* 코드 목록 */}
      <div className="rounded-[16px] border border-cream/12 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[1.35fr_120px_115px_1fr_150px_44px] gap-2 px-4 py-3 bg-cream/8 kr-num text-[10px] uppercase tracking-widest text-cream/55">
              <span>코드</span>
              <span className="text-right">사용</span>
              <span>만료</span>
              <span>메모</span>
              <span>최근 사용자</span>
              <span aria-label="삭제" />
            </div>
        {loading ? (
          <div className="px-4 py-6 kr-body text-[12px] text-cream/55 text-center">
            불러오는 중...
          </div>
        ) : codes.length === 0 ? (
          <div className="px-4 py-6 kr-body text-[12px] text-cream/55 text-center">
            발급된 코드가 없습니다.
          </div>
        ) : (
          codes.map((row) => {
            const expired = isExpired(row);
            const depleted = isDepleted(row);
            const inactive = expired || depleted;
            const codeUsages = usageByCode.get(row.code.toUpperCase()) ?? [];
            const activeGrantCount = codeUsages.filter(isActivePromoGrant).length;
            const totalGrantCount = codeUsages.length;
            const countMismatch = row.uses !== totalGrantCount;
            const latestUsage =
              codeUsages.find((u) => u.user_id === row.last_redeemed_by) ??
              codeUsages[0];
            return (
              <div key={row.code} className="border-t border-cream/8" style={{ opacity: inactive ? 0.55 : 1 }}>
                <div className="grid grid-cols-[1.35fr_120px_115px_1fr_150px_44px] gap-2 px-4 py-3 items-center">
                  <span className="kr-num text-[12.5px] tabular-nums break-all">
                    {row.code}
                  </span>
                  <span className="kr-num text-[11.5px] text-cream/75 text-right tabular-nums">
                    <span className={countMismatch ? 'text-[#fca5a5]' : ''}>
                      {row.uses}/{row.max_uses}
                    </span>
                    <span className="block text-[9.5px] text-cream/45">
                      기록 {totalGrantCount} · 활성 {activeGrantCount}
                    </span>
                    {depleted ? (
                      <span className="kr-heading text-[8.5px] uppercase text-cream/50">
                        소진
                      </span>
                    ) : null}
                    {countMismatch ? (
                      <span className="kr-heading text-[8.5px] uppercase text-[#fca5a5]">
                        점검
                      </span>
                    ) : null}
                  </span>
                  <span className="kr-num text-[11px] text-cream/65">
                    {formatDateShort(row.expires_at)}
                    {expired ? (
                      <span className="kr-heading text-[8.5px] uppercase ml-1 text-[#fca5a5]">
                        만료
                      </span>
                    ) : null}
                  </span>
                  <span className="kr-body text-[11.5px] text-cream/65 truncate">
                    {row.note || '—'}
                  </span>
                  <span className="kr-body text-[11.5px] text-cream/70 min-w-0">
                    {latestUsage ? (
                      <>
                        <span className="block truncate font-bold text-cream/85">
                          {latestUsage.display_name || latestUsage.tag}
                        </span>
                        <span className="block kr-num text-[9.5px] text-cream/45">
                          {formatDateTimeShort(row.last_redeemed_at ?? latestUsage.granted_at)}
                        </span>
                      </>
                    ) : (
                      <span className="text-cream/38">없음</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleDelete(row.code)}
                    disabled={deleting === row.code}
                    aria-label={`${row.code} 삭제 — 사용자 권한 박탈 옵션 포함`}
                    title={
                      deleting === row.code
                        ? '처리 중...'
                        : '삭제 — 코드 사용자 권한 박탈 옵션 포함'
                    }
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-red-500/15 text-cream/55 hover:text-red-300 transition disabled:opacity-40"
                  >
                    {deleting === row.code ? (
                      <RefreshCcw size={11} strokeWidth={2.4} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} strokeWidth={2.4} />
                    )}
                  </button>
                </div>

                {codeUsages.length > 0 ? (
                  <details className="px-4 pb-3">
                    <summary className="cursor-pointer select-none kr-num text-[10.5px] uppercase tracking-widest text-cream/55 hover:text-neon transition">
                      사용자 {totalGrantCount}명 보기
                    </summary>
                    <div className="mt-2 overflow-hidden rounded-xl border border-cream/10 bg-[#050C2A]/55">
                      {codeUsages.map((usage) => {
                        const active = isActivePromoGrant(usage);
                        return (
                          <div
                            key={usage.grant_id}
                            className="grid grid-cols-[1fr_95px_95px_80px_100px] gap-2 px-3 py-2 border-t first:border-t-0 border-cream/8 items-center"
                          >
                            <div className="min-w-0">
                              <span className="block kr-body text-[12px] font-bold text-cream truncate">
                                {usage.display_name || '닉네임 없음'}
                              </span>
                              <span className="block kr-num text-[10px] text-cream/45">
                                {usage.tag}
                              </span>
                            </div>
                            <span className="kr-num text-[10.5px] text-cream/62">
                              {formatDateTimeShort(usage.granted_at)}
                            </span>
                            <span className="kr-num text-[10.5px] text-cream/62">
                              {formatDateShort(usage.grant_expires_at)}
                            </span>
                            <span
                              className="kr-heading text-[9px] uppercase tracking-widest"
                              style={{ color: active ? 'var(--neon)' : '#fca5a5' }}
                            >
                              {active ? '활성' : '비활성'}
                            </span>
                            <span className="kr-num text-[10.5px] text-right text-cream/62">
                              XP {usage.display_xp}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                ) : null}
              </div>
            );
          })
        )}
          </div>
        </div>
      </div>

      {archivedUsageGroups.length > 0 ? (
        <div className="mt-4 rounded-[16px] border border-cream/12 bg-cream/[0.035] p-4">
          <div className="kr-heading text-[12px] uppercase tracking-widest text-cream/72">
            삭제된 코드 사용 이력
          </div>
          <p className="mt-1 kr-body text-[11.5px] text-cream/50">
            코드 row 는 삭제됐지만 premium grant 감사 기록은 남아있는 항목입니다.
          </p>
          <div className="mt-3 space-y-2">
            {archivedUsageGroups.map(([code, group]) => {
              const activeCount = group.filter(isActivePromoGrant).length;
              return (
                <details key={code} className="rounded-xl border border-cream/10 bg-[#050C2A]/55 px-3 py-2">
                  <summary className="cursor-pointer select-none kr-num text-[11px] text-cream/72">
                    {code} · 전체 {group.length}명 · 활성 {activeCount}명
                  </summary>
                  <div className="mt-2 divide-y divide-cream/8">
                    {group.map((usage) => (
                      <div key={usage.grant_id} className="grid grid-cols-[1fr_95px_80px_90px] gap-2 py-2 items-center">
                        <span className="kr-body text-[12px] text-cream/82 truncate">
                          {usage.display_name || usage.tag}
                        </span>
                        <span className="kr-num text-[10.5px] text-cream/55">
                          {formatDateTimeShort(usage.granted_at)}
                        </span>
                        <span
                          className="kr-heading text-[9px] uppercase tracking-widest"
                          style={{ color: isActivePromoGrant(usage) ? 'var(--neon)' : '#fca5a5' }}
                        >
                          {isActivePromoGrant(usage) ? '활성' : '비활성'}
                        </span>
                        <span className="kr-num text-[10.5px] text-right text-cream/55">
                          XP {usage.display_xp}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      ) : null}

      <p className="mt-3 kr-body text-[11.5px] text-cream/55 leading-[1.65]">
        ※ 발급된 코드는 사용자가 <code className="px-1 py-0.5 rounded bg-cream/10 text-cream/85">#/redeem</code>{' '}
        에서 입력 시 프리미엄 부여. <strong>권한 만료일을 설정하면 그 시점에 권한도
        자동 회수</strong> (매일 03 UTC cron). 만료일을 비워두면 영구 권한.{' '}
        <strong>삭제 버튼</strong>은 코드 사용자 N명을 표시한 후 2단계 confirm 으로
        권한 박탈 여부를 묻습니다 — 결제·admin 부여 등 다른 source 의 활성 권한이
        있는 사용자는 보존.
      </p>
    </section>
  );
}

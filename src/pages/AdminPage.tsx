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

import { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCcw, Shield, Unlock, Users } from 'lucide-react';
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
  level: number;
  is_premium: boolean;
  last_seen_at: string;
  created_at: string;
}

interface SessionStat {
  total: number;
  today: number;
  thisWeek: number;
}

export default function AdminPage({ onBack }: { onBack: () => void }) {
  const profile = useMyProfile();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [sessionStat, setSessionStat] = useState<SessionStat | null>(null);
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
      // 사용자 목록 (XP 순)
      const { data: rows, error: uErr } = await sb
        .from('profiles')
        .select(
          'id, tag, display_name, role, total_xp, level, is_premium, last_seen_at, created_at',
        )
        .order('total_xp', { ascending: false })
        .limit(100);
      if (uErr) throw uErr;

      // 세션 통계
      const { count: totalCount } = await sb
        .from('sessions')
        .select('*', { count: 'exact', head: true });

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count: todayCount } = await sb
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .gte('ended_at', todayStart.toISOString());

      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 7);
      const { count: weekCount } = await sb
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .gte('ended_at', weekStart.toISOString());

      setUsers((rows ?? []) as UserRow[]);
      setSessionStat({
        total: totalCount ?? 0,
        today: todayCount ?? 0,
        thisWeek: weekCount ?? 0,
      });
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
        </header>

        {error ? (
          <div className="mb-6 p-4 rounded-lg border border-red-400/40 bg-red-400/10 text-red-200 text-sm">
            {error}
          </div>
        ) : null}

        {/* 통계 카드 */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
          <Stat label="총 가입자" value={users.length} />
          <Stat label="프리미엄" value={users.filter((u) => u.is_premium).length} />
          <Stat label="오늘 세션" value={sessionStat?.today ?? 0} />
          <Stat label="누적 세션" value={sessionStat?.total ?? 0} />
        </section>

        {/* 사용자 목록 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-neon" />
            <h2 className="kr-heading text-[16px]">최근 활성 사용자 (XP 상위 100명)</h2>
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
                {users.map((u) => (
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
                      {u.total_xp}
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
              ? 'linear-gradient(135deg, rgba(111,255,0,0.10), rgba(111,255,0,0.04))'
              : 'rgba(239,244,255,0.04)',
            borderColor: bypassActive
              ? 'rgba(111,255,0,0.45)'
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
                  ? 'rgba(111,255,0,0.95)'
                  : 'rgba(239,244,255,0.08)',
                color: bypassActive ? 'var(--base)' : 'var(--cream)',
                border: bypassActive
                  ? '1px solid rgba(111,255,0,1)'
                  : '1px solid rgba(239,244,255,0.25)',
                boxShadow: bypassActive
                  ? '0 6px 20px rgba(111,255,0,0.35)'
                  : 'none',
              }}
            >
              {bypassActive ? '✓ 검수 모드 ON' : '검수 모드 OFF'}
            </button>
          </div>
        </section>

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

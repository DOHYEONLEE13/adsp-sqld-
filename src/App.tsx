import { lazy, Suspense, useEffect, useState } from 'react';
import Landing from './pages/Landing';
import type { Subject } from './types/question';
import { getSnapshot } from './game/storage';
import { initProfileSync } from './data/profile';
import { initFriendsSync } from './data/friends';
import { initMigration } from './lib/migrate';
import { initSessionSync } from './game/sessionSync';
import { initProgressSync } from './game/progressSync';
import { initBookmarksSync } from './game/bookmarks';
import { initExamDatesSync } from './game/examDate';
import { initEnergySync } from './game/energy';
import { initStepUnlocksSync } from './game/stepUnlocks';
import { initPassSync } from './game/passSync';
import type { LegalDoc } from './data/legal';
import GlobalAmbientBg from './game/components/GlobalAmbientBg';
import { onAuthStateChange } from './lib/supabase';
import { consumePendingAuthRedirect } from './lib/authGuard';
import TierUpgradeToast from './components/passes/TierUpgradeToast';
import OfflineBanner from './components/sync/OfflineBanner';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';

// ── lazy 라우트 — 첫 페이지 (Landing) 만 즉시 로드, 나머지는 진입 시 다운로드.
//   결과: 게스트가 랜딩만 보면 GamePage·StatsPage·법적 페이지·관리자 페이지의
//   chunk 가 모두 미다운로드. 첫 진입 번들 크기 ↓.
//   AuthGuard / authGuard.ts 인프라는 유지 — Phase B premium 결제 게이트에서 재사용.
const LegalPage = lazy(() => import('./pages/LegalPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const RedeemPage = lazy(() => import('./pages/RedeemPage'));
const RefundRequestPage = lazy(() => import('./pages/RefundRequestPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const GamePage = lazy(() => import('./game/GamePage'));
const StatsPage = lazy(() => import('./game/StatsPage'));
const BookmarksPage = lazy(() => import('./game/BookmarksPage'));
const QuestsPage = lazy(() => import('./game/QuestsPage'));
const FriendsPage = lazy(() => import('./game/FriendsPage'));

type Route =
  | 'landing'
  | 'game'
  | 'stats'
  | 'bookmarks'
  | 'quests'
  | 'friends'
  | 'legal'
  | 'admin'
  | 'redeem'
  | 'refund-request'
  | 'login';

interface RouteState {
  route: Route;
  /** `#/game/adsp` · `#/game/sqld` 처럼 deep-link 진입 시 시작 과목. */
  initialSubject?: Subject;
  /** legal 페이지 진입 시 어느 문서. */
  legalSlug?: LegalDoc['slug'];
}

/**
 * 얇은 해시 라우터.
 *  - `#/`              → landing
 *  - `#/game`          → activeSubject 있으면 그 과목 planet 직진,
 *                        없으면 onboarding chooser
 *  - `#/game/adsp`     → game, ADSP planet 으로 직진 (랜딩 카드에서 옴)
 *  - `#/game/sqld`     → game, SQLD planet 으로 직진
 *  - `#/quests`        → 오늘의 퀘스트 (모바일 하단 깃발 탭)
 *  - `#/friends`       → 친구 경쟁/리더보드 (모바일 하단 트로피 탭)
 *  - `#/stats`         → stats (대시보드 / 프로필)
 *  - `#/bookmarks`     → bookmarks
 */
function getRoute(): RouteState {
  if (typeof window === 'undefined') return { route: 'landing' };
  const hash = window.location.hash.replace(/^#/, '');
  if (hash.startsWith('/quests')) return { route: 'quests' };
  if (hash.startsWith('/friends')) return { route: 'friends' };
  if (hash.startsWith('/stats')) return { route: 'stats' };
  if (hash.startsWith('/bookmarks')) return { route: 'bookmarks' };
  if (hash.startsWith('/admin')) return { route: 'admin' };
  if (hash.startsWith('/redeem')) return { route: 'redeem' };
  if (hash.startsWith('/refund-request'))
    return { route: 'refund-request' };
  if (hash.startsWith('/login')) return { route: 'login' };
  if (hash.startsWith('/about'))
    return { route: 'legal', legalSlug: 'about' };
  if (hash.startsWith('/privacy'))
    return { route: 'legal', legalSlug: 'privacy' };
  if (hash.startsWith('/terms'))
    return { route: 'legal', legalSlug: 'terms' };
  if (hash.startsWith('/refund'))
    return { route: 'legal', legalSlug: 'refund' };
  if (hash.startsWith('/game')) {
    const parts = hash.split('/').filter(Boolean); // ['game'] or ['game', 'adsp']
    const sub = parts[1];
    if (sub === 'adsp' || sub === 'sqld') {
      return { route: 'game', initialSubject: sub };
    }
    // /game (no subject) — fallback: 저장된 activeSubject 가 있으면 그 과목으로
    // 직진. 없으면 chooser 로 onboarding.
    const active = getSnapshot().activeSubject;
    if (active === 'adsp' || active === 'sqld') {
      return { route: 'game', initialSubject: active };
    }
    return { route: 'game' };
  }
  return { route: 'landing' };
}

/**
 * Suspense fallback — 의도적 null.
 *
 * lazy chunk 다운로드 중에도 GlobalAmbientBg / OfflineBanner / TierUpgradeToast 가
 * boundary 밖에 떠 있어 화면이 완전히 비지 않음. 빈 placeholder (`···` 등) 를
 * 노출하면 cached chunk 의 unmount→mount 1프레임 gap 에서 "로딩 깜빡임" 으로 보임.
 * null 이면 그 짧은 순간엔 배경만 보여 부드러운 전환.
 *
 * 첫 방문 페이지는 idle prefetch (App effect) 가 다운로드를 끝내 놓아서
 * 실제 fallback 가 보이는 일은 거의 없음.
 */
const ROUTE_FALLBACK = null;

export default function App() {
  const [{ route, initialSubject, legalSlug }, setRouteState] =
    useState<RouteState>(() => getRoute());

  useEffect(() => {
    const onHashChange = () => setRouteState(getRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // 프로필·친구·세션·북마크·시험일 ↔ Supabase 자동 sync + 일회 마이그.
  // env 미설정이면 모두 no-op (게스트 모드 = localStorage only).
  useEffect(() => {
    const unsubs = [
      initProfileSync(),
      initFriendsSync(),
      initSessionSync(),
      initProgressSync(),  // 다기기 동기화 (PR-4) — server → local pull
      initBookmarksSync(),
      initExamDatesSync(),
      initEnergySync(),
      initStepUnlocksSync(),
      initPassSync(),
      initMigration(),
    ];
    return () => {
      for (const u of unsubs) u();
    };
  }, []);

  // ── 핵심 탭 페이지 idle prefetch (A-9 lazy 도입의 부작용 보완) ─────────
  // 사용자 보고: "탭 클릭 시 전체 화면이 아주 짧게 로딩되는 느낌".
  // 원인: lazy() chunk 가 메모리에 없으면 Suspense fallback 1프레임 노출.
  // 처방: 첫 paint 후 idle 시간에 5개 자주-방문 탭의 chunk 를 백그라운드 다운로드.
  // 효과:
  //   - 초기 진입 KB ↑ 0 (idle 후 다운로드 — first paint 느려지지 않음)
  //   - 탭 첫 클릭부터 chunk 가 메모리에 있어 즉시 mount → 깜빡임 사라짐
  // 모바일 네트워크 비용: 5개 합쳐도 gzip ~80KB. idle 시 다운이라 사용자 부담 X.
  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
    };
    const schedule = win.requestIdleCallback
      ? (cb: () => void) => win.requestIdleCallback!(cb, { timeout: 3000 })
      : (cb: () => void) => window.setTimeout(cb, 1500);
    schedule(() => {
      // void 로 promise 무시 — 다운로드 실패 시에도 정상 navigation 시 lazy 가 다시 시도
      void import('./game/GamePage');
      void import('./game/StatsPage');
      void import('./game/QuestsPage');
      void import('./game/FriendsPage');
      void import('./game/BookmarksPage');
    });
  }, []);

  // OAuth 콜백 후 SIGNED_IN 이벤트 — 보호 라우트로 진입하려 했던 경우 자동 복귀.
  // OAuth 는 window.location.origin 으로 redirect 되어 hash 가 비어 있으므로
  // App 루트에서 한 번만 구독해 처리 (LoginPage 가 mount 되지 않아도 OK).
  useEffect(() => {
    const unsub = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // 의도된 라우트가 있으면 그곳으로, 없으면 현재 라우트 그대로 둠
        consumePendingAuthRedirect();
      }
    });
    return () => unsub();
  }, []);

  // GlobalAmbientBg 는 라우트 전환과 무관하게 항상 마운트 — 페이지가
  // 바뀌어도 영상이 처음부터 다시 시작되지 않게.  각 페이지의 PageAmbientBg
  // 가 controller 에 push/pop 만 해서 fade in/out 으로만 노출 토글한다.
  const renderRoute = () => {
    // 게스트 모드 = 기본. 무료 계정처럼 동작 (localStorage 진도).
    // 로그인 게이트는 결제 시점 (Phase B Premium 업그레이드) 에만 등장.
    // AuthGuard / LoginPage / authGuard.ts 인프라는 그대로 유지 → premium 게이트
    // 에서 setPendingAuthRedirect + #/login 패턴 재사용.
    if (route === 'game') {
      return (
        <GamePage
          // key 로 deep-link 진입 변화 시 GamePage 재마운트.
          // ex) /game (chooser) ↔ /game/adsp 사이 이동 시 초기 화면이 갱신됨.
          key={initialSubject ?? 'chooser'}
          initialSubject={initialSubject}
          onExitToLanding={() => {
            window.location.hash = '';
          }}
        />
      );
    }

    if (route === 'stats') {
      return (
        <StatsPage
          onExit={() => {
            window.location.hash = '/game';
          }}
        />
      );
    }

    if (route === 'quests') {
      return (
        <QuestsPage
          onExit={() => {
            window.location.hash = '/game';
          }}
        />
      );
    }

    if (route === 'friends') {
      return (
        <FriendsPage
          onExit={() => {
            window.location.hash = '/game';
          }}
        />
      );
    }

    if (route === 'bookmarks') {
      return (
        <BookmarksPage
          onExit={() => {
            window.location.hash = '/game';
          }}
        />
      );
    }

    if (route === 'legal' && legalSlug) {
      return (
        <LegalPage
          slug={legalSlug}
          onBack={() => {
            window.location.hash = '';
          }}
        />
      );
    }

    if (route === 'admin') {
      return (
        <AdminPage
          onBack={() => {
            window.location.hash = '';
          }}
        />
      );
    }

    if (route === 'redeem') {
      return (
        <RedeemPage
          onBack={() => {
            window.location.hash = '';
          }}
        />
      );
    }

    if (route === 'refund-request') {
      return (
        <RefundRequestPage
          onBack={() => {
            window.location.hash = '/refund';
          }}
        />
      );
    }

    if (route === 'login') {
      return (
        <LoginPage
          onBack={() => {
            window.location.hash = '';
          }}
        />
      );
    }

    return <Landing />;
  };

  return (
    <ToastProvider>
      <GlobalAmbientBg />
      <OfflineBanner />
      {/*
        ErrorBoundary 가 라우트 트리만 감싸기 — GlobalAmbientBg / OfflineBanner /
        TierUpgradeToast / ToastProvider 는 boundary 밖에 둬서 라우트 에러 시에도
        배경·토스트 시스템이 살아있도록.
        Suspense 는 lazy 라우트 chunk 로딩 fallback.
      */}
      <ErrorBoundary label="route">
        <Suspense fallback={ROUTE_FALLBACK}>{renderRoute()}</Suspense>
      </ErrorBoundary>
      <TierUpgradeToast />
    </ToastProvider>
  );
}

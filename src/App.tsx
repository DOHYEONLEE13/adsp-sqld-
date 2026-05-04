import { lazy, Suspense, useEffect, useState, useTransition } from 'react';
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
import DevUnlockBadge from './components/DevUnlockBadge';
import GuestDiscardToast from './components/GuestDiscardToast';

// ── lazy 라우트 — 첫 페이지 (Landing) 만 즉시 로드, 나머지는 진입 시 다운로드.
//   결과: 게스트가 랜딩만 보면 GamePage·StatsPage·법적 페이지·관리자 페이지의
//   chunk 가 모두 미다운로드. 첫 진입 번들 크기 ↓.
//   AuthGuard / authGuard.ts 인프라는 유지 — Phase B premium 결제 게이트에서 재사용.
const LegalPage = lazy(() => import('./pages/LegalPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const RedeemPage = lazy(() => import('./pages/RedeemPage'));
const RefundRequestPage = lazy(() => import('./pages/RefundRequestPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const PaymentCallbackPage = lazy(() => import('./pages/PaymentCallbackPage'));
const LessonStaticPage = lazy(() => import('./pages/LessonStaticPage'));
const QuizStaticPage = lazy(() => import('./pages/QuizStaticPage'));
const CurriculumPage = lazy(() => import('./pages/CurriculumPage'));
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
  | 'login'
  | 'payment-callback'
  | 'lesson-static'
  | 'quiz-static'
  | 'curriculum';

interface RouteState {
  route: Route;
  /** `#/game/adsp` · `#/game/sqld` 처럼 deep-link 진입 시 시작 과목. */
  initialSubject?: Subject;
  /** legal 페이지 진입 시 어느 문서. */
  legalSlug?: LegalDoc['slug'];
  /** `/lesson/:stepId` — Tier 2 SEO 진입점. */
  lessonStepId?: string;
  /** `/quiz/:questionId` — Tier 2 SEO 진입점. */
  quizQuestionId?: string;
  /** `/curriculum/:subject` — Tier 2 SEO pillar 페이지. */
  curriculumSubject?: Subject;
}

/**
 * 하이브리드 라우터 — Legal 4 페이지는 path, 그 외는 hash.
 *
 * Path-based (검색엔진 indexable):
 *  - `/about`     → legal/about
 *  - `/privacy`   → legal/privacy
 *  - `/terms`     → legal/terms
 *  - `/refund`    → legal/refund
 *
 * Hash-based (변경 위험으로 추후 PR 에서 전환):
 *  - `#/`              → landing
 *  - `#/game`, `#/game/adsp`, `#/game/sqld`
 *  - `#/quests`, `#/friends`, `#/stats`, `#/bookmarks`
 *  - `#/admin`, `#/redeem`, `#/refund-request`
 *  - `#/payment/callback`, `#/login`
 *
 * Legacy hash (`#/about` 등) 는 mount 시 redirectLegacyHashToPath() 가 한 번
 * replaceState 해 path 로 옮김 — 옛 북마크 호환.
 */
function getRoute(): RouteState {
  if (typeof window === 'undefined') return { route: 'landing' };

  // 1. Path-based 라우트 우선 (legal pages + Tier 2 lesson — SEO indexable)
  const pathname = window.location.pathname;
  if (pathname === '/about')
    return { route: 'legal', legalSlug: 'about' };
  if (pathname === '/privacy')
    return { route: 'legal', legalSlug: 'privacy' };
  if (pathname === '/terms')
    return { route: 'legal', legalSlug: 'terms' };
  if (pathname === '/refund')
    return { route: 'legal', legalSlug: 'refund' };
  // Tier 2 — 정적 lesson SEO 페이지. `/lesson/:stepId`
  if (pathname.startsWith('/lesson/')) {
    const stepId = pathname.slice('/lesson/'.length);
    // stepId 안에 / 포함되면 잘라냄 (예방)
    const cleanId = stepId.split('/')[0];
    if (cleanId) return { route: 'lesson-static', lessonStepId: cleanId };
  }
  // Tier 2 — 정적 quiz SEO 페이지. `/quiz/:questionId`
  if (pathname.startsWith('/quiz/')) {
    const questionId = pathname.slice('/quiz/'.length);
    const cleanId = questionId.split('/')[0];
    if (cleanId) return { route: 'quiz-static', quizQuestionId: cleanId };
  }
  // Tier 2 — 커리큘럼 pillar 페이지. `/curriculum/adsp` · `/curriculum/sqld`
  if (pathname.startsWith('/curriculum/')) {
    const sub = pathname.slice('/curriculum/'.length).split('/')[0];
    if (sub === 'adsp' || sub === 'sqld') {
      return { route: 'curriculum', curriculumSubject: sub };
    }
  }

  // 2. Hash-based 라우트 (그 외 모든 routes)
  const hash = window.location.hash.replace(/^#/, '');
  if (hash.startsWith('/quests')) return { route: 'quests' };
  if (hash.startsWith('/friends')) return { route: 'friends' };
  if (hash.startsWith('/stats')) return { route: 'stats' };
  if (hash.startsWith('/bookmarks')) return { route: 'bookmarks' };
  if (hash.startsWith('/admin')) return { route: 'admin' };
  if (hash.startsWith('/redeem')) return { route: 'redeem' };
  if (hash.startsWith('/refund-request'))
    return { route: 'refund-request' };
  if (hash.startsWith('/payment/callback'))
    return { route: 'payment-callback' };
  if (hash.startsWith('/login')) return { route: 'login' };
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
  const [
    {
      route,
      initialSubject,
      legalSlug,
      lessonStepId,
      quizQuestionId,
      curriculumSubject,
    },
    setRouteState,
  ] = useState<RouteState>(() => getRoute());

  // ── useTransition 으로 끊김 완화 ────────────────────────────────────
  // 첫 탭 클릭 시 lazy chunk + 페이지 mount 비용이 합쳐져 1프레임 정지처럼
  // 보이는 문제. React 18 의 useTransition 은 새 라우트가 준비될 때까지
  // 이전 페이지를 화면에 유지 → 사용자는 끊김 없이 부드러운 전환 체감.
  // (Suspense fallback null 과 함께 작동: chunk 가 mount 되기 전엔 이전
  //  페이지가 보이고, mount 끝나면 즉시 교체.)
  const [, startTransition] = useTransition();

  // Legacy hash redirect — `#/about` 등 옛 북마크가 들어오면 path 로 한 번 교체.
  // App mount 시 한 번만 실행.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace(/^#/, '');
    const legalSlugs = ['/about', '/privacy', '/terms', '/refund'] as const;
    const legacyMatch = legalSlugs.find((s) => hash === s || hash.startsWith(s + '?'));
    if (legacyMatch && window.location.pathname !== legacyMatch) {
      window.history.replaceState({}, '', legacyMatch);
      // 새 라우트 즉시 인식
      setRouteState(getRoute());
    }
  }, []);

  // 라우트 변경 구독 — hashchange (hash routes) + popstate (path routes).
  useEffect(() => {
    const onChange = () => {
      startTransition(() => setRouteState(getRoute()));
    };
    window.addEventListener('hashchange', onChange);
    window.addEventListener('popstate', onChange);
    return () => {
      window.removeEventListener('hashchange', onChange);
      window.removeEventListener('popstate', onChange);
    };
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
            // path-based legal → home (/) 으로. pushState + popstate dispatch.
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new PopStateEvent('popstate'));
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
            // /refund 는 이제 path-based — pushState 사용
            window.history.pushState({}, '', '/refund');
            window.dispatchEvent(new PopStateEvent('popstate'));
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

    if (route === 'payment-callback') {
      return (
        <PaymentCallbackPage
          onBack={() => {
            window.location.hash = '';
          }}
        />
      );
    }

    if (route === 'lesson-static' && lessonStepId) {
      return <LessonStaticPage stepId={lessonStepId} />;
    }

    if (route === 'quiz-static' && quizQuestionId) {
      return <QuizStaticPage questionId={quizQuestionId} />;
    }

    if (route === 'curriculum' && curriculumSubject) {
      return <CurriculumPage subject={curriculumSubject} />;
    }

    return <Landing />;
  };

  return (
    <ToastProvider>
      <GlobalAmbientBg />
      <OfflineBanner />
      <DevUnlockBadge />
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
      <GuestDiscardToast />
    </ToastProvider>
  );
}

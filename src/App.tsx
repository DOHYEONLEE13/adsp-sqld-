import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import type { Subject } from './types/question';
import {
  isSeoCurriculumSubject,
  isSeoFaqSubject,
  type SeoCurriculumSubject,
  type SeoFaqSubject,
} from './types/seo';
import {
  isExpansionSubjectId,
  type ExpansionSubjectId,
} from './game/expansionSubjects';
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
import AppBillingNotice from './components/AppBillingNotice';
import PremiumPlanModal from './components/PremiumPlanModal';
import SettingsDrawer from './components/SettingsDrawer';
import OfflineBanner from './components/sync/OfflineBanner';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';
import DevUnlockBadge from './components/DevUnlockBadge';
import GuestDiscardToast from './components/GuestDiscardToast';
import AuthGuard from './components/auth/AuthGuard';
import { trackPageview } from './lib/analytics';
import { navigate } from './lib/navigate';
import { needsOnboarding } from './game/onboarding/onboardingStorage';
import { isComhwalExam } from './types/learning';
import { initAuthSessionSync } from './lib/auth/sessionStore';
import {
  installAppModeChrome,
  isAppEntryPath,
  isAppMode,
  markAppModeFromLocation,
  resolveInitialAppRouteHash,
} from './lib/appMode';
import { scrollPageTo } from './lib/pageScroll';

// ── lazy 라우트 — 첫 페이지 (Landing) 만 즉시 로드, 나머지는 진입 시 다운로드.
//   결과: 게스트가 랜딩만 보면 GamePage·StatsPage·법적 페이지·관리자 페이지의
//   chunk 가 모두 미다운로드. 첫 진입 번들 크기 ↓.
//   AuthGuard / authGuard.ts 인프라는 유지 — Phase B premium 결제 게이트에서 재사용.
const Landing = lazy(() => import('./pages/Landing'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const RedeemPage = lazy(() => import('./pages/RedeemPage'));
const RefundRequestPage = lazy(() => import('./pages/RefundRequestPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const PaymentCallbackPage = lazy(() => import('./pages/PaymentCallbackPage'));
const StudyMethodPage = lazy(() => import('./pages/StudyMethodPage'));
const LessonStaticPage = lazy(() => import('./pages/LessonStaticPage'));
const QuizStaticPage = lazy(() => import('./pages/QuizStaticPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CurriculumPage = lazy(() => import('./pages/CurriculumPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const ComhwalTopicPage = lazy(() => import('./pages/ComhwalTopicPage'));
const GlossaryPage = lazy(() => import('./pages/GlossaryPage'));
const ExamSchedulePage = lazy(() => import('./pages/ExamSchedulePage'));
const BlogIndexPage = lazy(() => import('./pages/BlogIndexPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const GamePage = lazy(() => import('./game/GamePage'));
const StatsPage = lazy(() => import('./game/StatsPage'));
const SettingsPage = lazy(() => import('./game/SettingsPage'));
const BookmarksPage = lazy(() => import('./game/BookmarksPage'));
const QuestsPage = lazy(() => import('./game/QuestsPage'));
const FriendsPage = lazy(() => import('./game/FriendsPage'));
// Phase 4 Step 2 — 첫 진입 + 진단 (mock 단계, localStorage 기반)
const OnboardingFlow = lazy(() =>
  import('./game/onboarding/OnboardingFlow').then((m) => ({ default: m.OnboardingFlow })),
);
const StudyPlanSetupFlow = lazy(() => import('./game/studyPlan/StudyPlanSetupFlow'));
// Phase 4 Step 3 — 학습 플랜 확인 화면 (route wrapper — 자체 load + redirect 처리)
const StudyPlanRoute = lazy(() => import('./game/studyPlan/StudyPlanRoute'));
// Phase 4 Step 5 — 진행도 현황 (5번째 네비 슬롯)
const ProgressDashboard = lazy(
  () => import('./game/passPrediction/ProgressDashboard'),
);
// 스크롤 히어로 홈 (신규). 완성 후 하단 네비의 '나의 약점' 슬롯을 대체할 예정.
const HomePage = lazy(() => import('./game/HomePage'));
const PlayReviewPromptPreview = lazy(
  () => import('./game/components/PlayReviewPromptPreview'),
);

type Route =
  | 'landing'
  | 'game'
  | 'onboarding'
  | 'study-plan-setup'
  | 'study-plan'
  | 'weakness'
  | 'home'
  | 'stats'
  | 'settings'
  | 'bookmarks'
  | 'quests'
  | 'friends'
  | 'legal'
  | 'admin'
  | 'redeem'
  | 'refund-request'
  | 'login'
  | 'payment-callback'
  | 'study-method'
  | 'lesson-static'
  | 'quiz-static'
  | 'curriculum'
  | 'faq'
  | 'comhwal-topic'
  | 'glossary'
  | 'exam-schedule'
  | 'blog-index'
  | 'blog-post'
  | 'pricing'
  | 'contact'
  | 'review-preview';

interface RouteState {
  route: Route;
  /** `#/game/adsp` · `#/game/sqld` 처럼 deep-link 진입 시 시작 과목. */
  initialSubject?: Subject;
  /** `#/game/comhwal` 처럼 아직 정식 Subject 가 아닌 확장 과목 선택 패널로 진입. */
  initialExpansionSubject?: ExpansionSubjectId;
  /** legal 페이지 진입 시 어느 문서. */
  legalSlug?: LegalDoc['slug'];
  /** `/lesson/:stepId` — Tier 2 SEO 진입점. */
  lessonStepId?: string;
  /** `/quiz/:questionId` — Tier 2 SEO 진입점. */
  quizQuestionId?: string;
  /** `/curriculum/:subject` — Tier 2 SEO pillar 페이지. */
  curriculumSubject?: SeoCurriculumSubject;
  /** `/faq/:subject` — Tier 2 SEO FAQ. */
  faqSubject?: SeoFaqSubject;
  /** `/topics/comhwal/:planetKey/:topicId` — 실제 카드가 있는 컴활 토픽 SEO 페이지. */
  topicPlanetKey?: string;
  topicId?: string;
  /** `/exams/:subject` — 시험 회차 허브 템플릿. */
  examSubject?: 'adsp' | 'sqld' | 'comhwal';
  /** `/blog/:slug` — Tier 2 SEO 블로그 포스트. */
  blogSlug?: string;
}

const TOP_RESET_ROUTES = new Set<Route>([
  'quests',
  'weakness',
  'friends',
  'stats',
  'settings',
  'bookmarks',
  'home',
]);

function routeScrollKey(state: RouteState): string {
  if (state.route === 'game' && state.initialExpansionSubject) {
    return `game:${state.initialExpansionSubject}`;
  }
  if (state.route === 'game') return `game:${state.initialSubject ?? ''}`;
  return state.route;
}

function shouldResetScrollForRoute(state: RouteState): boolean {
  if (state.route === 'game') {
    return !state.initialSubject || !!state.initialExpansionSubject;
  }
  return TOP_RESET_ROUTES.has(state.route);
}

function resetWindowScroll(): void {
  if (typeof window === 'undefined') return;
  scrollPageTo({ top: 0, left: 0, behavior: 'auto' });
  window.requestAnimationFrame(() => {
    scrollPageTo({ top: 0, left: 0, behavior: 'auto' });
  });
  window.setTimeout(() => {
    scrollPageTo({ top: 0, left: 0, behavior: 'auto' });
  }, 80);
}

function resolveGamePathRoute(sub?: string): RouteState {
  if (sub === 'adsp' || sub === 'sqld') {
    return { route: 'game', initialSubject: sub };
  }
  if (isExpansionSubjectId(sub)) {
    return { route: 'game', initialExpansionSubject: sub };
  }

  const active = getSnapshot().activeSubject;
  if (active === 'adsp' || active === 'sqld') {
    return { route: 'game', initialSubject: active };
  }

  try {
    const raw = window.localStorage.getItem('questdp_onboarding_v4');
    if (raw) {
      const parsed = JSON.parse(raw) as { exams?: string[]; version?: number };
      if (parsed?.version === 1) {
        const ex = parsed.exams?.[0];
        if (ex === 'adsp' || ex === 'sqld') {
          return { route: 'game', initialSubject: ex };
        }
        if (isComhwalExam(ex)) {
          return { route: 'game', initialExpansionSubject: 'comhwal' };
        }
      }
    }
  } catch {
    /* silent fallback */
  }

  return { route: 'game' };
}

function getFunctionalPathRoute(pathname: string): RouteState | null {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (normalized === '/admin') return { route: 'admin' };
  if (normalized === '/redeem') return { route: 'redeem' };
  if (normalized === '/refund-request') return { route: 'refund-request' };
  if (normalized === '/payment/callback') return { route: 'payment-callback' };
  if (normalized === '/login') return { route: 'login' };
  if (normalized === '/onboarding') return { route: 'onboarding' };
  if (normalized === '/study-plan/setup') return { route: 'study-plan-setup' };
  if (normalized === '/study-plan') return { route: 'study-plan' };
  if (normalized === '/weakness' || normalized === '/progress') return { route: 'weakness' };
  if (normalized === '/home') return { route: 'home' };
  if (normalized === '/quests') return { route: 'quests' };
  if (normalized === '/friends') return { route: 'friends' };
  if (normalized === '/stats') return { route: 'stats' };
  if (normalized === '/settings') return { route: 'settings' };
  if (normalized === '/bookmarks') return { route: 'bookmarks' };
  if (normalized === '/game' || normalized.startsWith('/game/')) {
    const [, sub] = normalized.split('/').filter(Boolean);
    return resolveGamePathRoute(sub);
  }
  return null;
}

/**
 * 하이브리드 라우터 — Legal 4 페이지는 path, 그 외는 hash.
 *
 * Path-based (검색엔진 indexable):
 *  - `/about`     → legal/about
 *  - `/privacy`   → legal/privacy
 *  - `/terms`     → legal/terms
 *  - `/refund`    → legal/refund
 *  - `/study-method` → QuestDP 학습 원리
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
  const initialHash = window.location.hash.replace(/^#/, '');
  const appModeActive = isAppMode();
  if (isAppEntryPath(pathname) && !initialHash) {
    return { route: 'home' };
  }
  const allowPathRoutes = !appModeActive || isAppEntryPath(pathname);
  if (!allowPathRoutes && !initialHash) {
    return { route: 'home' };
  }
  if (allowPathRoutes) {
    const functionalPathRoute = getFunctionalPathRoute(pathname);
    if (functionalPathRoute) return functionalPathRoute;
  }
  if (allowPathRoutes && (pathname === '/about' || pathname === '/about/'))
    return { route: 'legal', legalSlug: 'about' };
  if (allowPathRoutes && (pathname === '/privacy' || pathname === '/privacy/'))
    return { route: 'legal', legalSlug: 'privacy' };
  if (allowPathRoutes && (pathname === '/terms' || pathname === '/terms/'))
    return { route: 'legal', legalSlug: 'terms' };
  if (allowPathRoutes && (pathname === '/refund' || pathname === '/refund/'))
    return { route: 'legal', legalSlug: 'refund' };
  // 요금제 — Toss 가맹점 심사 + SEO indexable URL
  if (allowPathRoutes && (pathname === '/pricing' || pathname === '/pricing/'))
    return { route: 'pricing' };
  if (allowPathRoutes && (pathname === '/contact' || pathname === '/contact/'))
    return { route: 'contact' };
  if (allowPathRoutes && (pathname === '/study-method' || pathname === '/study-method/'))
    return { route: 'study-method' };
  // Tier 2 — 정적 lesson SEO 페이지. `/lesson/:stepId`
  if (allowPathRoutes && pathname.startsWith('/lesson/')) {
    const stepId = pathname.slice('/lesson/'.length);
    // stepId 안에 / 포함되면 잘라냄 (예방)
    const cleanId = stepId.split('/')[0];
    if (cleanId) return { route: 'lesson-static', lessonStepId: cleanId };
  }
  // Tier 2 — 정적 quiz SEO 페이지. `/quiz/:questionId`
  if (allowPathRoutes && pathname.startsWith('/quiz/')) {
    const questionId = pathname.slice('/quiz/'.length);
    const cleanId = questionId.split('/')[0];
    if (cleanId) return { route: 'quiz-static', quizQuestionId: cleanId };
  }
  // Tier 2 — 컴활 실콘텐츠 토픽. `/topics/comhwal/computer-general/:topicId`
  if (allowPathRoutes && pathname.startsWith('/topics/comhwal/')) {
    const parts = pathname.slice('/topics/comhwal/'.length).split('/').filter(Boolean);
    const [planetKey, topicId] = parts;
    if (planetKey && topicId) {
      return { route: 'comhwal-topic', topicPlanetKey: planetKey, topicId };
    }
  }
  // Tier 2 — 커리큘럼 pillar 페이지. `/curriculum/adsp` · `/curriculum/sqld` · `/curriculum/comhwal`
  if (allowPathRoutes && pathname.startsWith('/curriculum/')) {
    const sub = pathname.slice('/curriculum/'.length).split('/')[0];
    if (isSeoCurriculumSubject(sub)) {
      return { route: 'curriculum', curriculumSubject: sub };
    }
  }
  // Tier 2 — FAQ. `/faq/adsp` · `/faq/sqld` · `/faq/comhwal`
  if (allowPathRoutes && pathname.startsWith('/faq/')) {
    const sub = pathname.slice('/faq/'.length).split('/')[0];
    if (isSeoFaqSubject(sub)) {
      return { route: 'faq', faqSubject: sub };
    }
  }
  // Tier 2 — 용어 사전. `/glossary`
  if (allowPathRoutes && (pathname === '/glossary' || pathname === '/glossary/')) {
    return { route: 'glossary' };
  }
  // Tier 2 — 시험 회차 허브 템플릿. `/exams/adsp` · `/exams/sqld` · `/exams/comhwal`
  if (allowPathRoutes && pathname.startsWith('/exams/')) {
    const sub = pathname.slice('/exams/'.length).split('/')[0];
    if (sub === 'adsp' || sub === 'sqld' || sub === 'comhwal') {
      return { route: 'exam-schedule', examSubject: sub };
    }
  }
  // Tier 2 — 블로그 인덱스 + 포스트. `/blog`, `/blog/:slug`
  if (allowPathRoutes && (pathname === '/blog' || pathname === '/blog/')) {
    return { route: 'blog-index' };
  }
  if (allowPathRoutes && pathname.startsWith('/blog/')) {
    const raw = pathname.slice('/blog/'.length).split('/')[0];
    if (raw) return { route: 'blog-post', blogSlug: raw };
  }

  // 2. Hash-based 라우트 (그 외 모든 routes)
  const hash = window.location.hash.replace(/^#/, '');
  // Phase 4 Step 2 — 직접 진입 (사용자가 강제로 onboarding 재진입 시)
  if (hash.startsWith('/onboarding')) return { route: 'onboarding' };
  if (hash.startsWith('/study-plan/setup')) return { route: 'study-plan-setup' };
  // Phase 4 Step 3 — 학습 플랜 확인 화면
  if (hash.startsWith('/study-plan')) return { route: 'study-plan' };
  // Phase 4 Step 5 — 나의 약점 (5번째 네비 슬롯).
  //   `/progress` 는 backward-compatible alias (이전 라우트 — 외부 링크/북마크 보호).
  if (hash.startsWith('/weakness') || hash.startsWith('/progress')) {
    return { route: 'weakness' };
  }
  if (hash.startsWith('/home')) return { route: 'home' };
  if (hash.startsWith('/quests')) return { route: 'quests' };
  if (hash.startsWith('/friends')) return { route: 'friends' };
  if (hash.startsWith('/stats')) return { route: 'stats' };
  if (hash.startsWith('/settings')) return { route: 'settings' };
  if (hash.startsWith('/bookmarks')) return { route: 'bookmarks' };
  if (hash.startsWith('/admin')) return { route: 'admin' };
  if (hash.startsWith('/redeem')) return { route: 'redeem' };
  if (hash.startsWith('/refund-request'))
    return { route: 'refund-request' };
  if (hash.startsWith('/payment/callback'))
    return { route: 'payment-callback' };
  if (hash.startsWith('/login')) return { route: 'login' };
  if (import.meta.env.DEV && hash.startsWith('/review-preview')) {
    return { route: 'review-preview' };
  }
  if (hash.startsWith('/game')) {
    const parts = hash.split('/').filter(Boolean); // ['game'] or ['game', 'adsp']
    return resolveGamePathRoute(parts[1]);
  }
  if (appModeActive) {
    return { route: 'home' };
  }
  return { route: 'landing' };
}

function getInitialRoute(): RouteState {
  if (typeof window === 'undefined') return { route: 'landing' };

  const initialHash = window.location.hash.replace(/^#/, '').replace(/\/$/, '');
  const resolvedHash = resolveInitialAppRouteHash(
    initialHash,
    isAppMode(),
    needsOnboarding(),
  );

  if (resolvedHash !== initialHash) {
    const url = new URL(window.location.href);
    url.hash = resolvedHash;
    window.history.replaceState(window.history.state, '', url);
  } else if (initialHash === '/game') {
    const url = new URL(window.location.href);
    url.hash = '/home';
    window.history.replaceState(window.history.state, '', url);
  }

  return getRoute();
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
      initialExpansionSubject,
      legalSlug,
      lessonStepId,
      quizQuestionId,
      curriculumSubject,
      faqSubject,
      topicPlanetKey,
      topicId,
      examSubject,
      blogSlug,
    },
    setRouteState,
  ] = useState<RouteState>(() => getInitialRoute());
  const routeScrollKeyRef = useRef<string | null>(null);

  // ── useTransition 으로 끊김 완화 ────────────────────────────────────
  // 첫 탭 클릭 시 lazy chunk + 페이지 mount 비용이 합쳐져 1프레임 정지처럼
  // 보이는 문제. React 18 의 useTransition 은 새 라우트가 준비될 때까지
  // 이전 페이지를 화면에 유지 → 사용자는 끊김 없이 부드러운 전환 체감.
  // (Suspense fallback null 과 함께 작동: chunk 가 mount 되기 전엔 이전
  //  페이지가 보이고, mount 끝나면 즉시 교체.)
  const [, startTransition] = useTransition();

  useEffect(() => {
    markAppModeFromLocation();
    return installAppModeChrome();
  }, []);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('scrollRestoration' in window.history)
    ) {
      return;
    }
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

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
  // GA4 trackPageview 도 같은 hook 에서 발사 (SPA 수동 page_view).
  useEffect(() => {
    // 첫 mount 의 page_view 도 명시 발사 (GA4 send_page_view: false 라 자동 발사 X).
    routeScrollKeyRef.current = routeScrollKey(getRoute());
    trackPageview(window.location.pathname + window.location.hash);
    const onChange = () => {
      const nextRoute = getRoute();
      const nextKey = routeScrollKey(nextRoute);
      routeScrollKeyRef.current = nextKey;
      // Resetting before the new route commits makes the previous tab jump to
      // the top for a frame. useLayoutEffect below handles the new screen.
      startTransition(() => setRouteState(nextRoute));
      trackPageview(window.location.pathname + window.location.hash);
    };
    window.addEventListener('hashchange', onChange);
    window.addEventListener('popstate', onChange);
    return () => {
      window.removeEventListener('hashchange', onChange);
      window.removeEventListener('popstate', onChange);
    };
  }, []);

  useLayoutEffect(() => {
    if (
      shouldResetScrollForRoute({
        route,
        initialSubject,
        initialExpansionSubject,
      })
    ) {
      resetWindowScroll();
    }
  }, [route, initialSubject, initialExpansionSubject]);

  // 프로필·친구·세션·북마크·시험일 ↔ Supabase 자동 sync + 일회 마이그.
  // env 미설정이면 모두 no-op (게스트 모드 = localStorage only).
  useEffect(() => {
    const unsubs = [
      initAuthSessionSync(),
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

  // Phase 4 Step 4 — 라우트 변화 시 lastActiveAt 갱신 (어느 페이지든 진입 = 활성).
  // 미접속 처리 입력. localStorage 기반 (Step 5/6 에서 profiles.last_active_at 으로 전환).
  useEffect(() => {
    void import('./game/forgettingCurve').then(({ markActive }) => {
      markActive();
    });
  }, [route]);

  // Phase 4 Step 2 — 신규 사용자 자동 onboarding 진입.
  // game 라우트 진입 시 onboarding 미완료 상태면 #/onboarding 으로 redirect.
  // mock 단계: localStorage 기반 (`questdp_onboarding_v4` key).
  // 마이그레이션 적용 후: profiles.persona === 'unknown' 으로 전환.
  useEffect(() => {
    if (route !== 'game') return;
    // 동기 import 로 needsOnboarding 호출 (chunk 영향 적음 — 작은 함수)
    import('./game/onboarding/onboardingStorage').then((m) => {
      if (m.needsOnboarding()) {
        window.location.hash = '/onboarding';
      }
    });
  }, [route]);

  // GlobalAmbientBg 는 라우트 전환과 무관하게 항상 마운트 — 페이지가
  // 바뀌어도 영상이 처음부터 다시 시작되지 않게.  각 페이지의 PageAmbientBg
  // 가 controller 에 push/pop 만 해서 fade in/out 으로만 노출 토글한다.
  const renderRoute = () => {
    // 게스트 모드 = 기본. 무료 계정처럼 동작 (localStorage 진도).
    // 로그인 게이트는 결제 시점 (Phase B Premium 업그레이드) 에만 등장.
    // AuthGuard / LoginPage / authGuard.ts 인프라는 그대로 유지 → premium 게이트
    // 에서 setPendingAuthRedirect + #/login 패턴 재사용.
    if (route === 'onboarding') {
      return (
        <OnboardingFlow
          onFinish={() => {
            navigate('/home');
          }}
        />
      );
    }

    if (route === 'study-plan-setup') {
      return (
        <StudyPlanSetupFlow
          onFinish={() => {
            navigate('/study-plan');
          }}
        />
      );
    }

    if (route === 'study-plan') {
      return <StudyPlanRoute />;
    }

    if (route === 'home') {
      if (needsOnboarding()) {
        return (
          <OnboardingFlow
            onFinish={() => {
              navigate('/home');
            }}
          />
        );
      }
      return <HomePage />;
    }

    if (route === 'weakness') {
      return (
        <ProgressDashboard
          onExit={() => {
            window.location.hash = '/game';
          }}
        />
      );
    }


    if (route === 'game') {
      if (needsOnboarding()) {
        return (
          <OnboardingFlow
            onFinish={() => {
              navigate('/home');
            }}
          />
        );
      }
      return (
        <AuthGuard>
          <GamePage
          // key 로 deep-link 진입 변화 시 GamePage 재마운트.
          // ex) /game (chooser) ↔ /game/adsp 사이 이동 시 초기 화면이 갱신됨.
          key={
            initialExpansionSubject
              ? `expansion:${initialExpansionSubject}`
              : initialSubject
                ? `subject:${initialSubject}`
                : 'chooser'
          }
          initialSubject={initialSubject}
          initialExpansionSubject={initialExpansionSubject}
          onExitToLanding={() => {
            if (isAppMode()) {
              window.history.replaceState({}, '', '/?app=1#/home');
              startTransition(() => setRouteState(getRoute()));
              return;
            }
            window.location.hash = '';
          }}
          />
        </AuthGuard>
      );
    }

    if (route === 'stats') {
      return (
        <AuthGuard>
          <StatsPage
          onExit={() => {
            window.location.hash = '/game';
          }}
          />
        </AuthGuard>
      );
    }

    if (route === 'settings') {
      return (
        <AuthGuard>
          <SettingsPage
          onExit={() => {
            window.location.hash = '/game';
          }}
          />
        </AuthGuard>
      );
    }

    if (route === 'quests') {
      return (
        <AuthGuard>
          <QuestsPage
          onExit={() => {
            window.location.hash = '/game';
          }}
          />
        </AuthGuard>
      );
    }

    if (route === 'friends') {
      return (
        <AuthGuard>
          <FriendsPage
          onExit={() => {
            window.location.hash = '/game';
          }}
          />
        </AuthGuard>
      );
    }

    if (route === 'bookmarks') {
      return (
        <AuthGuard>
          <BookmarksPage
          onExit={() => {
            window.location.hash = '/game';
          }}
          />
        </AuthGuard>
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

    if (route === 'study-method') {
      return <StudyMethodPage />;
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

    if (route === 'faq' && faqSubject) {
      return <FaqPage subject={faqSubject} />;
    }

    if (route === 'comhwal-topic' && topicPlanetKey && topicId) {
      return <ComhwalTopicPage planetKey={topicPlanetKey} topicId={topicId} />;
    }

    if (route === 'glossary') {
      return <GlossaryPage />;
    }

    if (route === 'exam-schedule' && examSubject) {
      return <ExamSchedulePage subject={examSubject} />;
    }

    if (route === 'blog-index') {
      return <BlogIndexPage />;
    }

    if (route === 'blog-post' && blogSlug) {
      return <BlogPostPage slug={blogSlug} />;
    }

    if (route === 'pricing') {
      return <PricingPage />;
    }

    if (route === 'contact') {
      return <ContactPage />;
    }

    if (import.meta.env.DEV && route === 'review-preview') {
      return <PlayReviewPromptPreview />;
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
      <div className="questdp-route-layer">
        <ErrorBoundary label="route">
          <Suspense fallback={ROUTE_FALLBACK}>{renderRoute()}</Suspense>
        </ErrorBoundary>
      </div>
      <SettingsDrawer />
      <PremiumPlanModal />
      <AppBillingNotice />
      <TierUpgradeToast />
      <GuestDiscardToast />
    </ToastProvider>
  );
}

import { useEffect, useState } from 'react';
import Landing from './pages/Landing';
import GamePage from './game/GamePage';
import StatsPage from './game/StatsPage';
import BookmarksPage from './game/BookmarksPage';
import QuestsPage from './game/QuestsPage';
import FriendsPage from './game/FriendsPage';
import type { Subject } from './types/question';
import { getSnapshot } from './game/storage';
import { initProfileSync } from './data/profile';
import { initFriendsSync } from './data/friends';
import { initMigration } from './lib/migrate';
import { initSessionSync } from './game/sessionSync';
import { initBookmarksSync } from './game/bookmarks';
import { initExamDatesSync } from './game/examDate';
import { initEnergySync } from './game/energy';

type Route = 'landing' | 'game' | 'stats' | 'bookmarks' | 'quests' | 'friends';

interface RouteState {
  route: Route;
  /** `#/game/adsp` · `#/game/sqld` 처럼 deep-link 진입 시 시작 과목. */
  initialSubject?: Subject;
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

export default function App() {
  const [{ route, initialSubject }, setRouteState] =
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
      initBookmarksSync(),
      initExamDatesSync(),
      initEnergySync(),
      initMigration(),
    ];
    return () => {
      for (const u of unsubs) u();
    };
  }, []);

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

  return <Landing />;
}

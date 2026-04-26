import { useEffect, useState } from 'react';
import Landing from './pages/Landing';
import GamePage from './game/GamePage';
import StatsPage from './game/StatsPage';
import BookmarksPage from './game/BookmarksPage';
import type { Subject } from './types/question';
import { getSnapshot } from './game/storage';

type Route = 'landing' | 'game' | 'stats' | 'bookmarks';

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
 *  - `#/stats`         → stats
 *  - `#/bookmarks`     → bookmarks
 */
function getRoute(): RouteState {
  if (typeof window === 'undefined') return { route: 'landing' };
  const hash = window.location.hash.replace(/^#/, '');
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

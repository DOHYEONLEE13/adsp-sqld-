import { useEffect, useState } from 'react';
import Landing from './pages/Landing';
import GamePage from './game/GamePage';
import StatsPage from './game/StatsPage';

type Route = 'landing' | 'game' | 'stats';

/** 얇은 해시 라우터: `#/game`, `#/stats`, 그 외 랜딩. */
function getRoute(): Route {
  if (typeof window === 'undefined') return 'landing';
  const hash = window.location.hash.replace(/^#/, '');
  if (hash.startsWith('/stats')) return 'stats';
  if (hash.startsWith('/game')) return 'game';
  return 'landing';
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => getRoute());

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (route === 'game') {
    return (
      <GamePage
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

  return <Landing />;
}

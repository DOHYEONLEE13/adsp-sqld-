import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './styles/index.css';

// HelmetProvider — 페이지별 <Helmet> 으로 title/meta/canonical 동적 갱신.
// SPA 환경에서 SEO 의 핵심 — 라우트마다 unique title 노출.
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);

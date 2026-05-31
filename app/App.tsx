import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { WorkPage } from './pages/WorkPage';
import { CookieBanner } from './components/CookieBanner';
import { MetrikaTracker } from './components/MetrikaTracker';

const InsightsPage = lazy(() => import('./pages/InsightsPage').then((m) => ({ default: m.InsightsPage })));
const InsightPostPage = lazy(() => import('./pages/InsightPostPage').then((m) => ({ default: m.InsightPostPage })));

function PageFallback() {
  return (
    <div className="min-h-[40vh] bg-background flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-label="Загрузка" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/insights"
          element={
            <Suspense fallback={<PageFallback />}>
              <InsightsPage />
            </Suspense>
          }
        />
        <Route
          path="/insights/:slug"
          element={
            <Suspense fallback={<PageFallback />}>
              <InsightPostPage />
            </Suspense>
          }
        />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/work" element={<WorkPage />} />
      </Routes>
      <CookieBanner />
      <MetrikaTracker />
    </>
  );
}

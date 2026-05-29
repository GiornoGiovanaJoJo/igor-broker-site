import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { WorkPage } from './pages/WorkPage';
import { InsightsPage } from './pages/InsightsPage';
import { InsightPostPage } from './pages/InsightPostPage';
import { CookieBanner } from './components/CookieBanner';
import { Analytics } from './components/Analytics';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/insights/:slug" element={<InsightPostPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/work" element={<WorkPage />} />
      </Routes>
      <CookieBanner />
      <Analytics />
    </>
  );
}

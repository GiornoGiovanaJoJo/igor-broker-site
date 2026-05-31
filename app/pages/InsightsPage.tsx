import React from 'react';
import '../../styles/fonts-insights.css';
import { InsightsLayout, InsightsPageHeader } from '../components/insights/InsightsLayout';
import { InsightFeed } from '../components/insights/InsightFeed';
import { SeoHead } from '../components/SeoHead';

export function InsightsPage() {
  return (
    <InsightsLayout backHref="/" backLabel="На главную">
      <SeoHead
        title="Аналитика и материалы о новостройках — Igor Broker"
        description="Обзоры ЖК, кейсы, ипотека и практика сделок на рынке новостроек Москвы и области."
        path="/insights"
      />
      <InsightsPageHeader
        title="Аналитика и материалы"
        description="Обзоры ЖК, кейсы, ипотека и практика сделок — без рекламного шума, с фокусом на цифрах и решениях."
      />
      <InsightFeed />
    </InsightsLayout>
  );
}

import React from 'react';
import { InsightsLayout, InsightsPageHeader } from '../components/insights/InsightsLayout';
import { InsightFeed } from '../components/insights/InsightFeed';

export function InsightsPage() {
  return (
    <InsightsLayout backHref="/" backLabel="На главную">
      <InsightsPageHeader
        title="Аналитика и материалы"
        description="Обзоры ЖК, кейсы, ипотека и практика сделок — без рекламного шума, с фокусом на цифрах и решениях."
      />
      <InsightFeed />
    </InsightsLayout>
  );
}

import React from 'react';
import type { InsightPost } from '../../lib/insights/types';
import { absoluteSiteUrl } from '../../site.config';

function upsertJsonLd(id: string, data: Record<string, unknown>) {
  const existing = document.head.querySelector(`script[data-seo-ld="${id}"]`);
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-seo-ld', id);
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function InsightFeedJsonLd({ posts }: { posts: InsightPost[] }) {
  React.useEffect(() => {
    const url = absoluteSiteUrl('/insights');
    upsertJsonLd('insights-feed', {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Аналитика и материалы — Igor Broker',
      description:
        'Обзоры ЖК, кейсы, ипотека и практика сделок на рынке новостроек Москвы и области.',
      url,
      inLanguage: 'ru',
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: posts.slice(0, 10).map((post, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: absoluteSiteUrl(`/insights/${post.slug}`),
          name: post.title,
        })),
      },
    });

    return () => {
      document.head.querySelectorAll('script[data-seo-ld="insights-feed"]').forEach((el) => el.remove());
    };
  }, [posts]);

  return null;
}

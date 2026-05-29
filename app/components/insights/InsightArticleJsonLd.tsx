import React, { useEffect } from 'react';
import type { InsightPost } from '../../lib/insights/types';
import { absoluteSiteUrl, siteConfig } from '../../site.config';

export function InsightArticleJsonLd({ post }: { post: InsightPost }) {
  useEffect(() => {
    const url = absoluteSiteUrl(`/insights/${post.slug}`);
    const imageUrl = post.coverImage.url.startsWith('http')
      ? post.coverImage.url
      : absoluteSiteUrl(post.coverImage.url);

    const data = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedAt,
      author: {
        '@type': 'Person',
        name: siteConfig.brandName,
      },
      publisher: {
        '@type': 'Organization',
        name: siteConfig.brandName,
      },
      image: imageUrl || undefined,
      url: url || undefined,
      mainEntityOfPage: url || undefined,
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-ld', `insight-${post.slug}`);
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      document.head.querySelectorAll(`script[data-seo-ld="insight-${post.slug}"]`).forEach((el) => el.remove());
    };
  }, [post]);

  return null;
}

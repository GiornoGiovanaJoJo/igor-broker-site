import React from 'react';
import type { InsightPost } from '../../lib/insights/types';
import { absoluteSiteUrl, siteConfig, telegramChannelUrl } from '../../site.config';
import { CATEGORY_STYLES } from '../../lib/insights/categoryStyles';

function upsertJsonLd(id: string, data: Record<string, unknown>) {
  const existing = document.head.querySelector(`script[data-seo-ld="${id}"]`);
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-seo-ld', id);
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function InsightArticleJsonLd({ post }: { post: InsightPost }) {
  React.useEffect(() => {
    const url = absoluteSiteUrl(`/insights/${post.slug}`);
    const imageUrl = post.coverImage.url.startsWith('http')
      ? post.coverImage.url
      : absoluteSiteUrl(post.coverImage.url);

    upsertJsonLd(`article-${post.slug}`, {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt,
      datePublished: post.publishedAt,
      dateModified: post.publishedAt,
      inLanguage: 'ru',
      articleSection: CATEGORY_STYLES[post.category].label,
      author: {
        '@type': 'Person',
        name: siteConfig.brandName,
        url: telegramChannelUrl(),
      },
      publisher: {
        '@type': 'Organization',
        name: siteConfig.brandName,
        url: absoluteSiteUrl('/'),
        logo: {
          '@type': 'ImageObject',
          url: absoluteSiteUrl('/favicon.svg'),
        },
      },
      image: imageUrl || undefined,
      url,
      mainEntityOfPage: url,
    });

    upsertJsonLd(`breadcrumb-${post.slug}`, {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: absoluteSiteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Аналитика', item: absoluteSiteUrl('/insights') },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ],
    });

    return () => {
      document.head.querySelectorAll(`script[data-seo-ld="article-${post.slug}"]`).forEach((el) => el.remove());
      document.head.querySelectorAll(`script[data-seo-ld="breadcrumb-${post.slug}"]`).forEach((el) => el.remove());
    };
  }, [post]);

  return null;
}

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { absoluteSiteUrl, siteConfig } from '../site.config';

export type SeoHeadProps = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  noindex?: boolean;
};

export function SeoHead({
  title,
  description,
  path,
  image,
  type = 'website',
  publishedTime,
  noindex = false,
}: SeoHeadProps) {
  const url = absoluteSiteUrl(path);
  const ogImage = image || absoluteSiteUrl(siteConfig.defaultOgImagePath);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : <meta name="robots" content="index, follow" />}
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
    </Helmet>
  );
}

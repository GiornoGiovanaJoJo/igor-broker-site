/**
 * Static SEO HTML for Insights routes (no Puppeteer).
 * Reads dist/index.html + dist/data/insights-snapshot.json after build.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const distDir = join(repoRoot, 'dist');
const snapshotPath = join(distDir, 'data', 'insights-snapshot.json');
const baseHtmlPath = join(distDir, 'index.html');

const siteUrl = (process.env.VITE_SITE_URL || 'https://igor-broker.site').replace(/\/$/, '');
const brandName = 'Igor Broker';
const defaultOgImage = `${siteUrl}/images/hero-portrait.webp`;

const CATEGORY_LABELS = {
  analytics: 'Аналитика',
  jkReview: 'Обзор ЖК',
  case: 'Кейс',
  mortgage: 'Ипотека',
  market: 'Рынок',
  tips: 'Практика',
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function absoluteUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl}${p}`;
}

function resolveImageUrl(url) {
  if (!url) return defaultOgImage;
  if (url.startsWith('http')) return url;
  return absoluteUrl(url);
}

function applySeoToHtml(baseHtml, seo) {
  const {
    title,
    description,
    path,
    ogImage = defaultOgImage,
    ogType = 'website',
    publishedTime,
    jsonLd = [],
    extraHead = '',
  } = seo;

  const canonical = absoluteUrl(path);
  let html = baseHtml;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="${ogType}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`,
  );

  if (!html.includes('name="twitter:title"')) {
    html = html.replace(
      /<meta\s+name="twitter:card"/,
      `<meta name="twitter:title" content="${escapeHtml(title)}" />\n    <meta name="twitter:description" content="${escapeHtml(description)}" />\n    <meta name="twitter:card"`,
    );
  }

  const articleMeta = publishedTime
    ? `\n    <meta property="article:published_time" content="${escapeHtml(publishedTime)}" />`
    : '';

  const jsonLdScripts = jsonLd
    .map(
      (data, index) =>
        `    <script type="application/ld+json" data-seo-prerender="${index}">${JSON.stringify(data)}</script>`,
    )
    .join('\n');

  html = html.replace(
    '</head>',
    `${articleMeta}${extraHead}\n${jsonLdScripts}\n  </head>`,
  );

  return html;
}

function writeRouteHtml(route, html) {
  const outFile =
    route === '/'
      ? join(distDir, 'index.html')
      : join(distDir, route.replace(/^\//, ''), 'index.html');
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, html, 'utf8');
  return outFile;
}

function buildFeedJsonLd(posts) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Аналитика и материалы — Igor Broker',
    description:
      'Обзоры ЖК, кейсы, ипотека и практика сделок на рынке новостроек Москвы и области.',
    url: absoluteUrl('/insights'),
    inLanguage: 'ru',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.slice(0, 10).map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/insights/${post.slug}`),
        name: post.title,
      })),
    },
  };
}

function buildArticleJsonLd(post) {
  const url = absoluteUrl(`/insights/${post.slug}`);
  const imageUrl = resolveImageUrl(post.coverImage?.url);
  const category = CATEGORY_LABELS[post.category] ?? post.category;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt,
      datePublished: post.publishedAt,
      dateModified: post.publishedAt,
      inLanguage: 'ru',
      articleSection: category,
      author: {
        '@type': 'Person',
        name: brandName,
        url: 'https://t.me/IgorBroker',
      },
      publisher: {
        '@type': 'Organization',
        name: brandName,
        url: absoluteUrl('/'),
        logo: {
          '@type': 'ImageObject',
          url: absoluteUrl('/favicon.svg'),
        },
      },
      image: imageUrl,
      url,
      mainEntityOfPage: url,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Аналитика', item: absoluteUrl('/insights') },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ],
    },
  ];
}

function writeRssFeed(posts) {
  const feedUrl = absoluteUrl('/insights/feed.xml');
  const items = posts
    .map((post) => {
      const link = absoluteUrl(`/insights/${post.slug}`);
      const pubDate = new Date(post.publishedAt).toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Аналитика и материалы — Igor Broker</title>
    <link>${escapeXml(absoluteUrl('/insights'))}</link>
    <description>Обзоры ЖК, кейсы, ипотека и практика сделок на рынке новостроек Москвы и области.</description>
    <language>ru</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  const outPath = join(distDir, 'insights', 'feed.xml');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, rss, 'utf8');
  return outPath;
}

function main() {
  if (!existsSync(baseHtmlPath)) {
    console.warn('prerender-seo: dist/index.html missing — skip');
    return;
  }

  const baseHtml = readFileSync(baseHtmlPath, 'utf8');
  let posts = [];

  if (existsSync(snapshotPath)) {
    const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
    posts = (snapshot.posts ?? []).filter((p) => p.publishedAt && p.slug);
  }

  const feedLink = `\n    <link rel="alternate" type="application/rss+xml" title="Аналитика Igor Broker" href="${escapeHtml(absoluteUrl('/insights/feed.xml'))}" />`;

  const insightsHtml = applySeoToHtml(baseHtml, {
    title: 'Аналитика и материалы о новостройках — Igor Broker',
    description:
      'Обзоры ЖК, кейсы, ипотека и практика сделок на рынке новостроек Москвы и области.',
    path: '/insights',
    jsonLd: posts.length ? [buildFeedJsonLd(posts)] : [],
    extraHead: feedLink,
  });
  writeRouteHtml('/insights', insightsHtml);
  console.log('SEO HTML: /insights');

  for (const post of posts) {
    const title = `${post.seoTitle ?? post.title} — Igor Broker`;
    const description = post.seoDescription ?? post.excerpt;
    const postHtml = applySeoToHtml(baseHtml, {
      title,
      description,
      path: `/insights/${post.slug}`,
      ogImage: resolveImageUrl(post.coverImage?.url),
      ogType: 'article',
      publishedTime: post.publishedAt,
      jsonLd: buildArticleJsonLd(post),
    });
    writeRouteHtml(`/insights/${post.slug}`, postHtml);
    console.log(`SEO HTML: /insights/${post.slug}`);
  }

  if (posts.length > 0) {
    const feedPath = writeRssFeed(posts);
    console.log(`RSS feed: ${posts.length} items → ${feedPath}`);
  }

  console.log(`prerender-seo OK: ${posts.length} insight posts`);
}

main();

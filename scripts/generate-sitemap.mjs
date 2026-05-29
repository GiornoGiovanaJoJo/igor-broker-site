/**
 * Generates dist/sitemap.xml and dist/prerender-routes.json from Sanity (or seed fallback).
 * Run after `vite build`. Uses env: VITE_SITE_URL, VITE_SANITY_*.
 */
import { createClient } from '@sanity/client';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const distDir = join(repoRoot, 'dist');

const siteUrl = (process.env.VITE_SITE_URL || 'https://igor-broker.site').replace(/\/$/, '');
const projectId = process.env.VITE_SANITY_PROJECT_ID || 'ho7l3gwr';
const dataset = process.env.VITE_SANITY_DATASET || 'production';
const apiVersion = process.env.VITE_SANITY_API_VERSION || '2024-01-01';

async function loadPosts() {
  if (projectId) {
    const client = createClient({ projectId, dataset, apiVersion, useCdn: false });
    const docs = await client.fetch(
      `*[_type == "insightPost" && defined(publishedAt)] | order(publishedAt desc) {
        "slug": slug.current,
        publishedAt
      }`,
    );
    if (docs.length > 0) return docs;
  }

  const seedPath = join(repoRoot, 'public', 'data', 'insights-seed.json');
  if (existsSync(seedPath)) {
    const seed = JSON.parse(readFileSync(seedPath, 'utf8'));
    return seed.posts.map((p) => ({ slug: p.slug, publishedAt: p.publishedAt }));
  }

  return [];
}

function xmlEscape(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function main() {
  const posts = await loadPosts();
  const staticRoutes = ['/', '/insights'];
  const insightRoutes = posts.map((p) => `/insights/${p.slug}`);
  const allRoutes = [...staticRoutes, ...insightRoutes];

  const urls = [
    { loc: `${siteUrl}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${siteUrl}/insights`, changefreq: 'daily', priority: '0.9' },
    ...posts.map((p) => {
      const slug = String(p.slug);
      return {
        loc: `${siteUrl}/insights/${slug}`,
        lastmod: new Date(p.publishedAt).toISOString().slice(0, 10),
        changefreq: 'monthly',
        priority: '0.8',
      };
    }),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${xmlEscape(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

  writeFileSync(join(distDir, 'sitemap.xml'), sitemap, 'utf8');
  writeFileSync(join(distDir, 'prerender-routes.json'), JSON.stringify(allRoutes, null, 2), 'utf8');

  // robots.txt with correct sitemap URL
  const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
  writeFileSync(join(distDir, 'robots.txt'), robots, 'utf8');

  console.log(`Sitemap: ${urls.length} URLs → ${join(distDir, 'sitemap.xml')}`);
  console.log(`Prerender routes: ${allRoutes.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Generates dist/sitemap.xml, dist/prerender-routes.json, and dist/data/insights-snapshot.json.
 * Run after `vite build`. Uses env: VITE_SITE_URL, VITE_SANITY_*.
 */
import { createClient } from '@sanity/client';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const distDir = join(repoRoot, 'dist');

const siteUrl = (process.env.VITE_SITE_URL || 'https://igor-broker.site').replace(/\/$/, '');
const projectId = process.env.VITE_SANITY_PROJECT_ID || 'ho7l3gwr';
const dataset = process.env.VITE_SANITY_DATASET || 'production';
const apiVersion = process.env.VITE_SANITY_API_VERSION || '2024-01-01';

function mapSanityBlock(raw) {
  const t = raw._type;
  switch (t) {
    case 'insightBlockParagraph':
      return { _type: 'paragraph', text: String(raw.text ?? '') };
    case 'insightBlockHeading':
      return { _type: 'heading', level: raw.level === 3 ? 3 : 2, text: String(raw.text ?? '') };
    case 'insightBlockBulletList':
      return { _type: 'bulletList', items: raw.items ?? [] };
    case 'insightBlockQuote':
      return { _type: 'quote', text: String(raw.text ?? ''), attribution: raw.attribution };
    case 'insightBlockCta':
      return { _type: 'cta', label: String(raw.label ?? ''), url: String(raw.url ?? '') };
    case 'insightBlockImageGallery':
      return {
        _type: 'imageGallery',
        images: (raw.images ?? []).map((img) => ({
          url: img.asset?.url ?? '',
          alt: img.alt,
        })),
        caption: raw.caption,
      };
    case 'insightBlockDivider':
      return { _type: 'divider' };
    default:
      return null;
  }
}

function mapSanityDoc(doc) {
  const slug =
    typeof doc.slug === 'object' && doc.slug?.current ? String(doc.slug.current) : String(doc.slug ?? '');

  return {
    _id: String(doc._id),
    title: String(doc.title ?? ''),
    slug,
    excerpt: String(doc.excerpt ?? ''),
    seoTitle: doc.seoTitle ? String(doc.seoTitle) : undefined,
    seoDescription: doc.seoDescription ? String(doc.seoDescription) : undefined,
    category: doc.category ?? 'market',
    coverImage: {
      url: doc.coverImage?.asset?.url ?? '',
      alt: doc.coverImage?.alt,
    },
    publishedAt: String(doc.publishedAt ?? ''),
    readingTimeMinutes: Number(doc.readingTimeMinutes ?? 3),
    blocks: (doc.blocks ?? []).map(mapSanityBlock).filter(Boolean),
  };
}

async function loadFullPosts() {
  if (projectId) {
    const client = createClient({ projectId, dataset, apiVersion, useCdn: false });
    const docs = await client.fetch(
      `*[_type == "insightPost" && defined(publishedAt)] | order(publishedAt desc) {
        _id, title, slug, excerpt, seoTitle, seoDescription, category, publishedAt, readingTimeMinutes,
        coverImage{ alt, asset->{ url } },
        blocks
      }`,
    );
    if (docs.length > 0) return docs.map(mapSanityDoc);
  }

  const seedPath = join(repoRoot, 'public', 'data', 'insights-seed.json');
  if (existsSync(seedPath)) {
    const seed = JSON.parse(readFileSync(seedPath, 'utf8'));
    return seed.posts;
  }

  return [];
}

async function loadPosts() {
  const full = await loadFullPosts();
  return full.map((p) => ({ slug: p.slug, publishedAt: p.publishedAt }));
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
  const fullPosts = await loadFullPosts();
  const posts = fullPosts.map((p) => ({ slug: p.slug, publishedAt: p.publishedAt }));
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

  const snapshotDir = join(distDir, 'data');
  mkdirSync(snapshotDir, { recursive: true });
  writeFileSync(
    join(snapshotDir, 'insights-snapshot.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), posts: fullPosts }, null, 2),
    'utf8',
  );

  const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
  writeFileSync(join(distDir, 'robots.txt'), robots, 'utf8');

  console.log(`Sitemap: ${urls.length} URLs → ${join(distDir, 'sitemap.xml')}`);
  console.log(`Prerender routes: ${allRoutes.length}`);
  console.log(`Insights snapshot: ${fullPosts.length} posts → ${join(snapshotDir, 'insights-snapshot.json')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

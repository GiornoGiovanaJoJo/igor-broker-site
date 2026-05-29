/**
 * Import posts from public/data/insights-seed.json into Sanity.
 * Usage: SANITY_WRITE_TOKEN=... npm run seed
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../../.env') });

import { createClient } from '@sanity/client';
import { readFileSync, existsSync } from 'node:fs';
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || projectId === 'placeholder') {
  console.error('Set SANITY_STUDIO_PROJECT_ID');
  process.exit(1);
}
if (!token) {
  console.error('Set SANITY_WRITE_TOKEN');
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false });

type SeedBlock = { _type: string; [key: string]: unknown };
type SeedPost = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImage: { url: string; alt?: string };
  publishedAt: string;
  readingTimeMinutes: number;
  blocks: SeedBlock[];
};

function toSanityBlock(block: SeedBlock): Record<string, unknown> {
  switch (block._type) {
    case 'paragraph':
      return { _type: 'insightBlockParagraph', _key: crypto.randomUUID(), text: block.text };
    case 'heading':
      return { _type: 'insightBlockHeading', _key: crypto.randomUUID(), level: block.level, text: block.text };
    case 'bulletList':
      return { _type: 'insightBlockBulletList', _key: crypto.randomUUID(), items: block.items };
    case 'quote':
      return { _type: 'insightBlockQuote', _key: crypto.randomUUID(), text: block.text, attribution: block.attribution };
    case 'cta':
      return { _type: 'insightBlockCta', _key: crypto.randomUUID(), label: block.label, url: block.url };
    case 'divider':
      return { _type: 'insightBlockDivider', _key: crypto.randomUUID() };
    default:
      return { _type: 'insightBlockParagraph', _key: crypto.randomUUID(), text: String(block.text ?? '') };
  }
}

async function uploadCover(relativeUrl: string): Promise<{ _type: 'image'; asset: { _type: 'reference'; _ref: string } }> {
  const localPath = resolve(__dirname, '../../public', relativeUrl.replace(/^\//, ''));
  if (!existsSync(localPath)) {
    throw new Error(`Cover not found: ${localPath}`);
  }
  const buffer = readFileSync(localPath);
  const asset = await client.assets.upload('image', buffer, { filename: localPath.split(/[/\\]/).pop() });
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
}

async function main() {
  const seedPath = resolve(__dirname, '../../public/data/insights-seed.json');
  const { posts } = JSON.parse(readFileSync(seedPath, 'utf-8')) as { posts: SeedPost[] };

  for (const post of posts) {
    const existing = await client.fetch<number>(
      `count(*[_type == "insightPost" && slug.current == $slug])`,
      { slug: post.slug },
    );
    if (existing > 0) {
      console.log(`Skip (exists): ${post.slug}`);
      continue;
    }

    const coverImage = await uploadCover(post.coverImage.url);
    const doc = {
      _type: 'insightPost',
      title: post.title,
      slug: { _type: 'slug', current: post.slug },
      excerpt: post.excerpt,
      category: post.category,
      coverImage,
      publishedAt: post.publishedAt,
      readingTimeMinutes: post.readingTimeMinutes,
      blocks: post.blocks.map(toSanityBlock),
    };

    const id = await client.create(doc);
    console.log(`Created: ${post.slug} (${id._id})`);
  }

  console.log('Seed complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

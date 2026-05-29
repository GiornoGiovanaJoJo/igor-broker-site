/**
 * Delete all insightPost documents from Sanity.
 * Usage: SANITY_WRITE_TOKEN=... npm run delete-posts
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../../.env') });
config({ path: resolve(__dirname, '../../services/insights-bot/.env') });

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'ho7l3gwr';
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.SANITY_DATASET || 'production';
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
  console.error('Set SANITY_WRITE_TOKEN');
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false });

async function main() {
  const posts = await client.fetch<{ _id: string; title?: string; slug?: string }[]>(
    `*[_type == "insightPost"]{ _id, title, "slug": slug.current }`,
  );

  if (posts.length === 0) {
    console.log('No insightPost documents found.');
    return;
  }

  console.log(`Deleting ${posts.length} posts…`);
  for (const post of posts) {
    await client.delete(post._id);
    console.log(`- deleted: ${post.title ?? post.slug ?? post._id}`);
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

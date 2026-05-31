import { createClient, type SanityClient } from '@sanity/client';
import { env, sanityConfigured } from './env.js';
import type { DraftBlock } from './format.js';
import { estimateReadingTimeMinutes, slugifyTitle } from './format.js';
import { regenerateInsightsSnapshot } from './regenerate-snapshot.js';
import type { InsightCategory, PostDraft } from './session.js';

const MAX_EXCERPT_LENGTH = 320;

let client: SanityClient | null = null;

function getClient(): SanityClient {
  if (!client) {
    client = createClient({
      projectId: env.sanityProjectId,
      dataset: env.sanityDataset,
      token: env.sanityWriteToken,
      apiVersion: '2024-01-01',
      useCdn: false,
    });
  }
  return client;
}

async function resolveUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug || 'post';
  let suffix = 2;

  while (true) {
    const taken = await getClient().fetch<number>(
      `count(*[_type == "insightPost" && slug.current == $slug])`,
      { slug },
    );
    if (!taken) return slug;
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function toSanityBlock(block: DraftBlock): Record<string, unknown> {
  const key = crypto.randomUUID();
  switch (block._type) {
    case 'paragraph':
      return { _type: 'insightBlockParagraph', _key: key, text: block.text };
    case 'heading':
      return { _type: 'insightBlockHeading', _key: key, level: block.level, text: block.text };
    case 'bulletList':
      return { _type: 'insightBlockBulletList', _key: key, items: block.items };
    case 'quote':
      return { _type: 'insightBlockQuote', _key: key, text: block.text, attribution: block.attribution };
    case 'cta':
      return { _type: 'insightBlockCta', _key: key, label: block.label, url: block.url };
    case 'divider':
      return { _type: 'insightBlockDivider', _key: key };
    default:
      return { _type: 'insightBlockParagraph', _key: key, text: '' };
  }
}

export async function uploadTelegramPhoto(
  buffer: Buffer,
  filename: string,
): Promise<{ _type: 'image'; asset: { _type: 'reference'; _ref: string } }> {
  const asset = await getClient().assets.upload('image', buffer, { filename });
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
}

export async function publishDraft(
  draft: PostDraft,
  coverBuffer: Buffer | null,
  coverFilename: string,
  publish: boolean,
  galleryBuffers: { buffer: Buffer; filename: string }[] = [],
): Promise<{ id: string; slug: string; snapshotWarning?: string }> {
  if (!sanityConfigured()) {
    throw new Error('Sanity не настроен (SANITY_PROJECT_ID + SANITY_WRITE_TOKEN)');
  }
  if (!draft.title || !draft.excerpt || !draft.category || !draft.blocks?.length) {
    throw new Error('Черновик неполный');
  }

  const baseSlug = draft.slug || slugifyTitle(draft.title);
  const slug = await resolveUniqueSlug(baseSlug);
  const excerpt = draft.excerpt.slice(0, MAX_EXCERPT_LENGTH);
  const readingTimeMinutes = estimateReadingTimeMinutes(draft.blocks);

  let coverImage: { _type: 'image'; asset: { _type: 'reference'; _ref: string } } | undefined;
  if (coverBuffer) {
    coverImage = await uploadTelegramPhoto(coverBuffer, coverFilename);
  }

  const blocks = draft.blocks.map(toSanityBlock);

  if (galleryBuffers.length > 0) {
    const images = await Promise.all(
      galleryBuffers.map((item, index) => uploadTelegramPhoto(item.buffer, item.filename || `gallery-${index}.jpg`)),
    );
    blocks.push({
      _type: 'insightBlockImageGallery',
      _key: crypto.randomUUID(),
      images,
    });
  }

  const doc = {
    _type: 'insightPost' as const,
    title: draft.title,
    slug: { _type: 'slug' as const, current: slug },
    excerpt,
    category: draft.category as InsightCategory,
    publishedAt: publish ? new Date().toISOString() : undefined,
    readingTimeMinutes,
    sourceText: draft.body,
    blocks,
    ...(coverImage ? { coverImage } : {}),
  };

  let created;
  try {
    created = await getClient().create(doc);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Sanity create failed:', message, { slug, publish, title: draft.title });
    throw err;
  }

  if (publish) {
    try {
      await regenerateInsightsSnapshot();
      console.log('Insights snapshot regenerated after publish:', slug);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Snapshot regen failed (post saved in Sanity):', message);
      return { id: created._id, slug, snapshotWarning: message };
    }
  }

  return { id: created._id, slug };
}

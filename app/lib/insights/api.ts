import type { InsightBlock, InsightCategory, InsightPost } from './types';
import { dedupeTitleHeading } from './postProcessBlocks';

const PAGE_SIZE = 6;

function sanityConfigured(): boolean {
  return Boolean(import.meta.env.VITE_SANITY_PROJECT_ID);
}

function mapSanityBlock(raw: Record<string, unknown>): InsightBlock | null {
  const t = raw._type as string;
  switch (t) {
    case 'insightBlockParagraph':
      return { _type: 'paragraph', text: String(raw.text ?? '') };
    case 'insightBlockHeading':
      return { _type: 'heading', level: (raw.level === 3 ? 3 : 2) as 2 | 3, text: String(raw.text ?? '') };
    case 'insightBlockBulletList':
      return { _type: 'bulletList', items: (raw.items as string[]) ?? [] };
    case 'insightBlockQuote':
      return { _type: 'quote', text: String(raw.text ?? ''), attribution: raw.attribution as string | undefined };
    case 'insightBlockCta':
      return { _type: 'cta', label: String(raw.label ?? ''), url: String(raw.url ?? '') };
    case 'insightBlockImageGallery':
      return {
        _type: 'imageGallery',
        images: ((raw.images as { asset?: { url?: string }; alt?: string }[]) ?? []).map((img) => ({
          url: img.asset?.url ?? '',
          alt: img.alt,
        })),
        caption: raw.caption as string | undefined,
      };
    case 'insightBlockDivider':
      return { _type: 'divider' };
    default:
      return null;
  }
}

function mapSanityDoc(doc: Record<string, unknown>): InsightPost {
  const slug = typeof doc.slug === 'object' && doc.slug && 'current' in doc.slug
    ? String((doc.slug as { current: string }).current)
    : String(doc.slug ?? '');

  const cover = doc.coverImage as { asset?: { url?: string }; alt?: string } | undefined;

  return {
    _id: String(doc._id),
    title: String(doc.title),
    slug,
    excerpt: String(doc.excerpt),
    seoTitle: doc.seoTitle ? String(doc.seoTitle) : undefined,
    seoDescription: doc.seoDescription ? String(doc.seoDescription) : undefined,
    category: doc.category as InsightCategory,
    coverImage: {
      url: cover?.asset?.url ?? '',
      alt: cover?.alt,
    },
    publishedAt: String(doc.publishedAt),
    readingTimeMinutes: Number(doc.readingTimeMinutes ?? 3),
    blocks: dedupeTitleHeading(
      ((doc.blocks as Record<string, unknown>[]) ?? [])
        .map(mapSanityBlock)
        .filter((b): b is InsightBlock => b !== null),
      String(doc.title),
    ),
  };
}

let sanityClientPromise: Promise<import('@sanity/client').SanityClient> | null = null;

async function getSanityClient() {
  if (!sanityClientPromise) {
    sanityClientPromise = import('@sanity/client').then(({ createClient }) =>
      createClient({
        projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
        dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
        apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2024-01-01',
        // Fresh API — CDN can keep an empty "all posts" response after deletes/new publishes.
        useCdn: false,
        token: import.meta.env.VITE_SANITY_READ_TOKEN,
      }),
    );
  }
  return sanityClientPromise;
}

let seedCache: InsightPost[] | null = null;

async function loadSeedPosts(): Promise<InsightPost[]> {
  if (seedCache) return seedCache;
  const base = import.meta.env.BASE_URL || '/';
  const url = `${base}${base.endsWith('/') ? '' : '/'}data/insights-seed.json`;
  const res = await fetch(url);
  const data = (await res.json()) as { posts: InsightPost[] };
  seedCache = data.posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  return seedCache;
}

export async function fetchInsightPosts(options: {
  limit?: number;
  cursor?: string | null;
  category?: InsightCategory | null;
}): Promise<{ posts: InsightPost[]; hasMore: boolean; nextCursor: string | null }> {
  const limit = options.limit ?? PAGE_SIZE;

  if (sanityConfigured()) {
    const client = await getSanityClient();
    const cursorDate = options.cursor ? new Date(options.cursor).toISOString() : null;
    const categoryFilter = options.category ? `&& category == "${options.category}"` : '';
    const cursorFilter = cursorDate ? `&& publishedAt < "${cursorDate}"` : '';

    const docs = await client.fetch<Record<string, unknown>[]>(
      `*[_type == "insightPost" && defined(publishedAt) ${categoryFilter} ${cursorFilter}] | order(publishedAt desc) [0...${limit + 1}]{
        _id, title, slug, excerpt, seoTitle, seoDescription, category, publishedAt, readingTimeMinutes,
        coverImage{ alt, asset->{ url } },
        blocks
      }`,
    );

    const hasMore = docs.length > limit;
    const slice = docs.slice(0, limit).map(mapSanityDoc);
    const nextCursor = hasMore && slice.length ? slice[slice.length - 1].publishedAt : null;
    return { posts: slice, hasMore, nextCursor };
  }

  let posts = await loadSeedPosts();
  if (options.category) posts = posts.filter((p) => p.category === options.category);
  if (options.cursor) {
    const cursorTime = new Date(options.cursor).getTime();
    posts = posts.filter((p) => new Date(p.publishedAt).getTime() < cursorTime);
  }
  const hasMore = posts.length > limit;
  const slice = posts.slice(0, limit);
  const nextCursor = hasMore && slice.length ? slice[slice.length - 1].publishedAt : null;
  return { posts: slice, hasMore, nextCursor };
}

export async function fetchInsightBySlug(slug: string): Promise<InsightPost | null> {
  if (sanityConfigured()) {
    const client = await getSanityClient();
    const doc = await client.fetch<Record<string, unknown> | null>(
      `*[_type == "insightPost" && defined(publishedAt) && slug.current == $slug][0]{
        _id, title, slug, excerpt, seoTitle, seoDescription, category, publishedAt, readingTimeMinutes,
        coverImage{ alt, asset->{ url } },
        blocks
      }`,
      { slug },
    );
    return doc ? mapSanityDoc(doc) : null;
  }

  const posts = await loadSeedPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function fetchRelatedPosts(
  slug: string,
  category: InsightCategory,
  limit = 3,
): Promise<InsightPost[]> {
  const { posts } = await fetchInsightPosts({ limit: limit + 1, category });
  return posts.filter((p) => p.slug !== slug).slice(0, limit);
}

export { PAGE_SIZE };

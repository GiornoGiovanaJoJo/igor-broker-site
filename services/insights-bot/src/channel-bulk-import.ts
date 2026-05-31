/**
 * Bulk import public posts from @IgorBroker (t.me/s/) into Sanity.
 */
import axios from 'axios';
import { createClient, type SanityClient } from '@sanity/client';
import { SocksProxyAgent } from 'socks-proxy-agent';
import type { Agent } from 'node:http';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './env.js';
import type { DraftBlock } from './format.js';
import { estimateReadingTimeMinutes, parseBodyToBlocks, slugifyTitle } from './format.js';
import {
  guessCategory,
  parseChannelPostText,
} from './channel-import.js';
import type { InsightCategory } from './session.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const CHANNEL = env.channelUsername;
const MAX_EXCERPT_LENGTH = 320;

let proxyAgent: SocksProxyAgent | undefined;

function getProxyAgent(): Agent | undefined {
  if (!env.proxyUrl) return undefined;
  if (!proxyAgent) proxyAgent = new SocksProxyAgent(env.proxyUrl);
  return proxyAgent;
}

async function fetchText(url: string, useProxy = false): Promise<string> {
  const agent = useProxy ? getProxyAgent() : undefined;
  const res = await axios.get<string>(url, {
    timeout: env.telegramTimeoutMs,
    httpAgent: agent,
    httpsAgent: agent,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
    responseType: 'text',
  });
  return res.data;
}

async function fetchBuffer(url: string, useProxy = false): Promise<Buffer> {
  const agent = useProxy ? getProxyAgent() : undefined;
  const res = await axios.get<ArrayBuffer>(url, {
    timeout: env.telegramTimeoutMs,
    httpAgent: agent,
    httpsAgent: agent,
    responseType: 'arraybuffer',
  });
  return Buffer.from(res.data);
}

export type ScrapedChannelPost = {
  messageId: number;
  publishedAt: string;
  rawText: string;
  imageUrls: string[];
  sourceUrl: string;
};

export function parsePostsFromChannelHtml(html: string): ScrapedChannelPost[] {
  const posts: ScrapedChannelPost[] = [];
  const idMatches = [...html.matchAll(new RegExp(`data-post="${CHANNEL}/(\\d+)"`, 'g'))];
  const uniqueIds = [...new Set(idMatches.map((m) => Number.parseInt(m[1], 10)))];

  for (const messageId of uniqueIds) {
    const marker = `data-post="${CHANNEL}/${messageId}"`;
    const start = html.indexOf(marker);
    if (start < 0) continue;
    const chunk = html.slice(start, start + 15000);

    const dateMatch = chunk.match(/<time[^>]*datetime="([^"]+)"/);
    const publishedAt = dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString();

    const textMatch = chunk.match(
      /<div[^>]*class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/,
    );
    const rawHtml = textMatch?.[1] ?? '';
    const rawText = rawHtml
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();

    if (!rawText) continue;

    const imageUrls: string[] = [];
    const bgRe = /background-image:url\('([^']+)'\)/g;
    let bg;
    while ((bg = bgRe.exec(chunk)) !== null) {
      if (!imageUrls.includes(bg[1])) imageUrls.push(bg[1]);
    }

    posts.push({
      messageId,
      publishedAt,
      rawText,
      imageUrls,
      sourceUrl: `https://t.me/${CHANNEL}/${messageId}`,
    });
  }

  return posts;
}

export async function scrapeChannelPosts(limit = 500): Promise<ScrapedChannelPost[]> {
  const collected = new Map<number, ScrapedChannelPost>();
  let before = 0;
  let page = 0;

  while (page < 60 && collected.size < limit) {
    const url = before ? `https://t.me/s/${CHANNEL}?before=${before}` : `https://t.me/s/${CHANNEL}`;
    let html: string;
    try {
      html = await fetchText(url, false);
    } catch (err) {
      console.warn(`t.me fetch failed (direct), retry via proxy: ${err instanceof Error ? err.message : err}`);
      html = await fetchText(url, true);
    }
    const batch = parsePostsFromChannelHtml(html);
    if (!batch.length) break;

    let oldest = before;
    for (const post of batch) {
      if (!collected.has(post.messageId)) collected.set(post.messageId, post);
      if (!oldest || post.messageId < oldest) oldest = post.messageId;
    }

    if (oldest === before) break;
    before = oldest;
    page += 1;
    await new Promise((r) => setTimeout(r, 700));
  }

  return [...collected.values()].sort((a, b) => b.messageId - a.messageId).slice(0, limit);
}

function getSanityClient(): SanityClient {
  return createClient({
    projectId: env.sanityProjectId,
    dataset: env.sanityDataset,
    token: env.sanityWriteToken,
    apiVersion: '2024-01-01',
    useCdn: false,
  });
}

async function resolveUniqueSlug(client: SanityClient, baseSlug: string): Promise<string> {
  let slug = baseSlug || 'post';
  let suffix = 2;
  while (true) {
    const taken = await client.fetch<number>(
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
    case 'divider':
      return { _type: 'insightBlockDivider', _key: key };
    default:
      return { _type: 'insightBlockParagraph', _key: key, text: '' };
  }
}

async function postExists(client: SanityClient, sourceUrl: string, title: string): Promise<boolean> {
  const found = await client.fetch<number>(
    `count(*[_type == "insightPost" && (sourceText match $url || title == $title)])`,
    { url: `*${sourceUrl}*`, title },
  );
  return found > 0;
}

async function uploadImage(client: SanityClient, url: string): Promise<{ _type: 'image'; asset: { _type: 'reference'; _ref: string } }> {
  const buffer = await fetchBuffer(url);
  const filename = url.split('/').pop()?.split('?')[0] || `tg-${Date.now()}.jpg`;
  const asset = await client.assets.upload('image', buffer, { filename });
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
}

function runNodeScript(script: string): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [script], {
      cwd: repoRoot,
      env: {
        ...process.env,
        VITE_SITE_URL: process.env.VITE_SITE_URL || 'https://igor-broker.site',
        VITE_SANITY_PROJECT_ID: env.sanityProjectId,
        VITE_SANITY_DATASET: env.sanityDataset,
      },
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolvePromise() : reject(new Error(`${script} exit ${code}`))));
  });
}

export type ImportResult = {
  scraped: number;
  created: number;
  skipped: number;
  failed: number;
  items: { status: string; sourceUrl: string; title?: string; slug?: string; error?: string }[];
};

export async function importChannelPostsToSanity(options: {
  limit?: number;
  dryRun?: boolean;
  regenerateSeo?: boolean;
}): Promise<ImportResult> {
  const limit = options.limit ?? 500;
  const dryRun = options.dryRun ?? false;
  const client = getSanityClient();

  const posts = await scrapeChannelPosts(limit);
  const result: ImportResult = {
    scraped: posts.length,
    created: 0,
    skipped: 0,
    failed: 0,
    items: [],
  };

  for (const post of posts) {
    try {
      const parsed = parseChannelPostText(post.rawText);
      if (!parsed.body) {
        result.skipped += 1;
        result.items.push({ status: 'skip', sourceUrl: post.sourceUrl, error: 'empty body' });
        continue;
      }

      if (await postExists(client, post.sourceUrl, parsed.title ?? '')) {
        result.skipped += 1;
        result.items.push({ status: 'skip', sourceUrl: post.sourceUrl, title: parsed.title, error: 'exists' });
        continue;
      }

      const category = (guessCategory(parsed.body) ?? 'tips') as InsightCategory;
      const blocks = parseBodyToBlocks(parsed.body);
      const baseSlug = slugifyTitle(parsed.title ?? 'post');
      const slug = dryRun ? baseSlug : await resolveUniqueSlug(client, baseSlug);

      if (dryRun) {
        result.created += 1;
        result.items.push({ status: 'dry-run', sourceUrl: post.sourceUrl, title: parsed.title, slug });
        continue;
      }

      let coverImage;
      if (post.imageUrls[0]) {
        try {
          coverImage = await uploadImage(client, post.imageUrls[0]);
        } catch {
          /* optional cover */
        }
      }

      const doc = {
        _type: 'insightPost' as const,
        title: parsed.title,
        slug: { _type: 'slug' as const, current: slug },
        excerpt: (parsed.excerpt ?? '').slice(0, MAX_EXCERPT_LENGTH),
        category,
        publishedAt: post.publishedAt,
        readingTimeMinutes: estimateReadingTimeMinutes(blocks),
        sourceText: `${parsed.body}\n\nИсточник: ${post.sourceUrl}`,
        blocks: blocks.map(toSanityBlock),
        ...(coverImage ? { coverImage } : {}),
      };

      await client.create(doc);
      result.created += 1;
      result.items.push({ status: 'created', sourceUrl: post.sourceUrl, title: parsed.title, slug });
    } catch (err) {
      result.failed += 1;
      result.items.push({
        status: 'error',
        sourceUrl: post.sourceUrl,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    await new Promise((r) => setTimeout(r, 250));
  }

  if (!dryRun && result.created > 0 && options.regenerateSeo !== false && existsSync(resolve(repoRoot, 'dist/index.html'))) {
    await runNodeScript(resolve(repoRoot, 'scripts/generate-sitemap.mjs'));
    await runNodeScript(resolve(repoRoot, 'scripts/prerender-seo.mjs'));
  }

  return result;
}

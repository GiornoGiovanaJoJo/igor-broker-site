import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

function normalizeProxyUrl(raw: string): string {
  if (!raw) return '';
  // DNS через прокси — критично для api.telegram.org с VPS в РФ
  if (raw.startsWith('socks5://')) return raw.replace('socks5://', 'socks5h://');
  return raw;
}

export const env = {
  port: Number(process.env.BOT_PORT || 8787),
  botToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
  editorPin: process.env.BOT_EDITOR_PIN ?? '',
  webhookSecret: process.env.BOT_WEBHOOK_SECRET ?? 'telegram',
  publicUrl: process.env.BOT_PUBLIC_URL ?? '',
  proxyUrl: normalizeProxyUrl(process.env.TELEGRAM_PROXY_URL ?? ''),
  telegramTimeoutMs: Number(process.env.TELEGRAM_TIMEOUT_MS || 60_000),
  usePolling: process.env.TELEGRAM_USE_POLLING === '1' || process.env.TELEGRAM_USE_POLLING === 'true',
  sanityProjectId: process.env.SANITY_PROJECT_ID ?? process.env.SANITY_STUDIO_PROJECT_ID ?? '',
  sanityDataset: process.env.SANITY_DATASET ?? 'production',
  sanityWriteToken: process.env.SANITY_WRITE_TOKEN ?? '',
  cursorApiKey: process.env.CURSOR_API_KEY ?? '',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
};

export function botConfigured(): boolean {
  return Boolean(env.botToken && env.editorPin);
}

export function sanityConfigured(): boolean {
  return Boolean(env.sanityProjectId && env.sanityWriteToken);
}

export function cursorConfigured(): boolean {
  return Boolean(env.cursorApiKey);
}

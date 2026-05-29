import 'dotenv/config';

export const env = {
  port: Number(process.env.BOT_PORT || 8787),
  botToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
  editorPin: process.env.BOT_EDITOR_PIN ?? '',
  webhookSecret: process.env.BOT_WEBHOOK_SECRET ?? 'telegram',
  publicUrl: process.env.BOT_PUBLIC_URL ?? '',
  proxyUrl: process.env.TELEGRAM_PROXY_URL ?? '',
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

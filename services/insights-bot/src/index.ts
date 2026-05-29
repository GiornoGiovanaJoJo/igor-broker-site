import express from 'express';
import { botConfigured, env } from './env.js';
import { createBot } from './bot.js';

const app = express();

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    bot: botConfigured(),
    mode: env.usePolling || !env.publicUrl ? 'polling' : 'webhook',
    proxy: Boolean(env.proxyUrl),
    sanity: Boolean(env.sanityProjectId && env.sanityWriteToken),
    cursor: Boolean(env.cursorApiKey),
    webhook: !env.usePolling && env.publicUrl
      ? `${env.publicUrl.replace(/\/$/, '')}/webhook/${env.webhookSecret || 'telegram'}`
      : null,
  });
});

if (botConfigured()) {
  const bot = createBot();

  bot.catch(async (err, ctx) => {
    console.error('Bot handler error:', err);
    try {
      await ctx.reply('Произошла ошибка. Попробуйте /start или /help.');
    } catch {
      /* ignore */
    }
  });

  const usePolling = env.usePolling || !env.publicUrl;

  if (!usePolling && env.publicUrl) {
    const webhookPath = `/webhook/${env.webhookSecret || 'telegram'}`;
    const webhookUrl = `${env.publicUrl.replace(/\/$/, '')}${webhookPath}`;

    app.use(bot.webhookCallback(webhookPath));

    bot.telegram
      .setWebhook(webhookUrl, { drop_pending_updates: true })
      .then(async () => {
        console.log(`Webhook set: ${webhookUrl}`);
        const info = await bot.telegram.getWebhookInfo();
        console.log('Webhook info:', JSON.stringify(info));
      })
      .catch((err) => {
        console.error('Webhook setup failed:', err);
      });
  } else {
    bot.telegram.deleteWebhook({ drop_pending_updates: true }).catch(() => {});

    bot
      .launch()
      .then(() => {
        console.log('Bot started in polling mode (proxy:', Boolean(env.proxyUrl), ')');
      })
      .catch((err) => {
        console.error('Bot launch failed:', err);
      });

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  }
} else {
  console.warn('Bot not configured — set TELEGRAM_BOT_TOKEN and BOT_EDITOR_PIN');
}

app.listen(env.port, () => {
  console.log(`Insights bot listening on :${env.port}`);
});

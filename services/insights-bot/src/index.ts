import express from 'express';
import { botConfigured, env } from './env.js';
import { createBot } from './bot.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    bot: botConfigured(),
    proxy: Boolean(env.proxyUrl),
    sanity: Boolean(env.sanityProjectId && env.sanityWriteToken),
    cursor: Boolean(env.cursorApiKey),
  });
});

if (botConfigured()) {
  const bot = createBot();

  if (env.publicUrl) {
    const webhookPath = `/webhook/${env.webhookSecret || 'telegram'}`;
    const webhookUrl = `${env.publicUrl.replace(/\/$/, '')}${webhookPath}`;

    app.use(webhookPath, (req, res, next) => {
      bot.webhookCallback(webhookPath)(req, res, next);
    });

    bot.telegram.setWebhook(webhookUrl).then(() => {
      console.log(`Webhook set: ${webhookUrl}`);
    }).catch((err) => {
      console.error('Webhook setup failed:', err);
    });
  } else {
    bot.launch().then(() => {
      console.log('Bot started in polling mode');
    }).catch((err) => {
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

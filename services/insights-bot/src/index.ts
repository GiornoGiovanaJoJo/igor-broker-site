import express from 'express';
import type { Telegraf } from 'telegraf';
import { botConfigured, env } from './env.js';
import { createBot } from './bot.js';
import { collectDiagnostics, getBotUsername, getLaunchState, setBotUsername, setLaunchState } from './diagnostics.js';

const app = express();
const usePolling = env.usePolling || !env.publicUrl;

function startPollingBot(bot: Telegraf, attempt = 1) {
  if (attempt === 1) setLaunchState('launching');

  bot
    .launch({ dropPendingUpdates: false }, () => {
      const me = bot.botInfo;
      if (me?.username) setBotUsername(me.username);
      console.log('Bot polling started @', me?.username, '(proxy:', Boolean(env.proxyUrl), ')');
      setLaunchState('ok');
    })
    .catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Bot launch attempt ${attempt}/5 failed:`, msg);
      if (attempt >= 5) {
        setLaunchState('error', msg);
        return;
      }
      setTimeout(() => startPollingBot(bot, attempt + 1), 3000 * attempt);
    });
}

app.get('/health', (_req, res) => {
  const { launchState, launchError } = getLaunchState();
  res.json({
    ok: true,
    bot: botConfigured(),
    botUsername: getBotUsername(),
    mode: usePolling ? 'polling' : 'webhook',
    proxy: Boolean(env.proxyUrl),
    launchState,
    launchError,
    sanity: Boolean(env.sanityProjectId && env.sanityWriteToken),
    cursor: Boolean(env.cursorApiKey),
  });
});

app.get('/diag', async (_req, res) => {
  try {
    const diag = await collectDiagnostics(usePolling ? 'polling' : 'webhook');
    res.json(diag);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

if (botConfigured()) {
  const bot = createBot();

  bot.use(async (ctx, next) => {
    console.log('Update:', ctx.updateType, ctx.from?.id, 'text' in (ctx.message ?? {}) ? (ctx.message as { text?: string }).text : '');
    return next();
  });

  bot.catch(async (err, ctx) => {
    console.error('Bot handler error:', err);
    try {
      await ctx.reply('Произошла ошибка. Попробуйте /start или /help.');
    } catch {
      /* ignore */
    }
  });

  if (!usePolling && env.publicUrl) {
    const webhookPath = `/webhook/${env.webhookSecret || 'telegram'}`;
    const webhookUrl = `${env.publicUrl.replace(/\/$/, '')}${webhookPath}`;
    app.use(bot.webhookCallback(webhookPath));

    setLaunchState('launching');
    bot.telegram
      .setWebhook(webhookUrl, { drop_pending_updates: true })
      .then(async () => {
        console.log(`Webhook set: ${webhookUrl}`);
        setLaunchState('ok');
      })
      .catch((err) => {
        console.error('Webhook setup failed:', err);
        setLaunchState('error', err instanceof Error ? err.message : String(err));
      });
  } else {
    void startPollingBot(bot);

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  }
} else {
  console.warn('Bot not configured — set TELEGRAM_BOT_TOKEN and BOT_EDITOR_PIN');
}

app.listen(env.port, () => {
  console.log(`Insights bot listening on :${env.port}`);
});

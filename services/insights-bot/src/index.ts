import express from 'express';
import type { Telegraf } from 'telegraf';
import { botConfigured, env } from './env.js';
import { createBot } from './bot.js';
import { collectDiagnostics, getBotUsername, getLaunchState, setBotUsername, setLaunchState } from './diagnostics.js';

const app = express();
const usePolling = env.usePolling || !env.publicUrl;

async function withRetry<T>(label: string, fn: () => Promise<T>, attempts = 5): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`${label} attempt ${i + 1}/${attempts} failed:`, msg);
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 3000 * (i + 1)));
      }
    }
  }
  throw last;
}

async function startPollingBot(bot: Telegraf) {
  setLaunchState('launching');
  try {
    const me = await withRetry('getMe', () => bot.telegram.getMe());
    setBotUsername(me.username);
    console.log('Telegram getMe OK:', me.username, me.id);

    try {
      await withRetry('deleteWebhook', () =>
        bot.telegram.deleteWebhook({ drop_pending_updates: false }),
      );
    } catch (err) {
      console.warn(
        'deleteWebhook failed, starting polling anyway:',
        err instanceof Error ? err.message : err,
      );
    }

    setLaunchState('ok');
    console.log('Bot polling starting @', me.username, '(proxy:', Boolean(env.proxyUrl), ')');

    void bot.startPolling().catch((err) => {
      console.error('Polling stopped:', err);
      setLaunchState('error', err instanceof Error ? err.message : String(err));
    });
  } catch (err) {
    console.error('Bot start failed:', err);
    setLaunchState('error', err instanceof Error ? err.message : String(err));
  }
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

import { createBot } from './bot.js';
import { env } from './env.js';
import { getTelegrafOptions } from './telegram.js';

export type BotDiagnostics = {
  configured: boolean;
  botUsername: string | null;
  mode: string;
  proxy: boolean;
  launchState: 'idle' | 'launching' | 'ok' | 'error';
  launchError: string | null;
  telegram: {
    getMe: unknown;
    getMeError: string | null;
    webhookInfo: unknown;
    webhookError: string | null;
  };
};

let launchState: BotDiagnostics['launchState'] = 'idle';
let launchError: string | null = null;
let botUsername: string | null = null;

export function getLaunchState() {
  return { launchState, launchError };
}

export function getBotUsername() {
  return botUsername;
}

export function setBotUsername(username: string) {
  botUsername = username;
}

export function setLaunchState(state: BotDiagnostics['launchState'], error: string | null = null) {
  launchState = state;
  launchError = error;
}

export async function collectDiagnostics(mode: string): Promise<BotDiagnostics> {
  const base: BotDiagnostics = {
    configured: Boolean(env.botToken && env.editorPin),
    botUsername,
    mode,
    proxy: Boolean(env.proxyUrl),
    launchState,
    launchError,
    telegram: {
      getMe: null,
      getMeError: null,
      webhookInfo: null,
      webhookError: null,
    },
  };

  if (!env.botToken) return base;

  try {
    const { Telegraf } = await import('telegraf');
    const probe = new Telegraf(env.botToken, getTelegrafOptions());
    const me = await probe.telegram.getMe();
    base.telegram.getMe = me;
    if (me && typeof me === 'object' && 'username' in me && typeof me.username === 'string') {
      base.botUsername = me.username;
    }
  } catch (err) {
    base.telegram.getMeError = err instanceof Error ? err.message : String(err);
  }

  try {
    const { Telegraf } = await import('telegraf');
    const probe = new Telegraf(env.botToken, getTelegrafOptions());
    base.telegram.webhookInfo = await probe.telegram.getWebhookInfo();
  } catch (err) {
    base.telegram.webhookError = err instanceof Error ? err.message : String(err);
  }

  return base;
}

import axios from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';
import type { Agent } from 'node:http';
import { env } from './env.js';

let proxyAgent: SocksProxyAgent | undefined;

export function getTelegramAgent(): Agent | undefined {
  if (!env.proxyUrl) return undefined;
  if (!proxyAgent) {
    proxyAgent = new SocksProxyAgent(env.proxyUrl);
    console.log(`Telegram proxy enabled: ${env.proxyUrl.replace(/:[^:@/]+@/, ':***@')}`);
  }
  return proxyAgent;
}

export function getTelegrafOptions() {
  const agent = getTelegramAgent();
  if (!agent) return {};
  return {
    telegram: {
      agent,
      apiRoot: 'https://api.telegram.org',
    },
  };
}

export async function fetchBuffer(url: string): Promise<Buffer> {
  const agent = getTelegramAgent();
  const res = await axios.get<ArrayBuffer>(url, {
    responseType: 'arraybuffer',
    timeout: env.telegramTimeoutMs,
    httpAgent: agent,
    httpsAgent: agent,
  });
  return Buffer.from(res.data);
}

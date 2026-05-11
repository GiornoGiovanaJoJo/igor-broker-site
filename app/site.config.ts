/**
 * Подставьте реквизиты (или задайте в .env: VITE_PHONE_DISPLAY, VITE_PHONE_TEL, VITE_EMAIL).
 */
export const siteConfig = {
  brandName: 'Igor Broker',
  tagline: 'Private · Новостройки',

  phoneDisplay: import.meta.env.VITE_PHONE_DISPLAY ?? '+7 (999) 123-45-67',
  phoneTel: import.meta.env.VITE_PHONE_TEL ?? '+79991234567',
  email: import.meta.env.VITE_EMAIL ?? 'igor@broker.ru',

  telegramUsername: 'igorbroker',
  telegramChannelUsername: 'igorbroker_channel',

  /** Полный URL сайта для SEO (production). В dev можно не задавать. */
  siteUrl: import.meta.env.VITE_SITE_URL?.replace(/\/$/, '') ?? '',

  city: 'Москва',
  region: 'Москва и МО',
} as const;

export function telegramDmUrl(text?: string): string {
  const base = `https://t.me/${siteConfig.telegramUsername}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function telegramChannelUrl(): string {
  return `https://t.me/${siteConfig.telegramChannelUsername}`;
}

export function absoluteSiteUrl(path = ''): string {
  const base = siteConfig.siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  if (!path) return base || '/';
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

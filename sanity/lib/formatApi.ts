import type { DraftBlock } from './draftBlocks';

const API_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as ImportMeta & { env?: Record<string, string> }).env?.SANITY_STUDIO_FORMAT_API_URL) ||
  '/api/bot/format';

const EDITOR_PIN =
  (typeof import.meta !== 'undefined' &&
    (import.meta as ImportMeta & { env?: Record<string, string> }).env?.SANITY_STUDIO_EDITOR_PIN) ||
  '';

export type FormatApiResponse = {
  blocks: DraftBlock[];
  source: 'cursor' | 'local';
};

export async function formatWithCursor(input: {
  title: string;
  excerpt: string;
  body: string;
}): Promise<FormatApiResponse> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, pin: EDITOR_PIN }),
  });

  const payload = (await res.json().catch(() => ({}))) as { error?: string; blocks?: DraftBlock[]; source?: string };

  if (!res.ok) {
    throw new Error(payload.error || `HTTP ${res.status}`);
  }

  if (!payload.blocks?.length) {
    throw new Error('Сервер вернул пустой текст');
  }

  return {
    blocks: payload.blocks,
    source: payload.source === 'local' ? 'local' : 'cursor',
  };
}

import type { Request, Response } from 'express';
import { cursorConfigured, env } from './env.js';
import { improveTextWithCursor } from './cursor.js';
import type { DraftBlock } from './format.js';
import { parseBodyToBlocks } from './format.js';

export type FormatRequestBody = {
  title?: string;
  excerpt?: string;
  body?: string;
  pin?: string;
};

export type FormatResponseBody = {
  blocks: DraftBlock[];
  source: 'cursor' | 'local';
};

function unauthorized(res: Response): void {
  res.status(401).json({ error: 'Неверный PIN редактора' });
}

export async function formatDraftBody(input: {
  title: string;
  excerpt: string;
  body: string;
}): Promise<{ blocks: DraftBlock[]; source: 'cursor' | 'local' }> {
  if (cursorConfigured()) {
    const blocks = await improveTextWithCursor(input);
    return { blocks, source: 'cursor' };
  }
  return { blocks: parseBodyToBlocks(input.body), source: 'local' };
}

export async function handleFormatRequest(req: Request, res: Response): Promise<void> {
  const { title, excerpt, body, pin } = req.body as FormatRequestBody;

  if (!pin || pin !== env.editorPin) {
    unauthorized(res);
    return;
  }

  const trimmedTitle = title?.trim() ?? '';
  const trimmedExcerpt = excerpt?.trim() ?? '';
  const trimmedBody = body?.trim() ?? '';

  if (!trimmedTitle || !trimmedExcerpt || !trimmedBody) {
    res.status(400).json({ error: 'Нужны title, excerpt и body' });
    return;
  }

  try {
    const result = await formatDraftBody({
      title: trimmedTitle,
      excerpt: trimmedExcerpt,
      body: trimmedBody,
    });
    res.json(result satisfies FormatResponseBody);
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Ошибка форматирования',
    });
  }
}

import { Agent } from '@cursor/sdk';
import { cursorConfigured, env } from './env.js';
import type { DraftBlock } from './format.js';
import { normalizeLineBreaks, parseBodyToBlocks } from './format.js';

const SYSTEM_PROMPT = `Ты редактор премиальной ленты недвижимости Igor Broker.
Преобразуй текст в JSON-массив structured blocks для editorial feed.

Правила:
- Абзацы через двойной перенос; одиночный перенос внутри абзаца → пробел
- Списки: bulletList с items
- Цитаты: quote с text
- Заголовки: heading level 2 или 3
- Без ALL CAPS, без рекламного шума
- Русская типографика: неразрывный пробел перед ₽, %, м²
- Верни ТОЛЬКО валидный JSON-массив без markdown-обёртки

Типы блоков:
{ "_type": "paragraph", "text": "..." }
{ "_type": "heading", "level": 2|3, "text": "..." }
{ "_type": "bulletList", "items": ["...", "..."] }
{ "_type": "quote", "text": "..." }
{ "_type": "divider" }`;

function extractJsonArray(text: string): DraftBlock[] | null {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]) as unknown[];
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isValidBlock);
  } catch {
    return null;
  }
}

function isValidBlock(item: unknown): item is DraftBlock {
  if (!item || typeof item !== 'object') return false;
  const t = (item as { _type?: string })._type;
  return ['paragraph', 'heading', 'bulletList', 'quote', 'cta', 'divider'].includes(t ?? '');
}

export async function improveTextWithCursor(input: {
  title: string;
  excerpt: string;
  body: string;
}): Promise<DraftBlock[]> {
  if (!cursorConfigured()) {
    throw new Error('Cursor API не настроен (CURSOR_API_KEY)');
  }

  const userPrompt = `Заголовок: ${input.title}
Лид: ${input.excerpt}

Тело:
${normalizeLineBreaks(input.body)}

Верни JSON-массив blocks.`;

  const result = await Agent.prompt(`${SYSTEM_PROMPT}\n\n${userPrompt}`, {
    apiKey: env.cursorApiKey,
    model: { id: 'composer-2.5' },
  });

  const output = typeof result.result === 'string' ? result.result : JSON.stringify(result.result);
  const blocks = extractJsonArray(output);
  if (blocks?.length) return blocks;

  // Fallback: local parser if Cursor returns prose instead of JSON
  return parseBodyToBlocks(input.body);
}

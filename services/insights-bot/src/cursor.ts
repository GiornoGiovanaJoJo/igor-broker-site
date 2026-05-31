import { cursorConfigured, env } from './env.js';
import type { DraftBlock } from './format.js';
import { normalizeLineBreaks, parseBodyToBlocks } from './format.js';

const CURSOR_TIMEOUT_MS = 90_000;

const SYSTEM_PROMPT = `Ты редактор премиальной ленты недвижимости Igor Broker.
Преобразуй текст в JSON-массив structured blocks для editorial feed.

Правила:
- Сохраняй текст максимально близко к оригиналу Telegram: эмодзи, тон, переносы смысла
- НЕ дублируй заголовок документа как heading — если первая строка = title, пропусти её
- Списки из Telegram (- пункт) → bulletList; в items сохраняй эмодзи в конце строк
- Жирный текст из Telegram → **такой фрагмент** внутри paragraph (markdown)
- P.S. и юридические оговорки → отдельный paragraph, можно обернуть фразу в *курсив*
- @username оставляй как @username в тексте
- Цитаты: quote с text
- Подзаголовки только если это явно новая секция, не первая строка поста
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

function normalizeComparable(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim();
}

function dedupeTitleHeading(blocks: DraftBlock[], title: string): DraftBlock[] {
  if (!blocks.length || blocks[0]._type !== 'heading') return blocks;

  const heading = normalizeComparable(blocks[0].text);
  const docTitle = normalizeComparable(title);
  if (!heading || !docTitle) return blocks;

  if (heading === docTitle || docTitle.startsWith(heading) || heading.startsWith(docTitle)) {
    return blocks.slice(1);
  }

  return blocks;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Cursor timeout (${ms}ms)`)), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function promptCursorAgent(userPrompt: string): Promise<string> {
  const { Agent } = await import('@cursor/sdk');
  const result = await Agent.prompt(`${SYSTEM_PROMPT}\n\n${userPrompt}`, {
    apiKey: env.cursorApiKey,
    model: { id: 'composer-2.5' },
  });
  return typeof result.result === 'string' ? result.result : JSON.stringify(result.result);
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

  try {
    const output = await withTimeout(promptCursorAgent(userPrompt), CURSOR_TIMEOUT_MS);
    const blocks = extractJsonArray(output);
    if (blocks?.length) return dedupeTitleHeading(blocks, input.title);
  } catch (err) {
    console.warn('Cursor formatting failed, using local parser:', err instanceof Error ? err.message : err);
  }

  return dedupeTitleHeading(parseBodyToBlocks(input.body), input.title);
}

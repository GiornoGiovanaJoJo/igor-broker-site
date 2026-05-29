/**
 * Normalizes raw text for insight posts: consistent line breaks and RU typography.
 */

const NBSP = '\u00A0';

/** Non-breaking space before short units (₽, %, m², etc.) */
function applyRuTypography(text: string): string {
  return text
    .replace(/\s+(₽|руб\.?|%|м²|м2|г\.|ул\.|пр\.|д\.)/gi, `${NBSP}$1`)
    .replace(/(\d)\s+(₽|руб|%|м²|м2)/gi, `$1${NBSP}$2`);
}

export function normalizeLineBreaks(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();
}

/** Split plain text into paragraph strings (double newline = new paragraph). */
export function splitIntoParagraphs(raw: string): string[] {
  const normalized = normalizeLineBreaks(raw);
  if (!normalized) return [];
  return normalized
    .split(/\n\n+/)
    .map((p) => applyRuTypography(p.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()))
    .filter(Boolean);
}

/** Detect bullet lines (-, •, *, 1.) and group as list block. */
export function parseBodyToBlocks(raw: string): Array<{ _type: string; [key: string]: unknown }> {
  const normalized = normalizeLineBreaks(raw);
  if (!normalized) return [];

  const sections = normalized.split(/\n\n+/);
  const blocks: Array<{ _type: string; [key: string]: unknown }> = [];

  for (const section of sections) {
    const lines = section.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const allBullets = lines.every((l) => /^[-•*]\s+/.test(l) || /^\d+[.)]\s+/.test(l));
    if (allBullets && lines.length >= 1) {
      blocks.push({
        _type: 'bulletList',
        items: lines.map((l) => applyRuTypography(l.replace(/^[-•*]\s+/, '').replace(/^\d+[.)]\s+/, ''))),
      });
      continue;
    }

    if (lines.length === 1 && lines[0].startsWith('>')) {
      blocks.push({
        _type: 'quote',
        text: applyRuTypography(lines[0].replace(/^>\s?/, '')),
      });
      continue;
    }

    if (lines.length === 1 && /^#{2,3}\s+/.test(lines[0])) {
      const match = lines[0].match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        blocks.push({
          _type: 'heading',
          level: match[1].length === 2 ? 2 : 3,
          text: applyRuTypography(match[2]),
        });
        continue;
      }
    }

    blocks.push({
      _type: 'paragraph',
      text: applyRuTypography(lines.join(' ').replace(/\s+/g, ' ')),
    });
  }

  return blocks;
}

export function estimateReadingTimeMinutes(blocks: { _type: string; text?: string; items?: string[] }[]): number {
  let words = 0;
  for (const b of blocks) {
    if (b._type === 'paragraph' && b.text) words += b.text.split(/\s+/).length;
    if (b._type === 'heading' && b.text) words += b.text.split(/\s+/).length;
    if (b._type === 'bulletList' && b.items) words += b.items.join(' ').split(/\s+/).length;
    if (b._type === 'quote' && b.text) words += b.text.split(/\s+/).length;
  }
  return Math.max(1, Math.ceil(words / 200));
}

export function slugifyTitle(title: string): string {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return title
    .toLowerCase()
    .split('')
    .map((c) => map[c] ?? c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}
